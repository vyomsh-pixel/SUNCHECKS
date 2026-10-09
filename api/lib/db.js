// Database client for CyberPulse on Vercel
// Supports Vercel Postgres, Neon SQL, and standard PostgreSQL via DATABASE_URL or POSTGRES_URL.
// Provides SQL schema auto-migration and safe fallback.

import pg from 'pg';
const { Pool } = pg;

let pool = null;

export function getDbPool() {
  if (pool) return pool;

  const connectionString =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (connectionString) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
    return pool;
  }
  return null;
}

// In-memory fallback if no database connection string is provided yet
const memoryStore = {
  profile: {
    id: 'vyom_default',
    name: 'Vyom',
    email: 'rajkesir74@gmail.com',
    activeRole: 'student_intern_freelancer',
    uiMode: 'serious',
    certTargets: ['AWS Solutions Architect', 'GCP Associate Cloud Engineer', 'CKA Kubernetes'],
    dailyCapacityHours: 12,
  },
  reminders: [
    {
      id: 'rem_init_1',
      title: 'Cloud Certification Module Sprint',
      theme: 'cert',
      description: 'Review high-priority exam questions and test scenarios.',
      cadence: 'daily',
      time: '10:00',
      intervalDays: 1,
      weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      email: 'rajkesir74@gmail.com',
      autoEmail: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextTriggerAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    },
  ],
  emailLogs: [],
};

let schemaInitialized = false;

export async function initDbSchema() {
  if (schemaInitialized) return;
  const p = getDbPool();
  if (!p) {
    schemaInitialized = true;
    return;
  }

  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS cyber_profiles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        active_role VARCHAR(64) NOT NULL,
        ui_mode VARCHAR(32) NOT NULL,
        cert_targets JSONB DEFAULT '[]'::jsonb,
        daily_capacity_hours INT DEFAULT 12,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cyber_reminders (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        theme VARCHAR(64) NOT NULL,
        description TEXT,
        cadence VARCHAR(64) NOT NULL,
        time VARCHAR(16) NOT NULL,
        interval_days INT DEFAULT 1,
        weekdays JSONB DEFAULT '[]'::jsonb,
        email VARCHAR(255) NOT NULL,
        auto_email BOOLEAN DEFAULT true,
        status VARCHAR(32) DEFAULT 'active',
        next_trigger_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cyber_email_logs (
        id VARCHAR(64) PRIMARY KEY,
        reminder_id VARCHAR(64),
        title VARCHAR(255),
        recipient VARCHAR(255),
        provider VARCHAR(64),
        status VARCHAR(64),
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    schemaInitialized = true;
    console.log('[CYBER DB] PostgreSQL schema initialized successfully');
  } catch (err) {
    console.warn('[CYBER DB] Schema migration error (falling back to memory):', err.message);
  }
}

// 1. Profile Operations
export async function getProfile() {
  const p = getDbPool();
  if (!p) return memoryStore.profile;

  await initDbSchema();
  try {
    const res = await p.query('SELECT * FROM cyber_profiles LIMIT 1');
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        activeRole: row.active_role,
        uiMode: row.ui_mode,
        certTargets: Array.isArray(row.cert_targets) ? row.cert_targets : JSON.parse(row.cert_targets || '[]'),
        dailyCapacityHours: row.daily_capacity_hours,
      };
    }
    // Seed initial profile
    await saveProfile(memoryStore.profile);
    return memoryStore.profile;
  } catch (err) {
    console.warn('DB getProfile failed, fallback to memory', err.message);
    return memoryStore.profile;
  }
}

export async function saveProfile(data) {
  const p = getDbPool();
  if (!p) {
    memoryStore.profile = { ...memoryStore.profile, ...data };
    return memoryStore.profile;
  }

  await initDbSchema();
  try {
    const id = data.id || 'vyom_default';
    await p.query(
      `INSERT INTO cyber_profiles (id, name, email, active_role, ui_mode, cert_targets, daily_capacity_hours, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         active_role = EXCLUDED.active_role,
         ui_mode = EXCLUDED.ui_mode,
         cert_targets = EXCLUDED.cert_targets,
         daily_capacity_hours = EXCLUDED.daily_capacity_hours,
         updated_at = NOW()`,
      [
        id,
        data.name || 'Vyom',
        data.email || 'rajkesir74@gmail.com',
        data.activeRole || 'student_intern_freelancer',
        data.uiMode || 'serious',
        JSON.stringify(data.certTargets || []),
        data.dailyCapacityHours || 12,
      ]
    );
    return data;
  } catch (err) {
    console.warn('DB saveProfile failed, fallback to memory', err.message);
    memoryStore.profile = { ...memoryStore.profile, ...data };
    return memoryStore.profile;
  }
}

