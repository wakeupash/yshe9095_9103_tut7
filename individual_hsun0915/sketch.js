//Claim the variables
const baseWidth = 915;
const baseHeight = 719;

//To ensure the shape scales fits the window.
let scaleFactor;

//Key points of the shape
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
//The maximum y value of shape
let maxShapeY;
//Fixed osition of water surface and bottom
let waterStart;
let waterEnd;
//Num of the wave rows
let rows = 5; 
let waveMaxHeight = 20; 
//Segment size for the pixelation effect
let segmentSize = 20; 

let stars = [];
let startNums=10;
let showStar = true; // is show star
let brightness = 255; // color
let blinkInterval = 1500; // Flicker interval  
let lastBlinkTime = 0; // Last flashing time
let stepInterval = 1000;

let colors = [];   //Cloud's array
let cloudx = 100;  //Cloud X-coordinate 
let cloudy = 100;  //Cloud Y-coordinate

let centerX, centerY, a, b, angle = 0; // Elliptical center and half axis 
let angleSpeed = 0.02; // Angle change speed  

const PI = Math.PI;  
const  TWO_PI = PI * 2;  

function setup() {
    createCanvas(windowWidth, windowHeight);
    //Calculate the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    //Function to get the maximum y value from shapePoints
    calculateScaling();
    // noLoop();
    lastBlinkTime=Date.now(); 
    initDraw();
    intiStars();

    // Elliptical center
    centerX = windowWidth / 2;  
    centerY = height / 2;  
    a = Math.min(windowWidth, windowHeight)  * 0.8; // The long half axis is 0.8 times that of the shorter side of the canvas
    b = a * 0.6; // The short half axis is 0.7 times the long half axis
    // setInterval(autoStar, stepInterval);
}

function initDraw() {
    drawBackground();
    drawShape();
    drawWaves(rows);
    drawReflection();
    drawTexture();
    applyPixelation();
}
//Initialize stars
function intiStars() {
    //How many stars are created based on the number of startNums
    for(i=0;i<startNums;i++){
        //Set the coordinates of stars
        let w= random(width/8,width-100);
        let h=random(height/8,height/15);
        let singleStar=new  Star(w, h,6, 10,5);
        //Save star objects in an array
        stars.push(singleStar);
    }
}

