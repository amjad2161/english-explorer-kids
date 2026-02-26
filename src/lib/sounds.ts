// Sound utility using Web Speech API for kid-friendly pronunciation
export const speak = (text: string, lang: string = 'en-US', rate: number = 0.8) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1.4;
  utterance.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v =>
    v.name.toLowerCase().includes('child') ||
    v.name.toLowerCase().includes('samantha') ||
    (lang === 'he-IL' && v.lang.startsWith('he'))
  );
  if (preferredVoice) utterance.voice = preferredVoice;
  window.speechSynthesis.speak(utterance);
};

export const speakEnglish = (text: string) => speak(text, 'en-US', 0.75);
export const speakHebrew = (text: string) => speak(text, 'he-IL', 0.85);

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playTone = (freq: number, start: number, dur: number, vol = 0.3, type: OscillatorType = 'sine') => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
  osc.start(start);
  osc.stop(start + dur);
};

export const playCorrectSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(523, t, 0.15);
  playTone(659, t + 0.1, 0.15);
  playTone(784, t + 0.2, 0.2);
};

export const playWrongSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(200, t, 0.15, 0.2, 'square');
  playTone(150, t + 0.15, 0.15, 0.2, 'square');
};

export const playClickSound = () => {
  if (!audioCtx) return;
  playTone(800, audioCtx.currentTime, 0.1, 0.15);
};

export const playStarSound = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => playTone(freq, t + i * 0.12, 0.3, 0.2));
};

export const playComboSound = (combo: number) => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const baseFreq = 400 + combo * 50;
  [0, 0.08, 0.16].forEach((delay, i) => playTone(baseFreq + i * 100, t + delay, 0.15, 0.25));
};

export const playTickSound = () => {
  if (!audioCtx) return;
  playTone(1200, audioCtx.currentTime, 0.05, 0.1);
};

export const playTimerWarning = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  playTone(600, t, 0.1, 0.2);
  playTone(400, t + 0.15, 0.15, 0.2);
};

export const playVictoryFanfare = () => {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const melody = [523, 523, 659, 784, 784, 659, 784, 1047];
  melody.forEach((freq, i) => playTone(freq, t + i * 0.15, 0.2, 0.25));
};

export const playLetterPopSound = (index: number) => {
  if (!audioCtx) return;
  playTone(300 + index * 80, audioCtx.currentTime, 0.12, 0.15);
};
