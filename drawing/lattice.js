// Automatic lattice layout for just-intonation scales, used when
// VISUALIZATION is "lattice" in script.js.
//
// Starting from the root, each note is placed relative to a note that's
// already placed: if it is basisRatios[k] above that note it goes at
// (that note + basisDirections[k]), and if it's the inverse of
// basisRatios[k] it goes at (that note - basisDirections[k]).

/** True if two positive numbers are within ~0.01% of each other. */
function almostEqual(num1, num2) {
  return 0.9999 < num2 / num1 && num2 / num1 < 1.0001;
}

/**
 * If the interval note1 -> note2 (reduced into one period) matches one of
 * `consonances` or its inversion (periodRatio / consonance), returns the
 * matching ratio. Returns 0 if nothing matches.
 */
function findConsonance(note1, note2, periodRatio, consonances) {
  const intervalRatio = normalizeRatio(note2 / note1, periodRatio);
  for (const consonance of consonances) {
    if (almostEqual(intervalRatio, consonance)) {
      return consonance;
    }
    const invertedConsonance = periodRatio / consonance;
    if (almostEqual(intervalRatio, invertedConsonance)) {
      return invertedConsonance;
    }
  }
  return 0;
}

/**
 * Returns where `note` goes, based on the first already-placed note that is
 * one basis interval away from it, or null if there is no such note yet.
 */
function getCoordinatesIfPossible(
    scaleToCoordinates,
    basisRatios,
    basisDirections,
    note,
    periodRatio) {
  const invertedBasisRatios = basisRatios.map(ratio => periodRatio / ratio);
  for (const [knownNote, knownCoordinates] of scaleToCoordinates) {
    const consonance = findConsonance(knownNote, note, periodRatio, basisRatios);

    let basisIndex = basisRatios.indexOf(consonance);
    if (basisIndex != -1) {
      return knownCoordinates.add(basisDirections[basisIndex]);
    }

    basisIndex = invertedBasisRatios.indexOf(consonance);
    if (basisIndex != -1) {
      return knownCoordinates.subtract(basisDirections[basisIndex]);
    }
  }
  return null;
}

/**
 * Returns a Map of each note in `scale` to its Coordinates. The period (which
 * stands in for the root) is placed at rootCoordinates.
 *
 * Warning: this never finishes if some note can't be reached from the root
 * through basis intervals.
 */
function getAllCoordinates(scale, basisRatios, rootCoordinates, basisDirections) {
  const scaleToCoordinates = new Map();
  const periodRatio = scale[scale.length - 1];
  scaleToCoordinates.set(periodRatio, rootCoordinates);

  while (scaleToCoordinates.size < scale.length) {
    for (const note of scale) {
      if (!scaleToCoordinates.has(note)) {
        const possibleCoordinates = getCoordinatesIfPossible(
          scaleToCoordinates, basisRatios, basisDirections, note, periodRatio
        );
        if (possibleCoordinates != null) {
          scaleToCoordinates.set(note, possibleCoordinates);
        }
      }
    }
  }

  return scaleToCoordinates;
}

/** Returns every pair [note1, note2] in `scale` whose interval is in `consonances`. */
function getAllConsonances(scale, consonances) {
  const allConsonances = [];
  const periodRatio = scale[scale.length - 1];

  for (let i = 0; i < scale.length - 1; i++) {
    for (let j = i + 1; j < scale.length; j++) {
      if (findConsonance(scale[i], scale[j], periodRatio, consonances) > 0) {
        allConsonances.push([scale[i], scale[j]]);
      }
    }
  }
  return allConsonances;
}
