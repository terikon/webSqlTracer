# Web SQL Tracer
Console tracer for Web SQL or SQLite.

If your web project uses SQL in some form, tracing functionality might be helpful to you. webSqlTracer provides means to see SQL commands that your project runs printed in console, just like this:

```js
//Somewhere deep in your program
tx.executeSql('INSERT INTO ' + tableName + ' (id, text) VALUES (?, ?)', [ id, inputValue ]);
```
Let's see the console
```
'INSERT INTO foo (id, text) VALUES (?, ?)', args=[12, "user just typed this"]
```

webSqlTracer can trace database access to [Web SQL](http://html5doctor.com/introducing-web-sql-databases/), as well as access to [Phonegap SQLite plugin](https://github.com/brodysoft/Cordova-SQLitePlugin).

We found it very useful to work with [JayData data access library](http://jaydata.org/) as well.

#Table of contents

- [Install](#install)
- [Use](#use)
- [Demo](#demo)
- [API](#api)
	- [traceOnOpen()](#webSqlTracer-traceOnOpen)
	- [stopTraceOnOpen()](#webSqlTracer-stopTraceOnOpen)
	- [startTrace()](#webSqlTracer-startTrace)
	- [stopTrace()](#webSqlTracer-stopTrace)
- [AMD](#amd)
- [Node module](#node-module)
- [Things to consider for future versions](#things-to-consider-for-future-versions)
- [Contribute](#contribute)

# Install

To install with npm, you can

```
npm install websqltracer
```

Or you can download **webSqlTracer.js**
[minified](https://raw.githubusercontent.com/terikon/webSqlTracer/master/dist/webSqlTracer.min.js) or
[source](https://raw.githubusercontent.com/terikon/webSqlTracer/master/webSqlTracer.js)
from Github, and include it in your page.

webSqlTracer depends on [jquery](http://jquery.com/download) and [underscore](http://underscorejs.org/) libraries, so include them as well.

```html
<!-- Dependencies -->
<script src="jquery.min.js"></script>
<script src="underscore-min.js"></script>
<!-- The webSqlTracer library itself -->
<script src="webSqlTracer.min.js"></script>
```

This will create global **webSqlTracer** object to start your tracer.

You can include webSqlTracer to your page with **CDN**:

```html
<!-- Dependencies -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.1/underscore-min.js"></script>
<!-- The webSqlTracer library itself -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/websqltracer/1.0.1/webSqlTracer.min.js"></script>
``` 

# Use

**webSqlTracer** object is used to start and stop tracing.

Let's say we have some program that accesses Web SQL, and we want to trace database access.

Here's the program:

```js
//Here we initialize the database
var db = openDatabase('MyDatabase', '1.0', 'MyDatabase', 2 * 1024 * 1024);

//Here we create and fill the database
db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE foo (id unique, text)');
    tx.executeSql('INSERT INTO foo (id, text) VALUES (1, "hardcoded value")');
    tx.executeSql('INSERT INTO foo (id, text) VALUES (2, ?)', ["parametrized value"]);
});

//Here we selecte values from the database
db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
        var len = results.rows.length, i;
        for (i = 0; i < len; i++) {
            console.log(results.rows.item(i).text);
        }
    });
});
```

This is very simple example, so we just can actually see from code what SQL commands are executed. In real-world program it will be much more trickier to understand, that's where webSqlTracer comes to help.

To trace our simple program, we just add one little line to its start:

```js
webSqlTracer.traceOnOpen('MyDatabase');
```

Now, when the program runs, following will be printed to the console:

```
SQL TRACE : started tracing database MyDatabase version '1.0'
SQL TRACE MyDatabase: 'CREATE TABLE foo (id unique, text)'
SQL TRACE MyDatabase: 'INSERT INTO foo (id, text) VALUES (1, "hardcoded value")'
SQL TRACE MyDatabase: 'INSERT INTO foo (id, text) VALUES (2, ?)', args=["parametrized value"]
SQL TRACE MyDatabase: 'SELECT * FROM foo'
```

It's now easy to see what's going on with database just by analyzing the console.

# Demo

[demo](https://github.com/terikon/webSqlTracer/tree/master/demo) folder contains simple html page that uses Web SQL. webSqlTracer is used to trace what's going on, just like you've just seen.

# API

<a name="webSqlTracer-traceOnOpen"></a>
[webSqlTracer.traceOnOpen(tracePredicate, traceCallback)](#webSqlTracer-traceOnOpen) starts trace when database opens. When database matches *tracePredicate*, will immediately start tracing it.

```js
webSqlTracer.traceOnOpen('MyDatabase');

//Somewhere later
var db = openDatabase('MyDatabase', '1.0', 'MyDatabase', 2 * 1024 * 1024);
//Trace is active here
```

*tracePredicate* can be a string or a function. When string, database name will be matched to it. When function, it will be called on each database open with dbName as parameter. Return true to match.

```js
webSqlTracer.traceOnOpen(function (name) { return name.indexOf("My") === 0; });
//All databases which name starts with "My" will be traced. 
```

*traceCallback* is a way to subscribe to event of trace start. db will be provided as argument to the callback. This might be useful to stop trace for specific database.

```js
var traceDbs = [];
webSqlTracer.traceOnOpen('MyDatabase', function (db) { traceDbs.push(db); });

//And later on...
webSqlTracer.stopTrace(traceDb[0]);
```

<a name="webSqlTracer-stopTraceOnOpen"></a>
[webSqlTracer.stopTraceOnOpen()](#webSqlTracer-stopTraceOnOpen) stops listening to database open.

<a name="webSqlTracer-startTrace"></a>
[webSqlTracer.startTrace(db, dbName, dbVersion)](#webSqlTracer-startTrace) starts trace for provided db object. *dbName* and *dbVersion* are optional parameters used to pretty-print the results.

The method returns promise to indicate when trace is ready.

```js
var db = openDatabase('MyDatabase', '1.0', 'MyDatabase', 2 * 1024 * 1024);
webSqlTracer.startTrace(db, 'MyDatabase').then(function () {
	//we have our tracer ready here
});
```

<a name="webSqlTracer-stopTrace"></a>
[webSqlTracer.stopTrace(db)](#webSqlTracer-stopTrace) stops trace that was previously started with [startTrace](#webSqlTracer-startTrace).


# AMD

webSqlTracer can be used with [requirejs](http://requirejs.org/).

'jquery' and 'underscore' libraries should be configured with requirejs. The usage is simple:

```js
define(['webSqlTracer'], function (webSqlTracer) {
	//Use webSqlTracer here
}
``` 

# Node module

webSqlTracer can also be loaded as node.js module:

```js
var webSqlTracer = require('websqltracer');
```

# Things to consider for future versions

- ~~Add library to cdnjs~~
- ~~Build the minified library with Grunt~~
- Add tests
- Make it visible when transaction start/commit/fail. Print transaction ids to distinguish between transactions
- Add profiling information (how much time the query runs)

# Contribute

Use [GitHub issues](https://github.com/terikon/webSqlTracer/issues) and [Pull Requests](https://github.com/terikon/webSqlTracer/pulls).

Ideas are wellcome as well :)

To build:
	
	npm run build

Before comitting, please run jshint:

	npm run jshint
