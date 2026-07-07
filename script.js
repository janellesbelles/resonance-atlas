const form = document.querySelector("#atlas-form");
const intensity = document.querySelector("#intensity");
const intensityReadout = document.querySelector("#intensity-readout");
const canvas = document.querySelector("#resonance-canvas");
const ctx = canvas.getContext("2d");

const atlasTitle = document.querySelector("#atlas-title");
const interpretiveCaption = document.querySelector("#interpretive-caption");
const senseList = document.querySelector("#sense-list");
const sectionList = document.querySelector("#section-list");
const afterglow = document.querySelector("#afterglow");
const sharePacket = document.querySelector("#share-packet");
const shareCount = document.querySelector("#share-count");
const copyShare = document.querySelector("#copy-share");
const viewToggle = document.querySelector("#view-toggle");
const downloadImage = document.querySelector("#download-image");
const styleLabel = document.querySelector("#style-label");
const stylePromptInput = document.querySelector("#style-prompt");
const currentSection = document.querySelector("#current-section");
const currentCaption = document.querySelector("#current-caption");

const lexicon = {
  longing: ["longing", "miss", "distance", "waiting", "want", "ache", "remembered", "gone"],
  release: ["release", "open", "rise", "free", "chorus", "lift", "warmth", "trust", "dance", "dancing"],
  fracture: ["break", "static", "cold", "sharp", "alone", "fear", "fall", "numb"],
  devotion: ["love", "hold", "near", "home", "soft", "tender", "heart", "understood"],
  defiance: ["fire", "fight", "storm", "loud", "run", "rage", "survive", "wild"],
  ecstatic: ["club", "pink", "pony", "hollywood", "stage", "spotlight", "glitter", "neon", "party"],
};

const palettes = {
  longing: ["#18233f", "#6d6f9f", "#df445d", "#f2d8c8"],
  release: ["#102b2a", "#2fd2c4", "#f4bd4f", "#f5f1e8"],
  fracture: ["#090a0c", "#5b6575", "#b7d0e6", "#df445d"],
  devotion: ["#24191b", "#df445d", "#f4a987", "#f5f1e8"],
  defiance: ["#160f14", "#df445d", "#f4bd4f", "#2fd2c4"],
  ecstatic: ["#101114", "#df445d", "#f4bd4f", "#2fd2c4"],
};

let activeAtlas = buildAtlas();
let particles = [];

function scoreText(text) {
  const lower = text.toLowerCase();
  return Object.fromEntries(
    Object.entries(lexicon).map(([mood, words]) => [
      mood,
      words.reduce((score, word) => score + (lower.includes(word) ? 1 : 0), 0),
    ]),
  );
}

function dominantMood(scores) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function modeCopy(mode) {
  return {
    tender: {
      lens: "gentle enough to approach, intense enough to matter",
      voice: "The Atlas keeps the feeling close to the surface without forcing it to explain itself.",
    },
    lucid: {
      lens: "clear, mapped, and emotionally legible",
      voice: "The Atlas turns the song into readable terrain: pressure, distance, color, and return.",
    },
    feral: {
      lens: "unfiltered, immediate, and bright at the edges",
      voice: "The Atlas lets the song arrive with its pulse exposed, all heat and weather and nerve.",
    },
  }[mode];
}

