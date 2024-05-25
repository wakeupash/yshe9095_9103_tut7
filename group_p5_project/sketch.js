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

let numSegments = 50;

//We will store the segments in an array
let segments = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    scaleFactor = min(width / baseWidth, height / baseHeight);
    //Function to get the maximum y value from shapePoints
    let maxY = -Infinity;
    for (let pt of shapePoints) {
        if (pt.y > maxY) {
            maxY = pt.y;
        }
    }
    maxShapeY = maxY * scaleFactor;
    //Get the waterStart value of the beginning of the water surface from 90% of the height of the entire shape
    waterStart = maxShapeY * 0.9;
    waterEnd = height;
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
    //Get the waterStart value of the beginning of the water surface from 90% of the height of the entire shape
    waterStart = maxShapeY * 0.9;
    waterEnd = height;
}

function draw() {
    drawBackground();
    drawWater();
    drawReflection();
    drawShape();
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