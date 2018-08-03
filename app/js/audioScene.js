
const dimensions = {
  width: 40,
  height: 40,
  depth: 40,
};

const materials = {
left: 'transparent',
right: 'transparent',
front: 'transparent',
back: 'transparent',
down: 'concrete-block-painted',
up: 'tra',
};

const audioContext = new (window.AudioContext || window.webkitAudioContext);
const soundScene = new ResonanceAudio(audioContext);
soundScene.output.connect(audioContext.destination);
soundScene.setRoomProperties(dimensions, materials);

var market;
var marketSourceElement;
var marketSource = soundScene.createSource();
market = document.createElement('audio');
market.src = '../sounds/market.wav';
market.crossOrigin = 'anonymous';
market.loop = true;
market.load();
marketSourceElement = audioContext.createMediaElementSource(market);
marketSource.setGain(.75);
marketSource.setPosition(0, 1, 10);
marketSourceElement.connect(marketSource.input);

var steps;
var stepsSourceElement;
var stepsSource = soundScene.createSource();
steps = document.createElement('audio');
steps.src = '../sounds/steps.wav';
steps.crossOrigin = 'anonymous';
steps.load();
steps.loop = true;
stepsSourceElement = audioContext.createMediaElementSource(steps);
stepsSource.setGain(1);
stepsSourceElement.connect(stepsSource.input);


var cafe;
var cafeSourceElement;
var cafeSource = soundScene.createSource();
cafe = document.createElement('audio');
cafe.src = '../sounds/cafe.wav';
cafe.crossOrigin = 'anonymous';
cafe.loop = true;
cafe.load();
cafeSourceElement = audioContext.createMediaElementSource(cafe);
cafeSource.setGain(.75);
cafeSource.setPosition(-9, 0.5, -12);
cafeSourceElement.connect(cafeSource.input);

var fountain;
var fountainSourceElement;
var fountainSource = soundScene.createSource();
fountain = document.createElement('audio');
fountain.src = '../sounds/fountain.wav';
fountain.crossOrigin = 'anonymous';
fountain.loop = true;
fountain.load();
fountainSourceElement = audioContext.createMediaElementSource(fountain);
fountainSource.setGain(.75);
fountainSource.setPosition(-2.25, 0, 0.75);
fountainSourceElement.connect(fountainSource.input);

var pigeon;
var pigeonSourceElement;
var pigeonSource = soundScene.createSource();
pigeon = document.createElement('audio');
pigeon.src = '../sounds/pigeons.wav';
pigeon.crossOrigin = 'anonymous';
pigeon.loop = true;
pigeon.load();
pigeonSourceElement = audioContext.createMediaElementSource(pigeon);
pigeonSource.setGain(.75);
pigeonSource.setPosition(-9, 0.5, 11);
pigeonSourceElement.connect(pigeonSource.input);

function beacon_eastStop(){
    beacon_east.pause();
    beacon_east.currentTime=0;
 }
 
 function beacon_northStop(){
   beacon_north.pause();
   beacon_north.currentTime=0;
 }
 
 function beacon_southStop(){
   beacon_south.pause();
   beacon_south.currentTime=0;
 }
 
 function beacon_westStop(){
  beacon_west.pause();
  beacon_west.currentTime=0;
 }



var cafe_poi;
var cafe_poiSourceElement;
var cafe_poiSource = soundScene.createSource();
cafe_poi = document.createElement('audio');
cafe_poi.src = '../sounds/cafe_poi.mp3';
cafe_poi.crossOrigin = 'anonymous';
cafe_poi.load();
cafe_poiSourceElement = audioContext.createMediaElementSource(cafe_poi);
cafe_poiSource.setGain(.1);
cafe_poiSourceElement.connect(cafe_poiSource.input);


var fountain_poi;
var fountain_poiSourceElement;
var fountain_poiSource = soundScene.createSource();
fountain_poi = document.createElement('audio');
fountain_poi.src = '../sounds/fountain_poi.mp3';
fountain_poi.crossOrigin = 'anonymous';
fountain_poi.load();
fountain_poiSourceElement = audioContext.createMediaElementSource(fountain_poi);
fountain_poiSource.setGain(.1);
fountain_poiSourceElement.connect(fountain_poiSource.input);

