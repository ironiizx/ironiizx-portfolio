// Server-reported allowance; the browser never grants or resets paid usage.
export function allowanceView(status, needed = 1, timeZone) {
  if (!status?.configured || !Number.isInteger(status.remaining)) return null;
  const remaining = Math.max(0, status.remaining);
  const blocked = remaining < needed;
  const date = new Date(status.resetAt);
  const reset = Number.isFinite(date.getTime())
    ? `Resets ${new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short', ...(timeZone ? { timeZone } : {}) }).format(date)}`
    : 'Resets at 00:00 UTC';
  const cap = status.limitedBy === 'shared'
    ? 'Shared AI allowance'
    : Number.isInteger(status.limit) ? `Daily image cap: ${status.limit}` : 'Daily image allowance';
  return {
    blocked,
    summary: `${remaining} AI ${remaining === 1 ? 'edit' : 'edits'} left today${blocked ? ` · ${needed} needed` : ''}`,
    detail: `${cap} · ${reset}`,
    message: `${remaining} AI edits left today; this action needs ${needed}. ${cap}. ${reset}.`
  };
}
