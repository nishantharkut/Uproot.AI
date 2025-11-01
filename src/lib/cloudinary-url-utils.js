/**
 * Client-side safe utility functions for working with Cloudinary URLs
 * These functions don't require the Cloudinary SDK and can be used in client components
 */

/**
 * Generate a Cloudinary URL from a public ID
 * Public ID format: resumes/{userId}/{filename}
 * @param {string} publicId - The Cloudinary public ID (e.g., "resumes/user-id/filename")
 * @param {string} cloudName - Cloudinary cloud name
 * @param {boolean} secure - Use HTTPS (default: true)
 * @returns {string} - The Cloudinary URL
 */
export function getCloudinaryUrlFromPublicId(publicId, cloudName, secure = true) {
  if (!publicId || !cloudName) return null;
  
  const protocol = secure ? 'https' : 'http';
  // For raw files (PDFs), use /raw/upload/ in the path
  // Format: https://res.cloudinary.com/{cloud_name}/raw/upload/{public_id}.pdf
  const baseUrl = `${protocol}://res.cloudinary.com/${cloudName}/raw/upload`;
  
  // Ensure .pdf extension
  const publicIdWithExt = publicId.endsWith('.pdf') ? publicId : `${publicId}.pdf`;
  
  return `${baseUrl}/${publicIdWithExt}`;
}

/**
 * Extract public ID from a Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} - The public ID or null if not a Cloudinary URL
 */
export function extractPublicIdFromUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  
  // Match pattern: /upload/(v\d+/)?(path/to/file)
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.(pdf|jpg|jpeg|png|gif|webp|mp4|mov))?(?:\?|$)/);
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}

/**
 * Ensure a Cloudinary URL is properly formatted for PDF access
 * This converts image URLs to raw URLs for PDFs
 * Note: We keep version numbers in URLs as Cloudinary requires them for proper access
 * Handles public IDs like: resumes/f1b20f43-655a-4883-9e68-6a4d784115ef/urbfdkurcobyfgrjw9is
 * @param {string} url - The Cloudinary URL or public ID
 * @returns {string} - The properly formatted URL
 */
export function ensurePdfUrlFormat(url) {
  if (!url) return url;
  
  // If it's already a full Cloudinary URL
  if (url.includes('res.cloudinary.com')) {
    // Only ensure it's using /raw/upload/ if it's currently /image/upload/
    // Keep version numbers as they're required by Cloudinary
    if (url.includes('/image/upload/')) {
      url = url.replace('/image/upload/', '/raw/upload/');
    } else if (url.includes('/video/upload/')) {
      url = url.replace('/video/upload/', '/raw/upload/');
    }
    
    // Ensure .pdf extension if the URL doesn't already have a file extension
    // This is helpful for raw files that might not have extensions in the URL
    if (!url.match(/\.(pdf|jpg|jpeg|png|gif|webp|mp4|mov)(\?|$)/)) {
      const [baseUrl, queryString] = url.split('?');
      // Don't add extension if URL ends with a slash or already has query params that suggest it's a file
      if (!baseUrl.endsWith('/')) {
        url = queryString ? `${baseUrl}.pdf?${queryString}` : `${baseUrl}.pdf`;
      }
    }
    
    return url;
  }
  
  // If it looks like a public ID (e.g., "resumes/user-id/filename")
  // We can't generate a full URL without the cloud name, so just return as-is
  // The caller should use getCloudinaryUrlFromPublicId if they have the cloud name
  return url;
}

