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
/******/ 	__webpack_require__.p = "/monkeychat/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';

	__webpack_require__(2);
	__webpack_require__(3);

	var MONKEY_DEBUG_MODE = false;

	// Variable to store
	var users = {};
	var conversations = {};
	var messages = {};

	// Variable my account
	var myUser = {};
	var callCenterUser;
	var currentConversationId = null; // conversation id of the current chat

	var monkeyChat = new function () {

	    this.init = init;
	    this.startSession = startSession;
	    this.appID;
	    this.appKey;
	    this.conversationId;

	    function init(appId, appKey, conversationId, view, form) {
	        this.appId = appId;
	        this.appKey = appKey;
	        this.conversationId = conversationId;
	        monkeyUI.setChat(view);
	        $(document).ready(function () {
	            monkeyUI.form = form != null && form != undefined;
	            monkeyUI.drawScene();
	            if (form != null && form != undefined) {
	                //monkeyUI.form = true;
	                monkeyUI.addLoginForm(form);
	            }
	        });
	    }

	    function startSession(userObj) {
	        monkeyUI.disappearOptionsOutWindow();
	        monkeyUI.startLoading();
	        if (userObj != null) {
	            myUser = new MUIUser(userObj.id, userObj.monkey_id, userObj.name, userObj.privacy, userObj.urlAvatar);
	        }

	        monkey.init(monkeyChat.appId, monkeyChat.appKey, userObj, false, MONKEY_DEBUG_MODE);
	    }

	    /***********************************************/
	    /***************** MONKEY SDK ******************/
	    /***********************************************/

	    $(monkey).on("onConnect", function (event, eObject) {
	        monkeyUI.stopLoading();
	        monkeyUI.login = true;
	        if (isEmpty(myUser)) {
	            myUser = new MUIUser(null, eObject.monkey_id, 'Me', 0, 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png');
	        } else if (myUser.monkeyId != eObject.monkey_id) {
	            myUser.monkeyId = eObject.monkey_id;
	        }

	        if (isEmpty(users) || isEmpty(conversations)) {
	            callCenterUser = new MUIUser(null, monkeyChat.conversationId, 'Call Center', 0, 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png');
	            var conversation = new MUIConversation(callCenterUser.monkeyId, callCenterUser.name, callCenterUser.urlAvatar);
	            users[callCenterUser.monkeyId] = callCenterUser;
	            conversations[callCenterUser.monkeyId] = conversation;
	        }

	        monkeyUI.loadDataScreen(myUser);
	        openConversation(callCenterUser.monkeyId);
	    });

	    // --------------- ON DISCONNECT ----------------- //
	    $(monkey).on("onDisconnect", function (event, eObject) {
	        monkeyUI.startLoading();
	    });

	    // ----------------- ON MESSAGE ----------------- //
	    /*
	    CMD 200: Message
	            - Message Type -
	                1: Text *
	                2: File *
	                    - File Type -
	                    1: audio
	                    2:
	                    3: image
	    */
	    $(monkey).on("onMessage", function (event, mokMessage) {
	        console.log(mokMessage);
	        if (mokMessage.senderId == callCenterUser.monkeyId && mokMessage.recipientId == myUser.monkeyId) {
	            var _message = new MUIMessage(mokMessage);
	            messages[_message.id] = _message; // store message
	            defineMessage(_message, mokMessage);
	        }
	    });

	    // ----------------- ON NOTIFICATION ----------------- //
	    /*
	    CMD 200: Message
	            - Message Type -
	                3: Temporal notification
	                    - type criptext -
	                    20: untyping 
	                    21: typing
	                4: Notification
	                5: Alert
	    CMD 203: Open (conversation) *
	    CMD 207: Delete message
	    CMD 208: Close conversation
	    */
	    $(monkey).on("onNotification", function (event, mokMessage) {
	        console.log(mokMessage);
	        var _notification = mokMessage;
	        // notification arrived
	        var _notType = _notification.protocolCommand;
	        var _conversationId = _notification.senderId;
	        switch (_notType) {
	            case 200:
	                {
	                    // message
	                    var _msgType = _notification.protocolType;
	                    switch (_msgType) {
	                        case 3:
	                            {
	                                // Temporal Notification
	                                var _typeTmpNotif = _notification.params.type;
	                                if (_typeTmpNotif == 20 || _typeTmpNotif == 21) {
	                                    // typing state
	                                    monkeyUI.updateTypingState(_conversationId, _typeTmpNotif);
	                                }
	                            }
	                            break;
	                        default:
	                            break;
	                    }
	                }
	                break;
	            case 203:
	                {
	                    // open arrived
	                    monkeyUI.updateStatusReadMessageBubble(_conversationId);
	                }
	                break;
	            default:
	                break;
	        }
	    });

	    // ----------------- ON ACKNOWLEDGE ----------------- //
	    /*
	    CMD 205: ACK from (*)
	            - Type Ack -
	            1: Text message
	            2: File message
	            203: open conversation
	    */
	    $(monkey).on("onAcknowledge", function (event, mokMessage) {
	        console.log(mokMessage);
	        var _acknowledge = mokMessage;
	        // ack arrived
	        var _ackType = _acknowledge.protocolType;
	        var _conversationId = _acknowledge.senderId;
	        switch (_ackType) {
	            case 1:
	                {
	                    // text
	                    console.log('text message received by the user');

	                    var old_id = _acknowledge.oldId;
	                    var new_id = _acknowledge.id;
	                    var status = _acknowledge.props.status;
	                    monkeyUI.updateStatusMessageBubble(old_id, new_id, status);
	                }
	                break;
	            case 2:
	                {
	                    // media
	                    console.log('file message received by the user');

	                    var old_id = _acknowledge.oldId;
	                    var new_id = _acknowledge.id;
	                    var status = _acknowledge.props.status;
	                    monkeyUI.updateStatusMessageBubble(old_id, new_id, status);
	                }
	                break;
	            case 203:
	                {
	                    // open conversation
	                    console.log('open conversation received by the user');

	                    var _lastOpenMe = Number(_acknowledge.props.last_open_me) * 1000;
	                    var _lastOpenApp = Number(_acknowledge.props.last_seen) * 1000;
	                    var _online = Number(_acknowledge.props.online);
	                    var _conversation = conversations[_conversationId];
	                    _conversation.setLastOpenMe(_lastOpenMe);
	                    //monkeyUI.updateStatusMessageBubbleByTime(_conversationId,_lastOpenMe);
	                    monkeyUI.updateOnlineStatus(_lastOpenApp, _online);
	                }
	                break;
	            default:
	                break;
	        }
	    });

	    /***********************************************/
	    /****************** MONKEY UI ******************/
	    /***********************************************/

	    $(monkeyUI).on('textMessage', function (event, text) {
	        if (text != undefined) {
	            prepareTextMessage(text, false);
	        }
	    });

	    $(monkeyUI).on('imageMessage', function (event, file) {
	        if (file != undefined) {
	            prepareImageToSend(file, false);
	        }
	    });

	    $(monkeyUI).on('audioMessage', function (event, audio, messageOldId) {
	        if (audio != undefined) {
	            prepareAudioMessage(audio, false);
	        }
	    });

	    $(monkeyUI).on('fileMessage', function (event, file) {
	        if (file != undefined) {
	            prepareFileToSend(file, false);
	        }
	    });

	    $(monkeyUI).on('quickStart', function (event, file) {
	        startSession(null);
	    });

	    /***********************************************/
	    /***************** CONVERSATIONS ***************/
	    /***********************************************/

	    function openConversation(conversationId) {
	        // draw conversation
	        var _conversation = conversations[conversationId];
	        monkeyUI.drawConversation(_conversation, false);
	        currentConversationId = conversationId;

	        // send open conversation
	        monkey.sendOpenToUser(conversationId);
	    }

	    /***********************************************/
	    /******************* MESSAGES ******************/
	    /***********************************************/

	    function defineMessage(message, mokMessage) {
	        var _conversationId = message.recipientId == myUser.monkeyId ? message.senderId : message.recipientId;
	        var _conversation = conversations[_conversationId];
	        _conversation.lastMessage = message;

	        var _isOutgoing = message.senderId == myUser.monkeyId ? 1 : 0;
	        var _status = 0;
	        if (_isOutgoing == 1) {
	            var _lastOpenMe = conversations[_conversationId].lastOpenMe;
	            if (_lastOpenMe > message.timestamp) {
	                _status = 52;
	            } else {
	                _status = 51;
	            }
	        }

	        switch (message.protocolType) {
	            case 1:
	                // Text
	                monkeyUI.drawTextMessageBubble(message, _conversationId, false, _status);
	                break;

	            case 2:
	                // File
	                if (message.typeFile == 1) {
	                    //audio type
	                    monkeyUI.drawAudioMessageBubble(message, _conversationId, false, _status);
	                    if (message.dataSource == undefined) {
	                        monkey.downloadFile(mokMessage, function (err, data) {
	                            if (err) {
	                                console.log(err);
	                            } else {
	                                var _src = 'data:audio/mpeg;base64,' + data;
	                                monkeyUI.updateDataMessageBubble(mokMessage.id, _src);
	                            }
	                        });
	                    }
	                } else if (message.typeFile == 3) {
	                    //image type
	                    monkeyUI.drawImageMessageBubble(message, _conversationId, false, _status);
	                    if (message.dataSource == undefined) {
	                        monkey.downloadFile(mokMessage, function (err, data) {
	                            if (err) {
	                                console.log(err);
	                            } else {
	                                var _src = 'data:' + mokMessage.props.mime_type + ';base64,' + data;
	                                monkeyUI.updateDataMessageBubble(mokMessage.id, _src);
	                            }
	                        });
	                    }
	                } else if (message.typeFile == 4) {
	                    //file type
	                    console.log('file received');
	                    monkeyUI.drawFileMessageBubble(message, _conversationId, false, _status);
	                    if (message.dataSource == undefined) {
	                        monkey.downloadFile(mokMessage, function (err, data) {
	                            if (err) {
	                                console.log(err);
	                            } else {
	                                var _src = 'data:' + mokMessage.props.mime_type + ';base64,' + data;
	                                monkeyUI.updateDataMessageBubble(mokMessage.id, _src);
	                            }
	                        });
	                    }
	                }
	                break;

	            default:
	                break;
	        }
	    }

	    /************* TO SEND TEXT MESSAGE ************/

	    function prepareTextMessage(messageText, ephemeral) {
	        if (messageText == null || messageText == "") {
	            return;
	        }
	        var _eph = ephemeral ? 1 : 0;
	        var _params = {
	            eph: _eph,
	            length: messageText.length
	        };
	        var _mokMessage = monkey.sendEncryptedMessage(messageText, currentConversationId, _params);
	        var _message = new MUIMessage(_mokMessage);

	        monkeyUI.drawTextMessageBubble(_message, currentConversationId, false, 51);
	    }

	    /************ TO SEND AUDIO MESSAGE ************/

	    function prepareAudioMessage(audio, ephemeral) {
	        var _eph = ephemeral ? 1 : 0;
	        var _params = {
	            eph: _eph,
	            length: audio.duration
	        };
	        var _mokMessage = monkey.sendEncryptedFile(audio.src, currentConversationId, 'audio_.mp3', audio.type, audio.monkeyFileType, true, _params, null, function (err, message) {
	            if (err) {
	                console.log(err);
	            } else {
	                console.log(message);
	                monkeyUI.updateStatusMessageBubble(message.oldId, message.id, 51);
	            }
	        });

	        var _message = new MUIMessage(_mokMessage);
	        _message.setDataSource(audio.src);
	        var _status = 0;

	        monkeyUI.drawAudioMessageBubble(_message, currentConversationId, false, _status, audio.oldId);
	        monkeyUI.showChatInput();
	    }

	    /************* TO SEND IMAGE MESSAGE ************/

	    function prepareImageToSend(file, ephemeral) {
	        var _eph = ephemeral ? 1 : 0;
	        var _params = {
	            eph: _eph
	        };
	        var _mokMessage = monkey.sendEncryptedFile(file.src, currentConversationId, file.file.name, file.file.type, file.monkeyFileType, true, _params, null, function (err, message) {
	            if (err) {
	                console.log(err);
	            } else {
	                console.log(message);
	                monkeyUI.updateStatusMessageBubble(message.oldId, message.id, 51);
	            }
	        });

	        var _message = new MUIMessage(_mokMessage);
	        _message.setDataSource(file.src);
	        var _status = 0;

	        monkeyUI.drawImageMessageBubble(_message, currentConversationId, false, _status);
	    }

	    /************* TO SEND FILE MESSAGE ************/

	    function prepareFileToSend(file, ephemeral) {
	        var _eph = ephemeral ? 1 : 0;
	        var params = {
	            eph: _eph
	        };
	        var _mokMessage = monkey.sendEncryptedFile(file.src, currentConversationId, file.file.name, file.file.type, file.monkeyFileType, true, params, null, function (err, message) {
	            if (err) {
	                console.log(err);
	            } else {
	                console.log(message);
	                monkeyUI.updateStatusMessageBubble(message.oldId, message.id, 51);
	            }
	        });

	        var _message = new MUIMessage(_mokMessage);
	        _message.setDataSource(file.src);
	        _message.filesize = file.file.size;
	        var _status = 0;

	        monkeyUI.drawFileMessageBubble(_message, currentConversationId, false, _status);
	    }

	    /***********************************************/
	    /********************* UTIL ********************/
	    /***********************************************/

	    function isEmpty(object) {
	        for (var key in object) {
	            if (object.hasOwnProperty(key)) {
	                return false;
	            }
	        }
	        return true;
	    }
	}();

	window.monkeyChat = monkeyChat;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v2.2.2
	 * http://jquery.com/
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-03-17T17:51Z
	 */

	(function( global, factory ) {

		if ( typeof module === "object" && typeof module.exports === "object" ) {
			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}

	// Pass this if window is not defined yet
	}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

	// Support: Firefox 18+
	// Can't be in strict mode, several libs including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	//"use strict";
	var arr = [];

	var document = window.document;

	var slice = arr.slice;

	var concat = arr.concat;

	var push = arr.push;

	var indexOf = arr.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var support = {};



	var
		version = "2.2.2",

		// Define a local copy of jQuery
		jQuery = function( selector, context ) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},

		// Support: Android<4.1
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,

		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};

	jQuery.fn = jQuery.prototype = {

		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// Start with an empty selector
		selector: "",

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function() {
			return slice.call( this );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
			return num != null ?

				// Return just the one element from the set
				( num < 0 ? this[ num + this.length ] : this[ num ] ) :

				// Return all the elements in a clean array
				slice.call( this );
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
			ret.context = this.context;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},

		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},

		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},

		end: function() {
			return this.prevObject || this.constructor();
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};

	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = jQuery.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray( src ) ? src : [];

						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend( {

		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function( msg ) {
			throw new Error( msg );
		},

		noop: function() {},

		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},

		isArray: Array.isArray,

		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},

		isNumeric: function( obj ) {

			// parseFloat NaNs numeric-cast false positives (null|true|false|"")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			// adding 1 corrects loss of precision from parseFloat (#15100)
			var realStringObj = obj && obj.toString();
			return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
		},

		isPlainObject: function( obj ) {
			var key;

			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}

			// Not own constructor property must be Object
			if ( obj.constructor &&
					!hasOwn.call( obj, "constructor" ) &&
					!hasOwn.call( obj.constructor.prototype || {}, "isPrototypeOf" ) ) {
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own
			for ( key in obj ) {}

			return key === undefined || hasOwn.call( obj, key );
		},

		isEmptyObject: function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},

		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}

			// Support: Android<4.0, iOS<6 (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},

		// Evaluates a script in a global context
		globalEval: function( code ) {
			var script,
				indirect = eval;

			code = jQuery.trim( code );

			if ( code ) {

				// If the code includes a valid, prologue position
				// strict mode pragma, execute code by injecting a
				// script tag into the document.
				if ( code.indexOf( "use strict" ) === 1 ) {
					script = document.createElement( "script" );
					script.text = code;
					document.head.appendChild( script ).parentNode.removeChild( script );
				} else {

					// Otherwise, avoid the DOM node creation, insertion
					// and removal by using an indirect global eval

					indirect( code );
				}
			}
		},

		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE9-11+
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},

		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},

		each: function( obj, callback ) {
			var length, i = 0;

			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}

			return obj;
		},

		// Support: Android<4.1
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];

			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}

			return ret;
		},

		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},

		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;

			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}

			first.length = i;

			return first;
		},

		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];

			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}

			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}
			}

			// Flatten any nested arrays
			return concat.apply( [], ret );
		},

		// A global GUID counter for objects
		guid: 1,

		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;

			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}

			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}

			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};

			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;

			return proxy;
		},

		now: Date.now,

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );

	// JSHint would error on this code due to the Symbol not being defined in ES5.
	// Defining this global in .jshintrc would create a danger of using the global
	// unguarded in another place, it seems safer to just disable JSHint for these
	// three lines.
	/* jshint ignore: start */
	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}
	/* jshint ignore: end */

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

	function isArrayLike( obj ) {

		// Support: iOS 8.2 (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );

		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}

		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.2.1
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2015-10-17
	 */
	(function( window ) {

	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,

		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,

		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},

		// General-purpose constants
		MAX_NEGATIVE = 1 << 31,

		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// http://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},

		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

		// Regular expressions

		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",

		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",

		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),

		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},

		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,

		rnative = /^[^{]+\{\s*\[native \w/,

		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

		rsibling = /[+~]/,
		rescape = /'|\\/g,

		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},

		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		};

	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?

			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :

			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}

	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, nidselect, match, groups, newSelector,
			newContext = context && context.ownerDocument,

			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;

		results = results || [];

		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

			return results;
		}

		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {

			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;

			if ( documentIsHTML ) {

				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

					// ID selector
					if ( (m = match[1]) ) {

						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {

								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}

						// Element context
						} else {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {

								results.push( elem );
								return results;
							}
						}

					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;

					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {

						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}

				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;

					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {

						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rescape, "\\$&" );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}

						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
						while ( i-- ) {
							groups[i] = nidselect + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );

						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}

					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}

		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}

	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];

		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}

	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}

	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created div and expects a boolean result
	 */
	function assert( fn ) {
		var div = document.createElement("div");

		try {
			return !!fn( div );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( div.parentNode ) {
				div.parentNode.removeChild( div );
			}
			// release memory in IE
			div = null;
		}
	}

	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;

		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}

	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				( ~b.sourceIndex || MAX_NEGATIVE ) -
				( ~a.sourceIndex || MAX_NEGATIVE );

		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}

		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}

		return a ? 1 : -1;
	}

	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;

				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}

	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}

	// Expose support vars for convenience
	support = Sizzle.support = {};

	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};

	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, parent,
			doc = node ? node.ownerDocument || node : preferredDoc;

		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}

		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );

		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( (parent = document.defaultView) && parent.top !== parent ) {
			// Support: IE 11
			if ( parent.addEventListener ) {
				parent.addEventListener( "unload", unloadHandler, false );

			// Support: IE 9 - 10 only
			} else if ( parent.attachEvent ) {
				parent.attachEvent( "onunload", unloadHandler );
			}
		}

		/* Attributes
		---------------------------------------------------------------------- */

		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( div ) {
			div.className = "i";
			return !div.getAttribute("className");
		});

		/* getElement(s)By*
		---------------------------------------------------------------------- */

		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( div ) {
			div.appendChild( document.createComment("") );
			return !div.getElementsByTagName("*").length;
		});

		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );

		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( div ) {
			docElem.appendChild( div ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});

		// ID find and filter
		if ( support.getById ) {
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var m = context.getElementById( id );
					return m ? [ m ] : [];
				}
			};
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
		} else {
			// Support: IE6/7
			// getElementById is not reliable as a find shortcut
			delete Expr.find["ID"];

			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};
		}

		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );

				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :

			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			};

		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};

		/* QSA/matchesSelector
		---------------------------------------------------------------------- */

		// QSA and matchesSelector support

		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];

		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See http://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];

		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( div ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// http://bugs.jquery.com/ticket/12359
				docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";

				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( div.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}

				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !div.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}

				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}

				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}

				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibing-combinator selector` fails
				if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});

			assert(function( div ) {
				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				div.appendChild( input ).setAttribute( "name", "D" );

				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( div.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}

				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":enabled").length ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Opera 10-11 does not throw on post-comma invalid pseudos
				div.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}

		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {

			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( div, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );

		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};

		/* Sorting
		---------------------------------------------------------------------- */

		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {

			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}

			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :

				// Otherwise we know they are disconnected
				1;

			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];

			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;

			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}

			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}

			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}

			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :

				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};

		return document;
	};

	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};

	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );

		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

			try {
				var ret = matches.call( elem, expr );

				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}

		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};

	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};

	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;

		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};

	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;

		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}

		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;

		return results;
	};

	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes

		return ret;
	};

	Expr = Sizzle.selectors = {

		// Can be adjusted by the user
		cacheLength: 50,

		createPseudo: markFunction,

		match: matchExpr,

		attrHandle: {},

		find: {},

		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},

		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );

				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}

				return match.slice( 0, 4 );
			},

			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();

				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}

				return match;
			},

			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];

				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}

				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";

				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},

		filter: {

			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},

			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];

				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},

			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );

					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}

					result += "";

					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},

			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";

				return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :

					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;

						if ( parent ) {

							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {

											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [ forward ? parent.firstChild : parent.lastChild ];

							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {

								// Seek `elem` from a previously-cached index

								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];

								while ( (node = ++nodeIndex && node && node[ dir ] ||

									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {

									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}

							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});

									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});

									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}

								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {

										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {

											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});

												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});

												uniqueCache[ type ] = [ dirruns, diff ];
											}

											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},

			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );

				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}

				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}

				return fn;
			}
		},

		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );

				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;

						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),

			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),

			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),

			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),

			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},

			"root": function( elem ) {
				return elem === docElem;
			},

			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},

			// Boolean properties
			"enabled": function( elem ) {
				return elem.disabled === false;
			},

			"disabled": function( elem ) {
				return elem.disabled === true;
			},

			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},

			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}

				return elem.selected === true;
			},

			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},

			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},

			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},

			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},

			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},

			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&

					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},

			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),

			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),

			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),

			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};

	Expr.pseudos["nth"] = Expr.pseudos["eq"];

	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}

	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();

	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];

		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}

		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;

		while ( soFar ) {

			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}

			matched = false;

			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}

			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}

			if ( !matched ) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};

	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}

	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			checkNonElements = base && dir === "parentNode",
			doneName = done++;

		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
			} :

			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];

				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

							if ( (oldCache = uniqueCache[ dir ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ dir ] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
			};
	}

	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}

	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}

	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;

		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}

		return newUnmatched;
	}

	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,

				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,

				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

						// ...intermediate processing is necessary
						[] :

						// ...otherwise use results directly
						results :
					matcherIn;

			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}

			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );

				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}

			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}

					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

							seed[temp] = !(results[temp] = elem);
						}
					}
				}

			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}

	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,

			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];

		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}

		return elementMatcher( matchers );
	}

	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;

				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}

				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}

				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;

				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}

					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}

					// Add matches to results
					push.apply( results, setMatched );

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {

						Sizzle.uniqueSort( results );
					}
				}

				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}

	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];

		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}

			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};

	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );

		results = results || [];

		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {

			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;

				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}

		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};

	// One-time assignments

	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;

	// Initialize against the default document
	setDocument();

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( div1 ) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition( document.createElement("div") ) & 1;
	});

	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}

	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( div ) {
		div.innerHTML = "<input/>";
		div.firstChild.setAttribute( "value", "" );
		return div.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}

	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( div ) {
		return div.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}

	return Sizzle;

	})( window );



	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;



	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};


	var siblings = function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	};


	var rneedsContext = jQuery.expr.match.needsContext;

	var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



	var risSimple = /^.[^:#\[\.,]*$/;

	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				/* jshint -W018 */
				return !!qualifier.call( elem, i, elem ) !== not;
			} );

		}

		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );

		}

		if ( typeof qualifier === "string" ) {
			if ( risSimple.test( qualifier ) ) {
				return jQuery.filter( qualifier, elements, not );
			}

			qualifier = jQuery.filter( qualifier, elements );
		}

		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			} ) );
	};

	jQuery.fn.extend( {
		find: function( selector ) {
			var i,
				len = this.length,
				ret = [],
				self = this;

			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}

			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}

			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );


	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,

		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;

			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}

			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;

			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {

					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];

				} else {
					match = rquickExpr.exec( selector );
				}

				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {

					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;

						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );

						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {

								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );

								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}

						return this;

					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );

						// Support: Blackberry 4.6
						// gEBID returns nodes no longer in the document (#6963)
						if ( elem && elem.parentNode ) {

							// Inject the element directly into the jQuery object
							this.length = 1;
							this[ 0 ] = elem;
						}

						this.context = document;
						this.selector = selector;
						return this;
					}

				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}

			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this.context = this[ 0 ] = selector;
				this.length = 1;
				return this;

			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :

					// Execute immediately if ready is not present
					selector( jQuery );
			}

			if ( selector.selector !== undefined ) {
				this.selector = selector.selector;
				this.context = selector.context;
			}

			return jQuery.makeArray( selector, this );
		};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery( document );


	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;

			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},

		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
					jQuery( selectors, context || this.context ) :
					0;

			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( pos ?
						pos.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}

			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},

		// Determine the position of an element within the set
		index: function( elem ) {

			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}

			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}

			// Locate the position of the desired element
			return indexOf.call( this,

				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},

		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},

		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );

	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}

	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			return elem.contentDocument || jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );

			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}

			if ( this.length > 1 ) {

				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}

				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}

			return this.pushStack( matched );
		};
	} );
	var rnotwhite = ( /\S+/g );



	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );

		var // Flag to know if list is currently firing
			firing,

			// Last fire value for non-forgettable lists
			memory,

			// Flag to know if list was already fired
			fired,

			// Flag to prevent firing
			locked,

			// Actual callback list
			list = [],

			// Queue of execution data for repeatable lists
			queue = [],

			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,

			// Fire callbacks
			fire = function() {

				// Enforce single-firing
				locked = options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {

						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {

							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good
				if ( locked ) {

					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];

					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},

			// Actual Callbacks object
			self = {

				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {

						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}

						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );

						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},

				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );

							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},

				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},

				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},

				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},

				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};

		return self;
	};


	jQuery.extend( {

		Deferred: function( func ) {
			var tuples = [

					// action, add listener, listener list, final state
					[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
					[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					then: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;
						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {
								var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

								// deferred[ done | fail | progress ] for forwarding actions to newDefer
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this === promise ? newDefer.promise() : this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},

					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};

			// Keep pipe for back-compat
			promise.pipe = promise.then;

			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 3 ];

				// promise[ done | fail | progress ] = list.add
				promise[ tuple[ 1 ] ] = list.add;

				// Handle state
				if ( stateString ) {
					list.add( function() {

						// state = [ resolved | rejected ]
						state = stateString;

					// [ reject_list | resolve_list ].disable; progress_list.lock
					}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
				}

				// deferred[ resolve | reject | notify ]
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
					return this;
				};
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );

			// Make the deferred a promise
			promise.promise( deferred );

			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function( subordinate /* , ..., subordinateN */ ) {
			var i = 0,
				resolveValues = slice.call( arguments ),
				length = resolveValues.length,

				// the count of uncompleted subordinates
				remaining = length !== 1 ||
					( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

				// the master Deferred.
				// If resolveValues consist of only a single Deferred, just use that.
				deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

				// Update function for both resolve and progress values
				updateFunc = function( i, contexts, values ) {
					return function( value ) {
						contexts[ i ] = this;
						values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( values === progressValues ) {
							deferred.notifyWith( contexts, values );
						} else if ( !( --remaining ) ) {
							deferred.resolveWith( contexts, values );
						}
					};
				},

				progressValues, progressContexts, resolveContexts;

			// Add listeners to Deferred subordinates; treat others as resolved
			if ( length > 1 ) {
				progressValues = new Array( length );
				progressContexts = new Array( length );
				resolveContexts = new Array( length );
				for ( ; i < length; i++ ) {
					if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
						resolveValues[ i ].promise()
							.progress( updateFunc( i, progressContexts, progressValues ) )
							.done( updateFunc( i, resolveContexts, resolveValues ) )
							.fail( deferred.reject );
					} else {
						--remaining;
					}
				}
			}

			// If we're not waiting on anything, resolve the master
			if ( !remaining ) {
				deferred.resolveWith( resolveContexts, resolveValues );
			}

			return deferred.promise();
		}
	} );


	// The deferred used on DOM ready
	var readyList;

	jQuery.fn.ready = function( fn ) {

		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	};

	jQuery.extend( {

		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,

		// Hold (or release) the ready event
		holdReady: function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		},

		// Handle when the DOM is ready
		ready: function( wait ) {

			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.triggerHandler ) {
				jQuery( document ).triggerHandler( "ready" );
				jQuery( document ).off( "ready" );
			}
		}
	} );

	/**
	 * The ready event handler and self cleanup method
	 */
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}

	jQuery.ready.promise = function( obj ) {
		if ( !readyList ) {

			readyList = jQuery.Deferred();

			// Catch cases where $(document).ready() is called
			// after the browser event has already occurred.
			// Support: IE9-10 only
			// Older IE sometimes signals "interactive" too soon
			if ( document.readyState === "complete" ||
				( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

				// Handle it asynchronously to allow scripts the opportunity to delay ready
				window.setTimeout( jQuery.ready );

			} else {

				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", completed );

				// A fallback to window.onload, that will always work
				window.addEventListener( "load", completed );
			}
		}
		return readyList.promise( obj );
	};

	// Kick off the DOM ready check even if the user does not
	jQuery.ready.promise();




	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {

				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {

		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		/* jshint -W018 */
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};




	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}

	Data.uid = 1;

	Data.prototype = {

		register: function( owner, initial ) {
			var value = initial || {};

			// If it is a node unlikely to be stringify-ed or looped over
			// use plain assignment
			if ( owner.nodeType ) {
				owner[ this.expando ] = value;

			// Otherwise secure it in a non-enumerable, non-writable property
			// configurability must be true to allow the property to be
			// deleted with the delete operator
			} else {
				Object.defineProperty( owner, this.expando, {
					value: value,
					writable: true,
					configurable: true
				} );
			}
			return owner[ this.expando ];
		},
		cache: function( owner ) {

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( !acceptData( owner ) ) {
				return {};
			}

			// Check if the owner object already has a cache
			var value = owner[ this.expando ];

			// If not, create one
			if ( !value ) {
				value = {};

				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {

					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;

					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}

			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );

			// Handle: [ owner, key, value ] args
			if ( typeof data === "string" ) {
				cache[ data ] = value;

			// Handle: [ owner, { properties } ] args
			} else {

				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :
				owner[ this.expando ] && owner[ this.expando ][ key ];
		},
		access: function( owner, key, value ) {
			var stored;

			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {

				stored = this.get( owner, key );

				return stored !== undefined ?
					stored : this.get( owner, jQuery.camelCase( key ) );
			}

			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i, name, camel,
				cache = owner[ this.expando ];

			if ( cache === undefined ) {
				return;
			}

			if ( key === undefined ) {
				this.register( owner );

			} else {

				// Support array or space separated string of keys
				if ( jQuery.isArray( key ) ) {

					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = key.concat( key.map( jQuery.camelCase ) );
				} else {
					camel = jQuery.camelCase( key );

					// Try the string as a key before any manipulation
					if ( key in cache ) {
						name = [ key, camel ];
					} else {

						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						name = camel;
						name = name in cache ?
							[ name ] : ( name.match( rnotwhite ) || [] );
					}
				}

				i = name.length;

				while ( i-- ) {
					delete cache[ name[ i ] ];
				}
			}

			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

				// Support: Chrome <= 35-45+
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://code.google.com/p/chromium/issues/detail?id=378607
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();

	var dataUser = new Data();



	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;

	function dataAttr( elem, key, data ) {
		var name;

		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );

			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
						data === "false" ? false :
						data === "null" ? null :

						// Only convert to a number if it doesn't change the string
						+data + "" === data ? +data :
						rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
				} catch ( e ) {}

				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}

	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},

		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},

		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},

		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},

		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );

	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;

			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );

					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {

							// Support: IE11+
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}

				return data;
			}

			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}

			return access( this, function( value ) {
				var data, camelKey;

				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {

					// Attempt to get data from the cache
					// with the key as-is
					data = dataUser.get( elem, key ) ||

						// Try to find dashed key if it exists (gh-2779)
						// This is for 2.2.x only
						dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );

					if ( data !== undefined ) {
						return data;
					}

					camelKey = jQuery.camelCase( key );

					// Attempt to get data from the cache
					// with the key camelized
					data = dataUser.get( elem, camelKey );
					if ( data !== undefined ) {
						return data;
					}

					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, camelKey, undefined );
					if ( data !== undefined ) {
						return data;
					}

					// We tried really hard, but the data doesn't exist.
					return;
				}

				// Set the data...
				camelKey = jQuery.camelCase( key );
				this.each( function() {

					// First, attempt to store a copy or reference of any
					// data that might've been store with a camelCased key.
					var data = dataUser.get( this, camelKey );

					// For HTML5 data-* attribute interop, we have to
					// store property names with dashes in a camelCase form.
					// This might not apply to all properties...*
					dataUser.set( this, camelKey, value );

					// *... In the case of properties that might _actually_
					// have dashes, we need to also store a copy of that
					// unchanged property.
					if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
						dataUser.set( this, key, value );
					}
				} );
			}, null, value, arguments.length > 1, null, true );
		},

		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );


	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;

			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );

				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || jQuery.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},

		dequeue: function( elem, type ) {
			type = type || "fx";

			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};

			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}

			if ( fn ) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}

				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}

			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},

		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );

	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;

			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}

			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}

			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );

					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );

					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},

		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};

			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

	var isHidden = function( elem, el ) {

			// isHidden might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;
			return jQuery.css( elem, "display" ) === "none" ||
				!jQuery.contains( elem.ownerDocument, elem );
		};



	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() { return tween.cur(); } :
				function() { return jQuery.css( elem, prop, "" ); },
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );

		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];

			// Make sure we update the tween properties later on
			valueParts = valueParts || [];

			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;

			do {

				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";

				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );

			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}

		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;

			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}
	var rcheckableType = ( /^(?:checkbox|radio)$/i );

	var rtagName = ( /<([\w:-]+)/ );

	var rscriptType = ( /^$|\/(?:java|ecma)script/i );



	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {

		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

	// Support: IE9
	wrapMap.optgroup = wrapMap.option;

	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;


	function getAll( context, tag ) {

		// Support: IE9-11+
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== "undefined" ?
					context.querySelectorAll( tag || "*" ) :
				[];

		return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
			jQuery.merge( [ context ], ret ) :
			ret;
	}


	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}


	var rhtml = /<|&#?\w+;/;

	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {

					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {

			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	}


	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );

		// Support: Android 4.0-4.3, Safari<=5.1
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );

		div.appendChild( input );

		// Support: Safari<=5.1, Android<4.2
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

		// Support: IE<=11+
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();


	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	// Support: IE9
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}

	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {

			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {

				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}

		if ( data == null && fn == null ) {

			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {

				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {

				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {

				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};

			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {

		global: {},

		add: function( elem, types, handler, data, selector ) {

			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );

			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {

					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}

			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );

				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}

				if ( special.add ) {
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}

		},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {

			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );

						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

						jQuery.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];
				}
			}

			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},

		dispatch: function( event ) {

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( event );

			var i, j, ret, matched, handleObj,
				handlerQueue = [],
				args = slice.call( arguments ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;
			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;

				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {

					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );

						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},

		handlers: function( event, handlers ) {
			var i, matches, sel, handleObj,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;

			// Support (at least): Chrome, IE9
			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			//
			// Support: Firefox<=42+
			// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
			if ( delegateCount && cur.nodeType &&
				( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

				for ( ; cur !== this; cur = cur.parentNode || this ) {

					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
						matches = [];
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if ( matches[ sel ] === undefined ) {
								matches[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matches[ sel ] ) {
								matches.push( handleObj );
							}
						}
						if ( matches.length ) {
							handlerQueue.push( { elem: cur, handlers: matches } );
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
			}

			return handlerQueue;
		},

		// Includes some event props shared by KeyEvent and MouseEvent
		props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
			"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split( " " ),
			filter: function( event, original ) {

				// Add which for key events
				if ( event.which == null ) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
				"screenX screenY toElement" ).split( " " ),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button;

				// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && original.clientX != null ) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX +
						( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
						( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY +
						( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
						( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}

				return event;
			}
		},

		fix: function( event ) {
			if ( event[ jQuery.expando ] ) {
				return event;
			}

			// Create a writable copy of the event object and normalize some properties
			var i, prop, copy,
				type = event.type,
				originalEvent = event,
				fixHook = this.fixHooks[ type ];

			if ( !fixHook ) {
				this.fixHooks[ type ] = fixHook =
					rmouseEvent.test( type ) ? this.mouseHooks :
					rkeyEvent.test( type ) ? this.keyHooks :
					{};
			}
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

			event = new jQuery.Event( originalEvent );

			i = copy.length;
			while ( i-- ) {
				prop = copy[ i ];
				event[ prop ] = originalEvent[ prop ];
			}

			// Support: Cordova 2.5 (WebKit) (#13255)
			// All events should have a target; Cordova deviceready doesn't
			if ( !event.target ) {
				event.target = document;
			}

			// Support: Safari 6.0+, Chrome<28
			// Target should not be a text node (#504, #13143)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}

			return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
		},

		special: {
			load: {

				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {

				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {

				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},

			beforeunload: {
				postDispatch: function( event ) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};

	jQuery.removeEvent = function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};

	jQuery.Event = function( src, props ) {

		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&

					// Support: Android<4.0
					src.returnValue === false ?
				returnTrue :
				returnFalse;

		// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();

		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,

		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if ( e ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if ( e ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://code.google.com/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,

			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;

				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );

	jQuery.fn.extend( {
		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {

				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {

				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {

				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );


	var
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

		// Support: IE 10-11, Edge 10240+
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,

		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

	// Manipulating tables requires a tbody
	function manipulationTarget( elem, content ) {
		return jQuery.nodeName( elem, "table" ) &&
			jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

			elem.getElementsByTagName( "tbody" )[ 0 ] ||
				elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
			elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );

		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}

		return elem;
	}

	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

		if ( dest.nodeType !== 1 ) {
			return;
		}

		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;

			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};

				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}

		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );

			dataUser.set( dest, udataCur );
		}
	}

	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();

		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;

		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}

	function domManip( collection, args, callback, ignored ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}

		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {

							// Support: Android<4.1, PhantomJS<2
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( collection[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {

							if ( node.src ) {

								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return collection;
	}

	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;

		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}

			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}

		return elem;
	}

	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},

		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );

			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {

				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}

			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );

					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}

			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}

			// Return the cloned set
			return clone;
		},

		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;

			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );

								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}

						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {

						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );

	jQuery.fn.extend( {

		// Keep domManip exposed until 3.0 (gh-2225)
		domManip: domManip,

		detach: function( selector ) {
			return remove( this, selector, true );
		},

		remove: function( selector ) {
			return remove( this, selector );
		},

		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},

		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},

		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},

		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},

		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},

		empty: function() {
			var elem,
				i = 0;

			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {

					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );

					// Remove any remaining nodes
					elem.textContent = "";
				}
			}

			return this;
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},

		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;

				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}

				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

					value = jQuery.htmlPrefilter( value );

					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};

							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}

						elem = 0;

					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}

				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},

		replaceWith: function() {
			var ignored = [];

			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;

				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}

			// Force callback invocation
			}, ignored );
		}
	} );

	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;

			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );

				// Support: QtWebKit
				// .get() because push.apply(_, arraylike) throws
				push.apply( ret, elems.get() );
			}

			return this.pushStack( ret );
		};
	} );


	var iframe,
		elemdisplay = {

			// Support: Firefox
			// We have to pre-define these values for FF (#10227)
			HTML: "block",
			BODY: "block"
		};

	/**
	 * Retrieve the actual display of a element
	 * @param {String} name nodeName of the element
	 * @param {Object} doc Document object
	 */

	// Called only from within defaultDisplay
	function actualDisplay( name, doc ) {
		var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

			display = jQuery.css( elem[ 0 ], "display" );

		// We don't have any data stored on the element,
		// so use "detach" method as fast way to get rid of the element
		elem.detach();

		return display;
	}

	/**
	 * Try to determine the default display value of an element
	 * @param {String} nodeName
	 */
	function defaultDisplay( nodeName ) {
		var doc = document,
			display = elemdisplay[ nodeName ];

		if ( !display ) {
			display = actualDisplay( nodeName, doc );

			// If the simple way fails, read from inside an iframe
			if ( display === "none" || !display ) {

				// Use the already-created iframe if possible
				iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
					.appendTo( doc.documentElement );

				// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
				doc = iframe[ 0 ].contentDocument;

				// Support: IE
				doc.write();
				doc.close();

				display = actualDisplay( nodeName, doc );
				iframe.detach();
			}

			// Store the correct default display
			elemdisplay[ nodeName ] = display;
		}

		return display;
	}
	var rmargin = ( /^margin/ );

	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

	var getStyles = function( elem ) {

			// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if ( !view || !view.opener ) {
				view = window;
			}

			return view.getComputedStyle( elem );
		};

	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	};


	var documentElement = document.documentElement;



	( function() {
		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );

		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}

		// Support: IE9-11+
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );

		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );

			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";

			documentElement.removeChild( container );
		}

		jQuery.extend( support, {
			pixelPosition: function() {

				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {

				// Support: Android 4.0-4.3
				// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
				// since that compresses better and they're computed together anyway.
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {

				// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return reliableMarginLeftVal;
			},
			reliableMarginRight: function() {

				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =

					// Support: Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;box-sizing:content-box;" +
					"display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				documentElement.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );

				documentElement.removeChild( container );
				div.removeChild( marginDiv );

				return ret;
			}
		} );
	} )();


	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: IE9
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?

			// Support: IE9-11+
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}


	function addGetHookIf( conditionFn, hookFn ) {

		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {

					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}


	var

		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,

		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},

		cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;

	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {

		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}

		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}

	function setPositiveNumber( elem, value, subtract ) {

		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?

			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}

	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i = extra === ( isBorderBox ? "border" : "content" ) ?

			// If we already have the right measurement, avoid augmentation
			4 :

			// Otherwise initialize for horizontal or vertical properties
			name === "width" ? 1 : 0,

			val = 0;

		for ( ; i < 4; i += 2 ) {

			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}

			if ( isBorderBox ) {

				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}

				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {

				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}

		return val;
	}

	function getWidthOrHeight( elem, name, extra ) {

		// Start with offset property, which is equivalent to the border-box value
		var valueIsBorderBox = true,
			val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
			styles = getStyles( elem ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Support: IE11 only
		// In IE 11 fullscreen elements inside of an iframe have
		// 100x too small dimensions (gh-1764).
		if ( document.msFullscreenElement && window.top !== window ) {

			// Support: IE11 only
			// Running getBoundingClientRect on a disconnected node
			// in IE throws an error.
			if ( elem.getClientRects().length ) {
				val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
			}
		}

		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if ( val <= 0 || val == null ) {

			// Fall back to computed then uncomputed css if necessary
			val = curCSS( elem, name, styles );
			if ( val < 0 || val == null ) {
				val = elem.style[ name ];
			}

			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}

			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );

			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}

		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}

	function showHide( elements, show ) {
		var display, elem, hidden,
			values = [],
			index = 0,
			length = elements.length;

		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}

			values[ index ] = dataPriv.get( elem, "olddisplay" );
			display = elem.style.display;
			if ( show ) {

				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if ( !values[ index ] && display === "none" ) {
					elem.style.display = "";
				}

				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if ( elem.style.display === "" && isHidden( elem ) ) {
					values[ index ] = dataPriv.access(
						elem,
						"olddisplay",
						defaultDisplay( elem.nodeName )
					);
				}
			} else {
				hidden = isHidden( elem );

				if ( display !== "none" || !hidden ) {
					dataPriv.set(
						elem,
						"olddisplay",
						hidden ? display : jQuery.css( elem, "display" )
					);
				}
			}
		}

		// Set the display of most of the elements in a second loop
		// to avoid the constant reflow
		for ( index = 0; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
			if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
				elem.style.display = show ? values[ index ] || "" : "none";
			}
		}

		return elements;
	}

	jQuery.extend( {

		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {

						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},

		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {

			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}

			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				style = elem.style;

			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;

				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );

					// Fixes bug #9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}

				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}

				// Support: IE9-11+
				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {

					style[ name ] = value;
				}

			} else {

				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

					return ret;
				}

				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},

		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name );

			// Make sure that we're working with the right name
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}

			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}

			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}

			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}
			return val;
		}
	} );

	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {

					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
						elem.offsetWidth === 0 ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},

			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);

				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {

					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}

				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );

	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);

	// Support: Android 2.3
	jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
		function( elem, computed ) {
			if ( computed ) {
				return swap( elem, { "display": "inline-block" },
					curCSS, [ elem, "marginRight" ] );
			}
		}
	);

	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},

					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];

				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}

				return expanded;
			}
		};

		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );

	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;

				if ( jQuery.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;

					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}

					return map;
				}

				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		},
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}

			return this.each( function() {
				if ( isHidden( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );


	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];

			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];

			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;

			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}

			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;

				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}

				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );

				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {

				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};

	// Support: IE9
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};

	jQuery.fx = Tween.prototype.init;

	// Back Compat <1.8 extension point
	jQuery.fx.step = {};




	var
		fxNow, timerId,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;

	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}

	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };

		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4 ; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}

		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

				// We're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter( elem, props, opts ) {
		/* jshint validthis: true */
		var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHidden( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );

		// Handle queue: false promises
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always( function() {

				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}

		// Height/width overflow pass
		if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

			// Make sure that nothing sneaks out
			// Record all 3 overflow attributes because IE9-10 do not
			// change the overflow attribute when overflowX and
			// overflowY are set to the same value
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

			// Set display property to inline-block for height/width
			// animations on inline elements that are having width/height animated
			display = jQuery.css( elem, "display" );

			// Test default display if display is currently "none"
			checkDisplay = display === "none" ?
				dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

			if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
				style.display = "inline-block";
			}
		}

		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}

		// show/hide pass
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.exec( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {

					// If there is dataShow left over from a stopped hide or show
					// and we are going to proceed with show, we should pretend to be hidden
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

			// Any non-fx value stops us from restoring the original display value
			} else {
				display = undefined;
			}
		}

		if ( !jQuery.isEmptyObject( orig ) ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", {} );
			}

			// Store state if its toggle - enables .stop().toggle() to "reverse"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}
			if ( hidden ) {
				jQuery( elem ).show();
			} else {
				anim.done( function() {
					jQuery( elem ).hide();
				} );
			}
			anim.done( function() {
				var prop;

				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
			for ( prop in orig ) {
				tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

				if ( !( prop in dataShow ) ) {
					dataShow[ prop ] = tween.start;
					if ( hidden ) {
						tween.end = tween.start;
						tween.start = prop === "width" || prop === "height" ? 1 : 0;
					}
				}
			}

		// If this is a noop like .hide().hide(), restore an overwritten display value
		} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
			style.display = display;
		}
	}

	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( jQuery.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}

			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}

			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];

				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}

	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {

				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

					// Support: Android 2.3
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( percent );
				}

				deferred.notifyWith( elem, [ animation, percent, remaining ] );

				if ( percent < 1 && length ) {
					return remaining;
				} else {
					deferred.resolveWith( elem, [ animation ] );
					return false;
				}
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,

						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length ; index++ ) {
						animation.tweens[ index ].run( 1 );
					}

					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;

		propFilter( props, animation.opts.specialEasing );

		for ( ; index < length ; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}

		jQuery.map( props, createTween, animation );

		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}

		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);

		// attach callbacks from options
		return animation.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );
	}

	jQuery.Animation = jQuery.extend( Animation, {
		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},

		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnotwhite );
			}

			var prop,
				index = 0,
				length = props.length;

			for ( ; index < length ; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},

		prefilters: [ defaultPrefilter ],

		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );

	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
			opt.duration : opt.duration in jQuery.fx.speeds ?
				jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};

		return opt;
	};

	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {

			// Show any hidden elements after setting opacity to 0
			return this.filter( isHidden ).css( "opacity", 0 ).show()

				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {

					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );

					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;

			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};

			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}

			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );

				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}

				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {

						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}

				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;

				// Enable finishing flag on private data
				data.finish = true;

				// Empty the queue first
				jQuery.queue( this, type, [] );

				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}

				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}

				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}

				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );

	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );

	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );

	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;

		fxNow = jQuery.now();

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];

			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		if ( timer() ) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};

	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( !timerId ) {
			timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
		}
	};

	jQuery.fx.stop = function() {
		window.clearInterval( timerId );

		timerId = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,

		// Default speed
		_default: 400
	};


	// Based off of the plugin by Clint Helfers, with permission.
	// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};


	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );

		input.type = "checkbox";

		// Support: iOS<=5.1, Android<=4.2+
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";

		// Support: IE<=11+
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;

		// Support: Android<=2.3
		// Options inside disabled selects are incorrectly marked as disabled
		select.disabled = true;
		support.optDisabled = !opt.disabled;

		// Support: IE<=11+
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();


	var boolHook,
		attrHandle = jQuery.expr.attrHandle;

	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},

		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );

	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}

			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[ name ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}

			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}

				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				elem.setAttribute( name, value + "" );
				return value;
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},

		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						jQuery.nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},

		removeAttr: function( elem, value ) {
			var name, propName,
				i = 0,
				attrNames = value && value.match( rnotwhite );

			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					propName = jQuery.propFix[ name ] || name;

					// Boolean attributes get special treatment (#10870)
					if ( jQuery.expr.match.bool.test( name ) ) {

						// Set corresponding property to false
						elem[ propName ] = false;
					}

					elem.removeAttribute( name );
				}
			}
		}
	} );

	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {

				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};
	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;

		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} );




	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;

	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},

		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );

	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}

			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				return ( elem[ name ] = value );
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			return elem[ name ];
		},

		propHooks: {
			tabIndex: {
				get: function( elem ) {

					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );

					return tabindex ?
						parseInt( tabindex, 10 ) :
						rfocusable.test( elem.nodeName ) ||
							rclickable.test( elem.nodeName ) && elem.href ?
								0 :
								-1;
				}
			}
		},

		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );

	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {
				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {
				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;

					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}

	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );




	var rclass = /[\t\r\n\f]/g;

	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}

	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );

					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {

							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		toggleClass: function( value, stateVal ) {
			var type = typeof value;

			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}

			return this.each( function() {
				var className, i, self, classNames;

				if ( type === "string" ) {

					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnotwhite ) || [];

					while ( ( className = classNames[ i++ ] ) ) {

						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}

				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {

						// Store className if set
						dataPriv.set( this, "__className__", className );
					}

					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},

		hasClass: function( selector ) {
			var className, elem,
				i = 0;

			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + getClass( elem ) + " " ).replace( rclass, " " )
						.indexOf( className ) > -1
				) {
					return true;
				}
			}

			return false;
		}
	} );




	var rreturn = /\r/g,
		rspaces = /[\x20\t\r\n\f]+/g;

	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];

			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];

					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}

					ret = elem.value;

					return typeof ret === "string" ?

						// Handle most common string cases
						ret.replace( rreturn, "" ) :

						// Handle cases where value is null/undef or number
						ret == null ? "" : ret;
				}

				return;
			}

			isFunction = jQuery.isFunction( value );

			return this.each( function( i ) {
				var val;

				if ( this.nodeType !== 1 ) {
					return;
				}

				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";

				} else if ( typeof val === "number" ) {
					val += "";

				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}

				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );

	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {

					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :

						// Support: IE10-11+
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
				}
			},
			select: {
				get: function( elem ) {
					var value, option,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one" || index < 0,
						values = one ? null : [],
						max = one ? index + 1 : options.length,
						i = index < 0 ?
							max :
							one ? index : 0;

					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];

						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&

								// Don't return options that are disabled or in a disabled optgroup
								( support.optDisabled ?
									!option.disabled : option.getAttribute( "disabled" ) === null ) &&
								( !option.parentNode.disabled ||
									!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

							// Get the specific value for the option
							value = jQuery( option ).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;
				},

				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;

					while ( i-- ) {
						option = options[ i ];
						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}
					}

					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );

	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );




	// Return jQuery for attributes-only inclusion


	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

	jQuery.extend( jQuery.event, {

		trigger: function( event, data, elem, onlyHandlers ) {

			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

			cur = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "." ) > -1 ) {

				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );

			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;

				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}

				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {

				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {

					// Call a native DOM method on the target with the same name name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];

						if ( tmp ) {
							elem[ ontype ] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;

						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		// Piggyback on a donor event to simulate a different one
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true

					// Previously, `originalEvent: {}` was set here, so stopPropagation call
					// would not be triggered on donor event, since in our own
					// jQuery.event.stopPropagation function we had a check for existence of
					// originalEvent.stopPropagation method, so, consequently it would be a noop.
					//
					// But now, this "simulate" function is used only for events
					// for which stopPropagation() is noop, so there is no need for that anymore.
					//
					// For the 1.x branch though, guard for "click" and "submit"
					// events is still used, but was moved to jQuery.event.stopPropagation function
					// because `originalEvent` should point to the original event for the constancy
					// with other events and for more focused logic
				}
			);

			jQuery.event.trigger( e, null, elem );

			if ( e.isDefaultPrevented() ) {
				event.preventDefault();
			}
		}

	} );

	jQuery.fn.extend( {

		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );


	jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
		function( i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );

	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );




	support.focusin = "onfocusin" in window;


	// Support: Firefox
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome, Safari
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};

			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );

					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;

					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );

					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;

	var nonce = jQuery.now();

	var rquery = ( /\?/ );



	// Support: Android 2.3
	// Workaround failure to string-cast null input
	jQuery.parseJSON = function( data ) {
		return JSON.parse( data + "" );
	};


	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE9
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};


	var
		rhash = /#.*$/,
		rts = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,

		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},

		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},

		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),

		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {

		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {

			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

			if ( jQuery.isFunction( func ) ) {

				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {

					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

		var inspected = {},
			seekingTransport = ( structure === transports );

		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}

		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}

		return target;
	}

	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {

		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}

		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {

			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}

			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}

	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},

			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while ( current ) {

			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}

			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}

			prev = current;
			current = dataTypes.shift();

			if ( current ) {

			// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {

					current = prev;

				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {

					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];

					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {

							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {

								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {

									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];

									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if ( conv !== true ) {

						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend( {

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?

				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},

		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),

		// Main method
		ajax: function( url, options ) {

			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var transport,

				// URL without anti-cache param
				cacheURL,

				// Response headers
				responseHeadersString,
				responseHeaders,

				// timeout handle
				timeoutTimer,

				// Url cleanup var
				urlAnchor,

				// To know if global events are to be dispatched
				fireGlobals,

				// Loop variable
				i,

				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),

				// Callbacks context
				callbackContext = s.context || s,

				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,

				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),

				// Status-dependent callbacks
				statusCode = s.statusCode || {},

				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},

				// The jqXHR state
				state = 0,

				// Default abort message
				strAbort = "canceled",

				// Fake xhr
				jqXHR = {
					readyState: 0,

					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( state === 2 ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},

					// Raw string
					getAllResponseHeaders: function() {
						return state === 2 ? responseHeadersString : null;
					},

					// Caches the header
					setRequestHeader: function( name, value ) {
						var lname = name.toLowerCase();
						if ( !state ) {
							name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},

					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( !state ) {
							s.mimeType = type;
						}
						return this;
					},

					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( state < 2 ) {
								for ( code in map ) {

									// Lazy-add the new callback in a way that preserves old ones
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							} else {

								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							}
						}
						return this;
					},

					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};

			// Attach deferreds
			deferred.promise( jqXHR ).complete = completeDeferred.add;
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;

			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
				.replace( rprotocol, location.protocol + "//" );

			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );

				// Support: IE8-11+
				// IE throws exception if url is malformed, e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;

					// Support: IE8-11+
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {

					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}

			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}

			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

			// If request was aborted inside a prefilter, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;

			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			cacheURL = s.url;

			// More options handling for requests with no content
			if ( !s.hasContent ) {

				// If data is available, append data to url
				if ( s.data ) {
					cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add anti-cache in url if needed
				if ( s.cache === false ) {
					s.url = rts.test( cacheURL ) ?

						// If there is already a '_' parameter, set its value
						cacheURL.replace( rts, "$1_=" + nonce++ ) :

						// Otherwise add one to the end
						cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
				}
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}

			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);

			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}

			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

				// Abort if not done already and return
				return jqXHR.abort();
			}

			// Aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			for ( i in { success: 1, error: 1, complete: 1 } ) {
				jqXHR[ i ]( s[ i ] );
			}

			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}

				// If request was aborted inside ajaxSend, stop there
				if ( state === 2 ) {
					return jqXHR;
				}

				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}

				try {
					state = 1;
					transport.send( requestHeaders, done );
				} catch ( e ) {

					// Propagate exception as error if not done
					if ( state < 2 ) {
						done( -1, e );

					// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}

			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;

				// Called once
				if ( state === 2 ) {
					return;
				}

				// State is "done" now
				state = 2;

				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );

				// If successful, handle type chaining
				if ( isSuccess ) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}

					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";

					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";

					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {

					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";

				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}

				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;

				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}

				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}

			return jqXHR;
		},

		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},

		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );

	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {

			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );


	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,

			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		} );
	};


	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;

			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapAll( html.call( this, i ) );
				} );
			}

			if ( this[ 0 ] ) {

				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function() {
					var elem = this;

					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}

					return elem;
				} ).append( this );
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},

		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );

			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function() {
			return this.parent().each( function() {
				if ( !jQuery.nodeName( this, "body" ) ) {
					jQuery( this ).replaceWith( this.childNodes );
				}
			} ).end();
		}
	} );


	jQuery.expr.filters.hidden = function( elem ) {
		return !jQuery.expr.filters.visible( elem );
	};
	jQuery.expr.filters.visible = function( elem ) {

		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		// Use OR instead of AND as the element is not visible if either is true
		// See tickets #10406 and #13132
		return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
	};




	var r20 = /%20/g,
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams( prefix, obj, traditional, add ) {
		var name;

		if ( jQuery.isArray( obj ) ) {

			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {

					// Treat each array item as a scalar.
					add( prefix, v );

				} else {

					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );

		} else if ( !traditional && jQuery.type( obj ) === "object" ) {

			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}

		} else {

			// Serialize scalar item.
			add( prefix, obj );
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, value ) {

				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );

		} else {

			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	};

	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {

				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();

				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val ) {
							return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
						} ) :
						{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );


	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};

	var xhrSuccessStatus = {

			// File protocol always yields status code 0, assume 200
			0: 200,

			// Support: IE9
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();

	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;

	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();

					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}

					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {

									// Support: IE9
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(

											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,

										// Support: IE9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};

					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );

					// Support: IE9
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {

							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {

								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}

					// Create the abort callback
					callback = callback( "abort" );

					try {

						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {

						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},

				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );

	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );

	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {

		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);

					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;

			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};

			// Force json dataType
			s.dataTypes[ 0 ] = "json";

			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always( function() {

				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );

				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}

				// Save back as free
				if ( s[ callbackName ] ) {

					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}

				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}

				responseContainer = overwritten = undefined;
			} );

			// Delegate to script
			return "script";
		}
	} );




	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}

		parsed = buildFragment( [ data ], context, scripts );

		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	};


	// Keep a copy of the old load method
	var _load = jQuery.fn.load;

	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );
		}

		var selector, type, response,
			self = this,
			off = url.indexOf( " " );

		if ( off > -1 ) {
			selector = jQuery.trim( url.slice( off ) );
			url = url.slice( 0, off );
		}

		// If it's a function
		if ( jQuery.isFunction( params ) ) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,

				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {

				// Save response for use in complete callback
				response = arguments;

				self.html( selector ?

					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

					// Otherwise use the full result
					responseText );

			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( self, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}

		return this;
	};




	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );




	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};




	/**
	 * Gets a window from an element
	 */
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
	}

	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};

			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;

			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}

			if ( jQuery.isFunction( options ) ) {

				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}

			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}

			if ( "using" in options ) {
				options.using.call( elem, props );

			} else {
				curElem.css( props );
			}
		}
	};

	jQuery.fn.extend( {
		offset: function( options ) {
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}

			var docElem, win,
				elem = this[ 0 ],
				box = { top: 0, left: 0 },
				doc = elem && elem.ownerDocument;

			if ( !doc ) {
				return;
			}

			docElem = doc.documentElement;

			// Make sure it's not a disconnected DOM node
			if ( !jQuery.contains( docElem, elem ) ) {
				return box;
			}

			box = elem.getBoundingClientRect();
			win = getWindow( doc );
			return {
				top: box.top + win.pageYOffset - docElem.clientTop,
				left: box.left + win.pageXOffset - docElem.clientLeft
			};
		},

		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}

			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };

			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {

				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();

			} else {

				// Get *real* offsetParent
				offsetParent = this.offsetParent();

				// Get correct offsets
				offset = this.offset();
				if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}

				// Add offsetParent borders
				parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
			}

			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},

		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;

				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}

				return offsetParent || documentElement;
			} );
		}
	} );

	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;

		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {
				var win = getWindow( elem );

				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}

				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);

				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );

	// Support: Safari<7-8+, Chrome<37-44+
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );

					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );


	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {

			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

				return access( this, function( elem, type, value ) {
					var doc;

					if ( jQuery.isWindow( elem ) ) {

						// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
						// isn't a whole lot we can do. See pull request at this URL for discussion:
						// https://github.com/jquery/jquery/pull/764
						return elem.document.documentElement[ "client" + name ];
					}

					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}

					return value === undefined ?

						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :

						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable, null );
			};
		} );
	} );


	jQuery.fn.extend( {

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {

			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		},
		size: function() {
			return this.length;
		}
	} );

	jQuery.fn.andSelf = jQuery.fn.addBack;




	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.

	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}



	var

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite
		_$ = window.$;

	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}

	return jQuery;
	}));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery, $) {"use strict";var _typeof2=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};var monkey= /******/function(modules){ // webpackBootstrap
	/******/ // The module cache
	/******/var installedModules={}; /******/ // The require function
	/******/function __webpack_require__(moduleId){ /******/ // Check if module is in cache
	/******/if(installedModules[moduleId]) /******/return installedModules[moduleId].exports; /******/ // Create a new module (and put it into the cache)
	/******/var module=installedModules[moduleId]={ /******/exports:{}, /******/id:moduleId, /******/loaded:false /******/}; /******/ // Execute the module function
	/******/modules[moduleId].call(module.exports,module,module.exports,__webpack_require__); /******/ // Flag the module as loaded
	/******/module.loaded=true; /******/ // Return the exports of the module
	/******/return module.exports; /******/} /******/ // expose the modules object (__webpack_modules__)
	/******/__webpack_require__.m=modules; /******/ // expose the module cache
	/******/__webpack_require__.c=installedModules; /******/ // __webpack_public_path__
	/******/__webpack_require__.p=""; /******/ // Load entry module and return exports
	/******/return __webpack_require__(0); /******/}( /************************************************************************/ /******/[ /* 0 */ /***/function(module,exports,__webpack_require__){"use strict";var _typeof=typeof Symbol==="function"&&_typeof2(Symbol.iterator)==="symbol"?function(obj){return typeof obj==="undefined"?"undefined":_typeof2(obj);}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj==="undefined"?"undefined":_typeof2(obj);};var _MOKMessage=__webpack_require__(1);var _MOKMessage2=_interopRequireDefault(_MOKMessage);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};} /*
			Main lib of monkey that will be bundled with webpack
		*/ /*
			The following libs in scripts are loaded using the module script-loader 
			of webpack, to be used as global scripts.
			This is a replacement of <script tag>
		*/__webpack_require__(2);__webpack_require__(5);__webpack_require__(7);window.MOKMessage=_MOKMessage2.default;var STATUS={OFFLINE:0,HANDSHAKE:1,CONNECTING:2,ONLINE:3};var MOKMessageProtocolCommand={MESSAGE:200,GET:201,TRANSACTION:202,OPEN:203,SET:204,ACK:205,PUBLISH:206,DELETE:207,CLOSE:208,SYNC:209,MESSAGENOTDELIVERED:50,MESSAGEDELIVERED:51,MESSAGEREAD:52};var MOKMessageType={TEXT:1,FILE:2,TEMP_NOTE:3,NOTIF:4,ALERT:5};var MOKMessageFileType={AUDIO:1,VIDEO:2,PHOTO:3,ARCHIVE:4};var MOKGetType={HISTORY:1,GROUPS:2};var MOKSyncType={HISTORY:1,GROUPS:2};var jQueryScriptOutputted=false;function initJQuery(){ //if the jQuery object isn't available
	if(typeof jQuery=='undefined'){if(!jQueryScriptOutputted){ //only output the script once..
	jQueryScriptOutputted=true;var $script=__webpack_require__(9);$script("//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js",function(){console.log("Monkey is ready");});} //setTimeout("initJQuery()", 50);
	}else {$(function(){ //do anything that needs to be done on document.ready
	console.log("Monkey is ready");});}}initJQuery(); /* Start monkey,js implementation */ //updates from feeds
	var socketConnection=null;var monkey=new function(){this.session={id:null,serverPublic:null,userData:null};this.appKey=null;this.secretKey=null;this.keyStore=null;this.session.expiring=0;this.domainUrl="secure.criptext.com";this.status=STATUS.OFFLINE; // offline default
	this.lastTimestamp=0;this.lastMessageId=0;this.init=function(appKey,secretKey,userObj,optionalExpiring,optionalDebuging){this.appKey=appKey;this.secretKey=secretKey;this.session.userData=userObj; // validate JSON String
	this.keyStore={};this.debugingMode=false;optionalExpiring?this.session.expiring=1:this.session.expiring=0;optionalDebuging?this.debugingMode=true:this.debugingMode=false;if(userObj){userObj.monkey_id?this.session.id=userObj.monkey_id:this.session.id=null;}console.log("====  init domain "+this.domainUrl);startSession();};this.generateLocalizedPush=generateLocalizedPush; //network
	this.sendMessage=sendMessage;this.sendEncryptedMessage=sendEncryptedMessage;this.sendOpenToUser=sendOpenToUser;this.sendNotification=sendNotification;this.publish=publish;this.getPendingMessages=getPendingMessages; //http
	this.subscribe=subscribe;this.sendFile=sendFile;this.sendEncryptedFile=sendEncryptedFile;this.downloadFile=downloadFile;this.createGroup=createGroup;this.addMemberToGroup=addMemberToGroup;this.removeMemberFromGroup=removeMemberFromGroup;this.getInfoById=getInfoById;this.getAllConversations=getAllConversations;this.getConversationMessages=getConversationMessages; //check if there's reason for this to exist
	this.getMessagesSince=getMessagesSince;}(); /*
		    NETWORKING
		 */function sendCommand(command,args){var finalMessage=JSON.stringify({cmd:command,args:args});console.log("================");console.log("Monkey - sending message: "+finalMessage);console.log("================");socketConnection.send(finalMessage);}function sendOpenToUser(monkeyId){sendCommand(MOKMessageProtocolCommand.OPEN,{rid:monkeyId});}function startConnection(monkey_id){var token=monkey.appKey+":"+monkey.secretKey;if(monkey.debugingMode){ //no ssl
	socketConnection=new WebSocket('ws://'+monkey.domainUrl+'/websockets?monkey_id='+monkey_id+'&p='+token,'criptext-protocol');}else {socketConnection=new WebSocket('wss://'+monkey.domainUrl+'/websockets?monkey_id='+monkey_id+'&p='+token,'criptext-protocol');}socketConnection.onopen=function(){monkey.status=STATUS.ONLINE;$(monkey).trigger("onConnect",{monkey_id:monkey.session.id});getPendingMessages();};socketConnection.onmessage=function(evt){console.log("incoming message: "+evt.data);var jsonres=JSON.parse(evt.data);if(jsonres.args.app_id==null){jsonres.args.app_id=monkey.appKey;}var msg=new _MOKMessage2.default(jsonres.cmd,jsonres.args);switch(parseInt(jsonres.cmd)){case MOKMessageProtocolCommand.MESSAGE:{processMOKProtocolMessage(msg);break;}case MOKMessageProtocolCommand.PUBLISH:{processMOKProtocolMessage(msg);break;}case MOKMessageProtocolCommand.ACK:{ //msg.protocolCommand = MOKMessageProtocolCommand.ACK;
	//msg.monkeyType = set status value from props
	processMOKProtocolACK(msg);break;}case MOKMessageProtocolCommand.GET:{ //notify watchdog
	switch(jsonres.args.type){case MOKGetType.HISTORY:{var arrayMessages=jsonres.args.messages;var remaining=jsonres.args.remaining_messages;processGetMessages(arrayMessages,remaining);break;}case MOKGetType.GROUPS:{msg.protocolCommand=MOKMessageProtocolCommand.GET;msg.protocolType=MOKMessageType.NOTIF; //monkeyType = MOKGroupsJoined;
	msg.text=jsonres.args.messages;$(monkey).trigger("onNotification",msg);break;}}break;}case MOKMessageProtocolCommand.SYNC:{ //notify watchdog
	switch(jsonres.args.type){case MOKSyncType.HISTORY:{var arrayMessages=jsonres.args.messages;var remaining=jsonres.args.remaining_messages;processSyncMessages(arrayMessages,remaining);break;}case MOKSyncType.GROUPS:{msg.protocolCommand=MOKMessageProtocolCommand.GET;msg.protocolType=MOKMessageType.NOTIF; //monkeyType = MOKGroupsJoined;
	msg.text=jsonres.args.messages;$(monkey).trigger("onNotification",msg);break;}}break;}case MOKMessageProtocolCommand.OPEN:{msg.protocolCommand=MOKMessageProtocolCommand.OPEN;$(monkey).trigger("onNotification",msg);break;}default:{$(monkey).trigger("onNotification",msg);break;}}};socketConnection.onclose=function(evt){ //check if the web server disconnected me
	if(evt.wasClean){console.log("Websocket closed - Connection closed... "+evt);monkey.status=STATUS.OFFLINE;}else { //web server crashed, reconnect
	console.log("Websocket closed - Reconnecting... "+evt);monkey.status=STATUS.CONNECTING;setTimeout(startConnection(monkey_id),2000);}$(monkey).trigger("onDisconnect");};}function processGetMessages(messages,remaining){processMultipleMessages(messages);if(remaining>0){requestMessagesSinceId(monkey.lastMessageId,15,false);}}function processSyncMessages(messages,remaining){processMultipleMessages(messages);if(remaining>0){requestMessagesSinceTimestamp(monkey.lastTimestamp,15,false);}}function getPendingMessages(){requestMessagesSinceTimestamp(monkey.lastTimestamp,15,false);}function requestMessagesSinceId(lastMessageId,quantity,withGroups){var args={messages_since:lastMessageId,qty:quantity};if(withGroups==true){args.groups=1;}sendCommand(MOKMessageProtocolCommand.GET,args);}function requestMessagesSinceTimestamp(lastTimestamp,quantity,withGroups){var args={since:lastTimestamp,qty:quantity};if(withGroups==true){args.groups=1;}sendCommand(MOKMessageProtocolCommand.SYNC,args);}function processMOKProtocolMessage(message){console.log("===========================");console.log("MONKEY - Message in process: "+message.id+" type: "+message.protocolType);console.log("===========================");switch(message.protocolType){case MOKMessageType.TEXT:{incomingMessage(message);break;}case MOKMessageType.FILE:{fileReceived(message);break;}default:{$(monkey).trigger("onNotification",message);break;}}}function processMultipleMessages(messages){for(var i=messages.length-1;i>=0;i--){var msg=new _MOKMessage2.default(MOKMessageProtocolCommand.MESSAGE,messages[i]);processMOKProtocolMessage(msg);}}function processMOKProtocolACK(message){console.log("===========================");console.log("MONKEY - ACK in process");console.log("==========================="); //Aditional treatment can be done here
	$(monkey).trigger("onAcknowledge",message);}function incomingMessage(message){if(message.isEncrypted()){try{message.text=aesDecryptIncomingMessage(message);}catch(error){console.log("===========================");console.log("MONKEY - Fail decrypting: "+message.id+" type: "+message.protocolType);console.log("==========================="); //get keys
	getAESkeyFromUser(message.senderId,message,function(response){if(response!=null){incomingMessage(message);}});return;}if(message.text==null){ //get keys
	getAESkeyFromUser(message.senderId,message,function(response){if(response!=null){incomingMessage(message);}});return;}}else {message.text=message.encryptedText;}if(message.id>0){monkey.lastTimestamp=message.datetimeCreation;monkey.lastMessageId=message.id;}switch(message.protocolCommand){case MOKMessageProtocolCommand.MESSAGE:{$(monkey).trigger("onMessage",message);break;}case MOKMessageProtocolCommand.PUBLISH:{$(monkey).trigger("onChannelMessages",message);break;}}}function fileReceived(message){if(message.id>0){monkey.lastTimestamp=message.datetimeCreation;monkey.lastMessageId=message.id;}$(monkey).trigger("onMessage",message);} /*
		    API CONNECTOR
		 */ /** Handling any type ajax request to api */function basicAjaxRequest(methodName,endpointUrl,dataObj,onSuccess){console.log("Sending keys app "+monkey.appKey+" sec "+monkey.secretKey);console.log("==== domainUrl "+monkey.domainUrl+" endpointUrl "+endpointUrl);var basic=getAuthParamsBtoA(monkey.appKey+":"+monkey.secretKey); //setup request url
	var reqUrl=monkey.domainUrl+endpointUrl;if(monkey.debugingMode){ //no ssl
	reqUrl="http://"+reqUrl;}else {reqUrl="https://"+reqUrl;}$.ajax({type:methodName,url:reqUrl,data:{data:JSON.stringify(dataObj)},async:true,xhrFields:{withCredentials:true},beforeSend:function beforeSend(xhr){xhr.setRequestHeader('Accept','*/*');xhr.setRequestHeader("Authorization","Basic "+basic);},success:function success(respObj){onSuccess(null,respObj);},error:function error(err){onSuccess(err);}}); // end of AJAX CALL
	}function startSession(){var currentMonkeyId=null;if(monkey.session.id){currentMonkeyId=monkey.session.id;}var params={user_info:monkey.session.userData,session_id:currentMonkeyId,expiring:monkey.session.expiring};monkey.status=STATUS.HANDSHAKE;basicAjaxRequest("POST","/user/session",params,function(err,respObj){if(err){console.log(err);return;}if(respObj.data.monkeyId){monkey.session.id=respObj.data.monkeyId;}monkey.session.serverPublic=respObj.data.publicKey;$(monkey).trigger("onSession",{monkey_id:monkey.session.id});monkey.status=STATUS.CONNECTING;if(currentMonkeyId==monkey.session.id){console.log("Reusing Monkey ID : "+monkey.session.id);return syncKeys(monkey.session.id);}var myKeyParams=generateSessionKey(); // generates local AES KEY
	var encryptedConnectParams=encryptSessionParams(myKeyParams,respObj.data.publicKey);monkey.keyStore[monkey.session.id]={key:monkey.session.myKey,iv:monkey.session.myIv};connect(monkey.session.id,encryptedConnectParams);});} /// end of function startSession
	function connect(monkeyId,usk){console.log(" MonkeyId "+monkeyId+" USK "+usk);basicAjaxRequest("POST","/user/connect",{monkey_id:monkeyId,usk:usk},function(err,respObj){if(err){console.log(err);return;}console.log("Monkey - Connection to establish "+respObj);startConnection(monkeyId);});}function subscribe(channelname,callback){basicAjaxRequest("POST","/channel/subscribe/"+channelname,{monkey_id:monkey.session.id},function(err,respObj){if(err){return;}$(monkey).trigger("onSubscribe",respObj);});}function syncKeys(monkeyId){ // generate public key and private key for exchange
	// send public key to the server to encrypt the data at the server and then decrypt it
	generateExchangeKeys();basicAjaxRequest("POST","/user/key/sync",{monkey_id:monkeyId,public_key:monkey.session.exchangeKeys.getPublicKey()},function(err,respObj){if(err){console.log(err);return;}console.log(respObj);console.log(JSON.stringify(respObj));monkey.lastTimestamp=respObj.data.last_time_synced;monkey.lastMessageId=respObj.data.last_message_id;var decryptedAesKeys=monkey.session.exchangeKeys.decrypt(respObj.data.keys);console.log("de "+decryptedAesKeys);var myAesKeys=decryptedAesKeys.split(":");monkey.session.myKey=myAesKeys[0];monkey.session.myIv=myAesKeys[1]; //var myKeyParams=generateSessionKey();// generates local AES KEY
	monkey.keyStore[monkeyId]={key:monkey.session.myKey,iv:monkey.session.myIv};startConnection(monkeyId);});}function createGroup(members,groupInfo,optionalPush,optionalId,callback){ //check if I'm already in the proposed members
	if(members.indexOf(monkey.session.id)==-1){members.push(monkey.session.id);}basicAjaxRequest("POST","/group/create",{monkey_id:monkey.session.id,members:members.join(),info:groupInfo,group_id:optionalId,push_all_members:optionalPush},function(err,respObj){if(err){console.log("Monkey - error creating group: "+err);return callback(err);}console.log("Monkey - Success creating group"+respObj.data.group_id);return callback(null,respObj.data);});}function addMemberToGroup(groupId,newMemberId,optionalPushNewMember,optionalPushExistingMembers,callback){basicAjaxRequest("POST","/group/addmember",{monkey_id:monkey.session.id,new_member:newMemberId,group_id:groupId,push_new_member:optionalPushNewMember,push_all_members:optionalPushExistingMembers},function(err,respObj){if(err){console.log("Monkey - error adding member: "+err);return callback(err);}return callback(null,respObj.data);});}function removeMemberFromGroup(groupId,memberId,callback){basicAjaxRequest("POST","/group/delete",{monkey_id:memberId,group_id:groupId},function(err,respObj){if(err){console.log("Monkey - error removing member: "+err);return callback(err);}return callback(null,respObj.data);});}function getInfoById(monkeyId,callback){var endpoint="/info/"+monkeyId; //check if it's a group
	if(monkeyId.indexOf("G:")>-1){endpoint="/group"+endpoint;}else {endpoint="/user"+endpoint;}basicAjaxRequest("GET",endpoint,{},function(err,respObj){if(err){console.log("Monkey - error get info: "+err);return callback(err);}return callback(null,respObj.data);});} /*
		    SECURITY
		 */function getAESkeyFromUser(monkeyId,pendingMessage,callback){basicAjaxRequest("POST","/user/key/exchange",{monkey_id:monkey.session.id,user_to:monkeyId},function(err,respObj){if(err){console.log("Monkey - error on getting aes keys "+err);return;}console.log("Monkey - Received new aes keys");var newParamKeys=aesDecrypt(respObj.data.convKey,monkey.session.id).split(":");var newAESkey=newParamKeys[0];var newIv=newParamKeys[1];var currentParamKeys=monkey.keyStore[respObj.data.session_to];monkey.keyStore[respObj.data.session_to]={key:newParamKeys[0],iv:newParamKeys[1]};if(typeof currentParamKeys=="undefined"){return callback(pendingMessage);} //check if it's the same key
	if(newParamKeys[0]==currentParamKeys.key&&newParamKeys[1]==currentParamKeys.iv){requestEncryptedTextForMessage(pendingMessage,function(decryptedMessage){callback(decryptedMessage);});}else { //it's a new key
	callback(pendingMessage);}});}function requestEncryptedTextForMessage(message,callback){basicAjaxRequest("GET","/message/"+message.id+"/open/secure",{},function(err,respObj){if(err){console.log("Monkey - error on requestEncryptedTextForMessage: "+err);return callback(null);}console.log(respObj);message.encryptedText=respObj.data.message;message.encryptedText=aesDecrypt(message.encryptedText,monkey.session.id);if(message.encryptedText==null){if(message.id>0){monkey.lastTimestamp=message.datetimeCreation;monkey.lastMessageId=message.id;}return callback(null);}message.encryptedText=message.text;message.setEncrypted(false);return callback(message);});}function aesDecryptIncomingMessage(message){return aesDecrypt(message.encryptedText,message.senderId);}function aesDecrypt(dataToDecrypt,monkeyId){var aesObj=monkey.keyStore[monkeyId];var aesKey=CryptoJS.enc.Base64.parse(aesObj.key);var initV=CryptoJS.enc.Base64.parse(aesObj.iv);var cipherParams=CryptoJS.lib.CipherParams.create({ciphertext:CryptoJS.enc.Base64.parse(dataToDecrypt)});var decrypted=CryptoJS.AES.decrypt(cipherParams,aesKey,{iv:initV}).toString(CryptoJS.enc.Utf8);return decrypted;}function decryptFile(fileToDecrypt,monkeyId){var aesObj=monkey.keyStore[monkeyId];var aesKey=CryptoJS.enc.Base64.parse(aesObj.key);var initV=CryptoJS.enc.Base64.parse(aesObj.iv);var decrypted=CryptoJS.AES.decrypt(fileToDecrypt,aesKey,{iv:initV}).toString(CryptoJS.enc.Base64); // console.log('el tipo del archivo decriptado: '+ typeof(decrypted));
	return decrypted;}function aesEncrypt(dataToEncrypt,monkeyId){var aesObj=monkey.keyStore[monkeyId];var aesKey=CryptoJS.enc.Base64.parse(aesObj.key);var initV=CryptoJS.enc.Base64.parse(aesObj.iv);var encryptedData=CryptoJS.AES.encrypt(dataToEncrypt,aesKey,{iv:initV});return encryptedData.toString();}function compress(fileData){var binData=mok_convertDataURIToBinary(fileData);var gzip=new Zlib.Gzip(binData);var compressedBinary=gzip.compress(); //descompress
	// Uint8Array to base64
	var compressedArray=new Uint8Array(compressedBinary);var compressedBase64=mok_arrayBufferToBase64(compressedArray); //this should be added by client 'data:image/png;base64'
	return compressedBase64;}function decompress(fileData){var binData=mok_convertDataURIToBinary(fileData);var gunzip=new Zlib.Gunzip(binData);var decompressedBinary=gunzip.decompress(); //descompress
	// Uint8Array to base64
	var decompressedArray=new Uint8Array(decompressedBinary);var decompressedBase64=mok_arrayBufferToBase64(decompressedArray); //this should be added by client 'data:image/png;base64'
	return decompressedBase64;} /*
		    TO BE DETERMINED
		 */function generateTemporalId(){return Math.round(new Date().getTime()/1000*-1);}function mok_convertDataURIToBinary(dataURI){var raw=window.atob(dataURI);var rawLength=raw.length;var array=new Uint8Array(new ArrayBuffer(rawLength));for(var i=0;i<rawLength;i++){array[i]=raw.charCodeAt(i);}return array;}function mok_arrayBufferToBase64(buffer){var binary='';var bytes=new Uint8Array(buffer);var len=bytes.byteLength;for(var i=0;i<len;i++){binary+=String.fromCharCode(bytes[i]);}return window.btoa(binary);}function mok_getFileExtension(fileName){var arr=fileName.split('.');var extension=arr[arr.length-1];return extension;}function cleanFilePrefix(fileData){var cleanFileData=fileData; //check for possible ;base64,
	if(fileData.indexOf(",")>-1){cleanFileData=fileData.slice(fileData.indexOf(",")+1);}return cleanFileData;} /*
		    ARGS:{
		        rid .- recipient monkey id 
		        msg .- message text to send
		        params. JSON object with encr==1 if encrypted, eph=1 if ephemeral, compr:gzip
		        type .- 1 messsage, 2 files, 3 temporal notes, 4 notifications, 5 alerts
		    }
		    
		    params:{
		        encr:1,

		    }
		*/function sendMessage(text,recipientMonkeyId,optionalParams,optionalPush){var props={device:"web",encr:0};return sendText(MOKMessageProtocolCommand.MESSAGE,text,recipientMonkeyId,props,optionalParams,optionalPush);}function sendEncryptedMessage(text,recipientMonkeyId,optionalParams,optionalPush){var props={device:"web",encr:1};return sendText(MOKMessageProtocolCommand.MESSAGE,text,recipientMonkeyId,props,optionalParams,optionalPush);}function sendText(cmd,text,recipientMonkeyId,props,optionalParams,optionalPush){var args=prepareMessageArgs(recipientMonkeyId,props,optionalParams,optionalPush);args.msg=text;args.type=MOKMessageType.TEXT;var message=new _MOKMessage2.default(cmd,args);args.id=message.id;args.oldId=message.oldId;if(message.isEncrypted()){message.encryptedText=aesEncrypt(text,monkey.session.id);args.msg=message.encryptedText;}sendCommand(cmd,args);return message;}function sendNotification(recipientMonkeyId,optionalParams,optionalPush){var props={device:"web"};var args=prepareMessageArgs(recipientMonkeyId,props,optionalParams,optionalPush);args.type=MOKMessageType.NOTIF;var message=new _MOKMessage2.default(MOKMessageProtocolCommand.MESSAGE,args);args.id=message.id;args.oldId=message.oldId;sendCommand(MOKMessageProtocolCommand.MESSAGE,args);return message;}function prepareMessageArgs(recipientMonkeyId,props,optionalParams,optionalPush){var args={app_id:monkey.appKey,sid:monkey.session.id,rid:recipientMonkeyId,props:JSON.stringify(props),params:JSON.stringify(optionalParams)};switch(typeof optionalPush==="undefined"?"undefined":_typeof(optionalPush)){case "object":{if(optionalPush==null){optionalPush={};}break;}case "string":{optionalPush=generateStandardPush(optionalPush);break;}default:optionalPush={};break;}args["push"]=JSON.stringify(optionalPush);return args;}function publish(text,channelName,optionalParams){var props={device:"web",encr:0};return sendText(MOKMessageProtocolCommand.PUBLISH,text,channelName,props,optionalParams);}function sendFile(data,recipientMonkeyId,fileName,mimeType,fileType,shouldCompress,optionalParams,optionalPush,callback){var props={device:"web",encr:0,file_type:fileType,ext:mok_getFileExtension(fileName),filename:fileName};if(shouldCompress){props.cmpr="gzip";}if(mimeType){props.mime_type=mimeType;}return uploadFile(data,recipientMonkeyId,fileName,props,optionalParams,function(error,message){if(error){callback(error,message);}callback(null,message);});}function sendEncryptedFile(data,recipientMonkeyId,fileName,mimeType,fileType,shouldCompress,optionalParams,optionalPush,callback){var props={device:"web",encr:1,file_type:fileType,ext:mok_getFileExtension(fileName),filename:fileName};if(shouldCompress){props.cmpr="gzip";}if(mimeType){props.mime_type=mimeType;}return uploadFile(data,recipientMonkeyId,fileName,props,optionalParams,optionalPush,function(error,message){if(error){callback(error,message);}callback(null,message);});}function uploadFile(fileData,recipientMonkeyId,fileName,props,optionalParams,optionalPush,callback){fileData=cleanFilePrefix(fileData);var binData=mok_convertDataURIToBinary(fileData);props.size=binData.size;var args=prepareMessageArgs(recipientMonkeyId,props,optionalParams,optionalPush);args.msg=fileName;args.type=MOKMessageType.FILE;var message=new _MOKMessage2.default(MOKMessageProtocolCommand.MESSAGE,args);args.id=message.id;args.oldId=message.oldId;args.props=message.props;args.params=message.params;if(message.isCompressed()){fileData=compress(fileData);}if(message.isEncrypted()){fileData=aesEncrypt(fileData,monkey.session.id);}var fileToSend=new Blob([fileData.toString()],{type:message.props.file_type});fileToSend.name=fileName;var basic=getAuthParamsBtoA(monkey.appKey+":"+monkey.secretKey);var data=new FormData(); //agrega el archivo y la info al form
	data.append("file",fileToSend);data.append("data",JSON.stringify(args)); //setup request url
	var reqUrl=monkey.domainUrl+"/file/new/base64";if(monkey.debugingMode){ //no ssl
	reqUrl="http://"+reqUrl;}else {reqUrl="https://"+reqUrl;}$.ajax({url:reqUrl,type:"POST",data:data,cache:false,dataType:"json",processData:false,contentType:false,beforeSend:function beforeSend(xhr){xhr.setRequestHeader('Accept','*/*');xhr.setRequestHeader("Authorization","Basic "+basic);},success:function success(respObj){console.log('Monkey - upload file OK');message.id=respObj.data.messageId;callback(null,message);},error:function error(errorMSg){console.log('Monkey - upload file Fail');callback(errorMSg.toString(),message);}});return message;}function getAllConversations(onComplete){var basic=getAuthParamsBtoA(monkey.appKey+":"+monkey.secretKey); //setup request url
	var reqUrl=monkey.domainUrl+"/user/"+monkey.session.id+"/conversations";if(monkey.debugingMode){ //no ssl
	reqUrl="http://"+reqUrl;}else {reqUrl="https://"+reqUrl;}$.ajax({type:"GET",url:reqUrl,xhrFields:{withCredentials:true},beforeSend:function beforeSend(xhr){xhr.setRequestHeader('Accept','*/*');xhr.setRequestHeader("Authorization","Basic "+basic);},success:function success(respObj){console.log("GET ALL CONVERSATIONS");onComplete(respObj);},error:function error(err){console.log('FAIL TO GET ALL CONVERSATIONS');onComplete(null,err.toString());}}); // end of AJAX CALL
	}function getConversationMessages(conversationId,numberOfMessages,lastMessageId,onComplete){if(lastMessageId==null){lastMessageId="";}var basic=getAuthParamsBtoA(monkey.appKey+":"+monkey.secretKey); //setup request url
	var reqUrl=monkey.domainUrl+"/conversation/messages/"+monkey.session.id+"/"+conversationId+"/"+numberOfMessages+"/"+lastMessageId;if(monkey.debugingMode){ //no ssl
	reqUrl="http://"+reqUrl;}else {reqUrl="https://"+reqUrl;}$.ajax({type:"GET",url:reqUrl,xhrFields:{withCredentials:true},beforeSend:function beforeSend(xhr){xhr.setRequestHeader('Accept','*/*');xhr.setRequestHeader("Authorization","Basic "+basic);},success:function success(respObj){console.log("GET CONVERSATION MESSAGES");var messages=respObj.data.messages;var messagesArray=[];for(var i=messages.length-1;i>=0;i--){var msg=new _MOKMessage2.default(MOKMessageProtocolCommand.MESSAGE,messages[i]);messagesArray.push(msg);} //TODO: decrypt bulk messages and send to callback
	decryptBulkMessages(messagesArray,[],function(decryptedMessages){onComplete(null,decryptedMessages);});},error:function error(err){console.log('FAIL TO GET CONVERSATION MESSAGES');onComplete(err);}}); // end of AJAX CALL
	} //recursive function
	function decryptBulkMessages(messages,decryptedMessages,onComplete){if(!(typeof messages!="undefined"&&messages!=null&&messages.length>0)){return onComplete(decryptedMessages);}var message=messages.shift();if(message.isEncrypted()&&message.protocolType!=MOKMessageType.FILE){try{message.text=aesDecryptIncomingMessage(message);}catch(error){console.log("===========================");console.log("MONKEY - Fail decrypting: "+message.id+" type: "+message.protocolType);console.log("==========================="); //get keys
	getAESkeyFromUser(message.senderId,message,function(response){if(response!=null){messages.unshift(message);}decryptBulkMessages(messages,decryptedMessages,onComplete);});return;}if(message.text==null){ //get keys
	getAESkeyFromUser(message.senderId,message,function(response){if(response!=null){messages.unshift(message);}decryptBulkMessages(message,decryptedMessages,onComplete);});return;}}else {message.text=message.encryptedText;}decryptedMessages.push(message);decryptBulkMessages(messages,decryptedMessages,onComplete);}function getMessagesSince(timestamp,onComplete){var basic=getAuthParamsBtoA(monkey.appKey+":"+monkey.secretKey); //setup request url
	var reqUrl=monkey.domainUrl+"/user/"+monkey.session.id+"/messages/"+timestamp;if(monkey.debugingMode){ //no ssl
	reqUrl="http://"+reqUrl;}else {reqUrl="https://"+reqUrl;}$.ajax({type:"GET",url:reqUrl,xhrFields:{withCredentials:true},beforeSend:function beforeSend(xhr){xhr.setRequestHeader('Accept','*/*');xhr.setRequestHeader("Authorization","Basic "+basic);},success:function success(respObj){console.log("GET MESSAGES");onComplete(respObj);},error:function error(err){console.log('FAIL TO GET MESSAGES');onComplete(null,err.toString());}}); // end of AJAX CALL
	}function generateStandardPush(stringMessage){return {"text":stringMessage,"iosData":{"alert":stringMessage,"sound":"default"},"andData":{"alert":stringMessage}};} /*
		locKey = string,
		locArgs = array
		 */function generateLocalizedPush(locKey,locArgs){return {"text":stringMessage,"iosData":{"alert":{"loc-key":locKey,"loc-args":locArgs},"sound":"default"},"andData":{"loc-key":locKey,"loc-args":locArgs}};}function getExtention(filename){var arr=filename.split('.');var extension=arr[arr.length-1];return extension;}function downloadFile(message,onComplete){var basic=getAuthParamsBtoA(monkey.appKey+":"+monkey.secretKey); //setup request url
	var reqUrl=monkey.domainUrl+"/file/open/"+message.text+"/base64";if(monkey.debugingMode){ //no ssl
	reqUrl="http://"+reqUrl;}else {reqUrl="https://"+reqUrl;}$.ajax({type:"GET",url:reqUrl,xhrFields:{withCredentials:true},beforeSend:function beforeSend(xhr){xhr.setRequestHeader('Accept','*/*');xhr.setRequestHeader("Authorization","Basic "+basic);},success:function success(fileData){console.log("Monkey - Download File OK");decryptDownloadedFile(fileData,message,function(error,finalData){if(error){console.log("Monkey - Fail to decrypt downloaded file");return onComplete(error);}onComplete(null,finalData);}); // fileCont = monkey.decryptFile(respObj, sid);
	// var gunzip = new Zlib.Gunzip(fileCont);
	// var resp = gunzip.decompress(); //this is not working
	//drawImageMessageBubble(btoa(String.fromCharCode.apply(null, fileCont)),sid,fileName);
	},error:function error(err){console.log('Monkey - Download File Fail');onComplete(err);}}); // end of AJAX CALL
	} /// end of function downloadFile
	function decryptDownloadedFile(fileData,message,callback){if(message.isEncrypted()){var decryptedData=null;try{var currentSize=fileData.length;console.log("Monkey - encrypted file size: "+currentSize); //temporal fix for media sent from web
	if(message.props.device=="web"){decryptedData=aesDecrypt(fileData,message.senderId);}else {decryptedData=decryptFile(fileData,message.senderId);}var newSize=decryptedData.length;console.log("Monkey - decrypted file size: "+newSize);if(currentSize==newSize){getAESkeyFromUser(message.senderId,message,function(response){if(response!=null){decryptDownloadedFile(fileData,message,callback);}else {callback("Error decrypting downloaded file");}});return;}}catch(error){console.log("===========================");console.log("MONKEY - Fail decrypting: "+message.id+" type: "+message.protocolType);console.log("==========================="); //get keys
	getAESkeyFromUser(message.senderId,message,function(response){if(response!=null){decryptDownloadedFile(fileData,message,callback);}else {callback("Error decrypting downloaded file");}});return;}if(decryptedData==null){ //get keys
	getAESkeyFromUser(message.senderId,message,function(response){if(response!=null){decryptDownloadedFile(fileData,message,callback);}else {callback("Error decrypting downloaded file");}});return;}fileData=decryptedData;}if(message.isCompressed()){fileData=decompress(fileData);}callback(null,fileData);}function postMessage(messageObj){ /* {"cmd":"0","args":{"id":"-1423607192","rid":"i5zuxft2zkl3t35gjui60f6r","msg":"IX76YKyM90pXh+FL/R0cNQ=="}}*/console.log("MessageObj sending "+JSON.stringify(messageObj));basicAjaxRequest("POST","/message/new",messageObj,function(err,respObj){if(err){console.log(err);return;}if(parseInt(respObj.status)==0){ // now you can start the long polling calls or the websocket connection you are ready.
	// we need to do a last validation here with an encrypted data that is sent from the server at this response, to validate keys are correct and the session too.
	console.log("Message sent is "+JSON.stringify(respObj));console.log("Message sent is "+respObj.data.messageId);}else { //throw error
	console.log("Error in postMessage "+respObj.message);}});}function generateSessionKey(){var key=CryptoJS.enc.Hex.parse(Generate_key(32)); //256 bits
	var iv=CryptoJS.enc.Hex.parse(Generate_key(16)); //128 bits
	monkey.session.myKey=btoa(key);monkey.session.myIv=btoa(iv); //now you have to encrypt
	return monkey.session.myKey+":"+monkey.session.myIv;}function Generate_key(len){var key="";var hex="0123456789abcdef";for(var i=0;i<len;i++){key+=hex.charAt(Math.floor(Math.random()*16));}return key;}function generateExchangeKeys(){var jsencrypt=new JSEncrypt(); //jsencrypt.getPublicKey()
	monkey.session.exchangeKeys=jsencrypt;}function encryptSessionParams(sessionParams,publicKey){var jsencrypt=new JSEncrypt();jsencrypt.setPublicKey(publicKey);var encryptedData=jsencrypt.encrypt(sessionParams);return encryptedData;}function getAuthParamsBtoA(connectAuthParamsString){ //window.btoa not supported in <=IE9
	if(window.btoa){var basic=window.btoa(connectAuthParamsString);}else { //for <= IE9
	var base64={};base64.PADCHAR='=';base64.ALPHA='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';base64.makeDOMException=function(){ // sadly in FF,Safari,Chrome you can't make a DOMException
	var e,tmp;try{return new DOMException(DOMException.INVALID_CHARACTER_ERR);}catch(tmp){ // not available, just passback a duck-typed equiv
	// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
	// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
	var ex=new Error("DOM Exception 5"); // ex.number and ex.description is IE-specific.
	ex.code=ex.number=5;ex.name=ex.description="INVALID_CHARACTER_ERR"; // Safari/Chrome output format
	ex.toString=function(){return 'Error: '+ex.name+': '+ex.message;};return ex;}};base64.getbyte64=function(s,i){ // This is oddly fast, except on Chrome/V8.
	//  Minimal or no improvement in performance by using a
	//   object with properties mapping chars to value (eg. 'A': 0)
	var idx=base64.ALPHA.indexOf(s.charAt(i));if(idx===-1){throw base64.makeDOMException();}return idx;};base64.decode=function(s){ // convert to string
	s=''+s;var getbyte64=base64.getbyte64;var pads,i,b10;var imax=s.length;if(imax===0){return s;}if(imax%4!==0){throw base64.makeDOMException();}pads=0;if(s.charAt(imax-1)===base64.PADCHAR){pads=1;if(s.charAt(imax-2)===base64.PADCHAR){pads=2;} // either way, we want to ignore this last block
	imax-=4;}var x=[];for(i=0;i<imax;i+=4){b10=getbyte64(s,i)<<18|getbyte64(s,i+1)<<12|getbyte64(s,i+2)<<6|getbyte64(s,i+3);x.push(String.fromCharCode(b10>>16,b10>>8&0xff,b10&0xff));}switch(pads){case 1:b10=getbyte64(s,i)<<18|getbyte64(s,i+1)<<12|getbyte64(s,i+2)<<6;x.push(String.fromCharCode(b10>>16,b10>>8&0xff));break;case 2:b10=getbyte64(s,i)<<18|getbyte64(s,i+1)<<12;x.push(String.fromCharCode(b10>>16));break;}return x.join('');};base64.getbyte=function(s,i){var x=s.charCodeAt(i);if(x>255){throw base64.makeDOMException();}return x;};base64.encode=function(s){if(arguments.length!==1){throw new SyntaxError("Not enough arguments");}var padchar=base64.PADCHAR;var alpha=base64.ALPHA;var getbyte=base64.getbyte;var i,b10;var x=[]; // convert to string
	s=''+s;var imax=s.length-s.length%3;if(s.length===0){return s;}for(i=0;i<imax;i+=3){b10=getbyte(s,i)<<16|getbyte(s,i+1)<<8|getbyte(s,i+2);x.push(alpha.charAt(b10>>18));x.push(alpha.charAt(b10>>12&0x3F));x.push(alpha.charAt(b10>>6&0x3f));x.push(alpha.charAt(b10&0x3f));}switch(s.length-imax){case 1:b10=getbyte(s,i)<<16;x.push(alpha.charAt(b10>>18)+alpha.charAt(b10>>12&0x3F)+padchar+padchar);break;case 2:b10=getbyte(s,i)<<16|getbyte(s,i+1)<<8;x.push(alpha.charAt(b10>>18)+alpha.charAt(b10>>12&0x3F)+alpha.charAt(b10>>6&0x3f)+padchar);break;}return x.join('');};basic=base64.encode(connectAuthParamsString);}return basic;}window.monkey=monkey; //  ===== END OF FILE
	/***/}, /* 1 */ /***/function(module,exports){"use strict";var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}} /*
		    Protocol Enums
		 */ /*
		    Start Message class definition
		 */module.exports=function(){function MOKMessage(command,args){_classCallCheck(this,MOKMessage);if(args.app_id!=null){this.app_id=args.app_id;}this.protocolCommand=command;this.protocolType=parseInt(args.type);this.senderId=args.sid;this.recipientId=args.rid;this.datetimeOrder=this.getCurrentTimestamp();this.datetimeCreation=args.datetime==null?this.datetimeOrder:args.datetime;this.readByUser=false; //parse props
	if(args.props!=null&&typeof args.props!="undefined"&&args.props!=""){if(typeof args.props==="string"){this.props=JSON.parse(args.props);}else {this.props=args.props;}}else {this.props={encr:0};} //parse params
	if(args.params!=null&&args.params!=""&&typeof args.params!="undefined"){if(typeof args.params==="string"){this.params=JSON.parse(args.params);}else {this.params=args.params;}} //parse message id
	if(args.id==null){ //didn't come from the socket
	this.id=this.generateRandomMessageId();this.oldId=this.id;this.props.old_id=this.id;}else { //it came from the socket
	this.id=args.id;this.oldId=this.props.old_id;}this.encryptedText=args.msg;this.text=args.msg;switch(command){case 205:{this.buildAcknowledge(this.props);break;}default:{break;}}}_createClass(MOKMessage,[{key:"generateRandomMessageId",value:function generateRandomMessageId(){return Math.round(new Date().getTime()/1000*-1)+Math.random().toString(36).substring(14);}},{key:"getCurrentTimestamp",value:function getCurrentTimestamp(){return new Date().getTime()/1000;}},{key:"buildAcknowledge",value:function buildAcknowledge(props){if(typeof props.message_id!="undefined"||props.message_id!=null){this.id=props.message_id;}if(typeof props.new_id!="undefined"||props.new_id!=null){this.id=props.new_id;}if(typeof props.old_id!="undefined"||props.old_id!=null){this.oldId=props.old_id;}}},{key:"compressionMethod",value:function compressionMethod(){if(this.isCompressed){return this.props.cmpr;}return null;}},{key:"isCompressed",value:function isCompressed(){if(this.props==null||typeof this.props.cmpr=="undefined"||this.props.cmpr==null){console.log("MONKEY - props null");return false;}return this.props.cmpr?true:false;}},{key:"isEncrypted",value:function isEncrypted(){if(this.props==null||typeof this.props.encr=="undefined"||this.props.encr==null){console.log("MONKEY - props null");return false;}return this.props.encr==1?true:false;}}]);return MOKMessage;}(); /***/}, /* 2 */ /***/function(module,exports,__webpack_require__){__webpack_require__(3)(__webpack_require__(4)); /***/}, /* 3 */ /***/function(module,exports){ /*
			MIT License http://www.opensource.org/licenses/mit-license.php
			Author Tobias Koppers @sokra
		*/module.exports=function(src){if(typeof execScript==="function")execScript(src);else eval.call(null,src);}; /***/}, /* 4 */ /***/function(module,exports){module.exports="var JSEncryptExports = {};\n(function(exports) {\nfunction BigInteger(a,b,c){null!=a&&(\"number\"==typeof a?this.fromNumber(a,b,c):null==b&&\"string\"!=typeof a?this.fromString(a,256):this.fromString(a,b))}function nbi(){return new BigInteger(null)}function am1(a,b,c,d,e,f){for(;--f>=0;){var g=b*this[a++]+c[d]+e;e=Math.floor(g/67108864),c[d++]=67108863&g}return e}function am2(a,b,c,d,e,f){for(var g=32767&b,h=b>>15;--f>=0;){var i=32767&this[a],j=this[a++]>>15,k=h*i+j*g;i=g*i+((32767&k)<<15)+c[d]+(1073741823&e),e=(i>>>30)+(k>>>15)+h*j+(e>>>30),c[d++]=1073741823&i}return e}function am3(a,b,c,d,e,f){for(var g=16383&b,h=b>>14;--f>=0;){var i=16383&this[a],j=this[a++]>>14,k=h*i+j*g;i=g*i+((16383&k)<<14)+c[d]+e,e=(i>>28)+(k>>14)+h*j,c[d++]=268435455&i}return e}function int2char(a){return BI_RM.charAt(a)}function intAt(a,b){var c=BI_RC[a.charCodeAt(b)];return null==c?-1:c}function bnpCopyTo(a){for(var b=this.t-1;b>=0;--b)a[b]=this[b];a.t=this.t,a.s=this.s}function bnpFromInt(a){this.t=1,this.s=0>a?-1:0,a>0?this[0]=a:-1>a?this[0]=a+DV:this.t=0}function nbv(a){var b=nbi();return b.fromInt(a),b}function bnpFromString(a,b){var c;if(16==b)c=4;else if(8==b)c=3;else if(256==b)c=8;else if(2==b)c=1;else if(32==b)c=5;else{if(4!=b)return void this.fromRadix(a,b);c=2}this.t=0,this.s=0;for(var d=a.length,e=!1,f=0;--d>=0;){var g=8==c?255&a[d]:intAt(a,d);0>g?\"-\"==a.charAt(d)&&(e=!0):(e=!1,0==f?this[this.t++]=g:f+c>this.DB?(this[this.t-1]|=(g&(1<<this.DB-f)-1)<<f,this[this.t++]=g>>this.DB-f):this[this.t-1]|=g<<f,f+=c,f>=this.DB&&(f-=this.DB))}8==c&&0!=(128&a[0])&&(this.s=-1,f>0&&(this[this.t-1]|=(1<<this.DB-f)-1<<f)),this.clamp(),e&&BigInteger.ZERO.subTo(this,this)}function bnpClamp(){for(var a=this.s&this.DM;this.t>0&&this[this.t-1]==a;)--this.t}function bnToString(a){if(this.s<0)return\"-\"+this.negate().toString(a);var b;if(16==a)b=4;else if(8==a)b=3;else if(2==a)b=1;else if(32==a)b=5;else{if(4!=a)return this.toRadix(a);b=2}var c,d=(1<<b)-1,e=!1,f=\"\",g=this.t,h=this.DB-g*this.DB%b;if(g-->0)for(h<this.DB&&(c=this[g]>>h)>0&&(e=!0,f=int2char(c));g>=0;)b>h?(c=(this[g]&(1<<h)-1)<<b-h,c|=this[--g]>>(h+=this.DB-b)):(c=this[g]>>(h-=b)&d,0>=h&&(h+=this.DB,--g)),c>0&&(e=!0),e&&(f+=int2char(c));return e?f:\"0\"}function bnNegate(){var a=nbi();return BigInteger.ZERO.subTo(this,a),a}function bnAbs(){return this.s<0?this.negate():this}function bnCompareTo(a){var b=this.s-a.s;if(0!=b)return b;var c=this.t;if(b=c-a.t,0!=b)return this.s<0?-b:b;for(;--c>=0;)if(0!=(b=this[c]-a[c]))return b;return 0}function nbits(a){var b,c=1;return 0!=(b=a>>>16)&&(a=b,c+=16),0!=(b=a>>8)&&(a=b,c+=8),0!=(b=a>>4)&&(a=b,c+=4),0!=(b=a>>2)&&(a=b,c+=2),0!=(b=a>>1)&&(a=b,c+=1),c}function bnBitLength(){return this.t<=0?0:this.DB*(this.t-1)+nbits(this[this.t-1]^this.s&this.DM)}function bnpDLShiftTo(a,b){var c;for(c=this.t-1;c>=0;--c)b[c+a]=this[c];for(c=a-1;c>=0;--c)b[c]=0;b.t=this.t+a,b.s=this.s}function bnpDRShiftTo(a,b){for(var c=a;c<this.t;++c)b[c-a]=this[c];b.t=Math.max(this.t-a,0),b.s=this.s}function bnpLShiftTo(a,b){var c,d=a%this.DB,e=this.DB-d,f=(1<<e)-1,g=Math.floor(a/this.DB),h=this.s<<d&this.DM;for(c=this.t-1;c>=0;--c)b[c+g+1]=this[c]>>e|h,h=(this[c]&f)<<d;for(c=g-1;c>=0;--c)b[c]=0;b[g]=h,b.t=this.t+g+1,b.s=this.s,b.clamp()}function bnpRShiftTo(a,b){b.s=this.s;var c=Math.floor(a/this.DB);if(c>=this.t)return void(b.t=0);var d=a%this.DB,e=this.DB-d,f=(1<<d)-1;b[0]=this[c]>>d;for(var g=c+1;g<this.t;++g)b[g-c-1]|=(this[g]&f)<<e,b[g-c]=this[g]>>d;d>0&&(b[this.t-c-1]|=(this.s&f)<<e),b.t=this.t-c,b.clamp()}function bnpSubTo(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);e>c;)d+=this[c]-a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d-=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d-=a[c],b[c++]=d&this.DM,d>>=this.DB;d-=a.s}b.s=0>d?-1:0,-1>d?b[c++]=this.DV+d:d>0&&(b[c++]=d),b.t=c,b.clamp()}function bnpMultiplyTo(a,b){var c=this.abs(),d=a.abs(),e=c.t;for(b.t=e+d.t;--e>=0;)b[e]=0;for(e=0;e<d.t;++e)b[e+c.t]=c.am(0,d[e],b,e,0,c.t);b.s=0,b.clamp(),this.s!=a.s&&BigInteger.ZERO.subTo(b,b)}function bnpSquareTo(a){for(var b=this.abs(),c=a.t=2*b.t;--c>=0;)a[c]=0;for(c=0;c<b.t-1;++c){var d=b.am(c,b[c],a,2*c,0,1);(a[c+b.t]+=b.am(c+1,2*b[c],a,2*c+1,d,b.t-c-1))>=b.DV&&(a[c+b.t]-=b.DV,a[c+b.t+1]=1)}a.t>0&&(a[a.t-1]+=b.am(c,b[c],a,2*c,0,1)),a.s=0,a.clamp()}function bnpDivRemTo(a,b,c){var d=a.abs();if(!(d.t<=0)){var e=this.abs();if(e.t<d.t)return null!=b&&b.fromInt(0),void(null!=c&&this.copyTo(c));null==c&&(c=nbi());var f=nbi(),g=this.s,h=a.s,i=this.DB-nbits(d[d.t-1]);i>0?(d.lShiftTo(i,f),e.lShiftTo(i,c)):(d.copyTo(f),e.copyTo(c));var j=f.t,k=f[j-1];if(0!=k){var l=k*(1<<this.F1)+(j>1?f[j-2]>>this.F2:0),m=this.FV/l,n=(1<<this.F1)/l,o=1<<this.F2,p=c.t,q=p-j,r=null==b?nbi():b;for(f.dlShiftTo(q,r),c.compareTo(r)>=0&&(c[c.t++]=1,c.subTo(r,c)),BigInteger.ONE.dlShiftTo(j,r),r.subTo(f,f);f.t<j;)f[f.t++]=0;for(;--q>=0;){var s=c[--p]==k?this.DM:Math.floor(c[p]*m+(c[p-1]+o)*n);if((c[p]+=f.am(0,s,c,q,0,j))<s)for(f.dlShiftTo(q,r),c.subTo(r,c);c[p]<--s;)c.subTo(r,c)}null!=b&&(c.drShiftTo(j,b),g!=h&&BigInteger.ZERO.subTo(b,b)),c.t=j,c.clamp(),i>0&&c.rShiftTo(i,c),0>g&&BigInteger.ZERO.subTo(c,c)}}}function bnMod(a){var b=nbi();return this.abs().divRemTo(a,null,b),this.s<0&&b.compareTo(BigInteger.ZERO)>0&&a.subTo(b,b),b}function Classic(a){this.m=a}function cConvert(a){return a.s<0||a.compareTo(this.m)>=0?a.mod(this.m):a}function cRevert(a){return a}function cReduce(a){a.divRemTo(this.m,null,a)}function cMulTo(a,b,c){a.multiplyTo(b,c),this.reduce(c)}function cSqrTo(a,b){a.squareTo(b),this.reduce(b)}function bnpInvDigit(){if(this.t<1)return 0;var a=this[0];if(0==(1&a))return 0;var b=3&a;return b=b*(2-(15&a)*b)&15,b=b*(2-(255&a)*b)&255,b=b*(2-((65535&a)*b&65535))&65535,b=b*(2-a*b%this.DV)%this.DV,b>0?this.DV-b:-b}function Montgomery(a){this.m=a,this.mp=a.invDigit(),this.mpl=32767&this.mp,this.mph=this.mp>>15,this.um=(1<<a.DB-15)-1,this.mt2=2*a.t}function montConvert(a){var b=nbi();return a.abs().dlShiftTo(this.m.t,b),b.divRemTo(this.m,null,b),a.s<0&&b.compareTo(BigInteger.ZERO)>0&&this.m.subTo(b,b),b}function montRevert(a){var b=nbi();return a.copyTo(b),this.reduce(b),b}function montReduce(a){for(;a.t<=this.mt2;)a[a.t++]=0;for(var b=0;b<this.m.t;++b){var c=32767&a[b],d=c*this.mpl+((c*this.mph+(a[b]>>15)*this.mpl&this.um)<<15)&a.DM;for(c=b+this.m.t,a[c]+=this.m.am(0,d,a,b,0,this.m.t);a[c]>=a.DV;)a[c]-=a.DV,a[++c]++}a.clamp(),a.drShiftTo(this.m.t,a),a.compareTo(this.m)>=0&&a.subTo(this.m,a)}function montSqrTo(a,b){a.squareTo(b),this.reduce(b)}function montMulTo(a,b,c){a.multiplyTo(b,c),this.reduce(c)}function bnpIsEven(){return 0==(this.t>0?1&this[0]:this.s)}function bnpExp(a,b){if(a>4294967295||1>a)return BigInteger.ONE;var c=nbi(),d=nbi(),e=b.convert(this),f=nbits(a)-1;for(e.copyTo(c);--f>=0;)if(b.sqrTo(c,d),(a&1<<f)>0)b.mulTo(d,e,c);else{var g=c;c=d,d=g}return b.revert(c)}function bnModPowInt(a,b){var c;return c=256>a||b.isEven()?new Classic(b):new Montgomery(b),this.exp(a,c)}function bnClone(){var a=nbi();return this.copyTo(a),a}function bnIntValue(){if(this.s<0){if(1==this.t)return this[0]-this.DV;if(0==this.t)return-1}else{if(1==this.t)return this[0];if(0==this.t)return 0}return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]}function bnByteValue(){return 0==this.t?this.s:this[0]<<24>>24}function bnShortValue(){return 0==this.t?this.s:this[0]<<16>>16}function bnpChunkSize(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function bnSigNum(){return this.s<0?-1:this.t<=0||1==this.t&&this[0]<=0?0:1}function bnpToRadix(a){if(null==a&&(a=10),0==this.signum()||2>a||a>36)return\"0\";var b=this.chunkSize(a),c=Math.pow(a,b),d=nbv(c),e=nbi(),f=nbi(),g=\"\";for(this.divRemTo(d,e,f);e.signum()>0;)g=(c+f.intValue()).toString(a).substr(1)+g,e.divRemTo(d,e,f);return f.intValue().toString(a)+g}function bnpFromRadix(a,b){this.fromInt(0),null==b&&(b=10);for(var c=this.chunkSize(b),d=Math.pow(b,c),e=!1,f=0,g=0,h=0;h<a.length;++h){var i=intAt(a,h);0>i?\"-\"==a.charAt(h)&&0==this.signum()&&(e=!0):(g=b*g+i,++f>=c&&(this.dMultiply(d),this.dAddOffset(g,0),f=0,g=0))}f>0&&(this.dMultiply(Math.pow(b,f)),this.dAddOffset(g,0)),e&&BigInteger.ZERO.subTo(this,this)}function bnpFromNumber(a,b,c){if(\"number\"==typeof b)if(2>a)this.fromInt(1);else for(this.fromNumber(a,c),this.testBit(a-1)||this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(b);)this.dAddOffset(2,0),this.bitLength()>a&&this.subTo(BigInteger.ONE.shiftLeft(a-1),this);else{var d=new Array,e=7&a;d.length=(a>>3)+1,b.nextBytes(d),e>0?d[0]&=(1<<e)-1:d[0]=0,this.fromString(d,256)}}function bnToByteArray(){var a=this.t,b=new Array;b[0]=this.s;var c,d=this.DB-a*this.DB%8,e=0;if(a-->0)for(d<this.DB&&(c=this[a]>>d)!=(this.s&this.DM)>>d&&(b[e++]=c|this.s<<this.DB-d);a>=0;)8>d?(c=(this[a]&(1<<d)-1)<<8-d,c|=this[--a]>>(d+=this.DB-8)):(c=this[a]>>(d-=8)&255,0>=d&&(d+=this.DB,--a)),0!=(128&c)&&(c|=-256),0==e&&(128&this.s)!=(128&c)&&++e,(e>0||c!=this.s)&&(b[e++]=c);return b}function bnEquals(a){return 0==this.compareTo(a)}function bnMin(a){return this.compareTo(a)<0?this:a}function bnMax(a){return this.compareTo(a)>0?this:a}function bnpBitwiseTo(a,b,c){var d,e,f=Math.min(a.t,this.t);for(d=0;f>d;++d)c[d]=b(this[d],a[d]);if(a.t<this.t){for(e=a.s&this.DM,d=f;d<this.t;++d)c[d]=b(this[d],e);c.t=this.t}else{for(e=this.s&this.DM,d=f;d<a.t;++d)c[d]=b(e,a[d]);c.t=a.t}c.s=b(this.s,a.s),c.clamp()}function op_and(a,b){return a&b}function bnAnd(a){var b=nbi();return this.bitwiseTo(a,op_and,b),b}function op_or(a,b){return a|b}function bnOr(a){var b=nbi();return this.bitwiseTo(a,op_or,b),b}function op_xor(a,b){return a^b}function bnXor(a){var b=nbi();return this.bitwiseTo(a,op_xor,b),b}function op_andnot(a,b){return a&~b}function bnAndNot(a){var b=nbi();return this.bitwiseTo(a,op_andnot,b),b}function bnNot(){for(var a=nbi(),b=0;b<this.t;++b)a[b]=this.DM&~this[b];return a.t=this.t,a.s=~this.s,a}function bnShiftLeft(a){var b=nbi();return 0>a?this.rShiftTo(-a,b):this.lShiftTo(a,b),b}function bnShiftRight(a){var b=nbi();return 0>a?this.lShiftTo(-a,b):this.rShiftTo(a,b),b}function lbit(a){if(0==a)return-1;var b=0;return 0==(65535&a)&&(a>>=16,b+=16),0==(255&a)&&(a>>=8,b+=8),0==(15&a)&&(a>>=4,b+=4),0==(3&a)&&(a>>=2,b+=2),0==(1&a)&&++b,b}function bnGetLowestSetBit(){for(var a=0;a<this.t;++a)if(0!=this[a])return a*this.DB+lbit(this[a]);return this.s<0?this.t*this.DB:-1}function cbit(a){for(var b=0;0!=a;)a&=a-1,++b;return b}function bnBitCount(){for(var a=0,b=this.s&this.DM,c=0;c<this.t;++c)a+=cbit(this[c]^b);return a}function bnTestBit(a){var b=Math.floor(a/this.DB);return b>=this.t?0!=this.s:0!=(this[b]&1<<a%this.DB)}function bnpChangeBit(a,b){var c=BigInteger.ONE.shiftLeft(a);return this.bitwiseTo(c,b,c),c}function bnSetBit(a){return this.changeBit(a,op_or)}function bnClearBit(a){return this.changeBit(a,op_andnot)}function bnFlipBit(a){return this.changeBit(a,op_xor)}function bnpAddTo(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);e>c;)d+=this[c]+a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d+=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d+=a[c],b[c++]=d&this.DM,d>>=this.DB;d+=a.s}b.s=0>d?-1:0,d>0?b[c++]=d:-1>d&&(b[c++]=this.DV+d),b.t=c,b.clamp()}function bnAdd(a){var b=nbi();return this.addTo(a,b),b}function bnSubtract(a){var b=nbi();return this.subTo(a,b),b}function bnMultiply(a){var b=nbi();return this.multiplyTo(a,b),b}function bnSquare(){var a=nbi();return this.squareTo(a),a}function bnDivide(a){var b=nbi();return this.divRemTo(a,b,null),b}function bnRemainder(a){var b=nbi();return this.divRemTo(a,null,b),b}function bnDivideAndRemainder(a){var b=nbi(),c=nbi();return this.divRemTo(a,b,c),new Array(b,c)}function bnpDMultiply(a){this[this.t]=this.am(0,a-1,this,0,0,this.t),++this.t,this.clamp()}function bnpDAddOffset(a,b){if(0!=a){for(;this.t<=b;)this[this.t++]=0;for(this[b]+=a;this[b]>=this.DV;)this[b]-=this.DV,++b>=this.t&&(this[this.t++]=0),++this[b]}}function NullExp(){}function nNop(a){return a}function nMulTo(a,b,c){a.multiplyTo(b,c)}function nSqrTo(a,b){a.squareTo(b)}function bnPow(a){return this.exp(a,new NullExp)}function bnpMultiplyLowerTo(a,b,c){var d=Math.min(this.t+a.t,b);for(c.s=0,c.t=d;d>0;)c[--d]=0;var e;for(e=c.t-this.t;e>d;++d)c[d+this.t]=this.am(0,a[d],c,d,0,this.t);for(e=Math.min(a.t,b);e>d;++d)this.am(0,a[d],c,d,0,b-d);c.clamp()}function bnpMultiplyUpperTo(a,b,c){--b;var d=c.t=this.t+a.t-b;for(c.s=0;--d>=0;)c[d]=0;for(d=Math.max(b-this.t,0);d<a.t;++d)c[this.t+d-b]=this.am(b-d,a[d],c,0,0,this.t+d-b);c.clamp(),c.drShiftTo(1,c)}function Barrett(a){this.r2=nbi(),this.q3=nbi(),BigInteger.ONE.dlShiftTo(2*a.t,this.r2),this.mu=this.r2.divide(a),this.m=a}function barrettConvert(a){if(a.s<0||a.t>2*this.m.t)return a.mod(this.m);if(a.compareTo(this.m)<0)return a;var b=nbi();return a.copyTo(b),this.reduce(b),b}function barrettRevert(a){return a}function barrettReduce(a){for(a.drShiftTo(this.m.t-1,this.r2),a.t>this.m.t+1&&(a.t=this.m.t+1,a.clamp()),this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3),this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);a.compareTo(this.r2)<0;)a.dAddOffset(1,this.m.t+1);for(a.subTo(this.r2,a);a.compareTo(this.m)>=0;)a.subTo(this.m,a)}function barrettSqrTo(a,b){a.squareTo(b),this.reduce(b)}function barrettMulTo(a,b,c){a.multiplyTo(b,c),this.reduce(c)}function bnModPow(a,b){var c,d,e=a.bitLength(),f=nbv(1);if(0>=e)return f;c=18>e?1:48>e?3:144>e?4:768>e?5:6,d=8>e?new Classic(b):b.isEven()?new Barrett(b):new Montgomery(b);var g=new Array,h=3,i=c-1,j=(1<<c)-1;if(g[1]=d.convert(this),c>1){var k=nbi();for(d.sqrTo(g[1],k);j>=h;)g[h]=nbi(),d.mulTo(k,g[h-2],g[h]),h+=2}var l,m,n=a.t-1,o=!0,p=nbi();for(e=nbits(a[n])-1;n>=0;){for(e>=i?l=a[n]>>e-i&j:(l=(a[n]&(1<<e+1)-1)<<i-e,n>0&&(l|=a[n-1]>>this.DB+e-i)),h=c;0==(1&l);)l>>=1,--h;if((e-=h)<0&&(e+=this.DB,--n),o)g[l].copyTo(f),o=!1;else{for(;h>1;)d.sqrTo(f,p),d.sqrTo(p,f),h-=2;h>0?d.sqrTo(f,p):(m=f,f=p,p=m),d.mulTo(p,g[l],f)}for(;n>=0&&0==(a[n]&1<<e);)d.sqrTo(f,p),m=f,f=p,p=m,--e<0&&(e=this.DB-1,--n)}return d.revert(f)}function bnGCD(a){var b=this.s<0?this.negate():this.clone(),c=a.s<0?a.negate():a.clone();if(b.compareTo(c)<0){var d=b;b=c,c=d}var e=b.getLowestSetBit(),f=c.getLowestSetBit();if(0>f)return b;for(f>e&&(f=e),f>0&&(b.rShiftTo(f,b),c.rShiftTo(f,c));b.signum()>0;)(e=b.getLowestSetBit())>0&&b.rShiftTo(e,b),(e=c.getLowestSetBit())>0&&c.rShiftTo(e,c),b.compareTo(c)>=0?(b.subTo(c,b),b.rShiftTo(1,b)):(c.subTo(b,c),c.rShiftTo(1,c));return f>0&&c.lShiftTo(f,c),c}function bnpModInt(a){if(0>=a)return 0;var b=this.DV%a,c=this.s<0?a-1:0;if(this.t>0)if(0==b)c=this[0]%a;else for(var d=this.t-1;d>=0;--d)c=(b*c+this[d])%a;return c}function bnModInverse(a){var b=a.isEven();if(this.isEven()&&b||0==a.signum())return BigInteger.ZERO;for(var c=a.clone(),d=this.clone(),e=nbv(1),f=nbv(0),g=nbv(0),h=nbv(1);0!=c.signum();){for(;c.isEven();)c.rShiftTo(1,c),b?(e.isEven()&&f.isEven()||(e.addTo(this,e),f.subTo(a,f)),e.rShiftTo(1,e)):f.isEven()||f.subTo(a,f),f.rShiftTo(1,f);for(;d.isEven();)d.rShiftTo(1,d),b?(g.isEven()&&h.isEven()||(g.addTo(this,g),h.subTo(a,h)),g.rShiftTo(1,g)):h.isEven()||h.subTo(a,h),h.rShiftTo(1,h);c.compareTo(d)>=0?(c.subTo(d,c),b&&e.subTo(g,e),f.subTo(h,f)):(d.subTo(c,d),b&&g.subTo(e,g),h.subTo(f,h))}return 0!=d.compareTo(BigInteger.ONE)?BigInteger.ZERO:h.compareTo(a)>=0?h.subtract(a):h.signum()<0?(h.addTo(a,h),h.signum()<0?h.add(a):h):h}function bnIsProbablePrime(a){var b,c=this.abs();if(1==c.t&&c[0]<=lowprimes[lowprimes.length-1]){for(b=0;b<lowprimes.length;++b)if(c[0]==lowprimes[b])return!0;return!1}if(c.isEven())return!1;for(b=1;b<lowprimes.length;){for(var d=lowprimes[b],e=b+1;e<lowprimes.length&&lplim>d;)d*=lowprimes[e++];for(d=c.modInt(d);e>b;)if(d%lowprimes[b++]==0)return!1}return c.millerRabin(a)}function bnpMillerRabin(a){var b=this.subtract(BigInteger.ONE),c=b.getLowestSetBit();if(0>=c)return!1;var d=b.shiftRight(c);a=a+1>>1,a>lowprimes.length&&(a=lowprimes.length);for(var e=nbi(),f=0;a>f;++f){e.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);var g=e.modPow(d,this);if(0!=g.compareTo(BigInteger.ONE)&&0!=g.compareTo(b)){for(var h=1;h++<c&&0!=g.compareTo(b);)if(g=g.modPowInt(2,this),0==g.compareTo(BigInteger.ONE))return!1;if(0!=g.compareTo(b))return!1}}return!0}function Arcfour(){this.i=0,this.j=0,this.S=new Array}function ARC4init(a){var b,c,d;for(b=0;256>b;++b)this.S[b]=b;for(c=0,b=0;256>b;++b)c=c+this.S[b]+a[b%a.length]&255,d=this.S[b],this.S[b]=this.S[c],this.S[c]=d;this.i=0,this.j=0}function ARC4next(){var a;return this.i=this.i+1&255,this.j=this.j+this.S[this.i]&255,a=this.S[this.i],this.S[this.i]=this.S[this.j],this.S[this.j]=a,this.S[a+this.S[this.i]&255]}function prng_newstate(){return new Arcfour}function rng_get_byte(){if(null==rng_state){for(rng_state=prng_newstate();rng_psize>rng_pptr;){var a=Math.floor(65536*Math.random());rng_pool[rng_pptr++]=255&a}for(rng_state.init(rng_pool),rng_pptr=0;rng_pptr<rng_pool.length;++rng_pptr)rng_pool[rng_pptr]=0;rng_pptr=0}return rng_state.next()}function rng_get_bytes(a){var b;for(b=0;b<a.length;++b)a[b]=rng_get_byte()}function SecureRandom(){}function parseBigInt(a,b){return new BigInteger(a,b)}function linebrk(a,b){for(var c=\"\",d=0;d+b<a.length;)c+=a.substring(d,d+b)+\"\\n\",d+=b;return c+a.substring(d,a.length)}function byte2Hex(a){return 16>a?\"0\"+a.toString(16):a.toString(16)}function pkcs1pad2(a,b){if(b<a.length+11)return console.error(\"Message too long for RSA\"),null;for(var c=new Array,d=a.length-1;d>=0&&b>0;){var e=a.charCodeAt(d--);128>e?c[--b]=e:e>127&&2048>e?(c[--b]=63&e|128,c[--b]=e>>6|192):(c[--b]=63&e|128,c[--b]=e>>6&63|128,c[--b]=e>>12|224)}c[--b]=0;for(var f=new SecureRandom,g=new Array;b>2;){for(g[0]=0;0==g[0];)f.nextBytes(g);c[--b]=g[0]}return c[--b]=2,c[--b]=0,new BigInteger(c)}function RSAKey(){this.n=null,this.e=0,this.d=null,this.p=null,this.q=null,this.dmp1=null,this.dmq1=null,this.coeff=null}function RSASetPublic(a,b){null!=a&&null!=b&&a.length>0&&b.length>0?(this.n=parseBigInt(a,16),this.e=parseInt(b,16)):console.error(\"Invalid RSA public key\")}function RSADoPublic(a){return a.modPowInt(this.e,this.n)}function RSAEncrypt(a){var b=pkcs1pad2(a,this.n.bitLength()+7>>3);if(null==b)return null;var c=this.doPublic(b);if(null==c)return null;var d=c.toString(16);return 0==(1&d.length)?d:\"0\"+d}function pkcs1unpad2(a,b){for(var c=a.toByteArray(),d=0;d<c.length&&0==c[d];)++d;if(c.length-d!=b-1||2!=c[d])return null;for(++d;0!=c[d];)if(++d>=c.length)return null;for(var e=\"\";++d<c.length;){var f=255&c[d];128>f?e+=String.fromCharCode(f):f>191&&224>f?(e+=String.fromCharCode((31&f)<<6|63&c[d+1]),++d):(e+=String.fromCharCode((15&f)<<12|(63&c[d+1])<<6|63&c[d+2]),d+=2)}return e}function RSASetPrivate(a,b,c){null!=a&&null!=b&&a.length>0&&b.length>0?(this.n=parseBigInt(a,16),this.e=parseInt(b,16),this.d=parseBigInt(c,16)):console.error(\"Invalid RSA private key\")}function RSASetPrivateEx(a,b,c,d,e,f,g,h){null!=a&&null!=b&&a.length>0&&b.length>0?(this.n=parseBigInt(a,16),this.e=parseInt(b,16),this.d=parseBigInt(c,16),this.p=parseBigInt(d,16),this.q=parseBigInt(e,16),this.dmp1=parseBigInt(f,16),this.dmq1=parseBigInt(g,16),this.coeff=parseBigInt(h,16)):console.error(\"Invalid RSA private key\")}function RSAGenerate(a,b){var c=new SecureRandom,d=a>>1;this.e=parseInt(b,16);for(var e=new BigInteger(b,16);;){for(;this.p=new BigInteger(a-d,1,c),0!=this.p.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE)||!this.p.isProbablePrime(10););for(;this.q=new BigInteger(d,1,c),0!=this.q.subtract(BigInteger.ONE).gcd(e).compareTo(BigInteger.ONE)||!this.q.isProbablePrime(10););if(this.p.compareTo(this.q)<=0){var f=this.p;this.p=this.q,this.q=f}var g=this.p.subtract(BigInteger.ONE),h=this.q.subtract(BigInteger.ONE),i=g.multiply(h);if(0==i.gcd(e).compareTo(BigInteger.ONE)){this.n=this.p.multiply(this.q),this.d=e.modInverse(i),this.dmp1=this.d.mod(g),this.dmq1=this.d.mod(h),this.coeff=this.q.modInverse(this.p);break}}}function RSADoPrivate(a){if(null==this.p||null==this.q)return a.modPow(this.d,this.n);for(var b=a.mod(this.p).modPow(this.dmp1,this.p),c=a.mod(this.q).modPow(this.dmq1,this.q);b.compareTo(c)<0;)b=b.add(this.p);return b.subtract(c).multiply(this.coeff).mod(this.p).multiply(this.q).add(c)}function RSADecrypt(a){var b=parseBigInt(a,16),c=this.doPrivate(b);return null==c?null:pkcs1unpad2(c,this.n.bitLength()+7>>3)}function hex2b64(a){var b,c,d=\"\";for(b=0;b+3<=a.length;b+=3)c=parseInt(a.substring(b,b+3),16),d+=b64map.charAt(c>>6)+b64map.charAt(63&c);for(b+1==a.length?(c=parseInt(a.substring(b,b+1),16),d+=b64map.charAt(c<<2)):b+2==a.length&&(c=parseInt(a.substring(b,b+2),16),d+=b64map.charAt(c>>2)+b64map.charAt((3&c)<<4));(3&d.length)>0;)d+=b64pad;return d}function b64tohex(a){var b,c,d=\"\",e=0;for(b=0;b<a.length&&a.charAt(b)!=b64pad;++b)v=b64map.indexOf(a.charAt(b)),v<0||(0==e?(d+=int2char(v>>2),c=3&v,e=1):1==e?(d+=int2char(c<<2|v>>4),c=15&v,e=2):2==e?(d+=int2char(c),d+=int2char(v>>2),c=3&v,e=3):(d+=int2char(c<<2|v>>4),d+=int2char(15&v),e=0));return 1==e&&(d+=int2char(c<<2)),d}function b64toBA(a){var b,c=b64tohex(a),d=new Array;for(b=0;2*b<c.length;++b)d[b]=parseInt(c.substring(2*b,2*b+2),16);return d}var dbits,canary=0xdeadbeefcafe,j_lm=15715070==(16777215&canary);j_lm&&\"Microsoft Internet Explorer\"==navigator.appName?(BigInteger.prototype.am=am2,dbits=30):j_lm&&\"Netscape\"!=navigator.appName?(BigInteger.prototype.am=am1,dbits=26):(BigInteger.prototype.am=am3,dbits=28),BigInteger.prototype.DB=dbits,BigInteger.prototype.DM=(1<<dbits)-1,BigInteger.prototype.DV=1<<dbits;var BI_FP=52;BigInteger.prototype.FV=Math.pow(2,BI_FP),BigInteger.prototype.F1=BI_FP-dbits,BigInteger.prototype.F2=2*dbits-BI_FP;var BI_RM=\"0123456789abcdefghijklmnopqrstuvwxyz\",BI_RC=new Array,rr,vv;for(rr=\"0\".charCodeAt(0),vv=0;9>=vv;++vv)BI_RC[rr++]=vv;for(rr=\"a\".charCodeAt(0),vv=10;36>vv;++vv)BI_RC[rr++]=vv;for(rr=\"A\".charCodeAt(0),vv=10;36>vv;++vv)BI_RC[rr++]=vv;Classic.prototype.convert=cConvert,Classic.prototype.revert=cRevert,Classic.prototype.reduce=cReduce,Classic.prototype.mulTo=cMulTo,Classic.prototype.sqrTo=cSqrTo,Montgomery.prototype.convert=montConvert,Montgomery.prototype.revert=montRevert,Montgomery.prototype.reduce=montReduce,Montgomery.prototype.mulTo=montMulTo,Montgomery.prototype.sqrTo=montSqrTo,BigInteger.prototype.copyTo=bnpCopyTo,BigInteger.prototype.fromInt=bnpFromInt,BigInteger.prototype.fromString=bnpFromString,BigInteger.prototype.clamp=bnpClamp,BigInteger.prototype.dlShiftTo=bnpDLShiftTo,BigInteger.prototype.drShiftTo=bnpDRShiftTo,BigInteger.prototype.lShiftTo=bnpLShiftTo,BigInteger.prototype.rShiftTo=bnpRShiftTo,BigInteger.prototype.subTo=bnpSubTo,BigInteger.prototype.multiplyTo=bnpMultiplyTo,BigInteger.prototype.squareTo=bnpSquareTo,BigInteger.prototype.divRemTo=bnpDivRemTo,BigInteger.prototype.invDigit=bnpInvDigit,BigInteger.prototype.isEven=bnpIsEven,BigInteger.prototype.exp=bnpExp,BigInteger.prototype.toString=bnToString,BigInteger.prototype.negate=bnNegate,BigInteger.prototype.abs=bnAbs,BigInteger.prototype.compareTo=bnCompareTo,BigInteger.prototype.bitLength=bnBitLength,BigInteger.prototype.mod=bnMod,BigInteger.prototype.modPowInt=bnModPowInt,BigInteger.ZERO=nbv(0),BigInteger.ONE=nbv(1),NullExp.prototype.convert=nNop,NullExp.prototype.revert=nNop,NullExp.prototype.mulTo=nMulTo,NullExp.prototype.sqrTo=nSqrTo,Barrett.prototype.convert=barrettConvert,Barrett.prototype.revert=barrettRevert,Barrett.prototype.reduce=barrettReduce,Barrett.prototype.mulTo=barrettMulTo,Barrett.prototype.sqrTo=barrettSqrTo;var lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997],lplim=(1<<26)/lowprimes[lowprimes.length-1];BigInteger.prototype.chunkSize=bnpChunkSize,BigInteger.prototype.toRadix=bnpToRadix,BigInteger.prototype.fromRadix=bnpFromRadix,BigInteger.prototype.fromNumber=bnpFromNumber,BigInteger.prototype.bitwiseTo=bnpBitwiseTo,BigInteger.prototype.changeBit=bnpChangeBit,BigInteger.prototype.addTo=bnpAddTo,BigInteger.prototype.dMultiply=bnpDMultiply,BigInteger.prototype.dAddOffset=bnpDAddOffset,BigInteger.prototype.multiplyLowerTo=bnpMultiplyLowerTo,BigInteger.prototype.multiplyUpperTo=bnpMultiplyUpperTo,BigInteger.prototype.modInt=bnpModInt,BigInteger.prototype.millerRabin=bnpMillerRabin,BigInteger.prototype.clone=bnClone,BigInteger.prototype.intValue=bnIntValue,BigInteger.prototype.byteValue=bnByteValue,BigInteger.prototype.shortValue=bnShortValue,BigInteger.prototype.signum=bnSigNum,BigInteger.prototype.toByteArray=bnToByteArray,BigInteger.prototype.equals=bnEquals,BigInteger.prototype.min=bnMin,BigInteger.prototype.max=bnMax,BigInteger.prototype.and=bnAnd,BigInteger.prototype.or=bnOr,BigInteger.prototype.xor=bnXor,BigInteger.prototype.andNot=bnAndNot,BigInteger.prototype.not=bnNot,BigInteger.prototype.shiftLeft=bnShiftLeft,BigInteger.prototype.shiftRight=bnShiftRight,BigInteger.prototype.getLowestSetBit=bnGetLowestSetBit,BigInteger.prototype.bitCount=bnBitCount,BigInteger.prototype.testBit=bnTestBit,BigInteger.prototype.setBit=bnSetBit,BigInteger.prototype.clearBit=bnClearBit,BigInteger.prototype.flipBit=bnFlipBit,BigInteger.prototype.add=bnAdd,BigInteger.prototype.subtract=bnSubtract,BigInteger.prototype.multiply=bnMultiply,BigInteger.prototype.divide=bnDivide,BigInteger.prototype.remainder=bnRemainder,BigInteger.prototype.divideAndRemainder=bnDivideAndRemainder,BigInteger.prototype.modPow=bnModPow,BigInteger.prototype.modInverse=bnModInverse,BigInteger.prototype.pow=bnPow,BigInteger.prototype.gcd=bnGCD,BigInteger.prototype.isProbablePrime=bnIsProbablePrime,BigInteger.prototype.square=bnSquare,Arcfour.prototype.init=ARC4init,Arcfour.prototype.next=ARC4next;var rng_psize=256,rng_state,rng_pool,rng_pptr;if(null==rng_pool){rng_pool=new Array,rng_pptr=0;var t;if(window.crypto&&window.crypto.getRandomValues){var z=new Uint32Array(256);for(window.crypto.getRandomValues(z),t=0;t<z.length;++t)rng_pool[rng_pptr++]=255&z[t]}var onMouseMoveListener=function(a){if(this.count=this.count||0,this.count>=256||rng_pptr>=rng_psize)return void(window.removeEventListener?window.removeEventListener(\"mousemove\",onMouseMoveListener):window.detachEvent&&window.detachEvent(\"onmousemove\",onMouseMoveListener));this.count+=1;var b=a.x+a.y;rng_pool[rng_pptr++]=255&b};window.addEventListener?window.addEventListener(\"mousemove\",onMouseMoveListener):window.attachEvent&&window.attachEvent(\"onmousemove\",onMouseMoveListener)}SecureRandom.prototype.nextBytes=rng_get_bytes,RSAKey.prototype.doPublic=RSADoPublic,RSAKey.prototype.setPublic=RSASetPublic,RSAKey.prototype.encrypt=RSAEncrypt,RSAKey.prototype.doPrivate=RSADoPrivate,RSAKey.prototype.setPrivate=RSASetPrivate,RSAKey.prototype.setPrivateEx=RSASetPrivateEx,RSAKey.prototype.generate=RSAGenerate,RSAKey.prototype.decrypt=RSADecrypt,function(){var a=function(a,b,c){var d=new SecureRandom,e=a>>1;this.e=parseInt(b,16);var f=new BigInteger(b,16),g=this,h=function(){var b=function(){if(g.p.compareTo(g.q)<=0){var a=g.p;g.p=g.q,g.q=a}var b=g.p.subtract(BigInteger.ONE),d=g.q.subtract(BigInteger.ONE),e=b.multiply(d);0==e.gcd(f).compareTo(BigInteger.ONE)?(g.n=g.p.multiply(g.q),g.d=f.modInverse(e),g.dmp1=g.d.mod(b),g.dmq1=g.d.mod(d),g.coeff=g.q.modInverse(g.p),setTimeout(function(){c()},0)):setTimeout(h,0)},i=function(){g.q=nbi(),g.q.fromNumberAsync(e,1,d,function(){g.q.subtract(BigInteger.ONE).gcda(f,function(a){0==a.compareTo(BigInteger.ONE)&&g.q.isProbablePrime(10)?setTimeout(b,0):setTimeout(i,0)})})},j=function(){g.p=nbi(),g.p.fromNumberAsync(a-e,1,d,function(){g.p.subtract(BigInteger.ONE).gcda(f,function(a){0==a.compareTo(BigInteger.ONE)&&g.p.isProbablePrime(10)?setTimeout(i,0):setTimeout(j,0)})})};setTimeout(j,0)};setTimeout(h,0)};RSAKey.prototype.generateAsync=a;var b=function(a,b){var c=this.s<0?this.negate():this.clone(),d=a.s<0?a.negate():a.clone();if(c.compareTo(d)<0){var e=c;c=d,d=e}var f=c.getLowestSetBit(),g=d.getLowestSetBit();if(0>g)return void b(c);g>f&&(g=f),g>0&&(c.rShiftTo(g,c),d.rShiftTo(g,d));var h=function(){(f=c.getLowestSetBit())>0&&c.rShiftTo(f,c),(f=d.getLowestSetBit())>0&&d.rShiftTo(f,d),c.compareTo(d)>=0?(c.subTo(d,c),c.rShiftTo(1,c)):(d.subTo(c,d),d.rShiftTo(1,d)),c.signum()>0?setTimeout(h,0):(g>0&&d.lShiftTo(g,d),setTimeout(function(){b(d)},0))};setTimeout(h,10)};BigInteger.prototype.gcda=b;var c=function(a,b,c,d){if(\"number\"==typeof b)if(2>a)this.fromInt(1);else{this.fromNumber(a,c),this.testBit(a-1)||this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this),this.isEven()&&this.dAddOffset(1,0);var e=this,f=function(){e.dAddOffset(2,0),e.bitLength()>a&&e.subTo(BigInteger.ONE.shiftLeft(a-1),e),e.isProbablePrime(b)?setTimeout(function(){d()},0):setTimeout(f,0)};setTimeout(f,0)}else{var g=new Array,h=7&a;g.length=(a>>3)+1,b.nextBytes(g),h>0?g[0]&=(1<<h)-1:g[0]=0,this.fromString(g,256)}};BigInteger.prototype.fromNumberAsync=c}();var b64map=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\",b64pad=\"=\",JSX=JSX||{};JSX.env=JSX.env||{};var L=JSX,OP=Object.prototype,FUNCTION_TOSTRING=\"[object Function]\",ADD=[\"toString\",\"valueOf\"];JSX.env.parseUA=function(a){var b,c=function(a){var b=0;return parseFloat(a.replace(/\\./g,function(){return 1==b++?\"\":\".\"}))},d=navigator,e={ie:0,opera:0,gecko:0,webkit:0,chrome:0,mobile:null,air:0,ipad:0,iphone:0,ipod:0,ios:null,android:0,webos:0,caja:d&&d.cajaVersion,secure:!1,os:null},f=a||navigator&&navigator.userAgent,g=window&&window.location,h=g&&g.href;return e.secure=h&&0===h.toLowerCase().indexOf(\"https\"),f&&(/windows|win32/i.test(f)?e.os=\"windows\":/macintosh/i.test(f)?e.os=\"macintosh\":/rhino/i.test(f)&&(e.os=\"rhino\"),/KHTML/.test(f)&&(e.webkit=1),b=f.match(/AppleWebKit\\/([^\\s]*)/),b&&b[1]&&(e.webkit=c(b[1]),/ Mobile\\//.test(f)?(e.mobile=\"Apple\",b=f.match(/OS ([^\\s]*)/),b&&b[1]&&(b=c(b[1].replace(\"_\",\".\"))),e.ios=b,e.ipad=e.ipod=e.iphone=0,b=f.match(/iPad|iPod|iPhone/),b&&b[0]&&(e[b[0].toLowerCase()]=e.ios)):(b=f.match(/NokiaN[^\\/]*|Android \\d\\.\\d|webOS\\/\\d\\.\\d/),b&&(e.mobile=b[0]),/webOS/.test(f)&&(e.mobile=\"WebOS\",b=f.match(/webOS\\/([^\\s]*);/),b&&b[1]&&(e.webos=c(b[1]))),/ Android/.test(f)&&(e.mobile=\"Android\",b=f.match(/Android ([^\\s]*);/),b&&b[1]&&(e.android=c(b[1])))),b=f.match(/Chrome\\/([^\\s]*)/),b&&b[1]?e.chrome=c(b[1]):(b=f.match(/AdobeAIR\\/([^\\s]*)/),b&&(e.air=b[0]))),e.webkit||(b=f.match(/Opera[\\s\\/]([^\\s]*)/),b&&b[1]?(e.opera=c(b[1]),b=f.match(/Version\\/([^\\s]*)/),b&&b[1]&&(e.opera=c(b[1])),b=f.match(/Opera Mini[^;]*/),b&&(e.mobile=b[0])):(b=f.match(/MSIE\\s([^;]*)/),b&&b[1]?e.ie=c(b[1]):(b=f.match(/Gecko\\/([^\\s]*)/),b&&(e.gecko=1,b=f.match(/rv:([^\\s\\)]*)/),b&&b[1]&&(e.gecko=c(b[1]))))))),e},JSX.env.ua=JSX.env.parseUA(),JSX.isFunction=function(a){return\"function\"==typeof a||OP.toString.apply(a)===FUNCTION_TOSTRING},JSX._IEEnumFix=JSX.env.ua.ie?function(a,b){var c,d,e;for(c=0;c<ADD.length;c+=1)d=ADD[c],e=b[d],L.isFunction(e)&&e!=OP[d]&&(a[d]=e)}:function(){},JSX.extend=function(a,b,c){if(!b||!a)throw new Error(\"extend failed, please check that all dependencies are included.\");var d,e=function(){};if(e.prototype=b.prototype,a.prototype=new e,a.prototype.constructor=a,a.superclass=b.prototype,b.prototype.constructor==OP.constructor&&(b.prototype.constructor=b),c){for(d in c)L.hasOwnProperty(c,d)&&(a.prototype[d]=c[d]);L._IEEnumFix(a.prototype,c)}},\"undefined\"!=typeof KJUR&&KJUR||(KJUR={}),\"undefined\"!=typeof KJUR.asn1&&KJUR.asn1||(KJUR.asn1={}),KJUR.asn1.ASN1Util=new function(){this.integerToByteHex=function(a){var b=a.toString(16);return b.length%2==1&&(b=\"0\"+b),b},this.bigIntToMinTwosComplementsHex=function(a){var b=a.toString(16);if(\"-\"!=b.substr(0,1))b.length%2==1?b=\"0\"+b:b.match(/^[0-7]/)||(b=\"00\"+b);\nelse{var c=b.substr(1),d=c.length;d%2==1?d+=1:b.match(/^[0-7]/)||(d+=2);for(var e=\"\",f=0;d>f;f++)e+=\"f\";var g=new BigInteger(e,16),h=g.xor(a).add(BigInteger.ONE);b=h.toString(16).replace(/^-/,\"\")}return b},this.getPEMStringFromHex=function(a,b){var c=CryptoJS.enc.Hex.parse(a),d=CryptoJS.enc.Base64.stringify(c),e=d.replace(/(.{64})/g,\"$1\\r\\n\");return e=e.replace(/\\r\\n$/,\"\"),\"-----BEGIN \"+b+\"-----\\r\\n\"+e+\"\\r\\n-----END \"+b+\"-----\\r\\n\"}},KJUR.asn1.ASN1Object=function(){var a=\"\";this.getLengthHexFromValue=function(){if(\"undefined\"==typeof this.hV||null==this.hV)throw\"this.hV is null or undefined.\";if(this.hV.length%2==1)throw\"value hex must be even length: n=\"+a.length+\",v=\"+this.hV;var b=this.hV.length/2,c=b.toString(16);if(c.length%2==1&&(c=\"0\"+c),128>b)return c;var d=c.length/2;if(d>15)throw\"ASN.1 length too long to represent by 8x: n = \"+b.toString(16);var e=128+d;return e.toString(16)+c},this.getEncodedHex=function(){return(null==this.hTLV||this.isModified)&&(this.hV=this.getFreshValueHex(),this.hL=this.getLengthHexFromValue(),this.hTLV=this.hT+this.hL+this.hV,this.isModified=!1),this.hTLV},this.getValueHex=function(){return this.getEncodedHex(),this.hV},this.getFreshValueHex=function(){return\"\"}},KJUR.asn1.DERAbstractString=function(a){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);this.getString=function(){return this.s},this.setString=function(a){this.hTLV=null,this.isModified=!0,this.s=a,this.hV=stohex(this.s)},this.setStringHex=function(a){this.hTLV=null,this.isModified=!0,this.s=null,this.hV=a},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.str?this.setString(a.str):\"undefined\"!=typeof a.hex&&this.setStringHex(a.hex))},JSX.extend(KJUR.asn1.DERAbstractString,KJUR.asn1.ASN1Object),KJUR.asn1.DERAbstractTime=function(){KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);this.localDateToUTC=function(a){utc=a.getTime()+6e4*a.getTimezoneOffset();var b=new Date(utc);return b},this.formatDate=function(a,b){var c=this.zeroPadding,d=this.localDateToUTC(a),e=String(d.getFullYear());\"utc\"==b&&(e=e.substr(2,2));var f=c(String(d.getMonth()+1),2),g=c(String(d.getDate()),2),h=c(String(d.getHours()),2),i=c(String(d.getMinutes()),2),j=c(String(d.getSeconds()),2);return e+f+g+h+i+j+\"Z\"},this.zeroPadding=function(a,b){return a.length>=b?a:new Array(b-a.length+1).join(\"0\")+a},this.getString=function(){return this.s},this.setString=function(a){this.hTLV=null,this.isModified=!0,this.s=a,this.hV=stohex(this.s)},this.setByDateValue=function(a,b,c,d,e,f){var g=new Date(Date.UTC(a,b-1,c,d,e,f,0));this.setByDate(g)},this.getFreshValueHex=function(){return this.hV}},JSX.extend(KJUR.asn1.DERAbstractTime,KJUR.asn1.ASN1Object),KJUR.asn1.DERAbstractStructured=function(a){KJUR.asn1.DERAbstractString.superclass.constructor.call(this);this.setByASN1ObjectArray=function(a){this.hTLV=null,this.isModified=!0,this.asn1Array=a},this.appendASN1Object=function(a){this.hTLV=null,this.isModified=!0,this.asn1Array.push(a)},this.asn1Array=new Array,\"undefined\"!=typeof a&&\"undefined\"!=typeof a.array&&(this.asn1Array=a.array)},JSX.extend(KJUR.asn1.DERAbstractStructured,KJUR.asn1.ASN1Object),KJUR.asn1.DERBoolean=function(){KJUR.asn1.DERBoolean.superclass.constructor.call(this),this.hT=\"01\",this.hTLV=\"0101ff\"},JSX.extend(KJUR.asn1.DERBoolean,KJUR.asn1.ASN1Object),KJUR.asn1.DERInteger=function(a){KJUR.asn1.DERInteger.superclass.constructor.call(this),this.hT=\"02\",this.setByBigInteger=function(a){this.hTLV=null,this.isModified=!0,this.hV=KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(a)},this.setByInteger=function(a){var b=new BigInteger(String(a),10);this.setByBigInteger(b)},this.setValueHex=function(a){this.hV=a},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.bigint?this.setByBigInteger(a.bigint):\"undefined\"!=typeof a[\"int\"]?this.setByInteger(a[\"int\"]):\"undefined\"!=typeof a.hex&&this.setValueHex(a.hex))},JSX.extend(KJUR.asn1.DERInteger,KJUR.asn1.ASN1Object),KJUR.asn1.DERBitString=function(a){KJUR.asn1.DERBitString.superclass.constructor.call(this),this.hT=\"03\",this.setHexValueIncludingUnusedBits=function(a){this.hTLV=null,this.isModified=!0,this.hV=a},this.setUnusedBitsAndHexValue=function(a,b){if(0>a||a>7)throw\"unused bits shall be from 0 to 7: u = \"+a;var c=\"0\"+a;this.hTLV=null,this.isModified=!0,this.hV=c+b},this.setByBinaryString=function(a){a=a.replace(/0+$/,\"\");var b=8-a.length%8;8==b&&(b=0);for(var c=0;b>=c;c++)a+=\"0\";for(var d=\"\",c=0;c<a.length-1;c+=8){var e=a.substr(c,8),f=parseInt(e,2).toString(16);1==f.length&&(f=\"0\"+f),d+=f}this.hTLV=null,this.isModified=!0,this.hV=\"0\"+b+d},this.setByBooleanArray=function(a){for(var b=\"\",c=0;c<a.length;c++)b+=1==a[c]?\"1\":\"0\";this.setByBinaryString(b)},this.newFalseArray=function(a){for(var b=new Array(a),c=0;a>c;c++)b[c]=!1;return b},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.hex?this.setHexValueIncludingUnusedBits(a.hex):\"undefined\"!=typeof a.bin?this.setByBinaryString(a.bin):\"undefined\"!=typeof a.array&&this.setByBooleanArray(a.array))},JSX.extend(KJUR.asn1.DERBitString,KJUR.asn1.ASN1Object),KJUR.asn1.DEROctetString=function(a){KJUR.asn1.DEROctetString.superclass.constructor.call(this,a),this.hT=\"04\"},JSX.extend(KJUR.asn1.DEROctetString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERNull=function(){KJUR.asn1.DERNull.superclass.constructor.call(this),this.hT=\"05\",this.hTLV=\"0500\"},JSX.extend(KJUR.asn1.DERNull,KJUR.asn1.ASN1Object),KJUR.asn1.DERObjectIdentifier=function(a){var b=function(a){var b=a.toString(16);return 1==b.length&&(b=\"0\"+b),b},c=function(a){var c=\"\",d=new BigInteger(a,10),e=d.toString(2),f=7-e.length%7;7==f&&(f=0);for(var g=\"\",h=0;f>h;h++)g+=\"0\";e=g+e;for(var h=0;h<e.length-1;h+=7){var i=e.substr(h,7);h!=e.length-7&&(i=\"1\"+i),c+=b(parseInt(i,2))}return c};KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this),this.hT=\"06\",this.setValueHex=function(a){this.hTLV=null,this.isModified=!0,this.s=null,this.hV=a},this.setValueOidString=function(a){if(!a.match(/^[0-9.]+$/))throw\"malformed oid string: \"+a;var d=\"\",e=a.split(\".\"),f=40*parseInt(e[0])+parseInt(e[1]);d+=b(f),e.splice(0,2);for(var g=0;g<e.length;g++)d+=c(e[g]);this.hTLV=null,this.isModified=!0,this.s=null,this.hV=d},this.setValueName=function(a){if(\"undefined\"==typeof KJUR.asn1.x509.OID.name2oidList[a])throw\"DERObjectIdentifier oidName undefined: \"+a;var b=KJUR.asn1.x509.OID.name2oidList[a];this.setValueOidString(b)},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.oid?this.setValueOidString(a.oid):\"undefined\"!=typeof a.hex?this.setValueHex(a.hex):\"undefined\"!=typeof a.name&&this.setValueName(a.name))},JSX.extend(KJUR.asn1.DERObjectIdentifier,KJUR.asn1.ASN1Object),KJUR.asn1.DERUTF8String=function(a){KJUR.asn1.DERUTF8String.superclass.constructor.call(this,a),this.hT=\"0c\"},JSX.extend(KJUR.asn1.DERUTF8String,KJUR.asn1.DERAbstractString),KJUR.asn1.DERNumericString=function(a){KJUR.asn1.DERNumericString.superclass.constructor.call(this,a),this.hT=\"12\"},JSX.extend(KJUR.asn1.DERNumericString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERPrintableString=function(a){KJUR.asn1.DERPrintableString.superclass.constructor.call(this,a),this.hT=\"13\"},JSX.extend(KJUR.asn1.DERPrintableString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERTeletexString=function(a){KJUR.asn1.DERTeletexString.superclass.constructor.call(this,a),this.hT=\"14\"},JSX.extend(KJUR.asn1.DERTeletexString,KJUR.asn1.DERAbstractString),KJUR.asn1.DERIA5String=function(a){KJUR.asn1.DERIA5String.superclass.constructor.call(this,a),this.hT=\"16\"},JSX.extend(KJUR.asn1.DERIA5String,KJUR.asn1.DERAbstractString),KJUR.asn1.DERUTCTime=function(a){KJUR.asn1.DERUTCTime.superclass.constructor.call(this,a),this.hT=\"17\",this.setByDate=function(a){this.hTLV=null,this.isModified=!0,this.date=a,this.s=this.formatDate(this.date,\"utc\"),this.hV=stohex(this.s)},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.str?this.setString(a.str):\"undefined\"!=typeof a.hex?this.setStringHex(a.hex):\"undefined\"!=typeof a.date&&this.setByDate(a.date))},JSX.extend(KJUR.asn1.DERUTCTime,KJUR.asn1.DERAbstractTime),KJUR.asn1.DERGeneralizedTime=function(a){KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this,a),this.hT=\"18\",this.setByDate=function(a){this.hTLV=null,this.isModified=!0,this.date=a,this.s=this.formatDate(this.date,\"gen\"),this.hV=stohex(this.s)},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.str?this.setString(a.str):\"undefined\"!=typeof a.hex?this.setStringHex(a.hex):\"undefined\"!=typeof a.date&&this.setByDate(a.date))},JSX.extend(KJUR.asn1.DERGeneralizedTime,KJUR.asn1.DERAbstractTime),KJUR.asn1.DERSequence=function(a){KJUR.asn1.DERSequence.superclass.constructor.call(this,a),this.hT=\"30\",this.getFreshValueHex=function(){for(var a=\"\",b=0;b<this.asn1Array.length;b++){var c=this.asn1Array[b];a+=c.getEncodedHex()}return this.hV=a,this.hV}},JSX.extend(KJUR.asn1.DERSequence,KJUR.asn1.DERAbstractStructured),KJUR.asn1.DERSet=function(a){KJUR.asn1.DERSet.superclass.constructor.call(this,a),this.hT=\"31\",this.getFreshValueHex=function(){for(var a=new Array,b=0;b<this.asn1Array.length;b++){var c=this.asn1Array[b];a.push(c.getEncodedHex())}return a.sort(),this.hV=a.join(\"\"),this.hV}},JSX.extend(KJUR.asn1.DERSet,KJUR.asn1.DERAbstractStructured),KJUR.asn1.DERTaggedObject=function(a){KJUR.asn1.DERTaggedObject.superclass.constructor.call(this),this.hT=\"a0\",this.hV=\"\",this.isExplicit=!0,this.asn1Object=null,this.setASN1Object=function(a,b,c){this.hT=b,this.isExplicit=a,this.asn1Object=c,this.isExplicit?(this.hV=this.asn1Object.getEncodedHex(),this.hTLV=null,this.isModified=!0):(this.hV=null,this.hTLV=c.getEncodedHex(),this.hTLV=this.hTLV.replace(/^../,b),this.isModified=!1)},this.getFreshValueHex=function(){return this.hV},\"undefined\"!=typeof a&&(\"undefined\"!=typeof a.tag&&(this.hT=a.tag),\"undefined\"!=typeof a.explicit&&(this.isExplicit=a.explicit),\"undefined\"!=typeof a.obj&&(this.asn1Object=a.obj,this.setASN1Object(this.isExplicit,this.hT,this.asn1Object)))},JSX.extend(KJUR.asn1.DERTaggedObject,KJUR.asn1.ASN1Object),function(a){\"use strict\";var b,c={};c.decode=function(c){var d;if(b===a){var e=\"0123456789ABCDEF\",f=\" \\f\\n\\r\t \\u2028\\u2029\";for(b=[],d=0;16>d;++d)b[e.charAt(d)]=d;for(e=e.toLowerCase(),d=10;16>d;++d)b[e.charAt(d)]=d;for(d=0;d<f.length;++d)b[f.charAt(d)]=-1}var g=[],h=0,i=0;for(d=0;d<c.length;++d){var j=c.charAt(d);if(\"=\"==j)break;if(j=b[j],-1!=j){if(j===a)throw\"Illegal character at offset \"+d;h|=j,++i>=2?(g[g.length]=h,h=0,i=0):h<<=4}}if(i)throw\"Hex encoding incomplete: 4 bits missing\";return g},window.Hex=c}(),function(a){\"use strict\";var b,c={};c.decode=function(c){var d;if(b===a){var e=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\",f=\"= \\f\\n\\r\t \\u2028\\u2029\";for(b=[],d=0;64>d;++d)b[e.charAt(d)]=d;for(d=0;d<f.length;++d)b[f.charAt(d)]=-1}var g=[],h=0,i=0;for(d=0;d<c.length;++d){var j=c.charAt(d);if(\"=\"==j)break;if(j=b[j],-1!=j){if(j===a)throw\"Illegal character at offset \"+d;h|=j,++i>=4?(g[g.length]=h>>16,g[g.length]=h>>8&255,g[g.length]=255&h,h=0,i=0):h<<=6}}switch(i){case 1:throw\"Base64 encoding incomplete: at least 2 bits missing\";case 2:g[g.length]=h>>10;break;case 3:g[g.length]=h>>16,g[g.length]=h>>8&255}return g},c.re=/-----BEGIN [^-]+-----([A-Za-z0-9+\\/=\\s]+)-----END [^-]+-----|begin-base64[^\\n]+\\n([A-Za-z0-9+\\/=\\s]+)====/,c.unarmor=function(a){var b=c.re.exec(a);if(b)if(b[1])a=b[1];else{if(!b[2])throw\"RegExp out of sync\";a=b[2]}return c.decode(a)},window.Base64=c}(),function(a){\"use strict\";function b(a,c){a instanceof b?(this.enc=a.enc,this.pos=a.pos):(this.enc=a,this.pos=c)}function c(a,b,c,d,e){this.stream=a,this.header=b,this.length=c,this.tag=d,this.sub=e}var d=100,e=\"â€¦\",f={tag:function(a,b){var c=document.createElement(a);return c.className=b,c},text:function(a){return document.createTextNode(a)}};b.prototype.get=function(b){if(b===a&&(b=this.pos++),b>=this.enc.length)throw\"Requesting byte offset \"+b+\" on a stream of length \"+this.enc.length;return this.enc[b]},b.prototype.hexDigits=\"0123456789ABCDEF\",b.prototype.hexByte=function(a){return this.hexDigits.charAt(a>>4&15)+this.hexDigits.charAt(15&a)},b.prototype.hexDump=function(a,b,c){for(var d=\"\",e=a;b>e;++e)if(d+=this.hexByte(this.get(e)),c!==!0)switch(15&e){case 7:d+=\"  \";break;case 15:d+=\"\\n\";break;default:d+=\" \"}return d},b.prototype.parseStringISO=function(a,b){for(var c=\"\",d=a;b>d;++d)c+=String.fromCharCode(this.get(d));return c},b.prototype.parseStringUTF=function(a,b){for(var c=\"\",d=a;b>d;){var e=this.get(d++);c+=String.fromCharCode(128>e?e:e>191&&224>e?(31&e)<<6|63&this.get(d++):(15&e)<<12|(63&this.get(d++))<<6|63&this.get(d++))}return c},b.prototype.parseStringBMP=function(a,b){for(var c=\"\",d=a;b>d;d+=2){var e=this.get(d),f=this.get(d+1);c+=String.fromCharCode((e<<8)+f)}return c},b.prototype.reTime=/^((?:1[89]|2\\d)?\\d\\d)(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])([01]\\d|2[0-3])(?:([0-5]\\d)(?:([0-5]\\d)(?:[.,](\\d{1,3}))?)?)?(Z|[-+](?:[0]\\d|1[0-2])([0-5]\\d)?)?$/,b.prototype.parseTime=function(a,b){var c=this.parseStringISO(a,b),d=this.reTime.exec(c);return d?(c=d[1]+\"-\"+d[2]+\"-\"+d[3]+\" \"+d[4],d[5]&&(c+=\":\"+d[5],d[6]&&(c+=\":\"+d[6],d[7]&&(c+=\".\"+d[7]))),d[8]&&(c+=\" UTC\",\"Z\"!=d[8]&&(c+=d[8],d[9]&&(c+=\":\"+d[9]))),c):\"Unrecognized time: \"+c},b.prototype.parseInteger=function(a,b){var c=b-a;if(c>4){c<<=3;var d=this.get(a);if(0===d)c-=8;else for(;128>d;)d<<=1,--c;return\"(\"+c+\" bit)\"}for(var e=0,f=a;b>f;++f)e=e<<8|this.get(f);return e},b.prototype.parseBitString=function(a,b){var c=this.get(a),d=(b-a-1<<3)-c,e=\"(\"+d+\" bit)\";if(20>=d){var f=c;e+=\" \";for(var g=b-1;g>a;--g){for(var h=this.get(g),i=f;8>i;++i)e+=h>>i&1?\"1\":\"0\";f=0}}return e},b.prototype.parseOctetString=function(a,b){var c=b-a,f=\"(\"+c+\" byte) \";c>d&&(b=a+d);for(var g=a;b>g;++g)f+=this.hexByte(this.get(g));return c>d&&(f+=e),f},b.prototype.parseOID=function(a,b){for(var c=\"\",d=0,e=0,f=a;b>f;++f){var g=this.get(f);if(d=d<<7|127&g,e+=7,!(128&g)){if(\"\"===c){var h=80>d?40>d?0:1:2;c=h+\".\"+(d-40*h)}else c+=\".\"+(e>=31?\"bigint\":d);d=e=0}}return c},c.prototype.typeName=function(){if(this.tag===a)return\"unknown\";var b=this.tag>>6,c=(this.tag>>5&1,31&this.tag);switch(b){case 0:switch(c){case 0:return\"EOC\";case 1:return\"BOOLEAN\";case 2:return\"INTEGER\";case 3:return\"BIT_STRING\";case 4:return\"OCTET_STRING\";case 5:return\"NULL\";case 6:return\"OBJECT_IDENTIFIER\";case 7:return\"ObjectDescriptor\";case 8:return\"EXTERNAL\";case 9:return\"REAL\";case 10:return\"ENUMERATED\";case 11:return\"EMBEDDED_PDV\";case 12:return\"UTF8String\";case 16:return\"SEQUENCE\";case 17:return\"SET\";case 18:return\"NumericString\";case 19:return\"PrintableString\";case 20:return\"TeletexString\";case 21:return\"VideotexString\";case 22:return\"IA5String\";case 23:return\"UTCTime\";case 24:return\"GeneralizedTime\";case 25:return\"GraphicString\";case 26:return\"VisibleString\";case 27:return\"GeneralString\";case 28:return\"UniversalString\";case 30:return\"BMPString\";default:return\"Universal_\"+c.toString(16)}case 1:return\"Application_\"+c.toString(16);case 2:return\"[\"+c+\"]\";case 3:return\"Private_\"+c.toString(16)}},c.prototype.reSeemsASCII=/^[ -~]+$/,c.prototype.content=function(){if(this.tag===a)return null;var b=this.tag>>6,c=31&this.tag,f=this.posContent(),g=Math.abs(this.length);if(0!==b){if(null!==this.sub)return\"(\"+this.sub.length+\" elem)\";var h=this.stream.parseStringISO(f,f+Math.min(g,d));return this.reSeemsASCII.test(h)?h.substring(0,2*d)+(h.length>2*d?e:\"\"):this.stream.parseOctetString(f,f+g)}switch(c){case 1:return 0===this.stream.get(f)?\"false\":\"true\";case 2:return this.stream.parseInteger(f,f+g);case 3:return this.sub?\"(\"+this.sub.length+\" elem)\":this.stream.parseBitString(f,f+g);case 4:return this.sub?\"(\"+this.sub.length+\" elem)\":this.stream.parseOctetString(f,f+g);case 6:return this.stream.parseOID(f,f+g);case 16:case 17:return\"(\"+this.sub.length+\" elem)\";case 12:return this.stream.parseStringUTF(f,f+g);case 18:case 19:case 20:case 21:case 22:case 26:return this.stream.parseStringISO(f,f+g);case 30:return this.stream.parseStringBMP(f,f+g);case 23:case 24:return this.stream.parseTime(f,f+g)}return null},c.prototype.toString=function(){return this.typeName()+\"@\"+this.stream.pos+\"[header:\"+this.header+\",length:\"+this.length+\",sub:\"+(null===this.sub?\"null\":this.sub.length)+\"]\"},c.prototype.print=function(b){if(b===a&&(b=\"\"),document.writeln(b+this),null!==this.sub){b+=\"  \";for(var c=0,d=this.sub.length;d>c;++c)this.sub[c].print(b)}},c.prototype.toPrettyString=function(b){b===a&&(b=\"\");var c=b+this.typeName()+\" @\"+this.stream.pos;if(this.length>=0&&(c+=\"+\"),c+=this.length,32&this.tag?c+=\" (constructed)\":3!=this.tag&&4!=this.tag||null===this.sub||(c+=\" (encapsulates)\"),c+=\"\\n\",null!==this.sub){b+=\"  \";for(var d=0,e=this.sub.length;e>d;++d)c+=this.sub[d].toPrettyString(b)}return c},c.prototype.toDOM=function(){var a=f.tag(\"div\",\"node\");a.asn1=this;var b=f.tag(\"div\",\"head\"),c=this.typeName().replace(/_/g,\" \");b.innerHTML=c;var d=this.content();if(null!==d){d=String(d).replace(/</g,\"&lt;\");var e=f.tag(\"span\",\"preview\");e.appendChild(f.text(d)),b.appendChild(e)}a.appendChild(b),this.node=a,this.head=b;var g=f.tag(\"div\",\"value\");if(c=\"Offset: \"+this.stream.pos+\"<br/>\",c+=\"Length: \"+this.header+\"+\",c+=this.length>=0?this.length:-this.length+\" (undefined)\",32&this.tag?c+=\"<br/>(constructed)\":3!=this.tag&&4!=this.tag||null===this.sub||(c+=\"<br/>(encapsulates)\"),null!==d&&(c+=\"<br/>Value:<br/><b>\"+d+\"</b>\",\"object\"==typeof oids&&6==this.tag)){var h=oids[d];h&&(h.d&&(c+=\"<br/>\"+h.d),h.c&&(c+=\"<br/>\"+h.c),h.w&&(c+=\"<br/>(warning!)\"))}g.innerHTML=c,a.appendChild(g);var i=f.tag(\"div\",\"sub\");if(null!==this.sub)for(var j=0,k=this.sub.length;k>j;++j)i.appendChild(this.sub[j].toDOM());return a.appendChild(i),b.onclick=function(){a.className=\"node collapsed\"==a.className?\"node\":\"node collapsed\"},a},c.prototype.posStart=function(){return this.stream.pos},c.prototype.posContent=function(){return this.stream.pos+this.header},c.prototype.posEnd=function(){return this.stream.pos+this.header+Math.abs(this.length)},c.prototype.fakeHover=function(a){this.node.className+=\" hover\",a&&(this.head.className+=\" hover\")},c.prototype.fakeOut=function(a){var b=/ ?hover/;this.node.className=this.node.className.replace(b,\"\"),a&&(this.head.className=this.head.className.replace(b,\"\"))},c.prototype.toHexDOM_sub=function(a,b,c,d,e){if(!(d>=e)){var g=f.tag(\"span\",b);g.appendChild(f.text(c.hexDump(d,e))),a.appendChild(g)}},c.prototype.toHexDOM=function(b){var c=f.tag(\"span\",\"hex\");if(b===a&&(b=c),this.head.hexNode=c,this.head.onmouseover=function(){this.hexNode.className=\"hexCurrent\"},this.head.onmouseout=function(){this.hexNode.className=\"hex\"},c.asn1=this,c.onmouseover=function(){var a=!b.selected;a&&(b.selected=this.asn1,this.className=\"hexCurrent\"),this.asn1.fakeHover(a)},c.onmouseout=function(){var a=b.selected==this.asn1;this.asn1.fakeOut(a),a&&(b.selected=null,this.className=\"hex\")},this.toHexDOM_sub(c,\"tag\",this.stream,this.posStart(),this.posStart()+1),this.toHexDOM_sub(c,this.length>=0?\"dlen\":\"ulen\",this.stream,this.posStart()+1,this.posContent()),null===this.sub)c.appendChild(f.text(this.stream.hexDump(this.posContent(),this.posEnd())));else if(this.sub.length>0){var d=this.sub[0],e=this.sub[this.sub.length-1];this.toHexDOM_sub(c,\"intro\",this.stream,this.posContent(),d.posStart());for(var g=0,h=this.sub.length;h>g;++g)c.appendChild(this.sub[g].toHexDOM(b));this.toHexDOM_sub(c,\"outro\",this.stream,e.posEnd(),this.posEnd())}return c},c.prototype.toHexString=function(){return this.stream.hexDump(this.posStart(),this.posEnd(),!0)},c.decodeLength=function(a){var b=a.get(),c=127&b;if(c==b)return c;if(c>3)throw\"Length over 24 bits not supported at position \"+(a.pos-1);if(0===c)return-1;b=0;for(var d=0;c>d;++d)b=b<<8|a.get();return b},c.hasContent=function(a,d,e){if(32&a)return!0;if(3>a||a>4)return!1;var f=new b(e);3==a&&f.get();var g=f.get();if(g>>6&1)return!1;try{var h=c.decodeLength(f);return f.pos-e.pos+h==d}catch(i){return!1}},c.decode=function(a){a instanceof b||(a=new b(a,0));var d=new b(a),e=a.get(),f=c.decodeLength(a),g=a.pos-d.pos,h=null;if(c.hasContent(e,f,a)){var i=a.pos;if(3==e&&a.get(),h=[],f>=0){for(var j=i+f;a.pos<j;)h[h.length]=c.decode(a);if(a.pos!=j)throw\"Content size is not correct for container starting at offset \"+i}else try{for(;;){var k=c.decode(a);if(0===k.tag)break;h[h.length]=k}f=i-a.pos}catch(l){throw\"Exception while decoding undefined length content: \"+l}}else a.pos+=f;return new c(d,g,f,e,h)},c.test=function(){for(var a=[{value:[39],expected:39},{value:[129,201],expected:201},{value:[131,254,220,186],expected:16702650}],d=0,e=a.length;e>d;++d){var f=new b(a[d].value,0),g=c.decodeLength(f);g!=a[d].expected&&document.write(\"In test[\"+d+\"] expected \"+a[d].expected+\" got \"+g+\"\\n\")}},window.ASN1=c}(),ASN1.prototype.getHexStringValue=function(){var a=this.toHexString(),b=2*this.header,c=2*this.length;return a.substr(b,c)},RSAKey.prototype.parseKey=function(a){try{var b=0,c=0,d=/^\\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\\s*)+$/,e=d.test(a)?Hex.decode(a):Base64.unarmor(a),f=ASN1.decode(e);if(3===f.sub.length&&(f=f.sub[2].sub[0]),9===f.sub.length){b=f.sub[1].getHexStringValue(),this.n=parseBigInt(b,16),c=f.sub[2].getHexStringValue(),this.e=parseInt(c,16);var g=f.sub[3].getHexStringValue();this.d=parseBigInt(g,16);var h=f.sub[4].getHexStringValue();this.p=parseBigInt(h,16);var i=f.sub[5].getHexStringValue();this.q=parseBigInt(i,16);var j=f.sub[6].getHexStringValue();this.dmp1=parseBigInt(j,16);var k=f.sub[7].getHexStringValue();this.dmq1=parseBigInt(k,16);var l=f.sub[8].getHexStringValue();this.coeff=parseBigInt(l,16)}else{if(2!==f.sub.length)return!1;var m=f.sub[1],n=m.sub[0];b=n.sub[0].getHexStringValue(),this.n=parseBigInt(b,16),c=n.sub[1].getHexStringValue(),this.e=parseInt(c,16)}return!0}catch(o){return!1}},RSAKey.prototype.getPrivateBaseKey=function(){var a={array:[new KJUR.asn1.DERInteger({\"int\":0}),new KJUR.asn1.DERInteger({bigint:this.n}),new KJUR.asn1.DERInteger({\"int\":this.e}),new KJUR.asn1.DERInteger({bigint:this.d}),new KJUR.asn1.DERInteger({bigint:this.p}),new KJUR.asn1.DERInteger({bigint:this.q}),new KJUR.asn1.DERInteger({bigint:this.dmp1}),new KJUR.asn1.DERInteger({bigint:this.dmq1}),new KJUR.asn1.DERInteger({bigint:this.coeff})]},b=new KJUR.asn1.DERSequence(a);return b.getEncodedHex()},RSAKey.prototype.getPrivateBaseKeyB64=function(){return hex2b64(this.getPrivateBaseKey())},RSAKey.prototype.getPublicBaseKey=function(){var a={array:[new KJUR.asn1.DERObjectIdentifier({oid:\"1.2.840.113549.1.1.1\"}),new KJUR.asn1.DERNull]},b=new KJUR.asn1.DERSequence(a);a={array:[new KJUR.asn1.DERInteger({bigint:this.n}),new KJUR.asn1.DERInteger({\"int\":this.e})]};var c=new KJUR.asn1.DERSequence(a);a={hex:\"00\"+c.getEncodedHex()};var d=new KJUR.asn1.DERBitString(a);a={array:[b,d]};var e=new KJUR.asn1.DERSequence(a);return e.getEncodedHex()},RSAKey.prototype.getPublicBaseKeyB64=function(){return hex2b64(this.getPublicBaseKey())},RSAKey.prototype.wordwrap=function(a,b){if(b=b||64,!a)return a;var c=\"(.{1,\"+b+\"})( +|$\\n?)|(.{1,\"+b+\"})\";return a.match(RegExp(c,\"g\")).join(\"\\n\")},RSAKey.prototype.getPrivateKey=function(){var a=\"-----BEGIN RSA PRIVATE KEY-----\\n\";return a+=this.wordwrap(this.getPrivateBaseKeyB64())+\"\\n\",a+=\"-----END RSA PRIVATE KEY-----\"},RSAKey.prototype.getPublicKey=function(){var a=\"-----BEGIN PUBLIC KEY-----\\n\";return a+=this.wordwrap(this.getPublicBaseKeyB64())+\"\\n\",a+=\"-----END PUBLIC KEY-----\"},RSAKey.prototype.hasPublicKeyProperty=function(a){return a=a||{},a.hasOwnProperty(\"n\")&&a.hasOwnProperty(\"e\")},RSAKey.prototype.hasPrivateKeyProperty=function(a){return a=a||{},a.hasOwnProperty(\"n\")&&a.hasOwnProperty(\"e\")&&a.hasOwnProperty(\"d\")&&a.hasOwnProperty(\"p\")&&a.hasOwnProperty(\"q\")&&a.hasOwnProperty(\"dmp1\")&&a.hasOwnProperty(\"dmq1\")&&a.hasOwnProperty(\"coeff\")},RSAKey.prototype.parsePropertiesFrom=function(a){this.n=a.n,this.e=a.e,a.hasOwnProperty(\"d\")&&(this.d=a.d,this.p=a.p,this.q=a.q,this.dmp1=a.dmp1,this.dmq1=a.dmq1,this.coeff=a.coeff)};var JSEncryptRSAKey=function(a){RSAKey.call(this),a&&(\"string\"==typeof a?this.parseKey(a):(this.hasPrivateKeyProperty(a)||this.hasPublicKeyProperty(a))&&this.parsePropertiesFrom(a))};JSEncryptRSAKey.prototype=new RSAKey,JSEncryptRSAKey.prototype.constructor=JSEncryptRSAKey;var JSEncrypt=function(a){a=a||{},this.default_key_size=parseInt(a.default_key_size)||1024,this.default_public_exponent=a.default_public_exponent||\"010001\",this.log=a.log||!1,this.key=null};JSEncrypt.prototype.setKey=function(a){this.log&&this.key&&console.warn(\"A key was already set, overriding existing.\"),this.key=new JSEncryptRSAKey(a)},JSEncrypt.prototype.setPrivateKey=function(a){this.setKey(a)},JSEncrypt.prototype.setPublicKey=function(a){this.setKey(a)},JSEncrypt.prototype.decrypt=function(a){try{return this.getKey().decrypt(b64tohex(a))}catch(b){return!1}},JSEncrypt.prototype.encrypt=function(a){try{return hex2b64(this.getKey().encrypt(a))}catch(b){return!1}},JSEncrypt.prototype.getKey=function(a){if(!this.key){if(this.key=new JSEncryptRSAKey,a&&\"[object Function]\"==={}.toString.call(a))return void this.key.generateAsync(this.default_key_size,this.default_public_exponent,a);this.key.generate(this.default_key_size,this.default_public_exponent)}return this.key},JSEncrypt.prototype.getPrivateKey=function(){return this.getKey().getPrivateKey()},JSEncrypt.prototype.getPrivateKeyB64=function(){return this.getKey().getPrivateBaseKeyB64()},JSEncrypt.prototype.getPublicKey=function(){return this.getKey().getPublicKey()},JSEncrypt.prototype.getPublicKeyB64=function(){return this.getKey().getPublicBaseKeyB64()};exports.JSEncrypt = JSEncrypt;\n})(JSEncryptExports);\nvar JSEncrypt = JSEncryptExports.JSEncrypt;\n"; /***/}, /* 5 */ /***/function(module,exports,__webpack_require__){__webpack_require__(3)(__webpack_require__(6)); /***/}, /* 6 */ /***/function(module,exports){module.exports="/*\nCryptoJS v3.1.2\ncode.google.com/p/crypto-js\n(c) 2009-2013 by Jeff Mott. All rights reserved.\ncode.google.com/p/crypto-js/wiki/License\n*/\nvar CryptoJS=CryptoJS||function(u,p){var d={},l=d.lib={},s=function(){},t=l.Base={extend:function(a){s.prototype=this;var c=new s;a&&c.mixIn(a);c.hasOwnProperty(\"init\")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty(\"toString\")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},\nr=l.WordArray=t.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=p?c:4*a.length},toString:function(a){return(a||v).stringify(this)},concat:function(a){var c=this.words,e=a.words,j=this.sigBytes;a=a.sigBytes;this.clamp();if(j%4)for(var k=0;k<a;k++)c[j+k>>>2]|=(e[k>>>2]>>>24-8*(k%4)&255)<<24-8*((j+k)%4);else if(65535<e.length)for(k=0;k<a;k+=4)c[j+k>>>2]=e[k>>>2];else c.push.apply(c,e);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<\n32-8*(c%4);a.length=u.ceil(c/4)},clone:function(){var a=t.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],e=0;e<a;e+=4)c.push(4294967296*u.random()|0);return new r.init(c,a)}}),w=d.enc={},v=w.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++){var k=c[j>>>2]>>>24-8*(j%4)&255;e.push((k>>>4).toString(16));e.push((k&15).toString(16))}return e.join(\"\")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j+=2)e[j>>>3]|=parseInt(a.substr(j,\n2),16)<<24-4*(j%8);return new r.init(e,c/2)}},b=w.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var e=[],j=0;j<a;j++)e.push(String.fromCharCode(c[j>>>2]>>>24-8*(j%4)&255));return e.join(\"\")},parse:function(a){for(var c=a.length,e=[],j=0;j<c;j++)e[j>>>2]|=(a.charCodeAt(j)&255)<<24-8*(j%4);return new r.init(e,c)}},x=w.Utf8={stringify:function(a){try{return decodeURIComponent(escape(b.stringify(a)))}catch(c){throw Error(\"Malformed UTF-8 data\");}},parse:function(a){return b.parse(unescape(encodeURIComponent(a)))}},\nq=l.BufferedBlockAlgorithm=t.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){\"string\"==typeof a&&(a=x.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,e=c.words,j=c.sigBytes,k=this.blockSize,b=j/(4*k),b=a?u.ceil(b):u.max((b|0)-this._minBufferSize,0);a=b*k;j=u.min(4*a,j);if(a){for(var q=0;q<a;q+=k)this._doProcessBlock(e,q);q=e.splice(0,a);c.sigBytes-=j}return new r.init(q,j)},clone:function(){var a=t.clone.call(this);\na._data=this._data.clone();return a},_minBufferSize:0});l.Hasher=q.extend({cfg:t.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){q.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,e){return(new a.init(e)).finalize(b)}},_createHmacHelper:function(a){return function(b,e){return(new n.HMAC.init(a,\ne)).finalize(b)}}});var n=d.algo={};return d}(Math);\n(function(){var u=CryptoJS,p=u.lib.WordArray;u.enc.Base64={stringify:function(d){var l=d.words,p=d.sigBytes,t=this._map;d.clamp();d=[];for(var r=0;r<p;r+=3)for(var w=(l[r>>>2]>>>24-8*(r%4)&255)<<16|(l[r+1>>>2]>>>24-8*((r+1)%4)&255)<<8|l[r+2>>>2]>>>24-8*((r+2)%4)&255,v=0;4>v&&r+0.75*v<p;v++)d.push(t.charAt(w>>>6*(3-v)&63));if(l=t.charAt(64))for(;d.length%4;)d.push(l);return d.join(\"\")},parse:function(d){var l=d.length,s=this._map,t=s.charAt(64);t&&(t=d.indexOf(t),-1!=t&&(l=t));for(var t=[],r=0,w=0;w<\nl;w++)if(w%4){var v=s.indexOf(d.charAt(w-1))<<2*(w%4),b=s.indexOf(d.charAt(w))>>>6-2*(w%4);t[r>>>2]|=(v|b)<<24-8*(r%4);r++}return p.create(t,r)},_map:\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\"}})();\n(function(u){function p(b,n,a,c,e,j,k){b=b+(n&a|~n&c)+e+k;return(b<<j|b>>>32-j)+n}function d(b,n,a,c,e,j,k){b=b+(n&c|a&~c)+e+k;return(b<<j|b>>>32-j)+n}function l(b,n,a,c,e,j,k){b=b+(n^a^c)+e+k;return(b<<j|b>>>32-j)+n}function s(b,n,a,c,e,j,k){b=b+(a^(n|~c))+e+k;return(b<<j|b>>>32-j)+n}for(var t=CryptoJS,r=t.lib,w=r.WordArray,v=r.Hasher,r=t.algo,b=[],x=0;64>x;x++)b[x]=4294967296*u.abs(u.sin(x+1))|0;r=r.MD5=v.extend({_doReset:function(){this._hash=new w.init([1732584193,4023233417,2562383102,271733878])},\n_doProcessBlock:function(q,n){for(var a=0;16>a;a++){var c=n+a,e=q[c];q[c]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360}var a=this._hash.words,c=q[n+0],e=q[n+1],j=q[n+2],k=q[n+3],z=q[n+4],r=q[n+5],t=q[n+6],w=q[n+7],v=q[n+8],A=q[n+9],B=q[n+10],C=q[n+11],u=q[n+12],D=q[n+13],E=q[n+14],x=q[n+15],f=a[0],m=a[1],g=a[2],h=a[3],f=p(f,m,g,h,c,7,b[0]),h=p(h,f,m,g,e,12,b[1]),g=p(g,h,f,m,j,17,b[2]),m=p(m,g,h,f,k,22,b[3]),f=p(f,m,g,h,z,7,b[4]),h=p(h,f,m,g,r,12,b[5]),g=p(g,h,f,m,t,17,b[6]),m=p(m,g,h,f,w,22,b[7]),\nf=p(f,m,g,h,v,7,b[8]),h=p(h,f,m,g,A,12,b[9]),g=p(g,h,f,m,B,17,b[10]),m=p(m,g,h,f,C,22,b[11]),f=p(f,m,g,h,u,7,b[12]),h=p(h,f,m,g,D,12,b[13]),g=p(g,h,f,m,E,17,b[14]),m=p(m,g,h,f,x,22,b[15]),f=d(f,m,g,h,e,5,b[16]),h=d(h,f,m,g,t,9,b[17]),g=d(g,h,f,m,C,14,b[18]),m=d(m,g,h,f,c,20,b[19]),f=d(f,m,g,h,r,5,b[20]),h=d(h,f,m,g,B,9,b[21]),g=d(g,h,f,m,x,14,b[22]),m=d(m,g,h,f,z,20,b[23]),f=d(f,m,g,h,A,5,b[24]),h=d(h,f,m,g,E,9,b[25]),g=d(g,h,f,m,k,14,b[26]),m=d(m,g,h,f,v,20,b[27]),f=d(f,m,g,h,D,5,b[28]),h=d(h,f,\nm,g,j,9,b[29]),g=d(g,h,f,m,w,14,b[30]),m=d(m,g,h,f,u,20,b[31]),f=l(f,m,g,h,r,4,b[32]),h=l(h,f,m,g,v,11,b[33]),g=l(g,h,f,m,C,16,b[34]),m=l(m,g,h,f,E,23,b[35]),f=l(f,m,g,h,e,4,b[36]),h=l(h,f,m,g,z,11,b[37]),g=l(g,h,f,m,w,16,b[38]),m=l(m,g,h,f,B,23,b[39]),f=l(f,m,g,h,D,4,b[40]),h=l(h,f,m,g,c,11,b[41]),g=l(g,h,f,m,k,16,b[42]),m=l(m,g,h,f,t,23,b[43]),f=l(f,m,g,h,A,4,b[44]),h=l(h,f,m,g,u,11,b[45]),g=l(g,h,f,m,x,16,b[46]),m=l(m,g,h,f,j,23,b[47]),f=s(f,m,g,h,c,6,b[48]),h=s(h,f,m,g,w,10,b[49]),g=s(g,h,f,m,\nE,15,b[50]),m=s(m,g,h,f,r,21,b[51]),f=s(f,m,g,h,u,6,b[52]),h=s(h,f,m,g,k,10,b[53]),g=s(g,h,f,m,B,15,b[54]),m=s(m,g,h,f,e,21,b[55]),f=s(f,m,g,h,v,6,b[56]),h=s(h,f,m,g,x,10,b[57]),g=s(g,h,f,m,t,15,b[58]),m=s(m,g,h,f,D,21,b[59]),f=s(f,m,g,h,z,6,b[60]),h=s(h,f,m,g,C,10,b[61]),g=s(g,h,f,m,j,15,b[62]),m=s(m,g,h,f,A,21,b[63]);a[0]=a[0]+f|0;a[1]=a[1]+m|0;a[2]=a[2]+g|0;a[3]=a[3]+h|0},_doFinalize:function(){var b=this._data,n=b.words,a=8*this._nDataBytes,c=8*b.sigBytes;n[c>>>5]|=128<<24-c%32;var e=u.floor(a/\n4294967296);n[(c+64>>>9<<4)+15]=(e<<8|e>>>24)&16711935|(e<<24|e>>>8)&4278255360;n[(c+64>>>9<<4)+14]=(a<<8|a>>>24)&16711935|(a<<24|a>>>8)&4278255360;b.sigBytes=4*(n.length+1);this._process();b=this._hash;n=b.words;for(a=0;4>a;a++)c=n[a],n[a]=(c<<8|c>>>24)&16711935|(c<<24|c>>>8)&4278255360;return b},clone:function(){var b=v.clone.call(this);b._hash=this._hash.clone();return b}});t.MD5=v._createHelper(r);t.HmacMD5=v._createHmacHelper(r)})(Math);\n(function(){var u=CryptoJS,p=u.lib,d=p.Base,l=p.WordArray,p=u.algo,s=p.EvpKDF=d.extend({cfg:d.extend({keySize:4,hasher:p.MD5,iterations:1}),init:function(d){this.cfg=this.cfg.extend(d)},compute:function(d,r){for(var p=this.cfg,s=p.hasher.create(),b=l.create(),u=b.words,q=p.keySize,p=p.iterations;u.length<q;){n&&s.update(n);var n=s.update(d).finalize(r);s.reset();for(var a=1;a<p;a++)n=s.finalize(n),s.reset();b.concat(n)}b.sigBytes=4*q;return b}});u.EvpKDF=function(d,l,p){return s.create(p).compute(d,\nl)}})();\nCryptoJS.lib.Cipher||function(u){var p=CryptoJS,d=p.lib,l=d.Base,s=d.WordArray,t=d.BufferedBlockAlgorithm,r=p.enc.Base64,w=p.algo.EvpKDF,v=d.Cipher=t.extend({cfg:l.extend(),createEncryptor:function(e,a){return this.create(this._ENC_XFORM_MODE,e,a)},createDecryptor:function(e,a){return this.create(this._DEC_XFORM_MODE,e,a)},init:function(e,a,b){this.cfg=this.cfg.extend(b);this._xformMode=e;this._key=a;this.reset()},reset:function(){t.reset.call(this);this._doReset()},process:function(e){this._append(e);return this._process()},\nfinalize:function(e){e&&this._append(e);return this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(e){return{encrypt:function(b,k,d){return(\"string\"==typeof k?c:a).encrypt(e,b,k,d)},decrypt:function(b,k,d){return(\"string\"==typeof k?c:a).decrypt(e,b,k,d)}}}});d.StreamCipher=v.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var b=p.mode={},x=function(e,a,b){var c=this._iv;c?this._iv=u:c=this._prevBlock;for(var d=0;d<b;d++)e[a+d]^=\nc[d]},q=(d.BlockCipherMode=l.extend({createEncryptor:function(e,a){return this.Encryptor.create(e,a)},createDecryptor:function(e,a){return this.Decryptor.create(e,a)},init:function(e,a){this._cipher=e;this._iv=a}})).extend();q.Encryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize;x.call(this,e,a,c);b.encryptBlock(e,a);this._prevBlock=e.slice(a,a+c)}});q.Decryptor=q.extend({processBlock:function(e,a){var b=this._cipher,c=b.blockSize,d=e.slice(a,a+c);b.decryptBlock(e,a);x.call(this,\ne,a,c);this._prevBlock=d}});b=b.CBC=q;q=(p.pad={}).Pkcs7={pad:function(a,b){for(var c=4*b,c=c-a.sigBytes%c,d=c<<24|c<<16|c<<8|c,l=[],n=0;n<c;n+=4)l.push(d);c=s.create(l,c);a.concat(c)},unpad:function(a){a.sigBytes-=a.words[a.sigBytes-1>>>2]&255}};d.BlockCipher=v.extend({cfg:v.cfg.extend({mode:b,padding:q}),reset:function(){v.reset.call(this);var a=this.cfg,b=a.iv,a=a.mode;if(this._xformMode==this._ENC_XFORM_MODE)var c=a.createEncryptor;else c=a.createDecryptor,this._minBufferSize=1;this._mode=c.call(a,\nthis,b&&b.words)},_doProcessBlock:function(a,b){this._mode.processBlock(a,b)},_doFinalize:function(){var a=this.cfg.padding;if(this._xformMode==this._ENC_XFORM_MODE){a.pad(this._data,this.blockSize);var b=this._process(!0)}else b=this._process(!0),a.unpad(b);return b},blockSize:4});var n=d.CipherParams=l.extend({init:function(a){this.mixIn(a)},toString:function(a){return(a||this.formatter).stringify(this)}}),b=(p.format={}).OpenSSL={stringify:function(a){var b=a.ciphertext;a=a.salt;return(a?s.create([1398893684,\n1701076831]).concat(a).concat(b):b).toString(r)},parse:function(a){a=r.parse(a);var b=a.words;if(1398893684==b[0]&&1701076831==b[1]){var c=s.create(b.slice(2,4));b.splice(0,4);a.sigBytes-=16}return n.create({ciphertext:a,salt:c})}},a=d.SerializableCipher=l.extend({cfg:l.extend({format:b}),encrypt:function(a,b,c,d){d=this.cfg.extend(d);var l=a.createEncryptor(c,d);b=l.finalize(b);l=l.cfg;return n.create({ciphertext:b,key:c,iv:l.iv,algorithm:a,mode:l.mode,padding:l.padding,blockSize:a.blockSize,formatter:d.format})},\ndecrypt:function(a,b,c,d){d=this.cfg.extend(d);b=this._parse(b,d.format);return a.createDecryptor(c,d).finalize(b.ciphertext)},_parse:function(a,b){return\"string\"==typeof a?b.parse(a,this):a}}),p=(p.kdf={}).OpenSSL={execute:function(a,b,c,d){d||(d=s.random(8));a=w.create({keySize:b+c}).compute(a,d);c=s.create(a.words.slice(b),4*c);a.sigBytes=4*b;return n.create({key:a,iv:c,salt:d})}},c=d.PasswordBasedCipher=a.extend({cfg:a.cfg.extend({kdf:p}),encrypt:function(b,c,d,l){l=this.cfg.extend(l);d=l.kdf.execute(d,\nb.keySize,b.ivSize);l.iv=d.iv;b=a.encrypt.call(this,b,c,d.key,l);b.mixIn(d);return b},decrypt:function(b,c,d,l){l=this.cfg.extend(l);c=this._parse(c,l.format);d=l.kdf.execute(d,b.keySize,b.ivSize,c.salt);l.iv=d.iv;return a.decrypt.call(this,b,c,d.key,l)}})}();\n(function(){for(var u=CryptoJS,p=u.lib.BlockCipher,d=u.algo,l=[],s=[],t=[],r=[],w=[],v=[],b=[],x=[],q=[],n=[],a=[],c=0;256>c;c++)a[c]=128>c?c<<1:c<<1^283;for(var e=0,j=0,c=0;256>c;c++){var k=j^j<<1^j<<2^j<<3^j<<4,k=k>>>8^k&255^99;l[e]=k;s[k]=e;var z=a[e],F=a[z],G=a[F],y=257*a[k]^16843008*k;t[e]=y<<24|y>>>8;r[e]=y<<16|y>>>16;w[e]=y<<8|y>>>24;v[e]=y;y=16843009*G^65537*F^257*z^16843008*e;b[k]=y<<24|y>>>8;x[k]=y<<16|y>>>16;q[k]=y<<8|y>>>24;n[k]=y;e?(e=z^a[a[a[G^z]]],j^=a[a[j]]):e=j=1}var H=[0,1,2,4,8,\n16,32,64,128,27,54],d=d.AES=p.extend({_doReset:function(){for(var a=this._key,c=a.words,d=a.sigBytes/4,a=4*((this._nRounds=d+6)+1),e=this._keySchedule=[],j=0;j<a;j++)if(j<d)e[j]=c[j];else{var k=e[j-1];j%d?6<d&&4==j%d&&(k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255]):(k=k<<8|k>>>24,k=l[k>>>24]<<24|l[k>>>16&255]<<16|l[k>>>8&255]<<8|l[k&255],k^=H[j/d|0]<<24);e[j]=e[j-d]^k}c=this._invKeySchedule=[];for(d=0;d<a;d++)j=a-d,k=d%4?e[j]:e[j-4],c[d]=4>d||4>=j?k:b[l[k>>>24]]^x[l[k>>>16&255]]^q[l[k>>>\n8&255]]^n[l[k&255]]},encryptBlock:function(a,b){this._doCryptBlock(a,b,this._keySchedule,t,r,w,v,l)},decryptBlock:function(a,c){var d=a[c+1];a[c+1]=a[c+3];a[c+3]=d;this._doCryptBlock(a,c,this._invKeySchedule,b,x,q,n,s);d=a[c+1];a[c+1]=a[c+3];a[c+3]=d},_doCryptBlock:function(a,b,c,d,e,j,l,f){for(var m=this._nRounds,g=a[b]^c[0],h=a[b+1]^c[1],k=a[b+2]^c[2],n=a[b+3]^c[3],p=4,r=1;r<m;r++)var q=d[g>>>24]^e[h>>>16&255]^j[k>>>8&255]^l[n&255]^c[p++],s=d[h>>>24]^e[k>>>16&255]^j[n>>>8&255]^l[g&255]^c[p++],t=\nd[k>>>24]^e[n>>>16&255]^j[g>>>8&255]^l[h&255]^c[p++],n=d[n>>>24]^e[g>>>16&255]^j[h>>>8&255]^l[k&255]^c[p++],g=q,h=s,k=t;q=(f[g>>>24]<<24|f[h>>>16&255]<<16|f[k>>>8&255]<<8|f[n&255])^c[p++];s=(f[h>>>24]<<24|f[k>>>16&255]<<16|f[n>>>8&255]<<8|f[g&255])^c[p++];t=(f[k>>>24]<<24|f[n>>>16&255]<<16|f[g>>>8&255]<<8|f[h&255])^c[p++];n=(f[n>>>24]<<24|f[g>>>16&255]<<16|f[h>>>8&255]<<8|f[k&255])^c[p++];a[b]=q;a[b+1]=s;a[b+2]=t;a[b+3]=n},keySize:8});u.AES=p._createHelper(d)})();"; /***/}, /* 7 */ /***/function(module,exports,__webpack_require__){__webpack_require__(3)(__webpack_require__(8)); /***/}, /* 8 */ /***/function(module,exports){module.exports="/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */(function() {'use strict';function q(b){throw b;}var t=void 0,u=!0,aa=this;function A(b,a){var c=b.split(\".\"),d=aa;!(c[0]in d)&&d.execScript&&d.execScript(\"var \"+c[0]);for(var e;c.length&&(e=c.shift());)!c.length&&a!==t?d[e]=a:d=d[e]?d[e]:d[e]={}};var B=\"undefined\"!==typeof Uint8Array&&\"undefined\"!==typeof Uint16Array&&\"undefined\"!==typeof Uint32Array&&\"undefined\"!==typeof DataView;function F(b,a){this.index=\"number\"===typeof a?a:0;this.m=0;this.buffer=b instanceof(B?Uint8Array:Array)?b:new (B?Uint8Array:Array)(32768);2*this.buffer.length<=this.index&&q(Error(\"invalid index\"));this.buffer.length<=this.index&&this.f()}F.prototype.f=function(){var b=this.buffer,a,c=b.length,d=new (B?Uint8Array:Array)(c<<1);if(B)d.set(b);else for(a=0;a<c;++a)d[a]=b[a];return this.buffer=d};\nF.prototype.d=function(b,a,c){var d=this.buffer,e=this.index,f=this.m,g=d[e],k;c&&1<a&&(b=8<a?(H[b&255]<<24|H[b>>>8&255]<<16|H[b>>>16&255]<<8|H[b>>>24&255])>>32-a:H[b]>>8-a);if(8>a+f)g=g<<a|b,f+=a;else for(k=0;k<a;++k)g=g<<1|b>>a-k-1&1,8===++f&&(f=0,d[e++]=H[g],g=0,e===d.length&&(d=this.f()));d[e]=g;this.buffer=d;this.m=f;this.index=e};F.prototype.finish=function(){var b=this.buffer,a=this.index,c;0<this.m&&(b[a]<<=8-this.m,b[a]=H[b[a]],a++);B?c=b.subarray(0,a):(b.length=a,c=b);return c};\nvar ba=new (B?Uint8Array:Array)(256),ca;for(ca=0;256>ca;++ca){for(var K=ca,da=K,ea=7,K=K>>>1;K;K>>>=1)da<<=1,da|=K&1,--ea;ba[ca]=(da<<ea&255)>>>0}var H=ba;function ja(b,a,c){var d,e=\"number\"===typeof a?a:a=0,f=\"number\"===typeof c?c:b.length;d=-1;for(e=f&7;e--;++a)d=d>>>8^O[(d^b[a])&255];for(e=f>>3;e--;a+=8)d=d>>>8^O[(d^b[a])&255],d=d>>>8^O[(d^b[a+1])&255],d=d>>>8^O[(d^b[a+2])&255],d=d>>>8^O[(d^b[a+3])&255],d=d>>>8^O[(d^b[a+4])&255],d=d>>>8^O[(d^b[a+5])&255],d=d>>>8^O[(d^b[a+6])&255],d=d>>>8^O[(d^b[a+7])&255];return(d^4294967295)>>>0}\nvar ka=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,\n2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,\n2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,\n2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,\n3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,\n936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117],O=B?new Uint32Array(ka):ka;function P(){}P.prototype.getName=function(){return this.name};P.prototype.getData=function(){return this.data};P.prototype.Y=function(){return this.Z};A(\"Zlib.GunzipMember\",P);A(\"Zlib.GunzipMember.prototype.getName\",P.prototype.getName);A(\"Zlib.GunzipMember.prototype.getData\",P.prototype.getData);A(\"Zlib.GunzipMember.prototype.getMtime\",P.prototype.Y);function la(b){this.buffer=new (B?Uint16Array:Array)(2*b);this.length=0}la.prototype.getParent=function(b){return 2*((b-2)/4|0)};la.prototype.push=function(b,a){var c,d,e=this.buffer,f;c=this.length;e[this.length++]=a;for(e[this.length++]=b;0<c;)if(d=this.getParent(c),e[c]>e[d])f=e[c],e[c]=e[d],e[d]=f,f=e[c+1],e[c+1]=e[d+1],e[d+1]=f,c=d;else break;return this.length};\nla.prototype.pop=function(){var b,a,c=this.buffer,d,e,f;a=c[0];b=c[1];this.length-=2;c[0]=c[this.length];c[1]=c[this.length+1];for(f=0;;){e=2*f+2;if(e>=this.length)break;e+2<this.length&&c[e+2]>c[e]&&(e+=2);if(c[e]>c[f])d=c[f],c[f]=c[e],c[e]=d,d=c[f+1],c[f+1]=c[e+1],c[e+1]=d;else break;f=e}return{index:b,value:a,length:this.length}};function ma(b){var a=b.length,c=0,d=Number.POSITIVE_INFINITY,e,f,g,k,h,l,s,p,m,n;for(p=0;p<a;++p)b[p]>c&&(c=b[p]),b[p]<d&&(d=b[p]);e=1<<c;f=new (B?Uint32Array:Array)(e);g=1;k=0;for(h=2;g<=c;){for(p=0;p<a;++p)if(b[p]===g){l=0;s=k;for(m=0;m<g;++m)l=l<<1|s&1,s>>=1;n=g<<16|p;for(m=l;m<e;m+=h)f[m]=n;++k}++g;k<<=1;h<<=1}return[f,c,d]};function na(b,a){this.k=qa;this.I=0;this.input=B&&b instanceof Array?new Uint8Array(b):b;this.b=0;a&&(a.lazy&&(this.I=a.lazy),\"number\"===typeof a.compressionType&&(this.k=a.compressionType),a.outputBuffer&&(this.a=B&&a.outputBuffer instanceof Array?new Uint8Array(a.outputBuffer):a.outputBuffer),\"number\"===typeof a.outputIndex&&(this.b=a.outputIndex));this.a||(this.a=new (B?Uint8Array:Array)(32768))}var qa=2,ra={NONE:0,v:1,o:qa,ba:3},sa=[],S;\nfor(S=0;288>S;S++)switch(u){case 143>=S:sa.push([S+48,8]);break;case 255>=S:sa.push([S-144+400,9]);break;case 279>=S:sa.push([S-256+0,7]);break;case 287>=S:sa.push([S-280+192,8]);break;default:q(\"invalid literal: \"+S)}\nna.prototype.g=function(){var b,a,c,d,e=this.input;switch(this.k){case 0:c=0;for(d=e.length;c<d;){a=B?e.subarray(c,c+65535):e.slice(c,c+65535);c+=a.length;var f=a,g=c===d,k=t,h=t,l=t,s=t,p=t,m=this.a,n=this.b;if(B){for(m=new Uint8Array(this.a.buffer);m.length<=n+f.length+5;)m=new Uint8Array(m.length<<1);m.set(this.a)}k=g?1:0;m[n++]=k|0;h=f.length;l=~h+65536&65535;m[n++]=h&255;m[n++]=h>>>8&255;m[n++]=l&255;m[n++]=l>>>8&255;if(B)m.set(f,n),n+=f.length,m=m.subarray(0,n);else{s=0;for(p=f.length;s<p;++s)m[n++]=\nf[s];m.length=n}this.b=n;this.a=m}break;case 1:var r=new F(B?new Uint8Array(this.a.buffer):this.a,this.b);r.d(1,1,u);r.d(1,2,u);var v=ta(this,e),x,Q,y;x=0;for(Q=v.length;x<Q;x++)if(y=v[x],F.prototype.d.apply(r,sa[y]),256<y)r.d(v[++x],v[++x],u),r.d(v[++x],5),r.d(v[++x],v[++x],u);else if(256===y)break;this.a=r.finish();this.b=this.a.length;break;case qa:var E=new F(B?new Uint8Array(this.a.buffer):this.a,this.b),Ka,R,X,Y,Z,pb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],fa,La,ga,Ma,oa,wa=Array(19),\nNa,$,pa,C,Oa;Ka=qa;E.d(1,1,u);E.d(Ka,2,u);R=ta(this,e);fa=ua(this.W,15);La=va(fa);ga=ua(this.V,7);Ma=va(ga);for(X=286;257<X&&0===fa[X-1];X--);for(Y=30;1<Y&&0===ga[Y-1];Y--);var Pa=X,Qa=Y,J=new (B?Uint32Array:Array)(Pa+Qa),w,L,z,ha,I=new (B?Uint32Array:Array)(316),G,D,M=new (B?Uint8Array:Array)(19);for(w=L=0;w<Pa;w++)J[L++]=fa[w];for(w=0;w<Qa;w++)J[L++]=ga[w];if(!B){w=0;for(ha=M.length;w<ha;++w)M[w]=0}w=G=0;for(ha=J.length;w<ha;w+=L){for(L=1;w+L<ha&&J[w+L]===J[w];++L);z=L;if(0===J[w])if(3>z)for(;0<\nz--;)I[G++]=0,M[0]++;else for(;0<z;)D=138>z?z:138,D>z-3&&D<z&&(D=z-3),10>=D?(I[G++]=17,I[G++]=D-3,M[17]++):(I[G++]=18,I[G++]=D-11,M[18]++),z-=D;else if(I[G++]=J[w],M[J[w]]++,z--,3>z)for(;0<z--;)I[G++]=J[w],M[J[w]]++;else for(;0<z;)D=6>z?z:6,D>z-3&&D<z&&(D=z-3),I[G++]=16,I[G++]=D-3,M[16]++,z-=D}b=B?I.subarray(0,G):I.slice(0,G);oa=ua(M,7);for(C=0;19>C;C++)wa[C]=oa[pb[C]];for(Z=19;4<Z&&0===wa[Z-1];Z--);Na=va(oa);E.d(X-257,5,u);E.d(Y-1,5,u);E.d(Z-4,4,u);for(C=0;C<Z;C++)E.d(wa[C],3,u);C=0;for(Oa=b.length;C<\nOa;C++)if($=b[C],E.d(Na[$],oa[$],u),16<=$){C++;switch($){case 16:pa=2;break;case 17:pa=3;break;case 18:pa=7;break;default:q(\"invalid code: \"+$)}E.d(b[C],pa,u)}var Ra=[La,fa],Sa=[Ma,ga],N,Ta,ia,za,Ua,Va,Wa,Xa;Ua=Ra[0];Va=Ra[1];Wa=Sa[0];Xa=Sa[1];N=0;for(Ta=R.length;N<Ta;++N)if(ia=R[N],E.d(Ua[ia],Va[ia],u),256<ia)E.d(R[++N],R[++N],u),za=R[++N],E.d(Wa[za],Xa[za],u),E.d(R[++N],R[++N],u);else if(256===ia)break;this.a=E.finish();this.b=this.a.length;break;default:q(\"invalid compression type\")}return this.a};\nfunction xa(b,a){this.length=b;this.Q=a}\nvar ya=function(){function b(a){switch(u){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,\na-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:q(\"invalid length: \"+a)}}var a=[],c,d;for(c=3;258>=c;c++)d=b(c),a[c]=d[2]<<24|d[1]<<\n16|d[0];return a}(),Aa=B?new Uint32Array(ya):ya;\nfunction ta(b,a){function c(a,c){var b=a.Q,d=[],e=0,f;f=Aa[a.length];d[e++]=f&65535;d[e++]=f>>16&255;d[e++]=f>>24;var g;switch(u){case 1===b:g=[0,b-1,0];break;case 2===b:g=[1,b-2,0];break;case 3===b:g=[2,b-3,0];break;case 4===b:g=[3,b-4,0];break;case 6>=b:g=[4,b-5,1];break;case 8>=b:g=[5,b-7,1];break;case 12>=b:g=[6,b-9,2];break;case 16>=b:g=[7,b-13,2];break;case 24>=b:g=[8,b-17,3];break;case 32>=b:g=[9,b-25,3];break;case 48>=b:g=[10,b-33,4];break;case 64>=b:g=[11,b-49,4];break;case 96>=b:g=[12,b-\n65,5];break;case 128>=b:g=[13,b-97,5];break;case 192>=b:g=[14,b-129,6];break;case 256>=b:g=[15,b-193,6];break;case 384>=b:g=[16,b-257,7];break;case 512>=b:g=[17,b-385,7];break;case 768>=b:g=[18,b-513,8];break;case 1024>=b:g=[19,b-769,8];break;case 1536>=b:g=[20,b-1025,9];break;case 2048>=b:g=[21,b-1537,9];break;case 3072>=b:g=[22,b-2049,10];break;case 4096>=b:g=[23,b-3073,10];break;case 6144>=b:g=[24,b-4097,11];break;case 8192>=b:g=[25,b-6145,11];break;case 12288>=b:g=[26,b-8193,12];break;case 16384>=\nb:g=[27,b-12289,12];break;case 24576>=b:g=[28,b-16385,13];break;case 32768>=b:g=[29,b-24577,13];break;default:q(\"invalid distance\")}f=g;d[e++]=f[0];d[e++]=f[1];d[e++]=f[2];var h,k;h=0;for(k=d.length;h<k;++h)m[n++]=d[h];v[d[0]]++;x[d[3]]++;r=a.length+c-1;p=null}var d,e,f,g,k,h={},l,s,p,m=B?new Uint16Array(2*a.length):[],n=0,r=0,v=new (B?Uint32Array:Array)(286),x=new (B?Uint32Array:Array)(30),Q=b.I,y;if(!B){for(f=0;285>=f;)v[f++]=0;for(f=0;29>=f;)x[f++]=0}v[256]=1;d=0;for(e=a.length;d<e;++d){f=k=0;\nfor(g=3;f<g&&d+f!==e;++f)k=k<<8|a[d+f];h[k]===t&&(h[k]=[]);l=h[k];if(!(0<r--)){for(;0<l.length&&32768<d-l[0];)l.shift();if(d+3>=e){p&&c(p,-1);f=0;for(g=e-d;f<g;++f)y=a[d+f],m[n++]=y,++v[y];break}0<l.length?(s=Ba(a,d,l),p?p.length<s.length?(y=a[d-1],m[n++]=y,++v[y],c(s,0)):c(p,-1):s.length<Q?p=s:c(s,0)):p?c(p,-1):(y=a[d],m[n++]=y,++v[y])}l.push(d)}m[n++]=256;v[256]++;b.W=v;b.V=x;return B?m.subarray(0,n):m}\nfunction Ba(b,a,c){var d,e,f=0,g,k,h,l,s=b.length;k=0;l=c.length;a:for(;k<l;k++){d=c[l-k-1];g=3;if(3<f){for(h=f;3<h;h--)if(b[d+h-1]!==b[a+h-1])continue a;g=f}for(;258>g&&a+g<s&&b[d+g]===b[a+g];)++g;g>f&&(e=d,f=g);if(258===g)break}return new xa(f,a-e)}\nfunction ua(b,a){var c=b.length,d=new la(572),e=new (B?Uint8Array:Array)(c),f,g,k,h,l;if(!B)for(h=0;h<c;h++)e[h]=0;for(h=0;h<c;++h)0<b[h]&&d.push(h,b[h]);f=Array(d.length/2);g=new (B?Uint32Array:Array)(d.length/2);if(1===f.length)return e[d.pop().index]=1,e;h=0;for(l=d.length/2;h<l;++h)f[h]=d.pop(),g[h]=f[h].value;k=Ca(g,g.length,a);h=0;for(l=f.length;h<l;++h)e[f[h].index]=k[h];return e}\nfunction Ca(b,a,c){function d(b){var c=h[b][l[b]];c===a?(d(b+1),d(b+1)):--g[c];++l[b]}var e=new (B?Uint16Array:Array)(c),f=new (B?Uint8Array:Array)(c),g=new (B?Uint8Array:Array)(a),k=Array(c),h=Array(c),l=Array(c),s=(1<<c)-a,p=1<<c-1,m,n,r,v,x;e[c-1]=a;for(n=0;n<c;++n)s<p?f[n]=0:(f[n]=1,s-=p),s<<=1,e[c-2-n]=(e[c-1-n]/2|0)+a;e[0]=f[0];k[0]=Array(e[0]);h[0]=Array(e[0]);for(n=1;n<c;++n)e[n]>2*e[n-1]+f[n]&&(e[n]=2*e[n-1]+f[n]),k[n]=Array(e[n]),h[n]=Array(e[n]);for(m=0;m<a;++m)g[m]=c;for(r=0;r<e[c-1];++r)k[c-\n1][r]=b[r],h[c-1][r]=r;for(m=0;m<c;++m)l[m]=0;1===f[c-1]&&(--g[0],++l[c-1]);for(n=c-2;0<=n;--n){v=m=0;x=l[n+1];for(r=0;r<e[n];r++)v=k[n+1][x]+k[n+1][x+1],v>b[m]?(k[n][r]=v,h[n][r]=a,x+=2):(k[n][r]=b[m],h[n][r]=m,++m);l[n]=0;1===f[n]&&d(n)}return g}\nfunction va(b){var a=new (B?Uint16Array:Array)(b.length),c=[],d=[],e=0,f,g,k,h;f=0;for(g=b.length;f<g;f++)c[b[f]]=(c[b[f]]|0)+1;f=1;for(g=16;f<=g;f++)d[f]=e,e+=c[f]|0,e<<=1;f=0;for(g=b.length;f<g;f++){e=d[b[f]];d[b[f]]+=1;k=a[f]=0;for(h=b[f];k<h;k++)a[f]=a[f]<<1|e&1,e>>>=1}return a};function Da(b,a){this.input=b;this.b=this.c=0;this.i={};a&&(a.flags&&(this.i=a.flags),\"string\"===typeof a.filename&&(this.filename=a.filename),\"string\"===typeof a.comment&&(this.A=a.comment),a.deflateOptions&&(this.l=a.deflateOptions));this.l||(this.l={})}\nDa.prototype.g=function(){var b,a,c,d,e,f,g,k,h=new (B?Uint8Array:Array)(32768),l=0,s=this.input,p=this.c,m=this.filename,n=this.A;h[l++]=31;h[l++]=139;h[l++]=8;b=0;this.i.fname&&(b|=Ea);this.i.fcomment&&(b|=Fa);this.i.fhcrc&&(b|=Ga);h[l++]=b;a=(Date.now?Date.now():+new Date)/1E3|0;h[l++]=a&255;h[l++]=a>>>8&255;h[l++]=a>>>16&255;h[l++]=a>>>24&255;h[l++]=0;h[l++]=Ha;if(this.i.fname!==t){g=0;for(k=m.length;g<k;++g)f=m.charCodeAt(g),255<f&&(h[l++]=f>>>8&255),h[l++]=f&255;h[l++]=0}if(this.i.comment){g=\n0;for(k=n.length;g<k;++g)f=n.charCodeAt(g),255<f&&(h[l++]=f>>>8&255),h[l++]=f&255;h[l++]=0}this.i.fhcrc&&(c=ja(h,0,l)&65535,h[l++]=c&255,h[l++]=c>>>8&255);this.l.outputBuffer=h;this.l.outputIndex=l;e=new na(s,this.l);h=e.g();l=e.b;B&&(l+8>h.buffer.byteLength?(this.a=new Uint8Array(l+8),this.a.set(new Uint8Array(h.buffer)),h=this.a):h=new Uint8Array(h.buffer));d=ja(s,t,t);h[l++]=d&255;h[l++]=d>>>8&255;h[l++]=d>>>16&255;h[l++]=d>>>24&255;k=s.length;h[l++]=k&255;h[l++]=k>>>8&255;h[l++]=k>>>16&255;h[l++]=\nk>>>24&255;this.c=p;B&&l<h.length&&(this.a=h=h.subarray(0,l));return h};var Ha=255,Ga=2,Ea=8,Fa=16;A(\"Zlib.Gzip\",Da);A(\"Zlib.Gzip.prototype.compress\",Da.prototype.g);function T(b,a){this.p=[];this.q=32768;this.e=this.j=this.c=this.u=0;this.input=B?new Uint8Array(b):b;this.w=!1;this.r=Ia;this.M=!1;if(a||!(a={}))a.index&&(this.c=a.index),a.bufferSize&&(this.q=a.bufferSize),a.bufferType&&(this.r=a.bufferType),a.resize&&(this.M=a.resize);switch(this.r){case Ja:this.b=32768;this.a=new (B?Uint8Array:Array)(32768+this.q+258);break;case Ia:this.b=0;this.a=new (B?Uint8Array:Array)(this.q);this.f=this.U;this.B=this.R;this.s=this.T;break;default:q(Error(\"invalid inflate mode\"))}}\nvar Ja=0,Ia=1,Ya={O:Ja,N:Ia};\nT.prototype.h=function(){for(;!this.w;){var b=U(this,3);b&1&&(this.w=u);b>>>=1;switch(b){case 0:var a=this.input,c=this.c,d=this.a,e=this.b,f=a.length,g=t,k=t,h=d.length,l=t;this.e=this.j=0;c+1>=f&&q(Error(\"invalid uncompressed block header: LEN\"));g=a[c++]|a[c++]<<8;c+1>=f&&q(Error(\"invalid uncompressed block header: NLEN\"));k=a[c++]|a[c++]<<8;g===~k&&q(Error(\"invalid uncompressed block header: length verify\"));c+g>a.length&&q(Error(\"input buffer is broken\"));switch(this.r){case Ja:for(;e+g>d.length;){l=\nh-e;g-=l;if(B)d.set(a.subarray(c,c+l),e),e+=l,c+=l;else for(;l--;)d[e++]=a[c++];this.b=e;d=this.f();e=this.b}break;case Ia:for(;e+g>d.length;)d=this.f({F:2});break;default:q(Error(\"invalid inflate mode\"))}if(B)d.set(a.subarray(c,c+g),e),e+=g,c+=g;else for(;g--;)d[e++]=a[c++];this.c=c;this.b=e;this.a=d;break;case 1:this.s(Za,$a);break;case 2:ab(this);break;default:q(Error(\"unknown BTYPE: \"+b))}}return this.B()};\nvar bb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],cb=B?new Uint16Array(bb):bb,db=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],eb=B?new Uint16Array(db):db,fb=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],gb=B?new Uint8Array(fb):fb,hb=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],ib=B?new Uint16Array(hb):hb,jb=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,\n10,11,11,12,12,13,13],kb=B?new Uint8Array(jb):jb,lb=new (B?Uint8Array:Array)(288),V,mb;V=0;for(mb=lb.length;V<mb;++V)lb[V]=143>=V?8:255>=V?9:279>=V?7:8;var Za=ma(lb),nb=new (B?Uint8Array:Array)(30),ob,qb;ob=0;for(qb=nb.length;ob<qb;++ob)nb[ob]=5;var $a=ma(nb);function U(b,a){for(var c=b.j,d=b.e,e=b.input,f=b.c,g=e.length,k;d<a;)f>=g&&q(Error(\"input buffer is broken\")),c|=e[f++]<<d,d+=8;k=c&(1<<a)-1;b.j=c>>>a;b.e=d-a;b.c=f;return k}\nfunction rb(b,a){for(var c=b.j,d=b.e,e=b.input,f=b.c,g=e.length,k=a[0],h=a[1],l,s;d<h&&!(f>=g);)c|=e[f++]<<d,d+=8;l=k[c&(1<<h)-1];s=l>>>16;b.j=c>>s;b.e=d-s;b.c=f;return l&65535}\nfunction ab(b){function a(a,b,c){var d,e=this.J,f,g;for(g=0;g<a;)switch(d=rb(this,b),d){case 16:for(f=3+U(this,2);f--;)c[g++]=e;break;case 17:for(f=3+U(this,3);f--;)c[g++]=0;e=0;break;case 18:for(f=11+U(this,7);f--;)c[g++]=0;e=0;break;default:e=c[g++]=d}this.J=e;return c}var c=U(b,5)+257,d=U(b,5)+1,e=U(b,4)+4,f=new (B?Uint8Array:Array)(cb.length),g,k,h,l;for(l=0;l<e;++l)f[cb[l]]=U(b,3);if(!B){l=e;for(e=f.length;l<e;++l)f[cb[l]]=0}g=ma(f);k=new (B?Uint8Array:Array)(c);h=new (B?Uint8Array:Array)(d);\nb.J=0;b.s(ma(a.call(b,c,g,k)),ma(a.call(b,d,g,h)))}T.prototype.s=function(b,a){var c=this.a,d=this.b;this.C=b;for(var e=c.length-258,f,g,k,h;256!==(f=rb(this,b));)if(256>f)d>=e&&(this.b=d,c=this.f(),d=this.b),c[d++]=f;else{g=f-257;h=eb[g];0<gb[g]&&(h+=U(this,gb[g]));f=rb(this,a);k=ib[f];0<kb[f]&&(k+=U(this,kb[f]));d>=e&&(this.b=d,c=this.f(),d=this.b);for(;h--;)c[d]=c[d++-k]}for(;8<=this.e;)this.e-=8,this.c--;this.b=d};\nT.prototype.T=function(b,a){var c=this.a,d=this.b;this.C=b;for(var e=c.length,f,g,k,h;256!==(f=rb(this,b));)if(256>f)d>=e&&(c=this.f(),e=c.length),c[d++]=f;else{g=f-257;h=eb[g];0<gb[g]&&(h+=U(this,gb[g]));f=rb(this,a);k=ib[f];0<kb[f]&&(k+=U(this,kb[f]));d+h>e&&(c=this.f(),e=c.length);for(;h--;)c[d]=c[d++-k]}for(;8<=this.e;)this.e-=8,this.c--;this.b=d};\nT.prototype.f=function(){var b=new (B?Uint8Array:Array)(this.b-32768),a=this.b-32768,c,d,e=this.a;if(B)b.set(e.subarray(32768,b.length));else{c=0;for(d=b.length;c<d;++c)b[c]=e[c+32768]}this.p.push(b);this.u+=b.length;if(B)e.set(e.subarray(a,a+32768));else for(c=0;32768>c;++c)e[c]=e[a+c];this.b=32768;return e};\nT.prototype.U=function(b){var a,c=this.input.length/this.c+1|0,d,e,f,g=this.input,k=this.a;b&&(\"number\"===typeof b.F&&(c=b.F),\"number\"===typeof b.P&&(c+=b.P));2>c?(d=(g.length-this.c)/this.C[2],f=258*(d/2)|0,e=f<k.length?k.length+f:k.length<<1):e=k.length*c;B?(a=new Uint8Array(e),a.set(k)):a=k;return this.a=a};\nT.prototype.B=function(){var b=0,a=this.a,c=this.p,d,e=new (B?Uint8Array:Array)(this.u+(this.b-32768)),f,g,k,h;if(0===c.length)return B?this.a.subarray(32768,this.b):this.a.slice(32768,this.b);f=0;for(g=c.length;f<g;++f){d=c[f];k=0;for(h=d.length;k<h;++k)e[b++]=d[k]}f=32768;for(g=this.b;f<g;++f)e[b++]=a[f];this.p=[];return this.buffer=e};\nT.prototype.R=function(){var b,a=this.b;B?this.M?(b=new Uint8Array(a),b.set(this.a.subarray(0,a))):b=this.a.subarray(0,a):(this.a.length>a&&(this.a.length=a),b=this.a);return this.buffer=b};function sb(b){this.input=b;this.c=0;this.t=[];this.D=!1}sb.prototype.X=function(){this.D||this.h();return this.t.slice()};\nsb.prototype.h=function(){for(var b=this.input.length;this.c<b;){var a=new P,c=t,d=t,e=t,f=t,g=t,k=t,h=t,l=t,s=t,p=this.input,m=this.c;a.G=p[m++];a.H=p[m++];(31!==a.G||139!==a.H)&&q(Error(\"invalid file signature:\"+a.G+\",\"+a.H));a.z=p[m++];switch(a.z){case 8:break;default:q(Error(\"unknown compression method: \"+a.z))}a.n=p[m++];l=p[m++]|p[m++]<<8|p[m++]<<16|p[m++]<<24;a.Z=new Date(1E3*l);a.fa=p[m++];a.ea=p[m++];0<(a.n&4)&&(a.aa=p[m++]|p[m++]<<8,m+=a.aa);if(0<(a.n&Ea)){h=[];for(k=0;0<(g=p[m++]);)h[k++]=\nString.fromCharCode(g);a.name=h.join(\"\")}if(0<(a.n&Fa)){h=[];for(k=0;0<(g=p[m++]);)h[k++]=String.fromCharCode(g);a.A=h.join(\"\")}0<(a.n&Ga)&&(a.S=ja(p,0,m)&65535,a.S!==(p[m++]|p[m++]<<8)&&q(Error(\"invalid header crc16\")));c=p[p.length-4]|p[p.length-3]<<8|p[p.length-2]<<16|p[p.length-1]<<24;p.length-m-4-4<512*c&&(f=c);d=new T(p,{index:m,bufferSize:f});a.data=e=d.h();m=d.c;a.ca=s=(p[m++]|p[m++]<<8|p[m++]<<16|p[m++]<<24)>>>0;ja(e,t,t)!==s&&q(Error(\"invalid CRC-32 checksum: 0x\"+ja(e,t,t).toString(16)+\n\" / 0x\"+s.toString(16)));a.da=c=(p[m++]|p[m++]<<8|p[m++]<<16|p[m++]<<24)>>>0;(e.length&4294967295)!==c&&q(Error(\"invalid input size: \"+(e.length&4294967295)+\" / \"+c));this.t.push(a);this.c=m}this.D=u;var n=this.t,r,v,x=0,Q=0,y;r=0;for(v=n.length;r<v;++r)Q+=n[r].data.length;if(B){y=new Uint8Array(Q);for(r=0;r<v;++r)y.set(n[r].data,x),x+=n[r].data.length}else{y=[];for(r=0;r<v;++r)y[r]=n[r].data;y=Array.prototype.concat.apply([],y)}return y};A(\"Zlib.Gunzip\",sb);A(\"Zlib.Gunzip.prototype.decompress\",sb.prototype.h);A(\"Zlib.Gunzip.prototype.getMembers\",sb.prototype.X);function tb(b){if(\"string\"===typeof b){var a=b.split(\"\"),c,d;c=0;for(d=a.length;c<d;c++)a[c]=(a[c].charCodeAt(0)&255)>>>0;b=a}for(var e=1,f=0,g=b.length,k,h=0;0<g;){k=1024<g?1024:g;g-=k;do e+=b[h++],f+=e;while(--k);e%=65521;f%=65521}return(f<<16|e)>>>0};function ub(b,a){var c,d;this.input=b;this.c=0;if(a||!(a={}))a.index&&(this.c=a.index),a.verify&&(this.$=a.verify);c=b[this.c++];d=b[this.c++];switch(c&15){case vb:this.method=vb;break;default:q(Error(\"unsupported compression method\"))}0!==((c<<8)+d)%31&&q(Error(\"invalid fcheck flag:\"+((c<<8)+d)%31));d&32&&q(Error(\"fdict flag is not supported\"));this.L=new T(b,{index:this.c,bufferSize:a.bufferSize,bufferType:a.bufferType,resize:a.resize})}\nub.prototype.h=function(){var b=this.input,a,c;a=this.L.h();this.c=this.L.c;this.$&&(c=(b[this.c++]<<24|b[this.c++]<<16|b[this.c++]<<8|b[this.c++])>>>0,c!==tb(a)&&q(Error(\"invalid adler-32 checksum\")));return a};var vb=8;function wb(b,a){this.input=b;this.a=new (B?Uint8Array:Array)(32768);this.k=W.o;var c={},d;if((a||!(a={}))&&\"number\"===typeof a.compressionType)this.k=a.compressionType;for(d in a)c[d]=a[d];c.outputBuffer=this.a;this.K=new na(this.input,c)}var W=ra;\nwb.prototype.g=function(){var b,a,c,d,e,f,g,k=0;g=this.a;b=vb;switch(b){case vb:a=Math.LOG2E*Math.log(32768)-8;break;default:q(Error(\"invalid compression method\"))}c=a<<4|b;g[k++]=c;switch(b){case vb:switch(this.k){case W.NONE:e=0;break;case W.v:e=1;break;case W.o:e=2;break;default:q(Error(\"unsupported compression type\"))}break;default:q(Error(\"invalid compression method\"))}d=e<<6|0;g[k++]=d|31-(256*c+d)%31;f=tb(this.input);this.K.b=k;g=this.K.g();k=g.length;B&&(g=new Uint8Array(g.buffer),g.length<=\nk+4&&(this.a=new Uint8Array(g.length+4),this.a.set(g),g=this.a),g=g.subarray(0,k+4));g[k++]=f>>24&255;g[k++]=f>>16&255;g[k++]=f>>8&255;g[k++]=f&255;return g};function xb(b,a){var c,d,e,f;if(Object.keys)c=Object.keys(a);else for(d in c=[],e=0,a)c[e++]=d;e=0;for(f=c.length;e<f;++e)d=c[e],A(b+\".\"+d,a[d])};A(\"Zlib.Inflate\",ub);A(\"Zlib.Inflate.prototype.decompress\",ub.prototype.h);xb(\"Zlib.Inflate.BufferType\",{ADAPTIVE:Ya.N,BLOCK:Ya.O});A(\"Zlib.Deflate\",wb);A(\"Zlib.Deflate.compress\",function(b,a){return(new wb(b,a)).g()});A(\"Zlib.Deflate.prototype.compress\",wb.prototype.g);xb(\"Zlib.Deflate.CompressionType\",{NONE:W.NONE,FIXED:W.v,DYNAMIC:W.o});}).call(this); //@ sourceMappingURL=zlib_and_gzip.min.js.map\n"; /***/}, /* 9 */ /***/function(module,exports,__webpack_require__){var __WEBPACK_AMD_DEFINE_FACTORY__,__WEBPACK_AMD_DEFINE_RESULT__; /*!
		  * $script.js JS loader & dependency manager
		  * https://github.com/ded/script.js
		  * (c) Dustin Diaz 2014 | License MIT
		  */(function(name,definition){if(typeof module!='undefined'&&module.exports)module.exports=definition();else if(true)!(__WEBPACK_AMD_DEFINE_FACTORY__=definition,__WEBPACK_AMD_DEFINE_RESULT__=typeof __WEBPACK_AMD_DEFINE_FACTORY__==='function'?__WEBPACK_AMD_DEFINE_FACTORY__.call(exports,__webpack_require__,exports,module):__WEBPACK_AMD_DEFINE_FACTORY__,__WEBPACK_AMD_DEFINE_RESULT__!==undefined&&(module.exports=__WEBPACK_AMD_DEFINE_RESULT__));else this[name]=definition();})('$script',function(){var doc=document,head=doc.getElementsByTagName('head')[0],s='string',f=false,push='push',readyState='readyState',onreadystatechange='onreadystatechange',list={},ids={},delay={},scripts={},scriptpath,urlArgs;function every(ar,fn){for(var i=0,j=ar.length;i<j;++i){if(!fn(ar[i]))return f;}return 1;}function each(ar,fn){every(ar,function(el){return !fn(el);});}function $script(paths,idOrDone,optDone){paths=paths[push]?paths:[paths];var idOrDoneIsDone=idOrDone&&idOrDone.call,done=idOrDoneIsDone?idOrDone:optDone,id=idOrDoneIsDone?paths.join(''):idOrDone,queue=paths.length;function loopFn(item){return item.call?item():list[item];}function callback(){if(! --queue){list[id]=1;done&&done();for(var dset in delay){every(dset.split('|'),loopFn)&&!each(delay[dset],loopFn)&&(delay[dset]=[]);}}}setTimeout(function(){each(paths,function loading(path,force){if(path===null)return callback();if(!force&&!/^https?:\/\//.test(path)&&scriptpath){path=path.indexOf('.js')===-1?scriptpath+path+'.js':scriptpath+path;}if(scripts[path]){if(id)ids[id]=1;return scripts[path]==2?callback():setTimeout(function(){loading(path,true);},0);}scripts[path]=1;if(id)ids[id]=1;create(path,callback);});},0);return $script;}function create(path,fn){var el=doc.createElement('script'),loaded;el.onload=el.onerror=el[onreadystatechange]=function(){if(el[readyState]&&!/^c|loade/.test(el[readyState])||loaded)return;el.onload=el[onreadystatechange]=null;loaded=1;scripts[path]=2;fn();};el.async=1;el.src=urlArgs?path+(path.indexOf('?')===-1?'?':'&')+urlArgs:path;head.insertBefore(el,head.lastChild);}$script.get=create;$script.order=function(scripts,id,done){(function callback(s){s=scripts.shift();!scripts.length?$script(s,id,done):$script(s,callback);})();};$script.path=function(p){scriptpath=p;};$script.urlArgs=function(str){urlArgs=str;};$script.ready=function(deps,ready,req){deps=deps[push]?deps:[deps];var missing=[];!each(deps,function(dep){list[dep]||missing[push](dep);})&&every(deps,function(dep){return list[dep];})?ready():!function(key){delay[key]=delay[key]||[];delay[key][push](ready);req&&req(missing);}(deps.join('|'));return $script;};$script.done=function(idOrDone){$script([null],idOrDone);};return $script;}); /***/} /******/]);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(1)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery) {'use strict';

	var _MUIUser = __webpack_require__(4);

	var _MUIUser2 = _interopRequireDefault(_MUIUser);

	var _MUIConversation = __webpack_require__(5);

	var _MUIConversation2 = _interopRequireDefault(_MUIConversation);

	var _MUIMessage = __webpack_require__(6);

	var _MUIMessage2 = _interopRequireDefault(_MUIMessage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	__webpack_require__(7);

	__webpack_require__(8);

	__webpack_require__(10);
	__webpack_require__(11);
	__webpack_require__(20);

	// =================
	// MUI*.js
	window.MUIUser = _MUIUser2.default;
	window.MUIConversation = _MUIConversation2.default;
	window.MUIMessage = _MUIMessage2.default;

	// =================
	// MediaStreamRecorder.js
	var MediaStreamRecorder = __webpack_require__(22).MediaStreamRecorder;
	window.StereoRecorder = __webpack_require__(22).StereoRecorder;

	var $ = __webpack_require__(1);
	__webpack_provided_window_dot_jQuery = $;
	window.$ = $;

	// Variable to store the file to send
	var fileCaptured = {}; // save files

	// Variable to store the audio to send
	var audioCaptured = {};

	// Variable to record audio
	// mic
	var micActivated = false;

	// vars to start the recording audio
	var mediaRecorder;
	var mediaConstraints = {
	    audio: true
	};

	// vars to handle the mp3 converter
	var ffmpegWorker;
	var ffmpegRunning = false;

	// vars to handle the timer in Record Area
	var minutesLabel;
	var secondsLabel;
	var refreshIntervalId;

	var $bubblePlayer;
	var audiobuble;
	var playIntervalBubble;
	var minutesBubbleLabel;
	var secondsBubbleLabel;
	var totalSeconds = 0;

	var audioMessageOldId;
	var currentConversationOnlineState; // store the last online state while appear typing state

	var globalAudioPreview;
	var timestampPrev;

	// Variable to send message
	var typeMessageToSend; // text:0 || audio:1 || image:3 || file:4

	var inputConf = {};

	var monkeyUI = new function () {
	    this.wrapperOut = '.mky-wrapper-out';
	    this.wrapperIn = '.mky-wrapper-in';
	    this.contentConnection = '#mky-content-connection';
	    this.contentApp = '#mky-content-app';
	    this.contentConversationList = '#mky-conversation-list';
	    this.contentConversationWindow = '#mky-conversation-window';
	    this.contentIntroApp = '#mky-app-intro';
	    this.user;

	    var FULLSCREEN = 'fullscreen';
	    var CLASSIC = 'classic';
	    var INLINE, SIDEBAR;

	    var FULLSIZE = 'fullsize';
	    var PARTIALSIZE = 'partialsize';

	    var ICON = 'icon';

	    var STANDARD = 'standard';
	    var KNOB = 'knob';
	    var PREFIX = 'mky-';

	    this.isConversationList = true;
	    this.input = {};
	    this.input.isAttachButton = true;
	    this.input.isAudioButton = true;
	    this.input.isSendButton = true;
	    this.input.isEphemeralButton = true;
	    this.screen = {};
	    this.screen.type = FULLSCREEN;
	    this.screen.data = {};
	    this.screen.data.mode = FULLSIZE;
	    this.screen.data.width = undefined;
	    this.screen.data.height = undefined;
	    this.player = KNOB;
	    this.form = false;
	    this.login = false;

	    this.setChat = function (conf) {
	        monkeyUI.isConversationList = conf.showConversationList == undefined ? false : conf.showConversationList;
	        if (conf.input != undefined) {
	            monkeyUI.input.isAttachButton = conf.input.showAttachButton == undefined ? true : conf.input.showAttachButton;
	            monkeyUI.input.isAudioButton = conf.input.showAudioButton == undefined ? true : conf.input.showAudioButton;
	            monkeyUI.input.isSendButton = conf.input.showSendButton == undefined ? true : conf.input.showSendButton;
	            monkeyUI.input.isEphemeralButton = conf.input.showEphemeralButton == undefined ? false : conf.input.showEphemeralButton;
	        } else {
	            monkeyUI.input.isEphemeralButton = false;
	        }
	        monkeyUI.screen.type = conf.screen.type == undefined ? FULLSCREEN : conf.screen.type;
	        if (monkeyUI.screen.type == FULLSCREEN) {
	            monkeyUI.screen.data.mode = FULLSIZE;
	        } else if (monkeyUI.screen.type == CLASSIC) {
	            monkeyUI.screen.data.mode = PARTIALSIZE;
	            monkeyUI.screen.data.width = conf.screen.data.width;
	            monkeyUI.screen.data.height = conf.screen.data.height;
	        }
	        monkeyUI.player = conf.player == undefined ? KNOB : conf.player;
	    };

	    this.drawScene = function () {

	        var e = document.createElement("link");
	        e.href = "https://cdn.criptext.com/MonkeyUI/styles/chat7.css", e.type = "text/css", e.rel = "stylesheet", document.getElementsByTagName("head")[0].appendChild(e);

	        var ec = document.createElement("link");
	        ec.href = "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css", ec.type = "text/css", ec.rel = "stylesheet", document.getElementsByTagName("head")[0].appendChild(ec);

	        if ($('.mky-wrapper-out').length <= 0) {
	            var _scene = '';
	            if (this.screen.data.width != undefined && this.screen.data.height != undefined && this.screen.data.mode == PARTIALSIZE) {
	                _scene += '<div class="mky-wrapper-out ' + PREFIX + this.screen.data.mode + ' ' + PREFIX + this.screen.type + '" style="width: ' + this.screen.data.width + '; height:30px;">';
	            } else {
	                _scene += '<div class="mky-wrapper-out ' + PREFIX + this.screen.data.mode + ' ' + PREFIX + this.screen.type + '">';
	            }
	            if (this.screen.type == FULLSCREEN) {} else if (this.screen.type == CLASSIC) {
	                _scene += '<div class="mky-tab">' + '<span class="mky-tablabel"> Want to know more? </span>' + '<div id="mky-w-max"></div>' + '<div id="mky-w-min" class="mky-disappear"></div>' + '</div>';
	            } else if (this.screen.type == SIDEBAR) {
	                _scene += '<div class="circle-icon">' + '<div id="w-open" class="mky-appear"></div>' + '</div>';
	            }
	            _scene += '<div class="mky-wrapper-in">' + '<div id="mky-content-connection"></div>' + '<div id="mky-content-app" class="mky-disappear">';
	            if (this.isConversationList) {
	                _scene += '<aside>' + '<ul id="mky-conversation-list" class=""></ul>' + '</aside>';
	            }
	            var _class = this.isConversationList ? 'mky-conversation-with' : 'mky-conversation-only';
	            _scene += '<section id="mky-conversation-window" class="' + _class + '">';
	            if (monkeyUI.screen.data.mode == PARTIALSIZE) {
	                _scene += '<div class="' + PREFIX + monkeyUI.screen.data.mode + ' jFiler-input-dragDrop" style="width:' + monkeyUI.screen.data.width + '; height:' + monkeyUI.screen.data.height + ';">' + '<div class="jFiler-input-inner"><div class="jFiler-input-icon"><i class="icon-jfi-cloud-up-o"></i></div><div class="jFiler-input-text">' + '<h3>Drop files here</h3></div></div></div>';
	            }
	            _scene += '</section>' + '</div>' + '</div>' + '</div>';
	            $('body').append(_scene);
	            drawLoading(this.contentConnection);
	        } else {
	            $('.mky-wrapper-out').addClass(PREFIX + this.screen.data.mode);
	        }
	        initOptionsOutWindow(this.screen.data.height, this.form);
	        drawHeaderUserSession(this.contentApp + ' aside');
	        drawContentConversation(this.contentConversationWindow, this.screen.type);
	        drawInput(this.contentConversationWindow, this.input);
	        monkeyUI.stopLoading();
	    };

	    function initOptionsOutWindow(height, isForm) {
	        $("#mky-w-max").click(function () {
	            $('.mky-wrapper-out').height(height);
	            if (isForm && !monkeyUI.getLogin()) {
	                $("#mky-w-min").removeClass('mky-disappear');
	                $("#mky-w-max").addClass('mky-disappear');
	            } else if (!isForm && !monkeyUI.getLogin()) {
	                $(monkeyUI).trigger('quickStart');
	            } else if (monkeyUI.getLogin()) {
	                monkeyUI.disappearOptionsOutWindow();
	            }
	        });
	        $("#mky-w-min").click(function () {
	            $('.mky-wrapper-out').height($('.mky-tab').height());
	            $("#mky-w-min").addClass('mky-disappear');
	            $("#mky-w-max").removeClass('mky-disappear');
	        });
	    }

	    function initOptionInWindow() {
	        $("#mky-w-min-in").click(function () {
	            $('.mky-wrapper-out').height($('.mky-tab').height());
	            $('.mky-tab').removeClass('mky-disappear');

	            $("#mky-w-min").addClass('mky-disappear');
	            $("#mky-w-max").removeClass('mky-disappear');
	        });
	    }

	    this.disappearOptionsOutWindow = function () {
	        $('.mky-tab').addClass('mky-disappear');
	        $('.mky-wrapper-out').removeClass(PREFIX + 'classic');
	    };

	    this.getLogin = function () {
	        return this.login;
	    };

	    function drawLoading(contentConnection) {
	        var _html = '<div class="mky-spinner">' + '<div class="mky-bounce1"></div>' + '<div class="mky-bounce2"></div>' + '<div class="mky-bounce3"></div>' + '</div>';
	        $(contentConnection).prepend(_html);
	    }

	    function drawHeaderUserSession(content) {
	        var _html = '<header id="mky-session-header">' + '<div id="mky-session-image">' + '<img src="">' + '</div>' + '<div id="mky-session-description">' + '<span id="mky-session-name"></span>' + '</div>' + '</header>';
	        $(content).prepend(_html);
	    }

	    function drawContentConversation(content, screenType) {
	        var _html = '<div id="mky-app-intro"><div></div></div>' + '<header id="mky-conversation-selected-header">' + '<div id="mky-conversation-selected-image">' + '<img src="">' + '</div>' + '<div id="mky-conversation-selected-description">' + '<span id="mky-conversation-selected-name"></span>' + '<span id="mky-conversation-selected-status"></span>' + '</div>';
	        if (screenType == CLASSIC || screenType == SIDEBAR) {
	            _html += '<div class="mky-content-options">' + '<div id="mky-w-min-in"></div>' + '<div id="mky-w-close"></div>' + '</div>';
	        }
	        _html += '</header>';
	        if (monkeyUI.screen.data.mode == FULLSIZE) {
	            _html += '<div class="' + PREFIX + monkeyUI.screen.data.mode + ' jFiler-input-dragDrop">' + '<div class="jFiler-input-inner"><div class="jFiler-input-icon"><i class="icon-jfi-cloud-up-o"></i></div><div class="jFiler-input-text">' + '<h3>Drop files here</h3></div></div></div>';
	        }
	        _html += '<div id="mky-chat-timeline"></div>';

	        $(content).append(_html);
	        initOptionInWindow();
	    }

	    this.stopLoading = function () {
	        // to check
	        /*
	        $('.drop-login-loading').hide();
	        $('.secure-conextion-drop').show();
	        $('.secure-conextion-drop').hide();
	        */
	        $(this.contentConnection).removeClass('mky-appear');
	        $(this.contentConnection).addClass('mky-disappear');
	    };

	    this.startLoading = function () {
	        $(this.contentConnection).removeClass('mky-disappear');
	        $(this.contentConnection).addClass('mky-appear');
	    };

	    this.loadDataScreen = function (user) {
	        this.user = user;
	        detectFuntionality();

	        // set contentApp
	        $(this.contentApp).removeClass('mky-disappear');

	        // set user info
	        $("#mky-session-name").html(this.user.name);
	        $('#mky-session-image img').attr('src', this.user.urlAvatar);
	    };

	    function detectFuntionality() {
	        if (window.location.protocol != "https:" || /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
	            disabledAudioButton(true);
	        }
	    }

	    /***********************************************/
	    /********************* INPUT *******************/
	    /***********************************************/

	    function drawInput(content, input) {

	        var _html = '<div id="mky-chat-input">' + '<div id="mky-divider-chat-input"></div>';
	        if (input.isAttachButton) {
	            _html += '<div class="mky-button-input">' + '<button id="mky-button-attach" class="mky-button-icon"></button>' + '<input type="file" name="attach" id="attach-file" style="display:none" accept=".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx, image/*">' + '</div>';
	        }

	        if (input.isAudioButton) {
	            _html += '<div class="mky-button-input">' + '<button id="mky-button-cancel-audio" class="mky-button-icon"></button>' + '</div>';
	        }

	        _html += '<textarea id="mky-message-text-input" class="mky-textarea-input" placeholder="Write a secure message"></textarea>';

	        if (input.isAudioButton) {
	            _html += '<div id="mky-record-area" class="mky-disappear">' + '<div class="mky-record-preview-area">' + '<div id="mky-button-action-record">' + '<button id="mky-button-start-record" class="mky-blink"></button>' + '</div>' + '<div id="mky-time-recorder"><span id="mky-minutes">00</span><span>:</span><span id="mky-seconds">00</span></div>' + '</div>' + '</div>';
	        }

	        if (input.isSendButton) {
	            _html += '<div class="mky-button-input">' + '<button id="mky-button-send-message" class="mky-button-icon"></button>' + '</div>';
	        }

	        if (input.isAudioButton) {
	            _html += '<div class="mky-button-input">' + '<button id="mky-button-record-audio" class="mky-button-icon"></button>' + '</div>';
	        }

	        if (input.isEphemeralButton) {
	            _html += '<div class="mky-button-input">' + '<button id="mky-button-send-ephemeral" class="mky-button-icon timer_icon"></button>' + '</div>';
	        }

	        _html += '<div class="mky-signature">Powered by <a class="mky-signature-link" target="_blank" href="http://criptext.com/">Criptext</a></div></div>';
	        $(content).append(_html);
	        initInputFunctionality();
	    }

	    this.showChatInput = function () {
	        $('#mky-button-action-record button').hide();
	        $('#mky-button-action-record button').attr('onclick', '');
	        $('#mky-button-start-record').show();
	        $('#mky-record-area').removeClass("mky-appear");
	        $('#mky-record-area').addClass("mky-disappear");
	        $('#mky-button-attach').parent().removeClass("mky-disappear");
	        $('#mky-button-cancel-audio').parent().addClass("mky-disappear");
	        $('#mky-button-record-audio').parent().removeClass("mky-disappear");
	        $('#mky-button-send-message').parent().addClass("mky-disappear");
	        $('#mky-button-record-audio').parent().removeClass("mky-disappear");
	        $('#mky-button-send-ephemeral').removeClass('enable_timer');
	        $("#mky-minutes").html('00');
	        $("#mky-seconds").html('00');
	        $("#mky-message-text-input").removeClass("mky-disappear");
	        clearAudioRecordTimer();
	        typeMessageToSend = 0;
	    };

	    function clearAudioRecordTimer() {
	        totalSeconds = 0; //encera el timer
	        clearInterval(refreshIntervalId);
	        minutesLabel.innerHTML = '00';
	        secondsLabel.innerHTML = '00';
	    }

	    function initInputFunctionality() {
	        minutesLabel = document.getElementById("mky-minutes");
	        secondsLabel = document.getElementById("mky-seconds");

	        // mp3 converter
	        ffmpegWorker = getFFMPEGWorker();

	        inputEvent();
	    }

	    function inputEvent() {
	        $('#mky-message-text-input').keydown(function (event) {
	            var charCode = window.event ? event.which : event.keyCode;

	            if (charCode == 8 || charCode == 46) {
	                if ($('#mky-button-send-message').is(':visible') && $(this).val().trim().length <= 1) {
	                    $('#mky-button-record-audio').parent().removeClass("mky-disappear");
	                    $('#mky-button-send-message').parent().addClass("mky-disappear");
	                    $('#mky-button-send-ephemeral').removeClass('enable_timer');
	                }
	            } else if (charCode == 13) {
	                if (event.shiftKey === true) {
	                    return true;
	                } else {
	                    var _messageText = $('#mky-message-text-input').val().trim();
	                    $(monkeyUI).trigger('textMessage', _messageText);
	                    $('#mky-message-text-input').val("");
	                    monkeyUI.showChatInput();
	                    return false;
	                }
	            } else {
	                if (!$('#mky-button-send-message').is(':visible')) {
	                    $('#mky-button-record-audio').parent().addClass("mky-disappear");
	                    $('#mky-button-send-message').parent().removeClass("mky-disappear");
	                    $('#mky-button-send-ephemeral').addClass('enable_timer');
	                    typeMessageToSend = 0;
	                }
	            }
	        });

	        $('#mky-button-send-message').click(function () {
	            switch (typeMessageToSend) {
	                case 0:
	                    var _messageText = $('#mky-message-text-input').val().trim();
	                    $(monkeyUI).trigger('textMessage', _messageText);
	                    $('#mky-message-text-input').val("");
	                    monkeyUI.showChatInput();
	                    break;
	                case 1:
	                    if (mediaRecorder != null) {
	                        mediaRecorder.stop(); //detiene la grabacion del audio
	                    }
	                    audioCaptured.duration = totalSeconds;
	                    monkeyUI.showChatInput();
	                    buildAudio();
	                    mediaRecorder = null;
	                    break;
	                case 3:
	                    $('#attach-file').val('');
	                    //$('#mky-preview-image').remove();
	                    hideChatInputFile();
	                    $(monkeyUI).trigger('imageMessage', fileCaptured);
	                    break;
	                case 4:
	                    $('#attach-file').val('');
	                    hideChatInputFile();
	                    $(monkeyUI).trigger('fileMessage', fileCaptured);
	                    break;
	                default:
	                    break;
	            }
	        });

	        $("#mky-button-attach").click(function () {
	            $("#attach-file").trigger('click');
	        });

	        $('#attach-file').on('change', function (e) {
	            //showChatInputFile();
	            catchUpFile(e.target.files[0]);
	        });

	        $('#mky-button-record-audio').click(function () {
	            showChatInputRecord();
	            startRecordAudio();
	        });

	        $('#mky-button-cancel-audio').click(function () {
	            monkeyUI.showChatInput();

	            var audio = document.getElementById('audio_' + timestampPrev);
	            if (audio != null) audio.pause();
	            mediaRecorder = null;
	        });

	        $("#attach-file").filer({
	            limit: null,
	            maxSize: null,
	            extensions: null,
	            changeInput: '<div class="mky-chat-drop-zone" ></div>',
	            showThumbs: true,
	            theme: "dragdropbox",
	            dragDrop: {
	                dragEnter: function dragEnter() {
	                    console.log('file entered');
	                    $('.jFiler-input-dragDrop').show();
	                },
	                dragLeave: function dragLeave() {
	                    console.log('file entered');
	                    $('.mky-chat-drop-zone').hide();
	                    $('.jFiler-input-dragDrop').hide();
	                },
	                drop: function drop() {
	                    console.log('file entered');
	                    $('.mky-chat-drop-zone').hide();
	                    $('.jFiler-input-dragDrop').hide();
	                }
	            },
	            files: null,
	            addMore: false,
	            clipBoardPaste: true,
	            excludeName: null,
	            beforeRender: null,
	            afterRender: null,
	            beforeShow: null,
	            beforeSelect: null,
	            onSelect: function onSelect(obj) {
	                // showChatInputFile();
	                catchUpFile(obj);
	            },
	            afterShow: null,
	            onEmpty: null,
	            options: null,
	            captions: {
	                drop: "Drop file here to Upload"
	            }
	        });

	        if (monkeyUI.screen.data.mode == PARTIALSIZE) {
	            $(".mky-chat-drop-zone").attr('style', 'width:' + monkeyUI.screen.data.width + '; height:' + monkeyUI.screen.data.height + ';');
	        }
	        $('#mky-chat-input').prepend($(".mky-chat-drop-zone").detach());
	    }

	    document.addEventListener("dragenter", function (event) {
	        // alert('ddd');
	        console.log('over document');
	        $(document).find('.mky-chat-drop-zone').show();
	    });

	    function catchUpFile(file) {

	        fileCaptured.file = file;
	        console.log(fileCaptured.file);
	        fileCaptured.ext = getExtention(fileCaptured.file);

	        var _fileType = checkExtention(fileCaptured.file);
	        if (_fileType >= 1 && _fileType <= 4) {
	            typeMessageToSend = 4;
	            fileCaptured.monkeyFileType = 4;
	            generateDataFile();
	        } else if (_fileType == 6) {
	            typeMessageToSend = 3;
	            fileCaptured.monkeyFileType = 3;
	            generateDataFile();
	            return;
	        } else {
	            return false;
	        }
	    }

	    function showChatInputFile() {
	        typeMessageToSend = 3;
	        // $("#mky-chat-input").addClass('mky-chat-input-file');
	        // $('#mky-button-attach').parent().addClass("mky-disappear");
	        // $('#mky-button-record-audio').parent().addClass("mky-disappear");
	        // $('#mky-button-send-message').parent().removeClass("mky-disappear");
	        // $('#mky-button-send-ephemeral').addClass('enable_timer');
	    }

	    function hideChatInputFile() {
	        typeMessageToSend = -1;
	        $("#mky-chat-input").removeClass('mky-chat-input-file');
	        $('#mky-button-attach').parent().removeClass("mky-disappear");
	        $('#mky-button-record-audio').parent().removeClass("mky-disappear");
	        $('#mky-button-send-message').parent().addClass("mky-disappear");
	        $('#mky-button-send-ephemeral').removeClass('enable_timer');
	    }

	    function showChatInputRecord() {
	        $('#mky-record-area').removeClass("mky-disappear");
	        $('#mky-record-area').addClass("mky-appear");
	        $('#mky-button-cancel-audio').parent().removeClass("mky-disappear");
	        $('#mky-button-attach').parent().addClass("mky-disappear");
	        $('#mky-button-send-message').parent().removeClass("mky-disappear");
	        $('#mky-button-record-audio').parent().addClass("mky-disappear");
	        $("#mky-message-text-input").addClass("mky-disappear");
	        minutesLabel = document.getElementById("mky-minutes");
	        secondsLabel = document.getElementById("mky-seconds");
	    }

	    function disabledAudioButton(bool) {
	        $('#mky-button-record-audio').disabled = bool;
	        if (bool) {
	            $('#mky-button-record-audio').parent().addClass("mky-disabled");
	        } else {
	            $('#mky-button-record-audio').parent().removeClass("mky-disabled");
	        }
	    }
	    /***********************************************/
	    /*************** DRAW CONVERSATION *************/
	    /***********************************************/

	    this.drawConversation = function (conversation, isHidden) {
	        var _conversationIdHandling = getConversationIdHandling(conversation.id);

	        // set app intro
	        if (!isHidden && $(this.contentIntroApp).length >= 0) {
	            $(this.contentIntroApp).remove();
	        }

	        if (!isHidden) {
	            // set conversation window
	            $(this.contentConversationWindow).addClass('mky-disabled');

	            // set header conversation
	            //var conversationPhoto = isConversationGroup(this.id) ? _conversationIdHandling : users[this.id].id;
	            $('#mky-conversation-selected-image img').attr('src', conversation.urlAvatar);
	            var conversationName = conversation.name ? conversation.name : 'undefined';
	            $('#mky-conversation-selected-name').html(conversationName);
	            //$('#mky-conversation-selected-members').html('');

	            // set conversation item
	            if (this.isConversationList) {
	                $(this.contentConversationList + ' li').removeClass('mky-conversation-selected');
	                $(this.contentConversationList + ' li').addClass('mky-conversation-unselected');
	                $('#conversation-' + _conversationIdHandling).removeClass('mky-conversation-unselected');
	                $('#conversation-' + _conversationIdHandling).addClass('mky-conversation-selected');
	                // (badge)
	                $('#conversation-' + _conversationIdHandling).find('.mky-conversation-notification').remove();
	                removeNotification(_conversationIdHandling);
	            }

	            // set chat timeline
	            $('.mky-chat-timeline-conversation').removeClass('mky-appear');
	            $('.mky-chat-timeline-conversation').addClass('mky-disappear');
	            if ($('#mky-chat-timeline-conversation-' + _conversationIdHandling).length > 0) {
	                $('#mky-chat-timeline-conversation-' + _conversationIdHandling).removeClass('mky-disappear');
	                $('#mky-chat-timeline-conversation-' + _conversationIdHandling).addClass('mky-appear');
	                scrollToDown();
	            } else {
	                drawConversationWindow(conversation.id, isHidden);
	                if (this.isConversationList) {
	                    drawConversationItem(this.contentConversationList, conversation);
	                }
	            }

	            // set input
	            this.showChatInput();

	            // set conversation window, start to chat
	            $(this.contentConversationWindow).removeClass('mky-disabled');
	        } else {
	            // set chat timeline
	            if ($('#mky-chat-timeline-conversation-' + _conversationIdHandling).length <= 0) {
	                drawConversationWindow(conversation.id, isHidden);
	                if (this.isConversationList) {
	                    drawConversationItem(this.contentConversationList, conversation);
	                }
	            }
	        }
	    };

	    function drawConversationWindow(conversationId, isHidden) {
	        var _class = isHidden ? 'mky-disappear' : 'mky-appear';
	        $('#mky-chat-timeline').append('<div class="mky-chat-timeline-conversation ' + _class + '" id="mky-chat-timeline-conversation-' + conversationId + '"></div>');
	    }

	    function drawConversationItem(contentConversationList, conversation) {

	        var _li = '<li id="conversation-' + conversation.id + '" class="mky-conversation-unselected" onclick="openConversation(\'' + conversation.id + '\')">' + '<div class="mky-conversation-image">' + '<img src="' + conversation.urlAvatar + '" onerror="imgError(this);">';
	        var _conversationName = conversation.name ? conversation.name : 'undefined';
	        _li += '</div>' + '<div class="mky-conversation-description"><div class="mky-conversation-name"><span class="mky-ellipsify">' + _conversationName + '</span></div><div class="mky-conversation-state"><span class="mky-ellipsify">Click to open conversation</span></div></div>' + '</li>';
	        $(contentConversationList).append(_li);
	    }

	    this.updateDrawConversation = function (conversation) {
	        var _conversationLi = $('#conversation-' + conversation.id);
	        _conversationLi.find('img').attr('src', conversation.urlAvatar);
	        _conversationLi.find('.mky-conversation-name span').html(conversation.name);
	    };

	    /***********************************************/
	    /************** STATE CONVERSATION *************/
	    /***********************************************/

	    this.updateOnlineStatus = function (lastOpenApp, online) {
	        if (online == 0) {
	            currentConversationOnlineState = defineTime(lastOpenApp);
	            $('#mky-conversation-selected-status').html('Last seen ' + defineTime(lastOpenApp));
	        } else {
	            currentConversationOnlineState = 'Online';
	            $('#mky-conversation-selected-status').html('Online');
	        }
	    };

	    this.updateTypingState = function (conversationId, state) {
	        var user = $('#mky-conversation-' + conversationId);
	        var content = user.find('.mky-conversation-state').hide();
	        user.find('.mky-user-info-typing').remove();

	        if (state == 21) {
	            user.find('.mky-conversation-description').append('<span class="mky-user-info-typing"> typing... </span>');
	        } else if (state == 20) {
	            user.find('.mky-user-info-typing').remove();
	            user.find('.mky-conversation-state').show();
	        }

	        if ($('#mky-chat-timeline-conversation-' + conversationId).hasClass('mky-appear')) {
	            if (state == 21) {
	                $('#mky-conversation-selected-status').html('typing...');
	            } else {
	                $('#mky-conversation-selected-status').html(currentConversationOnlineState);
	            }
	        }
	    };

	    /***********************************************/
	    /************** NOTIFICATION/BADGE *************/
	    /***********************************************/

	    function updateNotification(text, conversationId) {
	        var liConversation = $("#conversation-" + conversationId);

	        if (text.length >= 20) {
	            text = text.substr(0, 20);
	        }

	        liConversation.find('.mky-conversation-state span').html(text);
	        setNotification(conversationId);

	        if ($('#mky-chat-timeline-conversation-' + conversationId).hasClass('mky-appear')) {
	            // counting notification existing badges

	            if (liConversation.find('.mky-conversation-notification').length > 0) {
	                var num = parseInt(liConversation.find('.mky-conversation-notification').first().find('.mky-notification-amount').html());
	                num = num + 1;
	                liConversation.find('.mky-conversation-notification').first().find('.mky-notification-amount').html(num);
	            } else {
	                liConversation.prepend('<div class="mky-conversation-notification"><div class="mky-notification-amount">1</div></div>');
	            }
	        } else {
	            removeNotification(conversationId);
	        }
	    }

	    function setNotification(conversationId) {
	        var liConversation = $('#conversation' + conversationId);
	        liConversation.find('.mky-conversation-description span').addClass('mky-bold-text');
	    }

	    function removeNotification(conversationId) {
	        var liConversation = $("conversation-" + conversationId);
	        liConversation.find('.mky-conversation-description span').removeClass('mky-bold-text');
	    }

	    /***********************************************/
	    /****************** DRAW BUBBLES ***************/
	    /***********************************************/

	    function defineMessageStatus(status) {
	        switch (status) {
	            case 0:
	                return 'mky-status-load';
	                break;
	            case 50:
	                return 'mky-status-sent';
	                break;
	            case 51:
	                return 'mky-status-sent';
	                break;
	            case 52:
	                return 'mky-status-read';
	                break;
	            default:
	                return undefined;
	                break;
	        }
	    }

	    function baseBubble(message, isOutgoing, withName, status) {
	        var _bubble = '';
	        var _classBubble = isOutgoing ? 'mky-bubble-out' : 'mky-bubble-in';
	        var _classStatus = defineMessageStatus(status);

	        _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble ' + _classBubble + '">' + '<div class="mky-message-detail">';
	        if (withName && !isOutgoing) {
	            var _senderName = message.senderName ? message.senderName : 'Unknown';
	            var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	            _bubble += '<span class="mky-message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	        }
	        _bubble += '<span class="mky-message-hour">' + defineTime(message.timestamp * 1000) + '</span>';
	        if (isOutgoing) {
	            _bubble += '<div class="mky-message-status ' + _classStatus + '">';
	            if (status != 0) {
	                _bubble += '<i class="fa fa-check"></i>';
	            }
	        }
	        _bubble += '</div>' + '</div>' + '</div>';

	        return _bubble;
	    }

	    this.drawTextMessageBubble = function (message, conversationId, isGroupChat, status) {
	        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
	        var _conversationIdHandling = getConversationIdHandling(conversationId);
	        var _messageText = findLinks(message.text);

	        $('#mky-chat-timeline-conversation-' + _conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
	        var _classTypeBubble = _isOutgoing ? 'mky-bubble-text-out' : 'mky-bubble-text-in';
	        var _messagePoint = $('#' + message.id);
	        _messagePoint.addClass('mky-bubble-text');
	        _messagePoint.addClass(_classTypeBubble);

	        var _content = '<span class="mky-content-text">' + _messageText + '</span>';
	        _messagePoint.append(_content);
	        scrollToDown();

	        if (message.eph == 1) {
	            updateNotification("Private Message", _conversationIdHandling);
	        } else {
	            updateNotification(message.text, _conversationIdHandling);
	        }
	    };

	    this.drawImageMessageBubble = function (message, conversationId, isGroupChat, status) {
	        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
	        var _conversationIdHandling = getConversationIdHandling(conversationId);
	        var _fileName = message.text;
	        var _dataSource = message.dataSource != undefined ? message.dataSource : 'images/ukn.png';

	        $('#mky-chat-timeline-conversation-' + _conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
	        var _classTypeBubble = _isOutgoing ? 'mky-bubble-image-out' : 'mky-bubble-image-in';
	        var _messagePoint = $('#' + message.id);
	        _messagePoint.addClass('mky-bubble-image');
	        _messagePoint.addClass(_classTypeBubble);

	        var _content = '<div class="mky-content-image" onclick="monkeyUI.showViewer(\'' + message.id + '\',\'' + _fileName + '\')">' + '<img src=' + _dataSource + '>' + '</div>';
	        _messagePoint.append(_content);
	        scrollToDown();

	        if (message.eph == 1) {
	            updateNotification("Private Image", _conversationIdHandling);
	        } else {
	            updateNotification("Image", _conversationIdHandling);
	        }
	    };

	    this.drawAudioMessageBubble = function (message, conversationId, isGroupChat, status, audioOldId) {
	        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
	        var _conversationIdHandling = getConversationIdHandling(conversationId);
	        var _dataSource = message.dataSource;

	        var _messagePoint = $('#' + audioOldId);
	        if (_messagePoint.length > 0) {
	            _messagePoint.attr('id', message.id);
	            _messagePoint.find('.mky-content-audio-loading').remove();
	            _messagePoint = $('#' + message.id);
	        } else {
	            $('#mky-chat-timeline-conversation-' + _conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
	            var _classTypeBubble = _isOutgoing ? 'mky-bubble-audio-out' : 'mky-bubble-audio-in';
	            _messagePoint = $('#' + message.id);
	            _messagePoint.addClass('mky-bubble-audio');
	            _messagePoint.addClass(_classTypeBubble);
	        }

	        if (this.player == 'knob') {
	            var _messageId = message.id[0] == '-' ? message.timestamp * 1000 : message.id;
	            var _content = '<div class="mky-content-audio mky-disabled">' + '<img id="mky-bubble-audio-play-button-' + _messageId + '" style="display:block;" onclick="monkeyUI.playAudioBubble(' + _messageId + ');" class="mky-bubble-audio-button mky-bubble-audio-button-' + _messageId + ' mky-bubble-audio-play-button" src="../images/PlayBubble.png">' + '<img id="mky-bubble-audio-pause-button-' + _messageId + '" onclick="monkeyUI.pauseAudioBubble(' + _messageId + ');" class="mky-bubble-audio-button mky-bubble-audio-button-' + _messageId + '" src="../images/PauseBubble.png">' + '<input id="bubble-audio-player-' + _messageId + '" class="knob second" data-width="100" data-displayPrevious=true value="0">' + '<div class="mky-bubble-audio-timer"><span id="mky-minutesBubble' + _messageId + '">00</span><span>:</span><span id="mky-secondsBubble' + _messageId + '">00</span></div>' + '</div>' + '<audio id="audio_' + _messageId + '" preload="auto" style="display:none;" controls="" src="' + _dataSource + '"></audio>';
	            _messagePoint.append(_content);

	            createAudioHandlerBubble(_messageId, Math.round(message.length));
	            audiobuble = document.getElementById("audio_" + _messageId);
	            audiobuble.oncanplay = function () {
	                createAudioHandlerBubble(_messageId, Math.round(audiobuble.duration));
	                setDurationTime(_messageId);
	                $('#' + message.id + ' .mky-content-audio').removeClass('mky-disabled');
	            };
	        } else {
	            var _content = '<audio id="audio_' + message.id + '" preload="auto" controls="" src="' + _dataSource + '"></audio>';
	            _messagePoint.append(_content);
	        }

	        scrollToDown();

	        if (message.eph == 1) {
	            updateNotification("Private Audio", _conversationIdHandling);
	        } else {
	            updateNotification("Audio", _conversationIdHandling);
	        }
	    };

	    this.drawFileMessageBubble = function (message, conversationId, isGroupChat, status) {
	        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
	        var _conversationIdHandling = getConversationIdHandling(conversationId);
	        var _fileName = message.text;
	        var _dataSource = message.dataSource != undefined ? message.dataSource : '';

	        $('#mky-chat-timeline-conversation-' + _conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
	        var _classTypeBubble = _isOutgoing ? 'mky-bubble-file-out' : 'mky-bubble-file-in';
	        var _messagePoint = $('#' + message.id);
	        _messagePoint.addClass('mky-bubble-file');
	        _messagePoint.addClass(_classTypeBubble);
	        var _content = '<div class="mky-content-file">' + '<a class="mky-file-link" href="' + _dataSource + '" download="' + message.filename + '" >';

	        if (message.ext == 'doc' || message.ext == 'docx') {
	            _content += '<div class="mky-file-icon mky-icon-word"></div>';
	        } else if (message.ext == 'pdf') {
	            _content += '<div class="mky-file-icon mky-icon-pdf"></div>';
	        } else if (message.ext == 'xls' || message.ext == 'xlsx') {
	            _content += '<div class="mky-file-icon mky-xls-icon"></div>';
	        } else {
	            _content += '<div class="mky-file-icon mky-img-icon"></div>';
	        }
	        //_content += '<img class="mky-icon-file-define" src="./images/xls-icon.png" alt="your image" />';
	        //_content += '<img class="mky-icon-file-define" src="./images/ppt-icon.png" alt="your image" />';
	        _content += '<div class="mky-file-detail">' + '<div class="mky-file-name"><span class="mky-ellipsify">' + message.filename + '</span></div>' + '<div class="mky-file-size"><span class="mky-ellipsify">' + message.filesize + ' bytes</span></div>' + '</div>' + '</a>' + '</div>';
	        _messagePoint.append(_content);
	        scrollToDown();

	        if (message.eph == 1) {
	            updateNotification("Private File", _conversationIdHandling);
	        } else {
	            updateNotification("File", _conversationIdHandling);
	        }
	    };

	    this.drawTextMessageBubble_ = function (message, conversationId, status) {
	        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
	        var _conversationIdHandling = getConversationIdHandling(conversationId);

	        var _messageText = findLinks(message.text);
	        var _bubble = '';

	        if (_isOutgoing == 0) {
	            // incoming
	            if (message.eph == 0) {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble mky-bubble-text mky-bubble-text-in mky-bubble-in">' + '<div class="mky-message-detail">';
	                if (conversationId.indexOf("G:") >= 0) {
	                    var _senderName = message.senderName ? message.senderName : 'Unknown';
	                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="mky-message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	                }
	                _bubble += '<span class="mky-message-hour">' + defineTime(message.timestamp * 1000) + '</span>' + '</div>' + '<span class="mky-content-text">' + _messageText + '</span>' + '</div>' + '</div>';
	            } else {
	                var _duration = Math.round(message.length * 0.07);
	                if (_duration < 15) {
	                    _duration = 15;
	                }
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble mky-bubble-text mky-bubble-text-in mky-bubble-in mky-bubble-private" onclick="showPrivateTextMessage(\'' + message.id + '\',\'' + message.senderId + '\',\'' + _duration + '\')">' + '<div class="mky-message-detail">';
	                if (conversationId.indexOf("G:") >= 0) {
	                    var _senderName = message.senderName ? message.senderName : 'Unknown';
	                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="mky-message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	                }
	                _bubble += '<div class="mky-message-content-timer">' + '<i class="fa fa-clock-o"></i>' + '<span class="mky-message-timer"> ' + defineTimer(_duration) + '</span>' + '</div>' + '</div>' + '<span class="mky-content-text">Click to read</span>' + '<div class="mky-message-code">' + message.encryptedText + '</div>' + '</div>' + '</div>';
	            }
	        } else if (_isOutgoing == 1) {
	            // outgoing
	            if (message.eph == 0) {
	                var _status;
	                switch (status) {
	                    case 0:
	                        _status = 'mky-status-load';
	                        break;
	                    case 51:
	                        _status = 'mky-status-sent';
	                        break;
	                    case 52:
	                        _status = 'mky-status-read';
	                        break;
	                    default:
	                        break;
	                }

	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble mky-bubble-text mky-bubble-text-out mky-bubble-out' + (status == 0 ? 'mky-sending' : '') + '">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status ' + _status + '">';
	                if (status != 0) {
	                    _bubble += '<i class="fa fa-check"></i>';
	                }
	                _bubble += '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="mky-content-text">' + _messageText + '</span>' + '</div>' + '</div>';
	            } else {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble mky-bubble-text mky-bubble-text-out mky-bubble-out' + (status == 0 ? 'mky-sending' : '') + '">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status ' + _status + '">';
	                if (status != 0) {
	                    _bubble += '<i class="fa fa-check"></i>';
	                }
	                _bubble += '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="mky-content-text">Private Message</span>' + '</div>' + '</div>';
	            }
	        }
	        $('#mky-chat-timeline-conversation-' + _conversationIdHandling).append(_bubble);

	        scrollToDown();

	        if (message.eph == 1) {
	            updateNotification("Private Message", _conversationIdHandling);
	        } else {
	            updateNotification(message.text, _conversationIdHandling);
	        }
	    };

	    this.drawImageMessageBubble_ = function (message, conversationId, status) {
	        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
	        var _conversationIdHandling = getConversationIdHandling(conversationId);

	        var _fileName = message.text;
	        var _dataSource = message.dataSource != undefined ? message.dataSource : 'images/ukn.png';
	        var _bubble = '';

	        if (_isOutgoing == 0) {
	            // incoming
	            if (message.eph == 0) {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-image-in mky-bubble-in">' + '<div class="mky-message-detail">';
	                if (conversationId.indexOf("G:") >= 0) {
	                    var _senderName = message.senderName ? message.senderName : 'Unknown';
	                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="mky-message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	                }
	                _bubble += '<span class="mky-message-hour">' + defineTime(message.timestamp * 1000) + '</span>' + '</div>' + '<div class="mky-content-image" onclick="monkeyUI.showViewer(\'' + message.id + '\',\'' + _fileName + '\')">' + '<img src=' + _dataSource + '>' + '</div>' + '</div>' + '</div>';
	            } else {
	                var _duration = 15;

	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-image-private-in mky-bubble-in mky-bubble-private" onclick="showPrivateViewer(\'' + message.id + '\',\'' + message.senderId + '\',\'' + _duration + '\',\'' + message.cmpr + '\',\'' + message.encr + '\')">' + '<div class="mky-message-detail">';
	                if (conversationId.indexOf("G\\:") >= 0) {
	                    var _conversation = conversations[message.recipientId];
	                    var _classUnknown = users[message.senderId].id == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="mky-message-user-name ' + _classUnknown + '" style="color: #' + colorUsers[_conversation.members.indexOf(message.senderId)] + '">' + users[message.senderId].name + '</span>';
	                }
	                _bubble += '<div class="mky-message-content-timer">' + '<i class="fa fa-clock-o"></i>' + '<span class="mky-message-timer"> ' + defineTimer(_duration) + '</span>' + '</div>' + '</div>' + '<div class="mky-message-icon-define mky-icon-image"></div>' + '<span class="mky-content-text">Click to view</span>' + '<div class="mky-message-code">' + message.encryptedText + '</div>' + '</div>' + '</div>';
	            }
	        } else if (_isOutgoing == 1) {
	            // outgoing
	            if (message.eph == 0) {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-image-out mky-bubble-out">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status mky-status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<div class="mky-content-image" onclick="monkeyUI.showViewer(\'' + message.id + '\',\'' + _fileName + '\')">' + '<img src="' + _dataSource + '">' + '</div>' + '</div>' + '</div>';
	            } else {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-text-out mky-bubble-out mky-sending">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status mky-status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="mky-content-text">Private Image</span>' + '</div>' + '</div>';
	            }
	        }
	        $('#mky-chat-timeline-conversation-' + _conversationIdHandling).append(_bubble);
	        scrollToDown();

	        if (message.eph == 1) {
	            updateNotification("Private Image", _conversationIdHandling);
	        } else {
	            updateNotification("Image", _conversationIdHandling);
	        }
	    };

	    this.drawAudioMessageBubble_ = function (message, conversationId, status, messageOldId) {
	        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
	        var _conversationIdHandling = getConversationIdHandling(conversationId);

	        var _dataSource = message.dataSource;
	        var _bubble = '';
	        if (_isOutgoing == 0) {
	            // incoming
	            if (message.eph == 0) {

	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-audio-in mky-bubble-in">' + '<div class="mky-message-detail">';
	                if (conversationId.indexOf("G:") >= 0) {
	                    var _senderName = message.senderName ? message.senderName : 'Unknown';
	                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="mky-message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	                }
	                _bubble += '<span class="mky-message-hour">' + defineTime(message.timestamp * 1000) + '</span>' + '</div>' + '<div class="mky-content-audio">' + '<img id="mky-player-play-button' + message.id + '" style="display:block;" onclick="monkeyUI.playAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + ' mky-bubble-audio-play-button" src="../images/PlayBubble.png">' + '<img id="mky-bubble-audio-pause-button' + message.id + '" onclick="monkeyUI.pauseAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + '" src="../images/PauseBubble.png">' + '<input id="bubble-audio-player-' + message.id + '" class="knob second" data-width="100" data-displayPrevious=true value="0">' + '<div class="mky-bubble-audio-timer"><span id="mky-minutesBubble' + message.id + '">' + ("0" + parseInt(message.length / 60)).slice(-2) + '</span><span>:</span><span id="mky-secondsBubble' + message.id + '">' + ("0" + message.length % 60).slice(-2) + '</span></div>' + '</div>';
	                var _dataSource = message.dataSource != undefined ? message.dataSource : '';
	                _bubble += '<audio id="audio_' + message.id + '" preload="auto" style="display:none;" controls="" src="' + _dataSource + '"></audio>' + '</div>' + '</div>';
	            } else {
	                var _duration = Math.round(message.length + message.length * 0.25);
	                if (_duration < 15) {
	                    _duration = 15;
	                }

	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-audio-private-in mky-bubble-in mky-bubble-private" onclick="showPrivateAudioMessage(\'' + message.id + '\',\'' + message.senderId + '\',\'' + _duration + '\',\'' + message.cmpr + '\',\'' + message.encr + '\')">' + '<div class="mky-message-detail">';
	                if (conversationId.indexOf("G\\:") >= 0) {
	                    var _conversation = conversations[message.recipientId];
	                    var _classUnknown = users[message.senderId].id == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="mky-message-user-name ' + _classUnknown + '" style="color: #' + colorUsers[_conversation.members.indexOf(message.senderId)] + '">' + users[message.senderId].name + '</span>';
	                }
	                _bubble += '<div class="mky-message-content-timer">' + '<i class="fa fa-clock-o"></i>' + '<span class="mky-message-timer"> ' + defineTimer(_duration) + '</span>' + '</div>' + '</div>' + '<div class="mky-message-icon-define mky-icon-audio"></div>' + '<span class="mky-content-text">Click to listen</span>' + '<div class="mky-message-code">' + message.encryptedText + '</div>' + '</div>' + '</div>';
	            }
	        } else if (_isOutgoing == 1) {
	            // outgoing
	            if (message.eph == 0) {
	                if (messageOldId == undefined) {
	                    _bubble += '<div class="mky-message-line">';
	                }
	                _bubble += '<div id="' + message.id + '" class="mky-bubble-audio-out mky-bubble-out">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status mky-status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<div class="mky-content-audio">' + '<img id="mky-player-play-button' + message.id + '" style="display:block;" onclick="monkeyUI.playAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + ' mky-bubble-audio-play-button" src="../images/PlayBubble.png">' + '<img id="mky-bubble-audio-pause-button' + message.id + '" onclick="monkeyUI.pauseAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + '" src="../images/PauseBubble.png">' + '<input id="bubble-audio-player-' + message.id + '" class="knob second" data-width="100" data-displayPrevious=true value="0">' + '<div class="mky-bubble-audio-timer"><span id="mky-minutesBubble' + message.id + '">00</span><span>:</span><span id="mky-secondsBubble' + message.id + '">00</span></div>' + '</div>' + '<audio id="audio_' + message.id + '" preload="auto" style="display:none;" controls="" src="' + _dataSource + '"></audio>' + '</div>';
	                if (messageOldId == undefined) {
	                    _bubble += '</div>';
	                }
	            } else {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-text-out mky-bubble-out mky-sending">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status mky-status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="mky-content-text">Private audio</span>' + '</div>' + '</div>';
	            }
	        }

	        if (messageOldId != undefined) {
	            $('#' + messageOldId).parent().html(_bubble);
	        } else {
	            $('#mky-chat-timeline-conversation-' + _conversationIdHandling).append(_bubble);
	        }
	        scrollToDown();

	        if (message.eph == 1) {
	            updateNotification("Private Audio", _conversationIdHandling);
	        } else {
	            updateNotification("Audio", _conversationIdHandling);
	        }

	        createAudioHandlerBubble(message.id, Math.round(message.length));

	        if (message.eph == 0) {
	            console.log("audio_" + message.id);
	            audiobuble = document.getElementById("audio_" + message.id);
	            audiobuble.oncanplay = function () {
	                createAudioHandlerBubble(message.id, Math.round(audiobuble.duration));
	                setDurationTime(message.id);
	                $('#' + messageId + ' .mky-content-audio').removeClass('mky-disabled');
	            };
	        }
	    };

	    function drawAudioMessageBubbleTemporal(dataSource, message, duration) {
	        $('#mky-chat-timeline').find('.mky-appear').append(baseBubble(message, 1, false, 0));
	        var _classTypeBubble = 'mky-bubble-audio-out';
	        var _messagePoint = $('#' + message.id);
	        _messagePoint.addClass('mky-bubble-audio');
	        _messagePoint.addClass(_classTypeBubble);

	        var _content = '<div class="mky-content-audio-loading">' + '<div class="mky-double-bounce1"></div>' + '<div class="mky-double-bounce2"></div>' + '</div>';
	        _messagePoint.append(_content);
	        scrollToDown();
	    }

	    this.getMessageUnknown = function () {
	        return $('.user-unknown');
	    };

	    this.updateDataMessageBubble = function (messageId, data) {
	        var messagePoint = $('#' + messageId);
	        if (messagePoint.find('.mky-content-image').length > 0) {
	            messagePoint.find('img').attr('src', data);
	        } else if (messagePoint.find('audio').length > 0) {
	            messagePoint.find('audio').attr('src', data);
	        } else if (messagePoint.find('.mky-content-file').length > 0) {
	            messagePoint.find('.mky-file-link').attr('href', data);
	        }
	    };

	    /***********************************************/
	    /***************** STATE BUBBLE ****************/
	    /***********************************************/

	    this.updateStatusMessageBubble = function (messageOldId, messageNewId, status) {

	        var messagePoint = $('#' + messageOldId);

	        if (messageOldId != messageNewId && messagePoint.length > 0) {
	            messagePoint.attr('id', messageNewId);
	            // var _contentOnClick = messagePoint.find('.mky-button-message-unsend').attr('onclick');
	            // var _conversationId = _contentOnClick.slice(29,_contentOnClick.length - 2);
	            // messagePoint.find('.mky-button-message-unsend').attr({
	            //   onclick: "unsendMessage('"+messageNewId+"','"+_conversationId+"')"
	            // });
	        }
	        messagePoint = $('#' + messageNewId);

	        if (messagePoint.find('.mky-content-image').length > 0) {
	            // image message
	            var _onClickAttribute = messagePoint.find('.mky-content-image').attr('onclick');
	            _onClickAttribute = _onClickAttribute + "";
	            var params = _onClickAttribute.split(',');
	            var _fileName = params[1].substr(1, params[1].length - 3);
	            messagePoint.find('.mky-content-image').attr({
	                onclick: "monkeyUI.showViewer('" + messageNewId + "','" + _fileName + "')"
	            });
	        } else if (messagePoint.find('audio').length > 0) {
	            messagePoint.find('.mky-content-audio').removeClass('mky-disabled');
	        }

	        messagePoint.find('.mky-message-status').removeClass('mky-status-load');
	        messagePoint.find('.mky-message-status').removeClass('mky-status-sent');

	        if (status == 52) {
	            messagePoint.find('.mky-message-status').addClass('mky-status-read');
	        } else if (status == 50 || status == 51) {
	            messagePoint.find('.mky-message-status').addClass('mky-status-sent');
	        }

	        if (messagePoint.find('.fa').length <= 0) {
	            messagePoint.find('.mky-message-status').prepend('<i class="fa fa-check"></i>');
	        }
	    };

	    this.updateStatusReadMessageBubble = function (conversationId) {
	        var _conversationPoint = $('#mky-chat-timeline-conversation-' + conversationId);
	        _conversationPoint.find('.mky-message-status').removeClass('mky-status-sent');
	        _conversationPoint.find('.mky-message-status').addClass('mky-status-read');
	    };

	    this.updateStatusMessageBubbleByTime = function (conversationId, lastDateTime) {
	        var _conversationPoint = $('#mky-chat-timeline-conversation-' + conversationId);
	        var _messageDatetimeTmp;
	        _conversationPoint.find('.mky-bubble-out').each(function () {
	            _messageDatetimeTmp = $(this).find('.mky-message-time').text();
	            if (_messageDatetimeTmp < lastDateTime && $(this).find('.mky-status-read').length == 0) {
	                $(this).find('.mky-message-status').removeClass('mky-status-load');
	                $(this).find('.mky-message-status').removeClass('mky-status-sent');
	                $(this).find('.mky-message-status').addClass('mky-status-read');
	                $(this).find('.mky-message-status').prepend('<i class="fa fa-check"></i>');
	            } else if (_messageDatetimeTmp > lastDateTime && $(this).find('.mky-status-sent').length == 0) {
	                $(this).find('.mky-message-status').removeClass('mky-status-load');
	                $(this).find('.mky-message-status').addClass('mky-status-sent');
	            }
	        });
	    };

	    /***********************************************/
	    /***************** AUDIO PLAYER ****************/
	    /***********************************************/

	    // define duration of bubble audio player
	    function createAudioHandlerBubble(timestamp, duration) {
	        $("#bubble-audio-player-" + timestamp).knob({
	            'min': 0,
	            'max': duration,
	            'angleOffset': -133,
	            'angleArc': 265,
	            'width': 100,
	            'height': 90,
	            'displayInput': false,
	            'skin': 'tron',
	            'fgColor': '#0276a9',
	            'thickness': 0.7,
	            change: function change(value) {}
	        });
	    }

	    this.playAudioBubble = function (messageId) {
	        pauseAllAudio(messageId);
	        $bubblePlayer = $("#bubble-audio-player-" + messageId); //handles the cricle
	        $('.mky-bubble-audio-button-' + messageId).hide();
	        $('#mky-bubble-audio-pause-button-' + messageId).css('display', 'block');
	        minutesBubbleLabel = document.getElementById("mky-minutesBubble" + messageId);
	        secondsBubbleLabel = document.getElementById("mky-secondsBubble" + messageId);
	        audiobuble = document.getElementById("audio_" + messageId);
	        audiobuble.play();
	        playIntervalBubble = setInterval("monkeyUI.updateAnimationBuble()", 1000);
	        audiobuble.addEventListener("ended", function () {
	            setDurationTime(messageId);
	            //this.load();
	            $bubblePlayer.val(0).trigger("change");
	            $('#mky-bubble-audio-play-button-' + messageId).css('display', 'block');
	            $('#mky-bubble-audio-pause-button-' + messageId).css('display', 'none');
	            clearInterval(playIntervalBubble);
	        });
	    };

	    this.updateAnimationBuble = function () {
	        var currentTime = Math.round(audiobuble.currentTime);
	        $bubblePlayer.val(currentTime).trigger("change");
	        secondsBubbleLabel.innerHTML = ("0" + currentTime % 60).slice(-2);
	        minutesBubbleLabel.innerHTML = ("0" + parseInt(currentTime / 60)).slice(-2);
	    };

	    this.pauseAudioBubble = function (timestamp) {
	        $('.mky-bubble-audio-button-' + timestamp).hide();
	        $('#mky-bubble-audio-play-button-' + timestamp).toggle();
	        audiobuble.pause();
	        clearInterval(playIntervalBubble);
	    };

	    function pauseAllAudio(timestamp) {
	        document.addEventListener('play', function (e) {
	            var audios = document.getElementsByTagName('audio');
	            for (var i = 0, len = audios.length; i < len; i++) {
	                if (audios[i] != e.target) {
	                    //console.log(audios[i].id);
	                    audios[i].pause();
	                    $('.mky-bubble-audio-button').hide();
	                    $('.mky-bubble-audio-play-button').show();
	                    $('#mky-bubble-audio-play-button-' + timestamp).hide();
	                    $('#mky-bubble-audio-pause-button-' + timestamp).show();
	                }
	            }
	        }, true);
	    }

	    function setDurationTime(timestamp) {
	        audiobuble = document.getElementById("audio_" + timestamp);
	        var durationTime = Math.round(audiobuble.duration);
	        minutesBubbleLabel = document.getElementById("mky-minutesBubble" + timestamp);
	        secondsBubbleLabel = document.getElementById("mky-secondsBubble" + timestamp);
	        secondsBubbleLabel.innerHTML = ("0" + durationTime % 60).slice(-2);
	        minutesBubbleLabel.innerHTML = ("0" + parseInt(durationTime / 60)).slice(-2);
	    }

	    function setWidgetMax(timestamp) {
	        audiobuble = document.getElementById("audio_" + timestamp);
	        var durationTime = Math.round(audiobuble.duration);

	        max_range_value = document.getElementById("audio_range_" + timestamp);
	        max_range_value.setAttribute("max", ("0" + parseInt(durationTime / 60)).slice(-2));
	    }

	    /***********************************************/
	    /******************** VIEWER *******************/
	    /***********************************************/

	    this.addLoginForm = function (html) {
	        $(this.wrapperIn).append(html);
	    };

	    this.showViewer = function (messageId, fileName) {
	        var _messagePoint = $('#' + messageId);
	        var _file = _messagePoint.find('.mky-content-image img').attr('src');

	        var _html = '<div class="mky-viewer-content">' + '<div class="mky-viewer-toolbar">' + '<button id="mky-button-exit" onclick="monkeyUI.exitViewer()"> X </button>' + '<a href="' + _file + '" download="' + fileName + '" >' + '<button class="mky-button-download" title="Download">Download</button>' + '</a>' +
	        // '<a href="'+_file+'" >'+
	        '<button class="mky-button-download" title="Download" onclick="monkeyUI.printFile()" >Print</button>' +
	        // '</a>'+
	        '</div>' + '<div id="file_viewer_image" class="mky-viewer-image">' + '<img  src="' + _file + '">' + '</div>' + '<div class="mky-brand-app"></div>' + '</div>';

	        $('.mky-wrapper-out').append(_html);
	    };

	    this.printFile = function () {
	        Popup($('#file_viewer_image').html());
	    };

	    function Popup(data) {
	        var mywindow = window.open('', 'my div', 'height=400,width=600');
	        mywindow.document.write('<html><head><title>my div</title>');
	        /*optional stylesheet*/ //mywindow.document.write('<link rel="stylesheet" href="main.css" type="text/css" />');
	        mywindow.document.write('</head><body >');
	        mywindow.document.write(data);
	        mywindow.document.write('</body></html>');

	        mywindow.document.close(); // necessary for IE >= 10
	        mywindow.focus(); // necessary for IE >= 10

	        mywindow.print();
	        mywindow.close();

	        return true;
	    }

	    this.exitViewer = function () {
	        $('.mky-viewer-content').remove();
	    };

	    function generateDataFile() {
	        FileAPI.readAsDataURL(fileCaptured.file, function (evt) {
	            if (evt.type == 'load') {
	                fileCaptured.src = evt.result;
	                $('#mky-button-send-message').click();
	            }
	        });
	    }

	    function showPreviewImage() {
	        // Optional to use: replace with generateDataFile()
	        var image_data = '';
	        FileAPI.readAsDataURL(fileCaptured.file, function (evt) {
	            if (evt.type == 'load') {
	                fileCaptured.src = evt.result;
	                var html = '<div id="mky-preview-image">' + '<div class="mky-preview-head">' + '<div class="mky-preview-title">Preview</div> ' + '<div id="mky-preview-close" class="mky-preview-close" onclick="monkeyUI.closeImagePreview(this)">X</div>' + '</div>' + '<div class="mky-preview-container">' + '<img id="mky-preview-image-pic" src="' + fileCaptured.src + '">' + '</div>' + '</div>';
	            }
	        });
	    }

	    this.closeImagePreview = function (obj) {
	        hideChatInputFile();
	        $(obj).parent().parent().remove();
	        $('#attach-file').val('');
	    };

	    function scrollToDown(container) {
	        $('#mky-chat-timeline').animate({ scrollTop: 100000000 }, 400);
	    }

	    /***********************************************/
	    /***************** RECORD AUDIO ****************/
	    /***********************************************/

	    // starts the library to record audio
	    function startRecordAudio() {
	        if (mediaRecorder == null) {
	            $('#mky-button-send-ephemeral').addClass('enable_timer');
	            if (!micActivated) {
	                navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
	                micActivated = !micActivated;
	            } else {
	                onMediaSuccess(mediaConstraints);
	                pauseAllAudio('');
	            }
	        }
	    }

	    // if the browser can record, this is executed
	    function onMediaSuccess(stream) {
	        //default settings to record
	        typeMessageToSend = 1;
	        mediaRecorder = new MediaStreamRecorder(stream);
	        mediaRecorder.mimeType = 'audio/wav';
	        mediaRecorder.audioChannels = 1;
	        // createJqueryMeter(30000);

	        mediaRecorder.ondataavailable = function (blob) {
	            // $('#jqmeter-audio').remove();
	            //clearAudioRecordTimer();
	            var timestamp = new Date().getTime();
	            audioCaptured.blob = blob; //need to save the raw data
	            audioCaptured.src = URL.createObjectURL(blob); // need to save de URLdata
	        };

	        refreshIntervalId = setInterval(setTime, 1000); //start recording timer
	        mediaRecorder.start(99999999999); //starts recording
	    }

	    function onMediaError(e) {
	        console.error('media error', e);
	    }

	    function setTime() {
	        console.log(totalSeconds);
	        ++totalSeconds;
	        secondsLabel.innerHTML = ("0" + totalSeconds % 60).slice(-2);
	        minutesLabel.innerHTML = ("0" + parseInt(totalSeconds / 60)).slice(-2);
	    }

	    // pause audio
	    function pauseAudioPrev() {
	        globalAudioPreview.pause();
	        clearInterval(refreshIntervalAudio);
	    }

	    function buildAudio() {
	        if (globalAudioPreview != null) pauseAudioPrev();

	        audioMessageOldId = Math.round(new Date().getTime() / 1000 * -1);
	        drawAudioMessageBubbleTemporal(audioCaptured.src, { id: audioMessageOldId, timestamp: Math.round(new Date().getTime() / 1000) }, audioCaptured.duration);
	        disabledAudioButton(true);
	        FileAPI.readAsArrayBuffer(audioCaptured.blob, function (evt) {
	            if (evt.type == 'load') {
	                buildMP3('audio_.wav', evt.result);
	            } else if (evt.type == 'progress') {
	                var pr = evt.loaded / evt.total * 100;
	            } else {/* Error*/}
	        });
	    }

	    function buildMP3(fileName, fileBuffer) {
	        if (ffmpegRunning) {
	            ffmpegWorker.terminate();
	            ffmpegWorker = getFFMPEGWorker();
	        }

	        ffmpegRunning = true;
	        var fileNameExt = fileName.substr(fileName.lastIndexOf('.') + 1);
	        var outFileName = fileName.substr(0, fileName.lastIndexOf('.')) + "." + "mp3";
	        var _arguments = [];
	        _arguments.push("-i");
	        _arguments.push(fileName);
	        _arguments.push("-b:a");
	        _arguments.push('128k');
	        _arguments.push("-acodec");
	        _arguments.push("libmp3lame");
	        _arguments.push("out.mp3");

	        ffmpegWorker.postMessage({
	            type: "command",
	            arguments: _arguments,
	            files: [{
	                "name": fileName,
	                "buffer": fileBuffer
	            }]
	        });
	    }

	    function getFFMPEGWorker() {

	        var response = "importScripts('https://cdn.criptext.com/MonkeyUI/scripts/ffmpeg.js');function print(text) {postMessage({'type' : 'stdout', 'data' : text});}function printErr(text) {postMessage({'type' :'stderr', 'data' : text});}var now = Date.now; onmessage = function(event) { var message = event.data; if (message.type === \"command\") { var Module = { print: print, printErr: print, files: message.files || [], arguments: message.arguments || [], TOTAL_MEMORY: message.TOTAL_MEMORY || false }; postMessage({ 'type' : 'start', 'data' : Module.arguments.join(\" \")}); postMessage({ 'type' : 'stdout', 'data' : 'Received command: ' + Module.arguments.join(\" \") + ((Module.TOTAL_MEMORY) ? \".  Processing with \" + Module.TOTAL_MEMORY + \" bits.\" : \"\")}); var time = now(); var result = ffmpeg_run(Module); var totalTime = now() - time; postMessage({'type' : 'stdout', 'data' : 'Finished processing (took ' + totalTime + 'ms)'}); postMessage({ 'type' : 'done', 'data' : result, 'time' : totalTime});}};postMessage({'type' : 'ready'});";
	        window.URL = window.URL || window.webkitURL;
	        var blobWorker;
	        try {
	            blobWorker = new Blob([response], { type: 'application/javascript' });
	        } catch (e) {
	            // Backwards-compatibility
	            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
	            blob = new BlobBuilder();
	            blob.append(response);
	            blob = blob.getBlob();
	        }

	        var ffmpegWorker = new Worker(URL.createObjectURL(blobWorker));
	        ffmpegWorker.onmessage = function (event) {
	            var message = event.data;

	            if (message.type === "ready" && window.File && window.FileList && window.FileReader) {} else if (message.type == "stdout") {
	                // console.log(message.data);
	            } else if (message.type == "stderr") {} else if (message.type == "done") {
	                    var code = message.data.code;
	                    var outFileNames = Object.keys(message.data.outputFiles);

	                    if (code == 0 && outFileNames.length) {

	                        var outFileName = outFileNames[0];
	                        var outFileBuffer = message.data.outputFiles[outFileName];
	                        var mp3Blob = new Blob([outFileBuffer]);
	                        // var src = window.URL.createObjectURL(mp3Blob);
	                        readData(mp3Blob);
	                    } else {
	                        console.log('hubo un error');
	                    }
	                }
	        };
	        return ffmpegWorker;
	    }

	    function readData(mp3Blob) {
	        // read mp3 audio
	        FileAPI.readAsDataURL(mp3Blob, function (evt) {
	            if (evt.type == 'load') {
	                disabledAudioButton(false);
	                //var dataURL = evt.result;
	                var _src = evt.result;
	                var _dataSplit = _src.split(',');
	                var _data = _dataSplit[1];
	                audioCaptured.src = 'data:audio/mpeg;base64,' + _data;
	                audioCaptured.monkeyFileType = 1;
	                audioCaptured.oldId = audioMessageOldId;
	                audioCaptured.type = 'audio/mpeg';
	                $(monkeyUI).trigger('audioMessage', audioCaptured);
	            } else if (evt.type == 'progress') {
	                var pr = evt.loaded / evt.total * 100;
	            } else {/*Error*/}
	        });
	    }

	    /***********************************************/
	    /********************* UTIL ********************/
	    /***********************************************/

	    function checkExtention(files) {
	        var ft = 0; //fileType by extention

	        var doc = ["doc", "docx"]; //1
	        var pdf = ["pdf"]; //2
	        var xls = ["xls", "xlsx"]; //3
	        var ppt = ["ppt", "pptx"]; //4
	        var img = ["jpe", "jpeg", "jpg", "png", "gif"]; //6

	        var extension = getExtention(files);

	        if (doc.indexOf(extension) > -1) {
	            ft = 1;
	        }
	        if (xls.indexOf(extension) > -1) {
	            ft = 3;
	        }
	        if (pdf.indexOf(extension) > -1) {
	            ft = 2;
	        }
	        if (ppt.indexOf(extension) > -1) {
	            ft = 4;
	        }
	        if (img.indexOf(extension) > -1) {
	            ft = 6;
	        }

	        return ft;
	    }

	    function getExtention(files) {
	        var arr = files.name.split('.');
	        var extension = arr[arr.length - 1];

	        return extension;
	    }

	    function findLinks(message) {
	        // check text to find urls and make them links
	        if (message == undefined) {
	            return '';
	        }
	        var _exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
	        message = message.replace(_exp, "<a href='$1' target='_blank'>$1</a>");
	        var _replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	        message = message.replace(_replacePattern2, '$1<a href="http://$2" target="_blank" >$2</a>');
	        var _replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
	        message = message.replace(_replacePattern3, '<a href="mailto:$1" target="_blank">$1</a>');

	        return message;
	    }
	}();

	function defineTimer(duration) {
	    var _minutes;
	    var _seconds;
	    var _result;

	    _minutes = Math.floor(duration / 60);
	    _seconds = duration - _minutes * 60;
	    _result = _minutes + ':' + _seconds;

	    return _result;
	}

	function defineTime(time) {
	    var _d = new Date(+time);
	    var nhour = _d.getHours(),
	        nmin = _d.getMinutes(),
	        ap;
	    if (nhour == 0) {
	        ap = " AM";nhour = 12;
	    } else if (nhour < 12) {
	        ap = " AM";
	    } else if (nhour == 12) {
	        ap = " PM";
	    } else if (nhour > 12) {
	        ap = " PM";nhour -= 12;
	    }

	    return ("0" + nhour).slice(-2) + ":" + ("0" + nmin).slice(-2) + ap + "";
	}

	function getConversationIdHandling(conversationId) {
	    var result;
	    if (conversationId.indexOf("G:") >= 0) {
	        // group message
	        result = conversationId.slice(0, 1) + "\\" + conversationId.slice(1);
	    } else {
	        result = conversationId;
	    }
	    return result;
	}

	window.monkeyUI = monkeyUI;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	   * A representation of a user.
	   *
	   * @class User
	   * @constructor
	   * @param {int}       id To identify the user.
	   * @param {String}    monkeyId To identify the user on monkey
	   * @param {String}    name A name to be displayed as the author of the message.
	   */

	module.exports = function MUIUser(id, monkeyId, name, privacy, urlAvatar, isFriend) {
	    _classCallCheck(this, MUIUser);

	    if (id != undefined) {
	        this.id = id;
	    }
	    this.monkeyId = monkeyId;
	    this.name = name;
	    this.privacy = privacy;
	    this.urlAvatar = urlAvatar;
	    this.isFriend = isFriend;
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	   * A representation of a conversation.
	   *
	   * @class Conversation
	   * @constructor
	   * @param {int}       id To identify the conversation.
	   * @param {Object}    info A data about group conversation
	   */

	module.exports = function MUIConversation(id, name, urlAvatar, members) {
	    _classCallCheck(this, MUIConversation);

	    this.id = id;
	    this.lastMessage = null;
	    this.unreadMessageCount = 0;
	    this.name = name;
	    this.urlAvatar = urlAvatar;
	    this.members = members;
	    this.setLastOpenMe = function (lastOpenMe) {
	        this.lastOpenMe = lastOpenMe;
	    };
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	   * A representation of a message.
	   *
	   * @class Message
	   * @constructor
	   * @param {MOKMessage} mokMessage recevived by Monkey.
	   */

	module.exports = function () {
	    function MUIMessage(mokMessage) {
	        _classCallCheck(this, MUIMessage);

	        this.id = mokMessage.id;
	        this.protocolType = mokMessage.protocolType;
	        this.senderId = mokMessage.senderId;
	        this.timestamp = mokMessage.datetimeCreation;
	        //this.encryptedText = mokMessage.encryptedText;
	        this.text = mokMessage.text;
	        this.recipientId = mokMessage.recipientId;

	        if (mokMessage.params) {
	            this.length = mokMessage.params.length;
	            this.eph = mokMessage.params.eph == undefined ? 0 : mokMessage.params.eph;
	        } else {
	            this.length = 15;
	        }

	        this.typeFile = mokMessage.props.file_type;
	        this.encr = mokMessage.props.encr;
	        this.cmpr = mokMessage.props.cmpr;
	        this.ext = mokMessage.props.ext;
	        this.filesize = mokMessage.props.size;
	        this.filename = mokMessage.props.filename;
	        this.mimetype = mokMessage.props.mime_type;

	        this.senderName = undefined;
	        this.senderColor = undefined;

	        this.setDataSource = function (dataSource) {
	            this.dataSource = dataSource;
	        };

	        this.setFilename = function (filename) {
	            this.filename = filename;
	        };

	        this.isEncrypted = function () {
	            return this.encr == 1 ? true : false;
	        };

	        this.isCompressed = function () {
	            return this.cmpr != undefined ? true : false;
	        };

	        this.compressionMethod = function () {
	            return this.cmpr;
	        };
	    }

	    _createClass(MUIMessage, [{
	        key: "setSenderName",
	        value: function setSenderName(senderName) {
	            this.senderName = senderName;
	        }
	    }, {
	        key: "setSenderColor",
	        value: function setSenderColor(senderColor) {
	            this.senderColor = senderColor;
	        }
	    }]);

	    return MUIMessage;
	}();

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/*!jQuery Knob*/
	/**
	 * Downward compatible, touchable dial
	 *
	 * Version: 1.2.12
	 * Requires: jQuery v1.7+
	 *
	 * Copyright (c) 2012 Anthony Terrien
	 * Under MIT License (http://www.opensource.org/licenses/mit-license.php)
	 *
	 * Thanks to vor, eskimoblood, spiffistan, FabrizioC
	 */
	(function (factory) {
	    if (( false ? 'undefined' : _typeof(exports)) === 'object') {
	        // CommonJS
	        module.exports = factory(__webpack_require__(1));
	    } else if (true) {
	        // AMD. Register as an anonymous module.
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else {
	        // Browser globals
	        factory(jQuery);
	    }
	})(function ($) {

	    /**
	     * Kontrol library
	     */
	    "use strict";

	    /**
	     * Definition of globals and core
	     */

	    var k = {},
	        // kontrol
	    max = Math.max,
	        min = Math.min;

	    k.c = {};
	    k.c.d = $(document);
	    k.c.t = function (e) {
	        return e.originalEvent.touches.length - 1;
	    };

	    /**
	     * Kontrol Object
	     *
	     * Definition of an abstract UI control
	     *
	     * Each concrete component must call this one.
	     * <code>
	     * k.o.call(this);
	     * </code>
	     */
	    k.o = function () {
	        var s = this;

	        this.o = null; // array of options
	        this.$ = null; // jQuery wrapped element
	        this.i = null; // mixed HTMLInputElement or array of HTMLInputElement
	        this.g = null; // deprecated 2D graphics context for 'pre-rendering'
	        this.v = null; // value ; mixed array or integer
	        this.cv = null; // change value ; not commited value
	        this.x = 0; // canvas x position
	        this.y = 0; // canvas y position
	        this.w = 0; // canvas width
	        this.h = 0; // canvas height
	        this.$c = null; // jQuery canvas element
	        this.c = null; // rendered canvas context
	        this.t = 0; // touches index
	        this.isInit = false;
	        this.fgColor = null; // main color
	        this.pColor = null; // previous color
	        this.dH = null; // draw hook
	        this.cH = null; // change hook
	        this.eH = null; // cancel hook
	        this.rH = null; // release hook
	        this.scale = 1; // scale factor
	        this.relative = false;
	        this.relativeWidth = false;
	        this.relativeHeight = false;
	        this.$div = null; // component div

	        this.run = function () {
	            var cf = function cf(e, conf) {
	                var k;
	                for (k in conf) {
	                    s.o[k] = conf[k];
	                }
	                s._carve().init();
	                s._configure()._draw();
	            };

	            if (this.$.data('kontroled')) return;
	            this.$.data('kontroled', true);

	            this.extend();
	            this.o = $.extend({
	                // Config
	                min: this.$.data('min') !== undefined ? this.$.data('min') : 0,
	                max: this.$.data('max') !== undefined ? this.$.data('max') : 100,
	                stopper: true,
	                readOnly: this.$.data('readonly') || this.$.attr('readonly') === 'readonly',

	                // UI
	                cursor: this.$.data('cursor') === true && 30 || this.$.data('cursor') || 0,
	                thickness: this.$.data('thickness') && Math.max(Math.min(this.$.data('thickness'), 1), 0.01) || 0.35,
	                lineCap: this.$.data('linecap') || 'butt',
	                width: this.$.data('width') || 200,
	                height: this.$.data('height') || 200,
	                displayInput: this.$.data('displayinput') == null || this.$.data('displayinput'),
	                displayPrevious: this.$.data('displayprevious'),
	                fgColor: this.$.data('fgcolor') || '#87CEEB',
	                inputColor: this.$.data('inputcolor'),
	                font: this.$.data('font') || 'Arial',
	                fontWeight: this.$.data('font-weight') || 'bold',
	                inline: false,
	                step: this.$.data('step') || 1,
	                rotation: this.$.data('rotation'),

	                // Hooks
	                draw: null, // function () {}
	                change: null, // function (value) {}
	                cancel: null, // function () {}
	                release: null, // function (value) {}

	                // Output formatting, allows to add unit: %, ms ...
	                format: function format(v) {
	                    return v;
	                },
	                parse: function parse(v) {
	                    return parseFloat(v);
	                }
	            }, this.o);

	            // finalize options
	            this.o.flip = this.o.rotation === 'anticlockwise' || this.o.rotation === 'acw';
	            if (!this.o.inputColor) {
	                this.o.inputColor = this.o.fgColor;
	            }

	            // routing value
	            if (this.$.is('fieldset')) {

	                // fieldset = array of integer
	                this.v = {};
	                this.i = this.$.find('input');
	                this.i.each(function (k) {
	                    var $this = $(this);
	                    s.i[k] = $this;
	                    s.v[k] = s.o.parse($this.val());

	                    $this.bind('change blur', function () {
	                        var val = {};
	                        val[k] = $this.val();
	                        s.val(s._validate(val));
	                    });
	                });
	                this.$.find('legend').remove();
	            } else {

	                // input = integer
	                this.i = this.$;
	                this.v = this.o.parse(this.$.val());
	                this.v === '' && (this.v = this.o.min);
	                this.$.bind('change blur', function () {
	                    s.val(s._validate(s.o.parse(s.$.val())));
	                });
	            }

	            !this.o.displayInput && this.$.hide();

	            // adds needed DOM elements (canvas, div)
	            this.$c = $(document.createElement('canvas')).attr({
	                width: this.o.width,
	                height: this.o.height
	            });

	            // wraps all elements in a div
	            // add to DOM before Canvas init is triggered
	            this.$div = $('<div style="' + (this.o.inline ? 'display:inline;' : '') + 'width:' + this.o.width + 'px;height:' + this.o.height + 'px;' + '"></div>');

	            this.$.wrap(this.$div).before(this.$c);
	            this.$div = this.$.parent();

	            if (typeof G_vmlCanvasManager !== 'undefined') {
	                G_vmlCanvasManager.initElement(this.$c[0]);
	            }

	            this.c = this.$c[0].getContext ? this.$c[0].getContext('2d') : null;

	            if (!this.c) {
	                throw {
	                    name: "CanvasNotSupportedException",
	                    message: "Canvas not supported. Please use excanvas on IE8.0.",
	                    toString: function toString() {
	                        return this.name + ": " + this.message;
	                    }
	                };
	            }

	            // hdpi support
	            this.scale = (window.devicePixelRatio || 1) / (this.c.webkitBackingStorePixelRatio || this.c.mozBackingStorePixelRatio || this.c.msBackingStorePixelRatio || this.c.oBackingStorePixelRatio || this.c.backingStorePixelRatio || 1);

	            // detects relative width / height
	            this.relativeWidth = this.o.width % 1 !== 0 && this.o.width.indexOf('%');
	            this.relativeHeight = this.o.height % 1 !== 0 && this.o.height.indexOf('%');
	            this.relative = this.relativeWidth || this.relativeHeight;

	            // computes size and carves the component
	            this._carve();

	            // prepares props for transaction
	            if (this.v instanceof Object) {
	                this.cv = {};
	                this.copy(this.v, this.cv);
	            } else {
	                this.cv = this.v;
	            }

	            // binds configure event
	            this.$.bind("configure", cf).parent().bind("configure", cf);

	            // finalize init
	            this._listen()._configure()._xy().init();

	            this.isInit = true;

	            this.$.val(this.o.format(this.v));
	            this._draw();

	            return this;
	        };

	        this._carve = function () {
	            if (this.relative) {
	                var w = this.relativeWidth ? this.$div.parent().width() * parseInt(this.o.width) / 100 : this.$div.parent().width(),
	                    h = this.relativeHeight ? this.$div.parent().height() * parseInt(this.o.height) / 100 : this.$div.parent().height();

	                // apply relative
	                this.w = this.h = Math.min(w, h);
	            } else {
	                this.w = this.o.width;
	                this.h = this.o.height;
	            }

	            // finalize div
	            this.$div.css({
	                'width': this.w + 'px',
	                'height': this.h + 'px'
	            });

	            // finalize canvas with computed width
	            this.$c.attr({
	                width: this.w,
	                height: this.h
	            });

	            // scaling
	            if (this.scale !== 1) {
	                this.$c[0].width = this.$c[0].width * this.scale;
	                this.$c[0].height = this.$c[0].height * this.scale;
	                this.$c.width(this.w);
	                this.$c.height(this.h);
	            }

	            return this;
	        };

	        this._draw = function () {

	            // canvas pre-rendering
	            var d = true;

	            s.g = s.c;

	            s.clear();

	            s.dH && (d = s.dH());

	            d !== false && s.draw();
	        };

	        this._touch = function (e) {
	            var touchMove = function touchMove(e) {
	                var v = s.xy2val(e.originalEvent.touches[s.t].pageX, e.originalEvent.touches[s.t].pageY);

	                if (v == s.cv) return;

	                if (s.cH && s.cH(v) === false) return;

	                s.change(s._validate(v));
	                s._draw();
	            };

	            // get touches index
	            this.t = k.c.t(e);

	            // First touch
	            touchMove(e);

	            // Touch events listeners
	            k.c.d.bind("touchmove.k", touchMove).bind("touchend.k", function () {
	                k.c.d.unbind('touchmove.k touchend.k');
	                s.val(s.cv);
	            });

	            return this;
	        };

	        this._mouse = function (e) {
	            var mouseMove = function mouseMove(e) {
	                var v = s.xy2val(e.pageX, e.pageY);

	                if (v == s.cv) return;

	                if (s.cH && s.cH(v) === false) return;

	                s.change(s._validate(v));
	                s._draw();
	            };

	            // First click
	            mouseMove(e);

	            // Mouse events listeners
	            k.c.d.bind("mousemove.k", mouseMove).bind(
	            // Escape key cancel current change
	            "keyup.k", function (e) {
	                if (e.keyCode === 27) {
	                    k.c.d.unbind("mouseup.k mousemove.k keyup.k");

	                    if (s.eH && s.eH() === false) return;

	                    s.cancel();
	                }
	            }).bind("mouseup.k", function (e) {
	                k.c.d.unbind('mousemove.k mouseup.k keyup.k');
	                s.val(s.cv);
	            });

	            return this;
	        };

	        this._xy = function () {
	            var o = this.$c.offset();
	            this.x = o.left;
	            this.y = o.top;

	            return this;
	        };

	        this._listen = function () {
	            if (!this.o.readOnly) {
	                this.$c.bind("mousedown", function (e) {
	                    e.preventDefault();
	                    s._xy()._mouse(e);
	                }).bind("touchstart", function (e) {
	                    e.preventDefault();
	                    s._xy()._touch(e);
	                });

	                this.listen();
	            } else {
	                this.$.attr('readonly', 'readonly');
	            }

	            if (this.relative) {
	                $(window).resize(function () {
	                    s._carve().init();
	                    s._draw();
	                });
	            }

	            return this;
	        };

	        this._configure = function () {

	            // Hooks
	            if (this.o.draw) this.dH = this.o.draw;
	            if (this.o.change) this.cH = this.o.change;
	            if (this.o.cancel) this.eH = this.o.cancel;
	            if (this.o.release) this.rH = this.o.release;

	            if (this.o.displayPrevious) {
	                this.pColor = this.h2rgba(this.o.fgColor, "0.4");
	                this.fgColor = this.h2rgba(this.o.fgColor, "0.6");
	            } else {
	                this.fgColor = this.o.fgColor;
	            }

	            return this;
	        };

	        this._clear = function () {
	            this.$c[0].width = this.$c[0].width;
	        };

	        this._validate = function (v) {
	            var val = ~ ~((v < 0 ? -0.5 : 0.5) + v / this.o.step) * this.o.step;
	            return Math.round(val * 100) / 100;
	        };

	        // Abstract methods
	        this.listen = function () {}; // on start, one time
	        this.extend = function () {}; // each time configure triggered
	        this.init = function () {}; // each time configure triggered
	        this.change = function (v) {}; // on change
	        this.val = function (v) {}; // on release
	        this.xy2val = function (x, y) {}; //
	        this.draw = function () {}; // on change / on release
	        this.clear = function () {
	            this._clear();
	        };

	        // Utils
	        this.h2rgba = function (h, a) {
	            var rgb;
	            h = h.substring(1, 7);
	            rgb = [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];

	            return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
	        };

	        this.copy = function (f, t) {
	            for (var i in f) {
	                t[i] = f[i];
	            }
	        };
	    };

	    /**
	     * k.Dial
	     */
	    k.Dial = function () {
	        k.o.call(this);

	        this.startAngle = null;
	        this.xy = null;
	        this.radius = null;
	        this.lineWidth = null;
	        this.cursorExt = null;
	        this.w2 = null;
	        this.PI2 = 2 * Math.PI;

	        this.extend = function () {
	            this.o = $.extend({
	                bgColor: this.$.data('bgcolor') || '#EEEEEE',
	                angleOffset: this.$.data('angleoffset') || 0,
	                angleArc: this.$.data('anglearc') || 360,
	                inline: true
	            }, this.o);
	        };

	        this.val = function (v, triggerRelease) {
	            if (null != v) {

	                // reverse format
	                v = this.o.parse(v);

	                if (triggerRelease !== false && v != this.v && this.rH && this.rH(v) === false) {
	                    return;
	                }

	                this.cv = this.o.stopper ? max(min(v, this.o.max), this.o.min) : v;
	                this.v = this.cv;
	                this.$.val(this.o.format(this.v));
	                this._draw();
	            } else {
	                return this.v;
	            }
	        };

	        this.xy2val = function (x, y) {
	            var a, ret;

	            a = Math.atan2(x - (this.x + this.w2), -(y - this.y - this.w2)) - this.angleOffset;

	            if (this.o.flip) {
	                a = this.angleArc - a - this.PI2;
	            }

	            if (this.angleArc != this.PI2 && a < 0 && a > -0.5) {

	                // if isset angleArc option, set to min if .5 under min
	                a = 0;
	            } else if (a < 0) {
	                a += this.PI2;
	            }

	            ret = a * (this.o.max - this.o.min) / this.angleArc + this.o.min;

	            this.o.stopper && (ret = max(min(ret, this.o.max), this.o.min));

	            return ret;
	        };

	        this.listen = function () {

	            // bind MouseWheel
	            var s = this,
	                mwTimerStop,
	                mwTimerRelease,
	                mw = function mw(e) {
	                e.preventDefault();

	                var ori = e.originalEvent,
	                    deltaX = ori.detail || ori.wheelDeltaX,
	                    deltaY = ori.detail || ori.wheelDeltaY,
	                    v = s._validate(s.o.parse(s.$.val())) + (deltaX > 0 || deltaY > 0 ? s.o.step : deltaX < 0 || deltaY < 0 ? -s.o.step : 0);

	                v = max(min(v, s.o.max), s.o.min);

	                s.val(v, false);

	                if (s.rH) {
	                    // Handle mousewheel stop
	                    clearTimeout(mwTimerStop);
	                    mwTimerStop = setTimeout(function () {
	                        s.rH(v);
	                        mwTimerStop = null;
	                    }, 100);

	                    // Handle mousewheel releases
	                    if (!mwTimerRelease) {
	                        mwTimerRelease = setTimeout(function () {
	                            if (mwTimerStop) s.rH(v);
	                            mwTimerRelease = null;
	                        }, 200);
	                    }
	                }
	            },
	                kval,
	                to,
	                m = 1,
	                kv = {
	                37: -s.o.step,
	                38: s.o.step,
	                39: s.o.step,
	                40: -s.o.step
	            };

	            this.$.bind("keydown", function (e) {
	                var kc = e.keyCode;

	                // numpad support
	                if (kc >= 96 && kc <= 105) {
	                    kc = e.keyCode = kc - 48;
	                }

	                kval = parseInt(String.fromCharCode(kc));

	                if (isNaN(kval)) {
	                    kc !== 13 && // enter
	                    kc !== 8 // bs
	                     && kc !== 9 // tab
	                     && kc !== 189 // -
	                     && (kc !== 190 || s.$.val().match(/\./)) // . allowed once
	                     && e.preventDefault();

	                    // arrows
	                    if ($.inArray(kc, [37, 38, 39, 40]) > -1) {
	                        e.preventDefault();

	                        var v = s.o.parse(s.$.val()) + kv[kc] * m;
	                        s.o.stopper && (v = max(min(v, s.o.max), s.o.min));

	                        s.change(s._validate(v));
	                        s._draw();

	                        // long time keydown speed-up
	                        to = window.setTimeout(function () {
	                            m *= 2;
	                        }, 30);
	                    }
	                }
	            }).bind("keyup", function (e) {
	                if (isNaN(kval)) {
	                    if (to) {
	                        window.clearTimeout(to);
	                        to = null;
	                        m = 1;
	                        s.val(s.$.val());
	                    }
	                } else {
	                    // kval postcond
	                    s.$.val() > s.o.max && s.$.val(s.o.max) || s.$.val() < s.o.min && s.$.val(s.o.min);
	                }
	            });

	            this.$c.bind("mousewheel DOMMouseScroll", mw);
	            this.$.bind("mousewheel DOMMouseScroll", mw);
	        };

	        this.init = function () {
	            if (this.v < this.o.min || this.v > this.o.max) {
	                this.v = this.o.min;
	            }

	            this.$.val(this.v);
	            this.w2 = this.w / 2;
	            this.cursorExt = this.o.cursor / 100;
	            this.xy = this.w2 * this.scale;
	            this.lineWidth = this.xy * this.o.thickness;
	            this.lineCap = this.o.lineCap;
	            this.radius = this.xy - this.lineWidth / 2;

	            this.o.angleOffset && (this.o.angleOffset = isNaN(this.o.angleOffset) ? 0 : this.o.angleOffset);

	            this.o.angleArc && (this.o.angleArc = isNaN(this.o.angleArc) ? this.PI2 : this.o.angleArc);

	            // deg to rad
	            this.angleOffset = this.o.angleOffset * Math.PI / 180;
	            this.angleArc = this.o.angleArc * Math.PI / 180;

	            // compute start and end angles
	            this.startAngle = 1.5 * Math.PI + this.angleOffset;
	            this.endAngle = 1.5 * Math.PI + this.angleOffset + this.angleArc;

	            var s = max(String(Math.abs(this.o.max)).length, String(Math.abs(this.o.min)).length, 2) + 2;

	            this.o.displayInput && this.i.css({
	                'width': (this.w / 2 + 4 >> 0) + 'px',
	                'height': (this.w / 3 >> 0) + 'px',
	                'position': 'absolute',
	                'vertical-align': 'middle',
	                'margin-top': (this.w / 3 >> 0) + 'px',
	                'margin-left': '-' + (this.w * 3 / 4 + 2 >> 0) + 'px',
	                'border': 0,
	                'background': 'none',
	                'font': this.o.fontWeight + ' ' + (this.w / s >> 0) + 'px ' + this.o.font,
	                'text-align': 'center',
	                'color': this.o.inputColor || this.o.fgColor,
	                'padding': '0px',
	                '-webkit-appearance': 'none'
	            }) || this.i.css({
	                'width': '0px',
	                'visibility': 'hidden'
	            });
	        };

	        this.change = function (v) {
	            this.cv = v;
	            this.$.val(this.o.format(v));
	        };

	        this.angle = function (v) {
	            return (v - this.o.min) * this.angleArc / (this.o.max - this.o.min);
	        };

	        this.arc = function (v) {
	            var sa, ea;
	            v = this.angle(v);
	            if (this.o.flip) {
	                sa = this.endAngle + 0.00001;
	                ea = sa - v - 0.00001;
	            } else {
	                sa = this.startAngle - 0.00001;
	                ea = sa + v + 0.00001;
	            }
	            this.o.cursor && (sa = ea - this.cursorExt) && (ea = ea + this.cursorExt);

	            return {
	                s: sa,
	                e: ea,
	                d: this.o.flip && !this.o.cursor
	            };
	        };

	        this.draw = function () {
	            var c = this.g,
	                // context
	            a = this.arc(this.cv),
	                // Arc
	            pa,
	                // Previous arc
	            r = 1;

	            c.lineWidth = this.lineWidth;
	            c.lineCap = this.lineCap;

	            if (this.o.bgColor !== "none") {
	                c.beginPath();
	                c.strokeStyle = this.o.bgColor;
	                c.arc(this.xy, this.xy, this.radius, this.endAngle - 0.00001, this.startAngle + 0.00001, true);
	                c.stroke();
	            }

	            if (this.o.displayPrevious) {
	                pa = this.arc(this.v);
	                c.beginPath();
	                c.strokeStyle = this.pColor;
	                c.arc(this.xy, this.xy, this.radius, pa.s, pa.e, pa.d);
	                c.stroke();
	                r = this.cv == this.v;
	            }

	            c.beginPath();
	            c.strokeStyle = r ? this.o.fgColor : this.fgColor;
	            c.arc(this.xy, this.xy, this.radius, a.s, a.e, a.d);
	            c.stroke();
	        };

	        this.cancel = function () {
	            this.val(this.v);
	        };
	    };

	    $.fn.dial = $.fn.knob = function (o) {
	        return this.each(function () {
	            var d = new k.Dial();
	            d.o = o;
	            d.$ = $(this);
	            d.run();
	        }).parent();
	    };
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function($, __webpack_provided_window_dot_jQuery, jQuery) {/*! FileAPI 2.0.19 - BSD | git://github.com/mailru/FileAPI.git */
	!function(a){"use strict";var b=a.HTMLCanvasElement&&a.HTMLCanvasElement.prototype,c=a.Blob&&function(){try{return Boolean(new Blob)}catch(a){return!1}}(),d=c&&a.Uint8Array&&function(){try{return 100===new Blob([new Uint8Array(100)]).size}catch(a){return!1}}(),e=a.BlobBuilder||a.WebKitBlobBuilder||a.MozBlobBuilder||a.MSBlobBuilder,f=(c||e)&&a.atob&&a.ArrayBuffer&&a.Uint8Array&&function(a){var b,f,g,h,i,j;for(b=a.split(",")[0].indexOf("base64")>=0?atob(a.split(",")[1]):decodeURIComponent(a.split(",")[1]),f=new ArrayBuffer(b.length),g=new Uint8Array(f),h=0;h<b.length;h+=1)g[h]=b.charCodeAt(h);return i=a.split(",")[0].split(":")[1].split(";")[0],c?new Blob([d?g:f],{type:i}):(j=new e,j.append(f),j.getBlob(i))};a.HTMLCanvasElement&&!b.toBlob&&(b.mozGetAsFile?b.toBlob=function(a,c,d){a(d&&b.toDataURL&&f?f(this.toDataURL(c,d)):this.mozGetAsFile("blob",c))}:b.toDataURL&&f&&(b.toBlob=function(a,b,c){a(f(this.toDataURL(b,c)))})),a.dataURLtoBlob=f}(window),function(a,b){"use strict";function c(a,b,c,d,e){var f={type:c.type||c,target:a,result:d};Y(f,e),b(f)}function d(a){return z&&!!z.prototype["readAs"+a]}function e(a,e,f,g){if(ca.isBlob(a)&&d(f)){var h=new z;Z(h,S,function j(b){var d=b.type;"progress"==d?c(a,e,b,b.target.result,{loaded:b.loaded,total:b.total}):"loadend"==d?($(h,S,j),h=null):c(a,e,b,b.target.result)});try{g?h["readAs"+f](a,g):h["readAs"+f](a)}catch(i){c(a,e,"error",b,{error:i.toString()})}}else c(a,e,"error",b,{error:"filreader_not_support_"+f})}function f(a,b){if(!a.type&&(u||a.size%4096===0&&a.size<=102400))if(z)try{var c=new z;_(c,S,function(a){var d="error"!=a.type;d?((null==c.readyState||c.readyState===c.LOADING)&&c.abort(),b(d)):b(!1,c.error)}),c.readAsDataURL(a)}catch(d){b(!1,d)}else b(null,new Error("FileReader is not supported"));else b(!0)}function g(a){return a&&(a.isFile||a.isDirectory)}function h(a){var b;return a.getAsEntry?b=a.getAsEntry():a.webkitGetAsEntry&&(b=a.webkitGetAsEntry()),b}function i(a,b){if(a)if(a.isFile)a.file(function(c){c.fullPath=a.fullPath,b(!1,[c],[c])},function(c){a.error=c,b("FileError.code: "+c.code,[],[a])});else if(a.isDirectory){var c=a.createReader(),d=!0,e=[],f=[a],g=function(c){a.error=c,b("DirectoryError.code: "+c.code,e,f)},j=function l(h){d&&(d=!1,h.length||(a.error=new Error("directory is empty"))),h.length?ca.afor(h,function(a,b){i(b,function(b,d,h){b||(e=e.concat(d)),f=f.concat(h),a?a():c.readEntries(l,g)})}):b(!1,e,f)};c.readEntries(j,g)}else i(h(a),b);else{var k=new Error("invalid entry");a=new Object(a),a.error=k,b(k.message,[],[a])}}function j(a){var b={};return X(a,function(a,c){a&&"object"==typeof a&&void 0===a.nodeType&&(a=Y({},a)),b[c]=a}),b}function k(a){return L.test(a&&a.tagName)}function l(a){return(a.originalEvent||a||"").dataTransfer||{}}function m(a){var b;for(b in a)if(a.hasOwnProperty(b)&&!(a[b]instanceof Object||"overlay"===b||"filter"===b))return!0;return!1}var n,o,p=1,q=function(){},r=a.document,s=r.doctype||{},t=a.navigator.userAgent,u=/safari\//i.test(t)&&!/chrome\//i.test(t),v=/iemobile\//i.test(t),w=a.createObjectURL&&a||a.URL&&URL.revokeObjectURL&&URL||a.webkitURL&&webkitURL,x=a.Blob,y=a.File,z=a.FileReader,A=a.FormData,B=a.XMLHttpRequest,C=__webpack_provided_window_dot_jQuery,D=!(!(y&&z&&(a.Uint8Array||A||B.prototype.sendAsBinary))||u&&/windows/i.test(t)&&!v),E=D&&"withCredentials"in new B,F=D&&!!x&&!!(x.prototype.webkitSlice||x.prototype.mozSlice||x.prototype.slice),G=(""+"".normalize).indexOf("[native code]")>0,H=a.dataURLtoBlob,I=/img/i,J=/canvas/i,K=/img|canvas/i,L=/input/i,M=/^data:[^,]+,/,N={}.toString,O=a.Math,P=function(b){return b=new a.Number(O.pow(1024,b)),b.from=function(a){return O.round(a*this)},b},Q={},R=[],S="abort progress error load loadend",T="status statusText readyState response responseXML responseText responseBody".split(" "),U="currentTarget",V="preventDefault",W=function(a){return a&&"length"in a},X=function(a,b,c){if(a)if(W(a))for(var d=0,e=a.length;e>d;d++)d in a&&b.call(c,a[d],d,a);else for(var f in a)a.hasOwnProperty(f)&&b.call(c,a[f],f,a)},Y=function(a){for(var b=arguments,c=1,d=function(b,c){a[c]=b};c<b.length;c++)X(b[c],d);return a},Z=function(a,b,c){if(a){var d=ca.uid(a);Q[d]||(Q[d]={});var e=z&&a&&a instanceof z;X(b.split(/\s+/),function(b){C&&!e?C.event.add(a,b,c):(Q[d][b]||(Q[d][b]=[]),Q[d][b].push(c),a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):a["on"+b]=c)})}},$=function(a,b,c){if(a){var d=ca.uid(a),e=Q[d]||{},f=z&&a&&a instanceof z;X(b.split(/\s+/),function(b){if(C&&!f)C.event.remove(a,b,c);else{for(var d=e[b]||[],g=d.length;g--;)if(d[g]===c){d.splice(g,1);break}a.addEventListener?a.removeEventListener(b,c,!1):a.detachEvent?a.detachEvent("on"+b,c):a["on"+b]=null}})}},_=function(a,b,c){Z(a,b,function d(e){$(a,b,d),c(e)})},aa=function(b){return b.target||(b.target=a.event&&a.event.srcElement||r),3===b.target.nodeType&&(b.target=b.target.parentNode),b},ba=function(a){var b=r.createElement("input");return b.setAttribute("type","file"),a in b},ca={version:"2.0.19",cors:!1,html5:!0,media:!1,formData:!0,multiPassResize:!0,debug:!1,pingUrl:!1,multiFlash:!1,flashAbortTimeout:0,withCredentials:!0,staticPath:"./dist/",flashUrl:0,flashImageUrl:0,postNameConcat:function(a,b){return a+(null!=b?"["+b+"]":"")},ext2mime:{jpg:"image/jpeg",tif:"image/tiff",txt:"text/plain"},accept:{"image/*":"art bm bmp dwg dxf cbr cbz fif fpx gif ico iefs jfif jpe jpeg jpg jps jut mcf nap nif pbm pcx pgm pict pm png pnm qif qtif ras rast rf rp svf tga tif tiff xbm xbm xpm xwd","audio/*":"m4a flac aac rm mpa wav wma ogg mp3 mp2 m3u mod amf dmf dsm far gdm imf it m15 med okt s3m stm sfx ult uni xm sid ac3 dts cue aif aiff wpl ape mac mpc mpp shn wv nsf spc gym adplug adx dsp adp ymf ast afc hps xs","video/*":"m4v 3gp nsv ts ty strm rm rmvb m3u ifo mov qt divx xvid bivx vob nrg img iso pva wmv asf asx ogm m2v avi bin dat dvr-ms mpg mpeg mp4 mkv avc vp3 svq3 nuv viv dv fli flv wpl"},uploadRetry:0,networkDownRetryTimeout:5e3,chunkSize:0,chunkUploadRetry:0,chunkNetworkDownRetryTimeout:2e3,KB:P(1),MB:P(2),GB:P(3),TB:P(4),EMPTY_PNG:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=",expando:"fileapi"+(new Date).getTime(),uid:function(a){return a?a[ca.expando]=a[ca.expando]||ca.uid():(++p,ca.expando+p)},log:function(){ca.debug&&n&&(o?console.log.apply(console,arguments):console.log([].join.call(arguments," ")))},newImage:function(a,b){var c=r.createElement("img");return b&&ca.event.one(c,"error load",function(a){b("error"==a.type,c),c=null}),c.src=a,c},getXHR:function(){var b;if(B)b=new B;else if(a.ActiveXObject)try{b=new ActiveXObject("MSXML2.XMLHttp.3.0")}catch(c){b=new ActiveXObject("Microsoft.XMLHTTP")}return b},isArray:W,support:{dnd:E&&"ondrop"in r.createElement("div"),cors:E,html5:D,chunked:F,dataURI:!0,accept:ba("accept"),multiple:ba("multiple")},event:{on:Z,off:$,one:_,fix:aa},throttle:function(b,c){var d,e;return function(){e=arguments,d||(b.apply(a,e),d=setTimeout(function(){d=0,b.apply(a,e)},c))}},F:function(){},parseJSON:function(b){var c;return c=a.JSON&&JSON.parse?JSON.parse(b):new Function("return ("+b.replace(/([\r\n])/g,"\\$1")+");")()},trim:function(a){return a=String(a),a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")},defer:function(){var a,c,d=[],e={resolve:function(b,f){for(e.resolve=q,c=b||!1,a=f;f=d.shift();)f(c,a)},then:function(e){c!==b?e(c,a):d.push(e)}};return e},queue:function(a){var b=0,c=0,d=!1,e=!1,f={inc:function(){c++},next:function(){b++,setTimeout(f.check,0)},check:function(){b>=c&&!d&&f.end()},isFail:function(){return d},fail:function(){!d&&a(d=!0)},end:function(){e||(e=!0,a())}};return f},each:X,afor:function(a,b){var c=0,d=a.length;W(a)&&d--?!function e(){b(d!=c&&e,a[c],c++)}():b(!1)},extend:Y,isFile:function(a){return"[object File]"===N.call(a)},isBlob:function(a){return this.isFile(a)||"[object Blob]"===N.call(a)},isCanvas:function(a){return a&&J.test(a.nodeName)},getFilesFilter:function(a){return a="string"==typeof a?a:a.getAttribute&&a.getAttribute("accept")||"",a?new RegExp("("+a.replace(/\./g,"\\.").replace(/,/g,"|")+")$","i"):/./},readAsDataURL:function(a,b){ca.isCanvas(a)?c(a,b,"load",ca.toDataURL(a)):e(a,b,"DataURL")},readAsBinaryString:function(a,b){d("BinaryString")?e(a,b,"BinaryString"):e(a,function(a){if("load"==a.type)try{a.result=ca.toBinaryString(a.result)}catch(c){a.type="error",a.message=c.toString()}b(a)},"DataURL")},readAsArrayBuffer:function(a,b){e(a,b,"ArrayBuffer")},readAsText:function(a,b,c){c||(c=b,b="utf-8"),e(a,c,"Text",b)},toDataURL:function(a,b){return"string"==typeof a?a:a.toDataURL?a.toDataURL(b||"image/png"):void 0},toBinaryString:function(b){return a.atob(ca.toDataURL(b).replace(M,""))},readAsImage:function(a,d,e){if(ca.isBlob(a))if(w){var f=w.createObjectURL(a);f===b?c(a,d,"error"):ca.readAsImage(f,d,e)}else ca.readAsDataURL(a,function(b){"load"==b.type?ca.readAsImage(b.result,d,e):(e||"error"==b.type)&&c(a,d,b,null,{loaded:b.loaded,total:b.total})});else if(ca.isCanvas(a))c(a,d,"load",a);else if(I.test(a.nodeName))if(a.complete)c(a,d,"load",a);else{var g="error abort load";_(a,g,function i(b){"load"==b.type&&w&&w.revokeObjectURL(a.src),$(a,g,i),c(a,d,b,a)})}else if(a.iframe)c(a,d,{type:"error"});else{var h=ca.newImage(a.dataURL||a);ca.readAsImage(h,d,e)}},checkFileObj:function(a){var b={},c=ca.accept;return"object"==typeof a?b=a:b.name=(a+"").split(/\\|\//g).pop(),null==b.type&&(b.type=b.name.split(".").pop()),X(c,function(a,c){a=new RegExp(a.replace(/\s/g,"|"),"i"),(a.test(b.type)||ca.ext2mime[b.type])&&(b.type=ca.ext2mime[b.type]||c.split("/")[0]+"/"+b.type)}),b},getDropFiles:function(a,b){var c,d=[],e=[],j=l(a),k=j.files,m=j.items,n=W(m)&&m[0]&&h(m[0]),o=ca.queue(function(){b(d,e)});if(n)if(G&&k){var p,q,r=k.length;for(c=new Array(r);r--;){p=k[r];try{q=h(m[r])}catch(s){ca.log("[err] getDropFiles: ",s),q=null}g(q)&&(q.isDirectory||q.isFile&&p.name==p.name.normalize("NFC"))?c[r]=q:c[r]=p}}else c=m;else c=k;X(c||[],function(a){o.inc();try{n&&g(a)?i(a,function(a,b,c){a?ca.log("[err] getDropFiles:",a):d.push.apply(d,b),e.push.apply(e,c),o.next()}):f(a,function(b,c){b?d.push(a):a.error=c,e.push(a),o.next()})}catch(b){o.next(),ca.log("[err] getDropFiles: ",b)}}),o.check()},getFiles:function(a,b,c){var d=[];return c?(ca.filterFiles(ca.getFiles(a),b,c),null):(a.jquery&&(a.each(function(){d=d.concat(ca.getFiles(this))}),a=d,d=[]),"string"==typeof b&&(b=ca.getFilesFilter(b)),a.originalEvent?a=aa(a.originalEvent):a.srcElement&&(a=aa(a)),a.dataTransfer?a=a.dataTransfer:a.target&&(a=a.target),a.files?(d=a.files,D||(d[0].blob=a,d[0].iframe=!0)):!D&&k(a)?ca.trim(a.value)&&(d=[ca.checkFileObj(a.value)],d[0].blob=a,d[0].iframe=!0):W(a)&&(d=a),ca.filter(d,function(a){return!b||b.test(a.name)}))},getTotalSize:function(a){for(var b=0,c=a&&a.length;c--;)b+=a[c].size;return b},getInfo:function(a,b){var c={},d=R.concat();ca.isBlob(a)?!function e(){var f=d.shift();f?f.test(a.type)?f(a,function(a,d){a?b(a):(Y(c,d),e())}):e():b(!1,c)}():b("not_support_info",c)},addInfoReader:function(a,b){b.test=function(b){return a.test(b)},R.push(b)},filter:function(a,b){for(var c,d=[],e=0,f=a.length;f>e;e++)e in a&&(c=a[e],b.call(c,c,e,a)&&d.push(c));return d},filterFiles:function(a,b,c){if(a.length){var d,e=a.concat(),f=[],g=[];!function h(){e.length?(d=e.shift(),ca.getInfo(d,function(a,c){(b(d,a?!1:c)?f:g).push(d),h()})):c(f,g)}()}else c([],a)},upload:function(a){a=Y({jsonp:"callback",prepare:ca.F,beforeupload:ca.F,upload:ca.F,fileupload:ca.F,fileprogress:ca.F,filecomplete:ca.F,progress:ca.F,complete:ca.F,pause:ca.F,imageOriginal:!0,chunkSize:ca.chunkSize,chunkUploadRetry:ca.chunkUploadRetry,uploadRetry:ca.uploadRetry},a),a.imageAutoOrientation&&!a.imageTransform&&(a.imageTransform={rotate:"auto"});var b,c=new ca.XHR(a),d=this._getFilesDataArray(a.files),e=this,f=0,g=0,h=!1;return X(d,function(a){f+=a.size}),c.files=[],X(d,function(a){c.files.push(a.file)}),c.total=f,c.loaded=0,c.filesLeft=d.length,a.beforeupload(c,a),b=function(){var i=d.shift(),k=i&&i.file,l=!1,m=j(a);if(c.filesLeft=d.length,k&&k.name===ca.expando&&(k=null,ca.log("[warn] FileAPI.upload() — called without files")),("abort"!=c.statusText||c.current)&&i){if(h=!1,c.currentFile=k,k&&a.prepare(k,m)===!1)return void b.call(e);m.file=k,e._getFormData(m,i,function(h){g||a.upload(c,a);var j=new ca.XHR(Y({},m,{upload:k?function(){a.fileupload(k,j,m)}:q,progress:k?function(b){l||(l=b.loaded===b.total,a.fileprogress({type:"progress",total:i.total=b.total,loaded:i.loaded=b.loaded},k,j,m),a.progress({type:"progress",total:f,loaded:c.loaded=g+i.size*(b.loaded/b.total)||0},k,j,m))}:q,complete:function(d){X(T,function(a){c[a]=j[a]}),k&&(i.total=i.total||i.size,i.loaded=i.total,d||(this.progress(i),l=!0,g+=i.size,c.loaded=g),a.filecomplete(d,j,k,m)),setTimeout(function(){b.call(e)},0)}}));c.abort=function(a){a||(d.length=0),this.current=a,j.abort()},j.send(h)})}else{var n=200==c.status||201==c.status||204==c.status;a.complete(n?!1:c.statusText||"error",c,a),h=!0}},setTimeout(b,0),c.append=function(a,g){a=ca._getFilesDataArray([].concat(a)),X(a,function(a){f+=a.size,c.files.push(a.file),g?d.unshift(a):d.push(a)}),c.statusText="",h&&b.call(e)},c.remove=function(a){for(var b,c=d.length;c--;)d[c].file==a&&(b=d.splice(c,1),f-=b.size);return b},c},_getFilesDataArray:function(a){var b=[],c={};if(k(a)){var d=ca.getFiles(a);c[a.name||"file"]=null!==a.getAttribute("multiple")?d:d[0]}else W(a)&&k(a[0])?X(a,function(a){c[a.name||"file"]=ca.getFiles(a)}):c=a;return X(c,function e(a,c){W(a)?X(a,function(a){e(a,c)}):a&&(a.name||a.image)&&b.push({name:c,file:a,size:a.size,total:a.size,loaded:0})}),b.length||b.push({file:{name:ca.expando}}),b},_getFormData:function(a,b,c){var d=b.file,e=b.name,f=d.name,g=d.type,h=ca.support.transform&&a.imageTransform,i=new ca.Form,j=ca.queue(function(){c(i)}),k=h&&m(h),l=ca.postNameConcat;X(a.data,function n(a,b){"object"==typeof a?X(a,function(a,c){n(a,l(b,c))}):i.append(b,a)}),function o(b){b.image?(j.inc(),b.toData(function(a,c){b.file&&(c.type=b.file.type,c.quality=b.matrix.quality,f=b.file&&b.file.name),f=f||(new Date).getTime()+".png",o(c),j.next()})):ca.Image&&h&&(/^image/.test(b.type)||K.test(b.nodeName))?(j.inc(),k&&(h=[h]),ca.Image.transform(b,h,a.imageAutoOrientation,function(c,d){if(k&&!c)H||ca.flashEngine||(i.multipart=!0),i.append(e,d[0],f,h[0].type||g);else{var m=0;c||X(d,function(a,b){H||ca.flashEngine||(i.multipart=!0),h[b].postName||(m=1),i.append(h[b].postName||l(e,b),a,f,h[b].type||g)}),(c||a.imageOriginal)&&i.append(l(e,m?"original":null),b,f,g)}j.next()})):f!==ca.expando&&i.append(e,b,f)}(d),j.check()},reset:function(a,b){var c,d;return C?(d=C(a).clone(!0).insertBefore(a).val("")[0],b||C(a).remove()):(c=a.parentNode,d=c.insertBefore(a.cloneNode(!0),a),d.value="",b||c.removeChild(a),X(Q[ca.uid(a)],function(b,c){X(b,function(b){$(a,c,b),Z(d,c,b)})})),d},load:function(a,b){var c=ca.getXHR();return c?(c.open("GET",a,!0),c.overrideMimeType&&c.overrideMimeType("text/plain; charset=x-user-defined"),Z(c,"progress",function(a){a.lengthComputable&&b({type:a.type,loaded:a.loaded,total:a.total},c)}),c.onreadystatechange=function(){if(4==c.readyState)if(c.onreadystatechange=null,200==c.status){a=a.split("/");var d={name:a[a.length-1],size:c.getResponseHeader("Content-Length"),type:c.getResponseHeader("Content-Type")};d.dataURL="data:"+d.type+";base64,"+ca.encode64(c.responseBody||c.responseText),b({type:"load",result:d},c)}else b({type:"error"},c)},c.send(null)):b({type:"error"}),c},encode64:function(a){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c="",d=0;for("string"!=typeof a&&(a=String(a));d<a.length;){var e,f,g=255&a.charCodeAt(d++),h=255&a.charCodeAt(d++),i=255&a.charCodeAt(d++),j=g>>2,k=(3&g)<<4|h>>4;isNaN(h)?e=f=64:(e=(15&h)<<2|i>>6,f=isNaN(i)?64:63&i),c+=b.charAt(j)+b.charAt(k)+b.charAt(e)+b.charAt(f)}return c}};ca.addInfoReader(/^image/,function(a,b){if(!a.__dimensions){var c=a.__dimensions=ca.defer();ca.readAsImage(a,function(a){var b=a.target;c.resolve("load"==a.type?!1:"error",{width:b.width,height:b.height}),b.src=ca.EMPTY_PNG,b=null})}a.__dimensions.then(b)}),ca.event.dnd=function(a,b,c){var d,e;c||(c=b,b=ca.F),z?(Z(a,"dragenter dragleave dragover",b.ff=b.ff||function(a){for(var c=l(a).types,f=c&&c.length,g=!1;f--;)if(~c[f].indexOf("File")){a[V](),e!==a.type&&(e=a.type,"dragleave"!=e&&b.call(a[U],!0,a),g=!0);break}g&&(clearTimeout(d),d=setTimeout(function(){b.call(a[U],"dragleave"!=e,a)},50))}),Z(a,"drop",c.ff=c.ff||function(a){a[V](),e=0,b.call(a[U],!1,a),ca.getDropFiles(a,function(b,d){c.call(a[U],b,d,a)})})):ca.log("Drag'n'Drop -- not supported")},ca.event.dnd.off=function(a,b,c){$(a,"dragenter dragleave dragover",b.ff),$(a,"drop",c.ff)},C&&!C.fn.dnd&&(C.fn.dnd=function(a,b){return this.each(function(){ca.event.dnd(this,a,b)})},C.fn.offdnd=function(a,b){return this.each(function(){ca.event.dnd.off(this,a,b)})}),a.FileAPI=Y(ca,a.FileAPI),ca.log("FileAPI: "+ca.version),ca.log("protocol: "+a.location.protocol),ca.log("doctype: ["+s.name+"] "+s.publicId+" "+s.systemId),X(r.getElementsByTagName("meta"),function(a){/x-ua-compatible/i.test(a.getAttribute("http-equiv"))&&ca.log("meta.http-equiv: "+a.getAttribute("content"))});try{n=!!console.log,o=!!console.log.apply}catch(da){}ca.flashUrl||(ca.flashUrl=ca.staticPath+"FileAPI.flash.swf"),ca.flashImageUrl||(ca.flashImageUrl=ca.staticPath+"FileAPI.flash.image.swf"),ca.flashWebcamUrl||(ca.flashWebcamUrl=ca.staticPath+"FileAPI.flash.camera.swf")}(window,void 0),function(a,b,c){"use strict";function d(b){if(b instanceof d){var c=new d(b.file);return a.extend(c.matrix,b.matrix),c}return this instanceof d?(this.file=b,this.size=b.size||100,void(this.matrix={sx:0,sy:0,sw:0,sh:0,dx:0,dy:0,dw:0,dh:0,resize:0,deg:0,quality:1,filter:0})):new d(b)}var e=Math.min,f=Math.round,g=function(){return b.createElement("canvas")},h=!1,i={8:270,3:180,6:90,7:270,4:180,5:90};try{h=g().toDataURL("image/png").indexOf("data:image/png")>-1}catch(j){}d.prototype={image:!0,constructor:d,set:function(b){return a.extend(this.matrix,b),this},crop:function(a,b,d,e){return d===c&&(d=a,e=b,a=b=0),this.set({sx:a,sy:b,sw:d,sh:e||d})},resize:function(a,b,c){return/min|max|height|width/.test(b)&&(c=b,b=a),this.set({dw:a,dh:b||a,resize:c})},preview:function(a,b){return this.resize(a,b||a,"preview")},rotate:function(a){return this.set({deg:a})},filter:function(a){return this.set({filter:a})},overlay:function(a){return this.set({overlay:a})},clone:function(){return new d(this)},_load:function(b,c){var d=this;/img|video/i.test(b.nodeName)?c.call(d,null,b):a.readAsImage(b,function(a){c.call(d,"load"!=a.type,a.result)})},_apply:function(b,c){var f,h=g(),i=this.getMatrix(b),j=h.getContext("2d"),k=b.videoWidth||b.width,l=b.videoHeight||b.height,m=i.deg,n=i.dw,o=i.dh,p=k,q=l,r=i.filter,s=b,t=i.overlay,u=a.queue(function(){b.src=a.EMPTY_PNG,c(!1,h)}),v=a.renderImageToCanvas;for(m-=360*Math.floor(m/360),b._type=this.file.type;i.multipass&&e(p/n,q/o)>2;)p=p/2+.5|0,q=q/2+.5|0,f=g(),f.width=p,f.height=q,s!==b?(v(f,s,0,0,s.width,s.height,0,0,p,q),s=f):(s=f,v(s,b,i.sx,i.sy,i.sw,i.sh,0,0,p,q),i.sx=i.sy=i.sw=i.sh=0);h.width=m%180?o:n,h.height=m%180?n:o,h.type=i.type,h.quality=i.quality,j.rotate(m*Math.PI/180),v(j.canvas,s,i.sx,i.sy,i.sw||s.width,i.sh||s.height,180==m||270==m?-n:0,90==m||180==m?-o:0,n,o),n=h.width,o=h.height,t&&a.each([].concat(t),function(b){u.inc();var c=new window.Image,d=function(){var e=0|b.x,f=0|b.y,g=b.w||c.width,h=b.h||c.height,i=b.rel;e=1==i||4==i||7==i?(n-g+e)/2:2==i||5==i||8==i?n-(g+e):e,f=3==i||4==i||5==i?(o-h+f)/2:i>=6?o-(h+f):f,a.event.off(c,"error load abort",d);try{j.globalAlpha=b.opacity||1,j.drawImage(c,e,f,g,h)}catch(k){}u.next()};a.event.on(c,"error load abort",d),c.src=b.src,c.complete&&d()}),r&&(u.inc(),d.applyFilter(h,r,u.next)),u.check()},getMatrix:function(b){var c=a.extend({},this.matrix),d=c.sw=c.sw||b.videoWidth||b.naturalWidth||b.width,g=c.sh=c.sh||b.videoHeight||b.naturalHeight||b.height,h=c.dw=c.dw||d,i=c.dh=c.dh||g,j=d/g,k=h/i,l=c.resize;if("preview"==l){if(h!=d||i!=g){var m,n;k>=j?(m=d,n=m/k):(n=g,m=n*k),(m!=d||n!=g)&&(c.sx=~~((d-m)/2),c.sy=~~((g-n)/2),d=m,g=n)}}else"height"==l?h=i*j:"width"==l?i=h/j:l&&(d>h||g>i?"min"==l?(h=f(k>j?e(d,h):i*j),i=f(k>j?h/j:e(g,i))):(h=f(j>=k?e(d,h):i*j),i=f(j>=k?h/j:e(g,i))):(h=d,i=g));return c.sw=d,c.sh=g,c.dw=h,c.dh=i,c.multipass=a.multiPassResize,c},_trans:function(b){this._load(this.file,function(c,d){if(c)b(c);else try{this._apply(d,b)}catch(c){a.log("[err] FileAPI.Image.fn._apply:",c),b(c)}})},get:function(b){if(a.support.transform){var c=this,d=c.matrix;"auto"==d.deg?a.getInfo(c.file,function(a,e){d.deg=i[e&&e.exif&&e.exif.Orientation]||0,c._trans(b)}):c._trans(b)}else b("not_support_transform");return this},toData:function(a){return this.get(a)}},d.exifOrientation=i,d.transform=function(b,e,f,g){function h(h,i){var j={},k=a.queue(function(a){g(a,j)});h?k.fail():a.each(e,function(a,e){if(!k.isFail()){var g=new d(i.nodeType?i:b),h="function"==typeof a;if(h?a(i,g):a.width?g[a.preview?"preview":"resize"](a.width,a.height,a.strategy):a.maxWidth&&(i.width>a.maxWidth||i.height>a.maxHeight)&&g.resize(a.maxWidth,a.maxHeight,"max"),a.crop){var l=a.crop;g.crop(0|l.x,0|l.y,l.w||l.width,l.h||l.height)}a.rotate===c&&f&&(a.rotate="auto"),g.set({type:g.matrix.type||a.type||b.type||"image/png"}),h||g.set({deg:a.rotate,overlay:a.overlay,filter:a.filter,quality:a.quality||1}),k.inc(),g.toData(function(a,b){a?k.fail():(j[e]=b,k.next())})}})}b.width?h(!1,b):a.getInfo(b,h)},a.each(["TOP","CENTER","BOTTOM"],function(b,c){a.each(["LEFT","CENTER","RIGHT"],function(a,e){d[b+"_"+a]=3*c+e,d[a+"_"+b]=3*c+e})}),d.toCanvas=function(a){var c=b.createElement("canvas");return c.width=a.videoWidth||a.width,c.height=a.videoHeight||a.height,c.getContext("2d").drawImage(a,0,0),c},d.fromDataURL=function(b,c,d){var e=a.newImage(b);a.extend(e,c),d(e)},d.applyFilter=function(b,c,e){"function"==typeof c?c(b,e):window.Caman&&window.Caman("IMG"==b.tagName?d.toCanvas(b):b,function(){"string"==typeof c?this[c]():a.each(c,function(a,b){this[b](a)},this),this.render(e)})},a.renderImageToCanvas=function(b,c,d,e,f,g,h,i,j,k){try{return b.getContext("2d").drawImage(c,d,e,f,g,h,i,j,k)}catch(l){throw a.log("renderImageToCanvas failed"),l}},a.support.canvas=a.support.transform=h,a.Image=d}(FileAPI,document),function(a){"use strict";a(FileAPI)}(function(a){"use strict";if(window.navigator&&window.navigator.platform&&/iP(hone|od|ad)/.test(window.navigator.platform)){var b=a.renderImageToCanvas;a.detectSubsampling=function(a){var b,c;return a.width*a.height>1048576?(b=document.createElement("canvas"),b.width=b.height=1,c=b.getContext("2d"),c.drawImage(a,-a.width+1,0),0===c.getImageData(0,0,1,1).data[3]):!1},a.detectVerticalSquash=function(a,b){var c,d,e,f,g,h=a.naturalHeight||a.height,i=document.createElement("canvas"),j=i.getContext("2d");for(b&&(h/=2),i.width=1,i.height=h,j.drawImage(a,0,0),c=j.getImageData(0,0,1,h).data,d=0,e=h,f=h;f>d;)g=c[4*(f-1)+3],0===g?e=f:d=f,f=e+d>>1;return f/h||1},a.renderImageToCanvas=function(c,d,e,f,g,h,i,j,k,l){if("image/jpeg"===d._type){var m,n,o,p,q=c.getContext("2d"),r=document.createElement("canvas"),s=1024,t=r.getContext("2d");if(r.width=s,r.height=s,q.save(),m=a.detectSubsampling(d),m&&(e/=2,f/=2,g/=2,h/=2),n=a.detectVerticalSquash(d,m),m||1!==n){for(f*=n,k=Math.ceil(s*k/g),l=Math.ceil(s*l/h/n),j=0,p=0;h>p;){for(i=0,o=0;g>o;)t.clearRect(0,0,s,s),t.drawImage(d,e,f,g,h,-o,-p,g,h),q.drawImage(r,0,0,s,s,i,j,k,l),o+=s,i+=k;p+=s,j+=l}return q.restore(),c}}return b(c,d,e,f,g,h,i,j,k,l)}}}),function(a,b){"use strict";function c(b,c,d){var e=b.blob,f=b.file;if(f){if(!e.toDataURL)return void a.readAsBinaryString(e,function(a){"load"==a.type&&c(b,a.result)});var g={"image/jpeg":".jpe?g","image/png":".png"},h=g[b.type]?b.type:"image/png",i=g[h]||".png",j=e.quality||1;f.match(new RegExp(i+"$","i"))||(f+=i.replace("?","")),b.file=f,b.type=h,!d&&e.toBlob?e.toBlob(function(a){c(b,a)},h,j):c(b,a.toBinaryString(e.toDataURL(h,j)))}else c(b,e)}var d=b.document,e=b.FormData,f=function(){this.items=[]},g=b.encodeURIComponent;f.prototype={append:function(a,b,c,d){this.items.push({name:a,blob:b&&b.blob||(void 0==b?"":b),file:b&&(c||b.name),type:b&&(d||b.type)})},each:function(a){for(var b=0,c=this.items.length;c>b;b++)a.call(this,this.items[b])},toData:function(b,c){c._chunked=a.support.chunked&&c.chunkSize>0&&1==a.filter(this.items,function(a){return a.file}).length,a.support.html5?a.formData&&!this.multipart&&e?c._chunked?(a.log("FileAPI.Form.toPlainData"),this.toPlainData(b)):(a.log("FileAPI.Form.toFormData"),this.toFormData(b)):(a.log("FileAPI.Form.toMultipartData"),this.toMultipartData(b)):(a.log("FileAPI.Form.toHtmlData"),this.toHtmlData(b))},_to:function(b,c,d,e){var f=a.queue(function(){c(b)});this.each(function(g){try{d(g,b,f,e)}catch(h){a.log("FileAPI.Form._to: "+h.message),c(h)}}),f.check()},toHtmlData:function(b){this._to(d.createDocumentFragment(),b,function(b,c){var e,f=b.blob;b.file?(a.reset(f,!0),f.name=b.name,f.disabled=!1,c.appendChild(f)):(e=d.createElement("input"),e.name=b.name,e.type="hidden",e.value=f,c.appendChild(e))})},toPlainData:function(a){this._to({},a,function(a,b,d){a.file&&(b.type=a.file),a.blob.toBlob?(d.inc(),c(a,function(a,c){b.name=a.name,b.file=c,b.size=c.length,b.type=a.type,d.next()})):a.file?(b.name=a.blob.name,b.file=a.blob,b.size=a.blob.size,b.type=a.type):(b.params||(b.params=[]),b.params.push(g(a.name)+"="+g(a.blob))),b.start=-1,b.end=b.file&&b.file.FileAPIReadPosition||-1,b.retry=0})},toFormData:function(a){this._to(new e,a,function(a,b,d){a.blob&&a.blob.toBlob?(d.inc(),c(a,function(a,c){b.append(a.name,c,a.file),d.next()})):a.file?b.append(a.name,a.blob,a.file):b.append(a.name,a.blob),a.file&&b.append("_"+a.name,a.file)})},toMultipartData:function(b){this._to([],b,function(a,b,d,e){d.inc(),c(a,function(a,c){b.push("--_"+e+('\r\nContent-Disposition: form-data; name="'+a.name+'"'+(a.file?'; filename="'+g(a.file)+'"':"")+(a.file?"\r\nContent-Type: "+(a.type||"application/octet-stream"):"")+"\r\n\r\n"+(a.file?c:g(c))+"\r\n")),d.next()},!0)},a.expando)}},a.Form=f}(FileAPI,window),function(a,b){"use strict";var c=function(){},d=a.document,e=function(a){this.uid=b.uid(),this.xhr={abort:c,getResponseHeader:c,getAllResponseHeaders:c},this.options=a},f={"":1,XML:1,Text:1,Body:1};e.prototype={status:0,statusText:"",constructor:e,getResponseHeader:function(a){return this.xhr.getResponseHeader(a)},getAllResponseHeaders:function(){return this.xhr.getAllResponseHeaders()||{}},end:function(d,e){var f=this,g=f.options;f.end=f.abort=c,f.status=d,e&&(f.statusText=e),b.log("xhr.end:",d,e),g.complete(200==d||201==d?!1:f.statusText||"unknown",f),f.xhr&&f.xhr.node&&setTimeout(function(){var b=f.xhr.node;try{b.parentNode.removeChild(b)}catch(c){}try{delete a[f.uid]}catch(c){}a[f.uid]=f.xhr.node=null},9)},abort:function(){this.end(0,"abort"),this.xhr&&(this.xhr.aborted=!0,this.xhr.abort())},send:function(a){var b=this,c=this.options;a.toData(function(a){a instanceof Error?b.end(0,a.message):(c.upload(c,b),b._send.call(b,c,a))},c)},_send:function(c,e){var g,h=this,i=h.uid,j=h.uid+"Load",k=c.url;if(b.log("XHR._send:",e),c.cache||(k+=(~k.indexOf("?")?"&":"?")+b.uid()),e.nodeName){var l=c.jsonp;k=k.replace(/([a-z]+)=(\?)/i,"$1="+i),c.upload(c,h);var m=function(a){if(~k.indexOf(a.origin))try{var c=b.parseJSON(a.data);c.id==i&&n(c.status,c.statusText,c.response)}catch(d){n(0,d.message)}},n=a[i]=function(c,d,e){h.readyState=4,h.responseText=e,h.end(c,d),b.event.off(a,"message",m),a[i]=g=p=a[j]=null};h.xhr.abort=function(){try{p.stop?p.stop():p.contentWindow.stop?p.contentWindow.stop():p.contentWindow.document.execCommand("Stop")}catch(a){}n(0,"abort")},b.event.on(a,"message",m),a[j]=function(){try{var a=p.contentWindow,c=a.document,d=a.result||b.parseJSON(c.body.innerHTML);n(d.status,d.statusText,d.response)}catch(e){b.log("[transport.onload]",e)}},g=d.createElement("div"),g.innerHTML='<form target="'+i+'" action="'+k+'" method="POST" enctype="multipart/form-data" style="position: absolute; top: -1000px; overflow: hidden; width: 1px; height: 1px;"><iframe name="'+i+'" src="javascript:false;" onload="window.'+j+" && "+j+'();"></iframe>'+(l&&c.url.indexOf("=?")<0?'<input value="'+i+'" name="'+l+'" type="hidden"/>':"")+"</form>";var o=g.getElementsByTagName("form")[0],p=g.getElementsByTagName("iframe")[0];o.appendChild(e),b.log(o.parentNode.innerHTML),d.body.appendChild(g),h.xhr.node=g,h.readyState=2;try{o.submit()}catch(q){b.log("iframe.error: "+q)}o=null}else{if(k=k.replace(/([a-z]+)=(\?)&?/i,""),this.xhr&&this.xhr.aborted)return void b.log("Error: already aborted");if(g=h.xhr=b.getXHR(),e.params&&(k+=(k.indexOf("?")<0?"?":"&")+e.params.join("&")),g.open("POST",k,!0),b.withCredentials&&(g.withCredentials="true"),c.headers&&c.headers["X-Requested-With"]||g.setRequestHeader("X-Requested-With","XMLHttpRequest"),b.each(c.headers,function(a,b){g.setRequestHeader(b,a)}),c._chunked){g.upload&&g.upload.addEventListener("progress",b.throttle(function(a){e.retry||c.progress({type:a.type,total:e.size,loaded:e.start+a.loaded,totalSize:e.size},h,c)},100),!1),g.onreadystatechange=function(){var a=parseInt(g.getResponseHeader("X-Last-Known-Byte"),10);if(h.status=g.status,h.statusText=g.statusText,h.readyState=g.readyState,4==g.readyState){for(var d in f)h["response"+d]=g["response"+d];if(g.onreadystatechange=null,!g.status||g.status-201>0)if(b.log("Error: "+g.status),(!g.status&&!g.aborted||500==g.status||416==g.status)&&++e.retry<=c.chunkUploadRetry){var i=g.status?0:b.chunkNetworkDownRetryTimeout;c.pause(e.file,c),b.log("X-Last-Known-Byte: "+a),a?e.end=a:(e.end=e.start-1,416==g.status&&(e.end=e.end-c.chunkSize)),setTimeout(function(){h._send(c,e)},i)}else h.end(g.status);else e.retry=0,e.end==e.size-1?h.end(g.status):(b.log("X-Last-Known-Byte: "+a),a&&(e.end=a),e.file.FileAPIReadPosition=e.end,setTimeout(function(){h._send(c,e)},0));g=null}},e.start=e.end+1,e.end=Math.max(Math.min(e.start+c.chunkSize,e.size)-1,e.start);var r=e.file,s=(r.slice||r.mozSlice||r.webkitSlice).call(r,e.start,e.end+1);e.size&&!s.size?setTimeout(function(){h.end(-1)}):(g.setRequestHeader("Content-Range","bytes "+e.start+"-"+e.end+"/"+e.size),g.setRequestHeader("Content-Disposition","attachment; filename="+encodeURIComponent(e.name)),g.setRequestHeader("Content-Type",e.type||"application/octet-stream"),g.send(s)),r=s=null}else if(g.upload&&g.upload.addEventListener("progress",b.throttle(function(a){c.progress(a,h,c)},100),!1),g.onreadystatechange=function(){if(h.status=g.status,h.statusText=g.statusText,h.readyState=g.readyState,4==g.readyState){for(var a in f)h["response"+a]=g["response"+a];if(g.onreadystatechange=null,!g.status||g.status>201)if(b.log("Error: "+g.status),(!g.status&&!g.aborted||500==g.status)&&(c.retry||0)<c.uploadRetry){c.retry=(c.retry||0)+1;var d=b.networkDownRetryTimeout;c.pause(c.file,c),setTimeout(function(){h._send(c,e)},d)}else h.end(g.status);else h.end(g.status);g=null}},b.isArray(e)){g.setRequestHeader("Content-Type","multipart/form-data; boundary=_"+b.expando);var t=e.join("")+"--_"+b.expando+"--";if(g.sendAsBinary)g.sendAsBinary(t);else{var u=Array.prototype.map.call(t,function(a){return 255&a.charCodeAt(0)});g.send(new Uint8Array(u).buffer)}}else g.send(e)}}},b.XHR=e}(window,FileAPI),function(a,b){"use strict";function c(a){return a>=0?a+"px":a}function d(a){var c,d=f.createElement("canvas"),e=!1;try{c=d.getContext("2d"),c.drawImage(a,0,0,1,1),e=255!=c.getImageData(0,0,1,1).data[4]}catch(g){b.log("[FileAPI.Camera] detectVideoSignal:",g)}return e}var e=a.URL||a.webkitURL,f=a.document,g=a.navigator,h=g.getUserMedia||g.webkitGetUserMedia||g.mozGetUserMedia||g.msGetUserMedia,i=!!h;b.support.media=i;var j=function(a){this.video=a};j.prototype={isActive:function(){return!!this._active},start:function(a){var b,c,f=this,i=f.video,j=function(d){f._active=!d,clearTimeout(c),clearTimeout(b),a&&a(d,f)};h.call(g,{video:!0},function(a){f.stream=a,i.src=e.createObjectURL(a),b=setInterval(function(){d(i)&&j(null)},1e3),c=setTimeout(function(){j("timeout");
	},5e3),i.play()},j)},stop:function(){try{this._active=!1,this.video.pause();try{this.stream.stop()}catch(a){b.each(this.stream.getTracks(),function(a){a.stop()})}this.stream=null}catch(a){b.log("[FileAPI.Camera] stop:",a)}},shot:function(){return new k(this.video)}},j.get=function(a){return new j(a.firstChild)},j.publish=function(d,e,g){"function"==typeof e&&(g=e,e={}),e=b.extend({},{width:"100%",height:"100%",start:!0},e),d.jquery&&(d=d[0]);var h=function(a){if(a)g(a);else{var b=j.get(d);e.start?b.start(g):g(null,b)}};if(d.style.width=c(e.width),d.style.height=c(e.height),b.html5&&i){var k=f.createElement("video");k.style.width=c(e.width),k.style.height=c(e.height),__webpack_provided_window_dot_jQuery?jQuery(d).empty():d.innerHTML="",d.appendChild(k),h()}else j.fallback(d,e,h)},j.fallback=function(a,b,c){c("not_support_camera")};var k=function(a){var c=a.nodeName?b.Image.toCanvas(a):a,d=b.Image(c);return d.type="image/png",d.width=c.width,d.height=c.height,d.size=c.width*c.height*4,d};j.Shot=k,b.Camera=j}(window,FileAPI),function(a,b,c){"use strict";var d=a.document,e=a.location,f=a.navigator,g=c.each;c.support.flash=function(){var b=f.mimeTypes,d=!1;if(f.plugins&&"object"==typeof f.plugins["Shockwave Flash"])d=f.plugins["Shockwave Flash"].description&&!(b&&b["application/x-shockwave-flash"]&&!b["application/x-shockwave-flash"].enabledPlugin);else try{d=!(!a.ActiveXObject||!new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))}catch(g){c.log("Flash -- does not supported.")}return d&&/^file:/i.test(e)&&c.log("[warn] Flash does not work on `file:` protocol."),d}(),c.support.flash&&(!c.html5||!c.support.html5||c.cors&&!c.support.cors||c.media&&!c.support.media)&&function(){function h(a){return('<object id="#id#" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+(a.width||"100%")+'" height="'+(a.height||"100%")+'"><param name="movie" value="#src#" /><param name="flashvars" value="#flashvars#" /><param name="swliveconnect" value="true" /><param name="allowscriptaccess" value="always" /><param name="allownetworking" value="all" /><param name="menu" value="false" /><param name="wmode" value="#wmode#" /><embed flashvars="#flashvars#" swliveconnect="true" allownetworking="all" allowscriptaccess="always" name="#id#" src="#src#" width="'+(a.width||"100%")+'" height="'+(a.height||"100%")+'" menu="false" wmode="transparent" type="application/x-shockwave-flash"></embed></object>').replace(/#(\w+)#/gi,function(b,c){return a[c]})}function i(a,b){if(a&&a.style){var c,d;for(c in b){d=b[c],"number"==typeof d&&(d+="px");try{a.style[c]=d}catch(e){}}}}function j(a,b){g(b,function(b,c){var d=a[c];a[c]=function(){return this.parent=d,b.apply(this,arguments)}})}function k(a){return a&&!a.flashId}function l(a){var b=a.wid=c.uid();return v._fn[b]=a,"FileAPI.Flash._fn."+b}function m(a){try{v._fn[a.wid]=null,delete v._fn[a.wid]}catch(b){}}function n(a,b){if(!u.test(a)){if(/^\.\//.test(a)||"/"!=a.charAt(0)){var c=e.pathname;c=c.substr(0,c.lastIndexOf("/")),a=(c+"/"+a).replace("/./","/")}"//"!=a.substr(0,2)&&(a="//"+e.host+a),u.test(a)||(a=e.protocol+a)}return b&&(a+=(/\?/.test(a)?"&":"?")+b),a}function o(a,b,e){function f(){try{var a=v.get(j);a.setImage(b)}catch(d){c.log('[err] FlashAPI.Preview.setImage -- can not set "base64":',d)}}var g,j=c.uid(),k=d.createElement("div"),o=10;for(g in a)k.setAttribute(g,a[g]),k[g]=a[g];i(k,a),a.width="100%",a.height="100%",k.innerHTML=h(c.extend({id:j,src:n(c.flashImageUrl,"r="+c.uid()),wmode:"opaque",flashvars:"scale="+a.scale+"&callback="+l(function p(){return m(p),--o>0&&f(),!0})},a)),e(!1,k),k=null}function p(a){return{id:a.id,name:a.name,matrix:a.matrix,flashId:a.flashId}}function q(b){var c=b.getBoundingClientRect(),e=d.body,f=(b&&b.ownerDocument).documentElement;return{top:c.top+(a.pageYOffset||f.scrollTop)-(f.clientTop||e.clientTop||0),left:c.left+(a.pageXOffset||f.scrollLeft)-(f.clientLeft||e.clientLeft||0),width:c.right-c.left,height:c.bottom-c.top}}var r=c.uid(),s=0,t={},u=/^https?:/i,v={_fn:{},init:function(){var a=d.body&&d.body.firstChild;if(a)do if(1==a.nodeType){c.log("FlashAPI.state: awaiting");var b=d.createElement("div");return b.id="_"+r,i(b,{top:1,right:1,width:5,height:5,position:"absolute",zIndex:"2147483647"}),a.parentNode.insertBefore(b,a),void v.publish(b,r)}while(a=a.nextSibling);10>s&&setTimeout(v.init,50*++s)},publish:function(a,b,d){d=d||{},a.innerHTML=h({id:b,src:n(c.flashUrl,"r="+c.version),wmode:d.camera?"":"transparent",flashvars:"callback="+(d.onEvent||"FileAPI.Flash.onEvent")+"&flashId="+b+"&storeKey="+f.userAgent.match(/\d/gi).join("")+"_"+c.version+(v.isReady||(c.pingUrl?"&ping="+c.pingUrl:""))+"&timeout="+c.flashAbortTimeout+(d.camera?"&useCamera="+n(c.flashWebcamUrl):"")+"&debug="+(c.debug?"1":"")},d)},ready:function(){c.log("FlashAPI.state: ready"),v.ready=c.F,v.isReady=!0,v.patch(),v.patchCamera&&v.patchCamera(),c.event.on(d,"mouseover",v.mouseover),c.event.on(d,"click",function(a){v.mouseover(a)&&(a.preventDefault?a.preventDefault():a.returnValue=!0)})},getEl:function(){return d.getElementById("_"+r)},getWrapper:function(a){do if(/js-fileapi-wrapper/.test(a.className))return a;while((a=a.parentNode)&&a!==d.body)},mouseover:function(a){var b=c.event.fix(a).target;if(/input/i.test(b.nodeName)&&"file"==b.type&&!b.disabled){var e=b.getAttribute(r),f=v.getWrapper(b);if(c.multiFlash){if("i"==e||"r"==e)return!1;if("p"!=e){b.setAttribute(r,"i");var g=d.createElement("div");if(!f)return void c.log("[err] FlashAPI.mouseover: js-fileapi-wrapper not found");i(g,{top:0,left:0,width:b.offsetWidth,height:b.offsetHeight,zIndex:"2147483647",position:"absolute"}),f.appendChild(g),v.publish(g,c.uid()),b.setAttribute(r,"p")}return!0}if(f){var h=q(f);i(v.getEl(),h),v.curInp=b}}else/object|embed/i.test(b.nodeName)||i(v.getEl(),{top:1,left:1,width:5,height:5})},onEvent:function(a){var b=a.type;if("ready"==b){try{v.getInput(a.flashId).setAttribute(r,"r")}catch(d){}return v.ready(),setTimeout(function(){v.mouseenter(a)},50),!0}"ping"===b?c.log("(flash -> js).ping:",[a.status,a.savedStatus],a.error):"log"===b?c.log("(flash -> js).log:",a.target):b in v&&setTimeout(function(){c.log("FlashAPI.event."+a.type+":",a),v[b](a)},1)},mouseenter:function(a){var b=v.getInput(a.flashId);if(b){v.cmd(a,"multiple",null!=b.getAttribute("multiple"));var d=[],e={};g((b.getAttribute("accept")||"").split(/,\s*/),function(a){c.accept[a]&&g(c.accept[a].split(" "),function(a){e[a]=1})}),g(e,function(a,b){d.push(b)}),v.cmd(a,"accept",d.length?d.join(",")+","+d.join(",").toUpperCase():"*")}},get:function(b){return d[b]||a[b]||d.embeds[b]},getInput:function(a){if(!c.multiFlash)return v.curInp;try{var b=v.getWrapper(v.get(a));if(b)return b.getElementsByTagName("input")[0]}catch(d){c.log('[err] Can not find "input" by flashId:',a,d)}},select:function(a){var e,f=v.getInput(a.flashId),h=c.uid(f),i=a.target.files;g(i,function(a){c.checkFileObj(a)}),t[h]=i,d.createEvent?(e=d.createEvent("Event"),e.files=i,e.initEvent("change",!0,!0),f.dispatchEvent(e)):b?b(f).trigger({type:"change",files:i}):(e=d.createEventObject(),e.files=i,f.fireEvent("onchange",e))},cmd:function(a,b,d,e){try{return c.log("(js -> flash)."+b+":",d),v.get(a.flashId||a).cmd(b,d)}catch(f){c.log("(js -> flash).onError:",f.toString()),e||setTimeout(function(){v.cmd(a,b,d,!0)},50)}},patch:function(){c.flashEngine=!0,j(c,{getFiles:function(a,b,d){if(d)return c.filterFiles(c.getFiles(a),b,d),null;var e=c.isArray(a)?a:t[c.uid(a.target||a.srcElement||a)];return e?(b&&(b=c.getFilesFilter(b),e=c.filter(e,function(a){return b.test(a.name)})),e):this.parent.apply(this,arguments)},getInfo:function(a,b){if(k(a))this.parent.apply(this,arguments);else if(a.isShot)b(null,a.info={width:a.width,height:a.height});else{if(!a.__info){var d=a.__info=c.defer();v.cmd(a,"getFileInfo",{id:a.id,callback:l(function e(b,c){m(e),d.resolve(b,a.info=c)})})}a.__info.then(b)}}}),c.support.transform=!0,c.Image&&j(c.Image.prototype,{get:function(a,b){return this.set({scaleMode:b||"noScale"}),this.parent(a)},_load:function(a,b){if(c.log("FlashAPI.Image._load:",a),k(a))this.parent.apply(this,arguments);else{var d=this;c.getInfo(a,function(c){b.call(d,c,a)})}},_apply:function(a,b){if(c.log("FlashAPI.Image._apply:",a),k(a))this.parent.apply(this,arguments);else{var d=this.getMatrix(a.info),e=b;v.cmd(a,"imageTransform",{id:a.id,matrix:d,callback:l(function f(g,h){c.log("FlashAPI.Image._apply.callback:",g),m(f),g?e(g):c.support.html5||c.support.dataURI&&!(h.length>3e4)?(d.filter&&(e=function(a,e){a?b(a):c.Image.applyFilter(e,d.filter,function(){b(a,this.canvas)})}),c.newImage("data:"+a.type+";base64,"+h,e)):o({width:d.deg%180?d.dh:d.dw,height:d.deg%180?d.dw:d.dh,scale:d.scaleMode},h,e)})})}},toData:function(a){var b=this.file,d=b.info,e=this.getMatrix(d);c.log("FlashAPI.Image.toData"),k(b)?this.parent.apply(this,arguments):("auto"==e.deg&&(e.deg=c.Image.exifOrientation[d&&d.exif&&d.exif.Orientation]||0),a.call(this,!b.info,{id:b.id,flashId:b.flashId,name:b.name,type:b.type,matrix:e}))}}),c.Image&&j(c.Image,{fromDataURL:function(a,b,d){!c.support.dataURI||a.length>3e4?o(c.extend({scale:"exactFit"},b),a.replace(/^data:[^,]+,/,""),function(a,b){d(b)}):this.parent(a,b,d)}}),j(c.Form.prototype,{toData:function(a){for(var b=this.items,d=b.length;d--;)if(b[d].file&&k(b[d].blob))return this.parent.apply(this,arguments);c.log("FlashAPI.Form.toData"),a(b)}}),j(c.XHR.prototype,{_send:function(a,b){if(b.nodeName||b.append&&c.support.html5||c.isArray(b)&&"string"==typeof b[0])return this.parent.apply(this,arguments);var d,e,f={},h={},i=this;if(g(b,function(a){a.file?(h[a.name]=a=p(a.blob),e=a.id,d=a.flashId):f[a.name]=a.blob}),e||(d=r),!d)return c.log("[err] FlashAPI._send: flashId -- undefined"),this.parent.apply(this,arguments);c.log("FlashAPI.XHR._send: "+d+" -> "+e),i.xhr={headers:{},abort:function(){v.cmd(d,"abort",{id:e})},getResponseHeader:function(a){return this.headers[a]},getAllResponseHeaders:function(){return this.headers}};var j=c.queue(function(){v.cmd(d,"upload",{url:n(a.url.replace(/([a-z]+)=(\?)&?/i,"")),data:f,files:e?h:null,headers:a.headers||{},callback:l(function b(d){var e=d.type,f=d.result;c.log("FlashAPI.upload."+e),"progress"==e?(d.loaded=Math.min(d.loaded,d.total),d.lengthComputable=!0,a.progress(d)):"complete"==e?(m(b),"string"==typeof f&&(i.responseText=f.replace(/%22/g,'"').replace(/%5c/g,"\\").replace(/%26/g,"&").replace(/%25/g,"%")),i.end(d.status||200)):("abort"==e||"error"==e)&&(i.end(d.status||0,d.message),m(b))})})});g(h,function(a){j.inc(),c.getInfo(a,j.next)}),j.check()}})}};c.Flash=v,c.newImage("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",function(a,b){c.support.dataURI=!(1!=b.width||1!=b.height),v.init()})}()}(window,__webpack_provided_window_dot_jQuery,FileAPI),function(a,b,c){"use strict";var d=c.each,e=[];!c.support.flash||!c.media||c.support.media&&c.html5||!function(){function a(a){var b=a.wid=c.uid();return c.Flash._fn[b]=a,"FileAPI.Flash._fn."+b}function b(a){try{c.Flash._fn[a.wid]=null,delete c.Flash._fn[a.wid]}catch(b){}}var f=c.Flash;c.extend(c.Flash,{patchCamera:function(){c.Camera.fallback=function(d,e,g){var h=c.uid();c.log("FlashAPI.Camera.publish: "+h),f.publish(d,h,c.extend(e,{camera:!0,onEvent:a(function i(a){"camera"===a.type&&(b(i),a.error?(c.log("FlashAPI.Camera.publish.error: "+a.error),g(a.error)):(c.log("FlashAPI.Camera.publish.success: "+h),g(null)))})}))},d(e,function(a){c.Camera.fallback.apply(c.Camera,a)}),e=[],c.extend(c.Camera.prototype,{_id:function(){return this.video.id},start:function(d){var e=this;f.cmd(this._id(),"camera.on",{callback:a(function g(a){b(g),a.error?(c.log("FlashAPI.camera.on.error: "+a.error),d(a.error,e)):(c.log("FlashAPI.camera.on.success: "+e._id()),e._active=!0,d(null,e))})})},stop:function(){this._active=!1,f.cmd(this._id(),"camera.off")},shot:function(){c.log("FlashAPI.Camera.shot:",this._id());var a=c.Flash.cmd(this._id(),"shot",{});return a.type="image/png",a.flashId=this._id(),a.isShot=!0,new c.Camera.Shot(a)}})}}),c.Camera.fallback=function(){e.push(arguments)}}()}(window,__webpack_provided_window_dot_jQuery,FileAPI),"function"=="function"&&__webpack_require__(9)&&!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return FileAPI}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(1), __webpack_require__(1)))

/***/ },
/* 9 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/*!
	 * jQuery.filer
	 * Copyright (c) 2015 CreativeDream
	 * Website: https://github.com/CreativeDream/jquery.filer
	 * Version: 1.0.4 (29-Oct-2015)
	 * Requires: jQuery v1.7.1 or later
	 */
	!function(e){"use strict";e.fn.filer=function(i){return this.each(function(t,n){var l=e(n),a=".jFiler",r=e(),o=e(),s=e(),d=[],f=e.extend(!0,{},e.fn.filer.defaults,i),u={init:function(){l.wrap('<div class="jFiler"></div>'),r=l.closest(a),u._changeInput()},_bindInput:function(){f.changeInput&&o.size()>0&&o.bind("click",u._clickHandler),l.on({focus:function(){o.addClass("focused")},blur:function(){o.removeClass("focused")},change:function(){u._onChange()}}),f.dragDrop&&(o.length>0?o:l).bind("drop",u._dragDrop.drop).bind("dragover",u._dragDrop.dragEnter).bind("dragleave",u._dragDrop.dragLeave),f.uploadFile&&f.clipBoardPaste&&e(window).on("paste",u._clipboardPaste)},_unbindInput:function(){f.changeInput&&o.size()>0&&o.unbind("click",u._clickHandler)},_clickHandler:function(){l.click()},_applyAttrSettings:function(){var e=["name","limit","maxSize","extensions","changeInput","showThumbs","appendTo","theme","addMore","excludeName","files"];for(var i in e){var t="data-jfiler-"+e[i];if(u._assets.hasAttr(t)){switch(e[i]){case"changeInput":case"showThumbs":case"addMore":f[e[i]]=["true","false"].indexOf(l.attr(t))>-1?"true"==l.attr(t):l.attr(t);break;case"extensions":f[e[i]]=l.attr(t).replace(/ /g,"").split(",");break;case"files":f[e[i]]=JSON.parse(l.attr(t));break;default:f[e[i]]=l.attr(t)}l.removeAttr(t)}}},_changeInput:function(){if(u._applyAttrSettings(),f.theme&&r.addClass("jFiler-theme-"+f.theme),"input"!=l.get(0).tagName.toLowerCase()&&"file"!=l.get(0).type)o=l,l=e('<input type="file" name="'+f.name+'" />'),l.css({position:"absolute",left:"-9999px",top:"-9999px","z-index":"-9999"}),r.prepend(l),u._isGn=l;else if(f.changeInput){switch(typeof f.changeInput){case"boolean":o=e('<div class="jFiler-input"><div class="jFiler-input-caption"><span>'+f.captions.feedback+'</span></div><div class="jFiler-input-button">'+f.captions.button+'</div></div>"');break;case"string":case"object":o=e(f.changeInput);break;case"function":o=e(f.changeInput(r,l,f))}l.after(o),l.css({position:"absolute",left:"-9999px",top:"-9999px","z-index":"-9999"})}(!f.limit||f.limit&&f.limit>=2)&&(l.attr("multiple","multiple"),"[]"!=l.attr("name").slice(-2)?l.attr("name",l.attr("name")+"[]"):null),u._bindInput(),f.files&&u._append(!1,{files:f.files})},_clear:function(){u.files=null,l.prop("jFiler").files=null,f.uploadFile||f.addMore||u._reset(),u._set("feedback",u._itFl&&u._itFl.length>0?u._itFl.length+" "+f.captions.feedback2:f.captions.feedback),null!=f.onEmpty&&"function"==typeof f.onEmpty?f.onEmpty(r,o,l):null},_reset:function(i){if(!i){if(!f.uploadFile&&f.addMore){for(var t=0;t<d.length;t++)d[t].remove();d=[],u._unbindInput(),l=u._isGn?u._isGn:e(n),u._bindInput()}u._set("input","")}u._itFl=[],u._itFc=null,u._ajFc=0,l.prop("jFiler").files_list=u._itFl,l.prop("jFiler").current_file=u._itFc,u._prEr||(u._itFr=[],r.find("input[name^='jfiler-items-exclude-']:hidden").remove()),s.fadeOut("fast",function(){e(this).remove()}),s=e()},_set:function(e,i){switch(e){case"input":l.val("");break;case"feedback":o.length>0&&o.find(".jFiler-input-caption span").html(i)}},_filesCheck:function(){var i=0;if(f.limit&&u.files.length+u._itFl.length>f.limit)return alert(u._assets.textParse(f.captions.errors.filesLimit)),!1;for(var t=0;t<u.files.length;t++){var n=u.files[t].name.split(".").pop().toLowerCase(),l=u.files[t],a={name:l.name,size:l.size,size2:u._assets.bytesToSize(l.size),type:l.type,ext:n};if(null!=f.extensions&&-1==e.inArray(n,f.extensions))return alert(u._assets.textParse(f.captions.errors.filesType,a)),!1;if(null!=f.maxSize&&u.files[t].size>1048576*f.maxSize)return alert(u._assets.textParse(f.captions.errors.filesSize,a)),!1;if(4096==l.size&&0==l.type.length)return!1;i+=u.files[t].size}if(null!=f.maxSize&&i>=Math.round(1048576*f.maxSize))return alert(u._assets.textParse(f.captions.errors.filesSizeAll)),!1;if(f.addMore||f.uploadFile){var a=u._itFl.filter(function(e){return e.file.name!=l.name||e.file.size!=l.size||e.file.type!=l.type||(l.lastModified?e.file.lastModified!=l.lastModified:0)?void 0:!0});if(a.length>0)return!1}return!0},_thumbCreator:{create:function(i){var t=u.files[i],n=u._itFc?u._itFc.id:i,l=t.name,a=t.size,r=t.type.split("/",1).toString().toLowerCase(),o=-1!=l.indexOf(".")?l.split(".").pop().toLowerCase():"",d=f.uploadFile?'<div class="jFiler-jProgressBar">'+f.templates.progressBar+"</div>":"",p={id:n,name:l,size:a,size2:u._assets.bytesToSize(a),type:r,extension:o,icon:u._assets.getIcon(o,r),icon2:u._thumbCreator.generateIcon({type:r,extension:o}),image:'<div class="jFiler-item-thumb-image fi-loading"></div>',progressBar:d,_appended:t._appended},c="";return t.opts&&(p=e.extend({},t.opts,p)),c=e(u._thumbCreator.renderContent(p)).attr("data-jfiler-index",n),c.get(0).jfiler_id=n,u._thumbCreator.renderFile(t,c,p),t.forList?c:(u._itFc.html=c,c.hide()[f.templates.itemAppendToEnd?"appendTo":"prependTo"](s.find(f.templates._selectors.list)).show(),void(t._appended||u._onSelect(i)))},renderContent:function(e){return u._assets.textParse(e._appended?f.templates.itemAppend:f.templates.item,e)},renderFile:function(i,t,n){if(0==t.find(".jFiler-item-thumb-image").size())return!1;if(i.file&&"image"==n.type){var l='<img src="'+i.file+'" draggable="false" />',a=t.find(".jFiler-item-thumb-image.fi-loading");return e(l).error(function(){l=u._thumbCreator.generateIcon(n),t.addClass("jFiler-no-thumbnail"),a.removeClass("fi-loading").html(l)}).load(function(){a.removeClass("fi-loading").html(l)}),!0}if(window.File&&window.FileList&&window.FileReader&&"image"==n.type&&n.size<6e6){var r=new FileReader;r.onload=function(i){var l='<img src="'+i.target.result+'" draggable="false" />',a=t.find(".jFiler-item-thumb-image.fi-loading");e(l).error(function(){l=u._thumbCreator.generateIcon(n),t.addClass("jFiler-no-thumbnail"),a.removeClass("fi-loading").html(l)}).load(function(){a.removeClass("fi-loading").html(l)})},r.readAsDataURL(i)}else{var l=u._thumbCreator.generateIcon(n),a=t.find(".jFiler-item-thumb-image.fi-loading");t.addClass("jFiler-no-thumbnail"),a.removeClass("fi-loading").html(l)}},generateIcon:function(i){var t=new Array(3);if(i&&i.type&&i.extension)switch(i.type){case"image":t[0]="f-image",t[1]='<i class="icon-jfi-file-image"></i>';break;case"video":t[0]="f-video",t[1]='<i class="icon-jfi-file-video"></i>';break;case"audio":t[0]="f-audio",t[1]='<i class="icon-jfi-file-audio"></i>';break;default:t[0]="f-file f-file-ext-"+i.extension,t[1]=i.extension.length>0?"."+i.extension:"",t[2]=1}else t[0]="f-file",t[1]=i.extension&&i.extension.length>0?"."+i.extension:"",t[2]=1;var n='<span class="jFiler-icon-file '+t[0]+'">'+t[1]+"</span>";if(1==t[2]){var l=u._assets.text2Color(i.extension);if(l){var a=e(n).appendTo("body"),r=a.css("box-shadow");r=l+r.substring(r.replace(/^.*(rgba?\([^)]+\)).*$/,"$1").length,r.length),a.css({"-webkit-box-shadow":r,"-moz-box-shadow":r,"box-shadow":r}).attr("style","-webkit-box-shadow: "+r+"; -moz-box-shadow: "+r+"; box-shadow: "+r+";"),n=a.prop("outerHTML"),a.remove()}}return n},_box:function(i){if(null!=f.beforeShow&&"function"==typeof f.beforeShow?!f.beforeShow(u.files,s,r,o,l):!1)return!1;if(s.length<1){if(f.appendTo)var t=e(f.appendTo);else var t=r;t.find(".jFiler-items").remove(),s=e('<div class="jFiler-items jFiler-row"></div>'),s.append(u._assets.textParse(f.templates.box)).appendTo(t),s.on("click",f.templates._selectors.remove,function(t){t.preventDefault();var n=f.templates.removeConfirmation?confirm(f.captions.removeConfirmation):!0;n&&u._remove(i?i.remove.event:t,i?i.remove.el:e(this).closest(f.templates._selectors.item))})}for(var n=0;n<u.files.length;n++)u.files[n]._appended||(u.files[n]._choosed=!0),u._addToMemory(n),u._thumbCreator.create(n)}},_upload:function(){var i=u._itFc.html,t=new FormData;if(t.append(l.attr("name"),u._itFc.file,u._itFc.file.name?u._itFc.file.name:!1),null!=f.uploadFile.data&&e.isPlainObject(f.uploadFile.data))for(var n in f.uploadFile.data)t.append(n,f.uploadFile.data[n]);u._ajax.send(i,t,u._itFc)},_ajax:{send:function(i,t,n){return n.ajax=e.ajax({url:f.uploadFile.url,data:t,type:f.uploadFile.type,enctype:f.uploadFile.enctype,xhr:function(){var t=e.ajaxSettings.xhr();return t.upload&&t.upload.addEventListener("progress",function(e){u._ajax.progressHandling(e,i)},!1),t},complete:function(e,i){n.ajax=!1,u._ajFc++,u._ajFc>=u.files.length&&(u._ajFc=0,null!=f.uploadFile.onComplete&&"function"==typeof f.uploadFile.onComplete?f.uploadFile.onComplete(s,r,o,l,e,i):null)},beforeSend:function(e,t){return null!=f.uploadFile.beforeSend&&"function"==typeof f.uploadFile.beforeSend?f.uploadFile.beforeSend(i,s,r,o,l,n.id,e,t):!0},success:function(e,t,a){n.uploaded=!0,null!=f.uploadFile.success&&"function"==typeof f.uploadFile.success?f.uploadFile.success(e,i,s,r,o,l,n.id,t,a):null},error:function(e,t,a){n.uploaded=!1,null!=f.uploadFile.error&&"function"==typeof f.uploadFile.error?f.uploadFile.error(i,s,r,o,l,n.id,e,t,a):null},statusCode:f.uploadFile.statusCode,cache:!1,contentType:!1,processData:!1}),n.ajax},progressHandling:function(e,i){if(e.lengthComputable){var t=Math.round(100*e.loaded/e.total).toString();null!=f.uploadFile.onProgress&&"function"==typeof f.uploadFile.onProgress?f.uploadFile.onProgress(t,i,s,r,o,l):null,i.find(".jFiler-jProgressBar").find(f.templates._selectors.progressBar).css("width",t+"%")}}},_dragDrop:{dragEnter:function(e){e.preventDefault(),e.stopPropagation(),r.addClass("dragged"),u._set("feedback",f.captions.drop),null!=f.dragDrop.dragEnter&&"function"==typeof f.dragDrop.dragEnter?f.dragDrop.dragEnter(e,o,l,r):null},dragLeave:function(e){return e.preventDefault(),e.stopPropagation(),u._dragDrop._dragLeaveCheck(e)?(r.removeClass("dragged"),u._set("feedback",f.captions.feedback),void(null!=f.dragDrop.dragLeave&&"function"==typeof f.dragDrop.dragLeave?f.dragDrop.dragLeave(e,o,l,r):null)):!1},drop:function(e){e.preventDefault(),r.removeClass("dragged"),!e.originalEvent.dataTransfer.files||e.originalEvent.dataTransfer.files.length<=0||(u._set("feedback",f.captions.feedback),u._onChange(e,e.originalEvent.dataTransfer.files),null!=f.dragDrop.drop&&"function"==typeof f.dragDrop.drop?f.dragDrop.drop(e.originalEvent.dataTransfer.files,e,o,l,r):null)},_dragLeaveCheck:function(i){var t=i.relatedTarget,n=!1;return t!==o&&(t&&(n=e.contains(o,t)),n)?!1:!0}},_clipboardPaste:function(e,i){if((i||e.originalEvent.clipboardData||e.originalEvent.clipboardData.items)&&(!i||e.originalEvent.dataTransfer||e.originalEvent.dataTransfer.items)&&!u._clPsePre){var t=i?e.originalEvent.dataTransfer.items:e.originalEvent.clipboardData.items,n=function(e,i,t){i=i||"",t=t||512;for(var n=atob(e),l=[],a=0;a<n.length;a+=t){for(var r=n.slice(a,a+t),o=new Array(r.length),s=0;s<r.length;s++)o[s]=r.charCodeAt(s);var d=new Uint8Array(o);l.push(d)}var f=new Blob(l,{type:i});return f};if(t)for(var l=0;l<t.length;l++)if(-1!==t[l].type.indexOf("image")||-1!==t[l].type.indexOf("text/uri-list")){if(i)try{window.atob(e.originalEvent.dataTransfer.getData("text/uri-list").toString().split(",")[1])}catch(e){return}var a=i?n(e.originalEvent.dataTransfer.getData("text/uri-list").toString().split(",")[1],"image/png"):t[l].getAsFile();a.name=Math.random().toString(36).substring(5),a.name+=-1!=a.type.indexOf("/")?"."+a.type.split("/")[1].toString().toLowerCase():".png",u._onChange(e,[a]),u._clPsePre=setTimeout(function(){delete u._clPsePre},1e3)}}},_onSelect:function(i){f.uploadFile&&!e.isEmptyObject(f.uploadFile)&&u._upload(i),null!=f.onSelect&&"function"==typeof f.onSelect?f.onSelect(u.files[i],u._itFc.html,s,r,o,l):null,i+1>=u.files.length&&(null!=f.afterShow&&"function"==typeof f.afterShow?f.afterShow(s,r,o,l):null)},_onChange:function(i,t){if(t){if(!t||0==t.length)return u._set("input",""),u._clear(),!1;u.files=t}else{if(!l.get(0).files||"undefined"==typeof l.get(0).files||0==l.get(0).files.length)return f.uploadFile||f.addMore||(u._set("input",""),u._clear()),!1;u.files=l.get(0).files}if(f.uploadFile||f.addMore||u._reset(!0),l.prop("jFiler").files=u.files,!u._filesCheck()||(null!=f.beforeSelect&&"function"==typeof f.beforeSelect?!f.beforeSelect(u.files,s,r,o,l):!1))return u._set("input",""),u._clear(),!1;if(u._set("feedback",u.files.length+u._itFl.length+" "+f.captions.feedback2),f.showThumbs)u._thumbCreator._box();else for(var n=0;n<u.files.length;n++)u.files[n]._choosed=!0,u._addToMemory(n),u._onSelect(n);if(!f.uploadFile&&f.addMore){var a=e('<input type="file" />'),p=l.prop("attributes");e.each(p,function(){a.attr(this.name,this.value)}),l.after(a),u._unbindInput(),d.push(a),l=a,u._bindInput()}},_append:function(e,i){var t=i?i.files:!1;if(t&&!(t.length<=0)&&(u.files=t,l.prop("jFiler").files=u.files,f.showThumbs)){for(var n=0;n<u.files.length;n++)u.files[n]._appended=!0;u._thumbCreator._box()}},_getList:function(e,i){var t=i?i.files:!1;if(t&&!(t.length<=0)&&(u.files=t,l.prop("jFiler").files=u.files,f.showThumbs)){for(var n=[],a=0;a<u.files.length;a++)u.files[a].forList=!0,n.push(u._thumbCreator.create(a));i.callback&&i.callback(n,s,r,o,l)}},_retryUpload:function(i,t){var n=parseInt("object"==typeof t?t.attr("data-jfiler-index"):t),a=u._itFl.filter(function(e){return e.id==n});return a.length>0?!f.uploadFile||e.isEmptyObject(f.uploadFile)||a[0].uploaded?void 0:(u._itFc=a[0],l.prop("jFiler").current_file=u._itFc,u._upload(n),!0):!1},_remove:function(i,n){if(n.binded){if("undefined"!=typeof n.data.id&&(n=s.find(f.templates._selectors.item+"[data-jfiler-index='"+n.data.id+"']"),0==n.size()))return!1;n.data.el&&(n=n.data.el)}var a=n.get(0).jfiler_id||n.attr("data-jfiler-index"),d=null,p=function(i){var n=r.find("input[name^='jfiler-items-exclude-']:hidden").first(),a=u._itFl[i],o=[];if(0==n.size()&&(n=e('<input type="hidden" name="jfiler-items-exclude-'+(f.excludeName?f.excludeName:("[]"!=l.attr("name").slice(-2)?l.attr("name"):l.attr("name").substring(0,l.attr("name").length-2))+"-"+t)+'">'),n.appendTo(r)),a.file._choosed||a.file._appended||a.uploaded){if(u._prEr=!0,u._itFr.push(a),f.addMore){var s=a.input,d=0;u._itFl.filter(function(e){e.file._choosed&&e.input.get(0)==s.get(0)&&d++}),1==d&&(u._itFr=u._itFr.filter(function(e){return e.file._choosed?e.input.get(0)!=s.get(0):!0}),s.val(""),u._prEr=!1)}for(var p=0;p<u._itFr.length;p++)o.push(u._itFr[p].file.name);o=JSON.stringify(o),n.val(o)}},c=function(i,t){p(t),u._itFl.splice(t,1),u._itFl.length<1?(u._reset(),u._clear()):u._set("feedback",u._itFl.length+" "+f.captions.feedback2),i.fadeOut("fast",function(){e(this).remove()})};for(var m in u._itFl)"length"!==m&&u._itFl.hasOwnProperty(m)&&u._itFl[m].id==a&&(d=m);return u._itFl.hasOwnProperty(d)?u._itFl[d].ajax?(u._itFl[d].ajax.abort(),void c(n,d)):(null!=f.onRemove&&"function"==typeof f.onRemove?f.onRemove(n,u._itFl[d].file,d,s,r,o,l):null,void c(n,d)):!1},_addToMemory:function(i){u._itFl.push({id:u._itFl.length,file:u.files[i],html:e(),ajax:!1,uploaded:!1}),f.addMore&&!u.files[i]._appended&&(u._itFl[u._itFl.length-1].input=l),u._itFc=u._itFl[u._itFl.length-1],l.prop("jFiler").files_list=u._itFl,l.prop("jFiler").current_file=u._itFc},_assets:{bytesToSize:function(e){if(0==e)return"0 Byte";var i=1e3,t=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],n=Math.floor(Math.log(e)/Math.log(i));return(e/Math.pow(i,n)).toPrecision(3)+" "+t[n]},hasAttr:function(e,i){var i=i?i:l,t=i.attr(e);return t&&"undefined"!=typeof t?!0:!1},getIcon:function(i,t){var n=["audio","image","text","video"];return e.inArray(t,n)>-1?'<i class="icon-jfi-file-'+t+" jfi-file-ext-"+i+'"></i>':'<i class="icon-jfi-file-o jfi-file-type-'+t+" jfi-file-ext-"+i+'"></i>'},textParse:function(i,t){switch(t=e.extend({},{limit:f.limit,maxSize:f.maxSize},t&&e.isPlainObject(t)?t:{}),typeof i){case"string":return i.replace(/\{\{fi-(.*?)\}\}/g,function(e,i){return i=i.replace(/ /g,""),i.match(/(.*?)\|limitTo\:(\d+)/)?i.replace(/(.*?)\|limitTo\:(\d+)/,function(e,i,n){var i=t[i]?t[i]:"",l=i.substring(0,n);return l=i.length>l.length?l.substring(0,l.length-3)+"...":l}):t[i]?t[i]:""});case"function":return i(t);default:return i}},text2Color:function(e){if(!e||0==e.length)return!1;for(var i=0,t=0;i<e.length;t=e.charCodeAt(i++)+((t<<5)-t));for(var i=0,n="#";3>i;n+=("00"+(t>>2*i++&255).toString(16)).slice(-2));return n}},files:null,_itFl:[],_itFc:null,_itFr:[],_ajFc:0,_prEr:!1};return l.prop("jFiler",{options:f,listEl:s,boxEl:r,newInputEl:o,inputEl:l,files:u.files,files_list:u._itFl,current_file:u._itFc,append:function(e){return u._append(!1,{files:[e]})},remove:function(e){return u._remove(null,{binded:!0,data:{id:e}}),!0},reset:function(){return u._reset(),u._clear(),!0},retry:function(e){return u._retryUpload(e)}}),l.on("filer.append",function(e,i){u._append(e,i)}),l.on("filer.remove",function(e,i){i.binded=!0,u._remove(e,i)}),l.on("filer.reset",function(){return u._reset(),u._clear(),!0}),l.on("filer.generateList",function(e,i){return u._getList(e,i)}),l.on("filer.retry",function(e,i){return u._retryUpload(e,i)}),u.init(),this})},e.fn.filer.defaults={limit:null,maxSize:null,extensions:null,changeInput:!0,showThumbs:!1,appendTo:null,theme:"default",templates:{box:'<ul class="jFiler-items-list jFiler-items-default"></ul>',item:'<li class="jFiler-item"><div class="jFiler-item-container"><div class="jFiler-item-inner"><div class="jFiler-item-icon pull-left">{{fi-icon}}</div><div class="jFiler-item-info pull-left"><div class="jFiler-item-title" title="{{fi-name}}">{{fi-name | limitTo:30}}</div><div class="jFiler-item-others"><span>size: {{fi-size2}}</span><span>type: {{fi-extension}}</span><span class="jFiler-item-status">{{fi-progressBar}}</span></div><div class="jFiler-item-assets"><ul class="list-inline"><li><a class="icon-jfi-trash jFiler-item-trash-action"></a></li></ul></div></div></div></div></li>',itemAppend:'<li class="jFiler-item"><div class="jFiler-item-container"><div class="jFiler-item-inner"><div class="jFiler-item-icon pull-left">{{fi-icon}}</div><div class="jFiler-item-info pull-left"><div class="jFiler-item-title">{{fi-name | limitTo:35}}</div><div class="jFiler-item-others"><span>size: {{fi-size2}}</span><span>type: {{fi-extension}}</span><span class="jFiler-item-status"></span></div><div class="jFiler-item-assets"><ul class="list-inline"><li><a class="icon-jfi-trash jFiler-item-trash-action"></a></li></ul></div></div></div></div></li>',progressBar:'<div class="bar"></div>',itemAppendToEnd:!1,removeConfirmation:!0,_selectors:{list:".jFiler-items-list",item:".jFiler-item",progressBar:".bar",remove:".jFiler-item-trash-action"}},files:null,uploadFile:null,dragDrop:null,addMore:!1,clipBoardPaste:!0,excludeName:null,beforeShow:null,beforeSelect:null,onSelect:null,afterShow:null,onRemove:null,onEmpty:null,captions:{button:"Choose Files",feedback:"Choose files To Upload",feedback2:"files were chosen",drop:"Drop file here to Upload",removeConfirmation:"Are you sure you want to remove this file?",errors:{filesLimit:"Only {{fi-limit}} files are allowed to be uploaded.",filesType:"Only Images are allowed to be uploaded.",filesSize:"{{fi-name}} is too large! Please upload file up to {{fi-maxSize}} MB.",filesSizeAll:"Files you've choosed are too large! Please upload files up to {{fi-maxSize}} MB."}}}}(jQuery);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(12);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(19)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js!./jquery.filer.css", function() {
				var newContent = require("!!./../../css-loader/index.js!./jquery.filer.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(13)();
	// imports
	exports.i(__webpack_require__(14), "");

	// module
	exports.push([module.id, "/*!\n * CSS jQuery.filer\n * Copyright (c) 2015 CreativeDream\n * Version: 1.0.4 (29-Oct-2015)\n*/\n\n/*-------------------------\n\tBasic configurations\n-------------------------*/\n.jFiler * {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.jFiler {\n    font-family: sans-serif;\n    font-size: 14px;\n    color: #494949;\n}\n\n/* Helpers */\n.jFiler ul.list-inline li {\n    display: inline-block;\n    padding-right: 5px;\n    padding-left: 5px;\n}\n\n.jFiler .pull-left {\n    float: left;\n}\n\n.jFiler .pull-right {\n    float: right;\n}\n\n/* File Icons */\nspan.jFiler-icon-file {\n    position: relative;\n    width: 57px;\n    height: 70px;\n    display: inline-block;\n    line-height: 70px;\n    text-align: center;\n    border-radius: 3px;\n    color: #fff;\n    font-family: sans-serif;\n    font-size: 13px;\n    font-weight: bold;\n    overflow: hidden;\n    box-shadow: 42px -55px 0 0 #A4A7AC inset;\n}\n\nspan.jFiler-icon-file:after {\n    position: absolute;\n    top: -1px;\n    right: -1px;\n    display: inline-block;\n    content: '';\n    border-style: solid;\n    border-width: 16px 0 0 16px;\n    border-color: transparent transparent transparent #DADDE1;\n}\n\nspan.jFiler-icon-file i[class*=\"icon-jfi-\"] {\n    font-size: 24px;\n}\n\nspan.jFiler-icon-file.f-image {\n    box-shadow: 42px -55px 0 0 #e15955 inset;\n}\n\nspan.jFiler-icon-file.f-image:after {\n    border-left-color: #c6393f;\n}\n\nspan.jFiler-icon-file.f-video {\n    box-shadow: 42px -55px 0 0 #4183d7 inset;\n}\n\nspan.jFiler-icon-file.f-video:after {\n    border-left-color: #446cb3;\n}\n\nspan.jFiler-icon-file.f-audio {\n    box-shadow: 42px -55px 0 0 #5bab6e inset;\n}\n\nspan.jFiler-icon-file.f-audio:after {\n    border-left-color: #448353;\n}\n\n\n/* Progress Bar */\n.jFiler-jProgressBar {\n    height: 8px;\n    background: #f1f1f1;\n    margin-top: 3px;\n    margin-bottom: 0;\n    overflow: hidden;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n}\n\n.jFiler-jProgressBar .bar {\n    float: left;\n    width: 0;\n    height: 100%;\n    font-size: 12px;\n    color: #ffffff;\n    text-align: center;\n    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);\n    background-color: #50A1E9;\n    box-sizing: border-box;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n    -webkit-transition: width 0.3s ease;\n    -moz-transition: width 0.3s ease;\n    -o-transition: width 0.3s ease;\n    transition: width 0.3s ease;\n}\n\n.jFiler-jProgressBar .bar.dark {\n    background-color: #555;\n}\n\n.jFiler-jProgressBar .bar.blue {\n    background-color: #428bca;\n}\n\n.jFiler-jProgressBar .bar.green {\n    background-color: #5cb85c;\n}\n\n.jFiler-jProgressBar .bar.orange {\n    background-color: #f7a923;\n}\n\n.jFiler-jProgressBar .bar.red {\n    background-color: #d9534f;\n}\n\n/* Thumbs */\n.jFiler-row:after,\n.jFiler-item:after {\n    display: table;\n    line-height: 0;\n    content: \"\";\n    clear: both;\n}\n\n.jFiler-items ul {\n    margin: 0;\n    padding: 0;\n    list-style: none;\n}\n\n/*-------------------------\n\tDefault Theme\n-------------------------*/\n.jFiler-theme-default .jFiler-input {\n    position: relative;\n    display: block;\n    width: 400px;\n    height: 35px;\n    margin: 0 0 15px 0;\n    background: #fefefe;\n    border: 1px solid #cecece;\n    font-size: 12px;\n    font-family: sans-serif;\n    color: #888;\n    border-radius: 4px;\n    cursor: pointer;\n    overflow: hidden;\n    -webkit-box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n       -moz-box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n            box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n}\n\n.jFiler-theme-default .jFiler-input.focused {\n    outline: none;\n    -webkit-box-shadow: 0 0 7px rgba(0,0,0,0.1);\n    -moz-box-shadow: 0 0 7px rgba(0,0,0,0.1);\n    box-shadow: 0 0 7px rgba(0,0,0,0.1);\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input {\n    border: 1px dashed #aaaaaa;\n    background: #f9f9f9;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input:hover {\n    background: #FFF8D0;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input * {\n    pointer-events: none;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input .jFiler-input-caption {\n    width: 100%;\n    text-align: center;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input .jFiler-input-button {\n    display: none;\n}\n\n.jFiler-theme-default .jFiler-input-caption {\n    display: block;\n    float: left;\n    height: 100%;\n    padding-top: 8px;\n    padding-left: 10px;\n    text-overflow: ellipsis;\n    overflow: hidden;\n}\n\n.jFiler-theme-default .jFiler-input-button {\n    display: block;\n    float: right;\n    height: 100%;\n    padding-top: 8px;\n    padding-left: 15px;\n    padding-right: 15px;\n    border-left: 1px solid #ccc;\n    color: #666666;\n    text-align: center;\n    background-color: #fefefe;\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#fefefe),to(#f1f1f1));\n    background-image: -webkit-linear-gradient(top,#fefefe,#f1f1f1);\n    background-image: -o-linear-gradient(top,#fefefe,#f1f1f1);\n    background-image: linear-gradient(to bottom,#fefefe,#f1f1f1);\n    background-image: -moz-linear-gradient(top,#fefefe,#f1f1f1);\n    -webkit-transition: all .1s ease-out;\n       -moz-transition: all .1s ease-out;\n         -o-transition: all .1s ease-out;\n            transition: all .1s ease-out;\n}\n\n.jFiler-theme-default .jFiler-input-button:hover {\n    -moz-box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n    -webkit-box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n    box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n}\n\n.jFiler-theme-default .jFiler-input-button:active {\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#f1f1f1),to(#fefefe));\n    background-image: -webkit-linear-gradient(top,#f1f1f1,#fefefe);\n    background-image: -o-linear-gradient(top,#f1f1f1,#fefefe);\n    background-image: linear-gradient(to bottom,#f1f1f1,#fefefe);\n    background-image: -moz-linear-gradient(top,#f1f1f1,#fefefe);\n}\n\n/*-------------------------\n\tThumbnails\n-------------------------*/\n.jFiler-items-default .jFiler-items {\n    \n}\n\n.jFiler-items-default .jFiler-item {\n    position: relative;\n    padding: 16px;\n    margin-bottom: 16px;\n    background: #f7f7f7;\n    color: #4d4d4c;\n}\n\n\n.jFiler-items-default .jFiler-item .jFiler-item-icon {\n    font-size: 32px;\n    color: #f5871f;\n    \n    margin-right: 15px;\n    margin-top: -3px;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-title {\n    font-weight: bold;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-others {\n    font-size: 12px;\n    color: #777;\n    margin-left: -5px;\n    margin-right: -5px;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-others span {\n    padding-left: 5px;\n    padding-right: 5px;\n}\n\n.jFiler-items-default .jFiler-item-assets {\n    position: absolute;\n    display: block;\n    right: 16px;\n    top: 50%;\n    margin-top: -10px;\n}\n\n.jFiler-items-default .jFiler-item-assets a {\n    padding: 8px 9px 8px 12px;\n    cursor: pointer;\n    background: #fafafa;\n    color: #777;\n    border-radius: 4px;\n    border: 1px solid #e3e3e3\n}\n\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:hover,\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:active {\n    color: #d9534f;\n}\n\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:active {\n    background: transparent;\n}\n\n/* Thumbnails: Grid */\n.jFiler-items-grid .jFiler-item {\n    float: left;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container {\n    position: relative;\n    margin: 0 20px 30px 0;\n    padding: 10px;\n    border: 1px solid #e1e1e1;\n    border-radius: 3px;\n    background: #fff;\n    -webkit-box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n    -moz-box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n    box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb {\n    position: relative;\n    width: 160px;\n    height: 115px;\n    min-height: 115px;\n    border: 1px solid #e1e1e1;\n    overflow: hidden;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb .jFiler-item-thumb-image {\n    width: 100%;\n    height: 100%;\n    text-align: center;\n}\n\n.jFiler-item .jFiler-item-container .jFiler-item-thumb img {\n    max-width: none;\n    max-height: 100%;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb span.jFiler-icon-file {\n    margin-top: 20px;\n}\n\n.jFiler-items-grid .jFiler-item-thumb-image.fi-loading {\n    background: url('data:image/gif;base64,R0lGODlhIwAjAMQAAP////f39+/v7+bm5t7e3tbW1s7OzsXFxb29vbW1ta2traWlpZycnJSUlIyMjISEhHt7e3Nzc2tra2NjY1paWlJSUkpKSkJCQjo6OjExMSkpKRkZGRAQEAAAAP///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFBAAeACwAAAAAIwAjAAAF5CAgjmRpnmiqrmzrvnAsz3Rto4Fwm4EYLIweQHcTKAiAQOPRI0QKRcYiEGA4qI8K9HZoGAIOSOBgCdIGBeLCMUgoBJSJjsBAxAiKRSFAQBCVBwMKGRsNQi8DBwsJhyQVGxMKjTCJk0kPjDI5AlQqBAcICFstBQqmmScFGh0dHBaWKAIEBQQDKQEKDxEQCTMBA5Y/o5oDoZYCHB1PMgIHCQacwCPACRStDTEDBrYABQg5wAgGIg4YYjQCogEGB3wI3J2+oD0G42PfN2Pc7D2JRDb/+In4t8MHwYIIEypcyLChQ4YhAAAh+QQFBAAeACwIAAgAEwATAAAFlqAnjiKSjAFJBscgLos4NIQ6JggAKLHXSDWbp6CoLRgeg0ShGwkIKQ9iITggPJFHaqA4eAYIRK0a9SwK0spl0TQkvEIJJnIlCdDCRk4lEJIGBgcHRn4jBBkciROFKgkNDg51jCJBJJU2ARocD4xNAQsGCBMcGz2FAxwZKQwVDYVwEhwOI02MAxsceJMeOgwaJ7skCX0jIQAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwJAAcAEgAVAAAFjqAnjmJAnihgHChqCACAJKMyoMHBeggSJ40baoC4zTwFB6IlOiwLhkCDMUIYUAUSgiA4RCZLAXPkoDQOsfFosVNjDYaBQiRmWjaaDMTdXDAYbWMJQnwiGBoOBEwmIwVeGhhzKAJ+BBsXIgoSVCcEAxkbAw8enEwAARkaYqluAqliChlLY64aQrNjAT2MKCEAIfkEBQQAHgAsBwAIABQAFAAABZqgJ45jUQBkqorGgQqIsKqteCjyTLbAsBg6UoBA8CgSIoGhGGQNAoXG4zAaNBcPxalJQhS4KwGhUCQgRYHZQGKxVBpgD8CQUCiAYEQTpZpcGFYrBgw5HgkEBg4XFHoqFx10CwMZFCIIDwl8IwscFAQXGR4NGQo6BBocRRUYHgIWGEwqBxoPHgEWoYYXVCsBCTIBqzkHaVwHvCshACH5BAUEAB4ALAAAAAABAAEAAAUDoBcCACH5BAUEAB4ALAcACAAVABQAAAWaoCeOpDECZKqKgRcY7bqanoHI6+EKSIHjCJ2oMPidCgIPQbHwGUkIBoLwJAEM1OpqQBgkC0yjwBGRRBQokfdXOASzo0MjqTrQUwQIpwM/QSYJKQoaHRUKHgtQSgwTEUIeDRcPSRQcHgiBFREiB1IkdAkaEgMUGAILFoE4AxkaRRIVLRIURTIGGQ0iExWcEzQyBzGwI05PV78rIQAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwHAAgAFAAUAAAFlaAnjmRBnmgqCip6kEGbDnJqvmJAsLVIDwgEoTc6JAy0k05VSIoKiSgipgoIaIFKZ8tBVBeNBgORkEwkDt6sYECSBosUwJRybDiqxuOgTmTwCAUKIwAHAwMJDw10CxUNMRIaBQcIAmhPCgYjVAcZDx4REx5lOCoWGCIPER4Bqi0FFwwiEBIxBg9DKpqpEVS5PQUFACohACH5BAUEAB4ALAAAAAABAAEAAAUDoBcCACH5BAUEAB4ALAcACAAUABQAAAWRoCeOpEGeaCoGKmqOQlvKXgId4usR6DA+HA6kQDsxMB0Nr0hSTHxFAgJxIABogpiEI9rgVAiF2ICARCANVovAjsESKoKaNGBkMqrEojA/WDYSHgMIJAVZBwsKSwoSCyIOFx4FJg4LVwQHRCgVDQIOEAEHDi9XJwISFAIADA4iDJ1xEwoiDa2SDFA0rCO5NGwtIQAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwHAAgAEwAUAAAFj6AnisNonqeBLWg7GpwmtAENcc8s6ifyGKJMp1DyIFqNjecxUEiKLpGi4slATcBW4hkdDQ6HbHd048TELtah8XCwxqjAsXXdKSyWuuiAILwmGBBABzUiBDUFCQglCBAJIgsTBAQFAQpzAwZ1BREsCwweBQt+Lg8QNQpvCAqFJwMQc6mGjy6kHrI7cB4DeiIhACH5BAUEAB4ALAAAAAABAAEAAAUDoBcCACH5BAUEAB4ALAcABwASABUAAAWXoCeOI0GQaBpUl5CSRZV4QrYN71hoWBBkGpdISAI4No2BhoNLHRijy8YQmQwOpJMC2BAgIh5fgJZKSDYWYg4FWZMMhkLT7XHYeAW6wrBgLGZ0KQZjgR4IEhFqJIAeBQ8UDQUCeSNzIwcNCCIJDwMDJwgGawSZAQgzBAiWIwELDSIHmh6xOQyiAKciV4oeAHO0IwB0ArweIQAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwHAAcAEAAVAAAFjKAnjuMwkKgnjFJVosSEeMGVrcc1j8TlehVMIIDh7EaMzMKDuTE4k4DHsCiIKJnCI0LYcE6ehMWyPDxGgshyZL5MUqID6uCAowsEwsouWlTGFAR8HgUJCglHgyNWigF0dXYzBAwPCoJgcAUKBnELAgKYcAObHgdyfIYiBQcAdgIJjAanrq0AsoojQyghACH5BAUEAB4ALAAAAAABAAEAAAUDoBcCACH5BAUEAB4ALAcACAAUABQAAAWYoCeKwQhF5aiqA3SIlDVW7yoOlCRKlVhtNZtHYUkIKBfPYoNaFRADUUTWeAwyGYHHAFmIDhIJImBorBIFB6cDSZUnEGEA08k0UiPDQrsSTB58HgEDhEIqAHgIERESVoY2BAcIBwaPlh5Rl04KCnhnKwMJDFCelgMIBAAeT3hBNqoeAggFIgiaX7ZblZoBB5lbqoG3wzbCKyEAIfkEBQQAHgAsBwAHABUAEwAABZygJ46jIJBoSjZPqa6GGEmBZ0zx60Gt90QiSSb3QkgOHskkkMj0UAOkyCEhLBiey2X0SIwMLKRVAPAEHggCY8N5egiKB6OGAmwtC1UhQScFIgt9JAKCKQUICQkxBw2NCycqBhsdlBgBAwUGBgRlKgMPExMSgSSdKmQvBAgIOqwoAgeKkDopBgMiMbOutCgGSLe8IlIeSKbBI1LAKCEAIfkEBQQAHgAsAAAAAAEAAQAABQOgFwIAIfkEBQQAHgAsAAAAAAEAAQAABQOgFwIAIfkECQQAHgAsAAAAACMAIwAABbWgJ45kaZ5oqq5s675wLM90baPBvS6MTgoKgqjxEBEihZuAsRAxHKJHJXk7NAwBB8RzsPRqBYFo4RgkFALKxMhAxAiKBdXtAXgah4Eis2nIBgcLCSgVGxMKNYAoD4MzAgI5KgQHCAhULQUKmgmRJgUaIhwWLwIEBQQDKQEKDxEQCXYxnSUBcjapKAIcHUg+JgkUHRx+YB6zIw4YEMc2QiMBzDB0HgbGvifR19rb3N3e3+Dh4ikhADs=') no-repeat center;\n    width: 100%;\n    height: 100%;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info {\n    position: absolute;\n    bottom: -10%;\n    left: 0;\n    width: 100%;\n    color: #fff;\n    padding: 6px 10px;\n    background: -moz-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -webkit-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -o-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -ms-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: linear-gradient(to top,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    z-index: 9;\n    opacity: 0;\n    filter: alpha(opacity(0));\n    -webkit-transition: all 0.12s;\n    -moz-transition: all 0.12s;\n    transition: all 0.12s;\n}\n\n.jFiler-items-grid .jFiler-no-thumbnail.jFiler-item .jFiler-item-container .jFiler-item-info {\n    background: rgba(0,0,0,0.55);\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb:hover .jFiler-item-info {\n    bottom: 0;\n    opacity: 1;\n    filter: aplpha(opacity(100));\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info .jFiler-item-title {\n    display: block;\n    font-weight: bold;\n    word-break: break-all;\n    line-height: 1;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info .jFiler-item-others {\n    display: inline-block;\n    font-size: 10px;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets {\n    margin-top: 10px;\n    color: #999;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .text-success {\n    color: #3C763D\n}\n\n.jFiler-items-grid .jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .text-error {\n    color: #A94442\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .jFiler-jProgressBar {\n    width: 120px;\n    margin-left: -5px;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .jFiler-item-others {\n    font-size: 12px;\n}\n\n.jFiler-items-grid .jFiler-item-trash-action:hover {\n    cursor: pointer;\n    color: #d9534f;\n}", ""]);

	// exports


/***/ },
/* 13 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(13)();
	// imports


	// module
	exports.push([module.id, "/*\n  Icon Font: jquery-filer\n*/\n\n@font-face {\n  font-family: \"jquery-filer\";\n  src: url(" + __webpack_require__(15) + ");\n  src: url(" + __webpack_require__(15) + "?#iefix) format(\"embedded-opentype\"),\n       url(data:application/x-font-woff;charset=utf-8;base64,d09GRgABAAAAABY8AA0AAAAAJGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAWIAAAABoAAAAcbgWsnk9TLzIAAAGgAAAASgAAAGBDMGCrY21hcAAAAjgAAAB2AAABir/jw6BjdnQgAAACsAAAAAQAAAAEABEBRGdhc3AAABYYAAAACAAAAAj//wADZ2x5ZgAAAxwAABDDAAAbVDwbM1RoZWFkAAABMAAAADAAAAA2AudKS2hoZWEAAAFgAAAAIAAAACQD8QHEaG10eAAAAewAAABLAAAAbgpuBLZsb2NhAAACtAAAAGgAAABonHCkGm1heHAAAAGAAAAAIAAAACAAgQDCbmFtZQAAE+AAAAFmAAACwZhqioJwb3N0AAAVSAAAAM8AAAIIqeejRXjaY2BkYGAA4ogbscvj+W2+MnAzMYDAhScsz2H0////9zMxMh4EcjkYwNIAbNUNrHjaY2BkYGA8+H8/gx4Tw///DAxMjAxAERTAAgB/egS4AAEAAAAzAJEADAAAAAAAAgAAAAEAAQAAAEAALgAAAAB42mNgYWJg/MLAysDA6MOYxsDA4A6lvzJIMrQwMDAxsHEywIEAgskQkOaawnDg07fPLowH/h9g0GM8yOAIFGZEUqLAwAgAW4ENdAAAeNpjYmAQZAACJgi2Y1BgcAAyVYC4ASQO5IFEHBiyweI2QNIGzFIAQgaGE0C2CpClzCAHhBD1DgwLwKQDQyBQbAZYNQTYAAC2kQkrAHja3YxNCoNADIXfOGUUnEDtQlwobnuQHqYH6Xm7yAMRReLUigvpCfpBEt4PAeDxnRYOH15JuU1f8Ey3xjU5QUedCXrmFN7YsOfDDNBBZ7XNL1mxZse7mYiUUkgQL4hLnOIQ3/v/H7iAI3RZWtm5gL9nBYpEIu8AAAARAUQAAAAqACoAKgBSAJ4AvgEGAUQBfAGqAkACeAKyAwwDPAN+A7gEDASUBLIE8gUgBVgFmgX8BjYGhga2BvoHSAeeB/AIHAhiCLII5AkcCYIJwgoSCi4KWgqyCuALNguYDGwMvAzwDUINqnjanVl7jNzGeZ+Pr1lyd0nuckne7d5x38t7P3aXy3vsPSRLOkknyVIiy3q4tlzbkuw6tRoHidTW8cVwYBVF28SxdQ5gNIpTCwWaJrJRGW5go+fHH0VRIEbkPwo0CGQjRV0kQa0U7R+tQfUbcu+0d3KMonviPD7OcGa+5+8bEY6kCCHfhrsITygZewXIePtVKpBf1V+RxJ+2X+U5bJJXeEYWGflVKsEn7VeB0RupRsptpMqpC185dQruCv4qBQ38GpB5Uoa3YT+xsJfROKk0ztWaC9Cq58FnBbxNr5ZohpZOUMrqvX/BOtCXkV4rSRJSsUfp3pexjV/gSYEU4Dos4l6LZJKQas21zIxUqnlNX6IO1Fu1Zq1cksyMVW95zVajbmWoCqWaW2v681C3bFirTWvb79muTdeKD33poW9RMT9KFepY4j+L5S8//eWyGFVXZvuzztj27WNOtn+2MTf3pwodzYuUipazT5dndu6alnV5etfOGRKec5EYsAZfYDzEVUw86jjUwg3YLbhrZKH4XDy+6iyMeIUCfGFhdLRwMR7/dn54dGFoKJxPyBGOwG5SZ3ySyqVxaJZddpKM1aj7pm/TMlJr4Qe9PCCxxQ6qgesjiSNLk9MVgC/kBqueVx3J9do9UJmZXFqa9CrcY7lhRh3I9dt9FX8S4MFdwwDPON5erwR5Iz+y68GlAeD+qIiE/opRGSQiqdz8OXwALxGFqCSN0svjJpGVQH2UnQ227/qdx27hSXEjNryfTAb//udNSCXcRPA3xuxMevHlBXPBWngkHh8SkoK1CI8kazjG+w6kcOyLRmamZ+HlRXPRWjTZEMFaIIQj5OZPkBc/wHWrhPhlr2HOAwrSpmOADKENu2GWPRXbNdd38E3LL1+96thPHLhzxew3Htu55/f0Jy9uJfz46h/uuefk/tgdh+/Z1e5q43orRIcVOEuSJEdIJaMBaikgq2dRnTLSMGpPR2NhRTwrJvBRpOuSEhYR4SIjsqZyJKEoUYfpBXfz5s01DmCNjJNThIhm0ZsH30NtdGstvzYHbZjn/AkfC5SrRSV8sMQ/0wGxOAbj4PmtBWhM4LSWR/2WW8O6Ngwq4CAV+iGTB9eyrTxn5cFECkcCAmePmKoqU14BUTFVXlSy6dhRU6Ax3EsqHtPV9OHHgiKsyQ/uVqWUysc5AXiV5wBbyTtoKiEoKZ1yvA68KMqcakjJPacmNW3+XrVmDNKM3k8VOa5qvWqCE5REHGbjaTMjJ7WSHaumh5L3jY3vkrnPiYlBhadCTIIeTezro+BCTDaAS+cTSd0SJCnOcbHhpHAI5F2ocwR5RVDn4kQjBrFJGXWukSqmGqgB+FAsivhAqtgLRa+MShA+cPl4QI6fuHhiLh98nIfloA3vtrHbhqdZ08FfG3/BcUgG/wHDvzWHPyYbtFmCNrsSrVRtRmrssgL9R2hjCzAPGXQfY9BkzgO+JlpiUjw1hYUlisdFiYrPiAvNo2eONbA4+lFMQPJDUyK+pVQ4LuLbNL5rHDtztNkM1yzcvI7+6yRa1Cz2Syqgp8ozWaKUbVxxHpo1K8OU22VqwHS82aot8POiPwZetIvGqWPNSgH1JF5z4lpKaxxrNg+3T8+l0/VtSR0ECQA44DgugYoa49zR9unfPw2L5dlSXyOd7LFMPadwXHl2x+zk0T3D3IgucKIIApvBcaqoJtKKta02smd4eN23FeAS8olxyWQGYUZWMcdMcA6YoXihtVj9zE7hkqqcUZUJRT2jqF3Nj26jsGaXHMpoJaTqNVG9w6Ik9TODRx23ZhmfmD3OAeNRt0zOKtKiIhUkZZGZ5Ebz4IZUrtz2jjX3dssFyO+QHDwPO9kZ1z0AjdzAAqpEd8SyMszXPSeVYhlp714pE8M4hfWW/n0Ytz6Nvt7v1r9h4kf6h6bNtDB062EZ6iG9pY32p+jkfeLoaKhwEmugRqIK3ka5f4MbFz5rWIfyeDdvKLNLlP8a2uUo7nQb2U+OkYcIKUTCZ1LPGGEplVORZnip2xTDRcuNhGqgSUfCNMIgVgyDXLrra1ZXG1xVllX5YNIwktXc9VyVNU7iv6SxclKmi1ReC64byetJQ6eyTIM1Vt4dzlkKS5mGpDUKXzGShaQR4DeqOSiEnQL7WkHX2dzgYSgE+B0D9svhzGBtY+6tAjFIG/nxLvJDQN4kUYY2Hsg2G1BMMW9U/m5w7sYDwT/AvtWrsHYpuMSR5gPBVRhdjWReQJmfJDoZCJGCBiqHHKih2FuNql1s+UyqszDDOZztAOMd/CBBIQGcEgveScQgCTQBR7ngLzmBU3hlWZZiPC9xiUTqz2IUSEz5kRRDFX9dUSaL5hClPM9RPiFKzJalLXtPEZP0bj2Bje6W4uPis+k0r88MnT00svlMTz76qDA2lm80kC+RPj9FZIzcJabRLmUejaM+KjPzdJWMypXGuOY8V3cALlhvlAb66hXrv98sDVYXKrDbaS4dWGo6UfXWQPENy6o0xt+wKwvVwYMHdjedfGN3NCD0pYRMYby4G1cbCnmJ+ldkSLBlM7xgt+wNjMSAVKdCVYMVb3nZCz4cnG4P6rtHZoZ6swMzMwM9djxWalRn40KSCn0DA30wtfzwvpmBoRlusD4U/2D60HRCkt2RSpKDgSmXRP4cV74OXyMxsoRYBQERdTEm+QwCoiV4TMtR7ctu02t2bULj1MihmeVww3644RDl4Ly34nuXE76+WhqfKD10v5Bza33a7FDfZFJS5bjey4Ns9Y04J07UmqUcX7LUhDpdmtgJb8SXl+OtX//aapRKk7rb1zcENDk4U8gmJdHWZT7m9uRHdK/qjMuWIzmVHRPAhb5vPSZVme/bCD3SlsjDMdd+fSPMCHRrlKm0Pzc2d/qX6yEFpNtjSqE93Dscye7mRyi7b5Ex5vtIyKvGp4trg0kdqTbqPOOyj2rKkWXv85/vkl1bWZfdY491Sde7XDePHDFR6YYeWXamD80kJXlglMnRnRpwpgcHmYQH48FfR8P+Dff392inU+ibNYZ8qxsBL/JmBu24OTfqwwRGlDCsSEosFlWKdJDKZ6YYlRXArbEmK8I8Zt33xxFzjhKSxr11nHrL2Ah+kZf0/KbLCBgH7Ijyj8w1hw79+4IwgRCNnxAEgeP5KTR2QRTGBAFWwgHMiwefREOwOPZiKA/uRU4QSLiPCu7jp3AJz1kkjfXo+1lru4aFKJMZGkJRI4xAhejjrBDQKU3hE22CX5NlUYsFKzFNlOU1QUtruzf2cv8XEXPyIHyR5/lfBpc0PYY/XYOTMVlety2W610iLlm4XQYs3HTvdJ3us3Rwc/COZLQy5LznDA05V5BVwhW9p0d/T+8RBF0QTiJiH/keL/F9PP+9EdTmFUl5/SAbixPCEeHYHv0gznwfX7LROFhioxNMoAIph9j1b1FbhhHFoE4bYipMUaKMrWpO9HHm5C0KxazFC/OZjGWIXjXNlB87V2EZGpVKs1kp9gY3uHql0mhgc8YuclzRtkulx0ALbrw5USpNFOH1bcF3KvXGnqb9J97raItQnmzsaVh/kLclu1AaL4HhHfOCZRxanMA9Ojd/Bh8ivmb5fRw9PzGKqWIVMbWHtUhd9ocZnQPvIm6+HJyDC/icNfeML5/qferAALwUtBFJn4DR/7KW6k8/n3rzj5kts+/+HZ59DXF0EU8/FsUTL4wlJvNoKeqmQixg+B3UbhvratbwMezc993gAhxf/YlqZPfuy6X1XAExe3FaltqSfPzaA2HEcTDYOFkjCC4+D7yRRTi//cprr13ZDnOSLEujv/0A6fiVT8IcokIQ41f9lPsbsKoZAku2O9ujXoRCtgBNeOb8+azxsZHVjFzOGMkZly9T+UMje+K8LAXvMzQwKksfS/J/Hg7eO7wjnculL+fSbSOnpXOOLGk541/eOPwEG4aneJdt8qsbOc4aSaDFZZBj/SG3MMf1omwGo3C1gewzzAZfZDQ4d2H1/PmLzrVdQf3dZ4Kr13b9D2jnVmHtq8E/OTfO5+f8bQ424Xe3BTdunO/kNet3ESyDwow51DMGIhnArLm330/0jcWVsf5aK7v6XH+rtvm24t5Cb2+h5VZzL1zMuW5L23p5cQvHNsmeMIJwLGupYULTalg2S9DnueYYx1J3luJ2jNhv5YE5dAfoJsvuAEZYyzeW3OEDOVTrEs8LXNpzsuPlTKY8nu0ZS5VigqicRWeq0GJ2Z9Vdaj4lCMw8hanQYP+VwYRKEXFRiQeuJ4vTmjg7rZcpzpHOKqIQK/T25Ru1s2wSzjiKFZ7lEvqcRTyLw/R4s8/xyt3eB1WH3+KSYDF0HYqk66w8KSlYF26FhoMF1sDiZFgq0jcUyE6wxkQUFrriAlt/5rZsqBMNN5yeu8VdW92JwSL6rQ5TenpYiUctYLxgTSwubaQEuwcEYYVRB8LhWAo/H+j0hYnNedIiuYS5AEHtDbnD4gA7fqMY5X3Beyyrw3gYZnthnqduyrU1dseyJcrcls+th8rNOVzEtC152yEC8EN4MowQ0b1ZpNWYMJmdfkf32ZVZJ72K+uaW8fBD1yn1vNPnD7j9q7wu8NwLRjZbNd7WM7qpPSvJVKGnQvppvd+0tG/27nLc3rf73QG/7wWOF3T+BaOWzRrvaCbO+KYkx2LS6ZB+SjfNfv3ZHuSDg/j7w9BX5sIdR/DPDuFgCBXZlZabKqfgw6//6OsP7qd33P34S4/ffQfd/+A156V7n3763jufSDnaozsOPf74oR2Pav36Ez8OrsEo4/ELqLtPIo7TSPv2eOlnVJ6q0EVF0BmCUob1GCPGgF0lOhxMSEJbkMLizpicjiuKyjpiIaMlbC2lyGle5PlBNKyBfZmBYubU+mjpWdXWNCpKpiTEZDFuVtEPxuM6lWyBy/NU2K5nq5v1XEMt33U77vCbzGdRKRSb32IbY/KKbrwiZMIOIHYrTpduL/YNWnMFQSoi+zk1FksmDCWhZ8N38VhMVmPSyVvqvz5L+L5Vy3iS2At8SpKSshyXaH9KZm9FTRTEZCKt3dI+oePL38JoqpE7yDcYirOYRJtWJ5hjak1tibpS50rRpSjeWoRLWr6Lcm9FFwuW7Vs2tdjlAvUxVfDGORy2wGa4tXG+VC6VNY5BYvwexeyhD0wcmweKE20rz89AY4FjN0gtn90i+B/Mj4zMj0yhNtayMHxAlGtpe7ee7tH6tJ60vttO12TxAMf9phdn9s7o6CAp7RfEHaqqaWKaAcu0qGmqukMQKxTd7969bEjl1giJxwF6Ut0hCv0UR0BihG1jX5ZtQwk/b7jr67qGvZT67A1ZKDshLei4ptrqLKrNzmpdy+oWT3krXBQHxKgo6DMzuiDSGA7wNDWp38IE/79cI0znGCz6P+caX6o7LI347FRjrf6LX9StI0dwP7ENTBDhsujuM8fyjjnALNxseH7DLDPoBF7Utzv1taur565hgaiAta6u/or1Vp1rziqjsXZUMptL4Do/+9R1yoiwGWpFPGiGeJDiUzWLHmzU0Xr8lnoVHg5WYTm45mDjKoziE9XOuePt450H1s4harx2Dpvt4Mb581iB3ul1E6M9dt9PRLcT/Ygqq2QQs6TQU2y+q2Bo0g65E91XlNl/Daz3sbaY20ArLDHcbTP/Gom51X2x0XZOzDnhr71RifVyTMsLXG/lbiHdm0oleW3zxYeDXO7MOJHPs8Zb5V5NzQnluktpIp3uSXP/CyLCXdEAeNqNkc1qwkAUhc/4By1S2lVdztKCiZOAm2wFxV1X7lOdaCQkmkwQX0P6GKX7PkuhT9AH6LIncSh20WKGmfudMzd37jAAbvAKgdM3w7NlgS6+LDfQFneWm+iL2HILXfFiuY1b8W65g26jw0zRuqI61n9VLNDDh+UGrkXbchOP4t5yCz1xtNyGFG+WO/Q/MUYOjRCG6xISTzhwnaFEgph+SjVlTLCgLrkO6iGxpzZYkybImGfqmGPFShI+XCjGPjMMxxYBhhyRzY1+cl0UVC5dTf8BGOc6NHopnw5yViZxmMppmCzicjEYDOQ+Nms5yVIzyfKVlr6rZH9tzDYYDiO6UeW6ReSm2rDUBjv2rHnSAQ5PiXmPSmGzK3V+cKI40VRnG9b570oB51+FT7s+8xx4nBV5GLHgr5YDed4Apa8cz/GVN7q453ltFtzO6kdS9UluHasuMdd5EWepVMpzlVLy0srfppZ9qgAAeNpdzkdSw1AUBVG1CCbnZJLJOUj/fWwzxID2woQZ+2NnQIlmgianStKrvkVZtM/XZ9H9geL/E+3bkpIxxplgkg5TTDPDLHPMs8AiSyyzwiprrLPBJlt02WaHXfbYp8cBhxxxzAmnnHHOBZdccc0Nt9xxT0Xd+Xh/a1LT14EOdaRNa1SVhg50pM/68mtda9K+elcP9e//V7WX/J4e9UntJXvJ++R98j7cG+4Id4T7I+uDui/cF/bDftgP+2E/7If9sJ/tZ/vZfraf8zcFz3IYAAAAAAH//wACeNpjYGBgZACCM7aLzoPoC09YnsNoAFB9B7oAAA==),\n       url(" + __webpack_require__(16) + ") format(\"woff\"),\n       url(" + __webpack_require__(17) + ") format(\"truetype\"),\n       url(" + __webpack_require__(18) + "#jquery-filer) format(\"svg\");\n  font-weight: normal;\n  font-style: normal;\n}\n\n@media screen and (-webkit-min-device-pixel-ratio:0) {\n  @font-face {\n    font-family: \"jquery-filer\";\n    src: url(" + __webpack_require__(18) + "#jquery-filer) format(\"svg\");\n  }\n}\n\n[data-icon]:before { content: attr(data-icon); }\n\n[data-icon]:before,\n.icon-jfi-ban:before,\n.icon-jfi-calendar:before,\n.icon-jfi-check:before,\n.icon-jfi-check-circle:before,\n.icon-jfi-cloud-o:before,\n.icon-jfi-cloud-up-o:before,\n.icon-jfi-comment:before,\n.icon-jfi-comment-o:before,\n.icon-jfi-download-o:before,\n.icon-jfi-exclamation:before,\n.icon-jfi-exclamation-circle:before,\n.icon-jfi-exclamation-triangle:before,\n.icon-jfi-external-link:before,\n.icon-jfi-eye:before,\n.icon-jfi-file:before,\n.icon-jfi-file-audio:before,\n.icon-jfi-file-image:before,\n.icon-jfi-file-o:before,\n.icon-jfi-file-text:before,\n.icon-jfi-file-video:before,\n.icon-jfi-files-o:before,\n.icon-jfi-folder:before,\n.icon-jfi-heart:before,\n.icon-jfi-heart-o:before,\n.icon-jfi-history:before,\n.icon-jfi-infinite:before,\n.icon-jfi-info:before,\n.icon-jfi-info-circle:before,\n.icon-jfi-minus:before,\n.icon-jfi-minus-circle:before,\n.icon-jfi-paperclip:before,\n.icon-jfi-pencil:before,\n.icon-jfi-plus:before,\n.icon-jfi-plus-circle:before,\n.icon-jfi-power-off:before,\n.icon-jfi-question:before,\n.icon-jfi-question-circle:before,\n.icon-jfi-reload:before,\n.icon-jfi-settings:before,\n.icon-jfi-sort:before,\n.icon-jfi-times:before,\n.icon-jfi-times-circle:before,\n.icon-jfi-trash:before,\n.icon-jfi-upload-o:before,\n.icon-jfi-user:before,\n.icon-jfi-view-grid:before,\n.icon-jfi-view-list:before,\n.icon-jfi-zip:before {\n  display: inline-block;\n  font-family: \"jquery-filer\";\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n  text-decoration: inherit;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-smoothing: antialiased;\n}\n\n.icon-jfi-ban:before { content: \"\\F328\"; }\n.icon-jfi-calendar:before { content: \"\\F30B\"; }\n.icon-jfi-check:before { content: \"\\F2F6\"; }\n.icon-jfi-check-circle:before { content: \"\\F30C\"; }\n.icon-jfi-cloud-o:before { content: \"\\F329\"; }\n.icon-jfi-cloud-up-o:before { content: \"\\F32A\"; }\n.icon-jfi-comment:before { content: \"\\F32B\"; }\n.icon-jfi-comment-o:before { content: \"\\F30D\"; }\n.icon-jfi-download-o:before { content: \"\\F32C\"; }\n.icon-jfi-exclamation:before { content: \"\\F32D\"; }\n.icon-jfi-exclamation-circle:before { content: \"\\F32E\"; }\n.icon-jfi-exclamation-triangle:before { content: \"\\F32F\"; }\n.icon-jfi-external-link:before { content: \"\\F330\"; }\n.icon-jfi-eye:before { content: \"\\F2F7\"; }\n.icon-jfi-file:before { content: \"\\F31F\"; }\n.icon-jfi-file-audio:before { content: \"\\F331\"; }\n.icon-jfi-file-image:before { content: \"\\F332\"; }\n.icon-jfi-file-o:before { content: \"\\F31D\"; }\n.icon-jfi-file-text:before { content: \"\\F333\"; }\n.icon-jfi-file-video:before { content: \"\\F334\"; }\n.icon-jfi-files-o:before { content: \"\\F335\"; }\n.icon-jfi-folder:before { content: \"\\F31E\"; }\n.icon-jfi-heart:before { content: \"\\F2F8\"; }\n.icon-jfi-heart-o:before { content: \"\\F336\"; }\n.icon-jfi-history:before { content: \"\\F337\"; }\n.icon-jfi-infinite:before { content: \"\\F2FB\"; }\n.icon-jfi-info:before { content: \"\\F338\"; }\n.icon-jfi-info-circle:before { content: \"\\F339\"; }\n.icon-jfi-minus:before { content: \"\\F33A\"; }\n.icon-jfi-minus-circle:before { content: \"\\F33B\"; }\n.icon-jfi-paperclip:before { content: \"\\F33C\"; }\n.icon-jfi-pencil:before { content: \"\\F2FF\"; }\n.icon-jfi-plus:before { content: \"\\F311\"; }\n.icon-jfi-plus-circle:before { content: \"\\F312\"; }\n.icon-jfi-power-off:before { content: \"\\F33D\"; }\n.icon-jfi-question:before { content: \"\\F33E\"; }\n.icon-jfi-question-circle:before { content: \"\\F33F\"; }\n.icon-jfi-reload:before { content: \"\\F300\"; }\n.icon-jfi-settings:before { content: \"\\F340\"; }\n.icon-jfi-sort:before { content: \"\\F303\"; }\n.icon-jfi-times:before { content: \"\\F316\"; }\n.icon-jfi-times-circle:before { content: \"\\F317\"; }\n.icon-jfi-trash:before { content: \"\\F318\"; }\n.icon-jfi-upload-o:before { content: \"\\F341\"; }\n.icon-jfi-user:before { content: \"\\F307\"; }\n.icon-jfi-view-grid:before { content: \"\\F342\"; }\n.icon-jfi-view-list:before { content: \"\\F343\"; }\n.icon-jfi-zip:before { content: \"\\F344\"; }\n", ""]);

	// exports


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "jquery-filer.eot";

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "jquery-filer.woff";

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "jquery-filer.ttf";

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "jquery-filer.svg";

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(21);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(19)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../css-loader/index.js!./jquery.filer-dragdropbox-theme.css", function() {
				var newContent = require("!!./../../../css-loader/index.js!./jquery.filer-dragdropbox-theme.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(13)();
	// imports


	// module
	exports.push([module.id, "/*!\n * CSS jQuery.filer\n * Theme: DragDropBox\n * Copyright (c) 2015 CreativeDream\n * Version: 1.0.4 (29-Oct-2015)\n*/\n\n/*-------------------------\n\tInput\n-------------------------*/\n.jFiler-input-dragDrop {\n    display: block;\n    width: 343px;\n    margin: 0 auto 25px auto;\n    padding: 25px;\n    color: #8d9499;\n    color: #97A1A8;\n    background: #fff;\n    border: 2px dashed #C8CBCE;\n    text-align: center;\n    -webkit-transition: box-shadow 0.3s,\n                        border-color 0.3s;\n    -moz-transition: box-shadow 0.3s,\n                        border-color 0.3s;\n    transition: box-shadow 0.3s,\n                        border-color 0.3s;\n}\n\n.jFiler.dragged .jFiler-input-dragDrop {\n    border-color: #aaa;\n    box-shadow: inset 0 0 20px rgba(0,0,0,.08);\n}\n\n.jFiler.dragged .jFiler-input-dragDrop * {\n    pointer-events: none;\n}\n\n.jFiler.dragged .jFiler-input-icon {\n    -webkit-transform: rotate(180deg);\n    -ms-transform: rotate(180deg);\n    transform: rotate(180deg);\n}\n\n.jFiler.dragged .jFiler-input-text,\n.jFiler.dragged .jFiler-input-choose-btn {\n    filter: alpha(opacity=30);\n    opacity: 0.3;\n}\n\n.jFiler-input-dragDrop .jFiler-input-icon {\n    font-size: 48px;\n    margin-top: -10px;\n    -webkit-transition: all 0.3s ease;\n    -moz-transition: all 0.3s ease;\n    transition: all 0.3s ease;\n}\n\n.jFiler-input-text h3 {\n    margin: 0;\n    font-size: 18px;\n}\n\n.jFiler-input-text span {\n    font-size: 12px;\n}\n\n.jFiler-input-choose-btn {\n    display: inline-block;\n    padding: 8px 14px;\n    outline: none;\n    cursor: pointer;\n    text-decoration: none;\n    text-align: center;\n    white-space: nowrap;\n    font-size: 12px;\n    font-weight: bold;\n    color: #8d9496;\n    border-radius: 3px;\n    border: 1px solid #c6c6c6;\n    vertical-align: middle;\n    background-color: #fff;\n    box-shadow: 0px 1px 5px rgba(0,0,0,0.05);\n    -webkit-transition: all 0.2s;\n    -moz-transition: all 0.2s;\n    transition: all 0.2s;\n}\n\n.jFiler-input-choose-btn:hover,\n.jFiler-input-choose-btn:active {\n    color: inherit;\n}\n\n.jFiler-input-choose-btn:active {\n    background-color: #f5f5f5;\n}\n\n/* gray */\n.jFiler-input-choose-btn.gray {\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#fcfcfc),to(#f5f5f5));\n    background-image: -webkit-linear-gradient(top,#fcfcfc,#f5f5f5);\n    background-image: -o-linear-gradient(top,#fcfcfc,#f5f5f5);\n    background-image: linear-gradient(to bottom,#fcfcfc,#f5f5f5);\n    background-image: -moz-linear-gradient(top,#fcfcfc,#f5f5f5);\n}\n\n.jFiler-input-choose-btn.gray:hover {\n    filter: alpha(opacity=87);\n    opacity: 0.87;\n}\n\n.jFiler-input-choose-btn.gray:active {\n    background-color: #f5f5f5;\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#f5f5f5),to(#fcfcfc));\n    background-image: -webkit-linear-gradient(top,#f5f5f5,#fcfcfc);\n    background-image: -o-linear-gradient(top,#f5f5f5,#fcfcfc);\n    background-image: linear-gradient(to bottom,#f5f5f5,#fcfcfc);\n    background-image: -moz-linear-gradient(top,#f5f5f5,#fcfcfc);\n}\n\n/* blue */\n.jFiler-input-choose-btn.blue {\n    color: #008BFF;\n    border: 1px solid #008BFF;\n}\n\n.jFiler-input-choose-btn.blue:hover {\n    background: #008BFF;\n}\n\n.jFiler-input-choose-btn.blue:active {\n    background: #008BFF;\n}\n\n/* green */\n.jFiler-input-choose-btn.green {\n    color: #27ae60;\n    border: 1px solid #27ae60;\n}\n\n.jFiler-input-choose-btn.green:hover {\n    background: #27ae60;\n}\n\n.jFiler-input-choose-btn.green:active {\n    background: #27ae60;\n}\n\n/* red */\n.jFiler-input-choose-btn.red {\n    color: #ed5a5a;\n    border: 1px solid #ed5a5a;\n}\n\n.jFiler-input-choose-btn.red:hover {\n    background: #ed5a5a;\n}\n\n.jFiler-input-choose-btn.red:active {\n    background: #E05252;\n}\n\n/* black */\n.jFiler-input-choose-btn.black {\n    color: #555;\n    border: 1px solid #555;\n}\n\n.jFiler-input-choose-btn.black:hover {\n    background: #555;\n}\n\n.jFiler-input-choose-btn.black:active {\n    background: #333;\n}\n\n.jFiler-input-choose-btn.blue:hover,\n.jFiler-input-choose-btn.green:hover,\n.jFiler-input-choose-btn.red:hover,\n.jFiler-input-choose-btn.black:hover {\n    border-color: transparent;\n    color: #fff;\n}\n\n.jFiler-input-choose-btn.blue:active,\n.jFiler-input-choose-btn.green:active,\n.jFiler-input-choose-btn.red:active,\n.jFiler-input-choose-btn.black:active {\n    border-color: transparent;\n    color: #fff;\n    filter: alpha(opacity=87);\n    opacity: 0.87;\n}", ""]);

	// exports


/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	// Muaz Khan     - www.MuazKhan.com
	// MIT License   - www.webrtc-experiment.com/licence
	// Documentation - github.com/streamproc/MediaStreamRecorder

	// ______________________
	// MediaStreamRecorder.js

	var IsChrome;

	function MediaStreamRecorder(mediaStream) {
	    if (!mediaStream) throw 'MediaStream is mandatory.';

	    // void start(optional long timeSlice)
	    // timestamp to fire "ondataavailable"
	    this.start = function (timeSlice) {
	        // Media Stream Recording API has not been implemented in chrome yet;
	        // That's why using WebAudio API to record stereo audio in WAV format
	        var Recorder = IsChrome ? window.StereoRecorder : window.MediaRecorderWrapper;

	        // video recorder (in WebM format)
	        if (this.mimeType.indexOf('video') != -1) {
	            Recorder = IsChrome ? window.WhammyRecorder : window.MediaRecorderWrapper;
	        }

	        // video recorder (in GIF format)
	        if (this.mimeType === 'image/gif') Recorder = window.GifRecorder;

	        mediaRecorder = new Recorder(mediaStream);
	        mediaRecorder.ondataavailable = this.ondataavailable;
	        mediaRecorder.onstop = this.onstop;
	        mediaRecorder.onStartedDrawingNonBlankFrames = this.onStartedDrawingNonBlankFrames;

	        // Merge all data-types except "function"
	        mediaRecorder = mergeProps(mediaRecorder, this);

	        mediaRecorder.start(timeSlice);
	    };

	    this.onStartedDrawingNonBlankFrames = function () {};
	    this.clearOldRecordedFrames = function () {
	        if (!mediaRecorder) return;
	        mediaRecorder.clearOldRecordedFrames();
	    };

	    this.stop = function () {
	        if (mediaRecorder) mediaRecorder.stop();
	    };

	    this.ondataavailable = function (blob) {
	        console.log('ondataavailable..', blob);
	    };

	    this.onstop = function (error) {
	        console.warn('stopped..', error);
	    };

	    // Reference to "MediaRecorder.js"
	    var mediaRecorder;
	}
	module.exports.MediaStreamRecorder = MediaStreamRecorder;
	// below scripts are used to auto-load required files.

	function loadScript(src, onload) {
	    var root = window.MediaStreamRecorderScriptsDir;

	    var script = document.createElement('script');
	    script.src = root + src;
	    script.onload = onload || function () {};
	    document.documentElement.appendChild(script);
	}

	// Muaz Khan     - www.MuazKhan.com
	// MIT License   - www.webrtc-experiment.com/licence
	// Documentation - github.com/streamproc/MediaStreamRecorder

	// _____________________________
	// Cross-Browser-Declarations.js

	// animation-frame used in WebM recording
	if (!window.requestAnimationFrame) {
	    requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
	}

	if (!window.cancelAnimationFrame) {
	    cancelAnimationFrame = window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
	}

	// WebAudio API representer
	if (!window.AudioContext) {
	    window.AudioContext = window.webkitAudioContext || window.mozAudioContext;
	}

	URL = window.URL || window.webkitURL;
	navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	if (window.webkitMediaStream) window.MediaStream = window.webkitMediaStream;

	IsChrome = !!navigator.webkitGetUserMedia;

	// Merge all other data-types except "function"

	function mergeProps(mergein, mergeto) {
	    mergeto = reformatProps(mergeto);
	    for (var t in mergeto) {
	        if (typeof mergeto[t] !== 'function') {
	            mergein[t] = mergeto[t];
	        }
	    }
	    return mergein;
	}

	function reformatProps(obj) {
	    var output = {};
	    for (var o in obj) {
	        if (o.indexOf('-') != -1) {
	            var splitted = o.split('-');
	            var name = splitted[0] + splitted[1].split('')[0].toUpperCase() + splitted[1].substr(1);
	            output[name] = obj[o];
	        } else output[o] = obj[o];
	    }
	    return output;
	}

	// ______________ (used to handle stuff like http://goo.gl/xmE5eg) issue #129
	// ObjectStore.js
	var ObjectStore = {
	    AudioContext: window.AudioContext || window.webkitAudioContext
	};

	// ================
	// MediaRecorder.js

	/**
	 * Implementation of https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html
	 * The MediaRecorder accepts a mediaStream as input source passed from UA. When recorder starts,
	 * a MediaEncoder will be created and accept the mediaStream as input source.
	 * Encoder will get the raw data by track data changes, encode it by selected MIME Type, then store the encoded in EncodedBufferCache object.
	 * The encoded data will be extracted on every timeslice passed from Start function call or by RequestData function.
	 * Thread model:
	 * When the recorder starts, it creates a "Media Encoder" thread to read data from MediaEncoder object and store buffer in EncodedBufferCache object.
	 * Also extract the encoded data and create blobs on every timeslice passed from start function or RequestData function called by UA.
	 */

	function MediaRecorderWrapper(mediaStream) {
	    // if user chosen only audio option; and he tried to pass MediaStream with
	    // both audio and video tracks;
	    // using a dirty workaround to generate audio-only stream so that we can get audio/ogg output.
	    if (this.type == 'audio' && mediaStream.getVideoTracks && mediaStream.getVideoTracks().length && !navigator.mozGetUserMedia) {
	        var context = new AudioContext();
	        var mediaStreamSource = context.createMediaStreamSource(mediaStream);

	        var destination = context.createMediaStreamDestination();
	        mediaStreamSource.connect(destination);

	        mediaStream = destination.stream;
	    }

	    // void start(optional long timeSlice)
	    // timestamp to fire "ondataavailable"

	    // starting a recording session; which will initiate "Reading Thread"
	    // "Reading Thread" are used to prevent main-thread blocking scenarios
	    this.start = function (mTimeSlice) {
	        mTimeSlice = mTimeSlice || 1000;
	        isStopRecording = false;

	        function startRecording() {
	            if (isStopRecording) return;

	            mediaRecorder = new MediaRecorder(mediaStream);

	            mediaRecorder.ondataavailable = function (e) {
	                console.log('ondataavailable', e.data.type, e.data.size, e.data);
	                // mediaRecorder.state == 'recording' means that media recorder is associated with "session"
	                // mediaRecorder.state == 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

	                if (!e.data.size) {
	                    console.warn('Recording of', e.data.type, 'failed.');
	                    return;
	                }

	                // at this stage, Firefox MediaRecorder API doesn't allow to choose the output mimeType format!
	                var blob = new window.Blob([e.data], {
	                    type: e.data.type || self.mimeType || 'audio/ogg' // It specifies the container format as well as the audio and video capture formats.
	                });

	                // Dispatching OnDataAvailable Handler
	                self.ondataavailable(blob);
	            };

	            mediaRecorder.onstop = function (error) {
	                // for video recording on Firefox, it will be fired quickly.
	                // because work on VideoFrameContainer is still in progress
	                // https://wiki.mozilla.org/Gecko:MediaRecorder

	                // self.onstop(error);
	            };

	            // http://www.w3.org/TR/2012/WD-dom-20121206/#error-names-table
	            // showBrowserSpecificIndicator: got neither video nor audio access
	            // "VideoFrameContainer" can't be accessed directly; unable to find any wrapper using it.
	            // that's why there is no video recording support on firefox

	            // video recording fails because there is no encoder available there
	            // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp#317

	            // Maybe "Read Thread" doesn't fire video-track read notification;
	            // that's why shutdown notification is received; and "Read Thread" is stopped.

	            // https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html#error-handling
	            mediaRecorder.onerror = function (error) {
	                console.error(error);
	                self.start(mTimeSlice);
	            };

	            mediaRecorder.onwarning = function (warning) {
	                console.warn(warning);
	            };

	            // void start(optional long mTimeSlice)
	            // The interval of passing encoded data from EncodedBufferCache to onDataAvailable
	            // handler. "mTimeSlice < 0" means Session object does not push encoded data to
	            // onDataAvailable, instead, it passive wait the client side pull encoded data
	            // by calling requestData API.
	            mediaRecorder.start(0);

	            // Start recording. If timeSlice has been provided, mediaRecorder will
	            // raise a dataavailable event containing the Blob of collected data on every timeSlice milliseconds.
	            // If timeSlice isn't provided, UA should call the RequestData to obtain the Blob data, also set the mTimeSlice to zero.

	            setTimeout(function () {
	                mediaRecorder.stop();
	                startRecording();
	            }, mTimeSlice);
	        }

	        // dirty workaround to fix Firefox 2nd+ intervals
	        startRecording();
	    };

	    var isStopRecording = false;

	    this.stop = function () {
	        isStopRecording = true;

	        if (self.onstop) {
	            self.onstop({});
	        }
	    };

	    this.ondataavailable = this.onstop = function () {};

	    // Reference to itself
	    var self = this;

	    if (!self.mimeType && !!mediaStream.getAudioTracks) {
	        self.mimeType = mediaStream.getAudioTracks().length && mediaStream.getVideoTracks().length ? 'video/webm' : 'audio/ogg';
	    }

	    // Reference to "MediaRecorderWrapper" object
	    var mediaRecorder;
	}
	module.exports.MediaRecorderWrapper = MediaRecorderWrapper;
	// =================
	// StereoRecorder.js

	function StereoRecorder(mediaStream) {
	    // void start(optional long timeSlice)
	    // timestamp to fire "ondataavailable"
	    this.start = function (timeSlice) {
	        timeSlice = timeSlice || 1000;

	        mediaRecorder = new StereoAudioRecorder(mediaStream, this);

	        mediaRecorder.record();

	        timeout = setInterval(function () {
	            mediaRecorder.requestData();
	        }, timeSlice);
	    };

	    this.stop = function () {
	        if (mediaRecorder) {
	            mediaRecorder.stop();
	            clearTimeout(timeout);
	        }
	    };

	    this.ondataavailable = function () {};

	    // Reference to "StereoAudioRecorder" object
	    var mediaRecorder;
	    var timeout;
	}
	module.exports.StereoRecorder = StereoRecorder;
	// ======================
	// StereoAudioRecorder.js

	// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js

	function StereoAudioRecorder(mediaStream, root) {
	    // variables
	    var leftchannel = [];
	    var rightchannel = [];
	    var scriptprocessornode;
	    var recording = false;
	    var recordingLength = 0;
	    var volume;
	    var audioInput;
	    var sampleRate = root.sampleRate || 44100; // range: 22050 to 96000
	    var audioContext;
	    var context;

	    var numChannels = root.audioChannels || 2;

	    this.record = function () {
	        recording = true;
	        // reset the buffers for the new recording
	        leftchannel.length = rightchannel.length = 0;
	        recordingLength = 0;
	    };

	    this.requestData = function () {
	        if (recordingLength == 0) {
	            requestDataInvoked = false;
	            return;
	        }

	        requestDataInvoked = true;
	        // clone stuff
	        var internal_leftchannel = leftchannel.slice(0);
	        var internal_rightchannel = rightchannel.slice(0);
	        var internal_recordingLength = recordingLength;

	        // reset the buffers for the new recording
	        leftchannel.length = rightchannel.length = [];
	        recordingLength = 0;
	        requestDataInvoked = false;

	        // we flat the left and right channels down
	        var leftBuffer = mergeBuffers(internal_leftchannel, internal_recordingLength);
	        var rightBuffer = mergeBuffers(internal_leftchannel, internal_recordingLength);

	        // we interleave both channels together
	        if (numChannels === 2) {
	            var interleaved = interleave(leftBuffer, rightBuffer);
	        } else {
	            var interleaved = leftBuffer;
	        }

	        // we create our wav file
	        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
	        var view = new DataView(buffer);

	        // RIFF chunk descriptor
	        writeUTFBytes(view, 0, 'RIFF');
	        view.setUint32(4, 44 + interleaved.length * 2, true);
	        writeUTFBytes(view, 8, 'WAVE');
	        // FMT sub-chunk
	        writeUTFBytes(view, 12, 'fmt ');
	        view.setUint32(16, 16, true);
	        view.setUint16(20, 1, true);
	        // stereo (2 channels)
	        view.setUint16(22, numChannels, true);
	        view.setUint32(24, sampleRate, true);
	        view.setUint32(28, sampleRate * 4, true);
	        view.setUint16(32, numChannels * 2, true);
	        view.setUint16(34, 16, true);
	        // data sub-chunk
	        writeUTFBytes(view, 36, 'data');
	        view.setUint32(40, interleaved.length * 2, true);

	        // write the PCM samples
	        var lng = interleaved.length;
	        var index = 44;
	        var volume = 1;
	        for (var i = 0; i < lng; i++) {
	            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
	            index += 2;
	        }

	        // our final binary blob
	        var blob = new Blob([view], {
	            type: 'audio/wav'
	        });

	        console.debug('audio recorded blob size:', bytesToSize(blob.size));

	        root.ondataavailable(blob);
	    };

	    this.stop = function () {
	        // we stop recording
	        recording = false;
	        this.requestData();
	    };

	    function interleave(leftChannel, rightChannel) {
	        var length = leftChannel.length + rightChannel.length;
	        var result = new Float32Array(length);

	        var inputIndex = 0;

	        for (var index = 0; index < length;) {
	            result[index++] = leftChannel[inputIndex];
	            result[index++] = rightChannel[inputIndex];
	            inputIndex++;
	        }
	        return result;
	    }

	    function mergeBuffers(channelBuffer, recordingLength) {
	        var result = new Float32Array(recordingLength);
	        var offset = 0;
	        var lng = channelBuffer.length;
	        for (var i = 0; i < lng; i++) {
	            var buffer = channelBuffer[i];
	            result.set(buffer, offset);
	            offset += buffer.length;
	        }
	        return result;
	    }

	    function writeUTFBytes(view, offset, string) {
	        var lng = string.length;
	        for (var i = 0; i < lng; i++) {
	            view.setUint8(offset + i, string.charCodeAt(i));
	        }
	    }

	    // creates the audio context

	    // creates the audio context
	    var audioContext = ObjectStore.AudioContext;

	    if (!ObjectStore.AudioContextConstructor) ObjectStore.AudioContextConstructor = new audioContext();

	    var context = ObjectStore.AudioContextConstructor;

	    // creates a gain node
	    if (!ObjectStore.VolumeGainNode) ObjectStore.VolumeGainNode = context.createGain();

	    var volume = ObjectStore.VolumeGainNode;

	    // creates an audio node from the microphone incoming stream
	    if (!ObjectStore.AudioInput) ObjectStore.AudioInput = context.createMediaStreamSource(mediaStream);

	    // creates an audio node from the microphone incoming stream
	    var audioInput = ObjectStore.AudioInput;

	    // connect the stream to the gain node
	    audioInput.connect(volume);

	    /* From the spec: This value controls how frequently the audioprocess event is
	    dispatched and how many sample-frames need to be processed each call.
	    Lower values for buffer size will result in a lower (better) latency.
	    Higher values will be necessary to avoid audio breakup and glitches 
	    Legal values are 256, 512, 1024, 2048, 4096, 8192, and 16384.*/
	    var bufferSize = root.bufferSize || 2048;
	    if (root.bufferSize == 0) bufferSize = 0;

	    if (context.createJavaScriptNode) {
	        scriptprocessornode = context.createJavaScriptNode(bufferSize, numChannels, numChannels);
	    } else if (context.createScriptProcessor) {
	        scriptprocessornode = context.createScriptProcessor(bufferSize, numChannels, numChannels);
	    } else {
	        throw 'WebAudio API has no support on this browser.';
	    }

	    bufferSize = scriptprocessornode.bufferSize;

	    console.debug('using audio buffer-size:', bufferSize);

	    var requestDataInvoked = false;

	    // sometimes "scriptprocessornode" disconnects from he destination-node
	    // and there is no exception thrown in this case.
	    // and obviously no further "ondataavailable" events will be emitted.
	    // below global-scope variable is added to debug such unexpected but "rare" cases.
	    window.scriptprocessornode = scriptprocessornode;

	    if (numChannels == 1) {
	        console.debug('All right-channels are skipped.');
	    }

	    // http://webaudio.github.io/web-audio-api/#the-scriptprocessornode-interface
	    scriptprocessornode.onaudioprocess = function (e) {
	        if (!recording || requestDataInvoked) return;

	        var left = e.inputBuffer.getChannelData(0);
	        leftchannel.push(new Float32Array(left));

	        if (numChannels == 2) {
	            var right = e.inputBuffer.getChannelData(1);
	            rightchannel.push(new Float32Array(right));
	        }
	        recordingLength += bufferSize;
	    };

	    volume.connect(scriptprocessornode);
	    scriptprocessornode.connect(context.destination);
	}

	// =======================
	// WhammyRecorderHelper.js

	function WhammyRecorderHelper(mediaStream, root) {
	    this.record = function (timeSlice) {
	        if (!this.width) this.width = 320;
	        if (!this.height) this.height = 240;

	        if (this.video && this.video instanceof HTMLVideoElement) {
	            if (!this.width) this.width = video.videoWidth || video.clientWidth || 320;
	            if (!this.height) this.height = video.videoHeight || video.clientHeight || 240;
	        }

	        if (!this.video) {
	            this.video = {
	                width: this.width,
	                height: this.height
	            };
	        }

	        if (!this.canvas || !this.canvas.width || !this.canvas.height) {
	            this.canvas = {
	                width: this.width,
	                height: this.height
	            };
	        }

	        canvas.width = this.canvas.width;
	        canvas.height = this.canvas.height;

	        // setting defaults
	        if (this.video && this.video instanceof HTMLVideoElement) {
	            video = this.video.cloneNode();
	        } else {
	            video = document.createElement('video');
	            video.src = URL.createObjectURL(mediaStream);

	            video.width = this.video.width;
	            video.height = this.video.height;
	        }

	        video.muted = true;
	        video.play();

	        lastTime = new Date().getTime();
	        whammy = new Whammy.Video();

	        console.log('canvas resolutions', canvas.width, '*', canvas.height);
	        console.log('video width/height', video.width || canvas.width, '*', video.height || canvas.height);

	        drawFrames();
	    };

	    this.clearOldRecordedFrames = function () {
	        frames = [];
	    };

	    var requestDataInvoked = false;
	    this.requestData = function () {
	        if (!frames.length) {
	            requestDataInvoked = false;
	            return;
	        }

	        requestDataInvoked = true;
	        // clone stuff
	        var internal_frames = frames.slice(0);

	        // reset the frames for the new recording
	        frames = [];

	        whammy.frames = dropBlackFrames(internal_frames, -1);

	        var WebM_Blob = whammy.compile();
	        root.ondataavailable(WebM_Blob);

	        console.debug('video recorded blob size:', bytesToSize(WebM_Blob.size));

	        requestDataInvoked = false;
	    };

	    var frames = [];

	    var isOnStartedDrawingNonBlankFramesInvoked = false;

	    function drawFrames() {
	        if (isStopDrawing) return;

	        if (requestDataInvoked) return setTimeout(drawFrames, 100);

	        var duration = new Date().getTime() - lastTime;
	        if (!duration) return drawFrames();

	        // via webrtc-experiment#206, by Jack i.e. @Seymourr
	        lastTime = new Date().getTime();

	        context.drawImage(video, 0, 0, canvas.width, canvas.height);
	        !isStopDrawing && frames.push({
	            duration: duration,
	            image: canvas.toDataURL('image/webp')
	        });

	        if (!isOnStartedDrawingNonBlankFramesInvoked && !isBlankFrame(frames[frames.length - 1])) {
	            isOnStartedDrawingNonBlankFramesInvoked = true;
	            root.onStartedDrawingNonBlankFrames();
	        }

	        setTimeout(drawFrames, 10);
	    }

	    var isStopDrawing = false;

	    this.stop = function () {
	        isStopDrawing = true;
	        this.requestData();
	    };

	    var canvas = document.createElement('canvas');
	    var context = canvas.getContext('2d');

	    var video;
	    var lastTime;
	    var whammy;

	    var self = this;

	    function isBlankFrame(frame, _pixTolerance, _frameTolerance) {
	        var localCanvas = document.createElement('canvas');
	        localCanvas.width = canvas.width;
	        localCanvas.height = canvas.height;
	        var context2d = localCanvas.getContext('2d');

	        var sampleColor = {
	            r: 0,
	            g: 0,
	            b: 0
	        };
	        var maxColorDifference = Math.sqrt(Math.pow(255, 2) + Math.pow(255, 2) + Math.pow(255, 2));
	        var pixTolerance = _pixTolerance && _pixTolerance >= 0 && _pixTolerance <= 1 ? _pixTolerance : 0;
	        var frameTolerance = _frameTolerance && _frameTolerance >= 0 && _frameTolerance <= 1 ? _frameTolerance : 0;

	        var matchPixCount, endPixCheck, maxPixCount;

	        var image = new Image();
	        image.src = frame.image;
	        context2d.drawImage(image, 0, 0, canvas.width, canvas.height);
	        var imageData = context2d.getImageData(0, 0, canvas.width, canvas.height);
	        matchPixCount = 0;
	        endPixCheck = imageData.data.length;
	        maxPixCount = imageData.data.length / 4;

	        for (var pix = 0; pix < endPixCheck; pix += 4) {
	            var currentColor = {
	                r: imageData.data[pix],
	                g: imageData.data[pix + 1],
	                b: imageData.data[pix + 2]
	            };
	            var colorDifference = Math.sqrt(Math.pow(currentColor.r - sampleColor.r, 2) + Math.pow(currentColor.g - sampleColor.g, 2) + Math.pow(currentColor.b - sampleColor.b, 2));
	            // difference in color it is difference in color vectors (r1,g1,b1) <=> (r2,g2,b2)
	            if (colorDifference <= maxColorDifference * pixTolerance) {
	                matchPixCount++;
	            }
	        }

	        if (maxPixCount - matchPixCount <= maxPixCount * frameTolerance) {
	            return false;
	        } else {
	            return true;
	        }
	    }

	    function dropBlackFrames(_frames, _framesToCheck, _pixTolerance, _frameTolerance) {
	        var localCanvas = document.createElement('canvas');
	        localCanvas.width = canvas.width;
	        localCanvas.height = canvas.height;
	        var context2d = localCanvas.getContext('2d');
	        var resultFrames = [];

	        var checkUntilNotBlack = _framesToCheck === -1;
	        var endCheckFrame = _framesToCheck && _framesToCheck > 0 && _framesToCheck <= _frames.length ? _framesToCheck : _frames.length;
	        var sampleColor = {
	            r: 0,
	            g: 0,
	            b: 0
	        };
	        var maxColorDifference = Math.sqrt(Math.pow(255, 2) + Math.pow(255, 2) + Math.pow(255, 2));
	        var pixTolerance = _pixTolerance && _pixTolerance >= 0 && _pixTolerance <= 1 ? _pixTolerance : 0;
	        var frameTolerance = _frameTolerance && _frameTolerance >= 0 && _frameTolerance <= 1 ? _frameTolerance : 0;
	        var doNotCheckNext = false;

	        for (var f = 0; f < endCheckFrame; f++) {
	            var matchPixCount, endPixCheck, maxPixCount;

	            if (!doNotCheckNext) {
	                var image = new Image();
	                image.src = _frames[f].image;
	                context2d.drawImage(image, 0, 0, canvas.width, canvas.height);
	                var imageData = context2d.getImageData(0, 0, canvas.width, canvas.height);
	                matchPixCount = 0;
	                endPixCheck = imageData.data.length;
	                maxPixCount = imageData.data.length / 4;

	                for (var pix = 0; pix < endPixCheck; pix += 4) {
	                    var currentColor = {
	                        r: imageData.data[pix],
	                        g: imageData.data[pix + 1],
	                        b: imageData.data[pix + 2]
	                    };
	                    var colorDifference = Math.sqrt(Math.pow(currentColor.r - sampleColor.r, 2) + Math.pow(currentColor.g - sampleColor.g, 2) + Math.pow(currentColor.b - sampleColor.b, 2));
	                    // difference in color it is difference in color vectors (r1,g1,b1) <=> (r2,g2,b2)
	                    if (colorDifference <= maxColorDifference * pixTolerance) {
	                        matchPixCount++;
	                    }
	                }
	            }

	            if (!doNotCheckNext && maxPixCount - matchPixCount <= maxPixCount * frameTolerance) {
	                // console.log('removed black frame : ' + f + ' ; frame duration ' + _frames[f].duration);
	            } else {
	                    // console.log('frame is passed : ' + f);
	                    if (checkUntilNotBlack) {
	                        doNotCheckNext = true;
	                    }
	                    resultFrames.push(_frames[f]);
	                }
	        }

	        resultFrames = resultFrames.concat(_frames.slice(endCheckFrame));

	        if (resultFrames.length <= 0) {
	            // at least one last frame should be available for next manipulation
	            // if total duration of all frames will be < 1000 than ffmpeg doesn't work well...
	            resultFrames.push(_frames[_frames.length - 1]);
	        }

	        return resultFrames;
	    }
	}

	// =================
	// WhammyRecorder.js

	function WhammyRecorder(mediaStream) {
	    // void start(optional long timeSlice)
	    // timestamp to fire "ondataavailable"
	    this.start = function (timeSlice) {
	        timeSlice = timeSlice || 1000;

	        mediaRecorder = new WhammyRecorderHelper(mediaStream, this);

	        for (var prop in this) {
	            if (typeof this[prop] !== 'function') {
	                mediaRecorder[prop] = this[prop];
	            }
	        }

	        mediaRecorder.record();

	        timeout = setInterval(function () {
	            mediaRecorder.requestData();
	        }, timeSlice);
	    };

	    this.stop = function () {
	        if (mediaRecorder) {
	            mediaRecorder.stop();
	            clearTimeout(timeout);
	        }
	    };

	    this.clearOldRecordedFrames = function () {
	        if (mediaRecorder) {
	            mediaRecorder.clearOldRecordedFrames();
	        }
	    };

	    this.ondataavailable = function () {};

	    // Reference to "WhammyRecorder" object
	    var mediaRecorder;
	    var timeout;
	}

	// Muaz Khan     - https://github.com/muaz-khan
	// neizerth      - https://github.com/neizerth
	// MIT License   - https://www.webrtc-experiment.com/licence/
	// Documentation - https://github.com/streamproc/MediaStreamRecorder

	// Note:
	// ==========================================================
	// whammy.js is an "external library"
	// and has its own copyrights. Taken from "Whammy" project.

	// https://github.com/antimatter15/whammy/blob/master/LICENSE
	// =========
	// Whammy.js

	// todo: Firefox now supports webp for webm containers!
	// their MediaRecorder implementation works well!
	// should we provide an option to record via Whammy.js or MediaRecorder API is a better solution?

	var Whammy = function () {

	    function toWebM(frames) {
	        var info = checkFrames(frames);

	        var CLUSTER_MAX_DURATION = 30000;

	        var EBML = [{
	            "id": 0x1a45dfa3, // EBML
	            "data": [{
	                "data": 1,
	                "id": 0x4286 // EBMLVersion
	            }, {
	                "data": 1,
	                "id": 0x42f7 // EBMLReadVersion
	            }, {
	                "data": 4,
	                "id": 0x42f2 // EBMLMaxIDLength
	            }, {
	                "data": 8,
	                "id": 0x42f3 // EBMLMaxSizeLength
	            }, {
	                "data": "webm",
	                "id": 0x4282 // DocType
	            }, {
	                "data": 2,
	                "id": 0x4287 // DocTypeVersion
	            }, {
	                "data": 2,
	                "id": 0x4285 // DocTypeReadVersion
	            }]
	        }, {
	            "id": 0x18538067, // Segment
	            "data": [{
	                "id": 0x1549a966, // Info
	                "data": [{
	                    "data": 1e6, //do things in millisecs (num of nanosecs for duration scale)
	                    "id": 0x2ad7b1 // TimecodeScale
	                }, {
	                    "data": "whammy",
	                    "id": 0x4d80 // MuxingApp
	                }, {
	                    "data": "whammy",
	                    "id": 0x5741 // WritingApp
	                }, {
	                    "data": doubleToString(info.duration),
	                    "id": 0x4489 // Duration
	                }]
	            }, {
	                "id": 0x1654ae6b, // Tracks
	                "data": [{
	                    "id": 0xae, // TrackEntry
	                    "data": [{
	                        "data": 1,
	                        "id": 0xd7 // TrackNumber
	                    }, {
	                        "data": 1,
	                        "id": 0x63c5 // TrackUID
	                    }, {
	                        "data": 0,
	                        "id": 0x9c // FlagLacing
	                    }, {
	                        "data": "und",
	                        "id": 0x22b59c // Language
	                    }, {
	                        "data": "V_VP8",
	                        "id": 0x86 // CodecID
	                    }, {
	                        "data": "VP8",
	                        "id": 0x258688 // CodecName
	                    }, {
	                        "data": 1,
	                        "id": 0x83 // TrackType
	                    }, {
	                        "id": 0xe0, // Video
	                        "data": [{
	                            "data": info.width,
	                            "id": 0xb0 // PixelWidth
	                        }, {
	                            "data": info.height,
	                            "id": 0xba // PixelHeight
	                        }]
	                    }]
	                }]
	            }]
	        }];

	        //Generate clusters (max duration)
	        var frameNumber = 0;
	        var clusterTimecode = 0;
	        while (frameNumber < frames.length) {

	            var clusterFrames = [];
	            var clusterDuration = 0;
	            do {
	                clusterFrames.push(frames[frameNumber]);
	                clusterDuration += frames[frameNumber].duration;
	                frameNumber++;
	            } while (frameNumber < frames.length && clusterDuration < CLUSTER_MAX_DURATION);

	            var clusterCounter = 0;
	            var cluster = {
	                "id": 0x1f43b675, // Cluster
	                "data": [{
	                    "data": clusterTimecode,
	                    "id": 0xe7 // Timecode
	                }].concat(clusterFrames.map(function (webp) {
	                    var block = makeSimpleBlock({
	                        discardable: 0,
	                        frame: webp.data.slice(4),
	                        invisible: 0,
	                        keyframe: 1,
	                        lacing: 0,
	                        trackNum: 1,
	                        timecode: Math.round(clusterCounter)
	                    });
	                    clusterCounter += webp.duration;
	                    return {
	                        data: block,
	                        id: 0xa3
	                    };
	                }))
	            }; //Add cluster to segment
	            EBML[1].data.push(cluster);
	            clusterTimecode += clusterDuration;
	        }

	        return generateEBML(EBML);
	    }

	    // sums the lengths of all the frames and gets the duration

	    function checkFrames(frames) {
	        if (!frames[0]) {
	            console.warn('Something went wrong. Maybe WebP format is not supported in the current browser.');
	            return;
	        }

	        var width = frames[0].width,
	            height = frames[0].height,
	            duration = frames[0].duration;

	        for (var i = 1; i < frames.length; i++) {
	            duration += frames[i].duration;
	        }
	        return {
	            duration: duration,
	            width: width,
	            height: height
	        };
	    }

	    function numToBuffer(num) {
	        var parts = [];
	        while (num > 0) {
	            parts.push(num & 0xff);
	            num = num >> 8;
	        }
	        return new Uint8Array(parts.reverse());
	    }

	    function strToBuffer(str) {
	        return new Uint8Array(str.split('').map(function (e) {
	            return e.charCodeAt(0);
	        }));
	    }

	    function bitsToBuffer(bits) {
	        var data = [];
	        var pad = bits.length % 8 ? new Array(1 + 8 - bits.length % 8).join('0') : '';
	        bits = pad + bits;
	        for (var i = 0; i < bits.length; i += 8) {
	            data.push(parseInt(bits.substr(i, 8), 2));
	        }
	        return new Uint8Array(data);
	    }

	    function generateEBML(json) {
	        var ebml = [];
	        for (var i = 0; i < json.length; i++) {
	            var data = json[i].data;
	            if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) == 'object') data = generateEBML(data);
	            if (typeof data == 'number') data = bitsToBuffer(data.toString(2));
	            if (typeof data == 'string') data = strToBuffer(data);

	            var len = data.size || data.byteLength || data.length;
	            var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
	            var size_str = len.toString(2);
	            var padded = new Array(zeroes * 7 + 7 + 1 - size_str.length).join('0') + size_str;
	            var size = new Array(zeroes).join('0') + '1' + padded;

	            ebml.push(numToBuffer(json[i].id));
	            ebml.push(bitsToBuffer(size));
	            ebml.push(data);
	        }

	        return new Blob(ebml, {
	            type: "video/webm"
	        });
	    }

	    function toBinStr_old(bits) {
	        var data = '';
	        var pad = bits.length % 8 ? new Array(1 + 8 - bits.length % 8).join('0') : '';
	        bits = pad + bits;
	        for (var i = 0; i < bits.length; i += 8) {
	            data += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
	        }
	        return data;
	    }

	    function generateEBML_old(json) {
	        var ebml = '';
	        for (var i = 0; i < json.length; i++) {
	            var data = json[i].data;
	            if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) == 'object') data = generateEBML_old(data);
	            if (typeof data == 'number') data = toBinStr_old(data.toString(2));

	            var len = data.length;
	            var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
	            var size_str = len.toString(2);
	            var padded = new Array(zeroes * 7 + 7 + 1 - size_str.length).join('0') + size_str;
	            var size = new Array(zeroes).join('0') + '1' + padded;

	            ebml += toBinStr_old(json[i].id.toString(2)) + toBinStr_old(size) + data;
	        }
	        return ebml;
	    }

	    function makeSimpleBlock(data) {
	        var flags = 0;
	        if (data.keyframe) flags |= 128;
	        if (data.invisible) flags |= 8;
	        if (data.lacing) flags |= data.lacing << 1;
	        if (data.discardable) flags |= 1;
	        if (data.trackNum > 127) {
	            throw "TrackNumber > 127 not supported";
	        }
	        var out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function (e) {
	            return String.fromCharCode(e);
	        }).join('') + data.frame;

	        return out;
	    }

	    function parseWebP(riff) {
	        var VP8 = riff.RIFF[0].WEBP[0];

	        var frame_start = VP8.indexOf('\x9d\x01\x2a'); // A VP8 keyframe starts with the 0x9d012a header
	        for (var i = 0, c = []; i < 4; i++) {
	            c[i] = VP8.charCodeAt(frame_start + 3 + i);
	        }var width, height, tmp;

	        //the code below is literally copied verbatim from the bitstream spec
	        tmp = c[1] << 8 | c[0];
	        width = tmp & 0x3FFF;
	        tmp = c[3] << 8 | c[2];
	        height = tmp & 0x3FFF;
	        return {
	            width: width,
	            height: height,
	            data: VP8,
	            riff: riff
	        };
	    }

	    function parseRIFF(string) {
	        var offset = 0;
	        var chunks = {};

	        while (offset < string.length) {
	            var id = string.substr(offset, 4);
	            var len = parseInt(string.substr(offset + 4, 4).split('').map(function (i) {
	                var unpadded = i.charCodeAt(0).toString(2);
	                return new Array(8 - unpadded.length + 1).join('0') + unpadded;
	            }).join(''), 2);
	            var data = string.substr(offset + 4 + 4, len);
	            offset += 4 + 4 + len;
	            chunks[id] = chunks[id] || [];

	            if (id == 'RIFF' || id == 'LIST') {
	                chunks[id].push(parseRIFF(data));
	            } else {
	                chunks[id].push(data);
	            }
	        }
	        return chunks;
	    }

	    function doubleToString(num) {
	        return [].slice.call(new Uint8Array(new Float64Array([num]).buffer), 0).map(function (e) {
	            return String.fromCharCode(e);
	        }).reverse().join('');
	    }

	    // a more abstract-ish API

	    function WhammyVideo(duration) {
	        this.frames = [];
	        this.duration = duration || 1;
	        this.quality = 100;
	    }

	    WhammyVideo.prototype.add = function (frame, duration) {
	        if ('canvas' in frame) {
	            //CanvasRenderingContext2D
	            frame = frame.canvas;
	        }

	        if ('toDataURL' in frame) {
	            frame = frame.toDataURL('image/webp', this.quality);
	        }

	        if (!/^data:image\/webp;base64,/ig.test(frame)) {
	            throw "Input must be formatted properly as a base64 encoded DataURI of type image/webp";
	        }
	        this.frames.push({
	            image: frame,
	            duration: duration || this.duration
	        });
	    };
	    WhammyVideo.prototype.compile = function () {
	        return new toWebM(this.frames.map(function (frame) {
	            var webp = parseWebP(parseRIFF(atob(frame.image.slice(23))));
	            webp.duration = frame.duration;
	            return webp;
	        }));
	    };
	    return {
	        Video: WhammyVideo,
	        toWebM: toWebM
	    };
	}();

	// Muaz Khan     - https://github.com/muaz-khan
	// neizerth      - https://github.com/neizerth
	// MIT License   - https://www.webrtc-experiment.com/licence/
	// Documentation - https://github.com/streamproc/MediaStreamRecorder
	// ==========================================================
	// GifRecorder.js

	function GifRecorder(mediaStream) {
	    if (!window.GIFEncoder) {
	        throw 'Please link: https://cdn.webrtc-experiment.com/gif-recorder.js';
	    }

	    // void start(optional long timeSlice)
	    // timestamp to fire "ondataavailable"
	    this.start = function (timeSlice) {
	        timeSlice = timeSlice || 1000;

	        var imageWidth = this.videoWidth || 320;
	        var imageHeight = this.videoHeight || 240;

	        canvas.width = video.width = imageWidth;
	        canvas.height = video.height = imageHeight;

	        // external library to record as GIF images
	        gifEncoder = new GIFEncoder();

	        // void setRepeat(int iter)
	        // Sets the number of times the set of GIF frames should be played.
	        // Default is 1; 0 means play indefinitely.
	        gifEncoder.setRepeat(0);

	        // void setFrameRate(Number fps)
	        // Sets frame rate in frames per second.
	        // Equivalent to setDelay(1000/fps).
	        // Using "setDelay" instead of "setFrameRate"
	        gifEncoder.setDelay(this.frameRate || 200);

	        // void setQuality(int quality)
	        // Sets quality of color quantization (conversion of images to the
	        // maximum 256 colors allowed by the GIF specification).
	        // Lower values (minimum = 1) produce better colors,
	        // but slow processing significantly. 10 is the default,
	        // and produces good color mapping at reasonable speeds.
	        // Values greater than 20 do not yield significant improvements in speed.
	        gifEncoder.setQuality(this.quality || 1);

	        // Boolean start()
	        // This writes the GIF Header and returns false if it fails.
	        gifEncoder.start();

	        startTime = Date.now();

	        function drawVideoFrame(time) {
	            lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

	            if ((typeof lastFrameTime === 'undefined' ? 'undefined' : _typeof(lastFrameTime)) === undefined) {
	                lastFrameTime = time;
	            }

	            // ~10 fps
	            if (time - lastFrameTime < 90) return;

	            context.drawImage(video, 0, 0, imageWidth, imageHeight);

	            gifEncoder.addFrame(context);

	            // console.log('Recording...' + Math.round((Date.now() - startTime) / 1000) + 's');
	            // console.log("fps: ", 1000 / (time - lastFrameTime));

	            lastFrameTime = time;
	        }

	        lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

	        timeout = setTimeout(doneRecording, timeSlice);
	    };

	    function doneRecording() {
	        endTime = Date.now();

	        var gifBlob = new Blob([new Uint8Array(gifEncoder.stream().bin)], {
	            type: 'image/gif'
	        });
	        self.ondataavailable(gifBlob);

	        // todo: find a way to clear old recorded blobs
	        gifEncoder.stream().bin = [];
	    };

	    this.stop = function () {
	        if (lastAnimationFrame) {
	            cancelAnimationFrame(lastAnimationFrame);
	            clearTimeout(timeout);
	            doneRecording();
	        }
	    };

	    this.ondataavailable = function () {};
	    this.onstop = function () {};

	    // Reference to itself
	    var self = this;

	    var canvas = document.createElement('canvas');
	    var context = canvas.getContext('2d');

	    var video = document.createElement('video');
	    video.muted = true;
	    video.autoplay = true;
	    video.src = URL.createObjectURL(mediaStream);
	    video.play();

	    var lastAnimationFrame = null;
	    var startTime, endTime, lastFrameTime;

	    var gifEncoder;
	    var timeout;
	}

	// ______________________
	// MultiStreamRecorder.js

	function MultiStreamRecorder(mediaStream) {
	    if (!mediaStream) throw 'MediaStream is mandatory.';

	    var self = this;
	    var isFirefox = !!navigator.mozGetUserMedia;

	    this.stream = mediaStream;

	    // void start(optional long timeSlice)
	    // timestamp to fire "ondataavailable"
	    this.start = function (timeSlice) {
	        audioRecorder = new MediaStreamRecorder(mediaStream);
	        videoRecorder = new MediaStreamRecorder(mediaStream);

	        audioRecorder.mimeType = 'audio/ogg';
	        videoRecorder.mimeType = 'video/webm';

	        for (var prop in this) {
	            if (typeof this[prop] !== 'function') {
	                audioRecorder[prop] = videoRecorder[prop] = this[prop];
	            }
	        }

	        audioRecorder.ondataavailable = function (blob) {
	            if (!audioVideoBlobs[recordingInterval]) {
	                audioVideoBlobs[recordingInterval] = {};
	            }

	            audioVideoBlobs[recordingInterval].audio = blob;

	            if (audioVideoBlobs[recordingInterval].video && !audioVideoBlobs[recordingInterval].onDataAvailableEventFired) {
	                audioVideoBlobs[recordingInterval].onDataAvailableEventFired = true;
	                fireOnDataAvailableEvent(audioVideoBlobs[recordingInterval]);
	            }
	        };

	        videoRecorder.ondataavailable = function (blob) {
	            if (isFirefox) {
	                return self.ondataavailable({
	                    video: blob,
	                    audio: blob
	                });
	            }

	            if (!audioVideoBlobs[recordingInterval]) {
	                audioVideoBlobs[recordingInterval] = {};
	            }

	            audioVideoBlobs[recordingInterval].video = blob;

	            if (audioVideoBlobs[recordingInterval].audio && !audioVideoBlobs[recordingInterval].onDataAvailableEventFired) {
	                audioVideoBlobs[recordingInterval].onDataAvailableEventFired = true;
	                fireOnDataAvailableEvent(audioVideoBlobs[recordingInterval]);
	            }
	        };

	        function fireOnDataAvailableEvent(blobs) {
	            recordingInterval++;
	            self.ondataavailable(blobs);
	        }

	        videoRecorder.onstop = audioRecorder.onstop = function (error) {
	            self.onstop(error);
	        };

	        if (!isFirefox) {
	            // to make sure both audio/video are synced.
	            videoRecorder.onStartedDrawingNonBlankFrames = function () {
	                videoRecorder.clearOldRecordedFrames();
	                audioRecorder.start(timeSlice);
	            };
	            videoRecorder.start(timeSlice);
	        } else {
	            videoRecorder.start(timeSlice);
	        }
	    };

	    this.stop = function () {
	        if (audioRecorder) audioRecorder.stop();
	        if (videoRecorder) videoRecorder.stop();
	    };

	    this.ondataavailable = function (blob) {
	        console.log('ondataavailable..', blob);
	    };

	    this.onstop = function (error) {
	        console.warn('stopped..', error);
	    };

	    var audioRecorder;
	    var videoRecorder;

	    var audioVideoBlobs = {};
	    var recordingInterval = 0;
	}

	function bytesToSize(bytes) {
	    var k = 1000;
	    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	    if (bytes === 0) {
	        return '0 Bytes';
	    }
	    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
	    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
	}

/***/ }
/******/ ]);