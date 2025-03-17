/*
 * GuitarFretboard - A customizable guitar fretboard visualization tool
 * 
 * How to use:
 *
 * const fretboard = new Fretboard("fretboard", ['E', 'A', 'D', 'G', 'B', 'E'], 24);
 * fretboard.playChords(["G:4","Bm","C:8","D:4"],100)
 * listenToKeyPress(fretboard);
 *
 */

/**
 * Represents a single guitar string element
 */
class GuitarString {
    constructor() {
        this.element = document.createElement("li");
    }
}

/**
 * Represents a single string with multiple frets
 */
class StringFrets {
    constructor(fretCount) {
        this.fretCount = fretCount;
        this.element = document.createElement("ul");
        this.resetFrets();
    }

    resetFrets() {
        this.element.innerHTML = "";
        this.frets = [];
        for (let i = 0; i < this.fretCount; i++) {
            this.frets.push(new GuitarString());
        }
        this.updateFrets();
    }

    updateFrets() {
        this.frets.forEach(fret => {
            this.element.appendChild(fret.element);
        });
    }
}

/**
 * Main Fretboard class that handles the visualization and interaction
 */
class Fretboard {
    constructor(id, tuning, fretCount) {
        this.id = id;
        this.parentElement = document.getElementById(id);
        if (!this.parentElement) {
            console.error(`Fretboard element with id "${id}" not found`);
            return;
        }
        
        // Fix: Normalize tuning strings to handle both uppercase and lowercase
        this.tuning = tuning.map(note => note.toUpperCase());
        this.fretCount = Math.min(fretCount + 1, 33);

        // Setup the note mapping
        this.noteMap = new NoteMap(this.tuning, this.fretCount).stringNotes;

        // Setup containers
        this.setupContainers();
        
        // Initialize the fretboard
        this.initStrings();
        this.applyNoteMap(this.noteMap);
    }

    setupContainers() {
        // Add main class to parent element
        this.parentElement.classList.add("_gf_fretboard");

        // Create fretboard container
        const fretboardContainer = document.createElement('div');
        fretboardContainer.setAttribute('id', '_fretboard');
        fretboardContainer.setAttribute('class', '_fretboard');
        this.parentElement.appendChild(fretboardContainer);
        this.element = fretboardContainer;

        // Create output display
        const outputDisplay = document.createElement('div');
        outputDisplay.setAttribute('id', '_output');
        this.parentElement.prepend(outputDisplay);

        // Create beat marker
        const beatMarker = document.createElement('div');
        beatMarker.setAttribute('id', '_beatMarker');
        this.parentElement.prepend(beatMarker);
    }

    initStrings() {
        this.strings = [];
        for (let i = 0; i < this.tuning.length; i++) {
            this.strings.push(new StringFrets(this.fretCount));
        }
        this.updateStrings();
    }

    updateStrings() {
        this.element.innerHTML = "";
        this.strings.forEach(string => {
            this.element.appendChild(string.element);
        });
    }

    applyNoteMap(noteMap) {
        for (let stringIndex = 0; stringIndex < this.strings.length; stringIndex++) {
            for (let fretIndex = 0; fretIndex < this.strings[stringIndex].frets.length; fretIndex++) {
                const fretElement = this.strings[stringIndex].frets[fretIndex].element;
                
                // Set data attributes
                fretElement.setAttribute('data-string', stringIndex);
                fretElement.setAttribute('data-fret', fretIndex);
                fretElement.setAttribute('data-note', noteMap[stringIndex][fretIndex]);
                
                // Add fret markers
                this.addFretMarkers(stringIndex, fretIndex, fretElement);
            }
        }
    }

    addFretMarkers(stringIndex, fretIndex, fretElement) {
        const markerPositions = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
        const doubleMarkerPositions = [12, 24];
        
        if (markerPositions.includes(fretIndex) && stringIndex === Math.floor(this.tuning.length / 2)) {
            const marker = document.createElement("div");
            marker.classList.add("fretMarker");
            fretElement.appendChild(marker);
            
            if (doubleMarkerPositions.includes(fretIndex)) {
                const secondMarker = document.createElement("div");
                secondMarker.classList.add("fretMarker");
                fretElement.appendChild(secondMarker);
            }
        }
    }

