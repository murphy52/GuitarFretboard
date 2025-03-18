/**
 * Sets up keyboard event listeners for controlling the fretboard
 * @param {Fretboard} fretboard - The fretboard instance to control
 */
function listenToKeyPress(fretboard) {
    let root = '';
    let accidental = '';
    let quality = '';
    let extension = '';
    let alteredTones = '';
    let timer;

    document.addEventListener('keydown', function(event) {
        // Prevent default behavior for arrow keys to avoid page scrolling
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
            event.preventDefault();
        }

        // Skip if modifier keys are pressed (Control, Alt, Meta)
        if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
        }

        // Navigation controls
        if (event.key === "ArrowLeft") {
            // Go to previous chord
            if (fretboard.chordSequence && typeof fretboard.previousChord === 'function') {
                fretboard.previousChord();
                if (typeof fretboard.chordSequence.getCurrentChord === 'function') {
                    fretboard.highlightChordTones(fretboard.chordSequence.getCurrentChord());
                }
            }
        } else if (event.key === "ArrowRight") {
            // Go to next chord
            if (fretboard.chordSequence && typeof fretboard.nextChord === 'function') {
                fretboard.nextChord();
                if (typeof fretboard.chordSequence.getCurrentChord === 'function') {
                    fretboard.highlightChordTones(fretboard.chordSequence.getCurrentChord());
                }
            }
        } else if (event.key === " ") {
            // Space bar toggles play/pause
            if (fretboard.timeout) {
                clearTimeout(fretboard.timeout);
                fretboard.timeout = null;
                
                // Update play/pause button if it exists
                const playPauseButton = fretboard.parentElement.querySelector('#_gf_controls button:first-child');
                if (playPauseButton) {
                    playPauseButton.innerText = '▶️';
                }
            } else if (fretboard.chordSequence && typeof fretboard.playCurrentChord === 'function') {
                fretboard.playCurrentChord();
                
                // Update play/pause button if it exists
                const playPauseButton = fretboard.parentElement.querySelector('#_gf_controls button:first-child');
                if (playPauseButton) {
                    playPauseButton.innerText = '⏸️';
                }
            }
        } else if (event.key === "Escape") {
            // Escape key clears the fretboard
            fretboard.removeNoteHighlights();
            if (fretboard.parentElement) {
                const outputElement = fretboard.parentElement.querySelector('#_output');
                const beatMarkerElement = fretboard.parentElement.querySelector('#_beatMarker');
                if (outputElement) outputElement.innerText = '';
                if (beatMarkerElement) beatMarkerElement.innerHTML = '';
            }
            resetChordInput();
        } else if (event.key === "r" || event.key === "R") {
            // 'r' key rotates the fretboard
            fretboard.rotate();
        } else if (event.key === "f" || event.key === "F") {
            // 'f' key flips the fretboard
            fretboard.flip();
        } else {
            // Chord building
            handleChordInput(event);
        }
    });

    /**
     * Handles keyboard input for building chords
     * @param {KeyboardEvent} event - The keyboard event
     */
    function handleChordInput(event) {
        if (root.length) {
            // If we already have a root note, check for chord qualities
            if (event.key.match(/m/i) && !quality) {
                quality = 'm';
                startTimer();
            } else if (event.key.match(/a/i) && !quality) {
                quality = 'aug';
                startTimer();
            } else if (event.key.match(/d/i) && !quality) {
                quality = 'dim';
                startTimer();
            } else if (event.key.match(/s/i) && !quality) {
                quality = 'sus';
                startTimer();
            } else if (event.key.match(/[0-9]/)) {
                // Handle extensions (7, 9, etc.)
                extension = event.key;
                startTimer();
            } else if (event.key.match(/#|b/) && !accidental) {
                // Handle accidentals
                accidental = event.key;
                startTimer();
            }
        } else {
            // If we don't have a root note yet, check for root notes (A-G)
            if (event.key.length === 1 && event.key.match(/[a-g]/i)) {
                // Clear previous chord and set new root
                root = event.key.toUpperCase();
                startTimer();
            }
        }

        // Build the chord name and highlight it
        const chord = root + accidental + quality + extension;
        if (chord) {
            fretboard.highlightChordTones(chord);
        }
    }

    /**
     * Starts or resets the timer for chord input
     */
    function startTimer() {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(resetChordInput, 3000);
    }

    /**
     * Resets all chord input variables
     * Fix: Don't clear the root note when pressing 'm' key
     */
    function resetChordInput() {
        clearTimeout(timer);
        
        // Only reset if we're not in the middle of chord building
        // This prevents the root note from being removed when pressing 'm'
        if (!quality && !extension && !alteredTones) {
            root = '';
        }
        
        accidental = '';
        quality = '';
        extension = '';
        alteredTones = '';
    }
}
