$(function() {

    'use strict';

    function Touch($el) {

        // CONSTANTS
        this._MOVE_THRESHOLD = 15;
        this._TAP_TIME = 150;

        var that = this;

        this._el = $el;
        this._q  = { left:[], right:[],  up:[], down:[], tap:[] };

        this._el.bind('touchstart', function(e) {

            // Handle swipe events
            that._beginPos = that._getTouchPos(e);

            // Handle tap events
            that._isTap = true;
            setTimeout(function() {
                that._isTap = false;
            }, that._TAP_TIME);

        }).bind('touchmove', function(e) {

            // Handle swipe events
            that._endPos = that._getTouchPos(e);
            that._dispatchTouchmove(e, this);

            // Handle tap events
            that._isTap = false;

            // Prevent defaults
            return false;

        }).bind('touchend', function(e) {

            // Handle tap events
            that._dispatchTap(e, this);
        });
    }
    Touch.prototype = {

        _triggerQueue: function(name, e, context) {

            var queue = this._q[name];

            if (queue) {
                for (var i = queue.length; i--;) {
                    queue[i] && queue[i].call(context, e);
                }
            }

            return this;
        },

        _getTouchPos: function(e) {

            e = e.originalEvent ? e.originalEvent : e;

            return {
                x : e.touches[0].pageX,
                y : e.touches[0].pageY
            };
        },

        _dispatchTouchmove: function(e, context) {

            var diffX = this._endPos.x - this._beginPos.x,
                diffY = this._endPos.y - this._beginPos.y;

            diffX >  this._MOVE_THRESHOLD && this._triggerQueue('right', e, context);
            diffX < -this._MOVE_THRESHOLD && this._triggerQueue('left', e, context);
            diffY >  this._MOVE_THRESHOLD && this._triggerQueue('down', e, context);
            diffY < -this._MOVE_THRESHOLD && this._triggerQueue('up', e, context);

            return this;
        },

        _dispatchTap: function(e, context) {
            this._isTap && this._triggerQueue('tap', e, context);
            return this;
        },

        destroy: function() {
            this._el.unbind('touchstart touchmove');
            this._el = null;
            this._q  = null;
            return this;
        },

        // Accept  'tap' | 'left' | 'right' | 'up' | 'down'
        on: function(eventType, callback) {
            this._q[eventType] && this._q[eventType].push(callback);
            return this;
        }
    };

    var audio = {

        _elTpl : '<div style="display:none;"><audio src="" preload autoplay loop></audio></div>',
        _elCtl : null,

        play: function() {
            this._elCtl.play();
            return this;
        },

        pause: function() {
            this._elCtl.pause();
            return this;
        },

        init: function(url) {

            var that = this;

            if (url) {
                this._elCtl = $(this._elTpl).find('audio').attr('src', url)[0];

                $(function() {
                    that._elCtl.play();
                });

                $('body').one('touchstart', function() {
                    that._elCtl.play();
                    return false;
                });
            }

            return this;
        }
    };

    var fullPage = {

        _PAGE_SPEED     : 800,
        _MOVE_THRESHOLD : 0.3,

        _pageEls   : $('.page'),
        _contentEl : $('.content'),
        _pageCount : $('.page').length,

        _busy       : false,
        _pageHeight : 0,
        _currIndex  : 1,
        _currPageY  : 0,

        _fixPage: function() {
            this._pageHeight = $(window).height();
            this._pageEls.height(this._pageHeight);
            this._goToPage(this._currIndex);
            return this;
        },

        // Opeations on switching to the target page
        _onMove: function(index) {
            this._pageEls.removeClass('active ani');
            this._pageEls.eq(index - 1).addClass('active');
            this._pageEls.eq(index - 1).addClass('ani');

            if (index === this._pageCount) {
                $('.arrow').hide();
            } else {
                $('.arrow').show();
            }

            return this;
        },

        // Move the content to the target position
        _setContentPos: function(targetY) {
            this._contentEl.attr('style', '-webkit-transform:translateY(-' +
                    targetY + 'px);');
            this._currPageY = targetY;
            return this;
        },

        _setContentPosCss: function(targetY, speed) {
            this._contentEl.attr('style', '-webkit-transform:translateY(-' +
                    targetY + 'px);-webkit-transition:all ' +
                    (speed / 1000) + 's;');
            this._currPageY = targetY;
            return this;
        },

        // Move the content to the target page
        _goToPage: function(index, speed) {

            var beginY = this._currPageY,
                endY   = (index - 1) * this._pageHeight,
                diffY  = endY - beginY,
                that   = this;

            if (!this._busy && index > 0 && index <= this._pageCount) {

                this._busy = true;

                if (speed) {
                    this._setContentPosCss(endY, speed);
                } else {
                    this._setContentPos(endY);
                }

                this._onMove(index);
                this._currIndex = index;

                setTimeout(function() {
                    that._busy = false;
                }, this._PAGE_SPEED);
            }

            return this;
        },

        onDrop: function(diffY) {

            var beginY      = (this._currIndex - 1) * this._pageHeight,
                moveFlag    = Math.abs(diffY) > this._pageHeight * this._MOVE_THRESHOLD,
                diffIndex   = diffY < 0 ? 1 : -1,
                targetIndex = moveFlag ? this._currIndex + diffIndex : this._currIndex;

            if (targetIndex < 1) {
                targetIndex = 1;
            } else if (targetIndex > this._pageCount) {
                targetIndex = this._pageCount;
            } else {
                // Do nothing
            }

            this._goToPage(targetIndex, this._PAGE_SPEED);

            return this;
        },

        onDrag: function(diffY) {
            var beginY = (this._currIndex - 1) * this._pageHeight;
            return this._setContentPos(beginY - diffY);
        },

        switchTo: function(index) {
            return this._goToPage(index, this._PAGE_SPEED);
        },

        prev: function() {
            this._currIndex > 1 && this.switchTo(this._currIndex - 1);
            return this;
        },

        next: function() {
            this._currIndex < this._pageCount && this.switchTo(this._currIndex + 1);
            return this;
        },

        init: function() {

            var that = this;

            this._currIndex = 1;

            $(window).resize(function() {
                that._fixPage();
            });

            return this._fixPage();
        }
    };

    fullPage.init();

    // Swipe switch
    new Touch($('.wrapper')).on('up', function() {
        fullPage.next();
    }).on('down', function() {
        fullPage.prev();
    });


});
