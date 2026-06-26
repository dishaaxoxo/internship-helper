'use client'

import { useState } from 'react'

const ROLES = [
  'AI / ML Engineer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Software Tester / QA',
  'Data Analyst',
  'Cybersecurity',
  'Research Intern',
]

interface Output {
  summary: string
  bullets: string[]
  coverLineOpener: string
}

export default function Home() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [skills, setSkills] = useState('')
  const [projects, setProjects] = useState('')
  const [extras, setExtras] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [companyContext, setCompanyContext] = useState('')

  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<Output | null>(null)
  const [error, setError] = useState('')
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [copiedBullets, setCopiedBullets] = useState(false)
  const [copiedOpener, setCopiedOpener] = useState(false)

  const handleGenerate = async () => {
    if (!skills.trim() || !selectedRole) {
      setError('Please fill in your skills and select a role.')
      return
    }
    setError('')
    setLoading(true)
    setOutput(null)

    const prompt = `You are helping a student write a strong internship application.

Student details:
- Name: ${name || 'the applicant'}
- Skills: ${skills}
- Projects: ${projects || 'none mentioned'}
- Extracurriculars / extras: ${extras || 'none mentioned'}
- Applying for role: ${selectedRole}
- Company/context: ${companyContext || 'not specified'}

Generate the following, based ONLY on what is provided. Do not invent skills or projects not mentioned. Be specific, direct, and honest. Output valid JSON with exactly these keys:

{
  "summary": "A 2-3 sentence 'Why hire me' paragraph. First person. Specific to the role. No fluff.",
  "bullets": ["4 bullet points, each starting with a strong past-tense action verb, showing a real skill or achievement from the details above. Each bullet max 18 words."],
  "coverLineOpener": "One strong opening sentence for a cover note. Mentions the role and one specific thing about the student. Max 30 words."
}

Return only valid JSON. No markdown, no explanation.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await res.json()
      const text = data.content?.map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '').join('') || ''
      const cleaned = text.replace(/```json|```/g, '').trim()
      const parsed: Output = JSON.parse(cleaned)
      setOutput(parsed)
    } catch {
      setError('Something went wrong generating your output. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <span className="logo">Intern<span>Ready</span></span>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>Free · No sign-up</span>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <span className="hero-eyebrow">Internship Application Helper</span>
          <h1>Write it right,<br />get the call back.</h1>
          <p>Turn your skills and projects into a clear, honest application — in under a minute.</p>
        </section>

        <div className="form-card">
          <p className="form-section-title">About you</p>
          <div className="field-group">
            <div className="field">
              <label>Your name</label>
              <input
                type="text"
                placeholder="e.g. Disha Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Your email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <p className="form-section-title">Your experience</p>
          <div className="field-group">
            <div className="field">
              <label>Skills <span style={{ color: 'var(--accent)' }}>*</span></label>
              <span className="hint">Languages, tools, frameworks — list them plainly</span>
              <textarea
                placeholder="Python, FastAPI, SQL, Git, Power BI, basic ML..."
                value={skills}
                onChange={e => setSkills(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Projects</label>
              <span className="hint">What you built and what it did — one line each is fine</span>
              <textarea
                placeholder="Sentiment analysis dashboard using FastAPI + PyTorch; research paper on IoMT security using Isolation Forest..."
                value={projects}
                onChange={e => setProjects(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Extracurriculars / other experience</label>
              <span className="hint">Clubs, competitions, awards, leadership roles</span>
              <textarea
                placeholder="Best Delegate at MUN; Logistics head at university cultural fest..."
                value={extras}
                onChange={e => setExtras(e.target.value)}
              />
            </div>
          </div>

          <p className="form-section-title">The role</p>
          <div className="field-group">
            <div className="field">
              <label>Role you're applying for <span style={{ color: 'var(--accent)' }}>*</span></label>
              <div className="tags-row">
                {ROLES.map(r => (
                  <button
                    key={r}
                    className={`tag-btn ${selectedRole === r ? 'active' : ''}`}
                    onClick={() => setSelectedRole(r)}
                    type="button"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Company or context <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. early-stage startup, EdTech company, defence research lab..."
                value={companyContext}
                onChange={e => setCompanyContext(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={loading}
            type="button"
          >
            {loading ? 'Generating…' : 'Generate my application →'}
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Crafting your application…</p>
          </div>
        )}

        {output && !loading && (
          <div className="output-card">
            <p className="output-label">✦ Your application, ready to use</p>

            <div className="output-block">
              <h3>Cover note opener</h3>
              <p className="output-text">{output.coverLineOpener}</p>
              <button
                className={`copy-btn ${copiedOpener ? 'copied' : ''}`}
                onClick={() => copy(output.coverLineOpener, setCopiedOpener)}
                type="button"
              >
                {copiedOpener ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className="output-block">
              <h3>"Why hire me" summary</h3>
              <p className="output-text">{output.summary}</p>
              <button
                className={`copy-btn ${copiedSummary ? 'copied' : ''}`}
                onClick={() => copy(output.summary, setCopiedSummary)}
                type="button"
              >
                {copiedSummary ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className="output-block">
              <h3>Application bullets</h3>
              <ul className="output-bullets">
                {output.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <button
                className={`copy-btn ${copiedBullets ? 'copied' : ''}`}
                onClick={() => copy(output.bullets.map(b => '• ' + b).join('\n'), setCopiedBullets)}
                type="button"
              >
                {copiedBullets ? '✓ Copied' : 'Copy all bullets'}
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '8px' }}>
              Review before you send — this is a starting point, not a final draft.
            </p>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-author">
            <strong>{name || 'Your Name'}</strong>
            {email && <> · <a href={`mailto:${email}`}>{email}</a></>}
            <br />
            <span>Built as a free tool for students applying to internships.</span>
          </div>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dh"
          >
            Built for Digital Heroes ↗
          </a>
        </div>
      </footer>
    </>
  )
}
