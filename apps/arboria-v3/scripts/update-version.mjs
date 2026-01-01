import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(__dirname, '../package.json');
const publicVersionPath = path.resolve(__dirname, '../public/version.json');
const distVersionPath = path.resolve(__dirname, '../dist/version.json'); // Also update dist if it exists

try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    const versionData = {
        version: version,
        buildDate: new Date().toISOString(),
        nativeVersion: version // Assume they are sync'd
    };

    const content = JSON.stringify(versionData, null, 4);

    fs.writeFileSync(publicVersionPath, content);
    console.log(`Updated public/version.json to version ${version}`);

    // If dist exists (during build), update it there too just in case
    if (fs.existsSync(path.dirname(distVersionPath))) {
        fs.writeFileSync(distVersionPath, content);
        console.log(`Updated dist/version.json to version ${version}`);
    }

    // Sync with Android build.gradle
    const buildGradlePath = path.resolve(__dirname, '../android/app/build.gradle');
    if (fs.existsSync(buildGradlePath)) {
        let gradleContent = fs.readFileSync(buildGradlePath, 'utf-8');

        // Calculate deterministic versionCode (e.g., 1.2.3 -> 10203)
        // Adjust multiplier as needed for your project scale. 
        // 1.0.25 -> 10025. 1.1.0 -> 10100.
        const [major, minor, patch] = version.split('.').map(Number);
        const versionCode = major * 10000 + minor * 100 + patch;

        // Update versionName
        gradleContent = gradleContent.replace(/versionName "[^"]*"/, `versionName "${version}"`);

        // Update versionCode
        gradleContent = gradleContent.replace(/versionCode \d+/, `versionCode ${versionCode}`);

        fs.writeFileSync(buildGradlePath, gradleContent);
        console.log(`Updated android/app/build.gradle to versionName ${version} and versionCode ${versionCode}`);
    } else {
        console.warn('Warning: android/app/build.gradle not found, skipping native version sync.');
    }

} catch (error) {
    console.error('Error updating version.json:', error);
    process.exit(1);
}
