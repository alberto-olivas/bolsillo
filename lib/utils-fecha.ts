export function mesAnterior(mesAno: string): string {
  const [year, month] = mesAno.split('-').map(Number)
  let nm = month - 1
  let ny = year
  if (nm < 1) { nm = 12; ny-- }
  return `${ny}-${String(nm).padStart(2, '0')}`
}

export function mesSiguiente(mesAno: string): string {
  const [year, month] = mesAno.split('-').map(Number)
  let nm = month + 1
  let ny = year
  if (nm > 12) { nm = 1; ny++ }
  return `${ny}-${String(nm).padStart(2, '0')}`
}