// 2. Reminders Operations
export async function getReminders() {
  const p = getDbPool();
  if (!p) return memoryStore.reminders;

  await initDbSchema();
  try {
    const res = await p.query('SELECT * FROM cyber_reminders ORDER BY created_at DESC');
    if (res.rows.length === 0) {
      for (const r of memoryStore.reminders) {
        await createReminder(r);
      }
      return memoryStore.reminders;
    }
    return res.rows.map((row) => ({
      id: row.id,
      title: row.title,
      theme: row.theme,
      description: row.description,
      cadence: row.cadence,
      time: row.time,
      intervalDays: row.interval_days,
      weekdays: Array.isArray(row.weekdays) ? row.weekdays : JSON.parse(row.weekdays || '[]'),
      email: row.email,
      autoEmail: row.auto_email,
      status: row.status,
      nextTriggerAt: row.next_trigger_at ? new Date(row.next_trigger_at).toISOString() : null,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    }));
  } catch (err) {
    console.warn('DB getReminders failed, fallback to memory', err.message);
    return memoryStore.reminders;
  }
}

// Cadence calculation engine for accurate schedule tracking
export function computeNextTrigger(cadence, config = {}, forceTomorrow = false) {
  const now = new Date();
  const timeStr = config.time || '10:00';
  const [targetH, targetM] = (timeStr.includes(':') ? timeStr.split(':') : ['10', '00']).map(
    (n) => parseInt(n, 10) || 0
  );

  if (cadence === 'random') {
    // 10:00 AM (600m) to 11:00 PM (1380m)
    const randomMinutesOffset = Math.floor(Math.random() * 780);
    const totalMinutes = 600 + randomMinutesOffset;
    const randH = Math.floor(totalMinutes / 60);
    const randM = totalMinutes % 60;
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), randH, randM, 0, 0);
    if (!forceTomorrow && candidate.getTime() > now.getTime() + 60000) {
      return candidate.toISOString();
    }
    candidate.setDate(candidate.getDate() + 1);
    return candidate.toISOString();
  }

  if (cadence === 'interval') {
    const intervalDays = Math.max(1, parseInt(config.intervalDays, 10) || 2);
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetH, targetM, 0, 0);
    if (!forceTomorrow && candidate.getTime() > now.getTime() + 60000) {
      return candidate.toISOString();
    }
    candidate.setDate(candidate.getDate() + intervalDays);
    return candidate.toISOString();
  }

  if (cadence === 'weekdays') {
    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const allowed = (config.weekdays || ['mon', 'tue', 'wed', 'thu', 'fri'])
      .map((d) => (typeof d === 'string' ? dayMap[d.toLowerCase()] : d))
      .filter((d) => d !== undefined);
    const safeAllowed = allowed.length > 0 ? allowed : [1, 2, 3, 4, 5];

    for (let dayOffset = forceTomorrow ? 1 : 0; dayOffset <= 14; dayOffset++) {
      const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, targetH, targetM, 0, 0);
      if (safeAllowed.includes(candidate.getDay())) {
        if (candidate.getTime() > now.getTime() + 60000) {
          return candidate.toISOString();
        }
      }
    }
  }

  // Default: daily
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetH, targetM, 0, 0);
  if (!forceTomorrow && candidate.getTime() > now.getTime() + 60000) {
    return candidate.toISOString();
  }
  candidate.setDate(candidate.getDate() + 1);
  return candidate.toISOString();
}

export async function createReminder(data) {
  const p = getDbPool();
  const cadence = data.cadence || 'daily';
  const calculatedNext = computeNextTrigger(cadence, data);
  const item = {
    id: data.id || `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: data.title || 'Untitled Directive',
    theme: data.theme || 'work',
    description: data.description || '',
    cadence,
    time: data.time || '10:00',
    intervalDays: Number(data.intervalDays) || 1,
    weekdays: data.weekdays || ['mon', 'tue', 'wed', 'thu', 'fri'],
    email: data.email || 'rajkesir74@gmail.com',
    autoEmail: data.autoEmail !== false,
    status: data.status || 'active',
    nextTriggerAt: data.nextTriggerAt || calculatedNext,
    createdAt: new Date().toISOString(),
  };

  if (!p) {
    memoryStore.reminders.unshift(item);
    return item;
  }

  await initDbSchema();
  try {
    await p.query(
      `INSERT INTO cyber_reminders (id, title, theme, description, cadence, time, interval_days, weekdays, email, auto_email, status, next_trigger_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        item.id,
        item.title,
        item.theme,
        item.description,
        item.cadence,
        item.time,
        item.intervalDays,
        JSON.stringify(item.weekdays),
        item.email,
        item.autoEmail,
        item.status,
        item.nextTriggerAt,
        item.createdAt,
      ]
    );
    return item;
  } catch (err) {
    console.warn('DB createReminder failed, fallback to memory', err.message);
    memoryStore.reminders.unshift(item);
    return item;
  }
}

