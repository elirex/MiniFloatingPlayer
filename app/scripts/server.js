(function(window) {
	"use strict"
	
	var LOGTAG = "Server ";

	function Server() {
		this._tcpServer = chrome.sockets.tcpServer;
		this._tcpSocket = chrome.sockets.tcp;
		this._serverSocketId = null;
		this._filesMap = {};
		// chrome.system.network.getNetworkInterfaces(function(interfaces) {
		// 	for(var i in interfaces) {
		// 		var subInterface = interfaces[i];
		// 		console.log(LOGTAG + "Inferface: name=" + subInterface.name + " ip=" + subInterface.address);
		// 	}
		// });
	}

	/* The public methods */
	Server.prototype.createServerSocket = function() {
		var tcpServer = this._tcpServer;
		var tcpSocket = this._tcpSocket;
		var serverSocketId = this._serverSocketId;
		tcpServer.create({}, function(socketInfo) {
			serverSocketId = socketInfo.socketId;
			tcpServer.listen(serverSocketId, "127.0.0.1", 5566, 50, function(result) {
				console.log(LOGTAG + "Listening:", result);
				tcpServer.onAccept.addListener(this._onAccept);
				tcpSocket.onReceive.addListener(this._onReceive);
			});
		});
	};

	Server.prototype.closeServerSocket = function() {
		var serverSocketId = this._serverSocketId;
		var tcpServer = this._tcpServer;
		var tcpSocket = this._tcpSocket;
		if(serverSocketId) {
			tcpServer.close(serverSocketId, function() {
				if(chrome.runtime.lastError) {
					console.warn(LOGTAG, "chrome.sockets.tcpServer.close: " + chrome.runtime.lastError);
				}
			});
		}

		tcpServer.onAccept.removeListener(this._onAccept);
		tcpSocket.onReceive.removeListener(this._onReceive);
	};

	/* The private methods */
	
	/**
	 * Event raised when a connection has been made to the server socket.
	 * @this {Server}
	 * @param {object} acceptInfo that includes socketId and clientSocketId.
	 */
	Server.prototype._onAccept = function(acceptInfo) {
		var tcpSocket = this._tcpSocket;
		tcpSocket.setPaused(acceptInfo.clientSocketId, false);

		if(acceptInfo.socketId != serverSocketId) {
			return;
		}
		console.log(LOGTAG + "_onAccept", acceptInfo);
	};

	Server.prototype._onReceive = function(receiveInfo) {
		console.log(LOGTAG + "_onReceive", receiveInfo);
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
		if(data.indexOf("Connection: keey-alive") != -1) {
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
		var file = this._filesMap[uri];
		if(!!file == false) {
			console.warn(LOGTAG + "_onReceive:", "File does not exist..." + uri);
			writeErrorResponse(socketId, 404, keepAlive);
			return;
		}
		this._write200Response(socketId, file, keepAlive);
	};

	Server.prototype._write200Response = function(socketId, file) {
		var header = this._getSuccessHeader(file, keepAlive);
		var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
		var view = new Uint8Array(outputBuffer);
		view.set(header, 0);

		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			view.set(new Uint8Array(e.target.resutl), header.byteLength);
			this_sendReplyToSocket(socketId, outputBuffer, keepAlive);
		};

		fileReader.readAsArrayBuffer(file); 
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
		var contentType = "text/plain";
		var contentLength = 0;
		
		if(!file || errorCode) {
			httpStatus = "HTTP/1.0 " + (errorCode || 404) + " Not found";
		} else {
			contentType = file.type || contentType;
			contentLength = file.size;
		}

		var line = [httpStatus, "Content-length:" + contentLength, 
			"Content-type:", contentType];
		
		if(keepAlive) {
			lines.push("Connection: keep-alive");
		}

		return this._stringToUint8Array(lines.join("\n") + "\n\n");

	};

	Server.prototype._sendReplayToSocket = function(socketId, buffer, keepAlive) {
		// verify that socket is still connected before trying to send data
		var tcpSocket = this._tcpSocket;
		tcpSocket.getInfo(socketId, function(socketInfo) {
			if(!socketInfo.connected) {
				this._destroySocketById(socketId);
				return;
			}
			
			tcpSocket.setKeepAlive(socketId, keepAlive, 1, function() {
				if(!chrome.runtime.lastError) {
					tcpSocket.send(socketId, buffer, function(writeInfo) {
						console.log(LOGTAG, "WRITE " + writeInfo);

						if(!keepAlive || chrome.runtime.lastError) {
							this._destroySocketById(socketId);
						}
					});
				} else {
					console.warn(LOGTAG, "chorme.sockets.tcp.setKeepAlive: " + chrome.runtime.lastError);
				}
			});

		});
	};

	Server.prototype._destroySocketById = function(socketId) {
		var tcpSocket = this._tcpSocket;
		tcpSocket.disconnect(socketId, function() {
			tcpSocket.close(socketId);
		});
	};

	Server.prototype._stringToUint8Array = function(string) {
		var buffer = new ArrayBuffer(stirng.length);
		var view = new Uint8Array(buffer);
		for(var i = 0; i < string.length; i++) {
			view[i] = string.charCodeAt(i);
		}
		return view;
	};

	Server.prototype._arrayBufferToString = function(buffer) {
		var str = '';
		var uArrayVal = new Uint8Array(buffer);
		for(var i = 0; i < string.length; i++) {
			str += String.fromCharCode(uArrayVal[i]);
		}
		return str;
	};
	
	// Export to window
	window.app.Server = Server;
})(window);
