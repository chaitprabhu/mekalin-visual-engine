export type VisualMode = 'causal_chain' | 'functional_anatomy' | 'procedural_map'

export interface CausalNode {
  id: string
  label: string
  description?: string
}

export interface CausalLink {
  source: string
  target: string
  label?: string
}

export interface CausalChainData {
  mode: 'causal_chain'
  title: string
  nodes: CausalNode[]
  links: CausalLink[]
}

export interface AnatomyPart {
  id: string
  label: string
  function: string
  parent?: string
}

export interface FunctionalAnatomyData {
  mode: 'functional_anatomy'
  title: string
  subject: string
  parts: AnatomyPart[]
}

export interface ProcedureStep {
  id: string
  step: number
  label: string
  description: string
  substeps?: string[]
}

export interface ProceduralMapData {
  mode: 'procedural_map'
  title: string
  steps: ProcedureStep[]
}

export type InstructionalData =
  | CausalChainData
  | FunctionalAnatomyData
  | ProceduralMapData

export interface ParseResult {
  mode: VisualMode
  confidence: number
  rationale: string
  data: InstructionalData
  frameCount: number
  suggestedTitle: string
  clarifyingQuestions: string[]
}

export interface GenerateRequest {
  text: string
}

export interface GenerateResponse {
  id: string
  result: ParseResult
  status: 'queued' | 'processing' | 'complete' | 'error'
  message: string
}
