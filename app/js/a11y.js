AFRAME.registerComponent('a11y', {
    schema: {
        hearing: { default: false }, // speech to text and captions
        vision: {type:'vec3', default: { noVision: 0, dmmFactor: 0, contrast: 0 } },
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
            console.log("shadeStrength "+shadeStrength);
            grd.addColorStop(0, "rgba(0,0,0,0)");
            grd.addColorStop(shadeStrength, "rgba(0,0,0,1)");
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
