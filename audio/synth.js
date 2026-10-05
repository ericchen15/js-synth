/**
 * Routes keyboard events to Keys, and also handles the sustain, volume and
 * octave controls.
 *
 * Audio graph: each Key's gain -> filter -> master gain -> speakers.
 */
class Synth {
  constructor(context, keyCodeList, keyList, filter) {
    this.context = context;
    this.keyCodeList = keyCodeList;
    this.keyList = keyList;
    this.keyMap = new Map(keyCodeList.map((code, i) => [code, keyList[i]]));  // event.code -> Key
    this.filter = filter;

    // Sustain: while Space is down (`holding`), any key that gets pressed goes
    // into heldKeys and keeps sounding after it's released. Those keys stop
    // the next time Space is pressed.
    this.holding = false;
    this.heldKeys = new Set();

    this.gainNode = createGainNode(context);
    this.gainNode.gain.value = 1;

    keyList.forEach(key => key.gainNode.connect(this.filter));
    this.filter.connect(this.gainNode);
    this.gainNode.connect(context.destination);
  }

  /**
   * Swaps in a new set of keys (e.g. built with another instrument). Old keys
   * that are still sounding fade out with their normal release, and sustain is
   * cleared.
   */
  replaceKeys(keyList) {
    this.keyList.forEach(key => key.dispose());
    this.heldKeys.clear();

    this.keyList = keyList;
    this.keyMap = new Map(this.keyCodeList.map((code, i) => [code, keyList[i]]));
    keyList.forEach(key => key.gainNode.connect(this.filter));
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
    if (this.keyMap.has(e.code)) {
      const currKey = this.keyMap.get(e.code);
      currKey.press();
      if (this.holding) {
        this.heldKeys.add(currKey);
      }
    } else if (e.code === "ArrowUp") {
      this.increaseVolume();
    } else if (e.code === "ArrowDown") {
      this.decreaseVolume();
    } else if (e.code === "Space") {
      this.heldKeys.forEach(key => key.release());
      this.heldKeys.clear();
      this.holding = true;
    } else if (e.code === "ArrowLeft") {
      this.keyList.forEach(key => key.changeFrequency(0.5));
    } else if (e.code === "ArrowRight") {
      this.keyList.forEach(key => key.changeFrequency(2));
    }
  }

  onKeyUp(e) {
    if (this.keyMap.has(e.code)) {
      const currKey = this.keyMap.get(e.code);
      if (!this.heldKeys.has(currKey)) {
        currKey.release();
      }
    } else if (e.code === "Space") {
      this.holding = false;
    }
  }
}
