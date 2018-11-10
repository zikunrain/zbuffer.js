import { MutationTree } from 'vuex'

import { MUTATIONS } from './MutationTypes'
import { IExampleStoreState } from './State'
import { Model } from '../../../class/index.d'

// tslint:disable:function-name
export const mutations: MutationTree<IExampleStoreState> = {
  [MUTATIONS.SET_MODEL] (state: IExampleStoreState, model: Model): void {
    state.model = model
  }
}
