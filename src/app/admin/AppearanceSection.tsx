import { PRESETS } from './api'
import type { AppCfg } from './types'

export function AppearanceSection({ appCfg, setAppCfg, onSave }: {
  appCfg: AppCfg; setAppCfg: (cfg: AppCfg) => void; onSave: () => void
}) {
  const set = (key: keyof AppCfg, val: string) => setAppCfg({ ...appCfg, [key]: val })
  return (
    <div>
      <p style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 20, maxWidth: 640 }}>Personalize as cores do portfólio.</p>
      <div className="ap-grid">
        <div className="ap-card" style={{ gridColumn: 'span 2' }}>
          <h3>Paletas prontas</h3>
          <p className="desc">Escolha um tema completo ou ajuste individualmente.</p>
          <div className="presets">
            {PRESETS.map((p, i) => (
              <div key={i} className="preset" style={{ background: p.brand }} title={p.name} onClick={() => setAppCfg(p)} />
            ))}
          </div>
        </div>
        <div className="ap-card">
          <h3>Cor principal</h3>
          <p className="desc">Botões de ação, badges de destaque, CTA de WhatsApp.</p>
          {(['brand', 'brandL', 'brandP'] as const).map((k, idx) => (
            <div key={k} className="color-row">
              <label>{['Cor primária', 'Tom claro (hover)', 'Fundo pastel'][idx]}</label>
              <input type="color" className="color-pick" value={appCfg[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="ap-card">
          <h3>Seções e detalhes</h3>
          <p className="desc">Fundo das seções alternadas e acento nos títulos.</p>
          {(['sec', 'pill', 'accent'] as const).map((k, idx) => (
            <div key={k} className="color-row">
              <label>{['Fundo das seções', 'Fundo das pílulas', 'Acento (itálico)'][idx]}</label>
              <input type="color" className="color-pick" value={appCfg[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
      <div className="ap-actions">
        <button className="ap-save" onClick={onSave}>Salvar aparência</button>
        <button className="ap-reset" onClick={() => setAppCfg(PRESETS[0])}>Restaurar padrões</button>
      </div>
    </div>
  )
}
