import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

type Quat = [
  number,
  number,
  number,
  number,
];

type Mat4 = number[];

type FaceDefinition = {
  tx: number;
  ty: number;
  tz: number;

  ax: number;
  ay: number;
  az: number;

  angle: number;

  color: string;

  /**
   * Mix-blend mode used by the original
   * styled-components logo.
   */
  blendMode:
    | 'hard-light'
    | 'overlay';
};

const SCALE = 0.5;

const INV_SQRT_3 =
  1 / Math.sqrt(3);

const FACE_EDGE =
  2 * INV_SQRT_3;

/**
 * Rotation settings copied from the
 * general behaviour of styled-components'
 * PlatonicLogo.
 */
const IDLE_SPEED = 0.22;

const BLEND_RATE = 0.04;

const SENSITIVITY = 0.015;

/**
 * Initial pose.
 *
 * This gives the cube the same kind of
 * "already spinning" appearance when it
 * first appears.
 */
const INIT_X =
  (-107.8 * Math.PI) /
  180 /
  2;

const INIT_Y =
  (4.4 * Math.PI) /
  180 /
  2;

const INIT_Z =
  (-27.6 * Math.PI) /
  180 /
  2;

/* -------------------------------------------------------------------------- */
/* Quaternion                                                                 */
/* -------------------------------------------------------------------------- */

function qMul(
  a: Quat,
  b: Quat,
): Quat {
  return [
    a[0] * b[0] -
      a[1] * b[1] -
      a[2] * b[2] -
      a[3] * b[3],

    a[0] * b[1] +
      a[1] * b[0] +
      a[2] * b[3] -
      a[3] * b[2],

    a[0] * b[2] -
      a[1] * b[3] +
      a[2] * b[0] +
      a[3] * b[1],

    a[0] * b[3] +
      a[1] * b[2] -
      a[2] * b[1] +
      a[3] * b[0],
  ];
}

function qNorm(
  q: Quat,
): Quat {
  const length =
    Math.hypot(
      q[0],
      q[1],
      q[2],
      q[3],
    );

  if (length === 0) {
    return q;
  }

  return [
    q[0] / length,
    q[1] / length,
    q[2] / length,
    q[3] / length,
  ];
}

/* -------------------------------------------------------------------------- */
/* Matrix                                                                     */
/* -------------------------------------------------------------------------- */

function mat4FromQuat(
  q: Quat,
): Mat4 {
  const [
    w,
    x,
    y,
    z,
  ] = q;

  return [
    1 - 2 * y * y - 2 * z * z,
    2 * x * y - 2 * w * z,
    2 * x * z + 2 * w * y,
    0,

    2 * x * y + 2 * w * z,
    1 - 2 * x * x - 2 * z * z,
    2 * y * z - 2 * w * x,
    0,

    2 * x * z - 2 * w * y,
    2 * y * z + 2 * w * x,
    1 - 2 * x * x - 2 * y * y,
    0,

    0,
    0,
    0,
    1,
  ];
}

function mat4FromAxisAngle(
  ax: number,
  ay: number,
  az: number,
  angleDeg: number,
): Mat4 {
  const angle =
    (angleDeg * Math.PI) /
    180;

  const cos =
    Math.cos(angle);

  const sin =
    Math.sin(angle);

  const oneMinusCos =
    1 - cos;

  return [
    cos +
      ax * ax * oneMinusCos,

    ax * ay * oneMinusCos -
      az * sin,

    ax * az * oneMinusCos +
      ay * sin,

    0,

    ay * ax * oneMinusCos +
      az * sin,

    cos +
      ay * ay * oneMinusCos,

    ay * az * oneMinusCos -
      ax * sin,

    0,

    az * ax * oneMinusCos -
      ay * sin,

    az * ay * oneMinusCos +
      ax * sin,

    cos +
      az * az * oneMinusCos,

    0,

    0,
    0,
    0,
    1,
  ];
}

