"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  HelpCircleIcon,
  LightbulbIcon,
  PinIcon,
  SendIcon,
  TargetIcon,
} from "../components/icons";
import { formatCharacterName } from "../utils/formatters";
import { MAX_HINTS } from "./career";
import CoachTour from "./CoachTour";
import { EvidenceIcon, Mugshot, SUSPICION_LABELS, SuspicionDots } from "./pieces";
import { useCaseProgress } from "./useCaseProgress";

const TOUR_KEY = "ds_tour_done_v1";

const TOUR_STEPS = [
  { target: "evidence", title: "Delilleri oku", text: "Her kart bir delil. Aç, oku, önemli olanı iğnele." },
  { target: "suspects", title: "Şüphelileri sorgula", text: "Birini seç ve istediğini sor. Çelişkileri yakala." },
  { target: "objectives", title: "Görevini takip et", text: "Sıradaki adım, ipuçları ve notların burada." },
  { target: "accuse", title: "Suçluyu göster", text: "Hazır olduğunda suçla. İpucusuz çözüm 3 yıldız." },
];

function readTourDone() {
  try {
    return localStorage.getItem(TOUR_KEY) === "1";
  } catch {
    return true;
  }
}

function getNextStep({ seenCount, mediaCount, questionedCount, characterCount }) {
  if (seenCount === 0) return "Önce olay özetini oku.";
  if (seenCount < Math.min(3, mediaCount)) return "Delilleri okumaya devam et.";
  if (questionedCount === 0) return "Bir şüpheliyi sorgula; ifadesini delillerle karşılaştır.";
  if (seenCount < mediaCount) return "Okumadığın deliller var.";
  if (questionedCount < characterCount) return "Herkesi dinlemeden karar verme.";
  return "Tablo netleşti. Hazırsan suçla.";
}

function EvidenceViewer({ item, index, total, pinned, onTogglePin, onPrev, onNext, onClose }) {
  return (
    <div className="inspector-panel">
      <div className="inspector-head">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Kapat">
          <CloseIcon size={16} />
        </button>
        <span className="inspector-count">
          {index + 1}/{total}
        </span>
        <div className="inspector-nav">
          <button type="button" className="icon-btn" onClick={onPrev} aria-label="Önceki delil">
            <ChevronLeftIcon size={16} />
          </button>
          <button type="button" className="icon-btn" onClick={onNext} aria-label="Sonraki delil">
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      <article className="paper">
        <span className="paper-type">
          <EvidenceIcon type={item.type} size={14} />
          {item.type || "Belge"}
        </span>
        <h3>{item.title}</h3>
        {item.description ? <p className="paper-lede">{item.description}</p> : null}
        {(item.content || "").split("\n").filter(Boolean).map((paragraph, paragraphIndex) => (
          <p key={paragraphIndex}>{paragraph}</p>
        ))}
      </article>

      <button
        type="button"
        className={`ds-btn ${pinned ? "ds-btn-primary" : "ds-btn-secondary"} pin-btn`}
        onClick={onTogglePin}
        aria-pressed={pinned}
      >
        <PinIcon size={14} filled={pinned} />
        {pinned ? "İğnelendi" : "Önemli olarak iğnele"}
      </button>
    </div>
  );
}

