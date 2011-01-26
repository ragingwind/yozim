/*
 * yozm JavaScript Library v0.1
 * https://github.com/ragingwind/yozim
 *
 * Copyright (c) 2010 devnight.net. All rights reserved.  Use of this
 * source code is governed by a MIT license that can be found in the
 * LICENSE file.
 * 
 * Daum Yozm rights reserved.
 */

var yozm = {
	delegate: undefined,
	errors: {
		400: "잘못된 요청을 보냈습니다. Yozim의 버전이 맞지 않거나 서버 이상일 수 있습니다.",
		401: "인증이 되지 않은 사용자의 요청입니다. 옵션에서 인증을 다시 해보세요.",
		404: "요청을 찾지 못했습니다. 잠시후 다시 시도해보십시오.",
		500: "서버 오류 입니다. 잠시후 다시 시도해보십시오.",
		3000: "메세지가 포함되지 않았습니다.",
		3004: "URL Shorten 값이 올바르지 않습니다.",
		3006: "Parent Message Id값이 올바르지 않습니다."
	},
	oauth: {
		sid: {message:"yozm.oauth.message", secret:"yozm.oauth.secret"},
		message: {
			action: "",
			method: "GET",
			parameters: {
				oauth_consumer_key:"",
				oauth_signature_method: "HMAC-SHA1",
				oauth_callback: "oob",
				oauth_token:"",
				oauth_verifier:"",
			}
		},
		secret: {
			consumer:"",
			token: "",
			verified: false
		},
		save: function() {
			localStorage[yozm.oauth.sid.message] = JSON.stringify(yozm.oauth.message);
			localStorage[yozm.oauth.sid.secret] = JSON.stringify(yozm.oauth.secret);
		},
		load: function() {
			if (localStorage[yozm.oauth.sid.message] == undefined) {
				localStorage[yozm.oauth.sid.message] = JSON.stringify(yozm.oauth.message);
			}

			if (localStorage[yozm.oauth.sid.secret] == undefined) {
				localStorage[yozm.oauth.sid.secret] = JSON.stringify(yozm.oauth.secret);
			}

			yozm.oauth.message = JSON.parse(localStorage[yozm.oauth.sid.message]);
			yozm.oauth.secret = JSON.parse(localStorage[yozm.oauth.sid.secret]);
		},
		sign: function() {
			OAuth.setTimestampAndNonce(yozm.oauth.message);
			OAuth.SignatureMethod.sign(yozm.oauth.message, {
				consumerSecret: yozm.oauth.secret.consumer,
				tokenSecret: yozm.oauth.secret.token
			});
		},
		reset: function() {
			yozm.oauth.secret.verified = false;
			yozm.oauth.message.oauth_token = "";
			yozm.oauth.secret.token = "";
			localStorage.removeItem(yozm.oauth.sid.message);
			localStorage.removeItem(yozm.oauth.sid.secret);
		}
	},
	init: function(o) {
		yozm.delegate = o.delegate;
		yozm.oauth.load();
		yozm.oauth.message.parameters.oauth_consumer_key = o.ckey;
		yozm.oauth.secret.consumer = o.skey;
		yozm.oauth.message.parameters.oauth_callback = o.callback;
		yozm.oauth.save();
	},
	reset: function() {
		yozm.oauth.reset();
	},
	verified: function() {
		return yozm.oauth.secret.verified;
	},
	parseQueryString: function(r) {
		t = r.split("&");
		var string = [];
		for (var i = 0; i < t.length; ++i) {
			var pair = t[i].split("=");
			string[pair[0]] = pair[1];
		}
		return string;
	},
	parseToken: function(r) {
		if (r.status != 200) {
			yozm.reset();
			yozm.delegate.yozmDidFailWithError({error:yozm.errors[r.status]});
			return false;
		}

		var string = yozm.parseQueryString(r.responseText);
		yozm.oauth.message.parameters.oauth_token = string["oauth_token"];
		yozm.oauth.secret.token = string["oauth_token_secret"];
		return true;
	},
	didReceiveRequestToken: function(r) {
		if (yozm.parseToken(r)) {
			var url = "https://apis.daum.net/oauth/authorize?oauth_token=" + yozm.oauth.message.parameters.oauth_token;
			yozm.delegate.yozmDidReceiveRequestToken({url:url});
		}
	},
	didReceiveAccessToken: function(r) {
		if (yozm.parseToken(r)) {
			yozm.oauth.secret.verified = true;
			yozm.oauth.save();
			yozm.delegate.yozmDidReceiveAccessToken();
		}
	},
	requestRequestToken:function() {
		yozm.oauth.message.action = "https://apis.daum.net/oauth/requestToken";
		yozm.oauth.message.parameters.oauth_token = "";
		yozm.oauth.secret.token = "";
		yozm.oauth.sign();

		yozm.request(yozm.oauth.message, yozm.didReceiveRequestToken, "requestToken");
	},
	requestAccessToken: function(v) {
		yozm.oauth.message.action = "https://apis.daum.net/oauth/accessToken";
		yozm.oauth.message.parameters.oauth_verifier = v;
		yozm.oauth.sign();	
		yozm.request(yozm.oauth.message, yozm.didReceiveAccessToken, "accessToken");
	},
	didReceiveResponse: function(r) {
		var res = JSON.parse(r.responseText);
		var error = "";
		var status = "ok";
		if (r.status != 200 || res.status != 200) {
			error = res.result_msg;
			status = "error";
		}
		yozm.delegate.yozmDidReceiveResponse({action:r.action, status:status, error:error});
	},
	addMessage: function(m) {
		yozm.oauth.message.action = "http://apis.daum.net/yozm/v1_0/message/add.json";
		yozm.oauth.message.parameters.url_shorten = "durl";
		yozm.oauth.message.parameters.img_url = m.imgUrl;
		yozm.oauth.message.parameters.message = m.message;
		yozm.oauth.sign();		
		yozm.request(yozm.oauth.message, yozm.didReceiveResponse, m.action);
	},
	request: function(om, res, action) {
		var queryString = [];
		
		for(var key in om.parameters) {
			queryString.push(key + "=" + encodeURIComponent(om.parameters[key]));
		}		
		var url = om.action + "?" + queryString.join("&") + "";

		/*/
		var data = queryString.join("&");
		$.ajax({
			type: "POST",
			url:om.action,
			dataType:'text',
			data:data,
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			success:function(data, status, xhr) {
				console.log(data, status, xhr);
			},
			error:function(xhr, stats, error){
				console.log(xhr, status, error);
			}
		});
		/**/
		/**/
		var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
	 		if (xhr.readyState == 4) {
				res({action:action, status:xhr.status, responseText:xhr.responseText});
			}
		}

        xhr.open('GET', url, true);
        xhr.send();
		/**/
	}
};