export interface Lineup {
  id: string;
  map: string;
  side: string;
  utility: string;
  title: string;
  description: string | null;
  tags: string;
  startSpot: string;
  throwType: string;
  tickrate: string;
  screenshotPath: string;
  clipPath: string;
  createdAt: string;
  updatedAt: string;
}

export type MapCount = {
  map: string;
  count: number;
};
