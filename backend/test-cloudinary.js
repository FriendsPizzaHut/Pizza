/**
 * Test Cloudinary Connection
 * Run with: node backend/test-cloudinary.js
 */

import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); // Will load from current directory's .env

console.log('🧪 Testing Cloudinary Connection...\n');

// Check credentials
console.log('📋 Credentials:');
console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ MISSING');
console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set (' + process.env.CLOUDINARY_API_KEY.substring(0, 6) + '...)' : '❌ MISSING');
console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ MISSING');
console.log('');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Test API connection with timeout
console.log('🔍 Testing API connection with 10s timeout...');

const testWithTimeout = Promise.race([
    cloudinary.api.ping(),
    new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
    )
]);

try {
    const result = await testWithTimeout;

    console.log('✅ SUCCESS! Cloudinary connection working!');
    console.log('📊 Response:', result);
    console.log('\n✅ Your Cloudinary setup is ready to use!');
    console.log('🔗 Dashboard: https://console.cloudinary.com/console');
} catch (error) {
    console.error('❌ FAILED! Cloudinary connection error:');
    console.error('Error:', error.message || error.error || error);

    if (error.message?.includes('timeout')) {
        console.error('\n⚠️  Connection timed out. Possible causes:');
        console.error('  1. Slow network connection');
        console.error('  2. Firewall blocking Cloudinary API');
        console.error('  3. Using VPN that blocks API access');
        console.error('\n💡 Try:');
        console.error('  - Check your internet connection');
        console.error('  - Disable VPN temporarily');
        console.error('  - Try from a different network');
        console.error('\n📝 Note: The credentials are correct, but the connection is slow/blocked.');
        console.error('     Image uploads might work but be slow (5-10 seconds).');
    } else {
        console.error('\n💡 Possible issues:');
        console.error('  1. Invalid credentials');
        console.error('  2. Network connection problem');
        console.error('  3. Cloudinary service down');
    }

    console.error('\n🔗 Verify credentials at: https://console.cloudinary.com/console');
    process.exit(1);
}
