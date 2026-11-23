"use strict";

const scene = document.querySelector("#scene");
const art = scene.getContext("2d");
const background = document.createElement("canvas");
background.width = scene.width;
background.height = scene.height;

function oval(x, y, width, height, color, angle = 0) {
  art.beginPath();
  art.ellipse(x, y, width, height, angle, 0, Math.PI * 2);
  art.fillStyle = color;
  art.fill();
}

function box(x, y, width, height, radius, color) {
  art.beginPath();
  art.roundRect(x, y, width, height, radius);
  art.fillStyle = color;
  art.fill();
}

function shape(color, draw) {
  art.beginPath();
  draw();
  art.closePath();
  art.fillStyle = color;
  art.fill();
}

function stroke(color, width, draw) {
  art.beginPath();
  draw();
  art.lineCap = "round";
  art.lineJoin = "round";
  art.strokeStyle = color;
  art.lineWidth = width;
  art.stroke();
}

function paintRoom() {
  art.fillStyle = "#f6d7ac";
  art.fillRect(0, 0, 960, 405);
  art.fillStyle = "#d29172";
  art.fillRect(0, 403, 960, 137);
  box(0, 391, 960, 16, 0, "#e7ac88");

  // Window light, with a darker inset so the moving silhouettes stay readable.
  box(74, 65, 287, 209, 18, "#daac82");
  box(65, 55, 287, 209, 18, "#ffedc9");
  art.save();
  art.beginPath();
  art.roundRect(79, 69, 259, 181, 10);
  art.clip();
  art.fillStyle = "#a8cee0";
  art.fillRect(79, 69, 259, 181);
  oval(146, 110, 28, 28, "#ffe5a4");
  oval(262, 115, 31, 9, "#d9e9e4");
  oval(294, 117, 24, 7, "#d9e9e4");
  oval(116, 255, 117, 76, "#76a88e", -.15);
  oval(261, 270, 128, 95, "#a9bb8a", .25);
  oval(355, 256, 99, 60, "#86a485");
  stroke("#d1d49a", 2, () => {
    art.moveTo(264, 216); art.quadraticCurveTo(285, 199, 306, 213);
    art.moveTo(137, 221); art.quadraticCurveTo(151, 208, 170, 207);
  });
  art.restore();
  box(201, 65, 12, 190, 4, "#ffedc9");
  box(75, 151, 268, 11, 3, "#ffedc9");
  box(57, 255, 306, 13, 5, "#fff1d4");
  shape("#ffffff26", () => {
    art.moveTo(94, 268); art.lineTo(210, 268);
    art.lineTo(452, 403); art.lineTo(303, 403);
  });

  // A framed print and a leafy plant balance the quieter right side.
  box(743, 84, 110, 125, 6, "#e3b58f");
  box(737, 78, 110, 125, 6, "#a56454");
  box(745, 86, 94, 109, 4, "#ffebc7");
  oval(798, 122, 17, 17, "#e39478");
  shape("#b6bc93", () => {
    art.moveTo(752, 182); art.lineTo(780, 134); art.lineTo(811, 181);
  });
  shape("#748a7a", () => {
    art.moveTo(774, 184); art.lineTo(814, 145); art.lineTo(832, 185);
  });
  for (const [x, y, angle] of [[873, 335, -.9], [907, 328, .85], [891, 295, -.2], [920, 355, .75], [864, 367, -1]]) {
    stroke("#536f56", 4, () => { art.moveTo(893, 410); art.quadraticCurveTo(890, y + 33, x, y); });
    oval(x, y, 12, 31, x % 2 === 0 ? "#79956d" : "#56775e", angle);
  }
  shape("#b96e66", () => {
    art.moveTo(856, 405); art.lineTo(931, 405);
    art.lineTo(919, 468); art.quadraticCurveTo(893, 478, 869, 468);
  });
  box(851, 399, 85, 15, 5, "#ce8d7a");

  oval(617, 499, 283, 30, "#a95f68");
  oval(617, 496, 271, 24, "#c57b83");
  oval(617, 496, 227, 19, "#dc8e88");
  oval(617, 496, 180, 14, "#e6a093");
  oval(470, 480, 318, 13, "#63314428");

  shape("#875047", () => {
    art.moveTo(177, 354); art.lineTo(205, 354); art.lineTo(185, 488); art.lineTo(160, 488);
  });
  shape("#875047", () => {
    art.moveTo(728, 354); art.lineTo(755, 354); art.lineTo(773, 488); art.lineTo(748, 488);
  });
  box(146, 346, 628, 31, 9, "#aa6555");
  box(137, 335, 646, 21, 10, "#e1996d");
  box(153, 336, 610, 5, 2, "#ffd1a2");
}

function ease(value) {
  const progress = Math.max(0, Math.min(1, value));
  return progress * progress * (3 - 2 * progress);
}

