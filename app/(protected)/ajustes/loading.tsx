export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFF8EC] dark:bg-[#1A1612]">
      <div className="max-w-sm mx-auto px-4 py-6 pb-24 space-y-6 animate-pulse">

        {/* Título */}
        <div className="h-6 w-20 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />

        {/* Sección Cuenta */}
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
          <div className="bg-[#FFE9CE] dark:bg-[#2A2420] rounded-2xl divide-y divide-[#FBDDB2] dark:divide-[#332E28]">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="h-4 w-28 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
              <div className="h-4 w-16 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="h-4 w-36 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
            </div>
            <div className="px-4 py-3.5">
              <div className="h-9 w-full rounded-xl bg-[#FBDDB2] dark:bg-[#332E28]" />
            </div>
          </div>
        </div>

        {/* Sección App */}
        <div className="space-y-2">
          <div className="h-3 w-10 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
          <div className="bg-[#FFE9CE] dark:bg-[#2A2420] rounded-2xl divide-y divide-[#FBDDB2] dark:divide-[#332E28]">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="h-4 w-24 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
              <div className="w-10 h-6 rounded-full bg-[#FBDDB2] dark:bg-[#332E28]" />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="h-4 w-32 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
              <div className="h-4 w-20 rounded bg-[#FBDDB2] dark:bg-[#332E28]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
