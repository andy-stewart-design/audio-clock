import { beep } from "./beep";
import { AudioClock } from "./clock";
import { euclid } from "./euclid";
import { midiToFreq } from "./midi";
import Synth from "./synth";

// Global variables and functions
let drome: AudioClock, output: HTMLDivElement, codeEditor: HTMLTextAreaElement;

function initializeREPL() {
  // Initialize after DOM is ready
  drome = new AudioClock(2);
  output = document.querySelector("#output")!;
  codeEditor = document.querySelector("#codeEditor")!;

  // Keyboard shortcuts
  codeEditor.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      playCode();
    } else if (e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      runCode();
    }
  });

  drome.onIterationStart((n: number) => {
    log(`Staring iteration ${n}`);
  });

  // Initialize
  log("🎵 Audio Synth REPL ready!", "output");
  log(
    "Write your code in the editor above, then click Play to start the loop.",
    "output"
  );
  log("Shortcuts: Ctrl+Enter = Play, Shift+Enter = Run", "output");
}

function log(message: string, type = "output") {
  const entry = document.createElement("div");
  entry.className = `log-entry log-${type}`;
  entry.textContent = message;
  output.appendChild(entry);
  output.scrollTop = output.scrollHeight;
}

function runCode() {
  const code = codeEditor.value.trim();
  if (!code) return;

  log(`🔧 Running code...`, "input");

  try {
    drome.clearInstruments();
    const result = new Function(
      "drome",
      "Synth",
      "AudioClock",
      "euclid",
      "beep",
      "midiToFreq",
      `
                    ${code}
                `
    )(drome, Synth, AudioClock, euclid, beep, midiToFreq);

    log(`✓ Code executed successfully`, "output");
    if (result !== undefined) {
      log(`← ${result}`, "output");
    }
  } catch (error) {
    log(`✗ ${(error as Error).message}`, "error");
  }
}

function playCode() {
  runCode();
  drome.start();
  updateStatus(true);
  log(`▶ Starting playback loop...`, "output");
}

function insertExample(e: MouseEvent) {
  if (e.currentTarget instanceof HTMLDivElement) {
    const code = e.currentTarget.querySelector(".example-code")?.textContent;
    if (code) codeEditor.value = code;
    codeEditor.focus();
  }
}

function stopAll() {
  drome.stop();
  drome.clearInstruments();
  updateStatus(false);
  log(`⏹ Stopped all playback`, "output");
}

function updateStatus(playing: boolean) {
  const statusDot = document.getElementById("statusDot")!;
  const statusText = document.getElementById("statusText")!;

  if (playing) {
    statusDot.classList.add("playing");
    statusText.textContent = "Playing";
  } else {
    statusDot.classList.remove("playing");
    statusText.textContent = "Stopped";
  }
}

document.querySelector("#stop")?.addEventListener("click", stopAll);
document.querySelector("#play")?.addEventListener("click", playCode);
document.querySelectorAll<HTMLDivElement>(".example")?.forEach((div) => {
  div.addEventListener("click", insertExample);
});

document.addEventListener("DOMContentLoaded", function () {
  initializeREPL();
});
