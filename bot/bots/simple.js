const { Telegraf } = require('telegraf');
const BOT_TOKEN = "1407429211:AAF0Etp7vkVQXsVbwSZLVI-Od4uAdTCdwHI";


let menu = Telegraf.Extra
    .markdown()
    .markup(m => {
        const b = m.callbackButton;
        return m.inlineKeyboard([
            [b('1', 'action_1'), b('2', 'action_2')],
            [b('3', 'action_3')]
        ]);
    });


let app = new Telegraf(BOT_TOKEN);
app.start(ctx => {
   ctx.reply('Пиррвет', menu);
});

app.hears(/а+/, ctx => {
    ctx.reply('не кричи');
});

app.command('admin', ctx => {
    ctx.reply('....оу, перед нами сам')
});

app.on('message', (ctx) => {
    ctx.reply('не понятно ничего');
});

app.action(/action_(\d+)/, ctx => {
    let actionCode = ctx.match[1];
    ctx.reply(`${actionCode}!!!!`);
});

app.launch();
