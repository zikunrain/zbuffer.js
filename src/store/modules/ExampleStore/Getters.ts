import { GetterTree } from 'vuex'

import { IRootState } from '../../RootState'
import { IExampleStoreState } from './State'
import { Model } from '../../../class/index.d'

export const getters: GetterTree<IExampleStoreState, IRootState> = {
  // model: (state: IExampleStoreState): Model | null => state.model
}
