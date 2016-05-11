# MonkeyChat-Web
## MonkeyChat CDN
* If using monkeyChat it is not necessary to use monkeyUI.
Paste the following code into the <head> section of your site's HTML:
```
<script type="text/javascript" src="https://cdn.criptext.com/v1.1.0/monkeyChat.js"></script>
```

### monkeyChat.init(String, String, String, Obj, Obj)
To start setup chat.
```
  var monkeyChatView = {
    screen: {
      type: 'classic',
      data: {
        width: '380px',
        height: '500px'
      },
    }
  };
  var form = '<div id="my-login">'+
		'<input type="text" id="user_name">'+
		'<input type="button" value="Login" id="submit_login">'+
	'</div>';
  monkeyChat.init(appID, appKey, conversationID, monkeyChatView, form);
```

## MonkeyUI CDN
Paste the following code into the <head> section of your site's HTML:
```
<script type="text/javascript" src="https://cdn.criptext.com/v1.1.0/monkeyUI.js"></script>
```

### monkeyUI.setChat(Obj)
Setup view to draw
```
  var view = {
    screen: {
      type: 'classic',
      data: {
        width: '380px',
        height: '500px'
      },
    }
  };
  monkeyUI.setChat(view);
```

### monkeyUI.form
To confirm that your chat needs to add your own form session.
```
  monkeyUI.form = true;
```

### monkeyUI.drawScene()
Call to draw screen chat.
```
  monkeyUI.drawScene();
```

### monkeyUI.addLoginForm(Obj)
To add your own form session.
```
  var form = '<div id="my-login">'+
		'<input type="text" id="user_name">'+
		'<input type="button" value="Login" id="submit_login">'+
	'</div>';
  monkeyUI.addLoginForm(form);
```

### Trigger: 'quickStart'
Quick start chat without form, when opening the tab.
```
  $(monkeyUI).on('quickStart', function(event, file){
  });
```

### monkeyUI.startLoading()
Call the loading effect to appear on screen.
```
  monkeyUI.startLoading();
```

### monkeyUI.stopLoading()
Call the loading effect to disappear from the screen.
```
  monkeyUI.stopLoading();
```

### monkeyUI.loadDataScreen(MUIUser)
To load data about user login.
```
  var myUser = new MUIUser(userId, monkeyId, userName, 0, userUrlAvatar);
  monkeyUI.loadDataScreen(myUser);
```

### monkeyUI.drawConversation(MUIConversation, boolean);
To draw conversation: conversationItem and conversationWindow
```
  monkeyUI.drawConversation(conversation, value);
```

### monkeyUI.updateDrawConversation(MUIConversation);
To update any data about conversation
```
  monkeyUI.updateDrawConversation(conversation);
```

### Draw Bubbles
### monkeyUI.drawTextMessageBubble(MUIMessage, String, boolean, int);
To draw text message bubble.
```
  monkeyUI.drawTextMessageBubble(message, conversationId, isGroupChat, status);
```

### monkeyUI.drawAudioMessageBubble(MUIMessage, String, boolean, int);
To draw audio message bubble.
```
  monkeyUI.drawAudioMessageBubble(message, conversationId, isGroupChat, status);
```

### monkeyUI.drawImageMessageBubble(MUIMessage, String, boolean, int);
To draw image message bubble.
```
  monkeyUI.drawImageMessageBubble(message, conversationId, isGroupChat, status);
```

### monkeyUI.drawFileMessageBubble(MUIMessage, String, boolean, int);
To draw file message bubble.
```
  monkeyUI.drawFileMessageBubble(message, conversationId, isGroupChat, status);
```

### monkeyUI.updateDataMessageBubble(String, String);
To update the src data of media message.
```
  monkeyUI.updateDataMessageBubble(messageId, dataBase64);
```

### Inputs
### Trigger: 'textMessage'
Receive the text message that input generates.
```
  $(monkeyUI).on('textMessage', function(event, text){
  });
```

### Trigger: 'imageMessage'
Receive the image message that input generates.
```
  $(monkeyUI).on('imageMessage', function(event, file){
  });
```

### Trigger: 'audioMessage'
Receive the audio message that input generates.
```
  $(monkeyUI).on('audioMessage', function(event, audio, messageOldId){
  });
```

### Trigger: 'fileMessage'
Receive the file message that input generates.
```
  $(monkeyUI).on('fileMessage', function(event, file){
  });
```

### monkeyUI.showChatInput()
To show chat input.
```
  monkeyUI.showChatInput();
```

### Status conversation
### monkeyUI.updateOnlineStatus(String, int)
To update online status conversation.
```
  monkeyUI.updateOnlineStatus(lastOpenApp, state);
```

### monkeyUI.updateTypingState(String, int)
To update typing status conversation.
```
  monkeyUI.updateTypingState(conversationId, state);
```

### Status messages
### monkeyUI.updateStatusReadMessageBubble(String)
To update read status of outgoing message, when the recipient opens the sender conversation.
```
  monkeyUI.updateStatusReadMessageBubble(conversationId);
```

### monkeyUI.updateStatusMessageBubble(String, String, int)
To update read/send status of outgoing message.
```
  monkeyUI.updateStatusMessageBubble(messageOldId, messageNewId, status);
```

### Viewer
### monkeyUI.exitViewer()
To close preview viewer
```
  monkeyUI.exitViewer();
```

## Options
The following options are supported in view:
type: 'classic' | 'fullscreen'
If use 'classic' add the data:
data: {width: '380px',height: '500px'}
