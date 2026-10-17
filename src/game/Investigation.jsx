"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  FileTextIcon,
  HelpCircleIcon,
  LightbulbIcon,
  MicIcon,
  PinIcon,
  SendIcon,
  TargetIcon,
} from "../components/icons";
import { formatCharacterName } from "../utils/formatters";
import { playSfx } from "./audio/soundscape";
import { MAX_HINTS } from "./career";
import CoachTour from "./CoachTour";
import { AudioPlayer, MediaBlock, isAudioUrl, isImageUrl } from "./media";
import { EvidenceIcon, Mugshot, SUSPICION_LABELS, SuspicionDots } from "./pieces";
import { useCaseProgress } from "./useCaseProgress";

const TOUR_KEY = "ds_tour_done_v1";

const TOUR_STEPS = [
  { target: "casefile", title: "Dosyayı oku", text: "Olayın hikâyesi burada. Komiserin brifingini dinleyebilirsin." },
  { target: "evidence", title: "Delilleri incele", text: "Belgeler, fotoğraflar ve ses kayıtları. Önemli olanı iğnele." },
  { target: "suspects", title: "Şüphelileri sorgula", text: "İstediğini sor ya da bir delili masaya koy. Çelişkileri yakala." },
  { target: "objectives", title: "Görevini takip et", text: "Sıradaki adım, ipuçları ve notların hep burada." },
  { target: "accuse", title: "Suçluyu göster", text: "Hazır olduğunda suçla. İpucusuz çözüm 3 yıldız." },
];

const EVIDENCE_TAG = /^\[Delil: ([^\]]+)\]\s*/;

function readTourDone() {
  try {
    return localStorage.getItem(TOUR_KEY) === "1";
  } catch {
    return true;
  }
}

function getNextStep({ storyRead, seenCount, mediaCount, questionedCount, characterCount, presentedCount }) {
  if (!storyRead) return "Önce vaka dosyasını oku.";
  if (seenCount < Math.min(3, mediaCount)) return "Delilleri incelemeye başla.";
  if (questionedCount === 0) return "Bir şüpheliyi sorgula; ifadesini delillerle karşılaştır.";
  if (presentedCount === 0) return "Bir şüpheliye delil göster ve tepkisini izle.";
  if (seenCount < mediaCount) return "Bakmadığın deliller var.";
  if (questionedCount < characterCount) return "Herkesi dinlemeden karar verme.";
  return "Tablo netleşti. Hazırsan suçla.";
}

function Paragraphs({ text }) {
  return (text || "")
    .split(/\n+/)
    .filter(Boolean)
    .map((paragraph, index) => <p key={index}>{paragraph}</p>);
}

function CaseFileViewer({ scenario, onBack }) {
  return (
    <div className="viewer">
      <div className="viewer-head">
        <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={onBack}>
          <ArrowLeftIcon size={14} />
          Pano
        </button>
      </div>
      <article className="paper paper-story">
        <span className="paper-type">
          <ClipboardIcon size={14} />
          Vaka dosyası
        </span>
        <h3>{scenario.title}</h3>
        {scenario.briefing_audio_url ? (
          <AudioPlayer src={scenario.briefing_audio_url} label="Komiserin brifingi" />
        ) : null}
        <Paragraphs text={scenario.story || scenario.description} />
      </article>
    </div>
  );
}

