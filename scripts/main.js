var s,
    dots,
    bars,
    rows,
    dotUnit = 15,
    progress,
    xaxisH,
    duration,
    fadeout = 16,
    uniqueEvents = [],
    prevEvent = [],
    currentEvent,
    tally = 0;
    index = 0;
    count = 0,
    totals = 0,
    accentColor = 'darkred';

docReady(function(){
  s = Snap('#ms-timeline');
  initGraphic();
  bigButtons();
});

function initGraphic(){
  var vb = s.attr('viewBox'),
      vbw = vb.width,
      radius = 4.5,
      pad = 3,
      dotWidth = (radius+pad)*2,
      top = dotWidth,
      line = .5,
      posInLine = 0,
      dotsPerLine = vbw/dotWidth,
      l = data.length, // var data is defined in data/fatalities.js
      rows = Math.ceil(l/dotsPerLine),
      vbh = rows*dotWidth + 100, //100 is approximate height of bars, not dynamic or exact
      newVB = '0 0 ' + vbw + ' ' + vbh;

  var prevEvent = data[0].date;

  dotUnit = dotWidth;
  // add the first event to the events array
  uniqueEvents.push([prevEvent, data[0].beat/1.75, data[0].total, data[0].location]);

  // update the viewBox size
  s.attr('viewBox', newVB);
  xAxisH = dotUnit/4;

  // timetracker box
  rect = s.rect(dotUnit/4, (rows+1)*dotUnit, vbw-dotUnit/2, xAxisH);
  rect.attr({
    fill: '#aaaaaa',
    id: 'xaxis'
  })

  // creates a group element
  dots = s.g().addClass('dots');
  bars = s.g().addClass('bars');


  progress = s.rect(dotUnit/4, (rows+1)*dotUnit, 0, xAxisH);
  progress.attr({
    fill: accentColor
  })


  for (var i=0; i<l; i++){
    var date = data[i].date;

    if (date !== prevEvent){
      // Divide beat by 2 to get the audio position in seconds 
      // The BPM is set to 120, so 120 beats per minute = 2 beats per second
      uniqueEvents.push([date, data[i].beat/2.015, data[i].total, data[i].location]); 
      prevEvent = date;
    } 
    
    var dot,
        posX = dotWidth*posInLine,
        left = posX + (radius+pad);

    if ( posX > (vb.width - dotWidth*1.5) ){
      if (line == .5){
        dot = s.circle(left, top*.5, radius);
      } else {
        dot = s.circle(left, top*line, radius);
      }

      posInLine = 0;
      line++;
    } else {
      posInLine++;
      dot = s.circle(left, top*line, radius);
    }

    dot.attr({
      fill: '#aaaaaa',
      class: 'light'
    });

    // Adds the use element to our group
    dots.add(dot);
  }

  //console.log(uniqueEvents);
  currentEvent = uniqueEvents[0];
}

function bigButtons(){
  //play button stuff
  var playMatrix = new Snap.Matrix();
  playMatrix.scale(.4,.4);            // play with scaling before and after the rotate
  playMatrix.translate(660, 210);

  var playbg = s.rect(0,0,180,183).transform(playMatrix).attr({
    fill: '#444444'
  });
  var play = s.polyline([45,40,140,90,45,140]).transform(playMatrix).attr({
    fill: '#fff'
  });

  var playgroup = s.group();
  playgroup.add(playbg, play);
  playgroup.attr({
    class: 'playgroup',
    cursor: 'pointer',
    opacity: .9
  });
  playgroup.hover(function(){
    playgroup.animate({
      opacity: 1
    }, 250, mina.easeinout)
  }, function(){
    playgroup.animate({
      opacity: .9
    }, 250, mina.easeinout)
  });


  playgroup.click(function(){
    var scale = 0;
    playgroup.animate({
      //transform: miniMatrix
      opacity:0
    }, 250, mina.easeinout, function(){
      this.remove();
    });
    document.getElementById('playBtn').click();
  })
}

