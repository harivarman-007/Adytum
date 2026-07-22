// Procedural Web Audio Ambient Soundscape for Adytum Sanctuary
// Synthesizes soothing ocean wave wind drones, singing bowls, and tactile chimes entirely client-side.

let audioCtx: AudioContext | null = null;
let droneNode: BiquadFilterNode | null = null;
let noiseNode: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let bellInterval: number | null = null;
let lfoInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generates an AudioBuffer containing white noise
function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Triggers a deep, resonant Tibetan/Greek singing bowl sound for meditation
export function playSingingBowlSound(baseFreq: number = 280, durationSeconds: number = 5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterBowlGain = ctx.createGain();
    masterBowlGain.gain.setValueAtTime(0, now);
    masterBowlGain.gain.linearRampToValueAtTime(0.08, now + 0.2); // Smooth swell
    masterBowlGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);
    masterBowlGain.connect(ctx.destination);

    // Fundamental & subtle harmonic overtones for rich metallic bowl resonance
    const partials = [
      { ratio: 1.0, gain: 0.5 },
      { ratio: 2.76, gain: 0.2 },
      { ratio: 5.4, gain: 0.08 },
      { ratio: 8.9, gain: 0.03 }
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      // Add gentle pitch bend/vibrato for organic warmth
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 3.5; // 3.5 Hz subtle wobble
      lfoGain.gain.value = 1.2;
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + durationSeconds);

      oscGain.gain.setValueAtTime(p.gain, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

      osc.connect(oscGain);
      oscGain.connect(masterBowlGain);

      osc.start(now);
      osc.stop(now + durationSeconds + 0.1);
    });
  } catch (e) {
    console.error("Failed to play singing bowl:", e);
  }
}

// Triggers a soft, tactile stone click sound for UI feedback
export function playStoneClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    // Ignore sound playback errors
  }
}

// Triggers a soft paper page turn sound effect
export function playPageTurnSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const bufferSource = ctx.createBufferSource();
    bufferSource.buffer = createNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    bufferSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    bufferSource.start(now);
    bufferSource.stop(now + 0.13);
  } catch (e) {
    // Ignore audio error
  }
}

// Triggers a beautiful, resonant, quiet temple chime
export function playTempleBell() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic partials of a classic meditative metal bell
    const frequencies = [220, 442, 554, 660, 880, 1200];
    const gains = [0.3, 0.15, 0.1, 0.08, 0.05, 0.02];

    const masterBellGain = ctx.createGain();
    masterBellGain.gain.setValueAtTime(0, now);
    masterBellGain.gain.linearRampToValueAtTime(0.04, now + 0.05); // Very soft bell
    masterBellGain.gain.exponentialRampToValueAtTime(0.0001, now + 8); // Long ring
    masterBellGain.connect(ctx.destination);

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = "sine";
      // Add slight detune for a rich, warm, authentic timbre
      osc.frequency.setValueAtTime(freq + (Math.random() * 4 - 2), now);

      oscGain.gain.setValueAtTime(gains[index], now);
      // High partials decay much faster
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + (6 / (index + 1)));

      osc.connect(oscGain);
      oscGain.connect(masterBellGain);

      osc.start(now);
      osc.stop(now + 8.5);
    });
  } catch (e) {
    console.error("Failed to play temple bell:", e);
  }
}

// Starts the continuous, meditative "Ancient Grove" ocean wave wind drone
export function startSanctuaryDrone() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (noiseNode) {
      // Already running
      return;
    }

    // 1. Create a gain node to control overall volume of the drone
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 3); // Slow fade-in of background grove

    // 2. Create the white noise source
    noiseNode = ctx.createBufferSource();
    noiseNode.buffer = createNoiseBuffer(ctx);
    noiseNode.loop = true;

    // 3. Create a lowpass filter with high resonance to model wind / waves
    droneNode = ctx.createBiquadFilter();
    droneNode.type = "lowpass";
    droneNode.Q.setValueAtTime(3.5, now);
    droneNode.frequency.setValueAtTime(280, now);

    // Connect source -> filter -> gain -> destination
    noiseNode.connect(droneNode);
    droneNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Start playing
    noiseNode.start(0);

    // 4. Low-Frequency Modulation (LFO) simulated via interval to sweep the filter frequency
    // This creates a swelling "inhale/exhale" ocean/wind breathing wave
    let timeAngle = 0;
    lfoInterval = window.setInterval(() => {
      if (droneNode && ctx.state !== "suspended") {
        timeAngle += 0.05;
        // Sweep frequency slowly between 160Hz and 360Hz
        const sweepFreq = 260 + Math.sin(timeAngle) * 100;
        droneNode.frequency.setTargetAtTime(sweepFreq, ctx.currentTime, 0.15);
      }
    }, 100);

    // 5. Periodically ring a distant temple bell (every 22-35 seconds)
    playTempleBell(); // Initial bell
    bellInterval = window.setInterval(() => {
      // Ring the bell on a gentle random variation
      if (Math.random() > 0.3) {
        playTempleBell();
      }
    }, 25000);

  } catch (e) {
    console.error("Failed to start sanctuary drone:", e);
  }
}

// Fades out and stops the ambient soundscape
export function stopSanctuaryDrone() {
  try {
    if (lfoInterval) {
      clearInterval(lfoInterval);
      lfoInterval = null;
    }
    if (bellInterval) {
      clearInterval(bellInterval);
      bellInterval = null;
    }

    if (gainNode && audioCtx) {
      const now = audioCtx.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 2); // Slow, elegant fade out

      const currentNoiseNode = noiseNode;
      const currentGainNode = gainNode;

      noiseNode = null;
      gainNode = null;
      droneNode = null;

      setTimeout(() => {
        try {
          if (currentNoiseNode) {
            currentNoiseNode.stop();
            currentNoiseNode.disconnect();
          }
          if (currentGainNode) {
            currentGainNode.disconnect();
          }
        } catch (e) {
          // Ignore if already stopped/disconnected
        }
      }, 2100);
    }
  } catch (e) {
    console.error("Failed to stop sanctuary drone:", e);
  }
}

// Triggers a subtle tactile quill stroke audio sound on keystrokes
export function playQuillStrokeSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const baseFreq = 340 + Math.random() * 160;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.035);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  } catch (e) {
    // Ignore audio context errors
  }
}