function InterrogationRoom({
  character,
  index,
  relations,
  conversation,
  suspicion,
  onSuspicion,
  question,
  onQuestionChange,
  onAsk,
  loading,
  onClose,
}) {
  const [pendingQuestion, setPendingQuestion] = useState("");
  const logRef = useRef(null);
  const askedSet = new Set(conversation.filter((m) => m.role === "user").map((m) => m.content));
  const prompts = (Array.isArray(character.question_prompts) ? character.question_prompts : []).filter(
    (prompt) => !askedSet.has(prompt)
  );

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [conversation.length, pendingQuestion]);

  async function ask(text) {
    const trimmed = (text ?? question).trim();
    if (!trimmed || loading) return;
    setPendingQuestion(trimmed);
    await onAsk(null, character.id, trimmed);
    setPendingQuestion("");
  }

  return (
    <div className="inspector-panel room">
      <div className="inspector-head">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Kapat">
          <CloseIcon size={16} />
        </button>
        <span className="inspector-count">Sorgu odası</span>
      </div>

      <div className="room-subject">
        <Mugshot character={character} index={index} size="sm" suspicion={suspicion} />
        <div className="room-facts">
          {character.alibi ? (
            <p>
              <span>İfade</span>
              {character.alibi}
            </p>
          ) : null}
          {relations.length ? (
            <p>
              <span>Bağlantı</span>
              {relations
                .map((relation) => `${formatCharacterName(relation.related_character)}: ${relation.relation}`)
                .join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="segmented" role="radiogroup" aria-label="Şüphe düzeyi">
        {SUSPICION_LABELS.map((label, level) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={suspicion === level}
            className={suspicion === level ? "active" : ""}
            onClick={() => onSuspicion(level)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="chat-log" ref={logRef} aria-live="polite">
        {conversation.length === 0 && !pendingQuestion ? (
          <p className="empty-line">İlk soruyu sor.</p>
        ) : null}
        {conversation.map((message, messageIndex) => (
          <div key={messageIndex} className={`bubble ${message.role === "user" ? "me" : "them"}`}>
            {message.content}
          </div>
        ))}
        {pendingQuestion ? (
          <>
            <div className="bubble me">{pendingQuestion}</div>
            <div className="bubble them typing" aria-label="Yanıt bekleniyor">
              <span />
              <span />
              <span />
            </div>
          </>
        ) : null}
      </div>

      {prompts.length && !loading ? (
        <div className="prompt-chips">
          {prompts.slice(0, 3).map((prompt) => (
            <button key={prompt} type="button" className="prompt-chip" onClick={() => ask(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="ask-bar"
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
      >
        <input
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder={`${character.name || "Şüpheliye"} sor...`}
          maxLength={1000}
          disabled={loading}
          aria-label="Soru"
        />
        <button
          type="submit"
          className="ds-btn ds-btn-primary send-btn"
          disabled={loading || !question.trim()}
          aria-label="Sor"
        >
          <SendIcon size={14} />
        </button>
      </form>
    </div>
  );
}

function Objectives({
  nextStep,
  seenCount,
  mediaCount,
  questionedCount,
  characterCount,
  hints,
  onUseHint,
  loading,
  notes,
  onNotes,
  pinnedItems,
  onOpenEvidence,
  onAccuse,
}) {
  const [confirmHint, setConfirmHint] = useState(false);
  const hintsLeft = Math.max(0, MAX_HINTS - hints.length);

  return (
    <div className="inspector-panel objectives" data-tour="objectives">
      <div className="next-step">
        <TargetIcon size={16} />
        <p>{nextStep}</p>
      </div>

      <ul className="checklist">
        <li className={seenCount >= mediaCount && mediaCount > 0 ? "done" : ""}>
          <span className="check">{seenCount >= mediaCount && mediaCount > 0 ? <CheckIcon size={12} /> : null}</span>
          Delilleri incele
          <em>
            {seenCount}/{mediaCount}
          </em>
        </li>
        <li className={questionedCount >= characterCount && characterCount > 0 ? "done" : ""}>
          <span className="check">
            {questionedCount >= characterCount && characterCount > 0 ? <CheckIcon size={12} /> : null}
          </span>
          Şüphelileri sorgula
          <em>
            {questionedCount}/{characterCount}
          </em>
        </li>
        <li>
          <span className="check" />
          <button type="button" className="link-btn" onClick={onAccuse}>
            Suçluyu göster
          </button>
        </li>
      </ul>

      <div className="block">
        <div className="block-head">
          <h4>İpuçları</h4>
          <span>{hintsLeft} hak</span>
        </div>
        {hints.map((hint, hintIndex) => (
          <div key={hint.id || hintIndex} className="hint-card">
            <LightbulbIcon size={14} />
            <p>{hint.content || hint.text}</p>
          </div>
        ))}
        {hintsLeft > 0 ? (
          confirmHint ? (
            <div className="confirm-row">
              <span>Bir yıldız kaybedebilirsin.</span>
              <button
                type="button"
                className="ds-btn ds-btn-primary ds-btn-sm"
                disabled={loading}
                onClick={async () => {
                  await onUseHint();
                  setConfirmHint(false);
                }}
              >
                Al
              </button>
              <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => setConfirmHint(false)}>
                Vazgeç
              </button>
            </div>
          ) : (
            <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={() => setConfirmHint(true)}>
              <LightbulbIcon size={14} />
              İpucu al
            </button>
          )
        ) : null}
      </div>

      {pinnedItems.length ? (
        <div className="block">
          <div className="block-head">
            <h4>İğnelenenler</h4>
          </div>
          <div className="pinned-list">
            {pinnedItems.map((item) => (
              <button key={item.id} type="button" className="pinned-chip" onClick={() => onOpenEvidence(item.id)}>
                <PinIcon size={12} filled />
                {item.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="block">
        <div className="block-head">
          <h4>Notlar</h4>
        </div>
        <textarea
          className="notes"
          value={notes}
          onChange={(event) => onNotes(event.target.value)}
          placeholder="Çelişkileri, saatleri yaz..."
          rows={4}
        />
      </div>
    </div>
  );
}

export default function Investigation({
  sessionId,
  scenario,
  characters,
  media,
  relationsByCharacter,
  conversations,
  question,
  onQuestionChange,
  onAsk,
  hints,
  onUseHint,
  loading,
  onAccuse,
  onExit,
}) {
  const { progress, markSeen, togglePinned, setSuspicion, setNotes } = useCaseProgress(sessionId);
  const [inspector, setInspector] = useState({ mode: "objectives", id: "" });
  const [tourOpen, setTourOpen] = useState(() => !readTourDone());

  const seenCount = media.filter((item) => progress.seen.includes(item.id)).length;
  const questionedIds = characters
    .filter((character) => (conversations[character.id] || []).length > 0)
    .map((character) => character.id);
  const nextStep = getNextStep({
    seenCount,
    mediaCount: media.length,
    questionedCount: questionedIds.length,
    characterCount: characters.length,
  });

  const evidenceIndex = media.findIndex((item) => item.id === inspector.id);
  const activeEvidence = inspector.mode === "evidence" ? media[evidenceIndex] : null;
  const suspectIndex = characters.findIndex((character) => character.id === inspector.id);
  const activeSuspect = inspector.mode === "suspect" ? characters[suspectIndex] : null;
  const sheetOpen = Boolean(activeEvidence || activeSuspect);

  function openEvidence(id) {
    markSeen(id);
    setInspector({ mode: "evidence", id });
  }

  function stepEvidence(delta) {
    if (!media.length) return;
    const nextIndex = (evidenceIndex + delta + media.length) % media.length;
    openEvidence(media[nextIndex].id);
  }

  function openSuspect(id) {
    setInspector({ mode: "suspect", id });
  }

  function closeInspector() {
    setInspector({ mode: "objectives", id: "" });
  }

  function finishTour() {
    setTourOpen(false);
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {
      // Tour simply shows again next time.
    }
  }

  return (
    <div className="investigation">
      <header className="hud">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Dosyalara dön">
          <ArrowLeftIcon size={16} />
        </button>
        <div className="hud-title">
          <strong>{scenario.title}</strong>
          <span className="hud-progress">
            Delil {seenCount}/{media.length} · Sorgu {questionedIds.length}/{characters.length} · İpucu{" "}
            {hints.length}/{MAX_HINTS}
          </span>
        </div>
        <button type="button" className="icon-btn" onClick={() => setTourOpen(true)} aria-label="Nasıl oynanır">
          <HelpCircleIcon size={16} />
        </button>
        <button type="button" className="ds-btn ds-btn-primary accuse-btn" onClick={onAccuse} data-tour="accuse">
          <TargetIcon size={14} />
          Suçla
        </button>
      </header>

      <div className="workspace">
        <div className="board">
          <div className="next-step mobile-next">
            <TargetIcon size={16} />
            <p>{nextStep}</p>
          </div>

          <section data-tour="suspects" aria-label="Şüpheliler">
            <div className="section-head">
              <h2>Şüpheliler</h2>
            </div>
            <div className="lineup lineup-board">
              {characters.map((character, index) => (
                <button
                  key={character.id}
                  type="button"
                  className={`lineup-btn ${activeSuspect?.id === character.id ? "active" : ""}`}
                  onClick={() => openSuspect(character.id)}
                >
                  <Mugshot
                    character={character}
                    index={index}
                    suspicion={progress.suspicion[character.id] || 0}
                    done={questionedIds.includes(character.id)}
                  />
                  <SuspicionDots level={progress.suspicion[character.id] || 0} />
                </button>
              ))}
            </div>
          </section>

          <section data-tour="evidence" aria-label="Deliller">
            <div className="section-head">
              <h2>Deliller</h2>
            </div>
            <div className="evidence-grid">
              {media.map((item) => {
                const seen = progress.seen.includes(item.id);
                const pinned = progress.pinned.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`evidence-card ${seen ? "seen" : "unseen"} ${
                      activeEvidence?.id === item.id ? "active" : ""
                    }`}
                    onClick={() => openEvidence(item.id)}
                  >
                    <span className="evidence-type">
                      <EvidenceIcon type={item.type} size={14} />
                      {item.type || "Belge"}
                    </span>
                    <strong>{item.title}</strong>
                    {pinned ? <PinIcon size={14} filled className="evidence-pin" /> : null}
                    {!seen ? <span className="new-dot" aria-label="Okunmadı" /> : null}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className={`inspector ${sheetOpen ? "sheet-open" : ""}`}>
          {activeEvidence ? (
            <EvidenceViewer
              item={activeEvidence}
              index={evidenceIndex}
              total={media.length}
              pinned={progress.pinned.includes(activeEvidence.id)}
              onTogglePin={() => togglePinned(activeEvidence.id)}
              onPrev={() => stepEvidence(-1)}
              onNext={() => stepEvidence(1)}
              onClose={closeInspector}
            />
          ) : activeSuspect ? (
            <InterrogationRoom
              key={activeSuspect.id}
              character={activeSuspect}
              index={suspectIndex}
              relations={relationsByCharacter[activeSuspect.id] || []}
              conversation={conversations[activeSuspect.id] || []}
              suspicion={progress.suspicion[activeSuspect.id] || 0}
              onSuspicion={(level) => setSuspicion(activeSuspect.id, level)}
              question={question}
              onQuestionChange={onQuestionChange}
              onAsk={onAsk}
              loading={loading}
              onClose={closeInspector}
            />
          ) : null}

          <div className={sheetOpen ? "objectives-wrap hidden-when-sheet" : "objectives-wrap"}>
            <Objectives
              nextStep={nextStep}
              seenCount={seenCount}
              mediaCount={media.length}
              questionedCount={questionedIds.length}
              characterCount={characters.length}
              hints={hints}
              onUseHint={onUseHint}
              loading={loading}
              notes={progress.notes}
              onNotes={setNotes}
              pinnedItems={media.filter((item) => progress.pinned.includes(item.id))}
              onOpenEvidence={openEvidence}
              onAccuse={onAccuse}
            />
          </div>
        </aside>
      </div>

      {tourOpen ? <CoachTour steps={TOUR_STEPS} onDone={finishTour} /> : null}
    </div>
  );
}
