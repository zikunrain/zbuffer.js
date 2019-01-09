import { Vec4 } from '../class/classes'
import { Model } from '../class/index.d'

export function processModel(data: string): Model {
  const scale: number = 350
  const m: Model = { vertices: [], faces: []}
  for (const l of data.split(/[\r]{0,1}\n/)) {
    if (!l.length) {
      continue
    }
    const cmd: string[] = l.split(/\s+/)
    if (cmd.length < 4) {
      continue
    }
    switch (cmd[0]) {
      case 'v':
        m.vertices.push(new Vec4(parseFloat(cmd[1]) * scale, parseFloat(cmd[2]) * scale, parseFloat(cmd[3]) * scale, 1.))
        break
      case 'f':
        const start: number = parseInt(cmd[1]) - 1
        for (let i: number = 3; i < cmd.length; i += 1) {
          m.faces.push({
            v1: start,
            v2: parseInt(cmd[i - 1]) - 1,
            v3: parseInt(cmd[i]) - 1
          });
        }
        break;
      default:
        console.log(`unrecognized command ${cmd[0]}`)
    }
  }

  return m
}
