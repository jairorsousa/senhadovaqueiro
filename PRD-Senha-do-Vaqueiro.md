# PRD — Senha do Vaqueiro

## 1. Visão Geral do Produto

O **Senha do Vaqueiro** é uma plataforma para gerenciamento e venda de senhas de vaquejada.

O sistema permite que o administrador cadastre vaquejadas, configure categorias, mapas de senhas, regras de participação e usuários responsáveis pela gestão do evento. O vaqueiro acessa o site, escolhe uma vaquejada disponível, compra sua senha via Pix e depois pode acompanhar, editar e gerenciar suas senhas em uma área exclusiva.

O produto será dividido em duas aplicações principais:

1. **Área Administrativa**  
   Usada pelo administrador do sistema e pelos organizadores da vaquejada.

2. **Site do Vaqueiro**  
   Usado pelo vaqueiro para visualizar vaquejadas, comprar senhas, acessar suas compras e gerenciar suas informações.

A experiência deve ser simples, direta e acessível, considerando que parte do público pode ter pouca familiaridade com sistemas digitais.

---

## 2. Objetivo do Produto

Criar uma plataforma simples e segura para digitalizar o processo de venda, controle e gestão de senhas de vaquejada.

### Objetivos principais

- Facilitar a compra de senhas pelo vaqueiro.
- Reduzir o controle manual de senhas pelos organizadores.
- Permitir que cada vaquejada tenha suas próprias categorias, mapas e regras.
- Centralizar pagamentos, status de senhas e relatórios.
- Oferecer uma área administrativa clara para o parque/organizador acompanhar as vendas.
- Permitir que o vaqueiro consulte e edite suas senhas compradas.

---

## 3. Público-Alvo

### Vaqueiro

Usuário final que acessa o site para comprar senhas de vaquejada.

Características importantes:

- Pode não ter muita familiaridade com tecnologia.
- Normalmente acessa pelo celular.
- Precisa de uma jornada curta, simples e guiada.
- Deve entender facilmente o que precisa fazer para comprar sua senha.
- Precisa consultar suas senhas depois da compra.

### Organizador / Parque de Vaquejada

Usuário responsável por gerenciar as senhas de uma vaquejada específica.

Características importantes:

- Precisa acompanhar vendas, pagamentos e reservas.
- Precisa consultar a relação de senhas compradas.
- Pode precisar editar informações de uma senha.
- Pode precisar imprimir senhas e relatórios.
- Precisa de indicadores simples e úteis.

### Administrador do Sistema

Usuário responsável pela gestão geral da plataforma.

Características importantes:

- Cadastra vaquejadas.
- Configura categorias, mapas e regras.
- Cadastra os usuários responsáveis pela gestão da vaquejada.
- Acompanha a operação geral do sistema.

---

## 4. Estrutura das Aplicações

## 4.1 Aplicação 1 — Área Administrativa

A Área Administrativa será usada para gestão interna do sistema e das vaquejadas.

Ela deve permitir dois níveis principais de uso:

### Administrador do Sistema

Responsável por:

- Cadastrar vaquejadas.
- Editar informações da vaquejada.
- Configurar categorias da vaquejada.
- Configurar mapas de senhas por categoria.
- Configurar dias, quando houver organização por dia.
- Cadastrar usuários que irão gerenciar a vaquejada.
- Definir permissões de acesso para os usuários do parque.
- Acompanhar todas as vaquejadas cadastradas.

### Organizador / Parque

Responsável por:

- Acompanhar as vendas da sua vaquejada.
- Ver indicadores do evento.
- Consultar senhas vendidas, reservadas, pendentes e pagas.
- Editar informações de senhas quando necessário.
- Imprimir senhas.
- Gerar relatórios por categoria, dia e status.

---

## 4.2 Aplicação 2 — Site do Vaqueiro

O Site do Vaqueiro será a área pública e de autoatendimento do vaqueiro.

Ele deve permitir:

- Visualizar vaquejadas disponíveis.
- Escolher uma vaquejada.
- Comprar uma ou mais senhas.
- Fazer login com CPF e senha.
- Realizar cadastro rápido no primeiro acesso.
- Pagar via Pix.
- Acessar área exclusiva do vaqueiro.
- Ver senhas compradas.
- Editar informações permitidas da senha.

