/*
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 */

var YozmIcon = {
	paper:null,
	size:{w:100, h:142},
	color:"rgb(235, 78, 117)",
	markcolor:"rgb(100, 97, 94)",
	delegate:null,
	markicon:null,
	icon:null,
	destroy: function() {
		var _this = YozmIcon;
		_this.paper.remove();
	},
	addMark: function() {
		var _this = YozmIcon;
		if (!_this.markicon) {
			var w = _this.size.w;
			var halfX = w / 2;
			var uppermark, undermark;
			_this.markicon = _this.paper.set().push(
				(undermark = _this.paper.circle(halfX,63,10)),
				(uppermark = _this.paper.path([
					["M",halfX,50],
					["C",halfX+12,52,halfX+15,15,halfX+15,15],
					["C",halfX+15,1,halfX-15,1,halfX-15,15],
					["C",halfX-15,15,halfX-12,52,halfX,50]]))
			).attr({fill:_this.markcolor, stroke:"", opacity:0});
			_this.markicon.animate({opacity:1}, 500, ">");
			
			uppermark.node.id = "yozmicon-uppermark";
			undermark.node.id = "yozmicon-undermark";
		}
	},
	removeMark: function() {
		var _this = YozmIcon;
		if (_this.markicon) {
			_this.markicon.remove();
			_this.markicon = null;
		}
	},
	create: function(cid) {
		var _this = YozmIcon;
		_this.paper = Raphael(cid, _this.size.w, _this.size.h);
		
		var w = _this.size.w;
		var h = _this.size.h;
		var top = h - w;
		var bottom = h - 1;
		var halfX = w / 2;
		var halfY = h / 2 + 20;		
		var outline, face, lefteye, righteye, mouse;
		
		_this.icon = _this.paper.set().push(
			(outline = _this.paper.path([
				["M",halfX,top-1],
				["C",1,top,1,halfY-3,1,halfY],
				["C",1,bottom,halfX,bottom,halfX,bottom],
				["C",w-1,bottom,w-1,halfY,w-1,halfY],
				["C",100,43,73,21,73,21],
				["C",65,35,halfX+3,top,halfX,top-1]
			]).attr({fill:_this.color, stroke:""})),
			(face = _this.paper.path([	
				["M",15,83],
				["C",halfX,90,82,73,82,73],
				["C",97,127,halfX+5,133,halfX,133],
				["C",halfX,133,13,133,15,83]
			]).attr({fill:"white", stroke:""})),
			(lefteye = _this.paper.circle(30, 99, 6).attr({fill:_this.color, stroke:""})),
			(righteye = _this.paper.circle(70, 99, 6).attr({fill:_this.color, stroke:""})),
			(mouse = _this.paper.path([	
				["M",41,108],
				["C",49,110,59,108,59,108],
				["C",59,108,59,113,59,113],
				["C",59,128,41,128,41,113],
				["C",41,113,41,108,41,108],
				]).attr({fill:_this.color, stroke:""}))
		);
		
		outline.node.id = "yozmicon-outline";
		face.node.id = "yozmicon-face";
		lefteye.node.id = "yozmicon-lefteye";
		righteye.node.id = "yozmicon-righteye";
		mouse.node.id = "yozmicon-mouse";
	},
	hasElement: function(id) {
		return id.indexOf("yozmicon-") >= 0;
	}
};

