# Design System — Senha do Vaqueiro

Este documento define o design system do **Senha do Vaqueiro**, uma plataforma para divulgação de vaquejadas, compra de senhas, gestão de inscrições, organização de categorias, mapas de senhas, pagamentos e administração de eventos.

A proposta visual combina **tradição nordestina**, **energia de evento esportivo**, **confiança transacional** e **experiência digital moderna**.

---

## 1. Tema e Identidade Visual

O Senha do Vaqueiro deve transmitir:

- **Força e tradição**: referência ao universo da vaquejada, couro, terra, pista e competição.
- **Confiança**: o usuário precisa se sentir seguro para comprar sua senha online.
- **Agilidade**: compra rápida, confirmação clara e acesso fácil à senha.
- **Organização**: eventos, categorias, dias, senhas e pagamentos precisam ser apresentados de forma simples.
- **Popularidade**: linguagem visual acessível, sem parecer complexa ou elitizada.

### Personalidade da Marca

| Atributo | Direção Visual |
|---|---|
| Tradicional | Tons terrosos, referências rurais sutis, textura de couro/areia com moderação |
| Digital | Layout limpo, botões claros, cards modernos, navegação simples |
| Esportiva | Badges, rankings, números grandes, chamadas de ação fortes |
| Confiável | Feedbacks claros, estados de pagamento, comprovantes e status visíveis |
| Popular | Linguagem direta, visual acolhedor e mobile-first |

---

## 2. Modos de Tema

O projeto pode trabalhar com duas variantes principais:

- **Dark Mode Rodeio** — recomendado como tema principal, com fundo escuro, acentos em laranja, dourado e verde.
- **Light Mode Arena** — opção clara para áreas administrativas, relatórios, impressão e uso prolongado.

---

## 3. Paleta de Cores

### 3.1 Cores Principais

| Token | Dark Mode | Light Mode | Uso |
|---|---|---|---|
| `--primary` | `hsl(28, 92%, 52%)` | `hsl(26, 90%, 48%)` | Laranja vaquejada: CTAs, ações principais, botões de compra |
| `--secondary` | `hsl(38, 76%, 48%)` | `hsl(38, 74%, 44%)` | Dourado terra/sol: destaques, selos, valores importantes |
| `--accent` | `hsl(142, 45%, 36%)` | `hsl(142, 48%, 32%)` | Verde rural: confirmações, status ativo, elementos positivos |
| `--brand-brown` | `hsl(25, 42%, 28%)` | `hsl(25, 45%, 34%)` | Marrom couro: detalhes visuais, bordas especiais, cabeçalhos |
| `--destructive` | `hsl(0, 74%, 56%)` | `hsl(0, 72%, 50%)` | Erros, cancelamentos, ações destrutivas |

### 3.2 Cores de Superfície

| Token | Dark Mode | Light Mode | Uso |
|---|---|---|---|
| `--background` | `hsl(222, 38%, 7%)` | `hsl(36, 45%, 97%)` | Fundo geral da aplicação |
| `--foreground` | `hsl(36, 40%, 96%)` | `hsl(222, 30%, 12%)` | Texto principal |
| `--card` | `hsl(222, 35%, 10%)` | `hsl(0, 0%, 100%)` | Cards, containers, blocos de evento |
| `--card-foreground` | `hsl(36, 38%, 95%)` | `hsl(222, 28%, 14%)` | Texto dentro de cards |
| `--muted` | `hsl(222, 24%, 16%)` | `hsl(36, 35%, 92%)` | Campos desabilitados, fundos neutros |
| `--muted-foreground` | `hsl(36, 12%, 65%)` | `hsl(222, 12%, 42%)` | Texto secundário |
| `--border` | `hsl(222, 22%, 20%)` | `hsl(36, 28%, 84%)` | Bordas, divisores, inputs |
| `--input` | `hsl(222, 24%, 14%)` | `hsl(0, 0%, 100%)` | Campos de formulário |
| `--ring` | `hsl(28, 92%, 52%)` | `hsl(26, 90%, 48%)` | Focus ring |

### 3.3 Cores Semânticas

