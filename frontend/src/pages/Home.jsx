import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, Clock, ThumbsUp } from 'lucide-react'
import { api } from '../utils/api.js'

const EXAMPLES = [
  "Your SBI account KYC expired. Update now: bit.ly/sbi-kyc",
  "Congratulations! You won ₹50,000 in KBC lottery. Call 9876543210",
  "Hi, I'm from Amazon HR. Your resume is selected. Pay ₹2000 registration fee",
  "CBI notice: You have pending case. Call immediately to avoid arrest",
  "Your electricity will be disconnected tonight. Pay bill: paytm.me/fake"
]

const INDIAN_STATES = [
  "Unknown","Andhra Pradesh","Bihar","Delhi","Gujarat","Karnataka",
  "Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"
]

export default function Home() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [reportForm, setReportForm] = useState({ reported_by: '', phone_number: '', state: 'Unknown' })
  const [reported, setReported] = useState(false)
  const [toast, setToast] = useState('')

  const handleAnalyze = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    setShowReport(false)
    setReported(false)
    try {
      const data = await api.analyze(message)
      setResult(data)
    } catch {
      setError('Could not connect to server. Make sure backend is running on port 8000.')
    }
    setLoading(false)
  }

  const handleReport = async () => {
    await api.submitReport({
      message_text: message,
      scam_type: result.scam_type,
      danger_level: result.danger_level,
      phone_number: reportForm.phone_number,
      reported_by: reportForm.reported_by || 'Anonymous',
      state: reportForm.state
    })
    setReported(true)
    setShowReport(false)
    showToast('✅ Reported! You just protected the community.')
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const getDangerIcon = (level) => {
    if (level === 'HIGH') return '🔴'
    if (level === 'MEDIUM') return '🟡'
    if (level === 'SAFE') return '🟢'
    return '🟡'
  }

  return (
    <div className="page">
      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">
          🛡️ Community Powered · AI Driven
        </div>
        <h1>Detect Scams<br />Protect Everyone</h1>
        <p>Paste any suspicious SMS, email, WhatsApp message or call transcript. AI analyzes it instantly and community reports protect others.</p>
      </div>

      {/* ANALYZE BOX */}
      <div className="analyze-box">
        <div className="analyze-label">Paste your suspicious message here</div>
        <textarea
          className="analyze-textarea"
          placeholder="Paste SMS, WhatsApp message, email, or call transcript here..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />

        <div className="analyze-label" style={{ marginBottom: 8 }}>Try an example:</div>
        <div className="example-chips">
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="chip" onClick={() => setMessage(ex)}>
              {ex.slice(0, 40)}...
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            className="btn btn-red"
            onClick={handleAnalyze}
            disabled={loading || !message.trim()}
          >
            <Shield size={18} />
            {loading ? 'Analyzing...' : 'Analyze Now'}
          </button>
          {message && (
            <button className="btn btn-ghost" onClick={() => { setMessage(''); setResult(null) }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ padding: '20px 0' }}>
          <div className="loading"><span /><span /><span /></div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>AI is analyzing the message...</p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div style={{ padding: 16, background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 8, color: '#ff8080', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* RESULT */}
      {result && !loading && (
        <>
          <div className={`result-card result-${result.danger_level}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div className={`danger-badge badge-${result.danger_level}`}>
                {getDangerIcon(result.danger_level)} {result.danger_level} RISK — {result.scam_type}
              </div>
              {result.similar_reports > 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={14} />
                  {result.similar_reports} similar reports in community
                </div>
              )}
            </div>

            {/* Probability Bar */}
            <div className="prob-bar-wrap">
              <div className="prob-label">
                <span>Scam Probability</span>
                <span style={{ fontWeight: 700, color: 'var(--white)' }}>{result.scam_probability}%</span>
              </div>
              <div className="prob-bar">
                <div
                  className={`prob-fill fill-${result.danger_level}`}
                  style={{ width: `${result.scam_probability}%` }}
                />
              </div>
            </div>

            {/* Explanation */}
            <div className="result-section">
              <div className="result-section-title">What's happening</div>
              <p className="result-text">{result.explanation}</p>
            </div>

            {/* Trick Used */}
            {result.trick_used && result.trick_used !== 'None' && (
              <div className="result-section">
                <div className="result-section-title">🧠 Psychological trick being used</div>
                <p className="result-text">{result.trick_used}</p>
              </div>
            )}

            {/* What to do */}
            <div className="result-section">
              <div className="result-section-title">✅ What you should do</div>
              <p className="result-text">{result.what_to_do}</p>
            </div>

            {/* Red Flags */}
            {result.red_flags && result.red_flags.length > 0 && (
              <div className="result-section">
                <div className="result-section-title">🚩 Red flags detected</div>
                <div className="red-flags">
                  {result.red_flags.map((flag, i) => (
                    <span key={i} className="red-flag-tag">{flag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Past Reports */}
            {result.past_reports && result.past_reports.length > 0 && (
              <div className="past-reports-box">
                <div className="result-section-title">📋 Community has seen this before</div>
                {result.past_reports.map((r, i) => (
                  <div key={i} className="past-report-item">
                    <strong style={{ color: 'var(--white)' }}>{r.scam_type}</strong> · reported from {r.state} · {new Date(r.created_at).toLocaleDateString()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REPORT BUTTON */}
          {!reported && result.danger_level !== 'SAFE' && (
            <div style={{ marginTop: 12 }}>
              {!showReport ? (
                <button className="btn btn-ghost" onClick={() => setShowReport(true)}>
                  <AlertTriangle size={16} />
                  Report this scam to community
                </button>
              ) : (
                <div className="report-form">
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 16 }}>
                    Report to Community
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Name (optional)</label>
                      <input className="form-input" placeholder="Anonymous" value={reportForm.reported_by} onChange={e => setReportForm(f => ({ ...f, reported_by: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Scammer's Phone (if any)</label>
                      <input className="form-input" placeholder="9876543210" value={reportForm.phone_number} onChange={e => setReportForm(f => ({ ...f, phone_number: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Your State</label>
                    <select className="form-select" value={reportForm.state} onChange={e => setReportForm(f => ({ ...f, state: e.target.value }))}>
                      {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-red" onClick={handleReport}>Submit Report</button>
                    <button className="btn btn-ghost" onClick={() => setShowReport(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {reported && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', marginTop: 12, fontSize: '0.9rem' }}>
              <CheckCircle size={18} />
              Report submitted! You just helped protect the community.
            </div>
          )}
        </>
      )}

      {toast && <div className="success-toast">{toast}</div>}
    </div>
  )
}
