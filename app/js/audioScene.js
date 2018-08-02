
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
marketSource.setGain(1);
marketSource.setPosition(0, 1, 10);
marketSourceElement.connect(marketSource.input);

var cafe;
var cafeSourceElement;
var cafeSource = soundScene.createSource();
cafe = document.createElement('audio');
cafe.src = '../sounds/cafe.wav';
cafe.crossOrigin = 'anonymous';
cafe.loop = true;
cafe.load();
cafeSourceElement = audioContext.createMediaElementSource(cafe);
cafeSource.setGain(1);
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
fountainSource.setGain(1);
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
pigeonSource.setGain(1);
pigeonSource.setPosition(-9, 0.5, 11);
pigeonSourceElement.connect(pigeonSource.input);

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
    },
    tock () {
        soundScene.setListenerFromMatrix(this.cameraMatrix4)
      },
});

