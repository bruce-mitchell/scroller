(function ($) {
  var PagesSliderTouch = function (slider, options) {
    this.options = $.extend({
      endDuration: 300
    }, options);

    this.slider = slider;
    this.content = slider.children().first();
    this.currentIndex = 0;
    this.pages = this.content.children();
    this.slider.width(this.pages.first().width());

    var totalWidth = 0;
    this.pages.each(function (index, page) {
      totalWidth += $(page).width();
    });
    this.content.width(totalWidth);
    $('.header-nav__list')[0].childNodes[1].classList.add('active-item');
    this.bindEvents();
  };
  $.extend(PagesSliderTouch.prototype, {
    bindEvents: function () {
      let self = this;
      $('.header-nav__list').children().each(function (i) {
        $(this).click(function () {
          var index = i;
          self.goToIndex(index);
        });
      });
      $('#device').width(window.innerWidth);

      this._removeTransition = $.proxy(this.removeTransition, this);
      this._startDrag = $.proxy(this.startDrag, this);
      this._doDrag = $.proxy(this.doDrag, this);
      this._endDrag = $.proxy(this.endDrag, this);

      this.content
        .on('dragstart', this._startDrag)
        .on('transitionend', this._removeTransition);
      $('body')
        .on('drag', this._doDrag)
        .on('dragend', this._endDrag);
    },

    goToIndex: function (index) {
      this.updateHeaderIndexIndicator(index);
      var position = this.pages.eq(index).position();

      this.content
        .css('transition', 'all ' + this.options.endDuration + 'ms ease')
        .css('transform', 'translate3d(' + (-1 * (position.left)) + 'px, 0, 0)');

      this.currentIndex = index;
    },

    resetActiveItems: function () {
      $('.header-nav__list').children().removeClass('active-item');
    },
    updateHeaderIndexIndicator: function (index) {
      this.resetActiveItems();
      let nodeIndex = (index * 2) + 1;
      $('.header-nav__list')[0].childNodes[nodeIndex].classList.add('active-item');
    },
    destroy: function () {
      this.content
        .off('dragstart', this._startDrag)
        .off('transitionend', this._removeTransition);
      $('body')
        .off('drag', this._doDrag)
        .off('dragend', this._endDrag);
    },
    startDrag: function (event) {
      this.enableDrag = true;
    },
    doDrag: function (event) {
      if (this.enableDrag) {
        var position = this.pages.eq(this.currentIndex).position();
        var delta = event.gesture.deltaX;

        this.content.css('transform', 'translate3d(' + (delta - position.left) + 'px, 0, 0)');
        event.preventDefault();
      }
    },
    endDrag: function (event) {
      if (this.enableDrag) {
        this.enableDrag = false;

        var delta = event.gesture.deltaX;
        if (Math.abs(delta) > this.slider.width() / 10) {
          if (delta < 0) {
            this.next();
          } else {
            this.prev();
          }
        } else {
          this.current();
        }
        this.updateHeaderIndexIndicator(this.currentIndex);
      }
    },
    removeTransition: function () {
      this.content.css('transition', 'none');
    },
    current: function () {
      this.goToIndex(this.currentIndex);
    },
    next: function () {
      if (this.currentIndex >= this.pages.length - 1) {
        this.current();
      } else {
        this.goToIndex(this.currentIndex + 1);
      }
    },
    prev: function () {
      if (this.currentIndex <= 0) {
        this.current();
      } else {
        this.goToIndex(this.currentIndex - 1);
      }
    }
  });

  $.fn.pagesSliderTouch = function (options) {
    this.hammer();
    this.each(function (index, slider) {
      var $this = $(slider);
      var pagesSliderTouch = new PagesSliderTouch($this, options);
      $this.data('pagesSliderTouch', pagesSliderTouch);
    });
    return this;
  };

  const GRADIENT_ONE = [[253, 145, 79], [224, 50, 152]];
  const GRADIENT_TWO = [[94, 169, 247], [25, 86, 207]];
  const GRADIENT_THREE = [[81, 251, 213], [55, 198, 197]];
  const GRADIENT_FOUR = [[94, 169, 247], [25, 86, 207]];
  // precision is 10 for 10ths, 100 for 100ths, etc.
  function roundUp(num, precision) {
    return Math.ceil(num * precision) / precision
  }

  const interpolateRGB = function (color1, color2, factor) {
    if (arguments.length < 3) {
      factor = 0.5;
    }
    let result = color1.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
  };

  let h = document.getElementById('home'),
    home_rect = h.getBoundingClientRect(),
    prev_left = home_rect.left,
    breakpoint_1 = home_rect.left - home_rect.width,
    breakpoint_2 = breakpoint_1 - home_rect.width,
    breakpoint_3 = breakpoint_2 - home_rect.width;

  setInterval(() => {
    let rect = h.getBoundingClientRect(),
      left = rect.left;

    if (prev_left === left) return;
    updateBackgroundColor(prev_left, left);
  });

  const updateBackgroundColor = function (prev_left, left) {
    let sliding;
    if (prev_left > left) sliding = 'left';
    if (prev_left < left) sliding = 'right';

    let slide;
    if (left > breakpoint_1) {
      if (sliding === 'left') slide = 2; // entering slide 2
      else slide = 1; // leaving slide 2 into slide 1

      let delta = home_rect.left - left;
      let factor = roundUp(delta / home_rect.width, 10);

      let [g0r, g0g, g0b] = interpolateRGB(GRADIENT_ONE[0], GRADIENT_TWO[0], factor);
      let [g1r, g1g, g1b] = interpolateRGB(GRADIENT_ONE[1], GRADIENT_TWO[1], factor);

      $('#app').css('background', `linear-gradient(11deg,
        rgb(${g1r}, ${g1g}, ${g1b}) 5%,
        rgb(${g0r}, ${g0g}, ${g0b})
    )`);
    }

    if (left <= breakpoint_1 && left >= breakpoint_2) {
      if (sliding === 'left') slide = 3; // entering slide 3
      else slide = 2; // leaving slide 3 into slide 2

      let delta = home_rect.left - left;
      let factor = roundUp(delta / home_rect.width, 10) - 1;

      let [g0r, g0g, g0b] = interpolateRGB(GRADIENT_TWO[0], GRADIENT_THREE[0], factor);
      let [g1r, g1g, g1b] = interpolateRGB(GRADIENT_TWO[1], GRADIENT_THREE[1], factor);

      $('#app').css('background', `linear-gradient(11deg,
        rgb(${g1r}, ${g1g}, ${g1b}) 5%,
        rgb(${g0r}, ${g0g}, ${g0b})
    )`);
    }

    if (left <= breakpoint_2 && left >= breakpoint_3) {
      if (sliding === 'left') slide = 4; // entering slide 3
      else slide = 3; // leaving slide 3 into slide 2

      let delta = home_rect.left - left;
      let factor = roundUp(delta / home_rect.width, 10) - 1;

      let [g0r, g0g, g0b] = interpolateRGB(GRADIENT_THREE[0], GRADIENT_FOUR[0], factor);
      let [g1r, g1g, g1b] = interpolateRGB(GRADIENT_THREE[1], GRADIENT_FOUR[1], factor);

      $('#app').css('background', `linear-gradient(11deg,
        rgb(${g1r}, ${g1g}, ${g1b}) 5%,
        rgb(${g0r}, ${g0g}, ${g0b})
    )`);
    }
    console.log(sliding, slide);

    prev_left = left;
  };

  let rect = h.getBoundingClientRect(),
    left = rect.left;
  updateBackgroundColor(prev_left, left);

})(jQuery);
