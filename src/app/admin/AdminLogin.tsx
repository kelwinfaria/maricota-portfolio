'use client'
import { useState } from 'react'

export function AdminLogin({ pw, setPw, pwErr, onLogin }: {
  pw: string; setPw: (v: string) => void; pwErr: boolean; onLogin: () => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div id="login">
      <div className="lcard">
        <img src="/images/logo-maricota.png" alt="Maricota" />
        <h1>Painel de Administração</h1>
        <p className="sub">Bem-vinda, Aladiane</p>
        <div className="field">
          <label>Senha</label>
          <div className="pw-wrap">
            <input
              type={show ? 'text' : 'password'} className={pwErr ? 'err' : ''}
              value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onLogin()}
              placeholder="••••••••" autoFocus
            />
            <button
              type="button" className="pw-eye"
              onClick={() => setShow(s => !s)}
              aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={show}
              tabIndex={-1}
            >
              {show ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <path d="M1 1l22 22" />
                  <path d="M6.61 6.61A18.5 18.5 0 0 0 2 12s3 8 10 8a9.12 9.12 0 0 0 5.39-1.61" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {pwErr && <div className="err-msg show">Senha incorreta. Tente novamente.</div>}
        </div>
        <button className="lbtn" onClick={onLogin}>Entrar</button>
        <p className="lnote">Porta segura · Maricota 2026</p>
      </div>
    </div>
  )
}
