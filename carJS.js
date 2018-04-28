window.addEventListener('load', init);
var ctx, canvas
var width, height

// Faire des trainées comme avec canvastest : ctx.fillStyle = 'rgba(255, 165, 0, 1)';


function init(){
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"

  initGame()
  loop()
}

function loop(){ // Voir l'ordre des fonctions
  moveCars()
  checkCollisions()
  calculateInputs()
  decisionsIA()

  dessin()
  requestAnimationFrame(loop);
}

function initGame(){
  for(i=0; i<jeu.nbCaseX; i++){
    jeu.map[i] = []
    for(j=0; j<jeu.nbCaseY; j++){
      jeu.map[i][j] = 0 // sol
    }
  }
}

function initCars(){
  for(i=0; i<jeu.nbCars; i++){
    jeu.listCar[i] = new Car()
  }
}

var jeu = {
  map: [],
  listCar: [],
  nbCars: 2000,
  positionX: 50,
  positionY: 50,
  widthCase: 18, // pair : %2 == 0
  xStart: 200,
  yStart: 200,
  nbCaseX: 100, // largeur
  nbCaseY: 50,  // heuteur
  typeMap: 0, // Le type de map qu'on pose, incrémenté avec "espace" event
  maxSpeed: 15,
  minSpeed: 0,
}

var savedBrain = {
  brain: []
}
function saveBrain(car){
  for(i=0; i<4; i++){
      savedBrain.brain[i] = car.brain[i]
  }
}

Car = function(similarBrain){
  this.color = getRandomColor()
  this.size = jeu.widthCase/2

  this.x = jeu.xStart
  this.y = jeu.yStart
  this.orientation =  Math.random()*360 // -180 +180 ?

  this.speed = 0

  this.travelledDST = 0 // <=> fitness

  this.frontDST = 0 // 5 inputs
  this.leftDST = 0
  this.leftQuarterDST = 0
  this.rightDST = 0
  this.rightQuarterDST = 0

  this.brain = []
  if(arguments.length == 0){
    for(a=0; a<4; a++){
      this.brain[a] = new Brain()
    }
  }
  else if(arguments.length == 1){
    for(a=0; a<4; a++){
      this.brain[a] = new Brain(a)
    }
  }
}

Brain = function(iBrain){
  if(arguments.length == 0){
    this.w1 = -1 + Math.random()*2
    this.w2 = -1 + Math.random()*2
    this.w3 = -1 + Math.random()*2
    this.w4 = -1 + Math.random()*2
    this.w5 = -1 + Math.random()*2
    // ajouter wBias
  }
  else if(arguments.length == 1){
    this.w1 = savedBrain.brain[iBrain].w1 + (-1 + Math.random()*2)/10
    this.w2 = savedBrain.brain[iBrain].w2 + (-1 + Math.random()*2)/10
    this.w3 = savedBrain.brain[iBrain].w3 + (-1 + Math.random()*2)/10
    this.w4 = savedBrain.brain[iBrain].w4 + (-1 + Math.random()*2)/10
    this.w5 = savedBrain.brain[iBrain].w5 + (-1 + Math.random()*2)/10
  }
}