---

## 5. Princípios de Usabilidade

Como o público pode ter baixa familiaridade digital, o sistema deve seguir os seguintes princípios:

- Poucos passos para concluir a compra.
- Linguagem simples e popular.
- Botões grandes e claros.
- Evitar telas carregadas de informação.
- Priorizar uso em celular.
- Fluxo de compra guiado.
- Mostrar sempre o próximo passo.
- Evitar termos técnicos.
- Usar mensagens claras para pagamento, reserva e confirmação.
- Não exigir cadastro antes do vaqueiro escolher a senha.

### Exemplos de linguagem recomendada

- “Comprar senha”
- “Escolha sua categoria”
- “Escolha o dia”
- “Escolha o número da senha”
- “Preencha seus dados”
- “Pagar com Pix”
- “Sua senha foi confirmada”
- “Pagamento aguardando confirmação”

---

# 6. Regras de Negócio

## 6.1 Vaquejada

Cada vaquejada representa um evento cadastrado no sistema.

### Informações principais da vaquejada

- Nome da vaquejada.
- Cidade e estado.
- Local do evento.
- Data ou período do evento.
- Descrição.
- Status da vaquejada.
- Banner ou imagem de divulgação.
- Organizador responsável.
- Categorias disponíveis.
- Regras gerais da vaquejada.

### Status da vaquejada

- Ativa.
- Encerrada.
- Cancelada.
- Rascunho.

Somente vaquejadas ativas devem aparecer no site para compra de senhas.

---

## 6.2 Categorias

Cada vaquejada pode ter suas próprias categorias.

O administrador pode cadastrar quantas categorias forem necessárias para cada vaquejada.

### Exemplos de categorias

- Profissional.
- Amador.
- Aspirante.
- Feminino.
- Aberta.
- Iniciante.

### Regras da categoria

Cada categoria pode possuir regras específicas, como:

- Nome da categoria.
- Valor da senha.
- Valor da premiação.
- Quantidade de bois para bater a senha.
- Observações específicas.
- Dias disponíveis para correr.
- Mapa de senhas.
- Status da categoria.

### Exemplos

Categoria Profissional:

- Valor da senha: definido pela organização.
- Premiação: R$ 1.000,00.
- Regra: 4 bois para bater a senha.
- Observação: senha com Boi TV incluso.

Categoria Iniciante:

- Valor da senha: definido pela organização.
- Premiação: R$ 300,00.
- Regra: 3 bois para bater a senha.

---

## 6.3 Dias da Categoria

Algumas vaquejadas organizam as senhas por dia. Outras não.

O sistema deve permitir os dois cenários:

### Cenário 1 — Categoria com organização por dia

Exemplo:

- Categoria Profissional.
- Sexta-feira: senhas de 1 a 100.
- Sábado: senhas de 101 a 200.

Nesse caso, o vaqueiro primeiro escolhe a categoria, depois o dia, e em seguida escolhe a senha dentro do mapa correspondente.

### Cenário 2 — Categoria sem organização por dia

Exemplo:

- Categoria Aberta.
- Mapa de senhas de 1 a 150.

Nesse caso, o vaqueiro escolhe a categoria e o sistema já mostra o mapa de senhas disponível.

---

## 6.4 Mapa de Senhas

O mapa de senhas é obrigatório para cada categoria.

Cada categoria deve ter pelo menos um mapa de senhas configurado.

O mapa define quais números estarão disponíveis para compra dentro de uma categoria e, quando aplicável, dentro de um dia específico.

### Exemplos de mapa

- Categoria Profissional: senhas de 1 a 100.
- Categoria Profissional na sexta-feira: senhas de 1 a 100.
- Categoria Profissional no sábado: senhas de 101 a 200.
- Categoria Iniciante: senhas de 1 a 80.

### Status da senha no mapa

Cada senha pode ter os seguintes status:

- Disponível.
- Reservada.
- Pendente de pagamento.
- Paga.
- Cancelada.
- Bloqueada.

### Regras do mapa

- Uma senha disponível pode ser selecionada pelo vaqueiro.
- Uma senha paga não pode ser comprada novamente.
- Uma senha reservada fica temporariamente indisponível para outros vaqueiros.
- Uma senha pendente aguarda confirmação de pagamento.
- Uma senha cancelada pode voltar a ficar disponível, caso o organizador permita.
- Uma senha bloqueada não aparece como disponível para compra.

