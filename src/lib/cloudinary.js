import { v2 as cloudinary } from "cloudinary";

/**
 * Get Cloudinary configuration from environment variables
 */
function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  return {
    cloudName: cloudName?.trim(),
    apiKey: apiKey?.trim(),
    apiSecret: apiSecret?.trim(),
    uploadPreset: uploadPreset?.trim(),
  };
}

/**
 * Configure Cloudinary with current environment variables
 */
function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  
  if (!cloudName || !apiKey) {
    throw new Error("CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY are required");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return { cloudName, apiKey, apiSecret };
}

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - Original file name
 * @param {string} folder - Cloudinary folder path (e.g., "resumes")
 * @param {object} options - Additional Cloudinary upload options
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadToCloudinary(
  fileBuffer,
  fileName,
  folder = "resumes",
  options = {}
) {
  try {
    // Validate Cloudinary configuration
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary configuration is missing. Please check your environment variables.");
    }

    // Convert buffer to base64 data URI for Cloudinary
    const base64Data = fileBuffer.toString("base64");
    const dataUri = `data:application/pdf;base64,${base64Data}`;

    // Upload to Cloudinary
    // For PDFs, use "raw" resource type and include .pdf extension in public_id
    // Generate a unique filename with .pdf extension to ensure proper serving
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const pdfFileName = `resume_${timestamp}_${randomString}.pdf`;
    
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "raw", // PDFs should be raw files, not images
      public_id: pdfFileName, // Include .pdf extension in public_id
      ...options,
    });

    // Use the secure_url directly from Cloudinary - it includes version numbers
    // which are necessary for proper file access, even for raw files
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
}

/**
 * Upload a file from a File object or FormData (for API routes)
 * @param {File|Buffer} file - The file to upload
 * @param {string} folder - Cloudinary folder path
 * @param {object} options - Additional Cloudinary upload options
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadFileToCloudinary(
  file,
  folder = "resumes",
  options = {}
) {
  try {
    // Get and validate configuration
    const config = getCloudinaryConfig();
    if (!config.cloudName || !config.apiKey) {
      throw new Error("Cloudinary cloud_name and api_key are required. Please check your environment variables.");
    }

    // Configure Cloudinary fresh each time (important for Next.js server actions)
    configureCloudinary();

    // Convert File to buffer if needed
    let fileBuffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(file)) {
      fileBuffer = file;
    } else {
      throw new Error("Invalid file type. Expected File or Buffer.");
    }

    // Detect MIME type
    let mimeType = "application/pdf";
    if (file instanceof File) {
      mimeType = file.type || "application/pdf";
    }

    // Convert buffer to base64 data URI
    const base64Data = fileBuffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    // Prepare upload options
    // For PDFs, use "raw" resource type to ensure they're accessible as files
    // For other files, use "auto" to detect type automatically
    const uploadOptions = {
      folder,
      resource_type: mimeType === "application/pdf" ? "raw" : "auto",
      ...options,
    };
    
    // For PDFs, ensure the file is uploaded with .pdf extension in the public_id
    // Cloudinary raw files need explicit extension in the public_id for proper serving
    if (mimeType === "application/pdf") {
      // Get filename from file if available, or generate one
      let baseFileName = "resume";
      if (file instanceof File && file.name) {
        // Extract base name without extension
        baseFileName = file.name.replace(/\.(pdf|doc|docx|txt)$/i, "");
      }
      
      // Generate unique filename with .pdf extension
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      // Include .pdf in public_id - Cloudinary will use this as the filename
      uploadOptions.public_id = `${baseFileName}_${timestamp}_${randomString}.pdf`;
    }

    // Debug: Log configuration (without exposing full secret)
    console.log("Cloudinary config check:", {
      cloudName: config.cloudName ? "✓ Set" : "✗ Missing",
      apiKey: config.apiKey ? "✓ Set" : "✗ Missing",
      apiSecret: config.apiSecret ? "✓ Set" : "✗ Missing",
      uploadPreset: config.uploadPreset ? `✓ Set (${config.uploadPreset})` : "✗ Missing",
    });

    // If we have an upload preset, prefer unsigned upload (more reliable)
    // This avoids signature issues
    if (config.uploadPreset) {
      uploadOptions.upload_preset = config.uploadPreset;
      // For unsigned uploads, reconfigure without secret
      cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        secure: true,
      });
      console.log("Using unsigned upload with preset:", config.uploadPreset);
    } else if (!config.apiSecret) {
      throw new Error("Cloudinary API secret is required for signed uploads. Either set CLOUDINARY_API_SECRET or CLOUDINARY_UPLOAD_PRESET for unsigned uploads.");
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    // Use the secure_url directly from Cloudinary - it includes version numbers
    // which are necessary for proper file access, even for raw files
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    
    // Provide more helpful error messages
    if (error.http_code === 401) {
      throw new Error(`Cloudinary authentication failed. Please verify your CLOUDINARY_API_SECRET is correct. If you're using unsigned uploads, ensure CLOUDINARY_UPLOAD_PRESET is set and the preset allows unsigned uploads. Original error: ${error.message}`);
    }
    
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the file to delete
 * @returns {Promise<void>}
 */
export async function deleteFromCloudinary(publicId) {
  try {
    const config = getCloudinaryConfig();
    if (!config.cloudName || !config.apiKey || !config.apiSecret) {
      throw new Error("Cloudinary configuration is missing.");
    }

    configureCloudinary();

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Failed to delete file: ${result.result}`);
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
}

/**
 * Get Cloudinary URL from public ID
 * @param {string} publicId - Cloudinary public ID
 * @param {object} options - Transformation options
 * @returns {string}
 */
export function getCloudinaryUrl(publicId, options = {}) {
  // For raw files (PDFs), ensure resource_type is set
  const url = cloudinary.url(publicId, {
    secure: true,
    resource_type: options.resource_type || "raw", // Default to raw for PDFs
    ...options,
  });
  
  // If the URL doesn't have the file extension and we're dealing with a PDF, append it
  if (!options.skipExtension && publicId.endsWith('.pdf') && !url.includes('.pdf')) {
    return `${url}.pdf`;
  }
  
  return url;
}

// Note: ensurePdfUrlFormat has been moved to cloudinary-url-utils.js
// to avoid importing Cloudinary SDK in client components
// Import it from "@/lib/cloudinary-url-utils" instead

/**
 * Generate a unique folder name for a user's resumes
 * @param {string} userId - User ID
 * @returns {string}
 */
export function getUserResumeFolder(userId) {
  return `resumes/${userId}`;
}

