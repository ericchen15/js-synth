class Key {
  constructor(context, oscillator, gainNode, keyDrawer) {
    this.context = context;
    this.oscillator = oscillator;
    this.gainNode = gainNode;
    this.keyDrawer = keyDrawer;
  }

  press() {
    this.gainNode.gain.value = 0.0;
    this.gainNode.gain.setTargetAtTime(0.05, context.currentTime, 0.05);
    this.keyDrawer.press(this);
  }

  release() {
    this.gainNode.gain.setTargetAtTime(0, context.currentTime, 0.03);
    this.keyDrawer.release(this);
  }

  changeFrequency(factor) {
    this.oscillator.frequency.value *= factor;
  }
}

function createKey(context, frequency, waveType, keyDrawer) {
  const oscillator = createOscillator(context, frequency, waveType);
  const gainNode = createGainNode(context);
  oscillator.connect(gainNode);
  oscillator.start(0);
  return new Key(context, oscillator, gainNode, keyDrawer);
}