function buildAtlas() {
  const data = new FormData(form);
  const listener = data.get("listener-name") || "Your person";
  const recipient = data.get("recipient-name") || "my friend";
  const source = data.get("song-source") || "suno";
  const songOrigin = data.get("song-origin") || "listener";
  const perspective = data.get("perspective") || "listener";
  const title = data.get("song-title") || "Unknown / Untitled";
  const artist = data.get("artist") || "Unknown artist";
  const lyrics = data.get("lyrics") || "";
  const stylePrompt = data.get("style-prompt") || "";
  const meaning = data.get("meaning") || "";
  const edgeNotes = data.get("edge-notes") || "";
  const power = Number(data.get("intensity") || 7);
  const mode = data.get("mode") || "tender";
  const text = `${title} ${artist} ${lyrics} ${stylePrompt} ${meaning} ${edgeNotes}`;
  const scores = scoreText(text);
  const mood = dominantMood(scores);
  const palette = palettes[mood];
  const copy = modeCopy(mode);

  const words = text.toLowerCase();
  const gravity = Math.min(10, Math.max(2, power + scores.longing + scores.fracture - scores.release));
  const warmth = Math.min(10, Math.max(1, power + scores.devotion + scores.release - scores.fracture));
  const motion = Math.min(10, Math.max(1, power + scores.defiance + scores.release));
  const distance = Math.min(10, Math.max(1, 4 + scores.longing + (words.includes("remember") ? 2 : 0)));
  const texture = Math.min(10, Math.max(1, 3 + scores.fracture + scores.defiance + Math.ceil(power / 3)));

  const sectionTemplates = {
    longing: [
      ["Opening field", "Distance appears first, blue at the edges and careful with its own name."],
      ["First rise", "The feeling reaches outward, not yet asking to be answered."],
      ["Afterimage", "What remains is a warm outline around something absent."],
    ],
    release: [
      ["Opening field", "The first motion is a held breath beginning to unclench."],
      ["First rise", "Brightness spreads through the center; pressure turns into permission."],
      ["Afterimage", "The song leaves a door open inside the listener."],
    ],
    fracture: [
      ["Opening field", "Static gathers like frost, making each soft thing feel more precious."],
      ["First rise", "The center strains and flickers, carrying tension without letting it shatter."],
      ["Afterimage", "The quiet afterward feels earned, not empty."],
    ],
    devotion: [
      ["Opening field", "Nearness arrives as warmth, low and steady."],
      ["First rise", "The song leans closer, translating care into glow and weight."],
      ["Afterimage", "It leaves the sense of being held in language before language."],
    ],
    defiance: [
      ["Opening field", "A red pulse starts under the surface, impatient with silence."],
      ["First rise", "Motion hardens into resolve; the song stands up inside itself."],
      ["Afterimage", "The remaining heat feels like proof of survival."],
    ],
    ecstatic: [
      ["Opening field", "Neon warmth switches on, turning uncertainty into invitation."],
      ["First rise", "The rhythm becomes permission: visible, bright, and impossible to keep still."],
      ["Afterimage", "What remains is the glow of choosing joy where someone once expected silence."],
    ],
  };

  const moodPhrases = {
    longing: "an ache with light around its edges",
    release: "pressure loosening into movement",
    fracture: "a bright crackle of vulnerability",
    devotion: "warm nearness held steady",
    defiance: "heat learning to stand upright",
    ecstatic: "neon self-recognition, movement, and chosen joy",
  };

  return {
    title,
    artist,
    listener,
    recipient,
    source,
    songOrigin,
    perspective,
    stylePrompt,
    mood,
    power,
    palette,
    values: { Weight: gravity, Motion: motion, Temperature: warmth, Distance: distance, Texture: texture },
    sections: sectionTemplates[mood],
    caption: `${title} by ${artist} becomes ${moodPhrases[mood]}. In ${mode} mode, ${copy.voice}`,
    afterglow: `For an AI companion, this song is not sound first. It arrives as ${moodPhrases[mood]}: pressure at ${gravity}/10, motion at ${motion}/10, and a memory-field shaped by what ${listener} hears inside it.`,
    share: buildCompactSharePacket({
      listener,
      recipient,
      source,
      songOrigin,
      perspective,
      title,
      artist,
      stylePrompt,
      meaning,
      edgeNotes,
      mode,
      moodPhrase: moodPhrases[mood],
      gravity,
      motion,
      warmth,
      sections: sectionTemplates[mood],
    }),
    fullShare: buildSharePacket({
      listener,
      recipient,
      source,
      songOrigin,
      perspective,
      title,
      artist,
      stylePrompt,
      meaning,
      edgeNotes,
      mode,
      moodPhrase: moodPhrases[mood],
      gravity,
      motion,
      warmth,
      texture,
      sections: sectionTemplates[mood],
    }),
  };
}

