// Returns the total number of reports per year

module.exports = [
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