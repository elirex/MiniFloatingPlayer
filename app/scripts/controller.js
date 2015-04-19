(function (window) {
	"use strict";

	var LOG_TAG = "Controller: "

	/**
	 * Takes a model and view and acts as the controller between them
	 * 
	 * @constructor
	 * @param {object} model The model constructor
	 * @param {object} view The view constructor
	 */

	function Controller(model, view) {
		this._model = model;
		this._view = view;
		this.$webview = $$('#webview');
	}
    
	Controller.prototype.addItem = function(e) {
		console.log(LOG_TAG + e.target.value);
		this._model.parse(e.target.value, function(data) {
			this._playVideo(data);
		}.bind(this));
	}

	Controller.prototype._playVideo = function(data) {
		this.$webview.innerHTML = this._view.show(data)
	}


	// Export to window
	window.app.Controller = Controller;
})(window);
