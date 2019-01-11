import { Model } from '../../../class/index.d'

export interface IExampleStoreState {
  bodyModel: Model | null
  cubeModel: Model | null
}

export const state: IExampleStoreState = {
  bodyModel: null,
  cubeModel: null
}
