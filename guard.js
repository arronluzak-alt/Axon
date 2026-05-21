// JSCAD version of the Axon Body 4 guard (first pass)
// Works in OpenJSCAD / @jscad/modeling online editors

import { cuboid, cylinder, union, subtract, translate, rotateX, extrudeLinear, polygon } from '@jscad/modeling/src/primitives.js'
import { booleans } from '@jscad/modeling'
import { transforms } from '@jscad/modeling'
const { union: u, subtract: sub } = booleans
const { translate: t, rotateX: rx } = transforms

// Parameters
const p = {
  device_w: 63,
  device_h: 78,
  device_t: 27,
  clear_w: 0.3,
  clear_h: 0.3,
  clear_t: 0.8,
  wall: 2.0,

  lens_d: 24,
  lens_ch: 1.0,

  flag_w: 32,
  flag_h: 18,
  flag_relief: 1.0,

  turret_od: 12,
  turret_h: 2.5,
  press_win_w: 8,
  press_win_h: 3,

  wedge_h: 2.0,
  finger_ch: 7,

  tab_t: 1.8,
  tab_l: 4.0
};

export const main = () => {
  const inner_w = p.device_w + 2*p.clear_w
  const inner_h = p.device_h + 2*p.clear_h
  const inner_t = p.device_t + p.clear_t

  const outer_w = inner_w + 2*p.wall
  const outer_h = inner_h + 2*p.wall
  const outer_t = inner_t + p.wall // front wall only

  // Shell block
  const shell = sub(
    cuboid({ size: [outer_w, outer_h, p.wall + inner_t] }),
    t([0,0,p.wall], cuboid({ size: [inner_w, inner_h, inner_t + 0.02] })),
    // Open the back
    t([0,0,p.wall + inner_t - 0.01], cuboid({ size: [outer_w+1, outer_h+1, inner_t] }))
  )

  // Lens opening
  const lensX = 0
  const lensY = outer_h/2 - p.wall - 18
  const lensHole = t([lensX, lensY, 0], cylinder({ height: p.wall + inner_t + 0.2, radius: p.lens_d/2, segments: 96 }))
  // Chamfer ring approximated by subtracting a smaller cylinder from a larger one
  const chamfer = sub(
    t([lensX, lensY, p.wall-0.01], cylinder({ height: p.lens_ch+0.02, radius: (p.lens_d/2) + p.lens_ch, segments: 96 })),
    t([lensX, lensY, p.wall-0.02], cylinder({ height: p.lens_ch+0.04, radius: p.lens_d/2, segments: 96 }))
  )

  // Flag emboss
  const flag = t([-p.flag_w/2, -p.flag_h/2, 0],
    cuboid({ size: [p.flag_w, p.flag_h, p.flag_relief] })
  )

  // Turrets (left & right)
  const turret = (x,y) => sub(
    t([x,y,p.wall], cylinder({ height: p.turret_h, radius: p.turret_od/2, segments: 64 })),
    // Side press window (left-facing)
    t([x - p.turret_od/2, y - p.press_win_h/2, p.wall+0.2], cuboid({ size: [p.press_win_w, p.press_win_h, p.turret_h] }))
  )
  const tRight = turret( outer_w/2 - p.wall - 18, 0 )
  const tLeft  = turret(-outer_w/2 + p.wall + 18, 0 )

  // Simple slide wedge near right edge
  const wedge = t([ outer_w/2 - p.wall - 10, -outer_h*0.15, p.wall ],
    extrudeLinear({ height: p.wedge_h },
      polygon({ points: [[-6,-5],[6,-5],[6,5],[-6,5],[ -6,-5 ]] })
    )
  )

  // Tabs (simple rectangular)
  const topTabL = t([ -9,  outer_h/2 - p.wall/2, p.wall + inner_t - p.tab_l ], cuboid({ size:[p.tab_t,p.tab_t,p.tab_l] }))
  const topTabR = t([  9,  outer_h/2 - p.wall/2, p.wall + inner_t - p.tab_l ], cuboid({ size:[p.tab_t,p.tab_t,p.tab_l] }))
  const sideTabL= t([ -outer_w/2 + p.wall/2, -outer_h/2 + p.wall + 20, p.wall + inner_t - p.tab_l ], cuboid({ size:[p.tab_t,p.tab_t,p.tab_l] }))
  const sideTabR= t([  outer_w/2 - p.wall/2, -outer_h/2 + p.wall + 20, p.wall + inner_t - p.tab_l ], cuboid({ size:[p.tab_t,p.tab_t,p.tab_l] }))

  // LED & mic slots
  const ledSlot = t([8, -12, 0], cuboid({ size:[6,3,p.wall+inner_t+0.2] }))
  const mic1 = t([ outer_w/2 - p.wall - 2, outer_h/2 - p.wall - 8, 0 ], cuboid({ size:[2,8,p.wall+inner_t+0.2] }))
  const mic2 = t([ outer_w/2 - p.wall - 2, -outer_h/2 + p.wall + 20, 0 ], cuboid({ size:[2,8,p.wall+inner_t+0.2] }))

  // Assemble
  let body = u(shell, flag, tRight, tLeft, wedge, topTabL, topTabR, sideTabL, sideTabR)
  body = sub(body, lensHole, chamfer, ledSlot, mic1, mic2)

  return [ body ]
}
