export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6 animate-pulse">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-5 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        {/* Chips de resumen */}
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="h-2.5 w-14 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          ))}
        </div>

        {/* Gráfico skeleton */}
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl px-4 pt-4 pb-4 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-end justify-around gap-1" style={{ height: '140px' }}>
            {[60, 85, 40, 100, 70, 50].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-lg bg-neutral-200 dark:bg-neutral-800"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-around mt-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-2.5 w-6 rounded bg-neutral-200 dark:bg-neutral-800" />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
