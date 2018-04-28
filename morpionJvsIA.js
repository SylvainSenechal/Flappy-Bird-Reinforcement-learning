window.addEventListener('load', init);
var ctx, canvas
var width, height

var savedBrain = [{"w1":0.4172626450561213,"w2":0.2993959936771436,"w3":1.315736101342712,"w4":0.11546613279586909,"w5":1.3793305981312614,"w6":-0.11813427276303487,"w7":0.08594934009115153,"w8":-1.5138935328508956,"w9":1.2479766156997116,"w10":0.6932128917172268},{"w1":-0.028916711713517923,"w2":-0.7035785413026844,"w3":0.6704394042600221,"w4":-0.5456818935814726,"w5":0.4864836262888652,"w6":-1.234183752447041,"w7":-0.7448054288706552,"w8":1.084927971878063,"w9":0.6829939116506344,"w10":0.09944985031307453},{"w1":1.3092876199060173,"w2":1.6313896132588779,"w3":-0.38167783981911385,"w4":-0.7915910989451003,"w5":0.3845924027192451,"w6":0.20902473832769342,"w7":-0.334664758706288,"w8":0.8311055014284853,"w9":-0.7835316440306478,"w10":-0.9727848313000079},{"w1":0.2730889561359276,"w2":-0.633763116644078,"w3":0.3624125893216733,"w4":-0.4753991180494598,"w5":0.7416551879588514,"w6":2.0296868980237726,"w7":-1.473703797753154,"w8":-0.28269326674420114,"w9":-0.995265212483657,"w10":-1.0949743466595196},{"w1":0.3443734641943744,"w2":0.7683955188190665,"w3":-0.641703131689753,"w4":-0.09033944455479437,"w5":0.47848896655991563,"w6":1.2455334299312986,"w7":0.4261703790271609,"w8":-0.5139180020905201,"w9":0.9917439736169934,"w10":-0.7285165633208164},{"w1":0.43746193268179584,"w2":0.5434079193740403,"w3":-0.009622954520330174,"w4":0.8265979868678727,"w5":0.7527040646006806,"w6":-0.5089998311926568,"w7":0.11369486645955036,"w8":0.18596145863630448,"w9":1.9342847254296573,"w10":0.9372709410755921},{"w1":-1.217206520801127,"w2":-0.029071773684898952,"w3":-0.14554486228282418,"w4":0.12185924780498703,"w5":0.41539391866423603,"w6":-0.16331284188775116,"w7":-0.8697760690452964,"w8":1.176471123422223,"w9":0.4494672017416306,"w10":0.8965881781781397},{"w1":0.19475290059780187,"w2":0.8730549998292167,"w3":-0.5859860233835696,"w4":-0.7675756060556624,"w5":0.0330622166966116,"w6":0.8536110174460695,"w7":1.1612859159770013,"w8":0.6748446804872484,"w9":0.3621027702580534,"w10":-0.24018643618010405},{"w1":0.5927729873024004,"w2":-1.0980986742096837,"w3":0.1292120977235166,"w4":-0.6981387554495225,"w5":0.21858405656315225,"w6":0.20591599534544908,"w7":-0.14401493277816216,"w8":0.735580577235843,"w9":0.5831145163997365,"w10":0.31127745985624206}]








function init(){
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"
  createIAbrain()
  initGame()
  loop()
}
function loop(){ // Voir l'ordre des fonctions

  restoreGame()
  checkWon()
  allowingPlay()
  dessin()
  requestAnimationFrame(loop);
}
function allowingPlay(){

  if(jeu.ended == false){
    if(jeu.nextPlayer == 1 ){

    }
    else if(jeu.nextPlayer == 2){
      playComputer()
    }
  }

}
function initGame(){
  jeu.nextPlayer = Math.floor(1+Math.random()*2)
  for(i=0; i<3; i++){
    jeu.grid[i] = []
    for(j=0; j<3; j++){
      jeu.grid[i][j] = 0
    }
  }
}
function restoreGame(){
  if(jeu.ended == true && jeu.restart == true){ // ET APPUI SUR SPACE BAR BOOL TRUE
    jeu.ended = false
    jeu.restart = false
    jeu.nextPlayer = Math.floor(1+Math.random()*2)
    for(i=0; i<3; i++){
      jeu.grid[i] = []
      for(j=0; j<3; j++){
        jeu.grid[i][j] = 0
      }
    }
  }
}

var jeu = {
  widthCase: 300,
  grid: [],
  IAbrain: [],
  nextPlayer: 0,
	positionX: 50,
	positionY: 50,
	playerWin: 0,
  computerWin: 0,
  nbGeneration: 1,
  maxFitness: 0,

  ended: false,
  restart: false,
}

