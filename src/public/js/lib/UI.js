(function () {

	var UI = function(socket) {
		this.socket = socket;
		this.modes = ['fillUp', 'fillDown', 'expand', 'flash', 'squares', 'tap', 'stop'];
		var self = this;
		this.modes.forEach(function(mode) {
			self.initMode(mode);
		});
		this.brightnesses = ['max', 'mean', 'min'];
		this.brightnesses.forEach(function(brightness) {
			self.initBrightness(brightness);
		});
		this.currentMode = 'd';
		this.taps = [];
		this.tapInterval;

		window.onkeypress = function(evt){
			//console.log(String.fromCharCode(evt.charCode));
			switch (String.fromCharCode(evt.charCode)) {
				case 'u':
				case '4':
					self.setMode('fillUp');
					break;
				case 'd':
				case '6':
					self.setMode('fillDown');
					break;
				case 'e':
				case '5':
					self.setMode('expand');
					break;
				case 'f':
					self.setMode('flash');
					break;
				case 'r':
					self.setMode('squares');
					break;
				case 's':
					self.setMode('stop');
					break;
				case 't':
					self.tapLearning = true;
					// clear taps
					self.taps = [];
					break;
				case '1':
					self.setBrightness('max')
					break;
				case '2':
					self.setBrightness('mean')
					break;
				case '3':
					self.setBrightness('min')
					break;
				case ' ':
					if (self.tapLearning && self.taps.length < 5) {
						self.taps.push(new Date());
						if (self.taps.length === 5) {
							self.tapLearning = false;
							var btn = document.getElementById('tap');
							self.updateBtn(btn);
							self.runTapTempo();
						}
					}
					break;
			}
		}
	};

	UI.prototype.initMode = function(id) {
		var btn = document.getElementById(id);
		var self = this;
		btn.onclick = function() {
			if (id !== 'tap') {
				self.updateBtn(btn);
				document.getElementById('currentTapTempo').innerText = '...';
				// clear interval if not tap tempo mode
				if (self.tapInterval) clearInterval(self.tapInterval);
				if (id === 'stop') self.socket.emit('stop');
			}
			else {
				self.tapLearning = true;
				// clear taps
				self.taps = [];
			}
		}
	};

	UI.prototype.initBrightness = function(id) {
		var btn = document.getElementById(id);
		var self = this;
		btn.onclick = function() {
			btn.className = 'btn btn-success';
			self.brightnesses.forEach(function(mode) {
				if (mode !== id) document.getElementById(mode).className = 'btn btn-primary';
			});
			self.socket.emit('brightness', btn.dataset.cmd);
		}
	};

	UI.prototype.updateBtn = function(btn) {
		btn.className = 'btn btn-success';
		this.modes.forEach(function(mode) {
			if (mode !== btn.id) document.getElementById(mode).className = 'btn btn-primary';
		});
		this.currentMode = btn.dataset.cmd;
		console.log(this.currentMode);
	};

	UI.prototype.setMode = function(id) {
		var btn = document.getElementById(id);
		btn.click();
	};

	UI.prototype.setBrightness = function(id) {
		var btn = document.getElementById(id);
		btn.className = 'btn btn-success';
		this.brightnesses.forEach(function(mode) {
			if (mode !== id) document.getElementById(mode).className = 'btn btn-primary';
		});
		this.socket.emit('brightness', btn.dataset.cmd);
	};

	UI.prototype.runTapTempo = function() {
		if (this.tapInterval) clearInterval(this.tapInterval);
		var prevTap = this.taps[0].getTime();
		var deltaTap = 0;
		for (var i = 1; i < this.taps.length; i++) {
			var currentTap = this.taps[i].getTime();
			deltaTap += currentTap - prevTap;
			prevTap = currentTap;
		};
		deltaTap = deltaTap / (this.taps.length - 1);
		var tempo = Math.round(deltaTap);
		document.getElementById('currentTapTempo').innerText = Math.round(60/(tempo/1000));
		var self = this;
		this.tapInterval = setInterval(function() {
			self.socket.emit('peak', 'f');
		}, tempo);
	};


	window.SLPUI = UI;
})();
