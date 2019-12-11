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

const basisRatios = [3/2, 5/4, 7/4];
const rootCoordinates = new Coordinates(300, 300);
const basisDirections = [
  new Coordinates(200, 0),
  new Coordinates(100, -200),
  new Coordinates(100, -60)
];
const scaleToCoordinates =
  getAllCoordinates(scale, basisRatios, rootCoordinates, basisDirections)

const consonances = [3/2, 5/4, 5/3, 7/4, 7/5, 7/6];
const allConsonances = getAllConsonances(scale, consonances);

console.log(allConsonances);

allConsonances.map(
  consonance => drawLine(
    canvasContext,
    scaleToCoordinates.get(consonance[0]),
    scaleToCoordinates.get(consonance[1]),
    "BLACK"
  )
);

const keyDrawerList = scale.map(
  note => new KeyDrawer(
    canvasContext,
    scaleToCoordinates.get(note)
  )
);

const frequencyList = range(KEY_CODE_LIST.length).map(
  i => calculateFrequency(scale, baseFrequency, i - baseIndex)
);

const keyList = frequencyList.map(
  (frequency, i) => createKey(
    context,
    frequency,
    waveType,
    keyDrawerList[(i - baseIndex - 1).mod(scale.length)]
  )
);

const synth = new Synth(context, KEY_CODE_LIST, keyList, filter);

var pressedKeys = new Set();

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
