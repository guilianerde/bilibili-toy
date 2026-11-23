"use strict";

const maximumClipLength = 8;
const sounds = [
  { id: "brake", duration: .72, name: "急刹车", icon: "≋", tone: "brake" },
  { id: "boom", duration: 1.26, name: "爆炸", icon: "✸", tone: "boom" },
  { id: "clap", duration: 1.42, name: "鼓掌", icon: "✦", tone: "clap" },
  { id: "sting", duration: 1.15, name: "恐怖弦", icon: "⌁", tone: "sting" },
  { id: "ding", duration: .87, name: "叮一声", icon: "◇", tone: "ding" },
  { id: "meow", duration: .75, name: "猫叫", icon: "∿", tone: "meow" },
  { id: "whoosh", duration: .46, name: "掠过", icon: "↝", tone: "brake" },
  { id: "thud", duration: .39, name: "重击", icon: "◆", tone: "boom" },
  { id: "tick", duration: .19, name: "轻响", icon: "·", tone: "ding" },
  { id: "riser", duration: .9, name: "悬念上扬", icon: "⤴", tone: "meow" },
  { id: "pulse", duration: .76, name: "心跳", icon: "⌁", tone: "sting" },
  { id: "sparkle", duration: .62, name: "闪光", icon: "✦", tone: "clap" }
];
const soundById = new Map(sounds.map(sound => [sound.id, sound]));
const sampleSounds = sounds.slice(0, 6).map(sound => sound.id);

function makeSound(context, { id, duration }) {
  const rate = context.sampleRate;
  const buffer = context.createBuffer(1, Math.ceil(duration * rate), rate);
  const samples = buffer.getChannelData(0);
  const tau = Math.PI * 2;
  let low = 0;
  let floor = 0;
  let phase = 0;
  const claps = id === "clap" ? Array.from({ length: 37 }, (_, index) => (
    index * .035 + Math.random() * .075
  )) : [];

  for (let index = 0; index < samples.length; index++) {
    const time = index / rate;
    const noise = Math.random() * 2 - 1;
    low += (noise - low) * .11;
    floor += (noise - floor) * .012;
    let signal;

    switch (id) {
      case "brake": {
        const pitch = 1450 - 790 * time + 85 * Math.sin(time * 49);
        phase += tau * pitch / rate;
        const pressure = Math.sin(Math.PI * time / duration) ** .62;
        signal = (Math.sin(phase) * .29 + Math.sin(phase * 1.51) * .12 + (noise - low) * .14) * pressure;
        break;
      }
      case "boom":
        signal = Math.sin(tau * (83 * time - 17 * time ** 2)) * Math.exp(-time * 7) * .61
          + (low + floor * 3) * Math.exp(-time * 4.5) * .62
          + noise * Math.exp(-time * 26) * .25;
        break;
      case "clap": {
        let hits = 0;
        for (const offset of claps) {
          const age = time - offset;
          if (age >= 0 && age < .081) {
            hits += Math.exp(-age * 57) * (1 - Math.exp(-age * 470)) * (1 - offset / 1.55);
          }
        }
        signal = (noise - low * .62) * Math.min(.53, hits * .63)
          + floor * .12 * Math.sin(Math.PI * time / duration);
        break;
      }
      case "sting": {
        phase += tau * (395 + 210 * time + 10 * Math.sin(time * 42)) / rate;
        const tremolo = .76 + .24 * Math.sin(time * 61);
        signal = (Math.sin(phase) + .57 * Math.sin(1.066 * phase) + .39 * Math.sin(1.42 * phase)
          + .3 * Math.sin(phase * 2)) * tremolo * Math.exp(-time * 2.9) * .27 + low * .07;
        break;
      }
      case "ding":
        signal = Math.sin(tau * 1320 * time) * Math.exp(-time * 7) * .52
          + Math.sin(tau * 2260 * time) * Math.exp(-time * 17) * .21
          + Math.sin(tau * 3540 * time) * Math.exp(-time * 31) * .12;
        break;
      case "meow": {
        const progress = time / duration;
        const pitch = 389 + 241 * Math.sin(Math.PI * progress ** .65) - 153 * progress + 9 * Math.sin(time * 52);
        phase += tau * pitch / rate;
        const vowels = .2 + .8 * Math.sin(Math.PI * progress);
        signal = (Math.sin(phase) * .25 + Math.sin(phase * 2) * .17 * vowels
          + Math.sin(phase * 3) * .19 + Math.sin(phase * 4) * .084
          + low * .07) * Math.sin(Math.PI * progress) ** .65;
        break;
      }
      case "whoosh": {
        const air = Math.sin(Math.PI * time / duration) ** 2;
        signal = (noise * (time / duration) * .19 + low * .64) * air;
        break;
      }
      case "thud":
        signal = (Math.sin(tau * (120 * time - 110 * time ** 2)) * .65 + low * .32)
          * Math.exp(-time * 15) + noise * .18 * Math.exp(-time * 49);
        break;
      case "tick":
        signal = (Math.sin(tau * 1790 * time) * .2 + noise * .4) * Math.exp(-time * 34);
        break;
      case "riser": {
        phase += tau * (155 + 520 * (time / duration) ** 2) / rate;
        const rise = time / duration;
        signal = (Math.sin(phase) * .32 + Math.sin(phase * 1.7) * .16 + low * .22) * rise;
        break;
      }
      case "pulse": {
        const beat = time < .19 ? time : time - .19;
        const strength = time < .19 ? .65 : .43;
        signal = (Math.sin(tau * (76 * beat - 24 * beat ** 2)) + low * .3)
          * strength * (1 - Math.exp(-beat * 150)) * Math.exp(-beat * 23);
        break;
      }
      case "sparkle":
        signal = [1320, 1650, 1980].reduce((sum, pitch, note) => {
          const age = time - note * .068;
          return age < 0 ? sum : sum + Math.sin(tau * pitch * age) * Math.exp(-age * 14) * .21;
        }, 0);
        break;
    }
    const fade = Math.min(1, time * 400, (duration - time) * 38);
    samples[index] = Math.tanh(signal) * fade * .88;
  }
  return buffer;
}