| Token | Valor | Uso |
|---|---|---|
| `--success` | `hsl(142, 58%, 42%)` | Pagamento aprovado, senha confirmada, evento ativo |
| `--warning` | `hsl(42, 92%, 52%)` | Pagamento pendente, reserva temporária, atenção |
| `--info` | `hsl(204, 82%, 56%)` | Informações, instruções, avisos neutros |
| `--danger` | `hsl(0, 74%, 56%)` | Erro, senha cancelada, pagamento recusado |
| `--reserved` | `hsl(270, 58%, 58%)` | Senha reservada temporariamente |
| `--sold` | `hsl(0, 0%, 48%)` | Senha vendida/indisponível |

---

## 4. Gradientes

```css
/* CTA principal: compra de senha */
--gradient-primary: linear-gradient(135deg, hsl(28, 92%, 52%) 0%, hsl(38, 92%, 52%) 100%);

/* Gradiente de destaque para eventos */
--gradient-arena: linear-gradient(135deg, hsl(25, 42%, 28%) 0%, hsl(28, 92%, 42%) 100%);

/* Gradiente rural */
--gradient-rural: linear-gradient(135deg, hsl(142, 45%, 36%) 0%, hsl(95, 40%, 30%) 100%);

/* Card escuro */
--gradient-card: linear-gradient(180deg, hsl(222, 35%, 12%) 0%, hsl(222, 35%, 9%) 100%);

/* Hero */
--gradient-hero: radial-gradient(circle at top right, hsl(28 92% 52% / 0.20), transparent 35%), linear-gradient(180deg, hsl(222, 38%, 7%) 0%, hsl(222, 35%, 10%) 55%, hsl(222, 38%, 7%) 100%);
```

---

## 5. Sombras

```css
/* Sombra de CTA */
--shadow-primary: 0 8px 28px -8px hsl(28 92% 52% / 0.45);

/* Sombra de card */
--shadow-card: 0 8px 24px -10px hsl(0 0% 0% / 0.45);

/* Glow discreto para elementos importantes */
--shadow-glow: 0 0 40px hsl(28 92% 52% / 0.18);

/* Sombra administrativa */
--shadow-soft: 0 4px 16px -8px hsl(222 30% 12% / 0.18);
```

---

## 6. Tipografia

### Fontes Recomendadas

| Fonte | Uso | Pesos |
|---|---|---|
| **Outfit** | Texto geral, formulários, botões, cards | 300, 400, 500, 600, 700, 800 |
| **Space Grotesk** | Títulos, números de senha, chamadas fortes | 400, 500, 600, 700 |
| **Barlow Condensed** | Display opcional para números grandes, categorias e placares | 500, 600, 700 |

### Hierarquia

```css
body {
  font-family: 'Outfit', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.display-number {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}
```

---

## 7. Tokens de Layout

### Raios

```css
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-2xl: 1.25rem;
--radius-full: 999px;
```

### Espaçamentos

| Token | Valor | Uso |
|---|---:|---|
| `space-1` | 4px | Micro espaçamento |
| `space-2` | 8px | Ícone + texto, badges |
| `space-3` | 12px | Inputs compactos |
| `space-4` | 16px | Padding padrão mobile |
| `space-6` | 24px | Cards e seções |
| `space-8` | 32px | Blocos grandes |
| `space-12` | 48px | Hero e separações maiores |

---

## 8. Componentes UI Base

### 8.1 Botões

```tsx
<Button variant="default">Comprar senha</Button>
<Button variant="secondary">Ver detalhes</Button>
<Button variant="outline">Compartilhar</Button>
<Button variant="ghost">Cancelar</Button>
<Button variant="destructive">Excluir evento</Button>
```

| Variante | Uso |
|---|---|
| `default` | CTA principal: comprar senha, confirmar pagamento, finalizar pedido |
| `secondary` | Ações secundárias: ver detalhes, editar dados, acessar evento |
| `outline` | Ações neutras: compartilhar, imprimir, baixar comprovante |
| `ghost` | Ações discretas: voltar, fechar, limpar filtros |
| `destructive` | Excluir, cancelar, remover, encerrar |

