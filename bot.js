const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// استبدل النص التالي بالتوكن الجديد اللي أخذته من BotFather
const token = '8731162959:AAGZcy4RB4waZRYNgZtFVRwY_YYmW8p-ztg'; 
const bot = new TelegramBot(token, {polling: true});

console.log("✅ بوت LYNX شغال بأمان وبدون أخطاء...");

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        return bot.sendMessage(chatId, "أهلاً بك في بوت LYNX! 🐆\nأرسل لي أي رابط مختصر وسأقوم بتخطيه لك فوراً.");
    }

    if (text && text.startsWith('http')) {
        bot.sendMessage(chatId, "⏳ جاري فحص الرابط وتخطيه...");
        try {
            const response = await axios.get(`https://api.bypass.vip/bypass?url=${encodeURIComponent(text)}`);
            if (response.data && response.data.destination) {
                bot.sendMessage(chatId, `✅ تم التخطي بنجاح!\n\n🔗 الرابط المباشر:\n${response.data.destination}`);
            } else {
                bot.sendMessage(chatId, "❌ هذا الرابط غير مدعوم حالياً.");
            }
        } catch (e) {
            bot.sendMessage(chatId, "⚠️ عذراً، حدث خطأ في سيرفر التخطي.");
        }
    }
});
