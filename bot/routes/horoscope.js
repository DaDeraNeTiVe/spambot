const {__} = require('../modules/Messages');
const {getManager} = require('../managers');

module.exports = {
    async random(ctx) {
        let horoscopeManager = await getManager('horoscope');

        let types = horoscopeManager.listTypes();
        let randomIndex = Math.floor(Math.random()*types.length);
        let randomType = types[randomIndex];
        let sign = horoscopeManager.getSignByCode('capricorn');

        let horoscope = await horoscopeManager.getTodayHoroscope(randomType.code, sign.code);

        return ctx.replyWithMarkdown(__('horoscope', {
            date: horoscope.date,
            sign: sign.title,
            type: randomType.title.toLowerCase(),
            text: horoscope.text,
        }));
    },
}