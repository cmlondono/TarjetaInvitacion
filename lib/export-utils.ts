import { DetalleEvento, Invitado } from '@/types/invitation'

/**
 * Exporta la lista de invitados a un archivo CSV optimizado para Microsoft Excel,
 * Google Sheets y Apple Numbers con soporte UTF-8 (BOM).
 */
export function exportarInvitadosExcel(
  evento: DetalleEvento,
  invitados: Invitado[],
  baseUrl: string
): void {
  const headers = [
    'N°',
    'Nombre del Invitado',
    'Estado de Confirmación',
    'Pases Asignados',
    'Cupos Confirmados',
    'Teléfono / WhatsApp',
    'Fecha de Confirmación',
    'Mensaje o Restricciones',
    'Enlace Individual de Invitación',
  ]

  const filas = invitados.map((inv, index) => {
    let estadoTexto = 'Pendiente de Confirmar'
    if (inv.confirmado || inv.estadoConfirmacion === 'confirmado') {
      estadoTexto = 'CONFIRMADO (Asiste)'
    } else if (inv.estadoConfirmacion === 'no_asiste') {
      estadoTexto = 'DECLINADO (No Asiste)'
    }

    const cupos =
      inv.confirmado || inv.estadoConfirmacion === 'confirmado'
        ? inv.cuposConfirmados || inv.pases || 1
        : 0

    const link = `${baseUrl}/i/${evento.slugPublico}?g=${encodeURIComponent(inv.nombre)}&t=${inv.codigoAcceso}${inv.esPlural ? '&p=1' : ''}`

    const fecha = inv.fechaConfirmacion
      ? new Date(inv.fechaConfirmacion).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Sin registro'

    return [
      index + 1,
      `"${(inv.nombre || '').replace(/"/g, '""')}"`,
      `"${estadoTexto}"`,
      inv.pases || 1,
      cupos,
      `"${(inv.telefono || '').replace(/"/g, '""')}"`,
      `"${fecha}"`,
      `"${(inv.mensajeConfirmacion || '').replace(/"/g, '""')}"`,
      `"${link}"`,
    ].join(',')
  })

  // Prefijo BOM \uFEFF para que Excel reconozca tildes y caracteres en español automáticamente
  const csvContent = '\uFEFF' + [headers.join(','), ...filas].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const enlace = document.createElement('a')
  const nombreLimpio = evento.titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30)

  enlace.setAttribute('href', url)
  enlace.setAttribute('download', `asistencia-${nombreLimpio}-${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}

/**
 * Abre una ventana emergente formateada específicamente para impresión
 * de la Lista de Admisión Protocolaria (Guardar como PDF o Imprimir Físicamente).
 */
export function imprimirListaAdmision(
  evento: DetalleEvento,
  invitados: Invitado[]
): void {
  const confirmados = invitados.filter(
    (i) => i.confirmado || i.estadoConfirmacion === 'confirmado'
  )
  const totalCuposConfirmados = confirmados.reduce(
    (acc, i) => acc + (i.cuposConfirmados || i.pases || 1),
    0
  )

  const fechaEventoFormateada = new Date(evento.fechaEvento).toLocaleDateString(
    'es-ES',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )

  const ventana = window.open('', '_blank', 'width=900,height=1000')
  if (!ventana) return

  const filasHtml = invitados
    .map((inv, idx) => {
      const estaConfirmado = inv.confirmado || inv.estadoConfirmacion === 'confirmado'
      const noAsiste = inv.estadoConfirmacion === 'no_asiste'
      const cupos = estaConfirmado ? inv.cuposConfirmados || inv.pases || 1 : 0

      const badgeColor = estaConfirmado
        ? 'background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0;'
        : noAsiste
        ? 'background: #FEE2E2; color: #991B1B; border: 1px solid #FECACA;'
        : 'background: #F1F5F9; color: #475569; border: 1px solid #E2E8F0;'

      const estadoTexto = estaConfirmado
        ? '✓ CONFIRMADO'
        : noAsiste
        ? '✕ NO ASISTE'
        : '○ PENDIENTE'

      return `
        <tr style="border-bottom: 1px solid #E2E8F0; page-break-inside: avoid;">
          <td style="padding: 10px 8px; text-align: center; font-family: monospace; font-size: 11px; color: #64748B;">
            ${idx + 1}
          </td>
          <td style="padding: 10px 8px;">
            <strong style="color: #0F172A; font-size: 13px; display: block;">${inv.nombre}</strong>
            ${inv.telefono ? `<span style="font-size: 10px; color: #64748B; font-family: monospace;">Tel: ${inv.telefono}</span>` : ''}
            ${inv.mensajeConfirmacion ? `<div style="font-size: 10px; color: #475569; font-style: italic; margin-top: 2px;">Nota: ${inv.mensajeConfirmacion}</div>` : ''}
          </td>
          <td style="padding: 10px 8px; text-align: center; font-size: 12px; font-weight: bold; color: #1E293B;">
            ${inv.pases}
          </td>
          <td style="padding: 10px 8px; text-align: center; font-size: 12px; font-weight: bold; color: ${estaConfirmado ? '#166534' : '#64748B'};">
            ${cupos}
          </td>
          <td style="padding: 10px 8px; text-align: center;">
            <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: bold; font-family: monospace; letter-spacing: 0.05em; ${badgeColor}">
              ${estadoTexto}
            </span>
          </td>
          <td style="padding: 10px 8px; text-align: center; border-left: 1px dashed #CBD5E1; min-width: 90px;">
            <div style="width: 18px; height: 18px; border: 1.5px solid #94A3B8; border-radius: 4px; margin: 0 auto;"></div>
          </td>
        </tr>
      `
    })
    .join('')

  ventana.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Lista de Admisión — ${evento.titulo}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0F172A;
          margin: 0;
          padding: 32px;
          background: #FFFFFF;
        }
        @media print {
          body { padding: 16px; }
          .no-print { display: none !important; }
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #0F172A;
          color: #FFFFFF;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 10px 8px;
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 24px; padding: 14px 18px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 13px; color: #475569; font-weight: 500;">
          Vista previa oficial para control de aforo y admisión en puerta.
        </span>
        <button onclick="window.print()" style="background: #0F172A; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          🖨️ Imprimir / Guardar como PDF
        </button>
      </div>

      <!-- Cabecera Institucional del Reporte -->
      <div style="border-bottom: 2px solid #0F172A; padding-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #B48222;">
              ✦ TARJETÓN · PROTOCOLO & ADMISIÓN OFICIAL ✦
            </div>
            <h1 style="margin: 4px 0 2px 0; font-size: 24px; font-family: Georgia, serif; color: #0F172A;">
              ${evento.titulo}
            </h1>
            <p style="margin: 0; font-size: 12px; color: #475569;">
              Anfitriones: <strong>${evento.anfitriones}</strong>
            </p>
          </div>

          <div style="text-align: right; font-size: 11px; color: #64748B;">
            <p style="margin: 0; font-weight: bold; color: #0F172A;">${fechaEventoFormateada}</p>
            <p style="margin: 2px 0 0 0;">Hora: ${evento.horaEvento}</p>
            <p style="margin: 2px 0 0 0;">Sede: ${evento.direccion}</p>
          </div>
        </div>

        <!-- Tarjetas de Resumen Numérico -->
        <div style="display: flex; gap: 12px; margin-top: 16px;">
          <div style="padding: 8px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 11px;">
            Total Invitados: <strong>${invitados.length}</strong>
          </div>
          <div style="padding: 8px 14px; background: #DCFCE7; border: 1px solid #BBF7D0; border-radius: 8px; font-size: 11px; color: #166534;">
            Asistentes Confirmados: <strong>${confirmados.length} invitados (${totalCuposConfirmados} personas)</strong>
          </div>
          <div style="padding: 8px 14px; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 11px; color: #475569;">
            Generado el: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <!-- Tabla de Asistencia -->
      <table>
        <thead>
          <tr>
            <th style="width: 35px; border-top-left-radius: 8px;">#</th>
            <th style="text-align: left;">Invitado / Titular</th>
            <th style="width: 80px;">Pases</th>
            <th style="width: 80px;">Cupos Conf.</th>
            <th style="width: 120px;">Estado RSVP</th>
            <th style="width: 90px; border-top-right-radius: 8px;">Ingreso</th>
          </tr>
        </thead>
        <tbody>
          ${filasHtml}
        </tbody>
      </table>

      <div style="margin-top: 24px; text-align: center; font-size: 10px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 12px;">
        Documento oficial expedido por Tarjetón Studio · Control de admisión protocolario
      </div>
    </body>
    </html>
  `)

  ventana.document.close()
}
