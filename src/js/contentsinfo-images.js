/*
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 */

(function() {
	var contentsImages = [];

	var s = document.getElementsByTagName("img");
	for (var i = 0; i < s.length; ++i)
		if (s[i].src.length > 0)
			contentsImages.push(s[i].src);
	
	chrome.extension.sendRequest(
		{action:"contentsinfo:image", info:contentsImages},
		function(r) {

	});
})();