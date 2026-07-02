import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Quiénes Somos — EdTech',
  description: 'Conoce la misión, el equipo y los valores detrás de la plataforma EdTech.',
};

const pillars = [
  {
    icon: '🎯',
    title: 'Aprendizaje enfocado',
    body: 'Cursos diseñados para que adquieras habilidades concretas, sin rodeos ni contenido de relleno.',
  },
  {
    icon: '🌎',
    title: 'Acceso para todos',
    body: 'Precios accesibles y contenido en español para que la barrera económica o del idioma no detenga tu crecimiento.',
  },
  {
    icon: '👩‍🏫',
    title: 'Instructores de la industria',
    body: 'Profesionales activos que enseñan desde la práctica real, no desde el manual.',
  },
];

const disciplines = [
  { label: 'Programación', image: '/images/courses/react19.png', href: '/?categoria=programacion' },
  { label: 'Diseño UI/UX',  image: '/images/courses/uiux.png',    href: '/?categoria=diseno' },
  { label: 'Marketing',     image: '/images/courses/marketing.png', href: '/?categoria=marketing' },
  { label: 'Negocios',      image: '/images/courses/negocios.png',  href: '/?categoria=negocios' },
];

export default function AboutPage() {
  return (
    <main>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #5B4FFF 0%, #7B6FFF 60%, #2D7D6F 100%)',
        color: '#fff',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body-s)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          opacity: 0.75,
          marginBottom: 16,
        }}>
          Quiénes somos
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, var(--text-display-xl))',
          fontWeight: 700,
          lineHeight: 1.15,
          maxWidth: 680,
          margin: '0 auto 24px',
        }}>
          Formamos a los profesionales que el mundo digital necesita
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body-l)',
          opacity: 0.9,
          maxWidth: 560,
          margin: '0 auto 40px',
          lineHeight: 1.65,
        }}>
          Somos una plataforma de educación en línea construida por y para personas que quieren aprender
          tecnología, diseño y negocios sin depender de un título universitario.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: '#F6F4F0',
            color: '#5B4FFF',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 'var(--text-body-m)',
            padding: '14px 32px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            transition: 'transform var(--transition-fast)',
          }}
        >
          Explorar cursos →
        </Link>
      </section>

      {/* ── Mission ──────────────────────────────────────────────────────── */}
      <section style={{
        background: '#F6F4F0',
        padding: '72px 24px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-m)',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: 20,
          }}>
            Nuestra misión
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-l)',
            color: '#4B5563',
            lineHeight: 1.75,
          }}>
            Democratizar el conocimiento técnico y creativo en América Latina. Creemos que el talento no
            tiene dirección postal y que con el acceso correcto cualquier persona puede construir
            una carrera que le apasione.
          </p>
        </div>
      </section>

      {/* ── Pillars ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-m)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 48,
            color: '#1A1A1A',
          }}>
            Lo que nos define
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {pillars.map((p) => (
              <div
                key={p.title}
                style={{
                  background: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'box-shadow var(--transition-normal)',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{p.icon}</span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-body-l)',
                  fontWeight: 600,
                  color: '#1A1A1A',
                }}>
                  {p.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body-m)',
                  color: '#6B7280',
                  lineHeight: 1.65,
                }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disciplines grid ─────────────────────────────────────────────── */}
      <section style={{ background: '#F6F4F0', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-m)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 12,
            color: '#1A1A1A',
          }}>
            Áreas de aprendizaje
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-m)',
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: 48,
          }}>
            Elige tu camino y empieza hoy.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {disciplines.map((d) => (
              <Link
                key={d.label}
                href={d.href}
                style={{
                  display: 'block',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  position: 'relative',
                  aspectRatio: '4/3',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
              >
                <Image
                  src={d.image}
                  alt={d.label}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(91,79,255,0.85) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '20px 18px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 'var(--text-body-l)',
                    color: '#fff',
                  }}>
                    {d.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '72px 24px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-m)',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: 16,
          }}>
            ¿Listo para empezar?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-l)',
            color: '#6B7280',
            lineHeight: 1.65,
            marginBottom: 36,
          }}>
            Crea tu cuenta gratis y accede al catálogo completo de cursos.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/register"
              style={{
                background: '#5B4FFF',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 'var(--text-body-m)',
                padding: '14px 32px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
              }}
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              style={{
                background: 'transparent',
                color: '#5B4FFF',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 'var(--text-body-m)',
                padding: '14px 32px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                border: '1.5px solid #5B4FFF',
              }}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
