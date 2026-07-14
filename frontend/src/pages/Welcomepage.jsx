import './Welcomepage.css';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel.jsx';

/* ── Feature slides data ── */
const FEATURES = [
  {
    icon: '💬',
    tag: 'Ask AI',
    title: 'Ask Questions Naturally',
    desc: 'Chat with your document like you would a human expert. Ask follow-up questions, request clarifications, and drill into specific sections — no search queries needed.',
    accent: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    footer: 'Powered by Claude AI',
  },
  {
    icon: '✨',
    tag: 'Summary',
    title: 'Smart Summaries in Seconds',
    desc: 'Get a crisp TL;DR, a bullet-point list of key takeaways, and a concept tag cloud — all generated automatically the moment your document finishes processing.',
    accent: '#f5c518',
    bg: 'rgba(245,197,24,0.1)',
    footer: 'Saves hours of reading',
  },
  {
    icon: '🧩',
    tag: 'Quiz',
    title: 'Auto-Generated Quizzes',
    desc: 'BrainDoc reads your document and generates multiple-choice questions to test your understanding. Perfect for studying, training, or validating comprehension.',
    accent: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
    footer: 'Adaptive difficulty',
  },
  {
    icon: '🔍',
    tag: 'Search',
    title: 'Semantic Search',
    desc: "Find any concept, idea, or passage inside your document without knowing the exact words. Our vector search understands meaning — not just keywords.",
    accent: '#22d3ee',
    bg: 'rgba(34,211,238,0.1)',
    footer: 'Meaning-first retrieval',
  },
  {
    icon: '💡',
    tag: 'Insights',
    title: 'Extract Hidden Insights',
    desc: 'Surface statistics, named entities, recurring themes, and data patterns automatically. Turn dense reports into structured intelligence at a glance.',
    accent: '#b5f23d',
    bg: 'rgba(181,242,61,0.1)',
    footer: 'Pattern recognition',
  },
  {
    icon: '📊',
    tag: 'Analytics',
    title: 'Document Analytics',
    desc: 'Understand reading complexity, topic distribution, and key entity frequency at a glance. Know what your document is really about before you read a word.',
    accent: '#f472b6',
    bg: 'rgba(244,114,182,0.1)',
    footer: 'Instant document intel',
  },
];

const STEPS = [
  { num: '01', icon: '📤', title: 'Upload your document', desc: 'Drag and drop any PDF, DOCX, or TXT file up to 50 MB. We accept research papers, reports, textbooks, contracts — anything.' },
  { num: '02', icon: '⚡', title: 'AI processes it',       desc: 'Our pipeline reads, indexes, and embeds your document in seconds. A live progress bar tracks every step so you always know what\'s happening.' },
  { num: '03', icon: '🎯', title: 'Choose your action',    desc: 'Once ready, pick what you want: chat with it, get a summary, take a quiz, or search semantically. Each feature is one click away.' },
  { num: '04', icon: '🧠', title: 'Get smarter faster',    desc: 'Ask follow-ups, revisit saved summaries, retake quizzes. Everything is stored per document so you can come back anytime.' },
];

const TRUST_ITEMS = [
  { icon: '🔒', text: 'End-to-end encrypted' },
  { icon: '⚡', text: 'Processes in under 10 seconds' },
  { icon: '📄', text: 'Supports PDF, DOCX, TXT' },
  { icon: '🌍', text: 'Works in any language' },
  { icon: '♾️', text: 'Unlimited questions per doc' },
];

