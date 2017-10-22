var synth = window.speechSynthesis;
var EPS = 0.1;
var WALKING, STEP;

// HELPER FUNCTIONS -------

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
                console.log("Entering Experience");
                ambientSounds();
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
    //    new Audio('../sounds/step.mp3').play();
    STEP = new Audio('https://cdn.rawgit.com/rdub80/gravr-a11y-demo/cad67274/app/sounds/steps.mp3');
    STEP.volume = volume;
    STEP.loop = false;
    STEP.play();
}

const ambientSounds = () => {
    let soundElements = document.querySelectorAll(".ambientSound");

    soundElements.forEach(function(element) {
        element.components.sound.playSound();
    })
}

const speak = (words) => {
    silence();

    let utterThis = new SpeechSynthesisUtterance(words);
    //var voices = synth.getVoices();
    //utterThis.voice = voices[0];
    utterThis.lang = 'en-US';
    utterThis.name = 'Google US English';
    utterThis.pitch = 1;
    utterThis.rate = 1;
    utterThis.volume = 0.5;

    synth.speak(utterThis);
}

const silence = () => {
    synth.cancel();
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
            STEP.pause();

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
            silence();
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
            silence();
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
        var orientationVisible = false;
        var data = this.data;
        var _this = this;
        //    var description = el.getAttribute("desc");
        _this.hide();
        //single camera
        this.cameraEl = cameraEl = document.querySelector('a-entity[camera]');
        if (!this.cameraEl) {
            this.cameraEl = document.querySelector('a-camera');
        };

        this.cameraEl.addEventListener('componentchanged', function(evt) {
            if (evt.detail.name === 'rotation') {
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
            silence();
        });

    },

    show: function() {
        this.el.setAttribute('scale', '1 1 1');
    },

    hide: function() {
        this.el.setAttribute('scale', '0.03 0.03 0.03');
    },

    tick: function() {
        var newPos = new THREE.Vector3();
        newPos.setFromMatrixPosition(this.cameraEl.object3D.matrixWorld);
        this.el.setAttribute('position', newPos.x + ' 0 ' + newPos.z);
    }
});

