// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/**
The azure-mobile-apps logging framework, configured using {@link loggingConfiguration}
@module azure-mobile-apps/src/logger
*/
var winston = require('winston'),
    logger = new (winston.Logger)();

/**
Exports an instance of a winston logger with the additional members described below.
@see {@link https://github.com/winstonjs/winston}
*/
module.exports = logger;