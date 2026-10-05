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

const SCALE = tet12Scale;          // any scale from scales.js
const BASE_FREQUENCY = 130.81;     // Hz (C3)
const BASE_KEY_INDEX = 10;         // KEY_CODE_LIST index that plays BASE_FREQUENCY ("KeyS")
const WAVE_TYPE = "sawtooth";      // OscillatorNode type
const LOWPASS_CUTOFF = 6000;       // Hz

// "tonnetz": the fixed 12-TET Tonnetz from drawing/tonnetz.js (SCALE must have 12 notes).
// "lattice": a lattice laid out automatically from SCALE by drawing/lattice.js, using
//            the LATTICE_* settings below.
const VISUALIZATION = "tonnetz";

// Lattice mode only. LATTICE_NOTE_NAMES must line up 1:1 with SCALE.
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

/** Lays out and draws a JI lattice for SCALE and returns one KeyDrawer per scale degree. */
function createLatticeKeyDrawers(canvasContext) {
  const scaleToCoordinates = getAllCoordinates(
    SCALE, LATTICE_BASIS_RATIOS, LATTICE_ROOT, LATTICE_BASIS_DIRECTIONS);

  getAllConsonances(SCALE, LATTICE_CONSONANCES).forEach(([note1, note2]) =>
    drawLine(
      canvasContext,
      scaleToCoordinates.get(note1),
      scaleToCoordinates.get(note2),
      "BLACK"
    )
  );

  return SCALE.map((note, i) =>
    new KeyDrawer(canvasContext, [
      new NoteNode(scaleToCoordinates.get(note), LATTICE_NOTE_NAMES[i])
    ])
  );
}

// ---- Setup ----

const audioContext = new window.AudioContext();
const filter = createFilter(audioContext, "lowpass", LOWPASS_CUTOFF);

console.log(SCALE);
console.log(SCALE.map(ratioToCents));

const canvasContext = document.getElementById("myCanvas").getContext("2d");
const keyDrawers = VISUALIZATION === "lattice"
  ? createLatticeKeyDrawers(canvasContext)
  : createTonnetzKeyDrawers(canvasContext);
keyDrawers.forEach(keyDrawer => keyDrawer.erase());  // draw every node unlit

// Key i is `i - BASE_KEY_INDEX` scale steps above BASE_FREQUENCY. A step count
// s is scale degree (s mod length), and degree d is drawn by keyDrawers[d - 1]
// (the root, degree 0, is the last drawer). See the scale format in
// music/musicUtils.js.
const keyList = KEY_CODE_LIST.map((_, i) => {
  const steps = i - BASE_KEY_INDEX;
  return createKey(
    audioContext,
    calculateFrequency(SCALE, BASE_FREQUENCY, steps),
    WAVE_TYPE,
    keyDrawers[mod(steps - 1, SCALE.length)]
  );
});

const synth = new Synth(audioContext, KEY_CODE_LIST, keyList, filter);

// ---- Input ----

// Codes currently held down. This ignores the auto-repeat keydown events the
// OS sends while a key is held.
const pressedKeys = new Set();

document.onkeydown = event => {
  if (!pressedKeys.has(event.code)) {
    synth.onKeyDown(event);
    pressedKeys.add(event.code);
  }
};

document.onkeyup = event => {
  synth.onKeyUp(event);
  pressedKeys.delete(event.code);
};

document.onclick = () => audioContext.resume();
