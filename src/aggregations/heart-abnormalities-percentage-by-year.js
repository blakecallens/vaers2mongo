// Returns the total number of reports matching at least one term, by year

const _ = require('lodash');

const searches = [
  'arrhythmia',
  'atrial fibrillation',
  'cardiac arrest',
  'cardiac flutter',
  'electrocardiogram abnormal',
  'heart rate irregular',
  'myocardial infarction',
  'myocarditis',
  'palpitations',
  'tachycardia',
];

module.exports = async (events) => {
  const allEvents = await events.aggregate([
    {
      $group: {
        _id: { $year : '$recvdate' },
        total: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]).toArray();

  const clotEvents = await events.aggregate([
    {
      $match: {
        $or: _.flatten(_.map(searches, search => {
          const regExp = new RegExp(search, 'i');
          return [
            { 'symptoms.symptom1': regExp },
            { 'symptoms.symptom2': regExp },
            { 'symptoms.symptom3': regExp },
            { 'symptoms.symptom4': regExp },
            { 'symptoms.symptom5': regExp },
          ];
        }))
      },
    },
    {
      $group: {
        _id: { $year : '$recvdate' },
        total: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]).toArray();

  return _.reduce(allEvents, (memo, all) => {
    const clotYear = _.find(clotEvents, { _id: all._id });
    memo.push({ _id: all._id, total: ((clotYear?.total || 0) / all.total) * 100 });
    return memo;
  }, []);
};
