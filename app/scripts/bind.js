/**
 * File name: bind.js
 * Author: Wang, Sheng Yuan (Elirex)
 * Date: 2015-06-21
 * Copyright 2015 Wang Sheng Yuan
 */
(function (window) {
	"use strict";
	window.$ = document.querySelectorAll.bind(document);
	window.$$ = document.querySelector.bind(document);
})(window);
