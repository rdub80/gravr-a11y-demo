function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
/*
// query string: ?foo=lorem&bar=&baz
var foo = getParameterByName('foo'); // "lorem"
var bar = getParameterByName('bar'); // "" (present with empty value)
var baz = getParameterByName('baz'); // "" (present with no value)
var qux = getParameterByName('qux'); // null (absent)
*/

var EPS = 0.1;

AFRAME.registerComponent('beacon-controls', {
  schema: {
    enabled: {default: true},
    mode: {default: 'teleport', oneOf: ['teleport', 'animate']},
    animateSpeed: {default: 3.0}
  },

  init: function () {
    this.active = true;
    this.beacon = null;

    this.offset = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
  },

  play: function () { this.active = true; },
  pause: function () { this.active = false; },

  setBeacon: function (beacon) {
    var el = this.el;

    if (!this.active) return;
    if (this.beacon === beacon) return;

    if (this.beacon) {
      el.emit('navigation-end', {beacon: beacon});
    }

    this.beacon = beacon;
    el.emit('navigation-start', {beacon: beacon});

    if (this.data.mode === 'teleport') {
      this.sync();
      this.el.setAttribute('position', this.targetPosition);
      this.beacon = null;
      el.emit('navigation-end', {beacon: beacon});
    }
  },

  isVelocityActive: function () {
    return !!(this.active && this.beacon);
  },

  getVelocity: function () {
    if (!this.active) return;

    var data = this.data,
        offset = this.offset,
        position = this.position,
        targetPosition = this.targetPosition,
        beacon = this.beacon;

    this.sync();
    if (position.distanceTo(targetPosition) < EPS) {
      this.beacon = null;
      this.el.emit('navigation-end', {beacon: beacon});
      return offset.set(0, 0, 0);
    }
    offset.setLength(data.animateSpeed);
    return offset;
  },

  sync: function () {
    var offset = this.offset,
        position = this.position,
        targetPosition = this.targetPosition;

    position.copy(this.el.getAttribute('position'));
    targetPosition.copy(this.beacon.object3D.getWorldPosition());
    targetPosition.add(this.beacon.components.beacon.getOffset());
    offset.copy(targetPosition).sub(position);
	
	//read description of beacon once - issue does not recognize different desc
	this.readOnce(this.beacon.components.beacon.getDescription());

  },
  readOnce: function(text) {
    if(this.readOnce.done) return;
    console.log("You're walking towards Beacon "+text);
    this.readOnce.done = true;
  }


});


AFRAME.registerComponent('beacon', {
  schema: {
    offset: {default: {x: 0, y: 1.6, z: 0}, type: 'vec3'}, // default user height 1.6
    hoverZone: {default: {width: 4, height: 8}},
    description: {default: ''}
  },

  init: function () {
    this.active = false;
    this.targetEl = null;
    this.fire = this.fire.bind(this);
    this.offset = new THREE.Vector3();
    this.vector = new THREE.Vector3();

//  adding dynamically a large hoverzone for beacons
    var hoverArea = document.createElement("a-entity");
    hoverArea.setAttribute('geometry', `primitive: plane; width: ${this.data.hoverZone.width}; height: ${this.data.hoverZone.height};`);
    hoverArea.setAttribute('material', `shader: flat; side:double; opacity: 0.1; color: red`);
    hoverArea.setAttribute('position', `0 ${this.data.hoverZone.height/2} 0`);
    this.el.appendChild(hoverArea);

//	adding description
    var desc = document.createElement("a-entity");
    desc.setAttribute('text', `value: ${this.data.description}; align:center`);
    desc.setAttribute('scale', `10 10 10`);
    desc.setAttribute('position', `0 1 0`);
    this.el.appendChild(desc);
  },

  tick: function (t) { //  orient towards camera

    var self = this;
    var target = self.el.sceneEl.camera;
    var object3D = self.el.object3D;

    // make sure camera is set
    if (target) { 
         target.updateMatrixWorld();
         this.vector.setFromMatrixPosition(target.matrixWorld);
         if (object3D.parent) {
           object3D.parent.updateMatrixWorld();
           object3D.parent.worldToLocal(this.vector);

         }
     //    return object3D.lookAt(this.vector); ignore camera pitch
         return object3D.lookAt(new THREE.Vector3(this.vector.x, object3D.position.y, this.vector.z));
    }
  },

  update: function () { // read the height from the camera component and use that to offset y
    this.offset.copy(this.data.offset);
/*    not working
    var sceneEl = this.el.sceneEl;
	sceneEl.addEventListener('renderstart', function (evt) {
       	var camera = evt.detail.target.camera.el.components.camera;
       	defaultCameraUserHeight = camera.data.userHeight;
    	this.offset.y = defaultCameraUserHeight;
    	//_offset.set({x: 0, y: defaultCameraUserHeight, z: 0});
    	console.log("adjust to camera height");
    });
*/
  },

  play: function () { 
  	this.el.addEventListener('click', this.fire); 
  },
  pause: function () { 
  	this.el.removeEventListener('click', this.fire);
  },
  remove: function () { this.pause(); },

  fire: function () {
    var targetEl = this.el.sceneEl.querySelector('[beacon-controls]');
    if (!targetEl) {
      throw new Error('No `beacon-controls` component found.');
    }
    targetEl.components['beacon-controls'].setBeacon(this.el);
  },
  getOffset: function () {
    return this.offset.copy(this.data.offset);
  },
  getDescription: function () {
    return this.data.description;
  }


});


