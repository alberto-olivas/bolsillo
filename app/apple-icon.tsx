import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#4f46e5',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 90, color: 'white', fontWeight: 700, fontFamily: 'sans-serif' }}>
          B
        </span>
      </div>
    ),
    { width: 180, height: 180 }
  )
}
