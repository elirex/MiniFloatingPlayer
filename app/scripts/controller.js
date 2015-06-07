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
		this.$historyview = $$('#history-view');
		
		window.addEventListener('load', function() {
			this.showHistory();
		}.bind(this));

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

	Controller.prototype.showHistory = function() {
		this._model.read(function(data) {
			this.$historyview.innerHTML = this._view.showHistory(data);
		}.bind(this));
		// this.model.read(function(data) {
		// 	
		// }.bind(this));
	}


	// Export to window
	window.app.Controller = Controller;
})(window);
