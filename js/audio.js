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
    this.filter = context.createBiquadFilter();
    this.gain = context.createGain();
    
    this.oscillator.type = "triangle";
    this.oscillator.frequency.value = 500;
    this.filter.type = 'bandpass';
    this.filter.frequency.value = 500;
    this.filter.Q = 100;
    this.gain.value = 0.2;
    
    this.oscillator.connect(this.filter);
    this.filter.connect(this.gain);
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
        temp.filter.disconnect();
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
Osc.prototype.changeFilterFreq = function(freq) {
    this.filter.frequency.value = freq;
}

Osc.prototype.filterSweep = function(freq) {
    this.filter.frequency.setTargetAtTime(freq, context.currentTime, 0.3);
}

Osc.prototype.setGain = function(gain) {
    this.gain.value = gain;
}
