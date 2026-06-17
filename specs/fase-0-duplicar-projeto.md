# Spec: Fase 0 — Duplicar Projeto e Preparar Ambiente

## Objetivo
Criar uma cópia limpa e isolada do projeto Maricota como base para a plataforma multi-tenant `platform-microsaas-port`, com repositório GitHub privado próprio e ambiente seguro (sem segredos no código).

## Contexto
O projeto original está em `C:\Users\conta\OneDrive\Documentos\maricota` e deve permanecer intacto. A cópia será o ponto de partida para transformar o site da Maricota em uma plataforma replicável para múltiplos clientes.

## Requisitos

### Indispensáveis (must-have)
- [ ] Copiar todos os arquivos do projeto maricota para `C:\Users\conta\OneDrive\Documentos\platform-microsaas-port`, excluindo `node_modules/`, `.git/`, `.env` e `.env.local`
- [ ] Criar `.gitignore` na raiz do novo projeto garantindo que `.env`, `.env.local`, `.env*.local`, `node_modules/` e `.next/` nunca sejam versionados
- [ ] Criar `.env.example` na raiz documentando todas as variáveis de ambiente necessárias (com chaves mas sem valores reais)
- [ ] Inicializar repositório git (`git init`) com commit inicial contendo todos os arquivos
- [ ] Criar repositório privado no GitHub chamado `platform-microsaas-port` e conectar ao repo local (`git remote add origin` + `git push`)
- [ ] Instalar dependências (`npm install`) e confirmar que o projeto roda localmente sem erros

### Desejáveis (nice-to-have)
- [ ] Atualizar `package.json` com o novo nome do projeto (`platform-microsaas-port`)

## Fluxo Principal
1. Copiar arquivos do projeto original para a nova pasta (excluindo node_modules, .git, .env*)
2. Criar `.gitignore` adequado
3. Criar `.env.example` com todas as variáveis mapeadas do projeto original
4. Rodar `npm install` para gerar node_modules
5. Fazer `git init` + commit inicial
6. Criar repo privado no GitHub via `gh repo create`
7. Conectar remote e fazer push

## Casos Extremos
- **Arquivo `.env.local` não existe no original:** prosseguir normalmente, documentar as variáveis com base no código-fonte
- **`gh` CLI não instalado:** exibir os comandos manuais para o usuário executar no GitHub
- **Conflito de pasta já existente:** verificar antes de copiar e alertar o usuário

## Restrições
- O projeto original em `maricota/` não deve ser modificado em nenhum momento
- Nenhuma chave real deve aparecer em `.env.example` — apenas nomes das variáveis com valores de exemplo ou em branco
- Stack: Next.js, Node.js, Supabase (mantida do projeto original)

## Fora de Escopo
- Qualquer alteração no código-fonte (layouts, componentes, lógica)
- Configuração do Supabase ou Vercel
- Deploy
- Multi-tenancy (isso é Fase 2)

## Definição de Concluído
- [ ] Pasta `platform-microsaas-port` existe com todos os arquivos do projeto original
- [ ] `.gitignore` presente e cobrindo `.env*`, `node_modules/`, `.next/`
- [ ] `.env.example` presente com todas as variáveis necessárias documentadas
- [ ] `npm install` roda sem erros na nova pasta
- [ ] Repositório privado `platform-microsaas-port` existe no GitHub com o commit inicial
- [ ] Projeto original `maricota/` permanece intacto e inalterado
