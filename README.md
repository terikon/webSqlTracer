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

<a name="webSqlTracer-startTrace"></a>
[webSqlTracer.startTrace(db, dbName, dbVersion)](#webSqlTracer-startTrace) starts

<a name="webSqlTracer-stopTrace"></a>
[webSqlTracer.stopTrace()](#webSqlTracer-stopTrace) starts

<a name="webSqlTracer-traceOnOpen"></a>
[webSqlTracer.traceOnOpen(tracePredicate, traceCallback)](#webSqlTracer-traceOnOpen) starts

<a name="webSqlTracer-stopTraceOnOpen"></a>
[webSqlTracer.stopTraceOnOpen()](#webSqlTracer-stopTraceOnOpen) stops

## AMD

webSqlTracer can be used with [requirejs](http://requirejs.org/).

'jquery' and 'underscore' libraries should be configured with requirejs. The usage is simple:

```js
define(['webSqlTracer'], function (webSqlTracer) {
	//Use webSqlTracer here
}
``` 


TODO

# TODO

- Add to cdnjs
- Build the library with Grunt
- Add tests
- Tracing transaction start/commit/fail, with transaction ids