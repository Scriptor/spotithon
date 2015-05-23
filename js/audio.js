var context;
window.addEventListener('load', init, false);
function init() {
    try {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new AudioContext();
        // var snd = new Osc()
        // snd.toggle();
    } catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
}

function Osc() {
    this.isPlaying = false;  
}

Osc.prototype.play = function() {
    this.oscillator = context.createOscillator();
    this.gain = context.createGain();
    
    this.oscillator.type = "triangle";
    this.oscillator.frequency.value = 500;
    this.gain.value = 0.2;
    
    this.oscillator.connect(this.gain);
    this.gain.connect(context.destination);
    
    this.oscillator[this.oscillator.start ? 'start' : 'noteOn'](0);
    this.isPlaying = true;
}

Osc.prototype.stop = function() {
    this.isPlaying = false;
    this.gain.gain.setTargetAtTime(0, context.currentTime, 0.3);
    var temp = this;
    setTimeout(function(){
        temp.oscillator.stop(0);
        temp.oscillator.disconnect();
        temp.gain.disconnect();
    }, 3000);    
}

Osc.prototype.toggle = function() {
  (this.isPlaying ? this.stop() : this.play());
  this.isPlaying = !this.isPlaying;

};

Osc.prototype.changeFreq = function(freq) {
    this.oscillator.frequency.value = freq;
}
