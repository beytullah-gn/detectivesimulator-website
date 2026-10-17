"use client";

import {
  ActivityIcon,
  CameraIcon,
  ClipboardIcon,
  ClockIcon,
  FileTextIcon,
  MicIcon,
  StarIcon,
} from "../components/icons";
import { formatCharacterName, getInitials } from "../utils/formatters";
import "./pieces.css";

export const SUSPICION_LABELS = ["Belirsiz", "Şüpheli", "Çok şüpheli"];

export function Stars({ count = 0, max = 3, size = 14, className = "" }) {
  return (
    <span className={`stars ${className}`} aria-label={`${count}/${max} yıldız`}>
      {Array.from({ length: max }, (_, index) => (
        <StarIcon
          key={index}
          size={size}
          filled={index < count}
          className={index < count ? "star-on" : "star-off"}
        />
      ))}
    </span>
  );
}

export function Mugshot({ character, index = 0, size = "md", suspicion = 0, done = false }) {
  const plate = `${String(index + 1).padStart(2, "0")}`;
  return (
    <div className={`mugshot mugshot-${size} ${suspicion ? `suspicion-${suspicion}` : ""}`}>
      <div className="mugshot-frame" aria-hidden="true">
        <span className="mugshot-silhouette" />
        <span className="mugshot-plate">
          {getInitials(character)} · {plate}
        </span>
        {done ? <span className="mugshot-done" title="Sorgulandı" /> : null}
      </div>
      {size !== "xs" ? (
        <div className="mugshot-caption">
          <strong>{formatCharacterName(character)}</strong>
          <small>{character?.role || "Şüpheli"}</small>
        </div>
      ) : null}
    </div>
  );
}

export function SuspicionDots({ level = 0 }) {
  return (
    <span className="suspicion-dots" aria-label={SUSPICION_LABELS[level] || SUSPICION_LABELS[0]}>
      {[1, 2].map((value) => (
        <span key={value} className={level >= value ? "on" : ""} />
      ))}
    </span>
  );
}

export function EvidenceIcon({ type = "", media = "", size = 16 }) {
  if (/\.(mp3|m4a|ogg|wav)$/i.test(media)) return <MicIcon size={size} />;
  const normalized = type.toLocaleLowerCase("tr-TR");
  if (normalized.includes("kamera") || normalized.includes("foto")) return <CameraIcon size={size} />;
  if (normalized.includes("zaman")) return <ClockIcon size={size} />;
  if (normalized.includes("rapor") || normalized.includes("grafik")) return <ActivityIcon size={size} />;
  if (normalized.includes("tutanak") || normalized.includes("çizelge")) return <ClipboardIcon size={size} />;
  return <FileTextIcon size={size} />;
}
