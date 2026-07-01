'use client'

import type { CausalNode, CausalLink } from '@/lib/mekalin/types'

interface Props {
  nodes: CausalNode[]
  links: CausalLink[]
}

const NODE_W = 160
const NODE_H = 64
const GAP = 52
const PAD = 20
const LINE_HEIGHT = 15

function wrapText(label: string, maxCharsPerLine: number): string[] {
  const words = label.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxCharsPerLine) {
      if (current) lines.push(current)
      current = word
    } else {
      current = candidate
    }
    if (lines.length === 2) break
  }
  if (current && lines.length < 3) lines.push(current)
  return lines.slice(0, 3)
}

export function CausalChain({ nodes, links }: Props) {
  if (nodes.length === 0) return null

  const svgW = nodes.length * NODE_W + (nodes.length - 1) * GAP + PAD * 2
  const svgH = NODE_H + PAD * 2 + 16

  const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]))

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      style={{ minWidth: `${Math.min(svgW, 520)}px` }}
      role="img"
      aria-label={`Causal chain diagram with ${nodes.length} nodes`}
    >
      <defs>
        <marker
          id="mv-arrow"
          markerWidth="7"
          markerHeight="5"
          refX="7"
          refY="2.5"
          orient="auto"
        >
          <polygon points="0 0, 7 2.5, 0 5" fill="#6366f1" />
        </marker>
      </defs>

      {links.map((link) => {
        const si = nodeIndex.get(link.source)
        const ti = nodeIndex.get(link.target)
        if (si === undefined || ti === undefined) return null
        const x1 = PAD + si * (NODE_W + GAP) + NODE_W
        const x2 = PAD + ti * (NODE_W + GAP)
        const cy = PAD + NODE_H / 2
        return (
          <line
            key={`${link.source}-${link.target}`}
            x1={x1}
            y1={cy}
            x2={x2 - 2}
            y2={cy}
            stroke="#6366f1"
            strokeWidth={1.5}
            markerEnd="url(#mv-arrow)"
          />
        )
      })}

      {nodes.map((node, i) => {
        const x = PAD + i * (NODE_W + GAP)
        const y = PAD
        const lines = wrapText(node.label, 18)
        const textStartY = y + NODE_H / 2 - ((lines.length - 1) * LINE_HEIGHT) / 2

        return (
          <g key={node.id}>
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              fill="#eef2ff"
              stroke="#818cf8"
              strokeWidth={1.5}
            />

            {lines.map((line, li) => (
              <text
                key={li}
                x={x + NODE_W / 2}
                y={textStartY + li * LINE_HEIGHT}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#312e81"
                fontSize="11"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {line}
              </text>
            ))}

            <circle cx={x + NODE_W - 14} cy={y + 13} r={10} fill="#6366f1" />
            <text
              x={x + NODE_W - 14}
              y={y + 13}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
