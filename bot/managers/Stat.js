const {getDb} = require('../modules/Database');
//const ChartjsNode = require('chartjs-node');
const moment = require('moment');

let statInstance = null;

function StatManager() {
    return {
        async init(dbName, dateField) {
            this.dbName = dbName || false;
            this.dateField = dateField || 'date_registered';

            return this;
        },
        async getUsersStat(fromMoment, toMoment, type = 'd') {
            const db = await getDb(this.dbName);
            let aggrFormat;

            switch (type) {
                case 'h':
                    aggrFormat = "%H";
                    break;
                case 'd':
                    aggrFormat = "%d.%m.%Y";
                    break;
                case 'm':
                    aggrFormat = "%m.%Y";
                    break;
                case 'y':
                    aggrFormat = "%Y";
                    break;
                default:
                    aggrFormat = "%d.%m.%Y";
                    break;
            }

            let cond1 = {};
            let cond2 = {};
            
            cond1[this.dateField] = {$gte: fromMoment.unix()};
            cond2[this.dateField] = {$lte: toMoment.unix()};
            let filter = {
                "$and": [cond1, cond2]
            };

            let stat = await db.collection('chats')
                .aggregate([
                    {$match: filter},
                    {
                        $project: {
                            "id": true,
                            "date": { $toDate: {$multiply: [{$toDecimal: "$"+this.dateField}, 1000] } },
                        }
                    },
                    {
                        $project: {
                            "id": true,
                            "date": { $dateToString: { format: aggrFormat, date: "$date" } },
                        }
                    },
                    {
                        $group: {
                            "_id": "$date",
                            "date": {$min: "$date"},
                            "count": {$sum: 1},
                        }
                    },
                    {$sort: {"date": 1}}
                ])
                .toArray();

            return stat || false;
        },
        async drawChart(stat, label) {
            let labels = stat.map(item => item._id);
            let data = stat.map(item => item.count);

            let chatParams = {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {label, data},
                    ],
                },
                options: {},
            };

            // let chat = new ChartjsNode(600, 600);
            // await chat.drawChart(chatParams);
            //
            // return chat.getImageBuffer('image/png');
            return null;
        }
    }
}

function getInstance() {
    if (statInstance) {
        return statInstance;
    }

    statInstance = new StatManager();
    return statInstance;
}

module.exports = getInstance;
