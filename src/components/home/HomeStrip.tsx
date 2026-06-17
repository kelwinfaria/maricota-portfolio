const items = [
  { icon: '✦', text: <><b>Peças únicas</b>, feitas à mão</> },
  { icon: '✈', text: <>Envio para <b>todo o Brasil</b></> },
  { icon: '❀', text: <>Materiais <b>seguros e macios</b></> },
  { icon: '♥', text: <><b>Personalização</b> sob encomenda</> },
]

export function HomeStrip() {
  const doubled = [...items, ...items]
  return (
    <div className="strip" aria-hidden="true">
      <div className="marq">
        {doubled.map((item, i) => (
          <div key={i} className="spill">
            <span className="si">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
