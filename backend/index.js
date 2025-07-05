import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// ✅ Правильна CORS-конфігурація для Netlify-домену
const corsOptions = {
  origin: "https://sifttime-widget.netlify.app",
  methods: "GET,POST",
  allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.use(express.json());

// 🔗 URL до Google Apps Script
const GAS_URL = "https://script.google.com/macros/s/AKfycby8ai7RA8_n59aY7ZC3Ni-Vm9YQyCJKNmg0YelpYu0oUjAkeX1o_AtJABjZCdyDu2xj/exec";

// 📤 Обробка повної форми
app.post("/send", async (req, res) => {
  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();
    console.log("📦 Відповідь від GAS:", text);
    res.json(JSON.parse(text));
  } catch (err) {
    console.error("❌ ПОМИЛКА на сервері:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🟡 Альтернативний маршрут — лише для числа
app.post("/writeNumber", async (req, res) => {
  try {
    const payload = {
      surname: "",
      name: "",
      patronymic: "",
      number: req.body.value || 0
    };

    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log("📦 Відповідь (writeNumber):", text);
    res.json(JSON.parse(text));
  } catch (err) {
    console.error("❌ ПОМИЛКА /writeNumber:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET-запит для отримання структури з таблиці
app.get("/", async (req, res) => {
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ ПОМИЛКА GET /:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});




// ✅ Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy-сервер запущено на порту ${PORT}`);
});
