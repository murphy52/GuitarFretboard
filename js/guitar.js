/*

How to

const fretboard = new Fretboard("fretboard", ['E', 'A', 'D', 'G', 'B', 'E'], 24);
  
  fretboard.playChords(["G:4","Bm","C:8","D:4"],100)
  
  listenToKeyPress(fretboard);

*/


class GuitarString {
    constructor() {
        this.element = document.createElement("li");
    }
}

class Fret {
    constructor(fretCount) {
        this.fretCount = fretCount;
        this.element = document.createElement("ul");
        this.resetStrings();
    }

    resetStrings() {
        this.element.innerHTML = "";
        this.strings = [];
        for (let i = 0; i < this.fretCount; i++) {
            this.strings.push(new GuitarString());
        }
        this.updateStrings();
    }

    updateStrings() {
        for (let i in this.strings) {
            const string = this.strings[i];
            this.element.appendChild(string.element);
        }
    }
}

class Fretboard {
    constructor(id, tuning, fretCount) {
        this.id = id;
        this.parentElement = document.getElementById(id);
        this.tuning = tuning;
        this.fretCount = Math.min(fretCount + 1, 33);

        this.noteMap = new NoteMap(this.tuning, this.fretCount).aStrings;

        // setup containers
        this.parentElement.classList.add("_gf_fretboard");

        var node = document.createElement('div');
        node.setAttribute('id', '_fretboard');
        node.setAttribute('class', '_fretboard');
        this.parentElement.appendChild(node);
        this.element = this.parentElement.querySelector('#_fretboard')

        var node2 = document.createElement('div');
        node2.setAttribute('id', '_output');
        this.parentElement.prepend(node2);

        var node3 = document.createElement('div');
        node3.setAttribute('id', '_beatMarker');
        this.parentElement.prepend(node3);

        this.initFrets();
        this.applyNoteMap(this.noteMap);
    }

    initFrets() {
        this.frets = [];
        for (let i = 0; i < this.tuning.length; i++) {
            this.frets.push(new Fret(this.fretCount));
        }
        this.updateFrets();
    }

    updateFrets() {
        this.element.innerHTML = "";
        for (let i in this.frets) {
            const fret = this.frets[i];
            this.element.appendChild(fret.element);
        }
    }

    applyNoteMap(noteMap) {
        for (let i = 0; i < this.frets.length; i++) {
            for (let j = 0; j < this.frets[i].strings.length; j++) {
                this.frets[i].strings[j].element.setAttribute('data-string', i);
                this.frets[i].strings[j].element.setAttribute('data-fret', j);
                this.frets[i].strings[j].element.setAttribute('data-note', noteMap[i][j]);
                // add fret markers
                if ([3,5,7,9,12,15,17,19,21,24].includes(j) && i == Math.floor(this.tuning.length / 2)) {
                    var node = document.createElement("div");
                    node.classList.add("fretMarker");
                    this.frets[i].strings[j].element.appendChild(node);
                    if ([12, 24].includes(j) && i == Math.floor(this.tuning.length / 2)) {
                        var node2 = document.createElement("div");
                        node2.classList.add("fretMarker");
                        this.frets[i].strings[j].element.appendChild(node2);
                    }
                }
            }
        }
    }

    selectNote(evt) {
        var spans = evt.path[2].querySelectorAll("span")
        var clickedNote = evt.path[0];
        // the third item in the array is the UL containing all the frets. I could also do this by finding the data-string value and pass it to another function to reset the string and set new value(s)
        if (spans.length == 1) {
            evt.path[0].remove();
        } else {
            for (let i = 0; i < spans.length; i++) {
                if (clickedNote !== spans[i]) {
                    spans[i].remove();
                }
            }
        }
    }

