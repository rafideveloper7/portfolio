import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${API}/api/cv/list`).catch(() => null);
    if (res?.ok) {
      alert("cv loaded successfully!!!")
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json([]);
  } catch (error) {
    alert("cv loaded Un-successfully!!!")
    console.error('Error fetching CVs:', error);
    return NextResponse.json([]);
  }
}