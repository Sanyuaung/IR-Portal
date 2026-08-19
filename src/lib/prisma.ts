import { pool } from '../server/db.ts';

/**
 * Prisma query helper interface for PostgreSQL database
 */
export const prisma = {
  user: {
    async findUnique({ where, include }: { where: { email?: string; id?: string }; include?: { twoFactorAuth?: boolean } }) {
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
        if (!user) return null;

        if (include?.twoFactorAuth) {
          const tfaRes = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [user.id]);
          user.twoFactorAuth = tfaRes.rows[0] || null;
        }

        return user;
      } finally {
        client.release();
      }
    },

    async create({ data }: { data: { id?: string; email: string; name?: string; password: string } }) {
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
    },
  },

  twoFactorAuth: {
    async findUnique({ where }: { where: { userId: string } }) {
      const client = await pool.connect();
      try {
        const res = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [where.userId]);
        return res.rows[0] || null;
      } finally {
        client.release();
      }
    },

    async update({ where, data }: { where: { userId?: string; id?: string }; data: any }) {
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
    },
  },
};
