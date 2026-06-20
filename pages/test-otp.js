import React, { useState } from 'react'

export default function TestOTP() {
  const [phone, setPhone] = useState('775352074')
  const [name, setName] = useState('Test User')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSendOTP(e) {
    e && e.preventDefault()
    console.log('[TestOTP] handleSendOTP start', { phone, name })
    setLoading(true)
    setResult(null)
    try {
      console.log('[TestOTP] calling /api/send-otp')
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, studentName: name }),
      })
      const data = await res.json().catch(() => null)
      console.log('[TestOTP] fetch finished', { status: res.status, ok: res.ok, data })
      setResult({ status: res.status, ok: res.ok, data })
    } catch (err) {
      console.error('[TestOTP] fetch error', err)
      setResult({ error: String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>OTP Send Test</h1>
      <p>Use this page to test the `/api/send-otp` endpoint and surface console/network logs.</p>

      <form onSubmit={handleSendOTP} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <label>
          Phone (international, no +):
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="775352074"
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Name:
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Test User"
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
            {loading ? 'Sending…' : 'Send OTP'}
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('[TestOTP] manual network check — calling handleSendOTP')
              handleSendOTP()
            }}
            style={{ padding: '8px 12px' }}
          >
            Send (no submit)
          </button>
        </div>
      </form>

      <section style={{ marginTop: 20 }}>
        <h2>Result</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f8fa', padding: 12 }}>
          {JSON.stringify(result, null, 2) || 'No result yet. Check Console & Network tabs.'}
        </pre>
      </section>

      <section style={{ marginTop: 12 }}>
        <strong>Test steps:</strong>
        <ol>
          <li>Open DevTools → Console and Network (Preserve log).</li>
          <li>Click "Send OTP" and watch for console logs starting with <code>[TestOTP]</code>.</li>
          <li>Look for a POST to <code>/api/send-otp</code> in the Network tab.</li>
        </ol>
      </section>
    </div>
  )
}