var YozmShareButton = {
	tracking: {
		didenter:false,
		didstart:false,
		mousepos:null
	},
	timer: {
		mousedown:null,
		selction:null,
		post:null
	},
	button:null,
	blind:null,
	contentsInfo: {
		url: window.location.href,
		title: document.title,
		selectedText:"",
		ref: document.referrer,
		name: window.name,
		imgUrl:""
	},
	options: {
		which:0,
		interval:500
	},
	icon:null,
	yozmiconMouseOver: function(e) {
		var _this = YozmShareButton;
		_this.icon.addMark();
		_this.timer.post = window.setTimeout(_this.post, 1000);
	},
	yozmiconMouseUp: function(e) {
		var _this = YozmShareButton;
		_this.icon.removeMark();
		if (!_this.tracking.didpost)
			_this.post();
	},
	yozmiconMouseOut: function(e) {
		var _this = YozmShareButton;
		_this.icon.removeMark();
		if (_this.timer.post) {clearTimeout(_this.timer.post); _this.timer.post=null;}
	},
	// getIntersectionList is doesn't work on chrome. 
	// yozmicon was had to be check the mouse event manually.
	// too ugly.
	trackingStart: function() {
		var _this = YozmShareButton;
		$(document).bind("mousemove", _this.trackingMousemove);
		_this.tracking.didstart = true;
		_this.tracking.didenter = false;
	},
	trackingStop: function() {
		var _this = YozmShareButton;
		$(document).unbind("mousemove", _this.trackingMousemove);
		_this.tracking.didstart = false;
		_this.tracking.didenter = false;
	},
	trackingMousemove: function(e) {
		var _this = YozmShareButton;
		var target = document.elementFromPoint(e.clientX, e.clientY);
		
		if (!target || !target.id || !_this.icon.hasElement(target.id)) {
			if (_this.tracking.didenter) {
				_this.tracking.didenter = false;
				_this.yozmiconMouseOut(e);
			}
		}
		else {
			if (!_this.tracking.didenter) {
				_this.tracking.didenter = true;
				_this.yozmiconMouseOver(e);				
			}
		}
		
		// for prevent a selection event clearly, don't check the string length.
		// string process(document.getSelection().toString()) is take a some time.
		document.getSelection().removeAllRanges();
	},
	post: function() {
		var _this = YozmShareButton;
		if (_this.timer.post) {clearTimeout(_this.timer.post); _this.timer.post=null;}
		if (_this.tracking.didstart) {
			chrome.extension.sendRequest({action:"sharebutton:addMessage", info:_this.contentsInfo},function(r) {});
			_this.hide(true);		
		}
	},
	init: function() {
		var _this = YozmShareButton;	
		$("body").append("<div id='yozim-sharebutton-blind' style='display:none'></div>");
		$("body").append("<div id='yozim-sharebutton-button' style='display:none'></div>");
		
		_this.blind = $("#yozim-sharebutton-blind");
		_this.button = $("#yozim-sharebutton-button");
		
		_this.icon = YozmIcon;
		_this.icon.create("yozim-sharebutton-button");
		_this.icon.delegate = this;		
		
		// add events listener
		$(document).bind("mousedown", function(e) {
			_this.track(e);
		});
		
		$(document).bind("mouseup", function(e) {
			if (_this.tracking.didstart) {
				var target = document.elementFromPoint(e.clientX, e.clientY);
				if (!target || !target.id || _this.icon.hasElement(target.id)) {
					_this.yozmiconMouseUp(e);
				}
			}
			_this.hide(false);
			_this.contentsInfo.selectedText = document.getSelection().toString();				
		});
	},
	setUp: function() {
		var _this = YozmShareButton;
		chrome.extension.sendRequest(
			{action:"sharebutton:getOptions"},
			function(r) {
				console.log("GET OPTIONS, START TO INIT", r.options);
				_this.options.which = r.options.which;
				_this.init();
		});		
	},
	show: function() {
		var _this = YozmShareButton;
		
		// check that user try to select a text.
		var selectedText = document.getSelection().toString();
		if (selectedText.length > 0 && selectedText != _this.contentsInfo.selectedText)
			return;
		else
			document.getSelection().removeAllRanges();
		
		// check a dimension.
		var winsize = {w:$(window).width(),h:$(window).width()};
		var iconsize = _this.icon.size;
		var halfsize = {w:(iconsize.w / 2), h:(iconsize.h / 2)};
		
		var iconpos = {
			x:_this.tracking.mousepos.clientX - halfsize.w + document.body.scrollLeft,
			y:_this.tracking.mousepos.clientY - 5 - iconsize.h + document.body.scrollTop
		};
		
		if (iconpos.x < 2)
			iconpos.x = 2;
		else if (iconpos.x + iconsize.w > winsize.w) 
			iconpos.x -= (iconpos.x + iconsize.w - winsize.w);

		// using a screen coordinate.
		if (iconpos.y - document.body.scrollTop < 0)
			iconpos.y = iconpos.y + iconsize.h;
				
		// show blind and button	
		_this.blind.width($(document).width());
		_this.blind.height($(document).height());	

		_this.blind.fadeTo(200, 0.4);
		_this.button.css("left", iconpos.x);
		_this.button.css("top", iconpos.y);
		_this.button.fadeTo(300, 1);
		
		// prepare data
		if (_this.tracking.mousepos.target.nodeName == "IMG") {
			// except the base64 type.
			if (_this.tracking.mousepos.target.src.indexOf("data:") != 0) {
				_this.contentsInfo.imgUrl = _this.tracking.mousepos.target.src;
			}
		}
		
		_this.contentsInfo.selectedText = selectedText;

		// start mouse capture.	
		_this.trackingStart();
	},
	hide: function(effect) {
		var _this = YozmShareButton;

		if (_this.timer.mousedown) clearTimeout(_this.timer.mousedown);
		if (_this.timer.selection) clearTimeout(_this.timer.selection);
		
		if (_this.tracking.didstart) {
			_this.trackingStop();
		
			if (_this.timer.post) clearTimeout(_this.timer.post);

			_this.icon.removeMark();
			_this.button.hide();		
			_this.blind.hide();
		}
	},
	track: function(e) {
		var _this = YozmShareButton;		
		var w = $(window).width(), h = $(window).height();
		if (_this.options.which != e.which
			|| e.keyCode != 0 
			|| e.metaKey == true || e.shiftKey == true || e.altKey == true || e.ctrlKey == true
			|| _this.tracking.didstart 
			|| w < e.clientX || h < e.clientY
			|| ($(window).width() < _this.icon.size.w || $(window).height() < _this.icon.size.h)
			|| e.target.nodeName == "INPUT"
			|| e.target.nodeName == "TEXTAREA"
			|| e.target.nodeName == "SELECT"
			|| e.target.nodeName == "BUTTON"
			|| e.target.nodeName == "EMBED"
			|| e.target.nodeName == "OBJECT")
			return;
		_this.tracking.mousepos = e;
		_this.timer.mousedown = window.setTimeout(_this.show, _this.options.interval);
	}
};

$(document).ready(function() {
	YozmShareButton.setUp();
});


