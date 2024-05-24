let img;

function preload() {
    img = loadImage('assets/artwork.jpg'); 
}

function setup() {
    createCanvas(windowWidth, img.height);
    let scale = windowWidth / img.width;
    img.resize(windowWidth, img.height * scale); 
    image(img, 0, 0);
}

function mouseClicked() {
  print(`{x: ${mouseX}, y: ${mouseY}},`);
}