export async function updateReminder(id, updates) {
  const p = getDbPool();
  if (!p) {
    const idx = memoryStore.reminders.findIndex((r) => r.id === id);
    if (idx !== -1) {
      memoryStore.reminders[idx] = { ...memoryStore.reminders[idx], ...updates };
      return memoryStore.reminders[idx];
    }
    return null;
  }

  await initDbSchema();
  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.title !== undefined) { fields.push(`title = $${idx++}`); values.push(updates.title); }
    if (updates.theme !== undefined) { fields.push(`theme = $${idx++}`); values.push(updates.theme); }
    if (updates.description !== undefined) { fields.push(`description = $${idx++}`); values.push(updates.description); }
    if (updates.cadence !== undefined) { fields.push(`cadence = $${idx++}`); values.push(updates.cadence); }
    if (updates.time !== undefined) { fields.push(`time = $${idx++}`); values.push(updates.time); }
    if (updates.intervalDays !== undefined) { fields.push(`interval_days = $${idx++}`); values.push(Number(updates.intervalDays)); }
    if (updates.weekdays !== undefined) { fields.push(`weekdays = $${idx++}`); values.push(JSON.stringify(updates.weekdays)); }
    if (updates.email !== undefined) { fields.push(`email = $${idx++}`); values.push(updates.email); }
    if (updates.autoEmail !== undefined) { fields.push(`auto_email = $${idx++}`); values.push(updates.autoEmail); }
    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.nextTriggerAt !== undefined) { fields.push(`next_trigger_at = $${idx++}`); values.push(updates.nextTriggerAt); }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE cyber_reminders SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await p.query(query, values);
    return res.rows[0] || null;
  } catch (err) {
    console.warn('DB updateReminder failed', err.message);
    return null;
  }
}

export async function deleteReminder(id) {
  const p = getDbPool();
  if (!p) {
    memoryStore.reminders = memoryStore.reminders.filter((r) => r.id !== id);
    return true;
  }

  await initDbSchema();
  try {
    await p.query('DELETE FROM cyber_reminders WHERE id = $1', [id]);
    return true;
  } catch (err) {
    console.warn('DB deleteReminder failed', err.message);
    return false;
  }
}

// 3. Email Logs Operations
export async function getEmailLogs() {
  const p = getDbPool();
  if (!p) return memoryStore.emailLogs;

  await initDbSchema();
  try {
    const res = await p.query('SELECT * FROM cyber_email_logs ORDER BY timestamp DESC LIMIT 50');
    return res.rows.map((row) => ({
      id: row.id,
      reminderId: row.reminder_id,
      title: row.title,
      recipient: row.recipient,
      provider: row.provider,
      status: row.status,
      timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('DB getEmailLogs failed, fallback to memory', err.message);
    return memoryStore.emailLogs;
  }
}

export async function addEmailLog(log) {
  const item = {
    id: log.id || `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    reminderId: log.reminderId || 'manual',
    title: log.title || 'Notification',
    recipient: log.recipient || 'recipient',
    provider: log.provider || 'RESEND',
    status: log.status || 'dispatched',
    timestamp: new Date().toISOString(),
  };

  const p = getDbPool();
  if (!p) {
    memoryStore.emailLogs.unshift(item);
    if (memoryStore.emailLogs.length > 50) memoryStore.emailLogs.length = 50;
    return item;
  }

  await initDbSchema();
  try {
    await p.query(
      `INSERT INTO cyber_email_logs (id, reminder_id, title, recipient, provider, status, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [item.id, item.reminderId, item.title, item.recipient, item.provider, item.status, item.timestamp]
    );
    return item;
  } catch (err) {
    console.warn('DB addEmailLog failed, fallback to memory', err.message);
    memoryStore.emailLogs.unshift(item);
    return item;
  }
}