    beatMarkerPulse() {
        if (this.playChords && this.playChords.aChords > 1) {
            if (this.parentElement.querySelector('#_beatMarker').classList.contains('beatMarker')) {
                this.parentElement.querySelector('#_beatMarker').classList.remove("beatMarker");
                this.parentElement.querySelector('#_beatMarker').classList.add("beatMarkerOff");
            } else {
                this.parentElement.querySelector('#_beatMarker').classList.add("beatMarker");
                this.parentElement.querySelector('#_beatMarker').classList.remove("beatMarkerOff");
            }
        }
    }

    highlightChord(chord) { //refactor: this should be called highlightChordTones
        this.highlightNotes(getNotesInChord(chord));
        this.beatMarkerPulse();
        if (this.parentElement.querySelector('#_output').innerText == chord) {
            this.parentElement.querySelector('#_beatMarker').innerHTML = this.parentElement.querySelector('#_beatMarker').innerHTML +  "&#9676;";
        } else {
            this.parentElement.querySelector('#_beatMarker').innerHTML = "&#9676;";

        }
        this.beatMarkerPulse();
        this.parentElement.querySelector('#_output').innerText = chord;
    }

    highlightChordInPosition(chord, position){
        const arrPos = position-1;
        const positions = [0,4,7]; //positions 1,2,& 3
        const positionLen = 5; //each position is 5 frets from start
        const notes = getNotesInChord(chord);
        const rootNote = notes[0];
        const adjustedNotes = [notes[2],notes[1],notes[3],notes[0]];
        const frets = this.frets.reverse(); //flip strings (frets) so lowest notes are first
        const truncatedFrets = [];
        frets.forEach(item => {
            truncatedFrets.push(item.strings.slice(positions[arrPos][0],positionLen));
        });

        var rootNoteFound = 0;
        for (let j = 0; j < truncatedFrets.length; j++) {
            var foundOnString = 0;
            for (let l = 0; l < adjustedNotes.length; l++) {
                for (let k = 0; k < truncatedFrets[j].length; k++) {
                    if (rootNoteFound && truncatedFrets[j][k].element.getAttribute('data-note') == adjustedNotes[l]){
                        this.highlightNote(truncatedFrets[j][k].element);
                        console.log(truncatedFrets[j][k]);
                        foundOnString = 1;
                        break;
                    }
                    if (!rootNoteFound && truncatedFrets[j][k].element.getAttribute('data-note') == rootNote){
                        this.highlightNote(truncatedFrets[j][k].element);
                        foundOnString = 1;
                        rootNoteFound = 1;
                        break;
                    }
                }
                if(foundOnString){break}
            }
        }
    }

    highlightNotes(aNotes) {
        const classNames = ['root', 'third', 'fifth', 'seventh'];
        const intervals = [1, 3, 5, 7];
        this.removeNoteHighlights();

        for (let i = 0; i < aNotes.length; i++) {
            var dataString = "[data-note='" + aNotes[i] + "']";
            var matches = this.element.querySelectorAll(dataString);

            for (let j = 0; j < matches.length; j++) {
                this.highlightNote(matches[j],aNotes[i],intervals[i]);
                // var node = document.createElement("span");
                // node.classList.add(classNames[i]);
                // node.setAttribute('data-note', aNotes[i]);
                // node.setAttribute('data-interval', intervals[i]);

                // matches[j].appendChild(node);
                // node.addEventListener("click", this.selectNote);
            }
        }
    }

    removeNoteHighlights() {
        var matches = this.element.querySelectorAll("span");
        for (let i = 0; i < matches.length; i++) {
            matches[i].removeEventListener("click", this.selectNote);
            matches[i].remove();
        }
    }

    highlightNote(element,note,interval){
        const classNames = ['root', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'octave', 'ninth', 'third', 'eleventh', 'fifth', 'thirteenth'];
        const node = document.createElement("span");
        node.classList.add(classNames[interval-1]);
        node.setAttribute('data-note', note);
        node.setAttribute('data-interval', interval);

        element.appendChild(node);
        node.addEventListener("click", this.selectNote);
    }

