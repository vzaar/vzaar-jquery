
// ........................................................................................................................
// ........................................................................................................................
// ........................................................................................................................
// ......7777=..........?777?...=77777777777777777I......+77   777,..77777........+777   77:..77777...+7777...77777I.......
// .....77   77........       .                    7...7           7     77....,             7     7.~             77......
// .....77    7........       ,                    ~..7                   7...,7                   7.              77......
// .....77     7......7      7.7                 7~.I                      ...                     7.              7.......
// ......7     7......      7............:      7...        7:..:77        ..       77?...7        7.          7 ,.........
// ......7     7I....7      ,...........7       ...7       ?......~        .7       ?......,       7.        I.............
// .......       ....7     7...........7      7....       ?........I7      .7      7.........7     7.       7..............
// .......+       ..I7    7...........7    77?.....       .........: 7     .7     7I.........7     7.       =..............
// ........7777777..777777I.........:7777777.......7777777.........,7777777.7777777I.........I777777.7777777=..............
// .........777777I?777777.........~7777777........7777777+........I7777777.77777777.........7777777.7777777=..............
// .........=777777777777.........77777777.........77777777=......:77777777.77777777?......,77777777.7777777=..............
// ..........77777777777I........7777777?:::::::...,777777777...,I777777777..77777777I~...7777777777.7777777=..............
// ..........:7777777777........7777777777777777777I77777777777777777777777..~7777777777777777777777.7777777=..............
// ...........I77777777?.......777777777777777777777.+777777777777777777777...~777777777777777777777.7777777:..............
// ............77777777.......=777777777777777777777...77777777777777777777.....77777777777777777777.=777777...............
// .............777777.........I777777777777777777?......777777777...I7777........I77777777...77777...?7777................
// ........................................................................................................................
// ........................................................................................................................
// ........................................................................................................................
// ........................................................................................................................

