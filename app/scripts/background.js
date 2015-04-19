chrome.app.runtime.onLaunched.addListener(launch);

function launch() {
	chrome.app.window.create('index.html', {
		id: "main",
		bounds: {
			width: 600,
			height: 390
		},
		minWidth: 600,
		minHeight: 390,
		alwaysOnTop: true
	});
}
