let currentSet = "set1";
let currentLoop = null;
let currentFill = null;
let isPlayingFill = false;
let selectedButton = null;
let audioContext = null; // Web Audio API for precise timing

// Preloaded audio buffers
const audioBuffers = {
  loops: {},
  fills: {},
};

// Load rhythm sets into the dropdown
const rhythmSetDropdown = document.getElementById("rhythm-set");
rhythmSets.forEach(set => {
  const option = document.createElement("option");
  option.value = set;
  option.textContent = set;
  rhythmSetDropdown.appendChild(option);
});

// Change rhythm set
rhythmSetDropdown.addEventListener("change", async (event) => {
  currentSet = event.target.value;
  stopAllAudio();
  resetButtons();
  await preloadAudioFiles(); // Preload audio files for the selected set
});

// Preload audio files
async function preloadAudioFiles() {
  audioBuffers.loops = {};
  audioBuffers.fills = {};

  const loadAudio = async (type, file) => {
    const response = await fetch(`./rhythm-sets/${currentSet}/${file}.wav`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  };

  // Load loops
  audioBuffers.loops.L1 = await loadAudio("loop", "L1");
  audioBuffers.loops.L2 = await loadAudio("loop", "L2");
  audioBuffers.loops.L3 = await loadAudio("loop", "L3");
  audioBuffers.loops.L4 = await loadAudio("loop", "L4");

  // Load fills
  audioBuffers.fills.F1 = await loadAudio("fill", "F1");
  audioBuffers.fills.F2 = await loadAudio("fill", "F2");
  audioBuffers.fills.F3 = await loadAudio("fill", "F3");
  audioBuffers.fills.F4 = await loadAudio("fill", "F4");
}

// Initialize Web Audio API
function initAudioContext() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Play loop
function playLoop(loopFile, buttonId) {
  if (isPlayingFill) return; // Don't change loop while fill is playing
  stopAllAudio();
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers.loops[loopFile];
  source.loop = true;
  source.connect(audioContext.destination);
  source.start(0);
  currentLoop = source;
  highlightButton(buttonId);
}

// Schedule fill
function scheduleFill(fillFile, buttonId) {
  if (isPlayingFill) return; // Don't schedule another fill if one is already scheduled
  const loopDuration = currentLoop.buffer.duration; // Duration of the current loop
  const currentTime = audioContext.currentTime; // Current playback time
  const loopStartTime = currentLoop.startTime || 0; // Time when the loop started
  const elapsedTime = currentTime - loopStartTime; // Time elapsed since the loop started
  const timeRemaining = loopDuration - (elapsedTime % loopDuration); // Time until the end of the current loop cycle

  // Schedule the fill to play at the end of the current loop cycle
  setTimeout(() => {
    playFill(fillFile, buttonId);
  }, timeRemaining * 1000);
}

// Play fill
function playFill(fillFile, buttonId) {
  isPlayingFill = true;
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers.fills[fillFile];
  source.connect(audioContext.destination);
  source.start(0);
  currentFill = source;
  highlightButton(buttonId);
  source.onended = () => {
    isPlayingFill = false;
    if (currentLoop) {
      currentLoop.start(0); // Resume the loop immediately after the fill ends
    }
    resetButtons();
  };
}

// Stop all audio
function stopAllAudio() {
  if (currentLoop) {
    currentLoop.stop();
    currentLoop.disconnect();
    currentLoop = null;
  }
  if (currentFill) {
    currentFill.stop();
    currentFill.disconnect();
    currentFill = null;
  }
}

// Highlight selected button
function highlightButton(buttonId) {
  if (selectedButton) {
    selectedButton.classList.remove("selected");
  }
  selectedButton = document.getElementById(buttonId);
  selectedButton.classList.add("selected");
}

// Reset buttons
function resetButtons() {
  if (selectedButton) {
    selectedButton.classList.remove("selected");
    selectedButton = null;
  }
}

// Initialize audio context when the page loads
window.addEventListener("load", () => {
  initAudioContext();
  preloadAudioFiles(); // Preload audio files for the default set
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