function mat4Translate(
  tx: number,
  ty: number,
  tz: number,
): Mat4 {
  return [
    1,
    0,
    0,
    tx,

    0,
    1,
    0,
    ty,

    0,
    0,
    1,
    tz,

    0,
    0,
    0,
    1,
  ];
}

function mat4Mul(
  a: Mat4,
  b: Mat4,
): Mat4 {
  const output =
    new Array<number>(16);

  for (
    let row = 0;
    row < 4;
    row++
  ) {
    for (
      let column = 0;
      column < 4;
      column++
    ) {
      let sum = 0;

      for (
        let k = 0;
        k < 4;
        k++
      ) {
        sum +=
          a[row * 4 + k] *
          b[k * 4 + column];
      }

      output[
        row * 4 + column
      ] = sum;
    }
  }

  return output;
}

/**
 * Our matrix is stored row-major.
 *
 * CSS matrix3d() expects column-major
 * values, therefore we transpose when
 * serializing.
 */
function mat4ToCss(
  matrix: Mat4,
): string {
  return `matrix3d(
    ${matrix[0]},
    ${matrix[4]},
    ${matrix[8]},
    ${matrix[12]},
    ${matrix[1]},
    ${matrix[5]},
    ${matrix[9]},
    ${matrix[13]},
    ${matrix[2]},
    ${matrix[6]},
    ${matrix[10]},
    ${matrix[14]},
    ${matrix[3]},
    ${matrix[7]},
    ${matrix[11]},
    ${matrix[15]}
  )`;
}

/* -------------------------------------------------------------------------- */
/* Initial quaternion                                                         */
/* -------------------------------------------------------------------------- */

const INITIAL_QUATERNION: Quat =
  qMul(
    qMul(
      [
        Math.cos(INIT_X),
        Math.sin(INIT_X),
        0,
        0,
      ],

      [
        Math.cos(INIT_Y),
        0,
        Math.sin(INIT_Y),
        0,
      ],
    ),

    [
      Math.cos(INIT_Z),
      0,
      0,
      Math.sin(INIT_Z),
    ],
  );

/* -------------------------------------------------------------------------- */
/* Faces                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The official styled-components logo
 * uses a 20-color OKLCH palette.
 *
 * We don't copy that palette wholesale.
 *
 * Instead we select a blue → violet →
 * purple → pink range that fits your
 * existing Design System.
 */