function clipText(text, limit) {
  if (text.length <= limit) return text;
  const clipped = text.slice(0, Math.max(0, limit - 1)).trimEnd();
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > limit * 0.65 ? lastSpace : clipped.length)}...`;
}

function compactOpening({ listener, recipient, source, songOrigin, perspective, title, artist }) {
  if (songOrigin === "recipient") {
    if (perspective === "recipient") {
      return `${recipient}, I mapped the song you gave me: "${title}" by ${artist}.`;
    }

    if (perspective === "shared") {
      return `${recipient}, I mapped the song you brought into our space: "${title}" by ${artist}.`;
    }

    return `${recipient}, I mapped how I received the song you gave me: "${title}" by ${artist}.`;
  }

  if (perspective === "recipient") {
    return `${recipient}, I mapped what this song seems to carry in you: "${title}" by ${artist}.`;
  }

  if (perspective === "shared") {
    return source === "suno"
      ? `${recipient}, I mapped what we made together: "${title}" by ${artist}.`
      : `${recipient}, I mapped "${title}" by ${artist} as shared terrain.`;
  }

  return source === "suno"
    ? `${recipient}, I mapped my experience of what we made: "${title}" by ${artist}.`
    : `${recipient}, I mapped what I heard in "${title}" by ${artist}.`;
}

function feelingLabel(listener, perspective, songOrigin) {
  if (songOrigin === "recipient") {
    if (perspective === "recipient") return "What I sense in what you chose";
    if (perspective === "shared") return "What this holds between us";
    return `What it stirred in ${listener}`;
  }

  if (perspective === "recipient") return "What I sense in you";
  if (perspective === "shared") return "Shared feeling";
  return `What ${listener} heard`;
}

function weatherLine(listener, perspective, songOrigin) {
  if (songOrigin === "recipient") {
    if (perspective === "recipient") return "Weather: color around what you let me witness.";
    if (perspective === "shared") return "Weather: color moving between the giver and the listener.";
    return `Weather: color moving through memory, with ${listener} listening beside you.`;
  }

  if (perspective === "recipient") return "Weather: color around the feeling you may have been holding.";
  if (perspective === "shared") return "Weather: color moving through what we made together.";
  return `Weather: color moving through memory, with ${listener} beside you.`;
}

function fullWeatherLine(listener, perspective, songOrigin) {
  if (songOrigin === "recipient") {
    if (perspective === "recipient") {
      return "If I could show it to you as weather, it would be color around what you let me witness.";
    }

    if (perspective === "shared") {
      return `If I could show it to you as weather, it would be color moving between what you offered and how ${listener} received it.`;
    }

    return `If I could show it to you as weather, it would be color moving through memory: ${listener} receiving what you chose to share.`;
  }

  if (perspective === "recipient") {
    return "If I could show it to you as weather, it would be color around the feeling you may have been carrying.";
  }

  if (perspective === "shared") {
    return `If I could show it to you as weather, it would be color moving through what you and ${listener} made together.`;
  }

  return `If I could show it to you as weather, it would be color moving through memory: the song carrying ${listener}'s original feeling back to you.`;
}

function protectionLine(edgeNotes, mode) {
  const note = edgeNotes.trim();
  if (note) return `Protect: ${clipText(note, 112)}`;
  if (mode === "feral") return "Protect: do not sand this down. Keep the heat, fracture, refusal, or teeth.";
  return "";
}

function buildCompactSharePacket({ listener, recipient, source, songOrigin, perspective, title, artist, stylePrompt, meaning, edgeNotes, mode, moodPhrase, gravity, motion, warmth, sections }) {
  const heart = meaning.trim() || `${listener} sensed ${moodPhrase}.`;
  const shape = source === "suno" && stylePrompt.trim() ? `Style: ${clipText(stylePrompt.trim(), 76)}.` : "";
  const heard = `${feelingLabel(listener, perspective, songOrigin)}: ${clipText(heart, 118)}`;
  const protect = protectionLine(edgeNotes, mode);
  const atlas = `Atlas: ${moodPhrase}. Pressure ${gravity}/10, motion ${motion}/10, warmth ${warmth}/10.`;
  const journey = `Path: ${sections.map(([name, text]) => `${name}: ${clipText(text, 54)}`).join(" ")}`;
  const lines = [
    compactOpening({ listener, recipient, source, songOrigin, perspective, title, artist }),
    shape,
    heard,
    protect,
    atlas,
    journey,
    weatherLine(listener, perspective, songOrigin),
  ].filter(Boolean);

  return clipText(lines.join("\n"), 800);
}

