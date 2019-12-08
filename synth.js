class Synth {
  constructor(context, keyCodeList, keyList, filter) {
    this.context = context;
    this.keyCodeList = keyCodeList;
    this.keyList = keyList;
    this.keyMap = dictFromArrays(keyCodeList, keyList);
    this.filter = filter;

    this.holding = false;
    this.heldKeys = new Set();

    this.gainNode = createGainNode(context);
    this.gainNode.gain.value = 1;

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
