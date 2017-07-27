(function ($) {
  let PagesSliderTouch = function (slider, options) {
    this.options = $.extend({
      endDuration: 300
    }, options);

    this.slider = slider;
    this.content = slider.children().first();
    this.currentIndex = 0;
    this.pages = this.content.children();
    this.pages.each((index, page) => {
      page.style.width = window.innerWidth;
    });
    this.slider.width(this.pages.first().width());

    let totalWidth = 0;
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
          let index = i;
          self.goToIndex(index);
        });
      });
      $('#device').width(window.innerWidth);

      this._removeTransition = $.proxy(this.removeTransition, this);
      this._startDrag = $.proxy(this.startDrag, this);
      this._doDrag = $.proxy(this.doDrag, this);
      this._endDrag = $.proxy(this.endDrag, this);

      this.pages.each((index, page) => {
        let hammer = new Hammer.Manager(page),
          swipe = new Hammer.Swipe();

        hammer.add(swipe);

        hammer.on('swipeleft', this.goToIndex.bind(this, (index + 1)))
          .on('swiperight', this.goToIndex.bind(this, (index - 1)));
      });
    },

    goToIndex: function (index) {
      if (index < 0 || index > (this.pages.length - 1)) return;
      this.updateHeaderIndexIndicator(index);
      let position = this.pages.eq(index).position();

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
        let position = this.pages.eq(this.currentIndex).position();
        let delta = event.gesture.deltaX;

        this.content.css('transform', 'translate3d(' + (delta - position.left) + 'px, 0, 0)');
        event.preventDefault();
      }
    },

    endDrag: function (event) {
      if (this.enableDrag) {
        this.enableDrag = false;

        let delta = event.gesture.deltaX;
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
    this.each(function (index, slider) {
      let $this = $(slider);
      let pagesSliderTouch = new PagesSliderTouch($this, options);
      $this.data('pagesSliderTouch', pagesSliderTouch);
    });
    return this;
  };

})(jQuery);
