const { Telegraf } = require('telegraf');
const BOT_TOKEN = "1407429211:AAF0Etp7vkVQXsVbwSZLVI-Od4uAdTCdwHI";


let app = new Telegraf(BOT_TOKEN);
app.start(ctx => {
   ctx.reply('Пиррвет');
});

app.hears('пиивет', ctx => {
    ctx.reply('и кто тут тормоз?');
});

app.launch();
