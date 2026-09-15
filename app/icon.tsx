import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
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
          borderRadius: '7px',
          border: '1.5px solid #D4AF37',
          position: 'relative',
        }}
      >
        {/* Tarjeta interior en relieve */}
        <div
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F172A',
            borderRadius: '4px',
            border: '1px solid rgba(212, 175, 55, 0.7)',
          }}
        >
          {/* Letra T señorial en dorado */}
          <span
            style={{
              fontSize: '18px',
              fontWeight: 800,
              fontFamily: 'serif',
              color: '#FDE68A',
              lineHeight: 1,
              marginTop: '-1px',
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
