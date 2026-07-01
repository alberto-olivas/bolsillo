export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFF8EC] dark:bg-[#1A1612]">
      <div className="max-w-sm mx-auto px-4 py-6 pb-6 space-y-6 animate-pulse">

        {/* Cabecera */}
        <div className="space-y-1">
          <div className="h-7 w-40 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
          <div className="h-4 w-56 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
        </div>

        {/* Proyecto cards */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-[#FFE9CE] dark:bg-[#2A2420] rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-32 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
                <div className="h-3.5 w-20 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#FBDDB2] dark:bg-[#332E28]" />
            </div>
            <div className="h-10 w-full rounded-xl bg-[#FBDDB2] dark:bg-[#332E28]" />
          </div>
        ))}

      </div>
    </div>
  )
}
