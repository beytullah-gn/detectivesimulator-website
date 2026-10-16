"use client";

import { useState } from "react";
import { buildUrl } from "../services/apiClient";
import { FileTextIcon } from "./icons";

export default function ScenarioMediaList({
  media = [],
  selectedId,
  onSelect,
}) {
  const [internalSelectedId, setInternalSelectedId] = useState(
    () => media[0]?.id || ""
  );

  const activeId = selectedId || internalSelectedId || media[0]?.id || "";
  const activeItem = media.find((item) => item.id === activeId) || media[0];

  const handleSelect = (id) => {
    if (onSelect) {
      onSelect(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  if (!media.length) {
    return (
      <div className="empty-state">
        <p>Bu vaka için ek dosya bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="media-workspace">
      <ul className="media-list" role="tablist" aria-label="Delil ve Belge Listesi">
        {media.map((item) => {
          const isSelected = item.id === activeId;
          return (
            <li
              key={item.id}
              role="tab"
              aria-selected={isSelected}
              className={`media-item ${isSelected ? "selected" : ""}`}
              onClick={() => handleSelect(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(item.id);
                }
              }}
              tabIndex={0}
            >
              <div className="media-item-header">
                <span className="media-badge">
                  <FileTextIcon size={13} />
                  {item.type || "Belge"}
                </span>
                {isSelected ? <span className="media-selected-dot" /> : null}
              </div>
              <h4 className="media-item-title">{item.title || "Kanıt Parçası"}</h4>
              {item.description ? (
                <p className="media-item-desc">{item.description}</p>
              ) : null}
            </li>
          );
        })}
      </ul>

      {activeItem ? (
        <article className="media-reader">
          <header className="media-reader-header">
            <span className="media-badge">
              <FileTextIcon size={14} />
              {activeItem.type || "Belge"}
            </span>
            <h3 className="media-reader-title">{activeItem.title}</h3>
            {activeItem.description ? (
              <p className="media-reader-desc">{activeItem.description}</p>
            ) : null}
          </header>

          <div className="media-reader-body">
            {activeItem.content ? (
              <div className="media-reader-content">
                {activeItem.content.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : null}

            {activeItem.file ? (
              <div className="media-file-box">
                <a
                  href={buildUrl(`/assets/${activeItem.file}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="ds-btn ds-btn-secondary ds-btn-sm"
                >
                  <FileTextIcon size={14} /> Ek Dosyayı Yeni Sekmede Aç
                </a>
              </div>
            ) : null}
          </div>
        </article>
      ) : null}
    </div>
  );
}
