export const SPAWN_COLORS = [
  { border: 'border-red-500', bg: 'bg-red-500/20', text: 'text-red-400', ring: 'ring-red-500/60' },
  { border: 'border-blue-500', bg: 'bg-blue-500/20', text: 'text-blue-400', ring: 'ring-blue-500/60' },
  { border: 'border-green-500', bg: 'bg-green-500/20', text: 'text-green-400', ring: 'ring-green-500/60' },
  { border: 'border-orange-500', bg: 'bg-orange-500/20', text: 'text-orange-400', ring: 'ring-orange-500/60' },
  { border: 'border-purple-500', bg: 'bg-purple-500/20', text: 'text-purple-400', ring: 'ring-purple-500/60' },
  { border: 'border-cyan-500', bg: 'bg-cyan-500/20', text: 'text-cyan-400', ring: 'ring-cyan-500/60' },
  { border: 'border-pink-500', bg: 'bg-pink-500/20', text: 'text-pink-400', ring: 'ring-pink-500/60' },
  { border: 'border-yellow-500', bg: 'bg-yellow-500/20', text: 'text-yellow-400', ring: 'ring-yellow-500/60' },
] as const;

export function getSpawnColor(index: number) {
  return SPAWN_COLORS[index % SPAWN_COLORS.length];
}
