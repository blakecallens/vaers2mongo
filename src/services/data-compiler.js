const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');
const parse = require('csv-parse/lib/sync');
const { MongoClient } = require('mongodb');
const Config = require('../../config.json');

const client = new MongoClient(Config.MONGO_URL);

class DataCompiler {
  async loadData () {
    await client.connect();
    const db = client.db(Config.DB_NAME);
    this.events = db.collection(Config.COLLECTION_NAME);
    await this.events.deleteMany({});

    for (let year = 1990; year <= new Date().getFullYear(); year++) {
      try {
        await this.loadYear(year);
      } catch (err) {
        console.warn(`Error loading ${year}`, err);
      }
    }
  }
  
  async loadYear (year) {
    console.log(`Loading CSVs for ${year}...`);
    const files = [
      path.join(process.cwd(), 'data', `${year}VAERSDATA.csv`),
      path.join(process.cwd(), 'data', `${year}VAERSSYMPTOMS.csv`),
      path.join(process.cwd(), 'data', `${year}VAERSVAX.csv`),
    ];

    const [data, symptoms, vax] = files.map(file => parse(fs.readFileSync(file), { columns: true, skipEmptyLines: true }));
    console.log(`Loaded CSVs for ${year}`);
    for (let ii = 0; ii < data.length; ii++) {
      console.log(`Compiling data for ${year} event ${ii + 1} of ${data.length}`);
      const item = this.formatItem(data[ii]);
      this.fixDates(item);
      item.symptoms = this.formatItem(_.find(symptoms, { VAERS_ID: data[ii].VAERS_ID }));
      item.vaccine = this.formatItem(_.find(vax, { VAERS_ID: data[ii].VAERS_ID }));
      await this.events.insertOne(item);
    }
  }

  formatItem (item) {
    if (!item) {
      return item;
    }

    return _.reduce(_.keys(item), (memo, key) => {
      memo[_.camelCase(key)] = item[key];
      return memo;
    }, {});
  }

  fixDates (item) {
    const fields = ['recvdate', 'rptdate', 'datedied', 'vaxDate', 'onsetDate', 'todaysDate'];
    _.forEach(fields, field => {
      item[field] = this.parseDate(item[field]);
    });
  }

  parseDate (dateString) {
    if (_.isEmpty(dateString)) {
      return null;
    }
    return DateTime.fromFormat(dateString, 'MM/dd/yyyy', { zone: 'utc' }).toJSDate();
  }
}

module.exports = DataCompiler;
