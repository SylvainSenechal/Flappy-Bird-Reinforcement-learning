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

  restoreGame()
}

function restoreGame(){
  jeu.nextPlayer = Math.floor(1+Math.random()*2)
  for(i=0; i<3; i++){
    jeu.grid[i] = []
    for(j=0; j<3; j++){
      jeu.grid[i][j] = 0
    }
  }
  dessin()
  if(jeu.nextPlayer == 2){
    playComputer()
  }
}

var joueur1 = { // Player
  style: "circle"
}

var joueur2 = { // computer
  style: "cross"
}
var jeu = {
  widthCase: 300,
  grid: [],
  nextPlayer: 0,
	positionX: 50,
	positionY: 50,
	score: 0,
  nbGeneration: 1,
  maxFitness: 0
}

function playComputer(){
  let listePlayable = []
  // Joueur aléatoire :
  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if(jeu.grid[i][j] == 0){ // case jouable
        listePlayable.push({valI: i, valJ: j})
      }
    }
  }
  let playedCase = Math.floor(Math.random()*listePlayable.length)
  jeu.grid[listePlayable[playedCase].valI][listePlayable[playedCase].valJ] = 2
  dessin()
  if(checkWon() == 1 || checkWon() == 2 || checkWon() == 0){
    restoreGame()
  }
  else{
    jeu.nextPlayer = 1
  }
}

function checkWon(){
  // Player win :
  if(jeu.grid[0][0] == 1 && jeu.grid[1][1] == 1 && jeu.grid[2][2] == 1){ // Diago 1
    console.log("j1 gg")
    return 1
  }
  if(jeu.grid[0][2] == 1 && jeu.grid[1][1] == 1 && jeu.grid[2][0] == 1){ // Diago 2
    console.log("j1 gg")
    return 1
  }
  for(i=0; i<3; i++){
    if(jeu.grid[i][0] == 1 && jeu.grid[i][1] == 1 && jeu.grid[i][2] == 1){ // 3 lignes
      console.log("j1 gg")
      return 1
    }
    if(jeu.grid[0][i] == 1 && jeu.grid[1][i] == 1 && jeu.grid[2][i] == 1){ // 3 colonnes
      console.log("j1 gg")
      return 1
    }
  }
  // Computer win :
  if(jeu.grid[0][0] == 2 && jeu.grid[1][1] == 2 && jeu.grid[2][2] == 2){ // Diago 1
    console.log("j2 gg")
    return 2
  }
  if(jeu.grid[0][2] == 2 && jeu.grid[1][1] == 2 && jeu.grid[2][0] == 2){ // Diago 2
    console.log("j2 gg")
    return 2
  }
  for(i=0; i<3; i++){
    if(jeu.grid[i][0] == 2 && jeu.grid[i][1] == 2 && jeu.grid[i][2] == 2){ // 3 lignes
      console.log("j2 gg")
      return 2
    }
    if(jeu.grid[0][i] == 2 && jeu.grid[1][i] == 2 && jeu.grid[2][i] == 2){ // 3 colonnes
      console.log("j2 gg")
      return 2
    }
  }
  // Match null :
  let cpt = 0
  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if(jeu.grid[i][j] == 1 || jeu.grid[i][j] == 2){
        cpt++
      }
    }
  }
  if(cpt == 9){
    return 0
  }

  // Still on :
  return -1
}

document.onclick = function(e){
  if(jeu.nextPlayer == 1){
    let caseY = Math.floor(((e.x-jeu.positionX)/300))
    let caseX = Math.floor(((e.y-jeu.positionY)/300))
    if(jeu.grid[caseX][caseY] == 0){
      jeu.grid[caseX][caseY] = 1
      jeu.nextPlayer = 2
    }

    dessin()
    if(checkWon() == 1 || checkWon() == 2 || checkWon() == 0 ){
      restoreGame()
    }
    if(jeu.nextPlayer == 2){
      playComputer()
    }
  }
}





function dessin(){
	ctx.clearRect(0, 0, canvas.width, canvas.height)
  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      ctx.strokeRect(jeu.positionX+i*jeu.widthCase, jeu.positionY+j*jeu.widthCase, jeu.widthCase, jeu.widthCase);
    }
  }

  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if(jeu.grid[j][i] == 1){
        ctx.strokeStyle = "#00ff00"
        ctx.beginPath()
        ctx.arc(jeu.positionX+i*jeu.widthCase + jeu.widthCase/2, jeu.positionY+j*jeu.widthCase + jeu.widthCase/2, jeu.widthCase/4, 0, 2*Math.PI)
      	ctx.stroke()
      }
      if(jeu.grid[j][i] == 2){
        ctx.strokeStyle = "#ff0000"
        ctx.strokeRect(jeu.positionX+i*jeu.widthCase + jeu.widthCase/4, jeu.positionY+j*jeu.widthCase + jeu.widthCase/4, jeu.widthCase/2, jeu.widthCase/2);
      }
    }
  }
  ctx.strokeStyle = "#000000"
	ctx.strokeText("Score : " + jeu.score, 50, 40)
  ctx.strokeText("Generation : " + jeu.nbGeneration, 350, 40)
  ctx.strokeText("Max fitness : " + jeu.maxFitness, 700, 40)
}
