import { useState, useEffect } from 'react'
import { ThumbsUp, AlertTriangle } from 'lucide-react'
import { api } from '../utils/api.js'

const DANGER_COLORS = {
  HIGH: { bg: 'var(--red-dim)', border: 'var(--red)', text: '#ff8080' },
  MEDIUM: { bg: 'var(--yellow-dim)', border: 'var(--yellow)', text: '#ffd060' },
  LOW: { bg: 'var(--yellow-dim)', border: 'var(--yellow)', text: '#ffd060' },
  SAFE: { bg: 'var(--green-dim)', border: 'var(--green)', text: '#00D26A' }
}

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const load = async () => {
    try {
      const data = await api.getReports()
      setReports(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleUpvote = async (id) => {
    await api.upvote(id)
    setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r))
  }

  const filtered = filter === 'ALL' ? reports : reports.filter(r => r.danger_level === filter)

  return (
    <div className="page-wide">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Community Reports</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Scams reported by users — helping protect everyone</p>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['ALL', 'HIGH', 'MEDIUM', 'SAFE'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-red' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All Reports' : `${f} Risk`}
          </button>
        ))}
        <span style={{ color: 'var(--muted)', fontSize: '0.8rem', alignSelf: 'center', marginLeft: 8 }}>
          {filtered.length} reports
        </span>
      </div>

      {loading ? (
        <div className="loading"><span /><span /><span /></div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <AlertTriangle size={40} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
          <p>No reports yet. Analyze a scam message and report it to start!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(r => {
            const colors = DANGER_COLORS[r.danger_level] || DANGER_COLORS.MEDIUM
            return (
              <div key={r.id} style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '3px 10px',
                      background: colors.border,
                      color: r.danger_level === 'HIGH' ? 'white' : '#000',
                      borderRadius: 12,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: 'Space Grotesk, sans-serif'
                    }}>
                      {r.danger_level}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: colors.text, fontWeight: 600 }}>{r.scam_type}</span>
                    {r.state && r.state !== 'Unknown' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>📍 {r.state}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--white)', marginBottom: 8, lineHeight: 1.5 }}>
                    "{r.message_text?.slice(0, 200)}{r.message_text?.length > 200 ? '...' : ''}"
                  </p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'flex', gap: 16 }}>
                    <span>By {r.reported_by || 'Anonymous'}</span>
                    {r.phone_number && <span>📞 {r.phone_number}</span>}
                    <span>{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={() => handleUpvote(r.id)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      color: 'var(--muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s'
                    }}
                    title="This helped me"
                  >
                    <ThumbsUp size={16} />
                    <span style={{ fontSize: '0.72rem' }}>{r.upvotes || 0}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
