John Roblox/GDILIVES

```exports.lafargeDroneBody = {
  PARENT: [exports.genericTank],
  LABEL: '',
  COLOR: 0,
  SHAPE: 9,
  MAX_CHILDREN: 42,
  CONTROLLERS: ['reversespin'],
  GUNS: [
    {
      POSITION: [11, 8, 0.5, 0, 0, (360 * 1.5) / 9, 0],
      PROPERTIES: {
        SHOOT_SETTINGS: combineStats([g.drone, g.halfreload, g.lowpower, g.small]),
        TYPE: exports.ragnarokdrone,
        AUTOFIRE: true
      }
    },{
      POSITION: [11, 8, 0.5, 0, 0, (360 * 2.5) / 9, 0],
      PROPERTIES: {
      