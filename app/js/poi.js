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

 var steps;
var stepsSourceElement;
var stepsSource = soundScene.createSource();
steps = document.createElement('audio');
steps.src = '../sounds/steps.wav';
steps.crossOrigin = 'anonymous';
steps.load();
steps.loop = true;
stepsSourceElement = audioContext.createMediaElementSource(steps);
stepsSource.setGain(.8);
stepsSourceElement.connect(stepsSource.input);


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






AFRAME.registerComponent('x', {
    tick: function () {
        beacon_northSource.setPosition(this.el.object3D.getWorldPosition().x, this.el.object3D.getWorldPosition().y, this.el.object3D.getWorldPosition().z);
        beacon_eastSource.setPosition(this.el.object3D.getWorldPosition().x, this.el.object3D.getWorldPosition().y, this.el.object3D.getWorldPosition().z);
        beacon_westSource.setPosition(this.el.object3D.getWorldPosition().x, this.el.object3D.getWorldPosition().y, this.el.object3D.getWorldPosition().z);
        beacon_southSource.setPosition(this.el.object3D.getWorldPosition().x, this.el.object3D.getWorldPosition().y, this.el.object3D.getWorldPosition().z);
        pigeons_poiSource.setPosition(this.el.object3D.getWorldPosition().x, this.el.object3D.getWorldPosition().y, this.el.object3D.getWorldPosition().z); 
        fountain_poiSource.setPosition(this.el.object3D.getWorldPosition().x, this.el.object3D.getWorldPosition().y, this.el.object3D.getWorldPosition().z);
        market_poiSource.setPosition(this.el.object3D.getWorldPosition().x, this.el.object3D.getWorldPosition().y, this.el.object3D.getWorldPosition().z);
        cafe_poiSource.setPosition(this.el.object3D.getWorldPosition().x, this.el.object3D.getWorldPosition().y, this.el.object3D.getWorldPosition().z);
       
    }
  });

