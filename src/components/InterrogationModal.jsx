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
            <div className="conversation">
              {conversation.length === 0 ? (
                <div className="empty-state">
                  <p>Henüz soru sormadınız. Aşağıdan bir soru yazın.</p>
                </div>
              ) : (
                conversation.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <strong>{msg.role === "user" ? "Siz" : character.name}</strong>
                    {msg.content}
                  </div>
                ))
              )}
            </div>

            <form className="question-form" onSubmit={onAsk}>
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
