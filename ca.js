/**
 * @Author: Edmund Lam <edl>
 * @Date:   21:39:21, 02-Sep-2018
 * @Filename: ca.js
 * @Last modified by:   edl
 * @Last modified time: 09:42:36, 03-Sep-2018
 */

var colorJump = 5;
var baseColor = 0
var maxColor = 300;
var largeCubeSize = 40;
var fill = 0.1;

var cells = [];
var paused = true;

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

    this.cube.visible = alive;

    scene.add(this.cube);
  }

  reset(){
    this.cube.material.setValues({color: getColor(baseColor)});
    this.age = 0;
  }

  update(){
    if (rule[this.neighbors] === 0){
      // this.cube.visible = false;
      this.cube.visible = false;
      this.reset();
    }else if (rule[this.neighbors] === 2){
      if (this.cube.visible){
        this.age = Math.min(this.age+colorJump, maxColor-baseColor);
        this.cube.material.setValues({color:getColor(baseColor+this.age)});
      }else{
        this.cube.visible = true;
      }
    }else if (rule[this.neighbors] === 1){
      if (this.cube.visible){
        this.age = Math.min(this.age+colorJump, maxColor-baseColor);
        this.cube.material.setValues({color:getColor(baseColor+this.age)});
      }
    }
    this.neighbors = 0;
  }
}


init();
animate();
function init(){

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

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function getColor(x){
  return new THREE.Color("hsl("+x%360+", 100%, 50%)");
}

var col = 0;
function animate() {
	requestAnimationFrame( animate );

  controls.update();

  if (!paused){
    calcCubes();
  }
  render();
}

function render(){
  renderer.render( scene, camera );
}

function calcCubes(){
  var posNeighbors = [[1,1,-1], [1,0,-1], [1,-1,-1], [0,-1,-1], [-1,-1,-1], [-1,0,-1], [-1,1,-1], [0,1,-1],
                      [1,1, 0], [1,0, 0], [1,-1, 0], [0,-1, 0], [-1,-1, 0], [-1,0, 0], [-1,1, 0], [0,1, 0],
                      [1,1, 1], [1,0, 1], [1,-1, 1], [0,-1, 1], [-1,-1, 1], [-1,0, 1], [-1,1, 1], [0,1, 1],
                      [0,0, 1], [0,0,-1]]

  for(var i = 0; i < largeCubeSize; i++){
    for (var j = 0; j < largeCubeSize; j++) {
      for (var k = 0; k < largeCubeSize; k++) {
        if (cells[i][j][k].cube.visible){
          for (var n = 0; n < posNeighbors.length; n++){
            var poN = posNeighbors[n];
            var x = (i+poN[0]+largeCubeSize)%largeCubeSize, y = (j+poN[1]+largeCubeSize)%largeCubeSize, z = (k+poN[2]+largeCubeSize)%largeCubeSize;
            cells[x][y][z].neighbors++;
          }
        }
      }
    }
  }

  for(var i = 0; i < largeCubeSize; i++){
    for (var j = 0; j < largeCubeSize; j++) {
      for (var k = 0; k < largeCubeSize; k++) {
        cells[i][j][k].update();
      }
    }
  }
}

function resetCubes() {
  while(scene.children.length > 0){
    scene.remove(scene.children[0]);
  }
  paused = true;
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
