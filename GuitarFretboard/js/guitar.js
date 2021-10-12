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
        this.element = document.getElementById(id);
        this.tuning = tuning;
        this.fretCount = Math.min(fretCount + 1,33);
        this.initFrets();
        this.noteMap = new NoteMap(this.tuning, fretCount).aStrings;
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
            }
        }
    }

    selectNote(evt) {
        var spans = evt.path[2].querySelectorAll("span")
        var clickedNote = evt.path[0];
        //the third item in the array is the UL containing all the frets. I could also do this by finding the data-string value and pass it to another function to reset the string and set new value(s)
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

    highlightChord(chord) {
        this.hilightNotes(getNotesInChord(chord));
        document.getElementById('beatMarker').classList.add("beatMarker");
        document.getElementById('beatMarker').classList.remove("beatMarkerOff");
        if (document.getElementById('currentChord').innerText == chord){
            document.getElementById('beatMarker').innerText = document.getElementById('beatMarker').innerText + '.';
        } else {
            document.getElementById('beatMarker').innerText =  '.';
            
        }
        document.getElementById('beatMarker').classList.remove("beatMarker");
        document.getElementById('beatMarker').classList.add("beatMarkerOff");
        document.getElementById('currentChord').innerText = chord;
    }

    hilightNotes(aNotes) {
        const classNames = ['root', 'third', 'fifth', 'seventh'];
        const intervals = [1, 3, 5, 7];
        this.removeNoteHighlights();

        for (let i = 0; i < aNotes.length; i++) {
            var dataString = "[data-note='" + aNotes[i] + "']";
            var matches = this.element.querySelectorAll(dataString);

            for (let j = 0; j < matches.length; j++) {
                var node = document.createElement("span");
                node.classList.add(classNames[i]);
                node.setAttribute('data-note', aNotes[i]);
                node.setAttribute('data-interval', intervals[i]);

                matches[j].appendChild(node);
                matches[j].addEventListener("click", this.selectNote);
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

    //************************* */
    nextChord(){
        this.playChords.currentChordIndex = (this.playChords.currentChordIndex + 1) % this.playChords.aChords.length;
    }
    previousChord(){
        this.playChords.currentChordIndex = (this.playChords.currentChordIndex - 1 + this.playChords.aChords.length) % this.playChords.aChords.length;
    }

    playCurrentChord(){
        this.highlightChord(this.playChords.getCurrentChord());
        this.nextChord();
        this.timeout = setTimeout(this.playCurrentChord.bind(this),this.playChords.beatLen);
    }

    playChords(chords,bpm){
        this.playChords = new PlayChords(chords,bpm);
        this.playCurrentChord();
    }

    //*** buttons  */
    pause(){
        clearTimeout(this.timeout);
    }

    play(){
        this.playCurrentChord();
    }

    next(){
        clearTimeout(this.timeout);
        this.highlightChord(this.playChords.getCurrentChord());
        this.nextChord();
    }

    prev(){
        clearTimeout(this.timeout);
        this.previousChord();
        this.highlightChord(this.playChords.getCurrentChord());
    }

    clear(){
        this.removeNoteHighlights();
    }

    stop(){
        clearTimeout(this.timeout);
        this.removeNoteHighlights();
        this.playChords.currentChordIndex = 0;
        document.getElementById('beatMarker').classList.remove("beatMarker");
        document.getElementById('beatMarker').classList.remove("beatMarkerOff"); ///refactor this
        document.getElementById('currentChord').innerText = '';
        document.getElementById('beatMarker').innerText =  '';
    }
}


class NoteMap {
    constructor(aTuning, numberOfFrets) {
        this.aStrings = [];
        this.aAllMusicNotes = ['A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'];
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
        this.currentChordBeatCount;
        this.aChords = [];
        this.aBeats = [];
        this.beatLen = 60000 / bpm;

        for (let i = 0; i < chords.length; i++) {
            var aChordBeat = chords[i].split(":");

            //aChords is 1 chord for each beat (4 beats if not specified)
        
            if (aChordBeat[1] != undefined) {
               for (let j = 0; j < parseInt(aChordBeat[1]); j++) { this.aChords.push(aChordBeat[0])}
            } else {
                for (let j = 0; j < 4; j++) { this.aChords.push(aChordBeat[0])}
            }
        }
    }

    getCurrentChord(){
        return this.aChords[this.currentChordIndex];
    }

}
