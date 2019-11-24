t keyCodeList = [
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
  constructor(oscillator, gainNode) {
    this.oscillator = oscillator;
    this.gainNode = gainNode;
    this.status = "ready";
  }

  press() {
    if (this.status == "ready") {
      this.gainNode.gain.value = 0.05;
      this.status = "pressed";
    }
  }

  release() {
    if (this.status == "pressed") {
      this.gainNode.gain.value = 0;
      this.status = "ready";
    }
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
  return new Key(oscillator, gainNode);
}

function calculateFrequency(scale, baseFrequency, offset) {
  const scaleLength = scale.length;
  const taveRatio = scale[scale.length - 1];
  const tavesAboveBase = Math.floor(offset / scale.length);
  const index = offset % scale.length;
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
    this.filter.frequency.value = 4000;

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
    } else if (e.code == "ShiftLeft") {
      this.heldKeys.forEach((key, i) => key.release());
      this.heldKeys.clear();
      this.holding = true;
    }
  }

  onKeyUp(e) {
    if (e.code in this.keyMap) {
      var currKey = this.keyMap[e.code];
      if (!this.heldKeys.has(currKey)) {
        currKey.release();
      }
    } else if (e.code == "ShiftLeft") {
      this.holding = false;
    }
  }
}

const harmonicScale = [9/8, 10/8, 11/8, 12/8, 13/8, 14/8, 15/8, 16/8];
const lambdaScale = [25/21, 9/7, 7/5, 5/3, 9/5, 15/7, 7/3, 25/9, 3/1];
const fiveLimitScale = [16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8, 2/1];

const context = new window.AudioContext();
const range = [...Array(keyCodeList.length).keys()];

const scale = harmonicScale;
const baseFrequency = 65;
const baseIndex = 2;
const type = "sawtooth";

const frequencyList = range.map(i => calculateFrequency(scale, baseFrequency, i - baseIndex));
const keyList = frequencyList.map(frequency => createKey(context, frequency, type));

const synth = new Synth(context, keyCodeList, keyList);

document.onkeydown = event => synth.onKeyDown(event);
document.onkeyup = event => synth.onKeyUp(event);
