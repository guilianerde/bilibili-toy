"use strict";

function waitForVideo(video, event, start, timeout = 8000) {
  return new Promise((resolve, reject) => {
    function finish(error) {
      clearTimeout(timer);
      video.removeEventListener(event, onReady);
      video.removeEventListener("error", onError);
      if (error) reject(error);
      else resolve();
    }
    function onReady() { finish(); }
    function onError() { finish(new Error("Could not read the video")); }

    const timer = setTimeout(onError, timeout);
    video.addEventListener(event, onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
    try {
      start();
    } catch (error) {
      finish(error);
    }
  });
}

function seekVideo(video, time) {
  if (Math.abs(video.currentTime - time) < .001 && !video.seeking) return Promise.resolve();
  return waitForVideo(video, "seeked", () => { video.currentTime = time; }, 2500);
}

function releaseVideo(video) {
  video.pause();
  video.removeAttribute("src");
  video.load();
}

function compareFrames(before, after) {
  let total = 0;
  let changed = 0;
  for (let index = 0; index < before.length; index += 4) {
    const difference = Math.abs(before[index] - after[index])
      + Math.abs(before[index + 1] - after[index + 1])
      + Math.abs(before[index + 2] - after[index + 2]);
    total += difference;
    if (difference > 66) changed++;
  }
  return { mean: total / (before.length / 4 * 765), changed: changed / (before.length / 4) };
}

function recommendSounds(changes, brightness) {
  if (changes.some(change => change.mean > .16 && change.changed > .64)) {
    return {
      description: "画面有明显切换，配了转场、重击和提示音",
      ids: ["whoosh", "thud", "tick", "riser", "boom", "sparkle"]
    };
  }
  const moving = changes.filter(change => change.mean > .028 && change.changed > .085);
  if (moving.length > changes.length * .25) {
    return {
      description: "连续动作较多，配了掠过、刹车和冲击音",
      ids: ["whoosh", "thud", "brake", "boom", "riser", "clap"]
    };
  }
  if (moving.length) {
    return {
      description: "画面有几处动作，配了轻响、掠过和重击音",
      ids: ["tick", "whoosh", "thud", "ding", "pulse", "clap"]
    };
  }
  if (brightness < .3) {
    return {
      description: "画面较暗且动作少，配了心跳、恐怖弦和悬念音",
      ids: ["pulse", "sting", "tick", "thud", "riser", "ding"]
    };
  }
  return {
    description: "画面动作较少，配了偏轻的提示音和点缀音",
    ids: ["tick", "sparkle", "ding", "pulse", "whoosh", "clap"]
  };
}

async function inspectVideo(url, maximumLength) {
  const video = document.createElement("video");
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
    await waitForVideo(video, "loadeddata", () => { video.src = url; });
    if (!video.videoWidth || !Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("Missing a playable picture");
    }

    const length = Math.min(maximumLength, video.duration);
    const frameCount = Math.max(2, Math.ceil(length * 6));
    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = 48;
    frameCanvas.height = 27;
    const frameContext = frameCanvas.getContext("2d", { willReadFrequently: true });
    let previous;
    let brightness = 0;
    const changes = [];

    for (let index = 0; index < frameCount; index++) {
      const target = index / (frameCount - 1) * Math.max(0, length - .04);
      await seekVideo(video, target);
      frameContext.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height);
      const pixels = frameContext.getImageData(0, 0, frameCanvas.width, frameCanvas.height).data;
      let luminance = 0;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        luminance += .2126 * pixels[offset] + .7152 * pixels[offset + 1] + .0722 * pixels[offset + 2];
      }
      brightness += luminance / (pixels.length / 4 * 255);
      if (previous) changes.push(compareFrames(previous, pixels));
      previous = pixels;
    }

    await seekVideo(video, 0);
    return { video, length, ...recommendSounds(changes, brightness / frameCount) };
  } catch (error) {
    releaseVideo(video);
    throw error;
  }
}
