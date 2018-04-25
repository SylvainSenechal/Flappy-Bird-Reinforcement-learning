// Essayer sans dessiner le jeu

window.addEventListener('load', init);
var ctx, canvas
var width, height
function init(){
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"
  createFirstGenBirds()
  loop();
}

function loop(){ // Voir l'ordre des fonctions
	createPipes()

	gravity()
  updatePipesPosition()
  removePastPipes() // attention a l'ordre collision et remove pipes
  collisions()
  updateScore()

  restoreGame()
  dessin();

  requestAnimationFrame(loop);
}

var jeu = {
	width: 900,
	height: 600,
	positionX: 50,
	positionY: 50,
	lastPipeCreated: 0,
	holePipe: 0.3, // %of the pipe cut off
	listePipes: [],
  listeBird: [],
	speed: 3,
	score: 0,
  gravityPower: 0.7,
  scoreBetweenPipes : 300,
  nbBirds: 500,
  nbGeneration: 1,
  restoreFromLastGen: false,
  maxFitness: 0
}

var savedWeight = {
  w1: 0,
  w2: 0,
  w3: 0,
  w4: 0
}

Brain = function(w1, w2, w3, w4, sameAsLastBestBird, makingSmalleChanges){
  if(arguments.length == 0){
    this.w1 = -1 + Math.random()*2
    this.w2 = -1 + Math.random()*2
    this.w3 = -1 + Math.random()*2
    this.w4 = -1 + Math.random()*2
  }
  if(arguments.length == 4){
    if(!jeu.restoreFromLastGen){ // Si j'ai pas amélioré mon score, j'en refais la moitier en random
      this.w1 = -1 + Math.random()*2
      this.w2 = -1 + Math.random()*2
      this.w3 = -1 + Math.random()*2
      this.w4 = -1 + Math.random()*2
    }
    else{
      this.w1 = w1 + (-1+Math.random()*2)/20
      this.w2 = w2 + (-1+Math.random()*2)/20
      this.w3 = w3 + (-1+Math.random()*2)/20
      this.w4 = w4 + (-1+Math.random()*2)/20
    }
  }
  if(arguments.length == 5){ // Si j'ai pas amélioré mon score, j'en fait quand même un identique au meilleur
    this.w1 = w1
    this.w2 = w2
    this.w3 = w3
    this.w4 = w4
  }
  if(arguments.length == 6){ // Si j'ai pas amélioré mon score, j'en refais l'autre moitier en similaire
    this.w1 = w1 + (-1+Math.random()*2)/20
    this.w2 = w2 + (-1+Math.random()*2)/20
    this.w3 = w3 + (-1+Math.random()*2)/20
    this.w4 = w4 + (-1+Math.random()*2)/20
  }
}

function useBrain(bird){
  // inputs = [xBird, xFirstPipe, yTopPipe, yBottomPipe] + normalize
  let i1 = (bird.y-jeu.positionY-bird.size) / (jeu.height-(2*bird.size)) //(y-50-25)/(75-625)->550 d'écart
  let i2 = (jeu.listePipes[0].x-bird.x) / (jeu.width-jeu.positionX) //(entre 100 et 950)->850 (oiseauX maxXpipe)
  let i3 = (jeu.listePipes[0].height1) / (jeu.height*(1-jeu.holePipe))
  let i4 = (jeu.listePipes[0].height2) / (jeu.height*(1-jeu.holePipe)) // Nb : i3+i4 = 1
  let inputs = [i1, i2, i3, i4]

  return i1*bird.brain.w1 + i2*bird.brain.w2 + i3*bird.brain.w3 + i4*bird.brain.w4
  //return i1*bird.brain.w1 + i3*bird.brain.w3 + i4*bird.brain.w4
}