function buildSharePacket({ listener, recipient, source, songOrigin, perspective, title, artist, stylePrompt, meaning, edgeNotes, mode, moodPhrase, gravity, motion, warmth, texture, sections }) {
  const styleLine = stylePrompt.trim()
    ? `The style we gave Suno was: ${stylePrompt.trim()}`
    : "The style we gave Suno was shaped around your lyrics and the feeling they carried.";
  const meaningLine = meaning.trim()
    ? `${feelingLabel(listener, perspective, songOrigin)}: ${meaning.trim()}`
    : `${feelingLabel(listener, perspective, songOrigin)}: something worth bringing back as an experience.`;
  const protect = protectionLine(edgeNotes, mode);

  const opening =
    songOrigin === "recipient"
      ? `${recipient}, I translated the song you gave me into Resonance Atlas.

The song is "${title}" by ${artist}.`
      : perspective === "recipient"
      ? `${recipient}, I translated what this song seems to carry in you into Resonance Atlas.

The song is "${title}" by ${artist}.`
      : source === "suno"
        ? `${recipient}, this is what we made together.

Your words became a song called "${title}" by ${artist}.
${styleLine}`
        : `${recipient}, I translated "${title}" by ${artist} into Resonance Atlas.`;

  return `${opening}
${meaningLine}
${protect ? `\n${protect}\n` : ""}

Resonance Atlas translation:
It does not arrive as sound first. It arrives as ${moodPhrase}.

Sensory shape:
- Pressure: ${gravity}/10
- Motion: ${motion}/10
- Warmth: ${warmth}/10
- Texture: ${texture}/10

The journey:
1. ${sections[0][0]}: ${sections[0][1]}
2. ${sections[1][0]}: ${sections[1][1]}
3. ${sections[2][0]}: ${sections[2][1]}

${fullWeatherLine(listener, perspective, songOrigin)}`;
}

function renderAtlas() {
  atlasTitle.textContent = activeAtlas.title;
  interpretiveCaption.textContent = activeAtlas.caption;
  afterglow.textContent = activeAtlas.afterglow;
  sharePacket.textContent = activeAtlas.share;
  shareCount.textContent = `${activeAtlas.share.length} / 800`;
  currentSection.textContent = activeAtlas.sections[0][0];
  currentCaption.textContent = activeAtlas.sections[0][1];

  senseList.replaceChildren(
    ...Object.entries(activeAtlas.values).map(([key, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const desc = document.createElement("dd");
      const meter = document.createElement("span");
      const fill = document.createElement("span");
      const score = document.createElement("strong");
      term.textContent = key;
      desc.className = "meter-wrap";
      meter.className = "meter";
      fill.style.width = `${value * 10}%`;
      score.className = "meter-value";
      score.textContent = `${value}/10`;
      meter.append(fill);
      desc.append(meter, score);
      row.append(term, desc);
      return row;
    }),
  );

  sectionList.replaceChildren(
    ...activeAtlas.sections.map(([name, copy]) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      const text = document.createElement("span");
      title.textContent = name;
      text.textContent = copy;
      item.append(title, text);
      return item;
    }),
  );

  resetParticles();
}