---

## 6.5 Compra de Senhas

O vaqueiro pode comprar uma ou mais senhas no mesmo fluxo.

### Fluxo principal de compra

1. O vaqueiro acessa o site.
2. O sistema exibe as vaquejadas disponíveis.
3. O vaqueiro escolhe uma vaquejada.
4. O vaqueiro clica em “Comprar senha”.
5. O sistema abre um fluxo guiado em modal.
6. O vaqueiro escolhe a categoria.
7. Se a categoria tiver organização por dia, o vaqueiro escolhe o dia.
8. O sistema exibe o mapa de senhas disponível.
9. O vaqueiro escolhe uma ou mais senhas.
10. O vaqueiro avança para identificação.
11. Se estiver logado, o sistema usa os dados já cadastrados.
12. Se não estiver logado, o sistema oferece login ou cadastro rápido.
13. O vaqueiro confirma os dados.
14. O sistema gera o pagamento via Pix.
15. Após confirmação do pagamento, a senha é marcada como paga.
16. A senha fica disponível na área do vaqueiro.

---

## 6.6 Identificação do Vaqueiro

O sistema deve permitir que o vaqueiro faça login usando CPF e senha.

### Se o vaqueiro estiver logado

- O sistema deve carregar os dados pessoais automaticamente.
- O vaqueiro deve ir direto para a etapa de pagamento.
- Caso necessário, o vaqueiro pode revisar os dados antes de pagar.

### Se o vaqueiro não estiver logado

O sistema deve apresentar duas opções:

1. Entrar com CPF e senha.
2. Fazer cadastro rápido.

### Cadastro rápido

O cadastro rápido deve solicitar apenas informações essenciais para concluir a compra.

Informações sugeridas:

- Nome completo.
- CPF.
- WhatsApp.
- Senha de acesso.

O objetivo é evitar abandono da compra por excesso de campos.

---

## 6.7 Pagamento

O pagamento será feito exclusivamente via Pix.

### Regras de pagamento

- O sistema deve gerar o Pix após a confirmação dos dados.
- O vaqueiro deve visualizar as instruções de pagamento de forma clara.
- O sistema deve informar que a senha só será confirmada após o pagamento.
- Enquanto o pagamento não for confirmado, a senha deve ficar com status pendente ou reservada.
- Após confirmação do Pix, a senha deve mudar para paga.
- O vaqueiro deve receber uma confirmação visual clara no sistema.

### Status de pagamento

- Aguardando pagamento.
- Pago.
- Expirado.
- Cancelado.
- Falha no pagamento.

---

## 6.8 Área do Vaqueiro

A Área do Vaqueiro deve permitir que o usuário consulte e gerencie suas senhas.

### Funcionalidades principais

- Ver todas as senhas compradas.
- Ver status de cada senha.
- Ver dados da vaquejada.
- Ver categoria, dia e número da senha.
- Editar informações permitidas.
- Reimprimir ou visualizar senha.
- Acompanhar pagamentos pendentes.

### Informações exibidas em cada senha

- Nome da vaquejada.
- Cidade e estado.
- Categoria.
- Dia, se aplicável.
- Número da senha.
- Status da senha.
- Status do pagamento.
- Dados do vaqueiro.

### Edição da senha pelo vaqueiro

O vaqueiro poderá editar informações permitidas pela regra do evento.

Exemplos de informações que podem ser editadas:

- Dados pessoais.
- Nome do vaqueiro.
- Informações complementares da inscrição.

O sistema deve permitir que o administrador defina limites para edição, quando necessário.

---

# 7. Requisitos Funcionais

## 7.1 Requisitos da Área Administrativa — Administrador do Sistema

### Cadastro de vaquejada

O sistema deve permitir cadastrar uma nova vaquejada com suas informações principais.

### Edição de vaquejada

O sistema deve permitir editar dados de uma vaquejada já cadastrada.

### Cadastro de categorias

O sistema deve permitir cadastrar categorias específicas para cada vaquejada.

### Configuração de regras por categoria

O sistema deve permitir definir regras para cada categoria, como valor, premiação, quantidade de bois e observações.

### Configuração de dias

