import { getCharacterName } from "../utils/formatters";

export default function InterrogationPanel({
  activeCharacter,
  conversation,
  question,
  onQuestionChange,
  onAsk,
  loading,
  disabled,
  onUseHint,
}) {
  return (
    <section className="panel-section">
      <div className="panel-header">
        <h3>Sorgu Paneli</h3>
        <button type="button" className="ghost" onClick={onUseHint}>
          İpucu Kullan
        </button>
      </div>
      {activeCharacter ? (
        <div className="interrogation">
          <div className="interrogation-header">
            <h4>{getCharacterName(activeCharacter)}</h4>
            <span>{activeCharacter.personality || "-"}</span>
          </div>
          <div className="conversation">
            {conversation.length === 0 ? (
              <p>Henüz soru sorulmadı.</p>
            ) : (
              conversation.map((item, index) => (
                <div key={`${activeCharacter.id}-${index}`} className={`message ${item.role}`}>
                  <strong>{item.role === "user" ? "Sen" : "Şüpheli"}</strong>
                  <p>{item.content}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={onAsk} className="question-form">
            <textarea
              value={question}
              onChange={(event) => onQuestionChange(event.target.value)}
              placeholder="Şüpheliye bir soru sor..."
              rows={3}
              disabled={loading || disabled}
            />
            <button type="submit" disabled={loading || disabled}>
              {loading ? "Gönderiliyor..." : "Sor"}
            </button>
          </form>
        </div>
      ) : (
        <p>Bir şüpheli seçerek sorguya başlayabilirsiniz.</p>
      )}
    </section>
  );
}