    selectNote(evt) {
        // Use composedPath() instead of path for better browser compatibility
        const path = evt.composedPath ? evt.composedPath() : evt.path || (evt.target ? [evt.target] : []);
        
        // Fix: Check if path has enough elements and only clear notes on the same string
        if (path && path.length >= 3) {
            // Get the string element (li's parent ul)
            const stringElement = path[1];
            // Only get spans from the current string, not all strings
            const spans = stringElement.querySelectorAll("span");
            const clickedNote = evt.target || evt.srcElement;
            
            if (spans.length === 1) {
                clickedNote.remove();
            } else {
                for (let i = 0; i < spans.length; i++) {
                    if (clickedNote !== spans[i]) {
                        spans[i].remove();
                    }
                }
            }
        }
    }

    beatMarkerPulse() {
        // Fix: Check if this.playChords exists and has aChords property before accessing length
        if (this.playChords && this.playChords.aChords && this.playChords.aChords.length > 1) {
            const beatMarker = this.parentElement.querySelector('#_beatMarker');
            if (beatMarker && beatMarker.classList) {
                if (beatMarker.classList.contains('beatMarker')) {
                    beatMarker.classList.remove("beatMarker");
                    beatMarker.classList.add("beatMarkerOff");
                } else {
                    beatMarker.classList.add("beatMarker");
                    beatMarker.classList.remove("beatMarkerOff");
                }
            }
        }
    }

    highlightChordTones(chord) {
        const notes = getNotesInChord(chord);
        this.highlightNotes(notes);
        this.updateBeatMarker(chord);
        this.parentElement.querySelector('#_output').innerText = chord;
    }

    updateBeatMarker(chord) {
        const beatMarker = this.parentElement.querySelector('#_beatMarker');
        this.beatMarkerPulse();
        
        if (this.parentElement.querySelector('#_output').innerText === chord) {
            beatMarker.innerHTML = beatMarker.innerHTML + "&#9676;";
        } else {
            beatMarker.innerHTML = "&#9676;";
        }
        this.beatMarkerPulse();
    }

    highlightChordInPosition(chord, position) {
        const arrPos = position - 1;
        const positions = [0, 4, 7]; // positions 1, 2, & 3
        const positionLen = 5; // each position is 5 frets from start
        let lastNoteFound;
        const notes = getNotesInChord(chord);
        let adjustedNotes = {
            root: notes[0]
        };

        // Create a copy of strings array to avoid modifying the original
        const reversedStrings = [...this.strings].reverse();
        const truncatedStrings = [];
        
        reversedStrings.forEach(item => {
            truncatedStrings.push(item.frets.slice(positions[arrPos], positions[arrPos] + positionLen));
        });

        let rootNoteFound = 0;
        for (let j = 0; j < truncatedStrings.length; j++) {
            let foundOnString = 0;
            for (const key in adjustedNotes) {
                for (let k = 0; k < truncatedStrings[j].length; k++) {
                    if (rootNoteFound && key !== lastNoteFound && 
                        truncatedStrings[j][k].element.getAttribute('data-note') === adjustedNotes[key]) {
                        this.highlightNote(truncatedStrings[j][k].element);
                        foundOnString = 1;
                        break;
                    }
                    if (!rootNoteFound && 
                        truncatedStrings[j][k].element.getAttribute('data-note') === adjustedNotes['root']) {
                        this.highlightNote(truncatedStrings[j][k].element);
                        foundOnString = 1;
                        rootNoteFound = 1;
                        adjustedNotes = {
                            fifth: notes[2],
                            third: notes[1],
                            seventh: notes[3],
                            root: notes[0]
                        };
                        break;
                    }
                }
                if (foundOnString) {
                    lastNoteFound = key;
                    if (key === 'third') {
                        adjustedNotes = {
                            fifth: notes[2],
                            seventh: notes[3],
                            root: notes[0],
                            third: notes[1],
                        };
                    }
                    if (key === 'fifth') {
                        adjustedNotes = {
                            seventh: notes[3],
                            root: notes[0],
                            third: notes[1],
                            fifth: notes[2]
                        };
                    }
                    break;
                }
            }
        }
    }

    highlightNotes(notes) {
        const intervals = [1, 3, 5, 7];
        this.removeNoteHighlights();

        for (let i = 0; i < notes.length; i++) {
            const dataString = `[data-note='${notes[i]}']`;
            const matches = this.element.querySelectorAll(dataString);

            for (let j = 0; j < matches.length; j++) {
                this.highlightNote(matches[j], notes[i], intervals[i]);
            }
        }
    }

