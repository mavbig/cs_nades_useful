import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const lineups = await prisma.lineup.findMany({
      select: { tags: true }
    });

    const uniqueTags = new Set<string>();
    
    lineups.forEach(lineup => {
      if (!lineup.tags) return;
      const tags = lineup.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
      tags.forEach(tag => uniqueTags.add(tag));
    });

    return NextResponse.json(Array.from(uniqueTags).sort());
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json([], { status: 500 });
  }
}
