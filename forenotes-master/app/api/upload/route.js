import { NextResponse } from 'next/server';
import { uploadImage, deleteImage, generateSignedUploadParams } from '@/lib/cloudinary';

// Handle file uploads (supports both single and multiple files)
export async function POST(request) {
  try {
    console.log('Upload API called');
    
    // Check environment variables first
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary environment variables');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cloudinary configuration missing',
          details: 'Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables'
        },
        { status: 500 }
      );
    }
    
    // Get form data
    const formData = await request.formData();
    const files = formData.getAll('file'); // Support multiple files
    const folder = formData.get('folder') || 'trade_journal';
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`Processing ${files.length} file(s)`);

    // Validate all files first
    for (const file of files) {
      if (!file || !file.type) {
        return NextResponse.json(
          { success: false, error: 'Invalid file provided' },
          { status: 400 }
        );
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}. Supported types: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }
    }

    // Process uploads
    const uploadResults = [];
    const uploadErrors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        console.log(`Processing file ${i + 1}/${files.length}:`, {
          name: file.name,
          type: file.type,
          size: file.size
        });

        // Convert file to base64 for Cloudinary upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

        console.log(`File ${i + 1} converted to base64, uploading to Cloudinary...`);

        // Upload to Cloudinary
        const result = await uploadImage(base64String, folder);
        
        if (result.success) {
          console.log(`Upload ${i + 1} successful:`, result.url);
          uploadResults.push({
            success: true,
            url: result.url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            originalName: file.name
          });
        } else {
          console.error(`Upload ${i + 1} failed:`, result.error);
          uploadErrors.push({
            file: file.name,
            error: result.error || 'Upload failed'
          });
        }
      } catch (fileError) {
        console.error(`Error processing file ${i + 1}:`, fileError);
        uploadErrors.push({
          file: file.name,
          error: fileError.message || 'File processing failed'
        });
      }
    }

    // Return results
    if (uploadResults.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All uploads failed',
          errors: uploadErrors
        },
        { status: 500 }
      );
    }

    // For single file upload, return single result for backward compatibility
    if (files.length === 1 && uploadResults.length === 1) {
      return NextResponse.json(uploadResults[0]);
    }

    // For multiple files, return array of results
    return NextResponse.json({
      success: true,
      results: uploadResults,
      errors: uploadErrors.length > 0 ? uploadErrors : undefined,
      totalUploaded: uploadResults.length,
      totalFailed: uploadErrors.length
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Handle file deletions
export async function DELETE(request) {
  try {
    console.log('Delete API called');
    
    const body = await request.json();
    const { publicId } = body;
    
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'No public ID provided' },
        { status: 400 }
      );
    }

    const result = await deleteImage(publicId);
    
    if (result.success) {
      console.log('Delete successful:', publicId);
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      console.error('Delete failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { success: false, error: 'Delete failed', details: error.message },
      { status: 500 }
    );
  }
}

// Generate signed upload parameters for client-side uploads
export async function GET(request) {
  try {
    console.log('Signed params API called');
    
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'trade_journal';
    
    const result = await generateSignedUploadParams(folder);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        params: result.params
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signed params API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate signed params', details: error.message },
      { status: 500 }
    );
  }
}