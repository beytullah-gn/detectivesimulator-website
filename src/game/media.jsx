"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, PlayIcon } from "../components/icons";
import { getSoundscape, playSfx, readSoundSettings } from "./audio/soundscape";

export const isAudioUrl = (url = "") => /\.(mp3|m4a|ogg|wav)(\?|$)/i.test(url);
export const isImageUrl = (url = "") => /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url);

function PauseIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

export function AudioPlayer({ src, label = "Kaydı dinle", compact = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio && !audio.paused) {
        audio.pause();
        getSoundscape().duck(false);
      }
    };
  }, [src]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      getSoundscape().unlock();
      playSfx("tape");
      audio.play().catch((error) => console.error("Audio play error:", error));
    } else {
      audio.pause();
    }
  }

  function seek(event) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    audio.currentTime = ((event.clientX - rect.left) / rect.width) * duration;
  }

  const progress = duration ? (time / duration) * 100 : 0;

  return (
    <div className={`tape ${playing ? "is-playing" : ""} ${compact ? "tape-compact" : ""}`}>
      <button type="button" className="tape-btn" onClick={toggle} aria-label={playing ? "Duraklat" : label}>
        {playing ? <PauseIcon /> : <PlayIcon size={14} />}
      </button>
      <div className="tape-body">
        {!compact ? <span className="tape-label">{label}</span> : null}
        <div className="tape-track" onClick={seek} role="presentation">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
      <span className="tape-time">
        {formatTime(time)} / {formatTime(duration)}
      </span>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onPlay={() => {
          setPlaying(true);
          getSoundscape().duck(true);
        }}
        onPause={() => {
          setPlaying(false);
          getSoundscape().duck(false);
        }}
        onEnded={() => setTime(0)}
      />
    </div>
  );
}

export function EvidenceImage({ src, alt }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="evidence-photo"
        onClick={() => {
          playSfx("shutter");
          setOpen(true);
        }}
        aria-label={`${alt} büyüt`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" />
      </button>
      {open
        ? createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={() => setOpen(false)}>
          <button type="button" className="icon-btn lightbox-close" aria-label="Kapat">
            <CloseIcon size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} />
        </div>,
            document.body
          )
        : null}
    </>
  );
}

export function MediaBlock({ url, title, label }) {
  if (!url) return null;
  if (isAudioUrl(url)) return <AudioPlayer src={url} label={label || "Kaydı dinle"} />;
  if (isImageUrl(url)) return <EvidenceImage src={url} alt={title || "Delil"} />;
  return null;
}

function subscribeSettings(callback) {
  return getSoundscape().subscribe(callback);
}

function getSettingsSnapshot() {
  return getSoundscape().getSettings();
}

function getServerSettingsSnapshot() {
  return readSoundSettings();
}

export function useSoundSettings() {
  return useSyncExternalStore(subscribeSettings, getSettingsSnapshot, getServerSettingsSnapshot);
}

function MusicIcon({ off }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      {off ? <line x1="2" y1="2" x2="22" y2="22" /> : null}
    </svg>
  );
}

function SpeakerIcon({ off }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {off ? <line x1="22" y1="9" x2="16" y2="15" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7" />}
      {off ? <line x1="16" y1="9" x2="22" y2="15" /> : <path d="M19 5a10 10 0 0 1 0 14" />}
    </svg>
  );
}

export function SoundToggles() {
  const settings = useSoundSettings();
  const soundscape = getSoundscape();
  return (
    <div className="sound-toggles">
      <button
        type="button"
        className={`icon-btn ${settings.music ? "on" : ""}`}
        onClick={() => soundscape.updateSettings({ music: !settings.music })}
        aria-pressed={settings.music}
        aria-label={settings.music ? "Müziği kapat" : "Müziği aç"}
        title={settings.music ? "Müziği kapat" : "Müziği aç"}
      >
        <MusicIcon off={!settings.music} />
      </button>
      <button
        type="button"
        className={`icon-btn ${settings.sfx ? "on" : ""}`}
        onClick={() => soundscape.updateSettings({ sfx: !settings.sfx })}
        aria-pressed={settings.sfx}
        aria-label={settings.sfx ? "Efektleri kapat" : "Efektleri aç"}
        title={settings.sfx ? "Efektleri kapat" : "Efektleri aç"}
      >
        <SpeakerIcon off={!settings.sfx} />
      </button>
    </div>
  );
}
