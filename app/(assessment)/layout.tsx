export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <span className="text-lg font-semibold text-brand-700">Mekalin Assessment</span>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
