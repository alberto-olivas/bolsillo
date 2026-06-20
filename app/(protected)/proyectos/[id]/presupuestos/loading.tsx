export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6 animate-pulse">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-5 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        {/* Selector de mes */}
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Partidas de presupuesto */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-neutral-200 dark:bg-neutral-800" />
                  <div className="h-3.5 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
                <div className="h-3.5 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
