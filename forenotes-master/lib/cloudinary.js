import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

// Configure Cloudinary
const connectCloudinary = () => {
  try {
    // Check if environment variables exist
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('CLOUDINARY_CLOUD_NAME environment variable is not set');
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error('CLOUDINARY_API_KEY environment variable is not set');
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error('CLOUDINARY_API_SECRET environment variable is not set');
    }

    // Only configure once
    if (!isConfigured) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      isConfigured = true;
      console.log('Cloudinary configured with cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    }
    
    return cloudinary;
  } catch (error) {
    console.error('Cloudinary configuration error:', error);
    throw error;
  }
};

// Upload image to Cloudinary
export const uploadImage = async (file, folder = 'trade_journal') => {
  try {
    const cloudinaryInstance = connectCloudinary();
    
    const uploadResponse = await cloudinaryInstance.uploader.upload(file, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ],
      use_filename: true,
      unique_filename: true,
    });

    return {
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message || 'Unknown upload error'
    };
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const cloudinaryInstance = connectCloudinary();
    
    const result = await cloudinaryInstance.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Image deletion error:', error);
    return {
      success: false,
      error: error.message || 'Unknown deletion error'
    };
  }
};

// Generate signed upload parameters for client-side uploads
export const generateSignedUploadParams = async (folder = 'trade_journal') => {
  try {
    const cloudinaryInstance = connectCloudinary();
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp: timestamp,
      folder: folder,
      transformation: 'c_limit,w_1200,h_1200,q_auto,f_auto',
    };

    const signature = cloudinaryInstance.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
    
    return {
      success: true,
      params: {
        ...params,
        signature,
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      }
    };
  } catch (error) {
    console.error('Signed params generation error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error generating signed params'
    };
  }
};

export default connectCloudinary;