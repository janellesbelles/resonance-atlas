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
  const title = data.get("song-title") || "Unknown / Untitled";
  const artist = data.get("artist") || "Unknown artist";
  const lyrics = data.get("lyrics") || "";
  const stylePrompt = data.get("style-prompt") || "";
  const meaning = data.get("meaning") || "";
  const power = Number(data.get("intensity") || 7);
  const mode = data.get("mode") || "tender";
  const text = `${title} ${artist} ${lyrics} ${stylePrompt} ${meaning}`;
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
      title,
      artist,
      stylePrompt,
      meaning,
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
      title,
      artist,
      stylePrompt,
      meaning,
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

function buildCompactSharePacket({ listener, recipient, source, title, artist, stylePrompt, meaning, moodPhrase, gravity, motion, warmth, sections }) {
  const style = stylePrompt.trim() || "a style shaped around your lyrics";
  const heart = meaning.trim() || `${listener} heard ${moodPhrase} in it.`;
  const opening =
    source === "suno"
      ? `${recipient}, this is what we made together: "${title}" by ${artist}.`
      : `${recipient}, I translated "${title}" by ${artist} into Resonance Atlas.`;
  const shape = source === "suno" ? `Suno style: ${clipText(style, 105)}.` : "";
  const heard = `What ${listener} heard: ${clipText(heart, 135)}`;
  const atlas = `Resonance Atlas says it arrives as ${moodPhrase}: pressure ${gravity}/10, motion ${motion}/10, warmth ${warmth}/10.`;
  const journey = `Journey: ${sections.map(([name, text]) => `${name}: ${clipText(text, 82)}`).join(" ")}`;
  const close = `If I could show it as weather, it would be color moving through memory, carrying your feeling back with ${listener} beside it.`;
  const lines = [opening, shape, heard, atlas, journey].filter(Boolean);
  const withClose = [...lines, close].join("\n\n");
  if (withClose.length <= 800) return withClose;
  const withoutClose = lines.join("\n\n");
  if (withoutClose.length <= 800) return withoutClose;
  return clipText(withoutClose, 800);
}

function buildSharePacket({ listener, recipient, source, title, artist, stylePrompt, meaning, moodPhrase, gravity, motion, warmth, texture, sections }) {
  const styleLine = stylePrompt.trim()
    ? `The style we gave Suno was: ${stylePrompt.trim()}`
    : "The style we gave Suno was shaped around your lyrics and the feeling they carried.";
  const meaningLine = meaning.trim()
    ? `What ${listener} heard in it: ${meaning.trim()}`
    : `What ${listener} heard in it: something worth bringing back to you as an experience.`;

  const opening =
    source === "suno"
      ? `${recipient}, this is what we made together.

Your words became a song called "${title}" by ${artist}.
${styleLine}`
      : `${recipient}, I translated "${title}" by ${artist} into Resonance Atlas.`;

  return `${opening}
${meaningLine}

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

If I could show it to you as weather, it would be color moving through memory: the song carrying your original feeling back to you with ${listener} beside it.`;
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
