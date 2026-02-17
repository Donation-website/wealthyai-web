const requests = new Map();

export function rateLimit(ip, limit = 3, windowMs = 60 * 60 * 1000) {
  const now = Date.now();

  if (!requests.has(ip)) {
    requests.set(ip, []);
  }

  const timestamps = requests
    .get(ip)
    .filter((time) => now - time < windowMs);

  if (timestamps.length >= limit) {
    return false;
  }

  timestamps.push(now);
  requests.set(ip, timestamps);

  return true;
}
