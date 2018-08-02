
var compass_playback=false;
var sceneEl,on_text,off_text,last_state;



AFRAME.registerComponent('rotation-reader', {
  
    tick: function () {
        var lastPos = "";
        var lastNeg = "";
        //Clockwise Rotation 
        function getCardinalNeg(angle) {
            //easy to customize by changing the number of directions you have 
            var directions = 8;
            
            var degree = 360 / directions;
            angle = angle + degree/2;
     

            if (angle >= 0 * degree && angle < 1 * degree)
                return "N";
            if (angle >= 1 * degree && angle < 2 * degree)
                return "NE";
            if (angle >= 2 * degree && angle < 3 * degree)
                return "E";
            if (angle >= 3 * degree && angle < 4 * degree)
                return "SE";
            if (angle >= 4 * degree && angle < 5 * degree)
                return "S";
            if (angle >= 5 * degree && angle < 6 * degree)
                return "SW";
            if (angle >= 6 * degree && angle < 7 * degree)
                return "W";
            if (angle >= 7 * degree && angle < 8 * degree)
                return "NW";
            //Should never happen: 
            return "N";
        }
        //Counter-Clockwise Rotation
        function getCardinalPos(angle) {
            //easy to customize by changing the number of directions you have 
            var directions = 8;
            
            var degree = 360 / directions;
            angle = angle + degree/2;

     
            if (angle >= 0 * degree && angle < 1 * degree)
                return "N";
            if (angle >= 1 * degree && angle < 2 * degree)
                return "NW";
            if (angle >= 2 * degree && angle < 3 * degree)
                return "W";
            if (angle >= 3 * degree && angle < 4 * degree)
                return "SW";
            if (angle >= 4 * degree && angle < 5 * degree)
                return "S";
            if (angle >= 5 * degree && angle < 6 * degree)
                return "SE";
            if (angle >= 6 * degree && angle < 7 * degree)
                return "E";
            if (angle >= 7 * degree && angle < 8 * degree)
                return "NE";
            //Should never happen: 
            return "N";
        }

        var compass_data = this.el.getAttribute('rotation').x;
        var r = this.el.getAttribute('rotation').y;
      
        r = Math.floor(r);
            //Counter Clockwise movement
            if(Math.sign(r)==1){  
                r = r - (Math.floor(r/360)*360);
                if(lastPos != getCardinalPos(r)){
                    lastPos =  getCardinalPos(r);
                    // compass(getCardinalPos(r));
                }   
            
            //Clockwise movement
            } else if(Math.sign(r)==-1){
                if(r>-360){
                    if(lastPos !=getCardinalNeg(r)){
                        lastPos = getCardinalNeg(Math.abs(r));
                        // compass(lastPos);
                    }
                } else {
                    r = r - Math.round(r/360)*360;
                    if(r  !=getCardinalNeg(r)){
                        lastNeg = getCardinalNeg(Math.abs(r));
                        // compass(lastNeg);
                    }   
                }   
            }
        
    }
});


var last_input = "";
var west;
var westSourceElement;
var westSource = soundScene.createSource();
west = document.createElement('audio');
west.src = '../sounds/west.mp3';
west.crossOrigin = 'anonymous';
west.load();
westSourceElement = audioContext.createMediaElementSource(west);
westSource.setGain(.51);
westSourceElement.connect(westSource.input);

var south;
var southSourceElement;
var southSource = soundScene.createSource();
south = document.createElement('audio');
south.src = '../sounds/south.mp3';
south.crossOrigin = 'anonymous';
south.load();
southSourceElement = audioContext.createMediaElementSource(south);
southSource.setGain(.51);
southSourceElement.connect(southSource.input);


var east;
var eastSourceElement;
var eastSource = soundScene.createSource();
east = document.createElement('audio');
east.src = '../sounds/east.mp3';
east.crossOrigin = 'anonymous';
east.load();
eastSourceElement = audioContext.createMediaElementSource(east);
eastSource.setGain(.51);
eastSourceElement.connect(eastSource.input);


var north;
var northSourceElement;
var northSource = soundScene.createSource();
north = document.createElement('audio');
north.src = '../sounds/north.mp3';
north.crossOrigin = 'anonymous';
north.load();
northSourceElement = audioContext.createMediaElementSource(north);
northSource.setGain(.51);
northSourceElement.connect(northSource.input);


function eastStop(){
    east.pause();
    east.currentTime=0;
}

function northStop(){
  north.pause();
  north.currentTime=0;
}

function southStop(){
  south.pause();
  south.currentTime=0;
}

function westStop(){
  west.pause();
  west.currentTime=0;
}


fu


window.addEventListener('load',
    function() {
         sceneEl = document.querySelector('a-scene');
         on_text = sceneEl.querySelector('#compass_on');
         off_text = sceneEl.querySelector('#compass_off');
    }, false);



function compass(input) {
  if(input!=last_input){
    if(input=="N"){
        eastStop();
        southStop();
        westStop();
        north.play();
  


    }else if(input=="S"){
        eastStop();
        northStop();
        westStop();

        south.play();

    } if(input=="W"){
        eastStop();
        northStop();
        southStop();
        west.play();

    } if(input=="E"){
        northStop();
        southStop();
        westStop();
        east.play();
    }
     last_input=input;
  }
}

