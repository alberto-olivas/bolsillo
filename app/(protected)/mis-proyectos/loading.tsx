export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 pb-6 space-y-6 animate-pulse">

        {/* Cabecera */}
        <div className="space-y-1">
          <div className="h-7 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-56 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Proyecto cards */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3.5 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="h-10 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          </div>
        ))}

      </div>
    </div>
  )
}
