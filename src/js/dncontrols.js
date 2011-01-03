/*
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 */

if (!window.devnight)
	devnight = {};

devnight.controls = {};

devnight.controls.activityIndicator = {
	width:0,
	height:0,
	paddingRatio:0,
	barHeightRatio:0,
	barWidth:0,
	canvas:undefined,
	degree:0,
	angle:20,
	interval:150,
	timer:undefined,
	init: function(p) {
		var ai = devnight.controls.activityIndicator
		ai.width = p.width;
		ai.height = p.height;
		ai.paddingRatio = p.paddingRatio;
		ai.barHeightRatio = p.barHeightRatio;
		ai.barWidth = p.barWidth;
		ai.canvas = p.canvas;
		ai.canvas.width = p.width;
		ai.canvas.height = p.height;
	},
	rotate: function() {
		var ai = devnight.controls.activityIndicator;
		var ctx = ai.canvas.getContext("2d");
		var bgColor = "rgba(255, 255, 255, 1)";
		var barColor = "10, 10, 10";
		var w = ai.canvas.width;
		var h = ai.canvas.height;
		
		var a = 0.2;  
		var sin = Math.sin(Math.PI / 6);  
		var cos = Math.cos(Math.PI / 6);
		
		ctx.save();
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, w, h);
		ctx.translate(w / 2, h / 2);
		ctx.rotate(ai.degree);
		
		for (var i = 0; i <= 11; ++i) {  
			ctx.fillStyle = "rgba(" + barColor + ", " + a + ")";
			ctx.fillRect(-(ai.barWidth / 2), 
				h * ai.paddingRatio, 
				ai.barWidth, 
				h * ai.barHeightRatio);
			ctx.transform(cos, sin, -sin, cos, 0, 0);
		}
		ctx.restore();
		ai.degree += ai.angle;
	},
	start: function() {
		var ai = devnight.controls.activityIndicator;
		ai.rotate();
		ai.timer = window.setInterval(ai.rotate, ai.interval);
	},
	stop: function() {
		var ai = devnight.controls.activityIndicator;
		window.clearTimeout(ai.timer);
	}
};