### Padrões

- Botão principal deve ter alto contraste e sombra discreta.
- Em telas de compra, o CTA deve ficar fixo no rodapé mobile quando necessário.
- Toda ação financeira deve ter estado de loading.
- Evitar múltiplos botões primários no mesmo bloco.

---

## 9. Componentes Específicos do Senha do Vaqueiro

### 9.1 EventCard

Card usado na listagem de vaquejadas.

**Conteúdo recomendado:**

- Nome da vaquejada
- Cidade/UF
- Data ou intervalo de dias
- Status do evento
- Imagem/banner
- Categorias disponíveis
- CTA: `Ver senhas` ou `Comprar senha`

```tsx
<EventCard
  name="Vaquejada Parque São José"
  city="Imperatriz"
  state="MA"
  date="12 a 14 de julho"
  status="ativa"
  categories={["Profissional", "Amador", "Aspirante"]}
/>
```

### 9.2 TicketCard / SenhaCard

Card usado para representar uma senha comprada ou disponível.

**Conteúdo recomendado:**

- Número da senha
- Categoria
- Dia da apresentação
- Nome do vaqueiro/puxador
- Status do pagamento
- QR Code ou código de validação
- Botões: imprimir, compartilhar, editar, pagar

### 9.3 CategoryBadge

Badges para categorias da vaquejada.

| Categoria | Estilo sugerido |
|---|---|
| Profissional | `primary` |
| Amador | `secondary` |
| Aspirante | `outline` |
| Feminino | `accent` |
| Kids/Infantil | `info` |
| Aberta | `warning` |

### 9.4 StatusBadge

| Status | Cor | Uso |
|---|---|---|
| `ativa` | Verde | Evento aberto para compra |
| `encerrada` | Cinza | Evento finalizado |
| `cancelada` | Vermelho | Evento cancelado |
| `disponível` | Verde | Senha disponível |
| `reservada` | Roxo | Senha em processo de compra |
| `vendida` | Cinza | Senha indisponível |
| `pendente` | Amarelo | Pagamento aguardando confirmação |
| `paga` | Verde | Pagamento confirmado |
| `recusada` | Vermelho | Pagamento não aprovado |

### 9.5 NumberMap / Mapa de Senhas

Componente para selecionar senhas por número.

**Padrões visuais:**

- Números disponíveis: fundo verde ou borda verde.
- Números reservados: roxo/amarelo com indicação temporária.
- Números vendidos: cinza, com baixa opacidade e sem interação.
- Número selecionado: laranja/dourado com destaque forte.
- Hover: leve aumento de escala e sombra.

```tsx
<TicketNumber
  number={120}
  status="available"
  selected={false}
/>
```

### 9.6 CheckoutSummary

Resumo fixo da compra.

**Conteúdo:**

- Evento
- Categoria
- Número da senha
- Dia
- Valor
- Taxa, caso exista
- Total
- Método de pagamento
- CTA de confirmação

### 9.7 PaymentStatus

Componente para feedback de pagamento.

| Estado | Mensagem sugerida |
|---|---|
| Aguardando Pix | `Estamos aguardando a confirmação do pagamento.` |
| Pago | `Pagamento confirmado. Sua senha está garantida.` |
| Expirado | `O tempo para pagamento expirou. Escolha uma nova senha.` |
| Recusado | `Não conseguimos confirmar o pagamento. Tente novamente.` |

### 9.8 AdminStatsCard

Cards para dashboard administrativo.

**Indicadores:**

- Total de senhas vendidas
- Receita total
- Senhas disponíveis
- Pagamentos pendentes
- Vendas por categoria
- Vendas por dia

---

## 10. Layout da Aplicação

### 10.1 Estrutura Mobile First

O público tende a acessar pelo celular, principalmente via WhatsApp e redes sociais. Por isso, a experiência deve ser otimizada para mobile.

```tsx
export default function Page() {
  return (
    <>
      <MobileHeader />
      <PageContainer>
        {/* Conteúdo */}
      </PageContainer>
      <MobileBottomAction />
    </>
  );
}
```

