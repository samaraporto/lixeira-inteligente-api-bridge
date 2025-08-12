# Lixeira Inteligente - Ponte MQTT-Telegram (API/Backend)

Este repositório contém o código de um serviço "ponte" (bridge) que conecta o broker MQTT à API do Telegram. Ele atua como o backend para o projeto da Lixeira Inteligente.

Sua função é escutar o status publicado pela lixeira no tópico MQTT e, ao identificar uma mudança de estado ("CHEIA" ou "OK"), enviar uma notificação formatada para um chat específico no Telegram.

### Arquitetura e Fluxo de Dados

O serviço se posiciona como o intermediário entre o dispositivo IoT e o usuário final.

`[ESP32]` --publica("CHEIA")--> `[Broker MQTT]` --> `[Ponte (Este Projeto)]` --envia_notificação--> `[Telegram]`

### Tecnologias Utilizadas
* **Node.js:** Ambiente de execução do serviço.
* **Docker & Docker Compose:** Para criar um ambiente de execução conteinerizado e portátil.
* **Mosquitto:** Broker MQTT que roda em um contêiner Docker junto com a aplicação.
* **Bibliotecas Node.js:** `mqtt`, `axios`, `express`

## Como Executar o Projeto

### Pré-requisitos

Antes de começar, você vai precisar de:

1.  **Docker e Docker Compose:** Garanta que estejam instalados e rodando na sua máquina.
2.  **Token de Bot do Telegram:** A "senha" do seu bot. Se não tiver um, siga os passos abaixo.
3.  **Chat ID do Telegram:** O "endereço" da sua conversa. Se não souber o seu, siga os passos abaixo.

#### Como Obter o Token do Bot (com @BotFather)

1.  No Telegram, procure por **`@BotFather`** (o oficial, com selo de verificação azul).
2.  Inicie a conversa com o comando `/start`.
3.  Para criar um novo bot, envie `/newbot`.
4.  Siga as instruções: dê um nome amigável (ex: `Notificador da Lixeira`) e um nome de usuário único terminado em `bot` (ex: `MinhaLixeiraInteligenteBot`).
5.  O BotFather responderá com uma mensagem de sucesso contendo seu token. Copie-o com cuidado.

#### Como Obter seu Chat ID (com @userinfobot)

1.  No Telegram, procure por **`@userinfobot`**.
2.  Inicie a conversa com o comando `/start`.
3.  O bot responderá imediatamente com seus dados. O número na linha **`Id:`** é o seu Chat ID. Copie este número.

### Instalação e Configuração

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/samaraporto/lixeira-inteligente-api-bridge
    cd lixeira-inteligente-api-bridge
    ```

2.  **Configure as Variáveis de Ambiente:**
    * Abra o arquivo `.env` e preencha com as credenciais que você acabou de obter:
        * `TELEGRAM_BOT_TOKEN`: Seu token do @BotFather.
        * `TELEGRAM_CHAT_ID`: Seu ID de chat do @userinfobot.
        * `MQTT_TOPIC`: `lixeira/01/status`

3.  **Ajuste a Lógica da Mensagem:**
    * O arquivo `index.js` precisa reagir às mensagens "CHEIA" e "OK". Garanta que o bloco `client.on("message", ...)` esteja com a lógica correta:
        ```javascript
        client.on("message", (topic, message) => {
          const payload = message.toString();
          logger.info(`Mensagem recebida do tópico "${topic}": ${payload}`);

          if (payload === "CHEIA") {
            sendMessageToTelegram("🚨 ALERTA: A lixeira está cheia e precisa ser esvaziada!");
          } 
          else if (payload === "OK") {
            sendMessageToTelegram("✅ A lixeira foi esvaziada. Tudo certo!");
          }
        });
        ```

### Executando o Ambiente com Docker

1.  **Inicie o Serviço:** Com o Docker Desktop rodando, execute o seguinte comando na raiz do projeto:
    ```bash
    docker-compose up -d
    ```
    Este comando inicia a aplicação da ponte e o broker MQTT Mosquitto em segundo plano.

2.  **Verifique os Logs:** Para confirmar que tudo está funcionando, visualize os logs:
    ```bash
    docker-compose logs -f api-telegram
    ```
    Você deve ver mensagens indicando a conexão com o broker e a inscrição no tópico `lixeira/01/status`.
    Agora você pode gravar o projeto [lixeira-inteligente-esp32](https://github.com/samaraporto/lixeira-inteligente) na sua placa e ver tudo funcionando.

3.  **Pare o Serviço:** Para desligar todos os contêineres relacionados a este projeto, execute:
    ```bash
    docker-compose down
    ```

**Autora: Samara P. de Noronha**