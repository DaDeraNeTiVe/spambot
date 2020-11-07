const { Telegraf } = require('telegraf');

module.exports = {
    md: Telegraf.Extra.markdown(),
    html: Telegraf.Extra.HTML(),
}