function listenToKeyPress(fretboard) {
    var currentChord;
    document.addEventListener('keydown', function (event) {
        if (!currentChord && event.key == "ArrowLeft") {
            // go to previous chord
            fretboard.prev();
         }
          else if (!currentChord && event.key == "ArrowRight") {
            // go to next chord
            fretboard.next();
         }
          else if (event.key.length == 1 && event.key.match(/[a-g]/i)) {
            //clear previous chord and redraw new chord
            currentChord = event.key.toUpperCase();
        }
        else if (currentChord && event.key.match(/#|b/)) {
           // currentChord = currentChord + event.key;
        }
        
          
        
        //document.getElementById('currentChord').innerText = currentChord;
        fretboard.highlightChord(currentChord);
    });
  }