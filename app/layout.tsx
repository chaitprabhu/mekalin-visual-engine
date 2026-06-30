import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mekalin Visual Engine',
  description: 'Assess, visualize, and grow your instructional design competencies.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
