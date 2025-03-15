let currentSet = "set1";
let currentLoop = null;
let currentFill = null;
let isPlayingFill = false;
let selectedButton = null;

// Load rhythm sets into the dropdown
const rhythmSetDropdown = document.getElementById("rhythm-set");
rhythmSets.forEach(set => {
  const option = document.createElement("option");
  option.value = set;
  option.textContent = set;
  rhythmSetDropdown.appendChild(option);
});

// Change rhythm set
rhythmSetDropdown.addEventListener("change", (event) => {
  currentSet = event.target.value;
  stopAllAudio();
  resetButtons();
});

// Loop buttons
document.getElementById("loop1").addEventListener("click", () => playLoop("L1", "loop1"));
document.getElementById("loop2").addEventListener("click", () => playLoop("L2", "loop2"));
document.getElementById("loop3").addEventListener("click", () => playLoop("L3", "loop3"));
document.getElementById("loop4").addEventListener("click", () => playLoop("L4", "loop4"));

// Fill buttons
document.getElementById("fill1").addEventListener("click", () => scheduleFill("F1", "fill1"));
document.getElementById("fill2").addEventListener("click", () => scheduleFill("F2", "fill2"));
document.getElementById("fill3").addEventListener("click", () => scheduleFill("F3", "fill3"));
document.getElementById("fill4").addEventListener("click", () => scheduleFill("F4", "fill4"));

function playLoop(loopFile, buttonId) {
  if (isPlayingFill) return; // Don't change loop while fill is playing
  stopAllAudio();
  currentLoop = new Audio(`/rhythm-sets/${currentSet}/${loopFile}.wav`);
  currentLoop.loop = true;
  currentLoop.play();
  highlightButton(buttonId);
}

function scheduleFill(fillFile, buttonId) {
  if (isPlayingFill) return; // Don't schedule another fill if one is already scheduled
  const loopDuration = getAudioDuration(currentLoop); // Get the duration of the current loop
  const currentTime = currentLoop.currentTime; // Get the current playback time
  const timeRemaining = loopDuration - (currentTime % loopDuration); // Time until the end of the current loop cycle

  setTimeout(() => {
    playFill(fillFile, buttonId);
  }, timeRemaining * 1000); // Schedule the fill to play at the end of the current loop cycle
}

function playFill(fillFile, buttonId) {
  isPlayingFill = true;
  currentFill = new Audio(`/rhythm-sets/${currentSet}/${fillFile}.wav`);
  currentFill.play();
  highlightButton(buttonId);
  currentFill.onended = () => {
    isPlayingFill = false;
    if (currentLoop) {
      currentLoop.play(); // Resume the loop after the fill finishes
    }
    resetButtons();
  };
}

function stopAllAudio() {
  if (currentLoop) {
    currentLoop.pause();
    currentLoop.currentTime = 0;
  }
  if (currentFill) {
    currentFill.pause();
    currentFill.currentTime = 0;
  }
}

function highlightButton(buttonId) {
  if (selectedButton) {
    selectedButton.classList.remove("selected");
  }
  selectedButton = document.getElementById(buttonId);
  selectedButton.classList.add("selected");
}

function resetButtons() {
  if (selectedButton) {
    selectedButton.classList.remove("selected");
    selectedButton = null;
  }
}

function getAudioDuration(audio) {
  return audio.duration;
}
