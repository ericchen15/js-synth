# js-synth

A browser synth that you play with the computer keyboard. It supports microtonal and just-intonation scales and lights up each note on a canvas diagram (a Tonnetz or a JI lattice) while it plays.

## Running

There is no build step and there are no dependencies. Open `index.html` in a browser and click the page once to start audio. There are no tests.

## Architecture

The files are plain classic `<script>`s that share one global scope (no modules). **Load order in `index.html` matters**: a file can only use, at load time, globals defined by files loaded before it. For example, `scales.js` calls `createEtScale` from `musicUtils.js`, and `script.js` is loaded last. Top-level `const` names have to be unique across all files.

| File | Role |
|---|---|
| `script.js` | Entry point. **All configuration is here** (scale, base frequency, wave, filter, visualization mode); it also wires everything together and handles input |
| `synth.js` | `Synth`: maps key events to `Key`s and handles sustain (Space), volume (↑↓) and octave (←→); builds the audio graph |
| `key.js` | `Key`: one note; an always-running oscillator gated by a gain envelope |
| `constants.js` | `KEY_CODE_LIST`: the order of the physical keys, from lowest to highest pitch |
| `musicUtils.js` | Cents/ratio math, `calculateFrequency`, scale builders (ET, EDO subsets, generator scales) |
| `scales.js` | Library of named scales and note-name arrays |
| `lattice.js` | Automatic 2D layout of a JI scale from basis intervals (lattice mode) |
| `tonnetz.js` | Fixed 12-TET Tonnetz layout and its scale-degree → node mapping (default mode) |
| `keyDrawer.js` | `NoteNode` (point + label) and `KeyDrawer` (lights the nodes for one scale degree) |
| `drawingUtils.js`, `audioUtils.js`, `coordinates.js`, `utils.js` | Small helpers |

## Key conventions

- **Scale format:** an array of ratios above the root, ascending, with the root (1/1) **omitted** and the **period last** (e.g. 12-TET is `[2^(1/12), ..., 2]`). So `scale[k]` is degree `k + 1`, and degree 0 is the root. Most of the off-by-one arithmetic (such as `keyDrawers[mod(steps - 1, n)]`) comes from this.
- Key `i` in `KEY_CODE_LIST` plays `i - BASE_KEY_INDEX` scale steps above `BASE_FREQUENCY`.
- There is one `KeyDrawer` per scale degree, shared by every key that plays that degree in any octave. In Tonnetz mode the scale must have exactly 12 notes.
- Some periods are deliberately `2.001` / `2.0001` (slightly stretched octaves). Don't normalize them to 2.
- `drawLine` deliberately doesn't call `beginPath()`. The overdraw is what makes the grid lines solid; changing it changes how they look.

## Verifying changes

With no tests, refactors were checked by loading the old and new code in headless Chrome with a recording fake `AudioContext` and a logging canvas, sending the same scripted key events, and diffing the audio operations, canvas calls and `canvas.toDataURL()`. Chrome is at `C:\Program Files\Google\Chrome\Application\chrome.exe` (`--headless=new --allow-file-access-from-files --dump-dom` / `--screenshot`). Node is not installed.
