import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

const CloudinaryImageUpload = ({
  onImageUpload,
  currentImages = [], // Changed to array, with backward compatibility
  currentImage, // Keep for backward compatibility
  disabled = false,
  maxImages = 5 // Maximum number of images allowed
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle backward compatibility - convert single image to array and flatten any comma-separated strings
  const images = React.useMemo(() => {
    let allImages = [];

    // Process currentImages array
    if (currentImages && Array.isArray(currentImages) && currentImages.length > 0) {
      currentImages.forEach(img => {
        if (img && typeof img === 'string') {
          if (img.includes(',')) {
            // Split comma-separated URLs and add each one
            const splitUrls = img.split(',').map(url => url.trim()).filter(url => url !== '');
            allImages.push(...splitUrls);
          } else {
            // Single URL
            allImages.push(img.trim());
          }
        }
      });
    }

    // Process currentImage (backward compatibility)
    if (currentImage && typeof currentImage === 'string') {
      if (currentImage.includes(',')) {
        const splitUrls = currentImage.split(',').map(url => url.trim()).filter(url => url !== '');
        allImages.push(...splitUrls);
      } else {
        allImages.push(currentImage.trim());
      }
    }

    // Remove duplicates and empty strings
    return [...new Set(allImages.filter(url => url && url.trim() !== ''))];
  }, [currentImages, currentImage]);

  // Server-side upload using your API route
  const uploadToCloudinary = useCallback(async (file) => {
    if (!file) return null;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, WebP)');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'trade_journal');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        let errorData = {};
        let errorMessage = `Upload failed with status ${response.status}`;

        try {
          errorData = await response.json();
          console.error('Upload error response:', errorData);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          console.error('Response text:', await response.text().catch(() => 'Unable to read response'));
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      if (!result.url) {
        throw new Error('Upload completed but no URL returned');
      }

      return result.url;

    } catch (fetchError) {
      console.error('Fetch error during upload:', fetchError);

      if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      }

      throw fetchError;
    }
  }, []);

  // Alternative: Client-side signed upload (more efficient for large files)
  const uploadToCloudinaryDirect = useCallback(async (file) => {
    if (!file) return null;

    try {
      // Get signed upload parameters
      const paramsResponse = await fetch('/api/upload?folder=trade_journal');
      const paramsData = await paramsResponse.json();

      if (!paramsData.success) {
        throw new Error(paramsData.error || 'Failed to get upload parameters');
      }

      const { params } = paramsData;

      // Prepare form data for direct Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', params.timestamp);
      formData.append('folder', params.folder);
      formData.append('transformation', params.transformation);
      formData.append('api_key', params.api_key);
      formData.append('signature', params.signature);

      // Upload directly to Cloudinary
      const uploadUrl = `https://api.cloudinary.com/v1_1/${params.cloud_name}/image/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Direct upload failed');
      }

      const result = await response.json();
      return result.secure_url;

    } catch (error) {
      console.error('Direct upload error:', error);
      throw error;
    }
  }, []);

  const handleFileSelect = useCallback(async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || disabled) return;

    // Check if adding these files would exceed max limit
    if (images.length + files.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`);
      event.target.value = '';
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const imageUrl = await uploadToCloudinary(file);
        setUploadProgress(((index + 1) / files.length) * 100);
        return imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];

      console.log('Images uploaded successfully:', uploadedUrls);

      // Always call with the complete images array
      onImageUpload(newImages);

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
      // Reset input value to allow re-selecting the same file
      event.target.value = '';
    }
  }, [uploadToCloudinary, onImageUpload, disabled, images, maxImages]);

  const handleRemoveImage = useCallback(async (imageUrl, index) => {
    if (disabled) return;

    console.log('🗑️ Removing image:', imageUrl);

    // Delete from Cloudinary
    try {
      const publicId = extractPublicIdFromUrl(imageUrl);
      if (publicId) {
        console.log('Deleting from Cloudinary, publicId:', publicId);
        const response = await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId })
        });

        if (response.ok) {
          console.log('✅ Image deleted from Cloudinary successfully');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.warn('⚠️ Failed to delete from Cloudinary:', errorData);
        }
      }
    } catch (error) {
      console.warn('❌ Error deleting image from Cloudinary:', error);
      // Continue with removal from UI even if Cloudinary deletion fails
    }

    const newImages = images.filter((_, i) => i !== index);
    console.log('Updated images array:', newImages.length, 'images remaining');

    // Always call with the complete images array (or empty array if no images)
    onImageUpload(newImages.length > 0 ? newImages : []);

    setUploadError(null);
    setUploadProgress(0);
  }, [images, onImageUpload, disabled]);

  // Helper function to extract public_id from Cloudinary URL
  const extractPublicIdFromUrl = useCallback((url) => {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        const pathParts = parts.slice(uploadIndex + 2);
        const filename = pathParts.join('/');
        // Remove file extension
        return filename.replace(/\.[^/.]+$/, '');
      }
    } catch (error) {
      console.error('Error extracting public_id:', error);
    }
    return null;
  }, []);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    if (disabled) return;

    const files = Array.from(event.dataTransfer.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    // Check if adding these files would exceed max limit
    if (images.length + imageFiles.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed. You can upload ${maxImages - images.length} more.`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const uploadPromises = imageFiles.map(async (file, index) => {
        const imageUrl = await uploadToCloudinary(file);
        setUploadProgress(((index + 1) / imageFiles.length) * 100);
        return imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];

      console.log('Images uploaded via drag & drop:', uploadedUrls);

      // Always call with the complete images array
      onImageUpload(newImages);

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  }, [uploadToCloudinary, onImageUpload, disabled, images, maxImages]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const canAddMore = images.length < maxImages;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Show all uploaded images in a scrollable container */}
        {images.length > 0 && (
          <div className="flex items-center gap-2 max-w-[300px] overflow-x-auto">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group flex-shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 border border-gray-600">
                  <img
                    src={imageUrl}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Image load error for URL:', e.target.src);
                      e.target.style.display = 'none';
                      const fallback = e.target.nextSibling;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', imageUrl);
                    }}
                  />
                  <div
                    className="w-full h-full hidden items-center justify-center bg-gray-800 text-gray-400"
                    style={{ display: 'none' }}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </div>
                </div>
                {/* Delete button - always visible for better UX */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveImage(imageUrl, index);
                    }}
                    className="absolute -top-1 -right-1 z-50 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-xl ring-2 ring-white/50 transition-all hover:scale-110 cursor-pointer"
                    title="Delete image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload area/button */}
        {(images.length === 0 || canAddMore) && (
          <div
            className={`w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors relative ${disabled
              ? 'border-gray-600 bg-gray-800 cursor-not-allowed'
              : 'border-gray-500 hover:border-gray-400 bg-gray-800/50 hover:bg-gray-800 cursor-pointer'
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            title={images.length === 0 ? "Upload images" : "Add more images"}
          >
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
                {uploadProgress > 0 && (
                  <div className="text-xs text-blue-400 mt-1">{Math.round(uploadProgress)}%</div>
                )}
              </div>
            ) : (
              images.length === 0 ? (
                <Upload className={`w-4 h-4 ${disabled ? 'text-gray-500' : 'text-gray-400'}`} />
              ) : (
                <Plus className={`w-3 h-3 ${disabled ? 'text-gray-500' : 'text-gray-400'}`} />
              )
            )}
          </div>
        )}
      </div>

      {/* Compact status indicator */}
      {images.length > 0 && (
        <div className="text-xs text-gray-400 mt-1">
          {images.length}/{maxImages} images
        </div>
      )}

      {uploadError && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded whitespace-nowrap z-10 max-w-xs">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageUpload;