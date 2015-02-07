# webSqlTracer
Console tracer for Web SQL or SQLite. Somebody had to make one.

#Table of contents

# Demo

[demo](https://github.com/terikon/webSqlTracer/tree/master/demo) folder contains simple html page that uses Web SQL. webSqlTracer is used to trace what's going on. 

# Install

Download **webSqlTracer.js** from Github [master](https://raw.githubusercontent.com/terikon/webSqlTracer/master/webSqlTracer.js).

Include it in your page.

webSqlTracer depends on [jquery](http://jquery.com/download) and [underscore](http://underscorejs.org/) libraries, so include them as well.

```html
<script src="jquery.min.js"></script>
<script src="underscore-min.js"></script>
<script src="webSqlTracer.js"></script>
```

This will create global **webSqlTracer** object to start your tracer. 

# Use

**webSqlTracer** object is used to start and stop tracing.

# API

<a name="webSqlTracer-traceOnOpen"></a>
[webSqlTracer.traceOnOpen(tracePredicate, traceCallback)](#webSqlTracer-traceOnOpen) starts listening to database open. When database matches *tracePredicate*, will immediately start tracing it.

```js
webSqlTracer.traceOnOpen('MyDatabase');

//Somewhere later
var db = openDatabase('MyDatabase', '1.0', 'MyDatabase', 2 * 1024 * 1024);
//Trace is active here
```

*tracePredicate* can be a string or a function. When string, database name will be matched to it. When function, it will be called on each database open with dbName as parameter. Return true to match.

```js
webSqlTracer.traceOnOpen(function (name) { return name.indexOf("My") === 0; });
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


## AMD

webSqlTracer can be used with [requirejs](http://requirejs.org/).

'jquery' and 'underscore' libraries should be configured with requirejs. The usage is simple:

```js
define(['webSqlTracer'], function (webSqlTracer) {
	//Use webSqlTracer here
}
``` 

# Things to consider for future versions

- Add library to cdnjs
- Build the minified library with Grunt
- Add tests
- Make it visible when transaction start/commit/fail. Print transaction ids to distinguish transactions.