import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000'

const STEPS = [
  {
    id: 0,
    title: 'Mean Values',
    subtitle: 'Average measurements of cell nuclei',
    icon: '◎',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    keys: [
      'mean radius', 'mean texture', 'mean perimeter', 'mean area',
      'mean smoothness', 'mean compactness', 'mean concavity',
      'mean concave points', 'mean symmetry', 'mean fractal dimension',
    ],
  },
  {
    id: 1,
    title: 'Standard Error',
    subtitle: 'Variability of cell nuclei measurements',
    icon: '≈',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    keys: [
      'radius error', 'texture error', 'perimeter error', 'area error',
      'smoothness error', 'compactness error', 'concavity error',
      'concave points error', 'symmetry error', 'fractal dimension error',
    ],
  },
  {
    id: 2,
    title: 'Worst Values',
    subtitle: 'Largest (most severe) measurements',
    icon: '▲',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    keys: [
      'worst radius', 'worst texture', 'worst perimeter', 'worst area',
      'worst smoothness', 'worst compactness', 'worst concavity',
      'worst concave points', 'worst symmetry', 'worst fractal dimension',
    ],
  },
]

const ORDERED_FEATURES = STEPS.flatMap(s => s.keys)

// ── Helpers ────────────────────────────────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function completionOf(step, values) {
  return step.keys.filter(k => values[k] !== '' && values[k] !== undefined && values[k] !== null).length
}

// ── Top Navigation Bar ─────────────────────────────────────────────────────────
function TopBar({ modelInfo, backendOk }) {
  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 36, height: 36, background: '#1d4ed8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
          OP
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', lineHeight: 1.2, margin: 0 }}>OncoPred</p>
          <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.2, margin: 0 }}>Breast Cancer Prediction System</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {modelInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {[
              { label: 'Accuracy', val: modelInfo.accuracy + '%' },
              { label: 'F1-Score', val: modelInfo.f1_benign + '%' },
              { label: 'Train Set', val: modelInfo.train_samples },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{m.val}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{m.label}</p>
              </div>
            ))}
          </div>
        )}
        <div style={{ background: backendOk ? '#f0fdf4' : '#fef2f2', border: `1px solid ${backendOk ? '#bbf7d0' : '#fecaca'}`, padding: '6px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: backendOk ? '#16a34a' : '#dc2626', display: 'inline-block' }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: backendOk ? '#16a34a' : '#dc2626' }}>
            {backendOk ? 'API Connected' : 'API Offline'}
          </span>
        </div>
      </div>
    </header>
  )
}

// ── Step Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ currentStep, setStep, values }) {
  return (
    <aside style={{ width: 260, background: '#f9fafb', borderRight: '1px solid #e5e7eb', minHeight: 'calc(100vh - 65px)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, margin: 0 }}>
        Input Sections
      </p>
      {STEPS.map(step => {
        const filled = completionOf(step, values)
        const pct = Math.round((filled / 10) * 100)
        const active = currentStep === step.id
        return (
          <button key={step.id} onClick={() => setStep(step.id)}
            style={{
              background: active ? '#fff' : 'transparent',
              border: active ? `1px solid ${step.border}` : '1px solid transparent',
              borderRadius: 10,
              padding: '12px 14px',
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s',
              display: 'block',
              width: '100%'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 14, color: step.color }}>{step.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? step.color : '#374151' }}>
                  {step.title}
                </span>
              </div>
              <span style={{ fontSize: 11, color: pct === 100 ? '#16a34a' : '#9ca3af', fontWeight: 500 }}>
                {filled}/10
              </span>
            </div>
            <div style={{ height: 3, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16a34a' : step.color, borderRadius: 99, transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, marginBottom: 0 }}>{step.subtitle}</p>
          </button>
        )
      })}

      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: '#6b7280' }}>Dataset:</strong> Wisconsin Breast Cancer<br />
          <strong style={{ color: '#6b7280' }}>Model:</strong> Logistic Regression<br />
          <strong style={{ color: '#6b7280' }}>Features:</strong> 30 numerical
        </p>
      </div>
    </aside>
  )
}

