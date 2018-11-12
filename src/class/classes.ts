export class Vec4 {
  public d: number[] = [0.0, 0.0, 0.0, 0.0]

  constructor(x: number = 0.0, y: number = 0.0, z: number = 0.0, w: number = 0.0) {
    this.d[0] = x
    this.d[1] = y
    this.d[2] = z
    this.d[3] = w
  }

  public sub(v: Vec4): Vec4 {
    const retVec: Vec4 = new Vec4(0, 0, 0, 1)
    retVec.d[0] = this.d[0] - v.d[0]
    retVec.d[1] = this.d[1] - v.d[1]
    retVec.d[2] = this.d[2] - v.d[2]

    return retVec
  }
}

export class Mat4 {
  public d: number[][] = [
      [0.0, 0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0, 0.0]
  ]

  constructor(
      m00: number = 0.0, m01: number = 0.0, m02: number = 0.0, m03: number = 0.0,
      m10: number = 0.0, m11: number = 0.0, m12: number = 0.0, m13: number = 0.0,
      m20: number = 0.0, m21: number = 0.0, m22: number = 0.0, m23: number = 0.0,
      m30: number = 0.0, m31: number = 0.0, m32: number = 0.0, m33: number = 0.0) {
      this.d[0][0] = m00; this.d[0][1] = m01; this.d[0][2] = m02; this.d[0][3] = m03;
      this.d[1][0] = m10; this.d[1][1] = m11; this.d[1][2] = m12; this.d[1][3] = m13;
      this.d[2][0] = m20; this.d[2][1] = m21; this.d[2][2] = m22; this.d[2][3] = m23;
      this.d[3][0] = m30; this.d[3][1] = m31; this.d[3][2] = m32; this.d[3][3] = m33;
  }

  public apply(v: Vec4): Vec4 {
      const r: Vec4 = new Vec4();
      for (let i: number = 0; i < 4; i += 1) {
        for (let j: number = 0; j < 4; j += 1) {
          r.d[i] += this.d[i][j] * v.d[j]
        }
      }
      if (Math.abs(r.d[3]) > 1e-6) {
        r.d = r.d.map((d: number) => d / r.d[3])
      }

      return r
  }

  public mul(m: Mat4): Mat4 {
      const r: Mat4 = new Mat4();
      for (let i: number = 0; i < 4; i += 1) {
        for (let j: number = 0; j < 4; j += 1) {
          for (let k: number = 0; k < 4; k += 1) {
            r.d[i][j] += this.d[i][k] * m.d[k][j]
          }
        }
      }

      return r
  }
}

export class NodePolygon {
  public a: number
  public b: number
  public c: number
  public d: number
  public id: number
  public dy: number

  constructor(a: number, b: number, c: number, d: number, id: number, dy: number) {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.id = id
    this.dy = dy // number of line covered by polygon
  }
}

export class ActiveNodePolygon {
  public a: number
  public b: number
  public c: number
  public d: number
  public id: number
  public dy: number

  constructor(a: number, b: number, c: number, d: number, id: number, dy: number) {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.id = id
    this.dy = dy // number of line remained
  }
}

export class NodeEdge {
  public x: number
  public dx: number
  public dy: number
  public id: number
  public next!: NodeEdge | null

  constructor(x: number, dx: number, dy: number, id: number, next: NodeEdge) {
    this.x = x // x of upper point of edge
    this.dx = dx //dx between two contunous lines
    this.id = id
    this.dy = dy // number of line covered by edge
    this.next = next
  }
}

export class ActiveNodeEdge {
  public xl: number // x of left intersection
  public dxl: number //dx of left edge between two contunous lines
  public dyl: number // number of line remained

  public xr: number // x of right intersection
  public dxr: number //dx of right edge between two contunous lines
  public dyr: number // number of line remained

  public zl: number // z of left intersection
  public dzx: number // -a/c c!=0
  public dzy: number // b/c c!=0
  public id: number

  public next!: ActiveNodeEdge | null

  constructor(
    xl: number, dxl: number, dyl: number,
    xr: number, dxr: number, dyr: number,
    zl: number, dzx: number, dzy: number,
    id: number, next: ActiveNodeEdge) {
      this.xl = xl
      this.dxl = dxl
      this.dyl = dyl

      this.xr = xr
      this.dxr = dxr
      this.dyr = dyr

      this.zl = zl
      this.dzx = dzx
      this.dzy = dzy

      this.id = id
      this.next = next
  }
}
