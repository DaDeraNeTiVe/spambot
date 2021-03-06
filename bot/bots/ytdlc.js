const { spawn } = require('child_process');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const {initManagers} = require('../managers');
const {wait} = require('../modules/Helpers');

const BOT_TOKEN = process.env.BOT_TOKEN;
let app = new Telegraf(BOT_TOKEN);
let format = 'best[filesize<50M]/worst';

function download(url, onProgress) {
    return new Promise((resolve, reject) => {
        const ytdlc = spawn('youtube-dlc', [url, '--format='+format], {cwd: '/downloads'});
        let filename = false;
        let error = false;

        ytdlc.stdout.on('data', (data) => {
            data = data.toString().trim();
            if (!data) {
                return;
            }

            let isProgress = data.indexOf('[download]') !== -1 && data.indexOf(' at ') !== -1;

            if (isProgress && onProgress) {
                let matches = data.match(/\[download\] *?(\d+\.\d+%) *?of (\d+\.\d+[a-zA-Z]+) .*?ETA (\d+:\d+)/);
                if (matches) {
                    let [, percent, totalSize, etaTime] = matches;
                    onProgress(percent, totalSize, etaTime);
                }
            }
        });
        ytdlc.stderr.on('data', (data) => {
            data = data.toString().trim();
            if (!data) {
                return;
            }

            let isFatal = data.toLowerCase().indexOf('warning') === -1;
            if (isFatal) {
                error = data;
                console.error(data);
            }
        });

        ytdlc.on('exit', (code) => {
            if (code === 0) {
                resolve(filename);
            }
            else {
                reject(error);
            }
        });
        ytdlc.on('error', error => reject(error));
    });
}
function getDownloadFilename(url) {
    return new Promise((resolve, reject) => {
        const ytdlc = spawn('youtube-dlc', ['--get-filename', '--format='+format, url], {cwd: '/downloads'});
        let filename = false;

        ytdlc.stdout.on('data', (data) => {
            filename = data.toString().trim();
        });

        ytdlc.on('exit', (code) => {
            if (code === 0 && filename) {
                resolve(filename);
            }
            else {
                reject({type: 'inner', text: 'Не найдено подходящего формата. Попробуйте другое видео'});
            }
        });
        ytdlc.on('error', error => reject());

    });
}

async function waitForFile(path, maxTimeoutMs = 1000) {
    return new Promise(async (resolve, reject) => {
        let timePassedMs = 0;

        while (timePassedMs < maxTimeoutMs) {
            await wait(100);
            timePassedMs+=100;
            if (fs.existsSync(path)) {
                resolve();
            }
        }

        reject({type: 'inner', text: 'Не удалось сохранить видео. Попробуйте позже'});
    });
}

initManagers(['chat']).then(async ({chat}) => {
    app.use(chat.saveRefMiddleware());
    app.use(chat.saveUserMiddleware());

    app.start(async (ctx) => {
        return ctx.reply('Пришлите ссылку на видео. Максимальный размер файла для бота в Telegram 50Мб.\nБудет загружено видео максимального качества с учетом этого органичения.');
    });

    app.on('message', async ctx => {
        let url = ctx.update.message.text.trim();
        let isValidUrl = url.indexOf('http') === 0;

        if (!isValidUrl) {
            return ctx.reply('Не похоже на ссылку. Для загрузки видео нужна ссылка');
        }

        let messageText = 'Обнаружена ссылка. Начинаю загрузку';
        let prevMessageText = messageText;
        let progressMessage = await ctx.reply(messageText);
        let filename;
        let filePath;

        try {
            filename = await getDownloadFilename(url);
            await download(url, (percent, totalSize, etaTime) => {
                messageText = `Загружаю: ${percent} из ${totalSize}. Осталось ${etaTime}`;
                if (messageText !== prevMessageText) {
                    prevMessageText = messageText;
                    ctx.telegram.editMessageText(
                        progressMessage.chat.id,
                        progressMessage.message_id,
                        undefined,
                        messageText,
                    );
                }
            });

            await ctx.telegram.editMessageText(
                progressMessage.chat.id,
                progressMessage.message_id,
                undefined,
                `Загрузка завершена. Обработка...`,
            );

            filePath = `/downloads/${filename}`;
            await waitForFile(filePath, 5000);
            await ctx.replyWithVideo({source: filePath});
            fs.unlinkSync(filePath);
        }
        catch (e) {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            let isUnsupportedUrl = e && typeof (e) === 'string' && e.toLowerCase().indexOf('unsupported url') !== -1;
            if (isUnsupportedUrl) {
                return ctx.reply('Такие ссылки пока не поддерживаются. Попробуйте другую.');
            }

            if (e && e.type === 'inner') {
                return ctx.reply(e.text);
            }

            if (e && e.code && e.code === 413) {
                return ctx.reply('Видео слишком большое для отправки через Telegram');
            }

            console.error(e);
            return ctx.reply('Ошибка загрузки. Попробуйте еще раз.\n\nPS. Загрузки приватных ссылок не поддерживаются:(');
        }
    });

    app.catch((err, ctx) => {
        console.log(err);
        return ctx.reply('Похоже, что-то пошло не по плану.\nПопробуйте начать занвово /start.');
    });

    app.launch();
});