// Tuning math.
//
// SCALE FORMAT (used throughout the project): a scale is an array of frequency
// ratios relative to the root, in ascending order. The root itself (1/1) is
// omitted and the last entry is the period (the interval at which the scale
// repeats, usually ~2 for an octave). So scale[k] is scale degree k + 1, and
// degree 0 is the root. Example, 12-TET: [2^(1/12), 2^(2/12), ..., 2].

/**
 * Mathematical modulo: the result is always in [0, n), even for negative a
 * (unlike %). Use it to wrap a step count, which can be negative, into a
 * scale degree.
 */
function mod(a, n) {
  return ((a % n) + n) % n;
}

function centsToRatio(cents) {
  return Math.pow(2, cents / 1200);
}

function ratioToCents(ratio) {
  return Math.log2(ratio) * 1200;
}

/** Shifts a ratio by whole periods until it lies in [1, periodRatio]. */
function normalizeRatio(ratio, periodRatio) {
  while (ratio < 1) {
    ratio *= periodRatio;
  }
  while (ratio > periodRatio) {
    ratio /= periodRatio;
  }
  return ratio;
}

/**
 * Frequency of the note `offset` scale steps above baseFrequency (negative
 * offsets go down). Steps past the end of the scale wrap into the next period.
 */
function calculateFrequency(scale, baseFrequency, offset) {
  const periodRatio = scale[scale.length - 1];
  const periodsAboveBase = Math.floor(offset / scale.length);
  const degree = mod(offset, scale.length);
  const periodMultiplier = Math.pow(periodRatio, periodsAboveBase);
  const degreeMultiplier = degree > 0 ? scale[degree - 1] : 1;
  return baseFrequency * periodMultiplier * degreeMultiplier;
}

/** Equal temperament: divides periodRatio into numTones equal steps. */
function createEtScale(periodRatio, numTones) {
  return Array.from({ length: numTones }, (_, i) => Math.pow(periodRatio, (i + 1) / numTones));
}

/**
 * A subset of an equal temperament. `degrees` are 1-based step numbers of the
 * ET (the last one is normally numTones, i.e. the period).
 */
function createEdoScale(periodRatio, numTones, degrees) {
  const etScale = createEtScale(periodRatio, numTones);
  return degrees.map(degree => etScale[degree - 1]);
}

/**
 * A rank-2 (period + generator) scale: stacks numTones generators, with
 * positionOfRoot of them below the root, and reduces each into one period.
 * E.g. a fifth generator with positionOfRoot 3 gives the notes from E♭ (3
 * fifths below C) up to G♯.
 */
function createGeneratorScale(periodRatio, generatorRatio, numTones, positionOfRoot) {
  const generatorScale = Array.from({ length: numTones },
    (_, i) => normalizeRatio(Math.pow(generatorRatio, i - positionOfRoot), periodRatio)
  ).sort((a, b) => a - b);
  generatorScale.shift(); // drop the root (1/1)
  generatorScale.push(periodRatio);
  return generatorScale;
}
