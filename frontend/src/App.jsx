import { useState, useEffect, useRef, useCallback } from 'react';
import Loader from './Loader';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism-tomorrow.css';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:3000';
const LANGUAGES = ['javascript','python','java','c','cpp'];
const LANG_LABELS = { javascript:'JS', python:'PY', java:'Java', c:'C', cpp:'C++' };
const DEFAULT_CODE = `// Paste your code here or import from GitHub
function fetchUserData(userId) {
  const url = "http://api.example.com/users/" + userId;
  var data = fetch(url);
  return data;
}`;

export default function App() {
  const [tab,         setTab]         = useState('editor');
  const [code,        setCode]        = useState(DEFAULT_CODE);
  const [review,      setReview]      = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [lang,        setLang]        = useState('javascript');
  const [githubUrl,   setGithubUrl]   = useState('');
  const [ghLoading,   setGhLoading]   = useState(false);
  const [ghError,     setGhError]     = useState('');
  const [analytics,   setAnalytics]   = useState(null);
  const [history,     setHistory]     = useState([]);
  const [anaLoading,  setAnaLoading]  = useState(false);
  const reviewRef = useRef(null);
  
const [appReady, setAppReady] = useState(false);
  // ── Fetch analytics ──
  const fetchAnalytics = useCallback(async () => {
    setAnaLoading(true);
    try {
      const [anaRes, histRes] = await Promise.all([
        axios.get(`${API}/data/analytics`),
        axios.get(`${API}/data/history?limit=20`)
      ]);
      setAnalytics(anaRes.data.analytics);
      setHistory(histRes.data.reviews);
    } catch { /* ignore */ }
    setAnaLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'analytics' || tab === 'history') fetchAnalytics();
  }, [tab, fetchAnalytics]);

  // ── Syntax highlight ──
  const highlight = code =>
    Prism.highlight(code, Prism.languages[lang] || Prism.languages.javascript, lang);

  // ── Review code ──
  async function reviewCode() {
    if (!code.trim()) return;
    setLoading(true); setReview(''); setError('');
    try {
      const res = await axios.post(`${API}/ai/get-review`, { code, language: lang });
      setReview(res.data);
      setTimeout(() => reviewRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    } catch (err) {
      const msg    = err.response?.data?.error || '';
      const hint   = err.response?.data?.hint  || '';
      const status = err.response?.status || 'Network Error';
      let display  = '';
      if (!err.response)                           display = '🔌 **Cannot reach backend.** Make sure it\'s running:\n```\ncd backend && npm run dev\n```';
      else if (msg.includes('429'))                display = `⚠️ **Quota exceeded.** Create a new API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and update \`.env\`.`;
      else if (msg.includes('429') || msg.includes('Rate limit')) display = `⏱️ **Rate limited.** You can make 10 reviews per minute. Please wait and try again.`;
      else                                         display = `❌ **Error (${status})**\n\`${msg}\`\n\n${hint ? `💡 ${hint}` : ''}`;
      setError(display);
    }
    setLoading(false);
  }

  // ── GitHub import ──
  async function importFromGitHub() {
    if (!githubUrl.trim()) return;
    setGhLoading(true); setGhError('');
    try {
      const res = await axios.post(`${API}/github/fetch`, { url: githubUrl });
      setCode(res.data.code);
      setLang(res.data.language);
      setGithubUrl('');
      setTab('editor');
    } catch (err) {
      setGhError(err.response?.data?.error || 'Failed to fetch from GitHub');
    }
    setGhLoading(false);
  }

  // ── Delete history ──
  async function deleteHistory(id, e) {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/data/history/${id}`);
      setHistory(h => h.filter(r => r.id !== id));
    } catch { /* ignore */ }
  }

  // ── Load review from history ──
  function loadFromHistory(item) {
    setCode(item.codeSnippet.replace('...', ''));
    setReview(item.review);
    setLang(item.language);
    setTab('editor');
  }

  const lineCount = code.split('\n').length;
  const charCount = code.length;
  const maxBar    = analytics ? Math.max(...analytics.dailyReviews.map(d => d.count), 1) : 1;
  const maxLang   = analytics ? Math.max(...(analytics.languageBreakdown.map(l => l.count) || [1])) : 1;

  return (
  <>
    {!appReady && <Loader onComplete={() => setAppReady(true)} />}
    <div className="app-wrapper" style={{ opacity: appReady ? 1 : 0, transition: 'opacity 0.4s ease' }}>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="brand-icon">⚡</div>
          CodeSense AI
          <span className="brand-badge">v2</span>
        </div>

        <div className="navbar-tabs">
          {[['editor','<> Editor'],['analytics','📊 Analytics'],['history','🕒 History']].map(([id,label]) => (
            <button key={id} className={`nav-tab${tab===id?' active':''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        <div className="navbar-meta">
          <span className="status-dot">Gemini 2.5 Flash</span>
          <span>{lineCount} lines</span>
        </div>
      </nav>

      {/* ═══ EDITOR TAB ═══ */}
      <div className={`tab-view${tab==='editor'?' active':''}`}>
        <div className="panels">

          {/* LEFT: Editor */}
          <div className="editor-panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
                Code Editor
              </div>
              <div className="lang-tabs">
                {LANGUAGES.map(l => (
                  <button key={l} className={`lang-tab${lang===l?' active':''}`} onClick={() => setLang(l)}>
                    {LANG_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>

            <div className="editor-scroll">
              <Editor
                value={code} onValueChange={setCode} highlight={highlight} padding={16}
                style={{ fontFamily:'JetBrains Mono, monospace', fontSize:13.5, lineHeight:1.65, minHeight:'100%', background:'transparent', color:'#cdd6f4' }}
              />
            </div>

            <div className="editor-footer">
              {/* GitHub import */}
              <div className="github-import">
                <input
                  className="github-input"
                  placeholder="github.com/owner/repo/blob/main/file.js"
                  value={githubUrl}
                  onChange={e => { setGithubUrl(e.target.value); setGhError(''); }}
                  onKeyDown={e => e.key === 'Enter' && importFromGitHub()}
                />
                <button className="github-btn" onClick={importFromGitHub} disabled={ghLoading || !githubUrl.trim()}>
                  {ghLoading ? <div className="spinner" style={{width:11,height:11}}/> : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  )}
                  Import
                </button>
              </div>
              {ghError && <span style={{fontSize:'0.68rem',color:'var(--red)',maxWidth:200}}>{ghError}</span>}
              <span className="char-count">{lang.toUpperCase()} · {lineCount}L</span>
              <button className={`review-btn${loading?' loading':''}`} onClick={reviewCode} disabled={loading || !code.trim()}>
                {loading ? <><div className="spinner"/>Analyzing...</> : <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Review Code
                </>}
              </button>
            </div>
          </div>

          {/* RIGHT: Review */}
          <div className="review-panel">
            <div className="panel-header">
              <div className="panel-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                AI Review
              </div>
              {review && !error && <span style={{fontSize:'0.65rem',fontFamily:'var(--font-code)',color:'var(--green)'}}>✓ Ready</span>}
            </div>
            <div className="review-scroll" ref={reviewRef}>
              {!review && !loading && !error ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No review yet</h3>
                  <p>Paste code or import from GitHub, then click Review Code</p>
                </div>
              ) : loading ? (
                <div className="empty-state">
                  <div className="spinner" style={{width:26,height:26,borderWidth:3}}/>
                  <h3>Analyzing...</h3>
                  <p>Gemini AI is reviewing your code</p>
                </div>
              ) : (
                <div className="review-content">
                  <Markdown rehypePlugins={error ? [] : [rehypeHighlight]}>{error || review}</Markdown>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ═══ ANALYTICS TAB ═══ */}
      <div className={`tab-view${tab==='analytics'?' active':''}`}>
        <div className="analytics-view">
          {anaLoading ? (
            <div className="empty-state" style={{flex:1}}>
              <div className="spinner" style={{width:26,height:26,borderWidth:3}}/>
              <p>Loading analytics...</p>
            </div>
          ) : !analytics ? (
            <div className="no-history">
              <div className="empty-icon">📊</div>
              <h3>No data yet</h3>
              <p>Submit a code review to see analytics</p>
            </div>
          ) : (<>

            {/* Stat cards */}
            <div className="analytics-grid">
              <div className="stat-card accent">
                <div className="stat-label">Total Reviews</div>
                <div className="stat-value">{analytics.totalReviews}</div>
                <div className="stat-sub">{analytics.totalRequests} total requests</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-label">Avg Bugs / Review</div>
                <div className="stat-value">{analytics.avgBugsPerReview}</div>
                <div className="stat-sub">issues detected</div>
              </div>
              <div className="stat-card green">
                <div className="stat-label">Avg Optimizations</div>
                <div className="stat-value">{analytics.avgOptsPerReview}</div>
                <div className="stat-sub">suggestions made</div>
              </div>
              <div className="stat-card amber">
                <div className="stat-label">Languages Used</div>
                <div className="stat-value">{analytics.languageBreakdown.length}</div>
                <div className="stat-sub">distinct languages</div>
              </div>
            </div>

            {/* Charts row */}
            <div className="analytics-row">

              {/* Daily bar chart */}
              <div className="chart-card">
                <div className="chart-title">Reviews — Last 7 Days</div>
                <div className="bar-chart">
                  {analytics.dailyReviews.map(({ date, count }) => (
                    <div key={date} className="bar-col">
                      <div className="bar-val">{count > 0 ? count : ''}</div>
                      <div className="bar" style={{ height: `${(count / maxBar) * 70}px` }} />
                      <div className="bar-label">{date}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language breakdown */}
              <div className="chart-card">
                <div className="chart-title">Language Breakdown</div>
                {analytics.languageBreakdown.length === 0 ? (
                  <p style={{fontSize:'0.74rem',color:'var(--text-muted)'}}>No data yet</p>
                ) : (
                  <div className="lang-breakdown">
                    {analytics.languageBreakdown.map(({ lang: l, count }) => (
                      <div key={l} className="lang-row">
                        <div className="lang-info">
                          <span className="lang-name">{l.toUpperCase()}</span>
                          <span className="lang-pct">{count} ({Math.round(count/analytics.totalReviews*100)}%)</span>
                        </div>
                        <div className="lang-bar-bg">
                          <div className="lang-bar-fill" style={{ width: `${(count / maxLang) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>)}
        </div>
      </div>

      {/* ═══ HISTORY TAB ═══ */}
      <div className={`tab-view${tab==='history'?' active':''}`}>
        <div className="history-view">
          <div className="history-header">
            <span className="history-title">Review History</span>
            <span className="history-count">{history.length} reviews (session only)</span>
          </div>

          {history.length === 0 ? (
            <div className="no-history">
              <div className="empty-icon">🕒</div>
              <h3>No reviews yet</h3>
              <p>Your review history will appear here</p>
            </div>
          ) : history.map(item => (
            <div key={item.id} className="history-card" onClick={() => loadFromHistory(item)}>
              <div className="history-card-top">
                <span className="history-lang">{item.language}</span>
                <span className="history-time">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              <div className="history-snippet">{item.codeSnippet}</div>
              <div className="history-meta">
                <span className="history-badge bugs">🐛 {item.bugCount} bugs</span>
                <span className="history-badge opts">✨ {item.optimizationCount} opts</span>
                <button className="history-delete" onClick={e => deleteHistory(item.id, e)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  </>
  );
}
