'use strict';

//Prints all webSQL and SQLite plugin queries to console.
//Influenced by WebSQL documentation found here: http://www.w3.org/TR/webdatabase/
//Uses https://github.com/umdjs/umd/blob/master/amdWeb.js to make it useful from browser globals as well as from AMD.
//Version 1.0.0.
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'jquery'], factory.bind(null, root));
	} else if (typeof module !== "undefined" && module !== null && module.exports != null) {
        // Node module.
        module.exports.webSqlTracer = factory(root, require('underscore'), require('jquery'));
    } else {
        // Browser globals
        root.webSqlTracer = factory(root, root._, root.jQuery);
    }
}(this,
    //TODO: make it configurable to trace per table.
    function (root, _, $) {

        var originalExecuteSql,
            originalTransaction,
            originalReadTransaction,
            originalOpenDatabase,
            traceOnOpenSet = false,
            dbSubscriptions = [], //dbSubscriptions[x] will contain db object. Index does not matter.
            dbNames = [], //same indexes as dbSubscriptions.
            traceInstalled = false,
            namesCounter = {}; //nameCounters[name] counts previous name occurances

        return {
            //Parameters:
            //  tracePredicate is called with database name as parameter. Can be function or string. In later case it will be matched with === operator.
            //  traceCallback (optional) will be called with db parameter, after startTrace started on it.
            traceOnOpen: function (tracePredicate, traceCallback) {
                var that = this, tracePredicateStr;

                if (traceOnOpenSet) {
                    throw new Error("Call stopTraceOnOpen() before calling traceOnOpen() for second time.");
                }

                traceOnOpenSet = true;

                if (!originalOpenDatabase) {
                    originalOpenDatabase = root.openDatabase;
                }

                if (_.isString(tracePredicate)) {
                    tracePredicateStr = tracePredicate;
                    tracePredicate = function (name) { return name === tracePredicateStr; };
                }

                root.openDatabase = function (name, version) {
                    var db = originalOpenDatabase.apply(this, arguments);

                    if (tracePredicate(name)) {
                        that.startTrace(db, name, version).then(function () {
                            if (traceCallback) {
                                traceCallback(db);
                            }
                        });
                    }

                    return db;
                }
            },

            stopTraceOnOpen: function () {
                if (!traceOnOpenSet) {
                    throw new Error("Cannot call stopTraceOnOpen() before calling traceOnOpen().");
                }

                traceOnOpenSet = false;

                root.openDatabase = originalOpenDatabase;
            },

            //Parameters:
            //  db is object returned from window.openDatabase().
            //      It can be any db, currently trace will be turned on globally for all dbs.
            //  dbName is optional.
            //  dbVersion is optional.
            //returns promise
            startTrace: function (db, dbName, dbVersion) {
                var deferred = new $.Deferred(),
                    protoDatabase,
                    nameCount;

                if (dbName) {
                    nameCount = namesCounter[dbName];
                    if (_.isUndefined(nameCount)) {
                        nameCount = 0;
                    }
                    namesCounter[dbName] = nameCount + 1;

                    if (nameCount > 0) {
                        dbName = dbName + "(" + nameCount + ")";
                    }

                    console.log("SQL TRACE : started tracing database " + dbName + (!_.isUndefined(dbVersion) ? " version '" + dbVersion + "'" : ""));
                }

                if (_.indexOf(dbSubscriptions, db) >= 0) {
                    throw new Error("startTrace was already started for this db");
                }

                if (!traceInstalled) {
                    db.transaction(function (t) { //just nop transaction to access Transaction.prototype.
                        var protoTransaction = Object.getPrototypeOf(t);
                        if (!originalExecuteSql) {
                            originalExecuteSql = protoTransaction.executeSql;
                        }
                        protoTransaction.executeSql = function (sqlStatement, args) {
                            var tx = this,
                                transactionDb = tx._transactionDb,
                                indexOfSubscription = _.indexOf(dbSubscriptions, transactionDb),
                                nameOfSubscription,
                                nameToPrint;

                            if (indexOfSubscription >= 0) {
                                nameOfSubscription = dbNames[indexOfSubscription];
                                nameToPrint = nameOfSubscription || "";
                                console.log("SQL TRACE " + nameToPrint + ": '" + sqlStatement + "'" + (args && !_.isEmpty(args) ? ", args=" + JSON.stringify(args) : ""));
                            }

                            originalExecuteSql.apply(this, arguments);
                        };

                        setTimeout(function () { //make sure resolve will execute last
                            deferred.resolve();
                        }, 0);

                    });

                    protoDatabase = Object.getPrototypeOf(db);
                    if (!originalTransaction) {
                        originalTransaction = protoDatabase.transaction;
                        originalReadTransaction = protoDatabase.readTransaction;
                    }

                    //Higher-order function to generate replacements for transaction() and readTransaction().
                    var makeTransaction = function (originalAnyTransaction) {
                        return function (callback, errorCallback, successCallback) {
                            var transactionDb = this;
                            originalAnyTransaction.call(this, function (t) {
                                //Add database property to t to make executeSql to know what db context we are in.
                                t._transactionDb = transactionDb;

                                callback(t); //Execute original callback parameter of transaction method.
                            }, errorCallback, successCallback);
                        }
                    }

                    protoDatabase.transaction = makeTransaction(originalTransaction);
                    protoDatabase.readTransaction = makeTransaction(originalReadTransaction);

                    traceInstalled = true;
                } else {
                    deferred.resolve(); //resolve immediately
                }

                dbSubscriptions.push(db);
                dbNames.push(dbName);

                return deferred.promise();
            },

            //returns promise
            stopTrace: function (db) {
                var deferred = new $.Deferred(),
                    indexOfSubscription = _.indexOf(dbSubscriptions, db),
                    isLastSubscription,
                    dbName;

                if (indexOfSubscription < 0) {
                    throw new Error("cannot stopTrace, trace was not started for this db");
                }

                isLastSubscription = (dbSubscriptions.length === 1);

                if (isLastSubscription) {
                    //uninstall trace

                    var protoDatabase = Object.getPrototypeOf(db);
                    protoDatabase.transaction = originalTransaction;
                    protoDatabase.readTransaction = originalReadTransaction;

                    //no need to handle readTransaction separately, as t will be of type SQLTransactionCallback in both cases.
                    db.transaction(function (t) {
                        var protoTransaction = Object.getPrototypeOf(t);
                        protoTransaction.executeSql = originalExecuteSql;
                        deferred.resolve();
                    });

                    traceInstalled = false;
                }

                dbName = dbNames[indexOfSubscription];
                console.log("SQL TRACE : stopped tracing database" + (dbName ? " " + dbName : ""));

                //remove subscription from array
                dbSubscriptions.splice(indexOfSubscription, 1);
                dbNames.splice(indexOfSubscription, 1);

                if (!isLastSubscription) {
                    deferred.resolve();
                }

                return deferred.promise();
            }
        };

    }));
