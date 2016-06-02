var table = module.exports = require('../../../..').table(),
    count = 0;

table.read(function (context) {
    count++;
    context.res.status(200).send({ count: count });
});
