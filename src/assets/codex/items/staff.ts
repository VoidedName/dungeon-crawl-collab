import type { CodexItem } from '@/assets/types';

export const healthPotion = (): CodexItem => ({
  spriteName: 'staff',
  onUse: () => {
    console.log('using staff');
  }
});
