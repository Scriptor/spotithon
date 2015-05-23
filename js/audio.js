var context;
window.addEventListener('load', init, false);
function init() {
    try {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new AudioContext();
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
    
    this.oscillator.connect(this.gain);
    this.gain.connect(context.destination);
    
    this.gain.value = 0.2;
    
    this.oscillator[this.oscillator.start ? 'start' : 'noteOn'](0);
    
}