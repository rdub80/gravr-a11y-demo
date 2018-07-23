var sound1;
var sound1SourceElement;
var sound1Source = scene.createSource();

sound1 = document.createElement('audio');
sound1.src = '../sounds/market.wav';
sound1.crossOrigin = 'anonymous';
sound1.loop = true;
sound1.load();


window.onload=function(){
  document.getElementById("enter-vr").addEventListener("click", function(){   sound1.play();
    audioContext.resume();
  });
}


sound1SourceElement = audioContext.createMediaElementSource(sound1);
sound1Source.setGain(1);


sound1SourceElement.connect(sound1Source.input);


AFRAME.registerComponent('sound1', {
    init: function () {
      var isPlaying = false;
      this.el.addEventListener('click', function () {
        // sound1Source.setPosition(this.object3D.getWorldPosition().x, this.object3D.getWorldPosition().y, this.object3D.getWorldPosition().z);
          if(isPlaying==false){
            sound1.play();
            isPlaying=true;
          }else if(isPlaying==true){
            sound1.pause();
            isPlaying=false;
          }
      });
    },

    tick: function () {
      sound1Source.setPosition(this.el.object3D.getWorldPosition().x, this.el.object3D.getWorldPosition().y, this.el.object3D.getWorldPosition().z);
    }
  });
  
  