(function () {

	var UI = function(socket) {
		this.socket = socket;
		this.modes = ['fillUp', 'fillDown', 'expand', 'flash', 'squares'];
		var self = this;
		this.modes.forEach(function(mode) {
			self.initMode(mode);
		});
		this.brightnesses = ['max', 'mean', 'min'];
		this.brightnesses.forEach(function(brightness) {
			self.initBrightness(brightness);
		});
		this.currentMode = 'd';
		window.onkeypress = function(evt){
			console.log(String.fromCharCode(evt.charCode));
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
				case '1':
					self.setBrightness('max')
					break;
				case '2':
					self.setBrightness('mean')
					break;
				case '3':
					self.setBrightness('min')
					break;
			}
		}
	};

	UI.prototype.initMode = function(id) {
		var btn = document.getElementById(id);
		var self = this;
		btn.onclick = function() {
			btn.className = 'btn btn-success';
			self.modes.forEach(function(mode) {
				if (mode !== id) document.getElementById(mode).className = 'btn btn-primary';
			});
			self.currentMode = btn.dataset.cmd;
			console.log(self.currentMode);
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

	UI.prototype.setMode = function(id) {
		var btn = document.getElementById(id);
		btn.className = 'btn btn-success';
		this.modes.forEach(function(mode) {
			if (mode !== id) document.getElementById(mode).className = 'btn btn-primary';
		});
		this.currentMode = btn.dataset.cmd;
		console.log(self.currentMode);
	};

	UI.prototype.setBrightness = function(id) {
		var btn = document.getElementById(id);
		btn.className = 'btn btn-success';
		this.brightnesses.forEach(function(mode) {
			if (mode !== id) document.getElementById(mode).className = 'btn btn-primary';
		});
		this.socket.emit('brightness', btn.dataset.cmd);
	};

	window.SLPUI = UI;
})();
