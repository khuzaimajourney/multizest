import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'MultiZest';
    const category = searchParams.get('category') || 'Free Online Tools';
    const description =
      searchParams.get('desc') ||
      'Fast, private, client-side tools with zero server uploads.';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 70px',
            backgroundColor: '#090d16',
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.22) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(124, 58, 237, 0.25) 0%, transparent 50%)',
            fontFamily: 'sans-serif',
            color: '#ffffff',
          }}
        >
          {/* Header with Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #2563EB, #4F46E5, #7C3AED)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
                }}
              >
                <span
                  style={{
                    color: '#ffffff',
                    fontSize: '32px',
                    fontWeight: 900,
                    letterSpacing: '-1px',
                  }}
                >
                  Z
                </span>
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#FBBF24',
                    border: '2px solid #090d16',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '30px',
                    fontWeight: 900,
                    letterSpacing: '-1px',
                    color: '#ffffff',
                  }}
                >
                  Multi<span style={{ color: '#60A5FA' }}>Zest</span>
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: '#94A3B8',
                    fontWeight: 700,
                  }}
                >
                  Fast • Free • Toolbox
                </span>
              </div>
            </div>

            {/* Category badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 22px',
                borderRadius: '999px',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                color: '#93C5FD',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              {category}
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxWidth: '960px',
            }}
          >
            <h1
              style={{
                fontSize: title.length > 30 ? '54px' : '64px',
                fontWeight: 900,
                lineHeight: 1.15,
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-1.5px',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '24px',
                color: '#cbd5e1',
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>

          {/* Footer Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                  }}
                />
                <span style={{ fontSize: '18px', color: '#94A3B8', fontWeight: 600 }}>
                  100% Client-Side Privacy
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px', color: '#F59E0B' }}>★ ★ ★ ★ ★</span>
                <span style={{ fontSize: '18px', color: '#94A3B8', fontWeight: 600 }}>
                  4.9 / 5 Rating
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px', color: '#94A3B8', fontWeight: 600 }}>
                  No Sign-Up Required
                </span>
              </div>
            </div>

            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#60A5FA',
                letterSpacing: '-0.5px',
              }}
            >
              multizest.vercel.app
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
}
