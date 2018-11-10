<template>
  <div class="hello">
    nihao
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, namespace } from 'vuex-class'
import { BindingHelpers } from 'vuex-class/lib/bindings'

import { Model } from '../class/index.d'
import { Vec4, Mat4 } from '../class/classes'

const exampleStore: BindingHelpers = namespace('Example')

interface IEye {
  up: number[]
  at: number[]
  look: number[]
  side: number[]
}

@Component
export default class HelloWorld extends Vue {
  @exampleStore.Getter public model!: Model
  @exampleStore.Action private loadModel!: () => Promise<void>

  private eye: IEye = {
    up: [0, 1, 0],
    look: [0, 0, 1],
    side: [1, 0, 0],
    at: [0, 0, 0]
  }
  private c: number[] = [0, 0, 0]

  public transformation(): Mat4 {
    const transformationUYN: Mat4 = new Mat4(
      this.eye.up[0], this.eye.up[1], this.eye.up[2], 0,
      this.eye.side[0], this.eye.side[1], this.eye.side[2], 0,
      this.eye.look[0], this.eye.look[1], this.eye.look[2], 0,
      0, 0, 0, 0
    )
    const transformationC: Mat4 = new Mat4(
      1, 0, 0, -this.eye.at[0],
      0, 1, 0, -this.eye.at[1],
      0, 0, 1, -this.eye.at[2],
      0, 0, 0, 0
    )

    return transformationUYN.mul(transformationC)
  }

  public async initModel (): Promise<void> {
    await this.loadModel()
    console.log(this.model)

    const vertexes: Vec4[] = this.model.vertices
    const transformation: Mat4 = this.transformation()
    console.log(transformation.d)

    // console.log(vertexes)
    // for (const vert of vertexes) {
    // }
  }

  public mounted (): void {
    this.initModel()
    // this.initEye()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
