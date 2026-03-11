import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * @typedef {Object} ImageViewerProps
 * @property {string|string[]} imageUrl - The image URL(s) or base64 data to display
 * @property {string} [title] - Optional title for the image
 * @property {boolean} isOpen - Whether the viewer is open
 * @property {() => void} onClose - Callback to close the viewer
 * @property {number} [initialIndex] - Initial image index for multiple images
 */

/**
 * @param {ImageViewerProps} props
 */
export const ImageViewer = ({ imageUrl, title, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Handle both single image and array of images, with proper URL parsing
  const images = React.useMemo(() => {
    let allImages = [];
    
    if (Array.isArray(imageUrl)) {
      imageUrl.forEach(img => {
        if (img && typeof img === 'string') {
          if (img.includes(',')) {
            // Split comma-separated URLs
            const splitUrls = img.split(',').map(url => url.trim()).filter(url => url !== '');
            allImages.push(...splitUrls);
          } else {
            // Single URL
            allImages.push(img.trim());
          }
        }
      });
    } else if (imageUrl && typeof imageUrl === 'string') {
      if (imageUrl.includes(',')) {
        const splitUrls = imageUrl.split(',').map(url => url.trim()).filter(url => url !== '');
        allImages.push(...splitUrls);
      } else {
        allImages.push(imageUrl.trim());
      }
    }
    
    // Remove duplicates and empty strings
    return [...new Set(allImages.filter(url => url && url.trim() !== ''))];
  }, [imageUrl]);
  const hasMultipleImages = images.length > 1;
  
  // Reset index when imageUrl changes
  useEffect(() => {
    setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
  }, [imageUrl, initialIndex, images.length]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !hasMultipleImages) return;
    
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, hasMultipleImages, images.length]);
  
  if (!isOpen || images.length === 0) return null;
  
  const currentImage = images[currentIndex];
  const currentTitle = hasMultipleImages ? `${title} (${currentIndex + 1}/${images.length})` : title;

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[9999] p-2 sm:p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        // Close when clicking outside the image container
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-red-600/80 text-white rounded-full p-1.5 sm:p-2 hover:bg-red-700/90 transition-all duration-200 z-10 shadow-lg border border-red-500/30"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Navigation buttons for multiple images */}
        {hasMultipleImages && (
          <>
            <button
              onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-all duration-200 z-10 shadow-lg border border-white/20 backdrop-blur-sm"
              title="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-all duration-200 z-10 shadow-lg border border-white/20 backdrop-blur-sm"
              title="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image container */}
        <div className="bg-gray-900/95 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl border border-blue-500/40 max-w-full max-h-full">
          {currentTitle && (
            <div className="px-4 py-3 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-blue-500/30">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-200 text-center">{currentTitle}</h3>
            </div>
          )}
          <div className="p-4 relative flex items-center justify-center">
            <img
              src={currentImage}
              alt={currentTitle || 'Uploaded image'}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-xl"
              onError={(e) => {
                console.error('ImageViewer: Failed to load image:', e.target.src);
                console.error('All images in viewer:', images);
                console.error('Current index:', currentIndex);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div 
              className="hidden max-w-[90vw] max-h-[85vh] flex items-center justify-center bg-gray-800/80 text-gray-300 rounded-lg"
              style={{ minHeight: '200px' }}
            >
              <div className="text-center p-6">
                <p className="text-base sm:text-lg font-medium text-gray-200">Failed to load image</p>
                <p className="text-sm text-gray-400 mt-2">The image may be corrupted or in an unsupported format</p>
              </div>
            </div>
            
            {/* Image indicators for multiple images */}
            {hasMultipleImages && (
              <div className="flex justify-center mt-4 space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-blue-400 shadow-lg shadow-blue-400/30' 
                        : 'bg-gray-600 hover:bg-gray-500 shadow-md'
                    }`}
                    title={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 