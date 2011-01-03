/*
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 */

(function() {
	var contentsImages = [];

	var s = document.getElementsByTagName("img");
	for (var i = 0; i < s.length; ++i)
		contentsImages.push(s[i].src);
	
	var port = chrome.extension.connect({name: "cs"});
	port.postMessage({action:"contentsImages", images:contentsImages});
})();