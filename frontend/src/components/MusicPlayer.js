'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  FaPlay, FaPause, FaStepForward, FaStepBackward, 
  FaVolumeUp, FaVolumeMute, FaMusic, FaSearch 
} from 'react-icons/fa';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function MusicPlayer() {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Clean Native Audio State Architecture
  const [currentIdx, setCurrentIdx] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);

  // Phase 1: Pull Direct Audio File Array Target
  useEffect(() => {
    axios.get(`${API || 'http://localhost:5001'}/api/music/list`)
      .then(res => {
        const list = res.data && res.data.length ? res.data : [
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
        ];
        setSongs(list);
        setFilteredSongs(list);
        if (list.length > 0) setCurrentIdx(0);
      })
      .catch(() => {
        const fallback = ["https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"];
        setSongs(fallback);
        setFilteredSongs(fallback);
        setCurrentIdx(0);
      })
      .finally(() => setLoading(false));
  }, []);

  // Phase 2: Native Audio Lifecycle Management Engine
  useEffect(() => {
    if (!songs.length || currentIdx === null) return;

    const audio = new Audio(songs[currentIdx]);
    audio.volume = isMuted ? 0 : volume;
    
    // Core event pipelines for native precision UI progression tracking
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => handleNext());

    audioRef.current = audio;

    // Auto-play when changing tracks explicitly
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [currentIdx, songs]); // eslint-disable-line

  // Search filter matching strategy
  useEffect(() => {
    const clean = searchQuery.toLowerCase().trim();
    if (!clean) {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter(url => songName(url).toLowerCase().includes(clean));
      setFilteredSongs(filtered);
    }
  }, [searchQuery, songs]); // eslint-disable-line

  const playSongAt = (filteredIdx) => {
    if (filteredIdx < 0 || filteredIdx >= filteredSongs.length) return;
    const masterIdx = songs.indexOf(filteredSongs[filteredIdx]);
    if (masterIdx !== -1) {
      setCurrentIdx(masterIdx);
      if (!isPlaying) setIsPlaying(true);
    }
  };

  // Single dynamic action toggle handler
  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (!filteredSongs.length) return;
    const currentFilteredIdx = filteredSongs.indexOf(songs[currentIdx]);
    const nextFilteredIdx = (currentFilteredIdx - 1 + filteredSongs.length) % filteredSongs.length;
    playSongAt(nextFilteredIdx);
  };

  const handleNext = () => {
    if (!filteredSongs.length) return;
    const currentFilteredIdx = filteredSongs.indexOf(songs[currentIdx]);
    const nextFilteredIdx = (currentFilteredIdx + 1) % filteredSongs.length;
    playSongAt(nextFilteredIdx);
  };

  // Smooth local timeline scrub interaction handler
  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const targetPct = parseFloat(e.target.value);
    const targetTime = (targetPct / 100) * duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : v;
    if (v > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) audioRef.current.volume = nextMute ? 0 : volume;
  };

  const fmt = (s) => {
    if (isNaN(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const songName = (url) => {
    try {
      const name = url.split('/').pop().split('?')[0];
      return decodeURIComponent(name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '));
    } catch {
      return "Audio Cluster Output Node";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950/40 font-mono text-xs text-blue-400">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping mr-2" />
        BUFFERING_RAW_CDN_PIPELINE...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-3 bg-slate-950/60 backdrop-blur-xl text-slate-200 select-none">
      
      {/* Visual Indicator Window Section */}
      <div className="relative bg-gradient-to-b from-blue-600/10 to-transparent border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center gap-2 overflow-hidden shadow-inner shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
        
        <div className={`w-10 h-10 rounded-full bg-slate-900 border-2 border-blue-500/30 flex items-center justify-center shadow-lg text-blue-400 ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}>
          <FaMusic size={14} className={isPlaying ? 'animate-pulse' : ''} />
        </div>

        <div className="text-center w-full z-10">
          {currentIdx !== null ? (
            <>
              <p className="text-white text-xs font-semibold font-mono tracking-wide truncate px-4 capitalize">{songName(songs[currentIdx])}</p>
              <p className="text-[9px] text-cyan-400 font-mono tracking-widest mt-0.5 uppercase">// DIRECT_CDN_CHANNEL_{currentIdx + 1}</p>
            </>
          ) : (
            <p className="text-slate-400 text-xs font-mono tracking-wider">[SYSTEM_STANDBY]</p>
          )}
        </div>
      </div>

      {/* RE-ACTIVATED PRECISION NATIVE TIMELINE RUN TRACK */}
      <div className="space-y-1 shrink-0 px-1">
        <div className="relative group w-full flex items-center">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={duration > 0 ? (currentTime / duration) * 100 : 0} 
            onChange={handleSeek} 
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer outline-none accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #22d3ee ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #1e293b ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #1e293b 100%)`
            }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 tracking-tight">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Control Module Rack Array */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-900/40 p-2.5 rounded-xl border border-white/5 shrink-0">
        <div className="flex items-center gap-5 justify-center w-full sm:w-auto">
          <button onClick={handlePrev} disabled={!filteredSongs.length} className="text-slate-400 hover:text-white disabled:opacity-20 transition-colors active:scale-90">
            <FaStepBackward size={13} />
          </button>
          
          {/* THE SINGLE COMBINED TOGGLE BUTTON */}
          <button 
            onClick={handleTogglePlay} 
            disabled={!filteredSongs.length} 
            className="w-9 h-9 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            {isPlaying ? <FaPause size={11} /> : <FaPlay size={10} className="translate-x-[1px]" />}
          </button>

          <button onClick={handleNext} disabled={!filteredSongs.length} className="text-slate-400 hover:text-white disabled:opacity-20 transition-colors active:scale-90">
            <FaStepForward size={13} />
          </button>
        </div>

        {/* CUSTOM GRADIENT FILL VOLUME CONTROLLER */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 border-white/5 pt-1.5 sm:pt-0">
          <button onClick={toggleMute} className="text-slate-400 hover:text-blue-400 transition-colors">
            {isMuted || volume === 0 ? <FaVolumeMute size={13} /> : <FaVolumeUp size={13} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={isMuted ? 0 : volume} 
            onChange={handleVolume} 
            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer outline-none accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #1e293b ${(isMuted ? 0 : volume) * 100}%, #1e293b 100%)`
            }}
          />
        </div>
      </div>

      {/* FILTER SEARCH FIELD ASSEMBLY */}
      <div className="relative shrink-0">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
          <FaSearch size={10} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search track registry..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-950/50 border border-white/5 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Dynamic Filter Grid View Selection Row */}
      <div className="flex-1 overflow-y-auto bg-slate-950/40 rounded-xl border border-white/5 custom-scrollbar min-h-[110px]">
        {filteredSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 font-mono text-slate-600 text-[11px]">
            [NO_MATCHING_NODES]
          </div>
        ) : (
          filteredSongs.map((url, i) => {
            const isSelected = songs[currentIdx] === url;
            return (
              <div 
                key={url} 
                onClick={() => playSongAt(i)} 
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/[0.03] transition-all border-b border-white/[0.02] last:border-0 group ${isSelected ? 'bg-blue-600/10 border-b-blue-500/20' : ''}`}
              >
                <div className="font-mono text-[9px] w-4 text-slate-500 flex justify-center">
                  {isSelected && isPlaying ? (
                    <span className="text-cyan-400 font-bold animate-pulse">▶</span>
                  ) : (
                    <span className="group-hover:text-slate-300 transition-colors">{i + 1}</span>
                  )}
                </div>
                <span className={`text-xs truncate flex-1 font-mono tracking-wide capitalize ${isSelected ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {songName(url)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}