    highlightChordFingering(fingering){
        //check that fingering array length matches fretboard tuning
        //invert the array to match tuning
        //create a function that will encapsulate highlighting a single note
    }
    // ************************* */
    nextChord() {
        this.playChords.currentChordIndex = (this.playChords.currentChordIndex + 1) % this.playChords.aChords.length;
    }
    previousChord() {
        this.playChords.currentChordIndex = (this.playChords.currentChordIndex - 1 + this.playChords.aChords.length) % this.playChords.aChords.length;
    }
    nextBeat(){}
    previousBeat(){}

    playCurrentChord() {
        this.highlightChord(this.playChords.getCurrentChord());
        this.nextChord();
        this.timeout = setTimeout(this.playCurrentChord.bind(this), this.playChords.beatLen);
    }

    playChords(chords, bpm) {
        this.playChords = new PlayChords(chords, bpm);
        if (chords.length > 1) {
            this.insertControls()
        }

        this.playCurrentChord();
    }

    // *** buttons  */
    insertControls() {
        var node = document.createElement('div');
        node.setAttribute('id', '_gf_controls')
        node.innerHTML = `
            <button id="previous" onclick="${this.id}.prev()">Prev</button>
            <button id="stop" onclick="${this.id}.stop()">Stop</button>
            <button id="play" onclick="${this.id}.play()">Play</button>
            <button id="pause" onclick="${this.id}.pause()">Pause</button>
            <button id="next"onclick="${this.id}.next()">Next</button>
            <button id="clear" onclick="${this.id}.clear()">Clear</button>
        `;
        this.element.appendChild(node);
    }

    pause() {
        clearTimeout(this.timeout);
    }

    play() {
        this.playCurrentChord();
    }

    next() {
        clearTimeout(this.timeout);
        this.highlightChord(this.playChords.getCurrentChord());
        this.nextChord();
    }

    prev() {
        clearTimeout(this.timeout);
        this.previousChord();
        this.highlightChord(this.playChords.getCurrentChord());
    }

    clear() {
        this.removeNoteHighlights();
    }

    stop() {
        clearTimeout(this.timeout);
        this.removeNoteHighlights();
        this.playChords.currentChordIndex = 0;
        this.parentElement.querySelector('#_output').innerText = '';
        this.parentElement.querySelector('#_beatMarker').innerText = '';
    }
}


class NoteMap {
    constructor(aTuning, numberOfFrets) {
        this.aStrings = [];
        this.aAllMusicNotes = [
            'A','Bb','B','C','C#','D','Eb','E','F','F#','G','G#'
        ];
        this.aTuning = aTuning.reverse();
        this.numberOfFrets = numberOfFrets + 1;
        this.buildNoteMap();
    }

    buildNoteMap() {
        for (let i = 0; i < this.aTuning.length; i++) {
            for (var j = 0; j < this.aAllMusicNotes.length; j++) {
                if (this.aTuning[i] == this.aAllMusicNotes[j]) {
                    this.openIndex = j;
                    break;
                }
            }

            var aFrets = [];
            for (let j = 0; j < this.numberOfFrets; j++) {
                aFrets.push(this.aAllMusicNotes[(this.openIndex + j) % this.aAllMusicNotes.length]);
            }
            this.aStrings.push(aFrets);
        }
    }
}

class PlayChords {
    constructor(chords, bpm) {
        this.currentChordIndex = 0;
        this.currentChord;
        this.currentBeatIndex;
        this.aChords = [];
        this.aBeats = [];
        this.beatLen = 60000 / bpm;

        for (let i = 0; i < chords.length; i++) {
            var aChordBeat = chords[i].split(":");

            // aChords is 1 chord for each beat (4 beats if not specified)
            if (aChordBeat[1] != undefined) {
                this.aBeats.push(aChordBeat[1]);
                for (let j = 0; j < parseInt(aChordBeat[1]); j++) {
                    this.aChords.push(aChordBeat[0])
                }
            } else {
                this.aBeats.push(4);
                for (let j = 0; j < 4; j++) {
                    this.aChords.push(aChordBeat[0]);
                }
            }
        }
    }

    getCurrentChord() {
        return this.aChords[this.currentChordIndex];
    }

}