// a11y script comes last
AFRAME.registerComponent('a11y', {
    schema: {
        hearing: { default: false }, // speech to text and captions
        vision: { default: { noVision: false, dmmFactor: 0, contrast: 0 } },
        motion: {type:'vec2', default: { shades: 0, blink: 0 } },
        mobility: { default: false },
    },
    init: function() {
        var _this = this;
        var el = this.el;
        var data = this.data;
        data.motion.shades = data.motion.x;
        //Convert vector schema data into boolean.
        if(data.motion.y === 0){data.motion.blink = false;}else{data.motion.blink = true;};
        this.blinked = false;
        this.position = {
            yaw: 0,
            pitch: 0,
            roll: 0
        }

        this.el.addEventListener("motion-sickness", () => {
            //for motion sickness vestibular disorder
        });

        if (data.motion.blink) { //
            //add speed shutters triggered by function 'blink' & 'unblink'
            var lid = document.createElement("a-entity");
            lid.setAttribute('geometry', `primitive: sphere; radius:0.1;  phiStart:90; phiLength:180;`);
            lid.setAttribute('material', `shader: flat; color:#000; side:back;`);
            lid.setAttribute('rotation', `-90 0 -90`);
            lid.setAttribute('position', `0 0 0`);
            lid.setAttribute('id', `eyelids`);
            this.el.appendChild(lid);

            var lidAniClose1 = document.createElement("a-animation");
            lidAniClose1.setAttribute('attribute', 'geometry.phiStart');
            lidAniClose1.setAttribute('begin', 'blink');
            lidAniClose1.setAttribute('from', '90');
            lidAniClose1.setAttribute('to', '0');
            lidAniClose1.setAttribute('dur', '200');
            lid.appendChild(lidAniClose1);
            var lidAniClose2 = document.createElement("a-animation");
            lidAniClose2.setAttribute('attribute', 'geometry.phiLength');
            lidAniClose2.setAttribute('begin', 'blink');
            lidAniClose2.setAttribute('from', '180');
            lidAniClose2.setAttribute('to', '360');
            lidAniClose2.setAttribute('dur', '200');
            lid.appendChild(lidAniClose2);

            var lidAniOpen1 = document.createElement("a-animation");
            lidAniOpen1.setAttribute('attribute', 'geometry.phiStart');
            lidAniOpen1.setAttribute('begin', 'unblink');
            lidAniOpen1.setAttribute('from', '0');
            lidAniOpen1.setAttribute('to', '90');
            lidAniOpen1.setAttribute('dur', '0');
            lid.appendChild(lidAniOpen1);
            var lidAniopen2 = document.createElement("a-animation");
            lidAniopen2.setAttribute('attribute', 'geometry.phiLength');
            lidAniopen2.setAttribute('begin', 'unblink');
            lidAniopen2.setAttribute('from', '360');
            lidAniopen2.setAttribute('to', '180');
            lidAniopen2.setAttribute('dur', '0');
            lid.appendChild(lidAniopen2);

            //add metatag
        }

        if (data.motion.shades != 0) {
            var canvas = this.canvas = document.createElement('canvas');
            canvas.id = "gradient";
            canvas.width = 32;
            canvas.height = 32;
            canvas.style.display = "none";
            var ctx = this.ctx = canvas.getContext("2d");
            var grd = ctx.createLinearGradient(0, 0, 0, 32);
            var shadeStrength = 1 - data.motion.shades; // 0.65
            grd.addColorStop(0, "rgba(0,0,0,0)");
            grd.addColorStop(shadeStrength, "rgba(0,0,0,1)");
            grd.addColorStop(0.65, "rgba(0,0,0,1)");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 32, 32);
            document.body.appendChild(canvas);

            var cylinder = document.createElement("a-entity");
            cylinder.setAttribute('geometry', `primitive: cylinder; radius:0.25; height:0.5; segmentsRadial:64; openEnded:true`);
            cylinder.setAttribute('material', `shader: flat; src: #${canvas.id}; transparent: true; opacity: 1; side:back;`);
            cylinder.setAttribute('rotation', `-90 0 0`);
            cylinder.setAttribute('position', `0 0 -0.25`);
            cylinder.setAttribute('id', `cylinder`);
            this.el.appendChild(cylinder);
        }
        if (data.vision.noVision) {
            //for visually blind
            //add audio features
        }
        if (data.vision.dmmFactor != 0) {
            //for visually impared
            //increase font-size dmm by factor value
        }
        if (data.vision.contrast != 0) {
            //for color blindness
            //add post process filter increasing contrast level by value
        }
        if (data.hearing) {
            //for people with bad hearing

            var srtCaps = document.createElement("a-entity");
            srtCaps.setAttribute('geometry', `primitive: plane; width:1; height:0.25;`);
            srtCaps.setAttribute('material', `shader:flat; side:front; color:#000; opacity:0.5; transparent:true;`);
            srtCaps.setAttribute('rotation', `-30 0 0`);
            srtCaps.setAttribute('position', `0 -0.5 -1`);
            this.el.appendChild(srtCaps);
        }
        if (data.mobility) {
            //add navigation motion and selectability

            var nav = document.createElement("a-entity");
            nav.setAttribute('geometry', `primitive: plane; width:1; height:1;`);
            nav.setAttribute('material', `shader:flat; side:back; color:#fff;`);
            nav.setAttribute('rotation', `0 0 0`);
            nav.setAttribute('scale', `5 5 5`);
            nav.setAttribute('position', `0 0 -0.5`);
            this.el.appendChild(nav);
            this.nav = nav;
            
            var move = document.createElement("a-entity");
            move.setAttribute('geometry', `primitive: plane; width:0.06; height:0.06;`);
            move.setAttribute('material', `shader:flat; side:back; color:#fff;`);
            move.setAttribute('rotation', `-75 0 0`);
            move.setAttribute('position', `0 -0.08 -0.2`);
            nav.appendChild(move);
            //END
            var forwardArrow = document.createElement("a-gui-icon-button");
            forwardArrow.setAttribute('height', `0.75`);
            forwardArrow.setAttribute('onclick', `moveForwardFunction`);
            forwardArrow.setAttribute('icon', `chevron-up`);
            forwardArrow.setAttribute('scale', `0.0225 0.0225 0.0225`);
            forwardArrow.setAttribute('rotation', `0 0 0`);
            forwardArrow.setAttribute('margin', `0 0 0`);
            forwardArrow.setAttribute('position', `0 0.0175 0.001`);
            forwardArrow.setAttribute('font-color', `#000`);
            forwardArrow.setAttribute('border-color', `#f5f5f5`);
            forwardArrow.setAttribute('background-color', `#fff`);
            move.appendChild(forwardArrow);
            var backwardArrow = document.createElement("a-gui-icon-button");
            backwardArrow.setAttribute('height', `0.75`);
            backwardArrow.setAttribute('onclick', `moveBackwardFunction`);
            backwardArrow.setAttribute('icon', `chevron-down`);
            backwardArrow.setAttribute('scale', `0.0225 0.0225 0.0225`);
            backwardArrow.setAttribute('rotation', `0 0 0`);
            backwardArrow.setAttribute('margin', `0 0 0`);
            backwardArrow.setAttribute('position', `0 -0.0175 0.001`);
            backwardArrow.setAttribute('font-color', `#000`);
            backwardArrow.setAttribute('border-color', `#f5f5f5`);
            backwardArrow.setAttribute('background-color', `#fff`);
            move.appendChild(backwardArrow);
            var leftArrow = document.createElement("a-gui-icon-button");
            leftArrow.setAttribute('height', `0.75`);
            leftArrow.setAttribute('onclick', `moveLeftFunction`);
            leftArrow.setAttribute('icon', `chevron-left`);
            leftArrow.setAttribute('scale', `0.0225 0.0225 0.0225`);
            leftArrow.setAttribute('rotation', `0 0 0`);
            leftArrow.setAttribute('margin', `0 0 0`);
            leftArrow.setAttribute('position', `-0.0175 0 0.001`);
            leftArrow.setAttribute('font-color', `#000`);
            leftArrow.setAttribute('border-color', `#f5f5f5`);
            leftArrow.setAttribute('background-color', `#fff`);
            move.appendChild(leftArrow);
            var rightArrow = document.createElement("a-gui-icon-button");
            rightArrow.setAttribute('height', `0.75`);
            rightArrow.setAttribute('onclick', `moveRightFunction`);
            rightArrow.setAttribute('icon', `chevron-right`);
            rightArrow.setAttribute('scale', `0.0225 0.0225 0.0225`);
            rightArrow.setAttribute('rotation', `0 0 0`);
            rightArrow.setAttribute('margin', `0 0 0`);
            rightArrow.setAttribute('position', `0.0175 0 0.0015`);
            rightArrow.setAttribute('font-color', `#000`);
            rightArrow.setAttribute('border-color', `#f5f5f5`);
            rightArrow.setAttribute('background-color', `#fff`);
            move.appendChild(rightArrow);
            var upArrow = document.createElement("a-gui-icon-button");
            upArrow.setAttribute('height', `0.75`);
            upArrow.setAttribute('onclick', `moveUpFunction`);
            upArrow.setAttribute('icon', `chevron-up`);
            upArrow.setAttribute('scale', `0.02 0.02 0.02`);
            upArrow.setAttribute('rotation', `75 0 0`);
            upArrow.setAttribute('margin', `0 0 0`);
            upArrow.setAttribute('position', `-0.04 0 0.02`);
            upArrow.setAttribute('font-color', `#000`);
            upArrow.setAttribute('border-color', `#f5f5f5`);
            upArrow.setAttribute('background-color', `#fff`);
            move.appendChild(upArrow);
            var downArrow = document.createElement("a-gui-icon-button");
            downArrow.setAttribute('height', `0.75`);
            downArrow.setAttribute('onclick', `moveDownFunction`);
            downArrow.setAttribute('icon', `chevron-down`);
            downArrow.setAttribute('scale', `0.02 0.02 0.02`);
            downArrow.setAttribute('rotation', `75 0 0`);
            downArrow.setAttribute('margin', `0 0 0`);
            downArrow.setAttribute('position', `-0.04 0 0`);
            downArrow.setAttribute('font-color', `#000`);
            downArrow.setAttribute('border-color', `#f5f5f5`);
            downArrow.setAttribute('background-color', `#fff`);
            move.appendChild(downArrow);

            var pitch = document.createElement("a-entity");
            pitch.setAttribute('geometry', `primitive: plane; width:0.06; height:0.06;`);
            pitch.setAttribute('material', `shader:flat; side:back; color:#000;`);
            pitch.setAttribute('rotation', `-15 -75 0`);
            pitch.setAttribute('position', `0.039 -0.085 -0.205`);
            nav.appendChild(pitch);
            var rightPitchTurn = document.createElement("a-gui-icon-button");
            rightPitchTurn.setAttribute('height', `0.5`);
            rightPitchTurn.setAttribute('onclick', `pitchRightFunction`);
            rightPitchTurn.setAttribute('icon', `ios-redo`);
            rightPitchTurn.setAttribute('scale', `0.0275 0.0275 0.0275`);
            rightPitchTurn.setAttribute('rotation', `0 0 -45`);
            rightPitchTurn.setAttribute('margin', `0 0 0`);
            rightPitchTurn.setAttribute('position', `0.0175 0.0335 0.001`);
            rightPitchTurn.setAttribute('font-color', `#000`);
            rightPitchTurn.setAttribute('border-color', `#f5f5f5`);
            rightPitchTurn.setAttribute('background-color', `#fff`);
            pitch.appendChild(rightPitchTurn);
            var leftPitchTurn = document.createElement("a-gui-icon-button");
            leftPitchTurn.setAttribute('height', `0.5`);
            leftPitchTurn.setAttribute('onclick', `pitchLeftFunction`);
            leftPitchTurn.setAttribute('icon', `ios-undo`);
            leftPitchTurn.setAttribute('scale', `0.0275 0.0275 0.0275`);
            leftPitchTurn.setAttribute('rotation', `0 0 45`);
            leftPitchTurn.setAttribute('margin', `0 0 0`);
            leftPitchTurn.setAttribute('position', `-0.0175 0.0335 0.001`);
            leftPitchTurn.setAttribute('font-color', `#000`);
            leftPitchTurn.setAttribute('border-color', `#f0f0f0`);
            leftPitchTurn.setAttribute('background-color', `#fff`);
            pitch.appendChild(leftPitchTurn);
            var rightpitchRing = document.createElement("a-ring");
            rightpitchRing.setAttribute('geometry', 'primitive:ring; radiusInner:0.03; radiusOuter:0.045; thetaStart:0; thetaLength:90;')
            rightpitchRing.setAttribute('material', 'shader:flat; side:front; color:#fff; opacity:0.5;');
            rightpitchRing.setAttribute('rotation', '0 0 0');
            rightpitchRing.setAttribute('position', '0 0 0');
            pitch.appendChild(rightpitchRing);
            var leftpitchRing = document.createElement("a-ring");
            leftpitchRing.setAttribute('geometry', 'primitive:ring; radiusInner:0.03; radiusOuter:0.045; thetaStart:90; thetaLength:90;')
            leftpitchRing.setAttribute('material', 'shader:flat; side:front; color:#fff; opacity:0.5;');
            leftpitchRing.setAttribute('rotation', '0 0 0');
            leftpitchRing.setAttribute('position', '0 0 0');
            pitch.appendChild(leftpitchRing);

            var roll = document.createElement("a-entity");
            roll.setAttribute('geometry', `primitive: plane; width:0.06; height:0.06;`);
            roll.setAttribute('material', `shader:flat; side:back; color:#000;`);
            roll.setAttribute('rotation', `0 0 0`);
            roll.setAttribute('position', `0 -0.085 -0.235`);
            nav.appendChild(roll);
            var rightRollTurn = document.createElement("a-gui-icon-button");
            rightRollTurn.setAttribute('height', `0.5`);
            rightRollTurn.setAttribute('onclick', `rollRightFunction`);
            rightRollTurn.setAttribute('icon', `ios-redo`);
            rightRollTurn.setAttribute('scale', `0.0275 0.0275 0.0275`);
            rightRollTurn.setAttribute('rotation', `0 0 -45`);
            rightRollTurn.setAttribute('margin', `0 0 0`);
            rightRollTurn.setAttribute('position', `0.0175 0.0335 0.001`);
            rightRollTurn.setAttribute('font-color', `#000`);
            rightRollTurn.setAttribute('border-color', `#f5f5f5`);
            rightRollTurn.setAttribute('background-color', `#fff`);
            roll.appendChild(rightRollTurn);
            var leftRollTurn = document.createElement("a-gui-icon-button");
            leftRollTurn.setAttribute('height', `0.5`);
            leftRollTurn.setAttribute('onclick', `rollLeftFunction`);
            leftRollTurn.setAttribute('icon', `ios-undo`);
            leftRollTurn.setAttribute('scale', `0.0275 0.0275 0.0275`);
            leftRollTurn.setAttribute('rotation', `0 0 45`);
            leftRollTurn.setAttribute('margin', `0 0 0`);
            leftRollTurn.setAttribute('position', `-0.0175 0.0335 0.001`);
            leftRollTurn.setAttribute('font-color', `#000`);
            leftRollTurn.setAttribute('border-color', `#f0f0f0`);
            leftRollTurn.setAttribute('background-color', `#fff`);
            roll.appendChild(leftRollTurn);
            var rightRollRing = document.createElement("a-ring");
            rightRollRing.setAttribute('geometry', 'primitive:ring; radiusInner:0.03; radiusOuter:0.045; thetaStart:0; thetaLength:90;')
            rightRollRing.setAttribute('material', 'shader:flat; side:front; color:#fff; opacity:0.5;');
            rightRollRing.setAttribute('rotation', '0 0 0');
            rightRollRing.setAttribute('position', '0 0 0');
            roll.appendChild(rightRollRing);
            var leftRollRing = document.createElement("a-ring");
            leftRollRing.setAttribute('geometry', 'primitive:ring; radiusInner:0.03; radiusOuter:0.045; thetaStart:90; thetaLength:90;')
            leftRollRing.setAttribute('material', 'shader:flat; side:front; color:#fff; opacity:0.5;');
            leftRollRing.setAttribute('rotation', '0 0 0');
            leftRollRing.setAttribute('position', '0 0 0');
            roll.appendChild(leftRollRing);

            var yaw = document.createElement("a-entity");
            yaw.setAttribute('geometry', `primitive: plane; width:0.06; height:0.06;`);
            yaw.setAttribute('material', `shader:flat; side:back; color:#000;`);
            yaw.setAttribute('rotation', `-105 180 0`);
            yaw.setAttribute('position', `0 -0.085 -0.185`);
            nav.appendChild(yaw);
            var rightYawTurn = document.createElement("a-gui-icon-button");
            rightYawTurn.setAttribute('height', `0.5`);
            rightYawTurn.setAttribute('onclick', `yawRightFunction`);
            rightYawTurn.setAttribute('icon', `ios-redo`);
            rightYawTurn.setAttribute('scale', `0.0275 0.0275 0.0275`);
            rightYawTurn.setAttribute('rotation', `0 0 -45`);
            rightYawTurn.setAttribute('margin', `0 0 0`);
            rightYawTurn.setAttribute('position', `0.0175 0.0335 0.001`);
            rightYawTurn.setAttribute('font-color', `#000`);
            rightYawTurn.setAttribute('border-color', `#f5f5f5`);
            rightYawTurn.setAttribute('background-color', `#fff`);
            yaw.appendChild(rightYawTurn);
            var leftYawTurn = document.createElement("a-gui-icon-button");
            leftYawTurn.setAttribute('height', `0.5`);
            leftYawTurn.setAttribute('onclick', `yawLeftFunction`);
            leftYawTurn.setAttribute('icon', `ios-undo`);
            leftYawTurn.setAttribute('scale', `0.0275 0.0275 0.0275`);
            leftYawTurn.setAttribute('rotation', `0 0 45`);
            leftYawTurn.setAttribute('margin', `0 0 0`);
            leftYawTurn.setAttribute('position', `-0.0175 0.0335 0.001`);
            leftYawTurn.setAttribute('font-color', `#000`);
            leftYawTurn.setAttribute('border-color', `#f0f0f0`);
            leftYawTurn.setAttribute('background-color', `#fff`);
            yaw.appendChild(leftYawTurn);
            var rightYawRing = document.createElement("a-ring");
            rightYawRing.setAttribute('geometry', 'primitive:ring; radiusInner:0.03; radiusOuter:0.045; thetaStart:0; thetaLength:90;')
            rightYawRing.setAttribute('material', 'shader:flat; side:front; color:#fff; opacity:0.5;');
            rightYawRing.setAttribute('rotation', '0 0 0');
            rightYawRing.setAttribute('position', '0 0 0');
            yaw.appendChild(rightYawRing);
            var leftYawRing = document.createElement("a-ring");
            leftYawRing.setAttribute('geometry', 'primitive:ring; radiusInner:0.03; radiusOuter:0.045; thetaStart:90; thetaLength:90;')
            leftYawRing.setAttribute('material', 'shader:flat; side:front; color:#fff; opacity:0.5;');
            leftYawRing.setAttribute('rotation', '0 0 0');
            leftYawRing.setAttribute('position', '0 0 0');
            yaw.appendChild(leftYawRing);
        }
    },
    update: function(oldData) {
        // Do something when component's data is updated.
    },
    remove: function() {
        // Do something the component or its entity is detached.
    },
    tick: function(time, timeDelta) {
        // Do something on every scene tick or frame.

        let radToDeg = THREE.Math.radToDeg;
        let unblinkTimer;
        //Locally Update Current Position
        let currentPos = {
            yaw: parseInt(roundNumber(radToDeg(this.el.object3D.getWorldRotation()._y), 2)),
            pitch: parseInt(roundNumber(radToDeg(this.el.object3D.getWorldRotation()._x), 2)),
            roll: parseInt(roundNumber(radToDeg(this.el.object3D.getWorldRotation()._z), 2))
        }

        //Only test velocity if head position changed. Or eyes closed. (Protects performance.)
        if (this.position.pitch !== currentPos.pitch || this.blinked) {
            //Test velocity of head movement
            let sicknessThreshPassed = measureVelocity(currentPos, this.position);
            //If velocity > threshold. Blink. Else, unblink.
            if (sicknessThreshPassed) {
                //Apply motion-sickness blink.
                clearTimeout(unblinkTimer);
                motionShading();
                this.blinked = true;
            } else {
                //Apply motion-sickness unblink.            
                unblinkTimer = setTimeout(() => {
                    removeMotionShading();
                    this.blinked = false;
                }, 500);
            }

            //Globally Update Current Position
            this.position = currentPos;
        }
    }
});




