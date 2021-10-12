function listenToKeyPress(fretboard) {
    var root = '';
    var accidental = '';
    var quality = ''
    var extension = '';
    var alteredTones = '';
    var timer;

 document.addEventListener('keydown', function (event) {
    //back and next
    if (event.key == "ArrowLeft") {
      // go to previous chord
      
    }
    if (event.key == "ArrowLeft") {
      // go to previous chord
      
    }

    if (root.length){
      if (event.key.match(/m/)) {
        quality = event.key;
        startTimer();
      }
      if (event.key.match(/7|9/)) {
        extension = event.key;
        startTimer();
      }
    }
    if (root.length){
      //accidental
      if (event.key.match(/#|b/)) {
        accidental = event.key;
        startTimer();
      }
    } else{
      //root
      if (event.key.length == 1 && event.key.match(/[a-g]/i)) {
          //clear previous chord and redraw new chord
          root = event.key.toUpperCase();
          startTimer();
      }
    }

    var chord = root + accidental + quality + extension;
    fretboard.highlightChord(chord);
    
    });

    function startTimer(){
      //document.getElementById('timer').innerText = '*';
      if (timer){clearInterval(timer);}
      timer = setTimeout(stopTimer,3000);
    }
    function stopTimer(){
      clearInterval(timer);
      //document.getElementById('timer').innerText = '';
      root = '';
      accidental = '';
      quality = ''
      extension = '';
      alteredTones = '';
      //document.getElementById('output').innerText = '';
    }
  }