    removeNoteHighlights() {
        const matches = this.element.querySelectorAll("span");
        matches.forEach(match => {
            match.removeEventListener("click", this.selectNote);
            match.remove();
        });
    }

    highlightNote(element, note, interval) {
        const classNames = ['root', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 
                           'octave', 'ninth', 'third', 'eleventh', 'fifth', 'thirteenth'];
        
        // Fix: Remove existing spans before adding new ones to prevent layering issues
        const existingSpans = element.querySelectorAll("span");
        if (existingSpans.length > 0) {
            existingSpans.forEach(span => span.remove());
        }
        
        const node = document.createElement("span");
        
        if (interval) {
            node.classList.add(classNames[interval - 1]);
            node.setAttribute('data-interval', interval);
        } else {
            node.classList.add('root');
        }
        
        if (note) {
            node.setAttribute('data-note', note);
        }

        element.appendChild(node);
        node.addEventListener("click", this.selectNote.bind(this));
    }

    highlightChordFingering(fingering) {
        // Check that fingering array length matches fretboard tuning
        if (fingering.length !== this.tuning.length) {
            console.error("Fingering array length must match tuning length");
            return;
        }
        
        // Clear previous highlights
        this.removeNoteHighlights();
        
        // Highlight each note in the fingering
        for (let stringIndex = 0; stringIndex < fingering.length; stringIndex++) {
            const fretNumber = fingering[stringIndex];
            
            // Skip if the string is not played (usually marked as -1 or x)
            if (fretNumber >= 0) {
                const fretElement = this.strings[stringIndex].frets[fretNumber].element;
                const note = fretElement.getAttribute('data-note');
                this.highlightNote(fretElement, note);
            }
        }
    }

    nextChord() {
        if (this.chordSequence && this.chordSequence.aChords && this.chordSequence.aChords.length > 0) {
            this.chordSequence.currentChordIndex = (this.chordSequence.currentChordIndex + 1) % this.chordSequence.aChords.length;
            return true;
        }
        return false;
    }
    
    previousChord() {
        if (this.chordSequence && this.chordSequence.aChords && this.chordSequence.aChords.length > 0) {
            this.chordSequence.currentChordIndex = (this.chordSequence.currentChordIndex - 1 + this.chordSequence.aChords.length) % this.chordSequence.aChords.length;
            return true;
        }
        return false;
    }
    
    nextBeat() {
        // To be implemented
    }
    
    previousBeat() {
        // To be implemented
    }

    playCurrentChord() {
        // Play metronome click if enabled
        this.playMetronomeClick();
        
        // Highlight current chord
        this.highlightChordTones(this.chordSequence.getCurrentChord());
        
        // Move to next chord
        this.nextChord();
        
        // Schedule next chord
        this.timeout = setTimeout(this.playCurrentChord.bind(this), this.chordSequence.beatLen);
    }

    playChords(chords, bpm, enableMetronome = false) {
        // Fix: Rename the property to avoid overwriting the method
        this.chordSequence = new PlayChords(chords, bpm);
        this.enableMetronome = enableMetronome;
        
        // Create audio context for metronome if enabled
        if (enableMetronome) {
            this.setupMetronome();
        }
        
        if (chords.length > 1) {
            this.insertControls();
        }

        this.playCurrentChord();
    }
    
