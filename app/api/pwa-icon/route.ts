import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import React from 'react'

export async function GET(req: NextRequest) {
  const size = Math.min(512, Math.max(16, parseInt(req.nextUrl.searchParams.get('size') ?? '192')))
  const radius = Math.round(size * 0.22)
  const fontSize = Math.round(size * 0.48)

  return new ImageResponse(
    React.createElement(
      'div',
      {
        style: {
          width: size,
          height: size,
          background: '#4f46e5',
          borderRadius: radius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      React.createElement(
        'span',
        {
          style: {
            fontSize,
            color: 'white',
            fontWeight: 700,
            fontFamily: 'sans-serif',
            lineHeight: 1,
          },
        },
        'B'
      )
    ),
    { width: size, height: size }
  )
}
