import ouchSound from './assets/sounds/ouch.mp3';
import stairsSound from './assets/sounds/stairs.mp3';

const sounds = {
  ouch: ouchSound,
  stairs: stairsSound
};
const soundCache: any = {};
const audioCtx = new AudioContext();

export type TSound = keyof typeof sounds;
export type TAudioManager = ReturnType<typeof createAudioManager>;

export function createAudioManager() {
  return {
    async play(sound: TSound) {
      if (!soundCache[sound]) {
        const audio = sounds[sound];
        const resp = await fetch(audio);
        const arrayBuffer = await resp.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        soundCache[sound] = audioBuffer;
      }
      const source = audioCtx.createBufferSource();
      source.buffer = soundCache[sound];
      source.connect(audioCtx.destination);
      source.start();
    }
  };
}
