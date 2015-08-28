;(function() {
  var Flash = window.Flash = window.Flash || {};
  Flash.INTERVAL = 10;
  Flash.SCORE_GOAL = 18;
  Flash.letters = JSON.parse(window.localStorage.getItem('letters')) || ['f', 'j'];
  Flash.timeouts = [];

  Flash.initialize = function () {
    Flash.$progressBar = $('.progress-bar');
    selectKeys();
    setup();
    bindEvents();
  };

  function bindEvents() {
    $('body').on('keypress', handleKeypress.bind());
    $('.key').click(function (event) {
      var $el = $(event.currentTarget);
      $el.toggleClass('selected');

      var letter = $el.text();
      toggleLetter(letter);
    });
  }

  function changeLetter() {
    if (Flash.letters.length) {
      var idx = Flash.letters.indexOf(Flash.currentLetter);
      var otherLetters = Flash.letters.slice();
      otherLetters.splice(idx, 1);
      Flash.currentLetter = _.sample(otherLetters);
    } else {
      Flash.currentLetter = '...';
    }
    $('.character').text(Flash.currentLetter);
  }

  function changeRight(diff, lettersInPlay) {
    if (diff === -1 && lettersInPlay !== Flash.letters.length) { return; }

    Flash.right += diff;
    $('.right').text(Flash.right);
  }

  function changeWrong(diff, lettersInPlay) {
    Flash.wrong += diff;
    $('.wrong').text(Flash.wrong);
  }

  function clearTimeouts() {
    var timeouts = Flash.timeouts;
    for (var i = 0; i < timeouts.length; i++) {
      clearTimeout(timeouts[i]);
    }
  }

  function handleKeypress(event) {
    var allowedPunctuation = [44, 46, 59].indexOf(event.which) !== -1;
    if ((event.which < 65 &&!allowedPunctuation) || event.which > 122) {
      return;
    }

    var typedChar = String.fromCharCode(event.which).toLowerCase();
    if (typedChar === Flash.currentLetter) {
      markRight();
      changeLetter();
    } else {
      markWrong();
    }

    updateCPM();
  }

  function levelUp() {
    alert("You've reached 1.8 chars/sec. Maybe add a letter?");
    setup();
  }

  function markRight() {
    var lettersInPlay = Flash.letters.length;
    changeRight(1);
    var timeout = setTimeout(function () {
      changeRight(-1, lettersInPlay);
      updateCPM();
    }, 1000 * Flash.INTERVAL);
    Flash.timeouts.push(timeout);
  }

  function markWrong() {
    changeWrong(1);
    var timeout = setTimeout(function () {
      changeWrong(-1, Flash.letters.length);
      updateCPM();
    }, 1000 * Flash.INTERVAL);
    Flash.timeouts.push(timeout);
  }

  function score() {
    return Flash.right - ( 4 * Flash.wrong );
  }

  function selectKeys() {
    Flash.letters.forEach(function (letter) {
      var $key = $('.key:contains(' + letter + ')');
      $key.addClass('selected');
    });
  }

  function setup() {
    clearTimeouts();
    changeLetter();
    $('.character').text(Flash.currentLetter);

    Flash.right = 0;
    Flash.wrong = 0;

    $('.right').text('0');
    $('.wrong').text('0');
    updateCPM();
  }

  function toggleLetter(letter) {
    var idx = Flash.letters.indexOf(letter);
    if (idx === -1) {
      Flash.letters.push(letter);
    }
    else {
      Flash.letters.splice(idx, 1);
    }
    window.localStorage.setItem('letters', JSON.stringify(Flash.letters));
    changeLetter();
  }

  function updateCPM() {
    $('.cps').text( score() );
    updateProgressBar();
    if ( score() >= Flash.SCORE_GOAL) {
      levelUp();
    }
  }

  function updateProgressBar() {
    var percentOfCpsGoal = score() / Flash.SCORE_GOAL;
    var percentNotAccomplished = 1 - percentOfCpsGoal;
    var pixelsNotAccomplished = Math.max(0, 390 * percentNotAccomplished);
    Flash.$progressBar.css('top', pixelsNotAccomplished);
  }
})();