/* ── Reusable shadcn-style button ── */
function NavBtn({ variant = 'outline', children, onClick }) {
  return (
    <button
      className={variant === 'gold' ? 'btn-gold' : 'btn-outline-dark'}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────
   WelcomePage
   ───────────────────────────────── */
export default function WelcomePage() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const navigate = useNavigate();

  return (
    <div className="welcome-page">

      {/* ── Navbar ── */}
      <nav className="wlc-nav">
        <div className="wlc-nav__logo-wrap">
          <img src="cornPDF_logo.png" alt="logo" />
        </div>

        <div className="wlc-nav__links">
          <button className="wlc-nav__link" onClick={() => scrollTo('features')}>Features</button>
          <button className="wlc-nav__link" onClick={() => scrollTo('how-it-works')}>How it works</button>
          <button className="wlc-nav__link" onClick={() => scrollTo('pricing')}>Pricing</button>
        </div>

        <div className="wlc-nav__actions">
          {/* shadcn-style ghost / outline button */}
          <NavBtn variant="outline" onClick={()=>{navigate('/login')}}>Log in</NavBtn>
          {/* shadcn-style solid primary button */}
          <NavBtn variant="gold" onClick={()=>{navigate('/signup')}}>Sign up free</NavBtn>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="wlc-hero">
        <div className="wlc-hero__glow" />

        <div className="wlc-hero__badge">
          <span className="wlc-hero__badge-dot" />
          AI-Powered Document Intelligence
        </div>

        <h1 className="wlc-hero__title">
          From{' '}
          <span className="wlc-hero__title-highlight">Questions</span>
          <br />
          to Revelations
        </h1>

        <p className="wlc-hero__sub">
          Upload any PDF and instantly chat with it, get AI summaries, generate quizzes,
          and search semantically — your documents, finally understood.
        </p>

        <div className="wlc-hero__cta">
          <button className="btn-hero-primary" onClick={() => navigate('/signup')}>
            Get started free →
          </button>
          <button className="btn-hero-secondary" onClick={() => scrollTo('features')}>
            See features ↓
          </button>
        </div>

        <div className="wlc-stats">
          {[
            { num: '50MB',  label: 'Max file size' },
            { num: '<10s',  label: 'Processing time' },
            { num: '5',     label: 'AI features' },
            { num: '∞',     label: 'Questions per doc' },
          ].map(s => (
            <div className="wlc-stat" key={s.label}>
              <div className="wlc-stat__num">{s.num}</div>
              <div className="wlc-stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust strip ── */}
      <div className="wlc-trust">
        {TRUST_ITEMS.map(t => (
          <div className="wlc-trust__item" key={t.text}>
            <span className="wlc-trust__icon">{t.icon}</span>
            {t.text}
          </div>
        ))}
      </div>

      {/* ── Features Carousel ── */}
      <section className="wlc-carousel-section" id="features">
        <div className="wlc-carousel-wrapper">
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="wlc-section__label">✦ Features</div>
            <h2 className="wlc-section__title">Everything your documents need</h2>
            <p className="wlc-section__sub">
              Six powerful AI tools built into one clean workspace — no switching apps, no copying text, no wasted time.
            </p>
          </div>

          {/* ── shadcn Carousel ── */}
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {FEATURES.map((feat, i) => (
                <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div style={{ padding: '4px', height: '100%' }}>
                    <div
                      className="feature-slide"
                      style={{
                        '--slide-accent': feat.accent,
                        '--slide-bg': feat.bg,
                      }}
                    >
                      <div className="feature-slide__icon-wrap">{feat.icon}</div>
                      <div className="feature-slide__tag">{feat.tag}</div>
                      <div className="feature-slide__title">{feat.title}</div>
                      <div className="feature-slide__desc">{feat.desc}</div>
                      <div className="feature-slide__footer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {feat.footer}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* shadcn carousel nav buttons */}
            <CarouselPrevious
              style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f0f0',
                left: '-16px',
              }}
            />
            <CarouselNext
              style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f0f0',
                right: '-16px',
              }}
            />
          </Carousel>

          {/* Dot indicators visual hint */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '2rem' }}>
            {FEATURES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === 0 ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === 0 ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="wlc-section" id="how-it-works">
        <div className="wlc-section__label">✦ Process</div>
        <h2 className="wlc-section__title">How it works</h2>
        <p className="wlc-section__sub">
          Four steps from raw file to full understanding. No setup, no learning curve.
        </p>
        <div className="wlc-steps">
          {STEPS.map(s => (
            <div className="wlc-step" key={s.num}>
              <div className="wlc-step__icon">{s.icon}</div>
              <div className="wlc-step__num">{s.num}</div>
              <div className="wlc-step__title">{s.title}</div>
              <div className="wlc-step__desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing teaser ── */}
      <section className="wlc-section" id="pricing" style={{ paddingTop: 0 }}>
        <div className="wlc-section__label">✦ Pricing</div>
        <h2 className="wlc-section__title">Simple, honest pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', maxWidth: 700 }}>
          {/* Free */}
          <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '2rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '0.5rem' }}>Free</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.04em', marginBottom: '0.3rem' }}>$0</div>
            <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '1.5rem' }}>Forever free, no card required</div>
            {['3 documents / month', '5 questions per doc', 'AI summaries', 'Basic quiz (5 Qs)'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem', color: '#aaa', marginBottom: 8 }}>
                <span style={{ color: '#b5f23d' }}>✓</span> {f}
              </div>
            ))}
            <button className="btn-outline-dark" style={{ width: '100%', marginTop: '1.5rem', padding: '11px' }} onClick={() => navigate('/signup')}>
              Get started
            </button>
          </div>
          {/* Premium */}
          <div style={{ background: 'linear-gradient(145deg, #1a1500, #161616)', border: '1px solid rgba(245,197,24,0.3)', borderRadius: 20, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #f5c518, #ffe566)' }} />
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f5c518', marginBottom: '0.5rem' }}>⚡ Premium</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.04em', marginBottom: '0.3rem' }}>$19</div>
            <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: '1.5rem' }}>per month, cancel anytime</div>
            {['Unlimited documents', 'Unlimited questions', 'Full summaries + insights', 'Unlimited quizzes', 'Semantic search', 'Priority processing'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem', color: '#ccc', marginBottom: 8 }}>
                <span style={{ color: '#f5c518' }}>✦</span> {f}
              </div>
            ))}
            <button className="btn-gold" style={{ width: '100%', marginTop: '1.5rem', padding: '11px' }} onClick={() => navigate('/signup')}>
              Start free trial →
            </button>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="wlc-cta-section">
        <h2 className="wlc-cta-title">
          Ready to understand your<br />
          <span style={{ color: 'var(--gold)' }}>documents better?</span>
        </h2>
        <p className="wlc-cta-sub">Join thousands of students, researchers, and professionals. Free to start.</p>
        <div className="wlc-cta-actions">
          <button className="btn-hero-primary" onClick={() => navigate('/signup')}>Create free account →</button>
          <button className="btn-hero-secondary" onClick={() => navigate('/login')}>Log in</button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="wlc-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.1rem' }}>🌽</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.9rem', color: '#555' }}>BrainDoc</span>
        </div>
        <div className="wlc-footer__copy">© 2026 BrainDoc. All rights reserved.</div>
        <div className="wlc-footer__links">
          <a className="wlc-footer__link" href="#">Privacy</a>
          <a className="wlc-footer__link" href="#">Terms</a>
          <a className="wlc-footer__link" href="#">Contact</a>
        </div>
      </footer>

    </div>
  );
}