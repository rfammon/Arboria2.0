import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { url } = await req.json();

        if (!url) {
            return new Response(
                JSON.stringify({ error: "URL is required" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        console.log("[Proxy] Fetching:", url);

        // Fetch the APK from GitHub
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Arboria-App/1.0",
            },
        });

        if (!response.ok) {
            return new Response(
                JSON.stringify({ error: `Failed to fetch: ${response.status}` }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
            );
        }

        // Get the content
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        console.log("[Proxy] Downloaded", arrayBuffer.byteLength, "bytes");

        return new Response(
            JSON.stringify({
                data: base64,
                size: arrayBuffer.byteLength,
                contentType: response.headers.get("content-type") || "application/octet-stream",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[Proxy] Error:", message);
        return new Response(
            JSON.stringify({ error: message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
