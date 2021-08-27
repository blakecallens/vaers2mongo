// Returns the total number of reports matching at least one term, by vaccine name

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

module.exports = [
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
        ]
      })),
    },
  },
  {
    $group: {
      _id: '$vaccine.vaxName',
      total: { $sum: 1 },
    },
  },
  {
    $sort: { total: 1 },
  },
];
