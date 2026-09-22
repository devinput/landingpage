# Rafael Medeiros — landing page

Página pessoal independente para `https://relicaresviagens.com.br/rafael-medeiros.html`.
Nada aqui depende do restante do site nem altera arquivos existentes: todo o CSS é
escopado em `body[data-page="rafael-medeiros"]` e todos os assets ficam em `/assets/rafael/`.

---

## 1. Arquivos entregues

```text
/rafael-medeiros.html
/README-RAFAEL-MEDEIROS.md
/llms.txt
/llms-full.txt

/assets/rafael/
    /css/rafael.css
    /js/rafael.js                 (núcleo: scroll, nav, cursor, canvas, vídeo)
    /js/rafael-animations.js      (reveals, scroll-video, contador, parallax)
    /images/rafael-01.webp
    /images/rafael-02.webp
    /images/rafael-trabalhando-01.webp
    /images/rafael-trabalhando-02.webp
    /images/rafael-excursoes-01.webp
    /images/rafael-excursoes-02.webp
    /images/rafael-og.webp
    /hero/rafael-hero.webp        (poster e fallback do vídeo)
    /hero/rafael-hero.mp4         ← AINDA NÃO FORNECIDO
    /logo/logo.png
```

### Instalação
1. Envie `rafael-medeiros.html` para a raiz do site.
2. Envie a pasta `assets/rafael/` inteira para `/assets/rafael/`.
3. Envie `llms.txt` e `llms-full.txt` para a raiz.
4. Substitua os arquivos de imagem placeholder (item 2).
5. Abra `https://relicaresviagens.com.br/rafael-medeiros.html` e confira.

Os caminhos no HTML são relativos (`assets/rafael/...`), compatíveis com a página na raiz.
Se um dia a página mudar de pasta, ajuste os prefixos — e também as URLs absolutas
usadas em canonical, Open Graph e JSON-LD.

---

## 2. Imagens: o que substituir

**Todos os arquivos de imagem entregues são placeholders cinza** com o nome do arquivo
escrito em cima. Eles existem só para a página não quebrar antes do material real chegar.
Substitua mantendo exatamente o mesmo nome e caminho — nada no código precisa mudar.

| Arquivo | Função na narrativa | Proporção sugerida | Tamanho sugerido |
|---|---|---|---|
| `images/rafael-01.webp` | Retrato na seção Perfil | 3:4 vertical | 900 × 1200 |
| `images/rafael-02.webp` | Retrato na seção Relicares | 3:4 vertical | 900 × 1200 |
| `images/rafael-trabalhando-01.webp` | Faixa larga da seção "12+ anos" | 16:9 | 1600 × 900 |
| `images/rafael-trabalhando-02.webp` | Faixa larga da seção Tecnologia | 16:9 | 1600 × 900 |
| `images/rafael-excursoes-01.webp` | Par humano, imagem da esquerda | 4:3 | 1200 × 900 |
| `images/rafael-excursoes-02.webp` | Par humano, imagem da direita (desce mais) | 4:3 | 1200 × 900 |
| `images/rafael-og.webp` | Miniatura de compartilhamento | 1200 × 630 fixo | 1200 × 630 |
| `hero/rafael-hero.webp` | Fundo do hero + poster e fallback do vídeo | 16:9 | 1920 × 1080 |
| `logo/logo.png` | Logo Relicares no topo e na seção Relicares | livre | ~440 × 120, fundo transparente |

As fotos recebem tratamento (leve dessaturação e escurecimento) por CSS — envie os
originais limpos, sem filtro aplicado. Exporte em WebP com qualidade 75–85; se preferir
AVIF, troque a extensão nos `src` correspondentes do HTML.

### Imagem OG (1200 × 630)
Composição recomendada: fundo escuro, foto de Rafael à direita, e à esquerda:

```
RAFAEL MEDEIROS
MARKETING • CODE • DESIGN
relicaresviagens.com.br
```

Mantenha textos a pelo menos 60 px das bordas — alguns aplicativos recortam.

---

## 3. Vídeo do hero (ainda não fornecido)

Arquivo esperado: `assets/rafael/hero/rafael-hero.mp4`.

**Enquanto ele não existir, a página não quebra**: a seção detecta a falha (erro de
carregamento, metadados inválidos ou 6 segundos sem resposta) e passa a exibir
`rafael-hero.webp` no lugar, com as mesmas legendas.

