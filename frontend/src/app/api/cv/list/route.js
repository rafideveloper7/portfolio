import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${API}/api/cv/list`).catch(() => null);
    if (res?.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return NextResponse.json([]);
  }
}