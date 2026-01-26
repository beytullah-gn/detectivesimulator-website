import { useMemo, useState } from "react";
import { formatCharacterName } from "../utils/formatters";

export default function InterrogationModal({
  isOpen,
  onClose,
  character,
  conversation,
  question,
  onQuestionChange,
  onAsk,
  loading,
  disabled,
}) {
  if (!character) return null;

  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversation = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return conversation;
    return conversation.filter((msg) =>
      String(msg?.content || "").toLowerCase().includes(term)
    );
  }, [conversation, searchTerm]);

  const questionSuggestions = [
    "Olay sırasında tam olarak neredeydin?",
    "Olaydan hemen önce ne yaptığını anlatır mısın?",
    "Diğer şüphelilerle ilişkin nasıl?",
    "Bu olayla ilgili senden şüphelenmemize sebep olacak bir durum var mı?",
    "Seninle çelişen bir tanık ifadesi var mı?",
  ];

  return isOpen ? (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔍 {formatCharacterName(character)} ile Sorgulama</h2>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="interrogation">
            <div className="conversation-search">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Konuşma içinde ara..."
                disabled={loading || disabled}
              />
            </div>
            <div className="conversation">
              {conversation.length === 0 ? (
                <div className="empty-state">
                  <p>Henüz soru sormadınız. Aşağıdan bir soru yazın.</p>
                </div>
              ) : filteredConversation.length === 0 ? (
                <div className="empty-state">
                  <p>Eşleşen mesaj bulunamadı.</p>
                </div>
              ) : (
                filteredConversation.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <strong>{msg.role === "user" ? "Siz" : character.name}</strong>
                    {msg.content}
                  </div>
                ))
              )}
            </div>

            <div className="question-suggestions">
              <p>Önerilen sorular</p>
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

            <form className="question-form" onSubmit={(event) => onAsk(event, character?.id)}>
              <textarea
                value={question}
                onChange={(e) => onQuestionChange(e.target.value)}
                placeholder="Sorunuzu yazın..."
                rows={3}
                disabled={loading || disabled}
              />
              <button type="submit" disabled={loading || disabled || !question.trim()}>
                {loading ? "Cevap bekleniyor..." : "Soruyu Sor"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
