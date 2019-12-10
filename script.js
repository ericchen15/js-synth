const context = new window.AudioContext();

const scale = experimentalScale;
const baseFrequency = 65;
const baseIndex = 2;
const waveType = "sawtooth";
const filter = createFilter(context, "lowpass", 6000);

console.log(scale);
console.log(scale.map(ratioToCents));

// begin drawing section
const canvas = document.getElementById("myCanvas");
const canvasContext = canvas.getContext("2d");

const coordinates = [
  [300, 300],
  [700, 300],
  [200, 240],
  [400, 500],
  [400, 100],
  [100, 300],
  [300, 440],
  [500, 300],
  [200, 500],
  [200, 100],
  [400, 240],
  [600, 100]
]

const noteNames = [
  "C",
  "D",
  "E-flat-seven",
  "E-flat",
  "E",
  "F",
  "G-flat-seven",
  "G",
  "A-flat",
  "A",
  "B-flat-seven",
  "B"
]

const consonances = [
  ["F", "C"],
  ["F", "A"],
  ["F", "A-flat"],
  ["A", "E"],
  ["A", "C"],
  ["A-flat", "E-flat"],
  ["A-flat", "C"],
  ["C", "G"],
  ["C", "E"],
  ["C", "E-flat"],
  ["E", "B"],
  ["E", "G"],
  ["E-flat", "G"],
  ["G", "D"],
  ["G", "B"],
  ["B", "D"],
  ["E-flat-seven", "F"],
  ["E-flat-seven", "A"],
  ["E-flat-seven", "C"],
  ["G-flat-seven", "A-flat"],
  ["G-flat-seven", "C"],
  ["G-flat-seven", "E-flat"],
  ["B-flat-seven", "C"],
  ["B-flat-seven", "E"],
  ["B-flat-seven", "G"],
  ["E-flat-seven", "G-flat-seven"],
  ["E-flat-seven", "B-flat-seven"],
  ["G-flat-seven", "B-flat-seven"],
]

console.log(consonances);

const nameToCoordinatesMap = dictFromArrays(noteNames, coordinates);
consonances.map(
  consonance => drawLine(
    canvasContext,
    nameToCoordinatesMap[consonance[0]],
    nameToCoordinatesMap[consonance[1]],
    "BLACK"
  )
);

const keyDrawerList = coordinates.map(
  pair => new KeyDrawer(canvasContext, pair[0], pair[1])
);

console.log(keyDrawerList);

const frequencyList = range(KEY_CODE_LIST.length).map(
  i => calculateFrequency(scale, baseFrequency, i - baseIndex)
);

const keyList = frequencyList.map(
  (frequency, i) => createKey(
    context,
    frequency,
    waveType,
    keyDrawerList[(i - baseIndex).mod(scale.length)]
  )
);

const synth = new Synth(context, KEY_CODE_LIST, keyList, filter);

var pressedKeys = new Set();

// drawing experiments
const keyCodeToFrequencyMap = dictFromArrays(KEY_CODE_LIST, frequencyList);

function calculateYPos(frequency) {
  return 1200 - 120 * Math.log2(frequency);
}
// end of drawing experiments

function onKeyDown(event) {
  if (!pressedKeys.has(event.code)) {
    synth.onKeyDown(event);
    pressedKeys.add(event.code);
  }
}

function onKeyUp(event) {
  synth.onKeyUp(event);
  pressedKeys.delete(event.code);
}

function onClick(event) {
  context.resume();
}

document.onkeydown = onKeyDown;
document.onkeyup = onKeyUp;
document.onclick = onClick;
