import type { InjectionKey, Ref } from 'vue';
import { useSafeInject } from './useSafeInject';
import type { ECSApi } from '@/createGameLoop';

export type ECSApiContext = Ref<ECSApi>;

export const ECSApiInjectionKey = Symbol(
  'ECS api'
) as InjectionKey<ECSApiContext>;

export const useEcsApiProvider = () => {
  const ecsApi = ref<ECSApi>();
  provide(ECSApiInjectionKey, ecsApi);

  return ecsApi;
};

export const useEcsApi = () => useSafeInject(ECSApiInjectionKey);
