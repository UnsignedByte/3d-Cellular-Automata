/**
 * @Author: Edmund Lam <edl>
 * @Date:   21:39:21, 02-Sep-2018
 * @Filename: ca.js
 * @Last modified by:   edl
 * @Last modified time: 22:00:41, 06-Sep-2018
 */

var colorJump = 5;
var baseColor = 0
var maxColor = 360;
var largeCubeSize = 20;
var fill = 0.1;
var mouse, raycaster;
var calculating;
var currFrame = 0;

var ids = [];
var cells = [];
var frames = [];
var paused;

windowX = $("#renderer")[0].clientWidth;
windowY = $("#renderer")[0].clientHeight;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, windowX / windowY, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( windowX, windowY );
$("#renderer")[0].appendChild( renderer.domElement );

var rule = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var controls;

class Cube {
  constructor(X, Y, Z, alive){
    this.pos = {x:X, y:Y, z:Z};
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial();
    this.cube = new THREE.Mesh(geometry, material);

    this.cube.position.x = X-largeCubeSize/2;
    this.cube.position.y = Y-largeCubeSize/2;
    this.cube.position.z = Z-largeCubeSize/2;

    this.reset();
    this.neighbors = 0;
    this.age = 0;

    this.alive = alive;

    if (this.alive){
      scene.add(this.cube);
    }
  }

  reset(){
    this.cube.material.setValues({color: getColor(baseColor)});
    this.age = 0;
  }

  update(){
    if (rule[this.neighbors] === 0){
      scene.remove(this.cube);
      this.reset();
    }else if (rule[this.neighbors] === 2){
      if (this.alive){
        this.age = (this.age+colorJump)%maxColor;
        this.cube.material.setValues({color:getColor(baseColor+this.age)});
      }else{
        this.alive = true;
        scene.add(this.cube);
      }
    }else if (rule[this.neighbors] === 1){
      if (this.alive){
        this.age = (this.age+colorJump)%maxColor;
        this.cube.material.setValues({color:getColor(baseColor+this.age)});
      }
    }
    this.neighbors = 0;
  }
}


init();
animate();
function init(){
  paused = true;
  calculating = false
  
  while(scene.children.length > 0){
    scene.remove(scene.children[0]);
  }

  for(var i = 0; i < largeCubeSize; i++){
    cells[i] = new Array();
    for (var j = 0; j < largeCubeSize; j++) {
      cells[i][j] = new Array();
      for (var k = 0; k < largeCubeSize; k++) {
        cells[i][j][k] = new Cube(i, j, k, Math.random()<fill);
      }
    }
  }

  controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.screenSpacePanning = false;
	controls.minDistance = largeCubeSize+10;
	controls.maxDistance = 500;
	controls.maxPolarAngle = Math.PI / 2;

  camera.position.z = controls.minDistance

  camera.lookAt(scene.position);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function getColor(x){
  return new THREE.Color("hsl("+x%360+", 100%, 50%)");
}

function calculate(){
  paused = true;
  calculating = !calculating;
  if (calculating){
    loopCalc();
  }
}

function loopCalc(){
  if (calculating){
    requestAnimationFrame(loopCalc);
    frames.push(calcCubes());
  }
}

var col = 0;
var timeSinceLastFrame = 0;
function animate() {
  concTime = Date.now();
	requestAnimationFrame( animate );

  controls.update();

  if (Date.now() - timeSinceLastFrame >= 250){
    step();
    timeSinceLastFrame = Date.now();
  }
  render();
  $("#fps")[0].innerHTML = 'FPS: ' + Math.round(100000 / (Date.now() - concTime)) / 100;
}

function step(){
  if (!paused){
    currFrame = (currFrame+1)%frames.length;
    while(scene.children.length > 0){
      scene.remove(scene.children[0]);
    }
    for(var i = 0; i < frames[currFrame].length; i++){
      scene.add(frames[currFrame][i]);
    }
  }
}

function render(){
  renderer.render( scene, camera );
}

function calcCubes(){
  var frame = [];
  var posNeighbors = [[1,1,-1], [1,0,-1], [1,-1,-1], [0,-1,-1], [-1,-1,-1], [-1,0,-1], [-1,1,-1], [0,1,-1],
                      [1,1, 0], [1,0, 0], [1,-1, 0], [0,-1, 0], [-1,-1, 0], [-1,0, 0], [-1,1, 0], [0,1, 0],
                      [1,1, 1], [1,0, 1], [1,-1, 1], [0,-1, 1], [-1,-1, 1], [-1,0, 1], [-1,1, 1], [0,1, 1],
                      [0,0, 1], [0,0,-1]];

  scene.traverse( function( node ) {
    if ( node instanceof THREE.Mesh) {

      newbebe = node.clone();
      newbebe.traverse((node) => {
        if (node.isMesh) {
          node.material = node.material.clone();
        }
      });
      frame.push(newbebe);
      for (var n = 0; n < posNeighbors.length; n++){
        var poN = posNeighbors[n];

        var i = node.position.x+largeCubeSize/2;
        var j = node.position.y+largeCubeSize/2;
        var k = node.position.z+largeCubeSize/2;

        var x = (i+poN[0]+largeCubeSize)%largeCubeSize, y = (j+poN[1]+largeCubeSize)%largeCubeSize, z = (k+poN[2]+largeCubeSize)%largeCubeSize;
        cells[x][y][z].neighbors++;
      }
    }
  } );


  for(var i = 0; i < largeCubeSize; i++){
    for (var j = 0; j < largeCubeSize; j++) {
      for (var k = 0; k < largeCubeSize; k++) {
        cells[i][j][k].update();
      }
    }
  }
  return frame;
}

function resetCubes() {
  paused = true;
  calculating = false;
  frames = [];
  while(scene.children.length > 0){
    scene.remove(scene.children[0]);
  }
  for(var i = 0; i < largeCubeSize; i++){
    for (var j = 0; j < largeCubeSize; j++) {
      for (var k = 0; k < largeCubeSize; k++) {
        cells[i][j][k] = new Cube(i, j, k, Math.random()<fill);
      }
    }
  }
}

function updateRules(id){
  paused = true;
  rule[id] = (rule[id]+1)%3
  var b = document.getElementById('rules').children[id]
  b.className = "button";
  if (rule[id] === 0){
    b.className += " red";
  }else if (rule[id] === 1){
    b.className += " blue";
  }else if (rule[id] === 2){
    b.className += " green";
  }
}

function onDocumentMouseMove( event ) {
	// event.preventDefault();
	// mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
	// raycaster.setFromCamera( mouse, camera );
	// var intersects = raycaster.intersectObjects( objects );
	// if ( intersects.length > 0 ) {
	// 	var intersect = intersects[ 0 ];
	// 	rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
	// 	rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
	// }
	// render();
}
