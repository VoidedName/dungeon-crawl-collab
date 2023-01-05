import ouchSound from './assets/sounds/ouch.mp3';
import stairsSound from './assets/sounds/stairs.mp3';
import damageSound from './assets/sounds/damage.mp3';

const sounds = {
  ouch: ouchSound,
  stairs: stairsSound,
  damage: damageSound
} as const;
const soundCache: any = {};
const audioCtx = new AudioContext();

export type TSound = keyof typeof sounds;
export type TAudioManager = ReturnType<typeof createAudioManager>;

export function createAudioManager() {
  const loadSound = async (key: keyof typeof sounds) => {
    const url = sounds[key];
    const resp = await fetch(url);
    const arrayBuffer = await resp.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    soundCache[key] = audioBuffer;
  };

  Object.keys(sounds).forEach(key => {
    window.requestIdleCallback(async () => {
      loadSound(key as keyof typeof sounds);
    });
  });

  return {
    async play(sound: TSound) {
      if (!soundCache[sound]) {
        await loadSound(sound);
      }
      const source = audioCtx.createBufferSource();
      source.buffer = soundCache[sound];
      source.connect(audioCtx.destination);
      source.start();
    }
  };
}
