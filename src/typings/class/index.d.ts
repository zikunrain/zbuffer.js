// import { Vec4 } from '../../class/Vec4'

// declare module 'zbuf' {
//   namespace ZBUF {
//     interface Model {
//       vertices: Vec4[]
//       faces: IndexedFace[]
//     }
//   }
//   export default ZBUF
// }

// interface IndexedFace {
//   v1: number
//   v2: number
//   v3: number
// }

// export declare class Vec4 {
//   private d: number[] = [0.0, 0.0, 0.0, 0.0]

//   constructor(x: number = 0.0, y: number = 0.0, z: number = 0.0, w: number = 0.0) {
//     this.d[0] = x
//     this.d[1] = y
//     this.d[2] = z
//     this.d[3] = w
//   }
// }

interface IndexedFace {
  v1: number
  v2: number
  v3: number
}

