/**
 * Known CS2 maps with image slugs (filename part in temp folder: 800px-CS2_de_<slug>.(png|jpg))
 */
export const MAPS = [
  { slug: 'anubis', name: 'Anubis' },
  { slug: 'ancient', name: 'Ancient' },
  { slug: 'dust2', name: 'Dust2' },
  { slug: 'inferno', name: 'Inferno' },
  { slug: 'mirage', name: 'Mirage' },
  { slug: 'nuke', name: 'Nuke' },
  { slug: 'overpass', name: 'Overpass' },
  { slug: 'train', name: 'Train' },
  { slug: 'vertigo', name: 'Vertigo' },
] as const;

export type MapSlug = (typeof MAPS)[number]['slug'];

/** Dust2 uses .jpg in temp folder */
export function getMapImageExt(slug: MapSlug): string {
  return slug === 'dust2' ? '.jpg' : '.png';
}
