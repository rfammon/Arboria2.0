import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GITHUB_REPO = "rfammon/Arboria2.0";

serve(async (req) => {
    try {
        const { currentVersion, platform = 'android' } = await req.json();

        if (!currentVersion) {
            return new Response(JSON.stringify({ error: "Missing currentVersion" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log(`Checking update for version: ${currentVersion} on platform: ${platform}`);

        // Fetch releases from GitHub
        const githubUrl = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
        const response = await fetch(githubUrl, {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "ArborIA-Update-Checker"
            }
        });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const release = await response.json();
        const latestTag = release.tag_name; // e.g., "v1.1.13" or "1.1.13"

        // Normalize versions for comparison (remove 'v' prefix)
        const normalizedLatest = latestTag.startsWith('v') ? latestTag.substring(1) : latestTag;
        const normalizedCurrent = currentVersion.startsWith('v') ? currentVersion.substring(1) : currentVersion;

        console.log(`Latest: ${normalizedLatest}, Current: ${normalizedCurrent}`);

        // Simple semantic comparison (can be improved but sufficient for incrementing tags)
        const hasUpdate = normalizedLatest !== normalizedCurrent;

        // Find the appropriate asset based on platform
        const extension = (platform === 'tauri' || platform === 'windows') ? ".exe" : ".apk";
        const asset = release.assets.find((asset: any) => asset.name.toLowerCase().endsWith(extension));
        const updateUrl = asset ? asset.browser_download_url : null;

        return new Response(
            JSON.stringify({
                hasUpdate,
                latestVersion: normalizedLatest,
                releaseNotes: release.body,
                updateUrl: updateUrl,
                // Add legacy field for backward compatibility with older app versions if any exist
                apkUrl: platform === 'android' ? updateUrl : null,
            }),
            {
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (err) {
        console.error("Error in get-latest-version:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
