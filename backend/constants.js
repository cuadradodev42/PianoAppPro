const PIANO_KEYS = [
  { note: "C4", type: "white", frequency: 261.63, label: "Do" },
  { note: "C#4", type: "black", frequency: 277.18, label: "Do#" },
  { note: "D4", type: "white", frequency: 293.66, label: "Re" },
  { note: "D#4", type: "black", frequency: 311.13, label: "Re#" },
  { note: "E4", type: "white", frequency: 329.63, label: "Mi" },
  { note: "F4", type: "white", frequency: 349.23, label: "Fa" },
  { note: "F#4", type: "black", frequency: 369.99, label: "Fa#" },
  { note: "G4", type: "white", frequency: 392.0, label: "Sol" },
  { note: "G#4", type: "black", frequency: 415.3, label: "Sol#" },
  { note: "A4", type: "white", frequency: 440.0, label: "La" },
  { note: "A#4", type: "black", frequency: 466.16, label: "La#" },
  { note: "B4", type: "white", frequency: 493.88, label: "Si" },
]

const SCALES = {
  "C Major": [0, 2, 4, 5, 7, 9, 11],
  "G Major": [7, 9, 11, 0, 2, 4, 6],
  "D Major": [2, 4, 6, 7, 9, 11, 1],
  "A Major": [9, 11, 1, 2, 4, 6, 8],
  "E Major": [4, 6, 8, 9, 11, 1, 3],
  "F Major": [5, 7, 9, 10, 0, 2, 4],
  "C Pentatonic": [0, 2, 4, 7, 9],
  "A Minor Pentatonic": [9, 0, 2, 4, 7],
}

const SCALE_NAMES = Object.keys(SCALES)

function isKeyInScale(keyIndex, scaleName) {
  const scaleIndices = SCALES[scaleName] || SCALES["C Major"]
  return scaleIndices.includes(keyIndex % 12)
}

module.exports = {
  PIANO_KEYS,
  SCALES,
  SCALE_NAMES,
  isKeyInScale,
}
