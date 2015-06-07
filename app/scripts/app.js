/* global Model, View, Controller, $$  */
(function () {
	"use strict";
	var LOGTAG = "App: "

	function Player() {
		this._storage = new app.Store("player-list");
		this._model = new app.Model(this._storage);
		this._view = new app.View();
		this._controller = new app.Controller(this._model, this._view);
		
		// Develop
		this._server = new app.Server();
		// End


		this.appWindow = chrome.app.window.current();
	}

	var player = new Player();
	player._server.createServerSocket();



	// $$("#textarea_Url").addEventListener("paste", event);	
	// $$("#textarea_Url").addEventListener("drop", event);
	$$("#btn-close").addEventListener("click", onClickClose);
	// $$("#btn-fullscreen").addEventListener("click", onClickFullScreen);
	$$("#btn-ontop").addEventListener("click", onClickOnTop);
	$$("#body").addEventListener("mousemove", onMouseMove);
	
	// var btnAppAction = $$("#btn-app-action");
	var btnWindowAction = $$("#btn-window-action");
	var inputArea = $$("#input-area");
	var inputAction = $$("#input-action");
	inputArea.addEventListener("paste", event);
	inputArea.addEventListener("drop", event);
	var timeout = null;

	function clearHide() {
		setTimeout(function() {
			clearTimeout(timeout);
		}, 30);
	}

	function onMouseMove() {
		// btnAppAction.style.display = 'block';
		btnWindowAction.style.display = 'block';
		// $$("#textarea_Url").style.display = 'block';
		inputAction.style.display = 'block';
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			// btnAppAction.style.display = 'none';
			btnWindowAction.style.display = 'none';
			inputAction.style.display = 'none';
			// $$("#textarea_Url").style.display = 'none';
		}, 1500);
	}
	
	function event(e) {
		 setTimeout(function() {
			console.log(LOGTAG + "paste the " + e.target.value);
			player._controller.addItem(e);
			// $$("#textarea_Url").style.display = 'none';
			inputArea.value = '';
		 }, 100); 
	}

	function onClickClose() {
		// var isFullscreen = player.appWindow.isFullscreen();
		// if(isFullscreen) {
		// 	player.appWindow.restore();
		// 	setTimeout(function() {
		// 		player.appWindow.close();
		// 	}, 1000);
		// } else {
		// 	player.appWindow.close();
		// }
		player.appWindow.close();
	}

	function onClickOnTop() {
		var isOnTop = player.appWindow.isAlwaysOnTop();
		var icon = $$("#btn-lock-icon");
		if(isOnTop) {
			player.appWindow.setAlwaysOnTop(false);
			icon.className = "large mdi-action-lock-open";
		} else {
			player.appWindow.setAlwaysOnTop(true);
			icon.className = "large mdi-action-lock";
		}
	}

	// function onClickFullScreen() {
	// 	var isFullscreen = player.appWindow.isFullscreen();
	// 	var icon = $$("#btn-fullscreen-icon");
	// 	if(isFullscreen) {
	// 		player.appWindow.restore();
	// 		icon.className = "large mdi-content-add";
	// 	} else {
	// 		player.appWindow.fullscreen();
	// 		icon.className = "large mdi-content-remove";
	// 	}
	// }

})();
