(function(window) {
	"use strict"
	
	var LOGTAG = "Server ";
	var fs = require('browserify-fs');

	var tcpServer = chrome.sockets.tcpServer;
	var tcpSocket = chrome.sockets.tcp;
	var filelist;

	function Server() {
		this._serverSocketId = null;
		this._filesMap = {};

		fs.readdir('/', function(err, files) {
			filelist = files;
			console.log(LOGTAG, 'files:', filelist);
		});
		// chrome.system.network.getNetworkInterfaces(function(interfaces) {
		// 	for(var i in interfaces) {
		// 		var subInterface = interfaces[i];
		// 		console.log(LOGTAG + "Inferface: name=" + subInterface.name + " ip=" + subInterface.address);
		// 	}
		// });

		// Chrome file system example
		// chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function(theEntry) {
		// 	if(!theEntry) {
		// 		console.log(LOGTAG, 'No Directory');
		// 		return;
		// 	}
		// 	console.log(LOGTAG, theEntry);
		// });
		

	}

	/* The public methods */
	Server.prototype.createServerSocket = function() {
		// console.log(LOGTAG, "this._filesMap", this._filesMap);
		tcpServer.create({}, this._onCreate.bind(this));
	};

	Server.prototype._onCreate = function(createInfo) {
		this.serverSocketId = createInfo.socketId;
		if(this.serverSocketId > 0) {
			tcpServer.onAccept.addListener(this._onAccept.bind(this));
			tcpServer.listen(this.serverSocketId, '127.0.0.1', 8080, 50, this._onListenComplete.bind(this));
		} else {
			console.log(LOGTAG, 'error', 'Unable to create socket');
		}
	};

	Server.prototype._onListenComplete = function(resultCode) {
		if(resultCode !== 0) {
			console.log(LOGTAG, 'error', 'Unable to listen to socket. Resultcode=' + resultCode);
		} else {
			tcpSocket.onReceive.addListener(this._onReceive.bind(this));
		}
	};

	Server.prototype.closeServerSocket = function() {
		// var serverSocketId = this._serverSocketId;
		// var tcpServer = this._tcpServer;
		// var tcpSocket = this._tcpSocket;
		if(this.serverSocketId) {
			tcpServer.close(this.serverSocketId, function() {
				if(chrome.runtime.lastError) {
					console.warn(LOGTAG, "chrome.sockets.tcpServer.close: " + chrome.runtime.lastError);
				}
			});
		}

		tcpServer.onAccept.removeListener(this._onAccept.bind(this));
		tcpSocket.onReceive.removeListener(this._onReceive.bind(this));
	};

	/* The private methods */
	
	/**
	 * Event raised when a connection has been made to the server socket.
	 * @this {Server}
	 * @param {object} acceptInfo that includes socketId and clientSocketId.
	 */
	Server.prototype._onAccept = function(acceptInfo) {
		tcpSocket.setPaused(acceptInfo.clientSocketId, false);
		if(acceptInfo.socketId != this.serverSocketId) {
			return;
		}
		console.log(LOGTAG, "ACCEPT", acceptInfo);
	};

	Server.prototype._onReceive = function(receiveInfo) {
		console.log(LOGTAG, "READ", receiveInfo);
		var socketId = receiveInfo.socketId;

		// Parse the request.
		var data = this._arrayBufferToString(receiveInfo.data);
		// we can only deal with GET requests
		if(data.indexOf("GET ") !== 0) {
			// close socket and exit handler
			this._destroySocketById(socketId);
			return;
		}

		var keepAlive = false;
		if(data.indexOf("Connection: keep-alive") != -1) {
			keepAlive = true;
		}

		var uriEnd = data.indexOf(" ", 4);
		if(uriEnd < 0) {
			// throw a wobbler
			return;
		}
		var uri = data.substring(4, uriEnd);
	
		// strip query string
		var q = uri.indexOf("?");
		if(q != -1) {
			uri = uri.substring(0, q);
		}
		console.log(LOGTAG, "Requests: " + uri);
		var url = '/' + uri;
		fs.readFile(url, 'utf-8', function(err, data) {
			this._write200Response(socketId, data, keepAlive);
		}.bind(this));
		// console.log(LOGTAG, 'file=' + file);
		// if(!!file == false) {
		// 	console.warn(LOGTAG + "_onReceive:", "File does not exist..." + uri);
		// 	this._writeErrorResponse(socketId, 404, this._keepAlive);
		// 	return;
		// }
		// this._write200Response(socketId, file, this._keepAlive);
	};


	Server.prototype._write200Response = function(socketId, file, keepAlive) {
		var header = this._getSuccessHeader(file, keepAlive);
		var outputBuffer = new ArrayBuffer(header.byteLength + file.length);
		var view = new Uint8Array(outputBuffer);
		view.set(header, 0);

		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			var strE = String.fromCharCode.apply(null, new Uint8Array(e.target.result));
			view.set(new Uint8Array(e.target.result), header.byteLength);
			var tmp = String.fromCharCode.apply(null, new Uint8Array(outputBuffer));
			this._sendReplayToSocket(socketId, outputBuffer, keepAlive);
		}.bind(this);
		var aFileParts = [file];
		var blob = new Blob(aFileParts, {type: 'text/html'});
		fileReader.readAsArrayBuffer(blob);
	};

	Server.prototype._writeErrorResponse = function(socketId, errorCode, keepAlive) {
		console.log(LOGTAG, "writeErrorResponse: begin...");
		var header = this._getErrorHeader(errorCode, keepAlive);
		console.info(LOGTAG, "writeErrorResponse: Done setting header...");
		var outputBuffer = new ArrayBuffer(header.byteLength);
		var view = new Uint8Array(outputBuffer);
		view.set(header, 0);
		console.info(LOGTAG, "writeErrorResponse: Dnoe setting view...");
		this._sendReplayToSocket(socketId, outputBuffer, keepAlive);
		console.info(LOGTAG, "writeErrorResponse: filereader end onload...");
		console.info(LOGTAG, "writeErrorResponse: end");
	};

	Server.prototype._getSuccessHeader = function(file, keepAlive) {
		return this._getResponseHeader(file, null, keepAlive);
	};

	Server.prototype._getErrorHeader = function(errorCode, keepAlive) {
		return this._getResponseHeader(null, errorCode, keepAlive);
	};

	Server.prototype._getResponseHeader = function(file, errorCode, keepAlive) {
		var httpStatus = "HTTP/1.0 200 OK";
		var contentType = "text/html";
		var contentLength = 0;
		
		if(!file || errorCode) {
			httpStatus = "HTTP/1.0 " + (errorCode || 404) + " Not found";
		} else {
			contentType = file.type || contentType;
			contentLength = file.length;
		}

		var lines = [
			httpStatus,
			"Content-length:" + contentLength, 
			"Content-type:" + contentType
		];
		
		if(keepAlive) {
			lines.push("Connection: keep-alive");
		}
		return  this._stringToUint8Array(lines.join("\n") + "\n\n");

	};

	Server.prototype._sendReplayToSocket = function(socketId, buffer, keepAlive) {
		// verify that socket is still connected before trying to send data
		// var tcpSocket = this._tcpSocket;
		var tmp = String.fromCharCode.apply(null, new Uint8Array(buffer));
		console.log(LOGTAG, "buffer:", tmp);
		var destroySocketById =	this._destroySocketById.bind(this);
		tcpSocket.getInfo(socketId, function(socketInfo) {
			if(!socketInfo.connected) {
				destroySocketById(socketId);
				return;
			}
			
			tcpSocket.setKeepAlive(socketId, keepAlive, 1, function() {
				if(!chrome.runtime.lastError) {
					tcpSocket.send(socketId, buffer, function(writeInfo) {
						console.log(LOGTAG, "WRITE ", writeInfo);

						if(!keepAlive || chrome.runtime.lastError) {
							destroySocketById(socketId);
						}
					});
				} else {
					console.warn(LOGTAG, "chorme.sockets.tcp.setKeepAlive: " + chrome.runtime.lastError);
					destroySocketById(socketId);
				}
			});

		});
	};

	Server.prototype._destroySocketById = function(socketId) {
		tcpSocket.disconnect(socketId, function() {
			tcpSocket.close(socketId);
		});
	};

	Server.prototype._stringToUint8Array = function(string) {
		var buffer = new ArrayBuffer(string.length);
		var view = new Uint8Array(buffer);
		for(var i = 0; i < string.length; i++) {
			view[i] = string.charCodeAt(i);
		}
		return view;
	};

	Server.prototype._arrayBufferToString = function(buffer) {
		var str = '';
		var uArrayVal = new Uint8Array(buffer);
		for(var i = 0; i < uArrayVal.length; i++) {
			str += String.fromCharCode(uArrayVal[i]);
		}
		return str;
	};
	
	// Export to window
	window.app.Server = Server;
})(window);
