require('./src/monkey.js');
require('./monkeyUI.js');

var MONKEY_DEBUG_MODE = false;

// Variable to store
var users = {};
var conversations = {}; 
var messages = {};

// Variable my account
var myUser = {};
var callCenterUser;
var currentConversationId = null; // conversation id of the current chat

// Variable to group chat
var colorUsers = ["6f067b","00a49e","b3007c","b4d800","e20068","00b2eb","ec870e","84b0b9","3a6a74","bda700","826aa9","af402a","733610","020dd8","7e6565","cd7967","fd78a7","009f62","336633","e99c7a","000000"];

var monkeyChat = new function(){

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
	        monkeyUI.form = (form != null && form != undefined);
            monkeyUI.drawScene();
            if(form != null && form != undefined) {
	            //monkeyUI.form = true;
                monkeyUI.addLoginForm(form);
            }
        });
    }

    function startSession(userObj){
        monkeyUI.disappearOptionsOutWindow();
        monkeyUI.startLoading();
        if(userObj != null){
            myUser = new MUIUser(userObj.id, userObj.monkey_id, 'Support: '+userObj.name, userObj.privacy, userObj.urlAvatar);
        }

        monkey.init(monkeyChat.appId, monkeyChat.appKey, userObj, false, MONKEY_DEBUG_MODE);
    }

    /***********************************************/
    /***************** MONKEY SDK ******************/
    /***********************************************/

    $(monkey).on( "onConnect", function( event, eObject ) {
        monkeyUI.stopLoading();
        monkeyUI.login = true;
        if(isEmpty(myUser)){
            myUser = new MUIUser(null, eObject.monkey_id, 'Me', 0, 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png');
        }else if(myUser.monkeyId != eObject.monkey_id){
            myUser.monkeyId = eObject.monkey_id;
        }

        if ((isEmpty(users) || isEmpty(conversations)) && isConversationGroup(monkeyChat.conversationId)) {
	        console.log(monkeyChat.conversationId);
	        monkey.getInfoById(monkeyChat.conversationId, function(error, data){
		        if(data != undefined){
			        console.log(data);
			        var _members = data.members;
			        var _info = {avatar: '', name: myUser.name}
			        monkey.createGroup(_members, _info, null, null, function(error, data){
				        if(data != undefined){
				        	console.log(data);
				        	
				        	for(var _userId in data.members_info) {
					        	console.log(_userId);
						        var _tmpUser = new MUIUser(null, _userId, data.members_info[_userId].name, 0, 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png');
						        users[_userId] = _tmpUser;
						    }
				        	
				        	var _tmpConversation = new MUIConversation(data.group_id, data.group_info.name, 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png', data.members);
				        	conversations[data.group_id] = _tmpConversation;
				        	monkeyUI.loadDataScreen(myUser);
							openConversation(data.group_id);
				        	
				        }else{
					        console.log(error);
				        }
			        });
		        }else{
			        console.log(error);
		        }
	        });
        }else if((isEmpty(users) || isEmpty(conversations)) && !isConversationGroup(monkeyChat.conversationId)){
	        callCenterUser = new MUIUser(null, monkeyChat.conversationId, 'Call Center', 0, 'http://cdn.criptext.com/MonkeyUI/images/userdefault.png');
            var conversation = new MUIConversation(callCenterUser.monkeyId, callCenterUser.name, callCenterUser.urlAvatar);
            users[callCenterUser.monkeyId] = callCenterUser;
            conversations[callCenterUser.monkeyId] = conversation;
            
            monkeyUI.loadDataScreen(myUser);
			openConversation(callCenterUser.monkeyId);
        }
        
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
        if ( (callCenterUser == undefined) && (mokMessage.recipientId == currentConversationId) ){
	        var _message = new MUIMessage(mokMessage);
	        messages[_message.id] = _message; // store message
	        defineMessage(_message, mokMessage);
        }else if(mokMessage.senderId == currentConversationId && mokMessage.recipientId == myUser.monkeyId) {
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
    $(monkey).on( "onNotification", function( event, mokMessage ){
        console.log(mokMessage)
        var _notification = mokMessage;
        // notification arrived
        var _notType = _notification.protocolCommand;
        var _conversationId = _notification.senderId;
        switch(_notType){
            case 200:{ // message
                var _msgType = _notification.protocolType;
                switch(_msgType){
                    case 3:{ // Temporal Notification
                        var _typeTmpNotif = _notification.params.type;
                        if (_typeTmpNotif == 20 || _typeTmpNotif == 21) { // typing state
                            monkeyUI.updateTypingState(_conversationId,_typeTmpNotif);
                        }
                    }  
                    break;
                    default:
                        break;
                }
            }
            break;
            case 203:{ // open arrived
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
    $(monkey).on( "onAcknowledge", function( event, mokMessage ){
        console.log(mokMessage);
        var _acknowledge = mokMessage;
        // ack arrived
        var _ackType = _acknowledge.protocolType;
        var _conversationId = _acknowledge.senderId;
        switch (_ackType){
            case 1:{ // text
                console.log('text message received by the user');
                
                var old_id = _acknowledge.oldId;
                var new_id = _acknowledge.id;
                var status = _acknowledge.props.status;
                monkeyUI.updateStatusMessageBubble(old_id,new_id,status);
            }
			break;
            case 2:{ // media
                console.log('file message received by the user');

                var old_id = _acknowledge.oldId;
                var new_id = _acknowledge.id;
                var status = _acknowledge.props.status;
                monkeyUI.updateStatusMessageBubble(old_id,new_id,status);
            }
            break;
            case 203:{ // open conversation
	            console.log('open conversation received by the user');
	            
                var _lastOpenMe = Number(_acknowledge.props.last_open_me)*1000;
                var _lastOpenApp = Number(_acknowledge.props.last_seen)*1000;
                var _online = Number(_acknowledge.props.online);
                var _conversation = conversations[_conversationId];
                _conversation.setLastOpenMe(_lastOpenMe);
                //monkeyUI.updateStatusMessageBubbleByTime(_conversationId,_lastOpenMe);
                monkeyUI.updateOnlineStatus(_lastOpenApp,_online);
            }
            break;
            default:
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
        
        if(isConversationGroup(_conversationId)){
	        var _user = users[message.senderId];
	        message.setSenderName(_user.name);
	        message.setSenderColor(_conversation.members != undefined ? colorUsers[_conversation.members.indexOf(message.senderId)] : colorUsers[0]);
        }
        
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
                monkeyUI.drawTextMessageBubble(message, _conversationId, isConversationGroup(_conversationId), _status);
                break;

            case 2: // File
                if (message.typeFile == 1) { //audio type
                    monkeyUI.drawAudioMessageBubble(message, _conversationId, isConversationGroup(_conversationId), _status);
                    if(message.dataSource == undefined){
                        monkey.downloadFile(mokMessage,function(err,data){
                            if(err){
                                console.log(err);
                            }else{
                                var _src = 'data:audio/mpeg;base64,'+data;
                                monkeyUI.updateDataMessageBubble(mokMessage.id, _src);
                            }
                        });
                    }
                }else if(message.typeFile == 3){ //image type
                    monkeyUI.drawImageMessageBubble(message, _conversationId, isConversationGroup(_conversationId), _status);
                    if(message.dataSource == undefined){
                        monkey.downloadFile(mokMessage,function(err, data){
                            if(err){
                                console.log(err);
                            }else{
                                var _src = 'data:'+mokMessage.props.mime_type+';base64,'+data;
                                monkeyUI.updateDataMessageBubble(mokMessage.id, _src);
                            }
                        });
                    }
                }else if(message.typeFile == 4){ //file type
                    console.log('file received');
                    monkeyUI.drawFileMessageBubble(message, _conversationId, isConversationGroup(_conversationId), _status);
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
        var _params = {
            eph: _eph,
            length:messageText.length
        };
        var _mokMessage = monkey.sendEncryptedMessage(messageText, currentConversationId, _params);
        var _message = new MUIMessage(_mokMessage);

        monkeyUI.drawTextMessageBubble(_message, currentConversationId, isConversationGroup(currentConversationId), 51);
    }

    /************ TO SEND AUDIO MESSAGE ************/

    function prepareAudioMessage(audio, ephemeral) {
        var _eph = ephemeral ? 1 : 0;
        var _params = {
            eph: _eph,
            length: audio.duration
        };
        var _mokMessage = monkey.sendEncryptedFile(audio.src, currentConversationId, 'audio_.mp3', audio.type, audio.monkeyFileType, true, _params, null, function(err, message){
            if(err){
                console.log(err);
            }else{
                console.log(message);
                monkeyUI.updateStatusMessageBubble(message.oldId, message.id, 51);
            }
        });

        var _message = new MUIMessage(_mokMessage);
        _message.setDataSource(audio.src);
        var _status = 0;

        monkeyUI.drawAudioMessageBubble(_message, currentConversationId, isConversationGroup(currentConversationId), _status, audio.oldId);
        monkeyUI.showChatInput();
    }

    /************* TO SEND IMAGE MESSAGE ************/

    function prepareImageToSend (file, ephemeral) {
        var _eph = ephemeral ? 1 : 0;
        var _params = {
            eph: _eph
        };
        var _mokMessage = monkey.sendEncryptedFile(file.src, currentConversationId, file.file.name, file.file.type, file.monkeyFileType, true, _params, null, function(err, message){
            if(err){
                console.log(err);
            }else{
                console.log(message);
                monkeyUI.updateStatusMessageBubble(message.oldId, message.id, 51);
            }
        });

        var _message = new MUIMessage(_mokMessage);
        _message.setDataSource(file.src);
        var _status = 0;
        
        monkeyUI.drawImageMessageBubble(_message, currentConversationId, isConversationGroup(currentConversationId), _status);
    }

    /************* TO SEND FILE MESSAGE ************/

    function prepareFileToSend (file, ephemeral) { 
        var _eph = ephemeral ? 1 : 0;
        var params = {
            eph: _eph
        };
        var _mokMessage = monkey.sendEncryptedFile(file.src, currentConversationId, file.file.name, file.file.type, file.monkeyFileType, true, params, null, function(err, message){
            if(err){
                console.log(err);
            }else{
                console.log(message);
                monkeyUI.updateStatusMessageBubble(message.oldId, message.id, 51);
            }
        });

        var _message = new MUIMessage(_mokMessage);
        _message.setDataSource(file.src);
        _message.filesize = file.file.size;
        var _status = 0;
        
        monkeyUI.drawFileMessageBubble(_message, currentConversationId, isConversationGroup(currentConversationId), _status);
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
    
    function isConversationGroup(conversationId){
	    var result = false;
	    if(conversationId.indexOf("G:") >= 0){
	        result = true;
	    }
	    return result;
	}

};

window.monkeyChat = monkeyChat;