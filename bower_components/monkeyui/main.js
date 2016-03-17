require('./bower_components/jquery-knob/js/jquery.knob.js');

require('font-awesome-webpack');

require('fileapi/dist/FileAPI.min.js');

require('jquery.filer/js/jquery.filer.min.js');
require('jquery.filer/css/jquery.filer.css');
require('jquery.filer/css/themes/jquery.filer-dragdropbox-theme.css');
//require('msr/MediaStreamRecorder.js');

//require('./src/jquery.knob.min.js');

import MUIUser from './libs/MUIUser.js';
import MUIConversation from './libs/MUIConversation.js';
import MUIMessage from './libs/MUIMessage.js';

// =================
// MUI*.js
window.MUIUser = MUIUser;
window.MUIConversation = MUIConversation;
window.MUIMessage = MUIMessage;

// =================
// MediaStreamRecorder.js
var MediaStreamRecorder = require('./src/MediaStreamRecorder.js').MediaStreamRecorder;
window.StereoRecorder = require('./src/MediaStreamRecorder.js').StereoRecorder;

// =================
// ffmpegWorker.js
var Worker = require('worker!./src/ffmpegWorker.js');

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

var monkeyUI = new function(){
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

    this.setChat = function(conf){
        monkeyUI.isConversationList = conf.showConversationList == undefined ? true : conf.showConversationList;
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
            monkeyUI.screen.data.openButton = conf.screen.data.openButton == undefined ? TAB : conf.screen.data.openButton;
        }
        monkeyUI.screen.data.width = conf.screen.data.width;
        monkeyUI.screen.data.height = conf.screen.data.height;
        monkeyUI.audio.type = conf.audio.type == undefined ? STANDARD : conf.audio.type;
        monkeyUI.form = conf.form == undefined ? false : conf.form;
    }

    this.drawScene = function(){

        var e = document.createElement("link");
        e.href = "http://cdn.criptext.com/MonkeyUI/styles/chat1.css", e.type = "text/css", e.rel = "stylesheet", document.getElementsByTagName("head")[0].appendChild(e)

        if( $('.wrapper-out').length <= 0 ){
            var _scene = '';
            if(this.screen.data.width != undefined && this.screen.data.height != undefined){
                _scene += '<div class="wrapper-out '+this.screen.data.mode+' '+this.screen.type+'" style="width: '+this.screen.data.width+'; height:30px;">';
            }else{
                _scene += '<div class="wrapper-out '+this.screen.data.mode+' '+this.screen.type+'">';
            }
            if(this.screen.type == CLASSIC){
                _scene += '<div class="tab">'+
                            '<span class="tablabel"> Want to know more? </span>'+
                            '<div id="w-max" class="appear"></div>'+
                            '<div id="w-min" class="disappear"></div>'+
                        '</div>';
            }else if(this.screen.type == SIDEBAR){
                _scene += '<div class="circle-icon">'+
                            '<div id="w-open" class="appear"></div>'+
                        '</div>';
            }
            _scene += '<div class="wrapper-in">'+
                    '<div id="content-connection"></div>'+
                    '<div id="content-app" class="disappear">';
            if(this.isConversationList){
                _scene += '<aside>'+
                            '<ul id="conversation-list" class=""></ul>'+ 
                        '</aside>';
            }
            var _class = this.isConversationList ? 'conversation-with' : 'conversation-only';
                _scene += '<section id="conversation-window" class="'+_class+'">'+
                        '</section>'+
                    '</div>'+  
                '</div>'+
            '</div>';
            $('body').append(_scene);
            drawLoading(this.contentConnection);
        }else{
            $('.wrapper-out').addClass(this.screen.data.mode);
        }
        initOptionsOutWindow(this.screen.data.height, this.form);
        drawHeaderUserSession(this.contentApp + ' aside');
        drawContentConversation(this.contentConversationWindow, this.screen.type);
        drawInput(this.contentConversationWindow, this.input);
        monkeyUI.stopLoading();
    }

    function initOptionsOutWindow(height, isForm){
        $("#w-max").click(function () {
            $('.wrapper-out').height(height);
            if(isForm && !monkeyUI.getLogin()){
                $("#w-min").removeClass('disappear');
                $("#w-min").addClass('appear');
                $("#w-max").removeClass('appear');
                $("#w-max").addClass('disappear');
            }else if(!isForm && !monkeyUI.getLogin()){
                $(monkeyUI).trigger('quickStart');
            }else if(monkeyUI.getLogin()){
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

    function initOptionInWindow(){
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

    this.disappearOptionsOutWindow = function(){
        $('.tab').addClass('disappear');
        $('.wrapper-out').removeClass('classic');
    }

    this.getLogin = function(){
        return this.login;
    }

    function drawLoading(contentConnection){
        var _html = '<div class="spinner">'+
            '<div class="bounce1"></div>'+
            '<div class="bounce2"></div>'+
            '<div class="bounce3"></div>'+
        '</div>';
        $(contentConnection).prepend(_html);
    }

    function drawHeaderUserSession(content){
        var _html = '<header id="session-header">'+
            '<div id="session-image">'+
                '<img src="">'+
            '</div>'+
            '<div id="session-description">'+
                '<span id="session-name"></span>'+
            '</div>'+
        '</header>';
        $(content).prepend(_html);
    }

    function drawContentConversation(content, screenType){
        var _html = '<div id="app-intro"><div></div></div>'+
            '<header id="conversation-selected-header">'+
                '<div id="conversation-selected-image">'+
                    '<img src="">'+
                '</div>'+
                '<div id="conversation-selected-description">'+
                    '<span id="conversation-selected-name"></span>'+
                    '<span id="conversation-selected-status"></span>'+
                '</div>';
        if(screenType == CLASSIC || screenType == SIDEBAR){
            _html += '<div class="content-options">'+
                        '<div id="w-min-in"></div>'+
                        '<div id="w-close"></div>'+
                    '</div>';
        }
        _html += '</header>'+
            '<div id="chat-timeline"></div>';
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
        $(this.contentConnection).removeClass('appear');
        $(this.contentConnection).addClass('disappear');
    }

    this.startLoading = function(){
        $(this.contentConnection).removeClass('disappear');
        $(this.contentConnection).addClass('appear');
    }

    this.loadDataScreen = function(user){
        this.user = user;
        detectFuntionality();

        // set contentApp
        $(this.contentApp).removeClass('disappear');

        // set user info
        $("#session-name").html(this.user.name);
        $('#session-image img').attr('src',this.user.urlAvatar);
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

        var _html = '<div id="chat-input">'+
            '<div id="divider-chat-input"></div>';
            if (input.isAttachButton) {
                _html += '<div class="button-input">'+
                            '<button id="button-attach" class="button-icon"></button>'+
                            '<input type="file" name="attach" id="attach-file" style="display:none" accept=".pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx, image/*">'+
                        '</div>';//+
                        //'<div class="' + monkeyUI.screen.data.mode + ' jFiler-input-dragDrop" style="width:'+dd_width+'; height:'+dd_height+';"><div class="jFiler-input-inner"><div class="jFiler-input-icon"><i class="icon-jfi-cloud-up-o"></i></div><div class="jFiler-input-text"><h3>Drop files here</h3></div></div></div>';
            }
            
            if (input.isAudioButton) {
                _html += '<div class="button-input">'+
                                    '<button id="button-cancel-audio" class="button-icon"></button>'+
                                '</div>';
            }
            
            _html += '<textarea id="message-text-input" class="textarea-input" placeholder="Write a secure message"></textarea>';
            
            if (input.isAudioButton) {
                _html += '<div id="record-area" class="disappear">'+
                                    '<div class="record-preview-area">'+
                                        '<div id="button-action-record">'+
                                            '<button id="button-start-record" class="blink"></button>'+
                                        '</div>'+
                                        '<div id="time-recorder"><span id="minutes">00</span><span>:</span><span id="seconds">00</span></div>'+
                                    '</div>'+
                                '</div>';
            }

            if (input.isSendButton) {
                _html += '<div class="button-input">'+
                                    '<button id="button-send-message" class="button-icon"></button>'+
                                '</div>';
            }
            
            if (input.isAudioButton) {
                _html += '<div class="button-input">'+
                                    '<button id="button-record-audio" class="button-icon"></button>'+
                                '</div>';
            } 

            if (input.isEphemeralButton) {
                _html += '<div class="button-input">'+
                                    '<button id="button-send-ephemeral" class="button-icon timer_icon"></button>'+
                                '</div>';
            }
            
        _html += '<div class="signature">Powered by <a class="signature-link" target="_blank" href="http://criptext.com/">Criptext</a></div></div>';
        $(content).append(_html);
        initInputFunctionality();
    }

    this.showChatInput = function(){
        $('#button-action-record button').hide();
        $('#button-action-record button').attr('onclick','');
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
    }

    function clearAudioRecordTimer() {
        totalSeconds = 0; //encera el timer
        clearInterval(refreshIntervalId);
        minutesLabel.innerHTML = '00';
        secondsLabel.innerHTML = '00';
    }

    function initInputFunctionality(){
        minutesLabel = document.getElementById("minutes");
        secondsLabel = document.getElementById("seconds");

        // mp3 converter
        ffmpegWorker = getFFMPEGWorker();

        inputEvent();
    }

    function inputEvent(){
        $('#message-text-input').keydown(function(event) {
            var charCode = (window.event) ? event.which : event.keyCode;

            if( charCode == 8 || charCode == 46 ){
                if($('#button-send-message').is(':visible') && $(this).val().trim().length <= 1  ){
                    $('#button-record-audio').parent().removeClass("disappear");
                    $('#button-send-message').parent().addClass("disappear");
                    $('#button-send-ephemeral').removeClass('enable_timer');
                }
            }else if(charCode == 13){
                if (event.shiftKey === true){
                    return true;
                }else{
                    var _messageText = $('#message-text-input').val().trim();
                    $(monkeyUI).trigger('textMessage', _messageText);
                    $('#message-text-input').val("");
                    monkeyUI.showChatInput();
                    return false;
                }
            }else{
                if(!$('#button-send-message').is(':visible')){
                    $('#button-record-audio').parent().addClass("disappear");
                    $('#button-send-message').parent().removeClass("disappear");
                    $('#button-send-ephemeral').addClass('enable_timer');
                    typeMessageToSend = 0;
                }
            } 
        });
        
        $('#button-send-message').click(function () {
            switch(typeMessageToSend){
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

        $('#button-cancel-audio').click(function(){
            monkeyUI.showChatInput();

            var audio = document.getElementById('audio_'+timestampPrev);
            if (audio != null)
                audio.pause();
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

    document.addEventListener("dragenter", function( event ) {
           // alert('ddd');
        console.log('over document')
        $(document).find('.chat-drop-zone').show();
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
        // $("#chat-input").addClass('chat-input-file');
        // $('#button-attach').parent().addClass("disappear");
        // $('#button-record-audio').parent().addClass("disappear");
        // $('#button-send-message').parent().removeClass("disappear");
        // $('#button-send-ephemeral').addClass('enable_timer');
    }

    function hideChatInputFile(){
        typeMessageToSend = -1;
        $("#chat-input").removeClass('chat-input-file');
        $('#button-attach').parent().removeClass("disappear");
        $('#button-record-audio').parent().removeClass("disappear");
        $('#button-send-message').parent().addClass("disappear");
        $('#button-send-ephemeral').removeClass('enable_timer');
    }

    function showChatInputRecord(){
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

    function disabledAudioButton(bool){
        $('#button-record-audio').disabled = bool;
        if(bool){
            $('#button-record-audio').parent().addClass("disabled");
        }else{
            $('#button-record-audio').parent().removeClass("disabled");
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
            $(this.contentConversationWindow).addClass('disabled');

            // set header conversation
            //var conversationPhoto = isConversationGroup(this.id) ? _conversationIdHandling : users[this.id].id;
            $('#conversation-selected-image img').attr('src',conversation.urlAvatar);
            var conversationName = conversation.name ? conversation.name : 'undefined';
            $('#conversation-selected-name').html(conversationName);
            //$('#conversation-selected-members').html('');

            // set conversation item
            if(this.isConversationList){
                $(this.contentConversationList+' li').removeClass('conversation-selected');
                $(this.contentConversationList+' li').addClass('conversation-unselected');
                $('#conversation-'+_conversationIdHandling).removeClass('conversation-unselected');
                $('#conversation-'+_conversationIdHandling).addClass('conversation-selected');
                // (badge)
                $('#conversation-'+_conversationIdHandling).find('.conversation-notification').remove();
                removeNotification(_conversationIdHandling);
            }

            // set chat timeline
            $('.chat-timeline-conversation').removeClass('appear');
            $('.chat-timeline-conversation').addClass('disappear');
            if ($('#chat-timeline-conversation-'+_conversationIdHandling).length > 0) {
                $('#chat-timeline-conversation-'+_conversationIdHandling).removeClass('disappear');
                $('#chat-timeline-conversation-'+_conversationIdHandling).addClass('appear');
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
            $(this.contentConversationWindow).removeClass('disabled');
        }else{
            // set chat timeline
            if ($('#chat-timeline-conversation-'+_conversationIdHandling).length <= 0) {
                drawConversationWindow(conversation.id, isHidden);
                if(this.isConversationList){
                    drawConversationItem(this.contentConversationList, conversation);
                }
            }
        }
    }

    function drawConversationWindow(conversationId, isHidden){
        var _class = isHidden ? 'disappear' : 'appear';
        $('#chat-timeline').append('<div class="chat-timeline-conversation '+_class+'" id="chat-timeline-conversation-'+conversationId+'"></div>');
    }

    function drawConversationItem(contentConversationList, conversation){

        var _li = '<li id="conversation-'+conversation.id+'" class="conversation-unselected" onclick="openConversation(\''+conversation.id+'\')">'+
                    '<div class="conversation-image">'+
                        '<img src="'+conversation.urlAvatar+'" onerror="imgError(this);">';
        var _conversationName = conversation.name ? conversation.name : 'undefined';
        _li +=      '</div>'+
                    '<div class="conversation-description"><div class="conversation-name"><span class="ellipsify">'+_conversationName+'</span></div><div class="conversation-state"><span class="ellipsify">Click to open conversation</span></div></div>'+
                '</li>';
        $(contentConversationList).append(_li);
    }

    this.updateDrawConversation = function(conversation){
        var _conversationLi = $('#conversation-'+conversation.id);
        _conversationLi.find('img').attr('src',conversation.urlAvatar);
        _conversationLi.find('.conversation-name span').html(conversation.name);
    }

    this.updateOnlineStatus = function(lastOpenApp, online){
        if (online == 0) {
            currentConversationOnlineState = defineTime(lastOpenApp);
            $('#conversation-selected-status').html('Last seen '+defineTime(lastOpenApp));
        }else{
            currentConversationOnlineState = 'Online';
            $('#conversation-selected-status').html('Online');
        }
    }

    /***********************************************/
    /************** STATE CONVERSATION *************/
    /***********************************************/

    function updateNotification(text, conversationId){
        var liConversation =  $("#conversation-"+conversationId);

        if(text.length >= 20){
            text = text.substr(0,20);
        }

        liConversation.find('.conversation-state span').html(text);
        setNotification(conversationId);

        if ($('#chat-timeline-conversation-'+conversationId).hasClass('appear')) {
            // counting notification existing badges 

            if (liConversation.find('.conversation-notification').length > 0) {
                var num = parseInt( liConversation.find('.conversation-notification').first().find('.notification-amount').html() );
                    num = num + 1;
                    liConversation.find('.conversation-notification').first().find('.notification-amount').html(num);
            }else{
                liConversation.prepend('<div class="conversation-notification"><div class="notification-amount">1</div></div>');
            }        
        }else{
            removeNotification(conversationId);
        }
    }

    function setNotification (conversationId) {
        var liConversation =  $('#conversation'+conversationId);
        liConversation.find('.conversation-description span').addClass('bold-text');
    }

    function removeNotification (conversationId) {
        var liConversation =  $("conversation-"+conversationId);
        liConversation.find('.conversation-description span').removeClass('bold-text');
    }

    /***********************************************/
    /****************** DRAW BUBBLES ***************/
    /***********************************************/

    function defineMessageStatus(status){
        switch(status){
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

    function baseBubble(message, isOutgoing, withName, status){
        var _bubble = '';
        var _classBubble = isOutgoing ? 'bubble-out' : 'bubble-in';
        var _classStatus = defineMessageStatus(status);

        _bubble = '<div class="message-line">'+
                    '<div id="'+message.id+'" class="bubble '+_classBubble+'">'+
                        '<div class="message-detail">';
        if(withName){
            var _senderName = message.senderName ? message.senderName : 'Unknown';
            var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
            _bubble += '<span class="message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
        }
        _bubble += '<span class="message-hour">'+defineTime(message.timestamp*1000)+'</span>';
        if(isOutgoing){
            _bubble += '<div class="message-status '+_classStatus+'">';
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

        $('#chat-timeline-conversation-'+_conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
        var _classTypeBubble = _isOutgoing ? 'bubble-text-out' : 'bubble-text-in';
        var _messagePoint = $('#'+message.id);
        _messagePoint.addClass('bubble-text');
        _messagePoint.addClass(_classTypeBubble);

        var _content = '<span class="message-text">'+_messageText+'</span>';
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

        $('#chat-timeline-conversation-'+_conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
        var _classTypeBubble = _isOutgoing ? 'bubble-image-out' : 'bubble-image-in';
        var _messagePoint = $('#'+message.id);
        _messagePoint.addClass('bubble-image');
        _messagePoint.addClass(_classTypeBubble);

        var _content = '<div class="content-image" onclick="monkeyUI.showViewer(\''+message.id+'\',\''+_fileName+'\')">'+
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
            _messagePoint.find('.content-audio-loading').remove();
            _messagePoint = $('#'+message.id);
        }else{
            $('#chat-timeline-conversation-'+_conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
            var _classTypeBubble = _isOutgoing ? 'bubble-audio-out' : 'bubble-audio-in';
            _messagePoint = $('#'+message.id);
            _messagePoint.addClass('bubble-audio');
            _messagePoint.addClass(_classTypeBubble);
        }

        if(this.audio.type == 'knob'){
            var _content = '<div class="content-audio disabled">'+
                                '<img id="playAudioBubbleImg'+message.id+'" style="display:block;" onclick="monkeyUI.playAudioBubble('+message.id+');" class="bubble-audio-button bubble-audio-button'+message.id+' playBubbleControl" src="../images/PlayBubble.png">'+
                                '<img id="pauseAudioBubbleImg'+message.id+'" onclick="monkeyUI.pauseAudioBubble('+message.id+');" class="bubble-audio-button bubble-audio-button'+message.id+'" src="../images/PauseBubble.png">'+
                                '<input id="play-player_'+message.id+'" class="knob second" data-width="100" data-displayPrevious=true value="0">'+
                                '<div class="bubble-audio-timer"><span id="minutesBubble'+message.id+'">00</span><span>:</span><span id="secondsBubble'+message.id+'">00</span></div>'+
                            '</div>'+
                            '<audio id="audio_'+message.id+'" preload="auto" style="display:none;" controls="" src="'+_dataSource+'"></audio>';
            _messagePoint.append(_content);

            createAudiohandlerBubble(message.id,Math.round(message.length));
            audiobuble = document.getElementById("audio_"+message.id);
            audiobuble.oncanplay = function() {
                createAudiohandlerBubble(message.id,Math.round(audiobuble.duration));
                setDurationTime(message.id);
                $('#'+message.id+' .content-audio').removeClass('disabled');
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

        $('#chat-timeline-conversation-'+_conversationIdHandling).append(baseBubble(message, _isOutgoing, isGroupChat, status));
        var _classTypeBubble = _isOutgoing ? 'bubble-file-out' : 'bubble-file-in';
        var _messagePoint = $('#'+message.id);
        _messagePoint.addClass('bubble-file');
        _messagePoint.addClass(_classTypeBubble);
        var _content = '<div class="content-file">'+
                            '<a class="file-icon-link" href="'+_dataSource+'" download="'+message.filename+'" >';

        if(message.ext == 'doc' || message.ext == 'docx'){
            _content += '<div class="file-icon-define icon-word"></div>';
        }else if(message.ext == 'pdf'){
            _content += '<div class="file-icon-define icon-pdf"></div>';
        }else if(message.ext == 'xls' || message.ext == 'xlsx'){
            _content += '<div class="file-icon-define xls-icon"></div>';
        }else{
            _content += '<div class="file-icon-define img-icon"></div>';
        }
        //_content += '<img class="icon-file-define" src="./images/xls-icon.png" alt="your image" />';
        //_content += '<img class="icon-file-define" src="./images/ppt-icon.png" alt="your image" />';
        _content += '</a>'+
                    '<div class="file-detail">'+
                        '<div class="file-name"><span class="ellipsify">'+message.filename+'</span></div>'+
                        '<div class="file-size"><span class="ellipsify">'+message.filesize+' bytes</span></div>'+
                    '</div>'+
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
                _bubble = '<div class="message-line">'+
                                    '<div id="'+message.id+'" class="bubble bubble-text bubble-text-in bubble-in">'+
                                        '<div class="message-detail">';
                if(conversationId.indexOf("G:") >= 0){
                    var _senderName = message.senderName ? message.senderName : 'Unknown';
                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
                }          
                            _bubble += '<span class="message-hour">'+defineTime(message.timestamp*1000)+'</span>'+
                                        '</div>'+
                                        '<span class="message-text">'+_messageText+'</span>'+
                                    '</div>'+
                                '</div>';             
            }else{
                var _duration = Math.round(message.length * 0.07);
                if(_duration < 15){
                    _duration = 15;
                }
                _bubble = '<div class="message-line">'+
                                    '<div id="'+message.id+'" class="bubble bubble-text bubble-text-in bubble-in bubble-private" onclick="showPrivateTextMessage(\''+message.id+'\',\''+message.senderId+'\',\''+_duration+'\')">'+
                                        '<div class="message-detail">';
                if(conversationId.indexOf("G:") >= 0){
                    var _senderName = message.senderName ? message.senderName : 'Unknown';
                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
                }
                            _bubble += '<div class="message-content-timer">'+
                                                '<i class="fa fa-clock-o"></i>'+
                                                '<span class="message-timer"> '+defineTimer(_duration)+'</span>'+
                                            '</div>'+
                                        '</div>'+
                                        '<span class="message-text">Click to read</span>'+
                                        '<div class="message-code">'+message.encryptedText+'</div>'+
                                    '</div>'+
                                '</div>';              
            }
        } else if (_isOutgoing == 1){ // outgoing
            if (message.eph == 0){
                var _status;
                switch(status){
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

                _bubble='<div class="message-line">'+
                            '<div id="'+message.id+'" class="bubble bubble-text bubble-text-out bubble-out'+(status == 0 ? 'sending' : '')+'">'+
                                '<div class="message-detail">'+
                                    '<span class="message-hour">'+defineTime(message.timestamp)+'</span>'+
                                    '<div class="message-status '+_status+'">';
                                    if(status != 0){
                                        _bubble += '<i class="fa fa-check"></i>';
                                    }
                                _bubble += '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                '<span class="message-text">'+_messageText+'</span>'+
                            '</div>'+
                        '</div>';
            }else{
                _bubble='<div class="message-line">'+
                                '<div id="'+message.id+'" class="bubble bubble-text bubble-text-out bubble-out'+(status == 0 ? 'sending' : '')+'">'+
                                    '<div class="message-detail">'+
                                        '<span class="message-hour">'+defineTime(message.timestamp)+'</span>'+
                                        '<div class="message-status '+_status+'">';
                                        if(status != 0){
                                            _bubble += '<i class="fa fa-check"></i>';
                                        }
                                    _bubble += '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                    '<span class="message-text">Private Message</span>'+
                                '</div>'+
                            '</div>';
            }
        }
        $('#chat-timeline-conversation-'+_conversationIdHandling).append(_bubble);
        
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
                _bubble = '<div class="message-line">'+
                                '<div id="'+message.id+'" class="bubble-image-in bubble-in">'+
                                    '<div class="message-detail">';
                if(conversationId.indexOf("G:") >= 0){
                    var _senderName = message.senderName ? message.senderName : 'Unknown';
                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
                }
                        _bubble += '<span class="message-hour">'+defineTime(message.timestamp*1000)+'</span>'+
                                    '</div>'+
                                    '<div class="content-image" onclick="monkeyUI.showViewer(\''+message.id+'\',\''+_fileName+'\')">'+
                                      '<img src='+_dataSource+'>'+
                                    '</div>'+
                                '</div>'+
                            '</div>';
            }else{
                var _duration = 15;

                _bubble = '<div class="message-line">'+
                                    '<div id="'+message.id+'" class="bubble-image-private-in bubble-in bubble-private" onclick="showPrivateViewer(\''+message.id+'\',\''+message.senderId+'\',\''+_duration+'\',\''+message.cmpr+'\',\''+message.encr+'\')">'+
                                        '<div class="message-detail">';
                if(conversationId.indexOf("G\\:") >= 0){
                    var _conversation = conversations[message.recipientId];
                    var _classUnknown = users[message.senderId].id == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="message-user-name '+_classUnknown+'" style="color: #'+colorUsers[_conversation.members.indexOf(message.senderId)]+'">'+users[message.senderId].name+'</span>';
                }
                                    _bubble += '<div class="message-content-timer">'+
                                                '<i class="fa fa-clock-o"></i>'+
                                                '<span class="message-timer"> '+defineTimer(_duration)+'</span>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="message-icon-define icon-image"></div>'+
                                        '<span class="message-text">Click to view</span>'+
                                        '<div class="message-code">'+message.encryptedText+'</div>'+
                                    '</div>'+
                                '</div>';
            }
        } else if (_isOutgoing == 1){ // outgoing
            if(message.eph == 0){
                _bubble = '<div class="message-line">'+
                                    '<div id="'+message.id+'" class="bubble-image-out bubble-out">'+
                                        '<div class="message-detail">'+
                                            '<span class="message-hour">'+defineTime(message.timestamp)+'</span>'+
                                            '<div class="message-status status-load">'+
                                                '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                            '</div>'+
                                        '</div>'+
                                        '<div class="button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                        '<div class="content-image" onclick="monkeyUI.showViewer(\''+message.id+'\',\''+_fileName+'\')">'+
                                            '<img src="'+_dataSource+'">'+
                                        '</div>'+
                                    '</div>'+
                                '</div>';
            }else{
                _bubble='<div class="message-line">'+
                                '<div id="'+message.id+'" class="bubble-text-out bubble-out sending">'+
                                    '<div class="message-detail">'+
                                        '<span class="message-hour">'+defineTime(message.timestamp)+'</span>'+
                                        '<div class="message-status status-load">'+
                                            '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                    '<span class="message-text">Private Image</span>'+
                                '</div>'+
                            '</div>';
            }
        }
        $('#chat-timeline-conversation-'+_conversationIdHandling).append(_bubble);
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
                
                _bubble = '<div class="message-line">'+
                                '<div id="'+message.id+'" class="bubble-audio-in bubble-in">'+
                                    '<div class="message-detail">';
                if(conversationId.indexOf("G:") >= 0){
                    var _senderName = message.senderName ? message.senderName : 'Unknown';
                    var _classUnknown = message.senderName == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="message-user-name '+_classUnknown+'" style="color: #'+message.senderColor+'">'+_senderName+'</span>';
                }
                        _bubble += '<span class="message-hour">'+defineTime(message.timestamp*1000)+'</span>'+
                                    '</div>'+
                                    '<div class="content-audio">'+
                                        '<img id="playAudioBubbleImg'+message.id+'" style="display:block;" onclick="monkeyUI.playAudioBubble('+message.id+');" class="bubble-audio-button bubble-audio-button'+message.id+' playBubbleControl" src="../images/PlayBubble.png">'+
                                        '<img id="pauseAudioBubbleImg'+message.id+'" onclick="monkeyUI.pauseAudioBubble('+message.id+');" class="bubble-audio-button bubble-audio-button'+message.id+'" src="../images/PauseBubble.png">'+
                                        '<input id="play-player_'+message.id+'" class="knob second" data-width="100" data-displayPrevious=true value="0">'+
                                        '<div class="bubble-audio-timer"><span id="minutesBubble'+message.id+'">'+("0" + parseInt(message.length/60)).slice(-2)+'</span><span>:</span><span id="secondsBubble'+message.id+'">'+("0" + message.length%60).slice(-2)+'</span></div>'+
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

                _bubble = '<div class="message-line">'+
                                '<div id="'+message.id+'" class="bubble-audio-private-in bubble-in bubble-private" onclick="showPrivateAudioMessage(\''+message.id+'\',\''+message.senderId+'\',\''+_duration+'\',\''+message.cmpr+'\',\''+message.encr+'\')">'+
                                    '<div class="message-detail">';
                if(conversationId.indexOf("G\\:") >= 0){
                    var _conversation = conversations[message.recipientId];
                    var _classUnknown = users[message.senderId].id == undefined ? 'user-unknown' : '';
                    _bubble += '<span class="message-user-name '+_classUnknown+'" style="color: #'+colorUsers[_conversation.members.indexOf(message.senderId)]+'">'+users[message.senderId].name+'</span>';
                }
                        _bubble += '<div class="message-content-timer">'+
                                            '<i class="fa fa-clock-o"></i>'+
                                            '<span class="message-timer"> '+defineTimer(_duration)+'</span>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="message-icon-define icon-audio"></div>'+
                                    '<span class="message-text">Click to listen</span>'+
                                    '<div class="message-code">'+message.encryptedText+'</div>'+
                                '</div>'+
                            '</div>';
            }
        }else if (_isOutgoing == 1){ // outgoing
            if(message.eph == 0){
                if(messageOldId == undefined){
                    _bubble += '<div class="message-line">';
                }
                    _bubble +=  '<div id="'+message.id+'" class="bubble-audio-out bubble-out">'+
                                    '<div class="message-detail">'+
                                        '<span class="message-hour">'+defineTime(message.timestamp)+'</span>'+
                                        '<div class="message-status status-load">'+
                                            '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                        '</div>'+
                                    '</div>'+
                                    '<div class="button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                    '<div class="content-audio">'+
                                        '<img id="playAudioBubbleImg'+message.id+'" style="display:block;" onclick="monkeyUI.playAudioBubble('+message.id+');" class="bubble-audio-button bubble-audio-button'+message.id+' playBubbleControl" src="../images/PlayBubble.png">'+
                                        '<img id="pauseAudioBubbleImg'+message.id+'" onclick="monkeyUI.pauseAudioBubble('+message.id+');" class="bubble-audio-button bubble-audio-button'+message.id+'" src="../images/PauseBubble.png">'+
                                        '<input id="play-player_'+message.id+'" class="knob second" data-width="100" data-displayPrevious=true value="0">'+
                                        '<div class="bubble-audio-timer"><span id="minutesBubble'+message.id+'">00</span><span>:</span><span id="secondsBubble'+message.id+'">00</span></div>'+
                                    '</div>'+
                                    '<audio id="audio_'+message.id+'" preload="auto" style="display:none;" controls="" src="'+_dataSource+'"></audio>'+
                                '</div>';
                if(messageOldId == undefined){
                    _bubble += '</div>';
                }
            }else{
                _bubble='<div class="message-line">'+
                            '<div id="'+message.id+'" class="bubble-text-out bubble-out sending">'+
                                '<div class="message-detail">'+
                                    '<span class="message-hour">'+defineTime(message.timestamp)+'</span>'+
                                    '<div class="message-status status-load">'+
                                        '<div class="message-time" style="display: none;">'+message.timestamp+'</div>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="button-message-unsend" onclick="unsendMessage(\''+message.id+'\',\''+conversationId+'\')">x</div>'+
                                '<span class="message-text">Private audio</span>'+
                            '</div>'+
                        '</div>';
            }
        }

        if(messageOldId != undefined){
            $('#'+messageOldId).parent().html(_bubble);
        }else{
            $('#chat-timeline-conversation-'+_conversationIdHandling).append(_bubble);
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
                $('#'+messageId+' .content-audio').removeClass('disabled');
            };
        }
    }

    function drawAudioMessageBubbleTemporal(dataSource, message, duration){
        $('#chat-timeline').find('.appear').append(baseBubble(message, 1, false, 0));
        var _classTypeBubble = 'bubble-audio-out';
        var _messagePoint = $('#'+message.id);
        _messagePoint.addClass('bubble-audio');
        _messagePoint.addClass(_classTypeBubble);

        var _content = '<div class="content-audio-loading">'+
                            '<div class="double-bounce1"></div>'+
                            '<div class="double-bounce2"></div>'+
                        '</div>';
        _messagePoint.append(_content);
        scrollToDown();
    }

    this.getMessageUnknown = function(){
        return $('.user-unknown');
    }

    this.updateDataMessageBubble = function(messageId, data){
        var messagePoint = $('#'+messageId);
        if(messagePoint.find('.content-image').length > 0){
            messagePoint.find('img').attr('src',data);
        }else if(messagePoint.find('audio').length > 0){
            messagePoint.find('audio').attr('src',data);
        }else if(messagePoint.find('.content-file').length > 0){
            messagePoint.find('.file-icon-link').attr('href',data);
        }
    }

    /***********************************************/
    /***************** STATE BUBBLE ****************/
    /***********************************************/

    this.updateStatusSentMessageBubble = function(messageOldId, messageNewId, status) {

        var messagePoint = $('#'+messageOldId);

        if(messageOldId != messageNewId && messagePoint.length > 0){
            messagePoint.attr('id',messageNewId);
            // var _contentOnClick = messagePoint.find('.button-message-unsend').attr('onclick');
            // var _conversationId = _contentOnClick.slice(29,_contentOnClick.length - 2);
            // messagePoint.find('.button-message-unsend').attr({
            //   onclick: "unsendMessage('"+messageNewId+"','"+_conversationId+"')"
            // });
        }
        messagePoint = $('#'+messageNewId);
        
        if (messagePoint.find('.content-image').length > 0) { // image message
            var _onClickAttribute = messagePoint.find('.content-image').attr('onclick');
            _onClickAttribute = _onClickAttribute+"";
            var params = _onClickAttribute.split(',');
            var _fileName = params[1].substr(1,params[1].length-3);
            messagePoint.find('.content-image').attr({
              onclick: "monkeyUI.showViewer('"+messageNewId+"','"+_fileName+"')"
            });
        }
        
        messagePoint.find('.message-status').removeClass('status-load');
        messagePoint.find('.message-status').removeClass('status-sent');

        if (status == 52) {
            messagePoint.find('.message-status').addClass('status-read');
        }else if (status == 50 || status == 51){
            messagePoint.find('.message-status').addClass('status-sent');
        }
        
        if(messagePoint.find('.fa').length <= 0){
            messagePoint.find('.message-status').prepend('<i class="fa fa-check"></i>');
        }   
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
        $('.bubble-audio-button'+timestamp).hide();
        $('#pauseAudioBubbleImg'+timestamp).css('display', 'block');
        minutesBubbleLabel = document.getElementById("minutesBubble"+timestamp);
        secondsBubbleLabel = document.getElementById("secondsBubble"+timestamp);
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
        $('.bubble-audio-button'+timestamp).hide();
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
                    $('.bubble-audio-button').hide();
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
        minutesBubbleLabel = document.getElementById("minutesBubble"+timestamp);
        secondsBubbleLabel = document.getElementById("secondsBubble"+timestamp);
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
        var _file = _messagePoint.find('.content-image img').attr('src');

        var _html = '<div class="viewer-content">'+
            '<div class="viewer-toolbar">'+
                '<button id="button-exit" onclick="monkeyUI.exitViewer()"> X </button>'+
                '<a href="'+_file+'" download="'+fileName+'" >'+
                    '<button class="button-download" title="Download">Download</button>'+
                '</a>'+
                // '<a href="'+_file+'" >'+
                    '<button class="button-download" title="Download" onclick="monkeyUI.printFile()" >Print</button>'+
                // '</a>'+
            '</div>'+
            '<div id="file_viewer_image" class="viewer-image">'+
                '<img  src="'+_file+'">'+
            '</div>'+
            '<div class="brand-app"></div>'+
        '</div>';

        $('.wrapper-out').append(_html);
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
        $('.viewer-content').remove();
    }

    function generateDataFile() {
        FileAPI.readAsDataURL(fileCaptured.file, function (evt){
            if( evt.type == 'load' ){
                fileCaptured.src = evt.result;
                $('#button-send-message').click();
            }
        });
    }

    function showPreviewImage() { // Optional to use: replace with generateDataFile()
        var image_data = '';
        FileAPI.readAsDataURL(fileCaptured.file, function (evt){
            if( evt.type == 'load' ){
                fileCaptured.src = evt.result;
                var html = '<div id="preview-image">'+
                      '<div class="preview-head">'+
                        '<div class="preview-title">Preview</div> '+
                        '<div id="close-preview-image" class="preview-close" onclick="monkeyUI.closeImagePreview(this)">X</div>'+
                      '</div>'+
                      '<div class="preview-container">'+
                        '<img id="image_preview" src="'+fileCaptured.src+'">'+
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
        $('#chat-timeline').animate({ scrollTop:100000000 }, 400); 
    }

    /***********************************************/
    /***************** RECORD AUDIO ****************/
    /***********************************************/

    // starts the library to record audio
    function startRecordAudio(){
        if (mediaRecorder == null) {
            $('#button-send-ephemeral').addClass('enable_timer');
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

window.monkeyUI = monkeyUI;