### Especificação
- Duração: 8 a 15 segundos.
- Formato: MP4 / H.264, `yuv420p`, 1920 × 1080 (16:9), 24 ou 30 fps.
- Sem áudio (o vídeo toca mudo e é controlado pelo scroll).
- Peso alvo: até ~6 MB. Acima disso o scrub fica lento em conexões móveis.
- Movimento lento e contínuo, sem cortes rápidos: o vídeo é reproduzido para frente
  **e para trás**, então cortes secos viram solavancos.

### Cenas sugeridas (na ordem)
1. Rafael trabalhando no computador.
2. Close das mãos no teclado.
3. Código na tela.
4. Rafael olhando para o monitor.
5. Movimento lateral de câmera.
6. Trabalho de design/marketing em andamento.
7. Detalhes do ambiente.

### Exportação recomendada (ffmpeg)
Keyframes frequentes são o que torna o scrub fluido — sem isso o navegador precisa
decodificar blocos longos a cada mudança de posição:

```bash
ffmpeg -i original.mov \
  -an -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 24 -g 6 -keyint_min 6 -sc_threshold 0 \
  -movflags +faststart \
  assets/rafael/hero/rafael-hero.mp4
```

Gere o poster a partir de um frame do próprio vídeo, para não haver salto visual:

```bash
ffmpeg -i assets/rafael/hero/rafael-hero.mp4 -vframes 1 -q:v 2 frame.png
# converta frame.png para WebP e salve como assets/rafael/hero/rafael-hero.webp
```

---

## 4. Como funciona o scroll-video

- A seção `#manifesto` tem uma área fixa (`position: sticky`, 100svh) seguida de uma
  trilha de rolagem vazia de 320vh (260vh no mobile).
- O progresso do scroll nessa trilha (0 → 1) é convertido em `currentTime` do vídeo.
  Rolar para baixo avança; rolar para cima retrocede.
- O valor é suavizado por interpolação em `requestAnimationFrame`, então o vídeo não
  "pula" a cada evento de scroll.
- As quatro legendas trocam por quarto da trilha: possibilidades → tecnologia →
  estratégia → assinatura.
- Com GSAP/ScrollTrigger disponível, o progresso vem do ScrollTrigger. Sem GSAP, um
  cálculo próprio com `getBoundingClientRect` assume — o comportamento é o mesmo.

Para alongar ou encurtar o trecho cinematográfico, altere `.reel__track { height }` em
`rafael.css`.

---

## 5. Dependências

Carregadas por CDN, com `defer`, e **todas opcionais**:

| Biblioteca | Versão | Para quê | Se falhar |
|---|---|---|---|
| GSAP | 3.12.5 | motor de animação | JS próprio assume |
| ScrollTrigger | 3.12.5 | progresso de scroll e parallax | cálculo por `rAF` assume |
| Lenis | 1.1.14 | scroll suave | scroll nativo do navegador |

Não há build, bundler, framework ou dependência de servidor. Nenhuma chave de API,
token ou dado sensível existe nos arquivos.

Se preferir hospedar as bibliotecas localmente, baixe os três arquivos para
`assets/rafael/js/vendor/` e ajuste os `<script src>` no final do HTML.

---

## 6. Canvas e partículas

Rede de pontos sutil apenas no hero (`assets/rafael/js/rafael.js`):
- desktop: densidade calculada pela área, no máximo 90 pontos;
- aparelhos com ≤4 GB de RAM ou ≤4 núcleos: 42 pontos;
- mobile (≤760px): 26 pontos;
- `prefers-reduced-motion`: o canvas é removido do DOM;
- o loop pausa quando o hero sai da tela ou quando a aba perde o foco.

---

## 7. Animações

- Títulos marcados com `data-split` entram palavra por palavra, por máscara.
- Elementos com `data-reveal` entram por `IntersectionObserver` (não por listener de scroll).
- O número **12+** conta de 0 a 12 ao entrar na tela.
- Imagens com `data-parallax="0.06"` a `0.16` deslizam em velocidades diferentes.
- Competências: no desktop a descrição aparece no hover/foco; no toque, o clique abre
  (`aria-expanded`). Abaixo de 1024px as descrições ficam sempre visíveis.
