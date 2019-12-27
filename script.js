const context = new window.AudioContext();

const shouldDraw = true;
const scale = sevenScale;

const baseFrequency = 65;
const baseIndex = 2;
const waveType = "sawtooth";
const filter = createFilter(context, "lowpass", 6000);

console.log(scale);
console.log(scale.map(ratioToCents));

const canvas = document.getElementById("myCanvas");
const canvasContext = canvas.getContext("2d");

var keyDrawerList;

if (shouldDraw) {
  const noteNames = sevenNames;
  const basisRatios = sevenBasisRatios;
  const consonances = sevenConsonances;
  const scaleToNoteNames = dictFromArrays(scale, noteNames);

  const rootCoordinates = new Coordinates(300, 300);
  const basisDirections = [
    new Coordinates(180, 0),
    new Coordinates(90, -180),
    new Coordinates(90, -60)
  ];
  const scaleToCoordinates =
    getAllCoordinates(scale, basisRatios, rootCoordinates, basisDirections);

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

  console.log(scaleToNoteNames);

  keyDrawerList = scale.map(
    note => new KeyDrawer(
      canvasContext,
      scaleToCoordinates.get(note),
      scaleToNoteNames[note]
    )
  );

  keyDrawerList.map(keyDrawer => keyDrawer.erase());
} else {
  const defaultKeyDrawer = createDummyKeyDrawer(canvasContext);
  keyDrawerList = Array(scale.length).fill(defaultKeyDrawer);
}

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
