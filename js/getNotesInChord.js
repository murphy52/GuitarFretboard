/**
 * Gets the notes in a chord based on the chord name
 * @param {string} chord - The chord name (e.g., "C", "Am", "G7", "Dmaj7")
 * @returns {Array} Array of notes in the chord
 */
function getNotesInChord(chord) {
    // Improved error handling
    if (!chord || typeof chord !== 'string') {
        console.error('Invalid chord provided to getNotesInChord');
        return [];
    }

    // Use a single array of 12 notes and use modulo for wrapping
    const notes = ['A','Bb','B','C','C#','D','Eb','E','F','F#','G','G#'];
    const notesAlt = ['A','A#','B','C','Db','D','D#','E','F','Gb','G','Ab'];
    
    const chordFormulas = {
        major: [0, 4, 7],
        minor: [0, 3, 7],
        maj7:  [0, 4, 7, 11],
        min7:  [0, 3, 7, 10],
        dom7:  [0, 4, 7, 10],
        sus4:  [0, 5, 7],
        sus2:  [0, 2, 7],
        dim:   [0, 3, 6],
        dim7:  [0, 3, 6, 9],
        aug:   [0, 4, 8],
        add9:  [0, 4, 7, 14],
        m9:    [0, 3, 7, 10, 14]
    };
    
    let root = '';
    let rootIndex = -1;
    let chordNotes = [];
    let formula = '';

    try {
        // Determine root note
        if (!chord || chord.length < 1) {
            throw new Error("Empty chord name provided");
        }
        
        root = chord.charAt(0);
        if (chord.length > 1 && (chord.charAt(1) === '#' || chord.charAt(1) === 'b')) {
            root = chord.charAt(0) + chord.charAt(1);
        }

        // Determine root index
        rootIndex = notes.indexOf(root);
        if (rootIndex === -1) {
            rootIndex = notesAlt.indexOf(root);
            if (rootIndex === -1) {
                console.error(`Unknown root note: ${root}`);
                return [];
            }
        }

        // Determine chord formula
        if (chord.includes("maj7")) {
            formula = 'maj7';
        } else if (chord.includes("sus4")) {
            formula = 'sus4';
        } else if (chord.includes("sus2")) {
            formula = 'sus2';
        } else if (chord.includes("m7") || chord.includes("min7")) {
            formula = 'min7';
        } else if (chord.includes("m9") || chord.includes("min9")) {
            formula = 'm9';
        } else if (chord.includes("m") || chord.includes("min")) {
            formula = 'minor';
        } else if (chord.includes("dim7")) {
            formula = 'dim7';
        } else if (chord.includes("dim")) {
            formula = 'dim';
        } else if (chord.includes("aug")) {
            formula = 'aug';
        } else if (chord.includes("add9")) {
            formula = 'add9';
        } else if (chord.includes("7")) {
            formula = 'dom7';
        } else {
            formula = 'major';
        }

        // Apply chord formula and extract notes
        if (!chordFormulas[formula]) {
            console.error(`Unknown chord formula: ${formula}`);
            return [];
        }

        chordFormulas[formula].forEach(interval => {
            // Use modulo to wrap around the 12-note array
            const noteIndex = (rootIndex + interval) % 12;
            chordNotes.push(notes[noteIndex]);
        });

        return chordNotes;
    } catch (error) {
        console.error(`Error in getNotesInChord: ${error.message}`);
        return [];
    }
}
