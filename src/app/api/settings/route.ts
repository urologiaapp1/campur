import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  rows.forEach(r => { map[r.key] = r.value; });
  return NextResponse.json(map);
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as Record<string, string>;
  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(settings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  }
  return NextResponse.json({ ok: true });
}