const FACES: FaceDefinition[] = [
  {
    // Front (+Z)
    tx: 0,
    ty: 0,
    tz: INV_SQRT_3,

    ax: 0,
    ay: 1,
    az: 0,

    angle: 0,

    color:
      'var(--cube-blue)',

    blendMode: 'overlay',
  },

  {
    // Back (-Z)
    tx: 0,
    ty: 0,
    tz: -INV_SQRT_3,

    ax: 0,
    ay: 1,
    az: 0,

    angle: 180,

    color:
      'var(--cube-blue-violet)',

    blendMode: 'hard-light',
  },

  {
    // Right (+X)
    tx: INV_SQRT_3,
    ty: 0,
    tz: 0,

    ax: 0,
    ay: 1,
    az: 0,

    angle: 90,

    color:
      'var(--cube-violet)',

    blendMode: 'hard-light',
  },

  {
    // Left (-X)
    tx: -INV_SQRT_3,
    ty: 0,
    tz: 0,

    ax: 0,
    ay: 1,
    az: 0,

    angle: -90,

    color:
      'var(--cube-indigo)',

    blendMode: 'hard-light',
  },

  {
    // Bottom (+Y)
    tx: 0,
    ty: INV_SQRT_3,
    tz: 0,

    ax: 1,
    ay: 0,
    az: 0,

    angle: -90,

    color:
      'var(--cube-purple)',

    blendMode: 'hard-light',
  },

  {
    // Top (-Y)
    tx: 0,
    ty: -INV_SQRT_3,
    tz: 0,

    ax: 1,
    ay: 0,
    az: 0,

    angle: 90,

    color:
      'var(--cube-pink)',

    blendMode: 'hard-light',
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

type RotatingCubeProps = {
  size?: number;
  className?: string;
};

export function RotatingCube({
  size = 120,
  className,
}: RotatingCubeProps) {
  const sceneRef =
    useRef<HTMLDivElement>(
      null,
    );

  const faceRefs =
    useRef<
      (HTMLDivElement | null)[]
    >([]);

  const lastZRef =
    useRef<number[]>([]);

  const lastPointerRef =
    useRef({
      x: 0,
      y: 0,
    });

  const quaternion =
    useRef<Quat>([
      ...INITIAL_QUATERNION,
    ]);

  const velocity =
    useRef({
      dx: IDLE_SPEED,
      dy:
        IDLE_SPEED * -0.4,
    });

  const dragging =
    useRef(false);

  /*
   * Size of the cube in pixels.
   */
  const scale =
    size * SCALE;

  const faceEdgePx =
    FACE_EDGE * scale;

  const halfEdge =
    faceEdgePx / 2;

  /* ---------------------------------------------------------------------- */
  /* Local face matrices                                                   */
  /* ---------------------------------------------------------------------- */

  const localMatrices =
    useMemo(
      () =>
        FACES.map(
          (face) => {
            const translation =
              mat4Translate(
                face.tx * scale,
                face.ty * scale,
                face.tz * scale,
              );

            const rotation =
              mat4FromAxisAngle(
                face.ax,
                face.ay,
                face.az,
                face.angle,
              );

            return mat4Mul(
              translation,
              rotation,
            );
          },
        ),

      [scale],
    );

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  const renderCube = useCallback(() => {
    const globalMatrix =
      mat4FromQuat(
        quaternion.current,
      );

    for (
      let i = 0;
      i < FACES.length;
      i++
    ) {
      const element =
        faceRefs.current[i];

      if (!element) {
        continue;
      }

      const combined =
        mat4Mul(
          globalMatrix,
          localMatrices[i],
        );

      element.style.transform =
        mat4ToCss(combined);

      const zIndex =
        Math.round(
          combined[11] * 100,
        ) + 1000;

      if (
        lastZRef.current[i] !==
        zIndex
      ) {
        element.style.zIndex =
          String(zIndex);

        lastZRef.current[i] =
          zIndex;
      }
    }
  }, [localMatrices]);

  /* ---------------------------------------------------------------------- */
  /* Animation                                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let animationFrame = 0;

    let lastTime = 0;

    /*
     * The official implementation caps
     * its work at roughly 65fps even when
     * requestAnimationFrame runs at 120/144Hz.
     */
    const FRAME_MS =
      1000 / 65;

    const animate = (
      time: number,
    ) => {
      animationFrame =
        requestAnimationFrame(
          animate,
        );

      if (
        time - lastTime <
        FRAME_MS
      ) {
        return;
      }

      lastTime = time;

      if (
        !dragging.current
      ) {
        const yHalf =
          (velocity.current.dx *
            SENSITIVITY) /
          2;

        const xHalf =
          (-velocity.current.dy *
            SENSITIVITY) /
          2;

        const spinQ =
          qMul(
            [
              Math.cos(xHalf),
              Math.sin(xHalf),
              0,
              0,
            ],

            [
              Math.cos(yHalf),
              0,
              Math.sin(yHalf),
              0,
            ],
          );

        quaternion.current =
          qNorm(
            qMul(
              spinQ,
              quaternion.current,
            ),
          );

        /*
         * Gradually return to the
         * idle rotation velocity.
         */
        velocity.current.dx =
          velocity.current.dx *
            (1 - BLEND_RATE) +
          IDLE_SPEED *
            BLEND_RATE;

        velocity.current.dy =
          velocity.current.dy *
            (1 - BLEND_RATE) +
          IDLE_SPEED *
            -0.4 *
            BLEND_RATE;
      }

      renderCube();
    };

    animationFrame =
      requestAnimationFrame(
        animate,
      );

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [renderCube]);

  /* ---------------------------------------------------------------------- */
  /* Pointer interaction                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const scene =
      sceneRef.current;

    if (!scene) {
      return;
    }

    const handlePointerDown =
      (event: PointerEvent) => {
        dragging.current =
          true;

        velocity.current.dx =
          0;

        velocity.current.dy =
          0;

        lastPointerRef.current.x =
          event.clientX;

        lastPointerRef.current.y =
          event.clientY;

        /*
         * This is important.
         *
         * Once the pointer is captured,
         * dragging continues even if the
         * pointer leaves the cube.
         */
        scene.setPointerCapture(
          event.pointerId,
        );
      };

    const handlePointerMove =
      (event: PointerEvent) => {
        if (
          !dragging.current
        ) {
          return;
        }

        const dx =
          event.clientX -
          lastPointerRef.current.x;

        const dy =
          event.clientY -
          lastPointerRef.current.y;

        lastPointerRef.current.x =
          event.clientX;

        lastPointerRef.current.y =
          event.clientY;

        /*
         * Smooth velocity.
         */
        velocity.current.dx =
          dx * 0.4 +
          velocity.current.dx *
            0.6;

        velocity.current.dy =
          dy * 0.4 +
          velocity.current.dy *
            0.6;

        /*
         * Convert pointer movement
         * into a quaternion.
         */
        const yHalf =
          (dx * SENSITIVITY) /
          2;

        const xHalf =
          (-dy * SENSITIVITY) /
          2;

        const dragQ =
          qMul(
            [
              Math.cos(xHalf),
              Math.sin(xHalf),
              0,
              0,
            ],

            [
              Math.cos(yHalf),
              0,
              Math.sin(yHalf),
              0,
            ],
          );

        quaternion.current =
          qNorm(
            qMul(
              dragQ,
              quaternion.current,
            ),
          );

        /*
         * Render immediately.
         */
        renderCube();
      };

    const handlePointerUp =
      (event: PointerEvent) => {
        dragging.current =
          false;

        const speed =
          Math.hypot(
            velocity.current.dx,
            velocity.current.dy,
          );

        /*
         * Fast drag → fling.
         */
        if (speed > 1.5) {
          velocity.current.dx *=
            1.2;

          velocity.current.dy *=
            1.2;
        } else {
          /*
           * Slow drag → stop.
           */
          velocity.current.dx =
            0;

          velocity.current.dy =
            0;
        }

        if (
          scene.hasPointerCapture(
            event.pointerId,
          )
        ) {
          scene.releasePointerCapture(
            event.pointerId,
          );
        }
      };

    scene.addEventListener(
      'pointerdown',
      handlePointerDown,
    );

    scene.addEventListener(
      'pointermove',
      handlePointerMove,
    );

    scene.addEventListener(
      'pointerup',
      handlePointerUp,
    );

    scene.addEventListener(
      'pointercancel',
      handlePointerUp,
    );

    return () => {
      scene.removeEventListener(
        'pointerdown',
        handlePointerDown,
      );

      scene.removeEventListener(
        'pointermove',
        handlePointerMove,
      );

      scene.removeEventListener(
        'pointerup',
        handlePointerUp,
      );

      scene.removeEventListener(
        'pointercancel',
        handlePointerUp,
      );
    };
  }, [renderCube]);

  /* ---------------------------------------------------------------------- */
  /* JSX                                                                    */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      ref={sceneRef}
      className={`
        relative
        inline-block
        select-none
        touch-none
        cursor-grab
        [perspective:800px]
        active:cursor-grabbing
        ${className ?? ''}
      `}
      style={{
        width: size,
        height: size,
      }}
    >
      {FACES.map(
        (face, index) => (
          <div
            key={index}
            ref={(element) => {
              faceRefs.current[
                index
              ] = element;
            }}
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
            "
            style={{
              width: faceEdgePx,
              height: faceEdgePx,

              marginLeft:
                -halfEdge,

              marginTop:
                -halfEdge,

              background:
                face.color,

              mixBlendMode:
                face.blendMode,
            }}
          />
        ),
      )}
    </div>
  );
}

export default RotatingCube;