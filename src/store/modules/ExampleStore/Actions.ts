import Vue from 'vue'
import VueResource from 'vue-resource'
import { ActionContext, ActionTree } from 'vuex'

// tslint:disable-next-line:no-implicit-dependencies
import { MUTATIONS } from './MutationTypes'

import { IRootState } from '../../RootState'
import { IExampleStoreState } from './State'
import { Model } from '../../../class/index.d'

namespace GetModel {
  export interface IRequest {
    name: string
  }
  export interface IResponse {
    model: Model
  }
}

export const actions: ActionTree<IExampleStoreState, IRootState> = {
  async loadModel(ctx: ActionContext<IExampleStoreState, IRootState>): Promise<void> {
    const resp: VueResource.HttpResponse = await Vue.http.post('/api/getModel')
    const body: GetModel.IResponse = await (<PromiseLike<GetModel.IResponse>>resp.json())
    ctx.commit(MUTATIONS.SET_MODEL, body.model)
  }
}
