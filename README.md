# Tolerâncias Geométricas: Runout - Aplicação Educacional

Aplicação web interativa para ensinar tolerâncias de runout geométrico em desenhos técnicos, desenvolvida para estudantes de cursos técnicos de Manufatura Mecânica.

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

### Símbolo de Runout Circular (Single Arrow)
- Representa o **batimento circular radial**
- Com formato de seta única (↓)
- Indica que a variação é controlada em uma seção circular específica da superfície
- SVG: seta única com direção radial

### Símbolo de Runout Total (Double Arrow / Wider Symbol)
- Representa o **batimento total radial**  
- Com formato de seta dupla ou área maior
- Indica que a variação é controlada sobre a superfície cilíndrica inteira
- SVG: área mais ampla representando variação acumulada

### Estrutura do Quadro de Controle (Feature Control Frame)

Cada símbolo está dentro de um quadro com três compartimentos (lidos da esquerda para a direita):

1. **Primeiro compartimento:** Símbolo geométrico característica
   - Seta única = Runout Circular
   - Seta dupla/área maior = Runout Total

2. **Segundo compartimento:** Valor da tolerância
   - Exemplo: `0,05 mm`
   - Observe: Estes são valores ilustrativos. Valores reais devem vir do desenho técnico ou da atribuição.

3. **Terceiro compartimento:** Referência de datum
   - `A` indica o datum A
   - Estabelece a referência para avaliar o batimento

### Exemplos Visuais

```
[ seta única   | 0,05 | A ]  →  Runout Circular Radial
[ área maior  | 0,05 | A ]  →  Runout Total Radial
```

Os quadros são interativos - clicar em um quadro seleciona o modo correspondente na simulação 3D.

## 🔄 Diferença entre Circular e Total Runout

### Runout Circular (Circular Runout)

- **O que avalia:** Variação em uma seção circular individual da superfície
- **Como é avaliado:** O indicador de dial fica em um ponto fixo na superfície cilíndrica enquanto a peça gira em torno do datum
- **O que mede:** Deslocamento radial naquele círculo específico a cada revolução
- **Símbolo:** Seta única (↓)
- **Frase-chave:** *"Verifica quanto a indicação varia em uma seção circular da superfície lateral enquanto a peça gira em torno do datum."*

### Runout Total (Total Runout)

- **O que avalia:** Variação sobre toda a superfície cilíndrica
- **Como é avaliado:** O indicador de dial percorre o comprimento da superfície enquanto a peça gira
- **O que mede:** Variação acumulada que inclui tanto o deslocamento radial quanto o deslocamento axial ao longo de toda a superfície
- **Símbolo:** Área maior / seta dupla (⇔)
- **Frase-chave:** *"Verifica a variação da superfície cilíndrica inteira, considerando a rotação da peça e o deslocamento do instrumento ao longo da superfície."*

### Distinção Importante

> **Runout circular é avaliado em círculo(s) individual(is) a cada posição angular.**
> **Total runout avalia a superfície inteira como o indicador se move ao longo do comprimento da peça durante a rotação.**

Na aplicação, isso se manifesta de forma diferente:
- No modo **Circular Radial**: o indicador fica em um ponto da superfície circular
- No modo **Total Radial**: o indicador move-se ao longo do eixo Z enquanto a peça gira

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

No escena 3D:
- Eixo vermelho circulando o fuso (cor `#e74c3c`)
- Setas indicando a direção do datum
- Rótulo "A" posicionado no eixo superior

### Relação entre Símbolo, Superfície Controlada e Measurement

```
Símbolo de Tolerância
    ↓
Datum A (referência)
    ↓
Superfície Controlada (sinaleada no desenho)
    ↓
Medicao com indicador de dial
```

### Frase de Explicação (do aplicativo)

> *"O datum A estabelece a referência utilizada para verificar o batimento da superfície indicada."*

**Importante não confundir:**
- **Feature de datum:** A superfície física designada (ex: o topo do fuso)
- **Datum em si:** A referência teórica ideal
- **Eixo de datum:** A linha de referência imaginária ao longo do recurso designado

## ⚖️ Como a Medição é Calculada

### Indicador de Dial (Dial Indicator)

O aplicativo simula um indicador de dial mecânico com:
- Face circular graduada (0 a 60 unidades)
- Aguja que indica a deslocamento atual
- Ponteiro (plunger) que entra em contato com a superfície
- Dígito digital mostrando a leitura em mm

### Leituras Registradas

Durante a rotação do fuso, as medições são coletadas a cada frame de animação:

```
reading = deslocamento radial (modo radial)
reading = deslocamento axial,face (modo axial)
```

### Cálculo do TIR (Total Indicated Runout)

O TIR é calculado como a diferença entre a máxima e mínima leituras:

```
TIR = máxima leitura - mínima leitura
```

No aplicativo:
- As leituras são acumuladas durante a rotação
- Mínima leitura = menor deslocamento observado
- Máxima leitura = maior deslocamento observado
- TIR = diferença entre max e min

### Exemplo Prático

Se durante 3 revoluções as leituras mínimas e máximas forem:
- Mínima: 0,01 mm
- Máxima: 0,06 mm

Então: **TIR = 0,06 - 0,01 = 0,05 mm**

### Comparação com a Tolerância

O aplicativo compara o TIR calculado com o valor especificado no quadro de controle:

