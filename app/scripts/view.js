(function(window) {
	"use strict";
	var LOG_TAG = "View ";

	function View() {
		this._defaultWebViewTemplate = '<webview id="youtube_window"' 
		+ ' style="position: absolute; width:{{width}};' 
		+ ' height:100%; background: #000000;" src="{{src}}">';

		// this.defaultHistoryTemplate = '<div class="row" style="height:270px">'
		// 	+ '<div class="col s12 m7">' 
		// 	+ '<div class="card">' 
		// 	+ '<div class="card-image">'
		// 	+ '<webview src="{{img}}" style="width: 300.5px; height:150px">'
		// 	+ '</div>'
		// 	+ '<div class="card-content"><p>{{title}}</p></div>'
		// 	+ '</div></div></div>';
		this.defaultHistoryTemplate = '<div class="left" style="margin-left:16px;">' 
			+ '<div class="card blue-grey darken-1" style="width:300px">' 
			+ '<div class="card-image">'
			+ '<webview src="{{img}}" style="width: 300px; height:150px">'
			+ '</div>'
			+ '<div id="{{id1}}" class="card-content white-text"><p id="{{id2}}">{{title}}</p></div>'
			+ '</div></div>';

		// this._tmp = '<iframe sandbok="allow-same-origin" style="position: absolute; width:100%; height:100%;" src="{{src}}"></iframe>';
		// this._tmp2 = '<webview src="{{src}}">';
	}

	View.prototype.show = function(data) {
		var webview = this._defaultWebViewTemplate;
		// var url = "M7lc1UVf-VE";
		var width = "100%";
 		// var src = "https://www.youtube.com/watch?v=C7wRb9adQUc";
		// webview = webview.replace("{{src}}", "http://www.youtube.com/embed/" + data);
		webview = webview.replace("{{src}}", "http://localhost:8080/"
								  + data + ".html");
		

		webview = webview.replace("{{width}}", width);
		console.log(LOG_TAG + webview);
		return webview;
	}

	View.prototype.showHistory = function(data) {
		var view = '';
		var length = data.length;
		for(var i = 0; i < length; i++) {
			var template = this.defaultHistoryTemplate;

			template = template.replace('{{img}}', data[i].image);
			template = template.replace('{{title}}', data[i].title);
			template = template.replace('{{id1}}', data[i].id);
			template = template.replace('{{id2}}', data[i].id);

			view = view + template;

		}
		return view;
	}

	

	// Export to window
	window.app.View = View;
})(window);