// var defaultCameraUserHeight; 
//   function addRenderStartListener () {
//     document.querySelector('a-scene').addEventListener('renderstart', function (evt) {
//       var camera = evt.detail.target.camera.el.components.camera;
//       defaultCameraUserHeight = camera.data.userHeight;
//     });
//   }
//  addRenderStartListener(); //document.body.addEventListener('DOMContentLoaded', addRenderStartListener);

/*
AFRAME.registerComponent('gravr-avatar', {
  schema: {
    color: {default: '#928DAB'},
    obj: {default: 'assets/basemesh.obj'},
    offsetPos: { type: 'vec3', default: {x:0, y:0, z:0.15} },
  },
  init: function () {
    var data = this.data;
    var el = this.el;
    var _this = this;

    this.userHeight = userHeight = 0; 
    this.sceneEl = sceneEl = document.querySelector('a-scene');

    //single camera
    this.cameraEl = cameraEl = document.querySelector('a-entity[camera]');
    if (!this.cameraEl) {
      this.cameraEl = document.querySelector('a-camera');
    } 
    
    var worldPos = new THREE.Vector3();
    worldPos.setFromMatrixPosition(this.cameraEl.object3D.matrixWorld);

    this.avatarContainer = avatarContainer = document.createElement("a-entity");
    avatarContainer.setAttribute('geometry', `primitive: box; width: 1; height: ${userHeight}; depth: 1;`);
    avatarContainer.setAttribute('material', 'shader: flat; opacity: 0; side:front; color: #fff');
    avatarContainer.setAttribute('position', `0 ${userHeight/2} 0`);
    avatarContainer.setAttribute('rotation', '0 0 0');
    avatarContainer.setAttribute('visible', 'false');
    el.appendChild(avatarContainer);

    this.avatarModel = avatarModel = document.createElement("a-obj-model");
    avatarModel.setAttribute('src', data.obj);
    avatarModel.setAttribute('position', `${data.offsetPos.x} -${userHeight/2} ${data.offsetPos.z}`);
    avatarModel.setAttribute('rotation', '0 180 0');
    avatarModel.setAttribute('color', data.color);
    avatarModel.setAttribute('scale', `1  ${userHeightConvert(userHeight)} 1`);
    avatarContainer.setAttribute('visible', 'false');
    avatarContainer.appendChild(avatarModel);

    this.cameraEl.addEventListener('loaded', function (evt) {    
      _this.userHeight = userHeight = _this.cameraEl.components.camera.data.userHeight;
      console.log('userHeight from cameraEl: '+ userHeight);
      _this.setupAvatarHeight(userHeight);
    });

    this.onEnterVR = this.onEnterVR.bind(this);
    this.onExitVR = this.onExitVR.bind(this);
    this.sceneEl.addEventListener('enter-vr', this.onEnterVR);
    this.sceneEl.addEventListener('exit-vr', this.onExitVR);

  },
  setupAvatarHeight: function (userHeight) {
    var data = this.data;

    avatarContainer.setAttribute('position', `0 ${userHeight/2} 0`);
    avatarContainer.setAttribute('geometry', `height: ${userHeight};`);
    avatarContainer.setAttribute('visible', 'true');

    avatarModel.setAttribute('position', `${data.offsetPos.x} -${userHeight/2} ${data.offsetPos.z}`);
    avatarModel.setAttribute('scale', `1  ${userHeightConvert(userHeight)} 1`);
    avatarContainer.setAttribute('visible', 'true');

  },
  onEnterVR: function () {

    var cameraEl = this.cameraEl;
    var userHeight = this.userHeight;

//------//add loop to check if there is tracked HMD height

    setTimeout(function(){
      cameraEl.setAttribute('position', 'y', userHeight);
    }, 100 );
    
  },
  onExitVR: function () {
    console.log("exiting VR with gravr-avatar");
  },
  tick: function () {   
    var avatarPos = new THREE.Vector3();
    avatarPos.setFromMatrixPosition(this.cameraEl.object3D.matrixWorld);
    var avatarRot = this.cameraEl.object3D.getWorldRotation();
    this.el.setAttribute('position', avatarPos.x + ' 0 ' + avatarPos.z);
    this.el.setAttribute("rotation", "0 " + radiansToDegrees(avatarRot.y) + " 0");
  }
});

*/