/**
 * File name: model.js
 * Author: Wang, Sheng Yuan (Elirex)
 * Date: 2015-06-21
 * Copyright 2015 Wang Sheng Yuan
 */
(function(window) {
	"use strict"
	
	var LOG_TAG = "Model: ";
	
	var fs = require('browserify-fs');

	/**
	 * Create a new Model instance.
	 * 
	 * @constructor
	 *
	 */

	function Model(storage) {
		this._xmlHttp = new XMLHttpRequest();
		this._storage = storage;
		this._historyData;
	}

	Model.prototype.parse = function(data, callback) {
		var matched = /^.*(youtube.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/.exec(data);
		// matched[0]:data, [1]: v=, [2]:id

		// Debug
		for(var i = 0; i < matched.length; i++) {
			console.log(LOG_TAG + "matched[" + i + "]:" + matched[i]);
		}

		// var xmlHttp = this._xmlHttp;
		// console.log(LOG_TAG + "In parse function xmlHttp=" + xmlHttp);
		// EndDebug
		var fileName = '/' + matched[2] + '.html';
		var srcURL = '"https://www.youtube.com/embed/' + matched[2] 
				+ '?autoplay=1&showinfo=0&enablejsapi=1&version=3&autohide=1"';
		var content = '<!DOCTYPE html><html>'
					+ '<body style="margin-left:-1px; margin-top:-1px;' 
					+ ' margin-bottom:-1px ; width:640px; height:390px;">' 
					+ '<iframe  allowtransparency="true" ' 
					+ 'style="background: black" width="640" height="390"' 
					+ ' src=' + srcURL + ' framborder="0"></iframe>' 
					+ '</body></html>';
		fs.mkdir('/', function() {
			fs.writeFile(fileName, content, function() {
				this._requestVideoInfo(matched[2], callback);
			}.bind(this));
		}.bind(this));
		
	}
	 
	// Request youtube video information
	Model.prototype._requestVideoInfo = function(id, callback) {
		var storage = this._storage;
		storage.find(function(data) {
			var length = data.length;
			var isHasInfo = false;
			for(var i = 0; i < length; i++) {
				if(data[i].id === id) {
					isHasInfo = true;
					break;
				}
			}

			if(isHasInfo === false) {
				var url = 'https://www.googleapis.com/youtube/v3/videos?' 
						+ 'part=snippet' 
						+ '&id=' + id 
						+ '&key=AIzaSyDpr3gbwjKop-ataKjaOlMYs-Z0XyOzAmM';
				console.log(LOG_TAG + "Request " + id + " information URL: " 
							+ url);	
				var xmlHttp = this._xmlHttp;
				xmlHttp.open("GET", url, true);
				xmlHttp.send();
				xmlHttp.onreadystatechange = function() {
					console.log(LOG_TAG + "xmlHttp.status=" + xmlHttp.status 
								+ ", xmlHttp.readyState=" + xmlHttp.readyState);
					if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
						var obj = JSON.parse(xmlHttp.responseText);

						var videoInfo = {
							id: obj.items[0].id,
							title: obj.items[0].snippet.title,
							description: obj.items[0].snippet.description,
							image: obj.items[0].snippet.thumbnails.medium.url
						};
						// console.log(LOG_TAG + "JSON: ", obj.items[0].id + " " 
						// 			+ obj.items[0].snippet.title + " "
						// 		   + obj.items[0].snippet.description);
						storage.save(videoInfo);
						// storage.find();
					}
				}
			}
		}.bind(this));
	
		
		if(callback) {
			callback(id);
		}
	}

	Model.prototype.read = function(callback) {
		callback = callback || function () {};
		return this._storage.find(callback);
	}

	// Export to window
	window.app.Model = Model;
})(window);
