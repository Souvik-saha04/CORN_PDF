import './Summarypanel.css';

export default function SummaryPanel({ doc }) {
  const docTitle = doc?.name || 'Selected document';
  const insights = [
    'AI Safety', 'Governance', 'Alignment', 'Layered Model',
    'Regulation', 'Ethics', 'Neural Networks', 'Oversight',
    'Risk Framework', 'Policy',
  ];

  return (
    <div className="panel summary-panel">
      <h2 className="summary-panel__title">Document Summary</h2>
      <p className="summary-panel__subtitle">{docTitle}</p>

      <div className="summary-card">
        <div className="summary-card__header">
          <div className="summary-card__icon">✨</div>
          <div className="summary-card__title">TL;DR</div>
        </div>
        <div className="summary-card__body">
          This paper presents a comprehensive framework for AI governance, arguing that current
          single-layer safety approaches are insufficient. The authors propose a three-tier layered
          model combining technical constraints, institutional oversight, and societal feedback loops.
          Empirical analysis across 12 case studies demonstrates that jurisdictions implementing all
          three layers showed 73% fewer alignment failures than those relying on technical measures alone.
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-card__header">
          <div className="summary-card__icon">📌</div>
          <div className="summary-card__title">Key Points</div>
        </div>
        <ul className="summary-key-points">
          {[
            'Single-layer AI safety approaches have a 67% failure rate in complex deployment scenarios.',
            'The three-tier governance model shows statistically significant improvement (p < 0.01).',
            'Societal feedback loops are the most under-implemented tier globally.',
            'Authors recommend mandatory multi-tier audits for high-stakes AI systems.',
            'The framework has been adopted by 3 national governments as of early 2026.',
          ].map((pt, i) => <li key={i}>{pt}</li>)}
        </ul>
      </div>

      <div className="summary-card">
        <div className="summary-card__header">
          <div className="summary-card__icon">💡</div>
          <div className="summary-card__title">Key Concepts</div>
        </div>
        <div className="insight-tags">
          {insights.map(t => <span key={t} className="insight-tag">{t}</span>)}
        </div>
      </div>
    </div>
  );
}