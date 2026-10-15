// Database & Security Core for CyberPulse on Vercel
// Supports Vercel Postgres, Neon SQL, and standard PostgreSQL via DATABASE_URL or POSTGRES_URL.
// Provides SQL schema auto-migration, IST timezone scheduling, HMAC auth, HTML escaping, and safe in-memory fallback.

import crypto from 'node:crypto';
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
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    return pool;
  }
  return null;
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function handleCors(req, res, methods = 'GET, POST, PUT, DELETE, OPTIONS') {
  const origin = req?.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Operator-Token');
  if (req?.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

function getOperatorSecret() {
  return (process.env.OPERATOR_PASSCODE || '2077').trim();
}

export function createOperatorToken(role = 'operator') {
  const secret = getOperatorSecret();
  const payload = `cp_op_${role}_${Date.now()}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export function verifyOperatorAuth(reqOrToken) {
  if (!reqOrToken) return false;

  let token = '';
  if (typeof reqOrToken === 'string') {
    token = reqOrToken.startsWith('Bearer ') ? reqOrToken.slice(7).trim() : reqOrToken.trim();
  } else if (typeof reqOrToken === 'object') {
    const headers = reqOrToken.headers || {};
    const authHeader = headers.authorization || headers.Authorization || '';
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (typeof authHeader === 'string' && authHeader.trim()) {
      token = authHeader.trim();
    } else if (headers['x-operator-token']) {
      token = String(headers['x-operator-token']).trim();
    } else if (reqOrToken.query?.token) {
      token = String(reqOrToken.query.token).trim();
    } else if (reqOrToken.body?.token) {
      token = String(reqOrToken.body.token).trim();
    }
  }

  if (!token || typeof token !== 'string') return false;
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex <= 0) return false;

  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!payload.startsWith('cp_op_') || !signature) return false;

  const expectedSig = crypto.createHmac('sha256', getOperatorSecret()).update(payload).digest('hex');
  if (signature.length !== expectedSig.length || !/^[0-9a-f]+$/i.test(signature)) {
    return false;
  }
  try {
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || sigBuf.length === 0) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

export async function dispatchCyberEmail({
  to,
  subject,
  badge = 'CYBERPULSE // DIRECTIVE',
  title = 'Operational Directive',
  description = '',
  footer = '',
}) {
  const safeBadge = escapeHtml(badge);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeFooter = escapeHtml(footer || `TIMESTAMP: ${new Date().toISOString()}`);

  const html = `
    <div style="background-color: #07070A; color: #FFFFFF; font-family: monospace; padding: 24px; border: 1px solid #00F0FF;">
      <h2 style="color: #FCEE0A; margin: 0 0 8px 0;">${safeBadge}</h2>
      <h3 style="color: #00F0FF; margin: 0 0 16px 0;">${safeTitle}</h3>
      <p style="color: #CCCCCC; font-size: 14px; line-height: 1.5;">${safeDescription}</p>
      <div style="margin-top: 20px; padding: 12px; background-color: #0F121D; border-left: 3px solid #00FF66; font-size: 12px; color: #888888;">
        ${safeFooter}
      </div>
    </div>
  `.trim();

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM || 'CyberPulse <onboarding@resend.dev>';

  if (!resendApiKey) {
    return {
      ok: true,
      simulated: true,
      provider: 'SIMULATED_LOCAL',
      id: `sim_${Date.now()}`,
      html,
    };
  }

  if (!to) {
    return {
      ok: false,
      simulated: false,
      provider: 'RESEND',
      error: 'Recipient email address is required',
      html,
    };
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: fromAddress,
      to,
      subject: subject || `[CyberPulse] ${title}`,
      html,
    }),
    signal: AbortSignal.timeout(10000),
  });

  const data = await emailRes.json().catch(() => ({}));
  return {
    ok: emailRes.ok,
    simulated: false,
    provider: 'RESEND',
    id: data?.id,
    data,
    error: emailRes.ok ? null : data?.error?.message || emailRes.statusText || 'Email dispatch failed',
    html,
  };
}

// Asia/Kolkata (IST = UTC+05:30 = +330 minutes)
const IST_OFFSET_MINUTES = 330;
const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

function makeIstCandidate(istNow, dayOffset, targetH, targetM) {
  const utcMs =
    Date.UTC(
      istNow.getUTCFullYear(),
      istNow.getUTCMonth(),
      istNow.getUTCDate() + dayOffset,
      targetH,
      targetM,
      0,
      0
    ) - IST_OFFSET_MS;
  return new Date(utcMs);
}

function getIstWeekday(istNow, dayOffset) {
  return new Date(
    Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + dayOffset, 12, 0, 0, 0)
  ).getUTCDay();
}

// Cadence calculation engine for accurate schedule tracking in Asia/Kolkata (UTC+05:30)
// Supports both computeNextTrigger(rem, forceTomorrow) and computeNextTrigger(cadence, config, forceTomorrow)
export function computeNextTrigger(remOrCadence, configOrForce = {}, maybeForceTomorrow = false) {
  let config = {};
  let cadence = 'daily';
  let forceTomorrow = false;

  if (typeof remOrCadence === 'object' && remOrCadence !== null) {
    config = remOrCadence;
    cadence = config.cadence || 'daily';
    forceTomorrow = typeof configOrForce === 'boolean' ? configOrForce : Boolean(maybeForceTomorrow);
  } else if (typeof remOrCadence === 'string') {
    if (remOrCadence.includes(':')) {
      config =
        typeof configOrForce === 'object' && configOrForce !== null
          ? { ...configOrForce, time: remOrCadence }
          : { time: remOrCadence };
      cadence = config.cadence || 'daily';
      forceTomorrow = typeof configOrForce === 'boolean' ? configOrForce : Boolean(maybeForceTomorrow);
    } else {
      cadence = remOrCadence || 'daily';
      if (typeof configOrForce === 'boolean') {
        forceTomorrow = configOrForce;
        config = {};
      } else {
        config = configOrForce || {};
        forceTomorrow = Boolean(maybeForceTomorrow);
      }
    }
  }

  const now = config.now instanceof Date ? config.now : new Date();
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);

  const timeStr = typeof config.time === 'string' && config.time.includes(':') ? config.time : '10:00';
  const [rawH, rawM] = timeStr.split(':');
  const targetH = Math.min(23, Math.max(0, parseInt(rawH, 10) || 0));
  const targetM = Math.min(59, Math.max(0, parseInt(rawM, 10) || 0));

  if (cadence === 'random') {
    // 10:00 AM IST (600m) to 11:00 PM IST (1380m)
    const randomMinutesOffset = Math.floor(Math.random() * 780);
    const totalMinutes = 600 + randomMinutesOffset;
    const randH = Math.floor(totalMinutes / 60);
    const randM = totalMinutes % 60;
    const candidate = makeIstCandidate(istNow, 0, randH, randM);
    if (!forceTomorrow && candidate.getTime() > now.getTime() + 60000) {
      return candidate.toISOString();
    }
    return makeIstCandidate(istNow, 1, randH, randM).toISOString();
  }

  if (cadence === 'interval') {
    const intervalDays = Math.max(1, parseInt(config.intervalDays, 10) || 2);
    const candidate = makeIstCandidate(istNow, 0, targetH, targetM);
    if (!forceTomorrow && candidate.getTime() > now.getTime() + 60000) {
      return candidate.toISOString();
    }
    return makeIstCandidate(istNow, intervalDays, targetH, targetM).toISOString();
  }

  if (cadence === 'weekdays') {
    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const allowed = (config.weekdays || ['mon', 'tue', 'wed', 'thu', 'fri'])
      .map((d) => (typeof d === 'string' ? dayMap[d.toLowerCase()] : d))
      .filter((d) => d !== undefined);
    const safeAllowed = allowed.length > 0 ? allowed : [1, 2, 3, 4, 5];

    for (let dayOffset = forceTomorrow ? 1 : 0; dayOffset <= 14; dayOffset++) {
      const candidate = makeIstCandidate(istNow, dayOffset, targetH, targetM);
      const istDay = getIstWeekday(istNow, dayOffset);
      if (safeAllowed.includes(istDay) && candidate.getTime() > now.getTime() + 60000) {
        return candidate.toISOString();
      }
    }
  }

  // Default: daily in Asia/Kolkata (UTC+05:30)
  const candidate = makeIstCandidate(istNow, 0, targetH, targetM);
  if (!forceTomorrow && candidate.getTime() > now.getTime() + 60000) {
    return candidate.toISOString();
  }
  return makeIstCandidate(istNow, 1, targetH, targetM).toISOString();
}

function getDefaultProfile() {
  return {
    id: 'operator_default',
    name: process.env.OPERATOR_NAME || 'Operator',
    email: process.env.OPERATOR_EMAIL || '',
    activeRole: 'student_intern_freelancer',
    uiMode: 'serious',
    certTargets: ['AWS Solutions Architect', 'GCP Associate Cloud Engineer', 'CKA Kubernetes'],
    dailyCapacityHours: 12,
  };
}

// In-memory fallback if no database connection string is provided yet
const memoryStore = {
  profile: getDefaultProfile(),
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
      email: process.env.OPERATOR_EMAIL || '',
      autoEmail: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextTriggerAt: computeNextTrigger({ cadence: 'daily', time: '10:00' }, false),
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
    await saveProfile(memoryStore.profile);
    return memoryStore.profile;
  } catch (err) {
    console.warn('DB getProfile failed, fallback to memory', err.message);
    return memoryStore.profile;
  }
}

export async function saveProfile(data) {
  const p = getDbPool();
  const safeProfile = {
    ...memoryStore.profile,
    ...data,
    id: data?.id || memoryStore.profile.id || 'operator_default',
    name: String(data?.name ?? memoryStore.profile.name ?? 'Operator').slice(0, 255),
    email: String(data?.email ?? memoryStore.profile.email ?? (process.env.OPERATOR_EMAIL || '')).slice(0, 255),
    activeRole: data?.activeRole || memoryStore.profile.activeRole || 'student_intern_freelancer',
    uiMode: data?.uiMode || memoryStore.profile.uiMode || 'serious',
    certTargets: Array.isArray(data?.certTargets) ? data.certTargets : memoryStore.profile.certTargets || [],
    dailyCapacityHours: Number(data?.dailyCapacityHours) || memoryStore.profile.dailyCapacityHours || 12,
  };

  memoryStore.profile = safeProfile;
  if (!p) {
    return memoryStore.profile;
  }

  await initDbSchema();
  try {
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
        safeProfile.id,
        safeProfile.name,
        safeProfile.email,
        safeProfile.activeRole,
        safeProfile.uiMode,
        JSON.stringify(safeProfile.certTargets),
        safeProfile.dailyCapacityHours,
      ]
    );
    return safeProfile;
  } catch (err) {
    console.warn('DB saveProfile failed, fallback to memory', err.message);
    return memoryStore.profile;
  }
}

function mapReminderRow(row) {
  return {
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
  };
}

// 2. Reminders Operations
export async function getReminders() {
  const p = getDbPool();
  if (!p) return memoryStore.reminders;

  await initDbSchema();
  try {
    const res = await p.query('SELECT * FROM cyber_reminders ORDER BY created_at DESC');
    if (res.rows.length === 0) {
      return memoryStore.reminders;
    }
    return res.rows.map(mapReminderRow);
  } catch (err) {
    console.warn('DB getReminders failed, fallback to memory', err.message);
    return memoryStore.reminders;
  }
}

export async function createReminder(data) {
  const p = getDbPool();
  const cadence = data.cadence || 'daily';
  const calculatedNext = computeNextTrigger({ ...data, cadence }, false);
  const item = {
    id: data.id || `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: String(data.title || 'Untitled Directive').slice(0, 255),
    theme: String(data.theme || 'work').slice(0, 64),
    description: String(data.description || '').slice(0, 2000),
    cadence,
    time: data.time || '10:00',
    intervalDays: Number(data.intervalDays) || 1,
    weekdays: Array.isArray(data.weekdays) ? data.weekdays : ['mon', 'tue', 'wed', 'thu', 'fri'],
    email: String(data.email ?? (process.env.OPERATOR_EMAIL || '')).slice(0, 255),
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

export async function updateReminder(id, patch = {}) {
  const p = getDbPool();
  const shouldRecompute =
    patch.nextTriggerAt === undefined &&
    (patch.time !== undefined ||
      patch.cadence !== undefined ||
      patch.intervalDays !== undefined ||
      patch.weekdays !== undefined ||
      patch.status === 'active');

  if (!p) {
    const idx = memoryStore.reminders.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    const current = memoryStore.reminders[idx];
    const merged = {
      ...current,
      ...patch,
      intervalDays: patch.intervalDays !== undefined ? Number(patch.intervalDays) : current.intervalDays,
    };
    if (shouldRecompute) {
      merged.nextTriggerAt = computeNextTrigger(merged, false);
    }
    memoryStore.reminders[idx] = merged;
    return merged;
  }

  await initDbSchema();
  try {
    let updates = { ...patch };
    if (shouldRecompute) {
      const existingRes = await p.query('SELECT * FROM cyber_reminders WHERE id = $1 LIMIT 1', [id]);
      if (existingRes.rows.length === 0) return null;
      const existing = mapReminderRow(existingRes.rows[0]);
      const merged = {
        ...existing,
        ...patch,
        intervalDays: patch.intervalDays !== undefined ? Number(patch.intervalDays) : existing.intervalDays,
      };
      updates.nextTriggerAt = computeNextTrigger(merged, false);
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.title !== undefined) { fields.push(`title = $${idx++}`); values.push(String(updates.title).slice(0, 255)); }
    if (updates.theme !== undefined) { fields.push(`theme = $${idx++}`); values.push(String(updates.theme).slice(0, 64)); }
    if (updates.description !== undefined) { fields.push(`description = $${idx++}`); values.push(String(updates.description).slice(0, 2000)); }
    if (updates.cadence !== undefined) { fields.push(`cadence = $${idx++}`); values.push(updates.cadence); }
    if (updates.time !== undefined) { fields.push(`time = $${idx++}`); values.push(updates.time); }
    if (updates.intervalDays !== undefined) { fields.push(`interval_days = $${idx++}`); values.push(Number(updates.intervalDays)); }
    if (updates.weekdays !== undefined) { fields.push(`weekdays = $${idx++}`); values.push(JSON.stringify(updates.weekdays)); }
    if (updates.email !== undefined) { fields.push(`email = $${idx++}`); values.push(String(updates.email).slice(0, 255)); }
    if (updates.autoEmail !== undefined) { fields.push(`auto_email = $${idx++}`); values.push(updates.autoEmail); }
    if (updates.status !== undefined) { fields.push(`status = $${idx++}`); values.push(updates.status); }
    if (updates.nextTriggerAt !== undefined) { fields.push(`next_trigger_at = $${idx++}`); values.push(updates.nextTriggerAt); }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE cyber_reminders SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await p.query(query, values);
    return res.rows[0] ? mapReminderRow(res.rows[0]) : null;
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
    title: String(log.title || 'Notification').slice(0, 255),
    recipient: String(log.recipient || 'recipient').slice(0, 255),
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

// 4. Operator Data Rights: Export & Delete All Data
export async function exportAllOperatorData() {
  const [profile, reminders, emailLogs] = await Promise.all([
    getProfile(),
    getReminders(),
    getEmailLogs(),
  ]);

  return {
    profile,
    reminders,
    emailLogs,
    exportedAt: new Date().toISOString(),
  };
}

export async function deleteAllOperatorData() {
  memoryStore.reminders = [];
  memoryStore.emailLogs = [];
  memoryStore.profile = getDefaultProfile();

  const p = getDbPool();
  if (p) {
    await initDbSchema();
    try {
      await Promise.all([
        p.query('DELETE FROM cyber_reminders'),
        p.query('DELETE FROM cyber_email_logs'),
        p.query('DELETE FROM cyber_profiles'),
      ]);
    } catch (err) {
      console.warn('DB deleteAllOperatorData failed on PostgreSQL:', err.message);
    }
  }

  return {
    status: 'deleted',
    deletedAt: new Date().toISOString(),
  };
}