(function($) {
  "use strict";
  $.fn.vzPrerollinator = function(options){
    var that = this,
        mainVid = that.attr("id").match(/\d{1,7}/)[0],
        settings = $.extend({
          "pre"         : "958317",
          "prerollDone" : false,
          "mainDone"    : false,
          "prevars"     : "",
          "mainvars"    : ""
      }, options );

    this.queue(function() {
      setTimeout(function() {
        var vzp = vzInit(that.attr("id"));
        vzp.ready(function() {
          vzp.addEventListener("playState", function(state) {
            if (state == "mediaStarted" && !settings.prerollDone) {
              var vzOpts = {
                id        : that.attr("id"),
                newId     : settings.pre,
                flashvars : settings.prevars
              };
              vzEmbed( vzOpts );
              settings.prerollDone = true;
            } else if (state == "mediaEnded" && !settings.mainDone) {
              var vzOpts = {
                id        : that.attr("id"),
                newId     : mainVid,
                flashvars : settings.mainvars
              };
              vzEmbed( vzOpts );
              settings.mainDone = true;
              that.dequeue();
            }
          });
        });
      }, 500);
    });
    return this;
  };

  $.fn.vzPostrollinator = function(options){
    var that = this,
        mainVid = that.attr("id").match(/\d{1,7}/)[0],
          settings = $.extend({
          "post"        : "958317",
          "postvars"    : "",
          "mainDone"    : false
        }, options );

    this.queue(function() {
      setTimeout(function() {
        var vzp = vzInit(that.attr("id"));
        vzp.ready(function() {
          vzp.addEventListener("playState", function(state) {
            if (state == "mediaEnded" && !settings.mainDone) {
              var vzOpts = {
                id        : that.attr("id"),
                newId     : settings.post,
                flashvars : settings.postvars
              };
              vzEmbed( vzOpts );
              settings.mainDone = true;
              that.dequeue();
            }
          });
        });
      }, 500);
    });
    return this;
  };

  $.fn.vzBookmarkifier = function(options){
    var that = this,
        seconds = 0,
        $that = $(that),
        settings = $.extend({
          persistent  : false,
          message     : "Really? :("
        }, options );

    var vzp = vzInit(that.attr("id"));

    $that.after('<div class="vzBookmark"><a href="#" class="vzAddBookmark">Add Bookmark</a> | <a href="#" class="vzResetBookmark">Reset Bookmark</a> | Current bookmark: <span class="vzCurrentBookmark">00:00</span></div>');

    vzp.ready(function() {
      vzp.addEventListener("playState", function(state) {
        if (state == 'mediaStarted') {
          vzp.seekTo($.cookie('bookmark'));
        }

      });

      if (!$.cookie('bookmark')) {
        seconds = 0;
      } else {
        seconds = $.cookie('bookmark').toString();
      }
      if (seconds.length == 1) {
        seconds = "&nbsp;" + seconds;
      }

      $('.vzCurrentBookmark').html(timeConvert(seconds));

      $(".vzAddBookmark").on('click', function() {
        vzp.getTime(function(time) {
          if (isNaN(time)) {
            time = 0;
          }
          addBookmark(time);
        });
      });

      $(".vzResetBookmark").on('click', function() {
        $.cookie('bookmark', 0);
        addBookmark(0);
      });

      function addBookmark(seconds) {
        $.cookie('bookmark', seconds, { expires: 1 });
        seconds = seconds.toString();
        $('.vzCurrentBookmark').html(timeConvert(seconds));
      }

      if (settings.persistent) {
        window.onbeforeunload = function() {
          vzp.getTime(function(time) {
            if (isNaN(time)) {
              time = 0;
            }
            addBookmark(time);
          });
          return settings.message;
        };
      }
    });
    return this;
  };

  $.fn.vzChapterizer = function(options){
    var that = this,
        $that = $(that),
        chapterCheckTime = 0,
        currentChapter = 0,
        chapterSwitched = false,
        settings = $.extend({
          "appendTimes"   : false,
          "chapters"      : [],
          "titles"        : [],
          "orientation"   : "vertical",
          "position"      : "right",
          "chapterNumbers": false
        }, options );

    var vzp = vzInit(that.attr("id")),
        chapterTiming = settings.chapters,
        chapterTitles = settings.titles,
        items = [];

    $that.wrap('<div class="vzContainer" />');
      if (settings.position === "top" || settings.position === "left") {
      $that.before('<ul id="vzChapters"></ul>');
    } else if (settings.position === "bottom" || settings.position === "right") {
      $that.after('<ul id="vzChapters"></ul>');
    }

    $('#vzChapters').addClass(settings.orientation).addClass(settings.position);

    $.each(settings.titles, function(i, item) {
      if (settings.chapterNumbers) {
        items.push('<li>' + (i+1) + '. <a href="#">' + item + '</a></li>');
      } else {
        items.push('<li><a href="#">' + item + '</a></li>');
      }
    });

    $('#vzChapters').append( items.join('') );

    if (settings.position === "left" || settings.position === "right") {
      $('.vzContainer').css("width", function() {
        return $('#vzChapters').outerWidth() + ($that.attr('width')*1 + 8);
      });
    }

    var $chapterSelection = $('#vzChapters li');
    $chapterSelection.first().addClass('current');

    if (settings.appendTimes) {
      $chapterSelection.each(function (i) {
        $(this).append(' <span class="vzChaptersAppendTimes">' + timeConvert(chapterTiming[i]) + '</span>');
      });
    }

    vzp.ready(function() {
      vzp.addEventListener("playState", function(state) {
        checkPlayerStatus(state);
      });
      vzp.addEventListener("interaction", function(interaction) {
        checkPlaying(interaction);
      });

      $chapterSelection.on('click', function (e) {
        vzp.play2();
        vzp.seekTo(chapterTiming[$chapterSelection.index($(this))]);
        clearInterval(chapterCheckTime);
        chapterCheckTime = setInterval(chapterHighlight, 1000);
        e.preventDefault();
      });

      function chapterHighlight() {
        vzp.getTime(function(curTime) {
          that.data("time", curTime);
        });

        if (chapterSwitch(that.data("time"))) {
          chapterSwitched = false;
          $chapterSelection.removeClass('current').eq(currentChapter).addClass('current');
        }
      }

      function checkPlaying(interaction) {
        if (interaction == 'pause') {
          clearInterval(chapterCheckTime);
        } else if (interaction == 'resume') {
          chapterCheckTime = setInterval(chapterHighlight, 1000);
        }
      }

      function checkPlayerStatus(state) {
        if (state == 'mediaStarted') {
          chapterCheckTime = setInterval(chapterHighlight, 1000);
        } else if (state == 'mediaEnded') {
          clearInterval(chapterCheckTime);
        }
      }

      function chapterSwitch(time) {
        if (chapterTiming[currentChapter + 1] < time) {
          chapterSwitched = true;
          currentChapter++;
          chapterSwitch(time);
        } else if (chapterTiming[currentChapter] > time) {
          chapterSwitched = true;
          currentChapter--;
          chapterSwitch(time);
        } else {
          return chapterSwitched;
        }
      }

    });
    return this;
  };

  $.fn.vzPlaycountattacher = function(options){
    var that = this,
        id = that.attr("id").match(/\d{1,7}/)[0],
        url = 'http://vzaar.com/api/videos/' + id + '.json?callback=?';

    $.getJSON(url, function (video) {
      if (video) {
        var plays = video.play_count === 1 ? video.play_count + " play" : video.play_count + " plays";
        $(that).after('<div class="vzPlaycount">' + plays + '</div>');
      }
    });
    return this;
  };

}( jQuery );

function vzInit(id) {
  return new vzPlayer(id);
}

function vzEmbed(opts) {
  var url = "http://view.vzaar.com/" + opts.newId + "/player?apiOn=true&autoplay=true&" + opts.flashvars;
  $('#'+opts.id).parent().fadeOut("slow").promise().done(function() {
    $('#'+opts.id).attr("src", url);
    $(this).delay(2000).fadeIn('slow');
  });
}

function timeConvert(curTime) {
  if (isNaN(curTime)) {
    curTime = 0;
  }
  var parsedTime = parseInt(curTime);
  mins = (Math.floor(parsedTime/60)).toString();
  secs = (parsedTime % 60).toString();
  if (mins.length === 1) {
    mins = "0" + mins;
  }
  if (secs.length === 1) {
    secs = "0" + secs;
  }
  return mins + ":" + secs;
}

//cookie stuff
   //                           .-'''''-.
   //                           |'-----'|
   //                           |-.....-|
   //                           |       |
   //                           |       |
   //          _,._             |       |
   //     __.o`   o`"-.         |       |
   //  .-O o `"-.o   O )_,._    |       |
   // ( o   O  o )--.-"`O   o"-.`'-----'`
   //  '--------'  (   o  O    o)
   //               `----------`
(function ($, document, undefined) {

  var pluses = /\+/g;

  function raw(s) {
    return s;
  }

  function decoded(s) {
    return decodeURIComponent(s.replace(pluses, ' '));
  }

  var config = $.cookie = function (key, value, options) {

    // write
    if (value !== undefined) {
      options = $.extend({}, config.defaults, options);

      if (value === null) {
        options.expires = -1;
      }

      if (typeof options.expires === 'number') {
        var days = options.expires, t = options.expires = new Date();
        t.setDate(t.getDate() + days);
      }

      value = config.json ? JSON.stringify(value) : String(value);

      return (document.cookie = [
        encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
        options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
        options.path    ? '; path=' + options.path : '',
        options.domain  ? '; domain=' + options.domain : '',
        options.secure  ? '; secure' : ''
      ].join(''));
    }

    // read
    var decode = config.raw ? raw : decoded;
    var cookies = document.cookie.split('; ');
    for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
      if (decode(parts.shift()) === key) {
        var cookie = decode(parts.join('='));
        return config.json ? JSON.parse(cookie) : cookie;
      }
    }

    return null;
  };

  config.defaults = {};

  $.removeCookie = function (key, options) {
    if ($.cookie(key) !== null) {
      $.cookie(key, null, options);
      return true;
    }
    return false;
  };

})(jQuery, document);
