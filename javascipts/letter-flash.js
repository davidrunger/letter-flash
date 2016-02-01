;(function() {
  var Flash = window.Flash = window.Flash || {};
  Flash.INTERVAL = 10;
  Flash.SCORE_GOAL = 18;
  Flash.letters = JSON.parse(window.localStorage.getItem('letters')) || ['f', 'j'];
  Flash.timeouts = [];

  Flash.initialize = function () {
    Flash.HEIGHT = $('.character-display').innerHeight();
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
    $('.instructions').click(function () {
      introJs().start();
    });
  }

  function changeLetter() {
    if (Flash.letters.length) {
      var idx = Flash.letters.indexOf(Flash.currentLetter);
      var otherLetters = Flash.letters.slice();
      otherLetters.splice(idx, 1);
      Flash.currentLetter = _.sample(otherLetters);
    } else {
      // user has un-selected all letters
      Flash.currentLetter = '...';
    }
    $('.character').text(Flash.currentLetter);
  }

  function changeRight(diff) {
    Flash.right += diff;
  }

  function clearTimeouts() {
    var timeouts = Flash.timeouts;
    for (var i = 0; i < timeouts.length; i++) {
      clearTimeout(timeouts[i]);
    }
  }

  function handleKeypress(event) {
    var allowedPunctuation = [44, 46, 59].indexOf(event.which) !== -1;
    if ((event.which < 65 && !allowedPunctuation) || event.which > 122) {
      return;
    }

    var typedChar = String.fromCharCode(event.which).toLowerCase();
    if (typedChar === Flash.currentLetter) {
      markRight();
      changeLetter();
    } else {
      markWrong();
    }

    update();
  }

  function levelUp() {
    clearTimeouts();
    var text = '';
    text += 'Good job!\n'
    text += 'You\'ve typed 18 characters in 10 seconds.'
    text += 'Maybe add a letter?'
    alert(text);
    setup();
  }

  function markRight() {
    changeRight(1);
    var timeout = setTimeout(function () {
      changeRight(-1);
      update();
    }, 1000 * Flash.INTERVAL);
    Flash.timeouts.push(timeout);
  }

  function markWrong() {
    Flash.right = 0;
    clearTimeouts();
  }

  function score() {
    return Flash.right;
  }

  function selectKeys() {
    // set 'selected' class for keys from the user's stored preferences
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

    update();
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

  function update() {
    updateProgressBar();
    if ( score() >= Flash.SCORE_GOAL) {
      levelUp();
    }
  }

  function updateProgressBar() {
    var percentOfCpsGoal = score() / Flash.SCORE_GOAL;
    var percentNotAccomplished = 1 - percentOfCpsGoal;
    var pixelsNotAccomplished = Flash.HEIGHT * percentNotAccomplished;
    Flash.$progressBar.css('top', pixelsNotAccomplished);
  }
})();
