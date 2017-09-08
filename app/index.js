require('../resources/less/index.less');
var fullPage = {
	_PAGE_SPEED: 800,
	//THRESHOLD门槛
	_MOVE_THRESHOLD: .3,
	//页面page元素集合
	_pageEls: $('.page'),
	//包含所有page的元素
	_contentEl: $('.content'),
	//page页数
	_pageCount : $('.page').length,
	//滑页箭头
	_arrowEl: $('.arrow'),
	_isMoving: false,
	_pageHeight: 0,
	_currIndex: 1,
	_currPageY: 0,
	init: function(){
		var self = this;
		self._currIndex = 1;
		$(window).resize(function(){
			self._fixPage();
		})
		return self._fixPage();
	},
	switchTo: function(index){
		return this._goToPage(index, this._PAGE_SPEED);
	},
	/*
		prev和next方法都返回this方便链式调用
	*/
	prev: function(){
		//a && b的写法，当a为真的时候返回b
		this._currIndex > 1 && this.switchTo(this._currIndex - 1);
		return this;
	},
	next: function(){
		this._currIndex < this._pageCount && this.switchTo(this._currIndex + 1);
		return this;
	},
	_fixPage: function(){
		this._pageHeight = $(window).height();
		/*
			将所有page元素的高度设为屏幕高度
			所以在浏览器屏幕resize的时候要重新调用这个方法
		*/
		this._pageEls.height(this._pageHeight);
		this._goToPage(this._currIndex);
		return this;
	},
	//将当前内容移到目标页
	_goToPage: function(index, speed){
		var beginY = this._currPageY,
			//要移动到的Y
			endY = (index - 1) * this._pageHeight,
			diffY = endY - beginY,
			self = this;
		console.log(index, !self._isMoving, index <= self._pageCount)
		if(!self._isMoving && index > 0 && index <= self._pageCount){
			self._isMoving = true;
			if(speed){
				self._setContentPosCss(endY, speed);
			} else {
				self._setContentPos(endY);
			}
			self._onMove(index);
			self._currIndex = index;
			//在page_speed之后把_isMoving设为false
			setTimeout(function(){
				self._isMoving = false;
			}, self._PAGE_SPEED);
		}
	},
	_onMove: function(index){
		//index - 1增加active和ani类名
		// if(index === this._currIndex) return;
		this._pageEls.removeClass('active ani')
		this._pageEls.eq(index - 1).addClass('active').addClass('ani');
		if(index === this._pageCount){
			this._arrowEl.hide();
		} else {
			this._arrowEl.show();
		}
		return this;
	},
	_setContentPos: function(targetY){
		console.log(111, targetY);
		this._contentEl.attr('style', '-webkit-transform:translateY(-' +
                    targetY + 'px);');
		this._currPageY = targetY;
		return this;
	},
	//比上面的方法多了一个transition设置速度
	_setContentPosCss: function(targetY, speed) {
        this._contentEl.attr('style', '-webkit-transform:translateY(-' +
                targetY + 'px);-webkit-transition:all ' +
                (speed / 1000) + 's;');
        this._currPageY = targetY;
        return this;
    },
}
fullPage.init();
// $('.wrapper').on('up', function() {
//     fullPage.next();
// }).on('down', function() {
//     fullPage.prev();
// })
$('.wrapper').bind('click', function(){
    fullPage.next();
})