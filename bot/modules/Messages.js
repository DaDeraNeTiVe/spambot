const messages = require('../messages');

function getTemplate(code) {
    return messages[code] || '';
}

function escapeMarkdown(text) {
    //см. https://core.telegram.org/bots/api#markdownv2-style

    let pairedSymbols = [
        {from: '*', to: '@@asterisk@@'},
        {from: '__', to: '@@underline@@'},
        {from: '_', to: '@@underscore@@'},
        {from: '~', to: '@@strikethrough@@'},
        {from: '```', to: '@@blockcode@@'},
        {from: '`', to: '@@inlinecode@@'},
    ];

    let allSymbols = pairedSymbols.concat([
        {from: '[', to: '@@lsqb@@'},
        {from: ']', to: '@@rsqb@@'},
        {from: '(', to: '@@lcrb@@'},
        {from: ')', to: '@@rcrb@@'},
    ]);

    let safeText = text;
    for (const replacement of pairedSymbols) {
        let fromRegexp = new RegExp("\\"+replacement.from+"(.*?)\\"+replacement.from, 'gms');
        let toExp = replacement.to+'$1'+replacement.to;

        safeText = safeText.replace( fromRegexp, toExp );
    }

    safeText = safeText.replace(
        /\[(.*?)\]\((.*?)\)/g,
        '@@lsqb@@$1@@rsqb@@@@lcrb@@$2@@rcrb@@'
    );

    safeText = safeText.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

    for (const replacement of allSymbols) {
        let allRegexp = new RegExp( "\\"+replacement.to, 'g' );
        safeText = safeText.replace(allRegexp, replacement.from);
    }

    return safeText;
}

function getMessage(code, data = {}) {
    let message = getTemplate(code);

    for (const key in data) {
        const value = data[key];

        let replaceRegexp = new RegExp(`%${key}%`, 'g');
        message = message.replace(replaceRegexp, value);
    }

    if (!message) {
        message = code;
    }

    return message;
}

module.exports = {
    __: getMessage,
    __md: (code, data = {}) => escapeMarkdown(getMessage(code, data)),
}