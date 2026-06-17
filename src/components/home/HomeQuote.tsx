export function HomeQuote() {
  return (
    <section className="quote rv">
      <div className="wrap quote-g">
        <div className="quote-cp">
          <div className="qm">&ldquo;</div>
          <blockquote>
            Cada bichinho conta uma história. Para <span>decorar o quartinho</span>, presentear ou{' '}
            <span>eternizar uma fase tão especial</span>. Seja bem-vindo ao nosso mundo de suavidade e ternura.
          </blockquote>
          <p className="by">Aladiane, Fundadora da Maricota</p>
          <p className="qsig">com carinho</p>
        </div>
        <div className="quote-illo">
          <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
            <rect x="22" y="120" width="216" height="28" rx="10"/><path d="M42 120V64Q42 44 62 44L198 44Q218 44 218 64V120"/>
            <path d="M84 44V24Q84 12 98 12L174 12Q188 12 188 24V44"/>
            <line x1="136" y1="44" x2="136" y2="96"/><path d="M130 92L136 116L142 92"/>
            <path d="M122 106Q129 103 136 106Q143 103 150 106"/>
            <rect x="58" y="70" width="58" height="36" rx="7"/><circle cx="76" cy="88" r="5"/><circle cx="94" cy="88" r="5"/><circle cx="112" cy="88" r="5"/>
            <circle cx="190" cy="88" r="21"/><circle cx="190" cy="88" r="8"/>
            <line x1="190" y1="67" x2="190" y2="109" strokeWidth="1"/><line x1="169" y1="88" x2="211" y2="88" strokeWidth="1"/>
            <line x1="175" y1="73" x2="205" y2="103" strokeWidth="1"/><line x1="205" y1="73" x2="175" y2="103" strokeWidth="1"/>
            <ellipse cx="118" cy="20" rx="13" ry="7"/><line x1="118" y1="13" x2="118" y2="27"/>
            <path d="M118 27Q127 46 131 64Q134 80 136 96" strokeDasharray="3 3"/>
          </svg>
        </div>
      </div>
    </section>
  )
}
