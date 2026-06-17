import type { Settings } from './types'

export function SettingsSection({ settings, setSettings, sOld, setSOld, sNew, setSNew, onSaveWA, onSaveName, onChangePW }: {
  settings: Settings; setSettings: (s: Settings) => void
  sOld: string; setSOld: (v: string) => void; sNew: string; setSNew: (v: string) => void
  onSaveWA: () => void; onSaveName: () => void; onChangePW: () => void
}) {
  return (
    <div className="set-grid">
      <div className="sc">
        <h3>WhatsApp de contato</h3>
        <p className="desc">Número que aparece em todos os botões de encomenda.</p>
        <div className="field">
          <label>Número (com DDI + DDD)</label>
          <input type="text" value={settings.wa_number} onChange={e => setSettings({ ...settings, wa_number: e.target.value })} placeholder="5599999999999" />
        </div>
        <button className="ssave" onClick={onSaveWA}>Salvar número</button>
      </div>
      <div className="sc">
        <h3>Dados do ateliê</h3>
        <p className="desc">Nome exibido no painel.</p>
        <div className="field">
          <label>Seu nome</label>
          <input type="text" value={settings.admin_name} onChange={e => setSettings({ ...settings, admin_name: e.target.value })} placeholder="Aladiane" />
        </div>
        <button className="ssave" onClick={onSaveName}>Salvar</button>
      </div>
      <div className="sc">
        <h3>Alterar senha</h3>
        <p className="desc">Mantenha o painel protegido.</p>
        <div className="field"><label>Senha atual</label><input type="password" value={sOld} onChange={e => setSOld(e.target.value)} placeholder="Senha atual" /></div>
        <div className="field"><label>Nova senha</label><input type="password" value={sNew} onChange={e => setSNew(e.target.value)} placeholder="Nova senha (mín. 6 caracteres)" /></div>
        <button className="ssave" onClick={onChangePW}>Alterar senha</button>
      </div>
      <div className="sc">
        <h3>Portfólio público</h3>
        <p className="desc">Link que seus clientes acessam.</p>
        <a className="lp" href="/" target="_blank">🔗 Abrir portfólio</a>
      </div>
    </div>
  )
}