function paintCat(seconds) {
  const extension = ease((seconds - 1.45) / 1.03) * (1 - ease((seconds - 2.9) / .48));
  const lookAtCamera = ease((seconds - 5.52) / .62);
  const surprise = ease((seconds - 4.02) / .18) * (1 - ease((seconds - 6.58) / .32));
  const headX = 503 - 22 * lookAtCamera;
  const headY = 240 + 8 * extension - 10 * surprise;
  const blink = (seconds > .55 && seconds < .67) || (seconds > 7.0 && seconds < 7.12);
  const fur = "#28253b";
  const darkFur = "#201d32";
  const highlight = "#49405d";

  oval(431, 336, 129, 9, "#a9624e6b");
  stroke(darkFur, 21, () => {
    art.moveTo(347, 314);
    art.bezierCurveTo(306, 316, 278, 320, 270, 294);
    art.quadraticCurveTo(260, 256, 236, 271 + Math.sin(seconds * 2.7) * 13);
  });
  oval(416, 298, 94, 42, fur, -.08);
  oval(393, 289, 51, 17, highlight, -.2);
  oval(458, 326, 65, 11, darkFur);
  const pawX = 511 + 120 * extension;
  stroke(fur, 24, () => {
    art.moveTo(465, 296);
    art.quadraticCurveTo(493, 314 - 9 * extension, pawX, 320 - 16 * extension);
  });
  oval(pawX, 320 - 16 * extension, 15, 12, highlight);

  art.save();
  art.translate(headX, headY);
  shape(fur, () => {
    art.moveTo(-56, -13); art.lineTo(-57, -73);
    art.quadraticCurveTo(-56, -84, -47, -77); art.lineTo(-14, -46);
    art.lineTo(25, -47); art.lineTo(53, -78);
    art.quadraticCurveTo(60, -86, 61, -74); art.lineTo(66, -14);
  });
  shape("#a86480", () => {
    art.moveTo(-49, -35); art.lineTo(-50, -68); art.lineTo(-27, -44);
  });
  shape("#a86480", () => {
    art.moveTo(37, -45); art.lineTo(55, -70); art.lineTo(58, -35);
  });
  oval(3, 0, 65, 54, fur);
  oval(-38, -18, 11, 4, highlight, -.44);

  const gaze = 8 * (1 - lookAtCamera);
  const eyeY = -2 + 3 * surprise;
  for (const eyeX of [-19, 30]) {
    if (blink) {
      stroke("#f0d888", 2.5, () => {
        art.moveTo(eyeX - 8, eyeY); art.quadraticCurveTo(eyeX, eyeY + 3, eyeX + 8, eyeY);
      });
    } else {
      oval(eyeX, eyeY, 13, 12 + 4 * surprise, "#f5d988");
      oval(eyeX + gaze * .65, eyeY + 1, 4 + 3 * surprise, 8 + 3 * surprise, darkFur);
      oval(eyeX + gaze * .65 - 1, eyeY - 3, 2, 2, "#fff4d7");
    }
  }

  const nose = 8 + gaze;
  shape("#df8d9f", () => {
    art.moveTo(nose - 5, 16); art.quadraticCurveTo(nose, 12, nose + 5, 16);
    art.quadraticCurveTo(nose, 23, nose - 5, 16);
  });
  stroke("#e5b3bd", 1.7, () => {
    art.moveTo(nose, 21); art.quadraticCurveTo(nose - 4, 26, nose - 8, 22);
    art.moveTo(nose, 21); art.quadraticCurveTo(nose + 5, 26, nose + 8, 22);
  });
  stroke("#d5b6c7", 1.4, () => {
    art.moveTo(-32, 17); art.lineTo(-62, 12);
    art.moveTo(-33, 25); art.lineTo(-60, 28);
    art.moveTo(39, 17); art.lineTo(69, 13);
    art.moveTo(40, 25); art.lineTo(68, 29);
  });
  art.restore();
}

function paintCup(seconds) {
  const slide = Math.max(0, Math.min(1, (seconds - 2.6) / 1.03));
  const fall = Math.max(0, Math.min(1, (seconds - 3.63) / .71));
  const bounce = Math.sin(Math.PI * ease((seconds - 4.34) / .39));
  const x = 652 + 127 * slide * slide + 38 * fall + 12 * ease((seconds - 4.34) / .5);
  const y = 334 - 8 * slide + 153 * fall * fall - 23 * bounce;
  const rotation = .18 * slide + 1.24 * fall + .13 * ease((seconds - 4.34) / .43);
  const onRug = fall > .68;
  if (onRug) oval(x - 10, 497, 35, 5, "#692d4859");
  else if (fall === 0) oval(x, 336, 34, 5, "#a4514660");
  art.save();
  art.translate(x, y);
  art.rotate(rotation);
  stroke("#a54c3e", 7, () => {
    art.moveTo(23, -52); art.bezierCurveTo(54, -62, 53, -22, 24, -22);
  });
  stroke("#ef885e", 4, () => {
    art.moveTo(26, -53); art.bezierCurveTo(53, -59, 51, -24, 25, -24);
  });
  shape("#e77655", () => {
    art.moveTo(-28, -60); art.lineTo(29, -60); art.lineTo(23, -10);
    art.quadraticCurveTo(19, 1, 0, 0); art.quadraticCurveTo(-20, 1, -23, -9);
  });
  stroke("#ffaf7a", 3, () => { art.moveTo(-20, -47); art.lineTo(-16, -18); });
  oval(0, -60, 29, 8, "#ffb17d");
  oval(0, -60, 24, 5, "#a75046");
  oval(1, -59, 20, 3, "#e98b66");
  art.restore();

  const impact = (seconds - 4.34) / .27;
  if (impact >= 0 && impact < 1) {
    art.save();
    art.globalAlpha = 1 - impact;
    stroke("#fff0bd", 4, () => {
      art.moveTo(x + 22, 479); art.lineTo(x + 35 + impact * 10, 468 - impact * 9);
      art.moveTo(x + 28, 489); art.lineTo(x + 43 + impact * 10, 487);
    });
    art.restore();
  }
}

paintRoom();
background.getContext("2d").drawImage(scene, 0, 0);

function paintScene(seconds) {
  art.drawImage(background, 0, 0);
  paintCat(seconds);
  paintCup(seconds);
}
