const { Telegraf } = require('telegraf');
const {getDb} = require('../modules/Database');
const {initManagers} = require('../managers');
const MongoSession = require('telegraf-session-mongo');
const applyRoutes = require('../routers/horoscope');
const {getMenu} = require('../menus');
const {__} = require('../modules/Messages');

const BOT_TOKEN = process.env.BOT_TOKEN;

let app = new Telegraf(BOT_TOKEN);


let menu = Telegraf.Extra
.markdown()
    .markup(m => {
        const b = m.callbackButton;
        return m.inlineKeyboard([
            [b('1', 'aries'), b('taurus', 'action_2'), b('gemini', 'action_3')],
            [b('cancer', 'action_4'), b('leo', 'action_5'), b('virgo', 'action_6')],
            [b('libra', 'action_7'), b('scorpio', 'action_8'), b('sagittarius', 'action_9')],
            [b('capricorn', 'action_10'), b('aquarius', 'action_11'), b('pisces', 'action_12')]
        ]);
    });

app.start(ctx => {
    ctx.reply('Ты в нашем гороскоп-мире :)', menu);
});

app.action(/action_(\d+)/, ctx => {
    let actionCode = ctx.match[1];
    ctx.reply('....оу, перед нами сам' + `${actionCode}`)
});

Promise.all([
    initManagers(['horoscope', 'chat']),
    getDb()
])
    .then(([{horoscope, chat}, db]) => {
        const session = new MongoSession(db, {});
        session.setup().then(() => {

            app.use(session.middleware);

            app.start(async (ctx) => {
                const chatInfo = ctx.update.message.chat;
                await chat.saveChat(chatInfo);

                ctx.session = {
                    userId: chatInfo.id,
                };

                return ctx.replyWithMarkdown( __('horoscope_startMessage'), getMenu('horoscope', ctx.session) );
            });

            applyRoutes(app);
            app.launch();


        });
    });
