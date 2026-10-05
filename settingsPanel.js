// The settings panel above the canvas: an instrument dropdown plus an input for
// every instrument setting (the fields are documented in audio/instruments.js).
// Choosing an instrument fills in all the inputs from its preset; editing any
// input switches the dropdown to "Custom".

// Values shown for settings a preset leaves out (e.g. the synth has no decay).
const SETTING_DEFAULTS = {
  waveType: "sawtooth",
  pluckPosition: 0.12,
  harmonicCount: 80,
  unisonDetuneCents: 0,
  noteGain: 0.05,
  attackTimeConstant: 0.05,
  releaseTimeConstant: 0.03,
  lowpassCutoff: 6000,
  decay: { timeConstant: 1.5, referenceFrequency: 220, pitchExponent: 0.5 },
  brightness: { startHarmonic: 30, endHarmonic: 3, timeConstantRatio: 0.4 },
};

// One <fieldset> per group. A group with `optional` gets a checkbox; when it's
// unchecked, that setting is null (off).
const SETTING_GROUPS = [
  { title: "Tone", fields: [
    { path: "waveType", label: "Waveform", options: ["sine", "square", "sawtooth", "triangle", "plucked"] },
    { path: "pluckPosition", label: "Pluck position", step: 0.01, min: 0.01, max: 0.5,
      onlyIf: settings => settings.waveType === "plucked" },
    { path: "harmonicCount", label: "Harmonics", step: 1, min: 1, max: 500,
      onlyIf: settings => settings.waveType === "plucked" },
    { path: "unisonDetuneCents", label: "2nd string detune (cents)", step: 0.5, min: 0 },
  ] },
  { title: "Volume", fields: [
    { path: "noteGain", label: "Note gain", step: 0.005, min: 0 },
    { path: "attackTimeConstant", label: "Attack (s)", step: 0.001, min: 0.001 },
    { path: "releaseTimeConstant", label: "Release (s)", step: 0.005, min: 0.001 },
  ] },
  { title: "Filter", fields: [
    { path: "lowpassCutoff", label: "Lowpass cutoff (Hz)", step: 100, min: 20 },
  ] },
  { title: "Decay while held", optional: "decay", fields: [
    { path: "decay.timeConstant", label: "Time constant (s)", step: 0.1, min: 0.01 },
    { path: "decay.referenceFrequency", label: "at frequency (Hz)", step: 10, min: 1 },
    { path: "decay.pitchExponent", label: "Pitch exponent", step: 0.1 },
  ] },
  { title: "Brightness (needs decay)", optional: "brightness", fields: [
    { path: "brightness.startHarmonic", label: "Start harmonic", step: 1, min: 0.1 },
    { path: "brightness.endHarmonic", label: "End harmonic", step: 0.5, min: 0.1 },
    { path: "brightness.timeConstantRatio", label: "Speed vs. decay", step: 0.05, min: 0.01 },
  ] },
];

/**
 * Builds the panel inside `container`, showing preset `initialInstrument`.
 * Calls onChange(settings) with a fresh settings object whenever anything
 * changes, and returns the initial settings.
 */
function createSettingsPanel(container, instruments, initialInstrument, onChange) {
  const inputs = {};        // field path -> <input>/<select>
  const groupToggles = {};  // optional setting name -> checkbox

  const instrumentSelect = createSelect([...Object.keys(instruments), "custom"]);
  instrumentSelect.querySelector('option[value="custom"]').disabled = true;
  container.appendChild(createLabeled("Instrument", instrumentSelect));

  const groups = document.createElement("div");
  groups.className = "settingGroups";
  container.appendChild(groups);

  SETTING_GROUPS.forEach(group => {
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    if (group.optional) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      groupToggles[group.optional] = checkbox;
      legend.append(createLabeled(group.title, checkbox, true));
    } else {
      legend.textContent = group.title;
    }
    fieldset.appendChild(legend);

    group.fields.forEach(field => {
      const input = field.options ? createSelect(field.options) : createNumberInput(field);
      inputs[field.path] = input;
      fieldset.appendChild(createLabeled(field.label, input));
    });
    groups.appendChild(fieldset);
  });

  function readSettings() {
    const settings = structuredClone(SETTING_DEFAULTS);
    SETTING_GROUPS.forEach(group => group.fields.forEach(field => {
      const value = inputs[field.path].value;
      setPath(settings, field.path, field.options ? value : Number(value));
    }));
    Object.entries(groupToggles).forEach(([name, checkbox]) => {
      if (!checkbox.checked) {
        settings[name] = null;
      }
    });
    return settings;
  }

  function showPreset(preset) {
    SETTING_GROUPS.forEach(group => group.fields.forEach(field => {
      inputs[field.path].value = getPath(preset, field.path) ?? getPath(SETTING_DEFAULTS, field.path);
    }));
    Object.entries(groupToggles).forEach(([name, checkbox]) => {
      checkbox.checked = preset[name] != null;
    });
  }

  /** Greys out inputs that currently have no effect. */
  function updateDisabled(settings) {
    SETTING_GROUPS.forEach(group => group.fields.forEach(field => {
      const groupOff = group.optional && !groupToggles[group.optional].checked;
      inputs[field.path].disabled = groupOff || (field.onlyIf && !field.onlyIf(settings));
    }));
  }

  function apply() {
    const settings = readSettings();
    updateDisabled(settings);
    onChange(settings);
  }

  // After each change, give focus back to the page so the keyboard plays notes again.
  instrumentSelect.onchange = () => {
    showPreset(instruments[instrumentSelect.value]);
    apply();
    instrumentSelect.blur();
  };
  [...Object.values(inputs), ...Object.values(groupToggles)].forEach(input => {
    input.onchange = () => {
      instrumentSelect.value = "custom";
      apply();
      input.blur();
    };
  });

  instrumentSelect.value = initialInstrument;
  showPreset(instruments[initialInstrument]);
  const settings = readSettings();
  updateDisabled(settings);
  return settings;
}

function createSelect(values) {
  const select = document.createElement("select");
  values.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value.charAt(0).toUpperCase() + value.slice(1);
    select.appendChild(option);
  });
  return select;
}

function createNumberInput(field) {
  const input = document.createElement("input");
  input.type = "number";
  input.step = field.step;
  if (field.min !== undefined) input.min = field.min;
  if (field.max !== undefined) input.max = field.max;
  return input;
}

/** Wraps an input in a <label> with text before it (or after, for checkboxes). */
function createLabeled(text, input, textAfter = false) {
  const label = document.createElement("label");
  if (textAfter) {
    label.append(input, " " + text);
  } else {
    label.append(text + " ", input);
  }
  return label;
}

/** getPath({a: {b: 1}}, "a.b") === 1; undefined if any part is missing. */
function getPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function setPath(object, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  keys.reduce((value, key) => value[key], object)[last] = value;
}
