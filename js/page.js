var currentActiveIdx = -1;
var imagesDoms = [];
var imageOffsets = [];
var globalSnapTop;
var globalSnapRight;

jQuery.fn.reverse = [].reverse;

$(document).ready(function() {
  $(window).scroll(function() { 
    switchActive();
    updateActiveElem();
  });

  $(window).resize(function() {
    var prevActive = currentActiveIdx;
    makeActive(-1);
    recordWindowSpacePositions();
    makeActive(prevActive);
  }); 

  // when first image read
  $('.image-display').eq(0).ready(function() {
    recordWindowSpacePositions();
  });

  // set initial position and show image
  $('.image-column').children().each(function(idx) {
    var elem = $(this);
    var anchorName = "#anchor" + (idx + 1);
    var anchor = $(anchorName);
    if (anchor)
      elem.css('top', anchor.offset().top - anchor.parent().offset().top);
    elem.css('opacity', 1);

    imagesDoms.push(elem);
    imageOffsets.push({ top: elem.position().top, height: elem.height() == 0 ? 200 : elem.height() });
    console.log("elem " + idx + " position:" + elem.position().top + ", height: " + elem.height());

    elem.on('load', function() {
      imageOffsets[idx].height = elem.height();
      console.log("update elem " + idx + " position:" + elem.position().top + ", height: " + imageOffsets[idx].height);
    });
  });
});

$(window).on('load', function() {
  console.log("window ready");
  // update heights when all images loaded
/*
  $('.image-column').children().each(function(idx) {
    var elem = $(this);
    imageOffsets[idx].height = elem.height();
    console.log("update elem " + idx + " position:" + elem.position().top + ", height: " + imageOffsets[idx].height);
  });
*/
});

function recordWindowSpacePositions() {
  // record the screen-space position for fixed positioning of active element
  var firstElem = $('.image-column').eq(0);
  globalSnapTop = firstElem.offset().top;
  console.log("top: ", globalSnapTop);
  globalSnapRight = $(window).width() - (firstElem.offset().left + firstElem.outerWidth());
}

function switchActive() {
  var nextActiveIdx = -1;
  for (var i = imagesDoms.length - 1; i >= 0; i--) {
    if ($(window).scrollTop() >= imageOffsets[i].top) {
      nextActiveIdx = i;
      break;
    }
  }

  if (nextActiveIdx != currentActiveIdx) {
    makeActive(nextActiveIdx);
  }
}

function makeActive(nextIdx) {
  // when an alement becomes inactive, it changes from fixed to absolute positioning
  // so restore its right and top to values relative to the parent div
  if (currentActiveIdx != -1) {
    imagesDoms[currentActiveIdx].removeAttr('id');
    imagesDoms[currentActiveIdx].css('top', imageOffsets[currentActiveIdx].top);
    imagesDoms[currentActiveIdx].css('right', 0);
  }

  // when an element becomes active it uses fixed positioning
  // we update its right and top only once
  if (nextIdx != -1) {
    imagesDoms[nextIdx].attr('id', 'active-image');
    imagesDoms[nextIdx].css('top', globalSnapTop);
    imagesDoms[nextIdx].css('right', globalSnapRight);
  }

  currentActiveIdx = nextIdx;
}

function updateActiveElem() {
  if (currentActiveIdx == -1)
    return;

  var elem = $('#active-image');

  if ($(window).scrollTop() < 0)
    elem.css('top', globalSnapTop - $(window).scrollTop());

  var opacity = 1.0;
  if (currentActiveIdx != -1 && currentActiveIdx < imageOffsets.length - 1) {
    var nextTopPos = imageOffsets[currentActiveIdx + 1].top;
    var currBottomPos = $(window).scrollTop() + imageOffsets[currentActiveIdx].height;
    var distance = nextTopPos - currBottomPos;
    var transitionHeight = 150;
    var activationMargin = 0;
    if (distance < transitionHeight + activationMargin)
      opacity = 1.0 - (0, transitionHeight - distance + activationMargin) / transitionHeight;
    opacity = Math.max(0, Math.min(1, opacity));
  }
  elem.css('opacity', opacity);
}
