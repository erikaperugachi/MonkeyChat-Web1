/**
   * A representation of a user.
   *
   * @class User
   * @constructor
   * @param {int}       id To identify the user.
   * @param {String}    monkeyId To identify the user on monkey
   * @param {String}    name A name to be displayed as the author of the message.
   */

module.exports = class MUIUser{

    constructor(id, monkeyId, name, privacy, urlAvatar, isFriend){
        if(id != undefined){
            this.id = id;
        }
        this.monkeyId = monkeyId;
        this.name = name;
        this.privacy = privacy;
        this.urlAvatar = urlAvatar;
        this.isFriend = isFriend;
    }
}