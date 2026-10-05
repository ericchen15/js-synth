# js-synth

A browser synth that you play with the computer keyboard. It supports microtonal and just-intonation scales and lights up each note on a canvas diagram (a Tonnetz or a JI lattice) while it plays.

## Running

There is no build step and there are no dependencies. Open `index.html` in a browser and click the page once to start audio. There are no tests.

## Architecture

The files are plain classic `<script>`s that share one global scope (no modules). **Load order in `index.html` matters**: a file can only use, at load time, globals defined by files loaded before it. For example, `music/scales.js` calls `createEtScale` from `music/musicUtils.js`, and `script.js` is loaded last. Top-level `const` names have to be unique across all files.

Sound (`audio/`) and drawing (`drawing/`) don't depend on each other. Only `script.js` connects them, by passing each `Key` a `KeyDrawer` as its `listener` (any object with `press(key)` / `release(key)`). Both sides use `music/`.

| File | Role |
|---|---|
| `script.js` | Entry point. **All configuration is here** (scale, base frequency, default instrument, visualization mode); it also wires sound to drawing, fills the instrument dropdown (which reloads the page with `?instrument=<name>`), and handles input |
| `keyboardLayout.js` | `KEY_CODE_LIST`: the order of the physical keys, from lowest to highest pitch |
| `music/musicUtils.js` | `mod` (floor modulo), cents/ratio math, `calculateFrequency`, scale builders (ET, EDO subsets, generator scales) |
| `music/scales.js` | Library of named scales and note-name arrays |
| `audio/synth.js` | `Synth`: maps key events to `Key`s and handles sustain (Space), volume (↑↓) and octave (←→); builds the audio graph |
| `audio/instruments.js` | Instrument presets (`synth` = the original sawtooth, `harpsichord`), listed in the page dropdown; the field reference is at the top of the file |
| `audio/key.js` | `Key`: one note; always-running oscillator(s) gated by a gain envelope, with optional decay and a per-note filter |
| `audio/audioUtils.js` | Web Audio node factories |
| `drawing/keyDrawer.js` | `NoteNode` (point + label) and `KeyDrawer` (lights the nodes for one scale degree) |
| `drawing/tonnetz.js` | Fixed 12-TET Tonnetz layout and its scale-degree → node mapping (default mode) |
| `drawing/lattice.js` | Automatic 2D layout of a JI scale from basis intervals (lattice mode) |
| `drawing/drawingUtils.js`, `drawing/coordinates.js` | Canvas primitives and a 2D point class |

## Key conventions

- **Scale format:** an array of ratios above the root, ascending, with the root (1/1) **omitted** and the **period last** (e.g. 12-TET is `[2^(1/12), ..., 2]`). So `scale[k]` is degree `k + 1`, and degree 0 is the root. Most of the off-by-one arithmetic (such as `keyDrawers[mod(steps - 1, n)]`) comes from this.
- Key `i` in `KEY_CODE_LIST` plays `i - BASE_KEY_INDEX` scale steps above `BASE_FREQUENCY`.
- There is one `KeyDrawer` per scale degree, shared by every key that plays that degree in any octave. In Tonnetz mode the scale must have exactly 12 notes.
- Some periods are deliberately `2.001` / `2.0001` (slightly stretched octaves). Don't normalize them to 2.
- `drawLine` deliberately doesn't call `beginPath()`. The overdraw is what makes the grid lines solid; changing it changes how they look.

## Verifying changes

The user tests changes by playing them, so keep verification light: make the change, commit and push, and say what to try. Don't build test harnesses or render audio unless asked. If a quick check helps, headless Chrome is at `C:/Program Files/Google/Chrome/Application/chrome.exe` (`--headless=new --allow-file-access-from-files --dump-dom`). Node is not installed.
