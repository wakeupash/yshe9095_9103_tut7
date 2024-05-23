
function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);
  drawCity();
}

function drawCity(){
  fill(0);
  rect(windowWidth * 0.2, windowHeight * 0.2, 80, 400);
}