function useBrain(car, brain){
  let i1 = car.frontDST / 1800 // val : from 0 to 1800 (18*100 = jeu.nbcasewidth * widthcase  )
  let i2 = car.leftDST / 1800
  let i3 = car.leftQuarterDST / 1800 // nb : faire un pythagore car diagonale 1800 + 900 sqrt..
  let i4 = car.rightDST / 1800
  let i5 = car.rightQuarterDST / 1800

  let bias = 1 // A voir
  return i1*brain.w1 + i2*brain.w2 + i3*brain.w3 +
          i4*brain.w4 + i5*brain.w5
}
function nextGen(){
  console.log("ah")
}
function decisionsIA(){
  for(i=0; i<jeu.listCar.length; i++){
    // Brain 1 accelerate decision
    if(useBrain(jeu.listCar[i], jeu.listCar[i].brain[0]) > 0){
      jeu.listCar[i].speed += 0.1
      if(jeu.listCar[i].speed > jeu.maxSpeed){
        jeu.listCar[i].speed = jeu.maxSpeed
      }
    }
    // Brain 2 decelerate decision
    // jeu.listCar[i].speed -= 0.05
    // if(jeu.listCar[i].speed < 0){
    //   jeu.listCar[i].speed = 0
    // }
    if(useBrain(jeu.listCar[i], jeu.listCar[i].brain[1]) > 0){
      jeu.listCar[i].speed -= 0.1
      if(jeu.listCar[i].speed < jeu.minSpeed){
        jeu.listCar[i].speed = jeu.minSpeed
      }
    }
    // Brain 3 turn right decision
    if(useBrain(jeu.listCar[i], jeu.listCar[i].brain[2]) > 0){
      jeu.listCar[i].orientation += 3
    }
    // Brain 4 turn left  decision
    if(useBrain(jeu.listCar[i], jeu.listCar[i].brain[3]) > 0){
      jeu.listCar[i].orientation -= 3
    }
  }
}

function calculateInputs(){
  for(i=0; i<jeu.listCar.length; i++){
    let orientation = jeu.listCar[i].orientation
    let dstToObstacle = 0
    let foundObstacle = false
    let x = jeu.listCar[i].x
    let y = jeu.listCar[i].y
    let caseX = 0
    let caseY = 0
    // 0° in front of the car
    while(!foundObstacle){
      dstToObstacle++
      caseX = Math.floor((x-jeu.positionX)/jeu.widthCase)
      caseY = Math.floor((y-jeu.positionY)/jeu.widthCase)
      if(jeu.map[caseX][caseY] == 0){
        foundObstacle = true
      }
      else{
        x += Math.cos((orientation)*Math.PI/180)
        y += Math.sin((orientation)*Math.PI/180)
      }
    }
    // console.log("0 degrees in front of you : " + dstToObstacle)
    jeu.listCar[i].frontDST = dstToObstacle
    dstToObstacle = 0 // Reinitialisation
    foundObstacle = false
    x = jeu.listCar[i].x
    y = jeu.listCar[i].y
    // 90° on the right
    while(!foundObstacle){
      dstToObstacle++
      caseX = Math.floor((x-jeu.positionX)/jeu.widthCase)
      caseY = Math.floor((y-jeu.positionY)/jeu.widthCase)
      if(jeu.map[caseX][caseY] == 0){
        foundObstacle = true
      }
      else{
        x += Math.cos((orientation+90)*Math.PI/180)
        y += Math.sin((orientation+90)*Math.PI/180)
      }
    }
    // console.log("90 degrees right : " + dstToObstacle)
    jeu.listCar[i].rightDST = dstToObstacle
    dstToObstacle = 0 // Reinitialisation
    foundObstacle = false
    x = jeu.listCar[i].x
    y = jeu.listCar[i].y

    // 90° on the left
    while(!foundObstacle){
      dstToObstacle++
      caseX = Math.floor((x-jeu.positionX)/jeu.widthCase)
      caseY = Math.floor((y-jeu.positionY)/jeu.widthCase)
      if(jeu.map[caseX][caseY] == 0){
        foundObstacle = true
      }
      else{
        x += Math.cos((orientation-90)*Math.PI/180)
        y += Math.sin((orientation-90)*Math.PI/180)
      }
    }
    // console.log("90 degrees left : " + dstToObstacle)
    jeu.listCar[i].leftDST = dstToObstacle
    dstToObstacle = 0 // Reinitialisation
    foundObstacle = false
    x = jeu.listCar[i].x
    y = jeu.listCar[i].y
    // 45° on the right
    while(!foundObstacle){
      dstToObstacle++
      caseX = Math.floor((x-jeu.positionX)/jeu.widthCase)
      caseY = Math.floor((y-jeu.positionY)/jeu.widthCase)
      if(jeu.map[caseX][caseY] == 0){
        foundObstacle = true
      }
      else{
        x += Math.cos((orientation+45)*Math.PI/180)
        y += Math.sin((orientation+45)*Math.PI/180)
      }
    }
    // console.log("45 degrees right : " + dstToObstacle)
    jeu.listCar[i].rightQuarterDST = dstToObstacle
    dstToObstacle = 0 // Reinitialisation
    foundObstacle = false
    x = jeu.listCar[i].x
    y = jeu.listCar[i].y
    //45° on the left
    while(!foundObstacle){
      dstToObstacle++
      caseX = Math.floor((x-jeu.positionX)/jeu.widthCase)
      caseY = Math.floor((y-jeu.positionY)/jeu.widthCase)
      if(jeu.map[caseX][caseY] == 0){
        foundObstacle = true
      }
      else{
        x += Math.cos((orientation-45)*Math.PI/180)
        y += Math.sin((orientation-45)*Math.PI/180)
      }
    }
    // console.log("45 degrees left : " + dstToObstacle)
    jeu.listCar[i].leftQuarterDST = dstToObstacle
    dstToObstacle = 0 // Reinitialisation
    foundObstacle = false
    x = jeu.listCar[i].x
    y = jeu.listCar[i].y
  }

  // console.log(jeu.listCar[i].frontDST)
  // console.log(jeu.listCar[i].rightDST)
  // console.log(jeu.listCar[i].leftDST)
  // console.log(jeu.listCar[i].rightQuarterDST)
  // console.log(jeu.listCar[i].leftQuarterDST)
}

