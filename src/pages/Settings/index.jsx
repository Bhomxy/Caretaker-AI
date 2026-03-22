import { useCallback, useEffect, useMemo, useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Toggle from '../../components/ui/Toggle'
import { useApp } from '../../hooks/useApp'
import {
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
  SETTINGS_STORAGE_AI,
  SETTINGS_STORAGE_NOTIFICATIONS,
} from '../../lib/constants'
import { pickField } from '../../lib/utils'

const NAV = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'ai', label: 'AI agent' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'team', label: 'Team' },
  { id: 'billing', label: 'Billing' },
]

const DEFAULT_NOTIF = {
  rentDue: true,
  complaints: true,
  paymentReceived: true,
  paymentApproval: true,
  leaseExpiry: true,
}

const DEFAULT_AI = {
  autoRespond: true,
  autoLog: true,
  autoReminders: true,
  tone: 'friendly',
  hours: 'business',
}

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch {
    return fallback
  }
}

/** PRD §8.10 */
export default function SettingsPage() {
  const { user, showToast } = useApp()
  const [section, setSection] = useState('profile')
  const [notif, setNotif] = useState(() =>
    readStore(SETTINGS_STORAGE_NOTIFICATIONS, DEFAULT_NOTIF)
  )
  const [ai, setAi] = useState(() => readStore(SETTINGS_STORAGE_AI, DEFAULT_AI))

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_NOTIFICATIONS, JSON.stringify(notif))
  }, [notif])

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_AI, JSON.stringify(ai))
  }, [ai])

  const displayName = useMemo(() => {
    const meta = user?.user_metadata ?? {}
    return (
      pickField(meta, ['full_name', 'name', 'display_name']) ??
      user?.email?.split('@')[0] ??
      'Manager'
    )
  }, [user])

  const email = user?.email ?? '—'
  const phone =
    pickField(user?.user_metadata ?? {}, ['phone', 'phone_number']) ?? '—'
  const portfolio =
    pickField(user?.user_metadata ?? {}, ['portfolio_name', 'company']) ??
    'My portfolio'

  const patchNotif = useCallback((key, value) => {
    setNotif((s) => ({ ...s, [key]: value }))
  }, [])

  const patchAi = useCallback((key, value) => {
    setAi((s) => ({ ...s, [key]: value }))
  }, [])

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <nav className="w-full shrink-0 lg:w-52">
        <Card title="Settings" bodyClassName="p-2">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors ${
                    section === item.id
                      ? 'bg-teal-pale text-teal-dk'
                      : 'text-ink-secondary hover:bg-page'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </nav>

      <div className="min-w-0 flex-1 space-y-4">
        {section === 'profile' ? (
          <Card title="Profile">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar name={displayName} size="lg" tone="light" />
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className={FORM_LABEL_CLASS}>Name</p>
                  <p className="text-sm font-semibold text-ink">{displayName}</p>
                </div>
                <div>
                  <p className={FORM_LABEL_CLASS}>Email</p>
                  <p className="text-sm font-semibold text-ink">{email}</p>
                </div>
                <div>
                  <p className={FORM_LABEL_CLASS}>Phone</p>
                  <p className="text-sm font-semibold text-ink">{phone}</p>
                </div>
                <div>
                  <p className={FORM_LABEL_CLASS}>Portfolio name</p>
                  <p className="text-sm font-semibold text-ink">{portfolio}</p>
                </div>
                <p className="text-xs font-medium text-ink-muted">
                  Profile details are managed in Supabase Auth. Update metadata
                  in the dashboard or ask your admin to adjust your account.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        {section === 'notifications' ? (
          <Card title="Notifications">
            <div className="space-y-4">
              <Toggle
                checked={notif.rentDue}
                onChange={(v) => patchNotif('rentDue', v)}
                label="Rent due reminders"
              />
              <Toggle
                checked={notif.complaints}
                onChange={(v) => patchNotif('complaints', v)}
                label="New complaint alerts"
              />
              <Toggle
                checked={notif.paymentReceived}
                onChange={(v) => patchNotif('paymentReceived', v)}
                label="Payment received"
              />
              <Toggle
                checked={notif.paymentApproval}
                onChange={(v) => patchNotif('paymentApproval', v)}
                label="Payment awaiting approval"
              />
              <Toggle
                checked={notif.leaseExpiry}
                onChange={(v) => patchNotif('leaseExpiry', v)}
                label="Lease expiry warnings"
              />
              <p className="text-xs font-medium text-ink-muted">
                Preferences are saved on this device only until notification
                delivery is connected to your account.
              </p>
            </div>
          </Card>
        ) : null}

        {section === 'ai' ? (
          <Card title="AI agent">
            <div className="space-y-4">
              <Toggle
                checked={ai.autoRespond}
                onChange={(v) => patchAi('autoRespond', v)}
                label="AI auto-respond"
              />
              <Toggle
                checked={ai.autoLog}
                onChange={(v) => patchAi('autoLog', v)}
                label="AI auto-log complaints"
              />
              <Toggle
                checked={ai.autoReminders}
                onChange={(v) => patchAi('autoReminders', v)}
                label="AI auto-send reminders"
              />
              <div>
                <label htmlFor="ai-tone" className={FORM_LABEL_CLASS}>
                  Tone
                </label>
                <select
                  id="ai-tone"
                  value={ai.tone}
                  onChange={(e) => patchAi('tone', e.target.value)}
                  className={FORM_INPUT_CLASS}
                >
                  <option value="formal">Formal</option>
                  <option value="friendly">Friendly</option>
                  <option value="pidgin">Pidgin</option>
                </select>
              </div>
              <div>
                <label htmlFor="ai-hours" className={FORM_LABEL_CLASS}>
                  Working hours
                </label>
                <select
                  id="ai-hours"
                  value={ai.hours}
                  onChange={(e) => patchAi('hours', e.target.value)}
                  className={FORM_INPUT_CLASS}
                >
                  <option value="24-7">24/7</option>
                  <option value="business">Business hours (9–6)</option>
                  <option value="quiet">Quiet nights (no 10pm–7am)</option>
                </select>
              </div>
            </div>
          </Card>
        ) : null}

        {section === 'whatsapp' ? (
          <Card title="WhatsApp">
            <p className="text-sm font-medium text-ink-secondary">
              Connected number, webhook status, and test connection are managed
              by your Caretaker AI backend. This panel will show live status once
              the integration is provisioned.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2 border-b border-border py-2">
                <dt className="font-semibold text-ink-muted">Connected number</dt>
                <dd className="font-bold text-ink">Not connected</dd>
              </div>
              <div className="flex justify-between gap-2 border-b border-border py-2">
                <dt className="font-semibold text-ink-muted">Webhook</dt>
                <dd className="font-bold text-ink">Idle</dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() =>
                showToast('Test connection runs from the backend console.', {
                  variant: 'info',
                })
              }
            >
              Test connection
            </Button>
          </Card>
        ) : null}

        {section === 'team' ? (
          <Card title="Team access">
            <p className="text-sm font-medium text-ink-secondary">
              Invite colleagues and assign roles (Owner, Manager, Viewer) once
              organisation accounts ship.
            </p>
            <Button type="button" className="mt-4" disabled>
              Invite member
            </Button>
          </Card>
        ) : null}

        {section === 'billing' ? (
          <Card title="Billing">
            <p className="text-sm font-medium text-ink-secondary">
              Plan, usage, and upgrades will appear here when billing is enabled
              for your workspace.
            </p>
            <div className="mt-4 rounded-xl border border-border bg-page px-4 py-3 text-sm">
              <p className="font-extrabold text-ink">Caretaker AI — Dashboard</p>
              <p className="mt-1 text-ink-secondary">Current plan: Pilot</p>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