function labelAxis(){
  //hardcoding duration because mobile browsers can't actually calculate it
  if (!duration || duration<1){
    duration = 228.075125;
  }

  for (var i=0, l=uniqueEvents.length; i<l; i++){
    var date = uniqueEvents[i][0],
        beat = uniqueEvents[i][1],
        total = uniqueEvents[i][2],
        location = uniqueEvents[i][3],
        b2s = beat,///2.01, //beats to seconds
        percent = b2s/(duration - fadeout), //subtract 5 for the extra seconds of the audio fading out
        posX = (s.attr('viewBox').width - dotUnit/2) * percent + dotUnit/4,
        posY = parseInt(s.select('#xaxis').attr('y')) + xAxisH-.5;//s.attr('viewBox').height-dotUnit*3.255;

    var incident = s.rect(posX, posY, 4, total*1.75);
    incident.attr({
      fill: '#aaaaaa',
      class: 'bar'
    }).data({
      'date': date,
      'location': location,
      'total': total
    }).click(function(){
      tooltip(this, posY-dotUnit/2);
    }).hover(function(){
      tooltip(this, posY-dotUnit/2);
    }, function(){
      s.select('#ttip-data').remove();
    });




    if ( (i == 0) || (i == l-1) ){
      var splitDate = date.split('-'),
          //label = parseInt(splitDate[0]) + '/' + splitDate[2],
          label = splitDate[2],
          t1;
      if (i == l-1){
        t1 = s.text(posX-15, posY-dotUnit/2, label); //minus 15 due to extra time at end of audio track
      } else {
        t1 = s.text(posX, posY-dotUnit/2, label);
      }
      t1.attr({
        fill: '#666666',
        'font-size': 8
      });
    } 

    // Adds the use element to our group
    bars.add(incident);
  }
}

function prettyTime(time){
  // Minutes and seconds
  var mins = ~~(time / 60);
  var secs = time % 60;

  // Hours, minutes and seconds
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  ret = "";

  if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  //ret += "" + parseFloat(secs).toFixed(2);
  ret += "" + parseInt(secs);
  return ret;
}

function str_pad_left(string,pad,length) {
  return (new Array(length+1).join(pad)+string).slice(-length);
}

function updateTime(audio){
  var acurrent = audio.currentTime;

  var currentTime = Math.floor(acurrent);
  
  document.getElementById('tracktime').innerHTML = prettyTime(audio.currentTime) + ' | ' + prettyTime(duration);
}

function progressBar(audio){
  var acurrent = audio.currentTime,
      length = uniqueEvents.length,
      percent = acurrent/(duration - fadeout),
      maxWidth = s.select('#xaxis').attr('width'),
      newWidth = (s.attr('viewBox').width - dotUnit/2) * percent + 1;

  if (newWidth <= maxWidth) {
    progress.animate({
      'width': newWidth
    }, 300);
  }
}


