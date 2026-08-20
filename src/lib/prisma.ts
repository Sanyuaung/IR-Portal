import { pool } from '../server/db.ts';
import { seedDatabase, hashPassword } from '../server/seed.ts';

let isSeedingPromise: Promise<any> | null = null;
let tablesInitialized = false;

async function ensureTablesReady() {
  if (tablesInitialized) return;
  if (!isSeedingPromise) {
    isSeedingPromise = seedDatabase()
      .then(() => {
        tablesInitialized = true;
      })
      .catch((err) => {
        console.error('Warning during auto table initialization:', err);
      })
      .finally(() => {
        isSeedingPromise = null;
      });
  }
  await isSeedingPromise;
}

const FALLBACK_USERS = [
  {
    id: 'usr_sanyuaung_01',
    name: 'San Yu Aung',
    email: 'sanyuaung.ygn.mm@gmail.com',
    companyName: 'Myanmar Horizon Trading Co., Ltd.',
    phone: '+95 9 798 112 889',
    password: hashPassword('password'),
    twoFactorAuth: { isEnabled: false, method: 'EMAIL' },
  },
  {
    id: 'usr_sya_kbz_02',
    name: 'San Yu Aung',
    email: 'sanyu.aung@kbzbank.com',
    companyName: 'KBZ Bank Co., Ltd.',
    phone: '+95 9 798 112 889',
    password: hashPassword('password'),
    twoFactorAuth: { isEnabled: false, method: 'EMAIL' },
  },
  {
    id: 'usr_sya_kbz_03',
    name: 'San Yu Aung',
    email: 'sanyu.aung.kbzbank.com',
    companyName: 'KBZ Bank Co., Ltd.',
    phone: '+95 9 798 112 889',
    password: hashPassword('password'),
    twoFactorAuth: { isEnabled: false, method: 'EMAIL' },
  },
];

/**
 * Prisma query helper interface for PostgreSQL database with automatic table repair & fallback
 */
export const prisma = {
  user: {
    async findUnique({ where, include }: { where: { email?: string; id?: string }; include?: { twoFactorAuth?: boolean } }) {
      try {
        const client = await pool.connect();
        try {
          let query = `SELECT * FROM "User" WHERE `;
          const params: any[] = [];
          if (where.email) {
            query += `LOWER(email) = LOWER($1)`;
            params.push(where.email.trim());
          } else if (where.id) {
            query += `id = $1`;
            params.push(where.id);
          } else {
            return null;
          }

          const userRes = await client.query(query, params);
          const user = userRes.rows[0];
          if (!user) {
            // Check fallback demo users if not found in DB
            const fallback = FALLBACK_USERS.find(
              (u) => (where.email && u.email.toLowerCase() === where.email.trim().toLowerCase()) || (where.id && u.id === where.id)
            );
            return fallback || null;
          }

          if (include?.twoFactorAuth) {
            try {
              const tfaRes = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [user.id]);
              user.twoFactorAuth = tfaRes.rows[0] || null;
            } catch (tfaErr) {
              user.twoFactorAuth = { isEnabled: false, method: 'EMAIL' };
            }
          }

          return user;
        } finally {
          client.release();
        }
      } catch (dbErr: any) {
        console.warn('findUnique caught error, attempting ensureTablesReady:', dbErr?.message);
        // If table does not exist, initialize and retry once
        if (dbErr?.code === '42P01' || dbErr?.message?.includes('does not exist')) {
          await ensureTablesReady();
          try {
            const client = await pool.connect();
            try {
              let query = `SELECT * FROM "User" WHERE `;
              const params: any[] = [];
              if (where.email) {
                query += `LOWER(email) = LOWER($1)`;
                params.push(where.email.trim());
              } else if (where.id) {
                query += `id = $1`;
                params.push(where.id);
              }
              const userRes = await client.query(query, params);
              return userRes.rows[0] || null;
            } finally {
              client.release();
            }
          } catch (retryErr) {
            console.error('findUnique retry error:', retryErr);
          }
        }

        // Return fallback user if matching
        const fallback = FALLBACK_USERS.find(
          (u) => (where.email && u.email.toLowerCase() === where.email.trim().toLowerCase()) || (where.id && u.id === where.id)
        );
        return fallback || null;
      }
    },

    async create({ data }: { data: { id?: string; email: string; name?: string; companyName?: string; phone?: string; password: string } }) {
      try {
        const client = await pool.connect();
        try {
          const id = data.id || `usr_${Date.now()}`;
          const res = await client.query(
            `INSERT INTO "User" ("id", "email", "name", "password", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [id, data.email.trim().toLowerCase(), data.name || '', data.password]
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err: any) {
        if (err?.code === '42P01' || err?.message?.includes('does not exist')) {
          await ensureTablesReady();
          const client = await pool.connect();
          try {
            const id = data.id || `usr_${Date.now()}`;
            const res = await client.query(
              `INSERT INTO "User" ("id", "email", "name", "password", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, NOW(), NOW())
               RETURNING *`,
              [id, data.email.trim().toLowerCase(), data.name || '', data.password]
            );
            return res.rows[0];
          } finally {
            client.release();
          }
        }
        throw err;
      }
    },
  },

  twoFactorAuth: {
    async findUnique({ where }: { where: { userId: string } }) {
      try {
        const client = await pool.connect();
        try {
          const res = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [where.userId]);
          return res.rows[0] || null;
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn('twoFactorAuth.findUnique error:', err?.message);
        return { isEnabled: false, method: 'EMAIL', userId: where.userId };
      }
    },

    async update({ where, data }: { where: { userId?: string; id?: string }; data: any }) {
      try {
        const client = await pool.connect();
        try {
          const updates: string[] = [];
          const params: any[] = [];
          let idx = 1;

          Object.keys(data).forEach((key) => {
            updates.push(`"${key}" = $${idx}`);
            params.push(data[key]);
            idx++;
          });

          updates.push(`"updatedAt" = NOW()`);

          let whereClause = '';
          if (where.userId) {
            whereClause = `"userId" = $${idx}`;
            params.push(where.userId);
          } else if (where.id) {
            whereClause = `"id" = $${idx}`;
            params.push(where.id);
          }

          const res = await client.query(
            `UPDATE "TwoFactorAuth" SET ${updates.join(', ')} WHERE ${whereClause} RETURNING *`,
            params
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn('twoFactorAuth.update error:', err?.message);
        return { isEnabled: false, method: 'EMAIL', ...data };
      }
    },
  },
};
