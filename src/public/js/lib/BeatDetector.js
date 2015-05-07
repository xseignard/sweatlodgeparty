(function() {
	var BeatDetector = function() {};

	BeatDetector.prototype.beats = function(bins, hold) {
		bins = Array.isArray(bins) ? bins : [bins];

		var minthresholds = bins.map(pick('threshold', 0));
		var thresholds = bins.map(pick('threshold', 0));
		var decays = bins.map(pick('decay', 0.005));
		var his = bins.map(roundFn(pick('hi', 255)));
		var los = bins.map(roundFn(pick('lo', 0)));
		var sizes = diff(his, los);
		var binCount = bins.length;
		var times = new Float64Array(binCount);
		var beats = new Uint8Array(binCount);

		hold = hold || 0;

		allNumbers(his, 'All "hi" keys must be numbers');
		allNumbers(los, 'All "lo" keys must be numbers');
		allNumbers(thresholds, 'All "threshold" keys must be numbers');
		allNumbers(decays, 'All "decay" keys must be numbers');

		for (var i = 0; i < decays.length; i += 1) {
			decays[i] = 1 - decays[i];
		}

		return function(data, dt) {
			dt = dt || 1;

			for (var i = 0; i < binCount; i += 1) {
				var scale = 1 / sizes[i];
				var hi = his[i];
				var lo = los[i];
				var volume = 0;

				for (var j = lo; j < hi; j += 1) {
					var current = parseInt(data[j]);
					volume += scale * current;
				}

				times[i] += dt;

				if (times[i] > hold && volume > thresholds[i]) {
					beats[i] = volume;
					times[i] = 0;
					thresholds[i] = volume > minthresholds[i]
						? volume
						: thresholds[i];
				} else {
					beats[i] = 0;
				}

				thresholds[i] *= decays[i];
			}

			return beats;
		}
	};

	var pick = function(key, def) {
		return function(object) {
			return key in object ? object[key] : def;
		}
	};

	var diff = function(a, b) {
		var arr = [];
		for (var i = 0; i < a.length; i += 1) {
			arr[i] = a[i] - b[i];
		}
		return arr;
	};

	var roundFn = function(fn) {
		return function(value) {
			return Math.round(fn(value));
		}
	};

	var allNumbers = function(arr, msg) {
		for (var i = 0; i < arr.length; i += 1) {
			if (typeof arr[i] !== 'number') throw new Error(msg);
		}
		return arr;
	};

	window.BeatDetector = BeatDetector;

})();
