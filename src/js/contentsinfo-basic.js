/*
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 */

(function() {
	var contentsInfo = {
		url: window.location.href,
		title: document.title,
		selectedText: document.getSelection().toString(),
		ref: document.referrer,
		name: window.name,
		imgUrl:"",
	};
	chrome.extension.sendRequest(
		{action:"contentsinfo:basic", info:contentsInfo},
		function(r) {
			
	});
})();