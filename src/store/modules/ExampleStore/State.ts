import { Model } from '../../../class/index.d'

export interface IExampleStoreState {
  model: Model | null
}

export const state: IExampleStoreState = {
  model: null
}
