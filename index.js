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
// ✅ GET-запит для отримання даних з GAS
app.get("/data", async (req, res) => {
  try {
    const response = await fetch(GAS_URL);
    const text = await response.text(); // спочатку як текст
    console.log("📦 Відповідь від GAS (/data):", text);

    try {
      const json = JSON.parse(text); // пробуємо розпарсити
      res.json(json);
    } catch (parseError) {
      console.error("❌ JSON parse error (/data):", parseError.message);
      res.status(500).json({ success: false, error: "Invalid JSON from GAS" });
    }

  } catch (err) {
    console.error("❌ ПОМИЛКА GET /data:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ✅ Обробка GET-запиту на /last-id — отримати останній ID з таблиці
app.get("/last-id", async (req, res) => {
  try {
    const response = await fetch(GAS_URL); // doGet Apps Script
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      if ("lastId" in data) {
        res.json({ lastId: data.lastId });
      } else {
        throw new Error("Поле lastId не знайдено у відповіді");
      }
    } catch (parseError) {
      console.error("❌ JSON parse error (/last-id):", parseError.message);
      res.status(500).json({ success: false, error: "Некоректний JSON від GAS" });
    }
  } catch (err) {
    console.error("❌ ПОМИЛКА GET /last-id:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


//************************************************************************************** */
// ✅ Отримання прайсу товарів для категорій (проксі для category.js)
app.get("/getPrice", async (req, res) => {
  try {
    const response = await fetch(GAS_URL);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (parseError) {
      console.error("❌ JSON parse error (/getPrice):", parseError.message);
      res.status(500).json({ success: false, error: "Невірний JSON у відповіді від GAS" });
    }

  } catch (err) {
    console.error("❌ ПОМИЛКА GET /getPrice:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ✅ Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy-сервер запущено на порту ${PORT}`);
});
