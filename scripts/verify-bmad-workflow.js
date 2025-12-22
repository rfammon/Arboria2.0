#!/usr/bin/env node
/**
 * BMAD Workflow Verification Script
 * This script verifies that all required components for the BMAD workflow are properly configured
 */

const fs = require('fs');
const path = require('path');

// Define the project root and required files/directories
const projectRoot = path.resolve('.');
const requiredFiles = [
    'BMAD-Technical-Documentation.md',
    'BMAD-workflow-init.md',
    '.bmad/workflow-config.yaml',
    'docs/bmad-workflow-initialization.md',
    'apps/arboria-v3/package.json',
    '.bmad/core/config.yaml'
];

const requiredDirectories = [
    '.bmad',
    'docs',
    'apps/arboria-v3',
    '.bmad/core',
    '.bmad/bmm',
    '.bmad/bmb'
];

const verificationResults = {
    files: {},
    directories: {},
    overallStatus: 'pending'
};

console.log('🔍 BMAD Workflow Configuration Verification\n');

// Check for required files
console.log('📄 Checking required files...');
requiredFiles.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    const exists = fs.existsSync(fullPath);
    verificationResults.files[file] = exists;

    if (exists) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file}`);
    }
});

// Check for required directories
console.log('\n📁 Checking required directories...');
requiredDirectories.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    const exists = fs.existsSync(fullPath);
    verificationResults.directories[dir] = exists;

    if (exists) {
        console.log(`  ✅ ${dir}`);
    } else {
        console.log(`  ❌ ${dir}`);
    }
});

// Check package.json for required dependencies
console.log('\n📦 Checking package.json dependencies...');
const packageJsonPath = path.join(projectRoot, 'apps/arboria-v3/package.json');
let hasRequiredDeps = false;

if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const requiredDeps = ['@tauri-apps/cli', '@capacitor/cli'];
    let foundDeps = 0;

    requiredDeps.forEach(dep => {
        if (dependencies[dep]) {
            console.log(`  ✅ Found dependency: ${dep}`);
            foundDeps++;
        } else {
            console.log(`  ⚠️  Missing dependency: ${dep}`);
        }
    });

    hasRequiredDeps = foundDeps > 0;
} else {
    console.log('  ❌ apps/arboria-v3/package.json not found');
}

// Check workflow configuration
console.log('\n⚙️  Checking workflow configuration...');
const workflowConfigPath = path.join(projectRoot, '.bmad/workflow-config.yaml');
if (fs.existsSync(workflowConfigPath)) {
    const configContent = fs.readFileSync(workflowConfigPath, 'utf8');

    // Check for key configuration sections
    const hasSecurity = configContent.includes('security:');
    const hasPlatforms = configContent.includes('platforms:');
    const hasMonetization = configContent.includes('monetization:');

    if (hasSecurity) console.log('  ✅ Security configuration found');
    else console.log('  ❌ Security configuration missing');

    if (hasPlatforms) console.log('  ✅ Platform configuration found');
    else console.log('  ❌ Platform configuration missing');

    if (hasMonetization) console.log('  ✅ Monetization configuration found');
    else console.log('  ❌ Monetization configuration missing');

    verificationResults.configValid = hasSecurity && hasPlatforms && hasMonetization;
} else {
    console.log('  ❌ .bmad/workflow-config.yaml not found');
    verificationResults.configValid = false;
}

// Calculate overall status
const allFilesExist = Object.values(verificationResults.files).every(exists => exists);
const allDirsExist = Object.values(verificationResults.directories).every(exists => exists);
const overallStatus = allFilesExist && allDirsExist && verificationResults.configValid && hasRequiredDeps
    ? 'success'
    : 'failure';

verificationResults.overallStatus = overallStatus;

console.log(`\n📊 Verification Summary:`);
console.log(`  Files: ${Object.values(verificationResults.files).filter(exists => exists).length}/${requiredFiles.length} found`);
console.log(`  Directories: ${Object.values(verificationResults.directories).filter(exists => exists).length}/${requiredDirectories.length} found`);
console.log(`  Dependencies: ${hasRequiredDeps ? 'Partially/fully found' : 'Missing'}`);
console.log(`  Configuration: ${verificationResults.configValid ? 'Valid' : 'Invalid'}`);

console.log(`\n🎯 Overall Status: ${overallStatus === 'success' ? '✅ WORKFLOW READY' : '❌ WORKFLOW NEEDS ATTENTION'}`);

// Output detailed results in JSON format for potential automation
console.log('\n📋 Detailed Results:');
console.log(JSON.stringify(verificationResults, null, 2));

// Exit with appropriate code
process.exit(overallStatus === 'success' ? 0 : 1);