Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
}

const keyCodeList = [
  "Digit1", "KeyQ", "KeyA", "KeyZ",
  "Digit2", "KeyW", "KeyS", "KeyX",
  "Digit3", "KeyE", "KeyD", "KeyC",
  "Digit4", "KeyR", "KeyF", "KeyV",
  "Digit5", "KeyT", "KeyG", "KeyB",
  "Digit6", "KeyY", "KeyH", "KeyN",
  "Digit7", "KeyU", "KeyJ", "KeyM",
  "Digit8", "KeyI", "KeyK", "Comma",
  "Digit9", "KeyO", "KeyL", "Period",
  "Digit0", "KeyP", "Semicolon", "Slash",
  "Minus", "BracketLeft", "Quote", "ShiftRight",
  "Equal", "BracketRight", "Enter"
]

class Key {
  constructor(context, oscillator, gainNode) {
    this.context = context;
    this.oscillator = oscillator;
    this.gainNode = gainNode;
  }

  press() {
    this.gainNode.gain.value = 0.0;
    this.gainNode.gain.setTargetAtTime(0.05, context.currentTime, 0.05);
  }

  release() {
    this.gainNode.gain.setTargetAtTime(0, context.currentTime, 0.03);
  }

  changeFrequency(factor) {
    this.oscillator.frequency.value *= factor;
  }
}

function createOscillator(context, frequency, type) {
  const oscillator = context.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  return oscillator;
}

function createGainNode(context) {
  const gainNode = context.createGain();
  gainNode.gain.value = 0;
  return gainNode;
}

function createKey(context, frequency, type) {
  const oscillator = createOscillator(context, frequency, type);
  const gainNode = createGainNode(context);
  oscillator.connect(gainNode);
  oscillator.start(0);
  return new Key(context, oscillator, gainNode);
}

function calculateFrequency(scale, baseFrequency, offset) {
  const scaleLength = scale.length;
  const taveRatio = scale[scale.length - 1];
  const tavesAboveBase = Math.floor(offset / scale.length);
  const index = offset.mod(scale.length);
  const taveMultiplier = Math.pow(taveRatio, tavesAboveBase);
  var scaleMultiplier = 1;
  if (index > 0) {
    scaleMultiplier = scale[index - 1];
  }
  return baseFrequency * taveMultiplier * scaleMultiplier;
}

function dictFromArrays(keys, vals) {
  var result = {}
  keys.forEach((key, i) => result[key] = vals[i]);
  return result;
}

class Synth {
  constructor(context, keyCodeList, keyList) {
    this.context = context;
    this.keyCodeList = keyCodeList;
    this.keyList = keyList;
    this.keyMap = dictFromArrays(keyCodeList, keyList);
    this.holding = false;
    this.heldKeys = new Set();

    this.gainNode = createGainNode(context);
    this.gainNode.gain.value = 1;

    this.filter = context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 6000;

    keyList.forEach((key, i) => key.gainNode.connect(this.filter));
    this.filter.connect(this.gainNode);
    this.gainNode.connect(context.destination);
  }

  increaseVolume() {
    if (this.gainNode.gain.value <= 4) {
      this.gainNode.gain.value *= 1.25;
    }
  }

  decreaseVolume() {
    if (this.gainNode.gain.value >= 0.25) {
      this.gainNode.gain.value *= 0.8;
    }
  }

  onKeyDown(e) {
    if (e.code in this.keyMap) {
      var currKey = this.keyMap[e.code];
      currKey.press();
      if (this.holding) {
        this.heldKeys.add(currKey);
      }
    } else if (e.code == "ArrowUp") {
      this.increaseVolume();
    } else if (e.code == "ArrowDown") {
      this.decreaseVolume();
    } else if (e.code == "Space") {
      this.heldKeys.forEach((key, i) => key.release());
      this.heldKeys.clear();
      this.holding = true;
    } else if (e.code == "ArrowLeft") {
      this.keyList.forEach((key, i) => key.changeFrequency(0.5));
    } else if (e.code == "ArrowRight") {
      this.keyList.forEach((key, i) => key.changeFrequency(2));
    }
  }

