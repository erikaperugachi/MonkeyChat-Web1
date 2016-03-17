/**
   * A representation of a conversation.
   *
   * @class Conversation
   * @constructor
   * @param {int}       id To identify the conversation.
   * @param {Object}    info A data about group conversation
   */

module.exports = class MUIConversation{

    constructor(id, name, urlAvatar, members){
        this.id = id;
        this.lastMessage = null;
        this.unreadMessageCount = 0;
        this.name = name;
        this.urlAvatar = urlAvatar;
        this.members = members;
        this.setLastOpenMe = function(lastOpenMe){
            this.lastOpenMe = lastOpenMe;
        }
    }
}