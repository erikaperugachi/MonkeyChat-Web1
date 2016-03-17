var monkeyUI =
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
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _MUIUser = __webpack_require__(14);

	var _MUIUser2 = _interopRequireDefault(_MUIUser);

	var _MUIConversation = __webpack_require__(15);

	var _MUIConversation2 = _interopRequireDefault(_MUIConversation);

	var _MUIMessage = __webpack_require__(16);

	var _MUIMessage2 = _interopRequireDefault(_MUIMessage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	__webpack_require__(17);

	__webpack_require__(19);

	__webpack_require__(30);

	__webpack_require__(32);
	__webpack_require__(33);
	__webpack_require__(42);
	//require('msr/MediaStreamRecorder.js');

	//require('./src/jquery.knob.min.js');

	// =================
	// MUI*.js
	window.MUIUser = _MUIUser2.default;
	window.MUIConversation = _MUIConversation2.default;
	window.MUIMessage = _MUIMessage2.default;

	// =================
	// MediaStreamRecorder.js
	var MediaStreamRecorder = __webpack_require__(44).MediaStreamRecorder;
	window.StereoRecorder = __webpack_require__(44).StereoRecorder;

	// =================
	// ffmpegWorker.js
	var Worker = __webpack_require__(45);

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
	    this.wrapperOut = '.wrapper-out';
	    this.wrapperIn = '.wrapper-in';
	    this.contentConnection = '#content-connection';
	    this.contentApp = '#content-app';
	    this.contentConversationList = '#conversation-list';
	    this.contentConversationWindow = '#conversation-window';
	    this.contentIntroApp = '#app-intro';
	    this.user;

	    var FULLSCREEN = 'fullscreen';
	    var CLASSIC = 'classic';
	    var INLINE, SIDEBAR;

	    var FULLSIZE = 'fullsize';
	    var PARTIALSIZE = 'partialsize';

	    var TAB = 'tab';
	    var ICON = 'icon';

	    var STANDARD = 'standard';
	    var KNOB = 'knob';

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
	    this.screen.data.openButton = TAB;
	    this.audio = {};
	    this.audio.type = KNOB;
	    this.form = false;
	    this.login = false;

	    this.setChat = function (conf) {
	        monkeyUI.isConversationList = conf.showConversationList == undefined ? true : conf.showConversationList;
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
	            monkeyUI.screen.data.openButton = conf.screen.data.openButton == undefined ? TAB : conf.screen.data.openButton;
	        }
	        monkeyUI.screen.data.width = conf.screen.data.width;
	        monkeyUI.screen.data.height = conf.screen.data.height;
	        monkeyUI.audio.type = conf.audio.type == undefined ? STANDARD : conf.audio.type;
	        monkeyUI.form = conf.form == undefined ? false : conf.form;
	    };

	    this.drawScene = function () {

	        var e = document.createElement("link");
	        e.href = "http://cdn.criptext.com/MonkeyUI/styles/chat1.css", e.type = "text/css", e.rel = "stylesheet", document.getElementsByTagName("head")[0].appendChild(e);

	        if ($('.wrapper-out').length <= 0) {
	            var _scene = '';
	            if (this.screen.data.width != undefined && this.screen.data.height != undefined) {
	                _scene += '<div class="wrapper-out ' + this.screen.data.mode + ' ' + this.screen.type + '" style="width: ' + this.screen.data.width + '; height:30px;">';
	            } else {
	                _scene += '<div class="wrapper-out ' + this.screen.data.mode + ' ' + this.screen.type + '">';
	            }
	            if (this.screen.type == CLASSIC) {
	                _scene += '<div class="tab">' + '<span class="tablabel"> Want to know more? </span>' + '<div id="w-max" class="appear"></div>' + '<div id="w-min" class="disappear"></div>' + '</div>';
	            } else if (this.screen.type == SIDEBAR) {
	                _scene += '<div class="circle-icon">' + '<div id="w-open" class="appear"></div>' + '</div>';
	            }
	            _scene += '<div class="wrapper-in">' + '<div id="content-connection"></div>' + '<div id="content-app" class="disappear">';
	            if (this.isConversationList) {
	                _scene += '<aside>' + '<ul id="conversation-list" class=""></ul>' + '</aside>';
	            }
	            var _class = this.isConversationList ? 'conversation-with' : 'conversation-only';
	            _scene += '<section id="conversation-window" class="' + _class + '">' + '</section>' + '</div>' + '</div>' + '</div>';
	            $('body').append(_scene);
	            drawLoading(this.contentConnection);
	        } else {
	            $('.wrapper-out').addClass(this.screen.data.mode);
	        }
	        initOptionsOutWindow(this.screen.data.height, this.form);
	        drawHeaderUserSession(this.contentApp + ' aside');
	        drawContentConversation(this.contentConversationWindow, this.screen.type);
	        drawInput(this.contentConversationWindow, this.input);
	        monkeyUI.stopLoading();
	    };

	    function initOptionsOutWindow(height, isForm) {
	        $("#w-max").click(function () {
	            $('.wrapper-out').height(height);
	            if (isForm && !monkeyUI.getLogin()) {
	                $("#w-min").removeClass('disappear');
	                $("#w-min").addClass('appear');
	                $("#w-max").removeClass('appear');
	                $("#w-max").addClass('disappear');
	            } else if (!isForm && !monkeyUI.getLogin()) {
	                $(monkeyUI).trigger('quickStart');
	            } else if (monkeyUI.getLogin()) {
	                monkeyUI.disappearOptionsOutWindow();
	            }
	        });
	        $("#w-min").click(function () {
	            $('.wrapper-out').height($('.tab').height());
	            $("#w-min").addClass('disappear');
	            $("#w-min").removeClass('appear');
	            $("#w-max").addClass('appear');
	            $("#w-max").removeClass('disappear');
	        });
	    }

	    function initOptionInWindow() {
	        $("#w-min-in").click(function () {
	            $('.wrapper-out').height($('.tab').height());
	            $('.tab').addClass('appear');
	            $('.tab').removeClass('disappear');

	            $("#w-min").addClass('disappear');
	            $("#w-min").removeClass('appear');
	            $("#w-max").addClass('appear');
	            $("#w-max").removeClass('disappear');
	        });
	    }

	    this.disappearOptionsOutWindow = function () {
	        $('.tab').addClass('disappear');
	        $('.wrapper-out').removeClass('classic');
	    };

	    this.getLogin = function () {
	        return this.login;
	    };

	    function drawLoading(contentConnection) {
	        var _html = '<div class="spinner">' + '<div class="bounce1"></div>' + '<div class="bounce2"></div>' + '<div class="bounce3"></div>' + '</div>';
	        $(contentConnection).prepend(_html);
	    }

	    function drawHeaderUserSession(content) {
	        var _html = '<header id="session-header">' + '<div id="session-image">' + '<img src="">' + '</div>' + '<div id="session-description">' + '<span id="session-name"></span>' + '</div>' + '</header>';
	        $(content).prepend(_html);
	    }

	    function drawContentConversation(content, screenType) {
	        var _html = '<div id="app-intro"><div></div></div>' + '<header id="conversation-selected-header">' + '<div id="conversation-selected-image">' + '<img src="">' + '</div>' + '<div id="conversation-selected-description">' + '<span id="conversation-selected-name"></span>' + '<span id="conversation-selected-status"></span>' + '</div>';
	        if (screenType == CLASSIC || screenType == SIDEBAR) {
	            _html += '<div class="content-options">' + '<div id="w-min-in"></div>' + '<div id="w-close"></div>' + '</div>';
	        }
	        _html += '</header>' + '<div id="chat-timeline"></div>';
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
	        $(this.contentConnection).removeClass('appear');
	        $(this.contentConnection).addClass('disappear');
	    };

	    this.startLoading = function () {
	        $(this.contentConnection).removeClass('disappear');
	        $(this.contentConnection).addClass('appear');
	    };

	    this.loadDataScreen = function (user) {
	        this.user = user;
	        detectFuntionality();

	        // set contentApp
	        $(this.contentApp).removeClass('disappear');

	        // set user info
	        $("#session-name").html(this.user.name);
	        $('#session-image img').attr('src', this.user.urlAvatar);
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

	        var _html = '<div id="chat-input">' + '<div id="divider-chat-input"></div>';
	        if (input.isAttachButton) {
	            _html += '<div class="button-input">' + '<button id="button-attach" class="button-icon"></button>' + '<input type="file" name="attach" id="attach-file" style="display:none" accept=".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx, image/*">' + '</div>'; //+
	            //'<div class="' + monkeyUI.screen.data.mode + ' jFiler-input-dragDrop" style="width:'+dd_width+'; height:'+dd_height+';"><div class="jFiler-input-inner"><div class="jFiler-input-icon"><i class="icon-jfi-cloud-up-o"></i></div><div class="jFiler-input-text"><h3>Drop files here</h3></div></div></div>';
	        }

	        if (input.isAudioButton) {
	            _html += '<div class="button-input">' + '<button id="button-cancel-audio" class="button-icon"></button>' + '</div>';
	        }

	        _html += '<textarea id="message-text-input" class="textarea-input" placeholder="Write a secure message"></textarea>';

	        if (input.isAudioButton) {
	            _html += '<div id="record-area" class="disappear">' + '<div class="record-preview-area">' + '<div id="button-action-record">' + '<button id="button-start-record" class="blink"></button>' + '</div>' + '<div id="time-recorder"><span id="minutes">00</span><span>:</span><span id="seconds">00</span></div>' + '</div>' + '</div>';
	        }

	        if (input.isSendButton) {
	            _html += '<div class="button-input">' + '<button id="button-send-message" class="button-icon"></button>' + '</div>';
	        }

	        if (input.isAudioButton) {
	            _html += '<div class="button-input">' + '<button id="button-record-audio" class="button-icon"></button>' + '</div>';
	        }

	        if (input.isEphemeralButton) {
	            _html += '<div class="button-input">' + '<button id="button-send-ephemeral" class="button-icon timer_icon"></button>' + '</div>';
	        }

	        _html += '<div class="signature">Powered by <a class="signature-link" target="_blank" href="http://criptext.com/">Criptext</a></div></div>';
	        $(content).append(_html);
	        initInputFunctionality();
	    }

	    this.showChatInput = function () {
	        $('#button-action-record button').hide();
	        $('#button-action-record button').attr('onclick', '');
	        $('#button-start-record').show();
	        $('#record-area').removeClass("appear");
	        $('#record-area').addClass("disappear");
	        $('#button-attach').parent().removeClass("disappear");
	        $('#button-cancel-audio').parent().addClass("disappear");
	        $('#button-record-audio').parent().removeClass("disappear");
	        $('#button-send-message').parent().addClass("disappear");
	        $('#button-record-audio').parent().removeClass("disappear");
	        $('#button-send-ephemeral').removeClass('enable_timer');
	        $("#minutes").html('00');
	        $("#seconds").html('00');
	        $("#message-text-input").removeClass("disappear");
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
	        minutesLabel = document.getElementById("minutes");
	        secondsLabel = document.getElementById("seconds");

	        // mp3 converter
	        ffmpegWorker = getFFMPEGWorker();

	        inputEvent();
	    }

	    function inputEvent() {
	        $('#message-text-input').keydown(function (event) {
	            var charCode = window.event ? event.which : event.keyCode;

	            if (charCode == 8 || charCode == 46) {
	                if ($('#button-send-message').is(':visible') && $(this).val().trim().length <= 1) {
	                    $('#button-record-audio').parent().removeClass("disappear");
	                    $('#button-send-message').parent().addClass("disappear");
	                    $('#button-send-ephemeral').removeClass('enable_timer');
	                }
	            } else if (charCode == 13) {
	                if (event.shiftKey === true) {
	                    return true;
	                } else {
	                    var _messageText = $('#message-text-input').val().trim();
	                    $(monkeyUI).trigger('textMessage', _messageText);
	                    $('#message-text-input').val("");
	                    monkeyUI.showChatInput();
	                    return false;
	                }
	            } else {
	                if (!$('#button-send-message').is(':visible')) {
	                    $('#button-record-audio').parent().addClass("disappear");
	                    $('#button-send-message').parent().removeClass("disappear");
	                    $('#button-send-ephemeral').addClass('enable_timer');
	                    typeMessageToSend = 0;
	                }
	            }
	        });

	        $('#button-send-message').click(function () {
	            switch (typeMessageToSend) {
	                case 0:
	                    var _messageText = $('#message-text-input').val().trim();
	                    $(monkeyUI).trigger('textMessage', _messageText);
	                    $('#message-text-input').val("");
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
	                    //$('#preview-image').remove();
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

	        $("#button-attach").click(function () {
	            $("#attach-file").trigger('click');
	        });

	        $('#attach-file').on('change', function (e) {
	            //showChatInputFile();
	            catchUpFile(e.target.files[0]);
	        });

	        $('#button-record-audio').click(function () {
	            showChatInputRecord();
	            startRecordAudio();
	        });

	        $('#button-cancel-audio').click(function () {
	            monkeyUI.showChatInput();

	            var audio = document.getElementById('audio_' + timestampPrev);
	            if (audio != null) audio.pause();
	            mediaRecorder = null;
	        });

	        // $("#attach-file").filer({
	        //     limit: null,
	        //     maxSize: null,
	        //     extensions: null,
	        //     changeInput: '<div class="chat-drop-zone" ></div>',
	        //     showThumbs: true,
	        //     theme: "dragdropbox",
	        //     dragDrop: {
	        //         dragEnter: function () {
	        //             console.log('file entered');
	        //             $('.jFiler-input-dragDrop').show();
	        //         },
	        //         dragLeave: function () {
	        //             console.log('file entered');
	        //             $('.chat-drop-zone').hide();
	        //             $('.jFiler-input-dragDrop').hide();
	        //         },
	        //         drop: function () {
	        //             console.log('file entered');
	        //             $('.chat-drop-zone').hide();
	        //             $('.jFiler-input-dragDrop').hide();
	        //         },
	        //     },
	        //     files: null,
	        //     addMore: false,
	        //     clipBoardPaste: true,
	        //     excludeName: null,
	        //     beforeRender: null,
	        //     afterRender: null,
	        //     beforeShow: null,
	        //     beforeSelect: null,
	        //     onSelect: function(obj) {
	        //         // showChatInputFile();
	        //         catchUpFile(obj)
	        //     },
	        //     afterShow: null,
	        //     onEmpty: null,
	        //     options: null,
	        //     captions: {
	        //         drop: "Drop file here to Upload"
	        //     }
	        // });
	    }

	    document.addEventListener("dragenter", function (event) {
	        // alert('ddd');
	        console.log('over document');
	        $(document).find('.chat-drop-zone').show();
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
	        // $("#chat-input").addClass('chat-input-file');
	        // $('#button-attach').parent().addClass("disappear");
	        // $('#button-record-audio').parent().addClass("disappear");
	        // $('#button-send-message').parent().removeClass("disappear");
	        // $('#button-send-ephemeral').addClass('enable_timer');
	    }

	    function hideChatInputFile() {
	        typeMessageToSend = -1;
	        $("#chat-input").removeClass('chat-input-file');
	        $('#button-attach').parent().removeClass("disappear");
	        $('#button-record-audio').parent().removeClass("disappear");
	        $('#button-send-message').parent().addClass("disappear");
	        $('#button-send-ephemeral').removeClass('enable_timer');
	    }

	    function showChatInputRecord() {
	        $('#record-area').removeClass("disappear");
	        $('#record-area').addClass("appear");
	        $('#button-cancel-audio').parent().removeClass("disappear");
	        $('#button-attach').parent().addClass("disappear");
	        $('#button-send-message').parent().removeClass("disappear");
	        $('#button-record-audio').parent().addClass("disappear");
	        $("#message-text-input").addClass("disappear");
	        minutesLabel = document.getElementById("minutes");
	        secondsLabel = document.getElementById("seconds");
	    }

	    function disabledAudioButton(bool) {
	        $('#button-record-audio').disabled = bool;
	        if (bool) {
	            $('#button-record-audio').parent().addClass("disabled");
	        } else {
	            $('#button-record-audio').parent().removeClass("disabled");
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
	            $(this.contentConversationWindow).addClass('disabled');

	            // set header conversation
	            //var conversationPhoto = isConversationGroup(this.id) ? _conversationIdHandling : users[this.id].id;
	            $('#conversation-selected-image img').attr('src', conversation.urlAvatar);
	            var conversationName = conversation.name ? conversation.name : 'undefined';
	            $('#conversation-selected-name').html(conversationName);
	            //$('#conversation-selected-members').html('');

	            // set conversation item
	            if (this.isConversationList) {
	                $(this.contentConversationList + ' li').removeClass('conversation-selected');
	                $(this.contentConversationList + ' li').addClass('conversation-unselected');
	                $('#conversation-' + _conversationIdHandling).removeClass('conversation-unselected');
	                $('#conversation-' + _conversationIdHandling).addClass('conversation-selected');
	                // (badge)
	                $('#conversation-' + _conversationIdHandling).find('.conversation-notification').remove();
	                removeNotification(_conversationIdHandling);
	            }

	            // set chat timeline
	            $('.chat-timeline-conversation').removeClass('appear');
	            $('.chat-timeline-conversation').addClass('disappear');
	            if ($('#chat-timeline-conversation-' + _conversationIdHandling).length > 0) {
	                $('#chat-timeline-conversation-' + _conversationIdHandling).removeClass('disappear');
	                $('#chat-timeline-conversation-' + _conversationIdHandling).addClass('appear');
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
	            $(this.contentConversationWindow).removeClass('disabled');
	        } else {
	            // set chat timeline
	            if ($('#chat-timeline-conversation-' + _conversationIdHandling).length <= 0) {
	                drawConversationWindow(conversation.id, isHidden);
	                if (this.isConversationList) {
	                    drawConversationItem(this.contentConversationList, conversation);
	                }
	            }
	        }
	    };

	    function drawConversationWindow(conversationId, isHidden) {
	        var _class = isHidden ? 'disappear' : 'appear';
	        $('#chat-timeline').append('<div class="chat-timeline-conversation ' + _class + '" id="chat-timeline-conversation-' + conversationId + '"></div>');
	    }

	    function drawConversationItem(contentConversationList, conversation) {

	        var _li = '<li id="conversation-' + conversation.id + '" class="conversation-unselected" onclick="openConversation(\'' + conversation.id + '\')">' + '<div class="conversation-image">' + '<img src="' + conversation.urlAvatar + '" onerror="imgError(this);">';
	        var _conversationName = conversation.name ? conversation.name : 'undefined';
	        _li += '</div>' + '<div class="conversation-description"><div class="conversation-name"><span class="ellipsify">' + _conversationName + '</span></div><div class="conversation-state"><span class="ellipsify">Click to open conversation</span></div></div>' + '</li>';
	        $(contentConversationList).append(_li);
	    }

	    this.updateDrawConversation = function (conversation) {
	        var _conversationLi = $('#conversation-' + conversation.id);
	        _conversationLi.find('img').attr('src', conversation.urlAvatar);
	        _conversationLi.find('.conversation-name span').html(conversation.name);
	    };

	    this.updateOnlineStatus = function (lastOpenApp, online) {
	        if (online == 0) {
	            currentConversationOnlineState = defineTime(lastOpenApp);
	            $('#conversation-selected-status').html('Last seen ' + defineTime(lastOpenApp));
	        } else {
	            currentConversationOnlineState = 'Online';
	            $('#conversation-selected-status').html('Online');
	        }
	    };

	    /***********************************************/
	    /************** STATE CONVERSATION *************/
	    /***********************************************/

	    function updateNotification(text, conversationId) {
	        var liConversation = $("#conversation-" + conversationId);

	        if (text.length >= 20) {
	            text = text.substr(0, 20);
	        }

	        liConversation.find('.conversation-state span').html(text);
	        setNotification(conversationId);

	        if ($('#chat-timeline-conversation-' + conversationId).hasClass('appear')) {
	            // counting notification existing badges

	            if (liConversation.find('.conversation-notification').length > 0) {
	                var num = parseInt(liConversation.find('.conversation-notification').first().find('.notification-amount').html());
	                num = num + 1;
	                liConversation.find('.conversation-notification').first().find('.notification-amount').html(num);
	            } else {
	                liConversation.prepend('<div class="conversation-notification"><div class="notification-amount">1</div></div>');
	            }
	        } else {
	            removeNotification(conversationId);
	        }
	    }

	    function setNotification(conversationId) {
	        var liConversation = $('#conversation' + conversationId);
	        liConversation.find('.conversation-description span').addClass('bold-text');
	    }

	    function removeNotification(conversationId) {
	        var liConversation = $("conversation-" + conversationId);
	        liConversation.find('.conversation-description span').removeClass('bold-text');
	    }

	    /***********************************************/
	    /****************** DRAW BUBBLES ***************/
	    /***********************************************/

	    function defineMessageStatus(status) {
	        switch (status) {
	            case 0:
	                return 'status-load';
	                break;
	            case 50:
	                return 'status-sent';
	                break;
	            case 51:
	                return 'status-sent';
	                break;
	            case 52:
	                return 'status-read';
	                break;
	            default:
	                return undefined;
	                break;
	        }
	    }

	    function baseBubble(message, isOutgoing, withName, status) {
	        var _bubble = '';
	        var _classBubble = isOutgoing ? 'bubble-out' : 'bubble-in';
	        var _classStatus = defineMessageStatus(status);

	        _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble ' + _classBubble + '">' + '<div class="message-detail">';
	        if (withName) {
	            var _senderName = message.senderName ? message.senderName : 'Unknown';
	            var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	            _bubble += '<span class="message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	        }
	        _bubble += '<span class="message-hour">' + defineTime(message.timestamp * 1000) + '</span>';
	        if (isOutgoing) {
	            _bubble += '<div class="message-status ' + _classStatus + '">';
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

	        $('#chat-timeline-conversation-' + _conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
	        var _classTypeBubble = _isOutgoing ? 'bubble-text-out' : 'bubble-text-in';
	        var _messagePoint = $('#' + message.id);
	        _messagePoint.addClass('bubble-text');
	        _messagePoint.addClass(_classTypeBubble);

	        var _content = '<span class="message-text">' + _messageText + '</span>';
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

	        $('#chat-timeline-conversation-' + _conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
	        var _classTypeBubble = _isOutgoing ? 'bubble-image-out' : 'bubble-image-in';
	        var _messagePoint = $('#' + message.id);
	        _messagePoint.addClass('bubble-image');
	        _messagePoint.addClass(_classTypeBubble);

	        var _content = '<div class="content-image" onclick="monkeyUI.showViewer(\'' + message.id + '\',\'' + _fileName + '\')">' + '<img src=' + _dataSource + '>' + '</div>';
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
	            _messagePoint.find('.content-audio-loading').remove();
	            _messagePoint = $('#' + message.id);
	        } else {
	            $('#chat-timeline-conversation-' + _conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
	            var _classTypeBubble = _isOutgoing ? 'bubble-audio-out' : 'bubble-audio-in';
	            _messagePoint = $('#' + message.id);
	            _messagePoint.addClass('bubble-audio');
	            _messagePoint.addClass(_classTypeBubble);
	        }

	        if (this.audio.type == 'knob') {
	            var _content = '<div class="content-audio disabled">' + '<img id="playAudioBubbleImg' + message.id + '" style="display:block;" onclick="monkeyUI.playAudioBubble(' + message.id + ');" class="bubble-audio-button bubble-audio-button' + message.id + ' playBubbleControl" src="../images/PlayBubble.png">' + '<img id="pauseAudioBubbleImg' + message.id + '" onclick="monkeyUI.pauseAudioBubble(' + message.id + ');" class="bubble-audio-button bubble-audio-button' + message.id + '" src="../images/PauseBubble.png">' + '<input id="play-player_' + message.id + '" class="knob second" data-width="100" data-displayPrevious=true value="0">' + '<div class="bubble-audio-timer"><span id="minutesBubble' + message.id + '">00</span><span>:</span><span id="secondsBubble' + message.id + '">00</span></div>' + '</div>' + '<audio id="audio_' + message.id + '" preload="auto" style="display:none;" controls="" src="' + _dataSource + '"></audio>';
	            _messagePoint.append(_content);

	            createAudiohandlerBubble(message.id, Math.round(message.length));
	            audiobuble = document.getElementById("audio_" + message.id);
	            audiobuble.oncanplay = function () {
	                createAudiohandlerBubble(message.id, Math.round(audiobuble.duration));
	                setDurationTime(message.id);
	                $('#' + message.id + ' .content-audio').removeClass('disabled');
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

	        $('#chat-timeline-conversation-' + _conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
	        var _classTypeBubble = _isOutgoing ? 'bubble-file-out' : 'bubble-file-in';
	        var _messagePoint = $('#' + message.id);
	        _messagePoint.addClass('bubble-file');
	        _messagePoint.addClass(_classTypeBubble);
	        var _content = '<div class="content-file">' + '<a class="file-icon-link" href="' + _dataSource + '" download="' + message.filename + '" >';

	        if (message.ext == 'doc' || message.ext == 'docx') {
	            _content += '<div class="file-icon-define icon-word"></div>';
	        } else if (message.ext == 'pdf') {
	            _content += '<div class="file-icon-define icon-pdf"></div>';
	        } else if (message.ext == 'xls' || message.ext == 'xlsx') {
	            _content += '<div class="file-icon-define xls-icon"></div>';
	        } else {
	            _content += '<div class="file-icon-define img-icon"></div>';
	        }
	        //_content += '<img class="icon-file-define" src="./images/xls-icon.png" alt="your image" />';
	        //_content += '<img class="icon-file-define" src="./images/ppt-icon.png" alt="your image" />';
	        _content += '</a>' + '<div class="file-detail">' + '<div class="file-name"><span class="ellipsify">' + message.filename + '</span></div>' + '<div class="file-size"><span class="ellipsify">' + message.filesize + ' bytes</span></div>' + '</div>' + '</div>';
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
	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble bubble-text bubble-text-in bubble-in">' + '<div class="message-detail">';
	                if (conversationId.indexOf("G:") >= 0) {
	                    var _senderName = message.senderName ? message.senderName : 'Unknown';
	                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	                }
	                _bubble += '<span class="message-hour">' + defineTime(message.timestamp * 1000) + '</span>' + '</div>' + '<span class="message-text">' + _messageText + '</span>' + '</div>' + '</div>';
	            } else {
	                var _duration = Math.round(message.length * 0.07);
	                if (_duration < 15) {
	                    _duration = 15;
	                }
	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble bubble-text bubble-text-in bubble-in bubble-private" onclick="showPrivateTextMessage(\'' + message.id + '\',\'' + message.senderId + '\',\'' + _duration + '\')">' + '<div class="message-detail">';
	                if (conversationId.indexOf("G:") >= 0) {
	                    var _senderName = message.senderName ? message.senderName : 'Unknown';
	                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	                }
	                _bubble += '<div class="message-content-timer">' + '<i class="fa fa-clock-o"></i>' + '<span class="message-timer"> ' + defineTimer(_duration) + '</span>' + '</div>' + '</div>' + '<span class="message-text">Click to read</span>' + '<div class="message-code">' + message.encryptedText + '</div>' + '</div>' + '</div>';
	            }
	        } else if (_isOutgoing == 1) {
	            // outgoing
	            if (message.eph == 0) {
	                var _status;
	                switch (status) {
	                    case 0:
	                        _status = 'status-load';
	                        break;
	                    case 51:
	                        _status = 'status-sent';
	                        break;
	                    case 52:
	                        _status = 'status-read';
	                        break;
	                    default:
	                        break;
	                }

	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble bubble-text bubble-text-out bubble-out' + (status == 0 ? 'sending' : '') + '">' + '<div class="message-detail">' + '<span class="message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="message-status ' + _status + '">';
	                if (status != 0) {
	                    _bubble += '<i class="fa fa-check"></i>';
	                }
	                _bubble += '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="message-text">' + _messageText + '</span>' + '</div>' + '</div>';
	            } else {
	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble bubble-text bubble-text-out bubble-out' + (status == 0 ? 'sending' : '') + '">' + '<div class="message-detail">' + '<span class="message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="message-status ' + _status + '">';
	                if (status != 0) {
	                    _bubble += '<i class="fa fa-check"></i>';
	                }
	                _bubble += '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="message-text">Private Message</span>' + '</div>' + '</div>';
	            }
	        }
	        $('#chat-timeline-conversation-' + _conversationIdHandling).append(_bubble);

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
	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble-image-in bubble-in">' + '<div class="message-detail">';
	                if (conversationId.indexOf("G:") >= 0) {
	                    var _senderName = message.senderName ? message.senderName : 'Unknown';
	                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	                }
	                _bubble += '<span class="message-hour">' + defineTime(message.timestamp * 1000) + '</span>' + '</div>' + '<div class="content-image" onclick="monkeyUI.showViewer(\'' + message.id + '\',\'' + _fileName + '\')">' + '<img src=' + _dataSource + '>' + '</div>' + '</div>' + '</div>';
	            } else {
	                var _duration = 15;

	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble-image-private-in bubble-in bubble-private" onclick="showPrivateViewer(\'' + message.id + '\',\'' + message.senderId + '\',\'' + _duration + '\',\'' + message.cmpr + '\',\'' + message.encr + '\')">' + '<div class="message-detail">';
	                if (conversationId.indexOf("G\\:") >= 0) {
	                    var _conversation = conversations[message.recipientId];
	                    var _classUnknown = users[message.senderId].id == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="message-user-name ' + _classUnknown + '" style="color: #' + colorUsers[_conversation.members.indexOf(message.senderId)] + '">' + users[message.senderId].name + '</span>';
	                }
	                _bubble += '<div class="message-content-timer">' + '<i class="fa fa-clock-o"></i>' + '<span class="message-timer"> ' + defineTimer(_duration) + '</span>' + '</div>' + '</div>' + '<div class="message-icon-define icon-image"></div>' + '<span class="message-text">Click to view</span>' + '<div class="message-code">' + message.encryptedText + '</div>' + '</div>' + '</div>';
	            }
	        } else if (_isOutgoing == 1) {
	            // outgoing
	            if (message.eph == 0) {
	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble-image-out bubble-out">' + '<div class="message-detail">' + '<span class="message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="message-status status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<div class="content-image" onclick="monkeyUI.showViewer(\'' + message.id + '\',\'' + _fileName + '\')">' + '<img src="' + _dataSource + '">' + '</div>' + '</div>' + '</div>';
	            } else {
	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble-text-out bubble-out sending">' + '<div class="message-detail">' + '<span class="message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="message-status status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="message-text">Private Image</span>' + '</div>' + '</div>';
	            }
	        }
	        $('#chat-timeline-conversation-' + _conversationIdHandling).append(_bubble);
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

	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble-audio-in bubble-in">' + '<div class="message-detail">';
	                if (conversationId.indexOf("G:") >= 0) {
	                    var _senderName = message.senderName ? message.senderName : 'Unknown';
	                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="message-user-name ' + _classUnknown + '" style="color: #' + message.senderColor + '">' + _senderName + '</span>';
	                }
	                _bubble += '<span class="message-hour">' + defineTime(message.timestamp * 1000) + '</span>' + '</div>' + '<div class="content-audio">' + '<img id="playAudioBubbleImg' + message.id + '" style="display:block;" onclick="monkeyUI.playAudioBubble(' + message.id + ');" class="bubble-audio-button bubble-audio-button' + message.id + ' playBubbleControl" src="../images/PlayBubble.png">' + '<img id="pauseAudioBubbleImg' + message.id + '" onclick="monkeyUI.pauseAudioBubble(' + message.id + ');" class="bubble-audio-button bubble-audio-button' + message.id + '" src="../images/PauseBubble.png">' + '<input id="play-player_' + message.id + '" class="knob second" data-width="100" data-displayPrevious=true value="0">' + '<div class="bubble-audio-timer"><span id="minutesBubble' + message.id + '">' + ("0" + parseInt(message.length / 60)).slice(-2) + '</span><span>:</span><span id="secondsBubble' + message.id + '">' + ("0" + message.length % 60).slice(-2) + '</span></div>' + '</div>';
	                var _dataSource = message.dataSource != undefined ? message.dataSource : '';
	                _bubble += '<audio id="audio_' + message.id + '" preload="auto" style="display:none;" controls="" src="' + _dataSource + '"></audio>' + '</div>' + '</div>';
	            } else {
	                var _duration = Math.round(message.length + message.length * 0.25);
	                if (_duration < 15) {
	                    _duration = 15;
	                }

	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble-audio-private-in bubble-in bubble-private" onclick="showPrivateAudioMessage(\'' + message.id + '\',\'' + message.senderId + '\',\'' + _duration + '\',\'' + message.cmpr + '\',\'' + message.encr + '\')">' + '<div class="message-detail">';
	                if (conversationId.indexOf("G\\:") >= 0) {
	                    var _conversation = conversations[message.recipientId];
	                    var _classUnknown = users[message.senderId].id == undefined ? 'user-unknown' : '';
	                    _bubble += '<span class="message-user-name ' + _classUnknown + '" style="color: #' + colorUsers[_conversation.members.indexOf(message.senderId)] + '">' + users[message.senderId].name + '</span>';
	                }
	                _bubble += '<div class="message-content-timer">' + '<i class="fa fa-clock-o"></i>' + '<span class="message-timer"> ' + defineTimer(_duration) + '</span>' + '</div>' + '</div>' + '<div class="message-icon-define icon-audio"></div>' + '<span class="message-text">Click to listen</span>' + '<div class="message-code">' + message.encryptedText + '</div>' + '</div>' + '</div>';
	            }
	        } else if (_isOutgoing == 1) {
	            // outgoing
	            if (message.eph == 0) {
	                if (messageOldId == undefined) {
	                    _bubble += '<div class="message-line">';
	                }
	                _bubble += '<div id="' + message.id + '" class="bubble-audio-out bubble-out">' + '<div class="message-detail">' + '<span class="message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="message-status status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<div class="content-audio">' + '<img id="playAudioBubbleImg' + message.id + '" style="display:block;" onclick="monkeyUI.playAudioBubble(' + message.id + ');" class="bubble-audio-button bubble-audio-button' + message.id + ' playBubbleControl" src="../images/PlayBubble.png">' + '<img id="pauseAudioBubbleImg' + message.id + '" onclick="monkeyUI.pauseAudioBubble(' + message.id + ');" class="bubble-audio-button bubble-audio-button' + message.id + '" src="../images/PauseBubble.png">' + '<input id="play-player_' + message.id + '" class="knob second" data-width="100" data-displayPrevious=true value="0">' + '<div class="bubble-audio-timer"><span id="minutesBubble' + message.id + '">00</span><span>:</span><span id="secondsBubble' + message.id + '">00</span></div>' + '</div>' + '<audio id="audio_' + message.id + '" preload="auto" style="display:none;" controls="" src="' + _dataSource + '"></audio>' + '</div>';
	                if (messageOldId == undefined) {
	                    _bubble += '</div>';
	                }
	            } else {
	                _bubble = '<div class="message-line">' + '<div id="' + message.id + '" class="bubble-text-out bubble-out sending">' + '<div class="message-detail">' + '<span class="message-hour">' + defineTime(message.timestamp) + '</span>' + '<div class="message-status status-load">' + '<div class="message-time" style="display: none;">' + message.timestamp + '</div>' + '</div>' + '</div>' + '<div class="button-message-unsend" onclick="unsendMessage(\'' + message.id + '\',\'' + conversationId + '\')">x</div>' + '<span class="message-text">Private audio</span>' + '</div>' + '</div>';
	            }
	        }

	        if (messageOldId != undefined) {
	            $('#' + messageOldId).parent().html(_bubble);
	        } else {
	            $('#chat-timeline-conversation-' + _conversationIdHandling).append(_bubble);
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
	                $('#' + messageId + ' .content-audio').removeClass('disabled');
	            };
	        }
	    };

	    function drawAudioMessageBubbleTemporal(dataSource, message, duration) {
	        $('#chat-timeline').find('.appear').append(baseBubble(message, 1, false, 0));
	        var _classTypeBubble = 'bubble-audio-out';
	        var _messagePoint = $('#' + message.id);
	        _messagePoint.addClass('bubble-audio');
	        _messagePoint.addClass(_classTypeBubble);

	        var _content = '<div class="content-audio-loading">' + '<div class="double-bounce1"></div>' + '<div class="double-bounce2"></div>' + '</div>';
	        _messagePoint.append(_content);
	        scrollToDown();
	    }

	    this.getMessageUnknown = function () {
	        return $('.user-unknown');
	    };

	    this.updateDataMessageBubble = function (messageId, data) {
	        var messagePoint = $('#' + messageId);
	        if (messagePoint.find('.content-image').length > 0) {
	            messagePoint.find('img').attr('src', data);
	        } else if (messagePoint.find('audio').length > 0) {
	            messagePoint.find('audio').attr('src', data);
	        } else if (messagePoint.find('.content-file').length > 0) {
	            messagePoint.find('.file-icon-link').attr('href', data);
	        }
	    };

	    /***********************************************/
	    /***************** STATE BUBBLE ****************/
	    /***********************************************/

	    this.updateStatusSentMessageBubble = function (messageOldId, messageNewId, status) {

	        var messagePoint = $('#' + messageOldId);

	        if (messageOldId != messageNewId && messagePoint.length > 0) {
	            messagePoint.attr('id', messageNewId);
	            // var _contentOnClick = messagePoint.find('.button-message-unsend').attr('onclick');
	            // var _conversationId = _contentOnClick.slice(29,_contentOnClick.length - 2);
	            // messagePoint.find('.button-message-unsend').attr({
	            //   onclick: "unsendMessage('"+messageNewId+"','"+_conversationId+"')"
	            // });
	        }
	        messagePoint = $('#' + messageNewId);

	        if (messagePoint.find('.content-image').length > 0) {
	            // image message
	            var _onClickAttribute = messagePoint.find('.content-image').attr('onclick');
	            _onClickAttribute = _onClickAttribute + "";
	            var params = _onClickAttribute.split(',');
	            var _fileName = params[1].substr(1, params[1].length - 3);
	            messagePoint.find('.content-image').attr({
	                onclick: "monkeyUI.showViewer('" + messageNewId + "','" + _fileName + "')"
	            });
	        }

	        messagePoint.find('.message-status').removeClass('status-load');
	        messagePoint.find('.message-status').removeClass('status-sent');

	        if (status == 52) {
	            messagePoint.find('.message-status').addClass('status-read');
	        } else if (status == 50 || status == 51) {
	            messagePoint.find('.message-status').addClass('status-sent');
	        }

	        if (messagePoint.find('.fa').length <= 0) {
	            messagePoint.find('.message-status').prepend('<i class="fa fa-check"></i>');
	        }
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
	        $('.bubble-audio-button' + timestamp).hide();
	        $('#pauseAudioBubbleImg' + timestamp).css('display', 'block');
	        minutesBubbleLabel = document.getElementById("minutesBubble" + timestamp);
	        secondsBubbleLabel = document.getElementById("secondsBubble" + timestamp);
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
	        $('.bubble-audio-button' + timestamp).hide();
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
	                    $('.bubble-audio-button').hide();
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
	        minutesBubbleLabel = document.getElementById("minutesBubble" + timestamp);
	        secondsBubbleLabel = document.getElementById("secondsBubble" + timestamp);
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
	        var _file = _messagePoint.find('.content-image img').attr('src');

	        var _html = '<div class="viewer-content">' + '<div class="viewer-toolbar">' + '<button id="button-exit" onclick="monkeyUI.exitViewer()"> X </button>' + '<a href="' + _file + '" download="' + fileName + '" >' + '<button class="button-download" title="Download">Download</button>' + '</a>' +
	        // '<a href="'+_file+'" >'+
	        '<button class="button-download" title="Download" onclick="monkeyUI.printFile()" >Print</button>' +
	        // '</a>'+
	        '</div>' + '<div id="file_viewer_image" class="viewer-image">' + '<img  src="' + _file + '">' + '</div>' + '<div class="brand-app"></div>' + '</div>';

	        $('.wrapper-out').append(_html);
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
	        $('.viewer-content').remove();
	    };

	    function generateDataFile() {
	        FileAPI.readAsDataURL(fileCaptured.file, function (evt) {
	            if (evt.type == 'load') {
	                fileCaptured.src = evt.result;
	                $('#button-send-message').click();
	            }
	        });
	    }

	    function showPreviewImage() {
	        // Optional to use: replace with generateDataFile()
	        var image_data = '';
	        FileAPI.readAsDataURL(fileCaptured.file, function (evt) {
	            if (evt.type == 'load') {
	                fileCaptured.src = evt.result;
	                var html = '<div id="preview-image">' + '<div class="preview-head">' + '<div class="preview-title">Preview</div> ' + '<div id="close-preview-image" class="preview-close" onclick="monkeyUI.closeImagePreview(this)">X</div>' + '</div>' + '<div class="preview-container">' + '<img id="image_preview" src="' + fileCaptured.src + '">' + '</div>' + '</div>';
	            }
	        });
	    }

	    this.closeImagePreview = function (obj) {
	        hideChatInputFile();
	        $(obj).parent().parent().remove();
	        $('#attach-file').val('');
	    };

	    function scrollToDown(container) {
	        $('#chat-timeline').animate({ scrollTop: 100000000 }, 400);
	    }

	    /***********************************************/
	    /***************** RECORD AUDIO ****************/
	    /***********************************************/

	    // starts the library to record audio
	    function startRecordAudio() {
	        if (mediaRecorder == null) {
	            $('#button-send-ephemeral').addClass('enable_timer');
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
	        var ffmpegWorker = new Worker();
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

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */
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
/* 15 */
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
/* 16 */
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
/* 17 */
/***/ function(module, exports, __webpack_require__) {

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
	    if (true) {
	        // CommonJS
	        module.exports = factory(__webpack_require__(18));
	    } else if (typeof define === 'function' && define.amd) {
	        // AMD. Register as an anonymous module.
	        define(['jquery'], factory);
	    } else {
	        // Browser globals
	        factory(jQuery);
	    }
	}(function ($) {

	    /**
	     * Kontrol library
	     */
	    "use strict";

	    /**
	     * Definition of globals and core
	     */
	    var k = {}, // kontrol
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
	            var cf = function (e, conf) {
	                var k;
	                for (k in conf) {
	                    s.o[k] = conf[k];
	                }
	                s._carve().init();
	                s._configure()
	                 ._draw();
	            };

	            if (this.$.data('kontroled')) return;
	            this.$.data('kontroled', true);

	            this.extend();
	            this.o = $.extend({
	                    // Config
	                    min: this.$.data('min') !== undefined ? this.$.data('min') : 0,
	                    max: this.$.data('max') !== undefined ? this.$.data('max') : 100,
	                    stopper: true,
	                    readOnly: this.$.data('readonly') || (this.$.attr('readonly') === 'readonly'),

	                    // UI
	                    cursor: this.$.data('cursor') === true && 30
	                            || this.$.data('cursor') || 0,
	                    thickness: this.$.data('thickness')
	                               && Math.max(Math.min(this.$.data('thickness'), 1), 0.01)
	                               || 0.35,
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
	                    format: function(v) {
	                        return v;
	                    },
	                    parse: function (v) {
	                        return parseFloat(v);
	                    }
	                }, this.o
	            );

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
	                this.i.each(function(k) {
	                    var $this = $(this);
	                    s.i[k] = $this;
	                    s.v[k] = s.o.parse($this.val());

	                    $this.bind(
	                        'change blur',
	                        function () {
	                            var val = {};
	                            val[k] = $this.val();
	                            s.val(s._validate(val));
	                        }
	                    );
	                });
	                this.$.find('legend').remove();
	            } else {

	                // input = integer
	                this.i = this.$;
	                this.v = this.o.parse(this.$.val());
	                this.v === '' && (this.v = this.o.min);
	                this.$.bind(
	                    'change blur',
	                    function () {
	                        s.val(s._validate(s.o.parse(s.$.val())));
	                    }
	                );

	            }

	            !this.o.displayInput && this.$.hide();

	            // adds needed DOM elements (canvas, div)
	            this.$c = $(document.createElement('canvas')).attr({
	                width: this.o.width,
	                height: this.o.height
	            });

	            // wraps all elements in a div
	            // add to DOM before Canvas init is triggered
	            this.$div = $('<div style="'
	                + (this.o.inline ? 'display:inline;' : '')
	                + 'width:' + this.o.width + 'px;height:' + this.o.height + 'px;'
	                + '"></div>');

	            this.$.wrap(this.$div).before(this.$c);
	            this.$div = this.$.parent();

	            if (typeof G_vmlCanvasManager !== 'undefined') {
	                G_vmlCanvasManager.initElement(this.$c[0]);
	            }

	            this.c = this.$c[0].getContext ? this.$c[0].getContext('2d') : null;

	            if (!this.c) {
	                throw {
	                    name:        "CanvasNotSupportedException",
	                    message:     "Canvas not supported. Please use excanvas on IE8.0.",
	                    toString:    function(){return this.name + ": " + this.message}
	                }
	            }

	            // hdpi support
	            this.scale = (window.devicePixelRatio || 1) / (
	                            this.c.webkitBackingStorePixelRatio ||
	                            this.c.mozBackingStorePixelRatio ||
	                            this.c.msBackingStorePixelRatio ||
	                            this.c.oBackingStorePixelRatio ||
	                            this.c.backingStorePixelRatio || 1
	                         );

	            // detects relative width / height
	            this.relativeWidth =  this.o.width % 1 !== 0
	                                  && this.o.width.indexOf('%');
	            this.relativeHeight = this.o.height % 1 !== 0
	                                  && this.o.height.indexOf('%');
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
	            this.$
	                .bind("configure", cf)
	                .parent()
	                .bind("configure", cf);

	            // finalize init
	            this._listen()
	                ._configure()
	                ._xy()
	                .init();

	            this.isInit = true;

	            this.$.val(this.o.format(this.v));
	            this._draw();

	            return this;
	        };

	        this._carve = function() {
	            if (this.relative) {
	                var w = this.relativeWidth ?
	                        this.$div.parent().width() *
	                        parseInt(this.o.width) / 100
	                        : this.$div.parent().width(),
	                    h = this.relativeHeight ?
	                        this.$div.parent().height() *
	                        parseInt(this.o.height) / 100
	                        : this.$div.parent().height();

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
	            var touchMove = function (e) {
	                var v = s.xy2val(
	                            e.originalEvent.touches[s.t].pageX,
	                            e.originalEvent.touches[s.t].pageY
	                        );

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
	            k.c.d
	                .bind("touchmove.k", touchMove)
	                .bind(
	                    "touchend.k",
	                    function () {
	                        k.c.d.unbind('touchmove.k touchend.k');
	                        s.val(s.cv);
	                    }
	                );

	            return this;
	        };

	        this._mouse = function (e) {
	            var mouseMove = function (e) {
	                var v = s.xy2val(e.pageX, e.pageY);

	                if (v == s.cv) return;

	                if (s.cH && (s.cH(v) === false)) return;

	                s.change(s._validate(v));
	                s._draw();
	            };

	            // First click
	            mouseMove(e);

	            // Mouse events listeners
	            k.c.d
	                .bind("mousemove.k", mouseMove)
	                .bind(
	                    // Escape key cancel current change
	                    "keyup.k",
	                    function (e) {
	                        if (e.keyCode === 27) {
	                            k.c.d.unbind("mouseup.k mousemove.k keyup.k");

	                            if (s.eH && s.eH() === false)
	                                return;

	                            s.cancel();
	                        }
	                    }
	                )
	                .bind(
	                    "mouseup.k",
	                    function (e) {
	                        k.c.d.unbind('mousemove.k mouseup.k keyup.k');
	                        s.val(s.cv);
	                    }
	                );

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
	                this.$c
	                    .bind(
	                        "mousedown",
	                        function (e) {
	                            e.preventDefault();
	                            s._xy()._mouse(e);
	                        }
	                    )
	                    .bind(
	                        "touchstart",
	                        function (e) {
	                            e.preventDefault();
	                            s._xy()._touch(e);
	                        }
	                    );

	                this.listen();
	            } else {
	                this.$.attr('readonly', 'readonly');
	            }

	            if (this.relative) {
	                $(window).resize(function() {
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
	            var val = (~~ (((v < 0) ? -0.5 : 0.5) + (v/this.o.step))) * this.o.step;
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
	        this.clear = function () { this._clear(); };

	        // Utils
	        this.h2rgba = function (h, a) {
	            var rgb;
	            h = h.substring(1,7);
	            rgb = [
	                parseInt(h.substring(0,2), 16),
	                parseInt(h.substring(2,4), 16),
	                parseInt(h.substring(4,6), 16)
	            ];

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
	        this.PI2 = 2*Math.PI;

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

	                if (triggerRelease !== false
	                    && v != this.v
	                    && this.rH
	                    && this.rH(v) === false) { return; }

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

	            a = Math.atan2(
	                        x - (this.x + this.w2),
	                        - (y - this.y - this.w2)
	                    ) - this.angleOffset;

	            if (this.o.flip) {
	                a = this.angleArc - a - this.PI2;
	            }

	            if (this.angleArc != this.PI2 && (a < 0) && (a > -0.5)) {

	                // if isset angleArc option, set to min if .5 under min
	                a = 0;
	            } else if (a < 0) {
	                a += this.PI2;
	            }

	            ret = (a * (this.o.max - this.o.min) / this.angleArc) + this.o.min;

	            this.o.stopper && (ret = max(min(ret, this.o.max), this.o.min));

	            return ret;
	        };

	        this.listen = function () {

	            // bind MouseWheel
	            var s = this, mwTimerStop,
	                mwTimerRelease,
	                mw = function (e) {
	                    e.preventDefault();

	                    var ori = e.originalEvent,
	                        deltaX = ori.detail || ori.wheelDeltaX,
	                        deltaY = ori.detail || ori.wheelDeltaY,
	                        v = s._validate(s.o.parse(s.$.val()))
	                            + (
	                                deltaX > 0 || deltaY > 0
	                                ? s.o.step
	                                : deltaX < 0 || deltaY < 0 ? -s.o.step : 0
	                              );

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
	                                if (mwTimerStop)
	                                    s.rH(v);
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

	            this.$
	                .bind(
	                    "keydown",
	                    function (e) {
	                        var kc = e.keyCode;

	                        // numpad support
	                        if (kc >= 96 && kc <= 105) {
	                            kc = e.keyCode = kc - 48;
	                        }

	                        kval = parseInt(String.fromCharCode(kc));

	                        if (isNaN(kval)) {
	                            (kc !== 13)                     // enter
	                            && kc !== 8                     // bs
	                            && kc !== 9                     // tab
	                            && kc !== 189                   // -
	                            && (kc !== 190
	                                || s.$.val().match(/\./))   // . allowed once
	                            && e.preventDefault();

	                            // arrows
	                            if ($.inArray(kc,[37,38,39,40]) > -1) {
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
	                    }
	                )
	                .bind(
	                    "keyup",
	                    function (e) {
	                        if (isNaN(kval)) {
	                            if (to) {
	                                window.clearTimeout(to);
	                                to = null;
	                                m = 1;
	                                s.val(s.$.val());
	                            }
	                        } else {
	                            // kval postcond
	                            (s.$.val() > s.o.max && s.$.val(s.o.max))
	                            || (s.$.val() < s.o.min && s.$.val(s.o.min));
	                        }
	                    }
	                );

	            this.$c.bind("mousewheel DOMMouseScroll", mw);
	            this.$.bind("mousewheel DOMMouseScroll", mw);
	        };

	        this.init = function () {
	            if (this.v < this.o.min
	                || this.v > this.o.max) { this.v = this.o.min; }

	            this.$.val(this.v);
	            this.w2 = this.w / 2;
	            this.cursorExt = this.o.cursor / 100;
	            this.xy = this.w2 * this.scale;
	            this.lineWidth = this.xy * this.o.thickness;
	            this.lineCap = this.o.lineCap;
	            this.radius = this.xy - this.lineWidth / 2;

	            this.o.angleOffset
	            && (this.o.angleOffset = isNaN(this.o.angleOffset) ? 0 : this.o.angleOffset);

	            this.o.angleArc
	            && (this.o.angleArc = isNaN(this.o.angleArc) ? this.PI2 : this.o.angleArc);

	            // deg to rad
	            this.angleOffset = this.o.angleOffset * Math.PI / 180;
	            this.angleArc = this.o.angleArc * Math.PI / 180;

	            // compute start and end angles
	            this.startAngle = 1.5 * Math.PI + this.angleOffset;
	            this.endAngle = 1.5 * Math.PI + this.angleOffset + this.angleArc;

	            var s = max(
	                String(Math.abs(this.o.max)).length,
	                String(Math.abs(this.o.min)).length,
	                2
	            ) + 2;

	            this.o.displayInput
	                && this.i.css({
	                        'width' : ((this.w / 2 + 4) >> 0) + 'px',
	                        'height' : ((this.w / 3) >> 0) + 'px',
	                        'position' : 'absolute',
	                        'vertical-align' : 'middle',
	                        'margin-top' : ((this.w / 3) >> 0) + 'px',
	                        'margin-left' : '-' + ((this.w * 3 / 4 + 2) >> 0) + 'px',
	                        'border' : 0,
	                        'background' : 'none',
	                        'font' : this.o.fontWeight + ' ' + ((this.w / s) >> 0) + 'px ' + this.o.font,
	                        'text-align' : 'center',
	                        'color' : this.o.inputColor || this.o.fgColor,
	                        'padding' : '0px',
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
	          this.o.cursor
	              && (sa = ea - this.cursorExt)
	              && (ea = ea + this.cursorExt);

	          return {
	              s: sa,
	              e: ea,
	              d: this.o.flip && !this.o.cursor
	          };
	        };

	        this.draw = function () {
	            var c = this.g,                 // context
	                a = this.arc(this.cv),      // Arc
	                pa,                         // Previous arc
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
	            c.strokeStyle = r ? this.o.fgColor : this.fgColor ;
	            c.arc(this.xy, this.xy, this.radius, a.s, a.e, a.d);
	            c.stroke();
	        };

	        this.cancel = function () {
	            this.val(this.v);
	        };
	    };

	    $.fn.dial = $.fn.knob = function (o) {
	        return this.each(
	            function () {
	                var d = new k.Dial();
	                d.o = o;
	                d.$ = $(this);
	                d.run();
	            }
	        ).parent();
	    };

	}));


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v2.2.1
	 * http://jquery.com/
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-02-22T19:11Z
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
		version = "2.2.1",

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

			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}

			if ( obj.constructor &&
					!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}

			// If the function hasn't returned already, we're confident that
			// |obj| is a plain object, created by {} or constructed with new Object
			return true;
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

	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {
				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
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




	var rreturn = /\r/g;

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

					// Support: IE<11
					// option.value not trimmed (#14858)
					return jQuery.trim( elem.value );
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




	// Support: Safari 8+
	// In Safari 8 documents created via document.implementation.createHTMLDocument
	// collapse sibling forms: the second one becomes a child of the first one.
	// Because of that, this security measure has to be disabled in Safari 8.
	// https://bugs.webkit.org/show_bug.cgi?id=137337
	support.createHTMLDocument = ( function() {
		var body = document.implementation.createHTMLDocument( "" ).body;
		body.innerHTML = "<form></form><form></form>";
		return body.childNodes.length === 2;
	} )();


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

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		context = context || ( support.createHTMLDocument ?
			document.implementation.createHTMLDocument( "" ) :
			document );

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
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(20);


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(21);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(29)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./node_modules/css-loader/index.js!./../less-loader/index.js!./font-awesome-styles.loader.js!./font-awesome.config.js", function() {
				var newContent = require("!!./node_modules/css-loader/index.js!./../less-loader/index.js!./font-awesome-styles.loader.js!./font-awesome.config.js");
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

	exports = module.exports = __webpack_require__(22)();
	// imports


	// module
	exports.push([module.id, ".fa-border {\n  padding: .2em .25em .15em;\n  border: solid 0.08em #eee;\n  border-radius: .1em;\n}\n.fa-pull-left {\n  float: left;\n}\n.fa-pull-right {\n  float: right;\n}\n.fa.fa-pull-left {\n  margin-right: .3em;\n}\n.fa.fa-pull-right {\n  margin-left: .3em;\n}\n/* Deprecated as of 4.4.0 */\n.pull-right {\n  float: right;\n}\n.pull-left {\n  float: left;\n}\n.fa.pull-left {\n  margin-right: .3em;\n}\n.fa.pull-right {\n  margin-left: .3em;\n}\n.fa {\n  display: inline-block;\n  font: normal normal normal 14px/1 FontAwesome;\n  font-size: inherit;\n  text-rendering: auto;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n.fa-fw {\n  width: 1.28571429em;\n  text-align: center;\n}\n/* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen\n   readers do not read off random characters that represent icons */\n.fa-glass:before {\n  content: \"\\F000\";\n}\n.fa-music:before {\n  content: \"\\F001\";\n}\n.fa-search:before {\n  content: \"\\F002\";\n}\n.fa-envelope-o:before {\n  content: \"\\F003\";\n}\n.fa-heart:before {\n  content: \"\\F004\";\n}\n.fa-star:before {\n  content: \"\\F005\";\n}\n.fa-star-o:before {\n  content: \"\\F006\";\n}\n.fa-user:before {\n  content: \"\\F007\";\n}\n.fa-film:before {\n  content: \"\\F008\";\n}\n.fa-th-large:before {\n  content: \"\\F009\";\n}\n.fa-th:before {\n  content: \"\\F00A\";\n}\n.fa-th-list:before {\n  content: \"\\F00B\";\n}\n.fa-check:before {\n  content: \"\\F00C\";\n}\n.fa-remove:before,\n.fa-close:before,\n.fa-times:before {\n  content: \"\\F00D\";\n}\n.fa-search-plus:before {\n  content: \"\\F00E\";\n}\n.fa-search-minus:before {\n  content: \"\\F010\";\n}\n.fa-power-off:before {\n  content: \"\\F011\";\n}\n.fa-signal:before {\n  content: \"\\F012\";\n}\n.fa-gear:before,\n.fa-cog:before {\n  content: \"\\F013\";\n}\n.fa-trash-o:before {\n  content: \"\\F014\";\n}\n.fa-home:before {\n  content: \"\\F015\";\n}\n.fa-file-o:before {\n  content: \"\\F016\";\n}\n.fa-clock-o:before {\n  content: \"\\F017\";\n}\n.fa-road:before {\n  content: \"\\F018\";\n}\n.fa-download:before {\n  content: \"\\F019\";\n}\n.fa-arrow-circle-o-down:before {\n  content: \"\\F01A\";\n}\n.fa-arrow-circle-o-up:before {\n  content: \"\\F01B\";\n}\n.fa-inbox:before {\n  content: \"\\F01C\";\n}\n.fa-play-circle-o:before {\n  content: \"\\F01D\";\n}\n.fa-rotate-right:before,\n.fa-repeat:before {\n  content: \"\\F01E\";\n}\n.fa-refresh:before {\n  content: \"\\F021\";\n}\n.fa-list-alt:before {\n  content: \"\\F022\";\n}\n.fa-lock:before {\n  content: \"\\F023\";\n}\n.fa-flag:before {\n  content: \"\\F024\";\n}\n.fa-headphones:before {\n  content: \"\\F025\";\n}\n.fa-volume-off:before {\n  content: \"\\F026\";\n}\n.fa-volume-down:before {\n  content: \"\\F027\";\n}\n.fa-volume-up:before {\n  content: \"\\F028\";\n}\n.fa-qrcode:before {\n  content: \"\\F029\";\n}\n.fa-barcode:before {\n  content: \"\\F02A\";\n}\n.fa-tag:before {\n  content: \"\\F02B\";\n}\n.fa-tags:before {\n  content: \"\\F02C\";\n}\n.fa-book:before {\n  content: \"\\F02D\";\n}\n.fa-bookmark:before {\n  content: \"\\F02E\";\n}\n.fa-print:before {\n  content: \"\\F02F\";\n}\n.fa-camera:before {\n  content: \"\\F030\";\n}\n.fa-font:before {\n  content: \"\\F031\";\n}\n.fa-bold:before {\n  content: \"\\F032\";\n}\n.fa-italic:before {\n  content: \"\\F033\";\n}\n.fa-text-height:before {\n  content: \"\\F034\";\n}\n.fa-text-width:before {\n  content: \"\\F035\";\n}\n.fa-align-left:before {\n  content: \"\\F036\";\n}\n.fa-align-center:before {\n  content: \"\\F037\";\n}\n.fa-align-right:before {\n  content: \"\\F038\";\n}\n.fa-align-justify:before {\n  content: \"\\F039\";\n}\n.fa-list:before {\n  content: \"\\F03A\";\n}\n.fa-dedent:before,\n.fa-outdent:before {\n  content: \"\\F03B\";\n}\n.fa-indent:before {\n  content: \"\\F03C\";\n}\n.fa-video-camera:before {\n  content: \"\\F03D\";\n}\n.fa-photo:before,\n.fa-image:before,\n.fa-picture-o:before {\n  content: \"\\F03E\";\n}\n.fa-pencil:before {\n  content: \"\\F040\";\n}\n.fa-map-marker:before {\n  content: \"\\F041\";\n}\n.fa-adjust:before {\n  content: \"\\F042\";\n}\n.fa-tint:before {\n  content: \"\\F043\";\n}\n.fa-edit:before,\n.fa-pencil-square-o:before {\n  content: \"\\F044\";\n}\n.fa-share-square-o:before {\n  content: \"\\F045\";\n}\n.fa-check-square-o:before {\n  content: \"\\F046\";\n}\n.fa-arrows:before {\n  content: \"\\F047\";\n}\n.fa-step-backward:before {\n  content: \"\\F048\";\n}\n.fa-fast-backward:before {\n  content: \"\\F049\";\n}\n.fa-backward:before {\n  content: \"\\F04A\";\n}\n.fa-play:before {\n  content: \"\\F04B\";\n}\n.fa-pause:before {\n  content: \"\\F04C\";\n}\n.fa-stop:before {\n  content: \"\\F04D\";\n}\n.fa-forward:before {\n  content: \"\\F04E\";\n}\n.fa-fast-forward:before {\n  content: \"\\F050\";\n}\n.fa-step-forward:before {\n  content: \"\\F051\";\n}\n.fa-eject:before {\n  content: \"\\F052\";\n}\n.fa-chevron-left:before {\n  content: \"\\F053\";\n}\n.fa-chevron-right:before {\n  content: \"\\F054\";\n}\n.fa-plus-circle:before {\n  content: \"\\F055\";\n}\n.fa-minus-circle:before {\n  content: \"\\F056\";\n}\n.fa-times-circle:before {\n  content: \"\\F057\";\n}\n.fa-check-circle:before {\n  content: \"\\F058\";\n}\n.fa-question-circle:before {\n  content: \"\\F059\";\n}\n.fa-info-circle:before {\n  content: \"\\F05A\";\n}\n.fa-crosshairs:before {\n  content: \"\\F05B\";\n}\n.fa-times-circle-o:before {\n  content: \"\\F05C\";\n}\n.fa-check-circle-o:before {\n  content: \"\\F05D\";\n}\n.fa-ban:before {\n  content: \"\\F05E\";\n}\n.fa-arrow-left:before {\n  content: \"\\F060\";\n}\n.fa-arrow-right:before {\n  content: \"\\F061\";\n}\n.fa-arrow-up:before {\n  content: \"\\F062\";\n}\n.fa-arrow-down:before {\n  content: \"\\F063\";\n}\n.fa-mail-forward:before,\n.fa-share:before {\n  content: \"\\F064\";\n}\n.fa-expand:before {\n  content: \"\\F065\";\n}\n.fa-compress:before {\n  content: \"\\F066\";\n}\n.fa-plus:before {\n  content: \"\\F067\";\n}\n.fa-minus:before {\n  content: \"\\F068\";\n}\n.fa-asterisk:before {\n  content: \"\\F069\";\n}\n.fa-exclamation-circle:before {\n  content: \"\\F06A\";\n}\n.fa-gift:before {\n  content: \"\\F06B\";\n}\n.fa-leaf:before {\n  content: \"\\F06C\";\n}\n.fa-fire:before {\n  content: \"\\F06D\";\n}\n.fa-eye:before {\n  content: \"\\F06E\";\n}\n.fa-eye-slash:before {\n  content: \"\\F070\";\n}\n.fa-warning:before,\n.fa-exclamation-triangle:before {\n  content: \"\\F071\";\n}\n.fa-plane:before {\n  content: \"\\F072\";\n}\n.fa-calendar:before {\n  content: \"\\F073\";\n}\n.fa-random:before {\n  content: \"\\F074\";\n}\n.fa-comment:before {\n  content: \"\\F075\";\n}\n.fa-magnet:before {\n  content: \"\\F076\";\n}\n.fa-chevron-up:before {\n  content: \"\\F077\";\n}\n.fa-chevron-down:before {\n  content: \"\\F078\";\n}\n.fa-retweet:before {\n  content: \"\\F079\";\n}\n.fa-shopping-cart:before {\n  content: \"\\F07A\";\n}\n.fa-folder:before {\n  content: \"\\F07B\";\n}\n.fa-folder-open:before {\n  content: \"\\F07C\";\n}\n.fa-arrows-v:before {\n  content: \"\\F07D\";\n}\n.fa-arrows-h:before {\n  content: \"\\F07E\";\n}\n.fa-bar-chart-o:before,\n.fa-bar-chart:before {\n  content: \"\\F080\";\n}\n.fa-twitter-square:before {\n  content: \"\\F081\";\n}\n.fa-facebook-square:before {\n  content: \"\\F082\";\n}\n.fa-camera-retro:before {\n  content: \"\\F083\";\n}\n.fa-key:before {\n  content: \"\\F084\";\n}\n.fa-gears:before,\n.fa-cogs:before {\n  content: \"\\F085\";\n}\n.fa-comments:before {\n  content: \"\\F086\";\n}\n.fa-thumbs-o-up:before {\n  content: \"\\F087\";\n}\n.fa-thumbs-o-down:before {\n  content: \"\\F088\";\n}\n.fa-star-half:before {\n  content: \"\\F089\";\n}\n.fa-heart-o:before {\n  content: \"\\F08A\";\n}\n.fa-sign-out:before {\n  content: \"\\F08B\";\n}\n.fa-linkedin-square:before {\n  content: \"\\F08C\";\n}\n.fa-thumb-tack:before {\n  content: \"\\F08D\";\n}\n.fa-external-link:before {\n  content: \"\\F08E\";\n}\n.fa-sign-in:before {\n  content: \"\\F090\";\n}\n.fa-trophy:before {\n  content: \"\\F091\";\n}\n.fa-github-square:before {\n  content: \"\\F092\";\n}\n.fa-upload:before {\n  content: \"\\F093\";\n}\n.fa-lemon-o:before {\n  content: \"\\F094\";\n}\n.fa-phone:before {\n  content: \"\\F095\";\n}\n.fa-square-o:before {\n  content: \"\\F096\";\n}\n.fa-bookmark-o:before {\n  content: \"\\F097\";\n}\n.fa-phone-square:before {\n  content: \"\\F098\";\n}\n.fa-twitter:before {\n  content: \"\\F099\";\n}\n.fa-facebook-f:before,\n.fa-facebook:before {\n  content: \"\\F09A\";\n}\n.fa-github:before {\n  content: \"\\F09B\";\n}\n.fa-unlock:before {\n  content: \"\\F09C\";\n}\n.fa-credit-card:before {\n  content: \"\\F09D\";\n}\n.fa-feed:before,\n.fa-rss:before {\n  content: \"\\F09E\";\n}\n.fa-hdd-o:before {\n  content: \"\\F0A0\";\n}\n.fa-bullhorn:before {\n  content: \"\\F0A1\";\n}\n.fa-bell:before {\n  content: \"\\F0F3\";\n}\n.fa-certificate:before {\n  content: \"\\F0A3\";\n}\n.fa-hand-o-right:before {\n  content: \"\\F0A4\";\n}\n.fa-hand-o-left:before {\n  content: \"\\F0A5\";\n}\n.fa-hand-o-up:before {\n  content: \"\\F0A6\";\n}\n.fa-hand-o-down:before {\n  content: \"\\F0A7\";\n}\n.fa-arrow-circle-left:before {\n  content: \"\\F0A8\";\n}\n.fa-arrow-circle-right:before {\n  content: \"\\F0A9\";\n}\n.fa-arrow-circle-up:before {\n  content: \"\\F0AA\";\n}\n.fa-arrow-circle-down:before {\n  content: \"\\F0AB\";\n}\n.fa-globe:before {\n  content: \"\\F0AC\";\n}\n.fa-wrench:before {\n  content: \"\\F0AD\";\n}\n.fa-tasks:before {\n  content: \"\\F0AE\";\n}\n.fa-filter:before {\n  content: \"\\F0B0\";\n}\n.fa-briefcase:before {\n  content: \"\\F0B1\";\n}\n.fa-arrows-alt:before {\n  content: \"\\F0B2\";\n}\n.fa-group:before,\n.fa-users:before {\n  content: \"\\F0C0\";\n}\n.fa-chain:before,\n.fa-link:before {\n  content: \"\\F0C1\";\n}\n.fa-cloud:before {\n  content: \"\\F0C2\";\n}\n.fa-flask:before {\n  content: \"\\F0C3\";\n}\n.fa-cut:before,\n.fa-scissors:before {\n  content: \"\\F0C4\";\n}\n.fa-copy:before,\n.fa-files-o:before {\n  content: \"\\F0C5\";\n}\n.fa-paperclip:before {\n  content: \"\\F0C6\";\n}\n.fa-save:before,\n.fa-floppy-o:before {\n  content: \"\\F0C7\";\n}\n.fa-square:before {\n  content: \"\\F0C8\";\n}\n.fa-navicon:before,\n.fa-reorder:before,\n.fa-bars:before {\n  content: \"\\F0C9\";\n}\n.fa-list-ul:before {\n  content: \"\\F0CA\";\n}\n.fa-list-ol:before {\n  content: \"\\F0CB\";\n}\n.fa-strikethrough:before {\n  content: \"\\F0CC\";\n}\n.fa-underline:before {\n  content: \"\\F0CD\";\n}\n.fa-table:before {\n  content: \"\\F0CE\";\n}\n.fa-magic:before {\n  content: \"\\F0D0\";\n}\n.fa-truck:before {\n  content: \"\\F0D1\";\n}\n.fa-pinterest:before {\n  content: \"\\F0D2\";\n}\n.fa-pinterest-square:before {\n  content: \"\\F0D3\";\n}\n.fa-google-plus-square:before {\n  content: \"\\F0D4\";\n}\n.fa-google-plus:before {\n  content: \"\\F0D5\";\n}\n.fa-money:before {\n  content: \"\\F0D6\";\n}\n.fa-caret-down:before {\n  content: \"\\F0D7\";\n}\n.fa-caret-up:before {\n  content: \"\\F0D8\";\n}\n.fa-caret-left:before {\n  content: \"\\F0D9\";\n}\n.fa-caret-right:before {\n  content: \"\\F0DA\";\n}\n.fa-columns:before {\n  content: \"\\F0DB\";\n}\n.fa-unsorted:before,\n.fa-sort:before {\n  content: \"\\F0DC\";\n}\n.fa-sort-down:before,\n.fa-sort-desc:before {\n  content: \"\\F0DD\";\n}\n.fa-sort-up:before,\n.fa-sort-asc:before {\n  content: \"\\F0DE\";\n}\n.fa-envelope:before {\n  content: \"\\F0E0\";\n}\n.fa-linkedin:before {\n  content: \"\\F0E1\";\n}\n.fa-rotate-left:before,\n.fa-undo:before {\n  content: \"\\F0E2\";\n}\n.fa-legal:before,\n.fa-gavel:before {\n  content: \"\\F0E3\";\n}\n.fa-dashboard:before,\n.fa-tachometer:before {\n  content: \"\\F0E4\";\n}\n.fa-comment-o:before {\n  content: \"\\F0E5\";\n}\n.fa-comments-o:before {\n  content: \"\\F0E6\";\n}\n.fa-flash:before,\n.fa-bolt:before {\n  content: \"\\F0E7\";\n}\n.fa-sitemap:before {\n  content: \"\\F0E8\";\n}\n.fa-umbrella:before {\n  content: \"\\F0E9\";\n}\n.fa-paste:before,\n.fa-clipboard:before {\n  content: \"\\F0EA\";\n}\n.fa-lightbulb-o:before {\n  content: \"\\F0EB\";\n}\n.fa-exchange:before {\n  content: \"\\F0EC\";\n}\n.fa-cloud-download:before {\n  content: \"\\F0ED\";\n}\n.fa-cloud-upload:before {\n  content: \"\\F0EE\";\n}\n.fa-user-md:before {\n  content: \"\\F0F0\";\n}\n.fa-stethoscope:before {\n  content: \"\\F0F1\";\n}\n.fa-suitcase:before {\n  content: \"\\F0F2\";\n}\n.fa-bell-o:before {\n  content: \"\\F0A2\";\n}\n.fa-coffee:before {\n  content: \"\\F0F4\";\n}\n.fa-cutlery:before {\n  content: \"\\F0F5\";\n}\n.fa-file-text-o:before {\n  content: \"\\F0F6\";\n}\n.fa-building-o:before {\n  content: \"\\F0F7\";\n}\n.fa-hospital-o:before {\n  content: \"\\F0F8\";\n}\n.fa-ambulance:before {\n  content: \"\\F0F9\";\n}\n.fa-medkit:before {\n  content: \"\\F0FA\";\n}\n.fa-fighter-jet:before {\n  content: \"\\F0FB\";\n}\n.fa-beer:before {\n  content: \"\\F0FC\";\n}\n.fa-h-square:before {\n  content: \"\\F0FD\";\n}\n.fa-plus-square:before {\n  content: \"\\F0FE\";\n}\n.fa-angle-double-left:before {\n  content: \"\\F100\";\n}\n.fa-angle-double-right:before {\n  content: \"\\F101\";\n}\n.fa-angle-double-up:before {\n  content: \"\\F102\";\n}\n.fa-angle-double-down:before {\n  content: \"\\F103\";\n}\n.fa-angle-left:before {\n  content: \"\\F104\";\n}\n.fa-angle-right:before {\n  content: \"\\F105\";\n}\n.fa-angle-up:before {\n  content: \"\\F106\";\n}\n.fa-angle-down:before {\n  content: \"\\F107\";\n}\n.fa-desktop:before {\n  content: \"\\F108\";\n}\n.fa-laptop:before {\n  content: \"\\F109\";\n}\n.fa-tablet:before {\n  content: \"\\F10A\";\n}\n.fa-mobile-phone:before,\n.fa-mobile:before {\n  content: \"\\F10B\";\n}\n.fa-circle-o:before {\n  content: \"\\F10C\";\n}\n.fa-quote-left:before {\n  content: \"\\F10D\";\n}\n.fa-quote-right:before {\n  content: \"\\F10E\";\n}\n.fa-spinner:before {\n  content: \"\\F110\";\n}\n.fa-circle:before {\n  content: \"\\F111\";\n}\n.fa-mail-reply:before,\n.fa-reply:before {\n  content: \"\\F112\";\n}\n.fa-github-alt:before {\n  content: \"\\F113\";\n}\n.fa-folder-o:before {\n  content: \"\\F114\";\n}\n.fa-folder-open-o:before {\n  content: \"\\F115\";\n}\n.fa-smile-o:before {\n  content: \"\\F118\";\n}\n.fa-frown-o:before {\n  content: \"\\F119\";\n}\n.fa-meh-o:before {\n  content: \"\\F11A\";\n}\n.fa-gamepad:before {\n  content: \"\\F11B\";\n}\n.fa-keyboard-o:before {\n  content: \"\\F11C\";\n}\n.fa-flag-o:before {\n  content: \"\\F11D\";\n}\n.fa-flag-checkered:before {\n  content: \"\\F11E\";\n}\n.fa-terminal:before {\n  content: \"\\F120\";\n}\n.fa-code:before {\n  content: \"\\F121\";\n}\n.fa-mail-reply-all:before,\n.fa-reply-all:before {\n  content: \"\\F122\";\n}\n.fa-star-half-empty:before,\n.fa-star-half-full:before,\n.fa-star-half-o:before {\n  content: \"\\F123\";\n}\n.fa-location-arrow:before {\n  content: \"\\F124\";\n}\n.fa-crop:before {\n  content: \"\\F125\";\n}\n.fa-code-fork:before {\n  content: \"\\F126\";\n}\n.fa-unlink:before,\n.fa-chain-broken:before {\n  content: \"\\F127\";\n}\n.fa-question:before {\n  content: \"\\F128\";\n}\n.fa-info:before {\n  content: \"\\F129\";\n}\n.fa-exclamation:before {\n  content: \"\\F12A\";\n}\n.fa-superscript:before {\n  content: \"\\F12B\";\n}\n.fa-subscript:before {\n  content: \"\\F12C\";\n}\n.fa-eraser:before {\n  content: \"\\F12D\";\n}\n.fa-puzzle-piece:before {\n  content: \"\\F12E\";\n}\n.fa-microphone:before {\n  content: \"\\F130\";\n}\n.fa-microphone-slash:before {\n  content: \"\\F131\";\n}\n.fa-shield:before {\n  content: \"\\F132\";\n}\n.fa-calendar-o:before {\n  content: \"\\F133\";\n}\n.fa-fire-extinguisher:before {\n  content: \"\\F134\";\n}\n.fa-rocket:before {\n  content: \"\\F135\";\n}\n.fa-maxcdn:before {\n  content: \"\\F136\";\n}\n.fa-chevron-circle-left:before {\n  content: \"\\F137\";\n}\n.fa-chevron-circle-right:before {\n  content: \"\\F138\";\n}\n.fa-chevron-circle-up:before {\n  content: \"\\F139\";\n}\n.fa-chevron-circle-down:before {\n  content: \"\\F13A\";\n}\n.fa-html5:before {\n  content: \"\\F13B\";\n}\n.fa-css3:before {\n  content: \"\\F13C\";\n}\n.fa-anchor:before {\n  content: \"\\F13D\";\n}\n.fa-unlock-alt:before {\n  content: \"\\F13E\";\n}\n.fa-bullseye:before {\n  content: \"\\F140\";\n}\n.fa-ellipsis-h:before {\n  content: \"\\F141\";\n}\n.fa-ellipsis-v:before {\n  content: \"\\F142\";\n}\n.fa-rss-square:before {\n  content: \"\\F143\";\n}\n.fa-play-circle:before {\n  content: \"\\F144\";\n}\n.fa-ticket:before {\n  content: \"\\F145\";\n}\n.fa-minus-square:before {\n  content: \"\\F146\";\n}\n.fa-minus-square-o:before {\n  content: \"\\F147\";\n}\n.fa-level-up:before {\n  content: \"\\F148\";\n}\n.fa-level-down:before {\n  content: \"\\F149\";\n}\n.fa-check-square:before {\n  content: \"\\F14A\";\n}\n.fa-pencil-square:before {\n  content: \"\\F14B\";\n}\n.fa-external-link-square:before {\n  content: \"\\F14C\";\n}\n.fa-share-square:before {\n  content: \"\\F14D\";\n}\n.fa-compass:before {\n  content: \"\\F14E\";\n}\n.fa-toggle-down:before,\n.fa-caret-square-o-down:before {\n  content: \"\\F150\";\n}\n.fa-toggle-up:before,\n.fa-caret-square-o-up:before {\n  content: \"\\F151\";\n}\n.fa-toggle-right:before,\n.fa-caret-square-o-right:before {\n  content: \"\\F152\";\n}\n.fa-euro:before,\n.fa-eur:before {\n  content: \"\\F153\";\n}\n.fa-gbp:before {\n  content: \"\\F154\";\n}\n.fa-dollar:before,\n.fa-usd:before {\n  content: \"\\F155\";\n}\n.fa-rupee:before,\n.fa-inr:before {\n  content: \"\\F156\";\n}\n.fa-cny:before,\n.fa-rmb:before,\n.fa-yen:before,\n.fa-jpy:before {\n  content: \"\\F157\";\n}\n.fa-ruble:before,\n.fa-rouble:before,\n.fa-rub:before {\n  content: \"\\F158\";\n}\n.fa-won:before,\n.fa-krw:before {\n  content: \"\\F159\";\n}\n.fa-bitcoin:before,\n.fa-btc:before {\n  content: \"\\F15A\";\n}\n.fa-file:before {\n  content: \"\\F15B\";\n}\n.fa-file-text:before {\n  content: \"\\F15C\";\n}\n.fa-sort-alpha-asc:before {\n  content: \"\\F15D\";\n}\n.fa-sort-alpha-desc:before {\n  content: \"\\F15E\";\n}\n.fa-sort-amount-asc:before {\n  content: \"\\F160\";\n}\n.fa-sort-amount-desc:before {\n  content: \"\\F161\";\n}\n.fa-sort-numeric-asc:before {\n  content: \"\\F162\";\n}\n.fa-sort-numeric-desc:before {\n  content: \"\\F163\";\n}\n.fa-thumbs-up:before {\n  content: \"\\F164\";\n}\n.fa-thumbs-down:before {\n  content: \"\\F165\";\n}\n.fa-youtube-square:before {\n  content: \"\\F166\";\n}\n.fa-youtube:before {\n  content: \"\\F167\";\n}\n.fa-xing:before {\n  content: \"\\F168\";\n}\n.fa-xing-square:before {\n  content: \"\\F169\";\n}\n.fa-youtube-play:before {\n  content: \"\\F16A\";\n}\n.fa-dropbox:before {\n  content: \"\\F16B\";\n}\n.fa-stack-overflow:before {\n  content: \"\\F16C\";\n}\n.fa-instagram:before {\n  content: \"\\F16D\";\n}\n.fa-flickr:before {\n  content: \"\\F16E\";\n}\n.fa-adn:before {\n  content: \"\\F170\";\n}\n.fa-bitbucket:before {\n  content: \"\\F171\";\n}\n.fa-bitbucket-square:before {\n  content: \"\\F172\";\n}\n.fa-tumblr:before {\n  content: \"\\F173\";\n}\n.fa-tumblr-square:before {\n  content: \"\\F174\";\n}\n.fa-long-arrow-down:before {\n  content: \"\\F175\";\n}\n.fa-long-arrow-up:before {\n  content: \"\\F176\";\n}\n.fa-long-arrow-left:before {\n  content: \"\\F177\";\n}\n.fa-long-arrow-right:before {\n  content: \"\\F178\";\n}\n.fa-apple:before {\n  content: \"\\F179\";\n}\n.fa-windows:before {\n  content: \"\\F17A\";\n}\n.fa-android:before {\n  content: \"\\F17B\";\n}\n.fa-linux:before {\n  content: \"\\F17C\";\n}\n.fa-dribbble:before {\n  content: \"\\F17D\";\n}\n.fa-skype:before {\n  content: \"\\F17E\";\n}\n.fa-foursquare:before {\n  content: \"\\F180\";\n}\n.fa-trello:before {\n  content: \"\\F181\";\n}\n.fa-female:before {\n  content: \"\\F182\";\n}\n.fa-male:before {\n  content: \"\\F183\";\n}\n.fa-gittip:before,\n.fa-gratipay:before {\n  content: \"\\F184\";\n}\n.fa-sun-o:before {\n  content: \"\\F185\";\n}\n.fa-moon-o:before {\n  content: \"\\F186\";\n}\n.fa-archive:before {\n  content: \"\\F187\";\n}\n.fa-bug:before {\n  content: \"\\F188\";\n}\n.fa-vk:before {\n  content: \"\\F189\";\n}\n.fa-weibo:before {\n  content: \"\\F18A\";\n}\n.fa-renren:before {\n  content: \"\\F18B\";\n}\n.fa-pagelines:before {\n  content: \"\\F18C\";\n}\n.fa-stack-exchange:before {\n  content: \"\\F18D\";\n}\n.fa-arrow-circle-o-right:before {\n  content: \"\\F18E\";\n}\n.fa-arrow-circle-o-left:before {\n  content: \"\\F190\";\n}\n.fa-toggle-left:before,\n.fa-caret-square-o-left:before {\n  content: \"\\F191\";\n}\n.fa-dot-circle-o:before {\n  content: \"\\F192\";\n}\n.fa-wheelchair:before {\n  content: \"\\F193\";\n}\n.fa-vimeo-square:before {\n  content: \"\\F194\";\n}\n.fa-turkish-lira:before,\n.fa-try:before {\n  content: \"\\F195\";\n}\n.fa-plus-square-o:before {\n  content: \"\\F196\";\n}\n.fa-space-shuttle:before {\n  content: \"\\F197\";\n}\n.fa-slack:before {\n  content: \"\\F198\";\n}\n.fa-envelope-square:before {\n  content: \"\\F199\";\n}\n.fa-wordpress:before {\n  content: \"\\F19A\";\n}\n.fa-openid:before {\n  content: \"\\F19B\";\n}\n.fa-institution:before,\n.fa-bank:before,\n.fa-university:before {\n  content: \"\\F19C\";\n}\n.fa-mortar-board:before,\n.fa-graduation-cap:before {\n  content: \"\\F19D\";\n}\n.fa-yahoo:before {\n  content: \"\\F19E\";\n}\n.fa-google:before {\n  content: \"\\F1A0\";\n}\n.fa-reddit:before {\n  content: \"\\F1A1\";\n}\n.fa-reddit-square:before {\n  content: \"\\F1A2\";\n}\n.fa-stumbleupon-circle:before {\n  content: \"\\F1A3\";\n}\n.fa-stumbleupon:before {\n  content: \"\\F1A4\";\n}\n.fa-delicious:before {\n  content: \"\\F1A5\";\n}\n.fa-digg:before {\n  content: \"\\F1A6\";\n}\n.fa-pied-piper:before {\n  content: \"\\F1A7\";\n}\n.fa-pied-piper-alt:before {\n  content: \"\\F1A8\";\n}\n.fa-drupal:before {\n  content: \"\\F1A9\";\n}\n.fa-joomla:before {\n  content: \"\\F1AA\";\n}\n.fa-language:before {\n  content: \"\\F1AB\";\n}\n.fa-fax:before {\n  content: \"\\F1AC\";\n}\n.fa-building:before {\n  content: \"\\F1AD\";\n}\n.fa-child:before {\n  content: \"\\F1AE\";\n}\n.fa-paw:before {\n  content: \"\\F1B0\";\n}\n.fa-spoon:before {\n  content: \"\\F1B1\";\n}\n.fa-cube:before {\n  content: \"\\F1B2\";\n}\n.fa-cubes:before {\n  content: \"\\F1B3\";\n}\n.fa-behance:before {\n  content: \"\\F1B4\";\n}\n.fa-behance-square:before {\n  content: \"\\F1B5\";\n}\n.fa-steam:before {\n  content: \"\\F1B6\";\n}\n.fa-steam-square:before {\n  content: \"\\F1B7\";\n}\n.fa-recycle:before {\n  content: \"\\F1B8\";\n}\n.fa-automobile:before,\n.fa-car:before {\n  content: \"\\F1B9\";\n}\n.fa-cab:before,\n.fa-taxi:before {\n  content: \"\\F1BA\";\n}\n.fa-tree:before {\n  content: \"\\F1BB\";\n}\n.fa-spotify:before {\n  content: \"\\F1BC\";\n}\n.fa-deviantart:before {\n  content: \"\\F1BD\";\n}\n.fa-soundcloud:before {\n  content: \"\\F1BE\";\n}\n.fa-database:before {\n  content: \"\\F1C0\";\n}\n.fa-file-pdf-o:before {\n  content: \"\\F1C1\";\n}\n.fa-file-word-o:before {\n  content: \"\\F1C2\";\n}\n.fa-file-excel-o:before {\n  content: \"\\F1C3\";\n}\n.fa-file-powerpoint-o:before {\n  content: \"\\F1C4\";\n}\n.fa-file-photo-o:before,\n.fa-file-picture-o:before,\n.fa-file-image-o:before {\n  content: \"\\F1C5\";\n}\n.fa-file-zip-o:before,\n.fa-file-archive-o:before {\n  content: \"\\F1C6\";\n}\n.fa-file-sound-o:before,\n.fa-file-audio-o:before {\n  content: \"\\F1C7\";\n}\n.fa-file-movie-o:before,\n.fa-file-video-o:before {\n  content: \"\\F1C8\";\n}\n.fa-file-code-o:before {\n  content: \"\\F1C9\";\n}\n.fa-vine:before {\n  content: \"\\F1CA\";\n}\n.fa-codepen:before {\n  content: \"\\F1CB\";\n}\n.fa-jsfiddle:before {\n  content: \"\\F1CC\";\n}\n.fa-life-bouy:before,\n.fa-life-buoy:before,\n.fa-life-saver:before,\n.fa-support:before,\n.fa-life-ring:before {\n  content: \"\\F1CD\";\n}\n.fa-circle-o-notch:before {\n  content: \"\\F1CE\";\n}\n.fa-ra:before,\n.fa-rebel:before {\n  content: \"\\F1D0\";\n}\n.fa-ge:before,\n.fa-empire:before {\n  content: \"\\F1D1\";\n}\n.fa-git-square:before {\n  content: \"\\F1D2\";\n}\n.fa-git:before {\n  content: \"\\F1D3\";\n}\n.fa-y-combinator-square:before,\n.fa-yc-square:before,\n.fa-hacker-news:before {\n  content: \"\\F1D4\";\n}\n.fa-tencent-weibo:before {\n  content: \"\\F1D5\";\n}\n.fa-qq:before {\n  content: \"\\F1D6\";\n}\n.fa-wechat:before,\n.fa-weixin:before {\n  content: \"\\F1D7\";\n}\n.fa-send:before,\n.fa-paper-plane:before {\n  content: \"\\F1D8\";\n}\n.fa-send-o:before,\n.fa-paper-plane-o:before {\n  content: \"\\F1D9\";\n}\n.fa-history:before {\n  content: \"\\F1DA\";\n}\n.fa-circle-thin:before {\n  content: \"\\F1DB\";\n}\n.fa-header:before {\n  content: \"\\F1DC\";\n}\n.fa-paragraph:before {\n  content: \"\\F1DD\";\n}\n.fa-sliders:before {\n  content: \"\\F1DE\";\n}\n.fa-share-alt:before {\n  content: \"\\F1E0\";\n}\n.fa-share-alt-square:before {\n  content: \"\\F1E1\";\n}\n.fa-bomb:before {\n  content: \"\\F1E2\";\n}\n.fa-soccer-ball-o:before,\n.fa-futbol-o:before {\n  content: \"\\F1E3\";\n}\n.fa-tty:before {\n  content: \"\\F1E4\";\n}\n.fa-binoculars:before {\n  content: \"\\F1E5\";\n}\n.fa-plug:before {\n  content: \"\\F1E6\";\n}\n.fa-slideshare:before {\n  content: \"\\F1E7\";\n}\n.fa-twitch:before {\n  content: \"\\F1E8\";\n}\n.fa-yelp:before {\n  content: \"\\F1E9\";\n}\n.fa-newspaper-o:before {\n  content: \"\\F1EA\";\n}\n.fa-wifi:before {\n  content: \"\\F1EB\";\n}\n.fa-calculator:before {\n  content: \"\\F1EC\";\n}\n.fa-paypal:before {\n  content: \"\\F1ED\";\n}\n.fa-google-wallet:before {\n  content: \"\\F1EE\";\n}\n.fa-cc-visa:before {\n  content: \"\\F1F0\";\n}\n.fa-cc-mastercard:before {\n  content: \"\\F1F1\";\n}\n.fa-cc-discover:before {\n  content: \"\\F1F2\";\n}\n.fa-cc-amex:before {\n  content: \"\\F1F3\";\n}\n.fa-cc-paypal:before {\n  content: \"\\F1F4\";\n}\n.fa-cc-stripe:before {\n  content: \"\\F1F5\";\n}\n.fa-bell-slash:before {\n  content: \"\\F1F6\";\n}\n.fa-bell-slash-o:before {\n  content: \"\\F1F7\";\n}\n.fa-trash:before {\n  content: \"\\F1F8\";\n}\n.fa-copyright:before {\n  content: \"\\F1F9\";\n}\n.fa-at:before {\n  content: \"\\F1FA\";\n}\n.fa-eyedropper:before {\n  content: \"\\F1FB\";\n}\n.fa-paint-brush:before {\n  content: \"\\F1FC\";\n}\n.fa-birthday-cake:before {\n  content: \"\\F1FD\";\n}\n.fa-area-chart:before {\n  content: \"\\F1FE\";\n}\n.fa-pie-chart:before {\n  content: \"\\F200\";\n}\n.fa-line-chart:before {\n  content: \"\\F201\";\n}\n.fa-lastfm:before {\n  content: \"\\F202\";\n}\n.fa-lastfm-square:before {\n  content: \"\\F203\";\n}\n.fa-toggle-off:before {\n  content: \"\\F204\";\n}\n.fa-toggle-on:before {\n  content: \"\\F205\";\n}\n.fa-bicycle:before {\n  content: \"\\F206\";\n}\n.fa-bus:before {\n  content: \"\\F207\";\n}\n.fa-ioxhost:before {\n  content: \"\\F208\";\n}\n.fa-angellist:before {\n  content: \"\\F209\";\n}\n.fa-cc:before {\n  content: \"\\F20A\";\n}\n.fa-shekel:before,\n.fa-sheqel:before,\n.fa-ils:before {\n  content: \"\\F20B\";\n}\n.fa-meanpath:before {\n  content: \"\\F20C\";\n}\n.fa-buysellads:before {\n  content: \"\\F20D\";\n}\n.fa-connectdevelop:before {\n  content: \"\\F20E\";\n}\n.fa-dashcube:before {\n  content: \"\\F210\";\n}\n.fa-forumbee:before {\n  content: \"\\F211\";\n}\n.fa-leanpub:before {\n  content: \"\\F212\";\n}\n.fa-sellsy:before {\n  content: \"\\F213\";\n}\n.fa-shirtsinbulk:before {\n  content: \"\\F214\";\n}\n.fa-simplybuilt:before {\n  content: \"\\F215\";\n}\n.fa-skyatlas:before {\n  content: \"\\F216\";\n}\n.fa-cart-plus:before {\n  content: \"\\F217\";\n}\n.fa-cart-arrow-down:before {\n  content: \"\\F218\";\n}\n.fa-diamond:before {\n  content: \"\\F219\";\n}\n.fa-ship:before {\n  content: \"\\F21A\";\n}\n.fa-user-secret:before {\n  content: \"\\F21B\";\n}\n.fa-motorcycle:before {\n  content: \"\\F21C\";\n}\n.fa-street-view:before {\n  content: \"\\F21D\";\n}\n.fa-heartbeat:before {\n  content: \"\\F21E\";\n}\n.fa-venus:before {\n  content: \"\\F221\";\n}\n.fa-mars:before {\n  content: \"\\F222\";\n}\n.fa-mercury:before {\n  content: \"\\F223\";\n}\n.fa-intersex:before,\n.fa-transgender:before {\n  content: \"\\F224\";\n}\n.fa-transgender-alt:before {\n  content: \"\\F225\";\n}\n.fa-venus-double:before {\n  content: \"\\F226\";\n}\n.fa-mars-double:before {\n  content: \"\\F227\";\n}\n.fa-venus-mars:before {\n  content: \"\\F228\";\n}\n.fa-mars-stroke:before {\n  content: \"\\F229\";\n}\n.fa-mars-stroke-v:before {\n  content: \"\\F22A\";\n}\n.fa-mars-stroke-h:before {\n  content: \"\\F22B\";\n}\n.fa-neuter:before {\n  content: \"\\F22C\";\n}\n.fa-genderless:before {\n  content: \"\\F22D\";\n}\n.fa-facebook-official:before {\n  content: \"\\F230\";\n}\n.fa-pinterest-p:before {\n  content: \"\\F231\";\n}\n.fa-whatsapp:before {\n  content: \"\\F232\";\n}\n.fa-server:before {\n  content: \"\\F233\";\n}\n.fa-user-plus:before {\n  content: \"\\F234\";\n}\n.fa-user-times:before {\n  content: \"\\F235\";\n}\n.fa-hotel:before,\n.fa-bed:before {\n  content: \"\\F236\";\n}\n.fa-viacoin:before {\n  content: \"\\F237\";\n}\n.fa-train:before {\n  content: \"\\F238\";\n}\n.fa-subway:before {\n  content: \"\\F239\";\n}\n.fa-medium:before {\n  content: \"\\F23A\";\n}\n.fa-yc:before,\n.fa-y-combinator:before {\n  content: \"\\F23B\";\n}\n.fa-optin-monster:before {\n  content: \"\\F23C\";\n}\n.fa-opencart:before {\n  content: \"\\F23D\";\n}\n.fa-expeditedssl:before {\n  content: \"\\F23E\";\n}\n.fa-battery-4:before,\n.fa-battery-full:before {\n  content: \"\\F240\";\n}\n.fa-battery-3:before,\n.fa-battery-three-quarters:before {\n  content: \"\\F241\";\n}\n.fa-battery-2:before,\n.fa-battery-half:before {\n  content: \"\\F242\";\n}\n.fa-battery-1:before,\n.fa-battery-quarter:before {\n  content: \"\\F243\";\n}\n.fa-battery-0:before,\n.fa-battery-empty:before {\n  content: \"\\F244\";\n}\n.fa-mouse-pointer:before {\n  content: \"\\F245\";\n}\n.fa-i-cursor:before {\n  content: \"\\F246\";\n}\n.fa-object-group:before {\n  content: \"\\F247\";\n}\n.fa-object-ungroup:before {\n  content: \"\\F248\";\n}\n.fa-sticky-note:before {\n  content: \"\\F249\";\n}\n.fa-sticky-note-o:before {\n  content: \"\\F24A\";\n}\n.fa-cc-jcb:before {\n  content: \"\\F24B\";\n}\n.fa-cc-diners-club:before {\n  content: \"\\F24C\";\n}\n.fa-clone:before {\n  content: \"\\F24D\";\n}\n.fa-balance-scale:before {\n  content: \"\\F24E\";\n}\n.fa-hourglass-o:before {\n  content: \"\\F250\";\n}\n.fa-hourglass-1:before,\n.fa-hourglass-start:before {\n  content: \"\\F251\";\n}\n.fa-hourglass-2:before,\n.fa-hourglass-half:before {\n  content: \"\\F252\";\n}\n.fa-hourglass-3:before,\n.fa-hourglass-end:before {\n  content: \"\\F253\";\n}\n.fa-hourglass:before {\n  content: \"\\F254\";\n}\n.fa-hand-grab-o:before,\n.fa-hand-rock-o:before {\n  content: \"\\F255\";\n}\n.fa-hand-stop-o:before,\n.fa-hand-paper-o:before {\n  content: \"\\F256\";\n}\n.fa-hand-scissors-o:before {\n  content: \"\\F257\";\n}\n.fa-hand-lizard-o:before {\n  content: \"\\F258\";\n}\n.fa-hand-spock-o:before {\n  content: \"\\F259\";\n}\n.fa-hand-pointer-o:before {\n  content: \"\\F25A\";\n}\n.fa-hand-peace-o:before {\n  content: \"\\F25B\";\n}\n.fa-trademark:before {\n  content: \"\\F25C\";\n}\n.fa-registered:before {\n  content: \"\\F25D\";\n}\n.fa-creative-commons:before {\n  content: \"\\F25E\";\n}\n.fa-gg:before {\n  content: \"\\F260\";\n}\n.fa-gg-circle:before {\n  content: \"\\F261\";\n}\n.fa-tripadvisor:before {\n  content: \"\\F262\";\n}\n.fa-odnoklassniki:before {\n  content: \"\\F263\";\n}\n.fa-odnoklassniki-square:before {\n  content: \"\\F264\";\n}\n.fa-get-pocket:before {\n  content: \"\\F265\";\n}\n.fa-wikipedia-w:before {\n  content: \"\\F266\";\n}\n.fa-safari:before {\n  content: \"\\F267\";\n}\n.fa-chrome:before {\n  content: \"\\F268\";\n}\n.fa-firefox:before {\n  content: \"\\F269\";\n}\n.fa-opera:before {\n  content: \"\\F26A\";\n}\n.fa-internet-explorer:before {\n  content: \"\\F26B\";\n}\n.fa-tv:before,\n.fa-television:before {\n  content: \"\\F26C\";\n}\n.fa-contao:before {\n  content: \"\\F26D\";\n}\n.fa-500px:before {\n  content: \"\\F26E\";\n}\n.fa-amazon:before {\n  content: \"\\F270\";\n}\n.fa-calendar-plus-o:before {\n  content: \"\\F271\";\n}\n.fa-calendar-minus-o:before {\n  content: \"\\F272\";\n}\n.fa-calendar-times-o:before {\n  content: \"\\F273\";\n}\n.fa-calendar-check-o:before {\n  content: \"\\F274\";\n}\n.fa-industry:before {\n  content: \"\\F275\";\n}\n.fa-map-pin:before {\n  content: \"\\F276\";\n}\n.fa-map-signs:before {\n  content: \"\\F277\";\n}\n.fa-map-o:before {\n  content: \"\\F278\";\n}\n.fa-map:before {\n  content: \"\\F279\";\n}\n.fa-commenting:before {\n  content: \"\\F27A\";\n}\n.fa-commenting-o:before {\n  content: \"\\F27B\";\n}\n.fa-houzz:before {\n  content: \"\\F27C\";\n}\n.fa-vimeo:before {\n  content: \"\\F27D\";\n}\n.fa-black-tie:before {\n  content: \"\\F27E\";\n}\n.fa-fonticons:before {\n  content: \"\\F280\";\n}\n.fa-reddit-alien:before {\n  content: \"\\F281\";\n}\n.fa-edge:before {\n  content: \"\\F282\";\n}\n.fa-credit-card-alt:before {\n  content: \"\\F283\";\n}\n.fa-codiepie:before {\n  content: \"\\F284\";\n}\n.fa-modx:before {\n  content: \"\\F285\";\n}\n.fa-fort-awesome:before {\n  content: \"\\F286\";\n}\n.fa-usb:before {\n  content: \"\\F287\";\n}\n.fa-product-hunt:before {\n  content: \"\\F288\";\n}\n.fa-mixcloud:before {\n  content: \"\\F289\";\n}\n.fa-scribd:before {\n  content: \"\\F28A\";\n}\n.fa-pause-circle:before {\n  content: \"\\F28B\";\n}\n.fa-pause-circle-o:before {\n  content: \"\\F28C\";\n}\n.fa-stop-circle:before {\n  content: \"\\F28D\";\n}\n.fa-stop-circle-o:before {\n  content: \"\\F28E\";\n}\n.fa-shopping-bag:before {\n  content: \"\\F290\";\n}\n.fa-shopping-basket:before {\n  content: \"\\F291\";\n}\n.fa-hashtag:before {\n  content: \"\\F292\";\n}\n.fa-bluetooth:before {\n  content: \"\\F293\";\n}\n.fa-bluetooth-b:before {\n  content: \"\\F294\";\n}\n.fa-percent:before {\n  content: \"\\F295\";\n}\n/* makes the font 33% larger relative to the icon container */\n.fa-lg {\n  font-size: 1.33333333em;\n  line-height: 0.75em;\n  vertical-align: -15%;\n}\n.fa-2x {\n  font-size: 2em;\n}\n.fa-3x {\n  font-size: 3em;\n}\n.fa-4x {\n  font-size: 4em;\n}\n.fa-5x {\n  font-size: 5em;\n}\n.fa-ul {\n  padding-left: 0;\n  margin-left: 2.14285714em;\n  list-style-type: none;\n}\n.fa-ul > li {\n  position: relative;\n}\n.fa-li {\n  position: absolute;\n  left: -2.14285714em;\n  width: 2.14285714em;\n  top: 0.14285714em;\n  text-align: center;\n}\n.fa-li.fa-lg {\n  left: -1.85714286em;\n}\n/* FONT PATH\n * -------------------------- */\n@font-face {\n  font-family: 'FontAwesome';\n  src: url(" + __webpack_require__(23) + ");\n  src: url(" + __webpack_require__(24) + "?#iefix&v=4.5.0) format('embedded-opentype'), url(" + __webpack_require__(25) + ") format('woff2'), url(" + __webpack_require__(26) + ") format('woff'), url(" + __webpack_require__(27) + ") format('truetype'), url(" + __webpack_require__(28) + "#fontawesomeregular) format('svg');\n  font-weight: normal;\n  font-style: normal;\n}\n.fa-rotate-90 {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=1);\n  -webkit-transform: rotate(90deg);\n  -ms-transform: rotate(90deg);\n  transform: rotate(90deg);\n}\n.fa-rotate-180 {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=2);\n  -webkit-transform: rotate(180deg);\n  -ms-transform: rotate(180deg);\n  transform: rotate(180deg);\n}\n.fa-rotate-270 {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3);\n  -webkit-transform: rotate(270deg);\n  -ms-transform: rotate(270deg);\n  transform: rotate(270deg);\n}\n.fa-flip-horizontal {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1);\n  -webkit-transform: scale(-1, 1);\n  -ms-transform: scale(-1, 1);\n  transform: scale(-1, 1);\n}\n.fa-flip-vertical {\n  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1);\n  -webkit-transform: scale(1, -1);\n  -ms-transform: scale(1, -1);\n  transform: scale(1, -1);\n}\n:root .fa-rotate-90,\n:root .fa-rotate-180,\n:root .fa-rotate-270,\n:root .fa-flip-horizontal,\n:root .fa-flip-vertical {\n  filter: none;\n}\n.fa-spin {\n  -webkit-animation: fa-spin 2s infinite linear;\n  animation: fa-spin 2s infinite linear;\n}\n.fa-pulse {\n  -webkit-animation: fa-spin 1s infinite steps(8);\n  animation: fa-spin 1s infinite steps(8);\n}\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n    transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(359deg);\n    transform: rotate(359deg);\n  }\n}\n.fa-stack {\n  position: relative;\n  display: inline-block;\n  width: 2em;\n  height: 2em;\n  line-height: 2em;\n  vertical-align: middle;\n}\n.fa-stack-1x,\n.fa-stack-2x {\n  position: absolute;\n  left: 0;\n  width: 100%;\n  text-align: center;\n}\n.fa-stack-1x {\n  line-height: inherit;\n}\n.fa-stack-2x {\n  font-size: 2em;\n}\n.fa-inverse {\n  color: #fff;\n}\n", ""]);

	// exports


/***/ },
/* 22 */
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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fontawesome-webfont.eot";

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fontawesome-webfont.eot";

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fontawesome-webfont.woff2";

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fontawesome-webfont.woff";

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fontawesome-webfont.ttf";

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "fontawesome-webfont.svg";

/***/ },
/* 29 */
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
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

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

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
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
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! FileAPI 2.0.19 - BSD | git://github.com/mailru/FileAPI.git */
	!function(a){"use strict";var b=a.HTMLCanvasElement&&a.HTMLCanvasElement.prototype,c=a.Blob&&function(){try{return Boolean(new Blob)}catch(a){return!1}}(),d=c&&a.Uint8Array&&function(){try{return 100===new Blob([new Uint8Array(100)]).size}catch(a){return!1}}(),e=a.BlobBuilder||a.WebKitBlobBuilder||a.MozBlobBuilder||a.MSBlobBuilder,f=(c||e)&&a.atob&&a.ArrayBuffer&&a.Uint8Array&&function(a){var b,f,g,h,i,j;for(b=a.split(",")[0].indexOf("base64")>=0?atob(a.split(",")[1]):decodeURIComponent(a.split(",")[1]),f=new ArrayBuffer(b.length),g=new Uint8Array(f),h=0;h<b.length;h+=1)g[h]=b.charCodeAt(h);return i=a.split(",")[0].split(":")[1].split(";")[0],c?new Blob([d?g:f],{type:i}):(j=new e,j.append(f),j.getBlob(i))};a.HTMLCanvasElement&&!b.toBlob&&(b.mozGetAsFile?b.toBlob=function(a,c,d){a(d&&b.toDataURL&&f?f(this.toDataURL(c,d)):this.mozGetAsFile("blob",c))}:b.toDataURL&&f&&(b.toBlob=function(a,b,c){a(f(this.toDataURL(b,c)))})),a.dataURLtoBlob=f}(window),function(a,b){"use strict";function c(a,b,c,d,e){var f={type:c.type||c,target:a,result:d};Y(f,e),b(f)}function d(a){return z&&!!z.prototype["readAs"+a]}function e(a,e,f,g){if(ca.isBlob(a)&&d(f)){var h=new z;Z(h,S,function j(b){var d=b.type;"progress"==d?c(a,e,b,b.target.result,{loaded:b.loaded,total:b.total}):"loadend"==d?($(h,S,j),h=null):c(a,e,b,b.target.result)});try{g?h["readAs"+f](a,g):h["readAs"+f](a)}catch(i){c(a,e,"error",b,{error:i.toString()})}}else c(a,e,"error",b,{error:"filreader_not_support_"+f})}function f(a,b){if(!a.type&&(u||a.size%4096===0&&a.size<=102400))if(z)try{var c=new z;_(c,S,function(a){var d="error"!=a.type;d?((null==c.readyState||c.readyState===c.LOADING)&&c.abort(),b(d)):b(!1,c.error)}),c.readAsDataURL(a)}catch(d){b(!1,d)}else b(null,new Error("FileReader is not supported"));else b(!0)}function g(a){return a&&(a.isFile||a.isDirectory)}function h(a){var b;return a.getAsEntry?b=a.getAsEntry():a.webkitGetAsEntry&&(b=a.webkitGetAsEntry()),b}function i(a,b){if(a)if(a.isFile)a.file(function(c){c.fullPath=a.fullPath,b(!1,[c],[c])},function(c){a.error=c,b("FileError.code: "+c.code,[],[a])});else if(a.isDirectory){var c=a.createReader(),d=!0,e=[],f=[a],g=function(c){a.error=c,b("DirectoryError.code: "+c.code,e,f)},j=function l(h){d&&(d=!1,h.length||(a.error=new Error("directory is empty"))),h.length?ca.afor(h,function(a,b){i(b,function(b,d,h){b||(e=e.concat(d)),f=f.concat(h),a?a():c.readEntries(l,g)})}):b(!1,e,f)};c.readEntries(j,g)}else i(h(a),b);else{var k=new Error("invalid entry");a=new Object(a),a.error=k,b(k.message,[],[a])}}function j(a){var b={};return X(a,function(a,c){a&&"object"==typeof a&&void 0===a.nodeType&&(a=Y({},a)),b[c]=a}),b}function k(a){return L.test(a&&a.tagName)}function l(a){return(a.originalEvent||a||"").dataTransfer||{}}function m(a){var b;for(b in a)if(a.hasOwnProperty(b)&&!(a[b]instanceof Object||"overlay"===b||"filter"===b))return!0;return!1}var n,o,p=1,q=function(){},r=a.document,s=r.doctype||{},t=a.navigator.userAgent,u=/safari\//i.test(t)&&!/chrome\//i.test(t),v=/iemobile\//i.test(t),w=a.createObjectURL&&a||a.URL&&URL.revokeObjectURL&&URL||a.webkitURL&&webkitURL,x=a.Blob,y=a.File,z=a.FileReader,A=a.FormData,B=a.XMLHttpRequest,C=a.jQuery,D=!(!(y&&z&&(a.Uint8Array||A||B.prototype.sendAsBinary))||u&&/windows/i.test(t)&&!v),E=D&&"withCredentials"in new B,F=D&&!!x&&!!(x.prototype.webkitSlice||x.prototype.mozSlice||x.prototype.slice),G=(""+"".normalize).indexOf("[native code]")>0,H=a.dataURLtoBlob,I=/img/i,J=/canvas/i,K=/img|canvas/i,L=/input/i,M=/^data:[^,]+,/,N={}.toString,O=a.Math,P=function(b){return b=new a.Number(O.pow(1024,b)),b.from=function(a){return O.round(a*this)},b},Q={},R=[],S="abort progress error load loadend",T="status statusText readyState response responseXML responseText responseBody".split(" "),U="currentTarget",V="preventDefault",W=function(a){return a&&"length"in a},X=function(a,b,c){if(a)if(W(a))for(var d=0,e=a.length;e>d;d++)d in a&&b.call(c,a[d],d,a);else for(var f in a)a.hasOwnProperty(f)&&b.call(c,a[f],f,a)},Y=function(a){for(var b=arguments,c=1,d=function(b,c){a[c]=b};c<b.length;c++)X(b[c],d);return a},Z=function(a,b,c){if(a){var d=ca.uid(a);Q[d]||(Q[d]={});var e=z&&a&&a instanceof z;X(b.split(/\s+/),function(b){C&&!e?C.event.add(a,b,c):(Q[d][b]||(Q[d][b]=[]),Q[d][b].push(c),a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent?a.attachEvent("on"+b,c):a["on"+b]=c)})}},$=function(a,b,c){if(a){var d=ca.uid(a),e=Q[d]||{},f=z&&a&&a instanceof z;X(b.split(/\s+/),function(b){if(C&&!f)C.event.remove(a,b,c);else{for(var d=e[b]||[],g=d.length;g--;)if(d[g]===c){d.splice(g,1);break}a.addEventListener?a.removeEventListener(b,c,!1):a.detachEvent?a.detachEvent("on"+b,c):a["on"+b]=null}})}},_=function(a,b,c){Z(a,b,function d(e){$(a,b,d),c(e)})},aa=function(b){return b.target||(b.target=a.event&&a.event.srcElement||r),3===b.target.nodeType&&(b.target=b.target.parentNode),b},ba=function(a){var b=r.createElement("input");return b.setAttribute("type","file"),a in b},ca={version:"2.0.19",cors:!1,html5:!0,media:!1,formData:!0,multiPassResize:!0,debug:!1,pingUrl:!1,multiFlash:!1,flashAbortTimeout:0,withCredentials:!0,staticPath:"./dist/",flashUrl:0,flashImageUrl:0,postNameConcat:function(a,b){return a+(null!=b?"["+b+"]":"")},ext2mime:{jpg:"image/jpeg",tif:"image/tiff",txt:"text/plain"},accept:{"image/*":"art bm bmp dwg dxf cbr cbz fif fpx gif ico iefs jfif jpe jpeg jpg jps jut mcf nap nif pbm pcx pgm pict pm png pnm qif qtif ras rast rf rp svf tga tif tiff xbm xbm xpm xwd","audio/*":"m4a flac aac rm mpa wav wma ogg mp3 mp2 m3u mod amf dmf dsm far gdm imf it m15 med okt s3m stm sfx ult uni xm sid ac3 dts cue aif aiff wpl ape mac mpc mpp shn wv nsf spc gym adplug adx dsp adp ymf ast afc hps xs","video/*":"m4v 3gp nsv ts ty strm rm rmvb m3u ifo mov qt divx xvid bivx vob nrg img iso pva wmv asf asx ogm m2v avi bin dat dvr-ms mpg mpeg mp4 mkv avc vp3 svq3 nuv viv dv fli flv wpl"},uploadRetry:0,networkDownRetryTimeout:5e3,chunkSize:0,chunkUploadRetry:0,chunkNetworkDownRetryTimeout:2e3,KB:P(1),MB:P(2),GB:P(3),TB:P(4),EMPTY_PNG:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2NkAAIAAAoAAggA9GkAAAAASUVORK5CYII=",expando:"fileapi"+(new Date).getTime(),uid:function(a){return a?a[ca.expando]=a[ca.expando]||ca.uid():(++p,ca.expando+p)},log:function(){ca.debug&&n&&(o?console.log.apply(console,arguments):console.log([].join.call(arguments," ")))},newImage:function(a,b){var c=r.createElement("img");return b&&ca.event.one(c,"error load",function(a){b("error"==a.type,c),c=null}),c.src=a,c},getXHR:function(){var b;if(B)b=new B;else if(a.ActiveXObject)try{b=new ActiveXObject("MSXML2.XMLHttp.3.0")}catch(c){b=new ActiveXObject("Microsoft.XMLHTTP")}return b},isArray:W,support:{dnd:E&&"ondrop"in r.createElement("div"),cors:E,html5:D,chunked:F,dataURI:!0,accept:ba("accept"),multiple:ba("multiple")},event:{on:Z,off:$,one:_,fix:aa},throttle:function(b,c){var d,e;return function(){e=arguments,d||(b.apply(a,e),d=setTimeout(function(){d=0,b.apply(a,e)},c))}},F:function(){},parseJSON:function(b){var c;return c=a.JSON&&JSON.parse?JSON.parse(b):new Function("return ("+b.replace(/([\r\n])/g,"\\$1")+");")()},trim:function(a){return a=String(a),a.trim?a.trim():a.replace(/^\s+|\s+$/g,"")},defer:function(){var a,c,d=[],e={resolve:function(b,f){for(e.resolve=q,c=b||!1,a=f;f=d.shift();)f(c,a)},then:function(e){c!==b?e(c,a):d.push(e)}};return e},queue:function(a){var b=0,c=0,d=!1,e=!1,f={inc:function(){c++},next:function(){b++,setTimeout(f.check,0)},check:function(){b>=c&&!d&&f.end()},isFail:function(){return d},fail:function(){!d&&a(d=!0)},end:function(){e||(e=!0,a())}};return f},each:X,afor:function(a,b){var c=0,d=a.length;W(a)&&d--?!function e(){b(d!=c&&e,a[c],c++)}():b(!1)},extend:Y,isFile:function(a){return"[object File]"===N.call(a)},isBlob:function(a){return this.isFile(a)||"[object Blob]"===N.call(a)},isCanvas:function(a){return a&&J.test(a.nodeName)},getFilesFilter:function(a){return a="string"==typeof a?a:a.getAttribute&&a.getAttribute("accept")||"",a?new RegExp("("+a.replace(/\./g,"\\.").replace(/,/g,"|")+")$","i"):/./},readAsDataURL:function(a,b){ca.isCanvas(a)?c(a,b,"load",ca.toDataURL(a)):e(a,b,"DataURL")},readAsBinaryString:function(a,b){d("BinaryString")?e(a,b,"BinaryString"):e(a,function(a){if("load"==a.type)try{a.result=ca.toBinaryString(a.result)}catch(c){a.type="error",a.message=c.toString()}b(a)},"DataURL")},readAsArrayBuffer:function(a,b){e(a,b,"ArrayBuffer")},readAsText:function(a,b,c){c||(c=b,b="utf-8"),e(a,c,"Text",b)},toDataURL:function(a,b){return"string"==typeof a?a:a.toDataURL?a.toDataURL(b||"image/png"):void 0},toBinaryString:function(b){return a.atob(ca.toDataURL(b).replace(M,""))},readAsImage:function(a,d,e){if(ca.isBlob(a))if(w){var f=w.createObjectURL(a);f===b?c(a,d,"error"):ca.readAsImage(f,d,e)}else ca.readAsDataURL(a,function(b){"load"==b.type?ca.readAsImage(b.result,d,e):(e||"error"==b.type)&&c(a,d,b,null,{loaded:b.loaded,total:b.total})});else if(ca.isCanvas(a))c(a,d,"load",a);else if(I.test(a.nodeName))if(a.complete)c(a,d,"load",a);else{var g="error abort load";_(a,g,function i(b){"load"==b.type&&w&&w.revokeObjectURL(a.src),$(a,g,i),c(a,d,b,a)})}else if(a.iframe)c(a,d,{type:"error"});else{var h=ca.newImage(a.dataURL||a);ca.readAsImage(h,d,e)}},checkFileObj:function(a){var b={},c=ca.accept;return"object"==typeof a?b=a:b.name=(a+"").split(/\\|\//g).pop(),null==b.type&&(b.type=b.name.split(".").pop()),X(c,function(a,c){a=new RegExp(a.replace(/\s/g,"|"),"i"),(a.test(b.type)||ca.ext2mime[b.type])&&(b.type=ca.ext2mime[b.type]||c.split("/")[0]+"/"+b.type)}),b},getDropFiles:function(a,b){var c,d=[],e=[],j=l(a),k=j.files,m=j.items,n=W(m)&&m[0]&&h(m[0]),o=ca.queue(function(){b(d,e)});if(n)if(G&&k){var p,q,r=k.length;for(c=new Array(r);r--;){p=k[r];try{q=h(m[r])}catch(s){ca.log("[err] getDropFiles: ",s),q=null}g(q)&&(q.isDirectory||q.isFile&&p.name==p.name.normalize("NFC"))?c[r]=q:c[r]=p}}else c=m;else c=k;X(c||[],function(a){o.inc();try{n&&g(a)?i(a,function(a,b,c){a?ca.log("[err] getDropFiles:",a):d.push.apply(d,b),e.push.apply(e,c),o.next()}):f(a,function(b,c){b?d.push(a):a.error=c,e.push(a),o.next()})}catch(b){o.next(),ca.log("[err] getDropFiles: ",b)}}),o.check()},getFiles:function(a,b,c){var d=[];return c?(ca.filterFiles(ca.getFiles(a),b,c),null):(a.jquery&&(a.each(function(){d=d.concat(ca.getFiles(this))}),a=d,d=[]),"string"==typeof b&&(b=ca.getFilesFilter(b)),a.originalEvent?a=aa(a.originalEvent):a.srcElement&&(a=aa(a)),a.dataTransfer?a=a.dataTransfer:a.target&&(a=a.target),a.files?(d=a.files,D||(d[0].blob=a,d[0].iframe=!0)):!D&&k(a)?ca.trim(a.value)&&(d=[ca.checkFileObj(a.value)],d[0].blob=a,d[0].iframe=!0):W(a)&&(d=a),ca.filter(d,function(a){return!b||b.test(a.name)}))},getTotalSize:function(a){for(var b=0,c=a&&a.length;c--;)b+=a[c].size;return b},getInfo:function(a,b){var c={},d=R.concat();ca.isBlob(a)?!function e(){var f=d.shift();f?f.test(a.type)?f(a,function(a,d){a?b(a):(Y(c,d),e())}):e():b(!1,c)}():b("not_support_info",c)},addInfoReader:function(a,b){b.test=function(b){return a.test(b)},R.push(b)},filter:function(a,b){for(var c,d=[],e=0,f=a.length;f>e;e++)e in a&&(c=a[e],b.call(c,c,e,a)&&d.push(c));return d},filterFiles:function(a,b,c){if(a.length){var d,e=a.concat(),f=[],g=[];!function h(){e.length?(d=e.shift(),ca.getInfo(d,function(a,c){(b(d,a?!1:c)?f:g).push(d),h()})):c(f,g)}()}else c([],a)},upload:function(a){a=Y({jsonp:"callback",prepare:ca.F,beforeupload:ca.F,upload:ca.F,fileupload:ca.F,fileprogress:ca.F,filecomplete:ca.F,progress:ca.F,complete:ca.F,pause:ca.F,imageOriginal:!0,chunkSize:ca.chunkSize,chunkUploadRetry:ca.chunkUploadRetry,uploadRetry:ca.uploadRetry},a),a.imageAutoOrientation&&!a.imageTransform&&(a.imageTransform={rotate:"auto"});var b,c=new ca.XHR(a),d=this._getFilesDataArray(a.files),e=this,f=0,g=0,h=!1;return X(d,function(a){f+=a.size}),c.files=[],X(d,function(a){c.files.push(a.file)}),c.total=f,c.loaded=0,c.filesLeft=d.length,a.beforeupload(c,a),b=function(){var i=d.shift(),k=i&&i.file,l=!1,m=j(a);if(c.filesLeft=d.length,k&&k.name===ca.expando&&(k=null,ca.log("[warn] FileAPI.upload() — called without files")),("abort"!=c.statusText||c.current)&&i){if(h=!1,c.currentFile=k,k&&a.prepare(k,m)===!1)return void b.call(e);m.file=k,e._getFormData(m,i,function(h){g||a.upload(c,a);var j=new ca.XHR(Y({},m,{upload:k?function(){a.fileupload(k,j,m)}:q,progress:k?function(b){l||(l=b.loaded===b.total,a.fileprogress({type:"progress",total:i.total=b.total,loaded:i.loaded=b.loaded},k,j,m),a.progress({type:"progress",total:f,loaded:c.loaded=g+i.size*(b.loaded/b.total)||0},k,j,m))}:q,complete:function(d){X(T,function(a){c[a]=j[a]}),k&&(i.total=i.total||i.size,i.loaded=i.total,d||(this.progress(i),l=!0,g+=i.size,c.loaded=g),a.filecomplete(d,j,k,m)),setTimeout(function(){b.call(e)},0)}}));c.abort=function(a){a||(d.length=0),this.current=a,j.abort()},j.send(h)})}else{var n=200==c.status||201==c.status||204==c.status;a.complete(n?!1:c.statusText||"error",c,a),h=!0}},setTimeout(b,0),c.append=function(a,g){a=ca._getFilesDataArray([].concat(a)),X(a,function(a){f+=a.size,c.files.push(a.file),g?d.unshift(a):d.push(a)}),c.statusText="",h&&b.call(e)},c.remove=function(a){for(var b,c=d.length;c--;)d[c].file==a&&(b=d.splice(c,1),f-=b.size);return b},c},_getFilesDataArray:function(a){var b=[],c={};if(k(a)){var d=ca.getFiles(a);c[a.name||"file"]=null!==a.getAttribute("multiple")?d:d[0]}else W(a)&&k(a[0])?X(a,function(a){c[a.name||"file"]=ca.getFiles(a)}):c=a;return X(c,function e(a,c){W(a)?X(a,function(a){e(a,c)}):a&&(a.name||a.image)&&b.push({name:c,file:a,size:a.size,total:a.size,loaded:0})}),b.length||b.push({file:{name:ca.expando}}),b},_getFormData:function(a,b,c){var d=b.file,e=b.name,f=d.name,g=d.type,h=ca.support.transform&&a.imageTransform,i=new ca.Form,j=ca.queue(function(){c(i)}),k=h&&m(h),l=ca.postNameConcat;X(a.data,function n(a,b){"object"==typeof a?X(a,function(a,c){n(a,l(b,c))}):i.append(b,a)}),function o(b){b.image?(j.inc(),b.toData(function(a,c){b.file&&(c.type=b.file.type,c.quality=b.matrix.quality,f=b.file&&b.file.name),f=f||(new Date).getTime()+".png",o(c),j.next()})):ca.Image&&h&&(/^image/.test(b.type)||K.test(b.nodeName))?(j.inc(),k&&(h=[h]),ca.Image.transform(b,h,a.imageAutoOrientation,function(c,d){if(k&&!c)H||ca.flashEngine||(i.multipart=!0),i.append(e,d[0],f,h[0].type||g);else{var m=0;c||X(d,function(a,b){H||ca.flashEngine||(i.multipart=!0),h[b].postName||(m=1),i.append(h[b].postName||l(e,b),a,f,h[b].type||g)}),(c||a.imageOriginal)&&i.append(l(e,m?"original":null),b,f,g)}j.next()})):f!==ca.expando&&i.append(e,b,f)}(d),j.check()},reset:function(a,b){var c,d;return C?(d=C(a).clone(!0).insertBefore(a).val("")[0],b||C(a).remove()):(c=a.parentNode,d=c.insertBefore(a.cloneNode(!0),a),d.value="",b||c.removeChild(a),X(Q[ca.uid(a)],function(b,c){X(b,function(b){$(a,c,b),Z(d,c,b)})})),d},load:function(a,b){var c=ca.getXHR();return c?(c.open("GET",a,!0),c.overrideMimeType&&c.overrideMimeType("text/plain; charset=x-user-defined"),Z(c,"progress",function(a){a.lengthComputable&&b({type:a.type,loaded:a.loaded,total:a.total},c)}),c.onreadystatechange=function(){if(4==c.readyState)if(c.onreadystatechange=null,200==c.status){a=a.split("/");var d={name:a[a.length-1],size:c.getResponseHeader("Content-Length"),type:c.getResponseHeader("Content-Type")};d.dataURL="data:"+d.type+";base64,"+ca.encode64(c.responseBody||c.responseText),b({type:"load",result:d},c)}else b({type:"error"},c)},c.send(null)):b({type:"error"}),c},encode64:function(a){var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c="",d=0;for("string"!=typeof a&&(a=String(a));d<a.length;){var e,f,g=255&a.charCodeAt(d++),h=255&a.charCodeAt(d++),i=255&a.charCodeAt(d++),j=g>>2,k=(3&g)<<4|h>>4;isNaN(h)?e=f=64:(e=(15&h)<<2|i>>6,f=isNaN(i)?64:63&i),c+=b.charAt(j)+b.charAt(k)+b.charAt(e)+b.charAt(f)}return c}};ca.addInfoReader(/^image/,function(a,b){if(!a.__dimensions){var c=a.__dimensions=ca.defer();ca.readAsImage(a,function(a){var b=a.target;c.resolve("load"==a.type?!1:"error",{width:b.width,height:b.height}),b.src=ca.EMPTY_PNG,b=null})}a.__dimensions.then(b)}),ca.event.dnd=function(a,b,c){var d,e;c||(c=b,b=ca.F),z?(Z(a,"dragenter dragleave dragover",b.ff=b.ff||function(a){for(var c=l(a).types,f=c&&c.length,g=!1;f--;)if(~c[f].indexOf("File")){a[V](),e!==a.type&&(e=a.type,"dragleave"!=e&&b.call(a[U],!0,a),g=!0);break}g&&(clearTimeout(d),d=setTimeout(function(){b.call(a[U],"dragleave"!=e,a)},50))}),Z(a,"drop",c.ff=c.ff||function(a){a[V](),e=0,b.call(a[U],!1,a),ca.getDropFiles(a,function(b,d){c.call(a[U],b,d,a)})})):ca.log("Drag'n'Drop -- not supported")},ca.event.dnd.off=function(a,b,c){$(a,"dragenter dragleave dragover",b.ff),$(a,"drop",c.ff)},C&&!C.fn.dnd&&(C.fn.dnd=function(a,b){return this.each(function(){ca.event.dnd(this,a,b)})},C.fn.offdnd=function(a,b){return this.each(function(){ca.event.dnd.off(this,a,b)})}),a.FileAPI=Y(ca,a.FileAPI),ca.log("FileAPI: "+ca.version),ca.log("protocol: "+a.location.protocol),ca.log("doctype: ["+s.name+"] "+s.publicId+" "+s.systemId),X(r.getElementsByTagName("meta"),function(a){/x-ua-compatible/i.test(a.getAttribute("http-equiv"))&&ca.log("meta.http-equiv: "+a.getAttribute("content"))});try{n=!!console.log,o=!!console.log.apply}catch(da){}ca.flashUrl||(ca.flashUrl=ca.staticPath+"FileAPI.flash.swf"),ca.flashImageUrl||(ca.flashImageUrl=ca.staticPath+"FileAPI.flash.image.swf"),ca.flashWebcamUrl||(ca.flashWebcamUrl=ca.staticPath+"FileAPI.flash.camera.swf")}(window,void 0),function(a,b,c){"use strict";function d(b){if(b instanceof d){var c=new d(b.file);return a.extend(c.matrix,b.matrix),c}return this instanceof d?(this.file=b,this.size=b.size||100,void(this.matrix={sx:0,sy:0,sw:0,sh:0,dx:0,dy:0,dw:0,dh:0,resize:0,deg:0,quality:1,filter:0})):new d(b)}var e=Math.min,f=Math.round,g=function(){return b.createElement("canvas")},h=!1,i={8:270,3:180,6:90,7:270,4:180,5:90};try{h=g().toDataURL("image/png").indexOf("data:image/png")>-1}catch(j){}d.prototype={image:!0,constructor:d,set:function(b){return a.extend(this.matrix,b),this},crop:function(a,b,d,e){return d===c&&(d=a,e=b,a=b=0),this.set({sx:a,sy:b,sw:d,sh:e||d})},resize:function(a,b,c){return/min|max|height|width/.test(b)&&(c=b,b=a),this.set({dw:a,dh:b||a,resize:c})},preview:function(a,b){return this.resize(a,b||a,"preview")},rotate:function(a){return this.set({deg:a})},filter:function(a){return this.set({filter:a})},overlay:function(a){return this.set({overlay:a})},clone:function(){return new d(this)},_load:function(b,c){var d=this;/img|video/i.test(b.nodeName)?c.call(d,null,b):a.readAsImage(b,function(a){c.call(d,"load"!=a.type,a.result)})},_apply:function(b,c){var f,h=g(),i=this.getMatrix(b),j=h.getContext("2d"),k=b.videoWidth||b.width,l=b.videoHeight||b.height,m=i.deg,n=i.dw,o=i.dh,p=k,q=l,r=i.filter,s=b,t=i.overlay,u=a.queue(function(){b.src=a.EMPTY_PNG,c(!1,h)}),v=a.renderImageToCanvas;for(m-=360*Math.floor(m/360),b._type=this.file.type;i.multipass&&e(p/n,q/o)>2;)p=p/2+.5|0,q=q/2+.5|0,f=g(),f.width=p,f.height=q,s!==b?(v(f,s,0,0,s.width,s.height,0,0,p,q),s=f):(s=f,v(s,b,i.sx,i.sy,i.sw,i.sh,0,0,p,q),i.sx=i.sy=i.sw=i.sh=0);h.width=m%180?o:n,h.height=m%180?n:o,h.type=i.type,h.quality=i.quality,j.rotate(m*Math.PI/180),v(j.canvas,s,i.sx,i.sy,i.sw||s.width,i.sh||s.height,180==m||270==m?-n:0,90==m||180==m?-o:0,n,o),n=h.width,o=h.height,t&&a.each([].concat(t),function(b){u.inc();var c=new window.Image,d=function(){var e=0|b.x,f=0|b.y,g=b.w||c.width,h=b.h||c.height,i=b.rel;e=1==i||4==i||7==i?(n-g+e)/2:2==i||5==i||8==i?n-(g+e):e,f=3==i||4==i||5==i?(o-h+f)/2:i>=6?o-(h+f):f,a.event.off(c,"error load abort",d);try{j.globalAlpha=b.opacity||1,j.drawImage(c,e,f,g,h)}catch(k){}u.next()};a.event.on(c,"error load abort",d),c.src=b.src,c.complete&&d()}),r&&(u.inc(),d.applyFilter(h,r,u.next)),u.check()},getMatrix:function(b){var c=a.extend({},this.matrix),d=c.sw=c.sw||b.videoWidth||b.naturalWidth||b.width,g=c.sh=c.sh||b.videoHeight||b.naturalHeight||b.height,h=c.dw=c.dw||d,i=c.dh=c.dh||g,j=d/g,k=h/i,l=c.resize;if("preview"==l){if(h!=d||i!=g){var m,n;k>=j?(m=d,n=m/k):(n=g,m=n*k),(m!=d||n!=g)&&(c.sx=~~((d-m)/2),c.sy=~~((g-n)/2),d=m,g=n)}}else"height"==l?h=i*j:"width"==l?i=h/j:l&&(d>h||g>i?"min"==l?(h=f(k>j?e(d,h):i*j),i=f(k>j?h/j:e(g,i))):(h=f(j>=k?e(d,h):i*j),i=f(j>=k?h/j:e(g,i))):(h=d,i=g));return c.sw=d,c.sh=g,c.dw=h,c.dh=i,c.multipass=a.multiPassResize,c},_trans:function(b){this._load(this.file,function(c,d){if(c)b(c);else try{this._apply(d,b)}catch(c){a.log("[err] FileAPI.Image.fn._apply:",c),b(c)}})},get:function(b){if(a.support.transform){var c=this,d=c.matrix;"auto"==d.deg?a.getInfo(c.file,function(a,e){d.deg=i[e&&e.exif&&e.exif.Orientation]||0,c._trans(b)}):c._trans(b)}else b("not_support_transform");return this},toData:function(a){return this.get(a)}},d.exifOrientation=i,d.transform=function(b,e,f,g){function h(h,i){var j={},k=a.queue(function(a){g(a,j)});h?k.fail():a.each(e,function(a,e){if(!k.isFail()){var g=new d(i.nodeType?i:b),h="function"==typeof a;if(h?a(i,g):a.width?g[a.preview?"preview":"resize"](a.width,a.height,a.strategy):a.maxWidth&&(i.width>a.maxWidth||i.height>a.maxHeight)&&g.resize(a.maxWidth,a.maxHeight,"max"),a.crop){var l=a.crop;g.crop(0|l.x,0|l.y,l.w||l.width,l.h||l.height)}a.rotate===c&&f&&(a.rotate="auto"),g.set({type:g.matrix.type||a.type||b.type||"image/png"}),h||g.set({deg:a.rotate,overlay:a.overlay,filter:a.filter,quality:a.quality||1}),k.inc(),g.toData(function(a,b){a?k.fail():(j[e]=b,k.next())})}})}b.width?h(!1,b):a.getInfo(b,h)},a.each(["TOP","CENTER","BOTTOM"],function(b,c){a.each(["LEFT","CENTER","RIGHT"],function(a,e){d[b+"_"+a]=3*c+e,d[a+"_"+b]=3*c+e})}),d.toCanvas=function(a){var c=b.createElement("canvas");return c.width=a.videoWidth||a.width,c.height=a.videoHeight||a.height,c.getContext("2d").drawImage(a,0,0),c},d.fromDataURL=function(b,c,d){var e=a.newImage(b);a.extend(e,c),d(e)},d.applyFilter=function(b,c,e){"function"==typeof c?c(b,e):window.Caman&&window.Caman("IMG"==b.tagName?d.toCanvas(b):b,function(){"string"==typeof c?this[c]():a.each(c,function(a,b){this[b](a)},this),this.render(e)})},a.renderImageToCanvas=function(b,c,d,e,f,g,h,i,j,k){try{return b.getContext("2d").drawImage(c,d,e,f,g,h,i,j,k)}catch(l){throw a.log("renderImageToCanvas failed"),l}},a.support.canvas=a.support.transform=h,a.Image=d}(FileAPI,document),function(a){"use strict";a(FileAPI)}(function(a){"use strict";if(window.navigator&&window.navigator.platform&&/iP(hone|od|ad)/.test(window.navigator.platform)){var b=a.renderImageToCanvas;a.detectSubsampling=function(a){var b,c;return a.width*a.height>1048576?(b=document.createElement("canvas"),b.width=b.height=1,c=b.getContext("2d"),c.drawImage(a,-a.width+1,0),0===c.getImageData(0,0,1,1).data[3]):!1},a.detectVerticalSquash=function(a,b){var c,d,e,f,g,h=a.naturalHeight||a.height,i=document.createElement("canvas"),j=i.getContext("2d");for(b&&(h/=2),i.width=1,i.height=h,j.drawImage(a,0,0),c=j.getImageData(0,0,1,h).data,d=0,e=h,f=h;f>d;)g=c[4*(f-1)+3],0===g?e=f:d=f,f=e+d>>1;return f/h||1},a.renderImageToCanvas=function(c,d,e,f,g,h,i,j,k,l){if("image/jpeg"===d._type){var m,n,o,p,q=c.getContext("2d"),r=document.createElement("canvas"),s=1024,t=r.getContext("2d");if(r.width=s,r.height=s,q.save(),m=a.detectSubsampling(d),m&&(e/=2,f/=2,g/=2,h/=2),n=a.detectVerticalSquash(d,m),m||1!==n){for(f*=n,k=Math.ceil(s*k/g),l=Math.ceil(s*l/h/n),j=0,p=0;h>p;){for(i=0,o=0;g>o;)t.clearRect(0,0,s,s),t.drawImage(d,e,f,g,h,-o,-p,g,h),q.drawImage(r,0,0,s,s,i,j,k,l),o+=s,i+=k;p+=s,j+=l}return q.restore(),c}}return b(c,d,e,f,g,h,i,j,k,l)}}}),function(a,b){"use strict";function c(b,c,d){var e=b.blob,f=b.file;if(f){if(!e.toDataURL)return void a.readAsBinaryString(e,function(a){"load"==a.type&&c(b,a.result)});var g={"image/jpeg":".jpe?g","image/png":".png"},h=g[b.type]?b.type:"image/png",i=g[h]||".png",j=e.quality||1;f.match(new RegExp(i+"$","i"))||(f+=i.replace("?","")),b.file=f,b.type=h,!d&&e.toBlob?e.toBlob(function(a){c(b,a)},h,j):c(b,a.toBinaryString(e.toDataURL(h,j)))}else c(b,e)}var d=b.document,e=b.FormData,f=function(){this.items=[]},g=b.encodeURIComponent;f.prototype={append:function(a,b,c,d){this.items.push({name:a,blob:b&&b.blob||(void 0==b?"":b),file:b&&(c||b.name),type:b&&(d||b.type)})},each:function(a){for(var b=0,c=this.items.length;c>b;b++)a.call(this,this.items[b])},toData:function(b,c){c._chunked=a.support.chunked&&c.chunkSize>0&&1==a.filter(this.items,function(a){return a.file}).length,a.support.html5?a.formData&&!this.multipart&&e?c._chunked?(a.log("FileAPI.Form.toPlainData"),this.toPlainData(b)):(a.log("FileAPI.Form.toFormData"),this.toFormData(b)):(a.log("FileAPI.Form.toMultipartData"),this.toMultipartData(b)):(a.log("FileAPI.Form.toHtmlData"),this.toHtmlData(b))},_to:function(b,c,d,e){var f=a.queue(function(){c(b)});this.each(function(g){try{d(g,b,f,e)}catch(h){a.log("FileAPI.Form._to: "+h.message),c(h)}}),f.check()},toHtmlData:function(b){this._to(d.createDocumentFragment(),b,function(b,c){var e,f=b.blob;b.file?(a.reset(f,!0),f.name=b.name,f.disabled=!1,c.appendChild(f)):(e=d.createElement("input"),e.name=b.name,e.type="hidden",e.value=f,c.appendChild(e))})},toPlainData:function(a){this._to({},a,function(a,b,d){a.file&&(b.type=a.file),a.blob.toBlob?(d.inc(),c(a,function(a,c){b.name=a.name,b.file=c,b.size=c.length,b.type=a.type,d.next()})):a.file?(b.name=a.blob.name,b.file=a.blob,b.size=a.blob.size,b.type=a.type):(b.params||(b.params=[]),b.params.push(g(a.name)+"="+g(a.blob))),b.start=-1,b.end=b.file&&b.file.FileAPIReadPosition||-1,b.retry=0})},toFormData:function(a){this._to(new e,a,function(a,b,d){a.blob&&a.blob.toBlob?(d.inc(),c(a,function(a,c){b.append(a.name,c,a.file),d.next()})):a.file?b.append(a.name,a.blob,a.file):b.append(a.name,a.blob),a.file&&b.append("_"+a.name,a.file)})},toMultipartData:function(b){this._to([],b,function(a,b,d,e){d.inc(),c(a,function(a,c){b.push("--_"+e+('\r\nContent-Disposition: form-data; name="'+a.name+'"'+(a.file?'; filename="'+g(a.file)+'"':"")+(a.file?"\r\nContent-Type: "+(a.type||"application/octet-stream"):"")+"\r\n\r\n"+(a.file?c:g(c))+"\r\n")),d.next()},!0)},a.expando)}},a.Form=f}(FileAPI,window),function(a,b){"use strict";var c=function(){},d=a.document,e=function(a){this.uid=b.uid(),this.xhr={abort:c,getResponseHeader:c,getAllResponseHeaders:c},this.options=a},f={"":1,XML:1,Text:1,Body:1};e.prototype={status:0,statusText:"",constructor:e,getResponseHeader:function(a){return this.xhr.getResponseHeader(a)},getAllResponseHeaders:function(){return this.xhr.getAllResponseHeaders()||{}},end:function(d,e){var f=this,g=f.options;f.end=f.abort=c,f.status=d,e&&(f.statusText=e),b.log("xhr.end:",d,e),g.complete(200==d||201==d?!1:f.statusText||"unknown",f),f.xhr&&f.xhr.node&&setTimeout(function(){var b=f.xhr.node;try{b.parentNode.removeChild(b)}catch(c){}try{delete a[f.uid]}catch(c){}a[f.uid]=f.xhr.node=null},9)},abort:function(){this.end(0,"abort"),this.xhr&&(this.xhr.aborted=!0,this.xhr.abort())},send:function(a){var b=this,c=this.options;a.toData(function(a){a instanceof Error?b.end(0,a.message):(c.upload(c,b),b._send.call(b,c,a))},c)},_send:function(c,e){var g,h=this,i=h.uid,j=h.uid+"Load",k=c.url;if(b.log("XHR._send:",e),c.cache||(k+=(~k.indexOf("?")?"&":"?")+b.uid()),e.nodeName){var l=c.jsonp;k=k.replace(/([a-z]+)=(\?)/i,"$1="+i),c.upload(c,h);var m=function(a){if(~k.indexOf(a.origin))try{var c=b.parseJSON(a.data);c.id==i&&n(c.status,c.statusText,c.response)}catch(d){n(0,d.message)}},n=a[i]=function(c,d,e){h.readyState=4,h.responseText=e,h.end(c,d),b.event.off(a,"message",m),a[i]=g=p=a[j]=null};h.xhr.abort=function(){try{p.stop?p.stop():p.contentWindow.stop?p.contentWindow.stop():p.contentWindow.document.execCommand("Stop")}catch(a){}n(0,"abort")},b.event.on(a,"message",m),a[j]=function(){try{var a=p.contentWindow,c=a.document,d=a.result||b.parseJSON(c.body.innerHTML);n(d.status,d.statusText,d.response)}catch(e){b.log("[transport.onload]",e)}},g=d.createElement("div"),g.innerHTML='<form target="'+i+'" action="'+k+'" method="POST" enctype="multipart/form-data" style="position: absolute; top: -1000px; overflow: hidden; width: 1px; height: 1px;"><iframe name="'+i+'" src="javascript:false;" onload="window.'+j+" && "+j+'();"></iframe>'+(l&&c.url.indexOf("=?")<0?'<input value="'+i+'" name="'+l+'" type="hidden"/>':"")+"</form>";var o=g.getElementsByTagName("form")[0],p=g.getElementsByTagName("iframe")[0];o.appendChild(e),b.log(o.parentNode.innerHTML),d.body.appendChild(g),h.xhr.node=g,h.readyState=2;try{o.submit()}catch(q){b.log("iframe.error: "+q)}o=null}else{if(k=k.replace(/([a-z]+)=(\?)&?/i,""),this.xhr&&this.xhr.aborted)return void b.log("Error: already aborted");if(g=h.xhr=b.getXHR(),e.params&&(k+=(k.indexOf("?")<0?"?":"&")+e.params.join("&")),g.open("POST",k,!0),b.withCredentials&&(g.withCredentials="true"),c.headers&&c.headers["X-Requested-With"]||g.setRequestHeader("X-Requested-With","XMLHttpRequest"),b.each(c.headers,function(a,b){g.setRequestHeader(b,a)}),c._chunked){g.upload&&g.upload.addEventListener("progress",b.throttle(function(a){e.retry||c.progress({type:a.type,total:e.size,loaded:e.start+a.loaded,totalSize:e.size},h,c)},100),!1),g.onreadystatechange=function(){var a=parseInt(g.getResponseHeader("X-Last-Known-Byte"),10);if(h.status=g.status,h.statusText=g.statusText,h.readyState=g.readyState,4==g.readyState){for(var d in f)h["response"+d]=g["response"+d];if(g.onreadystatechange=null,!g.status||g.status-201>0)if(b.log("Error: "+g.status),(!g.status&&!g.aborted||500==g.status||416==g.status)&&++e.retry<=c.chunkUploadRetry){var i=g.status?0:b.chunkNetworkDownRetryTimeout;c.pause(e.file,c),b.log("X-Last-Known-Byte: "+a),a?e.end=a:(e.end=e.start-1,416==g.status&&(e.end=e.end-c.chunkSize)),setTimeout(function(){h._send(c,e)},i)}else h.end(g.status);else e.retry=0,e.end==e.size-1?h.end(g.status):(b.log("X-Last-Known-Byte: "+a),a&&(e.end=a),e.file.FileAPIReadPosition=e.end,setTimeout(function(){h._send(c,e)},0));g=null}},e.start=e.end+1,e.end=Math.max(Math.min(e.start+c.chunkSize,e.size)-1,e.start);var r=e.file,s=(r.slice||r.mozSlice||r.webkitSlice).call(r,e.start,e.end+1);e.size&&!s.size?setTimeout(function(){h.end(-1)}):(g.setRequestHeader("Content-Range","bytes "+e.start+"-"+e.end+"/"+e.size),g.setRequestHeader("Content-Disposition","attachment; filename="+encodeURIComponent(e.name)),g.setRequestHeader("Content-Type",e.type||"application/octet-stream"),g.send(s)),r=s=null}else if(g.upload&&g.upload.addEventListener("progress",b.throttle(function(a){c.progress(a,h,c)},100),!1),g.onreadystatechange=function(){if(h.status=g.status,h.statusText=g.statusText,h.readyState=g.readyState,4==g.readyState){for(var a in f)h["response"+a]=g["response"+a];if(g.onreadystatechange=null,!g.status||g.status>201)if(b.log("Error: "+g.status),(!g.status&&!g.aborted||500==g.status)&&(c.retry||0)<c.uploadRetry){c.retry=(c.retry||0)+1;var d=b.networkDownRetryTimeout;c.pause(c.file,c),setTimeout(function(){h._send(c,e)},d)}else h.end(g.status);else h.end(g.status);g=null}},b.isArray(e)){g.setRequestHeader("Content-Type","multipart/form-data; boundary=_"+b.expando);var t=e.join("")+"--_"+b.expando+"--";if(g.sendAsBinary)g.sendAsBinary(t);else{var u=Array.prototype.map.call(t,function(a){return 255&a.charCodeAt(0)});g.send(new Uint8Array(u).buffer)}}else g.send(e)}}},b.XHR=e}(window,FileAPI),function(a,b){"use strict";function c(a){return a>=0?a+"px":a}function d(a){var c,d=f.createElement("canvas"),e=!1;try{c=d.getContext("2d"),c.drawImage(a,0,0,1,1),e=255!=c.getImageData(0,0,1,1).data[4]}catch(g){b.log("[FileAPI.Camera] detectVideoSignal:",g)}return e}var e=a.URL||a.webkitURL,f=a.document,g=a.navigator,h=g.getUserMedia||g.webkitGetUserMedia||g.mozGetUserMedia||g.msGetUserMedia,i=!!h;b.support.media=i;var j=function(a){this.video=a};j.prototype={isActive:function(){return!!this._active},start:function(a){var b,c,f=this,i=f.video,j=function(d){f._active=!d,clearTimeout(c),clearTimeout(b),a&&a(d,f)};h.call(g,{video:!0},function(a){f.stream=a,i.src=e.createObjectURL(a),b=setInterval(function(){d(i)&&j(null)},1e3),c=setTimeout(function(){j("timeout");
	},5e3),i.play()},j)},stop:function(){try{this._active=!1,this.video.pause();try{this.stream.stop()}catch(a){b.each(this.stream.getTracks(),function(a){a.stop()})}this.stream=null}catch(a){b.log("[FileAPI.Camera] stop:",a)}},shot:function(){return new k(this.video)}},j.get=function(a){return new j(a.firstChild)},j.publish=function(d,e,g){"function"==typeof e&&(g=e,e={}),e=b.extend({},{width:"100%",height:"100%",start:!0},e),d.jquery&&(d=d[0]);var h=function(a){if(a)g(a);else{var b=j.get(d);e.start?b.start(g):g(null,b)}};if(d.style.width=c(e.width),d.style.height=c(e.height),b.html5&&i){var k=f.createElement("video");k.style.width=c(e.width),k.style.height=c(e.height),a.jQuery?jQuery(d).empty():d.innerHTML="",d.appendChild(k),h()}else j.fallback(d,e,h)},j.fallback=function(a,b,c){c("not_support_camera")};var k=function(a){var c=a.nodeName?b.Image.toCanvas(a):a,d=b.Image(c);return d.type="image/png",d.width=c.width,d.height=c.height,d.size=c.width*c.height*4,d};j.Shot=k,b.Camera=j}(window,FileAPI),function(a,b,c){"use strict";var d=a.document,e=a.location,f=a.navigator,g=c.each;c.support.flash=function(){var b=f.mimeTypes,d=!1;if(f.plugins&&"object"==typeof f.plugins["Shockwave Flash"])d=f.plugins["Shockwave Flash"].description&&!(b&&b["application/x-shockwave-flash"]&&!b["application/x-shockwave-flash"].enabledPlugin);else try{d=!(!a.ActiveXObject||!new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))}catch(g){c.log("Flash -- does not supported.")}return d&&/^file:/i.test(e)&&c.log("[warn] Flash does not work on `file:` protocol."),d}(),c.support.flash&&(!c.html5||!c.support.html5||c.cors&&!c.support.cors||c.media&&!c.support.media)&&function(){function h(a){return('<object id="#id#" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+(a.width||"100%")+'" height="'+(a.height||"100%")+'"><param name="movie" value="#src#" /><param name="flashvars" value="#flashvars#" /><param name="swliveconnect" value="true" /><param name="allowscriptaccess" value="always" /><param name="allownetworking" value="all" /><param name="menu" value="false" /><param name="wmode" value="#wmode#" /><embed flashvars="#flashvars#" swliveconnect="true" allownetworking="all" allowscriptaccess="always" name="#id#" src="#src#" width="'+(a.width||"100%")+'" height="'+(a.height||"100%")+'" menu="false" wmode="transparent" type="application/x-shockwave-flash"></embed></object>').replace(/#(\w+)#/gi,function(b,c){return a[c]})}function i(a,b){if(a&&a.style){var c,d;for(c in b){d=b[c],"number"==typeof d&&(d+="px");try{a.style[c]=d}catch(e){}}}}function j(a,b){g(b,function(b,c){var d=a[c];a[c]=function(){return this.parent=d,b.apply(this,arguments)}})}function k(a){return a&&!a.flashId}function l(a){var b=a.wid=c.uid();return v._fn[b]=a,"FileAPI.Flash._fn."+b}function m(a){try{v._fn[a.wid]=null,delete v._fn[a.wid]}catch(b){}}function n(a,b){if(!u.test(a)){if(/^\.\//.test(a)||"/"!=a.charAt(0)){var c=e.pathname;c=c.substr(0,c.lastIndexOf("/")),a=(c+"/"+a).replace("/./","/")}"//"!=a.substr(0,2)&&(a="//"+e.host+a),u.test(a)||(a=e.protocol+a)}return b&&(a+=(/\?/.test(a)?"&":"?")+b),a}function o(a,b,e){function f(){try{var a=v.get(j);a.setImage(b)}catch(d){c.log('[err] FlashAPI.Preview.setImage -- can not set "base64":',d)}}var g,j=c.uid(),k=d.createElement("div"),o=10;for(g in a)k.setAttribute(g,a[g]),k[g]=a[g];i(k,a),a.width="100%",a.height="100%",k.innerHTML=h(c.extend({id:j,src:n(c.flashImageUrl,"r="+c.uid()),wmode:"opaque",flashvars:"scale="+a.scale+"&callback="+l(function p(){return m(p),--o>0&&f(),!0})},a)),e(!1,k),k=null}function p(a){return{id:a.id,name:a.name,matrix:a.matrix,flashId:a.flashId}}function q(b){var c=b.getBoundingClientRect(),e=d.body,f=(b&&b.ownerDocument).documentElement;return{top:c.top+(a.pageYOffset||f.scrollTop)-(f.clientTop||e.clientTop||0),left:c.left+(a.pageXOffset||f.scrollLeft)-(f.clientLeft||e.clientLeft||0),width:c.right-c.left,height:c.bottom-c.top}}var r=c.uid(),s=0,t={},u=/^https?:/i,v={_fn:{},init:function(){var a=d.body&&d.body.firstChild;if(a)do if(1==a.nodeType){c.log("FlashAPI.state: awaiting");var b=d.createElement("div");return b.id="_"+r,i(b,{top:1,right:1,width:5,height:5,position:"absolute",zIndex:"2147483647"}),a.parentNode.insertBefore(b,a),void v.publish(b,r)}while(a=a.nextSibling);10>s&&setTimeout(v.init,50*++s)},publish:function(a,b,d){d=d||{},a.innerHTML=h({id:b,src:n(c.flashUrl,"r="+c.version),wmode:d.camera?"":"transparent",flashvars:"callback="+(d.onEvent||"FileAPI.Flash.onEvent")+"&flashId="+b+"&storeKey="+f.userAgent.match(/\d/gi).join("")+"_"+c.version+(v.isReady||(c.pingUrl?"&ping="+c.pingUrl:""))+"&timeout="+c.flashAbortTimeout+(d.camera?"&useCamera="+n(c.flashWebcamUrl):"")+"&debug="+(c.debug?"1":"")},d)},ready:function(){c.log("FlashAPI.state: ready"),v.ready=c.F,v.isReady=!0,v.patch(),v.patchCamera&&v.patchCamera(),c.event.on(d,"mouseover",v.mouseover),c.event.on(d,"click",function(a){v.mouseover(a)&&(a.preventDefault?a.preventDefault():a.returnValue=!0)})},getEl:function(){return d.getElementById("_"+r)},getWrapper:function(a){do if(/js-fileapi-wrapper/.test(a.className))return a;while((a=a.parentNode)&&a!==d.body)},mouseover:function(a){var b=c.event.fix(a).target;if(/input/i.test(b.nodeName)&&"file"==b.type&&!b.disabled){var e=b.getAttribute(r),f=v.getWrapper(b);if(c.multiFlash){if("i"==e||"r"==e)return!1;if("p"!=e){b.setAttribute(r,"i");var g=d.createElement("div");if(!f)return void c.log("[err] FlashAPI.mouseover: js-fileapi-wrapper not found");i(g,{top:0,left:0,width:b.offsetWidth,height:b.offsetHeight,zIndex:"2147483647",position:"absolute"}),f.appendChild(g),v.publish(g,c.uid()),b.setAttribute(r,"p")}return!0}if(f){var h=q(f);i(v.getEl(),h),v.curInp=b}}else/object|embed/i.test(b.nodeName)||i(v.getEl(),{top:1,left:1,width:5,height:5})},onEvent:function(a){var b=a.type;if("ready"==b){try{v.getInput(a.flashId).setAttribute(r,"r")}catch(d){}return v.ready(),setTimeout(function(){v.mouseenter(a)},50),!0}"ping"===b?c.log("(flash -> js).ping:",[a.status,a.savedStatus],a.error):"log"===b?c.log("(flash -> js).log:",a.target):b in v&&setTimeout(function(){c.log("FlashAPI.event."+a.type+":",a),v[b](a)},1)},mouseenter:function(a){var b=v.getInput(a.flashId);if(b){v.cmd(a,"multiple",null!=b.getAttribute("multiple"));var d=[],e={};g((b.getAttribute("accept")||"").split(/,\s*/),function(a){c.accept[a]&&g(c.accept[a].split(" "),function(a){e[a]=1})}),g(e,function(a,b){d.push(b)}),v.cmd(a,"accept",d.length?d.join(",")+","+d.join(",").toUpperCase():"*")}},get:function(b){return d[b]||a[b]||d.embeds[b]},getInput:function(a){if(!c.multiFlash)return v.curInp;try{var b=v.getWrapper(v.get(a));if(b)return b.getElementsByTagName("input")[0]}catch(d){c.log('[err] Can not find "input" by flashId:',a,d)}},select:function(a){var e,f=v.getInput(a.flashId),h=c.uid(f),i=a.target.files;g(i,function(a){c.checkFileObj(a)}),t[h]=i,d.createEvent?(e=d.createEvent("Event"),e.files=i,e.initEvent("change",!0,!0),f.dispatchEvent(e)):b?b(f).trigger({type:"change",files:i}):(e=d.createEventObject(),e.files=i,f.fireEvent("onchange",e))},cmd:function(a,b,d,e){try{return c.log("(js -> flash)."+b+":",d),v.get(a.flashId||a).cmd(b,d)}catch(f){c.log("(js -> flash).onError:",f.toString()),e||setTimeout(function(){v.cmd(a,b,d,!0)},50)}},patch:function(){c.flashEngine=!0,j(c,{getFiles:function(a,b,d){if(d)return c.filterFiles(c.getFiles(a),b,d),null;var e=c.isArray(a)?a:t[c.uid(a.target||a.srcElement||a)];return e?(b&&(b=c.getFilesFilter(b),e=c.filter(e,function(a){return b.test(a.name)})),e):this.parent.apply(this,arguments)},getInfo:function(a,b){if(k(a))this.parent.apply(this,arguments);else if(a.isShot)b(null,a.info={width:a.width,height:a.height});else{if(!a.__info){var d=a.__info=c.defer();v.cmd(a,"getFileInfo",{id:a.id,callback:l(function e(b,c){m(e),d.resolve(b,a.info=c)})})}a.__info.then(b)}}}),c.support.transform=!0,c.Image&&j(c.Image.prototype,{get:function(a,b){return this.set({scaleMode:b||"noScale"}),this.parent(a)},_load:function(a,b){if(c.log("FlashAPI.Image._load:",a),k(a))this.parent.apply(this,arguments);else{var d=this;c.getInfo(a,function(c){b.call(d,c,a)})}},_apply:function(a,b){if(c.log("FlashAPI.Image._apply:",a),k(a))this.parent.apply(this,arguments);else{var d=this.getMatrix(a.info),e=b;v.cmd(a,"imageTransform",{id:a.id,matrix:d,callback:l(function f(g,h){c.log("FlashAPI.Image._apply.callback:",g),m(f),g?e(g):c.support.html5||c.support.dataURI&&!(h.length>3e4)?(d.filter&&(e=function(a,e){a?b(a):c.Image.applyFilter(e,d.filter,function(){b(a,this.canvas)})}),c.newImage("data:"+a.type+";base64,"+h,e)):o({width:d.deg%180?d.dh:d.dw,height:d.deg%180?d.dw:d.dh,scale:d.scaleMode},h,e)})})}},toData:function(a){var b=this.file,d=b.info,e=this.getMatrix(d);c.log("FlashAPI.Image.toData"),k(b)?this.parent.apply(this,arguments):("auto"==e.deg&&(e.deg=c.Image.exifOrientation[d&&d.exif&&d.exif.Orientation]||0),a.call(this,!b.info,{id:b.id,flashId:b.flashId,name:b.name,type:b.type,matrix:e}))}}),c.Image&&j(c.Image,{fromDataURL:function(a,b,d){!c.support.dataURI||a.length>3e4?o(c.extend({scale:"exactFit"},b),a.replace(/^data:[^,]+,/,""),function(a,b){d(b)}):this.parent(a,b,d)}}),j(c.Form.prototype,{toData:function(a){for(var b=this.items,d=b.length;d--;)if(b[d].file&&k(b[d].blob))return this.parent.apply(this,arguments);c.log("FlashAPI.Form.toData"),a(b)}}),j(c.XHR.prototype,{_send:function(a,b){if(b.nodeName||b.append&&c.support.html5||c.isArray(b)&&"string"==typeof b[0])return this.parent.apply(this,arguments);var d,e,f={},h={},i=this;if(g(b,function(a){a.file?(h[a.name]=a=p(a.blob),e=a.id,d=a.flashId):f[a.name]=a.blob}),e||(d=r),!d)return c.log("[err] FlashAPI._send: flashId -- undefined"),this.parent.apply(this,arguments);c.log("FlashAPI.XHR._send: "+d+" -> "+e),i.xhr={headers:{},abort:function(){v.cmd(d,"abort",{id:e})},getResponseHeader:function(a){return this.headers[a]},getAllResponseHeaders:function(){return this.headers}};var j=c.queue(function(){v.cmd(d,"upload",{url:n(a.url.replace(/([a-z]+)=(\?)&?/i,"")),data:f,files:e?h:null,headers:a.headers||{},callback:l(function b(d){var e=d.type,f=d.result;c.log("FlashAPI.upload."+e),"progress"==e?(d.loaded=Math.min(d.loaded,d.total),d.lengthComputable=!0,a.progress(d)):"complete"==e?(m(b),"string"==typeof f&&(i.responseText=f.replace(/%22/g,'"').replace(/%5c/g,"\\").replace(/%26/g,"&").replace(/%25/g,"%")),i.end(d.status||200)):("abort"==e||"error"==e)&&(i.end(d.status||0,d.message),m(b))})})});g(h,function(a){j.inc(),c.getInfo(a,j.next)}),j.check()}})}};c.Flash=v,c.newImage("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",function(a,b){c.support.dataURI=!(1!=b.width||1!=b.height),v.init()})}()}(window,window.jQuery,FileAPI),function(a,b,c){"use strict";var d=c.each,e=[];!c.support.flash||!c.media||c.support.media&&c.html5||!function(){function a(a){var b=a.wid=c.uid();return c.Flash._fn[b]=a,"FileAPI.Flash._fn."+b}function b(a){try{c.Flash._fn[a.wid]=null,delete c.Flash._fn[a.wid]}catch(b){}}var f=c.Flash;c.extend(c.Flash,{patchCamera:function(){c.Camera.fallback=function(d,e,g){var h=c.uid();c.log("FlashAPI.Camera.publish: "+h),f.publish(d,h,c.extend(e,{camera:!0,onEvent:a(function i(a){"camera"===a.type&&(b(i),a.error?(c.log("FlashAPI.Camera.publish.error: "+a.error),g(a.error)):(c.log("FlashAPI.Camera.publish.success: "+h),g(null)))})}))},d(e,function(a){c.Camera.fallback.apply(c.Camera,a)}),e=[],c.extend(c.Camera.prototype,{_id:function(){return this.video.id},start:function(d){var e=this;f.cmd(this._id(),"camera.on",{callback:a(function g(a){b(g),a.error?(c.log("FlashAPI.camera.on.error: "+a.error),d(a.error,e)):(c.log("FlashAPI.camera.on.success: "+e._id()),e._active=!0,d(null,e))})})},stop:function(){this._active=!1,f.cmd(this._id(),"camera.off")},shot:function(){c.log("FlashAPI.Camera.shot:",this._id());var a=c.Flash.cmd(this._id(),"shot",{});return a.type="image/png",a.flashId=this._id(),a.isShot=!0,new c.Camera.Shot(a)}})}}),c.Camera.fallback=function(){e.push(arguments)}}()}(window,window.jQuery,FileAPI),"function"=="function"&&__webpack_require__(31)&&!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return FileAPI}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 31 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;

	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 32 */
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
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(34);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(41)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../css-loader/index.js?sourceMap!./jquery.filer.css", function() {
				var newContent = require("!!./../../css-loader/index.js?sourceMap!./jquery.filer.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(35)();
	// imports
	exports.i(__webpack_require__(36), "");

	// module
	exports.push([module.id, "/*!\n * CSS jQuery.filer\n * Copyright (c) 2015 CreativeDream\n * Version: 1.0.4 (29-Oct-2015)\n*/\n\n/*-------------------------\n\tBasic configurations\n-------------------------*/\n.jFiler * {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.jFiler {\n    font-family: sans-serif;\n    font-size: 14px;\n    color: #494949;\n}\n\n/* Helpers */\n.jFiler ul.list-inline li {\n    display: inline-block;\n    padding-right: 5px;\n    padding-left: 5px;\n}\n\n.jFiler .pull-left {\n    float: left;\n}\n\n.jFiler .pull-right {\n    float: right;\n}\n\n/* File Icons */\nspan.jFiler-icon-file {\n    position: relative;\n    width: 57px;\n    height: 70px;\n    display: inline-block;\n    line-height: 70px;\n    text-align: center;\n    border-radius: 3px;\n    color: #fff;\n    font-family: sans-serif;\n    font-size: 13px;\n    font-weight: bold;\n    overflow: hidden;\n    box-shadow: 42px -55px 0 0 #A4A7AC inset;\n}\n\nspan.jFiler-icon-file:after {\n    position: absolute;\n    top: -1px;\n    right: -1px;\n    display: inline-block;\n    content: '';\n    border-style: solid;\n    border-width: 16px 0 0 16px;\n    border-color: transparent transparent transparent #DADDE1;\n}\n\nspan.jFiler-icon-file i[class*=\"icon-jfi-\"] {\n    font-size: 24px;\n}\n\nspan.jFiler-icon-file.f-image {\n    box-shadow: 42px -55px 0 0 #e15955 inset;\n}\n\nspan.jFiler-icon-file.f-image:after {\n    border-left-color: #c6393f;\n}\n\nspan.jFiler-icon-file.f-video {\n    box-shadow: 42px -55px 0 0 #4183d7 inset;\n}\n\nspan.jFiler-icon-file.f-video:after {\n    border-left-color: #446cb3;\n}\n\nspan.jFiler-icon-file.f-audio {\n    box-shadow: 42px -55px 0 0 #5bab6e inset;\n}\n\nspan.jFiler-icon-file.f-audio:after {\n    border-left-color: #448353;\n}\n\n\n/* Progress Bar */\n.jFiler-jProgressBar {\n    height: 8px;\n    background: #f1f1f1;\n    margin-top: 3px;\n    margin-bottom: 0;\n    overflow: hidden;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n}\n\n.jFiler-jProgressBar .bar {\n    float: left;\n    width: 0;\n    height: 100%;\n    font-size: 12px;\n    color: #ffffff;\n    text-align: center;\n    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);\n    background-color: #50A1E9;\n    box-sizing: border-box;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n    -webkit-transition: width 0.3s ease;\n    -moz-transition: width 0.3s ease;\n    -o-transition: width 0.3s ease;\n    transition: width 0.3s ease;\n}\n\n.jFiler-jProgressBar .bar.dark {\n    background-color: #555;\n}\n\n.jFiler-jProgressBar .bar.blue {\n    background-color: #428bca;\n}\n\n.jFiler-jProgressBar .bar.green {\n    background-color: #5cb85c;\n}\n\n.jFiler-jProgressBar .bar.orange {\n    background-color: #f7a923;\n}\n\n.jFiler-jProgressBar .bar.red {\n    background-color: #d9534f;\n}\n\n/* Thumbs */\n.jFiler-row:after,\n.jFiler-item:after {\n    display: table;\n    line-height: 0;\n    content: \"\";\n    clear: both;\n}\n\n.jFiler-items ul {\n    margin: 0;\n    padding: 0;\n    list-style: none;\n}\n\n/*-------------------------\n\tDefault Theme\n-------------------------*/\n.jFiler-theme-default .jFiler-input {\n    position: relative;\n    display: block;\n    width: 400px;\n    height: 35px;\n    margin: 0 0 15px 0;\n    background: #fefefe;\n    border: 1px solid #cecece;\n    font-size: 12px;\n    font-family: sans-serif;\n    color: #888;\n    border-radius: 4px;\n    cursor: pointer;\n    overflow: hidden;\n    -webkit-box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n       -moz-box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n            box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n}\n\n.jFiler-theme-default .jFiler-input.focused {\n    outline: none;\n    -webkit-box-shadow: 0 0 7px rgba(0,0,0,0.1);\n    -moz-box-shadow: 0 0 7px rgba(0,0,0,0.1);\n    box-shadow: 0 0 7px rgba(0,0,0,0.1);\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input {\n    border: 1px dashed #aaaaaa;\n    background: #f9f9f9;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input:hover {\n    background: #FFF8D0;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input * {\n    pointer-events: none;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input .jFiler-input-caption {\n    width: 100%;\n    text-align: center;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input .jFiler-input-button {\n    display: none;\n}\n\n.jFiler-theme-default .jFiler-input-caption {\n    display: block;\n    float: left;\n    height: 100%;\n    padding-top: 8px;\n    padding-left: 10px;\n    text-overflow: ellipsis;\n    overflow: hidden;\n}\n\n.jFiler-theme-default .jFiler-input-button {\n    display: block;\n    float: right;\n    height: 100%;\n    padding-top: 8px;\n    padding-left: 15px;\n    padding-right: 15px;\n    border-left: 1px solid #ccc;\n    color: #666666;\n    text-align: center;\n    background-color: #fefefe;\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#fefefe),to(#f1f1f1));\n    background-image: -webkit-linear-gradient(top,#fefefe,#f1f1f1);\n    background-image: -o-linear-gradient(top,#fefefe,#f1f1f1);\n    background-image: linear-gradient(to bottom,#fefefe,#f1f1f1);\n    background-image: -moz-linear-gradient(top,#fefefe,#f1f1f1);\n    -webkit-transition: all .1s ease-out;\n       -moz-transition: all .1s ease-out;\n         -o-transition: all .1s ease-out;\n            transition: all .1s ease-out;\n}\n\n.jFiler-theme-default .jFiler-input-button:hover {\n    -moz-box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n    -webkit-box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n    box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n}\n\n.jFiler-theme-default .jFiler-input-button:active {\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#f1f1f1),to(#fefefe));\n    background-image: -webkit-linear-gradient(top,#f1f1f1,#fefefe);\n    background-image: -o-linear-gradient(top,#f1f1f1,#fefefe);\n    background-image: linear-gradient(to bottom,#f1f1f1,#fefefe);\n    background-image: -moz-linear-gradient(top,#f1f1f1,#fefefe);\n}\n\n/*-------------------------\n\tThumbnails\n-------------------------*/\n.jFiler-items-default .jFiler-items {\n    \n}\n\n.jFiler-items-default .jFiler-item {\n    position: relative;\n    padding: 16px;\n    margin-bottom: 16px;\n    background: #f7f7f7;\n    color: #4d4d4c;\n}\n\n\n.jFiler-items-default .jFiler-item .jFiler-item-icon {\n    font-size: 32px;\n    color: #f5871f;\n    \n    margin-right: 15px;\n    margin-top: -3px;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-title {\n    font-weight: bold;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-others {\n    font-size: 12px;\n    color: #777;\n    margin-left: -5px;\n    margin-right: -5px;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-others span {\n    padding-left: 5px;\n    padding-right: 5px;\n}\n\n.jFiler-items-default .jFiler-item-assets {\n    position: absolute;\n    display: block;\n    right: 16px;\n    top: 50%;\n    margin-top: -10px;\n}\n\n.jFiler-items-default .jFiler-item-assets a {\n    padding: 8px 9px 8px 12px;\n    cursor: pointer;\n    background: #fafafa;\n    color: #777;\n    border-radius: 4px;\n    border: 1px solid #e3e3e3\n}\n\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:hover,\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:active {\n    color: #d9534f;\n}\n\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:active {\n    background: transparent;\n}\n\n/* Thumbnails: Grid */\n.jFiler-items-grid .jFiler-item {\n    float: left;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container {\n    position: relative;\n    margin: 0 20px 30px 0;\n    padding: 10px;\n    border: 1px solid #e1e1e1;\n    border-radius: 3px;\n    background: #fff;\n    -webkit-box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n    -moz-box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n    box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb {\n    position: relative;\n    width: 160px;\n    height: 115px;\n    min-height: 115px;\n    border: 1px solid #e1e1e1;\n    overflow: hidden;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb .jFiler-item-thumb-image {\n    width: 100%;\n    height: 100%;\n    text-align: center;\n}\n\n.jFiler-item .jFiler-item-container .jFiler-item-thumb img {\n    max-width: none;\n    max-height: 100%;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb span.jFiler-icon-file {\n    margin-top: 20px;\n}\n\n.jFiler-items-grid .jFiler-item-thumb-image.fi-loading {\n    background: url('data:image/gif;base64,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') no-repeat center;\n    width: 100%;\n    height: 100%;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info {\n    position: absolute;\n    bottom: -10%;\n    left: 0;\n    width: 100%;\n    color: #fff;\n    padding: 6px 10px;\n    background: -moz-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -webkit-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -o-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -ms-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: linear-gradient(to top,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    z-index: 9;\n    opacity: 0;\n    filter: alpha(opacity(0));\n    -webkit-transition: all 0.12s;\n    -moz-transition: all 0.12s;\n    transition: all 0.12s;\n}\n\n.jFiler-items-grid .jFiler-no-thumbnail.jFiler-item .jFiler-item-container .jFiler-item-info {\n    background: rgba(0,0,0,0.55);\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb:hover .jFiler-item-info {\n    bottom: 0;\n    opacity: 1;\n    filter: aplpha(opacity(100));\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info .jFiler-item-title {\n    display: block;\n    font-weight: bold;\n    word-break: break-all;\n    line-height: 1;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info .jFiler-item-others {\n    display: inline-block;\n    font-size: 10px;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets {\n    margin-top: 10px;\n    color: #999;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .text-success {\n    color: #3C763D\n}\n\n.jFiler-items-grid .jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .text-error {\n    color: #A94442\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .jFiler-jProgressBar {\n    width: 120px;\n    margin-left: -5px;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .jFiler-item-others {\n    font-size: 12px;\n}\n\n.jFiler-items-grid .jFiler-item-trash-action:hover {\n    cursor: pointer;\n    color: #d9534f;\n}", "", {"version":3,"sources":["/./node_modules/jquery.filer/css/jquery.filer.css"],"names":[],"mappings":"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","file":"jquery.filer.css","sourcesContent":["/*!\n * CSS jQuery.filer\n * Copyright (c) 2015 CreativeDream\n * Version: 1.0.4 (29-Oct-2015)\n*/\n@import url('../assets/fonts/jquery.filer-icons/jquery-filer.css');\n\n/*-------------------------\n\tBasic configurations\n-------------------------*/\n.jFiler * {\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n}\n\n.jFiler {\n    font-family: sans-serif;\n    font-size: 14px;\n    color: #494949;\n}\n\n/* Helpers */\n.jFiler ul.list-inline li {\n    display: inline-block;\n    padding-right: 5px;\n    padding-left: 5px;\n}\n\n.jFiler .pull-left {\n    float: left;\n}\n\n.jFiler .pull-right {\n    float: right;\n}\n\n/* File Icons */\nspan.jFiler-icon-file {\n    position: relative;\n    width: 57px;\n    height: 70px;\n    display: inline-block;\n    line-height: 70px;\n    text-align: center;\n    border-radius: 3px;\n    color: #fff;\n    font-family: sans-serif;\n    font-size: 13px;\n    font-weight: bold;\n    overflow: hidden;\n    box-shadow: 42px -55px 0 0 #A4A7AC inset;\n}\n\nspan.jFiler-icon-file:after {\n    position: absolute;\n    top: -1px;\n    right: -1px;\n    display: inline-block;\n    content: '';\n    border-style: solid;\n    border-width: 16px 0 0 16px;\n    border-color: transparent transparent transparent #DADDE1;\n}\n\nspan.jFiler-icon-file i[class*=\"icon-jfi-\"] {\n    font-size: 24px;\n}\n\nspan.jFiler-icon-file.f-image {\n    box-shadow: 42px -55px 0 0 #e15955 inset;\n}\n\nspan.jFiler-icon-file.f-image:after {\n    border-left-color: #c6393f;\n}\n\nspan.jFiler-icon-file.f-video {\n    box-shadow: 42px -55px 0 0 #4183d7 inset;\n}\n\nspan.jFiler-icon-file.f-video:after {\n    border-left-color: #446cb3;\n}\n\nspan.jFiler-icon-file.f-audio {\n    box-shadow: 42px -55px 0 0 #5bab6e inset;\n}\n\nspan.jFiler-icon-file.f-audio:after {\n    border-left-color: #448353;\n}\n\n\n/* Progress Bar */\n.jFiler-jProgressBar {\n    height: 8px;\n    background: #f1f1f1;\n    margin-top: 3px;\n    margin-bottom: 0;\n    overflow: hidden;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n}\n\n.jFiler-jProgressBar .bar {\n    float: left;\n    width: 0;\n    height: 100%;\n    font-size: 12px;\n    color: #ffffff;\n    text-align: center;\n    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);\n    background-color: #50A1E9;\n    box-sizing: border-box;\n    -webkit-border-radius: 4px;\n    -moz-border-radius: 4px;\n    border-radius: 4px;\n    -webkit-transition: width 0.3s ease;\n    -moz-transition: width 0.3s ease;\n    -o-transition: width 0.3s ease;\n    transition: width 0.3s ease;\n}\n\n.jFiler-jProgressBar .bar.dark {\n    background-color: #555;\n}\n\n.jFiler-jProgressBar .bar.blue {\n    background-color: #428bca;\n}\n\n.jFiler-jProgressBar .bar.green {\n    background-color: #5cb85c;\n}\n\n.jFiler-jProgressBar .bar.orange {\n    background-color: #f7a923;\n}\n\n.jFiler-jProgressBar .bar.red {\n    background-color: #d9534f;\n}\n\n/* Thumbs */\n.jFiler-row:after,\n.jFiler-item:after {\n    display: table;\n    line-height: 0;\n    content: \"\";\n    clear: both;\n}\n\n.jFiler-items ul {\n    margin: 0;\n    padding: 0;\n    list-style: none;\n}\n\n/*-------------------------\n\tDefault Theme\n-------------------------*/\n.jFiler-theme-default .jFiler-input {\n    position: relative;\n    display: block;\n    width: 400px;\n    height: 35px;\n    margin: 0 0 15px 0;\n    background: #fefefe;\n    border: 1px solid #cecece;\n    font-size: 12px;\n    font-family: sans-serif;\n    color: #888;\n    border-radius: 4px;\n    cursor: pointer;\n    overflow: hidden;\n    -webkit-box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n       -moz-box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n            box-shadow: rgba(0,0,0,.25) 0 4px 5px -5px inset;\n}\n\n.jFiler-theme-default .jFiler-input.focused {\n    outline: none;\n    -webkit-box-shadow: 0 0 7px rgba(0,0,0,0.1);\n    -moz-box-shadow: 0 0 7px rgba(0,0,0,0.1);\n    box-shadow: 0 0 7px rgba(0,0,0,0.1);\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input {\n    border: 1px dashed #aaaaaa;\n    background: #f9f9f9;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input:hover {\n    background: #FFF8D0;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input * {\n    pointer-events: none;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input .jFiler-input-caption {\n    width: 100%;\n    text-align: center;\n}\n\n.jFiler-theme-default .jFiler.dragged .jFiler-input .jFiler-input-button {\n    display: none;\n}\n\n.jFiler-theme-default .jFiler-input-caption {\n    display: block;\n    float: left;\n    height: 100%;\n    padding-top: 8px;\n    padding-left: 10px;\n    text-overflow: ellipsis;\n    overflow: hidden;\n}\n\n.jFiler-theme-default .jFiler-input-button {\n    display: block;\n    float: right;\n    height: 100%;\n    padding-top: 8px;\n    padding-left: 15px;\n    padding-right: 15px;\n    border-left: 1px solid #ccc;\n    color: #666666;\n    text-align: center;\n    background-color: #fefefe;\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#fefefe),to(#f1f1f1));\n    background-image: -webkit-linear-gradient(top,#fefefe,#f1f1f1);\n    background-image: -o-linear-gradient(top,#fefefe,#f1f1f1);\n    background-image: linear-gradient(to bottom,#fefefe,#f1f1f1);\n    background-image: -moz-linear-gradient(top,#fefefe,#f1f1f1);\n    -webkit-transition: all .1s ease-out;\n       -moz-transition: all .1s ease-out;\n         -o-transition: all .1s ease-out;\n            transition: all .1s ease-out;\n}\n\n.jFiler-theme-default .jFiler-input-button:hover {\n    -moz-box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n    -webkit-box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n    box-shadow: inset 0 0 10px rgba(0,0,0,0.07);\n}\n\n.jFiler-theme-default .jFiler-input-button:active {\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#f1f1f1),to(#fefefe));\n    background-image: -webkit-linear-gradient(top,#f1f1f1,#fefefe);\n    background-image: -o-linear-gradient(top,#f1f1f1,#fefefe);\n    background-image: linear-gradient(to bottom,#f1f1f1,#fefefe);\n    background-image: -moz-linear-gradient(top,#f1f1f1,#fefefe);\n}\n\n/*-------------------------\n\tThumbnails\n-------------------------*/\n.jFiler-items-default .jFiler-items {\n    \n}\n\n.jFiler-items-default .jFiler-item {\n    position: relative;\n    padding: 16px;\n    margin-bottom: 16px;\n    background: #f7f7f7;\n    color: #4d4d4c;\n}\n\n\n.jFiler-items-default .jFiler-item .jFiler-item-icon {\n    font-size: 32px;\n    color: #f5871f;\n    \n    margin-right: 15px;\n    margin-top: -3px;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-title {\n    font-weight: bold;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-others {\n    font-size: 12px;\n    color: #777;\n    margin-left: -5px;\n    margin-right: -5px;\n}\n\n.jFiler-items-default .jFiler-item .jFiler-item-others span {\n    padding-left: 5px;\n    padding-right: 5px;\n}\n\n.jFiler-items-default .jFiler-item-assets {\n    position: absolute;\n    display: block;\n    right: 16px;\n    top: 50%;\n    margin-top: -10px;\n}\n\n.jFiler-items-default .jFiler-item-assets a {\n    padding: 8px 9px 8px 12px;\n    cursor: pointer;\n    background: #fafafa;\n    color: #777;\n    border-radius: 4px;\n    border: 1px solid #e3e3e3\n}\n\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:hover,\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:active {\n    color: #d9534f;\n}\n\n.jFiler-items-default .jFiler-item-assets .jFiler-item-trash-action:active {\n    background: transparent;\n}\n\n/* Thumbnails: Grid */\n.jFiler-items-grid .jFiler-item {\n    float: left;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container {\n    position: relative;\n    margin: 0 20px 30px 0;\n    padding: 10px;\n    border: 1px solid #e1e1e1;\n    border-radius: 3px;\n    background: #fff;\n    -webkit-box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n    -moz-box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n    box-shadow: 0px 0px 3px rgba(0,0,0,0.06);\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb {\n    position: relative;\n    width: 160px;\n    height: 115px;\n    min-height: 115px;\n    border: 1px solid #e1e1e1;\n    overflow: hidden;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb .jFiler-item-thumb-image {\n    width: 100%;\n    height: 100%;\n    text-align: center;\n}\n\n.jFiler-item .jFiler-item-container .jFiler-item-thumb img {\n    max-width: none;\n    max-height: 100%;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb span.jFiler-icon-file {\n    margin-top: 20px;\n}\n\n.jFiler-items-grid .jFiler-item-thumb-image.fi-loading {\n    background: url('data:image/gif;base64,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') no-repeat center;\n    width: 100%;\n    height: 100%;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info {\n    position: absolute;\n    bottom: -10%;\n    left: 0;\n    width: 100%;\n    color: #fff;\n    padding: 6px 10px;\n    background: -moz-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -webkit-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -o-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: -ms-linear-gradient(bottom,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    background: linear-gradient(to top,rgba(0,0,0,1) 0,rgba(0,0,0,0) 100%);\n    z-index: 9;\n    opacity: 0;\n    filter: alpha(opacity(0));\n    -webkit-transition: all 0.12s;\n    -moz-transition: all 0.12s;\n    transition: all 0.12s;\n}\n\n.jFiler-items-grid .jFiler-no-thumbnail.jFiler-item .jFiler-item-container .jFiler-item-info {\n    background: rgba(0,0,0,0.55);\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-thumb:hover .jFiler-item-info {\n    bottom: 0;\n    opacity: 1;\n    filter: aplpha(opacity(100));\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info .jFiler-item-title {\n    display: block;\n    font-weight: bold;\n    word-break: break-all;\n    line-height: 1;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-info .jFiler-item-others {\n    display: inline-block;\n    font-size: 10px;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets {\n    margin-top: 10px;\n    color: #999;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .text-success {\n    color: #3C763D\n}\n\n.jFiler-items-grid .jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .text-error {\n    color: #A94442\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .jFiler-jProgressBar {\n    width: 120px;\n    margin-left: -5px;\n}\n\n.jFiler-items-grid .jFiler-item .jFiler-item-container .jFiler-item-assets .jFiler-item-others {\n    font-size: 12px;\n}\n\n.jFiler-items-grid .jFiler-item-trash-action:hover {\n    cursor: pointer;\n    color: #d9534f;\n}"],"sourceRoot":"webpack://"}]);

	// exports


/***/ },
/* 35 */
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
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(35)();
	// imports


	// module
	exports.push([module.id, "/*\n  Icon Font: jquery-filer\n*/\n\n@font-face {\n  font-family: \"jquery-filer\";\n  src: url(" + __webpack_require__(37) + ");\n  src: url(" + __webpack_require__(37) + "?#iefix) format(\"embedded-opentype\"),\n       url(data:application/x-font-woff;charset=utf-8;base64,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),\n       url(" + __webpack_require__(38) + ") format(\"woff\"),\n       url(" + __webpack_require__(39) + ") format(\"truetype\"),\n       url(" + __webpack_require__(40) + "#jquery-filer) format(\"svg\");\n  font-weight: normal;\n  font-style: normal;\n}\n\n@media screen and (-webkit-min-device-pixel-ratio:0) {\n  @font-face {\n    font-family: \"jquery-filer\";\n    src: url(" + __webpack_require__(40) + "#jquery-filer) format(\"svg\");\n  }\n}\n\n[data-icon]:before { content: attr(data-icon); }\n\n[data-icon]:before,\n.icon-jfi-ban:before,\n.icon-jfi-calendar:before,\n.icon-jfi-check:before,\n.icon-jfi-check-circle:before,\n.icon-jfi-cloud-o:before,\n.icon-jfi-cloud-up-o:before,\n.icon-jfi-comment:before,\n.icon-jfi-comment-o:before,\n.icon-jfi-download-o:before,\n.icon-jfi-exclamation:before,\n.icon-jfi-exclamation-circle:before,\n.icon-jfi-exclamation-triangle:before,\n.icon-jfi-external-link:before,\n.icon-jfi-eye:before,\n.icon-jfi-file:before,\n.icon-jfi-file-audio:before,\n.icon-jfi-file-image:before,\n.icon-jfi-file-o:before,\n.icon-jfi-file-text:before,\n.icon-jfi-file-video:before,\n.icon-jfi-files-o:before,\n.icon-jfi-folder:before,\n.icon-jfi-heart:before,\n.icon-jfi-heart-o:before,\n.icon-jfi-history:before,\n.icon-jfi-infinite:before,\n.icon-jfi-info:before,\n.icon-jfi-info-circle:before,\n.icon-jfi-minus:before,\n.icon-jfi-minus-circle:before,\n.icon-jfi-paperclip:before,\n.icon-jfi-pencil:before,\n.icon-jfi-plus:before,\n.icon-jfi-plus-circle:before,\n.icon-jfi-power-off:before,\n.icon-jfi-question:before,\n.icon-jfi-question-circle:before,\n.icon-jfi-reload:before,\n.icon-jfi-settings:before,\n.icon-jfi-sort:before,\n.icon-jfi-times:before,\n.icon-jfi-times-circle:before,\n.icon-jfi-trash:before,\n.icon-jfi-upload-o:before,\n.icon-jfi-user:before,\n.icon-jfi-view-grid:before,\n.icon-jfi-view-list:before,\n.icon-jfi-zip:before {\n  display: inline-block;\n  font-family: \"jquery-filer\";\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n  text-decoration: inherit;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-smoothing: antialiased;\n}\n\n.icon-jfi-ban:before { content: \"\\F328\"; }\n.icon-jfi-calendar:before { content: \"\\F30B\"; }\n.icon-jfi-check:before { content: \"\\F2F6\"; }\n.icon-jfi-check-circle:before { content: \"\\F30C\"; }\n.icon-jfi-cloud-o:before { content: \"\\F329\"; }\n.icon-jfi-cloud-up-o:before { content: \"\\F32A\"; }\n.icon-jfi-comment:before { content: \"\\F32B\"; }\n.icon-jfi-comment-o:before { content: \"\\F30D\"; }\n.icon-jfi-download-o:before { content: \"\\F32C\"; }\n.icon-jfi-exclamation:before { content: \"\\F32D\"; }\n.icon-jfi-exclamation-circle:before { content: \"\\F32E\"; }\n.icon-jfi-exclamation-triangle:before { content: \"\\F32F\"; }\n.icon-jfi-external-link:before { content: \"\\F330\"; }\n.icon-jfi-eye:before { content: \"\\F2F7\"; }\n.icon-jfi-file:before { content: \"\\F31F\"; }\n.icon-jfi-file-audio:before { content: \"\\F331\"; }\n.icon-jfi-file-image:before { content: \"\\F332\"; }\n.icon-jfi-file-o:before { content: \"\\F31D\"; }\n.icon-jfi-file-text:before { content: \"\\F333\"; }\n.icon-jfi-file-video:before { content: \"\\F334\"; }\n.icon-jfi-files-o:before { content: \"\\F335\"; }\n.icon-jfi-folder:before { content: \"\\F31E\"; }\n.icon-jfi-heart:before { content: \"\\F2F8\"; }\n.icon-jfi-heart-o:before { content: \"\\F336\"; }\n.icon-jfi-history:before { content: \"\\F337\"; }\n.icon-jfi-infinite:before { content: \"\\F2FB\"; }\n.icon-jfi-info:before { content: \"\\F338\"; }\n.icon-jfi-info-circle:before { content: \"\\F339\"; }\n.icon-jfi-minus:before { content: \"\\F33A\"; }\n.icon-jfi-minus-circle:before { content: \"\\F33B\"; }\n.icon-jfi-paperclip:before { content: \"\\F33C\"; }\n.icon-jfi-pencil:before { content: \"\\F2FF\"; }\n.icon-jfi-plus:before { content: \"\\F311\"; }\n.icon-jfi-plus-circle:before { content: \"\\F312\"; }\n.icon-jfi-power-off:before { content: \"\\F33D\"; }\n.icon-jfi-question:before { content: \"\\F33E\"; }\n.icon-jfi-question-circle:before { content: \"\\F33F\"; }\n.icon-jfi-reload:before { content: \"\\F300\"; }\n.icon-jfi-settings:before { content: \"\\F340\"; }\n.icon-jfi-sort:before { content: \"\\F303\"; }\n.icon-jfi-times:before { content: \"\\F316\"; }\n.icon-jfi-times-circle:before { content: \"\\F317\"; }\n.icon-jfi-trash:before { content: \"\\F318\"; }\n.icon-jfi-upload-o:before { content: \"\\F341\"; }\n.icon-jfi-user:before { content: \"\\F307\"; }\n.icon-jfi-view-grid:before { content: \"\\F342\"; }\n.icon-jfi-view-list:before { content: \"\\F343\"; }\n.icon-jfi-zip:before { content: \"\\F344\"; }\n", "", {"version":3,"sources":["/./node_modules/jquery.filer/assets/fonts/jquery.filer-icons/jquery-filer.css"],"names":[],"mappings":"AAAA;;EAEE;;AAEF;EACE,4BAA4B;EAC5B,mCAA+B;EAC/B;;;;mDAI0D;EAC1D,oBAAoB;EACpB,mBAAmB;CACpB;;AAED;EACE;IACE,4BAA4B;IAC5B,iDAA0D;GAC3D;CACF;;AAED,qBAAqB,yBAAyB,EAAE;;AAEhD;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;EAiDE,sBAAsB;EACtB,4BAA4B;EAC5B,mBAAmB;EACnB,oBAAoB;EACpB,qBAAqB;EACrB,yBAAyB;EACzB,mCAAmC;EACnC,qBAAqB;EACrB,mCAAmC;EACnC,oCAAoC;EACpC,4BAA4B;CAC7B;;AAED,uBAAuB,iBAAiB,EAAE;AAC1C,4BAA4B,iBAAiB,EAAE;AAC/C,yBAAyB,iBAAiB,EAAE;AAC5C,gCAAgC,iBAAiB,EAAE;AACnD,2BAA2B,iBAAiB,EAAE;AAC9C,8BAA8B,iBAAiB,EAAE;AACjD,2BAA2B,iBAAiB,EAAE;AAC9C,6BAA6B,iBAAiB,EAAE;AAChD,8BAA8B,iBAAiB,EAAE;AACjD,+BAA+B,iBAAiB,EAAE;AAClD,sCAAsC,iBAAiB,EAAE;AACzD,wCAAwC,iBAAiB,EAAE;AAC3D,iCAAiC,iBAAiB,EAAE;AACpD,uBAAuB,iBAAiB,EAAE;AAC1C,wBAAwB,iBAAiB,EAAE;AAC3C,8BAA8B,iBAAiB,EAAE;AACjD,8BAA8B,iBAAiB,EAAE;AACjD,0BAA0B,iBAAiB,EAAE;AAC7C,6BAA6B,iBAAiB,EAAE;AAChD,8BAA8B,iBAAiB,EAAE;AACjD,2BAA2B,iBAAiB,EAAE;AAC9C,0BAA0B,iBAAiB,EAAE;AAC7C,yBAAyB,iBAAiB,EAAE;AAC5C,2BAA2B,iBAAiB,EAAE;AAC9C,2BAA2B,iBAAiB,EAAE;AAC9C,4BAA4B,iBAAiB,EAAE;AAC/C,wBAAwB,iBAAiB,EAAE;AAC3C,+BAA+B,iBAAiB,EAAE;AAClD,yBAAyB,iBAAiB,EAAE;AAC5C,gCAAgC,iBAAiB,EAAE;AACnD,6BAA6B,iBAAiB,EAAE;AAChD,0BAA0B,iBAAiB,EAAE;AAC7C,wBAAwB,iBAAiB,EAAE;AAC3C,+BAA+B,iBAAiB,EAAE;AAClD,6BAA6B,iBAAiB,EAAE;AAChD,4BAA4B,iBAAiB,EAAE;AAC/C,mCAAmC,iBAAiB,EAAE;AACtD,0BAA0B,iBAAiB,EAAE;AAC7C,4BAA4B,iBAAiB,EAAE;AAC/C,wBAAwB,iBAAiB,EAAE;AAC3C,yBAAyB,iBAAiB,EAAE;AAC5C,gCAAgC,iBAAiB,EAAE;AACnD,yBAAyB,iBAAiB,EAAE;AAC5C,4BAA4B,iBAAiB,EAAE;AAC/C,wBAAwB,iBAAiB,EAAE;AAC3C,6BAA6B,iBAAiB,EAAE;AAChD,6BAA6B,iBAAiB,EAAE;AAChD,uBAAuB,iBAAiB,EAAE","file":"jquery-filer.css","sourcesContent":["/*\n  Icon Font: jquery-filer\n*/\n\n@font-face {\n  font-family: \"jquery-filer\";\n  src: url(\"./jquery-filer.eot\");\n  src: url(\"./jquery-filer.eot?#iefix\") format(\"embedded-opentype\"),\n       url(data:application/x-font-woff;charset=utf-8;base64,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),\n       url(\"./jquery-filer.woff\") format(\"woff\"),\n       url(\"./jquery-filer.ttf\") format(\"truetype\"),\n       url(\"./jquery-filer.svg#jquery-filer\") format(\"svg\");\n  font-weight: normal;\n  font-style: normal;\n}\n\n@media screen and (-webkit-min-device-pixel-ratio:0) {\n  @font-face {\n    font-family: \"jquery-filer\";\n    src: url(\"./jquery-filer.svg#jquery-filer\") format(\"svg\");\n  }\n}\n\n[data-icon]:before { content: attr(data-icon); }\n\n[data-icon]:before,\n.icon-jfi-ban:before,\n.icon-jfi-calendar:before,\n.icon-jfi-check:before,\n.icon-jfi-check-circle:before,\n.icon-jfi-cloud-o:before,\n.icon-jfi-cloud-up-o:before,\n.icon-jfi-comment:before,\n.icon-jfi-comment-o:before,\n.icon-jfi-download-o:before,\n.icon-jfi-exclamation:before,\n.icon-jfi-exclamation-circle:before,\n.icon-jfi-exclamation-triangle:before,\n.icon-jfi-external-link:before,\n.icon-jfi-eye:before,\n.icon-jfi-file:before,\n.icon-jfi-file-audio:before,\n.icon-jfi-file-image:before,\n.icon-jfi-file-o:before,\n.icon-jfi-file-text:before,\n.icon-jfi-file-video:before,\n.icon-jfi-files-o:before,\n.icon-jfi-folder:before,\n.icon-jfi-heart:before,\n.icon-jfi-heart-o:before,\n.icon-jfi-history:before,\n.icon-jfi-infinite:before,\n.icon-jfi-info:before,\n.icon-jfi-info-circle:before,\n.icon-jfi-minus:before,\n.icon-jfi-minus-circle:before,\n.icon-jfi-paperclip:before,\n.icon-jfi-pencil:before,\n.icon-jfi-plus:before,\n.icon-jfi-plus-circle:before,\n.icon-jfi-power-off:before,\n.icon-jfi-question:before,\n.icon-jfi-question-circle:before,\n.icon-jfi-reload:before,\n.icon-jfi-settings:before,\n.icon-jfi-sort:before,\n.icon-jfi-times:before,\n.icon-jfi-times-circle:before,\n.icon-jfi-trash:before,\n.icon-jfi-upload-o:before,\n.icon-jfi-user:before,\n.icon-jfi-view-grid:before,\n.icon-jfi-view-list:before,\n.icon-jfi-zip:before {\n  display: inline-block;\n  font-family: \"jquery-filer\";\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n  text-decoration: inherit;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-smoothing: antialiased;\n}\n\n.icon-jfi-ban:before { content: \"\\f328\"; }\n.icon-jfi-calendar:before { content: \"\\f30b\"; }\n.icon-jfi-check:before { content: \"\\f2f6\"; }\n.icon-jfi-check-circle:before { content: \"\\f30c\"; }\n.icon-jfi-cloud-o:before { content: \"\\f329\"; }\n.icon-jfi-cloud-up-o:before { content: \"\\f32a\"; }\n.icon-jfi-comment:before { content: \"\\f32b\"; }\n.icon-jfi-comment-o:before { content: \"\\f30d\"; }\n.icon-jfi-download-o:before { content: \"\\f32c\"; }\n.icon-jfi-exclamation:before { content: \"\\f32d\"; }\n.icon-jfi-exclamation-circle:before { content: \"\\f32e\"; }\n.icon-jfi-exclamation-triangle:before { content: \"\\f32f\"; }\n.icon-jfi-external-link:before { content: \"\\f330\"; }\n.icon-jfi-eye:before { content: \"\\f2f7\"; }\n.icon-jfi-file:before { content: \"\\f31f\"; }\n.icon-jfi-file-audio:before { content: \"\\f331\"; }\n.icon-jfi-file-image:before { content: \"\\f332\"; }\n.icon-jfi-file-o:before { content: \"\\f31d\"; }\n.icon-jfi-file-text:before { content: \"\\f333\"; }\n.icon-jfi-file-video:before { content: \"\\f334\"; }\n.icon-jfi-files-o:before { content: \"\\f335\"; }\n.icon-jfi-folder:before { content: \"\\f31e\"; }\n.icon-jfi-heart:before { content: \"\\f2f8\"; }\n.icon-jfi-heart-o:before { content: \"\\f336\"; }\n.icon-jfi-history:before { content: \"\\f337\"; }\n.icon-jfi-infinite:before { content: \"\\f2fb\"; }\n.icon-jfi-info:before { content: \"\\f338\"; }\n.icon-jfi-info-circle:before { content: \"\\f339\"; }\n.icon-jfi-minus:before { content: \"\\f33a\"; }\n.icon-jfi-minus-circle:before { content: \"\\f33b\"; }\n.icon-jfi-paperclip:before { content: \"\\f33c\"; }\n.icon-jfi-pencil:before { content: \"\\f2ff\"; }\n.icon-jfi-plus:before { content: \"\\f311\"; }\n.icon-jfi-plus-circle:before { content: \"\\f312\"; }\n.icon-jfi-power-off:before { content: \"\\f33d\"; }\n.icon-jfi-question:before { content: \"\\f33e\"; }\n.icon-jfi-question-circle:before { content: \"\\f33f\"; }\n.icon-jfi-reload:before { content: \"\\f300\"; }\n.icon-jfi-settings:before { content: \"\\f340\"; }\n.icon-jfi-sort:before { content: \"\\f303\"; }\n.icon-jfi-times:before { content: \"\\f316\"; }\n.icon-jfi-times-circle:before { content: \"\\f317\"; }\n.icon-jfi-trash:before { content: \"\\f318\"; }\n.icon-jfi-upload-o:before { content: \"\\f341\"; }\n.icon-jfi-user:before { content: \"\\f307\"; }\n.icon-jfi-view-grid:before { content: \"\\f342\"; }\n.icon-jfi-view-list:before { content: \"\\f343\"; }\n.icon-jfi-zip:before { content: \"\\f344\"; }\n"],"sourceRoot":"webpack://"}]);

	// exports


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "jquery-filer.eot";

/***/ },
/* 38 */
/***/ function(module, exports) {

	module.exports = "data:application/font-woff;base64,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"

/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = "data:application/octet-stream;base64,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AAMAKAFpAAEAAAAAAAQADAGsAAEAAAAAAAUAEAHbAAEAAAAAAAYADAIGAAMAAQQJAAAAkgAAAAMAAQQJAAEAGADeAAMAAQQJAAIACgEFAAMAAQQJAAMAUAEXAAMAAQQJAAQAGAGSAAMAAQQJAAUAIAG5AAMAAQQJAAYAGAHsAEMAcgBlAGEAdABlAGQAIABiAHkAIABJAHUAbABpAGEAbgAgAEcAYQBsAGMAaQB1AGMALAAsACwAIAB3AGkAdABoACAARgBvAG4AdABGAG8AcgBnAGUAIAAyAC4AMAAgACgAaAB0AHQAcAA6AC8ALwBmAG8AbgB0AGYAbwByAGcAZQAuAHMAZgAuAG4AZQB0ACkAAENyZWF0ZWQgYnkgSXVsaWFuIEdhbGNpdWMsLCwgd2l0aCBGb250Rm9yZ2UgMi4wIChodHRwOi8vZm9udGZvcmdlLnNmLm5ldCkAAGoAcQB1AGUAcgB5AC0AZgBpAGwAZQByAABqcXVlcnktZmlsZXIAAGYAaQBsAGUAcgAAZmlsZXIAAEYAbwBuAHQARgBvAHIAZwBlACAAMgAuADAAIAA6ACAAagBxAHUAZQByAHkALQBmAGkAbABlAHIAIAA6ACAAMgAwAC0AMQAtADIAMAAxADUAAEZvbnRGb3JnZSAyLjAgOiBqcXVlcnktZmlsZXIgOiAyMC0xLTIwMTUAAGoAcQB1AGUAcgB5AC0AZgBpAGwAZQByAABqcXVlcnktZmlsZXIAAFYAZQByAHMAaQBvAG4AIAAwADAAMQAuADAAMAAwACAAAFZlcnNpb24gMDAxLjAwMCAAAGoAcQB1AGUAcgB5AC0AZgBpAGwAZQByAABqcXVlcnktZmlsZXIAAAAAAAIAAAAAAAD/wAAZAAAAAQAAAAAAAAAAAAAAAAAAAAAAMwAAAAEAAgECAQMBBAEFAQYBBwEIAQkBCgELAQwBDQEOAQ8BEAERARIBEwEUARUBFgEXARgBGQEaARsBHAEdAR4BHwEgASEBIgEjASQBJQEmAScBKAEpASoBKwEsAS0BLgEvATABMQd1bmlGMkY2B3VuaUYyRjcHdW5pRjJGOAd1bmlGMkZCB3VuaUYyRkYHdW5pRjMwMAd1bmlGMzAzB3VuaUYzMDcHdW5pRjMwQgd1bmlGMzBDB3VuaUYzMEQHdW5pRjMxMQd1bmlGMzEyB3VuaUYzMTYHdW5pRjMxNwd1bmlGMzE4B3VuaUYzMUQHdW5pRjMxRQd1bmlGMzFGB3VuaUYzMjgHdW5pRjMyOQd1bmlGMzJBB3VuaUYzMkIHdW5pRjMyQwd1bmlGMzJEB3VuaUYzMkUHdW5pRjMyRgd1bmlGMzMwB3VuaUYzMzEHdW5pRjMzMgd1bmlGMzMzB3VuaUYzMzQHdW5pRjMzNQd1bmlGMzM2B3VuaUYzMzcHdW5pRjMzOAd1bmlGMzM5B3VuaUYzM0EHdW5pRjMzQgd1bmlGMzNDB3VuaUYzM0QHdW5pRjMzRQd1bmlGMzNGB3VuaUYzNDAHdW5pRjM0MQd1bmlGMzQyB3VuaUYzNDMHdW5pRjM0NAAAAAH//wACAAAAAQAAAADMPaLPAAAAANDkBOcAAAAA0OQE5w=="

/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = "data:image/svg+xml;base64,bW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArICIxMmQzMDZmZDhkY2NlMjI4MDBiYzE3ZDhiMGJlMzJkOC5zdmciOw=="

/***/ },
/* 41 */
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
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(43);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(41)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../css-loader/index.js?sourceMap!./jquery.filer-dragdropbox-theme.css", function() {
				var newContent = require("!!./../../../css-loader/index.js?sourceMap!./jquery.filer-dragdropbox-theme.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(35)();
	// imports


	// module
	exports.push([module.id, "/*!\n * CSS jQuery.filer\n * Theme: DragDropBox\n * Copyright (c) 2015 CreativeDream\n * Version: 1.0.4 (29-Oct-2015)\n*/\n\n/*-------------------------\n\tInput\n-------------------------*/\n.jFiler-input-dragDrop {\n    display: block;\n    width: 343px;\n    margin: 0 auto 25px auto;\n    padding: 25px;\n    color: #8d9499;\n    color: #97A1A8;\n    background: #fff;\n    border: 2px dashed #C8CBCE;\n    text-align: center;\n    -webkit-transition: box-shadow 0.3s,\n                        border-color 0.3s;\n    -moz-transition: box-shadow 0.3s,\n                        border-color 0.3s;\n    transition: box-shadow 0.3s,\n                        border-color 0.3s;\n}\n\n.jFiler.dragged .jFiler-input-dragDrop {\n    border-color: #aaa;\n    box-shadow: inset 0 0 20px rgba(0,0,0,.08);\n}\n\n.jFiler.dragged .jFiler-input-dragDrop * {\n    pointer-events: none;\n}\n\n.jFiler.dragged .jFiler-input-icon {\n    -webkit-transform: rotate(180deg);\n    -ms-transform: rotate(180deg);\n    transform: rotate(180deg);\n}\n\n.jFiler.dragged .jFiler-input-text,\n.jFiler.dragged .jFiler-input-choose-btn {\n    filter: alpha(opacity=30);\n    opacity: 0.3;\n}\n\n.jFiler-input-dragDrop .jFiler-input-icon {\n    font-size: 48px;\n    margin-top: -10px;\n    -webkit-transition: all 0.3s ease;\n    -moz-transition: all 0.3s ease;\n    transition: all 0.3s ease;\n}\n\n.jFiler-input-text h3 {\n    margin: 0;\n    font-size: 18px;\n}\n\n.jFiler-input-text span {\n    font-size: 12px;\n}\n\n.jFiler-input-choose-btn {\n    display: inline-block;\n    padding: 8px 14px;\n    outline: none;\n    cursor: pointer;\n    text-decoration: none;\n    text-align: center;\n    white-space: nowrap;\n    font-size: 12px;\n    font-weight: bold;\n    color: #8d9496;\n    border-radius: 3px;\n    border: 1px solid #c6c6c6;\n    vertical-align: middle;\n    background-color: #fff;\n    box-shadow: 0px 1px 5px rgba(0,0,0,0.05);\n    -webkit-transition: all 0.2s;\n    -moz-transition: all 0.2s;\n    transition: all 0.2s;\n}\n\n.jFiler-input-choose-btn:hover,\n.jFiler-input-choose-btn:active {\n    color: inherit;\n}\n\n.jFiler-input-choose-btn:active {\n    background-color: #f5f5f5;\n}\n\n/* gray */\n.jFiler-input-choose-btn.gray {\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#fcfcfc),to(#f5f5f5));\n    background-image: -webkit-linear-gradient(top,#fcfcfc,#f5f5f5);\n    background-image: -o-linear-gradient(top,#fcfcfc,#f5f5f5);\n    background-image: linear-gradient(to bottom,#fcfcfc,#f5f5f5);\n    background-image: -moz-linear-gradient(top,#fcfcfc,#f5f5f5);\n}\n\n.jFiler-input-choose-btn.gray:hover {\n    filter: alpha(opacity=87);\n    opacity: 0.87;\n}\n\n.jFiler-input-choose-btn.gray:active {\n    background-color: #f5f5f5;\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#f5f5f5),to(#fcfcfc));\n    background-image: -webkit-linear-gradient(top,#f5f5f5,#fcfcfc);\n    background-image: -o-linear-gradient(top,#f5f5f5,#fcfcfc);\n    background-image: linear-gradient(to bottom,#f5f5f5,#fcfcfc);\n    background-image: -moz-linear-gradient(top,#f5f5f5,#fcfcfc);\n}\n\n/* blue */\n.jFiler-input-choose-btn.blue {\n    color: #008BFF;\n    border: 1px solid #008BFF;\n}\n\n.jFiler-input-choose-btn.blue:hover {\n    background: #008BFF;\n}\n\n.jFiler-input-choose-btn.blue:active {\n    background: #008BFF;\n}\n\n/* green */\n.jFiler-input-choose-btn.green {\n    color: #27ae60;\n    border: 1px solid #27ae60;\n}\n\n.jFiler-input-choose-btn.green:hover {\n    background: #27ae60;\n}\n\n.jFiler-input-choose-btn.green:active {\n    background: #27ae60;\n}\n\n/* red */\n.jFiler-input-choose-btn.red {\n    color: #ed5a5a;\n    border: 1px solid #ed5a5a;\n}\n\n.jFiler-input-choose-btn.red:hover {\n    background: #ed5a5a;\n}\n\n.jFiler-input-choose-btn.red:active {\n    background: #E05252;\n}\n\n/* black */\n.jFiler-input-choose-btn.black {\n    color: #555;\n    border: 1px solid #555;\n}\n\n.jFiler-input-choose-btn.black:hover {\n    background: #555;\n}\n\n.jFiler-input-choose-btn.black:active {\n    background: #333;\n}\n\n.jFiler-input-choose-btn.blue:hover,\n.jFiler-input-choose-btn.green:hover,\n.jFiler-input-choose-btn.red:hover,\n.jFiler-input-choose-btn.black:hover {\n    border-color: transparent;\n    color: #fff;\n}\n\n.jFiler-input-choose-btn.blue:active,\n.jFiler-input-choose-btn.green:active,\n.jFiler-input-choose-btn.red:active,\n.jFiler-input-choose-btn.black:active {\n    border-color: transparent;\n    color: #fff;\n    filter: alpha(opacity=87);\n    opacity: 0.87;\n}", "", {"version":3,"sources":["/./node_modules/jquery.filer/css/themes/jquery.filer-dragdropbox-theme.css"],"names":[],"mappings":"AAAA;;;;;EAKE;;AAEF;;2BAE2B;AAC3B;IACI,eAAe;IACf,aAAa;IACb,yBAAyB;IACzB,cAAc;IACd,eAAe;IACf,eAAe;IACf,iBAAiB;IACjB,2BAA2B;IAC3B,mBAAmB;IACnB;0CACsC;IACtC;0CACsC;IACtC;0CACsC;CACzC;;AAED;IACI,mBAAmB;IACnB,2CAA2C;CAC9C;;AAED;IACI,qBAAqB;CACxB;;AAED;IACI,kCAAkC;IAClC,8BAA8B;IAC9B,0BAA0B;CAC7B;;AAED;;IAEI,0BAA0B;IAC1B,aAAa;CAChB;;AAED;IACI,gBAAgB;IAChB,kBAAkB;IAClB,kCAAkC;IAClC,+BAA+B;IAC/B,0BAA0B;CAC7B;;AAED;IACI,UAAU;IACV,gBAAgB;CACnB;;AAED;IACI,gBAAgB;CACnB;;AAED;IACI,sBAAsB;IACtB,kBAAkB;IAClB,cAAc;IACd,gBAAgB;IAChB,sBAAsB;IACtB,mBAAmB;IACnB,oBAAoB;IACpB,gBAAgB;IAChB,kBAAkB;IAClB,eAAe;IACf,mBAAmB;IACnB,0BAA0B;IAC1B,uBAAuB;IACvB,uBAAuB;IACvB,yCAAyC;IACzC,6BAA6B;IAC7B,0BAA0B;IAC1B,qBAAqB;CACxB;;AAED;;IAEI,eAAe;CAClB;;AAED;IACI,0BAA0B;CAC7B;;AAED,UAAU;AACV;IACI,gFAAgF;IAChF,+DAA+D;IAC/D,0DAA0D;IAC1D,6DAA6D;IAC7D,4DAA4D;CAC/D;;AAED;IACI,0BAA0B;IAC1B,cAAc;CACjB;;AAED;IACI,0BAA0B;IAC1B,gFAAgF;IAChF,+DAA+D;IAC/D,0DAA0D;IAC1D,6DAA6D;IAC7D,4DAA4D;CAC/D;;AAED,UAAU;AACV;IACI,eAAe;IACf,0BAA0B;CAC7B;;AAED;IACI,oBAAoB;CACvB;;AAED;IACI,oBAAoB;CACvB;;AAED,WAAW;AACX;IACI,eAAe;IACf,0BAA0B;CAC7B;;AAED;IACI,oBAAoB;CACvB;;AAED;IACI,oBAAoB;CACvB;;AAED,SAAS;AACT;IACI,eAAe;IACf,0BAA0B;CAC7B;;AAED;IACI,oBAAoB;CACvB;;AAED;IACI,oBAAoB;CACvB;;AAED,WAAW;AACX;IACI,YAAY;IACZ,uBAAuB;CAC1B;;AAED;IACI,iBAAiB;CACpB;;AAED;IACI,iBAAiB;CACpB;;AAED;;;;IAII,0BAA0B;IAC1B,YAAY;CACf;;AAED;;;;IAII,0BAA0B;IAC1B,YAAY;IACZ,0BAA0B;IAC1B,cAAc;CACjB","file":"jquery.filer-dragdropbox-theme.css","sourcesContent":["/*!\n * CSS jQuery.filer\n * Theme: DragDropBox\n * Copyright (c) 2015 CreativeDream\n * Version: 1.0.4 (29-Oct-2015)\n*/\n\n/*-------------------------\n\tInput\n-------------------------*/\n.jFiler-input-dragDrop {\n    display: block;\n    width: 343px;\n    margin: 0 auto 25px auto;\n    padding: 25px;\n    color: #8d9499;\n    color: #97A1A8;\n    background: #fff;\n    border: 2px dashed #C8CBCE;\n    text-align: center;\n    -webkit-transition: box-shadow 0.3s,\n                        border-color 0.3s;\n    -moz-transition: box-shadow 0.3s,\n                        border-color 0.3s;\n    transition: box-shadow 0.3s,\n                        border-color 0.3s;\n}\n\n.jFiler.dragged .jFiler-input-dragDrop {\n    border-color: #aaa;\n    box-shadow: inset 0 0 20px rgba(0,0,0,.08);\n}\n\n.jFiler.dragged .jFiler-input-dragDrop * {\n    pointer-events: none;\n}\n\n.jFiler.dragged .jFiler-input-icon {\n    -webkit-transform: rotate(180deg);\n    -ms-transform: rotate(180deg);\n    transform: rotate(180deg);\n}\n\n.jFiler.dragged .jFiler-input-text,\n.jFiler.dragged .jFiler-input-choose-btn {\n    filter: alpha(opacity=30);\n    opacity: 0.3;\n}\n\n.jFiler-input-dragDrop .jFiler-input-icon {\n    font-size: 48px;\n    margin-top: -10px;\n    -webkit-transition: all 0.3s ease;\n    -moz-transition: all 0.3s ease;\n    transition: all 0.3s ease;\n}\n\n.jFiler-input-text h3 {\n    margin: 0;\n    font-size: 18px;\n}\n\n.jFiler-input-text span {\n    font-size: 12px;\n}\n\n.jFiler-input-choose-btn {\n    display: inline-block;\n    padding: 8px 14px;\n    outline: none;\n    cursor: pointer;\n    text-decoration: none;\n    text-align: center;\n    white-space: nowrap;\n    font-size: 12px;\n    font-weight: bold;\n    color: #8d9496;\n    border-radius: 3px;\n    border: 1px solid #c6c6c6;\n    vertical-align: middle;\n    background-color: #fff;\n    box-shadow: 0px 1px 5px rgba(0,0,0,0.05);\n    -webkit-transition: all 0.2s;\n    -moz-transition: all 0.2s;\n    transition: all 0.2s;\n}\n\n.jFiler-input-choose-btn:hover,\n.jFiler-input-choose-btn:active {\n    color: inherit;\n}\n\n.jFiler-input-choose-btn:active {\n    background-color: #f5f5f5;\n}\n\n/* gray */\n.jFiler-input-choose-btn.gray {\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#fcfcfc),to(#f5f5f5));\n    background-image: -webkit-linear-gradient(top,#fcfcfc,#f5f5f5);\n    background-image: -o-linear-gradient(top,#fcfcfc,#f5f5f5);\n    background-image: linear-gradient(to bottom,#fcfcfc,#f5f5f5);\n    background-image: -moz-linear-gradient(top,#fcfcfc,#f5f5f5);\n}\n\n.jFiler-input-choose-btn.gray:hover {\n    filter: alpha(opacity=87);\n    opacity: 0.87;\n}\n\n.jFiler-input-choose-btn.gray:active {\n    background-color: #f5f5f5;\n    background-image: -webkit-gradient(linear,0 0,0 100%,from(#f5f5f5),to(#fcfcfc));\n    background-image: -webkit-linear-gradient(top,#f5f5f5,#fcfcfc);\n    background-image: -o-linear-gradient(top,#f5f5f5,#fcfcfc);\n    background-image: linear-gradient(to bottom,#f5f5f5,#fcfcfc);\n    background-image: -moz-linear-gradient(top,#f5f5f5,#fcfcfc);\n}\n\n/* blue */\n.jFiler-input-choose-btn.blue {\n    color: #008BFF;\n    border: 1px solid #008BFF;\n}\n\n.jFiler-input-choose-btn.blue:hover {\n    background: #008BFF;\n}\n\n.jFiler-input-choose-btn.blue:active {\n    background: #008BFF;\n}\n\n/* green */\n.jFiler-input-choose-btn.green {\n    color: #27ae60;\n    border: 1px solid #27ae60;\n}\n\n.jFiler-input-choose-btn.green:hover {\n    background: #27ae60;\n}\n\n.jFiler-input-choose-btn.green:active {\n    background: #27ae60;\n}\n\n/* red */\n.jFiler-input-choose-btn.red {\n    color: #ed5a5a;\n    border: 1px solid #ed5a5a;\n}\n\n.jFiler-input-choose-btn.red:hover {\n    background: #ed5a5a;\n}\n\n.jFiler-input-choose-btn.red:active {\n    background: #E05252;\n}\n\n/* black */\n.jFiler-input-choose-btn.black {\n    color: #555;\n    border: 1px solid #555;\n}\n\n.jFiler-input-choose-btn.black:hover {\n    background: #555;\n}\n\n.jFiler-input-choose-btn.black:active {\n    background: #333;\n}\n\n.jFiler-input-choose-btn.blue:hover,\n.jFiler-input-choose-btn.green:hover,\n.jFiler-input-choose-btn.red:hover,\n.jFiler-input-choose-btn.black:hover {\n    border-color: transparent;\n    color: #fff;\n}\n\n.jFiler-input-choose-btn.blue:active,\n.jFiler-input-choose-btn.green:active,\n.jFiler-input-choose-btn.red:active,\n.jFiler-input-choose-btn.black:active {\n    border-color: transparent;\n    color: #fff;\n    filter: alpha(opacity=87);\n    opacity: 0.87;\n}"],"sourceRoot":"webpack://"}]);

	// exports


/***/ },
/* 44 */
/***/ function(module, exports) {

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
	    this.start = function(timeSlice) {
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

	    this.onStartedDrawingNonBlankFrames = function() {};
	    this.clearOldRecordedFrames = function() {
	        if (!mediaRecorder) return;
	        mediaRecorder.clearOldRecordedFrames();
	    };

	    this.stop = function() {
	        if (mediaRecorder) mediaRecorder.stop();
	    };

	    this.ondataavailable = function(blob) {
	        console.log('ondataavailable..', blob);
	    };

	    this.onstop = function(error) {
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
	    script.onload = onload || function() {};
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
	    this.start = function(mTimeSlice) {
	        mTimeSlice = mTimeSlice || 1000;
	        isStopRecording = false;

	        function startRecording() {
	            if (isStopRecording) return;

	            mediaRecorder = new MediaRecorder(mediaStream);

	            mediaRecorder.ondataavailable = function(e) {
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

	            mediaRecorder.onstop = function(error) {
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
	            mediaRecorder.onerror = function(error) {
	                console.error(error);
	                self.start(mTimeSlice);
	            };

	            mediaRecorder.onwarning = function(warning) {
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

	            setTimeout(function() {
	                mediaRecorder.stop();
	                startRecording();
	            }, mTimeSlice);
	        }

	        // dirty workaround to fix Firefox 2nd+ intervals
	        startRecording();
	    };

	    var isStopRecording = false;

	    this.stop = function() {
	        isStopRecording = true;

	        if (self.onstop) {
	            self.onstop({});
	        }
	    };

	    this.ondataavailable = this.onstop = function() {};

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
	    this.start = function(timeSlice) {
	        timeSlice = timeSlice || 1000;

	        mediaRecorder = new StereoAudioRecorder(mediaStream, this);

	        mediaRecorder.record();

	        timeout = setInterval(function() {
	            mediaRecorder.requestData();
	        }, timeSlice);
	    };

	    this.stop = function() {
	        if (mediaRecorder) {
	            mediaRecorder.stop();
	            clearTimeout(timeout);
	        }
	    };

	    this.ondataavailable = function() {};

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

	    this.record = function() {
	        recording = true;
	        // reset the buffers for the new recording
	        leftchannel.length = rightchannel.length = 0;
	        recordingLength = 0;
	    };

	    this.requestData = function() {
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

	    this.stop = function() {
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

	    if (!ObjectStore.AudioContextConstructor)
	        ObjectStore.AudioContextConstructor = new audioContext();

	    var context = ObjectStore.AudioContextConstructor;

	    // creates a gain node
	    if (!ObjectStore.VolumeGainNode)
	        ObjectStore.VolumeGainNode = context.createGain();

	    var volume = ObjectStore.VolumeGainNode;

	    // creates an audio node from the microphone incoming stream
	    if (!ObjectStore.AudioInput)
	        ObjectStore.AudioInput = context.createMediaStreamSource(mediaStream);

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
	    scriptprocessornode.onaudioprocess = function(e) {
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
	    this.record = function(timeSlice) {
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

	    this.clearOldRecordedFrames = function() {
	        frames = [];
	    };

	    var requestDataInvoked = false;
	    this.requestData = function() {
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

	    this.stop = function() {
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
	        var maxColorDifference = Math.sqrt(
	            Math.pow(255, 2) +
	            Math.pow(255, 2) +
	            Math.pow(255, 2)
	        );
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
	            var colorDifference = Math.sqrt(
	                Math.pow(currentColor.r - sampleColor.r, 2) +
	                Math.pow(currentColor.g - sampleColor.g, 2) +
	                Math.pow(currentColor.b - sampleColor.b, 2)
	            );
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
	        var endCheckFrame = (_framesToCheck && _framesToCheck > 0 && _framesToCheck <= _frames.length) ?
	            _framesToCheck : _frames.length;
	        var sampleColor = {
	            r: 0,
	            g: 0,
	            b: 0
	        };
	        var maxColorDifference = Math.sqrt(
	            Math.pow(255, 2) +
	            Math.pow(255, 2) +
	            Math.pow(255, 2)
	        );
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
	                    var colorDifference = Math.sqrt(
	                        Math.pow(currentColor.r - sampleColor.r, 2) +
	                        Math.pow(currentColor.g - sampleColor.g, 2) +
	                        Math.pow(currentColor.b - sampleColor.b, 2)
	                    );
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
	    this.start = function(timeSlice) {
	        timeSlice = timeSlice || 1000;

	        mediaRecorder = new WhammyRecorderHelper(mediaStream, this);

	        for (var prop in this) {
	            if (typeof this[prop] !== 'function') {
	                mediaRecorder[prop] = this[prop];
	            }
	        }

	        mediaRecorder.record();

	        timeout = setInterval(function() {
	            mediaRecorder.requestData();
	        }, timeSlice);
	    };

	    this.stop = function() {
	        if (mediaRecorder) {
	            mediaRecorder.stop();
	            clearTimeout(timeout);
	        }
	    };

	    this.clearOldRecordedFrames = function() {
	        if (mediaRecorder) {
	            mediaRecorder.clearOldRecordedFrames();
	        }
	    };

	    this.ondataavailable = function() {};

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

	var Whammy = (function() {

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
	                }].concat(clusterFrames.map(function(webp) {
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
	        return new Uint8Array(str.split('').map(function(e) {
	            return e.charCodeAt(0);
	        }));
	    }

	    function bitsToBuffer(bits) {
	        var data = [];
	        var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
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
	            if (typeof data == 'object') data = generateEBML(data);
	            if (typeof data == 'number') data = bitsToBuffer(data.toString(2));
	            if (typeof data == 'string') data = strToBuffer(data);

	            var len = data.size || data.byteLength || data.length;
	            var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
	            var size_str = len.toString(2);
	            var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
	            var size = (new Array(zeroes)).join('0') + '1' + padded;

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
	        var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
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
	            if (typeof data == 'object') data = generateEBML_old(data);
	            if (typeof data == 'number') data = toBinStr_old(data.toString(2));

	            var len = data.length;
	            var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
	            var size_str = len.toString(2);
	            var padded = (new Array((zeroes * 7 + 7 + 1) - size_str.length)).join('0') + size_str;
	            var size = (new Array(zeroes)).join('0') + '1' + padded;

	            ebml += toBinStr_old(json[i].id.toString(2)) + toBinStr_old(size) + data;

	        }
	        return ebml;
	    }

	    function makeSimpleBlock(data) {
	        var flags = 0;
	        if (data.keyframe) flags |= 128;
	        if (data.invisible) flags |= 8;
	        if (data.lacing) flags |= (data.lacing << 1);
	        if (data.discardable) flags |= 1;
	        if (data.trackNum > 127) {
	            throw "TrackNumber > 127 not supported";
	        }
	        var out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function(e) {
	            return String.fromCharCode(e);
	        }).join('') + data.frame;

	        return out;
	    }

	    function parseWebP(riff) {
	        var VP8 = riff.RIFF[0].WEBP[0];

	        var frame_start = VP8.indexOf('\x9d\x01\x2a'); // A VP8 keyframe starts with the 0x9d012a header
	        for (var i = 0, c = []; i < 4; i++) c[i] = VP8.charCodeAt(frame_start + 3 + i);

	        var width, height, tmp;

	        //the code below is literally copied verbatim from the bitstream spec
	        tmp = (c[1] << 8) | c[0];
	        width = tmp & 0x3FFF;
	        tmp = (c[3] << 8) | c[2];
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
	            var len = parseInt(string.substr(offset + 4, 4).split('').map(function(i) {
	                var unpadded = i.charCodeAt(0).toString(2);
	                return (new Array(8 - unpadded.length + 1)).join('0') + unpadded;
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
	        return [].slice.call(
	            new Uint8Array((new Float64Array([num])).buffer), 0).map(function(e) {
	            return String.fromCharCode(e);
	        }).reverse().join('');
	    }

	    // a more abstract-ish API

	    function WhammyVideo(duration) {
	        this.frames = [];
	        this.duration = duration || 1;
	        this.quality = 100;
	    }

	    WhammyVideo.prototype.add = function(frame, duration) {
	        if ('canvas' in frame) { //CanvasRenderingContext2D
	            frame = frame.canvas;
	        }

	        if ('toDataURL' in frame) {
	            frame = frame.toDataURL('image/webp', this.quality);
	        }

	        if (!(/^data:image\/webp;base64,/ig).test(frame)) {
	            throw "Input must be formatted properly as a base64 encoded DataURI of type image/webp";
	        }
	        this.frames.push({
	            image: frame,
	            duration: duration || this.duration
	        });
	    };
	    WhammyVideo.prototype.compile = function() {
	        return new toWebM(this.frames.map(function(frame) {
	            var webp = parseWebP(parseRIFF(atob(frame.image.slice(23))));
	            webp.duration = frame.duration;
	            return webp;
	        }));
	    };
	    return {
	        Video: WhammyVideo,
	        toWebM: toWebM
	    };
	})();

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
	    this.start = function(timeSlice) {
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

	            if (typeof lastFrameTime === undefined) {
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

	    this.stop = function() {
	        if (lastAnimationFrame) {
	            cancelAnimationFrame(lastAnimationFrame);
	            clearTimeout(timeout);
	            doneRecording();
	        }
	    };

	    this.ondataavailable = function() {};
	    this.onstop = function() {};

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
	    this.start = function(timeSlice) {
	        audioRecorder = new MediaStreamRecorder(mediaStream);
	        videoRecorder = new MediaStreamRecorder(mediaStream);

	        audioRecorder.mimeType = 'audio/ogg';
	        videoRecorder.mimeType = 'video/webm';

	        for (var prop in this) {
	            if (typeof this[prop] !== 'function') {
	                audioRecorder[prop] = videoRecorder[prop] = this[prop];
	            }
	        }

	        audioRecorder.ondataavailable = function(blob) {
	            if (!audioVideoBlobs[recordingInterval]) {
	                audioVideoBlobs[recordingInterval] = {};
	            }

	            audioVideoBlobs[recordingInterval].audio = blob;

	            if (audioVideoBlobs[recordingInterval].video && !audioVideoBlobs[recordingInterval].onDataAvailableEventFired) {
	                audioVideoBlobs[recordingInterval].onDataAvailableEventFired = true;
	                fireOnDataAvailableEvent(audioVideoBlobs[recordingInterval]);
	            }
	        };

	        videoRecorder.ondataavailable = function(blob) {
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

	        videoRecorder.onstop = audioRecorder.onstop = function(error) {
	            self.onstop(error);
	        };

	        if (!isFirefox) {
	            // to make sure both audio/video are synced.
	            videoRecorder.onStartedDrawingNonBlankFrames = function() {
	                videoRecorder.clearOldRecordedFrames();
	                audioRecorder.start(timeSlice);
	            };
	            videoRecorder.start(timeSlice);
	        } else {
	            videoRecorder.start(timeSlice);
	        }
	    };

	    this.stop = function() {
	        if (audioRecorder) audioRecorder.stop();
	        if (videoRecorder) videoRecorder.stop();
	    };

	    this.ondataavailable = function(blob) {
	        console.log('ondataavailable..', blob);
	    };

	    this.onstop = function(error) {
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
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() {
		return new Worker(__webpack_require__.p + "ffmpeg.worker.js");
	};

/***/ }
/******/ ]);