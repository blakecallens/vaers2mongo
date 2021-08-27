// Returns total number of symptoms by name

const _ = require('lodash');

// Minimum number of reports to make the list
const MIMIMUM_COUNT = 500;

module.exports = async (events) => {
  const symptomFields = [
    '$symptoms.symptom1',
    '$symptoms.symptom2',
    '$symptoms.symptom3',
    '$symptoms.symptom4',
    '$symptoms.symptom5',
  ]

  const tallies = await Promise.all(_.map(symptomFields, field =>
    events.aggregate([
      {
        $match: {
          $or: [
            { 'vaccine.vaxName': 'COVID19 (COVID19 (PFIZER-BIONTECH))' },
            { 'vaccine.vaxName': 'COVID19 (COVID19 (MODERNA))' },
          ]
        },
      },
      {
        $group: {
          _id: field,
          total: { $sum: 1 },
        },
      },
    ]).toArray()));

  const result = _.reduce(_.flatten(tallies), (memo, symptom) => {
    if (_.isEmpty(symptom._id)) {
      return memo;
    }

    const existing = _.find(memo, { _id: symptom._id });
    if (existing) {
      existing.total += symptom.total;
    } else {
      memo.push(_.cloneDeep(symptom));
    }
    return memo;
  }, []);

  return _.sortBy(_.filter(result, item => item.total >= MIMIMUM_COUNT), 'total');
};
