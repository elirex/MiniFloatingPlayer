(function(window) {
	"use strict"
	
	var LOG_TAG = "Model: ";

	/**
	 * Create a new Model instance.
	 * 
	 * @constructor
	 *
	 */

	function Model(storage) {
		this._xmlHttp = new XMLHttpRequest();
		this._storage = storage;
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
		
		this._requestVideoInfo(matched[2], callback);
	}
	 
	// Request youtube video information
	Model.prototype._requestVideoInfo = function(id, callback) {
		var url = "https://gdata.youtube.com/feeds/api/videos?q=" + id + "&v=2&alt=jsonc";
		console.log(LOG_TAG + "Request " + id + " information URL: " + url);	
		var xmlHttp = this._xmlHttp;
		xmlHttp.open("GET", url, true);
		xmlHttp.send();
		var storage = this._storage;
		xmlHttp.onreadystatechange = function() {
		 	console.log(LOG_TAG + "xmlHttp.status=" + xmlHttp.status + ", xmlHttp.readyState=" + xmlHttp.readyState);
		 	if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
		 		var obj = JSON.parse(xmlHttp.responseText);

		 		var videoInfo = {
		 			id: obj.data.items[0].id,
		 			title: obj.data.items[0].title,
		 			description: obj.data.items[0].description
		 		};
		 		// console.log(LOG_TAG + "JSON: " + obj.data.items[0]);
		 		storage.save(videoInfo);
				storage.find();
		 	}
		}

		
		if(callback) {
			callback(id);
		}
	}

	// Export to window
	window.app.Model = Model;
})(window);
