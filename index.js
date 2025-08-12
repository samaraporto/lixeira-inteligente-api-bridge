require("dotenv").config();
const express = require("express");
const mqtt = require("mqtt");
const axios = require("axios");
const logger = require("./logger");

const PORT = process.env.PORT || 3000;
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_TOPIC = process.env.MQTT_TOPIC;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (
  !MQTT_BROKER_URL ||
  !MQTT_TOPIC ||
  !TELEGRAM_BOT_TOKEN ||
  !TELEGRAM_CHAT_ID
) {
  logger.error(
    "Erro: Verifique se todas as variáveis de ambiente estão definidas no arquivo .env"
  );
  process.exit(1);
}

const app = express();
app.get("/status", (req, res) => {
  res.json({ status: "Rodando", mqtt_topic: MQTT_TOPIC });
});

app.listen(PORT, () => {
  logger.info(`Servidor de status rodando na porta ${PORT}`);
});

logger.info(`Conectando ao broker MQTT em ${MQTT_BROKER_URL}`);
const client = mqtt.connect(MQTT_BROKER_URL);

client.on("connect", () => {
  logger.info("Conectado ao broker MQTT!");
  client.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      logger.info(`Inscrito com sucesso no tópico: "${MQTT_TOPIC}"`);
    } else {
      logger.fatal("Erro ao se inscrever no tópico:", err);
    }
  });
});

client.on("message", (topic, message) => {
  const payload = message.toString();
  logger.info(`Mensagem recebida do tópico "${topic}": ${payload}`);

  // Verifica se a mensagem é "CHEIA"
  if (payload === "CHEIA") {
    const textoDaNotificacao = "🚨 ALERTA: A lixeira está cheia e precisa ser esvaziada!";
    sendMessageToTelegram(textoDaNotificacao);
  } 
  // Verifica se a mensagem é "OK"
  else if (payload === "OK") {
    const textoDaNotificacao = "✅ A lixeira foi esvaziada. Tudo certo!";
    sendMessageToTelegram(textoDaNotificacao);
  }
});

client.on("error", (error) => {
  logger.fatal(error, "Erro no cliente MQTT");
  client.end();
});

async function sendMessageToTelegram(text) {
  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  logger.info("Enviando mensagem para o Telegram...");
  try {
    const response = await axios.post(telegramApiUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: "Markdown",
    });
    logger.info("Mensagem enviada com sucesso ao Telegram:", response.data.ok);
  } catch (error) {
    logger.error(
      error.response ? error.response.data : error.message,
      "Erro ao enviar mensagem para o Telegram:"
    );
  }
}
