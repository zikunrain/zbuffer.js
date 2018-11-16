<template>
  <div class="hello">
    <canvas id="myCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter, namespace } from 'vuex-class'
import { BindingHelpers } from 'vuex-class/lib/bindings'

import { Model } from '../class/index.d'
import { Vec4, Mat4, NodePolygon, NodeEdge, ActiveNodePolygon, ActiveNodeEdge } from '../class/classes'
import { forEach, cloneDeep } from 'lodash'
import { EBUSY } from 'constants';

const exampleStore: BindingHelpers = namespace('Example')

interface IEye {
  up: number[]
  at: number[]
  look: number[]
  side: number[]
}

interface IBouding {
  maxX: number
  maxY: number
  maxZ: number
  minX: number
  minY: number
  minZ: number
}

@Component
export default class HelloWorld extends Vue {
  @exampleStore.Getter public model!: Model
  @exampleStore.Action private loadModel!: () => Promise<void>

  // private eye: IEye = {
  //   up: [0, 1, 0],
  //   look: [0, 0, 1],
  //   side: [1, 0, 0],
  //   at: [-500, -500, -5]
  // }
  // private eye: IEye = {
  //   up: [0, 1, 0],
  //   look: [Math.sqrt(3) / 2, 0, Math.sqrt(1) / 2],
  //   side: [Math.sqrt(1) / 2, 0, -Math.sqrt(3) / 2],
  //   at: [-500, -500, -5]
  // }
  private eye: IEye = {
    up: [Math.sqrt(6) / 6, Math.sqrt(6) / 3, Math.sqrt(6) / 6],
    look: [Math.sqrt(3) / 3, Math.sqrt(3) / 3, Math.sqrt(3) / 3],
    side: [Math.sqrt(2) / 2, 0, -Math.sqrt(2) / 2],
    at: [-500, -500, -5]
  }
  private c: number[] = [0, 0, 0]
  private canvasHeight: number = 800
  private canvasWidth: number = 1400
  private ctx!: CanvasRenderingContext2D
  private message: any = ''
  private polygonIndex: { [height: string]: NodePolygon[] } = {}
  private edgeIndex: { [height: string]: {
    [id: string] : NodeEdge[]
  } } = {}
  private buffer: number[][] = []
  private frame: number[][] = []
  private edgeVisible: { [hx: string]: number } = {}

  public transformation(): Mat4 {
    const transformationUYN: Mat4 = new Mat4(
      this.eye.up[0], this.eye.up[1], this.eye.up[2], 0,
      this.eye.side[0], this.eye.side[1], this.eye.side[2], 0,
      this.eye.look[0], this.eye.look[1], this.eye.look[2], 0,
      0, 0, 0, 1
    )
    const transformationC: Mat4 = new Mat4(
      1, 0, 0, -this.eye.at[0],
      0, 1, 0, -this.eye.at[1],
      0, 0, 1, -this.eye.at[2],
      0, 0, 0, 1
    )

    return transformationUYN.mul(transformationC)
  }

  public async initModel (): Promise<void> {
    await this.loadModel()

    const vertexes: Vec4[] = this.model.vertices
    const transformation: Mat4 = this.transformation()
    this.message = transformation.d

    const transformedModel: Model = {
      vertices: [],
      faces: this.model.faces
    }

    for (const vert of vertexes) {
      const transformedVert: Vec4 = transformation.apply(vert)
      transformedModel.vertices.push(transformedVert)
      // this.ctx.beginPath()
      // this.ctx.strokeStyle = 'black'
      // this.ctx.lineWidth = 1
      // this.ctx.arc(transformedVert.d[1], transformedVert.d[0], 5, 0, Math.PI * 2, true)
      // // take care
      // this.ctx.fillStyle = 'red'
      // this.ctx.fill()
    }

    const bouding: IBouding = this.getVertexesBounding(transformedModel)
    console.log(transformedModel)
    this.calculateZbuffer(transformedModel)
    this.draw()
  }

  public mounted (): void {
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('myCanvas')
    const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d')
    ctx.fillStyle = '#eee'
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.ctx = ctx
    this.initModel()
  }