O sistema deve permitir configurar dias específicos para uma categoria, quando a vaquejada tiver organização por dia.

### Configuração de mapa de senhas

O sistema deve permitir definir o intervalo de senhas disponível para cada categoria e dia, quando houver.

### Cadastro de usuários do parque

O sistema deve permitir cadastrar usuários responsáveis pela gestão de uma vaquejada.

### Vincular usuários à vaquejada

O sistema deve permitir vincular um ou mais usuários a uma vaquejada específica.

### Controle de acesso

O sistema deve garantir que o usuário do parque visualize apenas as vaquejadas às quais ele tem permissão.

---

## 7.2 Requisitos da Área Administrativa — Organizador / Parque

### Dashboard da vaquejada

O sistema deve exibir indicadores gerais da vaquejada.

Indicadores sugeridos:

- Total de senhas vendidas.
- Total de senhas disponíveis.
- Total de senhas reservadas.
- Total de senhas pendentes.
- Total de senhas pagas.
- Receita total confirmada.
- Receita pendente.
- Vendas por categoria.
- Vendas por dia.

### Lista de senhas

O sistema deve permitir visualizar todas as senhas da vaquejada.

A listagem deve permitir filtros por:

- Categoria.
- Dia.
- Número da senha.
- Nome do vaqueiro.
- CPF.
- Status da senha.
- Status do pagamento.

### Editar senha

O sistema deve permitir que o organizador edite informações de uma senha quando necessário.

### Imprimir senha

O sistema deve permitir imprimir uma senha individualmente.

### Relatórios

O sistema deve permitir gerar relatórios simples por:

- Categoria.
- Dia.
- Status de pagamento.
- Status da senha.
- Vaqueiro.

### Consulta de pagamentos

O sistema deve permitir acompanhar pagamentos pagos, pendentes, expirados e cancelados.

---

## 7.3 Requisitos do Site do Vaqueiro

### Listar vaquejadas disponíveis

O sistema deve exibir as vaquejadas ativas logo na tela inicial.

### Detalhes da vaquejada

O sistema deve permitir visualizar informações básicas da vaquejada antes da compra.

### Comprar senha

O sistema deve permitir iniciar a compra de senha a partir da vaquejada selecionada.

### Fluxo guiado em modal

O sistema deve conduzir o vaqueiro por etapas simples dentro de um modal.

Etapas sugeridas:

1. Escolher categoria.
2. Escolher dia, se existir.
3. Escolher uma ou mais senhas.
4. Identificar ou cadastrar vaqueiro.
5. Confirmar dados.
6. Pagar com Pix.
7. Ver confirmação.

### Login do vaqueiro

O sistema deve permitir login com CPF e senha.

### Cadastro rápido

O sistema deve permitir cadastro rápido durante a compra.

### Área do vaqueiro

O sistema deve permitir que o vaqueiro acesse uma área exclusiva para consultar e gerenciar suas senhas.

### Editar dados da senha

O sistema deve permitir que o vaqueiro edite informações permitidas da senha.

### Pagamento Pix

O sistema deve permitir pagamento exclusivamente via Pix.

---

# 8. Requisitos Não Funcionais

## 8.1 Usabilidade

- O sistema deve ser simples e intuitivo.
- O fluxo de compra deve ser curto.
- O sistema deve funcionar muito bem em celular.
- O usuário deve conseguir comprar uma senha com poucos cliques.
- O sistema deve evitar linguagem técnica.
- O sistema deve mostrar mensagens claras em todas as etapas.

## 8.2 Desempenho

- A tela inicial deve carregar rapidamente.
- O mapa de senhas deve responder de forma rápida.
- A seleção de senha deve ser imediata.
- O sistema deve suportar picos de acesso em dias de abertura de vendas.

## 8.3 Segurança

- O sistema deve proteger os dados pessoais dos vaqueiros.
- O acesso administrativo deve exigir autenticação.
- Cada organizador deve acessar apenas suas próprias vaquejadas.
- Operações importantes devem ser registradas para auditoria.
- Pagamentos devem ser tratados com segurança.

## 8.4 Disponibilidade

- O sistema deve estar disponível principalmente durante períodos de venda.
- Deve haver cuidado especial com estabilidade em horários de grande procura.

## 8.5 Escalabilidade