function moveCars(){
  for(i=0; i<jeu.listCar.length; i++){
    let plusX = Math.cos(jeu.listCar[i].orientation*Math.PI/180) * jeu.listCar[i].speed
    let plusY = Math.sin(jeu.listCar[i].orientation*Math.PI/180) * jeu.listCar[i].speed
    jeu.listCar[i].x += plusX
    jeu.listCar[i].y += plusY
    jeu.listCar[i].travelledDST += Math.abs(plusX)
    jeu.listCar[i].travelledDST += Math.abs(plusY)
  }
}

function checkCollisions(){
  for(i=0; i<jeu.listCar.length; i++){ // Revoir éventuellement les diagonales pour affiner la collision, peut utile vu la courbure de petits cercles
    let car = jeu.listCar[i]
    let toRemove = false

    let caseX = Math.floor((car.x-jeu.positionX+(jeu.widthCase/2))/jeu.widthCase)
    let caseY = Math.floor((car.y-jeu.positionY)/jeu.widthCase)
    if(jeu.map[caseX][caseY] == 0){toRemove = true}
    caseX = Math.floor((car.x-jeu.positionX+-(jeu.widthCase/2))/jeu.widthCase)
    caseY = Math.floor((car.y-jeu.positionY)/jeu.widthCase)
    if(jeu.map[caseX][caseY] == 0){toRemove = true}
    caseX = Math.floor((car.x-jeu.positionX)/jeu.widthCase)
    caseY = Math.floor((car.y-jeu.positionY+(jeu.widthCase/2))/jeu.widthCase)
    if(jeu.map[caseX][caseY] == 0){toRemove = true}
    caseX = Math.floor((car.x-jeu.positionX)/jeu.widthCase)
    caseY = Math.floor((car.y-jeu.positionY-(jeu.widthCase/2))/jeu.widthCase)
    if(jeu.map[caseX][caseY] == 0){toRemove = true}

    if(toRemove == true){
      jeu.listCar.splice(i,1)
    }
  }
}


/////////////////////////////
// CREATION DE MAP + DESSINER
/////////////////////////////

var mouseDown = false
document.onmousemove = function(e){
  if(mouseDown == true && jeu.typeMap == 0){
    // console.log("")
    // console.log(Math.floor((e.x-jeu.positionX)/jeu.widthCase))
    // console.log(Math.floor((e.y-jeu.positionY)/jeu.widthCase))
    let caseX = Math.floor((e.x-jeu.positionX)/jeu.widthCase)
    let caseY = Math.floor((e.y-jeu.positionY)/jeu.widthCase)
    for(i=-2; i<3; i++){
      for(j=-2; j<3; j++){
        jeu.map[caseX+i][caseY+j] = 1
      }
    }
  }
}

