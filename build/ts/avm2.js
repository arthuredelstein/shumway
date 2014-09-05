var Shumway;
(function (Shumway) {
  (function (AVM2) {
    AVM2.timelineBuffer = new Shumway.Tools.Profiler.TimelineBuffer("AVM2");
    AVM2.counter = new Shumway.Metrics.Counter(!release);

    function countTimeline(name, value) {
      if (typeof value === "undefined") { value = 1; }
      AVM2.timelineBuffer && AVM2.timelineBuffer.count(name, value);
    }
    AVM2.countTimeline = countTimeline;

    function enterTimeline(name, data) {
      profile && AVM2.timelineBuffer && AVM2.timelineBuffer.enter(name, data);
    }
    AVM2.enterTimeline = enterTimeline;

    function leaveTimeline(data) {
      profile && AVM2.timelineBuffer && AVM2.timelineBuffer.leave(null, data);
    }
    AVM2.leaveTimeline = leaveTimeline;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    AVM2.Errors = {
      CallOfNonFunctionError: { code: 1006, message: "%1 is not a function." },
      ConvertNullToObjectError: { code: 1009, message: "Cannot access a property or method of a null object reference." },
      ConvertUndefinedToObjectError: { code: 1010, message: "A term is undefined and has no properties." },
      ClassNotFoundError: { code: 1014, message: "Class %1 could not be found." },
      CheckTypeFailedError: { code: 1034, message: "Type Coercion failed: cannot convert %1 to %2." },
      WrongArgumentCountError: { code: 1063, message: "Argument count mismatch on %1. Expected %2, got %3." },
      XMLMarkupMustBeWellFormed: { code: 1088, message: "The markup in the document following the root element must be well-formed." },
      OutOfRangeError: { code: 1125, message: "The index %1 is out of range %2." },
      VectorFixedError: { code: 1126, message: "Cannot change the length of a fixed Vector." },
      InvalidRangeError: { code: 1506, message: "The specified range is invalid." },
      NullArgumentError: { code: 1507, message: "Argument %1 cannot be null." },
      InvalidArgumentError: { code: 1508, message: "The value specified for argument %1 is invalid." },
      InvalidParamError: { code: 2004, message: "One of the parameters is invalid." },
      ParamRangeError: { code: 2006, message: "The supplied index is out of bounds." },
      NullPointerError: { code: 2007, message: "Parameter %1 must be non-null." },
      InvalidEnumError: { code: 2008, message: "Parameter %1 must be one of the accepted values." },
      InvalidBitmapData: { code: 2015, message: "Invalid BitmapData." },
      CompressedDataError: { code: 2058, message: "There was an error decompressing the data." },
      TooFewArgumentsError: { code: 2001, message: "Too few arguments were specified; got %1, %2 expected." },
      SocketConnectError: { code: 2011, message: "Socket connection failed to %1:%2." },
      CantAddSelfError: { code: 2024, message: "An object cannot be added as a child of itself." },
      NotAChildError: { code: 2025, message: "The supplied DisplayObject must be a child of the caller." },
      ExternalInterfaceNotAvailableError: { code: 2067, message: "The ExternalInterface is not available in this container. ExternalInterface requires Internet Explorer ActiveX, Firefox, Mozilla 1.7.5 and greater, or other browsers that support NPRuntime." },
      InvalidStageMethodError: { code: 2071, message: "The Stage class does not implement this property or method." },
      SceneNotFoundError: { code: 2108, message: "Scene %1 was not found." },
      FrameLabelNotFoundError: { code: 2109, message: "Frame label %1 not found in scene %2." },
      CantAddParentError: { code: 2150, message: "An object cannot be added as a child to one of it's children (or children's children, etc.)." },
      ObjectWithStringsParamError: { code: 2196, message: "Parameter %1 must be an Object with only String values." }
    };

    function getErrorMessage(index) {
      if (!Shumway.AVM2.Runtime.debuggerMode.value) {
        return "Error #" + index;
      }
      for (var k in AVM2.Errors) {
        if (AVM2.Errors[k].code == index) {
          return "Error #" + index + ": " + AVM2.Errors[k].message;
        }
      }
      return "Error #" + index + ": (unknown)";
    }
    AVM2.getErrorMessage = getErrorMessage;

    function formatErrorMessage(error) {
      var args = [];
      for (var _i = 0; _i < (arguments.length - 1); _i++) {
        args[_i] = arguments[_i + 1];
      }
      var message = error.message;
      Array.prototype.slice.call(arguments, 1).forEach(function (x, i) {
        message = message.replace("%" + (i + 1), x);
      });
      return "Error #" + error.code + ": " + message;
    }
    AVM2.formatErrorMessage = formatErrorMessage;

    function translateErrorMessage(error) {
      if (error.type) {
        switch (error.type) {
          case "undefined_method":
            return formatErrorMessage(AVM2.Errors.CallOfNonFunctionError, "value");
          default:
            throw Shumway.Debug.notImplemented(error.type);
        }
      } else {
        if (error.message.indexOf("is not a function") >= 0) {
          return formatErrorMessage(AVM2.Errors.CallOfNonFunctionError, "value");
        }
        return error.message;
      }
    }
    AVM2.translateErrorMessage = translateErrorMessage;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var Errors = Shumway.AVM2.Errors;
var getErrorMessage = Shumway.AVM2.getErrorMessage;
var formatErrorMessage = Shumway.AVM2.formatErrorMessage;
var translateErrorMessage = Shumway.AVM2.translateErrorMessage;
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (ABC) {
      var textDecoder = null;
      if (typeof TextDecoder !== "undefined") {
        textDecoder = new TextDecoder();
      }

      var AbcStream = (function () {
        function AbcStream(bytes) {
          this._bytes = bytes;
          this._view = new DataView(bytes.buffer, bytes.byteOffset);
          this._position = 0;
        }
        AbcStream._getResultBuffer = function (length) {
          if (!AbcStream._resultBuffer || AbcStream._resultBuffer.length < length) {
            AbcStream._resultBuffer = new Int32Array(length * 2);
          }
          return AbcStream._resultBuffer;
        };

        Object.defineProperty(AbcStream.prototype, "position", {
          get: function () {
            return this._position;
          },
          enumerable: true,
          configurable: true
        });

        AbcStream.prototype.remaining = function () {
          return this._bytes.length - this._position;
        };

        AbcStream.prototype.seek = function (position) {
          this._position = position;
        };

        AbcStream.prototype.readU8 = function () {
          return this._bytes[this._position++];
        };

        AbcStream.prototype.readU8s = function (count) {
          var b = new Uint8Array(count);
          b.set(this._bytes.subarray(this._position, this._position + count), 0);
          this._position += count;
          return b;
        };

        AbcStream.prototype.readS8 = function () {
          return this._bytes[this._position++] << 24 >> 24;
        };

        AbcStream.prototype.readU32 = function () {
          return this.readS32() >>> 0;
        };

        AbcStream.prototype.readU30 = function () {
          var result = this.readU32();
          if (result & 0xc0000000) {
            return result;
          }
          return result;
        };

        AbcStream.prototype.readU30Unsafe = function () {
          return this.readU32();
        };

        AbcStream.prototype.readS16 = function () {
          return (this.readU30Unsafe() << 16) >> 16;
        };

        AbcStream.prototype.readS32 = function () {
          var result = this.readU8();
          if (result & 0x80) {
            result = result & 0x7f | this.readU8() << 7;
            if (result & 0x4000) {
              result = result & 0x3fff | this.readU8() << 14;
              if (result & 0x200000) {
                result = result & 0x1fffff | this.readU8() << 21;
                if (result & 0x10000000) {
                  result = result & 0x0fffffff | this.readU8() << 28;
                  result = result & 0xffffffff;
                }
              }
            }
          }
          return result;
        };

        AbcStream.prototype.readWord = function () {
          var result = this._view.getUint32(this._position, true);
          this._position += 4;
          return result;
        };

        AbcStream.prototype.readS24 = function () {
          var u = this.readU8() | (this.readU8() << 8) | (this.readU8() << 16);
          return (u << 8) >> 8;
        };

        AbcStream.prototype.readDouble = function () {
          var result = this._view.getFloat64(this._position, true);
          this._position += 8;
          return result;
        };

        AbcStream.prototype.readUTFString = function (length) {
          if (textDecoder) {
            var position = this._position;
            this._position += length;
            return textDecoder.decode(this._bytes.subarray(position, position + length));
          }

          var pos = this._position;
          var end = pos + length;
          var bytes = this._bytes;
          var i = 0;
          var result = AbcStream._getResultBuffer(length * 2);
          while (pos < end) {
            var c = bytes[pos++];
            if (c <= 0x7f) {
              result[i++] = c;
            } else if (c >= 0xc0) {
              var code = 0;
              if (c < 0xe0) {
                code = ((c & 0x1f) << 6) | (bytes[pos++] & 0x3f);
              } else if (c < 0xf0) {
                code = ((c & 0x0f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f);
              } else {
                code = (((c & 0x07) << 18) | ((bytes[pos++] & 0x3f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f)) - 0x10000;

                result[i++] = ((code & 0xffc00) >>> 10) + 0xd800;

                code = (code & 0x3ff) + 0xdc00;
              }
              result[i++] = code;
            }
          }
          this._position = pos;
          return Shumway.StringUtilities.fromCharCodeArray(result.subarray(0, i));
        };
        AbcStream._resultBuffer = new Int32Array(256);
        return AbcStream;
      })();
      ABC.AbcStream = AbcStream;
    })(AVM2.ABC || (AVM2.ABC = {}));
    var ABC = AVM2.ABC;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (ABC) {
      var isString = Shumway.isString;

      var isNumeric = Shumway.isNumeric;
      var isObject = Shumway.isObject;
      var assert = Shumway.Debug.assert;
      var notImplemented = Shumway.Debug.notImplemented;

      var Parameter = (function () {
        function Parameter(name, type, value, optional) {
          if (typeof optional === "undefined") { optional = false; }
          this.name = name;
          this.type = type;
          this.value = value;
          this.optional = optional;
        }
        return Parameter;
      })();
      ABC.Parameter = Parameter;

      var Trait = (function () {
        function Trait(abc, stream, holder) {
          var constantPool = abc.constantPool;
          var methods = abc.methods;
          var classes = abc.classes;
          var metadata = abc.metadata;

          this.holder = holder;
          this.name = constantPool.multinames[stream.readU30()];
          var tag = stream.readU8();

          this.kind = tag & 0x0F;
          this.attributes = (tag >> 4) & 0x0F;
          release || assert(Multiname.isQName(this.name), "Name must be a QName: " + this.name + ", kind: " + this.kind);

          switch (this.kind) {
            case 0 /* Slot */:
            case 6 /* Const */:
              this.slotId = stream.readU30();
              this.typeName = constantPool.multinames[stream.readU30()];
              var valueIndex = stream.readU30();
              this.value = undefined;
              if (valueIndex !== 0) {
                this.hasDefaultValue = true;
                this.value = constantPool.getValue(stream.readU8(), valueIndex);
              }
              break;
            case 1 /* Method */:
            case 3 /* Setter */:
            case 2 /* Getter */:
              this.dispId = stream.readU30();
              this.methodInfo = methods[stream.readU30()];
              this.methodInfo.name = this.name;

              AbcFile.attachHolder(this.methodInfo, this.holder);
              this.methodInfo.abc = abc;
              break;
            case 4 /* Class */:
              this.slotId = stream.readU30();
              release || assert(classes, "Classes should be passed down here, I'm guessing whenever classes are being parsed.");
              this.classInfo = classes[stream.readU30()];
              break;
            case 5 /* Function */:
              release || assert(false, "Function encountered in the wild, should not happen");
              break;
          }

          if (this.attributes & 4 /* Metadata */) {
            var traitMetadata;
            for (var i = 0, j = stream.readU30(); i < j; i++) {
              var md = metadata[stream.readU30()];
              if (md.name === "__go_to_definition_help" || md.name === "__go_to_ctor_definition_help") {
                continue;
              }
              if (!traitMetadata) {
                traitMetadata = {};
              }
              traitMetadata[md.name] = md;
            }
            if (traitMetadata) {
              if (this.isClass()) {
                this.classInfo.metadata = traitMetadata;
              }
              this.metadata = traitMetadata;
            }
          }
        }
        Trait.prototype.isSlot = function () {
          return this.kind === 0 /* Slot */;
        };

        Trait.prototype.isConst = function () {
          return this.kind === 6 /* Const */;
        };

        Trait.prototype.isMethod = function () {
          return this.kind === 1 /* Method */;
        };

        Trait.prototype.isClass = function () {
          return this.kind === 4 /* Class */;
        };

        Trait.prototype.isGetter = function () {
          return this.kind === 2 /* Getter */;
        };

        Trait.prototype.isSetter = function () {
          return this.kind === 3 /* Setter */;
        };

        Trait.prototype.isAccessor = function () {
          return this.isGetter() || this.isSetter();
        };

        Trait.prototype.isMethodOrAccessor = function () {
          return this.isMethod() || this.isGetter() || this.isSetter();
        };

        Trait.prototype.isProtected = function () {
          release || assert(Multiname.isQName(this.name));
          return this.name.namespaces[0].isProtected();
        };

        Trait.prototype.kindName = function () {
          switch (this.kind) {
            case 0 /* Slot */:
              return "Slot";
            case 6 /* Const */:
              return "Const";
            case 1 /* Method */:
              return "Method";
            case 3 /* Setter */:
              return "Setter";
            case 2 /* Getter */:
              return "Getter";
            case 4 /* Class */:
              return "Class";
            case 5 /* Function */:
              return "Function";
          }
          Shumway.Debug.unexpected();
        };

        Trait.prototype.isOverride = function () {
          return this.attributes & 2 /* Override */;
        };

        Trait.prototype.isFinal = function () {
          return this.attributes & 1 /* Final */;
        };

        Trait.prototype.toString = function () {
          var str = Shumway.IntegerUtilities.getFlags(this.attributes, "final|override|metadata".split("|"));
          if (str) {
            str += " ";
          }
          str += Multiname.getQualifiedName(this.name);
          switch (this.kind) {
            case 0 /* Slot */:
            case 6 /* Const */:
              return str + ", typeName: " + this.typeName + ", slotId: " + this.slotId + ", value: " + this.value;
            case 1 /* Method */:
            case 3 /* Setter */:
            case 2 /* Getter */:
              return str + ", " + this.kindName() + ": " + this.methodInfo.name;
            case 4 /* Class */:
              return str + ", slotId: " + this.slotId + ", class: " + this.classInfo;
            case 5 /* Function */:
              break;
          }
        };

        Trait.parseTraits = function (abc, stream, holder) {
          var count = stream.readU30();
          var traits = [];
          for (var i = 0; i < count; i++) {
            traits.push(new Trait(abc, stream, holder));
          }
          return traits;
        };
        return Trait;
      })();
      ABC.Trait = Trait;

      var Info = (function () {
        function Info(abc, index, hash) {
          this.abc = abc;
          this.index = index;
          this.hash = abc.hash & 65535 /* AbcMask */ | hash | (index << 19 /* IndexOffset */);
        }
        return Info;
      })();
      ABC.Info = Info;

      var MethodInfo = (function (_super) {
        __extends(MethodInfo, _super);
        function MethodInfo(abc, index, stream) {
          _super.call(this, abc, index, 131072 /* MethodInfo */);
          var constantPool = abc.constantPool;
          var parameterCount = stream.readU30();
          this.returnType = constantPool.multinames[stream.readU30()];
          this.parameters = [];
          for (var i = 0; i < parameterCount; i++) {
            this.parameters.push(new Parameter(undefined, constantPool.multinames[stream.readU30()], undefined));
          }

          this.debugName = constantPool.strings[stream.readU30()];
          this.flags = stream.readU8();

          var optionalCount = 0;
          if (this.flags & 8 /* HasOptional */) {
            optionalCount = stream.readU30();
            release || assert(parameterCount >= optionalCount);
            for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
              var valueIndex = stream.readU30();
              this.parameters[i].value = constantPool.getValue(stream.readU8(), valueIndex);
              this.parameters[i].optional = true;
            }
          }

          if (this.flags & 128 /* HasParamNames */) {
            for (var i = 0; i < parameterCount; i++) {
              if (MethodInfo.parseParameterNames) {
                this.parameters[i].name = constantPool.strings[stream.readU30()];
              } else {
                stream.readU30();
                this.parameters[i].name = MethodInfo._getParameterName(i);
              }
            }
          } else {
            for (var i = 0; i < parameterCount; i++) {
              this.parameters[i].name = MethodInfo._getParameterName(i);
            }
          }
        }
        MethodInfo._getParameterName = function (i) {
          if (i < 26) {
            return String.fromCharCode("A".charCodeAt(0) + i);
          }
          return "P" + (i - 26);
        };

        MethodInfo.prototype.toString = function () {
          var flags = Shumway.IntegerUtilities.getFlags(this.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL|||SET_DXN|HAS_PARAM_NAMES".split("|"));
          return (flags ? flags + " " : "") + this.name;
        };
        MethodInfo.prototype.hasOptional = function () {
          return !!(this.flags & 8 /* HasOptional */);
        };
        MethodInfo.prototype.needsActivation = function () {
          return !!(this.flags & 2 /* Activation */);
        };
        MethodInfo.prototype.needsRest = function () {
          return !!(this.flags & 4 /* Needrest */);
        };
        MethodInfo.prototype.needsArguments = function () {
          return !!(this.flags & 1 /* Arguments */);
        };
        MethodInfo.prototype.isNative = function () {
          return !!(this.flags & 32 /* Native */);
        };
        MethodInfo.prototype.isClassMember = function () {
          return this.holder instanceof ClassInfo;
        };
        MethodInfo.prototype.isInstanceMember = function () {
          return this.holder instanceof InstanceInfo;
        };
        MethodInfo.prototype.isScriptMember = function () {
          return this.holder instanceof ScriptInfo;
        };
        MethodInfo.prototype.hasSetsDxns = function () {
          return !!(this.flags & 64 /* Setsdxns */);
        };

        MethodInfo.parseException = function (abc, stream) {
          var multinames = abc.constantPool.multinames;

          var ex = {
            start: stream.readU30(),
            end: stream.readU30(),
            target: stream.readU30(),
            typeName: multinames[stream.readU30()],
            varName: multinames[stream.readU30()]
          };
          release || assert(!ex.typeName || !ex.typeName.isRuntime());
          release || assert(!ex.varName || ex.varName.isQName());
          return ex;
        };

        MethodInfo.parseBody = function (abc, stream) {
          var constantPool = abc.constantPool;
          var methods = abc.methods;

          var index = stream.readU30();
          var mi = methods[index];
          mi.index = index;
          mi.hasBody = true;
          release || assert(!mi.isNative());
          mi.maxStack = stream.readU30();
          mi.localCount = stream.readU30();
          mi.initScopeDepth = stream.readU30();
          mi.maxScopeDepth = stream.readU30();
          mi.code = stream.readU8s(stream.readU30());

          var exceptions = [];
          var exceptionCount = stream.readU30();
          for (var i = 0; i < exceptionCount; ++i) {
            exceptions.push(MethodInfo.parseException(abc, stream));
          }
          mi.exceptions = exceptions;
          mi.traits = Trait.parseTraits(abc, stream, mi);
        };

        MethodInfo.prototype.hasExceptions = function () {
          return this.exceptions.length > 0;
        };
        MethodInfo.parseParameterNames = false;
        return MethodInfo;
      })(Info);
      ABC.MethodInfo = MethodInfo;

      var InstanceInfo = (function (_super) {
        __extends(InstanceInfo, _super);
        function InstanceInfo(abc, index, stream) {
          _super.call(this, abc, index, 65536 /* InstanceInfo */);
          this.runtimeId = InstanceInfo.nextID++;
          var constantPool = abc.constantPool;
          var methods = abc.methods;

          this.name = constantPool.multinames[stream.readU30()];
          release || assert(Multiname.isQName(this.name));
          this.superName = constantPool.multinames[stream.readU30()];
          this.flags = stream.readU8();
          this.protectedNs = undefined;
          if (this.flags & 8 /* ClassProtectedNs */) {
            this.protectedNs = constantPool.namespaces[stream.readU30()];
          }
          var interfaceCount = stream.readU30();
          this.interfaces = [];
          for (var i = 0; i < interfaceCount; i++) {
            this.interfaces[i] = constantPool.multinames[stream.readU30()];
          }
          this.init = methods[stream.readU30()];
          this.init.isInstanceInitializer = true;
          this.init.name = this.name;
          AbcFile.attachHolder(this.init, this);
          this.traits = Trait.parseTraits(abc, stream, this);
        }
        InstanceInfo.prototype.toString = function () {
          var flags = Shumway.IntegerUtilities.getFlags(this.flags & 8, "sealed|final|interface|protected".split("|"));
          var str = (flags ? flags + " " : "") + this.name;
          if (this.superName) {
            str += " extends " + this.superName;
          }
          return str;
        };
        InstanceInfo.prototype.isFinal = function () {
          return !!(this.flags & 2 /* ClassFinal */);
        };
        InstanceInfo.prototype.isSealed = function () {
          return !!(this.flags & 1 /* ClassSealed */);
        };
        InstanceInfo.prototype.isInterface = function () {
          return !!(this.flags & 4 /* ClassInterface */);
        };
        InstanceInfo.nextID = 1;
        return InstanceInfo;
      })(Info);
      ABC.InstanceInfo = InstanceInfo;

      (function (Hashes) {
        Hashes[Hashes["AbcMask"] = 0x0000FFFF] = "AbcMask";
        Hashes[Hashes["KindMask"] = 0x00070000] = "KindMask";
        Hashes[Hashes["ClassInfo"] = 0x00000000] = "ClassInfo";
        Hashes[Hashes["InstanceInfo"] = 0x00010000] = "InstanceInfo";
        Hashes[Hashes["MethodInfo"] = 0x00020000] = "MethodInfo";
        Hashes[Hashes["ScriptInfo"] = 0x00030000] = "ScriptInfo";
        Hashes[Hashes["NamespaceSet"] = 0x00040000] = "NamespaceSet";
        Hashes[Hashes["IndexOffset"] = 19] = "IndexOffset";
      })(ABC.Hashes || (ABC.Hashes = {}));
      var Hashes = ABC.Hashes;

      var ClassInfo = (function (_super) {
        __extends(ClassInfo, _super);
        function ClassInfo(abc, index, stream) {
          _super.call(this, abc, index, 0 /* ClassInfo */);
          this.runtimeId = ClassInfo.nextID++;
          this.init = abc.methods[stream.readU30()];
          this.init.isClassInitializer = true;
          AbcFile.attachHolder(this.init, this);
          this.traits = Trait.parseTraits(abc, stream, this);
          this.instanceInfo = abc.instances[index];
          this.instanceInfo.classInfo = this;
          this.defaultValue = ClassInfo._getDefaultValue(this.instanceInfo.name);
        }
        ClassInfo._getDefaultValue = function (qn) {
          if (Multiname.getQualifiedName(qn) === Multiname.Int || Multiname.getQualifiedName(qn) === Multiname.Uint) {
            return 0;
          } else if (Multiname.getQualifiedName(qn) === Multiname.Number) {
            return NaN;
          } else if (Multiname.getQualifiedName(qn) === Multiname.Boolean) {
            return false;
          } else {
            return null;
          }
        };

        ClassInfo.prototype.toString = function () {
          return this.instanceInfo.name.toString();
        };
        ClassInfo.nextID = 1;
        return ClassInfo;
      })(Info);
      ABC.ClassInfo = ClassInfo;

      var ScriptInfo = (function (_super) {
        __extends(ScriptInfo, _super);
        function ScriptInfo(abc, index, stream) {
          _super.call(this, abc, index, 196608 /* ScriptInfo */);
          this.runtimeId = ClassInfo.nextID++;
          this.name = abc.name + "$script" + index;
          this.init = abc.methods[stream.readU30()];
          this.init.isScriptInitializer = true;
          AbcFile.attachHolder(this.init, this);
          this.traits = Trait.parseTraits(abc, stream, this);
        }
        Object.defineProperty(ScriptInfo.prototype, "entryPoint", {
          get: function () {
            return this.init;
          },
          enumerable: true,
          configurable: true
        });
        ScriptInfo.prototype.toString = function () {
          return this.name;
        };
        ScriptInfo.nextID = 1;
        return ScriptInfo;
      })(Info);
      ABC.ScriptInfo = ScriptInfo;

      var AbcFile = (function () {
        function AbcFile(bytes, name, hash) {
          if (typeof hash === "undefined") { hash = 0; }
          AVM2.enterTimeline("Parse ABC");
          this.name = name;
          this.env = {};

          var computedHash;
          if (!hash || !release) {
            AVM2.enterTimeline("Adler");
            computedHash = Shumway.HashUtilities.hashBytesTo32BitsAdler(bytes, 0, bytes.length);
            AVM2.leaveTimeline();
          }
          if (hash) {
            this.hash = hash;

            release || assert(hash === computedHash);
          } else {
            this.hash = computedHash;
          }
          var n, i;
          var stream = new ABC.AbcStream(bytes);
          AbcFile._checkMagic(stream);
          AVM2.enterTimeline("Parse constantPool");
          this.constantPool = new ConstantPool(stream, this);
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Parse Method Infos");
          this.methods = [];
          n = stream.readU30();
          for (i = 0; i < n; ++i) {
            this.methods.push(new MethodInfo(this, i, stream));
          }
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Parse MetaData Infos");

          this.metadata = [];
          n = stream.readU30();
          for (i = 0; i < n; ++i) {
            this.metadata.push(new MetaDataInfo(this, stream));
          }
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Parse Instance Infos");

          this.instances = [];
          n = stream.readU30();
          for (i = 0; i < n; ++i) {
            this.instances.push(new InstanceInfo(this, i, stream));
          }
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Parse Class Infos");

          this.classes = [];
          for (i = 0; i < n; ++i) {
            this.classes.push(new ClassInfo(this, i, stream));
          }
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Parse Script Infos");

          this.scripts = [];
          n = stream.readU30();
          for (i = 0; i < n; ++i) {
            this.scripts.push(new ScriptInfo(this, i, stream));
          }
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Parse Method Body Info");

          n = stream.readU30();
          for (i = 0; i < n; ++i) {
            MethodInfo.parseBody(this, stream);
          }
          AVM2.leaveTimeline();
          AVM2.leaveTimeline();
        }
        AbcFile._checkMagic = function (stream) {
          var magic = stream.readWord();
          var flashPlayerBrannan = 46 << 16 | 15;
          if (magic < flashPlayerBrannan) {
            throw new Error("Invalid ABC File (magic = " + Number(magic).toString(16) + ")");
          }
        };

        Object.defineProperty(AbcFile.prototype, "lastScript", {
          get: function () {
            release || assert(this.scripts.length > 0);
            return this.scripts[this.scripts.length - 1];
          },
          enumerable: true,
          configurable: true
        });

        AbcFile.attachHolder = function (mi, holder) {
          release || assert(!mi.holder);
          mi.holder = holder;
        };

        AbcFile.prototype.toString = function () {
          return this.name;
        };

        AbcFile.prototype.getConstant = function (hash) {
          release || assert((this.hash & 65535 /* AbcMask */) === (hash & 65535 /* AbcMask */));
          var index = hash >> 19 /* IndexOffset */;
          switch (hash & 458752 /* KindMask */) {
            case 0 /* ClassInfo */:
              return this.classes[index];
            case 65536 /* InstanceInfo */:
              return this.instances[index];
            case 131072 /* MethodInfo */:
              return this.methods[index];
            case 196608 /* ScriptInfo */:
              return this.scripts[index];
            case 262144 /* NamespaceSet */:
              return this.constantPool.namespaceSets[index];
            default:
              notImplemented("Kind");
          }
        };
        return AbcFile;
      })();
      ABC.AbcFile = AbcFile;

      var Namespace = (function () {
        function Namespace(kind, uri, prefix, uniqueURIHash) {
          if (typeof uri === "undefined") { uri = ""; }
          if (uri === undefined) {
            uri = "";
          }
          this.kind = kind;
          this.uri = uri;
          this.prefix = prefix;
          this.qualifiedName = undefined;
          this._buildNamespace(uniqueURIHash);
        }
        Namespace.prototype._buildNamespace = function (uniqueURIHash) {
          if (this.kind === 22 /* PackageNamespace */) {
            this.kind = 8 /* Namespace */;
          }
          if (this.isPublic() && this.uri) {
            var n = this.uri.length - 1;
            var mark = this.uri.charCodeAt(n);
            if (mark > Namespace._MIN_API_MARK) {
              release || assert(false, "What's this code for?");
              this.uri = this.uri.substring(0, n - 1);
            }
          } else if (this.isUnique()) {
            release || assert(uniqueURIHash !== undefined);
            this.uri = "private " + uniqueURIHash;
          }
          if (this.kind === 26 /* StaticProtectedNs */) {
            this.uri = "*";
          }
          this.qualifiedName = Namespace._qualifyNamespace(this.kind, this.uri, this.prefix ? this.prefix : "");
        };

        Namespace._hashNamespace = function (kind, uri, prefix) {
          var data = new Int32Array(1 + uri.length + prefix.length);
          var j = 0;
          data[j++] = kind;
          var index = Namespace._knownURIs.indexOf(uri);
          if (index >= 0) {
            return kind << 2 | index;
          } else {
            for (var i = 0; i < uri.length; i++) {
              data[j++] = uri.charCodeAt(i);
            }
          }
          for (var i = 0; i < prefix.length; i++) {
            data[j++] = prefix.charCodeAt(i);
          }
          return Shumway.HashUtilities.hashBytesTo32BitsMD5(data, 0, j);
        };

        Namespace._qualifyNamespace = function (kind, uri, prefix) {
          var key = kind + uri;
          var mangledNamespace = Namespace._mangledNamespaceCache[key];
          if (mangledNamespace) {
            return mangledNamespace;
          }
          mangledNamespace = Shumway.StringUtilities.variableLengthEncodeInt32(Namespace._hashNamespace(kind, uri, prefix));
          Namespace._mangledNamespaceMap[mangledNamespace] = {
            kind: kind, uri: uri, prefix: prefix
          };
          Namespace._mangledNamespaceCache[key] = mangledNamespace;
          return mangledNamespace;
        };

        Namespace.fromQualifiedName = function (qn) {
          var length = Shumway.StringUtilities.fromEncoding(qn[0]);
          var mangledNamespace = qn.substring(0, length + 1);
          var ns = Namespace._mangledNamespaceMap[mangledNamespace];
          return new Namespace(ns.kind, ns.uri, ns.prefix);
        };

        Namespace.kindFromString = function (str) {
          for (var kind in Namespace._kinds) {
            if (Namespace._kinds[kind] === str) {
              return kind;
            }
          }
          release || assert(false, "Cannot find kind " + str);
          return NaN;
        };

        Namespace.createNamespace = function (uri, prefix) {
          if (typeof prefix === "undefined") { prefix = undefined; }
          return new Namespace(8 /* Namespace */, uri, prefix);
        };

        Namespace.parse = function (constantPool, stream, hash) {
          var kind = stream.readU8();
          var uri = constantPool.strings[stream.readU30()];
          return new Namespace(kind, uri, undefined, hash);
        };

        Namespace.prototype.isPublic = function () {
          return this.kind === 8 /* Namespace */ || this.kind === 22 /* PackageNamespace */;
        };

        Namespace.prototype.isProtected = function () {
          return this.kind === 24 /* ProtectedNamespace */ || this.kind === 26 /* StaticProtectedNs */;
        };

        Namespace.prototype.isPrivate = function () {
          return this.kind === 5 /* PrivateNs */;
        };

        Namespace.prototype.isPackageInternal = function () {
          return this.kind === 23 /* PackageInternalNs */;
        };

        Namespace.prototype.isUnique = function () {
          return this.kind === 5 /* PrivateNs */ && !this.uri;
        };

        Namespace.prototype.isDynamic = function () {
          return this.isPublic() && !this.uri;
        };

        Namespace.prototype.getURI = function () {
          return this.uri;
        };

        Namespace.prototype.toString = function () {
          return Namespace._kinds[this.kind] + (this.uri ? " " + this.uri : "");
        };

        Namespace.prototype.clone = function () {
          var ns = Object.create(Namespace.prototype);
          ns.kind = this.kind;
          ns.uri = this.uri;
          ns.prefix = this.prefix;
          ns.qualifiedName = this.qualifiedName;
          return ns;
        };

        Namespace.prototype.isEqualTo = function (other) {
          return this.qualifiedName === other.qualifiedName;
        };

        Namespace.prototype.inNamespaceSet = function (set) {
          for (var i = 0; i < set.length; i++) {
            if (set[i].qualifiedName === this.qualifiedName) {
              return true;
            }
          }
          return false;
        };

        Namespace.prototype.getAccessModifier = function () {
          return Namespace._kinds[this.kind];
        };

        Namespace.prototype.getQualifiedName = function () {
          return this.qualifiedName;
        };

        Namespace.fromSimpleName = function (simpleName) {
          if (simpleName in Namespace._simpleNameCache) {
            return Namespace._simpleNameCache[simpleName];
          }
          var namespaceNames;
          if (simpleName.indexOf("[") === 0) {
            release || assert(simpleName[simpleName.length - 1] === "]");
            namespaceNames = simpleName.substring(1, simpleName.length - 1).split(",");
          } else {
            namespaceNames = [simpleName];
          }
          return Namespace._simpleNameCache[simpleName] = namespaceNames.map(function (name) {
            name = name.trim();
            var kindName, uri;
            if (name.indexOf(" ") > 0) {
              kindName = name.substring(0, name.indexOf(" ")).trim();
              uri = name.substring(name.indexOf(" ") + 1).trim();
            } else {
              var kinds = Namespace._kinds;
              if (name === kinds[8 /* Namespace */] || name === kinds[23 /* PackageInternalNs */] || name === kinds[5 /* PrivateNs */] || name === kinds[24 /* ProtectedNamespace */] || name === kinds[25 /* ExplicitNamespace */] || name === kinds[26 /* StaticProtectedNs */]) {
                kindName = name;
                uri = "";
              } else {
                kindName = Namespace._publicPrefix;
                uri = name;
              }
            }
            return new Namespace(Namespace.kindFromString(kindName), uri);
          });
        };
        Namespace._publicPrefix = "public";

        Namespace._kinds = (function () {
          var map = Shumway.ObjectUtilities.createMap();
          map[8 /* Namespace */] = Namespace._publicPrefix;
          map[23 /* PackageInternalNs */] = "packageInternal";
          map[5 /* PrivateNs */] = "private";
          map[24 /* ProtectedNamespace */] = "protected";
          map[25 /* ExplicitNamespace */] = "explicit";
          map[26 /* StaticProtectedNs */] = "staticProtected";
          return map;
        })();

        Namespace._MIN_API_MARK = 0xe294;
        Namespace._MAX_API_MARK = 0xf8ff;

        Namespace._knownURIs = [
          ""
        ];

        Namespace._mangledNamespaceCache = Shumway.ObjectUtilities.createMap();
        Namespace._mangledNamespaceMap = Shumway.ObjectUtilities.createMap();

        Namespace.PUBLIC = new Namespace(8 /* Namespace */);
        Namespace.PROTECTED = new Namespace(24 /* ProtectedNamespace */);
        Namespace.PROXY = new Namespace(8 /* Namespace */, "http://www.adobe.com/2006/actionscript/flash/proxy");
        Namespace.VECTOR = new Namespace(8 /* Namespace */, "__AS3__.vec");
        Namespace.VECTOR_PACKAGE = new Namespace(23 /* PackageInternalNs */, "__AS3__.vec");
        Namespace.BUILTIN = new Namespace(5 /* PrivateNs */, "builtin.as$0");

        Namespace._simpleNameCache = Shumway.ObjectUtilities.createMap();
        return Namespace;
      })();
      ABC.Namespace = Namespace;

      Namespace.prototype = Object.create(Namespace.prototype);

      var Multiname = (function () {
        function Multiname(namespaces, name, flags) {
          if (typeof flags === "undefined") { flags = 0; }
          if (name !== undefined) {
            release || assert(name === null || isString(name), "Multiname name must be a string. " + name);
          }
          this.runtimeId = Multiname._nextID++;
          this.namespaces = namespaces;
          this.name = name;
          this.flags = flags;
        }
        Multiname.parse = function (constantPool, stream, multinames, typeNamePatches, multinameIndex) {
          var index = 0;
          var kind = stream.readU8();
          var name, namespaces = [], flags = 0;
          switch (kind) {
            case 7 /* QName */:
            case 13 /* QNameA */:
              index = stream.readU30();
              if (index) {
                namespaces = [constantPool.namespaces[index]];
              } else {
                flags &= ~Multiname.RUNTIME_NAME;
              }
              index = stream.readU30();
              if (index) {
                name = constantPool.strings[index];
              }
              break;
            case 15 /* RTQName */:
            case 16 /* RTQNameA */:
              index = stream.readU30();
              if (index) {
                name = constantPool.strings[index];
              } else {
                flags &= ~Multiname.RUNTIME_NAME;
              }
              flags |= Multiname.RUNTIME_NAMESPACE;
              break;
            case 17 /* RTQNameL */:
            case 18 /* RTQNameLA */:
              flags |= Multiname.RUNTIME_NAMESPACE;
              flags |= Multiname.RUNTIME_NAME;
              break;
            case 9 /* Multiname */:
            case 14 /* MultinameA */:
              index = stream.readU30();
              if (index) {
                name = constantPool.strings[index];
              } else {
                flags &= ~Multiname.RUNTIME_NAME;
              }
              index = stream.readU30();
              release || assert(index !== 0);
              namespaces = constantPool.namespaceSets[index];
              break;
            case 27 /* MultinameL */:
            case 28 /* MultinameLA */:
              flags |= Multiname.RUNTIME_NAME;
              index = stream.readU30();
              release || assert(index !== 0);
              namespaces = constantPool.namespaceSets[index];
              break;

            case 29 /* TypeName */:
              var factoryTypeIndex = stream.readU32();
              var typeParameterCount = stream.readU32();
              release || assert(typeParameterCount === 1);
              var typeParameterIndex = stream.readU32();
              var mn = undefined;

              if (multinames[factoryTypeIndex] && multinames[typeParameterIndex]) {
                mn = new Multiname(multinames[factoryTypeIndex].namespaces, multinames[factoryTypeIndex].name, flags);
                mn.typeParameter = multinames[typeParameterIndex];
              } else {
                typeNamePatches.push({
                  index: multinameIndex,
                  factoryTypeIndex: factoryTypeIndex,
                  typeParameterIndex: typeParameterIndex,
                  flags: flags
                });
              }
              return mn;
            default:
              Shumway.Debug.unexpected();
              break;
          }
          switch (kind) {
            case 13 /* QNameA */:
            case 16 /* RTQNameA */:
            case 18 /* RTQNameLA */:
            case 14 /* MultinameA */:
            case 28 /* MultinameLA */:
              flags |= Multiname.ATTRIBUTE;
              break;
          }

          return new Multiname(namespaces, name, flags);
        };

        Multiname.isMultiname = function (mn) {
          return typeof mn === "number" || typeof mn === "string" || mn instanceof Multiname || mn instanceof Number;
        };

        Multiname.needsResolution = function (mn) {
          return mn instanceof Multiname && mn.namespaces.length > 1;
        };

        Multiname.isQName = function (mn) {
          if (mn instanceof Multiname) {
            return mn.namespaces && mn.namespaces.length === 1;
          }
          return true;
        };

        Multiname.isRuntimeName = function (mn) {
          return mn instanceof Multiname && mn.isRuntimeName();
        };

        Multiname.isRuntimeNamespace = function (mn) {
          return mn instanceof Multiname && mn.isRuntimeNamespace();
        };

        Multiname.isRuntime = function (mn) {
          return mn instanceof Multiname && mn.isRuntimeName() || mn.isRuntimeNamespace();
        };

        Multiname.getQualifiedName = function (mn) {
          release || assert(Multiname.isQName(mn));
          if (mn instanceof Multiname) {
            if (mn.qualifiedName !== undefined) {
              return mn.qualifiedName;
            }
            var name = String(mn.name);
            if (isNumeric(name) && mn.namespaces[0].isPublic()) {
              return mn.qualifiedName = name;
            }
            mn = mn.qualifiedName = Multiname.qualifyName(mn.namespaces[0], name);
          }
          return mn;
        };

        Multiname.qualifyName = function (namespace, name) {
          return Shumway.StringUtilities.concat3("$", namespace.qualifiedName, name);
        };

        Multiname.stripPublicQualifier = function (qn) {
          var publicQualifier = "$" + Namespace.PUBLIC.qualifiedName;
          var index = qn.indexOf(publicQualifier);
          if (index !== 0) {
            return undefined;
          }
          return qn.substring(publicQualifier.length);
        };

        Multiname.fromQualifiedName = function (qn) {
          if (qn instanceof Multiname) {
            return qn;
          }
          if (isNumeric(qn)) {
            return new Multiname([Namespace.PUBLIC], qn);
          }
          if (qn[0] !== "$") {
            return;
          }
          var ns = Namespace.fromQualifiedName(qn.substring(1));
          return new Multiname([ns], qn.substring(1 + ns.qualifiedName.length));
        };

        Multiname.getNameFromPublicQualifiedName = function (qn) {
          var mn = Multiname.fromQualifiedName(qn);
          release || assert(mn.getNamespace().isPublic());
          return mn.name;
        };

        Multiname.getFullQualifiedName = function (mn) {
          var qn = Multiname.getQualifiedName(mn);
          if (mn instanceof Multiname && mn.typeParameter) {
            qn += "$" + Multiname.getFullQualifiedName(mn.typeParameter);
          }
          return qn;
        };

        Multiname.getPublicQualifiedName = function (name) {
          var qname;

          if (typeof name === "string") {
            qname = Multiname._publicQualifiedNameCache[name];
            if (qname) {
              return qname;
            }
          }

          if (isNumeric(name)) {
            return Shumway.toNumber(name);
          } else if (name !== null && isObject(name)) {
            return name;
          }

          qname = Multiname.qualifyName(Namespace.PUBLIC, name);
          if (typeof name === "string") {
            Multiname._publicQualifiedNameCache[name] = qname;
          }
          return qname;
        };

        Multiname.isPublicQualifiedName = function (qn) {
          return typeof qn === "number" || isNumeric(qn) || qn.indexOf(Namespace.PUBLIC.qualifiedName) === 1;
        };

        Multiname.getAccessModifier = function (mn) {
          release || assert(Multiname.isQName(mn));
          if (typeof mn === "number" || typeof mn === "string" || mn instanceof Number) {
            return "public";
          }
          release || assert(mn instanceof Multiname);
          return mn.namespaces[0].getAccessModifier();
        };

        Multiname.isNumeric = function (mn) {
          if (typeof mn === "number") {
            return true;
          } else if (typeof mn === "string") {
            return isNumeric(mn);
          }

          return !isNaN(parseInt(Multiname.getName(mn), 10));
        };

        Multiname.getName = function (mn) {
          release || assert(mn instanceof Multiname);
          release || assert(!mn.isRuntimeName());
          return mn.getName();
        };

        Multiname.isAnyName = function (mn) {
          return typeof mn === "object" && !mn.isRuntimeName() && !mn.name;
        };

        Multiname.fromSimpleName = function (simpleName) {
          release || assert(simpleName);
          if (simpleName in Multiname._simpleNameCache) {
            return Multiname._simpleNameCache[simpleName];
          }

          var nameIndex, namespaceIndex, name, namespace;
          nameIndex = simpleName.lastIndexOf(".");
          if (nameIndex <= 0) {
            nameIndex = simpleName.lastIndexOf(" ");
          }

          if (nameIndex > 0 && nameIndex < simpleName.length - 1) {
            name = simpleName.substring(nameIndex + 1).trim();
            namespace = simpleName.substring(0, nameIndex).trim();
          } else {
            name = simpleName;
            namespace = "";
          }
          return Multiname._simpleNameCache[simpleName] = new Multiname(Namespace.fromSimpleName(namespace), name);
        };

        Multiname.prototype.getQName = function (index) {
          release || assert(index >= 0 && index < this.namespaces.length);
          if (!this._qualifiedNameCache) {
            this._qualifiedNameCache = Shumway.ObjectUtilities.createArrayMap();
          }
          var name = this._qualifiedNameCache[index];
          if (!name) {
            name = this._qualifiedNameCache[index] = new Multiname([this.namespaces[index]], this.name, this.flags);
          }
          return name;
        };

        Multiname.prototype.hasQName = function (qn) {
          release || assert(qn instanceof Multiname);
          if (this.name !== qn.name) {
            return false;
          }
          for (var i = 0; i < this.namespaces.length; i++) {
            if (this.namespaces[i].isEqualTo(qn.namespaces[0])) {
              return true;
            }
          }
          return false;
        };

        Multiname.prototype.isAttribute = function () {
          return this.flags & Multiname.ATTRIBUTE;
        };

        Multiname.prototype.isAnyName = function () {
          return Multiname.isAnyName(this);
        };

        Multiname.prototype.isAnyNamespace = function () {
          return !this.isRuntimeNamespace() && (this.namespaces.length === 0 || (this.isAnyName() && this.namespaces.length !== 1));
        };

        Multiname.prototype.isRuntimeName = function () {
          return !!(this.flags & Multiname.RUNTIME_NAME);
        };

        Multiname.prototype.isRuntimeNamespace = function () {
          return !!(this.flags & Multiname.RUNTIME_NAMESPACE);
        };

        Multiname.prototype.isRuntime = function () {
          return !!(this.flags & (Multiname.RUNTIME_NAME | Multiname.RUNTIME_NAMESPACE));
        };

        Multiname.prototype.isQName = function () {
          return this.namespaces.length === 1 && !this.isAnyName();
        };

        Multiname.prototype.hasTypeParameter = function () {
          return !!this.typeParameter;
        };

        Multiname.prototype.getName = function () {
          return this.name;
        };

        Multiname.prototype.getOriginalName = function () {
          release || assert(this.isQName());
          var name = this.namespaces[0].uri;
          if (name) {
            name += ".";
          }
          return name + this.name;
        };

        Multiname.prototype.getNamespace = function () {
          release || assert(!this.isRuntimeNamespace());
          release || assert(this.namespaces.length === 1);
          return this.namespaces[0];
        };

        Multiname.prototype.nameToString = function () {
          if (this.isAnyName()) {
            return "*";
          } else {
            var name = this.getName();
            return this.isRuntimeName() ? "[]" : name;
          }
        };

        Multiname.prototype.hasObjectName = function () {
          return typeof this.name === "object";
        };

        Multiname.prototype.toString = function () {
          var str = this.isAttribute() ? "@" : "";
          if (this.isAnyNamespace()) {
            str += "*::" + this.nameToString();
          } else if (this.isRuntimeNamespace()) {
            str += "[]::" + this.nameToString();
          } else if (this.namespaces.length === 1 && this.isQName()) {
            str += this.namespaces[0].toString() + "::";
            str += this.nameToString();
          } else {
            str += "{";
            for (var i = 0, count = this.namespaces.length; i < count; i++) {
              str += this.namespaces[i].toString();
              if (i + 1 < count) {
                str += ",";
              }
            }
            str += "}::" + this.nameToString();
          }

          if (this.hasTypeParameter()) {
            str += "<" + this.typeParameter.toString() + ">";
          }
          return str;
        };
        Multiname.ATTRIBUTE = 0x01;
        Multiname.RUNTIME_NAMESPACE = 0x02;
        Multiname.RUNTIME_NAME = 0x04;
        Multiname._nextID = 0;

        Multiname._publicQualifiedNameCache = Shumway.ObjectUtilities.createMap();

        Multiname._simpleNameCache = Shumway.ObjectUtilities.createMap();

        Multiname.Int = Multiname.getPublicQualifiedName("int");
        Multiname.Uint = Multiname.getPublicQualifiedName("uint");
        Multiname.Class = Multiname.getPublicQualifiedName("Class");
        Multiname.Array = Multiname.getPublicQualifiedName("Array");
        Multiname.Object = Multiname.getPublicQualifiedName("Object");
        Multiname.String = Multiname.getPublicQualifiedName("String");
        Multiname.Number = Multiname.getPublicQualifiedName("Number");
        Multiname.Boolean = Multiname.getPublicQualifiedName("Boolean");
        Multiname.Function = Multiname.getPublicQualifiedName("Function");
        Multiname.XML = Multiname.getPublicQualifiedName("XML");
        Multiname.XMLList = Multiname.getPublicQualifiedName("XMLList");

        Multiname.TO_STRING = Multiname.getPublicQualifiedName("toString");
        Multiname.VALUE_OF = Multiname.getPublicQualifiedName("valueOf");
        Multiname.TEMPORARY = new Multiname([], "");
        return Multiname;
      })();
      ABC.Multiname = Multiname;

      var MetaDataInfo = (function () {
        function MetaDataInfo(abc, stream) {
          var strings = abc.constantPool.strings;
          var name = this.name = strings[stream.readU30()];
          var itemCount = stream.readU30();
          var keys = [];
          var items = [];

          for (var i = 0; i < itemCount; i++) {
            keys[i] = strings[stream.readU30()];
          }

          for (var i = 0; i < itemCount; i++) {
            var key = keys[i];
            items[i] = { key: key, value: strings[stream.readU30()] };

            if (key && name === "native") {
              release || assert(!this.hasOwnProperty(key));
              this[key] = items[i].value;
            }
          }

          this.value = items;
        }
        MetaDataInfo.prototype.toString = function () {
          return "[" + this.name + "]";
        };
        return MetaDataInfo;
      })();
      ABC.MetaDataInfo = MetaDataInfo;

      (function (CONSTANT) {
        CONSTANT[CONSTANT["Undefined"] = 0x00] = "Undefined";
        CONSTANT[CONSTANT["Utf8"] = 0x01] = "Utf8";
        CONSTANT[CONSTANT["Float"] = 0x02] = "Float";
        CONSTANT[CONSTANT["Int"] = 0x03] = "Int";
        CONSTANT[CONSTANT["UInt"] = 0x04] = "UInt";
        CONSTANT[CONSTANT["PrivateNs"] = 0x05] = "PrivateNs";
        CONSTANT[CONSTANT["Double"] = 0x06] = "Double";
        CONSTANT[CONSTANT["QName"] = 0x07] = "QName";
        CONSTANT[CONSTANT["Namespace"] = 0x08] = "Namespace";
        CONSTANT[CONSTANT["Multiname"] = 0x09] = "Multiname";
        CONSTANT[CONSTANT["False"] = 0x0A] = "False";
        CONSTANT[CONSTANT["True"] = 0x0B] = "True";
        CONSTANT[CONSTANT["Null"] = 0x0C] = "Null";
        CONSTANT[CONSTANT["QNameA"] = 0x0D] = "QNameA";
        CONSTANT[CONSTANT["MultinameA"] = 0x0E] = "MultinameA";
        CONSTANT[CONSTANT["RTQName"] = 0x0F] = "RTQName";
        CONSTANT[CONSTANT["RTQNameA"] = 0x10] = "RTQNameA";
        CONSTANT[CONSTANT["RTQNameL"] = 0x11] = "RTQNameL";
        CONSTANT[CONSTANT["RTQNameLA"] = 0x12] = "RTQNameLA";
        CONSTANT[CONSTANT["NameL"] = 0x13] = "NameL";
        CONSTANT[CONSTANT["NameLA"] = 0x14] = "NameLA";
        CONSTANT[CONSTANT["NamespaceSet"] = 0x15] = "NamespaceSet";
        CONSTANT[CONSTANT["PackageNamespace"] = 0x16] = "PackageNamespace";
        CONSTANT[CONSTANT["PackageInternalNs"] = 0x17] = "PackageInternalNs";
        CONSTANT[CONSTANT["ProtectedNamespace"] = 0x18] = "ProtectedNamespace";
        CONSTANT[CONSTANT["ExplicitNamespace"] = 0x19] = "ExplicitNamespace";
        CONSTANT[CONSTANT["StaticProtectedNs"] = 0x1A] = "StaticProtectedNs";
        CONSTANT[CONSTANT["MultinameL"] = 0x1B] = "MultinameL";
        CONSTANT[CONSTANT["MultinameLA"] = 0x1C] = "MultinameLA";
        CONSTANT[CONSTANT["TypeName"] = 0x1D] = "TypeName";

        CONSTANT[CONSTANT["ClassSealed"] = 0x01] = "ClassSealed";
        CONSTANT[CONSTANT["ClassFinal"] = 0x02] = "ClassFinal";
        CONSTANT[CONSTANT["ClassInterface"] = 0x04] = "ClassInterface";
        CONSTANT[CONSTANT["ClassProtectedNs"] = 0x08] = "ClassProtectedNs";
      })(ABC.CONSTANT || (ABC.CONSTANT = {}));
      var CONSTANT = ABC.CONSTANT;

      (function (METHOD) {
        METHOD[METHOD["Arguments"] = 0x1] = "Arguments";
        METHOD[METHOD["Activation"] = 0x2] = "Activation";
        METHOD[METHOD["Needrest"] = 0x4] = "Needrest";
        METHOD[METHOD["HasOptional"] = 0x8] = "HasOptional";
        METHOD[METHOD["IgnoreRest"] = 0x10] = "IgnoreRest";
        METHOD[METHOD["Native"] = 0x20] = "Native";
        METHOD[METHOD["Setsdxns"] = 0x40] = "Setsdxns";
        METHOD[METHOD["HasParamNames"] = 0x80] = "HasParamNames";
      })(ABC.METHOD || (ABC.METHOD = {}));
      var METHOD = ABC.METHOD;

      (function (TRAIT) {
        TRAIT[TRAIT["Slot"] = 0] = "Slot";
        TRAIT[TRAIT["Method"] = 1] = "Method";
        TRAIT[TRAIT["Getter"] = 2] = "Getter";
        TRAIT[TRAIT["Setter"] = 3] = "Setter";
        TRAIT[TRAIT["Class"] = 4] = "Class";
        TRAIT[TRAIT["Function"] = 5] = "Function";
        TRAIT[TRAIT["Const"] = 6] = "Const";
      })(ABC.TRAIT || (ABC.TRAIT = {}));
      var TRAIT = ABC.TRAIT;

      (function (ATTR) {
        ATTR[ATTR["Final"] = 0x01] = "Final";
        ATTR[ATTR["Override"] = 0x02] = "Override";
        ATTR[ATTR["Metadata"] = 0x04] = "Metadata";
      })(ABC.ATTR || (ABC.ATTR = {}));
      var ATTR = ABC.ATTR;

      (function (SORT) {
        SORT[SORT["CASEINSENSITIVE"] = 0x01] = "CASEINSENSITIVE";
        SORT[SORT["DESCENDING"] = 0x02] = "DESCENDING";
        SORT[SORT["UNIQUESORT"] = 0x04] = "UNIQUESORT";
        SORT[SORT["RETURNINDEXEDARRAY"] = 0x08] = "RETURNINDEXEDARRAY";
        SORT[SORT["NUMERIC"] = 0x10] = "NUMERIC";
      })(ABC.SORT || (ABC.SORT = {}));
      var SORT = ABC.SORT;

      var ConstantPool = (function () {
        function ConstantPool(stream, abc) {
          var n;

          var ints = [0];
          n = stream.readU30();
          for (var i = 1; i < n; ++i) {
            ints.push(stream.readS32());
          }

          var uints = [0];
          n = stream.readU30();
          for (var i = 1; i < n; ++i) {
            uints.push(stream.readU32());
          }

          var doubles = [NaN];
          n = stream.readU30();
          for (var i = 1; i < n; ++i) {
            doubles.push(stream.readDouble());
          }
          AVM2.enterTimeline("Parse Strings");

          var strings = [""];
          n = stream.readU30();
          for (var i = 1; i < n; ++i) {
            strings.push(stream.readUTFString(stream.readU30()));
          }
          AVM2.leaveTimeline();

          this.ints = ints;
          this.uints = uints;
          this.doubles = doubles;
          this.strings = strings;

          AVM2.enterTimeline("Parse Namespaces");

          var namespaces = [undefined];
          n = stream.readU30();
          for (var i = 1; i < n; ++i) {
            namespaces.push(Namespace.parse(this, stream, abc.hash + i));
          }
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Parse Namespace Sets");

          var namespaceSets = [undefined];
          n = stream.readU30();
          for (var i = 1; i < n; ++i) {
            var count = stream.readU30();
            var namespaceSet = [];
            namespaceSet.runtimeId = ConstantPool._nextNamespaceSetID++;
            namespaceSet.hash = abc.hash & 65535 /* AbcMask */ | 262144 /* NamespaceSet */ | (i << 19 /* IndexOffset */);
            for (var j = 0; j < count; ++j) {
              namespaceSet.push(namespaces[stream.readU30()]);
            }
            namespaceSets.push(namespaceSet);
          }
          AVM2.leaveTimeline();

          this.namespaces = namespaces;
          this.namespaceSets = namespaceSets;

          AVM2.enterTimeline("Parse Multinames");

          var multinames = [undefined];
          var typeNamePatches = [];
          n = stream.readU30();
          for (var i = 1; i < n; ++i) {
            multinames.push(Multiname.parse(this, stream, multinames, typeNamePatches, i));
          }
          for (var i = 0; i < typeNamePatches.length; i++) {
            var patch = typeNamePatches[i];
            var factoryType = multinames[patch.factoryTypeIndex];
            var typeParameter = multinames[patch.typeParameterIndex];
            release || assert(factoryType && typeParameter);
            var mn = new Multiname(factoryType.namespaces, factoryType.name, patch.flags);
            mn.typeParameter = typeParameter;
            multinames[patch.index] = mn;
          }
          AVM2.leaveTimeline();

          this.multinames = multinames;
        }
        ConstantPool.prototype.getValue = function (kind, index) {
          switch (kind) {
            case 3 /* Int */:
              return this.ints[index];
            case 4 /* UInt */:
              return this.uints[index];
            case 6 /* Double */:
              return this.doubles[index];
            case 1 /* Utf8 */:
              return this.strings[index];
            case 11 /* True */:
              return true;
            case 10 /* False */:
              return false;
            case 12 /* Null */:
              return null;
            case 0 /* Undefined */:
              return undefined;
            case 8 /* Namespace */:
            case 23 /* PackageInternalNs */:
              return this.namespaces[index];
            case 7 /* QName */:
            case 14 /* MultinameA */:
            case 15 /* RTQName */:
            case 16 /* RTQNameA */:
            case 17 /* RTQNameL */:
            case 18 /* RTQNameLA */:
            case 19 /* NameL */:
            case 20 /* NameLA */:
              return this.multinames[index];
            case 2 /* Float */:
              Shumway.Debug.warning("TODO: CONSTANT.Float may be deprecated?");
              break;
            default:
              release || assert(false, "Not Implemented Kind " + kind);
          }
        };
        ConstantPool._nextNamespaceSetID = 1;
        return ConstantPool;
      })();
      ABC.ConstantPool = ConstantPool;
    })(AVM2.ABC || (AVM2.ABC = {}));
    var ABC = AVM2.ABC;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (ABC) {
      var assert = Shumway.Debug.assert;
      var notImplemented = Shumway.Debug.notImplemented;

      var filter = new Shumway.Options.Option("f", "filter", "string", "SpciMsmNtu", "[S]ource, constant[p]ool, [c]lasses, [i]nstances, [M]etadata, [s]cripts, [m]ethods, multi[N]ames, S[t]atistics, [u]tf");

      function traceArray(writer, name, array, abc) {
        if (typeof abc === "undefined") { abc = null; }
        if (array.length === 0) {
          return;
        }
        writer.enter(name + " {");
        array.forEach(function (a, idx) {
          a.trace(writer, abc);
        });
        writer.leave("}");
      }

      ABC.AbcFile.prototype.trace = function trace(writer) {
        if (filter.value.indexOf("p") >= 0) {
          this.constantPool.trace(writer);
        }
        if (filter.value.indexOf("N") >= 0) {
          traceMultinamesOnly(this.constantPool, writer);
        }
        if (filter.value.indexOf("c") >= 0) {
          traceArray(writer, "classes", this.classes);
        }
        if (filter.value.indexOf("i") >= 0) {
          traceArray(writer, "instances", this.instances);
        }
        if (filter.value.indexOf("M") >= 0) {
          traceArray(writer, "metadata", this.metadata);
        }
        if (filter.value.indexOf("s") >= 0) {
          traceArray(writer, "scripts", this.scripts);
        }
        if (filter.value.indexOf("m") >= 0) {
          traceArray(writer, "methods", this.methods, this);
        }
        if (filter.value.indexOf("S") >= 0) {
          traceSource(writer, this);
        }
        if (filter.value.indexOf("t") >= 0) {
          traceStatistics(writer, this);
        }
      };

      ABC.ConstantPool.prototype.trace = function (writer) {
        writer.enter("constantPool {");
        for (var key in this) {
          if (key === "namespaces") {
            writer.enter("namespaces {");
            this.namespaces.forEach(function (ns, i) {
              writer.writeLn(("" + i).padRight(' ', 3) + (ns ? ns.toString() : "*"));
            });
            writer.leave("}");
          } else if (this[key] instanceof Array) {
            writer.enter(key + " " + this[key].length + " {");
            writer.writeArray(this[key]);
            writer.leave("}");
          }
        }
        writer.leave("}");
      };

      function traceMultinamesOnly(constantPool, writer) {
        writer.writeArray(constantPool.multinames, null, true);
      }

      ABC.ClassInfo.prototype.trace = function (writer) {
        writer.enter("class " + this + " {");
        traceArray(writer, "traits", this.traits);
        writer.leave("}");
      };

      ABC.MetaDataInfo.prototype.trace = function (writer) {
        writer.enter(this + " {");
        this.value.forEach(function (item) {
          writer.writeLn((item.key ? item.key + ": " : "") + "\"" + item.value + "\"");
        });
        writer.leave("}");
      };

      ABC.InstanceInfo.prototype.trace = function (writer) {
        writer.enter("instance " + this + " {");
        traceArray(writer, "traits", this.traits);
        writer.leave("}");
      };

      ABC.ScriptInfo.prototype.trace = function (writer) {
        writer.enter("script " + this + " {");
        traceArray(writer, "traits", this.traits);
        writer.leave("}");
      };

      ABC.Trait.prototype.trace = function (writer) {
        if (this.metadata) {
          for (var key in this.metadata) {
            if (this.metadata.hasOwnProperty(key)) {
              this.metadata[key].trace(writer);
            }
          }
        }
        writer.writeLn(this);
      };

      function traceAbc(writer, abc) {
        abc.trace(writer);
      }

      function traceOperand(operand, abc, code) {
        var value = 0;
        switch (operand.size) {
          case "s08":
            value = code.readS8();
            break;
          case "u08":
            value = code.readU8();
            break;
          case "s16":
            value = code.readS16();
            break;
          case "s24":
            value = code.readS24();
            break;
          case "u30":
            value = code.readU30();
            break;
          case "u32":
            value = code.readU32();
            break;
          default:
            release || assert(false);
            break;
        }
        var description = "";
        switch (operand.type) {
          case "":
            break;
          case "I":
            description = abc.constantPool.ints[value];
            break;
          case "U":
            description = abc.constantPool.uints[value];
            break;
          case "D":
            description = abc.constantPool.doubles[value];
            break;
          case "S":
            description = abc.constantPool.strings[value];
            break;
          case "N":
            description = abc.constantPool.namespaces[value];
            break;
          case "CI":
            description = abc.classes[value];
            break;
          case "M":
            return abc.constantPool.multinames[value];
          default:
            description = "?";
            break;
        }
        return operand.name + ":" + value + (description === "" ? "" : " (" + description + ")");
      }

      function traceOperands(opcode, abc, code, rewind) {
        if (typeof rewind === "undefined") { rewind = false; }
        var old = code.position;
        var str = "";
        if (opcode.operands === null) {
          str = "null";
        } else {
          opcode.operands.forEach(function (op, i) {
            str += traceOperand(op, abc, code);
            if (i < opcode.operands.length - 1) {
              str += ", ";
            }
          });
        }
        if (rewind) {
          code.seek(old);
        }
        return str;
      }

      ABC.MethodInfo.prototype.trace = function trace(writer) {
        var abc = this.abc;
        writer.enter("method" + (this.name ? " " + this.name : "") + " {");
        writer.writeLn("flags: " + Shumway.IntegerUtilities.getFlags(this.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL||NATIVE|SET_DXN|HAS_PARAM_NAMES".split("|")));
        writer.writeLn("parameters: " + this.parameters.map(function (x) {
          return (x.type ? ABC.Multiname.getQualifiedName(x.type) + "::" : "") + x.name;
        }));

        if (!this.code) {
          writer.leave("}");
          return;
        }

        var code = new ABC.AbcStream(this.code);

        traceArray(writer, "traits", this.traits);

        writer.enter("code {");
        while (code.remaining() > 0) {
          var bc = code.readU8();
          var opcode = Shumway.AVM2.opcodeTable[bc];
          var str, defaultOffset, offset, count;
          str = ("" + code.position).padRight(' ', 6);
          switch (bc) {
            case 27 /* lookupswitch */:
              str += opcode.name + ": defaultOffset: " + code.readS24();
              var caseCount = code.readU30();
              str += ", caseCount: " + caseCount;
              for (var i = 0; i < caseCount + 1; i++) {
                str += " offset: " + code.readS24();
              }
              writer.writeLn(str);
              break;
            default:
              if (opcode) {
                str += opcode.name.padRight(' ', 20);
                if (!opcode.operands) {
                  release || assert(false, "Opcode: " + opcode.name + " has undefined operands.");
                } else {
                  if (opcode.operands.length > 0) {
                    str += traceOperands(opcode, abc, code);
                  }
                  writer.writeLn(str);
                }
              } else {
                release || assert(false, "Opcode: " + bc + " is not implemented.");
              }
              break;
          }
        }
        writer.leave("}");
        writer.leave("}");
      };

      var SourceTracer = (function () {
        function literal(value) {
          if (value === undefined) {
            return "undefined";
          } else if (value === null) {
            return "null";
          } else if (typeof (value) === "string") {
            return "\"" + value + "\"";
          } else {
            return String(value);
          }
        }

        function getSignature(mi, excludeTypesAndDefaultValues) {
          if (typeof excludeTypesAndDefaultValues === "undefined") { excludeTypesAndDefaultValues = false; }
          return mi.parameters.map(function (x) {
            var str = x.name;
            if (!excludeTypesAndDefaultValues) {
              if (x.type) {
                str += ":" + x.type.getName();
              }
              if (x.value !== undefined) {
                str += " = " + literal(x.value);
              }
            }
            return str;
          }).join(", ");
        }

        function SourceTracer(writer) {
          this.writer = writer;
        }

        SourceTracer.prototype = {
          traceTraits: function traceTraits(traits, isStatic, inInterfaceNamespace) {
            var writer = this.writer;
            var tracer = this;

            traits.forEach(function (trait) {
              var str;
              var accessModifier = ABC.Multiname.getAccessModifier(trait.name);
              var namespaceName = trait.name.namespaces[0].uri;
              if (namespaceName) {
                if (namespaceName === "http://adobe.com/AS3/2006/builtin") {
                  namespaceName = "AS3";
                }
                if (accessModifier === "public") {
                  str = inInterfaceNamespace === namespaceName ? "" : namespaceName;
                } else {
                  str = accessModifier;
                }
              } else {
                str = accessModifier;
              }
              if (isStatic) {
                str += " static";
              }
              if (trait.isSlot() || trait.isConst()) {
                tracer.traceMetadata(trait.metadata);
                if (trait.isConst()) {
                  str += " const";
                } else {
                  str += " var";
                }
                str += " " + trait.name.getName();
                if (trait.typeName) {
                  str += ":" + trait.typeName.getName();
                }
                if (trait.value) {
                  str += " = " + literal(trait.value);
                }
                writer.writeLn(str + ";");
              } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
                tracer.traceMetadata(trait.metadata);
                var mi = trait.methodInfo;
                if (trait.attributes & 2 /* Override */) {
                  str += " override";
                }
                if (mi.isNative()) {
                  str += " native";
                }
                str += " function";
                str += trait.isGetter() ? " get" : (trait.isSetter() ? " set" : "");
                str += " " + trait.name.getName();
                str += "(" + getSignature(mi) + ")";
                str += mi.returnType ? ":" + mi.returnType.getName() : "";

                if (true) {
                  var className;
                  var prefix = "";
                  if (trait.holder instanceof ABC.ClassInfo) {
                    className = trait.holder.instanceInfo.name;
                    if (className.namespaces[0].uri) {
                      prefix += className.namespaces[0].uri + "::";
                    }
                    prefix += className.getName();
                    prefix += "$/";
                  } else if (trait.holder instanceof ABC.InstanceInfo) {
                    className = trait.holder.name;
                    if (className.namespaces[0].uri) {
                      prefix += className.namespaces[0].uri + "::";
                    }
                    prefix += className.getName();
                    prefix += "/";
                  } else {
                    prefix = "global/";
                  }
                  var getSet = trait.isGetter() ? "get " : (trait.isSetter() ? "set " : "");
                  if (!mi.isNative()) {
                  }
                }

                if (mi.isNative()) {
                  writer.writeLn(str + ";");
                } else {
                  if (inInterfaceNamespace) {
                    writer.writeLn(str + ";");
                  } else {
                    writer.writeLn(str + " { notImplemented(\"" + trait.name.getName() + "\"); }");
                  }
                }
              } else if (trait.isClass()) {
                var className = trait.classInfo.instanceInfo.name;
                writer.enter("package " + className.namespaces[0].uri + " {\n");
                tracer.traceMetadata(trait.metadata);
                tracer.traceClass(trait.classInfo);
                writer.leave("\n}");
                tracer.traceClassStub(trait);
              } else {
                notImplemented(trait);
              }
            });
          },
          traceClassStub2: function traceClassStub(trait) {
            var writer = this.writer;

            var ci = trait.classInfo;
            var ii = ci.instanceInfo;
            var name = ii.name.getName();
            var native = trait.metadata ? trait.metadata.native : null;
            if (!native) {
              return false;
            }

            writer.writeLn("Cut and paste the following into `native.js' and edit accordingly");
            writer.writeLn("8< --------------------------------------------------------------");
            writer.enter("natives." + native.cls + " = function " + native.cls + "(runtime, scope, instanceConstructor, baseClass) {");
            writer.writeLn("var c = new Class(\"" + name + "\", instanceConstructor, ApplicationDomain.passthroughCallable(instanceConstructor));");
            writer.writeLn("c.extend(baseClass);\n");

            function traceTraits(traits, isStatic) {
              if (typeof isStatic === "undefined") { isStatic = false; }
              var nativeMethodTraits = [];

              traits.forEach(function (trait, i) {
                if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
                  if (trait.methodInfo.isNative()) {
                    nativeMethodTraits.push(trait);
                  }
                }
              });

              nativeMethodTraits.forEach(function (trait, i) {
                var mi = trait.methodInfo;
                var traitName = trait.name.getName();
                writer.writeLn("// " + traitName + " :: " + (mi.parameters.length ? getSignature(mi) : "void") + " -> " + (mi.returnType ? mi.returnType.getName() : "any"));
                var prop;
                if (trait.isGetter()) {
                  prop = "\"get " + traitName + "\"";
                } else if (trait.isSetter()) {
                  prop = "\"set " + traitName + "\"";
                } else {
                  prop = traitName;
                }

                writer.enter(prop + ": function " + traitName + "(" + getSignature(mi, true) + ") {");
                writer.writeLn("  notImplemented(\"" + name + "." + traitName + "\");");
                writer.leave("}" + (i === nativeMethodTraits.length - 1 ? "" : ",\n"));
              });
            }

            writer.enter("c.nativeStatics = {");
            traceTraits(ci.traits, true);
            writer.leave("};\n");
            writer.enter("c.nativeMethods = {");
            traceTraits(ii.traits);
            writer.leave("};\n");

            writer.writeLn("return c;");
            writer.leave("};");
            writer.writeLn("-------------------------------------------------------------- >8");

            return true;
          },
          traceClassStub: function traceClassStub(trait) {
            var writer = this.writer;

            var ci = trait.classInfo;
            var ii = ci.instanceInfo;
            var className = ii.name.getName();
            var native = trait.metadata ? trait.metadata.native : null;

            writer.writeLn("Cut and paste the following glue and edit accordingly.");
            writer.writeLn("Class " + ii);
            writer.writeLn("8< --------------------------------------------------------------");

            var uri = ii.name.namespaces[0].uri;

            writer.enter("var " + className + "Definition = (function () {");
            function maxTraitNameLength(traits) {
              var length = 0;
              traits.forEach(function (t) {
                length = Math.max(t.name.name.length, length);
              });
              return length;
            }

            function quote(s) {
              return '\'' + s + '\'';
            }

            function filterTraits(traits, isNative) {
              function isMethod(x) {
                return x.isMethod() || x.isGetter() || x.isSetter();
              }
              return {
                properties: traits.filter(function (trait) {
                  return !isNative && !isMethod(trait);
                }),
                methods: traits.filter(function (trait) {
                  return isMethod(trait) && (isNative === trait.methodInfo.isNative());
                })
              };
            }

            function writeTraits(traits, isNative, isStatic) {
              if (typeof isStatic === "undefined") { isStatic = false; }
              traits = filterTraits(traits, isNative);

              var methods = [];
              var gettersAndSetters = Shumway.ObjectUtilities.createEmptyObject();

              traits.methods.forEach(function (trait, i) {
                var traitName = trait.name.getName();
                if (trait.isGetter() || trait.isSetter()) {
                  if (!gettersAndSetters[traitName]) {
                    gettersAndSetters[traitName] = [];
                  }
                  gettersAndSetters[traitName].push(trait);
                } else {
                  methods.push(trait);
                }
              });

              function writeTrait(trait, writeComma) {
                var mi = trait.methodInfo;
                var traitName = trait.name.getName();
                var signature = "// (" + (mi.parameters.length ? getSignature(mi) : "void") + ") -> " + (mi.returnType ? mi.returnType.getName() : "any");
                var propertyName = traitName;
                if (trait.isGetter()) {
                  propertyName = "get";
                } else if (trait.isSetter()) {
                  propertyName = "set";
                }
                writer.enter(propertyName + ": function " + traitName + "(" + getSignature(mi, true) + ") { " + signature);
                writer.writeLn("notImplemented(\"" + className + "." + traitName + "\");");
                if (!isStatic) {
                  if (trait.isGetter()) {
                    writer.writeLn("return this._" + traitName + ";");
                  } else if (trait.isSetter()) {
                    writer.writeLn("this._" + traitName + " = " + mi.parameters[0].name + ";");
                  }
                }
                writer.leave("}" + (writeComma ? "," : ""));
              }

              for (var i = 0; i < methods.length; i++) {
                writeTrait(methods[i], i < methods.length - 1);
              }

              var keyValues = Shumway.ObjectUtilities.toKeyValueArray(gettersAndSetters);
              for (var j = 0; j < keyValues.length; j++) {
                writer.enter(keyValues[j][0] + ": {");
                var list = keyValues[j][1];
                for (var i = 0; i < list.length; i++) {
                  writeTrait(list[i], i < list.length - 1);
                }
                writer.leave("}" + (j < keyValues.length - 1 ? "," : ""));
              }

              traits.properties.forEach(function (trait, i) {
                var traitName = trait.name.getName();
                var last = i === traits.properties.length - 1;

                if (trait.name.getNamespace().isPublic()) {
                  writer.writeLn(traitName + ": " + quote("public " + trait.name.name) + (last ? "" : ","));
                }
              });
            }

            writer.enter("return {");
            writer.writeLn("// (" + getSignature(ii.init, false) + ")");
            writer.writeLn("__class__: \"" + uri + "." + className + "\",");
            writer.enter("initialize: function () {");
            writer.leave("},");
            writer.enter("__glue__: {");
            writer.enter("native: {");
            writer.enter("static: {");
            writeTraits(ci.traits, true, true);
            writer.leave("},");
            writer.enter("instance: {");
            writeTraits(ii.traits, true);
            writer.leave("}");
            writer.leave("},");
            writer.enter("script: {");
            writer.writeLn("instance: Glue.ALL");
            writer.leave("}");
            writer.leave("}");
            writer.leave("};");

            writer.leave("}).call(this);");
            writer.writeLn("-------------------------------------------------------------- >8");

            return true;
          },
          traceClass: function traceClass(ci) {
            var writer = this.writer;

            var ii = ci.instanceInfo;
            var name = ii.name;
            var str = ABC.Multiname.getAccessModifier(name);
            if (ii.isFinal()) {
              str += " final";
            }
            if (!ii.isSealed()) {
              str += " dynamic";
            }
            str += ii.isInterface() ? " interface " : " class ";
            str += name.getName();
            if (ii.superName && ii.superName.getName() !== "Object") {
              str += " extends " + ii.superName.getName();
            }
            if (ii.interfaces.length) {
              str += " implements " + ii.interfaces.map(function (x) {
                return x.getName();
              }).join(", ");
            }
            writer.enter(str + " {");
            if (!ii.isInterface()) {
              writer.writeLn("public function " + name.getName() + "(" + getSignature(ii.init) + ") {}");
            }
            var interfaceNamespace;
            if (ii.isInterface()) {
              interfaceNamespace = name.namespaces[0].uri + ":" + name.name;
            }
            this.traceTraits(ci.traits, true, interfaceNamespace);
            this.traceTraits(ii.traits, false, interfaceNamespace);
            writer.leave("}");
          },
          traceMetadata: function traceMetadata(metadata) {
            var writer = this.writer;

            for (var key in metadata) {
              if (metadata.hasOwnProperty(key)) {
                if (key.indexOf("__") === 0) {
                  continue;
                }
                writer.writeLn("[" + key + "(" + metadata[key].value.map(function (m) {
                  var str = m.key ? m.key + "=" : "";
                  return str + "\"" + m.value + "\"";
                }).join(", ") + ")]");
              }
            }
          }
        };

        return SourceTracer;
      })();

      function traceSource(writer, abc) {
        var tracer = new SourceTracer(writer);
        abc.scripts.forEach(function (script) {
          tracer.traceTraits(script.traits);
        });
      }

      function traceStatistics(writer, abc) {
        var libraryClassCounter = new Shumway.Metrics.Counter(true);
        var librarySuperClassCounter = new Shumway.Metrics.Counter(true);
        var libraryMethodCounter = new Shumway.Metrics.Counter(true);
        var libraryProperties = new Shumway.Metrics.Counter(true);

        var definedClasses = {};
        var definedMethods = {};
        var definedProperties = {};

        abc.classes.forEach(function (x) {
          var className = x.instanceInfo.name.name;
          definedClasses[className] = true;
        });

        abc.scripts.forEach(function (s) {
          s.traits.forEach(function (t) {
            if (t.isClass()) {
              var superClassName = t.classInfo.instanceInfo.superName ? t.classInfo.instanceInfo.superName.name : "?";
              if (!(superClassName in definedClasses)) {
                librarySuperClassCounter.count(superClassName);
              }
              t.classInfo.traits.forEach(function (st) {
                if (st.isMethod()) {
                  definedMethods[st.name.name] = true;
                } else {
                  definedProperties[st.name.name] = true;
                }
              });
              t.classInfo.instanceInfo.traits.forEach(function (it) {
                if (it.isMethod() && !(it.attributes & 2 /* Override */)) {
                  definedMethods[it.name.name] = true;
                } else {
                  definedProperties[it.name.name] = true;
                }
              });
            }
          });
        });

        var opCounter = new Shumway.Metrics.Counter(true);

        abc.methods.forEach(function (m) {
          if (!m.code) {
            return;
          }

          function readOperand(operand) {
            var value = 0;
            switch (operand.size) {
              case "s08":
                value = code.readS8();
                break;
              case "u08":
                value = code.readU8();
                break;
              case "s16":
                value = code.readS16();
                break;
              case "s24":
                value = code.readS24();
                break;
              case "u30":
                value = code.readU30();
                break;
              case "u32":
                value = code.readU32();
                break;
              default:
                release || assert(false);
                break;
            }
            var description = "";
            switch (operand.type) {
              case "":
                break;
              case "I":
                description = abc.constantPool.ints[value];
                break;
              case "U":
                description = abc.constantPool.uints[value];
                break;
              case "D":
                description = abc.constantPool.doubles[value];
                break;
              case "S":
                description = abc.constantPool.strings[value];
                break;
              case "N":
                description = abc.constantPool.namespaces[value];
                break;
              case "CI":
                description = abc.classes[value];
                break;
              case "M":
                description = abc.constantPool.multinames[value];
                break;
              default:
                description = "?";
                break;
            }
            return description;
          }

          var code = new ABC.AbcStream(m.code);
          while (code.remaining() > 0) {
            var bc = code.readU8();
            var op = Shumway.AVM2.opcodeTable[bc];
            var operands = null;
            if (op) {
              opCounter.count(op.name);
              if (op.operands) {
                operands = op.operands.map(readOperand);
              }
              switch (bc) {
                case 65 /* call */:
                case 67 /* callmethod */:
                  continue;
                case 70 /* callproperty */:
                case 76 /* callproplex */:
                case 79 /* callpropvoid */:
                case 68 /* callstatic */:
                case 69 /* callsuper */:
                case 78 /* callsupervoid */:
                  if (operands[0] && !(operands[0].name in definedMethods)) {
                    libraryMethodCounter.count(operands[0].name);
                  }
                  break;
                case 74 /* constructprop */:
                  if (operands[0] && !(operands[0].name in definedClasses)) {
                    libraryClassCounter.count(operands[0].name);
                  }
                  break;
                case 102 /* getproperty */:
                case 97 /* setproperty */:
                  if (operands[0] && !(operands[0].name in definedProperties)) {
                    libraryProperties.count(operands[0].name);
                  }
                  break;
              }
            }
          }
        });
        writer.writeLn(JSON.stringify({
          definedClasses: definedClasses,
          definedMethods: definedMethods,
          definedProperties: definedProperties,
          libraryClasses: libraryClassCounter.counts,
          librarySuperClasses: librarySuperClassCounter.counts,
          libraryMethods: libraryMethodCounter.counts,
          libraryProperties: libraryProperties.counts,
          operations: opCounter.counts
        }, null, 2));
      }
    })(AVM2.ABC || (AVM2.ABC = {}));
    var ABC = AVM2.ABC;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    var assert = Shumway.Debug.assert;
    var unexpected = Shumway.Debug.unexpected;

    var AbcStream = Shumway.AVM2.ABC.AbcStream;

    var top = Shumway.ArrayUtilities.top;
    var peek = Shumway.ArrayUtilities.peek;

    (function (OP) {
      OP[OP["bkpt"] = 0x01] = "bkpt";
      OP[OP["nop"] = 0x02] = "nop";
      OP[OP["throw"] = 0x03] = "throw";
      OP[OP["getsuper"] = 0x04] = "getsuper";
      OP[OP["setsuper"] = 0x05] = "setsuper";
      OP[OP["dxns"] = 0x06] = "dxns";
      OP[OP["dxnslate"] = 0x07] = "dxnslate";
      OP[OP["kill"] = 0x08] = "kill";
      OP[OP["label"] = 0x09] = "label";
      OP[OP["lf32x4"] = 0x0A] = "lf32x4";
      OP[OP["sf32x4"] = 0x0B] = "sf32x4";
      OP[OP["ifnlt"] = 0x0C] = "ifnlt";
      OP[OP["ifnle"] = 0x0D] = "ifnle";
      OP[OP["ifngt"] = 0x0E] = "ifngt";
      OP[OP["ifnge"] = 0x0F] = "ifnge";
      OP[OP["jump"] = 0x10] = "jump";
      OP[OP["iftrue"] = 0x11] = "iftrue";
      OP[OP["iffalse"] = 0x12] = "iffalse";
      OP[OP["ifeq"] = 0x13] = "ifeq";
      OP[OP["ifne"] = 0x14] = "ifne";
      OP[OP["iflt"] = 0x15] = "iflt";
      OP[OP["ifle"] = 0x16] = "ifle";
      OP[OP["ifgt"] = 0x17] = "ifgt";
      OP[OP["ifge"] = 0x18] = "ifge";
      OP[OP["ifstricteq"] = 0x19] = "ifstricteq";
      OP[OP["ifstrictne"] = 0x1A] = "ifstrictne";
      OP[OP["lookupswitch"] = 0x1B] = "lookupswitch";
      OP[OP["pushwith"] = 0x1C] = "pushwith";
      OP[OP["popscope"] = 0x1D] = "popscope";
      OP[OP["nextname"] = 0x1E] = "nextname";
      OP[OP["hasnext"] = 0x1F] = "hasnext";
      OP[OP["pushnull"] = 0x20] = "pushnull";
      OP[OP["pushundefined"] = 0x21] = "pushundefined";
      OP[OP["pushfloat"] = 0x22] = "pushfloat";
      OP[OP["nextvalue"] = 0x23] = "nextvalue";
      OP[OP["pushbyte"] = 0x24] = "pushbyte";
      OP[OP["pushshort"] = 0x25] = "pushshort";
      OP[OP["pushtrue"] = 0x26] = "pushtrue";
      OP[OP["pushfalse"] = 0x27] = "pushfalse";
      OP[OP["pushnan"] = 0x28] = "pushnan";
      OP[OP["pop"] = 0x29] = "pop";
      OP[OP["dup"] = 0x2A] = "dup";
      OP[OP["swap"] = 0x2B] = "swap";
      OP[OP["pushstring"] = 0x2C] = "pushstring";
      OP[OP["pushint"] = 0x2D] = "pushint";
      OP[OP["pushuint"] = 0x2E] = "pushuint";
      OP[OP["pushdouble"] = 0x2F] = "pushdouble";
      OP[OP["pushscope"] = 0x30] = "pushscope";
      OP[OP["pushnamespace"] = 0x31] = "pushnamespace";
      OP[OP["hasnext2"] = 0x32] = "hasnext2";
      OP[OP["li8"] = 0x35] = "li8";
      OP[OP["li16"] = 0x36] = "li16";
      OP[OP["li32"] = 0x37] = "li32";
      OP[OP["lf32"] = 0x38] = "lf32";
      OP[OP["lf64"] = 0x39] = "lf64";
      OP[OP["si8"] = 0x3A] = "si8";
      OP[OP["si16"] = 0x3B] = "si16";
      OP[OP["si32"] = 0x3C] = "si32";
      OP[OP["sf32"] = 0x3D] = "sf32";
      OP[OP["sf64"] = 0x3E] = "sf64";
      OP[OP["newfunction"] = 0x40] = "newfunction";
      OP[OP["call"] = 0x41] = "call";
      OP[OP["construct"] = 0x42] = "construct";
      OP[OP["callmethod"] = 0x43] = "callmethod";
      OP[OP["callstatic"] = 0x44] = "callstatic";
      OP[OP["callsuper"] = 0x45] = "callsuper";
      OP[OP["callproperty"] = 0x46] = "callproperty";
      OP[OP["returnvoid"] = 0x47] = "returnvoid";
      OP[OP["returnvalue"] = 0x48] = "returnvalue";
      OP[OP["constructsuper"] = 0x49] = "constructsuper";
      OP[OP["constructprop"] = 0x4A] = "constructprop";
      OP[OP["callsuperid"] = 0x4B] = "callsuperid";
      OP[OP["callproplex"] = 0x4C] = "callproplex";
      OP[OP["callinterface"] = 0x4D] = "callinterface";
      OP[OP["callsupervoid"] = 0x4E] = "callsupervoid";
      OP[OP["callpropvoid"] = 0x4F] = "callpropvoid";
      OP[OP["sxi1"] = 0x50] = "sxi1";
      OP[OP["sxi8"] = 0x51] = "sxi8";
      OP[OP["sxi16"] = 0x52] = "sxi16";
      OP[OP["applytype"] = 0x53] = "applytype";
      OP[OP["pushfloat4"] = 0x54] = "pushfloat4";
      OP[OP["newobject"] = 0x55] = "newobject";
      OP[OP["newarray"] = 0x56] = "newarray";
      OP[OP["newactivation"] = 0x57] = "newactivation";
      OP[OP["newclass"] = 0x58] = "newclass";
      OP[OP["getdescendants"] = 0x59] = "getdescendants";
      OP[OP["newcatch"] = 0x5A] = "newcatch";
      OP[OP["findpropstrict"] = 0x5D] = "findpropstrict";
      OP[OP["findproperty"] = 0x5E] = "findproperty";
      OP[OP["finddef"] = 0x5F] = "finddef";
      OP[OP["getlex"] = 0x60] = "getlex";
      OP[OP["setproperty"] = 0x61] = "setproperty";
      OP[OP["getlocal"] = 0x62] = "getlocal";
      OP[OP["setlocal"] = 0x63] = "setlocal";
      OP[OP["getglobalscope"] = 0x64] = "getglobalscope";
      OP[OP["getscopeobject"] = 0x65] = "getscopeobject";
      OP[OP["getproperty"] = 0x66] = "getproperty";
      OP[OP["getouterscope"] = 0x67] = "getouterscope";
      OP[OP["initproperty"] = 0x68] = "initproperty";
      OP[OP["setpropertylate"] = 0x69] = "setpropertylate";
      OP[OP["deleteproperty"] = 0x6A] = "deleteproperty";
      OP[OP["deletepropertylate"] = 0x6B] = "deletepropertylate";
      OP[OP["getslot"] = 0x6C] = "getslot";
      OP[OP["setslot"] = 0x6D] = "setslot";
      OP[OP["getglobalslot"] = 0x6E] = "getglobalslot";
      OP[OP["setglobalslot"] = 0x6F] = "setglobalslot";
      OP[OP["convert_s"] = 0x70] = "convert_s";
      OP[OP["esc_xelem"] = 0x71] = "esc_xelem";
      OP[OP["esc_xattr"] = 0x72] = "esc_xattr";
      OP[OP["convert_i"] = 0x73] = "convert_i";
      OP[OP["convert_u"] = 0x74] = "convert_u";
      OP[OP["convert_d"] = 0x75] = "convert_d";
      OP[OP["convert_b"] = 0x76] = "convert_b";
      OP[OP["convert_o"] = 0x77] = "convert_o";
      OP[OP["checkfilter"] = 0x78] = "checkfilter";
      OP[OP["convert_f"] = 0x79] = "convert_f";
      OP[OP["unplus"] = 0x7a] = "unplus";
      OP[OP["convert_f4"] = 0x7b] = "convert_f4";
      OP[OP["coerce"] = 0x80] = "coerce";
      OP[OP["coerce_b"] = 0x81] = "coerce_b";
      OP[OP["coerce_a"] = 0x82] = "coerce_a";
      OP[OP["coerce_i"] = 0x83] = "coerce_i";
      OP[OP["coerce_d"] = 0x84] = "coerce_d";
      OP[OP["coerce_s"] = 0x85] = "coerce_s";
      OP[OP["astype"] = 0x86] = "astype";
      OP[OP["astypelate"] = 0x87] = "astypelate";
      OP[OP["coerce_u"] = 0x88] = "coerce_u";
      OP[OP["coerce_o"] = 0x89] = "coerce_o";
      OP[OP["negate"] = 0x90] = "negate";
      OP[OP["increment"] = 0x91] = "increment";
      OP[OP["inclocal"] = 0x92] = "inclocal";
      OP[OP["decrement"] = 0x93] = "decrement";
      OP[OP["declocal"] = 0x94] = "declocal";
      OP[OP["typeof"] = 0x95] = "typeof";
      OP[OP["not"] = 0x96] = "not";
      OP[OP["bitnot"] = 0x97] = "bitnot";
      OP[OP["add"] = 0xA0] = "add";
      OP[OP["subtract"] = 0xA1] = "subtract";
      OP[OP["multiply"] = 0xA2] = "multiply";
      OP[OP["divide"] = 0xA3] = "divide";
      OP[OP["modulo"] = 0xA4] = "modulo";
      OP[OP["lshift"] = 0xA5] = "lshift";
      OP[OP["rshift"] = 0xA6] = "rshift";
      OP[OP["urshift"] = 0xA7] = "urshift";
      OP[OP["bitand"] = 0xA8] = "bitand";
      OP[OP["bitor"] = 0xA9] = "bitor";
      OP[OP["bitxor"] = 0xAA] = "bitxor";
      OP[OP["equals"] = 0xAB] = "equals";
      OP[OP["strictequals"] = 0xAC] = "strictequals";
      OP[OP["lessthan"] = 0xAD] = "lessthan";
      OP[OP["lessequals"] = 0xAE] = "lessequals";
      OP[OP["greaterthan"] = 0xAF] = "greaterthan";
      OP[OP["greaterequals"] = 0xB0] = "greaterequals";
      OP[OP["instanceof"] = 0xB1] = "instanceof";
      OP[OP["istype"] = 0xB2] = "istype";
      OP[OP["istypelate"] = 0xB3] = "istypelate";
      OP[OP["in"] = 0xB4] = "in";
      OP[OP["increment_i"] = 0xC0] = "increment_i";
      OP[OP["decrement_i"] = 0xC1] = "decrement_i";
      OP[OP["inclocal_i"] = 0xC2] = "inclocal_i";
      OP[OP["declocal_i"] = 0xC3] = "declocal_i";
      OP[OP["negate_i"] = 0xC4] = "negate_i";
      OP[OP["add_i"] = 0xC5] = "add_i";
      OP[OP["subtract_i"] = 0xC6] = "subtract_i";
      OP[OP["multiply_i"] = 0xC7] = "multiply_i";
      OP[OP["getlocal0"] = 0xD0] = "getlocal0";
      OP[OP["getlocal1"] = 0xD1] = "getlocal1";
      OP[OP["getlocal2"] = 0xD2] = "getlocal2";
      OP[OP["getlocal3"] = 0xD3] = "getlocal3";
      OP[OP["setlocal0"] = 0xD4] = "setlocal0";
      OP[OP["setlocal1"] = 0xD5] = "setlocal1";
      OP[OP["setlocal2"] = 0xD6] = "setlocal2";
      OP[OP["setlocal3"] = 0xD7] = "setlocal3";
      OP[OP["invalid"] = 0xED] = "invalid";
      OP[OP["debug"] = 0xEF] = "debug";
      OP[OP["debugline"] = 0xF0] = "debugline";
      OP[OP["debugfile"] = 0xF1] = "debugfile";
      OP[OP["bkptline"] = 0xF2] = "bkptline";
      OP[OP["timestamp"] = 0xF3] = "timestamp";
    })(AVM2.OP || (AVM2.OP = {}));
    var OP = AVM2.OP;

    AVM2.opcodeTable = [
      null,
      { name: "bkpt", canThrow: false, operands: [] },
      { name: "nop", canThrow: false, operands: [] },
      { name: "throw", canThrow: true, operands: [] },
      { name: "getsuper", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "setsuper", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "dxns", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "dxnslate", canThrow: true, operands: [] },
      { name: "kill", canThrow: false, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "label", canThrow: false, operands: [] },
      { name: "lf32x4", canThrow: true, operands: [] },
      { name: "sf32x4", canThrow: true, operands: [] },
      { name: "ifnlt", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifnle", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifngt", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifnge", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "jump", canThrow: false, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "iftrue", canThrow: false, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "iffalse", canThrow: false, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifeq", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifne", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "iflt", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifle", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifgt", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifge", canThrow: true, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifstricteq", canThrow: false, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "ifstrictne", canThrow: false, operands: [{ name: "offset", size: "s24", type: "" }] },
      { name: "lookupswitch", canThrow: false, operands: null },
      { name: "pushwith", canThrow: false, operands: [] },
      { name: "popscope", canThrow: false, operands: [] },
      { name: "nextname", canThrow: true, operands: [] },
      { name: "hasnext", canThrow: true, operands: [] },
      { name: "pushnull", canThrow: false, operands: [] },
      { name: "pushundefined", canThrow: false, operands: [] },
      null,
      { name: "nextvalue", canThrow: true, operands: [] },
      { name: "pushbyte", canThrow: false, operands: [{ name: "value", size: "s08", type: "" }] },
      { name: "pushshort", canThrow: false, operands: [{ name: "value", size: "s16", type: "" }] },
      { name: "pushtrue", canThrow: false, operands: [] },
      { name: "pushfalse", canThrow: false, operands: [] },
      { name: "pushnan", canThrow: false, operands: [] },
      { name: "pop", canThrow: false, operands: [] },
      { name: "dup", canThrow: false, operands: [] },
      { name: "swap", canThrow: false, operands: [] },
      { name: "pushstring", canThrow: false, operands: [{ name: "index", size: "u30", type: "S" }] },
      { name: "pushint", canThrow: false, operands: [{ name: "index", size: "u30", type: "I" }] },
      { name: "pushuint", canThrow: false, operands: [{ name: "index", size: "u30", type: "U" }] },
      { name: "pushdouble", canThrow: false, operands: [{ name: "index", size: "u30", type: "D" }] },
      { name: "pushscope", canThrow: false, operands: [] },
      { name: "pushnamespace", canThrow: false, operands: [{ name: "index", size: "u30", type: "N" }] },
      { name: "hasnext2", canThrow: true, operands: [{ name: "object", size: "u30", type: "" }, { name: "index", size: "u30", type: "" }] },
      { name: "lix8", canThrow: true, operands: null },
      { name: "lix16", canThrow: true, operands: null },
      { name: "li8", canThrow: true, operands: [] },
      { name: "li16", canThrow: true, operands: [] },
      { name: "li32", canThrow: true, operands: [] },
      { name: "lf32", canThrow: true, operands: [] },
      { name: "lf64", canThrow: true, operands: [] },
      { name: "si8", canThrow: true, operands: [] },
      { name: "si16", canThrow: true, operands: [] },
      { name: "si32", canThrow: true, operands: [] },
      { name: "sf32", canThrow: true, operands: [] },
      { name: "sf64", canThrow: true, operands: [] },
      null,
      { name: "newfunction", canThrow: true, operands: [{ name: "index", size: "u30", type: "MI" }] },
      { name: "call", canThrow: true, operands: [{ name: "argCount", size: "u30", type: "" }] },
      { name: "construct", canThrow: true, operands: [{ name: "argCount", size: "u30", type: "" }] },
      { name: "callmethod", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }, { name: "argCount", size: "u30", type: "" }] },
      { name: "callstatic", canThrow: true, operands: [{ name: "index", size: "u30", type: "MI" }, { name: "argCount", size: "u30", type: "" }] },
      { name: "callsuper", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }, { name: "argCount", size: "u30", type: "" }] },
      { name: "callproperty", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }, { name: "argCount", size: "u30", type: "" }] },
      { name: "returnvoid", canThrow: false, operands: [] },
      { name: "returnvalue", canThrow: true, operands: [] },
      { name: "constructsuper", canThrow: true, operands: [{ name: "argCount", size: "u30", type: "" }] },
      { name: "constructprop", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }, { name: "argCount", size: "u30", type: "" }] },
      { name: "callsuperid", canThrow: true, operands: null },
      { name: "callproplex", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }, { name: "argCount", size: "u30", type: "" }] },
      { name: "callinterface", canThrow: true, operands: null },
      { name: "callsupervoid", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }, { name: "argCount", size: "u30", type: "" }] },
      { name: "callpropvoid", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }, { name: "argCount", size: "u30", type: "" }] },
      { name: "sxi1", canThrow: false, operands: [] },
      { name: "sxi8", canThrow: false, operands: [] },
      { name: "sxi16", canThrow: false, operands: [] },
      { name: "applytype", canThrow: true, operands: [{ name: "argCount", size: "u30", type: "" }] },
      { name: "pushfloat4", canThrow: false, operands: null },
      { name: "newobject", canThrow: true, operands: [{ name: "argCount", size: "u30", type: "" }] },
      { name: "newarray", canThrow: true, operands: [{ name: "argCount", size: "u30", type: "" }] },
      { name: "newactivation", canThrow: true, operands: [] },
      { name: "newclass", canThrow: true, operands: [{ name: "index", size: "u30", type: "CI" }] },
      { name: "getdescendants", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      { name: "newcatch", canThrow: true, operands: [{ name: "index", size: "u30", type: "EI" }] },
      { name: "findpropglobalstrict", canThrow: true, operands: null },
      { name: "findpropglobal", canThrow: true, operands: null },
      { name: "findpropstrict", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      { name: "findproperty", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      { name: "finddef", canThrow: true, operands: null },
      { name: "getlex", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      { name: "setproperty", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      { name: "getlocal", canThrow: false, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "setlocal", canThrow: false, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "getglobalscope", canThrow: false, operands: [] },
      { name: "getscopeobject", canThrow: false, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "getproperty", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      { name: "getouterscope", canThrow: false, operands: null },
      { name: "initproperty", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      null,
      { name: "deleteproperty", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      null,
      { name: "getslot", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "setslot", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "getglobalslot", canThrow: false, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "setglobalslot", canThrow: false, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "convert_s", canThrow: true, operands: [] },
      { name: "esc_xelem", canThrow: true, operands: [] },
      { name: "esc_xattr", canThrow: true, operands: [] },
      { name: "convert_i", canThrow: true, operands: [] },
      { name: "convert_u", canThrow: true, operands: [] },
      { name: "convert_d", canThrow: true, operands: [] },
      { name: "convert_b", canThrow: true, operands: [] },
      { name: "convert_o", canThrow: true, operands: [] },
      { name: "checkfilter", canThrow: true, operands: [] },
      { name: "convert_f", canThrow: true, operands: [] },
      { name: "unplus", canThrow: true, operands: [] },
      { name: "convert_f4", canThrow: true, operands: [] },
      null,
      null,
      null,
      null,
      { name: "coerce", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      { name: "coerce_b", canThrow: true, operands: [] },
      { name: "coerce_a", canThrow: true, operands: [] },
      { name: "coerce_i", canThrow: true, operands: [] },
      { name: "coerce_d", canThrow: true, operands: [] },
      { name: "coerce_s", canThrow: true, operands: [] },
      { name: "astype", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      { name: "astypelate", canThrow: true, operands: [] },
      { name: "coerce_u", canThrow: true, operands: [] },
      { name: "coerce_o", canThrow: true, operands: [] },
      null,
      null,
      null,
      null,
      null,
      null,
      { name: "negate", canThrow: true, operands: [] },
      { name: "increment", canThrow: true, operands: [] },
      { name: "inclocal", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "decrement", canThrow: true, operands: [] },
      { name: "declocal", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "typeof", canThrow: false, operands: [] },
      { name: "not", canThrow: false, operands: [] },
      { name: "bitnot", canThrow: true, operands: [] },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      { name: "add", canThrow: true, operands: [] },
      { name: "subtract", canThrow: true, operands: [] },
      { name: "multiply", canThrow: true, operands: [] },
      { name: "divide", canThrow: true, operands: [] },
      { name: "modulo", canThrow: true, operands: [] },
      { name: "lshift", canThrow: true, operands: [] },
      { name: "rshift", canThrow: true, operands: [] },
      { name: "urshift", canThrow: true, operands: [] },
      { name: "bitand", canThrow: true, operands: [] },
      { name: "bitor", canThrow: true, operands: [] },
      { name: "bitxor", canThrow: true, operands: [] },
      { name: "equals", canThrow: true, operands: [] },
      { name: "strictequals", canThrow: true, operands: [] },
      { name: "lessthan", canThrow: true, operands: [] },
      { name: "lessequals", canThrow: true, operands: [] },
      { name: "greaterthan", canThrow: true, operands: [] },
      { name: "greaterequals", canThrow: true, operands: [] },
      { name: "instanceof", canThrow: true, operands: [] },
      { name: "istype", canThrow: true, operands: [{ name: "index", size: "u30", type: "M" }] },
      { name: "istypelate", canThrow: true, operands: [] },
      { name: "in", canThrow: true, operands: [] },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      { name: "increment_i", canThrow: true, operands: [] },
      { name: "decrement_i", canThrow: true, operands: [] },
      { name: "inclocal_i", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "declocal_i", canThrow: true, operands: [{ name: "index", size: "u30", type: "" }] },
      { name: "negate_i", canThrow: true, operands: [] },
      { name: "add_i", canThrow: true, operands: [] },
      { name: "subtract_i", canThrow: true, operands: [] },
      { name: "multiply_i", canThrow: true, operands: [] },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      { name: "getlocal0", canThrow: false, operands: [] },
      { name: "getlocal1", canThrow: false, operands: [] },
      { name: "getlocal2", canThrow: false, operands: [] },
      { name: "getlocal3", canThrow: false, operands: [] },
      { name: "setlocal0", canThrow: false, operands: [] },
      { name: "setlocal1", canThrow: false, operands: [] },
      { name: "setlocal2", canThrow: false, operands: [] },
      { name: "setlocal3", canThrow: false, operands: [] },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      { name: "invalid", canThrow: false, operands: [] },
      null,
      { name: "debug", canThrow: true, operands: [{ name: "debugType", size: "u08", type: "" }, { name: "index", size: "u30", type: "S" }, { name: "reg", size: "u08", type: "" }, { name: "extra", size: "u30", type: "" }] },
      { name: "debugline", canThrow: true, operands: [{ name: "lineNumber", size: "u30", type: "" }] },
      { name: "debugfile", canThrow: true, operands: [{ name: "index", size: "u30", type: "S" }] },
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ];

    function opcodeName(op) {
      return AVM2.opcodeTable[op].name;
    }
    AVM2.opcodeName = opcodeName;

    var Bytecode = (function () {
      function Bytecode(code) {
        var op = code.readU8();
        this.op = op;
        this.originalPosition = code.position;

        var opdesc = Shumway.AVM2.opcodeTable[op];
        if (!opdesc) {
          unexpected("Unknown Op " + op);
        }

        this.canThrow = opdesc.canThrow;

        var i, n;

        switch (op) {
          case 27 /* lookupswitch */:
            var defaultOffset = code.readS24();
            this.offsets = [];
            var n = code.readU30() + 1;
            for (i = 0; i < n; i++) {
              this.offsets.push(code.readS24());
            }
            this.offsets.push(defaultOffset);
            break;
          default:
            for (i = 0, n = opdesc.operands.length; i < n; i++) {
              var operand = opdesc.operands[i];

              switch (operand.size) {
                case "u08":
                  this[operand.name] = code.readU8();
                  break;
                case "s08":
                  this[operand.name] = code.readS8();
                  break;
                case "s16":
                  this[operand.name] = code.readS16();
                  break;
                case "s24":
                  this[operand.name] = code.readS24();
                  break;
                case "u30":
                  this[operand.name] = code.readU30();
                  break;
                case "u32":
                  this[operand.name] = code.readU32();
                  break;
                default:
                  unexpected();
              }
            }
        }
      }
      Bytecode.prototype.makeBlockHead = function (id) {
        if (this.succs) {
          return id;
        }

        this.bid = id;

        this.succs = [];
        this.preds = [];

        this.dominatees = [];

        return id + 1;
      };

      Bytecode.prototype.trace = function (writer) {
        if (!this.succs) {
          return;
        }

        writer.writeLn("#" + this.bid);
      };

      Bytecode.prototype.toString = function (abc) {
        var opDescription = Shumway.AVM2.opcodeTable[this.op];
        var str = opDescription.name.padRight(' ', 20);
        var i, j;

        if (this.op === 27 /* lookupswitch */) {
          str += "targets:";
          for (i = 0, j = this.targets.length; i < j; i++) {
            str += (i > 0 ? "," : "") + this.targets[i].position;
          }
        } else {
          for (i = 0, j = opDescription.operands.length; i < j; i++) {
            var operand = opDescription.operands[i];
            if (operand.name === "offset") {
              str += "target:" + this.target.position;
            } else {
              str += operand.name + ": ";
              var value = this[operand.name];
              if (abc) {
                switch (operand.type) {
                  case "":
                    str += value;
                    break;
                  case "I":
                    str += abc.constantPool.ints[value];
                    break;
                  case "U":
                    str += abc.constantPool.uints[value];
                    break;
                  case "D":
                    str += abc.constantPool.doubles[value];
                    break;
                  case "S":
                    str += abc.constantPool.strings[value];
                    break;
                  case "N":
                    str += abc.constantPool.namespaces[value];
                    break;
                  case "CI":
                    str += abc.classes[value];
                    break;
                  case "M":
                    str += abc.constantPool.multinames[value];
                    break;
                  default:
                    str += "?";
                    break;
                }
              } else {
                str += value;
              }
            }

            if (i < j - 1) {
              str += ", ";
            }
          }
        }

        return str;
      };
      return Bytecode;
    })();
    AVM2.Bytecode = Bytecode;

    var BITS_PER_WORD = Shumway.BitSets.BITS_PER_WORD;
    var ADDRESS_BITS_PER_WORD = Shumway.BitSets.ADDRESS_BITS_PER_WORD;
    var BIT_INDEX_MASK = Shumway.BitSets.BIT_INDEX_MASK;

    var BlockSet = (function (_super) {
      __extends(BlockSet, _super);
      function BlockSet(length, blockById) {
        _super.call(this, length);
        this.blockById = blockById;
      }
      BlockSet.prototype.forEachBlock = function (fn) {
        release || assert(fn);
        var byId = this.blockById;
        var bits = this.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          var word = bits[i];
          if (word) {
            for (var k = 0; k < BITS_PER_WORD; k++) {
              if (word & (1 << k)) {
                fn(byId[i * BITS_PER_WORD + k]);
              }
            }
          }
        }
      };

      BlockSet.prototype.choose = function () {
        var byId = this.blockById;
        var bits = this.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          var word = bits[i];
          if (word) {
            for (var k = 0; k < BITS_PER_WORD; k++) {
              if (word & (1 << k)) {
                return byId[i * BITS_PER_WORD + k];
              }
            }
          }
        }
      };

      BlockSet.prototype.members = function () {
        var byId = this.blockById;
        var set = [];
        var bits = this.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          var word = bits[i];
          if (word) {
            for (var k = 0; k < BITS_PER_WORD; k++) {
              if (word & (1 << k)) {
                set.push(byId[i * BITS_PER_WORD + k]);
              }
            }
          }
        }
        return set;
      };

      BlockSet.prototype.setBlocks = function (bs) {
        var bits = this.bits;
        for (var i = 0, j = bs.length; i < j; i++) {
          var id = bs[i].bid;
          bits[id >> ADDRESS_BITS_PER_WORD] |= 1 << (id & BIT_INDEX_MASK);
        }
      };
      return BlockSet;
    })(Shumway.BitSets.Uint32ArrayBitSet);
    AVM2.BlockSet = BlockSet;

    var Analysis = (function () {
      function Analysis(methodInfo) {
        this.methodInfo = methodInfo;
        if (this.methodInfo.code) {
          AVM2.enterTimeline("normalizeBytecode");
          this.normalizeBytecode();
          AVM2.leaveTimeline();
        }
      }
      Analysis.prototype.makeBlockSetFactory = function (length, blockById) {
        release || assert(!this.boundBlockSet);
        this.boundBlockSet = (function blockSet() {
          return new Shumway.AVM2.BlockSet(length, blockById);
        });
      };

      Analysis.prototype.accessLocal = function (index) {
        if (index-- === 0)
          return;
        if (index < this.methodInfo.parameters.length) {
          this.methodInfo.parameters[index].isUsed = true;
        }
      };

      Analysis.prototype.getInvalidTarget = function (cache, offset) {
        if (cache && cache[offset]) {
          return cache[offset];
        }

        var code = Object.create(Bytecode.prototype);
        code.op = 237 /* invalid */;
        code.position = offset;
        cache && (cache[offset] = code);
        return code;
      };

      Analysis.prototype.normalizeBytecode = function () {
        var methodInfo = this.methodInfo;

        var bytecodesOffset = [];

        var bytecodes = [];
        var codeStream = new AbcStream(this.methodInfo.code);
        var bytecode;

        while (codeStream.remaining() > 0) {
          var pos = codeStream.position;
          bytecode = new Bytecode(codeStream);

          switch (bytecode.op) {
            case 2 /* nop */:
            case 9 /* label */:
              bytecodesOffset[pos] = bytecodes.length;
              continue;

            case 27 /* lookupswitch */:
              this.methodInfo.hasLookupSwitches = true;
              bytecode.targets = [];
              var offsets = bytecode.offsets;
              for (var i = 0, j = offsets.length; i < j; i++) {
                offsets[i] += pos;
              }
              break;

            case 16 /* jump */:
            case 21 /* iflt */:
            case 12 /* ifnlt */:
            case 22 /* ifle */:
            case 13 /* ifnle */:
            case 23 /* ifgt */:
            case 14 /* ifngt */:
            case 24 /* ifge */:
            case 15 /* ifnge */:
            case 19 /* ifeq */:
            case 20 /* ifne */:
            case 25 /* ifstricteq */:
            case 26 /* ifstrictne */:
            case 17 /* iftrue */:
            case 18 /* iffalse */:
              bytecode.offset += codeStream.position;
              break;
            case 208 /* getlocal0 */:
            case 209 /* getlocal1 */:
            case 210 /* getlocal2 */:
            case 211 /* getlocal3 */:
              this.accessLocal(bytecode.op - 208 /* getlocal0 */);
              break;
            case 98 /* getlocal */:
              this.accessLocal(bytecode.index);
              break;
            default:
              break;
          }

          bytecode.position = bytecodes.length;
          bytecodesOffset[pos] = bytecodes.length;
          bytecodes.push(bytecode);
        }

        var invalidJumps = {};
        var newOffset;
        for (var pc = 0, end = bytecodes.length; pc < end; pc++) {
          bytecode = bytecodes[pc];
          switch (bytecode.op) {
            case 27 /* lookupswitch */:
              var offsets = bytecode.offsets;
              for (var i = 0, j = offsets.length; i < j; i++) {
                newOffset = bytecodesOffset[offsets[i]];
                bytecode.targets.push(bytecodes[newOffset] || this.getInvalidTarget(invalidJumps, offsets[i]));
                offsets[i] = newOffset;
              }
              break;

            case 16 /* jump */:
            case 21 /* iflt */:
            case 12 /* ifnlt */:
            case 22 /* ifle */:
            case 13 /* ifnle */:
            case 23 /* ifgt */:
            case 14 /* ifngt */:
            case 24 /* ifge */:
            case 15 /* ifnge */:
            case 19 /* ifeq */:
            case 20 /* ifne */:
            case 25 /* ifstricteq */:
            case 26 /* ifstrictne */:
            case 17 /* iftrue */:
            case 18 /* iffalse */:
              newOffset = bytecodesOffset[bytecode.offset];
              bytecode.target = (bytecodes[newOffset] || this.getInvalidTarget(invalidJumps, bytecode.offset));
              bytecode.offset = newOffset;
              break;
            default:
          }
        }

        this.bytecodes = bytecodes;

        var exceptions = this.methodInfo.exceptions;
        for (var i = 0, j = exceptions.length; i < j; i++) {
          var ex = exceptions[i];
          ex.start = bytecodesOffset[ex.start];
          ex.end = bytecodesOffset[ex.end];
          ex.offset = bytecodesOffset[ex.target];
          ex.target = bytecodes[ex.offset];
          ex.target.exception = ex;
        }
      };

      Analysis.prototype.analyzeControlFlow = function () {
        release || assert(this.bytecodes);
        AVM2.enterTimeline("analyzeControlFlow");
        this.detectBasicBlocks();
        this.normalizeReachableBlocks();
        this.computeDominance();
        this.analyzedControlFlow = true;
        AVM2.leaveTimeline();
        return true;
      };

      Analysis.prototype.detectBasicBlocks = function () {
        var bytecodes = this.bytecodes;
        var exceptions = this.methodInfo.exceptions;
        var hasExceptions = exceptions.length > 0;
        var blockById = {};
        var code;
        var pc, end;
        var id = 0;

        function tryTargets(block) {
          var targets = [];
          for (var i = 0, j = exceptions.length; i < j; i++) {
            var ex = exceptions[i];
            if (block.position >= ex.start && block.end.position <= ex.end) {
              targets.push(ex.target);
            }
          }
          return targets;
        }

        id = bytecodes[0].makeBlockHead(id);
        for (pc = 0, end = bytecodes.length - 1; pc < end; pc++) {
          code = bytecodes[pc];
          switch (code.op) {
            case 71 /* returnvoid */:
            case 72 /* returnvalue */:
            case 3 /* throw */:
              id = bytecodes[pc + 1].makeBlockHead(id);
              break;

            case 27 /* lookupswitch */:
              var targets = code.targets;
              for (var i = 0, j = targets.length; i < j; i++) {
                id = targets[i].makeBlockHead(id);
              }
              id = bytecodes[pc + 1].makeBlockHead(id);
              break;

            case 16 /* jump */:
            case 21 /* iflt */:
            case 12 /* ifnlt */:
            case 22 /* ifle */:
            case 13 /* ifnle */:
            case 23 /* ifgt */:
            case 14 /* ifngt */:
            case 24 /* ifge */:
            case 15 /* ifnge */:
            case 19 /* ifeq */:
            case 20 /* ifne */:
            case 25 /* ifstricteq */:
            case 26 /* ifstrictne */:
            case 17 /* iftrue */:
            case 18 /* iffalse */:
              id = code.target.makeBlockHead(id);
              id = bytecodes[pc + 1].makeBlockHead(id);
              break;

            default:
          }
        }

        code = bytecodes[end];
        switch (code.op) {
          case 71 /* returnvoid */:
          case 72 /* returnvalue */:
          case 3 /* throw */:
            break;

          case 27 /* lookupswitch */:
            var targets = code.targets;
            for (var i = 0, j = targets.length; i < j; i++) {
              id = targets[i].makeBlockHead(id);
            }
            break;

          case 16 /* jump */:
            id = code.target.makeBlockHead(id);
            break;

          case 21 /* iflt */:
          case 12 /* ifnlt */:
          case 22 /* ifle */:
          case 13 /* ifnle */:
          case 23 /* ifgt */:
          case 14 /* ifngt */:
          case 24 /* ifge */:
          case 15 /* ifnge */:
          case 19 /* ifeq */:
          case 20 /* ifne */:
          case 25 /* ifstricteq */:
          case 26 /* ifstrictne */:
          case 17 /* iftrue */:
          case 18 /* iffalse */:
            id = code.target.makeBlockHead(id);
            bytecodes[pc + 1] = this.getInvalidTarget(null, pc + 1);
            id = bytecodes[pc + 1].makeBlockHead(id);
            break;

          default:
        }

        if (hasExceptions) {
          for (var i = 0; i < exceptions.length; i++) {
            var ex = exceptions[i];
            var tryStart = bytecodes[ex.start];
            var afterTry = bytecodes[ex.end + 1];

            id = tryStart.makeBlockHead(id);
            if (afterTry) {
              id = afterTry.makeBlockHead(id);
            }
            id = ex.target.makeBlockHead(id);
          }
        }

        var currentBlock = bytecodes[0];
        for (pc = 1, end = bytecodes.length; pc < end; pc++) {
          if (!bytecodes[pc].succs) {
            continue;
          }

          release || assert(currentBlock.succs);

          blockById[currentBlock.bid] = currentBlock;
          code = bytecodes[pc - 1];
          currentBlock.end = code;
          var nextBlock = bytecodes[pc];

          switch (code.op) {
            case 71 /* returnvoid */:
            case 72 /* returnvalue */:
            case 3 /* throw */:
              break;

            case 27 /* lookupswitch */:
              for (var i = 0, j = code.targets.length; i < j; i++) {
                currentBlock.succs.push(code.targets[i]);
              }
              break;

            case 16 /* jump */:
              currentBlock.succs.push(code.target);
              break;

            case 21 /* iflt */:
            case 12 /* ifnlt */:
            case 22 /* ifle */:
            case 13 /* ifnle */:
            case 23 /* ifgt */:
            case 14 /* ifngt */:
            case 24 /* ifge */:
            case 15 /* ifnge */:
            case 19 /* ifeq */:
            case 20 /* ifne */:
            case 25 /* ifstricteq */:
            case 26 /* ifstrictne */:
            case 17 /* iftrue */:
            case 18 /* iffalse */:
              currentBlock.succs.push(code.target);
              if (code.target !== nextBlock) {
                currentBlock.succs.push(nextBlock);
              }
              break;

            default:
              currentBlock.succs.push(nextBlock);
          }

          if (hasExceptions) {
            var targets = tryTargets(currentBlock);
            currentBlock.hasCatches = targets.length > 0;
            currentBlock.succs.push.apply(currentBlock.succs, targets);
          }

          currentBlock = nextBlock;
        }
        blockById[currentBlock.bid] = currentBlock;

        code = bytecodes[end - 1];
        switch (code.op) {
          case 27 /* lookupswitch */:
            for (var i = 0, j = code.targets.length; i < j; i++) {
              currentBlock.succs.push(code.targets[i]);
            }
            break;

          case 16 /* jump */:
            currentBlock.succs.push(code.target);
            break;

          default:
        }
        currentBlock.end = code;

        this.makeBlockSetFactory(id, blockById);
      };

      Analysis.prototype.normalizeReachableBlocks = function () {
        var root = this.bytecodes[0];

        release || assert(root.preds.length === 0);

        var ONCE = 1;
        var BUNCH_OF_TIMES = 2;

        var blocks = [];
        var visited = {};
        var ancestors = {};
        var worklist = [root];
        var node;

        ancestors[root.bid] = true;
        while ((node = top(worklist))) {
          if (visited[node.bid]) {
            if (visited[node.bid] === ONCE) {
              visited[node.bid] = BUNCH_OF_TIMES;
              blocks.push(node);

              var succs = node.succs;
              for (var i = 0, j = succs.length; i < j; i++) {
                succs[i].preds.push(node);
              }
            }

            ancestors[node.bid] = false;
            worklist.pop();
            continue;
          }

          visited[node.bid] = ONCE;
          ancestors[node.bid] = true;

          var succs = node.succs;
          for (var i = 0, j = succs.length; i < j; i++) {
            var s = succs[i];

            if (ancestors[s.bid]) {
              if (!node.spbacks) {
                node.spbacks = new this.boundBlockSet();
              }
              node.spbacks.set(s.bid);
            }
            !visited[s.bid] && worklist.push(s);
          }
        }

        this.blocks = blocks.reverse();
      };

      Analysis.prototype.computeDominance = function () {
        function intersectDominators(doms, b1, b2) {
          var finger1 = b1;
          var finger2 = b2;
          while (finger1 !== finger2) {
            while (finger1 > finger2) {
              finger1 = doms[finger1];
            }
            while (finger2 > finger1) {
              finger2 = doms[finger2];
            }
          }
          return finger1;
        }

        var blocks = this.blocks;
        var n = blocks.length;
        var doms = new Array(n);
        doms[0] = 0;

        var rpo = {};
        for (var b = 0; b < n; b++) {
          rpo[blocks[b].bid] = b;
        }

        var changed = true;
        while (changed) {
          changed = false;

          for (var b = 1; b < n; b++) {
            var preds = blocks[b].preds;
            var j = preds.length;

            var newIdom = rpo[preds[0].bid];

            if (!(newIdom in doms)) {
              for (var i = 1; i < j; i++) {
                newIdom = rpo[preds[i].bid];
                if (newIdom in doms) {
                  break;
                }
              }
            }
            release || assert(newIdom in doms);

            for (var i = 0; i < j; i++) {
              var p = rpo[preds[i].bid];
              if (p === newIdom) {
                continue;
              }

              if (p in doms) {
                newIdom = intersectDominators(doms, p, newIdom);
              }
            }

            if (doms[b] !== newIdom) {
              doms[b] = newIdom;
              changed = true;
            }
          }
        }

        blocks[0].dominator = blocks[0];
        var block;
        for (var b = 1; b < n; b++) {
          block = blocks[b];
          var idom = blocks[doms[b]];

          block.dominator = idom;
          idom.dominatees.push(block);

          block.npreds = block.preds.length;
        }

        var worklist = [blocks[0]];
        blocks[0].level || (blocks[0].level = 0);
        while ((block = worklist.shift())) {
          var dominatees = block.dominatees;
          for (var i = 0; i < dominatees.length; i++) {
            dominatees[i].level = block.level + 1;
          }
          worklist.push.apply(worklist, dominatees);
        }
      };

      Analysis.prototype.markLoops = function () {
        if (!this.analyzedControlFlow && !this.analyzeControlFlow()) {
          return false;
        }

        var bytecodes = this.bytecodes;

        var BoundBlockSet = this.boundBlockSet;

        function findSCCs(root) {
          var preorderId = 1;
          var preorder = {};
          var assigned = {};
          var unconnectedNodes = [];
          var pendingNodes = [];
          var sccs = [];
          var level = root.level + 1;
          var worklist = [root];
          var node;
          var u, s;

          while ((node = top(worklist))) {
            if (preorder[node.bid]) {
              if (peek(pendingNodes) === node) {
                pendingNodes.pop();

                var scc = [];
                do {
                  u = unconnectedNodes.pop();
                  assigned[u.bid] = true;
                  scc.push(u);
                } while(u !== node);

                if (scc.length > 1 || (u.spbacks && u.spbacks.get(u.bid))) {
                  sccs.push(scc);
                }
              }

              worklist.pop();
              continue;
            }

            preorder[node.bid] = preorderId++;
            unconnectedNodes.push(node);
            pendingNodes.push(node);

            var succs = node.succs;
            for (var i = 0, j = succs.length; i < j; i++) {
              s = succs[i];
              if (s.level < level) {
                continue;
              }

              var sid = s.bid;
              if (!preorder[sid]) {
                worklist.push(s);
              } else if (!assigned[sid]) {
                while (preorder[peek(pendingNodes).bid] > preorder[sid]) {
                  pendingNodes.pop();
                }
              }
            }
          }

          return sccs;
        }

        function findLoopHeads(blocks) {
          var heads = new BoundBlockSet();

          for (var i = 0, j = blocks.length; i < j; i++) {
            var block = blocks[i];
            var spbacks = block.spbacks;

            if (!spbacks) {
              continue;
            }

            var succs = block.succs;
            for (var k = 0, l = succs.length; k < l; k++) {
              var s = succs[k];
              if (spbacks.get(s.bid)) {
                heads.set(s.dominator.bid);
              }
            }
          }

          return heads.members();
        }

        function LoopInfo(scc, loopId) {
          var body = new BoundBlockSet();
          body.setBlocks(scc);
          body.recount();

          this.id = loopId;
          this.body = body;
          this.exit = new BoundBlockSet();
          this.save = {};
          this.head = new BoundBlockSet();
          this.npreds = 0;
          this._dirtyLocals = null;
        }

        LoopInfo.prototype.getDirtyLocals = function () {
          if (this._dirtyLocals) {
            return this._dirtyLocals;
          }
          var dirtyLocals = this._dirtyLocals = [];
          var blocks = this.body.members();
          blocks.forEach(function (block) {
            for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
              var bc = bytecodes[bci];
              var op = bc.op;
              switch (op) {
                case 146 /* inclocal */:
                case 148 /* declocal */:
                case 99 /* setlocal */:
                case 194 /* inclocal_i */:
                case 195 /* declocal_i */:
                  dirtyLocals[bc.index] = true;
                  break;
                case 50 /* hasnext2 */:
                  dirtyLocals[bc.index] = true;
                  dirtyLocals[bc.object] = true;
                  break;
                case 212 /* setlocal0 */:
                case 213 /* setlocal1 */:
                case 214 /* setlocal2 */:
                case 215 /* setlocal3 */:
                  dirtyLocals[op - 212 /* setlocal0 */] = true;
                  break;
              }
            }
          });
          return dirtyLocals;
        };

        var heads = findLoopHeads(this.blocks);
        if (heads.length <= 0) {
          this.markedLoops = true;
          return true;
        }

        var worklist = heads.sort(function (a, b) {
          return a.level - b.level;
        });
        var loopId = 0;

        for (var n = worklist.length - 1; n >= 0; n--) {
          var t = worklist[n];
          var sccs = findSCCs(t);
          if (sccs.length === 0) {
            continue;
          }

          for (var i = 0, j = sccs.length; i < j; i++) {
            var scc = sccs[i];
            var loop = new LoopInfo(scc, loopId++);
            for (var k = 0, l = scc.length; k < l; k++) {
              var h = scc[k];
              if (h.level === t.level + 1 && !h.loop) {
                h.loop = loop;
                loop.head.set(h.bid);

                var preds = h.preds;
                for (var pi = 0, pj = preds.length; pi < pj; pi++) {
                  loop.body.get(preds[pi].bid) && h.npreds--;
                }
                loop.npreds += h.npreds;
              }
            }

            for (var k = 0, l = scc.length; k < l; k++) {
              var h = scc[k];
              if (h.level === t.level + 1) {
                h.npreds = loop.npreds;
              }
            }

            loop.head.recount();
          }
        }

        this.markedLoops = true;
        return true;
      };
      return Analysis;
    })();
    AVM2.Analysis = Analysis;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var Bytecode = Shumway.AVM2.Bytecode;
var Analysis = Shumway.AVM2.Analysis;
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    var Option = Shumway.Options.Option;
    var OptionSet = Shumway.Options.OptionSet;

    var shumwayOptions = Shumway.Settings.shumwayOptions;

    var avm2Options = shumwayOptions.register(new OptionSet("AVM2"));

    (function (Runtime) {
      var options = avm2Options.register(new OptionSet("Runtime"));
      Runtime.traceExecution = options.register(new Option("tx", "traceExecution", "number", 0, "trace script execution", { choices: { "off": 0, "normal": 2, "verbose": 3 } }));
      Runtime.traceCallExecution = options.register(new Option("txc", "traceCallExecution", "number", 0, "trace call execution", { choices: { "off": 0, "normal": 1, "verbose": 2 } }));
      Runtime.traceFunctions = options.register(new Option("t", "traceFunctions", "number", 0, "trace functions", { choices: { "off": 0, "compiled": 1, "compiled & abc": 2 } }));
      Runtime.traceClasses = options.register(new Option("tc", "traceClasses", "boolean", false, "trace class creation"));
      Runtime.traceDomain = options.register(new Option("td", "traceDomain", "boolean", false, "trace domain property access"));
      Runtime.debuggerMode = options.register(new Option("db", "debuggerMode", "boolean", true, "enable debugger mode"));
      Runtime.globalMultinameAnalysis = options.register(new Option("ga", "globalMultinameAnalysis", "boolean", false, "Global multiname analysis."));
      Runtime.codeCaching = options.register(new Option("cc", "codeCaching", "boolean", false, "Enable code caching."));

      Runtime.compilerEnableExceptions = options.register(new Option("cex", "exceptions", "boolean", false, "Compile functions with catch blocks."));
      Runtime.compilerMaximumMethodSize = options.register(new Option("cmms", "maximumMethodSize", "number", 4 * 1024, "Compiler maximum method size."));

      (function (ExecutionMode) {
        ExecutionMode[ExecutionMode["INTERPRET"] = 0x1] = "INTERPRET";
        ExecutionMode[ExecutionMode["COMPILE"] = 0x2] = "COMPILE";
      })(Runtime.ExecutionMode || (Runtime.ExecutionMode = {}));
      var ExecutionMode = Runtime.ExecutionMode;
    })(AVM2.Runtime || (AVM2.Runtime = {}));
    var Runtime = AVM2.Runtime;

    (function (Compiler) {
      Compiler.options = avm2Options.register(new OptionSet("Compiler"));
      Compiler.traceLevel = Compiler.options.register(new Option("tc4", "tc4", "number", 0, "Compiler Trace Level"));
      Compiler.breakFilter = Compiler.options.register(new Option("", "break", "string", "", "Set a break point at methods whose qualified name matches this string pattern."));
      Compiler.compileFilter = Compiler.options.register(new Option("", "compile", "string", "", "Only compile methods whose qualified name matches this string pattern."));
      Compiler.enableDirtyLocals = Compiler.options.register(new Option("dl", "dirtyLocals", "boolean", true, "Performe dirty local analysis to minimise PHI nodes."));
    })(AVM2.Compiler || (AVM2.Compiler = {}));
    var Compiler = AVM2.Compiler;

    (function (Verifier) {
      Verifier.options = avm2Options.register(new OptionSet("Verifier"));
      Verifier.enabled = Verifier.options.register(new Option("verifier", "verifier", "boolean", true, "Enable verifier."));
      Verifier.traceLevel = Verifier.options.register(new Option("tv", "tv", "number", 0, "Verifier Trace Level"));
    })(AVM2.Verifier || (AVM2.Verifier = {}));
    var Verifier = AVM2.Verifier;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Namespace = Shumway.AVM2.ABC.Namespace;


var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Runtime) {
      Runtime.sealConstTraits = false;

      Runtime.useAsAdd = true;

      var useSurrogates = true;

      var callCounter = new Shumway.Metrics.Counter(true);
      var counter = Shumway.Metrics.Counter.instance;

      var Multiname = Shumway.AVM2.ABC.Multiname;
      var Namespace = Shumway.AVM2.ABC.Namespace;

      var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
      var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
      var ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
      var SORT = Shumway.AVM2.ABC.SORT;

      var Trait = Shumway.AVM2.ABC.Trait;
      var IndentingWriter = Shumway.IndentingWriter;
      var hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
      var propertyIsEnumerable = Shumway.ObjectUtilities.propertyIsEnumerable;
      var isNullOrUndefined = Shumway.isNullOrUndefined;

      var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
      var boxValue = Shumway.ObjectUtilities.boxValue;
      var bindSafely = Shumway.FunctionUtilities.bindSafely;
      var assert = Shumway.Debug.assert;

      var defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
      var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
      var defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;
      var defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;

      var toSafeString = Shumway.StringUtilities.toSafeString;
      var toSafeArrayString = Shumway.StringUtilities.toSafeArrayString;

      var TRAIT = Shumway.AVM2.ABC.TRAIT;

      Runtime.VM_SLOTS = "asSlots";
      Runtime.VM_LENGTH = "asLength";
      Runtime.VM_BINDINGS = "asBindings";
      Runtime.VM_NATIVE_PROTOTYPE_FLAG = "asIsNative";
      Runtime.VM_OPEN_METHODS = "asOpenMethods";

      Runtime.VM_OPEN_METHOD_PREFIX = "m";
      Runtime.VM_MEMOIZER_PREFIX = "z";
      Runtime.VM_OPEN_SET_METHOD_PREFIX = "s";
      Runtime.VM_OPEN_GET_METHOD_PREFIX = "g";

      Runtime.SAVED_SCOPE_NAME = "$SS";

      Runtime.VM_METHOD_OVERRIDES = createEmptyObject();

      var vmNextInterpreterFunctionId = 1;
      var vmNextCompiledFunctionId = 1;

      var compiledFunctionCount = 0;

      function isNativePrototype(object) {
        return Object.prototype.hasOwnProperty.call(object, Runtime.VM_NATIVE_PROTOTYPE_FLAG);
      }
      Runtime.isNativePrototype = isNativePrototype;

      var traitsWriter = null;
      var callWriter = new IndentingWriter();

      function patch(patchTargets, value) {
        release || assert(Shumway.isFunction(value));
        for (var i = 0; i < patchTargets.length; i++) {
          var patchTarget = patchTargets[i];
          if (Runtime.traceExecution.value >= 3) {
            var str = "Patching: ";
            if (patchTarget.name) {
              str += patchTarget.name;
            } else if (patchTarget.get) {
              str += "get " + patchTarget.get;
            } else if (patchTarget.set) {
              str += "set " + patchTarget.set;
            }
            traitsWriter && traitsWriter.redLn(str);
          }
          if (patchTarget.get) {
            defineNonEnumerableGetterOrSetter(patchTarget.object, patchTarget.get, value, true);
          } else if (patchTarget.set) {
            defineNonEnumerableGetterOrSetter(patchTarget.object, patchTarget.set, value, false);
          } else {
            defineNonEnumerableProperty(patchTarget.object, patchTarget.name, value);
          }
        }
      }
      Runtime.patch = patch;

      function applyNonMemoizedMethodTrait(qn, trait, object, scope, natives) {
        release || assert(scope);
        if (trait.isMethod()) {
          var trampoline = Runtime.makeTrampoline(function (self) {
            var fn = getTraitFunction(trait, scope, natives);
            patch(self.patchTargets, fn);
            return fn;
          }, trait.methodInfo.parameters.length);
          trampoline.patchTargets = [
            { object: object, name: qn },
            { object: object, name: Runtime.VM_OPEN_METHOD_PREFIX + qn }
          ];
          var closure = bindSafely(trampoline, object);
          defineReadOnlyProperty(closure, Runtime.VM_LENGTH, trampoline.asLength);
          defineReadOnlyProperty(closure, Multiname.getPublicQualifiedName("prototype"), null);
          defineNonEnumerableProperty(object, qn, closure);
          defineNonEnumerableProperty(object, Runtime.VM_OPEN_METHOD_PREFIX + qn, closure);
        } else if (trait.isGetter() || trait.isSetter()) {
          var trampoline = Runtime.makeTrampoline(function (self) {
            var fn = getTraitFunction(trait, scope, natives);
            patch(self.patchTargets, fn);
            return fn;
          }, trait.isSetter() ? 1 : 0);
          if (trait.isGetter()) {
            trampoline.patchTargets = [{ object: object, get: qn }];
          } else {
            trampoline.patchTargets = [{ object: object, set: qn }];
          }
          defineNonEnumerableGetterOrSetter(object, qn, trampoline, trait.isGetter());
        } else {
          Shumway.Debug.unexpected(trait);
        }
      }
      Runtime.applyNonMemoizedMethodTrait = applyNonMemoizedMethodTrait;

      function applyMemoizedMethodTrait(qn, trait, object, scope, natives) {
        release || assert(scope, trait);

        if (trait.isMethod()) {
          var memoizerTarget = { value: null };
          var trampoline = Runtime.makeTrampoline(function (self) {
            var fn = getTraitFunction(trait, scope, natives);
            patch(self.patchTargets, fn);
            return fn;
          }, trait.methodInfo.parameters.length, String(trait.name));

          memoizerTarget.value = trampoline;
          var openMethods = object.asOpenMethods;
          openMethods[qn] = trampoline;
          defineNonEnumerableProperty(object, Runtime.VM_OPEN_METHOD_PREFIX + qn, trampoline);

          defineNonEnumerableGetter(object, qn, Runtime.makeMemoizer(qn, memoizerTarget));

          trampoline.patchTargets = [
            { object: memoizerTarget, name: "value" },
            { object: openMethods, name: qn },
            { object: object, name: Runtime.VM_OPEN_METHOD_PREFIX + qn }
          ];
          tryInjectToStringAndValueOfForwarder(object, qn);
        } else if (trait.isGetter() || trait.isSetter()) {
          var trampoline = Runtime.makeTrampoline(function (self) {
            var fn = getTraitFunction(trait, scope, natives);
            patch(self.patchTargets, fn);
            return fn;
          }, 0, String(trait.name));
          if (trait.isGetter()) {
            defineNonEnumerableProperty(object, Runtime.VM_OPEN_GET_METHOD_PREFIX + qn, trampoline);
            trampoline.patchTargets = [
              { object: object, get: qn },
              { object: object, name: Runtime.VM_OPEN_GET_METHOD_PREFIX + qn }
            ];
          } else {
            defineNonEnumerableProperty(object, Runtime.VM_OPEN_SET_METHOD_PREFIX + qn, trampoline);
            trampoline.patchTargets = [
              { object: object, set: qn },
              { object: object, name: Runtime.VM_OPEN_SET_METHOD_PREFIX + qn }
            ];
          }
          defineNonEnumerableGetterOrSetter(object, qn, trampoline, trait.isGetter());
        }
      }
      Runtime.applyMemoizedMethodTrait = applyMemoizedMethodTrait;

      function getNamespaceResolutionMap(namespaces) {
        var self = this;
        var map = self.resolutionMap[namespaces.runtimeId];
        if (map)
          return map;
        map = self.resolutionMap[namespaces.runtimeId] = Shumway.ObjectUtilities.createMap();
        var bindings = self.bindings;

        for (var key in bindings.map) {
          var multiname = key;
          var trait = bindings.map[key].trait;
          if (trait.isGetter() || trait.isSetter()) {
            multiname = multiname.substring(Runtime.Binding.KEY_PREFIX_LENGTH);
          }
          multiname = Multiname.fromQualifiedName(multiname);
          if (multiname.getNamespace().inNamespaceSet(namespaces)) {
            map[multiname.getName()] = Multiname.getQualifiedName(trait.name);
          }
        }
        return map;
      }
      Runtime.getNamespaceResolutionMap = getNamespaceResolutionMap;

      function resolveMultinameProperty(namespaces, name, flags) {
        var self = this;
        if (isNullOrUndefined(name)) {
          name = String(asCoerceString(name));
        } else if (typeof name === "object") {
          name = String(name);
        }
        if (Shumway.isNumeric(name)) {
          return Shumway.toNumber(name);
        }
        if (!namespaces) {
          return Multiname.getPublicQualifiedName(name);
        }
        if (namespaces.length > 1) {
          var resolved = self.getNamespaceResolutionMap(namespaces)[name];
          if (resolved)
            return resolved;
          return Multiname.getPublicQualifiedName(name);
        } else {
          return Multiname.qualifyName(namespaces[0], name);
        }
      }
      Runtime.resolveMultinameProperty = resolveMultinameProperty;

      function asGetPublicProperty(name) {
        var self = this;
        return self.asGetProperty(undefined, name, 0);
      }
      Runtime.asGetPublicProperty = asGetPublicProperty;

      function asGetProperty(namespaces, name, flags) {
        var self = this;
        var resolved = self.resolveMultinameProperty(namespaces, name, flags);
        if (self.asGetNumericProperty && Multiname.isNumeric(resolved)) {
          return self.asGetNumericProperty(resolved);
        }
        return self[resolved];
      }
      Runtime.asGetProperty = asGetProperty;

      function asGetResolvedStringProperty(resolved) {
        release || assert(Shumway.isString(resolved));
        return this[resolved];
      }
      Runtime.asGetResolvedStringProperty = asGetResolvedStringProperty;

      function asCallResolvedStringProperty(resolved, isLex, args) {
        var self = this;
        var receiver = isLex ? null : this;
        var openMethods = self.asOpenMethods;

        var method;
        if (receiver && openMethods && openMethods[resolved]) {
          method = openMethods[resolved];
        } else {
          method = self[resolved];
        }
        return method.asApply(receiver, args);
      }
      Runtime.asCallResolvedStringProperty = asCallResolvedStringProperty;

      function asGetResolvedStringPropertyFallback(resolved) {
        var self = this;
        var name = Multiname.getNameFromPublicQualifiedName(resolved);
        return self.asGetProperty([Namespace.PUBLIC], name, 0);
      }
      Runtime.asGetResolvedStringPropertyFallback = asGetResolvedStringPropertyFallback;

      function asSetPublicProperty(name, value) {
        var self = this;
        return self.asSetProperty(undefined, name, 0, value);
      }
      Runtime.asSetPublicProperty = asSetPublicProperty;

      Runtime.forwardValueOf = new Function("", 'return this.' + Multiname.VALUE_OF + ".apply(this, arguments)");
      Runtime.forwardToString = new Function("", 'return this.' + Multiname.TO_STRING + ".apply(this, arguments)");

      function tryInjectToStringAndValueOfForwarder(self, resolved) {
        if (resolved === Multiname.VALUE_OF) {
          defineNonEnumerableProperty(self, "original_valueOf", self.valueOf);
          self.valueOf = Runtime.forwardValueOf;
        } else if (resolved === Multiname.TO_STRING) {
          defineNonEnumerableProperty(self, "original_toString", self.toString);
          self.toString = Runtime.forwardToString;
        }
      }

      function asSetProperty(namespaces, name, flags, value) {
        var self = this;
        if (typeof name === "object") {
          name = String(name);
        }
        var resolved = self.resolveMultinameProperty(namespaces, name, flags);
        if (self.asSetNumericProperty && Multiname.isNumeric(resolved)) {
          return self.asSetNumericProperty(resolved, value);
        }
        var slotInfo = self.asSlots.byQN[resolved];
        if (slotInfo) {
          if (slotInfo.isConst) {
          }
          var type = slotInfo.type;
          if (type && type.coerce) {
            value = type.coerce(value);
          }
        }
        tryInjectToStringAndValueOfForwarder(self, resolved);
        self[resolved] = value;
      }
      Runtime.asSetProperty = asSetProperty;

      function asDefinePublicProperty(name, descriptor) {
        var self = this;
        return self.asDefineProperty(undefined, name, 0, descriptor);
      }
      Runtime.asDefinePublicProperty = asDefinePublicProperty;

      function asDefineProperty(namespaces, name, flags, descriptor) {
        var self = this;
        if (typeof name === "object") {
          name = String(name);
        }
        var resolved = self.resolveMultinameProperty(namespaces, name, flags);
        Object.defineProperty(self, resolved, descriptor);
      }
      Runtime.asDefineProperty = asDefineProperty;

      function asCallPublicProperty(name, args) {
        var self = this;
        return self.asCallProperty(undefined, name, 0, false, args);
      }
      Runtime.asCallPublicProperty = asCallPublicProperty;

      function asCallProperty(namespaces, name, flags, isLex, args) {
        var self = this;
        if (Runtime.traceCallExecution.value) {
          var receiverClassName = self.class ? self.class + " " : "";
          callWriter.enter("call " + receiverClassName + name + "(" + toSafeArrayString(args) + ") #" + callCounter.count(name));
        }
        var receiver = isLex ? null : self;
        var result;
        var method;
        var resolved = self.resolveMultinameProperty(namespaces, name, flags);
        if (self.asGetNumericProperty && Multiname.isNumeric(resolved)) {
          method = self.asGetNumericProperty(resolved);
        } else {
          var openMethods = self.asOpenMethods;

          if (receiver && openMethods && openMethods[resolved]) {
            method = openMethods[resolved];
          } else {
            method = self[resolved];
          }
        }
        result = method.asApply(receiver, args);
        Runtime.traceCallExecution.value > 0 && callWriter.leave("return " + toSafeString(result));
        return result;
      }
      Runtime.asCallProperty = asCallProperty;

      function asCallSuper(scope, namespaces, name, flags, args) {
        var self = this;
        if (Runtime.traceCallExecution.value) {
          var receiverClassName = self.class ? self.class + " " : "";
          callWriter.enter("call super " + receiverClassName + name + "(" + toSafeArrayString(args) + ") #" + callCounter.count(name));
        }
        var baseClass = scope.object.baseClass;
        var resolved = baseClass.traitsPrototype.resolveMultinameProperty(namespaces, name, flags);
        var openMethods = baseClass.traitsPrototype.asOpenMethods;
        release || assert(openMethods && openMethods[resolved]);
        var method = openMethods[resolved];
        var result = method.asApply(this, args);
        Runtime.traceCallExecution.value > 0 && callWriter.leave("return " + toSafeString(result));
        return result;
      }
      Runtime.asCallSuper = asCallSuper;

      function asSetSuper(scope, namespaces, name, flags, value) {
        var self = this;
        if (Runtime.traceCallExecution.value) {
          var receiverClassName = self.class ? self.class + " " : "";
          callWriter.enter("set super " + receiverClassName + name + "(" + toSafeString(value) + ") #" + callCounter.count(name));
        }
        var baseClass = scope.object.baseClass;
        var resolved = baseClass.traitsPrototype.resolveMultinameProperty(namespaces, name, flags);
        if (self.asSlots.byQN[resolved]) {
          this.asSetProperty(namespaces, name, flags, value);
        } else {
          baseClass.traitsPrototype[Runtime.VM_OPEN_SET_METHOD_PREFIX + resolved].call(this, value);
        }
        Runtime.traceCallExecution.value > 0 && callWriter.leave("");
      }
      Runtime.asSetSuper = asSetSuper;

      function asGetSuper(scope, namespaces, name, flags) {
        var self = this;
        if (Runtime.traceCallExecution.value) {
          var receiver = self.class ? self.class + " " : "";
          callWriter.enter("get super " + receiver + name + " #" + callCounter.count(name));
        }
        var baseClass = scope.object.baseClass;
        var resolved = baseClass.traitsPrototype.resolveMultinameProperty(namespaces, name, flags);
        var result;
        if (self.asSlots.byQN[resolved]) {
          result = this.asGetProperty(namespaces, name, flags);
        } else {
          result = baseClass.traitsPrototype[Runtime.VM_OPEN_GET_METHOD_PREFIX + resolved].call(this);
        }
        Runtime.traceCallExecution.value > 0 && callWriter.leave("return " + toSafeString(result));
        return result;
      }
      Runtime.asGetSuper = asGetSuper;

      function construct(cls, args) {
        if (cls.classInfo) {
          var qn = Multiname.getQualifiedName(cls.classInfo.instanceInfo.name);
          if (qn === Multiname.String) {
            return String.asApply(null, args);
          }
          if (qn === Multiname.Boolean) {
            return Boolean.asApply(null, args);
          }
          if (qn === Multiname.Number) {
            return Number.asApply(null, args);
          }
        }
        var c = cls.instanceConstructor;
        var a = args;
        switch (args.length) {
          case 0:
            return new c();
          case 1:
            return new c(a[0]);
          case 2:
            return new c(a[0], a[1]);
          case 3:
            return new c(a[0], a[1], a[2]);
          case 4:
            return new c(a[0], a[1], a[2], a[3]);
          case 5:
            return new c(a[0], a[1], a[2], a[3], a[4]);
          case 6:
            return new c(a[0], a[1], a[2], a[3], a[4], a[5]);
          case 7:
            return new c(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
          case 8:
            return new c(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
          case 9:
            return new c(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
          case 10:
            return new c(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]);
        }
        var applyArguments = [];
        for (var i = 0; i < args.length; i++) {
          applyArguments[i + 1] = args[i];
        }
        return new (Function.bind.asApply(c, applyArguments));
      }
      Runtime.construct = construct;

      function asConstructProperty(namespaces, name, flags, args) {
        var self = this;
        var constructor = self.asGetProperty(namespaces, name, flags);
        if (Runtime.traceCallExecution.value) {
          callWriter.enter("construct " + name + "(" + toSafeArrayString(args) + ") #" + callCounter.count(name));
        }
        var result = construct(constructor, args);
        Runtime.traceCallExecution.value > 0 && callWriter.leave("return " + toSafeString(result));
        return result;
      }
      Runtime.asConstructProperty = asConstructProperty;

      function asHasProperty(namespaces, name, flags) {
        var self = this;
        return self.resolveMultinameProperty(namespaces, name, flags) in this;
      }
      Runtime.asHasProperty = asHasProperty;

      function asHasOwnProperty(namespaces, name, flags) {
        var self = this;
        var resolved = self.resolveMultinameProperty(namespaces, name, flags);
        return hasOwnProperty(self, resolved);
      }
      Runtime.asHasOwnProperty = asHasOwnProperty;

      function asPropertyIsEnumerable(namespaces, name, flags) {
        var self = this;
        var resolved = self.resolveMultinameProperty(namespaces, name, flags);
        return propertyIsEnumerable(self, resolved);
      }
      Runtime.asPropertyIsEnumerable = asPropertyIsEnumerable;

      function asDeleteProperty(namespaces, name, flags) {
        var self = this;
        if (self.asHasTraitProperty(namespaces, name, flags)) {
          return false;
        }
        var resolved = self.resolveMultinameProperty(namespaces, name, flags);
        return delete self[resolved];
      }
      Runtime.asDeleteProperty = asDeleteProperty;

      function asHasTraitProperty(namespaces, name, flags) {
        var self = this;
        var resolved = self.resolveMultinameProperty(namespaces, name, flags);
        return self.asBindings.indexOf(resolved) >= 0;
      }
      Runtime.asHasTraitProperty = asHasTraitProperty;

      function asGetNumericProperty(i) {
        return this[i];
      }
      Runtime.asGetNumericProperty = asGetNumericProperty;

      function asSetNumericProperty(i, v) {
        this[i] = v;
      }
      Runtime.asSetNumericProperty = asSetNumericProperty;

      function asGetDescendants(namespaces, name, flags) {
        Shumway.Debug.notImplemented("asGetDescendants");
      }
      Runtime.asGetDescendants = asGetDescendants;

      function asNextNameIndex(index) {
        var self = this;
        if (index === 0) {
          defineNonEnumerableProperty(self, "asEnumerableKeys", self.asGetEnumerableKeys());
        }
        var asEnumerableKeys = self.asEnumerableKeys;
        while (index < asEnumerableKeys.length) {
          if (self.asHasProperty(undefined, asEnumerableKeys[index], 0)) {
            return index + 1;
          }
          index++;
        }
        return 0;
      }
      Runtime.asNextNameIndex = asNextNameIndex;

      function asNextName(index) {
        var self = this;
        var asEnumerableKeys = self.asEnumerableKeys;
        release || assert(asEnumerableKeys && index > 0 && index < asEnumerableKeys.length + 1);
        return asEnumerableKeys[index - 1];
      }
      Runtime.asNextName = asNextName;

      function asNextValue(index) {
        return this.asGetPublicProperty(this.asNextName(index));
      }
      Runtime.asNextValue = asNextValue;

      function asHasNext2(hasNext2Info) {
        if (isNullOrUndefined(hasNext2Info.object)) {
          hasNext2Info.index = 0;
          hasNext2Info.object = null;
          return;
        }
        var object = boxValue(hasNext2Info.object);
        var nextIndex = object.asNextNameIndex(hasNext2Info.index);
        if (nextIndex > 0) {
          hasNext2Info.index = nextIndex;
          hasNext2Info.object = object;
          return;
        }

        while (true) {
          var object = Object.getPrototypeOf(object);
          if (!object) {
            hasNext2Info.index = 0;
            hasNext2Info.object = null;
            return;
          }
          nextIndex = object.asNextNameIndex(0);
          if (nextIndex > 0) {
            hasNext2Info.index = nextIndex;
            hasNext2Info.object = object;
            return;
          }
        }
        hasNext2Info.index = 0;
        hasNext2Info.object = null;
        return;
      }
      Runtime.asHasNext2 = asHasNext2;

      function asGetEnumerableKeys() {
        var self = this;

        if (self instanceof String || self instanceof Number) {
          return [];
        }

        var keys = Object.keys(this);
        var result = [];
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (Shumway.isNumeric(key)) {
            result.push(key);
          } else {
            var name = Multiname.stripPublicQualifier(key);
            if (name !== undefined) {
              result.push(name);
            }
          }
        }
        return result;
      }
      Runtime.asGetEnumerableKeys = asGetEnumerableKeys;

      function asTypeOf(x) {
        if (x) {
          if (x.constructor === String) {
            return "string";
          } else if (x.constructor === Number) {
            return "number";
          } else if (x.constructor === Boolean) {
            return "boolean";
          } else if (x instanceof Shumway.AVM2.AS.ASXML || x instanceof Shumway.AVM2.AS.ASXMLList) {
            return "xml";
          } else if (Shumway.AVM2.AS.ASClass.isType(x)) {
            return "object";
          }
        }
        return typeof x;
      }
      Runtime.asTypeOf = asTypeOf;

      function publicizeProperties(object) {
        var keys = Object.keys(object);
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          if (!Multiname.isPublicQualifiedName(k)) {
            var v = object[k];
            object[Multiname.getPublicQualifiedName(k)] = v;
            delete object[k];
          }
        }
      }
      Runtime.publicizeProperties = publicizeProperties;

      function asGetSlot(object, index) {
        return object[object.asSlots.byID[index].name];
      }
      Runtime.asGetSlot = asGetSlot;

      function asSetSlot(object, index, value) {
        var slotInfo = object.asSlots.byID[index];
        if (slotInfo.const) {
          return;
        }
        var name = slotInfo.name;
        var type = slotInfo.type;
        if (type && type.coerce) {
          object[name] = type.coerce(value);
        } else {
          object[name] = value;
        }
      }
      Runtime.asSetSlot = asSetSlot;

      function asCheckVectorSetNumericProperty(i, length, fixed) {
        if (i < 0 || i > length || (i === length && fixed) || !Shumway.isNumeric(i)) {
          throwError("RangeError", AVM2.Errors.OutOfRangeError, i, length);
        }
      }
      Runtime.asCheckVectorSetNumericProperty = asCheckVectorSetNumericProperty;

      function asCheckVectorGetNumericProperty(i, length) {
        if (i < 0 || i >= length || !Shumway.isNumeric(i)) {
          throwError("RangeError", AVM2.Errors.OutOfRangeError, i, length);
        }
      }
      Runtime.asCheckVectorGetNumericProperty = asCheckVectorGetNumericProperty;

      function throwError(name, error) {
        var rest = [];
        for (var _i = 0; _i < (arguments.length - 2); _i++) {
          rest[_i] = arguments[_i + 2];
        }
        if (true) {
          var message = Shumway.AVM2.formatErrorMessage.apply(null, Array.prototype.slice.call(arguments, 1));
          throwErrorFromVM(Runtime.AVM2.currentDomain(), name, message, error.code);
        } else {
          throwErrorFromVM(Runtime.AVM2.currentDomain(), name, Shumway.AVM2.getErrorMessage(error.code), error.code);
        }
      }
      Runtime.throwError = throwError;

      function throwErrorFromVM(domain, errorClass, message, id) {
        var error = new (domain.getClass(errorClass)).instanceConstructor(message, id);
        throw error;
      }
      Runtime.throwErrorFromVM = throwErrorFromVM;

      function translateError(domain, error) {
        if (error instanceof Error) {
          var type = domain.getClass(error.name);
          if (type) {
            return new type.instanceConstructor(Shumway.AVM2.translateErrorMessage(error));
          }
          Shumway.Debug.unexpected("Can't translate error: " + error);
        }
        return error;
      }
      Runtime.translateError = translateError;

      function asIsInstanceOf(type, value) {
        return type.isInstanceOf(value);
      }
      Runtime.asIsInstanceOf = asIsInstanceOf;

      function asIsType(type, value) {
        return type.isType(value);
      }
      Runtime.asIsType = asIsType;

      function asAsType(type, value) {
        return asIsType(type, value) ? value : null;
      }
      Runtime.asAsType = asAsType;

      function asCoerceByMultiname(methodInfo, multiname, value) {
        release || assert(multiname.isQName());
        switch (Multiname.getQualifiedName(multiname)) {
          case Multiname.Int:
            return asCoerceInt(value);
          case Multiname.Uint:
            return asCoerceUint(value);
          case Multiname.String:
            return asCoerceString(value);
          case Multiname.Number:
            return asCoerceNumber(value);
          case Multiname.Boolean:
            return asCoerceBoolean(value);
          case Multiname.Object:
            return asCoerceObject(value);
        }
        return asCoerce(methodInfo.abc.applicationDomain.getType(multiname), value);
      }
      Runtime.asCoerceByMultiname = asCoerceByMultiname;

      function asCoerce(type, value) {
        return type.coerce(value);
      }
      Runtime.asCoerce = asCoerce;

      function asCoerceString(x) {
        if (typeof x === "string") {
          return x;
        } else if (x == undefined) {
          return null;
        }
        return x + '';
      }
      Runtime.asCoerceString = asCoerceString;

      function asCoerceInt(x) {
        return x | 0;
      }
      Runtime.asCoerceInt = asCoerceInt;

      function asCoerceUint(x) {
        return x >>> 0;
      }
      Runtime.asCoerceUint = asCoerceUint;

      function asCoerceNumber(x) {
        return +x;
      }
      Runtime.asCoerceNumber = asCoerceNumber;

      function asCoerceBoolean(x) {
        return !!x;
      }
      Runtime.asCoerceBoolean = asCoerceBoolean;

      function asCoerceObject(x) {
        if (x == undefined) {
          return null;
        }
        if (typeof x === 'string' || typeof x === 'number') {
          return x;
        }
        return Object(x);
      }
      Runtime.asCoerceObject = asCoerceObject;

      function asDefaultCompareFunction(a, b) {
        return String(a).localeCompare(String(b));
      }
      Runtime.asDefaultCompareFunction = asDefaultCompareFunction;

      function asCompare(a, b, options, compareFunction) {
        release || Shumway.Debug.assertNotImplemented(!(options & 4 /* UNIQUESORT */), "UNIQUESORT");
        release || Shumway.Debug.assertNotImplemented(!(options & 8 /* RETURNINDEXEDARRAY */), "RETURNINDEXEDARRAY");
        var result = 0;
        if (!compareFunction) {
          compareFunction = asDefaultCompareFunction;
        }
        if (options & 1 /* CASEINSENSITIVE */) {
          a = String(a).toLowerCase();
          b = String(b).toLowerCase();
        }
        if (options & 16 /* NUMERIC */) {
          a = Shumway.toNumber(a);
          b = Shumway.toNumber(b);
          result = a < b ? -1 : (a > b ? 1 : 0);
        } else {
          result = compareFunction(a, b);
        }
        if (options & 2 /* DESCENDING */) {
          result *= -1;
        }
        return result;
      }
      Runtime.asCompare = asCompare;

      function asAdd(l, r) {
        if (typeof l === "string" || typeof r === "string") {
          return String(l) + String(r);
        }
        return l + r;
      }
      Runtime.asAdd = asAdd;

      function isXMLType(x) {
        return x instanceof Shumway.AVM2.AS.ASXML || x instanceof Shumway.AVM2.AS.ASXMLList;
      }

      function getDescendants(object, mn) {
        if (!isXMLType(object)) {
          throw "Not XML object in getDescendants";
        }
        return object.descendants(mn);
      }
      Runtime.getDescendants = getDescendants;

      function checkFilter(value) {
        if (!value.class || !isXMLType(value)) {
          throw "TypeError operand of childFilter not of XML type";
        }
        return value;
      }
      Runtime.checkFilter = checkFilter;

      function initializeGlobalObject(global) {
        ["Object", "Number", "Boolean", "String", "Array", "Date", "RegExp"].forEach(function (name) {
          defineReadOnlyProperty(global[name].prototype, Runtime.VM_NATIVE_PROTOTYPE_FLAG, true);
        });

        defineNonEnumerableProperty(global.Object.prototype, "getNamespaceResolutionMap", getNamespaceResolutionMap);
        defineNonEnumerableProperty(global.Object.prototype, "resolveMultinameProperty", resolveMultinameProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asGetProperty", asGetProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asGetPublicProperty", asGetPublicProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asGetResolvedStringProperty", asGetResolvedStringProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asSetProperty", asSetProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asSetPublicProperty", asSetPublicProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asDefineProperty", asDefineProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asDefinePublicProperty", asDefinePublicProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asCallProperty", asCallProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asCallSuper", asCallSuper);
        defineNonEnumerableProperty(global.Object.prototype, "asGetSuper", asGetSuper);
        defineNonEnumerableProperty(global.Object.prototype, "asSetSuper", asSetSuper);
        defineNonEnumerableProperty(global.Object.prototype, "asCallPublicProperty", asCallPublicProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asCallResolvedStringProperty", asCallResolvedStringProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asConstructProperty", asConstructProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asHasProperty", asHasProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asHasPropertyInternal", asHasProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asHasOwnProperty", asHasOwnProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asPropertyIsEnumerable", asPropertyIsEnumerable);
        defineNonEnumerableProperty(global.Object.prototype, "asHasTraitProperty", asHasTraitProperty);
        defineNonEnumerableProperty(global.Object.prototype, "asDeleteProperty", asDeleteProperty);

        defineNonEnumerableProperty(global.Object.prototype, "asHasNext2", asHasNext2);
        defineNonEnumerableProperty(global.Object.prototype, "asNextName", asNextName);
        defineNonEnumerableProperty(global.Object.prototype, "asNextValue", asNextValue);
        defineNonEnumerableProperty(global.Object.prototype, "asNextNameIndex", asNextNameIndex);
        defineNonEnumerableProperty(global.Object.prototype, "asGetEnumerableKeys", asGetEnumerableKeys);

        defineNonEnumerableProperty(global.Function.prototype, "asCall", global.Function.prototype.call);
        defineNonEnumerableProperty(global.Function.prototype, "asApply", global.Function.prototype.apply);

        [
          "Array",
          "Object",
          "Int8Array",
          "Uint8Array",
          "Uint8ClampedArray",
          "Int16Array",
          "Uint16Array",
          "Int32Array",
          "Uint32Array",
          "Float32Array",
          "Float64Array"
        ].forEach(function (name) {
          if (!(name in global)) {
            log(name + ' was not found in globals');
            return;
          }
          defineNonEnumerableProperty(global[name].prototype, "asGetNumericProperty", asGetNumericProperty);
          defineNonEnumerableProperty(global[name].prototype, "asSetNumericProperty", asSetNumericProperty);
        });

        global.Array.prototype.asGetProperty = function (namespaces, name, flags) {
          if (typeof name === "number") {
            return this[name];
          }
          return asGetProperty.call(this, namespaces, name, flags);
        };

        global.Array.prototype.asSetProperty = function (namespaces, name, flags, value) {
          if (typeof name === "number") {
            this[name] = value;
            return;
          }
          return asSetProperty.call(this, namespaces, name, flags, value);
        };
      }
      Runtime.initializeGlobalObject = initializeGlobalObject;

      initializeGlobalObject(jsGlobal);

      function nameInTraits(object, qn) {
        if (object.hasOwnProperty(Runtime.VM_BINDINGS) && object.hasOwnProperty(qn)) {
          return true;
        }

        var proto = Object.getPrototypeOf(object);
        return proto.hasOwnProperty(Runtime.VM_BINDINGS) && proto.hasOwnProperty(qn);
      }
      Runtime.nameInTraits = nameInTraits;

      function CatchScopeObject(domain, trait) {
        if (trait) {
          new Runtime.CatchBindings(new Runtime.Scope(null, this), trait).applyTo(domain, this);
        }
      }
      Runtime.CatchScopeObject = CatchScopeObject;

      var Global = (function () {
        function Global(script) {
          this.scriptInfo = script;
          script.global = this;
          this.scriptBindings = new Runtime.ScriptBindings(script, new Runtime.Scope(null, this, false));
          this.scriptBindings.applyTo(script.abc.applicationDomain, this);
          script.loaded = true;
        }
        Global.prototype.toString = function () {
          return "[object global]";
        };

        Global.prototype.isExecuted = function () {
          return this.scriptInfo.executed;
        };

        Global.prototype.isExecuting = function () {
          return this.scriptInfo.executing;
        };

        Global.prototype.ensureExecuted = function () {
          Shumway.AVM2.Runtime.ensureScriptIsExecuted(this.scriptInfo);
        };
        return Global;
      })();
      Runtime.Global = Global;

      defineNonEnumerableProperty(Global.prototype, Multiname.getPublicQualifiedName("toString"), function () {
        return this.toString();
      });

      var LazyInitializer = (function () {
        function LazyInitializer(target) {
          release || assert(!target.asLazyInitializer);
          this._target = target;
          this._resolved = null;
        }
        LazyInitializer.create = function (target) {
          if (target.asLazyInitializer) {
            return target.asLazyInitializer;
          }
          return target.asLazyInitializer = new LazyInitializer(target);
        };

        LazyInitializer.prototype.resolve = function () {
          if (this._resolved) {
            return this._resolved;
          }
          if (this._target instanceof ScriptInfo) {
            var scriptInfo = this._target;
            Runtime.ensureScriptIsExecuted(scriptInfo, "Lazy Initializer");
            return this._resolved = scriptInfo.global;
          } else if (this._target instanceof ClassInfo) {
            var classInfo = this._target;
            if (classInfo.classObject) {
              return this._resolved = classInfo.classObject;
            }
            return this._resolved = classInfo.abc.applicationDomain.getProperty(classInfo.instanceInfo.name, false, false);
          } else {
            Shumway.Debug.notImplemented(String(this._target));
            return;
          }
        };
        return LazyInitializer;
      })();
      Runtime.LazyInitializer = LazyInitializer;

      function forEachPublicProperty(object, fn, self) {
        if (!object.asBindings) {
          for (var key in object) {
            fn.call(self, key, object[key]);
          }
          return;
        }

        for (var key in object) {
          if (Shumway.isNumeric(key)) {
            fn.call(self, key, object[key]);
          } else if (Multiname.isPublicQualifiedName(key) && object.asBindings.indexOf(key) < 0) {
            var name = Multiname.stripPublicQualifier(key);
            fn.call(self, name, object[key]);
          }
        }
      }
      Runtime.forEachPublicProperty = forEachPublicProperty;

      function wrapJSObject(object) {
        var wrapper = Object.create(object);
        for (var i in object) {
          Object.defineProperty(wrapper, Multiname.getPublicQualifiedName(i), (function (object, i) {
            return {
              get: function () {
                return object[i];
              },
              set: function (value) {
                object[i] = value;
              },
              enumerable: true
            };
          })(object, i));
        }
        return wrapper;
      }
      Runtime.wrapJSObject = wrapJSObject;

      function asCreateActivation(methodInfo) {
        return Object.create(methodInfo.activationPrototype);
      }
      Runtime.asCreateActivation = asCreateActivation;

      var GlobalMultinameResolver = (function () {
        function GlobalMultinameResolver() {
        }
        GlobalMultinameResolver.updateTraits = function (traits) {
          for (var i = 0; i < traits.length; i++) {
            var trait = traits[i];
            var name = trait.name.name;
            var namespace = trait.name.getNamespace();
            if (!namespace.isDynamic()) {
              GlobalMultinameResolver.hasNonDynamicNamespaces[name] = true;
              if (GlobalMultinameResolver.wasResolved[name]) {
                Shumway.Debug.notImplemented("We have to the undo the optimization, " + name + " can now bind to " + namespace);
              }
            }
          }
        };

        GlobalMultinameResolver.loadAbc = function (abc) {
          if (!Runtime.globalMultinameAnalysis.value) {
            return;
          }
          var scripts = abc.scripts;
          var classes = abc.classes;
          var methods = abc.methods;
          for (var i = 0; i < scripts.length; i++) {
            GlobalMultinameResolver.updateTraits(scripts[i].traits);
          }
          for (var i = 0; i < classes.length; i++) {
            GlobalMultinameResolver.updateTraits(classes[i].traits);
            GlobalMultinameResolver.updateTraits(classes[i].instanceInfo.traits);
          }
          for (var i = 0; i < methods.length; i++) {
            if (methods[i].traits) {
              GlobalMultinameResolver.updateTraits(methods[i].traits);
            }
          }
        };

        GlobalMultinameResolver.resolveMultiname = function (multiname) {
          var name = multiname.name;
          if (GlobalMultinameResolver.hasNonDynamicNamespaces[name]) {
            return;
          }
          GlobalMultinameResolver.wasResolved[name] = true;
          return new Multiname([Namespace.PUBLIC], multiname.name);
        };
        GlobalMultinameResolver.hasNonDynamicNamespaces = createEmptyObject();
        GlobalMultinameResolver.wasResolved = createEmptyObject();
        return GlobalMultinameResolver;
      })();
      Runtime.GlobalMultinameResolver = GlobalMultinameResolver;

      var ActivationInfo = (function () {
        function ActivationInfo(methodInfo) {
          this.methodInfo = methodInfo;
        }
        return ActivationInfo;
      })();
      Runtime.ActivationInfo = ActivationInfo;

      var HasNext2Info = (function () {
        function HasNext2Info(object, index) {
          this.object = object;
          this.index = index;
        }
        return HasNext2Info;
      })();
      Runtime.HasNext2Info = HasNext2Info;

      function sliceArguments(args, offset) {
        if (typeof offset === "undefined") { offset = 0; }
        return Array.prototype.slice.call(args, offset);
      }
      Runtime.sliceArguments = sliceArguments;

      function canCompile(mi) {
        if (!mi.hasBody) {
          return false;
        }
        if (mi.hasExceptions() && !Runtime.compilerEnableExceptions.value) {
          return false;
        } else if (mi.hasSetsDxns()) {
          return false;
        } else if (mi.code.length > Runtime.compilerMaximumMethodSize.value) {
          return false;
        }
        return true;
      }
      Runtime.canCompile = canCompile;

      function shouldCompile(mi) {
        if (!canCompile(mi)) {
          return false;
        }

        if (mi.isClassInitializer || mi.isScriptInitializer) {
          return false;
        }
        return true;
      }
      Runtime.shouldCompile = shouldCompile;

      function forceCompile(mi) {
        if (mi.hasExceptions()) {
          return false;
        }
        var holder = mi.holder;
        if (holder instanceof ClassInfo) {
          holder = holder.instanceInfo;
        }
        if (holder instanceof InstanceInfo) {
          var packageName = holder.name.namespaces[0].uri;
          switch (packageName) {
            case "flash.geom":
            case "flash.events":
              return true;
            default:
              break;
          }
          var className = holder.name.getOriginalName();
          switch (className) {
            case "com.google.youtube.model.VideoData":
              return true;
          }
        }
        return false;
      }
      Runtime.forceCompile = forceCompile;

      Runtime.CODE_CACHE = createEmptyObject();

      function searchCodeCache(methodInfo) {
        if (!Runtime.codeCaching.value) {
          return;
        }
        var cacheInfo = Runtime.CODE_CACHE[methodInfo.abc.hash];
        if (!cacheInfo) {
          warn("Cannot Find Code Cache For ABC, name: " + methodInfo.abc.name + ", hash: " + methodInfo.abc.hash);
          AVM2.countTimeline("Code Cache ABC Miss");
          return;
        }
        if (!cacheInfo.isInitialized) {
          cacheInfo.isInitialized = true;
        }
        var method = cacheInfo.methods[methodInfo.index];
        if (!method) {
          if (methodInfo.isInstanceInitializer || methodInfo.isClassInitializer) {
            AVM2.countTimeline("Code Cache Query On Initializer");
          } else {
            AVM2.countTimeline("Code Cache MISS ON OTHER");
            warn("Shouldn't MISS: " + methodInfo + " " + methodInfo.debugName);
          }

          AVM2.countTimeline("Code Cache Miss");
          return;
        }
        log("Linking CC: " + methodInfo);
        AVM2.countTimeline("Code Cache Hit");
        return method;
      }
      Runtime.searchCodeCache = searchCodeCache;

      function createInterpretedFunction(methodInfo, scope, hasDynamicScope) {
        var mi = methodInfo;
        var hasDefaults = false;
        var defaults = mi.parameters.map(function (p) {
          if (p.value !== undefined) {
            hasDefaults = true;
          }
          return p.value;
        });
        var fn;
        if (hasDynamicScope) {
          fn = function (scope) {
            var global = (this === jsGlobal ? scope.global.object : this);
            var args = sliceArguments(arguments, 1);
            if (hasDefaults && args.length < defaults.length) {
              args = args.concat(defaults.slice(args.length - defaults.length));
            }
            return Shumway.AVM2.Interpreter.interpretMethod(global, methodInfo, scope, args);
          };
        } else {
          fn = function () {
            var global = (this === jsGlobal ? scope.global.object : this);
            var args = sliceArguments(arguments);
            if (hasDefaults && args.length < defaults.length) {
              args = args.concat(defaults.slice(arguments.length - defaults.length));
            }
            return Shumway.AVM2.Interpreter.interpretMethod(global, methodInfo, scope, args);
          };
        }
        if (methodInfo.hasSetsDxns()) {
          fn = (function (fn) {
            return function () {
              var savedDxns = Shumway.AVM2.AS.ASXML.defaultNamespace;
              try  {
                var result = fn.apply(this, arguments);
                Shumway.AVM2.AS.ASXML.defaultNamespace = savedDxns;
                return result;
              } catch (e) {
                Shumway.AVM2.AS.ASXML.defaultNamespace = savedDxns;
                throw e;
              }
            };
          })(fn);
        }
        fn.instanceConstructor = fn;
        fn.debugName = "Interpreter Function #" + vmNextInterpreterFunctionId++;
        return fn;
      }
      Runtime.createInterpretedFunction = createInterpretedFunction;

      function debugName(value) {
        if (Shumway.isFunction(value)) {
          return value.debugName;
        }
        return value;
      }
      Runtime.debugName = debugName;

      function createCompiledFunction(methodInfo, scope, hasDynamicScope, breakpoint, deferCompilation) {
        var mi = methodInfo;
        var cached = searchCodeCache(mi);
        var compilation;
        if (!cached) {
          compilation = AVM2.Compiler.compileMethod(mi, scope, hasDynamicScope);
        }

        var fnName = mi.name ? Multiname.getQualifiedName(mi.name) : "fn" + compiledFunctionCount;
        if (mi.holder) {
          var fnNamePrefix = "";
          if (mi.holder instanceof ClassInfo) {
            fnNamePrefix = "static$" + mi.holder.instanceInfo.name.getName();
          } else if (mi.holder instanceof InstanceInfo) {
            fnNamePrefix = mi.holder.name.getName();
          } else if (mi.holder instanceof ScriptInfo) {
            fnNamePrefix = "script";
          }
          fnName = fnNamePrefix + "$" + fnName;
        }
        fnName = Shumway.StringUtilities.escapeString(fnName);
        if (mi.verified) {
          fnName += "$V";
        }
        if (!breakpoint) {
          var breakFilter = Shumway.AVM2.Compiler.breakFilter.value;
          if (breakFilter && fnName.search(breakFilter) >= 0) {
            breakpoint = true;
          }
        }
        var body = compilation.body;
        if (breakpoint) {
          body = "{ debugger; \n" + body + "}";
        }
        if (!cached) {
          var fnSource = "function " + fnName + " (" + compilation.parameters.join(", ") + ") " + body;
        }

        if (Runtime.traceFunctions.value > 1) {
          mi.trace(new IndentingWriter(), mi.abc);
        }
        mi.debugTrace = function () {
          mi.trace(new IndentingWriter(), mi.abc);
        };
        if (Runtime.traceFunctions.value > 0) {
          log(fnSource);
        }

        var fn = cached || new Function("return " + fnSource)();

        fn.debugName = "Compiled Function #" + vmNextCompiledFunctionId++;
        return fn;
      }
      Runtime.createCompiledFunction = createCompiledFunction;

      function createFunction(mi, scope, hasDynamicScope, breakpoint) {
        if (typeof breakpoint === "undefined") { breakpoint = false; }
        release || assert(!mi.isNative(), "Method should have a builtin: " + mi.name);

        if (mi.freeMethod) {
          if (hasDynamicScope) {
            return Runtime.bindFreeMethodScope(mi, scope);
          }
          return mi.freeMethod;
        }

        var fn;

        if ((fn = Runtime.checkMethodOverrides(mi))) {
          release || assert(!hasDynamicScope);
          return fn;
        }

        ensureFunctionIsInitialized(mi);

        var useInterpreter = false;
        if ((mi.abc.applicationDomain.mode === 1 /* INTERPRET */ || !shouldCompile(mi)) && !forceCompile(mi)) {
          useInterpreter = true;
        }

        var compileFilter = Shumway.AVM2.Compiler.compileFilter.value;
        if (compileFilter && mi.name && Multiname.getQualifiedName(mi.name).search(compileFilter) < 0) {
          useInterpreter = true;
        }

        if (useInterpreter) {
          mi.freeMethod = createInterpretedFunction(mi, scope, hasDynamicScope);
        } else {
          compiledFunctionCount++;
          mi.freeMethod = createCompiledFunction(mi, scope, hasDynamicScope, breakpoint, mi.isInstanceInitializer);
        }

        mi.freeMethod.methodInfo = mi;

        if (hasDynamicScope) {
          return Runtime.bindFreeMethodScope(mi, scope);
        }
        return mi.freeMethod;
      }
      Runtime.createFunction = createFunction;

      function ensureFunctionIsInitialized(methodInfo) {
        var mi = methodInfo;

        if (!mi.analysis) {
          mi.analysis = new AVM2.Analysis(mi);

          if (mi.needsActivation()) {
            mi.activationPrototype = new ActivationInfo(mi);
            new Runtime.ActivationBindings(mi).applyTo(mi.abc.applicationDomain, mi.activationPrototype);
          }

          var exceptions = mi.exceptions;
          for (var i = 0, j = exceptions.length; i < j; i++) {
            var handler = exceptions[i];
            if (handler.varName) {
              var varTrait = Object.create(Trait.prototype);
              varTrait.kind = 0 /* Slot */;
              varTrait.name = handler.varName;
              varTrait.typeName = handler.typeName;
              varTrait.holder = mi;
              handler.scopeObject = new CatchScopeObject(mi.abc.applicationDomain, varTrait);
            } else {
              handler.scopeObject = new CatchScopeObject(undefined, undefined);
            }
          }
        }
      }
      Runtime.ensureFunctionIsInitialized = ensureFunctionIsInitialized;

      function getTraitFunction(trait, scope, natives) {
        release || assert(scope);
        release || assert(trait.isMethod() || trait.isGetter() || trait.isSetter());

        var mi = trait.methodInfo;
        var fn;

        if (mi.isNative()) {
          var md = trait.metadata;
          if (md && md.native) {
            var nativeName = md.native.value[0].value;
            fn = Shumway.AVM2.AS.getNative(nativeName);
          } else if (natives) {
            fn = Shumway.AVM2.AS.getMethodOrAccessorNative(trait, natives);
          }
          if (!fn) {
            Shumway.Debug.warning("No native method for: " + trait.kindName() + " " + mi.holder + "::" + Multiname.getQualifiedName(mi.name) + ", make sure you've got the static keyword for static methods.");
            return (function (mi) {
              return function () {
                Shumway.Debug.warning("Calling undefined native method: " + trait.kindName() + " " + mi.holder.name + "::" + Multiname.getQualifiedName(mi.name));
              };
            })(mi);
          }
        } else {
          if (Runtime.traceExecution.value >= 2) {
            log("Creating Function For Trait: " + trait.holder + " " + trait);
          }
          fn = createFunction(mi, scope, false, false);
          release || assert(fn);
        }
        if (Runtime.traceExecution.value >= 3) {
          log("Made Function: " + Multiname.getQualifiedName(mi.name));
        }
        return fn;
      }
      Runtime.getTraitFunction = getTraitFunction;

      function createClass(classInfo, baseClass, scope) {
        var ci = classInfo;
        var ii = ci.instanceInfo;
        var domain = ci.abc.applicationDomain;

        var className = Multiname.getName(ii.name);

        AVM2.enterTimeline("createClass", { className: className, classInfo: classInfo });

        if (Runtime.traceExecution.value) {
          log("Creating " + (ii.isInterface() ? "Interface" : "Class") + ": " + className + (ci.native ? " replaced with native " + ci.native.cls : ""));
        }

        var cls;

        if (ii.isInterface()) {
          cls = Shumway.AVM2.AS.createInterface(classInfo);
        } else {
          cls = Shumway.AVM2.AS.createClass(classInfo, baseClass, scope);
        }

        if (Runtime.traceClasses.value) {
          domain.loadedClasses.push(cls);
          domain.traceLoadedClasses(true);
        }

        if (ii.isInterface()) {
          AVM2.leaveTimeline();
          return cls;
        }

        domain.onMessage.notify1('classCreated', cls);

        classInfo.classObject = cls;

        if (Runtime.traceExecution.value) {
          log("Running " + (ii.isInterface() ? "Interface" : "Class") + ": " + className + " Static Constructor");
        }
        AVM2.enterTimeline("staticInitializer");
        createFunction(classInfo.init, scope, false, false).call(cls);
        AVM2.leaveTimeline();
        if (Runtime.traceExecution.value) {
          log("Done With Static Constructor");
        }

        if (Runtime.sealConstTraits) {
          this.sealConstantTraits(cls, ci.traits);
        }
        AVM2.leaveTimeline();
        return cls;
      }
      Runtime.createClass = createClass;

      function sealConstantTraits(object, traits) {
        for (var i = 0, j = traits.length; i < j; i++) {
          var trait = traits[i];
          if (trait.isConst()) {
            var qn = Multiname.getQualifiedName(trait.name);
            var value = object[qn];
            (function (qn, value) {
              Object.defineProperty(object, qn, {
                configurable: false, enumerable: false,
                get: function () {
                  return value;
                },
                set: function () {
                  throwErrorFromVM(Runtime.AVM2.currentDomain(), "ReferenceError", "Illegal write to read-only property " + qn + ".", 0);
                }
              });
            })(qn, value);
          }
        }
      }
      Runtime.sealConstantTraits = sealConstantTraits;

      function applyType(methodInfo, factory, types) {
        var factoryClassName = factory.classInfo.instanceInfo.name.name;
        if (factoryClassName === "Vector") {
          release || assert(types.length === 1);
          var type = types[0];
          var typeClassName;
          if (!isNullOrUndefined(type)) {
            typeClassName = type.classInfo.instanceInfo.name.name.toLowerCase();
            switch (typeClassName) {
              case "number":
                typeClassName = "double";
              case "int":
              case "uint":
              case "double":
                return methodInfo.abc.applicationDomain.getClass("packageInternal __AS3__.vec.Vector$" + typeClassName);
            }
          }
          return methodInfo.abc.applicationDomain.getClass("packageInternal __AS3__.vec.Vector$object").applyType(type);
        } else {
          Shumway.Debug.notImplemented(factoryClassName);
          return;
        }
      }
      Runtime.applyType = applyType;

      function createName(namespaces, name) {
        return new Multiname(namespaces, name);
      }
      Runtime.createName = createName;
    })(AVM2.Runtime || (AVM2.Runtime = {}));
    var Runtime = AVM2.Runtime;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var CC = Shumway.AVM2.Runtime.CODE_CACHE;

var HasNext2Info = Shumway.AVM2.Runtime.HasNext2Info;

var asCreateActivation = Shumway.AVM2.Runtime.asCreateActivation;
var asIsInstanceOf = Shumway.AVM2.Runtime.asIsInstanceOf;
var asIsType = Shumway.AVM2.Runtime.asIsType;
var asAsType = Shumway.AVM2.Runtime.asAsType;
var asTypeOf = Shumway.AVM2.Runtime.asTypeOf;
var asCoerceByMultiname = Shumway.AVM2.Runtime.asCoerceByMultiname;
var asCoerce = Shumway.AVM2.Runtime.asCoerce;
var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
var asCoerceInt = Shumway.AVM2.Runtime.asCoerceInt;
var asCoerceUint = Shumway.AVM2.Runtime.asCoerceUint;
var asCoerceNumber = Shumway.AVM2.Runtime.asCoerceNumber;
var asCoerceBoolean = Shumway.AVM2.Runtime.asCoerceBoolean;
var asCoerceObject = Shumway.AVM2.Runtime.asCoerceObject;
var asCompare = Shumway.AVM2.Runtime.asCompare;
var asAdd = Shumway.AVM2.Runtime.asAdd;
var applyType = Shumway.AVM2.Runtime.applyType;

var asGetSlot = Shumway.AVM2.Runtime.asGetSlot;
var asSetSlot = Shumway.AVM2.Runtime.asSetSlot;
var asHasNext2 = Shumway.AVM2.Runtime.asHasNext2;
var getDescendants = Shumway.AVM2.Runtime.getDescendants;
var checkFilter = Shumway.AVM2.Runtime.checkFilter;

var sliceArguments = Shumway.AVM2.Runtime.sliceArguments;

var createFunction = Shumway.AVM2.Runtime.createFunction;
var createName = Shumway.AVM2.Runtime.createName;
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Runtime) {
      var Multiname = Shumway.AVM2.ABC.Multiname;

      var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;

      var assert = Shumway.Debug.assert;

      var boxValue = Shumway.ObjectUtilities.boxValue;

      var counter = Shumway.Metrics.Counter.instance;

      function makeCacheKey(namespaces, name, flags) {
        if (!namespaces) {
          return name;
        } else if (namespaces.length > 1) {
          return namespaces.runtimeId + "$" + name;
        } else {
          return namespaces[0].qualifiedName + "$" + name;
        }
      }

      var Scope = (function () {
        function Scope(parent, object, isWith) {
          if (typeof isWith === "undefined") { isWith = false; }
          this.parent = parent;
          this.object = boxValue(object);
          release || assert(Shumway.isObject(this.object));
          this.global = parent ? parent.global : this;
          this.isWith = isWith;
          this.cache = createEmptyObject();
        }
        Scope.prototype.findDepth = function (object) {
          var current = this;
          var depth = 0;
          while (current) {
            if (current.object === object) {
              return depth;
            }
            depth++;
            current = current.parent;
          }
          return -1;
        };

        Scope.prototype.getScopeObjects = function () {
          var objects = [];
          var current = this;
          while (current) {
            objects.unshift(current.object);
            current = current.parent;
          }
          return objects;
        };

        Scope.prototype.findScopeProperty = function (namespaces, name, flags, method, strict, scopeOnly) {
          AVM2.countTimeline("findScopeProperty");
          var object;
          var key = makeCacheKey(namespaces, name, flags);
          if (!scopeOnly && (object = this.cache[key])) {
            return object;
          }

          if (this.object.asHasPropertyInternal(namespaces, name, flags)) {
            return this.isWith ? this.object : (this.cache[key] = this.object);
          }
          if (this.parent) {
            return (this.cache[key] = this.parent.findScopeProperty(namespaces, name, flags, method, strict, scopeOnly));
          }
          if (scopeOnly) {
            return null;
          }

          if ((object = method.abc.applicationDomain.findDomainProperty(new Multiname(namespaces, name, flags), strict, true))) {
            return object;
          }
          if (strict) {
            Shumway.Debug.unexpected("Cannot find property " + name);
          }

          return this.global.object;
        };
        return Scope;
      })();
      Runtime.Scope = Scope;

      function bindFreeMethodScope(methodInfo, scope) {
        var fn = methodInfo.freeMethod;
        if (methodInfo.lastBoundMethod && methodInfo.lastBoundMethod.scope === scope) {
          return methodInfo.lastBoundMethod.boundMethod;
        }
        release || assert(fn, "There should already be a cached method.");
        var boundMethod;
        var asGlobal = scope.global.object;
        if (!methodInfo.hasOptional() && !methodInfo.needsArguments() && !methodInfo.needsRest()) {
          switch (methodInfo.parameters.length) {
            case 0:
              boundMethod = function () {
                return fn.call(this === jsGlobal ? asGlobal : this, scope);
              };
              break;
            case 1:
              boundMethod = function (x) {
                return fn.call(this === jsGlobal ? asGlobal : this, scope, x);
              };
              break;
            case 2:
              boundMethod = function (x, y) {
                return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y);
              };
              break;
            case 3:
              boundMethod = function (x, y, z) {
                return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y, z);
              };
              break;
            default:
              break;
          }
        }
        if (!boundMethod) {
          AVM2.countTimeline("Bind Scope - Slow Path");
          boundMethod = function () {
            Array.prototype.unshift.call(arguments, scope);
            var global = (this === jsGlobal ? scope.global.object : this);
            return fn.asApply(global, arguments);
          };
        }
        boundMethod.methodInfo = methodInfo;
        boundMethod.instanceConstructor = boundMethod;
        methodInfo.lastBoundMethod = {
          scope: scope,
          boundMethod: boundMethod
        };
        return boundMethod;
      }
      Runtime.bindFreeMethodScope = bindFreeMethodScope;
    })(AVM2.Runtime || (AVM2.Runtime = {}));
    var Runtime = AVM2.Runtime;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var Scope = Shumway.AVM2.Runtime.Scope;
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Runtime) {
      var Multiname = Shumway.AVM2.ABC.Multiname;

      var Trait = Shumway.AVM2.ABC.Trait;

      var hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
      var createMap = Shumway.ObjectUtilities.createMap;
      var cloneObject = Shumway.ObjectUtilities.cloneObject;
      var copyProperties = Shumway.ObjectUtilities.copyProperties;
      var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;

      var assert = Shumway.Debug.assert;

      var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;

      var defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;
      var makeForwardingGetter = Shumway.FunctionUtilities.makeForwardingGetter;

      var pushUnique = Shumway.ArrayUtilities.pushUnique;

      var Binding = (function () {
        function Binding(trait) {
          this.trait = trait;
        }
        Binding.getKey = function (qn, trait) {
          var key = qn;
          if (trait.isGetter()) {
            key = Binding.GET_PREFIX + qn;
          } else if (trait.isSetter()) {
            key = Binding.SET_PREFIX + qn;
          }
          return key;
        };
        Binding.prototype.toString = function () {
          return String(this.trait);
        };
        Binding.SET_PREFIX = "set ";
        Binding.GET_PREFIX = "get ";
        Binding.KEY_PREFIX_LENGTH = 4;
        return Binding;
      })();
      Runtime.Binding = Binding;

      var SlotInfo = (function () {
        function SlotInfo(name, isConst, type, trait) {
          this.name = name;
          this.isConst = isConst;
          this.type = type;
          this.trait = trait;
        }
        return SlotInfo;
      })();
      Runtime.SlotInfo = SlotInfo;

      var SlotInfoMap = (function () {
        function SlotInfoMap() {
          this.byID = createMap();
          this.byQN = createMap();
        }
        return SlotInfoMap;
      })();
      Runtime.SlotInfoMap = SlotInfoMap;

      var Bindings = (function () {
        function Bindings() {
          this.map = createMap();
          this.slots = [];
          this.nextSlotId = 1;
        }
        Bindings.prototype.assignNextSlot = function (trait) {
          release || assert(trait instanceof Trait);
          release || assert(trait.isSlot() || trait.isConst() || trait.isClass());
          if (!trait.slotId) {
            trait.slotId = this.nextSlotId++;
          } else {
            this.nextSlotId = trait.slotId + 1;
          }
          release || assert(!this.slots[trait.slotId], "Trait slot already taken.");
          this.slots[trait.slotId] = trait;
        };

        Bindings.prototype.trace = function (writer) {
          writer.enter("Bindings");
          for (var key in this.map) {
            var binding = this.map[key];
            writer.writeLn(binding.trait.kindName() + ": " + key + " -> " + binding);
          }
          writer.leaveAndEnter("Slots");
          writer.writeArray(this.slots);
          writer.outdent();
        };

        Bindings.prototype.applyTo = function (domain, object, append) {
          if (typeof append === "undefined") { append = false; }
          if (!append) {
            release || assert(!hasOwnProperty(object, Runtime.VM_SLOTS), "Already has VM_SLOTS.");
            release || assert(!hasOwnProperty(object, Runtime.VM_BINDINGS), "Already has VM_BINDINGS.");
            release || assert(!hasOwnProperty(object, Runtime.VM_OPEN_METHODS), "Already has VM_OPEN_METHODS.");

            defineNonEnumerableProperty(object, Runtime.VM_SLOTS, new SlotInfoMap());
            defineNonEnumerableProperty(object, Runtime.VM_BINDINGS, []);
            defineNonEnumerableProperty(object, Runtime.VM_OPEN_METHODS, createMap());

            defineNonEnumerableProperty(object, "bindings", this);
            defineNonEnumerableProperty(object, "resolutionMap", []);
          }

          traitsWriter && traitsWriter.greenLn("Applying Traits" + (append ? " (Append)" : ""));

          for (var key in this.map) {
            var binding = this.map[key];
            var trait = binding.trait;
            var qn = Multiname.getQualifiedName(trait.name);
            if (trait.isSlot() || trait.isConst() || trait.isClass()) {
              var defaultValue = undefined;
              if (trait.isSlot() || trait.isConst()) {
                if (trait.hasDefaultValue) {
                  defaultValue = trait.value;
                } else if (trait.typeName) {
                  defaultValue = domain.findClassInfo(trait.typeName).defaultValue;
                }
              }
              if (key !== qn) {
                traitsWriter && traitsWriter.yellowLn("Binding Trait: " + key + " -> " + qn);
                defineNonEnumerableGetter(object, key, makeForwardingGetter(qn));
                pushUnique(object.asBindings, key);
              } else {
                traitsWriter && traitsWriter.greenLn("Applying Trait " + trait.kindName() + ": " + trait);
                defineNonEnumerableProperty(object, qn, defaultValue);
                pushUnique(object.asBindings, qn);
                var slotInfo = new SlotInfo(qn, trait.isConst(), trait.typeName ? domain.getProperty(trait.typeName, false, false) : null, trait);
                object.asSlots.byID[trait.slotId] = slotInfo;
                object.asSlots.byQN[qn] = slotInfo;
              }
            } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
              if (trait.isGetter() || trait.isSetter()) {
                key = key.substring(Binding.KEY_PREFIX_LENGTH);
              }
              if (key !== qn) {
                traitsWriter && traitsWriter.yellowLn("Binding Trait: " + key + " -> " + qn);
              } else {
                traitsWriter && traitsWriter.greenLn("Applying Trait " + trait.kindName() + ": " + trait);
              }
              pushUnique(object.asBindings, key);
              AVM2.enterTimeline("applyMethodTrait");
              if (this instanceof ScriptBindings) {
                Runtime.applyNonMemoizedMethodTrait(key, trait, object, binding.scope, binding.natives);
              } else {
                Runtime.applyMemoizedMethodTrait(key, trait, object, binding.scope, binding.natives);
              }
              AVM2.leaveTimeline();
            }
          }
        };
        return Bindings;
      })();
      Runtime.Bindings = Bindings;

      var ActivationBindings = (function (_super) {
        __extends(ActivationBindings, _super);
        function ActivationBindings(methodInfo) {
          _super.call(this);
          release || assert(methodInfo.needsActivation());
          this.methodInfo = methodInfo;

          var traits = methodInfo.traits;
          for (var i = 0; i < traits.length; i++) {
            var trait = traits[i];
            release || assert(trait.isSlot() || trait.isConst(), "Only slot or constant traits are allowed in activation objects.");
            var key = Multiname.getQualifiedName(trait.name);
            this.map[key] = new Binding(trait);
            this.assignNextSlot(trait);
          }
        }
        return ActivationBindings;
      })(Bindings);
      Runtime.ActivationBindings = ActivationBindings;

      var CatchBindings = (function (_super) {
        __extends(CatchBindings, _super);
        function CatchBindings(scope, trait) {
          _super.call(this);

          var key = Multiname.getQualifiedName(trait.name);
          this.map[key] = new Binding(trait);
          release || assert(trait.isSlot(), "Only slot traits are allowed in catch objects.");
          this.assignNextSlot(trait);
        }
        return CatchBindings;
      })(Bindings);
      Runtime.CatchBindings = CatchBindings;

      var ScriptBindings = (function (_super) {
        __extends(ScriptBindings, _super);
        function ScriptBindings(scriptInfo, scope) {
          _super.call(this);
          this.scope = scope;
          this.scriptInfo = scriptInfo;

          var traits = scriptInfo.traits;
          for (var i = 0; i < traits.length; i++) {
            var trait = traits[i];
            var name = Multiname.getQualifiedName(trait.name);
            var key = Binding.getKey(name, trait);
            var binding = this.map[key] = new Binding(trait);
            if (trait.isSlot() || trait.isConst() || trait.isClass()) {
              this.assignNextSlot(trait);
            }
            if (trait.isClass()) {
              if (trait.metadata && trait.metadata.native) {
                trait.classInfo.native = trait.metadata.native;
              }
            }
            if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
              binding.scope = this.scope;
            }
          }
        }
        return ScriptBindings;
      })(Bindings);
      Runtime.ScriptBindings = ScriptBindings;

      var ClassBindings = (function (_super) {
        __extends(ClassBindings, _super);
        function ClassBindings(classInfo, scope, natives) {
          _super.call(this);
          this.scope = scope;
          this.natives = natives;
          this.classInfo = classInfo;

          var traits = classInfo.traits;
          for (var i = 0; i < traits.length; i++) {
            var trait = traits[i];
            var name = Multiname.getQualifiedName(trait.name);
            var key = Binding.getKey(name, trait);
            var binding = this.map[key] = new Binding(trait);
            if (trait.isSlot() || trait.isConst()) {
              this.assignNextSlot(trait);
            }
            if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
              binding.scope = this.scope;
              binding.natives = this.natives;
            }
          }
        }
        return ClassBindings;
      })(Bindings);
      Runtime.ClassBindings = ClassBindings;

      var InstanceBindings = (function (_super) {
        __extends(InstanceBindings, _super);
        function InstanceBindings(parent, instanceInfo, scope, natives) {
          _super.call(this);
          this.scope = scope;
          this.natives = natives;
          this.parent = parent;
          this.instanceInfo = instanceInfo;
          this.implementedInterfaces = parent ? cloneObject(parent.implementedInterfaces) : createEmptyObject();
          if (parent) {
            this.slots = parent.slots.slice();
            this.nextSlotId = parent.nextSlotId;
          }
          this.extend(parent);
        }
        InstanceBindings.prototype.extend = function (parent) {
          var ii = this.instanceInfo, ib;
          var map = this.map;
          var name, key, trait, binding, protectedName, protectedKey;

          if (parent) {
            for (key in parent.map) {
              binding = parent.map[key];
              trait = binding.trait;
              map[key] = binding;
              if (trait.isProtected()) {
                protectedName = Multiname.getQualifiedName(new Multiname([ii.protectedNs], trait.name.getName()));
                protectedKey = Binding.getKey(protectedName, trait);
                map[protectedKey] = binding;
              }
            }
          }

          function writeOrOverwriteBinding(object, key, binding) {
            var trait = binding.trait;
            var oldBinding = object[key];
            if (oldBinding) {
              var oldTrait = oldBinding.trait;
              release || assert(!oldTrait.isFinal(), "Cannot redefine a final trait: " + trait);

              release || assert(trait.isOverride() || trait.name.getName() === "length", "Overriding a trait that is not marked for override: " + trait);
            } else {
              release || assert(!trait.isOverride(), "Trait marked override must override another trait: " + trait);
            }
            object[key] = binding;
          }

          function overwriteProtectedBinding(object, key, binding) {
            if (key in object) {
              object[key] = binding;
            }
          }

          var traits = ii.traits;
          for (var i = 0; i < traits.length; i++) {
            trait = traits[i];
            name = Multiname.getQualifiedName(trait.name);
            key = Binding.getKey(name, trait);
            binding = new Binding(trait);
            writeOrOverwriteBinding(map, key, binding);
            if (trait.isProtected()) {
              ib = this.parent;
              while (ib) {
                protectedName = Multiname.getQualifiedName(new Multiname([ib.instanceInfo.protectedNs], trait.name.getName()));
                protectedKey = Binding.getKey(protectedName, trait);
                overwriteProtectedBinding(map, protectedKey, binding);
                ib = ib.parent;
              }
            }
            if (trait.isSlot() || trait.isConst()) {
              this.assignNextSlot(trait);
            }
            if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
              binding.scope = this.scope;
              binding.natives = this.natives;
            }
          }

          var domain = ii.abc.applicationDomain;
          var interfaces = ii.interfaces;

          var _interface;

          for (var i = 0; i < interfaces.length; i++) {
            _interface = domain.getProperty(interfaces[i], true, true);

            release || assert(_interface);
            copyProperties(this.implementedInterfaces, _interface.interfaceBindings.implementedInterfaces);
            this.implementedInterfaces[Multiname.getQualifiedName(_interface.classInfo.instanceInfo.name)] = _interface;
          }

          for (var interfaceName in this.implementedInterfaces) {
            _interface = this.implementedInterfaces[interfaceName];
            ib = _interface.interfaceBindings;
            for (var interfaceKey in ib.map) {
              var interfaceBinding = ib.map[interfaceKey];
              if (ii.isInterface()) {
                map[interfaceKey] = interfaceBinding;
              } else {
                name = Multiname.getPublicQualifiedName(interfaceBinding.trait.name.getName());
                key = Binding.getKey(name, interfaceBinding.trait);
                map[interfaceKey] = map[key];
              }
            }
          }
        };

        InstanceBindings.prototype.toString = function () {
          return this.instanceInfo.toString();
        };
        return InstanceBindings;
      })(Bindings);
      Runtime.InstanceBindings = InstanceBindings;

      var traitsWriter = null;
    })(AVM2.Runtime || (AVM2.Runtime = {}));
    var Runtime = AVM2.Runtime;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var Binding = Shumway.AVM2.Runtime.Binding;
var Bindings = Shumway.AVM2.Runtime.Bindings;
var ActivationBindings = Shumway.AVM2.Runtime.ActivationBindings;
var CatchBindings = Shumway.AVM2.Runtime.CatchBindings;
var ScriptBindings = Shumway.AVM2.Runtime.ScriptBindings;
var ClassBindings = Shumway.AVM2.Runtime.ClassBindings;
var InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    AVM2.XRegExp = (function () {
      'use strict';

      var REGEX_DATA = 'xregexp', self, features = {
        astral: false,
        natives: false
      }, nativ = {
        exec: RegExp.prototype.exec,
        test: RegExp.prototype.test,
        match: String.prototype.match,
        replace: String.prototype.replace,
        split: String.prototype.split
      }, fixed = {}, cache = {}, patternCache = {}, tokens = [], defaultScope = 'default', classScope = 'class', nativeTokens = {
        'default': /\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??|[\s\S]/,
        'class': /\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|[\s\S]/
      }, replacementToken = /\$(?:{([\w$]+)}|([\d$&`']))/g, correctExecNpcg = nativ.exec.call(/()??/, '')[1] === undefined, hasNativeY = RegExp.prototype.sticky !== undefined, registeredFlags = {
        g: true,
        i: true,
        m: true,
        y: hasNativeY
      }, toString = {}.toString, add;

      function augment(regex, captureNames, addProto) {
        var p;

        if (addProto) {
          if (regex.__proto__) {
            regex.__proto__ = self.prototype;
          } else {
            for (p in self.prototype) {
              regex[p] = self.prototype[p];
            }
          }
        }

        regex[REGEX_DATA] = { captureNames: captureNames };

        return regex;
      }

      function clipDuplicates(str) {
        return nativ.replace.call(str, /([\s\S])(?=[\s\S]*\1)/g, '');
      }

      function copy(regex, options) {
        if (!self.isRegExp(regex)) {
          throw new TypeError('Type RegExp expected');
        }

        var flags = nativ.exec.call(/\/([a-z]*)$/i, String(regex))[1];
        options = options || {};

        if (options.add) {
          flags = clipDuplicates(flags + options.add);
        }

        if (options.remove) {
          flags = nativ.replace.call(flags, new RegExp('[' + options.remove + ']+', 'g'), '');
        }

        regex = augment(new RegExp(regex.source, flags), hasNamedCapture(regex) ? regex[REGEX_DATA].captureNames.slice(0) : null, options.addProto);

        return regex;
      }

      function getBaseProps() {
        return { captureNames: null };
      }

      function hasNamedCapture(regex) {
        return !!(regex[REGEX_DATA] && regex[REGEX_DATA].captureNames);
      }

      function indexOf(array, value) {
        if (Array.prototype.indexOf) {
          return array.indexOf(value);
        }

        var len = array.length, i;

        for (i = 0; i < len; ++i) {
          if (array[i] === value) {
            return i;
          }
        }

        return -1;
      }

      function isType(value, type) {
        return toString.call(value) === '[object ' + type + ']';
      }

      function isQuantifierNext(pattern, pos, flags) {
        return nativ.test.call(flags.indexOf('x') > -1 ? /^(?:\s+|#.*|\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/ : /^(?:\(\?#[^)]*\))*(?:[?*+]|{\d+(?:,\d*)?})/, pattern.slice(pos));
      }

      function prepareFlags(pattern, flags) {
        var i;

        if (clipDuplicates(flags) !== flags) {
          throw new SyntaxError('Invalid duplicate regex flag ' + flags);
        }

        pattern = nativ.replace.call(pattern, /^\(\?([\w$]+)\)/, function ($0, $1) {
          if (nativ.test.call(/[gy]/, $1)) {
            throw new SyntaxError('Cannot use flag g or y in mode modifier ' + $0);
          }

          flags = clipDuplicates(flags + $1);
          return '';
        });

        for (i = 0; i < flags.length; ++i) {
          if (!registeredFlags[flags.charAt(i)]) {
            throw new SyntaxError('Unknown regex flag ' + flags.charAt(i));
          }
        }

        return {
          pattern: pattern,
          flags: flags
        };
      }

      function prepareOptions(value) {
        value = value || {};

        if (isType(value, 'String')) {
          value = self.forEach(value, /[^\s,]+/, function (match) {
            this[match] = true;
          }, {});
        }

        return value;
      }

      function registerFlag(flag) {
        if (!/^[\w$]$/.test(flag)) {
          throw new Error('Flag must be a single character A-Za-z0-9_$');
        }

        registeredFlags[flag] = true;
      }

      function runTokens(pattern, flags, pos, scope, context) {
        var i = tokens.length, result = null, match, t;

        while (i--) {
          t = tokens[i];
          if ((t.scope === scope || t.scope === 'all') && (!t.flag || flags.indexOf(t.flag) > -1)) {
            match = self.exec(pattern, t.regex, pos, 'sticky');
            if (match) {
              result = {
                matchLength: match[0].length,
                output: t.handler.call(context, match, scope, flags),
                reparse: t.reparse
              };

              break;
            }
          }
        }

        return result;
      }

      function setAstral(on) {
        self.cache.flush('patterns');

        features.astral = on;
      }

      function setNatives(on) {
        RegExp.prototype.exec = (on ? fixed : nativ).exec;
        RegExp.prototype.test = (on ? fixed : nativ).test;
        String.prototype.match = (on ? fixed : nativ).match;
        String.prototype.replace = (on ? fixed : nativ).replace;
        String.prototype.split = (on ? fixed : nativ).split;

        features.natives = on;
      }

      function toObject(value) {
        if (value == null) {
          throw new TypeError('Cannot convert null or undefined to object');
        }

        return value;
      }

      self = function (pattern, flags) {
        var context = {
          hasNamedCapture: false,
          captureNames: []
        }, scope = defaultScope, output = '', pos = 0, result, token, key;

        if (self.isRegExp(pattern)) {
          if (flags !== undefined) {
            throw new TypeError('Cannot supply flags when copying a RegExp');
          }
          return copy(pattern, { addProto: true });
        }

        pattern = pattern === undefined ? '' : String(pattern);
        flags = flags === undefined ? '' : String(flags);

        key = pattern + '***' + flags;

        if (!patternCache[key]) {
          result = prepareFlags(pattern, flags);
          pattern = result.pattern;
          flags = result.flags;

          while (pos < pattern.length) {
            do {
              result = runTokens(pattern, flags, pos, scope, context);

              if (result && result.reparse) {
                pattern = pattern.slice(0, pos) + result.output + pattern.slice(pos + result.matchLength);
              }
            } while(result && result.reparse);

            if (result) {
              output += result.output;
              pos += (result.matchLength || 1);
            } else {
              token = self.exec(pattern, nativeTokens[scope], pos, 'sticky')[0];
              output += token;
              pos += token.length;
              if (token === '[' && scope === defaultScope) {
                scope = classScope;
              } else if (token === ']' && scope === classScope) {
                scope = defaultScope;
              }
            }
          }

          patternCache[key] = {
            pattern: nativ.replace.call(output, /\(\?:\)(?=\(\?:\))|^\(\?:\)|\(\?:\)$/g, ''),
            flags: nativ.replace.call(flags, /[^gimy]+/g, ''),
            captures: context.hasNamedCapture ? context.captureNames : null
          };
        }

        key = patternCache[key];
        return augment(new RegExp(key.pattern, key.flags), key.captures, true);
      };

      self.prototype = new RegExp;

      self.version = '3.0.0-pre';

      self.addToken = function (regex, handler, options) {
        options = options || {};
        var optionalFlags = options.optionalFlags, i;

        if (options.flag) {
          registerFlag(options.flag);
        }

        if (optionalFlags) {
          optionalFlags = nativ.split.call(optionalFlags, '');
          for (i = 0; i < optionalFlags.length; ++i) {
            registerFlag(optionalFlags[i]);
          }
        }

        tokens.push({
          regex: copy(regex, { add: 'g' + (hasNativeY ? 'y' : '') }),
          handler: handler,
          scope: options.scope || defaultScope,
          flag: options.flag,
          reparse: options.reparse
        });

        self.cache.flush('patterns');
      };

      self.cache = function (pattern, flags) {
        var key = pattern + '***' + (flags || '');
        return cache[key] || (cache[key] = self(pattern, flags));
      };

      self.cache.flush = function (cacheName) {
        if (cacheName === 'patterns') {
          patternCache = {};
        } else {
          cache = {};
        }
      };

      self.escape = function (str) {
        return nativ.replace.call(toObject(str), /[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      };

      self.exec = function (str, regex, pos, sticky) {
        var cacheFlags = 'g', match, r2;

        if (hasNativeY && (sticky || (regex.sticky && sticky !== false))) {
          cacheFlags += 'y';
        }

        regex[REGEX_DATA] = regex[REGEX_DATA] || getBaseProps();

        r2 = regex[REGEX_DATA][cacheFlags] || (regex[REGEX_DATA][cacheFlags] = copy(regex, {
          add: cacheFlags,
          remove: sticky === false ? 'y' : ''
        }));

        r2.lastIndex = pos = pos || 0;

        match = fixed.exec.call(r2, str);

        if (sticky && match && match.index !== pos) {
          match = null;
        }

        if (regex.global) {
          regex.lastIndex = match ? r2.lastIndex : 0;
        }

        return match;
      };

      self.forEach = function (str, regex, callback, context) {
        var pos = 0, i = -1, match;

        while ((match = self.exec(str, regex, pos))) {
          callback.call(context, match, ++i, str, regex);

          pos = match.index + (match[0].length || 1);
        }

        return context;
      };

      self.globalize = function (regex) {
        return copy(regex, { add: 'g', addProto: true });
      };

      self.install = function (options) {
        options = prepareOptions(options);

        if (!features.astral && options.astral) {
          setAstral(true);
        }

        if (!features.natives && options.natives) {
          setNatives(true);
        }
      };

      self.isInstalled = function (feature) {
        return !!(features[feature]);
      };

      self.isRegExp = function (value) {
        return toString.call(value) === '[object RegExp]';
      };

      self.match = function (str, regex, scope) {
        var global = (regex.global && scope !== 'one') || scope === 'all', cacheFlags = (global ? 'g' : '') + (regex.sticky ? 'y' : ''), result, r2;

        regex[REGEX_DATA] = regex[REGEX_DATA] || getBaseProps();

        r2 = regex[REGEX_DATA][cacheFlags || 'noGY'] || (regex[REGEX_DATA][cacheFlags || 'noGY'] = copy(regex, {
          add: cacheFlags,
          remove: scope === 'one' ? 'g' : ''
        }));

        result = nativ.match.call(toObject(str), r2);

        if (regex.global) {
          regex.lastIndex = ((scope === 'one' && result) ? (result.index + result[0].length) : 0);
        }

        return global ? (result || []) : (result && result[0]);
      };

      self.matchChain = function (str, chain) {
        return (function recurseChain(values, level) {
          var item = chain[level].regex ? chain[level] : { regex: chain[level] }, matches = [], addMatch = function (match) {
            if (item.backref) {
              if (!(match.hasOwnProperty(item.backref) || +item.backref < match.length)) {
                throw new ReferenceError('Backreference to undefined group: ' + item.backref);
              }

              matches.push(match[item.backref] || '');
            } else {
              matches.push(match[0]);
            }
          }, i;

          for (i = 0; i < values.length; ++i) {
            self.forEach(values[i], item.regex, addMatch);
          }

          return ((level === chain.length - 1) || !matches.length) ? matches : recurseChain(matches, level + 1);
        }([str], 0));
      };

      self.replace = function (str, search, replacement, scope) {
        var isRegex = self.isRegExp(search), global = (search.global && scope !== 'one') || scope === 'all', cacheFlags = (global ? 'g' : '') + (search.sticky ? 'y' : ''), s2 = search, result;

        if (isRegex) {
          search[REGEX_DATA] = search[REGEX_DATA] || getBaseProps();

          s2 = search[REGEX_DATA][cacheFlags || 'noGY'] || (search[REGEX_DATA][cacheFlags || 'noGY'] = copy(search, {
            add: cacheFlags,
            remove: scope === 'one' ? 'g' : ''
          }));
        } else if (global) {
          s2 = new RegExp(self.escape(String(search)), 'g');
        }

        result = fixed.replace.call(toObject(str), s2, replacement);

        if (isRegex && search.global) {
          search.lastIndex = 0;
        }

        return result;
      };

      self.replaceEach = function (str, replacements) {
        var i, r;

        for (i = 0; i < replacements.length; ++i) {
          r = replacements[i];
          str = self.replace(str, r[0], r[1], r[2]);
        }

        return str;
      };

      self.split = function (str, separator, limit) {
        return fixed.split.call(toObject(str), separator, limit);
      };

      self.test = function (str, regex, pos, sticky) {
        return !!self.exec(str, regex, pos, sticky);
      };

      self.uninstall = function (options) {
        options = prepareOptions(options);

        if (features.astral && options.astral) {
          setAstral(false);
        }

        if (features.natives && options.natives) {
          setNatives(false);
        }
      };

      self.union = function (patterns, flags) {
        var parts = /(\()(?!\?)|\\([1-9]\d*)|\\[\s\S]|\[(?:[^\\\]]|\\[\s\S])*]/g, output = [], numCaptures = 0, numPriorCaptures, captureNames, pattern, rewrite = function (match, paren, backref) {
          var name = captureNames[numCaptures - numPriorCaptures];

          if (paren) {
            ++numCaptures;

            if (name) {
              return '(?<' + name + '>';
            }
          } else if (backref) {
            return '\\' + (+backref + numPriorCaptures);
          }

          return match;
        }, i;

        if (!(isType(patterns, 'Array') && patterns.length)) {
          throw new TypeError('Must provide a nonempty array of patterns to merge');
        }

        for (i = 0; i < patterns.length; ++i) {
          pattern = patterns[i];

          if (self.isRegExp(pattern)) {
            numPriorCaptures = numCaptures;
            captureNames = (pattern[REGEX_DATA] && pattern[REGEX_DATA].captureNames) || [];

            output.push(nativ.replace.call(self(pattern.source).source, parts, rewrite));
          } else {
            output.push(self.escape(pattern));
          }
        }

        return self(output.join('|'), flags);
      };

      fixed.exec = function (str) {
        var origLastIndex = this.lastIndex, match = nativ.exec.apply(this, arguments), name, r2, i;

        if (match) {
          if (!correctExecNpcg && match.length > 1 && indexOf(match, '') > -1) {
            r2 = copy(this, { remove: 'g' });

            nativ.replace.call(String(str).slice(match.index), r2, function () {
              var len = arguments.length, i;

              for (i = 1; i < len - 2; ++i) {
                if (arguments[i] === undefined) {
                  match[i] = undefined;
                }
              }
            });
          }

          if (this[REGEX_DATA] && this[REGEX_DATA].captureNames) {
            for (i = 1; i < match.length; ++i) {
              name = this[REGEX_DATA].captureNames[i - 1];
              if (name) {
                match[name] = match[i];
              }
            }
          }

          if (this.global && !match[0].length && (this.lastIndex > match.index)) {
            this.lastIndex = match.index;
          }
        }

        if (!this.global) {
          this.lastIndex = origLastIndex;
        }

        return match;
      };

      fixed.test = function (str) {
        return !!fixed.exec.call(this, str);
      };

      fixed.match = function (regex) {
        var result;

        if (!self.isRegExp(regex)) {
          regex = new RegExp(regex);
        } else if (regex.global) {
          result = nativ.match.apply(this, arguments);

          regex.lastIndex = 0;

          return result;
        }

        return fixed.exec.call(regex, toObject(this));
      };

      fixed.replace = function (search, replacement) {
        var isRegex = self.isRegExp(search), origLastIndex, captureNames, result;

        if (isRegex) {
          if (search[REGEX_DATA]) {
            captureNames = search[REGEX_DATA].captureNames;
          }

          origLastIndex = search.lastIndex;
        } else {
          search += '';
        }

        if (isType(replacement, 'Function')) {
          result = nativ.replace.call(String(this), search, function () {
            var args = arguments, i;
            if (captureNames) {
              args[0] = new String(args[0]);

              for (i = 0; i < captureNames.length; ++i) {
                if (captureNames[i]) {
                  args[0][captureNames[i]] = args[i + 1];
                }
              }
            }

            if (isRegex && search.global) {
              search.lastIndex = args[args.length - 2] + args[0].length;
            }

            return replacement.apply(undefined, args);
          });
        } else {
          result = nativ.replace.call(this == null ? this : String(this), search, function () {
            var args = arguments;
            return nativ.replace.call(String(replacement), replacementToken, function ($0, $1, $2) {
              var n;

              if ($1) {
                n = +$1;
                if (n <= args.length - 3) {
                  return args[n] || '';
                }

                n = captureNames ? indexOf(captureNames, $1) : -1;
                if (n < 0) {
                  throw new SyntaxError('Backreference to undefined group ' + $0);
                }
                return args[n + 1] || '';
              }

              if ($2 === '$') {
                return '$';
              }
              if ($2 === '&' || +$2 === 0) {
                return args[0];
              }
              if ($2 === '`') {
                return args[args.length - 1].slice(0, args[args.length - 2]);
              }
              if ($2 === "'") {
                return args[args.length - 1].slice(args[args.length - 2] + args[0].length);
              }

              $2 = +$2;

              if (!isNaN($2)) {
                if ($2 > args.length - 3) {
                  throw new SyntaxError('Backreference to undefined group ' + $0);
                }
                return args[$2] || '';
              }
              throw new SyntaxError('Invalid token ' + $0);
            });
          });
        }

        if (isRegex) {
          if (search.global) {
            search.lastIndex = 0;
          } else {
            search.lastIndex = origLastIndex;
          }
        }

        return result;
      };

      fixed.split = function (separator, limit) {
        if (!self.isRegExp(separator)) {
          return nativ.split.apply(this, arguments);
        }

        var str = String(this), output = [], origLastIndex = separator.lastIndex, lastLastIndex = 0, lastLength;

        limit = (limit === undefined ? -1 : limit) >>> 0;

        self.forEach(str, separator, function (match) {
          if ((match.index + match[0].length) > lastLastIndex) {
            output.push(str.slice(lastLastIndex, match.index));
            if (match.length > 1 && match.index < str.length) {
              Array.prototype.push.apply(output, match.slice(1));
            }
            lastLength = match[0].length;
            lastLastIndex = match.index + lastLength;
          }
        });

        if (lastLastIndex === str.length) {
          if (!nativ.test.call(separator, '') || lastLength) {
            output.push('');
          }
        } else {
          output.push(str.slice(lastLastIndex));
        }

        separator.lastIndex = origLastIndex;
        return output.length > limit ? output.slice(0, limit) : output;
      };

      add = self.addToken;

      add(/\\([ABCE-RTUVXYZaeg-mopqyz]|c(?![A-Za-z])|u(?![\dA-Fa-f]{4})|x(?![\dA-Fa-f]{2}))/, function (match, scope) {
        if (match[1] === 'B' && scope === defaultScope) {
          return match[0];
        }
        throw new SyntaxError('Invalid escape ' + match[0]);
      }, { scope: 'all' });

      add(/\[(\^?)]/, function (match) {
        return match[1] ? '[\\s\\S]' : '\\b\\B';
      });

      add(/\(\?#[^)]*\)/, function (match, scope, flags) {
        return isQuantifierNext(match.input, match.index + match[0].length, flags) ? '' : '(?:)';
      });

      add(/\s+|#.*/, function (match, scope, flags) {
        return isQuantifierNext(match.input, match.index + match[0].length, flags) ? '' : '(?:)';
      }, { flag: 'x' });

      add(/\./, function () {
        return '[\\s\\S]';
      }, { flag: 's' });

      add(/\\k<([\w$]+)>/, function (match) {
        var index = isNaN(match[1]) ? (indexOf(this.captureNames, match[1]) + 1) : +match[1], endIndex = match.index + match[0].length;
        if (!index || index > this.captureNames.length) {
          throw new SyntaxError('Backreference to undefined group ' + match[0]);
        }

        return '\\' + index + (endIndex === match.input.length || isNaN(match.input.charAt(endIndex)) ? '' : '(?:)');
      });

      add(/\\(\d+)/, function (match, scope) {
        if (!(scope === defaultScope && /^[1-9]/.test(match[1]) && +match[1] <= this.captureNames.length) && match[1] !== '0') {
          throw new SyntaxError('Cannot use octal escape or backreference to undefined group ' + match[0]);
        }
        return match[0];
      }, { scope: 'all' });

      add(/\(\?P?<([\w$]+)>/, function (match) {
        if (!isNaN(match[1])) {
          throw new SyntaxError('Cannot use integer as capture name ' + match[0]);
        }
        if (match[1] === 'length' || match[1] === '__proto__') {
          throw new SyntaxError('Cannot use reserved word as capture name ' + match[0]);
        }
        if (indexOf(this.captureNames, match[1]) > -1) {
          throw new SyntaxError('Cannot use same name for multiple groups ' + match[0]);
        }
        this.captureNames.push(match[1]);
        this.hasNamedCapture = true;
        return '(';
      });

      add(/\((?!\?)/, function (match, scope, flags) {
        if (flags.indexOf('n') > -1) {
          return '(?:';
        }
        this.captureNames.push(null);
        return '(';
      }, { optionalFlags: 'n' });

      return self;
    }());
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

Shumway.AVM2.XRegExp.install({ natives: true });
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var checkArguments = true;

      var assertNotImplemented = Shumway.Debug.assertNotImplemented;
      var notImplemented = Shumway.Debug.notImplemented;

      var throwError = Shumway.AVM2.Runtime.throwError;

      var clamp = Shumway.NumberUtilities.clamp;
      var asCheckVectorGetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorGetNumericProperty;
      var asCheckVectorSetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorSetNumericProperty;

      var Int32Vector = (function () {
        function Int32Vector(length, fixed) {
          if (typeof length === "undefined") { length = 0; }
          if (typeof fixed === "undefined") { fixed = false; }
          length = length >>> 0;
          fixed = !!fixed;
          this._fixed = fixed;
          this._buffer = new Int32Array(Math.max(Int32Vector.INITIAL_CAPACITY, length + Int32Vector.EXTRA_CAPACITY));
          this._offset = 0;
          this._length = length;
        }
        Int32Vector.defaultCompareFunction = function (a, b) {
          return String(a).localeCompare(String(b));
        };

        Int32Vector.compare = function (a, b, options, compareFunction) {
          release || assertNotImplemented(!(options & Int32Vector.CASEINSENSITIVE), "CASEINSENSITIVE");
          release || assertNotImplemented(!(options & Int32Vector.UNIQUESORT), "UNIQUESORT");
          release || assertNotImplemented(!(options & Int32Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
          var result = 0;
          if (!compareFunction) {
            compareFunction = Int32Vector.defaultCompareFunction;
          }
          if (options & Int32Vector.NUMERIC) {
            a = Shumway.toNumber(a);
            b = Shumway.toNumber(b);
            result = a < b ? -1 : (a > b ? 1 : 0);
          } else {
            result = compareFunction(a, b);
          }
          if (options & Int32Vector.DESCENDING) {
            result *= -1;
          }
          return result;
        };

        Int32Vector.callable = function (object) {
          if (object instanceof Int32Vector) {
            return object;
          }
          var length = object.asGetProperty(undefined, "length");
          if (length !== undefined) {
            var v = new Int32Vector(length, false);
            for (var i = 0; i < length; i++) {
              v.asSetNumericProperty(i, object.asGetPublicProperty(i));
            }
            return v;
          }
          Shumway.Debug.unexpected();
        };

        Int32Vector.prototype.internalToString = function () {
          var str = "";
          var start = this._offset;
          var end = start + this._length;
          for (var i = 0; i < this._buffer.length; i++) {
            if (i === start) {
              str += "[";
            }
            if (i === end) {
              str += "]";
            }
            str += this._buffer[i];
            if (i < this._buffer.length - 1) {
              str += ",";
            }
          }
          if (this._offset + this._length === this._buffer.length) {
            str += "]";
          }
          return str + ": offset: " + this._offset + ", length: " + this._length + ", capacity: " + this._buffer.length;
        };

        Int32Vector.prototype.toString = function () {
          var str = "";
          for (var i = 0; i < this._length; i++) {
            str += this._buffer[this._offset + i];
            if (i < this._length - 1) {
              str += ",";
            }
          }
          return str;
        };

        Int32Vector.prototype._view = function () {
          return this._buffer.subarray(this._offset, this._offset + this._length);
        };

        Int32Vector.prototype._ensureCapacity = function (length) {
          var minCapacity = this._offset + length;
          if (minCapacity < this._buffer.length) {
            return;
          }
          if (length <= this._buffer.length) {
            var offset = (this._buffer.length - length) >> 2;
            this._buffer.set(this._view(), offset);
            this._offset = offset;
            return;
          }

          var oldCapacity = this._buffer.length;
          var newCapacity = ((oldCapacity * 3) >> 1) + 1;
          if (newCapacity < minCapacity) {
            newCapacity = minCapacity;
          }
          var buffer = new Int32Array(newCapacity);
          buffer.set(this._buffer, 0);
          this._buffer = buffer;
        };

        Int32Vector.prototype.concat = function () {
          notImplemented("Int32Vector.concat");
        };

        Int32Vector.prototype.every = function (callback, thisObject) {
          for (var i = 0; i < this._length; i++) {
            if (!callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              return false;
            }
          }
          return true;
        };

        Int32Vector.prototype.filter = function (callback, thisObject) {
          var v = new Int32Vector();
          for (var i = 0; i < this._length; i++) {
            if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              v.push(this.asGetNumericProperty(i));
            }
          }
          return v;
        };

        Int32Vector.prototype.some = function (callback, thisObject) {
          if (arguments.length !== 2) {
            throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError);
          } else if (!Shumway.isFunction(callback)) {
            throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError);
          }
          for (var i = 0; i < this._length; i++) {
            if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              return true;
            }
          }
          return false;
        };

        Int32Vector.prototype.forEach = function (callback, thisObject) {
          for (var i = 0; i < this._length; i++) {
            callback.call(thisObject, this.asGetNumericProperty(i), i, this);
          }
        };

        Int32Vector.prototype.join = function (sep) {
          notImplemented("Int32Vector.join");
        };

        Int32Vector.prototype.indexOf = function (searchElement, fromIndex) {
          notImplemented("Int32Vector.indexOf");
        };

        Int32Vector.prototype.lastIndexOf = function (searchElement, fromIndex) {
          notImplemented("Int32Vector.lastIndexOf");
        };

        Int32Vector.prototype.map = function (callback, thisObject) {
          if (!Shumway.isFunction(callback)) {
            throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError);
          }
          var v = new Int32Vector();
          for (var i = 0; i < this._length; i++) {
            v.push(callback.call(thisObject, this.asGetNumericProperty(i), i, this));
          }
          return v;
        };

        Int32Vector.prototype.push = function () {
          var rest = [];
          for (var _i = 0; _i < (arguments.length - 0); _i++) {
            rest[_i] = arguments[_i + 0];
          }
          this._checkFixed();
          this._ensureCapacity(this._length + arguments.length);
          for (var i = 0; i < arguments.length; i++) {
            this._buffer[this._offset + this._length++] = arguments[i];
          }
        };

        Int32Vector.prototype.pop = function () {
          this._checkFixed();
          if (this._length === 0) {
            return Int32Vector.DEFAULT_VALUE;
          }
          this._length--;
          return this._buffer[this._offset + this._length];
        };

        Int32Vector.prototype.reverse = function () {
          var l = this._offset;
          var r = this._offset + this._length - 1;
          var b = this._buffer;
          while (l < r) {
            var t = b[l];
            b[l] = b[r];
            b[r] = t;
            l++;
            r--;
          }
        };

        Int32Vector._sort = function (a) {
          var stack = [];
          var sp = -1;
          var l = 0;
          var r = a.length - 1;
          var i, j, swap, temp;
          while (true) {
            if (r - l <= 100) {
              for (j = l + 1; j <= r; j++) {
                swap = a[j];
                i = j - 1;
                while (i >= l && a[i] > swap) {
                  a[i + 1] = a[i--];
                }
                a[i + 1] = swap;
              }
              if (sp == -1) {
                break;
              }
              r = stack[sp--];
              l = stack[sp--];
            } else {
              var median = l + r >> 1;
              i = l + 1;
              j = r;
              swap = a[median];
              a[median] = a[i];
              a[i] = swap;
              if (a[l] > a[r]) {
                swap = a[l];
                a[l] = a[r];
                a[r] = swap;
              }
              if (a[i] > a[r]) {
                swap = a[i];
                a[i] = a[r];
                a[r] = swap;
              }
              if (a[l] > a[i]) {
                swap = a[l];
                a[l] = a[i];
                a[i] = swap;
              }
              temp = a[i];
              while (true) {
                do {
                  i++;
                } while(a[i] < temp);
                do {
                  j--;
                } while(a[j] > temp);
                if (j < i) {
                  break;
                }
                swap = a[i];
                a[i] = a[j];
                a[j] = swap;
              }
              a[l + 1] = a[j];
              a[j] = temp;
              if (r - i + 1 >= j - l) {
                stack[++sp] = i;
                stack[++sp] = r;
                r = j - 1;
              } else {
                stack[++sp] = l;
                stack[++sp] = j - 1;
                l = i;
              }
            }
          }
          return a;
        };

        Int32Vector.prototype._sortNumeric = function (descending) {
          Int32Vector._sort(this._view());
          if (descending) {
            this.reverse();
          }
        };

        Int32Vector.prototype.sort = function () {
          if (arguments.length === 0) {
            return Array.prototype.sort.call(this._view());
          }
          var compareFunction, options = 0;
          if (arguments[0] instanceof Function) {
            compareFunction = arguments[0];
          } else if (Shumway.isNumber(arguments[0])) {
            options = arguments[0];
          }
          if (Shumway.isNumber(arguments[1])) {
            options = arguments[1];
          }
          if (options & Int32Vector.NUMERIC) {
            return this._sortNumeric(options & Int32Vector.DESCENDING);
          }
          Array.prototype.sort.call(this._view(), function (a, b) {
            return Int32Vector.compare(a, b, options, compareFunction);
          });
        };

        Int32Vector.prototype.asGetNumericProperty = function (i) {
          checkArguments && asCheckVectorGetNumericProperty(i, this._length);
          return this._buffer[this._offset + i];
        };

        Int32Vector.prototype.asSetNumericProperty = function (i, v) {
          checkArguments && asCheckVectorSetNumericProperty(i, this._length, this._fixed);
          if (i === this._length) {
            this._ensureCapacity(this._length + 1);
            this._length++;
          }
          this._buffer[this._offset + i] = v;
        };

        Int32Vector.prototype.shift = function () {
          this._checkFixed();
          if (this._length === 0) {
            return 0;
          }
          this._length--;
          return this._buffer[this._offset++];
        };

        Int32Vector.prototype._checkFixed = function () {
          if (this._fixed) {
            throwError("RangeError", AVM2.Errors.VectorFixedError);
          }
        };

        Int32Vector.prototype._slide = function (distance) {
          this._buffer.set(this._view(), this._offset + distance);
          this._offset += distance;
        };

        Int32Vector.prototype.unshift = function () {
          this._checkFixed();
          if (!arguments.length) {
            return;
          }
          this._ensureCapacity(this._length + arguments.length);
          this._slide(arguments.length);
          this._offset -= arguments.length;
          this._length += arguments.length;
          for (var i = 0; i < arguments.length; i++) {
            this._buffer[this._offset + i] = arguments[i];
          }
        };

        Int32Vector.prototype.asHasProperty = function (namespaces, name, flags) {
          if (Int32Vector.prototype === this || !Shumway.isNumeric(name)) {
            return Object.prototype.asHasProperty.call(this, namespaces, name, flags);
          }
          var index = Shumway.toNumber(name);
          return index >= 0 && index < this._length;
        };

        Object.defineProperty(Int32Vector.prototype, "length", {
          get: function () {
            return this._length;
          },
          set: function (value) {
            value = value >>> 0;
            if (value > this._length) {
              this._ensureCapacity(value);
              for (var i = this._offset + this._length, j = this._offset + value; i < j; i++) {
                this._buffer[i] = Int32Vector.DEFAULT_VALUE;
              }
            }
            this._length = value;
          },
          enumerable: true,
          configurable: true
        });



        Object.defineProperty(Int32Vector.prototype, "fixed", {
          get: function () {
            return this._fixed;
          },
          set: function (f) {
            this._fixed = !!f;
          },
          enumerable: true,
          configurable: true
        });

        Int32Vector.prototype._spliceHelper = function (index, insertCount, deleteCount, args, offset) {
          insertCount = clamp(insertCount, 0, args.length - offset);
          deleteCount = clamp(deleteCount, 0, this._length - index);
          this._ensureCapacity(this._length - deleteCount + insertCount);
          var right = this._offset + index + deleteCount;
          var slice = this._buffer.subarray(right, right + this._length - index - deleteCount);
          this._buffer.set(slice, this._offset + index + insertCount);
          this._length += insertCount - deleteCount;
          for (var i = 0; i < insertCount; i++) {
            this._buffer[this._offset + index + i] = args.asGetNumericProperty(offset + i);
          }
        };

        Int32Vector.prototype.asNextName = function (index) {
          return index - 1;
        };

        Int32Vector.prototype.asNextValue = function (index) {
          return this._buffer[this._offset + index - 1];
        };

        Int32Vector.prototype.asNextNameIndex = function (index) {
          var nextNameIndex = index + 1;
          if (nextNameIndex <= this._length) {
            return nextNameIndex;
          }
          return 0;
        };

        Int32Vector.prototype.asHasNext2 = function (hasNext2Info) {
          hasNext2Info.index = this.asNextNameIndex(hasNext2Info.index);
        };
        Int32Vector.EXTRA_CAPACITY = 4;
        Int32Vector.INITIAL_CAPACITY = 10;
        Int32Vector.DEFAULT_VALUE = 0;

        Int32Vector.CASEINSENSITIVE = 1;
        Int32Vector.DESCENDING = 2;
        Int32Vector.UNIQUESORT = 4;
        Int32Vector.RETURNINDEXEDARRAY = 8;
        Int32Vector.NUMERIC = 16;
        return Int32Vector;
      })();
      AS.Int32Vector = Int32Vector;

      Int32Vector.prototype._reverse = Int32Vector.prototype.reverse;
      Int32Vector.prototype._filter = Int32Vector.prototype.filter;
      Int32Vector.prototype._map = Int32Vector.prototype.map;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var checkArguments = true;

      var assertNotImplemented = Shumway.Debug.assertNotImplemented;
      var notImplemented = Shumway.Debug.notImplemented;

      var throwError = Shumway.AVM2.Runtime.throwError;

      var clamp = Shumway.NumberUtilities.clamp;
      var asCheckVectorGetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorGetNumericProperty;
      var asCheckVectorSetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorSetNumericProperty;

      var Uint32Vector = (function () {
        function Uint32Vector(length, fixed) {
          if (typeof length === "undefined") { length = 0; }
          if (typeof fixed === "undefined") { fixed = false; }
          length = length >>> 0;
          fixed = !!fixed;
          this._fixed = fixed;
          this._buffer = new Uint32Array(Math.max(Uint32Vector.INITIAL_CAPACITY, length + Uint32Vector.EXTRA_CAPACITY));
          this._offset = 0;
          this._length = length;
        }
        Uint32Vector.defaultCompareFunction = function (a, b) {
          return String(a).localeCompare(String(b));
        };

        Uint32Vector.compare = function (a, b, options, compareFunction) {
          release || assertNotImplemented(!(options & Uint32Vector.CASEINSENSITIVE), "CASEINSENSITIVE");
          release || assertNotImplemented(!(options & Uint32Vector.UNIQUESORT), "UNIQUESORT");
          release || assertNotImplemented(!(options & Uint32Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
          var result = 0;
          if (!compareFunction) {
            compareFunction = Uint32Vector.defaultCompareFunction;
          }
          if (options & Uint32Vector.NUMERIC) {
            a = Shumway.toNumber(a);
            b = Shumway.toNumber(b);
            result = a < b ? -1 : (a > b ? 1 : 0);
          } else {
            result = compareFunction(a, b);
          }
          if (options & Uint32Vector.DESCENDING) {
            result *= -1;
          }
          return result;
        };

        Uint32Vector.callable = function (object) {
          if (object instanceof Uint32Vector) {
            return object;
          }
          var length = object.asGetProperty(undefined, "length");
          if (length !== undefined) {
            var v = new Uint32Vector(length, false);
            for (var i = 0; i < length; i++) {
              v.asSetNumericProperty(i, object.asGetPublicProperty(i));
            }
            return v;
          }
          Shumway.Debug.unexpected();
        };

        Uint32Vector.prototype.internalToString = function () {
          var str = "";
          var start = this._offset;
          var end = start + this._length;
          for (var i = 0; i < this._buffer.length; i++) {
            if (i === start) {
              str += "[";
            }
            if (i === end) {
              str += "]";
            }
            str += this._buffer[i];
            if (i < this._buffer.length - 1) {
              str += ",";
            }
          }
          if (this._offset + this._length === this._buffer.length) {
            str += "]";
          }
          return str + ": offset: " + this._offset + ", length: " + this._length + ", capacity: " + this._buffer.length;
        };

        Uint32Vector.prototype.toString = function () {
          var str = "";
          for (var i = 0; i < this._length; i++) {
            str += this._buffer[this._offset + i];
            if (i < this._length - 1) {
              str += ",";
            }
          }
          return str;
        };

        Uint32Vector.prototype._view = function () {
          return this._buffer.subarray(this._offset, this._offset + this._length);
        };

        Uint32Vector.prototype._ensureCapacity = function (length) {
          var minCapacity = this._offset + length;
          if (minCapacity < this._buffer.length) {
            return;
          }
          if (length <= this._buffer.length) {
            var offset = (this._buffer.length - length) >> 2;
            this._buffer.set(this._view(), offset);
            this._offset = offset;
            return;
          }

          var oldCapacity = this._buffer.length;
          var newCapacity = ((oldCapacity * 3) >> 1) + 1;
          if (newCapacity < minCapacity) {
            newCapacity = minCapacity;
          }
          var buffer = new Uint32Array(newCapacity);
          buffer.set(this._buffer, 0);
          this._buffer = buffer;
        };

        Uint32Vector.prototype.concat = function () {
          notImplemented("Uint32Vector.concat");
        };

        Uint32Vector.prototype.every = function (callback, thisObject) {
          for (var i = 0; i < this._length; i++) {
            if (!callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              return false;
            }
          }
          return true;
        };

        Uint32Vector.prototype.filter = function (callback, thisObject) {
          var v = new Uint32Vector();
          for (var i = 0; i < this._length; i++) {
            if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              v.push(this.asGetNumericProperty(i));
            }
          }
          return v;
        };

        Uint32Vector.prototype.some = function (callback, thisObject) {
          if (arguments.length !== 2) {
            throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError);
          } else if (!Shumway.isFunction(callback)) {
            throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError);
          }
          for (var i = 0; i < this._length; i++) {
            if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              return true;
            }
          }
          return false;
        };

        Uint32Vector.prototype.forEach = function (callback, thisObject) {
          for (var i = 0; i < this._length; i++) {
            callback.call(thisObject, this.asGetNumericProperty(i), i, this);
          }
        };

        Uint32Vector.prototype.join = function (sep) {
          notImplemented("Uint32Vector.join");
        };

        Uint32Vector.prototype.indexOf = function (searchElement, fromIndex) {
          notImplemented("Uint32Vector.indexOf");
        };

        Uint32Vector.prototype.lastIndexOf = function (searchElement, fromIndex) {
          notImplemented("Uint32Vector.lastIndexOf");
        };

        Uint32Vector.prototype.map = function (callback, thisObject) {
          if (!Shumway.isFunction(callback)) {
            throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError);
          }
          var v = new Uint32Vector();
          for (var i = 0; i < this._length; i++) {
            v.push(callback.call(thisObject, this.asGetNumericProperty(i), i, this));
          }
          return v;
        };

        Uint32Vector.prototype.push = function () {
          var rest = [];
          for (var _i = 0; _i < (arguments.length - 0); _i++) {
            rest[_i] = arguments[_i + 0];
          }
          this._checkFixed();
          this._ensureCapacity(this._length + arguments.length);
          for (var i = 0; i < arguments.length; i++) {
            this._buffer[this._offset + this._length++] = arguments[i];
          }
        };

        Uint32Vector.prototype.pop = function () {
          this._checkFixed();
          if (this._length === 0) {
            return Uint32Vector.DEFAULT_VALUE;
          }
          this._length--;
          return this._buffer[this._offset + this._length];
        };

        Uint32Vector.prototype.reverse = function () {
          var l = this._offset;
          var r = this._offset + this._length - 1;
          var b = this._buffer;
          while (l < r) {
            var t = b[l];
            b[l] = b[r];
            b[r] = t;
            l++;
            r--;
          }
        };

        Uint32Vector._sort = function (a) {
          var stack = [];
          var sp = -1;
          var l = 0;
          var r = a.length - 1;
          var i, j, swap, temp;
          while (true) {
            if (r - l <= 100) {
              for (j = l + 1; j <= r; j++) {
                swap = a[j];
                i = j - 1;
                while (i >= l && a[i] > swap) {
                  a[i + 1] = a[i--];
                }
                a[i + 1] = swap;
              }
              if (sp == -1) {
                break;
              }
              r = stack[sp--];
              l = stack[sp--];
            } else {
              var median = l + r >> 1;
              i = l + 1;
              j = r;
              swap = a[median];
              a[median] = a[i];
              a[i] = swap;
              if (a[l] > a[r]) {
                swap = a[l];
                a[l] = a[r];
                a[r] = swap;
              }
              if (a[i] > a[r]) {
                swap = a[i];
                a[i] = a[r];
                a[r] = swap;
              }
              if (a[l] > a[i]) {
                swap = a[l];
                a[l] = a[i];
                a[i] = swap;
              }
              temp = a[i];
              while (true) {
                do {
                  i++;
                } while(a[i] < temp);
                do {
                  j--;
                } while(a[j] > temp);
                if (j < i) {
                  break;
                }
                swap = a[i];
                a[i] = a[j];
                a[j] = swap;
              }
              a[l + 1] = a[j];
              a[j] = temp;
              if (r - i + 1 >= j - l) {
                stack[++sp] = i;
                stack[++sp] = r;
                r = j - 1;
              } else {
                stack[++sp] = l;
                stack[++sp] = j - 1;
                l = i;
              }
            }
          }
          return a;
        };

        Uint32Vector.prototype._sortNumeric = function (descending) {
          Uint32Vector._sort(this._view());
          if (descending) {
            this.reverse();
          }
        };

        Uint32Vector.prototype.sort = function () {
          if (arguments.length === 0) {
            return Array.prototype.sort.call(this._view());
          }
          var compareFunction, options = 0;
          if (arguments[0] instanceof Function) {
            compareFunction = arguments[0];
          } else if (Shumway.isNumber(arguments[0])) {
            options = arguments[0];
          }
          if (Shumway.isNumber(arguments[1])) {
            options = arguments[1];
          }
          if (options & Uint32Vector.NUMERIC) {
            return this._sortNumeric(options & Uint32Vector.DESCENDING);
          }
          Array.prototype.sort.call(this._view(), function (a, b) {
            return Uint32Vector.compare(a, b, options, compareFunction);
          });
        };

        Uint32Vector.prototype.asGetNumericProperty = function (i) {
          checkArguments && asCheckVectorGetNumericProperty(i, this._length);
          return this._buffer[this._offset + i];
        };

        Uint32Vector.prototype.asSetNumericProperty = function (i, v) {
          checkArguments && asCheckVectorSetNumericProperty(i, this._length, this._fixed);
          if (i === this._length) {
            this._ensureCapacity(this._length + 1);
            this._length++;
          }
          this._buffer[this._offset + i] = v;
        };

        Uint32Vector.prototype.shift = function () {
          this._checkFixed();
          if (this._length === 0) {
            return 0;
          }
          this._length--;
          return this._buffer[this._offset++];
        };

        Uint32Vector.prototype._checkFixed = function () {
          if (this._fixed) {
            throwError("RangeError", AVM2.Errors.VectorFixedError);
          }
        };

        Uint32Vector.prototype._slide = function (distance) {
          this._buffer.set(this._view(), this._offset + distance);
          this._offset += distance;
        };

        Uint32Vector.prototype.unshift = function () {
          this._checkFixed();
          if (!arguments.length) {
            return;
          }
          this._ensureCapacity(this._length + arguments.length);
          this._slide(arguments.length);
          this._offset -= arguments.length;
          this._length += arguments.length;
          for (var i = 0; i < arguments.length; i++) {
            this._buffer[this._offset + i] = arguments[i];
          }
        };

        Uint32Vector.prototype.asHasProperty = function (namespaces, name, flags) {
          if (Uint32Vector.prototype === this || !Shumway.isNumeric(name)) {
            return Object.prototype.asHasProperty.call(this, namespaces, name, flags);
          }
          var index = Shumway.toNumber(name);
          return index >= 0 && index < this._length;
        };

        Object.defineProperty(Uint32Vector.prototype, "length", {
          get: function () {
            return this._length;
          },
          set: function (value) {
            value = value >>> 0;
            if (value > this._length) {
              this._ensureCapacity(value);
              for (var i = this._offset + this._length, j = this._offset + value; i < j; i++) {
                this._buffer[i] = Uint32Vector.DEFAULT_VALUE;
              }
            }
            this._length = value;
          },
          enumerable: true,
          configurable: true
        });



        Object.defineProperty(Uint32Vector.prototype, "fixed", {
          get: function () {
            return this._fixed;
          },
          set: function (f) {
            this._fixed = !!f;
          },
          enumerable: true,
          configurable: true
        });

        Uint32Vector.prototype._spliceHelper = function (index, insertCount, deleteCount, args, offset) {
          insertCount = clamp(insertCount, 0, args.length - offset);
          deleteCount = clamp(deleteCount, 0, this._length - index);
          this._ensureCapacity(this._length - deleteCount + insertCount);
          var right = this._offset + index + deleteCount;
          var slice = this._buffer.subarray(right, right + this._length - index - deleteCount);
          this._buffer.set(slice, this._offset + index + insertCount);
          this._length += insertCount - deleteCount;
          for (var i = 0; i < insertCount; i++) {
            this._buffer[this._offset + index + i] = args.asGetNumericProperty(offset + i);
          }
        };

        Uint32Vector.prototype.asNextName = function (index) {
          return index - 1;
        };

        Uint32Vector.prototype.asNextValue = function (index) {
          return this._buffer[this._offset + index - 1];
        };

        Uint32Vector.prototype.asNextNameIndex = function (index) {
          var nextNameIndex = index + 1;
          if (nextNameIndex <= this._length) {
            return nextNameIndex;
          }
          return 0;
        };

        Uint32Vector.prototype.asHasNext2 = function (hasNext2Info) {
          hasNext2Info.index = this.asNextNameIndex(hasNext2Info.index);
        };
        Uint32Vector.EXTRA_CAPACITY = 4;
        Uint32Vector.INITIAL_CAPACITY = 10;
        Uint32Vector.DEFAULT_VALUE = 0;

        Uint32Vector.CASEINSENSITIVE = 1;
        Uint32Vector.DESCENDING = 2;
        Uint32Vector.UNIQUESORT = 4;
        Uint32Vector.RETURNINDEXEDARRAY = 8;
        Uint32Vector.NUMERIC = 16;
        return Uint32Vector;
      })();
      AS.Uint32Vector = Uint32Vector;

      Uint32Vector.prototype._reverse = Uint32Vector.prototype.reverse;
      Uint32Vector.prototype._filter = Uint32Vector.prototype.filter;
      Uint32Vector.prototype._map = Uint32Vector.prototype.map;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var checkArguments = true;

      var assertNotImplemented = Shumway.Debug.assertNotImplemented;
      var notImplemented = Shumway.Debug.notImplemented;

      var throwError = Shumway.AVM2.Runtime.throwError;

      var clamp = Shumway.NumberUtilities.clamp;
      var asCheckVectorGetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorGetNumericProperty;
      var asCheckVectorSetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorSetNumericProperty;

      var Float64Vector = (function () {
        function Float64Vector(length, fixed) {
          if (typeof length === "undefined") { length = 0; }
          if (typeof fixed === "undefined") { fixed = false; }
          length = length >>> 0;
          fixed = !!fixed;
          this._fixed = fixed;
          this._buffer = new Float64Array(Math.max(Float64Vector.INITIAL_CAPACITY, length + Float64Vector.EXTRA_CAPACITY));
          this._offset = 0;
          this._length = length;
        }
        Float64Vector.defaultCompareFunction = function (a, b) {
          return String(a).localeCompare(String(b));
        };

        Float64Vector.compare = function (a, b, options, compareFunction) {
          release || assertNotImplemented(!(options & Float64Vector.CASEINSENSITIVE), "CASEINSENSITIVE");
          release || assertNotImplemented(!(options & Float64Vector.UNIQUESORT), "UNIQUESORT");
          release || assertNotImplemented(!(options & Float64Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
          var result = 0;
          if (!compareFunction) {
            compareFunction = Float64Vector.defaultCompareFunction;
          }
          if (options & Float64Vector.NUMERIC) {
            a = Shumway.toNumber(a);
            b = Shumway.toNumber(b);
            result = a < b ? -1 : (a > b ? 1 : 0);
          } else {
            result = compareFunction(a, b);
          }
          if (options & Float64Vector.DESCENDING) {
            result *= -1;
          }
          return result;
        };

        Float64Vector.callable = function (object) {
          if (object instanceof Float64Vector) {
            return object;
          }
          var length = object.asGetProperty(undefined, "length");
          if (length !== undefined) {
            var v = new Float64Vector(length, false);
            for (var i = 0; i < length; i++) {
              v.asSetNumericProperty(i, object.asGetPublicProperty(i));
            }
            return v;
          }
          Shumway.Debug.unexpected();
        };

        Float64Vector.prototype.internalToString = function () {
          var str = "";
          var start = this._offset;
          var end = start + this._length;
          for (var i = 0; i < this._buffer.length; i++) {
            if (i === start) {
              str += "[";
            }
            if (i === end) {
              str += "]";
            }
            str += this._buffer[i];
            if (i < this._buffer.length - 1) {
              str += ",";
            }
          }
          if (this._offset + this._length === this._buffer.length) {
            str += "]";
          }
          return str + ": offset: " + this._offset + ", length: " + this._length + ", capacity: " + this._buffer.length;
        };

        Float64Vector.prototype.toString = function () {
          var str = "";
          for (var i = 0; i < this._length; i++) {
            str += this._buffer[this._offset + i];
            if (i < this._length - 1) {
              str += ",";
            }
          }
          return str;
        };

        Float64Vector.prototype._view = function () {
          return this._buffer.subarray(this._offset, this._offset + this._length);
        };

        Float64Vector.prototype._ensureCapacity = function (length) {
          var minCapacity = this._offset + length;
          if (minCapacity < this._buffer.length) {
            return;
          }
          if (length <= this._buffer.length) {
            var offset = (this._buffer.length - length) >> 2;
            this._buffer.set(this._view(), offset);
            this._offset = offset;
            return;
          }

          var oldCapacity = this._buffer.length;
          var newCapacity = ((oldCapacity * 3) >> 1) + 1;
          if (newCapacity < minCapacity) {
            newCapacity = minCapacity;
          }
          var buffer = new Float64Array(newCapacity);
          buffer.set(this._buffer, 0);
          this._buffer = buffer;
        };

        Float64Vector.prototype.concat = function () {
          notImplemented("Float64Vector.concat");
        };

        Float64Vector.prototype.every = function (callback, thisObject) {
          for (var i = 0; i < this._length; i++) {
            if (!callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              return false;
            }
          }
          return true;
        };

        Float64Vector.prototype.filter = function (callback, thisObject) {
          var v = new Float64Vector();
          for (var i = 0; i < this._length; i++) {
            if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              v.push(this.asGetNumericProperty(i));
            }
          }
          return v;
        };

        Float64Vector.prototype.some = function (callback, thisObject) {
          if (arguments.length !== 2) {
            throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError);
          } else if (!Shumway.isFunction(callback)) {
            throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError);
          }
          for (var i = 0; i < this._length; i++) {
            if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              return true;
            }
          }
          return false;
        };

        Float64Vector.prototype.forEach = function (callback, thisObject) {
          for (var i = 0; i < this._length; i++) {
            callback.call(thisObject, this.asGetNumericProperty(i), i, this);
          }
        };

        Float64Vector.prototype.join = function (sep) {
          notImplemented("Float64Vector.join");
        };

        Float64Vector.prototype.indexOf = function (searchElement, fromIndex) {
          notImplemented("Float64Vector.indexOf");
        };

        Float64Vector.prototype.lastIndexOf = function (searchElement, fromIndex) {
          notImplemented("Float64Vector.lastIndexOf");
        };

        Float64Vector.prototype.map = function (callback, thisObject) {
          if (!Shumway.isFunction(callback)) {
            throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError);
          }
          var v = new Float64Vector();
          for (var i = 0; i < this._length; i++) {
            v.push(callback.call(thisObject, this.asGetNumericProperty(i), i, this));
          }
          return v;
        };

        Float64Vector.prototype.push = function () {
          var rest = [];
          for (var _i = 0; _i < (arguments.length - 0); _i++) {
            rest[_i] = arguments[_i + 0];
          }
          this._checkFixed();
          this._ensureCapacity(this._length + arguments.length);
          for (var i = 0; i < arguments.length; i++) {
            this._buffer[this._offset + this._length++] = arguments[i];
          }
        };

        Float64Vector.prototype.pop = function () {
          this._checkFixed();
          if (this._length === 0) {
            return Float64Vector.DEFAULT_VALUE;
          }
          this._length--;
          return this._buffer[this._offset + this._length];
        };

        Float64Vector.prototype.reverse = function () {
          var l = this._offset;
          var r = this._offset + this._length - 1;
          var b = this._buffer;
          while (l < r) {
            var t = b[l];
            b[l] = b[r];
            b[r] = t;
            l++;
            r--;
          }
        };

        Float64Vector._sort = function (a) {
          var stack = [];
          var sp = -1;
          var l = 0;
          var r = a.length - 1;
          var i, j, swap, temp;
          while (true) {
            if (r - l <= 100) {
              for (j = l + 1; j <= r; j++) {
                swap = a[j];
                i = j - 1;
                while (i >= l && a[i] > swap) {
                  a[i + 1] = a[i--];
                }
                a[i + 1] = swap;
              }
              if (sp == -1) {
                break;
              }
              r = stack[sp--];
              l = stack[sp--];
            } else {
              var median = l + r >> 1;
              i = l + 1;
              j = r;
              swap = a[median];
              a[median] = a[i];
              a[i] = swap;
              if (a[l] > a[r]) {
                swap = a[l];
                a[l] = a[r];
                a[r] = swap;
              }
              if (a[i] > a[r]) {
                swap = a[i];
                a[i] = a[r];
                a[r] = swap;
              }
              if (a[l] > a[i]) {
                swap = a[l];
                a[l] = a[i];
                a[i] = swap;
              }
              temp = a[i];
              while (true) {
                do {
                  i++;
                } while(a[i] < temp);
                do {
                  j--;
                } while(a[j] > temp);
                if (j < i) {
                  break;
                }
                swap = a[i];
                a[i] = a[j];
                a[j] = swap;
              }
              a[l + 1] = a[j];
              a[j] = temp;
              if (r - i + 1 >= j - l) {
                stack[++sp] = i;
                stack[++sp] = r;
                r = j - 1;
              } else {
                stack[++sp] = l;
                stack[++sp] = j - 1;
                l = i;
              }
            }
          }
          return a;
        };

        Float64Vector.prototype._sortNumeric = function (descending) {
          Float64Vector._sort(this._view());
          if (descending) {
            this.reverse();
          }
        };

        Float64Vector.prototype.sort = function () {
          if (arguments.length === 0) {
            return Array.prototype.sort.call(this._view());
          }
          var compareFunction, options = 0;
          if (arguments[0] instanceof Function) {
            compareFunction = arguments[0];
          } else if (Shumway.isNumber(arguments[0])) {
            options = arguments[0];
          }
          if (Shumway.isNumber(arguments[1])) {
            options = arguments[1];
          }
          if (options & Float64Vector.NUMERIC) {
            return this._sortNumeric(options & Float64Vector.DESCENDING);
          }
          Array.prototype.sort.call(this._view(), function (a, b) {
            return Float64Vector.compare(a, b, options, compareFunction);
          });
        };

        Float64Vector.prototype.asGetNumericProperty = function (i) {
          checkArguments && asCheckVectorGetNumericProperty(i, this._length);
          return this._buffer[this._offset + i];
        };

        Float64Vector.prototype.asSetNumericProperty = function (i, v) {
          checkArguments && asCheckVectorSetNumericProperty(i, this._length, this._fixed);
          if (i === this._length) {
            this._ensureCapacity(this._length + 1);
            this._length++;
          }
          this._buffer[this._offset + i] = v;
        };

        Float64Vector.prototype.shift = function () {
          this._checkFixed();
          if (this._length === 0) {
            return 0;
          }
          this._length--;
          return this._buffer[this._offset++];
        };

        Float64Vector.prototype._checkFixed = function () {
          if (this._fixed) {
            throwError("RangeError", AVM2.Errors.VectorFixedError);
          }
        };

        Float64Vector.prototype._slide = function (distance) {
          this._buffer.set(this._view(), this._offset + distance);
          this._offset += distance;
        };

        Float64Vector.prototype.unshift = function () {
          this._checkFixed();
          if (!arguments.length) {
            return;
          }
          this._ensureCapacity(this._length + arguments.length);
          this._slide(arguments.length);
          this._offset -= arguments.length;
          this._length += arguments.length;
          for (var i = 0; i < arguments.length; i++) {
            this._buffer[this._offset + i] = arguments[i];
          }
        };

        Float64Vector.prototype.asHasProperty = function (namespaces, name, flags) {
          if (Float64Vector.prototype === this || !Shumway.isNumeric(name)) {
            return Object.prototype.asHasProperty.call(this, namespaces, name, flags);
          }
          var index = Shumway.toNumber(name);
          return index >= 0 && index < this._length;
        };

        Object.defineProperty(Float64Vector.prototype, "length", {
          get: function () {
            return this._length;
          },
          set: function (value) {
            value = value >>> 0;
            if (value > this._length) {
              this._ensureCapacity(value);
              for (var i = this._offset + this._length, j = this._offset + value; i < j; i++) {
                this._buffer[i] = Float64Vector.DEFAULT_VALUE;
              }
            }
            this._length = value;
          },
          enumerable: true,
          configurable: true
        });



        Object.defineProperty(Float64Vector.prototype, "fixed", {
          get: function () {
            return this._fixed;
          },
          set: function (f) {
            this._fixed = !!f;
          },
          enumerable: true,
          configurable: true
        });

        Float64Vector.prototype._spliceHelper = function (index, insertCount, deleteCount, args, offset) {
          insertCount = clamp(insertCount, 0, args.length - offset);
          deleteCount = clamp(deleteCount, 0, this._length - index);
          this._ensureCapacity(this._length - deleteCount + insertCount);
          var right = this._offset + index + deleteCount;
          var slice = this._buffer.subarray(right, right + this._length - index - deleteCount);
          this._buffer.set(slice, this._offset + index + insertCount);
          this._length += insertCount - deleteCount;
          for (var i = 0; i < insertCount; i++) {
            this._buffer[this._offset + index + i] = args.asGetNumericProperty(offset + i);
          }
        };

        Float64Vector.prototype.asNextName = function (index) {
          return index - 1;
        };

        Float64Vector.prototype.asNextValue = function (index) {
          return this._buffer[this._offset + index - 1];
        };

        Float64Vector.prototype.asNextNameIndex = function (index) {
          var nextNameIndex = index + 1;
          if (nextNameIndex <= this._length) {
            return nextNameIndex;
          }
          return 0;
        };

        Float64Vector.prototype.asHasNext2 = function (hasNext2Info) {
          hasNext2Info.index = this.asNextNameIndex(hasNext2Info.index);
        };
        Float64Vector.EXTRA_CAPACITY = 4;
        Float64Vector.INITIAL_CAPACITY = 10;
        Float64Vector.DEFAULT_VALUE = 0;

        Float64Vector.CASEINSENSITIVE = 1;
        Float64Vector.DESCENDING = 2;
        Float64Vector.UNIQUESORT = 4;
        Float64Vector.RETURNINDEXEDARRAY = 8;
        Float64Vector.NUMERIC = 16;
        return Float64Vector;
      })();
      AS.Float64Vector = Float64Vector;

      Float64Vector.prototype._reverse = Float64Vector.prototype.reverse;
      Float64Vector.prototype._filter = Float64Vector.prototype.filter;
      Float64Vector.prototype._map = Float64Vector.prototype.map;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var Multiname = Shumway.AVM2.ABC.Multiname;

      var Scope = Shumway.AVM2.Runtime.Scope;
      var hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
      var hasOwnGetter = Shumway.ObjectUtilities.hasOwnGetter;

      var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
      var isNumber = Shumway.isNumber;
      var isNullOrUndefined = Shumway.isNullOrUndefined;
      var createObject = Shumway.ObjectUtilities.createObject;
      var isPrototypeWriteable = Shumway.ObjectUtilities.isPrototypeWriteable;
      var getOwnPropertyDescriptor = Shumway.ObjectUtilities.getOwnPropertyDescriptor;
      var notImplemented = Shumway.Debug.notImplemented;
      var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

      var _notImplemented = notImplemented;
      var somewhatImplemented = Shumway.Debug.somewhatImplemented;
      var assert = Shumway.Debug.assert;
      var createFunction = Shumway.AVM2.Runtime.createFunction;
      var Runtime = Shumway.AVM2.Runtime;
      var IndentingWriter = Shumway.IndentingWriter;
      var boxValue = Shumway.ObjectUtilities.boxValue;
      var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
      var SORT = Shumway.AVM2.ABC.SORT;

      var ClassBindings = Shumway.AVM2.Runtime.ClassBindings;
      var InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;

      var Int32Vector = Shumway.AVM2.AS.Int32Vector;
      var Uint32Vector = Shumway.AVM2.AS.Uint32Vector;
      var Float64Vector = Shumway.AVM2.AS.Float64Vector;
      var asCompare = Shumway.AVM2.Runtime.asCompare;

      var debug = false;

      function log(message) {
        var optionalParams = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
          optionalParams[_i] = arguments[_i + 1];
        }
        if (debug) {
          jsGlobal.print(message);
        }
      }

      var writer = debug ? new IndentingWriter() : null;

      (function (InitializationFlags) {
        InitializationFlags[InitializationFlags["NONE"] = 0x0] = "NONE";
        InitializationFlags[InitializationFlags["OWN_INITIALIZE"] = 0x1] = "OWN_INITIALIZE";
        InitializationFlags[InitializationFlags["SUPER_INITIALIZE"] = 0x2] = "SUPER_INITIALIZE";
      })(AS.InitializationFlags || (AS.InitializationFlags = {}));
      var InitializationFlags = AS.InitializationFlags;

      var ASObject = (function () {
        function ASObject() {
        }
        ASObject.morphIntoASClass = function (classInfo) {
          this.classInfo = classInfo;
          this.__proto__ = ASClass.prototype;
        };

        ASObject.create = function (self, baseClass, instanceConstructor) {
          ASClass.create(self, baseClass, this.instanceConstructor);
        };

        ASObject.initializeFrom = function (value) {
          return ASClassPrototype.initializeFrom.call(this, value);
        };

        ASObject.asCall = function (self) {
          var argArray = [];
          for (var _i = 0; _i < (arguments.length - 1); _i++) {
            argArray[_i] = arguments[_i + 1];
          }
          return this.callableConstructor.apply(self, argArray);
        };

        ASObject.asApply = function (self, argArray) {
          return this.callableConstructor.apply(self, argArray);
        };

        ASObject.verify = function () {
          ASClassPrototype.verify.call(this);
        };

        ASObject.trace = function (writer) {
          ASClassPrototype.trace.call(this, writer);
        };

        ASObject.getQualifiedClassName = function () {
          return ASClassPrototype.getQualifiedClassName.call(this);
        };

        ASObject._setPropertyIsEnumerable = function (o, V, enumerable) {
          var name = Multiname.getPublicQualifiedName(V);
          var descriptor = getOwnPropertyDescriptor(o, name);
          descriptor.enumerable = false;
          Object.defineProperty(o, name, descriptor);
        };

        ASObject._dontEnumPrototype = function (o) {
          for (var key in o) {
            if (Multiname.isPublicQualifiedName(key)) {
              var descriptor = getOwnPropertyDescriptor(o, key);
              descriptor.enumerable = false;
              Object.defineProperty(o, key, descriptor);
            }
          }
        };

        ASObject.prototype.native_isPrototypeOf = function (V) {
          notImplemented("isPrototypeOf");
          return false;
        };

        ASObject.prototype.native_hasOwnProperty = function (name) {
          var self = this;
          return self.asHasOwnProperty(null, name, 0);
        };

        ASObject.prototype.native_propertyIsEnumerable = function (name) {
          var self = this;
          return self.asPropertyIsEnumerable(null, name, 0);
        };

        ASObject.prototype.setPropertyIsEnumerable = function (name, enumerable) {
          ASObject._setPropertyIsEnumerable(this, name, enumerable);
        };

        ASObject.prototype.toString = function () {
          var self = boxValue(this);
          if (self instanceof ASClass) {
            var cls = self;
            return Shumway.StringUtilities.concat3("[class ", cls.classInfo.instanceInfo.name.name, "]");
          }
          return Shumway.StringUtilities.concat3("[object ", self.class.classInfo.instanceInfo.name.name, "]");
        };
        ASObject.baseClass = null;

        ASObject.instanceConstructor = Object;
        ASObject.instanceConstructorNoInitialize = null;

        ASObject.initializer = null;

        ASObject.initializers = null;
        ASObject.classInitializer = null;

        ASObject.callableConstructor = ASObject.instanceConstructor;

        ASObject.defaultValue = null;
        ASObject.initializationFlags = 0 /* NONE */;

        ASObject.call = Function.prototype.call;
        ASObject.apply = Function.prototype.apply;

        ASObject.coerce = Runtime.asCoerceObject;

        ASObject.defineProperty = Object.defineProperty;
        return ASObject;
      })();
      AS.ASObject = ASObject;

      var ASNative = (function (_super) {
        __extends(ASNative, _super);
        function ASNative() {
          _super.apply(this, arguments);
        }
        ASNative.baseClass = null;
        ASNative.classInfo = null;
        ASNative.instanceConstructor = null;
        ASNative.callableConstructor = null;
        ASNative.classBindings = null;
        ASNative.instanceBindings = null;
        ASNative.staticNatives = null;
        ASNative.instanceNatives = null;
        ASNative.traitsPrototype = null;
        ASNative.dynamicPrototype = null;
        ASNative.defaultValue = null;
        ASNative.initializationFlags = 0 /* NONE */;
        return ASNative;
      })(ASObject);
      AS.ASNative = ASNative;

      var ASClass = (function (_super) {
        __extends(ASClass, _super);
        function ASClass(classInfo) {
          false && _super.call(this);
          this.classInfo = classInfo;
          this.staticNatives = null;
          this.instanceNatives = null;
          this.initializationFlags = 0 /* NONE */;
          this.defaultValue = null;
        }
        ASClass.configureBuiltinPrototype = function (self, baseClass) {
          release || assert(self.instanceConstructor);
          self.baseClass = baseClass;
          self.dynamicPrototype = self.traitsPrototype = self.instanceConstructor.prototype;
        };

        ASClass.configurePrototype = function (self, baseClass) {
          self.baseClass = baseClass;

          self.dynamicPrototype = createObject(baseClass.dynamicPrototype);

          self.traitsPrototype = createObject(self.dynamicPrototype);

          var traitsPrototype = self.traitsPrototype;
          var classes = [];
          while (self) {
            classes.push(self);
            self = self.baseClass;
          }

          for (var i = 0; i < classes.length; i++) {
            var sources = [classes[i].typeScriptPrototype];

            if (classes[i].instanceNatives) {
              Shumway.ArrayUtilities.pushMany(sources, classes[i].instanceNatives);
            }
            for (var j = 0; j < sources.length; j++) {
              var source = sources[j];
              for (var property in source) {
                if (i > 0 && property === "toString") {
                  continue;
                }
                if (hasOwnProperty(source, property) && !hasOwnProperty(traitsPrototype, property)) {
                  var descriptor = Object.getOwnPropertyDescriptor(source, property);
                  release || Shumway.Debug.assert(descriptor);
                  try  {
                    Object.defineProperty(traitsPrototype, property, descriptor);
                  } catch (e) {
                  }
                }
              }
            }
          }
        };

        ASClass.create = function (self, baseClass, instanceConstructor) {
          release || assert(!self.instanceConstructorNoInitialize, "This should not be set yet.");
          release || assert(!self.dynamicPrototype && !self.traitsPrototype, "These should not be set yet.");

          self.typeScriptPrototype = self.prototype;

          if (self.instanceConstructor && !isPrototypeWriteable(self.instanceConstructor)) {
            ASClass.configureBuiltinPrototype(self, baseClass);
          } else {
            ASClass.configurePrototype(self, baseClass);
          }

          if (!self.instanceConstructor) {
            self.instanceConstructor = instanceConstructor;
            if (self !== instanceConstructor) {
              self.instanceConstructor.__proto__ = self;
            }
          } else {
            writer && writer.warnLn("Ignoring AS3 instanceConstructor.");
          }

          if (!self.callableConstructor) {
            self.callableConstructor = self.coerce.bind(self);
          }

          self.instanceConstructorNoInitialize = self.instanceConstructor;
          self.instanceConstructor.prototype = self.traitsPrototype;
          defineNonEnumerableProperty(self.instanceConstructor.prototype, "class", self);

          defineNonEnumerableProperty(self.dynamicPrototype, Multiname.getPublicQualifiedName("constructor"), self);

          if (self.protocol) {
            Shumway.ObjectUtilities.copyOwnPropertyDescriptors(self.traitsPrototype, self.protocol);
          }
        };

        ASClass.prototype.initializeFrom = function (value) {
          var o = Object.create(this.traitsPrototype);
          ASClass.runInitializers(o, value);
          return o;
        };

        ASClass.runInitializers = function (self, argument) {
          argument = argument || self.class.defaultInitializerArgument;
          var cls = self.class;
          var initializers = cls.initializers;
          if (initializers) {
            for (var i = 0; i < initializers.length; i++) {
              initializers[i].call(self, argument);
            }
          }
        };

        ASClass.configureInitializers = function (self) {
          if (self.baseClass && self.baseClass.initializers) {
            self.initializers = self.baseClass.initializers.slice(0);
          }
          if (self.initializer) {
            if (!self.initializers) {
              self.initializers = [];
            }
            self.initializers.push(self.initializer);
          }

          if (self.initializers) {
            release || assert(self.instanceConstructorNoInitialize === self.instanceConstructor);
            var previousConstructor = self;
            self.instanceConstructor = function () {
              var args = [];
              for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
              }
              ASClass.runInitializers(this, undefined);
              return self.instanceConstructorNoInitialize.apply(this, arguments);
            };
            self.instanceConstructor.prototype = self.traitsPrototype;
            defineNonEnumerableProperty(self.instanceConstructor.prototype, "class", self);

            (self.instanceConstructor).classInfo = previousConstructor.classInfo;
            self.instanceConstructor.__proto__ = previousConstructor;
          }
        };

        ASClass.runClassInitializer = function (self) {
          if (self.classInitializer) {
            self.classInitializer();
          }
        };

        ASClass.linkSymbols = function (self) {
          function containsSymbol(symbols, name) {
            for (var i = 0; i < symbols.length; i++) {
              var symbol = symbols[i];
              if (symbol.indexOf(name) >= 0) {
                var releaseSymbol = symbol[symbol.length - 1] === "!";
                if (releaseSymbol) {
                  symbol = symbol.slice(0, symbol.length - 1);
                }
                if (name !== symbol) {
                  continue;
                }
                if (release) {
                  return releaseSymbol;
                }
                return true;
              }
            }
            return false;
          }

          function link(symbols, traits, object) {
            for (var i = 0; i < traits.length; i++) {
              var trait = traits[i];
              if (!containsSymbol(symbols, trait.name.name)) {
                continue;
              }
              release || assert(!trait.name.getNamespace().isPrivate(), "Why are you linking against private members?");
              if (trait.isConst()) {
                notImplemented("Don't link against const traits.");
                return;
              }
              var name = trait.name.name;
              var qn = Multiname.getQualifiedName(trait.name);
              if (trait.isSlot()) {
                Object.defineProperty(object, name, {
                  get: new Function("", "return this." + qn),
                  set: new Function("v", "this." + qn + " = v")
                });
              } else if (trait.isMethod()) {
                release || assert(!object[name], "Symbol should not already exist.");
                release || assert(object.asOpenMethods[qn], "There should be an open method for this symbol.");
                object[name] = object.asOpenMethods[qn];
              } else if (trait.isGetter()) {
                release || assert(hasOwnGetter(object, qn), "There should be an getter method for this symbol.");
                Object.defineProperty(object, name, {
                  get: new Function("", "return this." + qn)
                });
              } else {
                notImplemented(trait);
              }
            }
          }

          if (self.classSymbols) {
            link(self.classSymbols, self.classInfo.traits, self);
          }

          if (self.instanceSymbols) {
            link(self.instanceSymbols, self.classInfo.instanceInfo.traits, self.traitsPrototype);
          }
        };

        ASClass.prototype.morphIntoASClass = function (classInfo) {
          release || assert(this.classInfo === classInfo);
          release || assert(this instanceof ASClass);
        };

        Object.defineProperty(ASClass.prototype, "native_prototype", {
          get: function () {
            release || assert(this.dynamicPrototype);
            return this.dynamicPrototype;
          },
          enumerable: true,
          configurable: true
        });

        ASClass.prototype.asCall = function (self) {
          var argArray = [];
          for (var _i = 0; _i < (arguments.length - 1); _i++) {
            argArray[_i] = arguments[_i + 1];
          }
          return this.coerce(argArray[0]);
        };

        ASClass.prototype.asApply = function (self, argArray) {
          return this.coerce(argArray[0]);
        };

        ASClass.prototype.applyType = function (type) {
          debugger;
          return null;
        };

        ASClass.prototype.isInstanceOf = function (value) {
          if (this.isInterface()) {
            return false;
          }
          return this.isType(value);
        };

        ASClass.prototype.isType = function (value) {
          if (Shumway.isNullOrUndefined(value)) {
            return false;
          }

          value = boxValue(value);

          if (this.isInterface()) {
            if (value === null || typeof value !== "object") {
              return false;
            }
            release || assert(value.class.implementedInterfaces, "No 'implementedInterfaces' map found on class " + value.class);
            var qualifiedName = Multiname.getQualifiedName(this.classInfo.instanceInfo.name);
            return value.class.implementedInterfaces[qualifiedName] !== undefined;
          }

          return this.dynamicPrototype.isPrototypeOf(value);
        };

        ASClass.prototype.isSubtypeOf = function (value) {
          var that = this;
          while (that) {
            if (that.traitsPrototype === value.traitsPrototype) {
              return true;
            }
            that = that.baseClass;
          }
          return false;
        };

        ASClass.prototype.coerce = function (value) {
          log(Shumway.StringUtilities.concat4("Coercing ", value, " to ", this));
          return value;
        };

        ASClass.prototype.isInterface = function () {
          return this.classInfo.instanceInfo.isInterface();
        };

        ASClass.prototype.getQualifiedClassName = function () {
          var name = this.classInfo.instanceInfo.name;
          var uri = name.namespaces[0].uri;
          if (uri) {
            return uri + "::" + name.name;
          }
          return name.name;
        };

        ASClass.prototype.verify = function () {
          var self = this;

          if (this.isInterface()) {
            return;
          }

          writer && writer.enter("Verifying Class: " + self.classInfo + " {");
          var traits = [self.classInfo.traits, self.classInfo.instanceInfo.traits];

          var staticNatives = [self];
          if (self.staticNatives) {
            Shumway.ArrayUtilities.pushMany(staticNatives, self.staticNatives);
          }

          var instanceNatives = [self.prototype];
          if (self.instanceNatives) {
            Shumway.ArrayUtilities.pushMany(instanceNatives, self.instanceNatives);
          }

          if (self === ASObject) {
            release || assert(!self.baseClass, "ASObject should have no base class.");
          } else {
            release || assert(self.baseClass, self.classInfo.instanceInfo.name + " has no base class.");
            release || assert(self.baseClass !== self);
          }

          release || assert(self.traitsPrototype === self.instanceConstructor.prototype, "The traitsPrototype is not set correctly.");

          if (self !== ASObject) {
            if (ASObject.staticNatives === self.staticNatives) {
              writer && writer.warnLn("Template does not override its staticNatives, possibly a bug.");
            }
            if (ASObject.instanceNatives === self.instanceNatives) {
              writer && writer.warnLn("Template does not override its instanceNatives, possibly a bug.");
            }
          }

          function has(objects, predicate, name) {
            for (var i = 0; i < objects.length; i++) {
              if (predicate(objects[i], name)) {
                return true;
              }
            }
            return false;
          }

          for (var j = 0; j < traits.length; j++) {
            var isClassTrait = j === 0;
            for (var i = 0; i < traits[j].length; i++) {
              var trait = traits[j][i];
              var name = escapeNativeName(trait.name.name);
              if (!(trait.isMethodOrAccessor() && trait.methodInfo.isNative())) {
                continue;
              }
              var holders = isClassTrait ? staticNatives : instanceNatives;
              var hasDefinition = false;
              if (trait.isMethod()) {
                hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnProperty, name);
              } else if (trait.isGetter()) {
                hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnGetter, name);
              } else if (trait.isSetter()) {
                hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnSetter, name);
              }
              if (!hasDefinition) {
                writer && writer.warnLn("Template is missing an implementation of the native " + (isClassTrait ? "static" : "instance") + " trait: " + trait + " in class: " + self.classInfo);
              }
            }
          }

          writer && writer.leave("}");

          Shumway.Debug.assert(self.instanceConstructor, "Must have a constructor function.");
        };

        ASClass.labelObject = function (o) {
          if (!o) {
            return o;
          }
          if (!hasOwnProperty(o, "labelId")) {
            o.labelId = ASClass.labelCounter++;
          }
          if (o instanceof Function) {
            return "Function [#" + o.labelId + "]";
          }
          return "Object [#" + o.labelId + "]";
        };

        ASClass.prototype.trace = function (writer) {
          writer.enter("Class: " + this.classInfo);
          writer.writeLn("baseClass: " + (this.baseClass ? this.baseClass.classInfo.instanceInfo.name : null));
          writer.writeLn("instanceConstructor: " + this.instanceConstructor + " " + ASClass.labelObject(this.instanceConstructor));
          writer.writeLn("instanceConstructorNoInitialize: " + this.instanceConstructorNoInitialize + " " + ASClass.labelObject(this.instanceConstructorNoInitialize));

          writer.writeLn("traitsPrototype: " + ASClass.labelObject(this.traitsPrototype));
          writer.writeLn("traitsPrototype.__proto__: " + ASClass.labelObject(this.traitsPrototype.__proto__));
          writer.writeLn("dynamicPrototype: " + ASClass.labelObject(this.dynamicPrototype));
          writer.writeLn("dynamicPrototype.__proto__: " + ASClass.labelObject(this.dynamicPrototype.__proto__));
          writer.writeLn("instanceConstructor.prototype: " + ASClass.labelObject(this.instanceConstructor.prototype));

          writer.leave("}");
        };
        ASClass.instanceConstructor = ASClass;
        ASClass.staticNatives = null;
        ASClass.instanceNatives = null;

        ASClass.labelCounter = 0;
        return ASClass;
      })(ASObject);
      AS.ASClass = ASClass;

      var ASClassPrototype = ASClass.prototype;

      ASClassPrototype.call = Function.prototype.call;
      ASClassPrototype.apply = Function.prototype.apply;

      var ASFunction = (function (_super) {
        __extends(ASFunction, _super);
        function ASFunction() {
          false && _super.call(this);
        }
        Object.defineProperty(ASFunction.prototype, "native_prototype", {
          get: function () {
            var self = this;
            return self.prototype;
          },
          set: function (p) {
            var self = this;
            self.prototype = p;
          },
          enumerable: true,
          configurable: true
        });


        Object.defineProperty(ASFunction.prototype, "native_length", {
          get: function () {
            if (this.hasOwnProperty(Runtime.VM_LENGTH)) {
              return this.asLength;
            }
            return this.length;
          },
          enumerable: true,
          configurable: true
        });
        ASFunction.baseClass = null;

        ASFunction.instanceConstructor = Function;

        ASFunction.staticNatives = [Function];
        ASFunction.instanceNatives = [Function.prototype];
        return ASFunction;
      })(ASObject);
      AS.ASFunction = ASFunction;

      var ASBoolean = (function (_super) {
        __extends(ASBoolean, _super);
        function ASBoolean(value) {
          if (typeof value === "undefined") { value = undefined; }
          false && _super.call(this);
        }
        ASBoolean.instanceConstructor = Boolean;
        ASBoolean.callableConstructor = ASBoolean.instanceConstructor;

        ASBoolean.staticNatives = null;
        ASBoolean.instanceNatives = null;
        ASBoolean.coerce = Runtime.asCoerceBoolean;
        return ASBoolean;
      })(ASObject);
      AS.ASBoolean = ASBoolean;

      ASBoolean.prototype.toString = Boolean.prototype.toString;
      ASBoolean.prototype.valueOf = Boolean.prototype.valueOf;

      var ASMethodClosure = (function (_super) {
        __extends(ASMethodClosure, _super);
        function ASMethodClosure(self, fn) {
          false && _super.call(this);
          var bound = Shumway.FunctionUtilities.bindSafely(fn, self);
          defineNonEnumerableProperty(this, "call", bound.call.bind(bound));
          defineNonEnumerableProperty(this, "apply", bound.apply.bind(bound));
        }
        ASMethodClosure.prototype.toString = function () {
          return "function Function() {}";
        };
        ASMethodClosure.staticNatives = null;
        ASMethodClosure.instanceNatives = null;
        ASMethodClosure.instanceConstructor = ASMethodClosure;
        return ASMethodClosure;
      })(ASFunction);
      AS.ASMethodClosure = ASMethodClosure;

      var ASNumber = (function (_super) {
        __extends(ASNumber, _super);
        function ASNumber() {
          _super.apply(this, arguments);
        }
        ASNumber._numberToString = function (n, radix) {
          radix = radix | 0;
          return Number(n).toString(radix);
        };

        ASNumber._minValue = function () {
          return Number.MIN_VALUE;
        };
        ASNumber.instanceConstructor = Number;
        ASNumber.callableConstructor = ASNumber.instanceConstructor;

        ASNumber.staticNatives = [Math];
        ASNumber.instanceNatives = [Number.prototype];
        ASNumber.defaultValue = Number(0);
        ASNumber.coerce = Runtime.asCoerceNumber;
        return ASNumber;
      })(ASObject);
      AS.ASNumber = ASNumber;

      var ASInt = (function (_super) {
        __extends(ASInt, _super);
        function ASInt(value) {
          false && _super.call(this);
          return Object(Number(value | 0));
        }
        ASInt.asCall = function (self) {
          var argArray = [];
          for (var _i = 0; _i < (arguments.length - 1); _i++) {
            argArray[_i] = arguments[_i + 1];
          }
          return argArray[0] | 0;
        };

        ASInt.asApply = function (self, argArray) {
          return argArray[0] | 0;
        };

        ASInt.isInstanceOf = function (value) {
          return false;
        };

        ASInt.isType = function (value) {
          if (isNumber(value) || value instanceof Number) {
            value = +value;
            return (value | 0) === value;
          }
          return false;
        };
        ASInt.instanceConstructor = ASInt;
        ASInt.callableConstructor = ASInt.instanceConstructor;

        ASInt.staticNatives = [Math];
        ASInt.instanceNatives = [Number.prototype];
        ASInt.defaultValue = 0;
        ASInt.coerce = Runtime.asCoerceInt;
        return ASInt;
      })(ASObject);
      AS.ASInt = ASInt;

      var ASUint = (function (_super) {
        __extends(ASUint, _super);
        function ASUint(value) {
          false && _super.call(this);
          return Object(Number(value >>> 0));
        }
        ASUint.asCall = function (self) {
          var argArray = [];
          for (var _i = 0; _i < (arguments.length - 1); _i++) {
            argArray[_i] = arguments[_i + 1];
          }
          return argArray[0] >>> 0;
        };

        ASUint.asApply = function (self, argArray) {
          return argArray[0] >>> 0;
        };

        ASUint.isInstanceOf = function (value) {
          return false;
        };

        ASUint.isType = function (value) {
          if (isNumber(value) || value instanceof Number) {
            value = +value;
            return (value >>> 0) === value;
          }
          return false;
        };
        ASUint.instanceConstructor = ASUint;
        ASUint.callableConstructor = ASUint.instanceConstructor;

        ASUint.staticNatives = [Math];
        ASUint.instanceNatives = [Number.prototype];
        ASUint.defaultValue = 0;
        ASUint.coerce = Runtime.asCoerceUint;
        return ASUint;
      })(ASObject);
      AS.ASUint = ASUint;

      var ASString = (function (_super) {
        __extends(ASString, _super);
        function ASString() {
          _super.apply(this, arguments);
        }
        Object.defineProperty(ASString.prototype, "native_length", {
          get: function () {
            return this.length;
          },
          enumerable: true,
          configurable: true
        });

        ASString.prototype.match = function (re) {
          if (re === (void 0) || re === null) {
            return null;
          } else {
            if (re instanceof RegExp && re.global) {
              var matches = [], m;
              while ((m = re.exec(this))) {
                matches.push(m[0]);
              }
              return matches;
            }
            if (!(re instanceof RegExp) && !(typeof re === 'string')) {
              re = String(re);
            }
            return this.match(re);
          }
        };

        ASString.prototype.search = function (re) {
          if (re === void 0) {
            return -1;
          } else {
            return this.search(re);
          }
        };

        ASString.prototype.toUpperCase = function () {
          var str = String.prototype.toUpperCase.apply(this);
          var str = str.replace(/\u039C/g, String.fromCharCode(181));
          return str;
        };

        ASString.prototype.toLocaleUpperCase = function () {
          var str = String.prototype.toLocaleUpperCase.apply(this);
          var str = str.replace(/\u039C/g, String.fromCharCode(181));
          return str;
        };
        ASString.instanceConstructor = String;
        ASString.callableConstructor = ASString.instanceConstructor;

        ASString.staticNatives = [String];
        ASString.instanceNatives = [String.prototype];
        ASString.coerce = Runtime.asCoerceString;
        return ASString;
      })(ASObject);
      AS.ASString = ASString;

      function arraySort(o, args) {
        if (args.length === 0) {
          return o.sort();
        }
        var compareFunction, options = 0;
        if (args[0] instanceof Function) {
          compareFunction = args[0];
        } else if (isNumber(args[0])) {
          options = args[0];
        }
        if (isNumber(args[1])) {
          options = args[1];
        }
        o.sort(function (a, b) {
          return asCompare(a, b, options, compareFunction);
        });
        return o;
      }
      AS.arraySort = arraySort;

      var ASArray = (function (_super) {
        __extends(ASArray, _super);
        function ASArray() {
          _super.apply(this, arguments);
        }
        ASArray._pop = function (o) {
          return o.pop();
        };
        ASArray._reverse = function (o) {
          return o.reverse();
        };
        ASArray._concat = function (o, args) {
          return o.concat.apply(o, args);
        };
        ASArray._shift = function (o) {
          return o.shift();
        };
        ASArray._slice = function (o, A, B) {
          A = +A;
          B = +B;
          return o.slice(A, B);
        };
        ASArray._unshift = function (o, args) {
          return o.unshift.apply(o, args);
        };
        ASArray._splice = function (o, args) {
          return o.splice.apply(o, args);
        };
        ASArray._sort = function (o, args) {
          if (args.length === 0) {
            return o.sort();
          }
          var compareFunction, options = 0;
          if (args[0] instanceof Function) {
            compareFunction = args[0];
          } else if (isNumber(args[0])) {
            options = args[0];
          }
          if (isNumber(args[1])) {
            options = args[1];
          }
          o.sort(function (a, b) {
            return Runtime.asCompare(a, b, options, compareFunction);
          });
          return o;
        };
        ASArray._sortOn = function (o, names, options) {
          if (Shumway.isString(names)) {
            names = [names];
          }
          if (isNumber(options)) {
            options = [options];
          }
          for (var i = names.length - 1; i >= 0; i--) {
            var key = Multiname.getPublicQualifiedName(names[i]);
            if (ASArray.CACHE_NUMERIC_COMPARATORS && options[i] & 16 /* NUMERIC */) {
              var str = "var x = +(a." + key + "), y = +(b." + key + ");";
              if (options[i] & 2 /* DESCENDING */) {
                str += "return x < y ? 1 : (x > y ? -1 : 0);";
              } else {
                str += "return x < y ? -1 : (x > y ? 1 : 0);";
              }
              var numericComparator = ASArray.numericComparatorCache[str];
              if (!numericComparator) {
                numericComparator = ASArray.numericComparatorCache[str] = new Function("a", "b", str);
              }
              o.sort(numericComparator);
            } else {
              o.sort(function (a, b) {
                return Runtime.asCompare(a[key], b[key], options[i] | 0);
              });
            }
          }
          return o;
        };
        ASArray._indexOf = function (o, searchElement, fromIndex) {
          fromIndex = fromIndex | 0;
          return o.indexOf(searchElement, fromIndex);
        };
        ASArray._lastIndexOf = function (o, searchElement, fromIndex) {
          if (typeof fromIndex === "undefined") { fromIndex = 0; }
          fromIndex = fromIndex | 0;
          return o.lastIndexOf(searchElement, fromIndex);
        };
        ASArray._every = function (o, callback, thisObject) {
          for (var i = 0; i < o.length; i++) {
            if (callback.call(thisObject, o[i], i, o) !== true) {
              return false;
            }
          }
          return false;
        };
        ASArray._filter = function (o, callback, thisObject) {
          var result = [];
          for (var i = 0; i < o.length; i++) {
            if (callback.call(thisObject, o[i], i, o) === true) {
              result.push(o[i]);
            }
          }
          return result;
        };
        ASArray._forEach = function (o, callback, thisObject) {
          return o.forEach(callback, thisObject);
        };
        ASArray._map = function (o, callback, thisObject) {
          return o.map(callback, thisObject);
        };
        ASArray._some = function (o, callback, thisObject) {
          return o.some(callback, thisObject);
        };
        Object.defineProperty(ASArray.prototype, "native_length", {
          get: function () {
            return this.length;
          },
          set: function (newLength) {
            newLength = newLength >>> 0;
            this.length = newLength;
          },
          enumerable: true,
          configurable: true
        });
        ASArray.instanceConstructor = Array;
        ASArray.staticNatives = [Array];
        ASArray.instanceNatives = [Array.prototype];

        ASArray.CACHE_NUMERIC_COMPARATORS = true;
        ASArray.numericComparatorCache = createEmptyObject();
        return ASArray;
      })(ASObject);
      AS.ASArray = ASArray;

      var ASVector = (function (_super) {
        __extends(ASVector, _super);
        function ASVector() {
          _super.apply(this, arguments);
        }
        ASVector.prototype.newThisType = function () {
          return new this.class.instanceConstructor();
        };
        ASVector.staticNatives = null;
        ASVector.instanceNatives = null;
        ASVector.instanceConstructor = ASVector;
        ASVector.callableConstructor = null;
        return ASVector;
      })(ASNative);
      AS.ASVector = ASVector;

      var ASIntVector = (function (_super) {
        __extends(ASIntVector, _super);
        function ASIntVector() {
          _super.apply(this, arguments);
        }
        ASIntVector._every = function (o, callback, thisObject) {
          return o.every(callback, thisObject);
        };
        ASIntVector._forEach = function (o, callback, thisObject) {
          return o.forEach(callback, thisObject);
        };
        ASIntVector._some = function (o, callback, thisObject) {
          return o.some(callback, thisObject);
        };
        ASIntVector.instanceConstructor = Int32Vector;
        ASIntVector.staticNatives = [Int32Vector];
        ASIntVector.instanceNatives = [Int32Vector.prototype, ASVector.prototype];
        ASIntVector.callableConstructor = Int32Vector.callable;

        ASIntVector._sort = arraySort;
        return ASIntVector;
      })(ASVector);
      AS.ASIntVector = ASIntVector;

      var ASUIntVector = (function (_super) {
        __extends(ASUIntVector, _super);
        function ASUIntVector() {
          _super.apply(this, arguments);
        }
        ASUIntVector._every = function (o, callback, thisObject) {
          return o.every(callback, thisObject);
        };
        ASUIntVector._forEach = function (o, callback, thisObject) {
          return o.forEach(callback, thisObject);
        };
        ASUIntVector._some = function (o, callback, thisObject) {
          return o.some(callback, thisObject);
        };
        ASUIntVector.instanceConstructor = Uint32Vector;
        ASUIntVector.staticNatives = [Uint32Vector];
        ASUIntVector.instanceNatives = [Uint32Vector.prototype, ASVector.prototype];
        ASUIntVector.callableConstructor = Uint32Vector.callable;

        ASUIntVector._sort = arraySort;
        return ASUIntVector;
      })(ASVector);
      AS.ASUIntVector = ASUIntVector;

      var ASDoubleVector = (function (_super) {
        __extends(ASDoubleVector, _super);
        function ASDoubleVector() {
          _super.apply(this, arguments);
        }
        ASDoubleVector._every = function (o, callback, thisObject) {
          return o.every(callback, thisObject);
        };
        ASDoubleVector._forEach = function (o, callback, thisObject) {
          return o.forEach(callback, thisObject);
        };
        ASDoubleVector._some = function (o, callback, thisObject) {
          return o.some(callback, thisObject);
        };
        ASDoubleVector.instanceConstructor = Float64Vector;
        ASDoubleVector.staticNatives = [Float64Vector];
        ASDoubleVector.instanceNatives = [Float64Vector.prototype, ASVector.prototype];
        ASDoubleVector.callableConstructor = Float64Vector.callable;

        ASDoubleVector._sort = arraySort;
        return ASDoubleVector;
      })(ASVector);
      AS.ASDoubleVector = ASDoubleVector;

      var ASJSON = (function (_super) {
        __extends(ASJSON, _super);
        function ASJSON() {
          _super.apply(this, arguments);
        }
        ASJSON.transformJSValueToAS = function (value) {
          if (typeof value !== "object") {
            return value;
          }
          var keys = Object.keys(value);
          var result = value instanceof Array ? [] : {};
          for (var i = 0; i < keys.length; i++) {
            result.asSetPublicProperty(keys[i], ASJSON.transformJSValueToAS(value[keys[i]]));
          }
          return result;
        };

        ASJSON.transformASValueToJS = function (value) {
          if (typeof value !== "object") {
            return value;
          }
          if (isNullOrUndefined(value)) {
            return value;
          }
          var keys = Object.keys(value);
          var result = value instanceof Array ? [] : {};
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var jsKey = key;
            if (!Shumway.isNumeric(key)) {
              jsKey = Multiname.getNameFromPublicQualifiedName(key);
            }
            result[jsKey] = ASJSON.transformASValueToJS(value[key]);
          }
          return result;
        };

        ASJSON.parseCore = function (text) {
          text = asCoerceString(text);
          return ASJSON.transformJSValueToAS(JSON.parse(text));
        };

        ASJSON.stringifySpecializedToString = function (value, replacerArray, replacerFunction, gap) {
          return JSON.stringify(ASJSON.transformASValueToJS(value), replacerFunction, gap);
        };
        ASJSON.instanceConstructor = ASJSON;
        ASJSON.staticNatives = null;
        ASJSON.instanceNatives = null;
        return ASJSON;
      })(ASObject);
      AS.ASJSON = ASJSON;

      var ASError = (function (_super) {
        __extends(ASError, _super);
        function ASError(msg, id) {
          if (typeof msg === "undefined") { msg = ""; }
          if (typeof id === "undefined") { id = 0; }
          false && _super.call(this);
          notImplemented("ASError");
        }
        ASError.prototype.getStackTrace = function () {
          somewhatImplemented("Error.getStackTrace()");
          return Shumway.AVM2.Runtime.AVM2.getStackTrace();
        };
        ASError.instanceConstructor = null;
        ASError.staticNatives = null;
        ASError.instanceNatives = null;
        ASError.getErrorMessage = Shumway.AVM2.getErrorMessage;
        return ASError;
      })(ASNative);
      AS.ASError = ASError;

      var ASDefinitionError = (function (_super) {
        __extends(ASDefinitionError, _super);
        function ASDefinitionError() {
          _super.apply(this, arguments);
        }
        return ASDefinitionError;
      })(ASError);
      AS.ASDefinitionError = ASDefinitionError;
      var ASEvalError = (function (_super) {
        __extends(ASEvalError, _super);
        function ASEvalError() {
          _super.apply(this, arguments);
        }
        return ASEvalError;
      })(ASError);
      AS.ASEvalError = ASEvalError;
      var ASRangeError = (function (_super) {
        __extends(ASRangeError, _super);
        function ASRangeError() {
          _super.apply(this, arguments);
        }
        return ASRangeError;
      })(ASError);
      AS.ASRangeError = ASRangeError;
      var ASReferenceError = (function (_super) {
        __extends(ASReferenceError, _super);
        function ASReferenceError() {
          _super.apply(this, arguments);
        }
        return ASReferenceError;
      })(ASError);
      AS.ASReferenceError = ASReferenceError;
      var ASSecurityError = (function (_super) {
        __extends(ASSecurityError, _super);
        function ASSecurityError() {
          _super.apply(this, arguments);
        }
        return ASSecurityError;
      })(ASError);
      AS.ASSecurityError = ASSecurityError;
      var ASSyntaxError = (function (_super) {
        __extends(ASSyntaxError, _super);
        function ASSyntaxError() {
          _super.apply(this, arguments);
        }
        return ASSyntaxError;
      })(ASError);
      AS.ASSyntaxError = ASSyntaxError;
      var ASTypeError = (function (_super) {
        __extends(ASTypeError, _super);
        function ASTypeError() {
          _super.apply(this, arguments);
        }
        return ASTypeError;
      })(ASError);
      AS.ASTypeError = ASTypeError;
      var ASURIError = (function (_super) {
        __extends(ASURIError, _super);
        function ASURIError() {
          _super.apply(this, arguments);
        }
        return ASURIError;
      })(ASError);
      AS.ASURIError = ASURIError;
      var ASVerifyError = (function (_super) {
        __extends(ASVerifyError, _super);
        function ASVerifyError() {
          _super.apply(this, arguments);
        }
        return ASVerifyError;
      })(ASError);
      AS.ASVerifyError = ASVerifyError;
      var ASUninitializedError = (function (_super) {
        __extends(ASUninitializedError, _super);
        function ASUninitializedError() {
          _super.apply(this, arguments);
        }
        return ASUninitializedError;
      })(ASError);
      AS.ASUninitializedError = ASUninitializedError;
      var ASArgumentError = (function (_super) {
        __extends(ASArgumentError, _super);
        function ASArgumentError() {
          _super.apply(this, arguments);
        }
        return ASArgumentError;
      })(ASError);
      AS.ASArgumentError = ASArgumentError;

      var ASRegExp = (function (_super) {
        __extends(ASRegExp, _super);
        function ASRegExp() {
          _super.apply(this, arguments);
        }
        Object.defineProperty(ASRegExp.prototype, "native_source", {
          get: function () {
            var self = this;
            return self.source;
          },
          enumerable: true,
          configurable: true
        });

        Object.defineProperty(ASRegExp.prototype, "native_global", {
          get: function () {
            var self = this;
            return self.global;
          },
          enumerable: true,
          configurable: true
        });

        Object.defineProperty(ASRegExp.prototype, "native_ignoreCase", {
          get: function () {
            var self = this;
            return self.ignoreCase;
          },
          enumerable: true,
          configurable: true
        });

        Object.defineProperty(ASRegExp.prototype, "native_multiline", {
          get: function () {
            var self = this;
            return self.multiline;
          },
          enumerable: true,
          configurable: true
        });

        Object.defineProperty(ASRegExp.prototype, "native_lastIndex", {
          get: function () {
            var self = this;
            return self.lastIndex;
          },
          set: function (i) {
            var self = this;
            i = i | 0;
            self.lastIndex = i;
          },
          enumerable: true,
          configurable: true
        });


        Object.defineProperty(ASRegExp.prototype, "native_dotall", {
          get: function () {
            var self = this;
            return self.dotall;
          },
          enumerable: true,
          configurable: true
        });

        Object.defineProperty(ASRegExp.prototype, "native_extended", {
          get: function () {
            var self = this;
            return self.extended;
          },
          enumerable: true,
          configurable: true
        });

        ASRegExp.prototype.exec = function (s) {
          if (typeof s === "undefined") { s = ""; }
          var result = RegExp.prototype.exec.apply(this, arguments);
          if (!result) {
            return result;
          }

          var keys = Object.keys(result);
          for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (!Shumway.isNumeric(k)) {
              if (result[k] === undefined) {
                result[k] = "";
              }
            }
          }
          Shumway.AVM2.Runtime.publicizeProperties(result);
          return result;
        };
        ASRegExp.instanceConstructor = AVM2.XRegExp;
        ASRegExp.staticNatives = [AVM2.XRegExp];
        ASRegExp.instanceNatives = [AVM2.XRegExp.prototype];
        return ASRegExp;
      })(ASObject);
      AS.ASRegExp = ASRegExp;

      var ASMath = (function (_super) {
        __extends(ASMath, _super);
        function ASMath() {
          _super.apply(this, arguments);
        }
        ASMath.staticNatives = [Math];
        return ASMath;
      })(ASNative);
      AS.ASMath = ASMath;

      var ASDate = (function (_super) {
        __extends(ASDate, _super);
        function ASDate() {
          _super.apply(this, arguments);
        }
        ASDate.staticNatives = [Date];
        ASDate.instanceNatives = [Date.prototype];
        ASDate.instanceConstructor = Date;
        return ASDate;
      })(ASNative);
      AS.ASDate = ASDate;

      var builtinNativeClasses = Shumway.ObjectUtilities.createMap();

      var isInitialized = false;

      function initialize(domain) {
        if (isInitialized) {
          return;
        }

        builtinNativeClasses["ObjectClass"] = ASObject;
        builtinNativeClasses["Class"] = ASClass;
        builtinNativeClasses["FunctionClass"] = ASFunction;
        builtinNativeClasses["BooleanClass"] = ASBoolean;
        builtinNativeClasses["MethodClosureClass"] = ASMethodClosure;
        builtinNativeClasses["NamespaceClass"] = AS.ASNamespace;
        builtinNativeClasses["NumberClass"] = ASNumber;
        builtinNativeClasses["IntClass"] = ASInt;
        builtinNativeClasses["UIntClass"] = ASUint;
        builtinNativeClasses["StringClass"] = ASString;
        builtinNativeClasses["ArrayClass"] = ASArray;
        builtinNativeClasses["VectorClass"] = ASVector;
        builtinNativeClasses["ObjectVectorClass"] = AS.GenericVector;
        builtinNativeClasses["IntVectorClass"] = ASIntVector;
        builtinNativeClasses["UIntVectorClass"] = ASUIntVector;
        builtinNativeClasses["DoubleVectorClass"] = ASDoubleVector;
        builtinNativeClasses["JSONClass"] = ASJSON;
        builtinNativeClasses["XMLClass"] = AS.ASXML;
        builtinNativeClasses["XMLListClass"] = AS.ASXMLList;
        builtinNativeClasses["QNameClass"] = AS.ASQName;

        builtinNativeClasses["ErrorClass"] = ASError;
        builtinNativeClasses["DefinitionErrorClass"] = ASDefinitionError;
        builtinNativeClasses["EvalErrorClass"] = ASEvalError;
        builtinNativeClasses["RangeErrorClass"] = ASRangeError;
        builtinNativeClasses["ReferenceErrorClass"] = ASReferenceError;
        builtinNativeClasses["SecurityErrorClass"] = ASSecurityError;
        builtinNativeClasses["SyntaxErrorClass"] = ASSyntaxError;
        builtinNativeClasses["TypeErrorClass"] = ASTypeError;
        builtinNativeClasses["URIErrorClass"] = ASURIError;
        builtinNativeClasses["VerifyErrorClass"] = ASVerifyError;
        builtinNativeClasses["UninitializedErrorClass"] = ASUninitializedError;
        builtinNativeClasses["ArgumentErrorClass"] = ASArgumentError;

        builtinNativeClasses["DateClass"] = ASDate;
        builtinNativeClasses["MathClass"] = ASMath;

        builtinNativeClasses["RegExpClass"] = ASRegExp;

        builtinNativeClasses["ProxyClass"] = AS.flash.utils.OriginalProxy;
        builtinNativeClasses["DictionaryClass"] = AS.flash.utils.OriginalDictionary;
        builtinNativeClasses["ByteArrayClass"] = AS.flash.utils.OriginalByteArray;

        builtinNativeClasses["SystemClass"] = AS.flash.system.OriginalSystem;

        isInitialized = true;
      }
      AS.initialize = initialize;

      var nativeClasses = Shumway.ObjectUtilities.createMap();
      var nativeFunctions = Shumway.ObjectUtilities.createMap();

      function registerNativeClass(name, cls) {
        release || assert(!nativeClasses[name], "Native class: " + name + " is already registered.");
        nativeClasses[name] = cls;
      }
      AS.registerNativeClass = registerNativeClass;

      function registerNativeFunction(name, fn) {
        release || assert(!nativeFunctions[name], "Native function: " + name + " is already registered.");
        nativeFunctions[name] = fn;
      }
      AS.registerNativeFunction = registerNativeFunction;

      function createInterface(classInfo) {
        var ii = classInfo.instanceInfo;
        release || assert(ii.isInterface());
        var cls = new ASClass(classInfo);
        cls.interfaceBindings = new InstanceBindings(null, ii, null, null);
        cls.verify();
        return cls;
      }
      AS.createInterface = createInterface;

      var morphPatchList = [];

      function createClass(classInfo, baseClass, scope) {
        var ci = classInfo;
        var ii = ci.instanceInfo;
        var domain = ci.abc.applicationDomain;
        var isNativeClass = ci.native;
        var cls;
        if (isNativeClass) {
          cls = builtinNativeClasses[ci.native.cls];
          if (!cls) {
            cls = nativeClasses[ci.native.cls];
          }
          if (!cls) {
            Shumway.Debug.unexpected("No native class for " + ci.native.cls);
          }
          cls.morphIntoASClass(classInfo);
          if (morphPatchList) {
            morphPatchList.push(cls);
          }
        } else {
          cls = new ASClass(classInfo);
        }

        var classScope = new Scope(scope, null);
        classScope.object = cls;
        var instanceConstructor = null;
        if (ii.init.isNative()) {
          release || assert(isNativeClass);
          instanceConstructor = cls;
        } else {
          instanceConstructor = createFunction(ii.init, classScope, false);
        }

        var staticNatives = null;
        var instanceNatives = null;

        if (isNativeClass) {
          staticNatives = [cls];
          if (cls.staticNatives) {
            Shumway.ArrayUtilities.pushMany(staticNatives, cls.staticNatives);
          }
          instanceNatives = [cls.prototype];
          if (cls.instanceNatives) {
            Shumway.ArrayUtilities.pushMany(instanceNatives, cls.instanceNatives);
          }
        }

        ASClass.create(cls, baseClass, instanceConstructor);
        release || cls.verify();

        if (classInfo.instanceInfo.name.name === "Class") {
          for (var i = 0; i < morphPatchList.length; i++) {
            morphPatchList[i].__proto__ = ASClass.prototype;
          }
          morphPatchList = null;
        }

        AVM2.enterTimeline("ClassBindings");
        cls.classBindings = new ClassBindings(classInfo, classScope, staticNatives);
        AVM2.enterTimeline("applyTo");
        cls.classBindings.applyTo(domain, cls);
        AVM2.leaveTimeline();
        AVM2.leaveTimeline();

        AVM2.enterTimeline("InstanceBindings");
        cls.instanceBindings = new InstanceBindings(baseClass ? baseClass.instanceBindings : null, ii, classScope, instanceNatives);
        if (cls.instanceConstructor) {
          AVM2.enterTimeline("applyTo");
          cls.instanceBindings.applyTo(domain, cls.traitsPrototype);
          AVM2.leaveTimeline();
        }
        AVM2.leaveTimeline();

        cls.implementedInterfaces = cls.instanceBindings.implementedInterfaces;

        if (cls === ASClass) {
          cls.instanceBindings.applyTo(domain, ASObject, true);
        } else if (ASClass.instanceBindings) {
          ASClass.instanceBindings.applyTo(domain, cls, true);
        }

        AVM2.enterTimeline("Configure");
        ASClass.configureInitializers(cls);
        ASClass.linkSymbols(cls);
        ASClass.runClassInitializer(cls);
        AVM2.leaveTimeline();

        return cls;
      }
      AS.createClass = createClass;

      var illegalAS3Functions = [
        Runtime.forwardValueOf,
        Runtime.forwardToString
      ];

      function getMethodOrAccessorNative(trait, natives) {
        var name = escapeNativeName(Multiname.getName(trait.name));
        log("getMethodOrAccessorNative(" + name + ")");
        for (var i = 0; i < natives.length; i++) {
          var native = natives[i];
          var fullName = name;

          if (hasOwnProperty(native, "original_" + name)) {
            fullName = "original_" + name;
          }

          if (!hasOwnProperty(native, name) && hasOwnProperty(native, "native_" + name)) {
            fullName = "native_" + name;
          }
          if (hasOwnProperty(native, fullName)) {
            var value;
            if (trait.isAccessor()) {
              var pd = getOwnPropertyDescriptor(native, fullName);
              if (trait.isGetter()) {
                value = pd.get;
              } else {
                value = pd.set;
              }
            } else {
              release || assert(trait.isMethod());
              value = native[fullName];
            }
            release || assert(value, "Method or Accessor property exists but it's undefined: " + trait);
            release || assert(illegalAS3Functions.indexOf(value) < 0, "Leaking illegal function.");
            return value;
          }
        }
        log("Cannot find " + trait + " in natives.");
        return null;
      }
      AS.getMethodOrAccessorNative = getMethodOrAccessorNative;

      function escapeNativeName(name) {
        switch (name) {
          case "prototype":
            return "native_prototype";
          case "hasOwnProperty":
            return "native_hasOwnProperty";
          case "isPrototypeOf":
            return "native_isPrototypeOf";
          case "propertyIsEnumerable":
            return "native_propertyIsEnumerable";
          default:
            return name;
        }
      }
      AS.escapeNativeName = escapeNativeName;

      (function (Natives) {
        Natives.String = jsGlobal.String;
        Natives.Function = jsGlobal.Function;
        Natives.Boolean = jsGlobal.Boolean;
        Natives.Number = jsGlobal.Number;
        Natives.Date = jsGlobal.Date;
        Natives.ASObject = Shumway.AVM2.AS.ASObject;

        function makeOriginalPrototype(constructor) {
          var o = { prototype: createEmptyObject() };
          var keys = Object.getOwnPropertyNames(constructor.prototype);
          for (var i = 0; i < keys.length; i++) {
            o.prototype[keys[i]] = constructor.prototype[keys[i]];
          }
          return o;
        }

        Natives.Original = {
          Date: makeOriginalPrototype(Natives.Date),
          Array: makeOriginalPrototype(Array),
          String: makeOriginalPrototype(Natives.String),
          Number: makeOriginalPrototype(Natives.Number),
          Boolean: makeOriginalPrototype(Natives.Boolean)
        };

        function print() {
          var args = [];
          for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
          }
          jsGlobal.print.apply(null, args);
        }
        Natives.print = print;

        function notImplemented(v) {
          _notImplemented(v);
        }
        Natives.notImplemented = notImplemented;

        function debugBreak(v) {
          debugger;
        }
        Natives.debugBreak = debugBreak;

        function bugzilla(n) {
          switch (n) {
            case 574600:
              return true;
          }
          return false;
        }
        Natives.bugzilla = bugzilla;

        Natives.decodeURI = jsGlobal.decodeURI;
        Natives.decodeURIComponent = jsGlobal.decodeURIComponent;
        Natives.encodeURI = jsGlobal.encodeURI;
        Natives.encodeURIComponent = jsGlobal.encodeURIComponent;
        Natives.isNaN = jsGlobal.isNaN;
        Natives.isFinite = jsGlobal.isFinite;
        Natives.parseInt = jsGlobal.parseInt;
        Natives.parseFloat = jsGlobal.parseFloat;
        Natives.escape = jsGlobal.escape;
        Natives.unescape = jsGlobal.unescape;
        Natives.isXMLName = typeof (Natives.isXMLName) !== "undefined" ? jsGlobal.isXMLName : function () {
          notImplemented("Chrome doesn't support isXMLName.");
        };

        function getQualifiedClassName(value) {
          if (value === null) {
            return "null";
          } else if (value === undefined) {
            return "void";
          }
          if (ASInt.isType(value)) {
            return "int";
          }
          value = boxValue(value);
          if (ASClass.isType(value)) {
            return value.getQualifiedClassName();
          }
          return value.class.getQualifiedClassName();
        }
        Natives.getQualifiedClassName = getQualifiedClassName;

        function getQualifiedSuperclassName(value) {
          if (isNullOrUndefined(value)) {
            return "null";
          }
          value = boxValue(value);
          var cls = ASClass.isType(value) ? value : value.class;
          if (!cls.baseClass) {
            return "null";
          }
          return cls.baseClass.getQualifiedClassName();
        }
        Natives.getQualifiedSuperclassName = getQualifiedSuperclassName;

        function getDefinitionByName(name) {
          var simpleName = Natives.String(name).replace("::", ".");
          var cls = Shumway.AVM2.Runtime.AVM2.currentDomain().getClass(simpleName, false);
          return cls || null;
        }
        Natives.getDefinitionByName = getDefinitionByName;

        function describeTypeJSON(value, flags) {
          return Shumway.AVM2.AS.describeTypeJSON(value, flags);
        }
        Natives.describeTypeJSON = describeTypeJSON;
      })(AS.Natives || (AS.Natives = {}));
      var Natives = AS.Natives;

      function getNative(path) {
        log("getNative(" + path + ")");
        var chain = path.split(".");
        var v = Natives;
        for (var i = 0, j = chain.length; i < j; i++) {
          v = v && v[chain[i]];
        }

        if (!v) {
          v = nativeFunctions[path];
        }

        release || assert(v, "getNative(" + path + ") not found.");
        release || assert(illegalAS3Functions.indexOf(v) < 0, "Leaking illegal function.");
        return v;
      }
      AS.getNative = getNative;

      registerNativeFunction("unsafeJSNative", getNative);
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var checkArguments = true;

      var assert = Shumway.Debug.assert;
      var assertNotImplemented = Shumway.Debug.assertNotImplemented;

      var throwError = Shumway.AVM2.Runtime.throwError;
      var clamp = Shumway.NumberUtilities.clamp;
      var asCheckVectorGetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorGetNumericProperty;
      var asCheckVectorSetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorSetNumericProperty;

      var arraySort = Shumway.AVM2.AS.arraySort;

      var GenericVector = (function (_super) {
        __extends(GenericVector, _super);
        function GenericVector(length, fixed, type) {
          false && _super.call(this);
          length = length >>> 0;
          fixed = !!fixed;
          this._fixed = !!fixed;
          this._buffer = new Array(length);
          this._type = type;
          this._defaultValue = type ? type.defaultValue : null;
          this._fill(0, length, this._defaultValue);
        }
        GenericVector.defaultCompareFunction = function (a, b) {
          return String(a).localeCompare(String(b));
        };

        GenericVector.compare = function (a, b, options, compareFunction) {
          release || assertNotImplemented(!(options & GenericVector.CASEINSENSITIVE), "CASEINSENSITIVE");
          release || assertNotImplemented(!(options & GenericVector.UNIQUESORT), "UNIQUESORT");
          release || assertNotImplemented(!(options & GenericVector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
          var result = 0;
          if (!compareFunction) {
            compareFunction = GenericVector.defaultCompareFunction;
          }
          if (options & GenericVector.NUMERIC) {
            a = Shumway.toNumber(a);
            b = Shumway.toNumber(b);
            result = a < b ? -1 : (a > b ? 1 : 0);
          } else {
            result = compareFunction(a, b);
          }
          if (options & GenericVector.DESCENDING) {
            result *= -1;
          }
          return result;
        };

        GenericVector._every = function (o, callback, thisObject) {
          return o.every(callback, thisObject);
        };

        GenericVector._forEach = function (o, callback, thisObject) {
          return o.forEach(callback, thisObject);
        };

        GenericVector._some = function (o, callback, thisObject) {
          return o.some(callback, thisObject);
        };

        GenericVector.applyType = function (type) {
          function parameterizedVectorConstructor(length, fixed) {
            Function.prototype.call.call(GenericVector.instanceConstructor, this, length, fixed, type);
          }
          ;

          function parameterizedVectorCallableConstructor(object) {
            if (object instanceof AS.Int32Vector) {
              return object;
            }
            var length = object.asGetProperty(undefined, "length");
            if (length !== undefined) {
              var v = new parameterizedVectorConstructor(length, false);
              for (var i = 0; i < length; i++) {
                v.asSetNumericProperty(i, object.asGetPublicProperty(i));
              }
              return v;
            }
            Shumway.Debug.unexpected();
          }

          var parameterizedVector = parameterizedVectorConstructor;
          parameterizedVector.prototype = GenericVector.prototype;
          parameterizedVector.instanceConstructor = parameterizedVector;
          parameterizedVector.callableConstructor = parameterizedVectorCallableConstructor;
          parameterizedVector.__proto__ = GenericVector;
          return parameterizedVector;
        };

        GenericVector.prototype._fill = function (index, length, value) {
          for (var i = 0; i < length; i++) {
            this._buffer[index + i] = value;
          }
        };

        GenericVector.prototype.toString = function () {
          var str = "";
          for (var i = 0; i < this._buffer.length; i++) {
            str += this._buffer[i];
            if (i < this._buffer.length - 1) {
              str += ",";
            }
          }
          return str;
        };

        GenericVector.prototype.every = function (callback, thisObject) {
          for (var i = 0; i < this._buffer.length; i++) {
            if (!callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              return false;
            }
          }
          return true;
        };

        GenericVector.prototype.filter = function (callback, thisObject) {
          var v = new GenericVector(0, false, this._type);
          for (var i = 0; i < this._buffer.length; i++) {
            if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              v.push(this.asGetNumericProperty(i));
            }
          }
          return v;
        };

        GenericVector.prototype.some = function (callback, thisObject) {
          if (arguments.length !== 2) {
            throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError);
          } else if (!Shumway.isFunction(callback)) {
            throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError);
          }
          for (var i = 0; i < this._buffer.length; i++) {
            if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
              return true;
            }
          }
          return false;
        };

        GenericVector.prototype.forEach = function (callback, thisObject) {
          if (!Shumway.isFunction(callback)) {
            throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError);
          }
          for (var i = 0; i < this._buffer.length; i++) {
            callback.call(thisObject, this.asGetNumericProperty(i), i, this);
          }
        };

        GenericVector.prototype.map = function (callback, thisObject) {
          if (!Shumway.isFunction(callback)) {
            throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError);
          }
          var v = new GenericVector(0, false, this._type);
          for (var i = 0; i < this._buffer.length; i++) {
            v.push(callback.call(thisObject, this.asGetNumericProperty(i), i, this));
          }
          return v;
        };

        GenericVector.prototype.push = function () {
          var args = [];
          for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
          }
          this._checkFixed();
          for (var i = 0; i < arguments.length; i++) {
            this._buffer.push(this._coerce(arguments[i]));
          }
        };

        GenericVector.prototype.pop = function () {
          this._checkFixed();
          if (this._buffer.length === 0) {
            return undefined;
          }
          return this._buffer.pop();
        };

        GenericVector.prototype.reverse = function () {
          this._buffer.reverse();
        };

        GenericVector.prototype.sort = function (comparator) {
          return this._buffer.sort(comparator);
        };

        GenericVector.prototype.asGetNumericProperty = function (i) {
          checkArguments && asCheckVectorGetNumericProperty(i, this._buffer.length);
          return this._buffer[i];
        };

        GenericVector.prototype._coerce = function (v) {
          if (this._type) {
            return this._type.coerce(v);
          } else if (v === undefined) {
            return null;
          }
          return v;
        };

        GenericVector.prototype.asSetNumericProperty = function (i, v) {
          checkArguments && asCheckVectorSetNumericProperty(i, this._buffer.length, this._fixed);
          this._buffer[i] = this._coerce(v);
        };

        GenericVector.prototype.shift = function () {
          this._checkFixed();
          if (this._buffer.length === 0) {
            return undefined;
          }
          return this._buffer.shift();
        };

        GenericVector.prototype._checkFixed = function () {
          if (this._fixed) {
            throwError("RangeError", AVM2.Errors.VectorFixedError);
          }
        };

        GenericVector.prototype.unshift = function () {
          if (!arguments.length) {
            return;
          }
          this._checkFixed();
          var items = [];
          for (var i = 0; i < arguments.length; i++) {
            items.push(this._coerce(arguments[i]));
          }
          this._buffer.unshift.apply(this._buffer, items);
        };

        Object.defineProperty(GenericVector.prototype, "length", {
          get: function () {
            return this._buffer.length;
          },
          set: function (value) {
            value = value >>> 0;
            if (value > this._buffer.length) {
              for (var i = this._buffer.length; i < value; i++) {
                this._buffer[i] = this._defaultValue;
              }
            } else {
              this._buffer.length = value;
            }
            release || assert(this._buffer.length === value);
          },
          enumerable: true,
          configurable: true
        });



        Object.defineProperty(GenericVector.prototype, "fixed", {
          get: function () {
            return this._fixed;
          },
          set: function (f) {
            this._fixed = !!f;
          },
          enumerable: true,
          configurable: true
        });

        GenericVector.prototype._spliceHelper = function (index, insertCount, deleteCount, args, offset) {
          insertCount = clamp(insertCount, 0, args.length - offset);
          deleteCount = clamp(deleteCount, 0, this._buffer.length - index);
          var items = [];
          for (var i = 0; i < insertCount; i++) {
            items.push(this._coerce(args.asGetNumericProperty(offset + i)));
          }
          this._buffer.splice.apply(this._buffer, [index, deleteCount].concat(items));
        };

        GenericVector.prototype.asNextName = function (index) {
          return index - 1;
        };

        GenericVector.prototype.asNextValue = function (index) {
          return this._buffer[index - 1];
        };

        GenericVector.prototype.asNextNameIndex = function (index) {
          var nextNameIndex = index + 1;
          if (nextNameIndex <= this._buffer.length) {
            return nextNameIndex;
          }
          return 0;
        };

        GenericVector.prototype.asHasProperty = function (namespaces, name, flags) {
          if (GenericVector.prototype === this || !Shumway.isNumeric(name)) {
            return Object.prototype.asHasProperty.call(this, namespaces, name, flags);
          }
          var index = Shumway.toNumber(name);
          return index >= 0 && index < this._buffer.length;
        };

        GenericVector.prototype.asHasNext2 = function (hasNext2Info) {
          hasNext2Info.index = this.asNextNameIndex(hasNext2Info.index);
        };
        GenericVector.CASEINSENSITIVE = 1;
        GenericVector.DESCENDING = 2;
        GenericVector.UNIQUESORT = 4;
        GenericVector.RETURNINDEXEDARRAY = 8;
        GenericVector.NUMERIC = 16;

        GenericVector.instanceConstructor = GenericVector;
        GenericVector.staticNatives = [GenericVector];
        GenericVector.instanceNatives = [GenericVector.prototype, AS.ASVector.prototype];

        GenericVector._sort = arraySort;
        return GenericVector;
      })(AS.ASVector);
      AS.GenericVector = GenericVector;

      GenericVector.prototype._reverse = GenericVector.prototype.reverse;
      GenericVector.prototype._filter = GenericVector.prototype.filter;
      GenericVector.prototype._map = GenericVector.prototype.map;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var assert = Shumway.Debug.assert;
      var Multiname = Shumway.AVM2.ABC.Multiname;
      var notImplemented = Shumway.Debug.notImplemented;

      var _asGetProperty = Object.prototype.asGetProperty;
      var _asSetProperty = Object.prototype.asSetProperty;
      var _asCallProperty = Object.prototype.asCallProperty;
      var _asHasProperty = Object.prototype.asHasProperty;
      var _asHasOwnProperty = Object.prototype.asHasOwnProperty;
      var _asHasTraitProperty = Object.prototype.asHasTraitProperty;
      var _asDeleteProperty = Object.prototype.asDeleteProperty;
      var _asGetEnumerableKeys = Object.prototype.asGetEnumerableKeys;

      function isXMLType(val) {
        return (val instanceof ASXML || val instanceof ASXMLList);
      }

      function toString(node) {
        if (typeof node === "object" && node !== null) {
          if (node instanceof ASXMLList) {
            return node._children.map(toString).join('');
          }
          switch (node._kind) {
            case 3 /* Text */:
            case 2 /* Attribute */:
              return node._value;
            default:
              if (node.hasSimpleContent()) {
                return node._children.map(toString).join('');
              }
              return toXMLString(node);
          }
        } else {
          return String(node);
        }
      }

      function escapeElementValue(s) {
        var i = 0, ch;
        while (i < s.length && (ch = s[i]) !== '&' && ch !== '<' && ch !== '>') {
          i++;
        }
        if (i >= s.length) {
          return s;
        }
        var buf = s.substring(0, i);
        while (i < s.length) {
          ch = s[i++];
          switch (ch) {
            case '&':
              buf += '&amp;';
              break;
            case '<':
              buf += '&lt;';
              break;
            case '>':
              buf += '&gt;';
              break;
            default:
              buf += ch;
              break;
          }
        }
        return buf;
      }

      function escapeAttributeValue(s) {
        var i = 0, ch;
        while (i < s.length && (ch = s[i]) !== '&' && ch !== '<' && ch !== '\"' && ch !== '\n' && ch !== '\r' && ch !== '\t') {
          i++;
        }
        if (i >= s.length) {
          return s;
        }
        var buf = s.substring(0, i);
        while (i < s.length) {
          ch = s[i++];
          switch (ch) {
            case '&':
              buf += '&amp;';
              break;
            case '<':
              buf += '&lt;';
              break;
            case '\"':
              buf += '&quot;';
              break;
            case '\n':
              buf += '&#xA;';
              break;
            case '\r':
              buf += '&#xD;';
              break;
            case '\t':
              buf += '&#x9;';
              break;
            default:
              buf += ch;
              break;
          }
        }
        return buf;
      }

      function isWhitespace(s, index) {
        var ch = s[index];
        return ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t';
      }

      function trimWhitespaces(s) {
        var i = 0;
        while (i < s.length && isWhitespace(s, i)) {
          i++;
        }
        if (i >= s.length) {
          return '';
        }
        var j = s.length - 1;
        while (isWhitespace(s, j)) {
          j--;
        }
        return i === 0 && j === s.length - 1 ? s : s.substring(i, j + 1);
      }

      var indentStringCache = [];
      function getIndentString(indent) {
        if (indent > 0) {
          if (indentStringCache[indent] !== undefined) {
            return indentStringCache[indent];
          }
          var s = '';
          for (var i = 0; i < indent; i++) {
            s += ' ';
          }
          indentStringCache[indent] = s;
          return s;
        }
        return '';
      }

      function generateUniquePrefix(namespaces) {
        var i = 1, newPrefix;
        while (true) {
          newPrefix = '_ns' + i;
          if (!namespaces.some(function (ns) {
            return ns.prefix == newPrefix;
          })) {
            break;
          }
          i++;
        }
        return newPrefix;
      }

      function toXMLString(node, ancestorNamespaces, indentLevel) {
        if (node === null || node === undefined) {
          throw new TypeError();
        }
        if (!(node instanceof ASXML)) {
          if (node instanceof ASXMLList) {
            return node._children.map(function (childNode) {
              return toXMLString(childNode, ancestorNamespaces);
            }).join(ASXML.prettyPrinting ? '\n' : '');
          }
          return escapeElementValue(String(node));
        }

        var prettyPrinting = ASXML.prettyPrinting;

        indentLevel |= 0;
        var s = prettyPrinting ? getIndentString(indentLevel) : '';

        var kind = node._kind;
        switch (kind) {
          case 3 /* Text */:
            return prettyPrinting ? s + escapeElementValue(trimWhitespaces(node._value)) : escapeElementValue(node._value);

          case 2 /* Attribute */:
            return s + escapeAttributeValue(node._value);

          case 4 /* Comment */:
            return s + '<!--' + node._value + '-->';

          case 5 /* ProcessingInstruction */:
            return s + '<?' + node._name.localName + ' ' + node._value + '?>';
          default:
            release || assert(kind === 1 /* Element */);
            break;
        }

        ancestorNamespaces = ancestorNamespaces || [];
        var namespaceDeclarations = [];

        for (var i = 0; i < node._inScopeNamespaces.length; i++) {
          var nsPrefix = node._inScopeNamespaces[i].prefix;
          var nsUri = node._inScopeNamespaces[i].uri;
          if (ancestorNamespaces.every(function (ans) {
            return ans.uri != nsUri || ans.prefix != nsPrefix;
          })) {
            var ns1 = new ASNamespace(nsPrefix, nsUri);
            namespaceDeclarations.push(ns1);
          }
        }

        var currentNamespaces = ancestorNamespaces.concat(namespaceDeclarations);
        var namespace = node._name.getNamespace(currentNamespaces);
        if (namespace.prefix === undefined) {
          var newPrefix = generateUniquePrefix(currentNamespaces);
          var ns2 = new ASNamespace(newPrefix, namespace.uri);

          namespaceDeclarations.push(ns2);
          currentNamespaces.push(ns2);
        }

        var elementName = (namespace.prefix ? namespace.prefix + ':' : '') + node._name.localName;
        s += '<' + elementName;

        node._attributes.forEach(function (attr) {
          var name = attr._name;
          var namespace = name.getNamespace(currentNamespaces);
          if (namespace.prefix === undefined) {
            var newPrefix = generateUniquePrefix(currentNamespaces);
            var ns2 = new ASNamespace(newPrefix, namespace.uri);

            namespaceDeclarations.push(ns2);
            currentNamespaces.push(ns2);
          }
        });

        for (var i = 0; i < namespaceDeclarations.length; i++) {
          var namespace = namespaceDeclarations[i];
          var attributeName = namespace.prefix ? 'xmlns:' + namespace.prefix : 'xmlns';
          s += ' ' + attributeName + '=\"' + escapeAttributeValue(namespace.uri) + '\"';
        }
        node._attributes.forEach(function (attr) {
          var name = attr._name;
          var namespace = name.getNamespace(ancestorNamespaces);
          var attributeName = namespace.prefix ? namespace.prefix + ':' + name.localName : name.localName;
          s += ' ' + attributeName + '=\"' + escapeAttributeValue(attr._value) + '\"';
        });

        if (node._children.length === 0) {
          s += '/>';

          return s;
        }

        s += '>';

        var indentChildren = node._children.length > 1 || (node._children.length === 1 && node._children[0]._kind !== 3 /* Text */);
        var nextIndentLevel = (prettyPrinting && indentChildren) ? indentLevel + ASXML.prettyIndent : 0;

        node._children.forEach(function (childNode, i) {
          if (prettyPrinting && indentChildren) {
            s += '\n';
          }
          var child = toXMLString(childNode, currentNamespaces, nextIndentLevel);
          s += child;
        });
        if (prettyPrinting && indentChildren) {
          s += '\n' + getIndentString(indentLevel);
        }

        s += '</' + elementName + '>';
        return s;
      }

      function toXML(v) {
        if (v === null) {
          throw new TypeError(AVM2.formatErrorMessage(AVM2.Errors.ConvertNullToObjectError));
        } else if (v === undefined) {
          throw new TypeError(AVM2.formatErrorMessage(AVM2.Errors.ConvertUndefinedToObjectError));
        } else if (v instanceof ASXML) {
          return v;
        } else if (v instanceof ASXMLList) {
          if (v.length() === 1) {
            return v._children[0];
          }
          throw new TypeError(AVM2.formatErrorMessage(AVM2.Errors.XMLMarkupMustBeWellFormed));
        } else {
          var x = xmlParser.parseFromString(String(v));
          if (x.length() === 0) {
            var x = new XML(3 /* Text */);
            return x;
          } else if (x.length() === 1) {
            x._children[0]._parent = null;
            return x._children[0];
          }
          throw "SyntaxError in ToXML";
        }
      }

      function toXMLList(value) {
        if (value === null) {
          throw new TypeError(AVM2.formatErrorMessage(AVM2.Errors.ConvertNullToObjectError));
        } else if (value === undefined) {
          throw new TypeError(AVM2.formatErrorMessage(AVM2.Errors.ConvertUndefinedToObjectError));
        } else if (value instanceof XML) {
          var xl = new XMLList(value.parent, value.name);
          xl.appendChild(value);
          return xl;
        } else if (value instanceof XMLList) {
          return value;
        } else {
          var parentString = '<parent xmlns=\'' + ASXML.defaultNamespace + '\'>' + value + '</parent>';
          var x = toXML(parentString);
          var xl = new XMLList();
          for (var i = 0; i < x.length(); i++) {
            var v = x._children[i];
            v._parent = null;
            xl.appendChild(v);
          }
          return xl;
        }
      }

      function toAttributeName(v) {
        if (v === undefined || v === null || typeof v === "boolean" || typeof v === "number") {
          throw "TypeError: invalid operand to ToAttributeName()";
        } else if (isXMLType(v)) {
          v = toString(v);
        } else if (typeof v === 'object' && v !== null) {
          if (v instanceof ASQName) {
            return new ASQName(v.uri, v.localName, true);
          }
          if (Multiname.isQName(v)) {
            return ASQName.fromMultiname(v);
          }
          v = toString(v);
        }
        if (typeof v === "string") {
          var ns = Namespace.createNamespace("", "");
          var qn = new ASQName(ns, v, true);
        } else {
        }
        return qn;
      }

      function toXMLName(mn) {
        if (mn === undefined) {
          return new ASQName('*');
        }

        if (typeof mn === 'object' && mn !== null) {
          if (mn instanceof ASQName) {
            return mn;
          }
          if (Multiname.isQName(mn)) {
            return ASQName.fromMultiname(mn);
          }
          var name;
          if (mn instanceof ASXML || mn instanceof ASXMLList) {
            name = toString(mn);
          } else if (mn instanceof Multiname) {
            name = mn.name;
          } else {
            name = mn.toString();
          }
        } else if (typeof mn === 'string') {
          name = mn;
        } else {
          throw new TypeError();
        }

        if (name[0] === '@') {
          return toAttributeName(name.substring(1));
        }
        return new ASQName(name);
      }

      function isQNameAttribute(name) {
        if (typeof name === 'object' && (name instanceof ASQName)) {
          var flags = name._flags;
          return !!(flags & 1 /* ATTR_NAME */);
        }
        return false;
      }

      function prefixWithNamespace(namespaces, name, isAttribute) {
        if (!namespaces || namespaces.length !== 1 || !(namespaces[0] instanceof ASNamespace) || (typeof name !== 'string' && name !== undefined)) {
          return name;
        }
        return new ASQName(namespaces[0], name || '*', isAttribute);
      }

      function getDefaultNamespace() {
        return new ASNamespace("", ASXML.defaultNamespace);
      }

      function isXMLName(v) {
        try  {
          var qn = new ASQName(v);
        } catch (e) {
          return false;
        }

        return true;
      }

      function XMLParser() {
        function parseXml(s, sink) {
          var i = 0, scopes = [{
              namespaces: [],
              lookup: {
                "xmlns": 'http://www.w3.org/2000/xmlns/',
                "xml": 'http://www.w3.org/XML/1998/namespace'
              },
              inScopes: !ASXML.defaultNamespace ? [] : [{ uri: ASXML.defaultNamespace, prefix: '' }],
              space: 'default',
              xmlns: (ASXML.defaultNamespace || '')
            }];
          function resolveEntities(s) {
            return s.replace(/&([^;]+);/g, function (all, entity) {
              if (entity.substring(0, 2) === '#x') {
                return String.fromCharCode(parseInt(entity.substring(2), 16));
              } else if (entity.substring(0, 1) === '#') {
                return String.fromCharCode(parseInt(entity.substring(1), 10));
              }
              switch (entity) {
                case 'lt':
                  return '<';
                case 'gt':
                  return '>';
                case 'amp':
                  return '&';
                case 'quot':
                  return '\"';
              }

              return all;
            });
          }
          function isWhitespacePreserved() {
            for (var j = scopes.length - 1; j >= 0; --j) {
              if (scopes[j].space === "preserve") {
                return true;
              }
            }
            return false;
          }
          function lookupDefaultNs() {
            for (var j = scopes.length - 1; j >= 0; --j) {
              if ('xmlns' in scopes[j]) {
                return scopes[j].xmlns;
              }
            }
            return '';
          }
          function lookupNs(prefix) {
            for (var j = scopes.length - 1; j >= 0; --j) {
              if (prefix in scopes[j].lookup) {
                return scopes[j].lookup[prefix];
              }
            }
            return undefined;
          }
          function getName(name, resolveDefaultNs) {
            var j = name.indexOf(':');
            if (j >= 0) {
              var prefix = name.substring(0, j);
              var namespace = lookupNs(prefix);
              if (namespace === undefined) {
                throw "Unknown namespace: " + prefix;
              }
              var localName = name.substring(j + 1);
              return {
                name: namespace + '::' + localName,
                localName: localName,
                prefix: prefix,
                namespace: namespace
              };
            } else if (resolveDefaultNs) {
              return {
                name: name,
                localName: name,
                prefix: '',
                namespace: lookupDefaultNs()
              };
            } else {
              return {
                name: name,
                localName: name,
                prefix: '',
                namespace: ''
              };
            }
          }

          function parseContent(s, start) {
            var pos = start, name, attributes = [];
            function skipWs() {
              while (pos < s.length && isWhitespace(s, pos)) {
                ++pos;
              }
            }
            while (pos < s.length && !isWhitespace(s, pos) && s[pos] !== ">" && s[pos] !== "/") {
              ++pos;
            }
            name = s.substring(start, pos);
            skipWs();
            while (pos < s.length && s[pos] !== ">" && s[pos] !== "/" && s[pos] !== "?") {
              skipWs();
              var attrName = "", attrValue = "";
              while (pos < s.length && !isWhitespace(s, pos) && s[pos] !== "=") {
                attrName += s[pos];
                ++pos;
              }
              skipWs();
              if (s[pos] !== "=")
                throw "'=' expected";
              ++pos;
              skipWs();
              var attrEndChar = s[pos];
              if (attrEndChar !== "\"" && attrEndChar !== "\'")
                throw "Quote expected";
              var attrEndIndex = s.indexOf(attrEndChar, ++pos);
              if (attrEndIndex < 0)
                throw "Unexpected EOF[6]";
              attrValue = s.substring(pos, attrEndIndex);
              attributes.push({ name: attrName, value: resolveEntities(attrValue) });
              pos = attrEndIndex + 1;
              skipWs();
            }
            return { name: name, attributes: attributes, parsed: pos - start };
          }

          function parseProcessingInstruction(s, start) {
            var pos = start, name, value;
            function skipWs() {
              while (pos < s.length && isWhitespace(s, pos)) {
                ++pos;
              }
            }
            while (pos < s.length && !isWhitespace(s, pos) && s[pos] !== ">" && s[pos] !== "/") {
              ++pos;
            }
            name = s.substring(start, pos);
            skipWs();
            var attrStart = pos;
            while (pos < s.length && (s[pos] !== "?" || s[pos + 1] != '>')) {
              ++pos;
            }
            value = s.substring(attrStart, pos);
            return { name: name, value: value, parsed: pos - start };
          }

          while (i < s.length) {
            var ch = s[i];
            var j = i;
            if (ch === "<") {
              ++j;
              var ch2 = s[j], q, name;
              switch (ch2) {
                case "/":
                  ++j;
                  q = s.indexOf(">", j);
                  if (q < 0) {
                    throw "Unexpected EOF[1]";
                  }
                  name = getName(s.substring(j, q), true);
                  sink.endElement(name);
                  scopes.pop();
                  j = q + 1;
                  break;
                case "?":
                  ++j;
                  var pi = parseProcessingInstruction(s, j);
                  if (s.substring(j + pi.parsed, j + pi.parsed + 2) != "?>") {
                    throw "Unexpected EOF[2]";
                  }
                  sink.pi(pi.name, pi.value);
                  j += pi.parsed + 2;
                  break;
                case "!":
                  if (s.substring(j + 1, j + 3) === "--") {
                    q = s.indexOf("-->", j + 3);
                    if (q < 0) {
                      throw "Unexpected EOF[3]";
                    }
                    sink.comment(s.substring(j + 3, q));
                    j = q + 3;
                  } else if (s.substring(j + 1, j + 8) === "[CDATA[") {
                    q = s.indexOf("]]>", j + 8);
                    if (q < 0) {
                      throw "Unexpected EOF[4]";
                    }
                    sink.cdata(s.substring(j + 8, q));
                    j = q + 3;
                  } else if (s.substring(j + 1, j + 8) === "DOCTYPE") {
                    var q2 = s.indexOf("[", j + 8), complexDoctype = false;
                    q = s.indexOf(">", j + 8);
                    if (q < 0) {
                      throw "Unexpected EOF[5]";
                    }
                    if (q2 > 0 && q > q2) {
                      q = s.indexOf("]>", j + 8);
                      if (q < 0) {
                        throw "Unexpected EOF[7]";
                      }
                      complexDoctype = true;
                    }
                    var doctypeContent = s.substring(j + 8, q + (complexDoctype ? 1 : 0));
                    sink.doctype(doctypeContent);

                    j = q + (complexDoctype ? 2 : 1);
                  } else {
                    throw "Unknown !tag";
                  }
                  break;
                default:
                  var content = parseContent(s, j);
                  var isClosed = false;
                  if (s.substring(j + content.parsed, j + content.parsed + 2) === "/>") {
                    isClosed = true;
                  } else if (s.substring(j + content.parsed, j + content.parsed + 1) !== ">") {
                    throw "Unexpected EOF[2]";
                  }
                  var scope = { namespaces: [], lookup: Object.create(null) };
                  var contentAttributes = content.attributes;
                  for (q = 0; q < contentAttributes.length; ++q) {
                    var attribute = contentAttributes[q];
                    var attributeName = attribute.name;
                    if (attributeName.substring(0, 6) === "xmlns:") {
                      var prefix = attributeName.substring(6);
                      var uri = attribute.value;
                      if (lookupNs(prefix) !== uri) {
                        scope.lookup[prefix] = trimWhitespaces(uri);
                        scope.namespaces.push({ uri: uri, prefix: prefix });
                      }
                      delete contentAttributes[q];
                    } else if (attributeName === "xmlns") {
                      var uri = attribute.value;
                      if (lookupDefaultNs() !== uri) {
                        scope["xmlns"] = trimWhitespaces(uri);
                        scope.namespaces.push({ uri: uri, prefix: '' });
                      }
                      delete contentAttributes[q];
                    } else if (attributeName.substring(0, 4) === "xml:") {
                      var xmlAttrName = attributeName.substring(4);
                      if (xmlAttrName !== 'space' && xmlAttrName !== 'lang' && xmlAttrName !== 'base') {
                        throw "Invalid xml attribute: " + attributeName;
                      }
                      scope[xmlAttrName] = trimWhitespaces(attribute.value);
                    } else if (attributeName.substring(0, 3) === "xml") {
                      throw "Invalid xml attribute";
                    } else {
                    }
                  }

                  var inScopeNamespaces = [];
                  scope.namespaces.forEach(function (ns) {
                    if (!ns.prefix || scope.lookup[ns.prefix] === ns.uri) {
                      inScopeNamespaces.push(ns);
                    }
                  });
                  scopes[scopes.length - 1].inScopes.forEach(function (ns) {
                    if ((ns.prefix && !(ns.prefix in scope.lookup)) || (!ns.prefix && !('xmlns' in scope))) {
                      inScopeNamespaces.push(ns);
                    }
                  });
                  scope.inScopes = inScopeNamespaces;

                  scopes.push(scope);
                  var attributes = [];
                  for (q = 0; q < contentAttributes.length; ++q) {
                    attribute = contentAttributes[q];
                    if (attribute) {
                      attributes.push({ name: getName(attribute.name, false), value: attribute.value });
                    }
                  }
                  sink.beginElement(getName(content.name, true), attributes, inScopeNamespaces, isClosed);
                  j += content.parsed + (isClosed ? 2 : 1);
                  if (isClosed)
                    scopes.pop();
                  break;
              }
            } else {
              var isWs = true;
              do {
                isWs = isWs && isWhitespace(s, j);
                if (++j >= s.length)
                  break;
              } while(s[j] !== "<");
              var text = s.substring(i, j);
              sink.text(resolveEntities(text), isWs || isWhitespacePreserved());
            }
            i = j;
          }
        }

        this.parseFromString = function (s, mimeType) {
          var currentElement = new XML(1 /* Element */, '', '', '');
          var elementsStack = [];
          parseXml(s, {
            beginElement: function (name, attrs, namespaces, isEmpty) {
              var parent = currentElement;
              elementsStack.push(parent);
              currentElement = createNode(1 /* Element */, name.namespace, name.localName, name.prefix);
              for (var i = 0; i < attrs.length; ++i) {
                var rawAttr = attrs[i];
                var attr = createNode(2 /* Attribute */, rawAttr.name.namespace, rawAttr.name.localName, rawAttr.name.prefix);
                attr._value = rawAttr.value;
                currentElement._attributes.push(attr);
              }
              for (var i = 0; i < namespaces.length; ++i) {
                var rawNs = namespaces[i];
                var ns = Namespace.createNamespace(rawNs.uri, rawNs.prefix);
                currentElement._inScopeNamespaces.push(ns);
              }
              parent.insert(parent.length(), currentElement);
              if (isEmpty) {
                currentElement = elementsStack.pop();
              }
            },
            endElement: function (name) {
              currentElement = elementsStack.pop();
            },
            text: function (text, isWhitespace) {
              if (isWhitespace && ASXML.ignoreWhitespace) {
                return;
              }
              var node = createNode(3 /* Text */, "", "");
              node._value = text;
              currentElement.insert(currentElement.length(), node);
            },
            cdata: function (text) {
              var node = createNode(3 /* Text */, "", "");
              node._value = text;
              currentElement.insert(currentElement.length(), node);
            },
            comment: function (text) {
              if (ASXML.ignoreComments) {
                return;
              }
              var node = createNode(4 /* Comment */, "", "");
              node._value = text;
              currentElement.insert(currentElement.length(), node);
            },
            pi: function (name, value) {
              if (ASXML.ignoreProcessingInstructions) {
                return;
              }
              var node = createNode(5 /* ProcessingInstruction */, "", name);
              node._value = value;
              currentElement.insert(currentElement.length(), node);
            },
            doctype: function (text) {
            }
          });
          return currentElement;
        };

        function createNode(kind, uri, name, prefix) {
          return new XML(kind, uri, name, prefix);
        }
      }

      var xmlParser = new XMLParser();

      var ASNamespace = (function (_super) {
        __extends(ASNamespace, _super);
        function ASNamespace(a, b) {
          false && _super.call(this);

          var uri = "";
          var prefix = "";

          if (arguments.length === 0) {
          } else if (arguments.length === 1) {
            var uriValue = a;

            if (Shumway.isObject(uriValue) && uriValue instanceof ASNamespace) {
              var uriValueAsNamespace = uriValue;

              prefix = uriValueAsNamespace.prefix;

              uri = uriValueAsNamespace.uri;
            } else if (Shumway.isObject(uriValue) && uriValue instanceof ASQName && uriValue.uri !== null) {
              uri = uriValue.uri;
            } else {
              uri = toString(uriValue);

              if (uri === "") {
                prefix = "";
              } else {
                prefix = undefined;
              }
            }
          } else {
            var prefixValue = a;
            var uriValue = b;

            if (Shumway.isObject(uriValue) && uriValue instanceof ASQName && uriValue.uri !== null) {
              uri = uriValue.uri;
            } else {
              uri = toString(uriValue);
            }

            if (uri === "") {
              if (prefixValue === undefined || toString(prefixValue) === "") {
                prefix = "";
              } else {
                throw new TypeError();
              }
            } else if (prefixValue === undefined) {
              prefix = undefined;
            } else if (isXMLName(prefixValue) === false) {
              prefix = undefined;
            } else {
              prefix = toString(prefixValue);
            }
          }

          this._ns = Namespace.createNamespace(uri, prefix);
        }
        ASNamespace.fromNamespace = function (ns) {
          return new ASNamespace._namespaceConstructor(ns);
        };

        Object.defineProperty(ASNamespace.prototype, "prefix", {
          get: function () {
            return this._ns.prefix;
          },
          enumerable: true,
          configurable: true
        });

        Object.defineProperty(ASNamespace.prototype, "uri", {
          get: function () {
            return this._ns.uri;
          },
          enumerable: true,
          configurable: true
        });
        ASNamespace.staticNatives = null;
        ASNamespace.instanceNatives = null;
        ASNamespace.instanceConstructor = ASNamespace;

        ASNamespace._namespaceConstructor = function (ns) {
          this._ns = ns;
        };

        ASNamespace._ = (function () {
          ASNamespace._namespaceConstructor.prototype = ASNamespace.prototype;
        })();

        ASNamespace.callableConstructor = function (a, b) {
          if (arguments.length === 1 && Shumway.isObject(a) && a instanceof ASNamespace) {
            return a;
          }

          switch (arguments.length) {
            case 0:
              return new ASNamespace();
            case 1:
              return new ASNamespace(a);
            default:
              return new ASNamespace(a, b);
          }
        };
        return ASNamespace;
      })(AS.ASObject);
      AS.ASNamespace = ASNamespace;

      var ASQNameFlags;
      (function (ASQNameFlags) {
        ASQNameFlags[ASQNameFlags["ATTR_NAME"] = 1] = "ATTR_NAME";
        ASQNameFlags[ASQNameFlags["ELEM_NAME"] = 2] = "ELEM_NAME";
        ASQNameFlags[ASQNameFlags["ANY_NAME"] = 4] = "ANY_NAME";
        ASQNameFlags[ASQNameFlags["ANY_NAMESPACE"] = 8] = "ANY_NAMESPACE";
      })(ASQNameFlags || (ASQNameFlags = {}));

      var ASQName = (function (_super) {
        __extends(ASQName, _super);
        function ASQName(a, b, c) {
          false && _super.call(this);

          var name;
          var namespace;

          if (arguments.length === 0) {
            name = "";
          } else if (arguments.length === 1) {
            name = a;
          } else {
            namespace = a;
            name = b;
          }

          if (Shumway.isObject(name) && name instanceof ASQName) {
            if (arguments.length < 2) {
              return name;
            } else {
              name = name.localName;
            }
          }

          if (name === undefined || arguments.length === 0) {
            name = "";
          } else {
            name = toString(name);
          }

          if (namespace === undefined || arguments.length < 2) {
            if (name === "*") {
              namespace = null;
            } else {
              namespace = getDefaultNamespace();
            }
          }

          var localName = name;
          var uri;

          if (namespace === null) {
            uri = null;
          } else {
            namespace = namespace instanceof ASNamespace ? namespace : new ASNamespace(namespace);

            uri = namespace.uri;
          }

          var flags = c ? 1 /* ATTR_NAME */ : 2 /* ELEM_NAME */;
          if (name === '*') {
            flags |= 4 /* ANY_NAME */;
          }
          if (namespace === null) {
            flags |= 8 /* ANY_NAMESPACE */;
          }
          this._mn = new Multiname([namespace ? namespace._ns : null], localName);
          this._flags = flags;
        }
        ASQName.fromMultiname = function (mn) {
          var result = Object.create(ASQName.prototype);
          result._mn = mn;
          var flags = 0;
          if (mn.isAttribute()) {
            flags |= 1 /* ATTR_NAME */;
          } else {
            flags |= 2 /* ELEM_NAME */;
          }
          if (mn.isAnyName()) {
            flags |= 4 /* ANY_NAME */;
          }
          if (mn.isAnyNamespace()) {
            flags |= 8 /* ANY_NAMESPACE */;
          }
          result._flags = flags;
          return result;
        };

        Object.defineProperty(ASQName.prototype, "localName", {
          get: function () {
            return this._mn.name;
          },
          enumerable: true,
          configurable: true
        });

        Object.defineProperty(ASQName.prototype, "uri", {
          get: function () {
            if (this._mn.namespaces[0]) {
              return this._mn.namespaces[0].uri;
            }
            return null;
          },
          enumerable: true,
          configurable: true
        });

        Object.defineProperty(ASQName.prototype, "prefix", {
          get: function () {
            return this._mn.namespaces[0].prefix;
          },
          enumerable: true,
          configurable: true
        });

        ASQName.prototype.getNamespace = function (inScopeNamespaces) {
          if (this.uri === null) {
            throw "TypeError in QName.prototype.getNamespace()";
          }
          if (!inScopeNamespaces) {
            inScopeNamespaces = [];
          }
          var ns;
          for (var i = 0; i < inScopeNamespaces.length; i++) {
            if (this.uri === inScopeNamespaces[i].uri) {
              ns = inScopeNamespaces[i];
            }
          }
          if (!ns) {
            ns = new ASNamespace(this.prefix, this.uri);
          }
          return ns;
        };
        ASQName.instanceConstructor = ASQName;

        ASQName.callableConstructor = function (a, b) {
          if (arguments.length === 1 && Shumway.isObject(a) && a instanceof ASQName) {
            return a;
          }

          switch (arguments.length) {
            case 0:
              return new ASQName();
            case 1:
              return new ASQName(a);
            default:
              return new ASQName(a, b);
          }
        };
        return ASQName;
      })(AS.ASNative);
      AS.ASQName = ASQName;

      var ASXML_FLAGS;
      (function (ASXML_FLAGS) {
        ASXML_FLAGS[ASXML_FLAGS["FLAG_IGNORE_COMMENTS"] = 0x01] = "FLAG_IGNORE_COMMENTS";
        ASXML_FLAGS[ASXML_FLAGS["FLAG_IGNORE_PROCESSING_INSTRUCTIONS"] = 0x02] = "FLAG_IGNORE_PROCESSING_INSTRUCTIONS";
        ASXML_FLAGS[ASXML_FLAGS["FLAG_IGNORE_WHITESPACE"] = 0x04] = "FLAG_IGNORE_WHITESPACE";
        ASXML_FLAGS[ASXML_FLAGS["FLAG_PRETTY_PRINTING"] = 0x08] = "FLAG_PRETTY_PRINTING";
        ASXML_FLAGS[ASXML_FLAGS["ALL"] = ASXML_FLAGS.FLAG_IGNORE_COMMENTS | ASXML_FLAGS.FLAG_IGNORE_PROCESSING_INSTRUCTIONS | ASXML_FLAGS.FLAG_IGNORE_WHITESPACE | ASXML_FLAGS.FLAG_PRETTY_PRINTING] = "ALL";
      })(ASXML_FLAGS || (ASXML_FLAGS = {}));

      var ASXMLKind;
      (function (ASXMLKind) {
        ASXMLKind[ASXMLKind["Unknown"] = 0] = "Unknown";
        ASXMLKind[ASXMLKind["Element"] = 1] = "Element";
        ASXMLKind[ASXMLKind["Attribute"] = 2] = "Attribute";
        ASXMLKind[ASXMLKind["Text"] = 3] = "Text";
        ASXMLKind[ASXMLKind["Comment"] = 4] = "Comment";
        ASXMLKind[ASXMLKind["ProcessingInstruction"] = 5] = "ProcessingInstruction";
      })(ASXMLKind || (ASXMLKind = {}));

      var ASXMLKindNames = [
        null, 'element', 'attribute', 'text', 'comment',
        'processing-instruction'];

      var ASXML = (function (_super) {
        __extends(ASXML, _super);
        function ASXML(value) {
          if (typeof value === "undefined") { value = undefined; }
          false && _super.call(this);
          if (!(this instanceof ASXML)) {
            if (value instanceof ASXML) {
              return value;
            }
            return new ASXML(value);
          }
          if (value === null || value === undefined) {
            value = "";
          }
          var x = toXML(value);
          if (isXMLType(value)) {
            x = x._deepCopy();
          }
          return x;
        }
        ASXML.prototype.init = function (kind, uri, name, prefix) {
          var namespace = uri || prefix ? new ASNamespace(prefix, uri) : undefined;
          var isAttribute = kind === 2 /* Attribute */;
          this._name = new ASQName(namespace, name, isAttribute);
          this._kind = kind;
          this._parent = null;
          switch (kind) {
            case 1 /* Element */:
              this._inScopeNamespaces = [];
              this._attributes = [];
              this._children = [];
              break;
            case 4 /* Comment */:
            case 5 /* ProcessingInstruction */:
            case 2 /* Attribute */:
            case 3 /* Text */:
              this._value = '';
              break;
            default:
              break;
          }
          return this;
        };

        ASXML.prototype.length = function () {
          if (!this._children) {
            return 0;
          }
          return this._children.length;
        };

        ASXML.prototype._deepCopy = function () {
          var kind = this._kind;
          var clone = new ASXML();
          clone._kind = kind;
          clone._name = this._name;
          switch (kind) {
            case 1 /* Element */:
              clone._inScopeNamespaces = [];
              if (this._inScopeNamespaces.length > 0) {
                this._inScopeNamespaces.forEach(function (ns) {
                  clone._inScopeNamespaces.push(new ASNamespace(ns.prefix, ns.uri));
                });
              }
              clone._attributes = this._attributes.map(function (attr) {
                attr = attr._deepCopy();
                attr._parent = clone;
                return attr;
              });
              clone._children = this._children.map(function (child) {
                child = child._deepCopy();
                child._parent = clone;
                return child;
              });
              break;
            case 4 /* Comment */:
            case 5 /* ProcessingInstruction */:
            case 2 /* Attribute */:
            case 3 /* Text */:
              clone._value = this._value;
              break;
            default:
              break;
          }
          return clone;
        };

        ASXML.prototype.resolveValue = function () {
          return this;
        };

        ASXML.prototype._addInScopeNamespaces = function (ns) {
          if (this._inScopeNamespaces.some(function (ins) {
            return ins.uri === ns.uri && ins.prefix === ns.prefix;
          })) {
            return;
          }
          this._inScopeNamespaces.push(ns);
        };

        Object.defineProperty(ASXML, "ignoreComments", {
          get: function () {
            return !!(ASXML._flags & 1 /* FLAG_IGNORE_COMMENTS */);
          },
          set: function (newIgnore) {
            newIgnore = !!newIgnore;
            if (newIgnore) {
              ASXML._flags |= 1 /* FLAG_IGNORE_COMMENTS */;
            } else {
              ASXML._flags &= ~1 /* FLAG_IGNORE_COMMENTS */;
            }
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ASXML, "ignoreProcessingInstructions", {
          get: function () {
            return !!(ASXML._flags & 2 /* FLAG_IGNORE_PROCESSING_INSTRUCTIONS */);
          },
          set: function (newIgnore) {
            newIgnore = !!newIgnore;
            if (newIgnore) {
              ASXML._flags |= 2 /* FLAG_IGNORE_PROCESSING_INSTRUCTIONS */;
            } else {
              ASXML._flags &= ~2 /* FLAG_IGNORE_PROCESSING_INSTRUCTIONS */;
            }
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ASXML, "ignoreWhitespace", {
          get: function () {
            return !!(ASXML._flags & 4 /* FLAG_IGNORE_WHITESPACE */);
          },
          set: function (newIgnore) {
            newIgnore = !!newIgnore;
            if (newIgnore) {
              ASXML._flags |= 4 /* FLAG_IGNORE_WHITESPACE */;
            } else {
              ASXML._flags &= ~4 /* FLAG_IGNORE_WHITESPACE */;
            }
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ASXML, "prettyPrinting", {
          get: function () {
            return !!(ASXML._flags & 8 /* FLAG_PRETTY_PRINTING */);
          },
          set: function (newPretty) {
            newPretty = !!newPretty;
            if (newPretty) {
              ASXML._flags |= 8 /* FLAG_PRETTY_PRINTING */;
            } else {
              ASXML._flags &= ~8 /* FLAG_PRETTY_PRINTING */;
            }
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(ASXML, "prettyIndent", {
          get: function () {
            return ASXML._prettyIndent;
          },
          set: function (newIndent) {
            newIndent = newIndent | 0;
            ASXML._prettyIndent = newIndent;
          },
          enumerable: true,
          configurable: true
        });
        ASXML.prototype.toString = function () {
          return toString(this);
        };
        ASXML.prototype.native_hasOwnProperty = function (P) {
          if (typeof P === "undefined") { P = undefined; }
          if (this.hasProperty(P, isQNameAttribute(P), false)) {
            return true;
          }
          return _asHasOwnProperty.call(this, String(P));
        };
        ASXML.prototype.native_propertyIsEnumerable = function (P) {
          if (typeof P === "undefined") { P = undefined; }
          return String(P) === "0";
        };
        ASXML.prototype.addNamespace = function (ns) {
          this._addInScopeNamespaces(new ASNamespace(ns));
          return this;
        };
        ASXML.prototype.appendChild = function (child) {
          if (child._parent) {
            var index = child._parent._children.indexOf(child);
            release || assert(index >= 0);
            child._parent._children.splice(index, 1);
          }
          this._children.push(child);
          child._parent = this;
          return this;
        };
        ASXML.prototype.attribute = function (arg) {
          return this.getProperty(arg, true, false);
        };
        ASXML.prototype.attributes = function () {
          var list = new XMLList();
          Array.prototype.push.apply(list._children, this._attributes);
          return list;
        };
        ASXML.prototype.child = function (propertyName) {
          return this.getProperty(propertyName, isQNameAttribute(propertyName), false);
        };
        ASXML.prototype.childIndex = function () {
          if (!this._parent || this._kind === 2 /* Attribute */) {
            return -1;
          }
          return this._parent._children.indexOf(this);
        };
        ASXML.prototype.children = function () {
          var xl = new XMLList(this);
          Array.prototype.push.apply(xl._children, this._children);
          return xl;
        };
        ASXML.prototype.contains = function (value) {
          return this === value;
        };
        ASXML.prototype.copy = function () {
          return this._deepCopy();
        };
        ASXML.prototype.elements = function (name) {
          if (typeof name === "undefined") { name = "*"; }
          return this.getProperty(name, false, false);
        };
        ASXML.prototype.hasComplexContent = function () {
          if (this._kind === 2 /* Attribute */ || this._kind === 4 /* Comment */ || this._kind === 5 /* ProcessingInstruction */ || this._kind === 3 /* Text */) {
            return false;
          }
          return this._children.some(function (child) {
            return child._kind === 1 /* Element */;
          });
        };
        ASXML.prototype.hasSimpleContent = function () {
          if (this._kind === 4 /* Comment */ || this._kind === 5 /* ProcessingInstruction */) {
            return false;
          }
          if (!this._children && this._children.length === 0) {
            return true;
          }
          return this._children.every(function (child) {
            return child._kind !== 1 /* Element */;
          });
        };

        ASXML.prototype.inScopeNamespaces = function () {
          notImplemented("public.XML::inScopeNamespaces");
          return;
        };
        ASXML.prototype.insertChildAfter = function (child1, child2) {
          notImplemented("public.XML::insertChildAfter");
          return;
        };
        ASXML.prototype.insertChildBefore = function (child1, child2) {
          notImplemented("public.XML::insertChildBefore");
          return;
        };
        ASXML.prototype.localName = function () {
          return this._name.localName;
        };
        ASXML.prototype.name = function () {
          return this._name;
        };
        ASXML.prototype._namespace = function (prefix, argc) {
          argc = argc | 0;
          notImplemented("public.XML::private _namespace");
          return;
        };
        ASXML.prototype.namespaceDeclarations = function () {
          notImplemented("public.XML::namespaceDeclarations");
          return;
        };
        ASXML.prototype.nodeKind = function () {
          return ASXMLKindNames[this._kind];
        };
        ASXML.prototype.normalize = function () {
          notImplemented("public.XML::normalize");
          return;
        };
        ASXML.prototype.parent = function () {
          return this._parent;
        };
        ASXML.prototype.processingInstructions = function (name) {
          if (typeof name === "undefined") { name = "*"; }
          notImplemented("public.XML::processingInstructions");
          return;
        };
        ASXML.prototype.prependChild = function (value) {
          notImplemented("public.XML::prependChild");
          return;
        };
        ASXML.prototype.removeNamespace = function (ns) {
          notImplemented("public.XML::removeNamespace");
          return;
        };
        ASXML.prototype.setChildren = function (value) {
          notImplemented("public.XML::setChildren");
          return;
        };
        ASXML.prototype.setLocalName = function (name) {
          notImplemented("public.XML::setLocalName");
          return;
        };
        ASXML.prototype.setName = function (name) {
          notImplemented("public.XML::setName");
          return;
        };
        ASXML.prototype.setNamespace = function (ns) {
          notImplemented("public.XML::setNamespace");
          return;
        };
        ASXML.prototype.toXMLString = function () {
          return toXMLString(this);
        };
        ASXML.prototype.notification = function () {
          notImplemented("public.XML::notification");
          return;
        };
        ASXML.prototype.setNotification = function (f) {
          f = f;
          notImplemented("public.XML::setNotification");
          return;
        };

        ASXML.isTraitsOrDynamicPrototype = function (value) {
          return value === ASXML.traitsPrototype || value === ASXML.dynamicPrototype;
        };

        ASXML.prototype.asGetEnumerableKeys = function () {
          if (ASXML.isTraitsOrDynamicPrototype(this)) {
            return _asGetEnumerableKeys.call(this);
          }
          var keys = [];
          this._children.forEach(function (v, i) {
            keys.push(v.name);
          });
          return keys;
        };

        ASXML.prototype.setProperty = function (p, isAttribute, v) {
          var i, c, n;
          var self = this;
          if (p === p >>> 0) {
            throw "TypeError in XML.prototype.setProperty(): invalid property name " + p;
          }
          if (self._kind === 3 /* Text */ || self._kind === 4 /* Comment */ || self._kind === 5 /* ProcessingInstruction */ || self._kind === 2 /* Attribute */) {
            return;
          }
          if (!v || !isXMLType(v) || v._kind === 3 /* Text */ || v._kind === 2 /* Attribute */) {
            c = toString(v);
          } else {
            c = v._deepCopy();
          }
          n = toXMLName(p);

          if (isAttribute) {
            if (!this._attributes) {
              return;
            }
            this._attributes.forEach(function (v, i, o) {
              if (v.name === n.localName) {
                delete o[i];
              }
            });
            var a = new XML(2 /* Attribute */, n.uri, n.localName);
            a._value = v;
            a._parent = this;
            this._attributes.push(a);
            return;
          }

          var i = undefined;
          var primitiveAssign = !isXMLType(c) && n.localName !== "*";
          var isAny = n._flags & 4 /* ANY_NAME */;
          var isAnyNamespace = n._flags & 8 /* ANY_NAMESPACE */;
          for (var k = self.length() - 1; k >= 0; k--) {
            if ((isAny || self._children[k]._kind === 1 /* Element */ && self._children[k]._name.localName === n.localName) && (isAnyNamespace || self._children[k]._kind === 1 /* Element */ && self._children[k]._name.uri === n.uri)) {
              if (i !== undefined) {
                self.deleteByIndex(String(i));
              }
              i = k;
            }
          }
          if (i === undefined) {
            i = self.length();
            if (primitiveAssign) {
              if (n.uri === null) {
                var name = new ASQName(getDefaultNamespace(), n);
              } else {
                var name = new ASQName(n);
              }
              var y = new XML(1 /* Element */, name.uri, name.localName, name.prefix);
              y._parent = self;
              var ns = name.getNamespace();
              self.replace(String(i), y);
              y.addInScopeNamespace(ns);
            }
          }
          if (primitiveAssign) {
            self._children[i]._children = [];
            var s = toString(c);
            if (s !== "") {
              self._children[i].replace("0", s);
            }
          } else {
            self.replace(String(i), c);
          }
          return;
        };

        ASXML.prototype.asSetProperty = function (namespaces, name, flags, value) {
          if (ASXML.isTraitsOrDynamicPrototype(this)) {
            return _asSetProperty.call(this, namespaces, name, flags, value);
          }
          var isAttribute = flags & Multiname.ATTRIBUTE;
          this.setProperty(prefixWithNamespace(namespaces, name, isAttribute), isAttribute, value);
        };

        ASXML.prototype.getProperty = function (mn, isAttribute, isMethod) {
          if (isMethod) {
            var resolved = Multiname.isQName(mn) ? mn : this.resolveMultinameProperty(mn.namespaces, mn.name, mn.flags);
            return this[Multiname.getQualifiedName(resolved)];
          }
          if (!Multiname.isQName(mn) && Shumway.isNumeric(mn)) {
            if (Number(mn) === 0) {
              return this;
            }
            return null;
          }
          var self = this;
          var name = toXMLName(mn);
          var xl = new XMLList(self, name);
          var flags = name._flags;
          var anyName = flags & 4 /* ANY_NAME */;
          var anyNamespace = flags & 8 /* ANY_NAMESPACE */;

          if (isAttribute) {
            if (self._attributes) {
              self._attributes.forEach(function (v, i) {
                if ((anyName || (v._name.localName === name.localName)) && ((anyNamespace || v._name.uri === name.uri))) {
                  xl.appendChild(v);
                }
              });
            }
          } else {
            self._children.forEach(function (v, i) {
              if ((anyName || v._kind === 1 /* Element */ && v._name.localName === name.localName) && ((anyNamespace || v._kind === 1 /* Element */ && v._name.uri === name.uri))) {
                xl.appendChild(v);
              }
            });
          }
          return xl;
        };

        ASXML.prototype.asGetNumericProperty = function (name) {
          return this.asGetProperty(null, name, 0);
        };

        ASXML.prototype.asSetNumericProperty = function (name, value) {
          this.asSetProperty(null, name, 0, value);
        };

        ASXML.prototype.asGetProperty = function (namespaces, name, flags) {
          if (ASXML.isTraitsOrDynamicPrototype(this)) {
            return _asGetProperty.call(this, namespaces, name, flags);
          }
          var isAttribute = flags & Multiname.ATTRIBUTE;
          return this.getProperty(prefixWithNamespace(namespaces, name, isAttribute), isAttribute, false);
        };

        ASXML.prototype.hasProperty = function (mn, isAttribute, isMethod) {
          if (isMethod) {
            var resolved = Multiname.isQName(mn) ? mn : this.resolveMultinameProperty(mn.namespaces, mn.name, mn.flags);
            return !!this[Multiname.getQualifiedName(resolved)];
          }
          var self = this;
          var xl = new XMLList();
          if (Shumway.isIndex(mn)) {
            if (Number(mn) === 0) {
              return true;
            }
            return false;
          }
          var name = toXMLName(mn);
          var flags = name._flags;
          var anyName = flags & 4 /* ANY_NAME */;
          var anyNamespace = flags & 8 /* ANY_NAMESPACE */;
          if (isAttribute) {
            if (self._attributes) {
              return this._attributes.some(function (v, i) {
                return ((anyName || (v._name.localName === name.localName)) && ((anyNamespace || v._name.uri === name.uri)));
              });
            }
          } else {
            if (this._children.some(function (v, i) {
              return ((anyName || v._kind === 1 /* Element */ && v._name.localName === name.localName) && ((anyNamespace || v._kind === 1 /* Element */ && v._name.uri === name.uri)));
            })) {
              return true;
            }
          }
        };

        ASXML.prototype.asHasProperty = function (namespaces, name, flags) {
          if (ASXML.isTraitsOrDynamicPrototype(this)) {
            return _asHasProperty.call(this, namespaces, name, flags);
          }
          var isAttribute = flags & Multiname.ATTRIBUTE;
          name = prefixWithNamespace(namespaces, name, isAttribute);
          if (this.hasProperty(name, isAttribute, false)) {
            return true;
          }

          var resolved = Multiname.isQName(name) ? name : this.resolveMultinameProperty(namespaces, name, flags);
          return !!this[Multiname.getQualifiedName(resolved)];
        };

        ASXML.prototype.asHasPropertyInternal = function (namespaces, name, flags) {
          return this.asHasProperty(namespaces, name, flags);
        };

        ASXML.prototype.asCallProperty = function (namespaces, name, flags, isLex, args) {
          if (ASXML.isTraitsOrDynamicPrototype(this) || isLex) {
            return _asCallProperty.call(this, namespaces, name, flags, isLex, args);
          }

          var self = this;
          var result;
          var method;
          var resolved = self.resolveMultinameProperty(namespaces, name, flags);
          if (self.asGetNumericProperty && Multiname.isNumeric(resolved)) {
            method = self.asGetNumericProperty(resolved);
          } else {
            var openMethods = self.asOpenMethods;
            method = (openMethods && openMethods[resolved]) || self[resolved];
          }
          if (method) {
            return _asCallProperty.call(this, namespaces, name, flags, isLex, args);
          }

          if (this.hasSimpleContent()) {
            return Object(toString(this)).asCallProperty(namespaces, name, flags, isLex, args);
          }
          throw new TypeError();
        };

        ASXML.prototype._delete = function (key, isMethod) {
          notImplemented("XML.[[Delete]]");
        };

        ASXML.prototype.deleteByIndex = function (p) {
          var self = this;
          var i = p >>> 0;
          if (String(i) !== String(p)) {
            throw "TypeError in XML.prototype.deleteByIndex(): invalid index " + p;
          }
          if (p < self.length()) {
            if (self.children[p]) {
              self.children[p]._parent = null;
              delete self.children[p];
              for (var q = i + 1; q < self.length(); q++) {
                self.children[q - 1] = self.children[q];
              }
              self.children.length = self.children.length - 1;
            }
          }
        };

        ASXML.prototype.insert = function (p, v) {
          var s, i, n;
          var self = this;
          if (self._kind === 3 /* Text */ || self._kind === 4 /* Comment */ || self._kind === 5 /* ProcessingInstruction */ || self._kind === 2 /* Attribute */) {
            return;
          }
          i = p >>> 0;
          if (String(p) !== String(i)) {
            throw "TypeError in XML.prototype.insert(): invalid property name " + p;
          }
          if (self._kind === 1 /* Element */) {
            var a = self;
            while (a) {
              if (a === v) {
                throw "Error in XML.prototype.insert()";
              }
              a = a._parent;
            }
          }
          if (self instanceof ASXMLList) {
            n = self.length();
            if (n === 0) {
              return;
            }
          } else {
            n = 1;
          }
          for (var j = self.length() - 1; j >= i; j--) {
            self._children[j + n] = self._children[j];
          }
          if (self instanceof ASXMLList) {
            n = v.length();
            for (var j = 0; j < n; j++) {
              v._children[j]._parent = self;
              self[i + j] = v[j];
            }
          } else {
            v._parent = self;
            self._children[i] = v;
          }
        };

        ASXML.prototype.replace = function (p, v) {
          var s;
          var self = this;
          if (self._kind === 3 /* Text */ || self._kind === 4 /* Comment */ || self._kind === 5 /* ProcessingInstruction */ || self._kind === 2 /* Attribute */) {
            return self;
          }
          if (v._kind === 1 /* Element */) {
            var a = self;
            while (a) {
              if (a === v) {
                throw "Error in XML.prototype.replace()";
              }
              a = a._parent;
            }
          }
          var i = p >>> 0;
          if (String(p) === String(i)) {
            if (i >= self.length()) {
              p = String(self.length());
            }
            if (self._children[p]) {
              self._children[p]._parent = null;
            }
          } else {
            var toRemove = this.getProperty(p, false, false);
            if (toRemove.length() === 0) {
              return self;
            }
            toRemove._children.forEach(function (v, i) {
              var index = self._children.indexOf(v);
              v._parent = null;
              if (i === 0) {
                p = String(index);
                self._children.splice(index, 1, undefined);
              } else {
                self._children.splice(index, 1);
              }
            });
          }

          if (v._kind === 1 /* Element */ || v._kind === 3 /* Text */ || v._kind === 4 /* Comment */ || v._kind === 5 /* ProcessingInstruction */) {
            v._parent = self;
            self._children[p] = v;
          } else {
            s = toString(v);
            var t = new XML();
            t._parent = self;
            t._value = s;
            self._children[p] = t;
          }
          return self;
        };

        ASXML.prototype.addInScopeNamespace = function (ns) {
          var s;
          var self = this;
          if (self._kind === 3 /* Text */ || self._kind === 4 /* Comment */ || self._kind === 5 /* ProcessingInstruction */ || self._kind === 2 /* Attribute */) {
            return;
          }
          if (ns.prefix !== undefined) {
            if (ns.prefix === "" && self._name.uri === "") {
              return;
            }
            var match = null;
            self._inScopeNamespaces.forEach(function (v, i) {
              if (v.prefix === ns.prefix) {
                match = v;
              }
            });
            if (match !== null && match.uri !== ns.uri) {
              self._inScopeNamespaces.forEach(function (v, i) {
                if (v.prefix === match.prefix) {
                  self._inScopeNamespaces[i] = ns;
                }
              });
            }
            if (self._name.prefix === ns.prefix) {
              self._name.prefix = undefined;
            }
            self._attributes.forEach(function (v, i) {
              if (v._name.prefix === ns.prefix) {
                v._name.prefix = undefined;
              }
            });
          }
        };

        ASXML.prototype.descendants = function (name) {
          if (typeof name === "undefined") { name = "*"; }
          name = toXMLName(name);
          var flags = name._flags;
          var self = this;
          var xl = new XMLList();
          if (self._kind !== 1 /* Element */) {
            return xl;
          }
          var isAny = flags & 4 /* ANY_NAME */;
          if (flags & 1 /* ATTR_NAME */) {
            this._attributes.forEach(function (v, i) {
              if (isAny || name.localName === v._name.localName) {
                xl.appendChild(v);
              }
            });
          } else {
            this._children.forEach(function (v, i) {
              if (isAny || name.localName === v._name.localName) {
                xl.appendChild(v);
              }
            });
          }

          this._children.forEach(function (v, i) {
            xl.appendChild(v.descendants(name));
          });
          return xl;
        };

        ASXML.prototype.comments = function () {
          var self = this;
          var xl = new XMLList(self, null);
          self._children.forEach(function (v, i) {
            if (v._kind === 4 /* Comment */) {
              xl.appendChild(v);
            }
          });
          return xl;
        };

        ASXML.prototype.text = function () {
          var self = this;
          var xl = new XMLList(self, null);
          self._children.forEach(function (v, i) {
            if (v._kind === 3 /* Text */) {
              xl.appendChild(v);
            }
          });
          return xl;
        };
        ASXML.instanceConstructor = ASXML;

        ASXML.callableConstructor = function (value) {
          if (typeof value === "undefined") { value = undefined; }
          if (value === null || value === undefined) {
            value = '';
          }
          return toXML(value);
        };

        ASXML.defaultNamespace = '';
        ASXML._flags = ASXML_FLAGS.ALL;
        ASXML._prettyIndent = 2;
        return ASXML;
      })(AS.ASNative);
      AS.ASXML = ASXML;

      function XML(kind, uri, name, prefix) {
        var self = Object.create(ASXML.prototype);
        if (kind === undefined) {
          kind = 3 /* Text */;
        }
        if (uri === undefined) {
          uri = "";
        }
        if (name === undefined) {
          name = "";
        }
        self.init(kind, uri, name, prefix);
        return self;
      }

      var ASXMLList = (function (_super) {
        __extends(ASXMLList, _super);
        function ASXMLList(value) {
          if (typeof value === "undefined") { value = undefined; }
          false && _super.call(this);

          if (value === null || value === undefined) {
            value = "";
          }
          var xl = toXMLList(value);
          if (isXMLType(value)) {
            xl = xl._deepCopy();
          }
          return xl;
        }
        ASXMLList.prototype.toString = function () {
          return toString(this);
        };

        ASXMLList.prototype._deepCopy = function () {
          var xl = new XMLList();
          for (var i = 0; i < this.length(); i++) {
            xl.appendChild(this._children[i]._deepCopy());
          }
          return xl;
        };

        ASXMLList.prototype.hasOwnProperty = function (P) {
          if (typeof P === "undefined") { P = undefined; }
          notImplemented("public.XMLList::hasOwnProperty");
          return;
        };
        ASXMLList.prototype.propertyIsEnumerable = function (P) {
          if (typeof P === "undefined") { P = undefined; }
          notImplemented("public.XMLList::propertyIsEnumerable");
          return;
        };
        ASXMLList.prototype.attribute = function (arg) {
          return this.getProperty(arg, true, false);
        };
        ASXMLList.prototype.attributes = function () {
          return this.getProperty('*', true, false);
        };
        ASXMLList.prototype.child = function (propertyName) {
          return this.getProperty(propertyName, false, false);
        };
        ASXMLList.prototype.children = function () {
          return this.getProperty('*', false, false);
        };
        ASXMLList.prototype.comments = function () {
          var xl = new XMLList(this);
          this._children.forEach(function (child) {
            if (child._kind === 1 /* Element */) {
              var r = child.comments();
              Array.prototype.push.apply(xl._children, r._children);
            }
          });
          return xl;
        };
        ASXMLList.prototype.contains = function (value) {
          return this._children.indexOf(value) >= 0;
        };
        ASXMLList.prototype.copy = function () {
          return this._deepCopy();
        };
        ASXMLList.prototype.elements = function (name) {
          if (typeof name === "undefined") { name = "*"; }
          var xl = new XMLList(this, new ASQName(name));
          this._children.forEach(function (child) {
            if (child._kind === 1 /* Element */) {
              var r = child.elements(name);
              Array.prototype.push.apply(xl._children, r._children);
            }
          });
          return xl;
        };
        ASXMLList.prototype.hasComplexContent = function () {
          switch (this.length()) {
            case 0:
              return false;
            case 1:
              return this._children[0].hasComplexContent();
            default:
              return this._children.some(function (child) {
                return child._kind === 1 /* Element */;
              });
          }
        };
        ASXMLList.prototype.hasSimpleContent = function () {
          switch (this.length()) {
            case 0:
              return true;
            case 1:
              return this._children[0].hasSimpleContent();
            default:
              return this._children.every(function (child) {
                return child._kind !== 1 /* Element */;
              });
          }
        };
        ASXMLList.prototype.length = function () {
          return this._children.length;
        };
        ASXMLList.prototype.name = function () {
          return this._children[0].name();
        };
        ASXMLList.prototype.normalize = function () {
          notImplemented("public.XMLList::normalize");
          return;
        };
        ASXMLList.prototype.parent = function () {
          if (this.length() === 0) {
            return undefined;
          }
          var parent = this._children[0]._parent;
          for (var i = 1; i < this.length(); i++) {
            if (parent !== this._children[i]._parent) {
              return undefined;
            }
          }
          return parent;
        };
        ASXMLList.prototype.processingInstructions = function (name) {
          if (typeof name === "undefined") { name = "*"; }
          notImplemented("public.XMLList::processingInstructions");
          return;
        };
        ASXMLList.prototype.text = function () {
          var xl = new XMLList(this);
          this._children.forEach(function (v, i) {
            if (v._kind === 1 /* Element */) {
              var gq = v.text();
              if (gq.length() > 0) {
                xl.appendChild(gq);
              }
            }
          });
          return xl;
        };
        ASXMLList.prototype.toXMLString = function () {
          return toXMLString(this);
        };
        ASXMLList.prototype.addNamespace = function (ns) {
          notImplemented("public.XMLList::addNamespace");
          return;
        };
        ASXMLList.prototype.appendChild = function (child) {
          if (child instanceof ASXMLList) {
            this._children.push.apply(this._children, child._children);
            return child;
          }
          this._children.push(child);
          return child;
        };
        ASXMLList.prototype.childIndex = function () {
          notImplemented("public.XMLList::childIndex");
          return;
        };
        ASXMLList.prototype.inScopeNamespaces = function () {
          notImplemented("public.XMLList::inScopeNamespaces");
          return;
        };
        ASXMLList.prototype.insertChildAfter = function (child1, child2) {
          notImplemented("public.XMLList::insertChildAfter");
          return;
        };
        ASXMLList.prototype.insertChildBefore = function (child1, child2) {
          notImplemented("public.XMLList::insertChildBefore");
          return;
        };
        ASXMLList.prototype.nodeKind = function () {
          notImplemented("public.XMLList::nodeKind");
          return;
        };
        ASXMLList.prototype._namespace = function (prefix, argc) {
          argc = argc | 0;
          notImplemented("public.XMLList::private _namespace");
          return;
        };
        ASXMLList.prototype.localName = function () {
          notImplemented("public.XMLList::localName");
          return;
        };
        ASXMLList.prototype.namespaceDeclarations = function () {
          notImplemented("public.XMLList::namespaceDeclarations");
          return;
        };
        ASXMLList.prototype.prependChild = function (value) {
          notImplemented("public.XMLList::prependChild");
          return;
        };
        ASXMLList.prototype.removeNamespace = function (ns) {
          notImplemented("public.XMLList::removeNamespace");
          return;
        };
        ASXMLList.prototype.replace = function (propertyName, value) {
          notImplemented("public.XMLList::replace");
          return;
        };
        ASXMLList.prototype.setChildren = function (value) {
          notImplemented("public.XMLList::setChildren");
          return;
        };
        ASXMLList.prototype.setLocalName = function (name) {
          notImplemented("public.XMLList::setLocalName");
          return;
        };
        ASXMLList.prototype.setName = function (name) {
          notImplemented("public.XMLList::setName");
          return;
        };
        ASXMLList.prototype.setNamespace = function (ns) {
          notImplemented("public.XMLList::setNamespace");
          return;
        };

        ASXMLList.isTraitsOrDynamicPrototype = function (value) {
          return value === ASXMLList.traitsPrototype || value === ASXMLList.dynamicPrototype;
        };

        ASXMLList.prototype.asGetEnumerableKeys = function () {
          if (ASXMLList.isTraitsOrDynamicPrototype(this)) {
            return _asGetEnumerableKeys.call(this);
          }
          return this._children.asGetEnumerableKeys();
        };

        ASXMLList.prototype.getProperty = function (mn, isAttribute, isMethod) {
          if (isMethod) {
            var resolved = Multiname.isQName(mn) ? mn : this.resolveMultinameProperty(mn.namespaces, mn.name, mn.flags);
            return this[Multiname.getQualifiedName(resolved)];
          }
          if (Shumway.isIndex(mn)) {
            return this._children[mn];
          }
          var name = toXMLName(mn);
          var xl = new XMLList(this, name);
          this._children.forEach(function (v, i) {
            if (v._kind === 1 /* Element */) {
              var gq = v.getProperty(name, isAttribute, isMethod);

              if (gq.length() > 0) {
                xl.appendChild(gq);
              }
            }
          });
          return xl;
        };

        ASXMLList.prototype.asGetNumericProperty = function (name) {
          return this.asGetProperty(null, name, 0);
        };

        ASXMLList.prototype.asSetNumericProperty = function (name, value) {
          this.asSetProperty(null, name, 0, value);
        };

        ASXMLList.prototype.asGetProperty = function (namespaces, name, flags) {
          if (ASXMLList.isTraitsOrDynamicPrototype(this)) {
            return _asGetProperty.call(this, namespaces, name, flags);
          }
          var isAttribute = flags & Multiname.ATTRIBUTE;
          return this.getProperty(prefixWithNamespace(namespaces, name, isAttribute), isAttribute, false);
        };

        ASXMLList.prototype.hasProperty = function (mn, isAttribute) {
          if (Shumway.isIndex(mn)) {
            return Number(mn) < this._children.length;
          }

          return true;
        };

        ASXMLList.prototype.asHasProperty = function (namespaces, name, flags) {
          if (ASXMLList.isTraitsOrDynamicPrototype(this)) {
            return _asGetProperty.call(this, namespaces, name, flags);
          }
          var isAttribute = flags & Multiname.ATTRIBUTE;
          return this.hasProperty(prefixWithNamespace(namespaces, name, isAttribute), isAttribute);
        };

        ASXMLList.prototype.asHasPropertyInternal = function (namespaces, name, flags) {
          var isAttribute = flags & Multiname.ATTRIBUTE;
          return this.hasProperty(prefixWithNamespace(namespaces, name, isAttribute), isAttribute);
        };

        ASXMLList.prototype.setProperty = function (mn, isAttribute, value) {
          if (Shumway.isIndex(mn)) {
            this.appendChild(value);
            return;
          }

          var node = this.getProperty(mn, isAttribute, false);
          toXML(node).replace(0, toXML(value));
        };

        ASXMLList.prototype.asSetProperty = function (namespaces, name, flags, value) {
          if (ASXMLList.isTraitsOrDynamicPrototype(this)) {
            return _asSetProperty.call(this, namespaces, name, flags, value);
          }
          var isAttribute = flags & Multiname.ATTRIBUTE;
          name = prefixWithNamespace(namespaces, name, isAttribute);
          return this.setProperty(name, isAttribute, value);
        };

        ASXMLList.prototype.asCallProperty = function (namespaces, name, flags, isLex, args) {
          if (ASXMLList.isTraitsOrDynamicPrototype(this) || isLex) {
            return _asCallProperty.call(this, namespaces, name, flags, isLex, args);
          }

          var self = this;
          var result;
          var method;
          var resolved = self.resolveMultinameProperty(namespaces, name, flags);
          if (self.asGetNumericProperty && Multiname.isNumeric(resolved)) {
            method = self.asGetNumericProperty(resolved);
          } else {
            var openMethods = self.asOpenMethods;
            method = (openMethods && openMethods[resolved]) || self[resolved];
          }
          if (method) {
            return _asCallProperty.call(this, namespaces, name, flags, isLex, args);
          }

          if (this.length() === 1) {
            return this._children[0].asCallProperty(namespaces, name, flags, isLex, args);
          }
          throw new TypeError();
        };
        ASXMLList.instanceConstructor = ASXMLList;

        ASXMLList.callableConstructor = function (value) {
          if (typeof value === "undefined") { value = undefined; }
          if (value === null || value === undefined) {
            value = '';
          }
          return toXMLList(value);
        };
        return ASXMLList;
      })(AS.ASNative);
      AS.ASXMLList = ASXMLList;

      function XMLList(targetObject, targetProperty) {
        var self = Object.create(ASXMLList.prototype);
        self._targetObject = targetObject ? targetObject : null;
        self._targetProperty = targetProperty ? targetProperty : null;
        self._children = [];
        return self;
      }
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var assert = Shumway.Debug.assert;
      var Multiname = Shumway.AVM2.ABC.Multiname;

      var DescribeTypeFlags;
      (function (DescribeTypeFlags) {
        DescribeTypeFlags[DescribeTypeFlags["HIDE_NSURI_METHODS"] = 0x0001] = "HIDE_NSURI_METHODS";
        DescribeTypeFlags[DescribeTypeFlags["INCLUDE_BASES"] = 0x0002] = "INCLUDE_BASES";
        DescribeTypeFlags[DescribeTypeFlags["INCLUDE_INTERFACES"] = 0x0004] = "INCLUDE_INTERFACES";
        DescribeTypeFlags[DescribeTypeFlags["INCLUDE_VARIABLES"] = 0x0008] = "INCLUDE_VARIABLES";
        DescribeTypeFlags[DescribeTypeFlags["INCLUDE_ACCESSORS"] = 0x0010] = "INCLUDE_ACCESSORS";
        DescribeTypeFlags[DescribeTypeFlags["INCLUDE_METHODS"] = 0x0020] = "INCLUDE_METHODS";
        DescribeTypeFlags[DescribeTypeFlags["INCLUDE_METADATA"] = 0x0040] = "INCLUDE_METADATA";
        DescribeTypeFlags[DescribeTypeFlags["INCLUDE_CONSTRUCTOR"] = 0x0080] = "INCLUDE_CONSTRUCTOR";
        DescribeTypeFlags[DescribeTypeFlags["INCLUDE_TRAITS"] = 0x0100] = "INCLUDE_TRAITS";
        DescribeTypeFlags[DescribeTypeFlags["USE_ITRAITS"] = 0x0200] = "USE_ITRAITS";
        DescribeTypeFlags[DescribeTypeFlags["HIDE_OBJECT"] = 0x0400] = "HIDE_OBJECT";
      })(DescribeTypeFlags || (DescribeTypeFlags = {}));

      var CONSTANT = Shumway.AVM2.ABC.CONSTANT;
      var TRAIT = Shumway.AVM2.ABC.TRAIT;

      function describeTypeJSON(o, flags) {
        var declaredByKey = publicName("declaredBy");
        var metadataKey = publicName("metadata");
        var accessKey = publicName("access");
        var uriKey = publicName("uri");
        var nameKey = publicName("name");
        var typeKey = publicName("type");
        var returnTypeKey = publicName("returnType");
        var valueKey = publicName("value");
        var keyKey = publicName("key");
        var parametersKey = publicName("parameters");
        var optionalKey = publicName("optional");

        var cls = o.classInfo ? o : Object.getPrototypeOf(o).class;
        release || assert(cls, "No class found for object " + o);
        var info = cls.classInfo;

        var description = {};
        description[nameKey] = unmangledQualifiedName(info.instanceInfo.name);
        description[publicName("isDynamic")] = cls === o ? true : !(info.instanceInfo.flags & 1 /* ClassSealed */);

        description[publicName("isStatic")] = cls === o;
        description[publicName("isFinal")] = cls === o ? true : !(info.instanceInfo.flags & 2 /* ClassFinal */);
        if (flags & 256 /* INCLUDE_TRAITS */) {
          description[publicName("traits")] = addTraits(cls, flags);
        }
        var metadata = null;
        if (info.metadata) {
          metadata = Object.keys(info.metadata).map(function (key) {
            return describeMetadata(info.metadata[key]);
          });
        }
        description[metadataKey] = metadata;
        return description;

        function publicName(str) {
          return Multiname.getPublicQualifiedName(str);
        }

        function unmangledQualifiedName(mn) {
          var name = mn.name;
          var namespace = mn.namespaces[0];
          if (namespace && namespace.uri) {
            return namespace.uri + '::' + name;
          }
          return name;
        }

        function describeMetadata(metadata) {
          var result = {};
          result[nameKey] = metadata.name;
          result[valueKey] = metadata.value.map(function (value) {
            var val = {};
            val[keyKey] = value.key;
            val[valueKey] = value.value;
            return value;
          });
          return result;
        }

        function addTraits(cls, flags) {
          var includedMembers = [
            flags & 8 /* INCLUDE_VARIABLES */,
            flags & 32 /* INCLUDE_METHODS */,
            flags & 16 /* INCLUDE_ACCESSORS */,
            flags & 16 /* INCLUDE_ACCESSORS */];
          var includeBases = flags & 2 /* INCLUDE_BASES */;
          var includeMetadata = flags & 64 /* INCLUDE_METADATA */;

          var obj = {};

          var basesVal = obj[publicName("bases")] = includeBases ? [] : null;
          if (flags & 4 /* INCLUDE_INTERFACES */) {
            var interfacesVal = obj[publicName("interfaces")] = [];
            if (flags & 512 /* USE_ITRAITS */) {
              for (var key in cls.implementedInterfaces) {
                var ifaceName = cls.implementedInterfaces[key].getQualifiedClassName();
                interfacesVal.push(ifaceName);
              }
            }
          } else {
            obj[publicName("interfaces")] = null;
          }

          var variablesVal = obj[publicName("variables")] = flags & 8 /* INCLUDE_VARIABLES */ ? [] : null;
          var accessorsVal = obj[publicName("accessors")] = flags & 16 /* INCLUDE_ACCESSORS */ ? [] : null;
          var methodsVal = obj[publicName("methods")] = flags & 32 /* INCLUDE_METHODS */ ? [] : null;

          var encounteredAccessors = {};

          var addBase = false;
          while (cls) {
            var className = unmangledQualifiedName(cls.classInfo.instanceInfo.name);
            if (includeBases && addBase) {
              basesVal.push(className);
            } else {
              addBase = true;
            }
            if (flags & 512 /* USE_ITRAITS */) {
              describeTraits(cls.classInfo.instanceInfo.traits);
            } else {
              describeTraits(cls.classInfo.traits);
            }
            cls = cls.baseClass;
          }

          function describeTraits(traits) {
            release || assert(traits, "No traits array found on class" + cls.classInfo.instanceInfo.name);

            for (var i = 0; traits && i < traits.length; i++) {
              var t = traits[i];
              if (!includedMembers[t.kind] || !t.name.getNamespace().isPublic() && !t.name.uri) {
                continue;
              }
              var name = unmangledQualifiedName(t.name);
              if (encounteredAccessors[name]) {
                var val = encounteredAccessors[name];
                val[accessKey] = 'readwrite';
                if (t.kind === 2 /* Getter */) {
                  val[typeKey] = unmangledQualifiedName(t.methodInfo.returnType);
                }
                continue;
              }
              var val = {};
              if (includeMetadata && t.metadata) {
                var metadataVal = val[metadataKey] = [];
                Object.keys(t.metadata).forEach(function (key) {
                  metadataVal.push(describeMetadata(t.metadata[key]));
                });
              } else {
                val[metadataKey] = null;
              }
              val[declaredByKey] = className;
              val[uriKey] = t.name.uri === undefined ? null : t.name.uri;
              val[nameKey] = name;

              if (!t.typeName && !(t.methodInfo && t.methodInfo.returnType)) {
                continue;
              }
              val[t.kind === 1 /* Method */ ? returnTypeKey : typeKey] = unmangledQualifiedName(t.kind === 0 /* Slot */ ? t.typeName : t.methodInfo.returnType);
              switch (t.kind) {
                case 0 /* Slot */:
                  val[accessKey] = "readwrite";
                  variablesVal.push(val);
                  break;
                case 1 /* Method */:
                  var parametersVal = val[parametersKey] = [];
                  var parameters = t.methodInfo.parameters;
                  for (var j = 0; j < parameters.length; j++) {
                    var param = parameters[j];
                    var paramVal = {};
                    paramVal[typeKey] = param.type ? unmangledQualifiedName(param.type) : '*';
                    paramVal[optionalKey] = 'value' in param;
                    parametersVal.push(paramVal);
                  }
                  methodsVal.push(val);
                  break;
                case 2 /* Getter */:
                case 3 /* Setter */:
                  val[accessKey] = t.kind === 2 /* Getter */ ? "read" : "write";
                  accessorsVal.push(val);
                  encounteredAccessors[name] = val;
                  break;
                default:
                  release || assert(false, "Unknown trait type: " + t.kind);
                  break;
              }
            }
          }
          return obj;
        }
      }
      AS.describeTypeJSON = describeTypeJSON;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var assert = Shumway.Debug.assert;

      var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;

      (function (flash) {
        (function (utils) {
          var _asGetProperty = Object.prototype.asGetProperty;
          var _asSetProperty = Object.prototype.asSetProperty;
          var _asCallProperty = Object.prototype.asCallProperty;
          var _asHasProperty = Object.prototype.asHasProperty;
          var _asHasOwnProperty = Object.prototype.asHasOwnProperty;
          var _asHasTraitProperty = Object.prototype.asHasTraitProperty;
          var _asDeleteProperty = Object.prototype.asDeleteProperty;
          var _asGetEnumerableKeys = Object.prototype.asGetEnumerableKeys;

          var Dictionary = (function (_super) {
            __extends(Dictionary, _super);
            function Dictionary(weakKeys) {
              if (typeof weakKeys === "undefined") { weakKeys = false; }
              false && _super.call(this);
            }
            Dictionary.isTraitsOrDynamicPrototype = function (value) {
              return value === Dictionary.traitsPrototype || value === Dictionary.dynamicPrototype;
            };

            Dictionary.makePrimitiveKey = function (key) {
              if (typeof key === "string" || typeof key === "number") {
                return key;
              }
              release || assert(typeof key === "object" || typeof key === "function", typeof key);
              return undefined;
            };

            Dictionary.prototype.init = function (weakKeys) {
              this.weakKeys = !!weakKeys;
              this.map = new WeakMap();
              if (!weakKeys) {
                this.keys = [];
              }
              this.primitiveMap = createEmptyObject();
            };

            Dictionary.prototype.asGetNumericProperty = function (name) {
              return this.asGetProperty(null, name, 0);
            };

            Dictionary.prototype.asSetNumericProperty = function (name, value) {
              this.asSetProperty(null, name, 0, value);
            };

            Dictionary.prototype.asGetProperty = function (namespaces, name, flags) {
              if (Dictionary.isTraitsOrDynamicPrototype(this)) {
                return _asGetProperty.call(this, namespaces, name, flags);
              }
              var key = Dictionary.makePrimitiveKey(name);
              if (key !== undefined) {
                return this.primitiveMap[key];
              }
              return this.map.get(Object(name));
            };

            Dictionary.prototype.asSetProperty = function (namespaces, name, flags, value) {
              if (Dictionary.isTraitsOrDynamicPrototype(this)) {
                return _asSetProperty.call(this, namespaces, name, flags, value);
              }
              var key = Dictionary.makePrimitiveKey(name);
              if (key !== undefined) {
                this.primitiveMap[key] = value;
                return;
              }
              this.map.set(Object(name), value);
              if (!this.weakKeys && this.keys.indexOf(name) < 0) {
                this.keys.push(name);
              }
            };

            Dictionary.prototype.asHasProperty = function (namespaces, name, flags) {
              if (Dictionary.isTraitsOrDynamicPrototype(this)) {
                return _asHasProperty.call(this, namespaces, name, flags);
              }
              var key = Dictionary.makePrimitiveKey(name);
              if (key !== undefined) {
                return key in this.primitiveMap;
              }
              return this.map.has(Object(name));
            };

            Dictionary.prototype.asDeleteProperty = function (namespaces, name, flags) {
              if (Dictionary.isTraitsOrDynamicPrototype(this)) {
                return _asDeleteProperty.call(this, namespaces, name, flags);
              }
              var key = Dictionary.makePrimitiveKey(name);
              if (key !== undefined) {
                delete this.primitiveMap[key];
              }
              this.map.delete(Object(name));
              var i;
              if (!this.weakKeys && (i = this.keys.indexOf(name)) >= 0) {
                this.keys.splice(i, 1);
              }
              return true;
            };

            Dictionary.prototype.asGetEnumerableKeys = function () {
              if (Dictionary.isTraitsOrDynamicPrototype(this)) {
                return _asGetEnumerableKeys.call(this);
              }
              var primitiveMapKeys = [];
              for (var k in this.primitiveMap) {
                primitiveMapKeys.push(k);
              }
              if (this.weakKeys) {
                return primitiveMapKeys;
              }
              return primitiveMapKeys.concat(this.keys);
            };
            Dictionary.protocol = Dictionary.prototype;
            return Dictionary;
          })(AS.ASNative);
          utils.Dictionary = Dictionary;

          utils.OriginalDictionary = Dictionary;
        })(flash.utils || (flash.utils = {}));
        var utils = flash.utils;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var notImplemented = Shumway.Debug.notImplemented;

      var Namespace = Shumway.AVM2.ABC.Namespace;

      (function (flash) {
        (function (utils) {
          var _asGetProperty = Object.prototype.asGetProperty;
          var _asSetProperty = Object.prototype.asSetProperty;
          var _asCallProperty = Object.prototype.asCallProperty;
          var _asHasProperty = Object.prototype.asHasProperty;
          var _asHasOwnProperty = Object.prototype.asHasOwnProperty;
          var _asHasTraitProperty = Object.prototype.asHasTraitProperty;
          var _asDeleteProperty = Object.prototype.asDeleteProperty;

          var Proxy = (function (_super) {
            __extends(Proxy, _super);
            function Proxy() {
              _super.apply(this, arguments);
            }
            Proxy.prototype.asGetProperty = function (namespaces, name, flags) {
              var self = this;
              if (_asHasTraitProperty.call(self, namespaces, name, flags)) {
                return _asGetProperty.call(self, namespaces, name, flags);
              }
              return _asCallProperty.call(self, [Namespace.PROXY], "getProperty", 0, false, [name]);
            };

            Proxy.prototype.asGetNumericProperty = function (name) {
              return this.asGetProperty(null, name, 0);
            };

            Proxy.prototype.asSetNumericProperty = function (name, value) {
              this.asSetProperty(null, name, 0, value);
            };

            Proxy.prototype.asSetProperty = function (namespaces, name, flags, value) {
              var self = this;
              if (_asHasTraitProperty.call(self, namespaces, name, flags)) {
                _asSetProperty.call(self, namespaces, name, flags, value);
                return;
              }
              _asCallProperty.call(self, [Namespace.PROXY], "setProperty", 0, false, [name, value]);
            };

            Proxy.prototype.asCallProperty = function (namespaces, name, flags, isLex, args) {
              var self = this;
              if (_asHasTraitProperty.call(self, namespaces, name, flags)) {
                return _asCallProperty.call(self, namespaces, name, flags, false, args);
              }
              return _asCallProperty.call(self, [Namespace.PROXY], "callProperty", 0, false, [name].concat(args));
            };

            Proxy.prototype.asHasProperty = function (namespaces, name, flags) {
              var self = this;
              if (_asHasTraitProperty.call(self, namespaces, name, flags)) {
                return _asHasProperty.call(self, namespaces, name, flags);
              }
              return _asCallProperty.call(self, [Namespace.PROXY], "hasProperty", 0, false, [name]);
            };

            Proxy.prototype.asHasOwnProperty = function (namespaces, name, flags) {
              var self = this;
              if (_asHasTraitProperty.call(self, namespaces, name, flags)) {
                return _asHasOwnProperty.call(self, namespaces, name, flags);
              }
              return _asCallProperty.call(self, [Namespace.PROXY], "hasProperty", 0, false, [name]);
            };

            Proxy.prototype.asDeleteProperty = function (namespaces, name, flags) {
              var self = this;
              if (_asHasTraitProperty.call(self, namespaces, name, flags)) {
                return _asDeleteProperty.call(self, namespaces, name, flags);
              }
              return _asCallProperty.call(self, [Namespace.PROXY], "deleteProperty", 0, false, [name]);
            };

            Proxy.prototype.asNextName = function (index) {
              notImplemented("Proxy asNextName");
            };

            Proxy.prototype.asNextValue = function (index) {
              notImplemented("Proxy asNextValue");
            };

            Proxy.prototype.asNextNameIndex = function (index) {
              notImplemented("Proxy asNextNameIndex");
              return;
            };
            Proxy.protocol = Proxy.prototype;
            return Proxy;
          })(AS.ASNative);
          utils.Proxy = Proxy;

          utils.OriginalProxy = Proxy;
        })(flash.utils || (flash.utils = {}));
        var utils = flash.utils;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var notImplemented = Shumway.Debug.notImplemented;
      var unexpected = Shumway.Debug.unexpected;

      var clamp = Shumway.NumberUtilities.clamp;

      var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
      var assert = Shumway.Debug.assert;

      function throwEOFError() {
        notImplemented("throwEOFError");
      }

      function throwRangeError() {
        notImplemented("throwEOFError");
      }

      function throwCompressedDataError() {
        notImplemented("throwEOFError");
      }

      function checkRange(x, min, max) {
        if (x !== clamp(x, min, max)) {
          throwRangeError();
        }
      }

      (function (flash) {
        (function (net) {
          var ObjectEncoding = (function (_super) {
            __extends(ObjectEncoding, _super);
            function ObjectEncoding() {
              _super.apply(this, arguments);
            }
            ObjectEncoding.AMF0 = 0;
            ObjectEncoding.AMF3 = 3;
            ObjectEncoding.DEFAULT = ObjectEncoding.AMF3;
            return ObjectEncoding;
          })(AS.ASNative);
          net.ObjectEncoding = ObjectEncoding;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;

      (function (flash) {
        (function (utils) {
          var _asGetProperty = Object.prototype.asGetProperty;
          var _asSetProperty = Object.prototype.asSetProperty;
          var _asCallProperty = Object.prototype.asCallProperty;
          var _asHasProperty = Object.prototype.asHasProperty;
          var _asHasOwnProperty = Object.prototype.asHasOwnProperty;
          var _asHasTraitProperty = Object.prototype.asHasTraitProperty;
          var _asDeleteProperty = Object.prototype.asDeleteProperty;

          var ByteArray = (function (_super) {
            __extends(ByteArray, _super);
            function ByteArray() {
              false && _super.call(this);
            }
            Object.defineProperty(ByteArray, "defaultObjectEncoding", {
              get: function () {
                return this._defaultObjectEncoding;
              },
              set: function (version) {
                version = version >>> 0;
                this._defaultObjectEncoding = version;
              },
              enumerable: true,
              configurable: true
            });


            ByteArray.prototype.readObject = function () {
              switch (this._objectEncoding) {
                case flash.net.ObjectEncoding.AMF0:
                  return AVM2.AMF0.read(this);
                case flash.net.ObjectEncoding.AMF3:
                  return AVM2.AMF3.read(this);
                default:
                  unexpected("Object Encoding");
              }
            };

            ByteArray.prototype.writeObject = function (object) {
              switch (this._objectEncoding) {
                case flash.net.ObjectEncoding.AMF0:
                  return AVM2.AMF0.write(this, object);
                case flash.net.ObjectEncoding.AMF3:
                  return AVM2.AMF3.write(this, object);
                default:
                  unexpected("Object Encoding");
              }
            };
            ByteArray.instanceConstructor = DataBuffer;
            ByteArray.staticNatives = [DataBuffer];
            ByteArray.instanceNatives = [DataBuffer.prototype];
            ByteArray.callableConstructor = null;

            ByteArray.initializer = function (source) {
              var self = this;

              var BinarySymbol = Shumway.Timeline.BinarySymbol;
              release || assert(BinarySymbol);

              var buffer;
              var length = 0;
              if (source) {
                if (source instanceof ArrayBuffer) {
                  buffer = source.slice();
                } else if (Array.isArray(source)) {
                  buffer = new Uint8Array(buffer).buffer;
                } else if (source instanceof BinarySymbol) {
                  buffer = new Uint8Array(source.buffer).buffer.slice();
                } else if ('buffer' in source) {
                  release || assert(source.buffer instanceof ArrayBuffer);
                  buffer = source.buffer.slice();
                } else {
                  Shumway.Debug.unexpected("Source type.");
                }
                length = buffer.byteLength;
              } else {
                buffer = new ArrayBuffer(ByteArray.INITIAL_SIZE);
              }
              self._buffer = buffer;
              self._length = length;
              self._position = 0;
              self._updateViews();
              self._objectEncoding = ByteArray.defaultObjectEncoding;
              self._littleEndian = false;
              self._bitBuffer = 0;
              self._bitLength = 0;
            };

            ByteArray.protocol = ByteArray.prototype;

            ByteArray.INITIAL_SIZE = 128;

            ByteArray._defaultObjectEncoding = flash.net.ObjectEncoding.DEFAULT;
            return ByteArray;
          })(AS.ASNative);
          utils.ByteArray = ByteArray;

          ByteArray.prototype.asGetNumericProperty = DataBuffer.prototype.getValue;
          ByteArray.prototype.asSetNumericProperty = DataBuffer.prototype.setValue;

          utils.OriginalByteArray = ByteArray;
        })(flash.utils || (flash.utils = {}));
        var utils = flash.utils;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var notImplemented = Shumway.Debug.notImplemented;
      var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

      (function (flash) {
        (function (system) {
          var IME = (function (_super) {
            __extends(IME, _super);
            function IME() {
              false && _super.call(this);
            }
            Object.defineProperty(IME.prototype, "enabled", {
              get: function () {
                notImplemented("public flash.system.IME::get enabled");
                return;
              },
              set: function (enabled) {
                enabled = !!enabled;
                notImplemented("public flash.system.IME::set enabled");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(IME.prototype, "conversionMode", {
              get: function () {
                notImplemented("public flash.system.IME::get conversionMode");
                return;
              },
              set: function (mode) {
                mode = asCoerceString(mode);
                notImplemented("public flash.system.IME::set conversionMode");
                return;
              },
              enumerable: true,
              configurable: true
            });
            IME.setCompositionString = function (composition) {
              composition = asCoerceString(composition);
              notImplemented("public flash.system.IME::static setCompositionString");
              return;
            };
            IME.doConversion = function () {
              notImplemented("public flash.system.IME::static doConversion");
              return;
            };
            IME.compositionSelectionChanged = function (start, end) {
              start = start | 0;
              end = end | 0;
              notImplemented("public flash.system.IME::static compositionSelectionChanged");
              return;
            };
            IME.compositionAbandoned = function () {
              notImplemented("public flash.system.IME::static compositionAbandoned");
              return;
            };
            IME._checkSupported = function () {
              notImplemented("public flash.system.IME::static _checkSupported");
              return;
            };
            return IME;
          })(AS.ASNative);
          system.IME = IME;

          var System = (function (_super) {
            __extends(System, _super);
            function System() {
              _super.apply(this, arguments);
            }
            Object.defineProperty(System, "ime", {
              get: function () {
                notImplemented("public flash.system.System::get ime");
                return;
              },
              enumerable: true,
              configurable: true
            });

            System.setClipboard = function (string) {
              string = asCoerceString(string);
              notImplemented("public flash.system.System::static setClipboard");
              return;
            };

            Object.defineProperty(System, "totalMemoryNumber", {
              get: function () {
                return 1024 * 1024 * 2;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(System, "freeMemory", {
              get: function () {
                return 1024 * 1024;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(System, "privateMemory", {
              get: function () {
                notImplemented("public flash.system.System::get privateMemory");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(System, "processCPUUsage", {
              get: function () {
                notImplemented("public flash.system.System::get processCPUUsage");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(System, "useCodePage", {
              get: function () {
                notImplemented("public flash.system.System::get useCodePage");
                return;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.system.System::set useCodePage");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(System, "vmVersion", {
              get: function () {
                return "1.0 Shumway - Mozilla Research";
              },
              enumerable: true,
              configurable: true
            });

            System.pause = function () {
              notImplemented("public flash.system.System::static pause");
              return;
            };

            System.resume = function () {
              notImplemented("public flash.system.System::static resume");
              return;
            };

            System.exit = function (code) {
              code = code >>> 0;
              notImplemented("public flash.system.System::static exit");
              return;
            };

            System.gc = function () {
              notImplemented("public flash.system.System::static gc");
              return;
            };

            System.pauseForGCIfCollectionImminent = function (imminence) {
              if (typeof imminence === "undefined") { imminence = 0.75; }
              imminence = +imminence;
              notImplemented("public flash.system.System::static pauseForGCIfCollectionImminent");
              return;
            };

            System.disposeXML = function (node) {
              node = node;
              notImplemented("public flash.system.System::static disposeXML");
              return;
            };

            Object.defineProperty(System, "swfVersion", {
              get: function () {
                return 19;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(System, "apiVersion", {
              get: function () {
                return 26;
              },
              enumerable: true,
              configurable: true
            });

            System.getArgv = function () {
              return [];
            };

            System.getRunmode = function () {
              return "mixed";
            };
            return System;
          })(AS.ASNative);
          system.System = System;
          system.OriginalSystem = System;
        })(flash.system || (flash.system = {}));
        var system = flash.system;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (_Verifier) {
      var Multiname = Shumway.AVM2.ABC.Multiname;
      var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
      var ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
      var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;

      var Info = Shumway.AVM2.ABC.Info;
      var MethodInfo = Shumway.AVM2.ABC.MethodInfo;
      var assert = Shumway.Debug.assert;
      var notImplemented = Shumway.Debug.notImplemented;
      var popManyIntoVoid = Shumway.ArrayUtilities.popManyIntoVoid;

      var VerifierError = (function () {
        function VerifierError(message) {
          if (typeof message === "undefined") { message = ""; }
          this.message = message;
          this.name = "VerifierError";
        }
        return VerifierError;
      })();
      _Verifier.VerifierError = VerifierError;

      var TypeInformation = (function () {
        function TypeInformation() {
        }
        return TypeInformation;
      })();
      _Verifier.TypeInformation = TypeInformation;

      var Type = (function () {
        function Type() {
        }
        Type.from = function (info, domain) {
          release || assert(info.hash);
          var type = Type._cache[info.hash];
          if (!type) {
            type = Type._cache[info.hash] = new TraitsType(info, domain);
          }
          return type;
        };

        Type.fromSimpleName = function (name, domain) {
          return Type.fromName(Multiname.fromSimpleName(name), domain);
        };

        Type.fromName = function (mn, domain) {
          if (mn === undefined) {
            return Type.Undefined;
          } else {
            var qn = Multiname.isQName(mn) ? Multiname.getFullQualifiedName(mn) : undefined;
            if (qn) {
              var type = Type._cache.byQN[qn];
              if (type) {
                return type;
              }
            }
            if (qn === Multiname.getPublicQualifiedName("void")) {
              return Type.Void;
            }
            release || assert(domain, "An ApplicationDomain is needed.");
            var info = domain.findClassInfo(mn);
            var type = info ? Type.from(info, domain) : Type.Any;
            if (mn.hasTypeParameter()) {
              type = new ParameterizedType(type, Type.fromName(mn.typeParameter, domain));
            }
            return Type._cache.byQN[qn] = type;
          }
          return null;
        };

        Type.initializeTypes = function (domain) {
          if (Type._typesInitialized) {
            return;
          }
          Type.Any = new AtomType("any", "?");
          Type.Null = new AtomType("Null", "X");
          Type.Void = new AtomType("Void", "V");
          Type.Undefined = new AtomType("Undefined", "_");

          Type.Int = Type.fromSimpleName("int", domain).instanceType();
          Type.Uint = Type.fromSimpleName("uint", domain).instanceType();
          Type.Class = Type.fromSimpleName("Class", domain).instanceType();
          Type.Array = Type.fromSimpleName("Array", domain).instanceType();
          Type.Object = Type.fromSimpleName("Object", domain).instanceType();
          Type.String = Type.fromSimpleName("String", domain).instanceType();
          Type.Number = Type.fromSimpleName("Number", domain).instanceType();
          Type.Boolean = Type.fromSimpleName("Boolean", domain).instanceType();
          Type.Function = Type.fromSimpleName("Function", domain).instanceType();
          Type.XML = Type.fromSimpleName("XML", domain).instanceType();
          Type.XMLList = Type.fromSimpleName("XMLList", domain).instanceType();
          Type.Dictionary = Type.fromSimpleName("flash.utils.Dictionary", domain).instanceType();
          Type._typesInitialized = true;
        };

        Type.prototype.equals = function (other) {
          return this === other;
        };

        Type.prototype.merge = function (other) {
          return Type.Any;
        };

        Type.prototype.instanceType = function () {
          return Type.Any;
        };

        Type.prototype.classType = function () {
          return Type.Any;
        };

        Type.prototype.super = function () {
          Shumway.Debug.abstractMethod("super");
          return null;
        };

        Type.prototype.applyType = function (parameter) {
          return null;
        };

        Type.prototype.getTrait = function (mn, isSetter, followSuperType) {
          return null;
        };

        Type.prototype.isNumeric = function () {
          return this === Type.Int || this === Type.Uint || this === Type.Number;
        };

        Type.prototype.isString = function () {
          return this === Type.String;
        };

        Type.prototype.isScriptInfo = function () {
          return false;
        };

        Type.prototype.isClassInfo = function () {
          return false;
        };

        Type.prototype.isInstanceInfo = function () {
          return false;
        };

        Type.prototype.isMethodInfo = function () {
          return false;
        };

        Type.prototype.isTraitsType = function () {
          return this instanceof TraitsType;
        };

        Type.prototype.isParameterizedType = function () {
          return this instanceof ParameterizedType;
        };

        Type.prototype.isMethodType = function () {
          return this instanceof MethodType;
        };

        Type.prototype.isMultinameType = function () {
          return this instanceof MultinameType;
        };

        Type.prototype.isConstantType = function () {
          return this instanceof ConstantType;
        };

        Type.prototype.isSubtypeOf = function (other) {
          if (this === other || this.equals(other)) {
            return true;
          }
          return this.merge(other) === this;
        };

        Type.prototype.asTraitsType = function () {
          release || assert(this.isTraitsType());
          return this;
        };

        Type.prototype.asMethodType = function () {
          release || assert(this.isMethodType());
          return this;
        };

        Type.prototype.asMultinameType = function () {
          release || assert(this.isMultinameType());
          return this;
        };

        Type.prototype.asConstantType = function () {
          release || assert(this.isConstantType());
          return this;
        };

        Type.prototype.getConstantValue = function () {
          release || assert(this.isConstantType());
          return this.value;
        };

        Type.prototype.asParameterizedType = function () {
          release || assert(this.isParameterizedType());
          return this;
        };
        Type._cache = {
          byQN: Shumway.ObjectUtilities.createEmptyObject(),
          byHash: Shumway.ObjectUtilities.createEmptyObject()
        };

        Type._typesInitialized = false;
        return Type;
      })();
      _Verifier.Type = Type;

      var AtomType = (function (_super) {
        __extends(AtomType, _super);
        function AtomType(name, symbol) {
          _super.call(this);
          this.name = name;
          this.symbol = symbol;
        }
        AtomType.prototype.toString = function () {
          return this.symbol;
        };
        AtomType.prototype.instanceType = function () {
          return Type.Any;
        };
        return AtomType;
      })(Type);
      _Verifier.AtomType = AtomType;

      var TraitsType = (function (_super) {
        __extends(TraitsType, _super);
        function TraitsType(info, domain) {
          _super.call(this);
          this.info = info;
          this.domain = domain;
        }
        TraitsType.prototype.instanceType = function () {
          release || assert(this.info instanceof ClassInfo);
          var classInfo = this.info;
          return (this._cachedType || (this._cachedType = Type.from(classInfo.instanceInfo, this.domain)));
        };

        TraitsType.prototype.classType = function () {
          release || assert(this.info instanceof InstanceInfo);
          var instanceInfo = this.info;
          return (this._cachedType || (this._cachedType = Type.from(instanceInfo.classInfo, this.domain)));
        };

        TraitsType.prototype.super = function () {
          if (this.info instanceof ClassInfo) {
            return Type.Class;
          }
          release || assert(this.info instanceof InstanceInfo);
          var instanceInfo = this.info;
          if (instanceInfo.superName) {
            var result = Type.fromName(instanceInfo.superName, this.domain).instanceType();
            release || assert(result instanceof TraitsType && result.info instanceof InstanceInfo);
            return result;
          }
          return null;
        };

        TraitsType.prototype.findTraitByName = function (traits, mn, isSetter) {
          var isGetter = !isSetter;
          var trait;
          if (!Multiname.isQName(mn)) {
            release || assert(mn instanceof Multiname);
            var multiname = mn;
            var dy;
            for (var i = 0; i < multiname.namespaces.length; i++) {
              var qname = multiname.getQName(i);
              if (mn.namespaces[i].isDynamic()) {
                dy = qname;
              } else {
                if ((trait = this.findTraitByName(traits, qname, isSetter))) {
                  return trait;
                }
              }
            }
            if (dy) {
              return this.findTraitByName(traits, dy, isSetter);
            }
          } else {
            var qn = Multiname.getQualifiedName(mn);
            for (var i = 0; i < traits.length; i++) {
              trait = traits[i];
              if (Multiname.getQualifiedName(trait.name) === qn) {
                if (isSetter && trait.isGetter() || isGetter && trait.isSetter()) {
                  continue;
                }
                return trait;
              }
            }
          }
        };

        TraitsType.prototype.getTrait = function (mn, isSetter, followSuperType) {
          if (mn.isMultinameType()) {
            return null;
          }
          var mnValue = mn.getConstantValue();
          if (mnValue.isAttribute()) {
            return null;
          }
          if (followSuperType && (this.isInstanceInfo() || this.isClassInfo())) {
            var node = this;
            do {
              var trait = node.getTrait(mn, isSetter, false);
              if (!trait) {
                node = node.super();
              }
            } while(!trait && node);
            return trait;
          } else {
            return this.findTraitByName(this.info.traits, mnValue, isSetter);
          }
        };

        TraitsType.prototype.getTraitAt = function (slotId) {
          var traits = this.info.traits;
          for (var i = traits.length - 1; i >= 0; i--) {
            if (traits[i].slotId === slotId) {
              return traits[i];
            }
          }
          Shumway.Debug.unexpected("Cannot find trait with slotId: " + slotId + " in " + traits);
        };

        TraitsType.prototype.equals = function (other) {
          if (other.isTraitsType()) {
            return this.info.traits === other.info.traits;
          }
          return false;
        };

        TraitsType.prototype.merge = function (other) {
          if (other.isTraitsType()) {
            if (this.equals(other)) {
              return this;
            }
            if (this.isNumeric() && other.isNumeric()) {
              return Type.Number;
            }
            if (this.isInstanceInfo() && other.isInstanceInfo()) {
              var path = [];
              for (var curr = this; curr; curr = curr.super()) {
                path.push(curr);
              }
              for (var curr = other; curr; curr = curr.super()) {
                for (var i = 0; i < path.length; i++) {
                  if (path[i].equals(curr)) {
                    return curr;
                  }
                }
              }
              return Type.Object;
            }
          }
          return Type.Any;
        };

        TraitsType.prototype.isScriptInfo = function () {
          return this.info instanceof ScriptInfo;
        };

        TraitsType.prototype.isClassInfo = function () {
          return this.info instanceof ClassInfo;
        };

        TraitsType.prototype.isMethodInfo = function () {
          return this.info instanceof MethodInfo;
        };

        TraitsType.prototype.isInstanceInfo = function () {
          return this.info instanceof InstanceInfo;
        };

        TraitsType.prototype.isInstanceOrClassInfo = function () {
          return this.isInstanceInfo() || this.isClassInfo();
        };

        TraitsType.prototype.applyType = function (parameter) {
          return new ParameterizedType(this, parameter);
        };

        TraitsType.prototype._getInfoName = function () {
          if (this.info instanceof ScriptInfo) {
            return "SI";
          } else if (this.info instanceof ClassInfo) {
            var classInfo = this.info;
            return "CI:" + classInfo.instanceInfo.name.name;
          } else if (this.info instanceof InstanceInfo) {
            var instanceInfo = this.info;
            return "II:" + instanceInfo.name.name;
          } else if (this.info instanceof MethodInfo) {
            return "MI";
          }

          release || assert(false);
        };

        TraitsType.prototype.toString = function () {
          switch (this) {
            case Type.Int:
              return "I";
            case Type.Uint:
              return "U";
            case Type.Array:
              return "A";
            case Type.Object:
              return "O";
            case Type.String:
              return "S";
            case Type.Number:
              return "N";
            case Type.Boolean:
              return "B";
            case Type.Function:
              return "F";
          }
          return this._getInfoName();
        };
        return TraitsType;
      })(Type);
      _Verifier.TraitsType = TraitsType;

      var MethodType = (function (_super) {
        __extends(MethodType, _super);
        function MethodType(methodInfo, domain) {
          _super.call(this, Type.Function.info, domain);
          this.methodInfo = methodInfo;
        }
        MethodType.prototype.toString = function () {
          return "MT " + this.methodInfo;
        };
        MethodType.prototype.returnType = function () {
          return this._cachedType || (this._cachedType = Type.fromName(this.methodInfo.returnType, this.domain));
        };
        return MethodType;
      })(TraitsType);
      _Verifier.MethodType = MethodType;

      var MultinameType = (function (_super) {
        __extends(MultinameType, _super);
        function MultinameType(namespaces, name, flags) {
          _super.call(this);
          this.namespaces = namespaces;
          this.name = name;
          this.flags = flags;
        }
        MultinameType.prototype.toString = function () {
          return "MN";
        };
        return MultinameType;
      })(Type);
      _Verifier.MultinameType = MultinameType;

      var ParameterizedType = (function (_super) {
        __extends(ParameterizedType, _super);
        function ParameterizedType(type, parameter) {
          _super.call(this, type.info, type.domain);
          this.type = type;
          this.parameter = parameter;
        }
        return ParameterizedType;
      })(TraitsType);
      _Verifier.ParameterizedType = ParameterizedType;

      var ConstantType = (function (_super) {
        __extends(ConstantType, _super);
        function ConstantType(value) {
          _super.call(this);
          this.value = value;
        }
        ConstantType.prototype.toString = function () {
          return String(this.value);
        };
        ConstantType.from = function (value) {
          return new ConstantType(value);
        };
        ConstantType.fromArray = function (array) {
          return array.map(function (value) {
            return new ConstantType(value);
          });
        };
        return ConstantType;
      })(Type);
      _Verifier.ConstantType = ConstantType;

      var State = (function () {
        function State() {
          this.id = State.id += 1;
          this.stack = [];
          this.scope = [];
          this.local = [];
        }
        State.prototype.clone = function () {
          var s = new State();
          s.originalId = this.id;
          s.stack = this.stack.slice(0);
          s.scope = this.scope.slice(0);
          s.local = this.local.slice(0);
          return s;
        };
        State.prototype.trace = function (writer) {
          writer.writeLn(this.toString());
        };
        State.prototype.toString = function () {
          return "<" + this.id + (this.originalId ? ":" + this.originalId : "") + ", L[" + this.local.join(", ") + "]" + ", S[" + this.stack.join(", ") + "]" + ", $[" + this.scope.join(", ") + "]>";
        };
        State.prototype.equals = function (other) {
          return State._arrayEquals(this.stack, other.stack) && State._arrayEquals(this.scope, other.scope) && State._arrayEquals(this.local, other.local);
        };
        State._arrayEquals = function (a, b) {
          if (a.length != b.length) {
            return false;
          }
          for (var i = a.length - 1; i >= 0; i--) {
            if (!a[i].equals(b[i])) {
              return false;
            }
          }
          return true;
        };
        State.prototype.isSubset = function (other) {
          return State._arraySubset(this.stack, other.stack) && State._arraySubset(this.scope, other.scope) && State._arraySubset(this.local, other.local);
        };
        State._arraySubset = function (a, b) {
          if (a.length != b.length) {
            return false;
          }
          for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] === b[i] || a[i].equals(b[i])) {
              continue;
            }
            if (a[i].merge(b[i]) !== a[i]) {
              return false;
            }
          }
          return true;
        };
        State.prototype.merge = function (other) {
          State._mergeArrays(this.local, other.local);
          State._mergeArrays(this.stack, other.stack);
          State._mergeArrays(this.scope, other.scope);
        };
        State._mergeArrays = function (a, b) {
          release || assert(a.length === b.length, "a: " + a + " b: " + b);
          for (var i = a.length - 1; i >= 0; i--) {
            release || assert((a[i] !== undefined) && (b[i] !== undefined));
            if (a[i] === b[i]) {
              continue;
            }
            a[i] = a[i].merge(b[i]);
          }
        };
        State.id = 0;
        return State;
      })();
      _Verifier.State = State;

      var Verification = (function () {
        function Verification(methodInfo, domain, savedScope) {
          this.methodInfo = methodInfo;
          this.domain = domain;
          this.savedScope = savedScope;
          this.writer = new Shumway.IndentingWriter();
          this.pushCount = 0;
          this.pushAnyCount = 0;
          Type.initializeTypes(domain);
          this.writer = Shumway.AVM2.Verifier.traceLevel.value ? new Shumway.IndentingWriter() : null;
          this.multinames = methodInfo.abc.constantPool.multinames;
          this.returnType = Type.Undefined;
        }
        Verification.prototype.verify = function () {
          var methodInfo = this.methodInfo;
          if (this.writer) {
            this.methodInfo.trace(this.writer);
          }
          release || assert(methodInfo.localCount >= methodInfo.parameters.length + 1);
          this._verifyBlocks(this._prepareEntryState());
        };

        Verification.prototype._prepareEntryState = function () {
          var writer = this.writer;
          var entryState = new State();
          var methodInfo = this.methodInfo;
          this.thisType = methodInfo.holder ? Type.from(methodInfo.holder, this.domain) : Type.Any;
          entryState.local.push(this.thisType);

          var parameters = methodInfo.parameters;
          for (var i = 0; i < parameters.length; i++) {
            entryState.local.push(Type.fromName(parameters[i].type, this.domain).instanceType());
          }

          var remainingLocals = methodInfo.localCount - methodInfo.parameters.length - 1;

          if (methodInfo.needsRest() || methodInfo.needsArguments()) {
            entryState.local.push(Type.Array);
            remainingLocals -= 1;
          }

          for (var i = 0; i < remainingLocals; i++) {
            entryState.local.push(Type.Undefined);
          }

          release || assert(entryState.local.length === methodInfo.localCount);

          return entryState;
        };

        Verification.prototype._verifyBlocks = function (entryState) {
          var writer = this.writer;

          var blocks = this.methodInfo.analysis.blocks;
          blocks.forEach(function (x) {
            x.verifierEntryState = x.verifierExitState = null;
          });

          for (var i = 0; i < blocks.length; i++) {
            blocks[i].bdo = i;
          }

          var worklist = new Shumway.SortedList(function compare(a, b) {
            return a.bdo - b.bdo;
          });

          blocks[0].verifierEntryState = entryState;
          worklist.push(blocks[0]);

          while (!worklist.isEmpty()) {
            var block = worklist.pop();
            var exitState = block.verifierExitState = block.verifierEntryState.clone();

            this._verifyBlock(block, exitState);

            block.succs.forEach(function (successor) {
              if (worklist.contains(successor)) {
                if (writer) {
                  writer.writeLn("Forward Merged Block: " + successor.bid + " " + exitState.toString() + " with " + successor.verifierEntryState.toString());
                }

                successor.verifierEntryState.merge(exitState);
                if (writer) {
                  writer.writeLn("Merged State: " + successor.verifierEntryState);
                }
                return;
              }

              if (successor.verifierEntryState) {
                if (!successor.verifierEntryState.isSubset(exitState)) {
                  if (writer) {
                    writer.writeLn("Backward Merged Block: " + block.bid + " with " + successor.bid + " " + exitState.toString() + " with " + successor.verifierEntryState.toString());
                  }
                  successor.verifierEntryState.merge(exitState);
                  worklist.push(successor);
                  if (writer) {
                    writer.writeLn("Merged State: " + successor.verifierEntryState);
                  }
                }
                return;
              }

              successor.verifierEntryState = exitState.clone();
              worklist.push(successor);
              if (writer) {
                writer.writeLn("Added Block: " + successor.bid + " to worklist: " + successor.verifierEntryState.toString());
              }
            });
          }

          if (writer) {
            writer.writeLn("Inferred return type: " + this.returnType);
            writer.writeLn("Quality pushCount: " + this.pushCount + ", pushAnyCount: " + this.pushAnyCount);
          }
          this.methodInfo.inferredReturnType = this.returnType;
        };

        Verification.prototype._verifyBlock = function (block, state) {
          var self = this;
          var writer = this.writer;
          var methodInfo = this.methodInfo;
          var bytecodes = (methodInfo.analysis.bytecodes);

          var local = state.local;
          var stack = state.stack;
          var scope = state.scope;
          var bc;

          function ti() {
            return bc.ti || (bc.ti = new TypeInformation());
          }

          function push(x) {
            release || assert(x);
            ti().type = x;
            stack.push(x);
            self.pushCount++;
            if (x === Type.Any) {
              self.pushAnyCount++;
            }
          }

          function pop(expectedType) {
            return stack.pop();
          }

          function notImplementedBC() {
            notImplemented(String(bc));
          }

          function popMultiname() {
            var mn = self.multinames[bc.index];
            if (mn.isRuntime()) {
              var name;
              if (mn.isRuntimeName()) {
                name = pop();
              } else {
                name = ConstantType.from(mn.name);
              }
              var namespaces;
              if (mn.isRuntimeNamespace()) {
                namespaces = [pop()];
              } else {
                namespaces = ConstantType.fromArray(mn.namespaces);
              }
              return new MultinameType(namespaces, name, mn.flags);
            }
            return ConstantType.from(mn);
          }

          function isNumericMultiname(mn) {
            if (mn.isMultinameType() && mn.asMultinameType().name.isNumeric()) {
              return true;
            }
            if (mn.isConstantType() && Multiname.isNumeric(mn.getConstantValue())) {
              return true;
            }
            return false;
          }

          function getProperty(object, mn) {
            if (object.isTraitsType() || object.isParameterizedType()) {
              var traitsType = object;
              var trait = traitsType.getTrait(mn, false, true);
              if (trait) {
                writer && writer.debugLn("getProperty(" + mn + ") -> " + trait);
                ti().trait = trait;
                if (trait.isSlot() || trait.isConst()) {
                  return Type.fromName(trait.typeName, self.domain).instanceType();
                } else if (trait.isGetter()) {
                  return Type.fromName(trait.methodInfo.returnType, self.domain).instanceType();
                } else if (trait.isClass()) {
                  return Type.from(trait.classInfo, self.domain);
                } else if (trait.isMethod()) {
                  return new MethodType(trait.methodInfo, self.domain);
                }
              } else if (isNumericMultiname(mn) && traitsType.isParameterizedType()) {
                var parameter = traitsType.asParameterizedType().parameter;
                writer && writer.debugLn("getProperty(" + mn + ") -> " + parameter);
                return parameter;
              } else if (traitsType === Type.Array) {
              } else {
                writer && writer.warnLn("getProperty(" + mn + ")");
              }
            }
            return Type.Any;
          }

          function setProperty(object, mn, value) {
            if (object.isTraitsType() || object.isParameterizedType()) {
              var traitsType = object;
              var trait = traitsType.getTrait(mn, true, true);
              if (trait) {
                writer && writer.debugLn("setProperty(" + mn + ") -> " + trait);
                ti().trait = trait;
              } else if (isNumericMultiname(mn) && traitsType.isParameterizedType()) {
              } else if (traitsType === Type.Array) {
              } else {
                writer && writer.warnLn("setProperty(" + mn + ")");
              }
            }
          }

          function findProperty(mn, strict) {
            if (mn.isMultinameType()) {
              return Type.Any;
            }

            var savedScope = self.savedScope;

            for (var i = scope.length - 1; i >= -savedScope.length; i--) {
              var type = i >= 0 ? scope[i] : savedScope[savedScope.length + i];
              if (type.isTraitsType()) {
                var traitsType = type;

                var trait = traitsType.getTrait(mn, false, true);
                if (trait) {
                  ti().scopeDepth = scope.length - i - 1;
                  if (traitsType.isClassInfo() || traitsType.isScriptInfo()) {
                    ti().object = AVM2.Runtime.LazyInitializer.create(traitsType.info);
                  }
                  writer && writer.debugLn("findProperty(" + mn + ") -> " + traitsType);
                  return traitsType;
                }
              } else {
                writer && writer.warnLn("findProperty(" + mn + ")");
                return Type.Any;
              }
            }

            var resolved = self.domain.findDefiningScript(mn.getConstantValue(), false);
            if (resolved) {
              ti().object = AVM2.Runtime.LazyInitializer.create(resolved.script);
              var type = Type.from(resolved.script, self.domain);
              writer && writer.debugLn("findProperty(" + mn + ") -> " + type);
              return type;
            }

            if (mn.isConstantType()) {
              if (mn.getConstantValue().name === "unsafeJSNative") {
                return Type.Any;
              }
            }

            writer && writer.warnLn("findProperty(" + mn + ")");
            return Type.Any;
          }

          function accessSlot(object) {
            if (object instanceof TraitsType) {
              var traitsType = object;
              var trait = traitsType.getTraitAt(bc.index);
              writer && writer.debugLn("accessSlot() -> " + trait);
              if (trait) {
                ti().trait = trait;
                if (trait.isSlot()) {
                  return Type.fromName(trait.typeName, self.domain).instanceType();
                } else if (trait.isClass()) {
                  return Type.from(trait.classInfo, self.domain);
                }
              }
            }
            return Type.Any;
          }

          function construct(object) {
            if (object.isTraitsType() || object.isParameterizedType()) {
              if (object === Type.Function || object === Type.Class || object === Type.Object) {
                return Type.Object;
              }
              return object.instanceType();
            } else {
              writer && writer.warnLn("construct(" + object + ")");
              return Type.Any;
            }
          }

          var globalScope = this.savedScope[0];
          var value, object, a, b, object, mn, type, returnType;

          for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
            bc = bytecodes[bci];
            var op = bc.op;

            if (op === 240 /* debugline */ || op === 241 /* debugfile */) {
              continue;
            }

            if (writer && Shumway.AVM2.Verifier.traceLevel.value > 1) {
              writer.writeLn(("stateBefore: " + state.toString() + " $$[" + this.savedScope.join(", ") + "]").padRight(' ', 100) + " : " + bci + ", " + bc.toString(methodInfo.abc));
            }

            switch (op) {
              case 1 /* bkpt */:
                break;
              case 3 /* throw */:
                pop();
                break;
              case 4 /* getsuper */:
                mn = popMultiname();
                object = pop();
                release || assert(object.super());
                ti().baseClass = AVM2.Runtime.LazyInitializer.create(this.thisType.asTraitsType().super().classType().info);
                push(getProperty(object.super(), mn));
                break;
              case 5 /* setsuper */:
                value = pop();
                mn = popMultiname();
                object = pop();
                release || assert(object.super());
                ti().baseClass = AVM2.Runtime.LazyInitializer.create(this.thisType.asTraitsType().super().classType().info);
                setProperty(object.super(), mn, value);
                break;
              case 6 /* dxns */:
                notImplementedBC();
                break;
              case 7 /* dxnslate */:
                notImplementedBC();
                break;
              case 8 /* kill */:
                state.local[bc.index] = Type.Undefined;
                break;
              case 10 /* lf32x4 */:
                notImplementedBC();
                break;
              case 11 /* sf32x4 */:
                notImplementedBC();
                break;
              case 12 /* ifnlt */:
              case 24 /* ifge */:
              case 13 /* ifnle */:
              case 23 /* ifgt */:
              case 14 /* ifngt */:
              case 22 /* ifle */:
              case 15 /* ifnge */:
              case 21 /* iflt */:
              case 19 /* ifeq */:
              case 20 /* ifne */:
              case 25 /* ifstricteq */:
              case 26 /* ifstrictne */:
                pop();
                pop();
                break;
              case 16 /* jump */:
                break;
              case 17 /* iftrue */:
              case 18 /* iffalse */:
                pop();
                break;
              case 27 /* lookupswitch */:
                pop(Type.Int);
                break;
              case 29 /* popscope */:
                scope.pop();
                break;
              case 30 /* nextname */:
              case 35 /* nextvalue */:
                pop(Type.Int);
                pop();
                push(Type.Any);
                break;
              case 31 /* hasnext */:
                push(Type.Boolean);
                break;
              case 50 /* hasnext2 */:
                push(Type.Boolean);
                break;
              case 32 /* pushnull */:
                push(Type.Null);
                break;
              case 33 /* pushundefined */:
                push(Type.Undefined);
                break;
              case 34 /* pushfloat */:
                notImplementedBC();
                break;
              case 36 /* pushbyte */:
                push(Type.Int);
                break;
              case 37 /* pushshort */:
                push(Type.Int);
                break;
              case 44 /* pushstring */:
                push(Type.String);
                break;
              case 45 /* pushint */:
                push(Type.Int);
                break;
              case 46 /* pushuint */:
                push(Type.Uint);
                break;
              case 47 /* pushdouble */:
                push(Type.Number);
                break;
              case 38 /* pushtrue */:
                push(Type.Boolean);
                break;
              case 39 /* pushfalse */:
                push(Type.Boolean);
                break;
              case 40 /* pushnan */:
                push(Type.Number);
                break;
              case 41 /* pop */:
                pop();
                break;
              case 42 /* dup */:
                value = pop();
                push(value);
                push(value);
                break;
              case 43 /* swap */:
                a = pop();
                b = pop();
                push(a);
                push(b);
                break;
              case 28 /* pushwith */:
                pop();
                scope.push(Type.Any);
                break;
              case 48 /* pushscope */:
                scope.push(pop());
                break;
              case 49 /* pushnamespace */:
                notImplementedBC();
                break;
              case 53 /* li8 */:
              case 54 /* li16 */:
              case 55 /* li32 */:
                push(Type.Int);
                break;
              case 56 /* lf32 */:
              case 57 /* lf64 */:
                push(Type.Number);
                break;
              case 58 /* si8 */:
              case 59 /* si16 */:
              case 60 /* si32 */:
                pop(Type.Int);
                break;
              case 61 /* sf32 */:
              case 62 /* sf64 */:
                pop(Type.Number);
                break;
              case 64 /* newfunction */:
                push(Type.Function);
                break;
              case 65 /* call */:
                popManyIntoVoid(stack, bc.argCount);
                object = pop();
                pop();
                push(Type.Any);
                break;
              case 67 /* callmethod */:
                throw new VerifierError("callmethod");
              case 68 /* callstatic */:
                notImplementedBC();
                break;
              case 69 /* callsuper */:
              case 78 /* callsupervoid */:
              case 79 /* callpropvoid */:
              case 70 /* callproperty */:
              case 76 /* callproplex */:
                popManyIntoVoid(stack, bc.argCount);
                mn = popMultiname();
                object = pop();
                if (op === 69 /* callsuper */ || op === 78 /* callsupervoid */) {
                  object = this.thisType.super();
                  ti().baseClass = AVM2.Runtime.LazyInitializer.create(this.thisType.asTraitsType().super().classType().info);
                }
                type = getProperty(object, mn);
                if (op === 79 /* callpropvoid */ || op === 78 /* callsupervoid */) {
                  break;
                }
                if (type.isMethodType()) {
                  returnType = type.asMethodType().returnType().instanceType();
                } else if (type.isTraitsType() && type.isClassInfo()) {
                  returnType = type.instanceType();
                } else {
                  returnType = Type.Any;
                }
                push(returnType);
                break;
              case 71 /* returnvoid */:
                this.returnType.merge(Type.Undefined);
                break;
              case 72 /* returnvalue */:
                type = pop();
                if (methodInfo.returnType) {
                  var coerceType = Type.fromName(methodInfo.returnType, this.domain).instanceType();
                  if (coerceType.isSubtypeOf(type)) {
                    ti().noCoercionNeeded = true;
                  }
                }
                break;
              case 73 /* constructsuper */:
                popManyIntoVoid(stack, bc.argCount);
                stack.pop();
                if (this.thisType.isInstanceInfo() && this.thisType.super() === Type.Object) {
                  ti().noCallSuperNeeded = true;
                } else {
                  ti().baseClass = AVM2.Runtime.LazyInitializer.create(this.thisType.asTraitsType().super().classType().info);
                }
                break;
              case 66 /* construct */:
                popManyIntoVoid(stack, bc.argCount);
                push(construct(pop()));
                break;
              case 74 /* constructprop */:
                popManyIntoVoid(stack, bc.argCount);
                mn = popMultiname();
                push(construct(getProperty(stack.pop(), mn)));
                break;
              case 75 /* callsuperid */:
                notImplementedBC();
                break;
              case 77 /* callinterface */:
                notImplementedBC();
                break;
              case 80 /* sxi1 */:
              case 81 /* sxi8 */:
              case 82 /* sxi16 */:
                break;
              case 83 /* applytype */:
                release || assert(bc.argCount === 1);
                value = pop();
                object = pop();
                if (object === Type.Any) {
                  push(Type.Any);
                } else {
                  push(object.applyType(value));
                }
                break;
              case 84 /* pushfloat4 */:
                notImplementedBC();
                break;
              case 85 /* newobject */:
                popManyIntoVoid(stack, bc.argCount * 2);
                push(Type.Object);
                break;
              case 86 /* newarray */:
                popManyIntoVoid(stack, bc.argCount);
                push(Type.Array);
                break;
              case 87 /* newactivation */:
                push(Type.from(this.methodInfo, this.domain));
                break;
              case 88 /* newclass */:
                push(Type.Any);
                break;
              case 89 /* getdescendants */:
                popMultiname();
                pop();
                push(Type.XMLList);
                break;
              case 90 /* newcatch */:
                push(Type.Any);
                break;
              case 93 /* findpropstrict */:
                push(findProperty(popMultiname(), true));
                break;
              case 94 /* findproperty */:
                push(findProperty(popMultiname(), false));
                break;
              case 95 /* finddef */:
                notImplementedBC();
                break;
              case 96 /* getlex */:
                mn = popMultiname();
                push(getProperty(findProperty(mn, true), mn));
                break;
              case 104 /* initproperty */:
              case 97 /* setproperty */:
                value = pop();
                mn = popMultiname();
                object = pop();
                setProperty(object, mn, value);
                break;
              case 98 /* getlocal */:
                push(local[bc.index]);
                break;
              case 99 /* setlocal */:
                local[bc.index] = pop();
                break;
              case 100 /* getglobalscope */:
                push(globalScope);
                ti().object = AVM2.Runtime.LazyInitializer.create(globalScope.asTraitsType().info);
                break;
              case 101 /* getscopeobject */:
                push(scope[bc.index]);
                break;
              case 102 /* getproperty */:
                mn = popMultiname();
                object = pop();
                push(getProperty(object, mn));
                break;
              case 103 /* getouterscope */:
                notImplementedBC();
                break;
              case 105 /* setpropertylate */:
                notImplementedBC();
                break;
              case 106 /* deleteproperty */:
                popMultiname();
                pop();
                push(Type.Boolean);
                break;
              case 107 /* deletepropertylate */:
                notImplementedBC();
                break;
              case 108 /* getslot */:
                push(accessSlot(pop()));
                break;
              case 109 /* setslot */:
                value = pop();
                object = pop();
                accessSlot(object);
                break;
              case 110 /* getglobalslot */:
                notImplementedBC();
                break;
              case 111 /* setglobalslot */:
                notImplementedBC();
                break;
              case 112 /* convert_s */:
                pop();
                push(Type.String);
                break;
              case 113 /* esc_xelem */:
                pop();
                push(Type.String);
                break;
              case 114 /* esc_xattr */:
                pop();
                push(Type.String);
                break;
              case 131 /* coerce_i */:
              case 115 /* convert_i */:
                pop();
                push(Type.Int);
                break;
              case 136 /* coerce_u */:
              case 116 /* convert_u */:
                pop();
                push(Type.Uint);
                break;
              case 132 /* coerce_d */:
              case 117 /* convert_d */:
                pop();
                push(Type.Number);
                break;
              case 129 /* coerce_b */:
              case 118 /* convert_b */:
                pop();
                push(Type.Boolean);
                break;
              case 119 /* convert_o */:
                notImplementedBC();
                break;
              case 120 /* checkfilter */:
                break;
              case 121 /* convert_f */:
                pop();
                push(Type.Number);
                break;
              case 122 /* unplus */:
                notImplementedBC();
                break;
              case 123 /* convert_f4 */:
                notImplementedBC();
                break;
              case 128 /* coerce */:
                type = pop();
                var coerceType = Type.fromName(this.multinames[bc.index], this.domain).instanceType();
                if (coerceType.isSubtypeOf(type)) {
                  ti().noCoercionNeeded = true;
                }
                push(coerceType);
                break;
              case 130 /* coerce_a */:
                break;
              case 133 /* coerce_s */:
                pop();
                push(Type.String);
                break;
              case 134 /* astype */:
                type = pop();
                var asType = Type.fromName(this.multinames[bc.index], this.domain).instanceType();
                if (asType.isSubtypeOf(type)) {
                  ti().noCoercionNeeded = true;
                }
                push(asType);
                break;
              case 135 /* astypelate */:
                type = pop();
                pop();
                if (type.isTraitsType()) {
                  push(type.instanceType());
                } else {
                  push(Type.Any);
                }
                break;
              case 137 /* coerce_o */:
                notImplementedBC();
                break;
              case 144 /* negate */:
              case 145 /* increment */:
              case 147 /* decrement */:
                pop();
                push(Type.Number);
                break;
              case 146 /* inclocal */:
              case 148 /* declocal */:
                local[bc.index] = Type.Number;
                break;
              case 149 /* typeof */:
                pop();
                push(Type.String);
                break;
              case 150 /* not */:
                pop();
                push(Type.Boolean);
                break;
              case 160 /* add */:
                b = pop();
                a = pop();
                if (a.isNumeric() && b.isNumeric()) {
                  push(Type.Number);
                } else if (a === Type.String || b === Type.String) {
                  push(Type.String);
                } else {
                  push(Type.Any);
                }
                break;
              case 161 /* subtract */:
              case 162 /* multiply */:
              case 163 /* divide */:
              case 164 /* modulo */:
                pop();
                pop();
                push(Type.Number);
                break;
              case 168 /* bitand */:
              case 169 /* bitor */:
              case 170 /* bitxor */:
              case 165 /* lshift */:
              case 166 /* rshift */:
              case 167 /* urshift */:
                pop();
                pop();
                push(Type.Int);
                break;
              case 151 /* bitnot */:
                pop();
                push(Type.Int);
                break;
              case 171 /* equals */:
              case 172 /* strictequals */:
              case 173 /* lessthan */:
              case 174 /* lessequals */:
              case 175 /* greaterthan */:
              case 176 /* greaterequals */:
              case 177 /* instanceof */:
              case 180 /* in */:
                pop();
                pop();
                push(Type.Boolean);
                break;
              case 178 /* istype */:
                pop();
                push(Type.Boolean);
                break;
              case 179 /* istypelate */:
                pop();
                pop();
                push(Type.Boolean);
                break;
              case 194 /* inclocal_i */:
              case 195 /* declocal_i */:
                local[bc.index] = Type.Int;
                break;
              case 193 /* decrement_i */:
              case 192 /* increment_i */:
              case 196 /* negate_i */:
                pop();
                push(Type.Int);
                break;
              case 197 /* add_i */:
              case 198 /* subtract_i */:
              case 199 /* multiply_i */:
                pop();
                pop();
                push(Type.Int);
                break;
              case 208 /* getlocal0 */:
              case 209 /* getlocal1 */:
              case 210 /* getlocal2 */:
              case 211 /* getlocal3 */:
                push(local[op - 208 /* getlocal0 */]);
                break;
              case 212 /* setlocal0 */:
              case 213 /* setlocal1 */:
              case 214 /* setlocal2 */:
              case 215 /* setlocal3 */:
                local[op - 212 /* setlocal0 */] = pop();
                break;
              case 239 /* debug */:
                break;
              case 242 /* bkptline */:
                break;
              case 243 /* timestamp */:
                break;
              default:
                console.info("Not Implemented: " + bc);
            }
          }
        };
        return Verification;
      })();

      var Verifier = (function () {
        function Verifier() {
        }
        Verifier.prototype._prepareScopeObjects = function (methodInfo, scope) {
          var domain = methodInfo.abc.applicationDomain;
          var scopeObjects = scope.getScopeObjects();
          return scopeObjects.map(function (object) {
            if (object instanceof Info) {
              return Type.from(object, domain);
            }
            if (object instanceof Shumway.AVM2.Runtime.Global) {
              return Type.from(object.scriptInfo, domain);
            }
            if (object instanceof Shumway.AVM2.AS.ASClass) {
              return Type.from(object.classInfo, domain);
            }
            if (object instanceof Shumway.AVM2.Runtime.ActivationInfo) {
              return Type.from(object.methodInfo, domain);
            }
            if (object.class) {
              return Type.from(object.class.classInfo.instanceInfo, domain);
            }
            release || assert(false, object.toString());
            return Type.Any;
          });
        };
        Verifier.prototype.verifyMethod = function (methodInfo, scope) {
          var scopeTypes = this._prepareScopeObjects(methodInfo, scope);
          new Verification(methodInfo, methodInfo.abc.applicationDomain, scopeTypes).verify();
        };
        return Verifier;
      })();
      _Verifier.Verifier = Verifier;
    })(AVM2.Verifier || (AVM2.Verifier = {}));
    var Verifier = AVM2.Verifier;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Compiler) {
      (function (IR) {
        var assert = Shumway.Debug.assert;
        var Multiname = Shumway.AVM2.ABC.Multiname;
        var unexpected = Shumway.Debug.unexpected;
        var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;

        function visitArrayInputs(array, visitor) {
          for (var i = 0; i < array.length; i++) {
            visitor(array[i]);
          }
        }

        (function (Flags) {
          Flags[Flags["NumericProperty"] = 0x01] = "NumericProperty";
          Flags[Flags["RESOLVED"] = 0x02] = "RESOLVED";
          Flags[Flags["PRISTINE"] = 0x04] = "PRISTINE";
          Flags[Flags["IS_METHOD"] = 0x08] = "IS_METHOD";
          Flags[Flags["AS_CALL"] = 0x10] = "AS_CALL";
        })(IR.Flags || (IR.Flags = {}));
        var Flags = IR.Flags;

        var Node = (function () {
          function Node() {
            this.id = Node.getNextID();
          }
          Node.getNextID = function () {
            return Node._nextID[Node._nextID.length - 1] += 1;
          };

          Node.prototype.visitInputs = function (visitor) {
          };

          Node.startNumbering = function () {
            Node._nextID.push(0);
          };

          Node.stopNumbering = function () {
            Node._nextID.pop();
          };

          Node.prototype.toString = function (brief) {
            if (brief) {
              return nameOf(this);
            }
            var inputs = [];
            this.visitInputs(function (input) {
              inputs.push(nameOf(input));
            });
            var result = nameOf(this) + " = " + this.nodeName.toUpperCase();
            if (inputs.length) {
              result += " " + inputs.join(", ");
            }
            return result;
          };

          Node.prototype.visitInputsNoConstants = function (visitor) {
            this.visitInputs(function (node) {
              if (IR.isConstant(node)) {
                return;
              }
              visitor(node);
            });
          };

          Node.prototype.replaceInput = function (oldInput, newInput) {
            var count = 0;
            for (var k in this) {
              var v = this[k];
              if (v instanceof Node) {
                if (v === oldInput) {
                  this[k] = newInput;
                  count++;
                }
              }
              if (v instanceof Array) {
                count += v.replace(oldInput, newInput);
              }
            }
            return count;
          };
          Node._nextID = [];
          return Node;
        })();
        IR.Node = Node;

        Node.prototype.nodeName = "Node";

        var Control = (function (_super) {
          __extends(Control, _super);
          function Control() {
            _super.call(this);
          }
          return Control;
        })(Node);
        IR.Control = Control;
        Control.prototype.nodeName = "Control";

        var Region = (function (_super) {
          __extends(Region, _super);
          function Region(control) {
            _super.call(this);
            this.predecessors = control ? [control] : [];
          }
          Region.prototype.visitInputs = function (visitor) {
            visitArrayInputs(this.predecessors, visitor);
          };
          return Region;
        })(Control);
        IR.Region = Region;
        Region.prototype.nodeName = "Region";

        var Start = (function (_super) {
          __extends(Start, _super);
          function Start() {
            _super.call(this, null);
            this.control = this;
          }
          Start.prototype.visitInputs = function (visitor) {
            visitArrayInputs(this.predecessors, visitor);
            visitor(this.scope);
          };
          return Start;
        })(Region);
        IR.Start = Start;
        Start.prototype.nodeName = "Start";

        var End = (function (_super) {
          __extends(End, _super);
          function End(control) {
            _super.call(this);
            this.control = control;
          }
          End.prototype.visitInputs = function (visitor) {
            visitor(this.control);
          };
          return End;
        })(Control);
        IR.End = End;
        End.prototype.nodeName = "End";

        var Stop = (function (_super) {
          __extends(Stop, _super);
          function Stop(control, store, argument) {
            _super.call(this, control);
            this.store = store;
            this.argument = argument;
          }
          Stop.prototype.visitInputs = function (visitor) {
            visitor(this.control);
            visitor(this.store);
            visitor(this.argument);
          };
          return Stop;
        })(End);
        IR.Stop = Stop;
        Stop.prototype.nodeName = "Stop";

        var If = (function (_super) {
          __extends(If, _super);
          function If(control, predicate) {
            _super.call(this, control);
            this.predicate = predicate;
          }
          If.prototype.visitInputs = function (visitor) {
            visitor(this.control);
            visitor(this.predicate);
          };
          return If;
        })(End);
        IR.If = If;
        If.prototype.nodeName = "If";

        var Switch = (function (_super) {
          __extends(Switch, _super);
          function Switch(control, determinant) {
            _super.call(this, control);
            this.determinant = determinant;
          }
          Switch.prototype.visitInputs = function (visitor) {
            visitor(this.control);
            visitor(this.determinant);
          };
          return Switch;
        })(End);
        IR.Switch = Switch;
        Switch.prototype.nodeName = "Switch";

        var Jump = (function (_super) {
          __extends(Jump, _super);
          function Jump(control) {
            _super.call(this, control);
          }
          Jump.prototype.visitInputs = function (visitor) {
            visitor(this.control);
          };
          return Jump;
        })(End);
        IR.Jump = Jump;
        Jump.prototype.nodeName = "Jump";

        var Value = (function (_super) {
          __extends(Value, _super);
          function Value() {
            _super.call(this);
          }
          return Value;
        })(Node);
        IR.Value = Value;
        Value.prototype.nodeName = "Value";

        var Store = (function (_super) {
          __extends(Store, _super);
          function Store() {
            _super.call(this);
          }
          return Store;
        })(Value);
        IR.Store = Store;
        Store.prototype.nodeName = "Store";

        var StoreDependent = (function (_super) {
          __extends(StoreDependent, _super);
          function StoreDependent(control, store) {
            _super.call(this);
            this.control = control;
            this.store = store;
          }
          StoreDependent.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            this.store && visitor(this.store);
            this.loads && visitArrayInputs(this.loads, visitor);
          };
          return StoreDependent;
        })(Value);
        IR.StoreDependent = StoreDependent;

        StoreDependent.prototype.nodeName = "StoreDependent";

        var Call = (function (_super) {
          __extends(Call, _super);
          function Call(control, store, callee, object, args, flags) {
            _super.call(this, control, store);
            this.callee = callee;
            this.object = object;
            this.args = args;
            this.flags = flags;
          }
          Call.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            this.store && visitor(this.store);
            this.loads && visitArrayInputs(this.loads, visitor);
            visitor(this.callee);
            this.object && visitor(this.object);
            visitArrayInputs(this.args, visitor);
          };
          return Call;
        })(StoreDependent);
        IR.Call = Call;

        Call.prototype.nodeName = "Call";

        var New = (function (_super) {
          __extends(New, _super);
          function New(control, store, callee, args) {
            _super.call(this, control, store);
            this.callee = callee;
            this.args = args;
          }
          New.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            this.store && visitor(this.store);
            this.loads && visitArrayInputs(this.loads, visitor);
            visitor(this.callee);
            visitArrayInputs(this.args, visitor);
          };
          return New;
        })(StoreDependent);
        IR.New = New;

        New.prototype.nodeName = "New";

        var GetProperty = (function (_super) {
          __extends(GetProperty, _super);
          function GetProperty(control, store, object, name) {
            _super.call(this, control, store);
            this.object = object;
            this.name = name;
          }
          GetProperty.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            this.store && visitor(this.store);
            this.loads && visitArrayInputs(this.loads, visitor);
            visitor(this.object);
            visitor(this.name);
          };
          return GetProperty;
        })(StoreDependent);
        IR.GetProperty = GetProperty;

        GetProperty.prototype.nodeName = "GetProperty";

        var SetProperty = (function (_super) {
          __extends(SetProperty, _super);
          function SetProperty(control, store, object, name, value) {
            _super.call(this, control, store);
            this.object = object;
            this.name = name;
            this.value = value;
          }
          SetProperty.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            this.store && visitor(this.store);
            this.loads && visitArrayInputs(this.loads, visitor);
            visitor(this.object);
            visitor(this.name);
            visitor(this.value);
          };
          return SetProperty;
        })(StoreDependent);
        IR.SetProperty = SetProperty;

        SetProperty.prototype.nodeName = "SetProperty";

        var DeleteProperty = (function (_super) {
          __extends(DeleteProperty, _super);
          function DeleteProperty(control, store, object, name) {
            _super.call(this, control, store);
            this.object = object;
            this.name = name;
          }
          DeleteProperty.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            this.store && visitor(this.store);
            this.loads && visitArrayInputs(this.loads, visitor);
            visitor(this.object);
            visitor(this.name);
          };
          return DeleteProperty;
        })(StoreDependent);
        IR.DeleteProperty = DeleteProperty;

        DeleteProperty.prototype.nodeName = "DeleteProperty";

        var CallProperty = (function (_super) {
          __extends(CallProperty, _super);
          function CallProperty(control, store, object, name, args, flags) {
            _super.call(this, control, store);
            this.object = object;
            this.name = name;
            this.args = args;
            this.flags = flags;
          }
          CallProperty.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            this.store && visitor(this.store);
            this.loads && visitArrayInputs(this.loads, visitor);
            visitor(this.object);
            visitor(this.name);
            visitArrayInputs(this.args, visitor);
          };
          return CallProperty;
        })(StoreDependent);
        IR.CallProperty = CallProperty;

        CallProperty.prototype.nodeName = "CallProperty";

        var Phi = (function (_super) {
          __extends(Phi, _super);
          function Phi(control, value) {
            _super.call(this);
            this.control = control;
            this.control = control;
            this.args = value ? [value] : [];
          }
          Phi.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            visitArrayInputs(this.args, visitor);
          };
          Phi.prototype.seal = function () {
            this.sealed = true;
          };
          Phi.prototype.pushValue = function (x) {
            release || assert(!this.sealed);
            this.args.push(x);
          };
          return Phi;
        })(Value);
        IR.Phi = Phi;

        Phi.prototype.nodeName = "Phi";

        var Variable = (function (_super) {
          __extends(Variable, _super);
          function Variable(name) {
            _super.call(this);
            this.name = name;
          }
          return Variable;
        })(Value);
        IR.Variable = Variable;

        Variable.prototype.nodeName = "Variable";

        var Copy = (function (_super) {
          __extends(Copy, _super);
          function Copy(argument) {
            _super.call(this);
            this.argument = argument;
          }
          Copy.prototype.visitInputs = function (visitor) {
            visitor(this.argument);
          };
          return Copy;
        })(Value);
        IR.Copy = Copy;

        Copy.prototype.nodeName = "Copy";

        var Move = (function (_super) {
          __extends(Move, _super);
          function Move(to, from) {
            _super.call(this);
            this.to = to;
            this.from = from;
          }
          Move.prototype.visitInputs = function (visitor) {
            visitor(this.to);
            visitor(this.from);
          };
          return Move;
        })(Value);
        IR.Move = Move;

        Move.prototype.nodeName = "Move";

        (function (ProjectionType) {
          ProjectionType[ProjectionType["CASE"] = 0] = "CASE";
          ProjectionType[ProjectionType["TRUE"] = 1] = "TRUE";
          ProjectionType[ProjectionType["FALSE"] = 2] = "FALSE";
          ProjectionType[ProjectionType["STORE"] = 3] = "STORE";
          ProjectionType[ProjectionType["SCOPE"] = 4] = "SCOPE";
        })(IR.ProjectionType || (IR.ProjectionType = {}));
        var ProjectionType = IR.ProjectionType;

        var Projection = (function (_super) {
          __extends(Projection, _super);
          function Projection(argument, type, selector) {
            _super.call(this);
            this.argument = argument;
            this.type = type;
            this.selector = selector;
          }
          Projection.prototype.visitInputs = function (visitor) {
            visitor(this.argument);
          };
          Projection.prototype.project = function () {
            return this.argument;
          };
          return Projection;
        })(Value);
        IR.Projection = Projection;

        Projection.prototype.nodeName = "Projection";

        var Latch = (function (_super) {
          __extends(Latch, _super);
          function Latch(control, condition, left, right) {
            _super.call(this);
            this.control = control;
            this.condition = condition;
            this.left = left;
            this.right = right;
          }
          Latch.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            visitor(this.condition);
            visitor(this.left);
            visitor(this.right);
          };
          return Latch;
        })(Value);
        IR.Latch = Latch;

        Latch.prototype.nodeName = "Latch";

        var Operator = (function () {
          function Operator(name, evaluate, isBinary) {
            this.name = name;
            this.evaluate = evaluate;
            this.isBinary = isBinary;
            Operator.byName[name] = this;
          }
          Operator.linkOpposites = function (a, b) {
            a.not = b;
            b.not = a;
          };

          Operator.fromName = function (name) {
            return Operator.byName[name];
          };
          Operator.byName = createEmptyObject();

          Operator.ADD = new Operator("+", function (l, r) {
            return l + r;
          }, true);
          Operator.SUB = new Operator("-", function (l, r) {
            return l - r;
          }, true);
          Operator.MUL = new Operator("*", function (l, r) {
            return l * r;
          }, true);
          Operator.DIV = new Operator("/", function (l, r) {
            return l / r;
          }, true);
          Operator.MOD = new Operator("%", function (l, r) {
            return l % r;
          }, true);
          Operator.AND = new Operator("&", function (l, r) {
            return l & r;
          }, true);
          Operator.OR = new Operator("|", function (l, r) {
            return l | r;
          }, true);
          Operator.XOR = new Operator("^", function (l, r) {
            return l ^ r;
          }, true);
          Operator.LSH = new Operator("<<", function (l, r) {
            return l << r;
          }, true);
          Operator.RSH = new Operator(">>", function (l, r) {
            return l >> r;
          }, true);
          Operator.URSH = new Operator(">>>", function (l, r) {
            return l >>> r;
          }, true);
          Operator.SEQ = new Operator("===", function (l, r) {
            return l === r;
          }, true);
          Operator.SNE = new Operator("!==", function (l, r) {
            return l !== r;
          }, true);
          Operator.EQ = new Operator("==", function (l, r) {
            return l == r;
          }, true);
          Operator.NE = new Operator("!=", function (l, r) {
            return l != r;
          }, true);
          Operator.LE = new Operator("<=", function (l, r) {
            return l <= r;
          }, true);
          Operator.GT = new Operator(">", function (l, r) {
            return l > r;
          }, true);
          Operator.LT = new Operator("<", function (l, r) {
            return l < r;
          }, true);
          Operator.GE = new Operator(">=", function (l, r) {
            return l >= r;
          }, true);
          Operator.PLUS = new Operator("+", function (a) {
            return +a;
          }, false);
          Operator.NEG = new Operator("-", function (a) {
            return -a;
          }, false);
          Operator.TRUE = new Operator("!!", function (a) {
            return !!a;
          }, false);
          Operator.FALSE = new Operator("!", function (a) {
            return !a;
          }, false);

          Operator.TYPE_OF = new Operator("typeof", function (a) {
            return typeof a;
          }, false);
          Operator.BITWISE_NOT = new Operator("~", function (a) {
            return ~a;
          }, false);
          Operator.AS_ADD = new Operator("+", function (l, r) {
            if (typeof l === "string" || typeof r === "string") {
              return String(l) + String(r);
            }
            return l + r;
          }, true);
          return Operator;
        })();
        IR.Operator = Operator;

        Operator.linkOpposites(Operator.SEQ, Operator.SNE);
        Operator.linkOpposites(Operator.EQ, Operator.NE);
        Operator.linkOpposites(Operator.TRUE, Operator.FALSE);

        var Binary = (function (_super) {
          __extends(Binary, _super);
          function Binary(operator, left, right) {
            _super.call(this);
            this.operator = operator;
            this.left = left;
            this.right = right;
          }
          Binary.prototype.visitInputs = function (visitor) {
            visitor(this.left);
            visitor(this.right);
          };
          return Binary;
        })(Value);
        IR.Binary = Binary;

        Binary.prototype.nodeName = "Binary";

        var Unary = (function (_super) {
          __extends(Unary, _super);
          function Unary(operator, argument) {
            _super.call(this);
            this.operator = operator;
            this.argument = argument;
          }
          Unary.prototype.visitInputs = function (visitor) {
            visitor(this.argument);
          };
          return Unary;
        })(Value);
        IR.Unary = Unary;

        Unary.prototype.nodeName = "Unary";

        var Constant = (function (_super) {
          __extends(Constant, _super);
          function Constant(value) {
            _super.call(this);
            this.value = value;
          }
          return Constant;
        })(Value);
        IR.Constant = Constant;

        Constant.prototype.nodeName = "Constant";

        var GlobalProperty = (function (_super) {
          __extends(GlobalProperty, _super);
          function GlobalProperty(name) {
            _super.call(this);
            this.name = name;
          }
          return GlobalProperty;
        })(Value);
        IR.GlobalProperty = GlobalProperty;

        GlobalProperty.prototype.nodeName = "GlobalProperty";

        var This = (function (_super) {
          __extends(This, _super);
          function This(control) {
            _super.call(this);
            this.control = control;
          }
          This.prototype.visitInputs = function (visitor) {
            visitor(this.control);
          };
          return This;
        })(Value);
        IR.This = This;

        This.prototype.nodeName = "This";

        var Throw = (function (_super) {
          __extends(Throw, _super);
          function Throw(control, argument) {
            _super.call(this);
            this.control = control;
            this.argument = argument;
          }
          Throw.prototype.visitInputs = function (visitor) {
            visitor(this.control);
            visitor(this.argument);
          };
          return Throw;
        })(Value);
        IR.Throw = Throw;

        Throw.prototype.nodeName = "Throw";

        var Arguments = (function (_super) {
          __extends(Arguments, _super);
          function Arguments(control) {
            _super.call(this);
            this.control = control;
          }
          Arguments.prototype.visitInputs = function (visitor) {
            visitor(this.control);
          };
          return Arguments;
        })(Value);
        IR.Arguments = Arguments;

        Arguments.prototype.nodeName = "Arguments";

        var Parameter = (function (_super) {
          __extends(Parameter, _super);
          function Parameter(control, index, name) {
            _super.call(this);
            this.control = control;
            this.index = index;
            this.name = name;
          }
          Parameter.prototype.visitInputs = function (visitor) {
            visitor(this.control);
          };
          return Parameter;
        })(Value);
        IR.Parameter = Parameter;

        Parameter.prototype.nodeName = "Parameter";

        var NewArray = (function (_super) {
          __extends(NewArray, _super);
          function NewArray(control, elements) {
            _super.call(this);
            this.control = control;
            this.elements = elements;
          }
          NewArray.prototype.visitInputs = function (visitor) {
            visitor(this.control);
            visitArrayInputs(this.elements, visitor);
          };
          return NewArray;
        })(Value);
        IR.NewArray = NewArray;

        NewArray.prototype.nodeName = "NewArray";

        var NewObject = (function (_super) {
          __extends(NewObject, _super);
          function NewObject(control, properties) {
            _super.call(this);
            this.control = control;
            this.properties = properties;
          }
          NewObject.prototype.visitInputs = function (visitor) {
            visitor(this.control);
            visitArrayInputs(this.properties, visitor);
          };
          return NewObject;
        })(Value);
        IR.NewObject = NewObject;

        NewObject.prototype.nodeName = "NewObject";

        var KeyValuePair = (function (_super) {
          __extends(KeyValuePair, _super);
          function KeyValuePair(key, value) {
            _super.call(this);
            this.key = key;
            this.value = value;
          }
          KeyValuePair.prototype.visitInputs = function (visitor) {
            visitor(this.key);
            visitor(this.value);
          };
          return KeyValuePair;
        })(Value);
        IR.KeyValuePair = KeyValuePair;

        KeyValuePair.prototype.mustFloat = true;
        KeyValuePair.prototype.nodeName = "KeyValuePair";

        function nameOf(node) {
          var useColors = false;
          var result;
          var m = Shumway.StringUtilities;
          if (node instanceof Constant) {
            if (node.value instanceof Multiname) {
              return node.value.name;
            }
            return node.value;
          } else if (node instanceof Variable) {
            return node.name;
          } else if (node instanceof Phi) {
            return result = m.concat3("|", node.id, "|"), useColors ? m.concat3(Shumway.IndentingWriter.PURPLE, result, Shumway.IndentingWriter.ENDC) : result;
          } else if (node instanceof Control) {
            return result = m.concat3("{", node.id, "}"), useColors ? m.concat3(Shumway.IndentingWriter.RED, result, Shumway.IndentingWriter.ENDC) : result;
          } else if (node instanceof Projection) {
            if (node.type === 3 /* STORE */) {
              return result = m.concat5("[", node.id, "->", node.argument.id, "]"), useColors ? m.concat3(Shumway.IndentingWriter.YELLOW, result, Shumway.IndentingWriter.ENDC) : result;
            }
            return result = m.concat3("(", node.id, ")"), useColors ? m.concat3(Shumway.IndentingWriter.GREEN, result, Shumway.IndentingWriter.ENDC) : result;
          } else if (node instanceof Value) {
            return result = m.concat3("(", node.id, ")"), useColors ? m.concat3(Shumway.IndentingWriter.GREEN, result, Shumway.IndentingWriter.ENDC) : result;
          } else if (node instanceof Node) {
            return node.id;
          }
          unexpected(node + " " + typeof node);
        }
        IR.nameOf = nameOf;
      })(Compiler.IR || (Compiler.IR = {}));
      var IR = Compiler.IR;
    })(AVM2.Compiler || (AVM2.Compiler = {}));
    var Compiler = AVM2.Compiler;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Compiler) {
      (function (IR) {
        var assert = Shumway.Debug.assert;
        var unexpected = Shumway.Debug.unexpected;
        var Multiname = Shumway.AVM2.ABC.Multiname;

        var top = Shumway.ArrayUtilities.top;
        var bitCount = Shumway.IntegerUtilities.bitCount;
        var IndentingWriter = Shumway.IndentingWriter;
        var pushUnique = Shumway.ArrayUtilities.pushUnique;
        var unique = Shumway.ArrayUtilities.unique;

        var debug = false;

        function toID(node) {
          return node.id;
        }

        function visitNothing() {
        }

        function isNotPhi(phi) {
          return !isPhi(phi);
        }
        IR.isNotPhi = isNotPhi;

        function isPhi(phi) {
          return phi instanceof IR.Phi;
        }
        IR.isPhi = isPhi;

        function isScope(scope) {
          return isPhi(scope) || scope instanceof IR.ASScope || isProjection(scope, 4 /* SCOPE */);
        }
        IR.isScope = isScope;

        function isMultinameConstant(node) {
          return node instanceof IR.Constant && node.value instanceof Multiname;
        }
        IR.isMultinameConstant = isMultinameConstant;

        function isMultiname(name) {
          return isMultinameConstant(name) || name instanceof IR.ASMultiname;
        }
        IR.isMultiname = isMultiname;

        function isStore(store) {
          return isPhi(store) || store instanceof IR.Store || isProjection(store, 3 /* STORE */);
        }
        IR.isStore = isStore;

        function isConstant(constant) {
          return constant instanceof IR.Constant;
        }
        IR.isConstant = isConstant;

        function isBoolean(value) {
          return value === true || value === false;
        }

        function isControlOrNull(control) {
          return isControl(control) || control === null;
        }
        IR.isControlOrNull = isControlOrNull;

        function isStoreOrNull(store) {
          return isStore(store) || store === null;
        }
        IR.isStoreOrNull = isStoreOrNull;

        function isControl(control) {
          return control instanceof IR.Control;
        }
        IR.isControl = isControl;

        function isValueOrNull(value) {
          return isValue(value) || value === null;
        }
        IR.isValueOrNull = isValueOrNull;

        function isValue(value) {
          return value instanceof IR.Value;
        }
        IR.isValue = isValue;

        function isProjection(node, type) {
          return node instanceof IR.Projection && (!type || node.type === type);
        }
        IR.isProjection = isProjection;

        function followProjection(node) {
          return node instanceof IR.Projection ? node.project() : node;
        }

        IR.Null = new IR.Constant(null);
        IR.Undefined = new IR.Constant(undefined);
        IR.True = new IR.Constant(true);
        IR.False = new IR.Constant(false);

        var Block = (function () {
          function Block(id, start, end) {
            this.id = id;
            this.nodes = [start, end];
            this.region = start;
            this.successors = [];
            this.predecessors = [];
          }
          Block.prototype.pushSuccessorAt = function (successor, index, pushPredecessor) {
            release || assert(successor);
            release || assert(!this.successors[index]);
            this.successors[index] = successor;
            if (pushPredecessor) {
              successor.pushPredecessor(this);
            }
          };
          Block.prototype.pushSuccessor = function (successor, pushPredecessor) {
            release || assert(successor);
            this.successors.push(successor);
            if (pushPredecessor) {
              successor.pushPredecessor(this);
            }
          };
          Block.prototype.pushPredecessor = function (predecessor) {
            release || assert(predecessor);
            this.predecessors.push(predecessor);
          };
          Block.prototype.visitNodes = function (fn) {
            var nodes = this.nodes;
            for (var i = 0, j = nodes.length; i < j; i++) {
              fn(nodes[i]);
            }
          };
          Block.prototype.visitSuccessors = function (fn) {
            var successors = this.successors;
            for (var i = 0, j = successors.length; i < j; i++) {
              fn(successors[i]);
            }
          };
          Block.prototype.visitPredecessors = function (fn) {
            var predecessors = this.predecessors;
            for (var i = 0, j = predecessors.length; i < j; i++) {
              fn(predecessors[i]);
            }
          };
          Block.prototype.append = function (node) {
            release || assert(this.nodes.length >= 2);
            release || assert(isValue(node), node);
            release || assert(isNotPhi(node));
            release || assert(this.nodes.indexOf(node) < 0);
            if (node.mustFloat) {
              return;
            }
            this.nodes.splice(this.nodes.length - 1, 0, node);
          };
          Block.prototype.toString = function () {
            return "B" + this.id + (this.name ? " (" + this.name + ")" : "");
          };
          Block.prototype.trace = function (writer) {
            writer.writeLn(this.toString());
          };
          return Block;
        })();
        IR.Block = Block;

        var DFG = (function () {
          function DFG(exit) {
            this.exit = exit;
            this.exit = exit;
          }
          DFG.prototype.buildCFG = function () {
            return CFG.fromDFG(this);
          };

          DFG.preOrderDepthFirstSearch = function (root, visitChildren, pre) {
            var visited = [];
            var worklist = [root];
            var push = worklist.push.bind(worklist);
            var node;
            while ((node = worklist.pop())) {
              if (visited[node.id] === 1) {
                continue;
              }
              visited[node.id] = 1;
              pre(node);
              worklist.push(node);
              visitChildren(node, push);
            }
          };

          DFG.postOrderDepthFirstSearch = function (root, visitChildren, post) {
            var ONE_TIME = 1, MANY_TIMES = 2;
            var visited = [];
            var worklist = [root];
            function visitChild(child) {
              if (!visited[child.id]) {
                worklist.push(child);
              }
            }
            var node;
            while ((node = top(worklist))) {
              if (visited[node.id]) {
                if (visited[node.id] === ONE_TIME) {
                  visited[node.id] = MANY_TIMES;
                  post(node);
                }
                worklist.pop();
                continue;
              }
              visited[node.id] = ONE_TIME;
              visitChildren(node, visitChild);
            }
          };

          DFG.prototype.forEachInPreOrderDepthFirstSearch = function (visitor) {
            var visited = new Array(1024);
            var worklist = [this.exit];
            function push(node) {
              if (isConstant(node)) {
                return;
              }
              release || assert(node instanceof IR.Node);
              worklist.push(node);
            }
            var node;
            while ((node = worklist.pop())) {
              if (visited[node.id]) {
                continue;
              }
              visited[node.id] = 1;
              visitor && visitor(node);
              worklist.push(node);
              node.visitInputs(push);
            }
          };

          DFG.prototype.forEach = function (visitor, postOrder) {
            var search = postOrder ? DFG.postOrderDepthFirstSearch : DFG.preOrderDepthFirstSearch;
            search(this.exit, function (node, v) {
              node.visitInputsNoConstants(v);
            }, visitor);
          };

          DFG.prototype.traceMetrics = function (writer) {
            var counter = new Shumway.Metrics.Counter(true);
            DFG.preOrderDepthFirstSearch(this.exit, function (node, visitor) {
              node.visitInputsNoConstants(visitor);
            }, function (node) {
              AVM2.countTimeline(node.nodeName);
            });
            counter.trace(writer);
          };

          DFG.prototype.trace = function (writer) {
            var nodes = [];
            var visited = {};

            function colorOf(node) {
              if (node instanceof IR.Control) {
                return "yellow";
              } else if (node instanceof IR.Phi) {
                return "purple";
              } else if (node instanceof IR.Value) {
                return "green";
              }
              return "white";
            }

            var blocks = [];

            function followProjection(node) {
              return node instanceof IR.Projection ? node.project() : node;
            }

            function next(node) {
              node = followProjection(node);
              if (!visited[node.id]) {
                visited[node.id] = true;
                if (node.block) {
                  blocks.push(node.block);
                }
                nodes.push(node);
                node.visitInputsNoConstants(next);
              }
            }

            next(this.exit);

            writer.writeLn("");
            writer.enter("digraph DFG {");
            writer.writeLn("graph [bgcolor = gray10];");
            writer.writeLn("edge [color = white];");
            writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
            writer.writeLn("rankdir = BT;");

            function writeNode(node) {
              writer.writeLn("N" + node.id + " [label = \"" + node.toString() + "\", color = \"" + colorOf(node) + "\"];");
            }

            function defineNode(node) {
              writer.writeLn("N" + node.id + ";");
            }

            blocks.forEach(function (block) {
              writer.enter("subgraph cluster" + block.nodes[0].id + " { bgcolor = gray20;");
              block.visitNodes(function (node) {
                defineNode(followProjection(node));
              });
              writer.leave("}");
            });

            nodes.forEach(writeNode);

            nodes.forEach(function (node) {
              node.visitInputsNoConstants(function (input) {
                input = followProjection(input);
                writer.writeLn("N" + node.id + " -> " + "N" + input.id + " [color=" + colorOf(input) + "];");
              });
            });

            writer.leave("}");
            writer.writeLn("");
          };
          return DFG;
        })();
        IR.DFG = DFG;

        var Uses = (function () {
          function Uses() {
            this.entries = [];
          }
          Uses.prototype.addUse = function (def, use) {
            var entry = this.entries[def.id];
            if (!entry) {
              entry = this.entries[def.id] = { def: def, uses: [] };
            }
            pushUnique(entry.uses, use);
          };
          Uses.prototype.trace = function (writer) {
            writer.enter("> Uses");
            this.entries.forEach(function (entry) {
              writer.writeLn(entry.def.id + " -> [" + entry.uses.map(toID).join(", ") + "] " + entry.def);
            });
            writer.leave("<");
          };
          Uses.prototype.replace = function (def, value) {
            var entry = this.entries[def.id];
            if (entry.uses.length === 0) {
              return false;
            }
            var count = 0;
            entry.uses.forEach(function (use) {
              count += use.replaceInput(def, value);
            });
            release || assert(count >= entry.uses.length);
            entry.uses = [];
            return true;
          };
          Uses.prototype.updateUses = function (def, value, useEntries, writer) {
            debug && writer.writeLn("Update " + def + " with " + value);
            var entry = useEntries[def.id];
            if (entry.uses.length === 0) {
              return false;
            }
            debug && writer.writeLn("Replacing: " + def.id + " in [" + entry.uses.map(toID).join(", ") + "] with " + value.id);
            var count = 0;
            entry.uses.forEach(function (use) {
              count += use.replaceInput(def, value);
            });
            release || assert(count >= entry.uses.length);
            entry.uses = [];
            return true;
          };
          return Uses;
        })();
        IR.Uses = Uses;

        var CFG = (function () {
          function CFG() {
            this.nextBlockID = 0;
            this.blocks = [];
          }
          CFG.fromDFG = function (dfg) {
            var cfg = new CFG();

            release || assert(dfg && dfg instanceof DFG);
            cfg.dfg = dfg;

            var visited = [];

            function buildEnd(end) {
              if (end instanceof IR.Projection) {
                end = end.project();
              }
              release || assert(end instanceof IR.End || end instanceof IR.Start, end);
              if (visited[end.id]) {
                return;
              }
              visited[end.id] = true;
              var start = end.control;
              if (!(start instanceof IR.Region)) {
                start = end.control = new IR.Region(start);
              }
              var block = start.block = cfg.buildBlock(start, end);
              if (start instanceof IR.Start) {
                cfg.root = block;
              }
              for (var i = 0; i < start.predecessors.length; i++) {
                var c = start.predecessors[i];
                var d;
                var trueProjection = false;
                if (c instanceof IR.Projection) {
                  d = c.project();
                  trueProjection = c.type === 1 /* TRUE */;
                } else {
                  d = c;
                }
                if (d instanceof IR.Region) {
                  d = new IR.Jump(c);
                  d = new IR.Projection(d, 1 /* TRUE */);
                  start.predecessors[i] = d;
                  d = d.project();
                  trueProjection = true;
                }
                buildEnd(d);
                var controlBlock = d.control.block;
                if (d instanceof IR.Switch) {
                  release || assert(isProjection(c, 0 /* CASE */));
                  controlBlock.pushSuccessorAt(block, c.selector.value, true);
                } else if (trueProjection && controlBlock.successors.length > 0) {
                  controlBlock.pushSuccessor(block, true);
                  controlBlock.hasFlippedSuccessors = true;
                } else {
                  controlBlock.pushSuccessor(block, true);
                }
              }
            }

            buildEnd(dfg.exit);
            cfg.splitCriticalEdges();
            cfg.exit = dfg.exit.control.block;
            cfg.computeDominators(true);
            return cfg;
          };

          CFG.prototype.buildRootAndExit = function () {
            release || assert(!this.root && !this.exit);

            if (this.blocks[0].predecessors.length > 0) {
              this.root = new Block(this.nextBlockID++);
              this.blocks.push(this.root);
              this.root.pushSuccessor(this.blocks[0], true);
            } else {
              this.root = this.blocks[0];
            }
            var exitBlocks = [];

            for (var i = 0; i < this.blocks.length; i++) {
              var block = this.blocks[i];
              if (block.successors.length === 0) {
                exitBlocks.push(block);
              }
            }

            if (exitBlocks.length === 0) {
              unexpected("Must have an exit block.");
            } else if (exitBlocks.length === 1 && exitBlocks[0] !== this.root) {
              this.exit = exitBlocks[0];
            } else {
              this.exit = new Block(this.nextBlockID++);
              this.blocks.push(this.exit);
              for (var i = 0; i < exitBlocks.length; i++) {
                exitBlocks[i].pushSuccessor(this.exit, true);
              }
            }

            release || assert(this.root && this.exit);
            release || assert(this.root !== this.exit);
          };

          CFG.prototype.fromString = function (list, rootName) {
            var cfg = this;
            var names = cfg.blockNames || (cfg.blockNames = {});
            var blocks = cfg.blocks;

            var sets = list.replace(/\ /g, "").split(",");
            sets.forEach(function (set) {
              var edgeList = set.split("->");
              var last = null;
              for (var i = 0; i < edgeList.length; i++) {
                var next = edgeList[i];
                if (last) {
                  buildEdge(last, next);
                } else {
                  buildBlock(next);
                }
                last = next;
              }
            });

            function buildBlock(name) {
              var block = names[name];
              if (block) {
                return block;
              }
              names[name] = block = new Block(cfg.nextBlockID++);
              block.name = name;
              blocks.push(block);
              return block;
            }

            function buildEdge(from, to) {
              buildBlock(from).pushSuccessor(buildBlock(to), true);
            }

            release || assert(rootName && names[rootName]);
            this.root = names[rootName];
          };

          CFG.prototype.buildBlock = function (start, end) {
            var block = new Block(this.nextBlockID++, start, end);
            this.blocks.push(block);
            return block;
          };

          CFG.prototype.createBlockSet = function () {
            if (!this.setConstructor) {
              this.setConstructor = Shumway.BitSets.BitSetFunctor(this.blocks.length);
            }
            return new this.setConstructor();
          };

          CFG.prototype.computeReversePostOrder = function () {
            if (this.order) {
              return this.order;
            }
            var order = this.order = [];
            this.depthFirstSearch(null, order.push.bind(order));
            order.reverse();
            for (var i = 0; i < order.length; i++) {
              order[i].rpo = i;
            }
            return order;
          };

          CFG.prototype.depthFirstSearch = function (preFn, postFn) {
            var visited = this.createBlockSet();
            function visit(node) {
              visited.set(node.id);
              if (preFn)
                preFn(node);
              var successors = node.successors;
              for (var i = 0, j = successors.length; i < j; i++) {
                var s = successors[i];
                if (!visited.get(s.id)) {
                  visit(s);
                }
              }
              if (postFn)
                postFn(node);
            }
            visit(this.root);
          };

          CFG.prototype.computeDominators = function (apply) {
            release || assert(this.root.predecessors.length === 0, "Root node " + this.root + " must not have predecessors.");

            var dom = new Int32Array(this.blocks.length);
            for (var i = 0; i < dom.length; i++) {
              dom[i] = -1;
            }
            var map = this.createBlockSet();
            function computeCommonDominator(a, b) {
              map.clearAll();
              while (a >= 0) {
                map.set(a);
                a = dom[a];
              }
              while (b >= 0 && !map.get(b)) {
                b = dom[b];
              }
              return b;
            }
            function computeDominator(blockID, parentID) {
              if (dom[blockID] < 0) {
                dom[blockID] = parentID;
              } else {
                dom[blockID] = computeCommonDominator(dom[blockID], parentID);
              }
            }
            this.depthFirstSearch(function visit(block) {
              var s = block.successors;
              for (var i = 0, j = s.length; i < j; i++) {
                computeDominator(s[i].id, block.id);
              }
            });
            if (apply) {
              for (var i = 0, j = this.blocks.length; i < j; i++) {
                this.blocks[i].dominator = this.blocks[dom[i]];
              }
              function computeDominatorDepth(block) {
                var dominatorDepth;
                if (block.dominatorDepth !== undefined) {
                  return block.dominatorDepth;
                } else if (!block.dominator) {
                  dominatorDepth = 0;
                } else {
                  dominatorDepth = computeDominatorDepth(block.dominator) + 1;
                }
                return block.dominatorDepth = dominatorDepth;
              }
              for (var i = 0, j = this.blocks.length; i < j; i++) {
                computeDominatorDepth(this.blocks[i]);
              }
            }
            return dom;
          };

          CFG.prototype.computeLoops = function () {
            var active = this.createBlockSet();
            var visited = this.createBlockSet();
            var nextLoop = 0;

            function makeLoopHeader(block) {
              if (!block.isLoopHeader) {
                release || assert(nextLoop < 32, "Can't handle too many loops, fall back on BitMaps if it's a problem.");
                block.isLoopHeader = true;
                block.loops = 1 << nextLoop;
                nextLoop += 1;
              }
              release || assert(bitCount(block.loops) === 1);
            }

            function visit(block) {
              if (visited.get(block.id)) {
                if (active.get(block.id)) {
                  makeLoopHeader(block);
                }
                return block.loops;
              }
              visited.set(block.id);
              active.set(block.id);
              var loops = 0;
              for (var i = 0, j = block.successors.length; i < j; i++) {
                loops |= visit(block.successors[i]);
              }
              if (block.isLoopHeader) {
                release || assert(bitCount(block.loops) === 1);
                loops &= ~block.loops;
              }
              block.loops = loops;
              active.clear(block.id);
              return loops;
            }

            var loop = visit(this.root);
            release || assert(loop === 0);
          };

          CFG.prototype.computeUses = function () {
            AVM2.enterTimeline("computeUses");
            var writer = debug && new IndentingWriter();

            debug && writer.enter("> Compute Uses");
            var dfg = this.dfg;

            var uses = new Uses();

            dfg.forEachInPreOrderDepthFirstSearch(function (use) {
              use.visitInputs(function (def) {
                uses.addUse(def, use);
              });
            });

            if (debug) {
              writer.enter("> Uses");
              uses.entries.forEach(function (entry) {
                writer.writeLn(entry.def.id + " -> [" + entry.uses.map(toID).join(", ") + "] " + entry.def);
              });
              writer.leave("<");
              writer.leave("<");
            }
            AVM2.leaveTimeline();
            return uses;
          };

          CFG.prototype.verify = function () {
            var writer = debug && new IndentingWriter();
            debug && writer.enter("> Verify");

            var order = this.computeReversePostOrder();

            order.forEach(function (block) {
              if (block.phis) {
                block.phis.forEach(function (phi) {
                  release || assert(phi.control === block.region);
                  release || assert(phi.args.length === block.predecessors.length);
                });
              }
            });

            debug && writer.leave("<");
          };

          CFG.prototype.optimizePhis = function () {
            var writer = debug && new IndentingWriter();
            debug && writer.enter("> Optimize Phis");

            var phis = [];
            var useEntries = this.computeUses().entries;
            useEntries.forEach(function (entry) {
              if (isPhi(entry.def)) {
                phis.push(entry.def);
              }
            });

            debug && writer.writeLn("Trying to optimize " + phis.length + " phis.");

            function updateUses(def, value) {
              debug && writer.writeLn("Update " + def + " with " + value);
              var entry = useEntries[def.id];
              if (entry.uses.length === 0) {
                return false;
              }
              debug && writer.writeLn("Replacing: " + def.id + " in [" + entry.uses.map(toID).join(", ") + "] with " + value.id);
              var count = 0;
              var entryUses = entry.uses;
              for (var i = 0, j = entryUses.length; i < j; i++) {
                count += entryUses[i].replaceInput(def, value);
              }
              release || assert(count >= entry.uses.length);
              entry.uses = [];
              return true;
            }

            function simplify(phi, args) {
              args = unique(args);
              if (args.length === 1) {
                return args[0];
              } else {
                if (args.length === 2) {
                  if (args[0] === phi) {
                    return args[1];
                  } else if (args[1] === phi) {
                    return args[0];
                  }
                  return phi;
                }
              }
              return phi;
            }

            var count = 0;
            var iterations = 0;
            var changed = true;
            while (changed) {
              iterations++;
              changed = false;
              phis.forEach(function (phi) {
                var value = simplify(phi, phi.args);
                if (value !== phi) {
                  if (updateUses(phi, value)) {
                    changed = true;
                    count++;
                  }
                }
              });
            }

            if (debug) {
              writer.writeLn("Simplified " + count + " phis, in " + iterations + " iterations.");
              writer.leave("<");
            }
          };

          CFG.prototype.splitCriticalEdges = function () {
            var writer = debug && new IndentingWriter();
            var blocks = this.blocks;
            var criticalEdges = [];
            debug && writer.enter("> Splitting Critical Edges");
            for (var i = 0; i < blocks.length; i++) {
              var successors = blocks[i].successors;
              if (successors.length > 1) {
                for (var j = 0; j < successors.length; j++) {
                  if (successors[j].predecessors.length > 1) {
                    criticalEdges.push({ from: blocks[i], to: successors[j] });
                  }
                }
              }
            }

            var criticalEdgeCount = criticalEdges.length;
            if (criticalEdgeCount && debug) {
              writer.writeLn("Splitting: " + criticalEdgeCount);
              this.trace(writer);
            }

            var edge;
            while ((edge = criticalEdges.pop())) {
              var fromIndex = edge.from.successors.indexOf(edge.to);
              var toIndex = edge.to.predecessors.indexOf(edge.from);
              release || assert(fromIndex >= 0 && toIndex >= 0);
              debug && writer.writeLn("Splitting critical edge: " + edge.from + " -> " + edge.to);
              var toBlock = edge.to;
              var toRegion = toBlock.region;
              var control = toRegion.predecessors[toIndex];
              var region = new IR.Region(control);
              var jump = new IR.Jump(region);
              var block = this.buildBlock(region, jump);
              toRegion.predecessors[toIndex] = new IR.Projection(jump, 1 /* TRUE */);

              var fromBlock = edge.from;
              fromBlock.successors[fromIndex] = block;
              block.pushPredecessor(fromBlock);
              block.pushSuccessor(toBlock);
              toBlock.predecessors[toIndex] = block;
            }

            if (criticalEdgeCount && debug) {
              this.trace(writer);
            }

            if (criticalEdgeCount && !release) {
              release || assert(this.splitCriticalEdges() === 0);
            }

            debug && writer.leave("<");

            return criticalEdgeCount;
          };

          CFG.prototype.allocateVariables = function () {
            var writer = debug && new IndentingWriter();

            debug && writer.enter("> Allocating Virtual Registers");
            var order = this.computeReversePostOrder();

            function allocate(node) {
              if (isProjection(node, 3 /* STORE */)) {
                return;
              }
              if (node instanceof IR.SetProperty) {
                return;
              }
              if (node instanceof IR.Value) {
                node.variable = new IR.Variable("v" + node.id);
                debug && writer.writeLn("Allocated: " + node.variable + " to " + node);
              }
            }

            order.forEach(function (block) {
              block.nodes.forEach(allocate);
              if (block.phis) {
                block.phis.forEach(allocate);
              }
            });

            var blockMoves = [];
            for (var i = 0; i < order.length; i++) {
              var block = order[i];
              var phis = block.phis;
              var predecessors = block.predecessors;
              if (phis) {
                for (var j = 0; j < phis.length; j++) {
                  var phi = phis[j];
                  debug && writer.writeLn("Emitting moves for: " + phi);
                  var arguments = phi.args;
                  release || assert(predecessors.length === arguments.length);
                  for (var k = 0; k < predecessors.length; k++) {
                    var predecessor = predecessors[k];
                    var argument = arguments[k];
                    if (argument.abstract || isProjection(argument, 3 /* STORE */)) {
                      continue;
                    }
                    var moves = blockMoves[predecessor.id] || (blockMoves[predecessor.id] = []);
                    argument = argument.variable || argument;
                    if (phi.variable !== argument) {
                      moves.push(new IR.Move(phi.variable, argument));
                    }
                  }
                }
              }
            }

            var blocks = this.blocks;
            blockMoves.forEach(function (moves, blockID) {
              var block = blocks[blockID];
              var temporary = 0;
              debug && writer.writeLn(block + " Moves: " + moves);
              while (moves.length) {
                for (var i = 0; i < moves.length; i++) {
                  var move = moves[i];

                  for (var j = 0; j < moves.length; j++) {
                    if (i === j) {
                      continue;
                    }
                    if (moves[j].from === move.to) {
                      move = null;
                      break;
                    }
                  }
                  if (move) {
                    moves.splice(i--, 1);
                    block.append(move);
                  }
                }

                if (moves.length) {
                  debug && writer.writeLn("Breaking Cycle");

                  var move = moves[0];

                  var temp = new IR.Variable("t" + temporary++);
                  blocks[blockID].append(new IR.Move(temp, move.to));

                  for (var i = 1; i < moves.length; i++) {
                    if (moves[i].from === move.to) {
                      moves[i].from = temp;
                    }
                  }
                }
              }
            });

            debug && writer.leave("<");
          };

          CFG.prototype.scheduleEarly = function () {
            var debugScheduler = false;
            var writer = debugScheduler && new IndentingWriter();

            debugScheduler && writer.enter("> Schedule Early");

            var cfg = this;
            var dfg = this.dfg;

            var scheduled = [];

            var roots = [];

            dfg.forEachInPreOrderDepthFirstSearch(function (node) {
              if (node instanceof IR.Region || node instanceof IR.Jump) {
                return;
              }
              if (node.control) {
                roots.push(node);
              }
              if (isPhi(node)) {
                node.args.forEach(function (input) {
                  if (shouldFloat(input)) {
                    input.mustNotFloat = true;
                  }
                });
              }
            });

            if (debugScheduler) {
              roots.forEach(function (node) {
                writer && writer.writeLn("Root: " + node);
              });
            }

            for (var i = 0; i < roots.length; i++) {
              var root = roots[i];
              if (root instanceof IR.Phi) {
                var block = root.control.block;
                (block.phis || (block.phis = [])).push(root);
              }
              if (root.control) {
                schedule(root);
              }
            }

            function isScheduled(node) {
              return scheduled[node.id];
            }

            function shouldFloat(node) {
              if (node.mustNotFloat || node.shouldNotFloat) {
                return false;
              }
              if (node.mustFloat || node.shouldFloat) {
                return true;
              }
              if (node instanceof IR.Parameter || node instanceof IR.This || node instanceof IR.Arguments) {
                return true;
              }
              return node instanceof IR.Binary || node instanceof IR.Unary || node instanceof IR.Parameter;
            }

            function append(node) {
              release || assert(!isScheduled(node), "Already scheduled " + node);
              scheduled[node.id] = true;
              release || assert(node.control, node);
              if (shouldFloat(node)) {
              } else {
                node.control.block.append(node);
              }
            }

            function scheduleIn(node, region) {
              release || assert(!node.control, node);
              release || assert(!isScheduled(node));
              release || assert(region);
              debugScheduler && writer.writeLn("Scheduled: " + node + " in " + region);
              node.control = region;
              append(node);
            }

            function schedule(node) {
              debugScheduler && writer.enter("> Schedule: " + node);

              var inputs = [];

              node.visitInputs(function (input) {
                if (isConstant(input)) {
                   {
                    return;
                  }
                }
                if (isValue(input)) {
                  inputs.push(followProjection(input));
                }
              });

              debugScheduler && writer.writeLn("Inputs: [" + inputs.map(toID) + "], length: " + inputs.length);

              for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                if (isNotPhi(input) && !isScheduled(input)) {
                  schedule(input);
                }
              }

              if (node.control) {
                if (node instanceof IR.End || node instanceof IR.Phi || node instanceof IR.Start || isScheduled(node)) {
                } else {
                  append(node);
                }
              } else {
                if (inputs.length) {
                  var x = inputs[0].control;
                  for (var i = 1; i < inputs.length; i++) {
                    var y = inputs[i].control;
                    if (x.block.dominatorDepth < y.block.dominatorDepth) {
                      x = y;
                    }
                  }
                  scheduleIn(node, x);
                } else {
                  scheduleIn(node, cfg.root.region);
                }
              }

              debugScheduler && writer.leave("<");
            }

            debugScheduler && writer.leave("<");

            roots.forEach(function (node) {
              node = followProjection(node);
              if (node === dfg.start || node instanceof IR.Region) {
                return;
              }
              release || assert(node.control, "Node is not scheduled: " + node);
            });
          };

          CFG.prototype.trace = function (writer) {
            var visited = [];
            var blocks = [];

            function next(block) {
              if (!visited[block.id]) {
                visited[block.id] = true;
                blocks.push(block);
                block.visitSuccessors(next);
              }
            }

            var root = this.root;
            var exit = this.exit;

            next(root);

            function colorOf(block) {
              return "black";
            }

            function styleOf(block) {
              return "filled";
            }

            function shapeOf(block) {
              release || assert(block);
              if (block === root) {
                return "house";
              } else if (block === exit) {
                return "invhouse";
              }
              return "box";
            }

            writer.writeLn("");
            writer.enter("digraph CFG {");

            writer.writeLn("graph [bgcolor = gray10];");
            writer.writeLn("edge [fontname = Consolas, fontsize = 11, color = white, fontcolor = white];");
            writer.writeLn("node [shape = box, fontname = Consolas, fontsize = 11, color = white, fontcolor = white, style = filled];");
            writer.writeLn("rankdir = TB;");

            blocks.forEach(function (block) {
              var loopInfo = "";
              var blockInfo = "";
              var intervalInfo = "";

              if (block.loops !== undefined) {
              }
              if (block.name !== undefined) {
                blockInfo += " " + block.name;
              }
              if (block.rpo !== undefined) {
                blockInfo += " O: " + block.rpo;
              }
              writer.writeLn("B" + block.id + " [label = \"B" + block.id + blockInfo + loopInfo + "\", fillcolor = \"" + colorOf(block) + "\", shape=" + shapeOf(block) + ", style=" + styleOf(block) + "];");
            });

            blocks.forEach(function (block) {
              block.visitSuccessors(function (successor) {
                writer.writeLn("B" + block.id + " -> " + "B" + successor.id);
              });
              if (block.dominator) {
                writer.writeLn("B" + block.id + " -> " + "B" + block.dominator.id + " [color = orange];");
              }
              if (block.follow) {
                writer.writeLn("B" + block.id + " -> " + "B" + block.follow.id + " [color = purple];");
              }
            });

            writer.leave("}");
            writer.writeLn("");
          };
          return CFG;
        })();
        IR.CFG = CFG;

        var PeepholeOptimizer = (function () {
          function PeepholeOptimizer() {
          }
          PeepholeOptimizer.prototype.foldUnary = function (node, truthy) {
            release || assert(node instanceof IR.Unary);
            if (isConstant(node.argument)) {
              return new IR.Constant(node.operator.evaluate(node.argument.value));
            }
            if (truthy) {
              var argument = this.fold(node.argument, true);
              if (node.operator === IR.Operator.TRUE) {
                return argument;
              }
              if (argument instanceof IR.Unary) {
                if (node.operator === IR.Operator.FALSE && argument.operator === IR.Operator.FALSE) {
                  return argument.argument;
                }
              } else {
                return new IR.Unary(node.operator, argument);
              }
            }
            return node;
          };
          PeepholeOptimizer.prototype.foldBinary = function (node, truthy) {
            release || assert(node instanceof IR.Binary);
            if (isConstant(node.left) && isConstant(node.right)) {
              return new IR.Constant(node.operator.evaluate(node.left.value, node.right.value));
            }
            return node;
          };
          PeepholeOptimizer.prototype.fold = function (node, truthy) {
            if (node instanceof IR.Unary) {
              return this.foldUnary(node, truthy);
            } else if (node instanceof IR.Binary) {
              return this.foldBinary(node, truthy);
            }
            return node;
          };
          return PeepholeOptimizer;
        })();
        IR.PeepholeOptimizer = PeepholeOptimizer;
      })(Compiler.IR || (Compiler.IR = {}));
      var IR = Compiler.IR;
    })(AVM2.Compiler || (AVM2.Compiler = {}));
    var Compiler = AVM2.Compiler;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Compiler) {
      var Multiname = Shumway.AVM2.ABC.Multiname;

      var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;

      var notImplemented = Shumway.Debug.notImplemented;
      var assert = Shumway.Debug.assert;

      var top = Shumway.ArrayUtilities.top;
      var unique = Shumway.ArrayUtilities.unique;

      var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
      var Runtime = Shumway.AVM2.Runtime;
      var GlobalMultinameResolver = Shumway.AVM2.Runtime.GlobalMultinameResolver;

      var counter = Shumway.Metrics.Counter.instance;

      var Node = Compiler.IR.Node;

      var Start = Compiler.IR.Start;
      var Region = Compiler.IR.Region;
      var Null = Compiler.IR.Null;
      var Undefined = Compiler.IR.Undefined;
      var True = Compiler.IR.True;
      var False = Compiler.IR.False;
      var This = Compiler.IR.This;
      var Projection = Compiler.IR.Projection;
      var ProjectionType = Compiler.IR.ProjectionType;
      var Binary = Compiler.IR.Binary;
      var Unary = Compiler.IR.Unary;
      var Constant = Compiler.IR.Constant;
      var Call = Compiler.IR.Call;
      var Phi = Compiler.IR.Phi;
      var Stop = Compiler.IR.Stop;
      var Operator = Compiler.IR.Operator;
      var Parameter = Compiler.IR.Parameter;
      var NewArray = Compiler.IR.NewArray;
      var NewObject = Compiler.IR.NewObject;
      var KeyValuePair = Compiler.IR.KeyValuePair;
      var isConstant = Compiler.IR.isConstant;

      var writer = new Shumway.IndentingWriter();
      var peepholeOptimizer = new Compiler.IR.PeepholeOptimizer();

      var useTypeOfForDefaultArgumentChecking = false;

      var emitCoerceNonPrimitiveParameters = false;

      var emitCoerceNonPrimitive = false;

      var emitAsType = true;
      var emitAsTypeLate = true;

      var State = (function () {
        function State(index) {
          if (typeof index === "undefined") { index = 0; }
          this.id = State._nextID += 1;
          this.index = index;
          this.local = [];
          this.stack = [];
          this.scope = [];
          this.store = Undefined;
          this.loads = [];
          this.saved = Undefined;
        }
        State.prototype.clone = function (index) {
          var s = new State();
          s.index = index !== undefined ? index : this.index;
          s.local = this.local.slice(0);
          s.stack = this.stack.slice(0);
          s.scope = this.scope.slice(0);
          s.loads = this.loads.slice(0);
          s.saved = this.saved;
          s.store = this.store;
          return s;
        };

        State.prototype.matches = function (other) {
          return this.stack.length === other.stack.length && this.scope.length === other.scope.length && this.local.length === other.local.length;
        };

        State.prototype.makeLoopPhis = function (control, dirtyLocals) {
          var s = new State();
          release || assert(control);
          function makePhi(x) {
            var phi = new Phi(control, x);
            phi.isLoop = true;
            return phi;
          }
          s.index = this.index;
          s.local = this.local.map(function (v, i) {
            if (dirtyLocals[i]) {
              return makePhi(v);
            }
            return v;
          });
          s.stack = this.stack.map(makePhi);
          s.scope = this.scope.map(makePhi);
          s.loads = this.loads.slice(0);
          s.saved = this.saved;
          s.store = makePhi(this.store);
          return s;
        };

        State.tryOptimizePhi = function (x) {
          if (x instanceof Phi) {
            var phi = x;
            if (phi.isLoop) {
              return phi;
            }
            var args = unique(phi.args);
            if (args.length === 1) {
              phi.seal();
              AVM2.countTimeline("Builder: OptimizedPhi");
              return args[0];
            }
          }
          return x;
        };

        State.prototype.optimize = function () {
          this.local = this.local.map(State.tryOptimizePhi);
          this.stack = this.stack.map(State.tryOptimizePhi);
          this.scope = this.scope.map(State.tryOptimizePhi);
          this.saved = State.tryOptimizePhi(this.saved);
          this.store = State.tryOptimizePhi(this.store);
        };

        State.mergeValue = function (control, a, b) {
          var phi = (a instanceof Phi && a.control === control ? a : new Phi(control, a));
          phi.pushValue(b);
          return phi;
        };

        State.mergeValues = function (control, a, b) {
          for (var i = 0; i < a.length; i++) {
            a[i] = State.mergeValue(control, a[i], b[i]);
          }
        };

        State.prototype.merge = function (control, other) {
          release || assert(control);
          release || assert(this.matches(other), this + " !== " + other);
          State.mergeValues(control, this.local, other.local);
          State.mergeValues(control, this.stack, other.stack);
          State.mergeValues(control, this.scope, other.scope);
          this.store = State.mergeValue(control, this.store, other.store);
          this.store.abstract = true;
        };

        State.prototype.trace = function (writer) {
          writer.writeLn(this.toString());
        };

        State.toBriefString = function (x) {
          if (x instanceof Node) {
            return x.toString(true);
          }
          return x;
        };

        State.prototype.toString = function () {
          return "<" + String(this.id + " @ " + this.index).padRight(' ', 10) + (" M: " + State.toBriefString(this.store)).padRight(' ', 14) + (" X: " + State.toBriefString(this.saved)).padRight(' ', 14) + (" $: " + this.scope.map(State.toBriefString).join(", ")).padRight(' ', 20) + (" L: " + this.local.map(State.toBriefString).join(", ")).padRight(' ', 40) + (" S: " + this.stack.map(State.toBriefString).join(", ")).padRight(' ', 60);
        };
        State._nextID = 0;
        return State;
      })();

      function asConstant(node) {
        release || assert(node instanceof Constant);
        return node;
      }

      function isNumericConstant(node) {
        return node instanceof Constant && Shumway.isNumeric(node.value);
      }

      function isStringConstant(node) {
        return node instanceof Constant && Shumway.isString(node.value);
      }

      function isMultinameConstant(node) {
        return node instanceof Constant && node.value instanceof Multiname;
      }

      function hasNumericType(node) {
        if (isNumericConstant(node)) {
          return true;
        }
        return node.ty && node.ty.isNumeric();
      }

      function typesAreEqual(a, b) {
        if (hasNumericType(a) && hasNumericType(b) || hasStringType(a) && hasStringType(b)) {
          return true;
        }
        return false;
      }

      function hasStringType(node) {
        if (isStringConstant(node)) {
          return true;
        }
        return node.ty && node.ty.isString();
      }

      function constant(value) {
        return new Constant(value);
      }

      function qualifiedNameConstant(name) {
        return constant(Multiname.getQualifiedName(name));
      }

      function operatorFromOP(op) {
        switch (op) {
          case 161 /* subtract */:
            return Operator.SUB;
          case 162 /* multiply */:
            return Operator.MUL;
          case 163 /* divide */:
            return Operator.DIV;
          case 164 /* modulo */:
            return Operator.MOD;
          case 165 /* lshift */:
            return Operator.LSH;
          case 166 /* rshift */:
            return Operator.RSH;
          case 167 /* urshift */:
            return Operator.URSH;
          case 168 /* bitand */:
            return Operator.AND;
          case 169 /* bitor */:
            return Operator.OR;
          case 170 /* bitxor */:
            return Operator.XOR;
          case 20 /* ifne */:
            return Operator.NE;
          case 26 /* ifstrictne */:
            return Operator.SNE;
          case 19 /* ifeq */:
          case 171 /* equals */:
            return Operator.EQ;
          case 25 /* ifstricteq */:
          case 172 /* strictequals */:
            return Operator.SEQ;
          case 21 /* iflt */:
          case 173 /* lessthan */:
            return Operator.LT;
          case 22 /* ifle */:
          case 174 /* lessequals */:
            return Operator.LE;
          case 23 /* ifgt */:
          case 175 /* greaterthan */:
            return Operator.GT;
          case 24 /* ifge */:
          case 176 /* greaterequals */:
            return Operator.GE;
          case 144 /* negate */:
            return Operator.NEG;
          case 196 /* negate_i */:
            return Operator.NEG;
          case 197 /* add_i */:
            return Operator.ADD;
          case 198 /* subtract_i */:
            return Operator.SUB;
          case 199 /* multiply_i */:
            return Operator.MUL;
          case 17 /* iftrue */:
            return Operator.TRUE;
          case 18 /* iffalse */:
            return Operator.FALSE;
          case 150 /* not */:
            return Operator.FALSE;
          case 151 /* bitnot */:
            return Operator.BITWISE_NOT;
          default:
            notImplemented(String(op));
        }
      }

      function getJSPropertyWithState(state, object, path) {
        release || assert(Shumway.isString(path));
        var names = path.split(".");
        var node = object;
        for (var i = 0; i < names.length; i++) {
          node = new Compiler.IR.GetProperty(null, state.store, node, constant(names[i]));
          node.shouldFloat = true;
          state.loads.push(node);
        }
        return node;
      }

      function globalProperty(name) {
        var node = new Compiler.IR.GlobalProperty(name);
        node.mustFloat = true;
        return node;
      }

      function warn(message) {
      }

      function unary(operator, argument) {
        var node = new Unary(operator, argument);
        if (peepholeOptimizer) {
          node = peepholeOptimizer.fold(node);
        }
        return node;
      }

      function binary(operator, left, right) {
        var node = new Binary(operator, left, right);
        if (left.ty && left.ty !== Shumway.AVM2.Verifier.Type.Any && left.ty === right.ty) {
          if (operator === Operator.EQ) {
            node.operator = Operator.SEQ;
          } else if (operator === Operator.NE) {
            node.operator = Operator.SNE;
          }
        }
        if (peepholeOptimizer) {
          node = peepholeOptimizer.fold(node);
        }
        return node;
      }

      function coerceInt(value) {
        return binary(Operator.OR, value, constant(0));
      }

      function coerceUint(value) {
        return binary(Operator.URSH, value, constant(0));
      }

      function coerceNumber(value) {
        if (hasNumericType(value)) {
          return value;
        }
        return unary(Operator.PLUS, value);
      }

      function coerceBoolean(value) {
        return unary(Operator.FALSE, unary(Operator.FALSE, value));
      }

      function shouldNotFloat(node) {
        node.shouldNotFloat = true;
        return node;
      }

      function shouldFloat(node) {
        release || assert(!(node instanceof Compiler.IR.GetProperty), "Cannot float node : " + node);
        node.shouldFloat = true;
        return node;
      }

      function mustFloat(node) {
        node.mustFloat = true;
        return node;
      }

      function callPure(callee, object, args) {
        return new Call(null, null, callee, object, args, 4 /* PRISTINE */);
      }

      function callGlobalProperty(name, value) {
        return callPure(globalProperty(name), null, [value]);
      }

      function convertString(value) {
        if (isStringConstant(value)) {
          return value;
        }
        return callPure(globalProperty("String"), null, [value]);
      }

      function coerceString(value) {
        if (isStringConstant(value)) {
          return value;
        } else if (isConstant(value)) {
          return new Constant(Runtime.asCoerceString(asConstant(value).value));
        }
        return callPure(globalProperty("asCoerceString"), null, [value]);
      }

      var coerceObject = callGlobalProperty.bind(null, "asCoerceObject");

      var coercers = createEmptyObject();
      coercers[Multiname.Int] = coerceInt;
      coercers[Multiname.Uint] = coerceUint;
      coercers[Multiname.Number] = coerceNumber;
      coercers[Multiname.String] = coerceString;
      coercers[Multiname.Object] = coerceObject;
      coercers[Multiname.Boolean] = coerceBoolean;

      function getCoercerForType(multiname) {
        release || assert(multiname instanceof Multiname);
        return coercers[Multiname.getQualifiedName(multiname)];
      }

      var callableConstructors = createEmptyObject();
      callableConstructors[Multiname.Int] = coerceInt;
      callableConstructors[Multiname.Uint] = coerceUint;
      callableConstructors[Multiname.Number] = callGlobalProperty.bind(null, "Number");
      callableConstructors[Multiname.String] = callGlobalProperty.bind(null, "String");
      callableConstructors[Multiname.Object] = callGlobalProperty.bind(null, "Object");
      callableConstructors[Multiname.Boolean] = callGlobalProperty.bind(null, "Boolean");

      function getCallableConstructorForType(multiname) {
        release || assert(multiname instanceof Multiname);
        return callableConstructors[Multiname.getQualifiedName(multiname)];
      }

      var callObject = callGlobalProperty.bind(null, "Object");

      var BlockBuilder = (function () {
        function BlockBuilder(builder, region, block, state) {
          this.builder = builder;
          this.region = region;
          this.block = block;
          this.state = state;
          this.abc = builder.abc;
          this.methodInfoConstant = builder.methodInfoConstant;
          this.bytecodes = builder.methodInfo.analysis.bytecodes;
          this.constantPool = builder.abc.constantPool;
          this.traceBuilder = builder.traceBuilder;
          this.methodInfo = builder.methodInfo;
        }
        BlockBuilder.prototype.popMultiname = function () {
          var multiname = this.constantPool.multinames[this.bc.index];
          var namespaces, name, flags = multiname.flags;
          if (multiname.isRuntimeName()) {
            name = this.state.stack.pop();
          } else {
            name = constant(multiname.name);
          }
          if (multiname.isRuntimeNamespace()) {
            namespaces = shouldFloat(new NewArray(this.region, [this.state.stack.pop()]));
          } else {
            namespaces = constant(multiname.namespaces);
          }
          return new Compiler.IR.ASMultiname(namespaces, name, flags);
        };

        BlockBuilder.prototype.setIfStops = function (predicate) {
          release || assert(!this.stops);
          var _if = new Compiler.IR.If(this.region, predicate);
          this.stops = [
            {
              control: new Projection(_if, 2 /* FALSE */),
              target: this.bytecodes[this.bc.position + 1],
              state: this.state
            }, {
              control: new Projection(_if, 1 /* TRUE */),
              target: this.bc.target,
              state: this.state
            }];
        };

        BlockBuilder.prototype.setJumpStop = function () {
          release || assert(!this.stops);
          this.stops = [{
              control: this.region,
              target: this.bc.target,
              state: this.state
            }];
        };

        BlockBuilder.prototype.setThrowStop = function () {
          release || assert(!this.stops);
          this.stops = [];
        };

        BlockBuilder.prototype.setReturnStop = function () {
          release || assert(!this.stops);
          this.stops = [];
        };

        BlockBuilder.prototype.setSwitchStops = function (determinant) {
          release || assert(!this.stops);
          if (this.bc.targets.length > 2) {
            this.stops = [];
            var _switch = new Compiler.IR.Switch(this.region, determinant);
            for (var i = 0; i < this.bc.targets.length; i++) {
              this.stops.push({
                control: new Projection(_switch, 0 /* CASE */, constant(i)),
                target: this.bc.targets[i],
                state: this.state
              });
            }
          } else {
            release || assert(this.bc.targets.length === 2);
            var predicate = binary(Operator.SEQ, determinant, constant(0));
            var _if = new Compiler.IR.If(this.region, predicate);
            this.stops = [
              {
                control: new Projection(_if, 2 /* FALSE */),
                target: this.bc.targets[1],
                state: this.state
              }, {
                control: new Projection(_if, 1 /* TRUE */),
                target: this.bc.targets[0],
                state: this.state
              }];
          }
        };

        BlockBuilder.prototype.savedScope = function () {
          return this.state.saved;
        };

        BlockBuilder.prototype.topScope = function (depth) {
          var scope = this.state.scope;
          if (depth !== undefined) {
            if (depth < scope.length) {
              return scope[scope.length - 1 - depth];
            } else if (depth === scope.length) {
              return this.savedScope();
            } else {
              var s = this.savedScope();
              var savedScopeDepth = depth - scope.length;
              for (var i = 0; i < savedScopeDepth; i++) {
                s = getJSPropertyWithState(this.state, s, "parent");
              }
              return s;
            }
          }
          if (scope.length > 0) {
            return top(scope);
          }
          return this.savedScope();
        };

        BlockBuilder.prototype.getGlobalScope = function () {
          var ti = this.bc.ti;
          if (ti && ti.object) {
            return constant(ti.object);
          }
          return new Compiler.IR.ASGlobal(null, this.savedScope());
        };

        BlockBuilder.prototype.getScopeObject = function (scope) {
          if (scope instanceof Compiler.IR.ASScope) {
            return scope.object;
          }
          return getJSPropertyWithState(this.state, scope, "object");
        };

        BlockBuilder.prototype.findProperty = function (multiname, strict) {
          var ti = this.bc.ti;
          var slowPath = new Compiler.IR.ASFindProperty(this.region, this.state.store, this.topScope(), multiname, this.methodInfoConstant, strict);
          if (ti) {
            if (ti.object) {
              if (ti.object instanceof Shumway.AVM2.Runtime.Global && !ti.object.isExecuting()) {
                warn("Can't optimize findProperty " + multiname + ", global object is not yet executed or executing.");
                return slowPath;
              }
              return constant(ti.object);
            } else if (ti.scopeDepth !== undefined) {
              return this.getScopeObject(this.topScope(ti.scopeDepth));
            }
          }
          warn("Can't optimize findProperty " + multiname);
          return slowPath;
        };

        BlockBuilder.prototype.coerce = function (multiname, value) {
          if (false && isConstant(value)) {
            return constant(Runtime.asCoerceByMultiname(this.methodInfo, multiname, value.value));
          } else {
            var coercer = getCoercerForType(multiname);
            if (coercer) {
              return coercer(value);
            }
          }
          if (emitCoerceNonPrimitive) {
            return this.call(globalProperty("asCoerceByMultiname"), null, [this.methodInfoConstant, constant(multiname), value]);
          }
          return value;
        };

        BlockBuilder.prototype.store = function (node) {
          var state = this.state;
          state.store = new Projection(node, 3 /* STORE */);
          node.loads = state.loads.slice(0);
          state.loads.length = 0;
          return node;
        };

        BlockBuilder.prototype.load = function (node) {
          var state = this.state;
          state.loads.push(node);
          return node;
        };

        BlockBuilder.prototype.call = function (callee, object, args) {
          return this.store(new Call(this.region, this.state.store, callee, object, args, 4 /* PRISTINE */));
        };

        BlockBuilder.prototype.callCall = function (callee, object, args) {
          return this.store(new Call(this.region, this.state.store, callee, object, args, 16 /* AS_CALL */));
        };

        BlockBuilder.prototype.callProperty = function (object, multiname, args, isLex) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          if (ti && ti.trait) {
            if (ti.trait.isMethod()) {
              var openQn;
              if (ti.trait.holder instanceof InstanceInfo && ti.trait.holder.isInterface()) {
                openQn = Multiname.getPublicQualifiedName(Multiname.getName(ti.trait.name));
              } else {
                openQn = Multiname.getQualifiedName(ti.trait.name);
              }
              openQn = Runtime.VM_OPEN_METHOD_PREFIX + openQn;
              return this.store(new Compiler.IR.CallProperty(region, state.store, object, constant(openQn), args, 4 /* PRISTINE */));
            } else if (ti.trait.isClass()) {
              var constructor = getCallableConstructorForType(ti.trait.name);
              if (constructor) {
                return constructor(args[0]);
              }
              var qn = Multiname.getQualifiedName(ti.trait.name);
              return this.store(new Compiler.IR.CallProperty(region, state.store, object, constant(qn), args, 16 /* AS_CALL */));
            }
          }
          var mn = this.resolveMultinameGlobally(multiname);
          if (mn) {
            return this.store(new Compiler.IR.ASCallProperty(region, state.store, object, constant(Multiname.getQualifiedName(mn)), args, 4 /* PRISTINE */ | 2 /* RESOLVED */, isLex));
          }
          return this.store(new Compiler.IR.ASCallProperty(region, state.store, object, multiname, args, 4 /* PRISTINE */, isLex));
        };

        BlockBuilder.prototype.getProperty = function (object, multiname, getOpenMethod) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          release || assert(multiname instanceof Compiler.IR.ASMultiname);
          getOpenMethod = !!getOpenMethod;
          if (ti) {
            if (ti.trait) {
              if (ti.trait.isConst() && ti.trait.hasDefaultValue) {
                return constant(ti.trait.value);
              }
              var get = new Compiler.IR.GetProperty(region, state.store, object, qualifiedNameConstant(ti.trait.name));
              return ti.trait.isGetter() ? this.store(get) : this.load(get);
            }
          }
          if (hasNumericType(multiname.name)) {
            return this.store(new Compiler.IR.ASGetProperty(region, state.store, object, multiname, 1 /* NumericProperty */));
          }
          warn("Can't optimize getProperty " + multiname.name + " " + multiname.name.ty);
          var qn = this.resolveMultinameGlobally(multiname);
          if (qn) {
            return this.store(new Compiler.IR.ASGetProperty(region, state.store, object, constant(Multiname.getQualifiedName(qn)), 2 /* RESOLVED */ | (getOpenMethod ? 8 /* IS_METHOD */ : 0)));
          }
          AVM2.countTimeline("Compiler: Slow ASGetProperty");
          return this.store(new Compiler.IR.ASGetProperty(region, state.store, object, multiname, (getOpenMethod ? 8 /* IS_METHOD */ : 0)));
        };

        BlockBuilder.prototype.setProperty = function (object, multiname, value) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          release || assert(multiname instanceof Compiler.IR.ASMultiname);
          if (ti) {
            if (ti.trait) {
              var coercer = ti.trait.typeName ? getCoercerForType(ti.trait.typeName) : null;
              if (coercer) {
                value = coercer(value);
              }
              this.store(new Compiler.IR.SetProperty(region, state.store, object, qualifiedNameConstant(ti.trait.name), value));
              return;
            }
          }
          if (hasNumericType(multiname.name)) {
            return this.store(new Compiler.IR.ASSetProperty(region, state.store, object, multiname, value, 1 /* NumericProperty */));
          }
          warn("Can't optimize setProperty " + multiname);
          var qn = this.resolveMultinameGlobally(multiname);
          if (qn) {
          }
          return this.store(new Compiler.IR.ASSetProperty(region, state.store, object, multiname, value, 0));
        };

        BlockBuilder.prototype.callSuper = function (scope, object, multiname, args) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          if (ti && ti.trait && ti.trait.isMethod() && ti.baseClass) {
            var qn = Runtime.VM_OPEN_METHOD_PREFIX + Multiname.getQualifiedName(ti.trait.name);
            var callee = this.getJSProperty(constant(ti.baseClass), "traitsPrototype." + qn);
            return this.call(callee, object, args);
          }
          return this.store(new Compiler.IR.ASCallSuper(region, state.store, object, multiname, args, 4 /* PRISTINE */, scope));
        };

        BlockBuilder.prototype.getSuper = function (scope, object, multiname) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          if (ti && ti.trait && ti.trait.isGetter() && ti.baseClass) {
            var qn = Runtime.VM_OPEN_GET_METHOD_PREFIX + Multiname.getQualifiedName(ti.trait.name);
            var callee = this.getJSProperty(constant(ti.baseClass), "traitsPrototype." + qn);
            return this.call(callee, object, []);
          }
          return this.store(new Compiler.IR.ASGetSuper(region, state.store, object, multiname, scope));
        };

        BlockBuilder.prototype.setSuper = function (scope, object, multiname, value) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          if (ti && ti.trait && ti.trait.isSetter() && ti.baseClass) {
            var qn = Runtime.VM_OPEN_SET_METHOD_PREFIX + Multiname.getQualifiedName(ti.trait.name);
            var callee = this.getJSProperty(constant(ti.baseClass), "traitsPrototype." + qn);
            return this.call(callee, object, [value]);
          }
          return this.store(new Compiler.IR.ASSetSuper(region, state.store, object, multiname, value, scope));
        };

        BlockBuilder.prototype.constructSuper = function (scope, object, args) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          if (ti) {
            if (ti.noCallSuperNeeded) {
              return;
            } else if (ti.baseClass) {
              var callee = this.getJSProperty(constant(ti.baseClass), "instanceConstructorNoInitialize");
              this.call(callee, object, args);
              return;
            }
          }
          callee = this.getJSProperty(scope, "object.baseClass.instanceConstructorNoInitialize");
          this.call(callee, object, args);
          return;
        };

        BlockBuilder.prototype.getSlot = function (object, index) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          if (ti) {
            var trait = ti.trait;
            if (trait) {
              if (trait.isConst() && ti.trait.hasDefaultValue) {
                return constant(trait.value);
              }
              var slotQn = Multiname.getQualifiedName(trait.name);
              return this.store(new Compiler.IR.GetProperty(region, state.store, object, constant(slotQn)));
            }
          }
          warn("Can't optimize getSlot " + index);
          return this.store(new Compiler.IR.ASGetSlot(null, state.store, object, index));
        };

        BlockBuilder.prototype.setSlot = function (object, index, value) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          if (ti) {
            var trait = ti.trait;
            if (trait) {
              var slotQn = Multiname.getQualifiedName(trait.name);
              this.store(new Compiler.IR.SetProperty(region, state.store, object, constant(slotQn), value));
              return;
            }
          }
          warn("Can't optimize setSlot " + index);
          this.store(new Compiler.IR.ASSetSlot(region, state.store, object, index, value));
        };

        BlockBuilder.prototype.resolveMultinameGlobally = function (multiname) {
          var namespaces = multiname.namespaces;
          var name = multiname.name;
          if (!Shumway.AVM2.Runtime.globalMultinameAnalysis.value) {
            return;
          }
          if (!isConstant(namespaces) || !isConstant(name) || multiname.isAttribute()) {
            AVM2.countTimeline("GlobalMultinameResolver: Cannot resolve runtime multiname or attribute.");
            return;
          }
          if (Shumway.isNumeric(name.value) || !Shumway.isString(name.value) || !name.value) {
            AVM2.countTimeline("GlobalMultinameResolver: Cannot resolve numeric or any names.");
            return;
          }
          return GlobalMultinameResolver.resolveMultiname(new Multiname(namespaces.value, name.value, multiname.flags));
        };

        BlockBuilder.prototype.getJSProperty = function (object, path) {
          return getJSPropertyWithState(this.state, object, path);
        };

        BlockBuilder.prototype.setJSProperty = function (object, name, value) {
          this.store(new Compiler.IR.SetProperty(null, this.state.store, object, constant(name), value));
        };

        BlockBuilder.prototype.simplifyName = function (name) {
          if (isMultinameConstant(name) && Multiname.isQName(name.value)) {
            return constant(Multiname.getQualifiedName(name.value));
          }
          return name;
        };

        BlockBuilder.prototype.getDescendants = function (object, name) {
          var ti = this.bc.ti;
          var region = this.region;
          var state = this.state;
          name = this.simplifyName(name);
          return new Compiler.IR.ASGetDescendants(region, state.store, object, name);
        };

        BlockBuilder.prototype.truthyCondition = function (operator) {
          var stack = this.state.stack;
          var right;
          if (operator.isBinary) {
            right = stack.pop();
          }
          var left = stack.pop();
          var node;
          if (right) {
            node = binary(operator, left, right);
          } else {
            node = unary(operator, left);
          }
          if (peepholeOptimizer) {
            node = peepholeOptimizer.fold(node, true);
          }
          return node;
        };

        BlockBuilder.prototype.negatedTruthyCondition = function (operator) {
          var node = unary(Operator.FALSE, this.truthyCondition(operator));
          if (peepholeOptimizer) {
            node = peepholeOptimizer.fold(node, true);
          }
          return node;
        };

        BlockBuilder.prototype.pushExpression = function (operator, toInt) {
          var stack = this.state.stack;
          var left, right;
          if (operator.isBinary) {
            right = stack.pop();
            left = stack.pop();
            if (toInt) {
              right = coerceInt(right);
              left = coerceInt(left);
            }
            this.push(binary(operator, left, right));
          } else {
            left = stack.pop();
            if (toInt) {
              left = coerceInt(left);
            }
            this.push(unary(operator, left));
          }
        };

        BlockBuilder.prototype.push = function (x) {
          var bc = this.bc;
          release || assert(x instanceof Compiler.IR.Node);
          if (bc.ti) {
            if (x.ty) {
            } else {
              x.ty = bc.ti.type;
            }
          }
          this.state.stack.push(x);
        };

        BlockBuilder.prototype.pushLocal = function (index) {
          var local = this.state.local;
          this.push(local[index]);
        };

        BlockBuilder.prototype.popLocal = function (index) {
          var state = this.state;
          state.local[index] = shouldNotFloat(state.stack.pop());
        };

        BlockBuilder.prototype.build = function () {
          var block = this.block;
          var state = this.state;
          var local = this.state.local;
          var stack = this.state.stack;
          var scope = this.state.scope;
          var region = this.region;
          var bytecodes = this.bytecodes;

          var left, right, index;
          var value, object, callee;
          var multiname, type, args;
          var operator;

          var push = this.push.bind(this);

          function pop() {
            return stack.pop();
          }

          function popMany(count) {
            return Shumway.ArrayUtilities.popMany(stack, count);
          }

          this.stops = null;

          if (this.traceBuilder) {
            writer.writeLn("Processing Region: " + region + ", Block: " + block.bid);
            writer.enter(("> state: " + region.entryState.toString()).padRight(' ', 100));
          }

          var bc;
          for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
            this.bc = bc = bytecodes[bci];
            var op = bc.op;
            state.index = bci;
            switch (op) {
              case 3 /* throw */:
                this.store(new Compiler.IR.Throw(region, pop()));
                this.builder.stopPoints.push({
                  region: region,
                  store: state.store,
                  value: Undefined
                });
                this.setThrowStop();
                break;
              case 98 /* getlocal */:
                this.pushLocal(bc.index);
                break;
              case 208 /* getlocal0 */:
              case 209 /* getlocal1 */:
              case 210 /* getlocal2 */:
              case 211 /* getlocal3 */:
                this.pushLocal(op - 208 /* getlocal0 */);
                break;
              case 99 /* setlocal */:
                this.popLocal(bc.index);
                break;
              case 212 /* setlocal0 */:
              case 213 /* setlocal1 */:
              case 214 /* setlocal2 */:
              case 215 /* setlocal3 */:
                this.popLocal(op - 212 /* setlocal0 */);
                break;
              case 28 /* pushwith */:
              case 48 /* pushscope */:
                scope.push(new Compiler.IR.ASScope(this.topScope(), pop(), op === 28 /* pushwith */));
                break;
              case 29 /* popscope */:
                scope.pop();
                break;
              case 100 /* getglobalscope */:
                push(this.getGlobalScope());
                break;
              case 101 /* getscopeobject */:
                push(this.getScopeObject(state.scope[bc.index]));
                break;
              case 94 /* findproperty */:
              case 93 /* findpropstrict */:
                push(this.findProperty(this.popMultiname(), op === 93 /* findpropstrict */));
                break;
              case 102 /* getproperty */:
                multiname = this.popMultiname();
                object = pop();
                push(this.getProperty(object, multiname, false));
                break;
              case 89 /* getdescendants */:
                multiname = this.popMultiname();
                object = pop();
                push(this.getDescendants(object, multiname));
                break;
              case 96 /* getlex */:
                multiname = this.popMultiname();
                push(this.getProperty(this.findProperty(multiname, true), multiname, false));
                break;
              case 104 /* initproperty */:
              case 97 /* setproperty */:
                value = pop();
                multiname = this.popMultiname();
                object = pop();
                this.setProperty(object, multiname, value);
                break;
              case 106 /* deleteproperty */:
                multiname = this.popMultiname();
                object = pop();
                push(this.store(new Compiler.IR.ASDeleteProperty(region, state.store, object, multiname)));
                break;
              case 108 /* getslot */:
                object = pop();
                push(this.getSlot(object, constant(bc.index)));
                break;
              case 109 /* setslot */:
                value = pop();
                object = pop();
                this.setSlot(object, constant(bc.index), value);
                break;
              case 4 /* getsuper */:
                multiname = this.popMultiname();
                object = pop();
                push(this.getSuper(this.savedScope(), object, multiname));
                break;
              case 5 /* setsuper */:
                value = pop();
                multiname = this.popMultiname();
                object = pop();
                this.setSuper(this.savedScope(), object, multiname, value);
                break;
              case 241 /* debugfile */:
              case 240 /* debugline */:
                break;
              case 64 /* newfunction */:
                push(callPure(this.builder.createFunctionCallee, null, [constant(this.abc.methods[bc.index]), this.topScope(), constant(true)]));
                break;
              case 65 /* call */:
                args = popMany(bc.argCount);
                object = pop();
                callee = pop();
                push(this.callCall(callee, object, args));
                break;
              case 70 /* callproperty */:
              case 79 /* callpropvoid */:
              case 76 /* callproplex */:
                args = popMany(bc.argCount);
                multiname = this.popMultiname();
                object = pop();
                value = this.callProperty(object, multiname, args, op === 76 /* callproplex */);
                if (op !== 79 /* callpropvoid */) {
                  push(value);
                }
                break;
              case 69 /* callsuper */:
              case 78 /* callsupervoid */:
                multiname = this.popMultiname();
                args = popMany(bc.argCount);
                object = pop();
                value = this.callSuper(this.savedScope(), object, multiname, args);
                if (op !== 78 /* callsupervoid */) {
                  push(value);
                }
                break;
              case 66 /* construct */:
                args = popMany(bc.argCount);
                object = pop();
                push(this.store(new Compiler.IR.ASNew(region, state.store, object, args)));
                break;
              case 73 /* constructsuper */:
                args = popMany(bc.argCount);
                object = pop();
                this.constructSuper(this.savedScope(), object, args);
                break;
              case 74 /* constructprop */:
                args = popMany(bc.argCount);
                multiname = this.popMultiname();
                object = pop();
                callee = this.getProperty(object, multiname, false);
                push(this.store(new Compiler.IR.ASNew(region, state.store, callee, args)));
                break;
              case 128 /* coerce */:
                if (bc.ti && bc.ti.noCoercionNeeded) {
                  AVM2.countTimeline("Compiler: NoCoercionNeeded");
                  break;
                } else {
                  AVM2.countTimeline("Compiler: CoercionNeeded");
                }
                value = pop();
                push(this.coerce(this.constantPool.multinames[bc.index], value));
                break;
              case 131 /* coerce_i */:
              case 115 /* convert_i */:
                push(coerceInt(pop()));
                break;
              case 136 /* coerce_u */:
              case 116 /* convert_u */:
                push(coerceUint(pop()));
                break;
              case 132 /* coerce_d */:
              case 117 /* convert_d */:
                push(coerceNumber(pop()));
                break;
              case 129 /* coerce_b */:
              case 118 /* convert_b */:
                push(coerceBoolean(pop()));
                break;
              case 120 /* checkfilter */:
                push(this.call(globalProperty("checkFilter"), null, [pop()]));
                break;
              case 130 /* coerce_a */:
                break;
              case 133 /* coerce_s */:
                push(coerceString(pop()));
                break;
              case 112 /* convert_s */:
                push(convertString(pop()));
                break;
              case 134 /* astype */:
                if (bc.ti && bc.ti.noCoercionNeeded) {
                  AVM2.countTimeline("Compiler: NoCoercionNeeded");
                  break;
                } else {
                  AVM2.countTimeline("Compiler: CoercionNeeded");
                }
                if (emitAsType) {
                  value = pop();
                  var typeName = this.constantPool.multinames[bc.index];
                  multiname = new Compiler.IR.ASMultiname(constant(typeName.namespaces), constant(typeName.name), typeName.flags);
                  type = this.getProperty(this.findProperty(multiname, false), multiname);
                  push(this.call(globalProperty("asAsType"), null, [type, value]));
                }
                break;
              case 135 /* astypelate */:
                type = pop();
                if (emitAsTypeLate) {
                  value = pop();
                  push(this.call(globalProperty("asAsType"), null, [type, value]));
                }
                break;
              case 72 /* returnvalue */:
              case 71 /* returnvoid */:
                value = Undefined;
                if (op === 72 /* returnvalue */) {
                  value = pop();
                  if (this.methodInfo.returnType) {
                    if (!(bc.ti && bc.ti.noCoercionNeeded)) {
                      value = this.coerce(this.methodInfo.returnType, value);
                    }
                  }
                }
                this.builder.stopPoints.push({
                  region: region,
                  store: state.store,
                  value: value
                });
                this.setReturnStop();
                break;
              case 30 /* nextname */:
              case 35 /* nextvalue */:
                index = pop();
                object = pop();
                push(new Compiler.IR.CallProperty(region, state.store, object, constant(op === 30 /* nextname */ ? "asNextName" : "asNextValue"), [index], 4 /* PRISTINE */));
                break;
              case 50 /* hasnext2 */:
                var hasNext2 = new Compiler.IR.ASNewHasNext2();
                this.setJSProperty(hasNext2, "object", local[bc.object]);
                this.setJSProperty(hasNext2, "index", local[bc.index]);
                this.store(new Compiler.IR.CallProperty(region, state.store, callObject(local[bc.object]), constant("asHasNext2"), [hasNext2], 4 /* PRISTINE */));

                local[bc.object] = this.getJSProperty(hasNext2, "object");
                push(local[bc.index] = this.getJSProperty(hasNext2, "index"));
                break;
              case 32 /* pushnull */:
                push(Null);
                break;
              case 33 /* pushundefined */:
                push(Undefined);
                break;
              case 38 /* pushtrue */:
                push(True);
                break;
              case 39 /* pushfalse */:
                push(False);
                break;
              case 40 /* pushnan */:
                push(constant(NaN));
                break;
              case 34 /* pushfloat */:
                notImplemented(String(bc));
                break;
              case 36 /* pushbyte */:
              case 37 /* pushshort */:
                push(constant(bc.value));
                break;
              case 44 /* pushstring */:
                push(constant(this.constantPool.strings[bc.index]));
                break;
              case 45 /* pushint */:
                push(constant(this.constantPool.ints[bc.index]));
                break;
              case 46 /* pushuint */:
                push(constant(this.constantPool.uints[bc.index]));
                break;
              case 47 /* pushdouble */:
                push(constant(this.constantPool.doubles[bc.index]));
                break;
              case 41 /* pop */:
                pop();
                break;
              case 42 /* dup */:
                value = shouldNotFloat(pop());
                push(value);
                push(value);
                break;
              case 43 /* swap */:
                state.stack.push(pop(), pop());
                break;
              case 239 /* debug */:
              case 240 /* debugline */:
              case 241 /* debugfile */:
                break;
              case 16 /* jump */:
                this.setJumpStop();
                break;
              case 12 /* ifnlt */:
                this.setIfStops(this.negatedTruthyCondition(Operator.LT));
                break;
              case 15 /* ifnge */:
                this.setIfStops(this.negatedTruthyCondition(Operator.GE));
                break;
              case 14 /* ifngt */:
                this.setIfStops(this.negatedTruthyCondition(Operator.GT));
                break;
              case 13 /* ifnle */:
                this.setIfStops(this.negatedTruthyCondition(Operator.LE));
                break;
              case 24 /* ifge */:
              case 23 /* ifgt */:
              case 22 /* ifle */:
              case 21 /* iflt */:
              case 17 /* iftrue */:
              case 18 /* iffalse */:
              case 19 /* ifeq */:
              case 20 /* ifne */:
              case 25 /* ifstricteq */:
              case 26 /* ifstrictne */:
                this.setIfStops(this.truthyCondition(operatorFromOP(op)));
                break;
              case 27 /* lookupswitch */:
                this.setSwitchStops(pop());
                break;
              case 160 /* add */:
                right = pop();
                left = pop();
                if (typesAreEqual(left, right)) {
                  operator = Operator.ADD;
                } else if (Shumway.AVM2.Runtime.useAsAdd) {
                  operator = Operator.AS_ADD;
                } else {
                  operator = Operator.ADD;
                }
                push(binary(operator, left, right));
                break;
              case 161 /* subtract */:
              case 162 /* multiply */:
              case 163 /* divide */:
              case 164 /* modulo */:
              case 165 /* lshift */:
              case 166 /* rshift */:
              case 167 /* urshift */:
              case 168 /* bitand */:
              case 169 /* bitor */:
              case 170 /* bitxor */:
              case 171 /* equals */:
              case 172 /* strictequals */:
              case 173 /* lessthan */:
              case 174 /* lessequals */:
              case 175 /* greaterthan */:
              case 176 /* greaterequals */:
              case 144 /* negate */:
              case 150 /* not */:
              case 151 /* bitnot */:
                this.pushExpression(operatorFromOP(op));
                break;
              case 196 /* negate_i */:
              case 197 /* add_i */:
              case 198 /* subtract_i */:
              case 199 /* multiply_i */:
                this.pushExpression(operatorFromOP(op), true);
                break;
              case 145 /* increment */:
              case 192 /* increment_i */:
              case 147 /* decrement */:
              case 193 /* decrement_i */:
                push(constant(1));
                if (op === 145 /* increment */ || op === 147 /* decrement */) {
                  push(coerceNumber(pop()));
                } else {
                  push(coerceInt(pop()));
                }
                if (op === 145 /* increment */ || op === 192 /* increment_i */) {
                  this.pushExpression(Operator.ADD);
                } else {
                  this.pushExpression(Operator.SUB);
                }
                break;
              case 146 /* inclocal */:
              case 194 /* inclocal_i */:
              case 148 /* declocal */:
              case 195 /* declocal_i */:
                push(constant(1));
                if (op === 146 /* inclocal */ || op === 148 /* declocal */) {
                  push(coerceNumber(local[bc.index]));
                } else {
                  push(coerceInt(local[bc.index]));
                }
                if (op === 146 /* inclocal */ || op === 194 /* inclocal_i */) {
                  this.pushExpression(Operator.ADD);
                } else {
                  this.pushExpression(Operator.SUB);
                }
                this.popLocal(bc.index);
                break;
              case 177 /* instanceof */:
                type = pop();
                value = pop();
                push(this.call(this.getJSProperty(type, "isInstanceOf"), null, [value]));
                break;
              case 178 /* istype */:
                value = pop();
                multiname = this.popMultiname();
                type = this.getProperty(this.findProperty(multiname, false), multiname);
                push(this.call(globalProperty("asIsType"), null, [type, value]));
                break;
              case 179 /* istypelate */:
                type = pop();
                value = pop();
                push(this.call(globalProperty("asIsType"), null, [type, value]));
                break;
              case 180 /* in */:
                object = pop();
                value = pop();
                multiname = new Compiler.IR.ASMultiname(Undefined, value, 0);
                push(this.store(new Compiler.IR.ASHasProperty(region, state.store, object, multiname)));
                break;
              case 149 /* typeof */:
                push(this.call(globalProperty("asTypeOf"), null, [pop()]));
                break;
              case 8 /* kill */:
                push(Undefined);
                this.popLocal(bc.index);
                break;
              case 83 /* applytype */:
                args = popMany(bc.argCount);
                type = pop();
                callee = globalProperty("applyType");
                push(this.call(callee, null, [this.methodInfoConstant, type, new NewArray(region, args)]));
                break;
              case 86 /* newarray */:
                args = popMany(bc.argCount);
                push(new NewArray(region, args));
                break;
              case 85 /* newobject */:
                var properties = [];
                for (var i = 0; i < bc.argCount; i++) {
                  var value = pop();
                  var key = pop();
                  release || assert(isConstant(key) && Shumway.isString(key.value));
                  key = constant(Multiname.getPublicQualifiedName(key.value));
                  properties.push(new KeyValuePair(key, value));
                }
                push(new NewObject(region, properties));
                break;
              case 87 /* newactivation */:
                push(new Compiler.IR.ASNewActivation(constant(this.methodInfo)));
                break;
              case 88 /* newclass */:
                callee = globalProperty("createClass");
                push(this.call(callee, null, [constant(this.abc.classes[bc.index]), pop(), this.topScope()]));
                break;
              default:
                notImplemented(String(bc));
            }
            if (op === 239 /* debug */ || op === 241 /* debugfile */ || op === 240 /* debugline */) {
              continue;
            }
            if (this.traceBuilder) {
              writer.writeLn(("state: " + state.toString()).padRight(' ', 100) + " : " + bci + ", " + bc.toString(this.abc));
            }
          }
          if (this.traceBuilder) {
            writer.leave(("< state: " + state.toString()).padRight(' ', 100));
          }
        };
        return BlockBuilder;
      })();

      var Builder = (function () {
        function Builder(methodInfo, scope, hasDynamicScope) {
          release || assert(methodInfo && methodInfo.abc && scope);
          this.abc = methodInfo.abc;
          this.methodInfoConstant = new Constant(methodInfo);
          this.scope = scope;
          this.methodInfo = methodInfo;
          this.hasDynamicScope = hasDynamicScope;
          this.traceBuilder = Shumway.AVM2.Compiler.traceLevel.value > 2;
          this.createFunctionCallee = globalProperty("createFunction");
          this.stopPoints = [];
          this.bytecodes = this.methodInfo.analysis.bytecodes;
        }
        Builder.prototype.buildStart = function (start) {
          var mi = this.methodInfo;
          var state = start.entryState = new State(0);

          state.local.push(new This(start));

          var parameterIndexOffset = this.hasDynamicScope ? 1 : 0;
          var parameterCount = mi.parameters.length;

          for (var i = 0; i < parameterCount; i++) {
            state.local.push(new Parameter(start, parameterIndexOffset + i, mi.parameters[i].name));
          }

          for (var i = parameterCount; i < mi.localCount; i++) {
            state.local.push(Undefined);
          }

          state.store = new Projection(start, 3 /* STORE */);
          if (this.hasDynamicScope) {
            start.scope = new Parameter(start, 0, Runtime.SAVED_SCOPE_NAME);
          } else {
            start.scope = new Constant(this.scope);
          }
          state.saved = new Projection(start, 4 /* SCOPE */);

          var args = new Compiler.IR.Arguments(start);

          if (mi.needsRest() || mi.needsArguments()) {
            var offset = constant(parameterIndexOffset + (mi.needsRest() ? parameterCount : 0));
            state.local[parameterCount + 1] = new Call(start, state.store, globalProperty("sliceArguments"), null, [args, offset], 4 /* PRISTINE */);
          }

          var argumentsLength = getJSPropertyWithState(state, args, "length");

          for (var i = 0; i < parameterCount; i++) {
            var parameter = mi.parameters[i];
            var index = i + 1;
            var local = state.local[index];
            if (parameter.value !== undefined) {
              var condition;
              if (useTypeOfForDefaultArgumentChecking) {
                condition = new Compiler.IR.Binary(Operator.SEQ, new Compiler.IR.Unary(Operator.TYPE_OF, local), constant("undefined"));
              } else {
                condition = new Compiler.IR.Binary(Operator.LT, argumentsLength, constant(parameterIndexOffset + i + 1));
              }
              local = new Compiler.IR.Latch(null, condition, constant(parameter.value), local);
            }
            if (parameter.type && !parameter.type.isAnyName()) {
              var coercer = getCoercerForType(parameter.type);
              if (coercer) {
                local = coercer(local);
              } else if (emitCoerceNonPrimitiveParameters) {
                local = new Call(start, state.store, globalProperty("asCoerceByMultiname"), null, [this.methodInfoConstant, constant(parameter.type), local], 0);
              }
            }
            state.local[index] = local;
          }

          return start;
        };

        Builder.prototype.buildGraph = function () {
          var analysis = this.methodInfo.analysis;
          var blocks = analysis.blocks;
          var methodInfo = this.methodInfo;
          var traceBuilder = this.traceBuilder;

          for (var i = 0; i < blocks.length; i++) {
            blocks[i].bdo = i;
            blocks[i].region = null;
          }

          var worklist = new Shumway.SortedList(function compare(a, b) {
            return a.block.bdo - b.block.bdo;
          });

          var start = new Start();
          this.buildStart(start);

          worklist.push({ region: start, block: blocks[0] });

          var next;
          while ((next = worklist.pop())) {
            this.buildBlock(next.region, next.block, next.region.entryState.clone()).forEach(function (stop) {
              var target = stop.target;
              var region = target.region;
              if (region) {
                traceBuilder && writer.enter("Merging into region: " + region + " @ " + target.position + ", block " + target.bid + " {");
                traceBuilder && writer.writeLn("  R " + region.entryState);
                traceBuilder && writer.writeLn("+ I " + stop.state);

                region.entryState.merge(region, stop.state);
                region.predecessors.push(stop.control);

                traceBuilder && writer.writeLn("  = " + region.entryState);
                traceBuilder && writer.leave("}");
              } else {
                region = target.region = new Region(stop.control);
                var dirtyLocals = null;
                if (target.loop) {
                  dirtyLocals = Compiler.enableDirtyLocals.value && target.loop.getDirtyLocals();
                  traceBuilder && writer.writeLn("Adding PHIs to loop region. " + dirtyLocals);
                }
                region.entryState = target.loop ? stop.state.makeLoopPhis(region, dirtyLocals) : stop.state.clone(target.position);
                traceBuilder && writer.writeLn("Adding new region: " + region + " @ " + target.position + " to worklist.");
                worklist.push({ region: region, block: target });
              }
            });

            traceBuilder && writer.enter("Worklist: {");
            worklist.forEach(function (item) {
              traceBuilder && writer.writeLn(item.region + " " + item.block.bdo + " " + item.region.entryState);
            });
            traceBuilder && writer.leave("}");
          }

          traceBuilder && writer.writeLn("Done");

          var stop;
          if (this.stopPoints.length > 1) {
            var stopRegion = new Region(null);
            var stopValuePhi = new Phi(stopRegion, null);
            var stopStorePhi = new Phi(stopRegion, null);
            this.stopPoints.forEach(function (stopPoint) {
              stopRegion.predecessors.push(stopPoint.region);
              stopValuePhi.pushValue(stopPoint.value);
              stopStorePhi.pushValue(stopPoint.store);
            });
            stop = new Stop(stopRegion, stopStorePhi, stopValuePhi);
          } else {
            stop = new Stop(this.stopPoints[0].region, this.stopPoints[0].store, this.stopPoints[0].value);
          }

          return new Compiler.IR.DFG(stop);
        };

        Builder.prototype.buildBlock = function (region, block, state) {
          release || assert(region && block && state);
          state.optimize();
          var typeState = block.verifierEntryState;
          if (typeState) {
            this.traceBuilder && writer.writeLn("Type State: " + typeState);
            for (var i = 0; i < typeState.local.length; i++) {
              var type = typeState.local[i];
              var local = state.local[i];
              if (local.ty) {
              } else {
                local.ty = type;
              }
            }
          }

          var blockBuilder = new BlockBuilder(this, region, block, state);
          blockBuilder.build();

          var stops = blockBuilder.stops;
          if (!stops) {
            stops = [];
            if (blockBuilder.bc.position + 1 <= this.bytecodes.length) {
              stops.push({
                control: region,
                target: this.bytecodes[blockBuilder.bc.position + 1],
                state: state
              });
            }
          }

          return stops;
        };

        Builder.buildMethod = function (verifier, methodInfo, scope, hasDynamicScope) {
          release || assert(scope);
          release || assert(methodInfo.analysis);
          release || assert(!methodInfo.hasExceptions());

          AVM2.countTimeline("Compiler: Compiled Methods");

          AVM2.enterTimeline("Compiler");
          AVM2.enterTimeline("Mark Loops");
          methodInfo.analysis.markLoops();
          AVM2.leaveTimeline();

          if (Shumway.AVM2.Verifier.enabled.value) {
            AVM2.enterTimeline("Verify");
            verifier.verifyMethod(methodInfo, scope);
            AVM2.leaveTimeline();
          }

          var traceSource = Shumway.AVM2.Compiler.traceLevel.value > 0;
          var traceIR = Shumway.AVM2.Compiler.traceLevel.value > 1;

          AVM2.enterTimeline("Build IR");
          Node.startNumbering();
          var dfg = new Builder(methodInfo, scope, hasDynamicScope).buildGraph();
          AVM2.leaveTimeline();

          traceIR && dfg.trace(writer);

          AVM2.enterTimeline("Build CFG");
          var cfg = dfg.buildCFG();
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Optimize Phis");
          cfg.optimizePhis();
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Schedule Nodes");
          cfg.scheduleEarly();
          AVM2.leaveTimeline();

          traceIR && cfg.trace(writer);

          AVM2.enterTimeline("Verify IR");
          cfg.verify();
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Allocate Variables");
          cfg.allocateVariables();
          AVM2.leaveTimeline();

          AVM2.enterTimeline("Generate Source");
          var result = Shumway.AVM2.Compiler.Backend.generate(cfg);
          AVM2.leaveTimeline();
          traceSource && writer.writeLn(result.body);
          Node.stopNumbering();
          AVM2.leaveTimeline();

          return result;
        };
        return Builder;
      })();

      var verifier = new Shumway.AVM2.Verifier.Verifier();
      function compileMethod(methodInfo, scope, hasDynamicScope) {
        return Builder.buildMethod(verifier, methodInfo, scope, hasDynamicScope);
      }
      Compiler.compileMethod = compileMethod;
    })(AVM2.Compiler || (AVM2.Compiler = {}));
    var Compiler = AVM2.Compiler;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Compiler) {
      var Scope = Shumway.AVM2.Runtime.Scope;

      var canCompile = Shumway.AVM2.Runtime.canCompile;

      var ensureFunctionIsInitialized = Shumway.AVM2.Runtime.ensureFunctionIsInitialized;
      var createCompiledFunction = Shumway.AVM2.Runtime.createCompiledFunction;
      var LazyInitializer = Shumway.AVM2.Runtime.LazyInitializer;

      var hasUsedConstants = false;
      jsGlobal.objectConstantName = function (object) {
        if (object.hash) {
          return "$(" + object.hash + ")";
        } else if (object instanceof LazyInitializer) {
          return object.getName();
        } else {
          hasUsedConstants = true;
        }
      };

      function compileAbc(abc, writer) {
        writer.enter("{");
        writer.enter("methods: {");
        for (var i = 0; i < abc.scripts.length; i++) {
          compileScript(abc.scripts[i], writer);
        }
        writer.leave("}");
        writer.leave("}");
      }
      Compiler.compileAbc = compileAbc;

      function compileScript(script, writer) {
        var globalScope = new Scope(null, script);
        var domain = script.abc.applicationDomain;
        var closures = [];
        compileMethod(script.init, writer, globalScope, closures);
        script.traits.forEach(function (trait) {
          if (trait.isClass()) {
            var inheritance = [];
            var current = trait.classInfo;
            while (current) {
              inheritance.unshift(current);
              if (current.instanceInfo.superName) {
                current = domain.findClassInfo(current.instanceInfo.superName);
              } else {
                break;
              }
            }
            var classScope = globalScope;
            inheritance.forEach(function (classInfo) {
              classScope = new Scope(classScope, classInfo);
            });
            compileClass(trait.classInfo, writer, classScope, closures);
          } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
            compileTrait(trait, writer, globalScope, closures);
          }
        });
        closures.forEach(function (closure) {
          compileMethod(closure.methodInfo, writer, closure.scope, null, true);
        });
      }

      function compileMethod(methodInfo, writer, scope, closures, hasDynamicScope) {
        if (typeof hasDynamicScope === "undefined") { hasDynamicScope = false; }
        if (canCompile(methodInfo)) {
          ensureFunctionIsInitialized(methodInfo);
          try  {
            hasUsedConstants = false;
            var method = createCompiledFunction(methodInfo, scope, hasDynamicScope, false, false);
            writer.enter(methodInfo.index + ": ");
            if (!hasUsedConstants) {
              writer.writeLns(method.toSource());
            } else {
              writer.writeLn("undefined");
            }
            writer.leave(",");
            if (closures) {
              scanMethod(methodInfo, writer, scope, closures);
            }
          } catch (x) {
            writer.writeLn("// " + x);
          }
        } else {
          writer.writeLn("// Can't compile method: " + methodInfo.index);
        }
      }
      function scanMethod(methodInfo, writer, scope, innerMethods) {
        var bytecodes = methodInfo.analysis.bytecodes;
        var methods = methodInfo.abc.methods;
        for (var i = 0; i < bytecodes.length; i++) {
          var bc = bytecodes[i];

          if (bc.op === 64 /* newfunction */) {
            var innerMethodInfo = methods[bc.index];
            ensureFunctionIsInitialized(innerMethodInfo);
            var innerScope = new Scope(scope, methodInfo);
            innerMethods.push({
              scope: innerScope,
              methodInfo: innerMethodInfo
            });
            scanMethod(innerMethodInfo, writer, innerScope, innerMethods);
          }
        }
      }

      function compileTrait(trait, writer, scope, closures) {
        if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
          if (trait.methodInfo.hasBody) {
            writer.writeLn("// " + trait);
            compileMethod(trait.methodInfo, writer, scope, closures);
          }
        }
      }

      function compileTraits(traits, writer, scope, closures) {
        traits.forEach(function (trait) {
          compileTrait(trait, writer, scope, closures);
        });
      }

      function compileClass(classInfo, writer, scope, closures) {
        compileMethod(classInfo.init, writer, scope, closures);
        compileTraits(classInfo.traits, writer, scope, closures);
        compileMethod(classInfo.instanceInfo.init, writer, scope, closures);
        compileTraits(classInfo.instanceInfo.traits, writer, scope, closures);
      }
    })(AVM2.Compiler || (AVM2.Compiler = {}));
    var Compiler = AVM2.Compiler;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Compiler) {
      (function (AST) {
        var notImplemented = Shumway.Debug.notImplemented;

        var json = false;
        var escapeless = false;
        var hexadecimal = false;
        var renumber = false;
        var quotes = "double";

        function stringToArray(str) {
          var length = str.length, result = [], i;
          for (i = 0; i < length; ++i) {
            result[i] = str.charAt(i);
          }
          return result;
        }

        function escapeAllowedCharacter(ch, next) {
          var code = ch.charCodeAt(0), hex = code.toString(16), result = '\\';

          switch (ch) {
            case '\b':
              result += 'b';
              break;
            case '\f':
              result += 'f';
              break;
            case '\t':
              result += 't';
              break;
            default:
              if (json || code > 0xff) {
                result += 'u' + '0000'.slice(hex.length) + hex;
              } else if (ch === '\u0000' && '0123456789'.indexOf(next) < 0) {
                result += '0';
              } else if (ch === '\x0B') {
                result += 'x0B';
              } else {
                result += 'x' + '00'.slice(hex.length) + hex;
              }
              break;
          }

          return result;
        }

        function escapeDisallowedCharacter(ch) {
          var result = '\\';
          switch (ch) {
            case '\\':
              result += '\\';
              break;
            case '\n':
              result += 'n';
              break;
            case '\r':
              result += 'r';
              break;
            case '\u2028':
              result += 'u2028';
              break;
            case '\u2029':
              result += 'u2029';
              break;
            default:
              throw new Error('Incorrectly classified character');
          }

          return result;
        }

        var escapeStringCacheCount = 0;
        var escapeStringCache = Object.create(null);

        function escapeString(str) {
          var result, i, len, ch, singleQuotes = 0, doubleQuotes = 0, single, original = str;
          result = escapeStringCache[original];
          if (result) {
            return result;
          }
          if (escapeStringCacheCount === 1024) {
            escapeStringCache = Object.create(null);
            escapeStringCacheCount = 0;
          }
          result = '';

          if (typeof str[0] === 'undefined') {
            str = stringToArray(str);
          }

          for (i = 0, len = str.length; i < len; ++i) {
            ch = str[i];
            if (ch === '\'') {
              ++singleQuotes;
            } else if (ch === '"') {
              ++doubleQuotes;
            } else if (ch === '/' && json) {
              result += '\\';
            } else if ('\\\n\r\u2028\u2029'.indexOf(ch) >= 0) {
              result += escapeDisallowedCharacter(ch);
              continue;
            } else if ((json && ch < ' ') || !(json || escapeless || (ch >= ' ' && ch <= '~'))) {
              result += escapeAllowedCharacter(ch, str[i + 1]);
              continue;
            }
            result += ch;
          }

          single = !(quotes === 'double' || (quotes === 'auto' && doubleQuotes < singleQuotes));
          str = result;
          result = single ? '\'' : '"';

          if (typeof str[0] === 'undefined') {
            str = stringToArray(str);
          }

          for (i = 0, len = str.length; i < len; ++i) {
            ch = str[i];
            if ((ch === '\'' && single) || (ch === '"' && !single)) {
              result += '\\';
            }
            result += ch;
          }

          result += (single ? '\'' : '"');
          escapeStringCache[original] = result;
          escapeStringCacheCount++;
          return result;
        }

        var generateNumberCacheCount = 0;
        var generateNumberCache = Object.create(null);

        function generateNumber(value) {
          var result, point, temp, exponent, pos;

          if (value !== value) {
            throw new Error('Numeric literal whose value is NaN');
          }
          if (value < 0 || (value === 0 && 1 / value < 0)) {
            throw new Error('Numeric literal whose value is negative');
          }

          if (value === 1 / 0) {
            return json ? 'null' : renumber ? '1e400' : '1e+400';
          }

          result = generateNumberCache[value];
          if (result) {
            return result;
          }
          if (generateNumberCacheCount === 1024) {
            generateNumberCache = Object.create(null);
            generateNumberCacheCount = 0;
          }
          result = '' + value;
          if (!renumber || result.length < 3) {
            generateNumberCache[value] = result;
            generateNumberCacheCount++;
            return result;
          }

          point = result.indexOf('.');
          if (!json && result.charAt(0) === '0' && point === 1) {
            point = 0;
            result = result.slice(1);
          }
          temp = result;
          result = result.replace('e+', 'e');
          exponent = 0;
          if ((pos = temp.indexOf('e')) > 0) {
            exponent = +temp.slice(pos + 1);
            temp = temp.slice(0, pos);
          }
          if (point >= 0) {
            exponent -= temp.length - point - 1;
            temp = +(temp.slice(0, point) + temp.slice(point + 1)) + '';
          }
          pos = 0;
          while (temp.charAt(temp.length + pos - 1) === '0') {
            --pos;
          }
          if (pos !== 0) {
            exponent -= pos;
            temp = temp.slice(0, pos);
          }
          if (exponent !== 0) {
            temp += 'e' + exponent;
          }
          if ((temp.length < result.length || (hexadecimal && value > 1e12 && Math.floor(value) === value && (temp = '0x' + value.toString(16)).length < result.length)) && +temp === value) {
            result = temp;
          }
          generateNumberCache[value] = result;
          generateNumberCacheCount++;
          return result;
        }

        var Precedence = {
          Default: 0,
          Sequence: 0,
          Assignment: 1,
          Conditional: 2,
          ArrowFunction: 2,
          LogicalOR: 3,
          LogicalAND: 4,
          BitwiseOR: 5,
          BitwiseXOR: 6,
          BitwiseAND: 7,
          Equality: 8,
          Relational: 9,
          BitwiseSHIFT: 10,
          Additive: 11,
          Multiplicative: 12,
          Unary: 13,
          Postfix: 14,
          Call: 15,
          New: 16,
          Member: 17,
          Primary: 18
        };

        var BinaryPrecedence = {
          '||': Precedence.LogicalOR,
          '&&': Precedence.LogicalAND,
          '|': Precedence.BitwiseOR,
          '^': Precedence.BitwiseXOR,
          '&': Precedence.BitwiseAND,
          '==': Precedence.Equality,
          '!=': Precedence.Equality,
          '===': Precedence.Equality,
          '!==': Precedence.Equality,
          'is': Precedence.Equality,
          'isnt': Precedence.Equality,
          '<': Precedence.Relational,
          '>': Precedence.Relational,
          '<=': Precedence.Relational,
          '>=': Precedence.Relational,
          'in': Precedence.Relational,
          'instanceof': Precedence.Relational,
          '<<': Precedence.BitwiseSHIFT,
          '>>': Precedence.BitwiseSHIFT,
          '>>>': Precedence.BitwiseSHIFT,
          '+': Precedence.Additive,
          '-': Precedence.Additive,
          '*': Precedence.Multiplicative,
          '%': Precedence.Multiplicative,
          '/': Precedence.Multiplicative
        };

        function toLiteralSource(value) {
          if (value === null) {
            return 'null';
          }
          if (typeof value === 'string') {
            return escapeString(value);
          }
          if (typeof value === 'number') {
            return generateNumber(value);
          }
          if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
          }
          notImplemented(value);
        }

        function nodesToSource(nodes, precedence, separator) {
          var result = "";
          for (var i = 0; i < nodes.length; i++) {
            result += nodes[i].toSource(precedence);
            if (separator && (i < nodes.length - 1)) {
              result += separator;
            }
          }
          return result;
        }

        function alwaysParenthesize(text) {
          return '(' + text + ')';
        }

        function parenthesize(text, current, should) {
          if (current < should) {
            return '(' + text + ')';
          }
          return text;
        }

        var Node = (function () {
          function Node() {
          }
          Node.prototype.toSource = function (precedence) {
            notImplemented(this.type);
            return "";
          };
          return Node;
        })();
        AST.Node = Node;

        var Statement = (function (_super) {
          __extends(Statement, _super);
          function Statement() {
            _super.apply(this, arguments);
          }
          return Statement;
        })(Node);
        AST.Statement = Statement;

        var Expression = (function (_super) {
          __extends(Expression, _super);
          function Expression() {
            _super.apply(this, arguments);
          }
          return Expression;
        })(Node);
        AST.Expression = Expression;

        var Program = (function (_super) {
          __extends(Program, _super);
          function Program(body) {
            _super.call(this);
            this.body = body;
          }
          return Program;
        })(Node);
        AST.Program = Program;

        var EmptyStatement = (function (_super) {
          __extends(EmptyStatement, _super);
          function EmptyStatement() {
            _super.apply(this, arguments);
          }
          return EmptyStatement;
        })(Statement);
        AST.EmptyStatement = EmptyStatement;

        var BlockStatement = (function (_super) {
          __extends(BlockStatement, _super);
          function BlockStatement(body) {
            _super.call(this);
            this.body = body;
          }
          BlockStatement.prototype.toSource = function (precedence) {
            return "{\n" + nodesToSource(this.body, precedence) + "}";
          };
          return BlockStatement;
        })(Statement);
        AST.BlockStatement = BlockStatement;

        var ExpressionStatement = (function (_super) {
          __extends(ExpressionStatement, _super);
          function ExpressionStatement(expression) {
            _super.call(this);
            this.expression = expression;
          }
          ExpressionStatement.prototype.toSource = function (precedence) {
            return this.expression.toSource(Precedence.Sequence) + ";\n";
          };
          return ExpressionStatement;
        })(Statement);
        AST.ExpressionStatement = ExpressionStatement;

        var IfStatement = (function (_super) {
          __extends(IfStatement, _super);
          function IfStatement(test, consequent, alternate) {
            _super.call(this);
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
          }
          IfStatement.prototype.toSource = function (precedence) {
            var result = "if(" + this.test.toSource(Precedence.Sequence) + "){" + this.consequent.toSource(Precedence.Sequence) + "}";
            if (this.alternate) {
              result += "else{" + this.alternate.toSource(Precedence.Sequence) + "}";
            }
            return result;
          };
          return IfStatement;
        })(Statement);
        AST.IfStatement = IfStatement;

        var LabeledStatement = (function (_super) {
          __extends(LabeledStatement, _super);
          function LabeledStatement(label, body) {
            _super.call(this);
            this.label = label;
            this.body = body;
          }
          return LabeledStatement;
        })(Statement);
        AST.LabeledStatement = LabeledStatement;

        var BreakStatement = (function (_super) {
          __extends(BreakStatement, _super);
          function BreakStatement(label) {
            _super.call(this);
            this.label = label;
          }
          BreakStatement.prototype.toSource = function (precedence) {
            var result = "break";
            if (this.label) {
              result += " " + this.label.toSource(Precedence.Default);
            }
            return result + ";";
          };
          return BreakStatement;
        })(Statement);
        AST.BreakStatement = BreakStatement;

        var ContinueStatement = (function (_super) {
          __extends(ContinueStatement, _super);
          function ContinueStatement(label) {
            _super.call(this);
            this.label = label;
          }
          ContinueStatement.prototype.toSource = function (precedence) {
            var result = "continue";
            if (this.label) {
              result += " " + this.label.toSource(Precedence.Default);
            }
            return result + ";";
          };
          return ContinueStatement;
        })(Statement);
        AST.ContinueStatement = ContinueStatement;

        var WithStatement = (function (_super) {
          __extends(WithStatement, _super);
          function WithStatement(object, body) {
            _super.call(this);
            this.object = object;
            this.body = body;
          }
          return WithStatement;
        })(Statement);
        AST.WithStatement = WithStatement;

        var SwitchStatement = (function (_super) {
          __extends(SwitchStatement, _super);
          function SwitchStatement(discriminant, cases, lexical) {
            _super.call(this);
            this.discriminant = discriminant;
            this.cases = cases;
            this.lexical = lexical;
          }
          SwitchStatement.prototype.toSource = function (precedence) {
            return "switch(" + this.discriminant.toSource(Precedence.Sequence) + "){" + nodesToSource(this.cases, Precedence.Default, ";") + "};";
          };
          return SwitchStatement;
        })(Statement);
        AST.SwitchStatement = SwitchStatement;

        var ReturnStatement = (function (_super) {
          __extends(ReturnStatement, _super);
          function ReturnStatement(argument) {
            _super.call(this);
            this.argument = argument;
          }
          ReturnStatement.prototype.toSource = function (precedence) {
            var result = "return ";
            if (this.argument) {
              result += this.argument.toSource(Precedence.Sequence);
            }
            return result + ";\n";
          };
          return ReturnStatement;
        })(Statement);
        AST.ReturnStatement = ReturnStatement;

        var ThrowStatement = (function (_super) {
          __extends(ThrowStatement, _super);
          function ThrowStatement(argument) {
            _super.call(this);
            this.argument = argument;
          }
          ThrowStatement.prototype.toSource = function (precedence) {
            return "throw " + this.argument.toSource(Precedence.Sequence) + ";\n";
          };
          return ThrowStatement;
        })(Statement);
        AST.ThrowStatement = ThrowStatement;

        var TryStatement = (function (_super) {
          __extends(TryStatement, _super);
          function TryStatement(block, handlers, guardedHandlers, finalizer) {
            _super.call(this);
            this.block = block;
            this.handlers = handlers;
            this.guardedHandlers = guardedHandlers;
            this.finalizer = finalizer;
          }
          return TryStatement;
        })(Statement);
        AST.TryStatement = TryStatement;

        var WhileStatement = (function (_super) {
          __extends(WhileStatement, _super);
          function WhileStatement(test, body) {
            _super.call(this);
            this.test = test;
            this.body = body;
          }
          WhileStatement.prototype.toSource = function (precedence) {
            return "while(" + this.test.toSource(Precedence.Sequence) + "){" + this.body.toSource(Precedence.Sequence) + "}";
          };
          return WhileStatement;
        })(Statement);
        AST.WhileStatement = WhileStatement;

        var DoWhileStatement = (function (_super) {
          __extends(DoWhileStatement, _super);
          function DoWhileStatement(body, test) {
            _super.call(this);
            this.body = body;
            this.test = test;
          }
          return DoWhileStatement;
        })(Statement);
        AST.DoWhileStatement = DoWhileStatement;

        var ForStatement = (function (_super) {
          __extends(ForStatement, _super);
          function ForStatement(init, test, update, body) {
            _super.call(this);
            this.init = init;
            this.test = test;
            this.update = update;
            this.body = body;
          }
          return ForStatement;
        })(Statement);
        AST.ForStatement = ForStatement;

        var ForInStatement = (function (_super) {
          __extends(ForInStatement, _super);
          function ForInStatement(left, right, body, each) {
            _super.call(this);
            this.left = left;
            this.right = right;
            this.body = body;
            this.each = each;
          }
          return ForInStatement;
        })(Statement);
        AST.ForInStatement = ForInStatement;

        var DebuggerStatement = (function (_super) {
          __extends(DebuggerStatement, _super);
          function DebuggerStatement() {
            _super.apply(this, arguments);
          }
          return DebuggerStatement;
        })(Statement);
        AST.DebuggerStatement = DebuggerStatement;

        var Declaration = (function (_super) {
          __extends(Declaration, _super);
          function Declaration() {
            _super.apply(this, arguments);
          }
          return Declaration;
        })(Statement);
        AST.Declaration = Declaration;

        var FunctionDeclaration = (function (_super) {
          __extends(FunctionDeclaration, _super);
          function FunctionDeclaration(id, params, defaults, rest, body, generator, expression) {
            _super.call(this);
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.rest = rest;
            this.body = body;
            this.generator = generator;
            this.expression = expression;
          }
          return FunctionDeclaration;
        })(Declaration);
        AST.FunctionDeclaration = FunctionDeclaration;

        var VariableDeclaration = (function (_super) {
          __extends(VariableDeclaration, _super);
          function VariableDeclaration(declarations, kind) {
            _super.call(this);
            this.declarations = declarations;
            this.kind = kind;
          }
          VariableDeclaration.prototype.toSource = function (precedence) {
            return this.kind + " " + nodesToSource(this.declarations, precedence, ",") + ";\n";
          };
          return VariableDeclaration;
        })(Declaration);
        AST.VariableDeclaration = VariableDeclaration;

        var VariableDeclarator = (function (_super) {
          __extends(VariableDeclarator, _super);
          function VariableDeclarator(id, init) {
            _super.call(this);
            this.id = id;
            this.init = init;
          }
          VariableDeclarator.prototype.toSource = function (precedence) {
            var result = this.id.toSource(Precedence.Assignment);
            if (this.init) {
              result += "=" + this.init.toSource(Precedence.Assignment);
            }
            return result;
          };
          return VariableDeclarator;
        })(Node);
        AST.VariableDeclarator = VariableDeclarator;

        var Identifier = (function (_super) {
          __extends(Identifier, _super);
          function Identifier(name) {
            _super.call(this);
            this.name = name;
          }
          Identifier.prototype.toSource = function (precedence) {
            return this.name;
          };
          return Identifier;
        })(Expression);
        AST.Identifier = Identifier;

        var Literal = (function (_super) {
          __extends(Literal, _super);
          function Literal(value) {
            _super.call(this);
            this.value = value;
          }
          Literal.prototype.toSource = function (precedence) {
            return toLiteralSource(this.value);
          };
          return Literal;
        })(Expression);
        AST.Literal = Literal;

        var ThisExpression = (function (_super) {
          __extends(ThisExpression, _super);
          function ThisExpression() {
            _super.apply(this, arguments);
          }
          ThisExpression.prototype.toSource = function (precedence) {
            return "this";
          };
          return ThisExpression;
        })(Expression);
        AST.ThisExpression = ThisExpression;

        var ArrayExpression = (function (_super) {
          __extends(ArrayExpression, _super);
          function ArrayExpression(elements) {
            _super.call(this);
            this.elements = elements;
          }
          ArrayExpression.prototype.toSource = function (precedence) {
            return "[" + nodesToSource(this.elements, Precedence.Assignment, ",") + "]";
          };
          return ArrayExpression;
        })(Expression);
        AST.ArrayExpression = ArrayExpression;

        var ObjectExpression = (function (_super) {
          __extends(ObjectExpression, _super);
          function ObjectExpression(properties) {
            _super.call(this);
            this.properties = properties;
          }
          ObjectExpression.prototype.toSource = function (precedence) {
            return "{" + nodesToSource(this.properties, Precedence.Sequence, ",") + "}";
          };
          return ObjectExpression;
        })(Expression);
        AST.ObjectExpression = ObjectExpression;

        var FunctionExpression = (function (_super) {
          __extends(FunctionExpression, _super);
          function FunctionExpression(id, params, defaults, rest, body, generator, expression) {
            _super.call(this);
            this.id = id;
            this.params = params;
            this.defaults = defaults;
            this.rest = rest;
            this.body = body;
            this.generator = generator;
            this.expression = expression;
          }
          return FunctionExpression;
        })(Expression);
        AST.FunctionExpression = FunctionExpression;

        var SequenceExpression = (function (_super) {
          __extends(SequenceExpression, _super);
          function SequenceExpression(expressions) {
            _super.call(this);
            this.expressions = expressions;
          }
          return SequenceExpression;
        })(Expression);
        AST.SequenceExpression = SequenceExpression;

        var UnaryExpression = (function (_super) {
          __extends(UnaryExpression, _super);
          function UnaryExpression(operator, prefix, argument) {
            _super.call(this);
            this.operator = operator;
            this.prefix = prefix;
            this.argument = argument;
          }
          UnaryExpression.prototype.toSource = function (precedence) {
            var argument = this.argument.toSource(Precedence.Unary);
            var result = this.prefix ? this.operator + argument : argument + this.operator;
            result = " " + result;
            result = parenthesize(result, Precedence.Unary, precedence);
            return result;
          };
          return UnaryExpression;
        })(Expression);
        AST.UnaryExpression = UnaryExpression;

        var BinaryExpression = (function (_super) {
          __extends(BinaryExpression, _super);
          function BinaryExpression(operator, left, right) {
            _super.call(this);
            this.operator = operator;
            this.left = left;
            this.right = right;
          }
          BinaryExpression.prototype.toSource = function (precedence) {
            var currentPrecedence = BinaryPrecedence[this.operator];
            var result = this.left.toSource(currentPrecedence) + this.operator + this.right.toSource(currentPrecedence + 1);
            return parenthesize(result, currentPrecedence, precedence);
          };
          return BinaryExpression;
        })(Expression);
        AST.BinaryExpression = BinaryExpression;

        var AssignmentExpression = (function (_super) {
          __extends(AssignmentExpression, _super);
          function AssignmentExpression(operator, left, right) {
            _super.call(this);
            this.operator = operator;
            this.left = left;
            this.right = right;
          }
          AssignmentExpression.prototype.toSource = function (precedence) {
            var result = this.left.toSource(Precedence.Assignment) + this.operator + this.right.toSource(Precedence.Assignment);
            return parenthesize(result, Precedence.Assignment, precedence);
          };
          return AssignmentExpression;
        })(Expression);
        AST.AssignmentExpression = AssignmentExpression;

        var UpdateExpression = (function (_super) {
          __extends(UpdateExpression, _super);
          function UpdateExpression(operator, argument, prefix) {
            _super.call(this);
            this.operator = operator;
            this.argument = argument;
            this.prefix = prefix;
          }
          return UpdateExpression;
        })(Expression);
        AST.UpdateExpression = UpdateExpression;

        var LogicalExpression = (function (_super) {
          __extends(LogicalExpression, _super);
          function LogicalExpression(operator, left, right) {
            _super.call(this, operator, left, right);
          }
          return LogicalExpression;
        })(BinaryExpression);
        AST.LogicalExpression = LogicalExpression;

        var ConditionalExpression = (function (_super) {
          __extends(ConditionalExpression, _super);
          function ConditionalExpression(test, consequent, alternate) {
            _super.call(this);
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
          }
          ConditionalExpression.prototype.toSource = function (precedence) {
            return this.test.toSource(Precedence.LogicalOR) + "?" + this.consequent.toSource(Precedence.Assignment) + ":" + this.alternate.toSource(Precedence.Assignment);
          };
          return ConditionalExpression;
        })(Expression);
        AST.ConditionalExpression = ConditionalExpression;

        var NewExpression = (function (_super) {
          __extends(NewExpression, _super);
          function NewExpression(callee, _arguments) {
            _super.call(this);
            this.callee = callee;
            this.arguments = _arguments;
          }
          NewExpression.prototype.toSource = function (precedence) {
            return "new " + this.callee.toSource(precedence) + "(" + nodesToSource(this.arguments, precedence, ",") + ")";
          };
          return NewExpression;
        })(Expression);
        AST.NewExpression = NewExpression;

        var CallExpression = (function (_super) {
          __extends(CallExpression, _super);
          function CallExpression(callee, _arguments) {
            _super.call(this);
            this.callee = callee;
            this.arguments = _arguments;
          }
          CallExpression.prototype.toSource = function (precedence) {
            return this.callee.toSource(precedence) + "(" + nodesToSource(this.arguments, precedence, ",") + ")";
          };
          return CallExpression;
        })(Expression);
        AST.CallExpression = CallExpression;

        var MemberExpression = (function (_super) {
          __extends(MemberExpression, _super);
          function MemberExpression(object, property, computed) {
            _super.call(this);
            this.object = object;
            this.property = property;
            this.computed = computed;
          }
          MemberExpression.prototype.toSource = function (precedence) {
            var result = this.object.toSource(Precedence.Call);
            if (this.object instanceof Literal) {
              result = alwaysParenthesize(result);
            }
            var property = this.property.toSource(Precedence.Sequence);
            if (this.computed) {
              result += "[" + property + "]";
            } else {
              result += "." + property;
            }
            return parenthesize(result, Precedence.Member, precedence);
          };
          return MemberExpression;
        })(Expression);
        AST.MemberExpression = MemberExpression;

        var Property = (function (_super) {
          __extends(Property, _super);
          function Property(key, value, kind) {
            _super.call(this);
            this.key = key;
            this.value = value;
            this.kind = kind;
          }
          Property.prototype.toSource = function (precedence) {
            return this.key.toSource(precedence) + ":" + this.value.toSource(precedence);
          };
          return Property;
        })(Node);
        AST.Property = Property;

        var SwitchCase = (function (_super) {
          __extends(SwitchCase, _super);
          function SwitchCase(test, consequent) {
            _super.call(this);
            this.test = test;
            this.consequent = consequent;
          }
          SwitchCase.prototype.toSource = function (precedence) {
            var result = this.test ? "case " + this.test.toSource(precedence) : "default";
            return result + ": " + nodesToSource(this.consequent, precedence, ";");
          };
          return SwitchCase;
        })(Node);
        AST.SwitchCase = SwitchCase;

        var CatchClause = (function (_super) {
          __extends(CatchClause, _super);
          function CatchClause(param, guard, body) {
            _super.call(this);
            this.param = param;
            this.guard = guard;
            this.body = body;
          }
          return CatchClause;
        })(Node);
        AST.CatchClause = CatchClause;

        Node.prototype.type = "Node";
        Program.prototype.type = "Program";
        Statement.prototype.type = "Statement";
        EmptyStatement.prototype.type = "EmptyStatement";
        BlockStatement.prototype.type = "BlockStatement";
        ExpressionStatement.prototype.type = "ExpressionStatement";
        IfStatement.prototype.type = "IfStatement";
        LabeledStatement.prototype.type = "LabeledStatement";
        BreakStatement.prototype.type = "BreakStatement";
        ContinueStatement.prototype.type = "ContinueStatement";
        WithStatement.prototype.type = "WithStatement";
        SwitchStatement.prototype.type = "SwitchStatement";
        ReturnStatement.prototype.type = "ReturnStatement";
        ThrowStatement.prototype.type = "ThrowStatement";
        TryStatement.prototype.type = "TryStatement";
        WhileStatement.prototype.type = "WhileStatement";
        DoWhileStatement.prototype.type = "DoWhileStatement";
        ForStatement.prototype.type = "ForStatement";
        ForInStatement.prototype.type = "ForInStatement";
        DebuggerStatement.prototype.type = "DebuggerStatement";
        Declaration.prototype.type = "Declaration";
        FunctionDeclaration.prototype.type = "FunctionDeclaration";
        VariableDeclaration.prototype.type = "VariableDeclaration";
        VariableDeclarator.prototype.type = "VariableDeclarator";
        Expression.prototype.type = "Expression";
        Identifier.prototype.type = "Identifier";
        Literal.prototype.type = "Literal";
        ThisExpression.prototype.type = "ThisExpression";
        ArrayExpression.prototype.type = "ArrayExpression";
        ObjectExpression.prototype.type = "ObjectExpression";
        FunctionExpression.prototype.type = "FunctionExpression";
        SequenceExpression.prototype.type = "SequenceExpression";
        UnaryExpression.prototype.type = "UnaryExpression";
        BinaryExpression.prototype.type = "BinaryExpression";
        AssignmentExpression.prototype.type = "AssignmentExpression";
        UpdateExpression.prototype.type = "UpdateExpression";
        LogicalExpression.prototype.type = "LogicalExpression";
        ConditionalExpression.prototype.type = "ConditionalExpression";
        NewExpression.prototype.type = "NewExpression";
        CallExpression.prototype.type = "CallExpression";
        MemberExpression.prototype.type = "MemberExpression";
        Property.prototype.type = "Property";
        SwitchCase.prototype.type = "SwitchCase";
        CatchClause.prototype.type = "CatchClause";
      })(Compiler.AST || (Compiler.AST = {}));
      var AST = Compiler.AST;
    })(AVM2.Compiler || (AVM2.Compiler = {}));
    var Compiler = AVM2.Compiler;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Compiler) {
      (function (IR) {
        var ASScope = (function (_super) {
          __extends(ASScope, _super);
          function ASScope(parent, object, isWith) {
            _super.call(this);
            this.parent = parent;
            this.object = object;
            this.isWith = isWith;
          }
          ASScope.prototype.visitInputs = function (visitor) {
            visitor(this.parent);
            visitor(this.object);
          };
          return ASScope;
        })(IR.Value);
        IR.ASScope = ASScope;
        ASScope.prototype.nodeName = "ASScope";

        var ASMultiname = (function (_super) {
          __extends(ASMultiname, _super);
          function ASMultiname(namespaces, name, flags) {
            _super.call(this);
            this.namespaces = namespaces;
            this.name = name;
            this.flags = flags;
          }
          ASMultiname.prototype.visitInputs = function (visitor) {
            visitor(this.namespaces);
            visitor(this.name);
          };
          return ASMultiname;
        })(IR.Value);
        IR.ASMultiname = ASMultiname;
        ASMultiname.prototype.mustFloat = true;
        ASMultiname.prototype.nodeName = "ASMultiname";

        var ASCallProperty = (function (_super) {
          __extends(ASCallProperty, _super);
          function ASCallProperty(control, store, object, name, args, flags, isLex) {
            _super.call(this, control, store, object, name, args, flags);
            this.isLex = isLex;
          }
          return ASCallProperty;
        })(IR.CallProperty);
        IR.ASCallProperty = ASCallProperty;
        ASCallProperty.prototype.nodeName = "ASCallProperty";

        var ASCallSuper = (function (_super) {
          __extends(ASCallSuper, _super);
          function ASCallSuper(control, store, object, name, args, flags, scope) {
            _super.call(this, control, store, object, name, args, flags);
            this.scope = scope;
          }
          ASCallSuper.prototype.visitInputs = function (visitor) {
            _super.prototype.visitInputs.call(this, visitor);
            visitor(this.scope);
          };
          return ASCallSuper;
        })(IR.CallProperty);
        IR.ASCallSuper = ASCallSuper;
        ASCallSuper.prototype.nodeName = "ASCallSuper";

        var ASNew = (function (_super) {
          __extends(ASNew, _super);
          function ASNew(control, store, callee, args) {
            _super.call(this, control, store, callee, args);
          }
          return ASNew;
        })(IR.New);
        IR.ASNew = ASNew;
        ASNew.prototype.nodeName = "ASNew";

        var ASGetProperty = (function (_super) {
          __extends(ASGetProperty, _super);
          function ASGetProperty(control, store, object, name, flags) {
            _super.call(this, control, store, object, name);
            this.flags = flags;
          }
          return ASGetProperty;
        })(IR.GetProperty);
        IR.ASGetProperty = ASGetProperty;

        ASGetProperty.prototype.nodeName = "ASGetProperty";

        var ASGetDescendants = (function (_super) {
          __extends(ASGetDescendants, _super);
          function ASGetDescendants(control, store, object, name) {
            _super.call(this, control, store, object, name);
          }
          return ASGetDescendants;
        })(IR.GetProperty);
        IR.ASGetDescendants = ASGetDescendants;
        ASGetDescendants.prototype.nodeName = "ASGetDescendants";

        var ASHasProperty = (function (_super) {
          __extends(ASHasProperty, _super);
          function ASHasProperty(control, store, object, name) {
            _super.call(this, control, store, object, name);
          }
          return ASHasProperty;
        })(IR.GetProperty);
        IR.ASHasProperty = ASHasProperty;
        ASHasProperty.prototype.nodeName = "ASHasProperty";

        var ASGetSlot = (function (_super) {
          __extends(ASGetSlot, _super);
          function ASGetSlot(control, store, object, name) {
            _super.call(this, control, store, object, name);
          }
          return ASGetSlot;
        })(IR.GetProperty);
        IR.ASGetSlot = ASGetSlot;
        ASGetSlot.prototype.nodeName = "ASGetSlot";

        var ASGetSuper = (function (_super) {
          __extends(ASGetSuper, _super);
          function ASGetSuper(control, store, object, name, scope) {
            _super.call(this, control, store, object, name);
            this.scope = scope;
          }
          ASGetSuper.prototype.visitInputs = function (visitor) {
            _super.prototype.visitInputs.call(this, visitor);
            visitor(this.scope);
          };
          return ASGetSuper;
        })(IR.GetProperty);
        IR.ASGetSuper = ASGetSuper;
        ASGetSuper.prototype.nodeName = "ASGetSuper";

        var ASSetProperty = (function (_super) {
          __extends(ASSetProperty, _super);
          function ASSetProperty(control, store, object, name, value, flags) {
            _super.call(this, control, store, object, name, value);
            this.flags = flags;
          }
          return ASSetProperty;
        })(IR.SetProperty);
        IR.ASSetProperty = ASSetProperty;
        ASSetProperty.prototype.nodeName = "ASSetProperty";

        var ASSetSlot = (function (_super) {
          __extends(ASSetSlot, _super);
          function ASSetSlot(control, store, object, name, value) {
            _super.call(this, control, store, object, name, value);
          }
          return ASSetSlot;
        })(IR.SetProperty);
        IR.ASSetSlot = ASSetSlot;
        ASSetSlot.prototype.nodeName = "ASSetSlot";

        var ASSetSuper = (function (_super) {
          __extends(ASSetSuper, _super);
          function ASSetSuper(control, store, object, name, value, scope) {
            _super.call(this, control, store, object, name, value);
            this.scope = scope;
          }
          ASSetSuper.prototype.visitInputs = function (visitor) {
            _super.prototype.visitInputs.call(this, visitor);
            visitor(this.scope);
          };
          return ASSetSuper;
        })(IR.SetProperty);
        IR.ASSetSuper = ASSetSuper;
        ASSetSuper.prototype.nodeName = "ASSetSuper";

        var ASDeleteProperty = (function (_super) {
          __extends(ASDeleteProperty, _super);
          function ASDeleteProperty(control, store, object, name) {
            _super.call(this, control, store, object, name);
          }
          return ASDeleteProperty;
        })(IR.DeleteProperty);
        IR.ASDeleteProperty = ASDeleteProperty;
        ASDeleteProperty.prototype.nodeName = "ASDeleteProperty";

        var ASFindProperty = (function (_super) {
          __extends(ASFindProperty, _super);
          function ASFindProperty(control, store, scope, name, methodInfo, strict) {
            _super.call(this, control, store);
            this.scope = scope;
            this.name = name;
            this.methodInfo = methodInfo;
            this.strict = strict;
          }
          ASFindProperty.prototype.visitInputs = function (visitor) {
            _super.prototype.visitInputs.call(this, visitor);
            visitor(this.scope);
            visitor(this.name);
          };
          return ASFindProperty;
        })(IR.StoreDependent);
        IR.ASFindProperty = ASFindProperty;

        ASFindProperty.prototype.nodeName = "ASFindProperty";

        var ASGlobal = (function (_super) {
          __extends(ASGlobal, _super);
          function ASGlobal(control, scope) {
            _super.call(this);
            this.control = control;
            this.scope = scope;
          }
          ASGlobal.prototype.visitInputs = function (visitor) {
            this.control && visitor(this.control);
            visitor(this.scope);
          };
          return ASGlobal;
        })(IR.Value);
        IR.ASGlobal = ASGlobal;

        ASGlobal.prototype.nodeName = "ASGlobal";

        var ASNewActivation = (function (_super) {
          __extends(ASNewActivation, _super);
          function ASNewActivation(methodInfo) {
            _super.call(this);
            this.methodInfo = methodInfo;
          }
          return ASNewActivation;
        })(IR.Value);
        IR.ASNewActivation = ASNewActivation;

        ASNewActivation.prototype.nodeName = "ASNewActivation";

        var ASNewHasNext2 = (function (_super) {
          __extends(ASNewHasNext2, _super);
          function ASNewHasNext2() {
            _super.call(this);
          }
          return ASNewHasNext2;
        })(IR.Value);
        IR.ASNewHasNext2 = ASNewHasNext2;

        ASNewActivation.prototype.nodeName = "ASNewHasNext2";
      })(Compiler.IR || (Compiler.IR = {}));
      var IR = Compiler.IR;
    })(AVM2.Compiler || (AVM2.Compiler = {}));
    var Compiler = AVM2.Compiler;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Compiler) {
      (function (Looper) {
        var top = Shumway.ArrayUtilities.top;
        var peek = Shumway.ArrayUtilities.peek;

        var assert = Shumway.Debug.assert;

        (function (Control) {
          (function (Kind) {
            Kind[Kind["SEQ"] = 1] = "SEQ";
            Kind[Kind["LOOP"] = 2] = "LOOP";
            Kind[Kind["IF"] = 3] = "IF";
            Kind[Kind["CASE"] = 4] = "CASE";
            Kind[Kind["SWITCH"] = 5] = "SWITCH";
            Kind[Kind["LABEL_CASE"] = 6] = "LABEL_CASE";
            Kind[Kind["LABEL_SWITCH"] = 7] = "LABEL_SWITCH";
            Kind[Kind["EXIT"] = 8] = "EXIT";
            Kind[Kind["BREAK"] = 9] = "BREAK";
            Kind[Kind["CONTINUE"] = 10] = "CONTINUE";
            Kind[Kind["TRY"] = 11] = "TRY";
            Kind[Kind["CATCH"] = 12] = "CATCH";
          })(Control.Kind || (Control.Kind = {}));
          var Kind = Control.Kind;

          var ControlNode = (function () {
            function ControlNode(kind) {
              this.kind = kind;
            }
            return ControlNode;
          })();
          Control.ControlNode = ControlNode;

          var Seq = (function (_super) {
            __extends(Seq, _super);
            function Seq(body) {
              _super.call(this, 1 /* SEQ */);
              this.body = body;
            }
            Seq.prototype.trace = function (writer) {
              var body = this.body;
              for (var i = 0, j = body.length; i < j; i++) {
                body[i].trace(writer);
              }
            };

            Seq.prototype.first = function () {
              return this.body[0];
            };

            Seq.prototype.slice = function (begin, end) {
              return new Seq(this.body.slice(begin, end));
            };
            return Seq;
          })(ControlNode);
          Control.Seq = Seq;

          var Loop = (function (_super) {
            __extends(Loop, _super);
            function Loop(body) {
              _super.call(this, 2 /* LOOP */);
              this.body = body;
            }
            Loop.prototype.trace = function (writer) {
              writer.enter("loop {");
              this.body.trace(writer);
              writer.leave("}");
            };
            return Loop;
          })(ControlNode);
          Control.Loop = Loop;

          var If = (function (_super) {
            __extends(If, _super);
            function If(cond, then, els, nothingThrownLabel) {
              _super.call(this, 3 /* IF */);
              this.cond = cond;
              this.then = then;
              this.nothingThrownLabel = nothingThrownLabel;
              this.negated = false;
              this.else = els;
            }
            If.prototype.trace = function (writer) {
              this.cond.trace(writer);
              if (this.nothingThrownLabel) {
                writer.enter("if (label is " + this.nothingThrownLabel + ") {");
              }
              writer.enter("if" + (this.negated ? " not" : "") + " {");
              this.then && this.then.trace(writer);
              if (this.else) {
                writer.outdent();
                writer.enter("} else {");
                this.else.trace(writer);
              }
              writer.leave("}");
              if (this.nothingThrownLabel) {
                writer.leave("}");
              }
            };
            return If;
          })(ControlNode);
          Control.If = If;

          var Case = (function (_super) {
            __extends(Case, _super);
            function Case(index, body) {
              _super.call(this, 4 /* CASE */);
              this.index = index;
              this.body = body;
            }
            Case.prototype.trace = function (writer) {
              if (this.index >= 0) {
                writer.writeLn("case " + this.index + ":");
              } else {
                writer.writeLn("default:");
              }
              writer.indent();
              this.body && this.body.trace(writer);
              writer.outdent();
            };
            return Case;
          })(ControlNode);
          Control.Case = Case;

          var Switch = (function (_super) {
            __extends(Switch, _super);
            function Switch(determinant, cases, nothingThrownLabel) {
              _super.call(this, 5 /* SWITCH */);
              this.determinant = determinant;
              this.cases = cases;
              this.nothingThrownLabel = nothingThrownLabel;
            }
            Switch.prototype.trace = function (writer) {
              if (this.nothingThrownLabel) {
                writer.enter("if (label is " + this.nothingThrownLabel + ") {");
              }
              this.determinant.trace(writer);
              writer.writeLn("switch {");
              for (var i = 0, j = this.cases.length; i < j; i++) {
                this.cases[i].trace(writer);
              }
              writer.writeLn("}");
              if (this.nothingThrownLabel) {
                writer.leave("}");
              }
            };
            return Switch;
          })(ControlNode);
          Control.Switch = Switch;

          var LabelCase = (function (_super) {
            __extends(LabelCase, _super);
            function LabelCase(labels, body) {
              _super.call(this, 6 /* LABEL_CASE */);
              this.labels = labels;
              this.body = body;
            }
            LabelCase.prototype.trace = function (writer) {
              writer.enter("if (label is " + this.labels.join(" or ") + ") {");
              this.body && this.body.trace(writer);
              writer.leave("}");
            };
            return LabelCase;
          })(ControlNode);
          Control.LabelCase = LabelCase;

          var LabelSwitch = (function (_super) {
            __extends(LabelSwitch, _super);
            function LabelSwitch(cases) {
              _super.call(this, 7 /* LABEL_SWITCH */);
              this.cases = cases;
              var labelMap = {};

              for (var i = 0, j = cases.length; i < j; i++) {
                var c = cases[i];
                if (!c.labels) {
                }
                for (var k = 0, l = c.labels.length; k < l; k++) {
                  labelMap[c.labels[k]] = c;
                }
              }

              this.labelMap = labelMap;
            }
            LabelSwitch.prototype.trace = function (writer) {
              for (var i = 0, j = this.cases.length; i < j; i++) {
                this.cases[i].trace(writer);
              }
            };
            return LabelSwitch;
          })(ControlNode);
          Control.LabelSwitch = LabelSwitch;

          var Exit = (function (_super) {
            __extends(Exit, _super);
            function Exit(label) {
              _super.call(this, 8 /* EXIT */);
              this.label = label;
            }
            Exit.prototype.trace = function (writer) {
              writer.writeLn("label = " + this.label);
            };
            return Exit;
          })(ControlNode);
          Control.Exit = Exit;

          var Break = (function (_super) {
            __extends(Break, _super);
            function Break(label, head) {
              _super.call(this, 9 /* BREAK */);
              this.label = label;
              this.head = head;
            }
            Break.prototype.trace = function (writer) {
              this.label && writer.writeLn("label = " + this.label);
              writer.writeLn("break");
            };
            return Break;
          })(ControlNode);
          Control.Break = Break;

          var Continue = (function (_super) {
            __extends(Continue, _super);
            function Continue(label, head) {
              _super.call(this, 10 /* CONTINUE */);
              this.label = label;
              this.head = head;
              this.necessary = true;
            }
            Continue.prototype.trace = function (writer) {
              this.label && writer.writeLn("label = " + this.label);
              this.necessary && writer.writeLn("continue");
            };
            return Continue;
          })(ControlNode);
          Control.Continue = Continue;

          var Try = (function (_super) {
            __extends(Try, _super);
            function Try(body, catches) {
              _super.call(this, 11 /* TRY */);
              this.body = body;
              this.catches = catches;
            }
            Try.prototype.trace = function (writer) {
              writer.enter("try {");
              this.body.trace(writer);
              writer.writeLn("label = " + this.nothingThrownLabel);
              for (var i = 0, j = this.catches.length; i < j; i++) {
                this.catches[i].trace(writer);
              }
              writer.leave("}");
            };
            return Try;
          })(ControlNode);
          Control.Try = Try;

          var Catch = (function (_super) {
            __extends(Catch, _super);
            function Catch(varName, typeName, body) {
              _super.call(this, 12 /* CATCH */);
              this.varName = varName;
              this.typeName = typeName;
              this.body = body;
            }
            Catch.prototype.trace = function (writer) {
              writer.outdent();
              writer.enter("} catch (" + (this.varName || "e") + (this.typeName ? (" : " + this.typeName) : "") + ") {");
              this.body.trace(writer);
            };
            return Catch;
          })(ControlNode);
          Control.Catch = Catch;
        })(Looper.Control || (Looper.Control = {}));
        var Control = Looper.Control;

        var BITS_PER_WORD = Shumway.BitSets.BITS_PER_WORD;
        var ADDRESS_BITS_PER_WORD = Shumway.BitSets.ADDRESS_BITS_PER_WORD;
        var BIT_INDEX_MASK = Shumway.BitSets.BIT_INDEX_MASK;

        var BlockSet = (function (_super) {
          __extends(BlockSet, _super);
          function BlockSet(length, blockById) {
            _super.call(this, length);
            this.blockById = blockById;
          }
          BlockSet.prototype.forEachBlock = function (fn) {
            release || assert(fn);
            var byId = this.blockById;
            var bits = this.bits;
            for (var i = 0, j = bits.length; i < j; i++) {
              var word = bits[i];
              if (word) {
                for (var k = 0; k < BITS_PER_WORD; k++) {
                  if (word & (1 << k)) {
                    fn(byId[i * BITS_PER_WORD + k]);
                  }
                }
              }
            }
          };

          BlockSet.prototype.choose = function () {
            var byId = this.blockById;
            var bits = this.bits;
            for (var i = 0, j = bits.length; i < j; i++) {
              var word = bits[i];
              if (word) {
                for (var k = 0; k < BITS_PER_WORD; k++) {
                  if (word & (1 << k)) {
                    return byId[i * BITS_PER_WORD + k];
                  }
                }
              }
            }
          };

          BlockSet.prototype.members = function () {
            var byId = this.blockById;
            var set = [];
            var bits = this.bits;
            for (var i = 0, j = bits.length; i < j; i++) {
              var word = bits[i];
              if (word) {
                for (var k = 0; k < BITS_PER_WORD; k++) {
                  if (word & (1 << k)) {
                    set.push(byId[i * BITS_PER_WORD + k]);
                  }
                }
              }
            }
            return set;
          };

          BlockSet.prototype.setBlocks = function (bs) {
            var bits = this.bits;
            for (var i = 0, j = bs.length; i < j; i++) {
              var id = bs[i].id;
              bits[id >> ADDRESS_BITS_PER_WORD] |= 1 << (id & BIT_INDEX_MASK);
            }
          };
          return BlockSet;
        })(Shumway.BitSets.Uint32ArrayBitSet);
        Looper.BlockSet = BlockSet;

        var Analysis = (function () {
          function Analysis(cfg) {
            this.makeBlockSetFactory(cfg.blocks.length, cfg.blocks);
            this.hasExceptions = false;
            this.normalizeReachableBlocks(cfg.root);
          }
          Analysis.prototype.makeBlockSetFactory = function (length, blockById) {
            release || assert(!this.boundBlockSet);
            this.boundBlockSet = (function blockSet() {
              return new BlockSet(length, blockById);
            });
          };

          Analysis.prototype.normalizeReachableBlocks = function (root) {
            release || assert(root.predecessors.length === 0);

            var ONCE = 1;
            var BUNCH_OF_TIMES = 2;
            var BlockSet = this.boundBlockSet;

            var blocks = [];
            var visited = {};
            var ancestors = {};
            var worklist = [root];
            var node;

            ancestors[root.id] = true;
            while ((node = top(worklist))) {
              if (visited[node.id]) {
                if (visited[node.id] === ONCE) {
                  visited[node.id] = BUNCH_OF_TIMES;
                  blocks.push(node);
                }

                ancestors[node.id] = false;
                worklist.pop();
                continue;
              }

              visited[node.id] = ONCE;
              ancestors[node.id] = true;

              var successors = node.successors;
              for (var i = 0, j = successors.length; i < j; i++) {
                var s = successors[i];

                if (ancestors[s.id]) {
                  if (!node.spbacks) {
                    node.spbacks = new BlockSet();
                  }
                  node.spbacks.set(s.id);
                }
                !visited[s.id] && worklist.push(s);
              }
            }

            this.blocks = blocks.reverse();
          };

          Analysis.prototype.computeDominance = function () {
            function intersectDominators(doms, b1, b2) {
              var finger1 = b1;
              var finger2 = b2;
              while (finger1 !== finger2) {
                while (finger1 > finger2) {
                  finger1 = doms[finger1];
                }
                while (finger2 > finger1) {
                  finger2 = doms[finger2];
                }
              }
              return finger1;
            }

            var blocks = this.blocks;
            var n = blocks.length;
            var doms = new Array(n);
            doms[0] = 0;

            var rpo = [];
            for (var b = 0; b < n; b++) {
              rpo[blocks[b].id] = b;
              blocks[b].dominatees = [];
            }

            var changed = true;
            while (changed) {
              changed = false;

              for (var b = 1; b < n; b++) {
                var predecessors = blocks[b].predecessors;
                var j = predecessors.length;

                var newIdom = rpo[predecessors[0].id];

                if (!(newIdom in doms)) {
                  for (var i = 1; i < j; i++) {
                    newIdom = rpo[predecessors[i].id];
                    if (newIdom in doms) {
                      break;
                    }
                  }
                }
                release || assert(newIdom in doms);

                for (var i = 0; i < j; i++) {
                  var p = rpo[predecessors[i].id];
                  if (p === newIdom) {
                    continue;
                  }

                  if (p in doms) {
                    newIdom = intersectDominators(doms, p, newIdom);
                  }
                }

                if (doms[b] !== newIdom) {
                  doms[b] = newIdom;
                  changed = true;
                }
              }
            }

            blocks[0].dominator = blocks[0];
            var block;
            for (var b = 1; b < n; b++) {
              block = blocks[b];
              var idom = blocks[doms[b]];

              block.dominator = idom;
              idom.dominatees.push(block);

              block.npredecessors = block.predecessors.length;
            }

            var worklist = [blocks[0]];
            blocks[0].level || (blocks[0].level = 0);
            while ((block = worklist.shift())) {
              var dominatees = block.dominatees;
              for (var i = 0; i < dominatees.length; i++) {
                dominatees[i].level = block.level + 1;
              }
              worklist.push.apply(worklist, dominatees);
            }
          };

          Analysis.prototype.computeFrontiers = function () {
            var BlockSet = this.boundBlockSet;
            var blocks = this.blocks;

            for (var b = 0, n = blocks.length; b < n; b++) {
              blocks[b].frontier = new BlockSet();
            }

            for (var b = 1, n = blocks.length; b < n; b++) {
              var block = blocks[b];
              var predecessors = block.predecessors;

              if (predecessors.length >= 2) {
                var idom = block.dominator;
                for (var i = 0, j = predecessors.length; i < j; i++) {
                  var runner = predecessors[i];

                  while (runner !== idom) {
                    runner.frontier.set(block.id);
                    runner = runner.dominator;
                  }
                }
              }
            }
          };

          Analysis.prototype.analyzeControlFlow = function () {
            this.computeDominance();
            this.analyzedControlFlow = true;
            return true;
          };

          Analysis.prototype.markLoops = function () {
            if (!this.analyzedControlFlow && !this.analyzeControlFlow()) {
              return false;
            }

            var BlockSet = this.boundBlockSet;

            function findSCCs(root) {
              var preorderId = 1;
              var preorder = {};
              var assigned = {};
              var unconnectedNodes = [];
              var pendingNodes = [];
              var sccs = [];
              var level = root.level + 1;
              var worklist = [root];
              var node;
              var u, s;

              while ((node = top(worklist))) {
                if (preorder[node.id]) {
                  if (peek(pendingNodes) === node) {
                    pendingNodes.pop();

                    var scc = [];
                    do {
                      u = unconnectedNodes.pop();
                      assigned[u.id] = true;
                      scc.push(u);
                    } while(u !== node);

                    if (scc.length > 1 || (u.spbacks && u.spbacks.get(u.id))) {
                      sccs.push(scc);
                    }
                  }

                  worklist.pop();
                  continue;
                }

                preorder[node.id] = preorderId++;
                unconnectedNodes.push(node);
                pendingNodes.push(node);

                var successors = node.successors;
                for (var i = 0, j = successors.length; i < j; i++) {
                  s = successors[i];
                  if (s.level < level) {
                    continue;
                  }

                  var sid = s.id;
                  if (!preorder[sid]) {
                    worklist.push(s);
                  } else if (!assigned[sid]) {
                    while (preorder[peek(pendingNodes).id] > preorder[sid]) {
                      pendingNodes.pop();
                    }
                  }
                }
              }

              return sccs;
            }

            function findLoopHeads(blocks) {
              var heads = new BlockSet();

              for (var i = 0, j = blocks.length; i < j; i++) {
                var block = blocks[i];
                var spbacks = block.spbacks;

                if (!spbacks) {
                  continue;
                }

                var successors = block.successors;
                for (var k = 0, l = successors.length; k < l; k++) {
                  var s = successors[k];
                  if (spbacks.get(s.id)) {
                    heads.set(s.dominator.id);
                  }
                }
              }

              return heads.members();
            }

            function LoopInfo(scc, loopId) {
              var body = new BlockSet();
              body.setBlocks(scc);
              body.recount();

              this.id = loopId;
              this.body = body;
              this.exit = new BlockSet();
              this.save = {};
              this.head = new BlockSet();
              this.npredecessors = 0;
            }

            var heads = findLoopHeads(this.blocks);
            if (heads.length <= 0) {
              this.markedLoops = true;
              return true;
            }

            var worklist = heads.sort(function (a, b) {
              return a.level - b.level;
            });
            var loopId = 0;

            for (var n = worklist.length - 1; n >= 0; n--) {
              var t = worklist[n];
              var sccs = findSCCs(t);
              if (sccs.length === 0) {
                continue;
              }

              for (var i = 0, j = sccs.length; i < j; i++) {
                var scc = sccs[i];
                var loop = new LoopInfo(scc, loopId++);
                for (var k = 0, l = scc.length; k < l; k++) {
                  var h = scc[k];
                  if (h.level === t.level + 1 && !h.loop) {
                    h.loop = loop;
                    loop.head.set(h.id);

                    var predecessors = h.predecessors;
                    for (var pi = 0, pj = predecessors.length; pi < pj; pi++) {
                      loop.body.get(predecessors[pi].id) && h.npredecessors--;
                    }
                    loop.npredecessors += h.npredecessors;
                  }
                }

                for (var k = 0, l = scc.length; k < l; k++) {
                  var h = scc[k];
                  if (h.level === t.level + 1) {
                    h.npredecessors = loop.npredecessors;
                  }
                }

                loop.head.recount();
              }
            }

            this.markedLoops = true;
            return true;
          };

          Analysis.prototype.induceControlTree = function () {
            var hasExceptions = this.hasExceptions;
            var BlockSet = this.boundBlockSet;

            function maybe(exit, save) {
              exit.recount();
              if (exit.count === 0) {
                return null;
              }
              exit.save = save;
              return exit;
            }

            var exceptionId = this.blocks.length;

            function induce(head, exit, save, loop, inLoopHead, lookupSwitch, fallthrough) {
              var v = [];

              while (head) {
                if (head.count > 1) {
                  var exit2 = new BlockSet();
                  var save2 = {};

                  var cases = [];
                  var heads = head.members();

                  for (var i = 0, j = heads.length; i < j; i++) {
                    var h = heads[i];
                    var bid = h.id;
                    var c;

                    if (h.loop && head.contains(h.loop.head)) {
                      var loop2 = h.loop;
                      if (!loop2.induced) {
                        var lheads = loop2.head.members();
                        var lheadsave = 0;

                        for (k = 0, l = lheads.length; k < l; k++) {
                          lheadsave += head.save[lheads[k].id];
                        }

                        if (h.npredecessors - lheadsave > 0) {
                          h.npredecessors -= head.save[bid];
                          h.save = head.save[bid];
                          c = induce(h, exit2, save2, loop);
                          cases.push(new Control.LabelCase([bid], c));
                        } else {
                          for (k = 0, l = lheads.length; k < l; k++) {
                            var lh = lheads[k];
                            lh.npredecessors -= lheadsave;
                            lh.save = lheadsave;
                          }
                          c = induce(h, exit2, save2, loop);
                          cases.push(new Control.LabelCase(loop2.head.toArray(), c));
                          loop2.induced = true;
                        }
                      }
                    } else {
                      h.npredecessors -= head.save[bid];
                      h.save = head.save[bid];
                      c = induce(h, exit2, save2, loop);
                      cases.push(new Control.LabelCase([bid], c));
                    }
                  }

                  var pruned = [];
                  var k = 0;
                  var c;
                  for (var i = 0; i < cases.length; i++) {
                    c = cases[i];
                    var labels = c.labels;
                    var lk = 0;
                    for (var ln = 0, nlabels = labels.length; ln < nlabels; ln++) {
                      var bid = labels[ln];
                      if (exit2.get(bid) && heads[i].npredecessors - head.save[bid] > 0) {
                        pruned.push(bid);
                      } else {
                        labels[lk++] = bid;
                      }
                    }
                    labels.length = lk;

                    if (labels.length > 0) {
                      cases[k++] = c;
                    }
                  }
                  cases.length = k;

                  if (cases.length === 0) {
                    for (var i = 0; i < pruned.length; i++) {
                      var bid = pruned[i];
                      save[bid] = (save[bid] || 0) + head.save[bid];
                      exit.set(bid);
                    }
                    break;
                  }

                  v.push(new Control.LabelSwitch(cases));

                  head = maybe(exit2, save2);
                  continue;
                }

                var h, bid, c;

                if (head.count === 1) {
                  h = head.choose();
                  bid = h.id;
                  h.npredecessors -= head.save[bid];
                  h.save = head.save[bid];
                } else {
                  h = head;
                  bid = h.id;
                }

                if (inLoopHead) {
                  inLoopHead = false;
                } else {
                  if (loop && !loop.body.get(bid)) {
                    h.npredecessors += h.save;
                    loop.exit.set(bid);
                    loop.save[bid] = (loop.save[bid] || 0) + h.save;
                    v.push(new Control.Break(bid, loop));
                    break;
                  }

                  if (loop && h.loop === loop) {
                    h.npredecessors += h.save;
                    v.push(new Control.Continue(bid, loop));
                    break;
                  }

                  if (h === fallthrough) {
                    break;
                  }

                  if (h.npredecessors > 0) {
                    h.npredecessors += h.save;
                    save[bid] = (save[bid] || 0) + h.save;
                    exit.set(bid);
                    v.push(lookupSwitch ? new Control.Break(bid, lookupSwitch) : new Control.Exit(bid));
                    break;
                  }

                  if (h.loop) {
                    var l = h.loop;

                    var body;
                    if (l.head.count === 1) {
                      body = induce(l.head.choose(), null, null, l, true);
                    } else {
                      var lcases = [];
                      var lheads = l.head.members();

                      for (var i = 0, j = lheads.length; i < j; i++) {
                        var lh = lheads[i];
                        var lbid = lh.id;
                        var c = induce(lh, null, null, l, true);
                        lcases.push(new Control.LabelCase([lbid], c));
                      }

                      body = new Control.LabelSwitch(lcases);
                    }

                    v.push(new Control.Loop(body));
                    head = maybe(l.exit, l.save);
                    continue;
                  }
                }

                var sv;
                var successors;
                var exit2 = new BlockSet();
                var save2 = {};

                if (hasExceptions && h.hasCatches) {
                  var allsuccessors = h.successors;
                  var catchsuccessors = [];
                  successors = [];

                  for (var i = 0, j = allsuccessors.length; i < j; i++) {
                    var s = allsuccessors[i];
                    (s.exception ? catchsuccessors : successors).push(s);
                  }

                  var catches = [];
                  for (var i = 0; i < catchsuccessors.length; i++) {
                    var t = catchsuccessors[i];
                    t.npredecessors -= 1;
                    t.save = 1;
                    var c = induce(t, exit2, save2, loop);
                    var ex = t.exception;
                    catches.push(new Control.Catch(ex.varName, ex.typeName, c));
                  }

                  sv = new Control.Try(h, catches);
                } else {
                  successors = h.successors;
                  sv = h;
                }

                if (successors.length > 2) {
                  var cases = [];
                  var targets = successors;

                  for (var i = targets.length - 1; i >= 0; i--) {
                    var t = targets[i];
                    t.npredecessors -= 1;
                    t.save = 1;
                    c = induce(t, exit2, save2, loop, null, h, targets[i + 1]);
                    cases.unshift(new Control.Case(i, c));
                  }

                  top(cases).index = undefined;

                  if (hasExceptions && h.hasCatches) {
                    sv.nothingThrownLabel = exceptionId;
                    sv = new Control.Switch(sv, cases, exceptionId++);
                  } else {
                    sv = new Control.Switch(sv, cases);
                  }

                  head = maybe(exit2, save2);
                } else if (successors.length === 2) {
                  var branch1 = h.hasFlippedSuccessors ? successors[1] : successors[0];
                  var branch2 = h.hasFlippedSuccessors ? successors[0] : successors[1];
                  branch1.npredecessors -= 1;
                  branch1.save = 1;
                  var c1 = induce(branch1, exit2, save2, loop);

                  branch2.npredecessors -= 1;
                  branch2.save = 1;
                  var c2 = induce(branch2, exit2, save2, loop);

                  if (hasExceptions && h.hasCatches) {
                    sv.nothingThrownLabel = exceptionId;
                    sv = new Control.If(sv, c1, c2, exceptionId++);
                  } else {
                    sv = new Control.If(sv, c1, c2);
                  }

                  head = maybe(exit2, save2);
                } else {
                  c = successors[0];

                  if (c) {
                    if (hasExceptions && h.hasCatches) {
                      sv.nothingThrownLabel = c.id;
                      save2[c.id] = (save2[c.id] || 0) + 1;
                      exit2.set(c.id);

                      head = maybe(exit2, save2);
                    } else {
                      c.npredecessors -= 1;
                      c.save = 1;
                      head = c;
                    }
                  } else {
                    if (hasExceptions && h.hasCatches) {
                      sv.nothingThrownLabel = -1;
                      head = maybe(exit2, save2);
                    } else {
                      head = c;
                    }
                  }
                }

                v.push(sv);
              }

              if (v.length > 1) {
                return new Control.Seq(v);
              }

              return v[0];
            }

            var root = this.blocks[0];
            this.controlTree = induce(root, new BlockSet(), {});
          };

          Analysis.prototype.restructureControlFlow = function () {
            AVM2.enterTimeline("Restructure Control Flow");
            if (!this.markedLoops && !this.markLoops()) {
              AVM2.leaveTimeline();
              return false;
            }
            this.induceControlTree();
            this.restructuredControlFlow = true;
            AVM2.leaveTimeline();
            return true;
          };
          return Analysis;
        })();
        Looper.Analysis = Analysis;

        function analyze(cfg) {
          var analysis = new Analysis(cfg);
          analysis.restructureControlFlow();
          return analysis.controlTree;
        }
        Looper.analyze = analyze;
      })(Compiler.Looper || (Compiler.Looper = {}));
      var Looper = Compiler.Looper;
    })(AVM2.Compiler || (AVM2.Compiler = {}));
    var Compiler = AVM2.Compiler;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Compiler) {
      (function (Backend) {
        var assert = Shumway.Debug.assert;
        var unexpected = Shumway.Debug.unexpected;
        var notImplemented = Shumway.Debug.notImplemented;
        var pushUnique = Shumway.ArrayUtilities.pushUnique;

        var AST = Shumway.AVM2.Compiler.AST;
        var Literal = Compiler.AST.Literal;
        var Identifier = Compiler.AST.Identifier;
        var VariableDeclaration = Compiler.AST.VariableDeclaration;
        var VariableDeclarator = Compiler.AST.VariableDeclarator;
        var MemberExpression = Compiler.AST.MemberExpression;
        var BinaryExpression = Compiler.AST.BinaryExpression;
        var CallExpression = Compiler.AST.CallExpression;
        var AssignmentExpression = Compiler.AST.AssignmentExpression;
        var ExpressionStatement = Compiler.AST.ExpressionStatement;
        var ReturnStatement = Compiler.AST.ReturnStatement;

        var ConditionalExpression = Compiler.AST.ConditionalExpression;
        var ObjectExpression = Compiler.AST.ObjectExpression;
        var ArrayExpression = Compiler.AST.ArrayExpression;
        var UnaryExpression = Compiler.AST.UnaryExpression;
        var NewExpression = Compiler.AST.NewExpression;
        var Property = Compiler.AST.Property;
        var BlockStatement = Compiler.AST.BlockStatement;
        var ThisExpression = Compiler.AST.ThisExpression;
        var ThrowStatement = Compiler.AST.ThrowStatement;
        var IfStatement = Compiler.AST.IfStatement;
        var WhileStatement = Compiler.AST.WhileStatement;
        var BreakStatement = Compiler.AST.BreakStatement;
        var ContinueStatement = Compiler.AST.ContinueStatement;
        var SwitchStatement = Compiler.AST.SwitchStatement;
        var SwitchCase = Compiler.AST.SwitchCase;

        var Start = Compiler.IR.Start;

        var Variable = Compiler.IR.Variable;
        var Constant = Compiler.IR.Constant;
        var Operator = Compiler.IR.Operator;

        var Looper = Shumway.AVM2.Compiler.Looper;
        var Control = Looper.Control;

        var last = Shumway.ArrayUtilities.last;

        Control.Break.prototype.compile = function (cx) {
          return cx.compileBreak(this);
        };

        Control.Continue.prototype.compile = function (cx) {
          return cx.compileContinue(this);
        };

        Control.Exit.prototype.compile = function (cx) {
          return cx.compileExit(this);
        };

        Control.LabelSwitch.prototype.compile = function (cx) {
          return cx.compileLabelSwitch(this);
        };

        Control.Seq.prototype.compile = function (cx) {
          return cx.compileSequence(this);
        };

        Control.Loop.prototype.compile = function (cx) {
          return cx.compileLoop(this);
        };

        Control.Switch.prototype.compile = function (cx) {
          return cx.compileSwitch(this);
        };

        Control.If.prototype.compile = function (cx) {
          return cx.compileIf(this);
        };

        Control.Try.prototype.compile = function (cx) {
          notImplemented("try");
          return null;
        };

        var F = new Identifier("$F");
        var C = new Identifier("$C");

        function isLazyConstant(value) {
          return value instanceof Shumway.AVM2.Runtime.LazyInitializer;
        }

        function constant(value, cx) {
          if (typeof value === "string" || value === null || value === true || value === false) {
            return new Literal(value);
          } else if (value === undefined) {
            return new Identifier("undefined");
          } else if (typeof value === "object" || typeof value === "function") {
            if (isLazyConstant(value)) {
              return call(property(F, "C"), [new Literal(cx.useConstant(value))]);
            } else {
              return new MemberExpression(C, new Literal(cx.useConstant(value)), true);
            }
          } else if (typeof value === "number" && isNaN(value)) {
            return new Identifier("NaN");
          } else if (value === Infinity) {
            return new Identifier("Infinity");
          } else if (value === -Infinity) {
            return new UnaryExpression("-", true, new Identifier("Infinity"));
          } else if (typeof value === "number" && (1 / value) < 0) {
            return new UnaryExpression("-", true, new Literal(Math.abs(value)));
          } else if (typeof value === "number") {
            return new Literal(value);
          } else {
            unexpected("Cannot emit constant for value: " + value);
          }
        }

        function id(name) {
          release || assert(typeof name === "string");
          return new Identifier(name);
        }

        function isIdentifierStart(c) {
          return (c === '$') || (c === '_') || (c === '\\') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
        }

        function isIdentifierPart(c) {
          return (c === '$') || (c === '_') || (c === '\\') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || ((c >= '0') && (c <= '9'));
        }

        function isIdentifierName(s) {
          if (!isIdentifierStart(s[0])) {
            return false;
          }
          for (var i = 1; i < s.length; i++) {
            if (!isIdentifierPart(s[i])) {
              return false;
            }
          }
          return true;
        }

        function property(obj) {
          var args = [];
          for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
          }
          for (var i = 0; i < args.length; i++) {
            var x = args[i];
            if (typeof x === "string") {
              if (isIdentifierName(x)) {
                obj = new MemberExpression(obj, new Identifier(x), false);
              } else {
                obj = new MemberExpression(obj, new Literal(x), true);
              }
            } else if (x instanceof Literal && isIdentifierName(x.value)) {
              obj = new MemberExpression(obj, new Identifier(x.value), false);
            } else {
              obj = new MemberExpression(obj, x, true);
            }
          }
          return obj;
        }

        function call(callee, args) {
          release || assert(args instanceof Array);
          release || args.forEach(function (x) {
            release || assert(!(x instanceof Array));
            release || assert(x !== undefined);
          });
          return new CallExpression(callee, args);
        }

        function callAsCall(callee, object, args) {
          return call(property(callee, "asCall"), [object].concat(args));
        }

        function callCall(callee, object, args) {
          return call(property(callee, "call"), [object].concat(args));
        }

        function assignment(left, right) {
          release || assert(left && right);
          return new AssignmentExpression("=", left, right);
        }

        function variableDeclaration(declarations) {
          return new VariableDeclaration(declarations, "var");
        }

        function negate(node) {
          if (node instanceof Constant) {
            if (node.value === true || node.value === false) {
              return constant(!node.value);
            }
          } else if (node instanceof Identifier) {
            return new UnaryExpression(Operator.FALSE.name, true, node);
          }
          release || assert(node instanceof BinaryExpression || node instanceof UnaryExpression, node);
          var left = node instanceof BinaryExpression ? node.left : node.argument;
          var right = node.right;
          var operator = Operator.fromName(node.operator);
          if (operator === Operator.EQ && right instanceof Literal && right.value === false) {
            return left;
          }
          if (operator === Operator.FALSE) {
            return left;
          }
          if (operator.not) {
            if (node instanceof BinaryExpression) {
              return new BinaryExpression(operator.not.name, left, right);
            } else {
              return new UnaryExpression(operator.not.name, true, left);
            }
          }
          return new UnaryExpression(Operator.FALSE.name, true, node);
        }

        var Context = (function () {
          function Context() {
            this.label = new Variable("$L");
            this.variables = [];
            this.constants = [];
            this.parameters = [];
          }
          Context.prototype.useConstant = function (constant) {
            return pushUnique(this.constants, constant);
          };

          Context.prototype.useVariable = function (variable) {
            release || assert(variable);
            return pushUnique(this.variables, variable);
          };

          Context.prototype.useParameter = function (parameter) {
            return this.parameters[parameter.index] = parameter;
          };

          Context.prototype.compileLabelBody = function (node) {
            var body = [];
            if (node.label !== undefined) {
              this.useVariable(this.label);
              body.push(new ExpressionStatement(assignment(id(this.label.name), new Literal(node.label))));
            }
            return body;
          };

          Context.prototype.compileBreak = function (node) {
            var body = this.compileLabelBody(node);
            body.push(new BreakStatement(null));
            return new BlockStatement(body);
          };

          Context.prototype.compileContinue = function (node) {
            var body = this.compileLabelBody(node);
            body.push(new ContinueStatement(null));
            return new BlockStatement(body);
          };

          Context.prototype.compileExit = function (node) {
            return new BlockStatement(this.compileLabelBody(node));
          };

          Context.prototype.compileIf = function (node) {
            var cr = node.cond.compile(this);
            var tr = null, er = null;
            if (node.then) {
              tr = node.then.compile(this);
            }
            if (node.else) {
              er = node.else.compile(this);
            }
            var condition = compileValue(cr.end.predicate, this);
            condition = node.negated ? negate(condition) : condition;
            cr.body.push(new IfStatement(condition, tr || new BlockStatement([]), er || null));
            return cr;
          };

          Context.prototype.compileSwitch = function (node) {
            var dr = node.determinant.compile(this);
            var cases = [];
            node.cases.forEach(function (x) {
              var br;
              if (x.body) {
                br = x.body.compile(this);
              }
              var test = typeof x.index === "number" ? new Literal(x.index) : undefined;
              cases.push(new SwitchCase(test, br ? [br] : []));
            }, this);
            var determinant = compileValue(dr.end.determinant, this);
            dr.body.push(new SwitchStatement(determinant, cases, false));
            return dr;
          };

          Context.prototype.compileLabelSwitch = function (node) {
            var statement = null;
            var labelName = id(this.label.name);

            function compileLabelTest(labelID) {
              release || assert(typeof labelID === "number");
              return new BinaryExpression("===", labelName, new Literal(labelID));
            }

            for (var i = node.cases.length - 1; i >= 0; i--) {
              var c = node.cases[i];
              var labels = c.labels;

              var labelTest = compileLabelTest(labels[0]);

              for (var j = 1; j < labels.length; j++) {
                labelTest = new BinaryExpression("||", labelTest, compileLabelTest(labels[j]));
              }

              statement = new IfStatement(labelTest, c.body ? c.body.compile(this) : new BlockStatement([]), statement);
            }
            return statement;
          };

          Context.prototype.compileLoop = function (node) {
            var br = node.body.compile(this);
            return new WhileStatement(constant(true), br);
          };

          Context.prototype.compileSequence = function (node) {
            var cx = this;
            var body = [];
            node.body.forEach(function (x) {
              var result = x.compile(cx);
              if (result instanceof BlockStatement) {
                body = body.concat(result.body);
              } else {
                body.push(result);
              }
            });
            return new BlockStatement(body);
          };

          Context.prototype.compileBlock = function (block) {
            var body = [];

            for (var i = 1; i < block.nodes.length - 1; i++) {
              var node = block.nodes[i];
              var statement;
              var to;
              var from;

              if (node instanceof Compiler.IR.Throw) {
                statement = compileValue(node, this, true);
              } else {
                if (node instanceof Compiler.IR.Move) {
                  to = id(node.to.name);
                  this.useVariable(node.to);
                  from = compileValue(node.from, this);
                } else {
                  if (node.variable) {
                    to = id(node.variable.name);
                    this.useVariable(node.variable);
                  } else {
                    to = null;
                  }
                  from = compileValue(node, this, true);
                }
                if (to) {
                  statement = new ExpressionStatement(assignment(to, from));
                } else {
                  statement = new ExpressionStatement(from);
                }
              }
              body.push(statement);
            }
            var end = last(block.nodes);
            if (end instanceof Compiler.IR.Stop) {
              body.push(new ReturnStatement(compileValue(end.argument, this)));
            }
            var result = new BlockStatement(body);
            result.end = last(block.nodes);
            release || assert(result.end instanceof Compiler.IR.End);

            return result;
          };
          return Context;
        })();
        Backend.Context = Context;

        function compileValue(value, cx, noVariable) {
          release || assert(value);
          release || assert(value.compile, "Implement |compile| for " + value + " (" + value.nodeName + ")");
          release || assert(cx instanceof Context);
          release || assert(!isArray(value));
          if (noVariable || !value.variable) {
            var node = value.compile(cx);
            return node;
          }
          release || assert(value.variable, "Value has no variable: " + value);
          return id(value.variable.name);
        }

        function compileMultiname(name, cx) {
          return [
            compileValue(name.namespaces, cx),
            compileValue(name.name, cx),
            constant(name.flags)
          ];
        }

        function isArray(array) {
          return array instanceof Array;
        }

        function compileValues(values, cx) {
          release || assert(isArray(values));
          return values.map(function (value) {
            return compileValue(value, cx);
          });
        }

        Compiler.IR.Parameter.prototype.compile = function (cx) {
          cx.useParameter(this);
          return id(this.name);
        };

        Compiler.IR.Constant.prototype.compile = function (cx) {
          return constant(this.value, cx);
        };

        Compiler.IR.Variable.prototype.compile = function (cx) {
          return id(this.name);
        };

        Compiler.IR.Phi.prototype.compile = function (cx) {
          release || assert(this.variable);
          return compileValue(this.variable, cx);
        };

        Compiler.IR.ASScope.prototype.compile = function (cx) {
          var parent = compileValue(this.parent, cx);
          var object = compileValue(this.object, cx);
          var isWith = new Literal(this.isWith);
          return new NewExpression(id("Scope"), [parent, object, isWith]);
        };

        Compiler.IR.ASFindProperty.prototype.compile = function (cx) {
          var scope = compileValue(this.scope, cx);
          var name = compileMultiname(this.name, cx);
          var methodInfo = compileValue(this.methodInfo, cx);
          var strict = new Literal(this.strict);
          return call(property(scope, "findScopeProperty"), name.concat([methodInfo, strict]));
        };

        Compiler.IR.ASGetProperty.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          if (this.flags & 1 /* NumericProperty */) {
            release || assert(!(this.flags & 8 /* IS_METHOD */));
            return call(property(object, "asGetNumericProperty"), [compileValue(this.name.name, cx)]);
          } else if (this.flags & 2 /* RESOLVED */) {
            return call(property(object, "asGetResolvedStringProperty"), [compileValue(this.name, cx)]);
          }
          var name = compileMultiname(this.name, cx);
          var isMethod = new Literal(this.flags & 8 /* IS_METHOD */);
          return call(property(object, "asGetProperty"), name.concat(isMethod));
        };

        Compiler.IR.ASGetSuper.prototype.compile = function (cx) {
          var scope = compileValue(this.scope, cx);
          var object = compileValue(this.object, cx);
          var name = compileMultiname(this.name, cx);
          return call(property(object, "asGetSuper"), [scope].concat(name));
        };

        Compiler.IR.Latch.prototype.compile = function (cx) {
          return new ConditionalExpression(compileValue(this.condition, cx), compileValue(this.left, cx), compileValue(this.right, cx));
        };

        Compiler.IR.Unary.prototype.compile = function (cx) {
          return new UnaryExpression(this.operator.name, true, compileValue(this.argument, cx));
        };

        Compiler.IR.Copy.prototype.compile = function (cx) {
          return compileValue(this.argument, cx);
        };

        Compiler.IR.Binary.prototype.compile = function (cx) {
          var left = compileValue(this.left, cx);
          var right = compileValue(this.right, cx);
          if (this.operator === Compiler.IR.Operator.AS_ADD) {
            return call(id("asAdd"), [left, right]);
          }
          return new BinaryExpression(this.operator.name, left, right);
        };

        Compiler.IR.CallProperty.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var name = compileValue(this.name, cx);
          var callee = property(object, name);
          var args = this.args.map(function (arg) {
            return compileValue(arg, cx);
          });
          if (this.flags & 16 /* AS_CALL */) {
            return callAsCall(callee, object, args);
          } else if (this.flags & 4 /* PRISTINE */) {
            return call(callee, args);
          } else {
            return callCall(callee, object, args);
          }
        };

        Compiler.IR.ASCallProperty.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var args = this.args.map(function (arg) {
            return compileValue(arg, cx);
          });
          if (this.flags & 2 /* RESOLVED */) {
            return call(property(object, "asCallResolvedStringProperty"), [compileValue(this.name, cx), new Literal(this.isLex), new ArrayExpression(args)]);
          }
          var name = compileMultiname(this.name, cx);
          return call(property(object, "asCallProperty"), name.concat([new Literal(this.isLex), new ArrayExpression(args)]));
        };

        Compiler.IR.ASCallSuper.prototype.compile = function (cx) {
          var scope = compileValue(this.scope, cx);
          var object = compileValue(this.object, cx);
          var args = this.args.map(function (arg) {
            return compileValue(arg, cx);
          });
          var name = compileMultiname(this.name, cx);
          return call(property(object, "asCallSuper"), [scope].concat(name).concat(new ArrayExpression(args)));
        };

        Compiler.IR.Call.prototype.compile = function (cx) {
          var args = this.args.map(function (arg) {
            return compileValue(arg, cx);
          });
          var callee = compileValue(this.callee, cx);
          var object;
          if (this.object) {
            object = compileValue(this.object, cx);
          } else {
            object = new Literal(null);
          }
          if (this.flags & 16 /* AS_CALL */) {
            return callAsCall(callee, object, args);
          } else if (false && this.pristine && (this.callee instanceof Compiler.IR.GetProperty && this.callee.object === this.object) || this.object === null) {
            return call(callee, args);
          } else {
            return callCall(callee, object, args);
          }
        };

        Compiler.IR.ASNew.prototype.compile = function (cx) {
          var args = this.args.map(function (arg) {
            return compileValue(arg, cx);
          });
          var callee = compileValue(this.callee, cx);
          callee = property(callee, "instanceConstructor");
          return new NewExpression(callee, args);
        };

        Compiler.IR.This.prototype.compile = function (cx) {
          return new ThisExpression();
        };

        Compiler.IR.Throw.prototype.compile = function (cx) {
          var argument = compileValue(this.argument, cx);
          return new ThrowStatement(argument);
        };

        Compiler.IR.Arguments.prototype.compile = function (cx) {
          return id("arguments");
        };

        Compiler.IR.ASGlobal.prototype.compile = function (cx) {
          var scope = compileValue(this.scope, cx);
          return property(scope, "global", "object");
        };

        Compiler.IR.ASSetProperty.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var value = compileValue(this.value, cx);
          if (this.flags & 1 /* NumericProperty */) {
            return call(property(object, "asSetNumericProperty"), [compileValue(this.name.name, cx), value]);
          }
          var name = compileMultiname(this.name, cx);
          return call(property(object, "asSetProperty"), name.concat(value));
        };

        Compiler.IR.ASSetSuper.prototype.compile = function (cx) {
          var scope = compileValue(this.scope, cx);
          var object = compileValue(this.object, cx);
          var name = compileMultiname(this.name, cx);
          var value = compileValue(this.value, cx);
          return call(property(object, "asSetSuper"), [scope].concat(name).concat([value]));
        };

        Compiler.IR.ASDeleteProperty.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var name = compileMultiname(this.name, cx);
          return call(property(object, "asDeleteProperty"), name);
        };

        Compiler.IR.ASHasProperty.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var name = compileMultiname(this.name, cx);
          return call(property(object, "asHasProperty"), name);
        };

        Compiler.IR.GlobalProperty.prototype.compile = function (cx) {
          return id(this.name);
        };

        Compiler.IR.GetProperty.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var name = compileValue(this.name, cx);
          return property(object, name);
        };

        Compiler.IR.SetProperty.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var name = compileValue(this.name, cx);
          var value = compileValue(this.value, cx);
          return assignment(property(object, name), value);
        };

        Compiler.IR.ASGetDescendants.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var name = compileValue(this.name, cx);
          return call(id("getDescendants"), [object, name]);
        };

        Compiler.IR.ASSetSlot.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var name = compileValue(this.name, cx);
          var value = compileValue(this.value, cx);
          return (call(id("asSetSlot"), [object, name, value]));
        };

        Compiler.IR.ASGetSlot.prototype.compile = function (cx) {
          var object = compileValue(this.object, cx);
          var name = compileValue(this.name, cx);
          return (call(id("asGetSlot"), [object, name]));
        };

        Compiler.IR.Projection.prototype.compile = function (cx) {
          release || assert(this.type === 4 /* SCOPE */);
          release || assert(this.argument instanceof Start);
          return compileValue(this.argument.scope, cx);
        };

        Compiler.IR.NewArray.prototype.compile = function (cx) {
          return new ArrayExpression(compileValues(this.elements, cx));
        };

        Compiler.IR.NewObject.prototype.compile = function (cx) {
          var properties = this.properties.map(function (property) {
            var key = compileValue(property.key, cx);
            var value = compileValue(property.value, cx);
            return new Property(key, value, "init");
          });
          return new ObjectExpression(properties);
        };

        Compiler.IR.ASNewActivation.prototype.compile = function (cx) {
          var methodInfo = compileValue(this.methodInfo, cx);
          return call(id("asCreateActivation"), [methodInfo]);
        };

        Compiler.IR.ASNewHasNext2.prototype.compile = function (cx) {
          return new NewExpression(id("HasNext2Info"), []);
        };

        Compiler.IR.ASMultiname.prototype.compile = function (cx) {
          var namespaces = compileValue(this.namespaces, cx);
          var name = compileValue(this.name, cx);
          return call(id("createName"), [namespaces, name]);
        };

        Compiler.IR.Block.prototype.compile = function (cx) {
          return cx.compileBlock(this);
        };

        function generateSource(node) {
          return node.toSource();
        }

        var Compilation = (function () {
          function Compilation(parameters, body, constants) {
            this.parameters = parameters;
            this.body = body;
            this.constants = constants;
          }
          Compilation.prototype.C = function (index) {
            var value = this.constants[index];

            if (value instanceof Shumway.AVM2.Runtime.LazyInitializer) {
              this.constants[index] = value.resolve();
            }
            return this.constants[index];
          };
          Compilation.id = 0;
          return Compilation;
        })();
        Backend.Compilation = Compilation;

        function generate(cfg) {
          AVM2.enterTimeline("Looper");
          var root = Looper.analyze(cfg);
          AVM2.leaveTimeline();

          var writer = new Shumway.IndentingWriter();

          var cx = new Context();
          AVM2.enterTimeline("Construct AST");
          var code = root.compile(cx);
          AVM2.leaveTimeline();

          var parameters = [];
          for (var i = 0; i < cx.parameters.length; i++) {
            var name = cx.parameters[i] ? cx.parameters[i].name : "_" + i;
            parameters.push(id(name));
          }
          var compilationId = Compilation.id++;
          var compilationGlobalPropertyName = "$$F" + compilationId;
          if (cx.constants.length) {
            var compilation = new Identifier(compilationGlobalPropertyName);
            var constants = new MemberExpression(compilation, new Identifier("constants"), false);
            code.body.unshift(variableDeclaration([
              new VariableDeclarator(id("$F"), compilation),
              new VariableDeclarator(id("$C"), constants)
            ]));
          }
          if (cx.variables.length) {
            AVM2.countTimeline("Backend: Locals", cx.variables.length);
            var variables = variableDeclaration(cx.variables.map(function (variable) {
              return new VariableDeclarator(id(variable.name));
            }));
            code.body.unshift(variables);
          }

          AVM2.enterTimeline("Serialize AST");
          var source = generateSource(code);
          AVM2.leaveTimeline();

          return jsGlobal[compilationGlobalPropertyName] = new Compilation(parameters.map(function (p) {
            return p.name;
          }), source, cx.constants);
        }
        Backend.generate = generate;
      })(Compiler.Backend || (Compiler.Backend = {}));
      var Backend = Compiler.Backend;
    })(AVM2.Compiler || (AVM2.Compiler = {}));
    var Compiler = AVM2.Compiler;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (_AVM2) {
    (function (Runtime) {
      var AbcFile = Shumway.AVM2.ABC.AbcFile;

      var Multiname = Shumway.AVM2.ABC.Multiname;

      var Callback = Shumway.Callback;

      var counter = Shumway.Metrics.Counter.instance;
      var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
      var assert = Shumway.Debug.assert;
      var IndentingWriter = Shumway.IndentingWriter;

      function createNewCompartment() {
        return newGlobal('new-compartment');
      }

      function executeScript(script) {
        _AVM2.enterTimeline("executeScript", { name: script.name });
        var abc = script.abc;
        release || assert(!script.executing && !script.executed);
        var global = new Runtime.Global(script);
        if (abc.applicationDomain.allowNatives) {
          global[Multiname.getPublicQualifiedName("unsafeJSNative")] = Shumway.AVM2.AS.getNative;
        }
        script.executing = true;
        var scope = new Runtime.Scope(null, script.global);

        Runtime.createFunction(script.init, scope, false).call(script.global, false);
        script.executed = true;
        _AVM2.leaveTimeline();
      }
      Runtime.executeScript = executeScript;

      function ensureScriptIsExecuted(script, reason) {
        if (typeof reason === "undefined") { reason = ""; }
        if (!script.executed && !script.executing) {
          if (Shumway.AVM2.Runtime.traceExecution.value >= 2) {
            log("Executing Script For: " + reason);
          }
          executeScript(script);
        }
      }
      Runtime.ensureScriptIsExecuted = ensureScriptIsExecuted;

      (function (Glue) {
        Glue[Glue["PUBLIC_PROPERTIES"] = 0x1] = "PUBLIC_PROPERTIES";
        Glue[Glue["PUBLIC_METHODS"] = 0x2] = "PUBLIC_METHODS";
        Glue[Glue["ALL"] = 1 /* PUBLIC_PROPERTIES */ | 2 /* PUBLIC_METHODS */] = "ALL";
      })(Runtime.Glue || (Runtime.Glue = {}));
      var Glue = Runtime.Glue;

      Runtime.playerglobalLoadedPromise;
      Runtime.playerglobal;

      function grabAbc(abcName) {
        var entry = Runtime.playerglobal.scripts[abcName];
        if (!entry) {
          return null;
        }
        var offset = entry.offset;
        var length = entry.length;
        return new AbcFile(new Uint8Array(Runtime.playerglobal.abcs, offset, length), abcName);
      }

      function findDefiningAbc(mn) {
        if (!Runtime.playerglobal) {
          return null;
        }
        for (var i = 0; i < mn.namespaces.length; i++) {
          var name = mn.namespaces[i].uri + ":" + mn.name;
          var abcName = Runtime.playerglobal.map[name];
          if (abcName) {
            break;
          }
        }
        if (abcName) {
          return grabAbc(abcName);
        }
        return null;
      }

      function promiseFile(path, responseType) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', path);
          xhr.responseType = responseType;
          xhr.onload = function () {
            var response = xhr.response;
            if (response) {
              if (responseType === 'json' && xhr.responseType !== 'json') {
                response = JSON.parse(response);
              }
              resolve(response);
            } else {
              reject('Unable to load ' + path + ': ' + xhr.statusText);
            }
          };
          xhr.send();
        });
      }

      var AVM2 = (function () {
        function AVM2(sysMode, appMode, loadAVM1) {
          this.systemDomain = new ApplicationDomain(this, null, sysMode, true);
          this.applicationDomain = new ApplicationDomain(this, this.systemDomain, appMode, false);
          this.findDefiningAbc = findDefiningAbc;

          this._loadAVM1 = loadAVM1;
          this._loadAVM1Promise = null;

          this.exception = { value: undefined };
          this.exceptions = [];

          this.globals = createEmptyObject();
        }
        AVM2.initialize = function (sysMode, appMode, loadAVM1) {
          if (typeof loadAVM1 === "undefined") { loadAVM1 = null; }
          release || assert(!AVM2.instance);
          AVM2.instance = new AVM2(sysMode, appMode, loadAVM1);
        };

        AVM2.currentAbc = function () {
          var caller = arguments.callee;
          var maxDepth = 20;
          var abc = null;
          for (var i = 0; i < maxDepth && caller; i++) {
            var mi = caller.methodInfo;
            if (mi) {
              abc = mi.abc;
              break;
            }
            caller = caller.caller;
          }
          return abc;
        };

        AVM2.currentDomain = function () {
          var abc = AVM2.currentAbc();

          if (abc === null) {
            return AVM2.instance.systemDomain;
          }
          release || assert(abc && abc.applicationDomain, "No domain environment was found on the stack, increase STACK_DEPTH or " + "make sure that a compiled / interpreted function is on the call stack.");
          return abc.applicationDomain;
        };

        AVM2.isPlayerglobalLoaded = function () {
          return !!Runtime.playerglobal;
        };

        AVM2.prototype.loadAVM1 = function () {
          var loadAVM1Callback = this._loadAVM1;
          release || assert(loadAVM1Callback);

          if (!this._loadAVM1Promise) {
            this._loadAVM1Promise = new Promise(function (resolve) {
              loadAVM1Callback(resolve);
            });
          }
          return this._loadAVM1Promise;
        };

        AVM2.loadPlayerglobal = function (abcsPath, catalogPath) {
          if (Runtime.playerglobalLoadedPromise) {
            return Promise.reject('Playerglobal is already loaded');
          }
          Runtime.playerglobalLoadedPromise = Promise.all([promiseFile(abcsPath, 'arraybuffer'), promiseFile(catalogPath, 'json')]).then(function (result) {
            Runtime.playerglobal = {
              abcs: result[0],
              map: Object.create(null),
              scripts: Object.create(null)
            };

            var catalog = result[1];
            for (var i = 0; i < catalog.length; i++) {
              var abc = catalog[i];
              Runtime.playerglobal.scripts[abc.name] = abc;
              if (typeof abc.defs === 'string') {
                Runtime.playerglobal.map[abc.defs] = abc.name;
              } else {
                for (var j = 0; j < abc.defs.length; j++) {
                  var def = abc.defs[j];
                  Runtime.playerglobal.map[def] = abc.name;
                }
              }
            }
          }, function (e) {
            console.error(e);
          });
          return Runtime.playerglobalLoadedPromise;
        };

        AVM2.prototype.notifyConstruct = function (instanceConstructor, args) {
        };

        AVM2.getStackTrace = function () {
          Shumway.Debug.notImplemented("getStackTrace");
          return;
        };
        return AVM2;
      })();
      Runtime.AVM2 = AVM2;

      var ApplicationDomain = (function () {
        function ApplicationDomain(vm, base, mode, allowNatives) {
          release || assert(vm instanceof AVM2);
          release || assert(Shumway.isNullOrUndefined(base) || base instanceof ApplicationDomain);

          this.vm = vm;

          this.abcs = [];

          this.loadedAbcs = {};

          this.loadedClasses = [];

          this.classCache = createEmptyObject();

          this.scriptCache = createEmptyObject();

          this.classInfoCache = createEmptyObject();

          this.base = base;

          this.allowNatives = allowNatives;

          this.mode = mode;

          this.onMessage = new Callback();

          if (base) {
            this.system = base.system;
          } else {
            this.system = this;
          }
        }
        ApplicationDomain.passthroughCallable = function (f) {
          return {
            call: function ($this) {
              Array.prototype.shift.call(arguments);
              return f.asApply($this, arguments);
            },
            apply: function ($this, args) {
              return f.asApply($this, args);
            }
          };
        };

        ApplicationDomain.coerceCallable = function (type) {
          return {
            call: function ($this, value) {
              return Runtime.asCoerce(type, value);
            },
            apply: function ($this, args) {
              return Runtime.asCoerce(type, args[0]);
            }
          };
        };

        ApplicationDomain.prototype.getType = function (multiname) {
          return this.getProperty(multiname, true, true);
        };

        ApplicationDomain.prototype.getProperty = function (multiname, strict, execute) {
          var resolved = this.findDefiningScript(multiname, execute);
          if (resolved) {
            if (!resolved.script.executing) {
              return undefined;
            }
            return resolved.script.global[Multiname.getQualifiedName(resolved.trait.name)];
          }
          if (strict) {
            return Shumway.Debug.unexpected("Cannot find property " + multiname);
          }
          return undefined;
        };

        ApplicationDomain.prototype.getClass = function (simpleName, strict) {
          if (typeof strict === "undefined") { strict = true; }
          var cache = this.classCache;
          var cls = cache[simpleName];
          if (!cls) {
            cls = cache[simpleName] = this.getProperty(Multiname.fromSimpleName(simpleName), strict, true);
          }
          release || (cls && assert(cls instanceof Shumway.AVM2.AS.ASClass));
          return cls;
        };

        ApplicationDomain.prototype.findDomainProperty = function (multiname, strict, execute) {
          if (Shumway.AVM2.Runtime.traceDomain.value) {
            log("ApplicationDomain.findDomainProperty: " + multiname);
          }
          var resolved = this.findDefiningScript(multiname, execute);
          if (resolved) {
            return resolved.script.global;
          }
          if (strict) {
            return Shumway.Debug.unexpected("Cannot find property " + multiname);
          } else {
            return undefined;
          }
          return undefined;
        };

        ApplicationDomain.prototype.findClassInfo = function (mn) {
          var originalQn;
          if (Multiname.isQName(mn)) {
            originalQn = Multiname.getQualifiedName(mn);
            var ci = this.classInfoCache[originalQn];
            if (ci) {
              return ci;
            }
          } else {
            var ci = this.classInfoCache[mn.runtimeId];
            if (ci) {
              return ci;
            }
          }
          if (this.base) {
            ci = this.base.findClassInfo(mn);
            if (ci) {
              return ci;
            }
          }

          var abcs = this.abcs;
          for (var i = 0; i < abcs.length; i++) {
            var abc = abcs[i];
            var scripts = abc.scripts;
            for (var j = 0; j < scripts.length; j++) {
              var script = scripts[j];
              var traits = script.traits;
              for (var k = 0; k < traits.length; k++) {
                var trait = traits[k];
                if (trait.isClass()) {
                  var traitName = Multiname.getQualifiedName(trait.name);

                  if (originalQn) {
                    if (traitName === originalQn) {
                      return (this.classInfoCache[originalQn] = trait.classInfo);
                    }
                  } else {
                    for (var m = 0, n = mn.namespaces.length; m < n; m++) {
                      var qn = mn.getQName(m);
                      if (traitName === Multiname.getQualifiedName(qn)) {
                        return (this.classInfoCache[qn] = trait.classInfo);
                      }
                    }
                  }
                }
              }
            }
          }

          if (!this.base && this.vm.findDefiningAbc) {
            var abc = this.vm.findDefiningAbc(mn);
            if (abc !== null && !this.loadedAbcs[abc.name]) {
              this.loadedAbcs[abc.name] = true;
              this.loadAbc(abc);
              return this.findClassInfo(mn);
            }
          }
          return undefined;
        };

        ApplicationDomain.prototype.findDefiningScript = function (mn, execute) {
          var resolved = this.scriptCache[mn.runtimeId];
          if (resolved && (resolved.script.executed || !execute)) {
            return resolved;
          }

          if (this.base) {
            resolved = this.base.findDefiningScript(mn, execute);
            if (resolved) {
              return resolved;
            }
          }

          _AVM2.countTimeline("ApplicationDomain: findDefiningScript");

          var abcs = this.abcs;
          for (var i = 0; i < abcs.length; i++) {
            var abc = abcs[i];
            var scripts = abc.scripts;
            for (var j = 0; j < scripts.length; j++) {
              var script = scripts[j];
              var traits = script.traits;
              if (mn instanceof Multiname) {
                for (var k = 0; k < traits.length; k++) {
                  var trait = traits[k];
                  if (mn.hasQName(trait.name)) {
                    if (execute) {
                      ensureScriptIsExecuted(script, String(trait.name));
                    }
                    return (this.scriptCache[mn.runtimeId] = { script: script, trait: trait });
                  }
                }
              } else {
                Shumway.Debug.unexpected();
              }
            }
          }

          if (!this.base && this.vm.findDefiningAbc) {
            var abc = this.vm.findDefiningAbc(mn);
            if (abc !== null && !this.loadedAbcs[abc.name]) {
              this.loadedAbcs[abc.name] = true;
              this.loadAbc(abc);
              return this.findDefiningScript(mn, execute);
            }
          }

          return undefined;
        };

        ApplicationDomain.prototype.compileAbc = function (abc, writer) {
          Shumway.AVM2.Compiler.compileAbc(abc, writer);
        };

        ApplicationDomain.prototype.executeAbc = function (abc) {
          this.loadAbc(abc);
          executeScript(abc.lastScript);
        };

        ApplicationDomain.prototype.loadAbc = function (abc) {
          if (Shumway.AVM2.Runtime.traceExecution.value) {
            log("Loading: " + abc.name);
          }
          abc.applicationDomain = this;
          Runtime.GlobalMultinameResolver.loadAbc(abc);
          this.abcs.push(abc);

          if (!this.base) {
            _AVM2.AS.initialize(this);
            Shumway.AVM2.Verifier.Type.initializeTypes(this);
          }
        };

        ApplicationDomain.prototype.broadcastMessage = function (type, message, origin) {
          try  {
            this.onMessage.notify1(type, {
              data: message,
              origin: origin,
              source: this
            });
          } catch (e) {
            var avm2 = AVM2.instance;
            avm2.exceptions.push({
              source: type, message: e.message,
              stack: e.stack });
            throw e;
          }
        };

        ApplicationDomain.prototype.traceLoadedClasses = function (lastOnly) {
          var writer = new IndentingWriter();
          lastOnly || writer.enter("Loaded Classes And Interfaces");
          var classes = lastOnly ? [Shumway.ArrayUtilities.last(this.loadedClasses)] : this.loadedClasses;
          classes.forEach(function (cls) {
            if (cls !== Shumway.AVM2.AS.ASClass) {
              cls.trace(writer);
            }
          });
          lastOnly || writer.leave("");
        };
        return ApplicationDomain;
      })();
      Runtime.ApplicationDomain = ApplicationDomain;

      var SecurityDomain = (function () {
        function SecurityDomain(compartmentPath) {
          this.compartment = createNewCompartment();
          this.compartment.homePath = homePath;
          this.compartment.release = release;
          this.compartment.eval(snarf(compartmentPath));
        }
        SecurityDomain.prototype.initializeShell = function (sysMode, appMode) {
          var compartment = this.compartment;
          compartment.AVM2.initialize(sysMode, appMode);
          compartment.AVM2.instance.systemDomain.executeAbc(compartment.grabAbc(homePath + "src/avm2/generated/builtin/builtin.abc"));
          compartment.AVM2.instance.systemDomain.executeAbc(compartment.grabAbc(homePath + "src/avm2/generated/shell/shell.abc"));

          this.systemDomain = compartment.AVM2.instance.systemDomain;
          this.applicationDomain = compartment.AVM2.instance.applicationDomain;
        };
        return SecurityDomain;
      })();
      Runtime.SecurityDomain = SecurityDomain;
    })(_AVM2.Runtime || (_AVM2.Runtime = {}));
    var Runtime = _AVM2.Runtime;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));

var Glue = Shumway.AVM2.Runtime.Glue;
var ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
var AVM2 = Shumway.AVM2.Runtime.AVM2;
var EXECUTION_MODE = Shumway.AVM2.Runtime.ExecutionMode;
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Runtime) {
      var Multiname = Shumway.AVM2.ABC.Multiname;

      var ClassInfo = Shumway.AVM2.ABC.ClassInfo;
      var InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;

      var assert = Shumway.Debug.assert;

      var defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;

      var bindSafely = Shumway.FunctionUtilities.bindSafely;

      var counter = Shumway.Metrics.Counter.instance;

      var vmNextTrampolineId = 1;
      var vmNextMemoizerId = 1;

      function getMethodOverrideKey(methodInfo) {
        var key;
        if (methodInfo.holder instanceof ClassInfo) {
          key = "static " + methodInfo.holder.instanceInfo.name.getOriginalName() + "::" + methodInfo.name.getOriginalName();
        } else if (methodInfo.holder instanceof InstanceInfo) {
          key = methodInfo.holder.name.getOriginalName() + "::" + methodInfo.name.getOriginalName();
        } else {
          key = methodInfo.name.getOriginalName();
        }
        return key;
      }
      Runtime.getMethodOverrideKey = getMethodOverrideKey;

      function checkMethodOverrides(methodInfo) {
        if (methodInfo.name) {
          var key = getMethodOverrideKey(methodInfo);
          if (key in Runtime.VM_METHOD_OVERRIDES) {
            Shumway.Debug.warning("Overriding Method: " + key);
            return Runtime.VM_METHOD_OVERRIDES[key];
          }
        }
      }
      Runtime.checkMethodOverrides = checkMethodOverrides;

      

      function makeTrampoline(forward, parameterLength, description) {
        release || assert(forward && typeof forward === "function");
        return (function trampolineContext() {
          var target = null;

          var trampoline = function execute() {
            if (Shumway.AVM2.Runtime.traceExecution.value >= 3) {
              log("Trampolining");
            }
            AVM2.countTimeline("Executing Trampoline");
            Shumway.AVM2.Runtime.traceCallExecution.value > 1 && callWriter.writeLn("Trampoline: " + description);
            if (!target) {
              target = forward(trampoline);
              release || assert(target);
            }
            return target.asApply(this, arguments);
          };

          trampoline.trigger = function trigger() {
            AVM2.countTimeline("Triggering Trampoline");
            if (!target) {
              target = forward(trampoline);
              release || assert(target);
            }
          };
          trampoline.isTrampoline = true;
          trampoline.debugName = "Trampoline #" + vmNextTrampolineId++;

          defineReadOnlyProperty(trampoline, Runtime.VM_LENGTH, parameterLength);
          return trampoline;
        })();
      }
      Runtime.makeTrampoline = makeTrampoline;

      function makeMemoizer(qn, target) {
        function memoizer() {
          AVM2.countTimeline("Runtime: Memoizing");

          if (Shumway.AVM2.Runtime.traceExecution.value >= 3) {
            log("Memoizing: " + qn);
          }
          Shumway.AVM2.Runtime.traceCallExecution.value > 1 && callWriter.writeLn("Memoizing: " + qn);
          if (Runtime.isNativePrototype(this)) {
            AVM2.countTimeline("Runtime: Method Closures");
            return bindSafely(target.value, this);
          }
          if (isTrampoline(target.value)) {
            target.value.trigger();
          }
          release || assert(!isTrampoline(target.value), "We should avoid binding trampolines.");
          var mc = null;
          if (this instanceof Shumway.AVM2.AS.ASClass) {
            AVM2.countTimeline("Runtime: Static Method Closures");
            mc = bindSafely(target.value, this);
            defineReadOnlyProperty(this, qn, mc);
            return mc;
          }
          if (Object.prototype.hasOwnProperty.call(this, qn)) {
            var pd = Object.getOwnPropertyDescriptor(this, qn);
            if (pd.get) {
              AVM2.countTimeline("Runtime: Method Closures");
              return bindSafely(target.value, this);
            }
            AVM2.countTimeline("Runtime: Unpatched Memoizer");
            return this[qn];
          }
          mc = bindSafely(target.value, this);
          mc.methodInfo = target.value.methodInfo;
          defineReadOnlyProperty(mc, Multiname.getPublicQualifiedName("prototype"), null);
          defineReadOnlyProperty(this, qn, mc);
          return mc;
        }
        var m = memoizer;
        AVM2.countTimeline("Runtime: Memoizers");
        m.isMemoizer = true;
        m.debugName = "Memoizer #" + vmNextMemoizerId++;
        return m;
      }
      Runtime.makeMemoizer = makeMemoizer;

      function isTrampoline(fn) {
        release || assert(fn && typeof fn === "function");
        return fn.isTrampoline;
      }

      function isMemoizer(fn) {
        release || assert(fn && typeof fn === "function");
        return fn.isMemoizer;
      }
      Runtime.isMemoizer = isMemoizer;
    })(AVM2.Runtime || (AVM2.Runtime = {}));
    var Runtime = AVM2.Runtime;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    var Scope = Shumway.AVM2.Runtime.Scope;
    var asCoerceByMultiname = Shumway.AVM2.Runtime.asCoerceByMultiname;
    var asGetSlot = Shumway.AVM2.Runtime.asGetSlot;
    var asSetSlot = Shumway.AVM2.Runtime.asSetSlot;
    var asCoerce = Shumway.AVM2.Runtime.asCoerce;
    var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
    var asAsType = Shumway.AVM2.Runtime.asAsType;
    var asTypeOf = Shumway.AVM2.Runtime.asTypeOf;
    var asIsInstanceOf = Shumway.AVM2.Runtime.asIsInstanceOf;
    var asIsType = Shumway.AVM2.Runtime.asIsType;
    var applyType = Shumway.AVM2.Runtime.applyType;
    var createFunction = Shumway.AVM2.Runtime.createFunction;
    var createClass = Shumway.AVM2.Runtime.createClass;
    var getDescendants = Shumway.AVM2.Runtime.getDescendants;
    var checkFilter = Shumway.AVM2.Runtime.checkFilter;
    var asAdd = Shumway.AVM2.Runtime.asAdd;
    var translateError = Shumway.AVM2.Runtime.translateError;
    var asCreateActivation = Shumway.AVM2.Runtime.asCreateActivation;
    var sliceArguments = Shumway.AVM2.Runtime.sliceArguments;
    var boxValue = Shumway.ObjectUtilities.boxValue;
    var popManyInto = Shumway.ArrayUtilities.popManyInto;
    var construct = Shumway.AVM2.Runtime.construct;
    var Multiname = Shumway.AVM2.ABC.Multiname;
    var assert = Shumway.Debug.assert;
    var HasNext2Info = Shumway.AVM2.Runtime.HasNext2Info;

    var counter = Shumway.Metrics.Counter.instance;

    var ScopeStack = (function () {
      function ScopeStack(parent) {
        this.parent = parent;
        this.stack = [];
        this.isWith = [];
      }
      ScopeStack.prototype.push = function (object, isWith) {
        this.stack.push(object);
        this.isWith.push(!!isWith);
      };

      ScopeStack.prototype.get = function (index) {
        return this.stack[index];
      };

      ScopeStack.prototype.clear = function () {
        this.stack.length = 0;
        this.isWith.length = 0;
      };

      ScopeStack.prototype.pop = function () {
        this.isWith.pop();
        this.stack.pop();
      };

      ScopeStack.prototype.topScope = function () {
        if (!this.scopes) {
          this.scopes = [];
        }
        var parent = this.parent;
        for (var i = 0; i < this.stack.length; i++) {
          var object = this.stack[i], isWith = this.isWith[i], scope = this.scopes[i];
          if (!scope || scope.parent !== parent || scope.object !== object || scope.isWith !== isWith) {
            scope = this.scopes[i] = new Scope(parent, object, isWith);
          }
          parent = scope;
        }
        return parent;
      };
      return ScopeStack;
    })();

    function popNameInto(stack, mn, out) {
      out.flags = mn.flags;
      if (mn.isRuntimeName()) {
        out.name = stack.pop();
      } else {
        out.name = mn.name;
      }
      if (mn.isRuntimeNamespace()) {
        out.namespaces = [stack.pop()];
      } else {
        out.namespaces = mn.namespaces;
      }
    }

    var Interpreter = (function () {
      function Interpreter() {
      }
      Interpreter.interpretMethod = function ($this, method, savedScope, methodArgs) {
        release || assert(method.analysis);
        AVM2.countTimeline("Interpret Method");
        var abc = method.abc;
        var ints = abc.constantPool.ints;
        var uints = abc.constantPool.uints;
        var doubles = abc.constantPool.doubles;
        var strings = abc.constantPool.strings;
        var methods = abc.methods;
        var multinames = abc.constantPool.multinames;
        var domain = abc.applicationDomain;
        var exceptions = method.exceptions;

        var locals = [$this];
        var stack = [], scopeStack = new ScopeStack(savedScope);

        var parameterCount = method.parameters.length;
        var argCount = methodArgs.length;

        var value;
        for (var i = 0; i < parameterCount; i++) {
          var parameter = method.parameters[i];
          if (i < argCount) {
            value = methodArgs[i];
          } else {
            value = parameter.value;
          }
          if (parameter.type && !parameter.type.isAnyName()) {
            value = asCoerceByMultiname(method, parameter.type, value);
          }
          locals.push(value);
        }

        if (method.needsRest()) {
          locals.push(sliceArguments(methodArgs, parameterCount));
        } else if (method.needsArguments()) {
          locals.push(sliceArguments(methodArgs, 0));
        }

        var bytecodes = method.analysis.bytecodes;

        var object, index, multiname, result, a, b, args = [], mn = Multiname.TEMPORARY;
        var hasNext2Infos = [];
        interpretLabel:
        for (var pc = 0, end = bytecodes.length; pc < end;) {
          try  {
            var bc = bytecodes[pc];
            var op = bc.op;
            switch (op | 0) {
              case 3 /* throw */:
                throw stack.pop();
              case 4 /* getsuper */:
                popNameInto(stack, multinames[bc.index], mn);
                stack.push(stack.pop().asGetSuper(savedScope, mn.namespaces, mn.name, mn.flags));
                break;
              case 5 /* setsuper */:
                value = stack.pop();
                popNameInto(stack, multinames[bc.index], mn);
                stack.pop().asSetSuper(savedScope, mn.namespaces, mn.name, mn.flags, value);
                break;
              case 8 /* kill */:
                locals[bc.index] = undefined;
                break;
              case 12 /* ifnlt */:
                b = stack.pop();
                a = stack.pop();
                pc = !(a < b) ? bc.offset : pc + 1;
                continue;
              case 24 /* ifge */:
                b = stack.pop();
                a = stack.pop();
                pc = a >= b ? bc.offset : pc + 1;
                continue;
              case 13 /* ifnle */:
                b = stack.pop();
                a = stack.pop();
                pc = !(a <= b) ? bc.offset : pc + 1;
                continue;
              case 23 /* ifgt */:
                b = stack.pop();
                a = stack.pop();
                pc = a > b ? bc.offset : pc + 1;
                continue;
              case 14 /* ifngt */:
                b = stack.pop();
                a = stack.pop();
                pc = !(a > b) ? bc.offset : pc + 1;
                continue;
              case 22 /* ifle */:
                b = stack.pop();
                a = stack.pop();
                pc = a <= b ? bc.offset : pc + 1;
                continue;
              case 15 /* ifnge */:
                b = stack.pop();
                a = stack.pop();
                pc = !(a >= b) ? bc.offset : pc + 1;
                continue;
              case 21 /* iflt */:
                b = stack.pop();
                a = stack.pop();
                pc = a < b ? bc.offset : pc + 1;
                continue;
              case 16 /* jump */:
                pc = bc.offset;
                continue;
              case 17 /* iftrue */:
                pc = !!stack.pop() ? bc.offset : pc + 1;
                continue;
              case 18 /* iffalse */:
                pc = !stack.pop() ? bc.offset : pc + 1;
                continue;
              case 19 /* ifeq */:
                b = stack.pop();
                a = stack.pop();
                pc = a == b ? bc.offset : pc + 1;
                continue;
              case 20 /* ifne */:
                b = stack.pop();
                a = stack.pop();
                pc = a != b ? bc.offset : pc + 1;
                continue;
              case 25 /* ifstricteq */:
                b = stack.pop();
                a = stack.pop();
                pc = a === b ? bc.offset : pc + 1;
                continue;
              case 26 /* ifstrictne */:
                b = stack.pop();
                a = stack.pop();
                pc = a !== b ? bc.offset : pc + 1;
                continue;
              case 27 /* lookupswitch */:
                index = stack.pop();
                if (index < 0 || index >= bc.offsets.length) {
                  index = bc.offsets.length - 1;
                }
                pc = bc.offsets[index];
                continue;
              case 28 /* pushwith */:
                scopeStack.push(boxValue(stack.pop()), true);
                break;
              case 29 /* popscope */:
                scopeStack.pop();
                break;
              case 30 /* nextname */:
                index = stack.pop();
                stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asNextName(index);
                break;
              case 35 /* nextvalue */:
                index = stack.pop();
                stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asNextValue(index);
                break;
              case 50 /* hasnext2 */:
                var hasNext2Info = hasNext2Infos[pc] || (hasNext2Infos[pc] = new HasNext2Info(null, 0));
                object = locals[bc.object];
                index = locals[bc.index];
                hasNext2Info.object = object;
                hasNext2Info.index = index;
                Object(object).asHasNext2(hasNext2Info);
                locals[bc.object] = hasNext2Info.object;
                locals[bc.index] = hasNext2Info.index;
                stack.push(!!hasNext2Info.index);
                break;
              case 32 /* pushnull */:
                stack.push(null);
                break;
              case 33 /* pushundefined */:
                stack.push(undefined);
                break;
              case 36 /* pushbyte */:
              case 37 /* pushshort */:
                stack.push(bc.value);
                break;
              case 44 /* pushstring */:
                stack.push(strings[bc.index]);
                break;
              case 45 /* pushint */:
                stack.push(ints[bc.index]);
                break;
              case 46 /* pushuint */:
                stack.push(uints[bc.index]);
                break;
              case 47 /* pushdouble */:
                stack.push(doubles[bc.index]);
                break;
              case 38 /* pushtrue */:
                stack.push(true);
                break;
              case 39 /* pushfalse */:
                stack.push(false);
                break;
              case 40 /* pushnan */:
                stack.push(NaN);
                break;
              case 41 /* pop */:
                stack.pop();
                break;
              case 42 /* dup */:
                stack.push(stack[stack.length - 1]);
                break;
              case 43 /* swap */:
                object = stack[stack.length - 1];
                stack[stack.length - 1] = stack[stack.length - 2];
                stack[stack.length - 2] = object;
                break;
              case 48 /* pushscope */:
                scopeStack.push(boxValue(stack.pop()), false);
                break;
              case 64 /* newfunction */:
                stack.push(createFunction(methods[bc.index], scopeStack.topScope(), true));
                break;
              case 65 /* call */:
                popManyInto(stack, bc.argCount, args);
                object = stack.pop();
                stack[stack.length - 1] = stack[stack.length - 1].asApply(object, args);
                break;
              case 66 /* construct */:
                popManyInto(stack, bc.argCount, args);
                stack[stack.length - 1] = construct(stack[stack.length - 1], args);
                break;
              case 71 /* returnvoid */:
                return;
              case 72 /* returnvalue */:
                if (method.returnType) {
                  return asCoerceByMultiname(method, method.returnType, stack.pop());
                }
                return stack.pop();
              case 73 /* constructsuper */:
                popManyInto(stack, bc.argCount, args);
                object = stack.pop();
                savedScope.object.baseClass.instanceConstructorNoInitialize.apply(object, args);
                break;
              case 74 /* constructprop */:
                popManyInto(stack, bc.argCount, args);
                popNameInto(stack, multinames[bc.index], mn);
                object = boxValue(stack[stack.length - 1]);
                object = object.asConstructProperty(mn.namespaces, mn.name, mn.flags, args);
                stack[stack.length - 1] = object;
                break;
              case 75 /* callsuperid */:
                Shumway.Debug.notImplemented("OP.callsuperid");
                break;
              case 76 /* callproplex */:
              case 70 /* callproperty */:
              case 79 /* callpropvoid */:
                popManyInto(stack, bc.argCount, args);
                popNameInto(stack, multinames[bc.index], mn);
                result = boxValue(stack.pop()).asCallProperty(mn.namespaces, mn.name, mn.flags, op === 76 /* callproplex */, args);
                if (op !== 79 /* callpropvoid */) {
                  stack.push(result);
                }
                break;
              case 69 /* callsuper */:
              case 78 /* callsupervoid */:
                popManyInto(stack, bc.argCount, args);
                popNameInto(stack, multinames[bc.index], mn);
                result = stack.pop().asCallSuper(savedScope, mn.namespaces, mn.name, mn.flags, args);
                if (op !== 78 /* callsupervoid */) {
                  stack.push(result);
                }
                break;
              case 83 /* applytype */:
                popManyInto(stack, bc.argCount, args);
                stack[stack.length - 1] = applyType(method, stack[stack.length - 1], args);
                break;
              case 85 /* newobject */:
                object = {};
                for (var i = 0; i < bc.argCount; i++) {
                  value = stack.pop();
                  object[Multiname.getPublicQualifiedName(stack.pop())] = value;
                }
                stack.push(object);
                break;
              case 86 /* newarray */:
                object = [];
                popManyInto(stack, bc.argCount, args);
                object.push.apply(object, args);
                stack.push(object);
                break;
              case 87 /* newactivation */:
                release || assert(method.needsActivation());
                stack.push(asCreateActivation(method));
                break;
              case 88 /* newclass */:
                stack[stack.length - 1] = createClass(abc.classes[bc.index], stack[stack.length - 1], scopeStack.topScope());
                break;
              case 89 /* getdescendants */:
                popNameInto(stack, multinames[bc.index], mn);
                stack.push(getDescendants(stack.pop(), mn));
                break;
              case 90 /* newcatch */:
                release || assert(exceptions[bc.index].scopeObject);
                stack.push(exceptions[bc.index].scopeObject);
                break;
              case 94 /* findproperty */:
              case 93 /* findpropstrict */:
                popNameInto(stack, multinames[bc.index], mn);
                stack.push(scopeStack.topScope().findScopeProperty(mn.namespaces, mn.name, mn.flags, method, op === 93 /* findpropstrict */, false));
                break;
              case 96 /* getlex */:
                multiname = multinames[bc.index];
                object = scopeStack.topScope().findScopeProperty(multiname.namespaces, multiname.name, multiname.flags, method, true, false);
                stack.push(object.asGetProperty(multiname.namespaces, multiname.name, multiname.flags));
                break;
              case 104 /* initproperty */:
              case 97 /* setproperty */:
                value = stack.pop();
                popNameInto(stack, multinames[bc.index], mn);
                boxValue(stack.pop()).asSetProperty(mn.namespaces, mn.name, mn.flags, value);
                break;
              case 98 /* getlocal */:
                stack.push(locals[bc.index]);
                break;
              case 99 /* setlocal */:
                locals[bc.index] = stack.pop();
                break;
              case 100 /* getglobalscope */:
                stack.push(savedScope.global.object);
                break;
              case 101 /* getscopeobject */:
                stack.push(scopeStack.get(bc.index));
                break;
              case 102 /* getproperty */:
                popNameInto(stack, multinames[bc.index], mn);
                stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asGetProperty(mn.namespaces, mn.name, mn.flags);
                break;
              case 106 /* deleteproperty */:
                popNameInto(stack, multinames[bc.index], mn);
                stack[stack.length - 1] = boxValue(stack[stack.length - 1]).asDeleteProperty(mn.namespaces, mn.name, mn.flags);
                break;
              case 108 /* getslot */:
                stack[stack.length - 1] = asGetSlot(stack[stack.length - 1], bc.index);
                break;
              case 109 /* setslot */:
                value = stack.pop();
                object = stack.pop();
                asSetSlot(object, bc.index, value);
                break;
              case 112 /* convert_s */:
                stack[stack.length - 1] = stack[stack.length - 1] + '';
                break;
              case 131 /* coerce_i */:
              case 115 /* convert_i */:
                stack[stack.length - 1] |= 0;
                break;
              case 136 /* coerce_u */:
              case 116 /* convert_u */:
                stack[stack.length - 1] >>>= 0;
                break;
              case 132 /* coerce_d */:
              case 117 /* convert_d */:
                stack[stack.length - 1] = +stack[stack.length - 1];
                break;
              case 129 /* coerce_b */:
              case 118 /* convert_b */:
                stack[stack.length - 1] = !!stack[stack.length - 1];
                break;
              case 120 /* checkfilter */:
                stack[stack.length - 1] = checkFilter(stack[stack.length - 1]);
                break;
              case 128 /* coerce */:
                stack[stack.length - 1] = asCoerce(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
                break;
              case 130 /* coerce_a */:
                break;
              case 133 /* coerce_s */:
                stack[stack.length - 1] = asCoerceString(stack[stack.length - 1]);
                break;
              case 134 /* astype */:
                stack[stack.length - 2] = asAsType(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
                break;
              case 135 /* astypelate */:
                stack[stack.length - 2] = asAsType(stack.pop(), stack[stack.length - 1]);
                break;
              case 137 /* coerce_o */:
                object = stack[stack.length - 1];
                stack[stack.length - 1] = object == undefined ? null : object;
                break;
              case 144 /* negate */:
                stack[stack.length - 1] = -stack[stack.length - 1];
                break;
              case 145 /* increment */:
                ++stack[stack.length - 1];
                break;
              case 146 /* inclocal */:
                ++locals[bc.index];
                break;
              case 147 /* decrement */:
                --stack[stack.length - 1];
                break;
              case 148 /* declocal */:
                --locals[bc.index];
                break;
              case 149 /* typeof */:
                stack[stack.length - 1] = asTypeOf(stack[stack.length - 1]);
                break;
              case 150 /* not */:
                stack[stack.length - 1] = !stack[stack.length - 1];
                break;
              case 151 /* bitnot */:
                stack[stack.length - 1] = ~stack[stack.length - 1];
                break;
              case 160 /* add */:
                stack[stack.length - 2] = asAdd(stack[stack.length - 2], stack.pop());
                break;
              case 161 /* subtract */:
                stack[stack.length - 2] -= stack.pop();
                break;
              case 162 /* multiply */:
                stack[stack.length - 2] *= stack.pop();
                break;
              case 163 /* divide */:
                stack[stack.length - 2] /= stack.pop();
                break;
              case 164 /* modulo */:
                stack[stack.length - 2] %= stack.pop();
                break;
              case 165 /* lshift */:
                stack[stack.length - 2] <<= stack.pop();
                break;
              case 166 /* rshift */:
                stack[stack.length - 2] >>= stack.pop();
                break;
              case 167 /* urshift */:
                stack[stack.length - 2] >>>= stack.pop();
                break;
              case 168 /* bitand */:
                stack[stack.length - 2] &= stack.pop();
                break;
              case 169 /* bitor */:
                stack[stack.length - 2] |= stack.pop();
                break;
              case 170 /* bitxor */:
                stack[stack.length - 2] ^= stack.pop();
                break;
              case 171 /* equals */:
                stack[stack.length - 2] = stack[stack.length - 2] == stack.pop();
                break;
              case 172 /* strictequals */:
                stack[stack.length - 2] = stack[stack.length - 2] === stack.pop();
                break;
              case 173 /* lessthan */:
                stack[stack.length - 2] = stack[stack.length - 2] < stack.pop();
                break;
              case 174 /* lessequals */:
                stack[stack.length - 2] = stack[stack.length - 2] <= stack.pop();
                break;
              case 175 /* greaterthan */:
                stack[stack.length - 2] = stack[stack.length - 2] > stack.pop();
                break;
              case 176 /* greaterequals */:
                stack[stack.length - 2] = stack[stack.length - 2] >= stack.pop();
                break;
              case 177 /* instanceof */:
                stack[stack.length - 2] = asIsInstanceOf(stack.pop(), stack[stack.length - 1]);
                break;
              case 178 /* istype */:
                stack[stack.length - 1] = asIsType(domain.getType(multinames[bc.index]), stack[stack.length - 1]);
                break;
              case 179 /* istypelate */:
                stack[stack.length - 2] = asIsType(stack.pop(), stack[stack.length - 1]);
                break;
              case 180 /* in */:
                stack[stack.length - 2] = boxValue(stack.pop()).asHasProperty(null, stack[stack.length - 1]);
                break;
              case 192 /* increment_i */:
                stack[stack.length - 1] = (stack[stack.length - 1] | 0) + 1;
                break;
              case 193 /* decrement_i */:
                stack[stack.length - 1] = (stack[stack.length - 1] | 0) - 1;
                break;
              case 194 /* inclocal_i */:
                locals[bc.index] = (locals[bc.index] | 0) + 1;
                break;
              case 195 /* declocal_i */:
                locals[bc.index] = (locals[bc.index] | 0) - 1;
                break;
              case 196 /* negate_i */:
                stack[stack.length - 1] = ~stack[stack.length - 1];
                break;
              case 197 /* add_i */:
                stack[stack.length - 2] = stack[stack.length - 2] + stack.pop() | 0;
                break;
              case 198 /* subtract_i */:
                stack[stack.length - 2] = stack[stack.length - 2] - stack.pop() | 0;
                break;
              case 199 /* multiply_i */:
                stack[stack.length - 2] = stack[stack.length - 2] * stack.pop() | 0;
                break;
              case 208 /* getlocal0 */:
              case 209 /* getlocal1 */:
              case 210 /* getlocal2 */:
              case 211 /* getlocal3 */:
                stack.push(locals[op - 208 /* getlocal0 */]);
                break;
              case 212 /* setlocal0 */:
              case 213 /* setlocal1 */:
              case 214 /* setlocal2 */:
              case 215 /* setlocal3 */:
                locals[op - 212 /* setlocal0 */] = stack.pop();
                break;
              case 6 /* dxns */:
                Shumway.AVM2.AS.ASXML.defaultNamespace = strings[bc.index];
                break;
              case 7 /* dxnslate */:
                Shumway.AVM2.AS.ASXML.defaultNamespace = stack.pop();
                break;
              case 239 /* debug */:
              case 240 /* debugline */:
              case 241 /* debugfile */:
                break;
              default:
                Shumway.Debug.notImplemented(Shumway.AVM2.opcodeName(op));
            }
            pc++;
          } catch (e) {
            if (exceptions.length < 1) {
              throw e;
            }

            e = translateError(domain, e);
            for (var i = 0, j = exceptions.length; i < j; i++) {
              var handler = exceptions[i];
              if (pc >= handler.start && pc <= handler.end && (!handler.typeName || domain.getType(handler.typeName).isType(e))) {
                stack.length = 0;
                stack.push(e);
                scopeStack.clear();
                pc = handler.offset;
                continue interpretLabel;
              }
            }
            throw e;
          }
        }
      };
      return Interpreter;
    })();
    AVM2.Interpreter = Interpreter;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (Runtime) {
      Runtime.VM_METHOD_OVERRIDES["static mochi.as3.MochiServices::connect"] = function () {
        return;
      };

      Runtime.VM_METHOD_OVERRIDES["static MochiBot::track"] = function () {
        return;
      };

      Runtime.VM_METHOD_OVERRIDES["com.midasplayer.debug.DebugLog::trace"] = function (msg) {
        log(msg);
      };

      Runtime.VM_METHOD_OVERRIDES["com.midasplayer.engine.comm.DebugGameComm::getGameData"] = function () {
        return '<gamedata randomseed="554884453" version="1">\n<musicOn>true</musicOn>\n<soundOn>true</soundOn>\n<isShortGame>false</isShortGame>\n<booster_1>0</booster_1>\n<booster_2>0</booster_2>\n<booster_3>0</booster_3>\n<booster_4>0</booster_4>\n<booster_5>0</booster_5>\n<bestScore>0</bestScore>\n<bestChain>0</bestChain>\n<bestLevel>0</bestLevel>\n<bestCrushed>0</bestCrushed>\n<bestMixed>0</bestMixed>\n<text id="outro.crushed">Candy crushed</text>\n<text id="outro.bestever">best ever</text>\n<text id="outro.trophy.two">scored {0} in one game</text>\n<text id="outro.combo_color_color">All Clear Created</text>\n<text id="outro.trophy.one">crushed {0} candy in one game</text>\n<text id="outro.score">Score</text>\n<text id="outro.opengame">Please register to play the full game</text>\n<text id="outro.chain">Longest chain</text>\n<text id="outro.time">Game ends in {0} seconds</text>\n<text id="outro.combo_color_line">Super Stripes Created</text>\n<text id="game.nomoves">No more moves!</text>\n<text id="outro.combo_wrapper_line">Mega-Candy Created</text>\n<text id="intro.time">Game starts in {0} seconds</text>\n<text id="outro.now">now</text>\n<text id="outro.level">Level reached</text>\n<text id="outro.title">Game Over</text>\n<text id="intro.info1">Match 3 Candy of the same colour to crush them. Matching 4 or 5 in different formations generates special sweets that are extra tasty.</text>\n<text id="intro.info2">You can also combine the special sweets for additional effects by switching them with each other. Try these combinations for a taste you will not forget: </text>\n<text id="outro.combo_color_wrapper">Double Colour Bombs Created</text>\n<text id="outro.trophy.three">made {0} combined candy in one game</text>\n<text id="intro.title">Play like this:</text>\n</gamedata>';
      };

      Runtime.VM_METHOD_OVERRIDES["com.antkarlov.Preloader::com.antkarlov:Preloader.isUrl"] = function () {
        return true;
      };

      Runtime.VM_METHOD_OVERRIDES["static com.demonsters.debugger.MonsterDebugger::initialize"] = function () {
      };

      Runtime.VM_METHOD_OVERRIDES["com.spilgames.api.core.tracking.TrackConfig::getTrackers"] = function () {
        return [];
      };

      Runtime.VM_METHOD_OVERRIDES["com.spilgames.api.components.TextFields.AutoFitTextFieldEx::com.spilgames.api.components.TextFields:AutoFitTextFieldEx.updateProperties"] = Runtime.VM_METHOD_OVERRIDES["com.spilgames.api.components.TextFields.AutoFitTextFieldEx::com.spilgames.api.components.TextFields:AutoFitTextFieldEx.updateTextSize"] = function () {
      };
    })(AVM2.Runtime || (AVM2.Runtime = {}));
    var Runtime = AVM2.Runtime;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    var Multiname = Shumway.AVM2.ABC.Multiname;

    var forEachPublicProperty = Shumway.AVM2.Runtime.forEachPublicProperty;
    var construct = Shumway.AVM2.Runtime.construct;

    (function (AMF0Marker) {
      AMF0Marker[AMF0Marker["NUMBER"] = 0x00] = "NUMBER";
      AMF0Marker[AMF0Marker["BOOLEAN"] = 0x01] = "BOOLEAN";
      AMF0Marker[AMF0Marker["STRING"] = 0x02] = "STRING";
      AMF0Marker[AMF0Marker["OBJECT"] = 0x03] = "OBJECT";
      AMF0Marker[AMF0Marker["NULL"] = 0x05] = "NULL";
      AMF0Marker[AMF0Marker["UNDEFINED"] = 0x06] = "UNDEFINED";
      AMF0Marker[AMF0Marker["REFERENCE"] = 0x07] = "REFERENCE";
      AMF0Marker[AMF0Marker["ECMA_ARRAY"] = 0x08] = "ECMA_ARRAY";
      AMF0Marker[AMF0Marker["OBJECT_END"] = 0x09] = "OBJECT_END";
      AMF0Marker[AMF0Marker["STRICT_ARRAY"] = 0x0A] = "STRICT_ARRAY";
      AMF0Marker[AMF0Marker["DATE"] = 0x0B] = "DATE";
      AMF0Marker[AMF0Marker["LONG_STRING"] = 0x0C] = "LONG_STRING";
      AMF0Marker[AMF0Marker["XML"] = 0x0F] = "XML";
      AMF0Marker[AMF0Marker["TYPED_OBJECT"] = 0x10] = "TYPED_OBJECT";
      AMF0Marker[AMF0Marker["AVMPLUS"] = 0x11] = "AVMPLUS";
    })(AVM2.AMF0Marker || (AVM2.AMF0Marker = {}));
    var AMF0Marker = AVM2.AMF0Marker;

    function writeString(ba, s) {
      if (s.length > 0xFFFF) {
        throw 'AMF short string exceeded';
      }
      if (!s.length) {
        ba.writeByte(0x00);
        ba.writeByte(0x00);
        return;
      }
      var bytes = Shumway.StringUtilities.utf8decode(s);
      ba.writeByte((bytes.length >> 8) & 255);
      ba.writeByte(bytes.length & 255);
      for (var i = 0; i < bytes.length; i++) {
        ba.writeByte(bytes[i]);
      }
    }

    function readString(ba) {
      var byteLength = (ba.readByte() << 8) | ba.readByte();
      if (!byteLength) {
        return '';
      }

      var buffer = new Uint8Array(byteLength);
      for (var i = 0; i < byteLength; i++) {
        buffer[i] = ba.readByte();
      }

      return Shumway.StringUtilities.utf8encode(buffer);
    }

    function writeDouble(ba, value) {
      var buffer = new ArrayBuffer(8);
      var view = new DataView(buffer);
      view.setFloat64(0, value, false);
      for (var i = 0; i < buffer.byteLength; i++) {
        ba.writeByte(view.getUint8(i));
      }
    }

    function readDouble(ba) {
      var buffer = new ArrayBuffer(8);
      var view = new DataView(buffer);
      for (var i = 0; i < buffer.byteLength; i++) {
        view.setUint8(i, ba.readByte());
      }
      return view.getFloat64(0, false);
    }

    function setAvmProperty(obj, propertyName, value) {
      obj.asSetPublicProperty(propertyName, value);
    }

    var AMF0 = (function () {
      function AMF0() {
      }
      AMF0.write = function (ba, obj) {
        switch (typeof obj) {
          case 'boolean':
            ba.writeByte(1 /* BOOLEAN */);
            ba.writeByte(obj ? 0x01 : 0x00);
            break;
          case 'number':
            ba.writeByte(0 /* NUMBER */);
            writeDouble(ba, obj);
            break;
          case 'undefined':
            ba.writeByte(6 /* UNDEFINED */);
            break;
          case 'string':
            ba.writeByte(2 /* STRING */);
            writeString(ba, obj);
            break;
          case 'object':
            if (obj === null) {
              ba.writeByte(5 /* NULL */);
            } else if (Array.isArray(obj)) {
              ba.writeByte(8 /* ECMA_ARRAY */);
              ba.writeByte((obj.length >>> 24) & 255);
              ba.writeByte((obj.length >> 16) & 255);
              ba.writeByte((obj.length >> 8) & 255);
              ba.writeByte(obj.length & 255);
              forEachPublicProperty(obj, function (key, value) {
                writeString(ba, key);
                this.write(ba, value);
              }, this);
              ba.writeByte(0x00);
              ba.writeByte(0x00);
              ba.writeByte(9 /* OBJECT_END */);
            } else {
              ba.writeByte(3 /* OBJECT */);
              forEachPublicProperty(obj, function (key, value) {
                writeString(ba, key);
                this.write(ba, value);
              }, this);
              ba.writeByte(0x00);
              ba.writeByte(0x00);
              ba.writeByte(9 /* OBJECT_END */);
            }
            return;
        }
      };

      AMF0.read = function (ba) {
        var marker = ba.readByte();
        switch (marker) {
          case 0 /* NUMBER */:
            return readDouble(ba);
          case 1 /* BOOLEAN */:
            return !!ba.readByte();
          case 2 /* STRING */:
            return readString(ba);
          case 3 /* OBJECT */:
            var obj = {};
            while (true) {
              var key = readString(ba);
              if (!key.length)
                break;
              setAvmProperty(obj, key, this.read(ba));
            }
            if (ba.readByte() !== 9 /* OBJECT_END */) {
              throw 'AMF0 End marker is not found';
            }
            return obj;
          case 5 /* NULL */:
            return null;
          case 6 /* UNDEFINED */:
            return undefined;
          case 8 /* ECMA_ARRAY */:
            var arr = [];
            arr.length = (ba.readByte() << 24) | (ba.readByte() << 16) | (ba.readByte() << 8) | ba.readByte();
            while (true) {
              var key = readString(ba);
              if (!key.length)
                break;
              setAvmProperty(arr, key, this.read(ba));
            }
            if (ba.readByte() !== 9 /* OBJECT_END */) {
              throw 'AMF0 End marker is not found';
            }
            return arr;
          case 10 /* STRICT_ARRAY */:
            var arr = [];
            arr.length = (ba.readByte() << 24) | (ba.readByte() << 16) | (ba.readByte() << 8) | ba.readByte();
            for (var i = 0; i < arr.length; i++) {
              arr[i] = this.read(ba);
            }
            return arr;
          case 17 /* AVMPLUS */:
            return readAmf3Data(ba, {});
          default:
            throw 'AMF0 Unknown marker ' + marker;
        }
      };
      return AMF0;
    })();
    AVM2.AMF0 = AMF0;

    (function (AMF3Marker) {
      AMF3Marker[AMF3Marker["UNDEFINED"] = 0x00] = "UNDEFINED";
      AMF3Marker[AMF3Marker["NULL"] = 0x01] = "NULL";
      AMF3Marker[AMF3Marker["FALSE"] = 0x02] = "FALSE";
      AMF3Marker[AMF3Marker["TRUE"] = 0x03] = "TRUE";
      AMF3Marker[AMF3Marker["INTEGER"] = 0x04] = "INTEGER";
      AMF3Marker[AMF3Marker["DOUBLE"] = 0x05] = "DOUBLE";
      AMF3Marker[AMF3Marker["STRING"] = 0x06] = "STRING";
      AMF3Marker[AMF3Marker["XML_DOC"] = 0x07] = "XML_DOC";
      AMF3Marker[AMF3Marker["DATE"] = 0x08] = "DATE";
      AMF3Marker[AMF3Marker["ARRAY"] = 0x09] = "ARRAY";
      AMF3Marker[AMF3Marker["OBJECT"] = 0x0A] = "OBJECT";
      AMF3Marker[AMF3Marker["XML"] = 0x0B] = "XML";
      AMF3Marker[AMF3Marker["BYTEARRAY"] = 0x0C] = "BYTEARRAY";
      AMF3Marker[AMF3Marker["VECTOR_INT"] = 0x0D] = "VECTOR_INT";
      AMF3Marker[AMF3Marker["VECTOR_UINT"] = 0x0E] = "VECTOR_UINT";
      AMF3Marker[AMF3Marker["VECTOR_DOUBLE"] = 0x0F] = "VECTOR_DOUBLE";
      AMF3Marker[AMF3Marker["VECTOR_OBJECT"] = 0x10] = "VECTOR_OBJECT";
      AMF3Marker[AMF3Marker["DICTIONARY"] = 0x11] = "DICTIONARY";
    })(AVM2.AMF3Marker || (AVM2.AMF3Marker = {}));
    var AMF3Marker = AVM2.AMF3Marker;

    function readU29(ba) {
      var b1 = ba.readByte();
      if ((b1 & 0x80) === 0) {
        return b1;
      }
      var b2 = ba.readByte();
      if ((b2 & 0x80) === 0) {
        return ((b1 & 0x7F) << 7) | b2;
      }
      var b3 = ba.readByte();
      if ((b3 & 0x80) === 0) {
        return ((b1 & 0x7F) << 14) | ((b2 & 0x7F) << 7) | b3;
      }
      var b4 = ba.readByte();
      return ((b1 & 0x7F) << 22) | ((b2 & 0x7F) << 15) | ((b3 & 0x7F) << 8) | b4;
    }

    function writeU29(ba, value) {
      if ((value & 0xFFFFFF80) === 0) {
        ba.writeByte(value & 0x7F);
      } else if ((value & 0xFFFFC000) === 0) {
        ba.writeByte(0x80 | ((value >> 7) & 0x7F));
        ba.writeByte(value & 0x7F);
      } else if ((value & 0xFFE00000) === 0) {
        ba.writeByte(0x80 | ((value >> 14) & 0x7F));
        ba.writeByte(0x80 | ((value >> 7) & 0x7F));
        ba.writeByte(value & 0x7F);
      } else if ((value & 0xC0000000) === 0) {
        ba.writeByte(0x80 | ((value >> 22) & 0x7F));
        ba.writeByte(0x80 | ((value >> 15) & 0x7F));
        ba.writeByte(0x80 | ((value >> 8) & 0x7F));
        ba.writeByte(value & 0xFF);
      } else {
        throw 'AMF3 U29 range';
      }
    }

    function readUTF8vr(ba, caches) {
      var u29s = readU29(ba);
      if (u29s === 0x01) {
        return '';
      }
      var stringsCache = caches.stringsCache || (caches.stringsCache = []);
      if ((u29s & 1) === 0) {
        return stringsCache[u29s >> 1];
      }

      var byteLength = u29s >> 1;
      var buffer = new Uint8Array(byteLength);
      for (var i = 0; i < byteLength; i++) {
        buffer[i] = ba.readByte();
      }
      var value = Shumway.StringUtilities.utf8encode(buffer);
      stringsCache.push(value);
      return value;
    }

    function writeUTF8vr(ba, value, caches) {
      if (value === '') {
        ba.writeByte(0x01);
        return;
      }

      var stringsCache = caches.stringsCache || (caches.stringsCache = []);
      var index = stringsCache.indexOf(value);
      if (index >= 0) {
        writeU29(ba, index << 1);
        return;
      }
      stringsCache.push(value);

      var bytes = Shumway.StringUtilities.utf8decode(value);
      writeU29(ba, 1 | (bytes.length << 1));
      for (var i = 0; i < bytes.length; i++) {
        ba.writeByte(bytes[i]);
      }
    }

    function readAmf3Data(ba, caches) {
      var marker = ba.readByte();
      switch (marker) {
        case 1 /* NULL */:
          return null;
        case 0 /* UNDEFINED */:
          return undefined;
        case 2 /* FALSE */:
          return false;
        case 3 /* TRUE */:
          return true;
        case 4 /* INTEGER */:
          return readU29(ba);
        case 5 /* DOUBLE */:
          return readDouble(ba);
        case 6 /* STRING */:
          return readUTF8vr(ba, caches);
        case 8 /* DATE */:
          return new Date(readDouble(ba));
        case 10 /* OBJECT */:
          var u29o = readU29(ba);
          if ((u29o & 1) === 0) {
            return caches.objectsCache[u29o >> 1];
          }
          if ((u29o & 4) !== 0) {
            throw 'AMF3 Traits-Ext is not supported';
          }
          var traits, objectClass;
          if ((u29o & 2) === 0) {
            traits = caches.traitsCache[u29o >> 2];
            objectClass = traits.class;
          } else {
            traits = {};
            var aliasName = readUTF8vr(ba, caches);
            traits.className = aliasName;
            objectClass = aliasName && AVM2.aliasesCache.names[aliasName];
            traits.class = objectClass;
            traits.isDynamic = (u29o & 8) !== 0;
            traits.members = [];
            var slots = objectClass && objectClass.instanceBindings.slots;
            for (var i = 0, j = u29o >> 4; i < j; i++) {
              var traitName = readUTF8vr(ba, caches);
              var slot = null;
              for (var j = 1; slots && j < slots.length; j++) {
                if (slots[j].name.name === traitName) {
                  slot = slots[j];
                  break;
                }
              }
              traits.members.push(slot ? Multiname.getQualifiedName(slot.name) : Multiname.getPublicQualifiedName(traitName));
            }
            (caches.traitsCache || (caches.traitsCache = [])).push(traits);
          }

          var obj = objectClass ? construct(objectClass, []) : {};
          (caches.objectsCache || (caches.objectsCache = [])).push(obj);
          for (var i = 0; i < traits.members.length; i++) {
            var value = readAmf3Data(ba, caches);
            obj[traits.members[i]] = value;
          }
          if (traits.isDynamic) {
            while (true) {
              var key = readUTF8vr(ba, caches);
              if (!key.length)
                break;
              var value = readAmf3Data(ba, caches);
              setAvmProperty(obj, key, value);
            }
          }
          return obj;
        case 9 /* ARRAY */:
          var u29o = readU29(ba);
          if ((u29o & 1) === 0) {
            return caches.objectsCache[u29o >> 1];
          }
          var arr = [];
          (caches.objectsCache || (caches.objectsCache = [])).push(arr);
          var densePortionLength = u29o >> 1;
          while (true) {
            var key = readUTF8vr(ba, caches);
            if (!key.length)
              break;
            var value = readAmf3Data(ba, caches);
            setAvmProperty(arr, key, value);
          }
          for (var i = 0; i < densePortionLength; i++) {
            var value = readAmf3Data(ba, caches);
            setAvmProperty(arr, i, value);
          }
          return arr;
        default:
          throw 'AMF3 Unknown marker ' + marker;
      }
    }

    function writeCachedReference(ba, obj, caches) {
      var objectsCache = caches.objectsCache || (caches.objectsCache = []);
      var index = objectsCache.indexOf(obj);
      if (index < 0) {
        objectsCache.push(obj);
        return false;
      }
      writeU29(ba, index << 1);
      return true;
    }

    function writeAmf3Data(ba, obj, caches) {
      switch (typeof obj) {
        case 'boolean':
          ba.writeByte(obj ? 3 /* TRUE */ : 2 /* FALSE */);
          break;
        case 'number':
          if (obj === (obj | 0)) {
            ba.writeByte(4 /* INTEGER */);
            writeU29(ba, obj);
          } else {
            ba.writeByte(5 /* DOUBLE */);
            writeDouble(ba, obj);
          }
          break;
        case 'undefined':
          ba.writeByte(0 /* UNDEFINED */);
          break;
        case 'string':
          ba.writeByte(6 /* STRING */);
          writeUTF8vr(ba, obj, caches);
          break;
        case 'object':
          if (obj === null) {
            ba.writeByte(1 /* NULL */);
          } else if (Array.isArray(obj)) {
            ba.writeByte(9 /* ARRAY */);
            if (writeCachedReference(ba, obj, caches))
              break;
            var densePortionLength = 0;
            while (densePortionLength in obj) {
              ++densePortionLength;
            }
            writeU29(ba, (densePortionLength << 1) | 1);
            forEachPublicProperty(obj, function (i, value) {
              if (Shumway.isNumeric(i) && i >= 0 && i < densePortionLength) {
                return;
              }
              writeUTF8vr(ba, i, caches);
              writeAmf3Data(ba, value, caches);
            });
            writeUTF8vr(ba, '', caches);
            for (var j = 0; j < densePortionLength; j++) {
              writeAmf3Data(ba, obj[j], caches);
            }
          } else if (obj instanceof Date) {
            ba.writeByte(8 /* DATE */);
            if (writeCachedReference(ba, obj, caches))
              break;
            writeU29(ba, 1);
            writeDouble(ba, obj.valueOf());
          } else {
            ba.writeByte(10 /* OBJECT */);
            if (writeCachedReference(ba, obj, caches))
              break;

            var isDynamic = true;

            var objectClass = obj.class;
            if (objectClass) {
              isDynamic = !objectClass.classInfo.instanceInfo.isSealed();

              var aliasName = AVM2.aliasesCache.classes.get(objectClass) || '';

              var traits, traitsCount;
              var traitsCache = caches.traitsCache || (caches.traitsCache = []);
              var traitsInfos = caches.traitsInfos || (caches.traitsInfos = []);
              var traitsRef = traitsCache.indexOf(objectClass);
              if (traitsRef < 0) {
                var slots = objectClass.instanceBindings.slots;
                traits = [];
                var traitsNames = [];
                for (var i = 1; i < slots.length; i++) {
                  var slot = slots[i];
                  if (!slot.name.getNamespace().isPublic()) {
                    continue;
                  }
                  traits.push(Multiname.getQualifiedName(slot.name));
                  traitsNames.push(slot.name.name);
                }
                traitsCache.push(objectClass);
                traitsInfos.push(traits);
                traitsCount = traitsNames.length;
                writeU29(ba, (isDynamic ? 0x0B : 0x03) + (traitsCount << 4));
                writeUTF8vr(ba, aliasName, caches);
                for (var i = 0; i < traitsCount; i++) {
                  writeUTF8vr(ba, traitsNames[i], caches);
                }
              } else {
                traits = traitsInfos[traitsRef];
                traitsCount = traits.length;
                writeU29(ba, 0x01 + (traitsRef << 2));
              }

              for (var i = 0; i < traitsCount; i++) {
                writeAmf3Data(ba, obj[traits[i]], caches);
              }
            } else {
              writeU29(ba, 0x0B);
              writeUTF8vr(ba, '', caches);
            }

            if (isDynamic) {
              forEachPublicProperty(obj, function (i, value) {
                writeUTF8vr(ba, i, caches);
                writeAmf3Data(ba, value, caches);
              });
              writeUTF8vr(ba, '', caches);
            }
          }
          return;
      }
    }

    AVM2.aliasesCache = {
      classes: new WeakMap(),
      names: Object.create(null)
    };

    var AMF3 = (function () {
      function AMF3() {
      }
      AMF3.write = function (ba, object) {
        writeAmf3Data(ba, object, {});
      };
      AMF3.read = function (ba) {
        return readAmf3Data(ba, {});
      };
      return AMF3;
    })();
    AVM2.AMF3 = AMF3;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
//# sourceMappingURL=avm2.js.map
