import { pool } from '../server/db';
import { ensureDatabaseSchema, hashPassword } from '../server/seed';

let isSeedingPromise: Promise<any> | null = null;
let tablesInitialized = false;

async function ensureTablesReady() {
  if (tablesInitialized) return;
  if (!isSeedingPromise) {
    isSeedingPromise = ensureDatabaseSchema()
      .then(() => {
        tablesInitialized = true;
      })
      .catch((err) => {
        console.error('[PRISMA_INIT_WARN] Warning during auto table initialization:', err?.message || err);
      })
      .finally(() => {
        isSeedingPromise = null;
      });
  }
  await isSeedingPromise;
}

/**
 * Prisma query helper interface for PostgreSQL database with automatic table schema preparation
 */
export const prisma = {
  user: {
    async findUnique({ where, include }: { where: { email?: string; id?: string }; include?: { twoFactorAuth?: boolean } }) {
      try {
        await ensureTablesReady();
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
          let user = userRes.rows[0] || null;
          if (!user) {
            return null;
          }

          if (include?.twoFactorAuth && user) {
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
        console.warn('findUnique caught error:', dbErr?.message);
        return null;
      }
    },

    async create({ data }: { data: { id?: string; email: string; name?: string; companyName?: string; phone?: string; password: string } }) {
      try {
        await ensureTablesReady();
        const client = await pool.connect();
        try {
          const id = data.id || `usr_${Date.now()}`;
          const res = await client.query(
            `INSERT INTO "User" ("id", "email", "name", "password", "companyName", "phone", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING *`,
            [
              id,
              data.email.trim().toLowerCase(),
              data.name || '',
              data.password,
              data.companyName || 'KBZ Bank Corporate Account',
              data.phone || '+95 9 798 112 889',
            ]
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.error('user.create error:', err?.message);
        throw err;
      }
    },

    async update({ where, data }: { where: { email?: string; id?: string }; data: any }) {
      try {
        await ensureTablesReady();
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
          if (where.email) {
            whereClause = `LOWER("email") = LOWER($${idx})`;
            params.push(where.email.trim());
          } else if (where.id) {
            whereClause = `"id" = $${idx}`;
            params.push(where.id);
          } else {
            return null;
          }
          const res = await client.query(
            `UPDATE "User" SET ${updates.join(', ')} WHERE ${whereClause} RETURNING *`,
            params
          );
          return res.rows[0] || null;
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn('user.update error:', err?.message);
        return null;
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
  },

  transactionAuditLog: {
    async findMany({ where, orderBy }: { where: { transactionId: string }; orderBy?: { changedAt: 'asc' | 'desc' } }) {
      try {
        await ensureTablesReady();
        const client = await pool.connect();
        try {
          let query = `SELECT * FROM "TransactionAuditLog" WHERE "transactionId" = $1`;
          if (orderBy?.changedAt) {
            query += ` ORDER BY "changedAt" ${orderBy.changedAt === 'asc' ? 'ASC' : 'DESC'}`;
          }
          const res = await client.query(query, [where.transactionId]);
          return res.rows;
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn('transactionAuditLog.findMany error:', err?.message);
        return [];
      }
    },
    async create({ data }: { data: any }) {
      try {
        await ensureTablesReady();
        const client = await pool.connect();
        try {
          const id = data.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const res = await client.query(
            `INSERT INTO "TransactionAuditLog" ("id", "transactionId", "oldStatus", "newStatus", "changedBy", "remarks", "changedAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
            [id, data.transactionId, data.oldStatus || null, data.newStatus, data.changedBy || 'SYSTEM', data.remarks || null]
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn('transactionAuditLog.create error:', err?.message);
        return null;
      }
    }
  },
};
