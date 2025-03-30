/**
 * Script to install LiveKit agent dependencies
 * 
 * This script installs the required dependencies for the LiveKit agent to function
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking and installing LiveKit agent dependencies...');

// Define required packages
const requiredPackages = [
  '@livekit/agents',
  '@livekit/agents-openai',
  '@livekit/protocol'
];

// Check if packages are installed
try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const missingPackages = requiredPackages.filter(pkg => !dependencies[pkg]);
  
  if (missingPackages.length === 0) {
    console.log('✅ All required LiveKit agent packages are already installed!');
    process.exit(0);
  }
  
  console.log(`Missing packages: ${missingPackages.join(', ')}`);
  console.log('Installing missing packages...');
  
  // Install missing packages
  const installCommand = `pnpm add ${missingPackages.join(' ')}`;
  console.log(`Running: ${installCommand}`);
  
  execSync(installCommand, { stdio: 'inherit' });
  
  console.log('✅ Successfully installed all required LiveKit agent packages!');
  console.log('You can now start the voice assistant agent.');
  
} catch (error) {
  console.error('❌ Error installing dependencies:', error);
  process.exit(1);
}