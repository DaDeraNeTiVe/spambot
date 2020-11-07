const { Telegraf } = require('telegraf');
const root = require('./root');
const message = require('./message');
const mailing = require('./mailing');
const bot = require('./bot');
const stats = require('./stats');
const horoscope = require('./horoscope');

let menus = {
    root,
    message,
    mailing,
    bot,
    stats,
    horoscope,
    yesNo(b, {yesAction, noAction}, m) {
        return [
            [ b( 'Да', yesAction) ],
            [ b( 'Нет', noAction) ],
        ];
    }
}

function getCustomButtonsMenu(getButtons, session = {}) {
    let menu = Telegraf.Extra
        .markdown()
        .markup(m => {
            const b = m.callbackButton;
            return m.inlineKeyboard(getButtons(b, session, m));
        });

    return menu;
}

function getMenu(code, session = {}) {
    let getButtons = menus[code];
    if (!getButtons) {
        return null;
    }

    return getCustomButtonsMenu(getButtons, session);
}

function getYesNoMenu(yesAction, noAction) {
    return getMenu('yesNo', {yesAction, noAction});
}

module.exports = {getCustomButtonsMenu, getMenu, getYesNoMenu}