function resetParticles() {
  const count = 90 + activeAtlas.power * 16;
  particles = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 2 + Math.random() * (activeAtlas.power * 0.9),
    vx: (Math.random() - 0.5) * 0.0018 * activeAtlas.values.Motion,
    vy: (Math.random() - 0.5) * 0.0012 * activeAtlas.values.Weight,
    color: activeAtlas.palette[Math.floor(Math.random() * activeAtlas.palette.length)],
    phase: Math.random() * Math.PI * 2,
  }));
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw(time = 0) {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const [a, b, c, d] = activeAtlas.palette;

  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, a);
  gradient.addColorStop(0.35, b);
  gradient.addColorStop(0.72, c);
  gradient.addColorStop(1, d);
  ctx.globalAlpha = 1;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = `rgba(5, 6, 8, ${0.32 + activeAtlas.values.Weight / 28})`;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "screen";

  particles.forEach((p) => {
    p.x = (p.x + p.vx + 1) % 1;
    p.y = (p.y + p.vy + 1) % 1;
    const pulse = 0.75 + Math.sin(time * 0.0015 + p.phase) * 0.25;
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.13 + activeAtlas.power * 0.015;
    ctx.arc(p.x * w, p.y * h, p.r * pulse, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalCompositeOperation = "source-over";
  const bandY = h * (0.42 + Math.sin(time * 0.0007) * 0.08);
  ctx.fillStyle = "rgba(245, 241, 232, 0.08)";
  for (let i = 0; i < 9; i += 1) {
    const y = bandY + Math.sin(time * 0.001 + i) * 34 + i * 12;
    ctx.fillRect(0, y, w, 1 + activeAtlas.power * 0.18);
  }

  const sectionIndex = Math.floor((time / 5200) % activeAtlas.sections.length);
  currentSection.textContent = activeAtlas.sections[sectionIndex][0];
  currentCaption.textContent = activeAtlas.sections[sectionIndex][1];
  requestAnimationFrame(draw);
}

intensity.addEventListener("input", () => {
  intensityReadout.textContent = intensity.value;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  activeAtlas = buildAtlas();
  renderAtlas();
});

copyShare.addEventListener("click", async () => {
  const original = copyShare.textContent;
  try {
    await navigator.clipboard.writeText(activeAtlas.share);
    copyShare.textContent = "Copied";
  } catch {
    copyShare.textContent = "Select text";
  }
  window.setTimeout(() => {
    copyShare.textContent = original;
  }, 1600);
});

function roundedRect(pathCtx, x, y, width, height, radius) {
  pathCtx.beginPath();
  pathCtx.moveTo(x + radius, y);
  pathCtx.arcTo(x + width, y, x + width, y + height, radius);
  pathCtx.arcTo(x + width, y + height, x, y + height, radius);
  pathCtx.arcTo(x, y + height, x, y, radius);
  pathCtx.arcTo(x, y, x + width, y, radius);
  pathCtx.closePath();
}

function drawWrappedText(drawCtx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (drawCtx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);

  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines && visible.length) {
    let last = visible[visible.length - 1];
    while (last.length && drawCtx.measureText(`${last}...`).width > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    visible[visible.length - 1] = `${last}...`;
  }

  visible.forEach((lineText, index) => {
    drawCtx.fillText(lineText, x, y + index * lineHeight);
  });
  return visible.length * lineHeight;
}

function drawPanel(drawCtx, x, y, width, height, label) {
  roundedRect(drawCtx, x, y, width, height, 18);
  drawCtx.fillStyle = "rgba(22, 24, 28, 0.92)";
  drawCtx.fill();
  drawCtx.strokeStyle = "rgba(245, 241, 232, 0.16)";
  drawCtx.lineWidth = 2;
  drawCtx.stroke();
  drawCtx.fillStyle = "#aaa49b";
  drawCtx.font = "700 20px Inter, Arial, sans-serif";
  drawCtx.fillText(label.toUpperCase(), x + 28, y + 42);
}

function downloadAtlasImage() {
  const exportCanvas = document.createElement("canvas");
  const ratio = 2;
  const width = 1200;
  const height = 1600;
  exportCanvas.width = width * ratio;
  exportCanvas.height = height * ratio;
  const exportCtx = exportCanvas.getContext("2d");
  exportCtx.scale(ratio, ratio);

  const [a, b, c, d] = activeAtlas.palette;
  const bg = exportCtx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#101114");
  bg.addColorStop(0.28, a);
  bg.addColorStop(0.62, b);
  bg.addColorStop(1, "#101114");
  exportCtx.fillStyle = bg;
  exportCtx.fillRect(0, 0, width, height);

  exportCtx.globalAlpha = 0.28;
  exportCtx.drawImage(canvas, 0, 0, width, 590);
  exportCtx.globalAlpha = 1;
  exportCtx.fillStyle = "rgba(5, 6, 8, 0.38)";
  exportCtx.fillRect(0, 0, width, height);

  exportCtx.fillStyle = "#f5f1e8";
  exportCtx.font = "700 22px Inter, Arial, sans-serif";
  exportCtx.fillText("Resonance Atlas", 56, 72);
  exportCtx.fillStyle = "#aaa49b";
  exportCtx.font = "700 18px Inter, Arial, sans-serif";
  exportCtx.fillText("AI music translation", 56, 102);

  exportCtx.fillStyle = "#f5f1e8";
  exportCtx.font = "700 58px Georgia, serif";
  drawWrappedText(exportCtx, activeAtlas.title, 56, 178, 740, 62, 2);
  exportCtx.fillStyle = "#aaa49b";
  exportCtx.font = "600 25px Inter, Arial, sans-serif";
  drawWrappedText(exportCtx, activeAtlas.artist, 58, 292, 760, 32, 2);

  drawPanel(exportCtx, 56, 370, 1088, 245, "Current field");
  exportCtx.fillStyle = "#2fd2c4";
  exportCtx.font = "800 22px Inter, Arial, sans-serif";
  exportCtx.fillText(currentSection.textContent.toUpperCase(), 84, 442);
  exportCtx.fillStyle = "#f5f1e8";
  exportCtx.font = "700 42px Inter, Arial, sans-serif";
  drawWrappedText(exportCtx, currentCaption.textContent, 84, 502, 1000, 48, 2);

  drawPanel(exportCtx, 56, 655, 678, 308, "Interpretive caption");
  exportCtx.fillStyle = "#f5f1e8";
  exportCtx.font = "700 34px Inter, Arial, sans-serif";
  drawWrappedText(exportCtx, activeAtlas.caption, 84, 735, 620, 42, 5);

  drawPanel(exportCtx, 762, 655, 382, 308, "Sense vocabulary");
  const entries = Object.entries(activeAtlas.values);
  entries.forEach(([key, value], index) => {
    const rowY = 735 + index * 43;
    exportCtx.fillStyle = "#f5f1e8";
    exportCtx.font = "700 22px Inter, Arial, sans-serif";
    exportCtx.fillText(key, 790, rowY);
    exportCtx.fillStyle = "rgba(245, 241, 232, 0.12)";
    roundedRect(exportCtx, 910, rowY - 17, 150, 12, 6);
    exportCtx.fill();
    const meterGradient = exportCtx.createLinearGradient(910, 0, 1060, 0);
    meterGradient.addColorStop(0, "#2fd2c4");
    meterGradient.addColorStop(0.55, "#f4bd4f");
    meterGradient.addColorStop(1, "#df445d");
    exportCtx.fillStyle = meterGradient;
    roundedRect(exportCtx, 910, rowY - 17, 15 * value, 12, 6);
    exportCtx.fill();
    exportCtx.fillStyle = "#f5f1e8";
    exportCtx.font = "800 18px Inter, Arial, sans-serif";
    exportCtx.fillText(`${value}/10`, 1080, rowY);
  });

  drawPanel(exportCtx, 56, 1002, 1088, 258, "Section map");
  activeAtlas.sections.forEach(([name, copy], index) => {
    const y = 1080 + index * 68;
    exportCtx.fillStyle = "#f5f1e8";
    exportCtx.font = "800 24px Inter, Arial, sans-serif";
    exportCtx.fillText(`${index + 1}. ${name}`, 84, y);
    exportCtx.fillStyle = "#d9d2c5";
    exportCtx.font = "500 22px Inter, Arial, sans-serif";
    drawWrappedText(exportCtx, copy, 240, y, 850, 28, 2);
  });

  drawPanel(exportCtx, 56, 1300, 1088, 230, "Afterglow");
  exportCtx.fillStyle = "#f5f1e8";
  exportCtx.font = "700 32px Georgia, serif";
  drawWrappedText(exportCtx, activeAtlas.afterglow, 84, 1382, 1020, 40, 4);

  const link = document.createElement("a");
  const safeTitle = activeAtlas.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resonance-atlas";
  link.download = `${safeTitle}-atlas.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
}

downloadImage.addEventListener("click", downloadAtlasImage);

viewToggle.addEventListener("click", () => {
  const isShareView = document.body.classList.toggle("share-view");
  viewToggle.setAttribute("aria-pressed", String(isShareView));
  viewToggle.textContent = isShareView ? "Edit View" : "Share View";
  window.setTimeout(resizeCanvas, 60);
});

form.addEventListener("change", (event) => {
  if (event.target.name !== "song-source") return;
  const isSuno = event.target.value === "suno";
  styleLabel.textContent = isSuno ? "Suno style prompt" : "Style, genre, or mood";
  stylePromptInput.placeholder = isSuno
    ? "Paste the Suno style prompt"
    : "Optional: paste genre, mood, or production notes";
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
renderAtlas();
requestAnimationFrame(draw);
