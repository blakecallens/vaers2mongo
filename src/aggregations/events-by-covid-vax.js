// Returns the total number of events per vaccine

module.exports = [
  {
    $match: { 'vaccine.vaxName': /covid19/i },
  },
  {
    $group: {
      _id: '$vaccine.vaxName',
      total: { $sum: 1 },
    },
  },
];
