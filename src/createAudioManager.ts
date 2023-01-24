import ouchSound from './assets/sounds/ouch.mp3';
import stairsSound from './assets/sounds/stairs.mp3';
import damageSound from './assets/sounds/damage.mp3';
import drinkSound from './assets/sounds/drink.mp3';
import stepsSound from './assets/sounds/steps.mp3';
import pickupSound from './assets/sounds/pickup.mp3';
import dropSound from './assets/sounds/drop.mp3';
import levelupSound from './assets/sounds/level-up.mp3';

const sounds = {
  ouch: ouchSound,
  stairs: stairsSound,
  damage: damageSound,
  drink: drinkSound,
  steps: stepsSound,
  pickup: pickupSound,
  drop: dropSound,
  levelUp: levelupSound
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

  const loopingSounds = new Map<TSound, AudioBufferSourceNode>();

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
    },
    async loop(sound: TSound) {
      if (!soundCache[sound]) {
        await loadSound(sound);
      }
      const source = audioCtx.createBufferSource();
      source.buffer = soundCache[sound];
      source.connect(audioCtx.destination);
      source.loop = true;
      source.start();
      loopingSounds.set(sound, source);
    },
    async stopLoop(sound: TSound) {
      loopingSounds.get(sound)?.stop();
    }
  };
}
