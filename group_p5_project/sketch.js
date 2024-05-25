const baseWidth = 915;
const baseHeight = 719;

//to ensure the shape scales fits the window.
let scaleFactor;

let shapePoints = [
    {x: 31, y: 524}, {x: 87, y: 452}, {x: 135, y: 450}, {x: 146, y: 399},
    {x: 176, y: 449}, {x: 208, y: 436}, {x: 201, y: 172}, {x: 236, y: 30},
    {x: 272, y: 184}, {x: 286, y: 392}, {x: 297, y: 364}, {x: 311, y: 352},
    {x: 324, y: 309}, {x: 339, y: 348}, {x: 375, y: 382}, {x: 376, y: 428},
    {x: 429, y: 429}, {x: 475, y: 451}, {x: 492, y: 445}, {x: 501, y: 418},
    {x: 509, y: 448}, {x: 556, y: 479}, {x: 553, y: 503}, {x: 596, y: 526},
    {x: 624, y: 515}, {x: 718, y: 560}, {x: 712, y: 594}, {x: 400, y: 603},
    {x: 359, y: 629}, {x: 212, y: 628}, {x: 135, y: 623}, {x: 0, y: 617},
    {x: 0, y: 526}
];

let maxShapeY;
let waterStart;
let waterEnd;

let rows = 5; 
let waveMaxHeight = 20; 

let numSegments = 40;

//We will store the segments in an array
let segments = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    scaleFactor = min(width / baseWidth, height / baseHeight);
    //We can use the width and height of the image to calculate the size of each segment
    let segmentWidth = windowWidth / numSegments;
    let segmentHeight = windowHeight / numSegments;

    //Function to get the maximum y value from shapePoints
    let maxY = -Infinity;
    for (let pt of shapePoints) {
        if (pt.y > maxY) {
            maxY = pt.y;
        }
    }
    maxShapeY = maxY * scaleFactor;
    //Get the waterStart value from 90% of the height of the entire shape
    waterStart = maxShapeY * 0.9;
    //Let the value of waterEnd be at the bottom of the screen
    waterEnd = height;

    for (let segYPos=0; segYPos<windowHeight; segYPos+=segmentHeight) {
        //this is looping over the height
        for (let segXPos=0; segXPos<windowWidth; segXPos+=segmentWidth) {
          //this loops over width
          //This will create a segment for each x and y position
          let segment = new ImageSegment(segXPos,segYPos,segmentWidth,segmentHeight);
          segments.push(segment);
        }
      }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    scaleFactor = min(width / baseWidth, height / baseHeight);
    //Function to get the maximum y value from shapePoints
    let maxY = -Infinity;
    for (let pt of shapePoints) {
        if (pt.y > maxY) {
            maxY = pt.y;
        }
    }
    maxShapeY = maxY * scaleFactor;
    //Get the waterStart value from 90% of the height of the entire shape
    waterStart = maxShapeY * 0.9;
    //Let the value of waterEnd be at the bottom of the screen
    waterEnd = height;
}

function draw() {
    drawBackground();
    drawWater();
    drawReflection();
    drawShape();

    //lets draw the segments to the canvas,
    //we will use a for of loop to loop over the segments array
    for (const segment of segments) {
      segment.draw();
    }
}

//draw the background colours
function drawBackground() {
    for (let i = 0; i < height * 0.5; i++) {
        let inter = map(i, 0, height * 0.5, 0, 1);
        let c = lerpColor(color(135, 206, 235), color(255, 140, 0), inter);
        stroke(c);
        line(0, i, width, i);
    }

    for (let i = height * 0.5; i < height * 0.6; i++) {
        let inter = map(i, height * 0.5, height * 0.6, 0, 1);
        let c = lerpColor(color(255, 140, 0), color(255, 69, 0), inter);
        stroke(c);
        line(0, i, width, i);
    }

    for (let i = height * 0.6; i < height; i++) {
        let inter = map(i, height * 0.6, height, 0, 1);
        let c = lerpColor(color(255, 69, 0), color(70, 130, 180), inter);
        stroke(c);
        line(0, i, width, i);
    }
}


