import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B0F19',
          borderRadius: '40px',
          border: '4px solid #D4AF37',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F172A',
            borderRadius: '24px',
            border: '2px dashed rgba(212, 175, 55, 0.8)',
            position: 'relative',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              color: '#D4AF37',
              textTransform: 'uppercase',
              marginBottom: '4px',
              fontWeight: 600,
            }}
          >
            ✦ TARJETÓN ✦
          </span>
          <span
            style={{
              fontSize: '84px',
              fontWeight: 800,
              fontFamily: 'serif',
              color: '#FDE68A',
              lineHeight: 1,
            }}
          >
            T
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
