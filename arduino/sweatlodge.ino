#include <SPI.h>
#include <DMD.h>
#include <TimerOne.h>
#include <Ethernet.h>
#include <EthernetUdp.h>

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
int brightness = 255;
char currentMode;

// -----------------------------------------------------------
// Ethernet/UDP stuff
// -----------------------------------------------------------
// one
// byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
// IPAddress ip(192, 168, 2, 2);
// two
// byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xEF };
// IPAddress ip(192, 168, 2, 3);
// three
//byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xFE };
//IPAddress ip(192, 168, 2, 4);
// four
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xFF };
IPAddress ip(192, 168, 2, 5);
unsigned int localPort = 8888;
char packetBuffer[UDP_TX_PACKET_MAX_SIZE];
EthernetUDP Udp;

void setup() {
	Serial.begin(9600);
	// ethernet communication
	Ethernet.begin(mac, ip);
	Udp.begin(localPort);
	// set brightness of the display
	pinMode(9, OUTPUT);
	analogWrite(9, brightness);

	// initialize timer for spi communication
	Timer1.initialize(2000);
	Timer1.attachInterrupt(ScanDMD);
	// flash two time to say setup is ok
	dmd.clearScreen(RED);
	delay(500);
	dmd.clearScreen(BLACK);
	delay(500);
}

void loop() {
	Timer1.detachInterrupt();//noInterrupts();
	int packetSize = Udp.parsePacket();
	Timer1.attachInterrupt(ScanDMD);//interrupts();
	if (packetSize) {
		// clear previous things stored in the buffer
		memset(packetBuffer, 0, sizeof(packetBuffer));
		Udp.read(packetBuffer, UDP_TX_PACKET_MAX_SIZE);
		handlePacket(packetBuffer);
	}
}

void handlePacket(char* text) {
	// fill mode up
	if (text[0] == 'u') {
		if (currentMode != text[0]) reset(text[0]);
		String msg = String(text[1]) + String(text[2]) + String(text[3]);
		int height = msg.toInt();
		height = constrain(height, 0, 32 * DISPLAYS_ACROSS);
		fill(height, true, 1000);
	}
	// fill mode down
	else if (text[0] == 'd') {
		if (currentMode != text[0]) reset(text[0]);
		String msg = String(text[1]) + String(text[2]) + String(text[3]);
		int height = msg.toInt();
		height = constrain(height, 0, 32 * DISPLAYS_ACROSS);
		fill(height, false, 1000);
	}
	// random squares
	else if (text[0] == 'r') {
		if (currentMode != text[0]) reset(text[0]);
		dmd.clearScreen(BLACK);
		randomSquares(random(50, 100), 1, 7, 0);
	}
	// expand mode
	if (text[0] == 'e') {
		if (currentMode != text[0]) reset(text[0]);
		String msg = String(text[1]) + String(text[2]) + String(text[3]);
		int height = msg.toInt();
		height = constrain(height, 0, 32 * DISPLAYS_ACROSS);
		expand(height, 1000);
	}
	// flash
	else if (text[0] == 'f') {
		if (currentMode != text[0]) reset(text[0]);
		flash(50);
	}
	// set a defined brightness
	else if (text[0] == 'b') {
		String msg = String(text[1]) + String(text[2]) + String(text[3]);
		brightness = msg.toInt();
		brightness = constrain(brightness, 0, 255);
	}
	// increase brightness
	else if (text[0] == '+') {
		brightness += 10;
		brightness = constrain(brightness, 0, 255);
	}
	// decrease brightness
	else if (text[0] == '-') {
		brightness -= 10;
		brightness = constrain(brightness, 0, 255);
	}
	// stops the displays
	else if (text[0] == 's') {
		if (currentMode != text[0]) reset(text[0]);
	}
}

void reset(char mode) {
	currentMode = mode;
	dmd.clearScreen(BLACK);
	currentHeight = 0;
}

// -----------------------------------------------------------
// DMD effects
// -----------------------------------------------------------
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

void flash(int milliDelay) {
	dmd.clearScreen(RED);
	delay(milliDelay);
	dmd.clearScreen(BLACK);
}

void ScanDMD() {
	dmd.scanDisplayBySPI();
	analogWrite(9, brightness);
}
