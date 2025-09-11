/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.ConsersationStart = (function() {
    
        /**
         * Properties of a ConsersationStart.
         * @exports IConsersationStart
         * @interface IConsersationStart
         * @property {string|null} [id] ConsersationStart id
         * @property {Uint8Array|null} [ciphertext] ConsersationStart ciphertext
         * @property {Uint8Array|null} [ephemeralKey] ConsersationStart ephemeralKey
         * @property {Uint8Array|null} [ratchetPublicKey] ConsersationStart ratchetPublicKey
         * @property {Uint8Array|null} [oneTimePrekey] ConsersationStart oneTimePrekey
         */
    
        /**
         * Constructs a new ConsersationStart.
         * @exports ConsersationStart
         * @classdesc Represents a ConsersationStart.
         * @implements IConsersationStart
         * @constructor
         * @param {IConsersationStart=} [properties] Properties to set
         */
        function ConsersationStart(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * ConsersationStart id.
         * @member {string} id
         * @memberof ConsersationStart
         * @instance
         */
        ConsersationStart.prototype.id = "";
    
        /**
         * ConsersationStart ciphertext.
         * @member {Uint8Array} ciphertext
         * @memberof ConsersationStart
         * @instance
         */
        ConsersationStart.prototype.ciphertext = $util.newBuffer([]);
    
        /**
         * ConsersationStart ephemeralKey.
         * @member {Uint8Array} ephemeralKey
         * @memberof ConsersationStart
         * @instance
         */
        ConsersationStart.prototype.ephemeralKey = $util.newBuffer([]);
    
        /**
         * ConsersationStart ratchetPublicKey.
         * @member {Uint8Array} ratchetPublicKey
         * @memberof ConsersationStart
         * @instance
         */
        ConsersationStart.prototype.ratchetPublicKey = $util.newBuffer([]);
    
        /**
         * ConsersationStart oneTimePrekey.
         * @member {Uint8Array|null|undefined} oneTimePrekey
         * @memberof ConsersationStart
         * @instance
         */
        ConsersationStart.prototype.oneTimePrekey = null;
    
        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;
    
        /**
         * ConsersationStart _oneTimePrekey.
         * @member {"oneTimePrekey"|undefined} _oneTimePrekey
         * @memberof ConsersationStart
         * @instance
         */
        Object.defineProperty(ConsersationStart.prototype, "_oneTimePrekey", {
            get: $util.oneOfGetter($oneOfFields = ["oneTimePrekey"]),
            set: $util.oneOfSetter($oneOfFields)
        });
    
        /**
         * Creates a new ConsersationStart instance using the specified properties.
         * @function create
         * @memberof ConsersationStart
         * @static
         * @param {IConsersationStart=} [properties] Properties to set
         * @returns {ConsersationStart} ConsersationStart instance
         */
        ConsersationStart.create = function create(properties) {
            return new ConsersationStart(properties);
        };
    
        /**
         * Encodes the specified ConsersationStart message. Does not implicitly {@link ConsersationStart.verify|verify} messages.
         * @function encode
         * @memberof ConsersationStart
         * @static
         * @param {IConsersationStart} message ConsersationStart message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ConsersationStart.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.ciphertext != null && Object.hasOwnProperty.call(message, "ciphertext"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.ciphertext);
            if (message.ephemeralKey != null && Object.hasOwnProperty.call(message, "ephemeralKey"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.ephemeralKey);
            if (message.ratchetPublicKey != null && Object.hasOwnProperty.call(message, "ratchetPublicKey"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.ratchetPublicKey);
            if (message.oneTimePrekey != null && Object.hasOwnProperty.call(message, "oneTimePrekey"))
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.oneTimePrekey);
            return writer;
        };
    
        /**
         * Encodes the specified ConsersationStart message, length delimited. Does not implicitly {@link ConsersationStart.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ConsersationStart
         * @static
         * @param {IConsersationStart} message ConsersationStart message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ConsersationStart.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a ConsersationStart message from the specified reader or buffer.
         * @function decode
         * @memberof ConsersationStart
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ConsersationStart} ConsersationStart
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ConsersationStart.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ConsersationStart();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.ciphertext = reader.bytes();
                        break;
                    }
                case 3: {
                        message.ephemeralKey = reader.bytes();
                        break;
                    }
                case 4: {
                        message.ratchetPublicKey = reader.bytes();
                        break;
                    }
                case 5: {
                        message.oneTimePrekey = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes a ConsersationStart message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ConsersationStart
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ConsersationStart} ConsersationStart
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ConsersationStart.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a ConsersationStart message.
         * @function verify
         * @memberof ConsersationStart
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ConsersationStart.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.ciphertext != null && message.hasOwnProperty("ciphertext"))
                if (!(message.ciphertext && typeof message.ciphertext.length === "number" || $util.isString(message.ciphertext)))
                    return "ciphertext: buffer expected";
            if (message.ephemeralKey != null && message.hasOwnProperty("ephemeralKey"))
                if (!(message.ephemeralKey && typeof message.ephemeralKey.length === "number" || $util.isString(message.ephemeralKey)))
                    return "ephemeralKey: buffer expected";
            if (message.ratchetPublicKey != null && message.hasOwnProperty("ratchetPublicKey"))
                if (!(message.ratchetPublicKey && typeof message.ratchetPublicKey.length === "number" || $util.isString(message.ratchetPublicKey)))
                    return "ratchetPublicKey: buffer expected";
            if (message.oneTimePrekey != null && message.hasOwnProperty("oneTimePrekey")) {
                properties._oneTimePrekey = 1;
                if (!(message.oneTimePrekey && typeof message.oneTimePrekey.length === "number" || $util.isString(message.oneTimePrekey)))
                    return "oneTimePrekey: buffer expected";
            }
            return null;
        };
    
        /**
         * Creates a ConsersationStart message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ConsersationStart
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ConsersationStart} ConsersationStart
         */
        ConsersationStart.fromObject = function fromObject(object) {
            if (object instanceof $root.ConsersationStart)
                return object;
            var message = new $root.ConsersationStart();
            if (object.id != null)
                message.id = String(object.id);
            if (object.ciphertext != null)
                if (typeof object.ciphertext === "string")
                    $util.base64.decode(object.ciphertext, message.ciphertext = $util.newBuffer($util.base64.length(object.ciphertext)), 0);
                else if (object.ciphertext.length >= 0)
                    message.ciphertext = object.ciphertext;
            if (object.ephemeralKey != null)
                if (typeof object.ephemeralKey === "string")
                    $util.base64.decode(object.ephemeralKey, message.ephemeralKey = $util.newBuffer($util.base64.length(object.ephemeralKey)), 0);
                else if (object.ephemeralKey.length >= 0)
                    message.ephemeralKey = object.ephemeralKey;
            if (object.ratchetPublicKey != null)
                if (typeof object.ratchetPublicKey === "string")
                    $util.base64.decode(object.ratchetPublicKey, message.ratchetPublicKey = $util.newBuffer($util.base64.length(object.ratchetPublicKey)), 0);
                else if (object.ratchetPublicKey.length >= 0)
                    message.ratchetPublicKey = object.ratchetPublicKey;
            if (object.oneTimePrekey != null)
                if (typeof object.oneTimePrekey === "string")
                    $util.base64.decode(object.oneTimePrekey, message.oneTimePrekey = $util.newBuffer($util.base64.length(object.oneTimePrekey)), 0);
                else if (object.oneTimePrekey.length >= 0)
                    message.oneTimePrekey = object.oneTimePrekey;
            return message;
        };
    
        /**
         * Creates a plain object from a ConsersationStart message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ConsersationStart
         * @static
         * @param {ConsersationStart} message ConsersationStart
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ConsersationStart.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = "";
                if (options.bytes === String)
                    object.ciphertext = "";
                else {
                    object.ciphertext = [];
                    if (options.bytes !== Array)
                        object.ciphertext = $util.newBuffer(object.ciphertext);
                }
                if (options.bytes === String)
                    object.ephemeralKey = "";
                else {
                    object.ephemeralKey = [];
                    if (options.bytes !== Array)
                        object.ephemeralKey = $util.newBuffer(object.ephemeralKey);
                }
                if (options.bytes === String)
                    object.ratchetPublicKey = "";
                else {
                    object.ratchetPublicKey = [];
                    if (options.bytes !== Array)
                        object.ratchetPublicKey = $util.newBuffer(object.ratchetPublicKey);
                }
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.ciphertext != null && message.hasOwnProperty("ciphertext"))
                object.ciphertext = options.bytes === String ? $util.base64.encode(message.ciphertext, 0, message.ciphertext.length) : options.bytes === Array ? Array.prototype.slice.call(message.ciphertext) : message.ciphertext;
            if (message.ephemeralKey != null && message.hasOwnProperty("ephemeralKey"))
                object.ephemeralKey = options.bytes === String ? $util.base64.encode(message.ephemeralKey, 0, message.ephemeralKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.ephemeralKey) : message.ephemeralKey;
            if (message.ratchetPublicKey != null && message.hasOwnProperty("ratchetPublicKey"))
                object.ratchetPublicKey = options.bytes === String ? $util.base64.encode(message.ratchetPublicKey, 0, message.ratchetPublicKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.ratchetPublicKey) : message.ratchetPublicKey;
            if (message.oneTimePrekey != null && message.hasOwnProperty("oneTimePrekey")) {
                object.oneTimePrekey = options.bytes === String ? $util.base64.encode(message.oneTimePrekey, 0, message.oneTimePrekey.length) : options.bytes === Array ? Array.prototype.slice.call(message.oneTimePrekey) : message.oneTimePrekey;
                if (options.oneofs)
                    object._oneTimePrekey = "oneTimePrekey";
            }
            return object;
        };
    
        /**
         * Converts this ConsersationStart to JSON.
         * @function toJSON
         * @memberof ConsersationStart
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ConsersationStart.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for ConsersationStart
         * @function getTypeUrl
         * @memberof ConsersationStart
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ConsersationStart.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/ConsersationStart";
        };
    
        return ConsersationStart;
    })();
    
    $root.MessageContents = (function() {
    
        /**
         * Properties of a MessageContents.
         * @exports IMessageContents
         * @interface IMessageContents
         * @property {string|null} [text] MessageContents text
         * @property {string|null} [fileId] MessageContents fileId
         */
    
        /**
         * Constructs a new MessageContents.
         * @exports MessageContents
         * @classdesc Represents a MessageContents.
         * @implements IMessageContents
         * @constructor
         * @param {IMessageContents=} [properties] Properties to set
         */
        function MessageContents(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * MessageContents text.
         * @member {string} text
         * @memberof MessageContents
         * @instance
         */
        MessageContents.prototype.text = "";
    
        /**
         * MessageContents fileId.
         * @member {string|null|undefined} fileId
         * @memberof MessageContents
         * @instance
         */
        MessageContents.prototype.fileId = null;
    
        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;
    
        /**
         * MessageContents _fileId.
         * @member {"fileId"|undefined} _fileId
         * @memberof MessageContents
         * @instance
         */
        Object.defineProperty(MessageContents.prototype, "_fileId", {
            get: $util.oneOfGetter($oneOfFields = ["fileId"]),
            set: $util.oneOfSetter($oneOfFields)
        });
    
        /**
         * Creates a new MessageContents instance using the specified properties.
         * @function create
         * @memberof MessageContents
         * @static
         * @param {IMessageContents=} [properties] Properties to set
         * @returns {MessageContents} MessageContents instance
         */
        MessageContents.create = function create(properties) {
            return new MessageContents(properties);
        };
    
        /**
         * Encodes the specified MessageContents message. Does not implicitly {@link MessageContents.verify|verify} messages.
         * @function encode
         * @memberof MessageContents
         * @static
         * @param {IMessageContents} message MessageContents message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageContents.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.text != null && Object.hasOwnProperty.call(message, "text"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.text);
            if (message.fileId != null && Object.hasOwnProperty.call(message, "fileId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.fileId);
            return writer;
        };
    
        /**
         * Encodes the specified MessageContents message, length delimited. Does not implicitly {@link MessageContents.verify|verify} messages.
         * @function encodeDelimited
         * @memberof MessageContents
         * @static
         * @param {IMessageContents} message MessageContents message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageContents.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a MessageContents message from the specified reader or buffer.
         * @function decode
         * @memberof MessageContents
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {MessageContents} MessageContents
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageContents.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.MessageContents();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.text = reader.string();
                        break;
                    }
                case 2: {
                        message.fileId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes a MessageContents message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof MessageContents
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {MessageContents} MessageContents
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageContents.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a MessageContents message.
         * @function verify
         * @memberof MessageContents
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageContents.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.text != null && message.hasOwnProperty("text"))
                if (!$util.isString(message.text))
                    return "text: string expected";
            if (message.fileId != null && message.hasOwnProperty("fileId")) {
                properties._fileId = 1;
                if (!$util.isString(message.fileId))
                    return "fileId: string expected";
            }
            return null;
        };
    
        /**
         * Creates a MessageContents message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof MessageContents
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {MessageContents} MessageContents
         */
        MessageContents.fromObject = function fromObject(object) {
            if (object instanceof $root.MessageContents)
                return object;
            var message = new $root.MessageContents();
            if (object.text != null)
                message.text = String(object.text);
            if (object.fileId != null)
                message.fileId = String(object.fileId);
            return message;
        };
    
        /**
         * Creates a plain object from a MessageContents message. Also converts values to other types if specified.
         * @function toObject
         * @memberof MessageContents
         * @static
         * @param {MessageContents} message MessageContents
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageContents.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.text = "";
            if (message.text != null && message.hasOwnProperty("text"))
                object.text = message.text;
            if (message.fileId != null && message.hasOwnProperty("fileId")) {
                object.fileId = message.fileId;
                if (options.oneofs)
                    object._fileId = "fileId";
            }
            return object;
        };
    
        /**
         * Converts this MessageContents to JSON.
         * @function toJSON
         * @memberof MessageContents
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageContents.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for MessageContents
         * @function getTypeUrl
         * @memberof MessageContents
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageContents.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/MessageContents";
        };
    
        return MessageContents;
    })();
    
    $root.ChatMessage = (function() {
    
        /**
         * Properties of a ChatMessage.
         * @exports IChatMessage
         * @interface IChatMessage
         * @property {string|null} [messageId] ChatMessage messageId
         * @property {string|null} [senderId] ChatMessage senderId
         * @property {string|null} [chatId] ChatMessage chatId
         * @property {number|null} [messageCount] ChatMessage messageCount
         * @property {IMessageContents|null} [messageContents] ChatMessage messageContents
         * @property {Uint8Array|null} [publicKey] ChatMessage publicKey
         */
    
        /**
         * Constructs a new ChatMessage.
         * @exports ChatMessage
         * @classdesc Represents a ChatMessage.
         * @implements IChatMessage
         * @constructor
         * @param {IChatMessage=} [properties] Properties to set
         */
        function ChatMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * ChatMessage messageId.
         * @member {string} messageId
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.messageId = "";
    
        /**
         * ChatMessage senderId.
         * @member {string} senderId
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.senderId = "";
    
        /**
         * ChatMessage chatId.
         * @member {string} chatId
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.chatId = "";
    
        /**
         * ChatMessage messageCount.
         * @member {number} messageCount
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.messageCount = 0;
    
        /**
         * ChatMessage messageContents.
         * @member {IMessageContents|null|undefined} messageContents
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.messageContents = null;
    
        /**
         * ChatMessage publicKey.
         * @member {Uint8Array} publicKey
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.publicKey = $util.newBuffer([]);
    
        /**
         * Creates a new ChatMessage instance using the specified properties.
         * @function create
         * @memberof ChatMessage
         * @static
         * @param {IChatMessage=} [properties] Properties to set
         * @returns {ChatMessage} ChatMessage instance
         */
        ChatMessage.create = function create(properties) {
            return new ChatMessage(properties);
        };
    
        /**
         * Encodes the specified ChatMessage message. Does not implicitly {@link ChatMessage.verify|verify} messages.
         * @function encode
         * @memberof ChatMessage
         * @static
         * @param {IChatMessage} message ChatMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChatMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.messageId != null && Object.hasOwnProperty.call(message, "messageId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.messageId);
            if (message.senderId != null && Object.hasOwnProperty.call(message, "senderId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.senderId);
            if (message.chatId != null && Object.hasOwnProperty.call(message, "chatId"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.chatId);
            if (message.messageCount != null && Object.hasOwnProperty.call(message, "messageCount"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.messageCount);
            if (message.messageContents != null && Object.hasOwnProperty.call(message, "messageContents"))
                $root.MessageContents.encode(message.messageContents, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.publicKey);
            return writer;
        };
    
        /**
         * Encodes the specified ChatMessage message, length delimited. Does not implicitly {@link ChatMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof ChatMessage
         * @static
         * @param {IChatMessage} message ChatMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ChatMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a ChatMessage message from the specified reader or buffer.
         * @function decode
         * @memberof ChatMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {ChatMessage} ChatMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChatMessage.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.ChatMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.messageId = reader.string();
                        break;
                    }
                case 2: {
                        message.senderId = reader.string();
                        break;
                    }
                case 3: {
                        message.chatId = reader.string();
                        break;
                    }
                case 4: {
                        message.messageCount = reader.uint32();
                        break;
                    }
                case 5: {
                        message.messageContents = $root.MessageContents.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.publicKey = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes a ChatMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof ChatMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {ChatMessage} ChatMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ChatMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a ChatMessage message.
         * @function verify
         * @memberof ChatMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ChatMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.messageId != null && message.hasOwnProperty("messageId"))
                if (!$util.isString(message.messageId))
                    return "messageId: string expected";
            if (message.senderId != null && message.hasOwnProperty("senderId"))
                if (!$util.isString(message.senderId))
                    return "senderId: string expected";
            if (message.chatId != null && message.hasOwnProperty("chatId"))
                if (!$util.isString(message.chatId))
                    return "chatId: string expected";
            if (message.messageCount != null && message.hasOwnProperty("messageCount"))
                if (!$util.isInteger(message.messageCount))
                    return "messageCount: integer expected";
            if (message.messageContents != null && message.hasOwnProperty("messageContents")) {
                var error = $root.MessageContents.verify(message.messageContents);
                if (error)
                    return "messageContents." + error;
            }
            if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                if (!(message.publicKey && typeof message.publicKey.length === "number" || $util.isString(message.publicKey)))
                    return "publicKey: buffer expected";
            return null;
        };
    
        /**
         * Creates a ChatMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof ChatMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {ChatMessage} ChatMessage
         */
        ChatMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.ChatMessage)
                return object;
            var message = new $root.ChatMessage();
            if (object.messageId != null)
                message.messageId = String(object.messageId);
            if (object.senderId != null)
                message.senderId = String(object.senderId);
            if (object.chatId != null)
                message.chatId = String(object.chatId);
            if (object.messageCount != null)
                message.messageCount = object.messageCount >>> 0;
            if (object.messageContents != null) {
                if (typeof object.messageContents !== "object")
                    throw TypeError(".ChatMessage.messageContents: object expected");
                message.messageContents = $root.MessageContents.fromObject(object.messageContents);
            }
            if (object.publicKey != null)
                if (typeof object.publicKey === "string")
                    $util.base64.decode(object.publicKey, message.publicKey = $util.newBuffer($util.base64.length(object.publicKey)), 0);
                else if (object.publicKey.length >= 0)
                    message.publicKey = object.publicKey;
            return message;
        };
    
        /**
         * Creates a plain object from a ChatMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof ChatMessage
         * @static
         * @param {ChatMessage} message ChatMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ChatMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.messageId = "";
                object.senderId = "";
                object.chatId = "";
                object.messageCount = 0;
                object.messageContents = null;
                if (options.bytes === String)
                    object.publicKey = "";
                else {
                    object.publicKey = [];
                    if (options.bytes !== Array)
                        object.publicKey = $util.newBuffer(object.publicKey);
                }
            }
            if (message.messageId != null && message.hasOwnProperty("messageId"))
                object.messageId = message.messageId;
            if (message.senderId != null && message.hasOwnProperty("senderId"))
                object.senderId = message.senderId;
            if (message.chatId != null && message.hasOwnProperty("chatId"))
                object.chatId = message.chatId;
            if (message.messageCount != null && message.hasOwnProperty("messageCount"))
                object.messageCount = message.messageCount;
            if (message.messageContents != null && message.hasOwnProperty("messageContents"))
                object.messageContents = $root.MessageContents.toObject(message.messageContents, options);
            if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                object.publicKey = options.bytes === String ? $util.base64.encode(message.publicKey, 0, message.publicKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.publicKey) : message.publicKey;
            return object;
        };
    
        /**
         * Converts this ChatMessage to JSON.
         * @function toJSON
         * @memberof ChatMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ChatMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for ChatMessage
         * @function getTypeUrl
         * @memberof ChatMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ChatMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/ChatMessage";
        };
    
        return ChatMessage;
    })();
    
    $root.PreKeyBundle = (function() {
    
        /**
         * Properties of a PreKeyBundle.
         * @exports IPreKeyBundle
         * @interface IPreKeyBundle
         * @property {string|null} [id] PreKeyBundle id
         * @property {Uint8Array|null} [identityKey] PreKeyBundle identityKey
         * @property {Uint8Array|null} [signedPrekey] PreKeyBundle signedPrekey
         * @property {Uint8Array|null} [prekeySignature] PreKeyBundle prekeySignature
         * @property {Array.<Uint8Array>|null} [oneTimePrekey] PreKeyBundle oneTimePrekey
         */
    
        /**
         * Constructs a new PreKeyBundle.
         * @exports PreKeyBundle
         * @classdesc Represents a PreKeyBundle.
         * @implements IPreKeyBundle
         * @constructor
         * @param {IPreKeyBundle=} [properties] Properties to set
         */
        function PreKeyBundle(properties) {
            this.oneTimePrekey = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * PreKeyBundle id.
         * @member {string} id
         * @memberof PreKeyBundle
         * @instance
         */
        PreKeyBundle.prototype.id = "";
    
        /**
         * PreKeyBundle identityKey.
         * @member {Uint8Array} identityKey
         * @memberof PreKeyBundle
         * @instance
         */
        PreKeyBundle.prototype.identityKey = $util.newBuffer([]);
    
        /**
         * PreKeyBundle signedPrekey.
         * @member {Uint8Array} signedPrekey
         * @memberof PreKeyBundle
         * @instance
         */
        PreKeyBundle.prototype.signedPrekey = $util.newBuffer([]);
    
        /**
         * PreKeyBundle prekeySignature.
         * @member {Uint8Array} prekeySignature
         * @memberof PreKeyBundle
         * @instance
         */
        PreKeyBundle.prototype.prekeySignature = $util.newBuffer([]);
    
        /**
         * PreKeyBundle oneTimePrekey.
         * @member {Array.<Uint8Array>} oneTimePrekey
         * @memberof PreKeyBundle
         * @instance
         */
        PreKeyBundle.prototype.oneTimePrekey = $util.emptyArray;
    
        /**
         * Creates a new PreKeyBundle instance using the specified properties.
         * @function create
         * @memberof PreKeyBundle
         * @static
         * @param {IPreKeyBundle=} [properties] Properties to set
         * @returns {PreKeyBundle} PreKeyBundle instance
         */
        PreKeyBundle.create = function create(properties) {
            return new PreKeyBundle(properties);
        };
    
        /**
         * Encodes the specified PreKeyBundle message. Does not implicitly {@link PreKeyBundle.verify|verify} messages.
         * @function encode
         * @memberof PreKeyBundle
         * @static
         * @param {IPreKeyBundle} message PreKeyBundle message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PreKeyBundle.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.identityKey != null && Object.hasOwnProperty.call(message, "identityKey"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.identityKey);
            if (message.signedPrekey != null && Object.hasOwnProperty.call(message, "signedPrekey"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.signedPrekey);
            if (message.prekeySignature != null && Object.hasOwnProperty.call(message, "prekeySignature"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.prekeySignature);
            if (message.oneTimePrekey != null && message.oneTimePrekey.length)
                for (var i = 0; i < message.oneTimePrekey.length; ++i)
                    writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.oneTimePrekey[i]);
            return writer;
        };
    
        /**
         * Encodes the specified PreKeyBundle message, length delimited. Does not implicitly {@link PreKeyBundle.verify|verify} messages.
         * @function encodeDelimited
         * @memberof PreKeyBundle
         * @static
         * @param {IPreKeyBundle} message PreKeyBundle message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PreKeyBundle.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a PreKeyBundle message from the specified reader or buffer.
         * @function decode
         * @memberof PreKeyBundle
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {PreKeyBundle} PreKeyBundle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PreKeyBundle.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PreKeyBundle();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.identityKey = reader.bytes();
                        break;
                    }
                case 3: {
                        message.signedPrekey = reader.bytes();
                        break;
                    }
                case 4: {
                        message.prekeySignature = reader.bytes();
                        break;
                    }
                case 5: {
                        if (!(message.oneTimePrekey && message.oneTimePrekey.length))
                            message.oneTimePrekey = [];
                        message.oneTimePrekey.push(reader.bytes());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes a PreKeyBundle message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof PreKeyBundle
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {PreKeyBundle} PreKeyBundle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PreKeyBundle.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a PreKeyBundle message.
         * @function verify
         * @memberof PreKeyBundle
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PreKeyBundle.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.identityKey != null && message.hasOwnProperty("identityKey"))
                if (!(message.identityKey && typeof message.identityKey.length === "number" || $util.isString(message.identityKey)))
                    return "identityKey: buffer expected";
            if (message.signedPrekey != null && message.hasOwnProperty("signedPrekey"))
                if (!(message.signedPrekey && typeof message.signedPrekey.length === "number" || $util.isString(message.signedPrekey)))
                    return "signedPrekey: buffer expected";
            if (message.prekeySignature != null && message.hasOwnProperty("prekeySignature"))
                if (!(message.prekeySignature && typeof message.prekeySignature.length === "number" || $util.isString(message.prekeySignature)))
                    return "prekeySignature: buffer expected";
            if (message.oneTimePrekey != null && message.hasOwnProperty("oneTimePrekey")) {
                if (!Array.isArray(message.oneTimePrekey))
                    return "oneTimePrekey: array expected";
                for (var i = 0; i < message.oneTimePrekey.length; ++i)
                    if (!(message.oneTimePrekey[i] && typeof message.oneTimePrekey[i].length === "number" || $util.isString(message.oneTimePrekey[i])))
                        return "oneTimePrekey: buffer[] expected";
            }
            return null;
        };
    
        /**
         * Creates a PreKeyBundle message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof PreKeyBundle
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {PreKeyBundle} PreKeyBundle
         */
        PreKeyBundle.fromObject = function fromObject(object) {
            if (object instanceof $root.PreKeyBundle)
                return object;
            var message = new $root.PreKeyBundle();
            if (object.id != null)
                message.id = String(object.id);
            if (object.identityKey != null)
                if (typeof object.identityKey === "string")
                    $util.base64.decode(object.identityKey, message.identityKey = $util.newBuffer($util.base64.length(object.identityKey)), 0);
                else if (object.identityKey.length >= 0)
                    message.identityKey = object.identityKey;
            if (object.signedPrekey != null)
                if (typeof object.signedPrekey === "string")
                    $util.base64.decode(object.signedPrekey, message.signedPrekey = $util.newBuffer($util.base64.length(object.signedPrekey)), 0);
                else if (object.signedPrekey.length >= 0)
                    message.signedPrekey = object.signedPrekey;
            if (object.prekeySignature != null)
                if (typeof object.prekeySignature === "string")
                    $util.base64.decode(object.prekeySignature, message.prekeySignature = $util.newBuffer($util.base64.length(object.prekeySignature)), 0);
                else if (object.prekeySignature.length >= 0)
                    message.prekeySignature = object.prekeySignature;
            if (object.oneTimePrekey) {
                if (!Array.isArray(object.oneTimePrekey))
                    throw TypeError(".PreKeyBundle.oneTimePrekey: array expected");
                message.oneTimePrekey = [];
                for (var i = 0; i < object.oneTimePrekey.length; ++i)
                    if (typeof object.oneTimePrekey[i] === "string")
                        $util.base64.decode(object.oneTimePrekey[i], message.oneTimePrekey[i] = $util.newBuffer($util.base64.length(object.oneTimePrekey[i])), 0);
                    else if (object.oneTimePrekey[i].length >= 0)
                        message.oneTimePrekey[i] = object.oneTimePrekey[i];
            }
            return message;
        };
    
        /**
         * Creates a plain object from a PreKeyBundle message. Also converts values to other types if specified.
         * @function toObject
         * @memberof PreKeyBundle
         * @static
         * @param {PreKeyBundle} message PreKeyBundle
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PreKeyBundle.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.oneTimePrekey = [];
            if (options.defaults) {
                object.id = "";
                if (options.bytes === String)
                    object.identityKey = "";
                else {
                    object.identityKey = [];
                    if (options.bytes !== Array)
                        object.identityKey = $util.newBuffer(object.identityKey);
                }
                if (options.bytes === String)
                    object.signedPrekey = "";
                else {
                    object.signedPrekey = [];
                    if (options.bytes !== Array)
                        object.signedPrekey = $util.newBuffer(object.signedPrekey);
                }
                if (options.bytes === String)
                    object.prekeySignature = "";
                else {
                    object.prekeySignature = [];
                    if (options.bytes !== Array)
                        object.prekeySignature = $util.newBuffer(object.prekeySignature);
                }
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.identityKey != null && message.hasOwnProperty("identityKey"))
                object.identityKey = options.bytes === String ? $util.base64.encode(message.identityKey, 0, message.identityKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.identityKey) : message.identityKey;
            if (message.signedPrekey != null && message.hasOwnProperty("signedPrekey"))
                object.signedPrekey = options.bytes === String ? $util.base64.encode(message.signedPrekey, 0, message.signedPrekey.length) : options.bytes === Array ? Array.prototype.slice.call(message.signedPrekey) : message.signedPrekey;
            if (message.prekeySignature != null && message.hasOwnProperty("prekeySignature"))
                object.prekeySignature = options.bytes === String ? $util.base64.encode(message.prekeySignature, 0, message.prekeySignature.length) : options.bytes === Array ? Array.prototype.slice.call(message.prekeySignature) : message.prekeySignature;
            if (message.oneTimePrekey && message.oneTimePrekey.length) {
                object.oneTimePrekey = [];
                for (var j = 0; j < message.oneTimePrekey.length; ++j)
                    object.oneTimePrekey[j] = options.bytes === String ? $util.base64.encode(message.oneTimePrekey[j], 0, message.oneTimePrekey[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.oneTimePrekey[j]) : message.oneTimePrekey[j];
            }
            return object;
        };
    
        /**
         * Converts this PreKeyBundle to JSON.
         * @function toJSON
         * @memberof PreKeyBundle
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PreKeyBundle.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for PreKeyBundle
         * @function getTypeUrl
         * @memberof PreKeyBundle
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PreKeyBundle.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/PreKeyBundle";
        };
    
        return PreKeyBundle;
    })();
    
    $root.KeyPair = (function() {
    
        /**
         * Properties of a KeyPair.
         * @exports IKeyPair
         * @interface IKeyPair
         * @property {Uint8Array|null} [publicKey] KeyPair publicKey
         * @property {Uint8Array|null} [privateKey] KeyPair privateKey
         */
    
        /**
         * Constructs a new KeyPair.
         * @exports KeyPair
         * @classdesc Represents a KeyPair.
         * @implements IKeyPair
         * @constructor
         * @param {IKeyPair=} [properties] Properties to set
         */
        function KeyPair(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * KeyPair publicKey.
         * @member {Uint8Array} publicKey
         * @memberof KeyPair
         * @instance
         */
        KeyPair.prototype.publicKey = $util.newBuffer([]);
    
        /**
         * KeyPair privateKey.
         * @member {Uint8Array} privateKey
         * @memberof KeyPair
         * @instance
         */
        KeyPair.prototype.privateKey = $util.newBuffer([]);
    
        /**
         * Creates a new KeyPair instance using the specified properties.
         * @function create
         * @memberof KeyPair
         * @static
         * @param {IKeyPair=} [properties] Properties to set
         * @returns {KeyPair} KeyPair instance
         */
        KeyPair.create = function create(properties) {
            return new KeyPair(properties);
        };
    
        /**
         * Encodes the specified KeyPair message. Does not implicitly {@link KeyPair.verify|verify} messages.
         * @function encode
         * @memberof KeyPair
         * @static
         * @param {IKeyPair} message KeyPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        KeyPair.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.publicKey != null && Object.hasOwnProperty.call(message, "publicKey"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.publicKey);
            if (message.privateKey != null && Object.hasOwnProperty.call(message, "privateKey"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.privateKey);
            return writer;
        };
    
        /**
         * Encodes the specified KeyPair message, length delimited. Does not implicitly {@link KeyPair.verify|verify} messages.
         * @function encodeDelimited
         * @memberof KeyPair
         * @static
         * @param {IKeyPair} message KeyPair message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        KeyPair.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a KeyPair message from the specified reader or buffer.
         * @function decode
         * @memberof KeyPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {KeyPair} KeyPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        KeyPair.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.KeyPair();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.publicKey = reader.bytes();
                        break;
                    }
                case 2: {
                        message.privateKey = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes a KeyPair message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof KeyPair
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {KeyPair} KeyPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        KeyPair.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a KeyPair message.
         * @function verify
         * @memberof KeyPair
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        KeyPair.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                if (!(message.publicKey && typeof message.publicKey.length === "number" || $util.isString(message.publicKey)))
                    return "publicKey: buffer expected";
            if (message.privateKey != null && message.hasOwnProperty("privateKey"))
                if (!(message.privateKey && typeof message.privateKey.length === "number" || $util.isString(message.privateKey)))
                    return "privateKey: buffer expected";
            return null;
        };
    
        /**
         * Creates a KeyPair message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof KeyPair
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {KeyPair} KeyPair
         */
        KeyPair.fromObject = function fromObject(object) {
            if (object instanceof $root.KeyPair)
                return object;
            var message = new $root.KeyPair();
            if (object.publicKey != null)
                if (typeof object.publicKey === "string")
                    $util.base64.decode(object.publicKey, message.publicKey = $util.newBuffer($util.base64.length(object.publicKey)), 0);
                else if (object.publicKey.length >= 0)
                    message.publicKey = object.publicKey;
            if (object.privateKey != null)
                if (typeof object.privateKey === "string")
                    $util.base64.decode(object.privateKey, message.privateKey = $util.newBuffer($util.base64.length(object.privateKey)), 0);
                else if (object.privateKey.length >= 0)
                    message.privateKey = object.privateKey;
            return message;
        };
    
        /**
         * Creates a plain object from a KeyPair message. Also converts values to other types if specified.
         * @function toObject
         * @memberof KeyPair
         * @static
         * @param {KeyPair} message KeyPair
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        KeyPair.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.publicKey = "";
                else {
                    object.publicKey = [];
                    if (options.bytes !== Array)
                        object.publicKey = $util.newBuffer(object.publicKey);
                }
                if (options.bytes === String)
                    object.privateKey = "";
                else {
                    object.privateKey = [];
                    if (options.bytes !== Array)
                        object.privateKey = $util.newBuffer(object.privateKey);
                }
            }
            if (message.publicKey != null && message.hasOwnProperty("publicKey"))
                object.publicKey = options.bytes === String ? $util.base64.encode(message.publicKey, 0, message.publicKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.publicKey) : message.publicKey;
            if (message.privateKey != null && message.hasOwnProperty("privateKey"))
                object.privateKey = options.bytes === String ? $util.base64.encode(message.privateKey, 0, message.privateKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.privateKey) : message.privateKey;
            return object;
        };
    
        /**
         * Converts this KeyPair to JSON.
         * @function toJSON
         * @memberof KeyPair
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        KeyPair.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for KeyPair
         * @function getTypeUrl
         * @memberof KeyPair
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        KeyPair.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/KeyPair";
        };
    
        return KeyPair;
    })();
    
    $root.Identity = (function() {
    
        /**
         * Properties of an Identity.
         * @exports IIdentity
         * @interface IIdentity
         * @property {string|null} [userId] Identity userId
         * @property {IKeyPair|null} [identityKey] Identity identityKey
         * @property {IKeyPair|null} [signedPrekey] Identity signedPrekey
         * @property {number|Long|null} [signedPrekeyExpiration] Identity signedPrekeyExpiration
         * @property {Array.<IKeyPair>|null} [oneTimePrekey] Identity oneTimePrekey
         */
    
        /**
         * Constructs a new Identity.
         * @exports Identity
         * @classdesc Represents an Identity.
         * @implements IIdentity
         * @constructor
         * @param {IIdentity=} [properties] Properties to set
         */
        function Identity(properties) {
            this.oneTimePrekey = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * Identity userId.
         * @member {string} userId
         * @memberof Identity
         * @instance
         */
        Identity.prototype.userId = "";
    
        /**
         * Identity identityKey.
         * @member {IKeyPair|null|undefined} identityKey
         * @memberof Identity
         * @instance
         */
        Identity.prototype.identityKey = null;
    
        /**
         * Identity signedPrekey.
         * @member {IKeyPair|null|undefined} signedPrekey
         * @memberof Identity
         * @instance
         */
        Identity.prototype.signedPrekey = null;
    
        /**
         * Identity signedPrekeyExpiration.
         * @member {number|Long} signedPrekeyExpiration
         * @memberof Identity
         * @instance
         */
        Identity.prototype.signedPrekeyExpiration = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
        /**
         * Identity oneTimePrekey.
         * @member {Array.<IKeyPair>} oneTimePrekey
         * @memberof Identity
         * @instance
         */
        Identity.prototype.oneTimePrekey = $util.emptyArray;
    
        /**
         * Creates a new Identity instance using the specified properties.
         * @function create
         * @memberof Identity
         * @static
         * @param {IIdentity=} [properties] Properties to set
         * @returns {Identity} Identity instance
         */
        Identity.create = function create(properties) {
            return new Identity(properties);
        };
    
        /**
         * Encodes the specified Identity message. Does not implicitly {@link Identity.verify|verify} messages.
         * @function encode
         * @memberof Identity
         * @static
         * @param {IIdentity} message Identity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Identity.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.userId);
            if (message.identityKey != null && Object.hasOwnProperty.call(message, "identityKey"))
                $root.KeyPair.encode(message.identityKey, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.signedPrekey != null && Object.hasOwnProperty.call(message, "signedPrekey"))
                $root.KeyPair.encode(message.signedPrekey, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.signedPrekeyExpiration != null && Object.hasOwnProperty.call(message, "signedPrekeyExpiration"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.signedPrekeyExpiration);
            if (message.oneTimePrekey != null && message.oneTimePrekey.length)
                for (var i = 0; i < message.oneTimePrekey.length; ++i)
                    $root.KeyPair.encode(message.oneTimePrekey[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            return writer;
        };
    
        /**
         * Encodes the specified Identity message, length delimited. Does not implicitly {@link Identity.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Identity
         * @static
         * @param {IIdentity} message Identity message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Identity.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes an Identity message from the specified reader or buffer.
         * @function decode
         * @memberof Identity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Identity} Identity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Identity.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Identity();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.userId = reader.string();
                        break;
                    }
                case 2: {
                        message.identityKey = $root.KeyPair.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.signedPrekey = $root.KeyPair.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.signedPrekeyExpiration = reader.uint64();
                        break;
                    }
                case 5: {
                        if (!(message.oneTimePrekey && message.oneTimePrekey.length))
                            message.oneTimePrekey = [];
                        message.oneTimePrekey.push($root.KeyPair.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };
    
        /**
         * Decodes an Identity message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Identity
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Identity} Identity
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Identity.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies an Identity message.
         * @function verify
         * @memberof Identity
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Identity.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isString(message.userId))
                    return "userId: string expected";
            if (message.identityKey != null && message.hasOwnProperty("identityKey")) {
                var error = $root.KeyPair.verify(message.identityKey);
                if (error)
                    return "identityKey." + error;
            }
            if (message.signedPrekey != null && message.hasOwnProperty("signedPrekey")) {
                var error = $root.KeyPair.verify(message.signedPrekey);
                if (error)
                    return "signedPrekey." + error;
            }
            if (message.signedPrekeyExpiration != null && message.hasOwnProperty("signedPrekeyExpiration"))
                if (!$util.isInteger(message.signedPrekeyExpiration) && !(message.signedPrekeyExpiration && $util.isInteger(message.signedPrekeyExpiration.low) && $util.isInteger(message.signedPrekeyExpiration.high)))
                    return "signedPrekeyExpiration: integer|Long expected";
            if (message.oneTimePrekey != null && message.hasOwnProperty("oneTimePrekey")) {
                if (!Array.isArray(message.oneTimePrekey))
                    return "oneTimePrekey: array expected";
                for (var i = 0; i < message.oneTimePrekey.length; ++i) {
                    var error = $root.KeyPair.verify(message.oneTimePrekey[i]);
                    if (error)
                        return "oneTimePrekey." + error;
                }
            }
            return null;
        };
    
        /**
         * Creates an Identity message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof Identity
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {Identity} Identity
         */
        Identity.fromObject = function fromObject(object) {
            if (object instanceof $root.Identity)
                return object;
            var message = new $root.Identity();
            if (object.userId != null)
                message.userId = String(object.userId);
            if (object.identityKey != null) {
                if (typeof object.identityKey !== "object")
                    throw TypeError(".Identity.identityKey: object expected");
                message.identityKey = $root.KeyPair.fromObject(object.identityKey);
            }
            if (object.signedPrekey != null) {
                if (typeof object.signedPrekey !== "object")
                    throw TypeError(".Identity.signedPrekey: object expected");
                message.signedPrekey = $root.KeyPair.fromObject(object.signedPrekey);
            }
            if (object.signedPrekeyExpiration != null)
                if ($util.Long)
                    (message.signedPrekeyExpiration = $util.Long.fromValue(object.signedPrekeyExpiration)).unsigned = true;
                else if (typeof object.signedPrekeyExpiration === "string")
                    message.signedPrekeyExpiration = parseInt(object.signedPrekeyExpiration, 10);
                else if (typeof object.signedPrekeyExpiration === "number")
                    message.signedPrekeyExpiration = object.signedPrekeyExpiration;
                else if (typeof object.signedPrekeyExpiration === "object")
                    message.signedPrekeyExpiration = new $util.LongBits(object.signedPrekeyExpiration.low >>> 0, object.signedPrekeyExpiration.high >>> 0).toNumber(true);
            if (object.oneTimePrekey) {
                if (!Array.isArray(object.oneTimePrekey))
                    throw TypeError(".Identity.oneTimePrekey: array expected");
                message.oneTimePrekey = [];
                for (var i = 0; i < object.oneTimePrekey.length; ++i) {
                    if (typeof object.oneTimePrekey[i] !== "object")
                        throw TypeError(".Identity.oneTimePrekey: object expected");
                    message.oneTimePrekey[i] = $root.KeyPair.fromObject(object.oneTimePrekey[i]);
                }
            }
            return message;
        };
    
        /**
         * Creates a plain object from an Identity message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Identity
         * @static
         * @param {Identity} message Identity
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Identity.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.oneTimePrekey = [];
            if (options.defaults) {
                object.userId = "";
                object.identityKey = null;
                object.signedPrekey = null;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.signedPrekeyExpiration = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.signedPrekeyExpiration = options.longs === String ? "0" : 0;
            }
            if (message.userId != null && message.hasOwnProperty("userId"))
                object.userId = message.userId;
            if (message.identityKey != null && message.hasOwnProperty("identityKey"))
                object.identityKey = $root.KeyPair.toObject(message.identityKey, options);
            if (message.signedPrekey != null && message.hasOwnProperty("signedPrekey"))
                object.signedPrekey = $root.KeyPair.toObject(message.signedPrekey, options);
            if (message.signedPrekeyExpiration != null && message.hasOwnProperty("signedPrekeyExpiration"))
                if (typeof message.signedPrekeyExpiration === "number")
                    object.signedPrekeyExpiration = options.longs === String ? String(message.signedPrekeyExpiration) : message.signedPrekeyExpiration;
                else
                    object.signedPrekeyExpiration = options.longs === String ? $util.Long.prototype.toString.call(message.signedPrekeyExpiration) : options.longs === Number ? new $util.LongBits(message.signedPrekeyExpiration.low >>> 0, message.signedPrekeyExpiration.high >>> 0).toNumber(true) : message.signedPrekeyExpiration;
            if (message.oneTimePrekey && message.oneTimePrekey.length) {
                object.oneTimePrekey = [];
                for (var j = 0; j < message.oneTimePrekey.length; ++j)
                    object.oneTimePrekey[j] = $root.KeyPair.toObject(message.oneTimePrekey[j], options);
            }
            return object;
        };
    
        /**
         * Converts this Identity to JSON.
         * @function toJSON
         * @memberof Identity
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Identity.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for Identity
         * @function getTypeUrl
         * @memberof Identity
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Identity.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/Identity";
        };
    
        return Identity;
    })();

    return $root;
});
