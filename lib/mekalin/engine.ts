import type {
  ParseResult,
  VisualMode,
  CausalChainData,
  FunctionalAnatomyData,
  ProceduralMapData,
} from './types'

const CAUSAL_KEYWORDS = [
  'because', 'therefore', 'results in', 'leads to', 'causes',
  'effect', 'impact', 'why', 'trigger', 'consequence', 'due to',
  'hence', 'thus', 'affect', 'influence', 'drives', 'produces',
]

const ANATOMY_KEYWORDS = [
  'consists of', 'components', 'structure', 'parts', 'elements',
  'made up of', 'comprised', 'anatomy', 'what is', 'define',
  'framework', 'model', 'system', 'overview', 'taxonomy',
  'categories', 'types of', 'kinds of',
]

const PROCEDURAL_KEYWORDS = [
  'steps', 'process', 'how to', 'first', 'then', 'next',
  'finally', 'procedure', 'instructions', 'method', 'workflow',
  'sequence', 'stage', 'phase', 'implement', 'follow', 'begin',
]

const MODE_RATIONALE: Record<VisualMode, string> = {
  causal_chain:
    'The content describes cause-and-effect relationships. A Causal Chain will most effectively reveal the logical flow and dependencies between ideas.',
  functional_anatomy:
    'The content defines a system or framework with distinct components. A Functional Anatomy will reveal its structure and how each part contributes to the whole.',
  procedural_map:
    'The content describes a sequence of steps or a process. A Procedural Map will guide the learner through each stage in logical order.',
}

function detectMode(text: string): { mode: VisualMode; confidence: number } {
  const lower = text.toLowerCase()
  const scores: Record<VisualMode, number> = {
    causal_chain: CAUSAL_KEYWORDS.filter((k) => lower.includes(k)).length,
    functional_anatomy: ANATOMY_KEYWORDS.filter((k) => lower.includes(k)).length,
    procedural_map: PROCEDURAL_KEYWORDS.filter((k) => lower.includes(k)).length,
  }
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1
  const sorted = (Object.entries(scores) as [VisualMode, number][]).sort(([, a], [, b]) => b - a)
  const [mode, score] = sorted[0]
  const confidence = Math.min(95, 50 + Math.round((score / total) * 45))
  return { mode, confidence }
}

function extractTitle(text: string): string {
  const firstLine = text.split('\n')[0].trim()
  if (firstLine.length > 0 && firstLine.length < 80) return firstLine
  const firstSentence = text.split(/[.!?]/)[0].trim()
  if (firstSentence.length < 60) return firstSentence
  return text.slice(0, 55).trim() + '\u2026'
}

function sentencesFrom(text: string, max: number): string[] {
  return text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15)
    .slice(0, max)
}

function buildCausalChain(text: string, title: string): CausalChainData {
  const sentences = sentencesFrom(text, 7)
  const nodes = sentences.map((s, i) => ({
    id: `node-${i}`,
    label: s.length > 55 ? s.slice(0, 55) + '\u2026' : s,
    description: s,
  }))
  const links = nodes.slice(0, -1).map((node, i) => ({
    source: node.id,
    target: nodes[i + 1].id,
  }))
  return { mode: 'causal_chain', title, nodes, links }
}

function buildFunctionalAnatomy(text: string, title: string): FunctionalAnatomyData {
  const sentences = sentencesFrom(text, 6)
  const parts = sentences.map((s, i) => ({
    id: `part-${i}`,
    label: `Component ${i + 1}`,
    function: s.length > 70 ? s.slice(0, 70) + '\u2026' : s,
  }))
  return { mode: 'functional_anatomy', title, subject: title, parts }
}

function buildProceduralMap(text: string, title: string): ProceduralMapData {
  const sentences = sentencesFrom(text, 7)
  const steps = sentences.map((s, i) => ({
    id: `step-${i}`,
    step: i + 1,
    label: `Step ${i + 1}`,
    description: s.length > 90 ? s.slice(0, 90) + '\u2026' : s,
  }))
  return { mode: 'procedural_map', title, steps }
}

async function parseWithLLM(text: string): Promise<ParseResult | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const systemPrompt = `You are the Mekalin Instructional Engine. You convert instructional content into structured JSON following Edward Tufte's scientific visualization principles — prioritising data-ink efficiency, causality, and clarity over decoration.

Analyse the user's text and return ONLY a valid JSON object with this exact structure:
{
  "mode": "causal_chain" | "functional_anatomy" | "procedural_map",
  "confidence": <integer 0-100>,
  "rationale": "<one sentence explaining the mode choice based on content logic>",
  "suggestedTitle": "<concise, informative title>",
  "clarifyingQuestions": ["<Q1>", "<Q2>", "<Q3>"],
  "frameCount": <integer 1-7>,
  "data": {
    "mode": "<same as above>",
    "title": "<same as suggestedTitle>",
    // causal_chain: "nodes": [{"id","label","description"}], "links": [{"source","target","label?"}]
    // functional_anatomy: "subject": "...", "parts": [{"id","label","function","parent?"}]
    // procedural_map: "steps": [{"id","step","label","description","substeps"?}]
  }
}`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.25,
        response_format: { type: 'json_object' },
      }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { choices: { message: { content: string } }[] }
    return JSON.parse(json.choices[0].message.content) as ParseResult
  } catch {
    return null
  }
}

export async function parseInstructionalContent(text: string): Promise<ParseResult> {
  const llmResult = await parseWithLLM(text)
  if (llmResult) return llmResult

  const { mode, confidence } = detectMode(text)
  const title = extractTitle(text)

  let data: CausalChainData | FunctionalAnatomyData | ProceduralMapData
  if (mode === 'causal_chain') {
    data = buildCausalChain(text, title)
  } else if (mode === 'functional_anatomy') {
    data = buildFunctionalAnatomy(text, title)
  } else {
    data = buildProceduralMap(text, title)
  }

  const sentenceCount = sentencesFrom(text, 21).length
  const frameCount = Math.min(7, Math.max(1, Math.ceil(sentenceCount / 3)))

  return {
    mode,
    confidence,
    rationale: MODE_RATIONALE[mode],
    data,
    frameCount,
    suggestedTitle: title,
    clarifyingQuestions: [
      'What is the primary learning objective you want this infographic to achieve?',
      'Who is the target audience, and what is their current level of familiarity with this topic?',
      'Are there any specific visual constraints or accessibility requirements I should follow?',
    ],
  }
}
