require('./src/monkey.js');
require('./bower_components/monkeyui/dist/monkeyUI.js');

var MONKEY_DEBUG_MODE = false;

// Variable to store contacts
var users = {}; // list all users (know and unknown) || users = {monkeyId: User} || monkeyId = String , User = Object

// Variable to load list conversations
var conversations = {}; // list conversations of criptext mobile || conversations = { conversation_id:info } || info = { members: list_members, name:string} || list_members = Array[session_id] || session_id = string
var messages = {};

// Variable to chat view
var currentConversationId = null; // conversation id of the current chat

// Variable my account
var myUser = {};

var callCenterUser;

var monkeyCHAT = new function(){

    this.init = init;
    this.startSession = startSession;
    this.appID;
    this.appKey;
    this.conversationId;

    function init(appId, appKey, conversationId, view, form){
        this.appId = appId;
        this.appKey = appKey;
        this.conversationId = conversationId;
        monkeyUI.setChat(view);
        $( document ).ready(function() {
            monkeyUI.drawScene();
            if(monkeyUI.form && form != null && form != undefined) {
                monkeyUI.addLoginForm(form);
            }
        });
    }

    function startSession(userObj){
        monkeyUI.disappearOptionsOutWindow();
        monkeyUI.startLoading();
        if(userObj != null){
            myUser = new MUIUser(userObj.id, userObj.monkey_id, userObj.name, userObj.privacy, userObj.urlAvatar);
        }

        monkey.init(monkeyCHAT.appId, monkeyCHAT.appKey, userObj, false, MONKEY_DEBUG_MODE);
    }

    /***********************************************/
    /***************** MONKEY SDK ******************/
    /***********************************************/

    $(monkey).on( "onConnect", function( event, eObject ) {
        monkeyUI.stopLoading();
        monkeyUI.login = true;
        if(isEmpty(myUser)){
            myUser = new MUIUser(null, eObject.monkey_id, 'Me', 0, '../images/userdefault.png');
        }else if(myUser.monkeyId != eObject.monkey_id){
            myUser.monkeyId = eObject.monkey_id;
        }

        if (isEmpty(users) || isEmpty(conversations)) {
            callCenterUser = new MUIUser(null, monkeyCHAT.conversationId, 'Call Center', 0, '../images/userdefault.png');
            var conversation = new MUIConversation(callCenterUser.monkeyId, callCenterUser.name, callCenterUser.urlAvatar);
            users[callCenterUser.monkeyId] = callCenterUser;
            conversations[callCenterUser.monkeyId] = conversation;
        }
        
        monkeyUI.loadDataScreen(myUser);
        openConversation(callCenterUser.monkeyId);
    });

    // --------------- ON DISCONNECT ----------------- //
    $(monkey).on( "onDisconnect", function( event, eObject ) {
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
    $(monkey).on( "onMessage", function(event, mokMessage){
        console.log(mokMessage);
        if (mokMessage.senderId == callCenterUser.monkeyId && mokMessage.recipientId == myUser.monkeyId) {
            var _message = new MUIMessage(mokMessage);
            messages[_message.id] = _message; // store message
            defineMessage(_message, mokMessage);
        }
    });

    $(monkey).on( "onAcknowledge", function( event, mokMessage ){
        var _acknowledge = mokMessage;
        console.log(mokMessage);
        // ack arrived
        var _typeAck = _acknowledge.protocolType;
        console.log('type ack: '+_typeAck);
        var _conversationId = _acknowledge.senderId;
        switch (_typeAck){
            case 1:{ // text
                console.log('text message received by the user');
                
                var old_id = _acknowledge.oldId;
                var new_id = _acknowledge.id;
                var status = _acknowledge.props.status;
                monkeyUI.updateStatusSentMessageBubble(old_id,new_id,status);
            }
            break;
            case 2:{ // media
                console.log('file message received by the user');

                var old_id = _acknowledge.oldId;
                var new_id = _acknowledge.id;
                var status = _acknowledge.props.status;
                monkeyUI.updateStatusSentMessageBubble(old_id,new_id,status);
            }
            break;
            case 203:{ // open conversation
                var _lastOpenMe = Number(_acknowledge.props.last_open_me)*1000;
                var _lastOpenApp = Number(_acknowledge.props.last_seen)*1000;
                var _online = Number(_acknowledge.props.online);
                var _conversation = conversations[_acknowledge.senderId];
                _conversation.setLastOpenMe(_lastOpenMe);
                // updateMessageStatusReadByTime(_conversationId,_lastOpenMe);
                monkeyUI.updateOnlineStatus(_lastOpenApp,_online);
            }
            break;
        }   
    });
    
    /***********************************************/
    /****************** MONKEY UI ******************/
    /***********************************************/

    $(monkeyUI).on('textMessage', function(event, text){
        if(text != undefined){
            prepareTextMessage(text, false);
        }
    });

    $(monkeyUI).on('imageMessage', function(event, file){
        if(file != undefined){
            prepareImageToSend(file, false);
        }
    });

    $(monkeyUI).on('audioMessage', function(event, audio, messageOldId){
        if(audio != undefined){
            prepareAudioMessage(audio, false);
        }
    });

    $(monkeyUI).on('fileMessage', function(event, file){
        if(file != undefined){
            prepareFileToSend(file, false);
        }
    });

    $(monkeyUI).on('quickStart', function(event, file){
        startSession(null);
    });

    /***********************************************/
    /***************** CONVERSATIONS ***************/
    /***********************************************/

    function openConversation(conversationId){
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

    function defineMessage(message, mokMessage){

        var _conversationId = message.recipientId == myUser.monkeyId ? message.senderId : message.recipientId;
        var _conversation = conversations[_conversationId];
        _conversation.lastMessage = message;
        
        var _isOutgoing = message.senderId == myUser.monkeyId ? 1 : 0;
        var _status = 0;
        if(_isOutgoing == 1){
            var _lastOpenMe = conversations[_conversationId].lastOpenMe;
            if(_lastOpenMe > message.timestamp){
                _status = 52;
            }else{
                _status = 51;
            }
        }

        switch(message.protocolType){
            case 1: // Text
                monkeyUI.drawTextMessageBubble(message, _conversationId, false, _status);
                break;

            case 2: // File
                if (message.typeFile == 1) { //audio type
                    monkeyUI.drawAudioMessageBubble(message, _conversationId, false, _status);
                    if(message.dataSource == undefined){

                        monkey.downloadFile(mokMessage,function(err,data){
                            if(err){
                                console.log(err);
                            }else{
                                var _src = 'data:audio/mpeg;base64,'+data;
                                monkeyUI.updateDataMessageBubble(message.id, _src);
                            }
                        });
                    }
                }else if(message.typeFile == 3){ //file type
                    monkeyUI.drawImageMessageBubble(message, _conversationId, false, _status);
                    if(message.dataSource == undefined){
                        monkey.downloadFile(mokMessage,function(err, data){
                            if(err){
                                console.log(err);
                            }else{
                                var _src = 'data:'+mokMessage.props.mime_type+';base64,'+data;
                                monkeyUI.updateDataMessageBubble(message.id, _src);
                            }
                        });
                    }
                }else if(message.typeFile == 4){ //file type
                    console.log('file received');
                    monkeyUI.drawFileMessageBubble(message, _conversationId, false, _status);
                    if(message.dataSource == undefined){
                        monkey.downloadFile(mokMessage,function(err, data){
                            if(err){
                                console.log(err);
                            }else{
                                var _src = 'data:'+mokMessage.props.mime_type+';base64,'+data;
                                monkeyUI.updateDataMessageBubble(mokMessage.id,_src);
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

    function prepareTextMessage (messageText, ephemeral) {
        if(messageText == null || messageText == ""){
            return;
        }
        var _eph = ephemeral ? 1 : 0;
        var _length = messageText.length;
        var _mokMessage = monkey.sendEncryptedMessage(messageText, currentConversationId,{length:_length, eph:_eph });

        //messageText = findLinks(messageText);
        var _message = new MUIMessage(_mokMessage);

        monkeyUI.drawTextMessageBubble(_message, currentConversationId, false, 51);
    }

    /************ TO SEND AUDIO MESSAGE ************/

    function prepareAudioMessage(audio, ephemeral) {

        var _eph = ephemeral ? 1 : 0;
        var _mokMessage = monkey.sendEncryptedFile(audio.src, currentConversationId, 'audio_.mp3', audio.type, audio.monkeyFileType, true, {eph:_eph, length:audio.duration}, null, function(err, message){
            if(err){
                console.log(err);
            }else{
                console.log(message);
                monkeyUI.updateStatusSentMessageBubble(message.oldId, message.id, 51);
            }
        });

        var _message = new MUIMessage(_mokMessage);
        _message.setDataSource(audio.src);
        var _status = 0;

        monkeyUI.drawAudioMessageBubble(_message, currentConversationId, false, _status, audio.oldId);
        monkeyUI.showChatInput();
    }

    /************* TO SEND IMAGE MESSAGE ************/

    function prepareImageToSend (file, ephemeral) {
        
        var data = file.src.split(',');
        var onlyDataURL = data[1];
        var _eph = ephemeral ? 1 : 0;
        var params = {
            eph: _eph
        };
        var _mokMessage = monkey.sendEncryptedFile(file.src, currentConversationId, file.file.name, file.file.type, file.monkeyFileType, true, params, null, function(err, message){
            if(err){
                console.log(err);
            }else{
                console.log(message);
                monkeyUI.updateStatusSentMessageBubble(message.oldId, message.id, 51);
            }
        });

        var _message = new MUIMessage(_mokMessage);
        _message.setDataSource(file.src);
        var _status = 0;
        
        monkeyUI.drawImageMessageBubble(_message, currentConversationId, false,_status);
    }

    /************* TO SEND FILE MESSAGE ************/

    function prepareFileToSend (file, ephemeral) {
        
        var data = file.src.split(',');
        var onlyDataURL = data[1];
        var _eph = ephemeral ? 1 : 0;
        var params = {
            eph: _eph
        };
        var _mokMessage = monkey.sendEncryptedFile(file.src, currentConversationId, file.file.name, file.file.type, file.monkeyFileType, true, params, null, function(err, message){
            if(err){
                console.log(err);
            }else{
                console.log(message);
                monkeyUI.updateStatusSentMessageBubble(message.oldId, message.id, 51);
            }
        });

        var _message = new MUIMessage(_mokMessage);
        _message.setDataSource(file.src);
        var _status = 0;
        
        monkeyUI.drawFileMessageBubble(_message, currentConversationId, false,_status);
    }

    /***********************************************/
    /********************* UTIL ********************/
    /***********************************************/

    function isEmpty(object) {
      for(var key in object) {
        if(object.hasOwnProperty(key)){
          return false;
        }
      }
      return true;
    }
};

window.monkeyCHAT = monkeyCHAT;