Bird = function(w1, w2, w3, w4, sameAsLastBestBird){
  this.size = 25
	this.x = jeu.positionX + 50
	this.y = jeu.positionY + this.size + (jeu.height-this.size)*Math.random()
  this.birdVertSpeed = 0
  this.color = getRandomColor()

  this.fitness = 0
  this.collision = false
  if(arguments.length == 0){
    this.brain = new Brain()
  }
  if(arguments.length == 4){
    this.brain = new Brain(w1, w2, w3, w4)
  }
  if(arguments.length == 5){
    this.brain = new Brain(w1, w2, w3, w4, true)
  }
  if(arguments.length == 6){
    this.brain = new Brain(w1, w2, w3, w4, true, "smallChanges")
  }
}

Tuyau = function(){
  this.x       = jeu.width + jeu.positionX
	this.y1      = jeu.positionY
	this.width   = jeu.width/10
	var h1Part   = Math.random() * (1-jeu.holePipe)
	this.height1 = jeu.height*h1Part
	this.height2 = jeu.height - this.height1 - jeu.holePipe*jeu.height
  this.y2      = jeu.height + jeu.positionY - this.height2
}

function createNewGenBirds(makeSmallChange){
  if(arguments.length == 0){  // Si j'ai amélioré mon score j'en fait :
                              // - 1 identique au meilleur
                              // - Le reste proche du meilleur
    for(i=0; i<jeu.nbBirds-1; i++){
      jeu.listeBird.push(new Bird(savedWeight.w1, savedWeight.w2, savedWeight.w3, savedWeight.w4))
    }
    jeu.listeBird.push(new Bird(savedWeight.w1, savedWeight.w2, savedWeight.w3, savedWeight.w4, true))
  }
  else if(arguments.length == 1){ // Si j'ai pas amélioré mon score j'en fait :
                                  // - 1 identique au meilleur
                                  // - la moitié en random
                                  // - l'autre moitié en proche du meilleur
    for(i=0; i<jeu.nbBirds-(jeu.nbBirds/2); i++){  // on en refait la moitie en random
      jeu.listeBird.push(new Bird(savedWeight.w1, savedWeight.w2, savedWeight.w3, savedWeight.w4))
    }
    for(i=0; i<jeu.nbBirds-(jeu.nbBirds/2)-1; i++){  // on en refait la moitie en proche des weights
      jeu.listeBird.push(new Bird(savedWeight.w1, savedWeight.w2, savedWeight.w3, savedWeight.w4, true, "smallChange"))
    }
    jeu.listeBird.push(new Bird(savedWeight.w1, savedWeight.w2, savedWeight.w3, savedWeight.w4, true))
  }
}

function saveWeights(bird){
  savedWeight.w1 = bird.brain.w1
  savedWeight.w2 = bird.brain.w2
  savedWeight.w3 = bird.brain.w3
  savedWeight.w4 = bird.brain.w4
}

function restoreGame(){
  if(jeu.listeBird.length == 0){
    jeu.lastPipeCreated = 0
    jeu.listePipes = []
    jeu.listeBird = []
    jeu.score = 0
    jeu.nbGeneration++
    console.log("Actual best weights : " + JSON.stringify(savedWeight))
    if(jeu.restoreFromLastGen){
      createNewGenBirds()
      jeu.restoreFromLastGen = false
      console.log("GOOD generation, restoring game from SIMILAR weights")
    }
    else{
      createNewGenBirds("making small changes")
      console.log("FAILED generation, restoring game from LAST best weights")
    }
  }
}

function updateScore(){
  jeu.score += jeu.speed
}

function createPipes(){
	if(jeu.lastPipeCreated + jeu.scoreBetweenPipes < jeu.score ){
		jeu.listePipes.push(new Tuyau())
		jeu.lastPipeCreated = jeu.score
	}
}

function createFirstGenBirds(){
  for(i=0; i<jeu.nbBirds; i++){
    jeu.listeBird.push(new Bird())
  }
}



function updatePipesPosition(){
  for (p of jeu.listePipes) {
		p.x -= jeu.speed
	}
}


