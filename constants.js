// Computer-keyboard layout. Each group of four is one diagonal column of the
// keyboard, from the number row down to the bottom row, and the columns go
// left to right. Each key is one scale step higher than the one before it, so
// pitch goes up as you move down a column and then on to the next column to
// the right. script.js decides which key plays the base frequency.
const KEY_CODE_LIST = [
  "Backquote", "Tab", "CapsLock", "ShiftLeft",
  "Digit1", "KeyQ", "KeyA", "KeyZ",
  "Digit2", "KeyW", "KeyS", "KeyX",
  "Digit3", "KeyE", "KeyD", "KeyC",
  "Digit4", "KeyR", "KeyF", "KeyV",
  "Digit5", "KeyT", "KeyG", "KeyB",
  "Digit6", "KeyY", "KeyH", "KeyN",
  "Digit7", "KeyU", "KeyJ", "KeyM",
  "Digit8", "KeyI", "KeyK", "Comma",
  "Digit9", "KeyO", "KeyL", "Period",
  "Digit0", "KeyP", "Semicolon", "Slash",
  "Minus", "BracketLeft", "Quote", "ShiftRight",
  "Equal", "BracketRight", "Enter"
];

// Other base frequencies (Hz) to try for BASE_FREQUENCY in script.js.
const A1 = 55;
const WELL_TUNED_BASE = 74.6;
