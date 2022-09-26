function selectAdd() {
    document.querySelectorAll('fieldset.Add').forEach(input => {
    input.disabled = false;
    }) 
    document.querySelectorAll('fieldset.AM').forEach(input => {
    input.disabled = true;
    })
    document.querySelectorAll('fieldset.FM').forEach(input => {
    input.disabled = true;
    })
}

function selectAM(){
    document.querySelectorAll('fieldset.Add').forEach(input => {
    input.disabled = true;
    }) 
    document.querySelectorAll('fieldset.AM').forEach(input => {
    input.disabled = false;
    })
    document.querySelectorAll('fieldset.FM').forEach(input => {
    input.disabled = true;
    })
}

function selectFM(){
    document.querySelectorAll('fieldset.Add').forEach(input => {
    input.disabled = true;
    }) 
    document.querySelectorAll('fieldset.AM').forEach(input => {
    input.disabled = true;
    })
    document.querySelectorAll('fieldset.FM').forEach(input => {
    input.disabled = false;
    })
}

var partialNum = 1
function selectPartial(){
partialNum = document.getElementById("partials").value;
}

document.addEventListener("DOMContentLoaded", function(event) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
    }

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    activeOscillator = {};
    activeGainNode = {};
    activeAddGain = {};

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillator[key]) {
            initAdd(key);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillator[key]) {
            stopAdd(key);
        }
    }

    function initAdd(key){
        const fundOsc = audioCtx.createOscillator();
        fundOsc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);
        const gain = audioCtx.createGain();
        fundOsc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0,audioCtx.currentTime);
        const addgain = audioCtx.createGain();
        addgain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        addgain.connect(gain);
        keyFreq = keyboardFrequencyMap[key];
        for (i = 0; i < partialNum; i++) {
            keyFreq = keyFreq * 2;
            osc = audioCtx.createOscillator();
            osc.frequency.setValueAtTime(keyFreq, audioCtx.currentTime);
            osc.connect(addgain);
            osc.start();
        }
        fundOsc.start();
        const nodeNum = Object.keys(key).length;
        Object.keys(key).forEach(function(key) {
            gain.gain.linearRampToValueAtTime(0.8/nodeNum, audioCtx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.6/nodeNum, audioCtx.currentTime + 0.2);
        });
        activeOscillator[key] = fundOsc;
        activeGainNode[key] = gain;
        activeAddGain[key] = addgain;
    }
        
    function stopAdd(key) {
        activeGainNode[key].gain.cancelScheduledValues(audioCtx.currentTime);
        activeGainNode[key].gain.setValueAtTime(activeGainNode[key].gain.value, audioCtx.currentTime);
        activeGainNode[key].gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        activeGainNode[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        activeOscillator[key].stop(audioCtx.currentTime + 0.15);
        delete activeOscillator[key];
        delete activeGainNode[key];
        delete activeAddGain[key];
    }
    
    function initAM(key) {}
    function stopAM(key) {}
    function initFM(key) {}
    function stopFM(key) {}
})

