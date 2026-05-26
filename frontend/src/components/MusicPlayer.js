'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function MusicPlayer() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/api/music/list`)
      .then(res => setSongs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Set up audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => handleNext());
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []); // eslint-disable-line

  const playSongAt = (idx) => {
    if (!audioRef.current || idx < 0 || idx >= songs.length) return;
    audioRef.current.src = songs[idx];
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
    setCurrentIdx(idx);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (currentIdx === null) { playSongAt(0); return; }
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    if (!songs.length) return;
    const idx = currentIdx === null ? 0 : (currentIdx - 1 + songs.length) % songs.length;
    playSongAt(idx);
  };

  const handleNext = () => {
    if (!songs.length) return;
    const idx = currentIdx === null ? 0 : (currentIdx + 1) % songs.length;
    playSongAt(idx);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = (e.target.value / 100) * duration;
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !isMuted;
    audioRef.current.muted = next;
    setIsMuted(next);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const songName = (url) => {
    const name = url.split('/').pop().split('?')[0];
    // strip cloudinary version prefix like "v1234567890/"
    return decodeURIComponent(name.replace(/^v\d+\//, '').replace(/\.[^.]+$/, ''));
  };

  if (loading) return <div className="text-center py-10 text-gray-400 text-sm">Loading music...</div>;

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Now playing */}
      <div className="bg-white/5 rounded-xl p-4 text-center">
        <div className="text-3xl mb-2">🎵</div>
        {currentIdx !== null
          ? <p className="text-white text-sm font-medium truncate">{songName(songs[currentIdx])}</p>
          : <p className="text-gray-500 text-sm">Select a song to play</p>}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-10 text-right">{fmt(currentTime)}</span>
        <input type="range" min="0" max="100"
          value={duration > 0 ? (currentTime / duration) * 100 : 0}
          onChange={handleSeek} className="flex-1 accent-blue-500" />
        <span className="text-xs text-gray-400 w-10">{fmt(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handlePrev} disabled={!songs.length} className="text-white/60 hover:text-white disabled:opacity-30 transition"><FaStepBackward /></button>
          <button onClick={handlePlayPause} disabled={!songs.length}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white disabled:opacity-30 transition">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={handleStop} disabled={!isPlaying} className="text-white/60 hover:text-white disabled:opacity-30 transition"><FaStop /></button>
          <button onClick={handleNext} disabled={!songs.length} className="text-white/60 hover:text-white disabled:opacity-30 transition"><FaStepForward /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-white/60 hover:text-white transition">
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolume} className="w-20 accent-blue-500" />
        </div>
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-auto bg-white/5 rounded-xl">
        {songs.length === 0
          ? <div className="text-center py-8 text-gray-500 text-sm">No songs yet.</div>
          : songs.map((url, i) => (
            <div key={i} onClick={() => playSongAt(i)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/10 transition border-b border-white/5 last:border-0 ${currentIdx === i ? 'bg-blue-500/20' : ''}`}>
              <span className="text-sm">{currentIdx === i && isPlaying ? '▶' : `${i + 1}.`}</span>
              <span className="text-white text-sm truncate flex-1">{songName(url)}</span>
              {currentIdx === i && <span className="text-xs text-blue-400">Now Playing</span>}
            </div>
          ))}
      </div>
    </div>
  );
}
