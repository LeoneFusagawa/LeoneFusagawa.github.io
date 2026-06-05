const VOLUME_KEY = "leone-fusagawa-volume";

const intro = document.getElementById("intro");
const openScroll = document.getElementById("openScroll");
const siteShell = document.getElementById("siteShell");
const music = document.getElementById("ambientMusic");
const volumeSlider = document.getElementById("volumeSlider");
const volumePercent = document.getElementById("volumePercent");

document.body.classList.add("is-locked");

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

setupAudio();

openScroll.addEventListener("click", openSite);
