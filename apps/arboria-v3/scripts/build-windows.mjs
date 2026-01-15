import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

const APP_DIR = 'c:/BMAD-workflow/apps/arboria-v3';
const OUTPUT_DIR = join(APP_DIR, 'dist-windows');

function run(command) {
    console.log(`Executing: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: APP_DIR });
}

try {
    console.log('--- Starting Windows Build Process ---');

    // 1. Ensure dependencies are installed
    // run('npm install'); // Assuming they are already installed or user manages them

    // 2. Run the Tauri build
    console.log('--- Running Tauri Build ---');
    run('npx tauri build');

    // 3. Create output directory if it doesn't exist
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 4. Locate the generated installer
    // Tauri v2 output path for NSIS usually: src-tauri/target/release/bundle/nsis/Arboria_<version>_x64-setup.exe
    const nsisDir = join(APP_DIR, 'src-tauri/target/release/bundle/nsis');

    if (existsSync(nsisDir)) {
        console.log('--- Copying Installer to dist-windows ---');
        const files = execSync(`dir /b ${nsisDir}`).toString().split('\n').map(f => f.trim()).filter(f => f.endsWith('.exe'));

        for (const file of files) {
            const src = join(nsisDir, file);
            const dest = join(OUTPUT_DIR, file);
            copyFileSync(src, dest);
            console.log(`Copied: ${file}`);
        }
    } else {
        console.error('Could not find NSIS output directory. Build might have failed or path changed.');
    }

    console.log('--- Windows Build Complete ---');
    console.log(`Installer available in: ${OUTPUT_DIR}`);

} catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
}
