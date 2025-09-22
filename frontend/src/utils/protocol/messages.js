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
    
    /**
     * MessageType enum.
     * @exports MessageType
     * @enum {number}
     * @property {number} JOINED=0 JOINED value
     * @property {number} CHAT=1 CHAT value
     * @property {number} LEFT=2 LEFT value
     */
    $root.MessageType = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "JOINED"] = 0;
        values[valuesById[1] = "CHAT"] = 1;
        values[valuesById[2] = "LEFT"] = 2;
        return values;
    })();
    
    $root.MessageContents = (function() {
    
        /**
         * Properties of a MessageContents.
         * @exports IMessageContents
         * @interface IMessageContents
         * @property {string|null} [text] MessageContents text
         * @property {string|null} [fileId] MessageContents fileId
         * @property {Uint8Array|null} [fileIv] MessageContents fileIv
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
    
        /**
         * MessageContents fileIv.
         * @member {Uint8Array|null|undefined} fileIv
         * @memberof MessageContents
         * @instance
         */
        MessageContents.prototype.fileIv = null;
    
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
         * MessageContents _fileIv.
         * @member {"fileIv"|undefined} _fileIv
         * @memberof MessageContents
         * @instance
         */
        Object.defineProperty(MessageContents.prototype, "_fileIv", {
            get: $util.oneOfGetter($oneOfFields = ["fileIv"]),
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
            if (message.fileIv != null && Object.hasOwnProperty.call(message, "fileIv"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.fileIv);
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
                case 3: {
                        message.fileIv = reader.bytes();
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
            if (message.fileIv != null && message.hasOwnProperty("fileIv")) {
                properties._fileIv = 1;
                if (!(message.fileIv && typeof message.fileIv.length === "number" || $util.isString(message.fileIv)))
                    return "fileIv: buffer expected";
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
            if (object.fileIv != null)
                if (typeof object.fileIv === "string")
                    $util.base64.decode(object.fileIv, message.fileIv = $util.newBuffer($util.base64.length(object.fileIv)), 0);
                else if (object.fileIv.length >= 0)
                    message.fileIv = object.fileIv;
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
            if (message.fileIv != null && message.hasOwnProperty("fileIv")) {
                object.fileIv = options.bytes === String ? $util.base64.encode(message.fileIv, 0, message.fileIv.length) : options.bytes === Array ? Array.prototype.slice.call(message.fileIv) : message.fileIv;
                if (options.oneofs)
                    object._fileIv = "fileIv";
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
    
    $root.MessageHeader = (function() {
    
        /**
         * Properties of a MessageHeader.
         * @exports IMessageHeader
         * @interface IMessageHeader
         * @property {MessageType|null} [type] MessageHeader type
         * @property {Uint8Array|null} [ratchetPublicKey] MessageHeader ratchetPublicKey
         * @property {number|null} [messageCount] MessageHeader messageCount
         * @property {number|null} [prevCount] MessageHeader prevCount
         * @property {Uint8Array|null} [messageIv] MessageHeader messageIv
         * @property {string|null} [senderId] MessageHeader senderId
         * @property {Uint8Array|null} [ephemeralKey] MessageHeader ephemeralKey
         * @property {Uint8Array|null} [oneTimePrekey] MessageHeader oneTimePrekey
         */
    
        /**
         * Constructs a new MessageHeader.
         * @exports MessageHeader
         * @classdesc Represents a MessageHeader.
         * @implements IMessageHeader
         * @constructor
         * @param {IMessageHeader=} [properties] Properties to set
         */
        function MessageHeader(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * MessageHeader type.
         * @member {MessageType} type
         * @memberof MessageHeader
         * @instance
         */
        MessageHeader.prototype.type = 0;
    
        /**
         * MessageHeader ratchetPublicKey.
         * @member {Uint8Array|null|undefined} ratchetPublicKey
         * @memberof MessageHeader
         * @instance
         */
        MessageHeader.prototype.ratchetPublicKey = null;
    
        /**
         * MessageHeader messageCount.
         * @member {number} messageCount
         * @memberof MessageHeader
         * @instance
         */
        MessageHeader.prototype.messageCount = 0;
    
        /**
         * MessageHeader prevCount.
         * @member {number} prevCount
         * @memberof MessageHeader
         * @instance
         */
        MessageHeader.prototype.prevCount = 0;
    
        /**
         * MessageHeader messageIv.
         * @member {Uint8Array} messageIv
         * @memberof MessageHeader
         * @instance
         */
        MessageHeader.prototype.messageIv = $util.newBuffer([]);
    
        /**
         * MessageHeader senderId.
         * @member {string|null|undefined} senderId
         * @memberof MessageHeader
         * @instance
         */
        MessageHeader.prototype.senderId = null;
    
        /**
         * MessageHeader ephemeralKey.
         * @member {Uint8Array|null|undefined} ephemeralKey
         * @memberof MessageHeader
         * @instance
         */
        MessageHeader.prototype.ephemeralKey = null;
    
        /**
         * MessageHeader oneTimePrekey.
         * @member {Uint8Array|null|undefined} oneTimePrekey
         * @memberof MessageHeader
         * @instance
         */
        MessageHeader.prototype.oneTimePrekey = null;
    
        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;
    
        /**
         * MessageHeader _ratchetPublicKey.
         * @member {"ratchetPublicKey"|undefined} _ratchetPublicKey
         * @memberof MessageHeader
         * @instance
         */
        Object.defineProperty(MessageHeader.prototype, "_ratchetPublicKey", {
            get: $util.oneOfGetter($oneOfFields = ["ratchetPublicKey"]),
            set: $util.oneOfSetter($oneOfFields)
        });
    
        /**
         * MessageHeader _senderId.
         * @member {"senderId"|undefined} _senderId
         * @memberof MessageHeader
         * @instance
         */
        Object.defineProperty(MessageHeader.prototype, "_senderId", {
            get: $util.oneOfGetter($oneOfFields = ["senderId"]),
            set: $util.oneOfSetter($oneOfFields)
        });
    
        /**
         * MessageHeader _ephemeralKey.
         * @member {"ephemeralKey"|undefined} _ephemeralKey
         * @memberof MessageHeader
         * @instance
         */
        Object.defineProperty(MessageHeader.prototype, "_ephemeralKey", {
            get: $util.oneOfGetter($oneOfFields = ["ephemeralKey"]),
            set: $util.oneOfSetter($oneOfFields)
        });
    
        /**
         * MessageHeader _oneTimePrekey.
         * @member {"oneTimePrekey"|undefined} _oneTimePrekey
         * @memberof MessageHeader
         * @instance
         */
        Object.defineProperty(MessageHeader.prototype, "_oneTimePrekey", {
            get: $util.oneOfGetter($oneOfFields = ["oneTimePrekey"]),
            set: $util.oneOfSetter($oneOfFields)
        });
    
        /**
         * Creates a new MessageHeader instance using the specified properties.
         * @function create
         * @memberof MessageHeader
         * @static
         * @param {IMessageHeader=} [properties] Properties to set
         * @returns {MessageHeader} MessageHeader instance
         */
        MessageHeader.create = function create(properties) {
            return new MessageHeader(properties);
        };
    
        /**
         * Encodes the specified MessageHeader message. Does not implicitly {@link MessageHeader.verify|verify} messages.
         * @function encode
         * @memberof MessageHeader
         * @static
         * @param {IMessageHeader} message MessageHeader message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageHeader.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
            if (message.ratchetPublicKey != null && Object.hasOwnProperty.call(message, "ratchetPublicKey"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.ratchetPublicKey);
            if (message.messageCount != null && Object.hasOwnProperty.call(message, "messageCount"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.messageCount);
            if (message.prevCount != null && Object.hasOwnProperty.call(message, "prevCount"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.prevCount);
            if (message.messageIv != null && Object.hasOwnProperty.call(message, "messageIv"))
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.messageIv);
            if (message.senderId != null && Object.hasOwnProperty.call(message, "senderId"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.senderId);
            if (message.ephemeralKey != null && Object.hasOwnProperty.call(message, "ephemeralKey"))
                writer.uint32(/* id 7, wireType 2 =*/58).bytes(message.ephemeralKey);
            if (message.oneTimePrekey != null && Object.hasOwnProperty.call(message, "oneTimePrekey"))
                writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.oneTimePrekey);
            return writer;
        };
    
        /**
         * Encodes the specified MessageHeader message, length delimited. Does not implicitly {@link MessageHeader.verify|verify} messages.
         * @function encodeDelimited
         * @memberof MessageHeader
         * @static
         * @param {IMessageHeader} message MessageHeader message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageHeader.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a MessageHeader message from the specified reader or buffer.
         * @function decode
         * @memberof MessageHeader
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {MessageHeader} MessageHeader
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageHeader.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.MessageHeader();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.int32();
                        break;
                    }
                case 2: {
                        message.ratchetPublicKey = reader.bytes();
                        break;
                    }
                case 3: {
                        message.messageCount = reader.uint32();
                        break;
                    }
                case 4: {
                        message.prevCount = reader.uint32();
                        break;
                    }
                case 5: {
                        message.messageIv = reader.bytes();
                        break;
                    }
                case 6: {
                        message.senderId = reader.string();
                        break;
                    }
                case 7: {
                        message.ephemeralKey = reader.bytes();
                        break;
                    }
                case 8: {
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
         * Decodes a MessageHeader message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof MessageHeader
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {MessageHeader} MessageHeader
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageHeader.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a MessageHeader message.
         * @function verify
         * @memberof MessageHeader
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageHeader.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.type != null && message.hasOwnProperty("type"))
                switch (message.type) {
                default:
                    return "type: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.ratchetPublicKey != null && message.hasOwnProperty("ratchetPublicKey")) {
                properties._ratchetPublicKey = 1;
                if (!(message.ratchetPublicKey && typeof message.ratchetPublicKey.length === "number" || $util.isString(message.ratchetPublicKey)))
                    return "ratchetPublicKey: buffer expected";
            }
            if (message.messageCount != null && message.hasOwnProperty("messageCount"))
                if (!$util.isInteger(message.messageCount))
                    return "messageCount: integer expected";
            if (message.prevCount != null && message.hasOwnProperty("prevCount"))
                if (!$util.isInteger(message.prevCount))
                    return "prevCount: integer expected";
            if (message.messageIv != null && message.hasOwnProperty("messageIv"))
                if (!(message.messageIv && typeof message.messageIv.length === "number" || $util.isString(message.messageIv)))
                    return "messageIv: buffer expected";
            if (message.senderId != null && message.hasOwnProperty("senderId")) {
                properties._senderId = 1;
                if (!$util.isString(message.senderId))
                    return "senderId: string expected";
            }
            if (message.ephemeralKey != null && message.hasOwnProperty("ephemeralKey")) {
                properties._ephemeralKey = 1;
                if (!(message.ephemeralKey && typeof message.ephemeralKey.length === "number" || $util.isString(message.ephemeralKey)))
                    return "ephemeralKey: buffer expected";
            }
            if (message.oneTimePrekey != null && message.hasOwnProperty("oneTimePrekey")) {
                properties._oneTimePrekey = 1;
                if (!(message.oneTimePrekey && typeof message.oneTimePrekey.length === "number" || $util.isString(message.oneTimePrekey)))
                    return "oneTimePrekey: buffer expected";
            }
            return null;
        };
    
        /**
         * Creates a MessageHeader message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof MessageHeader
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {MessageHeader} MessageHeader
         */
        MessageHeader.fromObject = function fromObject(object) {
            if (object instanceof $root.MessageHeader)
                return object;
            var message = new $root.MessageHeader();
            switch (object.type) {
            default:
                if (typeof object.type === "number") {
                    message.type = object.type;
                    break;
                }
                break;
            case "JOINED":
            case 0:
                message.type = 0;
                break;
            case "CHAT":
            case 1:
                message.type = 1;
                break;
            case "LEFT":
            case 2:
                message.type = 2;
                break;
            }
            if (object.ratchetPublicKey != null)
                if (typeof object.ratchetPublicKey === "string")
                    $util.base64.decode(object.ratchetPublicKey, message.ratchetPublicKey = $util.newBuffer($util.base64.length(object.ratchetPublicKey)), 0);
                else if (object.ratchetPublicKey.length >= 0)
                    message.ratchetPublicKey = object.ratchetPublicKey;
            if (object.messageCount != null)
                message.messageCount = object.messageCount >>> 0;
            if (object.prevCount != null)
                message.prevCount = object.prevCount >>> 0;
            if (object.messageIv != null)
                if (typeof object.messageIv === "string")
                    $util.base64.decode(object.messageIv, message.messageIv = $util.newBuffer($util.base64.length(object.messageIv)), 0);
                else if (object.messageIv.length >= 0)
                    message.messageIv = object.messageIv;
            if (object.senderId != null)
                message.senderId = String(object.senderId);
            if (object.ephemeralKey != null)
                if (typeof object.ephemeralKey === "string")
                    $util.base64.decode(object.ephemeralKey, message.ephemeralKey = $util.newBuffer($util.base64.length(object.ephemeralKey)), 0);
                else if (object.ephemeralKey.length >= 0)
                    message.ephemeralKey = object.ephemeralKey;
            if (object.oneTimePrekey != null)
                if (typeof object.oneTimePrekey === "string")
                    $util.base64.decode(object.oneTimePrekey, message.oneTimePrekey = $util.newBuffer($util.base64.length(object.oneTimePrekey)), 0);
                else if (object.oneTimePrekey.length >= 0)
                    message.oneTimePrekey = object.oneTimePrekey;
            return message;
        };
    
        /**
         * Creates a plain object from a MessageHeader message. Also converts values to other types if specified.
         * @function toObject
         * @memberof MessageHeader
         * @static
         * @param {MessageHeader} message MessageHeader
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageHeader.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.type = options.enums === String ? "JOINED" : 0;
                object.messageCount = 0;
                object.prevCount = 0;
                if (options.bytes === String)
                    object.messageIv = "";
                else {
                    object.messageIv = [];
                    if (options.bytes !== Array)
                        object.messageIv = $util.newBuffer(object.messageIv);
                }
            }
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = options.enums === String ? $root.MessageType[message.type] === undefined ? message.type : $root.MessageType[message.type] : message.type;
            if (message.ratchetPublicKey != null && message.hasOwnProperty("ratchetPublicKey")) {
                object.ratchetPublicKey = options.bytes === String ? $util.base64.encode(message.ratchetPublicKey, 0, message.ratchetPublicKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.ratchetPublicKey) : message.ratchetPublicKey;
                if (options.oneofs)
                    object._ratchetPublicKey = "ratchetPublicKey";
            }
            if (message.messageCount != null && message.hasOwnProperty("messageCount"))
                object.messageCount = message.messageCount;
            if (message.prevCount != null && message.hasOwnProperty("prevCount"))
                object.prevCount = message.prevCount;
            if (message.messageIv != null && message.hasOwnProperty("messageIv"))
                object.messageIv = options.bytes === String ? $util.base64.encode(message.messageIv, 0, message.messageIv.length) : options.bytes === Array ? Array.prototype.slice.call(message.messageIv) : message.messageIv;
            if (message.senderId != null && message.hasOwnProperty("senderId")) {
                object.senderId = message.senderId;
                if (options.oneofs)
                    object._senderId = "senderId";
            }
            if (message.ephemeralKey != null && message.hasOwnProperty("ephemeralKey")) {
                object.ephemeralKey = options.bytes === String ? $util.base64.encode(message.ephemeralKey, 0, message.ephemeralKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.ephemeralKey) : message.ephemeralKey;
                if (options.oneofs)
                    object._ephemeralKey = "ephemeralKey";
            }
            if (message.oneTimePrekey != null && message.hasOwnProperty("oneTimePrekey")) {
                object.oneTimePrekey = options.bytes === String ? $util.base64.encode(message.oneTimePrekey, 0, message.oneTimePrekey.length) : options.bytes === Array ? Array.prototype.slice.call(message.oneTimePrekey) : message.oneTimePrekey;
                if (options.oneofs)
                    object._oneTimePrekey = "oneTimePrekey";
            }
            return object;
        };
    
        /**
         * Converts this MessageHeader to JSON.
         * @function toJSON
         * @memberof MessageHeader
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageHeader.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for MessageHeader
         * @function getTypeUrl
         * @memberof MessageHeader
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MessageHeader.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/MessageHeader";
        };
    
        return MessageHeader;
    })();
    
    $root.ChatMessage = (function() {
    
        /**
         * Properties of a ChatMessage.
         * @exports IChatMessage
         * @interface IChatMessage
         * @property {string|null} [chatId] ChatMessage chatId
         * @property {IMessageHeader|null} [messageHeader] ChatMessage messageHeader
         * @property {Uint8Array|null} [messageContentsEncrypted] ChatMessage messageContentsEncrypted
         * @property {number|Long|null} [timestamp] ChatMessage timestamp
         * @property {Uint8Array|null} [headerIv] ChatMessage headerIv
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
         * ChatMessage chatId.
         * @member {string} chatId
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.chatId = "";
    
        /**
         * ChatMessage messageHeader.
         * @member {IMessageHeader|null|undefined} messageHeader
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.messageHeader = null;
    
        /**
         * ChatMessage messageContentsEncrypted.
         * @member {Uint8Array} messageContentsEncrypted
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.messageContentsEncrypted = $util.newBuffer([]);
    
        /**
         * ChatMessage timestamp.
         * @member {number|Long} timestamp
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
        /**
         * ChatMessage headerIv.
         * @member {Uint8Array|null|undefined} headerIv
         * @memberof ChatMessage
         * @instance
         */
        ChatMessage.prototype.headerIv = null;
    
        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;
    
        /**
         * ChatMessage _headerIv.
         * @member {"headerIv"|undefined} _headerIv
         * @memberof ChatMessage
         * @instance
         */
        Object.defineProperty(ChatMessage.prototype, "_headerIv", {
            get: $util.oneOfGetter($oneOfFields = ["headerIv"]),
            set: $util.oneOfSetter($oneOfFields)
        });
    
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
            if (message.chatId != null && Object.hasOwnProperty.call(message, "chatId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.chatId);
            if (message.messageHeader != null && Object.hasOwnProperty.call(message, "messageHeader"))
                $root.MessageHeader.encode(message.messageHeader, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.messageContentsEncrypted != null && Object.hasOwnProperty.call(message, "messageContentsEncrypted"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.messageContentsEncrypted);
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.timestamp);
            if (message.headerIv != null && Object.hasOwnProperty.call(message, "headerIv"))
                writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.headerIv);
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
                case 2: {
                        message.chatId = reader.string();
                        break;
                    }
                case 3: {
                        message.messageHeader = $root.MessageHeader.decode(reader, reader.uint32());
                        break;
                    }
                case 4: {
                        message.messageContentsEncrypted = reader.bytes();
                        break;
                    }
                case 5: {
                        message.timestamp = reader.uint64();
                        break;
                    }
                case 6: {
                        message.headerIv = reader.bytes();
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
            var properties = {};
            if (message.chatId != null && message.hasOwnProperty("chatId"))
                if (!$util.isString(message.chatId))
                    return "chatId: string expected";
            if (message.messageHeader != null && message.hasOwnProperty("messageHeader")) {
                var error = $root.MessageHeader.verify(message.messageHeader);
                if (error)
                    return "messageHeader." + error;
            }
            if (message.messageContentsEncrypted != null && message.hasOwnProperty("messageContentsEncrypted"))
                if (!(message.messageContentsEncrypted && typeof message.messageContentsEncrypted.length === "number" || $util.isString(message.messageContentsEncrypted)))
                    return "messageContentsEncrypted: buffer expected";
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                    return "timestamp: integer|Long expected";
            if (message.headerIv != null && message.hasOwnProperty("headerIv")) {
                properties._headerIv = 1;
                if (!(message.headerIv && typeof message.headerIv.length === "number" || $util.isString(message.headerIv)))
                    return "headerIv: buffer expected";
            }
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
            if (object.chatId != null)
                message.chatId = String(object.chatId);
            if (object.messageHeader != null) {
                if (typeof object.messageHeader !== "object")
                    throw TypeError(".ChatMessage.messageHeader: object expected");
                message.messageHeader = $root.MessageHeader.fromObject(object.messageHeader);
            }
            if (object.messageContentsEncrypted != null)
                if (typeof object.messageContentsEncrypted === "string")
                    $util.base64.decode(object.messageContentsEncrypted, message.messageContentsEncrypted = $util.newBuffer($util.base64.length(object.messageContentsEncrypted)), 0);
                else if (object.messageContentsEncrypted.length >= 0)
                    message.messageContentsEncrypted = object.messageContentsEncrypted;
            if (object.timestamp != null)
                if ($util.Long)
                    (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = true;
                else if (typeof object.timestamp === "string")
                    message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                    message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                    message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
            if (object.headerIv != null)
                if (typeof object.headerIv === "string")
                    $util.base64.decode(object.headerIv, message.headerIv = $util.newBuffer($util.base64.length(object.headerIv)), 0);
                else if (object.headerIv.length >= 0)
                    message.headerIv = object.headerIv;
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
                object.chatId = "";
                object.messageHeader = null;
                if (options.bytes === String)
                    object.messageContentsEncrypted = "";
                else {
                    object.messageContentsEncrypted = [];
                    if (options.bytes !== Array)
                        object.messageContentsEncrypted = $util.newBuffer(object.messageContentsEncrypted);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timestamp = options.longs === String ? "0" : 0;
            }
            if (message.chatId != null && message.hasOwnProperty("chatId"))
                object.chatId = message.chatId;
            if (message.messageHeader != null && message.hasOwnProperty("messageHeader"))
                object.messageHeader = $root.MessageHeader.toObject(message.messageHeader, options);
            if (message.messageContentsEncrypted != null && message.hasOwnProperty("messageContentsEncrypted"))
                object.messageContentsEncrypted = options.bytes === String ? $util.base64.encode(message.messageContentsEncrypted, 0, message.messageContentsEncrypted.length) : options.bytes === Array ? Array.prototype.slice.call(message.messageContentsEncrypted) : message.messageContentsEncrypted;
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (typeof message.timestamp === "number")
                    object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                    object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
            if (message.headerIv != null && message.hasOwnProperty("headerIv")) {
                object.headerIv = options.bytes === String ? $util.base64.encode(message.headerIv, 0, message.headerIv.length) : options.bytes === Array ? Array.prototype.slice.call(message.headerIv) : message.headerIv;
                if (options.oneofs)
                    object._headerIv = "headerIv";
            }
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
         * @property {string|null} [username] PreKeyBundle username
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
         * @member {string|null|undefined} id
         * @memberof PreKeyBundle
         * @instance
         */
        PreKeyBundle.prototype.id = null;
    
        /**
         * PreKeyBundle username.
         * @member {string|null|undefined} username
         * @memberof PreKeyBundle
         * @instance
         */
        PreKeyBundle.prototype.username = null;
    
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
    
        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;
    
        /**
         * PreKeyBundle _id.
         * @member {"id"|undefined} _id
         * @memberof PreKeyBundle
         * @instance
         */
        Object.defineProperty(PreKeyBundle.prototype, "_id", {
            get: $util.oneOfGetter($oneOfFields = ["id"]),
            set: $util.oneOfSetter($oneOfFields)
        });
    
        /**
         * PreKeyBundle _username.
         * @member {"username"|undefined} _username
         * @memberof PreKeyBundle
         * @instance
         */
        Object.defineProperty(PreKeyBundle.prototype, "_username", {
            get: $util.oneOfGetter($oneOfFields = ["username"]),
            set: $util.oneOfSetter($oneOfFields)
        });
    
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
            if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.username);
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
                case 6: {
                        message.username = reader.string();
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
            var properties = {};
            if (message.id != null && message.hasOwnProperty("id")) {
                properties._id = 1;
                if (!$util.isString(message.id))
                    return "id: string expected";
            }
            if (message.username != null && message.hasOwnProperty("username")) {
                properties._username = 1;
                if (!$util.isString(message.username))
                    return "username: string expected";
            }
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
            if (object.username != null)
                message.username = String(object.username);
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
            if (message.id != null && message.hasOwnProperty("id")) {
                object.id = message.id;
                if (options.oneofs)
                    object._id = "id";
            }
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
            if (message.username != null && message.hasOwnProperty("username")) {
                object.username = message.username;
                if (options.oneofs)
                    object._username = "username";
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
