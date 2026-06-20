export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6 animate-pulse">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-5 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        {/* ResumenMes */}
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-5 space-y-3">
          <div className="h-3.5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-10 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex gap-2">
            <div className="h-9 flex-1 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 flex-1 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        {/* Donut */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-36 h-36 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Lista movimientos */}
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900">
              <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="h-4 w-14 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
