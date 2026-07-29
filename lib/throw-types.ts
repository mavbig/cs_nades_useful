export const THROW_TYPES = [
  'STAND',
  'WALK',
  'RUN',
  'JUMPTHROW',
  'A JUMPTHROW',
  'D JUMPTHROW',
  'RUN JUMPTHROW',
  'WALK JUMPTHROW',
  'RIGHT CLICK',
  'LEFT+RIGHT CLICK',
  'DUCK LEFT RIGHT CLICK',
] as const;

export type ThrowType = (typeof THROW_TYPES)[number];
