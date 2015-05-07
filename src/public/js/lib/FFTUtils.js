(function() {

	/**
	 * Constructor
	 * @property {Object} analyser - the web audio analyser node
	 */
	var FFTUtils = function(analyser) {
		this.analyser = analyser;
		this.lastPeak = 0;
		this.fftData;
		this.fftPct;
	};

	/**
	 * Process fft data from the analyser
	 */
	FFTUtils.prototype.process = function() {
		this.fftData = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(this.fftData);
	};

	/**
	 * Convert raw fft data to percentages
	 * @property {Object} analyser - the web audio analyser node
	 */
	FFTUtils.prototype.toPct = function() {
		this.fftPct = [];
		for (var i = 0; i < this.fftData.length; i++) {
			this.fftPct[i] = parseInt(this.fftData[i]);
		};
		this.fftPct = this.fftPct.map(function(current) {
			return Number((current / 255).toFixed(2));
		});
		return this.fftPct;
	};

	/**
	 * Compute the amplitude of the given range, from this.fftPct
	 * @property {Array} range - start and end of the range to get the amplitude
	 */
	FFTUtils.prototype.amplitude = function(range) {
		var slicedData = range ? this.fftPct.slice(range[0], range[1]) : this.fftPct;
		var amplitude = slicedData.reduce(function(prev, curr) {
			return prev + curr;
		});
		return (amplitude / slicedData.length).toFixed(2);
	};

	/**
	 * Detect a peak, in the given range
	 * @property {Number} pctDiff - the threshold to chack against for peaks
	 * @property {Array} range - start and end of the range to check for peaks
	 */
	FFTUtils.prototype.detectPeak = function(pctDiff, range) {
		var now = new Date();
		var slicedData = this.fftPct.slice(range[0], range[1]);
		var currentPeak = 0;
		for (var i = 0; i < slicedData.length; i++) {
			currentPeak += slicedData[i];
		}
		currentPeak = currentPeak / slicedData.length;
		if (currentPeak > this.lastPeak * (1+ pctDiff/100)) {
			this.lastPeak = currentPeak;
			return true;
		}
		else {
			this.lastPeak = currentPeak;
			return false;
		}
	};

	FFTUtils.prototype.detectPeak2 = function(threshold, range) {
		var now = new Date();
		var slicedData = this.fftPct.slice(range[0], range[1]);
		var peak = false;
		for (var i = 0; i < slicedData.length; i++) {
			//peak[i] = slicedData[i] >= threshold ? true : false;
			peak = peak || slicedData[i] >= threshold;
		}
		return peak;
	};

	window.FFTUtils = FFTUtils;
})();
