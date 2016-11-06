/**
 * File name: key.js
 * Author: Wang, Sheng Yuan (Elirex)
 * Date: 2011-11-06
 * Copyright 2016 Wang Sheng Yuan
 */
(function(window) {
	'use strict';

	var LOG_TAG = "Key: ";

	/**
	 * Create a new Model instance.
	 * 
	 * @constructor
	 *
	 */
	function Key() {
		this._key = "Input YouTube API Key";
    }

	Key.prototype.getKey = function() {
		return this._key;
	}

	// Export to window
	window.app.Key = Key;
})(window); 
