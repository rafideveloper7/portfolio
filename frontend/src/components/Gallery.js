'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadGallery(); }, []);

  const loadGallery = async () => {
    try {
      const res = await axios.get(`${API}/api/gallery/list`);
      setImages(res.data || []);
    } catch {
      // silent — empty gallery
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Loading gallery...</div>;

  return (
    <div className="p-4">
      {images.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No media yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, i) => {
            const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
            return (
              <div key={i} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-blue-500 transition"
                onClick={() => setSelected({ url, isVideo })}>
                {isVideo
                  ? <video src={url} muted className="w-full h-full object-cover" />
                  : <img src={url} alt="" className="w-full h-full object-cover" />}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                    <span className="text-white text-2xl">▶</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200]" onClick={() => setSelected(null)}>
          <button className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition">✕</button>
          <div className="max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {selected.isVideo
              ? <video src={selected.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg" />
              : <img src={selected.url} alt="" className="max-w-full max-h-[85vh] rounded-lg object-contain" />}
          </div>
        </div>
      )}
    </div>
  );
}