- O sistema deve permitir várias vaquejadas ativas ao mesmo tempo.
- O sistema deve permitir muitos vaqueiros comprando senhas simultaneamente.
- O sistema deve permitir crescimento futuro para novas funcionalidades.

---

# 9. Jornada do Vaqueiro

## 9.1 Compra simples

1. Vaqueiro acessa o site.
2. Visualiza as vaquejadas disponíveis.
3. Escolhe a vaquejada.
4. Clica em comprar senha.
5. Escolhe categoria.
6. Escolhe dia, se necessário.
7. Escolhe a senha no mapa.
8. Informa seus dados ou faz login.
9. Paga via Pix.
10. Recebe confirmação.
11. Acessa sua senha na área do vaqueiro.

## 9.2 Consulta de senhas

1. Vaqueiro acessa a área do vaqueiro.
2. Faz login com CPF e senha.
3. Visualiza suas senhas.
4. Abre os detalhes da senha.
5. Edita informações permitidas, se necessário.
6. Visualiza ou imprime a senha.

---

# 10. Jornada do Organizador

1. Organizador acessa o painel administrativo.
2. Visualiza suas vaquejadas.
3. Entra na vaquejada desejada.
4. Acompanha indicadores gerais.
5. Consulta lista de senhas.
6. Filtra por categoria, dia ou status.
7. Edita informações quando necessário.
8. Imprime senhas.
9. Gera relatórios simples.

---

# 11. Jornada do Administrador do Sistema

1. Administrador acessa a área administrativa.
2. Cadastra uma nova vaquejada.
3. Define informações gerais do evento.
4. Cadastra categorias.
5. Define regras de cada categoria.
6. Configura dias, quando houver.
7. Configura mapa de senhas obrigatório por categoria.
8. Cadastra usuários do parque.
9. Vincula usuários à vaquejada.
10. Publica a vaquejada para venda.

---

# 12. Módulos do Produto

## 12.1 Módulo de Vaquejadas

Responsável pelo cadastro e gestão dos eventos.

Funcionalidades:

- Cadastrar vaquejada.
- Editar vaquejada.
- Ativar ou encerrar vaquejada.
- Vincular organizadores.
- Configurar informações gerais.

## 12.2 Módulo de Categorias

Responsável pelas categorias de cada vaquejada.

Funcionalidades:

- Cadastrar categorias.
- Definir valor da senha.
- Definir premiação.
- Definir quantidade de bois.
- Adicionar observações.
- Ativar ou desativar categoria.

## 12.3 Módulo de Dias

Responsável pela organização por dia, quando existir.

Funcionalidades:

- Cadastrar dias da vaquejada.
- Vincular dias às categorias.
- Definir mapas por dia.

## 12.4 Módulo de Mapa de Senhas

Responsável pela configuração e controle dos números disponíveis.

Funcionalidades:

- Criar intervalo de senhas.
- Vincular mapa à categoria.
- Vincular mapa ao dia, quando houver.
- Controlar status de cada senha.
- Bloquear senhas manualmente.

## 12.5 Módulo de Compra

Responsável pela jornada de compra do vaqueiro.

Funcionalidades:

- Escolher vaquejada.
- Escolher categoria.
- Escolher dia.
- Escolher senha.
- Selecionar múltiplas senhas.
- Identificar vaqueiro.
- Gerar pagamento Pix.
- Confirmar compra.

## 12.6 Módulo do Vaqueiro

Responsável pela área exclusiva do vaqueiro.

Funcionalidades:

- Login com CPF e senha.
- Cadastro rápido.
- Consulta de senhas.
- Edição de informações permitidas.
- Visualização de status.
- Impressão ou visualização da senha.

## 12.7 Módulo de Pagamentos

Responsável pelo controle dos pagamentos via Pix.

Funcionalidades:

- Gerar Pix.
- Controlar status de pagamento.
- Confirmar pagamento.
- Expirar pagamento não realizado.
- Atualizar status da senha.

## 12.8 Módulo de Relatórios

Responsável pelos relatórios administrativos.

Funcionalidades:

- Relatório por categoria.
- Relatório por dia.
- Relatório por status de pagamento.
- Relatório de senhas vendidas.
- Relatório de receita.

---

# 13. Permissões de Usuário

## Administrador do Sistema

Pode:

