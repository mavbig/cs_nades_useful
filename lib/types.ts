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

export interface SpawnSmokePosition {
  id: string;
  label: string;
  sortOrder: number;
  throwType: string;
  screenshotPath: string;
  description: string | null;
}

export interface SpawnSmokeSet {
  id: string;
  map: string;
  side: string;
  title: string;
  description: string | null;
  overviewImagePath: string | null;
  thumbnailPath: string | null;
  positions: SpawnSmokePosition[];
  createdAt: string;
  updatedAt: string;
}
