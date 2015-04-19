(function(window) {
	'use strict';

	var LOG_TAG = "Store: ";

	function Store(name, callback) {
		var data;
		var dbName;

		dbName = this._dbName = name;

		callback = callback || function() {};

		chrome.storage.local.get(dbName, function(storage) {
			if(dbName in storage) {
				callback.call(this, storage[dbName].videos);
			} else {
				storage = {};
				storage[dbName] = {
					videos: [ ]
				};
				chrome.storage.local.set(storage, function() {
					callback.call(this, storage[dbName].videos);
				}.bind(this));
			}
		}.bind(this));
	}

	Store.prototype.save = function(videoInfo, callback) {
		chrome.storage.local.get(this._dbName, function(storage) {
			var data = storage[this._dbName];
			var videos = data.videos;

			callback = callback || function() {};

			if(videos.length == 1) {
				if(!(videos[0].id == videoInfo.id)) {
					videos.push(videoInfo)
				}
			} else {
				for(var i = 0; i < videos.length; i++) {
					if(videos[i].id == videoInfo.id) {
						videos.splice(i, 1);
						break;
					}
				}

				if(videos.length == 10) {
					videos.shift();
				}

				videos.push(videoInfo);
			}

			chrome.storage.local.set(storage, function() {
				callback.call(this, [videoInfo]);
			}.bind(this));

		}.bind(this));
	};

	Store.prototype.find = function(callback) {
		callback = callback || function() {};
		chrome.storage.local.get(this._dbName, function(storage) {
			var videos = storage[this._dbName] && storage[this._dbName].videos || [ ];

			for(var i = 0; i < videos.length; i++) {
				console.log(LOG_TAG + "id:" + videos[i].id + " title:" + videos[i].title + " description:" + videos[i].description);
			}

			callback.call(this, videos);
		}.bind(this));
	};


	// Export to window
	window.app.Store = Store;
})(window); 