  public draw(): void {
    const image: ImageData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight)
    const data: Uint8ClampedArray = image.data
    const stride: number = this.canvasWidth * 4
    for (let y: number = 0; y < this.canvasHeight; y += 1) {
      for (let x: number = 0; x < this.canvasWidth; x += 1) {
        // if (this.buffer[y][x] > 0) {
        //   console.log(x, y, this.buffer[y][x])
        // }
        const offset: number = y * stride + x * 4
        const pid: number = this.frame[this.canvasHeight - 1 - y][x]
        if (pid < 0) {
          data[offset] = 0
          data[offset + 1] = 0
          data[offset + 2] = 0
          data[offset + 3] = 255
        } else if (pid === 0) {
          data[offset] = 0
          data[offset + 1] = 200
          data[offset + 2] = 0
          data[offset + 3] = 255
        } else if (pid === 8) {
          data[offset] = 0
          data[offset + 1] = 0
          data[offset + 2] = 200
          data[offset + 3] = 255
        } else {
          data[offset] = pid * 10 + 80
          data[offset + 1] = pid * 10 + 80
          data[offset + 2] = pid * 10 + 80
          data[offset + 3] = 255
        }
        // const color: number = this.frame[this.canvasHeight - 1 - y][x]

      }
    }
    this.ctx.putImageData(image, 0, 0)
  }

  public calculateZbuffer(m: Model): void {
    const buffer: number[][] = []
    const frame: number[][] = []
    for (let h: number = 0; h < this.canvasHeight; h += 1) {
      const line: number[] = [...Array(this.canvasWidth)].fill(-200000)
      const line2: number[] = [...Array(this.canvasWidth)].fill(-1)
      // background -1
      buffer.push(line)
      frame.push(line2)
    }

    // store polygon by height
    this.polygonIndex = {}
    this.edgeIndex = {}
    let id: number = 0
    for (const f of m.faces) {
      const v1: Vec4 = m.vertices[f.v1]
      const v2: Vec4 = m.vertices[f.v2]
      const v3: Vec4 = m.vertices[f.v3]

      const n1: Vec4 = v1.sub(v2)
      const n2: Vec4 = v1.sub(v3)
      const abc: Vec4 = n1.dot(n2)
      const a: number = abc.d[0]
      const b: number = abc.d[1]
      const c: number = abc.d[2]

      if (c === 0) {
        continue
      }

      const dzx: number = - a / c
      const dzy: number = b / c

      // find max and min vert by y
      const maxV: Vec4 = v1.d[1] > v2.d[1]
        ? (v1.d[1] > v3.d[1] ? v1 : v3)
        : (v2.d[1] > v3.d[1] ? v2 : v3)
      const minV: Vec4 = v1.d[1] > v2.d[1]
        ? (v3.d[1] > v2.d[1] ? v2 : v3)
        : (v1.d[1] < v3.d[1] ? v1 : v3)
      const midV: Vec4 = v1.d[1] > v2.d[1]
        ? (v3.d[1] > v2.d[1] ? (v1.d[1] > v3.d[1] ? v3 : v2) : v2)
        : (v1.d[1] < v3.d[1] ? (v2.d[1] > v3.d[1] ? v3 : v2) : v1)
      // here

      const d: number = -(a * v1.d[0] + b * v1.d[1] + c * v1.d[2])
      const h: number = Math.max(Math.floor(v1.d[1]), Math.floor(v2.d[1]), Math.floor(v3.d[1]))
      const dy: number = h - Math.min(Math.floor(v1.d[1]), Math.floor(v2.d[1]), Math.floor(v3.d[1]))
      const p: NodePolygon = new NodePolygon(a, b, c, d, id, dy)
      if (!this.polygonIndex[h.toString()]) {
        this.polygonIndex[h.toString()] = []
      }
      this.polygonIndex[h.toString()].push(p) // polygon

      // v1v2
      const he3: { h: number, e: NodeEdge } = this.getEdgeGivenTwoPoint(midV, minV, id, dzx, dzy)
      const he1: { h: number, e: NodeEdge } = this.getEdgeGivenTwoPoint(maxV, midV, id, dzx, dzy, he3.e)
      const he2: { h: number, e: NodeEdge } = this.getEdgeGivenTwoPoint(maxV, minV, id, dzx, dzy)
      console.log('edge.x', he3.e.x)
      console.log('edge.x', he1.e.x)
      console.log('edge.x', he2.e.x)
      this.setEdge(he1.h.toString(), id.toString(), he1.e)
      this.setEdge(he2.h.toString(), id.toString(), he2.e)

      id += 1
    }

    console.log(this.edgeIndex)
    console.log(this.polygonIndex)

    // scanning
    const activeEdgeTable: { [polygonId: string]: ActiveNodeEdge } = {}
    for (let h: number = this.canvasHeight - 1; h >= 0; h -= 1) {
      // incrementally update z
      // console.log(activeEdgeTable)
      forEach(activeEdgeTable, (activeNodeEdge: ActiveNodeEdge, polygonId: string) => {
        const xl: number = Math.floor(activeNodeEdge.xl) > Math.floor(activeNodeEdge.xr)
          ? Math.floor(activeNodeEdge.xr)
          : Math.floor(activeNodeEdge.xl)
        const xr: number = Math.floor(activeNodeEdge.xl) < Math.floor(activeNodeEdge.xr)
          ? Math.floor(activeNodeEdge.xr)
          : Math.floor(activeNodeEdge.xl)

        const pid: number = activeNodeEdge.id
        let zl: number = cloneDeep(activeNodeEdge.zl)
        const dzx: number = activeNodeEdge.dzx

        for (let x: number = xl; x <= xr; x += 1) {
          if (pid === 0 || pid === 8 || pid === 1) {
            console.log(h, pid, zl)
          }
          if (buffer[h][x] < zl) {
            buffer[h][x] = zl
            frame[h][x] = pid
            if (x === xr || x === xl) {
              this.edgeVisible[`${h.toString()}_${x.toString()}`] = pid
            }
          }
          zl += dzx
        }

        // update active edge
        activeEdgeTable[polygonId].dyl = activeEdgeTable[polygonId].dyl - 1
        activeEdgeTable[polygonId].dyr = activeEdgeTable[polygonId].dyr - 1
        const dyl: number = activeEdgeTable[polygonId].dyl
        const dyr: number = activeEdgeTable[polygonId].dyr
        // console.log('update', polygonId, dyl, dyr)

        activeEdgeTable[polygonId].xl = activeEdgeTable[polygonId].xl + activeEdgeTable[polygonId].dxl
        activeEdgeTable[polygonId].xr = activeEdgeTable[polygonId].xr + activeEdgeTable[polygonId].dxr
        activeEdgeTable[polygonId].zl = activeEdgeTable[polygonId].zl + activeEdgeTable[polygonId].dzy +
          activeEdgeTable[polygonId].dzx * activeEdgeTable[polygonId].dxl

        if ((dyl < 0) && (dyr < 0)) {
          delete activeEdgeTable[polygonId]

        } else if ((dyl < 0) && (dyr >= 0)) {

          // console.log('replace', polygonId, dyl, dyr)
          // replace left edge
          const enext: NodeEdge = <NodeEdge>activeEdgeTable[polygonId].elnext
          if (enext.dy === 0) {
            delete activeEdgeTable[polygonId]
          } else {
            activeEdgeTable[polygonId].zl = enext.z0
            activeEdgeTable[polygonId].xl = enext.x
            activeEdgeTable[polygonId].dxl = enext.dx
            activeEdgeTable[polygonId].dyl = enext.dy
          }

        } else if ((dyr < 0) && (dyl >= 0)) {
          // replace right edge
          const enext: NodeEdge = <NodeEdge>activeEdgeTable[polygonId].elnext
          if (enext.dy === 0) {
            delete activeEdgeTable[polygonId]
          } else {
            activeEdgeTable[polygonId].xr = enext.x
            activeEdgeTable[polygonId].dxr = enext.dx
            activeEdgeTable[polygonId].dyr = enext.dy
          }
        }
      })

      // detect edge pair and active them
      const edgePairById: { [id: string]: NodeEdge[] } = this.edgeIndex[h.toString()]
      if (edgePairById && Object.keys(edgePairById).length > 0) {
        forEach(edgePairById, (edgePair: NodeEdge[], idstr: string) => {
          const e1: NodeEdge = edgePair[0]
          const e2: NodeEdge = edgePair[1]
          let er: NodeEdge = (e1.x + e1.dx) > (e2.x + e2.dx) ? e1 : e2
          let el: NodeEdge = (e1.x + e1.dx) > (e2.x + e2.dx) ? e2 : e1

          if (er.dx > 1000000) {
            const next: NodeEdge = <NodeEdge>er.next
            er = el
            el = next
          } else if (el.dx < -1000000) {
            const next: NodeEdge = <NodeEdge>el.next
            el = er
            er = next
          }

          // if (el.dy === 0) {
          //   // console.log('el.dy === 0')
          //   el = <NodeEdge>el.next
          //   // console.log(el.dy)
          //   // console.log(er.dy)
          // }
          // if (er.dy === 0) {
          //   // console.log('er.dy === 0')
          //   er = <NodeEdge>er.next
          // }

          console.log(h, el.z0, er.z0, idstr, er, el)

          const elnext: NodeEdge | undefined = el.next
          const ernext: NodeEdge | undefined = er.next

          const xl: number = el.x
          const dxl: number = el.dx
          const dyl: number = el.dy

          const xr: number = er.x
          const dxr: number = er.dx
          const dyr: number = er.dy

          const zl: number = el.z0
          const dzx: number = el.dzx
          const dzy: number = el.dzy

          const pid: number = parseInt(idstr)
          activeEdgeTable[idstr] =
            new ActiveNodeEdge(xl, dxl, dyl, xr, dxr, dyr, zl, dzx, dzy, pid, elnext, ernext)

          // console.log('pid', pid, 'activeNode', activeEdgeTable[idstr])
          // if (pid === 0) {
          //   console.log(xl, dxl, dyl, xr, dxr, dxr, zl, dzx, dzx, pid, elnext, ernext)
          // }
        })
      }
    }
    // console.log(buffer)
    this.buffer = buffer
    this.frame = frame
  }

  public getEdgeGivenTwoPoint(v1: Vec4, v2: Vec4, id: number, dzx: number, dzy: number, next?: NodeEdge): {
    h: number, e: NodeEdge
    } {
    const height: number = Math.floor(v1.d[1])
    const z0: number = Math.floor(v1.d[2])
    const xv1v2: number = v1.d[0]
    const dyv1v2: number = Math.floor(v1.d[1]) - Math.floor(v2.d[1]) // === 0 ?

    // const height: number = v2.d[1] > v2.d[1] ? Math.floor(v2.d[1]) : Math.floor(v1.d[1])
    // const z0: number = v2.d[1] > v2.d[1] ? Math.floor(v2.d[2]) : Math.floor(v1.d[2])
    // const xv1v2: number = v2.d[1] > v2.d[1] ? v2.d[0] : v1.d[0]
    const xv1: number = v1.d[0]
    const xv2: number = v2.d[0]
    const yv1v2: number = v2.d[1] - v1.d[1]
    const dxv1v2: number = (xv1 - xv2) / yv1v2
    // const dyv1v2: number = Math.abs(Math.floor(v2.d[1]) - Math.floor(v1.d[1]))
    const nodeEdge: NodeEdge = new NodeEdge(xv1v2, dxv1v2, dyv1v2, z0, dzx, dzy, id, next)

    return {
      h: height,
      e: nodeEdge
    }
  }

  public setEdge(hstr: string, idstr: string, e: NodeEdge): void {
    if (!this.edgeIndex[hstr]) {
      this.edgeIndex[hstr] = {}
    }
    if (!this.edgeIndex[hstr][idstr]) {
      this.edgeIndex[hstr][idstr] = []
    }
    this.edgeIndex[hstr][idstr].push(e)
  }

  public getVertexesBounding(m: Model): IBouding {
    const bouding: IBouding = {
      maxX: -20000.0,
      maxY: -20000.0,
      maxZ: -20000.0,
      minX: 20000.0,
      minY: 20000.0,
      minZ: 20000.0
    }
    for (const vert of m.vertices) {
      const x: number = vert.d[0]
      const y: number = vert.d[1]
      const z: number = vert.d[2]
      if (x > bouding.maxX) {
        bouding.maxX = x
      }
      if (y > bouding.maxY) {
        bouding.maxY = y
      }
      if (z > bouding.maxZ) {
        bouding.maxZ = z
      }
      if (x < bouding.minX) {
        bouding.minX = x
      }
      if (y < bouding.minY) {
        bouding.minY = y
      }
      if (z < bouding.minZ) {
        bouding.minZ = z
      }
    }

    return bouding
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