function EvidenceViewer({ item, index, total, pinned, onTogglePin, onPrev, onNext, onBack }) {
  const audio = isAudioUrl(item.media_url);
  const [showTranscript, setShowTranscript] = useState(!audio);

  return (
    <div className="viewer">
      <div className="viewer-head">
        <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={onBack}>
          <ArrowLeftIcon size={14} />
          Pano
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
          <EvidenceIcon type={item.type} media={item.media_url} size={14} />
          {item.type || "Belge"}
        </span>
        <h3>{item.title}</h3>
        {item.description ? <p className="paper-lede">{item.description}</p> : null}
        <MediaBlock url={item.media_url} title={item.title} label="Kaydı dinle" />
        {audio ? (
          <button type="button" className="link-btn transcript-toggle" onClick={() => setShowTranscript((value) => !value)}>
            {showTranscript ? "Dökümü gizle" : "Dökümü göster"}
          </button>
        ) : null}
        {showTranscript ? <Paragraphs text={item.content} /> : null}
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

function ChatMessage({ message }) {
  if (message.role !== "user") {
    return <div className="bubble them">{message.content}</div>;
  }
  const match = message.content.match(EVIDENCE_TAG);
  if (!match) return <div className="bubble me">{message.content}</div>;
  return (
    <div className="bubble me">
      <span className="bubble-evidence">
        <PinIcon size={12} filled />
        {match[1]}
      </span>
      {message.content.replace(EVIDENCE_TAG, "")}
    </div>
  );
}

function InterrogationRoom({
  character,
  index,
  relations,
  conversation,
  evidence,
  suspicion,
  onSuspicion,
  question,
  onQuestionChange,
  onAsk,
  loading,
  onBack,
}) {
  const [pending, setPending] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [silent, setSilent] = useState(false);
  const logRef = useRef(null);
  const askedSet = new Set(conversation.filter((m) => m.role === "user").map((m) => m.content));
  const prompts = (Array.isArray(character.question_prompts) ? character.question_prompts : []).filter(
    (prompt) => !askedSet.has(prompt)
  );

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [conversation.length, pending]);

  // Typewriter ticks while the suspect is "answering".
  useEffect(() => {
    if (!pending) return undefined;
    const timer = window.setInterval(() => {
      if (Math.random() < 0.7) playSfx("type");
    }, 170);
    return () => window.clearInterval(timer);
  }, [pending]);

  async function ask(text, evidenceItem) {
    const trimmed = (text ?? question).trim();
    if ((!trimmed && !evidenceItem) || loading) return;
    setPickerOpen(false);
    playSfx(evidenceItem ? "pin" : "send");
    setPending({
      text: evidenceItem ? `[Delil: ${evidenceItem.title}] ${trimmed || "Bunu açıkla."}` : trimmed,
    });
    setSilent(false);
    const answered = await onAsk(null, character.id, trimmed, evidenceItem?.id);
    setPending(null);
    if (answered === false) {
      playSfx("error");
      setSilent(true);
    }
  }

  return (
    <div className="viewer room">
      <div className="viewer-head">
        <button type="button" className="ds-btn ds-btn-ghost ds-btn-sm" onClick={onBack}>
          <ArrowLeftIcon size={14} />
          Pano
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
            onClick={() => {
              playSfx(level === 2 ? "pin" : "click");
              onSuspicion(level);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="chat-log" ref={logRef} aria-live="polite">
        {conversation.length === 0 && !pending ? <p className="empty-line">İlk soruyu sor ya da bir delil göster.</p> : null}
        {conversation.map((message, messageIndex) => (
          <ChatMessage key={messageIndex} message={message} />
        ))}
        {silent && !pending ? (
          <p className="room-silent">{character.name || "Şüpheli"} şu an konuşmuyor. Biraz sonra tekrar dene.</p>
        ) : null}
        {pending ? (
          <>
            <ChatMessage message={{ role: "user", content: pending.text }} />
            <div className="bubble them typing" aria-label="Yanıt bekleniyor">
              <span />
              <span />
              <span />
            </div>
          </>
        ) : null}
      </div>

      {prompts.length && !loading && !pickerOpen ? (
        <div className="prompt-chips">
          {prompts.slice(0, 3).map((prompt) => (
            <button key={prompt} type="button" className="prompt-chip" onClick={() => ask(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      {pickerOpen ? (
        <div className="evidence-picker" role="listbox" aria-label="Gösterilecek delil">
          {evidence.map((item) => (
            <button key={item.id} type="button" role="option" aria-selected="false" onClick={() => ask(question, item)}>
              <EvidenceIcon type={item.type} media={item.media_url} size={14} />
              {item.title}
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
        <button
          type="button"
          className={`ds-btn ds-btn-secondary present-btn ${pickerOpen ? "active" : ""}`}
          onClick={() => {
            playSfx("click");
            setPickerOpen((open) => !open);
          }}
          disabled={loading || evidence.length === 0}
          aria-expanded={pickerOpen}
          title="Delil göster"
        >
          <PinIcon size={14} />
          <span className="hide-mobile">Delil göster</span>
        </button>
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

function HintCard({ hint }) {
  const media = hint.mediaUrl || hint.media_url;
  return (
    <div className="hint-card">
      <LightbulbIcon size={14} />
      <div className="hint-body">
        {hint.title ? <strong>{hint.title}</strong> : null}
        {media && isImageUrl(media) ? <MediaBlock url={media} title={hint.title} /> : null}
        {media && isAudioUrl(media) ? <AudioPlayer src={media} label="Mesajı dinle" compact /> : null}
        <p>{hint.content || hint.text}</p>
      </div>
    </div>
  );
}

function Objectives({
  nextStep,
  storyRead,
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
  const tasks = [
    { label: "Vaka dosyasını oku", done: storyRead },
    { label: "Delilleri incele", done: seenCount >= mediaCount && mediaCount > 0, count: `${seenCount}/${mediaCount}` },
    {
      label: "Şüphelileri sorgula",
      done: questionedCount >= characterCount && characterCount > 0,
      count: `${questionedCount}/${characterCount}`,
    },
  ];

  return (
    <div className="inspector-panel objectives" data-tour="objectives">
      <div className="next-step">
        <TargetIcon size={16} />
        <p>{nextStep}</p>
      </div>

      <ul className="checklist">
        {tasks.map((task) => (
          <li key={task.label} className={task.done ? "done" : ""}>
            <span className="check">{task.done ? <CheckIcon size={12} /> : null}</span>
            {task.label}
            {task.count ? <em>{task.count}</em> : null}
          </li>
        ))}
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
          <HintCard key={hint.id || hintIndex} hint={hint} />
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
                  playSfx("hint");
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
            <button
              type="button"
              className="ds-btn ds-btn-secondary ds-btn-sm"
              onClick={() => {
                playSfx("click");
                setConfirmHint(true);
              }}
            >
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

function EvidenceCard({ item, seen, pinned, onOpen }) {
  const image = isImageUrl(item.media_url);
  const audio = isAudioUrl(item.media_url);
  return (
    <button
      type="button"
      className={`evidence-card ${seen ? "seen" : "unseen"} ${image ? "has-photo" : ""} ${pinned ? "pinned" : ""}`}
      onClick={onOpen}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="evidence-thumb" src={item.media_url} alt="" loading="lazy" />
      ) : null}
      <span className="evidence-type">
        <EvidenceIcon type={item.type} media={item.media_url} size={14} />
        {item.type || "Belge"}
      </span>
      <strong>{item.title}</strong>
      {audio ? <span className="evidence-wave" aria-hidden="true" /> : null}
      {pinned ? (
        <span className="evidence-pin">
          <PinIcon size={12} filled />
          Önemli
        </span>
      ) : null}
      {!seen ? <span className="new-dot" aria-label="İncelenmedi" /> : null}
    </button>
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
  // A fresh investigation opens on the case file so the story is the first thing the player sees.
  const [view, setView] = useState(() =>
    progress.seen.includes("story") ? { mode: "board", id: "" } : { mode: "story", id: "" }
  );
  const [tourOpen, setTourOpen] = useState(() => !readTourDone());

  const storyRead = progress.seen.includes("story");
  const seenCount = media.filter((item) => progress.seen.includes(item.id)).length;
  const questionedIds = characters
    .filter((character) => (conversations[character.id] || []).length > 0)
    .map((character) => character.id);
  const presentedCount = Object.values(conversations)
    .flat()
    .filter((message) => message.role === "user" && EVIDENCE_TAG.test(message.content)).length;
  const nextStep = getNextStep({
    storyRead,
    seenCount,
    mediaCount: media.length,
    questionedCount: questionedIds.length,
    characterCount: characters.length,
    presentedCount,
  });

  // Each viewer starts at the top of the page instead of the board's scroll position.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.mode, view.id]);

  const evidenceIndex = media.findIndex((item) => item.id === view.id);
  const activeEvidence = view.mode === "evidence" ? media[evidenceIndex] : null;
  const suspectIndex = characters.findIndex((character) => character.id === view.id);
  const activeSuspect = view.mode === "suspect" ? characters[suspectIndex] : null;
  const viewerOpen = view.mode !== "board";

  useEffect(() => {
    if (view.mode === "story") markSeen("story");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.mode]);

  function openStory() {
    markSeen("story");
    playSfx("paper");
    setView({ mode: "story", id: "" });
  }

  function openEvidence(id) {
    markSeen(id);
    playSfx("paper");
    setView({ mode: "evidence", id });
  }

  function stepEvidence(delta) {
    if (!media.length) return;
    const nextIndex = (evidenceIndex + delta + media.length) % media.length;
    openEvidence(media[nextIndex].id);
  }

  function backToBoard() {
    if (view.mode !== "board") playSfx("back");
    setView({ mode: "board", id: "" });
  }

  function openTour() {
    backToBoard();
    setTourOpen(true);
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
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            if (viewerOpen) {
              backToBoard();
            } else {
              onExit();
            }
          }}
          aria-label={viewerOpen ? "Panoya dön" : "Dosyalara dön"}
          title={viewerOpen ? "Panoya dön" : "Dosyalara dön"}
        >
          <ArrowLeftIcon size={16} />
        </button>
        <div className="hud-title">
          <strong>{scenario.title}</strong>
          <span className="hud-progress">
            Delil {seenCount}/{media.length} · Sorgu {questionedIds.length}/{characters.length} · İpucu{" "}
            {hints.length}/{MAX_HINTS}
          </span>
        </div>
        <button type="button" className="icon-btn" onClick={openTour} aria-label="Nasıl oynanır">
          <HelpCircleIcon size={16} />
        </button>
        <button
          type="button"
          className="ds-btn ds-btn-primary accuse-btn"
          onClick={() => {
            playSfx("accuse");
            onAccuse();
          }}
          data-tour="accuse"
        >
          <TargetIcon size={14} />
          Suçla
        </button>
      </header>

      <div className="workspace">
        <main className={`stage ${viewerOpen ? "viewer-open" : ""}`}>
          {view.mode === "story" ? (
            <CaseFileViewer scenario={scenario} onBack={backToBoard} />
          ) : activeEvidence ? (
            <EvidenceViewer
              key={activeEvidence.id}
              item={activeEvidence}
              index={evidenceIndex}
              total={media.length}
              pinned={progress.pinned.includes(activeEvidence.id)}
              onTogglePin={() => {
                playSfx("pin");
                togglePinned(activeEvidence.id);
              }}
              onPrev={() => stepEvidence(-1)}
              onNext={() => stepEvidence(1)}
              onBack={backToBoard}
            />
          ) : activeSuspect ? (
            <InterrogationRoom
              key={activeSuspect.id}
              character={activeSuspect}
              index={suspectIndex}
              relations={relationsByCharacter[activeSuspect.id] || []}
              conversation={conversations[activeSuspect.id] || []}
              evidence={media}
              suspicion={progress.suspicion[activeSuspect.id] || 0}
              onSuspicion={(level) => setSuspicion(activeSuspect.id, level)}
              question={question}
              onQuestionChange={onQuestionChange}
              onAsk={onAsk}
              loading={loading}
              onBack={backToBoard}
            />
          ) : null}

          <div className="board">
            <div className="next-step mobile-next">
              <TargetIcon size={16} />
              <p>{nextStep}</p>
            </div>

            <button
              type="button"
              className={`casefile-card ${storyRead ? "seen" : "unread"}`}
              onClick={openStory}
              data-tour="casefile"
            >
              <span className="casefile-tab">Vaka dosyası</span>
              <span className="casefile-body">
                <strong>{scenario.title}</strong>
                <small>{scenario.teaser || scenario.description}</small>
              </span>
              <span className="casefile-cta">
                {scenario.briefing_audio_url ? <MicIcon size={14} /> : <FileTextIcon size={14} />}
                {storyRead ? "Tekrar oku" : "Dosyayı aç"}
              </span>
              {!storyRead ? <span className="casefile-ribbon">Yeni</span> : null}
            </button>

            <section data-tour="suspects" aria-label="Şüpheliler">
              <div className="section-head">
                <h2>Şüpheliler</h2>
              </div>
              <div className="lineup lineup-board">
                {characters.map((character, index) => (
                  <button
                    key={character.id}
                    type="button"
                    className="lineup-btn"
                    onClick={() => {
                      playSfx("open");
                      setView({ mode: "suspect", id: character.id });
                    }}
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
                <span>
                  {seenCount}/{media.length}
                </span>
              </div>
              <div className="evidence-grid">
                {media.map((item) => (
                  <EvidenceCard
                    key={item.id}
                    item={item}
                    seen={progress.seen.includes(item.id)}
                    pinned={progress.pinned.includes(item.id)}
                    onOpen={() => openEvidence(item.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>

        <aside className="inspector">
          <Objectives
            nextStep={nextStep}
            storyRead={storyRead}
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
        </aside>
      </div>

      {tourOpen && !viewerOpen ? <CoachTour steps={TOUR_STEPS} onDone={finishTour} /> : null}
    </div>
  );
}
