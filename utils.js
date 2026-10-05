// Generic helpers with no dependencies.

/** Mathematical modulo: the result is always in [0, n), even for negative a. */
function mod(a, n) {
  return ((a % n) + n) % n;
}

/** Builds a plain object mapping keys[i] -> vals[i] (keys are stringified). */
function dictFromArrays(keys, vals) {
  const result = {};
  keys.forEach((key, i) => result[key] = vals[i]);
  return result;
}

/** Returns [0, 1, ..., size - 1]. */
function range(size) {
  return [...Array(size).keys()];
}
