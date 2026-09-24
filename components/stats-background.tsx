'use client'

// Minimal ambient background — only a soft dot grid and a few floating points
export function StatsBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.045]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bgDots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill="#C2547A" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgDots)" />
      </svg>

      {/* A few subtle floating sigma symbols at the corners */}
      {[
        { top: '5%', left: '3%', sym: 'σ' },
        { top: '5%', right: '4%', sym: 'μ' },
        { bottom: '6%', left: '4%', sym: 'β' },
        { bottom: '5%', right: '3%', sym: 'α' },
      ].map(({ sym, ...pos }, i) => (
        <span
          key={i}
          className="absolute font-serif select-none opacity-[0.1]"
          style={{ ...pos, color: '#C2547A', fontSize: '1.5rem' }}
        >
          {sym}
        </span>
      ))}
    </div>
  )
}
