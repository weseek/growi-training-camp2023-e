const fs = require('fs');
const path = require('path');
const repl = require('repl');

const mongoose = require('mongoose');

const { getMongoUri, mongoOptions } = require('~/server/util/mongoose-utils');

const models = {
  ...require('./models'),
  ...require('~/features/cms/server/models'),
  ...require('~/features/lms/server/models'),
};

Object.keys(models).forEach((modelName) => {
  global[modelName] = models[modelName];
});

mongoose.Promise = global.Promise;

const replServer = repl.start({
  prompt: `${process.env.NODE_ENV} > `,
  ignoreUndefined: true,
});

// add history function into repl
// see: https://qiita.com/acro5piano/items/dc62b94d7b04505a4aca
// see: https://qiita.com/potato4d/items/7131028497de53ceb48e
const userHome = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
const replHistoryPath = path.join(userHome, '.node_repl_history');
fs.readFile(replHistoryPath, 'utf8', (err, data) => {
  if (err != null) {
    return;
  }
  return data.split('\n').forEach((command) => { return replServer.history.push(command) });
});

replServer.context.mongoose = mongoose;
replServer.context.models = models;

mongoose.connect(getMongoUri(), mongoOptions)
  .then(() => {
    replServer.context.db = mongoose.connection.db;
  });

replServer.on('exit', () => {
  fs.writeFile(replHistoryPath, replServer.history.join('\n'), (err) => {
    console.log(err); // eslint-disable-line no-console
    process.exit();
  });
});
