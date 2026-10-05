// Entry point (loaded last by index.html): builds the synth from the
// configuration below, draws the note visualization, and hooks up input.
//
// Controls:
//   note keys           play notes (see KEY_CODE_LIST in keyboardLayout.js)
//   Space               sustain: notes pressed while Space is down keep
//                       sounding until the next Space press
//   ArrowUp / Down      master volume up / down
//   ArrowLeft / Right   every key down / up an octave (a factor of 2, whatever
//                       the scale's period is)
//   click               resume audio (browsers start the AudioContext suspended)

// ---- Configuration ----

const DEFAULT_SCALE = "12-TET";    // name in SCALES (music/scales.js) the scale dropdown starts with
const BASE_FREQUENCY = 130.81;     // Hz (C3)
const BASE_KEY_INDEX = 10;         // KEY_CODE_LIST index that plays BASE_FREQUENCY ("KeyS")
const DEFAULT_INSTRUMENT = "synth";  // preset (audio/instruments.js) the settings panel starts with

// "tonnetz": the fixed 12-TET Tonnetz from drawing/tonnetz.js (highlights 12-note scales only).
// "lattice": a lattice laid out automatically from LATTICE_SCALE by drawing/lattice.js, using
//            the LATTICE_* settings below.
const VISUALIZATION = "tonnetz";

// Lattice mode only. LATTICE_NOTE_NAMES must line up 1:1 with LATTICE_SCALE.
const LATTICE_SCALE = bigSevenScale;
const LATTICE_NOTE_NAMES = bigSevenNames;
const LATTICE_BASIS_RATIOS = sevenBasisRatios;
const LATTICE_CONSONANCES = sevenConsonances;  // pairs connected by lines
const LATTICE_ROOT = new Coordinates(300, 300);
const LATTICE_BASIS_DIRECTIONS = [  // one per basis ratio
  new Coordinates(180, 0),
  new Coordinates(90, -180),
  new Coordinates(90, -60)
];

// ---- Visualization ----

/** Draws the Tonnetz grid and returns one KeyDrawer per scale degree. */
function createTonnetzKeyDrawers(canvasContext) {
  const nodes = createTonnetzNodes();
  drawTonnetzGridLines(canvasContext, nodes);
  return TONNETZ_NODES_BY_DEGREE.map(names =>
    new KeyDrawer(canvasContext, names.map(name => nodes[name]))
  );
}

/** Lays out and draws a JI lattice for LATTICE_SCALE and returns one KeyDrawer per scale degree. */
function createLatticeKeyDrawers(canvasContext) {
  const scaleToCoordinates = getAllCoordinates(
    LATTICE_SCALE, LATTICE_BASIS_RATIOS, LATTICE_ROOT, LATTICE_BASIS_DIRECTIONS);

  getAllConsonances(LATTICE_SCALE, LATTICE_CONSONANCES).forEach(([note1, note2]) =>
    drawLine(
      canvasContext,
      scaleToCoordinates.get(note1),
      scaleToCoordinates.get(note2),
      "BLACK"
    )
  );

  return LATTICE_SCALE.map((note, i) =>
    new KeyDrawer(canvasContext, [
      new NoteNode(scaleToCoordinates.get(note), LATTICE_NOTE_NAMES[i])
    ])
  );
}

// ---- Setup ----

// What the keys are currently built from; changed by the panels above the canvas.
let currentSettings = createSettingsPanel(
  document.getElementById("settingsPanel"), INSTRUMENTS, DEFAULT_INSTRUMENT, settings => {
    currentSettings = settings;
    filter.frequency.value = settings.lowpassCutoff;
    rebuildKeys();
  });
let currentScale = SCALES[createScaleSelector(
  document.getElementById("scalePanel"), SCALES, DEFAULT_SCALE, name => {
    currentScale = SCALES[name];
    logScale(currentScale);
    rebuildKeys();
  })];
logScale(currentScale);

const audioContext = new window.AudioContext();
const filter = createFilter(audioContext, "lowpass", currentSettings.lowpassCutoff);

const canvasContext = document.getElementById("myCanvas").getContext("2d");
const keyDrawers = VISUALIZATION === "lattice"
  ? createLatticeKeyDrawers(canvasContext)
  : createTonnetzKeyDrawers(canvasContext);
keyDrawers.forEach(keyDrawer => keyDrawer.erase());  // draw every node unlit

// Key i is `i - BASE_KEY_INDEX` scale steps above BASE_FREQUENCY. A step count
// s is scale degree (s mod length), and degree d is drawn by keyDrawers[d - 1]
// (the root, degree 0, is the last drawer). See the scale format in
// music/musicUtils.js. The drawers only fit a scale with as many notes as
// there are drawers (12 for the Tonnetz); other scales play without highlighting.
const NO_HIGHLIGHT = { press() {}, release() {} };

function createKeys() {
  const highlight = currentScale.length === keyDrawers.length;
  return KEY_CODE_LIST.map((_, i) => {
    const steps = i - BASE_KEY_INDEX;
    return createKey(
      audioContext,
      calculateFrequency(currentScale, BASE_FREQUENCY, steps),
      currentSettings,
      highlight ? keyDrawers[mod(steps - 1, currentScale.length)] : NO_HIGHLIGHT
    );
  });
}

const synth = new Synth(audioContext, KEY_CODE_LIST, createKeys(), filter);

/**
 * Rebuilds all keys from currentSettings and currentScale. Playing notes stop
 * and any octave shift resets; the master volume is kept.
 */
function rebuildKeys() {
  synth.replaceKeys(createKeys());
  keyDrawers.forEach(keyDrawer => keyDrawer.reset());
}

function logScale(scale) {
  console.log(scale);
  console.log(scale.map(ratioToCents));
}

// ---- Input ----

// Every key the synth responds to. Their browser defaults (Tab moving focus,
// Space and arrows scrolling, ...) are suppressed.
const SYNTH_KEY_CODES = new Set([
  ...KEY_CODE_LIST, "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"
]);

// While a settings input has focus, typing goes to it instead of the synth.
function isTypingInPanel(event) {
  return event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement;
}

// Codes currently held down. This ignores the auto-repeat keydown events the
// OS sends while a key is held.
const pressedKeys = new Set();

document.onkeydown = event => {
  if (isTypingInPanel(event)) {
    return;
  }
  if (SYNTH_KEY_CODES.has(event.code)) {
    event.preventDefault();
  }
  if (!pressedKeys.has(event.code)) {
    synth.onKeyDown(event);
    pressedKeys.add(event.code);
  }
};

document.onkeyup = event => {
  if (isTypingInPanel(event)) {
    return;
  }
  synth.onKeyUp(event);
  pressedKeys.delete(event.code);
};

document.onclick = () => audioContext.resume();
