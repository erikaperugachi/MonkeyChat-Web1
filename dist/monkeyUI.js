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
/* 1 */,
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
	exports.push([module.id, "/*\n  Icon Font: jquery-filer\n*/\n\n@font-face {\n  font-family: \"jquery-filer\";\n  src: url(" + __webpack_require__(12) + ");\n  src: url(" + __webpack_require__(12) + "?#iefix) format(\"embedded-opentype\"),\n       url(data:application/x-font-woff;charset=utf-8;base64,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),\n       url(" + __webpack_require__(13) + ") format(\"woff\"),\n       url(" + __webpack_require__(14) + ") format(\"truetype\"),\n       url(" + __webpack_require__(15) + "#jquery-filer) format(\"svg\");\n  font-weight: normal;\n  font-style: normal;\n}\n\n@media screen and (-webkit-min-device-pixel-ratio:0) {\n  @font-face {\n    font-family: \"jquery-filer\";\n    src: url(" + __webpack_require__(15) + "#jquery-filer) format(\"svg\");\n  }\n}\n\n[data-icon]:before { content: attr(data-icon); }\n\n[data-icon]:before,\n.icon-jfi-ban:before,\n.icon-jfi-calendar:before,\n.icon-jfi-check:before,\n.icon-jfi-check-circle:before,\n.icon-jfi-cloud-o:before,\n.icon-jfi-cloud-up-o:before,\n.icon-jfi-comment:before,\n.icon-jfi-comment-o:before,\n.icon-jfi-download-o:before,\n.icon-jfi-exclamation:before,\n.icon-jfi-exclamation-circle:before,\n.icon-jfi-exclamation-triangle:before,\n.icon-jfi-external-link:before,\n.icon-jfi-eye:before,\n.icon-jfi-file:before,\n.icon-jfi-file-audio:before,\n.icon-jfi-file-image:before,\n.icon-jfi-file-o:before,\n.icon-jfi-file-text:before,\n.icon-jfi-file-video:before,\n.icon-jfi-files-o:before,\n.icon-jfi-folder:before,\n.icon-jfi-heart:before,\n.icon-jfi-heart-o:before,\n.icon-jfi-history:before,\n.icon-jfi-infinite:before,\n.icon-jfi-info:before,\n.icon-jfi-info-circle:before,\n.icon-jfi-minus:before,\n.icon-jfi-minus-circle:before,\n.icon-jfi-paperclip:before,\n.icon-jfi-pencil:before,\n.icon-jfi-plus:before,\n.icon-jfi-plus-circle:before,\n.icon-jfi-power-off:before,\n.icon-jfi-question:before,\n.icon-jfi-question-circle:before,\n.icon-jfi-reload:before,\n.icon-jfi-settings:before,\n.icon-jfi-sort:before,\n.icon-jfi-times:before,\n.icon-jfi-times-circle:before,\n.icon-jfi-trash:before,\n.icon-jfi-upload-o:before,\n.icon-jfi-user:before,\n.icon-jfi-view-grid:before,\n.icon-jfi-view-list:before,\n.icon-jfi-zip:before {\n  display: inline-block;\n  font-family: \"jquery-filer\";\n  font-style: normal;\n  font-weight: normal;\n  font-variant: normal;\n  text-decoration: inherit;\n  text-rendering: optimizeLegibility;\n  text-transform: none;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  font-smoothing: antialiased;\n}\n\n.icon-jfi-ban:before { content: \"\\F328\"; }\n.icon-jfi-calendar:before { content: \"\\F30B\"; }\n.icon-jfi-check:before { content: \"\\F2F6\"; }\n.icon-jfi-check-circle:before { content: \"\\F30C\"; }\n.icon-jfi-cloud-o:before { content: \"\\F329\"; }\n.icon-jfi-cloud-up-o:before { content: \"\\F32A\"; }\n.icon-jfi-comment:before { content: \"\\F32B\"; }\n.icon-jfi-comment-o:before { content: \"\\F30D\"; }\n.icon-jfi-download-o:before { content: \"\\F32C\"; }\n.icon-jfi-exclamation:before { content: \"\\F32D\"; }\n.icon-jfi-exclamation-circle:before { content: \"\\F32E\"; }\n.icon-jfi-exclamation-triangle:before { content: \"\\F32F\"; }\n.icon-jfi-external-link:before { content: \"\\F330\"; }\n.icon-jfi-eye:before { content: \"\\F2F7\"; }\n.icon-jfi-file:before { content: \"\\F31F\"; }\n.icon-jfi-file-audio:before { content: \"\\F331\"; }\n.icon-jfi-file-image:before { content: \"\\F332\"; }\n.icon-jfi-file-o:before { content: \"\\F31D\"; }\n.icon-jfi-file-text:before { content: \"\\F333\"; }\n.icon-jfi-file-video:before { content: \"\\F334\"; }\n.icon-jfi-files-o:before { content: \"\\F335\"; }\n.icon-jfi-folder:before { content: \"\\F31E\"; }\n.icon-jfi-heart:before { content: \"\\F2F8\"; }\n.icon-jfi-heart-o:before { content: \"\\F336\"; }\n.icon-jfi-history:before { content: \"\\F337\"; }\n.icon-jfi-infinite:before { content: \"\\F2FB\"; }\n.icon-jfi-info:before { content: \"\\F338\"; }\n.icon-jfi-info-circle:before { content: \"\\F339\"; }\n.icon-jfi-minus:before { content: \"\\F33A\"; }\n.icon-jfi-minus-circle:before { content: \"\\F33B\"; }\n.icon-jfi-paperclip:before { content: \"\\F33C\"; }\n.icon-jfi-pencil:before { content: \"\\F2FF\"; }\n.icon-jfi-plus:before { content: \"\\F311\"; }\n.icon-jfi-plus-circle:before { content: \"\\F312\"; }\n.icon-jfi-power-off:before { content: \"\\F33D\"; }\n.icon-jfi-question:before { content: \"\\F33E\"; }\n.icon-jfi-question-circle:before { content: \"\\F33F\"; }\n.icon-jfi-reload:before { content: \"\\F300\"; }\n.icon-jfi-settings:before { content: \"\\F340\"; }\n.icon-jfi-sort:before { content: \"\\F303\"; }\n.icon-jfi-times:before { content: \"\\F316\"; }\n.icon-jfi-times-circle:before { content: \"\\F317\"; }\n.icon-jfi-trash:before { content: \"\\F318\"; }\n.icon-jfi-upload-o:before { content: \"\\F341\"; }\n.icon-jfi-user:before { content: \"\\F307\"; }\n.icon-jfi-view-grid:before { content: \"\\F342\"; }\n.icon-jfi-view-list:before { content: \"\\F343\"; }\n.icon-jfi-zip:before { content: \"\\F344\"; }\n", ""]);

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

/***/ }
/******/ ]);