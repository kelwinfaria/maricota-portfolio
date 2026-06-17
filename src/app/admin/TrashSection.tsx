import { TrashCard } from './TrashCard'
import type { Product, Category } from './types'

export function TrashSection({ trash, cats, onRestore, onPermDelete }: {
  trash: Product[]; cats: Category[]; onRestore: (id: string) => void; onPermDelete: (id: string) => void
}) {
  if (trash.length === 0) return (
    <div className="empty">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M52 18H12l3.5 36h29L52 18z"/>
        <path d="M6 18h52"/><path d="M26 10h12"/>
        <line x1="24" y1="28" x2="25" y2="46"/><line x1="32" y1="28" x2="32" y2="46"/><line x1="40" y1="28" x2="39" y2="46"/>
      </svg>
      <h3>Lixeira vazia</h3>
      <p>Produtos excluídos aparecem aqui para recuperação.</p>
    </div>
  )
  return (
    <div>
      <p style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 18, maxWidth: 560 }}>
        Produtos excluídos ficam aqui. Restaure para recuperar ou exclua permanentemente.
      </p>
      <div className="pgrid">
        {trash.map(p => (
          <TrashCard key={p.id} p={p} cats={cats} onRestore={() => onRestore(p.id)} onPermDelete={() => onPermDelete(p.id)} />
        ))}
      </div>
    </div>
  )
}
