export function AdminLogin({ pw, setPw, pwErr, onLogin }: {
  pw: string; setPw: (v: string) => void; pwErr: boolean; onLogin: () => void
}) {
  return (
    <div id="login">
      <div className="lcard">
        <img src="/images/logo-maricota.png" alt="Maricota" />
        <h1>Painel de Administração</h1>
        <p className="sub">Bem-vinda, Aladiane</p>
        <div className="field">
          <label>Senha</label>
          <input
            type="password" className={pwErr ? 'err' : ''}
            value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin()}
            placeholder="••••••••" autoFocus
          />
          {pwErr && <div className="err-msg show">Senha incorreta. Tente novamente.</div>}
        </div>
        <button className="lbtn" onClick={onLogin}>Entrar</button>
        <p className="lnote">Porta segura · Maricota 2026</p>
      </div>
    </div>
  )
}