function playComputer(){
  // Ia :
  let g = []
  let cpt = 0
  for(i=0; i<3; i++){
    g[i] = []
    for(j=0; j<3; j++){
      let br = jeu.IAbrain[i*3+j]
      if(jeu.grid[i][j] == 0){
        cpt++
        g[i][j] = ({vide: true, valBrain: useBrain(br)})
      }
      else{
        g[i][j] = ({vide: false, valBrain: useBrain(br)})
      }

    }
  }
  if(cpt == 9){
    console.log("vide")
    for(i=0; i<3; i++){
      for(j=0; j<3; j++){
        let br = jeu.IAbrain[i*3+j]
        console.log(useBrain(br))
      }
    }
  }


  let best = {
    valI: 0,
    valJ: 0
  }
  let maxBrain = -10000

  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if(g[i][j].vide == true && g[i][j].valBrain > maxBrain){ // case jouable
        best.valI = i
        best.valJ = j
        maxBrain = g[i][j].valBrain
      }
    }
  }
  jeu.grid[best.valI][best.valJ] = 2
  console.log("pose")
  console.log(best.valI)
  console.log(best.valJ)

  jeu.nextPlayer = 1

}

document.onclick = function(e){
  if(jeu.nextPlayer == 1){
    let caseY = Math.floor(((e.x-jeu.positionX)/300))
    let caseX = Math.floor(((e.y-jeu.positionY)/300))
    if(jeu.grid[caseX][caseY] == 0){
      jeu.grid[caseX][caseY] = 1
      jeu.nextPlayer = 2
    }
  }
}

function checkWon(){
  if(jeu.ended == false){
    // Player win :
    if(jeu.grid[0][0] == 1 && jeu.grid[1][1] == 1 && jeu.grid[2][2] == 1){ // Diago 1
      console.log("j1 gg")
      jeu.playerWin++
      jeu.ended = true
    }
    if(jeu.grid[0][2] == 1 && jeu.grid[1][1] == 1 && jeu.grid[2][0] == 1){ // Diago 2
      console.log("j1 gg")
      jeu.playerWin++
      jeu.ended = true
    }
    for(i=0; i<3; i++){
      if(jeu.grid[i][0] == 1 && jeu.grid[i][1] == 1 && jeu.grid[i][2] == 1){ // 3 lignes
        console.log("j1 gg")
        jeu.playerWin++
        jeu.ended = true
      }
      if(jeu.grid[0][i] == 1 && jeu.grid[1][i] == 1 && jeu.grid[2][i] == 1){ // 3 colonnes
        console.log("j1 gg")
        jeu.playerWin++
        jeu.ended = true
      }
    }
    // Computer win :
    if(jeu.grid[0][0] == 2 && jeu.grid[1][1] == 2 && jeu.grid[2][2] == 2){ // Diago 1
      console.log("j2 gg")
      jeu.computerWin++
      jeu.ended = true
    }
    if(jeu.grid[0][2] == 2 && jeu.grid[1][1] == 2 && jeu.grid[2][0] == 2){ // Diago 2
      console.log("j2 gg")
      jeu.computerWin++
      jeu.ended = true
    }
    for(i=0; i<3; i++){
      if(jeu.grid[i][0] == 2 && jeu.grid[i][1] == 2 && jeu.grid[i][2] == 2){ // 3 lignes
        console.log("j2 gg")
        jeu.computerWin++
        jeu.ended = true
      }
      if(jeu.grid[0][i] == 2 && jeu.grid[1][i] == 2 && jeu.grid[2][i] == 2){ // 3 colonnes
        console.log("j2 gg")
        jeu.computerWin++
        jeu.ended = true
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
      jeu.ended = true
    }

    // Still on :
    return -1
  }
}


function createIAbrain(){
  console.log(savedBrain)
  for(i=0; i<9; i++){
    jeu.IAbrain[i] = savedBrain[i]
  }
}

function useBrain(brain){
  // inputs = [xBird, xFirstPipe, yTopPipe, yBottomPipe] + normalize

  let i1 = jeu.grid[0][0] / 2 // (val = 0||1||2) --> range = 2
  let i2 = jeu.grid[0][1] / 2 // (val = 0||1||2) --> range = 2
  let i3 = jeu.grid[0][2] / 2 // (val = 0||1||2) --> range = 2
  let i4 = jeu.grid[1][0] / 2 // (val = 0||1||2) --> range = 2
  let i5 = jeu.grid[1][1] / 2 // (val = 0||1||2) --> range = 2
  let i6 = jeu.grid[1][2] / 2 // (val = 0||1||2) --> range = 2
  let i7 = jeu.grid[2][0] / 2 // (val = 0||1||2) --> range = 2
  let i8 = jeu.grid[2][1] / 2 // (val = 0||1||2) --> range = 2
  let i9 = jeu.grid[2][2] / 2 // (val = 0||1||2) --> range = 2
  let bias = 1
  return i1*brain.w1 + i2*brain.w2 + i3*brain.w3 +
          i4*brain.w4 + i5*brain.w5 + i6*brain.w6 +
          i7*brain.w7 + i8*brain.w8 + i9*brain.w9 + bias*brain.w10
}





document.onkeypress = function(e){
	if(e.keyCode == 32){
    jeu.restart = true
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
	ctx.strokeText("PlayerWin : " + jeu.playerWin, 50, 40)
  ctx.strokeText("ComputerWin : " + jeu.computerWin, 400, 40)
}
