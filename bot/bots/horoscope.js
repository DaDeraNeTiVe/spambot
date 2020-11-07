const { Telegraf } = require('telegraf');
const {getDb} = require('../modules/Database');
const {initManagers} = require('../managers');
const MongoSession = require('telegraf-session-mongo');
const applyRoutes = require('../routers/horoscope');
const {getMenu} = require('../menus');
const {__} = require('../modules/Messages');

const BOT_TOKEN = process.env.BOT_TOKEN;
let app = new Telegraf(BOT_TOKEN);

Promise.all([
    initManagers(['horoscope', 'chat']),
    getDb()
])
    .then(([{chat}, db]) => {
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