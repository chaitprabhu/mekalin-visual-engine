'use client'

import { useState } from 'react'
import { Loader2, Sparkles, AlertCircle, ChevronRight } from 'lucide-react'
import { CausalChain } from '@/components/visualizer/CausalChain'
import type { ParseResult } from '@/lib/mekalin/types'

const MODE_LABELS: Record<string, string> = {
  causal_chain: 'Causal Chain',
  functional_anatomy: 'Functional Anatomy',
  procedural_map: 'Procedural Map',
}

const MODE_BADGE: Record<string, string> = {
  causal_chain: 'bg-blue-50 text-blue-700 border-blue-200',
  functional_anatomy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  procedural_map: 'bg-violet-50 text-violet-700 border-violet-200',
}

export default function NewInfographicPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = (await res.json()) as {
        result?: ParseResult
        error?: string
      }
      if (!res.ok || !data.result) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setResult(data.result)
    } catch {
      setError('Unable to reach the server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Infographic</h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste your raw content, learning objective, or requirements below. The engine will
          automatically determine the best visual structure — Causal Chain, Functional Anatomy, or
          Procedural Map — based on the context of your text.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe what you want to teach. You can paste a transcript, a learning objective, a script excerpt, or just write freely. The engine will structure it and choose the most effective visual form."
          className="w-full h-52 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm resize-none focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
          disabled={loading}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{text.length.toLocaleString()} characters</p>
          <button
            type="submit"
            disabled={loading || text.trim().length < 20}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Infographic
              </>
            )}
          </button>
        </div>
      </form>

      {loading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-600" />
          <p className="mt-3 text-sm font-medium text-gray-700">
            The engine is analysing your content and determining the optimal visual structure…
          </p>
          <p className="mt-1 text-xs text-gray-400">
            This may take a few moments. Feel free to come back later.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${MODE_BADGE[result.mode]}`}
              >
                {MODE_LABELS[result.mode]}
              </span>
              <span className="text-xs text-gray-400">{result.confidence}% confidence</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">
                {result.frameCount === 1 ? '1 frame' : `${result.frameCount} frames`}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-gray-900">{result.suggestedTitle}</h2>
            <p className="mt-1 text-sm text-gray-500 italic">{result.rationale}</p>
          </div>

          {result.mode === 'causal_chain' && result.data.mode === 'causal_chain' && (
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm overflow-x-auto">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Visual Preview
              </p>
              <CausalChain nodes={result.data.nodes} links={result.data.links} />
            </div>
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3">
              Before we finalise — consider these questions
            </p>
            <ul className="space-y-2">
              {result.clarifyingQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-xs text-gray-400">
            You will be notified when your PNG{result.frameCount > 1 ? ' series is' : ' is'} ready
            for download.
          </p>
        </div>
      )}
    </div>
  )
}
