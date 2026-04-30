const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// حط توكن بوتك هنا
const token = '8731162959:AAGZcy4RB4waZRYNgZtFVRwY_YYmW8p-ztg';
const bot = new TelegramBot(token, {polling: true});

console.log("✅ LYNX Skipper is active!");

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "أهلاً بك في LYNX Skipper 🐆\nأرسل لي أي رابط مختصر وسأحاول تخطيه لك.");
});

bot.on('message', async (msg) => {
    const text = msg.text;

    // التأكد أن الرسالة تحتوي على رابط
    if (text && (text.startsWith('http') || text.includes('link'))) {
        bot.sendMessage(msg.chat.id, "⏳ جاري محاولة التخطي... انتظر ثواني.");

        try {
            // استخدام API مجاني للتخطي (بإمكانك تغييره لاحقاً)
            const response = await axios.get(`https://api.bypass.vip/bypass?url=${encodeURIComponent(text)}`);
            
            if (response.data && response.data.destination) {
                bot.sendMessage(msg.chat.id, `✅ تم التخطي بنجاح!\n\n🔗 الرابط الأصلي:\n${response.data.destination}`);
            } else {
                // إذا فشل الـ API، نحاول نجيب الرابط النهائي عن طريق تتبع التحويلات
                const res = await axios.get(text, { maxRedirects: 5 });
                bot.sendMessage(msg.chat.id, `🔗 الرابط النهائي المحتمل:\n${res.request.res.responseUrl}`);
            }
        } catch (error) {
            bot.sendMessage(msg.chat.id, "❌ عذراً، لم أتمكن من تخطي هذا الرابط. قد يكون محمي بشكل قوي.");
        }
    }
});
