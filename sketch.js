let lastClickTime = 0;
let bpm = 120;
let amenSample;
let playing = false;
let ripples = [];
let fft;
let vocalA;
let overlayImg;
let bpmHistory = [];
let direction = 3;         // 1 = right, -1 = left
let rowOffset = 0; 
let numFigures;


function preload() {
  amenSample = loadSound('AmenBreak.wav');
  vocalA = loadSound('reggaevocal.wav');
  overlayImg = loadImage('dubplate3dance.png', img => {
    img.resize(1000, 800); // Resize the illustration so it's not too big
    
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(100);
  fill(0);
  background(255, 0, 0);
  fft = new p5.FFT();
  fft.setInput();
  figureSpacing = overlayImg.width + 20;

}

function keyPressed() {
  let beatInterval = 60000 / bpm;

  if (key.toLowerCase() === 'a') {
    if (vocalA.isLoaded()) {
      if (vocalA.isPlaying()) {
        vocalA.stop();
      }

      let now = millis();
      let timeToNextBeat = beatInterval - (now % beatInterval);

      setTimeout(() => {
        vocalA.setVolume(0.3);
        vocalA.play();
      }, timeToNextBeat);
    } else {
      console.log("vocalA not loaded yet");
    }
  }
}

function draw() {
  background(0, 0, 255);

  // Draw ripples
  for (let i = ripples.length - 1; i >= 0; i--) {
    let r = ripples[i];
    noFill();
    stroke(0, r.alpha);
    strokeWeight(10);
    ellipse(r.x, r.y, r.radius * 2);
    r.radius += 5;
    r.alpha -= 5;
    if (r.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }

  // Draw waveform
  let waveform = fft.waveform();
  noFill();
  stroke(0, 100);
  strokeWeight(10);
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, 0, height);
    vertex(x, y);
  }
  endShape();

  // Show BPM
  fill(0);
  textSize(500);
  textAlign(CENTER, CENTER);
  text(bpm.toFixed(0), width / 2, height / 2);

  // Row of dancing figures
rowOffset += direction * 5;  // Move row left/right
if (rowOffset > width + 100) rowOffset = -100;
if (rowOffset < -100) rowOffset = width + 100;

numFigures = floor(width / 120); // How many fit across screen
let figureSpacing = overlayImg.width + 20;
numFigures = floor(width / figureSpacing);
let rowWidth = numFigures * figureSpacing;
let startX = (width - rowWidth) / 2; // Centered start X
let y = height * 0.4;


let energy = fft.getEnergy("bass"); // Get bass intensity
let scaleFactor = map(energy, 0, 255, 0.9, 1.3);
let rotation = sin(frameCount * 0.05) * 0.2;

for (let i = 0; i < numFigures; i++) {
  let x = startX + rowOffset + i * 120;
  push();
  translate(x % (width + 200), y);
  rotate(rotation);
  scale(scaleFactor);
  imageMode(CENTER);
  image(overlayImg, 0, 0);
  pop();
  
}
}

function mousePressed() {
  let now = millis();
  if (lastClickTime > 0) {
    let interval = now - lastClickTime;
    let newBPM = constrain(60000 / interval, 140, 180); // Adjusted range
    bpmHistory.push(newBPM);

    // Keep only the last 5 BPM values for smoothing
    if (bpmHistory.length > 5) {
      bpmHistory.shift();
    }

    // Smooth BPM
    bpm = bpmHistory.reduce((a, b) => a + b, 0) / bpmHistory.length;

    // Change rate without restarting the sample
    let rate = map(bpm, 140, 180, 1.0, 1.3);
    rate = constrain(rate, 0.5, 2);
    amenSample.rate(rate);

    if (!playing) {
      amenSample.loop();
      playing = true;
    }
    direction *= -1;
    ripples.push({ x: mouseX, y: mouseY, radius: 0, alpha: 255 });
  }
  lastClickTime = now;
}