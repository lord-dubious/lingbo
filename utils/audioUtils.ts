
export function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function pcmToAudioBuffer(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) {
  let adjData = data;
  if (data.byteLength % 2 !== 0) {
    const newData = new Uint8Array(data.byteLength + 1);
    newData.set(data);
    adjData = newData;
  }

  const dataInt16 = new Int16Array(adjData.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let globalAudioCtx: AudioContext | null = null;
export const getAudioContext = () => {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  if (globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
  return globalAudioCtx;
};

export const playPCMAudio = async (base64: string) => {
  try {
    const audioCtx = getAudioContext();
    const pcmData = base64ToUint8Array(base64);
    const buffer = await pcmToAudioBuffer(pcmData, audioCtx, 24000, 1);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
  } catch (e) { 
      console.error("Audio playback failed", e); 
      if (globalAudioCtx?.state === 'closed') {
          globalAudioCtx = null;
      }
  }
};

export const playGameSound = (type: 'success' | 'error' | 'click' | 'win' | 'flip') => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'win') {
       osc.type = 'triangle';
       osc.frequency.setValueAtTime(400, now);
       osc.frequency.setValueAtTime(500, now + 0.1);
       osc.frequency.setValueAtTime(600, now + 0.2);
       osc.frequency.setValueAtTime(800, now + 0.3);
       gain.gain.setValueAtTime(0.1, now);
       gain.gain.linearRampToValueAtTime(0, now + 0.6);
       osc.start(now);
       osc.stop(now + 0.6);
    } else {
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch(e) { /* ignore */ }
};
