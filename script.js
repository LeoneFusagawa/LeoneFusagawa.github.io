const DATA_URL = "data.json";
const VOLUME_KEY = "leone-fusagawa-volume";

const intro = document.getElementById("intro");
const openScroll = document.getElementById("openScroll");
const siteShell = document.getElementById("siteShell");
const music = document.getElementById("ambientMusic");
const volumeSlider = document.getElementById("volumeSlider");
const volumePercent = document.getElementById("volumePercent");
const reportsGrid = document.getElementById("reportsGrid");
const rapportTemplate = document.getElementById("rapportTemplate");

document.body.classList.add("is-locked");

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || "";
  }
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
  intro.classList.add("is-opening");
  openScroll.disabled = true;

  window.setTimeout(() => {
    intro.classList.add("is-hidden");
    siteShell.classList.add("is-visible");
    siteShell.setAttribute("aria-hidden", "false");
    document.body.classList.remove("is-locked");
    music.play().catch(() => {});
  }, 1250);
}

function renderCharacter(personnage = {}) {
  const spheres = Array.isArray(personnage.spheres) ? personnage.spheres.join(", ") : "";

  setText("heroName", personnage.nom);
  setText("heroTitle", personnage.titre);
  setText("detailName", personnage.nom);
  setText("detailTitle", personnage.titre);
  setText("detailSpheres", spheres);
}

function sortReportsByNewest(reports) {
  return [...reports].sort((a, b) => {
    const timeA = Date.parse(a.date || "");
    const timeB = Date.parse(b.date || "");

    if (Number.isNaN(timeA) && Number.isNaN(timeB)) {
      return 0;
    }

    if (Number.isNaN(timeA)) {
      return 1;
    }

    if (Number.isNaN(timeB)) {
      return -1;
    }

    return timeB - timeA;
  });
}

function renderReports(reports = []) {
  reportsGrid.innerHTML = "";

  if (!reports.length) {
    const empty = document.createElement("p");
    empty.className = "empty-reports";
    empty.textContent = "Aucun rapport actuellement référencé.";
    reportsGrid.appendChild(empty);
    return;
  }

  sortReportsByNewest(reports).forEach((report) => {
    const card = rapportTemplate.content.firstElementChild.cloneNode(true);
    const link = card.querySelector(".rapport-link");
    const date = card.querySelector(".rapport-date");

    link.textContent = report.titre || "";
    link.href = report.pdf || "#";
    date.textContent = report.date || "";
    date.dateTime = report.date || "";

    reportsGrid.appendChild(card);
  });
}

async function loadData() {
  const response = await fetch(DATA_URL);
  const data = await response.json();

  renderCharacter(data.personnage);
  renderReports(data.rapportsHebdomadaires);
}

setupAudio();
loadData();

openScroll.addEventListener("click", openSite);
