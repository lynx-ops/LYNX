const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '8731162959:AAGZcy4RB4waZRYNgZtFVRwY_YYmW8p-ztg';
const bot = new TelegramBot(token, { polling: true });

console.log("✅ LYNX Skipper is active!");

// دالة للتحقق من الرابط
const isValidUrl = (text) => {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
};

// رسالة الترحيب
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    "أهلاً بك في LYNX Skipper 🐆\nأرسل لي أي رابط مختصر وسأحاول تتبعه لك."
  );
});

// معالجة الرسائل
bot.on('message', async (msg) => {
  const text = msg.text;

  // تجاهل الأوامر
  if (!text || text.startsWith('/')) return;

  // التحقق من الرابط
  if (!isValidUrl(text)) {
    return bot.sendMessage(msg.chat.id, "⚠️ من فضلك أرسل رابطاً صحيحاً يبدأ بـ http أو https.");
  }

  await bot.sendMessage(msg.chat.id, "⏳ جاري تتبع الرابط... انتظر ثواني.");

  try {
    // المحاولة الأولى: bypass.vip API
    const apiRes = await axios.get(
      `https://api.bypass.vip/bypass?url=${encodeURIComponent(text)}`,
      { timeout: 8000 }
    );

    if (apiRes.data?.destination) {
      return bot.sendMessage(msg.chat.id,
        `✅ تم بنجاح!\n\n🔗 الرابط النهائي:\n${apiRes.data.destination}`
      );
    }

    throw new Error("No destination found");

  } catch {
    // المحاولة الثانية: تتبع التحويلات يدوياً
    try {
      const res = await axios.get(text, {
        maxRedirects: 10,
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const finalUrl = res.request?.res?.responseUrl || res.config?.url;

      if (finalUrl && finalUrl !== text) {
        return bot.sendMessage(msg.chat.id,
          `🔗 الرابط النهائي:\n${finalUrl}`
        );
      }

      bot.sendMessage(msg.chat.id, "ℹ️ الرابط لا يحتوي على تحويلات.");

    } catch (err) {
      bot.sendMessage(msg.chat.id,
        `❌ فشل التتبع.\nالسبب: ${err.message || "خطأ غير معروف"}`
      );
    }
  }
});
