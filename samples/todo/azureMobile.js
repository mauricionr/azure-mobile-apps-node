// ----------------------------------------------------------------------------
// Copyright (c) 2015 Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------

// This contains all the defaults right now and is just an example.  You
// only need to include the differences between the defaults and your
// settings.  You can see all the settings at http://azure.github.io/azure-mobile-apps-node/global.html#configuration

var winston = require('winston');

module.exports = {
    // Use this to disable the version header that is sent out
    //version: undefined,

    // Use this to skip the API version check
    //skipVersionCheck: true,

    logging: {
        // Override for the Winston transports
        // for more info, see https://github.com/winstonjs/winston/blob/master/docs/transports.md
        transports: [
            new winston.transports.Console({ colorize: true, timestamp: true })
        ],

        // The debug level can be one of 'debug, 'info', 'verbose' and defines
        // the minimum level to be logged.  By default, it is set to 'info' or
        // 'debug' depending on the setting of the MS_DebugMode app settings or
        // the debug switch (when running locally)
        level: 'verbose'
    },

    // CORS is configured in the Azure App Service normally.  This setting is only for
    // local development outside of Azure App Service
    cors: {
        origins: [
            'localhost'
        ]
    },

    // See http://azure.github.io/azure-mobile-apps-node/global.html#dataConfiguration
    // Normally this is not required for Azure hosted environments - we pick it up
    // from the ConnectionString for SQL Azure in the App Settings of the Azure Portal
    //data: {
    //  provider: 'mssql',
    //  server: 'localhost',
    //  database: 'my-mobile-app',
    //  user: 'db-username',
    //  password: 'db-password'
    //},

    // See http://azure.github.io/azure-mobile-apps-node/global.html#notificationsConfiguration
    // Normally this is not required for Azure hosted environments as it is in the
    // App Settings in the Azure Portal
    //notifications: {
    //  hubName: 'your-hub-name',
    //  connectionString: 'your-nh-connection-string'
    //},

    // See http://azure.github.io/azure-mobile-apps-node/global.html#authConfiguration
    // As with the other sensitive information, this is normally set within the Azure
    // Portal in App Settings.
    //auth: {
    //  secret: 'my-zumo-secret',
    //  expires: 1440 // in seconds
    //}

    // Provide a home page for the project
    homePage: true,

    // Set to true to enable Swagger support
    //  Swagger Endpoint: /swagger
    //  Swagger UI: /swagger/ui
    swagger: true
};
