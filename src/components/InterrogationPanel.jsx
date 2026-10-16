"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { buildUrl } from "../services/apiClient";
import { formatCharacterName, getInitials } from "../utils/formatters";
import { MessageSquareIcon, SearchIcon, SendIcon, UserIcon } from "./icons";

export default function InterrogationPanel({
  characters = [],
  activeCharacter,
  onSelectCharacter,
  conversation = [],
  question = "",
  onQuestionChange,
  onAsk,
  loading = false,
  disabled = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  const safeConversation = useMemo(
    () => (Array.isArray(conversation) ? conversation : []),
    [conversation]
  );

  const filteredConversation = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return safeConversation;
    return safeConversation.filter((msg) =>
      String(msg?.content || "").toLowerCase().includes(term)
    );
  }, [safeConversation, searchTerm]);

  // Auto-scroll to bottom of conversation on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [safeConversation.length, loading]);

  const characterName = activeCharacter ? formatCharacterName(activeCharacter) : "Şüpheli";

  // Question suggestions: max 3
  const suggestions = useMemo(() => {
    if (!activeCharacter) return [];
    const prompts = Array.isArray(activeCharacter.question_prompts) && activeCharacter.question_prompts.length > 0
      ? activeCharacter.question_prompts
      : [
          "Olay anında tam olarak neredeydin?",
          "Olaydan önce şüpheli bir durum fark ettin mi?",
          "Diğer kişilerle olan ilişkini anlatır mısın?",
        ];
    return prompts.slice(0, 3);
  }, [activeCharacter]);

  const handleKeyDown = (event) => {
    // Desktop: Enter sends, Shift+Enter adds newline
    if (event.key === "Enter" && !event.shiftKey) {
      // On desktop (width >= 768px), Enter submits
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        event.preventDefault();
        if (question.trim() && !loading && !disabled) {
          onAsk(event, activeCharacter?.id);
        }
      }
    }
  };

  return (
    <aside className="panel interrogation-panel" aria-label="Sorgulama Alanı">
      <header className="interrogation-header">
        {activeCharacter ? (
          <div className="interrogation-active-suspect">
            <div className="interrogation-avatar-box">
              {activeCharacter.avatar ? (
                <img
                  src={buildUrl(`/assets/${activeCharacter.avatar}`)}
                  alt={characterName}
                  className="interrogation-avatar"
                />
              ) : (
                <div className="avatar-neutral-fallback small" aria-hidden="true">
                  <span>{getInitials(activeCharacter)}</span>
                </div>
              )}
            </div>
            <div className="interrogation-suspect-copy">
              <span className="interrogation-label">Sorgulanan Kişi</span>
              <h3 className="interrogation-suspect-name">{characterName}</h3>
              <p className="interrogation-suspect-role">{activeCharacter.role || "Şüpheli"}</p>
            </div>
          </div>
        ) : (
          <div className="interrogation-no-suspect">
            <MessageSquareIcon size={18} />
            <span>Sorgulamak için bir şüpheli seçin</span>
          </div>
        )}

        {characters.length > 1 && onSelectCharacter ? (
          <div className="interrogation-suspect-selector">
            <select
              value={activeCharacter?.id || ""}
              onChange={(e) => onSelectCharacter(e.target.value)}
              className="interrogation-select"
              aria-label="Şüpheli Değiştir"
              disabled={loading || disabled}
            >
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {formatCharacterName(char)} ({char.role || "Şüpheli"})
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </header>

      {safeConversation.length >= 3 ? (
        <div className="conversation-search-bar">
          <SearchIcon size={14} className="search-bar-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Konuşma içinde ara..."
            className="conversation-search-input"
            disabled={loading || disabled}
          />
        </div>
      ) : null}

      <div className="conversation-scroll-area">
        {safeConversation.length === 0 ? (
          <div className="conversation-empty-state">
            <p className="empty-title">İlk sorunu sor</p>
            <p className="empty-sub">
              {activeCharacter
                ? `${characterName} ifadesini vermeye hazır. Aşağıdaki önerilerden seçebilir veya kendi sorunu yazabilirsin.`
                : "Bir şüpheli seçerek sorgulamaya başlayın."}
            </p>
          </div>
        ) : filteredConversation.length === 0 ? (
          <div className="conversation-empty-state">
            <p>Eşleşen ifade bulunamadı.</p>
          </div>
        ) : (
          <div className="conversation-messages">
            {filteredConversation.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`message ${isUser ? "user" : "assistant"}`}
                >
                  <div className="message-header">
                    <span className="message-sender">
                      {isUser ? "Sen (Dedektif)" : characterName}
                    </span>
                  </div>
                  <div className="message-content">
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="message assistant loading-message">
            <span className="message-sender">{characterName}</span>
            <div className="typing-indicator">
              <span>İfade veriliyor...</span>
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && !disabled ? (
        <div className="question-suggestions">
          <span className="suggestions-label">Soru Önerileri (taslağa ekler)</span>
          <div className="suggestion-chips">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="suggestion-chip"
                onClick={() => onQuestionChange(item)}
                disabled={loading || disabled}
                title="Soru taslağına ekle"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <form
        className="question-form"
        onSubmit={(event) => onAsk(event, activeCharacter?.id)}
      >
        <div className="composer-container">
          <textarea
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "Soruşturma tamamlandı, yeni soru sorulamaz."
                : `${characterName} adlı şüpheliye sorunu yaz...`
            }
            rows={2}
            disabled={loading || disabled || !activeCharacter}
            className="composer-textarea"
          />
          <button
            type="submit"
            disabled={loading || disabled || !question.trim() || !activeCharacter}
            className="ds-btn ds-btn-primary composer-send-btn"
            aria-label="Soruyu Gönder"
          >
            <SendIcon size={15} />
            <span className="send-text">{loading ? "..." : "Gönder"}</span>
          </button>
        </div>
        <div className="composer-meta">
          <small className="keyboard-hint hide-mobile">
            Enter ile gönder, Shift + Enter ile yeni satır
          </small>
          {question.length > 0 ? (
            <small className="char-count">{question.length}/1000</small>
          ) : null}
        </div>
      </form>
    </aside>
  );
}
