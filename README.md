# Tolerâncias Geométricas: Batimento — Aplicação Educacional

Aplicação web interativa para ensinar tolerâncias de batimento geométrico em desenhos técnicos, desenvolvida para estudantes de cursos técnicos de Mecânica.

## 🌐 Acesso rápido

A aplicação está publicada e pode ser aberta no navegador, sem instalar nada. Copie e cole o endereço:

https://eduardosantos2231.github.io/senai_batimento/

## 📋 Índice

1. [Instalação e Execução](#-instalação-e-execução)
2. [Como os Símbolos são Representados](#-como-os-símbolos-são-representados)
3. [Diferença entre Circular e Total Runout](#-diferença-entre-circular-e-total-runout)
4. [Como o Eixo de Datum é Utilizado](#-como-o-eixo-de-datum-é-utilizado)
5. [Como a Medição é Calculada](#-como-a-medida-é-calculada)
6. [Simplificações Educacionais](#-simplificações-educacionais)
7. [Estrutura do Projeto](#-estrutura-do-projeto)

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js instalado (versão 18+ recomendada)
- npm ou yarn

### Passos

1. **Clonar ou acessar o projeto:**
   ```bash
   cd batimentos_senai
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```
   Isso instalará a biblioteca `three.js` (versão 0.164.0) e o `vite`.

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Abrir no navegador:**
   O aplicativo estará disponível em `http://localhost://5173` (ou a porta indicada no terminal).

5. **Build para produção:**
   ```bash
   npm run build
   ```

## 📐 Como os Símbolos são Representados

Os símbolos de tolerância geométrica são criados usando SVG vetorial preciso, não aproximações textuais. Dois símbolos principais são exibidos:

### Símbolo de Batimento Circular (seta diagonal única ↗)
- Representa o **batimento circular radial**
- Com formato de seta diagonal única (↗)
- Indica que a variação é controlada em uma seção circular específica da superfície
- SVG: glifo único em `<defs>` reutilizado por `<use>` (id `sym-circ`)

### Símbolo de Batimento Total (seta diagonal dupla ↗↗)
- Representa o **batimento total radial**
- Com formato de seta diagonal dupla (↗↗)
- Indica que a variação é controlada sobre a superfície cilíndrica inteira
- SVG: glifo duplo em `<defs>` (id `sym-total`)

### Estrutura do Quadro de Controle (Feature Control Frame)

Cada símbolo está dentro de um quadro com três compartimentos (lidos da esquerda para a direita):

1. **Primeiro compartimento:** Símbolo de característica geométrica
   - Seta única ↗ = Batimento Circular
   - Seta dupla ↗↗ = Batimento Total

2. **Segundo compartimento:** Valor da tolerância
   - Exemplo: `0,05 mm`
   - Observe: Estes são valores ilustrativos. Valores reais devem vir do desenho técnico ou da atribuição.

3. **Terceiro compartimento:** Referência de datum
   - `A` indica o datum A
   - Estabelece a referência para avaliar o batimento

### Exemplos Visuais

```
[ ↗   | 0,05 | A ]  →  Batimento Circular Radial
[ ↗↗  | 0,05 | A ]  →  Batimento Total Radial
```

Os quadros são interativos - clicar em um quadro seleciona o modo correspondente na simulação 3D.

## 🔄 Diferença entre Circular e Total Runout

### Runout Circular (Circular Runout)

- **O que avalia:** Variação em uma seção circular individual da superfície
- **Como é avaliado:** O indicador de dial fica em um ponto fixo na superfície cilíndrica enquanto a peça gira em torno do datum
- **O que mede:** Deslocamento radial naquele círculo específico a cada revolução
- **Símbolo:** Seta diagonal única (↗)
- **Frase-chave:** *"Verifica quanto a indicação varia em uma seção circular da superfície lateral enquanto a peça gira em torno do datum."*

### Runout Total (Total Runout)

- **O que avalia:** Variação sobre toda a superfície cilíndrica
- **Como é avaliado:** O indicador percorre o comprimento da superfície enquanto a peça gira
- **O que mede:** Variação acumulada que inclui tanto o deslocamento radial quanto o deslocamento axial ao longo de toda a superfície
- **Símbolo:** Seta diagonal dupla (↗↗)
- **Frase-chave:** *"Verifica a variação da superfície cilíndrica inteira, considerando a rotação da peça e o deslocamento do instrumento ao longo da superfície."*

### Distinção Importante

> **Runout circular é avaliado em círculo(s) individual(is) a cada posição angular.**
> **Total runout avalia a superfície inteira como o indicador se move ao longo do comprimento da peça durante a rotação.**

Na aplicação, isso se manifesta de forma diferente:
- No modo **Circular Radial**: o indicador fica em um ponto da superfície circular
- No modo **Total Radial**: o indicador move-se ao longo do eixo X enquanto a peça gira

## 📏 Como o Eixo de Datum é Utilizado

### Conceito de Datum

Um **datum** é uma referência teórica (ponto, linha ou superfície) usada como ponto de partida para medir e avaliar características geométricas. No contexto deste aplicativo:

- **Datum A** é um recurso cilíndrico designado no eixo longitudinal do fuso
- Ele estabelece a referência axial e radial para todas as medições de runout
- Todas as tolerâncias de runout neste aplicativo referenciam o datum A

### Identificação Visual

No desenho técnico:
- Linha horizontal tracejada com rótulo "A" na vista frontal
- Setas de seta dupla apontando para fora da linha (setas de localização de datum)
- O datum é o "zero" para todas as medições angulares e lineares

Na cena 3D:
- Eixo vermelho tracejado do datum A (cor `#c41e3a`)
- Setas indicando a direção do datum
- Rótulo "A" posicionado no eixo

### Relação entre Símbolo, Superfície Controlada e Medição

```
Símbolo de Tolerância
    ↓
Datum A (referência)
    ↓
Superfície Controlada (sinalizada no desenho)
    ↓
Medição com relógio comparador
```

### Frase de Explicação (do aplicativo)

> *"O datum A estabelece a referência utilizada para verificar o batimento da superfície indicada."*

**Importante não confundir:**
- **Feature de datum:** A superfície física designada (ex: o topo do fuso)
- **Datum em si:** A referência teórica ideal
- **Eixo de datum:** A linha de referência imaginária ao longo do recurso designado

## ⚖️ Como a Medição é Calculada

### Indicador de Dial (Dial Indicator)

O aplicativo simula um relógio comparador mecânico com:
- Face circular graduada com agulha
- Agulha que indica o deslocamento atual
- Haste (plunger) e ponta que entram em contato com a superfície
- Display digital mostrando a leitura em mm

### Leituras Registradas

Durante a rotação do fuso, as medições são coletadas a cada frame de animação:

```
reading = deslocamento radial (modo radial)
reading = deslocamento axial,face (modo axial)
```

### Cálculo da variação (máx − mín)

A variação é a diferença entre a máxima e a mínima leituras:

```
variação = máxima leitura − mínima leitura
```

No aplicativo:
- As leituras são acumuladas durante a rotação
- Mínima leitura = menor deslocamento observado
- Máxima leitura = maior deslocamento observado
- Variação = diferença entre máx e mín

### Exemplo Prático

Se durante a rotação as leituras mínimas e máximas forem:
- Mínima: 0,01 mm
- Máxima: 0,06 mm

Então: **variação = 0,06 − 0,01 = 0,05 mm**

### Comparação com a Tolerância

O aplicativo compara a variação calculada com o valor do quadro de controle e mostra o veredito:

```
Se variação ≤ tolerância → Dentro da tolerância
Se variação >  tolerância → Fora da tolerância
```

O veredito é exibido na interface ("Dentro/Fora da tolerância — variação … mm ≤/> … mm"); o estudante deve sempre conferir o valor do desenho oficial.

### Controles de Medição

- **Iniciar/Pausar:** Inicia ou pausa a rotação do eixo
- **Uma volta (360°):** Gira exatamente uma volta e para (coleta mín/máx/variação de uma revolução)
- **Zerar:** Zera todas as estatísticas (mín, máx, variação)
- **Velocidade:** Controla a velocidade de rotação (0,2× a 2,5×)
- **Excentricidade e:** Controla a excentricidade simulada; variação ≈ 2×e (slider 0 a 0,12 mm)
- **Restaurar câmera / Mostrar eixo de referência:** Controles de visualização
- **Ícones (?):** Cada termo (Leitura, Mín/Máx, Variação, Tolerância, Datum, Excentricidade, Navegação) tem um card explicativo

## 🎓 Simplificações Educacionais

Para manter a aplicação acessível e focada no aprendizado, as seguintes simplificações foram aplicadas:

### 1. Modelo Geométrico Simplificado
- Base cilíndrica com deformação exagerada (excentricidade/empeno) para visualização; leitura em mm é real
- Excentricidade `e` (slider) gera variação `≈ 2·e`; batimento total com empeno (bow) varia ao longo do comprimento
- Não inclui efeitos de alongamento térmico, desgaste de rolamentos ou outras condições reais

### 2. Modelo de Medição Simplificado
- Apenas o deslocamento radial ou axial é medido
- Não inclui múltiplos pontos de medição simultâneos
- A leitura digital é um valor simplificado, não derivação completa de metrologia

### 3. Tolerância Fixa
- O valor de tolerância `0,05 mm` é ilustrativo
- Valores reais variam conforme o projeto, material, aplicação
- O estudante deve usar os valores do seu desenho técnico

### 4. Datum Idealizado
- Datum A é tratado como uma referência perfeita
- Em prática, os datums têm tolerâncias de localização themselves
- A superfície do datum também tem imperfeições

### 5. Avaliação de Aceitabilidade
- O aplicativo exibe o veredito "Dentro/Fora da tolerância" comparando variação com o valor do quadro
- Em metrologia real fatores adicionais afetam a validade
- O estudante deve sempre consultar o padrão completo (ex.: ASME Y14.5, ISO 1101)

### 6. Superfície Cilíndrica Ideal
- A superfície de medição é um cilindro perfeito
- Em peças reais, rugosidade, propriedades do material e condições de suporte afetam a medição

### 7. Orientações Fixas
- A direção do indicador é fixa em relação ao eixo
- Em aplicações reais, a orientação pode variar conforme o projeto

### 8. Superfície do Flange Simplificada
- O flange é mostrado como um disco plano
- Em peças reais, pode ter chanfros, rasgos ou outras características

## 📁 Estrutura do Projeto

```
batimentos_senai/
├── package.json          # Configuração do Vite e dependências
├── vite.config.js        # Base "/senai_batimento/" para GitHub Pages
├── .github/workflows/deploy.yml  # Build + deploy no GitHub Pages
├── index.html           # Estrutura HTML principal
├── src/
│   ├── main.js          # Lógica Three.js, simulação, desenho e controle
│   ├── style.css        # Estilos (tema folha de desenho)
│   └── technical-drawing.js  # Rascunho não usado (todo em main.js)
└── README.md            # Este arquivo
```

### Componentes Principais

1. **index.html** - Layout com três áreas principais:
   - Área DESENHO TÉCNICO (esquerda): Projeção ortográfica SVG
   - Área SIMULAÇÃO 3D (centro): Cena Three.js interativa
   - Área INTERPRETAÇÃO (direita): Explicações e painel de controle

2. **src/main.js** - Lógica principal incluindo:
   - Inicialização do Three.js (cena, câmera, renderer, controles)
   - Criação de geometrias (eixo, datum, relógio comparador)
   - Lógica de modos (radial, axial, total)
   - Cálculo da variação (máx − mín) e veredito vs. tolerância
   - Controles de interface (botões, sliders, eventos, cards "?")
   - Loop de animação com requestAnimationFrame

3. **src/style.css** - Estilização com tema de desenho técnico:
   - Fundo claro lembrando folha de engenharia
   - Linhas técnicas escuras
   - Grade sutil
   - Componentes metálicos em 3D
   - Cores de acento contidas (azul, vermelho)

4. **src/technical-drawing.js** - Rascunho não usado (mantido para referência; todo o desenho atual é gerado em `main.js`)

## 🎯 Funcionalidades Principais

### Três Modos de Runout

1. **Runout Circular Radial** - Variação em seção circular da superfície lateral
2. **Runout Circular Axial** - Variação em trajetória circular sobre a face
3. **Runout Total Radial** - Variação da superfície cilíndrica inteira

### Controles da Simulação

- Botões Iniciar/Pausar e Uma volta (360°) para rotação
- Controle de velocidade (0,2× a 2,5×)
- Controle de excentricidade `e` (variação ≈ 2×e)
- Botão Zerar para zerar medições (mín, máx, variação)
- Botões "Como ler este símbolo?" e "Comparar tolerâncias" + ícones (?) com cards explicativos
- Botão Restaurar câmera
- Checkbox Mostrar eixo de referência

### Destaques Interativos

- Clicar em um quadro de tolerância destaca a superfície correspondente
- Tanto no desenho técnico quanto na cena 3D
- O eixo de datum permanece visível identificado
- Painel de interpretação atualiza automaticamente

## 🌐 Compatibilidade

- Funciona em navegadores modernos com suporte a WebGL
- Responsivo: se adapta a larguras de tela de 320px a 1600px+
- Dispositivos móveis: interface adaptativa, controles táctil-friendly
- Não requer nenhum plugin ou tecnologia externa além do navegador

## 👨‍🏫 Para Instrutores

Esta aplicação foi desenhada para:

- **Aula de Desenho Técnico** em cursos de Mecânica
- **Estudo independente** de tolerâncias geométricas
- **Demonstração** dos conceitos de runout e datum
- **Experimentação** virtual sem necessidade de equipamento físico

Os valores de tolerância (`0,05 mm`) podem ser facilmente alterados no código para corresponder às atribuições específicas. O modelo geométrico pode ser estendido para incluir:

- Diferentes amplitudes de excentricidade
- Múltiplos datums (A, B, C, etc.)
- Superfícies não-cilíndricas
- Integração com softwares de metrologia real

---
Desenvolvido para fins educacionais no contexto de Mecânica.
Não representa instrumento de metrologia certificado.
Valores de tolerância são ilustrativos - usar valores do desenho técnico oficial.
README gerado automaticamente como parte dos entregáveis do projeto.
</READMEEOF
