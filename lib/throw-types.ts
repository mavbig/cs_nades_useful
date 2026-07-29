export const THROW_TYPES = [
  'STAND',
  'WALK',
  'RUN',
  'JUMPTHROW',
  'A JUMPTHROW',
  'D JUMPTHROW',
  'W JUMPTHROW',
  'RUN JUMPTHROW',
  'WALK JUMPTHROW',
  'DUCK JUMPTHROW',
  'RIGHT CLICK',
  'LEFT+RIGHT CLICK',
  'DUCK LEFT RIGHT CLICK',
] as const;

export type ThrowType = (typeof THROW_TYPES)[number];
