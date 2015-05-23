var context;
var loader;
var bufList;
var loadCb;
var cb;
window.addEventListener('load', init, false);
function init() {
    try {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new AudioContext();
        loader = new BufferLoader(context,
            ['sounds/cello.wav'],
            function(bl){
                bufList = bl;
            }
        );
        loader.load();
        // var snd = new Osc()
        // snd.toggle();
    } catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
}

function Osc() {
    this.isPlaying = false;  
}

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
                request.response,
                function(buffer) {
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }
                    loader.bufferList[index] = buffer;
                    if (++loader.loadCount == loader.urlList.length)
            loader.onload(loader.bufferList);
                },
                function(error) {
                    console.error('decodeAudioData error', error);
                }
                );
    }

    request.onerror = function() {
        alert('BufferLoader: XHR error');
    }

    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}

Osc.prototype.play = function() {
    //this.oscillator = context.createOscillator();
    this.filter = context.createBiquadFilter();
    this.gain = context.createGain();
    
    /*
    this.oscillator.type = "triangle";
    this.oscillator.frequency.value = 500;
    */
    this.filter.type = 'bandpass';
    this.filter.frequency.value = 500;
    this.filter.Q = 100;
    this.gain.value = 0.2;
    
    //this.oscillator.connect(this.filter);
    this.cello = context.createBufferSource();
    this.cello.buffer = bufList[0];
    this.cello.loop = true;
    this.cello.loopStart = 1;
    this.cello.loopEnd = 2.5;
    this.cello.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(context.destination);
    
    //this.oscillator[this.oscillator.start ? 'start' : 'noteOn'](0);
    this.cello.start(0);
    this.isPlaying = true;
}

Osc.prototype.stop = function() {
    this.isPlaying = false;
    this.gain.gain.setTargetAtTime(0, context.currentTime, 0.3);
    var temp = this;
    setTimeout(function(){
        //temp.oscillator.stop(0);
        //temp.oscillator.disconnect();
        temp.cello.stop(0);
        temp.cello.disconnect();
        temp.filter.disconnect();
        temp.gain.disconnect();
    }, 3000);    
}

Osc.prototype.toggle = function() {
  (this.isPlaying ? this.stop() : this.play());
  this.isPlaying = !this.isPlaying;

};

Osc.prototype.changeFreq = function(freq) {
    //this.oscillator.frequency.value = freq;
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

Osc.prototype.setRate = function(pbrate){
    if(pbrate <= 0.2) {pbrate = 0.2;}
    if(pbrate >= 2.5) {pbrate = 2.5;}

    this.cello.playbackRate.value = pbrate;
}