function addEvents(audio){
  var acurrent = audio.currentTime,
      length = uniqueEvents.length;

  for (var i = 0; i < length; i++) {
    var beat = uniqueEvents[i][1];
        next = 0;

    if (uniqueEvents[i+1]){
      next = uniqueEvents[i+1][1];
    }

    if ( (acurrent >= beat-.25) || (acurrent >= beat+.25) && (acurrent < next) ) {
      currentEvent = uniqueEvents[i];
      index = i;
    } 
  }

  if (currentEvent[0] == prevEvent[0]) {
    // same event
    var html = 'Last incident: <span>' + currentEvent[0] + '</span><br />';
    html += 'Location: <span>' + currentEvent[3] + '</span><br />';
    html += 'Fatalities: <span>' + currentEvent[2] + '</span>';
    document.getElementById('info-box').innerHTML = html;
  } else {
    // new event
    animateDots(currentEvent);
    var bar = s.selectAll('rect.bar')[index],
        clone = bar.clone(),
        speed = (duration/bar.getBBox().width)*10;

    clone.before(bar)
    .attr({
      'fill': accentColor,
      'width': 0,
      'height': 0,
      'class': 'clone'
    })
    .animate({ 
      'width': bar.getBBox().width,
      'height': bar.getBBox().height
    }, 1500, mina.linear)
    .click(function(){
      tooltip(bar, bar.attr('y')-dotUnit/2);
    })
    .hover(function(){
      tooltip(bar, bar.attr('y')-dotUnit/2);
    }, function(){
      s.select('#ttip-data').remove();
    });
  }

  if ( (acurrent > uniqueEvents[length - 1][1]-.25) && (acurrent < (uniqueEvents[length - 1][1]) ) ){
    animateDots(uniqueEvents[length-1]);
  }

  prevEvent = currentEvent;

}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animateDots(event){
  var date = event[0],
      total = parseInt(event[2]),
      title = event[3],
      selectedCount = 0;

  totals += total; //need to subtact this from total fatalities so that the random number generator has the correct range 

  for (var i=0; i<total; i++){
    var delay = 35*(i);

    setTimeout(function(){
      var max = data.length-totals;
      if (max > 5){
        var random = getRandomInt(1, max);
        selected = s.selectAll('circle.light')[random];//:nth-of-type(' + random + ')');
      } else {
        selected = s.selectAll('circle.light')[0];
      }
      
      if (selected){
        dots.append(selected); //brings selected dot to front
        selected.attr({
          class: '',
          fill: accentColor
        });
        selected.animate({
          cy: 330
          //transform: 'r90,200,200'//,
          //opacity: 0
        }, 1500, mina.easeinout);
        selected.animate({
          opacity: 0,
          //fill: '#444444'
        }, 850);
      } 
    }, delay);
    selectedCount++;
  }

  var lights = s.selectAll('.light').length;
  //console.log('lights left:' + lights);
  //console.log('difference:' + (data.length - lights) );

  count++;
  //console.log(date + ' fatalities=' + total + ' count=' + count + /*' random=' + random + */' selectedcount=' + selectedCount + ' grandtotal=' + totals);

}

function tooltip(elem, posY){
  var date = elem.data('date'),
      location = elem.data('location'),
      total = elem.data('total'),
      text = date + '   |   ' + location + '   |   ' + total + ' fatalities',
      info = s.text(0, posY, text),
      tip = s.select('#ttip-data'),
      posX;

  if (tip) {
    tip.remove();
  }

  info.attr({
    fill: '#666666',
    opacity: 0,
    'font-size': 8,
    id: 'ttip-data'
  });
  info.node.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
  posX = s.select('#xaxis').attr('width')/2 - info.node.clientWidth/2;
  info.attr({
    x: posX
  })
  info.animate({
    opacity: 1
  }, 100)
}

function audioHooks(audio){
  addEvents(audio);
  updateTime(audio);
  setTimeout(function(){
    progressBar(audio);
  },100)
}
function audioData(audio){
  duration = audio.duration;
  labelAxis();
  updateTime(audio);
  audio.addEventListener("ended",function() {
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('playBtn').style.display = 'inline';
  });
}
function checkAudio(){
  var audio = document.getElementById('track');
  if(audio.ended){
    rewind(audio);
  } else {
    audio.play();
    var bigPlay = s.select('.playgroup')
    if (bigPlay){
      bigPlay.animate({
        opacity:0
      }, 250, mina.easeinout, function(){
        this.remove();
      });
    }
  }
  document.getElementById('pauseBtn').style.display = 'inline';
  document.getElementById('playBtn').style.display = 'none';
}
function pauseAudio(){
  document.getElementById('track').pause();
  document.getElementById('pauseBtn').style.display = 'none';
  document.getElementById('playBtn').style.display = 'inline';
}
function restart(){
  document.getElementById('ms-timeline').innerHTML = '';
  var audio = document.getElementById('track');
  if(audio.ended){
    rewind(audio);
  } else {
    rewind(audio); 
  }
}
function rewind(audio){
  resetGlobals();
  audio.pause();
  audio.currentTime = 0;
  initGraphic();
  audioData(audio);
  audio.play();
  document.getElementById('pauseBtn').style.display = 'inline';
  document.getElementById('playBtn').style.display = 'none';
}
function resetGlobals(){
  s.selectAll('.bars').remove();
  s.selectAll('.dots').remove();
  s.selectAll('rect').remove();
  s.selectAll('text').remove();
  dotUnit = 15;
  dots = [];
  bars = [];
  progress = '';
  duration = 228.075125;
  uniqueEvents = [];
  prevEvent = [];
  currentEvent = [];
  tally = 0;
  index = 0;
  count = 0;
  totals = 0;
}