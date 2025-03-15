let currentSet = "set1"; // Default rhythm set
let currentLoop = null; // Currently playing loop
let currentFill = null; // Currently playing fill
let isPlayingFill = false; // Flag to track if a fill is playing
let selectedButton = null; // Currently selected button
let audioContext = null; // Web Audio API context
let audioBuffers = {}; // Preloaded audio buffers

// Load rhythm sets into the dropdown
const rhythmSetDropdown = document.getElementById("rhythm-set");
rhythmSets.forEach(set => {
  const option = document.createElement("option");
  option.value = set;
  option.textContent = set;
  rhythmSetDropdown.appendChild(option);
});

// Initialize Web Audio API
function initAudioContext() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Preload audio files for the selected rhythm set
async function preloadAudioFiles() {
  audioBuffers = { loops: {}, fills: {} }; // Reset buffers

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

// Play a loop
function playLoop(loopFile, buttonId) {
  if (isPlayingFill) return; // Don't change loop while fill is playing
  stopAllAudio(); // Stop any currently playing audio

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers.loops[loopFile]; // Set the loop buffer
  source.loop = true; // Enable looping
  source.connect(audioContext.destination); // Connect to output
  source.start(0); // Start playback immediately
  currentLoop = source; // Store the current loop

  highlightButton(buttonId); // Highlight the selected button
}

// Schedule a fill to play at the end of the current loop cycle
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
  }, timeRemaining * 1000); // Convert to milliseconds
}

// Play a fill
function playFill(fillFile, buttonId) {
  isPlayingFill = true; // Set the fill flag

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffers.fills[fillFile]; // Set the fill buffer
  source.connect(audioContext.destination); // Connect to output
  source.start(0); // Start playback immediately
  currentFill = source; // Store the current fill

  highlightButton(buttonId); // Highlight the selected button

  // When the fill ends, resume the loop
  source.onended = () => {
    isPlayingFill = false; // Reset the fill flag
    if (currentLoop) {
      currentLoop.start(0); // Resume the loop immediately
    }
    resetButtons(); // Reset button highlights
  };
}

// Stop all audio
function stopAllAudio() {
  if (currentLoop) {
    currentLoop.stop(); // Stop the loop
    currentLoop.disconnect(); // Disconnect from output
    currentLoop = null; // Clear the loop reference
  }
  if (currentFill) {
    currentFill.stop(); // Stop the fill
    currentFill.disconnect(); // Disconnect from output
    currentFill = null; // Clear the fill reference
  }
}

// Highlight the selected button
function highlightButton(buttonId) {
  if (selectedButton) {
    selectedButton.classList.remove("selected"); // Remove highlight from the previous button
  }
  selectedButton = document.getElementById(buttonId); // Get the new button
  selectedButton.classList.add("selected"); // Add highlight to the new button
}

// Reset button highlights
function resetButtons() {
  if (selectedButton) {
    selectedButton.classList.remove("selected"); // Remove highlight
    selectedButton = null; // Clear the button reference
  }
}

// Initialize audio context and preload audio files when the page loads
window.addEventListener("load", async () => {
  initAudioContext(); // Initialize Web Audio API
  await preloadAudioFiles(); // Preload audio files for the default set
});

// Change rhythm set
rhythmSetDropdown.addEventListener("change", async (event) => {
  currentSet = event.target.value; // Update the current set
  stopAllAudio(); // Stop any currently playing audio
  resetButtons(); // Reset button highlights
  await preloadAudioFiles(); // Preload audio files for the new set
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
