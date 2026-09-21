const redactKeywords = ['password', 'token', 'secret', 'key'];

function redact(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const copy = { ...obj };
  for (const key in copy) {
    if (redactKeywords.some(k => key.toLowerCase().includes(k))) {
      copy[key] = '[REDACTED]';
    } else if (typeof copy[key] === 'object') {
      copy[key] = redact(copy[key]);
    }
  }
  return copy;
}

function formatMsg(level, msg, meta = {}) {
  const ts = new Date().toISOString();
  let log = `[${ts}] [${level.toUpperCase()}] ${msg}`;
  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(redact(meta))}`;
  }
  return log;
}

export const logger = {
  info: (msg, meta = {}) => console.log(formatMsg('info', msg, meta)),
  warn: (msg, meta = {}) => console.warn(formatMsg('warn', msg, meta)),
  error: (msg, meta = {}) => console.error(formatMsg('error', msg, meta)),
  security: (msg, meta = {}) => console.warn(formatMsg('security', `[SECURITY] ${msg}`, meta))
};
