//claim the variables
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
//The maximum y value of shape
let maxShapeY;
//Fixed osition of water surface and bottom
let waterStart;
let waterEnd;
//Num of the wave rows
let rows = 5;
let waveMaxHeight = 20;
// Segment size for the pixelation effect
let segmentSize = 20;

//build a array to store fireworks
let fireworks = [];
let gravity;
//to check if the texture is created
let textureCreated = false;
//graphic buffer for the texture
let textureBuffer;
//firework size and colour
let fireworkSize = 100; 
let fireworkHue = 0; 

function setup() {
    createCanvas(windowWidth, windowHeight);
    //calculate the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    //Function to get the maximum y value from shapePoints
    calculateScaling();
    //create gravity vector for the fireworks
    gravity = createVector(0, 0.15);
    // create a graphics buffer for the texture
    textureBuffer = createGraphics(windowWidth, windowHeight);
    //draw the static elements
    drawStaticElements();
    //stop draw loop until user interaction
    noLoop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    //calculate the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    calculateScaling();
    // recreate the buffer and redraw the texture
    textureBuffer = createGraphics(windowWidth, windowHeight);
    textureCreated = false;
    //draw the static elements
    drawStaticElements();
    //redraw the canvas
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
    waterEnd = height;
}

function drawStaticElements() {
    drawBackground(textureBuffer);
    drawShape(textureBuffer);
    drawWaves(textureBuffer, rows);
    drawReflection(textureBuffer);
    if (!textureCreated) {
        drawTexture(textureBuffer);
        textureCreated = true;
    }
    applyPixelation(textureBuffer);
}

function draw() {
    // Draw the static elements from the buffer
    image(textureBuffer, 0, 0);
    drawFireworks();
}

//lerpColor is from https://p5js.org/reference/#/p5/lerpColor
function drawBackground(pg) {
    pg.colorMode(RGB);
    //draw the sky
    for (let i = 0; i < height * 0.5; i++) {
        let inter = map(i, 0, height * 0.5, 0, 1);
        let c = lerpColor(color(135, 206, 235), color(255, 140, 0), inter);
        pg.stroke(c);
        pg.line(0, i, width, i);
    }

    //draw the transitation
    for (let i = height * 0.5; i < height * 0.6; i++) {
        let inter = map(i, height * 0.5, height * 0.6, 0, 1);
        let c = lerpColor(color(255, 140, 0), color(255, 69, 0), inter);
        pg.stroke(c);
        pg.line(0, i, width, i);
    }

    //draw the water
    for (let i = height * 0.6; i < height; i++) {
        let inter = map(i, height * 0.6, height, 0, 1);
        let c = lerpColor(color(255, 69, 0), color(70, 130, 180), inter);
        pg.stroke(c);
        pg.line(0, i, width, i);
    }
}

//draw the shape of landmark
function drawShape(pg) {
    pg.stroke(58, 37, 74, 150);
    pg.strokeWeight(8);
    pg.fill(74, 37, 37);
    pg.beginShape();
    for (let pt of shapePoints) {
        let x = pt.x * scaleFactor;
        let y = pt.y * scaleFactor;
        pg.vertex(x, y);
    }
    pg.endShape(CLOSE);
}

//Function drawWaves uses the technique from https://editor.p5js.org/pippinbarr/sketches/bgKTIXoir
function drawWaves(pg, number) {
    //Loop through all our rows and draw each wave
    //We loop "backwards" to draw them one on top of the other nicely
    for (let i = number; i >= 0; i--) {
        drawWave(pg, i, number);
    }
}

function drawWave(pg, n, rows) {
    //Calculate the base y for this wave based on an offset from the bottom of the canvas
    //and subtracting the number of waves to move up. We're dividing the wave height in order to make the waves overlap
    let baseY = waterStart + (waterEnd - waterStart) * (n / rows);
    //We'll start each wave at 0 on the x axis
    let startX = 0;
    pg.push();
    // We'll use the HSB model to vary their color more easily
    pg.colorMode(HSB);
    //Calculate the hue (0 - 360) based on the wave number, mapping it to an HSB hue value
    let hue = map(n, 0, rows, 200, 250);
    pg.fill(hue, 60, 50, 0.5);// Set some transparency
    pg.noStroke();
    //We're using vertex-based drawing
    pg.beginShape();
    //Starting vertex!
    pg.vertex(startX, baseY);
    //Loop along the x axis drawing vertices for each point along the sine function in increments of 10
    for (let x = startX; x <= width; x += 10) {
        //Calculate the wave's y based on the sine function and the baseY
        let y = baseY + sin(x * 0.05 * scaleFactor) * waveMaxHeight * scaleFactor;
        //Draw our vertex
        pg.vertex(x, y);
    }
    //Draw the final three vertices to close the shape around the edges of the canvas
    pg.vertex(width, waterEnd);
    pg.vertex(width, height);
    pg.vertex(0, height);
    pg.endShape(CLOSE);
    pg.pop();
}

