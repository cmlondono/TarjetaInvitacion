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
    'Cupos Aprobados',
    'Teléfono / WhatsApp',
    'Fecha de Confirmación',
    'Mensaje o Restricciones',
    'Enlace Individual de Invitación',
  ]

  const filas = invitados.map((inv, index) => {
    let estadoTexto = 'Pendiente de Confirmar'
    if (inv.confirmado || inv.estadoConfirmacion === 'confirmado') {
      estadoTexto = 'APROBADO (Confirmado)'
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

  const ventana = window.open('', '_blank', 'width=920,height=1020')
  if (!ventana) return

  const filasHtml = invitados
    .map((inv, idx) => {
      const estaConfirmado = inv.confirmado || inv.estadoConfirmacion === 'confirmado'
      const noAsiste = inv.estadoConfirmacion === 'no_asiste'
      const cupos = estaConfirmado ? inv.cuposConfirmados || inv.pases || 1 : 0

      const badgeColor = estaConfirmado
        ? 'background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0;'
        : noAsiste
        ? 'background: #FFF1F2; color: #9F1239; border: 1px solid #FECDD3;'
        : 'background: #F8FAFC; color: #475569; border: 1px solid #E2E8F0;'

      const estadoTexto = estaConfirmado
        ? '✓ APROBADO'
        : noAsiste
        ? '✕ DECLINADO'
        : '○ PENDIENTE'

      const ingresoHtml = estaConfirmado
        ? `
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 6px; background: #F0FDF4; border: 1.5px solid #166534; color: #166534; font-weight: 900; margin: 0 auto; font-size: 13px;">
            ✓
          </div>
          <div style="font-size: 8px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px;">
            APROBADO
          </div>
        `
        : noAsiste
        ? `
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: #FFF1F2; border: 1.5px solid #E11D48; color: #E11D48; font-weight: 700; margin: 0 auto; font-size: 11px;">
            ✕
          </div>
          <div style="font-size: 8px; font-weight: 700; color: #9F1239; text-transform: uppercase; margin-top: 2px;">
            DECLINADO
          </div>
        `
        : `
          <div style="width: 18px; height: 18px; border: 1.5px dashed #94A3B8; border-radius: 4px; margin: 0 auto; background: #F8FAFC;"></div>
          <div style="font-size: 8px; font-weight: 600; color: #64748B; text-transform: uppercase; margin-top: 2px;">
            POR VALIDAR
          </div>
        `

      return `
        <tr style="border-bottom: 1px solid #E2E8F0; page-break-inside: avoid; background: ${idx % 2 === 1 ? '#FAFAFA' : '#FFFFFF'};">
          <td style="padding: 10px 8px; text-align: center; font-family: monospace; font-size: 11px; color: #64748B;">
            ${idx + 1}
          </td>
          <td style="padding: 10px 8px;">
            <strong style="color: #0F172A; font-size: 13px; display: block;">${inv.nombre}</strong>
            ${inv.telefono ? `<span style="font-size: 10px; color: #64748B; font-family: monospace;">Tel: ${inv.telefono}</span>` : ''}
            ${inv.mensajeConfirmacion ? `<div style="font-size: 10px; color: #166534; font-style: italic; margin-top: 2px; background: #F0FDF4; padding: 2px 6px; border-radius: 4px; display: inline-block;">Nota: &ldquo;${inv.mensajeConfirmacion}&rdquo;</div>` : ''}
          </td>
          <td style="padding: 10px 8px; text-align: center; font-size: 12px; font-weight: bold; color: #1E293B;">
            ${inv.pases}
          </td>
          <td style="padding: 10px 8px; text-align: center; font-size: 12px; font-weight: 800; color: ${estaConfirmado ? '#166534' : '#64748B'};">
            ${estaConfirmado ? `${cupos} cupo(s)` : '0'}
          </td>
          <td style="padding: 10px 8px; text-align: center;">
            <span style="display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 9px; font-weight: 800; font-family: monospace; letter-spacing: 0.05em; ${badgeColor}">
              ${estadoTexto}
            </span>
          </td>
          <td style="padding: 10px 8px; text-align: center; border-left: 1px dashed #CBD5E1; min-width: 95px;">
            ${ingresoHtml}
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
          margin-top: 18px;
        }
        th {
          background: #0F172A;
          color: #FFFFFF;
          font-size: 9.5px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 10px 8px;
          border-bottom: 2.5px solid #C5A059;
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 24px; padding: 12px 18px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 13px; color: #475569; font-weight: 500;">
          Vista previa oficial para control de aforo y admisión en recepción.
        </span>
        <button onclick="window.print()" style="background: #0F172A; color: white; border: 1px solid #334155; padding: 9px 18px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          🖨️ Imprimir / Guardar como PDF
        </button>
      </div>

      <!-- Cabecera Institucional del Reporte con Acento Dorado Tarjetón -->
      <div style="border-top: 3px solid #C5A059; padding-top: 18px; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 9.5px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #C5A059; font-family: monospace;">
              ✦ TARJETÓN · PROTOCOLO & ADMISIÓN OFICIAL ✦
            </div>
            <h1 style="margin: 4px 0 3px 0; font-size: 24px; font-family: Georgia, serif; color: #0F172A; letter-spacing: -0.01em;">
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

        <!-- Tarjetas de Resumen Numérico Armónicas -->
        <div style="display: flex; gap: 10px; margin-top: 16px;">
          <div style="padding: 7px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 11px; color: #1E293B;">
            Total Invitados: <strong>${invitados.length}</strong>
          </div>
          <div style="padding: 7px 14px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; font-size: 11px; color: #166534;">
            ✓ Asistentes Aprobados: <strong>${confirmados.length} (${totalCuposConfirmados} cupos asegurados)</strong>
          </div>
          <div style="padding: 7px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 11px; color: #64748B;">
            Generado el: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <!-- Tabla de Asistencia -->
      <table>
        <thead>
          <tr>
            <th style="width: 35px; border-top-left-radius: 6px;">#</th>
            <th style="text-align: left;">Invitado / Titular</th>
            <th style="width: 70px;">Pases</th>
            <th style="width: 95px;">Cupos Aprob.</th>
            <th style="width: 110px;">Estado</th>
            <th style="width: 100px; border-top-right-radius: 6px;">Admisión / Puerta</th>
          </tr>
        </thead>
        <tbody>
          ${filasHtml}
        </tbody>
      </table>

      <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #94A3B8; border-top: 1.5px solid #C5A059; padding-top: 12px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.08em;">
        <span>Documento oficial expedido por Tarjetón Studio</span>
        <span>Control de recepción y protocolo</span>
      </div>
    </body>
    </html>
  `)

  ventana.document.close()
}