document.onmousedown = function(e){
  mouseDown = true
}
document.onmouseup = function(e){
  mouseDown = false
}
document.onclick = function(e){
  if(jeu.typeMap == 1){
    let caseX = Math.floor((e.x-jeu.positionX)/jeu.widthCase)
    let caseY = Math.floor((e.y-jeu.positionY)/jeu.widthCase)
    jeu.map[caseX][caseY] = 2
    jeu.xStart = (e.x-jeu.positionX) + jeu.positionX
    jeu.yStart = (e.y-jeu.positionY) + jeu.positionY //caseY*jeu.widthCase
    initCars()
  }
}
document.onkeydown = function(e){
  console.log(e.keyCode)
  if(e.keyCode == 32){
    jeu.typeMap = 1;
  }
}

function dessin(){ // Dessiner les 5 inputs des voitures
	ctx.clearRect(0, 0, canvas.width, 50) // clear map
  ctx.strokeStyle = "#0000ff"
  ctx.strokeRect(jeu.positionX, jeu.positionY, jeu.widthCase*jeu.nbCaseX, jeu.widthCase*jeu.nbCaseY); // Borders

  ctx.globalCompositeOperation = "source-over";
  for(i=0; i<jeu.nbCaseX; i++){
    for(j=0; j<jeu.nbCaseY; j++){
      if(jeu.map[i][j] == 0){
        ctx.fillStyle = "rgba(76, 97, 130, 0.2)" // "#4c6182"
        ctx.fillRect(jeu.positionX + i*jeu.widthCase, jeu.positionY + j*jeu.widthCase, jeu.widthCase, jeu.widthCase);
      }
      else if(jeu.map[i][j] == 1){
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)" // "#000000"
        ctx.fillRect(jeu.positionX + i*jeu.widthCase, jeu.positionY + j*jeu.widthCase, jeu.widthCase, jeu.widthCase);
      }
      else if(jeu.map[i][j] == 2){
        ctx.fillStyle = "rgba(0, 255, 0, 0.2)" //"#00ff00"
        ctx.fillRect(jeu.positionX + i*jeu.widthCase, jeu.positionY + j*jeu.widthCase, jeu.widthCase, jeu.widthCase);
      }
    }
  }
  for(i=0; i< jeu.listCar.length; i++){
    ctx.beginPath()
    ctx.fillStyle = jeu.listCar[i].color
    ctx.arc(jeu.listCar[i].x, jeu.listCar[i].y, jeu.listCar[i].size, 0, 2*Math.PI)
    ctx.fill()
  }
  ctx.globalCompositeOperation = "darken";

  ctx.strokeStyle = "#000000"
	ctx.strokeText("Car left : " + jeu.listCar.length + " / " + jeu.nbCars, 50, 40)
  // ctx.strokeText("ComputerWin : " + jeu.computerWin, 400, 40)
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}






// function drawCar(car) {
//     ctx.save();
//     ctx.beginPath();
//     ctx.translate(car.x + car.largeur / 2, car.y + car.hauteur / 2); // Largeur et hauteur de la voiture
//     ctx.rotate(car.orientation * Math.PI / 180);
//     ctx.rect(-car.largeur / 2, -car.hauteur / 2, car.largeur, car.hauteur);
//     ctx.fillStyle = car.color;
//     ctx.fill();
//     ctx.restore();
// }


// document.onkeydown = function(e){
//   console.log(e.keyCode)
// 	if(e.keyCode == 90 || e.keyCode == 38){
//     console.log("haut")
//     c.x += 10
// 	}
//   else if(e.keyCode == 83 || e.keyCode == 40){
//     console.log("bas")
//   }
//   else if(e.keyCode == 81 || e.keyCode == 37){
//     console.log("gauche")
//     c.orientation -=5
//   }
//   else if(e.keyCode == 68 || e.keyCode == 39){
//     console.log("droite")
//     c.orientation +=5
//   }
//   else if(e.keyCode == 32){
//     jeu.typeMap++;
//   }
// }
