export const heroParticlesLottie = {
  v: '5.7.6',
  fr: 30,
  ip: 0,
  op: 180,
  w: 1200,
  h: 1200,
  nm: 'fest-particles',
  ddd: 0,
  assets: [],
  layers: [
    createCircleLayer('ring-1', 1, 600, 600, 720, 0, 180, 22),
    createCircleLayer('ring-2', 2, 600, 600, 520, 30, 180, 16),
    createCircleLayer('ring-3', 3, 600, 600, 300, 12, 180, 10),
    createDotLayer('dot-1', 4, 320, 380, 22, 0, 180, 42),
    createDotLayer('dot-2', 5, 870, 470, 18, 18, 180, 35),
    createDotLayer('dot-3', 6, 690, 820, 14, 36, 180, 28),
    createDotLayer('dot-4', 7, 450, 860, 12, 54, 180, 30),
  ],
} as const

function createCircleLayer(
  name: string,
  ind: number,
  x: number,
  y: number,
  size: number,
  offset: number,
  op: number,
  strokeOpacity: number,
) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: 0 + offset, s: [0], e: [strokeOpacity] },
          { t: 45 + offset, s: [strokeOpacity], e: [12] },
          { t: 90 + offset, s: [12], e: [strokeOpacity] },
          { t: 135 + offset, s: [strokeOpacity], e: [0] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [x, y, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          { t: 0 + offset, s: [92, 92, 100], e: [102, 102, 100] },
          { t: 90 + offset, s: [102, 102, 100], e: [95, 95, 100] },
          { t: 180, s: [95, 95, 100] },
        ],
      },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr',
        it: [
          { d: 1, ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [size, size] } },
          { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
        ],
        nm: `${name}-group`,
        np: 3,
      },
    ],
    ip: 0,
    op,
    st: 0,
    bm: 0,
  }
}

function createDotLayer(
  name: string,
  ind: number,
  x: number,
  y: number,
  size: number,
  offset: number,
  op: number,
  opacity: number,
) {
  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: 0 + offset, s: [opacity], e: [opacity * 0.4] },
          { t: 90 + offset, s: [opacity * 0.4], e: [opacity] },
          { t: 180, s: [opacity] },
        ],
      },
      r: { a: 0, k: 0 },
      p: {
        a: 1,
        k: [
          { t: 0 + offset, s: [x, y, 0], e: [x + 18, y - 26, 0] },
          { t: 90 + offset, s: [x + 18, y - 26, 0], e: [x - 12, y + 16, 0] },
          { t: 180, s: [x - 12, y + 16, 0] },
        ],
      },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          { t: 0 + offset, s: [100, 100, 100], e: [125, 125, 100] },
          { t: 90 + offset, s: [125, 125, 100], e: [96, 96, 100] },
          { t: 180, s: [96, 96, 100] },
        ],
      },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr',
        it: [
          { d: 1, ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [size, size] } },
          { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
        ],
        nm: `${name}-group`,
        np: 3,
      },
    ],
    ip: 0,
    op,
    st: 0,
    bm: 0,
  }
}
