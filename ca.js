/**
 * @Author: Edmund Lam <edl>
 * @Date:   21:39:21, 02-Sep-2018
 * @Filename: ca.js
 * @Last modified by:   edl
 * @Last modified time: 23:01:23, 02-Sep-2018
 */

var mouseX, mouseY;
var changeX = 0, changeY = 0;
var degX = 0; degY = 0;
var mouseDown = false, mouseOver = false;
var windowX, windowY;
var zoom = 5;
windowX = window.innerWidth;
windowY = window.innerHeight;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, windowX / windowY, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( windowX, windowY );
$("#renderer")[0].appendChild( renderer.domElement );
var controls;
var cube;
init();
function init(){

  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0xFF0000 } );
  cube = new THREE.Mesh( geometry, material );

  scene.add( cube );

  controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.screenSpacePanning = false;
	controls.minDistance = 10;
	controls.maxDistance = 500;
	controls.maxPolarAngle = Math.PI / 2;

  camera.position.z = 10

  camera.lookAt(scene.position);

}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

var col = 0;
function animate() {
	requestAnimationFrame( animate );

  // drag();
  controls.update();
  render();
}

function render(){
  renderer.render( scene, camera );
}

animate();