// ── Feature Input Grid ─────────────────────────────────────────────────────────
function FeatureGrid({ step, values, stats, onChange }) {
  return (
    <div style={{ padding: '32px 40px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: 44, height: 44, background: step.bg, border: `1px solid ${step.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, color: step.color }}>{step.icon}</span>
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{step.title}</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{step.subtitle} — enter all 10 values below</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {completionOf(step, values)}/10 fields filled
          </span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {step.keys.map((key, i) => {
          const stat = stats?.[key]
          const val = values[key]
          const isEmpty = val === '' || val === undefined || val === null
          return (
            <div key={key}
              style={{
                background: '#fff',
                border: `1px solid ${!isEmpty ? step.border : '#e5e7eb'}`,
                borderRadius: 10,
                padding: '16px 18px',
                transition: 'border-color 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>
                    {capitalize(key)}
                  </p>
                  {stat && (
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, marginBottom: 0 }}>
                      Range: {stat.min} – {stat.max}
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: '2px 8px',
                  background: step.bg, color: step.color, borderRadius: 99,
                  border: `1px solid ${step.border}`,
                }}>
                  #{i + 1 + step.id * 10}
                </span>
              </div>

              <input
                type="number"
                step="any"
                placeholder={stat ? `e.g. ${stat.mean}` : 'Enter value'}
                value={val ?? ''}
                onChange={e => onChange(key, e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px',
                  border: `1px solid ${!isEmpty ? step.color : '#d1d5db'}`,
                  borderRadius: 7,
                  fontSize: 14,
                  color: '#111827',
                  background: '#fafafa',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
                onFocus={e => { e.target.style.borderColor = step.color; e.target.style.background = step.bg }}
                onBlur={e => { e.target.style.borderColor = !isEmpty ? step.color : '#d1d5db'; e.target.style.background = '#fafafa' }}
              />

              {stat && val !== '' && val !== undefined && (
                <div style={{ marginTop: 6, height: 3, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, ((parseFloat(val) - stat.min) / (stat.max - stat.min)) * 100))}%`,
                    background: step.color,
                    borderRadius: 99,
                    transition: 'width 0.2s',
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Result Screen ──────────────────────────────────────────────────────────────
function ResultScreen({ result, onReset }) {
  const isMalignant = result.prediction === 0
  const mainColor = isMalignant ? '#dc2626' : '#16a34a'
  const mainBg = isMalignant ? '#fef2f2' : '#f0fdf4'
  const mainBorder = isMalignant ? '#fecaca' : '#bbf7d0'

  return (
    <div style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px' }}>
      {/* Main result card */}
      <div style={{ background: '#fff', border: `2px solid ${mainBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        {/* Banner */}
        <div style={{ background: mainBg, padding: '28px 32px', borderBottom: `1px solid ${mainBorder}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: mainColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', flexShrink: 0 }}>
            {isMalignant ? '⚠' : '✓'}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, margin: 0 }}>
              Diagnostic Prediction
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: mainColor, lineHeight: 1.2, margin: '4px 0 0 0' }}>
              {isMalignant ? 'Malignant' : 'Benign'}
            </h2>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontSize: 36, fontWeight: 800, color: mainColor, lineHeight: 1, margin: 0 }}>
              {result.confidence}%
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0 0' }}>
              Confidence
            </p>
          </div>
        </div>

        {/* Probability breakdown */}
        <div style={{ padding: '28px 32px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, margin: '0 0 16px 0' }}>
            Probability Breakdown
          </p>

          {[
            { label: 'Benign (Class 0)', val: result.probability_benign, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Malignant (Class 1)', val: result.probability_malignant, color: '#dc2626', bg: '#fef2f2' },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.val}%</span>
              </div>
              <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${item.val}%`,
                  background: item.color, borderRadius: 99,
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 32px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
            ⚠ This prediction is generated by a machine learning model for educational purposes only.
            It does not constitute a medical diagnosis. Always consult a qualified healthcare professional.
          </p>
        </div>
      </div>

      <button onClick={onReset}
        style={{
          marginTop: 16, width: '100%', padding: '13px 0',
          borderRadius: 10, border: '1px solid #d1d5db',
          background: '#fff', color: '#374151', fontSize: 14,
          fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.target.style.background = '#f9fafb'; e.target.style.borderColor = '#9ca3af' }}
        onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#d1d5db' }}>
        ← Start New Prediction
      </button>
    </div>
  )
}

// ── Bottom Action Bar ──────────────────────────────────────────────────────────
function BottomBar({ currentStep, setStep, onPredict, onFill, loading, backendOk, values, error }) {
  const totalFilled = ORDERED_FEATURES.filter(f => values[f] !== '' && values[f] !== undefined).length
  const allFilled = totalFilled === 30

  return (
    <div style={{
      position: 'sticky', bottom: 0, background: '#fff',
      borderTop: '1px solid #e5e7eb', padding: '14px 40px',
      display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10,
    }}>
      {/* Fill preset */}
      <button onClick={onFill}
        style={{
          padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
          background: '#f9fafb', color: '#374151', fontSize: 12,
          fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
        Auto-fill with mean values
      </button>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${(totalFilled / 30) * 100}%`,
            background: allFilled ? '#16a34a' : '#2563eb', borderRadius: 99,
            transition: 'width 0.3s',
          }} />
        </div>
        <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
          {totalFilled}/30 fields
        </span>
      </div>

      {error && (
        <span style={{ fontSize: 12, color: '#dc2626', maxWidth: 200 }}>{error}</span>
      )}

      {/* Navigation */}
      {currentStep > 0 && (
        <button onClick={() => setStep(s => s - 1)}
          style={{
            padding: '9px 20px', borderRadius: 8, border: '1px solid #d1d5db',
            background: '#fff', color: '#374151', fontSize: 13,
            fontWeight: 500, cursor: 'pointer',
          }}>
          ← Previous
        </button>
      )}

      {currentStep < 2 ? (
        <button onClick={() => setStep(s => s + 1)}
          style={{
            padding: '9px 24px', borderRadius: 8, border: 'none',
            background: '#2563eb', color: '#fff', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>
          Next →
        </button>
      ) : (
        <button onClick={onPredict} disabled={loading || !backendOk}
          style={{
            padding: '9px 28px', borderRadius: 8, border: 'none',
            background: loading || !backendOk ? '#9ca3af' : '#16a34a',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: loading || !backendOk ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
          {loading ? (
            <>
              <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              Analyzing...
            </>
          ) : '⚡ Run Prediction'}
        </button>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [values, setValues] = useState({})
  const [stats, setStats] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backendOk, setBackendOk] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/features`),
      axios.get(`${API}/model-info`),
    ])
      .then(([featRes, modelRes]) => {
        setStats(featRes.data.stats)
        setModelInfo(modelRes.data)
        setBackendOk(true)
      })
      .catch(() => setBackendOk(false))
  }, [])

  const handleChange = (key, val) => setValues(prev => ({ ...prev, [key]: val }))

  const handleFill = () => {
    if (!stats) return
    const defaults = {}
    Object.entries(stats).forEach(([k, v]) => { defaults[k] = v.mean })
    setValues(defaults)
  }

  const handlePredict = async () => {
    setError(null)
    setLoading(true)
    try {
      const ordered = ORDERED_FEATURES.map(f => parseFloat(values[f] ?? 0))
      const res = await axios.post(`${API}/predict`, { features: ordered })
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Backend unreachable. Start the Flask server.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '"DM Sans", sans-serif' }}>
        <TopBar modelInfo={modelInfo} backendOk={backendOk} />
        <ResultScreen result={result} onReset={() => { setResult(null); setCurrentStep(0) }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '"DM Sans", sans-serif', margin: 0, padding: 0 }}>
      <TopBar modelInfo={modelInfo} backendOk={backendOk} />

      {backendOk === false && (
        <div style={{ margin: '16px 40px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
          ⚠ Cannot reach the Flask backend at <code>http://localhost:5000</code> — run <code>python app.py</code> first.
        </div>
      )}

      <div style={{ display: 'flex' }}>
        <Sidebar currentStep={currentStep} setStep={setCurrentStep} values={values} />

        <main style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 65px - 61px)', paddingBottom: 32 }}>
          <FeatureGrid
            step={STEPS[currentStep]}
            values={values}
            stats={stats}
            onChange={handleChange}
          />
        </main>
      </div>

      <BottomBar
        currentStep={currentStep}
        setStep={setCurrentStep}
        onPredict={handlePredict}
        onFill={handleFill}
        loading={loading}
        backendOk={backendOk}
        values={values}
        error={error}
      />
    </div>
  )
}