import React, { useState, useRef } from 'react';
import { Upload, X, Image, FileImage, Eye } from 'lucide-react';
import axios from 'axios';
import { ImageViewer } from './ImageViewer';

/**
 * @typedef {Object} ImageUploadProps
 * @property {string} value - Current image URL or base64 data
 * @property {(value: string, fileName?: string) => void} onChange - Callback when image changes
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [disabled] - Whether the upload is disabled
 */

/**
 * @param {ImageUploadProps} props
 */
export const ImageUpload = ({ value, onChange, className = '', disabled = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showViewer, setShowViewer] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error
    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onChange(response.data.imageUrl, response.data.fileName);
        setSuccessMessage('Image has been uploaded! Click the image icon in the Actions column to view it.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setError(response.data.error || 'Upload failed');
        setSuccessMessage('');
        setShowToast(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload image');
      setSuccessMessage('');
      setShowToast(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange('', '');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const hasImage = value && value.trim() !== '';

  return (
    <div className={`relative ${className}`}>
      {/* Toast pop-up */}
      {showToast && successMessage && !error && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }} className="bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
          {successMessage}
        </div>
      )}
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload area */}
      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-2 cursor-pointer transition-all duration-200 min-h-[2.5rem] flex items-center justify-center
          ${disabled || isUploading 
            ? 'border-gray-600/30 bg-gray-700/30 cursor-not-allowed' 
            : hasImage 
              ? 'border-green-400/50 bg-green-900/20 hover:border-green-400' 
              : 'border-blue-700/30 bg-slate-800/60 hover:border-blue-400 hover:bg-slate-800/80'
          }
        `}
      >
                {isUploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-xs text-gray-300">Uploading...</span>
          </div>
        ) : hasImage ? (
          <div className="flex items-center justify-center space-x-2 w-full">
            <div className="relative flex-shrink-0">
              <img
                src={value}
                alt="Uploaded"
                className="max-h-8 max-w-16 rounded object-contain cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewer(true);
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  setError('Failed to load image');
                }}
              />
              <div className="absolute -top-1 -right-1 flex space-x-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowViewer(true);
                  }}
                  className="bg-blue-500 text-white rounded-full p-0.5 hover:bg-blue-600 transition-colors"
                  disabled={disabled}
                  title="View image"
                >
                  <Eye className="w-2 h-2" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                  disabled={disabled}
                  title="Remove image"
                >
                  <X className="w-2 h-2" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-green-400">
              <FileImage className="w-3 h-3" />
              <span>Uploaded</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1">
            <Upload className="w-4 h-4 text-gray-400" />
            <div className="text-center">
              <p className="text-xs font-medium text-gray-300">
                Upload Image
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-1 text-xs text-red-400 flex items-center space-x-1">
          <X className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {successMessage && !error && (
        <div className="mt-1 text-xs text-green-400 flex items-center space-x-1">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        imageUrl={value}
        title="Uploaded Image"
        isOpen={showViewer}
        onClose={() => setShowViewer(false)}
      />
    </div>
  );
}; 