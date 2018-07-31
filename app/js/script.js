var EPS = 0.1;
var WALKING;

// Converts from degrees to radians.
let degreesToradians = (degrees) => {
    return degrees * Math.PI / 180;
};

// Rounding number to decimals
const roundNumber = (number, decimals) => {
    decimals = decimals || 5;
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};


//ON LOAD
//Enable Audio. SATISFY MOBILE IOS & ANDROID BROWSER
//Remove Landing page.
window.addEventListener('load',

    function() {
        let launchVr = document.querySelector("#enter-vr");
        let piazza = document.querySelector("#piazza");
        launchVr.addEventListener("click", function() {
            if (piazza) {
                console.log("Starting Experience");
                ambientSounds();
                audioContext.resume();
                speak("You are now standing in the virtual town square ");
            }
        });

    }, false);


const hideHoverArea = (targetHoverArea) => {
    targetHoverArea = targetHoverArea.replace('description:', '').replace(/\s/g, '');

    let hoverAreaElements = document.querySelectorAll(".hoverArea");

    hoverAreaElements.forEach(function(hoverAreaElement) {
        hoverAreaElement.setAttribute('visible', true);
    });

    let targetAreaElement = document.querySelector("#" + targetHoverArea);
    targetAreaElement.setAttribute('visible', false);
}

//Play walking sound.
const walkSound = (volume) => {
   console.log("PLAY-WALK-TRACK")
}

const ambientSounds = () => {
    market.play();
    cafe.play();
    pigeon.play();
    fountain.play();
}

const speak = (words) => {
    console.log(words)
}

//Determines if there is significant head movement.
const measureVelocity = (currentPos, previousPos) => {
    let passedThresh = false;

    Object.keys(currentPos).forEach((key) => {
        let difference = currentPos[key] - previousPos[key];
        //Set threshold for sickness velocity.
        if (Math.abs(difference) > 13) {
            passedThresh = true;
        }
    })

    return passedThresh;
}

const motionShading = () => {
    let eyelids = document.querySelector("#eyelids");
    if (eyelids) { eyelids.emit('blink') };
}