// orient entity to face camera
AFRAME.registerComponent('lookat-cam', {
  init: function () {
    this.vector = new THREE.Vector3();
  },

  tick: function (t) {
    var self = this;
    var target = self.el.sceneEl.camera;
    var object3D = self.el.object3D;

    // make sure camera is set
    if (target) { 
      target.updateMatrixWorld();
      this.vector.setFromMatrixPosition(target.matrixWorld);
      if (object3D.parent) {
        object3D.parent.updateMatrixWorld();
        object3D.parent.worldToLocal(this.vector);
      }
      return object3D.lookAt(this.vector);
    }
  }
});




// Point of interest
AFRAME.registerComponent('poi', {
  init: function () {

  },


});



// calculate motion speed
AFRAME.registerComponent('track-gaze', {
	schema: {
	    dist: {type: 'number', default: -1.5},
	},
	init: function () {
	    var data = this.data;	
		var _this = this;
	    var el = this.el;

	    this.cameraEl = document.querySelector('a-entity[camera]');
	    this.panel = document.querySelector('a-entity[id="panel"]');

	    this.yaxis = new THREE.Vector3(0, 1, 0);
	    this.zaxis = new THREE.Vector3(0, 0, 1);
	    this.pivot = new THREE.Object3D();
//	    this.panel.object3D.position.set(0, this.cameraEl.object3D.getWorldPosition().y, data.dist);
	    this.panel.object3D.position.set(0, 0, data.dist);
	    el.sceneEl.object3D.add(this.pivot);
	    this.pivot.add(this.panel.object3D);

//		this.panel.setAttribute("position", "0 " + this.cameraEl.object3D.getWorldPosition().y + " " + data.dist);

	    this.cameraEl.addEventListener('componentchanged', function (evt) {
	      	if (evt.detail.name === 'rotation') {
	        	_this.posTrack(evt.detail.newData)
	      	}
	    });
	    setTimeout(function(){ _this.updatePos(); }, 10000);

	},
	posTrack: function (newData) {
		
		var horizontal = roundNumber(newData.x,2);
		var vertical = roundNumber(newData.y,2);
		document.querySelector('a-text[id="horizontal"]').setAttribute("value", horizontal);
		document.querySelector('a-text[id="vertical"]').setAttribute("value", vertical);
		/**/

		var rotateY = this.cameraEl.object3D.getWorldRotation().y;
		var rotateX = this.cameraEl.object3D.getWorldRotation().x;
		console.log("rotateY: " + radiansToDegrees(rotateY) + " - rotateX: " + radiansToDegrees(rotateX));

		// var panelWdithLeft = 0;
		// var panelWdithRight = 0;

		var panelWdith = 0;
		var panelHeight = 0;
		var panelDistance = this.data.dist*2;

		// x; tan( Rotation Deg ) = length (x) /distance (z)
		// Tangent = opposite/adjacent

		// if(rotateY>0){
		// 	panelWdithLeft = Math.tan(rotateY) * panelDistance;
		// }else{
		// 	rotateY = -rotateY;
		// 	panelWdithLeft = 0;
		// 	panelWdithRight = Math.tan(rotateY) * panelDistance;
		// }

		var posRotY = -rotateY > 0 ? -rotateY  : rotateY;
		panelWdith = Math.tan(posRotY) * panelDistance;

		var posRotX = -rotateX > 0 ? -rotateX  : rotateX;
		panelHeight = Math.tan(posRotX) * panelDistance;

		console.log("panelWdith: " + panelWdith);
		console.log("panelHeight: " + panelHeight);

		this.panel.setAttribute("geometry","width", panelWdith);
		this.panel.setAttribute("geometry","height", panelHeight);

	},	
	setPos: function () {
		var direction = this.zaxis.clone();
	    direction.applyQuaternion(this.cameraEl.object3D.quaternion);
	    var ycomponent = this.yaxis.clone().multiplyScalar(direction.dot(this.yaxis));
	    direction.sub(ycomponent);
	    direction.normalize();

	    this.pivot.quaternion.setFromUnitVectors(this.zaxis, direction);
	    this.pivot.position.copy(this.cameraEl.object3D.getWorldPosition());
	    this.panel.setAttribute("rotation",this.cameraEl.object3D.getWorldRotation());
		console.log("fired updatePos");
	},	
	updatePos: function () {
		var direction = this.zaxis.clone();
	    direction.applyQuaternion(this.cameraEl.object3D.quaternion);
	    var ycomponent = this.yaxis.clone().multiplyScalar(direction.dot(this.yaxis));
	    direction.sub(ycomponent);
	    direction.normalize();

	    this.pivot.quaternion.setFromUnitVectors(this.zaxis, direction);
	    this.pivot.position.copy(this.cameraEl.object3D.getWorldPosition());
	    this.panel.setAttribute("rotation",this.cameraEl.object3D.getWorldRotation());
		console.log("fired updatePos");
	},	

});





// var defaultCameraUserHeight; 
//   function addRenderStartListener () {
//     document.querySelector('a-scene').addEventListener('renderstart', function (evt) {
//       var camera = evt.detail.target.camera.el.components.camera;
//       defaultCameraUserHeight = camera.data.userHeight;
//     });
//   }
//  addRenderStartListener(); //document.body.addEventListener('DOMContentLoaded', addRenderStartListener);