- Grain: SVG inline em `background-image`, sem arquivo de imagem, com deslocamento em
  passos de 6 quadros.

---

## 8. Responsividade

Testada e ajustada para 360, 390, 430, 768, 1024, 1366 e 1920 px.
Mudanças reais por faixa, não apenas redução de escala:

- **≤400px**: padding menor, eyebrow em duas linhas.
- **≤760px**: menu em tela cheia, hero centralizado, fotos de excursão empilhadas,
  trilho de design com 78vw por item, trilha do vídeo reduzida para 260vh.
- **≤1024px**: colunas viram uma só; competências em bloco único com descrição visível.
- **≥1600px**: medida de texto um pouco mais larga.

`overflow-x: clip` no body impede rolagem horizontal acidental.

---

## 9. Acessibilidade

- HTML semântico, um `h1` só, hierarquia h2/h3 correta.
- Link "Ir para o conteúdo" no início.
- `alt` descritivo em todas as imagens de conteúdo; imagens decorativas com `alt=""`.
- Navegação por teclado completa, com `:focus-visible` visível; o menu fecha com `Esc`.
- Âncoras movem o foco para a seção de destino.
- `prefers-reduced-motion`: sem parallax, sem partículas, sem grain animado, sem
  scrub de vídeo — a seção do reel vira uma lista de frases legível.
- Sem JavaScript, todo o texto continua acessível e nada fica escondido.

---

## 10. SEO, Schema e IA

- `title`, `meta description`, canonical, robots, author, theme-color, Open Graph e
  Twitter Card preenchidos.
- JSON-LD com `ProfilePage`, `WebSite`, `Organization`, `BreadcrumbList` e `Person`,
  ligando Rafael à Relicares Viagens (Ailton consta como fundador da empresa).
- `sameAs` **não** foi usado: não há perfis sociais confirmados. Quando houver, adicione
  dentro do objeto `Person`:

```json
"sameAs": ["https://...", "https://..."]
```

- `llms.txt` e `llms-full.txt` descrevem o perfil em texto puro para mecanismos de IA.
  Publique-os na raiz do domínio.
- IDs semânticos e estáveis para leitura por máquinas e links diretos:
  `#inicio`, `#manifesto`, `#identidade`, `#experiencia`, `#expertise`, `#tecnologia`,
  `#marketing`, `#design`, `#relicares`, `#excursoes`, `#contato`.

### WebMCP / agentes
A página está preparada no que depende do HTML: estrutura previsível, IDs semânticos,
dados estruturados, conteúdo legível sem JavaScript e `data-*` descritivos.
Uma implementação WebMCP real exige um endpoint no servidor (ferramentas declaradas,
transporte, autenticação) — isso não é possível em um arquivo estático e **não foi
simulado** aqui. Se quiser seguir esse caminho, será um trabalho do lado do servidor,
não desta página.

---

## 11. Performance

- CSS e JS próprios somam poucos KB, sem framework.
- Scripts com `defer`; poster do vídeo pré-carregado com `fetchpriority="high"` (LCP).
- Todas as imagens abaixo da dobra com `loading="lazy"` e `decoding="async"`.
- `width`/`height` declarados em todas as imagens para evitar CLS.
- Scroll e ponteiro usam listeners passivos com `requestAnimationFrame`.
- Canvas pausado fora da tela; resize com debounce.

Depois de subir o material real, rode um PageSpeed/Lighthouse. Se o LCP piorar, o
suspeito número um é o peso de `rafael-hero.webp` — mantenha abaixo de ~250 KB.

---

## 12. Ainda falta fornecer

1. **`assets/rafael/hero/rafael-hero.mp4`** — o vídeo do hero (spec no item 3).
2. **As 6 fotos reais** de Rafael, substituindo os placeholders (item 2).
3. **`logo/logo.png`** — o logo oficial da Relicares em PNG com fundo transparente.
4. **`images/rafael-og.webp`** — a arte de compartilhamento 1200 × 630.
5. **Canais de contato**, se quiser links diretos. Hoje a seção final aponta apenas para
   `relicaresviagens.com.br`. Para adicionar e-mail ou WhatsApp, edite `.contact__note`
   em `rafael-medeiros.html`. Nenhuma rede social foi inventada.

Nada disso bloqueia a publicação: a página funciona hoje, com os fallbacks ativos.
