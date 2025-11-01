/**
 * Script to verify Cloudinary credentials
 * Run with: node scripts/verify-cloudinary.js
 */

require("dotenv").config({ path: ".env.local" });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

console.log("\n=== Cloudinary Configuration Check ===\n");
console.log("Cloud Name:", cloudName ? `✓ ${cloudName}` : "✗ MISSING");
console.log("API Key:", apiKey ? `✓ ${apiKey.substring(0, 10)}...` : "✗ MISSING");
console.log("API Secret:", apiSecret ? `✓ ${apiSecret.substring(0, 10)}... (length: ${apiSecret.length})` : "✗ MISSING");
console.log("Upload Preset:", uploadPreset ? `✓ ${uploadPreset}` : "✗ MISSING (optional but recommended)");

if (!cloudName || !apiKey) {
  console.log("\n❌ ERROR: Cloud Name and API Key are required!");
  process.exit(1);
}

if (!apiSecret && !uploadPreset) {
  console.log("\n⚠️  WARNING: Either API Secret or Upload Preset is required!");
  console.log("   Recommendation: Create an unsigned upload preset for easier setup.");
  console.log("   1. Go to https://console.cloudinary.com/settings/upload");
  console.log("   2. Create a new upload preset");
  console.log("   3. Set signing mode to 'Unsigned'");
  console.log("   4. Add preset name to .env.local: CLOUDINARY_UPLOAD_PRESET=your_preset_name");
}

console.log("\n=== Testing Upload ===\n");

// Try to upload a small test file
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const testData = Buffer.from("test").toString("base64");
const testDataUri = `data:text/plain;base64,${testData}`;

const testOptions = uploadPreset ? { upload_preset: uploadPreset } : {};

cloudinary.uploader.upload(testDataUri, {
  ...testOptions,
  public_id: `test_${Date.now()}`,
  overwrite: true,
})
  .then((result) => {
    console.log("✅ SUCCESS! Upload test passed.");
    console.log("   URL:", result.secure_url);
    console.log("\n✅ Your Cloudinary configuration is working correctly!\n");
    
    // Clean up test file
    cloudinary.uploader.destroy(result.public_id);
    process.exit(0);
  })
  .catch((error) => {
    console.log("❌ ERROR: Upload test failed!");
    console.log("   Error:", error.message);
    
    if (error.http_code === 401) {
      console.log("\n💡 Fix suggestions:");
      console.log("   1. Double-check your API Secret in .env.local");
      console.log("   2. Make sure there are no extra spaces or quotes");
      console.log("   3. Try creating an unsigned upload preset (see instructions above)");
      console.log("   4. Verify your credentials at https://console.cloudinary.com/settings/security");
    }
    
    process.exit(1);
  });

