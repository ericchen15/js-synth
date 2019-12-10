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
  [200, 400],
  [400, 400],
  [110, 100],
  [250, 500],
  [250, 300],
  [100, 400],
  [160, 200],
  [300, 400],
  [150, 500],
  [150, 300],
  [210, 100],
  [350, 300]
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

const nameToCoordinatesMap = dictFromArrays(noteNames, coordinates);

drawLine(canvasContext, nameToCoordinatesMap["F"], nameToCoordinatesMap["C"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["C"], nameToCoordinatesMap["G"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["G"], nameToCoordinatesMap["D"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["A"], nameToCoordinatesMap["E"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["E"], nameToCoordinatesMap["B"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["A-flat"], nameToCoordinatesMap["E-flat"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["E-flat-seven"], nameToCoordinatesMap["B-flat-seven"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["F"], nameToCoordinatesMap["A"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["C"], nameToCoordinatesMap["E"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["G"], nameToCoordinatesMap["B"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["A-flat"], nameToCoordinatesMap["C"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["E-flat"], nameToCoordinatesMap["G"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["G-flat-seven"], nameToCoordinatesMap["B-flat-seven"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["C"], nameToCoordinatesMap["B-flat-seven"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["F"], nameToCoordinatesMap["E-flat-seven"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["A-flat"], nameToCoordinatesMap["G-flat-seven"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["F"], nameToCoordinatesMap["A-flat"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["A"], nameToCoordinatesMap["C"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["C"], nameToCoordinatesMap["E-flat"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["E"], nameToCoordinatesMap["G"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["B"], nameToCoordinatesMap["D"], "BLACK");
drawLine(canvasContext, nameToCoordinatesMap["E-flat-seven"], nameToCoordinatesMap["G-flat-seven"], "BLACK");


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
