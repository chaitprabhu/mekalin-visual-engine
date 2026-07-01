import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { parseInstructionalContent } from '@/lib/mekalin/engine'
import { createClient } from '@supabase/supabase-js'

const RequestSchema = z.object({
  text: z
    .string()
    .min(20, 'Please provide at least 20 characters of content.')
    .max(10_000, 'Content must be under 10,000 characters.'),
})

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    const parsed = RequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      )
    }

    const { text } = parsed.data
    const result = await parseInstructionalContent(text)
    const id = crypto.randomUUID()

    const supabase = getSupabase()
    if (supabase) {
      const { error: dbError } = await supabase.from('infographics').insert({
        id,
        raw_input: text,
        visual_mode: result.mode,
        structured_data: result.data,
        frame_count: result.frameCount,
        title: result.suggestedTitle,
        status: 'queued',
      })
      if (dbError) {
        console.warn('[/api/generate] Supabase insert failed:', dbError.message)
      }
    }

    return NextResponse.json({
      id,
      result,
      status: 'queued',
      message:
        'Your infographic is being built. This may take a few moments — come back shortly to see the result.',
    })
  } catch (err) {
    console.error('[/api/generate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
