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

let maxShapeY;
let waterStart;
let waterEnd;
let rows = 5;
let waveMaxHeight = 20;
// Segment size for the pixelation effect
let segmentSize = 20;

let fireworks = [];
let gravity;
let textureCreated = false;
let textureBuffer;

function setup() {
    createCanvas(windowWidth, windowHeight);
    //calculate the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    //Function to get the maximum y value from shapePoints
    calculateScaling();
    gravity = createVector(0, 0.2);
    
    // create a graphics buffer for the texture
    textureBuffer = createGraphics(windowWidth, windowHeight);
    drawStaticElements();
    noLoop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    //calculate the scale factor
    scaleFactor = min(width / baseWidth, height / baseHeight);
    calculateScaling();
    
    //recreate the  buffer and redraw the texture
    textureBuffer = createGraphics(windowWidth, windowHeight);
    textureCreated = false;
    drawStaticElements();
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
}

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

function drawWaves(pg, number) {
    for (let i = number; i >= 0; i--) {
        drawWave(pg, i, number);
    }
}

function drawWave(pg, n, rows) {
    let baseY = waterStart + (waterEnd - waterStart) * (n / rows);
    let startX = 0;
    pg.push();
    pg.colorMode(HSB);
    let hue = map(n, 0, rows, 200, 250);
    pg.fill(hue, 60, 50, 0.5);
    pg.noStroke();
    pg.beginShape();
    pg.vertex(startX, baseY);
    for (let x = startX; x <= width; x += 10) {
        let y = baseY + sin(x * 0.05 * scaleFactor) * waveMaxHeight * scaleFactor;
        pg.vertex(x, y);
    }
    pg.vertex(width, waterEnd);
    pg.vertex(width, height);
    pg.vertex(0, height);
    pg.endShape(CLOSE);
    pg.pop();
}

function drawReflection(pg) {
    let minY = Infinity;
    let highestX;
    for (let pt of shapePoints) {
        if (pt.y < minY) {
            minY = pt.y;
            highestX = pt.x;
        }
    }
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

function drawTexture(pg) {
    const numLines = 2000;
    const maxLength = 45;
    pg.strokeWeight(1.5);
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
            pg.stroke(c);
            pg.line(x1, y1, x2, y2);
        }
    }
}

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
    return isInside;
}

//make pixel
function applyPixelation(pg) {
    // Loop through the canvas in steps of segmentSize, both horizontally and vertically
    for (let y = 0; y < height; y += segmentSize) {
        for (let x = 0; x < width; x += segmentSize) {
    // Get the color of the pixel at the center of the current segment          
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
