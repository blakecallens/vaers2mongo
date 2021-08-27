// Returns the total number of reports matching at least one term, by year

const _ = require('lodash');

const searches = [
  'cerebrovascular accident',
  'stroke',
  'thrombosis',
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
];
