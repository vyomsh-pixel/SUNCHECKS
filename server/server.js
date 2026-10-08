// CyberPulse 24/7 Autonomous Backend Scheduler & REST API
// Express.js + Native Background Evaluator Heartbeat

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendCyberEmail } from './emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const LOGS_FILE = path.join(DATA_DIR, 'email_logs.json');

// Ensure data files exist with clean initial structures
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
  }
  return defaultValue;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error writing ${filePath}:`, e);
  }
}

// Initial seed reminders if file empty
const INITIAL_REMINDERS = [
  {
    id: 'rem_work_standup',
    title: 'Intern Standup & Ticket Review',
    theme: 'work',
    description: 'Sync with team leads on API integration and ticket progress.',
    cadence: 'weekdays',
    time: '10:00',
    weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    intervalDays: 1,
    email: 'user@domain.com',
    autoEmail: true,
    status: 'active',
    mode: 'serious',
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
    nextTriggerAt: computeNextTrigger('weekdays', { time: '10:00', weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'] }),
  },
  {
    id: 'rem_cert_study',
    title: 'Cloud Certification Module & Practice Labs',
    theme: 'cert',
    description: 'Complete 2 chapters or lab scenarios for certification milestone.',
    cadence: 'interval',
    time: '19:00',
    intervalDays: 2,
    weekdays: [],
    email: 'user@domain.com',
    autoEmail: true,
    status: 'active',
    mode: 'serious',
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
    nextTriggerAt: computeNextTrigger('interval', { time: '19:00', intervalDays: 2 }),
  },
  {
    id: 'rem_random_focus',
    title: 'Randomized Neural Reset & Hydration Check',
    theme: 'life',
    description: 'Step away from screen, drink 500ml water, stretch shoulders.',
    cadence: 'random',
    time: '14:30',
    intervalDays: 1,
    weekdays: [],
    email: 'user@domain.com',
    autoEmail: true,
    status: 'active',
    mode: 'fun',
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
    nextTriggerAt: computeNextTrigger('random', {}),
  },
];

const INITIAL_PROFILE = {
  name: 'Vyom',
  email: 'user@domain.com',
  activeRole: 'student_intern_freelancer', // 'student', 'intern', 'freelancer', 'student_intern_freelancer'
  uiMode: 'serious', // 'serious' | 'fun'
  certTargets: ['AWS Solutions Architect', 'GCP Associate Cloud Engineer'],
  dailyBandwidthHours: 12,
  notificationsEnabled: true,
};

let reminders = readJsonFile(REMINDERS_FILE, INITIAL_REMINDERS);
let profile = readJsonFile(PROFILE_FILE, INITIAL_PROFILE);
let emailLogs = readJsonFile(LOGS_FILE, []);

if (!fs.existsSync(REMINDERS_FILE)) writeJsonFile(REMINDERS_FILE, reminders);
if (!fs.existsSync(PROFILE_FILE)) writeJsonFile(PROFILE_FILE, profile);
if (!fs.existsSync(LOGS_FILE)) writeJsonFile(LOGS_FILE, emailLogs);

// Cadence calculation engine
export function computeNextTrigger(cadence, config = {}, forceTomorrow = false) {
  const now = new Date();
  const timeStr = config.time || '10:00';
  const [targetH, targetM] = timeStr.split(':').map((n) => parseInt(n, 10) || 0);

  if (cadence === 'random') {
    // Generate random time between 10:00 AM (10:00) and 11:00 PM (23:00)
    // 10:00 = 600 minutes, 23:00 = 1380 minutes (780 min range)
    const randomMinutesOffset = Math.floor(Math.random() * 780);
    const totalMinutes = 600 + randomMinutesOffset;
    const randH = Math.floor(totalMinutes / 60);
    const randM = totalMinutes % 60;

    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), randH, randM, 0, 0);
    if (!forceTomorrow && candidate.getTime() > now.getTime() + 60000) {
      return candidate.toISOString();
    }
    // Schedule for tomorrow
    candidate.setDate(candidate.getDate() + 1);
    return candidate.toISOString();
  }

  if (cadence === 'daily') {
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetH, targetM, 0, 0);
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
      .map((d) => dayMap[d.toLowerCase()])
      .filter((d) => d !== undefined);

    if (allowed.length === 0) {
      allowed.push(1, 2, 3, 4, 5); // default weekdays
    }

    // Look up to 14 days ahead
    for (let dayOffset = forceTomorrow ? 1 : 0; dayOffset <= 14; dayOffset++) {
      const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, targetH, targetM, 0, 0);
      if (allowed.includes(candidate.getDay())) {
        if (candidate.getTime() > now.getTime() + 60000) {
          return candidate.toISOString();
        }
      }
    }
  }

  // Fallback 24h
  const fallback = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return fallback.toISOString();
}

// 24/7 Background Scheduler Heartbeat (Runs every 60 seconds)
const DAEMON_START_TIME = new Date().toISOString();
console.log(`[CYBERPULSE DAEMON] 24/7 Autonomous Scheduler online at ${DAEMON_START_TIME}`);

async function runReminderHeartbeat() {
  const nowTime = new Date().getTime();
  let changed = false;

  for (const rem of reminders) {
    if (rem.status !== 'active') continue;
    if (rem.autoEmail === false) continue;

    const dueTime = new Date(rem.nextTriggerAt).getTime();
    if (nowTime >= dueTime) {
      console.log(`[CYBERPULSE DAEMON] Triggering reminder: "${rem.title}" (${rem.cadence})`);

      const targetEmail = rem.email || profile.email;
      const cadenceText =
        rem.cadence === 'daily'
          ? `Daily at ${rem.time}`
          : rem.cadence === 'interval'
          ? `Every ${rem.intervalDays} days at ${rem.time}`
          : rem.cadence === 'weekdays'
          ? `Weekdays (${(rem.weekdays || []).join(', ').toUpperCase()}) at ${rem.time}`
          : 'Random Daily (10:00 AM - 11:00 PM Window)';

      const nextTrigger = computeNextTrigger(rem.cadence, rem, true);

      try {
        const result = await sendCyberEmail({
          to: targetEmail,
          subject: `[CyberPulse] ${rem.title}`,
          title: rem.title,
          theme: rem.theme,
          cadenceText,
          description: rem.description,
          mode: profile.uiMode || 'serious',
          nextTriggerFormatted: new Date(nextTrigger).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        });

        emailLogs.unshift({
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          reminderId: rem.id,
          title: rem.title,
          recipient: targetEmail,
          timestamp: new Date().toISOString(),
          provider: result.provider,
          status: 'dispatched',
        });

        if (emailLogs.length > 50) emailLogs.length = 50; // keep last 50 logs
        writeJsonFile(LOGS_FILE, emailLogs);
      } catch (err) {
        console.error(`[CYBERPULSE DAEMON] Email error for ${rem.id}:`, err);
      }

      rem.lastTriggeredAt = new Date().toISOString();
      rem.nextTriggerAt = nextTrigger;
      changed = true;
    }
  }

  if (changed) {
    writeJsonFile(REMINDERS_FILE, reminders);
  }
}

// Start heartbeat interval (every 60 seconds)
setInterval(runReminderHeartbeat, 60_000);

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// API Endpoints
app.get('/api/status', (req, res) => {
  res.json({
    online: true,
    daemonStartTime: DAEMON_START_TIME,
    uptimeSeconds: Math.floor((Date.now() - new Date(DAEMON_START_TIME).getTime()) / 1000),
    activeCount: reminders.filter((r) => r.status === 'active').length,
    totalReminders: reminders.length,
    serverTime: new Date().toISOString(),
  });
});

app.get('/api/reminders', (req, res) => {
  res.json(reminders);
});

app.post('/api/reminders', (req, res) => {
  const { title, theme, description, cadence, time, intervalDays, weekdays, email, autoEmail } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newReminder = {
    id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    theme: theme || 'work',
    description: description || '',
    cadence: cadence || 'daily',
    time: time || '10:00',
    intervalDays: Number(intervalDays) || 1,
    weekdays: Array.isArray(weekdays) && weekdays.length > 0 ? weekdays : ['mon', 'tue', 'wed', 'thu', 'fri'],
    email: email || profile.email,
    autoEmail: autoEmail !== false,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastTriggeredAt: null,
    nextTriggerAt: computeNextTrigger(cadence || 'daily', { time, intervalDays, weekdays }),
  };

  reminders.unshift(newReminder);
  writeJsonFile(REMINDERS_FILE, reminders);
  res.status(201).json(newReminder);
});

app.put('/api/reminders/:id', (req, res) => {
  const idx = reminders.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Reminder not found' });
  }

  const existing = reminders[idx];
  const updated = { ...existing, ...req.body };

  // If cadence or time changed, recompute nextTriggerAt
  if (req.body.cadence || req.body.time || req.body.intervalDays || req.body.weekdays) {
    updated.nextTriggerAt = computeNextTrigger(updated.cadence, updated);
  }

  reminders[idx] = updated;
  writeJsonFile(REMINDERS_FILE, reminders);
  res.json(updated);
});

app.delete('/api/reminders/:id', (req, res) => {
  reminders = reminders.filter((r) => r.id !== req.params.id);
  writeJsonFile(REMINDERS_FILE, reminders);
  res.json({ success: true });
});

// Trigger immediate test email for specific reminder
app.post('/api/reminders/:id/trigger-now', async (req, res) => {
  const rem = reminders.find((r) => r.id === req.params.id);
  if (!rem) {
    return res.status(404).json({ error: 'Reminder not found' });
  }

  const targetEmail = req.body.email || rem.email || profile.email;
  const cadenceText =
    rem.cadence === 'daily'
      ? `Daily at ${rem.time}`
      : rem.cadence === 'interval'
      ? `Every ${rem.intervalDays} days at ${rem.time}`
      : rem.cadence === 'weekdays'
      ? `Weekdays (${(rem.weekdays || []).join(', ').toUpperCase()}) at ${rem.time}`
      : 'Random Daily (10:00 AM - 11:00 PM)';

  try {
    const result = await sendCyberEmail({
      to: targetEmail,
      subject: `[CyberPulse Instant] ${rem.title}`,
      title: rem.title,
      theme: rem.theme,
      cadenceText,
      description: rem.description,
      mode: profile.uiMode || 'serious',
      nextTriggerFormatted: new Date(rem.nextTriggerAt).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    });

    emailLogs.unshift({
      id: `log_inst_${Date.now()}`,
      reminderId: rem.id,
      title: rem.title,
      recipient: targetEmail,
      timestamp: new Date().toISOString(),
      provider: result.provider,
      status: 'instant_trigger',
    });
    writeJsonFile(LOGS_FILE, emailLogs);

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  const to = req.body.email || profile.email;
  try {
    const result = await sendCyberEmail({
      to,
      subject: '[CyberPulse] Neural Dispatch Verification',
      title: 'Neural Link Established',
      theme: 'work',
      cadenceText: 'Autonomous Verification Ping',
      description: 'Your CyberPulse 24/7 background scheduler is operational and ready to auto-dispatch reminders.',
      mode: profile.uiMode || 'serious',
      nextTriggerFormatted: 'Active 24/7 in background',
    });

    emailLogs.unshift({
      id: `log_test_${Date.now()}`,
      reminderId: 'test_ping',
      title: 'Neural Link Verification',
      recipient: to,
      timestamp: new Date().toISOString(),
      provider: result.provider,
      status: 'verification_sent',
    });
    writeJsonFile(LOGS_FILE, emailLogs);

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/profile', (req, res) => {
  res.json(profile);
});

app.put('/api/profile', (req, res) => {
  profile = { ...profile, ...req.body };
  writeJsonFile(PROFILE_FILE, profile);
  res.json(profile);
});

app.get('/api/logs', (req, res) => {
  res.json(emailLogs);
});

const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[CYBERPULSE SERVER] Running on port ${PORT}`);
});