  onKeyUp(e) {
    if (e.code in this.keyMap) {
      var currKey = this.keyMap[e.code];
      if (!this.heldKeys.has(currKey)) {
        currKey.release();
      }
    } else if (e.code == "Space") {
      this.holding = false;
    }
  }
}

function normalizeRatio(ratio, octaveRatio) {
  if (ratio < 1) {
    while (ratio < 1) {
      ratio *= octaveRatio;
    }
  } else if (ratio > octaveRatio) {
    while (ratio > octaveRatio) {
      ratio /= octaveRatio;
    }
  }
  return ratio;
}

function range(size) {
  return [...Array(size).keys()];
}

function createEtScale(octaveRatio, numTones) {
  const EtScale = range(numTones).map(
    i => Math.pow(octaveRatio, i / numTones)
  ).sort();
  EtScale.shift();
  EtScale.push(octaveRatio);
  return EtScale;
}

function createEdoScale(octaveRatio, numTones, degrees) {
  return createEtScale(octaveRatio, numTones).filter(
    ((x, i) => degrees.includes(i + 1))
  );
}

function centsToRatio(cents) {
  return Math.pow(2, cents / 1200);
}

function ratioToCents(ratio) {
  return Math.log2(ratio) * 1200;
}

const quarterCommaFifth = Math.pow(5, 1/4);

const harmonicScale = [9/8, 10/8, 11/8, 12/8, 13/8, 14/8, 15/8, 16/8];
const lambdaScale = [25/21, 9/7, 7/5, 5/3, 9/5, 15/7, 7/3, 25/9, 3/1];
const fiveLimitScale = [16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8, 2/1];
const meantoneScale = range(12).map(
  i => normalizeRatio(Math.pow(quarterCommaFifth, i - 3), 2)
).sort();
meantoneScale.shift();
meantoneScale.push(2);
const werckmeisterScale = [90.2, 192.2, 294.1, 390.2, 498.0, 588.3, 696.1, 792.2, 888.3, 996.1, 1092.2, 1200].map(centsToRatio);
const tet12Scale = createEtScale(2, 12);
const tet10Scale = createEtScale(2, 10);
// base ~74.6
const wellTunedScale = [567/512, 9/8, 147/128, 21/16, 1323/1024, 189/128, 3/2, 49/32, 7/4, 441/256, 63/32, 2/1];
const experimentalScale = [9/8, 7/6, 6/5, 5/4, 4/3, 7/5, 3/2, 8/5, 5/3, 7/4, 15/8, 2.0001];
const edo31ExperimentalScale = createEdoScale(2, 31,
  [2, 3, 5, 7, 8, 10, 13, 15, 18, 20, 21, 23, 25, 26, 28, 31]);
const blackjackScale = createEdoScale(2, 72,
  [5, 7, 12, 14, 19, 21, 23, 28, 30, 35, 37, 42, 44, 49, 51, 56, 58, 63, 65, 70, 72]);
const topMeantone12Scale = range(12).map(
  i => normalizeRatio(Math.pow(centsToRatio(1899.26), i - 3), centsToRatio(1201.7))
).sort();
topMeantone12Scale.shift();
topMeantone12Scale.push(centsToRatio(1201.7));
const pajara10Scale = createEdoScale(2, 22,
  [2, 4, 7, 9, 11, 13, 15, 18, 20, 22]
);

const context = new window.AudioContext();

const A1 = 55;
const scale = experimentalScale;
const baseFrequency = 65;
const baseIndex = 2;
const type = "sawtooth";

console.log(scale);
console.log(scale.map(ratioToCents));

const frequencyList = range(keyCodeList.length).map(
  i => calculateFrequency(scale, baseFrequency, i - baseIndex));
const keyList = frequencyList.map(frequency => createKey(context, frequency, type));

const synth = new Synth(context, keyCodeList, keyList);

var pressedKeys = new Set();

document.onkeydown = event => {
  if (!pressedKeys.has(event.code)) {
    synth.onKeyDown(event);
  }
  pressedKeys.add(event.code);
}

document.onkeyup = event => {
  synth.onKeyUp(event);
  pressedKeys.delete(event.code);
}

document.onclick = event => {
  context.resume();
}
