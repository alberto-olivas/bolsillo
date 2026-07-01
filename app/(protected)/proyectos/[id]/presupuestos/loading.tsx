export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFF8EC] dark:bg-[#1A1612]">
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6 animate-pulse">

        {/* Cabecera */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-[#FBDDB2] dark:bg-[#332E28] flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-5 w-36 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
            <div className="h-3 w-24 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
          </div>
        </div>

        {/* Selector de mes */}
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#FBDDB2] dark:bg-[#332E28]" />
          <div className="h-4 w-28 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
          <div className="w-9 h-9 rounded-xl bg-[#FBDDB2] dark:bg-[#332E28]" />
        </div>

        {/* Partidas de presupuesto */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#FFE9CE] dark:bg-[#2A2420] rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
                  <div className="h-3.5 w-20 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
                </div>
                <div className="h-3.5 w-20 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
              </div>
              <div className="h-2 w-full rounded-full bg-[#FBDDB2] dark:bg-[#332E28]" />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