var market_poi;
var market_poiSourceElement;
var market_poiSource = soundScene.createSource();
market_poi = document.createElement('audio');
market_poi.src = '../sounds/market_poi.mp3';
market_poi.crossOrigin = 'anonymous';
market_poi.load();
market_poiSourceElement = audioContext.createMediaElementSource(market_poi);
market_poiSource.setGain(.1);
market_poiSourceElement.connect(market_poiSource.input);

var pigeons_poi;
var pigeons_poiSourceElement;
var pigeons_poiSource = soundScene.createSource();
pigeons_poi = document.createElement('audio');
pigeons_poi.src = '../sounds/pigeons_poi.mp3';
pigeons_poi.crossOrigin = 'anonymous';
pigeons_poi.load();
pigeons_poiSourceElement = audioContext.createMediaElementSource(pigeons_poi);
pigeons_poiSource.setGain(.1);
pigeons_poiSourceElement.connect(pigeons_poiSource.input);


var beacon_north;
var beacon_northSourceElement;
var beacon_northSource = soundScene.createSource();
beacon_north = document.createElement('audio');
beacon_north.src = '../sounds/beacon_north.mp3';
beacon_north.crossOrigin = 'anonymous';
beacon_north.load();
beacon_northSourceElement = audioContext.createMediaElementSource(beacon_north);
beacon_northSource.setGain(.1);
beacon_northSourceElement.connect(beacon_northSource.input);



var beacon_south;
var beacon_southSourceElement;
var beacon_southSource = soundScene.createSource();
beacon_south = document.createElement('audio');
beacon_south.src = '../sounds/beacon_south.mp3';
beacon_south.crossOrigin = 'anonymous';
beacon_south.load();
beacon_southSourceElement = audioContext.createMediaElementSource(beacon_south);
beacon_southSource.setGain(.1);
beacon_southSourceElement.connect(beacon_southSource.input);

var beacon_west;
var beacon_westSourceElement;
var beacon_westSource = soundScene.createSource();
beacon_west = document.createElement('audio');
beacon_west.src = '../sounds/beacon_west.mp3';
beacon_west.crossOrigin = 'anonymous';
beacon_west.load();
beacon_westSourceElement = audioContext.createMediaElementSource(beacon_west);
beacon_westSource.setGain(.1);
beacon_westSourceElement.connect(beacon_westSource.input);

var beacon_east;
var beacon_eastSourceElement;
var beacon_eastSource = soundScene.createSource();
beacon_east = document.createElement('audio');
beacon_east.src = '../sounds/beacon_east.mp3';
beacon_east.crossOrigin = 'anonymous';
beacon_east.load();
beacon_eastSourceElement = audioContext.createMediaElementSource(beacon_east);
beacon_eastSource.setGain(.1);
beacon_eastSourceElement.connect(beacon_eastSource.input);


// Compass
AFRAME.registerComponent('listener', {
    init: function() {
        var sceneEl = this.el.sceneEl;
        this.cameraMatrix4 = new AFRAME.THREE.Matrix4()
     
        this.cameraEl = cameraEl = document.querySelector('a-entity[camera]');
        if (!this.cameraEl) {
            this.cameraEl = document.querySelector('a-camera');
        };
    },
    tick: function() {
        const cameraEl = this.el.sceneEl.camera.el;
        this.cameraMatrix4 = cameraEl.object3D.matrixWorld;

        var x = this.el.object3D.getWorldPosition().x;
        var y = this.el.object3D.getWorldPosition().y;
        var z = this.el.object3D.getWorldPosition().z;
        stepsSource.setPosition(x, y, z);
        beacon_northSource.setPosition(x, y, z);
        beacon_eastSource.setPosition(x, y, z);
        beacon_westSource.setPosition(x, y, z);
        beacon_southSource.setPosition(x, y, z);
        pigeons_poiSource.setPosition(x, y, z); 
        fountain_poiSource.setPosition(x, y, z);
        market_poiSource.setPosition(x, y, z);
        cafe_poiSource.setPosition(x, y, z);
       
    },
    tock () {
        soundScene.setListenerFromMatrix(this.cameraMatrix4)
      },
});


