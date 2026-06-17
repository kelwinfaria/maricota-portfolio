const WaIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.6.9 1.9 1.1.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z" />
  </svg>
)

export function HomeEncomendar({ waUrl }: { waUrl: string }) {
  return (
    <section className="encomendar" id="encomendar">
      <div className="wrap">
        <div className="sh rv">
          <p className="ey">Como funciona</p>
          <h2>Como Encomendar</h2>
          <p className="sub">Simples, rápido e com todo o carinho da Maricota.</p>
        </div>
        <div className="pcards rv">
          <div className="pcard"><span className="pi">✎</span><h3>Feito por encomenda</h3><p>Cada peça é produzida com dedicação após o pedido. Consulte o prazo de produção disponível.</p><span className="ptag">Prazo sob consulta</span></div>
          <div className="pcard"><span className="pi">✈</span><h3>Frete para todo o Brasil</h3><p>Enviamos com todo carinho para qualquer canto do país. O amor da Maricota chega até você.</p><span className="ptag">Todo o Brasil</span></div>
          <div className="pcard"><span className="pi">♥</span><h3>Formas de pagamento</h3><p>Pix ou link de pagamento. Cartão de crédito via link, com acréscimo da taxa da plataforma.</p><span className="ptag">Pix e Crédito</span></div>
        </div>
        <div className="cta-band rv">
          <span className="cta-weave" />
          <div className="cta-cp">
            <h3>Vamos criar a sua peça?</h3>
            <p>Conte qual bichinho, roupinha ou porta maternidade você sonha. Respondo com todo carinho.</p>
          </div>
          <a className="btn-wa" href={waUrl} target="_blank" rel="noopener">
            <WaIcon /> Encomendar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