//Remove shading for motion sickness.
const removeMotionShading = () => {
    let eyelids = document.querySelector("#eyelids");
    if (eyelids) {
        eyelids.emit("unblink");
    };
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


AFRAME.registerComponent('beacon-controls', {
    schema: {
        enabled: { default: true },
        mode: { default: 'teleport', oneOf: ['teleport', 'animate'] },
        animateSpeed: { default: 2.0 }
    },

    init: function() {
        this.active = true;
        this.beacon = null;

        this.offset = new THREE.Vector3();
        this.position = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
    },

    play: function() { this.active = true; },
    pause: function() { this.active = false; },


    setBeacon: function(beacon) {
        var el = this.el;

        if (!this.active) return;
        if (this.beacon === beacon) return;

        if (this.beacon) {
            el.emit('navigation-end', { beacon: beacon });
        }

        this.beacon = beacon;
        el.emit('navigation-start', { beacon: beacon });


        if (this.data.mode === 'teleport') {
            this.sync();
            this.el.setAttribute('position', this.targetPosition);
            this.beacon = null;
            el.emit('navigation-end', { beacon: beacon });
        }
    },

    isVelocityActive: function() {
        return !!(this.active && this.beacon);
    },

    getVelocity: function() {
        if (!this.active) return;
        var data = this.data,
            offset = this.offset,
            position = this.position,
            targetPosition = this.targetPosition,
            beacon = this.beacon;

        this.sync();

        if (position.distanceTo(targetPosition) < EPS) {
            //Walking sound
            WALKING = false;
        

            this.beacon = null;
            this.el.emit('navigation-end', { beacon: beacon });
            hideHoverArea(beacon.attributes.beacon.value);
            return offset.set(0, 0, 0);
        }
        offset.setLength(data.animateSpeed);
        return offset;
    },

    sync: function() {
        var offset = this.offset,
            position = this.position,
            targetPosition = this.targetPosition;

        position.copy(this.el.getAttribute('position'));
        targetPosition.copy(this.beacon.object3D.getWorldPosition());
        targetPosition.add(this.beacon.components.beacon.getOffset());
        offset.copy(targetPosition).sub(position);
        WALKING = false;
    }

});


AFRAME.registerComponent('beacon', {
    schema: {
        offset: { default: { x: 0, y: 1.6, z: 0 }, type: 'vec3' }, // default user height 1.6
        hoverZone: { default: { width: 4, height: 8 } },
        description: { default: '' }
    },

    init: function() {
        this.active = false;
        this.targetEl = null;
        this.fire = this.fire.bind(this);
        this.offset = new THREE.Vector3();
        this.vector = new THREE.Vector3();
        var descriptionData = this.data.description;

        this.el.setAttribute('id', descriptionData.replace('description:', '').replace(/\s/g, ''));
        this.el.setAttribute('class', "hoverArea");

        //  adding ring platform
        var platform = document.createElement("a-entity");
        platform.setAttribute('geometry', `primitive: ring; radiusInner:0.65; radiusOuter:0.85;`);
        platform.setAttribute('material', `shader: flat; side:front; color:white; opacity:0.5;`);
        platform.setAttribute('rotation', `-90 0 0`);
        platform.setAttribute('position', `0 0.001 0`);
        this.el.appendChild(platform);

        //  adding dynamically a large hoverzone for beacons
        var hoverArea = document.createElement("a-entity");
        hoverArea.setAttribute('geometry', `primitive: plane; width: ${this.data.hoverZone.width}; height: ${this.data.hoverZone.height};`);
        hoverArea.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.1;`);
        hoverArea.setAttribute('position', `0 ${this.data.hoverZone.height/2} 0`);
        this.el.appendChild(hoverArea);

        //  adding description
        var desc = document.createElement("a-entity");
        desc.setAttribute('text', `value: ${descriptionData}; align:center`);
        desc.setAttribute('scale', `10 10 10`);
        desc.setAttribute('position', `0 1 0`);
        this.el.appendChild(desc);

        this.el.addEventListener('mouseenter', function() {
            speak("You are looking at the Beacon " + descriptionData);
        });

        this.el.addEventListener('mouseleave', function() {
            
        });

        this.el.addEventListener('click', function() {
            WALKING = true;
            speak("You're walking towards the Beacon " + descriptionData);
        });

    },

    tick: function(t) { //  orient towards camera

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

    update: function() { // read the height from the camera component and use that to offset y
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

    play: function() {
        this.el.addEventListener('click', this.fire);
    },
    pause: function() {
        this.el.removeEventListener('click', this.fire);
    },
    remove: function() { this.pause(); },

    fire: function() {
        var targetEl = this.el.sceneEl.querySelector('[beacon-controls]');
        if (!targetEl) {
            throw new Error('No `beacon-controls` component found.');
        }
        targetEl.components['beacon-controls'].setBeacon(this.el);
        console.dir(this.el);
    },
    getOffset: function() {
        return this.offset.copy(this.data.offset);
    },
    getDescription: function() {
        return this.data.description;
    }
});


// orient entity to face camera
AFRAME.registerComponent('lookat-cam', {
    init: function() {
        this.vector = new THREE.Vector3();
    },

    tick: function(t) {
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
    schema: {
        clickAction: { type: 'string' },
        hoverAction: { type: 'string' },
        description: { default: '' }
    },
    init: function() {
        var pointOfInterest = this.data.description;

        this.el.addEventListener('mouseenter', function() {
            speak("You are looking at " + pointOfInterest);
        });

        this.el.addEventListener('mouseleave', function() {
        
        });

        // this.el.addEventListener('mouseenter', function (evt) {            
        // var clickActionFunctionName = guiInteractable.clickAction;
        // console.log("in button, clickActionFunctionName: "+clickActionFunctionName);
        // find object
        // var clickActionFunction = window[clickActionFunctionName];
        //console.log("clickActionFunction: "+clickActionFunction);
        // is object a function?
        // if (typeof clickActionFunction === "function") clickActionFunction();
        // });

    },
    setHoverAction: function(action) {
        this.data.hoverAction = action; //change function dynamically
    },
    setClickAction: function(action) {
        this.data.clickAction = action; //change function dynamically
    },
});


// Compass
AFRAME.registerComponent('orientation', {
    schema: {
        pitch: { type: 'number', default: 0 }, // max: Math.PI/2, min: - Math.PI/2  
    },
    init: function() {
        var sceneEl = this.el.sceneEl;
        this.cameraMatrix4 = new AFRAME.THREE.Matrix4();
        var orientationVisible = false;
        var data = this.data;
        var _this = this;
        //    var description = el.getAttribute("desc");
        _this.hide();
        //single camera
        this.cameraEl = cameraEl = document.querySelector('a-entity[camera]');
        if (!cameraEl) {
            cameraEl = document.querySelector('a-camera');
        };
        console.log('cameraEl');
        console.log(cameraEl);
        console.dir(cameraEl);

        cameraEl.addEventListener('componentchanged', function(evt) {
            if (evt.detail.name === 'rotation') {
                console.log(evt.detail.name);

                if (this.object3D.getWorldRotation().x <= data.pitch) {
                    if (!orientationVisible) {
                        _this.show();
                        orientationVisible = true;
                    }
                } else {
                    if (orientationVisible) {
                        _this.hide();
                        orientationVisible = false;
                    }
                }
            }
        });
        //  adding ring
        var ring = document.createElement("a-entity");
        ring.setAttribute('geometry', `primitive: ring; radiusInner:0.95; radiusOuter:1;`);
        ring.setAttribute('material', `shader: flat; side:front; color:white; opacity:0.75;`);
        ring.setAttribute('rotation', `-90 0 0`);
        ring.setAttribute('position', `0 0.46 0`);
        this.el.appendChild(ring);

        //  adding north
        var north = document.createElement("a-entity");
        north.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:30;thetaStart:75;`);
        north.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.55;`);
        north.setAttribute('rotation', `-90 0 0`);
        north.setAttribute('position', `0 0.45 0`);
        north.setAttribute('desc', 'North');
        this.el.appendChild(north);
        //  adding north title
        var northTitle = document.createElement("a-entity");
        northTitle.setAttribute('text', `value:North; align:center`);
        northTitle.setAttribute('scale', `3 3 3`);
        northTitle.setAttribute('position', `0 1.1 0`);
        northTitle.setAttribute('rotation', `0 0 0`);
        north.appendChild(northTitle);
        //  adding northNorthEast
        var northNorthEast = document.createElement("a-entity");
        northNorthEast.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:15;thetaStart:60;`);
        northNorthEast.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.35;`);
        northNorthEast.setAttribute('rotation', `-90 0 0`);
        northNorthEast.setAttribute('position', `0 0.45 0`);
        northNorthEast.setAttribute('desc', 'North Northeast');
        this.el.appendChild(northNorthEast);
        //  adding northEast
        var northEast = document.createElement("a-entity");
        northEast.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:30;thetaStart:30;`);
        northEast.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.25;`);
        northEast.setAttribute('rotation', `-90 0 0`);
        northEast.setAttribute('position', `0 0.45 0`);
        northEast.setAttribute('desc', 'Northeast');
        this.el.appendChild(northEast);
        //  adding northEastEast
        var northEastEast = document.createElement("a-entity");
        northEastEast.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:15;thetaStart:15;`);
        northEastEast.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.35;`);
        northEastEast.setAttribute('rotation', `-90 0 0`);
        northEastEast.setAttribute('position', `0 0.45 0`);
        northEastEast.setAttribute('desc', 'Northeast East');
        this.el.appendChild(northEastEast);
        //  adding east
        var east = document.createElement("a-entity");
        east.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:30;thetaStart:-15;`);
        east.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.55;`);
        east.setAttribute('rotation', `-90 0 0`);
        east.setAttribute('position', `0 0.45 0`);
        east.setAttribute('desc', 'East');
        this.el.appendChild(east);
        //  adding east title
        var eastTitle = document.createElement("a-entity");
        eastTitle.setAttribute('text', `value:East; align:center`);
        eastTitle.setAttribute('scale', `3 3 3`);
        eastTitle.setAttribute('position', `1.1 0 0`);
        eastTitle.setAttribute('rotation', `0 0 -90`);
        east.appendChild(eastTitle);
        //  adding eastSouthEast
        var eastSouthEast = document.createElement("a-entity");
        eastSouthEast.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:15;thetaStart:-30;`);
        eastSouthEast.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.35;`);
        eastSouthEast.setAttribute('rotation', `-90 0 0`);
        eastSouthEast.setAttribute('position', `0 0.45 0`);
        eastSouthEast.setAttribute('desc', 'Southeast East');
        this.el.appendChild(eastSouthEast);
        //  adding southEast
        var southEast = document.createElement("a-entity");
        southEast.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:30;thetaStart:-60;`);
        southEast.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.25;`);
        southEast.setAttribute('rotation', `-90 0 0`);
        southEast.setAttribute('position', `0 0.45 0`);
        southEast.setAttribute('desc', 'Southeast');
        this.el.appendChild(southEast);
        //  adding southSouthEast
        var southSouthEast = document.createElement("a-entity");
        southSouthEast.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:15;thetaStart:-75;`);
        southSouthEast.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.35;`);
        southSouthEast.setAttribute('rotation', `-90 0 0`);
        southSouthEast.setAttribute('position', `0 0.45 0`);
        southSouthEast.setAttribute('desc', 'South Southeast');
        this.el.appendChild(southSouthEast);
        //  adding south
        var south = document.createElement("a-entity");
        south.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:30;thetaStart:-105;`);
        south.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.55;`);
        south.setAttribute('rotation', `-90 0 0`);
        south.setAttribute('position', `0 0.45 0`);
        south.setAttribute('desc', 'South');
        this.el.appendChild(south);
        //  adding south title
        var southTitle = document.createElement("a-entity");
        southTitle.setAttribute('text', `value:South; align:center`);
        southTitle.setAttribute('scale', `3 3 3`);
        southTitle.setAttribute('position', `0 -1.1 0 `);
        southTitle.setAttribute('rotation', `0 0 -180`);
        south.appendChild(southTitle);
        //  adding southSouthWest
        var southSouthWest = document.createElement("a-entity");
        southSouthWest.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:15;thetaStart:-120;`);
        southSouthWest.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.35;`);
        southSouthWest.setAttribute('rotation', `-90 0 0`);
        southSouthWest.setAttribute('position', `0 0.45 0`);
        southSouthWest.setAttribute('desc', 'South Southwest');
        this.el.appendChild(southSouthWest);
        //  adding southWest
        var southWest = document.createElement("a-entity");
        southWest.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:30;thetaStart:-150;`);
        southWest.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.25;`);
        southWest.setAttribute('rotation', `-90 0 0`);
        southWest.setAttribute('position', `0 0.45 0`);
        southWest.setAttribute('desc', 'Southwest');
        this.el.appendChild(southWest);
        //  adding southWestWest
        var southWestWest = document.createElement("a-entity");
        southWestWest.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:15;thetaStart:-165;`);
        southWestWest.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.35;`);
        southWestWest.setAttribute('rotation', `-90 0 0`);
        southWestWest.setAttribute('position', `0 0.45 0`);
        southWestWest.setAttribute('desc', 'Southwest West');
        this.el.appendChild(southWestWest);
        //  adding west
        var west = document.createElement("a-entity");
        west.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:30;thetaStart:-195;`);
        west.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.55;`);
        west.setAttribute('rotation', `-90 0 0`);
        west.setAttribute('position', `0 0.45 0`);
        west.setAttribute('desc', 'West');
        this.el.appendChild(west);
        //  adding west title
        var westTitle = document.createElement("a-entity");
        westTitle.setAttribute('text', `value:West; align:center`);
        westTitle.setAttribute('scale', `3 3 3`);
        westTitle.setAttribute('position', `-1.1 0 0 `);
        westTitle.setAttribute('rotation', `0 0 90`);
        westTitle.setAttribute('lookat', `[camera]`);
        west.appendChild(westTitle);
        //  adding westNorthWest
        var westNorthWest = document.createElement("a-entity");
        westNorthWest.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:15;thetaStart:-210;`);
        westNorthWest.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.35;`);
        westNorthWest.setAttribute('rotation', `-90 0 0`);
        westNorthWest.setAttribute('position', `0 0.45 0`);
        westNorthWest.setAttribute('desc', 'West Northwest');
        this.el.appendChild(westNorthWest);
        //  adding northWest
        var northWest = document.createElement("a-entity");
        northWest.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:30;thetaStart:-240;`);
        northWest.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.25;`);
        northWest.setAttribute('rotation', `-90 0 0`);
        northWest.setAttribute('position', `0 0.45 0`);
        northWest.setAttribute('desc', 'Northwest');
        this.el.appendChild(northWest);
        //  adding northNorthWest
        var northNorthWest = document.createElement("a-entity");
        northNorthWest.setAttribute('geometry', `primitive: ring; radiusInner:0.25; radiusOuter:1;thetaLength:15;thetaStart:-255;`);
        northNorthWest.setAttribute('material', `shader: flat; side:front; color:red; opacity:0.35;`);
        northNorthWest.setAttribute('rotation', `-90 0 0`);
        northNorthWest.setAttribute('position', `0 0.45 0`);
        northNorthWest.setAttribute('desc', 'North Northwest');
        this.el.appendChild(northNorthWest);

        this.el.addEventListener('mouseenter', function(evt) {
            var desc = evt.detail.intersection.object.el.getAttribute('desc');

            if (desc) {
                speak("You are facing " + desc);
            }

        });

        this.el.addEventListener('mouseleave', function() {
            
        });

    },

    show: function() {
        this.el.setAttribute('scale', '1 1 1');
    },

    hide: function() {
        this.el.setAttribute('scale', '0.03 0.03 0.03');
    },

    tick: function() {
        const cameraEl = this.el.sceneEl.camera.el;
        this.cameraMatrix4 = cameraEl.object3D.matrixWorld;
        var newPos = new THREE.Vector3();
        this.el.setAttribute('position', newPos.x + ' 0 ' + newPos.z);
    }

});
