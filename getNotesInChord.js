;function getNotesInChord(chord){

    const aNotes = ['A','Bb','B','C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B','C','C#','D','Eb','E','F','F#','G','G#'];
    const aNotesAlt = ['A','A#','B','C','Db','D','D#','E','F','Gb','G','Ab','A','A#','B','C','Db','D','D#','E','F','Gb','G','Ab'];
    const chordFormulas = {
            major: [0,4,7],
            minor: [0,3,7],
            maj7:  [0,4,7,11],
            min7:  [0,3,7,10],
            dom7:  [0,4,7,10],
            sus4:  [0,5,7]
    }
    var root;
    var rootIndex;
    var chordNotePositions = [];
    var aChordNotes = [];
    var formula = '';

    //determine root note
    root = chord.charAt(0);
    if (chord.charAt(1)== '#' || chord.charAt(1)=='b'){
        root = chord.charAt(0)+chord.charAt(1)
    }

    //determine rootIndex
    rootIndex = aNotes.includes(root) ? aNotes.indexOf(root) : aNotesAlt.indexOf(root);
 
    //determine chord formula
    if (chord.indexOf("maj7") > 0){
        formula = 'maj7';
    } else if (chord.indexOf("sus4") > 0){
        formula = 'sus4';
    } else if (chord.indexOf("m7") > 0){
        formula = 'min7';
    }else if (chord.indexOf("m") > 0){
        formula = 'minor';
    } else if (chord.indexOf("7") > 0){
        formula = 'dom7';
    } else {
        formula = 'major';
    }

    //apply chord formula and extract notes
    chordFormulas[formula].forEach(function (item, index){
        aChordNotes.push(aNotes[rootIndex+item])
    })

    return aChordNotes;
}