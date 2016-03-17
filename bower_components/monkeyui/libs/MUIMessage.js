/**
   * A representation of a message.
   *
   * @class Message
   * @constructor
   * @param {MOKMessage} mokMessage recevived by Monkey.
   */

module.exports = class MUIMessage{
    constructor(mokMessage) {
        this.id = mokMessage.id;
        this.protocolType = mokMessage.protocolType;
        this.senderId = mokMessage.senderId;
        this.timestamp = mokMessage.datetimeCreation;
        //this.encryptedText = mokMessage.encryptedText;
        this.text = mokMessage.text;
        this.recipientId = mokMessage.recipientId;

        if(mokMessage.params){ 
            this.length = mokMessage.params.length;
            this.eph = mokMessage.params.eph == undefined ? 0 : mokMessage.params.eph;
        }else{
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

        this.setDataSource = function(dataSource){
            this.dataSource = dataSource;
        }

        this.setFilename = function(filename){
            this.filename = filename;
        }

        this.isEncrypted = function(){
            return this.encr == 1 ? true : false;
        }

        this.isCompressed = function(){
            return this.cmpr != undefined ? true : false;
        }

        this.compressionMethod = function(){
            return this.cmpr;
        }
    }

    setSenderName(senderName){
        this.senderName = senderName;
    }

    setSenderColor(senderColor){
        this.senderColor = senderColor;
    }
}