//draw the shape of landmark
function drawShape() {
    stroke(58, 37, 74, 150);
    strokeWeight(8);
    fill(74, 37, 37);
    beginShape();
    for (let pt of shapePoints) {
        let x = pt.x * scaleFactor;
        let y = pt.y * scaleFactor;
        vertex(x, y);
    }
    endShape(CLOSE);
}

//draw the water surface
function drawWater() {
    for (let i = waterStart; i < waterEnd; i++) {
        let inter = map(i, waterStart, waterEnd, 0, 1);
        let c = lerpColor(color(255, 142, 0, 60), color(108, 159, 189, 60), inter);
        stroke(c);
        line(0, i, width, i);
    }
    drawWaves(rows);
}

//function drawWaves uses reference from https://editor.p5js.org/pippinbarr/sketches/bgKTIXoir
function drawWaves(number) {
    // Loop through all our rows and draw each wave
    // We loop "backwards" to draw them one on top of the other nicely
    for (let i = number; i >= 0; i--) {
        drawWave(i, number);
    }
}

function drawWave(n, rows) {
    // Calculate the base y for this wave based on an offset from the bottom of the canvas
    // and subtracting the number of waves to move up. We're dividing the wave height in order to make the waves overlap
    let baseY = waterStart + (waterEnd - waterStart) * (n / rows);
    // We'll start each wave at 0 on the x axis
    let startX = 0;
    push();
    // We'll use the HSB model to vary their color more easily
    colorMode(HSB);
    // Calculate the hue (0 - 360) based on the wave number, mapping it to an HSB hue value
    let hue = map(n, 0, rows, 200, 250);
    fill(hue, 60, 50, 0.5); // Set some transparency
    noStroke();
    // We're using vertex-based drawing
    beginShape();
    // Starting vertex!
    vertex(startX, baseY);
    // Loop along the x axis drawing vertices for each point along the sine function in increments of 10
    for (let x = startX; x <= width; x += 10) {
        // Calculate the wave's y based on the sine function and the baseY
        let y = baseY + sin(x * 0.05) * waveMaxHeight;
        // Draw our vertex
        vertex(x, y);
    }
    // Draw the final three vertices to close the shape around the edges of the canvas
    vertex(width, waterEnd);
    vertex(width, height);
    vertex(0, height);
    // Done!
    endShape(CLOSE);
    pop();
}

//draw the reflection of the shape
function drawReflection() {
    //Find the x-coordinate of the highest point in the drawShape
    let minY = Infinity; 
    for (let pt of shapePoints) {
        if (pt.y < minY) {
            minY = pt.y;
            highestX = pt.x;
        }
    }
    //Draw an ellipse for the reflection
    let diameter = 45 * scaleFactor;
    let spacing = diameter + 5;
    fill(74, 37, 37, 130);
    noStroke();
    let x = highestX * scaleFactor;
    for (let i = 0; i < 7; i++) {
        let y = waterStart + i * spacing + diameter/2;
        ellipse(x, y, diameter * 1.5, diameter);
    }
}

//Here is our class for the image segments, we start with the class keyword
class ImageSegment {
  constructor(srcImgSegXPosInPrm,srcImgSegYPosInPrm,srcImgSegWidthInPrm,srcImgSegHeightInPrm) {
    //these parameters are used to set the internal properties of an instance of the segment
    //These parameters are named as imageSource as they are derived from the image we are using
    this.srcImgSegXPos = srcImgSegXPosInPrm;
    this.srcImgSegYPos = srcImgSegYPosInPrm;
    this.srcImgSegWidth = srcImgSegWidthInPrm;
    this.srcImgSegHeight = srcImgSegHeightInPrm;
  }

  draw() {
    //Let's draw the segment to the canvas, for now we will draw it 
    //as an empty rectangle so we can see it
    noFill();
    stroke(0);
    rect(this.srcImgSegXPos,this.srcImgSegYPos,this.srcImgSegWidth,this.srcImgSegHeight);
  }
}