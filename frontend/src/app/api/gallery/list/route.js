import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const galleryPath = path.join(process.cwd(), 'public/uploads/gallery');
    
    // Check if directory exists
    try {
      await fs.access(galleryPath);
    } catch (err) {
      // Directory doesn't exist, return empty array
      return NextResponse.json([]);
    }
    
    // Read files from directory
    const files = await fs.readdir(galleryPath);
    
    // Filter for valid media files and create URLs
    const mediaFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm', '.ogg'].includes(ext);
      })
      .map(file => `/uploads/gallery/${file}`);
    
    return NextResponse.json(mediaFiles);
  } catch (error) {
    console.error('Error reading gallery:', error);
    return NextResponse.json(
      { error: 'Failed to read gallery' },
      { status: 500 }
    );
  }
}