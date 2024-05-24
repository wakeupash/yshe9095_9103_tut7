function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  let skyColourTop = color(135, 206, 235); 
  let skyColourMiddle = color(255, 140, 0);
  let skycolourBottom = color(255, 69, 0); 
  let waterColour = color(70, 130, 180);    
  
  
  for (let i = 0; i < height * 0.5; i++) {
    let inter = map(i, 0, height * 0.5, 0, 1);
    let c = lerpColor(skyColourTop, skyColourMiddle, inter);
    stroke(c);
    line(0, i, width, i);
  }

  
  for (let i = height * 0.5; i < height * 0.6; i++) {
    let inter = map(i, height * 0.5, height * 0.6, 0, 1);
    let c = lerpColor(skyColourMiddle, skycolourBottom, inter);
    stroke(c);
    line(0, i, width, i);
  }

  //water
  for (let i = height * 0.6; i < height; i++) {
    let inter = map(i, height * 0.6, height, 0, 1);
    let c = lerpColor(skycolourBottom, waterColour, inter);
    stroke(c);
    line(0, i, width, i);
  }
}