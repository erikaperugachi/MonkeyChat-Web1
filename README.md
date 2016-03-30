# MonkeyChat-Web

## MonkeyChat CDN
Paste the following code into the <head> section of your site's HTML:
```
<script type="text/javascript" src="https://cdn.criptext.com/monkeyChat3.js"></script>
```

## Example
```

<script type="text/javascript" charset="utf-8">
  var monkeyChatView = {
    screen: {
      type: 'classic',
      data: {
        width: '380px',
        height: '500px'
      },
    }
  };
  monkeyChat.init(appID, appKey, conversationID, monkeyChatView, null);

</script>
```
## Options
The following options are supported in monkeyChatView:

