/* global Model, View, Controller, $$  */
(function () {
	"use strict";
	var LOGTAG = "App: "
	
	var fs = require('browserify-fs');

	fs.mkdir('/', function() {
		fs.writeFile('/index.html', '<iframe width="640" height="390" src="https://www.youtube.com/embed/kffacxfA7G4" frameborder="0" allowfullscreen></iframe>');
	});

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



	$$("#textarea_Url").addEventListener("paste", event);	
	$$("#textarea_Url").addEventListener("drop", event);
	$$("#btn-close").addEventListener("click", onClickClose);
	$$("#btn-fullscreen").addEventListener("click", onClickFullScreen);
	$$("#body").addEventListener("mousemove", onMouseMove);
	
	var btnAppAction = $$("#btn-app-action");
	var btnWindowAction = $$("#btn-window-action");
	var timeout = null;

	function clearHide() {
		setTimeout(function() {
			clearTimeout(timeout);
		}, 50);
	}

	function onMouseMove() {
		btnAppAction.style.display = 'block';
		btnWindowAction.style.display = 'block';
		clearTimeout(timeout);
		timeout = setTimeout(function () {
			btnAppAction.style.display = 'none';
			btnWindowAction.style.display = 'none';
		}, 1500);
	}
	
	function event(e) {
		 setTimeout(function() {
			console.log(LOGTAG + "paste the " + e.target.value);
			player._controller.addItem(e);
			$$("#textarea_Url").style.display = 'none';
		 }, 100); 
	}

	function onClickClose() {
		var isFullscreen = player.appWindow.isFullscreen();
		if(isFullscreen) {
			player.appWindow.restore();
			setTimeout(function() {
				player.appWindow.close();
			}, 1000);
		} else {
			player.appWindow.close();
		}
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
