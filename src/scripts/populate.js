const DataCompiler = require('../services/data-compiler');

(async () => {
  const compiler = new DataCompiler();
  await compiler.loadData();
})();