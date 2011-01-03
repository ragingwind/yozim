/*
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 * 
 * Daum durl.me rights reserved.
 */

var durl = {
	jsonRequest: function(url) {
		var r = undefined;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send(null);
		if (xhr.status == 200) {
			r = JSON.parse(xhr.responseText);
		}
		return r;
	},
	me: {
		shorten: function(url) {
			return durl.jsonRequest("http://durl.me/api/Create.do?type=json&longurl=" + encodeURIComponent(url));
		},
		sanpshot: function(key) {
			return "http://durl.me/" + key + ".image";
		},
		status: function(key) {
			return durl.jsonRequest("http://durl.me/" + msg.key + ".status?type=json");
		}
	}
};