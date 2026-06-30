export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-brand-700">Mekalin Team</span>
        <div className="flex gap-4 text-sm text-gray-600">
          <a href="/members">Members</a>
          <a href="/analytics">Analytics</a>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