### 10.2 Estrutura Desktop/Admin

```tsx
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="lg:pl-72">
        <AdminHeader />
        <PageContainer>
          {/* Dashboard, tabelas, formulários */}
        </PageContainer>
      </main>
    </div>
  );
}
```

### 10.3 Navegação Pública

- Home
- Vaquejadas
- Detalhe da vaquejada
- Comprar senha
- Minhas senhas
- Entrar/Cadastrar

### 10.4 Navegação Administrativa

- Dashboard
- Vaquejadas
- Dias
- Categorias
- Mapa de senhas
- Pedidos
- Pagamentos
- Participantes
- Relatórios
- Configurações

---

## 11. Componentes de Formulário

### Inputs

```tsx
<Input placeholder="Nome do vaqueiro" />
<Input placeholder="CPF" />
<Input placeholder="WhatsApp" />
<Select placeholder="Categoria" />
<DatePicker placeholder="Data da vaquejada" />
```

### Boas práticas

- Máscaras para CPF, telefone e moeda.
- Validação em tempo real apenas quando ajudar o usuário.
- Mensagens de erro simples e diretas.
- Labels sempre visíveis em formulários administrativos.
- Em checkout mobile, reduzir campos ao mínimo necessário.

### Mensagens de erro

| Situação | Mensagem sugerida |
|---|---|
| CPF inválido | `Informe um CPF válido.` |
| Telefone inválido | `Informe um WhatsApp válido.` |
| Senha indisponível | `Essa senha acabou de ser selecionada por outra pessoa.` |
| Pagamento expirado | `O tempo de pagamento expirou. Escolha uma nova senha.` |
| Campo obrigatório | `Este campo é obrigatório.` |

---

## 12. Cards e Containers

### Card Padrão

```css
.card-default {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}
```

### Glass Card

Usar com moderação em hero, banners e destaques.

```css
.glass-card {
  background: hsl(var(--card) / 0.78);
  backdrop-filter: blur(18px);
  border: 1px solid hsl(var(--border) / 0.55);
  border-radius: var(--radius-2xl);
}
```

---

## 13. Animações

### Keyframes

```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulseSoft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.72; }
}

@keyframes ticketPop {
  0% { transform: scale(0.96); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

### Classes

```css
.animate-slide-up { animation: slideUp 0.45s ease-out; }
.animate-fade-in { animation: fadeIn 0.28s ease-out; }
.animate-pulse-soft { animation: pulseSoft 2.5s ease-in-out infinite; }
.animate-ticket-pop { animation: ticketPop 0.22s ease-out; }
```

### Regras

- Hover em números de senha pode ter escala leve: `scale(1.04)`.
- Evitar animações longas em checkout e pagamento.
- Respeitar `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 14. Skeleton Loading

### Uso

- Listagem de vaquejadas
- Carregamento do mapa de senhas
- Minhas senhas
- Dashboard administrativo
- Consulta de pagamento

```tsx
<Skeleton className="h-40 w-full rounded-xl" />
<Skeleton className="h-6 w-40" />
<Skeleton className="h-4 w-24" />
```

### Acessibilidade

```tsx
<div role="status" aria-busy="true" aria-label="Carregando informações da vaquejada">
  <Skeleton className="h-40 w-full rounded-xl" />
</div>
```

---

## 15. Responsividade

### Breakpoints

| Breakpoint | Tamanho | Uso |
|---|---:|---|
| `sm` | 640px | Celulares maiores |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Admin desktop amplo |
| `2xl` | 1536px | Dashboards e relatórios |

### Padrões

```tsx
<div className="px-4 md:px-6 lg:px-8" />
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
<div className="lg:hidden" />
<div className="hidden lg:flex" />
```

### Regras Mobile

- CTA de compra sempre visível no fim da tela.
- Cards com informações principais primeiro.
- Evitar tabelas horizontais no público; usar cards.
- No admin, tabelas podem ter scroll horizontal.
- QR Code deve ter boa área de respiro.

---

## 16. Ícones

Usar **Lucide React** como biblioteca padrão.

