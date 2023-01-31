import type { CodexItem } from '@/assets/types';

export const healthPotion = (): CodexItem => ({
  spriteName: 'staff',
  type: 'primary',
  onUse: () => {
    console.log('using staff');
  }
});
