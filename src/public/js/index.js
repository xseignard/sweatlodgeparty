(function() {

window.onload = function() {
	var socket = io.connect(location.host);
	var WIDTH = 800;
	var HEIGHT = 400;
	var context = new AudioContext();
	var canvas = document.querySelector('.visualizer');
	canvas.setAttribute('width', WIDTH);
	canvas.setAttribute('height', HEIGHT);
	var canvasCtx = canvas.getContext('2d');
	var analyser, FFT;
	var fftSize = 64;
	var lastPeakDate = new Date();
	var ui = new SLPUI(socket);
	navigator.webkitGetUserMedia({audio:true, video:false},
		function onSuccess(stream) {
			mediaStreamBuffer = context.createMediaStreamSource(stream);
			connectAudioNodes(mediaStreamBuffer, fftSize);
			draw();
		},
		function onError(err) {
			console.log(err);
			console.log('go and get a decent browser!');
		}
	);

	var connectAudioNodes = function(source, fftSize) {
		analyser = context.createAnalyser();
		analyser.fftSize = fftSize || 1024;
		analyser.minDecibels = -90;
		analyser.maxDecibels = -10;
		FFT = new FFTUtils(analyser);
		source.connect(analyser);
		// dont do that unless you like Larsen effect
		//source.connect(context.destination);
	};

	var draw = function() {
		requestAnimationFrame(draw);

		// process fft data and emit it
		FFT.process();
		if ('ude'.indexOf(ui.currentMode) > -1) {
			socket.emit('data', { mode: ui.currentMode, fft: FFT.fftData });
		}
		// convert fft data to percentage
		FFT.toPct();
		// detect peak on bass
		var now = new Date();
		var peakBass = FFT.detectPeak(5, 50, [2, 6]);
		var peakTreble = FFT.detectPeak(7, 50, [7, 12]);
		//var peak = FFT.detectPeak2(0.75, 200, [1, 3]);
		var timeElapsed = now.getTime() - lastPeakDate.getTime();
		if ((peakBass || peakTreble) && timeElapsed > 50 && 'fr'.indexOf(ui.currentMode) > -1) {
			lastPeakDate = now;
			socket.emit('peak', ui.currentMode);
		}
		// get amplitude
		var amplitude = FFT.amplitude();

		// drawing canvas
		canvasCtx.fillStyle = peakBass || peakTreble ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 0)';
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
		canvasCtx.fillStyle = 'rgb(255,0,0)';

		// keep only the 23 first frequencies + general amplitude
		var keeptFreq = 23;
		var barWidth = WIDTH / (keeptFreq + 1);
		var barHeight = 0;
		var x = 0;

		for (var i = 0; i < keeptFreq; i++) {
			canvasCtx.fillRect(x, HEIGHT, barWidth, parseInt(HEIGHT * FFT.fftPct[i]) * -1);
			x += barWidth;
		};
		canvasCtx.fillStyle = 'rgb(0,255,0)';
		canvasCtx.fillRect(x, HEIGHT, barWidth, parseInt(HEIGHT * amplitude) * -1);

	};
}


})();
