'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadGallery(); }, []);

  const loadGallery = async () => {
    try {
      const res = await axios.get(`${API || 'http://localhost:5001'}/api/gallery/list`);
      setImages(res.data || []);
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 font-mono text-gray-500 text-xs">[LOADING_MEDIA_NODES]</div>;

  return (
    <div className="p-3 h-full overflow-y-auto custom-scrollbar bg-slate-950/20">
      {images.length === 0 ? (
        <div className="text-center py-16 text-gray-600 font-mono text-xs">[MEDIA_REGISTRY_EMPTY]</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {images.map((url, i) => {
            const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
            return (
              <div key={i} className="relative aspect-square bg-slate-900 rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-blue-500/50 transition-colors group"
                onClick={() => setSelected({ url, isVideo })}>
                {isVideo
                  ? <video src={url} muted className="w-full h-full object-cover" />
                  : <img src={url} alt="" className="w-full h-full object-cover" />}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                    <span className="text-white text-lg">▶</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[999] p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-white/10 p-2 rounded-lg border border-white/10"><FiX size={18} /></button>
          <div className="max-w-full max-h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {selected.isVideo
              ? <video src={selected.url} controls autoPlay className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl" />
              : <img src={selected.url} alt="" className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain shadow-2xl" />}
          </div>
        </div>
      )}
    </div>
  );
}