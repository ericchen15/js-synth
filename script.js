const context = new window.AudioContext();

const scale = experimentalScale;
const baseFrequency = 65;
const baseIndex = 2;
const waveType = "sawtooth";
const filter = createFilter(context, "lowpass", 6000);

console.log(scale);
console.log(scale.map(ratioToCents));

const frequencyList = range(KEY_CODE_LIST.length).map(
  i => calculateFrequency(scale, baseFrequency, i - baseIndex)
);
const keyList = frequencyList.map(
  frequency => createKey(context, frequency, waveType)
);

const synth = new Synth(context, KEY_CODE_LIST, keyList, filter);

var pressedKeys = new Set();

function onKeyDown(event) {
  if (!pressedKeys.has(event.code)) {
    synth.onKeyDown(event);
  }
  pressedKeys.add(event.code);
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
