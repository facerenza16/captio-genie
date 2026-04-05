# Análisis Competitivo — Maps Lead Scraper

## Herramientas similares existentes

### Específicas para Google Maps

| Herramienta | Tipo | Modelo | Diferencial |
|---|---|---|---|
| **Outscraper** | Extensión + web app | Freemium (por volumen) | La más conocida; extrae teléfono, web, email, rating |
| **Scrap.io** | Web app + extensión | Suscripción mensual | Filtros avanzados por categoría, país, rating |
| **Maps Scraper** (genéricas) | Extensión | Variable | Calidad inconsistente; mayoría sin enriquecimiento |

### Scrapers genéricos (funcionan en Maps)

| Herramienta | Tipo | Notas |
|---|---|---|
| **Instant Data Scraper** | Extensión (gratuita) | Propósito general; requiere intervención manual, sin scroll automático |
| **Data Miner** | Extensión | Permite crear "recetas" por sitio; curva de aprendizaje mayor |

### Herramientas cloud (sin extensión)

| Herramienta | Modelo | Notas |
|---|---|---|
| **Apify — Google Maps Scraper** | Pago por uso | El más usado a nivel técnico; Playwright en servidores cloud |
| **PhantomBuster** | Suscripción (caro) | Orientado a LinkedIn; tiene flujo de Maps |

---

## Fortalezas de nuestra extensión

### Privacidad y confianza
Los datos nunca salen de la máquina del usuario. Outscraper, Apify y PhantomBuster procesan las búsquedas en sus propios servidores. Para quienes scrapeean competidores o nichos sensibles, esto es una ventaja significativa.

### Sin fricción de onboarding
No requiere cuenta, API key ni tarjeta de crédito. Cargar la carpeta y funciona. En el segmento LatAm, donde la desconfianza hacia SaaS con cobro automático es alta, esto reduce la barrera de entrada considerablemente.

### Enriquecimiento de email
Pocos scrapers gratuitos llegan a buscar el email en el sitio web del negocio. Es un diferenciador real para quienes hacen outreach directo.

### Corre en el browser real del usuario
Google tiene mucho más difícil detectar y bloquear una extensión que opera en el browser legítimo del usuario, comparado con bots en servidores cloud. Las herramientas cloud sufren captchas frecuentes.

### Precio: $0
En un mercado donde Outscraper cobra por resultado y Apify cobra por hora de cómputo, la gratuidad es una propuesta de valor muy fuerte, especialmente en LatAm.

### CSV con soporte correcto para caracteres latinos
BOM UTF-8 incluido por defecto — detalle que muchas herramientas ignoran y que genera problemas al abrir el archivo en Excel en Windows.

---

## Debilidades de nuestra extensión

### Requiere presencia del usuario
El scraping ocurre en tiempo real con Maps abierto. Las herramientas cloud corren en background y entregan el CSV terminado. Para volúmenes grandes, esto es una diferencia operativa importante.

### Volumen limitado por velocidad de scroll
El loop espera 1.5 segundos entre scrolls. Para 500+ resultados puede tardar bastante. No hay forma de paralelizar porque el DOM es único.

### Selectores frágiles
Los selectores de clase (`.qBF1Pd`, `.MW4etd`, `.UY7F9`) se rompen cuando Google actualiza Maps. Las herramientas comerciales tienen equipos que los corrigen rápidamente; una extensión indie puede quedar rota días o semanas.

### Sin filtros antes de exportar
Competidores como Scrap.io permiten filtrar por rating mínimo, cantidad de reseñas, presencia de sitio web, etc. antes de exportar. Actualmente se exporta todo o nada.

### Distribución limitada
No estar en el Web Store oficial implica activar el modo desarrollador en Chrome, lo que genera fricción y desconfianza en usuarios no técnicos.

### Sin historial ni deduplicación entre sesiones
No hay forma de saber qué leads son nuevos si se repite la misma búsqueda en distintos días.

---

## Riesgo principal a largo plazo

Google puede cambiar la estructura del DOM de Maps o agregar protecciones que rompan el scroll automático. Sin un sistema de monitoreo, una sola actualización puede inutilizar la extensión por tiempo indefinido. Las herramientas comerciales tienen incentivo económico para reaccionar rápido.

---

## Tabla comparativa resumen

| Criterio | Nuestra extensión | Competidores pagos |
|---|---|---|
| Precio | Gratis | $20–$200/mes |
| Privacidad de datos | Total (todo local) | Datos en servidores externos |
| Riesgo de detección por Google | Bajo | Medio-alto |
| Volumen de resultados | Medio | Alto |
| Filtros de exportación | Básicos | Avanzados |
| Mantenimiento ante cambios de Maps | Manual / lento | Equipo dedicado |
| Onboarding | Requiere modo desarrollador | Web Store (un click) |
| Enriquecimiento con email | Sí | En planes pagos |

---

## Posicionamiento sugerido

> Herramienta gratuita, privada y sin registro, para profesionales y agencias que hacen prospección manual a escala mediana en el mercado LatAm.

No compite en volumen industrial. Compite en **precio cero, privacidad total y simplicidad de uso**.
