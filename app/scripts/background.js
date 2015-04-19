chrome.app.runtime.onLaunched.addListener(launch);

var screenWidth = screen.availWidth;
var screenHeigh = screen.availHeight;
var width = 600;
var height = 390;

function launch() {
	chrome.app.window.create('index.html', {
		frame: "none",
		id: "main",
		outerBounds: {
			width: width,
			height: height,
			maxWidth: width,
			maxHeight: height,
			left: Math.round((screenWidth-width)/2),
			top: Math.round((screenHeigh-height)/2),
			minWidth: width,
			minHeight: height,
		},
		alwaysOnTop: true
	});
}
