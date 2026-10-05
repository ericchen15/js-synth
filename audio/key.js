/**
 * One playable note, shaped by an instrument preset (see audio/instruments.js).
 * Its oscillators run all the time, and pressing or releasing the key only
 * ramps the gain (and the per-note filter, if there is one).
 *
 * Signal path: oscillator(s) -> [noteFilter] -> gainNode -> (Synth's shared filter).
 *
 * `listener` is any object with press(key) and release(key) methods, which are
 * called after the sound starts and stops (script.js passes a KeyDrawer). This
 * is the only link from the sound code to the outside world.
 */
class Key {
  constructor(context, instrument, oscillators, noteFilter, gainNode, listener) {
    this.context = context;
    this.instrument = instrument;
    this.oscillators = oscillators;
    this.noteFilter = noteFilter;  // null unless instrument.brightness is set
    this.gainNode = gainNode;
    this.listener = listener;
  }

  press() {
    const now = this.context.currentTime;
    const gain = this.gainNode.gain;
    gain.cancelScheduledValues(now);  // drop a decay left over from the last press
    gain.value = 0.0;
    gain.setTargetAtTime(this.instrument.noteGain, now, this.instrument.attackTimeConstant);

    if (this.instrument.decay) {
      const decayTimeConstant = this.decayTimeConstant();
      // A target curve gets ~95% of the way there in 3 time constants.
      gain.setTargetAtTime(0, now + 3 * this.instrument.attackTimeConstant, decayTimeConstant);

      if (this.noteFilter) {
        const { startHarmonic, endHarmonic, timeConstantRatio } = this.instrument.brightness;
        const frequency = this.noteFilter.frequency;
        frequency.cancelScheduledValues(now);
        frequency.setValueAtTime(this.clampToNyquist(startHarmonic * this.frequency()), now);
        frequency.setTargetAtTime(
          this.clampToNyquist(endHarmonic * this.frequency()),
          now,
          timeConstantRatio * decayTimeConstant
        );
      }
    }
    this.listener.press(this);
  }

  release() {
    const now = this.context.currentTime;
    const gain = this.gainNode.gain;
    gain.cancelScheduledValues(now);  // otherwise a pending decay would override the release
    gain.setTargetAtTime(0, now, this.instrument.releaseTimeConstant);
    this.listener.release(this);
  }

  /** Silences the key for good and unhooks it from the audio graph. */
  stop() {
    this.oscillators.forEach(oscillator => oscillator.stop());
    this.gainNode.disconnect();
  }

  /** Multiplies the pitch, e.g. by 2 to go up an octave. */
  changeFrequency(factor) {
    this.oscillators.forEach(oscillator => oscillator.frequency.value *= factor);
  }

  /** The current pitch in Hz (this changes with octave shifts). */
  frequency() {
    return this.oscillators[0].frequency.value;
  }

  decayTimeConstant() {
    const { timeConstant, referenceFrequency, pitchExponent } = this.instrument.decay;
    return timeConstant * Math.pow(referenceFrequency / this.frequency(), pitchExponent);
  }

  clampToNyquist(frequency) {
    return Math.min(frequency, this.context.sampleRate / 2);
  }
}

/** Creates a Key whose oscillators are started and wired to a silent gain node. */
function createKey(context, frequency, instrument, listener) {
  const detunes = instrument.unisonDetuneCents ? [0, instrument.unisonDetuneCents] : [0];
  const oscillators = detunes.map(cents => {
    const oscillator = instrument.waveType === "plucked"
      ? createCustomOscillator(context, frequency,
          pluckedStringHarmonics(instrument.pluckPosition, instrument.harmonicCount))
      : createOscillator(context, frequency, instrument.waveType);
    if (cents !== 0) {
      oscillator.detune.value = cents;
    }
    return oscillator;
  });
  const gainNode = createGainNode(context);

  let noteFilter = null;
  if (instrument.brightness) {
    noteFilter = createFilter(context, "lowpass", context.sampleRate / 2);
    noteFilter.connect(gainNode);
  }

  oscillators.forEach(oscillator => {
    oscillator.connect(noteFilter || gainNode);
    oscillator.start(0);
  });
  return new Key(context, instrument, oscillators, noteFilter, gainNode, listener);
}

function createCustomOscillator(context, frequency, harmonics) {
  const oscillator = context.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.setPeriodicWave(createPeriodicWave(context, harmonics));
  return oscillator;
}
