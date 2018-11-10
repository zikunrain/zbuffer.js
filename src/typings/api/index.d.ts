import { Vec4 } from '../../class/classes'

declare module 'api' {
  namespace API {
    namespace Welcome {
      interface Model {
        // vertices: Vec4[]
        faces: IndexedFace[]
      }
    }
  }
  export default API
}

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

interface IndexedFace {
  v1: number
  v2: number
  v3: number
}