### Ícones recomendados

| Ícone | Uso |
|---|---|
| `Ticket` | Senhas, ingressos, compra |
| `CalendarDays` | Datas da vaquejada |
| `MapPin` | Cidade/UF/local do evento |
| `Users` | Participantes |
| `Trophy` | Competição, categorias, ranking |
| `QrCode` | Validação da senha |
| `CreditCard` | Pagamento |
| `Banknote` | Valor/receita |
| `CheckCircle` | Confirmação |
| `AlertTriangle` | Alerta |
| `Clock` | Pendente/aguardando |
| `Printer` | Impressão |
| `Share2` | Compartilhamento |
| `Settings` | Configurações |

---

## 17. Estados e Feedbacks

### Toasts

| Tipo | Exemplo |
|---|---|
| Sucesso | `Senha reservada com sucesso.` |
| Erro | `Não foi possível concluir a compra.` |
| Atenção | `Essa senha ficará reservada por alguns minutos.` |
| Informação | `Você pode acessar suas senhas a qualquer momento pelo menu.` |

### Modais

Usar modal para:

- Confirmar cancelamento de senha
- Exibir QR Code Pix
- Visualizar detalhes da senha
- Editar participante
- Confirmar exclusão no admin

Evitar modal para:

- Mensagens simples de sucesso
- Erros de formulário
- Navegação comum

---

## 18. Padrões de Conteúdo

### Tom de voz

O texto deve ser direto, popular e seguro.

| Evitar | Preferir |
|---|---|
| `Efetue a aquisição da credencial` | `Compre sua senha` |
| `Transação pendente de liquidação` | `Pagamento aguardando confirmação` |
| `Evento indisponível para operação` | `Essa vaquejada não está recebendo novas compras` |
| `Credencial validada` | `Senha confirmada` |

### CTAs principais

- `Comprar senha`
- `Escolher senha`
- `Finalizar compra`
- `Pagar com Pix`
- `Ver minhas senhas`
- `Imprimir senha`
- `Compartilhar senha`

---

## 19. Acessibilidade

### Regras obrigatórias

```tsx
<button aria-label="Compartilhar senha">
  <Share2 className="w-4 h-4" />
</button>
```

- Todo botão apenas com ícone deve ter `aria-label`.
- Inputs precisam ter label ou `aria-label`.
- Feedback de loading deve usar `aria-busy`.
- Não depender apenas de cor para status; usar texto e ícone.
- Garantir contraste adequado em botões laranja/dourado.
- Áreas clicáveis no mobile devem ter no mínimo 44px de altura/largura.

---

## 20. Admin Dashboard

### Visual

A área administrativa deve ser mais objetiva e funcional, podendo usar mais o **Light Mode Arena** por padrão.

### Componentes principais

- `StatsCard`
- `DataTable`
- `FilterBar`
- `StatusBadge`
- `ActionDropdown`
- `FormDrawer`
- `ConfirmDialog`
- `ReportCard`

### DataTable

Padrão para listagens administrativas.

**Colunas comuns:**

- Nome
- Cidade/UF
- Data
- Categoria
- Senha
- Participante
- Valor
- Status
- Ações

### Filtros

- Evento
- Categoria
- Dia
- Status de pagamento
- Status da senha
- Período
- Nome/CPF/WhatsApp

---

## 21. CSS Variables Base