const pads = [...document.querySelectorAll(".pad")];
const padForSound = new Map();
const flashTimers = new Map();
const mainAction = document.querySelector("#main-action");
const retry = document.querySelector("#retry");
const modeLabel = document.querySelector("#mode-label");
const padHint = document.querySelector("#pad-hint");
const hint = document.querySelector("#hint");
const clock = document.querySelector("#clock");
const fill = document.querySelector("#fill");
const markers = document.querySelector("#markers");
const chooseVideo = document.querySelector("#choose-video");
const videoFile = document.querySelector("#video-file");
const useSample = document.querySelector("#use-sample");
const importStatus = document.querySelector("#import-status");
const imported = document.querySelector("#imported");
const clipTitle = document.querySelector("#clip-title");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let audio;
let limiter;
let soundBank;
const activeSources = new Set();
let mode = "idle";
let take = [];
let origin = 0;
let nextCue = 0;
let frame = 0;
let previewStart = performance.now();
let clipLength = maximumClipLength;
let activeVideo;
let activeUrl;
let busy = false;

function loadSoundboard(ids) {
  padForSound.clear();
  pads.forEach((pad, index) => {
    clearTimeout(flashTimers.get(pad));
    const sound = soundById.get(ids[index]);
    pad.className = "pad " + sound.tone;
    pad.dataset.sound = sound.id;
    pad.querySelector(".icon").textContent = sound.icon;
    pad.querySelector(".pad-name").textContent = sound.name;
    padForSound.set(sound.id, pad);
  });
  flashTimers.clear();
}

async function getAudio() {
  if (!audio) {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) throw new Error("Web Audio unavailable");
    audio = new AudioEngine();
    limiter = audio.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.ratio.value = 5;
    limiter.connect(audio.destination);
  }
  if (audio.state !== "running") await audio.resume();
  if (!soundBank) {
    soundBank = new Map(sounds.map(sound => [sound.id, makeSound(audio, sound)]));
  }
}

function playSound(id, start) {
  const source = audio.createBufferSource();
  source.buffer = soundBank.get(id);
  source.connect(limiter);
  activeSources.add(source);
  source.onended = () => {
    source.disconnect();
    activeSources.delete(source);
  };
  source.start(start);
}

function silence() {
  for (const source of activeSources) source.stop();
  activeSources.clear();
}

