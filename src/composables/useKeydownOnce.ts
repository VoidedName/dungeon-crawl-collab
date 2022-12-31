import type { Nullable } from '@/utils/types';

export const useKeydownOnce = (
  cb: (e: KeyboardEvent) => void,
  target: Document | Window = document
) => {
  let hasFired = false;
  let code: Nullable<string>;

  target.addEventListener('keydown', (e: Event) => {
    const evt = e as KeyboardEvent;
    if (hasFired && evt.code === code) return;
    hasFired = true;
    code = evt.code;

    cb(evt);
  });

  target.addEventListener('keyup', (e: Event) => {
    const evt = e as KeyboardEvent;
    if (evt.code === code) {
      code = undefined;
      hasFired = false;
    }
  });
};
