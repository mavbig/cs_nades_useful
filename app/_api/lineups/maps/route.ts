import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const groups = await prisma.lineup.groupBy({
    by: ['map'],
    _count: { id: true },
    orderBy: { map: 'asc' },
  });

  const maps = groups.map((g) => ({ map: g.map, count: g._count.id }));
  return NextResponse.json(maps);
}
