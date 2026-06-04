import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export const alt = 'Tienda de Ropa - Moda con estilo en Uruguay';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FDFBF7',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            backgroundColor: '#C17A5C',
            color: '#FDFBF7',
            fontSize: '120px',
            fontWeight: 600,
            fontFamily: 'serif',
            lineHeight: 1,
            marginBottom: '40px',
          }}
        >
          T
        </div>
        <div
          style={{
            fontSize: '72px',
            fontWeight: 600,
            color: '#1A1A1A',
            fontFamily: 'serif',
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          Tienda de Ropa
        </div>
        <div
          style={{
            fontSize: '32px',
            color: '#4A4A4A',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          Moda con estilo · Uruguay
        </div>
      </div>
    ),
    { ...size },
  );
}
