const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/webhook", async (req, res) => {
  try {
    // Obtenemos el texto del intent (ajusta si tu intent lo estructura diferente)
    const userText = req.body.fulfillmentInfo?.tag || "Hola, ¿cómo estás?";

    // Llamamos a Gemini API
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: userText }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
      }
    );

    const geminiReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No se obtuvo respuesta.";

    // Formato de respuesta para Dialogflow CX Webhook
    res.json({
      fulfillment_response: {
        messages: [
          {
            text: {
              text: [geminiReply],
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error en el webhook:", error.response?.data || error.message);

    res.json({
      fulfillment_response: {
        messages: [
          {
            text: {
              text: ["Hubo un error al procesar la solicitud."],
            },
          },
        ],
      },
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor webhook escuchando en el puerto ${PORT}`);
});