//Draw the reflection of the shape
function drawReflection(pg) {
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
    pg.fill(74, 37, 37, 150);
    pg.noStroke();
    let x = highestX * scaleFactor;
    for (let i = 0; i < 7; i++) {
        let y = waterStart + i * spacing + diameter * 2;
        pg.ellipse(x, y, diameter * 1.5, diameter);
    }
}

//Draw the texture inside the landmark
function drawTexture(pg) {
    const numLines = 2000;
    const maxLength = 45;
    pg.strokeWeight(1.5);
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
            pg.stroke(c);
            pg.line(x1, y1, x2, y2);
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
function applyPixelation(pg) {
    //Loop through the canvas in steps of segmentSize, both horizontally and vertically
    for (let y = 0; y < height; y += segmentSize) {
        for (let x = 0; x < width; x += segmentSize) {
            //Get the color of the pixel at the center of the current segment
            let c = pg.get(x + segmentSize / 2, y + segmentSize / 2);
            //Set the fill color to the color of the central pixel
            pg.fill(c);
            //Disable the stroke for the rectangle to ensure a solid color fill
            pg.noStroke();
            //Draw a rectangle covering the current segment
            pg.rect(x, y, segmentSize, segmentSize);
        }
    }
}

// create firework and particle classes, use this technology from https://www.youtube.com/watch?v=CKeyIbT3vXI
class Firework {
    constructor(x, y, color) {
      //fireworks colour
        this.hue = color;
        this.firework = new Particle(x, y, this.hue, true);
        //to check if fireworks has exploded
        this.exploded = false;
        //create array to store particles
        this.particles = [];
    }

    done() {
      //to check if fireworks are done
        return this.exploded && this.particles.length === 0;
    }

    update() {
        if (!this.exploded) {
          //apply the gravity for fireworks
            this.firework.applyForce(gravity);
            //update the firework position
            this.firework.update();

            //to check if the firework has reached its peak
            if (this.firework.vel.y >= 0) {
                this.exploded = true;
                //create particles
                this.explode();
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
          //apply the gravity for particles
            this.particles[i].applyForce(gravity);
            //update the particles position
            this.particles[i].update();

            if (this.particles[i].done()) {
                this.particles.splice(i, 1);
            }
        }
    }

    explode() {
        for (let i = 0; i < fireworkSize; i++) {
            let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hue, false);
            //add particles to the array
            this.particles.push(p);
        }
    }

    show() {
        colorMode(HSB);
        if (!this.exploded) {
          //show the fireworks
            this.firework.show();
        }

        for (let i = 0; i < this.particles.length; i++) {
          //show the particles
            this.particles[i].show();
        }
        colorMode(RGB);
    }
}

class Particle {
    constructor(x, y, hue, firework) {
      //particles position
        this.pos = createVector(x, y);
        this.firework = firework;
        //lifespan of particles
        this.lifespan = 255;
        //particles colour
        this.hue = hue;
        if (this.firework) {
            this.vel = createVector(0, random(-12, -8));
        } else {
          //random direction
            this.vel = p5.Vector.random2D();
            //random speed
            this.vel.mult(random(2, 10));
        }
        this.acc = createVector(0, 0);
    }

    applyForce(force) {
      //apply force to the particles
        this.acc.add(force);
    }

    update() {
        if (!this.firework) {
          //reduce speed of particles
            this.vel.mult(0.9);
            //reduce lifespan of particles
            this.lifespan -= 4;
        }
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    done() {
      //to check if particles is done
        return this.lifespan < 0;
    }

    show() {
        colorMode(HSB);
        if (!this.firework) {
            strokeWeight(2);
            stroke(this.hue, 255, 255, this.lifespan);
        } else {
            strokeWeight(4);
            //set up colors
            stroke(this.hue, 255, 255);
        }
        point(this.pos.x, this.pos.y);
        colorMode(RGB);
    }
}

//create a new firework when mouse is pressed
function mousePressed() {
  // create a new firework to the array
    fireworks.push(new Firework(mouseX, mouseY, fireworkHue));
    loop();
}

//draw fireworks
function drawFireworks() {
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();
        if (fireworks[i].done()) {
          //remove the firework if done
            fireworks.splice(i, 1);
        }
    }
    if (fireworks.length === 0) {
        noLoop();
    }
}

//craete a keypressed interaction, to change the colour and size of fireworks
function keyPressed() {
  //increase fireworks size
    if (keyCode === UP_ARROW) {
        fireworkSize = min(600, fireworkSize + 50); 
        //decrease fireworks size
    } else if (keyCode === DOWN_ARROW) {
        fireworkSize = max(10, fireworkSize - 50); 
        //change the fireworks colour
    } else if (keyCode === ENTER) {
        fireworkHue = random(360); 
    }
}
