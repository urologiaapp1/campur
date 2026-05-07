import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { admins } from '@/lib/db/schema';
import { hash } from 'bcryptjs';
import { asc } from 'drizzle-orm';

export async function GET() {
  const rows = await db
    .select({ id: admins.id, username: admins.username, createdAt: admins.createdAt })
    .from(admins)
    .orderBy(asc(admins.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Usuario y contraseña son requeridos' }, { status: 400 });
  }

  const passwordHash = await hash(password, 10);

  try {
    const [admin] = await db
      .insert(admins)
      .values({ username, passwordHash })
      .returning({ id: admins.id, username: admins.username, createdAt: admins.createdAt });
    return NextResponse.json(admin, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'El usuario ya existe' }, { status: 409 });
  }
}
