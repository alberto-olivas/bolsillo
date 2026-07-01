import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const userId = process.env.BOLSILLO_USER_ID

if (!supabaseUrl || !serviceRoleKey || !userId) {
  console.error('Faltan variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BOLSILLO_USER_ID')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

const server = new McpServer({ name: 'bolsillo', version: '1.0.0' })

// ─── listar_proyectos ────────────────────────────────────────────────────────

server.tool(
  'listar_proyectos',
  'Lista todos los proyectos disponibles en Bolsillo',
  {},
  async () => {
    const { data, error } = await supabase
      .from('proyectos')
      .select('id, nombre, tipo')
      .order('created_at', { ascending: true })

    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }

    const texto = data.map(p => `• ${p.nombre} (${p.tipo}) — ID: ${p.id}`).join('\n')
    return { content: [{ type: 'text', text: texto || 'No hay proyectos.' }] }
  }
)

// ─── listar_categorias ───────────────────────────────────────────────────────

server.tool(
  'listar_categorias',
  'Lista las categorías disponibles de un proyecto, separadas por tipo (gasto/ingreso)',
  { proyecto_id: z.string().uuid('proyecto_id debe ser un UUID válido') },
  async ({ proyecto_id }) => {
    const { data, error } = await supabase
      .from('categorias')
      .select('nombre, tipo')
      .eq('proyecto_id', proyecto_id)
      .order('tipo')
      .order('nombre')

    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
    if (!data?.length) return { content: [{ type: 'text', text: 'No hay categorías en este proyecto.' }] }

    const gastos = data.filter(c => c.tipo === 'gasto').map(c => `  • ${c.nombre}`).join('\n')
    const ingresos = data.filter(c => c.tipo === 'ingreso').map(c => `  • ${c.nombre}`).join('\n')

    const lines: string[] = []
    if (gastos) lines.push(`**Gastos:**\n${gastos}`)
    if (ingresos) lines.push(`**Ingresos:**\n${ingresos}`)

    return { content: [{ type: 'text', text: lines.join('\n\n') }] }
  }
)

// ─── consultar_saldo ─────────────────────────────────────────────────────────

server.tool(
  'consultar_saldo',
  'Consulta el resumen de ingresos, gastos y balance de un proyecto para un mes concreto',
  {
    proyecto_id: z.string().uuid('proyecto_id debe ser un UUID válido'),
    mes_ano: z.string().regex(/^\d{4}-\d{2}$/, 'Formato YYYY-MM').optional()
      .describe('Mes a consultar en formato YYYY-MM. Por defecto el mes actual.'),
  },
  async ({ proyecto_id, mes_ano }) => {
    const mes = mes_ano ?? new Date().toISOString().slice(0, 7)
    const [year, month] = mes.split('-').map(Number)
    const primerDia = `${mes}-01`
    const ultimoDia = new Date(year, month, 0).toISOString().slice(0, 10) // último día del mes

    const { data, error } = await supabase
      .from('movimientos')
      .select('tipo, cantidad')
      .eq('proyecto_id', proyecto_id)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)

    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }

    const ingresos = (data ?? [])
      .filter(m => m.tipo === 'ingreso')
      .reduce((s, m) => s + Number(m.cantidad), 0)

    const gastos = (data ?? [])
      .filter(m => m.tipo === 'gasto')
      .reduce((s, m) => s + Number(m.cantidad), 0)

    const balance = ingresos - gastos
    const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const mesLabel = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

    const texto = [
      `**Saldo de ${mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1)}**`,
      `Ingresos:  +${fmt(ingresos)} €`,
      `Gastos:    -${fmt(gastos)} €`,
      `Balance:   ${balance >= 0 ? '+' : ''}${fmt(balance)} €`,
    ].join('\n')

    return { content: [{ type: 'text', text: texto }] }
  }
)

// ─── crear_movimiento ────────────────────────────────────────────────────────

server.tool(
  'crear_movimiento',
  'Añade un gasto o ingreso a un proyecto de Bolsillo',
  {
    proyecto_id: z.string().uuid('proyecto_id debe ser un UUID válido'),
    tipo: z.enum(['gasto', 'ingreso']).describe('Tipo de movimiento'),
    cantidad: z.number().positive('La cantidad debe ser positiva'),
    categoria_nombre: z.string().min(1).describe('Nombre de la categoría (ej: Comida, Transporte...)'),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional()
      .describe('Fecha del movimiento. Por defecto hoy.'),
    descripcion: z.string().optional().describe('Descripción opcional del movimiento'),
  },
  async ({ proyecto_id, tipo, cantidad, categoria_nombre, fecha, descripcion }) => {
    // Resolver UUID de categoría por nombre
    const { data: cats, error: catError } = await supabase
      .from('categorias')
      .select('id, nombre')
      .eq('proyecto_id', proyecto_id)
      .eq('tipo', tipo)
      .ilike('nombre', categoria_nombre)
      .limit(1)

    if (catError) return { content: [{ type: 'text', text: `Error buscando categoría: ${catError.message}` }], isError: true }

    if (!cats?.length) {
      return {
        content: [{
          type: 'text',
          text: `No encontré la categoría "${categoria_nombre}" de tipo ${tipo} en este proyecto. Usa listar_categorias para ver las disponibles.`,
        }],
        isError: true,
      }
    }

    const categoria_id = cats[0].id
    const fechaFinal = fecha ?? new Date().toISOString().slice(0, 10)

    const { data: mov, error: movError } = await supabase
      .from('movimientos')
      .insert({
        proyecto_id,
        usuario_id: userId,
        tipo,
        cantidad,
        categoria_id,
        fecha: fechaFinal,
        descripcion: descripcion ?? null,
        es_fijo: false,
      })
      .select('id, tipo, cantidad, fecha, descripcion')
      .single()

    if (movError) return { content: [{ type: 'text', text: `Error al crear movimiento: ${movError.message}` }], isError: true }

    const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const signo = tipo === 'gasto' ? '-' : '+'

    const texto = [
      `✓ Movimiento creado`,
      `Tipo:       ${tipo}`,
      `Cantidad:   ${signo}${fmt(Number(mov.cantidad))} €`,
      `Categoría:  ${cats[0].nombre}`,
      `Fecha:      ${mov.fecha}`,
      mov.descripcion ? `Descripción: ${mov.descripcion}` : null,
      `ID:         ${mov.id}`,
    ].filter(Boolean).join('\n')

    return { content: [{ type: 'text', text: texto }] }
  }
)

// ─── Arrancar ────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
