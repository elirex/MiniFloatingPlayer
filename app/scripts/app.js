/* global Model, View, Controller, $$  */
(function () {
	"use strict";
	var LOG_TAG = "App: ";


	function Player() {
		this._storage = new app.Store("player-list");
		this._model = new app.Model(this._storage);
		this._view = new app.View();
		this._controller = new app.Controller(this._model, this._view);
		this.appWindow = chrome.app.window.current();
	}

	var player = new Player();

	$$("#textarea_Url").addEventListener("paste", event);	
	$$("#textarea_Url").addEventListener("drop", event);
	$$("#btn-close").addEventListener("click", onClickClose);
	$$("#btn-fullscreen").addEventListener("click", onClickFullScreen);
	$$("#body").addEventListener("mousemove", onMouseMove);
	
	var btnAppOperate = $$("#test");
	var timeout = null;
	function clearHide() {
		setTimeout(function() {
			clearTimeout(timeout);
		}, 50);
	};
	function onMouseMove() {
		btnAppOperate.style.display = 'block';
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			btnAppOperate.style.display = 'none';
		}, 1500);
	};
	

	function event(e) {
		 setTimeout(function() {
			console.log(LOG_TAG + "paste the " + e.target.value );
			player._controller.addItem(e);
			$$("#textarea_Url").style.display = 'none';
		 }, 100); 
	}

	function onClickClose() {
		player.appWindow.restore();
		setTimeout(function() {
			player.appWindow.contentWindow.close();
		}, 500);
	}

	function onClickFullScreen() {
		var isFullscreen = player.appWindow.isFullscreen();
		var icon = $$("#btn-fullscreen-icon");
		if(isFullscreen) {
			player.appWindow.restore();
			icon.className = "large mdi-content-add";
		} else {
			player.appWindow.fullscreen();
			icon.className = "large mdi-content-remove";
		}
	}

})();
