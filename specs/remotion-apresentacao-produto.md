# Spec: Apresentação de Produto com Remotion

## Objetivo
Gerar vídeos animados de apresentação de produtos da Maricota para redes sociais (Stories e Feed), com dados fixos, usando Remotion — para validar visualmente o conceito antes de integrar com o banco de dados.

## Contexto
Projeto Maricota — Next.js/React. O Remotion será adicionado como dependência e os vídeos ficam em `src/remotion/`. Não há integração com Supabase nesta fase — os dados são hardcoded para teste.

## Requisitos

### Indispensáveis (must-have)
- [ ] Instalar Remotion no projeto maricota
- [ ] Criar composição para **Stories (9:16 — 1080x1920)**
- [ ] Criar composição para **Feed (1:1 — 1080x1080)**
- [ ] Duração: 30 a 50 segundos por vídeo
- [ ] Elementos obrigatórios em cada vídeo:
  - Logo da Maricota (`public/images/logo-maricota.png`)
  - Foto do produto (usar imagens de `public/images/`)
  - Nome do produto (texto animado)
  - Preço do produto (texto animado)
  - Descrição curta do produto (texto animado)
  - Transições animadas entre produtos (mínimo 3 produtos)
- [ ] Dados fixos hardcoded para 3 produtos de exemplo
- [ ] Preview funcionando via `npx remotion studio` — o usuário consegue visualizar no browser

### Desejáveis (nice-to-have)
- [ ] Mockup de celular/tela mobile exibindo o produto (imagem estática de frame de telefone sobreposta)
- [ ] Animações de entrada suaves (fade, slide ou scale) nos textos e imagens

## Fluxo Principal
1. Usuário roda `npx remotion studio` na raiz do projeto
2. Browser abre o Remotion Studio
3. Usuário vê as duas composições disponíveis: `StoriesApresentacao` e `FeedApresentacao`
4. Clica em cada uma e assiste o vídeo animado com os 3 produtos
5. Avalia visualmente se o resultado está no caminho certo

## Casos Extremos
- **Imagem de produto não encontrada:** usar imagem placeholder de `public/images/img00.jpg`
- **Texto longo demais:** truncar descrição em 80 caracteres com reticências
- **Fonte não carregada:** fallback para sans-serif

## Restrições
- Stack: React, TypeScript, Remotion
- Não integrar com Supabase nesta fase
- Não criar nova página no Next.js — Remotion roda separado via CLI
- Usar imagens e logo já existentes em `public/images/`
- Paleta de cores e tipografia da Maricota: tons de sage/rose/caramelo, fonte Cormorant Garamond para títulos, DM Sans para corpo

## Fora de Escopo
- Exportação final do vídeo (MP4) — só preview por agora
- Integração com dados do Supabase
- Upload automático para redes sociais
- Áudio/música de fundo

## Definição de Concluído
- [ ] `npx remotion studio` roda sem erros na raiz do projeto
- [ ] Composição `StoriesApresentacao` (9:16) aparece no Remotion Studio e reproduz 30-50s
- [ ] Composição `FeedApresentacao` (1:1) aparece no Remotion Studio e reproduz 30-50s
- [ ] Os 3 produtos aparecem com foto, nome, preço e descrição
- [ ] Logo da Maricota aparece no vídeo
- [ ] Há animações/transições entre os produtos
