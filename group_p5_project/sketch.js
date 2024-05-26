const baseWidth = 915;
const baseHeight = 719;

//to ensure the shape scales fits the window.
let scaleFactor;

//key points of the shape
let shapePoints = [
    {x: 31, y: 524}, {x: 87, y: 452}, {x: 135, y: 450}, {x: 146, y: 399},
    {x: 176, y: 449}, {x: 208, y: 436}, {x: 201, y: 172}, {x: 236, y: 30},
    {x: 272, y: 184}, {x: 286, y: 392}, {x: 297, y: 364}, {x: 311, y: 352},
    {x: 324, y: 309}, {x: 339, y: 348}, {x: 375, y: 382}, {x: 376, y: 428},
    {x: 429, y: 429}, {x: 475, y: 451}, {x: 492, y: 445}, {x: 501, y: 418},
    {x: 509, y: 448}, {x: 556, y: 479}, {x: 553, y: 503}, {x: 596, y: 526},
    {x: 624, y: 515}, {x: 718, y: 550}, {x: 712, y: 584}, {x: 400, y: 603},
    {x: 359, y: 609}, {x: 212, y: 608}, {x: 135, y: 603}, {x: 0, y: 603},
    {x: 0, y: 526}
];

let maxShapeY;
let waterStart;
let waterEnd;

let rows = 5; 
let waveMaxHeight = 20; 

let segmentSize = 20; // Segment size for the pixelation effect
/*
let numSegments = 40;

//We will store the segments in an array
let segments = [];
*/

function setup() {
    createCanvas(windowWidth, windowHeight);
    //calculate the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    /*
    //We can use the width and height of the image to calculate the size of each segment
    let segmentWidth = windowWidth / numSegments;
    let segmentHeight = windowHeight / numSegments;
    */
    //Function to get the maximum y value from shapePoints
    calculateScaling();
    noLoop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    //calculate the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    calculateScaling();
    redraw();
}

function calculateScaling() {
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
    drawTexture();
    /*
    //lets draw the segments to the canvas,
    //we will use a for of loop to loop over the segments array
    for (const segment of segments) {
      segment.draw();
    }
    */
    applyPixelation();
}

function drawBackground() {
    //draw the sky
    for (let i = 0; i < height * 0.5; i++) {
        let inter = map(i, 0, height * 0.5, 0, 1);
        let c = lerpColor(color(135, 206, 235), color(255, 140, 0), inter);
        stroke(c);
        line(0, i, width, i);
    }

    //draw the transitation
    for (let i = height * 0.5; i < height * 0.6; i++) {
        let inter = map(i, height * 0.5, height * 0.6, 0, 1);
        let c = lerpColor(color(255, 140, 0), color(255, 69, 0), inter);
        stroke(c);
        line(0, i, width, i);
    }

    //draw the water
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
        let y = baseY + sin(x * 0.05 * scaleFactor) * waveMaxHeight * scaleFactor;
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
    let highestX;
    for (let pt of shapePoints) {
        if (pt.y < minY) {
            minY = pt.y;
            highestX = pt.x;
        }
    }
    //Draw an ellipse for the reflection
    let diameter = 45 * scaleFactor;
    let spacing = diameter + 1;
    fill(74, 37, 37, 150);
    noStroke();
    let x = highestX * scaleFactor;
    for (let i = 0; i < 7; i++) {
        let y = waterStart + i * spacing + diameter*2;
        ellipse(x, y, diameter * 1.5, diameter);
    }
}

//draw the texture inside the landmark
function drawTexture() {
    const numLines = 2000; 
    const maxLength = 45; 
    strokeWeight(1.5);
    for (let i = 0; i < numLines; i++) {
        let x1 = random(0, baseWidth) * scaleFactor;
        let y1 = random(0, maxShapeY);
        //make the random angle
        let angle = random(TWO_PI); 
        //make the random length
        let length = random(10, maxLength); 
        let x2 = x1 + cos(angle) * length;
        let y2 = y1 + sin(angle) * length;
        if (isInsideShape(x1, y1) && isInsideShape(x2, y2)) {
            let c = lerpColor(color(59, 64, 63), color(56, 21, 22), random(1));
            stroke(c);
            line(x1, y1, x2, y2);
        }
    }
}

//make sure the lines created is inside the shape
function isInsideShape(x, y) {
    let isInside = false;
    let j = shapePoints.length - 1;
    for (let i = 0; i < shapePoints.length; i++) {
        let xi = shapePoints[i].x * scaleFactor;
        let yi = shapePoints[i].y * scaleFactor;
        let xj = shapePoints[j].x * scaleFactor;
        let yj = shapePoints[j].y * scaleFactor;
        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
        j = i;
    }
    //to check if the point is inside the shape
    return isInside;
}

//make pixel
function applyPixelation() {
    // Loop through the canvas in steps of segmentSize, both horizontally and vertically
    for (let y = 0; y < height; y += segmentSize) {
        for (let x = 0; x < width; x += segmentSize) {
            // Get the color of the pixel at the center of the current segment
            let c = get(x + segmentSize / 2, y + segmentSize / 2);
            
            // Set the fill color to the color of the central pixel
            fill(c);
            
            // Disable the stroke for the rectangle to ensure a solid color fill
            noStroke();
            
            // Draw a rectangle covering the current segment
            // The rectangle starts at (x, y) and has a width and height of segmentSize
            rect(x, y, segmentSize, segmentSize);
        }
    }
}


/*
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
*/