```
Se TIR ≤ tolerância especificada → RESULTADO: PASS
Se TIR > tolerância especificada → RESULTADO: FAIL
```

**Atenção:** O aplicativo NÃO trata automaticamente o valor como aceitável ou inaceitável. A comparação é feita visivelmente, e o estudante deve interpretar o resultado.

### Controles de Medição

- **Start/Pause:** Inicia ou pausa a rotação do fuso
- **Reset:** Zera todas as estatísticas (min, max, TIR, leituras)
- **TIR:** Calcula TIR a partir das leituras atuais
- **Geometric Error Amplitude:** Controla a excentricidade simulada (amplitude do erro geométrico)
- **Rotation Speed:** Controla a velocidade de rotação (multiplicador)

## 🎓 Simplificações Educacionais

Para manter a aplicação acessível e focada no aprendizado, as seguintes simplificações foram aplicadas:

### 1. Modelo Geométrico Simplificado
- O fuso é um cilindro perfeitamente cilíndrico
- A excentricidade é simulada com uma variação senoidal simples
- Não inclui efeitos de alongamento térmico, desgaste de rolamentos, ou outras condições reais

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

### 5. Nenhuma Avaliação de Aceitabilidade Automatizada
- O aplicativo mostra PASS/FAIL baseado na comparação
- Em ambientes de metrologia real, fatores adicionais afetam a validade
- O estudante deve sempre consultar o padrão completo (ex: ASME Y14.5, ISO 1101)

### 6. Superfície Cilíndrica Ideal
- A superfície de medição é um cilindro perfeito
- Em peças reais, rugosidade, propriedades do material e condições de suporte afetam a medição

### 7. Orientações Fixas
- A direção do indicador é fixa relative ao fuso
- Em aplicações reais, a orientação pode variar conforme o projeto

### 8. Superfície do Flanco Simplificada
- O flanco é mostrado como um cilindro plano
- Em peças reais, pode ter chanfros, fendas, ou outras características

## 📁 Estrutura do Projeto

```
batimentos_senai/
├── package.json          # Configuração do Vite e dependências
├── index.html           # Estrutura HTML principal
├── styles.css           # Estilização (tema técnico-drawing)
├── src/
│   ├── main.js          # Lógica Three.js, simulação, controle
│   ├── style.css        # Estilos (cópia do styles.css ou overrides)
│   └── technical-drawing.js  # Gerador SVG do desenho técnico
└── README.md            # Este arquivo
```

### Componentes Principais

1. **index.html** - Layout com três áreas principais:
   - Área DESENHO TÉCNICO (esquerda): Projeção ortográfica SVG
   - Área SIMULAÇÃO 3D (centro): Cena Three.js interativa
   - Área INTERPRETAÇÃO (direita): Explicações e painel de controle

2. **src/main.js** - Lógica principal incluindo:
   - Inicialização do Three.js (cena, câmera, renderer, controles)
   - Criação de geometrias (fuso, eixo de datum, indicador de dial)
   - Lógica de modos (radial, axial, total)
   - Cálculo de TIR e comparação com tolerância
   - Controles de interface (botões, sliders, eventos)
   - Loop de animação com requestAnimationFrame

3. **src/style.css** - Estilização com tema de desenho técnico:
   - Fundo claro resembling folha de engenharia
   - Linhas técnicas escuras
   - Grade sutil
   - Componentes metálicos em 3D
   - Cores de acento contidas (azul, vermelho, verde)

4. **src/technical-drawing.js** - Gerador de desenho SVG:
   - Projeção ortográfica do fuso com dimensões
   - Referência de datum A
   - Quadros de controle de tolerância (3 frames)
   - Linhas de referência e anotações
   - Elementos interativos (clique em frames)

## 🎯 Funcionalidades Principais

### Três Modos de Runout

1. **Runout Circular Radial** - Variação em seção circular da superfície lateral
2. **Runout Circular Axial** - Variação em trajetória circular sobre a face
3. **Runout Total Radial** - Variação da superfície cilíndrica inteira

### Controles da Simulação

- Botão Start/Pausar para rotação do fuso
- Controle de velocidade de rotação (0.5x a 3x)
- Controle de amplitude do erro geométrico
- Botão Reset para zerar medições
- Botão Calcular TIR
- Botão "Como ler este símbolo?" para ajuda educacional
- Botão Restore Camera
- Toggle mostrar/ocultar eixo de datum

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

- **Aula de Desenho Técnico** em cursos de Manufatura Mecânica
- **Estudo independente** de tolerâncias geométricas
- **Demonstração** dos conceitos de runout e datum
- **Experimentação** virtual sem necessidade de equipamento físico

Os valores de tolerância (`0,05 mm`) podem ser facilmente alterados no código para corresponder às atribuições específicas. O modelo geométrico pode ser estendido para incluir:

- Diferentes amplitudes de excentricidade
- Múltiplos datums (A, B, C, etc.)
- Superfícies não-cilíndricas
- Integração com softwares de metrologia real

---
Desenvolvido para fins educacionais no contexto de Manufatura Mecânica.
Não representa instrumento de metrologia certificado.
Valores de tolerância são ilustrativos - usar valores do desenho técnico oficial.
README gerado automaticamente como parte dos entregáveis do projeto.
</READMEEOF
