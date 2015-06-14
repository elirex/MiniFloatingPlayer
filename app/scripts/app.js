/* global Model, View, Controller, $$  */
(function () {
	"use strict";
	var LOGTAG = "App: "

	function Player() {
		this._storage = new app.Store("player-list");
		this._model = new app.Model(this._storage);
		this._view = new app.View();
		this._controller = new app.Controller(this._model, this._view);
		this._server = new app.Server();


		this.appWindow = chrome.app.window.current();
	}

	var player = new Player();



	$$("#btn-close").addEventListener("click", onClickClose);
	// $$("#btn-fullscreen").addEventListener("click", onClickFullScreen);
	$$("#btn-ontop").addEventListener("click", onClickOnTop);
	$$("#body").addEventListener("mousemove", onMouseMove);
	$$("body").addEventListener("keydown", onKeyDown);
	
	var btnAppAction = $$("#btn-app-action");
	var btnHistory = $$("#btn-history");
	var btnWindowAction = $$("#btn-window-action");
	var inputArea = $$("#input-area");
	var inputAction = $$("#input-action");
	var cardHistoryView = $$("#history-view");
	var timeout = null;

	inputArea.addEventListener("paste", event);
	inputArea.addEventListener("drop", event);
	btnHistory.addEventListener("click", onClickHistory);

	cardHistoryView.addEventListener("click", function(e) {
		var target = e.target;
		console.log(LOGTAG, "target", target, target.id);
		if(target.id !== 'history-view' && target.id !== "") {
			$$("#webview").innerHTML = player._view.show(target.id);
			cardHistoryView.style.display = 'none';
		}
	})

	function onKeyDown(e) {
		if(e.keyCode == 27) {
			var isShow = cardHistoryView.style.display;
			if(isShow == 'block') {
				cardHistoryView.style.display = 'none';
			}
		}
	}


	function clearHide() {
		setTimeout(function() {
			clearTimeout(timeout);
		}, 30);
	}


	function onMouseMove() {
		btnAppAction.style.display = 'block';
		btnWindowAction.style.display = 'block';
		inputAction.style.display = 'block';

		clearTimeout(timeout);
		timeout = setTimeout(function () {
			btnAppAction.style.display = 'none';
			btnWindowAction.style.display = 'none';
			inputAction.style.display = 'none';
		}, 1500);
	}
	
	function event(e) {
		 setTimeout(function() {
			console.log(LOGTAG + "paste the " + e.target.value);
			cardHistoryView.style.display = 'none';
			player._controller.addItem(e);
			inputArea.value = '';
		 }, 100); 
	}


	function onClickHistory() {
		var isShow = cardHistoryView.style.display;
		if(isShow == 'block') {
			cardHistoryView.style.display = 'none';
		} else {
			player._controller.showHistory();
			cardHistoryView.style.display = 'block';
		}
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
		player._server.closeServerSocket();
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
