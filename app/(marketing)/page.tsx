export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-brand-900">
          Mekalin Visual Engine
        </h1>
        <p className="mt-6 text-xl text-gray-600">
          Discover, visualize, and grow your instructional design competencies
          through interactive assessments and constellation-style proficiency maps.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <a
            href="/start"
            className="rounded-lg bg-brand-600 px-6 py-3 text-white font-medium hover:bg-brand-700 transition-colors"
          >
            Start Assessment
          </a>
          <a
            href="/about"
            className="rounded-lg border border-brand-200 px-6 py-3 text-brand-700 font-medium hover:bg-brand-50 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </main>
  )
}