function flash(id) {
  const pad = padForSound.get(id);
  clearTimeout(flashTimers.get(pad));
  pad.classList.add("hit");
  flashTimers.set(pad, setTimeout(() => {
    pad.classList.remove("hit");
    flashTimers.delete(pad);
  }, 175));
}

function showAudioError() {
  hint.classList.add("error");
  hint.textContent = "声音没能开启。请检查设备音频后，再点一次按钮。";
}

function canChooseClip() {
  return !busy && mode !== "recording" && mode !== "replay";
}

function updateControls() {
  chooseVideo.disabled = !canChooseClip();
  useSample.disabled = !canChooseClip();
  videoFile.disabled = !canChooseClip();
  mainAction.disabled = !canChooseClip();
  retry.disabled = !canChooseClip();
  pads.forEach(pad => { pad.disabled = busy || mode === "replay"; });
}

function setMode(next) {
  mode = next;
  document.body.dataset.mode = next;
  hint.classList.remove("error");
  const recording = next === "recording";
  const replaying = next === "replay";
  const hasTake = next === "ready" && take.length > 0;
  const modes = { idle: "循环预览", recording: "录制中", ready: "本轮配音", replay: "回放中" };
  modeLabel.textContent = modes[next];
  padHint.textContent = recording ? "按键会被录下来" : replaying ? "正在播放你的音效" : "点一下就能试听";
  retry.hidden = !hasTake;
  updateControls();
  if (next === "idle") {
    mainAction.textContent = "开始配音 · " + Number(clipLength.toFixed(2)) + " 秒";
    hint.textContent = activeVideo ? "开始后视频会从头播放，想加音效时就按键。" : "试试杯子一落地，就按「爆炸」。";
  } else if (recording) {
    mainAction.textContent = "正在录制…";
    hint.textContent = "看画面，需要音效时就按键。";
  } else if (replaying) {
    mainAction.textContent = "正在回放…";
    hint.textContent = "音效会在你刚才按键的时刻响起。";
  } else if (hasTake) {
    mainAction.textContent = "回放我的配音";
    hint.textContent = "已录下 " + take.length + " 个音效。";
  } else if (next === "ready") {
    mainAction.textContent = "再录一遍";
    hint.textContent = "这轮没有按音效键。再试一次，想配声时就按一下。";
  }
}

function updatePicture(seconds) {
  if (!activeVideo) paintScene(seconds);
  fill.style.transform = "scaleX(" + (seconds / clipLength) + ")";
  clock.textContent = seconds.toFixed(1) + " / " + clipLength.toFixed(1);
}

function queueFrame() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function tick(now) {
  frame = 0;
  if (mode === "idle") {
    if (activeVideo) {
      if (!busy && (activeVideo.ended || activeVideo.currentTime >= clipLength)) {
        activeVideo.currentTime = 0;
        playPreview();
      }
      updatePicture(Math.min(activeVideo.currentTime, clipLength));
    } else {
      updatePicture(((now - previewStart) / 1000) % clipLength);
    }
    if (!reduceMotion.matches) queueFrame();
    return;
  }
  if (mode === "ready") return;

  const seconds = Math.max(0, activeVideo ? activeVideo.currentTime : audio.currentTime - origin);
  updatePicture(Math.min(seconds, clipLength));
  if (mode === "replay") {
    while (nextCue < take.length && take[nextCue].time <= seconds) {
      const cue = take[nextCue];
      if (activeVideo) playSound(cue.id, audio.currentTime + .006);
      flash(cue.id);
      nextCue++;
    }
  }
  if (seconds >= clipLength || activeVideo?.ended) {
    activeVideo?.pause();
    setMode("ready");
  } else {
    queueFrame();
  }
}

async function beginRound(next) {
  if (!canChooseClip()) return;
  busy = true;
  updateControls();
  try {
    await getAudio();
  } catch {
    busy = false;
    updateControls();
    showAudioError();
    return;
  }

  silence();
  if (activeVideo) {
    try {
      activeVideo.pause();
      await seekVideo(activeVideo, 0);
      await activeVideo.play();
    } catch {
      busy = false;
      updateControls();
      hint.classList.add("error");
      hint.textContent = "没能从头播放这段视频，请再试一次。";
      return;
    }
  }

  if (next === "recording") {
    take = [];
    markers.replaceChildren();
  }
  origin = audio.currentTime + (!activeVideo && next === "replay" ? .045 : 0);
  nextCue = 0;
  if (!activeVideo && next === "replay") {
    for (const cue of take) playSound(cue.id, origin + cue.time);
  }
  busy = false;
  setMode(next);
  updatePicture(0);
  queueFrame();
}

