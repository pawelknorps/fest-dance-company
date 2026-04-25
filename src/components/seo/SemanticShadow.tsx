import { portfolio } from '../../data/portfolio'

/**
 * Invisible Semantic Shadow
 * Content only visible to search engine crawlers and screen readers.
 */
export function SemanticShadow() {
  return (
    <div 
      className="sr-only !opacity-0 !h-0 !overflow-hidden !absolute" 
      aria-hidden="true"
    >
      <h1>FEST Dance Company - Premium Choreography & Movement Direction</h1>
      <p>FEST Dance Company to studio specjalizujące się w choreografii, movement direction oraz performance design dla koncertów, teledysków, kampanii reklamowych i eventów na całym świecie. Nasza siedziba znajduje się w Poznaniu, w Polsce.</p>
      
      <section>
        <h2>Portfolio Realizacji</h2>
        {portfolio.map((item) => (
          <article key={item.id}>
            <h3>{item.title}</h3>
            <p>Kategoria: {item.category} | Rola: {item.role} | Klient: {item.client}</p>
            <img 
              src={item.image.srcMobile as string} 
              alt={`Wizualizacja choreografii: ${item.title} - ${item.role} w kategorii ${item.category}.`} 
              width={item.image.width}
              height={item.image.height}
            />
          </article>
        ))}
      </section>
    </div>
  )
}
