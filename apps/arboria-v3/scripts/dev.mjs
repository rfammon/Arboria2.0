import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('--- ArborIA Dev Launcher ---');

// 1. Start PDF Report Server
console.log('Starting PDF Report Server...');
const server = spawn('node', ['server/index.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
});

server.on('error', (err) => {
    console.error('Failed to start PDF server:', err);
});

// 2. Start Vite Frontend
console.log('Starting Vite Frontend...');
const vite = spawn('npx', ['vite'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
});

vite.on('error', (err) => {
    console.error('Failed to start Vite:', err);
});

// Handle termination
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.kill();
    vite.kill();
    process.exit();
});
