import { useState, useEffect } from 'react'
import { api } from '../utils/api.js'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getStats(), api.getLeaderboard()])
      .then(([s, l]) => { setStats(s); setLeaderboard(l) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page">
      <div className="loading"><span /><span /><span /></div>
    </div>
  )

  const maxCount = stats?.top_types?.[0]?.count || 1

  return (
    <div className="page-wide">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Community Dashboard</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Live scam trends reported by the community</p>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats?.total || 0}</div>
          <div className="stat-label">Total Scams Reported</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats?.top_types?.length || 0}</div>
          <div className="stat-label">Scam Types Detected</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{leaderboard.length}</div>
          <div className="stat-label">Active Reporters</div>
        </div>
      </div>

      <div className="two-col">
        {/* TOP SCAM TYPES */}
        <div className="card">
          <div className="section-title">🔥 Top Scam Types This Week</div>
          {stats?.top_types?.length > 0 ? (
            <div className="type-list">
              {stats.top_types.map((t, i) => (
                <div key={i} className="type-item">
                  <div className="type-name">{t.scam_type || 'Unknown'}</div>
                  <div className="type-bar-wrap">
                    <div className="type-bar" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                  </div>
                  <div className="type-count">{t.count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No scam reports yet. Be the first to report!</div>
          )}
        </div>

        {/* TOP STATES */}
        <div className="card">
          <div className="section-title">📍 Most Targeted States</div>
          {stats?.top_states?.length > 0 ? (
            <div className="type-list">
              {stats.top_states.map((s, i) => (
                <div key={i} className="type-item">
                  <div className="type-name">{s.state}</div>
                  <div className="type-bar-wrap">
                    <div className="type-bar" style={{ width: `${(s.count / (stats.top_states[0]?.count || 1)) * 100}%`, background: 'var(--blue)' }} />
                  </div>
                  <div className="type-count">{s.count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No state data yet</div>
          )}
        </div>
      </div>

      {/* LEADERBOARD */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-title">🏆 Top Scam Reporters</div>
        {leaderboard.length > 0 ? (
          <div className="leaderboard-list">
            {leaderboard.map((l, i) => (
              <div key={i} className="leaderboard-item">
                <div className={`rank rank-${i + 1}`}>#{i + 1}</div>
                <div className="lb-name">{l.reported_by}</div>
                <div className="lb-count">{l.reports} reports</div>
                <div style={{ fontSize: '1.2rem' }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🛡️'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            No named reporters yet. Submit a report with your name to appear here!
          </div>
        )}
      </div>

      {/* DAILY TREND */}
      {stats?.daily?.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="section-title">📈 Daily Reports (Last 7 Days)</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 100, padding: '10px 0' }}>
            {stats.daily.slice(0, 7).reverse().map((d, i) => {
              const maxD = Math.max(...stats.daily.map(x => x.count))
              const height = maxD > 0 ? (d.count / maxD) * 80 : 4
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{d.count}</div>
                  <div style={{ width: '100%', height: `${height}px`, background: 'var(--red)', borderRadius: 4, minHeight: 4 }} />
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{d.date?.slice(5)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
