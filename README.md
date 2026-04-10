# SearchJobs — Frontend

> Interface web para o SearchJobs — encontre vagas que fazem sentido para o seu perfil, com a ajuda de inteligência artificial.

---

## O que é o SearchJobs?

O **SearchJobs** nasceu de uma dor real: procurar emprego é cansativo. São dezenas de plataformas, vagas genéricas que não têm nada a ver com você e horas perdidas lendo descrições que não combinam com o seu perfil.

A ideia é simples — **e se um sistema pudesse ler o seu currículo, entender quem você é como profissional e te mostrar só as vagas que realmente valem a pena?**

Este repositório é o **frontend web** do SearchJobs, consumindo a [SearchJobs API](https://github.com/seu-usuario/searchjobs-api).

---

## Como funciona?

1. **Você faz login ou cria sua conta** — autenticação segura com JWT.
2. **Envia seu currículo em PDF** — a IA extrai automaticamente suas skills, experiências, certificações e projetos.
3. **O sistema busca vagas reais no mercado** — baseado no seu cargo desejado.
4. **A IA analisa cada vaga e gera um score de compatibilidade** com o seu perfil, com justificativa.
5. **Você vê só o que importa** — ordenado por relevância, com link direto para se candidatar.

---

## Funcionalidades

- 🔐 **Autenticação** — login e cadastro com JWT
- 📄 **Upload de currículo** — envio de PDF com extração inteligente via IA
- 📋 **Meus currículos** — listagem e visualização dos currículos enviados
- 🔍 **Busca de vagas** — rankeamento de vagas com score de compatibilidade
- 📝 **Histórico de candidaturas** — acompanhe as vagas que você se candidatou
- 👤 **Perfil profissional** — visualize e gerencie seus dados extraídos

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Angular 21 |
| Linguagem | TypeScript 5.9 |
| UI Components | Angular Material 21 |
| HTTP Client | Angular HttpClient + Interceptors |
| Testes | Vitest |
| Servidor (produção) | Nginx 1.27 |
| Infraestrutura | Docker + Docker Compose |

---

## Estrutura de telas

```
/login              → Tela de login
/register           → Tela de cadastro
/landing/upload     → Upload de currículo (padrão após login)
/landing/resumes    → Meus currículos
/landing/jobs       → Busca de vagas com score IA
/landing/history    → Histórico de candidaturas
/perfil             → Perfil profissional
```

---

## Pré-requisitos

- [Node.js 22+](https://nodejs.org)
- [npm 11+](https://www.npmjs.com)
- A [SearchJobs API](https://github.com/seu-usuario/searchjobs-api) rodando localmente ou em um servidor

---

## Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/searchjobs-frontend.git
cd searchjobs-frontend

# Instale as dependências
npm install

# Suba o servidor de desenvolvimento
npm start
```

A aplicação estará disponível em `http://localhost:4200`.

> Certifique-se de que a SearchJobs API está rodando em `http://localhost:8080`.

---

## Rodando com Docker (recomendado para produção)

```bash
# Build e suba o container
docker compose up --build
```

A aplicação estará disponível em `http://localhost:4200`.

O build usa uma imagem multi-stage: **Node 22** para compilar o Angular e **Nginx 1.27** para servir os arquivos estáticos.

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm start` | Sobe o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run watch` | Build contínuo em modo desenvolvimento |
| `npm test` | Executa os testes com Vitest |

---

## Por que foi desenvolvido?

O SearchJobs é um projeto pessoal criado com dois objetivos:

1. **Resolver um problema real** — tornar a busca de emprego mais inteligente e menos frustrante para desenvolvedores e profissionais de tecnologia.

2. **Consolidar conhecimentos** em desenvolvimento frontend moderno com Angular, consumo de APIs com IA e boas práticas de arquitetura.

---

## Próximos passos

- [ ] Hospedagem em VPS com domínio próprio
- [ ] Notificações por e-mail quando novas vagas compatíveis aparecerem
- [ ] Suporte a múltiplos idiomas nas buscas (inglês, espanhol)
- [ ] Tema claro/escuro
- [ ] Testes de integração e E2E

---

<p align="center">Desenvolvido por <strong>Felipe Souza Moreira</strong></p>