//Control the twinkling of stars based on time
function autoStar() {
    let now = Date.now();
    //Time judgment
    if (now - lastBlinkTime > blinkInterval) {
        showStar = !showStar; // Switch display status
        lastBlinkTime = now; // Update the last flashing time
    }
    //loop all star
    for (i = 0; i < startNums; i++) {
        //call drawStar method
        stars[i].drawStar(showStar ? 255 : random(200, 230));   
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    //Calculate the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    calculateScaling();
    redraw();
}

function calculateScaling() {
    //Function to get the maximum y value from shapePoints, 
    //use this technique from https://stackoverflow.com/questions/63236065/can-i-use-infinity-and-infinity-as-an-initial-value-for-max-and-min-variables
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
    waterEnd = height * scaleFactor;
}

function draw() {
    initDraw();
    autoStar();
    drawClound();
    drawSun();  
}
//function: draw clound
function drawClound() {
     //Initialize Cloud
     makeCloud(cloudx, cloudy - 50);
     makeCloud(cloudx + 100, cloudy + 100)
     //Cloud X-coordinate change
     cloudx += 2.1;
     //If the cloud exceeds the screen width, the position returns to the left
     if (cloudx >width) {
         cloudx = 10;
     }
}

// Draw a sun rising from the east and setting from the west
function drawSun() {  
    // count x y 
    if (angle >= 0 && angle <= Math.PI) {  
      //move the position of the sun
      let xaxis = centerX - a * Math.cos(angle);  
      let yaxis = centerY - b * Math.sin(angle); 
      // draw sun 
      stroke(255, 0, 0);  
      strokeWeight(50);  
      noFill();  
      ellipse(xaxis, yaxis, 50, 50); 
    }       
    // update angle
    angle += angleSpeed;  
    //After the sun sets, move the position back to the east 
    if (angle > Math.PI) {
      angle = 0;  
    }  
  }  


function drawBackground() {
    //Draw the sky, lerpColor is from https://p5js.org/reference/#/p5/lerpColor
    for (let i = 0; i < height * 0.5; i++) {
        let inter = map(i, 0, height * 0.5, 0, 1);
        let c = lerpColor(color(135, 206, 235), color(255, 140, 0), inter);
        stroke(c);
        line(0, i, width, i);
    }

    //Draw the transitation
    for (let i = height * 0.5; i < height * 0.6; i++) {
        let inter = map(i, height * 0.5, height * 0.6, 0, 1);
        let c = lerpColor(color(255, 140, 0), color(255, 69, 0), inter);
        stroke(c);
        // console.log("=="+parseInt(i));
        colors[parseInt(i)]=c;
        line(0, i, width, i);
    }

    //Draw the water
    for (let i = height * 0.6; i < height; i++) {
        let inter = map(i, height * 0.6, height, 0, 1);
        let c = lerpColor(color(255, 69, 0), color(70, 130, 180), inter);
        stroke(c);
        line(0, i, width, i);
    }
}


//Draw the shape of landmark
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


//Function drawWaves uses the technique from https://editor.p5js.org/pippinbarr/sketches/bgKTIXoir
function drawWaves(number) {
    //Loop through all our rows and draw each wave
    //We loop "backwards" to draw them one on top of the other nicely
    for (let i = number; i >= 0; i--) {
        drawWave(i, number);
    }
}

function drawWave(n, rows) {
    //Calculate the base y for this wave based on an offset from the bottom of the canvas
    //and subtracting the number of waves to move up. We're dividing the wave height in order to make the waves overlap
    let baseY = waterStart + (waterEnd - waterStart) * (n / rows);
    //We'll start each wave at 0 on the x axis
    let startX = 0;
    push();
    // We'll use the HSB model to vary their color more easily
    colorMode(HSB);
    //Calculate the hue (0 - 360) based on the wave number, mapping it to an HSB hue value
    let hue = map(n, 0, rows, 200, 250);
    fill(hue, 60, 50, 0.5); // Set some transparency
    noStroke();
    //We're using vertex-based drawing
    beginShape();
    //Starting vertex!
    vertex(startX, baseY);
    //Loop along the x axis drawing vertices for each point along the sine function in increments of 10
    for (let x = startX; x <= width; x += 10) {
        //Calculate the wave's y based on the sine function and the baseY
        let y = baseY + sin(x * 0.05 * scaleFactor) * waveMaxHeight * scaleFactor;
        //Draw our vertex
        vertex(x, y);
    }
    //Draw the final three vertices to close the shape around the edges of the canvas
    vertex(width, waterEnd);
    vertex(width, height);
    vertex(0, height);
    //Done!
    endShape(CLOSE);
    pop();
}

//Draw the reflection of the shape
function drawReflection() {
    //Find the x-coordinate of the highest point in the drawShape, 
    //use this technique from https://stackoverflow.com/questions/63236065/can-i-use-infinity-and-infinity-as-an-initial-value-for-max-and-min-variables
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

//Draw the texture inside the landmark
function drawTexture() {
    const numLines = 2000; 
    const maxLength = 45; 
    strokeWeight(1.5);
    for (let i = 0; i < numLines; i++) {
        let x1 = random(0, baseWidth) * scaleFactor;
        let y1 = random(0, maxShapeY);
        //Make the random angle
        let angle = random(TWO_PI); 
        //Make the random length
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

//Make sure the lines created is inside the shape, use this technique from https://www.geeksforgeeks.org/how-to-check-if-a-given-point-lies-inside-a-polygon/
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
    //To check if the point is inside the shape
    return isInside;
}

//Create a pixel style
function applyPixelation() {
    //Loop through the canvas in steps of segmentSize, both horizontally and vertically
    for (let y = 0; y < height; y += segmentSize) {
        for (let x = 0; x < width; x += segmentSize) {
            //Get the color of the pixel at the center of the current segment
            let c = get(x + segmentSize / 2, y + segmentSize / 2);
            //Set the fill color to the color of the central pixel
            fill(c);
            //Disable the stroke for the rectangle to ensure a solid color fill
            noStroke();
            //Draw a rectangle covering the current segment
            rect(x, y, segmentSize, segmentSize);
        }
    }
}
// Listen for mouse click events
function mouseClicked() {  
    //Redraw Background
    initDraw();
    for (let obj of stars) {  
      // Check if the mouse has clicked on the star  
      if (dist(mouseX, mouseY, obj.x, obj.y) < obj.outRadius) {  
        // Realize scattering effect on stars
        obj.outRadius *= 1.5;
        obj.x += (random() - 0.5) * 80; // Randomly change position
        obj.y += (random() - 0.5) * 100;  
      }  
    }  
  } 

//use this technique from https://editor.p5js.org/mena-landry/sketches/D7ql4Nd3V
function makeCloud(cloudx, cloudy) {
    fill(192)
    noStroke();
    //Draw the shape of clouds
    ellipse(cloudx, cloudy, 70, 50);
    ellipse(cloudx + 10, cloudy + 10, 70, 50);
    ellipse(cloudx - 20, cloudy + 10, 70, 50);
}

//star class 
class Star{
    constructor(x, y, outRadius, innerRadius,starpoints) {
        this.x=x;  //Star X-axis
        this.y=y;  //Star Y-axis
        this.starpoints=starpoints;  //How many point do stars have
        this.outRadius=outRadius;    //The outer radius of stars
        this.innerRadius=innerRadius; //The inner radius of stars
    }
    //Method for drawing stars, parameter C represents color
    drawStar(c) {
        let angle = TWO_PI / this.starpoints;
        let halfAngle = angle/2.0;
        beginShape();
        // set color
        fill(c); 
        //drawing stars
        for (let i = 0; i < TWO_PI; i+=angle) {
          let xPosition = this.x + cos(i) * this.outRadius;
          let yPosition = this.y + sin(i) * this.outRadius;
          vertex(xPosition, yPosition);
       
          xPosition = this.x + cos(halfAngle) * this.innerRadius;
          yPosition = this.y + sin(halfAngle) * this.innerRadius;
          vertex(xPosition, yPosition);
       
          halfAngle += angle;
        }
        endShape(CLOSE);
      }
}