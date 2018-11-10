export class Vec4 {
  public d: number[] = [0.0, 0.0, 0.0, 0.0]

  constructor(x: number = 0.0, y: number = 0.0, z: number = 0.0, w: number = 0.0) {
    this.d[0] = x
    this.d[1] = y
    this.d[2] = z
    this.d[3] = w
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
