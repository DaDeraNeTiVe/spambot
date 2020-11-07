const {__} = require('../modules/Messages');
let horoscopeRoutes = require('../routes/horoscope');

const routes = [
    { code: 'horoscope', handler: horoscopeRoutes.random },
];

const events = [
    { code: 'message', handler: (ctx) => {
            return ctx.replyWithMarkdown(__('unknownMessage'));
        }},
]

module.exports = function (app) {
    for (const route of routes) {
        app.action(route.code, route.handler);
    }

    for (const event of events) {
        app.on(event.code, event.handler);
    }

    return app;
}