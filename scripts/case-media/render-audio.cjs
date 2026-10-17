// Renders spoken evidence from audio.cjs with macOS `say` (Turkish voice) and ffmpeg effects.
// Usage: node scripts/case-media/render-audio.cjs [filter]   (requires macOS `say` with the Yelda voice and ffmpeg with rubberband)
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const clips = require("./audio.cjs");

const OUT_DIR = path.join(__dirname, "..", "..", "public", "case-media");
const WORK_DIR = fs.mkdtempSync(path.join(process.env.CASE_MEDIA_TMP || os.tmpdir(), "case-audio-"));

// Male voices are the Turkish female voice pitched down; the formant shift makes them read as male.
const VOICES = {
  komiser: { rate: 166, pitch: 0.94 },
  female: { rate: 178, pitch: 1.0 },
  female2: { rate: 172, pitch: 1.07 },
  male: { rate: 176, pitch: 0.79 },
  male2: { rate: 168, pitch: 0.72 },
};

const FX = {
  radio: { chain: "highpass=f=420,lowpass=f=2700,acrusher=bits=9:mix=0.3,acompressor=threshold=0.1:ratio=6", noise: "white:0.018" },
  phone: { chain: "highpass=f=320,lowpass=f=3300,acompressor=threshold=0.12:ratio=4", noise: "pink:0.006" },
  voicemail: { chain: "highpass=f=320,lowpass=f=3300,acompressor=threshold=0.12:ratio=4", noise: "pink:0.008" },
  recorder: { chain: "highpass=f=120,lowpass=f=7000,acompressor=threshold=0.15:ratio=3", noise: "brown:0.02" },
  briefing: { chain: "highpass=f=80,lowpass=f=11000,aecho=0.8:0.5:35:0.12", noise: "brown:0.006" },
};

function run(command, args) {
  execFileSync(command, args, { stdio: ["ignore", "ignore", "pipe"] });
}

function tone(file, frequency, seconds) {
  run("ffmpeg", ["-y", "-f", "lavfi", "-i", `sine=frequency=${frequency}:duration=${seconds}`, "-af", "volume=0.25", "-ar", "44100", "-ac", "1", file]);
}

function silence(file, seconds) {
  run("ffmpeg", ["-y", "-f", "lavfi", "-i", `anullsrc=r=44100:cl=mono`, "-t", String(seconds), file]);
}

function squelch(file) {
  run("ffmpeg", ["-y", "-f", "lavfi", "-i", "anoisesrc=color=white:amplitude=0.35:duration=0.14", "-af", "highpass=f=900,afade=t=out:st=0.08:d=0.06", "-ar", "44100", "-ac", "1", file]);
}

function speak(file, speaker, text) {
  const voice = VOICES[speaker];
  const aiff = `${file}.aiff`;
  run("say", ["-v", "Yelda", "-r", String(voice.rate), "-o", aiff, text]);
  run("ffmpeg", ["-y", "-i", aiff, "-af", `rubberband=pitch=${voice.pitch}`, "-ar", "44100", "-ac", "1", file]);
}

function render(name, clip) {
  const pieces = [];
  const piece = (suffix) => path.join(WORK_DIR, `${pieces.length}-${suffix}.wav`);
  const add = (file) => pieces.push(file);

  if (clip.fx === "voicemail") {
    const beep = piece("beep");
    tone(beep, 1000, 0.45);
    add(beep);
    const gap = piece("gap");
    silence(gap, 0.35);
    add(gap);
  }

  clip.lines.forEach(([speaker, text], index) => {
    if (clip.fx === "radio") {
      const click = piece("click");
      tone(click, 1750, 0.07);
      add(click);
    }
    const voice = piece("voice");
    speak(voice, speaker, text);
    add(voice);
    if (clip.fx === "radio") {
      const tail = piece("squelch");
      squelch(tail);
      add(tail);
    }
    if (index < clip.lines.length - 1) {
      const gap = piece("gap");
      silence(gap, clip.fx === "radio" ? 0.45 : 0.35);
      add(gap);
    }
  });

  const list = path.join(WORK_DIR, "list.txt");
  fs.writeFileSync(list, pieces.map((file) => `file '${file}'`).join("\n"));
  const joined = path.join(WORK_DIR, "joined.wav");
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", joined]);

  const { chain, noise } = FX[clip.fx];
  const [color, amplitude] = noise.split(":");
  const target = path.join(OUT_DIR, name);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  run("ffmpeg", [
    "-y",
    "-i", joined,
    "-f", "lavfi", "-i", `anoisesrc=color=${color}:amplitude=${amplitude}`,
    "-filter_complex",
    `[0]apad=pad_dur=0.6,${chain}[v];[1]highpass=f=60[n];[v][n]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-18:TP=-2,afade=t=in:d=0.05`,
    "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "64k",
    target,
  ]);
  pieces.length = 0;
}

const filter = process.argv[2] || "";
let count = 0;
for (const [name, clip] of Object.entries(clips)) {
  if (filter && !name.includes(filter)) continue;
  render(name, clip);
  count += 1;
  console.log(`rendered ${name}`);
}
fs.rmSync(WORK_DIR, { recursive: true, force: true });
console.log(`${count} audio clips rendered`);
