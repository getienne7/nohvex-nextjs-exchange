export interface AuditEvent {
  event: string
  user?: { id?: string | null; email?: string | null }
  ip?: string
  route?: string
  method?: string
  outcome: 'success' | 'failure'
  reason?: string
  meta?: Record<string, unknown>
  at?: string
}

export function logAudit(evt: AuditEvent) {
  const payload: AuditEvent = {
    ...evt,
    at: new Date().toISOString()
  }
  // For now, emit to stdout as structured JSON; can be replaced with real sink later
  console.info('[audit]', JSON.stringify(payload))
}
