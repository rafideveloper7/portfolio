import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public/uploads/music'),
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      filter: ({ mimetype }) => {
        return mimetype && (mimetype === 'audio/mpeg' || mimetype === 'audio/wav' || mimetype === 'audio/ogg');
      },
    });

    const [fields, files] = await form.parse(await request.formData());
    
    if (!files.file || files.file.length === 0) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const extension = path.extname(file.originalFilename);
    const newFilename = `music_${timestamp}_${random}${extension}`;
    const newPath = path.join(process.cwd(), 'public/uploads/music', newFilename);
    
    // Move file to final destination
    await fs.rename(file.filepath, newPath);
    
    // Return relative URL for use in frontend
    const fileUrl = `/uploads/music/${newFilename}`;
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: newFilename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename required' },
        { status: 400 }
      );
    }
    
    const filePath = path.join(process.cwd(), 'public/uploads/music', filename);
    
    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (err) {
      if (err.code === 'ENOENT') {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
      throw err;
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}