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



AFRAME.registerComponent('lookat-txt', {
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


AFRAME.registerComponent('switch-camera', {
	schema: {
    	activate: { default: '' }
	},
	init: function () {
		var data = this.data;
		var el = this.el;
    	var targetCam = document.querySelector(data.activate);
		var cameraEls = document.querySelectorAll('a-entity[camera]');

		el.addEventListener('click', function (evt) { 
	    	console.log('switch to camera ID: '+ data.activate)

	       	if(data.activate != ''){

				for (var i = 0; i < cameraEls.length; i++) {
				  	console.log(cameraEls[i]);
					cameraEls[i].setAttribute('camera', 'active', false);
				}
	    		
	    		console.log('activate: '+ data.activate)
				targetCam.setAttribute('camera', 'active', true);
	       	}
		});
	}
});


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