    setupMetronome() {
    try {
        // Create audio context for metronome
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create and configure hi-hat sound
        this.createMetronomeSound = () => {
            const ctx = this.audioContext;
            
            // Create a buffer for white noise
            const bufferSize = ctx.sampleRate * 0.05; // 50ms burst
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            // Fill buffer with random noise (white noise)
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1); // Values between -1 and 1
            }

            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = buffer;

            // High-pass filter for a hi-hat sound
            const filter = ctx.createBiquadFilter();
            filter.type = "highpass";
            filter.frequency.value = 7000; // Emphasize higher frequencies for metallic sound
            filter.Q.value = 1;

            // Gain envelope for percussive shape
            const gain = ctx.createGain();
            const now = ctx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.6, now + 0.005); // Quick attack
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05); // Fast decay

            // Connect nodes
            noiseSource.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            // Start and stop sound
            noiseSource.start();
            noiseSource.stop(now + 0.05); // Short hi-hat burst
        };
    } catch (error) {
        console.error('Web Audio API not supported:', error);
        this.enableMetronome = false;
    }
}


    
    playMetronomeClick() {
        if (this.enableMetronome && this.createMetronomeSound) {
            this.createMetronomeSound();
        }
    }

    insertControls() {
        // Create controls container if it doesn't exist
        if (!this.parentElement.querySelector('#_gf_controls')) {
            const controlsContainer = document.createElement('div');
            controlsContainer.setAttribute('id', '_gf_controls');
            
            // Create play/pause button
            const playPauseButton = document.createElement('button');
            playPauseButton.innerText = '⏸️';
            playPauseButton.addEventListener('click', () => {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                    playPauseButton.innerText = '▶️';
                } else {
                    this.playCurrentChord();
                    playPauseButton.innerText = '⏸️';
                }
            });
            
            // Create previous button
            const prevButton = document.createElement('button');
            prevButton.innerText = '⏮️';
            prevButton.addEventListener('click', () => {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                    playPauseButton.innerText = '▶️';
                }
                this.previousChord();
                this.highlightChordTones(this.playChords.getCurrentChord());
            });
            
            // Create next button
            const nextButton = document.createElement('button');
            nextButton.innerText = '⏭️';
            nextButton.addEventListener('click', () => {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                    playPauseButton.innerText = '▶️';
                }
                this.nextChord();
                this.highlightChordTones(this.playChords.getCurrentChord());
            });
            
            // Create clear button
            const clearButton = document.createElement('button');
            clearButton.innerText = '🗑️';
            clearButton.addEventListener('click', () => {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                    playPauseButton.innerText = '▶️';
                }
                this.removeNoteHighlights();
                this.parentElement.querySelector('#_output').innerText = '';
                this.parentElement.querySelector('#_beatMarker').innerHTML = '';
            });
            
            // Add buttons to controls container
            controlsContainer.appendChild(prevButton);
            controlsContainer.appendChild(playPauseButton);
            controlsContainer.appendChild(nextButton);
            controlsContainer.appendChild(clearButton);
            
            // Add controls container to parent element
            this.parentElement.appendChild(controlsContainer);
        }
    }

    // Method to rotate the fretboard for left-handed view
    rotate() {
        this.parentElement.classList.toggle('rotated');
        // Reverse the strings order
        this.strings.reverse();
        this.updateStrings();
        this.applyNoteMap(this.noteMap);
    }

    // Method to flip the fretboard vertically
    flip() {
        this.parentElement.classList.toggle('flipped');
    }
}

/**
 * Maps notes to strings and frets
 */
class NoteMap {
    constructor(tuning, numberOfFrets) {
        this.stringNotes = [];
        this.allNotes = [
            'A','Bb','B','C','C#','D','Eb','E','F','F#','G','G#'
        ];
        this.tuning = [...tuning].reverse(); // Create a copy to avoid modifying the original
        this.numberOfFrets = numberOfFrets;
        this.buildNoteMap();
    }

    buildNoteMap() {
        this.tuning.forEach(openNote => {
            let openIndex = this.allNotes.indexOf(openNote);
            
            if (openIndex === -1) {
                console.error(`Invalid note in tuning: ${openNote}`);
                openIndex = 0; // Default to 'A' if note not found
            }
            
            const fretNotes = [];
            for (let fret = 0; fret < this.numberOfFrets; fret++) {
                fretNotes.push(this.allNotes[(openIndex + fret) % this.allNotes.length]);
            }
            this.stringNotes.push(fretNotes);
        });
    }
}

/**
 * Manages chord progression playback
 */
class PlayChords {
    constructor(chords, bpm) {
        this.currentChordIndex = 0;
        this.aChords = [];
        this.aBeats = [];
        this.beatLen = 60000 / bpm;

        chords.forEach(chord => {
            const chordParts = chord.split(":");
            const chordName = chordParts[0];
            const beats = chordParts[1] ? parseInt(chordParts[1]) : 4;
            
            this.aBeats.push(beats);
            
            // Add the chord for each beat
            for (let i = 0; i < beats; i++) {
                this.aChords.push(chordName);
            }
        });
    }

    getCurrentChord() {
        return this.aChords[this.currentChordIndex];
    }
}
