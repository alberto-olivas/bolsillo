export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6 animate-pulse">

        {/* Título */}
        <div className="h-6 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />

        {/* Sección Cuenta */}
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl divide-y divide-neutral-200 dark:divide-neutral-800">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="h-4 w-36 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="px-4 py-3.5">
              <div className="h-9 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>

        {/* Sección App */}
        <div className="space-y-2">
          <div className="h-3 w-10 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl divide-y divide-neutral-200 dark:divide-neutral-800">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="w-10 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
