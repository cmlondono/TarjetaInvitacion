import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const titulo = searchParams.get('titulo') || 'Invitación Protocolaria'
    const invitado = searchParams.get('invitado') || ''

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#090D16',
            backgroundImage: 'radial-gradient(circle at 50% 30%, #1E293B 0%, #090D16 100%)',
            fontFamily: 'sans-serif',
            padding: '48px',
          }}
        >
          {/* Tarjeta central formal */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              borderRadius: '24px',
              padding: '48px 64px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              maxWidth: '920px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#94A3B8',
                fontSize: '18px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                fontWeight: 600,
              }}
            >
              ✦ {invitado ? 'Pase Protocolario Personal' : 'Convocatoria Oficial'} ✦
            </div>

            <div
              style={{
                fontSize: invitado ? '52px' : '46px',
                fontWeight: 'bold',
                color: '#F8FAFC',
                lineHeight: 1.15,
                marginBottom: '12px',
                letterSpacing: '-0.02em',
              }}
            >
              {invitado || titulo}
            </div>

            {invitado && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#CBD5E1',
                  marginTop: '8px',
                  fontWeight: 400,
                }}
              >
                Convocatoria a: {titulo}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '36px',
                padding: '14px 32px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Consultar detalles y confirmar asistencia ➜
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    return new Response(`Error generando imagen: ${e.message}`, { status: 500 })
  }
}
