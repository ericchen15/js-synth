// Instrument presets. They appear in the dropdown on the page; DEFAULT_INSTRUMENT
// in script.js picks the starting one.
//
// Required fields:
//   waveType             OscillatorNode type: "sine", "square", "sawtooth" or "triangle"
//     ...or harmonics    amplitudes [h1, h2, ...] of a custom periodic wave
//   noteGain             per-note volume, before the master gain
//   attackTimeConstant   seconds; how fast a note fades in
//   releaseTimeConstant  seconds; how fast a note fades out after key up
//   lowpassCutoff        Hz; the lowpass filter shared by all keys
//
// Optional fields:
//   decay                the note fades out even while held. Its time constant
//                        is timeConstant * (referenceFrequency / f) ^ pitchExponent
//                        seconds for a note of frequency f, so lower notes
//                        ring longer.
//   brightness           (needs decay) a per-note lowpass that starts at
//                        startHarmonic * f and closes toward endHarmonic * f,
//                        timeConstantRatio times as fast as the volume decays,
//                        so the tone gets darker as it fades.
//   unisonDetuneCents    adds a second oscillator per key, detuned by this many
//                        cents (like a second string tuned slightly off).

const INSTRUMENTS = {
  // The original sound: a sawtooth that sustains at full volume while held.
  synth: {
    waveType: "sawtooth",
    noteGain: 0.05,
    attackTimeConstant: 0.05,
    releaseTimeConstant: 0.03,
    lowpassCutoff: 6000,
  },

  harpsichord: {
    harmonics: pluckedStringHarmonics(0.12, 80),
    noteGain: 0.05,
    attackTimeConstant: 0.002,
    releaseTimeConstant: 0.04,
    lowpassCutoff: 12000,
    decay: { timeConstant: 1.5, referenceFrequency: 220, pitchExponent: 0.5 },
    brightness: { startHarmonic: 30, endHarmonic: 3, timeConstantRatio: 0.4 },
    unisonDetuneCents: 3,
  },
};

/**
 * Harmonic amplitudes for an ideal string plucked at `pluckPosition` (a
 * fraction of its length from one end), as felt at the bridge: harmonic n has
 * amplitude sin(n * pi * pluckPosition) / n. Plucking near the end, as a
 * harpsichord does, keeps it bright. Harmonics that are multiples of
 * 1 / pluckPosition drop out, which gives the nasal color.
 */
function pluckedStringHarmonics(pluckPosition, count) {
  return Array.from({ length: count },
    (_, i) => Math.sin((i + 1) * Math.PI * pluckPosition) / (i + 1));
}
