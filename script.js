const DATA_URL = "data.json";
const VOLUME_KEY = "leone-fusagawa-volume";

const intro = document.getElementById("intro");
const openScroll = document.getElementById("openScroll");
const siteShell = document.getElementById("siteShell");
const music = document.getElementById("ambientMusic");
const volumeSlider = document.getElementById("volumeSlider");
const volumePercent = document.getElementById("volumePercent");
const particleCanvas = document.getElementById("particleCanvas");
const particleContext = particleCanvas.getContext("2d");

let particles = [];

document.body.classList.add("is-locked");

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || "";
  }
}

function createTile(label, value, options = {}) {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  const tile = document.createElement("article");
  tile.className = options.full ? "info-tile full" : "info-tile";

  const title = document.createElement("strong");
  title.textContent = label;

  const body = document.createElement("p");
  body.textContent = Array.isArray(value) ? value.join("\n") : value;

  tile.append(title, body);
  return tile;
}

function renderCharacter(data) {
  const personnage = data.personnage || {};
  const details = document.getElementById("characterDetails");
  details.innerHTML = "";

  setText("introText", data.intro?.text);
  setText("heroName", personnage.nom);
  setText("heroRank", personnage.rang);
  setText("heroQuote", personnage.citation);
  setText("heroSignature", personnage.signature);

  if (data.intro?.music) {
    music.src = data.intro.music;
  }

  const image = document.getElementById("characterImage");
  const imageFrame = image.closest(".character-focus");
  const imageSource = Array.isArray(personnage.imageChunks) && personnage.imageChunks.length
    ? `data:${personnage.imageMime || "image/jpeg"};base64,${personnage.imageChunks.join("")}`
    : personnage.image;

  if (imageSource) {
    image.src = imageSource;
    image.alt = personnage.nom || "Leone Fusagawa";
    imageFrame.classList.add("has-image");
  } else {
    image.removeAttribute("src");
    imageFrame.classList.remove("has-image");
  }

  [
    createTile("Nom", personnage.nom),
    createTile("Rang", personnage.rang),
    createTile("Pouvoir", personnage.pouvoir),
    createTile("Sphères", personnage.spheres),
    createTile("Description", personnage.description, { full: true })
  ].filter(Boolean).forEach((tile) => details.appendChild(tile));

  const acidCodeBlock = document.getElementById("acidCodeBlock");
  const acidCodeText = document.getElementById("acidCodeText");
  if (data.codeAcide) {
    acidCodeText.textContent = data.codeAcide;
    acidCodeBlock.hidden = false;
  } else {
    acidCodeBlock.hidden = true;
  }

  const editMode = document.getElementById("editMode");
  editMode.hidden = !data.modeEdition?.actif;
}

function renderReports(reports = []) {
  const list = document.getElementById("reportsList");
  list.innerHTML = "";

  if (!reports.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Aucun rapport actuellement référencé.";
    list.appendChild(empty);
    return;
  }

  reports.forEach((report) => {
    const item = document.createElement("article");
    item.className = "list-item";

    const title = document.createElement("strong");
    title.textContent = report.titre || "";

    const date = document.createElement("p");
    date.textContent = report.date || "";

    item.append(title, date);

    if (report.lienGoogleDocs) {
      const link = document.createElement("a");
      link.href = report.lienGoogleDocs;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "Consulter";
      item.appendChild(link);
    }

    list.appendChild(item);
  });
}

function renderExperiments(experiments = []) {
  const list = document.getElementById("experimentsList");
  list.innerHTML = "";

  if (!experiments.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Aucune expérience actuellement référencée.";
    list.appendChild(empty);
    return;
  }

  experiments.forEach((experiment) => {
    const item = document.createElement("article");
    item.className = "list-item";

    const title = document.createElement("strong");
    title.textContent = experiment.titre || "";

    const description = document.createElement("p");
    description.textContent = experiment.description || "";

    const status = document.createElement("p");
    status.textContent = experiment.statut || "";

    item.append(title, description, status);
    list.appendChild(item);
  });
}

async function loadData() {
  const response = await fetch(DATA_URL);
  const data = await response.json();

  renderCharacter(data);
  renderReports(data.rapportsHebdomadaires);
  renderExperiments(data.experiencesScientifiques);
}

function readSavedVolume() {
  const saved = Number(localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(saved) ? saved : 0.35;
}

function setupAudio() {
  const volume = readSavedVolume();
  music.volume = volume;
  volumeSlider.value = String(volume);
  volumePercent.textContent = `${Math.round(volume * 100)}%`;

  volumeSlider.addEventListener("input", () => {
    const value = Number(volumeSlider.value);
    music.volume = value;
    localStorage.setItem(VOLUME_KEY, String(value));
    volumePercent.textContent = `${Math.round(value * 100)}%`;
  });
}

function openSite() {
  intro.classList.add("is-unveiling");
  openScroll.disabled = true;

  window.setTimeout(() => {
    intro.classList.add("is-open");
    siteShell.classList.add("is-visible");
    siteShell.setAttribute("aria-hidden", "false");
    document.body.classList.remove("is-locked");
    music.play().catch(() => {});
  }, 950);
}

function resizeParticles() {
  const ratio = window.devicePixelRatio || 1;
  particleCanvas.width = window.innerWidth * ratio;
  particleCanvas.height = window.innerHeight * ratio;
  particleCanvas.style.width = `${window.innerWidth}px`;
  particleCanvas.style.height = `${window.innerHeight}px`;
  particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);

  particles = Array.from({ length: Math.min(110, Math.floor(window.innerWidth / 12)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 2.2 + 0.4,
    speed: Math.random() * 0.35 + 0.12,
    alpha: Math.random() * 0.7 + 0.18
  }));
}

function drawParticles() {
  particleContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += Math.sin(particle.y * 0.012) * 0.18;

    if (particle.y < -8) {
      particle.y = window.innerHeight + 8;
      particle.x = Math.random() * window.innerWidth;
    }

    const gradient = particleContext.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.radius * 5
    );
    gradient.addColorStop(0, `rgba(244, 217, 138, ${particle.alpha})`);
    gradient.addColorStop(1, "rgba(244, 217, 138, 0)");

    particleContext.fillStyle = gradient;
    particleContext.beginPath();
    particleContext.arc(particle.x, particle.y, particle.radius * 5, 0, Math.PI * 2);
    particleContext.fill();
  });

  requestAnimationFrame(drawParticles);
}

setupAudio();
resizeParticles();
drawParticles();
loadData();

openScroll.addEventListener("click", openSite);
window.addEventListener("resize", resizeParticles);