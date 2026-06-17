const BASE = '/api'

export const api = {
  async analyze(message) {
    const res = await fetch(`${BASE}/analyze/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    if (!res.ok) throw new Error('Analysis failed')
    return res.json()
  },

  async submitReport(data) {
    const res = await fetch(`${BASE}/reports/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  async getReports() {
    const res = await fetch(`${BASE}/reports/`)
    return res.json()
  },

  async upvote(id) {
    await fetch(`${BASE}/reports/${id}/upvote`, { method: 'POST' })
  },

  async getStats() {
    const res = await fetch(`${BASE}/trends/stats`)
    return res.json()
  },

  async getLeaderboard() {
    const res = await fetch(`${BASE}/trends/leaderboard`)
    return res.json()
  }
}
