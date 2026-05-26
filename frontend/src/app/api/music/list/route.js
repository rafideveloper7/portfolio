import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const musicPath = path.join(process.cwd(), 'public/uploads/music');
    
    // Check if directory exists
    try {
      await fs.access(musicPath);
    } catch (err) {
      // Directory doesn't exist, return empty array
      return NextResponse.json([]);
    }
    
    // Read files from directory
    const files = await fs.readdir(musicPath);
    
    // Filter for valid audio files and create URLs
    const musicFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp3', '.wav', '.ogg'].includes(ext);
      })
      .map(file => `/uploads/music/${file}`);
    
    return NextResponse.json(musicFiles);
  } catch (error) {
    console.error('Error reading music:', error);
    return NextResponse.json(
      { error: 'Failed to read music library' },
      { status: 500 }
    );
  }
}