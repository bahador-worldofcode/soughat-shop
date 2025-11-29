import { ImageResponse } from 'next/og'

// تنظیمات سایز تصویر (استاندارد گوگل و موبایل)
export const size = {
  width: 192,
  height: 192,
}
export const contentType = 'image/png'

// تولید آیکون HD
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120, // فونت بزرگتر برای سایز جدید
          background: '#2563eb', // آبی برند
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '40px', // گردی متناسب با سایز بزرگ
          fontWeight: 800,
          fontFamily: 'sans-serif',
        }}
      >
        S
      </div>
    ),
    {
      ...size,
    }
  )
}