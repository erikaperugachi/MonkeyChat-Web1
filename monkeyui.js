require('fileapi/dist/FileAPI.min.js');

require('jquery.filer/js/jquery.filer.min.js');
require('jquery.filer/css/jquery.filer.css');
require('jquery.filer/css/themes/jquery.filer-dragdropbox-theme.css');

//require('./src/jquery.knob.min.js');

import MUIUser from './src/MUIUser.js';
import MUIConversation from './src/MUIConversation.js';
import MUIMessage from './src/MUIMessage.js';

// =================
// MUI*.js
window.MUIUser = MUIUser;
window.MUIConversation = MUIConversation;
window.MUIMessage = MUIMessage;

// =================
// MediaStreamRecorder.js
var MediaStreamRecorder = require('./src/MediaStreamRecorder.js').MediaStreamRecorder;
window.StereoRecorder = require('./src/MediaStreamRecorder.js').StereoRecorder;

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

var inputConf = {}

export var monkeyUI = new function() {
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

    this.setChat = function(conf){
        monkeyUI.isConversationList = conf.showConversationList == undefined ? false : conf.showConversationList;
        if(conf.input != undefined){
            monkeyUI.input.isAttachButton = conf.input.showAttachButton == undefined ? true : conf.input.showAttachButton;
            monkeyUI.input.isAudioButton = conf.input.showAudioButton == undefined ? true : conf.input.showAudioButton;
            monkeyUI.input.isSendButton = conf.input.showSendButton == undefined ? true : conf.input.showSendButton;
            monkeyUI.input.isEphemeralButton = conf.input.showEphemeralButton == undefined ? false : conf.input.showEphemeralButton;   
        }else{
            monkeyUI.input.isEphemeralButton = false;
        }
        monkeyUI.screen.type = conf.screen.type == undefined ? FULLSCREEN : conf.screen.type;
        if(monkeyUI.screen.type == FULLSCREEN){
            monkeyUI.screen.data.mode = FULLSIZE;
        }else if(monkeyUI.screen.type == CLASSIC){
            monkeyUI.screen.data.mode = PARTIALSIZE;	
            monkeyUI.screen.data.width = conf.screen.data.width;
            monkeyUI.screen.data.height = conf.screen.data.height;
        }
        monkeyUI.screen.data.width = conf.screen.data.width;
        monkeyUI.screen.data.height = conf.screen.data.height;
        monkeyUI.player = conf.player == undefined ? STANDARD : conf.player;
    }

    this.drawScene = function(){

        var e = document.createElement("link");
        e.href = "https://cdn.criptext.com/MonkeyUI/styles/chat7.css", e.type = "text/css", e.rel = "stylesheet", document.getElementsByTagName("head")[0].appendChild(e)

        var ec = document.createElement("link");
        ec.href = "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css", ec.type = "text/css", ec.rel = "stylesheet", document.getElementsByTagName("head")[0].appendChild(ec)

        if( $('.mky-wrapper-out').length <= 0 ){
            var _scene = '';
            if(this.screen.data.width != undefined && this.screen.data.height != undefined){
                _scene += '<div class="mky-wrapper-out '+PREFIX+this.screen.data.mode+' '+PREFIX+this.screen.type+'" style="width: '+this.screen.data.width+'; height:30px;">';
            }else{
                _scene += '<div class="mky-wrapper-out '+PREFIX+this.screen.data.mode+' '+PREFIX+this.screen.type+'">';
            }
            if(this.screen.type == CLASSIC){
                _scene += '<div class="mky-tab">'+
                            '<span class="mky-tablabel"> Want to know more? </span>'+
                            '<div id="mky-w-max"></div>'+
                            '<div id="mky-w-min" class="mky-disappear"></div>'+
                        '</div>';
            }else if(this.screen.type == SIDEBAR){
                _scene += '<div class="circle-icon">'+
                            '<div id="w-open" class="mky-appear"></div>'+
                        '</div>';
            }
            _scene += '<div class="mky-wrapper-in">'+
                    '<div id="mky-content-connection"></div>'+
                    '<div id="mky-content-app" class="mky-disappear">';
            if(this.isConversationList){
                _scene += '<aside>'+
                            '<ul id="mky-conversation-list" class=""></ul>'+ 
                        '</aside>';
            }
            var _class = this.isConversationList ? 'mky-conversation-with' : 'mky-conversation-only';
                _scene += '<section id="conversation-window" class="'+_class+'">'+
                        '</section>'+
                    '</div>'+  
                '</div>'+
            '</div>';
            $('body').append(_scene);
            drawLoading(this.contentConnection);
        }else{
            $('.mky-wrapper-out').addClass(PREFIX+this.screen.data.mode);
        }
        initOptionsOutWindow(this.screen.data.height, this.form);
        drawHeaderUserSession(this.contentApp + ' aside');
        drawContentConversation(this.contentConversationWindow, this.screen.type);
        drawInput(this.contentConversationWindow, this.input);
        monkeyUI.stopLoading();
    }

    function initOptionsOutWindow(height, isForm){
        $("#mky-w-max").click(function () {
            $('.mky-wrapper-out').height(height);
            if(isForm && !monkeyUI.getLogin()){
                $("#mky-w-min").removeClass('mky-disappear');
                $("#mky-w-max").addClass('mky-disappear');
            }else if(!isForm && !monkeyUI.getLogin()){
                $(monkeyUI).trigger('quickStart');
            }else if(monkeyUI.getLogin()){
                monkeyUI.disappearOptionsOutWindow();
            }
        });
        $("#mky-w-min").click(function () {
            $('.mky-wrapper-out').height($('.mky-tab').height());
            $("#mky-w-min").addClass('mky-disappear');
            $("#mky-w-max").removeClass('mky-disappear');
        });
    }

    function initOptionInWindow(){
        $("#mky-w-min-in").click(function () {
            $('.mky-wrapper-out').height($('.mky-tab').height());
            $('.mky-tab').removeClass('mky-disappear');

            $("#mky-w-min").addClass('mky-disappear');
            $("#mky-w-max").removeClass('mky-disappear');
        });
    }

    this.disappearOptionsOutWindow = function(){
        $('.mky-tab').addClass('mky-disappear');
        $('.mky-wrapper-out').removeClass(PREFIX+'classic');
    }

    this.getLogin = function(){
        return this.login;
    }

    function drawLoading(contentConnection){
        var _html = '<div class="mky-spinner">'+
            '<div class="mky-bounce1"></div>'+
            '<div class="mky-bounce2"></div>'+
            '<div class="bounce3"></div>'+
        '</div>';
        $(contentConnection).prepend(_html);
    }

    function drawHeaderUserSession(content){
        var _html = '<header id="mky-session-header">'+
            '<div id="mky-session-image">'+
                '<img src="">'+
            '</div>'+
            '<div id="mky-session-description">'+
                '<span id="mky-session-name"></span>'+
            '</div>'+
        '</header>';
        $(content).prepend(_html);
    }

    function drawContentConversation(content, screenType){
        var _html = '<div id="mky-app-intro"><div></div></div>'+
            '<header id="mky-conversation-selected-header">'+
                '<div id="mky-conversation-selected-image">'+
                    '<img src="">'+
                '</div>'+
                '<div id="mky-conversation-selected-description">'+
                    '<span id="mky-conversation-selected-name"></span>'+
                    '<span id="mky-conversation-selected-status"></span>'+
                '</div>';
        if(screenType == CLASSIC || screenType == SIDEBAR){
            _html += '<div class="mky-content-options">'+
                        '<div id="mky-w-min-in"></div>'+
                        '<div id="mky-w-close"></div>'+
                    '</div>';
        }
        _html += '</header>'+
            '<div id="mky-chat-timeline"></div>';
        $(content).append(_html);
        initOptionInWindow();
    }

    this.stopLoading = function(){
        // to check
        /*
        $('.drop-login-loading').hide();
        $('.secure-conextion-drop').show();
        $('.secure-conextion-drop').hide();
        */
        $(this.contentConnection).removeClass('mky-appear');
        $(this.contentConnection).addClass('mky-disappear');
    }

    this.startLoading = function(){
        $(this.contentConnection).removeClass('mky-disappear');
        $(this.contentConnection).addClass('mky-appear');
    }

    this.loadDataScreen = function(user){
        this.user = user;
        detectFuntionality();

        // set contentApp
        $(this.contentApp).removeClass('mky-disappear');

        // set user info
        $("#mky-session-name").html(this.user.name);
        $('#mky-session-image img').attr('src',this.user.urlAvatar);
    }

    function detectFuntionality(){
        if (window.location.protocol != "https:"){
            disabledAudioButton(true);
        }
    }

    /***********************************************/
    /********************* INPUT *******************/
    /***********************************************/

    function drawInput(content, input){

        //drag & drop sizes
        var dd_height = '';
        var dd_width = '';

        if (monkeyUI.screen.data.mode == PARTIALSIZE) {
            dd_height = monkeyUI.screen.data.height;
            dd_width = monkeyUI.screen.data.width;
        }

        var _html = '<div id="mky-chat-input">'+
            '<div id="mky-divider-chat-input"></div>';
            if (input.isAttachButton) {
                _html += '<div class="mky-button-input">'+
                            '<button id="mky-button-attach" class="mky-button-icon"></button>'+
                            '<input type="file" name="attach" id="attach-file" style="display:none" accept=".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx, image/*">'+
                        '</div>'+
                        '<div class="'+PREFIX+monkeyUI.screen.data.mode + ' jFiler-input-dragDrop" style="width:'+dd_width+'; height:'+dd_height+';"><div class="jFiler-input-inner"><div class="jFiler-input-icon"><i class="icon-jfi-cloud-up-o"></i></div><div class="jFiler-input-text"><h3>Drop files here</h3></div></div></div>';
            }
            
            if (input.isAudioButton) {
                _html += '<div class="mky-button-input">'+
                                    '<button id="mky-button-cancel-audio" class="mky-button-icon"></button>'+
                                '</div>';
            }
            
            _html += '<textarea id="mky-message-text-input" class="mky-textarea-input" placeholder="Write a secure message"></textarea>';
            
            if (input.isAudioButton) {
                _html += '<div id="mky-record-area" class="mky-disappear">'+
                                    '<div class="mky-record-preview-area">'+
                                        '<div id="mky-button-action-record">'+
                                            '<button id="mky-button-start-record" class="mky-blink"></button>'+
                                        '</div>'+
                                        '<div id="mky-time-recorder"><span id="mky-minutes">00</span><span>:</span><span id="mky-seconds">00</span></div>'+
                                    '</div>'+
                                '</div>';
            }

            if (input.isSendButton) {
                _html += '<div class="mky-button-input">'+
                                    '<button id="mky-button-send-message" class="mky-button-icon"></button>'+
                                '</div>';
            }
            
            if (input.isAudioButton) {
                _html += '<div class="mky-button-input">'+
                                    '<button id="mky-button-record-audio" class="mky-button-icon"></button>'+
                                '</div>';
            } 

            if (input.isEphemeralButton) {
                _html += '<div class="mky-button-input">'+
                                    '<button id="mky-button-send-ephemeral" class="mky-button-icon timer_icon"></button>'+
                                '</div>';
            }
            
        _html += '<div class="mky-signature">Powered by <a class="mky-signature-link" target="_blank" href="http://criptext.com/">Criptext</a></div></div>';
        $(content).append(_html);
        initInputFunctionality();
    }

    this.showChatInput = function(){
        $('#mky-button-action-record button').hide();
        $('#mky-button-action-record button').attr('onclick','');
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
    }

    function clearAudioRecordTimer() {
        totalSeconds = 0; //encera el timer
        clearInterval(refreshIntervalId);
        minutesLabel.innerHTML = '00';
        secondsLabel.innerHTML = '00';
    }

    function initInputFunctionality(){
        minutesLabel = document.getElementById("mky-minutes");
        secondsLabel = document.getElementById("mky-seconds");

        // mp3 converter
        ffmpegWorker = getFFMPEGWorker();

        inputEvent();
    }

    function inputEvent(){
        $('#mky-message-text-input').keydown(function(event) {
            var charCode = (window.event) ? event.which : event.keyCode;

            if( charCode == 8 || charCode == 46 ){
                if($('#mky-button-send-message').is(':visible') && $(this).val().trim().length <= 1  ){
                    $('#mky-button-record-audio').parent().removeClass("mky-disappear");
                    $('#mky-button-send-message').parent().addClass("mky-disappear");
                    $('#mky-button-send-ephemeral').removeClass('enable_timer');
                }
            }else if(charCode == 13){
                if (event.shiftKey === true){
                    return true;
                }else{
                    var _messageText = $('#mky-message-text-input').val().trim();
                    $(monkeyUI).trigger('textMessage', _messageText);
                    $('#mky-message-text-input').val("");
                    monkeyUI.showChatInput();
                    return false;
                }
            }else{
                if(!$('#mky-button-send-message').is(':visible')){
                    $('#mky-button-record-audio').parent().addClass("mky-disappear");
                    $('#mky-button-send-message').parent().removeClass("mky-disappear");
                    $('#mky-button-send-ephemeral').addClass('enable_timer');
                    typeMessageToSend = 0;
                }
            } 
        });
        
        $('#mky-button-send-message').click(function () {
            switch(typeMessageToSend){
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

        $('#mky-button-cancel-audio').click(function(){
            monkeyUI.showChatInput();

            var audio = document.getElementById('audio_'+timestampPrev);
            if (audio != null)
                audio.pause();
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
                dragEnter: function () {
                    console.log('file entered');
                    $('.jFiler-input-dragDrop').show();
                },
                dragLeave: function () {
                    console.log('file entered');
                    $('.mky-chat-drop-zone').hide();
                    $('.jFiler-input-dragDrop').hide();
                },
                drop: function () {
                    console.log('file entered');
                    $('.mky-chat-drop-zone').hide();
                    $('.jFiler-input-dragDrop').hide();
                },
            },
            files: null,
            addMore: false,
            clipBoardPaste: true,
            excludeName: null,
            beforeRender: null,
            afterRender: null,
            beforeShow: null,
            beforeSelect: null,
            onSelect: function(obj) {
                // showChatInputFile();
                catchUpFile(obj)
            },
            afterShow: null,
            onEmpty: null,
            options: null,
            captions: {
                drop: "Drop file here to Upload"
            }
        });

        if (monkeyUI.screen.data.mode == PARTIALSIZE) {
            $(".mky-chat-drop-zone").attr('style','width:'+monkeyUI.screen.data.width+'; height:'+monkeyUI.screen.data.height+';');
        }
        $('#mky-chat-input').prepend($( ".mky-chat-drop-zone" ).detach());

    }

    document.addEventListener("dragenter", function( event ) {
           // alert('ddd');
        console.log('over document')
        $(document).find('.mky-chat-drop-zone').show();
    });

    function catchUpFile(file) {
        
        fileCaptured.file = file;
        console.log(fileCaptured.file)
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

    function showChatInputFile(){
        typeMessageToSend = 3;
        // $("#mky-chat-input").addClass('mky-chat-input-file');
        // $('#mky-button-attach').parent().addClass("mky-disappear");
        // $('#mky-button-record-audio').parent().addClass("mky-disappear");
        // $('#mky-button-send-message').parent().removeClass("mky-disappear");
        // $('#mky-button-send-ephemeral').addClass('enable_timer');
    }

    function hideChatInputFile(){
        typeMessageToSend = -1;
        $("#mky-chat-input").removeClass('mky-chat-input-file');
        $('#mky-button-attach').parent().removeClass("mky-disappear");
        $('#mky-button-record-audio').parent().removeClass("mky-disappear");
        $('#mky-button-send-message').parent().addClass("mky-disappear");
        $('#mky-button-send-ephemeral').removeClass('enable_timer');
    }

    function showChatInputRecord(){
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

    function disabledAudioButton(bool){
        $('#mky-button-record-audio').disabled = bool;
        if(bool){
            $('#mky-button-record-audio').parent().addClass("mky-disabled");
        }else{
            $('#mky-button-record-audio').parent().removeClass("mky-disabled");
        }
    }
    /***********************************************/
    /*************** DRAW CONVERSATION *************/
    /***********************************************/

    this.drawConversation = function(conversation, isHidden){
        var _conversationIdHandling = getConversationIdHandling(conversation.id);
    
        // set app intro
        if(!isHidden && $(this.contentIntroApp).length >= 0){
            $(this.contentIntroApp).remove();
        }

        if(!isHidden){
            // set conversation window
            $(this.contentConversationWindow).addClass('mky-disabled');

            // set header conversation
            //var conversationPhoto = isConversationGroup(this.id) ? _conversationIdHandling : users[this.id].id;
            $('#mky-conversation-selected-image img').attr('src',conversation.urlAvatar);
            var conversationName = conversation.name ? conversation.name : 'undefined';
            $('#mky-conversation-selected-name').html(conversationName);
            //$('#mky-conversation-selected-members').html('');

            // set conversation item
            if(this.isConversationList){
                $(this.contentConversationList+' li').removeClass('mky-conversation-selected');
                $(this.contentConversationList+' li').addClass('mky-conversation-unselected');
                $('#conversation-'+_conversationIdHandling).removeClass('mky-conversation-unselected');
                $('#conversation-'+_conversationIdHandling).addClass('mky-conversation-selected');
                // (badge)
                $('#conversation-'+_conversationIdHandling).find('.mky-conversation-notification').remove();
                removeNotification(_conversationIdHandling);
            }

            // set chat timeline
            $('.mky-chat-timeline-conversation').removeClass('mky-appear');
            $('.mky-chat-timeline-conversation').addClass('mky-disappear');
            if ($('#mky-chat-timeline-conversation-'+_conversationIdHandling).length > 0) {
                $('#mky-chat-timeline-conversation-'+_conversationIdHandling).removeClass('mky-disappear');
                $('#mky-chat-timeline-conversation-'+_conversationIdHandling).addClass('mky-appear');
                scrollToDown();
            }else{
                drawConversationWindow(conversation.id, isHidden);
                if(this.isConversationList){
                    drawConversationItem(this.contentConversationList, conversation);
                }
            }

            // set input
            this.showChatInput();

            // set conversation window, start to chat
            $(this.contentConversationWindow).removeClass('mky-disabled');
        }else{
            // set chat timeline
            if ($('#mky-chat-timeline-conversation-'+_conversationIdHandling).length <= 0) {
                drawConversationWindow(conversation.id, isHidden);
                if(this.isConversationList){
                    drawConversationItem(this.contentConversationList, conversation);
                }
            }
        }
    }

    function drawConversationWindow(conversationId, isHidden){
        var _class = isHidden ? 'mky-disappear' : 'mky-appear';
        $('#mky-chat-timeline').append('<div class="mky-chat-timeline-conversation '+_class+'" id="mky-chat-timeline-conversation-'+conversationId+'"></div>');
    }

    function drawConversationItem(contentConversationList, conversation){

        var _li = '<li id="conversation-'+conversation.id+'" class="mky-conversation-unselected" onclick="openConversation(\''+conversation.id+'\')">'+
                    '<div class="mky-conversation-image">'+
                        '<img src="'+conversation.urlAvatar+'" onerror="imgError(this);">';
        var _conversationName = conversation.name ? conversation.name : 'undefined';
        _li +=      '</div>'+
                    '<div class="mky-conversation-description"><div class="mky-conversation-name"><span class="mky-ellipsify">'+_conversationName+'</span></div><div class="mky-conversation-state"><span class="mky-ellipsify">Click to open conversation</span></div></div>'+
                '</li>';
        $(contentConversationList).append(_li);
    }

    this.updateDrawConversation = function(conversation){
        var _conversationLi = $('#conversation-'+conversation.id);
        _conversationLi.find('img').attr('src',conversation.urlAvatar);
        _conversationLi.find('.mky-conversation-name span').html(conversation.name);
    }
	
	/***********************************************/
    /************** STATE CONVERSATION *************/
    /***********************************************/
    
    this.updateOnlineStatus = function(lastOpenApp, online){
        if (online == 0) {
            currentConversationOnlineState = defineTime(lastOpenApp);
            $('#mky-conversation-selected-status').html('Last seen '+defineTime(lastOpenApp));
        }else{
            currentConversationOnlineState = 'Online';
            $('#mky-conversation-selected-status').html('Online');
        }
    }
	
	this.updateTypingState = function(conversationId, state) {
	    var user = $('#mky-conversation-'+conversationId);
	    var content = user.find('.mky-conversation-state').hide();
	    user.find('.mky-user-info-typing').remove();
	
	    if(state == 21){
	        user.find('.mky-conversation-description').append('<span class="mky-user-info-typing"> typing... </span>');
	    }else if(state == 20){
	        user.find('.mky-user-info-typing').remove();
	        user.find('.mky-conversation-state').show();
	    }
	
		if ($('#mky-chat-timeline-conversation-'+conversationId).hasClass('mky-appear')) {
			if(state == 21){
	            $('#mky-conversation-selected-status').html('typing...');
	        }else{
	            $('#mky-conversation-selected-status').html(currentConversationOnlineState);
	        }
		}
	}

    /***********************************************/
    /************** NOTIFICATION/BADGE *************/
    /***********************************************/

    function updateNotification(text, conversationId){
        var liConversation =  $("#conversation-"+conversationId);

        if(text.length >= 20){
            text = text.substr(0,20);
        }

        liConversation.find('.mky-conversation-state span').html(text);
        setNotification(conversationId);

        if ($('#mky-chat-timeline-conversation-'+conversationId).hasClass('mky-appear')) {
            // counting notification existing badges 

            if (liConversation.find('.mky-conversation-notification').length > 0) {
                var num = parseInt( liConversation.find('.mky-conversation-notification').first().find('.mky-notification-amount').html() );
                    num = num + 1;
                    liConversation.find('.mky-conversation-notification').first().find('.mky-notification-amount').html(num);
            }else{
                liConversation.prepend('<div class="mky-conversation-notification"><div class="mky-notification-amount">1</div></div>');
            }        
        }else{
            removeNotification(conversationId);
        }
    }

    function setNotification (conversationId) {
        var liConversation =  $('#conversation'+conversationId);
        liConversation.find('.mky-conversation-description span').addClass('mky-bold-text');
    }

    function removeNotification (conversationId) {
        var liConversation =  $("conversation-"+conversationId);
        liConversation.find('.mky-conversation-description span').removeClass('mky-bold-text');
    }

    /***********************************************/
    /****************** DRAW BUBBLES ***************/
    /***********************************************/

    function defineMessageStatus(status){
        switch(status){
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

    function baseBubble(message, isOutgoing, withName, status){
        var _bubble = '';
        var _classBubble = isOutgoing ? 'mky-bubble-out' : 'mky-bubble-in';
        var _classStatus = defineMessageStatus(status);

        _bubble = '<div class="mky-message-line">'+
                    '<div id="'+message.id+'" class="mky-bubble '+_classBubble+'">'+
                        '<div class="mky-message-detail">';
        if(withName){
            var _senderName = message.senderName ? message.senderName : 'Unknown';
            var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
            _bubble += '<span class="mky-message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
        }
        _bubble += '<span class="mky-message-hour">'+defineTime(message.timestamp*1000)+'</span>';
        if(isOutgoing){
            _bubble += '<div class="mky-message-status '+_classStatus+'">';
            if(status != 0){
                _bubble += '<i class="fa fa-check"></i>';
            }
        }
        _bubble += '</div>'+
                '</div>'+
            '</div>';

        return _bubble;
    }

    this.drawTextMessageBubble = function(message, conversationId, isGroupChat, status){
        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
        var _conversationIdHandling = getConversationIdHandling(conversationId);
        var _messageText = findLinks(message.text);

        $('#mky-chat-timeline-conversation-'+_conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
        var _classTypeBubble = _isOutgoing ? 'mky-bubble-text-out' : 'mky-bubble-text-in';
        var _messagePoint = $('#'+message.id);
        _messagePoint.addClass('mky-bubble-text');
        _messagePoint.addClass(_classTypeBubble);

        var _content = '<span class="mky-message-text">'+_messageText+'</span>';
        _messagePoint.append(_content);
        scrollToDown();

        if(message.eph == 1){
            updateNotification("Private Message",_conversationIdHandling);
        }else{
            updateNotification(message.text,_conversationIdHandling);
        }
    }

    this.drawImageMessageBubble = function(message, conversationId, isGroupChat, status){
        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
        var _conversationIdHandling = getConversationIdHandling(conversationId);
        var _fileName = message.text;
        var _dataSource = message.dataSource != undefined ? message.dataSource : 'images/ukn.png';

        $('#mky-chat-timeline-conversation-'+_conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
        var _classTypeBubble = _isOutgoing ? 'mky-bubble-image-out' : 'mky-bubble-image-in';
        var _messagePoint = $('#'+message.id);
        _messagePoint.addClass('mky-bubble-image');
        _messagePoint.addClass(_classTypeBubble);

        var _content = '<div class="mky-content-image" onclick="monkeyUI.showViewer(\''+message.id+'\',\''+_fileName+'\')">'+
                            '<img src='+_dataSource+'>'+
                        '</div>';
        _messagePoint.append(_content);
        scrollToDown();

        if(message.eph == 1){
            updateNotification("Private Image",_conversationIdHandling);
        }else{
            updateNotification("Image",_conversationIdHandling);
        }
    }

    this.drawAudioMessageBubble = function(message, conversationId, isGroupChat, status, audioOldId){
        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
        var _conversationIdHandling = getConversationIdHandling(conversationId);
        var _dataSource = message.dataSource;

        var _messagePoint = $('#'+audioOldId);
        if(_messagePoint.length > 0){
            _messagePoint.attr('id',message.id);
            _messagePoint.find('.mky-content-audio-loading').remove();
            _messagePoint = $('#'+message.id);
        }else{
            $('#mky-chat-timeline-conversation-'+_conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
            var _classTypeBubble = _isOutgoing ? 'mky-bubble-audio-out' : 'mky-bubble-audio-in';
            _messagePoint = $('#'+message.id);
            _messagePoint.addClass('mky-bubble-audio');
            _messagePoint.addClass(_classTypeBubble);
        }

        if(this.player == 'knob'){
            var _content = '<div class="content-audio mky-disabled">'+
                                '<img id="playAudioBubbleImg'+message.id+'" style="display:block;" onclick="monkeyUI.playAudioBubble('+message.id+');" class="mky-bubble-audio-button mky-bubble-audio-button'+message.id+' playBubbleControl" src="../images/PlayBubble.png">'+
                                '<img id="pauseAudioBubbleImg'+message.id+'" onclick="monkeyUI.pauseAudioBubble('+message.id+');" class="mky-bubble-audio-button mky-bubble-audio-button'+message.id+'" src="../images/PauseBubble.png">'+
                                '<input id="play-player_'+message.id+'" class="knob second" data-width="100" data-displayPrevious=true value="0">'+
                                '<div class="mky-bubble-audio-timer"><span id="mky-minutesBubble'+message.id+'">00</span><span>:</span><span id="mky-secondsBubble'+message.id+'">00</span></div>'+
                            '</div>'+
                            '<audio id="audio_'+message.id+'" preload="auto" style="display:none;" controls="" src="'+_dataSource+'"></audio>';
            _messagePoint.append(_content);

            createAudiohandlerBubble(message.id,Math.round(message.length));
            audiobuble = document.getElementById("audio_"+message.id);
            audiobuble.oncanplay = function() {
                createAudiohandlerBubble(message.id,Math.round(audiobuble.duration));
                setDurationTime(message.id);
                $('#'+message.id+' .content-audio').removeClass('mky-disabled');
            };
        }else{
            var _content = '<audio id="audio_'+message.id+'" preload="auto" controls="" src="'+_dataSource+'"></audio>';
            _messagePoint.append(_content);
        }

        

        scrollToDown();

        if(message.eph == 1){
            updateNotification("Private Audio",_conversationIdHandling);
        }else{
            updateNotification("Audio",_conversationIdHandling);
        } 
    }

    this.drawFileMessageBubble = function(message, conversationId, isGroupChat, status){
        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
        var _conversationIdHandling = getConversationIdHandling(conversationId);
        var _fileName = message.text;
        var _dataSource = message.dataSource != undefined ? message.dataSource : '';

        $('#mky-chat-timeline-conversation-'+_conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
        var _classTypeBubble = _isOutgoing ? 'mky-bubble-file-out' : 'mky-bubble-file-in';
        var _messagePoint = $('#'+message.id);
        _messagePoint.addClass('mky-bubble-file');
        _messagePoint.addClass(_classTypeBubble);
        var _content = '<div class="mky-content-file">'+
                            '<a class="mky-file-link" href="'+_dataSource+'" download="'+message.filename+'" >';

        if(message.ext == 'doc' || message.ext == 'docx'){
            _content += '<div class="mky-file-icon mky-icon-word"></div>';
        }else if(message.ext == 'pdf'){
            _content += '<div class="mky-file-icon mky-icon-pdf"></div>';
        }else if(message.ext == 'xls' || message.ext == 'xlsx'){
            _content += '<div class="mky-file-icon mky-xls-icon"></div>';
        }else{
            _content += '<div class="mky-file-icon mky-img-icon"></div>';
        }
        //_content += '<img class="mky-icon-file-define" src="./images/xls-icon.png" alt="your image" />';
        //_content += '<img class="mky-icon-file-define" src="./images/ppt-icon.png" alt="your image" />';
        _content += '<div class="mky-file-detail">'+
                        '<div class="mky-file-name"><span class="mky-ellipsify">'+message.filename+'</span></div>'+
                        '<div class="mky-file-size"><span class="mky-ellipsify">'+message.filesize+' bytes</span></div>'+
                    '</div>'+
                '</a>'+
            '</div>';
        _messagePoint.append(_content);
        scrollToDown();

        if(message.eph == 1){
            updateNotification("Private File",_conversationIdHandling);
        }else{
            updateNotification("File",_conversationIdHandling);
        }
    }



    this.drawTextMessageBubble_ = function(message, conversationId, status){
        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
        var _conversationIdHandling = getConversationIdHandling(conversationId);

        var _messageText = findLinks(message.text);
        var _bubble = '';
        
        if (_isOutgoing == 0) { // incoming
            if (message.eph == 0) {
                _bubble = '<div class="mky-message-line">'+
                                    '<div id="'+message.id+'" class="mky-bubble mky-bubble-text mky-bubble-text-in mky-bubble-in">'+
                                        '<div class="mky-message-detail">';
                if(conversationId.indexOf("G:") >= 0){
                    var _senderName = message.senderName ? message.senderName : 'Unknown';
                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="mky-message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
                }          
                            _bubble += '<span class="mky-message-hour">'+defineTime(message.timestamp*1000)+'</span>'+
                                        '</div>'+
                                        '<span class="mky-message-text">'+_messageText+'</span>'+
                                    '</div>'+
                                '</div>';             
            }else{
                var _duration = Math.round(message.length * 0.07);
                if(_duration < 15){
                    _duration = 15;
                }
                _bubble = '<div class="mky-message-line">'+
                                    '<div id="'+message.id+'" class="mky-bubble mky-bubble-text mky-bubble-text-in mky-bubble-in mky-bubble-private" onclick="showPrivateTextMessage(\''+message.id+'\',\''+message.senderId+'\',\''+_duration+'\')">'+
                                        '<div class="mky-message-detail">';
                if(conversationId.indexOf("G:") >= 0){
                    var _senderName = message.senderName ? message.senderName : 'Unknown';
                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="mky-message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
                }
                            _bubble += '<div class="mky-message-content-timer">'+
                                                '<i class="fa fa-clock-o"></i>'+
                                                '<span class="mky-message-timer"> '+defineTimer(_duration)+'</span>'+
                                            '</div>'+
                                        '</div>'+
                                        '<span class="mky-message-text">Click to read</span>'+
                                        '<div class="mky-message-code">'+message.encryptedText+'</div>'+
                                    '</div>'+
                                '</div>';              
            }
        } else if (_isOutgoing == 1){ // outgoing
            if (message.eph == 0){
                var _status;
                switch(status){
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

                _bubble='<div class="mky-message-line">'+
                            '<div id="'+message.id+'" class="mky-bubble mky-bubble-text mky-bubble-text-out mky-bubble-out'+(status == 0 ? 'mky-sending' : '')+'">'+
                                '<div class="mky-message-detail">'+
                                    '<span class="mky-message-hour">'+defineTime(message.timestamp)+'</span>'+
                                    '<div class="mky-message-status '+_status+'">';
                                    if(status != 0){
                                        _bubble += '<i class="fa fa-check"></i>';
                                    }
                                _bubble += '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="mky-button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                '<span class="mky-message-text">'+_messageText+'</span>'+
                            '</div>'+
                        '</div>';
            }else{
                _bubble='<div class="mky-message-line">'+
                                '<div id="'+message.id+'" class="mky-bubble mky-bubble-text mky-bubble-text-out mky-bubble-out'+(status == 0 ? 'mky-sending' : '')+'">'+
                                    '<div class="mky-message-detail">'+
                                        '<span class="mky-message-hour">'+defineTime(message.timestamp)+'</span>'+
                                        '<div class="mky-message-status '+_status+'">';
                                        if(status != 0){
                                            _bubble += '<i class="fa fa-check"></i>';
                                        }
                                    _bubble += '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="mky-button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                    '<span class="mky-message-text">Private Message</span>'+
                                '</div>'+
                            '</div>';
            }
        }
        $('#mky-chat-timeline-conversation-'+_conversationIdHandling).append(_bubble);
        
        scrollToDown();

        if(message.eph == 1){
            updateNotification("Private Message",_conversationIdHandling);
        }else{
            updateNotification(message.text,_conversationIdHandling);
        }
    }

    this.drawImageMessageBubble_ = function(message, conversationId, status){
        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
        var _conversationIdHandling = getConversationIdHandling(conversationId);

        var _fileName = message.text;
        var _dataSource = message.dataSource != undefined ? message.dataSource : 'images/ukn.png';
        var _bubble = '';

        if (_isOutgoing == 0) { // incoming
            if (message.eph == 0) {
                _bubble = '<div class="mky-message-line">'+
                                '<div id="'+message.id+'" class="mky-bubble-image-in mky-bubble-in">'+
                                    '<div class="mky-message-detail">';
                if(conversationId.indexOf("G:") >= 0){
                    var _senderName = message.senderName ? message.senderName : 'Unknown';
                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="mky-message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
                }
                        _bubble += '<span class="mky-message-hour">'+defineTime(message.timestamp*1000)+'</span>'+
                                    '</div>'+
                                    '<div class="mky-content-image" onclick="monkeyUI.showViewer(\''+message.id+'\',\''+_fileName+'\')">'+
                                      '<img src='+_dataSource+'>'+
                                    '</div>'+
                                '</div>'+
                            '</div>';
            }else{
                var _duration = 15;

                _bubble = '<div class="mky-message-line">'+
                                    '<div id="'+message.id+'" class="mky-bubble-image-private-in mky-bubble-in mky-bubble-private" onclick="showPrivateViewer(\''+message.id+'\',\''+message.senderId+'\',\''+_duration+'\',\''+message.cmpr+'\',\''+message.encr+'\')">'+
                                        '<div class="mky-message-detail">';
                if(conversationId.indexOf("G\\:") >= 0){
                    var _conversation = conversations[message.recipientId];
                    var _classUnknown = users[message.senderId].id == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="mky-message-user-name '+_classUnknown+'" style="color: #'+colorUsers[_conversation.members.indexOf(message.senderId)]+'">'+users[message.senderId].name+'</span>';
                }
                                    _bubble += '<div class="mky-message-content-timer">'+
                                                '<i class="fa fa-clock-o"></i>'+
                                                '<span class="mky-message-timer"> '+defineTimer(_duration)+'</span>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="mky-message-icon-define mky-icon-image"></div>'+
                                        '<span class="mky-message-text">Click to view</span>'+
                                        '<div class="mky-message-code">'+message.encryptedText+'</div>'+
                                    '</div>'+
                                '</div>';
            }
        } else if (_isOutgoing == 1){ // outgoing
            if(message.eph == 0){
                _bubble = '<div class="mky-message-line">'+
                                    '<div id="'+message.id+'" class="mky-bubble-image-out mky-bubble-out">'+
                                        '<div class="mky-message-detail">'+
                                            '<span class="mky-message-hour">'+defineTime(message.timestamp)+'</span>'+
                                            '<div class="mky-message-status mky-status-load">'+
                                                '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="mky-button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                        '<div class="mky-content-image" onclick="monkeyUI.showViewer(\''+message.id+'\',\''+_fileName+'\')">'+
                                            '<img src="'+_dataSource+'">'+
                                        '</div>'+
                                    '</div>'+
                                '</div>';
            }else{
                _bubble='<div class="mky-message-line">'+
                                '<div id="'+message.id+'" class="mky-bubble-text-out mky-bubble-out mky-sending">'+
                                    '<div class="mky-message-detail">'+
                                        '<span class="mky-message-hour">'+defineTime(message.timestamp)+'</span>'+
                                        '<div class="mky-message-status mky-status-load">'+
                                            '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="mky-button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                    '<span class="mky-message-text">Private Image</span>'+
                                '</div>'+
                            '</div>';
            }
        }
        $('#mky-chat-timeline-conversation-'+_conversationIdHandling).append(_bubble);
        scrollToDown();

        if(message.eph == 1){
            updateNotification("Private Image",_conversationIdHandling);
        }else{
            updateNotification("Image",_conversationIdHandling);
        }
    }

    this.drawAudioMessageBubble_ = function(message, conversationId, status, messageOldId){
        var _isOutgoing = message.senderId == this.user.monkeyId ? 1 : 0;
        var _conversationIdHandling = getConversationIdHandling(conversationId);

        var _dataSource = message.dataSource;
        var _bubble='';
        if (_isOutgoing == 0) { // incoming
            if (message.eph == 0) {
                
                _bubble = '<div class="mky-message-line">'+
                                '<div id="'+message.id+'" class="mky-bubble-audio-in mky-bubble-in">'+
                                    '<div class="mky-message-detail">';
                if(conversationId.indexOf("G:") >= 0){
                    var _senderName = message.senderName ? message.senderName : 'Unknown';
                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="mky-message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
                }
                        _bubble += '<span class="mky-message-hour">'+defineTime(message.timestamp*1000)+'</span>'+
                                    '</div>'+
                                    '<div class="content-audio">'+
                                        '<img id="playAudioBubbleImg'+message.id+'" style="display:block;" onclick="monkeyUI.playAudioBubble('+message.id+');" class="mky-bubble-audio-button mky-bubble-audio-button'+message.id+' playBubbleControl" src="../images/PlayBubble.png">'+
                                        '<img id="pauseAudioBubbleImg'+message.id+'" onclick="monkeyUI.pauseAudioBubble('+message.id+');" class="mky-bubble-audio-button mky-bubble-audio-button'+message.id+'" src="../images/PauseBubble.png">'+
                                        '<input id="play-player_'+message.id+'" class="knob second" data-width="100" data-displayPrevious=true value="0">'+
                                        '<div class="mky-bubble-audio-timer"><span id="mky-minutesBubble'+message.id+'">'+("0" + parseInt(message.length/60)).slice(-2)+'</span><span>:</span><span id="mky-secondsBubble'+message.id+'">'+("0" + message.length%60).slice(-2)+'</span></div>'+
                                    '</div>';
                        var _dataSource = message.dataSource != undefined ? message.dataSource : '';    
                        _bubble += '<audio id="audio_'+message.id+'" preload="auto" style="display:none;" controls="" src="'+_dataSource+'"></audio>'+
                                '</div>'+                            
                            '</div>';
            }else{
                var _duration = Math.round(message.length + (message.length * 0.25));
                if(_duration < 15){
                    _duration = 15;
                }

                _bubble = '<div class="mky-message-line">'+
                                '<div id="'+message.id+'" class="mky-bubble-audio-private-in mky-bubble-in mky-bubble-private" onclick="showPrivateAudioMessage(\''+message.id+'\',\''+message.senderId+'\',\''+_duration+'\',\''+message.cmpr+'\',\''+message.encr+'\')">'+
                                    '<div class="mky-message-detail">';
                if(conversationId.indexOf("G\\:") >= 0){
                    var _conversation = conversations[message.recipientId];
                    var _classUnknown = users[message.senderId].id == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="mky-message-user-name '+_classUnknown+'" style="color: #'+colorUsers[_conversation.members.indexOf(message.senderId)]+'">'+users[message.senderId].name+'</span>';
                }
                        _bubble += '<div class="mky-message-content-timer">'+
                                            '<i class="fa fa-clock-o"></i>'+
                                            '<span class="mky-message-timer"> '+defineTimer(_duration)+'</span>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="mky-message-icon-define mky-icon-audio"></div>'+
                                    '<span class="mky-message-text">Click to listen</span>'+
                                    '<div class="mky-message-code">'+message.encryptedText+'</div>'+
                                '</div>'+
                            '</div>';
            }
        }else if (_isOutgoing == 1){ // outgoing
            if(message.eph == 0){
                if(messageOldId == undefined){
                    _bubble += '<div class="mky-message-line">';
                }
                    _bubble +=  '<div id="'+message.id+'" class="mky-bubble-audio-out mky-bubble-out">'+
                                    '<div class="mky-message-detail">'+
                                        '<span class="mky-message-hour">'+defineTime(message.timestamp)+'</span>'+
                                        '<div class="mky-message-status mky-status-load">'+
                                            '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="mky-button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                    '<div class="content-audio">'+
                                        '<img id="playAudioBubbleImg'+message.id+'" style="display:block;" onclick="monkeyUI.playAudioBubble('+message.id+');" class="mky-bubble-audio-button mky-bubble-audio-button'+message.id+' playBubbleControl" src="../images/PlayBubble.png">'+
                                        '<img id="pauseAudioBubbleImg'+message.id+'" onclick="monkeyUI.pauseAudioBubble('+message.id+');" class="mky-bubble-audio-button mky-bubble-audio-button'+message.id+'" src="../images/PauseBubble.png">'+
                                        '<input id="play-player_'+message.id+'" class="knob second" data-width="100" data-displayPrevious=true value="0">'+
                                        '<div class="mky-bubble-audio-timer"><span id="mky-minutesBubble'+message.id+'">00</span><span>:</span><span id="mky-secondsBubble'+message.id+'">00</span></div>'+
                                    '</div>'+
                                    '<audio id="audio_'+message.id+'" preload="auto" style="display:none;" controls="" src="'+_dataSource+'"></audio>'+
                                '</div>';
                if(messageOldId == undefined){
                    _bubble += '</div>';
                }
            }else{
                _bubble='<div class="mky-message-line">'+
                            '<div id="'+message.id+'" class="mky-bubble-text-out mky-bubble-out mky-sending">'+
                                '<div class="mky-message-detail">'+
                                    '<span class="mky-message-hour">'+defineTime(message.timestamp)+'</span>'+
                                    '<div class="mky-message-status mky-status-load">'+
                                        '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="mky-button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                '<span class="mky-message-text">Private audio</span>'+
                            '</div>'+
                        '</div>';
            }
        }

        if(messageOldId != undefined){
            $('#'+messageOldId).parent().html(_bubble);
        }else{
            $('#mky-chat-timeline-conversation-'+_conversationIdHandling).append(_bubble);
        } 
        scrollToDown();
        
        if(message.eph == 1){
            updateNotification("Private Audio",_conversationIdHandling);
        }else{
            updateNotification("Audio",_conversationIdHandling);
        }  

        createAudiohandlerBubble(message.id,Math.round(message.length));

        if(message.eph == 0){
            console.log("audio_"+message.id);
            audiobuble = document.getElementById("audio_"+message.id);
            audiobuble.oncanplay = function() {
                createAudiohandlerBubble(message.id,Math.round(audiobuble.duration));
                setDurationTime(message.id);
                $('#'+messageId+' .content-audio').removeClass('mky-disabled');
            };
        }
    }

    function drawAudioMessageBubbleTemporal(dataSource, message, duration){
        $('#mky-chat-timeline').find('.mky-appear').append(baseBubble(message, 1, false, 0));
        var _classTypeBubble = 'mky-bubble-audio-out';
        var _messagePoint = $('#'+message.id);
        _messagePoint.addClass('mky-bubble-audio');
        _messagePoint.addClass(_classTypeBubble);

        var _content = '<div class="mky-content-audio-loading">'+
                            '<div class="mky-double-bounce1"></div>'+
                            '<div class="mky-double-bounce2"></div>'+
                        '</div>';
        _messagePoint.append(_content);
        scrollToDown();
    }

    this.getMessageUnknown = function(){
        return $('.user-unknown');
    }

    this.updateDataMessageBubble = function(messageId, data){
        var messagePoint = $('#'+messageId);
        if(messagePoint.find('.mky-content-image').length > 0){
            messagePoint.find('img').attr('src',data);
        }else if(messagePoint.find('audio').length > 0){
            messagePoint.find('audio').attr('src',data);
        }else if(messagePoint.find('.mky-content-file').length > 0){
            messagePoint.find('.mky-file-link').attr('href',data);
        }
    }

    /***********************************************/
    /***************** STATE BUBBLE ****************/
    /***********************************************/

    this.updateStatusMessageBubble = function(messageOldId, messageNewId, status) {

        var messagePoint = $('#'+messageOldId);

        if(messageOldId != messageNewId && messagePoint.length > 0){
            messagePoint.attr('id',messageNewId);
            // var _contentOnClick = messagePoint.find('.mky-button-message-unsend').attr('onclick');
            // var _conversationId = _contentOnClick.slice(29,_contentOnClick.length - 2);
            // messagePoint.find('.mky-button-message-unsend').attr({
            //   onclick: "unsendMessage('"+messageNewId+"','"+_conversationId+"')"
            // });
        }
        messagePoint = $('#'+messageNewId);
        
        if (messagePoint.find('.mky-content-image').length > 0) { // image message
            var _onClickAttribute = messagePoint.find('.mky-content-image').attr('onclick');
            _onClickAttribute = _onClickAttribute+"";
            var params = _onClickAttribute.split(',');
            var _fileName = params[1].substr(1,params[1].length-3);
            messagePoint.find('.mky-content-image').attr({
              onclick: "monkeyUI.showViewer('"+messageNewId+"','"+_fileName+"')"
            });
        }
        
        messagePoint.find('.mky-message-status').removeClass('mky-status-load');
        messagePoint.find('.mky-message-status').removeClass('mky-status-sent');

        if (status == 52) {
            messagePoint.find('.mky-message-status').addClass('mky-status-read');
        }else if (status == 50 || status == 51){
            messagePoint.find('.mky-message-status').addClass('mky-status-sent');
        }
        
        if(messagePoint.find('.fa').length <= 0){
            messagePoint.find('.mky-message-status').prepend('<i class="fa fa-check"></i>');
        }
    }
	
	this.updateStatusReadMessageBubble = function(conversationId) {
		var _conversationPoint = $('#mky-chat-timeline-conversation-'+conversationId);
		_conversationPoint.find('.mky-message-status').removeClass('mky-status-sent');
		_conversationPoint.find('.mky-message-status').addClass('mky-status-read');
	}

	this.updateStatusMessageBubbleByTime = function(conversationId, lastDateTime) {
	    var _conversationPoint = $('#mky-chat-timeline-conversation-'+conversationId);
	    var _messageDatetimeTmp;
	    _conversationPoint.find('.mky-bubble-out').each(function() {
	        _messageDatetimeTmp = $(this).find('.mky-message-time').text();
	        if(_messageDatetimeTmp < lastDateTime && $(this).find('.mky-status-read').length == 0){
	            $(this).find('.mky-message-status').removeClass('mky-status-load');
	            $(this).find('.mky-message-status').removeClass('mky-status-sent');
	            $(this).find('.mky-message-status').addClass('mky-status-read');
	            $(this).find('.mky-message-status').prepend('<i class="fa fa-check"></i>');
	        }else if(_messageDatetimeTmp > lastDateTime && $(this).find('.mky-status-sent').length == 0){
	            $(this).find('.mky-message-status').removeClass('mky-status-load');
	            $(this).find('.mky-message-status').addClass('mky-status-sent');
	        }
	    });
	}

    /***********************************************/
    /***************** AUDIO PLAYER ****************/
    /***********************************************/

    // define duration of bubble audio player
    function createAudiohandlerBubble(timestamp, duration) {
        $("#play-player_"+timestamp).knob({
            'min':0,
            'max': duration,
            'angleOffset':-133,
            'angleArc': 265,
            'width':100,
            'height': 90,
            'displayInput':false,
            'skin':'tron',
            change : function (value) {
                audiobuble.currentTime=value;
            }
        });
    }

    this.playAudioBubble = function(timestamp) {
        pauseAllAudio (timestamp);
        $bubblePlayer = $("#play-player_"+timestamp); //handles the cricle
        $('.mky-bubble-audio-button'+timestamp).hide();
        $('#pauseAudioBubbleImg'+timestamp).css('display', 'block');
        minutesBubbleLabel = document.getElementById("mky-minutesBubble"+timestamp);
        secondsBubbleLabel = document.getElementById("mky-secondsBubble"+timestamp);
        audiobuble = document.getElementById("audio_"+timestamp);
        audiobuble.play();
        playIntervalBubble = setInterval("monkeyUI.updateAnimationBuble()",1000);
        audiobuble.addEventListener("ended",function() {
            setDurationTime(timestamp);
            //this.load();
            $bubblePlayer.val(0).trigger("change");
            $('#playAudioBubbleImg'+timestamp).css('display', 'block');
            $('#pauseAudioBubbleImg'+timestamp).css('display', 'none');
            clearInterval(playIntervalBubble);
        });
    }

    this.updateAnimationBuble = function() {
        var currentTime = Math.round(audiobuble.currentTime);
        $bubblePlayer.val(currentTime).trigger("change");
        secondsBubbleLabel.innerHTML = ("0" + currentTime%60).slice(-2);
        minutesBubbleLabel.innerHTML = ("0" + parseInt(currentTime/60)).slice(-2);
    }

    this.pauseAudioBubble = function(timestamp) {
        $('.mky-bubble-audio-button'+timestamp).hide();
        $('#playAudioBubbleImg'+timestamp).toggle();
        audiobuble.pause();
        clearInterval(playIntervalBubble);
    }

    function pauseAllAudio (timestamp) {
        document.addEventListener('play', function(e){
            var audios = document.getElementsByTagName('audio');
            for(var i = 0, len = audios.length; i < len;i++){
                if(audios[i] != e.target){
                    //console.log(audios[i].id);
                    audios[i].pause();
                    $('.mky-bubble-audio-button').hide();
                    $('.playBubbleControl').show();
                    $('#playAudioBubbleImg'+timestamp).hide();
                    $('#pauseAudioBubbleImg'+timestamp).show();
                }   
            }
        }, true);
    }

    function setDurationTime (timestamp) {
        audiobuble = document.getElementById("audio_"+timestamp);
        var durationTime= Math.round(audiobuble.duration);
        minutesBubbleLabel = document.getElementById("mky-minutesBubble"+timestamp);
        secondsBubbleLabel = document.getElementById("mky-secondsBubble"+timestamp);
        secondsBubbleLabel.innerHTML = ("0" + durationTime%60).slice(-2);
        minutesBubbleLabel.innerHTML = ("0" + parseInt(durationTime/60)).slice(-2);
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

    this.addLoginForm = function(html){
        $(this.wrapperIn).append(html);
    }

    this.showViewer = function(messageId, fileName){
        var _messagePoint = $('#'+messageId);
        var _file = _messagePoint.find('.mky-content-image img').attr('src');

        var _html = '<div class="mky-viewer-content">'+
            '<div class="mky-viewer-toolbar">'+
                '<button id="mky-button-exit" onclick="monkeyUI.exitViewer()"> X </button>'+
                '<a href="'+_file+'" download="'+fileName+'" >'+
                    '<button class="mky-button-download" title="Download">Download</button>'+
                '</a>'+
                // '<a href="'+_file+'" >'+
                    '<button class="mky-button-download" title="Download" onclick="monkeyUI.printFile()" >Print</button>'+
                // '</a>'+
            '</div>'+
            '<div id="file_viewer_image" class="mky-viewer-image">'+
                '<img  src="'+_file+'">'+
            '</div>'+
            '<div class="mky-brand-app"></div>'+
        '</div>';

        $('.mky-wrapper-out').append(_html);
    }

    this.printFile = function(){
        Popup($('#file_viewer_image').html());
    }

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

    this.exitViewer = function(){
        $('.mky-viewer-content').remove();
    }

    function generateDataFile() {
        FileAPI.readAsDataURL(fileCaptured.file, function (evt){
            if( evt.type == 'load' ){
                fileCaptured.src = evt.result;
                $('#mky-button-send-message').click();
            }
        });
    }

    function showPreviewImage() { // Optional to use: replace with generateDataFile()
        var image_data = '';
        FileAPI.readAsDataURL(fileCaptured.file, function (evt){
            if( evt.type == 'load' ){
                fileCaptured.src = evt.result;
                var html = '<div id="mky-preview-image">'+
                      '<div class="mky-preview-head">'+
                        '<div class="mky-preview-title">Preview</div> '+
                        '<div id="mky-preview-close" class="mky-preview-close" onclick="monkeyUI.closeImagePreview(this)">X</div>'+
                      '</div>'+
                      '<div class="mky-preview-container">'+
                        '<img id="mky-preview-image-pic" src="'+fileCaptured.src+'">'+
                      '</div>'+
                    '</div>';
            }
        });
    }

    this.closeImagePreview = function(obj) {
        hideChatInputFile();
        $(obj).parent().parent().remove();
        $('#attach-file').val('');
    }

    function scrollToDown(container){  
        $('#mky-chat-timeline').animate({ scrollTop:100000000 }, 400); 
    }

    /***********************************************/
    /***************** RECORD AUDIO ****************/
    /***********************************************/

    // starts the library to record audio
    function startRecordAudio(){
        if (mediaRecorder == null) {
            $('#mky-button-send-ephemeral').addClass('enable_timer');
            if (!micActivated) {
                navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
                micActivated=!micActivated;
            }else{
                onMediaSuccess(mediaConstraints);
                pauseAllAudio ('');
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

        refreshIntervalId = setInterval(setTime, 1000);//start recording timer
        mediaRecorder.start(99999999999);//starts recording
    }

    function onMediaError(e) {
        console.error('media error', e);
    }

    function setTime(){
        console.log(totalSeconds);
        ++totalSeconds;
        secondsLabel.innerHTML = ("0" + totalSeconds%60).slice(-2);
        minutesLabel.innerHTML = ("0" + parseInt(totalSeconds/60)).slice(-2);
    }

    // pause audio
    function pauseAudioPrev() {
        globalAudioPreview.pause();
        clearInterval(refreshIntervalAudio);
    }

    function buildAudio(){
        if (globalAudioPreview != null)
            pauseAudioPrev();

        audioMessageOldId = Math.round((new Date().getTime()/1000)*-1);
        drawAudioMessageBubbleTemporal(audioCaptured.src, {id: audioMessageOldId, timestamp: Math.round(new Date().getTime()/1000)}, audioCaptured.duration);
        disabledAudioButton(true);
        FileAPI.readAsArrayBuffer(audioCaptured.blob, function (evt){
            if( evt.type == 'load' ){
                buildMP3('audio_.wav',evt.result);
            } else if( evt.type =='progress' ){
                var pr = evt.loaded/evt.total * 100;
            } else {  /* Error*/  }
        });
    }

    function buildMP3(fileName, fileBuffer){
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
        blobWorker = new Blob([response], {type: 'application/javascript'});
    } catch (e) { // Backwards-compatibility
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

    function readData(mp3Blob) { // read mp3 audio
        FileAPI.readAsDataURL(mp3Blob, function (evt){
            if( evt.type == 'load' ){
                disabledAudioButton(false);
                //var dataURL = evt.result;
                var _src = evt.result;
                var _dataSplit = _src.split(',');
                var _data = _dataSplit[1];
                audioCaptured.src = 'data:audio/mpeg;base64,'+_data;
                audioCaptured.monkeyFileType = 1;
                audioCaptured.oldId = audioMessageOldId;
                audioCaptured.type = 'audio/mpeg';
                $(monkeyUI).trigger('audioMessage', audioCaptured);
            } else if( evt.type =='progress' ){
                var pr = evt.loaded/evt.total * 100;
            } else {/*Error*/}
        }) 
    }

    /***********************************************/
    /********************* UTIL ********************/
    /***********************************************/

    function checkExtention (files) {
        var ft=0;  //fileType by extention

        var doc=["doc","docx"]; //1
        var pdf=["pdf"]; //2
        var xls=["xls", "xlsx"]; //3
        var ppt=["ppt","pptx"]; //4
        var img=["jpe","jpeg","jpg","png","gif"]; //6

        var extension = getExtention(files);

        if((doc.indexOf(extension)>-1)){
            ft=1;
        }
        if(xls.indexOf(extension)>-1){
            ft=3;
        }
        if(pdf.indexOf(extension)>-1){
            ft=2;
        }
        if(ppt.indexOf(extension)>-1){
            ft=4;
        }
        if(img.indexOf(extension)>-1){
            ft=6;
        }

        return ft;
    }

    function getExtention (files){
        var arr = files.name.split('.');
        var extension= arr[arr.length-1];

        return extension;
    }

    function findLinks (message) { // check text to find urls and make them links 
        if (message == undefined) {
            return '';
        }
        var _exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
        message = message.replace(_exp,"<a href='$1' target='_blank'>$1</a>");
        var _replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        message = message.replace(_replacePattern2, '$1<a href="http://$2" target="_blank" >$2</a>');
        var _replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
        message = message.replace(_replacePattern3, '<a href="mailto:$1" target="_blank">$1</a>');

        return message;
    }
};

function defineTimer(duration){
    var _minutes;
    var _seconds;
    var _result;

    _minutes = Math.floor(duration / 60);
    _seconds = duration - _minutes * 60;
    _result = _minutes+':'+_seconds;
    
    return _result;
}

function defineTime(time){
    var _d = new Date(+time);
    var nhour = _d.getHours(), nmin = _d.getMinutes(),ap;
         if(nhour==0){ap=" AM";nhour=12;}
    else if(nhour<12){ap=" AM";}
    else if(nhour==12){ap=" PM";}
    else if(nhour>12){ap=" PM";nhour-=12;}
    
    return ("0" + nhour).slice(-2)+":"+("0" + nmin).slice(-2)+ap+"";
}

function getConversationIdHandling(conversationId){
    var result;
    if (conversationId.indexOf("G:") >= 0) { // group message
        result = conversationId.slice(0, 1) + "\\" + conversationId.slice(1);
    }else{
        result = conversationId;
    }
    return result;
}
