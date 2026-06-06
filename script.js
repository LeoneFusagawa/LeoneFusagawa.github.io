const DATA_URL = "data.json";

const intro = document.getElementById("intro");
const openScroll = document.getElementById("openScroll");
const siteShell = document.getElementById("siteShell");
const music = document.getElementById("ambientMusic");
const musicToggle = document.getElementById("musicToggle");
const volumeSlider = document.getElementById("volumeSlider");
const acidAshLayer = document.getElementById("acidAshLayer");
const reportsGrid = document.getElementById("reportsGrid");
const rapportTemplate = document.getElementById("rapportTemplate");
const VOLUME_STORAGE_KEY = "leone-music-volume-v2";
const DEFAULT_VOLUME = 0.5;
let musicHasLoaded = false;

document.body.classList.add("is-locked");

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || "";
  }
}

function getSavedVolume() {
  try {
    const savedVolume = Number(localStorage.getItem(VOLUME_STORAGE_KEY));

    if (Number.isFinite(savedVolume)) {
      return Math.min(1, Math.max(0, savedVolume));
    }
  } catch (error) {
    return DEFAULT_VOLUME;
  }

  return DEFAULT_VOLUME;
}

function setMusicButtonState() {
  musicToggle.textContent = music.paused ? "LECTURE" : "PAUSE";
}

function setVolume(value) {
  const volume = Math.min(1, Math.max(0, Number(value)));

  music.volume = volume;
  volumeSlider.value = String(volume);

  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  } catch (error) {
    return;
  }
}

function playMusic() {
  if (!musicHasLoaded) {
    music.load();
    musicHasLoaded = true;
  }

  return music.play();
}

function setupAudio() {
  setVolume(getSavedVolume());
  setMusicButtonState();

  volumeSlider.addEventListener("input", () => {
    setVolume(volumeSlider.value);
  });

  volumeSlider.addEventListener("change", () => {
    setVolume(volumeSlider.value);
  });

  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      playMusic().then(() => {
        setMusicButtonState();
      }).catch(() => {
        setMusicButtonState();
      });
    } else {
      music.pause();
      setMusicButtonState();
    }
  });

  music.addEventListener("play", setMusicButtonState);
  music.addEventListener("pause", setMusicButtonState);
}

function openSite() {
  intro.classList.add("is-opening");
  openScroll.disabled = true;
  playMusic().then(() => {
    setMusicButtonState();
  }).catch(() => {
    setMusicButtonState();
  });

  window.setTimeout(() => {
    intro.classList.add("is-hidden");
    siteShell.classList.add("is-visible");
    siteShell.setAttribute("aria-hidden", "false");
    document.body.classList.remove("is-locked");
  }, 1650);
}

function createAcidAsh() {
  for (let index = 0; index < 34; index += 1) {
    const ash = document.createElement("img");
    ash.className = "acid-ash";
    ash.src = "./assets/images/cendre-acide.png";
    ash.alt = "";
    ash.setAttribute("aria-hidden", "true");
    ash.style.setProperty("--ash-left", `${Math.random() * 100}%`);
    ash.style.setProperty("--ash-delay", `${Math.random() * -16}s`);
    ash.style.setProperty("--ash-duration", `${10 + Math.random() * 14}s`);
    ash.style.setProperty("--ash-size", `${10 + Math.random() * 18}px`);
    ash.style.setProperty("--ash-drift", `${-28 + Math.random() * 56}px`);
    acidAshLayer.appendChild(ash);
  }
}

function renderCharacter(personnage = {}) {
  const spheres = Array.isArray(personnage.spheres) ? personnage.spheres : [];

  setText("heroName", personnage.nom);
  setText("heroTitle", personnage.titre);
  setText("detailHeadingName", personnage.nom);
  setText("detailPower", personnage.pouvoirSanguinaire);
  setText("detailRank", personnage.rang);
  setText("detailSphereOcculte", spheres[0]);
  setText("detailSphereScientifique", spheres[1]);
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
createAcidAsh();
loadData();

openScroll.addEventListener("click", openSite);
