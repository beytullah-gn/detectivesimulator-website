// Renders spoken evidence from audio.cjs with Microsoft neural Turkish voices (edge-tts) and ffmpeg effects.
// Usage: EDGE_TTS_BIN=/path/to/edge-tts node scripts/case-media/render-audio.cjs [filter]   (needs ffmpeg)
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const clips = require("./audio.cjs");

const OUT_DIR = path.join(__dirname, "..", "..", "public", "case-media");
const WORK_DIR = fs.mkdtempSync(path.join(process.env.CASE_MEDIA_TMP || os.tmpdir(), "case-audio-"));
const EDGE_TTS = process.env.EDGE_TTS_BIN || "edge-tts";

// Two Turkish neural voices; small rate/pitch offsets keep characters apart.
const VOICES = {
  komiser: { voice: "tr-TR-EmelNeural", rate: "-6%", pitch: "-6Hz" },
  female: { voice: "tr-TR-EmelNeural", rate: "+4%", pitch: "+0Hz" },
  female2: { voice: "tr-TR-EmelNeural", rate: "-2%", pitch: "+8Hz" },
  male: { voice: "tr-TR-AhmetNeural", rate: "+2%", pitch: "+0Hz" },
  male2: { voice: "tr-TR-AhmetNeural", rate: "-8%", pitch: "-10Hz" },
};

const FX = {
  radio: { chain: "highpass=f=300,lowpass=f=3400,acompressor=threshold=0.1:ratio=4", noise: "white:0.008" },
  phone: { chain: "highpass=f=250,lowpass=f=3800,acompressor=threshold=0.12:ratio=3", noise: "pink:0.003" },
  voicemail: { chain: "highpass=f=250,lowpass=f=3800,acompressor=threshold=0.12:ratio=3", noise: "pink:0.004" },
  recorder: { chain: "highpass=f=90,lowpass=f=9000", noise: "brown:0.008" },
  briefing: { chain: "highpass=f=60,aecho=0.8:0.4:30:0.08", noise: "brown:0.002" },
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
  const mp3 = `${file}.mp3`;
  const args = ["--voice", voice.voice, `--rate=${voice.rate}`, `--pitch=${voice.pitch}`, "--text", text, "--write-media", mp3];
  // The speech service sometimes returns no audio; retry with a growing pause.
  for (let attempt = 1; ; attempt += 1) {
    try {
      run(EDGE_TTS, args);
      break;
    } catch (error) {
      if (attempt >= 5) throw error;
      console.warn(`retrying ${speaker} voice (attempt ${attempt + 1})`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, attempt * 2000);
    }
  }
  run("ffmpeg", ["-y", "-i", mp3, "-ar", "44100", "-ac", "1", file]);
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
    "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "80k",
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
