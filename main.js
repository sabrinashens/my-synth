synthChoice = "add";
keyPress = [];

function selectAdd() {
    synthChoice = "add";
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
    synthChoice = "am";
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
	synthChoice = "fm";
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

var modAMFreq = 100;
function updateAMFreq(val) {
	modAMFreq = val;
    for (k in keyPress) {
    activeAMFreq[keyPress[k]].frequency.value = val;
    } 
}

var modFMFreq = 100;
function updateFMFreq(val) {
	modFMFreq = val;
    for (k in keyPress) {
        activeFMFreq[keyPress[k]].frequency.value = val;
    }
}

var modFMInd = 100;
function updateFMIndex(val) {
	modFMInd = val;
	for (k in keyPress) {
  	activeIndex[keyPress[k]].gain.value = val;
    }
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
    activeModulated = {};
    activeDepth = {};
    activeAMFreq = {};
    activeFMFreq = {};
    activeIndex = {};

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillator[key]) {
		  if (synthChoice === "add") {
          initAdd(key);
          }
          else if (synthChoice === "am") {
          initAM(key);
          }
          else if (synthChoice === "fm") {
          initFM(key);
          }
        keyPress.push(key,);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillator[key]) {
		  if (synthChoice === "add") {
          stopAdd(key);
          }
          else if (synthChoice === "am") {
          stopAM(key);
          }
          else if (synthChoice === "fm") {
          stopFM(key);
          }
        keyPress.shift();
        }
    }

    function initAdd(key){
        var fundOsc = audioCtx.createOscillator();
        fundOsc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);
        
        const gain = audioCtx.createGain();
        const addgain = audioCtx.createGain();

        fundOsc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0,audioCtx.currentTime);
        
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
    

    function initAM(key) {
        var carrier = audioCtx.createOscillator();
        var modulatorFreq = audioCtx.createOscillator();
        modulatorFreq.frequency.value = modAMFreq;
        carrier.frequency.value = keyboardFrequencyMap[key];

        const modulated = audioCtx.createGain();
        const depth = audioCtx.createGain();
        depth.gain.value = 0.5
        modulated.gain.value = 1.0 - depth.gain.value; 
        
        modulatorFreq.connect(depth).connect(modulated.gain); 
        carrier.connect(modulated)
        modulated.connect(audioCtx.destination);
        modulated.gain.setValueAtTime(0,audioCtx.currentTime);
        carrier.start();
        modulatorFreq.start();
        const nodeNum = Object.keys(key).length;
        Object.keys(key).forEach(function(key) {
            modulated.gain.linearRampToValueAtTime(0.8/nodeNum, audioCtx.currentTime + 0.1);
            modulated.gain.exponentialRampToValueAtTime(0.6/nodeNum, audioCtx.currentTime + 0.2);
        })
        
        activeOscillator[key] = carrier;
        activeAMFreq[key] = modulatorFreq;
        activeModulated[key] = modulated;
        activeDepth[key] = depth;
    }
       
    function stopAM(key) {
    	activeModulated[key].gain.cancelScheduledValues(audioCtx.currentTime);
        activeModulated[key].gain.setValueAtTime(activeModulated[key].gain.value, audioCtx.currentTime);
        activeModulated[key].gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        activeModulated[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        
        activeDepth[key].gain.cancelScheduledValues(audioCtx.currentTime);
        activeDepth[key].gain.setValueAtTime(activeDepth[key].gain.value, audioCtx.currentTime);
        activeDepth[key].gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        activeDepth[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        activeOscillator[key].stop(audioCtx.currentTime + 0.15);
        activeAMFreq[key].stop(audioCtx.currentTime + 0.15);

        delete activeOscillator[key];
        delete activeAMFreq[key];
        delete activeModulated[key];
        delete activeDepth[key];
    }
    

    function initFM(key) {
        var carrier = audioCtx.createOscillator();
        var modulatorFreq = audioCtx.createOscillator();
        
        const modulationIndex = audioCtx.createGain();
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0,audioCtx.currentTime);
        carrier.frequency.value = keyboardFrequencyMap[key];
        modulationIndex.gain.value = modFMInd;
        modulatorFreq.frequency.value = modFMFreq;

        modulatorFreq.connect(modulationIndex);
        modulationIndex.connect(carrier.frequency)
        carrier.connect(gain).connect(audioCtx.destination);

        carrier.start();
        modulatorFreq.start();
        const nodeNum = Object.keys(key).length;
        Object.keys(key).forEach(function(key) {
            gain.gain.linearRampToValueAtTime(0.8/nodeNum, audioCtx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.6/nodeNum, audioCtx.currentTime + 0.2);
        });
        
        activeOscillator[key] = carrier;
        activeFMFreq[key] = modulatorFreq;
        activeGainNode[key] = gain;
        activeIndex[key] = modulationIndex;
    }
    
    function stopFM(key) {
        activeGainNode[key].gain.cancelScheduledValues(audioCtx.currentTime);
        activeGainNode[key].gain.setValueAtTime(activeGainNode[key].gain.value, audioCtx.currentTime);
        activeGainNode[key].gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        activeGainNode[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        
        activeIndex[key].gain.cancelScheduledValues(audioCtx.currentTime);
        activeIndex[key].gain.setValueAtTime(activeIndex[key].gain.value, audioCtx.currentTime);
        activeIndex[key].gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        activeIndex[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
        activeOscillator[key].stop(audioCtx.currentTime + 0.15);
        activeFMFreq[key].stop(audioCtx.currentTime + 0.15);
        
        delete activeOscillator[key];
        delete activeFMFreq[key];
        delete activeGainNode[key];
        delete activeIndex[key];
    }
})