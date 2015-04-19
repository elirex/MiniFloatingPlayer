/* global Model, View, Controller, $$  */
(function () {
	"use strict";
	var LOG_TAG = "App: ";


	function Player() {
		this._storage = new app.Store("player-list");
		this._model = new app.Model(this._storage);
		this._view = new app.View();
		this._controller = new app.Controller(this._model, this._view);
	}

	var player = new Player();

	$$("#textarea_Url").addEventListener("paste", event);	
	$$("#textarea_Url").addEventListener("drop", event);

	function event(e) {
		 setTimeout(function() {
			console.log(LOG_TAG + "paste the " + e.target.value );
			player._controller.addItem(e);
			$$("#textarea_Url").style.display = 'none';
		 }, 100); 
	}

})();