- Gerenciar todas as vaquejadas.
- Cadastrar organizadores.
- Configurar categorias e mapas.
- Acessar todos os relatórios.
- Publicar ou encerrar eventos.

## Organizador / Parque

Pode:

- Acessar somente suas vaquejadas.
- Ver indicadores da sua vaquejada.
- Ver relação de senhas.
- Editar informações permitidas.
- Imprimir senhas.
- Gerar relatórios da sua vaquejada.

## Vaqueiro

Pode:

- Comprar senhas.
- Ver suas próprias senhas.
- Editar informações permitidas das suas senhas.
- Visualizar status de pagamento.
- Imprimir ou acessar sua senha.

---

# 14. Status Gerais do Sistema

## Status da vaquejada

- Rascunho.
- Ativa.
- Encerrada.
- Cancelada.

## Status da senha

- Disponível.
- Reservada.
- Pendente.
- Paga.
- Cancelada.
- Bloqueada.

## Status do pagamento

- Aguardando pagamento.
- Pago.
- Expirado.
- Cancelado.
- Falha.

---

# 15. MVP — Primeira Versão

A primeira versão do produto deve focar no fluxo principal de venda e gestão de senhas.

## Funcionalidades essenciais do MVP

### Área Administrativa

- Login administrativo.
- Cadastro de vaquejada.
- Cadastro de categorias.
- Configuração de mapa de senhas por categoria.
- Configuração opcional de dias.
- Cadastro de usuários organizadores.
- Painel do organizador.
- Lista de senhas.
- Indicadores básicos.
- Impressão de senhas.

### Site do Vaqueiro

- Listagem de vaquejadas ativas.
- Fluxo guiado de compra.
- Escolha de categoria.
- Escolha de dia, quando houver.
- Escolha de uma ou mais senhas.
- Cadastro rápido.
- Login com CPF e senha.
- Pagamento via Pix.
- Área do vaqueiro.
- Consulta de senhas compradas.

---

# 16. Funcionalidades Futuras

Após o MVP, o produto pode evoluir com:

- Envio automático de confirmação por WhatsApp.
- Envio de lembrete de pagamento.
- QR Code para validação no evento.
- Check-in da senha na entrada.
- Ranking de vendas por categoria.
- Cupom de desconto.
- Taxa de conveniência.
- App mobile.
- Controle de repasse financeiro para organizadores.
- Integração com transmissão ou Boi TV.
- Página pública personalizada para cada parque.
- Controle de equipes e competidores.
- Sorteio ou escolha automática de senhas.

---

# 17. Métricas de Sucesso

O sucesso do produto pode ser medido por:

- Quantidade de vaquejadas cadastradas.
- Quantidade de senhas vendidas pelo site.
- Taxa de conclusão da compra.
- Tempo médio para comprar uma senha.
- Quantidade de pagamentos confirmados.
- Redução de vendas manuais.
- Satisfação dos organizadores.
- Satisfação dos vaqueiros.
- Quantidade de acessos à área do vaqueiro.

---

# 18. Critérios de Aceite do Produto

O produto será considerado pronto para MVP quando:

- O administrador conseguir cadastrar uma vaquejada completa.
- O administrador conseguir configurar categorias e mapas de senha.
- O organizador conseguir acessar apenas sua vaquejada.
- O vaqueiro conseguir visualizar vaquejadas disponíveis.
- O vaqueiro conseguir comprar uma ou mais senhas.
- O sistema conseguir gerar pagamento Pix.
- O pagamento confirmado atualizar o status da senha.
- O vaqueiro conseguir acessar sua área exclusiva.
- O organizador conseguir visualizar as senhas vendidas.
- O organizador conseguir imprimir senhas.
- Os status de senha e pagamento estiverem claros para todos os usuários.

---

# 19. Resumo Executivo

O Senha do Vaqueiro será uma plataforma simples, objetiva e focada na realidade do público da vaquejada.

O principal valor do produto é permitir que o vaqueiro compre sua senha de forma fácil, enquanto o organizador ganha controle, indicadores e segurança na gestão do evento.

A prioridade do MVP deve ser entregar uma experiência extremamente simples para o vaqueiro e uma administração eficiente para o parque de vaquejada.

A plataforma deve evitar complexidade desnecessária, priorizando clareza, agilidade, confiança e facilidade de uso.
