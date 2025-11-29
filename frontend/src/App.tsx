import { useEffect, useMemo, useState } from 'react';
import { evaluatePassword } from './lib/scoring';
import { loadHistory, saveToHistory } from './lib/storage';
import { StrengthResult } from './lib/types';
import { checkPwned } from './lib/breach';

const EXAMPLES = [
  'password123',
  'P@ssw0rd!',
  'Tr0ub4dour&3',
  'CorrectHorseBatteryStaple!',
  'S0phisticated_$ecret2024',
  'qwerty2024',
  'IloveCoffee123!!'
];

function App() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [enableBreach, setEnableBreach] = useState(false);
  const [history, setHistory] = useState<Array<StrengthResult & { timestamp: number }>>([]);
  const [breachStatus, setBreachStatus] = useState<{ found: boolean; count?: number } | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    const cls = document.documentElement.classList;
    darkMode ? cls.add('dark') : cls.remove('dark');
  }, [darkMode]);

  const result = useMemo(() => evaluatePassword(password), [password]);

  useEffect(() => {
    if (!password) return;
    saveToHistory(result);
    setHistory(loadHistory());
  }, [password, result]);

  useEffect(() => {
    let cancelled = false;
    if (!enableBreach || !password) {
      setBreachStatus(null);
      return;
    }
    checkPwned(password)
      .then((data) => {
        if (!cancelled) setBreachStatus(data);
      })
      .catch(() => {
        if (!cancelled) setBreachStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [enableBreach, password]);

  const strengthColor = categoryColor(result.category);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-300">Security Toolkit</p>
            <h1 className="text-3xl font-bold">Password Strength Checker</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-indigo-400"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle theme"
            >
              <span role="img" aria-hidden>
                {darkMode ? '☀️' : '🌙'}
              </span>
            </button>
          </div>
        </header>

        <section className="bg-slate-800/70 border border-slate-700 rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-sm font-semibold text-slate-200">Enter a password to evaluate</label>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enableBreach}
                  onChange={(e) => setEnableBreach(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700"
                />
                Check against breach databases
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700"
                />
                Show password
              </label>
            </div>
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            placeholder="Type a strong passphrase..."
            className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <div className="flex flex-wrap gap-2 text-sm text-slate-300">
            {EXAMPLES.map((sample) => (
              <button
                key={sample}
                onClick={() => setPassword(sample)}
                className="px-3 py-1 rounded-full bg-slate-700 hover:bg-indigo-600/70 border border-slate-600"
              >
                {sample}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Overall score</p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-extrabold">{result.score}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${strengthColor.badge}`}>
                    {result.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <span aria-hidden>ℹ️</span>
                <span>Calculated locally in your browser</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strengthColor.bar}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">Progress bar reflects combined factors.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetricCard
                label="Entropy"
                value={`${result.entropyBits.toFixed(1)} bits`}
                tooltip="Higher entropy means more randomness."
              />
              <MetricCard
                label="Crack time"
                value={result.crackTime}
                tooltip="Estimated offline cracking time at 10B guesses/sec."
              />
              <MetricCard
                label="Score breakdown"
                value={`Category: ${result.category}`}
                tooltip="Score combines length, variety, entropy, patterns"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ListCard title="Warnings" items={result.warnings.length ? result.warnings : ['No major warnings detected']} tone="warning" />
              <ListCard
                title="Suggestions"
                items={result.suggestions.length ? result.suggestions : ['Great job! Your password looks strong.']}
                tone="success"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Breach status</h3>
                <span className="text-xs text-slate-400">HIBP k-anonymity</span>
              </div>
              {!enableBreach && <p className="text-sm text-slate-400">Toggle the checkbox above to run breach lookups.</p>}
              {enableBreach && password && (
                <div className={`p-3 rounded-lg border ${breachStatus?.found ? 'border-red-400 bg-red-500/10' : 'border-green-400 bg-green-500/10'}`}>
                  {breachStatus?.found ? (
                    <p className="text-sm">Found in breaches {breachStatus.count?.toLocaleString()} times.</p>
                  ) : (
                    <p className="text-sm">Not found in the Have I Been Pwned dataset.</p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent checks</h3>
                <p className="text-xs text-slate-400">Stored locally</p>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {history.length === 0 && <p className="text-sm text-slate-400">No history yet.</p>}
                {history.map((item) => (
                  <div key={item.timestamp} className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                    <div>
                      <p className="font-semibold">{item.password}</p>
                      <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${categoryColor(item.category).badge}`}>
                      {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function categoryColor(category: StrengthResult['category']) {
  switch (category) {
    case 'Very Weak':
      return { badge: 'bg-red-500/20 text-red-200 border border-red-400', bar: 'bg-red-500' };
    case 'Weak':
      return { badge: 'bg-orange-500/20 text-orange-200 border border-orange-400', bar: 'bg-orange-500' };
    case 'Medium':
      return { badge: 'bg-yellow-500/20 text-yellow-200 border border-yellow-400', bar: 'bg-yellow-500' };
    case 'Strong':
      return { badge: 'bg-green-500/20 text-green-200 border border-green-400', bar: 'bg-green-500' };
    case 'Very Strong':
    default:
      return { badge: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400', bar: 'bg-emerald-500' };
  }
}

function MetricCard({ label, value, tooltip }: { label: string; value: string; tooltip: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between text-slate-300 text-sm mb-1">
        <span>{label}</span>
        <span className="text-xs text-slate-500">{tooltip}</span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone
}: {
  title: string;
  items: string[];
  tone: 'warning' | 'success';
}) {
  const toneClass = tone === 'warning' ? 'border-amber-500/50 bg-amber-500/10' : 'border-emerald-500/40 bg-emerald-500/10';
  return (
    <div className={`rounded-lg border ${toneClass} p-4 space-y-2`}>
      <h3 className="font-semibold">{title}</h3>
      <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