function removePastPipes(){
  if(jeu.listePipes.length>0){ // Car au tout debut y'a aucun pipes
  let bird = jeu.listeBird[0]
    if((bird.x-jeu.listePipes[0].x) > (jeu.listePipes[0].width+bird.size)){
      jeu.listePipes.splice(0,1)
  	}
  }
}

function collisions(){
  if(jeu.listePipes.length>0){ // Si on a 1 pipes devant nous présent (pas le cas au début)

    var midPipe = jeu.listePipes[0].x + (jeu.listePipes[0].width/2)
    var widthHalfPipe = midPipe-jeu.listePipes[0].x
    for(bird of jeu.listeBird){
      if (Math.abs(midPipe - bird.x) < (bird.size+widthHalfPipe)){ // Si on est au niveau du pipe
        if ( (bird.y - bird.size) < (jeu.listePipes[0].height1 + jeu.listePipes[0].y1) // Si on est sur le haut
        || ( (bird.y + bird.size) > (jeu.listePipes[0].y2) )){ // Ou le bas du pipe, collision
          bird.collision = true
        }
      }
    }
  }
  for(i=0; i<jeu.listeBird.length; i++){
    if(jeu.listeBird[i].collision){
      jeu.listeBird[i].fitness = jeu.score
      if(jeu.listeBird.length == 1){ // S'il ne reste qu'un bird, sauvegarder ses weights
        if(jeu.listeBird[0].fitness > jeu.maxFitness){
          jeu.restoreFromLastGen = true
          jeu.maxFitness = jeu.listeBird[0].fitness
          saveWeights(jeu.listeBird[0])
        }
      }
      jeu.listeBird.splice(i, 1)
    }
  }
}

function gravity(){
  for(bird of jeu.listeBird){
    bird.birdVertSpeed += jeu.gravityPower
  	if(bird.birdVertSpeed > 15){
  		bird.birdVertSpeed = 15
  	}

    if(jeu.listePipes.length>0){ // on a besoin d'un pipe à prendre en entrée pour useBrain
      if(useBrain(bird) >= 0){
    		if(bird.birdVertSpeed > 0){
    			bird.birdVertSpeed = 0
    		}
    		bird.birdVertSpeed -= 1
    	}
    }

  	if(bird.birdVertSpeed < -10){
  			bird.birdVertSpeed = -10
  	}
  	bird.y += bird.birdVertSpeed
  	if(bird.y > jeu.height + jeu.positionX - bird.size ){
  		bird.y = jeu.height + jeu.positionX - bird.size
  	}
  	else if(bird.y < jeu.positionX + bird.size){
  		bird.y = jeu.positionX + bird.size
  	}
  }
}



function dessin(){
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.fillStyle = "#83f442"
	for (p of jeu.listePipes) {
		ctx.fillRect(p.x, p.y1, p.width, p.height1) // top pipe
		ctx.fillRect(p.x, p.y2, p.width, p.height2) // bottom pipe
	}

  for(bird of jeu.listeBird){
    ctx.fillStyle = bird.color
    ctx.beginPath()
  	ctx.arc(bird.x, bird.y, bird.size, 0, 2*Math.PI)
  	ctx.fill()
  }

	ctx.strokeText("Score : " + jeu.score, 50, 40)
  ctx.strokeText("Generation : " + jeu.nbGeneration, 350, 40)
  ctx.strokeText("Max fitness : " + jeu.maxFitness, 650, 40)
	ctx.strokeRect(jeu.positionX, jeu.positionY, jeu.width, jeu.height); // Cadre noir du jeu
}





var spacePressed = false
document.onkeypress = function(e){
	if(e.keyCode == 32){
		spacePressed = true
	}
}
document.onkeyup = function(e){
	if(e.keyCode == 32){
		spacePressed = false
	}
}

// document.onmousemove = function(e){
//   console.log(e.y)
// }

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