```css
:root {
  --background: 222 38% 7%;
  --foreground: 36 40% 96%;

  --card: 222 35% 10%;
  --card-foreground: 36 38% 95%;

  --primary: 28 92% 52%;
  --primary-foreground: 0 0% 100%;

  --secondary: 38 76% 48%;
  --secondary-foreground: 222 30% 10%;

  --accent: 142 45% 36%;
  --accent-foreground: 0 0% 100%;

  --muted: 222 24% 16%;
  --muted-foreground: 36 12% 65%;

  --destructive: 0 74% 56%;
  --destructive-foreground: 0 0% 100%;

  --border: 222 22% 20%;
  --input: 222 24% 14%;
  --ring: 28 92% 52%;

  --radius: 0.9rem;
}

.light {
  --background: 36 45% 97%;
  --foreground: 222 30% 12%;

  --card: 0 0% 100%;
  --card-foreground: 222 28% 14%;

  --primary: 26 90% 48%;
  --primary-foreground: 0 0% 100%;

  --secondary: 38 74% 44%;
  --secondary-foreground: 222 30% 10%;

  --accent: 142 48% 32%;
  --accent-foreground: 0 0% 100%;

  --muted: 36 35% 92%;
  --muted-foreground: 222 12% 42%;

  --destructive: 0 72% 50%;
  --destructive-foreground: 0 0% 100%;

  --border: 36 28% 84%;
  --input: 0 0% 100%;
  --ring: 26 90% 48%;
}
```

---

## 22. Classes Utilitárias Customizadas

```css
.gradient-primary {
  background: var(--gradient-primary);
}

.gradient-arena {
  background: var(--gradient-arena);
}

.gradient-rural {
  background: var(--gradient-rural);
}

.text-gradient-primary {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.shadow-primary {
  box-shadow: var(--shadow-primary);
}

.ticket-selected {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-primary);
}

.ticket-unavailable {
  opacity: 0.45;
  pointer-events: none;
  filter: grayscale(0.4);
}
```

---

## 23. Padrões de Telas

### Home Pública

- Hero com chamada forte: `Compre sua senha de vaquejada de forma rápida e segura.`
- Busca por cidade, estado ou nome do evento.
- Lista de vaquejadas ativas.
- Destaques: compra segura, acesso pelo WhatsApp, impressão/QR Code.

### Detalhe da Vaquejada

- Banner do evento.
- Nome, cidade/UF e datas.
- Categorias disponíveis.
- Dias de apresentação.
- Botão `Escolher senha`.
- Informações importantes do organizador.

### Escolha de Senha

- Filtros por categoria e dia.
- Mapa/lista de senhas.
- Legenda de status.
- Resumo fixo da seleção.

### Checkout

- Dados do participante.
- Resumo da compra.
- Pix/cartão, conforme disponível.
- Termos e confirmação.

### Minhas Senhas

- Lista de senhas compradas.
- Status de pagamento.
- Ações rápidas: visualizar, imprimir, compartilhar.

### Admin — Vaquejadas

- Lista de eventos.
- Status.
- Total de senhas.
- Vendas.
- Ações de edição.

---

## 24. Boas Práticas de Implementação

### Cores

```tsx
// Correto
<div className="bg-background text-foreground" />
<div className="bg-card border border-border" />
<Button className="bg-primary text-primary-foreground" />

// Evitar
<div className="bg-[#f97316]" />
<div className="text-orange-500" />
```

### Espaçamento

```tsx
<section className="py-8 md:py-12 px-4 md:px-6" />
<Card className="p-4 md:p-6 space-y-4" />
```

### Estados de compra

- Sempre bloquear uma senha temporariamente durante checkout.
- Mostrar tempo restante quando houver reserva.
- Atualizar status visual após confirmação de pagamento.
- Nunca deixar o usuário sem feedback após clicar em pagar.

---

## 25. Checklist de Qualidade Visual

Antes de publicar uma tela, validar:

- O CTA principal está claro?
- A tela funciona bem no celular?
- O status da senha/pagamento é fácil de entender?
- Existe feedback de loading?
- O usuário entende o próximo passo?
- As cores seguem tokens, sem hardcode?
- Existe contraste suficiente?
- Os botões têm área de toque confortável?
- A linguagem está simples e direta?

---

## 26. Direção Visual Final

O Senha do Vaqueiro deve parecer uma plataforma:

- **Moderna**, mas com alma regional.
- **Simples**, mas robusta para grandes eventos.
- **Popular**, mas profissional.
- **Rápida**, principalmente no celular.
- **Confiável**, principalmente no momento do pagamento.

A experiência precisa passar a sensação de que o vaqueiro ou organizador consegue resolver tudo com poucos toques: escolher a vaquejada, selecionar a senha, pagar, receber e apresentar sua senha no evento.
