import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configure your GitHub repository here
const GITHUB_OWNER = "rfammon";
const GITHUB_REPO = "Arboria2.0";

interface GitHubRelease {
    tag_name: string;
    name: string;
    body: string;
    assets: Array<{
        name: string;
        browser_download_url: string;
    }>;
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { currentVersion } = await req.json().catch(() => ({}));

        // Fetch latest release from GitHub API
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
            {
                headers: {
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "Arboria-App",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const release: GitHubRelease = await response.json();

        // Find APK asset in release
        const apkAsset = release.assets.find(
            (asset) => asset.name.endsWith(".apk")
        );

        if (!apkAsset) {
            return new Response(
                JSON.stringify({
                    latestVersion: release.tag_name.replace(/^v/, ""),
                    apkUrl: null,
                    releaseNotes: release.body || "Nova versão disponível.",
                    hasUpdate: false,
                    error: "APK não encontrado na release.",
                }),
                {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                }
            );
        }

        const latestVersion = release.tag_name.replace(/^v/, "");
        const hasUpdate = currentVersion && currentVersion !== latestVersion
            ? compareVersions(latestVersion, currentVersion) > 0
            : false;

        return new Response(
            JSON.stringify({
                latestVersion,
                apkUrl: apkAsset.browser_download_url,
                releaseNotes: release.body || "Nova versão disponível.",
                releaseName: release.name,
                hasUpdate,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});

function compareVersions(v1: string, v2: string): number {
    const s1 = v1.replace(/^v/, "").split(".").map(Number);
    const s2 = v2.replace(/^v/, "").split(".").map(Number);
    for (let i = 0; i < Math.max(s1.length, s2.length); i++) {
        const n1 = s1[i] || 0;
        const n2 = s2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}
