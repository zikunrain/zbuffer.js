import { MutationTree } from 'vuex'

import { MUTATIONS } from './MutationTypes'
import { IExampleStoreState } from './State'
import { Model } from '../../../class/index.d'

// tslint:disable:function-name
export const mutations: MutationTree<IExampleStoreState> = {
  [MUTATIONS.SET_CUBE_MODEL] (state: IExampleStoreState, model: Model): void {
    state.cubeModel = model
  },
  [MUTATIONS.SET_BODY_MODEL] (state: IExampleStoreState, model: Model): void {
    state.bodyModel = model
  }
}
