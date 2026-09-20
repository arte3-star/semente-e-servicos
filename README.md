# Semente e Serviços — site e plataforma (demonstração)

Site institucional e plataforma de comprovação de serviços da **Semente e Serviços**,
empresa de manutenção de jardins e piscinas em São Paulo.

Implementado a partir dos mockups do projeto Claude Design
*"UI mockups for Semente e Serviços"* (`Site Semente e Servicos.dc.html` e
`Plataforma Semente.dc.html`) — os mockups são a referência de construção.

**No ar:** https://arte3-star.github.io/semente-e-servicos/

---

## O que tem aqui

### Site institucional

| Página | Arquivo |
| --- | --- |
| Home | `index.html` |
| Serviços | `servicos.html` |
| Sobre | `sobre.html` |
| Agendar visita técnica | `agendar.html` |
| Contato | `contato.html` |
| Campanha de primavera | `campanha.html` |

Funciona de verdade: comparador antes/depois arrastável, calendário de agendamento
com dias úteis e horários, formulários com retorno, contagem regressiva da campanha
e menu mobile.

### Plataforma — `app/`

Demonstração navegável dos três produtos da mesma marca, com 23 telas:

**App da equipe (celular)** — agenda do dia, checklist com foto obrigatória por item,
captura antes/depois, finalizar e assinar, sugerir serviço extra, modo offline e
área do funcionário.

**Portal do dono (desktop)** — minha casa, relatório da visita, histórico e resumo
mensal, cumprimento do plano com crédito automático, meu plano, faturas e Pix.

**Coordenação** — equipes ao vivo, recebimentos do mês, risco de cancelamento,
onboarding do cliente novo e visita técnica.

**Documentos** — relatório de visita em A4, recibo e nota fiscal, proposta pública
com aceite online e cartão de metragem.

## O que realmente funciona na demonstração

Não é um clique-clique de telas soltas: o estado é compartilhado e propaga.

- **Checklist trava o fechamento.** Item sem foto não fecha, o contador reage e o
  botão de finalizar só libera em 9/9.
- **Assinatura real** em canvas — concluir sem assinar é bloqueado.
- **Concluir a visita** publica o relatório no portal do dono e muda o painel da
  coordenação.
- **Aprovar o serviço extra** em *Meu plano* soma R$ 320 à fatura, ao Pix, ao recibo
  e ao painel de recebimentos — os quatro leem a mesma conta.
- **A metragem define a faixa**: mexa no controle em *Visita técnica* e a faixa
  (Essencial / Padrão / Premium) e a mensalidade se recalculam, inclusive na proposta.

O estado fica no `localStorage` do navegador. *Recomeçar a demonstração*, no rodapé
do menu, devolve tudo ao início.

## Rodando localmente

```bash
python -m http.server 8850
```

Depois abra `http://127.0.0.1:8850/`. Não há build, dependências nem backend —
é HTML, CSS e JavaScript sem framework.

## Imagens

As fotos estão em `assets/img/` e a logo em `assets/logo/`.

São **imagens de modelo**, geradas por IA, usadas como andaime visual enquanto não
houver foto real de trabalho — a mesma decisão já registrada no material da marca.
Quando as fotos reais chegarem, basta substituir os arquivos mantendo os nomes.

```
assets/img/    fachada-casa · jardim-antes/depois · piscina-antes/depois
               equipe-poda · equipe-piscina · equipe-chegada
               jardim-detalhe · piscina-detalhe · regiao-condominio · topo-jardim
assets/logo/   logo-horizontal (png/svg) · logo-vertical · logo-vertical-clara
               logo-simbolo · favicon-16/32/180/512
```

Se uma imagem faltar, o bloco `.ph` cai num degradê da marca com o rótulo da foto,
então nada aparece quebrado.

## Marca

Extraída dos mockups.

| Token | Valor |
| --- | --- |
| Creme (fundo) | `#E8E4D8` |
| Verde escuro | `#2B5138` |
| Verde-sálvia | `#7E9C73` |
| Terracota | `#8C4A26` |
| Tipografia | Jost |

Os tokens vivem em `assets/css/base.css`.

## Estrutura

```
index.html  servicos.html  sobre.html  agendar.html  contato.html  campanha.html
app/
  index.html        casca da demonstração (menu + palco)
  app.js            estado, 23 telas e interações
  app.css
assets/
  css/base.css      tokens da marca
  css/site.css      site institucional
  js/site.js        comportamento do site
  img/              fotos (ver acima)
```

---

Conteúdo, números e documentos são de demonstração. Nenhum formulário envia dados
e não há cobrança real em nenhuma tela.
