(function(window) {
	"use strict";
	var LOG_TAG = "View ";

	function View() {
		this._defaultWebViewTemplate = '<webview id="youtube_window" style="position: absolute; width:{{width}}; height:100%; background: #000000;" src="{{src}}">';
		// this._tmp = '<iframe sandbok="allow-same-origin" style="position: absolute; width:100%; height:100%;" src="{{src}}"></iframe>';
		// this._tmp2 = '<webview src="{{src}}">';
	}

	View.prototype.show = function(data) {
		var webview = this._defaultWebViewTemplate;
		// var url = "M7lc1UVf-VE";
		var width = "100%";
 		// var src = "https://www.youtube.com/watch?v=C7wRb9adQUc";
		// webview = webview.replace("{{src}}", "http://www.youtube.com/embed/" + data);
		webview = webview.replace("{{src}}", "http://localhost:8080/" + data + ".html");
		

		// webview = webview.replace("{{src}}", src);
		webview = webview.replace("{{width}}", width);
		console.log(LOG_TAG + webview);
		//var tmpiframe = this._tmp;
		//tmpiframe = tmpiframe.replace("{{src}}", "https://www.youtube.com/embed/" + data);
		//return tmpiframe;
		return webview;
	}

	

	// Export to window
	window.app.View = View;
})(window);
