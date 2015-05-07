var dgram = require('dgram'),
	express = require('express'),
	app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server);


var canSend = true;

server.listen(3000);
app.use(express.static(__dirname + '/public/'));

io.on('connection', function (socket) {
	sendAll('b030');
	socket.on('data', function (data) {
		if (canSend) {
			canSend = false;
			var mode = data.mode;
			console.log(data.mode);
			var fft = data.fft;
			var i = 0;
			for (var ip = first; ip <= last; ip++) {
				var height = parseInt(fft[i]);
				var min = 100;
				if (height < min) height = min;
				height = parseInt(map(height, min, 255, 0, 160));
				//console.log(height);
				i++;
				send(mode + height, host + ip);
			}

			setTimeout(function() {
				canSend = true;
			}, 16);
		}
	});
	socket.on('peak', function (mode) {
		sendAll(mode);
	});
	socket.on('brightness', function(cmd) {
		sendAll(cmd);
	});
});

// arduinos IP/PORT
var host = '192.168.2.';
var first = 2;
var last = 3;
var port = 8888;

// app receiving messages
var client = dgram.createSocket('udp4');

// start listening for incoming messages
client.on('listening', function() {
	console.log('listening');
	sendAll('b030');
});
client.bind(3333, '192.168.2.6');

// send data to one ip
var send = function(data, ip) {
	var message = new Buffer(data, 'binary');
	client.send(message, 0, message.length, port, ip);
};

// send data to all ip
var sendAll = function(data) {
	for (var ip = first; ip <= last; ip++) {
		send(data, host + ip);
	}
};

var map = function (value, istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
};


// shutdown hook
var cleanup = function () {
	console.log('Closing app...');
	canSend = false;
	sendAll('s');
	setTimeout(function() {
		process.exit();
	}, 500);
};
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
