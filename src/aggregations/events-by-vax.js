// Returns the total number of events per vaccine

module.exports = [
  {
    $group: {
      _id: '$vaccine.vaxName',
      total: { $sum: 1 },
    },
  },
];
