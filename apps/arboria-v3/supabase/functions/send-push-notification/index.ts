import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const FCM_URL = "https://fcm.googleapis.com/v1/projects/";
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

async function getAccessToken({ client_email, private_key }: { client_email: string; private_key: string }) {
    const jwt = await new jose.SignJWT({
        iss: client_email,
        scope: SCOPES.join(" "),
        aud: "https://oauth2.googleapis.com/token",
    })
        .setProtectedHeader({ alg: "RS256" })
        .setExpirationTime("1h")
        .setIssuedAt()
        .sign(await jose.importPKCS8(private_key, "RS256"));

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt,
        }),
    });

    const data = await res.json();
    return data.access_token;
}

serve(async (req) => {
    try {
        const { user_id, title, message, link, metadata } = await req.json();

        if (!user_id) return new Response("Missing user_id", { status: 400 });

        // 1. Initialize Supabase
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 2. Fetch user's device tokens
        const { data: tokens, error: tokensError } = await supabase
            .from("user_device_tokens")
            .select("token")
            .eq("user_id", user_id);

        if (tokensError || !tokens || tokens.length === 0) {
            console.log(`Skipping push for user ${user_id}: No tokens found`);
            return new Response(JSON.stringify({ skipped: true, reason: "No tokens found" }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // 3. Get FCM Access Token
        const serviceAccountStr = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

        if (!serviceAccountStr) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT config missing in env");
        }

        // Fix potential escaping issues with private key if passed as env var
        let serviceAccount = JSON.parse(serviceAccountStr);
        if (typeof serviceAccount === "string") {
            serviceAccount = JSON.parse(serviceAccount); // Handle double stringify if happened
        }

        const projectId = serviceAccount.project_id;
        if (!projectId) {
            throw new Error("project_id missing in service account JSON");
        }

        const accessToken = await getAccessToken({
            client_email: serviceAccount.client_email,
            private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
        });

        const results = await Promise.all(
            tokens.map(async (t) => {
                try {
                    // Using logic to handle string metadata
                    const dataPayload = { link: link || '', ...metadata };
                    // Convert all data values to strings as FCM requires string values in data payload
                    const stringDataPayload: Record<string, string> = {};
                    for (const key in dataPayload) {
                        if (dataPayload[key] !== null && dataPayload[key] !== undefined) {
                            stringDataPayload[key] = String(dataPayload[key]);
                        }
                    }

                    const res = await fetch(`${FCM_URL}${projectId}/messages:send`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({
                            message: {
                                token: t.token,
                                notification: { title, body: message },
                                data: stringDataPayload,
                                android: { priority: "high" },
                                apns: { payload: { aps: { sound: "default" } } },
                            },
                        }),
                    });

                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error(`FCM Error for token ${t.token}:`, errorText);
                        return { error: errorText };
                    }

                    return await res.json();
                } catch (e) {
                    console.error(`Fetch Error for token ${t.token}:`, e);
                    return { error: e.message };
                }
            })
        );

        return new Response(JSON.stringify({ results }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Edge Function Error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
