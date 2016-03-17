/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/monkeyui/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	// Simple ffmpeg web worker based on (https://github.com/bgrins/videoconverter.js/blob/master/demo/worker.js)

	importScripts('../src/ffmpeg.js');

	function print(text) {
	    postMessage({
	        'type' : 'stdout',
	        'data' : text
	    });
	}

	function printErr(text) {
	    postMessage({
	        'type' : 'stderr',
	        'data' : text
	    });
	}
	var now = Date.now;

	onmessage = function(event) {

	  var message = event.data;

	  if (message.type === "command") {

	    var Module = {
	      print: print,
	      printErr: print,
	      files: message.files || [],
	      arguments: message.arguments || [],
	      TOTAL_MEMORY: message.TOTAL_MEMORY || false
	      // Can play around with this option - must be a power of 2
	      // TOTAL_MEMORY: 268435456
	    };

	    postMessage({
	      'type' : 'start',
	      'data' : Module.arguments.join(" ")
	    });

	    postMessage({
	      'type' : 'stdout',
	      'data' : 'Received command: ' +
	                Module.arguments.join(" ") +
	                ((Module.TOTAL_MEMORY) ? ".  Processing with " + Module.TOTAL_MEMORY + " bits." : "")
	    });

	    var time = now();
	    var result = ffmpeg_run(Module);

	    var totalTime = now() - time;
	    postMessage({
	      'type' : 'stdout',
	      'data' : 'Finished processing (took ' + totalTime + 'ms)'
	    });

	    postMessage({
	      'type' : 'done',
	      'data' : result,
	      'time' : totalTime
	    });
	  }
	};

	// ffmpeg loaded
	postMessage({
	    'type' : 'ready'
	});


/***/ }
/******/ ]);