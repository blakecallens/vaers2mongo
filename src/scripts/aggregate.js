const _ = require('lodash');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'vaers';
const collectionName = 'events';

(async () => {
  await client.connect();
  const db = client.db(dbName);
  const events = db.collection(collectionName);

  console.log('Aggregating...');
  const pipeline = require(`../aggregations/${process.argv[2]}`);
  let result;
  // If the pipline is an aggregation array handle it here.
  // Otherwise, run it as a function.
  if (_.isArray(pipeline)) {
    result = await events.aggregate(pipeline).toArray();
  } else if (_.isFunction(pipeline)) {
    result = await pipeline(events);
  }
  
  if (result[0]?._id) {
    // Series export
    // console.log(JSON.stringify(_.map(result, item => ({
    //   name: item._id,
    //   y: item.total,
    // }))));
    // Labels and values export
    console.log(JSON.stringify({
      labels: _.map(result, '_id'),
      values: _.map(result, 'total'),
    }));
  }
  
  process.exit();
})();