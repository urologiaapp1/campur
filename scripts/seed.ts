import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { hash } from 'bcryptjs';
import * as schema from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('Creando primer administrador...');
  const passwordHash = await hash('12345', 10);

  const existing = await db.select().from(schema.admins).where(eq(schema.admins.username, 'javierasilva'));
  if (existing.length) {
    console.log('El administrador javierasilva ya existe.');
  } else {
    await db.insert(schema.admins).values({ username: 'javierasilva', passwordHash });
    console.log('✅ Administrador javierasilva creado.');
  }

  console.log('Seed completado.');
}

seed().catch(console.error);
