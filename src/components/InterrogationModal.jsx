"use client";

import { useMemo, useEffect, useRef } from "react";
import { formatCharacterName, getInitials } from "../utils/formatters";
import { buildUrl } from "../services/apiClient";
import { CloseIcon, MessageSquareIcon, SendIcon } from "./icons";

export default function InterrogationModal({
  isOpen,
  onClose,
  character,
  conversation = [],
  question,
  onQuestionChange,
  onAsk,
  loading,
  disabled,
}) {
  const modalRef = useRef(null);
  const messagesEndRef = useRef(null);

  const safeConversation = useMemo(
    () => (Array.isArray(conversation) ? conversation : []),
    [conversation]
  );

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, safeConversation.length, loading]);

  if (!isOpen || !character) return null;

  const characterName = formatCharacterName(character);

  const questionSuggestions = Array.isArray(character.question_prompts) && character.question_prompts.length > 0
    ? character.question_prompts.slice(0, 3)
    : [
        "Olay sırasında tam olarak neredeydin?",
        "Olaydan hemen önce ne yaptığını anlatır mısın?",
        "Diğer şüphelilerle ilişkin nasıl?",
      ];

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interrogation-modal-title"
      >
        <header className="modal-header">
          <div className="modal-header-suspect">
            <div className="modal-avatar-box">
              {character.avatar ? (
                <img
                  src={buildUrl(`/assets/${character.avatar}`)}
                  alt={characterName}
                  className="modal-avatar"
                />
              ) : (
                <div className="avatar-neutral-fallback small" aria-hidden="true">
                  <span>{getInitials(character)}</span>
                </div>
              )}
            </div>
            <div>
              <h2 id="interrogation-modal-title" className="modal-title">
                {characterName}
              </h2>
              <p className="modal-subtitle">{character.role || "Şüpheli"}</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Kapat"
          >
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="modal-body">
          <div className="interrogation">
            <div className="conversation">
              {safeConversation.length === 0 ? (
                <div className="empty-state">
                  <p>Henüz soru sormadınız. Aşağıdaki önerilerden seçebilir veya kendi sorunuzu yazabilirsiniz.</p>
                </div>
              ) : (
                safeConversation.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <span className="message-sender">
                      {msg.role === "user" ? "Sen" : characterName}
                    </span>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))
              )}
              {loading ? (
                <div className="message assistant loading-message">
                  <span className="message-sender">{characterName}</span>
                  <div className="message-content">İfade veriliyor...</div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {questionSuggestions.length > 0 && !disabled ? (
              <div className="question-suggestions">
                <span className="suggestions-label">Önerilen sorular (taslağa ekler)</span>
                <div className="suggestion-chips">
                  {questionSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => onQuestionChange(item)}
                      disabled={loading || disabled}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form
              className="question-form"
              onSubmit={(event) => onAsk(event, character?.id)}
            >
              <div className="composer-container">
                <textarea
                  value={question}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  placeholder="Sorunuzu yazın..."
                  rows={2}
                  disabled={loading || disabled}
                  className="composer-textarea"
                />
                <button
                  type="submit"
                  disabled={loading || disabled || !question.trim()}
                  className="ds-btn ds-btn-primary composer-send-btn"
                >
                  <SendIcon size={14} />
                  <span>{loading ? "..." : "Soruyu Sor"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