async function hitPad(id) {
  if (busy || mode === "replay") return;
  try {
    await getAudio();
  } catch {
    showAudioError();
    return;
  }
  if (busy || mode === "replay" || !padForSound.has(id)) return;

  const start = audio.currentTime + .006;
  const time = activeVideo ? activeVideo.currentTime : start - origin;
  playSound(id, start);
  flash(id);
  if (mode !== "recording" || time >= clipLength) return;

  take.push({ id, time });
  const dot = document.createElement("span");
  dot.className = "marker " + soundById.get(id).tone;
  dot.style.setProperty("--at", (time / clipLength * 100) + "%");
  markers.append(dot);
}

function setImportStatus(message, failed = false) {
  importStatus.hidden = !message;
  importStatus.classList.toggle("error", failed);
  importStatus.textContent = message;
}

function clearVideo() {
  silence();
  if (!activeVideo) return;
  releaseVideo(activeVideo);
  URL.revokeObjectURL(activeUrl);
  activeVideo = undefined;
  activeUrl = undefined;
  imported.replaceChildren();
}

function playPreview() {
  activeVideo.play().catch(() => {
    if (mode === "idle") modeLabel.textContent = "等待播放";
  });
}

function resetClip(length, ids, title) {
  clipLength = length;
  clipTitle.textContent = title;
  useSample.hidden = !activeVideo;
  imported.hidden = !activeVideo;
  scene.hidden = Boolean(activeVideo);
  take = [];
  markers.replaceChildren();
  loadSoundboard(ids);
  previewStart = performance.now();
  setMode("idle");
  updatePicture(0);
  if (!reduceMotion.matches) {
    if (activeVideo) playPreview();
    queueFrame();
  } else if (activeVideo) {
    modeLabel.textContent = "已导入";
  }
}

async function loadVideo(file) {
  if (!canChooseClip()) return;
  busy = true;
  updateControls();
  setImportStatus("正在读视频并生成音效台…");
  const url = URL.createObjectURL(file);
  let result;
  try {
    result = await inspectVideo(url, maximumClipLength);
  } catch {
    URL.revokeObjectURL(url);
    setImportStatus("读不了这段视频。试试能在浏览器里播放的 MP4 或 WebM。", true);
  } finally {
    busy = false;
    updateControls();
  }
  if (!result) return;

  clearVideo();
  activeVideo = result.video;
  activeUrl = url;
  imported.replaceChildren(activeVideo);
  resetClip(result.length, result.ids, file.name);
  const span = result.video.duration > maximumClipLength ? "前 " : "";
  setImportStatus("已分析" + span + Number(result.length.toFixed(2)) + " 秒。"
    + result.description + "。原声已静音。");
}

pads.forEach(pad => {
  pad.addEventListener("pointerdown", event => {
    if (event.button === 0) hitPad(pad.dataset.sound);
  });
  pad.addEventListener("click", event => {
    if (event.detail === 0) hitPad(pad.dataset.sound);
  });
});
document.addEventListener("keydown", event => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  const index = "123456".indexOf(event.key);
  if (event.key.length !== 1 || index === -1) return;
  event.preventDefault();
  hitPad(pads[index].dataset.sound);
});
mainAction.addEventListener("click", () => {
  beginRound(mode === "ready" && take.length ? "replay" : "recording");
});
retry.addEventListener("click", () => beginRound("recording"));
chooseVideo.addEventListener("click", () => videoFile.click());
videoFile.addEventListener("change", () => {
  const file = videoFile.files[0];
  videoFile.value = "";
  if (file) loadVideo(file);
});
useSample.addEventListener("click", () => {
  clearVideo();
  setImportStatus("");
  resetClip(maximumClipLength, sampleSounds, "猫和杯子");
});

resetClip(maximumClipLength, sampleSounds, "猫和杯子");
