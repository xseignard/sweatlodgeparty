#include <elapsedMillis.h>
#include <SPI.h>
#include <DMD.h>
#include <TimerOne.h>
#include <Arial_Black_16.h>

// -----------------------------------------------------------
// DMD stuff
// USE with https://github.com/xseignard/DMD, not the freetronics one!!
// -----------------------------------------------------------
#define DISPLAYS_ACROSS 5
#define DISPLAYS_DOWN 1
#define DISPLAYS_BPP 1
#define RED 0xFF
#define BLACK 0
DMD dmd(DISPLAYS_ACROSS, DISPLAYS_DOWN, DISPLAYS_BPP);
//DMD dmd(DISPLAYS_ACROSS, DISPLAYS_DOWN);
int currentHeight = 0;
int currentWidth = 0;
int brightness = 30;


elapsedMillis timeElapsed;
unsigned int interval = 100;

void setup() {
	Serial.begin(9600);
	// set brightness of the display
	pinMode(9, OUTPUT);
	analogWrite(9, brightness);

	// initialize timer for spi communication
	Timer1.initialize(2000);
	Timer1.attachInterrupt(ScanDMD);
	// turn off all pixels
	//flash(2);
	dmd.selectFont(Arial_Black_16);
}

void loop() {
	// if (timeElapsed > interval) {
	// 	dmd.clearScreen(BLACK);
	// 	randomSquares(random(50, 100), 1, 7, 0);
	// 	timeElapsed = 0;
	// }
	drawText("eat");
	delay(500);
	drawText("rave");
	delay(500);
	drawText("sleep");
	delay(500);
	drawText("repeat");
	delay(500);
}

// -----------------------------------------------------------
// DMD effects
// -----------------------------------------------------------
void drawText(char* text) {
	int width = strlen(text);
	int offSet = (32*DISPLAYS_ACROSS - width) / 2;
	dmd.drawString(offSet, 2, text, width, BLACK, RED);
}

void fill(int height, boolean up, int microDelay) {
	if (height > currentHeight) {
		for(int i=currentHeight; i<=height; i++){
			addHLine(up);
			delayMicroseconds(microDelay);
		}
	}
	else if (currentHeight > height) {
		for(int i=height; i<=currentHeight; i++){
			removeHLine(up);
			delayMicroseconds(microDelay);
		}
	}
}

void expand(int height, int microDelay) {
	int middle = 32*DISPLAYS_ACROSS / 2;
	height = int(height/2);
	if (height > currentHeight) {
		for(int i=currentHeight; i<=height; i++){
			dmd.drawLine(middle + i, 0, middle + i, 16, RED);
			dmd.drawLine(middle - i, 0, middle - i, 16, RED);
			delayMicroseconds(microDelay);
		}
		currentHeight = height;
	}
	else if (currentHeight > height) {
		for(int i=currentHeight; i>=height; i--){
			dmd.drawLine(middle + i, 0, middle + i, 16, BLACK);
			dmd.drawLine(middle - i, 0, middle - i, 16, BLACK);
			delayMicroseconds(microDelay);
		}
		currentHeight = height;
	}
}

void addHLine(boolean up) {
	if (currentHeight < 32*DISPLAYS_ACROSS) currentHeight++;
	int height;
	if (up) {
		height = currentHeight;
	}
	else {
		height = 32*DISPLAYS_ACROSS - currentHeight;
	}
	dmd.drawLine(height, 0, height, 16, RED);
}

void removeHLine(boolean up) {
	int height;
	if (up) {
		height = currentHeight;
	}
	else {
		height = 32*DISPLAYS_ACROSS - currentHeight;
	}
	dmd.drawLine(height, 0, height, 16, BLACK);
	if (currentHeight > 0) currentHeight--;
}

void addVLine() {
	if (currentWidth < 16) currentWidth++;
	dmd.drawLine(0, 16 - currentWidth, 32*DISPLAYS_ACROSS, 16 - currentWidth, RED);
}

void removeVLine() {
	dmd.drawLine(0, 16 - currentWidth, 32*DISPLAYS_ACROSS, 16 - currentWidth, BLACK);
	if (currentWidth >= 0) currentWidth--;
}

void randomSquare(int size) {
	int x = random(0, 32*DISPLAYS_ACROSS);
	int y = random(0, 16*DISPLAYS_DOWN);
	dmd.drawFilledBox(x, y + size, x + size, y, RED);
}

void randomSquares(int count, int minSize, int maxSize, int delayMs) {
	for(int i=0; i<count; i++){
		randomSquare(random(minSize, maxSize));
		delay(delayMs);
	}
}

void flash(int times) {
	int oldBrightness = brightness;
	brightness = 255;
	for(int i = 0; i < times; i++) {
		dmd.clearScreen(RED);
		delay(500);
		dmd.clearScreen(BLACK);
		delay(500);
	}
	brightness = oldBrightness;
}

void ScanDMD() {
	dmd.scanDisplayBySPI();
	analogWrite(9, brightness);
}
