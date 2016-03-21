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

	'use strict';

	var _monkeyUI = __webpack_require__(1);

	__webpack_require__(20);
	//require('./monkeyui.js');


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
	        _monkeyUI.monkeyUI.setChat(view);
	        $(document).ready(function () {
	            _monkeyUI.monkeyUI.form = form != null && form != undefined;
	            _monkeyUI.monkeyUI.drawScene();
	            if (form != null && form != undefined) {
	                _monkeyUI.monkeyUI.form = true;
	                _monkeyUI.monkeyUI.addLoginForm(form);
	            }
	        });
	    }

	    function startSession(userObj) {
	        _monkeyUI.monkeyUI.disappearOptionsOutWindow();
	        _monkeyUI.monkeyUI.startLoading();
	        if (userObj != null) {
	            myUser = new MUIUser(userObj.id, userObj.monkey_id, userObj.name, userObj.privacy, userObj.urlAvatar);
	        }

	        monkey.init(monkeyChat.appId, monkeyChat.appKey, userObj, false, MONKEY_DEBUG_MODE);
	    }

	    /***********************************************/
	    /***************** MONKEY SDK ******************/
	    /***********************************************/

	    $(monkey).on("onConnect", function (event, eObject) {
	        _monkeyUI.monkeyUI.stopLoading();
	        _monkeyUI.monkeyUI.login = true;
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

	        _monkeyUI.monkeyUI.loadDataScreen(myUser);
	        openConversation(callCenterUser.monkeyId);
	    });

	    // --------------- ON DISCONNECT ----------------- //
	    $(monkey).on("onDisconnect", function (event, eObject) {
	        _monkeyUI.monkeyUI.startLoading();
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
	        var _notification = mokMessage;
	        console.log(mokMessage);
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
	                                    _monkeyUI.monkeyUI.updateTypingState(_conversationId, _typeTmpNotif);
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
	                    _monkeyUI.monkeyUI.updateStatusReadMessageBubble(_conversationId);
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
	        var _acknowledge = mokMessage;
	        console.log(mokMessage);
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
	                    _monkeyUI.monkeyUI.updateStatusMessageBubble(old_id, new_id, status);
	                }
	                break;
	            case 2:
	                {
	                    // media
	                    console.log('file message received by the user');

	                    var old_id = _acknowledge.oldId;
	                    var new_id = _acknowledge.id;
	                    var status = _acknowledge.props.status;
	                    _monkeyUI.monkeyUI.updateStatusMessageBubble(old_id, new_id, status);
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
	                    _monkeyUI.monkeyUI.updateOnlineStatus(_lastOpenApp, _online);
	                }
	                break;
	            default:
	                break;
	        }
	    });

	    /***********************************************/
	    /****************** MONKEY UI ******************/
	    /***********************************************/

	    $(_monkeyUI.monkeyUI).on('textMessage', function (event, text) {
	        if (text != undefined) {
	            prepareTextMessage(text, false);
	        }
	    });

	    $(_monkeyUI.monkeyUI).on('imageMessage', function (event, file) {
	        if (file != undefined) {
	            prepareImageToSend(file, false);
	        }
	    });

	    $(_monkeyUI.monkeyUI).on('audioMessage', function (event, audio, messageOldId) {
	        if (audio != undefined) {
	            prepareAudioMessage(audio, false);
	        }
	    });

	    $(_monkeyUI.monkeyUI).on('fileMessage', function (event, file) {
	        if (file != undefined) {
	            prepareFileToSend(file, false);
	        }
	    });

	    $(_monkeyUI.monkeyUI).on('quickStart', function (event, file) {
	        startSession(null);
	    });

	    /***********************************************/
	    /***************** CONVERSATIONS ***************/
	    /***********************************************/

	    function openConversation(conversationId) {
	        // draw conversation
	        var _conversation = conversations[conversationId];
	        _monkeyUI.monkeyUI.drawConversation(_conversation, false);
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
	                _monkeyUI.monkeyUI.drawTextMessageBubble(message, _conversationId, false, _status);
	                break;

	            case 2:
	                // File
	                if (message.typeFile == 1) {
	                    //audio type
	                    _monkeyUI.monkeyUI.drawAudioMessageBubble(message, _conversationId, false, _status);
	                    if (message.dataSource == undefined) {

	                        monkey.downloadFile(mokMessage, function (err, data) {
	                            if (err) {
	                                console.log(err);
	                            } else {
	                                var _src = 'data:audio/mpeg;base64,' + data;
	                                _monkeyUI.monkeyUI.updateDataMessageBubble(message.id, _src);
	                            }
	                        });
	                    }
	                } else if (message.typeFile == 3) {
	                    //file type
	                    _monkeyUI.monkeyUI.drawImageMessageBubble(message, _conversationId, false, _status);
	                    if (message.dataSource == undefined) {
	                        monkey.downloadFile(mokMessage, function (err, data) {
	                            if (err) {
	                                console.log(err);
	                            } else {
	                                var _src = 'data:' + mokMessage.props.mime_type + ';base64,' + data;
	                                _monkeyUI.monkeyUI.updateDataMessageBubble(message.id, _src);
	                            }
	                        });
	                    }
	                } else if (message.typeFile == 4) {
	                    //file type
	                    console.log('file received');
	                    _monkeyUI.monkeyUI.drawFileMessageBubble(message, _conversationId, false, _status);
	                    if (message.dataSource == undefined) {
	                        monkey.downloadFile(mokMessage, function (err, data) {
	                            if (err) {
	                                console.log(err);
	                            } else {
	                                var _src = 'data:' + mokMessage.props.mime_type + ';base64,' + data;
	                                _monkeyUI.monkeyUI.updateDataMessageBubble(mokMessage.id, _src);
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
	        var _length = messageText.length;
	        var _mokMessage = monkey.sendEncryptedMessage(messageText, currentConversationId, { length: _length, eph: _eph });

	        //messageText = findLinks(messageText);
	        var _message = new MUIMessage(_mokMessage);

	        _monkeyUI.monkeyUI.drawTextMessageBubble(_message, currentConversationId, false, 51);
	    }

	    /************ TO SEND AUDIO MESSAGE ************/

	    function prepareAudioMessage(audio, ephemeral) {

	        var _eph = ephemeral ? 1 : 0;
	        var _mokMessage = monkey.sendEncryptedFile(audio.src, currentConversationId, 'audio_.mp3', audio.type, audio.monkeyFileType, true, { eph: _eph, length: audio.duration }, null, function (err, message) {
	            if (err) {
	                console.log(err);
	            } else {
	                console.log(message);
	                _monkeyUI.monkeyUI.updateStatusMessageBubble(message.oldId, message.id, 51);
	            }
	        });

	        var _message = new MUIMessage(_mokMessage);
	        _message.setDataSource(audio.src);
	        var _status = 0;

	        _monkeyUI.monkeyUI.drawAudioMessageBubble(_message, currentConversationId, false, _status, audio.oldId);
	        _monkeyUI.monkeyUI.showChatInput();
	    }

	    /************* TO SEND IMAGE MESSAGE ************/

	    function prepareImageToSend(file, ephemeral) {

	        var data = file.src.split(',');
	        var onlyDataURL = data[1];
	        var _eph = ephemeral ? 1 : 0;
	        var params = {
	            eph: _eph
	        };
	        var _mokMessage = monkey.sendEncryptedFile(file.src, currentConversationId, file.file.name, file.file.type, file.monkeyFileType, true, params, null, function (err, message) {
	            if (err) {
	                console.log(err);
	            } else {
	                console.log(message);
	                _monkeyUI.monkeyUI.updateStatusMessageBubble(message.oldId, message.id, 51);
	            }
	        });

	        var _message = new MUIMessage(_mokMessage);
	        _message.setDataSource(file.src);
	        var _status = 0;

	        _monkeyUI.monkeyUI.drawImageMessageBubble(_message, currentConversationId, false, _status);
	    }

	    /************* TO SEND FILE MESSAGE ************/

	    function prepareFileToSend(file, ephemeral) {

	        var data = file.src.split(',');
	        var onlyDataURL = data[1];
	        var _eph = ephemeral ? 1 : 0;
	        var params = {
	            eph: _eph
	        };
	        var _mokMessage = monkey.sendEncryptedFile(file.src, currentConversationId, file.file.name, file.file.type, file.monkeyFileType, true, params, null, function (err, message) {
	            if (err) {
	                console.log(err);
	            } else {
	                console.log(message);
	                _monkeyUI.monkeyUI.updateStatusMessageBubble(message.oldId, message.id, 51);
	            }
	        });

	        var _message = new MUIMessage(_mokMessage);
	        _message.setDataSource(file.src);
	        _message.filesize = file.file.size;
	        var _status = 0;

	        _monkeyUI.monkeyUI.drawFileMessageBubble(_message, currentConversationId, false, _status);
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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.monkeyUI = undefined;

	var _MUIUser = __webpack_require__(2);

	var _MUIUser2 = _interopRequireDefault(_MUIUser);

	var _MUIConversation = __webpack_require__(3);

	var _MUIConversation2 = _interopRequireDefault(_MUIConversation);

	var _MUIMessage = __webpack_require__(4);

	var _MUIMessage2 = _interopRequireDefault(_MUIMessage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	__webpack_require__(5);

	__webpack_require__(7);
	__webpack_require__(8);
	__webpack_require__(17);

	//require('./src/jquery.knob.min.js');

	// =================
	// MUI*.js
	window.MUIUser = _MUIUser2.default;
	window.MUIConversation = _MUIConversation2.default;
	window.MUIMessage = _MUIMessage2.default;

	// =================
	// MediaStreamRecorder.js
	var MediaStreamRecorder = __webpack_require__(19).MediaStreamRecorder;
	window.StereoRecorder = __webpack_require__(19).StereoRecorder;

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

	var monkeyUI = exports.monkeyUI = new function () {
	    this.wrapperOut = '.mky-wrapper-out';
	    this.wrapperIn = '.mky-wrapper-in';
	    this.contentConnection = '#mky-content-connection';
	    this.contentApp = '#mky-content-app';
	    this.contentConversationList = '#mky-conversation-list';
	    this.contentConversationWindow = '#conversation-window';
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
	        monkeyUI.screen.data.width = conf.screen.data.width;
	        monkeyUI.screen.data.height = conf.screen.data.height;
	        monkeyUI.player = conf.player == undefined ? STANDARD : conf.player;
	    };

	    this.drawScene = function () {

	        var e = document.createElement("link");
	        e.href = "https://cdn.criptext.com/MonkeyUI/styles/chat7.css", e.type = "text/css", e.rel = "stylesheet", document.getElementsByTagName("head")[0].appendChild(e);

	        var ec = document.createElement("link");
	        ec.href = "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css", ec.type = "text/css", ec.rel = "stylesheet", document.getElementsByTagName("head")[0].appendChild(ec);

	        if ($('.mky-wrapper-out').length <= 0) {
	            var _scene = '';
	            if (this.screen.data.width != undefined && this.screen.data.height != undefined) {
	                _scene += '<div class="mky-wrapper-out ' + PREFIX + this.screen.data.mode + ' ' + PREFIX + this.screen.type + '" style="width: ' + this.screen.data.width + '; height:30px;">';
	            } else {
	                _scene += '<div class="mky-wrapper-out ' + PREFIX + this.screen.data.mode + ' ' + PREFIX + this.screen.type + '">';
	            }
	            if (this.screen.type == CLASSIC) {
	                _scene += '<div class="mky-tab">' + '<span class="mky-tablabel"> Want to know more? </span>' + '<div id="mky-w-max"></div>' + '<div id="mky-w-min" class="mky-disappear"></div>' + '</div>';
	            } else if (this.screen.type == SIDEBAR) {
	                _scene += '<div class="circle-icon">' + '<div id="w-open" class="mky-appear"></div>' + '</div>';
	            }
	            _scene += '<div class="mky-wrapper-in">' + '<div id="mky-content-connection"></div>' + '<div id="mky-content-app" class="mky-disappear">';
	            if (this.isConversationList) {
	                _scene += '<aside>' + '<ul id="mky-conversation-list" class=""></ul>' + '</aside>';
	            }
	            var _class = this.isConversationList ? 'mky-conversation-with' : 'mky-conversation-only';
	            _scene += '<section id="conversation-window" class="' + _class + '">' + '</section>' + '</div>' + '</div>' + '</div>';
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
	        var _html = '<div class="mky-spinner">' + '<div class="mky-bounce1"></div>' + '<div class="mky-bounce2"></div>' + '<div class="bounce3"></div>' + '</div>';
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
	        _html += '</header>' + '<div id="mky-chat-timeline"></div>';
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
	        if (window.location.protocol != "https:") {
	            disabledAudioButton(true);
	        }
	    }

	    /***********************************************/
	    /********************* INPUT *******************/
	    /***********************************************/

	    function drawInput(content, input) {

	        //drag & drop sizes
	        var dd_height = '';
	        var dd_width = '';

	        if (monkeyUI.screen.data.mode == PARTIALSIZE) {
	            dd_height = monkeyUI.screen.data.height;
	            dd_width = monkeyUI.screen.data.width;
	        }

	        var _html = '<div id="mky-chat-input">' + '<div id="mky-divider-chat-input"></div>';
	        if (input.isAttachButton) {
	            _html += '<div class="mky-button-input">' + '<button id="mky-button-attach" class="mky-button-icon"></button>' + '<input type="file" name="attach" id="attach-file" style="display:none" accept=".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx, image/*">' + '</div>' + '<div class="' + PREFIX + monkeyUI.screen.data.mode + ' jFiler-input-dragDrop" style="width:' + dd_width + '; height:' + dd_height + ';"><div class="jFiler-input-inner"><div class="jFiler-input-icon"><i class="icon-jfi-cloud-up-o"></i></div><div class="jFiler-input-text"><h3>Drop files here</h3></div></div></div>';
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
	        if (withName) {
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

	        var _content = '<span class="mky-message-text">' + _messageText + '</span>';
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
	            var _content = '<div class="content-audio mky-disabled">' + '<img id="playAudioBubbleImg' + message.id + '" style="display:block;" onclick="monkeyUI.playAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + ' playBubbleControl" src="../images/PlayBubble.png">' + '<img id="pauseAudioBubbleImg' + message.id + '" onclick="monkeyUI.pauseAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + '" src="../images/PauseBubble.png">' + '<input id="play-player_' + message.id + '" class="knob second" data-width="100" data-displayPrevious=true value="0">' + '<div class="mky-bubble-audio-timer"><span id="mky-minutesBubble' + message.id + '">00</span><span>:</span><span id="mky-secondsBubble' + message.id + '">00</span></div>' + '</div>' + '<audio id="audio_' + message.id + '" preload="auto" style="display:none;" controls="" src="' + _dataSource + '"></audio>';
	            _messagePoint.append(_content);

	            createAudiohandlerBubble(message.id, Math.round(message.length));
	            audiobuble = document.getElementById("audio_" + message.id);
	            audiobuble.oncanplay = function () {
	                createAudiohandlerBubble(message.id, Math.round(audiobuble.duration));
	                setDurationTime(message.id);
	                $('#' + message.id + ' .content-audio').removeClass('mky-disabled');
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
	                _bubble += '<span class="mky-message-hour">' + defineTime(message.timestamp * 1000) + '</span>' + '</div>' + '<span class="mky-message-text">' + _messageText + '</span>' + '</div>' + '</div>';
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
	                _bubble += '<div class="mky-message-content-timer">' + '<i class="fa fa-clock-o"></i>' + '<span class="mky-message-timer"> ' + defineTimer(_duration) + '</span>' + '</div>' + '</div>' + '<span class="mky-message-text">Click to read</span>' + '<div class="mky-message-code">' + message.encryptedText + '</div>' + '</div>' + '</div>';
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
	                _bubble += '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="mky-message-text">' + _messageText + '</span>' + '</div>' + '</div>';
	            } else {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble mky-bubble-text mky-bubble-text-out mky-bubble-out' + (status == 0 ? 'mky-sending' : '') + '">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status ' + _status + '">';
	                if (status != 0) {
	                    _bubble += '<i class="fa fa-check"></i>';
	                }
	                _bubble += '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="mky-message-text">Private Message</span>' + '</div>' + '</div>';
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
	                _bubble += '<div class="mky-message-content-timer">' + '<i class="fa fa-clock-o"></i>' + '<span class="mky-message-timer"> ' + defineTimer(_duration) + '</span>' + '</div>' + '</div>' + '<div class="mky-message-icon-define mky-icon-image"></div>' + '<span class="mky-message-text">Click to view</span>' + '<div class="mky-message-code">' + message.encryptedText + '</div>' + '</div>' + '</div>';
	            }
	        } else if (_isOutgoing == 1) {
	            // outgoing
	            if (message.eph == 0) {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-image-out mky-bubble-out">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status mky-status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<div class="mky-content-image" onclick="monkeyUI.showViewer(\'' + message.id + '\',\'' + _fileName + '\')">' + '<img src="' + _dataSource + '">' + '</div>' + '</div>' + '</div>';
	            } else {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-text-out mky-bubble-out mky-sending">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status mky-status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="mky-message-text">Private Image</span>' + '</div>' + '</div>';
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
	                _bubble += '<span class="mky-message-hour">' + defineTime(message.timestamp * 1000) + '</span>' + '</div>' + '<div class="content-audio">' + '<img id="playAudioBubbleImg' + message.id + '" style="display:block;" onclick="monkeyUI.playAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + ' playBubbleControl" src="../images/PlayBubble.png">' + '<img id="pauseAudioBubbleImg' + message.id + '" onclick="monkeyUI.pauseAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + '" src="../images/PauseBubble.png">' + '<input id="play-player_' + message.id + '" class="knob second" data-width="100" data-displayPrevious=true value="0">' + '<div class="mky-bubble-audio-timer"><span id="mky-minutesBubble' + message.id + '">' + ("0" + parseInt(message.length / 60)).slice(-2) + '</span><span>:</span><span id="mky-secondsBubble' + message.id + '">' + ("0" + message.length % 60).slice(-2) + '</span></div>' + '</div>';
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
	                _bubble += '<div class="mky-message-content-timer">' + '<i class="fa fa-clock-o"></i>' + '<span class="mky-message-timer"> ' + defineTimer(_duration) + '</span>' + '</div>' + '</div>' + '<div class="mky-message-icon-define mky-icon-audio"></div>' + '<span class="mky-message-text">Click to listen</span>' + '<div class="mky-message-code">' + message.encryptedText + '</div>' + '</div>' + '</div>';
	            }
	        } else if (_isOutgoing == 1) {
	            // outgoing
	            if (message.eph == 0) {
	                if (messageOldId == undefined) {
	                    _bubble += '<div class="mky-message-line">';
	                }
	                _bubble += '<div id="' + message.id + '" class="mky-bubble-audio-out mky-bubble-out">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status mky-status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<div class="content-audio">' + '<img id="playAudioBubbleImg' + message.id + '" style="display:block;" onclick="monkeyUI.playAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + ' playBubbleControl" src="../images/PlayBubble.png">' + '<img id="pauseAudioBubbleImg' + message.id + '" onclick="monkeyUI.pauseAudioBubble(' + message.id + ');" class="mky-bubble-audio-button mky-bubble-audio-button' + message.id + '" src="../images/PauseBubble.png">' + '<input id="play-player_' + message.id + '" class="knob second" data-width="100" data-displayPrevious=true value="0">' + '<div class="mky-bubble-audio-timer"><span id="mky-minutesBubble' + message.id + '">00</span><span>:</span><span id="mky-secondsBubble' + message.id + '">00</span></div>' + '</div>' + '<audio id="audio_' + message.id + '" preload="auto" style="display:none;" controls="" src="' + _dataSource + '"></audio>' + '</div>';
	                if (messageOldId == undefined) {
	                    _bubble += '</div>';
	                }
	            } else {
	                _bubble = '<div class="mky-message-line">' + '<div id="' + message.id + '" class="mky-bubble-text-out mky-bubble-out mky-sending">' + '<div class="mky-message-detail">' + '<span class="mky-message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="mky-message-status mky-status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="mky-button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="mky-message-text">Private audio</span>' + '</div>' + '</div>';
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

	        createAudiohandlerBubble(message.id, Math.round(message.length));

	        if (message.eph == 0) {
	            console.log("audio_" + message.id);
	            audiobuble = document.getElementById("audio_" + message.id);
	            audiobuble.oncanplay = function () {
	                createAudiohandlerBubble(message.id, Math.round(audiobuble.duration));
	                setDurationTime(message.id);
	                $('#' + messageId + ' .content-audio').removeClass('mky-disabled');
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
	    function createAudiohandlerBubble(timestamp, duration) {
	        $("#play-player_" + timestamp).knob({
	            'min': 0,
	            'max': duration,
	            'angleOffset': -133,
	            'angleArc': 265,
	            'width': 100,
	            'height': 90,
	            'displayInput': false,
	            'skin': 'tron',
	            change: function change(value) {
	                audiobuble.currentTime = value;
	            }
	        });
	    }

	    this.playAudioBubble = function (timestamp) {
	        pauseAllAudio(timestamp);
	        $bubblePlayer = $("#play-player_" + timestamp); //handles the cricle
	        $('.mky-bubble-audio-button' + timestamp).hide();
	        $('#pauseAudioBubbleImg' + timestamp).css('display', 'block');
	        minutesBubbleLabel = document.getElementById("mky-minutesBubble" + timestamp);
	        secondsBubbleLabel = document.getElementById("mky-secondsBubble" + timestamp);
	        audiobuble = document.getElementById("audio_" + timestamp);
	        audiobuble.play();
	        playIntervalBubble = setInterval("monkeyUI.updateAnimationBuble()", 1000);
	        audiobuble.addEventListener("ended", function () {
	            setDurationTime(timestamp);
	            //this.load();
	            $bubblePlayer.val(0).trigger("change");
	            $('#playAudioBubbleImg' + timestamp).css('display', 'block');
	            $('#pauseAudioBubbleImg' + timestamp).css('display', 'none');
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
	        $('.mky-bubble-audio-button' + timestamp).hide();
	        $('#playAudioBubbleImg' + timestamp).toggle();
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
	                    $('.playBubbleControl').show();
	                    $('#playAudioBubbleImg' + timestamp).hide();
	                    $('#pauseAudioBubbleImg' + timestamp).show();
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

/***/ },
/* 2 */
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
/* 3 */
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
/* 4 */
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! FileAPI 2.0.19 - BSD | git://github.com/mailru/FileAPI.git */
	!function(a){"use strict";var b=a.HTMLCanvasElement&&a.HTMLCanvasElement.prototype,c=a.Blob&&function(){try{return Boolean(new Blob)}catch(a){return!1}}(),d=c&&a.Uint8Array&&function(){try{return 100===new Blob([new Uint8Array(100)]).size}catch(a){return!1}}(),e=a.BlobBuilder||a.WebKitBlobBuilder||a.MozBlobBuilder||a.MSBlobBuilder,f=(c||e)&&a.atob&&a.ArrayBuffer&&a.Uint8Array&&function(a){var b,f,g,h,i,j;for(b=a.split(",")[0].indexOf("base64")>=0?atob(a.split(",")[1]):decodeURIComponent(a.split(",")[1]),f=new ArrayBuffer(b.length),g=new Uint8Array(f),h=0;h<b.length;h+=1)g[h]=b.charCodeAt(h);return i=a.split(",")[0].split(":")[1].split(";")[0],c?new Blob([d?g:f],{type:i}):(j=new e,j.append(f),j.getBlob(i))};a.HTMLCanvasElement&&!b.toBlob&&(b.mozGetAsFile?b.toBlob=function(a,c,d){a(d&&b.toDataURL&&f?f(this.toDataURL(c,d)):this.mozGetAsFile("blob",c))}:b.toDataURL&&f&&(b.toBlob=function(a,b,c){a(f(this.toDataURL(b,c)))})),a.dataURLtoBlob=f}(window),function(a,b){"use strict";function c(a,b,c,d,e){var f={type:c.type||c,target:a,result:d};Y(f,e),b(f)}function d(a){return z&&!!z.prototype["readAs"+a]}function e(a,e,f,g){if(ca.isBlob(a)&&d(f)){var h=new z;Z(h,S,function j(b){var d=b.type;"progress"==d?c(a,e,b,b.target.result,{loaded:b.loaded,total:b.total}):"loadend"==d?($(h,S,j),h=null):c(a,e,b,b.target.result)});try{g?h["readAs"+f](a,g):h["readAs"+f](a)}catch(i){c(a,e,"error",b,{error:i.toString()})}}else c(a,e,"error",b,{error:"filreader_not_support_"+f})}function f(a,b){if(!a.type&&(u||a.size%4096===0&&a.size<=102400))if(z)try{var c=new z;_(c,S,function(a){var d="error"!=a.type;d?((null==c.readyState||c.readyState===c.LOADING)&&c.abort(),b(d)):b(!1,c.error)}),c.readAsDataURL(a)}catch(d){b(!1,d)}else b(null,new Error("FileReader is not supported"));else b(!0)}function g(a){return a&&(a.isFile||a.isDirectory)}function h(a){var b;return a.getAsEntry?b=a.getAsEntry():a.webkitGetAsEntry&&(b=a.webkitGetAsEntry()),b}function i(a,b){if(a)if(a.isFile)a.file(function(c){c.fullPath=a.fullPath,b(!1,[c],[c])},function(c){a.error=c,b("FileError.code: "+c.code,[],[a])});else if(a.isDirectory){var c=a.createReader(),d=!0,e=[],f=[a],g=function(c){a.error=c,b("DirectoryError.code: "+c.code,e,f)},j=function l(h){d&&(d=!1,h.length||(a.error=new Error("directory is empty"))),h.length?ca.afor(h,function(a,b){i(b,function(b,d,h){b||(e=e.concat(d)),f=f.concat(h),a?a():c.readEntries(l,g)})}):b(!1,e,f)};c.readEntries(j,g)}else i(h(a),b);else{var k=new Error("invalid entry");a=new Object(a),a.error=k,b(k.message,[],[a])}}function j(a){var b={};return X(a,function(a,c){a&&"object"==typeof a&&void 0===a.nodeType&&(a=Y({},a)),b[c]=a}),b}function k(a){return L.test(a&&a.tagName)}function l(a){return(a.originalEvent||a||"").dataTransfer||{}}function m(a){var b;for(b in a)if(a.hasOwnProperty(b)&&!(a[b]instanceof Object||"overlay"===b||"filter"===b))return!0;return!1}var n,o,p=1,q=function(){},r=a.document,s=r.doctype||{},t=a.navigator.userAgent,u=/safari\//i.test(t)&&!/chrome\//i.test(t),v=/iemobile\//i.test(t),w=a.createObjectURL&&a||a.URL&&URL.revokeObjectURL&&URL||a.webkitURL&&webkitURL,x=a.Blob,y=a.File,z=a.FileReader,A=a.FormData,B=a.XMLHttpRequest,C=a.jQuery,D=!(!(y&&z&&(a.Uint8Array||A||B.prototype.sendAsBinary))||u&&/windows/i.test(t)&&!v),E=D&&"withCredentials"in new B,F=D&&!!x&&!!(x.prototype.webkitSlice||x.prototype.mozSlice||x.prototype.slice),G=(""+"".normalize).indexOf("[native code]")>0,H=a.dataURLtoBlob,I=/img/i,J=/canvas/i,K=/img|canvas/i,L=/input/i,M=/^data:[^,]+,/,N={}.toString,O=a.Math,P=function(b){return b=new a.Number(O.pow(1024,b)),b.from=function(a){return O.round(a*this)},b},Q={},R=[],S="abort progress error load loadend",T="status statusText readyState response responseXML responseText responseBody".split(" "),U="currentTarget",V="preventDefault",W=function(a){return a&&"length"in a},X=function(a,b,c){if(a)if(W(a))for(var d=0,e=a.length;e>d;d++)d in a&&b.call(c,a[d],d,a);else for(var f in a)a.hasOwnProperty(f)&&b.call(c,a[f],f,a)},Y=function(a){for(var b=arguments,c=1,d=function(b,c){a[c]=b};c<b.length;c++)X(b[c],d);return a},Z=function(a,b,c){if(a){var d=ca.uid(a);Q[d]||(Q[d]={});var e=z&&a&&a instanceof z;X(b.split(/\s+/),function(b){C&&!e?C.event.add(a,b,c):(Q[d][b]||(Q[d][b]=[]),Q[d][b].push(c),a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):a["on"+b]=c)})}},$=function(a,b,c){if(a){var d=ca.uid(a),e=Q[d]||{},f=z&&a&&a instanceof z;X(b.split(/\s+/),function(b){if(C&&!f)C.event.remove(a,b,c);else{for(var d=e[b]||[],g=d.length;g--;)if(d[g]===c){d.splice(g,1);break}a.addEventListener?a.removeEventListener(b,c,!1):a.detachEvent?a.detachEvent("on"+b,c):a["on"+b]=null}})}},_=function(a,b,c){Z(a,b,function d(e){$(a,b,d),c(e)})},aa=function(b){return b.target||(b.target=a.event&&a.event.srcElement||r),3===b.target.nodeType&&(b.target=b.target.parentNode),b},ba=function(a){var b=r.createElement("input");return b.setAttribute("type","file"),a in b},ca={version:"2.0.19",cors:!1,html5:!0,media:!1,formData:!0,multiPassResize:!0,debug:!1,pingUrl:!1,multiFlash:!1,flashAbortTimeout:0,withCredentials:!0,staticPath:"./dist/",flashUrl:0,flashImageUrl:0,postNameConcat:function(a,b){return a+(null!=b?"["+b+"]":"")},ext2mime:{jpg:"image/jpeg",tif:"image/tiff",txt:"text/plain"},accept:{"image/*":"art bm bmp dwg dxf cbr cbz fif fpx gif ico iefs jfif jpe jpeg jpg jps jut mcf nap nif pbm pcx pgm pict pm png pnm qif qtif ras rast rf rp svf tga tif tiff xbm xbm xpm xwd","audio/*":"m4a flac aac rm mpa wav wma ogg mp3 mp2 m3u mod amf dmf dsm far gdm imf it m15 med okt s3m stm sfx ult uni xm sid ac3 dts cue aif aiff wpl ape mac mpc mpp shn wv nsf spc gym adplug adx dsp adp ymf ast afc hps xs","video/*":"m4v 3gp nsv ts ty strm rm rmvb m3u ifo mov qt divx xvid bivx vob nrg img iso pva wmv asf asx ogm m2v avi bin dat dvr-ms mpg mpeg mp4 mkv avc vp3 svq3 nuv viv dv fli flv wpl"},uploadRetry:0,networkDownRetryTimeout:5e3,chunkSize:0,chunkUploadRetry:0,chunkNetworkDownRetryTimeout:2e3,KB:P(1),MB:P(2),GB:P(3),TB:P(4),EMPTY_PNG:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=",expando:"fileapi"+(new Date).getTime(),uid:function(a){return a?a[ca.expando]=a[ca.expando]||ca.uid():(++p,ca.expando+p)},log:function(){ca.debug&&n&&(o?console.log.apply(console,arguments):console.log([].join.call(arguments," ")))},newImage:function(a,b){var c=r.createElement("img");return b&&ca.event.one(c,"error load",function(a){b("error"==a.type,c),c=null}),c.src=a,c},getXHR:function(){var b;if(B)b=new B;else if(a.ActiveXObject)try{b=new ActiveXObject("MSXML2.XMLHttp.3.0")}catch(c){b=new ActiveXObject("Microsoft.XMLHTTP")}return b},isArray:W,support:{dnd:E&&"ondrop"in r.createElement("div"),cors:E,html5:D,chunked:F,dataURI:!0,accept:ba("accept"),multiple:ba("multiple")},event:{on:Z,off:$,one:_,fix:aa},throttle:function(b,c){var d,e;return function(){e=arguments,d||(b.apply(a,e),d=setTimeout(function(){d=0,b.apply(a,e)},c))}},F:function(){},parseJSON:function(b){var c;return c=a.JSON&&JSON.parse?JSON.parse(b):new Function("return ("+b.replace(/([\r\n])/g,"\\$1")+");")()},trim:function(a){return a=String(a),a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")},defer:function(){var a,c,d=[],e={resolve:function(b,f){for(e.resolve=q,c=b||!1,a=f;f=d.shift();)f(c,a)},then:function(e){c!==b?e(c,a):d.push(e)}};return e},queue:function(a){var b=0,c=0,d=!1,e=!1,f={inc:function(){c++},next:function(){b++,setTimeout(f.check,0)},check:function(){b>=c&&!d&&f.end()},isFail:function(){return d},fail:function(){!d&&a(d=!0)},end:function(){e||(e=!0,a())}};return f},each:X,afor:function(a,b){var c=0,d=a.length;W(a)&&d--?!function e(){b(d!=c&&e,a[c],c++)}():b(!1)},extend:Y,isFile:function(a){return"[object File]"===N.call(a)},isBlob:function(a){return this.isFile(a)||"[object Blob]"===N.call(a)},isCanvas:function(a){return a&&J.test(a.nodeName)},getFilesFilter:function(a){return a="string"==typeof a?a:a.getAttribute&&a.getAttribute("accept")||"",a?new RegExp("("+a.replace(/\./g,"\\.").replace(/,/g,"|")+")$","i"):/./},readAsDataURL:function(a,b){ca.isCanvas(a)?c(a,b,"load",ca.toDataURL(a)):e(a,b,"DataURL")},readAsBinaryString:function(a,b){d("BinaryString")?e(a,b,"BinaryString"):e(a,function(a){if("load"==a.type)try{a.result=ca.toBinaryString(a.result)}catch(c){a.type="error",a.message=c.toString()}b(a)},"DataURL")},readAsArrayBuffer:function(a,b){e(a,b,"ArrayBuffer")},readAsText:function(a,b,c){c||(c=b,b="utf-8"),e(a,c,"Text",b)},toDataURL:function(a,b){return"string"==typeof a?a:a.toDataURL?a.toDataURL(b||"image/png"):void 0},toBinaryString:function(b){return a.atob(ca.toDataURL(b).replace(M,""))},readAsImage:function(a,d,e){if(ca.isBlob(a))if(w){var f=w.createObjectURL(a);f===b?c(a,d,"error"):ca.readAsImage(f,d,e)}else ca.readAsDataURL(a,function(b){"load"==b.type?ca.readAsImage(b.result,d,e):(e||"error"==b.type)&&c(a,d,b,null,{loaded:b.loaded,total:b.total})});else if(ca.isCanvas(a))c(a,d,"load",a);else if(I.test(a.nodeName))if(a.complete)c(a,d,"load",a);else{var g="error abort load";_(a,g,function i(b){"load"==b.type&&w&&w.revokeObjectURL(a.src),$(a,g,i),c(a,d,b,a)})}else if(a.iframe)c(a,d,{type:"error"});else{var h=ca.newImage(a.dataURL||a);ca.readAsImage(h,d,e)}},checkFileObj:function(a){var b={},c=ca.accept;return"object"==typeof a?b=a:b.name=(a+"").split(/\\|\//g).pop(),null==b.type&&(b.type=b.name.split(".").pop()),X(c,function(a,c){a=new RegExp(a.replace(/\s/g,"|"),"i"),(a.test(b.type)||ca.ext2mime[b.type])&&(b.type=ca.ext2mime[b.type]||c.split("/")[0]+"/"+b.type)}),b},getDropFiles:function(a,b){var c,d=[],e=[],j=l(a),k=j.files,m=j.items,n=W(m)&&m[0]&&h(m[0]),o=ca.queue(function(){b(d,e)});if(n)if(G&&k){var p,q,r=k.length;for(c=new Array(r);r--;){p=k[r];try{q=h(m[r])}catch(s){ca.log("[err] getDropFiles: ",s),q=null}g(q)&&(q.isDirectory||q.isFile&&p.name==p.name.normalize("NFC"))?c[r]=q:c[r]=p}}else c=m;else c=k;X(c||[],function(a){o.inc();try{n&&g(a)?i(a,function(a,b,c){a?ca.log("[err] getDropFiles:",a):d.push.apply(d,b),e.push.apply(e,c),o.next()}):f(a,function(b,c){b?d.push(a):a.error=c,e.push(a),o.next()})}catch(b){o.next(),ca.log("[err] getDropFiles: ",b)}}),o.check()},getFiles:function(a,b,c){var d=[];return c?(ca.filterFiles(ca.getFiles(a),b,c),null):(a.jquery&&(a.each(function(){d=d.concat(ca.getFiles(this))}),a=d,d=[]),"string"==typeof b&&(b=ca.getFilesFilter(b)),a.originalEvent?a=aa(a.originalEvent):a.srcElement&&(a=aa(a)),a.dataTransfer?a=a.dataTransfer:a.target&&(a=a.target),a.files?(d=a.files,D||(d[0].blob=a,d[0].iframe=!0)):!D&&k(a)?ca.trim(a.value)&&(d=[ca.checkFileObj(a.value)],d[0].blob=a,d[0].iframe=!0):W(a)&&(d=a),ca.filter(d,function(a){return!b||b.test(a.name)}))},getTotalSize:function(a){for(var b=0,c=a&&a.length;c--;)b+=a[c].size;return b},getInfo:function(a,b){var c={},d=R.concat();ca.isBlob(a)?!function e(){var f=d.shift();f?f.test(a.type)?f(a,function(a,d){a?b(a):(Y(c,d),e())}):e():b(!1,c)}():b("not_support_info",c)},addInfoReader:function(a,b){b.test=function(b){return a.test(b)},R.push(b)},filter:function(a,b){for(var c,d=[],e=0,f=a.length;f>e;e++)e in a&&(c=a[e],b.call(c,c,e,a)&&d.push(c));return d},filterFiles:function(a,b,c){if(a.length){var d,e=a.concat(),f=[],g=[];!function h(){e.length?(d=e.shift(),ca.getInfo(d,function(a,c){(b(d,a?!1:c)?f:g).push(d),h()})):c(f,g)}()}else c([],a)},upload:function(a){a=Y({jsonp:"callback",prepare:ca.F,beforeupload:ca.F,upload:ca.F,fileupload:ca.F,fileprogress:ca.F,filecomplete:ca.F,progress:ca.F,complete:ca.F,pause:ca.F,imageOriginal:!0,chunkSize:ca.chunkSize,chunkUploadRetry:ca.chunkUploadRetry,uploadRetry:ca.uploadRetry},a),a.imageAutoOrientation&&!a.imageTransform&&(a.imageTransform={rotate:"auto"});var b,c=new ca.XHR(a),d=this._getFilesDataArray(a.files),e=this,f=0,g=0,h=!1;return X(d,function(a){f+=a.size}),c.files=[],X(d,function(a){c.files.push(a.file)}),c.total=f,c.loaded=0,c.filesLeft=d.length,a.beforeupload(c,a),b=function(){var i=d.shift(),k=i&&i.file,l=!1,m=j(a);if(c.filesLeft=d.length,k&&k.name===ca.expando&&(k=null,ca.log("[warn] FileAPI.upload() — called without files")),("abort"!=c.statusText||c.current)&&i){if(h=!1,c.currentFile=k,k&&a.prepare(k,m)===!1)return void b.call(e);m.file=k,e._getFormData(m,i,function(h){g||a.upload(c,a);var j=new ca.XHR(Y({},m,{upload:k?function(){a.fileupload(k,j,m)}:q,progress:k?function(b){l||(l=b.loaded===b.total,a.fileprogress({type:"progress",total:i.total=b.total,loaded:i.loaded=b.loaded},k,j,m),a.progress({type:"progress",total:f,loaded:c.loaded=g+i.size*(b.loaded/b.total)||0},k,j,m))}:q,complete:function(d){X(T,function(a){c[a]=j[a]}),k&&(i.total=i.total||i.size,i.loaded=i.total,d||(this.progress(i),l=!0,g+=i.size,c.loaded=g),a.filecomplete(d,j,k,m)),setTimeout(function(){b.call(e)},0)}}));c.abort=function(a){a||(d.length=0),this.current=a,j.abort()},j.send(h)})}else{var n=200==c.status||201==c.status||204==c.status;a.complete(n?!1:c.statusText||"error",c,a),h=!0}},setTimeout(b,0),c.append=function(a,g){a=ca._getFilesDataArray([].concat(a)),X(a,function(a){f+=a.size,c.files.push(a.file),g?d.unshift(a):d.push(a)}),c.statusText="",h&&b.call(e)},c.remove=function(a){for(var b,c=d.length;c--;)d[c].file==a&&(b=d.splice(c,1),f-=b.size);return b},c},_getFilesDataArray:function(a){var b=[],c={};if(k(a)){var d=ca.getFiles(a);c[a.name||"file"]=null!==a.getAttribute("multiple")?d:d[0]}else W(a)&&k(a[0])?X(a,function(a){c[a.name||"file"]=ca.getFiles(a)}):c=a;return X(c,function e(a,c){W(a)?X(a,function(a){e(a,c)}):a&&(a.name||a.image)&&b.push({name:c,file:a,size:a.size,total:a.size,loaded:0})}),b.length||b.push({file:{name:ca.expando}}),b},_getFormData:function(a,b,c){var d=b.file,e=b.name,f=d.name,g=d.type,h=ca.support.transform&&a.imageTransform,i=new ca.Form,j=ca.queue(function(){c(i)}),k=h&&m(h),l=ca.postNameConcat;X(a.data,function n(a,b){"object"==typeof a?X(a,function(a,c){n(a,l(b,c))}):i.append(b,a)}),function o(b){b.image?(j.inc(),b.toData(function(a,c){b.file&&(c.type=b.file.type,c.quality=b.matrix.quality,f=b.file&&b.file.name),f=f||(new Date).getTime()+".png",o(c),j.next()})):ca.Image&&h&&(/^image/.test(b.type)||K.test(b.nodeName))?(j.inc(),k&&(h=[h]),ca.Image.transform(b,h,a.imageAutoOrientation,function(c,d){if(k&&!c)H||ca.flashEngine||(i.multipart=!0),i.append(e,d[0],f,h[0].type||g);else{var m=0;c||X(d,function(a,b){H||ca.flashEngine||(i.multipart=!0),h[b].postName||(m=1),i.append(h[b].postName||l(e,b),a,f,h[b].type||g)}),(c||a.imageOriginal)&&i.append(l(e,m?"original":null),b,f,g)}j.next()})):f!==ca.expando&&i.append(e,b,f)}(d),j.check()},reset:function(a,b){var c,d;return C?(d=C(a).clone(!0).insertBefore(a).val("")[0],b||C(a).remove()):(c=a.parentNode,d=c.insertBefore(a.cloneNode(!0),a),d.value="",b||c.removeChild(a),X(Q[ca.uid(a)],function(b,c){X(b,function(b){$(a,c,b),Z(d,c,b)})})),d},load:function(a,b){var c=ca.getXHR();return c?(c.open("GET",a,!0),c.overrideMimeType&&c.overrideMimeType("text/plain; charset=x-user-defined"),Z(c,"progress",function(a){a.lengthComputable&&b({type:a.type,loaded:a.loaded,total:a.total},c)}),c.onreadystatechange=function(){if(4==c.readyState)if(c.onreadystatechange=null,200==c.status){a=a.split("/");var d={name:a[a.length-1],size:c.getResponseHeader("Content-Length"),type:c.getResponseHeader("Content-Type")};d.dataURL="data:"+d.type+";base64,"+ca.encode64(c.responseBody||c.responseText),b({type:"load",result:d},c)}else b({type:"error"},c)},c.send(null)):b({type:"error"}),c},encode64:function(a){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c="",d=0;for("string"!=typeof a&&(a=String(a));d<a.length;){var e,f,g=255&a.charCodeAt(d++),h=255&a.charCodeAt(d++),i=255&a.charCodeAt(d++),j=g>>2,k=(3&g)<<4|h>>4;isNaN(h)?e=f=64:(e=(15&h)<<2|i>>6,f=isNaN(i)?64:63&i),c+=b.charAt(j)+b.charAt(k)+b.charAt(e)+b.charAt(f)}return c}};ca.addInfoReader(/^image/,function(a,b){if(!a.__dimensions){var c=a.__dimensions=ca.defer();ca.readAsImage(a,function(a){var b=a.target;c.resolve("load"==a.type?!1:"error",{width:b.width,height:b.height}),b.src=ca.EMPTY_PNG,b=null})}a.__dimensions.then(b)}),ca.event.dnd=function(a,b,c){var d,e;c||(c=b,b=ca.F),z?(Z(a,"dragenter dragleave dragover",b.ff=b.ff||function(a){for(var c=l(a).types,f=c&&c.length,g=!1;f--;)if(~c[f].indexOf("File")){a[V](),e!==a.type&&(e=a.type,"dragleave"!=e&&b.call(a[U],!0,a),g=!0);break}g&&(clearTimeout(d),d=setTimeout(function(){b.call(a[U],"dragleave"!=e,a)},50))}),Z(a,"drop",c.ff=c.ff||function(a){a[V](),e=0,b.call(a[U],!1,a),ca.getDropFiles(a,function(b,d){c.call(a[U],b,d,a)})})):ca.log("Drag'n'Drop -- not supported")},ca.event.dnd.off=function(a,b,c){$(a,"dragenter dragleave dragover",b.ff),$(a,"drop",c.ff)},C&&!C.fn.dnd&&(C.fn.dnd=function(a,b){return this.each(function(){ca.event.dnd(this,a,b)})},C.fn.offdnd=function(a,b){return this.each(function(){ca.event.dnd.off(this,a,b)})}),a.FileAPI=Y(ca,a.FileAPI),ca.log("FileAPI: "+ca.version),ca.log("protocol: "+a.location.protocol),ca.log("doctype: ["+s.name+"] "+s.publicId+" "+s.systemId),X(r.getElementsByTagName("meta"),function(a){/x-ua-compatible/i.test(a.getAttribute("http-equiv"))&&ca.log("meta.http-equiv: "+a.getAttribute("content"))});try{n=!!console.log,o=!!console.log.apply}catch(da){}ca.flashUrl||(ca.flashUrl=ca.staticPath+"FileAPI.flash.swf"),ca.flashImageUrl||(ca.flashImageUrl=ca.staticPath+"FileAPI.flash.image.swf"),ca.flashWebcamUrl||(ca.flashWebcamUrl=ca.staticPath+"FileAPI.flash.camera.swf")}(window,void 0),function(a,b,c){"use strict";function d(b){if(b instanceof d){var c=new d(b.file);return a.extend(c.matrix,b.matrix),c}return this instanceof d?(this.file=b,this.size=b.size||100,void(this.matrix={sx:0,sy:0,sw:0,sh:0,dx:0,dy:0,dw:0,dh:0,resize:0,deg:0,quality:1,filter:0})):new d(b)}var e=Math.min,f=Math.round,g=function(){return b.createElement("canvas")},h=!1,i={8:270,3:180,6:90,7:270,4:180,5:90};try{h=g().toDataURL("image/png").indexOf("data:image/png")>-1}catch(j){}d.prototype={image:!0,constructor:d,set:function(b){return a.extend(this.matrix,b),this},crop:function(a,b,d,e){return d===c&&(d=a,e=b,a=b=0),this.set({sx:a,sy:b,sw:d,sh:e||d})},resize:function(a,b,c){return/min|max|height|width/.test(b)&&(c=b,b=a),this.set({dw:a,dh:b||a,resize:c})},preview:function(a,b){return this.resize(a,b||a,"preview")},rotate:function(a){return this.set({deg:a})},filter:function(a){return this.set({filter:a})},overlay:function(a){return this.set({overlay:a})},clone:function(){return new d(this)},_load:function(b,c){var d=this;/img|video/i.test(b.nodeName)?c.call(d,null,b):a.readAsImage(b,function(a){c.call(d,"load"!=a.type,a.result)})},_apply:function(b,c){var f,h=g(),i=this.getMatrix(b),j=h.getContext("2d"),k=b.videoWidth||b.width,l=b.videoHeight||b.height,m=i.deg,n=i.dw,o=i.dh,p=k,q=l,r=i.filter,s=b,t=i.overlay,u=a.queue(function(){b.src=a.EMPTY_PNG,c(!1,h)}),v=a.renderImageToCanvas;for(m-=360*Math.floor(m/360),b._type=this.file.type;i.multipass&&e(p/n,q/o)>2;)p=p/2+.5|0,q=q/2+.5|0,f=g(),f.width=p,f.height=q,s!==b?(v(f,s,0,0,s.width,s.height,0,0,p,q),s=f):(s=f,v(s,b,i.sx,i.sy,i.sw,i.sh,0,0,p,q),i.sx=i.sy=i.sw=i.sh=0);h.width=m%180?o:n,h.height=m%180?n:o,h.type=i.type,h.quality=i.quality,j.rotate(m*Math.PI/180),v(j.canvas,s,i.sx,i.sy,i.sw||s.width,i.sh||s.height,180==m||270==m?-n:0,90==m||180==m?-o:0,n,o),n=h.width,o=h.height,t&&a.each([].concat(t),function(b){u.inc();var c=new window.Image,d=function(){var e=0|b.x,f=0|b.y,g=b.w||c.width,h=b.h||c.height,i=b.rel;e=1==i||4==i||7==i?(n-g+e)/2:2==i||5==i||8==i?n-(g+e):e,f=3==i||4==i||5==i?(o-h+f)/2:i>=6?o-(h+f):f,a.event.off(c,"error load abort",d);try{j.globalAlpha=b.opacity||1,j.drawImage(c,e,f,g,h)}catch(k){}u.next()};a.event.on(c,"error load abort",d),c.src=b.src,c.complete&&d()}),r&&(u.inc(),d.applyFilter(h,r,u.next)),u.check()},getMatrix:function(b){var c=a.extend({},this.matrix),d=c.sw=c.sw||b.videoWidth||b.naturalWidth||b.width,g=c.sh=c.sh||b.videoHeight||b.naturalHeight||b.height,h=c.dw=c.dw||d,i=c.dh=c.dh||g,j=d/g,k=h/i,l=c.resize;if("preview"==l){if(h!=d||i!=g){var m,n;k>=j?(m=d,n=m/k):(n=g,m=n*k),(m!=d||n!=g)&&(c.sx=~~((d-m)/2),c.sy=~~((g-n)/2),d=m,g=n)}}else"height"==l?h=i*j:"width"==l?i=h/j:l&&(d>h||g>i?"min"==l?(h=f(k>j?e(d,h):i*j),i=f(k>j?h/j:e(g,i))):(h=f(j>=k?e(d,h):i*j),i=f(j>=k?h/j:e(g,i))):(h=d,i=g));return c.sw=d,c.sh=g,c.dw=h,c.dh=i,c.multipass=a.multiPassResize,c},_trans:function(b){this._load(this.file,function(c,d){if(c)b(c);else try{this._apply(d,b)}catch(c){a.log("[err] FileAPI.Image.fn._apply:",c),b(c)}})},get:function(b){if(a.support.transform){var c=this,d=c.matrix;"auto"==d.deg?a.getInfo(c.file,function(a,e){d.deg=i[e&&e.exif&&e.exif.Orientation]||0,c._trans(b)}):c._trans(b)}else b("not_support_transform");return this},toData:function(a){return this.get(a)}},d.exifOrientation=i,d.transform=function(b,e,f,g){function h(h,i){var j={},k=a.queue(function(a){g(a,j)});h?k.fail():a.each(e,function(a,e){if(!k.isFail()){var g=new d(i.nodeType?i:b),h="function"==typeof a;if(h?a(i,g):a.width?g[a.preview?"preview":"resize"](a.width,a.height,a.strategy):a.maxWidth&&(i.width>a.maxWidth||i.height>a.maxHeight)&&g.resize(a.maxWidth,a.maxHeight,"max"),a.crop){var l=a.crop;g.crop(0|l.x,0|l.y,l.w||l.width,l.h||l.height)}a.rotate===c&&f&&(a.rotate="auto"),g.set({type:g.matrix.type||a.type||b.type||"image/png"}),h||g.set({deg:a.rotate,overlay:a.overlay,filter:a.filter,quality:a.quality||1}),k.inc(),g.toData(function(a,b){a?k.fail():(j[e]=b,k.next())})}})}b.width?h(!1,b):a.getInfo(b,h)},a.each(["TOP","CENTER","BOTTOM"],function(b,c){a.each(["LEFT","CENTER","RIGHT"],function(a,e){d[b+"_"+a]=3*c+e,d[a+"_"+b]=3*c+e})}),d.toCanvas=function(a){var c=b.createElement("canvas");return c.width=a.videoWidth||a.width,c.height=a.videoHeight||a.height,c.getContext("2d").drawImage(a,0,0),c},d.fromDataURL=function(b,c,d){var e=a.newImage(b);a.extend(e,c),d(e)},d.applyFilter=function(b,c,e){"function"==typeof c?c(b,e):window.Caman&&window.Caman("IMG"==b.tagName?d.toCanvas(b):b,function(){"string"==typeof c?this[c]():a.each(c,function(a,b){this[b](a)},this),this.render(e)})},a.renderImageToCanvas=function(b,c,d,e,f,g,h,i,j,k){try{return b.getContext("2d").drawImage(c,d,e,f,g,h,i,j,k)}catch(l){throw a.log("renderImageToCanvas failed"),l}},a.support.canvas=a.support.transform=h,a.Image=d}(FileAPI,document),function(a){"use strict";a(FileAPI)}(function(a){"use strict";if(window.navigator&&window.navigator.platform&&/iP(hone|od|ad)/.test(window.navigator.platform)){var b=a.renderImageToCanvas;a.detectSubsampling=function(a){var b,c;return a.width*a.height>1048576?(b=document.createElement("canvas"),b.width=b.height=1,c=b.getContext("2d"),c.drawImage(a,-a.width+1,0),0===c.getImageData(0,0,1,1).data[3]):!1},a.detectVerticalSquash=function(a,b){var c,d,e,f,g,h=a.naturalHeight||a.height,i=document.createElement("canvas"),j=i.getContext("2d");for(b&&(h/=2),i.width=1,i.height=h,j.drawImage(a,0,0),c=j.getImageData(0,0,1,h).data,d=0,e=h,f=h;f>d;)g=c[4*(f-1)+3],0===g?e=f:d=f,f=e+d>>1;return f/h||1},a.renderImageToCanvas=function(c,d,e,f,g,h,i,j,k,l){if("image/jpeg"===d._type){var m,n,o,p,q=c.getContext("2d"),r=document.createElement("canvas"),s=1024,t=r.getContext("2d");if(r.width=s,r.height=s,q.save(),m=a.detectSubsampling(d),m&&(e/=2,f/=2,g/=2,h/=2),n=a.detectVerticalSquash(d,m),m||1!==n){for(f*=n,k=Math.ceil(s*k/g),l=Math.ceil(s*l/h/n),j=0,p=0;h>p;){for(i=0,o=0;g>o;)t.clearRect(0,0,s,s),t.drawImage(d,e,f,g,h,-o,-p,g,h),q.drawImage(r,0,0,s,s,i,j,k,l),o+=s,i+=k;p+=s,j+=l}return q.restore(),c}}return b(c,d,e,f,g,h,i,j,k,l)}}}),function(a,b){"use strict";function c(b,c,d){var e=b.blob,f=b.file;if(f){if(!e.toDataURL)return void a.readAsBinaryString(e,function(a){"load"==a.type&&c(b,a.result)});var g={"image/jpeg":".jpe?g","image/png":".png"},h=g[b.type]?b.type:"image/png",i=g[h]||".png",j=e.quality||1;f.match(new RegExp(i+"$","i"))||(f+=i.replace("?","")),b.file=f,b.type=h,!d&&e.toBlob?e.toBlob(function(a){c(b,a)},h,j):c(b,a.toBinaryString(e.toDataURL(h,j)))}else c(b,e)}var d=b.document,e=b.FormData,f=function(){this.items=[]},g=b.encodeURIComponent;f.prototype={append:function(a,b,c,d){this.items.push({name:a,blob:b&&b.blob||(void 0==b?"":b),file:b&&(c||b.name),type:b&&(d||b.type)})},each:function(a){for(var b=0,c=this.items.length;c>b;b++)a.call(this,this.items[b])},toData:function(b,c){c._chunked=a.support.chunked&&c.chunkSize>0&&1==a.filter(this.items,function(a){return a.file}).length,a.support.html5?a.formData&&!this.multipart&&e?c._chunked?(a.log("FileAPI.Form.toPlainData"),this.toPlainData(b)):(a.log("FileAPI.Form.toFormData"),this.toFormData(b)):(a.log("FileAPI.Form.toMultipartData"),this.toMultipartData(b)):(a.log("FileAPI.Form.toHtmlData"),this.toHtmlData(b))},_to:function(b,c,d,e){var f=a.queue(function(){c(b)});this.each(function(g){try{d(g,b,f,e)}catch(h){a.log("FileAPI.Form._to: "+h.message),c(h)}}),f.check()},toHtmlData:function(b){this._to(d.createDocumentFragment(),b,function(b,c){var e,f=b.blob;b.file?(a.reset(f,!0),f.name=b.name,f.disabled=!1,c.appendChild(f)):(e=d.createElement("input"),e.name=b.name,e.type="hidden",e.value=f,c.appendChild(e))})},toPlainData:function(a){this._to({},a,function(a,b,d){a.file&&(b.type=a.file),a.blob.toBlob?(d.inc(),c(a,function(a,c){b.name=a.name,b.file=c,b.size=c.length,b.type=a.type,d.next()})):a.file?(b.name=a.blob.name,b.file=a.blob,b.size=a.blob.size,b.type=a.type):(b.params||(b.params=[]),b.params.push(g(a.name)+"="+g(a.blob))),b.start=-1,b.end=b.file&&b.file.FileAPIReadPosition||-1,b.retry=0})},toFormData:function(a){this._to(new e,a,function(a,b,d){a.blob&&a.blob.toBlob?(d.inc(),c(a,function(a,c){b.append(a.name,c,a.file),d.next()})):a.file?b.append(a.name,a.blob,a.file):b.append(a.name,a.blob),a.file&&b.append("_"+a.name,a.file)})},toMultipartData:function(b){this._to([],b,function(a,b,d,e){d.inc(),c(a,function(a,c){b.push("--_"+e+('\r\nContent-Disposition: form-data; name="'+a.name+'"'+(a.file?'; filename="'+g(a.file)+'"':"")+(a.file?"\r\nContent-Type: "+(a.type||"application/octet-stream"):"")+"\r\n\r\n"+(a.file?c:g(c))+"\r\n")),d.next()},!0)},a.expando)}},a.Form=f}(FileAPI,window),function(a,b){"use strict";var c=function(){},d=a.document,e=function(a){this.uid=b.uid(),this.xhr={abort:c,getResponseHeader:c,getAllResponseHeaders:c},this.options=a},f={"":1,XML:1,Text:1,Body:1};e.prototype={status:0,statusText:"",constructor:e,getResponseHeader:function(a){return this.xhr.getResponseHeader(a)},getAllResponseHeaders:function(){return this.xhr.getAllResponseHeaders()||{}},end:function(d,e){var f=this,g=f.options;f.end=f.abort=c,f.status=d,e&&(f.statusText=e),b.log("xhr.end:",d,e),g.complete(200==d||201==d?!1:f.statusText||"unknown",f),f.xhr&&f.xhr.node&&setTimeout(function(){var b=f.xhr.node;try{b.parentNode.removeChild(b)}catch(c){}try{delete a[f.uid]}catch(c){}a[f.uid]=f.xhr.node=null},9)},abort:function(){this.end(0,"abort"),this.xhr&&(this.xhr.aborted=!0,this.xhr.abort())},send:function(a){var b=this,c=this.options;a.toData(function(a){a instanceof Error?b.end(0,a.message):(c.upload(c,b),b._send.call(b,c,a))},c)},_send:function(c,e){var g,h=this,i=h.uid,j=h.uid+"Load",k=c.url;if(b.log("XHR._send:",e),c.cache||(k+=(~k.indexOf("?")?"&":"?")+b.uid()),e.nodeName){var l=c.jsonp;k=k.replace(/([a-z]+)=(\?)/i,"$1="+i),c.upload(c,h);var m=function(a){if(~k.indexOf(a.origin))try{var c=b.parseJSON(a.data);c.id==i&&n(c.status,c.statusText,c.response)}catch(d){n(0,d.message)}},n=a[i]=function(c,d,e){h.readyState=4,h.responseText=e,h.end(c,d),b.event.off(a,"message",m),a[i]=g=p=a[j]=null};h.xhr.abort=function(){try{p.stop?p.stop():p.contentWindow.stop?p.contentWindow.stop():p.contentWindow.document.execCommand("Stop")}catch(a){}n(0,"abort")},b.event.on(a,"message",m),a[j]=function(){try{var a=p.contentWindow,c=a.document,d=a.result||b.parseJSON(c.body.innerHTML);n(d.status,d.statusText,d.response)}catch(e){b.log("[transport.onload]",e)}},g=d.createElement("div"),g.innerHTML='<form target="'+i+'" action="'+k+'" method="POST" enctype="multipart/form-data" style="position: absolute; top: -1000px; overflow: hidden; width: 1px; height: 1px;"><iframe name="'+i+'" src="javascript:false;" onload="window.'+j+" && "+j+'();"></iframe>'+(l&&c.url.indexOf("=?")<0?'<input value="'+i+'" name="'+l+'" type="hidden"/>':"")+"</form>";var o=g.getElementsByTagName("form")[0],p=g.getElementsByTagName("iframe")[0];o.appendChild(e),b.log(o.parentNode.innerHTML),d.body.appendChild(g),h.xhr.node=g,h.readyState=2;try{o.submit()}catch(q){b.log("iframe.error: "+q)}o=null}else{if(k=k.replace(/([a-z]+)=(\?)&?/i,""),this.xhr&&this.xhr.aborted)return void b.log("Error: already aborted");if(g=h.xhr=b.getXHR(),e.params&&(k+=(k.indexOf("?")<0?"?":"&")+e.params.join("&")),g.open("POST",k,!0),b.withCredentials&&(g.withCredentials="true"),c.headers&&c.headers["X-Requested-With"]||g.setRequestHeader("X-Requested-With","XMLHttpRequest"),b.each(c.headers,function(a,b){g.setRequestHeader(b,a)}),c._chunked){g.upload&&g.upload.addEventListener("progress",b.throttle(function(a){e.retry||c.progress({type:a.type,total:e.size,loaded:e.start+a.loaded,totalSize:e.size},h,c)},100),!1),g.onreadystatechange=function(){var a=parseInt(g.getResponseHeader("X-Last-Known-Byte"),10);if(h.status=g.status,h.statusText=g.statusText,h.readyState=g.readyState,4==g.readyState){for(var d in f)h["response"+d]=g["response"+d];if(g.onreadystatechange=null,!g.status||g.status-201>0)if(b.log("Error: "+g.status),(!g.status&&!g.aborted||500==g.status||416==g.status)&&++e.retry<=c.chunkUploadRetry){var i=g.status?0:b.chunkNetworkDownRetryTimeout;c.pause(e.file,c),b.log("X-Last-Known-Byte: "+a),a?e.end=a:(e.end=e.start-1,416==g.status&&(e.end=e.end-c.chunkSize)),setTimeout(function(){h._send(c,e)},i)}else h.end(g.status);else e.retry=0,e.end==e.size-1?h.end(g.status):(b.log("X-Last-Known-Byte: "+a),a&&(e.end=a),e.file.FileAPIReadPosition=e.end,setTimeout(function(){h._send(c,e)},0));g=null}},e.start=e.end+1,e.end=Math.max(Math.min(e.start+c.chunkSize,e.size)-1,e.start);var r=e.file,s=(r.slice||r.mozSlice||r.webkitSlice).call(r,e.start,e.end+1);e.size&&!s.size?setTimeout(function(){h.end(-1)}):(g.setRequestHeader("Content-Range","bytes "+e.start+"-"+e.end+"/"+e.size),g.setRequestHeader("Content-Disposition","attachment; filename="+encodeURIComponent(e.name)),g.setRequestHeader("Content-Type",e.type||"application/octet-stream"),g.send(s)),r=s=null}else if(g.upload&&g.upload.addEventListener("progress",b.throttle(function(a){c.progress(a,h,c)},100),!1),g.onreadystatechange=function(){if(h.status=g.status,h.statusText=g.statusText,h.readyState=g.readyState,4==g.readyState){for(var a in f)h["response"+a]=g["response"+a];if(g.onreadystatechange=null,!g.status||g.status>201)if(b.log("Error: "+g.status),(!g.status&&!g.aborted||500==g.status)&&(c.retry||0)<c.uploadRetry){c.retry=(c.retry||0)+1;var d=b.networkDownRetryTimeout;c.pause(c.file,c),setTimeout(function(){h._send(c,e)},d)}else h.end(g.status);else h.end(g.status);g=null}},b.isArray(e)){g.setRequestHeader("Content-Type","multipart/form-data; boundary=_"+b.expando);var t=e.join("")+"--_"+b.expando+"--";if(g.sendAsBinary)g.sendAsBinary(t);else{var u=Array.prototype.map.call(t,function(a){return 255&a.charCodeAt(0)});g.send(new Uint8Array(u).buffer)}}else g.send(e)}}},b.XHR=e}(window,FileAPI),function(a,b){"use strict";function c(a){return a>=0?a+"px":a}function d(a){var c,d=f.createElement("canvas"),e=!1;try{c=d.getContext("2d"),c.drawImage(a,0,0,1,1),e=255!=c.getImageData(0,0,1,1).data[4]}catch(g){b.log("[FileAPI.Camera] detectVideoSignal:",g)}return e}var e=a.URL||a.webkitURL,f=a.document,g=a.navigator,h=g.getUserMedia||g.webkitGetUserMedia||g.mozGetUserMedia||g.msGetUserMedia,i=!!h;b.support.media=i;var j=function(a){this.video=a};j.prototype={isActive:function(){return!!this._active},start:function(a){var b,c,f=this,i=f.video,j=function(d){f._active=!d,clearTimeout(c),clearTimeout(b),a&&a(d,f)};h.call(g,{video:!0},function(a){f.stream=a,i.src=e.createObjectURL(a),b=setInterval(function(){d(i)&&j(null)},1e3),c=setTimeout(function(){j("timeout");
	},5e3),i.play()},j)},stop:function(){try{this._active=!1,this.video.pause();try{this.stream.stop()}catch(a){b.each(this.stream.getTracks(),function(a){a.stop()})}this.stream=null}catch(a){b.log("[FileAPI.Camera] stop:",a)}},shot:function(){return new k(this.video)}},j.get=function(a){return new j(a.firstChild)},j.publish=function(d,e,g){"function"==typeof e&&(g=e,e={}),e=b.extend({},{width:"100%",height:"100%",start:!0},e),d.jquery&&(d=d[0]);var h=function(a){if(a)g(a);else{var b=j.get(d);e.start?b.start(g):g(null,b)}};if(d.style.width=c(e.width),d.style.height=c(e.height),b.html5&&i){var k=f.createElement("video");k.style.width=c(e.width),k.style.height=c(e.height),a.jQuery?jQuery(d).empty():d.innerHTML="",d.appendChild(k),h()}else j.fallback(d,e,h)},j.fallback=function(a,b,c){c("not_support_camera")};var k=function(a){var c=a.nodeName?b.Image.toCanvas(a):a,d=b.Image(c);return d.type="image/png",d.width=c.width,d.height=c.height,d.size=c.width*c.height*4,d};j.Shot=k,b.Camera=j}(window,FileAPI),function(a,b,c){"use strict";var d=a.document,e=a.location,f=a.navigator,g=c.each;c.support.flash=function(){var b=f.mimeTypes,d=!1;if(f.plugins&&"object"==typeof f.plugins["Shockwave Flash"])d=f.plugins["Shockwave Flash"].description&&!(b&&b["application/x-shockwave-flash"]&&!b["application/x-shockwave-flash"].enabledPlugin);else try{d=!(!a.ActiveXObject||!new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))}catch(g){c.log("Flash -- does not supported.")}return d&&/^file:/i.test(e)&&c.log("[warn] Flash does not work on `file:` protocol."),d}(),c.support.flash&&(!c.html5||!c.support.html5||c.cors&&!c.support.cors||c.media&&!c.support.media)&&function(){function h(a){return('<object id="#id#" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+(a.width||"100%")+'" height="'+(a.height||"100%")+'"><param name="movie" value="#src#" /><param name="flashvars" value="#flashvars#" /><param name="swliveconnect" value="true" /><param name="allowscriptaccess" value="always" /><param name="allownetworking" value="all" /><param name="menu" value="false" /><param name="wmode" value="#wmode#" /><embed flashvars="#flashvars#" swliveconnect="true" allownetworking="all" allowscriptaccess="always" name="#id#" src="#src#" width="'+(a.width||"100%")+'" height="'+(a.height||"100%")+'" menu="false" wmode="transparent" type="application/x-shockwave-flash"></embed></object>').replace(/#(\w+)#/gi,function(b,c){return a[c]})}function i(a,b){if(a&&a.style){var c,d;for(c in b){d=b[c],"number"==typeof d&&(d+="px");try{a.style[c]=d}catch(e){}}}}function j(a,b){g(b,function(b,c){var d=a[c];a[c]=function(){return this.parent=d,b.apply(this,arguments)}})}function k(a){return a&&!a.flashId}function l(a){var b=a.wid=c.uid();return v._fn[b]=a,"FileAPI.Flash._fn."+b}function m(a){try{v._fn[a.wid]=null,delete v._fn[a.wid]}catch(b){}}function n(a,b){if(!u.test(a)){if(/^\.\//.test(a)||"/"!=a.charAt(0)){var c=e.pathname;c=c.substr(0,c.lastIndexOf("/")),a=(c+"/"+a).replace("/./","/")}"//"!=a.substr(0,2)&&(a="//"+e.host+a),u.test(a)||(a=e.protocol+a)}return b&&(a+=(/\?/.test(a)?"&":"?")+b),a}function o(a,b,e){function f(){try{var a=v.get(j);a.setImage(b)}catch(d){c.log('[err] FlashAPI.Preview.setImage -- can not set "base64":',d)}}var g,j=c.uid(),k=d.createElement("div"),o=10;for(g in a)k.setAttribute(g,a[g]),k[g]=a[g];i(k,a),a.width="100%",a.height="100%",k.innerHTML=h(c.extend({id:j,src:n(c.flashImageUrl,"r="+c.uid()),wmode:"opaque",flashvars:"scale="+a.scale+"&callback="+l(function p(){return m(p),--o>0&&f(),!0})},a)),e(!1,k),k=null}function p(a){return{id:a.id,name:a.name,matrix:a.matrix,flashId:a.flashId}}function q(b){var c=b.getBoundingClientRect(),e=d.body,f=(b&&b.ownerDocument).documentElement;return{top:c.top+(a.pageYOffset||f.scrollTop)-(f.clientTop||e.clientTop||0),left:c.left+(a.pageXOffset||f.scrollLeft)-(f.clientLeft||e.clientLeft||0),width:c.right-c.left,height:c.bottom-c.top}}var r=c.uid(),s=0,t={},u=/^https?:/i,v={_fn:{},init:function(){var a=d.body&&d.body.firstChild;if(a)do if(1==a.nodeType){c.log("FlashAPI.state: awaiting");var b=d.createElement("div");return b.id="_"+r,i(b,{top:1,right:1,width:5,height:5,position:"absolute",zIndex:"2147483647"}),a.parentNode.insertBefore(b,a),void v.publish(b,r)}while(a=a.nextSibling);10>s&&setTimeout(v.init,50*++s)},publish:function(a,b,d){d=d||{},a.innerHTML=h({id:b,src:n(c.flashUrl,"r="+c.version),wmode:d.camera?"":"transparent",flashvars:"callback="+(d.onEvent||"FileAPI.Flash.onEvent")+"&flashId="+b+"&storeKey="+f.userAgent.match(/\d/gi).join("")+"_"+c.version+(v.isReady||(c.pingUrl?"&ping="+c.pingUrl:""))+"&timeout="+c.flashAbortTimeout+(d.camera?"&useCamera="+n(c.flashWebcamUrl):"")+"&debug="+(c.debug?"1":"")},d)},ready:function(){c.log("FlashAPI.state: ready"),v.ready=c.F,v.isReady=!0,v.patch(),v.patchCamera&&v.patchCamera(),c.event.on(d,"mouseover",v.mouseover),c.event.on(d,"click",function(a){v.mouseover(a)&&(a.preventDefault?a.preventDefault():a.returnValue=!0)})},getEl:function(){return d.getElementById("_"+r)},getWrapper:function(a){do if(/js-fileapi-wrapper/.test(a.className))return a;while((a=a.parentNode)&&a!==d.body)},mouseover:function(a){var b=c.event.fix(a).target;if(/input/i.test(b.nodeName)&&"file"==b.type&&!b.disabled){var e=b.getAttribute(r),f=v.getWrapper(b);if(c.multiFlash){if("i"==e||"r"==e)return!1;if("p"!=e){b.setAttribute(r,"i");var g=d.createElement("div");if(!f)return void c.log("[err] FlashAPI.mouseover: js-fileapi-wrapper not found");i(g,{top:0,left:0,width:b.offsetWidth,height:b.offsetHeight,zIndex:"2147483647",position:"absolute"}),f.appendChild(g),v.publish(g,c.uid()),b.setAttribute(r,"p")}return!0}if(f){var h=q(f);i(v.getEl(),h),v.curInp=b}}else/object|embed/i.test(b.nodeName)||i(v.getEl(),{top:1,left:1,width:5,height:5})},onEvent:function(a){var b=a.type;if("ready"==b){try{v.getInput(a.flashId).setAttribute(r,"r")}catch(d){}return v.ready(),setTimeout(function(){v.mouseenter(a)},50),!0}"ping"===b?c.log("(flash -> js).ping:",[a.status,a.savedStatus],a.error):"log"===b?c.log("(flash -> js).log:",a.target):b in v&&setTimeout(function(){c.log("FlashAPI.event."+a.type+":",a),v[b](a)},1)},mouseenter:function(a){var b=v.getInput(a.flashId);if(b){v.cmd(a,"multiple",null!=b.getAttribute("multiple"));var d=[],e={};g((b.getAttribute("accept")||"").split(/,\s*/),function(a){c.accept[a]&&g(c.accept[a].split(" "),function(a){e[a]=1})}),g(e,function(a,b){d.push(b)}),v.cmd(a,"accept",d.length?d.join(",")+","+d.join(",").toUpperCase():"*")}},get:function(b){return d[b]||a[b]||d.embeds[b]},getInput:function(a){if(!c.multiFlash)return v.curInp;try{var b=v.getWrapper(v.get(a));if(b)return b.getElementsByTagName("input")[0]}catch(d){c.log('[err] Can not find "input" by flashId:',a,d)}},select:function(a){var e,f=v.getInput(a.flashId),h=c.uid(f),i=a.target.files;g(i,function(a){c.checkFileObj(a)}),t[h]=i,d.createEvent?(e=d.createEvent("Event"),e.files=i,e.initEvent("change",!0,!0),f.dispatchEvent(e)):b?b(f).trigger({type:"change",files:i}):(e=d.createEventObject(),e.files=i,f.fireEvent("onchange",e))},cmd:function(a,b,d,e){try{return c.log("(js -> flash)."+b+":",d),v.get(a.flashId||a).cmd(b,d)}catch(f){c.log("(js -> flash).onError:",f.toString()),e||setTimeout(function(){v.cmd(a,b,d,!0)},50)}},patch:function(){c.flashEngine=!0,j(c,{getFiles:function(a,b,d){if(d)return c.filterFiles(c.getFiles(a),b,d),null;var e=c.isArray(a)?a:t[c.uid(a.target||a.srcElement||a)];return e?(b&&(b=c.getFilesFilter(b),e=c.filter(e,function(a){return b.test(a.name)})),e):this.parent.apply(this,arguments)},getInfo:function(a,b){if(k(a))this.parent.apply(this,arguments);else if(a.isShot)b(null,a.info={width:a.width,height:a.height});else{if(!a.__info){var d=a.__info=c.defer();v.cmd(a,"getFileInfo",{id:a.id,callback:l(function e(b,c){m(e),d.resolve(b,a.info=c)})})}a.__info.then(b)}}}),c.support.transform=!0,c.Image&&j(c.Image.prototype,{get:function(a,b){return this.set({scaleMode:b||"noScale"}),this.parent(a)},_load:function(a,b){if(c.log("FlashAPI.Image._load:",a),k(a))this.parent.apply(this,arguments);else{var d=this;c.getInfo(a,function(c){b.call(d,c,a)})}},_apply:function(a,b){if(c.log("FlashAPI.Image._apply:",a),k(a))this.parent.apply(this,arguments);else{var d=this.getMatrix(a.info),e=b;v.cmd(a,"imageTransform",{id:a.id,matrix:d,callback:l(function f(g,h){c.log("FlashAPI.Image._apply.callback:",g),m(f),g?e(g):c.support.html5||c.support.dataURI&&!(h.length>3e4)?(d.filter&&(e=function(a,e){a?b(a):c.Image.applyFilter(e,d.filter,function(){b(a,this.canvas)})}),c.newImage("data:"+a.type+";base64,"+h,e)):o({width:d.deg%180?d.dh:d.dw,height:d.deg%180?d.dw:d.dh,scale:d.scaleMode},h,e)})})}},toData:function(a){var b=this.file,d=b.info,e=this.getMatrix(d);c.log("FlashAPI.Image.toData"),k(b)?this.parent.apply(this,arguments):("auto"==e.deg&&(e.deg=c.Image.exifOrientation[d&&d.exif&&d.exif.Orientation]||0),a.call(this,!b.info,{id:b.id,flashId:b.flashId,name:b.name,type:b.type,matrix:e}))}}),c.Image&&j(c.Image,{fromDataURL:function(a,b,d){!c.support.dataURI||a.length>3e4?o(c.extend({scale:"exactFit"},b),a.replace(/^data:[^,]+,/,""),function(a,b){d(b)}):this.parent(a,b,d)}}),j(c.Form.prototype,{toData:function(a){for(var b=this.items,d=b.length;d--;)if(b[d].file&&k(b[d].blob))return this.parent.apply(this,arguments);c.log("FlashAPI.Form.toData"),a(b)}}),j(c.XHR.prototype,{_send:function(a,b){if(b.nodeName||b.append&&c.support.html5||c.isArray(b)&&"string"==typeof b[0])return this.parent.apply(this,arguments);var d,e,f={},h={},i=this;if(g(b,function(a){a.file?(h[a.name]=a=p(a.blob),e=a.id,d=a.flashId):f[a.name]=a.blob}),e||(d=r),!d)return c.log("[err] FlashAPI._send: flashId -- undefined"),this.parent.apply(this,arguments);c.log("FlashAPI.XHR._send: "+d+" -> "+e),i.xhr={headers:{},abort:function(){v.cmd(d,"abort",{id:e})},getResponseHeader:function(a){return this.headers[a]},getAllResponseHeaders:function(){return this.headers}};var j=c.queue(function(){v.cmd(d,"upload",{url:n(a.url.replace(/([a-z]+)=(\?)&?/i,"")),data:f,files:e?h:null,headers:a.headers||{},callback:l(function b(d){var e=d.type,f=d.result;c.log("FlashAPI.upload."+e),"progress"==e?(d.loaded=Math.min(d.loaded,d.total),d.lengthComputable=!0,a.progress(d)):"complete"==e?(m(b),"string"==typeof f&&(i.responseText=f.replace(/%22/g,'"').replace(/%5c/g,"\\").replace(/%26/g,"&").replace(/%25/g,"%")),i.end(d.status||200)):("abort"==e||"error"==e)&&(i.end(d.status||0,d.message),m(b))})})});g(h,function(a){j.inc(),c.getInfo(a,j.next)}),j.check()}})}};c.Flash=v,c.newImage("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",function(a,b){c.support.dataURI=!(1!=b.width||1!=b.height),v.init()})}()}(window,window.jQuery,FileAPI),function(a,b,c){"use strict";var d=c.each,e=[];!c.support.flash||!c.media||c.support.media&&c.html5||!function(){function a(a){var b=a.wid=c.uid();return c.Flash._fn[b]=a,"FileAPI.Flash._fn."+b}function b(a){try{c.Flash._fn[a.wid]=null,delete c.Flash._fn[a.wid]}catch(b){}}var f=c.Flash;c.extend(c.Flash,{patchCamera:function(){c.Camera.fallback=function(d,e,g){var h=c.uid();c.log("FlashAPI.Camera.publish: "+h),f.publish(d,h,c.extend(e,{camera:!0,onEvent:a(function i(a){"camera"===a.type&&(b(i),a.error?(c.log("FlashAPI.Camera.publish.error: "+a.error),g(a.error)):(c.log("FlashAPI.Camera.publish.success: "+h),g(null)))})}))},d(e,function(a){c.Camera.fallback.apply(c.Camera,a)}),e=[],c.extend(c.Camera.prototype,{_id:function(){return this.video.id},start:function(d){var e=this;f.cmd(this._id(),"camera.on",{callback:a(function g(a){b(g),a.error?(c.log("FlashAPI.camera.on.error: "+a.error),d(a.error,e)):(c.log("FlashAPI.camera.on.success: "+e._id()),e._active=!0,d(null,e))})})},stop:function(){this._active=!1,f.cmd(this._id(),"camera.off")},shot:function(){c.log("FlashAPI.Camera.shot:",this._id());var a=c.Flash.cmd(this._id(),"shot",{});return a.type="image/png",a.flashId=this._id(),a.isShot=!0,new c.Camera.Shot(a)}})}}),c.Camera.fallback=function(){e.push(arguments)}}()}(window,window.jQuery,FileAPI),"function"=="function"&&__webpack_require__(6)&&!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return FileAPI}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 6 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 7 */
/***/ function(module, exports) {

	/*!
	 * jQuery.filer
	 * Copyright (c) 2015 CreativeDream
	 * Website: https://github.com/CreativeDream/jquery.filer
	 * Version: 1.0.4 (29-Oct-2015)
	 * Requires: jQuery v1.7.1 or later
	 */
	!function(e){"use strict";e.fn.filer=function(i){return this.each(function(t,n){var l=e(n),a=".jFiler",r=e(),o=e(),s=e(),d=[],f=e.extend(!0,{},e.fn.filer.defaults,i),u={init:function(){l.wrap('<div class="jFiler"></div>'),r=l.closest(a),u._changeInput()},_bindInput:function(){f.changeInput&&o.size()>0&&o.bind("click",u._clickHandler),l.on({focus:function(){o.addClass("focused")},blur:function(){o.removeClass("focused")},change:function(){u._onChange()}}),f.dragDrop&&(o.length>0?o:l).bind("drop",u._dragDrop.drop).bind("dragover",u._dragDrop.dragEnter).bind("dragleave",u._dragDrop.dragLeave),f.uploadFile&&f.clipBoardPaste&&e(window).on("paste",u._clipboardPaste)},_unbindInput:function(){f.changeInput&&o.size()>0&&o.unbind("click",u._clickHandler)},_clickHandler:function(){l.click()},_applyAttrSettings:function(){var e=["name","limit","maxSize","extensions","changeInput","showThumbs","appendTo","theme","addMore","excludeName","files"];for(var i in e){var t="data-jfiler-"+e[i];if(u._assets.hasAttr(t)){switch(e[i]){case"changeInput":case"showThumbs":case"addMore":f[e[i]]=["true","false"].indexOf(l.attr(t))>-1?"true"==l.attr(t):l.attr(t);break;case"extensions":f[e[i]]=l.attr(t).replace(/ /g,"").split(",");break;case"files":f[e[i]]=JSON.parse(l.attr(t));break;default:f[e[i]]=l.attr(t)}l.removeAttr(t)}}},_changeInput:function(){if(u._applyAttrSettings(),f.theme&&r.addClass("jFiler-theme-"+f.theme),"input"!=l.get(0).tagName.toLowerCase()&&"file"!=l.get(0).type)o=l,l=e('<input type="file" name="'+f.name+'" />'),l.css({position:"absolute",left:"-9999px",top:"-9999px","z-index":"-9999"}),r.prepend(l),u._isGn=l;else if(f.changeInput){switch(typeof f.changeInput){case"boolean":o=e('<div class="jFiler-input"><div class="jFiler-input-caption"><span>'+f.captions.feedback+'</span></div><div class="jFiler-input-button">'+f.captions.button+'</div></div>"');break;case"string":case"object":o=e(f.changeInput);break;case"function":o=e(f.changeInput(r,l,f))}l.after(o),l.css({position:"absolute",left:"-9999px",top:"-9999px","z-index":"-9999"})}(!f.limit||f.limit&&f.limit>=2)&&(l.attr("multiple","multiple"),"[]"!=l.attr("name").slice(-2)?l.attr("name",l.attr("name")+"[]"):null),u._bindInput(),f.files&&u._append(!1,{files:f.files})},_clear:function(){u.files=null,l.prop("jFiler").files=null,f.uploadFile||f.addMore||u._reset(),u._set("feedback",u._itFl&&u._itFl.length>0?u._itFl.length+" "+f.captions.feedback2:f.captions.feedback),null!=f.onEmpty&&"function"==typeof f.onEmpty?f.onEmpty(r,o,l):null},_reset:function(i){if(!i){if(!f.uploadFile&&f.addMore){for(var t=0;t<d.length;t++)d[t].remove();d=[],u._unbindInput(),l=u._isGn?u._isGn:e(n),u._bindInput()}u._set("input","")}u._itFl=[],u._itFc=null,u._ajFc=0,l.prop("jFiler").files_list=u._itFl,l.prop("jFiler").current_file=u._itFc,u._prEr||(u._itFr=[],r.find("input[name^='jfiler-items-exclude-']:hidden").remove()),s.fadeOut("fast",function(){e(this).remove()}),s=e()},_set:function(e,i){switch(e){case"input":l.val("");break;case"feedback":o.length>0&&o.find(".jFiler-input-caption span").html(i)}},_filesCheck:function(){var i=0;if(f.limit&&u.files.length+u._itFl.length>f.limit)return alert(u._assets.textParse(f.captions.errors.filesLimit)),!1;for(var t=0;t<u.files.length;t++){var n=u.files[t].name.split(".").pop().toLowerCase(),l=u.files[t],a={name:l.name,size:l.size,size2:u._assets.bytesToSize(l.size),type:l.type,ext:n};if(null!=f.extensions&&-1==e.inArray(n,f.extensions))return alert(u._assets.textParse(f.captions.errors.filesType,a)),!1;if(null!=f.maxSize&&u.files[t].size>1048576*f.maxSize)return alert(u._assets.textParse(f.captions.errors.filesSize,a)),!1;if(4096==l.size&&0==l.type.length)return!1;i+=u.files[t].size}if(null!=f.maxSize&&i>=Math.round(1048576*f.maxSize))return alert(u._assets.textParse(f.captions.errors.filesSizeAll)),!1;if(f.addMore||f.uploadFile){var a=u._itFl.filter(function(e){return e.file.name!=l.name||e.file.size!=l.size||e.file.type!=l.type||(l.lastModified?e.file.lastModified!=l.lastModified:0)?void 0:!0});if(a.length>0)return!1}return!0},_thumbCreator:{create:function(i){var t=u.files[i],n=u._itFc?u._itFc.id:i,l=t.name,a=t.size,r=t.type.split("/",1).toString().toLowerCase(),o=-1!=l.indexOf(".")?l.split(".").pop().toLowerCase():"",d=f.uploadFile?'<div class="jFiler-jProgressBar">'+f.templates.progressBar+"</div>":"",p={id:n,name:l,size:a,size2:u._assets.bytesToSize(a),type:r,extension:o,icon:u._assets.getIcon(o,r),icon2:u._thumbCreator.generateIcon({type:r,extension:o}),image:'<div class="jFiler-item-thumb-image fi-loading"></div>',progressBar:d,_appended:t._appended},c="";return t.opts&&(p=e.extend({},t.opts,p)),c=e(u._thumbCreator.renderContent(p)).attr("data-jfiler-index",n),c.get(0).jfiler_id=n,u._thumbCreator.renderFile(t,c,p),t.forList?c:(u._itFc.html=c,c.hide()[f.templates.itemAppendToEnd?"appendTo":"prependTo"](s.find(f.templates._selectors.list)).show(),void(t._appended||u._onSelect(i)))},renderContent:function(e){return u._assets.textParse(e._appended?f.templates.itemAppend:f.templates.item,e)},renderFile:function(i,t,n){if(0==t.find(".jFiler-item-thumb-image").size())return!1;if(i.file&&"image"==n.type){var l='<img src="'+i.file+'" draggable="false" />',a=t.find(".jFiler-item-thumb-image.fi-loading");return e(l).error(function(){l=u._thumbCreator.generateIcon(n),t.addClass("jFiler-no-thumbnail"),a.removeClass("fi-loading").html(l)}).load(function(){a.removeClass("fi-loading").html(l)}),!0}if(window.File&&window.FileList&&window.FileReader&&"image"==n.type&&n.size<6e6){var r=new FileReader;r.onload=function(i){var l='<img src="'+i.target.result+'" draggable="false" />',a=t.find(".jFiler-item-thumb-image.fi-loading");e(l).error(function(){l=u._thumbCreator.generateIcon(n),t.addClass("jFiler-no-thumbnail"),a.removeClass("fi-loading").html(l)}).load(function(){a.removeClass("fi-loading").html(l)})},r.readAsDataURL(i)}else{var l=u._thumbCreator.generateIcon(n),a=t.find(".jFiler-item-thumb-image.fi-loading");t.addClass("jFiler-no-thumbnail"),a.removeClass("fi-loading").html(l)}},generateIcon:function(i){var t=new Array(3);if(i&&i.type&&i.extension)switch(i.type){case"image":t[0]="f-image",t[1]='<i class="icon-jfi-file-image"></i>';break;case"video":t[0]="f-video",t[1]='<i class="icon-jfi-file-video"></i>';break;case"audio":t[0]="f-audio",t[1]='<i class="icon-jfi-file-audio"></i>';break;default:t[0]="f-file f-file-ext-"+i.extension,t[1]=i.extension.length>0?"."+i.extension:"",t[2]=1}else t[0]="f-file",t[1]=i.extension&&i.extension.length>0?"."+i.extension:"",t[2]=1;var n='<span class="jFiler-icon-file '+t[0]+'">'+t[1]+"</span>";if(1==t[2]){var l=u._assets.text2Color(i.extension);if(l){var a=e(n).appendTo("body"),r=a.css("box-shadow");r=l+r.substring(r.replace(/^.*(rgba?\([^)]+\)).*$/,"$1").length,r.length),a.css({"-webkit-box-shadow":r,"-moz-box-shadow":r,"box-shadow":r}).attr("style","-webkit-box-shadow: "+r+"; -moz-box-shadow: "+r+"; box-shadow: "+r+";"),n=a.prop("outerHTML"),a.remove()}}return n},_box:function(i){if(null!=f.beforeShow&&"function"==typeof f.beforeShow?!f.beforeShow(u.files,s,r,o,l):!1)return!1;if(s.length<1){if(f.appendTo)var t=e(f.appendTo);else var t=r;t.find(".jFiler-items").remove(),s=e('<div class="jFiler-items jFiler-row"></div>'),s.append(u._assets.textParse(f.templates.box)).appendTo(t),s.on("click",f.templates._selectors.remove,function(t){t.preventDefault();var n=f.templates.removeConfirmation?confirm(f.captions.removeConfirmation):!0;n&&u._remove(i?i.remove.event:t,i?i.remove.el:e(this).closest(f.templates._selectors.item))})}for(var n=0;n<u.files.length;n++)u.files[n]._appended||(u.files[n]._choosed=!0),u._addToMemory(n),u._thumbCreator.create(n)}},_upload:function(){var i=u._itFc.html,t=new FormData;if(t.append(l.attr("name"),u._itFc.file,u._itFc.file.name?u._itFc.file.name:!1),null!=f.uploadFile.data&&e.isPlainObject(f.uploadFile.data))for(var n in f.uploadFile.data)t.append(n,f.uploadFile.data[n]);u._ajax.send(i,t,u._itFc)},_ajax:{send:function(i,t,n){return n.ajax=e.ajax({url:f.uploadFile.url,data:t,type:f.uploadFile.type,enctype:f.uploadFile.enctype,xhr:function(){var t=e.ajaxSettings.xhr();return t.upload&&t.upload.addEventListener("progress",function(e){u._ajax.progressHandling(e,i)},!1),t},complete:function(e,i){n.ajax=!1,u._ajFc++,u._ajFc>=u.files.length&&(u._ajFc=0,null!=f.uploadFile.onComplete&&"function"==typeof f.uploadFile.onComplete?f.uploadFile.onComplete(s,r,o,l,e,i):null)},beforeSend:function(e,t){return null!=f.uploadFile.beforeSend&&"function"==typeof f.uploadFile.beforeSend?f.uploadFile.beforeSend(i,s,r,o,l,n.id,e,t):!0},success:function(e,t,a){n.uploaded=!0,null!=f.uploadFile.success&&"function"==typeof f.uploadFile.success?f.uploadFile.success(e,i,s,r,o,l,n.id,t,a):null},error:function(e,t,a){n.uploaded=!1,null!=f.uploadFile.error&&"function"==typeof f.uploadFile.error?f.uploadFile.error(i,s,r,o,l,n.id,e,t,a):null},statusCode:f.uploadFile.statusCode,cache:!1,contentType:!1,processData:!1}),n.ajax},progressHandling:function(e,i){if(e.lengthComputable){var t=Math.round(100*e.loaded/e.total).toString();null!=f.uploadFile.onProgress&&"function"==typeof f.uploadFile.onProgress?f.uploadFile.onProgress(t,i,s,r,o,l):null,i.find(".jFiler-jProgressBar").find(f.templates._selectors.progressBar).css("width",t+"%")}}},_dragDrop:{dragEnter:function(e){e.preventDefault(),e.stopPropagation(),r.addClass("dragged"),u._set("feedback",f.captions.drop),null!=f.dragDrop.dragEnter&&"function"==typeof f.dragDrop.dragEnter?f.dragDrop.dragEnter(e,o,l,r):null},dragLeave:function(e){return e.preventDefault(),e.stopPropagation(),u._dragDrop._dragLeaveCheck(e)?(r.removeClass("dragged"),u._set("feedback",f.captions.feedback),void(null!=f.dragDrop.dragLeave&&"function"==typeof f.dragDrop.dragLeave?f.dragDrop.dragLeave(e,o,l,r):null)):!1},drop:function(e){e.preventDefault(),r.removeClass("dragged"),!e.originalEvent.dataTransfer.files||e.originalEvent.dataTransfer.files.length<=0||(u._set("feedback",f.captions.feedback),u._onChange(e,e.originalEvent.dataTransfer.files),null!=f.dragDrop.drop&&"function"==typeof f.dragDrop.drop?f.dragDrop.drop(e.originalEvent.dataTransfer.files,e,o,l,r):null)},_dragLeaveCheck:function(i){var t=i.relatedTarget,n=!1;return t!==o&&(t&&(n=e.contains(o,t)),n)?!1:!0}},_clipboardPaste:function(e,i){if((i||e.originalEvent.clipboardData||e.originalEvent.clipboardData.items)&&(!i||e.originalEvent.dataTransfer||e.originalEvent.dataTransfer.items)&&!u._clPsePre){var t=i?e.originalEvent.dataTransfer.items:e.originalEvent.clipboardData.items,n=function(e,i,t){i=i||"",t=t||512;for(var n=atob(e),l=[],a=0;a<n.length;a+=t){for(var r=n.slice(a,a+t),o=new Array(r.length),s=0;s<r.length;s++)o[s]=r.charCodeAt(s);var d=new Uint8Array(o);l.push(d)}var f=new Blob(l,{type:i});return f};if(t)for(var l=0;l<t.length;l++)if(-1!==t[l].type.indexOf("image")||-1!==t[l].type.indexOf("text/uri-list")){if(i)try{window.atob(e.originalEvent.dataTransfer.getData("text/uri-list").toString().split(",")[1])}catch(e){return}var a=i?n(e.originalEvent.dataTransfer.getData("text/uri-list").toString().split(",")[1],"image/png"):t[l].getAsFile();a.name=Math.random().toString(36).substring(5),a.name+=-1!=a.type.indexOf("/")?"."+a.type.split("/")[1].toString().toLowerCase():".png",u._onChange(e,[a]),u._clPsePre=setTimeout(function(){delete u._clPsePre},1e3)}}},_onSelect:function(i){f.uploadFile&&!e.isEmptyObject(f.uploadFile)&&u._upload(i),null!=f.onSelect&&"function"==typeof f.onSelect?f.onSelect(u.files[i],u._itFc.html,s,r,o,l):null,i+1>=u.files.length&&(null!=f.afterShow&&"function"==typeof f.afterShow?f.afterShow(s,r,o,l):null)},_onChange:function(i,t){if(t){if(!t||0==t.length)return u._set("input",""),u._clear(),!1;u.files=t}else{if(!l.get(0).files||"undefined"==typeof l.get(0).files||0==l.get(0).files.length)return f.uploadFile||f.addMore||(u._set("input",""),u._clear()),!1;u.files=l.get(0).files}if(f.uploadFile||f.addMore||u._reset(!0),l.prop("jFiler").files=u.files,!u._filesCheck()||(null!=f.beforeSelect&&"function"==typeof f.beforeSelect?!f.beforeSelect(u.files,s,r,o,l):!1))return u._set("input",""),u._clear(),!1;if(u._set("feedback",u.files.length+u._itFl.length+" "+f.captions.feedback2),f.showThumbs)u._thumbCreator._box();else for(var n=0;n<u.files.length;n++)u.files[n]._choosed=!0,u._addToMemory(n),u._onSelect(n);if(!f.uploadFile&&f.addMore){var a=e('<input type="file" />'),p=l.prop("attributes");e.each(p,function(){a.attr(this.name,this.value)}),l.after(a),u._unbindInput(),d.push(a),l=a,u._bindInput()}},_append:function(e,i){var t=i?i.files:!1;if(t&&!(t.length<=0)&&(u.files=t,l.prop("jFiler").files=u.files,f.showThumbs)){for(var n=0;n<u.files.length;n++)u.files[n]._appended=!0;u._thumbCreator._box()}},_getList:function(e,i){var t=i?i.files:!1;if(t&&!(t.length<=0)&&(u.files=t,l.prop("jFiler").files=u.files,f.showThumbs)){for(var n=[],a=0;a<u.files.length;a++)u.files[a].forList=!0,n.push(u._thumbCreator.create(a));i.callback&&i.callback(n,s,r,o,l)}},_retryUpload:function(i,t){var n=parseInt("object"==typeof t?t.attr("data-jfiler-index"):t),a=u._itFl.filter(function(e){return e.id==n});return a.length>0?!f.uploadFile||e.isEmptyObject(f.uploadFile)||a[0].uploaded?void 0:(u._itFc=a[0],l.prop("jFiler").current_file=u._itFc,u._upload(n),!0):!1},_remove:function(i,n){if(n.binded){if("undefined"!=typeof n.data.id&&(n=s.find(f.templates._selectors.item+"[data-jfiler-index='"+n.data.id+"']"),0==n.size()))return!1;n.data.el&&(n=n.data.el)}var a=n.get(0).jfiler_id||n.attr("data-jfiler-index"),d=null,p=function(i){var n=r.find("input[name^='jfiler-items-exclude-']:hidden").first(),a=u._itFl[i],o=[];if(0==n.size()&&(n=e('<input type="hidden" name="jfiler-items-exclude-'+(f.excludeName?f.excludeName:("[]"!=l.attr("name").slice(-2)?l.attr("name"):l.attr("name").substring(0,l.attr("name").length-2))+"-"+t)+'">'),n.appendTo(r)),a.file._choosed||a.file._appended||a.uploaded){if(u._prEr=!0,u._itFr.push(a),f.addMore){var s=a.input,d=0;u._itFl.filter(function(e){e.file._choosed&&e.input.get(0)==s.get(0)&&d++}),1==d&&(u._itFr=u._itFr.filter(function(e){return e.file._choosed?e.input.get(0)!=s.get(0):!0}),s.val(""),u._prEr=!1)}for(var p=0;p<u._itFr.length;p++)o.push(u._itFr[p].file.name);o=JSON.stringify(o),n.val(o)}},c=function(i,t){p(t),u._itFl.splice(t,1),u._itFl.length<1?(u._reset(),u._clear()):u._set("feedback",u._itFl.length+" "+f.captions.feedback2),i.fadeOut("fast",function(){e(this).remove()})};for(var m in u._itFl)"length"!==m&&u._itFl.hasOwnProperty(m)&&u._itFl[m].id==a&&(d=m);return u._itFl.hasOwnProperty(d)?u._itFl[d].ajax?(u._itFl[d].ajax.abort(),void c(n,d)):(null!=f.onRemove&&"function"==typeof f.onRemove?f.onRemove(n,u._itFl[d].file,d,s,r,o,l):null,void c(n,d)):!1},_addToMemory:function(i){u._itFl.push({id:u._itFl.length,file:u.files[i],html:e(),ajax:!1,uploaded:!1}),f.addMore&&!u.files[i]._appended&&(u._itFl[u._itFl.length-1].input=l),u._itFc=u._itFl[u._itFl.length-1],l.prop("jFiler").files_list=u._itFl,l.prop("jFiler").current_file=u._itFc},_assets:{bytesToSize:function(e){if(0==e)return"0 Byte";var i=1e3,t=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],n=Math.floor(Math.log(e)/Math.log(i));return(e/Math.pow(i,n)).toPrecision(3)+" "+t[n]},hasAttr:function(e,i){var i=i?i:l,t=i.attr(e);return t&&"undefined"!=typeof t?!0:!1},getIcon:function(i,t){var n=["audio","image","text","video"];return e.inArray(t,n)>-1?'<i class="icon-jfi-file-'+t+" jfi-file-ext-"+i+'"></i>':'<i class="icon-jfi-file-o jfi-file-type-'+t+" jfi-file-ext-"+i+'"></i>'},textParse:function(i,t){switch(t=e.extend({},{limit:f.limit,maxSize:f.maxSize},t&&e.isPlainObject(t)?t:{}),typeof i){case"string":return i.replace(/\{\{fi-(.*?)\}\}/g,function(e,i){return i=i.replace(/ /g,""),i.match(/(.*?)\|limitTo\:(\d+)/)?i.replace(/(.*?)\|limitTo\:(\d+)/,function(e,i,n){var i=t[i]?t[i]:"",l=i.substring(0,n);return l=i.length>l.length?l.substring(0,l.length-3)+"...":l}):t[i]?t[i]:""});case"function":return i(t);default:return i}},text2Color:function(e){if(!e||0==e.length)return!1;for(var i=0,t=0;i<e.length;t=e.charCodeAt(i++)+((t<<5)-t));for(var i=0,n="#";3>i;n+=("00"+(t>>2*i++&255).toString(16)).slice(-2));return n}},files:null,_itFl:[],_itFc:null,_itFr:[],_ajFc:0,_prEr:!1};return l.prop("jFiler",{options:f,listEl:s,boxEl:r,newInputEl:o,inputEl:l,files:u.files,files_list:u._itFl,current_file:u._itFc,append:function(e){return u._append(!1,{files:[e]})},remove:function(e){return u._remove(null,{binded:!0,data:{id:e}}),!0},reset:function(){return u._reset(),u._clear(),!0},retry:function(e){return u._retryUpload(e)}}),l.on("filer.append",function(e,i){u._append(e,i)}),l.on("filer.remove",function(e,i){i.binded=!0,u._remove(e,i)}),l.on("filer.reset",function(){return u._reset(),u._clear(),!0}),l.on("filer.generateList",function(e,i){return u._getList(e,i)}),l.on("filer.retry",function(e,i){return u._retryUpload(e,i)}),u.init(),this})},e.fn.filer.defaults={limit:null,maxSize:null,extensions:null,changeInput:!0,showThumbs:!1,appendTo:null,theme:"default",templates:{box:'<ul class="jFiler-items-list jFiler-items-default"></ul>',item:'<li class="jFiler-item"><div class="jFiler-item-container"><div class="jFiler-item-inner"><div class="jFiler-item-icon pull-left">{{fi-icon}}</div><div class="jFiler-item-info pull-left"><div class="jFiler-item-title" title="{{fi-name}}">{{fi-name | limitTo:30}}</div><div class="jFiler-item-others"><span>size: {{fi-size2}}</span><span>type: {{fi-extension}}</span><span class="jFiler-item-status">{{fi-progressBar}}</span></div><div class="jFiler-item-assets"><ul class="list-inline"><li><a class="icon-jfi-trash jFiler-item-trash-action"></a></li></ul></div></div></div></div></li>',itemAppend:'<li class="jFiler-item"><div class="jFiler-item-container"><div class="jFiler-item-inner"><div class="jFiler-item-icon pull-left">{{fi-icon}}</div><div class="jFiler-item-info pull-left"><div class="jFiler-item-title">{{fi-name | limitTo:35}}</div><div class="jFiler-item-others"><span>size: {{fi-size2}}</span><span>type: {{fi-extension}}</span><span class="jFiler-item-status"></span></div><div class="jFiler-item-assets"><ul class="list-inline"><li><a class="icon-jfi-trash jFiler-item-trash-action"></a></li></ul></div></div></div></div></li>',progressBar:'<div class="bar"></div>',itemAppendToEnd:!1,removeConfirmation:!0,_selectors:{list:".jFiler-items-list",item:".jFiler-item",progressBar:".bar",remove:".jFiler-item-trash-action"}},files:null,uploadFile:null,dragDrop:null,addMore:!1,clipBoardPaste:!0,excludeName:null,beforeShow:null,beforeSelect:null,onSelect:null,afterShow:null,onRemove:null,onEmpty:null,captions:{button:"Choose Files",feedback:"Choose files To Upload",feedback2:"files were chosen",drop:"Drop file here to Upload",removeConfirmation:"Are you sure you want to remove this file?",errors:{filesLimit:"Only {{fi-limit}} files are allowed to be uploaded.",filesType:"Only Images are allowed to be uploaded.",filesSize:"{{fi-name}} is too large! Please upload file up to {{fi-maxSize}} MB.",filesSizeAll:"Files you've choosed are too large! Please upload files up to {{fi-maxSize}} MB."}}}}(jQuery);


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(9);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(16)(content, {});
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(10)();
	// imports
	exports.i(__webpack_require__(11), "");

	// module
	exports.push([module.id, "/*!\n * CSS jQuery.filer\n * Copyright (c) 2015 CreativeDream\n * Version: 1.0.4 (29-Oct-2015)\n*/\n\n/*-------------------------\n\tBasic configurations\n-------------------------*/\n.jFiler * {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.jFiler {\n    font-family: sans-serif;\n    font-size: 14px;\n    color: #494949;\n}\n\n/* Helpers */\n.jFiler ul.list-inline li {\n    display: inline-block;\n    padding-right: 5px;\n    padding-left: 5px;\n}\n\n.jFiler .pull-left {\n    float: left;\n}\n\n.jFiler .pull-right {\n    float: right;\n}\n\n/* File Icons */\nspan.jFiler-icon-file {\n    position: relative;\n    width: 57px;\n    height: 70px;\n    display: inline-block;\n    line-height: 70px;\n    text-align: center;\n    border-radius: 3px;\n    color: #fff;\n    font-family: sans-serif;\n    font-size: 13px;\n    font-weight: bold;\n    overflow: hidden;\n    box-shadow: 42px -55px 0 0 #A4A7AC inset;\n}\n\nspan.jFiler-icon-file:after {\n    position: absolute;\n    top: -1px;\n    right: -1px;\n    display: inline-block;\n    content: '';\n    border-style: solid;\n    border-width: 16px 0 0 16px;\n    border-color: transparent transparent transparent #DADDE1;\n}\n\nspan.jFiler-icon-file i[class*=\"icon-jfi-\"] {\n    font-size: 24px;\n}\n\nspan.jFiler-icon-file.f-image {\n    box-shadow: 42px -55px 0 0 #e15955 inset;\n}\n\nspan.jFiler-icon-file.f-image:after {\n    border-left-color: #c6393f;\n}\n\nspan.jFiler-icon-file.f-video {\n    box-shadow: 42px -55px 0 0 #4183d7 inset;\n}\n\nspan.jFiler-icon-file.f-video:after {\n    border-left-color: #446cb3;\n}\n\nspan.jFiler-icon-file.f-audio {\n    box-shadow: 42px -55px 0 0 #5bab6e inset;\n}\n\nspan.jFiler-icon-file.f-audio:after {\n    border-left-color: #448353;\n}\n\n\n/* Progress Bar */\n.jFiler-jProgressBar {\n    height: 8px;\n    background: #f1f1f1;\n    margin-top: 3px;\n    margin-bottom: 0;\n    overflow: hidden;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n}\n\n.jFiler-jProgressBar .bar {\n    float: left;\n    width: 0;\n    height: 100%;\n    font-size: 12px;\n    color: #ffffff;\n    text-align: center;\n    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);\n    background-color: #50A1E9;\n    box-sizing: border-box;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n    -webkit-transition: width 0.3s ease;\n    -moz-transition: width 0.3s ease;\n    -o-transition: width 0.3s ease;\n    transition: width 0.3s ease;\n}\n\n.jFiler-jProgressBar .bar.dark {\n    background-color: #555;\n}\n\n.jFiler-jProgressBar .bar.blue {\n    background-color: #428bca;\n}\n\n.jFiler-jProgressBar .bar.green {\n    background-color: #5cb85c;\n}\n\n.jFiler-jProgressBar .bar.orange {\n    background-color: #f7a923;\n}\n\n.jFiler-jProgressBar .bar.red {\n    background-color: #d9534f;\n}\n\n/* Thumbs */\n.jFiler-row:after,\n.jFiler-item:after {\n    display: table;\n    line-height: 0;\n    content: \"\";\n    clear: both;\n}\n\n.jFiler-items ul {\n    margin: 0;\n    padding: 0;\n    list-style: none;\n}\n\n/*-------------------------\n\tDefault Theme\n-------------------------*/\n.jFiler-theme-default .jFiler-input {\n    position: relative;\n    display: block;\n    width: 400px;\n    height: 35px;\n    margin: 0 0 15px 0;\n    background: #fefefe;\n    border: 1px solid #cecece;\n    font-size: 12px;\n    font-family: sans-serif;\n    color: #888;\n    border-radius: 4px;\n    cursor: pointer;\n    overflow: hidden;\n    -webkit-box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n       -moz-box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n            box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n}\n\n.jFiler-theme-default .jFiler-input.focused {\n    outline: none;\n    -webkit-box-shadow: 0 0 7px rgba(0,0,0,0.1);\n    -moz-box-shadow: 0 0 7px rgba(0,0,0,0.1);\n    box-shadow: 0 0 7px rgba(0,0,0,0.1);\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input {\n    border: 1px dashed #aaaaaa;\n    background: #f9f9f9;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input:hover {\n    background: #FFF8D0;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input * {\n    pointer-events: none;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input .jFiler-input-caption {\n    width: 100%;\n    text-align: center;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input .jFiler-input-button {\n    display: none;\n}\n\n.jFiler-theme-default .jFiler-input-caption {\n    display: block;\n    float: left;\n    height: 100%;\n    padding-top: 8px;\n    padding-left: 10px;\n    text-overflow: ellipsis;\n    overflow: hidden;\n}\n\n.jFiler-theme-default .jFiler-input-button {\n    display: block;\n    float: right;\n    height: 100%;\n    padding-top: 8px;\n    padding-left: 15px;\n    padding-right: 15px;\n    border-left: 1px solid #ccc;\n    color: #666666;\n    text-align: center;\n    background-color: #fefefe;\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#fefefe),to(#f1f1f1));\n    background-image: -webkit-linear-gradient(top,#fefefe,#f1f1f1);\n    background-image: -o-linear-gradient(top,#fefefe,#f1f1f1);\n    background-image: linear-gradient(to bottom,#fefefe,#f1f1f1);\n    background-image: -moz-linear-gradient(top,#fefefe,#f1f1f1);\n    -webkit-transition: all .1s ease-out;\n       -moz-transition: all .1s ease-out;\n         -o-transition: all .1s ease-out;\n            transition: all .1s ease-out;\n}\n\n.jFiler-theme-default .jFiler-input-button:hover {\n    -moz-box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n    -webkit-box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n    box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n}\n\n.jFiler-theme-default .jFiler-input-button:active {\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#f1f1f1),to(#fefefe));\n    background-image: -webkit-linear-gradient(top,#f1f1f1,#fefefe);\n    background-image: -o-linear-gradient(top,#f1f1f1,#fefefe);\n    background-image: linear-gradient(to bottom,#f1f1f1,#fefefe);\n    background-image: -moz-linear-gradient(top,#f1f1f1,#fefefe);\n}\n\n/*-------------------------\n\tThumbnails\n-------------------------*/\n.jFiler-items-default .jFiler-items {\n    \n}\n\n.jFiler-items-default .jFiler-item {\n    position: relative;\n    padding: 16px;\n    margin-bottom: 16px;\n    background: #f7f7f7;\n    color: #4d4d4c;\n}\n\n\n.jFiler-items-default .jFiler-item .jFiler-item-icon {\n    font-size: 32px;\n    color: #f5871f;\n    \n    margin-right: 15px;\n    margin-top: -3px;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-title {\n    font-weight: bold;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-others {\n    font-size: 12px;\n    color: #777;\n    margin-left: -5px;\n    margin-right: -5px;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-others span {\n    padding-left: 5px;\n    padding-right: 5px;\n}\n\n.jFiler-items-default .jFiler-item-assets {\n    position: absolute;\n    display: block;\n    right: 16px;\n    top: 50%;\n    margin-top: -10px;\n}\n\n.jFiler-items-default .jFiler-item-assets a {\n    padding: 8px 9px 8px 12px;\n    cursor: pointer;\n    background: #fafafa;\n    color: #777;\n    border-radius: 4px;\n    border: 1px solid #e3e3e3\n}\n\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:hover,\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:active {\n    color: #d9534f;\n}\n\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:active {\n    background: transparent;\n}\n\n/* Thumbnails: Grid */\n.jFiler-items-grid .jFiler-item {\n    float: left;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container {\n    position: relative;\n    margin: 0 20px 30px 0;\n    padding: 10px;\n    border: 1px solid #e1e1e1;\n    border-radius: 3px;\n    background: #fff;\n    -webkit-box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n    -moz-box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n    box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb {\n    position: relative;\n    width: 160px;\n    height: 115px;\n    min-height: 115px;\n    border: 1px solid #e1e1e1;\n    overflow: hidden;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb .jFiler-item-thumb-image {\n    width: 100%;\n    height: 100%;\n    text-align: center;\n}\n\n.jFiler-item .jFiler-item-container .jFiler-item-thumb img {\n    max-width: none;\n    max-height: 100%;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb span.jFiler-icon-file {\n    margin-top: 20px;\n}\n\n.jFiler-items-grid .jFiler-item-thumb-image.fi-loading {\n    background: url('data:image/gif;base64,R0lGODlhIwAjAMQAAP////f39+/v7+bm5t7e3tbW1s7OzsXFxb29vbW1ta2traWlpZycnJSUlIyMjISEhHt7e3Nzc2tra2NjY1paWlJSUkpKSkJCQjo6OjExMSkpKRkZGRAQEAAAAP///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFBAAeACwAAAAAIwAjAAAF5CAgjmRpnmiqrmzrvnAsz3Rto4Fwm4EYLIweQHcTKAiAQOPRI0QKRcYiEGA4qI8K9HZoGAIOSOBgCdIGBeLCMUgoBJSJjsBAxAiKRSFAQBCVBwMKGRsNQi8DBwsJhyQVGxMKjTCJk0kPjDI5AlQqBAcICFstBQqmmScFGh0dHBaWKAIEBQQDKQEKDxEQCTMBA5Y/o5oDoZYCHB1PMgIHCQacwCPACRStDTEDBrYABQg5wAgGIg4YYjQCogEGB3wI3J2+oD0G42PfN2Pc7D2JRDb/+In4t8MHwYIIEypcyLChQ4YhAAAh+QQFBAAeACwIAAgAEwATAAAFlqAnjiKSjAFJBscgLos4NIQ6JggAKLHXSDWbp6CoLRgeg0ShGwkIKQ9iITggPJFHaqA4eAYIRK0a9SwK0spl0TQkvEIJJnIlCdDCRk4lEJIGBgcHRn4jBBkciROFKgkNDg51jCJBJJU2ARocD4xNAQsGCBMcGz2FAxwZKQwVDYVwEhwOI02MAxsceJMeOgwaJ7skCX0jIQAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwJAAcAEgAVAAAFjqAnjmJAnihgHChqCACAJKMyoMHBeggSJ40baoC4zTwFB6IlOiwLhkCDMUIYUAUSgiA4RCZLAXPkoDQOsfFosVNjDYaBQiRmWjaaDMTdXDAYbWMJQnwiGBoOBEwmIwVeGhhzKAJ+BBsXIgoSVCcEAxkbAw8enEwAARkaYqluAqliChlLY64aQrNjAT2MKCEAIfkEBQQAHgAsBwAIABQAFAAABZqgJ45jUQBkqorGgQqIsKqteCjyTLbAsBg6UoBA8CgSIoGhGGQNAoXG4zAaNBcPxalJQhS4KwGhUCQgRYHZQGKxVBpgD8CQUCiAYEQTpZpcGFYrBgw5HgkEBg4XFHoqFx10CwMZFCIIDwl8IwscFAQXGR4NGQo6BBocRRUYHgIWGEwqBxoPHgEWoYYXVCsBCTIBqzkHaVwHvCshACH5BAUEAB4ALAAAAAABAAEAAAUDoBcCACH5BAUEAB4ALAcACAAVABQAAAWaoCeOpDECZKqKgRcY7bqanoHI6+EKSIHjCJ2oMPidCgIPQbHwGUkIBoLwJAEM1OpqQBgkC0yjwBGRRBQokfdXOASzo0MjqTrQUwQIpwM/QSYJKQoaHRUKHgtQSgwTEUIeDRcPSRQcHgiBFREiB1IkdAkaEgMUGAILFoE4AxkaRRIVLRIURTIGGQ0iExWcEzQyBzGwI05PV78rIQAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwHAAgAFAAUAAAFlaAnjmRBnmgqCip6kEGbDnJqvmJAsLVIDwgEoTc6JAy0k05VSIoKiSgipgoIaIFKZ8tBVBeNBgORkEwkDt6sYECSBosUwJRybDiqxuOgTmTwCAUKIwAHAwMJDw10CxUNMRIaBQcIAmhPCgYjVAcZDx4REx5lOCoWGCIPER4Bqi0FFwwiEBIxBg9DKpqpEVS5PQUFACohACH5BAUEAB4ALAAAAAABAAEAAAUDoBcCACH5BAUEAB4ALAcACAAUABQAAAWRoCeOpEGeaCoGKmqOQlvKXgId4usR6DA+HA6kQDsxMB0Nr0hSTHxFAgJxIABogpiEI9rgVAiF2ICARCANVovAjsESKoKaNGBkMqrEojA/WDYSHgMIJAVZBwsKSwoSCyIOFx4FJg4LVwQHRCgVDQIOEAEHDi9XJwISFAIADA4iDJ1xEwoiDa2SDFA0rCO5NGwtIQAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwHAAgAEwAUAAAFj6AnisNonqeBLWg7GpwmtAENcc8s6ifyGKJMp1DyIFqNjecxUEiKLpGi4slATcBW4hkdDQ6HbHd048TELtah8XCwxqjAsXXdKSyWuuiAILwmGBBABzUiBDUFCQglCBAJIgsTBAQFAQpzAwZ1BREsCwweBQt+Lg8QNQpvCAqFJwMQc6mGjy6kHrI7cB4DeiIhACH5BAUEAB4ALAAAAAABAAEAAAUDoBcCACH5BAUEAB4ALAcABwASABUAAAWXoCeOI0GQaBpUl5CSRZV4QrYN71hoWBBkGpdISAI4No2BhoNLHRijy8YQmQwOpJMC2BAgIh5fgJZKSDYWYg4FWZMMhkLT7XHYeAW6wrBgLGZ0KQZjgR4IEhFqJIAeBQ8UDQUCeSNzIwcNCCIJDwMDJwgGawSZAQgzBAiWIwELDSIHmh6xOQyiAKciV4oeAHO0IwB0ArweIQAh+QQFBAAeACwAAAAAAQABAAAFA6AXAgAh+QQFBAAeACwHAAcAEAAVAAAFjKAnjuMwkKgnjFJVosSEeMGVrcc1j8TlehVMIIDh7EaMzMKDuTE4k4DHsCiIKJnCI0LYcE6ehMWyPDxGgshyZL5MUqID6uCAowsEwsouWlTGFAR8HgUJCglHgyNWigF0dXYzBAwPCoJgcAUKBnELAgKYcAObHgdyfIYiBQcAdgIJjAanrq0AsoojQyghACH5BAUEAB4ALAAAAAABAAEAAAUDoBcCACH5BAUEAB4ALAcACAAUABQAAAWYoCeKwQhF5aiqA3SIlDVW7yoOlCRKlVhtNZtHYUkIKBfPYoNaFRADUUTWeAwyGYHHAFmIDhIJImBorBIFB6cDSZUnEGEA08k0UiPDQrsSTB58HgEDhEIqAHgIERESVoY2BAcIBwaPlh5Rl04KCnhnKwMJDFCelgMIBAAeT3hBNqoeAggFIgiaX7ZblZoBB5lbqoG3wzbCKyEAIfkEBQQAHgAsBwAHABUAEwAABZygJ46jIJBoSjZPqa6GGEmBZ0zx60Gt90QiSSb3QkgOHskkkMj0UAOkyCEhLBiey2X0SIwMLKRVAPAEHggCY8N5egiKB6OGAmwtC1UhQScFIgt9JAKCKQUICQkxBw2NCycqBhsdlBgBAwUGBgRlKgMPExMSgSSdKmQvBAgIOqwoAgeKkDopBgMiMbOutCgGSLe8IlIeSKbBI1LAKCEAIfkEBQQAHgAsAAAAAAEAAQAABQOgFwIAIfkEBQQAHgAsAAAAAAEAAQAABQOgFwIAIfkECQQAHgAsAAAAACMAIwAABbWgJ45kaZ5oqq5s675wLM90baPBvS6MTgoKgqjxEBEihZuAsRAxHKJHJXk7NAwBB8RzsPRqBYFo4RgkFALKxMhAxAiKBdXtAXgah4Eis2nIBgcLCSgVGxMKNYAoD4MzAgI5KgQHCAhULQUKmgmRJgUaIhwWLwIEBQQDKQEKDxEQCXYxnSUBcjapKAIcHUg+JgkUHRx+YB6zIw4YEMc2QiMBzDB0HgbGvifR19rb3N3e3+Dh4ikhADs=') no-repeat center;\n    width: 100%;\n    height: 100%;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info {\n    position: absolute;\n    bottom: -10%;\n    left: 0;\n    width: 100%;\n    color: #fff;\n    padding: 6px 10px;\n    background: -moz-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -webkit-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -o-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -ms-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: linear-gradient(to top,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    z-index: 9;\n    opacity: 0;\n    filter: alpha(opacity(0));\n    -webkit-transition: all 0.12s;\n    -moz-transition: all 0.12s;\n    transition: all 0.12s;\n}\n\n.jFiler-items-grid .jFiler-no-thumbnail.jFiler-item .jFiler-item-container .jFiler-item-info {\n    background: rgba(0,0,0,0.55);\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb:hover .jFiler-item-info {\n    bottom: 0;\n    opacity: 1;\n    filter: aplpha(opacity(100));\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info .jFiler-item-title {\n    display: block;\n    font-weight: bold;\n    word-break: break-all;\n    line-height: 1;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info .jFiler-item-others {\n    display: inline-block;\n    font-size: 10px;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets {\n    margin-top: 10px;\n    color: #999;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .text-success {\n    color: #3C763D\n}\n\n.jFiler-items-grid .jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .text-error {\n    color: #A94442\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .jFiler-jProgressBar {\n    width: 120px;\n    margin-left: -5px;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .jFiler-item-others {\n    font-size: 12px;\n}\n\n.jFiler-items-grid .jFiler-item-trash-action:hover {\n    cursor: pointer;\n    color: #d9534f;\n}", ""]);

	// exports


/***/ },
/* 10 */
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(10)();
	// imports


	// module
	exports.push([module.id, "/*\n  Icon Font: jquery-filer\n*/\n\n@font-face {\n  font-family: \"jquery-filer\";\n  src: url(" + __webpack_require__(12) + ");\n  src: url(" + __webpack_require__(12) + "?#iefix) format(\"embedded-opentype\"),\n       url(data:application/x-font-woff;charset=utf-8;base64,d09GRgABAAAAABY8AA0AAAAAJGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAWIAAAABoAAAAcbgWsnk9TLzIAAAGgAAAASgAAAGBDMGCrY21hcAAAAjgAAAB2AAABir/jw6BjdnQgAAACsAAAAAQAAAAEABEBRGdhc3AAABYYAAAACAAAAAj//wADZ2x5ZgAAAxwAABDDAAAbVDwbM1RoZWFkAAABMAAAADAAAAA2AudKS2hoZWEAAAFgAAAAIAAAACQD8QHEaG10eAAAAewAAABLAAAAbgpuBLZsb2NhAAACtAAAAGgAAABonHCkGm1heHAAAAGAAAAAIAAAACAAgQDCbmFtZQAAE+AAAAFmAAACwZhqioJwb3N0AAAVSAAAAM8AAAIIqeejRXjaY2BkYGAA4ogbscvj+W2+MnAzMYDAhScsz2H0////9zMxMh4EcjkYwNIAbNUNrHjaY2BkYGA8+H8/gx4Tw///DAxMjAxAERTAAgB/egS4AAEAAAAzAJEADAAAAAAAAgAAAAEAAQAAAEAALgAAAAB42mNgYWJg/MLAysDA6MOYxsDA4A6lvzJIMrQwMDAxsHEywIEAgskQkOaawnDg07fPLowH/h9g0GM8yOAIFGZEUqLAwAgAW4ENdAAAeNpjYmAQZAACJgi2Y1BgcAAyVYC4ASQO5IFEHBiyweI2QNIGzFIAQgaGE0C2CpClzCAHhBD1DgwLwKQDQyBQbAZYNQTYAAC2kQkrAHja3YxNCoNADIXfOGUUnEDtQlwobnuQHqYH6Xm7yAMRReLUigvpCfpBEt4PAeDxnRYOH15JuU1f8Ey3xjU5QUedCXrmFN7YsOfDDNBBZ7XNL1mxZse7mYiUUkgQL4hLnOIQ3/v/H7iAI3RZWtm5gL9nBYpEIu8AAAARAUQAAAAqACoAKgBSAJ4AvgEGAUQBfAGqAkACeAKyAwwDPAN+A7gEDASUBLIE8gUgBVgFmgX8BjYGhga2BvoHSAeeB/AIHAhiCLII5AkcCYIJwgoSCi4KWgqyCuALNguYDGwMvAzwDUINqnjanVl7jNzGeZ+Pr1lyd0nuckne7d5x38t7P3aXy3vsPSRLOkknyVIiy3q4tlzbkuw6tRoHidTW8cVwYBVF28SxdQ5gNIpTCwWaJrJRGW5go+fHH0VRIEbkPwo0CGQjRV0kQa0U7R+tQfUbcu+0d3KMonviPD7OcGa+5+8bEY6kCCHfhrsITygZewXIePtVKpBf1V+RxJ+2X+U5bJJXeEYWGflVKsEn7VeB0RupRsptpMqpC185dQruCv4qBQ38GpB5Uoa3YT+xsJfROKk0ztWaC9Cq58FnBbxNr5ZohpZOUMrqvX/BOtCXkV4rSRJSsUfp3pexjV/gSYEU4Dos4l6LZJKQas21zIxUqnlNX6IO1Fu1Zq1cksyMVW95zVajbmWoCqWaW2v681C3bFirTWvb79muTdeKD33poW9RMT9KFepY4j+L5S8//eWyGFVXZvuzztj27WNOtn+2MTf3pwodzYuUipazT5dndu6alnV5etfOGRKec5EYsAZfYDzEVUw86jjUwg3YLbhrZKH4XDy+6iyMeIUCfGFhdLRwMR7/dn54dGFoKJxPyBGOwG5SZ3ySyqVxaJZddpKM1aj7pm/TMlJr4Qe9PCCxxQ6qgesjiSNLk9MVgC/kBqueVx3J9do9UJmZXFqa9CrcY7lhRh3I9dt9FX8S4MFdwwDPON5erwR5Iz+y68GlAeD+qIiE/opRGSQiqdz8OXwALxGFqCSN0svjJpGVQH2UnQ227/qdx27hSXEjNryfTAb//udNSCXcRPA3xuxMevHlBXPBWngkHh8SkoK1CI8kazjG+w6kcOyLRmamZ+HlRXPRWjTZEMFaIIQj5OZPkBc/wHWrhPhlr2HOAwrSpmOADKENu2GWPRXbNdd38E3LL1+96thPHLhzxew3Htu55/f0Jy9uJfz46h/uuefk/tgdh+/Z1e5q43orRIcVOEuSJEdIJaMBaikgq2dRnTLSMGpPR2NhRTwrJvBRpOuSEhYR4SIjsqZyJKEoUYfpBXfz5s01DmCNjJNThIhm0ZsH30NtdGstvzYHbZjn/AkfC5SrRSV8sMQ/0wGxOAbj4PmtBWhM4LSWR/2WW8O6Ngwq4CAV+iGTB9eyrTxn5cFECkcCAmePmKoqU14BUTFVXlSy6dhRU6Ax3EsqHtPV9OHHgiKsyQ/uVqWUysc5AXiV5wBbyTtoKiEoKZ1yvA68KMqcakjJPacmNW3+XrVmDNKM3k8VOa5qvWqCE5REHGbjaTMjJ7WSHaumh5L3jY3vkrnPiYlBhadCTIIeTezro+BCTDaAS+cTSd0SJCnOcbHhpHAI5F2ocwR5RVDn4kQjBrFJGXWukSqmGqgB+FAsivhAqtgLRa+MShA+cPl4QI6fuHhiLh98nIfloA3vtrHbhqdZ08FfG3/BcUgG/wHDvzWHPyYbtFmCNrsSrVRtRmrssgL9R2hjCzAPGXQfY9BkzgO+JlpiUjw1hYUlisdFiYrPiAvNo2eONbA4+lFMQPJDUyK+pVQ4LuLbNL5rHDtztNkM1yzcvI7+6yRa1Cz2Syqgp8ozWaKUbVxxHpo1K8OU22VqwHS82aot8POiPwZetIvGqWPNSgH1JF5z4lpKaxxrNg+3T8+l0/VtSR0ECQA44DgugYoa49zR9unfPw2L5dlSXyOd7LFMPadwXHl2x+zk0T3D3IgucKIIApvBcaqoJtKKta02smd4eN23FeAS8olxyWQGYUZWMcdMcA6YoXihtVj9zE7hkqqcUZUJRT2jqF3Nj26jsGaXHMpoJaTqNVG9w6Ik9TODRx23ZhmfmD3OAeNRt0zOKtKiIhUkZZGZ5Ebz4IZUrtz2jjX3dssFyO+QHDwPO9kZ1z0AjdzAAqpEd8SyMszXPSeVYhlp714pE8M4hfWW/n0Ytz6Nvt7v1r9h4kf6h6bNtDB062EZ6iG9pY32p+jkfeLoaKhwEmugRqIK3ka5f4MbFz5rWIfyeDdvKLNLlP8a2uUo7nQb2U+OkYcIKUTCZ1LPGGEplVORZnip2xTDRcuNhGqgSUfCNMIgVgyDXLrra1ZXG1xVllX5YNIwktXc9VyVNU7iv6SxclKmi1ReC64byetJQ6eyTIM1Vt4dzlkKS5mGpDUKXzGShaQR4DeqOSiEnQL7WkHX2dzgYSgE+B0D9svhzGBtY+6tAjFIG/nxLvJDQN4kUYY2Hsg2G1BMMW9U/m5w7sYDwT/AvtWrsHYpuMSR5gPBVRhdjWReQJmfJDoZCJGCBiqHHKih2FuNql1s+UyqszDDOZztAOMd/CBBIQGcEgveScQgCTQBR7ngLzmBU3hlWZZiPC9xiUTqz2IUSEz5kRRDFX9dUSaL5hClPM9RPiFKzJalLXtPEZP0bj2Bje6W4uPis+k0r88MnT00svlMTz76qDA2lm80kC+RPj9FZIzcJabRLmUejaM+KjPzdJWMypXGuOY8V3cALlhvlAb66hXrv98sDVYXKrDbaS4dWGo6UfXWQPENy6o0xt+wKwvVwYMHdjedfGN3NCD0pYRMYby4G1cbCnmJ+ldkSLBlM7xgt+wNjMSAVKdCVYMVb3nZCz4cnG4P6rtHZoZ6swMzMwM9djxWalRn40KSCn0DA30wtfzwvpmBoRlusD4U/2D60HRCkt2RSpKDgSmXRP4cV74OXyMxsoRYBQERdTEm+QwCoiV4TMtR7ctu02t2bULj1MihmeVww3644RDl4Ly34nuXE76+WhqfKD10v5Bza33a7FDfZFJS5bjey4Ns9Y04J07UmqUcX7LUhDpdmtgJb8SXl+OtX//aapRKk7rb1zcENDk4U8gmJdHWZT7m9uRHdK/qjMuWIzmVHRPAhb5vPSZVme/bCD3SlsjDMdd+fSPMCHRrlKm0Pzc2d/qX6yEFpNtjSqE93Dscye7mRyi7b5Ex5vtIyKvGp4trg0kdqTbqPOOyj2rKkWXv85/vkl1bWZfdY491Sde7XDePHDFR6YYeWXamD80kJXlglMnRnRpwpgcHmYQH48FfR8P+Dff392inU+ibNYZ8qxsBL/JmBu24OTfqwwRGlDCsSEosFlWKdJDKZ6YYlRXArbEmK8I8Zt33xxFzjhKSxr11nHrL2Ah+kZf0/KbLCBgH7Ijyj8w1hw79+4IwgRCNnxAEgeP5KTR2QRTGBAFWwgHMiwefREOwOPZiKA/uRU4QSLiPCu7jp3AJz1kkjfXo+1lru4aFKJMZGkJRI4xAhejjrBDQKU3hE22CX5NlUYsFKzFNlOU1QUtruzf2cv8XEXPyIHyR5/lfBpc0PYY/XYOTMVlety2W610iLlm4XQYs3HTvdJ3us3Rwc/COZLQy5LznDA05V5BVwhW9p0d/T+8RBF0QTiJiH/keL/F9PP+9EdTmFUl5/SAbixPCEeHYHv0gznwfX7LROFhioxNMoAIph9j1b1FbhhHFoE4bYipMUaKMrWpO9HHm5C0KxazFC/OZjGWIXjXNlB87V2EZGpVKs1kp9gY3uHql0mhgc8YuclzRtkulx0ALbrw5USpNFOH1bcF3KvXGnqb9J97raItQnmzsaVh/kLclu1AaL4HhHfOCZRxanMA9Ojd/Bh8ivmb5fRw9PzGKqWIVMbWHtUhd9ocZnQPvIm6+HJyDC/icNfeML5/qferAALwUtBFJn4DR/7KW6k8/n3rzj5kts+/+HZ59DXF0EU8/FsUTL4wlJvNoKeqmQixg+B3UbhvratbwMezc993gAhxf/YlqZPfuy6X1XAExe3FaltqSfPzaA2HEcTDYOFkjCC4+D7yRRTi//cprr13ZDnOSLEujv/0A6fiVT8IcokIQ41f9lPsbsKoZAku2O9ujXoRCtgBNeOb8+azxsZHVjFzOGMkZly9T+UMje+K8LAXvMzQwKksfS/J/Hg7eO7wjnculL+fSbSOnpXOOLGk541/eOPwEG4aneJdt8qsbOc4aSaDFZZBj/SG3MMf1omwGo3C1gewzzAZfZDQ4d2H1/PmLzrVdQf3dZ4Kr13b9D2jnVmHtq8E/OTfO5+f8bQ424Xe3BTdunO/kNet3ESyDwow51DMGIhnArLm330/0jcWVsf5aK7v6XH+rtvm24t5Cb2+h5VZzL1zMuW5L23p5cQvHNsmeMIJwLGupYULTalg2S9DnueYYx1J3luJ2jNhv5YE5dAfoJsvuAEZYyzeW3OEDOVTrEs8LXNpzsuPlTKY8nu0ZS5VigqicRWeq0GJ2Z9Vdaj4lCMw8hanQYP+VwYRKEXFRiQeuJ4vTmjg7rZcpzpHOKqIQK/T25Ru1s2wSzjiKFZ7lEvqcRTyLw/R4s8/xyt3eB1WH3+KSYDF0HYqk66w8KSlYF26FhoMF1sDiZFgq0jcUyE6wxkQUFrriAlt/5rZsqBMNN5yeu8VdW92JwSL6rQ5TenpYiUctYLxgTSwubaQEuwcEYYVRB8LhWAo/H+j0hYnNedIiuYS5AEHtDbnD4gA7fqMY5X3Beyyrw3gYZnthnqduyrU1dseyJcrcls+th8rNOVzEtC152yEC8EN4MowQ0b1ZpNWYMJmdfkf32ZVZJ72K+uaW8fBD1yn1vNPnD7j9q7wu8NwLRjZbNd7WM7qpPSvJVKGnQvppvd+0tG/27nLc3rf73QG/7wWOF3T+BaOWzRrvaCbO+KYkx2LS6ZB+SjfNfv3ZHuSDg/j7w9BX5sIdR/DPDuFgCBXZlZabKqfgw6//6OsP7qd33P34S4/ffQfd/+A156V7n3763jufSDnaozsOPf74oR2Pav36Ez8OrsEo4/ELqLtPIo7TSPv2eOlnVJ6q0EVF0BmCUob1GCPGgF0lOhxMSEJbkMLizpicjiuKyjpiIaMlbC2lyGle5PlBNKyBfZmBYubU+mjpWdXWNCpKpiTEZDFuVtEPxuM6lWyBy/NU2K5nq5v1XEMt33U77vCbzGdRKRSb32IbY/KKbrwiZMIOIHYrTpduL/YNWnMFQSoi+zk1FksmDCWhZ8N38VhMVmPSyVvqvz5L+L5Vy3iS2At8SpKSshyXaH9KZm9FTRTEZCKt3dI+oePL38JoqpE7yDcYirOYRJtWJ5hjak1tibpS50rRpSjeWoRLWr6Lcm9FFwuW7Vs2tdjlAvUxVfDGORy2wGa4tXG+VC6VNY5BYvwexeyhD0wcmweKE20rz89AY4FjN0gtn90i+B/Mj4zMj0yhNtayMHxAlGtpe7ee7tH6tJ60vttO12TxAMf9phdn9s7o6CAp7RfEHaqqaWKaAcu0qGmqukMQKxTd7969bEjl1giJxwF6Ut0hCv0UR0BihG1jX5ZtQwk/b7jr67qGvZT67A1ZKDshLei4ptrqLKrNzmpdy+oWT3krXBQHxKgo6DMzuiDSGA7wNDWp38IE/79cI0znGCz6P+caX6o7LI347FRjrf6LX9StI0dwP7ENTBDhsujuM8fyjjnALNxseH7DLDPoBF7Utzv1taur565hgaiAta6u/or1Vp1rziqjsXZUMptL4Do/+9R1yoiwGWpFPGiGeJDiUzWLHmzU0Xr8lnoVHg5WYTm45mDjKoziE9XOuePt450H1s4harx2Dpvt4Mb581iB3ul1E6M9dt9PRLcT/Ygqq2QQs6TQU2y+q2Bo0g65E91XlNl/Daz3sbaY20ArLDHcbTP/Gom51X2x0XZOzDnhr71RifVyTMsLXG/lbiHdm0oleW3zxYeDXO7MOJHPs8Zb5V5NzQnluktpIp3uSXP/CyLCXdEAeNqNkc1qwkAUhc/4By1S2lVdztKCiZOAm2wFxV1X7lOdaCQkmkwQX0P6GKX7PkuhT9AH6LIncSh20WKGmfudMzd37jAAbvAKgdM3w7NlgS6+LDfQFneWm+iL2HILXfFiuY1b8W65g26jw0zRuqI61n9VLNDDh+UGrkXbchOP4t5yCz1xtNyGFG+WO/Q/MUYOjRCG6xISTzhwnaFEgph+SjVlTLCgLrkO6iGxpzZYkybImGfqmGPFShI+XCjGPjMMxxYBhhyRzY1+cl0UVC5dTf8BGOc6NHopnw5yViZxmMppmCzicjEYDOQ+Nms5yVIzyfKVlr6rZH9tzDYYDiO6UeW6ReSm2rDUBjv2rHnSAQ5PiXmPSmGzK3V+cKI40VRnG9b570oB51+FT7s+8xx4nBV5GLHgr5YDed4Apa8cz/GVN7q453ltFtzO6kdS9UluHasuMdd5EWepVMpzlVLy0srfppZ9qgAAeNpdzkdSw1AUBVG1CCbnZJLJOUj/fWwzxID2woQZ+2NnQIlmgianStKrvkVZtM/XZ9H9geL/E+3bkpIxxplgkg5TTDPDLHPMs8AiSyyzwiprrLPBJlt02WaHXfbYp8cBhxxxzAmnnHHOBZdccc0Nt9xxT0Xd+Xh/a1LT14EOdaRNa1SVhg50pM/68mtda9K+elcP9e//V7WX/J4e9UntJXvJ++R98j7cG+4Id4T7I+uDui/cF/bDftgP+2E/7If9sJ/tZ/vZfraf8zcFz3IYAAAAAAH//wACeNpjYGBgZACCM7aLzoPoC09YnsNoAFB9B7oAAA==),\n       url(" + __webpack_require__(13) + ") format(\"woff\"),\n       url(" + __webpack_require__(14) + ") format(\"truetype\"),\n       url(" + __webpack_require__(15) + "#jquery-filer) format(\"svg\");\n  font-weight: normal;\n  font-style: normal;\n}\n\n@media screen and (-webkit-min-device-pixel-ratio:0) {\n  @font-face {\n    font-family: \"jquery-filer\";\n    src: url(" + __webpack_require__(15) + "#jquery-filer) format(\"svg\");\n  }\n}\n\n[data-icon]:before { content: attr(data-icon); }\n\n[data-icon]:before,\n.icon-jfi-ban:before,\n.icon-jfi-calendar:before,\n.icon-jfi-check:before,\n.icon-jfi-check-circle:before,\n.icon-jfi-cloud-o:before,\n.icon-jfi-cloud-up-o:before,\n.icon-jfi-comment:before,\n.icon-jfi-comment-o:before,\n.icon-jfi-download-o:before,\n.icon-jfi-exclamation:before,\n.icon-jfi-exclamation-circle:before,\n.icon-jfi-exclamation-triangle:before,\n.icon-jfi-external-link:before,\n.icon-jfi-eye:before,\n.icon-jfi-file:before,\n.icon-jfi-file-audio:before,\n.icon-jfi-file-image:before,\n.icon-jfi-file-o:before,\n.icon-jfi-file-text:before,\n.icon-jfi-file-video:before,\n.icon-jfi-files-o:before,\n.icon-jfi-folder:before,\n.icon-jfi-heart:before,\n.icon-jfi-heart-o:before,\n.icon-jfi-history:before,\n.icon-jfi-infinite:before,\n.icon-jfi-info:before,\n.icon-jfi-info-circle:before,\n.icon-jfi-minus:before,\n.icon-jfi-minus-circle:before,\n.icon-jfi-paperclip:before,\n.icon-jfi-pencil:before,\n.icon-jfi-plus:before,\n.icon-jfi-plus-circle:before,\n.icon-jfi-power-off:before,\n.icon-jfi-question:before,\n.icon-jfi-question-circle:before,\n.icon-jfi-reload:before,\n.icon-jfi-settings:before,\n.icon-jfi-sort:before,\n.icon-jfi-times:before,\n.icon-jfi-times-circle:before,\n.icon-jfi-trash:before,\n.icon-jfi-upload-o:before,\n.icon-jfi-user:before,\n.icon-jfi-view-grid:before,\n.icon-jfi-view-list:before,\n.icon-jfi-zip:before {\n  display: inline-block;\n  font-family: \"jquery-filer\";\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n  text-decoration: inherit;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-smoothing: antialiased;\n}\n\n.icon-jfi-ban:before { content: \"\\F328\"; }\n.icon-jfi-calendar:before { content: \"\\F30B\"; }\n.icon-jfi-check:before { content: \"\\F2F6\"; }\n.icon-jfi-check-circle:before { content: \"\\F30C\"; }\n.icon-jfi-cloud-o:before { content: \"\\F329\"; }\n.icon-jfi-cloud-up-o:before { content: \"\\F32A\"; }\n.icon-jfi-comment:before { content: \"\\F32B\"; }\n.icon-jfi-comment-o:before { content: \"\\F30D\"; }\n.icon-jfi-download-o:before { content: \"\\F32C\"; }\n.icon-jfi-exclamation:before { content: \"\\F32D\"; }\n.icon-jfi-exclamation-circle:before { content: \"\\F32E\"; }\n.icon-jfi-exclamation-triangle:before { content: \"\\F32F\"; }\n.icon-jfi-external-link:before { content: \"\\F330\"; }\n.icon-jfi-eye:before { content: \"\\F2F7\"; }\n.icon-jfi-file:before { content: \"\\F31F\"; }\n.icon-jfi-file-audio:before { content: \"\\F331\"; }\n.icon-jfi-file-image:before { content: \"\\F332\"; }\n.icon-jfi-file-o:before { content: \"\\F31D\"; }\n.icon-jfi-file-text:before { content: \"\\F333\"; }\n.icon-jfi-file-video:before { content: \"\\F334\"; }\n.icon-jfi-files-o:before { content: \"\\F335\"; }\n.icon-jfi-folder:before { content: \"\\F31E\"; }\n.icon-jfi-heart:before { content: \"\\F2F8\"; }\n.icon-jfi-heart-o:before { content: \"\\F336\"; }\n.icon-jfi-history:before { content: \"\\F337\"; }\n.icon-jfi-infinite:before { content: \"\\F2FB\"; }\n.icon-jfi-info:before { content: \"\\F338\"; }\n.icon-jfi-info-circle:before { content: \"\\F339\"; }\n.icon-jfi-minus:before { content: \"\\F33A\"; }\n.icon-jfi-minus-circle:before { content: \"\\F33B\"; }\n.icon-jfi-paperclip:before { content: \"\\F33C\"; }\n.icon-jfi-pencil:before { content: \"\\F2FF\"; }\n.icon-jfi-plus:before { content: \"\\F311\"; }\n.icon-jfi-plus-circle:before { content: \"\\F312\"; }\n.icon-jfi-power-off:before { content: \"\\F33D\"; }\n.icon-jfi-question:before { content: \"\\F33E\"; }\n.icon-jfi-question-circle:before { content: \"\\F33F\"; }\n.icon-jfi-reload:before { content: \"\\F300\"; }\n.icon-jfi-settings:before { content: \"\\F340\"; }\n.icon-jfi-sort:before { content: \"\\F303\"; }\n.icon-jfi-times:before { content: \"\\F316\"; }\n.icon-jfi-times-circle:before { content: \"\\F317\"; }\n.icon-jfi-trash:before { content: \"\\F318\"; }\n.icon-jfi-upload-o:before { content: \"\\F341\"; }\n.icon-jfi-user:before { content: \"\\F307\"; }\n.icon-jfi-view-grid:before { content: \"\\F342\"; }\n.icon-jfi-view-list:before { content: \"\\F343\"; }\n.icon-jfi-zip:before { content: \"\\F344\"; }\n", ""]);

	// exports


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "jquery-filer.eot";

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "jquery-filer.woff";

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "jquery-filer.ttf";

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "jquery-filer.svg";

/***/ },
/* 16 */
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(18);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(16)(content, {});
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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(10)();
	// imports


	// module
	exports.push([module.id, "/*!\n * CSS jQuery.filer\n * Theme: DragDropBox\n * Copyright (c) 2015 CreativeDream\n * Version: 1.0.4 (29-Oct-2015)\n*/\n\n/*-------------------------\n\tInput\n-------------------------*/\n.jFiler-input-dragDrop {\n    display: block;\n    width: 343px;\n    margin: 0 auto 25px auto;\n    padding: 25px;\n    color: #8d9499;\n    color: #97A1A8;\n    background: #fff;\n    border: 2px dashed #C8CBCE;\n    text-align: center;\n    -webkit-transition: box-shadow 0.3s,\n                        border-color 0.3s;\n    -moz-transition: box-shadow 0.3s,\n                        border-color 0.3s;\n    transition: box-shadow 0.3s,\n                        border-color 0.3s;\n}\n\n.jFiler.dragged .jFiler-input-dragDrop {\n    border-color: #aaa;\n    box-shadow: inset 0 0 20px rgba(0,0,0,.08);\n}\n\n.jFiler.dragged .jFiler-input-dragDrop * {\n    pointer-events: none;\n}\n\n.jFiler.dragged .jFiler-input-icon {\n    -webkit-transform: rotate(180deg);\n    -ms-transform: rotate(180deg);\n    transform: rotate(180deg);\n}\n\n.jFiler.dragged .jFiler-input-text,\n.jFiler.dragged .jFiler-input-choose-btn {\n    filter: alpha(opacity=30);\n    opacity: 0.3;\n}\n\n.jFiler-input-dragDrop .jFiler-input-icon {\n    font-size: 48px;\n    margin-top: -10px;\n    -webkit-transition: all 0.3s ease;\n    -moz-transition: all 0.3s ease;\n    transition: all 0.3s ease;\n}\n\n.jFiler-input-text h3 {\n    margin: 0;\n    font-size: 18px;\n}\n\n.jFiler-input-text span {\n    font-size: 12px;\n}\n\n.jFiler-input-choose-btn {\n    display: inline-block;\n    padding: 8px 14px;\n    outline: none;\n    cursor: pointer;\n    text-decoration: none;\n    text-align: center;\n    white-space: nowrap;\n    font-size: 12px;\n    font-weight: bold;\n    color: #8d9496;\n    border-radius: 3px;\n    border: 1px solid #c6c6c6;\n    vertical-align: middle;\n    background-color: #fff;\n    box-shadow: 0px 1px 5px rgba(0,0,0,0.05);\n    -webkit-transition: all 0.2s;\n    -moz-transition: all 0.2s;\n    transition: all 0.2s;\n}\n\n.jFiler-input-choose-btn:hover,\n.jFiler-input-choose-btn:active {\n    color: inherit;\n}\n\n.jFiler-input-choose-btn:active {\n    background-color: #f5f5f5;\n}\n\n/* gray */\n.jFiler-input-choose-btn.gray {\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#fcfcfc),to(#f5f5f5));\n    background-image: -webkit-linear-gradient(top,#fcfcfc,#f5f5f5);\n    background-image: -o-linear-gradient(top,#fcfcfc,#f5f5f5);\n    background-image: linear-gradient(to bottom,#fcfcfc,#f5f5f5);\n    background-image: -moz-linear-gradient(top,#fcfcfc,#f5f5f5);\n}\n\n.jFiler-input-choose-btn.gray:hover {\n    filter: alpha(opacity=87);\n    opacity: 0.87;\n}\n\n.jFiler-input-choose-btn.gray:active {\n    background-color: #f5f5f5;\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#f5f5f5),to(#fcfcfc));\n    background-image: -webkit-linear-gradient(top,#f5f5f5,#fcfcfc);\n    background-image: -o-linear-gradient(top,#f5f5f5,#fcfcfc);\n    background-image: linear-gradient(to bottom,#f5f5f5,#fcfcfc);\n    background-image: -moz-linear-gradient(top,#f5f5f5,#fcfcfc);\n}\n\n/* blue */\n.jFiler-input-choose-btn.blue {\n    color: #008BFF;\n    border: 1px solid #008BFF;\n}\n\n.jFiler-input-choose-btn.blue:hover {\n    background: #008BFF;\n}\n\n.jFiler-input-choose-btn.blue:active {\n    background: #008BFF;\n}\n\n/* green */\n.jFiler-input-choose-btn.green {\n    color: #27ae60;\n    border: 1px solid #27ae60;\n}\n\n.jFiler-input-choose-btn.green:hover {\n    background: #27ae60;\n}\n\n.jFiler-input-choose-btn.green:active {\n    background: #27ae60;\n}\n\n/* red */\n.jFiler-input-choose-btn.red {\n    color: #ed5a5a;\n    border: 1px solid #ed5a5a;\n}\n\n.jFiler-input-choose-btn.red:hover {\n    background: #ed5a5a;\n}\n\n.jFiler-input-choose-btn.red:active {\n    background: #E05252;\n}\n\n/* black */\n.jFiler-input-choose-btn.black {\n    color: #555;\n    border: 1px solid #555;\n}\n\n.jFiler-input-choose-btn.black:hover {\n    background: #555;\n}\n\n.jFiler-input-choose-btn.black:active {\n    background: #333;\n}\n\n.jFiler-input-choose-btn.blue:hover,\n.jFiler-input-choose-btn.green:hover,\n.jFiler-input-choose-btn.red:hover,\n.jFiler-input-choose-btn.black:hover {\n    border-color: transparent;\n    color: #fff;\n}\n\n.jFiler-input-choose-btn.blue:active,\n.jFiler-input-choose-btn.green:active,\n.jFiler-input-choose-btn.red:active,\n.jFiler-input-choose-btn.black:active {\n    border-color: transparent;\n    color: #fff;\n    filter: alpha(opacity=87);\n    opacity: 0.87;\n}", ""]);

	// exports


/***/ },
/* 19 */
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

/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";var _typeof2=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};var monkey= /******/function(modules){ // webpackBootstrap
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

/***/ }
/******/ ]);