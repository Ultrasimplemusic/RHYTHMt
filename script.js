let currentSet = "set1";
let currentLoop = null;
let currentFill = null;
let isPlayingFill = false;

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
});

// Loop buttons
document.getElementById("loop1").addEventListener("click", () => playLoop("L1"));
document.getElementById("loop2").addEventListener("click", () => playLoop("L2"));
document.getElementById("loop3").addEventListener("click", () => playLoop("L3"));
document.getElementById("loop4").addEventListener("click", () => playLoop("L4"));

// Fill buttons
document.getElementById("fill1").addEventListener("click", () => playFill("F1"));
document.getElementById("fill2").addEventListener("click", () => playFill("F2"));
document.getElementById("fill3").addEventListener("click", () => playFill("F3"));
document.getElementById("fill4").addEventListener("click", () => playFill("F4"));

function playLoop(loopFile) {
  if (isPlayingFill) return; // Don't change loop while fill is playing
  stopAllAudio();
  currentLoop = new Audio(`/rhythm-sets/${currentSet}/${loopFile}.mp3`);
  currentLoop.loop = true;
  currentLoop.play();
}

function playFill(fillFile) {
  if (isPlayingFill) return; // Don't play another fill if one is already playing
  isPlayingFill = true;
  currentFill = new Audio(`/rhythm-sets/${currentSet}/${fillFile}.mp3`);
  currentFill.play();
  currentFill.onended = () => {
    isPlayingFill = false;
    if (currentLoop) {
      currentLoop.play();
    }
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
}￼Enter
