var Shumway;
(function (Shumway) {
  var startTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/, endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/, attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

  var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

  var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

  var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

  var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

  var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

  var special = makeMap("script,style");

  function HTMLParser(html, handler) {
    var index, chars, match, stack = [], last = html;

    function top() {
      return this[this.length - 1];
    }

    while (html) {
      chars = true;

      if (!top() || !special[top()]) {
        if (html.indexOf("<!--") == 0) {
          index = html.indexOf("-->");

          if (index >= 0) {
            if (handler.comment)
              handler.comment(html.substring(4, index));
            html = html.substring(index + 3);
            chars = false;
          }
        } else if (html.indexOf("</") == 0) {
          match = html.match(endTag);

          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(endTag, parseEndTag);
            chars = false;
          }
        } else if (html.indexOf("<") == 0) {
          match = html.match(startTag);

          if (match) {
            html = html.substring(match[0].length);
            match[0].replace(startTag, parseStartTag);
            chars = false;
          }
        }

        if (chars) {
          index = html.indexOf("<");

          var text = index < 0 ? html : html.substring(0, index);
          html = index < 0 ? "" : html.substring(index);

          if (handler.chars)
            handler.chars(text);
        }
      } else {
        html = html.replace(new RegExp("(.*)<\/" + top() + "[^>]*>"), function (all, text) {
          text = text.replace(/<!--(.*?)-->/g, "$1").replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

          if (handler.chars)
            handler.chars(text);

          return "";
        });

        parseEndTag("", top());
      }

      if (html == last)
        throw "Parse Error: " + html;
      last = html;
    }

    parseEndTag();

    function parseStartTag(tag, tagName, rest, unary) {
      tagName = tagName.toLowerCase();

      if (block[tagName]) {
        while (top() && inline[top()]) {
          parseEndTag("", top());
        }
      }

      if (closeSelf[tagName] && top() == tagName) {
        parseEndTag("", tagName);
      }

      unary = empty[tagName] || !!unary;

      if (!unary)
        stack.push(tagName);

      if (handler.start) {
        var attrs = Object.create(null);

        rest.replace(attr, function (match, name) {
          name = name.toLowerCase();

          var value = arguments[2] ? arguments[2] : arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : fillAttrs[name] ? name : "";

          attrs[name] = value;

          return match;
        });

        if (handler.start)
          handler.start(tagName, attrs, !!unary);
      }
    }

    function parseEndTag(tag, tagName) {
      if (!tagName)
        var pos = 0;
      else
        for (var pos = stack.length - 1; pos >= 0; pos--)
          if (stack[pos] == tagName)
            break;

      if (pos >= 0) {
        for (var i = stack.length - 1; i >= pos; i--)
          if (handler.end)
            handler.end(stack[i]);

        stack.length = pos;
      }
    }
  }
  Shumway.HTMLParser = HTMLParser;
  ;

  function makeMap(str) {
    var obj = {}, items = str.split(",");
    for (var i = 0; i < items.length; i++)
      obj[items[i]] = true;
    return obj;
  }
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  var notImplemented = Shumway.Debug.notImplemented;
  var somewhatImplemented = Shumway.Debug.somewhatImplemented;

  var Bounds = Shumway.Bounds;
  var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  var ColorUtilities = Shumway.ColorUtilities;
  var flash = Shumway.AVM2.AS.flash;

  (function (TextContentFlags) {
    TextContentFlags[TextContentFlags["None"] = 0x0000] = "None";
    TextContentFlags[TextContentFlags["DirtyBounds"] = 0x0001] = "DirtyBounds";
    TextContentFlags[TextContentFlags["DirtyContent"] = 0x0002] = "DirtyContent";
    TextContentFlags[TextContentFlags["DirtyStyle"] = 0x0004] = "DirtyStyle";
    TextContentFlags[TextContentFlags["DirtyFlow"] = 0x0008] = "DirtyFlow";
    TextContentFlags[TextContentFlags["Dirty"] = TextContentFlags.DirtyBounds | TextContentFlags.DirtyContent | TextContentFlags.DirtyStyle | TextContentFlags.DirtyFlow] = "Dirty";
  })(Shumway.TextContentFlags || (Shumway.TextContentFlags = {}));
  var TextContentFlags = Shumway.TextContentFlags;

  var _decodeHTMLMap = {
    lt: '<',
    gt: '>',
    amp: '&',
    quot: '"',
    apos: "'"
  };

  function decodeHTML(s) {
    var r = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c !== '&') {
        r += c;
      } else {
        var j = Shumway.StringUtilities.indexOfAny(s, ['&', ';'], i + 1);
        if (j > 0) {
          var v = s.substring(i + 1, j);
          if (v.length > 1 && v.charAt(0) === "#") {
            var n = 0;
            if (v.length > 2 && v.charAt(1) === "x") {
              n = parseInt(v.substring(1));
            } else {
              n = parseInt(v.substring(2), 16);
            }
            r += String.fromCharCode(n);
          } else {
            if (_decodeHTMLMap[v] !== undefined) {
              r += _decodeHTMLMap[v];
            } else {
              Shumway.Debug.unexpected(v);
            }
          }
          i = j;
        } else {
          for (var k in _decodeHTMLMap) {
            if (s.indexOf(k, i + 1) === i + 1) {
              r += _decodeHTMLMap[k];
              i += k.length;
              break;
            }
          }
        }
      }
    }
    return r;
  }

  var TextContent = (function () {
    function TextContent(defaultTextFormat) {
      this._id = flash.display.DisplayObject.getNextSyncID();
      this._bounds = new Bounds(0, 0, 0, 0);
      this._plainText = '';
      this._backgroundColor = 0;
      this._borderColor = 0;
      this._autoSize = 0;
      this._wordWrap = false;
      this.flags = 0 /* None */;
      this.defaultTextFormat = defaultTextFormat || new flash.text.TextFormat();
      this.textRuns = [];
      this.textRunData = new DataBuffer();
      this.matrix = null;
      this.coords = null;
    }
    TextContent.prototype.parseHtml = function (htmlText, multiline) {
      if (typeof multiline === "undefined") { multiline = false; }
      var plainText = '';
      var textRuns = this.textRuns;
      textRuns.length = 0;

      var beginIndex = 0;
      var endIndex = 0;
      var textFormat = this.defaultTextFormat.clone();
      var prevTextRun = null;
      var stack = [];

      var handler;
      Shumway.HTMLParser(htmlText, handler = {
        chars: function (text) {
          text = decodeHTML(text);
          plainText += text;
          endIndex += text.length;
          if (endIndex - beginIndex) {
            if (prevTextRun && prevTextRun.textFormat.equals(textFormat)) {
              prevTextRun.endIndex = endIndex;
            } else {
              prevTextRun = new flash.text.TextRun(beginIndex, endIndex, textFormat);
              textRuns.push(prevTextRun);
            }
            beginIndex = endIndex;
          }
        },
        start: function (tagName, attributes) {
          switch (tagName) {
            case 'a':
              stack.push(textFormat);
              somewhatImplemented('<a/>');
              var target = attributes.target || textFormat.target;
              var url = attributes.url || textFormat.url;
              if (target !== textFormat.target || url !== textFormat.url) {
                textFormat = textFormat.clone();
                textFormat.target = target;
                textFormat.url = url;
              }
              break;
            case 'b':
              stack.push(textFormat);
              if (!textFormat.bold) {
                textFormat = textFormat.clone();
                textFormat.bold = true;
              }
              break;
            case 'font':
              stack.push(textFormat);
              var color = ColorUtilities.isValidHexColor(attributes.color) ? ColorUtilities.hexToRGB(attributes.color) : textFormat.color;

              var font = attributes.face || textFormat.font;
              var size = isNaN(attributes.size) ? textFormat.size : +attributes.size;
              if (color !== textFormat.color || font !== textFormat.font || size !== textFormat.size) {
                textFormat = textFormat.clone();
                textFormat.color = color;
                textFormat.font = font;
                textFormat.size = size;
              }
              break;
            case 'img':
              notImplemented('<img/>');
              break;
            case 'i':
              stack.push(textFormat);
              if (!prevTextRun) {
                textFormat = textFormat.clone();
                textFormat.italic = true;
              }
              break;
            case 'li':
              stack.push(textFormat);
              if (!textFormat.bullet) {
                textFormat = textFormat.clone();
                textFormat.bullet = true;
              }
              if (plainText[plainText.length - 1] === '\r') {
                break;
              }
            case 'br':
              if (multiline) {
                handler.chars('\r');
              }
              break;
            case 'p':
              stack.push(textFormat);
              var align = attributes.align;
              if (flash.text.TextFormatAlign.toNumber(align) > -1 && align !== textFormat.align) {
                textFormat = textFormat.clone();
                textFormat.align = align;
              }
              break;
            case 'span':
              break;
            case 'textformat':
              stack.push(textFormat);
              var blockIndent = isNaN(attributes.blockindent) ? textFormat.blockIndent : +attributes.blockindent;
              var indent = isNaN(attributes.indent) ? textFormat.indent : +attributes.indent;
              var leading = isNaN(attributes.leading) ? textFormat.leading : +attributes.leading;
              var leftMargin = isNaN(attributes.leftmargin) ? textFormat.leftMargin : +attributes.leftmargin;
              var rightMargin = isNaN(attributes.rightmargin) ? textFormat.rightMargin : +attributes.rightmargin;

              if (blockIndent !== textFormat.blockIndent || indent !== textFormat.indent || leading !== textFormat.leading || leftMargin !== textFormat.leftMargin || rightMargin !== textFormat.rightMargin) {
                textFormat = textFormat.clone();
                textFormat.blockIndent = blockIndent;
                textFormat.indent = indent;
                textFormat.leading = leading;
                textFormat.leftMargin = leftMargin;
                textFormat.rightMargin = rightMargin;
              }
              break;
            case 'u':
              stack.push(textFormat);
              if (!textFormat.underline) {
                textFormat = textFormat.clone();
                textFormat.underline = true;
              }
              break;
          }
        },
        end: function (tagName) {
          switch (tagName) {
            case 'li':
            case 'p':
              if (multiline) {
                handler.chars('\r');
              }
            case 'a':
            case 'b':
            case 'font':
            case 'i':
            case 'textformat':
            case 'u':
              textFormat = stack.pop();
          }
        }
      });

      this._plainText = plainText;
      this.textRunData.clear();
      for (var i = 0; i < textRuns.length; i++) {
        this._writeTextRun(textRuns[i]);
      }
      this.flags |= 2 /* DirtyContent */;
    };

    Object.defineProperty(TextContent.prototype, "plainText", {
      get: function () {
        return this._plainText;
      },
      set: function (value) {
        this._plainText = value;
        this.textRuns.length = 0;
        var textRun = new flash.text.TextRun(0, value.length, this.defaultTextFormat);
        this.textRuns[0] = textRun;
        this.textRunData.clear();
        this._writeTextRun(textRun);
        this.flags |= 2 /* DirtyContent */;
      },
      enumerable: true,
      configurable: true
    });


    Object.defineProperty(TextContent.prototype, "bounds", {
      get: function () {
        return this._bounds;
      },
      set: function (bounds) {
        this._bounds.copyFrom(bounds);
        this.flags |= 1 /* DirtyBounds */;
      },
      enumerable: true,
      configurable: true
    });


    Object.defineProperty(TextContent.prototype, "autoSize", {
      get: function () {
        return this._autoSize;
      },
      set: function (value) {
        if (value === this._autoSize) {
          return;
        }
        this._autoSize = value;
        if (this._plainText) {
          this.flags |= 8 /* DirtyFlow */;
        }
      },
      enumerable: true,
      configurable: true
    });


    Object.defineProperty(TextContent.prototype, "wordWrap", {
      get: function () {
        return this._wordWrap;
      },
      set: function (value) {
        if (value === this._wordWrap) {
          return;
        }
        this._wordWrap = value;
        if (this._plainText) {
          this.flags |= 8 /* DirtyFlow */;
        }
      },
      enumerable: true,
      configurable: true
    });


    Object.defineProperty(TextContent.prototype, "backgroundColor", {
      get: function () {
        return this._backgroundColor;
      },
      set: function (value) {
        if (value === this._backgroundColor) {
          return;
        }
        this._backgroundColor = value;
        this.flags |= 4 /* DirtyStyle */;
      },
      enumerable: true,
      configurable: true
    });


    Object.defineProperty(TextContent.prototype, "borderColor", {
      get: function () {
        return this._borderColor;
      },
      set: function (value) {
        if (value === this._borderColor) {
          return;
        }
        this._borderColor = value;
        this.flags |= 4 /* DirtyStyle */;
      },
      enumerable: true,
      configurable: true
    });


    TextContent.prototype._writeTextRun = function (textRun) {
      var textRunData = this.textRunData;

      textRunData.writeInt(textRun.beginIndex);
      textRunData.writeInt(textRun.endIndex);

      var textFormat = textRun.textFormat;

      var size = +textFormat.size;
      textRunData.writeInt(size);

      var font = flash.text.Font.getByName(textFormat.font) || flash.text.Font.getDefaultFont();
      if (font.fontType === flash.text.FontType.EMBEDDED) {
        textRunData.writeInt(font._id);
      } else {
        textRunData.writeInt(0);
        textRunData.writeUTF(flash.text.Font.resolveFontName(font.fontName));
      }
      textRunData.writeInt(font.ascent * size);
      textRunData.writeInt(font.descent * size);
      textRunData.writeInt(textFormat.leading === null ? font.leading * size : +textFormat.leading);
      var bold;
      var italic;
      if (textFormat.bold === null) {
        bold = font.fontStyle === flash.text.FontStyle.BOLD || font.fontType === flash.text.FontStyle.BOLD_ITALIC;
      } else {
        bold = !!textFormat.bold;
      }
      if (textFormat.italic === null) {
        italic = font.fontStyle === flash.text.FontStyle.ITALIC || font.fontType === flash.text.FontStyle.BOLD_ITALIC;
      } else {
        italic = !!textFormat.italic;
      }
      textRunData.writeBoolean(bold);
      textRunData.writeBoolean(italic);

      textRunData.writeInt(+textFormat.color);
      textRunData.writeInt(flash.text.TextFormatAlign.toNumber(textFormat.align));
      textRunData.writeBoolean(!!textFormat.bullet);

      textRunData.writeInt(+textFormat.indent);

      textRunData.writeInt(+textFormat.kerning);
      textRunData.writeInt(+textFormat.leftMargin);
      textRunData.writeInt(+textFormat.letterSpacing);
      textRunData.writeInt(+textFormat.rightMargin);

      textRunData.writeBoolean(!!textFormat.underline);
    };
    return TextContent;
  })();
  Shumway.TextContent = TextContent;
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
    (function (AS) {
      (function (flash) {
        (function (geom) {
          var Matrix = (function (_super) {
            __extends(Matrix, _super);
            function Matrix(a, b, c, d, tx, ty) {
              if (typeof a === "undefined") { a = 1; }
              if (typeof b === "undefined") { b = 0; }
              if (typeof c === "undefined") { c = 0; }
              if (typeof d === "undefined") { d = 1; }
              if (typeof tx === "undefined") { tx = 0; }
              if (typeof ty === "undefined") { ty = 0; }
              false && _super.call(this);
              this.a = +a;
              this.b = +b;
              this.c = +c;
              this.d = +d;
              this.tx = +tx;
              this.ty = +ty;
            }
            Matrix.FromUntyped = function (obj) {
              return new flash.geom.Matrix(obj.a, obj.b, obj.c, obj.d, obj.tx, obj.ty);
            };

            Matrix.FromDataBuffer = function (input) {
              return new flash.geom.Matrix(input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat());
            };


            Object.defineProperty(Matrix.prototype, "native_a", {
              get: function () {
                return this.a;
              },
              set: function (a) {
                this.a = +a;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Matrix.prototype, "native_b", {
              get: function () {
                return this.b;
              },
              set: function (b) {
                this.b = +b;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Matrix.prototype, "native_c", {
              get: function () {
                return this.c;
              },
              set: function (c) {
                this.c = +c;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Matrix.prototype, "native_d", {
              get: function () {
                return this.d;
              },
              set: function (d) {
                this.d = +d;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Matrix.prototype, "native_tx", {
              get: function () {
                return this.tx;
              },
              set: function (tx) {
                this.tx = +tx;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Matrix.prototype, "native_ty", {
              get: function () {
                return this.ty;
              },
              set: function (ty) {
                this.ty = +ty;
              },
              enumerable: true,
              configurable: true
            });

            Matrix.prototype.Matrix = function (a, b, c, d, tx, ty) {
              if (typeof a === "undefined") { a = 1; }
              if (typeof b === "undefined") { b = 0; }
              if (typeof c === "undefined") { c = 0; }
              if (typeof d === "undefined") { d = 1; }
              if (typeof tx === "undefined") { tx = 0; }
              if (typeof ty === "undefined") { ty = 0; }
              this.a = a;
              this.b = b;
              this.c = c;
              this.d = d;
              this.tx = tx;
              this.ty = ty;
            };

            Matrix.prototype.concat = function (m) {
              var a = this.a * m.a;
              var b = 0.0;
              var c = 0.0;
              var d = this.d * m.d;
              var tx = this.tx * m.a + m.tx;
              var ty = this.ty * m.d + m.ty;

              if (this.b !== 0.0 || this.c !== 0.0 || m.b !== 0.0 || m.c !== 0.0) {
                a += this.b * m.c;
                d += this.c * m.b;
                b += this.a * m.b + this.b * m.d;
                c += this.c * m.a + this.d * m.c;
                tx += this.ty * m.c;
                ty += this.tx * m.b;
              }

              this.a = a;
              this.b = b;
              this.c = c;
              this.d = d;
              this.tx = tx;
              this.ty = ty;
            };

            Matrix.prototype.preMultiply = function (m) {
              this.preMultiplyInto(m, this);
            };

            Matrix.prototype.preMultiplyInto = function (m, target) {
              var a = m.a * this.a;
              var b = 0.0;
              var c = 0.0;
              var d = m.d * this.d;
              var tx = m.tx * this.a + this.tx;
              var ty = m.ty * this.d + this.ty;

              if (m.b !== 0.0 || m.c !== 0.0 || this.b !== 0.0 || this.c !== 0.0) {
                a += m.b * this.c;
                d += m.c * this.b;
                b += m.a * this.b + m.b * this.d;
                c += m.c * this.a + m.d * this.c;
                tx += m.ty * this.c;
                ty += m.tx * this.b;
              }

              target.a = a;
              target.b = b;
              target.c = c;
              target.d = d;
              target.tx = tx;
              target.ty = ty;
            };

            Matrix.prototype.invert = function () {
              this.invertInto(this);
            };

            Matrix.prototype.invertInto = function (target) {
              var b = this.b;
              var c = this.c;
              var tx = this.tx;
              var ty = this.ty;
              if (b === 0 && c === 0) {
                var a = target.a = 1 / this.a;
                var d = target.d = 1 / this.d;
                target.b = target.c = 0;
                target.tx = -a * tx;
                target.ty = -d * ty;
                return;
              }
              var a = this.a;
              var d = this.d;
              var determinant = a * d - b * c;
              if (determinant === 0) {
                target.identity();
                return;
              }

              determinant = 1 / determinant;
              var t = 0;
              t = target.a = d * determinant;
              b = target.b = -b * determinant;
              c = target.c = -c * determinant;
              d = target.d = a * determinant;
              target.tx = -(t * tx + c * ty);
              target.ty = -(b * tx + d * ty);
            };

            Matrix.prototype.identity = function () {
              this.a = this.d = 1;
              this.b = this.c = this.tx = this.ty = 0;
            };

            Matrix.prototype.createBox = function (scaleX, scaleY, rotation, tx, ty) {
              if (typeof rotation === "undefined") { rotation = 0; }
              if (typeof tx === "undefined") { tx = 0; }
              if (typeof ty === "undefined") { ty = 0; }
              if (rotation !== 0) {
                var u = Math.cos(rotation);
                var v = Math.sin(rotation);
                this.a = u * scaleX;
                this.b = v * scaleY;
                this.c = -v * scaleX;
                this.d = u * scaleY;
              } else {
                this.a = scaleX;
                this.b = 0;
                this.c = 0;
                this.d = scaleY;
              }
              this.tx = tx;
              this.ty = ty;
            };

            Matrix.prototype.createGradientBox = function (width, height, rotation, tx, ty) {
              if (typeof rotation === "undefined") { rotation = 0; }
              if (typeof tx === "undefined") { tx = 0; }
              if (typeof ty === "undefined") { ty = 0; }
              this.createBox(width / 1638.4, height / 1638.4, rotation, tx + width / 2, ty + height / 2);
            };

            Matrix.prototype.rotate = function (angle) {
              angle = +angle;
              if (angle !== 0) {
                var u = Math.cos(angle);
                var v = Math.sin(angle);
                var ta = this.a;
                var tb = this.b;
                var tc = this.c;
                var td = this.d;
                var ttx = this.tx;
                var tty = this.ty;
                this.a = ta * u - tb * v;
                this.b = ta * v + tb * u;
                this.c = tc * u - td * v;
                this.d = tc * v + td * u;
                this.tx = ttx * u - tty * v;
                this.ty = ttx * v + tty * u;
              }
            };

            Matrix.prototype.translate = function (dx, dy) {
              this.tx += dx;
              this.ty += dy;
            };

            Matrix.prototype.scale = function (sx, sy) {
              if (sx !== 1) {
                this.a *= sx;
                this.c *= sx;
                this.tx *= sx;
              }
              if (sy !== 1) {
                this.b *= sy;
                this.d *= sy;
                this.ty *= sy;
              }
            };

            Matrix.prototype.deltaTransformPoint = function (point) {
              return new geom.Point(this.a * point.x + this.c * point.y, this.b * point.x + this.d * point.y);
            };

            Matrix.prototype.transformX = function (x, y) {
              return this.a * x + this.c * y + this.tx;
            };

            Matrix.prototype.transformY = function (x, y) {
              return this.b * x + this.d * y + this.ty;
            };

            Matrix.prototype.transformPoint = function (point) {
              return new geom.Point(this.a * point.x + this.c * point.y + this.tx, this.b * point.x + this.d * point.y + this.ty);
            };

            Matrix.prototype.transformPointInPlace = function (point) {
              point.setTo(this.a * point.x + this.c * point.y + this.tx, this.b * point.x + this.d * point.y + this.ty);
              return point;
            };

            Matrix.prototype.transformBounds = function (bounds) {
              var a = this.a;
              var b = this.b;
              var c = this.c;
              var d = this.d;
              var tx = this.tx;
              var ty = this.ty;

              var x = bounds.xMin;
              var y = bounds.yMin;
              var w = bounds.width;
              var h = bounds.height;

              var x0 = Math.round(a * x + c * y + tx);
              var y0 = Math.round(b * x + d * y + ty);
              var x1 = Math.round(a * (x + w) + c * y + tx);
              var y1 = Math.round(b * (x + w) + d * y + ty);
              var x2 = Math.round(a * (x + w) + c * (y + h) + tx);
              var y2 = Math.round(b * (x + w) + d * (y + h) + ty);
              var x3 = Math.round(a * x + c * (y + h) + tx);
              var y3 = Math.round(b * x + d * (y + h) + ty);

              var tmp = 0;

              if (x0 > x1) {
                tmp = x0;
                x0 = x1;
                x1 = tmp;
              }
              if (x2 > x3) {
                tmp = x2;
                x2 = x3;
                x3 = tmp;
              }

              bounds.xMin = x0 < x2 ? x0 : x2;
              bounds.xMax = x1 > x3 ? x1 : x3;

              if (y0 > y1) {
                tmp = y0;
                y0 = y1;
                y1 = tmp;
              }
              if (y2 > y3) {
                tmp = y2;
                y2 = y3;
                y3 = tmp;
              }

              bounds.yMin = y0 < y2 ? y0 : y2;
              bounds.yMax = y1 > y3 ? y1 : y3;
            };

            Matrix.prototype.getScaleX = function () {
              if (this.a === 1 && this.b === 0) {
                return 1;
              }
              return Math.sqrt(this.a * this.a + this.b * this.b);
            };

            Matrix.prototype.getScaleY = function () {
              if (this.c === 0 && this.d === 1) {
                return 1;
              }
              var result = Math.sqrt(this.c * this.c + this.d * this.d);
              var det = this.a * this.d - this.b * this.c;
              return det < 0 ? -result : result;
            };

            Matrix.prototype.getAbsoluteScaleX = function () {
              return Math.abs(this.getScaleX());
            };

            Matrix.prototype.getAbsoluteScaleY = function () {
              return Math.abs(this.getScaleY());
            };

            Matrix.prototype.getRotation = function () {
              return Math.atan2(this.b, this.a);
            };

            Matrix.prototype.copyFrom = function (sourceMatrix) {
              this.a = sourceMatrix.a;
              this.b = sourceMatrix.b;
              this.c = sourceMatrix.c;
              this.d = sourceMatrix.d;
              this.tx = sourceMatrix.tx;
              this.ty = sourceMatrix.ty;
            };

            Matrix.prototype.setTo = function (a, b, c, d, tx, ty) {
              this.a = +a;
              this.b = +b;
              this.c = +c;
              this.d = +d;
              this.tx = +tx;
              this.ty = +ty;
            };

            Matrix.prototype.toTwipsInPlace = function () {
              this.tx = (this.tx * 20) | 0;
              this.ty = (this.ty * 20) | 0;
              return this;
            };

            Matrix.prototype.toPixelsInPlace = function () {
              this.tx /= 20;
              this.ty /= 20;
              return this;
            };

            Matrix.prototype.copyRowTo = function (row, vector3D) {
              row = row >>> 0;
              if (row === 0) {
                vector3D.x = this.a;
                vector3D.y = this.c;
                vector3D.z = this.tx;
              } else if (row === 1) {
                vector3D.x = this.b;
                vector3D.y = this.d;
                vector3D.z = this.ty;
              } else if (row === 2) {
                vector3D.x = 0;
                vector3D.y = 0;
                vector3D.z = 1;
              }
            };

            Matrix.prototype.copyColumnTo = function (column, vector3D) {
              column = column >>> 0;
              if (column === 0) {
                vector3D.x = this.a;
                vector3D.y = this.b;
                vector3D.z = 0;
              } else if (column === 1) {
                vector3D.x = this.c;
                vector3D.y = this.d;
                vector3D.z = 0;
              } else if (column === 2) {
                vector3D.x = this.tx;
                vector3D.y = this.ty;
                vector3D.z = 1;
              }
            };

            Matrix.prototype.copyRowFrom = function (row, vector3D) {
              row = row >>> 0;
              if (row === 0) {
                this.a = vector3D.x;
                this.c = vector3D.y;
                this.tx = vector3D.z;
              } else if (row === 1) {
                this.b = vector3D.x;
                this.d = vector3D.y;
                this.ty = vector3D.z;
              }
            };

            Matrix.prototype.copyColumnFrom = function (column, vector3D) {
              column = column >>> 0;
              if (column === 0) {
                this.a = vector3D.x;
                this.c = vector3D.y;
                this.tx = vector3D.z;
              } else if (column === 1) {
                this.b = vector3D.x;
                this.d = vector3D.y;
                this.ty = vector3D.z;
              }
            };

            Matrix.prototype.updateScaleAndRotation = function (scaleX, scaleY, rotation) {
              if (rotation === 0 || rotation === 360) {
                this.a = scaleX;
                this.b = this.c = 0;
                this.d = scaleY;
                return;
              }
              var u = 0, v = 0;
              switch (rotation) {
                case 90:
                case -270:
                  u = 0, v = 1;
                  break;
                case 180:
                case -180:
                  u = -1, v = 0;
                  break;
                case 270:
                case -90:
                  u = 0, v = -1;
                  break;
                default:
                  var angle = rotation / 180 * Math.PI;
                  u = Math.cos(angle);
                  v = Math.sin(angle);
              }
              this.a = u * scaleX;
              this.b = v * scaleX;
              this.c = -v * scaleY;
              this.d = u * scaleY;
            };

            Matrix.prototype.clone = function () {
              return new flash.geom.Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
            };

            Matrix.prototype.equals = function (other) {
              return this.a === other.a && this.b === other.b && this.c === other.c && this.d === other.d && this.tx === other.tx && this.ty === other.ty;
            };

            Matrix.prototype.toString = function () {
              return "(a=" + this.a + ", b=" + this.b + ", c=" + this.c + ", d=" + this.d + ", tx=" + this.tx + ", ty=" + this.ty + ")";
            };

            Matrix.prototype.writeExternal = function (output) {
              output.writeFloat(this.a);
              output.writeFloat(this.b);
              output.writeFloat(this.c);
              output.writeFloat(this.d);
              output.writeFloat(this.tx);
              output.writeFloat(this.ty);
            };
            Matrix.classInitializer = null;

            Matrix.initializer = null;

            Matrix.classSymbols = null;

            Matrix.instanceSymbols = null;

            Matrix.FROZEN_IDENTITY_MATRIX = Object.freeze(new Matrix());

            Matrix.TEMP_MATRIX = new Matrix();
            return Matrix;
          })(AS.ASNative);
          geom.Matrix = Matrix;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (geom) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var precision = 1e-7;

          var transposeTransform = new Uint32Array([
            0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15
          ]);

          function getRotationMatrix(theta, u, v, w, a, b, c) {
            var u2 = u * u, v2 = v * v, w2 = w * w;
            var L2 = u2 + v2 + w2, L = Math.sqrt(L2);
            u /= L;
            v /= L;
            w /= L;
            u2 /= L2;
            v2 /= L2;
            w2 /= L2;
            var cos = Math.cos(theta), sin = Math.sin(theta);

            return new flash.geom.Matrix3D([
              u2 + (v2 + w2) * cos,
              u * v * (1 - cos) + w * sin,
              u * w * (1 - cos) - v * sin,
              0,
              u * v * (1 - cos) - w * sin,
              v2 + (u2 + w2) * cos,
              v * w * (1 - cos) + u * sin,
              0,
              u * w * (1 - cos) + v * sin,
              v * w * (1 - cos) - u * sin,
              w2 + (u2 + v2) * cos,
              0,
              (a * (v2 + w2) - u * (b * v + c * w)) * (1 - cos) + (b * w - c * v) * sin,
              (b * (u2 + w2) - v * (a * u + c * w)) * (1 - cos) + (c * u - a * w) * sin,
              (c * (u2 + v2) - w * (a * u + b * v)) * (1 - cos) + (a * v - b * u) * sin,
              1
            ]);
          }

          var Matrix3D = (function (_super) {
            __extends(Matrix3D, _super);
            function Matrix3D(v) {
              if (typeof v === "undefined") { v = null; }
              false && _super.call(this);
              this._matrix = new Float32Array(16);
              if (v && v.length >= 16) {
                this.copyRawDataFrom(v, 0, false);
              } else {
                this.identity();
              }
            }
            Matrix3D.interpolate = function (thisMat, toMat, percent) {
              thisMat = thisMat;
              toMat = toMat;
              percent = +percent;
              notImplemented("public flash.geom.Matrix3D::static interpolate");
              return;
            };

            Object.defineProperty(Matrix3D.prototype, "rawData", {
              get: function () {
                var result = new AS.Float64Vector();
                this.copyRawDataTo(result, 0, false);
                return result;
              },
              set: function (v) {
                this.copyRawDataFrom(v, 0, false);
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Matrix3D.prototype, "position", {
              get: function () {
                var m = this._matrix;
                return new flash.geom.Vector3D(m[12], m[13], m[14]);
              },
              set: function (pos) {
                var m = this._matrix;
                m[12] = pos.x;
                m[13] = pos.y;
                m[14] = pos.z;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Matrix3D.prototype, "determinant", {
              get: function () {
                var m = this._matrix;
                var m11 = m[0], m12 = m[4], m13 = m[8], m14 = m[12], m21 = m[1], m22 = m[5], m23 = m[9], m24 = m[13], m31 = m[2], m32 = m[6], m33 = m[10], m34 = m[14], m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];
                var d;
                d = m11 * (m22 * (m33 * m44 - m43 * m34) - m32 * (m23 * m44 - m43 * m24) + m42 * (m23 * m34 - m33 * m24)) - m21 * (m12 * (m33 * m44 - m43 * m34) - m32 * (m13 * m44 - m43 * m14) + m42 * (m13 * m34 - m33 * m14)) + m31 * (m12 * (m23 * m44 - m43 * m24) - m22 * (m13 * m44 - m43 * m14) + m42 * (m13 * m24 - m23 * m14)) - m41 * (m12 * (m23 * m34 - m33 * m24) - m22 * (m13 * m34 - m33 * m14) + m32 * (m13 * m24 - m23 * m14));
                return d;
              },
              enumerable: true,
              configurable: true
            });
            Matrix3D.prototype.clone = function () {
              return new flash.geom.Matrix3D(this._matrix);
            };
            Matrix3D.prototype.copyToMatrix3D = function (dest) {
              dest = dest;
              dest._matrix.set(this._matrix);
            };
            Matrix3D.prototype.append = function (lhs) {
              var ma = lhs._matrix, mb = this._matrix, m = this._matrix;
              var ma11 = ma[0], ma12 = ma[4], ma13 = ma[8], ma14 = ma[12], ma21 = ma[1], ma22 = ma[5], ma23 = ma[9], ma24 = ma[13], ma31 = ma[2], ma32 = ma[6], ma33 = ma[10], ma34 = ma[14], ma41 = ma[3], ma42 = ma[7], ma43 = ma[11], ma44 = ma[15];

              var mb11 = mb[0], mb12 = mb[4], mb13 = mb[8], mb14 = mb[12], mb21 = mb[1], mb22 = mb[5], mb23 = mb[9], mb24 = mb[13], mb31 = mb[2], mb32 = mb[6], mb33 = mb[10], mb34 = mb[14], mb41 = mb[3], mb42 = mb[7], mb43 = mb[11], mb44 = mb[15];

              m[0] = ma11 * mb11 + ma12 * mb21 + ma13 * mb31 + ma14 * mb41;
              m[1] = ma21 * mb11 + ma22 * mb21 + ma23 * mb31 + ma24 * mb41;
              m[2] = ma31 * mb11 + ma32 * mb21 + ma33 * mb31 + ma34 * mb41;
              m[3] = ma41 * mb11 + ma42 * mb21 + ma43 * mb31 + ma44 * mb41;

              m[4] = ma11 * mb12 + ma12 * mb22 + ma13 * mb32 + ma14 * mb42;
              m[5] = ma21 * mb12 + ma22 * mb22 + ma23 * mb32 + ma24 * mb42;
              m[6] = ma31 * mb12 + ma32 * mb22 + ma33 * mb32 + ma34 * mb42;
              m[7] = ma41 * mb12 + ma42 * mb22 + ma43 * mb32 + ma44 * mb42;

              m[8] = ma11 * mb13 + ma12 * mb23 + ma13 * mb33 + ma14 * mb43;
              m[9] = ma21 * mb13 + ma22 * mb23 + ma23 * mb33 + ma24 * mb43;
              m[10] = ma31 * mb13 + ma32 * mb23 + ma33 * mb33 + ma34 * mb43;
              m[11] = ma41 * mb13 + ma42 * mb23 + ma43 * mb33 + ma44 * mb43;

              m[12] = ma11 * mb14 + ma12 * mb24 + ma13 * mb34 + ma14 * mb44;
              m[13] = ma21 * mb14 + ma22 * mb24 + ma23 * mb34 + ma24 * mb44;
              m[14] = ma31 * mb14 + ma32 * mb24 + ma33 * mb34 + ma34 * mb44;
              m[15] = ma41 * mb14 + ma42 * mb24 + ma43 * mb34 + ma44 * mb44;
            };
            Matrix3D.prototype.prepend = function (rhs) {
              var ma = this._matrix, mb = rhs._matrix, m = this._matrix;
              var ma11 = ma[0], ma12 = ma[4], ma13 = ma[8], ma14 = ma[12], ma21 = ma[1], ma22 = ma[5], ma23 = ma[9], ma24 = ma[13], ma31 = ma[2], ma32 = ma[6], ma33 = ma[10], ma34 = ma[14], ma41 = ma[3], ma42 = ma[7], ma43 = ma[11], ma44 = ma[15];
              var mb11 = mb[0], mb12 = mb[4], mb13 = mb[8], mb14 = mb[12], mb21 = mb[1], mb22 = mb[5], mb23 = mb[9], mb24 = mb[13], mb31 = mb[2], mb32 = mb[6], mb33 = mb[10], mb34 = mb[14], mb41 = mb[3], mb42 = mb[7], mb43 = mb[11], mb44 = mb[15];

              m[0] = ma11 * mb11 + ma12 * mb21 + ma13 * mb31 + ma14 * mb41;
              m[1] = ma21 * mb11 + ma22 * mb21 + ma23 * mb31 + ma24 * mb41;
              m[2] = ma31 * mb11 + ma32 * mb21 + ma33 * mb31 + ma34 * mb41;
              m[3] = ma41 * mb11 + ma42 * mb21 + ma43 * mb31 + ma44 * mb41;

              m[4] = ma11 * mb12 + ma12 * mb22 + ma13 * mb32 + ma14 * mb42;
              m[5] = ma21 * mb12 + ma22 * mb22 + ma23 * mb32 + ma24 * mb42;
              m[6] = ma31 * mb12 + ma32 * mb22 + ma33 * mb32 + ma34 * mb42;
              m[7] = ma41 * mb12 + ma42 * mb22 + ma43 * mb32 + ma44 * mb42;

              m[8] = ma11 * mb13 + ma12 * mb23 + ma13 * mb33 + ma14 * mb43;
              m[9] = ma21 * mb13 + ma22 * mb23 + ma23 * mb33 + ma24 * mb43;
              m[10] = ma31 * mb13 + ma32 * mb23 + ma33 * mb33 + ma34 * mb43;
              m[11] = ma41 * mb13 + ma42 * mb23 + ma43 * mb33 + ma44 * mb43;

              m[12] = ma11 * mb14 + ma12 * mb24 + ma13 * mb34 + ma14 * mb44;
              m[13] = ma21 * mb14 + ma22 * mb24 + ma23 * mb34 + ma24 * mb44;
              m[14] = ma31 * mb14 + ma32 * mb24 + ma33 * mb34 + ma34 * mb44;
              m[15] = ma41 * mb14 + ma42 * mb24 + ma43 * mb34 + ma44 * mb44;
            };
            Matrix3D.prototype.invert = function () {
              var d = this.determinant;
              if (Math.abs(d) < precision) {
                return false;
              }

              d = 1 / d;
              var m = this._matrix;

              var m11 = m[0], m12 = m[1], m13 = m[2], m14 = m[3], m21 = m[4], m22 = m[5], m23 = m[6], m24 = m[7], m31 = m[8], m32 = m[9], m33 = m[10], m34 = m[11], m41 = m[12], m42 = m[13], m43 = m[14], m44 = m[15];

              m[0] = d * (m22 * (m33 * m44 - m43 * m34) - m32 * (m23 * m44 - m43 * m24) + m42 * (m23 * m34 - m33 * m24));
              m[1] = -d * (m12 * (m33 * m44 - m43 * m34) - m32 * (m13 * m44 - m43 * m14) + m42 * (m13 * m34 - m33 * m14));
              m[2] = d * (m12 * (m23 * m44 - m43 * m24) - m22 * (m13 * m44 - m43 * m14) + m42 * (m13 * m24 - m23 * m14));
              m[3] = -d * (m12 * (m23 * m34 - m33 * m24) - m22 * (m13 * m34 - m33 * m14) + m32 * (m13 * m24 - m23 * m14));

              m[4] = -d * (m21 * (m33 * m44 - m43 * m34) - m31 * (m23 * m44 - m43 * m24) + m41 * (m23 * m34 - m33 * m24));
              m[5] = d * (m11 * (m33 * m44 - m43 * m34) - m31 * (m13 * m44 - m43 * m14) + m41 * (m13 * m34 - m33 * m14));
              m[6] = -d * (m11 * (m23 * m44 - m43 * m24) - m21 * (m13 * m44 - m43 * m14) + m41 * (m13 * m24 - m23 * m14));
              m[7] = d * (m11 * (m23 * m34 - m33 * m24) - m21 * (m13 * m34 - m33 * m14) + m31 * (m13 * m24 - m23 * m14));

              m[8] = d * (m21 * (m32 * m44 - m42 * m34) - m31 * (m22 * m44 - m42 * m24) + m41 * (m22 * m34 - m32 * m24));
              m[9] = -d * (m11 * (m32 * m44 - m42 * m34) - m31 * (m12 * m44 - m42 * m14) + m41 * (m12 * m34 - m32 * m14));
              m[10] = d * (m11 * (m22 * m44 - m42 * m24) - m21 * (m12 * m44 - m42 * m14) + m41 * (m12 * m24 - m22 * m14));
              m[11] = -d * (m11 * (m22 * m34 - m32 * m24) - m21 * (m12 * m34 - m32 * m14) + m31 * (m12 * m24 - m22 * m14));

              m[12] = -d * (m21 * (m32 * m43 - m42 * m33) - m31 * (m22 * m43 - m42 * m23) + m41 * (m22 * m33 - m32 * m23));
              m[13] = d * (m11 * (m32 * m43 - m42 * m33) - m31 * (m12 * m43 - m42 * m13) + m41 * (m12 * m33 - m32 * m13));
              m[14] = -d * (m11 * (m22 * m43 - m42 * m23) - m21 * (m12 * m43 - m42 * m13) + m41 * (m12 * m23 - m22 * m13));
              m[15] = d * (m11 * (m22 * m33 - m32 * m23) - m21 * (m12 * m33 - m32 * m13) + m31 * (m12 * m23 - m22 * m13));

              return true;
            };
            Matrix3D.prototype.identity = function () {
              var m = this._matrix;
              m[0] = m[5] = m[10] = m[15] = 1;
              m[1] = m[2] = m[3] = m[4] = m[6] = m[7] = m[8] = m[9] = m[11] = m[12] = m[13] = m[14] = 0;
            };
            Matrix3D.prototype.decompose = function (orientationStyle) {
              if (typeof orientationStyle === "undefined") { orientationStyle = "eulerAngles"; }
              orientationStyle = asCoerceString(orientationStyle);
              notImplemented("public flash.geom.Matrix3D::decompose");
              return;
            };
            Matrix3D.prototype.recompose = function (components, orientationStyle) {
              if (typeof orientationStyle === "undefined") { orientationStyle = "eulerAngles"; }
              orientationStyle = asCoerceString(orientationStyle);
              notImplemented("public flash.geom.Matrix3D::recompose");
              return;
            };
            Matrix3D.prototype.appendTranslation = function (x, y, z) {
              x = +x;
              y = +y;
              z = +z;
              var m = this._matrix;
              var m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];

              m[0] += x * m41;
              m[1] += y * m41;
              m[2] += z * m41;

              m[4] += x * m42;
              m[5] += y * m42;
              m[6] += z * m42;

              m[8] += x * m43;
              m[9] += y * m43;
              m[10] += z * m43;

              m[12] += x * m44;
              m[13] += y * m44;
              m[14] += z * m44;
            };
            Matrix3D.prototype.appendRotation = function (degrees, axis, pivotPoint) {
              if (typeof pivotPoint === "undefined") { pivotPoint = null; }
              degrees = +degrees;
              axis = axis;
              pivotPoint = pivotPoint;
              this.append(getRotationMatrix(degrees / 180 * Math.PI, axis.x, axis.y, axis.z, pivotPoint ? pivotPoint.x : 0, pivotPoint ? pivotPoint.y : 0, pivotPoint ? pivotPoint.z : 0));
            };
            Matrix3D.prototype.appendScale = function (xScale, yScale, zScale) {
              xScale = +xScale;
              yScale = +yScale;
              zScale = +zScale;
              var m = this._matrix;

              m[0] *= xScale;
              m[1] *= yScale;
              m[2] *= zScale;

              m[4] *= xScale;
              m[5] *= yScale;
              m[6] *= zScale;

              m[8] *= xScale;
              m[9] *= yScale;
              m[10] *= zScale;

              m[12] *= xScale;
              m[13] *= yScale;
              m[14] *= zScale;
            };
            Matrix3D.prototype.prependTranslation = function (x, y, z) {
              x = +x;
              y = +y;
              z = +z;
              var m = this._matrix;
              var m11 = m[0], m12 = m[4], m13 = m[8], m14 = m[12], m21 = m[1], m22 = m[5], m23 = m[9], m24 = m[13], m31 = m[2], m32 = m[6], m33 = m[10], m34 = m[14], m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];
              m[12] += m11 * x + m12 * y + m13 * z;
              m[13] += m21 * x + m22 * y + m23 * z;
              m[14] += m31 * x + m32 * y + m33 * z;
              m[15] += m41 * x + m42 * y + m43 * z;
            };
            Matrix3D.prototype.prependRotation = function (degrees, axis, pivotPoint) {
              if (typeof pivotPoint === "undefined") { pivotPoint = null; }
              degrees = +degrees;
              axis = axis;
              pivotPoint = pivotPoint;
              this.prepend(getRotationMatrix(degrees / 180 * Math.PI, axis.x, axis.y, axis.z, pivotPoint ? pivotPoint.x : 0, pivotPoint ? pivotPoint.y : 0, pivotPoint ? pivotPoint.z : 0));
            };
            Matrix3D.prototype.prependScale = function (xScale, yScale, zScale) {
              xScale = +xScale;
              yScale = +yScale;
              zScale = +zScale;
              var m = this._matrix;

              m[0] *= xScale;
              m[1] *= xScale;
              m[2] *= xScale;
              m[3] *= xScale;

              m[4] *= yScale;
              m[5] *= yScale;
              m[6] *= yScale;
              m[7] *= yScale;

              m[8] *= zScale;
              m[9] *= zScale;
              m[10] *= zScale;
              m[11] *= zScale;
            };
            Matrix3D.prototype.transformVector = function (v) {
              var m = this._matrix;
              var x = v.x, y = v.y, z = v.z;
              return new flash.geom.Vector3D(m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]);
            };
            Matrix3D.prototype.deltaTransformVector = function (v) {
              var m = this._matrix;
              var x = v.x, y = v.y, z = v.z;
              return new flash.geom.Vector3D(m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z);
            };
            Matrix3D.prototype.transformVectors = function (vin, vout) {
              var m = this._matrix;
              var m11 = m[0], m12 = m[4], m13 = m[8], m14 = m[12], m21 = m[1], m22 = m[5], m23 = m[9], m24 = m[13], m31 = m[2], m32 = m[6], m33 = m[10], m34 = m[14], m41 = m[3], m42 = m[7], m43 = m[11], m44 = m[15];
              for (var i = 0; i < vin.length - 2; i += 3) {
                var x = vin.asGetNumericProperty(i), y = vin.asGetNumericProperty(i + 1), z = vin.asGetNumericProperty(i + 2);
                vout.push(m11 * x + m12 * y + m13 * z + m14);
                vout.push(m21 * x + m22 * y + m23 * z + m24);
                vout.push(m31 * x + m32 * y + m33 * z + m34);
              }
            };
            Matrix3D.prototype.transpose = function () {
              var m = this._matrix;
              var tmp;
              tmp = m[1];
              m[1] = m[4];
              m[4] = tmp;
              tmp = m[2];
              m[2] = m[8];
              m[5] = tmp;
              tmp = m[3];
              m[3] = m[12];
              m[12] = tmp;
              tmp = m[6];
              m[6] = m[9];
              m[9] = tmp;
              tmp = m[7];
              m[7] = m[13];
              m[13] = tmp;
              tmp = m[11];
              m[11] = m[14];
              m[14] = tmp;
            };
            Matrix3D.prototype.pointAt = function (pos, at, up) {
              if (typeof at === "undefined") { at = null; }
              if (typeof up === "undefined") { up = null; }
              pos = pos;
              at = at;
              up = up;
              notImplemented("public flash.geom.Matrix3D::pointAt");
              return;
            };
            Matrix3D.prototype.interpolateTo = function (toMat, percent) {
              toMat = toMat;
              percent = +percent;
              notImplemented("public flash.geom.Matrix3D::interpolateTo");
              return;
            };
            Matrix3D.prototype.copyFrom = function (sourceMatrix3D) {
              sourceMatrix3D = sourceMatrix3D;
              this._matrix.set(sourceMatrix3D._matrix);
            };
            Matrix3D.prototype.copyRawDataTo = function (vector, index, transpose) {
              if (typeof index === "undefined") { index = 0; }
              if (typeof transpose === "undefined") { transpose = false; }
              vector = vector;
              index = index >>> 0;
              transpose = !!transpose;
              var m = this._matrix;
              if (transpose) {
                for (var i = 0, j = index | 0; i < 16; i++, j++) {
                  vector.asSetNumericProperty(j, m[transposeTransform[i]]);
                }
              } else {
                for (var i = 0, j = index | 0; i < 16; i++, j++) {
                  vector.asSetNumericProperty(j, m[i]);
                }
              }
            };
            Matrix3D.prototype.copyRawDataFrom = function (vector, index, transpose) {
              if (typeof index === "undefined") { index = 0; }
              if (typeof transpose === "undefined") { transpose = false; }
              vector = vector;
              index = index >>> 0;
              transpose = !!transpose;
              var m = this._matrix;
              if (transpose) {
                for (var i = 0, j = index | 0; i < 16; i++, j++) {
                  m[transposeTransform[i]] = vector.asGetNumericProperty(j) || 0;
                }
              } else {
                for (var i = 0, j = index | 0; i < 16; i++, j++) {
                  m[i] = vector.asGetNumericProperty(j) || 0;
                }
              }
            };
            Matrix3D.prototype.copyRowTo = function (row, vector3D) {
              row = row >>> 0;
              vector3D = vector3D;
              var offset = row | 0;
              var m = this._matrix;
              vector3D.x = m[offset];
              vector3D.y = m[offset + 4];
              vector3D.z = m[offset + 8];
              vector3D.w = m[offset + 12];
            };
            Matrix3D.prototype.copyColumnTo = function (column, vector3D) {
              column = column >>> 0;
              vector3D = vector3D;
              var offset = column << 2;
              var m = this._matrix;
              vector3D.x = m[offset];
              vector3D.y = m[offset + 1];
              vector3D.z = m[offset + 2];
              vector3D.w = m[offset + 3];
            };
            Matrix3D.prototype.copyRowFrom = function (row, vector3D) {
              row = row >>> 0;
              vector3D = vector3D;
              var offset = row | 0;
              var m = this._matrix;
              m[offset] = vector3D.x;
              m[offset + 4] = vector3D.y;
              m[offset + 8] = vector3D.z;
              m[offset + 12] = vector3D.w;
            };
            Matrix3D.prototype.copyColumnFrom = function (column, vector3D) {
              column = column >>> 0;
              vector3D = vector3D;
              var offset = column << 2;
              var m = this._matrix;
              m[offset] = vector3D.x;
              m[offset + 1] = vector3D.y;
              m[offset + 2] = vector3D.z;
              m[offset + 3] = vector3D.w;
            };
            Matrix3D.classInitializer = null;

            Matrix3D.initializer = null;

            Matrix3D.classSymbols = null;

            Matrix3D.instanceSymbols = null;
            return Matrix3D;
          })(AS.ASNative);
          geom.Matrix3D = Matrix3D;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (geom) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Orientation3D = (function (_super) {
            __extends(Orientation3D, _super);
            function Orientation3D() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.geom.Orientation3D");
            }
            Orientation3D.classInitializer = null;

            Orientation3D.initializer = null;

            Orientation3D.classSymbols = null;

            Orientation3D.instanceSymbols = null;

            Orientation3D.EULER_ANGLES = "eulerAngles";
            Orientation3D.AXIS_ANGLE = "axisAngle";
            Orientation3D.QUATERNION = "quaternion";
            return Orientation3D;
          })(AS.ASNative);
          geom.Orientation3D = Orientation3D;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (geom) {
          var notImplemented = Shumway.Debug.notImplemented;

          var PerspectiveProjection = (function (_super) {
            __extends(PerspectiveProjection, _super);
            function PerspectiveProjection() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.geom.PerspectiveProjection");
            }
            Object.defineProperty(PerspectiveProjection.prototype, "fieldOfView", {
              get: function () {
                notImplemented("public flash.geom.PerspectiveProjection::get fieldOfView");
                return;
              },
              set: function (fieldOfViewAngleInDegrees) {
                fieldOfViewAngleInDegrees = +fieldOfViewAngleInDegrees;
                notImplemented("public flash.geom.PerspectiveProjection::set fieldOfView");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(PerspectiveProjection.prototype, "projectionCenter", {
              get: function () {
                notImplemented("public flash.geom.PerspectiveProjection::get projectionCenter");
                return;
              },
              set: function (p) {
                p = p;
                notImplemented("public flash.geom.PerspectiveProjection::set projectionCenter");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(PerspectiveProjection.prototype, "focalLength", {
              get: function () {
                notImplemented("public flash.geom.PerspectiveProjection::get focalLength");
                return;
              },
              set: function (value) {
                value = +value;
                notImplemented("public flash.geom.PerspectiveProjection::set focalLength");
                return;
              },
              enumerable: true,
              configurable: true
            });
            PerspectiveProjection.prototype.toMatrix3D = function () {
              notImplemented("public flash.geom.PerspectiveProjection::toMatrix3D");
              return;
            };
            PerspectiveProjection.classInitializer = null;

            PerspectiveProjection.initializer = null;

            PerspectiveProjection.classSymbols = null;

            PerspectiveProjection.instanceSymbols = null;
            return PerspectiveProjection;
          })(AS.ASNative);
          geom.PerspectiveProjection = PerspectiveProjection;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (geom) {
          var Point = (function (_super) {
            __extends(Point, _super);
            function Point(x, y) {
              if (typeof x === "undefined") { x = 0; }
              if (typeof y === "undefined") { y = 0; }
              false && _super.call(this);
              this.x = +x;
              this.y = +y;
            }

            Object.defineProperty(Point.prototype, "native_x", {
              get: function () {
                return this.x;
              },
              set: function (x) {
                this.x = x;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Point.prototype, "native_y", {
              get: function () {
                return this.y;
              },
              set: function (y) {
                this.y = y;
              },
              enumerable: true,
              configurable: true
            });

            Point.prototype.Point = function (x, y) {
              if (typeof x === "undefined") { x = 0; }
              if (typeof y === "undefined") { y = 0; }
              this.x = x;
              this.y = y;
            };

            Object.defineProperty(Point.prototype, "length", {
              get: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
              },
              enumerable: true,
              configurable: true
            });

            Point.interpolate = function (p1, p2, f) {
              var f1 = 1 - f;
              return new Point(p1.x * f + p2.x * f1, p1.y * f + p2.y * f1);
            };

            Point.distance = function (p1, p2) {
              var dx = p2.x - p1.x;
              var dy = p2.y - p1.y;
              return (dx === 0) ? Math.abs(dy) : (dy === 0) ? Math.abs(dx) : Math.sqrt(dx * dx + dy * dy);
            };

            Point.polar = function (length, angle) {
              length = +length;
              angle = +angle;
              return new Point(length * Math.cos(angle), length * Math.sin(angle));
            };

            Point.prototype.clone = function () {
              return new Point(this.x, this.y);
            };

            Point.prototype.offset = function (dx, dy) {
              this.x += +dx;
              this.y += +dy;
            };

            Point.prototype.equals = function (toCompare) {
              return this.x === toCompare.x && this.y === toCompare.y;
            };

            Point.prototype.subtract = function (v) {
              return new Point(this.x - v.x, this.y - v.y);
            };

            Point.prototype.add = function (v) {
              return new Point(this.x + v.x, this.y + v.y);
            };

            Point.prototype.normalize = function (thickness) {
              if (this.x !== 0 || this.y !== 0) {
                var relativeThickness = +thickness / this.length;
                this.x *= relativeThickness;
                this.y *= relativeThickness;
              }
            };

            Point.prototype.copyFrom = function (sourcePoint) {
              this.x = sourcePoint.x;
              this.y = sourcePoint.y;
            };

            Point.prototype.setTo = function (x, y) {
              this.x = +x;
              this.y = +y;
            };

            Point.prototype.toTwips = function () {
              this.x = (this.x * 20) | 0;
              this.y = (this.y * 20) | 0;
              return this;
            };

            Point.prototype.toPixels = function () {
              this.x /= 20;
              this.y /= 20;
              return this;
            };

            Point.prototype.round = function () {
              this.x = Math.round(this.x);
              this.y = Math.round(this.y);
              return this;
            };

            Point.prototype.toString = function () {
              return "(x=" + this.x + ", y=" + this.y + ")";
            };
            Point.classInitializer = null;

            Point.initializer = null;

            Point.classSymbols = null;

            Point.instanceSymbols = null;
            return Point;
          })(AS.ASNative);
          geom.Point = Point;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (geom) {
          var Rectangle = (function (_super) {
            __extends(Rectangle, _super);
            function Rectangle(x, y, width, height) {
              if (typeof x === "undefined") { x = 0; }
              if (typeof y === "undefined") { y = 0; }
              if (typeof width === "undefined") { width = 0; }
              if (typeof height === "undefined") { height = 0; }
              false && _super.call(this);
              x = +x;
              y = +y;
              width = +width;
              height = +height;
              this.x = x;
              this.y = y;
              this.width = width;
              this.height = height;
            }
            Rectangle.FromBounds = function (bounds) {
              var xMin = bounds.xMin;
              var yMin = bounds.yMin;
              return new Rectangle(xMin / 20, yMin / 20, (bounds.xMax - xMin) / 20, (bounds.yMax - yMin) / 20);
            };


            Object.defineProperty(Rectangle.prototype, "native_x", {
              get: function () {
                return this.x;
              },
              set: function (x) {
                this.x = x;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "native_y", {
              get: function () {
                return this.y;
              },
              set: function (y) {
                this.y = y;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "native_width", {
              get: function () {
                return this.width;
              },
              set: function (width) {
                this.width = +width;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "native_height", {
              get: function () {
                return this.height;
              },
              set: function (height) {
                this.height = +height;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Rectangle.prototype, "left", {
              get: function () {
                return this.x;
              },
              set: function (value) {
                value = +value;
                this.width += this.x - value;
                this.x = value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "right", {
              get: function () {
                return this.x + this.width;
              },
              set: function (value) {
                value = +value;
                this.width = value - this.x;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "top", {
              get: function () {
                return this.y;
              },
              set: function (value) {
                value = +value;
                this.height += this.y - value;
                this.y = value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "bottom", {
              get: function () {
                return this.y + this.height;
              },
              set: function (value) {
                value = +value;
                this.height = value - this.y;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "topLeft", {
              get: function () {
                return new geom.Point(this.left, this.top);
              },
              set: function (value) {
                this.top = value.y;
                this.left = value.x;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "bottomRight", {
              get: function () {
                return new geom.Point(this.right, this.bottom);
              },
              set: function (value) {
                this.bottom = value.y;
                this.right = value.x;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "size", {
              get: function () {
                return new geom.Point(this.width, this.height);
              },
              set: function (value) {
                this.width = value.x;
                this.height = value.y;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Rectangle.prototype, "area", {
              get: function () {
                return this.width * this.height;
              },
              enumerable: true,
              configurable: true
            });

            Rectangle.prototype.clone = function () {
              return new Rectangle(this.x, this.y, this.width, this.height);
            };

            Rectangle.prototype.isEmpty = function () {
              return this.width <= 0 || this.height <= 0;
            };

            Rectangle.prototype.setEmpty = function () {
              this.x = 0;
              this.y = 0;
              this.width = 0;
              this.height = 0;
            };

            Rectangle.prototype.inflate = function (dx, dy) {
              dx = +dx;
              dy = +dy;
              this.x -= dx;
              this.y -= dy;
              this.width += (dx * 2);
              this.height += (dy * 2);
            };

            Rectangle.prototype.inflatePoint = function (point) {
              this.inflate(point.x, point.y);
            };

            Rectangle.prototype.offset = function (dx, dy) {
              this.x += +dx;
              this.y += +dy;
            };

            Rectangle.prototype.offsetPoint = function (point) {
              this.offset(point.x, point.y);
            };

            Rectangle.prototype.contains = function (x, y) {
              x = +x;
              y = +y;
              return x >= this.x && x < this.right && y >= this.y && y < this.bottom;
            };

            Rectangle.prototype.containsPoint = function (point) {
              return this.contains(point.x, point.y);
            };

            Rectangle.prototype.containsRect = function (rect) {
              var r1 = rect.x + rect.width;
              var b1 = rect.y + rect.height;
              var r2 = this.x + this.width;
              var b2 = this.y + this.height;
              return (rect.x >= this.x) && (rect.x < r2) && (rect.y >= this.y) && (rect.y < b2) && (r1 > this.x) && (r1 <= r2) && (b1 > this.y) && (b1 <= b2);
            };

            Rectangle.prototype.intersection = function (toIntersect) {
              return this.clone().intersectInPlace(toIntersect);
            };

            Rectangle.prototype.intersects = function (toIntersect) {
              return Math.max(this.x, toIntersect.x) <= Math.min(this.right, toIntersect.right) && Math.max(this.y, toIntersect.y) <= Math.min(this.bottom, toIntersect.bottom);
            };

            Rectangle.prototype.intersectInPlace = function (clipRect) {
              var l = Math.max(this.x, clipRect.x);
              var r = Math.min(this.right, clipRect.right);
              if (l <= r) {
                var t = Math.max(this.y, clipRect.y);
                var b = Math.min(this.bottom, clipRect.bottom);
                if (t <= b) {
                  this.setTo(l, t, r - l, b - t);
                  return this;
                }
              }
              this.setEmpty();
              return this;
            };

            Rectangle.prototype.union = function (toUnion) {
              return this.clone().unionInPlace(toUnion);
            };

            Rectangle.prototype.unionInPlace = function (toUnion) {
              if (toUnion.isEmpty()) {
                return;
              }
              if (this.isEmpty()) {
                this.copyFrom(toUnion);
                return;
              }
              var l = Math.min(this.x, toUnion.x);
              var t = Math.min(this.y, toUnion.y);
              this.setTo(l, t, Math.max(this.right, toUnion.right) - l, Math.max(this.bottom, toUnion.bottom) - t);
              return this;
            };

            Rectangle.prototype.equals = function (toCompare) {
              return this.x === toCompare.x && this.y === toCompare.y && this.width === toCompare.width && this.height === toCompare.height;
            };

            Rectangle.prototype.copyFrom = function (sourceRect) {
              this.x = sourceRect.x;
              this.y = sourceRect.y;
              this.width = sourceRect.width;
              this.height = sourceRect.height;
            };

            Rectangle.prototype.setTo = function (x, y, width, height) {
              this.x = +x;
              this.y = +y;
              this.width = +width;
              this.height = +height;
            };

            Rectangle.prototype.toTwips = function () {
              this.x = (this.x * 20) | 0;
              this.y = (this.y * 20) | 0;
              this.width = (this.width * 20) | 0;
              this.height = (this.height * 20) | 0;
              return this;
            };

            Rectangle.prototype.getBaseWidth = function (angle) {
              var u = Math.abs(Math.cos(angle));
              var v = Math.abs(Math.sin(angle));
              return u * this.width + v * this.height;
            };

            Rectangle.prototype.getBaseHeight = function (angle) {
              var u = Math.abs(Math.cos(angle));
              var v = Math.abs(Math.sin(angle));
              return v * this.width + u * this.height;
            };

            Rectangle.prototype.toPixels = function () {
              this.x /= 20;
              this.y /= 20;
              this.width /= 20;
              this.height /= 20;
              return this;
            };

            Rectangle.prototype.snapInPlace = function () {
              var x1 = Math.ceil(this.x + this.width);
              var y1 = Math.ceil(this.y + this.height);
              this.x = Math.floor(this.x);
              this.y = Math.floor(this.y);
              this.width = x1 - this.x;
              this.height = y1 - this.y;
              return this;
            };

            Rectangle.prototype.roundInPlace = function () {
              var x1 = Math.round(this.x + this.width);
              var y1 = Math.round(this.y + this.height);
              this.x = Math.round(this.x);
              this.y = Math.round(this.y);
              this.width = x1 - this.x;
              this.height = y1 - this.y;
              return this;
            };

            Rectangle.prototype.toString = function () {
              return "(x=" + this.x + ", y=" + this.y + ", w=" + this.width + ", h=" + this.height + ")";
            };

            Rectangle.prototype.writeExternal = function (output) {
              output.writeFloat(this.x);
              output.writeFloat(this.y);
              output.writeFloat(this.width);
              output.writeFloat(this.height);
            };

            Rectangle.prototype.readExternal = function (input) {
              this.x = input.readFloat();
              this.y = input.readFloat();
              this.width = input.readFloat();
              this.height = input.readFloat();
            };
            Rectangle.classInitializer = null;

            Rectangle.initializer = null;

            Rectangle.classSymbols = null;

            Rectangle.instanceSymbols = null;
            return Rectangle;
          })(AS.ASNative);
          geom.Rectangle = Rectangle;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (geom) {
          var notImplemented = Shumway.Debug.notImplemented;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;

          var throwError = Shumway.AVM2.Runtime.throwError;
          var Errors = Shumway.AVM2.Errors;

          var Transform = (function (_super) {
            __extends(Transform, _super);
            function Transform(displayObject) {
              false && _super.call(this);
              if (!displayObject) {
                throwError("ArgumentError", Errors.NullPointerError, "displayObject");
              }
              this._displayObject = displayObject;
            }
            Object.defineProperty(Transform.prototype, "matrix", {
              get: function () {
                return this._displayObject._getMatrix().clone().toPixelsInPlace();
              },
              set: function (value) {
                this._displayObject._setMatrix(value, true);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Transform.prototype, "colorTransform", {
              get: function () {
                return this._displayObject._colorTransform.clone();
              },
              set: function (value) {
                this._displayObject._setColorTransform(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Transform.prototype, "concatenatedMatrix", {
              get: function () {
                var matrix = this._displayObject._getConcatenatedMatrix().clone().toPixelsInPlace();
                if (!this._displayObject._stage) {
                  matrix.scale(5, 5);
                }
                return matrix;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Transform.prototype, "concatenatedColorTransform", {
              get: function () {
                return this._displayObject._getConcatenatedColorTransform();
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Transform.prototype, "pixelBounds", {
              get: function () {
                notImplemented("public flash.geom.Transform::get pixelBounds");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Transform.prototype, "matrix3D", {
              get: function () {
                var m = this._displayObject._matrix3D;
                return m && m.clone();
              },
              set: function (m) {
                if (!(geom.Matrix3D.isType(m))) {
                  throwError('TypeError', Errors.CheckTypeFailedError, m, 'flash.geom.Matrix3D');
                }

                var raw = m.rawData;

                this.matrix = new flash.geom.Matrix(raw.asGetPublicProperty(0), raw.asGetPublicProperty(1), raw.asGetPublicProperty(4), raw.asGetPublicProperty(5), raw.asGetPublicProperty(12), raw.asGetPublicProperty(13));

                somewhatImplemented("public flash.geom.Transform::set matrix3D");
              },
              enumerable: true,
              configurable: true
            });


            Transform.prototype.getRelativeMatrix3D = function (relativeTo) {
              relativeTo = relativeTo;
              notImplemented("public flash.geom.Transform::getRelativeMatrix3D");
              return;
            };

            Object.defineProperty(Transform.prototype, "perspectiveProjection", {
              get: function () {
                notImplemented("public flash.geom.Transform::get perspectiveProjection");
                return;
              },
              set: function (pm) {
                pm = pm;
                notImplemented("public flash.geom.Transform::set perspectiveProjection");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Transform.classInitializer = null;
            Transform.initializer = null;
            Transform.classSymbols = null;
            Transform.instanceSymbols = null;
            return Transform;
          })(AS.ASNative);
          geom.Transform = Transform;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (geom) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Utils3D = (function (_super) {
            __extends(Utils3D, _super);
            function Utils3D() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.geom.Utils3D");
            }
            Utils3D.projectVector = function (m, v) {
              m = m;
              v = v;
              notImplemented("public flash.geom.Utils3D::static projectVector");
              return;
            };
            Utils3D.projectVectors = function (m, verts, projectedVerts, uvts) {
              m = m;
              verts = verts;
              projectedVerts = projectedVerts;
              uvts = uvts;
              notImplemented("public flash.geom.Utils3D::static projectVectors");
              return;
            };
            Utils3D.pointTowards = function (percent, mat, pos, at, up) {
              if (typeof at === "undefined") { at = null; }
              if (typeof up === "undefined") { up = null; }
              percent = +percent;
              mat = mat;
              pos = pos;
              at = at;
              up = up;
              notImplemented("public flash.geom.Utils3D::static pointTowards");
              return;
            };
            Utils3D.classInitializer = null;

            Utils3D.initializer = null;

            Utils3D.classSymbols = null;

            Utils3D.instanceSymbols = null;
            return Utils3D;
          })(AS.ASNative);
          geom.Utils3D = Utils3D;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (geom) {
          var Vector3D = (function (_super) {
            __extends(Vector3D, _super);
            function Vector3D(x, y, z, w) {
              if (typeof x === "undefined") { x = 0; }
              if (typeof y === "undefined") { y = 0; }
              if (typeof z === "undefined") { z = 0; }
              if (typeof w === "undefined") { w = 0; }
              false && _super.call(this);
              this.x = +x;
              this.y = +y;
              this.z = +z;
              this.w = +w;
            }

            Object.defineProperty(Vector3D.prototype, "native_x", {
              get: function () {
                return this.x;
              },
              set: function (x) {
                this.x = x;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Vector3D.prototype, "native_y", {
              get: function () {
                return this.y;
              },
              set: function (y) {
                this.y = y;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Vector3D.prototype, "native_z", {
              get: function () {
                return this.z;
              },
              set: function (z) {
                this.z = z;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Vector3D.prototype, "native_w", {
              get: function () {
                return this.w;
              },
              set: function (w) {
                this.w = w;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Vector3D.prototype, "length", {
              get: function () {
                return Math.sqrt(this.lengthSquared);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Vector3D.prototype, "lengthSquared", {
              get: function () {
                return this.x * this.x + this.y * this.y + this.z * this.z;
              },
              enumerable: true,
              configurable: true
            });

            Vector3D.angleBetween = function (a, b) {
              return Math.acos(a.dotProduct(b) / (a.length * b.length));
            };

            Vector3D.distance = function (pt1, pt2) {
              return pt1.subtract(pt2).length;
            };

            Vector3D.prototype.dotProduct = function (a) {
              return this.x * a.x + this.y * a.y + this.z * a.z;
            };
            Vector3D.prototype.crossProduct = function (a) {
              return new Vector3D(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x, 1.0);
            };
            Vector3D.prototype.normalize = function () {
              var length = this.length;
              if (length !== 0) {
                this.x /= length;
                this.y /= length;
                this.z /= length;
              } else {
                this.x = this.y = this.z = 0;
              }
              return length;
            };
            Vector3D.prototype.scaleBy = function (s) {
              s = +s;
              this.x *= s;
              this.y *= s;
              this.z *= s;
            };
            Vector3D.prototype.incrementBy = function (a) {
              this.x += a.x;
              this.y += a.y;
              this.z += a.z;
            };
            Vector3D.prototype.decrementBy = function (a) {
              this.x -= a.x;
              this.y -= a.y;
              this.z -= a.z;
            };
            Vector3D.prototype.add = function (a) {
              return new Vector3D(this.x + a.x, this.y + a.y, this.z + a.z);
            };
            Vector3D.prototype.subtract = function (a) {
              return new Vector3D(this.x - a.x, this.y - a.y, this.z - a.z);
            };
            Vector3D.prototype.negate = function () {
              this.x = -this.x;
              this.y = -this.y;
              this.z = -this.z;
            };
            Vector3D.prototype.equals = function (toCompare, allFour) {
              return (this.x === toCompare.x) && (this.y === toCompare.y) && (this.z === toCompare.z) && (!allFour || (this.w === toCompare.w));
            };
            Vector3D.prototype.nearEquals = function (toCompare, tolerance, allFour) {
              return (Math.abs(this.x - toCompare.x) < tolerance) && (Math.abs(this.y - toCompare.y) < tolerance) && (Math.abs(this.z - toCompare.z) < tolerance) && (!allFour || (Math.abs(this.w - toCompare.w) < tolerance));
            };
            Vector3D.prototype.project = function () {
              this.x /= this.w;
              this.y /= this.w;
              this.z /= this.w;
            };
            Vector3D.prototype.copyFrom = function (sourceVector3D) {
              this.x = sourceVector3D.x;
              this.y = sourceVector3D.y;
              this.z = sourceVector3D.z;
            };
            Vector3D.prototype.setTo = function (xa, ya, za) {
              this.x = +xa;
              this.y = +ya;
              this.z = +za;
            };
            Vector3D.prototype.clone = function () {
              return new Vector3D(this.x, this.y, this.z, this.w);
            };
            Vector3D.prototype.toString = function () {
              return "Vector3D(" + this.x + ", " + this.y + ", " + this.z + ")";
            };
            Vector3D.classInitializer = null;
            Vector3D.initializer = null;
            Vector3D.classSymbols = null;
            Vector3D.instanceSymbols = null;

            Vector3D.X_AXIS = Object.freeze(new Vector3D(1, 0, 0));
            Vector3D.Y_AXIS = Object.freeze(new Vector3D(0, 1, 0));
            Vector3D.Z_AXIS = Object.freeze(new Vector3D(0, 0, 1));
            return Vector3D;
          })(AS.ASNative);
          geom.Vector3D = Vector3D;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (accessibility) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Accessibility = (function (_super) {
            __extends(Accessibility, _super);
            function Accessibility() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.accessibility.Accessibility");
            }
            Object.defineProperty(Accessibility, "active", {
              get: function () {
                notImplemented("public flash.accessibility.Accessibility::get active");
                return Accessibility._active;
              },
              enumerable: true,
              configurable: true
            });
            Accessibility.sendEvent = function (source, childID, eventType, nonHTML) {
              if (typeof nonHTML === "undefined") { nonHTML = false; }
              source = source;
              childID = childID >>> 0;
              eventType = eventType >>> 0;
              nonHTML = !!nonHTML;
              notImplemented("public flash.accessibility.Accessibility::static sendEvent");
              return;
            };
            Accessibility.updateProperties = function () {
              notImplemented("public flash.accessibility.Accessibility::static updateProperties");
              return;
            };
            Accessibility.classInitializer = null;

            Accessibility.initializer = null;

            Accessibility.classSymbols = null;

            Accessibility.instanceSymbols = null;

            Accessibility._active = false;
            return Accessibility;
          })(AS.ASNative);
          accessibility.Accessibility = Accessibility;
        })(flash.accessibility || (flash.accessibility = {}));
        var accessibility = flash.accessibility;
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
      (function (flash) {
        (function (accessibility) {
          var notImplemented = Shumway.Debug.notImplemented;

          var AccessibilityImplementation = (function (_super) {
            __extends(AccessibilityImplementation, _super);
            function AccessibilityImplementation() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.accessibility.AccessibilityImplementation");
            }
            AccessibilityImplementation.classInitializer = null;

            AccessibilityImplementation.initializer = null;

            AccessibilityImplementation.classSymbols = null;

            AccessibilityImplementation.instanceSymbols = null;
            return AccessibilityImplementation;
          })(AS.ASNative);
          accessibility.AccessibilityImplementation = AccessibilityImplementation;
        })(flash.accessibility || (flash.accessibility = {}));
        var accessibility = flash.accessibility;
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
      (function (flash) {
        (function (accessibility) {
          var AccessibilityProperties = (function (_super) {
            __extends(AccessibilityProperties, _super);
            function AccessibilityProperties() {
              false && _super.call(this);
            }
            AccessibilityProperties.classInitializer = null;

            AccessibilityProperties.initializer = null;

            AccessibilityProperties.classSymbols = null;

            AccessibilityProperties.instanceSymbols = null;
            return AccessibilityProperties;
          })(AS.ASNative);
          accessibility.AccessibilityProperties = AccessibilityProperties;
        })(flash.accessibility || (flash.accessibility = {}));
        var accessibility = flash.accessibility;
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
      (function (flash) {
        (function (events) {
          var assert = Shumway.Debug.assert;

          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var Event = (function (_super) {
            __extends(Event, _super);
            function Event(type, bubbles, cancelable) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              false && _super.call(this);
              this._type = asCoerceString(type);
              this._bubbles = !!bubbles;
              this._cancelable = !!cancelable;

              this._target = null;
              this._currentTarget = null;
              this._eventPhase = events.EventPhase.AT_TARGET;

              this._stopPropagation = false;
              this._stopImmediatePropagation = false;
              this._isDefaultPrevented = false;
            }
            Event.getInstance = function (type, bubbles, cancelable) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              var instance = Event._instances[type];
              if (!instance) {
                instance = new Event(type, bubbles, cancelable);
                Event._instances[type] = instance;
              }
              instance._bubbles = bubbles;
              instance._cancelable = cancelable;
              return instance;
            };

            Event.getBroadcastInstance = function (type, bubbles, cancelable) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              var instance = Event._instances[type];
              if (!instance) {
                instance = new Event(type, bubbles, cancelable);
                Event._instances[type] = instance;

                release || assert(Event.isBroadcastEventType(type));
              }
              instance._isBroadcastEvent = true;
              instance._bubbles = bubbles;
              instance._cancelable = cancelable;
              return instance;
            };

            Event.isBroadcastEventType = function (type) {
              switch (type) {
                case Event.ENTER_FRAME:
                case Event.EXIT_FRAME:
                case Event.FRAME_CONSTRUCTED:
                case Event.RENDER:
                case Event.ACTIVATE:
                case Event.DEACTIVATE:
                  return true;
              }
              return false;
            };

            Object.defineProperty(Event.prototype, "type", {
              get: function () {
                return this._type;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Event.prototype, "bubbles", {
              get: function () {
                return this._bubbles;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Event.prototype, "cancelable", {
              get: function () {
                return this._cancelable;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Event.prototype, "target", {
              get: function () {
                return this._target;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Event.prototype, "currentTarget", {
              get: function () {
                return this._currentTarget;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Event.prototype, "eventPhase", {
              get: function () {
                return this._eventPhase;
              },
              enumerable: true,
              configurable: true
            });

            Event.prototype.stopPropagation = function () {
              this._stopPropagation = true;
            };

            Event.prototype.stopImmediatePropagation = function () {
              this._stopImmediatePropagation = this._stopPropagation = true;
            };

            Event.prototype.preventDefault = function () {
              if (this._cancelable) {
                this._isDefaultPrevented = true;
              }
            };

            Event.prototype.isDefaultPrevented = function () {
              return this._isDefaultPrevented;
            };

            Event.prototype.isBroadcastEvent = function () {
              return !!this._isBroadcastEvent;
            };
            Event.classInitializer = function () {
              Event._instances = Shumway.ObjectUtilities.createMap();
            };

            Event.initializer = null;

            Event.classSymbols = null;
            Event.instanceSymbols = ["clone!"];

            Event.ACTIVATE = "activate";
            Event.ADDED = "added";
            Event.ADDED_TO_STAGE = "addedToStage";
            Event.CANCEL = "cancel";
            Event.CHANGE = "change";
            Event.CLEAR = "clear";
            Event.CLOSE = "close";
            Event.COMPLETE = "complete";
            Event.CONNECT = "connect";
            Event.COPY = "copy";
            Event.CUT = "cut";
            Event.DEACTIVATE = "deactivate";
            Event.ENTER_FRAME = "enterFrame";
            Event.FRAME_CONSTRUCTED = "frameConstructed";
            Event.EXIT_FRAME = "exitFrame";
            Event.FRAME_LABEL = "frameLabel";
            Event.ID3 = "id3";
            Event.INIT = "init";
            Event.MOUSE_LEAVE = "mouseLeave";
            Event.OPEN = "open";
            Event.PASTE = "paste";
            Event.REMOVED = "removed";
            Event.REMOVED_FROM_STAGE = "removedFromStage";
            Event.RENDER = "render";
            Event.RESIZE = "resize";
            Event.SCROLL = "scroll";
            Event.TEXT_INTERACTION_MODE_CHANGE = "textInteractionModeChange";
            Event.SELECT = "select";
            Event.SELECT_ALL = "selectAll";
            Event.SOUND_COMPLETE = "soundComplete";
            Event.TAB_CHILDREN_CHANGE = "tabChildrenChange";
            Event.TAB_ENABLED_CHANGE = "tabEnabledChange";
            Event.TAB_INDEX_CHANGE = "tabIndexChange";
            Event.UNLOAD = "unload";
            Event.FULLSCREEN = "fullScreen";
            Event.CONTEXT3D_CREATE = "context3DCreate";
            Event.TEXTURE_READY = "textureReady";
            Event.VIDEO_FRAME = "videoFrame";
            Event.SUSPEND = "suspend";
            return Event;
          })(AS.ASNative);
          events.Event = Event;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
          var isFunction = Shumway.isFunction;
          var isNullOrUndefined = Shumway.isNullOrUndefined;
          var throwError = Shumway.AVM2.Runtime.throwError;
          var assert = Shumway.Debug.assert;

          var EventListenerEntry = (function () {
            function EventListenerEntry(listener, useCapture, priority) {
              this.listener = listener;
              this.useCapture = useCapture;
              this.priority = priority;
            }
            return EventListenerEntry;
          })();

          var EventListenerList = (function () {
            function EventListenerList() {
              this._aliasCount = 0;
              this._entries = [];
            }
            EventListenerList.prototype.isEmpty = function () {
              return this._entries.length === 0;
            };

            EventListenerList.prototype.insert = function (listener, useCapture, priority) {
              var entries = this._entries;
              var index = entries.length;
              for (var i = index - 1; i >= 0; i--) {
                var entry = entries[i];
                if (entry.listener === listener) {
                  return;
                }
                if (priority > entry.priority) {
                  index = i;
                } else {
                  break;
                }
              }
              entries = this.ensureNonAliasedEntries();
              entries.splice(index, 0, new EventListenerEntry(listener, useCapture, priority));
            };

            EventListenerList.prototype.ensureNonAliasedEntries = function () {
              var entries = this._entries;
              if (this._aliasCount > 0) {
                entries = this._entries = entries.slice();
                this._aliasCount = 0;
              }
              return entries;
            };

            EventListenerList.prototype.remove = function (listener) {
              var entries = this._entries;
              for (var i = 0; i < entries.length; i++) {
                var item = entries[i];
                if (item.listener === listener) {
                  this.ensureNonAliasedEntries().splice(i, 1);
                  return;
                }
              }
            };

            EventListenerList.prototype.snapshot = function () {
              this._aliasCount++;
              return this._entries;
            };

            EventListenerList.prototype.releaseSnapshot = function (snapshot) {
              if (this._entries !== snapshot) {
                return;
              }
              if (this._aliasCount > 0) {
                this._aliasCount--;
              }
            };
            return EventListenerList;
          })();

          var BroadcastEventDispatchQueue = (function () {
            function BroadcastEventDispatchQueue() {
              this.reset();
            }
            BroadcastEventDispatchQueue.prototype.reset = function () {
              this._queues = Shumway.ObjectUtilities.createEmptyObject();
            };

            BroadcastEventDispatchQueue.prototype.add = function (type, target) {
              release || assert(events.Event.isBroadcastEventType(type), "Can only register broadcast events.");
              var queue = this._queues[type] || (this._queues[type] = []);
              if (queue.indexOf(target) >= 0) {
                return;
              }
              queue.push(target);
            };

            BroadcastEventDispatchQueue.prototype.remove = function (type, target) {
              release || assert(events.Event.isBroadcastEventType(type), "Can only unregister broadcast events.");
              var queue = this._queues[type];
              release || assert(queue, "There should already be a queue for this.");
              var index = queue.indexOf(target);
              release || assert(index >= 0, "Target should be somewhere in this queue.");
              queue[index] = null;
              release || assert(queue.indexOf(target) < 0, "Target shouldn't be in this queue anymore.");
            };

            BroadcastEventDispatchQueue.prototype.dispatchEvent = function (event) {
              release || assert(event.isBroadcastEvent(), "Cannot dispatch non-broadcast events.");
              var queue = this._queues[event.type];
              if (!queue) {
                return;
              }
              var nullCount = 0;
              for (var i = 0; i < queue.length; i++) {
                var target = queue[i];
                if (target === null) {
                  nullCount++;
                } else {
                  target.dispatchEvent(event);
                }
              }

              if (nullCount > 16 && nullCount > (queue.length >> 1)) {
                var compactedQueue = [];
                for (var i = 0; i < queue.length; i++) {
                  if (queue[i]) {
                    compactedQueue.push(queue[i]);
                  }
                }
                this._queues[event.type] = compactedQueue;
              }
            };

            BroadcastEventDispatchQueue.prototype.getQueueLength = function (type) {
              return this._queues[type] ? this._queues[type].length : 0;
            };
            return BroadcastEventDispatchQueue;
          })();
          events.BroadcastEventDispatchQueue = BroadcastEventDispatchQueue;

          var EventDispatcher = (function (_super) {
            __extends(EventDispatcher, _super);
            function EventDispatcher(target) {
              if (typeof target === "undefined") { target = null; }
              false && _super.call(this);
              this._target = target || this;
            }
            EventDispatcher.prototype._getListenersForType = function (useCapture, type) {
              var listeners = useCapture ? this._captureListeners : this._targetOrBubblingListeners;
              if (listeners) {
                return listeners[type];
              }
              return null;
            };

            EventDispatcher.prototype._getListeners = function (useCapture) {
              if (useCapture) {
                return this._captureListeners || (this._captureListeners = createEmptyObject());
              }
              return this._targetOrBubblingListeners || (this._targetOrBubblingListeners = createEmptyObject());
            };

            EventDispatcher.prototype.addEventListener = function (type, listener, useCapture, priority, useWeakReference) {
              if (typeof useCapture === "undefined") { useCapture = false; }
              if (typeof priority === "undefined") { priority = 0; }
              if (typeof useWeakReference === "undefined") { useWeakReference = false; }
              if (arguments.length < 2 || arguments.length > 5) {
                throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError, "flash.events::EventDispatcher/addEventListener()", 2, arguments.length);
              }

              if (!isFunction(listener)) {
                throwError("TypeError", AVM2.Errors.CheckTypeFailedError, listener, "Function");
              }
              if (isNullOrUndefined(type)) {
                throwError("TypeError", AVM2.Errors.NullPointerError, "type");
              }
              type = asCoerceString(type);
              useCapture = !!useCapture;
              priority |= 0;
              useWeakReference = !!useWeakReference;
              var listeners = this._getListeners(useCapture);
              var list = listeners[type] || (listeners[type] = new EventListenerList());
              list.insert(listener, useCapture, priority);

              if (!useCapture && events.Event.isBroadcastEventType(type)) {
                EventDispatcher.broadcastEventDispatchQueue.add(type, this);
              }
            };

            EventDispatcher.prototype.removeEventListener = function (type, listener, useCapture) {
              if (typeof useCapture === "undefined") { useCapture = false; }
              if (arguments.length < 2 || arguments.length > 3) {
                throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError, "flash.events::EventDispatcher/removeEventListener()", 2, arguments.length);
              }

              if (!isFunction(listener)) {
                throwError("TypeError", AVM2.Errors.CheckTypeFailedError, listener, "Function");
              }
              if (isNullOrUndefined(type)) {
                throwError("TypeError", AVM2.Errors.NullPointerError, "type");
              }
              type = asCoerceString(type);
              var listeners = this._getListeners(!!useCapture);
              var list = listeners[type];
              if (list) {
                list.remove(listener);
                if (list.isEmpty()) {
                  if (!useCapture && events.Event.isBroadcastEventType(type)) {
                    EventDispatcher.broadcastEventDispatchQueue.remove(type, this);
                  }
                  listeners[type] = null;
                }
              }
            };

            EventDispatcher.prototype._hasTargetOrBubblingEventListener = function (type) {
              return !!(this._targetOrBubblingListeners && this._targetOrBubblingListeners[type]);
            };

            EventDispatcher.prototype._hasCaptureEventListener = function (type) {
              return !!(this._captureListeners && this._captureListeners[type]);
            };

            EventDispatcher.prototype._hasEventListener = function (type) {
              return this._hasTargetOrBubblingEventListener(type) || this._hasCaptureEventListener(type);
            };

            EventDispatcher.prototype.hasEventListener = function (type) {
              if (arguments.length !== 1) {
                throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError, "flash.events::EventDispatcher/hasEventListener()", 1, arguments.length);
              }
              if (isNullOrUndefined(type)) {
                throwError("TypeError", AVM2.Errors.NullPointerError, "type");
              }
              type = asCoerceString(type);
              return this._hasEventListener(type);
            };

            EventDispatcher.prototype.willTrigger = function (type) {
              if (arguments.length !== 1) {
                throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError, "flash.events::EventDispatcher/hasEventListener()", 1, arguments.length);
              }
              if (isNullOrUndefined(type)) {
                throwError("TypeError", AVM2.Errors.NullPointerError, "type");
              }
              type = asCoerceString(type);
              if (this._hasEventListener(type)) {
                return true;
              }
              if (flash.display.DisplayObject.isType(this)) {
                var node = this._parent;
                do {
                  if (node._hasEventListener(type)) {
                    return true;
                  }
                } while((node = node._parent));
              }
              return false;
            };

            EventDispatcher.prototype._skipDispatchEvent = function (event) {
              if (event.isBroadcastEvent()) {
                return !this._hasEventListener(event.type);
              } else if (flash.display.DisplayObject.isType(this)) {
                var node = this;
                while (node) {
                  if (node._hasEventListener(event.type)) {
                    return false;
                  }
                  node = node._parent;
                }
                return true;
              }
              return !this._hasEventListener(event.type);
            };

            EventDispatcher.prototype.dispatchEvent = function (event) {
              if (this._skipDispatchEvent(event)) {
                return true;
              }

              if (arguments.length !== 1) {
                throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError, "flash.events::EventDispatcher/hasEventListener()", 1, arguments.length);
              }

              release || AVM2.counter.count("EventDispatcher::dispatchEvent");

              var type = event._type;
              var target = this._target;

              release || AVM2.counter.count("EventDispatcher::dispatchEvent(" + type + ")");

              var keepPropagating = true;
              var ancestors = [];

              if (!event.isBroadcastEvent() && flash.display.DisplayObject.isType(this)) {
                var node = this._parent;

                while (node) {
                  if (node._hasEventListener(type)) {
                    ancestors.push(node);
                  }
                  node = node._parent;
                }

                for (var i = ancestors.length - 1; i >= 0 && keepPropagating; i--) {
                  var ancestor = ancestors[i];
                  if (!ancestor._hasCaptureEventListener(type)) {
                    continue;
                  }
                  var list = ancestor._getListenersForType(true, type);
                  release || assert(list);
                  keepPropagating = EventDispatcher.callListeners(list, event, target, ancestor, events.EventPhase.CAPTURING_PHASE);
                }
              }

              if (keepPropagating) {
                var list = this._getListenersForType(false, type);
                if (list) {
                  keepPropagating = EventDispatcher.callListeners(this._getListeners(false)[type], event, target, target, events.EventPhase.AT_TARGET);
                }
              }

              if (!event.isBroadcastEvent() && keepPropagating && event.bubbles) {
                for (var i = 0; i < ancestors.length && keepPropagating; i++) {
                  var ancestor = ancestors[i];
                  if (!ancestor._hasTargetOrBubblingEventListener(type)) {
                    continue;
                  }
                  var list = ancestor._getListenersForType(false, type);
                  keepPropagating = EventDispatcher.callListeners(list, event, target, ancestor, events.EventPhase.BUBBLING_PHASE);
                }
              }

              return !event._isDefaultPrevented;
            };

            EventDispatcher.callListeners = function (list, event, target, currentTarget, eventPhase) {
              if (list.isEmpty()) {
                return true;
              }

              if (event._target) {
                event = event.clone();
              }
              var snapshot = list.snapshot();
              for (var i = 0; i < snapshot.length; i++) {
                var entry = snapshot[i];
                event._target = target;
                event._currentTarget = currentTarget;
                event._eventPhase = eventPhase;
                entry.listener(event);
                if (event._stopImmediatePropagation) {
                  break;
                }
              }
              list.releaseSnapshot(snapshot);
              return !event._stopPropagation;
            };
            EventDispatcher.classInitializer = function () {
              EventDispatcher.broadcastEventDispatchQueue = new BroadcastEventDispatchQueue();
            };

            EventDispatcher.initializer = function () {
              var self = this;

              self._target = this;
              self._captureListeners = null;
              self._targetOrBubblingListeners = null;
            };

            EventDispatcher.classSymbols = null;

            EventDispatcher.instanceSymbols = null;
            return EventDispatcher;
          })(AS.ASNative);
          events.EventDispatcher = EventDispatcher;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var EventPhase = (function (_super) {
            __extends(EventPhase, _super);
            function EventPhase() {
              _super.call(this);
              notImplemented("Dummy Constructor: public flash.events.EventPhase");
            }
            EventPhase.classInitializer = null;
            EventPhase.initializer = null;

            EventPhase.classSymbols = null;
            EventPhase.instanceSymbols = null;

            EventPhase.CAPTURING_PHASE = 1;
            EventPhase.AT_TARGET = 2;
            EventPhase.BUBBLING_PHASE = 3;
            return EventPhase;
          })(AS.ASNative);
          events.EventPhase = EventPhase;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var TextEvent = (function (_super) {
            __extends(TextEvent, _super);
            function TextEvent(type, bubbles, cancelable, text) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof text === "undefined") { text = ""; }
              _super.call(this, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.TextEvent");
            }
            TextEvent.prototype.copyNativeData = function (event) {
              notImplemented("public flash.events.TextEvent::copyNativeData");
            };
            TextEvent.classInitializer = null;
            TextEvent.initializer = null;

            TextEvent.classSymbols = null;
            TextEvent.instanceSymbols = null;

            TextEvent.LINK = "link";
            TextEvent.TEXT_INPUT = "textInput";
            return TextEvent;
          })(flash.events.Event);
          events.TextEvent = TextEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var ErrorEvent = (function (_super) {
            __extends(ErrorEvent, _super);
            function ErrorEvent(type, bubbles, cancelable, text, id) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof text === "undefined") { text = ""; }
              if (typeof id === "undefined") { id = 0; }
              _super.call(this, undefined, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.ErrorEvent");
            }
            ErrorEvent.classInitializer = null;
            ErrorEvent.initializer = null;

            ErrorEvent.classSymbols = null;
            ErrorEvent.instanceSymbols = null;

            ErrorEvent.ERROR = "error";
            return ErrorEvent;
          })(flash.events.TextEvent);
          events.ErrorEvent = ErrorEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var GameInputEvent = (function (_super) {
            __extends(GameInputEvent, _super);
            function GameInputEvent(type, bubbles, cancelable, device) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof device === "undefined") { device = null; }
              _super.call(this, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.GameInputEvent");
            }
            GameInputEvent.classInitializer = null;
            GameInputEvent.initializer = null;

            GameInputEvent.classSymbols = null;
            GameInputEvent.instanceSymbols = null;

            GameInputEvent.DEVICE_ADDED = "deviceAdded";
            GameInputEvent.DEVICE_REMOVED = "deviceRemoved";
            return GameInputEvent;
          })(flash.events.Event);
          events.GameInputEvent = GameInputEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var GestureEvent = (function (_super) {
            __extends(GestureEvent, _super);
            function GestureEvent(type, bubbles, cancelable, phase, localX, localY, ctrlKey, altKey, shiftKey) {
              if (typeof bubbles === "undefined") { bubbles = true; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof phase === "undefined") { phase = null; }
              if (typeof localX === "undefined") { localX = 0; }
              if (typeof localY === "undefined") { localY = 0; }
              if (typeof ctrlKey === "undefined") { ctrlKey = false; }
              if (typeof altKey === "undefined") { altKey = false; }
              if (typeof shiftKey === "undefined") { shiftKey = false; }
              false && _super.call(this, undefined, undefined, undefined);
              events.Event.instanceConstructorNoInitialize.call(this);
              this._phase = asCoerceString(phase);
              this._localX = +localX;
              this._localY = +localY;
              this._ctrlKey = !!ctrlKey;
              this._altKey = !!altKey;
              this._shiftKey = !!shiftKey;
            }
            Object.defineProperty(GestureEvent.prototype, "localX", {
              get: function () {
                return this._localX;
              },
              set: function (value) {
                this._localX = +value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(GestureEvent.prototype, "localY", {
              get: function () {
                return this._localY;
              },
              set: function (value) {
                this._localY = +value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(GestureEvent.prototype, "stageX", {
              get: function () {
                somewhatImplemented("public flash.events.GestureEvent::stageX");
                return 0;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GestureEvent.prototype, "stageY", {
              get: function () {
                somewhatImplemented("public flash.events.GestureEvent::stageY");
                return 0;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GestureEvent.prototype, "ctrlKey", {
              get: function () {
                return this._ctrlKey;
              },
              set: function (value) {
                this._ctrlKey = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GestureEvent.prototype, "altKey", {
              get: function () {
                return this._altKey;
              },
              set: function (value) {
                this._altKey = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GestureEvent.prototype, "shiftKey", {
              get: function () {
                return this._shiftKey;
              },
              set: function (value) {
                this._shiftKey = !!value;
              },
              enumerable: true,
              configurable: true
            });


            GestureEvent.prototype.updateAfterEvent = function () {
              somewhatImplemented("public flash.events.GestureEvent::updateAfterEvent");
              return;
            };

            GestureEvent.prototype.NativeCtor = function (phase, localX, localY, ctrlKey, altKey, shiftKey) {
              if (typeof phase === "undefined") { phase = null; }
              if (typeof localX === "undefined") { localX = 0; }
              if (typeof localY === "undefined") { localY = 0; }
              if (typeof ctrlKey === "undefined") { ctrlKey = false; }
              if (typeof altKey === "undefined") { altKey = false; }
              if (typeof shiftKey === "undefined") { shiftKey = false; }
              this._phase = asCoerceString(phase);
              this._localX = +localX;
              this._localY = +localY;
              this._ctrlKey = !!ctrlKey;
              this._altKey = !!altKey;
              this._shiftKey = !!shiftKey;
            };
            GestureEvent.classInitializer = null;
            GestureEvent.initializer = null;

            GestureEvent.classSymbols = null;
            GestureEvent.instanceSymbols = null;

            GestureEvent.GESTURE_TWO_FINGER_TAP = "gestureTwoFingerTap";
            return GestureEvent;
          })(flash.events.Event);
          events.GestureEvent = GestureEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var HTTPStatusEvent = (function (_super) {
            __extends(HTTPStatusEvent, _super);
            function HTTPStatusEvent(type, bubbles, cancelable, status) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof status === "undefined") { status = 0; }
              _super.call(this, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.HTTPStatusEvent");
            }
            HTTPStatusEvent.classInitializer = null;
            HTTPStatusEvent.initializer = null;

            HTTPStatusEvent.classSymbols = null;
            HTTPStatusEvent.instanceSymbols = null;

            HTTPStatusEvent.HTTP_STATUS = "httpStatus";
            HTTPStatusEvent.HTTP_RESPONSE_STATUS = "httpResponseStatus";
            return HTTPStatusEvent;
          })(flash.events.Event);
          events.HTTPStatusEvent = HTTPStatusEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;

          var IOErrorEvent = (function (_super) {
            __extends(IOErrorEvent, _super);
            function IOErrorEvent(type, bubbles, cancelable, text, id) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof text === "undefined") { text = ""; }
              if (typeof id === "undefined") { id = 0; }
              _super.call(this, undefined, undefined, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.IOErrorEvent");
            }
            IOErrorEvent.classInitializer = null;
            IOErrorEvent.initializer = null;

            IOErrorEvent.classSymbols = null;
            IOErrorEvent.instanceSymbols = null;

            IOErrorEvent.IO_ERROR = "ioError";
            IOErrorEvent.NETWORK_ERROR = "networkError";
            IOErrorEvent.DISK_ERROR = "diskError";
            IOErrorEvent.VERIFY_ERROR = "verifyError";
            return IOErrorEvent;
          })(flash.events.ErrorEvent);
          events.IOErrorEvent = IOErrorEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var notImplemented = Shumway.Debug.notImplemented;

          var KeyboardEvent = (function (_super) {
            __extends(KeyboardEvent, _super);
            function KeyboardEvent(type, bubbles, cancelable, charCodeValue, keyCodeValue, keyLocationValue, ctrlKeyValue, altKeyValue, shiftKeyValue) {
              if (typeof bubbles === "undefined") { bubbles = true; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof charCodeValue === "undefined") { charCodeValue = 0; }
              if (typeof keyCodeValue === "undefined") { keyCodeValue = 0; }
              if (typeof keyLocationValue === "undefined") { keyLocationValue = 0; }
              if (typeof ctrlKeyValue === "undefined") { ctrlKeyValue = false; }
              if (typeof altKeyValue === "undefined") { altKeyValue = false; }
              if (typeof shiftKeyValue === "undefined") { shiftKeyValue = false; }
              _super.call(this, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.KeyboardEvent");
            }
            KeyboardEvent.prototype.updateAfterEvent = function () {
              somewhatImplemented("public flash.events.KeyboardEvent::updateAfterEvent");
            };
            KeyboardEvent.classInitializer = null;
            KeyboardEvent.initializer = null;

            KeyboardEvent.classSymbols = null;
            KeyboardEvent.instanceSymbols = null;

            KeyboardEvent.KEY_DOWN = "keyDown";
            KeyboardEvent.KEY_UP = "keyUp";
            return KeyboardEvent;
          })(flash.events.Event);
          events.KeyboardEvent = KeyboardEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var MouseEvent = (function (_super) {
            __extends(MouseEvent, _super);
            function MouseEvent(type, bubbles, cancelable, localX, localY, relatedObject, ctrlKey, altKey, shiftKey, buttonDown, delta) {
              if (typeof bubbles === "undefined") { bubbles = true; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof localX === "undefined") { localX = undefined; }
              if (typeof localY === "undefined") { localY = undefined; }
              if (typeof relatedObject === "undefined") { relatedObject = null; }
              if (typeof ctrlKey === "undefined") { ctrlKey = false; }
              if (typeof altKey === "undefined") { altKey = false; }
              if (typeof shiftKey === "undefined") { shiftKey = false; }
              if (typeof buttonDown === "undefined") { buttonDown = false; }
              if (typeof delta === "undefined") { delta = 0; }
              _super.call(this, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.MouseEvent");
            }
            MouseEvent.typeFromDOMType = function (name) {
              switch (name) {
                case "click":
                  return MouseEvent.CLICK;
                case "dblclick":
                  return MouseEvent.DOUBLE_CLICK;
                case "mousedown":
                  return MouseEvent.MOUSE_DOWN;
                case "mousemove":
                  return MouseEvent.MOUSE_MOVE;

                case "mouseup":
                  return MouseEvent.MOUSE_UP;
                default:
                  notImplemented(name);
              }
            };

            Object.defineProperty(MouseEvent.prototype, "localX", {
              get: function () {
                return (this._localX / 20) | 0;
              },
              set: function (value) {
                this._localX = (value * 20) | 0;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(MouseEvent.prototype, "localY", {
              get: function () {
                return (this._localY / 20) | 0;
              },
              set: function (value) {
                this._localY = (value * 20) | 0;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(MouseEvent.prototype, "movementX", {
              get: function () {
                somewhatImplemented("public flash.events.MouseEvent::set movementX");
                return this._movementX || 0;
              },
              set: function (value) {
                this._movementX = +value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(MouseEvent.prototype, "movementY", {
              get: function () {
                somewhatImplemented("public flash.events.MouseEvent::set movementY");
                return this._movementY || 0;
              },
              set: function (value) {
                this._movementY = +value;
              },
              enumerable: true,
              configurable: true
            });


            MouseEvent.prototype.updateAfterEvent = function () {
              Shumway.AVM2.Runtime.AVM2.instance.globals['Shumway.Player.Utils'].requestRendering();
            };

            MouseEvent.prototype._getGlobalPoint = function () {
              var point = this._position;
              if (!point) {
                point = this._position = new flash.geom.Point();
              }
              if (this.target) {
                point.setTo(this._localX, this._localY);
                var m = this._target._getConcatenatedMatrix();
                m.transformPointInPlace(point);
              } else {
                point.setTo(0, 0);
              }
              return point;
            };

            MouseEvent.prototype.getStageX = function () {
              return (this._getGlobalPoint().x / 20) | 0;
            };

            MouseEvent.prototype.getStageY = function () {
              return (this._getGlobalPoint().y / 20) | 0;
            };
            MouseEvent.classInitializer = null;
            MouseEvent.initializer = null;

            MouseEvent.classSymbols = null;
            MouseEvent.instanceSymbols = ["clone!"];

            MouseEvent.CLICK = "click";
            MouseEvent.DOUBLE_CLICK = "doubleClick";
            MouseEvent.MOUSE_DOWN = "mouseDown";
            MouseEvent.MOUSE_MOVE = "mouseMove";
            MouseEvent.MOUSE_OUT = "mouseOut";
            MouseEvent.MOUSE_OVER = "mouseOver";
            MouseEvent.MOUSE_UP = "mouseUp";
            MouseEvent.RELEASE_OUTSIDE = "releaseOutside";
            MouseEvent.MOUSE_WHEEL = "mouseWheel";
            MouseEvent.ROLL_OUT = "rollOut";
            MouseEvent.ROLL_OVER = "rollOver";
            MouseEvent.MIDDLE_CLICK = "middleClick";
            MouseEvent.MIDDLE_MOUSE_DOWN = "middleMouseDown";
            MouseEvent.MIDDLE_MOUSE_UP = "middleMouseUp";
            MouseEvent.RIGHT_CLICK = "rightClick";
            MouseEvent.RIGHT_MOUSE_DOWN = "rightMouseDown";
            MouseEvent.RIGHT_MOUSE_UP = "rightMouseUp";
            MouseEvent.CONTEXT_MENU = "contextMenu";
            return MouseEvent;
          })(flash.events.Event);
          events.MouseEvent = MouseEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var NetStatusEvent = (function (_super) {
            __extends(NetStatusEvent, _super);
            function NetStatusEvent(type, bubbles, cancelable, info) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof info === "undefined") { info = null; }
              false && _super.call(this, undefined, undefined, undefined);
            }
            NetStatusEvent.classInitializer = null;
            NetStatusEvent.initializer = null;

            NetStatusEvent.classSymbols = null;
            NetStatusEvent.instanceSymbols = null;

            NetStatusEvent.NET_STATUS = "netStatus";
            return NetStatusEvent;
          })(flash.events.Event);
          events.NetStatusEvent = NetStatusEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var ProgressEvent = (function (_super) {
            __extends(ProgressEvent, _super);
            function ProgressEvent(type, bubbles, cancelable, bytesLoaded, bytesTotal) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof bytesLoaded === "undefined") { bytesLoaded = 0; }
              if (typeof bytesTotal === "undefined") { bytesTotal = 0; }
              _super.call(this, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.ProgressEvent");
            }
            ProgressEvent.classInitializer = null;
            ProgressEvent.initializer = null;

            ProgressEvent.classSymbols = null;
            ProgressEvent.instanceSymbols = null;

            ProgressEvent.PROGRESS = "progress";
            ProgressEvent.SOCKET_DATA = "socketData";
            return ProgressEvent;
          })(flash.events.Event);
          events.ProgressEvent = ProgressEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var SecurityErrorEvent = (function (_super) {
            __extends(SecurityErrorEvent, _super);
            function SecurityErrorEvent(type, bubbles, cancelable, text, id) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof text === "undefined") { text = ""; }
              if (typeof id === "undefined") { id = 0; }
              _super.call(this, undefined, undefined, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.SecurityErrorEvent");
            }
            SecurityErrorEvent.classInitializer = null;
            SecurityErrorEvent.initializer = null;

            SecurityErrorEvent.classSymbols = null;
            SecurityErrorEvent.instanceSymbols = null;

            SecurityErrorEvent.SECURITY_ERROR = "securityError";
            return SecurityErrorEvent;
          })(flash.events.ErrorEvent);
          events.SecurityErrorEvent = SecurityErrorEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var TimerEvent = (function (_super) {
            __extends(TimerEvent, _super);
            function TimerEvent(type, bubbles, cancelable) {
              if (typeof bubbles === "undefined") { bubbles = false; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              _super.call(this, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.TimerEvent");
            }
            TimerEvent.prototype.updateAfterEvent = function () {
              notImplemented("public flash.events.TimerEvent::updateAfterEvent");
              return;
            };
            TimerEvent.classInitializer = null;
            TimerEvent.initializer = null;

            TimerEvent.classSymbols = null;
            TimerEvent.instanceSymbols = null;

            TimerEvent.TIMER = "timer";
            TimerEvent.TIMER_COMPLETE = "timerComplete";
            return TimerEvent;
          })(flash.events.Event);
          events.TimerEvent = TimerEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var TouchEvent = (function (_super) {
            __extends(TouchEvent, _super);
            function TouchEvent(type, bubbles, cancelable, touchPointID, isPrimaryTouchPoint, localX, localY, sizeX, sizeY, pressure, relatedObject, ctrlKey, altKey, shiftKey) {
              if (typeof bubbles === "undefined") { bubbles = true; }
              if (typeof cancelable === "undefined") { cancelable = false; }
              if (typeof touchPointID === "undefined") { touchPointID = 0; }
              if (typeof isPrimaryTouchPoint === "undefined") { isPrimaryTouchPoint = false; }
              if (typeof localX === "undefined") { localX = NaN; }
              if (typeof localY === "undefined") { localY = NaN; }
              if (typeof sizeX === "undefined") { sizeX = NaN; }
              if (typeof sizeY === "undefined") { sizeY = NaN; }
              if (typeof pressure === "undefined") { pressure = NaN; }
              if (typeof relatedObject === "undefined") { relatedObject = null; }
              if (typeof ctrlKey === "undefined") { ctrlKey = false; }
              if (typeof altKey === "undefined") { altKey = false; }
              if (typeof shiftKey === "undefined") { shiftKey = false; }
              _super.call(this, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.TouchEvent");
            }
            TouchEvent.prototype.updateAfterEvent = function () {
              notImplemented("public flash.events.TouchEvent::updateAfterEvent");
            };
            TouchEvent.classInitializer = null;
            TouchEvent.initializer = null;

            TouchEvent.classSymbols = null;
            TouchEvent.instanceSymbols = null;

            TouchEvent.TOUCH_BEGIN = "touchBegin";
            TouchEvent.TOUCH_END = "touchEnd";
            TouchEvent.TOUCH_MOVE = "touchMove";
            TouchEvent.TOUCH_OVER = "touchOver";
            TouchEvent.TOUCH_OUT = "touchOut";
            TouchEvent.TOUCH_ROLL_OVER = "touchRollOver";
            TouchEvent.TOUCH_ROLL_OUT = "touchRollOut";
            TouchEvent.TOUCH_TAP = "touchTap";
            TouchEvent.PROXIMITY_BEGIN = "proximityBegin";
            TouchEvent.PROXIMITY_END = "proximityEnd";
            TouchEvent.PROXIMITY_MOVE = "proximityMove";
            TouchEvent.PROXIMITY_OUT = "proximityOut";
            TouchEvent.PROXIMITY_OVER = "proximityOver";
            TouchEvent.PROXIMITY_ROLL_OUT = "proximityRollOut";
            TouchEvent.PROXIMITY_ROLL_OVER = "proximityRollOver";
            return TouchEvent;
          })(flash.events.Event);
          events.TouchEvent = TouchEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var UncaughtErrorEvent = (function (_super) {
            __extends(UncaughtErrorEvent, _super);
            function UncaughtErrorEvent(type, bubbles, cancelable, error_in) {
              if (typeof type === "undefined") { type = "uncaughtError"; }
              if (typeof bubbles === "undefined") { bubbles = true; }
              if (typeof cancelable === "undefined") { cancelable = true; }
              if (typeof error_in === "undefined") { error_in = null; }
              _super.call(this, undefined, undefined, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.events.UncaughtErrorEvent");
            }
            UncaughtErrorEvent.classInitializer = null;
            UncaughtErrorEvent.initializer = null;

            UncaughtErrorEvent.classSymbols = null;
            UncaughtErrorEvent.instanceSymbols = null;

            UncaughtErrorEvent.UNCAUGHT_ERROR = "uncaughtError";
            return UncaughtErrorEvent;
          })(flash.events.ErrorEvent);
          events.UncaughtErrorEvent = UncaughtErrorEvent;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (events) {
          var notImplemented = Shumway.Debug.notImplemented;
          var UncaughtErrorEvents = (function (_super) {
            __extends(UncaughtErrorEvents, _super);
            function UncaughtErrorEvents() {
              _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.events.UncaughtErrorEvents");
            }
            UncaughtErrorEvents.classInitializer = null;
            UncaughtErrorEvents.initializer = null;

            UncaughtErrorEvents.classSymbols = null;
            UncaughtErrorEvents.instanceSymbols = null;
            return UncaughtErrorEvents;
          })(flash.events.EventDispatcher);
          events.UncaughtErrorEvents = UncaughtErrorEvents;
        })(flash.events || (flash.events = {}));
        var events = flash.events;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var isNullOrUndefined = Shumway.isNullOrUndefined;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var throwError = Shumway.AVM2.Runtime.throwError;
          var assert = Shumway.Debug.assert;

          var Bounds = Shumway.Bounds;
          var geom = flash.geom;
          var events = flash.events;

          (function (DisplayObjectFlags) {
            DisplayObjectFlags[DisplayObjectFlags["None"] = 0x0000] = "None";

            DisplayObjectFlags[DisplayObjectFlags["Visible"] = 0x0001] = "Visible";

            DisplayObjectFlags[DisplayObjectFlags["InvalidLineBounds"] = 0x0002] = "InvalidLineBounds";

            DisplayObjectFlags[DisplayObjectFlags["InvalidFillBounds"] = 0x0004] = "InvalidFillBounds";

            DisplayObjectFlags[DisplayObjectFlags["InvalidMatrix"] = 0x0008] = "InvalidMatrix";

            DisplayObjectFlags[DisplayObjectFlags["InvalidInvertedMatrix"] = 0x0010] = "InvalidInvertedMatrix";

            DisplayObjectFlags[DisplayObjectFlags["InvalidConcatenatedMatrix"] = 0x0020] = "InvalidConcatenatedMatrix";

            DisplayObjectFlags[DisplayObjectFlags["InvalidInvertedConcatenatedMatrix"] = 0x0040] = "InvalidInvertedConcatenatedMatrix";

            DisplayObjectFlags[DisplayObjectFlags["InvalidConcatenatedColorTransform"] = 0x0080] = "InvalidConcatenatedColorTransform";

            DisplayObjectFlags[DisplayObjectFlags["Constructed"] = 0x0100] = "Constructed";

            DisplayObjectFlags[DisplayObjectFlags["Destroyed"] = 0x0200] = "Destroyed";

            DisplayObjectFlags[DisplayObjectFlags["OwnedByTimeline"] = 0x0400] = "OwnedByTimeline";

            DisplayObjectFlags[DisplayObjectFlags["AnimatedByTimeline"] = 0x0800] = "AnimatedByTimeline";

            DisplayObjectFlags[DisplayObjectFlags["HasFrameScriptPending"] = 0x1000] = "HasFrameScriptPending";

            DisplayObjectFlags[DisplayObjectFlags["ContainsFrameScriptPendingChildren"] = 0x2000] = "ContainsFrameScriptPendingChildren";

            DisplayObjectFlags[DisplayObjectFlags["CacheAsBitmap"] = 0x4000] = "CacheAsBitmap";

            DisplayObjectFlags[DisplayObjectFlags["DirtyMatrix"] = 0x100000] = "DirtyMatrix";

            DisplayObjectFlags[DisplayObjectFlags["DirtyChildren"] = 0x200000] = "DirtyChildren";

            DisplayObjectFlags[DisplayObjectFlags["DirtyGraphics"] = 0x400000] = "DirtyGraphics";

            DisplayObjectFlags[DisplayObjectFlags["DirtyTextContent"] = 0x800000] = "DirtyTextContent";

            DisplayObjectFlags[DisplayObjectFlags["DirtyBitmapData"] = 0x1000000] = "DirtyBitmapData";

            DisplayObjectFlags[DisplayObjectFlags["DirtyNetStream"] = 0x2000000] = "DirtyNetStream";

            DisplayObjectFlags[DisplayObjectFlags["DirtyColorTransform"] = 0x4000000] = "DirtyColorTransform";

            DisplayObjectFlags[DisplayObjectFlags["DirtyMask"] = 0x8000000] = "DirtyMask";

            DisplayObjectFlags[DisplayObjectFlags["DirtyClipDepth"] = 0x10000000] = "DirtyClipDepth";

            DisplayObjectFlags[DisplayObjectFlags["DirtyMiscellaneousProperties"] = 0x20000000] = "DirtyMiscellaneousProperties";

            DisplayObjectFlags[DisplayObjectFlags["Dirty"] = DisplayObjectFlags.DirtyMatrix | DisplayObjectFlags.DirtyChildren | DisplayObjectFlags.DirtyGraphics | DisplayObjectFlags.DirtyTextContent | DisplayObjectFlags.DirtyBitmapData | DisplayObjectFlags.DirtyNetStream | DisplayObjectFlags.DirtyColorTransform | DisplayObjectFlags.DirtyMask | DisplayObjectFlags.DirtyClipDepth | DisplayObjectFlags.DirtyMiscellaneousProperties] = "Dirty";
          })(display.DisplayObjectFlags || (display.DisplayObjectFlags = {}));
          var DisplayObjectFlags = display.DisplayObjectFlags;

          (function (VisitorFlags) {
            VisitorFlags[VisitorFlags["None"] = 0] = "None";

            VisitorFlags[VisitorFlags["Continue"] = 0] = "Continue";

            VisitorFlags[VisitorFlags["Stop"] = 0x01] = "Stop";

            VisitorFlags[VisitorFlags["Skip"] = 0x02] = "Skip";

            VisitorFlags[VisitorFlags["FrontToBack"] = 0x08] = "FrontToBack";

            VisitorFlags[VisitorFlags["Filter"] = 0x10] = "Filter";
          })(display.VisitorFlags || (display.VisitorFlags = {}));
          var VisitorFlags = display.VisitorFlags;

          

          var DisplayObject = (function (_super) {
            __extends(DisplayObject, _super);
            function DisplayObject() {
              false && _super.call(this, undefined);
              events.EventDispatcher.instanceConstructorNoInitialize.call(this);
              this._addReference();
              this._setFlags(256 /* Constructed */);
            }
            DisplayObject.getNextSyncID = function () {
              return this._syncID++;
            };

            DisplayObject.reset = function () {
              DisplayObject._advancableInstances = new Shumway.WeakList();
            };

            DisplayObject.createAnimatedDisplayObject = function (state, callConstructor) {
              var symbol = state.symbol;
              var symbolClass = symbol.symbolClass;
              var instance;
              if (symbolClass.isSubtypeOf(flash.display.BitmapData)) {
                instance = flash.display.Bitmap.initializeFrom(symbol);
              } else {
                instance = symbolClass.initializeFrom(symbol);
              }
              instance._setFlags(2048 /* AnimatedByTimeline */);
              instance._setFlags(1024 /* OwnedByTimeline */);
              instance._animate(state);
              if (callConstructor) {
                symbolClass.instanceConstructorNoInitialize.call(instance);
              }
              return instance;
            };

            DisplayObject.performFrameNavigation = function (mainLoop, runScripts) {
              if (mainLoop) {
                var timelineData = { instances: 0 };
                DisplayObject._runScripts = runScripts;
                AVM2.enterTimeline("DisplayObject.performFrameNavigation", timelineData);
              } else {
                runScripts = DisplayObject._runScripts;
              }

              assert(DisplayObject._advancableInstances.length < 1024 * 16, "Too many advancable instances.");

              DisplayObject._advancableInstances.forEach(function (value) {
                value._initFrame(mainLoop);
              });

              if (mainLoop && runScripts) {
                DisplayObject._broadcastFrameEvent(events.Event.ENTER_FRAME);
              }

              DisplayObject._advancableInstances.forEach(function (value) {
                value._constructFrame();
              });

              if (runScripts) {
                DisplayObject._broadcastFrameEvent(events.Event.FRAME_CONSTRUCTED);

                DisplayObject._advancableInstances.forEach(function (value) {
                  var container = value;
                  if (!container.parent) {
                    container._enqueueFrameScripts();
                  }
                });
                flash.display.DisplayObject._stage._enqueueFrameScripts();
                display.MovieClip.runFrameScripts();

                DisplayObject._broadcastFrameEvent(events.Event.EXIT_FRAME);
              } else {
                display.MovieClip.reset();
              }
              if (mainLoop) {
                AVM2.leaveTimeline();
                DisplayObject._runScripts = true;
              }
            };

            DisplayObject._broadcastFrameEvent = function (type) {
              var event;
              switch (type) {
                case events.Event.ENTER_FRAME:
                case events.Event.FRAME_CONSTRUCTED:
                case events.Event.EXIT_FRAME:
                case events.Event.RENDER:
                  event = events.Event.getBroadcastInstance(type);
              }
              release || assert(event, "Invalid frame event.");
              events.EventDispatcher.broadcastEventDispatchQueue.dispatchEvent(event);
            };

            DisplayObject.prototype._setInitialName = function () {
              this._name = 'instance' + (flash.display.DisplayObject._instanceID++);
            };

            DisplayObject.prototype._setParent = function (parent, depth) {
              var oldParent = this._parent;
              this._parent = parent;
              this._depth = depth;
              if (parent) {
                this._addReference();
              }
              if (oldParent) {
                this._removeReference();
              }
            };

            DisplayObject.prototype._setFillAndLineBoundsFromWidthAndHeight = function (width, height) {
              this._fillBounds.width = width;
              this._fillBounds.height = height;
              this._lineBounds.width = width;
              this._lineBounds.height = height;
              this._removeFlags(2 /* InvalidLineBounds */ | 4 /* InvalidFillBounds */);
              this._invalidateParentFillAndLineBounds(true, true);
            };

            DisplayObject.prototype._setFillAndLineBoundsFromSymbol = function (symbol) {
              release || assert(symbol.fillBounds || symbol.lineBounds, "Fill or Line bounds are not defined in the symbol.");
              if (symbol.fillBounds) {
                this._fillBounds.copyFrom(symbol.fillBounds);
                this._removeFlags(4 /* InvalidFillBounds */);
              }
              if (symbol.lineBounds) {
                this._lineBounds.copyFrom(symbol.lineBounds);
                this._removeFlags(2 /* InvalidLineBounds */);
              }
              this._invalidateParentFillAndLineBounds(!!symbol.fillBounds, !!symbol.lineBounds);
            };

            DisplayObject.prototype._setFlags = function (flags) {
              this._displayObjectFlags |= flags;
            };

            DisplayObject.prototype._setDirtyFlags = function (flags) {
              this._displayObjectFlags |= flags;
              if (this._parent) {
                this._parent._propagateFlagsUp(2097152 /* DirtyChildren */);
              }
            };

            DisplayObject.prototype._toggleFlags = function (flags, on) {
              if (on) {
                this._displayObjectFlags |= flags;
              } else {
                this._displayObjectFlags &= ~flags;
              }
            };

            DisplayObject.prototype._removeFlags = function (flags) {
              this._displayObjectFlags &= ~flags;
            };

            DisplayObject.prototype._hasFlags = function (flags) {
              return (this._displayObjectFlags & flags) === flags;
            };

            DisplayObject.prototype._hasAnyFlags = function (flags) {
              return !!(this._displayObjectFlags & flags);
            };

            DisplayObject.prototype._propagateFlagsUp = function (flags) {
              if (this._hasFlags(flags)) {
                return;
              }
              this._setFlags(flags);
              var parent = this._parent;
              if (parent) {
                parent._propagateFlagsUp(flags);
              }
            };

            DisplayObject.prototype._propagateFlagsDown = function (flags) {
              this._setFlags(flags);
            };

            DisplayObject.prototype._findNearestAncestor = function (flags, on) {
              var node = this;
              while (node) {
                if (node._hasFlags(flags) === on) {
                  return node;
                }
                node = node._parent;
              }
              return null;
            };

            DisplayObject.prototype._findFurthestAncestorOrSelf = function () {
              var node = this;
              while (node) {
                if (!node._parent) {
                  return node;
                }
                node = node._parent;
              }
            };

            DisplayObject.prototype._isAncestor = function (child) {
              var node = child;
              while (node) {
                if (node === this) {
                  return true;
                }
                node = node._parent;
              }
              return false;
            };

            DisplayObject._clampRotation = function (value) {
              value %= 360;
              if (value > 180) {
                value -= 360;
              } else if (value < -180) {
                value += 360;
              }
              return value;
            };

            DisplayObject._getAncestors = function (node, last) {
              var path = DisplayObject._path;
              path.length = 0;
              while (node && node !== last) {
                path.push(node);
                node = node._parent;
              }
              release || assert(node === last, "Last ancestor is not an ancestor.");
              return path;
            };

            DisplayObject.prototype._getConcatenatedMatrix = function () {
              if (this._hasFlags(32 /* InvalidConcatenatedMatrix */)) {
                if (this._parent) {
                  this._parent._getConcatenatedMatrix().preMultiplyInto(this._getMatrix(), this._concatenatedMatrix);
                } else {
                  this._concatenatedMatrix.copyFrom(this._getMatrix());
                }
                this._removeFlags(32 /* InvalidConcatenatedMatrix */);
              }
              return this._concatenatedMatrix;
            };

            DisplayObject.prototype._getInvertedConcatenatedMatrix = function () {
              if (this._hasFlags(64 /* InvalidInvertedConcatenatedMatrix */)) {
                this._getConcatenatedMatrix().invertInto(this._invertedConcatenatedMatrix);
                this._removeFlags(64 /* InvalidInvertedConcatenatedMatrix */);
              }
              return this._invertedConcatenatedMatrix;
            };

            DisplayObject.prototype._setMatrix = function (matrix, toTwips) {
              if (!toTwips && this._matrix.equals(matrix)) {
                return;
              }
              var m = this._matrix;
              m.copyFrom(matrix);
              if (toTwips) {
                m.toTwipsInPlace();
              }
              this._scaleX = m.getScaleX();
              this._scaleY = m.getScaleY();
              this._rotation = DisplayObject._clampRotation(matrix.getRotation() * 180 / Math.PI);
              this._removeFlags(8 /* InvalidMatrix */);
              this._setFlags(16 /* InvalidInvertedMatrix */);
              this._setDirtyFlags(1048576 /* DirtyMatrix */);
              this._invalidatePosition();
            };

            DisplayObject.prototype._getMatrix = function () {
              if (this._hasFlags(8 /* InvalidMatrix */)) {
                this._matrix.updateScaleAndRotation(this._scaleX, this._scaleY, this._rotation);
                this._removeFlags(8 /* InvalidMatrix */);
              }
              return this._matrix;
            };

            DisplayObject.prototype._getInvertedMatrix = function () {
              if (this._hasFlags(16 /* InvalidInvertedMatrix */)) {
                this._getMatrix().invertInto(this._invertedMatrix);
                this._removeFlags(16 /* InvalidInvertedMatrix */);
              }
              return this._invertedMatrix;
            };

            DisplayObject.prototype._getConcatenatedColorTransform = function () {
              if (!this.stage) {
                return this._colorTransform.clone();
              }

              if (this._hasFlags(128 /* InvalidConcatenatedColorTransform */)) {
                var ancestor = this._findNearestAncestor(128 /* InvalidConcatenatedColorTransform */, false);
                var path = DisplayObject._getAncestors(this, ancestor);
                var i = path.length - 1;
                if (flash.display.Stage.isType(path[i])) {
                  i--;
                }
                var m = ancestor && !flash.display.Stage.isType(ancestor) ? ancestor._concatenatedColorTransform.clone() : new geom.ColorTransform();
                while (i >= 0) {
                  ancestor = path[i--];
                  release || assert(ancestor._hasFlags(128 /* InvalidConcatenatedColorTransform */));
                  m.preMultiply(ancestor._colorTransform);
                  m.convertToFixedPoint();
                  ancestor._concatenatedColorTransform.copyFrom(m);
                  ancestor._removeFlags(128 /* InvalidConcatenatedColorTransform */);
                }
              }
              return this._concatenatedColorTransform;
            };

            DisplayObject.prototype._setColorTransform = function (colorTransform) {
              this._colorTransform.copyFrom(colorTransform);
              this._colorTransform.convertToFixedPoint();
              this._propagateFlagsDown(128 /* InvalidConcatenatedColorTransform */);
              this._setDirtyFlags(67108864 /* DirtyColorTransform */);
            };

            DisplayObject.prototype._invalidateFillAndLineBounds = function (fill, line) {
              this._propagateFlagsUp((line ? 2 /* InvalidLineBounds */ : 0) | (fill ? 4 /* InvalidFillBounds */ : 0));
            };

            DisplayObject.prototype._invalidateParentFillAndLineBounds = function (fill, line) {
              if (this._parent) {
                this._parent._invalidateFillAndLineBounds(fill, line);
              }
            };

            DisplayObject.prototype._getContentBounds = function (includeStrokes) {
              if (typeof includeStrokes === "undefined") { includeStrokes = true; }
              var invalidFlag;
              var bounds;
              if (includeStrokes) {
                invalidFlag = 2 /* InvalidLineBounds */;
                bounds = this._lineBounds;
              } else {
                invalidFlag = 4 /* InvalidFillBounds */;
                bounds = this._fillBounds;
              }
              if (this._hasFlags(invalidFlag)) {
                var graphics = this._getGraphics();
                if (graphics) {
                  bounds.copyFrom(graphics._getContentBounds(includeStrokes));
                } else {
                  bounds.setEmpty();
                }
                if (display.DisplayObjectContainer.isType(this)) {
                  var container = this;
                  var children = container._children;
                  for (var i = 0; i < children.length; i++) {
                    bounds.unionInPlace(children[i]._getTransformedBounds(this, includeStrokes));
                  }
                }
                this._removeFlags(invalidFlag);
              }
              return bounds;
            };

            DisplayObject.prototype._getTransformedBounds = function (targetCoordinateSpace, includeStroke) {
              var bounds = this._getContentBounds(includeStroke).clone();
              if (targetCoordinateSpace === this || bounds.isEmpty()) {
                return bounds;
              }
              var m;
              if (targetCoordinateSpace) {
                m = geom.Matrix.TEMP_MATRIX;
                var invertedTargetMatrix = targetCoordinateSpace._getInvertedConcatenatedMatrix();
                invertedTargetMatrix.preMultiplyInto(this._getConcatenatedMatrix(), m);
              } else {
                m = this._getConcatenatedMatrix();
              }
              m.transformBounds(bounds);
              return bounds;
            };

            DisplayObject.prototype._stopTimelineAnimation = function () {
              this._removeFlags(2048 /* AnimatedByTimeline */);
            };

            DisplayObject.prototype._invalidateMatrix = function () {
              this._setDirtyFlags(1048576 /* DirtyMatrix */);
              this._setFlags(8 /* InvalidMatrix */ | 16 /* InvalidInvertedMatrix */);
              this._invalidatePosition();
            };

            DisplayObject.prototype._invalidatePosition = function () {
              this._propagateFlagsDown(32 /* InvalidConcatenatedMatrix */ | 64 /* InvalidInvertedConcatenatedMatrix */);
              this._invalidateParentFillAndLineBounds(true, true);
            };

            DisplayObject.prototype._animate = function (state) {
              if (state.matrix) {
                this._setMatrix(state.matrix, false);
              }
              if (state.colorTransform) {
                this._setColorTransform(state.colorTransform);
              }
              this._ratio = state.ratio;
              this._name = state.name;

              if (this._clipDepth !== state.clipDepth && state.clipDepth >= 0) {
                this._clipDepth = state.clipDepth;
                this._setDirtyFlags(268435456 /* DirtyClipDepth */);
              }
              this._filters = state.filters;
              if (state.blendMode && state.blendMode !== this._blendMode) {
                this._blendMode = state.blendMode;
                this._setDirtyFlags(536870912 /* DirtyMiscellaneousProperties */);
              }
              if (state.cacheAsBitmap) {
                this._setFlags(16384 /* CacheAsBitmap */);
                this._setDirtyFlags(536870912 /* DirtyMiscellaneousProperties */);
              }
              if (state.visible !== this._hasFlags(1 /* Visible */)) {
                this._toggleFlags(1 /* Visible */, state.visible);
                this._setDirtyFlags(536870912 /* DirtyMiscellaneousProperties */);
              }
            };

            DisplayObject.prototype._propagateEvent = function (event) {
              this.visit(function (node) {
                node.dispatchEvent(event);
                return 0 /* Continue */;
              }, 0 /* None */);
            };

            Object.defineProperty(DisplayObject.prototype, "x", {
              get: function () {
                var value = this._matrix.tx;
                if (this._canHaveTextContent()) {
                  var bounds = this._getContentBounds();
                  value += bounds.xMin;
                }
                return value / 20;
              },
              set: function (value) {
                value = (value * 20) | 0;
                this._stopTimelineAnimation();
                if (this._canHaveTextContent()) {
                  var bounds = this._getContentBounds();
                  value -= bounds.xMin;
                }
                if (value === this._matrix.tx) {
                  return;
                }
                this._matrix.tx = value;
                this._invertedMatrix.tx = -value;
                this._invalidatePosition();
                this._setDirtyFlags(1048576 /* DirtyMatrix */);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "y", {
              get: function () {
                var value = this._matrix.ty;
                if (this._canHaveTextContent()) {
                  var bounds = this._getContentBounds();
                  value += bounds.yMin;
                }
                return value / 20;
              },
              set: function (value) {
                value = (value * 20) | 0;
                this._stopTimelineAnimation();
                if (this._canHaveTextContent()) {
                  var bounds = this._getContentBounds();
                  value -= bounds.yMin;
                }
                if (value === this._matrix.ty) {
                  return;
                }
                this._matrix.ty = value;
                this._invertedMatrix.ty = -value;
                this._invalidatePosition();
                this._setDirtyFlags(1048576 /* DirtyMatrix */);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "scaleX", {
              get: function () {
                return this._scaleX;
              },
              set: function (value) {
                value = +value;
                this._stopTimelineAnimation();
                if (value === this._scaleX) {
                  return;
                }
                this._scaleX = value;
                this._invalidateMatrix();
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "scaleY", {
              get: function () {
                return this._scaleY;
              },
              set: function (value) {
                value = +value;
                this._stopTimelineAnimation();
                if (value === this._scaleY) {
                  return;
                }
                this._scaleY = value;
                this._invalidateMatrix();
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "scaleZ", {
              get: function () {
                return this._scaleZ;
              },
              set: function (value) {
                value = +value;
                notImplemented("public DisplayObject::set scaleZ");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "rotation", {
              get: function () {
                return this._rotation;
              },
              set: function (value) {
                value = +value;
                this._stopTimelineAnimation();
                value = DisplayObject._clampRotation(value);
                if (value === this._rotation) {
                  return;
                }
                this._rotation = value;
                this._invalidateMatrix();
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "rotationX", {
              get: function () {
                return this._rotationX;
              },
              set: function (value) {
                value = +value;
                notImplemented("public DisplayObject::set rotationX");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "rotationY", {
              get: function () {
                return this._rotationY;
              },
              set: function (value) {
                value = +value;
                notImplemented("public DisplayObject::set rotationY");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "rotationZ", {
              get: function () {
                return this._rotationZ;
              },
              set: function (value) {
                value = +value;
                notImplemented("public DisplayObject::set rotationZ");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "width", {
              get: function () {
                var bounds = this._getTransformedBounds(this._parent, true);
                return bounds.width / 20;
              },
              set: function (value) {
                value = (value * 20) | 0;
                this._stopTimelineAnimation();
                if (value < 0) {
                  return;
                }
                var contentBounds = this._getContentBounds(true);
                if (this._canHaveTextContent()) {
                  var bounds = this._getContentBounds();
                  this._setFillAndLineBoundsFromWidthAndHeight(value, contentBounds.height);
                  return;
                }
                var bounds = this._getTransformedBounds(this._parent, true);
                var angle = this._rotation / 180 * Math.PI;
                var baseWidth = contentBounds.getBaseWidth(angle);
                if (!baseWidth) {
                  return;
                }
                var baseHeight = contentBounds.getBaseHeight(angle);
                this._scaleY = bounds.height / baseHeight;
                this._scaleX = value / baseWidth;
                this._invalidateMatrix();
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "height", {
              get: function () {
                var bounds = this._getTransformedBounds(this._parent, true);
                return bounds.height / 20;
              },
              set: function (value) {
                value = (value * 20) | 0;
                this._stopTimelineAnimation();
                if (value < 0) {
                  return;
                }
                var contentBounds = this._getContentBounds(true);
                if (this._canHaveTextContent()) {
                  var bounds = this._getContentBounds();
                  this._setFillAndLineBoundsFromWidthAndHeight(contentBounds.width, value);
                  return;
                }
                var bounds = this._getTransformedBounds(this._parent, true);
                var angle = this._rotation / 180 * Math.PI;
                var baseHeight = contentBounds.getBaseHeight(angle);
                if (!baseHeight) {
                  return;
                }
                var baseWidth = contentBounds.getBaseWidth(angle);
                this._scaleY = value / baseHeight;
                this._scaleX = bounds.width / baseWidth;
                this._invalidateMatrix();
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "mask", {
              get: function () {
                return this._mask;
              },
              set: function (value) {
                this._stopTimelineAnimation();
                if (this._mask === value || value === this) {
                  return;
                }

                if (value && value._maskedObject) {
                  value._maskedObject.mask = null;
                }
                this._mask = value;
                if (value) {
                  value._maskedObject = this;
                }
                this._setDirtyFlags(134217728 /* DirtyMask */);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "transform", {
              get: function () {
                return new flash.geom.Transform(this);
              },
              set: function (value) {
                this._stopTimelineAnimation();
                if (value.matrix3D) {
                  this._matrix3D = value.matrix3D;
                } else {
                  this._setMatrix(value.matrix, true);
                }
                this._setColorTransform(value.colorTransform);
              },
              enumerable: true,
              configurable: true
            });


            DisplayObject.prototype.destroy = function () {
              this._setFlags(512 /* Destroyed */);
            };

            Object.defineProperty(DisplayObject.prototype, "root", {
              get: function () {
                var node = this;
                do {
                  if (node._root === node) {
                    return node;
                  }
                  node = node._parent;
                } while(node);
                return null;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplayObject.prototype, "stage", {
              get: function () {
                var node = this;
                do {
                  if (node._stage === node) {
                    release || assert(flash.display.Stage.isType(node));
                    return node;
                  }
                  node = node._parent;
                } while(node);
                return null;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplayObject.prototype, "name", {
              get: function () {
                return this._name;
              },
              set: function (value) {
                this._name = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "parent", {
              get: function () {
                return this._parent;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplayObject.prototype, "visible", {
              get: function () {
                return this._hasFlags(1 /* Visible */);
              },
              set: function (value) {
                this._stopTimelineAnimation();
                value = !!value;
                if (value === this._hasFlags(1 /* Visible */)) {
                  return;
                }
                this._toggleFlags(1 /* Visible */, value);
                this._setDirtyFlags(536870912 /* DirtyMiscellaneousProperties */);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplayObject.prototype, "alpha", {
              get: function () {
                return this._colorTransform.alphaMultiplier;
              },
              set: function (value) {
                this._stopTimelineAnimation();
                value = +value;
                if (value === this._colorTransform.alphaMultiplier) {
                  return;
                }
                this._colorTransform.alphaMultiplier = value;
                this._colorTransform.convertToFixedPoint();
                this._propagateFlagsDown(128 /* InvalidConcatenatedColorTransform */);
                this._setDirtyFlags(67108864 /* DirtyColorTransform */);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "blendMode", {
              get: function () {
                return this._blendMode;
              },
              set: function (value) {
                this._stopTimelineAnimation();
                value = asCoerceString(value);
                if (value === this._blendMode) {
                  return;
                }
                if (display.BlendMode.toNumber(value) < 0) {
                  throwError("ArgumentError", AVM2.Errors.InvalidEnumError, "blendMode");
                }
                this._blendMode = value;
                this._setDirtyFlags(536870912 /* DirtyMiscellaneousProperties */);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "scale9Grid", {
              get: function () {
                return this._scale9Grid ? flash.geom.Rectangle.FromBounds(this._scale9Grid) : null;
              },
              set: function (innerRectangle) {
                this._stopTimelineAnimation();
                this._scale9Grid = Bounds.FromRectangle(innerRectangle);
                this._setDirtyFlags(536870912 /* DirtyMiscellaneousProperties */);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "cacheAsBitmap", {
              get: function () {
                return this._filters.length > 0 || this._hasFlags(16384 /* CacheAsBitmap */);
              },
              set: function (value) {
                if (this._hasFlags(16384 /* CacheAsBitmap */)) {
                  return;
                }
                this._toggleFlags(16384 /* CacheAsBitmap */, !!value);
                this._setDirtyFlags(536870912 /* DirtyMiscellaneousProperties */);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "filters", {
              get: function () {
                return this._filters ? this._filters.map(function (x) {
                  return x.clone();
                }) : [];
              },
              set: function (value) {
                var changed = false;
                if (isNullOrUndefined(value)) {
                  changed = this.filters.length > 0;
                  this._filters.length = 0;
                } else {
                  this._filters = value.map(function (x) {
                    release || assert(flash.filters.BitmapFilter.isType(x));
                    return x.clone();
                  });
                  changed = true;
                }
                if (changed) {
                  this._setDirtyFlags(536870912 /* DirtyMiscellaneousProperties */);
                }
              },
              enumerable: true,
              configurable: true
            });



            Object.defineProperty(DisplayObject.prototype, "z", {
              get: function () {
                return this._z;
              },
              set: function (value) {
                value = +value;
                this._z = value;
                notImplemented("public DisplayObject::set z");
                return;
              },
              enumerable: true,
              configurable: true
            });


            DisplayObject.prototype.getBounds = function (targetCoordinateSpace) {
              targetCoordinateSpace = targetCoordinateSpace || this;
              return geom.Rectangle.FromBounds(this._getTransformedBounds(targetCoordinateSpace, true));
            };

            DisplayObject.prototype.getRect = function (targetCoordinateSpace) {
              targetCoordinateSpace = targetCoordinateSpace || this;
              return geom.Rectangle.FromBounds(this._getTransformedBounds(targetCoordinateSpace, false));
            };

            DisplayObject.prototype.globalToLocal = function (point) {
              var m = this._getInvertedConcatenatedMatrix();
              var p = m.transformPointInPlace(point.clone().toTwips()).round();
              return p.toPixels();
            };

            DisplayObject.prototype.localToGlobal = function (point) {
              var m = this._getConcatenatedMatrix();
              var p = m.transformPointInPlace(point.clone().toTwips()).round();
              return p.toPixels();
            };

            DisplayObject.prototype.visit = function (visitor, visitorFlags, displayObjectFlags) {
              if (typeof displayObjectFlags === "undefined") { displayObjectFlags = 0 /* None */; }
              var stack;
              var displayObject;
              var displayObjectContainer;
              var frontToBack = visitorFlags & 8 /* FrontToBack */;
              stack = [this];
              while (stack.length > 0) {
                displayObject = stack.pop();
                var flags = 0 /* None */;
                if (visitorFlags & 16 /* Filter */ && !displayObject._hasAnyFlags(displayObjectFlags)) {
                  flags = 2 /* Skip */;
                } else {
                  flags = visitor(displayObject);
                }
                if (flags === 0 /* Continue */) {
                  var children = displayObject._children;
                  if (children) {
                    var length = children.length;
                    for (var i = 0; i < length; i++) {
                      var child = children[frontToBack ? i : length - 1 - i];
                      stack.push(child);
                    }
                  }
                } else if (flags === 1 /* Stop */) {
                  return;
                }
              }
            };

            Object.defineProperty(DisplayObject.prototype, "loaderInfo", {
              get: function () {
                var root = this.root;
                if (root) {
                  release || assert(root._loaderInfo, "No LoaderInfo object found on root.");
                  return root._loaderInfo;
                }
                return null;
              },
              enumerable: true,
              configurable: true
            });

            DisplayObject.prototype._canHaveGraphics = function () {
              return false;
            };

            DisplayObject.prototype._getGraphics = function () {
              return null;
            };

            DisplayObject.prototype._canHaveTextContent = function () {
              return false;
            };

            DisplayObject.prototype._getTextContent = function () {
              return null;
            };

            DisplayObject.prototype._ensureGraphics = function () {
              release || assert(this._canHaveGraphics());
              if (this._graphics) {
                return this._graphics;
              }
              this._graphics = new flash.display.Graphics();
              this._graphics._setParent(this);
              this._invalidateFillAndLineBounds(true, true);
              this._setDirtyFlags(4194304 /* DirtyGraphics */);
              return this._graphics;
            };

            DisplayObject.prototype._setStaticContentFromSymbol = function (symbol) {
              release || assert(!symbol.dynamic);
              if (this._canHaveGraphics()) {
                release || assert(symbol instanceof Shumway.Timeline.ShapeSymbol);
                this._graphics = symbol.graphics;
                this._setDirtyFlags(4194304 /* DirtyGraphics */);
              } else if (flash.text.StaticText.isType(this)) {
                release || assert(symbol instanceof Shumway.Timeline.TextSymbol);
                var textSymbol = symbol;
                this._textContent = textSymbol.textContent;
                this._setDirtyFlags(8388608 /* DirtyTextContent */);
              }
              this._setFillAndLineBoundsFromSymbol(symbol);
            };

            DisplayObject.prototype.hitTestObject = function (other) {
              release || assert(other && DisplayObject.isType(other));
              var a = this, b = other;
              var aBounds = a._getContentBounds(false).clone();
              var bBounds = b._getContentBounds(false).clone();
              a._getConcatenatedMatrix().transformBounds(aBounds);
              b._getConcatenatedMatrix().transformBounds(bBounds);
              return aBounds.intersects(bBounds);
            };

            DisplayObject.prototype.hitTestPoint = function (x, y, shapeFlag, ignoreChildren, ignoreClipping) {
              if (typeof ignoreClipping === "undefined") { ignoreClipping = true; }
              x = +x * 20 | 0;
              y = +y * 20 | 0;
              shapeFlag = !!shapeFlag;
              ignoreChildren = !!ignoreChildren;
              ignoreClipping = !!ignoreClipping;
              var matrix = this._getInvertedConcatenatedMatrix();
              var localX = matrix.transformX(x, y);
              var localY = matrix.transformY(x, y);
              return this._containsPoint(localX, localY, shapeFlag, ignoreChildren, ignoreClipping);
            };

            DisplayObject.prototype._isUnderMouse = function (x, y) {
              var matrix = this._getInvertedConcatenatedMatrix();
              var localX = matrix.transformX(x, y);
              var localY = matrix.transformY(x, y);
              return this._containsPoint(localX, localY, true, false, false);
            };

            DisplayObject.prototype._containsPoint = function (x, y, shapeFlag, ignoreChildren, ignoreClipping) {
              if (!this._getContentBounds().contains(x, y)) {
                return false;
              }
              if (!shapeFlag) {
                return true;
              }
              if (this._mask) {
                var matrix = this._mask._getInvertedMatrix();
                var maskX = matrix.transformX(x, y);
                var maskY = matrix.transformY(x, y);
                if (!this._mask._containsPoint(maskX, maskY, shapeFlag, ignoreChildren, ignoreClipping)) {
                  return false;
                }
              }

              if (!ignoreChildren && display.DisplayObjectContainer.isType(this)) {
                var children = this._children;
                for (var i = 0; i < children.length; i++) {
                  var child = children[i];
                  var matrix = child._getInvertedMatrix();
                  var childX = matrix.transformX(x, y);
                  var childY = matrix.transformY(x, y);
                  var result = child._containsPoint(childX, childY, shapeFlag, ignoreChildren, ignoreClipping);
                  if (!ignoreClipping && child._clipDepth >= 0 && child._parent) {
                    if (!result) {
                      i = child._parent.getClipDepthIndex(child._clipDepth);
                    }
                  } else if (result) {
                    return true;
                  }
                }
              }
              var graphics = this._getGraphics();
              if (graphics) {
                return graphics._containsPoint(x, y, true);
              }
              return false;
            };
            Object.defineProperty(DisplayObject.prototype, "scrollRect", {
              get: function () {
                return this._scrollRect ? this._scrollRect.clone() : null;
              },
              set: function (value) {
                value = value;
                this._scrollRect = value ? value.clone() : null;

                notImplemented("public DisplayObject::set scrollRect");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObject.prototype, "opaqueBackground", {
              get: function () {
                return this._opaqueBackground;
              },
              set: function (value) {
                release || assert(value === null || Shumway.isInteger(value));
                this._opaqueBackground = value;
              },
              enumerable: true,
              configurable: true
            });


            DisplayObject.prototype.findFurthestInteractiveAncestorOrSelf = function () {
              if (!this.visible) {
                return null;
              }
              var find = display.InteractiveObject.isType(this) ? this : this._parent;
              var self = this._parent;
              while (self) {
                if (!self.visible) {
                  return null;
                }
                if (!self.mouseChildren) {
                  find = self;
                }
                self = self._parent;
              }
              return find;
            };

            DisplayObject.prototype._getDistance = function (ancestor) {
              var d = 0;
              var node = this;
              while (node !== ancestor) {
                d++;
                node = node._parent;
              }
              return d;
            };

            DisplayObject.prototype.findNearestCommonAncestor = function (node) {
              if (!node) {
                return null;
              }
              var ancestor = this;
              var d1 = ancestor._getDistance(null);
              var d2 = node._getDistance(null);
              while (d1 > d2) {
                ancestor = ancestor._parent;
                d1--;
              }
              while (d2 > d1) {
                node = node._parent;
                d2--;
              }
              while (ancestor !== node) {
                ancestor = ancestor._parent;
                node = node._parent;
              }
              return ancestor;
            };

            Object.defineProperty(DisplayObject.prototype, "mouseX", {
              get: function () {
                return this.globalToLocal(flash.ui.Mouse._currentPosition).x;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplayObject.prototype, "mouseY", {
              get: function () {
                return this.globalToLocal(flash.ui.Mouse._currentPosition).y;
              },
              enumerable: true,
              configurable: true
            });

            DisplayObject.prototype.debugName = function () {
              return this._id + " [" + this._depth + "]: (" + this._referenceCount + ") " + this;
            };

            DisplayObject.prototype.debugTrace = function (maxDistance, name) {
              if (typeof maxDistance === "undefined") { maxDistance = 1024; }
              if (typeof name === "undefined") { name = ""; }
              var self = this;
              var writer = new Shumway.IndentingWriter();
              this.visit(function (node) {
                var distance = node._getDistance(self);
                if (distance > maxDistance) {
                  return 2 /* Skip */;
                }
                var prefix = name + Shumway.StringUtilities.multiple(" ", distance);
                writer.writeLn(prefix + node.debugName());
                return 0 /* Continue */;
              }, 0 /* None */);
            };

            DisplayObject.prototype._addReference = function () {
              this._referenceCount++;
            };

            DisplayObject.prototype._removeReference = function () {
              this._referenceCount--;
              if (this._referenceCount !== 0 || !this._children) {
                return;
              }
              var children = this._children;
              for (var i = 0; i < children.length; i++) {
                children[i]._removeReference();
              }
            };

            Object.defineProperty(DisplayObject.prototype, "accessibilityProperties", {
              get: function () {
                return this._accessibilityProperties;
              },
              set: function (value) {
                this._accessibilityProperties = value;
              },
              enumerable: true,
              configurable: true
            });

            DisplayObject._syncID = 0;

            DisplayObject._instanceID = 1;

            DisplayObject.classInitializer = function () {
              DisplayObject.reset();
            };

            DisplayObject.initializer = function (symbol) {
              release || AVM2.counter.count("DisplayObject::initializer");

              var self = this;

              self._id = flash.display.DisplayObject.getNextSyncID();
              self._displayObjectFlags = 1 /* Visible */ | 2 /* InvalidLineBounds */ | 4 /* InvalidFillBounds */ | 32 /* InvalidConcatenatedMatrix */ | 64 /* InvalidInvertedConcatenatedMatrix */ | 4194304 /* DirtyGraphics */ | 1048576 /* DirtyMatrix */ | 67108864 /* DirtyColorTransform */ | 134217728 /* DirtyMask */ | 268435456 /* DirtyClipDepth */ | 536870912 /* DirtyMiscellaneousProperties */;

              self._root = null;
              self._stage = null;
              self._setInitialName();
              self._parent = null;
              self._mask = null;

              self._z = 0;
              self._scaleX = 1;
              self._scaleY = 1;
              self._scaleZ = 1;
              self._rotation = 0;
              self._rotationX = 0;
              self._rotationY = 0;
              self._rotationZ = 0;

              self._width = 0;
              self._height = 0;
              self._opaqueBackground = null;
              self._scrollRect = null;
              self._filters = [];
              self._blendMode = display.BlendMode.NORMAL;
              release || assert(self._blendMode);
              self._scale9Grid = null;
              self._loaderInfo = null;
              self._accessibilityProperties = null;

              self._fillBounds = new Bounds(0, 0, 0, 0);
              self._lineBounds = new Bounds(0, 0, 0, 0);
              self._clipDepth = -1;

              self._concatenatedMatrix = new geom.Matrix();
              self._invertedConcatenatedMatrix = new geom.Matrix();
              self._matrix = new geom.Matrix();
              self._invertedMatrix = new geom.Matrix();
              self._matrix3D = null;
              self._colorTransform = new geom.ColorTransform();
              self._concatenatedColorTransform = new geom.ColorTransform();

              self._depth = -1;
              self._ratio = 0;
              self._index = -1;
              self._maskedObject = null;

              self._mouseOver = false;
              self._mouseDown = false;

              self._symbol = null;
              self._graphics = null;
              self._children = null;

              self._referenceCount = 0;

              if (symbol) {
                if (symbol.scale9Grid) {
                  self._scale9Grid = symbol.scale9Grid;
                }
                self._symbol = symbol;
              }
            };

            DisplayObject.classSymbols = null;

            DisplayObject.instanceSymbols = null;

            DisplayObject._runScripts = true;

            DisplayObject._path = [];
            return DisplayObject;
          })(flash.events.EventDispatcher);
          display.DisplayObject = DisplayObject;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var throwError = Shumway.AVM2.Runtime.throwError;
          var Bitmap = (function (_super) {
            __extends(Bitmap, _super);
            function Bitmap(bitmapData, pixelSnapping, smoothing) {
              if (typeof bitmapData === "undefined") { bitmapData = null; }
              if (typeof pixelSnapping === "undefined") { pixelSnapping = "auto"; }
              if (typeof smoothing === "undefined") { smoothing = false; }
              false && _super.call(this);
              display.DisplayObject.instanceConstructorNoInitialize.call(this);
              if (this._symbol) {
                this._bitmapData.class.instanceConstructorNoInitialize.call(this._bitmapData);
              } else {
                this.bitmapData = bitmapData;
              }
              this._pixelSnapping = asCoerceString(pixelSnapping);
              this._smoothing = !!smoothing;
            }
            Object.defineProperty(Bitmap.prototype, "pixelSnapping", {
              get: function () {
                return this._pixelSnapping;
              },
              set: function (value) {
                if (display.PixelSnapping.toNumber(value) < 0) {
                  throwError("ArgumentError", AVM2.Errors.InvalidEnumError, "pixelSnapping");
                }
                this._pixelSnapping = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Bitmap.prototype, "smoothing", {
              get: function () {
                return this._smoothing;
              },
              set: function (value) {
                this._smoothing = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Bitmap.prototype, "bitmapData", {
              get: function () {
                return this._bitmapData;
              },
              set: function (value) {
                if (this._bitmapData !== value) {
                  if (this._bitmapData) {
                    this._bitmapData._removeBitmapReferrer(this);
                  }
                  if (value) {
                    value._addBitmapReferrer(this);
                  }
                }
                this._bitmapData = value;
                if (value) {
                  this._setFillAndLineBoundsFromWidthAndHeight(value.width * 20 | 0, value.height * 20 | 0);
                }
                this._invalidateParentFillAndLineBounds(true, true);
                this._setDirtyFlags(16777216 /* DirtyBitmapData */);
              },
              enumerable: true,
              configurable: true
            });


            Bitmap.prototype._getContentBounds = function (includeStrokes) {
              if (typeof includeStrokes === "undefined") { includeStrokes = true; }
              if (this._bitmapData) {
                return this._bitmapData._getContentBounds();
              }
              return new Shumway.Bounds(0, 0, 0, 0);
            };
            Bitmap.classInitializer = null;

            Bitmap.initializer = function (symbol) {
              var self = this;

              self._bitmapData = null;
              self._pixelSnapping = null;
              self._smoothing = null;

              if (symbol) {
                var symbolClass = symbol.symbolClass;

                if (symbolClass.isSubtypeOf(flash.display.Bitmap)) {
                  symbolClass = flash.display.BitmapData;
                }

                self._bitmapData = symbolClass.initializeFrom(symbol);
                self._setFillAndLineBoundsFromWidthAndHeight(symbol.width * 20 | 0, symbol.height * 20 | 0);
              }
            };

            Bitmap.classSymbols = null;

            Bitmap.instanceSymbols = null;
            return Bitmap;
          })(flash.display.DisplayObject);
          display.Bitmap = Bitmap;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var Shape = (function (_super) {
            __extends(Shape, _super);
            function Shape() {
              false && _super.call(this);
              display.DisplayObject.instanceConstructorNoInitialize.call(this);
            }
            Shape.prototype._canHaveGraphics = function () {
              return true;
            };

            Shape.prototype._getGraphics = function () {
              return this._graphics;
            };

            Object.defineProperty(Shape.prototype, "graphics", {
              get: function () {
                return this._ensureGraphics();
              },
              enumerable: true,
              configurable: true
            });
            Shape.classSymbols = null;
            Shape.instanceSymbols = null;

            Shape.classInitializer = null;
            Shape.initializer = function (symbol) {
              var self = this;
              self._graphics = null;
              if (symbol) {
                this._setStaticContentFromSymbol(symbol);
              }
            };
            return Shape;
          })(flash.display.DisplayObject);
          display.Shape = Shape;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;

          var DisplayObject = flash.display.DisplayObject;

          var events = flash.events;

          var InteractiveObject = (function (_super) {
            __extends(InteractiveObject, _super);
            function InteractiveObject() {
              false && _super.call(this);
              DisplayObject.instanceConstructorNoInitialize.call(this);
            }
            Object.defineProperty(InteractiveObject.prototype, "tabEnabled", {
              get: function () {
                return this._tabEnabled;
              },
              set: function (enabled) {
                enabled = !!enabled;
                var old = this._tabEnabled;
                this._tabEnabled = enabled;
                if (old !== enabled) {
                  this.dispatchEvent(events.Event.getInstance(events.Event.TAB_ENABLED_CHANGE, true));
                }
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(InteractiveObject.prototype, "tabIndex", {
              get: function () {
                return this._tabIndex;
              },
              set: function (index) {
                index = index | 0;
                var old = this._tabIndex;
                this._tabIndex = index;
                if (old !== index) {
                  this.dispatchEvent(events.Event.getInstance(events.Event.TAB_INDEX_CHANGE, true));
                }
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(InteractiveObject.prototype, "focusRect", {
              get: function () {
                return this._focusRect;
              },
              set: function (focusRect) {
                focusRect = focusRect;
                notImplemented("public flash.display.InteractiveObject::set focusRect");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(InteractiveObject.prototype, "mouseEnabled", {
              get: function () {
                return this._mouseEnabled;
              },
              set: function (enabled) {
                this._mouseEnabled = !!enabled;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(InteractiveObject.prototype, "doubleClickEnabled", {
              get: function () {
                return this._doubleClickEnabled;
              },
              set: function (enabled) {
                this._doubleClickEnabled = !!enabled;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(InteractiveObject.prototype, "accessibilityImplementation", {
              get: function () {
                return this._accessibilityImplementation;
              },
              set: function (value) {
                value = value;
                notImplemented("public flash.display.InteractiveObject::set accessibilityImplementation");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(InteractiveObject.prototype, "softKeyboardInputAreaOfInterest", {
              get: function () {
                return this._softKeyboardInputAreaOfInterest;
              },
              set: function (value) {
                value = value;
                notImplemented("public flash.display.InteractiveObject::set softKeyboardInputAreaOfInterest");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(InteractiveObject.prototype, "needsSoftKeyboard", {
              get: function () {
                return this._needsSoftKeyboard;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.display.InteractiveObject::set needsSoftKeyboard");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(InteractiveObject.prototype, "contextMenu", {
              get: function () {
                return this._contextMenu;
              },
              set: function (cm) {
                cm = cm;
                somewhatImplemented("public flash.display.InteractiveObject::set contextMenu");
                this._contextMenu = cm;
              },
              enumerable: true,
              configurable: true
            });


            InteractiveObject.prototype.requestSoftKeyboard = function () {
              notImplemented("public flash.display.InteractiveObject::requestSoftKeyboard");
              return;
            };
            InteractiveObject.classInitializer = null;

            InteractiveObject.initializer = function () {
              var self = this;
              self._tabEnabled = false;
              self._tabIndex = -1;
              self._focusRect = null;
              self._mouseEnabled = true;
              self._doubleClickEnabled = false;
              self._accessibilityImplementation = null;
              self._softKeyboardInputAreaOfInterest = null;
              self._needsSoftKeyboard = false;
              self._contextMenu = null;
            };

            InteractiveObject.classSymbols = null;

            InteractiveObject.instanceSymbols = null;
            return InteractiveObject;
          })(flash.display.DisplayObject);
          display.InteractiveObject = InteractiveObject;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var SimpleButton = (function (_super) {
            __extends(SimpleButton, _super);
            function SimpleButton(upState, overState, downState, hitTestState) {
              if (typeof upState === "undefined") { upState = null; }
              if (typeof overState === "undefined") { overState = null; }
              if (typeof downState === "undefined") { downState = null; }
              if (typeof hitTestState === "undefined") { hitTestState = null; }
              upState = upState;
              overState = overState;
              downState = downState;
              hitTestState = hitTestState;
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.SimpleButton");
            }
            SimpleButton.prototype._initFrame = function (advance) {
              if (advance) {
                this._updateButton();
              }
            };

            SimpleButton.prototype._constructFrame = function () {
            };

            Object.defineProperty(SimpleButton.prototype, "useHandCursor", {
              get: function () {
                return this._useHandCursor;
              },
              set: function (value) {
                this._useHandCursor = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(SimpleButton.prototype, "enabled", {
              get: function () {
                return this._enabled;
              },
              set: function (value) {
                this._enabled = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(SimpleButton.prototype, "trackAsMenu", {
              get: function () {
                return this._trackAsMenu;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.display.SimpleButton::set trackAsMenu");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(SimpleButton.prototype, "upState", {
              get: function () {
                return this._upState;
              },
              set: function (value) {
                var old = this._upState;
                if (value._parent) {
                  value._parent.removeChild(value);
                }
                this._upState = value;
                if (this._currentState === old) {
                  this._updateButton();
                }
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(SimpleButton.prototype, "overState", {
              get: function () {
                return this._overState;
              },
              set: function (value) {
                var old = this._overState;
                if (value._parent) {
                  value._parent.removeChild(value);
                }
                this._overState = value;
                if (this._currentState === old) {
                  this._updateButton();
                }
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(SimpleButton.prototype, "downState", {
              get: function () {
                return this._downState;
              },
              set: function (value) {
                var old = this._downState;
                if (value._parent) {
                  value._parent.removeChild(value);
                }
                this._downState = value;
                if (this._currentState === old) {
                  this._updateButton();
                }
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(SimpleButton.prototype, "hitTestState", {
              get: function () {
                return this._hitTestState;
              },
              set: function (value) {
                this._hitTestState = value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(SimpleButton.prototype, "soundTransform", {
              get: function () {
                notImplemented("public flash.display.SimpleButton::get soundTransform");
                return;
              },
              set: function (sndTransform) {
                sndTransform = sndTransform;
                notImplemented("public flash.display.SimpleButton::set soundTransform");
                return;
              },
              enumerable: true,
              configurable: true
            });

            SimpleButton.prototype._isUnderMouse = function (x, y) {
              var target = this.hitTestState;
              if (!target) {
                return false;
              }
              var matrix = this._getInvertedConcatenatedMatrix();
              var localX = matrix.transformX(x, y);
              var localY = matrix.transformY(x, y);

              if (!this._symbol) {
                matrix = target._getInvertedMatrix();
                var tmpX = matrix.transformX(localX, localY);
                localY = matrix.transformY(localX, localY);
                localX = tmpX;
              }
              return target._containsPoint(localX, localY, true, false, false);
            };

            SimpleButton.prototype._updateButton = function () {
              var state;
              if (this._mouseOver) {
                state = this._mouseDown ? this._downState : this._overState;
              } else {
                state = this._upState;
              }
              if (state === this._currentState) {
                return;
              }
              if (this._currentState) {
              }
              this._currentState = state;
              if (this._stage) {
              }
              if (state) {
                this._children[0] = state;
              } else {
                this._children.length = 0;
              }
              this._setDirtyFlags(2097152 /* DirtyChildren */);
              this._invalidateFillAndLineBounds(true, true);
            };
            SimpleButton.classInitializer = null;

            SimpleButton.initializer = function (symbol) {
              var self = this;

              display.DisplayObject._advancableInstances.push(self);

              self._useHandCursor = true;
              self._enabled = true;
              self._trackAsMenu = false;
              self._upState = null;
              self._overState = null;
              self._downState = null;
              self._hitTestState = null;

              self._currentState = null;
              self._children = [];

              self._symbol = symbol;

              if (symbol) {
                if (symbol.upState) {
                  self._upState = display.DisplayObject.createAnimatedDisplayObject(symbol.upState, true);
                }
                if (symbol.overState) {
                  self._overState = display.DisplayObject.createAnimatedDisplayObject(symbol.overState, true);
                }
                if (symbol.downState) {
                  self._downState = display.DisplayObject.createAnimatedDisplayObject(symbol.downState, true);
                }
                if (symbol.hitTestState) {
                  self._hitTestState = display.DisplayObject.createAnimatedDisplayObject(symbol.hitTestState, true);
                }
              }
            };

            SimpleButton.classSymbols = null;

            SimpleButton.instanceSymbols = null;
            return SimpleButton;
          })(flash.display.InteractiveObject);
          display.SimpleButton = SimpleButton;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var assert = Shumway.Debug.assert;
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var throwError = Shumway.AVM2.Runtime.throwError;
          var clamp = Shumway.NumberUtilities.clamp;
          var Multiname = Shumway.AVM2.ABC.Multiname;

          var events = flash.events;
          var VisitorFlags = flash.display.VisitorFlags;

          var DisplayObjectContainer = (function (_super) {
            __extends(DisplayObjectContainer, _super);
            function DisplayObjectContainer() {
              false && _super.call(this);
              display.InteractiveObject.instanceConstructorNoInitialize.call(this);
              this._setDirtyFlags(2097152 /* DirtyChildren */);
            }
            DisplayObjectContainer.prototype._invalidateChildren = function () {
              this._setDirtyFlags(2097152 /* DirtyChildren */);
              this._invalidateFillAndLineBounds(true, true);
            };

            DisplayObjectContainer.prototype._propagateFlagsDown = function (flags) {
              if (this._hasFlags(flags)) {
                return;
              }
              this._setFlags(flags);
              var children = this._children;
              for (var i = 0; i < children.length; i++) {
                children[i]._propagateFlagsDown(flags);
              }
            };

            DisplayObjectContainer.prototype._constructChildren = function () {
              release || AVM2.counter.count("DisplayObjectContainer::_constructChildren");

              var children = this._children;
              for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child._hasFlags(256 /* Constructed */)) {
                  continue;
                }
                child.class.instanceConstructorNoInitialize.call(child);
                child._removeReference();
                if (child._name) {
                  this[Multiname.getPublicQualifiedName(child._name)] = child;
                }
                child._setFlags(256 /* Constructed */);

                child.dispatchEvent(events.Event.getInstance(events.Event.ADDED, true));
                if (child.stage) {
                  child.dispatchEvent(events.Event.getInstance(events.Event.ADDED_TO_STAGE));
                }
              }
            };

            DisplayObjectContainer.prototype._enqueueFrameScripts = function () {
              if (this._hasFlags(8192 /* ContainsFrameScriptPendingChildren */)) {
                this._removeFlags(8192 /* ContainsFrameScriptPendingChildren */);
                var children = this._children;
                for (var i = 0; i < children.length; i++) {
                  var child = children[i];
                  if (DisplayObjectContainer.isType(child)) {
                    child._enqueueFrameScripts();
                  }
                }
              }
            };

            Object.defineProperty(DisplayObjectContainer.prototype, "numChildren", {
              get: function () {
                return this._children.length;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplayObjectContainer.prototype, "textSnapshot", {
              get: function () {
                notImplemented("public DisplayObjectContainer::get textSnapshot");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplayObjectContainer.prototype, "tabChildren", {
              get: function () {
                return this._tabChildren;
              },
              set: function (enable) {
                enable = !!enable;

                var old = this._tabChildren;
                this._tabChildren = enable;
                if (old !== enable) {
                  this.dispatchEvent(events.Event.getInstance(events.Event.TAB_CHILDREN_CHANGE, true));
                }
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DisplayObjectContainer.prototype, "mouseChildren", {
              get: function () {
                return this._mouseChildren;
              },
              set: function (enable) {
                this._mouseChildren = !!enable;
              },
              enumerable: true,
              configurable: true
            });


            DisplayObjectContainer.prototype.addChild = function (child) {
              return this.addChildAt(child, this._children.length);
            };

            DisplayObjectContainer.prototype.addChildAt = function (child, index) {
              release || AVM2.counter.count("DisplayObjectContainer::addChildAt");

              index = index | 0;

              release || assert(child._hasFlags(256 /* Constructed */), "Child is not fully constructed.");
              if (child === this) {
                throwError('ArgumentError', AVM2.Errors.CantAddSelfError);
              }
              if (DisplayObjectContainer.isType(child) && child.contains(this)) {
                throwError('ArgumentError', AVM2.Errors.CantAddParentError);
              }
              var children = this._children;
              if (index < 0 || index > children.length) {
                throwError('RangeError', AVM2.Errors.ParamRangeError);
              }

              if (child._parent === this) {
                this.setChildIndex(child, index);
                return child;
              }

              if (child._parent) {
                child._parent.removeChild(child);

                index = clamp(index, 0, children.length);
              }
              for (var i = children.length - 1; i >= index; i--) {
                children[i]._index++;
              }
              children.splice(index, 0, child);
              child._setParent(this, -1);
              child._index = index;
              child._invalidatePosition();
              child.dispatchEvent(events.Event.getInstance(events.Event.ADDED, true));

              if (child.stage) {
                child._propagateEvent(events.Event.getInstance(events.Event.ADDED_TO_STAGE));
              }
              this._invalidateChildren();
              child._addReference();
              return child;
            };

            DisplayObjectContainer.prototype.addTimelineObjectAtDepth = function (child, depth) {
              release || AVM2.counter.count("DisplayObjectContainer::addTimelineObjectAtDepth");

              depth = depth | 0;

              var children = this._children;
              var maxIndex = children.length - 1;
              var index = maxIndex + 1;
              for (var i = maxIndex; i >= 0; i--) {
                var current = children[i];
                if (current._depth) {
                  if (current._depth < depth) {
                    index = i + 1;
                    break;
                  }
                  index = i;
                }
              }

              if (index > maxIndex) {
                children.push(child);
                child._index = index;
              } else {
                children.splice(index, 0, child);
                for (var i = index; i < children.length; i++) {
                  children[i]._index = i;
                }
              }
              child._setParent(this, depth);
              child._invalidatePosition();
              this._invalidateChildren();
            };

            DisplayObjectContainer.prototype.removeChild = function (child) {
              return this.removeChildAt(this.getChildIndex(child));
            };

            DisplayObjectContainer.prototype.removeChildAt = function (index) {
              release || AVM2.counter.count("DisplayObjectContainer::removeChildAt");

              index = index | 0;

              var children = this._children;
              if (index < 0 || index >= children.length) {
                throwError('RangeError', AVM2.Errors.ParamRangeError);
              }

              var child = children[index];
              if (child._hasFlags(256 /* Constructed */)) {
                child.dispatchEvent(events.Event.getInstance(events.Event.REMOVED, true));
                if (this.stage) {
                  child._propagateEvent(events.Event.getInstance(events.Event.REMOVED_FROM_STAGE));
                }

                index = this.getChildIndex(child);
              }

              children.splice(index, 1);
              for (var i = children.length - 1; i >= index; i--) {
                children[i]._index--;
              }
              child._setParent(null, -1);
              child._index = -1;
              child._invalidatePosition();
              this._invalidateChildren();
              return child;
            };

            DisplayObjectContainer.prototype.getChildIndex = function (child) {
              if (child._parent !== this) {
                throwError('ArgumentError', AVM2.Errors.NotAChildError);
              }
              return child._index;
            };

            DisplayObjectContainer.prototype.setChildIndex = function (child, index) {
              index = index | 0;

              var children = this._children;
              if (index < 0 || index > children.length) {
                throwError('RangeError', AVM2.Errors.ParamRangeError);
              }
              child._depth = -1;
              var currentIndex = this.getChildIndex(child);
              if (children.length === 1 || currentIndex === index) {
                return;
              }
              if (index === currentIndex + 1 || index === currentIndex - 1) {
                this._swapChildrenAt(currentIndex, index);
              } else {
                children.splice(currentIndex, 1);
                children.splice(index, 0, child);
                var i = currentIndex < index ? currentIndex : index;
                while (i < children.length) {
                  children[i]._index = i++;
                }
              }
              this._invalidateChildren();
            };

            DisplayObjectContainer.prototype.getChildAt = function (index) {
              index = index | 0;

              var children = this._children;
              if (index < 0 || index >= children.length) {
                throwError('RangeError', AVM2.Errors.ParamRangeError);
              }

              var child = children[index];
              if (!child._hasFlags(256 /* Constructed */)) {
                return null;
              }

              child._addReference();
              return child;
            };

            DisplayObjectContainer.prototype.getTimelineObjectAtDepth = function (depth) {
              depth = depth | 0;
              var children = this._children;
              for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child._depth > depth) {
                  break;
                }
                if (child._depth === depth) {
                  return child;
                }
              }
              return null;
            };

            DisplayObjectContainer.prototype.getClipDepthIndex = function (depth) {
              depth = depth | 0;
              var children = this._children;
              var index = this._children.length - 1;
              var first = true;
              for (var i = index; i >= 0; i--) {
                var child = children[i];

                if (child._depth < 0) {
                  continue;
                }

                if (child._depth <= depth) {
                  return first ? index : i;
                }
                first = false;
              }
              return 0;
            };

            DisplayObjectContainer.prototype.getChildByName = function (name) {
              name = asCoerceString(name);

              var children = this._children;
              for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (!child._hasFlags(256 /* Constructed */)) {
                  continue;
                }
                if (child.name === name) {
                  child._addReference();
                  return child;
                }
              }

              return null;
            };

            DisplayObjectContainer.prototype.getObjectsUnderPoint = function (globalPoint) {
              release || AVM2.counter.count("DisplayObjectContainer::getObjectsUnderPoint");

              var objectsUnderPoint = [];
              this.visit(function (displayObject) {
                if (displayObject.hitTestPoint(globalPoint.x, globalPoint.y, false, true)) {
                  if (displayObject.hitTestPoint(globalPoint.x, globalPoint.y, true, true)) {
                    objectsUnderPoint.push(displayObject);
                    displayObject._addReference();
                  }
                } else {
                  return 2 /* Skip */;
                }
                return 0 /* Continue */;
              }, 0 /* None */);
              return objectsUnderPoint;
            };

            DisplayObjectContainer.prototype.areInaccessibleObjectsUnderPoint = function (point) {
              point = point;
              notImplemented("public DisplayObjectContainer::areInaccessibleObjectsUnderPoint");
              return;
            };

            DisplayObjectContainer.prototype.contains = function (child) {
              return this._isAncestor(child);
            };

            DisplayObjectContainer.prototype.swapChildrenAt = function (index1, index2) {
              index1 = index1 | 0;
              index2 = index2 | 0;

              var children = this._children;
              if (index1 < 0 || index1 >= children.length || index2 < 0 || index2 >= children.length) {
                throwError('RangeError', AVM2.Errors.ParamRangeError);
              }

              if (index1 === index2) {
                return;
              }

              this._swapChildrenAt(index1, index2);
              this._invalidateChildren();
            };

            DisplayObjectContainer.prototype._swapChildrenAt = function (index1, index2) {
              var children = this._children;
              var child1 = children[index1];
              var child2 = children[index2];
              children[index2] = child1;
              child1._depth = -1;
              child1._index = index2;
              children[index1] = child2;
              child2._depth = -1;
              child2._index = index1;
            };

            DisplayObjectContainer.prototype.swapChildren = function (child1, child2) {
              this.swapChildrenAt(this.getChildIndex(child1), this.getChildIndex(child2));
            };

            DisplayObjectContainer.prototype.removeChildren = function (beginIndex, endIndex) {
              if (typeof beginIndex === "undefined") { beginIndex = 0; }
              if (typeof endIndex === "undefined") { endIndex = 2147483647; }
              beginIndex = beginIndex | 0;
              endIndex = endIndex | 0;

              if (beginIndex < 0 || endIndex < 0 || endIndex < beginIndex || endIndex >= this._children.length) {
                throwError('RangeError', AVM2.Errors.ParamRangeError);
              }

              var count = endIndex - beginIndex + 1;
              if (count > 0) {
                while (count--) {
                  this.removeChildAt(beginIndex);
                }
              }
            };
            DisplayObjectContainer.bindings = null;
            DisplayObjectContainer.classSymbols = null;
            DisplayObjectContainer.classInitializer = null;

            DisplayObjectContainer.initializer = function () {
              var self = this;
              self._tabChildren = true;
              self._mouseChildren = true;
              self._children = [];
            };
            return DisplayObjectContainer;
          })(flash.display.InteractiveObject);
          display.DisplayObjectContainer = DisplayObjectContainer;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var JointStyle = (function (_super) {
            __extends(JointStyle, _super);
            function JointStyle() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.JointStyle");
            }
            JointStyle.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return JointStyle.ROUND;
                case 1:
                  return JointStyle.BEVEL;
                case 2:
                  return JointStyle.MITER;
                default:
                  return null;
              }
            };

            JointStyle.toNumber = function (value) {
              switch (value) {
                case JointStyle.ROUND:
                  return 0;
                case JointStyle.BEVEL:
                  return 1;
                case JointStyle.MITER:
                  return 2;
                default:
                  return -1;
              }
            };
            JointStyle.classInitializer = null;

            JointStyle.initializer = null;

            JointStyle.classSymbols = null;

            JointStyle.instanceSymbols = null;

            JointStyle.ROUND = "round";
            JointStyle.BEVEL = "bevel";
            JointStyle.MITER = "miter";
            return JointStyle;
          })(AS.ASNative);
          display.JointStyle = JointStyle;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var CapsStyle = (function (_super) {
            __extends(CapsStyle, _super);
            function CapsStyle() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.CapsStyle");
            }
            CapsStyle.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return CapsStyle.ROUND;
                case 1:
                  return CapsStyle.NONE;
                case 2:
                  return CapsStyle.SQUARE;
                default:
                  return null;
              }
            };

            CapsStyle.toNumber = function (value) {
              switch (value) {
                case CapsStyle.ROUND:
                  return 0;
                case CapsStyle.NONE:
                  return 1;
                case CapsStyle.SQUARE:
                  return 2;
                default:
                  return -1;
              }
            };
            CapsStyle.classInitializer = null;

            CapsStyle.initializer = null;

            CapsStyle.classSymbols = null;

            CapsStyle.instanceSymbols = null;

            CapsStyle.ROUND = "round";
            CapsStyle.NONE = "none";
            CapsStyle.SQUARE = "square";
            return CapsStyle;
          })(AS.ASNative);
          display.CapsStyle = CapsStyle;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var LineScaleMode = (function (_super) {
            __extends(LineScaleMode, _super);
            function LineScaleMode() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.LineScaleMode");
            }
            LineScaleMode.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return LineScaleMode.NONE;
                case 1:
                  return LineScaleMode.NORMAL;
                case 2:
                  return LineScaleMode.VERTICAL;
                case 3:
                  return LineScaleMode.HORIZONTAL;
                default:
                  return null;
              }
            };

            LineScaleMode.toNumber = function (value) {
              switch (value) {
                case LineScaleMode.NONE:
                  return 0;
                case LineScaleMode.NORMAL:
                  return 1;
                case LineScaleMode.VERTICAL:
                  return 2;
                case LineScaleMode.HORIZONTAL:
                  return 3;
                default:
                  return -1;
              }
            };
            LineScaleMode.classInitializer = null;

            LineScaleMode.initializer = null;

            LineScaleMode.classSymbols = null;

            LineScaleMode.instanceSymbols = null;

            LineScaleMode.NORMAL = "normal";
            LineScaleMode.VERTICAL = "vertical";
            LineScaleMode.HORIZONTAL = "horizontal";
            LineScaleMode.NONE = "none";
            return LineScaleMode;
          })(AS.ASNative);
          display.LineScaleMode = LineScaleMode;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;
          var GradientType = (function (_super) {
            __extends(GradientType, _super);
            function GradientType() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.GradientType");
            }
            GradientType.fromNumber = function (n) {
              switch (n) {
                case 16 /* Linear */:
                  return GradientType.LINEAR;
                case 18 /* Radial */:
                  return GradientType.RADIAL;
                default:
                  return null;
              }
            };

            GradientType.toNumber = function (value) {
              switch (value) {
                case GradientType.LINEAR:
                  return 16 /* Linear */;
                case GradientType.RADIAL:
                  return 18 /* Radial */;
                default:
                  return -1;
              }
            };
            GradientType.classInitializer = null;
            GradientType.initializer = null;
            GradientType.classSymbols = null;
            GradientType.instanceSymbols = null;

            GradientType.LINEAR = "linear";
            GradientType.RADIAL = "radial";
            return GradientType;
          })(AS.ASNative);
          display.GradientType = GradientType;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;
          var GradientSpreadMethod = Shumway.GradientSpreadMethod;
          var SpreadMethod = (function (_super) {
            __extends(SpreadMethod, _super);
            function SpreadMethod() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.SpreadMethod");
            }
            SpreadMethod.fromNumber = function (n) {
              switch (n) {
                case 0 /* Pad */:
                  return SpreadMethod.PAD;
                case 1 /* Reflect */:
                  return SpreadMethod.REFLECT;
                case 2 /* Repeat */:
                  return SpreadMethod.REPEAT;
                default:
                  return null;
              }
            };

            SpreadMethod.toNumber = function (value) {
              switch (value) {
                case SpreadMethod.PAD:
                  return 0 /* Pad */;
                case SpreadMethod.REFLECT:
                  return 1 /* Reflect */;
                case SpreadMethod.REPEAT:
                  return 2 /* Repeat */;
                default:
                  return -1;
              }
            };
            SpreadMethod.classInitializer = null;
            SpreadMethod.initializer = null;
            SpreadMethod.classSymbols = null;
            SpreadMethod.instanceSymbols = null;

            SpreadMethod.PAD = "pad";
            SpreadMethod.REFLECT = "reflect";
            SpreadMethod.REPEAT = "repeat";
            return SpreadMethod;
          })(AS.ASNative);
          display.SpreadMethod = SpreadMethod;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;
          var GradientInterpolationMethod = Shumway.GradientInterpolationMethod;
          var InterpolationMethod = (function (_super) {
            __extends(InterpolationMethod, _super);
            function InterpolationMethod() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.InterpolationMethod");
            }
            InterpolationMethod.fromNumber = function (n) {
              switch (n) {
                case 0 /* RGB */:
                  return InterpolationMethod.RGB;
                case 1 /* LinearRGB */:
                  return InterpolationMethod.LINEAR_RGB;
                default:
                  return null;
              }
            };

            InterpolationMethod.toNumber = function (value) {
              switch (value) {
                case InterpolationMethod.RGB:
                  return 0 /* RGB */;
                case InterpolationMethod.LINEAR_RGB:
                  return 1 /* LinearRGB */;
                default:
                  return -1;
              }
            };
            InterpolationMethod.classInitializer = null;
            InterpolationMethod.initializer = null;
            InterpolationMethod.classSymbols = null;
            InterpolationMethod.instanceSymbols = null;

            InterpolationMethod.RGB = "rgb";
            InterpolationMethod.LINEAR_RGB = "linearRGB";
            return InterpolationMethod;
          })(AS.ASNative);
          display.InterpolationMethod = InterpolationMethod;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var GraphicsBitmapFill = (function (_super) {
            __extends(GraphicsBitmapFill, _super);
            function GraphicsBitmapFill(bitmapData, matrix, repeat, smooth) {
              if (typeof bitmapData === "undefined") { bitmapData = null; }
              if (typeof matrix === "undefined") { matrix = null; }
              if (typeof repeat === "undefined") { repeat = true; }
              if (typeof smooth === "undefined") { smooth = false; }
              false && _super.call(this);
              this.bitmapData = bitmapData;
              this.matrix = matrix;
              this.repeat = !!repeat;
              this.smooth = !!smooth;
            }
            GraphicsBitmapFill.classInitializer = null;

            GraphicsBitmapFill.initializer = null;

            GraphicsBitmapFill.classSymbols = null;

            GraphicsBitmapFill.instanceSymbols = null;
            return GraphicsBitmapFill;
          })(AS.ASNative);
          display.GraphicsBitmapFill = GraphicsBitmapFill;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var GraphicsEndFill = (function (_super) {
            __extends(GraphicsEndFill, _super);
            function GraphicsEndFill() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.GraphicsEndFill");
            }
            GraphicsEndFill.classInitializer = null;

            GraphicsEndFill.initializer = null;

            GraphicsEndFill.classSymbols = null;

            GraphicsEndFill.instanceSymbols = null;
            return GraphicsEndFill;
          })(AS.ASNative);
          display.GraphicsEndFill = GraphicsEndFill;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var GraphicsGradientFill = (function (_super) {
            __extends(GraphicsGradientFill, _super);
            function GraphicsGradientFill(type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
              if (typeof type === "undefined") { type = "linear"; }
              if (typeof colors === "undefined") { colors = null; }
              if (typeof alphas === "undefined") { alphas = null; }
              if (typeof ratios === "undefined") { ratios = null; }
              if (typeof matrix === "undefined") { matrix = null; }
              if (typeof spreadMethod === "undefined") { spreadMethod = "pad"; }
              if (typeof interpolationMethod === "undefined") { interpolationMethod = "rgb"; }
              if (typeof focalPointRatio === "undefined") { focalPointRatio = 0; }
              false && _super.call(this);
              this.type = asCoerceString(type);
              this.colors = colors;
              this.alphas = alphas;
              this.ratios = ratios;
              this.matrix = matrix;
              this.spreadMethod = spreadMethod;
              this.interpolationMethod = asCoerceString(interpolationMethod);
              this.focalPointRatio = +focalPointRatio;
            }
            GraphicsGradientFill.classInitializer = null;

            GraphicsGradientFill.initializer = null;

            GraphicsGradientFill.classSymbols = null;

            GraphicsGradientFill.instanceSymbols = null;
            return GraphicsGradientFill;
          })(AS.ASNative);
          display.GraphicsGradientFill = GraphicsGradientFill;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var GraphicsPath = (function (_super) {
            __extends(GraphicsPath, _super);
            function GraphicsPath(commands, data, winding) {
              if (typeof commands === "undefined") { commands = null; }
              if (typeof data === "undefined") { data = null; }
              if (typeof winding === "undefined") { winding = "evenOdd"; }
              false && _super.call(this);
              this.commands = commands;
              this.data = data;
              this.winding = asCoerceString(winding);
            }
            GraphicsPath.classInitializer = null;

            GraphicsPath.initializer = null;

            GraphicsPath.classSymbols = null;

            GraphicsPath.instanceSymbols = null;
            return GraphicsPath;
          })(AS.ASNative);
          display.GraphicsPath = GraphicsPath;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var GraphicsPathCommand = (function (_super) {
            __extends(GraphicsPathCommand, _super);
            function GraphicsPathCommand() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.GraphicsPathCommand");
            }
            GraphicsPathCommand.classInitializer = null;

            GraphicsPathCommand.initializer = null;

            GraphicsPathCommand.classSymbols = null;

            GraphicsPathCommand.instanceSymbols = null;

            GraphicsPathCommand.NO_OP = undefined;
            GraphicsPathCommand.MOVE_TO = 1;
            GraphicsPathCommand.LINE_TO = 2;
            GraphicsPathCommand.CURVE_TO = 3;
            GraphicsPathCommand.WIDE_MOVE_TO = 4;
            GraphicsPathCommand.WIDE_LINE_TO = 5;
            GraphicsPathCommand.CUBIC_CURVE_TO = 6;
            return GraphicsPathCommand;
          })(AS.ASNative);
          display.GraphicsPathCommand = GraphicsPathCommand;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var GraphicsPathWinding = (function (_super) {
            __extends(GraphicsPathWinding, _super);
            function GraphicsPathWinding() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.GraphicsPathWinding");
            }
            GraphicsPathWinding.classInitializer = null;

            GraphicsPathWinding.initializer = null;

            GraphicsPathWinding.classSymbols = null;

            GraphicsPathWinding.instanceSymbols = null;

            GraphicsPathWinding.EVEN_ODD = "evenOdd";
            GraphicsPathWinding.NON_ZERO = "nonZero";
            return GraphicsPathWinding;
          })(AS.ASNative);
          display.GraphicsPathWinding = GraphicsPathWinding;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var GraphicsSolidFill = (function (_super) {
            __extends(GraphicsSolidFill, _super);
            function GraphicsSolidFill(color, alpha) {
              if (typeof color === "undefined") { color = 0; }
              if (typeof alpha === "undefined") { alpha = 1; }
              false && _super.call(this);
              this.color = color >>> 0;
              this.alpha = +alpha;
            }
            GraphicsSolidFill.classInitializer = null;

            GraphicsSolidFill.initializer = null;

            GraphicsSolidFill.classSymbols = null;

            GraphicsSolidFill.instanceSymbols = null;
            return GraphicsSolidFill;
          })(AS.ASNative);
          display.GraphicsSolidFill = GraphicsSolidFill;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var GraphicsStroke = (function (_super) {
            __extends(GraphicsStroke, _super);
            function GraphicsStroke(thickness, pixelHinting, scaleMode, caps, joints, miterLimit, fill) {
              if (typeof thickness === "undefined") { thickness = NaN; }
              if (typeof pixelHinting === "undefined") { pixelHinting = false; }
              if (typeof scaleMode === "undefined") { scaleMode = "normal"; }
              if (typeof caps === "undefined") { caps = "none"; }
              if (typeof joints === "undefined") { joints = "round"; }
              if (typeof miterLimit === "undefined") { miterLimit = 3; }
              if (typeof fill === "undefined") { fill = null; }
              false && _super.call(this);
              this.thickness = +thickness;
              this.pixelHinting = !!pixelHinting;
              this.scaleMode = asCoerceString(scaleMode);
              this.caps = asCoerceString(caps);
              this.joints = asCoerceString(joints);
              this.miterLimit = +miterLimit;
              this.fill = fill;
            }
            GraphicsStroke.classInitializer = null;

            GraphicsStroke.initializer = null;

            GraphicsStroke.classSymbols = null;

            GraphicsStroke.instanceSymbols = null;
            return GraphicsStroke;
          })(AS.ASNative);
          display.GraphicsStroke = GraphicsStroke;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var GraphicsTrianglePath = (function (_super) {
            __extends(GraphicsTrianglePath, _super);
            function GraphicsTrianglePath(vertices, indices, uvtData, culling) {
              if (typeof vertices === "undefined") { vertices = null; }
              if (typeof indices === "undefined") { indices = null; }
              if (typeof uvtData === "undefined") { uvtData = null; }
              if (typeof culling === "undefined") { culling = "none"; }
              vertices = vertices;
              indices = indices;
              uvtData = uvtData;
              culling = asCoerceString(culling);
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.GraphicsTrianglePath");
            }
            GraphicsTrianglePath.classInitializer = null;

            GraphicsTrianglePath.initializer = null;

            GraphicsTrianglePath.classSymbols = null;

            GraphicsTrianglePath.instanceSymbols = null;
            return GraphicsTrianglePath;
          })(AS.ASNative);
          display.GraphicsTrianglePath = GraphicsTrianglePath;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var throwError = Shumway.AVM2.Runtime.throwError;
          var clamp = Shumway.NumberUtilities.clamp;
          var Bounds = Shumway.Bounds;
          var assert = Shumway.Debug.assert;
          var assertUnreachable = Shumway.Debug.assertUnreachable;

          var GradientType = flash.display.GradientType;
          var SpreadMethod = flash.display.SpreadMethod;
          var InterpolationMethod = flash.display.InterpolationMethod;
          var LineScaleMode = flash.display.LineScaleMode;
          var CapsStyle = flash.display.CapsStyle;
          var JointStyle = flash.display.JointStyle;
          var PathCommand = Shumway.PathCommand;
          var ShapeData = Shumway.ShapeData;

          function distanceSq(x1, y1, x2, y2) {
            var dX = x2 - x1;
            var dY = y2 - y1;
            return dX * dX + dY * dY;
          }

          function quadraticBezier(from, cp, to, t) {
            var inverseT = 1 - t;
            return from * inverseT * inverseT + 2 * cp * inverseT * t + to * t * t;
          }
          function quadraticBezierExtreme(from, cp, to) {
            var t = (from - cp) / (from - 2 * cp + to);
            if (t < 0) {
              return from;
            }
            if (t > 1) {
              return to;
            }
            return quadraticBezier(from, cp, to, t);
          }
          function cubicBezier(from, cp, cp2, to, t) {
            var tSq = t * t;
            var inverseT = 1 - t;
            var inverseTSq = inverseT * inverseT;
            return from * inverseT * inverseTSq + 3 * cp * t * inverseTSq + 3 * cp2 * inverseT * tSq + to * t * tSq;
          }

          function cubicBezierExtremes(from, cp, cp2, to) {
            var d1 = cp - from;
            var d2 = cp2 - cp;

            d2 *= 2;
            var d3 = to - cp2;

            if (d1 + d3 === d2) {
              d3 *= 1.0001;
            }
            var fHead = 2 * d1 - d2;
            var part1 = d2 - 2 * d1;
            var fCenter = Math.sqrt(part1 * part1 - 4 * d1 * (d1 - d2 + d3));
            var fTail = 2 * (d1 - d2 + d3);
            var t1 = (fHead + fCenter) / fTail;
            var t2 = (fHead - fCenter) / fTail;
            var result = [];
            if (t1 >= 0 && t1 <= 1) {
              result.push(Math.round(cubicBezier(from, cp, cp2, to, t1)));
            }
            if (t2 >= 0 && t2 <= 1) {
              result.push(Math.round(cubicBezier(from, cp, cp2, to, t2)));
            }
            return result;
          }

          function cubicXAtY(x0, y0, cx, cy, cx1, cy1, x1, y1, y) {
            var dX = 3.0 * (cx - x0);
            var dY = 3.0 * (cy - y0);

            var bX = 3.0 * (cx1 - cx) - dX;
            var bY = 3.0 * (cy1 - cy) - dY;

            var c3X = x1 - x0 - dX - bX;
            var c3Y = y1 - y0 - dY - bY;

            function f(t) {
              return t * (dY + t * (bY + t * c3Y)) + y0 - y;
            }
            function pointAt(t) {
              if (t < 0) {
                t = 0;
              } else if (t > 1) {
                t = 1;
              }

              return x0 + t * (dX + t * (bX + t * c3X));
            }

            function bisectCubicBezierRange(f, l, r, limit) {
              if (Math.abs(r - l) <= limit) {
                return;
              }

              var middle = 0.5 * (l + r);
              if (f(l) * f(r) <= 0) {
                left = l;
                right = r;
                return;
              }
              bisectCubicBezierRange(f, l, middle, limit);
              bisectCubicBezierRange(f, middle, r, limit);
            }

            var left = 0;
            var right = 1;
            bisectCubicBezierRange(f, 0, 1, 0.05);

            var t0 = findRoot(left, right, f, 50, 0.000001);
            var evalResult = Math.abs(f(t0));
            if (evalResult > 0.00001) {
              return [];
            }

            var result = [];
            if (t0 <= 1) {
              result.push(pointAt(t0));
            }

            var a = c3Y;
            var b = t0 * a + bY;
            var c = t0 * b + dY;

            var d = b * b - 4 * a * c;
            if (d < 0) {
              return result;
            }

            d = Math.sqrt(d);
            a = 1 / (a + a);
            var t1 = (d - b) * a;
            var t2 = (-b - d) * a;

            if (t1 >= 0 && t1 <= 1) {
              result.push(pointAt(t1));
            }

            if (t2 >= 0 && t2 <= 1) {
              result.push(pointAt(t2));
            }

            return result;
          }

          function findRoot(x0, x2, f, maxIterations, epsilon) {
            var x1;
            var y0;
            var y1;
            var y2;
            var b;
            var c;
            var y10;
            var y20;
            var y21;
            var xm;
            var ym;
            var temp;

            var xmlast = x0;
            y0 = f(x0);

            if (y0 === 0) {
              return x0;
            }

            y2 = f(x2);
            if (y2 === 0) {
              return x2;
            }

            if (y2 * y0 > 0) {
              return x0;
            }

            var __iter = 0;
            for (var i = 0; i < maxIterations; ++i) {
              __iter++;

              x1 = 0.5 * (x2 + x0);
              y1 = f(x1);
              if (y1 === 0) {
                return x1;
              }

              if (Math.abs(x1 - x0) < epsilon) {
                return x1;
              }

              if (y1 * y0 > 0) {
                temp = x0;
                x0 = x2;
                x2 = temp;
                temp = y0;
                y0 = y2;
                y2 = temp;
              }

              y10 = y1 - y0;
              y21 = y2 - y1;
              y20 = y2 - y0;
              if (y2 * y20 < 2 * y1 * y10) {
                x2 = x1;
                y2 = y1;
              } else {
                b = (x1 - x0) / y10;
                c = (y10 - y21) / (y21 * y20);
                xm = x0 - b * y0 * (1 - c * y1);
                ym = f(xm);
                if (ym === 0) {
                  return xm;
                }

                if (Math.abs(xm - xmlast) < epsilon) {
                  return xm;
                }

                xmlast = xm;
                if (ym * y0 < 0) {
                  x2 = xm;
                  y2 = ym;
                } else {
                  x0 = xm;
                  y0 = ym;
                  x2 = x1;
                  y2 = y1;
                }
              }
            }
            return x1;
          }

          function rayIntersectsLine(x, y, x1, y1, x2, y2) {
            return (y2 > y) !== (y1 > y) && x < (x1 - x2) * (y - y2) / (y1 - y2) + x2;
          }

          function rayFullyCrossesCurve(x, y, fromX, fromY, cpX, cpY, toX, toY) {
            if ((cpY > y) === (fromY > y) && (toY > y) === (fromY > y)) {
              return false;
            }
            if (fromX >= x && cpX >= x && toX >= x) {
              return true;
            }

            var a = fromY - 2 * cpY + toY;
            var c = fromY - y;
            var b = 2 * (cpY - fromY);

            var d = b * b - 4 * a * c;
            if (d < 0) {
              return false;
            }

            d = Math.sqrt(d);
            a = 1 / (a + a);
            var t1 = (d - b) * a;
            var t2 = (-b - d) * a;

            var crosses = false;
            if (t1 >= 0 && t1 <= 1 && quadraticBezier(fromX, cpX, toX, t1) > x) {
              crosses = !crosses;
            }

            if (t2 >= 0 && t2 <= 1 && quadraticBezier(fromX, cpX, toX, t2) > x) {
              crosses = !crosses;
            }
            return crosses;
          }

          function rayFullyCrossesCubicCurve(x, y, fromX, fromY, cpX, cpY, cp2X, cp2Y, toX, toY) {
            var curveStartsAfterY = fromY > y;
            if ((cpY > y) === curveStartsAfterY && (cp2Y > y) === curveStartsAfterY && (toY > y) === curveStartsAfterY) {
              return false;
            }
            if (fromX < x && cpX < x && cp2X < x && toX < x) {
              return false;
            }
            var crosses = false;
            var roots = cubicXAtY(fromX, fromY, cpX, cpY, cp2X, cp2Y, toX, toY, y);
            for (var i = roots.length; i; i--) {
              if (roots[i] >= x) {
                crosses = !crosses;
              }
            }
            return crosses;
          }

          var Graphics = (function (_super) {
            __extends(Graphics, _super);
            function Graphics() {
              false && _super.call(this);
              this._id = flash.display.DisplayObject.getNextSyncID();
              this._graphicsData = new ShapeData();
              this._textures = [];
              this._hasFills = this._hasLines = false;
              this._fillBounds = new Bounds(0x8000000, 0x8000000, 0x8000000, 0x8000000);
              this._lineBounds = new Bounds(0x8000000, 0x8000000, 0x8000000, 0x8000000);
              this._lastX = this._lastY = 0;
              this._boundsIncludeLastCoordinates = false;
              this._parent = null;

              this._topLeftStrokeWidth = this._bottomRightStrokeWidth = 0;
              this._isDirty = true;
            }
            Graphics.FromData = function (data) {
              var graphics = new flash.display.Graphics();
              graphics._graphicsData = ShapeData.FromPlainObject(data.shape);
              graphics._hasFills = data.hasFills;
              graphics._hasLines = data.hasLines;
              if (data.lineBounds) {
                graphics._lineBounds.copyFrom(data.lineBounds);
                graphics._fillBounds.copyFrom(data.fillBounds || data.lineBounds);
              }
              return graphics;
            };

            Graphics.prototype.getGraphicsData = function () {
              return this._graphicsData;
            };

            Graphics.prototype.getUsedTextures = function () {
              return this._textures;
            };

            Graphics.prototype._setStrokeWidth = function (width) {
              switch (width) {
                case 1:
                  this._topLeftStrokeWidth = 0;
                  this._bottomRightStrokeWidth = 1;
                  break;
                case 3:
                  this._topLeftStrokeWidth = 1;
                  this._bottomRightStrokeWidth = 2;
                  break;
                default:
                  var half = Math.ceil(width * 0.5) | 0;
                  this._topLeftStrokeWidth = half;
                  this._bottomRightStrokeWidth = half;
                  break;
              }
            };

            Graphics.prototype._setParent = function (parent) {
              release || assert(!this._parent);
              this._parent = parent;
            };

            Graphics.prototype._invalidateParent = function () {
              release || assert(this._parent, "Graphics instances must have a parent.");
              this._parent._invalidateFillAndLineBounds(true, true);
              this._parent._setDirtyFlags(4194304 /* DirtyGraphics */);
            };

            Graphics.prototype._invalidate = function () {
              this._invalidateParent();
              this._isDirty = true;
            };

            Graphics.prototype._getContentBounds = function (includeStrokes) {
              if (typeof includeStrokes === "undefined") { includeStrokes = true; }
              return includeStrokes ? this._lineBounds : this._fillBounds;
            };

            Graphics.prototype.clear = function () {
              if (this._graphicsData.isEmpty()) {
                return;
              }
              this._graphicsData.clear();
              this._textures.length = 0;
              this._fillBounds.setToSentinels();
              this._lineBounds.setToSentinels();
              this._lastX = this._lastY = 0;
              this._boundsIncludeLastCoordinates = false;
              this._invalidate();
            };

            Graphics.prototype.beginFill = function (color, alpha) {
              if (typeof alpha === "undefined") { alpha = 1; }
              color = color >>> 0 & 0xffffff;
              alpha = Math.round(clamp(+alpha, -1, 1) * 0xff) | 0;
              this._graphicsData.beginFill((color << 8) | alpha);
              this._hasFills = true;
            };

            Graphics.prototype.beginGradientFill = function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
              if (typeof matrix === "undefined") { matrix = null; }
              if (typeof spreadMethod === "undefined") { spreadMethod = "pad"; }
              if (typeof interpolationMethod === "undefined") { interpolationMethod = "rgb"; }
              if (typeof focalPointRatio === "undefined") { focalPointRatio = 0; }
              this._writeGradientStyle(2 /* BeginGradientFill */, type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio, false);
              this._hasFills = true;
            };

            Graphics.prototype.beginBitmapFill = function (bitmap, matrix, repeat, smooth) {
              if (typeof matrix === "undefined") { matrix = null; }
              if (typeof repeat === "undefined") { repeat = true; }
              if (typeof smooth === "undefined") { smooth = false; }
              this._writeBitmapStyle(3 /* BeginBitmapFill */, bitmap, matrix, repeat, smooth, false);
              this._hasFills = true;
            };

            Graphics.prototype.endFill = function () {
              this._graphicsData.endFill();
            };

            Graphics.prototype.lineStyle = function (thickness, color, alpha, pixelHinting, scaleMode, caps, joints, miterLimit) {
              if (typeof color === "undefined") { color = 0; }
              if (typeof alpha === "undefined") { alpha = 1; }
              if (typeof pixelHinting === "undefined") { pixelHinting = false; }
              if (typeof scaleMode === "undefined") { scaleMode = "normal"; }
              if (typeof caps === "undefined") { caps = null; }
              if (typeof joints === "undefined") { joints = null; }
              if (typeof miterLimit === "undefined") { miterLimit = 3; }
              thickness = +thickness;
              color = color >>> 0 & 0xffffff;
              alpha = Math.round(clamp(+alpha, -1, 1) * 0xff);
              pixelHinting = !!pixelHinting;
              scaleMode = asCoerceString(scaleMode);
              caps = asCoerceString(caps);
              joints = asCoerceString(joints);
              miterLimit = clamp(+miterLimit | 0, 0, 0xff);

              if (isNaN(thickness)) {
                this._setStrokeWidth(0);
                this._graphicsData.endLine();
                return;
              }
              thickness = clamp(+thickness, 0, 0xff) * 20 | 0;
              this._setStrokeWidth(thickness);

              var lineScaleMode = LineScaleMode.toNumber(asCoerceString(scaleMode));
              if (lineScaleMode < 0) {
                lineScaleMode = LineScaleMode.toNumber(LineScaleMode.NORMAL);
              }

              var capsStyle = CapsStyle.toNumber(asCoerceString(caps));
              if (capsStyle < 0) {
                capsStyle = CapsStyle.toNumber(CapsStyle.ROUND);
              }

              var jointStyle = JointStyle.toNumber(asCoerceString(joints));
              if (jointStyle < 0) {
                jointStyle = JointStyle.toNumber(JointStyle.ROUND);
              }

              this._graphicsData.lineStyle(thickness, (color << 8) | alpha, pixelHinting, lineScaleMode, capsStyle, jointStyle, miterLimit);
              this._hasLines = true;
            };

            Graphics.prototype.lineGradientStyle = function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio) {
              if (typeof matrix === "undefined") { matrix = null; }
              if (typeof spreadMethod === "undefined") { spreadMethod = "pad"; }
              if (typeof interpolationMethod === "undefined") { interpolationMethod = "rgb"; }
              if (typeof focalPointRatio === "undefined") { focalPointRatio = 0; }
              this._writeGradientStyle(6 /* LineStyleGradient */, type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio, !this._hasLines);
            };

            Graphics.prototype.lineBitmapStyle = function (bitmap, matrix, repeat, smooth) {
              if (typeof matrix === "undefined") { matrix = null; }
              if (typeof repeat === "undefined") { repeat = true; }
              if (typeof smooth === "undefined") { smooth = false; }
              this._writeBitmapStyle(7 /* LineStyleBitmap */, bitmap, matrix, repeat, smooth, !this._hasLines);
            };

            Graphics.prototype.drawRect = function (x, y, width, height) {
              x = x * 20 | 0;
              y = y * 20 | 0;
              var x2 = x + (width * 20 | 0);
              var y2 = y + (height * 20 | 0);

              if (x !== this._lastX || y !== this._lastY) {
                this._graphicsData.moveTo(x, y);
              }
              this._graphicsData.lineTo(x2, y);
              this._graphicsData.lineTo(x2, y2);
              this._graphicsData.lineTo(x, y2);
              this._graphicsData.lineTo(x, y);

              this._extendBoundsByPoint(x2, y2);
              this._applyLastCoordinates(x, y);

              this._invalidate();
            };

            Graphics.prototype.drawRoundRect = function (x, y, width, height, ellipseWidth, ellipseHeight) {
              x = +x;
              y = +y;
              width = +width;
              height = +height;
              ellipseWidth = +ellipseWidth;
              ellipseHeight = +ellipseHeight;

              if (!ellipseHeight || !ellipseWidth) {
                this.drawRect(x, y, width, height);
                return;
              }

              var radiusX = (ellipseWidth / 2) | 0;
              var radiusY = (ellipseHeight / 2) | 0;
              var hw = width / 2;
              var hh = height / 2;
              if (radiusX > hw) {
                radiusX = hw;
              }
              if (radiusY > hh) {
                radiusY = hh;
              }
              if (hw === radiusX && hh === radiusY) {
                if (radiusX === radiusY) {
                  this.drawCircle(x + radiusX, y + radiusY, radiusX);
                } else {
                  this.drawEllipse(x, y, radiusX * 2, radiusY * 2);
                }
                return;
              }

              var right = x + width;
              var bottom = y + height;
              var xlw = x + radiusX;
              var xrw = right - radiusX;
              var ytw = y + radiusY;
              var ybw = bottom - radiusY;
              this.moveTo(right, ybw);
              this.curveTo(right, bottom, xrw, bottom);
              this.lineTo(xlw, bottom);
              this.curveTo(x, bottom, x, ybw);
              this.lineTo(x, ytw);
              this.curveTo(x, y, xlw, y);
              this.lineTo(xrw, y);
              this.curveTo(right, y, right, ytw);
              this.lineTo(right, ybw);
            };

            Graphics.prototype.drawRoundRectComplex = function (x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
              x = +x;
              y = +y;
              width = +width;
              height = +height;
              topLeftRadius = +topLeftRadius;
              topRightRadius = +topRightRadius;
              bottomLeftRadius = +bottomLeftRadius;
              bottomRightRadius = +bottomRightRadius;

              if (!(topLeftRadius | topRightRadius | bottomLeftRadius | bottomRightRadius)) {
                this.drawRect(x, y, width, height);
                return;
              }

              var right = x + width;
              var bottom = y + height;
              var xtl = x + topLeftRadius;
              this.moveTo(right, bottom - bottomRightRadius);
              this.curveTo(right, bottom, right - bottomRightRadius, bottom);
              this.lineTo(x + bottomLeftRadius, bottom);
              this.curveTo(x, bottom, x, bottom - bottomLeftRadius);
              this.lineTo(x, y + topLeftRadius);
              this.curveTo(x, y, xtl, y);
              this.lineTo(right - topRightRadius, y);
              this.curveTo(right, y, right, y + topRightRadius);
              this.lineTo(right, bottom - bottomRightRadius);
            };

            Graphics.prototype.drawCircle = function (x, y, radius) {
              radius = +radius;
              this.drawEllipse(+x - radius, +y - radius, radius * 2, radius * 2);
            };

            Graphics.prototype.drawEllipse = function (x, y, width, height) {
              x = +x;
              y = +y;
              width = +width;
              height = +height;

              var rx = width / 2;
              var ry = height / 2;

              x += rx;
              y += ry;
              var currentX = x + rx;
              var currentY = y;
              this.moveTo(currentX, currentY);
              var startAngle = 0;
              var u = 1;
              var v = 0;
              for (var i = 0; i < 4; i++) {
                var endAngle = startAngle + Math.PI / 2;
                var kappa = (4 / 3) * Math.tan((endAngle - startAngle) / 4);
                var cp1x = currentX - v * kappa * rx;
                var cp1y = currentY + u * kappa * ry;
                u = Math.cos(endAngle);
                v = Math.sin(endAngle);
                currentX = x + u * rx;
                currentY = y + v * ry;
                var cp2x = currentX + v * kappa * rx;
                var cp2y = currentY - u * kappa * ry;
                this.cubicCurveTo(cp1x, cp1y, cp2x, cp2y, currentX, currentY);
                startAngle = endAngle;
              }
            };

            Graphics.prototype.moveTo = function (x, y) {
              x = x * 20 | 0;
              y = y * 20 | 0;

              this._graphicsData.moveTo(x, y);

              this._lastX = x;
              this._lastY = y;
              this._boundsIncludeLastCoordinates = false;
            };

            Graphics.prototype.lineTo = function (x, y) {
              x = x * 20 | 0;
              y = y * 20 | 0;

              this._graphicsData.lineTo(x, y);
              this._applyLastCoordinates(x, y);
              this._invalidate();
            };

            Graphics.prototype.curveTo = function (controlX, controlY, anchorX, anchorY) {
              controlX = controlX * 20 | 0;
              controlY = controlY * 20 | 0;
              anchorX = anchorX * 20 | 0;
              anchorY = anchorY * 20 | 0;

              this._graphicsData.curveTo(controlX, controlY, anchorX, anchorY);

              if (controlX < this._lastX || controlX > anchorX) {
                this._extendBoundsByX(quadraticBezierExtreme(this._lastX, controlX, anchorX) | 0);
              }
              if (controlY < this._lastY || controlY > anchorY) {
                this._extendBoundsByY(quadraticBezierExtreme(this._lastY, controlY, anchorY) | 0);
              }
              this._applyLastCoordinates(anchorX, anchorY);

              this._invalidate();
            };

            Graphics.prototype.cubicCurveTo = function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
              controlX1 = controlX1 * 20 | 0;
              controlY1 = controlY1 * 20 | 0;
              controlX2 = controlX2 * 20 | 0;
              controlY2 = controlY2 * 20 | 0;
              anchorX = anchorX * 20 | 0;
              anchorY = anchorY * 20 | 0;

              this._graphicsData.cubicCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY);

              var extremes;
              var i;
              var fromX = this._lastX;
              var fromY = this._lastY;
              if (controlX1 < fromX || controlX2 < fromX || controlX1 > anchorX || controlX2 > anchorX) {
                extremes = cubicBezierExtremes(fromX, controlX1, controlX2, anchorX);
                for (i = extremes.length; i--;) {
                  this._extendBoundsByX(extremes[i] | 0);
                }
              }
              if (controlY1 < fromY || controlY2 < fromY || controlY1 > anchorY || controlY2 > anchorY) {
                extremes = cubicBezierExtremes(fromY, controlY1, controlY2, anchorY);
                for (i = extremes.length; i--;) {
                  this._extendBoundsByY(extremes[i] | 0);
                }
              }
              this._applyLastCoordinates(anchorX, anchorY);

              this._invalidate();
            };

            Graphics.prototype.copyFrom = function (sourceGraphics) {
              this._graphicsData = sourceGraphics._graphicsData.clone();
              this._fillBounds = sourceGraphics._fillBounds.clone();
              this._lineBounds = sourceGraphics._lineBounds.clone();
              this._textures = sourceGraphics._textures.concat();
              this._lastX = sourceGraphics._lastX;
              this._lastY = sourceGraphics._lastY;
              this._boundsIncludeLastCoordinates = sourceGraphics._boundsIncludeLastCoordinates;
              this._invalidate();
            };

            Graphics.prototype.drawPath = function (commands, data, winding) {
              if (typeof winding === "undefined") { winding = "evenOdd"; }
              commands = commands;
              data = data;
              winding = asCoerceString(winding);
              notImplemented("public flash.display.Graphics::drawPath");
              return;
            };

            Graphics.prototype.drawTriangles = function (vertices, indices, uvtData, culling) {
              if (typeof indices === "undefined") { indices = null; }
              if (typeof uvtData === "undefined") { uvtData = null; }
              if (typeof culling === "undefined") { culling = "none"; }
              vertices = vertices;
              indices = indices;
              uvtData = uvtData;
              culling = asCoerceString(culling);
              notImplemented("public flash.display.Graphics::drawTriangles");
              return;
            };

            Graphics.prototype.drawGraphicsData = function (graphicsData) {
              graphicsData = graphicsData;
              notImplemented("public flash.display.Graphics::drawGraphicsData");
              return;
            };

            Graphics.prototype._containsPoint = function (x, y, includeLines) {
              var hasLines = this._hasLines;
              if (!(includeLines && hasLines ? this._lineBounds : this._fillBounds).contains(x, y)) {
                return false;
              }

              var containsPoint = false;

              if (this._hasFills) {
                containsPoint = this._fillContainsPoint(x, y);
              } else {
                release || assert(hasLines, "Can't have non-empty bounds without line or fill set.");
              }
              if (!containsPoint && includeLines) {
                containsPoint = this._linesContainsPoint(x, y);
              }

              return containsPoint;
            };

            Graphics.prototype._fillContainsPoint = function (x, y) {
              var data = this._graphicsData;
              var commands = data.commands;
              var commandsCount = data.commandsPosition;
              var coordinates = data.coordinates;
              var coordinatesIndex = 0;

              var fromX = 0;
              var fromY = 0;
              var toX = 0;
              var toY = 0;
              var cpX;
              var cpY;
              var formOpen = false;
              var fillActive = false;
              var formOpenX = 0;
              var formOpenY = 0;
              var inside = false;

              for (var commandIndex = 0; commandIndex < commandsCount; commandIndex++) {
                var command = commands[commandIndex];
                switch (command) {
                  case 9 /* MoveTo */:
                    release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                    if (formOpen && fillActive && rayIntersectsLine(x, y, fromX, fromY, formOpenX, formOpenY)) {
                      inside = !inside;
                    }
                    formOpen = true;
                    fromX = formOpenX = coordinates[coordinatesIndex++];
                    fromY = formOpenY = coordinates[coordinatesIndex++];

                    continue;
                  case 10 /* LineTo */:
                    release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                    toX = coordinates[coordinatesIndex++];
                    toY = coordinates[coordinatesIndex++];
                    if (fillActive && rayIntersectsLine(x, y, fromX, fromY, toX, toY)) {
                      inside = !inside;
                    }
                    break;
                  case 11 /* CurveTo */:
                    release || assert(coordinatesIndex <= data.coordinatesPosition - 4);
                    cpX = coordinates[coordinatesIndex++];
                    cpY = coordinates[coordinatesIndex++];
                    toX = coordinates[coordinatesIndex++];
                    toY = coordinates[coordinatesIndex++];
                    if (fillActive && rayFullyCrossesCurve(x, y, fromX, fromY, cpX, cpY, toX, toY)) {
                      inside = !inside;
                    }
                    break;
                  case 12 /* CubicCurveTo */:
                    release || assert(coordinatesIndex <= data.coordinatesPosition - 6);
                    cpX = coordinates[coordinatesIndex++];
                    cpY = coordinates[coordinatesIndex++];
                    var cp2X = coordinates[coordinatesIndex++];
                    var cp2Y = coordinates[coordinatesIndex++];
                    toX = coordinates[coordinatesIndex++];
                    toY = coordinates[coordinatesIndex++];
                    if (fillActive && rayFullyCrossesCubicCurve(x, y, fromX, fromY, cpX, cpY, cp2X, cp2Y, toX, toY)) {
                      inside = !inside;
                    }
                    break;
                  case 1 /* BeginSolidFill */:
                  case 2 /* BeginGradientFill */:
                  case 3 /* BeginBitmapFill */:
                  case 4 /* EndFill */:
                    if (formOpen && fillActive && rayIntersectsLine(x, y, fromX, fromY, formOpenX, formOpenY)) {
                      inside = !inside;
                    }
                    formOpen = false;
                    fillActive = command !== 4 /* EndFill */;
                    break;
                  case 5 /* LineStyleSolid */:
                    coordinatesIndex++;
                    break;
                  case 6 /* LineStyleGradient */:
                  case 7 /* LineStyleBitmap */:
                  case 8 /* LineEnd */:
                    break;
                  default:
                    release || assertUnreachable('Invalid command ' + command + ' encountered at index' + (commandIndex - 1) + ' of ' + commandsCount);
                }
                fromX = toX;
                fromY = toY;
              }
              release || assert(commandIndex === commandsCount);
              release || assert(coordinatesIndex === data.coordinatesPosition);
              if (formOpen && fillActive && rayIntersectsLine(x, y, fromX, fromY, formOpenX, formOpenY)) {
                inside = !inside;
              }

              return inside;
            };

            Graphics.prototype._linesContainsPoint = function (x, y) {
              var data = this._graphicsData;
              var commands = data.commands;
              var commandsCount = data.commandsPosition;
              var coordinates = data.coordinates;
              var coordinatesIndex = 0;

              var fromX = 0;
              var fromY = 0;
              var toX = 0;
              var toY = 0;
              var cpX;
              var cpY;
              var curveX;
              var curveY;
              var t;

              var width = 0;
              var halfWidth = 0;
              var halfWidthSq = 0;
              var minX = 0;
              var maxX = 0;
              var minY = 0;
              var maxY = 0;

              for (var commandIndex = 0; commandIndex < commandsCount; commandIndex++) {
                var command = commands[commandIndex];
                switch (command) {
                  case 9 /* MoveTo */:
                    release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                    fromX = coordinates[coordinatesIndex++];
                    fromY = coordinates[coordinatesIndex++];

                    continue;
                  case 10 /* LineTo */:
                    release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                    if (width === 0) {
                      fromX = coordinates[coordinatesIndex++];
                      fromX = coordinates[coordinatesIndex++];
                      continue;
                    }
                    toX = coordinates[coordinatesIndex++];
                    toY = coordinates[coordinatesIndex++];

                    if (fromX === toX && fromY === toY) {
                      break;
                    }

                    if (maxX < fromX && maxX < toX || minX > fromX && minX > toX || maxY < fromY && maxY < toY || minY > fromY && minY > toY) {
                      break;
                    }

                    if (toX === fromX || toY === fromY) {
                      return true;
                    }

                    t = ((x - fromX) * (toX - fromX) + (y - fromY) * (toY - fromY)) / distanceSq(fromX, fromY, toX, toY);
                    if (t < 0) {
                      if (distanceSq(x, y, fromX, fromY) <= halfWidthSq) {
                        return true;
                      }
                      break;
                    }
                    if (t > 1) {
                      if (distanceSq(x, y, toX, toY) <= halfWidthSq) {
                        return true;
                      }
                      break;
                    }
                    if (distanceSq(x, y, fromX + t * (toX - fromX), fromY + t * (toY - fromY)) <= halfWidthSq) {
                      return true;
                    }
                    break;
                  case 11 /* CurveTo */:
                    release || assert(coordinatesIndex <= data.coordinatesPosition - 4);
                    if (width === 0) {
                      coordinatesIndex += 2;
                      fromX = coordinates[coordinatesIndex++];
                      fromX = coordinates[coordinatesIndex++];
                      continue;
                    }
                    cpX = coordinates[coordinatesIndex++];
                    cpY = coordinates[coordinatesIndex++];
                    toX = coordinates[coordinatesIndex++];
                    toY = coordinates[coordinatesIndex++];

                    var extremeX = quadraticBezierExtreme(fromX, cpX, toX);
                    if (maxX < fromX && maxX < extremeX && maxX < toX || minX > fromX && minX > extremeX && minX > toX) {
                      break;
                    }
                    var extremeY = quadraticBezierExtreme(fromY, cpY, toY);
                    if (maxY < fromY && maxY < extremeY && maxY < toY || minY > fromY && minY > extremeY && minY > toY) {
                      break;
                    }

                    for (t = 0; t < 1; t += 0.02) {
                      curveX = quadraticBezier(fromX, cpX, toX, t);
                      if (curveX < minX || curveX > maxX) {
                        continue;
                      }
                      curveY = quadraticBezier(fromY, cpY, toY, t);
                      if (curveY < minY || curveY > maxY) {
                        continue;
                      }
                      if ((x - curveX) * (x - curveX) + (y - curveY) * (y - curveY) < halfWidthSq) {
                        return true;
                      }
                    }
                    break;
                  case 12 /* CubicCurveTo */:
                    release || assert(coordinatesIndex <= data.coordinatesPosition - 6);
                    if (width === 0) {
                      coordinatesIndex += 4;
                      fromX = coordinates[coordinatesIndex++];
                      fromX = coordinates[coordinatesIndex++];
                      continue;
                    }
                    cpX = coordinates[coordinatesIndex++];
                    cpY = coordinates[coordinatesIndex++];
                    var cp2X = coordinates[coordinatesIndex++];
                    var cp2Y = coordinates[coordinatesIndex++];
                    toX = coordinates[coordinatesIndex++];
                    toY = coordinates[coordinatesIndex++];

                    var extremesX = cubicBezierExtremes(fromX, cpX, cp2X, toX);
                    while (extremesX.length < 2) {
                      extremesX.push(toX);
                    }
                    if (maxX < fromX && maxX < toX && maxX < extremesX[0] && maxX < extremesX[1] || minX > fromX && minX > toX && minX > extremesX[0] && minX > extremesX[1]) {
                      break;
                    }
                    var extremesY = cubicBezierExtremes(fromY, cpY, cp2Y, toY);
                    while (extremesY.length < 2) {
                      extremesY.push(toY);
                    }
                    if (maxY < fromY && maxY < toY && maxY < extremesY[0] && maxY < extremesY[1] || minY > fromY && minY > toY && minY > extremesY[0] && minY > extremesY[1]) {
                      break;
                    }

                    for (t = 0; t < 1; t += 0.02) {
                      curveX = cubicBezier(fromX, cpX, cp2X, toX, t);
                      if (curveX < minX || curveX > maxX) {
                        continue;
                      }
                      curveY = cubicBezier(fromY, cpY, cp2Y, toY, t);
                      if (curveY < minY || curveY > maxY) {
                        continue;
                      }
                      if ((x - curveX) * (x - curveX) + (y - curveY) * (y - curveY) < halfWidthSq) {
                        return true;
                      }
                    }
                    break;
                  case 5 /* LineStyleSolid */:
                    width = coordinates[coordinatesIndex++];
                    halfWidth = width >> 2;
                    halfWidthSq = halfWidth * halfWidth;
                    minX = x - halfWidth;
                    maxX = x + halfWidth;
                    minY = y - halfWidth;
                    maxY = y + halfWidth;
                    break;
                  case 1 /* BeginSolidFill */:
                  case 2 /* BeginGradientFill */:
                  case 3 /* BeginBitmapFill */:
                  case 4 /* EndFill */:
                  case 6 /* LineStyleGradient */:
                  case 7 /* LineStyleBitmap */:
                  case 8 /* LineEnd */:
                    break;
                  default:
                    release || assertUnreachable('Invalid command ' + command + ' encountered at index' + (commandIndex - 1) + ' of ' + commandsCount);
                }
                fromX = toX;
                fromY = toY;
              }
              release || assert(commandIndex === commandsCount);
              release || assert(coordinatesIndex === data.coordinatesPosition);

              return false;
            };

            Graphics.prototype._writeBitmapStyle = function (pathCommand, bitmap, matrix, repeat, smooth, skipWrite) {
              if (Shumway.isNullOrUndefined(bitmap)) {
                throwError('TypeError', AVM2.Errors.NullPointerError, 'bitmap');
              } else if (!(flash.display.BitmapData.isType(bitmap))) {
                throwError('TypeError', AVM2.Errors.CheckTypeFailedError, 'bitmap', 'flash.display.BitmapData');
              }
              if (Shumway.isNullOrUndefined(matrix)) {
                matrix = flash.geom.Matrix.FROZEN_IDENTITY_MATRIX;
              } else if (!(flash.geom.Matrix.isType(matrix))) {
                throwError('TypeError', AVM2.Errors.CheckTypeFailedError, 'matrix', 'flash.geom.Matrix');
              }
              repeat = !!repeat;
              smooth = !!smooth;

              if (skipWrite) {
                return;
              }

              var index = this._textures.length;
              this._textures.push(bitmap);
              this._graphicsData.beginBitmap(pathCommand, index, matrix, repeat, smooth);
            };

            Graphics.prototype._writeGradientStyle = function (pathCommand, type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio, skipWrite) {
              if (Shumway.isNullOrUndefined(type)) {
                throwError('TypeError', AVM2.Errors.NullPointerError, 'type');
              }
              var gradientType = GradientType.toNumber(asCoerceString(type));
              if (gradientType < 0) {
                throwError("ArgumentError", AVM2.Errors.InvalidEnumError, "type");
              }

              if (Shumway.isNullOrUndefined(colors)) {
                throwError('TypeError', AVM2.Errors.NullPointerError, 'colors');
              }
              if (!(colors instanceof Array)) {
                throwError('TypeError', AVM2.Errors.CheckTypeFailedError, 'colors', 'Array');
              }

              if (!(alphas instanceof Array)) {
                throwError('TypeError', AVM2.Errors.CheckTypeFailedError, 'alphas', 'Array');
              }
              if (Shumway.isNullOrUndefined(alphas)) {
                throwError('TypeError', AVM2.Errors.NullPointerError, 'alphas');
              }

              if (!(ratios instanceof Array)) {
                throwError('TypeError', AVM2.Errors.CheckTypeFailedError, 'ratios', 'Array');
              }
              if (Shumway.isNullOrUndefined(ratios)) {
                throwError('TypeError', AVM2.Errors.NullPointerError, 'ratios');
              }

              var colorsRGBA = [];
              var coercedRatios = [];
              var colorStops = colors.length;
              var recordsValid = colorStops === alphas.length && colorStops === ratios.length;
              if (recordsValid) {
                for (var i = 0; i < colorStops; i++) {
                  var ratio = +ratios[i];
                  if (ratio > 0xff || ratio < 0) {
                    recordsValid = false;
                    break;
                  }
                  colorsRGBA[i] = (colors[i] << 8 & 0xffffff00) | clamp(+alphas[i], 0, 1) * 0xff;
                  coercedRatios[i] = ratio;
                }
              }

              if (!recordsValid) {
                return;
              }

              if (Shumway.isNullOrUndefined(matrix)) {
                matrix = flash.geom.Matrix.FROZEN_IDENTITY_MATRIX;
              } else if (!(flash.geom.Matrix.isType(matrix))) {
                throwError('TypeError', AVM2.Errors.CheckTypeFailedError, 'matrix', 'flash.geom.Matrix');
              }

              if (skipWrite) {
                return;
              }

              var spread = SpreadMethod.toNumber(asCoerceString(spreadMethod));
              if (spread < 0) {
                spread = SpreadMethod.toNumber(SpreadMethod.PAD);
              }

              var interpolation = InterpolationMethod.toNumber(asCoerceString(interpolationMethod));
              if (interpolation < 0) {
                interpolation = InterpolationMethod.toNumber(InterpolationMethod.RGB);
              }

              focalPointRatio = clamp(+focalPointRatio, -1, 1) / 2 * 0xff | 0;
              this._graphicsData.beginGradient(pathCommand, colorsRGBA, coercedRatios, gradientType, matrix, spread, interpolation, focalPointRatio);
            };

            Graphics.prototype._extendBoundsByPoint = function (x, y) {
              this._extendBoundsByX(x);
              this._extendBoundsByY(y);
            };

            Graphics.prototype._extendBoundsByX = function (x) {
              this._fillBounds.extendByX(x);

              var bounds = this._lineBounds;
              if (bounds.xMin === 0x8000000) {
                bounds.xMin = x - this._topLeftStrokeWidth;
                bounds.xMax = x + this._bottomRightStrokeWidth;
              } else {
                bounds.xMin = Math.min(x - this._topLeftStrokeWidth, bounds.xMin);
                bounds.xMax = Math.max(x + this._bottomRightStrokeWidth, bounds.xMax);
              }
            };

            Graphics.prototype._extendBoundsByY = function (y) {
              this._fillBounds.extendByY(y);

              var bounds = this._lineBounds;
              if (bounds.yMin === 0x8000000) {
                bounds.yMin = y - this._topLeftStrokeWidth;
                bounds.yMax = y + this._bottomRightStrokeWidth;
              } else {
                bounds.yMin = Math.min(y - this._topLeftStrokeWidth, bounds.yMin);
                bounds.yMax = Math.max(y + this._bottomRightStrokeWidth, bounds.yMax);
              }
            };

            Graphics.prototype._applyLastCoordinates = function (x, y) {
              if (!this._boundsIncludeLastCoordinates) {
                this._extendBoundsByPoint(this._lastX, this._lastY);
              }
              this._boundsIncludeLastCoordinates = true;
              this._lastX = x;
              this._lastY = y;
              this._extendBoundsByPoint(x, y);
            };
            Graphics.classInitializer = null;
            Graphics.initializer = null;

            Graphics.classSymbols = null;
            Graphics.instanceSymbols = null;
            return Graphics;
          })(AS.ASNative);
          display.Graphics = Graphics;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var assert = Shumway.Debug.assert;
          var notImplemented = Shumway.Debug.notImplemented;

          var Sprite = (function (_super) {
            __extends(Sprite, _super);
            function Sprite() {
              false && _super.call(this);
              display.DisplayObjectContainer.instanceConstructorNoInitialize.call(this);
              this._constructChildren();
            }
            Sprite.prototype._initializeChildren = function (frame) {
              for (var depth in frame.stateAtDepth) {
                var state = frame.stateAtDepth[depth];
                if (state) {
                  var character = display.DisplayObject.createAnimatedDisplayObject(state, false);
                  this.addTimelineObjectAtDepth(character, state.depth);
                  if (state.symbol.isAS2Object) {
                    this._initAvm1Bindings(character, state);
                  }
                }
              }
            };

            Sprite.prototype._initAvm1Bindings = function (instance, state) {
              var instanceAS2Object = AS.avm1lib.getAS2Object(instance);
              assert(instanceAS2Object);

              if (state.variableName) {
                instanceAS2Object.asSetPublicProperty('variable', state.variableName);
              }

              var events = state.events;
              if (events) {
                var eventsBound = [];
                for (var i = 0; i < events.length; i++) {
                  var event = events[i];
                  var eventNames = event.eventNames;
                  var fn = event.handler.bind(instance);
                  for (var j = 0; j < eventNames.length; j++) {
                    var eventName = eventNames[j];
                    var avm2EventTarget = instance;
                    if (eventName === 'mouseDown' || eventName === 'mouseUp' || eventName === 'mouseMove') {
                      avm2EventTarget = instance.stage;
                    }
                    avm2EventTarget.addEventListener(eventName, fn, false);
                    eventsBound.push({ eventName: eventName, fn: fn, target: avm2EventTarget });
                  }
                }
                if (eventsBound.length > 0) {
                  instance.addEventListener('removed', function (eventsBound) {
                    for (var i = 0; i < eventsBound.length; i++) {
                      eventsBound[i].target.removeEventListener(eventsBound[i].eventName, eventsBound[i].fn, false);
                    }
                  }.bind(instance, eventsBound), false);
                }
              }

              if (state.name) {
                var parentAS2Object = AS.avm1lib.getAS2Object(this);
                parentAS2Object.asSetPublicProperty(state.name, instanceAS2Object);
              }
            };

            Sprite.prototype._canHaveGraphics = function () {
              return true;
            };

            Sprite.prototype._getGraphics = function () {
              return this._graphics;
            };

            Object.defineProperty(Sprite.prototype, "graphics", {
              get: function () {
                return this._ensureGraphics();
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Sprite.prototype, "buttonMode", {
              get: function () {
                return this._buttonMode;
              },
              set: function (value) {
                this._buttonMode = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Sprite.prototype, "dropTarget", {
              get: function () {
                notImplemented("public flash.display.Sprite::get dropTarget");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Sprite.prototype, "hitArea", {
              get: function () {
                return this._hitArea;
              },
              set: function (value) {
                value = value;
                if (this._hitArea === value) {
                  return;
                }
                if (value && value._hitTarget) {
                  value._hitTarget._hitArea = null;
                }
                this._hitArea = value;
                if (value) {
                  value._hitTarget = this;
                }
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Sprite.prototype, "useHandCursor", {
              get: function () {
                return this._useHandCursor;
              },
              set: function (value) {
                this._useHandCursor = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Sprite.prototype, "soundTransform", {
              get: function () {
                notImplemented("public flash.display.Sprite::get soundTransform");
                return;
              },
              set: function (sndTransform) {
                sndTransform = sndTransform;
                notImplemented("public flash.display.Sprite::set soundTransform");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Sprite.prototype.startDrag = function (lockCenter, bounds) {
              if (typeof lockCenter === "undefined") { lockCenter = false; }
              if (typeof bounds === "undefined") { bounds = null; }
              lockCenter = !!lockCenter;
              bounds = bounds;
              notImplemented("public flash.display.Sprite::startDrag");
              return;
            };
            Sprite.prototype.stopDrag = function () {
              notImplemented("public flash.display.Sprite::stopDrag");
              return;
            };
            Sprite.prototype.startTouchDrag = function (touchPointID, lockCenter, bounds) {
              if (typeof lockCenter === "undefined") { lockCenter = false; }
              if (typeof bounds === "undefined") { bounds = null; }
              touchPointID = touchPointID | 0;
              lockCenter = !!lockCenter;
              bounds = bounds;
              notImplemented("public flash.display.Sprite::startTouchDrag");
              return;
            };
            Sprite.prototype.stopTouchDrag = function (touchPointID) {
              touchPointID = touchPointID | 0;
              notImplemented("public flash.display.Sprite::stopTouchDrag");
              return;
            };
            Sprite.classInitializer = null;

            Sprite.initializer = function (symbol) {
              var self = this;

              self._graphics = null;
              self._buttonMode = false;
              self._dropTarget = null;
              self._hitArea = null;
              self._useHandCursor = true;

              self._hitTarget = null;

              if (symbol) {
                if (symbol.isRoot) {
                  self._root = self;
                }
                if (symbol.numFrames) {
                  release || assert(symbol.frames.length >= 1, "Sprites have at least one frame.");
                  var frame = symbol.frames[0];
                  release || assert(frame, "Initial frame is not defined.");
                  self._initializeChildren(frame);
                }
              }
            };

            Sprite.classSymbols = null;

            Sprite.instanceSymbols = null;
            return Sprite;
          })(flash.display.DisplayObjectContainer);
          display.Sprite = Sprite;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var assert = Shumway.Debug.assert;
          var assertUnreachable = Shumway.Debug.assertUnreachable;

          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var throwError = Shumway.AVM2.Runtime.throwError;

          var Telemetry = Shumway.Telemetry;

          var Multiname = Shumway.AVM2.ABC.Multiname;

          var MovieClipSoundsManager = (function () {
            function MovieClipSoundsManager(mc) {
              this._mc = mc;
              this._startSoundRegistrations = null;
              this._soundStream = null;
            }
            MovieClipSoundsManager.prototype.registerStartSounds = function (frameNum, soundStartInfo) {
              if (this._startSoundRegistrations === null) {
                this._startSoundRegistrations = {};
              }
              this._startSoundRegistrations[frameNum] = soundStartInfo;
            };

            MovieClipSoundsManager.prototype.initSoundStream = function (streamInfo) {
              this._soundStream = new display.MovieClipSoundStream(streamInfo, this._mc);
            };

            MovieClipSoundsManager.prototype.addSoundStreamBlock = function (frameNum, streamBlock) {
              this._soundStream.appendBlock(frameNum, streamBlock);
            };

            MovieClipSoundsManager.prototype._startSounds = function (frameNum) {
              var starts = this._startSoundRegistrations[frameNum];
              if (starts) {
                var sounds = this._soundClips || (this._soundClips = {});
                var loaderInfo = this._mc.loaderInfo;
                for (var i = 0; i < starts.length; i++) {
                  var start = starts[i];
                  var symbolId = start.soundId;
                  var info = start.soundInfo;
                  var sound = sounds[symbolId];
                  if (!sound) {
                    var symbolInfo = loaderInfo.getSymbolById(symbolId);
                    if (!symbolInfo) {
                      continue;
                    }

                    var symbolClass = symbolInfo.symbolClass;
                    var soundObj = symbolClass.initializeFrom(symbolInfo);
                    symbolClass.instanceConstructorNoInitialize.call(soundObj);
                    sounds[symbolId] = sound = { object: soundObj };
                  }
                  if (sound.channel) {
                    sound.channel.stop();
                    sound.channel = null;
                  }
                  if (!info.stop) {
                    var loops = info.hasLoops ? info.loopCount : 0;
                    sound.channel = sound.object.play(0, loops);
                  }
                }
              }
            };

            MovieClipSoundsManager.prototype.syncSounds = function (frameNum) {
              if (this._startSoundRegistrations !== null) {
                this._startSounds(frameNum);
              }
              if (this._soundStream) {
                this._soundStream.playFrame(frameNum);
              }
            };
            return MovieClipSoundsManager;
          })();

          var MovieClip = (function (_super) {
            __extends(MovieClip, _super);
            function MovieClip() {
              false && _super.call(this);
              display.Sprite.instanceConstructorNoInitialize.call(this);
            }
            MovieClip.reset = function () {
              MovieClip._callQueue = [];
            };

            MovieClip.runFrameScripts = function () {
              AVM2.enterTimeline("MovieClip.executeFrame");
              var queue = MovieClip._callQueue;
              MovieClip._callQueue = [];
              for (var i = 0; i < queue.length; i++) {
                var instance = queue[i];

                instance._allowFrameNavigation = false;
                instance.callFrame(instance._currentFrame);
                instance._allowFrameNavigation = true;

                if (instance._nextFrame !== instance._currentFrame) {
                  display.DisplayObject.performFrameNavigation(false, true);
                }
              }
              AVM2.leaveTimeline();
            };

            MovieClip.prototype._setParent = function (parent, depth) {
              _super.prototype._setParent.call(this, parent, depth);
              if (parent && this._hasAnyFlags(4096 /* HasFrameScriptPending */ | 8192 /* ContainsFrameScriptPendingChildren */)) {
                parent._propagateFlagsUp(8192 /* ContainsFrameScriptPendingChildren */);
              }
            };

            MovieClip.prototype._initFrame = function (advance) {
              if (advance && this.buttonMode) {
                var state = null;
                if (this._mouseOver) {
                  state = this._mouseDown ? '_down' : '_over';
                } else if (this._currentButtonState !== null) {
                  state = '_up';
                }
                if (state !== this._currentButtonState && this._buttonFrames[state]) {
                  this.stop();
                  this._gotoFrame(state, null);
                  this._currentButtonState = state;
                  this._advanceFrame();
                  return;
                }
              }
              if (advance) {
                if (this._totalFrames > 1 && !this._stopped && this._hasFlags(256 /* Constructed */)) {
                  this._nextFrame++;
                }
              }
              this._advanceFrame();
            };

            MovieClip.prototype._constructFrame = function () {
              this._constructChildren();
            };

            MovieClip.prototype._enqueueFrameScripts = function () {
              if (this._hasFlags(4096 /* HasFrameScriptPending */)) {
                this._removeFlags(4096 /* HasFrameScriptPending */);
                MovieClip._callQueue.push(this);
              }
              _super.prototype._enqueueFrameScripts.call(this);
            };

            Object.defineProperty(MovieClip.prototype, "currentFrame", {
              get: function () {
                return this._currentFrame - this._sceneForFrameIndex(this._currentFrame).offset;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(MovieClip.prototype, "framesLoaded", {
              get: function () {
                return this._frames.length;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(MovieClip.prototype, "totalFrames", {
              get: function () {
                return this._totalFrames;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(MovieClip.prototype, "trackAsMenu", {
              get: function () {
                return this._trackAsMenu;
              },
              set: function (value) {
                this._trackAsMenu = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(MovieClip.prototype, "scenes", {
              get: function () {
                return this._scenes.map(function (scene) {
                  return scene.clone();
                });
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(MovieClip.prototype, "currentScene", {
              get: function () {
                var scene = this._sceneForFrameIndex(this._currentFrame);
                return scene.clone();
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(MovieClip.prototype, "currentLabel", {
              get: function () {
                var label = this._labelForFrame(this._currentFrame);
                return label ? label.name : null;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(MovieClip.prototype, "currentFrameLabel", {
              get: function () {
                var scene = this._sceneForFrameIndex(this._currentFrame);
                var label = scene.getLabelByFrame(this._currentFrame - scene.offset);
                return label && label.name;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(MovieClip.prototype, "enabled", {
              get: function () {
                return this._enabled;
              },
              set: function (value) {
                this._enabled = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(MovieClip.prototype, "isPlaying", {
              get: function () {
                return this._isPlaying;
              },
              enumerable: true,
              configurable: true
            });

            MovieClip.prototype.play = function () {
              if (this._totalFrames > 1) {
                this._isPlaying = true;
              }
              this._stopped = false;
            };

            MovieClip.prototype.stop = function () {
              this._isPlaying = false;
              this._stopped = true;
            };

            MovieClip.prototype._gotoFrame = function (frame, sceneName) {
              var scene;
              if (sceneName !== null) {
                sceneName = asCoerceString(sceneName);
                var scenes = this._scenes;
                release || assert(scenes.length, "There should be at least one scene defined.");
                for (var i = 0; i < scenes.length; i++) {
                  scene = scenes[i];
                  if (scene.name === sceneName) {
                    break;
                  }
                }
                if (i === scenes.length) {
                  throwError('ArgumentError', AVM2.Errors.SceneNotFoundError, sceneName);
                }
              } else {
                scene = this._sceneForFrameIndex(this._currentFrame);
              }

              var frameNum = parseInt(frame, 10);
              if (frameNum != frame) {
                var label = scene.getLabelByName(frame);
                if (!label) {
                  throwError('ArgumentError', AVM2.Errors.FrameLabelNotFoundError, frame, sceneName);
                }
                frameNum = label.frame;
              }

              this._gotoFrameAbs(scene.offset + frameNum);
            };

            MovieClip.prototype._gotoFrameAbs = function (frame) {
              if (frame < 1) {
                frame = 1;
              } else if (frame > this._totalFrames) {
                frame = this._totalFrames;
              }
              if (frame === this._nextFrame) {
                return;
              }

              this._nextFrame = frame;

              if (this._allowFrameNavigation) {
                display.DisplayObject.performFrameNavigation(false, true);
              }
            };

            MovieClip.prototype._advanceFrame = function () {
              var currentFrame = this._currentFrame;
              var nextFrame = this._nextFrame;

              if (nextFrame > this._totalFrames) {
                nextFrame = 1;
              }

              if (currentFrame === nextFrame) {
                this._nextFrame = nextFrame;
                return;
              }

              if (nextFrame > this.framesLoaded) {
                this._nextFrame = nextFrame;

                return;
              }

              var frames = this._frames;
              var startIndex = currentFrame;
              if (nextFrame < currentFrame) {
                var frame = frames[0];
                release || assert(frame, "FrameDelta is not defined.");
                var stateAtDepth = frame.stateAtDepth;
                var children = this._children.slice();
                for (var i = 0; i < children.length; i++) {
                  var child = children[i];
                  if (child._depth) {
                    var state = stateAtDepth[child._depth];
                    if (!state || !state.canBeAnimated(child)) {
                      this._removeAnimatedChild(child);
                    }
                  }
                }
                startIndex = 0;
              }
              for (var i = startIndex; i < nextFrame; i++) {
                var frame = frames[i];
                release || assert(frame, "FrameDelta is not defined.");
                var stateAtDepth = frame.stateAtDepth;
                for (var depth in stateAtDepth) {
                  var child = this.getTimelineObjectAtDepth(depth | 0);
                  var state = stateAtDepth[depth];
                  if (child) {
                    if (state && state.canBeAnimated(child)) {
                      if (state.symbol && !state.symbol.dynamic) {
                        child._setStaticContentFromSymbol(state.symbol);
                      }
                      child._animate(state);
                      continue;
                    }
                    this._removeAnimatedChild(child);
                  }
                  if (state && state.symbol) {
                    var character = display.DisplayObject.createAnimatedDisplayObject(state, false);
                    this.addTimelineObjectAtDepth(character, state.depth);
                    if (state.symbol.isAS2Object) {
                      this._initAvm1Bindings(character, state);
                    }
                  }
                }
              }

              if (this._frameScripts[nextFrame]) {
                this._setFlags(4096 /* HasFrameScriptPending */);
                this._parent && this._propagateFlagsUp(8192 /* ContainsFrameScriptPendingChildren */);
              }

              this._currentFrame = this._nextFrame = nextFrame;

              this._syncSounds(nextFrame);
            };

            MovieClip.prototype._sceneForFrameIndex = function (frameIndex) {
              var scenes = this._scenes;

              if (frameIndex === 0) {
                return scenes[0];
              }
              for (var i = 0; i < scenes.length; i++) {
                var scene = scenes[i];
                if (scene.offset < frameIndex && scene.offset + scene.numFrames >= frameIndex) {
                  return scene;
                }
              }
              release || assertUnreachable("Must have at least one scene covering all frames.");
            };

            MovieClip.prototype._labelForFrame = function (frame) {
              var scenes = this._scenes;
              var label = null;
              for (var i = 0; i < scenes.length; i++) {
                var scene = scenes[i];
                if (scene.offset > frame) {
                  return label;
                }
                var labels = scene.labels;
                for (var j = 0; j < labels.length; j++) {
                  var currentLabel = labels[j];
                  if (currentLabel.frame > frame - scene.offset) {
                    return label;
                  }
                  label = currentLabel;
                }
              }
              return label;
            };

            MovieClip.prototype._removeAnimatedChild = function (child) {
              this.removeChild(child);
              if (child._name) {
                var mn = Multiname.getPublicQualifiedName(child._name);
                if (this[mn] === child) {
                  this[mn] = null;
                }
              }
            };

            MovieClip.prototype.callFrame = function (frame) {
              frame = frame | 0;
              var frameScript = this._frameScripts[frame];
              if (!frameScript) {
                return;
              }
              try  {
                frameScript.call(this);
              } catch (e) {
                Telemetry.instance.reportTelemetry({ topic: 'error', error: 2 /* AVM2_ERROR */ });

                this.stop();
                throw e;
              }
            };

            MovieClip.prototype.nextFrame = function () {
              this.gotoAndStop(this._currentFrame + 1);
            };

            MovieClip.prototype.prevFrame = function () {
              this.gotoAndStop(this._currentFrame - 1);
            };

            MovieClip.prototype.gotoAndPlay = function (frame, scene) {
              if (typeof scene === "undefined") { scene = null; }
              if (arguments.length === 0 || arguments.length > 2) {
                throwError('ArgumentError', AVM2.Errors.WrongArgumentCountError, 'flash.display::MovieClip/gotoAndPlay()', 1, arguments.length);
              }
              scene = asCoerceString(scene);
              frame = asCoerceString(frame) + '';
              this.play();
              this._gotoFrame(frame, scene);
            };

            MovieClip.prototype.gotoAndStop = function (frame, scene) {
              if (typeof scene === "undefined") { scene = null; }
              if (arguments.length === 0 || arguments.length > 2) {
                throwError('ArgumentError', AVM2.Errors.WrongArgumentCountError, 'flash.display::MovieClip/gotoAndPlay()', 1, arguments.length);
              }
              scene = asCoerceString(scene);
              frame = asCoerceString(frame) + '';
              this.stop();
              this._gotoFrame(frame, scene);
            };

            MovieClip.prototype.addFrameScript = function (frameIndex, script) {
              if (!this._currentFrame) {
                return;
              }

              var numArgs = arguments.length;
              if (numArgs & 1) {
                throwError('ArgumentError', AVM2.Errors.TooFewArgumentsError, numArgs, numArgs + 1);
              }
              var frameScripts = this._frameScripts;
              var totalFrames = this._totalFrames;
              for (var i = 0; i < numArgs; i += 2) {
                var frameNum = (arguments[i] | 0) + 1;
                if (frameNum < 1 || frameNum > totalFrames) {
                  continue;
                }
                frameScripts[frameNum] = arguments[i + 1];
                if (frameNum === this._currentFrame) {
                  this._setFlags(4096 /* HasFrameScriptPending */);
                  this._parent && this._propagateFlagsUp(8192 /* ContainsFrameScriptPendingChildren */);
                }
              }
            };

            MovieClip.prototype.addAS2FrameScript = function (frameIndex, actionsBlock) {
              var frameScripts = this._as2FrameScripts;
              if (!frameScripts) {
                release || assert(!this._boundExecuteAS2FrameScripts);
                this._boundExecuteAS2FrameScripts = this._executeAS2FrameScripts.bind(this);
                frameScripts = this._as2FrameScripts = [];
              }
              var scripts = frameScripts[frameIndex + 1];
              if (!scripts) {
                scripts = frameScripts[frameIndex + 1] = [];
                this.addFrameScript(frameIndex, this._boundExecuteAS2FrameScripts);
              }
              var actionsData = new Shumway.AVM1.AS2ActionsData(actionsBlock, 'f' + frameIndex + 'i' + scripts.length);
              scripts.push(actionsData);
            };

            MovieClip.prototype.addAS2InitActionBlock = function (frameIndex, actionsBlock) {
              var self = this;
              function listener(e) {
                if (self._currentFrame !== frameIndex + 1) {
                  return;
                }
                self.removeEventListener('enterFrame', listener);

                var avm1Context = self.loaderInfo._avm1Context;
                var as2Object = AS.avm1lib.getAS2Object(self);
                var stage = self.stage;
                var actionsData = new Shumway.AVM1.AS2ActionsData(actionsBlock.actionsData, 'f' + frameIndex);
                avm1Context.executeActions(actionsData, stage, as2Object);
              }
              this.addEventListener('enterFrame', listener);
            };

            MovieClip.prototype._executeAS2FrameScripts = function () {
              var avm1Context = this.loaderInfo._avm1Context;
              var as2Object = AS.avm1lib.getAS2Object(this);
              var scripts = this._as2FrameScripts[this._currentFrame];
              release || assert(scripts && scripts.length);
              for (var i = 0; i < scripts.length; i++) {
                var actionsData = scripts[i];
                avm1Context.executeActions(actionsData, this.stage, as2Object);
              }
            };

            Object.defineProperty(MovieClip.prototype, "_isFullyLoaded", {
              get: function () {
                return this.framesLoaded >= this.totalFrames;
              },
              enumerable: true,
              configurable: true
            });

            MovieClip.prototype._registerStartSounds = function (frameNum, soundStartInfo) {
              if (this._sounds === null) {
                this._sounds = new MovieClipSoundsManager(this);
              }
              this._sounds.registerStartSounds(frameNum, soundStartInfo);
            };

            MovieClip.prototype._initSoundStream = function (streamInfo) {
              if (this._sounds === null) {
                this._sounds = new MovieClipSoundsManager(this);
              }
              this._sounds.initSoundStream(streamInfo);
            };

            MovieClip.prototype._addSoundStreamBlock = function (frameIndex, streamBlock) {
              this._sounds.addSoundStreamBlock(frameIndex + 1, streamBlock);
            };

            MovieClip.prototype._syncSounds = function (frameNum) {
              if (this._sounds !== null) {
                this._sounds.syncSounds(frameNum + 1);
              }
            };

            MovieClip.prototype.addScene = function (name, labels, offset, numFrames) {
              this._scenes.push(new display.Scene(name, labels, offset, numFrames));
            };

            MovieClip.prototype.addFrameLabel = function (name, frame) {
              var scene = this._sceneForFrameIndex(frame);
              if (!scene.getLabelByName(name)) {
                scene.labels.push(new flash.display.FrameLabel(name, frame - scene.offset));
              }
            };

            MovieClip.prototype.prevScene = function () {
              var currentScene = this._sceneForFrameIndex(this._currentFrame);
              if (currentScene.offset === 0) {
                return;
              }

              this._gotoFrameAbs(this._sceneForFrameIndex(currentScene.offset).offset + 1);
            };

            MovieClip.prototype.nextScene = function () {
              var currentScene = this._sceneForFrameIndex(this._currentFrame);
              if (currentScene.offset + currentScene.numFrames === this._totalFrames) {
                return;
              }
              this._gotoFrameAbs(currentScene.offset + currentScene.numFrames + 1);
            };
            MovieClip.classInitializer = function () {
              MovieClip.reset();
            };

            MovieClip.initializer = function (symbol) {
              var self = this;

              display.DisplayObject._advancableInstances.push(self);

              self._currentFrame = 0;
              self._totalFrames = 1;
              self._trackAsMenu = false;
              self._scenes = [];
              self._enabled = true;
              self._isPlaying = false;

              self._frames = [];
              self._frameScripts = [];
              self._nextFrame = 1;
              self._stopped = false;
              self._allowFrameNavigation = true;

              self._sounds = null;

              self._buttonFrames = Object.create(null);
              self._currentButtonState = null;

              if (symbol) {
                self._totalFrames = symbol.numFrames;
                self._currentFrame = 1;
                if (!symbol.isRoot) {
                  self.addScene('', symbol.labels, 0, symbol.numFrames);
                }
                self._frames = symbol.frames;
                if (symbol.isAS2Object) {
                  this._mouseEnabled = false;
                  if (symbol.frameScripts) {
                    var data = symbol.frameScripts;
                    for (var i = 0; i < data.length; i += 2) {
                      self.addAS2FrameScript(data[i], data[i + 1]);
                    }
                  }
                }
                if (symbol.initActionBlock) {
                  this.addAS2InitActionBlock(0, symbol.initActionBlock);
                }
              } else {
                self.addScene('', [], 0, self._totalFrames);
              }
            };

            MovieClip.classSymbols = null;

            MovieClip.instanceSymbols = null;
            return MovieClip;
          })(flash.display.Sprite);
          display.MovieClip = MovieClip;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var MP3_MIME_TYPE = 'audio/mpeg';

          function openMediaSource(soundStream, mediaSource) {
            var sourceBuffer;
            try  {
              sourceBuffer = mediaSource.addSourceBuffer(MP3_MIME_TYPE);
              soundStream.mediaSource = mediaSource;
              soundStream.sourceBuffer = sourceBuffer;

              var rawFramesLength = 0;
              soundStream.rawFrames.forEach(function (frameData) {
                rawFramesLength += frameData.length;
              });
              if (rawFramesLength !== 0) {
                var data = new Uint8Array(rawFramesLength), offset = 0;
                soundStream.rawFrames.forEach(function (frameData) {
                  data.set(frameData, offset);
                  offset += frameData.length;
                });
                sourceBuffer.appendBuffer(data);
              }
              soundStream.rawFrames = null;
            } catch (e) {
              console.error('MediaSource mp3 playback is not supported: ' + e);
            }
          }

          function syncTime(element, movieClip) {
            var initialized = false;
            var startMediaTime, startRealTime;
            element.addEventListener('timeupdate', function (e) {
              if (!initialized) {
                startMediaTime = element.currentTime;
                startRealTime = performance.now();
                initialized = true;

                return;
              }
              var mediaDelta = element.currentTime - startMediaTime;
              var realDelta = performance.now() - startRealTime;
            });
            element.addEventListener('pause', function (e) {
              initialized = false;
            });
            element.addEventListener('seeking', function (e) {
              initialized = false;
            });
          }

          var PLAY_USING_AUDIO_TAG = true;

          var MovieClipSoundStream = (function () {
            function MovieClipSoundStream(streamInfo, movieClip) {
              this.movieClip = movieClip;
              this.data = {
                sampleRate: streamInfo.sampleRate,
                channels: streamInfo.channels
              };
              this.seekIndex = [];
              this.position = 0;
              var isMP3 = streamInfo.format === 'mp3';
              if (isMP3 && PLAY_USING_AUDIO_TAG) {
                var element = document.createElement('audio');
                element.preload = 'metadata';
                element.loop = false;
                syncTime(element, movieClip);
                if (element.canPlayType(MP3_MIME_TYPE)) {
                  this.element = element;
                  if (typeof MediaSource !== 'undefined') {
                    var mediaSource = new MediaSource();
                    mediaSource.addEventListener('sourceopen', openMediaSource.bind(null, this, mediaSource));
                    element.src = URL.createObjectURL(mediaSource);
                  } else {
                    console.warn('MediaSource is not supported');
                  }
                  this.rawFrames = [];
                  return;
                }
              }
              var totalSamples = streamInfo.samplesCount * streamInfo.channels;
              this.data.pcm = new Float32Array(totalSamples);
              if (isMP3) {
                var soundStream = this;
                soundStream.decoderPosition = 0;
                soundStream.decoderSession = new MP3DecoderSession();
                soundStream.decoderSession.onframedata = function (frameData) {
                  var position = soundStream.decoderPosition;
                  soundStream.data.pcm.set(frameData, position);
                  soundStream.decoderPosition = position + frameData.length;
                }.bind(this);
                soundStream.decoderSession.onerror = function (error) {
                  console.error('ERROR: MP3DecoderSession: ' + error);
                };
              }
            }
            MovieClipSoundStream.prototype.appendBlock = function (frameNum, streamBlock) {
              var streamPosition = this.position;
              this.seekIndex[frameNum] = streamPosition + streamBlock.seek * this.data.channels;
              this.position = streamPosition + streamBlock.samplesCount * this.data.channels;

              if (this.sourceBuffer) {
                this.sourceBuffer.appendBuffer(streamBlock.data);
                return;
              }
              if (this.rawFrames) {
                this.rawFrames.push(streamBlock.data);
                return;
              }

              var decoderSession = this.decoderSession;
              if (decoderSession) {
                decoderSession.pushAsync(streamBlock.data);
              } else {
                this.data.pcm.set(streamBlock.pcm, streamPosition);
              }
            };

            MovieClipSoundStream.prototype.playFrame = function (frameNum) {
              if (isNaN(this.seekIndex[frameNum])) {
                return;
              }

              var PAUSE_WHEN_OF_SYNC_GREATER = 1.0;
              var PLAYBACK_ADJUSTMENT = 0.25;
              var element = this.element;
              if (element) {
                var soundStreamData = this.data;
                var time = this.seekIndex[frameNum] / soundStreamData.sampleRate / soundStreamData.channels;
                if (!this.channel && (this.movieClip._isFullyLoaded || this.sourceBuffer)) {
                  if (!this.sourceBuffer) {
                    var blob = new Blob(this.rawFrames);
                    element.src = URL.createObjectURL(blob);
                  }

                  var channel = flash.media.SoundChannel.initializeFrom({ element: element });
                  this.channel = channel;
                  this.expectedFrame = 0;
                  this.waitFor = 0;
                } else if (this.sourceBuffer || !isNaN(element.duration)) {
                  if (this.mediaSource && this.movieClip._isFullyLoaded) {
                    this.mediaSource.endOfStream();
                    this.mediaSource = null;
                  }
                  var elementTime = element.currentTime;
                  if (this.expectedFrame !== frameNum) {
                    if (element.paused) {
                      element.play();
                      element.addEventListener('playing', function setTime(e) {
                        element.removeEventListener('playing', setTime);
                        element.currentTime = time;
                      });
                    } else {
                      element.currentTime = time;
                    }
                  } else if (this.waitFor > 0) {
                    if (this.waitFor <= time) {
                      if (element.paused) {
                        element.play();
                      }
                      this.waitFor = 0;
                    }
                  } else if (elementTime - time > PAUSE_WHEN_OF_SYNC_GREATER) {
                    console.warn('Sound is faster than frames by ' + (elementTime - time));
                    this.waitFor = elementTime - PLAYBACK_ADJUSTMENT;
                    element.pause();
                  } else if (time - elementTime > PAUSE_WHEN_OF_SYNC_GREATER) {
                    console.warn('Sound is slower than frames by ' + (time - elementTime));
                    element.currentTime = time + PLAYBACK_ADJUSTMENT;
                  }
                  this.expectedFrame = frameNum + 1;
                }
              } else if (!this.sound) {
                var sound = flash.media.Sound.initializeFrom(this.data);
                var channel = sound.play();
                this.sound = sound;
                this.channel = channel;
              }
            };
            return MovieClipSoundStream;
          })();
          display.MovieClipSoundStream = MovieClipSoundStream;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;
          var assert = Shumway.Debug.assert;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var throwError = Shumway.AVM2.Runtime.throwError;

          var Stage = (function (_super) {
            __extends(Stage, _super);
            function Stage() {
              false && _super.call(this);
              display.DisplayObjectContainer.instanceConstructorNoInitialize.call(this);
              this._root = this;
              this._stage = this;
              this._frameRate = 24;
              this._scaleMode = display.StageScaleMode.SHOW_ALL;
              this._align = "";
              this._stageWidth = 0;
              this._stageHeight = 0;
              this._showDefaultContextMenu = true;
              this._focus = null;
              this._colorCorrection = display.ColorCorrection.DEFAULT;
              this._colorCorrectionSupport = display.ColorCorrectionSupport.DEFAULT_OFF;
              this._stageFocusRect = true;
              this._quality = display.StageQuality.HIGH;
              this._displayState = null;
              this._fullScreenSourceRect = null;
              this._mouseLock = false;
              this._stageVideos = new AS.GenericVector(0, true, AS.ASObject);
              this._stage3Ds = null;
              this._colorARGB = 0xFFFFFFFF;
              this._fullScreenWidth = 0;
              this._fullScreenHeight = 0;
              this._wmodeGPU = false;
              this._softKeyboardRect = new flash.geom.Rectangle();
              this._allowsFullScreen = false;
              this._allowsFullScreenInteractive = false;
              this._contentsScaleFactor = 1;
              this._displayContextInfo = null;

              this._timeout = -1;

              this._invalidated = false;
            }
            Object.defineProperty(Stage.prototype, "frameRate", {
              get: function () {
                return this._frameRate;
              },
              set: function (value) {
                this._frameRate = +value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "scaleMode", {
              get: function () {
                return this._scaleMode;
              },
              set: function (value) {
                value = asCoerceString(value);
                if (flash.display.StageScaleMode.toNumber(value) < 0) {
                  throwError("ArgumentError", AVM2.Errors.InvalidEnumError, "scaleMode");
                }
                this._scaleMode = value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "align", {
              get: function () {
                return this._align;
              },
              set: function (value) {
                value = asCoerceString(value);
                var n = flash.display.StageAlign.toNumber(value);
                release || assert(n >= 0);
                this._align = flash.display.StageAlign.fromNumber(n);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "stageWidth", {
              get: function () {
                return (this._stageWidth / 20) | 0;
              },
              set: function (value) {
                value = value | 0;
              },
              enumerable: true,
              configurable: true
            });


            Stage.prototype._setInitialName = function () {
              this._name = null;
            };

            Stage.prototype.setStageWidth = function (value) {
              release || assert((value | 0) === value);
              this._stageWidth = (value * 20) | 0;
            };

            Object.defineProperty(Stage.prototype, "stageHeight", {
              get: function () {
                return (this._stageHeight / 20) | 0;
              },
              set: function (value) {
                value = value | 0;
              },
              enumerable: true,
              configurable: true
            });


            Stage.prototype.setStageHeight = function (value) {
              release || assert((value | 0) === value);
              this._stageHeight = (value * 20) | 0;
            };

            Object.defineProperty(Stage.prototype, "showDefaultContextMenu", {
              get: function () {
                return this._showDefaultContextMenu;
              },
              set: function (value) {
                this._showDefaultContextMenu = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "focus", {
              get: function () {
                return this._focus;
              },
              set: function (newFocus) {
                this._focus = newFocus;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "colorCorrection", {
              get: function () {
                return this._colorCorrection;
              },
              set: function (value) {
                notImplemented("public flash.display.Stage::set colorCorrection");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "colorCorrectionSupport", {
              get: function () {
                return this._colorCorrectionSupport;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "stageFocusRect", {
              get: function () {
                return this._stageFocusRect;
              },
              set: function (on) {
                this._stageFocusRect = !!on;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "quality", {
              get: function () {
                return this._quality.toUpperCase();
              },
              set: function (value) {
                value = (asCoerceString(value) || '').toLowerCase();
                if (flash.display.StageQuality.toNumber(value) < 0) {
                  value = flash.display.StageQuality.HIGH;
                }
                this._quality = value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "displayState", {
              get: function () {
                return this._displayState;
              },
              set: function (value) {
                somewhatImplemented("public flash.display.Stage::set displayState");
                this._displayState = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "fullScreenSourceRect", {
              get: function () {
                return this._fullScreenSourceRect;
              },
              set: function (value) {
                notImplemented("public flash.display.Stage::set fullScreenSourceRect");
                return;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "mouseLock", {
              get: function () {
                return this._mouseLock;
              },
              set: function (value) {
                somewhatImplemented("public flash.display.Stage::set mouseLock");
                this._mouseLock = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Stage.prototype, "stageVideos", {
              get: function () {
                somewhatImplemented("public flash.display.Stage::get stageVideos");
                return this._stageVideos;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Stage.prototype, "stage3Ds", {
              get: function () {
                notImplemented("public flash.display.Stage::get stage3Ds");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "color", {
              get: function () {
                return this._colorARGB;
              },
              set: function (rgb) {
                this._colorARGB = rgb | 0xff000000;
              },
              enumerable: true,
              configurable: true
            });



            Object.defineProperty(Stage.prototype, "alpha", {
              get: function () {
                return this._colorTransform.alphaMultiplier;
              },
              set: function (alpha) {
                throwError("Error", AVM2.Errors.InvalidStageMethodError);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "fullScreenWidth", {
              get: function () {
                return this._fullScreenWidth;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "fullScreenHeight", {
              get: function () {
                return this._fullScreenHeight;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "wmodeGPU", {
              get: function () {
                return this._wmodeGPU;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "softKeyboardRect", {
              get: function () {
                return this._softKeyboardRect;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "allowsFullScreen", {
              get: function () {
                return this._allowsFullScreen;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "allowsFullScreenInteractive", {
              get: function () {
                return this._allowsFullScreenInteractive;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "contentsScaleFactor", {
              get: function () {
                return this._contentsScaleFactor;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Stage.prototype, "displayContextInfo", {
              get: function () {
                return this._displayContextInfo;
              },
              enumerable: true,
              configurable: true
            });

            Stage.prototype.swapChildrenAt = function (index1, index2) {
              index1 = index1 | 0;
              index2 = index2 | 0;
              notImplemented("public flash.display.Stage::swapChildrenAt");
              return;
            };

            Stage.prototype.invalidate = function () {
              this._invalidated = true;
            };

            Stage.prototype.isInvalidated = function () {
              return this._invalidated;
            };

            Stage.prototype.isFocusInaccessible = function () {
              notImplemented("public flash.display.Stage::isFocusInaccessible");
              return;
            };
            Stage.prototype.requireOwnerPermissions = function () {
              somewhatImplemented("public flash.display.Stage::requireOwnerPermissions");
              return;
            };

            Stage.prototype.render = function () {
              if (!this._invalidated) {
                return;
              }
              display.DisplayObject._broadcastFrameEvent(flash.events.Event.RENDER);
              this._invalidated = false;
            };

            Stage.prototype.getObjectsUnderMouse = function (globalPoint) {
              var objectsUnderPoint = [];
              this.visit(function (displayObject) {
                var isUnderMouse = false;
                if (!display.Sprite.isType(displayObject) || !displayObject.hitArea) {
                  isUnderMouse = displayObject._isUnderMouse(globalPoint.x * 20, globalPoint.y * 20);
                }
                if (isUnderMouse) {
                  objectsUnderPoint.push(displayObject);
                }
                return 0 /* Continue */;
              }, 0 /* None */);
              return objectsUnderPoint;
            };
            Stage.classInitializer = null;

            Stage.classSymbols = null;
            Stage.instanceSymbols = null;
            Stage.initializer = null;
            return Stage;
          })(flash.display.DisplayObjectContainer);
          display.Stage = Stage;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var ActionScriptVersion = (function (_super) {
            __extends(ActionScriptVersion, _super);
            function ActionScriptVersion() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.ActionScriptVersion");
            }
            ActionScriptVersion.classInitializer = null;

            ActionScriptVersion.initializer = null;

            ActionScriptVersion.classSymbols = null;

            ActionScriptVersion.instanceSymbols = null;

            ActionScriptVersion.ACTIONSCRIPT2 = 2;
            ActionScriptVersion.ACTIONSCRIPT3 = 3;
            return ActionScriptVersion;
          })(AS.ASNative);
          display.ActionScriptVersion = ActionScriptVersion;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var BlendMode = (function (_super) {
            __extends(BlendMode, _super);
            function BlendMode() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.BlendMode");
            }
            BlendMode.fromNumber = function (n) {
              switch (n) {
                case 0:
                case 1:
                  return BlendMode.NORMAL;
                case 2:
                  return BlendMode.LAYER;
                case 3:
                  return BlendMode.MULTIPLY;
                case 4:
                  return BlendMode.SCREEN;
                case 5:
                  return BlendMode.LIGHTEN;
                case 6:
                  return BlendMode.DARKEN;
                case 7:
                  return BlendMode.DIFFERENCE;
                case 8:
                  return BlendMode.ADD;
                case 9:
                  return BlendMode.SUBTRACT;
                case 10:
                  return BlendMode.INVERT;
                case 11:
                  return BlendMode.ALPHA;
                case 12:
                  return BlendMode.ERASE;
                case 13:
                  return BlendMode.OVERLAY;
                case 14:
                  return BlendMode.HARDLIGHT;
                default:
                  return null;
              }
            };

            BlendMode.toNumber = function (value) {
              switch (value) {
                case BlendMode.NORMAL:
                  return 1;
                case BlendMode.LAYER:
                  return 2;
                case BlendMode.MULTIPLY:
                  return 3;
                case BlendMode.SCREEN:
                  return 4;
                case BlendMode.LIGHTEN:
                  return 5;
                case BlendMode.DARKEN:
                  return 6;
                case BlendMode.DIFFERENCE:
                  return 7;
                case BlendMode.ADD:
                  return 8;
                case BlendMode.SUBTRACT:
                  return 9;
                case BlendMode.INVERT:
                  return 10;
                case BlendMode.ALPHA:
                  return 11;
                case BlendMode.ERASE:
                  return 12;
                case BlendMode.OVERLAY:
                  return 13;
                case BlendMode.HARDLIGHT:
                  return 14;
                default:
                  return -1;
              }
            };
            BlendMode.classInitializer = null;

            BlendMode.initializer = null;

            BlendMode.classSymbols = null;

            BlendMode.instanceSymbols = null;

            BlendMode.NORMAL = "normal";
            BlendMode.LAYER = "layer";
            BlendMode.MULTIPLY = "multiply";
            BlendMode.SCREEN = "screen";
            BlendMode.LIGHTEN = "lighten";
            BlendMode.DARKEN = "darken";
            BlendMode.ADD = "add";
            BlendMode.SUBTRACT = "subtract";
            BlendMode.DIFFERENCE = "difference";
            BlendMode.INVERT = "invert";
            BlendMode.OVERLAY = "overlay";
            BlendMode.HARDLIGHT = "hardlight";
            BlendMode.ALPHA = "alpha";
            BlendMode.ERASE = "erase";
            BlendMode.SHADER = "shader";
            return BlendMode;
          })(AS.ASNative);
          display.BlendMode = BlendMode;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var ColorCorrection = (function (_super) {
            __extends(ColorCorrection, _super);
            function ColorCorrection() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.ColorCorrection");
            }
            ColorCorrection.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return ColorCorrection.DEFAULT;
                case 1:
                  return ColorCorrection.ON;
                case 2:
                  return ColorCorrection.OFF;
                default:
                  return null;
              }
            };

            ColorCorrection.toNumber = function (value) {
              switch (value) {
                case ColorCorrection.DEFAULT:
                  return 0;
                case ColorCorrection.ON:
                  return 1;
                case ColorCorrection.OFF:
                  return 2;
                default:
                  return -1;
              }
            };
            ColorCorrection.classInitializer = null;

            ColorCorrection.initializer = null;

            ColorCorrection.classSymbols = null;

            ColorCorrection.instanceSymbols = null;

            ColorCorrection.DEFAULT = "default";
            ColorCorrection.ON = "on";
            ColorCorrection.OFF = "off";
            return ColorCorrection;
          })(AS.ASNative);
          display.ColorCorrection = ColorCorrection;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var ColorCorrectionSupport = (function (_super) {
            __extends(ColorCorrectionSupport, _super);
            function ColorCorrectionSupport() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.ColorCorrectionSupport");
            }
            ColorCorrectionSupport.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return ColorCorrectionSupport.UNSUPPORTED;
                case 1:
                  return ColorCorrectionSupport.DEFAULT_ON;
                case 2:
                  return ColorCorrectionSupport.DEFAULT_OFF;
                default:
                  return null;
              }
            };

            ColorCorrectionSupport.toNumber = function (value) {
              switch (value) {
                case ColorCorrectionSupport.UNSUPPORTED:
                  return 0;
                case ColorCorrectionSupport.DEFAULT_ON:
                  return 1;
                case ColorCorrectionSupport.DEFAULT_OFF:
                  return 2;
                default:
                  return -1;
              }
            };
            ColorCorrectionSupport.classInitializer = null;

            ColorCorrectionSupport.initializer = null;

            ColorCorrectionSupport.classSymbols = null;

            ColorCorrectionSupport.instanceSymbols = null;

            ColorCorrectionSupport.UNSUPPORTED = "unsupported";
            ColorCorrectionSupport.DEFAULT_ON = "defaultOn";
            ColorCorrectionSupport.DEFAULT_OFF = "defaultOff";
            return ColorCorrectionSupport;
          })(AS.ASNative);
          display.ColorCorrectionSupport = ColorCorrectionSupport;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var FocusDirection = (function (_super) {
            __extends(FocusDirection, _super);
            function FocusDirection() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.FocusDirection");
            }
            FocusDirection.classInitializer = null;

            FocusDirection.initializer = null;

            FocusDirection.classSymbols = null;

            FocusDirection.instanceSymbols = null;

            FocusDirection.TOP = "top";
            FocusDirection.BOTTOM = "bottom";
            FocusDirection.NONE = "none";
            return FocusDirection;
          })(AS.ASNative);
          display.FocusDirection = FocusDirection;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var FrameLabel = (function (_super) {
            __extends(FrameLabel, _super);
            function FrameLabel(name, frame) {
              false && _super.call(this, undefined);
              this._name = asCoerceString(name);
              this._frame = frame | 0;
            }
            Object.defineProperty(FrameLabel.prototype, "name", {
              get: function () {
                return this._name;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(FrameLabel.prototype, "frame", {
              get: function () {
                return this._frame;
              },
              enumerable: true,
              configurable: true
            });

            FrameLabel.prototype.clone = function () {
              return new FrameLabel(this._name, this._frame);
            };
            FrameLabel.classInitializer = null;

            FrameLabel.initializer = null;

            FrameLabel.classSymbols = null;

            FrameLabel.instanceSymbols = null;
            return FrameLabel;
          })(flash.events.EventDispatcher);
          display.FrameLabel = FrameLabel;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (_AVM2) {
    (function (AS) {
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;
          var assert = Shumway.Debug.assert;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var throwError = Shumway.AVM2.Runtime.throwError;
          var AVM2 = Shumway.AVM2.Runtime.AVM2;
          var swap32 = Shumway.IntegerUtilities.swap32;
          var premultiplyARGB = Shumway.ColorUtilities.premultiplyARGB;
          var unpremultiplyARGB = Shumway.ColorUtilities.unpremultiplyARGB;
          var RGBAToARGB = Shumway.ColorUtilities.RGBAToARGB;

          var blendPremultipliedBGRA = Shumway.ColorUtilities.blendPremultipliedBGRA;
          var ensureInverseSourceAlphaTable = Shumway.ColorUtilities.ensureInverseSourceAlphaTable;
          var indexOf = Shumway.ArrayUtilities.indexOf;

          var Rectangle = flash.geom.Rectangle;

          var BitmapData = (function (_super) {
            __extends(BitmapData, _super);
            function BitmapData(width, height, transparent, fillColorARGB) {
              if (typeof transparent === "undefined") { transparent = true; }
              if (typeof fillColorARGB === "undefined") { fillColorARGB = 4294967295; }
              width = width | 0;
              height = height | 0;
              fillColorARGB = fillColorARGB | 0;
              false && _super.call(this);
              this._id = flash.display.DisplayObject.getNextSyncID();
              if (this._symbol) {
                width = this._symbol.width;
                height = this._symbol.height;
              }
              if (width > BitmapData.MAXIMUM_WIDTH || width <= 0 || height > BitmapData.MAXIMUM_HEIGHT || height <= 0 || width * height > BitmapData.MAXIMUM_DIMENSION) {
                throwError('ArgumentError', _AVM2.Errors.InvalidBitmapData);
              }
              this._bitmapReferrers = [];
              this._transparent = !!transparent;
              this._rect = new Rectangle(0, 0, width, height);
              this._fillColorBGRA = swap32(fillColorARGB);
              if (this._symbol) {
                this._data = new Uint8Array(this._symbol.data.buffer);
                this._type = this._symbol.type;
                if (this._type === 1 /* PremultipliedAlphaARGB */ || this._type === 2 /* StraightAlphaARGB */ || this._type === 3 /* StraightAlphaRGBA */) {
                  this._view = new Int32Array(this._symbol.data.buffer);
                }
              } else {
                this._data = new Uint8Array(width * height * 4);
                this._view = new Int32Array(this._data.buffer);
                this._type = 1 /* PremultipliedAlphaARGB */;
                var alpha = fillColorARGB >> 24;
                if (alpha === 0 && transparent) {
                } else {
                  this.fillRect(this.rect, fillColorARGB);
                }
              }
              this._dataBuffer = DataBuffer.FromArrayBuffer(this._data.buffer);
              this._invalidate();
            }
            BitmapData.prototype._addBitmapReferrer = function (bitmap) {
              var index = indexOf(this._bitmapReferrers, bitmap);
              release && assert(index < 0);
              this._bitmapReferrers.push(bitmap);
            };

            BitmapData.prototype._removeBitmapReferrer = function (bitmap) {
              var index = indexOf(this._bitmapReferrers, bitmap);
              release && assert(index >= 0);
              this._bitmapReferrers[index] = null;
            };

            BitmapData.prototype._invalidate = function () {
              if (this._isDirty) {
                return;
              }
              this._isDirty = true;
              this._isRemoteDirty = false;

              for (var i = 0; i < this._bitmapReferrers.length; i++) {
                var bitmap = this._bitmapReferrers[i];
                if (bitmap) {
                  bitmap._setDirtyFlags(16777216 /* DirtyBitmapData */);
                }
              }
            };

            BitmapData.prototype.getDataBuffer = function () {
              return this._dataBuffer;
            };

            BitmapData.prototype._getContentBounds = function () {
              return Shumway.Bounds.FromRectangle(this._rect);
            };

            BitmapData.prototype._getPixelData = function (rect) {
              var r = this.rect.intersectInPlace(rect);
              if (r.isEmpty()) {
                return;
              }
              var xMin = r.x;
              var xMax = r.x + r.width;
              var yMin = r.y;
              var yMax = r.y + r.height;
              var view = this._view;
              var width = this._rect.width;
              var output = new Int32Array(r.area);
              var p = 0;
              for (var y = yMin; y < yMax; y++) {
                var offset = y * width;
                for (var x = xMin; x < xMax; x++) {
                  var colorBGRA = view[offset + x];
                  var alpha = colorBGRA & 0xff;
                  var colorBGR = colorBGRA >>> 8;
                  colorBGRA = ((255 * colorBGR) / alpha) << 8 | alpha;
                  output[p++] = colorBGRA;
                }
              }
              return output;
            };

            BitmapData.prototype._putPixelData = function (rect, input) {
              var r = this.rect.intersectInPlace(rect);
              if (r.isEmpty()) {
                return;
              }
              var xMin = r.x;
              var xMax = r.x + r.width;
              var yMin = r.y;
              var yMax = r.y + r.height;
              var view = this._view;
              var width = this._rect.width;
              var p = (rect.width * rect.height - r.height) + (xMin - rect.x);
              var padding = rect.width - r.width;
              var alphaMask = this._transparent ? 0x00 : 0xff;
              for (var y = yMin; y < yMax; y++) {
                var offset = y * width;
                for (var x = xMin; x < xMax; x++) {
                  var colorBGRA = input[p++];
                  var alpha = colorBGRA & alphaMask;
                  var colorBGR = colorBGRA >>> 8;
                  view[offset + x] = (((colorBGR * alpha + 254) / 255) & 0x00ffffff) << 8 | alpha;
                }
                p += padding;
              }
              this._invalidate();
            };

            Object.defineProperty(BitmapData.prototype, "width", {
              get: function () {
                return this._rect.width;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BitmapData.prototype, "height", {
              get: function () {
                return this._rect.height;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BitmapData.prototype, "rect", {
              get: function () {
                return this._rect.clone();
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BitmapData.prototype, "transparent", {
              get: function () {
                return this._transparent;
              },
              enumerable: true,
              configurable: true
            });

            BitmapData.prototype.clone = function () {
              somewhatImplemented("public flash.display.BitmapData::clone");

              var bd = new BitmapData(this._rect.width, this._rect.height, this._transparent, this._fillColorBGRA);
              bd._view.set(this._view);
              return bd;
            };

            BitmapData.prototype.getPixel = function (x, y) {
              x = x | 0;
              y = y | 0;
              return this.getPixel32(x, y) & 0x00ffffff;
            };

            BitmapData.prototype.getPixel32 = function (x, y) {
              x = x | 0;
              y = y | 0;
              if (!this._rect.contains(x, y)) {
                return 0;
              }
              this._requestBitmapData();
              var value = this._view[y * this._rect.width + x];
              switch (this._type) {
                case 1 /* PremultipliedAlphaARGB */:
                  var pARGB = swap32(value);
                  var uARGB = unpremultiplyARGB(pARGB);
                  return uARGB >>> 0;
                case 3 /* StraightAlphaRGBA */:
                  return RGBAToARGB(swap32(value));
                default:
                  Shumway.Debug.notImplemented(Shumway.ImageType[this._type]);
                  return 0;
              }
            };

            BitmapData.prototype.setPixel = function (x, y, uARGB) {
              x = x | 0;
              y = y | 0;
              uARGB = uARGB | 0;
              if (!this._rect.contains(x, y)) {
                return;
              }
              this._requestBitmapData();
              var i = y * this._rect.width + x;
              var a = this._view[i] & 0xff;
              uARGB = uARGB & 0x00ffffff | a << 24;
              var pARGB = premultiplyARGB(uARGB);
              this._view[i] = swap32(pARGB);
              this._invalidate();
            };

            BitmapData.prototype.setPixel32 = function (x, y, uARGB) {
              x = x | 0;
              y = y | 0;
              if (!this._rect.contains(x, y)) {
                return;
              }
              this._requestBitmapData();
              var a = uARGB >>> 24;
              var uRGB = uARGB & 0x00ffffff;
              if (this._transparent) {
                var uARGB = uRGB | a << 24;
                var pARGB = premultiplyARGB(uARGB);
              } else {
                var pARGB = uRGB | 0xff000000;
              }
              this._view[y * this._rect.width + x] = swap32(pARGB);
              this._invalidate();
            };

            BitmapData.prototype.applyFilter = function (sourceBitmapData, sourceRect, destPoint, filter) {
              sourceBitmapData = sourceBitmapData;
              sourceRect = sourceRect;
              destPoint = destPoint;
              filter = filter;
              somewhatImplemented("public flash.display.BitmapData::applyFilter " + filter);
              return;
            };

            BitmapData.prototype.colorTransform = function (rect, colorTransform) {
              rect = rect;
              colorTransform = colorTransform;
              somewhatImplemented("public flash.display.BitmapData::colorTransform");
              return;
            };

            BitmapData.prototype.compare = function (otherBitmapData) {
              otherBitmapData = otherBitmapData;
              notImplemented("public flash.display.BitmapData::compare");
              return;
            };

            BitmapData.prototype.copyChannel = function (sourceBitmapData, sourceRect, destPoint, sourceChannel, destChannel) {
              sourceBitmapData = sourceBitmapData;
              sourceRect = sourceRect;
              destPoint = destPoint;
              sourceChannel = sourceChannel >>> 0;
              destChannel = destChannel >>> 0;
              notImplemented("public flash.display.BitmapData::copyChannel");
              return;
            };

            BitmapData.prototype.copyPixels = function (sourceBitmapData, sourceRect, destPoint, alphaBitmapData, alphaPoint, mergeAlpha) {
              if (typeof alphaBitmapData === "undefined") { alphaBitmapData = null; }
              if (typeof alphaPoint === "undefined") { alphaPoint = null; }
              if (typeof mergeAlpha === "undefined") { mergeAlpha = false; }
              _AVM2.enterTimeline("BitmapData.copyPixels");
              mergeAlpha = !!mergeAlpha;

              if (alphaBitmapData || alphaPoint) {
                notImplemented("public flash.display.BitmapData::copyPixels - Alpha");
                return;
              }

              var sR = sourceRect.clone().roundInPlace();

              var oR = sR.clone();
              var sR = sR.intersectInPlace(sourceBitmapData._rect);

              if (sR.isEmpty()) {
                _AVM2.leaveTimeline();
                return;
              }

              var oX = sR.x - oR.x;
              var oY = sR.y - oR.y;

              var tR = new flash.geom.Rectangle(destPoint.x | 0 + oX, destPoint.y | 0 + oY, oR.width - oX, oR.height - oY);

              tR.intersectInPlace(this._rect);

              var sX = sR.x;
              var sY = sR.y;

              var tX = tR.x;
              var tY = tR.y;

              var tW = tR.width;
              var tH = tR.height;

              var sStride = sourceBitmapData._rect.width;
              var tStride = this._rect.width;

              var s = sourceBitmapData._view;
              var t = this._view;

              if (sourceBitmapData._type !== this._type) {
                somewhatImplemented("public flash.display.BitmapData::copyPixels - Color Format Conversion");
              }

              if (mergeAlpha && this._type !== 1 /* PremultipliedAlphaARGB */) {
                notImplemented("public flash.display.BitmapData::copyPixels - Merge Alpha");
                return;
              }

              if (mergeAlpha) {
                var sP = sY * sStride + sX;
                var tP = tY * tStride + tX;
                for (var y = 0; y < tH; y++) {
                  for (var x = 0; x < tW; x++) {
                    var spBGRA = s[sP + x];
                    if ((spBGRA & 0xFF) === 0xFF) {
                      t[tP + x] = spBGRA;
                    } else {
                      t[tP + x] = blendPremultipliedBGRA(t[tP + x], spBGRA);
                    }
                  }
                  sP += sStride;
                  tP += tStride;
                }
              } else {
                var sP = sY * sStride + sX;
                var tP = tY * tStride + tX;
                if ((tW & 3) === 0) {
                  for (var y = 0; y < tH; y++) {
                    for (var x = 0; x < tW; x += 4) {
                      t[tP + x + 0] = s[sP + x + 0];
                      t[tP + x + 1] = s[sP + x + 1];
                      t[tP + x + 2] = s[sP + x + 2];
                      t[tP + x + 3] = s[sP + x + 3];
                    }
                    sP += sStride;
                    tP += tStride;
                  }
                } else {
                  for (var y = 0; y < tH; y++) {
                    for (var x = 0; x < tW; x++) {
                      t[tP + x] = s[sP + x];
                    }
                    sP += sStride;
                    tP += tStride;
                  }
                }
              }

              this._invalidate();
              somewhatImplemented("public flash.display.BitmapData::copyPixels");
              _AVM2.leaveTimeline();
            };

            BitmapData.prototype.dispose = function () {
              this._rect.setEmpty();
              this._view = null;
              this._invalidate();
            };

            BitmapData.prototype.draw = function (source, matrix, colorTransform, blendMode, clipRect, smoothing) {
              if (typeof matrix === "undefined") { matrix = null; }
              if (typeof colorTransform === "undefined") { colorTransform = null; }
              if (typeof blendMode === "undefined") { blendMode = null; }
              if (typeof clipRect === "undefined") { clipRect = null; }
              if (typeof smoothing === "undefined") { smoothing = false; }
              somewhatImplemented("public flash.display.BitmapData::draw");
              var serializer = AVM2.instance.globals['Shumway.Player.Utils'];
              if (matrix) {
                matrix = matrix.clone().toTwipsInPlace();
              }
              serializer.drawToBitmap(this, source, matrix, colorTransform, blendMode, clipRect, smoothing);
              this._isRemoteDirty = true;
            };

            BitmapData.prototype.drawWithQuality = function (source, matrix, colorTransform, blendMode, clipRect, smoothing, quality) {
              if (typeof matrix === "undefined") { matrix = null; }
              if (typeof colorTransform === "undefined") { colorTransform = null; }
              if (typeof blendMode === "undefined") { blendMode = null; }
              if (typeof clipRect === "undefined") { clipRect = null; }
              if (typeof smoothing === "undefined") { smoothing = false; }
              if (typeof quality === "undefined") { quality = null; }
              source = source;
              matrix = matrix;
              colorTransform = colorTransform;
              blendMode = asCoerceString(blendMode);
              clipRect = clipRect;
              smoothing = !!smoothing;
              quality = asCoerceString(quality);
              notImplemented("public flash.display.BitmapData::drawWithQuality");
              return;
            };

            BitmapData.prototype.fillRect = function (rect, uARGB) {
              if (this._transparent) {
                var pARGB = premultiplyARGB(uARGB);
              } else {
                var pARGB = uARGB | 0xff000000;
              }
              release || assert(this._type === 1 /* PremultipliedAlphaARGB */);
              var pBGRA = swap32(pARGB);
              var r = this.rect.intersectInPlace(rect);
              if (r.isEmpty()) {
                return;
              }
              var xMin = r.x;
              var xMax = r.x + r.width;
              var yMin = r.y;
              var yMax = r.y + r.height;
              var view = this._view;
              var width = this._rect.width;
              for (var y = yMin; y < yMax; y++) {
                var offset = y * width;
                for (var x = xMin; x < xMax; x++) {
                  view[offset + x] = pBGRA;
                }
              }
              this._invalidate();
            };

            BitmapData.prototype.floodFill = function (x, y, color) {
              x = x | 0;
              y = y | 0;
              color = color >>> 0;
              notImplemented("public flash.display.BitmapData::floodFill");
              return;
            };

            BitmapData.prototype.generateFilterRect = function (sourceRect, filter) {
              sourceRect = sourceRect;
              filter = filter;
              notImplemented("public flash.display.BitmapData::generateFilterRect");
              return;
            };

            BitmapData.prototype.getColorBoundsRect = function (mask, color, findColor) {
              if (typeof findColor === "undefined") { findColor = true; }
              mask = mask >>> 0;
              color = color >>> 0;
              findColor = !!findColor;
              notImplemented("public flash.display.BitmapData::getColorBoundsRect");
              return;
            };

            BitmapData.prototype.getPixels = function (rect) {
              var outputByteArray = new flash.utils.ByteArray();
              this.copyPixelsToByteArray(rect, outputByteArray);
              return outputByteArray;
            };

            BitmapData.prototype.copyPixelsToByteArray = function (rect, data) {
              var pixelData = this._getPixelData(rect);
              if (!pixelData) {
                return;
              }
              data.writeRawBytes(new Uint8Array(pixelData));
            };

            BitmapData.prototype.getVector = function (rect) {
              var outputVector = new AS.Uint32Vector(pixelData.length);
              var pixelData = this._getPixelData(rect);
              if (!pixelData) {
                return outputVector;
              }
              outputVector.length = pixelData.length;
              outputVector._view().set(pixelData);
              return outputVector;
            };

            BitmapData.prototype.hitTest = function (firstPoint, firstAlphaThreshold, secondObject, secondBitmapDataPoint, secondAlphaThreshold) {
              if (typeof secondBitmapDataPoint === "undefined") { secondBitmapDataPoint = null; }
              if (typeof secondAlphaThreshold === "undefined") { secondAlphaThreshold = 1; }
              firstPoint = firstPoint;
              firstAlphaThreshold = firstAlphaThreshold >>> 0;
              secondObject = secondObject;
              secondBitmapDataPoint = secondBitmapDataPoint;
              secondAlphaThreshold = secondAlphaThreshold >>> 0;
              notImplemented("public flash.display.BitmapData::hitTest");
              return;
            };

            BitmapData.prototype.merge = function (sourceBitmapData, sourceRect, destPoint, redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier) {
              sourceBitmapData = sourceBitmapData;
              sourceRect = sourceRect;
              destPoint = destPoint;
              redMultiplier = redMultiplier >>> 0;
              greenMultiplier = greenMultiplier >>> 0;
              blueMultiplier = blueMultiplier >>> 0;
              alphaMultiplier = alphaMultiplier >>> 0;
              somewhatImplemented("public flash.display.BitmapData::merge");
            };

            BitmapData.prototype.noise = function (randomSeed, low, high, channelOptions, grayScale) {
              if (typeof low === "undefined") { low = 0; }
              if (typeof high === "undefined") { high = 255; }
              if (typeof channelOptions === "undefined") { channelOptions = 7; }
              if (typeof grayScale === "undefined") { grayScale = false; }
              randomSeed = randomSeed | 0;
              low = low >>> 0;
              high = high >>> 0;
              channelOptions = channelOptions >>> 0;
              grayScale = !!grayScale;
              somewhatImplemented("public flash.display.BitmapData::noise");
            };

            BitmapData.prototype.paletteMap = function (sourceBitmapData, sourceRect, destPoint, redArray, greenArray, blueArray, alphaArray) {
              if (typeof redArray === "undefined") { redArray = null; }
              if (typeof greenArray === "undefined") { greenArray = null; }
              if (typeof blueArray === "undefined") { blueArray = null; }
              if (typeof alphaArray === "undefined") { alphaArray = null; }
              sourceBitmapData = sourceBitmapData;
              sourceRect = sourceRect;
              destPoint = destPoint;
              redArray = redArray;
              greenArray = greenArray;
              blueArray = blueArray;
              alphaArray = alphaArray;
              somewhatImplemented("public flash.display.BitmapData::paletteMap");
            };

            BitmapData.prototype.perlinNoise = function (baseX, baseY, numOctaves, randomSeed, stitch, fractalNoise, channelOptions, grayScale, offsets) {
              if (typeof channelOptions === "undefined") { channelOptions = 7; }
              if (typeof grayScale === "undefined") { grayScale = false; }
              if (typeof offsets === "undefined") { offsets = null; }
              baseX = +baseX;
              baseY = +baseY;
              numOctaves = numOctaves >>> 0;
              randomSeed = randomSeed | 0;
              stitch = !!stitch;
              fractalNoise = !!fractalNoise;
              channelOptions = channelOptions >>> 0;
              grayScale = !!grayScale;
              offsets = offsets;
              somewhatImplemented("public flash.display.BitmapData::perlinNoise");
            };

            BitmapData.prototype.pixelDissolve = function (sourceBitmapData, sourceRect, destPoint, randomSeed, numPixels, fillColor) {
              if (typeof randomSeed === "undefined") { randomSeed = 0; }
              if (typeof numPixels === "undefined") { numPixels = 0; }
              if (typeof fillColor === "undefined") { fillColor = 0; }
              sourceBitmapData = sourceBitmapData;
              sourceRect = sourceRect;
              destPoint = destPoint;
              randomSeed = randomSeed | 0;
              numPixels = numPixels | 0;
              fillColor = fillColor >>> 0;
              notImplemented("public flash.display.BitmapData::pixelDissolve");
              return;
            };

            BitmapData.prototype.scroll = function (x, y) {
              x = x | 0;
              y = y | 0;
              notImplemented("public flash.display.BitmapData::scroll");
              return;
            };

            BitmapData.prototype.setPixels = function (rect, inputByteArray) {
              this._putPixelData(rect, new Int32Array(inputByteArray.readRawBytes()));
            };

            BitmapData.prototype.setVector = function (rect, inputVector) {
              this._putPixelData(rect, inputVector._view());
            };

            BitmapData.prototype.threshold = function (sourceBitmapData, sourceRect, destPoint, operation, threshold, color, mask, copySource) {
              if (typeof color === "undefined") { color = 0; }
              if (typeof mask === "undefined") { mask = 4294967295; }
              if (typeof copySource === "undefined") { copySource = false; }
              sourceBitmapData = sourceBitmapData;
              sourceRect = sourceRect;
              destPoint = destPoint;
              operation = asCoerceString(operation);
              threshold = threshold >>> 0;
              color = color >>> 0;
              mask = mask >>> 0;
              copySource = !!copySource;
              notImplemented("public flash.display.BitmapData::threshold");
              return;
            };

            BitmapData.prototype.lock = function () {
              this._locked = true;
            };

            BitmapData.prototype.unlock = function (changeRect) {
              if (typeof changeRect === "undefined") { changeRect = null; }
              this._locked = false;
            };

            BitmapData.prototype.histogram = function (hRect) {
              if (typeof hRect === "undefined") { hRect = null; }
              hRect = hRect;
              notImplemented("public flash.display.BitmapData::histogram");
              return;
            };

            BitmapData.prototype.encode = function (rect, compressor, byteArray) {
              if (typeof byteArray === "undefined") { byteArray = null; }
              rect = rect;
              compressor = compressor;
              byteArray = byteArray;
              notImplemented("public flash.display.BitmapData::encode");
              return;
            };

            BitmapData.prototype._requestBitmapData = function () {
              if (this._isRemoteDirty) {
                var serializer = Shumway.AVM2.Runtime.AVM2.instance.globals['Shumway.Player.Utils'];
                var data = serializer.requestBitmapData(this);
                this._data = new Uint8Array(data.buffer);
                this._type = 3 /* StraightAlphaRGBA */;
                this._view = new Int32Array(data.buffer);
                this._isRemoteDirty = false;
                this._isDirty = false;
              }
            };
            BitmapData.classInitializer = function () {
              ensureInverseSourceAlphaTable();
            };

            BitmapData.initializer = function (symbol) {
              this._symbol = symbol;
            };

            BitmapData.classSymbols = null;
            BitmapData.instanceSymbols = null;

            BitmapData.MAXIMUM_WIDTH = 8191;
            BitmapData.MAXIMUM_HEIGHT = 8191;
            BitmapData.MAXIMUM_DIMENSION = 16777215;
            return BitmapData;
          })(AS.ASNative);
          display.BitmapData = BitmapData;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(_AVM2.AS || (_AVM2.AS = {}));
    var AS = _AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var BitmapDataChannel = (function (_super) {
            __extends(BitmapDataChannel, _super);
            function BitmapDataChannel() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.BitmapDataChannel");
            }
            BitmapDataChannel.classInitializer = null;

            BitmapDataChannel.initializer = null;

            BitmapDataChannel.classSymbols = null;

            BitmapDataChannel.instanceSymbols = null;

            BitmapDataChannel.RED = 1;
            BitmapDataChannel.GREEN = 2;
            BitmapDataChannel.BLUE = 4;
            BitmapDataChannel.ALPHA = 8;
            return BitmapDataChannel;
          })(AS.ASNative);
          display.BitmapDataChannel = BitmapDataChannel;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var BitmapEncodingColorSpace = (function (_super) {
            __extends(BitmapEncodingColorSpace, _super);
            function BitmapEncodingColorSpace() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.BitmapEncodingColorSpace");
            }
            BitmapEncodingColorSpace.classInitializer = null;

            BitmapEncodingColorSpace.initializer = null;

            BitmapEncodingColorSpace.classSymbols = null;

            BitmapEncodingColorSpace.instanceSymbols = null;

            BitmapEncodingColorSpace.COLORSPACE_AUTO = "auto";
            BitmapEncodingColorSpace.COLORSPACE_4_4_4 = "4:4:4";
            BitmapEncodingColorSpace.COLORSPACE_4_2_2 = "4:2:2";
            BitmapEncodingColorSpace.COLORSPACE_4_2_0 = "4:2:0";
            return BitmapEncodingColorSpace;
          })(AS.ASNative);
          display.BitmapEncodingColorSpace = BitmapEncodingColorSpace;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var JPEGEncoderOptions = (function (_super) {
            __extends(JPEGEncoderOptions, _super);
            function JPEGEncoderOptions(quality) {
              if (typeof quality === "undefined") { quality = 80; }
              quality = quality >>> 0;
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.JPEGEncoderOptions");
            }
            JPEGEncoderOptions.classInitializer = null;

            JPEGEncoderOptions.initializer = null;

            JPEGEncoderOptions.classSymbols = null;

            JPEGEncoderOptions.instanceSymbols = null;
            return JPEGEncoderOptions;
          })(AS.ASNative);
          display.JPEGEncoderOptions = JPEGEncoderOptions;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (_AVM2) {
    (function (AS) {
      (function (flash) {
        (function (display) {
          var assert = Shumway.Debug.assert;
          var assertUnreachable = Shumway.Debug.assertUnreachable;
          var notImplemented = Shumway.Debug.notImplemented;
          var throwError = Shumway.AVM2.Runtime.throwError;
          var FileLoadingService = Shumway.FileLoadingService;
          var Telemetry = Shumway.Telemetry;

          var AVM2 = Shumway.AVM2.Runtime.AVM2;
          var AbcFile = Shumway.AVM2.ABC.AbcFile;

          var events = flash.events;
          var ActionScriptVersion = flash.display.ActionScriptVersion;

          var ApplicationDomain = flash.system.ApplicationDomain;

          var Bounds = Shumway.Bounds;

          var LoadStatus;
          (function (LoadStatus) {
            LoadStatus[LoadStatus["Unloaded"] = 0] = "Unloaded";
            LoadStatus[LoadStatus["Opened"] = 1] = "Opened";
            LoadStatus[LoadStatus["Initialized"] = 2] = "Initialized";
            LoadStatus[LoadStatus["Complete"] = 3] = "Complete";
          })(LoadStatus || (LoadStatus = {}));

          var LoadingType;
          (function (LoadingType) {
            LoadingType[LoadingType["External"] = 0] = "External";
            LoadingType[LoadingType["Bytes"] = 1] = "Bytes";
          })(LoadingType || (LoadingType = {}));

          var Loader = (function (_super) {
            __extends(Loader, _super);
            function Loader() {
              false && _super.call(this);
              display.DisplayObjectContainer.instanceConstructorNoInitialize.call(this);

              this._content = null;
              this._contentLoaderInfo = new flash.display.LoaderInfo();

              this._worker = null;
              this._loadStatus = 0 /* Unloaded */;

              this._contentLoaderInfo._loader = this;

              this._initialDataLoaded = new Shumway.PromiseWrapper();
              this._waitForInitialData = true;
              this._commitDataQueue = this._initialDataLoaded.promise;

              this._codeExecutionPromise = new Shumway.PromiseWrapper();
              this._progressPromise = new Shumway.PromiseWrapper();
              this._startPromise = Promise.all([
                this._codeExecutionPromise.promise,
                this._progressPromise.promise
              ]);
            }
            Loader.getRootLoader = function () {
              if (Loader._rootLoader) {
                return Loader._rootLoader;
              }
              var loader = new flash.display.Loader();

              flash.display.DisplayObject._instanceID--;

              loader._contentLoaderInfo._loader = null;
              loader._loadStatus = 1 /* Opened */;
              Loader._rootLoader = loader;
              return loader;
            };

            Loader.reset = function () {
              Loader._rootLoader = null;
            };

            Loader.progress = function () {
              var queue = Loader._loadQueue;
              for (var i = 0; i < queue.length; i++) {
                var instance = queue[i];
                var loaderInfo = instance._contentLoaderInfo;
                var bytesLoaded = loaderInfo._bytesLoaded;
                var bytesTotal = loaderInfo._bytesTotal;
                switch (instance._loadStatus) {
                  case 0 /* Unloaded */:
                    if (!bytesTotal) {
                      break;
                    }

                    if (instance._loadingType === 0 /* External */) {
                      loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.OPEN));
                    }
                    loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS, false, false, 0, bytesTotal));
                    instance._loadStatus = 1 /* Opened */;
                  case 1 /* Opened */:
                    if (!(instance._content && instance._content._hasFlags(256 /* Constructed */))) {
                      break;
                    }
                    instance._loadStatus = 2 /* Initialized */;
                    loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.INIT));
                  case 2 /* Initialized */:
                    if (bytesLoaded === bytesTotal) {
                      instance._loadStatus = 3 /* Complete */;
                      loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS, false, false, bytesLoaded, bytesTotal));
                      loaderInfo.dispatchEvent(events.Event.getInstance(events.Event.COMPLETE));
                      queue.splice(i--, 1);
                    }
                    break;
                  default:
                    assertUnreachable("Mustn't encounter unhandled status in Loader queue.");
                }
              }
            };

            Loader.prototype._initFrame = function (advance) {
            };

            Loader.prototype._constructFrame = function () {
              this._constructChildren();
            };

            Loader.prototype._commitData = function (data) {
              if (this._waitForInitialData) {
                var enoughData = data.command === 'progress' || data.command === 'error';
                if (enoughData) {
                  this._waitForInitialData = false;
                  this._initialDataLoaded.resolve(undefined);
                }
              }

              this._commitDataQueue = this._commitDataQueue.then(this._commitQueuedData.bind(this, data));
            };

            Loader.prototype._commitQueuedData = function (data) {
              var loaderInfo = this._contentLoaderInfo;
              var command = data.command;
              var suspendUntil = null;
              switch (command) {
                case 'init':
                  var info = data.result;

                  loaderInfo._bytesLoaded = info.bytesLoaded;
                  loaderInfo._bytesTotal = info.bytesTotal;
                  loaderInfo._swfVersion = info.swfVersion;
                  if (!info.fileAttributes || !info.fileAttributes.doAbc) {
                    loaderInfo._actionScriptVersion = ActionScriptVersion.ACTIONSCRIPT2;
                    suspendUntil = this._initAvm1(loaderInfo);
                  }
                  loaderInfo._frameRate = info.frameRate;
                  var bbox = info.bbox;
                  loaderInfo._width = bbox.xMax - bbox.xMin;
                  loaderInfo._height = bbox.yMax - bbox.yMin;

                  var rootSymbol = new Shumway.Timeline.SpriteSymbol(0, true);
                  rootSymbol.numFrames = info.frameCount;
                  loaderInfo.registerSymbol(rootSymbol);
                  break;
                case 'progress':
                  var info = data.result;
                  var bytesLoaded = info.bytesLoaded;
                  var bytesTotal = info.bytesTotal;
                  release || assert(bytesLoaded <= bytesTotal, "Loaded bytes should not exceed total bytes.");
                  loaderInfo._bytesLoaded = bytesLoaded;
                  if (!loaderInfo._bytesTotal) {
                    loaderInfo._bytesTotal = bytesTotal;
                  } else {
                    release || assert(loaderInfo._bytesTotal === bytesTotal, "Total bytes should not change.");
                  }
                  if (this._loadStatus !== 0 /* Unloaded */) {
                    loaderInfo.dispatchEvent(new events.ProgressEvent(events.ProgressEvent.PROGRESS, false, false, bytesLoaded, bytesTotal));
                    this._progressPromise.resolve(undefined);
                  }
                  break;
                case 'complete':
                  if (data.stats) {
                    Telemetry.instance.reportTelemetry(data.stats);
                  }

                  this._worker && this._worker.terminate();
                  break;

                case 'error':
                  this._contentLoaderInfo.dispatchEvent(new events.IOErrorEvent(events.IOErrorEvent.IO_ERROR));
                  break;
                default:
                  if (data.id === 0) {
                    break;
                  }
                  if (data.isSymbol) {
                    this._commitAsset(data);
                  } else if (data.type === 'frame') {
                    this._commitFrame(data);
                  } else if (data.type === 'image') {
                    this._commitImage(data);
                  } else if (data.type === 'abc') {
                    var appDomain = AVM2.instance.applicationDomain;
                    var abc = new AbcFile(data.data, data.name);
                    if (data.flags) {
                      appDomain.loadAbc(abc);
                    } else {
                      if (loaderInfo._allowCodeExecution) {
                        appDomain.executeAbc(abc);
                      }
                    }
                  }
                  break;
              }
              return suspendUntil;
            };

            Loader.prototype._initAvm1 = function (loaderInfo) {
              return AVM2.instance.loadAVM1().then(function () {
                loaderInfo._avm1Context = Shumway.AVM1.AS2Context.create(loaderInfo.swfVersion);
              });
            };

            Loader.prototype._commitAsset = function (data) {
              var loaderInfo = this._contentLoaderInfo;
              var symbolId = data.id;
              var symbol;
              if (data.updates) {
                var updates = data.updates;
                symbol = loaderInfo.getSymbolById(symbolId);
                if (updates.scale9Grid) {
                  symbol.scale9Grid = Bounds.FromUntyped(updates.scale9Grid);
                }
                return;
              }
              switch (data.type) {
                case 'shape':
                  symbol = Shumway.Timeline.ShapeSymbol.FromData(data, loaderInfo);
                  break;
                case 'morphshape':
                  symbol = Shumway.Timeline.MorphShapeSymbol.FromData(data, loaderInfo);
                  break;
                case 'image':
                  symbol = Shumway.Timeline.BitmapSymbol.FromData(data);
                  break;
                case 'label':
                case 'text':
                  symbol = Shumway.Timeline.TextSymbol.FromTextData(data);
                  break;
                case 'button':
                  symbol = Shumway.Timeline.ButtonSymbol.FromData(data, loaderInfo);
                  break;
                case 'sprite':
                  symbol = Shumway.Timeline.SpriteSymbol.FromData(data, loaderInfo);
                  break;
                case 'font':
                  symbol = Shumway.Timeline.FontSymbol.FromData(data);
                  var font = flash.text.Font.initializeFrom(symbol);
                  flash.text.Font.instanceConstructorNoInitialize.call(font);
                  AVM2.instance.globals['Shumway.Player.Utils'].registerFont(font);
                  break;
                case 'sound':
                  symbol = Shumway.Timeline.SoundSymbol.FromData(data);
                  break;
                case 'binary':
                  symbol = Shumway.Timeline.BinarySymbol.FromData(data);
                  break;
              }
              release || assert(symbol, "Unknown symbol type.");
              loaderInfo.registerSymbol(symbol);
            };

            Loader.prototype._commitFrame = function (data) {
              var loaderInfo = this._contentLoaderInfo;

              if (data.bgcolor !== undefined) {
                loaderInfo._colorRGBA = data.bgcolor;
              }

              if (data.symbolClasses) {
                var symbolClasses = data.symbolClasses;
                var appDomain = AVM2.instance.applicationDomain;
                for (var i = 0; i < symbolClasses.length; i++) {
                  var asset = symbolClasses[i];
                  if (loaderInfo._allowCodeExecution) {
                    var symbolClass = appDomain.getClass(asset.className);
                    var symbol = loaderInfo.getSymbolById(asset.symbolId);
                    release || assert(symbol, "Symbol is not defined.");
                    symbolClass.defaultInitializerArgument = symbol;
                    symbol.symbolClass = symbolClass;
                  }
                }
              }

              if (data.exports && loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
                var exports = data.exports;
                for (var i = 0; i < exports.length; i++) {
                  var asset = exports[i];
                  var symbol = loaderInfo.getSymbolById(asset.symbolId);
                  release || assert(symbol);
                  loaderInfo._avm1Context.addAsset(asset.className, symbol);
                }
              }

              var rootSymbol = loaderInfo.getSymbolById(0);
              var documentClass = rootSymbol.symbolClass;
              var frames = rootSymbol.frames;
              var frameIndex = frames.length;

              var frame = new Shumway.Timeline.FrameDelta(loaderInfo, data.commands);
              var repeat = data.repeat;
              while (repeat--) {
                frames.push(frame);
              }

              var root = this._content;
              if (!root) {
                root = documentClass.initializeFrom(rootSymbol);

                flash.display.DisplayObject._instanceID--;
                root._name = 'root1';

                if (display.MovieClip.isType(root)) {
                  var mc = root;
                  if (data.sceneData) {
                    var scenes = data.sceneData.scenes;
                    for (var i = 0, n = scenes.length; i < n; i++) {
                      var sceneInfo = scenes[i];
                      var offset = sceneInfo.offset;
                      var endFrame = i < n - 1 ? scenes[i + 1].offset : rootSymbol.numFrames;
                      mc.addScene(sceneInfo.name, [], offset, endFrame - offset);
                    }
                    var labels = data.sceneData.labels;
                    for (var i = 0; i < labels.length; i++) {
                      var labelInfo = labels[i];
                      mc.addFrameLabel(labelInfo.name, labelInfo.frame + 1);
                    }
                  } else {
                    mc.addScene('Scene 1', [], 0, rootSymbol.numFrames);
                  }
                }

                if (loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
                  this._initAvm1Root(root);
                }

                this._codeExecutionPromise.resolve(undefined);

                root._loaderInfo = loaderInfo;
                this._content = root;
                this.addTimelineObjectAtDepth(this._content, 0);
              }

              if (display.MovieClip.isType(root)) {
                var rootMovie = root;

                if (data.labelName) {
                  rootMovie.addFrameLabel(data.labelName, frameIndex + 1);
                }

                if (loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
                  this._executeAvm1Actions(rootMovie, frameIndex, data);
                }

                if (data.startSounds) {
                  rootMovie._registerStartSounds(frameIndex + 1, data.startSounds);
                }
                if (data.soundStream) {
                  rootMovie._initSoundStream(data.soundStream);
                }
                if (data.soundStreamBlock) {
                  rootMovie._addSoundStreamBlock(frameIndex, data.soundStreamBlock);
                }
              }
            };

            Loader.prototype._initAvm1Root = function (root) {
              var topRoot = root;
              var parent = this._parent;
              if (parent && parent !== this._stage) {
                var parentLoader = parent.loaderInfo._loader;
                while (parentLoader._parent && parentLoader._parent !== this._stage) {
                  parentLoader = parentLoader._parent.loaderInfo._loader;
                }
                if (parentLoader.loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
                  notImplemented('AVM1Movie');
                  this._worker && this._worker.terminate();
                  return;
                }
                topRoot = parentLoader._content;
              }

              var avm1Context = this._contentLoaderInfo._avm1Context;
              var as2Object = AS.avm1lib.getAS2Object(topRoot);
              avm1Context.globals.asSetPublicProperty('_root', as2Object);
              avm1Context.globals.asSetPublicProperty('_level0', as2Object);

              var parameters = this._contentLoaderInfo._parameters;
              for (var paramName in parameters) {
                if (!(paramName in as2Object)) {
                  as2Object[paramName] = parameters[paramName];
                }
              }
            };

            Loader.prototype._executeAvm1Actions = function (root, frameIndex, frameData) {
              var initActionBlocks = frameData.initActionBlocks;
              var actionBlocks = frameData.actionBlocks;

              if (initActionBlocks) {
                var loaderInfo = this._contentLoaderInfo;
                for (var i = 0; i < initActionBlocks.length; i++) {
                  var actionBlock = initActionBlocks[i];

                  root.addAS2InitActionBlock(frameIndex, actionBlock);
                }
              }

              if (actionBlocks) {
                for (var i = 0; i < actionBlocks.length; i++) {
                  root.addAS2FrameScript(frameIndex, actionBlocks[i]);
                }
              }
            };

            Loader.prototype._commitImage = function (data) {
              var b = new display.BitmapData(data.width, data.height);
              this._content = new display.Bitmap(b);
              this.addTimelineObjectAtDepth(this._content, 0);

              var loaderInfo = this._contentLoaderInfo;
              loaderInfo._width = data.width;
              loaderInfo._height = data.height;
            };

            Object.defineProperty(Loader.prototype, "content", {
              get: function () {
                if (this._loadStatus === 0 /* Unloaded */) {
                  return null;
                }
                return this._content;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Loader.prototype, "contentLoaderInfo", {
              get: function () {
                return this._contentLoaderInfo;
              },
              enumerable: true,
              configurable: true
            });

            Loader.prototype._close = function () {
              if (this._worker && this._loadStatus === 0 /* Unloaded */) {
                this._worker.terminate();
                this._worker = null;
              }
            };

            Loader.prototype._unload = function (stopExecution, gc) {
              stopExecution = !!stopExecution;
              gc = !!gc;
              if (this._loadStatus < 2 /* Initialized */) {
                return;
              }
              this._content = null;
              this._contentLoaderInfo._loader = null;
              this._worker = null;
              this._loadStatus = 0 /* Unloaded */;
              this.dispatchEvent(events.Event.getInstance(events.Event.UNLOAD));
            };

            Loader.prototype._getJPEGLoaderContextdeblockingfilter = function (context) {
              if (flash.system.JPEGLoaderContext.isType(context)) {
                return context.deblockingFilter;
              }
              return 0.0;
            };

            Loader.prototype._getUncaughtErrorEvents = function () {
              notImplemented("public flash.display.Loader::_getUncaughtErrorEvents");
              return;
            };
            Loader.prototype._setUncaughtErrorEvents = function (value) {
              value = value;
              notImplemented("public flash.display.Loader::_setUncaughtErrorEvents");
              return;
            };

            Loader.prototype.load = function (request, context) {
              this._contentLoaderInfo._url = request.url;
              this._applyLoaderContext(context, request);
              this._loadingType = 0 /* External */;
              var worker = this._createParsingWorker();

              var loader = this;
              var session = FileLoadingService.instance.createSession();
              session.onprogress = function (data, progress) {
                worker.postMessage({ data: data, progress: progress });
              };
              session.onerror = function (error) {
                loader._commitData({ command: 'error', error: error });
              };
              session.onopen = function () {
                worker.postMessage('pipe:');
              };
              session.onclose = function () {
                worker.postMessage({ data: null });
              };
              session.open(request._toFileRequest());

              Loader._loadQueue.push(this);
            };

            Loader.prototype.loadBytes = function (data, context) {
              this._contentLoaderInfo._url = this.loaderInfo._url + '/[[DYNAMIC]]/' + (++Loader._embeddedContentLoadCount);
              this._applyLoaderContext(context, null);
              this._loadingType = 1 /* Bytes */;
              var worker = this._createParsingWorker();

              Loader._loadQueue.push(this);
              worker.postMessage('pipe:');
              var bytes = data.bytes;
              var progress = { bytesLoaded: bytes.byteLength, bytesTotal: bytes.byteLength };
              worker.postMessage({ data: bytes, progress: progress });
              worker.postMessage({ data: null });
            };

            Loader.prototype._applyLoaderContext = function (context, request) {
              var parameters = {};
              if (context && context.parameters) {
                var contextParameters = context.parameters;
                for (var key in contextParameters) {
                  var value = contextParameters[key];
                  if (!Shumway.isString(value)) {
                    throwError('IllegalOperationError', _AVM2.Errors.ObjectWithStringsParamError, 'LoaderContext.parameters');
                  }
                  parameters[key] = value;
                }
              } else {
              }
              if (context && context.applicationDomain) {
                this._contentLoaderInfo._applicationDomain = new ApplicationDomain(ApplicationDomain.currentDomain);
              }
              this._contentLoaderInfo._parameters = parameters;
            };

            Loader.prototype._createParsingWorker = function () {
              var loaderInfo = this._contentLoaderInfo;
              var worker;
              if (Loader.WORKERS_AVAILABLE && (!Shumway.useParsingWorkerOption || Shumway.useParsingWorkerOption.value)) {
                var loaderPath = typeof LOADER_WORKER_PATH !== 'undefined' ? LOADER_WORKER_PATH : SHUMWAY_ROOT + Loader.LOADER_PATH;
                worker = new Worker(loaderPath);
              } else {
                var ResourceLoader = Shumway.SWF.ResourceLoader;
                worker = new ResourceLoader(window, false);
              }
              if (!loaderInfo._allowCodeExecution) {
                this._codeExecutionPromise.reject('Disabled by _allowCodeExecution');
              }
              if (!this._waitForInitialData) {
                this._initialDataLoaded.resolve(undefined);
              }
              var loader = this;

              worker.onmessage = function (e) {
                if (e.data.type === 'exception') {
                  console.log('error in parser: \n' + e.data.stack);
                  AVM2.instance.exceptions.push({
                    source: 'parser',
                    message: e.data.message,
                    stack: e.data.stack
                  });
                } else {
                  loader._commitData(e.data);
                }
              };
              return worker;
            };
            Loader._embeddedContentLoadCount = 0;

            Loader.classInitializer = function () {
              Loader._rootLoader = null;
              Loader._loadQueue = [];
            };

            Loader.initializer = function () {
              var self = this;
              display.DisplayObject._advancableInstances.push(self);
            };

            Loader.classSymbols = null;

            Loader.instanceSymbols = null;

            Loader.WORKERS_AVAILABLE = typeof Worker !== 'undefined';
            Loader.LOADER_PATH = 'swf/worker.js';
            return Loader;
          })(flash.display.DisplayObjectContainer);
          display.Loader = Loader;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(_AVM2.AS || (_AVM2.AS = {}));
    var AS = _AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      (function (flash) {
        (function (display) {
          var assert = Shumway.Debug.assert;
          var notImplemented = Shumway.Debug.notImplemented;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;

          var ActionScriptVersion = flash.display.ActionScriptVersion;

          var LoaderInfo = (function (_super) {
            __extends(LoaderInfo, _super);
            function LoaderInfo() {
              false && _super.call(this, undefined);
              flash.events.EventDispatcher.instanceConstructorNoInitialize.call(this);
              this._loaderURL = '';
              this._url = '';
              this._isURLInaccessible = false;
              this._bytesLoaded = 0;
              this._bytesTotal = 0;
              this._applicationDomain = null;
              this._swfVersion = 9;
              this._actionScriptVersion = ActionScriptVersion.ACTIONSCRIPT3;
              release || assert(this._actionScriptVersion);
              this._frameRate = 24;
              this._parameters = null;
              this._width = 0;
              this._height = 0;
              this._contentType = '';
              this._sharedEvents = null;
              this._parentSandboxBridge = null;
              this._childSandboxBridge = null;
              this._sameDomain = false;
              this._childAllowsParent = false;
              this._parentAllowsChild = false;
              this._loader = null;
              this._content = null;
              this._bytes = null;
              this._uncaughtErrorEvents = null;
              this._allowCodeExecution = true;
              this._dictionary = [];
              this._avm1Context = null;

              this._colorRGBA = 0xFFFFFFFF;
            }
            LoaderInfo.getLoaderInfoByDefinition = function (object) {
              object = object;
              notImplemented("public flash.display.LoaderInfo::static getLoaderInfoByDefinition");
              return;
            };

            Object.defineProperty(LoaderInfo.prototype, "loaderURL", {
              get: function () {
                return this._loaderURL;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "url", {
              get: function () {
                return this._url;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "isURLInaccessible", {
              get: function () {
                return this._isURLInaccessible;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "bytesLoaded", {
              get: function () {
                return this._bytesLoaded;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "bytesTotal", {
              get: function () {
                return this._bytesTotal;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "applicationDomain", {
              get: function () {
                somewhatImplemented("public flash.display.LoaderInfo::get applicationDomain");
                return flash.system.ApplicationDomain.currentDomain;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "swfVersion", {
              get: function () {
                return this._swfVersion;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "actionScriptVersion", {
              get: function () {
                return this._actionScriptVersion;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "frameRate", {
              get: function () {
                return this._frameRate;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "width", {
              get: function () {
                return (this._width / 20) | 0;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "height", {
              get: function () {
                return (this._height / 20) | 0;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "contentType", {
              get: function () {
                return this._contentType;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "sharedEvents", {
              get: function () {
                notImplemented("public flash.display.LoaderInfo::get sharedEvents");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(LoaderInfo.prototype, "parentSandboxBridge", {
              get: function () {
                notImplemented("public flash.display.LoaderInfo::get parentSandboxBridge");
                return;
              },
              set: function (door) {
                door = door;
                notImplemented("public flash.display.LoaderInfo::set parentSandboxBridge");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(LoaderInfo.prototype, "childSandboxBridge", {
              get: function () {
                notImplemented("public flash.display.LoaderInfo::get childSandboxBridge");
                return;
              },
              set: function (door) {
                door = door;
                notImplemented("public flash.display.LoaderInfo::set childSandboxBridge");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(LoaderInfo.prototype, "sameDomain", {
              get: function () {
                notImplemented("public flash.display.LoaderInfo::get sameDomain");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(LoaderInfo.prototype, "childAllowsParent", {
              get: function () {
                notImplemented("public flash.display.LoaderInfo::get childAllowsParent");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(LoaderInfo.prototype, "parentAllowsChild", {
              get: function () {
                notImplemented("public flash.display.LoaderInfo::get parentAllowsChild");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "loader", {
              get: function () {
                return this._loader;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "content", {
              get: function () {
                return this._loader && this._loader.content;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "bytes", {
              get: function () {
                notImplemented("public flash.display.LoaderInfo::get bytes");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(LoaderInfo.prototype, "parameters", {
              get: function () {
                somewhatImplemented("public flash.display.LoaderInfo::get parameters");
                if (this._parameters) {
                  return Shumway.ObjectUtilities.cloneObject(this._parameters);
                }
                return {};
              },
              enumerable: true,
              configurable: true
            });
            LoaderInfo.prototype._getUncaughtErrorEvents = function () {
              notImplemented("public flash.display.LoaderInfo::_getUncaughtErrorEvents");
              return;
            };
            LoaderInfo.prototype._setUncaughtErrorEvents = function (value) {
              value = value;
              notImplemented("public flash.display.LoaderInfo::_setUncaughtErrorEvents");
              return;
            };

            LoaderInfo.prototype.registerSymbol = function (symbol) {
              this._dictionary[symbol.id] = symbol;
            };

            LoaderInfo.prototype.getSymbolById = function (id) {
              return this._dictionary[id] || null;
            };
            LoaderInfo.classInitializer = null;

            LoaderInfo.initializer = null;

            LoaderInfo.classSymbols = null;

            LoaderInfo.instanceSymbols = null;
            return LoaderInfo;
          })(flash.events.EventDispatcher);
          display.LoaderInfo = LoaderInfo;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var MorphShape = (function (_super) {
            __extends(MorphShape, _super);
            function MorphShape() {
              false && _super.call(this);
              display.DisplayObject.instanceConstructorNoInitialize.call(this);
            }
            MorphShape.prototype._canHaveGraphics = function () {
              return true;
            };

            MorphShape.prototype._getGraphics = function () {
              return this._graphics;
            };

            Object.defineProperty(MorphShape.prototype, "graphics", {
              get: function () {
                return this._ensureGraphics();
              },
              enumerable: true,
              configurable: true
            });
            MorphShape.classInitializer = null;

            MorphShape.initializer = function (symbol) {
              var self = this;
              if (symbol) {
                self._graphics = symbol.graphics;
                self.morphFillBounds = symbol.morphFillBounds;
                self.morphLineBounds = symbol.morphLineBounds;
              } else {
                self._graphics = new flash.display.Graphics();
                self.morphFillBounds = null;
                self.morphLineBounds = null;
              }
            };

            MorphShape.classSymbols = null;

            MorphShape.instanceSymbols = null;
            return MorphShape;
          })(flash.display.DisplayObject);
          display.MorphShape = MorphShape;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var NativeMenu = (function (_super) {
            __extends(NativeMenu, _super);
            function NativeMenu() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.display.NativeMenu");
            }
            NativeMenu.classInitializer = null;

            NativeMenu.initializer = null;

            NativeMenu.classSymbols = null;

            NativeMenu.instanceSymbols = null;
            return NativeMenu;
          })(flash.events.EventDispatcher);
          display.NativeMenu = NativeMenu;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;

          var NativeMenuItem = (function (_super) {
            __extends(NativeMenuItem, _super);
            function NativeMenuItem() {
              false && _super.call(this, undefined);
              flash.events.EventDispatcher.instanceConstructorNoInitialize.call(this);
              this._enabled = true;
            }
            Object.defineProperty(NativeMenuItem.prototype, "enabled", {
              get: function () {
                somewhatImplemented("public flash.display.NativeMenuItem::get enabled");
                return this._enabled;
              },
              set: function (isSeparator) {
                isSeparator = !!isSeparator;
                somewhatImplemented("public flash.display.NativeMenuItem::set enabled");
                this._enabled = isSeparator;
              },
              enumerable: true,
              configurable: true
            });
            NativeMenuItem.classInitializer = null;

            NativeMenuItem.initializer = null;

            NativeMenuItem.classSymbols = null;

            NativeMenuItem.instanceSymbols = null;
            return NativeMenuItem;
          })(flash.events.EventDispatcher);
          display.NativeMenuItem = NativeMenuItem;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var PNGEncoderOptions = (function (_super) {
            __extends(PNGEncoderOptions, _super);
            function PNGEncoderOptions(fastCompression) {
              if (typeof fastCompression === "undefined") { fastCompression = false; }
              fastCompression = !!fastCompression;
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.PNGEncoderOptions");
            }
            PNGEncoderOptions.classInitializer = null;

            PNGEncoderOptions.initializer = null;

            PNGEncoderOptions.classSymbols = null;

            PNGEncoderOptions.instanceSymbols = null;
            return PNGEncoderOptions;
          })(AS.ASNative);
          display.PNGEncoderOptions = PNGEncoderOptions;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var PixelSnapping = (function (_super) {
            __extends(PixelSnapping, _super);
            function PixelSnapping() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.PixelSnapping");
            }
            PixelSnapping.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return PixelSnapping.NEVER;
                case 1:
                  return PixelSnapping.ALWAYS;
                case 2:
                  return PixelSnapping.AUTO;
                default:
                  return null;
              }
            };

            PixelSnapping.toNumber = function (value) {
              switch (value) {
                case PixelSnapping.NEVER:
                  return 0;
                case PixelSnapping.ALWAYS:
                  return 1;
                case PixelSnapping.AUTO:
                  return 2;
                default:
                  return -1;
              }
            };
            PixelSnapping.classInitializer = null;

            PixelSnapping.initializer = null;

            PixelSnapping.classSymbols = null;

            PixelSnapping.instanceSymbols = null;

            PixelSnapping.NEVER = "never";
            PixelSnapping.ALWAYS = "always";
            PixelSnapping.AUTO = "auto";
            return PixelSnapping;
          })(AS.ASNative);
          display.PixelSnapping = PixelSnapping;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var SWFVersion = (function (_super) {
            __extends(SWFVersion, _super);
            function SWFVersion() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.SWFVersion");
            }
            SWFVersion.classInitializer = null;

            SWFVersion.initializer = null;

            SWFVersion.classSymbols = null;

            SWFVersion.instanceSymbols = null;

            SWFVersion.FLASH1 = 1;
            SWFVersion.FLASH2 = 2;
            SWFVersion.FLASH3 = 3;
            SWFVersion.FLASH4 = 4;
            SWFVersion.FLASH5 = 5;
            SWFVersion.FLASH6 = 6;
            SWFVersion.FLASH7 = 7;
            SWFVersion.FLASH8 = 8;
            SWFVersion.FLASH9 = 9;
            SWFVersion.FLASH10 = 10;
            SWFVersion.FLASH11 = 11;
            SWFVersion.FLASH12 = 12;
            return SWFVersion;
          })(AS.ASNative);
          display.SWFVersion = SWFVersion;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var Scene = (function (_super) {
            __extends(Scene, _super);
            function Scene(name, labels, offset, numFrames) {
              false && _super.call(this);
              this._name = asCoerceString(name);

              this._labels = labels;
              this.offset = offset;
              this._numFrames = numFrames | 0;
            }
            Object.defineProperty(Scene.prototype, "name", {
              get: function () {
                return this._name;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Scene.prototype, "labels", {
              get: function () {
                return this._labels;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Scene.prototype, "numFrames", {
              get: function () {
                return this._numFrames;
              },
              enumerable: true,
              configurable: true
            });

            Scene.prototype.clone = function () {
              var labels = this._labels.map(function (label) {
                return label.clone();
              });
              return new Scene(this._name, labels, this.offset, this._numFrames);
            };

            Scene.prototype.getLabelByName = function (name) {
              var labels = this._labels;
              for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                if (label.name === name) {
                  return label;
                }
              }
              return null;
            };

            Scene.prototype.getLabelByFrame = function (frame) {
              var labels = this._labels;
              for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                if (label.frame === frame) {
                  return label;
                }
              }
              return null;
            };
            Scene.classInitializer = null;
            Scene.initializer = null;
            Scene.classSymbols = null;
            Scene.instanceSymbols = null;
            return Scene;
          })(AS.ASNative);
          display.Scene = Scene;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var StageAlignFlags;
          (function (StageAlignFlags) {
            StageAlignFlags[StageAlignFlags["None"] = 0] = "None";
            StageAlignFlags[StageAlignFlags["Top"] = 1] = "Top";
            StageAlignFlags[StageAlignFlags["Bottom"] = 2] = "Bottom";
            StageAlignFlags[StageAlignFlags["Left"] = 4] = "Left";
            StageAlignFlags[StageAlignFlags["Right"] = 8] = "Right";
          })(StageAlignFlags || (StageAlignFlags = {}));

          var StageAlign = (function (_super) {
            __extends(StageAlign, _super);
            function StageAlign() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.StageAlign");
            }
            StageAlign.fromNumber = function (n) {
              if (n === 0) {
                return "";
              }
              var s = "";
              if (n & 1 /* Top */) {
                s += "T";
              }
              if (n & 2 /* Bottom */) {
                s += "B";
              }
              if (n & 4 /* Left */) {
                s += "L";
              }
              if (n & 8 /* Right */) {
                s += "R";
              }
              return s;
            };

            StageAlign.toNumber = function (value) {
              var n = 0;
              value = value.toUpperCase();
              if (value.indexOf("T") >= 0) {
                n |= 1 /* Top */;
              }
              if (value.indexOf("B") >= 0) {
                n |= 2 /* Bottom */;
              }
              if (value.indexOf("L") >= 0) {
                n |= 4 /* Left */;
              }
              if (value.indexOf("R") >= 0) {
                n |= 8 /* Right */;
              }
              return n;
            };
            StageAlign.classInitializer = null;
            StageAlign.initializer = null;
            StageAlign.classSymbols = null;
            StageAlign.instanceSymbols = null;

            StageAlign.TOP = "T";
            StageAlign.LEFT = "L";
            StageAlign.BOTTOM = "B";
            StageAlign.RIGHT = "R";
            StageAlign.TOP_LEFT = "TL";
            StageAlign.TOP_RIGHT = "TR";
            StageAlign.BOTTOM_LEFT = "BL";
            StageAlign.BOTTOM_RIGHT = "BR";
            return StageAlign;
          })(AS.ASNative);
          display.StageAlign = StageAlign;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var StageDisplayState = (function (_super) {
            __extends(StageDisplayState, _super);
            function StageDisplayState() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.StageDisplayState");
            }
            StageDisplayState.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return StageDisplayState.FULL_SCREEN;
                case 1:
                  return StageDisplayState.FULL_SCREEN_INTERACTIVE;
                case 2:
                  return StageDisplayState.NORMAL;
                default:
                  return null;
              }
            };

            StageDisplayState.toNumber = function (value) {
              switch (value) {
                case StageDisplayState.FULL_SCREEN:
                  return 0;
                case StageDisplayState.FULL_SCREEN_INTERACTIVE:
                  return 1;
                case StageDisplayState.NORMAL:
                  return 2;
                default:
                  return -1;
              }
            };
            StageDisplayState.classInitializer = null;

            StageDisplayState.initializer = null;

            StageDisplayState.classSymbols = null;

            StageDisplayState.instanceSymbols = null;

            StageDisplayState.FULL_SCREEN = "fullScreen";
            StageDisplayState.FULL_SCREEN_INTERACTIVE = "fullScreenInteractive";
            StageDisplayState.NORMAL = "normal";
            return StageDisplayState;
          })(AS.ASNative);
          display.StageDisplayState = StageDisplayState;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var StageQuality = (function (_super) {
            __extends(StageQuality, _super);
            function StageQuality() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.StageQuality");
            }
            StageQuality.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return StageQuality.LOW;
                case 1:
                  return StageQuality.MEDIUM;
                case 2:
                  return StageQuality.HIGH;
                case 3:
                  return StageQuality.BEST;
                case 4:
                  return StageQuality.HIGH_8X8;
                case 5:
                  return StageQuality.HIGH_8X8_LINEAR;
                case 6:
                  return StageQuality.HIGH_16X16;
                case 7:
                  return StageQuality.HIGH_16X16_LINEAR;
                default:
                  return null;
              }
            };

            StageQuality.toNumber = function (value) {
              switch (value) {
                case StageQuality.LOW:
                  return 0;
                case StageQuality.MEDIUM:
                  return 1;
                case StageQuality.HIGH:
                  return 2;
                case StageQuality.BEST:
                  return 3;
                case StageQuality.HIGH_8X8:
                  return 4;
                case StageQuality.HIGH_8X8_LINEAR:
                  return 5;
                case StageQuality.HIGH_16X16:
                  return 6;
                case StageQuality.HIGH_16X16_LINEAR:
                  return 7;
                default:
                  return -1;
              }
            };
            StageQuality.classInitializer = null;

            StageQuality.initializer = null;

            StageQuality.classSymbols = null;

            StageQuality.instanceSymbols = null;

            StageQuality.LOW = "low";
            StageQuality.MEDIUM = "medium";
            StageQuality.HIGH = "high";
            StageQuality.BEST = "best";
            StageQuality.HIGH_8X8 = "8x8";
            StageQuality.HIGH_8X8_LINEAR = "8x8linear";
            StageQuality.HIGH_16X16 = "16x16";
            StageQuality.HIGH_16X16_LINEAR = "16x16linear";
            return StageQuality;
          })(AS.ASNative);
          display.StageQuality = StageQuality;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var StageScaleMode = (function (_super) {
            __extends(StageScaleMode, _super);
            function StageScaleMode() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.StageScaleMode");
            }
            StageScaleMode.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return StageScaleMode.SHOW_ALL;
                case 1:
                  return StageScaleMode.EXACT_FIT;
                case 2:
                  return StageScaleMode.NO_BORDER;
                case 4:
                  return StageScaleMode.NO_SCALE;
                default:
                  return null;
              }
            };

            StageScaleMode.toNumber = function (value) {
              switch (value) {
                case StageScaleMode.SHOW_ALL:
                  return 0;
                case StageScaleMode.EXACT_FIT:
                  return 1;
                case StageScaleMode.NO_BORDER:
                  return 2;
                case StageScaleMode.NO_SCALE:
                  return 3;
                default:
                  return -1;
              }
            };
            StageScaleMode.classInitializer = null;

            StageScaleMode.initializer = null;

            StageScaleMode.classSymbols = null;

            StageScaleMode.instanceSymbols = null;

            StageScaleMode.SHOW_ALL = "showAll";
            StageScaleMode.EXACT_FIT = "exactFit";
            StageScaleMode.NO_BORDER = "noBorder";
            StageScaleMode.NO_SCALE = "noScale";
            return StageScaleMode;
          })(AS.ASNative);
          display.StageScaleMode = StageScaleMode;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var TriangleCulling = (function (_super) {
            __extends(TriangleCulling, _super);
            function TriangleCulling() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.TriangleCulling");
            }
            TriangleCulling.classInitializer = null;

            TriangleCulling.initializer = null;

            TriangleCulling.classSymbols = null;

            TriangleCulling.instanceSymbols = null;

            TriangleCulling.NONE = "none";
            TriangleCulling.POSITIVE = "positive";
            TriangleCulling.NEGATIVE = "negative";
            return TriangleCulling;
          })(AS.ASNative);
          display.TriangleCulling = TriangleCulling;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (display) {
          var notImplemented = Shumway.Debug.notImplemented;

          var AVM1Movie = (function (_super) {
            __extends(AVM1Movie, _super);
            function AVM1Movie() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.display.AVM1Movie");
            }
            AVM1Movie.classInitializer = null;

            AVM1Movie.initializer = null;

            AVM1Movie.classSymbols = null;

            AVM1Movie.instanceSymbols = null;
            return AVM1Movie;
          })(flash.display.DisplayObject);
          display.AVM1Movie = AVM1Movie;
        })(flash.display || (flash.display = {}));
        var display = flash.display;
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
      (function (flash) {
        (function (external) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
          var Telemetry = Shumway.Telemetry;
          var forEachPublicProperty = Shumway.AVM2.Runtime.forEachPublicProperty;
          var ExternalInterfaceService = Shumway.ExternalInterfaceService;

          var ExternalInterface = (function (_super) {
            __extends(ExternalInterface, _super);
            function ExternalInterface() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.external.ExternalInterface");
            }
            ExternalInterface._getAvailable = function () {
              return ExternalInterfaceService.instance.enabled;
            };

            ExternalInterface._initJS = function () {
              if (ExternalInterface.initialized) {
                return;
              }
              Telemetry.instance.reportTelemetry({ topic: 'feature', feature: 1 /* EXTERNAL_INTERFACE_FEATURE */ });
              ExternalInterface.initialized = true;
              ExternalInterfaceService.instance.initJS(ExternalInterface._callIn);
            };

            ExternalInterface._callIn = function (functionName, args) {
              var callback = ExternalInterface.registeredCallbacks[functionName];
              if (!callback) {
                return;
              }
              return callback(functionName, args);
            };

            ExternalInterface._getPropNames = function (obj) {
              var keys = [];
              forEachPublicProperty(obj, function (key) {
                keys.push(key);
              }, null);
              return keys;
            };

            ExternalInterface._addCallback = function (functionName, closure, hasNullCallback) {
              if (hasNullCallback) {
                ExternalInterfaceService.instance.unregisterCallback(functionName);
                delete ExternalInterface.registeredCallbacks[functionName];
              } else {
                ExternalInterfaceService.instance.registerCallback(functionName);
                ExternalInterface.registeredCallbacks[functionName] = closure;
              }
            };

            ExternalInterface._evalJS = function (expression) {
              expression = asCoerceString(expression);
              return ExternalInterfaceService.instance.eval(expression);
            };

            ExternalInterface._callOut = function (request) {
              request = asCoerceString(request);
              return ExternalInterfaceService.instance.call(request);
            };

            Object.defineProperty(ExternalInterface, "available", {
              get: function () {
                return ExternalInterface._getAvailable();
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ExternalInterface, "objectID", {
              get: function () {
                return ExternalInterfaceService.instance.getId();
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ExternalInterface, "activeX", {
              get: function () {
                return false;
              },
              enumerable: true,
              configurable: true
            });
            ExternalInterface.classInitializer = null;

            ExternalInterface.initializer = null;

            ExternalInterface.classSymbols = null;

            ExternalInterface.instanceSymbols = null;

            ExternalInterface.initialized = false;
            ExternalInterface.registeredCallbacks = createEmptyObject();
            return ExternalInterface;
          })(AS.ASNative);
          external.ExternalInterface = ExternalInterface;
        })(flash.external || (flash.external = {}));
        var external = flash.external;
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
      (function (flash) {
        (function (filters) {
          var BitmapFilterQuality = (function (_super) {
            __extends(BitmapFilterQuality, _super);
            function BitmapFilterQuality() {
              false && _super.call(this);
            }
            BitmapFilterQuality.classInitializer = null;

            BitmapFilterQuality.initializer = null;

            BitmapFilterQuality.classSymbols = null;

            BitmapFilterQuality.instanceSymbols = null;

            BitmapFilterQuality.LOW = 1;
            BitmapFilterQuality.MEDIUM = 2;
            BitmapFilterQuality.HIGH = 3;
            return BitmapFilterQuality;
          })(AS.ASNative);
          filters.BitmapFilterQuality = BitmapFilterQuality;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var BitmapFilterType = (function (_super) {
            __extends(BitmapFilterType, _super);
            function BitmapFilterType() {
              false && _super.call(this);
            }
            BitmapFilterType.classInitializer = null;

            BitmapFilterType.initializer = null;

            BitmapFilterType.classSymbols = null;

            BitmapFilterType.instanceSymbols = null;

            BitmapFilterType.INNER = "inner";
            BitmapFilterType.OUTER = "outer";
            BitmapFilterType.FULL = "full";
            return BitmapFilterType;
          })(AS.ASNative);
          filters.BitmapFilterType = BitmapFilterType;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var BitmapFilter = (function (_super) {
            __extends(BitmapFilter, _super);
            function BitmapFilter() {
              false && _super.call(this);
            }
            BitmapFilter._updateBlurBounds = function (bounds, blurX, blurY, quality, isBlurFilter) {
              if (typeof isBlurFilter === "undefined") { isBlurFilter = false; }
              var stepWidth = BitmapFilter.blurFilterStepWidths[quality - 1];
              if (isBlurFilter) {
                var stepWidth4 = stepWidth / 4;
                blurX -= stepWidth4;
                blurY -= stepWidth4;
              }

              var bh = Math.ceil((blurX < 1 ? 1 : blurX) * stepWidth);
              var bv = Math.ceil((blurY < 1 ? 1 : blurY) * stepWidth);
              bounds.inflate(bh, bv);
            };

            BitmapFilter.prototype._updateFilterBounds = function (bounds) {
            };

            BitmapFilter.prototype._serialize = function (message) {
              message.writeInt(-1);
            };

            BitmapFilter.prototype.clone = function () {
              return null;
            };
            BitmapFilter.classInitializer = null;

            BitmapFilter.initializer = null;

            BitmapFilter.classSymbols = null;

            BitmapFilter.instanceSymbols = null;

            BitmapFilter.EPS = 0.000000001;

            BitmapFilter.blurFilterStepWidths = [0.5, 1.05, 1.35, 1.55, 1.75, 1.9, 2, 2.1, 2.2, 2.3, 2.5, 3, 3, 3.5, 3.5];
            return BitmapFilter;
          })(AS.ASNative);
          filters.BitmapFilter = BitmapFilter;

          var GradientArrays = (function () {
            function GradientArrays() {
            }
            GradientArrays.sanitize = function (colors, alphas, ratios) {
              if (Shumway.isNullOrUndefined(colors) || colors.length === 0) {
                this.colors = [];
                this.alphas = [];
                this.ratios = [];
              } else {
                var len;
                if (Shumway.isNullOrUndefined(ratios)) {
                  this.colors = this.sanitizeColors(colors);
                  len = this.colors.length;
                  this.ratios = this.initArray(len);
                  if (Shumway.isNullOrUndefined(alphas)) {
                    this.alphas = this.initArray(len);
                  } else {
                    this.alphas = this.sanitizeAlphas(alphas, len, len, 1);
                  }
                } else {
                  if (ratios.length === 0) {
                    this.colors = [];
                    this.alphas = [];
                    this.ratios = [];
                  } else {
                    len = Math.min(colors.length, ratios.length, 16);
                    this.colors = this.sanitizeColors(colors, len);
                    this.ratios = this.sanitizeRatios(ratios, len);
                    if (Shumway.isNullOrUndefined(alphas)) {
                      this.alphas = this.initArray(len);
                    } else {
                      this.alphas = this.sanitizeAlphas(alphas, len, len, 1);
                    }
                  }
                }
              }
            };

            GradientArrays.sanitizeColors = function (colors, maxLen) {
              if (typeof maxLen === "undefined") { maxLen = 16; }
              var arr = [];
              for (var i = 0, n = Math.min(colors.length, maxLen); i < n; i++) {
                arr[i] = (colors[i] >>> 0) & 0xffffff;
              }
              return arr;
            };

            GradientArrays.sanitizeAlphas = function (alphas, maxLen, minLen, value) {
              if (typeof maxLen === "undefined") { maxLen = 16; }
              if (typeof minLen === "undefined") { minLen = 0; }
              if (typeof value === "undefined") { value = 0; }
              var arr = [];
              for (var i = 0, n = Math.min(alphas.length, maxLen); i < n; i++) {
                arr[i] = Shumway.NumberUtilities.clamp(+alphas[i], 0, 1);
              }
              while (i < minLen) {
                arr[i++] = value;
              }
              return arr;
            };

            GradientArrays.sanitizeRatios = function (ratios, maxLen, minLen, value) {
              if (typeof maxLen === "undefined") { maxLen = 16; }
              if (typeof minLen === "undefined") { minLen = 0; }
              if (typeof value === "undefined") { value = 0; }
              var arr = [];
              for (var i = 0, n = Math.min(ratios.length, maxLen); i < n; i++) {
                arr[i] = Shumway.NumberUtilities.clamp(+ratios[i], 0, 255);
              }
              while (i < minLen) {
                arr[i++] = value;
              }
              return arr;
            };

            GradientArrays.initArray = function (len, value) {
              if (typeof value === "undefined") { value = 0; }
              var arr = Array(len);
              for (var i = 0; i < len; i++) {
                arr[i] = value;
              }
              return arr;
            };
            return GradientArrays;
          })();
          filters.GradientArrays = GradientArrays;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var assert = Shumway.Debug.assert;

          var BevelFilter = (function (_super) {
            __extends(BevelFilter, _super);
            function BevelFilter(distance, angle, highlightColor, highlightAlpha, shadowColor, shadowAlpha, blurX, blurY, strength, quality, type, knockout) {
              if (typeof distance === "undefined") { distance = 4; }
              if (typeof angle === "undefined") { angle = 45; }
              if (typeof highlightColor === "undefined") { highlightColor = 16777215; }
              if (typeof highlightAlpha === "undefined") { highlightAlpha = 1; }
              if (typeof shadowColor === "undefined") { shadowColor = 0; }
              if (typeof shadowAlpha === "undefined") { shadowAlpha = 1; }
              if (typeof blurX === "undefined") { blurX = 4; }
              if (typeof blurY === "undefined") { blurY = 4; }
              if (typeof strength === "undefined") { strength = 1; }
              if (typeof quality === "undefined") { quality = 1; }
              if (typeof type === "undefined") { type = "inner"; }
              if (typeof knockout === "undefined") { knockout = false; }
              false && _super.call(this);
              this.distance = distance;
              this.angle = angle;
              this.highlightColor = highlightColor;
              this.highlightAlpha = highlightAlpha;
              this.shadowColor = shadowColor;
              this.shadowAlpha = shadowAlpha;
              this.blurX = blurX;
              this.blurY = blurY;
              this.strength = strength;
              this.quality = quality;
              this.type = type;
              this.knockout = knockout;
            }
            BevelFilter.FromUntyped = function (obj) {
              var highlightColor = obj.highlightColor >>> 8;
              var highlightAlpha = (obj.highlightColor & 0xff) / 0xff;

              release || assert(obj.colors && obj.colors.length === 1, "colors must be Array of length 1");
              var shadowColor = obj.colors[0] >>> 8;
              var shadowAlpha = (obj.colors[0] & 0xff) / 0xff;

              var type = flash.filters.BitmapFilterType.OUTER;
              if (!!obj.onTop) {
                type = flash.filters.BitmapFilterType.FULL;
              } else if (!!obj.inner) {
                type = flash.filters.BitmapFilterType.INNER;
              }

              var angle = obj.angle * 180 / Math.PI;
              return new BevelFilter(obj.distance, angle, highlightColor, highlightAlpha, shadowColor, shadowAlpha, obj.blurX, obj.blurY, obj.strength, obj.quality, type, obj.knockout);
            };

            BevelFilter.prototype._updateFilterBounds = function (bounds) {
              if (this.type !== filters.BitmapFilterType.INNER) {
                filters.BitmapFilter._updateBlurBounds(bounds, this._blurX, this._blurY, this._quality);
                if (this._distance !== 0) {
                  var a = this._angle * Math.PI / 180;
                  bounds.x += Math.floor(Math.cos(a) * this._distance);
                  bounds.y += Math.floor(Math.sin(a) * this._distance);
                  if (bounds.left > 0) {
                    bounds.left = 0;
                  }
                  if (bounds.top > 0) {
                    bounds.top = 0;
                  }
                }
              }
            };

            Object.defineProperty(BevelFilter.prototype, "distance", {
              get: function () {
                return this._distance;
              },
              set: function (value) {
                this._distance = +value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "angle", {
              get: function () {
                return this._angle;
              },
              set: function (value) {
                this._angle = +value % 360;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "highlightColor", {
              get: function () {
                return this._highlightColor;
              },
              set: function (value) {
                this._highlightColor = (value >>> 0) & 0xffffff;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "highlightAlpha", {
              get: function () {
                return this._highlightAlpha;
              },
              set: function (value) {
                this._highlightAlpha = Shumway.NumberUtilities.clamp(+value, 0, 1);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "shadowColor", {
              get: function () {
                return this._shadowColor;
              },
              set: function (value) {
                this._shadowColor = (value >>> 0) & 0xffffff;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "shadowAlpha", {
              get: function () {
                return this._shadowAlpha;
              },
              set: function (value) {
                this._shadowAlpha = Shumway.NumberUtilities.clamp(+value, 0, 1);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "blurX", {
              get: function () {
                return this._blurX;
              },
              set: function (value) {
                this._blurX = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "blurY", {
              get: function () {
                return this._blurY;
              },
              set: function (value) {
                this._blurY = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "knockout", {
              get: function () {
                return this._knockout;
              },
              set: function (value) {
                this._knockout = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "quality", {
              get: function () {
                return this._quality;
              },
              set: function (value) {
                this._quality = Shumway.NumberUtilities.clamp(value | 0, 0, 15);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "strength", {
              get: function () {
                return this._strength;
              },
              set: function (value) {
                this._strength = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BevelFilter.prototype, "type", {
              get: function () {
                return this._type;
              },
              set: function (value) {
                value = asCoerceString(value);
                if (value === null) {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "type");
                } else {
                  if (value === filters.BitmapFilterType.INNER || value === filters.BitmapFilterType.OUTER) {
                    this._type = value;
                  } else {
                    this._type = filters.BitmapFilterType.FULL;
                  }
                }
              },
              enumerable: true,
              configurable: true
            });

            BevelFilter.prototype.clone = function () {
              return new BevelFilter(this._distance, this._angle, this._highlightColor, this._highlightAlpha, this._shadowColor, this._shadowAlpha, this._blurX, this._blurY, this._strength, this._quality, this._type, this._knockout);
            };
            BevelFilter.classInitializer = null;

            BevelFilter.initializer = null;

            BevelFilter.classSymbols = null;

            BevelFilter.instanceSymbols = null;
            return BevelFilter;
          })(flash.filters.BitmapFilter);
          filters.BevelFilter = BevelFilter;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var BlurFilter = (function (_super) {
            __extends(BlurFilter, _super);
            function BlurFilter(blurX, blurY, quality) {
              if (typeof blurX === "undefined") { blurX = 4; }
              if (typeof blurY === "undefined") { blurY = 4; }
              if (typeof quality === "undefined") { quality = 1; }
              false && _super.call(this);
              this.blurX = blurX;
              this.blurY = blurY;
              this.quality = quality;
            }
            BlurFilter.FromUntyped = function (obj) {
              return new BlurFilter(obj.blurX, obj.blurY, obj.quality);
            };

            BlurFilter.prototype._updateFilterBounds = function (bounds) {
              filters.BitmapFilter._updateBlurBounds(bounds, this._blurX, this._blurY, this._quality, true);
            };

            BlurFilter.prototype._serialize = function (message) {
              message.ensureAdditionalCapacity(16);
              message.writeIntUnsafe(1);
              message.writeFloatUnsafe(this._blurX);
              message.writeFloatUnsafe(this._blurY);
              message.writeIntUnsafe(this._quality);
            };

            Object.defineProperty(BlurFilter.prototype, "blurX", {
              get: function () {
                return this._blurX;
              },
              set: function (value) {
                this._blurX = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BlurFilter.prototype, "blurY", {
              get: function () {
                return this._blurY;
              },
              set: function (value) {
                this._blurY = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(BlurFilter.prototype, "quality", {
              get: function () {
                return this._quality;
              },
              set: function (value) {
                this._quality = Shumway.NumberUtilities.clamp(value | 0, 0, 15);
              },
              enumerable: true,
              configurable: true
            });

            BlurFilter.prototype.clone = function () {
              return new BlurFilter(this._blurX, this._blurY, this._quality);
            };
            BlurFilter.classInitializer = null;

            BlurFilter.initializer = null;

            BlurFilter.classSymbols = null;

            BlurFilter.instanceSymbols = null;
            return BlurFilter;
          })(flash.filters.BitmapFilter);
          filters.BlurFilter = BlurFilter;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var ColorMatrixFilter = (function (_super) {
            __extends(ColorMatrixFilter, _super);
            function ColorMatrixFilter(matrix) {
              if (typeof matrix === "undefined") { matrix = null; }
              false && _super.call(this);
              if (matrix) {
                this.matrix = matrix;
              } else {
                this._matrix = [
                  1, 0, 0, 0, 0,
                  0, 1, 0, 0, 0,
                  0, 0, 1, 0, 0,
                  0, 0, 0, 1, 0
                ];
              }
            }
            ColorMatrixFilter.FromUntyped = function (obj) {
              return new ColorMatrixFilter(obj.matrix);
            };

            ColorMatrixFilter.prototype._serialize = function (message) {
              var matrix = this._matrix;
              message.ensureAdditionalCapacity((matrix.length + 1) * 4);
              message.writeIntUnsafe(6);
              for (var i = 0; i < matrix.length; i++) {
                message.writeFloatUnsafe(matrix[i]);
              }
            };

            Object.defineProperty(ColorMatrixFilter.prototype, "matrix", {
              get: function () {
                return this._matrix.concat();
              },
              set: function (value) {
                if (!Shumway.isNullOrUndefined(value)) {
                  var matrix = [
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0
                  ];
                  for (var i = 0, n = Math.min(value.length, 20); i < n; i++) {
                    matrix[i] = Shumway.toNumber(value[i]);
                  }
                  this._matrix = matrix;
                } else {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "matrix");
                }
              },
              enumerable: true,
              configurable: true
            });

            ColorMatrixFilter.prototype.clone = function () {
              return new ColorMatrixFilter(this.matrix);
            };
            ColorMatrixFilter.classInitializer = null;

            ColorMatrixFilter.initializer = null;

            ColorMatrixFilter.classSymbols = null;

            ColorMatrixFilter.instanceSymbols = null;
            return ColorMatrixFilter;
          })(flash.filters.BitmapFilter);
          filters.ColorMatrixFilter = ColorMatrixFilter;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var ConvolutionFilter = (function (_super) {
            __extends(ConvolutionFilter, _super);
            function ConvolutionFilter(matrixX, matrixY, matrix, divisor, bias, preserveAlpha, clamp, color, alpha) {
              if (typeof matrixX === "undefined") { matrixX = 0; }
              if (typeof matrixY === "undefined") { matrixY = 0; }
              if (typeof matrix === "undefined") { matrix = null; }
              if (typeof divisor === "undefined") { divisor = 1; }
              if (typeof bias === "undefined") { bias = 0; }
              if (typeof preserveAlpha === "undefined") { preserveAlpha = true; }
              if (typeof clamp === "undefined") { clamp = true; }
              if (typeof color === "undefined") { color = 0; }
              if (typeof alpha === "undefined") { alpha = 0; }
              false && _super.call(this);
              this.matrixX = matrixX;
              this.matrixY = matrixY;
              if (matrix) {
                this.matrix = matrix;
              } else {
                this._matrix = this._expandArray([], this._matrixX * this._matrixY);
              }
              this.divisor = divisor;
              this.bias = bias;
              this.preserveAlpha = preserveAlpha;
              this.clamp = clamp;
              this.color = color;
              this.alpha = alpha;
            }
            ConvolutionFilter.FromUntyped = function (obj) {
              return new ConvolutionFilter(obj.matrixX, obj.matrixY, obj.matrix, obj.divisor, obj.bias, obj.preserveAlpha, obj.clamp, obj.color >>> 8, (obj.color & 0xff) / 0xff);
            };

            ConvolutionFilter.prototype._expandArray = function (a, newLen, value) {
              if (typeof value === "undefined") { value = 0; }
              if (a) {
                var i = a.length;
                while (i < newLen) {
                  a[i++] = 0;
                }
              }
              return a;
            };

            Object.defineProperty(ConvolutionFilter.prototype, "matrix", {
              get: function () {
                return this._matrix.slice(0, this._matrixX * this._matrixY);
              },
              set: function (value) {
                if (!Shumway.isNullOrUndefined(value)) {
                  var actualLen = this._matrixX * this._matrixY;
                  var minLen = Math.min(value.length, actualLen);
                  var matrix = Array(minLen);
                  for (var i = 0; i < minLen; i++) {
                    matrix[i] = Shumway.toNumber(value[i]);
                  }
                  this._expandArray(matrix, actualLen);
                  this._matrix = matrix;
                } else {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "matrix");
                }
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ConvolutionFilter.prototype, "matrixX", {
              get: function () {
                return this._matrixX;
              },
              set: function (value) {
                var mx = Shumway.NumberUtilities.clamp(+value, 0, 15) | 0;
                if (this._matrixX !== mx) {
                  this._matrixX = mx;
                  this._expandArray(this._matrix, mx * this._matrixY);
                }
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ConvolutionFilter.prototype, "matrixY", {
              get: function () {
                return this._matrixY;
              },
              set: function (value) {
                var my = Shumway.NumberUtilities.clamp(+value, 0, 15) | 0;
                if (this._matrixY !== my) {
                  this._matrixY = my;
                  this._expandArray(this._matrix, my * this._matrixX);
                }
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ConvolutionFilter.prototype, "divisor", {
              get: function () {
                return this._divisor;
              },
              set: function (value) {
                this._divisor = +value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ConvolutionFilter.prototype, "bias", {
              get: function () {
                return this._bias;
              },
              set: function (value) {
                this._bias = +value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ConvolutionFilter.prototype, "preserveAlpha", {
              get: function () {
                return this._preserveAlpha;
              },
              set: function (value) {
                this._preserveAlpha = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ConvolutionFilter.prototype, "clamp", {
              get: function () {
                return this._clamp;
              },
              set: function (value) {
                this._clamp = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ConvolutionFilter.prototype, "color", {
              get: function () {
                return this._color;
              },
              set: function (value) {
                this._color = value >>> 0;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ConvolutionFilter.prototype, "alpha", {
              get: function () {
                return this._alpha;
              },
              set: function (value) {
                this._alpha = Shumway.NumberUtilities.clamp(+value, 0, 1);
              },
              enumerable: true,
              configurable: true
            });

            ConvolutionFilter.prototype.clone = function () {
              return new ConvolutionFilter(this._matrixX, this._matrixY, this.matrix, this._divisor, this._bias, this._preserveAlpha, this._clamp, this._color, this._alpha);
            };
            ConvolutionFilter.classInitializer = null;

            ConvolutionFilter.initializer = null;

            ConvolutionFilter.classSymbols = null;

            ConvolutionFilter.instanceSymbols = null;
            return ConvolutionFilter;
          })(flash.filters.BitmapFilter);
          filters.ConvolutionFilter = ConvolutionFilter;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var notImplemented = Shumway.Debug.notImplemented;

          var DisplacementMapFilterMode = (function (_super) {
            __extends(DisplacementMapFilterMode, _super);
            function DisplacementMapFilterMode() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.filters.DisplacementMapFilterMode");
            }
            DisplacementMapFilterMode.classInitializer = null;

            DisplacementMapFilterMode.initializer = null;

            DisplacementMapFilterMode.classSymbols = null;

            DisplacementMapFilterMode.instanceSymbols = null;

            DisplacementMapFilterMode.WRAP = "wrap";
            DisplacementMapFilterMode.CLAMP = "clamp";
            DisplacementMapFilterMode.IGNORE = "ignore";
            DisplacementMapFilterMode.COLOR = "color";
            return DisplacementMapFilterMode;
          })(AS.ASNative);
          filters.DisplacementMapFilterMode = DisplacementMapFilterMode;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var DisplacementMapFilter = (function (_super) {
            __extends(DisplacementMapFilter, _super);
            function DisplacementMapFilter(mapBitmap, mapPoint, componentX, componentY, scaleX, scaleY, mode, color, alpha) {
              if (typeof mapBitmap === "undefined") { mapBitmap = null; }
              if (typeof mapPoint === "undefined") { mapPoint = null; }
              if (typeof componentX === "undefined") { componentX = 0; }
              if (typeof componentY === "undefined") { componentY = 0; }
              if (typeof scaleX === "undefined") { scaleX = 0; }
              if (typeof scaleY === "undefined") { scaleY = 0; }
              if (typeof mode === "undefined") { mode = "wrap"; }
              if (typeof color === "undefined") { color = 0; }
              if (typeof alpha === "undefined") { alpha = 0; }
              false && _super.call(this);
              this.mapBitmap = mapBitmap;
              this.mapPoint = mapPoint;
              this.componentX = componentX;
              this.componentY = componentY;
              this.scaleX = scaleX;
              this.scaleY = scaleY;
              this.mode = mode;
              this.color = color;
              this.alpha = alpha;
            }
            DisplacementMapFilter.FromUntyped = function (obj) {
              return new DisplacementMapFilter(obj.mapBitmap, obj.mapPoint, obj.componentX, obj.componentY, obj.scaleX, obj.scaleY, obj.mode, obj.color, obj.alpha);
            };

            Object.defineProperty(DisplacementMapFilter.prototype, "mapBitmap", {
              get: function () {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::get mapBitmap");
                return this._mapBitmap;
              },
              set: function (value) {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::set mapBitmap");
                this._mapBitmap = value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplacementMapFilter.prototype, "mapPoint", {
              get: function () {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::get mapPoint");
                return this._mapPoint;
              },
              set: function (value) {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::set mapPoint");
                this._mapPoint = value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplacementMapFilter.prototype, "componentX", {
              get: function () {
                return this._componentX;
              },
              set: function (value) {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::set componentX");
                this._componentX = value >>> 0;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplacementMapFilter.prototype, "componentY", {
              get: function () {
                return this._componentY;
              },
              set: function (value) {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::set componentY");
                this._componentY = value >>> 0;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplacementMapFilter.prototype, "scaleX", {
              get: function () {
                return this._scaleX;
              },
              set: function (value) {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::set scaleX");
                this._scaleX = +value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplacementMapFilter.prototype, "scaleY", {
              get: function () {
                return this._scaleY;
              },
              set: function (value) {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::set scaleY");
                this._scaleY = +value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplacementMapFilter.prototype, "mode", {
              get: function () {
                return this._mode;
              },
              set: function (value) {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::set mode");
                this._mode = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplacementMapFilter.prototype, "color", {
              get: function () {
                return this._color;
              },
              set: function (value) {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::set color");
                this._color = (value >>> 0) & 0xffffff;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DisplacementMapFilter.prototype, "alpha", {
              get: function () {
                return this._alpha;
              },
              set: function (value) {
                somewhatImplemented("public flash.filters.DisplacementMapFilter::set alpha");
                this._alpha = +value;
              },
              enumerable: true,
              configurable: true
            });

            DisplacementMapFilter.prototype.clone = function () {
              return new DisplacementMapFilter(this._mapBitmap, this._mapPoint, this._componentX, this._componentY, this._scaleX, this._scaleY, this._mode, this._color, this._alpha);
            };
            DisplacementMapFilter.classInitializer = null;

            DisplacementMapFilter.initializer = null;

            DisplacementMapFilter.classSymbols = null;

            DisplacementMapFilter.instanceSymbols = null;
            return DisplacementMapFilter;
          })(flash.filters.BitmapFilter);
          filters.DisplacementMapFilter = DisplacementMapFilter;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var assert = Shumway.Debug.assert;

          var DropShadowFilter = (function (_super) {
            __extends(DropShadowFilter, _super);
            function DropShadowFilter(distance, angle, color, alpha, blurX, blurY, strength, quality, inner, knockout, hideObject) {
              if (typeof distance === "undefined") { distance = 4; }
              if (typeof angle === "undefined") { angle = 45; }
              if (typeof color === "undefined") { color = 0; }
              if (typeof alpha === "undefined") { alpha = 1; }
              if (typeof blurX === "undefined") { blurX = 4; }
              if (typeof blurY === "undefined") { blurY = 4; }
              if (typeof strength === "undefined") { strength = 1; }
              if (typeof quality === "undefined") { quality = 1; }
              if (typeof inner === "undefined") { inner = false; }
              if (typeof knockout === "undefined") { knockout = false; }
              if (typeof hideObject === "undefined") { hideObject = false; }
              false && _super.call(this);
              this.distance = distance;
              this.angle = angle;
              this.color = color;
              this.alpha = alpha;
              this.blurX = blurX;
              this.blurY = blurY;
              this.strength = strength;
              this.quality = quality;
              this.inner = inner;
              this.knockout = knockout;
              this.hideObject = hideObject;
            }
            DropShadowFilter.FromUntyped = function (obj) {
              release || assert(obj.colors && obj.colors.length === 1, "colors must be Array of length 1");
              var color = obj.colors[0] >>> 8;
              var alpha = (obj.colors[0] & 0xff) / 0xff;

              var angle = obj.angle * 180 / Math.PI;

              var hideObject = !obj.compositeSource;
              return new DropShadowFilter(obj.distance, angle, color, alpha, obj.blurX, obj.blurY, obj.strength, obj.quality, obj.inner, obj.knockout, hideObject);
            };

            DropShadowFilter.prototype._updateFilterBounds = function (bounds) {
              if (!this.inner) {
                filters.BitmapFilter._updateBlurBounds(bounds, this._blurX, this._blurY, this._quality);
                if (this._distance !== 0) {
                  var a = this._angle * Math.PI / 180;
                  bounds.x += Math.floor(Math.cos(a) * this._distance);
                  bounds.y += Math.floor(Math.sin(a) * this._distance);
                  if (bounds.left > 0) {
                    bounds.left = 0;
                  }
                  if (bounds.top > 0) {
                    bounds.top = 0;
                  }
                }
              }
            };

            DropShadowFilter.prototype._serialize = function (message) {
              message.ensureAdditionalCapacity(48);
              message.writeIntUnsafe(0);
              message.writeFloatUnsafe(this._alpha);
              message.writeFloatUnsafe(this._angle);
              message.writeFloatUnsafe(this._blurX);
              message.writeFloatUnsafe(this._blurY);
              message.writeIntUnsafe(this._color);
              message.writeFloatUnsafe(this._distance);
              message.writeIntUnsafe(this._hideObject);
              message.writeIntUnsafe(this._inner);
              message.writeIntUnsafe(this._knockout);
              message.writeIntUnsafe(this._quality);
              message.writeFloatUnsafe(this._strength);
            };

            Object.defineProperty(DropShadowFilter.prototype, "distance", {
              get: function () {
                return this._distance;
              },
              set: function (value) {
                this._distance = +value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DropShadowFilter.prototype, "angle", {
              get: function () {
                return this._angle;
              },
              set: function (value) {
                this._angle = +value % 360;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DropShadowFilter.prototype, "color", {
              get: function () {
                return this._color;
              },
              set: function (value) {
                this._color = (value >>> 0) & 0xffffff;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DropShadowFilter.prototype, "alpha", {
              get: function () {
                return this._alpha;
              },
              set: function (value) {
                this._alpha = Shumway.NumberUtilities.clamp(+value, 0, 1);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DropShadowFilter.prototype, "blurX", {
              get: function () {
                return this._blurX;
              },
              set: function (value) {
                this._blurX = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DropShadowFilter.prototype, "blurY", {
              get: function () {
                return this._blurY;
              },
              set: function (value) {
                this._blurY = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DropShadowFilter.prototype, "hideObject", {
              get: function () {
                return this._hideObject;
              },
              set: function (value) {
                this._hideObject = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DropShadowFilter.prototype, "inner", {
              get: function () {
                return this._inner;
              },
              set: function (value) {
                this._inner = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DropShadowFilter.prototype, "knockout", {
              get: function () {
                return this._knockout;
              },
              set: function (value) {
                this._knockout = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(DropShadowFilter.prototype, "quality", {
              get: function () {
                return this._quality;
              },
              set: function (value) {
                this._quality = Shumway.NumberUtilities.clamp(value | 0, 0, 15);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(DropShadowFilter.prototype, "strength", {
              get: function () {
                return this._strength;
              },
              set: function (value) {
                this._strength = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            DropShadowFilter.prototype.clone = function () {
              return new DropShadowFilter(this._distance, this._angle, this._color, this._alpha, this._blurX, this._blurY, this._strength, this._quality, this._inner, this._knockout, this._hideObject);
            };
            DropShadowFilter.classInitializer = null;

            DropShadowFilter.initializer = null;

            DropShadowFilter.classSymbols = null;

            DropShadowFilter.instanceSymbols = null;
            return DropShadowFilter;
          })(flash.filters.BitmapFilter);
          filters.DropShadowFilter = DropShadowFilter;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var assert = Shumway.Debug.assert;

          var GlowFilter = (function (_super) {
            __extends(GlowFilter, _super);
            function GlowFilter(color, alpha, blurX, blurY, strength, quality, inner, knockout) {
              if (typeof color === "undefined") { color = 16711680; }
              if (typeof alpha === "undefined") { alpha = 1; }
              if (typeof blurX === "undefined") { blurX = 6; }
              if (typeof blurY === "undefined") { blurY = 6; }
              if (typeof strength === "undefined") { strength = 2; }
              if (typeof quality === "undefined") { quality = 1; }
              if (typeof inner === "undefined") { inner = false; }
              if (typeof knockout === "undefined") { knockout = false; }
              false && _super.call(this);
              this.color = color;
              this.alpha = alpha;
              this.blurX = blurX;
              this.blurY = blurY;
              this.strength = strength;
              this.quality = quality;
              this.inner = inner;
              this.knockout = knockout;
            }
            GlowFilter.FromUntyped = function (obj) {
              release || assert(obj.colors && obj.colors.length === 1, "colors must be Array of length 1");
              var color = obj.colors[0] >>> 8;
              var alpha = (obj.colors[0] & 0xff) / 0xff;
              return new GlowFilter(color, alpha, obj.blurX, obj.blurY, obj.strength, obj.quality, obj.inner, obj.knockout);
            };

            GlowFilter.prototype._updateFilterBounds = function (bounds) {
              filters.BitmapFilter._updateBlurBounds(bounds, this._blurX, this._blurY, this._quality);
            };

            GlowFilter.prototype._serialize = function (message) {
              message.ensureAdditionalCapacity(36);
              message.writeIntUnsafe(2);
              message.writeFloatUnsafe(this._alpha);
              message.writeFloatUnsafe(this._blurX);
              message.writeFloatUnsafe(this._blurY);
              message.writeIntUnsafe(this._color);
              message.writeIntUnsafe(this._inner);
              message.writeIntUnsafe(this._knockout);
              message.writeIntUnsafe(this._quality);
              message.writeFloatUnsafe(this._strength);
            };

            Object.defineProperty(GlowFilter.prototype, "color", {
              get: function () {
                return this._color;
              },
              set: function (value) {
                this._color = (value >>> 0) & 0xffffff;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GlowFilter.prototype, "alpha", {
              get: function () {
                return this._alpha;
              },
              set: function (value) {
                this._alpha = Shumway.NumberUtilities.clamp(+value, 0, 1);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GlowFilter.prototype, "blurX", {
              get: function () {
                return this._blurX;
              },
              set: function (value) {
                this._blurX = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GlowFilter.prototype, "blurY", {
              get: function () {
                return this._blurY;
              },
              set: function (value) {
                this._blurY = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GlowFilter.prototype, "inner", {
              get: function () {
                return this._inner;
              },
              set: function (value) {
                this._inner = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GlowFilter.prototype, "knockout", {
              get: function () {
                return this._knockout;
              },
              set: function (value) {
                this._knockout = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GlowFilter.prototype, "quality", {
              get: function () {
                return this._quality;
              },
              set: function (value) {
                this._quality = Shumway.NumberUtilities.clamp(value | 0, 0, 15);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GlowFilter.prototype, "strength", {
              get: function () {
                return this._strength;
              },
              set: function (value) {
                this._strength = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            GlowFilter.prototype.clone = function () {
              return new GlowFilter(this._color, this._alpha, this._blurX, this._blurY, this._strength, this._quality, this._inner, this._knockout);
            };
            GlowFilter.classInitializer = null;

            GlowFilter.initializer = null;

            GlowFilter.classSymbols = null;

            GlowFilter.instanceSymbols = null;
            return GlowFilter;
          })(flash.filters.BitmapFilter);
          filters.GlowFilter = GlowFilter;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var GradientBevelFilter = (function (_super) {
            __extends(GradientBevelFilter, _super);
            function GradientBevelFilter(distance, angle, colors, alphas, ratios, blurX, blurY, strength, quality, type, knockout) {
              if (typeof distance === "undefined") { distance = 4; }
              if (typeof angle === "undefined") { angle = 45; }
              if (typeof colors === "undefined") { colors = null; }
              if (typeof alphas === "undefined") { alphas = null; }
              if (typeof ratios === "undefined") { ratios = null; }
              if (typeof blurX === "undefined") { blurX = 4; }
              if (typeof blurY === "undefined") { blurY = 4; }
              if (typeof strength === "undefined") { strength = 1; }
              if (typeof quality === "undefined") { quality = 1; }
              if (typeof type === "undefined") { type = "inner"; }
              if (typeof knockout === "undefined") { knockout = false; }
              false && _super.call(this);
              this.distance = distance;
              this.angle = angle;
              filters.GradientArrays.sanitize(colors, alphas, ratios);
              this._colors = filters.GradientArrays.colors;
              this._alphas = filters.GradientArrays.alphas;
              this._ratios = filters.GradientArrays.ratios;
              this.blurX = blurX;
              this.blurY = blurY;
              this.strength = strength;
              this.quality = quality;
              this.type = type;
              this.knockout = knockout;
            }
            GradientBevelFilter.FromUntyped = function (obj) {
              var colors = [];
              var alphas = [];
              for (var i = 0; i < obj.colors.length; i++) {
                var color = obj.colors[i];
                colors.push(color >>> 8);
                alphas.push(color & 0xff) / 0xff;
              }

              var type = flash.filters.BitmapFilterType.OUTER;
              if (!!obj.onTop) {
                type = flash.filters.BitmapFilterType.FULL;
              } else if (!!obj.inner) {
                type = flash.filters.BitmapFilterType.INNER;
              }

              var angle = obj.angle * 180 / Math.PI;
              return new GradientBevelFilter(obj.distance, angle, colors, alphas, obj.ratios, obj.blurX, obj.blurY, obj.strength, obj.quality, type, obj.knockout);
            };

            GradientBevelFilter.prototype._updateFilterBounds = function (bounds) {
              if (this.type !== filters.BitmapFilterType.INNER) {
                filters.BitmapFilter._updateBlurBounds(bounds, this._blurX, this._blurY, this._quality);
                if (this._distance !== 0) {
                  var a = this._angle * Math.PI / 180;
                  bounds.x += Math.floor(Math.cos(a) * this._distance);
                  bounds.y += Math.floor(Math.sin(a) * this._distance);
                  if (bounds.left > 0) {
                    bounds.left = 0;
                  }
                  if (bounds.top > 0) {
                    bounds.top = 0;
                  }
                }
              }
            };

            Object.defineProperty(GradientBevelFilter.prototype, "distance", {
              get: function () {
                return this._distance;
              },
              set: function (value) {
                this._distance = +value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "angle", {
              get: function () {
                return this._angle;
              },
              set: function (value) {
                this._angle = +value % 360;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "colors", {
              get: function () {
                return this._colors.concat();
              },
              set: function (value) {
                if (!Shumway.isNullOrUndefined(value)) {
                  this._colors = filters.GradientArrays.sanitizeColors(value);
                  var len = this._colors.length;
                  this._alphas = filters.GradientArrays.sanitizeAlphas(this._alphas, len, len);
                  this._ratios = filters.GradientArrays.sanitizeRatios(this._ratios, len, len);
                } else {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "colors");
                }
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "alphas", {
              get: function () {
                return this._alphas.concat();
              },
              set: function (value) {
                if (!Shumway.isNullOrUndefined(value)) {
                  filters.GradientArrays.sanitize(this._colors, value, this._ratios);
                  this._colors = filters.GradientArrays.colors;
                  this._alphas = filters.GradientArrays.alphas;
                  this._ratios = filters.GradientArrays.ratios;
                } else {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "alphas");
                }
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "ratios", {
              get: function () {
                return this._ratios.concat();
              },
              set: function (value) {
                if (!Shumway.isNullOrUndefined(value)) {
                  filters.GradientArrays.sanitize(this._colors, this._alphas, value);
                  this._colors = filters.GradientArrays.colors;
                  this._alphas = filters.GradientArrays.alphas;
                  this._ratios = filters.GradientArrays.ratios;
                } else {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "ratios");
                }
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "blurX", {
              get: function () {
                return this._blurX;
              },
              set: function (value) {
                this._blurX = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "blurY", {
              get: function () {
                return this._blurY;
              },
              set: function (value) {
                this._blurY = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "knockout", {
              get: function () {
                return this._knockout;
              },
              set: function (value) {
                this._knockout = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "quality", {
              get: function () {
                return this._quality;
              },
              set: function (value) {
                this._quality = Shumway.NumberUtilities.clamp(value | 0, 0, 15);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "strength", {
              get: function () {
                return this._strength;
              },
              set: function (value) {
                this._strength = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientBevelFilter.prototype, "type", {
              get: function () {
                return this._type;
              },
              set: function (value) {
                value = asCoerceString(value);
                if (value === null) {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "type");
                } else {
                  if (value === filters.BitmapFilterType.INNER || value === filters.BitmapFilterType.OUTER) {
                    this._type = value;
                  } else {
                    this._type = filters.BitmapFilterType.FULL;
                  }
                }
              },
              enumerable: true,
              configurable: true
            });

            GradientBevelFilter.prototype.clone = function () {
              return new GradientBevelFilter(this._distance, this._angle, this._colors, this._alphas, this._ratios, this._blurX, this._blurY, this._strength, this._quality, this._type, this._knockout);
            };
            GradientBevelFilter.classInitializer = null;

            GradientBevelFilter.initializer = null;

            GradientBevelFilter.classSymbols = null;

            GradientBevelFilter.instanceSymbols = null;
            return GradientBevelFilter;
          })(flash.filters.BitmapFilter);
          filters.GradientBevelFilter = GradientBevelFilter;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (filters) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var GradientGlowFilter = (function (_super) {
            __extends(GradientGlowFilter, _super);
            function GradientGlowFilter(distance, angle, colors, alphas, ratios, blurX, blurY, strength, quality, type, knockout) {
              if (typeof distance === "undefined") { distance = 4; }
              if (typeof angle === "undefined") { angle = 45; }
              if (typeof colors === "undefined") { colors = null; }
              if (typeof alphas === "undefined") { alphas = null; }
              if (typeof ratios === "undefined") { ratios = null; }
              if (typeof blurX === "undefined") { blurX = 4; }
              if (typeof blurY === "undefined") { blurY = 4; }
              if (typeof strength === "undefined") { strength = 1; }
              if (typeof quality === "undefined") { quality = 1; }
              if (typeof type === "undefined") { type = "inner"; }
              if (typeof knockout === "undefined") { knockout = false; }
              false && _super.call(this);
              this.distance = distance;
              this.angle = angle;
              filters.GradientArrays.sanitize(colors, alphas, ratios);
              this._colors = filters.GradientArrays.colors;
              this._alphas = filters.GradientArrays.alphas;
              this._ratios = filters.GradientArrays.ratios;
              this.blurX = blurX;
              this.blurY = blurY;
              this.strength = strength;
              this.quality = quality;
              this.type = type;
              this.knockout = knockout;
            }
            GradientGlowFilter.FromUntyped = function (obj) {
              var colors = [];
              var alphas = [];
              for (var i = 0; i < obj.colors.length; i++) {
                var color = obj.colors[i];
                colors.push(color >>> 8);
                alphas.push(color & 0xff) / 0xff;
              }

              var type = flash.filters.BitmapFilterType.OUTER;
              if (!!obj.onTop) {
                type = flash.filters.BitmapFilterType.FULL;
              } else if (!!obj.inner) {
                type = flash.filters.BitmapFilterType.INNER;
              }

              var angle = obj.angle * 180 / Math.PI;
              return new GradientGlowFilter(obj.distance, angle, colors, alphas, obj.ratios, obj.blurX, obj.blurY, obj.strength, obj.quality, type, obj.knockout);
            };

            GradientGlowFilter.prototype._updateFilterBounds = function (bounds) {
              if (this.type !== filters.BitmapFilterType.INNER) {
                filters.BitmapFilter._updateBlurBounds(bounds, this._blurX, this._blurY, this._quality);
                if (this._distance !== 0) {
                  var a = this._angle * Math.PI / 180;
                  bounds.x += Math.floor(Math.cos(a) * this._distance);
                  bounds.y += Math.floor(Math.sin(a) * this._distance);
                  if (bounds.left > 0) {
                    bounds.left = 0;
                  }
                  if (bounds.top > 0) {
                    bounds.top = 0;
                  }
                }
              }
            };

            Object.defineProperty(GradientGlowFilter.prototype, "distance", {
              get: function () {
                return this._distance;
              },
              set: function (value) {
                this._distance = +value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "angle", {
              get: function () {
                return this._angle;
              },
              set: function (value) {
                this._angle = +value % 360;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "colors", {
              get: function () {
                return this._colors.concat();
              },
              set: function (value) {
                if (!Shumway.isNullOrUndefined(value)) {
                  this._colors = filters.GradientArrays.sanitizeColors(value);
                  var len = this._colors.length;
                  this._alphas = filters.GradientArrays.sanitizeAlphas(this._alphas, len, len);
                  this._ratios = filters.GradientArrays.sanitizeRatios(this._ratios, len, len);
                } else {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "colors");
                }
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "alphas", {
              get: function () {
                return this._alphas.concat();
              },
              set: function (value) {
                if (!Shumway.isNullOrUndefined(value)) {
                  filters.GradientArrays.sanitize(this._colors, value, this._ratios);
                  this._colors = filters.GradientArrays.colors;
                  this._alphas = filters.GradientArrays.alphas;
                  this._ratios = filters.GradientArrays.ratios;
                } else {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "alphas");
                }
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "ratios", {
              get: function () {
                return this._ratios.concat();
              },
              set: function (value) {
                if (!Shumway.isNullOrUndefined(value)) {
                  filters.GradientArrays.sanitize(this._colors, this._alphas, value);
                  this._colors = filters.GradientArrays.colors;
                  this._alphas = filters.GradientArrays.alphas;
                  this._ratios = filters.GradientArrays.ratios;
                } else {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "ratios");
                }
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "blurX", {
              get: function () {
                return this._blurX;
              },
              set: function (value) {
                this._blurX = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "blurY", {
              get: function () {
                return this._blurY;
              },
              set: function (value) {
                this._blurY = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "knockout", {
              get: function () {
                return this._knockout;
              },
              set: function (value) {
                this._knockout = !!value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "quality", {
              get: function () {
                return this._quality;
              },
              set: function (value) {
                this._quality = Shumway.NumberUtilities.clamp(value | 0, 0, 15);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "strength", {
              get: function () {
                return this._strength;
              },
              set: function (value) {
                this._strength = Shumway.NumberUtilities.clamp(+value, 0, 255);
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(GradientGlowFilter.prototype, "type", {
              get: function () {
                return this._type;
              },
              set: function (value) {
                value = asCoerceString(value);
                if (value === null) {
                  AVM2.Runtime.throwError("TypeError", AVM2.Errors.NullPointerError, "type");
                } else {
                  if (value === filters.BitmapFilterType.INNER || value === filters.BitmapFilterType.OUTER) {
                    this._type = value;
                  } else {
                    this._type = filters.BitmapFilterType.FULL;
                  }
                }
              },
              enumerable: true,
              configurable: true
            });

            GradientGlowFilter.prototype.clone = function () {
              return new GradientGlowFilter(this._distance, this._angle, this._colors, this._alphas, this._ratios, this._blurX, this._blurY, this._strength, this._quality, this._type, this._knockout);
            };
            GradientGlowFilter.classInitializer = null;

            GradientGlowFilter.initializer = null;

            GradientGlowFilter.classSymbols = null;

            GradientGlowFilter.instanceSymbols = null;
            return GradientGlowFilter;
          })(flash.filters.BitmapFilter);
          filters.GradientGlowFilter = GradientGlowFilter;
        })(flash.filters || (flash.filters = {}));
        var filters = flash.filters;
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
      (function (flash) {
        (function (geom) {
          var toS16 = Shumway.IntegerUtilities.toS16;
          var clampS8U8 = Shumway.IntegerUtilities.clampS8U8;

          var ColorTransform = (function (_super) {
            __extends(ColorTransform, _super);
            function ColorTransform(redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
              if (typeof redMultiplier === "undefined") { redMultiplier = 1; }
              if (typeof greenMultiplier === "undefined") { greenMultiplier = 1; }
              if (typeof blueMultiplier === "undefined") { blueMultiplier = 1; }
              if (typeof alphaMultiplier === "undefined") { alphaMultiplier = 1; }
              if (typeof redOffset === "undefined") { redOffset = 0; }
              if (typeof greenOffset === "undefined") { greenOffset = 0; }
              if (typeof blueOffset === "undefined") { blueOffset = 0; }
              if (typeof alphaOffset === "undefined") { alphaOffset = 0; }
              false && _super.call(this);
              this.redMultiplier = +redMultiplier;
              this.greenMultiplier = +greenMultiplier;
              this.blueMultiplier = +blueMultiplier;
              this.alphaMultiplier = +alphaMultiplier;
              this.redOffset = +redOffset;
              this.greenOffset = +greenOffset;
              this.blueOffset = +blueOffset;
              this.alphaOffset = +alphaOffset;
            }
            ColorTransform.FromCXForm = function (cxform) {
              return new ColorTransform(cxform.redMultiplier / 256, cxform.greenMultiplier / 256, cxform.blueMultiplier / 256, cxform.alphaMultiplier / 256, cxform.redOffset, cxform.greenOffset, cxform.blueOffset, cxform.alphaOffset);
            };


            Object.defineProperty(ColorTransform.prototype, "native_redMultiplier", {
              get: function () {
                return this.redMultiplier;
              },
              set: function (redMultiplier) {
                this.redMultiplier = +redMultiplier;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(ColorTransform.prototype, "native_greenMultiplier", {
              get: function () {
                return this.greenMultiplier;
              },
              set: function (greenMultiplier) {
                this.greenMultiplier = +greenMultiplier;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(ColorTransform.prototype, "native_blueMultiplier", {
              get: function () {
                return this.blueMultiplier;
              },
              set: function (blueMultiplier) {
                this.blueMultiplier = +blueMultiplier;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(ColorTransform.prototype, "native_alphaMultiplier", {
              get: function () {
                return this.alphaMultiplier;
              },
              set: function (alphaMultiplier) {
                this.alphaMultiplier = +alphaMultiplier;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(ColorTransform.prototype, "native_redOffset", {
              get: function () {
                return this.redOffset;
              },
              set: function (redOffset) {
                this.redOffset = +redOffset;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(ColorTransform.prototype, "native_greenOffset", {
              get: function () {
                return this.greenOffset;
              },
              set: function (greenOffset) {
                this.greenOffset = +greenOffset;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(ColorTransform.prototype, "native_blueOffset", {
              get: function () {
                return this.blueOffset;
              },
              set: function (blueOffset) {
                this.blueOffset = +blueOffset;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(ColorTransform.prototype, "native_alphaOffset", {
              get: function () {
                return this.alphaOffset;
              },
              set: function (alphaOffset) {
                this.alphaOffset = +alphaOffset;
              },
              enumerable: true,
              configurable: true
            });

            ColorTransform.prototype.ColorTransform = function (redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
              if (typeof redMultiplier === "undefined") { redMultiplier = 1; }
              if (typeof greenMultiplier === "undefined") { greenMultiplier = 1; }
              if (typeof blueMultiplier === "undefined") { blueMultiplier = 1; }
              if (typeof alphaMultiplier === "undefined") { alphaMultiplier = 1; }
              if (typeof redOffset === "undefined") { redOffset = 0; }
              if (typeof greenOffset === "undefined") { greenOffset = 0; }
              if (typeof blueOffset === "undefined") { blueOffset = 0; }
              if (typeof alphaOffset === "undefined") { alphaOffset = 0; }
              this.redMultiplier = redMultiplier;
              this.greenMultiplier = greenMultiplier;
              this.blueMultiplier = blueMultiplier;
              this.alphaMultiplier = alphaMultiplier;
              this.redOffset = redOffset;
              this.greenOffset = greenOffset;
              this.blueOffset = blueOffset;
              this.alphaOffset = alphaOffset;
            };

            Object.defineProperty(ColorTransform.prototype, "color", {
              get: function () {
                return (this.redOffset << 16) | (this.greenOffset << 8) | this.blueOffset;
              },
              set: function (newColor) {
                this.redOffset = (newColor >> 16) & 0xff;
                this.greenOffset = (newColor >> 8) & 0xff;
                this.blueOffset = newColor & 0xff;
                this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 1;
              },
              enumerable: true,
              configurable: true
            });


            ColorTransform.prototype.concat = function (second) {
              this.redMultiplier *= second.redMultiplier;
              this.greenMultiplier *= second.greenMultiplier;
              this.blueMultiplier *= second.blueMultiplier;
              this.alphaMultiplier *= second.alphaMultiplier;
              this.redOffset += second.redOffset;
              this.greenOffset += second.greenOffset;
              this.blueOffset += second.blueOffset;
              this.alphaOffset += second.alphaOffset;
            };

            ColorTransform.prototype.preMultiply = function (second) {
              this.redOffset += second.redOffset * this.redMultiplier;
              this.greenOffset += second.greenOffset * this.greenMultiplier;
              this.blueOffset += second.blueOffset * this.blueMultiplier;
              this.alphaOffset += second.alphaOffset * this.alphaMultiplier;
              this.redMultiplier *= second.redMultiplier;
              this.greenMultiplier *= second.greenMultiplier;
              this.blueMultiplier *= second.blueMultiplier;
              this.alphaMultiplier *= second.alphaMultiplier;
            };

            ColorTransform.prototype.copyFrom = function (sourceColorTransform) {
              this.redMultiplier = sourceColorTransform.redMultiplier;
              this.greenMultiplier = sourceColorTransform.greenMultiplier;
              this.blueMultiplier = sourceColorTransform.blueMultiplier;
              this.alphaMultiplier = sourceColorTransform.alphaMultiplier;
              this.redOffset = sourceColorTransform.redOffset;
              this.greenOffset = sourceColorTransform.greenOffset;
              this.blueOffset = sourceColorTransform.blueOffset;
              this.alphaOffset = sourceColorTransform.alphaOffset;
            };

            ColorTransform.prototype.setTo = function (redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
              this.redMultiplier = redMultiplier;
              this.greenMultiplier = greenMultiplier;
              this.blueMultiplier = blueMultiplier;
              this.alphaMultiplier = alphaMultiplier;
              this.redOffset = redOffset;
              this.greenOffset = greenOffset;
              this.blueOffset = blueOffset;
              this.alphaOffset = alphaOffset;
            };

            ColorTransform.prototype.clone = function () {
              return new ColorTransform(this.redMultiplier, this.greenMultiplier, this.blueMultiplier, this.alphaMultiplier, this.redOffset, this.greenOffset, this.blueOffset, this.alphaOffset);
            };

            ColorTransform.prototype.convertToFixedPoint = function () {
              this.redMultiplier = clampS8U8(this.redMultiplier);
              this.greenMultiplier = clampS8U8(this.greenMultiplier);
              this.blueMultiplier = clampS8U8(this.blueMultiplier);
              this.alphaMultiplier = clampS8U8(this.alphaMultiplier);
              this.redOffset = toS16(this.redOffset);
              this.greenOffset = toS16(this.greenOffset);
              this.blueOffset = toS16(this.blueOffset);
              this.alphaOffset = toS16(this.alphaOffset);
              return this;
            };

            ColorTransform.prototype.toString = function () {
              return "(redMultiplier=" + this.redMultiplier + ", greenMultiplier=" + this.greenMultiplier + ", blueMultiplier=" + this.blueMultiplier + ", alphaMultiplier=" + this.alphaMultiplier + ", redOffset=" + this.redOffset + ", greenOffset=" + this.greenOffset + ", blueOffset=" + this.blueOffset + ", alphaOffset=" + this.alphaOffset + ")";
            };
            ColorTransform.classInitializer = null;

            ColorTransform.initializer = null;

            ColorTransform.classSymbols = null;

            ColorTransform.instanceSymbols = null;
            return ColorTransform;
          })(AS.ASNative);
          geom.ColorTransform = ColorTransform;
        })(flash.geom || (flash.geom = {}));
        var geom = flash.geom;
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
      (function (flash) {
        (function (media) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var Camera = (function (_super) {
            __extends(Camera, _super);
            function Camera() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.media.Camera");
            }
            Object.defineProperty(Camera.prototype, "names", {
              get: function () {
                notImplemented("public flash.media.Camera::get names");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "isSupported", {
              get: function () {
                notImplemented("public flash.media.Camera::get isSupported");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Camera.getCamera = function (name) {
              if (typeof name === "undefined") { name = null; }
              name = asCoerceString(name);
              notImplemented("public flash.media.Camera::static getCamera");
              return;
            };
            Camera._scanHardware = function () {
              notImplemented("public flash.media.Camera::static _scanHardware");
              return;
            };

            Object.defineProperty(Camera.prototype, "activityLevel", {
              get: function () {
                notImplemented("public flash.media.Camera::get activityLevel");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "bandwidth", {
              get: function () {
                notImplemented("public flash.media.Camera::get bandwidth");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "currentFPS", {
              get: function () {
                notImplemented("public flash.media.Camera::get currentFPS");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "fps", {
              get: function () {
                notImplemented("public flash.media.Camera::get fps");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "height", {
              get: function () {
                notImplemented("public flash.media.Camera::get height");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "index", {
              get: function () {
                notImplemented("public flash.media.Camera::get index");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "keyFrameInterval", {
              get: function () {
                notImplemented("public flash.media.Camera::get keyFrameInterval");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "loopback", {
              get: function () {
                notImplemented("public flash.media.Camera::get loopback");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "motionLevel", {
              get: function () {
                notImplemented("public flash.media.Camera::get motionLevel");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "motionTimeout", {
              get: function () {
                notImplemented("public flash.media.Camera::get motionTimeout");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "muted", {
              get: function () {
                notImplemented("public flash.media.Camera::get muted");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "name", {
              get: function () {
                notImplemented("public flash.media.Camera::get name");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "position", {
              get: function () {
                notImplemented("public flash.media.Camera::get position");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "quality", {
              get: function () {
                notImplemented("public flash.media.Camera::get quality");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Camera.prototype, "width", {
              get: function () {
                notImplemented("public flash.media.Camera::get width");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Camera.prototype.setCursor = function (value) {
              value = !!value;
              notImplemented("public flash.media.Camera::setCursor");
              return;
            };
            Camera.prototype.setKeyFrameInterval = function (keyFrameInterval) {
              keyFrameInterval = keyFrameInterval | 0;
              notImplemented("public flash.media.Camera::setKeyFrameInterval");
              return;
            };
            Camera.prototype.setLoopback = function (compress) {
              if (typeof compress === "undefined") { compress = false; }
              compress = !!compress;
              notImplemented("public flash.media.Camera::setLoopback");
              return;
            };
            Camera.prototype.setMode = function (width, height, fps, favorArea) {
              if (typeof favorArea === "undefined") { favorArea = true; }
              width = width | 0;
              height = height | 0;
              fps = +fps;
              favorArea = !!favorArea;
              notImplemented("public flash.media.Camera::setMode");
              return;
            };
            Camera.prototype.setMotionLevel = function (motionLevel, timeout) {
              if (typeof timeout === "undefined") { timeout = 2000; }
              motionLevel = motionLevel | 0;
              timeout = timeout | 0;
              notImplemented("public flash.media.Camera::setMotionLevel");
              return;
            };
            Camera.prototype.setQuality = function (bandwidth, quality) {
              bandwidth = bandwidth | 0;
              quality = quality | 0;
              notImplemented("public flash.media.Camera::setQuality");
              return;
            };
            Camera.prototype.drawToBitmapData = function (destination) {
              destination = destination;
              notImplemented("public flash.media.Camera::drawToBitmapData");
              return;
            };
            Camera.prototype.copyToByteArray = function (rect, destination) {
              rect = rect;
              destination = destination;
              notImplemented("public flash.media.Camera::copyToByteArray");
              return;
            };
            Camera.prototype.copyToVector = function (rect, destination) {
              rect = rect;
              destination = destination;
              notImplemented("public flash.media.Camera::copyToVector");
              return;
            };
            Camera.classInitializer = null;

            Camera.initializer = null;

            Camera.classSymbols = null;

            Camera.instanceSymbols = null;
            return Camera;
          })(flash.events.EventDispatcher);
          media.Camera = Camera;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (media) {
          var notImplemented = Shumway.Debug.notImplemented;

          var ID3Info = (function (_super) {
            __extends(ID3Info, _super);
            function ID3Info() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.media.ID3Info");
            }
            ID3Info.classInitializer = null;

            ID3Info.initializer = null;

            ID3Info.classSymbols = null;

            ID3Info.instanceSymbols = ["songName", "artist", "album", "year", "comment", "genre", "track"];
            return ID3Info;
          })(AS.ASNative);
          media.ID3Info = ID3Info;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (media) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var Microphone = (function (_super) {
            __extends(Microphone, _super);
            function Microphone() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.media.Microphone");
            }
            Object.defineProperty(Microphone.prototype, "names", {
              get: function () {
                notImplemented("public flash.media.Microphone::get names");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "isSupported", {
              get: function () {
                notImplemented("public flash.media.Microphone::get isSupported");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Microphone.getMicrophone = function (index) {
              if (typeof index === "undefined") { index = -1; }
              index = index | 0;
              notImplemented("public flash.media.Microphone::static getMicrophone");
              return;
            };
            Microphone.getEnhancedMicrophone = function (index) {
              if (typeof index === "undefined") { index = -1; }
              index = index | 0;
              notImplemented("public flash.media.Microphone::static getEnhancedMicrophone");
              return;
            };

            Object.defineProperty(Microphone.prototype, "rate", {
              get: function () {
                notImplemented("public flash.media.Microphone::get rate");
                return;
              },
              set: function (rate) {
                rate = rate | 0;
                notImplemented("public flash.media.Microphone::set rate");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "codec", {
              get: function () {
                notImplemented("public flash.media.Microphone::get codec");
                return;
              },
              set: function (codec) {
                codec = asCoerceString(codec);
                notImplemented("public flash.media.Microphone::set codec");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "framesPerPacket", {
              get: function () {
                notImplemented("public flash.media.Microphone::get framesPerPacket");
                return;
              },
              set: function (frames) {
                frames = frames | 0;
                notImplemented("public flash.media.Microphone::set framesPerPacket");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "encodeQuality", {
              get: function () {
                notImplemented("public flash.media.Microphone::get encodeQuality");
                return;
              },
              set: function (quality) {
                quality = quality | 0;
                notImplemented("public flash.media.Microphone::set encodeQuality");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "noiseSuppressionLevel", {
              get: function () {
                notImplemented("public flash.media.Microphone::get noiseSuppressionLevel");
                return;
              },
              set: function (level) {
                level = level | 0;
                notImplemented("public flash.media.Microphone::set noiseSuppressionLevel");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "enableVAD", {
              get: function () {
                notImplemented("public flash.media.Microphone::get enableVAD");
                return;
              },
              set: function (enable) {
                enable = !!enable;
                notImplemented("public flash.media.Microphone::set enableVAD");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "activityLevel", {
              get: function () {
                notImplemented("public flash.media.Microphone::get activityLevel");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "gain", {
              get: function () {
                notImplemented("public flash.media.Microphone::get gain");
                return;
              },
              set: function (gain) {
                gain = +gain;
                notImplemented("public flash.media.Microphone::set gain");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "index", {
              get: function () {
                notImplemented("public flash.media.Microphone::get index");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "muted", {
              get: function () {
                notImplemented("public flash.media.Microphone::get muted");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "name", {
              get: function () {
                notImplemented("public flash.media.Microphone::get name");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "silenceLevel", {
              get: function () {
                notImplemented("public flash.media.Microphone::get silenceLevel");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "silenceTimeout", {
              get: function () {
                notImplemented("public flash.media.Microphone::get silenceTimeout");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "useEchoSuppression", {
              get: function () {
                notImplemented("public flash.media.Microphone::get useEchoSuppression");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Microphone.prototype, "soundTransform", {
              get: function () {
                notImplemented("public flash.media.Microphone::get soundTransform");
                return;
              },
              set: function (sndTransform) {
                sndTransform = sndTransform;
                notImplemented("public flash.media.Microphone::set soundTransform");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Microphone.prototype.setSilenceLevel = function (silenceLevel, timeout) {
              if (typeof timeout === "undefined") { timeout = -1; }
              silenceLevel = +silenceLevel;
              timeout = timeout | 0;
              notImplemented("public flash.media.Microphone::setSilenceLevel");
              return;
            };
            Microphone.prototype.setUseEchoSuppression = function (useEchoSuppression) {
              useEchoSuppression = !!useEchoSuppression;
              notImplemented("public flash.media.Microphone::setUseEchoSuppression");
              return;
            };
            Microphone.prototype.setLoopBack = function (state) {
              if (typeof state === "undefined") { state = true; }
              state = !!state;
              notImplemented("public flash.media.Microphone::setLoopBack");
              return;
            };
            Microphone.classInitializer = null;

            Microphone.initializer = null;

            Microphone.classSymbols = null;

            Microphone.instanceSymbols = null;
            return Microphone;
          })(flash.events.EventDispatcher);
          media.Microphone = Microphone;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (media) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var Telemetry = Shumway.Telemetry;
          var Multiname = Shumway.AVM2.ABC.Multiname;

          var PLAY_USING_AUDIO_TAG = true;

          function getAudioDescription(soundData, onComplete) {
            var audioElement = document.createElement('audio');
            if (!audioElement.canPlayType(soundData.mimeType)) {
              onComplete({
                duration: 0
              });
              return;
            }
            audioElement.preload = 'metadata';
            var blob = new Blob([soundData.data], { type: soundData.mimeType });
            audioElement.src = URL.createObjectURL(blob);
            audioElement.load();
            audioElement.addEventListener("loadedmetadata", function () {
              onComplete({
                duration: this.duration * 1000
              });
            });
          }

          var SoundData = (function () {
            function SoundData() {
            }
            return SoundData;
          })();

          var Sound = (function (_super) {
            __extends(Sound, _super);
            function Sound(stream, context) {
              if (typeof stream === "undefined") { stream = null; }
              if (typeof context === "undefined") { context = null; }
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.media.Sound");
            }
            Object.defineProperty(Sound.prototype, "url", {
              get: function () {
                return this._url;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Sound.prototype, "isURLInaccessible", {
              get: function () {
                notImplemented("public flash.media.Sound::get isURLInaccessible");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Sound.prototype, "length", {
              get: function () {
                return this._length;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Sound.prototype, "isBuffering", {
              get: function () {
                notImplemented("public flash.media.Sound::get isBuffering");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Sound.prototype, "bytesLoaded", {
              get: function () {
                return this._bytesLoaded;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Sound.prototype, "bytesTotal", {
              get: function () {
                return this._bytesTotal;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Sound.prototype, "id3", {
              get: function () {
                return this._id3;
              },
              enumerable: true,
              configurable: true
            });
            Sound.prototype.loadCompressedDataFromByteArray = function (bytes, bytesLength) {
              bytes = bytes;
              bytesLength = bytesLength >>> 0;
              notImplemented("public flash.media.Sound::loadCompressedDataFromByteArray");
              return;
            };
            Sound.prototype.loadPCMFromByteArray = function (bytes, samples, format, stereo, sampleRate) {
              if (typeof format === "undefined") { format = "float"; }
              if (typeof stereo === "undefined") { stereo = true; }
              if (typeof sampleRate === "undefined") { sampleRate = 44100; }
              bytes = bytes;
              samples = samples >>> 0;
              format = asCoerceString(format);
              stereo = !!stereo;
              sampleRate = +sampleRate;
              notImplemented("public flash.media.Sound::loadPCMFromByteArray");
              return;
            };
            Sound.prototype.play = function (startTime, loops, sndTransform) {
              if (typeof startTime === "undefined") { startTime = 0; }
              if (typeof loops === "undefined") { loops = 0; }
              if (typeof sndTransform === "undefined") { sndTransform = null; }
              startTime = +startTime;
              loops = loops | 0;
              var channel = new flash.media.SoundChannel();
              channel._sound = this;
              channel._soundTransform = Shumway.isNullOrUndefined(sndTransform) ? new flash.media.SoundTransform() : sndTransform;
              this._playQueue.push({
                channel: channel,
                startTime: startTime
              });
              if (this._soundData) {
                if (PLAY_USING_AUDIO_TAG) {
                  channel._playSoundDataViaAudio(this._soundData, startTime, loops);
                } else {
                  channel._playSoundDataViaChannel(this._soundData, startTime, loops);
                }
              }
              return channel;
            };
            Sound.prototype.close = function () {
              somewhatImplemented("public flash.media.Sound::close");
            };
            Sound.prototype.extract = function (target, length, startPosition) {
              if (typeof startPosition === "undefined") { startPosition = -1; }
              target = target;
              length = +length;
              startPosition = +startPosition;
              notImplemented("public flash.media.Sound::extract");
              return;
            };
            Sound.prototype._load = function (request, checkPolicyFile, bufferTime) {
              checkPolicyFile = !!checkPolicyFile;
              bufferTime = +bufferTime;
              if (!request) {
                return;
              }

              var _this = this;
              var stream = this._stream = new flash.net.URLStream();
              var data = new flash.utils.ByteArray();
              var dataPosition = 0;
              var mp3DecodingSession = null;
              var soundData = new SoundData();
              soundData.completed = false;

              stream.addEventListener("progress", function (event) {
                _this._bytesLoaded = event[Multiname.getPublicQualifiedName("bytesLoaded")];
                _this._bytesTotal = event[Multiname.getPublicQualifiedName("bytesTotal")];

                if (!PLAY_USING_AUDIO_TAG && !mp3DecodingSession) {
                  mp3DecodingSession = decodeMP3(soundData, function (duration, final) {
                    if (_this._length === 0) {
                      _this._soundData = soundData;

                      _this._playQueue.forEach(function (item) {
                        item.channel._playSoundDataViaChannel(soundData, item.startTime);
                      });
                    }

                    _this._length = final ? duration * 1000 : Math.max(duration, mp3DecodingSession.estimateDuration(_this._bytesTotal)) * 1000;
                  });
                }

                var bytesAvailable = stream.bytesAvailable;
                stream.readBytes(data, dataPosition, bytesAvailable);
                if (mp3DecodingSession) {
                  mp3DecodingSession.pushData(new Uint8Array(data._buffer, dataPosition, bytesAvailable));
                }
                dataPosition += bytesAvailable;

                _this.dispatchEvent(event);
              });

              stream.addEventListener("complete", function (event) {
                _this.dispatchEvent(event);
                soundData.data = data._buffer;
                soundData.mimeType = 'audio/mpeg';
                soundData.completed = true;

                if (PLAY_USING_AUDIO_TAG) {
                  _this._soundData = soundData;

                  getAudioDescription(soundData, function (description) {
                    _this._length = description.duration;
                  });

                  _this._playQueue.forEach(function (item) {
                    item.channel._playSoundDataViaAudio(soundData, item.startTime);
                  });
                }

                if (mp3DecodingSession) {
                  mp3DecodingSession.close();
                }
              });

              stream.load(request);
            };
            Sound.classInitializer = null;

            Sound.initializer = function (symbol) {
              this._playQueue = [];
              this._url = null;
              this._length = 0;
              this._bytesTotal = 0;
              this._bytesLoaded = 0;
              this._id3 = new flash.media.ID3Info();

              Telemetry.instance.reportTelemetry({ topic: 'feature', feature: 5 /* SOUND_FEATURE */ });

              if (symbol) {
                var soundData = new SoundData();
                if (symbol.pcm) {
                  soundData.sampleRate = symbol.sampleRate;
                  soundData.channels = symbol.channels;
                  soundData.pcm = symbol.pcm;
                  soundData.end = symbol.pcm.length;
                }
                soundData.completed = true;
                if (symbol.packaged) {
                  soundData.data = symbol.packaged.data.buffer;
                  soundData.mimeType = symbol.packaged.mimeType;
                }
                var self = this;
                getAudioDescription(soundData, function (description) {
                  self._length = description.duration;
                });
                this._soundData = soundData;
              }
            };

            Sound.classSymbols = null;

            Sound.instanceSymbols = null;
            return Sound;
          })(flash.events.EventDispatcher);
          media.Sound = Sound;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (media) {
          var assert = Shumway.Debug.assert;
          var notImplemented = Shumway.Debug.notImplemented;

          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var error = Shumway.Debug.error;

          function createAudioChannel(sampleRate, channels) {
            if (WebAudioChannel.isSupported) {
              return new WebAudioChannel(sampleRate, channels);
            } else {
              error('PCM data playback is not supported by the browser');
            }
          }

          
          var AudioResampler = (function () {
            function AudioResampler(sourceRate, targetRate) {
              this._sourceRate = sourceRate;
              this._targetRate = targetRate;
              this._tail = [];
              this._sourceOffset = 0;
            }
            AudioResampler.prototype.getData = function (channelsData, count) {
              var k = this._sourceRate / this._targetRate;

              var offset = this._sourceOffset;
              var needed = Math.ceil((count - 1) * k + offset) + 1;
              var sourceData = [];
              for (var channel = 0; channel < channelsData.length; channel++) {
                sourceData.push(new Float32Array(needed));
              }
              var e = { data: sourceData, count: needed };
              this.ondatarequested(e);
              for (var channel = 0; channel < channelsData.length; channel++) {
                var data = channelsData[channel];
                var source = sourceData[channel];
                for (var j = 0; j < count; j++) {
                  var i = j * k + offset;
                  var i1 = i | 0, i2 = Math.ceil(i) | 0;
                  var source_i1 = i1 < 0 ? this._tail[channel] : source[i1];
                  if (i1 === i2) {
                    data[j] = source_i1;
                  } else {
                    var alpha = i - i1;
                    data[j] = source_i1 * (1 - alpha) + source[i2] * alpha;
                  }
                }
                this._tail[channel] = source[needed - 1];
              }
              this._sourceOffset = ((count - 1) * k + offset) - (needed - 1);
            };
            return AudioResampler;
          })();

          var WebAudioChannel = (function () {
            function WebAudioChannel(sampleRate, channels) {
              var context = WebAudioChannel._cachedContext;
              if (!context) {
                context = new AudioContext();
                WebAudioChannel._cachedContext = context;
              }
              this._context = context;
              this._contextSampleRate = context.sampleRate || 44100;

              this._channels = channels;
              this._sampleRate = sampleRate;
              if (this._contextSampleRate !== sampleRate) {
                this._resampler = new AudioResampler(sampleRate, this._contextSampleRate);
                this._resampler.ondatarequested = function (e) {
                  this.requestData(e.data, e.count);
                }.bind(this);
              }
            }
            WebAudioChannel.prototype.start = function () {
              var source = this._context.createScriptProcessor(2048, 0, this._channels);
              var self = this;
              source.onaudioprocess = function (e) {
                var channelsData = [];
                for (var i = 0; i < self._channels; i++) {
                  channelsData.push(e.outputBuffer.getChannelData(i));
                }
                var count = channelsData[0].length;
                if (self._resampler) {
                  self._resampler.getData(channelsData, count);
                } else {
                  self.requestData(channelsData, count);
                }
              };

              source.connect(this._context.destination);
              this._source = source;
            };
            WebAudioChannel.prototype.stop = function () {
              this._source.disconnect(this._context.destination);
            };
            WebAudioChannel.prototype.requestData = function (channelsData, count) {
              var channels = this._channels;
              var buffer = new Float32Array(count * channels);
              var e = { data: buffer, count: buffer.length };
              this.ondatarequested(e);

              for (var j = 0, p = 0; j < count; j++) {
                for (var i = 0; i < channels; i++) {
                  channelsData[i][j] = buffer[p++];
                }
              }
            };
            WebAudioChannel.isSupported = function () {
              return typeof AudioContext !== 'undefined';
            };
            return WebAudioChannel;
          })();

          var SoundChannel = (function (_super) {
            __extends(SoundChannel, _super);
            function SoundChannel() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.media.SoundChannel");
            }
            Object.defineProperty(SoundChannel.prototype, "position", {
              get: function () {
                return this._position;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundChannel.prototype, "soundTransform", {
              get: function () {
                return this._soundTransform;
              },
              set: function (sndTransform) {
                somewhatImplemented("public flash.media.SoundChannel::set soundTransform");
                this._soundTransform = Shumway.isNullOrUndefined(sndTransform) ? new flash.media.SoundTransform() : sndTransform;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundChannel.prototype, "leftPeak", {
              get: function () {
                return this._leftPeak;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundChannel.prototype, "rightPeak", {
              get: function () {
                return this._rightPeak;
              },
              enumerable: true,
              configurable: true
            });
            SoundChannel.prototype.stop = function () {
              if (this._element) {
                this._unregisterWithSoundMixer();
                this._element.pause();
              }
              if (this._audioChannel) {
                this._unregisterWithSoundMixer();
                this._audioChannel.stop();
              }
            };
            SoundChannel.prototype._playSoundDataViaAudio = function (soundData, startTime, loops) {
              if (!soundData.mimeType) {
                return;
              }

              this._registerWithSoundMixer();
              this._position = startTime;
              var self = this;
              var lastCurrentTime = 0;
              var element = document.createElement('audio');
              if (!element.canPlayType(soundData.mimeType)) {
                console.error('ERROR: \"' + soundData.mimeType + '\" ' + 'type playback is not supported by the browser');
                return;
              }
              element.preload = 'metadata';
              element.loop = loops > 0;
              var blob = new Blob([soundData.data], { type: soundData.mimeType });
              element.src = URL.createObjectURL(blob);
              element.addEventListener("loadeddata", function loaded() {
                element.currentTime = startTime / 1000;
                element.play();
              });
              element.addEventListener("timeupdate", function timeupdate() {
                var currentTime = element.currentTime;
                if (loops && lastCurrentTime > currentTime) {
                  --loops;
                  if (!loops) {
                    element.loop = false;
                  }
                  if (currentTime < startTime / 1000) {
                    element.currentTime = startTime / 1000;
                  }
                }
                self._position = (lastCurrentTime = currentTime) * 1000;
              });
              element.addEventListener("ended", function ended() {
                self._unregisterWithSoundMixer();
                self.dispatchEvent(new flash.events.Event("soundComplete", false, false));
                self._element = null;
              });
              this._element = element;
              this._applySoundTransform();
            };
            SoundChannel.prototype._playSoundDataViaChannel = function (soundData, startTime, loops) {
              release || assert(soundData.pcm, 'no pcm data found');

              this._registerWithSoundMixer();
              var self = this;
              var startPosition = Math.round(startTime / 1000 * soundData.sampleRate) * soundData.channels;
              var position = startPosition;
              this._position = startTime;
              this._audioChannel = createAudioChannel(soundData.sampleRate, soundData.channels);
              this._audioChannel.ondatarequested = function (e) {
                var end = soundData.end;
                if (position >= end && soundData.completed) {
                  self._unregisterWithSoundMixer();
                  self._audioChannel.stop();
                  self.dispatchEvent(new flash.events.Event("soundComplete", false, false));
                  return;
                }

                var left = e.count;
                var data = e.data;
                var source = soundData.pcm;
                do {
                  var count = Math.min(end - position, left);
                  for (var j = 0; j < count; j++) {
                    data[j] = source[position++];
                  }
                  left -= count;
                  if (position >= end) {
                    if (!loops) {
                      break;
                    }
                    loops--;
                    position = startPosition;
                  }
                } while(left > 0);

                self._position = position / soundData.sampleRate / soundData.channels * 1000;
              };
              this._audioChannel.start();
              this._applySoundTransform();
            };
            SoundChannel.prototype._applySoundTransform = function () {
              var volume = this._soundTransform.volume;
              if (media.SoundMixer._soundTransform) {
                volume *= media.SoundMixer._soundTransform.volume;
              }
              volume *= media.SoundMixer._getMasterVolume();
              if (this._element) {
                this._element.volume = volume <= 0 ? 0 : volume >= 1.0 ? 1.0 : volume;
              }
              if (this._audioChannel) {
              }
            };
            SoundChannel.prototype._registerWithSoundMixer = function () {
              media.SoundMixer._registerChannel(this);
            };
            SoundChannel.prototype._unregisterWithSoundMixer = function () {
              media.SoundMixer._unregisterChannel(this);
            };
            SoundChannel.classInitializer = null;

            SoundChannel.initializer = function (symbol) {
              this._element = null;
              this._position = 0;
              this._leftPeak = 0;
              this._rightPeak = 0;
              this._pcmData = null;
              this._soundTransform = new flash.media.SoundTransform();
            };

            SoundChannel.classSymbols = null;

            SoundChannel.instanceSymbols = null;
            return SoundChannel;
          })(flash.events.EventDispatcher);
          media.SoundChannel = SoundChannel;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (media) {
          var notImplemented = Shumway.Debug.notImplemented;

          var SoundLoaderContext = (function (_super) {
            __extends(SoundLoaderContext, _super);
            function SoundLoaderContext(bufferTime, checkPolicyFile) {
              if (typeof bufferTime === "undefined") { bufferTime = 1000; }
              if (typeof checkPolicyFile === "undefined") { checkPolicyFile = false; }
              bufferTime = +bufferTime;
              checkPolicyFile = !!checkPolicyFile;
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.media.SoundLoaderContext");
            }
            SoundLoaderContext.classInitializer = null;

            SoundLoaderContext.initializer = null;

            SoundLoaderContext.classSymbols = null;

            SoundLoaderContext.instanceSymbols = null;
            return SoundLoaderContext;
          })(AS.ASNative);
          media.SoundLoaderContext = SoundLoaderContext;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (media) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;

          var SoundMixer = (function (_super) {
            __extends(SoundMixer, _super);
            function SoundMixer() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.media.SoundMixer");
            }
            Object.defineProperty(SoundMixer, "bufferTime", {
              get: function () {
                notImplemented("public flash.media.SoundMixer::get bufferTime");
                return;
              },
              set: function (bufferTime) {
                bufferTime = bufferTime | 0;
                notImplemented("public flash.media.SoundMixer::set bufferTime");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundMixer, "soundTransform", {
              get: function () {
                somewhatImplemented("public flash.media.SoundMixer::get soundTransform");
                return Shumway.isNullOrUndefined(SoundMixer._soundTransform) ? new flash.media.SoundTransform() : new flash.media.SoundTransform(SoundMixer._soundTransform.volume, SoundMixer._soundTransform.pan);
              },
              set: function (sndTransform) {
                somewhatImplemented("public flash.media.SoundMixer::set soundTransform");
                SoundMixer._soundTransform = Shumway.isNullOrUndefined(sndTransform) ? new flash.media.SoundTransform() : sndTransform;
                SoundMixer._registeredChannels.forEach(function (channel) {
                  channel._applySoundTransform();
                });
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundMixer, "audioPlaybackMode", {
              get: function () {
                notImplemented("public flash.media.SoundMixer::get audioPlaybackMode");
                return;
              },
              set: function (value) {
                value = asCoerceString(value);
                notImplemented("public flash.media.SoundMixer::set audioPlaybackMode");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundMixer, "useSpeakerphoneForVoice", {
              get: function () {
                notImplemented("public flash.media.SoundMixer::get useSpeakerphoneForVoice");
                return;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.media.SoundMixer::set useSpeakerphoneForVoice");
                return;
              },
              enumerable: true,
              configurable: true
            });
            SoundMixer.stopAll = function () {
              SoundMixer._registeredChannels.forEach(function (channel) {
                channel.stop();
              });
              SoundMixer._registeredChannels = [];
            };
            SoundMixer.computeSpectrum = function (outputArray, FFTMode, stretchFactor) {
              if (typeof FFTMode === "undefined") { FFTMode = false; }
              if (typeof stretchFactor === "undefined") { stretchFactor = 0; }
              FFTMode = !!FFTMode;
              stretchFactor = stretchFactor | 0;
              somewhatImplemented("public flash.media.SoundMixer::static computeSpectrum");
              var data = new Float32Array(1024);
              for (var i = 0; i < 1024; i++) {
                data[i] = Math.random();
              }
              outputArray.writeRawBytes(data);
              outputArray.position = 0;
            };
            SoundMixer.areSoundsInaccessible = function () {
              notImplemented("public flash.media.SoundMixer::static areSoundsInaccessible");
              return;
            };
            SoundMixer._getMasterVolume = function () {
              return SoundMixer._masterVolume;
            };
            SoundMixer._setMasterVolume = function (volume) {
              volume = +volume;
              SoundMixer._masterVolume = volume;
              SoundMixer._registeredChannels.forEach(function (channel) {
                channel._applySoundTransform();
              });
            };
            SoundMixer._registerChannel = function (channel) {
              SoundMixer._registeredChannels.push(channel);
            };
            SoundMixer._unregisterChannel = function (channel) {
              var index = SoundMixer._registeredChannels.indexOf(channel);
              if (index >= 0) {
                SoundMixer._registeredChannels.splice(index, 1);
              }
            };
            SoundMixer.classInitializer = null;

            SoundMixer.initializer = null;

            SoundMixer.classSymbols = null;

            SoundMixer.instanceSymbols = null;

            SoundMixer._masterVolume = 1;
            SoundMixer._registeredChannels = [];
            return SoundMixer;
          })(AS.ASNative);
          media.SoundMixer = SoundMixer;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (media) {
          var notImplemented = Shumway.Debug.notImplemented;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var SoundTransform = (function (_super) {
            __extends(SoundTransform, _super);
            function SoundTransform(vol, panning) {
              if (typeof vol === "undefined") { vol = 1; }
              if (typeof panning === "undefined") { panning = 0; }
              vol = +vol;
              panning = +panning;
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.media.SoundTransform");
            }
            Object.defineProperty(SoundTransform.prototype, "volume", {
              get: function () {
                return this._volume;
              },
              set: function (volume) {
                volume = +volume;
                this._volume = volume;
                this._updateTransform();
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundTransform.prototype, "leftToLeft", {
              get: function () {
                return this._leftToLeft;
              },
              set: function (leftToLeft) {
                leftToLeft = +leftToLeft;
                this._leftToLeft = leftToLeft;
                this._updateTransform();
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundTransform.prototype, "leftToRight", {
              get: function () {
                return this._leftToRight;
              },
              set: function (leftToRight) {
                leftToRight = +leftToRight;
                this._leftToRight = leftToRight;
                this._updateTransform();
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundTransform.prototype, "rightToRight", {
              get: function () {
                return this._rightToRight;
              },
              set: function (rightToRight) {
                rightToRight = +rightToRight;
                this._rightToRight = rightToRight;
                this._updateTransform();
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundTransform.prototype, "rightToLeft", {
              get: function () {
                return this._rightToLeft;
              },
              set: function (rightToLeft) {
                rightToLeft = +rightToLeft;
                this._rightToLeft = rightToLeft;
                this._updateTransform();
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SoundTransform.prototype, "pan", {
              get: function () {
                if (this._leftToRight === 0 && this._rightToLeft === 0) {
                  return 1 - this._leftToLeft * this._leftToLeft;
                }
                return 0;
              },
              set: function (panning) {
                this.leftToLeft = Math.sqrt(1 - panning);
                this.leftToRight = 0;
                this.rightToRight = Math.sqrt(1 + panning);
                this.rightToLeft = 0;
              },
              enumerable: true,
              configurable: true
            });

            SoundTransform.prototype._updateTransform = function () {
              somewhatImplemented("public flash.media.SoundTransform::_updateTransform");
            };
            SoundTransform.classInitializer = null;

            SoundTransform.initializer = null;

            SoundTransform.classSymbols = null;

            SoundTransform.instanceSymbols = null;
            return SoundTransform;
          })(AS.ASNative);
          media.SoundTransform = SoundTransform;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (media) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Video = (function (_super) {
            __extends(Video, _super);
            function Video(width, height) {
              if (typeof width === "undefined") { width = 320; }
              if (typeof height === "undefined") { height = 240; }
              false && _super.call(this);
              flash.display.DisplayObject.instanceConstructorNoInitialize.call(this);
              this._width = width | 0;
              this._height = height | 0;
            }
            Object.defineProperty(Video.prototype, "deblocking", {
              get: function () {
                return this._deblocking;
              },
              set: function (value) {
                this._deblocking = value | 0;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Video.prototype, "smoothing", {
              get: function () {
                return this._smoothing;
              },
              set: function (value) {
                this._smoothing = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(Video.prototype, "videoWidth", {
              get: function () {
                return this._videoWidth;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Video.prototype, "videoHeight", {
              get: function () {
                return this._videoHeight;
              },
              enumerable: true,
              configurable: true
            });

            Video.prototype.clear = function () {
              notImplemented("public flash.media.Video::clear");
              return;
            };

            Video.prototype.attachNetStream = function (netStream) {
              if (this._netStream === netStream) {
                return;
              }
              if (this._netStream) {
                netStream._videoReferrer = null;
              }
              this._netStream = netStream;
              if (this._netStream) {
                netStream._videoReferrer = this;
              }
              this._setDirtyFlags(33554432 /* DirtyNetStream */);
            };

            Video.prototype.attachCamera = function (camera) {
              notImplemented("public flash.media.Video::attachCamera");
              return;
            };
            Video.classInitializer = null;
            Video.initializer = null;
            Video.classSymbols = null;
            Video.instanceSymbols = null;
            return Video;
          })(flash.display.DisplayObject);
          media.Video = Video;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (media) {
          var notImplemented = Shumway.Debug.notImplemented;

          var VideoStreamSettings = (function (_super) {
            __extends(VideoStreamSettings, _super);
            function VideoStreamSettings() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.media.VideoStreamSettings");
            }
            VideoStreamSettings.classInitializer = null;

            VideoStreamSettings.initializer = null;

            VideoStreamSettings.classSymbols = null;

            VideoStreamSettings.instanceSymbols = null;
            return VideoStreamSettings;
          })(AS.ASNative);
          media.VideoStreamSettings = VideoStreamSettings;
        })(flash.media || (flash.media = {}));
        var media = flash.media;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var FileFilter = (function (_super) {
            __extends(FileFilter, _super);
            function FileFilter(description, extension, macType) {
              if (typeof macType === "undefined") { macType = null; }
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.net.FileFilter");
            }
            Object.defineProperty(FileFilter.prototype, "description", {
              get: function () {
                return this._description;
              },
              set: function (value) {
                this._description = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(FileFilter.prototype, "extension", {
              get: function () {
                return this._extension;
              },
              set: function (value) {
                this._extension = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(FileFilter.prototype, "macType", {
              get: function () {
                return this._macType;
              },
              set: function (value) {
                this._macType = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });
            FileFilter.classInitializer = null;

            FileFilter.initializer = null;

            FileFilter.classSymbols = null;

            FileFilter.instanceSymbols = null;
            return FileFilter;
          })(AS.ASNative);
          net.FileFilter = FileFilter;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var FileLoadingService = Shumway.FileLoadingService;

          var LocalConnection = (function (_super) {
            __extends(LocalConnection, _super);
            function LocalConnection() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.net.LocalConnection");
            }
            LocalConnection.prototype.close = function () {
              notImplemented("public flash.net.LocalConnection::close");
              return;
            };
            LocalConnection.prototype.connect = function (connectionName) {
              connectionName = asCoerceString(connectionName);
              notImplemented("public flash.net.LocalConnection::connect");
              return;
            };
            Object.defineProperty(LocalConnection.prototype, "domain", {
              get: function () {
                somewhatImplemented("public flash.net.LocalConnection::get domain");

                var url = FileLoadingService.instance.resolveUrl('/');
                var m = /:\/\/(.+?)[:?#\/]/.exec(url);
                return m && m[1];
              },
              enumerable: true,
              configurable: true
            });
            LocalConnection.prototype.send = function (connectionName, methodName) {
              connectionName = asCoerceString(connectionName);
              methodName = asCoerceString(methodName);
              notImplemented("public flash.net.LocalConnection::send");
              return;
            };
            Object.defineProperty(LocalConnection.prototype, "client", {
              get: function () {
                notImplemented("public flash.net.LocalConnection::get client");
                return;
              },
              set: function (client) {
                client = client;
                notImplemented("public flash.net.LocalConnection::set client");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(LocalConnection.prototype, "isPerUser", {
              get: function () {
                notImplemented("public flash.net.LocalConnection::get isPerUser");
                return;
              },
              set: function (newValue) {
                newValue = !!newValue;
                notImplemented("public flash.net.LocalConnection::set isPerUser");
                return;
              },
              enumerable: true,
              configurable: true
            });
            LocalConnection.prototype.allowDomain = function () {
              notImplemented("public flash.net.LocalConnection::allowDomain");
              return;
            };
            LocalConnection.prototype.allowInsecureDomain = function () {
              notImplemented("public flash.net.LocalConnection::allowInsecureDomain");
              return;
            };
            LocalConnection.classInitializer = null;

            LocalConnection.initializer = null;

            LocalConnection.classSymbols = null;

            LocalConnection.instanceSymbols = null;
            return LocalConnection;
          })(flash.events.EventDispatcher);
          net.LocalConnection = LocalConnection;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var wrapJSObject = Shumway.AVM2.Runtime.wrapJSObject;
          var Telemetry = Shumway.Telemetry;
          var NetStatusEvent = Shumway.AVM2.AS.flash.events.NetStatusEvent;

          var NetConnection = (function (_super) {
            __extends(NetConnection, _super);
            function NetConnection() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.net.NetConnection");
            }
            Object.defineProperty(NetConnection, "defaultObjectEncoding", {
              get: function () {
                return NetConnection._defaultObjectEncoding;
              },
              set: function (version) {
                version = version >>> 0;
                NetConnection._defaultObjectEncoding = version;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(NetConnection.prototype, "connected", {
              get: function () {
                return this._connected;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "uri", {
              get: function () {
                return this._uri;
              },
              enumerable: true,
              configurable: true
            });
            NetConnection.prototype.connect = function (command) {
              command = asCoerceString(command);

              somewhatImplemented("public flash.net.NetConnection::connect");
              this._uri = command;
              if (!command) {
                this._connected = true;
                this.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS, false, false, wrapJSObject({ level: 'status', code: 'NetConnection.Connect.Success' })));
              } else {
                this.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS, false, false, wrapJSObject({ level: 'status', code: 'NetConnection.Connect.Failed' })));
              }
            };
            Object.defineProperty(NetConnection.prototype, "client", {
              get: function () {
                return this._client;
              },
              set: function (object) {
                this._client = object;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "objectEncoding", {
              get: function () {
                return this._objectEncoding;
              },
              set: function (version) {
                version = version >>> 0;
                somewhatImplemented("public flash.net.NetConnection::set objectEncoding");
                this._objectEncoding = version;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "proxyType", {
              get: function () {
                return this._proxyType;
              },
              set: function (ptype) {
                ptype = asCoerceString(ptype);
                somewhatImplemented("public flash.net.NetConnection::set proxyType");
                this._proxyType = ptype;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "connectedProxyType", {
              get: function () {
                notImplemented("public flash.net.NetConnection::get connectedProxyType");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "usingTLS", {
              get: function () {
                somewhatImplemented("public flash.net.NetConnection::get usingTLS");
                return this._usingTLS;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "protocol", {
              get: function () {
                notImplemented("public flash.net.NetConnection::get protocol");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "maxPeerConnections", {
              get: function () {
                notImplemented("public flash.net.NetConnection::get maxPeerConnections");
                return;
              },
              set: function (maxPeers) {
                maxPeers = maxPeers >>> 0;
                notImplemented("public flash.net.NetConnection::set maxPeerConnections");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "nearID", {
              get: function () {
                notImplemented("public flash.net.NetConnection::get nearID");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "farID", {
              get: function () {
                notImplemented("public flash.net.NetConnection::get farID");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "nearNonce", {
              get: function () {
                notImplemented("public flash.net.NetConnection::get nearNonce");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "farNonce", {
              get: function () {
                notImplemented("public flash.net.NetConnection::get farNonce");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetConnection.prototype, "unconnectedPeerStreams", {
              get: function () {
                notImplemented("public flash.net.NetConnection::get unconnectedPeerStreams");
                return;
              },
              enumerable: true,
              configurable: true
            });
            NetConnection.prototype.ctor = function () {
              this._uri = null;
              this._connected = false;
              this._client = null;
              this._proxyType = 'none';
              this._objectEncoding = NetConnection.defaultObjectEncoding;
              this._usingTLS = false;

              Telemetry.instance.reportTelemetry({ topic: 'feature', feature: 6 /* NETCONNECTION_FEATURE */ });
            };
            NetConnection.prototype.invoke = function (index) {
              index = index >>> 0;
              return this._invoke(index, Array.prototype.slice.call(arguments, 1));
            };
            NetConnection.prototype.invokeWithArgsArray = function (index, p_arguments) {
              index = index >>> 0;
              p_arguments = p_arguments;
              return this._invoke.call(this, index, p_arguments);
            };
            NetConnection.prototype._invoke = function (index, args) {
              var simulated = false;
              var result;
              switch (index) {
                case 2:
                  simulated = true;
                  break;
              }
              (simulated ? somewhatImplemented : notImplemented)("private flash.net.NetConnection::_invoke (" + index + ")");
              return result;
            };
            NetConnection.classInitializer = null;

            NetConnection.initializer = null;

            NetConnection.classSymbols = null;

            NetConnection.instanceSymbols = ["close", "addHeader", "call"];

            NetConnection._defaultObjectEncoding = 3;
            return NetConnection;
          })(flash.events.EventDispatcher);
          net.NetConnection = NetConnection;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var wrapJSObject = Shumway.AVM2.Runtime.wrapJSObject;
          var NetStatusEvent = Shumway.AVM2.AS.flash.events.NetStatusEvent;
          var URLRequest = Shumway.AVM2.AS.flash.net.URLRequest;
          var URLStream = Shumway.AVM2.AS.flash.net.URLStream;
          var ByteArray = Shumway.AVM2.AS.flash.utils.ByteArray;
          var FileLoadingService = Shumway.FileLoadingService;

          var USE_MEDIASOURCE_API = false;

          var NetStream = (function (_super) {
            __extends(NetStream, _super);
            function NetStream(connection, peerID) {
              if (typeof peerID === "undefined") { peerID = "connectToFMS"; }
              false && _super.call(this, undefined);
              flash.events.EventDispatcher.instanceConstructorNoInitialize.call(this);
              this._connection = connection;
              this._peerID = asCoerceString(peerID);
              this._id = flash.display.DisplayObject.getNextSyncID();
              this._isDirty = true;
            }
            NetStream.prototype.dispose = function () {
              notImplemented("public flash.net.NetStream::dispose");
              return;
            };

            NetStream.prototype.play = function (url) {
              if (true) {
                this._url = FileLoadingService.instance.resolveUrl(url);
                somewhatImplemented("public flash.net.NetStream::play");
                return;
              }

              url = asCoerceString(url);
              var isMediaSourceEnabled = USE_MEDIASOURCE_API;
              if (isMediaSourceEnabled && typeof MediaSource === 'undefined') {
                console.warn('MediaSource API is not enabled, falling back to regular playback');
                isMediaSourceEnabled = false;
              }
              if (!isMediaSourceEnabled) {
                somewhatImplemented("public flash.net.NetStream::play");
                this._createVideoElement(FileLoadingService.instance.resolveUrl(url));
                return;
              }

              var mediaSource = new MediaSource();
              mediaSource.addEventListener('sourceopen', function (e) {
                this._mediaSource = mediaSource;
              }.bind(this));
              mediaSource.addEventListener('sourceend', function (e) {
                this._mediaSource = null;
              }.bind(this));
              this._createVideoElement(URL.createObjectURL(mediaSource));

              if (!url) {
                return;
              }

              var request = new URLRequest(url);
              request._checkPolicyFile = this._checkPolicyFile;
              var stream = new URLStream();
              stream.addEventListener('httpStatus', function (e) {
                var responseHeaders = e.asGetPublicProperty('responseHeaders');
                var contentTypeHeader = responseHeaders.filter(function (h) {
                  return h.asGetPublicProperty('name') === 'Content-Type';
                })[0];
                if (contentTypeHeader && contentTypeHeader.asGetPublicProperty('value') !== 'application/octet-stream') {
                  this._contentTypeHint = contentTypeHeader.asGetPublicProperty('value');
                }
              }.bind(this));
              stream.addEventListener('progress', function (e) {
                var available = stream.bytesAvailable;
                var data = new ByteArray();
                stream.readBytes(data, 0, available);
                this.appendBytes(data);
              }.bind(this));
              stream.addEventListener('complete', function (e) {
                this.appendBytesAction('endSequence');
              }.bind(this));
              stream.load(request);
            };
            NetStream.prototype.play2 = function (param) {
              param = param;
              notImplemented("public flash.net.NetStream::play2");
              return;
            };
            Object.defineProperty(NetStream.prototype, "info", {
              get: function () {
                notImplemented("public flash.net.NetStream::get info");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "multicastInfo", {
              get: function () {
                notImplemented("public flash.net.NetStream::get multicastInfo");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "soundTransform", {
              get: function () {
                return this._soundTransform;
              },
              set: function (sndTransform) {
                somewhatImplemented("public flash.net.NetStream::set soundTransform");
                this._soundTransform = sndTransform;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "checkPolicyFile", {
              get: function () {
                return this._checkPolicyFile;
              },
              set: function (state) {
                state = !!state;
                this._checkPolicyFile = state;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "client", {
              get: function () {
                return this._client;
              },
              set: function (object) {
                somewhatImplemented("public flash.net.NetStream::set client");
                this._client = object;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "objectEncoding", {
              get: function () {
                notImplemented("public flash.net.NetStream::get objectEncoding");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "multicastPushNeighborLimit", {
              get: function () {
                notImplemented("public flash.net.NetStream::get multicastPushNeighborLimit");
                return;
              },
              set: function (neighbors) {
                neighbors = +neighbors;
                notImplemented("public flash.net.NetStream::set multicastPushNeighborLimit");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "multicastWindowDuration", {
              get: function () {
                notImplemented("public flash.net.NetStream::get multicastWindowDuration");
                return;
              },
              set: function (seconds) {
                seconds = +seconds;
                notImplemented("public flash.net.NetStream::set multicastWindowDuration");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "multicastRelayMarginDuration", {
              get: function () {
                notImplemented("public flash.net.NetStream::get multicastRelayMarginDuration");
                return;
              },
              set: function (seconds) {
                seconds = +seconds;
                notImplemented("public flash.net.NetStream::set multicastRelayMarginDuration");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "multicastAvailabilityUpdatePeriod", {
              get: function () {
                notImplemented("public flash.net.NetStream::get multicastAvailabilityUpdatePeriod");
                return;
              },
              set: function (seconds) {
                seconds = +seconds;
                notImplemented("public flash.net.NetStream::set multicastAvailabilityUpdatePeriod");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "multicastFetchPeriod", {
              get: function () {
                notImplemented("public flash.net.NetStream::get multicastFetchPeriod");
                return;
              },
              set: function (seconds) {
                seconds = +seconds;
                notImplemented("public flash.net.NetStream::set multicastFetchPeriod");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "multicastAvailabilitySendToAll", {
              get: function () {
                notImplemented("public flash.net.NetStream::get multicastAvailabilitySendToAll");
                return;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.net.NetStream::set multicastAvailabilitySendToAll");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "farID", {
              get: function () {
                notImplemented("public flash.net.NetStream::get farID");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "nearNonce", {
              get: function () {
                notImplemented("public flash.net.NetStream::get nearNonce");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "farNonce", {
              get: function () {
                notImplemented("public flash.net.NetStream::get farNonce");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "peerStreams", {
              get: function () {
                notImplemented("public flash.net.NetStream::get peerStreams");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "audioReliable", {
              get: function () {
                notImplemented("public flash.net.NetStream::get audioReliable");
                return;
              },
              set: function (reliable) {
                reliable = !!reliable;
                notImplemented("public flash.net.NetStream::set audioReliable");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "videoReliable", {
              get: function () {
                notImplemented("public flash.net.NetStream::get videoReliable");
                return;
              },
              set: function (reliable) {
                reliable = !!reliable;
                notImplemented("public flash.net.NetStream::set videoReliable");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "dataReliable", {
              get: function () {
                notImplemented("public flash.net.NetStream::get dataReliable");
                return;
              },
              set: function (reliable) {
                reliable = !!reliable;
                notImplemented("public flash.net.NetStream::set dataReliable");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "audioSampleAccess", {
              get: function () {
                notImplemented("public flash.net.NetStream::get audioSampleAccess");
                return;
              },
              set: function (reliable) {
                reliable = !!reliable;
                notImplemented("public flash.net.NetStream::set audioSampleAccess");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "videoSampleAccess", {
              get: function () {
                notImplemented("public flash.net.NetStream::get videoSampleAccess");
                return;
              },
              set: function (reliable) {
                reliable = !!reliable;
                notImplemented("public flash.net.NetStream::set videoSampleAccess");
                return;
              },
              enumerable: true,
              configurable: true
            });
            NetStream.prototype.appendBytes = function (bytes) {
              if (this._mediaSource) {
                if (!this._mediaSourceBuffer) {
                  this._mediaSourceBuffer = this._mediaSource.addSourceBuffer(this._contentTypeHint);
                }
                this._mediaSourceBuffer.appendBuffer(new Uint8Array(bytes._buffer, 0, bytes.length));
              }

              somewhatImplemented("public flash.net.NetStream::appendBytes");
            };
            NetStream.prototype.appendBytesAction = function (netStreamAppendBytesAction) {
              netStreamAppendBytesAction = asCoerceString(netStreamAppendBytesAction);
              if (netStreamAppendBytesAction === 'endSequence' && this._mediaSource) {
                this._mediaSource.endOfStream();
              }
              somewhatImplemented("public flash.net.NetStream::appendBytesAction");
            };
            Object.defineProperty(NetStream.prototype, "useHardwareDecoder", {
              get: function () {
                notImplemented("public flash.net.NetStream::get useHardwareDecoder");
                return;
              },
              set: function (v) {
                v = !!v;
                notImplemented("public flash.net.NetStream::set useHardwareDecoder");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "useJitterBuffer", {
              get: function () {
                notImplemented("public flash.net.NetStream::get useJitterBuffer");
                return;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.net.NetStream::set useJitterBuffer");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(NetStream.prototype, "videoStreamSettings", {
              get: function () {
                notImplemented("public flash.net.NetStream::get videoStreamSettings");
                return;
              },
              set: function (settings) {
                settings = settings;
                notImplemented("public flash.net.NetStream::set videoStreamSettings");
                return;
              },
              enumerable: true,
              configurable: true
            });
            NetStream.prototype.ctor = function (connection, peerID) {
              peerID = asCoerceString(peerID);
              somewhatImplemented("public flash.net.NetStream::ctor");
              this._contentTypeHint = null;
              this._mediaSource = null;
              this._checkPolicyFile = true;
              this._videoElement = null;
              var videoReadyResolve, videoReadyReject;
              this._videoReady = new Promise(function (resolve, reject) {
                videoReadyResolve = resolve;
                videoReadyReject = reject;
              });
              this._videoReady.resolve = videoReadyResolve;
              this._videoReady.reject = videoReadyReject;
              var videoMetadataReadyResolve, videoMetadataReadyReject;
              this._videoMetadataReady = new Promise(function (resolve, reject) {
                videoMetadataReadyResolve = resolve;
                videoMetadataReadyReject = reject;
              });
              this._videoMetadataReady.resolve = videoMetadataReadyResolve;
              this._videoMetadataReady.reject = videoMetadataReadyReject;
              this._videoState = {
                started: false,
                buffer: 'empty',
                bufferTime: 0.1
              };
            };
            NetStream.prototype.invoke = function (index) {
              index = index >>> 0;
              return this._invoke(index, Array.prototype.slice.call(arguments, 1));
            };
            NetStream.prototype.invokeWithArgsArray = function (index, p_arguments) {
              index = index >>> 0;
              p_arguments = p_arguments;
              return this._invoke.call(this, index, p_arguments);
            };

            NetStream.prototype._invoke = function (index, args) {
              var simulated = false, result;
              var videoElement = this._videoElement;
              switch (index) {
                case 4:
                  this._videoState.bufferTime = args[0];
                  simulated = true;
                  break;
                case 202:
                  switch (args[1]) {
                    case 'pause':
                      simulated = true;
                      if (videoElement) {
                        if (args[3] !== false && !videoElement.paused) {
                          videoElement.pause();
                        } else if (args[3] !== true && videoElement.paused) {
                          videoElement.play();
                        }
                        videoElement.currentTime = args[4] / 1000;
                      }
                      break;
                    case 'seek':
                      simulated = true;
                      if (videoElement && !videoElement.paused) {
                        videoElement.currentTime = args[3] / 1000;
                      }
                      break;
                  }
                  break;
                case 300:
                  result = videoElement ? videoElement.currentTime : 0;
                  simulated = true;
                  break;
                case 302:
                  result = this._videoState.bufferTime;
                  simulated = true;
                  break;
                case 303:
                  result = videoElement ? videoElement.duration : 0;
                  simulated = true;
                  break;
                case 305:
                  result = this._videoState.buffer === 'full' ? 100 : this._videoState.buffer === 'progress' ? 50 : 0;
                  simulated = true;
                  break;
                case 306:
                  result = 100;
                  simulated = true;
                  break;
              }

              (simulated ? somewhatImplemented : notImplemented)("NetStream._invoke (" + index + ")");
              return result;
            };
            NetStream.prototype._createVideoElement = function (url) {
              function notifyPlayStart(e) {
                if (netStream._videoState.started) {
                  return;
                }
                netStream._videoState.started = true;
                netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS, false, false, wrapJSObject({ code: "NetStream.Play.Start", level: "status" })));
              }
              function notifyPlayStop(e) {
                netStream._videoState.started = false;
                netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS, false, false, wrapJSObject({ code: "NetStream.Play.Stop", level: "status" })));
              }
              function notifyBufferFull(e) {
                netStream._videoState.buffer = 'full';
                netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS, false, false, wrapJSObject({ code: "NetStream.Buffer.Full", level: "status" })));
              }
              function notifyProgress(e) {
                netStream._videoState.buffer = 'progress';
              }
              function notifyBufferEmpty(e) {
                netStream._videoState.buffer = 'empty';
                netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS, false, false, wrapJSObject({ code: "NetStream.Buffer.Empty", level: "status" })));
              }
              function notifyError(e) {
                var code = e.target.error.code === 4 ? "NetStream.Play.NoSupportedTrackFound" : e.target.error.code === 3 ? "NetStream.Play.FileStructureInvalid" : "NetStream.Play.StreamNotFound";
                netStream.dispatchEvent(new NetStatusEvent(NetStatusEvent.NET_STATUS, false, false, wrapJSObject({ code: code, level: "error" })));
              }
              function notifyMetadata(e) {
                netStream._videoMetadataReady.resolve({
                  videoWidth: element.videoWidth,
                  videoHeight: element.videoHeight
                });
                if (netStream._client) {
                  var data = {};
                  data.asSetPublicProperty('width', element.videoWidth);
                  data.asSetPublicProperty('height', element.videoHeight);
                  data.asSetPublicProperty('duration', element.duration);
                  netStream._client.asCallPublicProperty('onMetaData', [data]);
                }
              }

              var netStream = this;

              if (/\.mp4$/i.test(url) && /Intel Mac OS X.*?Firefox\/\d+/.test(window.navigator.userAgent)) {
                url = 'http://videos-cdn.mozilla.net/brand/Mozilla_2011_Story.webm';
              }

              var element = document.createElement('video');
              element.preload = 'metadata';
              element.src = url;
              element.addEventListener("play", notifyPlayStart);
              element.addEventListener("ended", notifyPlayStop);
              element.addEventListener("loadeddata", notifyBufferFull);
              element.addEventListener("progress", notifyProgress);
              element.addEventListener("waiting", notifyBufferEmpty);
              element.addEventListener("loadedmetadata", notifyMetadata);
              element.addEventListener("error", notifyError);
              element.play();

              this._videoElement = element;
              this._videoReady.resolve(element);
            };
            NetStream.classInitializer = null;

            NetStream.initializer = null;

            NetStream.classSymbols = null;

            NetStream.instanceSymbols = null;

            NetStream.DIRECT_CONNECTIONS = "directConnections";
            NetStream.CONNECT_TO_FMS = "connectToFMS";
            return NetStream;
          })(flash.events.EventDispatcher);
          net.NetStream = NetStream;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var NetStreamInfo = (function (_super) {
            __extends(NetStreamInfo, _super);
            function NetStreamInfo(curBPS, byteCount, maxBPS, audioBPS, audioByteCount, videoBPS, videoByteCount, dataBPS, dataByteCount, playbackBPS, droppedFrames, audioBufferByteLength, videoBufferByteLength, dataBufferByteLength, audioBufferLength, videoBufferLength, dataBufferLength, srtt, audioLossRate, videoLossRate, metaData, xmpData, uri, resourceName, isLive) {
              if (typeof metaData === "undefined") { metaData = null; }
              if (typeof xmpData === "undefined") { xmpData = null; }
              if (typeof uri === "undefined") { uri = null; }
              if (typeof resourceName === "undefined") { resourceName = null; }
              if (typeof isLive === "undefined") { isLive = true; }
              curBPS = +curBPS;
              byteCount = +byteCount;
              maxBPS = +maxBPS;
              audioBPS = +audioBPS;
              audioByteCount = +audioByteCount;
              videoBPS = +videoBPS;
              videoByteCount = +videoByteCount;
              dataBPS = +dataBPS;
              dataByteCount = +dataByteCount;
              playbackBPS = +playbackBPS;
              droppedFrames = +droppedFrames;
              audioBufferByteLength = +audioBufferByteLength;
              videoBufferByteLength = +videoBufferByteLength;
              dataBufferByteLength = +dataBufferByteLength;
              audioBufferLength = +audioBufferLength;
              videoBufferLength = +videoBufferLength;
              dataBufferLength = +dataBufferLength;
              srtt = +srtt;
              audioLossRate = +audioLossRate;
              videoLossRate = +videoLossRate;
              metaData = metaData;
              xmpData = xmpData;
              uri = asCoerceString(uri);
              resourceName = asCoerceString(resourceName);
              isLive = !!isLive;
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.net.NetStreamInfo");
            }
            NetStreamInfo.classInitializer = null;

            NetStreamInfo.initializer = null;

            NetStreamInfo.classSymbols = null;

            NetStreamInfo.instanceSymbols = null;
            return NetStreamInfo;
          })(AS.ASNative);
          net.NetStreamInfo = NetStreamInfo;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;

          var NetStreamMulticastInfo = (function (_super) {
            __extends(NetStreamMulticastInfo, _super);
            function NetStreamMulticastInfo(sendDataBytesPerSecond, sendControlBytesPerSecond, receiveDataBytesPerSecond, receiveControlBytesPerSecond, bytesPushedToPeers, fragmentsPushedToPeers, bytesRequestedByPeers, fragmentsRequestedByPeers, bytesPushedFromPeers, fragmentsPushedFromPeers, bytesRequestedFromPeers, fragmentsRequestedFromPeers, sendControlBytesPerSecondToServer, receiveDataBytesPerSecondFromServer, bytesReceivedFromServer, fragmentsReceivedFromServer, receiveDataBytesPerSecondFromIPMulticast, bytesReceivedFromIPMulticast, fragmentsReceivedFromIPMulticast) {
              sendDataBytesPerSecond = +sendDataBytesPerSecond;
              sendControlBytesPerSecond = +sendControlBytesPerSecond;
              receiveDataBytesPerSecond = +receiveDataBytesPerSecond;
              receiveControlBytesPerSecond = +receiveControlBytesPerSecond;
              bytesPushedToPeers = +bytesPushedToPeers;
              fragmentsPushedToPeers = +fragmentsPushedToPeers;
              bytesRequestedByPeers = +bytesRequestedByPeers;
              fragmentsRequestedByPeers = +fragmentsRequestedByPeers;
              bytesPushedFromPeers = +bytesPushedFromPeers;
              fragmentsPushedFromPeers = +fragmentsPushedFromPeers;
              bytesRequestedFromPeers = +bytesRequestedFromPeers;
              fragmentsRequestedFromPeers = +fragmentsRequestedFromPeers;
              sendControlBytesPerSecondToServer = +sendControlBytesPerSecondToServer;
              receiveDataBytesPerSecondFromServer = +receiveDataBytesPerSecondFromServer;
              bytesReceivedFromServer = +bytesReceivedFromServer;
              fragmentsReceivedFromServer = +fragmentsReceivedFromServer;
              receiveDataBytesPerSecondFromIPMulticast = +receiveDataBytesPerSecondFromIPMulticast;
              bytesReceivedFromIPMulticast = +bytesReceivedFromIPMulticast;
              fragmentsReceivedFromIPMulticast = +fragmentsReceivedFromIPMulticast;
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.net.NetStreamMulticastInfo");
            }
            NetStreamMulticastInfo.classInitializer = null;

            NetStreamMulticastInfo.initializer = null;

            NetStreamMulticastInfo.classSymbols = null;

            NetStreamMulticastInfo.instanceSymbols = null;
            return NetStreamMulticastInfo;
          })(AS.ASNative);
          net.NetStreamMulticastInfo = NetStreamMulticastInfo;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;

          var NetStreamPlayOptions = (function (_super) {
            __extends(NetStreamPlayOptions, _super);
            function NetStreamPlayOptions() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.net.NetStreamPlayOptions");
            }
            NetStreamPlayOptions.classInitializer = null;

            NetStreamPlayOptions.initializer = null;

            NetStreamPlayOptions.classSymbols = null;

            NetStreamPlayOptions.instanceSymbols = null;
            return NetStreamPlayOptions;
          })(flash.events.EventDispatcher);
          net.NetStreamPlayOptions = NetStreamPlayOptions;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Responder = (function (_super) {
            __extends(Responder, _super);
            function Responder(result, status) {
              if (typeof status === "undefined") { status = null; }
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.net.Responder");
            }
            Responder.prototype.ctor = function (result, status) {
              this._result = result;
              this._status = status;
            };
            Responder.classInitializer = null;

            Responder.initializer = null;

            Responder.classSymbols = null;

            Responder.instanceSymbols = null;
            return Responder;
          })(AS.ASNative);
          net.Responder = Responder;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;

          var SharedObject = (function (_super) {
            __extends(SharedObject, _super);
            function SharedObject() {
              false && _super.call(this, undefined);
              flash.events.EventDispatcher.instanceConstructorNoInitialize.call(this);
              this._data = createEmptyObject();
            }
            SharedObject.deleteAll = function (url) {
              url = asCoerceString(url);
              notImplemented("public flash.net.SharedObject::static deleteAll");
              return;
            };
            SharedObject.getDiskUsage = function (url) {
              url = asCoerceString(url);
              notImplemented("public flash.net.SharedObject::static getDiskUsage");
              return;
            };
            SharedObject._create = function (path, data) {
              var obj = new SharedObject();
              obj._path = path;
              obj._data = data;
              obj._objectEncoding = SharedObject._defaultObjectEncoding;
              Shumway.Telemetry.instance.reportTelemetry({ topic: 'feature', feature: 3 /* SHAREDOBJECT_FEATURE */ });
              return obj;
            };
            SharedObject.getLocal = function (name, localPath, secure) {
              if (typeof localPath === "undefined") { localPath = null; }
              if (typeof secure === "undefined") { secure = false; }
              name = asCoerceString(name);
              localPath = asCoerceString(localPath);
              secure = !!secure;
              var path = (localPath || '') + '/' + name;
              if (SharedObject._sharedObjects[path]) {
                return SharedObject._sharedObjects[path];
              }
              var data = sessionStorage.getItem(path);

              var so = SharedObject._create(path, data ? JSON.parse(data) : {});

              SharedObject._sharedObjects[path] = so;
              return so;
            };
            SharedObject.getRemote = function (name, remotePath, persistence, secure) {
              if (typeof remotePath === "undefined") { remotePath = null; }
              if (typeof persistence === "undefined") { persistence = false; }
              if (typeof secure === "undefined") { secure = false; }
              name = asCoerceString(name);
              remotePath = asCoerceString(remotePath);
              secure = !!secure;
              notImplemented("public flash.net.SharedObject::static getRemote");
              return;
            };
            Object.defineProperty(SharedObject, "defaultObjectEncoding", {
              get: function () {
                return SharedObject._defaultObjectEncoding;
              },
              set: function (version) {
                version = version >>> 0;
                SharedObject._defaultObjectEncoding = version;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(SharedObject.prototype, "data", {
              get: function () {
                return this._data;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SharedObject.prototype, "objectEncoding", {
              get: function () {
                return this._objectEncoding;
              },
              set: function (version) {
                version = version >>> 0;
                this._objectEncoding = version;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(SharedObject.prototype, "client", {
              get: function () {
                notImplemented("public flash.net.SharedObject::get client");
                return;
              },
              set: function (object) {
                object = object;
                notImplemented("public flash.net.SharedObject::set client");
                return;
              },
              enumerable: true,
              configurable: true
            });
            SharedObject.prototype.setDirty = function (propertyName) {
              propertyName = asCoerceString(propertyName);
              somewhatImplemented("public flash.net.SharedObject::setDirty");
            };
            SharedObject.prototype.invoke = function (index) {
              index = index >>> 0;
              return this._invoke(index, Array.prototype.slice.call(arguments, 1));
            };
            SharedObject.prototype.invokeWithArgsArray = function (index, args) {
              index = index >>> 0;
              return this._invoke(index, args);
            };
            SharedObject.prototype._invoke = function (index, args) {
              var simulated = false, result;
              switch (index) {
                case 4:
                  result = JSON.stringify(this._data).length - 2;
                  simulated = true;
                  break;
                case 6:
                  this._data = {};
                  sessionStorage.removeItem(this._path);
                  simulated = true;
                  break;
                case 2:
                  sessionStorage.setItem(this._path, JSON.stringify(this._data));
                  simulated = true;
                  result = true;
                  break;
                case 3:
                  simulated = true;
                  break;
              }
              (simulated ? somewhatImplemented : notImplemented)("private flash.net.SharedObject::_invoke (" + index + ")");
              return result;
            };
            SharedObject.classInitializer = null;

            SharedObject.initializer = null;

            SharedObject.classSymbols = null;

            SharedObject.instanceSymbols = null;

            SharedObject._sharedObjects = createEmptyObject();

            SharedObject._defaultObjectEncoding = 3;
            return SharedObject;
          })(flash.events.EventDispatcher);
          net.SharedObject = SharedObject;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var Errors = Shumway.AVM2.Errors;
          var throwError = Shumway.AVM2.Runtime.throwError;

          var Socket = (function (_super) {
            __extends(Socket, _super);
            function Socket(host, port) {
              if (typeof host === "undefined") { host = null; }
              if (typeof port === "undefined") { port = 0; }
              host = asCoerceString(host);
              port = port | 0;
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.net.Socket");
            }
            Object.defineProperty(Socket.prototype, "bytesAvailable", {
              get: function () {
                notImplemented("public flash.net.Socket::get bytesAvailable");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Socket.prototype, "connected", {
              get: function () {
                notImplemented("public flash.net.Socket::get connected");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Socket.prototype, "objectEncoding", {
              get: function () {
                notImplemented("public flash.net.Socket::get objectEncoding");
                return;
              },
              set: function (version) {
                version = version >>> 0;
                notImplemented("public flash.net.Socket::set objectEncoding");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Socket.prototype, "endian", {
              get: function () {
                notImplemented("public flash.net.Socket::get endian");
                return;
              },
              set: function (type) {
                type = asCoerceString(type);
                notImplemented("public flash.net.Socket::set endian");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Socket.prototype, "bytesPending", {
              get: function () {
                notImplemented("public flash.net.Socket::get bytesPending");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Socket.prototype.readBytes = function (bytes, offset, length) {
              if (typeof offset === "undefined") { offset = 0; }
              if (typeof length === "undefined") { length = 0; }
              bytes = bytes;
              offset = offset >>> 0;
              length = length >>> 0;
              notImplemented("public flash.net.Socket::readBytes");
              return;
            };
            Socket.prototype.writeBytes = function (bytes, offset, length) {
              if (typeof offset === "undefined") { offset = 0; }
              if (typeof length === "undefined") { length = 0; }
              bytes = bytes;
              offset = offset >>> 0;
              length = length >>> 0;
              notImplemented("public flash.net.Socket::writeBytes");
              return;
            };
            Socket.prototype.writeBoolean = function (value) {
              value = !!value;
              notImplemented("public flash.net.Socket::writeBoolean");
              return;
            };
            Socket.prototype.writeByte = function (value) {
              value = value | 0;
              notImplemented("public flash.net.Socket::writeByte");
              return;
            };
            Socket.prototype.writeShort = function (value) {
              value = value | 0;
              notImplemented("public flash.net.Socket::writeShort");
              return;
            };
            Socket.prototype.writeInt = function (value) {
              value = value | 0;
              notImplemented("public flash.net.Socket::writeInt");
              return;
            };
            Socket.prototype.writeUnsignedInt = function (value) {
              value = value >>> 0;
              notImplemented("public flash.net.Socket::writeUnsignedInt");
              return;
            };
            Socket.prototype.writeFloat = function (value) {
              value = +value;
              notImplemented("public flash.net.Socket::writeFloat");
              return;
            };
            Socket.prototype.writeDouble = function (value) {
              value = +value;
              notImplemented("public flash.net.Socket::writeDouble");
              return;
            };
            Socket.prototype.writeMultiByte = function (value, charSet) {
              value = asCoerceString(value);
              charSet = asCoerceString(charSet);
              notImplemented("public flash.net.Socket::writeMultiByte");
              return;
            };
            Socket.prototype.writeUTF = function (value) {
              value = asCoerceString(value);
              notImplemented("public flash.net.Socket::writeUTF");
              return;
            };
            Socket.prototype.writeUTFBytes = function (value) {
              value = asCoerceString(value);
              notImplemented("public flash.net.Socket::writeUTFBytes");
              return;
            };
            Socket.prototype.readBoolean = function () {
              notImplemented("public flash.net.Socket::readBoolean");
              return;
            };
            Socket.prototype.readByte = function () {
              notImplemented("public flash.net.Socket::readByte");
              return;
            };
            Socket.prototype.readUnsignedByte = function () {
              notImplemented("public flash.net.Socket::readUnsignedByte");
              return;
            };
            Socket.prototype.readShort = function () {
              notImplemented("public flash.net.Socket::readShort");
              return;
            };
            Socket.prototype.readUnsignedShort = function () {
              notImplemented("public flash.net.Socket::readUnsignedShort");
              return;
            };
            Socket.prototype.readInt = function () {
              notImplemented("public flash.net.Socket::readInt");
              return;
            };
            Socket.prototype.readUnsignedInt = function () {
              notImplemented("public flash.net.Socket::readUnsignedInt");
              return;
            };
            Socket.prototype.readFloat = function () {
              notImplemented("public flash.net.Socket::readFloat");
              return;
            };
            Socket.prototype.readDouble = function () {
              notImplemented("public flash.net.Socket::readDouble");
              return;
            };
            Socket.prototype.readMultiByte = function (length, charSet) {
              length = length >>> 0;
              charSet = asCoerceString(charSet);
              notImplemented("public flash.net.Socket::readMultiByte");
              return;
            };
            Socket.prototype.readUTF = function () {
              notImplemented("public flash.net.Socket::readUTF");
              return;
            };
            Socket.prototype.readUTFBytes = function (length) {
              length = length >>> 0;
              notImplemented("public flash.net.Socket::readUTFBytes");
              return;
            };
            Socket.prototype.flush = function () {
              notImplemented("public flash.net.Socket::flush");
              return;
            };
            Socket.prototype.writeObject = function (object) {
              notImplemented("public flash.net.Socket::writeObject");
              return;
            };
            Socket.prototype.readObject = function () {
              notImplemented("public flash.net.Socket::readObject");
              return;
            };
            Socket.prototype.internalGetSecurityErrorMessage = function (host, port) {
              host = asCoerceString(host);
              port |= 0;
              somewhatImplemented("flash.net.Socket::internalGetSecurityErrorMessage");
              return 'SecurityErrorEvent';
            };
            Socket.prototype.internalConnect = function (host, port) {
              host = asCoerceString(host);
              port |= 0;
              somewhatImplemented("flash.net.Socket::internalConnect");
              throwError('SecurityError', Errors.SocketConnectError, host, port);
            };
            Socket.prototype.didFailureOccur = function () {
              somewhatImplemented("flash.net.Socket::didFailureOccur");
              return true;
            };
            Socket.classInitializer = null;

            Socket.initializer = null;

            Socket.classSymbols = null;

            Socket.instanceSymbols = null;
            return Socket;
          })(flash.events.EventDispatcher);
          net.Socket = Socket;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;

          var URLLoader = (function (_super) {
            __extends(URLLoader, _super);
            function URLLoader(request) {
              if (typeof request === "undefined") { request = null; }
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.net.URLLoader");
            }
            URLLoader.classInitializer = null;

            URLLoader.initializer = null;

            URLLoader.classSymbols = null;

            URLLoader.instanceSymbols = ["data", "dataFormat", "bytesLoaded", "bytesTotal", "load", "close"];
            return URLLoader;
          })(flash.events.EventDispatcher);
          net.URLLoader = URLLoader;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var throwError = Shumway.AVM2.Runtime.throwError;

          var URLRequest = (function (_super) {
            __extends(URLRequest, _super);
            function URLRequest(url) {
              if (typeof url === "undefined") { url = null; }
              url = asCoerceString(url);
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.net.URLRequest");
            }
            Object.defineProperty(URLRequest.prototype, "url", {
              get: function () {
                return this._url;
              },
              set: function (value) {
                value = asCoerceString(value);
                this._url = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLRequest.prototype, "data", {
              get: function () {
                return this._data;
              },
              set: function (value) {
                this._data = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLRequest.prototype, "method", {
              get: function () {
                return this._method;
              },
              set: function (value) {
                value = asCoerceString(value);
                if (value !== 'get' && value !== 'GET' && value !== 'post' && value !== 'POST') {
                  throwError('ArgumentError', AVM2.Errors.InvalidArgumentError);
                }
                this._method = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLRequest.prototype, "contentType", {
              get: function () {
                return this._contentType;
              },
              set: function (value) {
                value = asCoerceString(value);
                this._contentType = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLRequest.prototype, "requestHeaders", {
              get: function () {
                return this._requestHeaders;
              },
              set: function (value) {
                if (!Array.isArray(value)) {
                  throwError('ArgumentError', AVM2.Errors.InvalidArgumentError, "value");
                }
                this._requestHeaders = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLRequest.prototype, "digest", {
              get: function () {
                return this._digest;
              },
              set: function (value) {
                value = asCoerceString(value);
                this._digest = value;
              },
              enumerable: true,
              configurable: true
            });

            URLRequest.prototype._toFileRequest = function () {
              var obj = {};
              obj.url = this._url;
              obj.method = this._method;
              obj.checkPolicyFile = this._checkPolicyFile;
              if (this._data) {
                obj.mimeType = this._contentType;
                if (flash.utils.ByteArray.isType(this._data)) {
                  obj.data = new Uint8Array(this._data._buffer, 0, this._data.length);
                } else {
                  var data = this._data.asGetPublicProperty("toString").call(this._data);
                  if (this._method === 'GET') {
                    var i = obj.url.lastIndexOf('?');
                    obj.url = (i < 0 ? obj.url : obj.url.substring(0, i)) + '?' + data;
                  } else {
                    obj.data = data;
                  }
                }
              }
              return obj;
            };
            URLRequest.classInitializer = null;

            URLRequest.initializer = function () {
              this._url = null;
              this._method = 'GET';
              this._data = null;
              this._digest = null;
              this._contentType = 'application/x-www-form-urlencoded';
              this._requestHeaders = null;
              this._checkPolicyFile = true;
            };

            URLRequest.classSymbols = null;

            URLRequest.bindings = null;
            return URLRequest;
          })(AS.ASNative);
          net.URLRequest = URLRequest;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var URLRequestHeader = (function (_super) {
            __extends(URLRequestHeader, _super);
            function URLRequestHeader(name, value) {
              if (typeof name === "undefined") { name = ""; }
              if (typeof value === "undefined") { value = ""; }
              name = asCoerceString(name);
              value = asCoerceString(value);
              false && _super.call(this);
            }
            URLRequestHeader.classInitializer = null;

            URLRequestHeader.initializer = null;

            URLRequestHeader.classSymbols = null;

            URLRequestHeader.instanceSymbols = ["name!", "value!"];
            return URLRequestHeader;
          })(AS.ASNative);
          net.URLRequestHeader = URLRequestHeader;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var FileLoadingService = Shumway.FileLoadingService;
          var throwError = Shumway.AVM2.Runtime.throwError;

          var utils = Shumway.AVM2.AS.flash.utils;

          var URLStream = (function (_super) {
            __extends(URLStream, _super);
            function URLStream() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.net.URLStream");
            }
            Object.defineProperty(URLStream.prototype, "connected", {
              get: function () {
                return this._connected;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLStream.prototype, "bytesAvailable", {
              get: function () {
                return this._buffer.length - this._buffer.position;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLStream.prototype, "objectEncoding", {
              get: function () {
                return this._buffer.objectEncoding;
              },
              set: function (version) {
                version = version >>> 0;
                this._buffer.objectEncoding = version;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLStream.prototype, "endian", {
              get: function () {
                return this._buffer.endian;
              },
              set: function (type) {
                type = asCoerceString(type);
                this._buffer.endian = type;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLStream.prototype, "diskCacheEnabled", {
              get: function () {
                notImplemented("public flash.net.URLStream::get diskCacheEnabled");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLStream.prototype, "position", {
              get: function () {
                return this._buffer.position;
              },
              set: function (offset) {
                offset = +offset;
                this._buffer.position = offset;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(URLStream.prototype, "length", {
              get: function () {
                return this._buffer.length;
              },
              enumerable: true,
              configurable: true
            });
            URLStream.prototype.load = function (request) {
              var Event = flash.events.Event;
              var IOErrorEvent = flash.events.IOErrorEvent;
              var ProgressEvent = flash.events.ProgressEvent;
              var HTTPStatusEvent = flash.events.HTTPStatusEvent;

              var session = FileLoadingService.instance.createSession();
              var self = this;
              var initStream = true;
              session.onprogress = function (data, progressState) {
                var readPosition = self._buffer.position;
                self._buffer.position = self._writePosition;
                self._buffer.writeRawBytes(data);
                self._writePosition = self._buffer.position;
                self._buffer.position = readPosition;

                self.dispatchEvent(new ProgressEvent(ProgressEvent.PROGRESS, false, false, progressState.bytesLoaded, progressState.bytesTotal));
              };
              session.onerror = function (error) {
                self._connected = false;
                self.dispatchEvent(new IOErrorEvent(IOErrorEvent.IO_ERROR, false, false, error));
              };
              session.onopen = function () {
                self._connected = true;
                self.dispatchEvent(new Event(Event.OPEN, false, false));
              };
              session.onhttpstatus = function (location, httpStatus, httpHeaders) {
                var httpStatusEvent = new HTTPStatusEvent(HTTPStatusEvent.HTTP_STATUS, false, false, httpStatus);
                var headers = [];
                httpHeaders.split(/(?:\n|\r?\n)/g).forEach(function (h) {
                  var m = /^([^:]+): (.*)$/.exec(h);
                  if (m) {
                    headers.push(new flash.net.URLRequestHeader(m[1], m[2]));
                    if (m[1] === 'Location') {
                      location = m[2];
                    }
                  }
                });
                httpStatusEvent.asSetPublicProperty('responseHeaders', headers);
                httpStatusEvent.asSetPublicProperty('responseURL', location);
                self.dispatchEvent(httpStatusEvent);
              };
              session.onclose = function () {
                self._connected = false;
                self.dispatchEvent(new Event(Event.COMPLETE, false, false));
              };
              session.open(request._toFileRequest());
              this._session = session;
            };
            URLStream.prototype.readBytes = function (bytes, offset, length) {
              if (typeof offset === "undefined") { offset = 0; }
              if (typeof length === "undefined") { length = 0; }
              offset = offset >>> 0;
              length = length >>> 0;
              if (length < 0) {
                throwError('ArgumentError', AVM2.Errors.InvalidArgumentError, "length");
              }

              this._buffer.readBytes(bytes, offset, length);
            };
            URLStream.prototype.readBoolean = function () {
              notImplemented("public flash.net.URLStream::readBoolean");
              return;
            };
            URLStream.prototype.readByte = function () {
              return this._buffer.readByte();
            };
            URLStream.prototype.readUnsignedByte = function () {
              notImplemented("public flash.net.URLStream::readUnsignedByte");
              return;
            };
            URLStream.prototype.readShort = function () {
              notImplemented("public flash.net.URLStream::readShort");
              return;
            };
            URLStream.prototype.readUnsignedShort = function () {
              return this._buffer.readUnsignedShort();
            };
            URLStream.prototype.readUnsignedInt = function () {
              notImplemented("public flash.net.URLStream::readUnsignedInt");
              return;
            };
            URLStream.prototype.readInt = function () {
              notImplemented("public flash.net.URLStream::readInt");
              return;
            };
            URLStream.prototype.readFloat = function () {
              notImplemented("public flash.net.URLStream::readFloat");
              return;
            };
            URLStream.prototype.readDouble = function () {
              notImplemented("public flash.net.URLStream::readDouble");
              return;
            };
            URLStream.prototype.readMultiByte = function (length, charSet) {
              length = length >>> 0;
              charSet = asCoerceString(charSet);
              notImplemented("public flash.net.URLStream::readMultiByte");
              return;
            };
            URLStream.prototype.readUTF = function () {
              return this._buffer.readUTF();
            };
            URLStream.prototype.readUTFBytes = function (length) {
              return this._buffer.readUTFBytes(length);
            };
            URLStream.prototype.close = function () {
              this._session.close();
            };
            URLStream.prototype.readObject = function () {
              notImplemented("public flash.net.URLStream::readObject");
              return;
            };
            URLStream.prototype.stop = function () {
              notImplemented("public flash.net.URLStream::stop");
              return;
            };
            URLStream.classInitializer = null;

            URLStream.initializer = function () {
              this._buffer = new utils.ByteArray();
              this._writePosition = 0;
              this._connected = false;
            };

            URLStream.classSymbols = null;

            URLStream.instanceSymbols = null;
            return URLStream;
          })(flash.events.EventDispatcher);
          net.URLStream = URLStream;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (net) {
          var notImplemented = Shumway.Debug.notImplemented;

          var URLVariables = (function (_super) {
            __extends(URLVariables, _super);
            function URLVariables(source) {
              if (typeof source === "undefined") { source = null; }
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.net.URLVariables");
            }
            URLVariables.classInitializer = null;

            URLVariables.initializer = null;

            URLVariables.classSymbols = null;

            URLVariables.instanceSymbols = ["decode!"];
            return URLVariables;
          })(AS.ASNative);
          net.URLVariables = URLVariables;
        })(flash.net || (flash.net = {}));
        var net = flash.net;
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
      (function (flash) {
        (function (sensors) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Accelerometer = (function (_super) {
            __extends(Accelerometer, _super);
            function Accelerometer() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.sensors.Accelerometer");
            }
            Object.defineProperty(Accelerometer.prototype, "isSupported", {
              get: function () {
                notImplemented("public flash.sensors.Accelerometer::get isSupported");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Accelerometer.prototype, "muted", {
              get: function () {
                notImplemented("public flash.sensors.Accelerometer::get muted");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Accelerometer.prototype.setRequestedUpdateInterval = function (interval) {
              interval = +interval;
              notImplemented("public flash.sensors.Accelerometer::setRequestedUpdateInterval");
              return;
            };
            Accelerometer.classInitializer = null;

            Accelerometer.initializer = null;

            Accelerometer.classSymbols = null;

            Accelerometer.instanceSymbols = null;
            return Accelerometer;
          })(flash.events.EventDispatcher);
          sensors.Accelerometer = Accelerometer;
        })(flash.sensors || (flash.sensors = {}));
        var sensors = flash.sensors;
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
      (function (flash) {
        (function (sensors) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Geolocation = (function (_super) {
            __extends(Geolocation, _super);
            function Geolocation() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.sensors.Geolocation");
            }
            Object.defineProperty(Geolocation.prototype, "isSupported", {
              get: function () {
                notImplemented("public flash.sensors.Geolocation::get isSupported");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Geolocation.prototype, "muted", {
              get: function () {
                notImplemented("public flash.sensors.Geolocation::get muted");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Geolocation.prototype.setRequestedUpdateInterval = function (interval) {
              interval = +interval;
              notImplemented("public flash.sensors.Geolocation::setRequestedUpdateInterval");
              return;
            };
            Geolocation.classInitializer = null;

            Geolocation.initializer = null;

            Geolocation.classSymbols = null;

            Geolocation.instanceSymbols = null;
            return Geolocation;
          })(flash.events.EventDispatcher);
          sensors.Geolocation = Geolocation;
        })(flash.sensors || (flash.sensors = {}));
        var sensors = flash.sensors;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (_AVM2) {
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var AVM2 = Shumway.AVM2.Runtime.AVM2;
          var ExecutionMode = Shumway.AVM2.Runtime.ExecutionMode;
          var RuntimeApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
          var Multiname = Shumway.AVM2.ABC.Multiname;

          var ApplicationDomain = (function (_super) {
            __extends(ApplicationDomain, _super);
            function ApplicationDomain(parentDomainOrRuntimeDomain) {
              if (typeof parentDomainOrRuntimeDomain === "undefined") { parentDomainOrRuntimeDomain = null; }
              false && _super.call(this);
              if (parentDomainOrRuntimeDomain instanceof RuntimeApplicationDomain) {
                this._runtimeDomain = parentDomainOrRuntimeDomain;
                return;
              }
              var parentRuntimeDomain;
              if (parentDomainOrRuntimeDomain) {
                parentRuntimeDomain = parentDomainOrRuntimeDomain._runtimeDomain;
              } else {
                parentRuntimeDomain = AVM2.currentDomain().system;
              }
              this._runtimeDomain = new RuntimeApplicationDomain(parentRuntimeDomain.vm, parentRuntimeDomain, 2 /* COMPILE */, false);
            }
            Object.defineProperty(ApplicationDomain, "currentDomain", {
              get: function () {
                return new ApplicationDomain(AVM2.currentDomain());
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ApplicationDomain, "MIN_DOMAIN_MEMORY_LENGTH", {
              get: function () {
                notImplemented("public flash.system.ApplicationDomain::get MIN_DOMAIN_MEMORY_LENGTH");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(ApplicationDomain.prototype, "parentDomain", {
              get: function () {
                if (this._runtimeDomain.base) {
                  return new ApplicationDomain(this._runtimeDomain.base);
                }
                return null;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ApplicationDomain.prototype, "domainMemory", {
              get: function () {
                notImplemented("public flash.system.ApplicationDomain::get domainMemory");
                return;
              },
              set: function (mem) {
                mem = mem;
                notImplemented("public flash.system.ApplicationDomain::set domainMemory");
                return;
              },
              enumerable: true,
              configurable: true
            });
            ApplicationDomain.prototype.getDefinition = function (name) {
              name = asCoerceString(name);
              if (name) {
                var simpleName = name.replace("::", ".");
                return this._runtimeDomain.getProperty(Multiname.fromSimpleName(simpleName), true, true);
              }
              return null;
            };
            ApplicationDomain.prototype.hasDefinition = function (name) {
              name = asCoerceString(name);
              if (name) {
                var simpleName = name.replace("::", ".");
                return !!this._runtimeDomain.findDomainProperty(Multiname.fromSimpleName(simpleName), false, false);
              }
              return false;
            };
            ApplicationDomain.prototype.getQualifiedDefinitionNames = function () {
              notImplemented("public flash.system.ApplicationDomain::getQualifiedDefinitionNames");
              return;
            };
            ApplicationDomain.classInitializer = null;
            ApplicationDomain.initializer = null;
            ApplicationDomain.classSymbols = null;
            ApplicationDomain.instanceSymbols = null;
            return ApplicationDomain;
          })(AS.ASNative);
          system.ApplicationDomain = ApplicationDomain;
        })(flash.system || (flash.system = {}));
        var system = flash.system;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(_AVM2.AS || (_AVM2.AS = {}));
    var AS = _AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var toKeyValueArray = Shumway.ObjectUtilities.toKeyValueArray;

          var Capabilities = (function (_super) {
            __extends(Capabilities, _super);
            function Capabilities() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.system.Capabilities");
            }
            Object.defineProperty(Capabilities, "isEmbeddedInAcrobat", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get isEmbeddedInAcrobat");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasEmbeddedVideo", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasEmbeddedVideo");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasAudio", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasAudio");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "avHardwareDisable", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get avHardwareDisable");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasAccessibility", {
              get: function () {
                somewhatImplemented("public flash.system.Capabilities::get hasAccessibility");
                return Capabilities._hasAccessibility;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasAudioEncoder", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasAudioEncoder");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasMP3", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasMP3");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasPrinting", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasPrinting");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasScreenBroadcast", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasScreenBroadcast");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasScreenPlayback", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasScreenPlayback");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasStreamingAudio", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasStreamingAudio");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasStreamingVideo", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasStreamingVideo");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasVideoEncoder", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasVideoEncoder");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "isDebugger", {
              get: function () {
                somewhatImplemented("public flash.system.Capabilities::get isDebugger");
                return Capabilities._isDebugger;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "localFileReadDisable", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get localFileReadDisable");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "language", {
              get: function () {
                somewhatImplemented("public flash.system.Capabilities::get language");
                return Capabilities._language;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "manufacturer", {
              get: function () {
                somewhatImplemented("public flash.system.Capabilities::get manufacturer");
                return Capabilities._manufacturer;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "os", {
              get: function () {
                if (Capabilities._os === null) {
                  var os;
                  var userAgent = window.navigator.userAgent;
                  if (userAgent.indexOf("Macintosh") > 0) {
                    os = "Mac OS 10.5.2";
                  } else if (userAgent.indexOf("Windows") > 0) {
                    os = "Windows XP";
                  } else if (userAgent.indexOf("Linux") > 0) {
                    os = "Linux";
                  } else if (/(iPad|iPhone|iPod|Android)/.test(userAgent)) {
                    os = "iPhone3,1";
                  } else {
                    notImplemented("public flash.system.Capabilities::get os");
                  }
                  Capabilities._os = os;
                }
                return Capabilities._os;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "cpuArchitecture", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get cpuArchitecture");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "playerType", {
              get: function () {
                somewhatImplemented("public flash.system.Capabilities::get playerType");
                return Capabilities._playerType;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "serverString", {
              get: function () {
                var str = toKeyValueArray({ OS: Capabilities.os }).map(function (pair) {
                  return pair[0] + "=" + encodeURIComponent(pair[1]);
                }).join("&");
                somewhatImplemented("Capabilities.serverString: " + str);
                return str;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "version", {
              get: function () {
                return Capabilities._version;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "screenColor", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get screenColor");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "pixelAspectRatio", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get pixelAspectRatio");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "screenDPI", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get screenDPI");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "screenResolutionX", {
              get: function () {
                somewhatImplemented("public flash.system.Capabilities::get screenResolutionX");
                return window.screen.width;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "screenResolutionY", {
              get: function () {
                somewhatImplemented("public flash.system.Capabilities::get screenResolutionY");
                return window.screen.height;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "touchscreenType", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get touchscreenType");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasIME", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasIME");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "hasTLS", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get hasTLS");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "maxLevelIDC", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get maxLevelIDC");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "supports32BitProcesses", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get supports32BitProcesses");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "supports64BitProcesses", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get supports64BitProcesses");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Capabilities, "_internal", {
              get: function () {
                notImplemented("public flash.system.Capabilities::get _internal");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Capabilities.hasMultiChannelAudio = function (type) {
              type = asCoerceString(type);
              notImplemented("public flash.system.Capabilities::static hasMultiChannelAudio");
              return;
            };
            Capabilities.classInitializer = null;

            Capabilities.initializer = null;

            Capabilities.classSymbols = null;

            Capabilities.instanceSymbols = null;

            Capabilities._hasAccessibility = false;

            Capabilities._isDebugger = false;

            Capabilities._language = 'en';
            Capabilities._manufacturer = 'Mozilla Research';
            Capabilities._os = null;

            Capabilities._playerType = 'PlugIn';
            Capabilities._version = 'SHUMWAY 10,0,0,0';
            return Capabilities;
          })(AS.ASNative);
          system.Capabilities = Capabilities;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var FSCommand = (function (_super) {
            __extends(FSCommand, _super);
            function FSCommand() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: packageInternal flash.system.FSCommand");
            }
            FSCommand._fscommand = function (command, args) {
              command = asCoerceString(command);
              args = asCoerceString(args);
              console.log('FSCommand: ' + command + '; ' + args);
              command = command.toLowerCase();
              if (command === 'debugger') {
                debugger;

                return;
              }

              var listener = Shumway.AVM2.Runtime.AVM2.instance.globals['Shumway.Player.Utils'];
              listener.executeFSCommand(command, args);
            };
            FSCommand.classInitializer = null;

            FSCommand.initializer = null;

            FSCommand.classSymbols = null;

            FSCommand.instanceSymbols = null;
            return FSCommand;
          })(AS.ASNative);
          system.FSCommand = FSCommand;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;

          var ImageDecodingPolicy = (function (_super) {
            __extends(ImageDecodingPolicy, _super);
            function ImageDecodingPolicy() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.system.ImageDecodingPolicy");
            }
            ImageDecodingPolicy.classInitializer = null;

            ImageDecodingPolicy.initializer = null;

            ImageDecodingPolicy.classSymbols = null;

            ImageDecodingPolicy.instanceSymbols = null;

            ImageDecodingPolicy.ON_DEMAND = "onDemand";
            ImageDecodingPolicy.ON_LOAD = "onLoad";
            return ImageDecodingPolicy;
          })(AS.ASNative);
          system.ImageDecodingPolicy = ImageDecodingPolicy;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;

          var LoaderContext = (function (_super) {
            __extends(LoaderContext, _super);
            function LoaderContext(checkPolicyFile, applicationDomain, securityDomain) {
              if (typeof checkPolicyFile === "undefined") { checkPolicyFile = false; }
              if (typeof applicationDomain === "undefined") { applicationDomain = null; }
              if (typeof securityDomain === "undefined") { securityDomain = null; }
              checkPolicyFile = !!checkPolicyFile;
              applicationDomain = applicationDomain;
              securityDomain = securityDomain;
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.system.LoaderContext");
            }
            LoaderContext.classInitializer = null;

            LoaderContext.initializer = null;

            LoaderContext.classSymbols = null;

            LoaderContext.instanceSymbols = null;
            return LoaderContext;
          })(AS.ASNative);
          system.LoaderContext = LoaderContext;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;

          var JPEGLoaderContext = (function (_super) {
            __extends(JPEGLoaderContext, _super);
            function JPEGLoaderContext(deblockingFilter, checkPolicyFile, applicationDomain, securityDomain) {
              if (typeof deblockingFilter === "undefined") { deblockingFilter = 0; }
              if (typeof checkPolicyFile === "undefined") { checkPolicyFile = false; }
              if (typeof applicationDomain === "undefined") { applicationDomain = null; }
              if (typeof securityDomain === "undefined") { securityDomain = null; }
              deblockingFilter = +deblockingFilter;
              checkPolicyFile = !!checkPolicyFile;
              applicationDomain = applicationDomain;
              securityDomain = securityDomain;
              false && _super.call(this, undefined, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.system.JPEGLoaderContext");
            }
            JPEGLoaderContext.classInitializer = null;

            JPEGLoaderContext.initializer = null;

            JPEGLoaderContext.classSymbols = null;

            JPEGLoaderContext.instanceSymbols = null;
            return JPEGLoaderContext;
          })(flash.system.LoaderContext);
          system.JPEGLoaderContext = JPEGLoaderContext;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;

          var MessageChannel = (function (_super) {
            __extends(MessageChannel, _super);
            function MessageChannel() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.system.MessageChannel");
            }
            Object.defineProperty(MessageChannel.prototype, "messageAvailable", {
              get: function () {
                notImplemented("public flash.system.MessageChannel::get messageAvailable");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(MessageChannel.prototype, "state", {
              get: function () {
                notImplemented("public flash.system.MessageChannel::get state");
                return;
              },
              enumerable: true,
              configurable: true
            });
            MessageChannel.prototype.send = function (arg, queueLimit) {
              if (typeof queueLimit === "undefined") { queueLimit = -1; }
              queueLimit = queueLimit | 0;
              notImplemented("public flash.system.MessageChannel::send");
              return;
            };
            MessageChannel.prototype.receive = function (blockUntilReceived) {
              if (typeof blockUntilReceived === "undefined") { blockUntilReceived = false; }
              blockUntilReceived = !!blockUntilReceived;
              notImplemented("public flash.system.MessageChannel::receive");
              return;
            };
            MessageChannel.prototype.close = function () {
              notImplemented("public flash.system.MessageChannel::close");
              return;
            };
            MessageChannel.classInitializer = null;

            MessageChannel.initializer = null;

            MessageChannel.classSymbols = null;

            MessageChannel.instanceSymbols = null;
            return MessageChannel;
          })(flash.events.EventDispatcher);
          system.MessageChannel = MessageChannel;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;

          var MessageChannelState = (function (_super) {
            __extends(MessageChannelState, _super);
            function MessageChannelState() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.system.MessageChannelState");
            }
            MessageChannelState.classInitializer = null;

            MessageChannelState.initializer = null;

            MessageChannelState.classSymbols = null;

            MessageChannelState.instanceSymbols = null;

            MessageChannelState.OPEN = "open";
            MessageChannelState.CLOSING = "closing";
            MessageChannelState.CLOSED = "closed";
            return MessageChannelState;
          })(AS.ASNative);
          system.MessageChannelState = MessageChannelState;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;

          var Security = (function (_super) {
            __extends(Security, _super);
            function Security() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.system.Security");
            }
            Object.defineProperty(Security, "exactSettings", {
              get: function () {
                return Security._exactSettings;
              },
              set: function (value) {
                value = !!value;
                Security._exactSettings = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Security, "disableAVM1Loading", {
              get: function () {
                notImplemented("public flash.system.Security::get disableAVM1Loading");
                return;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.system.Security::set disableAVM1Loading");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Security, "sandboxType", {
              get: function () {
                somewhatImplemented("public flash.system.Security::get sandboxType");
                return Security._sandboxType;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Security, "pageDomain", {
              get: function () {
                somewhatImplemented("public flash.system.Security::get pageDomain");
                var pageHost = Shumway.FileLoadingService.instance.resolveUrl('/');
                var parts = pageHost.split('/');
                parts.pop();
                return parts.pop();
              },
              enumerable: true,
              configurable: true
            });
            Security.allowDomain = function () {
              somewhatImplemented("public flash.system.Security::static allowDomain [\"" + Array.prototype.join.call(arguments, "\", \"") + "\"]");
            };
            Security.allowInsecureDomain = function () {
              somewhatImplemented("public flash.system.Security::static allowInsecureDomain");
            };
            Security.loadPolicyFile = function (url) {
              url = asCoerceString(url);
              somewhatImplemented("public flash.system.Security::static loadPolicyFile");
            };
            Security.showSettings = function (panel) {
              if (typeof panel === "undefined") { panel = "default"; }
              panel = asCoerceString(panel);
              notImplemented("public flash.system.Security::static showSettings");
              return;
            };
            Security.duplicateSandboxBridgeInputArguments = function (toplevel, args) {
              toplevel = toplevel;
              args = args;
              notImplemented("public flash.system.Security::static duplicateSandboxBridgeInputArguments");
              return;
            };
            Security.duplicateSandboxBridgeOutputArgument = function (toplevel, arg) {
              toplevel = toplevel;
              notImplemented("public flash.system.Security::static duplicateSandboxBridgeOutputArgument");
              return;
            };
            Security.classInitializer = null;

            Security.initializer = null;

            Security.classSymbols = null;

            Security.instanceSymbols = null;

            Security.REMOTE = "remote";
            Security.LOCAL_WITH_FILE = "localWithFile";
            Security.LOCAL_WITH_NETWORK = "localWithNetwork";
            Security.LOCAL_TRUSTED = "localTrusted";
            Security.APPLICATION = "application";

            Security._exactSettings = false;

            Security._sandboxType = 'remote';
            return Security;
          })(AS.ASNative);
          system.Security = Security;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;

          var SecurityDomain = (function (_super) {
            __extends(SecurityDomain, _super);
            function SecurityDomain() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.system.SecurityDomain");
            }
            Object.defineProperty(SecurityDomain.prototype, "currentDomain", {
              get: function () {
                notImplemented("public flash.system.SecurityDomain::get currentDomain");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(SecurityDomain.prototype, "domainID", {
              get: function () {
                notImplemented("public flash.system.SecurityDomain::get domainID");
                return;
              },
              enumerable: true,
              configurable: true
            });
            SecurityDomain.classInitializer = null;

            SecurityDomain.initializer = null;

            SecurityDomain.classSymbols = null;

            SecurityDomain.instanceSymbols = null;
            return SecurityDomain;
          })(AS.ASNative);
          system.SecurityDomain = SecurityDomain;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;

          var SecurityPanel = (function (_super) {
            __extends(SecurityPanel, _super);
            function SecurityPanel() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.system.SecurityPanel");
            }
            SecurityPanel.classInitializer = null;

            SecurityPanel.initializer = null;

            SecurityPanel.classSymbols = null;

            SecurityPanel.instanceSymbols = null;

            SecurityPanel.DEFAULT = "default";
            SecurityPanel.PRIVACY = "privacy";
            SecurityPanel.LOCAL_STORAGE = "localStorage";
            SecurityPanel.MICROPHONE = "microphone";
            SecurityPanel.CAMERA = "camera";
            SecurityPanel.DISPLAY = "display";
            SecurityPanel.SETTINGS_MANAGER = "settingsManager";
            return SecurityPanel;
          })(AS.ASNative);
          system.SecurityPanel = SecurityPanel;
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
    (function (AS) {
      (function (flash) {
        (function (system) {
          var notImplemented = Shumway.Debug.notImplemented;

          var TouchscreenType = (function (_super) {
            __extends(TouchscreenType, _super);
            function TouchscreenType() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.system.TouchscreenType");
            }
            TouchscreenType.classInitializer = null;

            TouchscreenType.initializer = null;

            TouchscreenType.classSymbols = null;

            TouchscreenType.instanceSymbols = null;

            TouchscreenType.FINGER = "finger";
            TouchscreenType.STYLUS = "stylus";
            TouchscreenType.NONE = "none";
            return TouchscreenType;
          })(AS.ASNative);
          system.TouchscreenType = TouchscreenType;
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
    (function (AS) {
      (function (flash) {
        (function (text) {
          var AntiAliasType = (function (_super) {
            __extends(AntiAliasType, _super);
            function AntiAliasType() {
              _super.call(this);
            }
            AntiAliasType.fromNumber = function (n) {
              switch (n) {
                case 1:
                  return AntiAliasType.NORMAL;
                case 2:
                  return AntiAliasType.ADVANCED;
                default:
                  return null;
              }
            };

            AntiAliasType.toNumber = function (value) {
              switch (value) {
                case AntiAliasType.NORMAL:
                  return 1;
                case AntiAliasType.ADVANCED:
                  return 2;
                default:
                  return -1;
              }
            };
            AntiAliasType.classInitializer = null;
            AntiAliasType.initializer = null;
            AntiAliasType.classSymbols = null;
            AntiAliasType.instanceSymbols = null;

            AntiAliasType.NORMAL = "normal";
            AntiAliasType.ADVANCED = "advanced";
            return AntiAliasType;
          })(AS.ASNative);
          text.AntiAliasType = AntiAliasType;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var FontStyle = (function (_super) {
            __extends(FontStyle, _super);
            function FontStyle() {
              _super.call(this);
            }
            FontStyle.classInitializer = null;
            FontStyle.initializer = null;
            FontStyle.classSymbols = null;
            FontStyle.instanceSymbols = null;

            FontStyle.REGULAR = "regular";
            FontStyle.BOLD = "bold";
            FontStyle.ITALIC = "italic";
            FontStyle.BOLD_ITALIC = "boldItalic";
            return FontStyle;
          })(AS.ASNative);
          text.FontStyle = FontStyle;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var FontType = (function (_super) {
            __extends(FontType, _super);
            function FontType() {
              _super.call(this);
            }
            FontType.classInitializer = null;
            FontType.initializer = null;
            FontType.classSymbols = null;
            FontType.instanceSymbols = null;

            FontType.EMBEDDED = "embedded";
            FontType.EMBEDDED_CFF = "embeddedCFF";
            FontType.DEVICE = "device";
            return FontType;
          })(AS.ASNative);
          text.FontType = FontType;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var FontStyle = flash.text.FontStyle;
          var FontType = flash.text.FontType;

          var Font = (function (_super) {
            __extends(Font, _super);
            function Font() {
              false && _super.call(this);
            }
            Font._getFontMetrics = function (name) {
              if (!this._deviceFontMetrics) {
                var userAgent = self.navigator.userAgent;
                if (userAgent.indexOf("Windows") > -1) {
                  this._deviceFontMetrics = Font.DEVICE_FONT_METRICS_WIN;
                } else if (/(Macintosh|iPad|iPhone|iPod|Android)/.test(userAgent)) {
                  this._deviceFontMetrics = this.DEVICE_FONT_METRICS_MAC;
                } else {
                  this._deviceFontMetrics = this.DEVICE_FONT_METRICS_LINUX;
                }
              }
              return this._deviceFontMetrics[Font.resolveFontName(name)];
            };

            Font.resolveFontName = function (name) {
              if (name === '_sans') {
                return 'sans-serif';
              } else if (name === '_serif') {
                return 'serif';
              } else if (name === '_typewriter') {
                return 'monospace';
              }
              return name;
            };

            Font.getBySymbolId = function (id) {
              return this._fontsBySymbolId[id];
            };

            Font.getByName = function (name) {
              name = name.toLowerCase();
              var font = this._fontsByName[name];
              if (!font) {
                var font = new Font();
                font._fontName = name;
                font._fontStyle = FontStyle.REGULAR;
                font._fontType = FontType.DEVICE;
                this._fontsByName[name] = font;
              }
              if (font._fontType === FontType.DEVICE) {
                var metrics = Font._getFontMetrics(name);
                if (metrics) {
                  font.ascent = metrics[0];
                  font.descent = metrics[1];
                  font.leading = metrics[2];
                }
              }
              return font;
            };

            Font.getDefaultFont = function () {
              return Font.getByName('times roman');
            };

            Font.enumerateFonts = function (enumerateDeviceFonts) {
              if (typeof enumerateDeviceFonts === "undefined") { enumerateDeviceFonts = false; }
              somewhatImplemented("public flash.text.Font::static enumerateFonts");
              return Font._fonts.slice();
            };

            Font.registerFont = function (font) {
              somewhatImplemented('Font.registerFont');
            };

            Object.defineProperty(Font.prototype, "fontName", {
              get: function () {
                return this._fontName;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Font.prototype, "fontStyle", {
              get: function () {
                return this._fontStyle;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(Font.prototype, "fontType", {
              get: function () {
                return this._fontType;
              },
              enumerable: true,
              configurable: true
            });

            Font.prototype.hasGlyphs = function (str) {
              str = asCoerceString(str);
              somewhatImplemented('Font#hasGlyphs');
              return true;
            };
            Font.classInitializer = function () {
              Font._fonts = [];
              Font._fontsBySymbolId = Shumway.ObjectUtilities.createMap();
              Font._fontsByName = Shumway.ObjectUtilities.createMap();

              Font.DEVICE_FONT_METRICS_WIN = {
                "serif": [1, 0.25, 0],
                "sans-serif": [1, 0.25, 0],
                "monospace": [1, 0.25, 0],
                "birch std": [0.9167, 0.25, 0],
                "blackoak std": [1, 0.3333, 0],
                "chaparral pro": [0.8333, 0.3333, 0],
                "chaparral pro light": [0.8333, 0.3333, 0],
                "charlemagne std": [0.9167, 0.25, 0],
                "cooper std black": [0.9167, 0.25, 0],
                "giddyup std": [0.8333, 0.3333, 0],
                "hobo std": [1.0833, 0.3333, 0],
                "kozuka gothic pro b": [1, 0.4167, 0],
                "kozuka gothic pro el": [1.0833, 0.25, 0],
                "kozuka gothic pro h": [1, 0.4167, 0],
                "kozuka gothic pro l": [1, 0.3333, 0],
                "kozuka gothic pro m": [1.0833, 0.3333, 0],
                "kozuka gothic pro r": [1, 0.3333, 0],
                "kozuka mincho pro b": [1.0833, 0.25, 0],
                "kozuka mincho pro el": [1.0833, 0.25, 0],
                "kozuka mincho pro h": [1.1667, 0.25, 0],
                "kozuka mincho pro l": [1.0833, 0.25, 0],
                "kozuka mincho pro m": [1.0833, 0.25, 0],
                "kozuka mincho pro r": [1.0833, 0.25, 0],
                "mesquite std": [0.9167, 0.25, 0],
                "minion pro cond": [1, 0.3333, 0],
                "minion pro med": [1, 0.3333, 0],
                "minion pro smbd": [1, 0.3333, 0],
                "myriad arabic": [1, 0.4167, 0],
                "nueva std": [0.75, 0.25, 0],
                "nueva std cond": [0.75, 0.25, 0],
                "ocr a std": [0.8333, 0.25, 0],
                "orator std": [1.0833, 0.25, 0],
                "poplar std": [0.9167, 0.25, 0],
                "prestige elite std": [0.9167, 0.25, 0],
                "rosewood std regular": [0.8333, 0.3333, 0],
                "stencil std": [1, 0.3333, 0],
                "trajan pro": [1, 0.25, 0],
                "kozuka gothic pr6n b": [1.4167, 0.4167, 0],
                "kozuka gothic pr6n el": [1.4167, 0.3333, 0],
                "kozuka gothic pr6n h": [1.4167, 0.4167, 0],
                "kozuka gothic pr6n l": [1.4167, 0.3333, 0],
                "kozuka gothic pr6n m": [1.5, 0.3333, 0],
                "kozuka gothic pr6n r": [1.4167, 0.3333, 0],
                "kozuka mincho pr6n b": [1.3333, 0.3333, 0],
                "kozuka mincho pr6n el": [1.3333, 0.3333, 0],
                "kozuka mincho pr6n h": [1.4167, 0.3333, 0],
                "kozuka mincho pr6n l": [1.3333, 0.3333, 0],
                "kozuka mincho pr6n m": [1.3333, 0.3333, 0],
                "kozuka mincho pr6n r": [1.3333, 0.3333, 0],
                "letter gothic std": [1, 0.25, 0],
                "minion pro": [1, 0.3333, 0],
                "myriad hebrew": [0.8333, 0.3333, 0],
                "myriad pro": [0.9167, 0.25, 0],
                "myriad pro cond": [0.9167, 0.25, 0],
                "myriad pro light": [1, 0.25, 0],
                "marlett": [1, 0, 0],
                "arial": [1, 0.25, 0],
                "arabic transparent": [1, 0.25, 0],
                "arial baltic": [1, 0.25, 0],
                "arial ce": [1, 0.25, 0],
                "arial cyr": [1, 0.25, 0],
                "arial greek": [1, 0.25, 0],
                "arial tur": [1, 0.25, 0],
                "batang": [0.8333, 0.1667, 0],
                "batangche": [0.8333, 0.1667, 0],
                "gungsuh": [0.8333, 0.1667, 0],
                "gungsuhche": [0.8333, 0.1667, 0],
                "courier new": [1, 0.25, 0],
                "courier new baltic": [1, 0.25, 0],
                "courier new ce": [1, 0.25, 0],
                "courier new cyr": [1, 0.25, 0],
                "courier new greek": [1, 0.25, 0],
                "courier new tur": [1, 0.25, 0],
                "daunpenh": [0.6667, 0.6667, 0],
                "dokchampa": [1.4167, 0.5833, 0],
                "estrangelo edessa": [0.75, 0.3333, 0],
                "euphemia": [1.0833, 0.3333, 0],
                "gautami": [1.1667, 0.8333, 0],
                "vani": [1.0833, 0.75, 0],
                "gulim": [0.8333, 0.1667, 0],
                "gulimche": [0.8333, 0.1667, 0],
                "dotum": [0.8333, 0.1667, 0],
                "dotumche": [0.8333, 0.1667, 0],
                "impact": [1.0833, 0.25, 0],
                "iskoola pota": [1, 0.3333, 0],
                "kalinga": [1.0833, 0.5, 0],
                "kartika": [1, 0.4167, 0],
                "khmer ui": [1.0833, 0.3333, 0],
                "lao ui": [1, 0.25, 0],
                "latha": [1.0833, 0.4167, 0],
                "lucida console": [0.75, 0.25, 0],
                "malgun gothic": [1, 0.25, 0],
                "mangal": [1.0833, 0.3333, 0],
                "meiryo": [1.0833, 0.4167, 0],
                "meiryo ui": [1, 0.25, 0],
                "microsoft himalaya": [0.5833, 0.4167, 0],
                "microsoft jhenghei": [1, 0.3333, 0],
                "microsoft yahei": [1.0833, 0.3333, 0],
                "mingliu": [0.8333, 0.1667, 0],
                "pmingliu": [0.8333, 0.1667, 0],
                "mingliu_hkscs": [0.8333, 0.1667, 0],
                "mingliu-extb": [0.8333, 0.1667, 0],
                "pmingliu-extb": [0.8333, 0.1667, 0],
                "mingliu_hkscs-extb": [0.8333, 0.1667, 0],
                "mongolian baiti": [0.8333, 0.25, 0],
                "ms gothic": [0.8333, 0.1667, 0],
                "ms pgothic": [0.8333, 0.1667, 0],
                "ms ui gothic": [0.8333, 0.1667, 0],
                "ms mincho": [0.8333, 0.1667, 0],
                "ms pmincho": [0.8333, 0.1667, 0],
                "mv boli": [1.1667, 0.25, 0],
                "microsoft new tai lue": [1, 0.4167, 0],
                "nyala": [0.9167, 0.3333, 0],
                "microsoft phagspa": [1.0833, 0.25, 0],
                "plantagenet cherokee": [1, 0.4167, 0],
                "raavi": [1.0833, 0.6667, 0],
                "segoe script": [1.0833, 0.5, 0],
                "segoe ui": [1, 0.25, 0],
                "segoe ui semibold": [1, 0.25, 0],
                "segoe ui light": [1, 0.25, 0],
                "segoe ui symbol": [1, 0.25, 0],
                "shruti": [1.0833, 0.5, 0],
                "simsun": [0.8333, 0.1667, 0],
                "nsimsun": [0.8333, 0.1667, 0],
                "simsun-extb": [0.8333, 0.1667, 0],
                "sylfaen": [1, 0.3333, 0],
                "microsoft tai le": [1, 0.3333, 0],
                "times new roman": [1, 0.25, 0],
                "times new roman baltic": [1, 0.25, 0],
                "times new roman ce": [1, 0.25, 0],
                "times new roman cyr": [1, 0.25, 0],
                "times new roman greek": [1, 0.25, 0],
                "times new roman tur": [1, 0.25, 0],
                "tunga": [1.0833, 0.75, 0],
                "vrinda": [1, 0.4167, 0],
                "shonar bangla": [0.8333, 0.5, 0],
                "microsoft yi baiti": [0.8333, 0.1667, 0],
                "tahoma": [1, 0.1667, 0],
                "microsoft sans serif": [1.0833, 0.1667, 0],
                "angsana new": [0.9167, 0.4167, 0],
                "aparajita": [0.75, 0.4167, 0],
                "cordia new": [0.9167, 0.5, 0],
                "ebrima": [1.0833, 0.5, 0],
                "gisha": [0.9167, 0.25, 0],
                "kokila": [0.8333, 0.3333, 0],
                "leelawadee": [0.9167, 0.25, 0],
                "microsoft uighur": [1.0833, 0.5, 0],
                "moolboran": [0.6667, 0.6667, 0],
                "symbol": [1, 0.25, 0],
                "utsaah": [0.8333, 0.4167, 0],
                "vijaya": [1.0833, 0.25, 0],
                "wingdings": [0.9167, 0.25, 0],
                "andalus": [1.3333, 0.4167, 0],
                "arabic typesetting": [0.8333, 0.5, 0],
                "simplified arabic": [1.3333, 0.5, 0],
                "simplified arabic fixed": [1, 0.4167, 0],
                "sakkal majalla": [0.9167, 0.5, 0],
                "traditional arabic": [1.3333, 0.5, 0],
                "aharoni": [0.75, 0.25, 0],
                "david": [0.75, 0.25, 0],
                "frankruehl": [0.75, 0.25, 0],
                "fangsong": [0.8333, 0.1667, 0],
                "simhei": [0.8333, 0.1667, 0],
                "kaiti": [0.8333, 0.1667, 0],
                "browallia new": [0.8333, 0.4167, 0],
                "lucida sans unicode": [1.0833, 0.25, 0],
                "arial black": [1.0833, 0.3333, 0],
                "calibri": [0.9167, 0.25, 0],
                "cambria": [0.9167, 0.25, 0],
                "cambria math": [3.0833, 2.5, 0],
                "candara": [0.9167, 0.25, 0],
                "comic sans ms": [1.0833, 0.3333, 0],
                "consolas": [0.9167, 0.25, 0],
                "constantia": [0.9167, 0.25, 0],
                "corbel": [0.9167, 0.25, 0],
                "franklin gothic medium": [1, 0.3333, 0],
                "gabriola": [1.1667, 0.6667, 0],
                "georgia": [1, 0.25, 0],
                "palatino linotype": [1.0833, 0.3333, 0],
                "segoe print": [1.25, 0.5, 0],
                "trebuchet ms": [1.0833, 0.4167, 0],
                "verdana": [1, 0.1667, 0],
                "webdings": [1.0833, 0.5, 0],
                "lucida bright": [0.9167, 0.25, 0],
                "lucida sans": [0.9167, 0.25, 0],
                "lucida sans typewriter": [0.9167, 0.25, 0],
                "gentium basic": [0.8333, 0.25, 0],
                "dejavu serif condensed": [0.9167, 0.25, 0],
                "arimo": [1, 0.25, 0],
                "dejavu sans condensed": [0.9167, 0.25, 0],
                "dejavu sans": [0.9167, 0.25, 0],
                "dejavu sans light": [0.9167, 0.25, 0],
                "opensymbol": [0.8333, 0.1667, 0],
                "gentium book basic": [0.8333, 0.25, 0],
                "dejavu sans mono": [0.9167, 0.25, 0],
                "dejavu serif": [0.9167, 0.25, 0],
                "calibri light": [0.9167, 0.25, 0]
              };
              Font.DEVICE_FONT_METRICS_MAC = {
                "al bayan plain": [1, 0.5, 0],
                "al bayan bold": [1, 0.5833, 0],
                "american typewriter": [0.9167, 0.25, 0],
                "american typewriter bold": [0.9167, 0.25, 0],
                "american typewriter condensed": [0.9167, 0.25, 0],
                "american typewriter condensed bold": [0.9167, 0.25, 0],
                "american typewriter condensed light": [0.8333, 0.25, 0],
                "american typewriter light": [0.9167, 0.25, 0],
                "andale mono": [0.9167, 0.25, 0],
                "apple symbols": [0.6667, 0.25, 0],
                "arial bold italic": [0.9167, 0.25, 0],
                "arial bold": [0.9167, 0.25, 0],
                "arial italic": [0.9167, 0.25, 0],
                "arial hebrew": [0.75, 0.3333, 0],
                "arial hebrew bold": [0.75, 0.3333, 0],
                "arial": [0.9167, 0.25, 0],
                "arial narrow": [0.9167, 0.25, 0],
                "arial narrow bold": [0.9167, 0.25, 0],
                "arial narrow bold italic": [0.9167, 0.25, 0],
                "arial narrow italic": [0.9167, 0.25, 0],
                "arial rounded mt bold": [0.9167, 0.25, 0],
                "arial unicode ms": [1.0833, 0.25, 0],
                "avenir black": [1, 0.3333, 0],
                "avenir black oblique": [1, 0.3333, 0],
                "avenir book": [1, 0.3333, 0],
                "avenir book oblique": [1, 0.3333, 0],
                "avenir heavy": [1, 0.3333, 0],
                "avenir heavy oblique": [1, 0.3333, 0],
                "avenir light": [1, 0.3333, 0],
                "avenir light oblique": [1, 0.3333, 0],
                "avenir medium": [1, 0.3333, 0],
                "avenir medium oblique": [1, 0.3333, 0],
                "avenir oblique": [1, 0.3333, 0],
                "avenir roman": [1, 0.3333, 0],
                "avenir next bold": [1, 0.3333, 0],
                "avenir next bold italic": [1, 0.3333, 0],
                "avenir next demi bold": [1, 0.3333, 0],
                "avenir next demi bold italic": [1, 0.3333, 0],
                "avenir next heavy": [1, 0.3333, 0],
                "avenir next heavy italic": [1, 0.3333, 0],
                "avenir next italic": [1, 0.3333, 0],
                "avenir next medium": [1, 0.3333, 0],
                "avenir next medium italic": [1, 0.3333, 0],
                "avenir next regular": [1, 0.3333, 0],
                "avenir next ultra light": [1, 0.3333, 0],
                "avenir next ultra light italic": [1, 0.3333, 0],
                "avenir next condensed bold": [1, 0.3333, 0],
                "avenir next condensed bold italic": [1, 0.3333, 0],
                "avenir next condensed demi bold": [1, 0.3333, 0],
                "avenir next condensed demi bold italic": [1, 0.3333, 0],
                "avenir next condensed heavy": [1, 0.3333, 0],
                "avenir next condensed heavy italic": [1, 0.3333, 0],
                "avenir next condensed italic": [1, 0.3333, 0],
                "avenir next condensed medium": [1, 0.3333, 0],
                "avenir next condensed medium italic": [1, 0.3333, 0],
                "avenir next condensed regular": [1, 0.3333, 0],
                "avenir next condensed ultra light": [1, 0.3333, 0],
                "avenir next condensed ultra light italic": [1, 0.3333, 0],
                "ayuthaya": [1.0833, 0.3333, 0],
                "baghdad": [0.9167, 0.4167, 0],
                "bangla mn": [0.9167, 0.6667, 0],
                "bangla mn bold": [0.9167, 0.6667, 0],
                "bangla sangam mn": [0.9167, 0.4167, 0],
                "bangla sangam mn bold": [0.9167, 0.4167, 0],
                "baskerville": [0.9167, 0.25, 0],
                "baskerville bold": [0.9167, 0.25, 0],
                "baskerville bold italic": [0.9167, 0.25, 0],
                "baskerville italic": [0.9167, 0.25, 0],
                "baskerville semibold": [0.9167, 0.25, 0],
                "baskerville semibold italic": [0.9167, 0.25, 0],
                "big caslon medium": [0.9167, 0.25, 0],
                "brush script mt italic": [0.9167, 0.3333, 0],
                "chalkboard": [1, 0.25, 0],
                "chalkboard bold": [1, 0.25, 0],
                "chalkboard se bold": [1.1667, 0.25, 0],
                "chalkboard se light": [1.1667, 0.25, 0],
                "chalkboard se regular": [1.1667, 0.25, 0],
                "chalkduster": [1, 0.25, 0],
                "charcoal cy": [1, 0.25, 0],
                "cochin": [0.9167, 0.25, 0],
                "cochin bold": [0.9167, 0.25, 0],
                "cochin bold italic": [0.9167, 0.25, 0],
                "cochin italic": [0.9167, 0.25, 0],
                "comic sans ms": [1.0833, 0.25, 0],
                "comic sans ms bold": [1.0833, 0.25, 0],
                "copperplate": [0.75, 0.25, 0],
                "copperplate bold": [0.75, 0.25, 0],
                "copperplate light": [0.75, 0.25, 0],
                "corsiva hebrew": [0.6667, 0.3333, 0],
                "corsiva hebrew bold": [0.6667, 0.3333, 0],
                "courier": [0.75, 0.25, 0],
                "courier bold": [0.75, 0.25, 0],
                "courier bold oblique": [0.75, 0.25, 0],
                "courier oblique": [0.75, 0.25, 0],
                "courier new bold italic": [0.8333, 0.3333, 0],
                "courier new bold": [0.8333, 0.3333, 0],
                "courier new italic": [0.8333, 0.3333, 0],
                "courier new": [0.8333, 0.3333, 0],
                "biaukai": [0.8333, 0.1667, 0],
                "damascus": [0.5833, 0.4167, 0],
                "damascus bold": [0.5833, 0.4167, 0],
                "decotype naskh": [1.1667, 0.6667, 0],
                "devanagari mt": [0.9167, 0.6667, 0],
                "devanagari mt bold": [0.9167, 0.6667, 0],
                "devanagari sangam mn": [0.9167, 0.4167, 0],
                "devanagari sangam mn bold": [0.9167, 0.4167, 0],
                "didot": [0.9167, 0.3333, 0],
                "didot bold": [1, 0.3333, 0],
                "didot italic": [0.9167, 0.25, 0],
                "euphemia ucas": [1.0833, 0.25, 0],
                "euphemia ucas bold": [1.0833, 0.25, 0],
                "euphemia ucas italic": [1.0833, 0.25, 0],
                "futura condensed extrabold": [1, 0.25, 0],
                "futura condensed medium": [1, 0.25, 0],
                "futura medium": [1, 0.25, 0],
                "futura medium italic": [1, 0.25, 0],
                "gb18030 bitmap": [1, 0.6667, 0],
                "geeza pro": [0.9167, 0.3333, 0],
                "geeza pro bold": [0.9167, 0.3333, 0],
                "geneva": [1, 0.25, 0],
                "geneva cy": [1, 0.25, 0],
                "georgia": [0.9167, 0.25, 0],
                "georgia bold": [0.9167, 0.25, 0],
                "georgia bold italic": [0.9167, 0.25, 0],
                "georgia italic": [0.9167, 0.25, 0],
                "gill sans": [0.9167, 0.25, 0],
                "gill sans bold": [0.9167, 0.25, 0],
                "gill sans bold italic": [0.9167, 0.25, 0],
                "gill sans italic": [0.9167, 0.25, 0],
                "gill sans light": [0.9167, 0.25, 0],
                "gill sans light italic": [0.9167, 0.25, 0],
                "gujarati mt": [0.9167, 0.6667, 0],
                "gujarati mt bold": [0.9167, 0.6667, 0],
                "gujarati sangam mn": [0.8333, 0.4167, 0],
                "gujarati sangam mn bold": [0.8333, 0.4167, 0],
                "gurmukhi mn": [0.9167, 0.25, 0],
                "gurmukhi mn bold": [0.9167, 0.25, 0],
                "gurmukhi sangam mn": [0.9167, 0.3333, 0],
                "gurmukhi sangam mn bold": [0.9167, 0.3333, 0],
                "helvetica": [0.75, 0.25, 0],
                "helvetica bold": [0.75, 0.25, 0],
                "helvetica bold oblique": [0.75, 0.25, 0],
                "helvetica light": [0.75, 0.25, 0],
                "helvetica light oblique": [0.75, 0.25, 0],
                "helvetica oblique": [0.75, 0.25, 0],
                "helvetica neue": [0.9167, 0.25, 0],
                "helvetica neue bold": [1, 0.25, 0],
                "helvetica neue bold italic": [1, 0.25, 0],
                "helvetica neue condensed black": [1, 0.25, 0],
                "helvetica neue condensed bold": [1, 0.25, 0],
                "helvetica neue italic": [0.9167, 0.25, 0],
                "helvetica neue light": [1, 0.25, 0],
                "helvetica neue light italic": [0.9167, 0.25, 0],
                "helvetica neue medium": [1, 0.25, 0],
                "helvetica neue ultralight": [0.9167, 0.25, 0],
                "helvetica neue ultralight italic": [0.9167, 0.25, 0],
                "herculanum": [0.8333, 0.1667, 0],
                "hiragino kaku gothic pro w3": [0.9167, 0.0833, 0],
                "hiragino kaku gothic pro w6": [0.9167, 0.0833, 0],
                "hiragino kaku gothic pron w3": [0.9167, 0.0833, 0],
                "hiragino kaku gothic pron w6": [0.9167, 0.0833, 0],
                "hiragino kaku gothic std w8": [0.9167, 0.0833, 0],
                "hiragino kaku gothic stdn w8": [0.9167, 0.0833, 0],
                "hiragino maru gothic pro w4": [0.9167, 0.0833, 0],
                "hiragino maru gothic pron w4": [0.9167, 0.0833, 0],
                "hiragino mincho pro w3": [0.9167, 0.0833, 0],
                "hiragino mincho pro w6": [0.9167, 0.0833, 0],
                "hiragino mincho pron w3": [0.9167, 0.0833, 0],
                "hiragino mincho pron w6": [0.9167, 0.0833, 0],
                "hiragino sans gb w3": [0.9167, 0.0833, 0],
                "hiragino sans gb w6": [0.9167, 0.0833, 0],
                "hoefler text black": [0.75, 0.25, 0],
                "hoefler text black italic": [0.75, 0.25, 0],
                "hoefler text italic": [0.75, 0.25, 0],
                "hoefler text ornaments": [0.8333, 0.1667, 0],
                "hoefler text": [0.75, 0.25, 0],
                "impact": [1, 0.25, 0],
                "inaimathi": [0.8333, 0.4167, 0],
                "headlinea regular": [0.8333, 0.1667, 0],
                "pilgi regular": [0.8333, 0.25, 0],
                "gungseo regular": [0.8333, 0.25, 0],
                "pcmyungjo regular": [0.8333, 0.25, 0],
                "kailasa regular": [1.0833, 0.5833, 0],
                "kannada mn": [0.9167, 0.25, 0],
                "kannada mn bold": [0.9167, 0.25, 0],
                "kannada sangam mn": [1, 0.5833, 0],
                "kannada sangam mn bold": [1, 0.5833, 0],
                "kefa bold": [0.9167, 0.25, 0],
                "kefa regular": [0.9167, 0.25, 0],
                "khmer mn": [1, 0.6667, 0],
                "khmer mn bold": [1, 0.6667, 0],
                "khmer sangam mn": [1.0833, 0.6667, 0],
                "kokonor regular": [1.0833, 0.5833, 0],
                "krungthep": [1, 0.25, 0],
                "kufistandardgk": [0.9167, 0.5, 0],
                "lao mn": [0.9167, 0.4167, 0],
                "lao mn bold": [0.9167, 0.4167, 0],
                "lao sangam mn": [1, 0.3333, 0],
                "apple ligothic medium": [0.8333, 0.1667, 0],
                "lihei pro": [0.8333, 0.1667, 0],
                "lisong pro": [0.8333, 0.1667, 0],
                "lucida grande": [1, 0.25, 0],
                "lucida grande bold": [1, 0.25, 0],
                "malayalam mn": [1, 0.4167, 0],
                "malayalam mn bold": [1, 0.4167, 0],
                "malayalam sangam mn": [0.8333, 0.4167, 0],
                "malayalam sangam mn bold": [0.8333, 0.4167, 0],
                "marion bold": [0.6667, 0.3333, 0],
                "marion italic": [0.6667, 0.3333, 0],
                "marion regular": [0.6667, 0.3333, 0],
                "marker felt thin": [0.8333, 0.25, 0],
                "marker felt wide": [0.9167, 0.25, 0],
                "menlo bold": [0.9167, 0.25, 0],
                "menlo bold italic": [0.9167, 0.25, 0],
                "menlo italic": [0.9167, 0.25, 0],
                "menlo regular": [0.9167, 0.25, 0],
                "microsoft sans serif": [0.9167, 0.25, 0],
                "monaco": [1, 0.25, 0],
                "gurmukhi mt": [0.8333, 0.4167, 0],
                "mshtakan": [0.9167, 0.25, 0],
                "mshtakan bold": [0.9167, 0.25, 0],
                "mshtakan boldoblique": [0.9167, 0.25, 0],
                "mshtakan oblique": [0.9167, 0.25, 0],
                "myanmar mn": [1, 0.4167, 0],
                "myanmar mn bold": [1, 0.4167, 0],
                "myanmar sangam mn": [0.9167, 0.4167, 0],
                "nadeem": [0.9167, 0.4167, 0],
                "nanum brush script": [0.9167, 0.25, 0],
                "nanumgothic": [0.9167, 0.25, 0],
                "nanumgothic bold": [0.9167, 0.25, 0],
                "nanumgothic extrabold": [0.9167, 0.25, 0],
                "nanummyeongjo": [0.9167, 0.25, 0],
                "nanummyeongjo bold": [0.9167, 0.25, 0],
                "nanummyeongjo extrabold": [0.9167, 0.25, 0],
                "nanum pen script": [0.9167, 0.25, 0],
                "optima bold": [0.9167, 0.25, 0],
                "optima bold italic": [0.9167, 0.25, 0],
                "optima extrablack": [1, 0.25, 0],
                "optima italic": [0.9167, 0.25, 0],
                "optima regular": [0.9167, 0.25, 0],
                "oriya mn": [0.9167, 0.25, 0],
                "oriya mn bold": [0.9167, 0.25, 0],
                "oriya sangam mn": [0.8333, 0.4167, 0],
                "oriya sangam mn bold": [0.8333, 0.4167, 0],
                "osaka": [1, 0.25, 0],
                "osaka-mono": [0.8333, 0.1667, 0],
                "palatino bold": [0.8333, 0.25, 0],
                "palatino bold italic": [0.8333, 0.25, 0],
                "palatino italic": [0.8333, 0.25, 0],
                "palatino": [0.8333, 0.25, 0],
                "papyrus": [0.9167, 0.5833, 0],
                "papyrus condensed": [0.9167, 0.5833, 0],
                "plantagenet cherokee": [0.6667, 0.25, 0],
                "raanana": [0.75, 0.25, 0],
                "raanana bold": [0.75, 0.25, 0],
                "hei regular": [0.8333, 0.1667, 0],
                "kai regular": [0.8333, 0.1667, 0],
                "stfangsong": [0.8333, 0.1667, 0],
                "stheiti": [0.8333, 0.1667, 0],
                "heiti sc light": [0.8333, 0.1667, 0],
                "heiti sc medium": [0.8333, 0.1667, 0],
                "heiti tc light": [0.8333, 0.1667, 0],
                "heiti tc medium": [0.8333, 0.1667, 0],
                "stkaiti": [0.8333, 0.1667, 0],
                "kaiti sc black": [1.0833, 0.3333, 0],
                "kaiti sc bold": [1.0833, 0.3333, 0],
                "kaiti sc regular": [1.0833, 0.3333, 0],
                "stsong": [0.8333, 0.1667, 0],
                "songti sc black": [1.0833, 0.3333, 0],
                "songti sc bold": [1.0833, 0.3333, 0],
                "songti sc light": [1.0833, 0.3333, 0],
                "songti sc regular": [1.0833, 0.3333, 0],
                "stxihei": [0.8333, 0.1667, 0],
                "sathu": [0.9167, 0.3333, 0],
                "silom": [1, 0.3333, 0],
                "sinhala mn": [0.9167, 0.25, 0],
                "sinhala mn bold": [0.9167, 0.25, 0],
                "sinhala sangam mn": [1.1667, 0.3333, 0],
                "sinhala sangam mn bold": [1.1667, 0.3333, 0],
                "skia regular": [0.75, 0.25, 0],
                "symbol": [0.6667, 0.3333, 0],
                "tahoma negreta": [1, 0.1667, 0],
                "tamil mn": [0.9167, 0.25, 0],
                "tamil mn bold": [0.9167, 0.25, 0],
                "tamil sangam mn": [0.75, 0.25, 0],
                "tamil sangam mn bold": [0.75, 0.25, 0],
                "telugu mn": [0.9167, 0.25, 0],
                "telugu mn bold": [0.9167, 0.25, 0],
                "telugu sangam mn": [1, 0.5833, 0],
                "telugu sangam mn bold": [1, 0.5833, 0],
                "thonburi": [1.0833, 0.25, 0],
                "thonburi bold": [1.0833, 0.25, 0],
                "times bold": [0.75, 0.25, 0],
                "times bold italic": [0.75, 0.25, 0],
                "times italic": [0.75, 0.25, 0],
                "times roman": [0.75, 0.25, 0],
                "times new roman bold italic": [0.9167, 0.25, 0],
                "times new roman bold": [0.9167, 0.25, 0],
                "times new roman italic": [0.9167, 0.25, 0],
                "times new roman": [0.9167, 0.25, 0],
                "trebuchet ms bold italic": [0.9167, 0.25, 0],
                "trebuchet ms": [0.9167, 0.25, 0],
                "trebuchet ms bold": [0.9167, 0.25, 0],
                "trebuchet ms italic": [0.9167, 0.25, 0],
                "verdana": [1, 0.25, 0],
                "verdana bold": [1, 0.25, 0],
                "verdana bold italic": [1, 0.25, 0],
                "verdana italic": [1, 0.25, 0],
                "webdings": [0.8333, 0.1667, 0],
                "wingdings 2": [0.8333, 0.25, 0],
                "wingdings 3": [0.9167, 0.25, 0],
                "yuppy sc regular": [1.0833, 0.3333, 0],
                "yuppy tc regular": [1.0833, 0.3333, 0],
                "zapf dingbats": [0.8333, 0.1667, 0],
                "zapfino": [1.9167, 1.5, 0]
              };

              Font.DEVICE_FONT_METRICS_LINUX = {
                "kacstfarsi": [1.0831, 0.5215, 0],
                "meera": [0.682, 0.4413, 0],
                "freemono": [0.8023, 0.2006, 0],
                "undotum": [1.0029, 0.2808, 0],
                "loma": [1.1634, 0.4814, 0],
                "century schoolbook l": [1.0029, 0.3209, 0],
                "kacsttitlel": [1.0831, 0.5215, 0],
                "undinaru": [1.0029, 0.2407, 0],
                "ungungseo": [1.0029, 0.2808, 0],
                "garuda": [1.3238, 0.6017, 0],
                "rekha": [1.1232, 0.2808, 0],
                "purisa": [1.1232, 0.5215, 0],
                "dejavu sans mono": [0.9628, 0.2407, 0],
                "vemana2000": [0.8825, 0.8424, 0],
                "kacstoffice": [1.0831, 0.5215, 0],
                "umpush": [1.2837, 0.682, 0],
                "opensymbol": [0.8023, 0.2006, 0],
                "sawasdee": [1.1232, 0.4413, 0],
                "urw palladio l": [1.0029, 0.3209, 0],
                "freeserif": [0.9227, 0.3209, 0],
                "kacstdigital": [1.0831, 0.5215, 0],
                "ubuntu condensed": [0.9628, 0.2006, 0],
                "unpilgi": [1.0029, 0.4413, 0],
                "mry_kacstqurn": [1.4442, 0.7221, 0],
                "urw gothic l": [1.0029, 0.2407, 0],
                "dingbats": [0.8424, 0.1605, 0],
                "urw chancery l": [1.0029, 0.3209, 0],
                "phetsarath ot": [1.0831, 0.5215, 0],
                "tlwg typist": [0.8825, 0.4012, 0],
                "kacstletter": [1.0831, 0.5215, 0],
                "utkal": [1.2035, 0.6418, 0],
                "dejavu sans light": [0.9628, 0.2407, 0],
                "norasi": [1.2436, 0.5215, 0],
                "dejavu serif condensed": [0.9628, 0.2407, 0],
                "kacstone": [1.2436, 0.6418, 0],
                "liberation sans narrow": [0.9628, 0.2407, 0],
                "symbol": [1.043, 0.3209, 0],
                "nanummyeongjo": [0.9227, 0.2407, 0],
                "untitled1": [0.682, 0.5616, 0],
                "lohit gujarati": [0.9628, 0.4012, 0],
                "liberation mono": [0.8424, 0.3209, 0],
                "kacstart": [1.0831, 0.5215, 0],
                "mallige": [1.0029, 0.682, 0],
                "bitstream charter": [1.0029, 0.2407, 0],
                "nanumgothic": [0.9227, 0.2407, 0],
                "liberation serif": [0.9227, 0.2407, 0],
                "dejavu sans condensed": [0.9628, 0.2407, 0],
                "ubuntu": [0.9628, 0.2006, 0],
                "courier 10 pitch": [0.8825, 0.3209, 0],
                "nimbus sans l": [0.9628, 0.3209, 0],
                "takaopgothic": [0.8825, 0.2006, 0],
                "wenquanyi micro hei mono": [0.9628, 0.2407, 0],
                "dejavu sans": [0.9628, 0.2407, 0],
                "kedage": [1.0029, 0.682, 0],
                "kinnari": [1.3238, 0.5215, 0],
                "tlwgmono": [0.8825, 0.4012, 0],
                "standard symbols l": [1.043, 0.3209, 0],
                "lohit punjabi": [1.2035, 0.682, 0],
                "nimbus mono l": [0.8424, 0.2808, 0],
                "rachana": [0.682, 0.5616, 0],
                "waree": [1.2436, 0.4413, 0],
                "kacstposter": [1.0831, 0.5215, 0],
                "khmer os": [1.2837, 0.7622, 0],
                "freesans": [1.0029, 0.3209, 0],
                "gargi": [0.9628, 0.2808, 0],
                "nimbus roman no9 l": [0.9628, 0.3209, 0],
                "dejavu serif": [0.9628, 0.2407, 0],
                "wenquanyi micro hei": [0.9628, 0.2407, 0],
                "ubuntu light": [0.9628, 0.2006, 0],
                "tlwgtypewriter": [0.9227, 0.4012, 0],
                "kacstpen": [1.0831, 0.5215, 0],
                "tlwg typo": [0.8825, 0.4012, 0],
                "mukti narrow": [1.2837, 0.4413, 0],
                "ubuntu mono": [0.8424, 0.2006, 0],
                "lohit bengali": [1.0029, 0.4413, 0],
                "liberation sans": [0.9227, 0.2407, 0],
                "unbatang": [1.0029, 0.2808, 0],
                "kacstdecorative": [1.1232, 0.5215, 0],
                "khmer os system": [1.2436, 0.6017, 0],
                "saab": [1.0029, 0.682, 0],
                "kacsttitle": [1.0831, 0.5215, 0],
                "mukti narrow bold": [1.2837, 0.4413, 0],
                "lohit hindi": [1.0029, 0.5215, 0],
                "kacstqurn": [1.0831, 0.5215, 0],
                "urw bookman l": [0.9628, 0.2808, 0],
                "kacstnaskh": [1.0831, 0.5215, 0],
                "kacstscreen": [1.0831, 0.5215, 0],
                "pothana2000": [0.8825, 0.8424, 0],
                "ungraphic": [1.0029, 0.2808, 0],
                "lohit tamil": [0.8825, 0.361, 0],
                "kacstbook": [1.0831, 0.5215, 0]
              };
              Font.DEVICE_FONT_METRICS_MAC.__proto__ = Font.DEVICE_FONT_METRICS_WIN;
              Font.DEVICE_FONT_METRICS_LINUX.__proto__ = Font.DEVICE_FONT_METRICS_MAC;
            };

            Font.classSymbols = null;
            Font.instanceSymbols = null;

            Font.initializer = function (symbol) {
              var self = this;

              self._id = flash.display.DisplayObject.getNextSyncID();

              self._fontName = null;
              self._fontStyle = null;
              self._fontType = null;

              self.ascent = 0;
              self.descent = 0;
              self.leading = 0;
              self.advances = null;

              if (symbol) {
                self._symbol = symbol;
                self._fontName = symbol.name;
                if (symbol.bold) {
                  if (symbol.italic) {
                    self._fontStyle = FontStyle.BOLD_ITALIC;
                  } else {
                    self._fontStyle = FontStyle.BOLD;
                  }
                } else if (symbol.italic) {
                  self._fontStyle = FontStyle.ITALIC;
                } else {
                  self._fontStyle = FontStyle.REGULAR;
                }

                var metrics = symbol.metrics;
                if (metrics) {
                  self.ascent = metrics.ascent;
                  self.descent = metrics.descent;
                  self.leading = metrics.leading;
                  self.advances = metrics.advances;
                }

                self._fontType = symbol.data ? FontType.EMBEDDED : FontType.DEVICE;
                Font._fontsBySymbolId[symbol.id] = self;
                Font._fontsByName[symbol.name.toLowerCase()] = self;
                Font._fontsByName['swffont' + symbol.id] = self;
              }
            };
            return Font;
          })(AS.ASNative);
          text.Font = Font;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var GridFitType = (function (_super) {
            __extends(GridFitType, _super);
            function GridFitType() {
              _super.call(this);
            }
            GridFitType.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return GridFitType.NONE;
                case 1:
                  return GridFitType.PIXEL;
                case 2:
                  return GridFitType.SUBPIXEL;
                default:
                  return null;
              }
            };

            GridFitType.toNumber = function (value) {
              switch (value) {
                case GridFitType.NONE:
                  return 0;
                case GridFitType.PIXEL:
                  return 1;
                case GridFitType.SUBPIXEL:
                  return 2;
                default:
                  return -1;
              }
            };
            GridFitType.classInitializer = null;
            GridFitType.initializer = null;
            GridFitType.classSymbols = null;
            GridFitType.instanceSymbolså = null;

            GridFitType.NONE = "none";
            GridFitType.PIXEL = "pixel";
            GridFitType.SUBPIXEL = "subpixel";
            return GridFitType;
          })(AS.ASNative);
          text.GridFitType = GridFitType;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var StaticText = (function (_super) {
            __extends(StaticText, _super);
            function StaticText() {
              false && _super.call(this);
              flash.display.DisplayObject.instanceConstructorNoInitialize.call(this);
            }
            StaticText.prototype._canHaveTextContent = function () {
              return true;
            };

            StaticText.prototype._getTextContent = function () {
              return this._textContent;
            };

            Object.defineProperty(StaticText.prototype, "text", {
              get: function () {
                return this._textContent.plainText;
              },
              enumerable: true,
              configurable: true
            });
            StaticText.classInitializer = null;
            StaticText.classSymbols = null;
            StaticText.instanceSymbols = null;

            StaticText.initializer = function (symbol) {
              var self = this;
              self._textContent = null;
              if (symbol) {
                this._setStaticContentFromSymbol(symbol);
              }
            };
            return StaticText;
          })(flash.display.DisplayObject);
          text.StaticText = StaticText;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var notImplemented = Shumway.Debug.notImplemented;

          var StyleSheet = (function (_super) {
            __extends(StyleSheet, _super);
            function StyleSheet() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.text.StyleSheet");
            }
            StyleSheet.classInitializer = null;

            StyleSheet.initializer = null;

            StyleSheet.classSymbols = null;

            StyleSheet.instanceSymbols = null;
            return StyleSheet;
          })(flash.events.EventDispatcher);
          text.StyleSheet = StyleSheet;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var TextDisplayMode = (function (_super) {
            __extends(TextDisplayMode, _super);
            function TextDisplayMode() {
              _super.call(this);
            }
            TextDisplayMode.classInitializer = null;
            TextDisplayMode.initializer = null;
            TextDisplayMode.classSymbols = null;
            TextDisplayMode.instanceSymbolså = null;

            TextDisplayMode.LCD = "lcd";
            TextDisplayMode.CRT = "crt";
            TextDisplayMode.DEFAULT = "default";
            return TextDisplayMode;
          })(AS.ASNative);
          text.TextDisplayMode = TextDisplayMode;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var notImplemented = Shumway.Debug.notImplemented;
          var assert = Shumway.Debug.assert;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var throwError = Shumway.AVM2.Runtime.throwError;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

          var clamp = Shumway.NumberUtilities.clamp;

          var DisplayObjectFlags = flash.display.DisplayObjectFlags;

          var TextField = (function (_super) {
            __extends(TextField, _super);
            function TextField() {
              _super.call(this);
              notImplemented("Dummy Constructor: public flash.text.TextField");
            }
            TextField.prototype._setFillAndLineBoundsFromSymbol = function (symbol) {
              _super.prototype._setFillAndLineBoundsFromSymbol.call(this, symbol);
              this._textContent.bounds = this._lineBounds;
              this._invalidateContent();
            };

            TextField.prototype._setFillAndLineBoundsFromWidthAndHeight = function (width, height) {
              _super.prototype._setFillAndLineBoundsFromWidthAndHeight.call(this, width, height);
              this._textContent.bounds = this._lineBounds;
              this._invalidateContent();
            };

            TextField.prototype._canHaveTextContent = function () {
              return true;
            };

            TextField.prototype._getTextContent = function () {
              return this._textContent;
            };

            TextField.prototype._getContentBounds = function (includeStrokes) {
              if (typeof includeStrokes === "undefined") { includeStrokes = true; }
              this._ensureLineMetrics();
              return _super.prototype._getContentBounds.call(this, includeStrokes);
            };

            TextField.prototype._invalidateContent = function () {
              if (this._textContent.flags & Shumway.TextContentFlags.Dirty) {
                this._setFlags(8388608 /* DirtyTextContent */);
              }
            };

            TextField.isFontCompatible = function (fontName, fontStyle) {
              fontName = asCoerceString(fontName);
              fontStyle = asCoerceString(fontStyle);
              somewhatImplemented("flash.text.TextField.isFontCompatible");
              return true;
            };

            Object.defineProperty(TextField.prototype, "alwaysShowSelection", {
              get: function () {
                return this._alwaysShowSelection;
              },
              set: function (value) {
                somewhatImplemented("public flash.text.TextField::set alwaysShowSelection");
                this._alwaysShowSelection = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "antiAliasType", {
              get: function () {
                return this._antiAliasType;
              },
              set: function (antiAliasType) {
                somewhatImplemented("public flash.text.TextField::set antiAliasType");
                antiAliasType = asCoerceString(antiAliasType);
                if (text.AntiAliasType.toNumber(antiAliasType) < 0) {
                  throwError("ArgumentError", AVM2.Errors.InvalidParamError, "antiAliasType");
                }
                this._antiAliasType = antiAliasType;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "autoSize", {
              get: function () {
                return this._autoSize;
              },
              set: function (value) {
                value = asCoerceString(value);
                if (value === this._autoSize) {
                  return;
                }
                if (text.TextFieldAutoSize.toNumber(value) < 0) {
                  throwError("ArgumentError", AVM2.Errors.InvalidParamError, "autoSize");
                }
                this._autoSize = value;
                this._textContent.autoSize = text.TextFieldAutoSize.toNumber(value);
                this._invalidateContent();
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "background", {
              get: function () {
                return this._background;
              },
              set: function (value) {
                value = !!value;
                if (value === this._background) {
                  return;
                }
                this._background = value;
                this._textContent.backgroundColor = value ? this._backgroundColor : 0;
                this._setDirtyFlags(8388608 /* DirtyTextContent */);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "backgroundColor", {
              get: function () {
                return this._backgroundColor >> 8;
              },
              set: function (value) {
                value = ((value << 8) | 0xff) >>> 0;
                if (value === this._backgroundColor) {
                  return;
                }
                this._backgroundColor = value;
                if (this._background) {
                  this._textContent.backgroundColor = value;
                  this._setDirtyFlags(8388608 /* DirtyTextContent */);
                }
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "border", {
              get: function () {
                return this._border;
              },
              set: function (value) {
                value = !!value;
                if (value === this._border) {
                  return;
                }
                this._border = value;
                this._textContent.borderColor = value ? this._borderColor : 0;
                this._setDirtyFlags(8388608 /* DirtyTextContent */);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "borderColor", {
              get: function () {
                return this._borderColor >> 8;
              },
              set: function (value) {
                value = ((value << 8) | 0xff) >>> 0;
                if (value === this._borderColor) {
                  return;
                }
                this._borderColor = value;
                if (this._border) {
                  this._textContent.borderColor = value;
                  this._setDirtyFlags(8388608 /* DirtyTextContent */);
                }
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "bottomScrollV", {
              get: function () {
                notImplemented("public flash.text.TextField::get bottomScrollV");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(TextField.prototype, "caretIndex", {
              get: function () {
                notImplemented("public flash.text.TextField::get caretIndex");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "condenseWhite", {
              get: function () {
                somewhatImplemented("public flash.text.TextField::get condenseWhite");
                return this._condenseWhite;
              },
              set: function (value) {
                this._condenseWhite = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "defaultTextFormat", {
              get: function () {
                return this._textContent.defaultTextFormat.clone();
              },
              set: function (format) {
                this._textContent.defaultTextFormat.merge(format);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "embedFonts", {
              get: function () {
                return this._embedFonts;
              },
              set: function (value) {
                this._embedFonts = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "gridFitType", {
              get: function () {
                somewhatImplemented("public flash.text.TextField::get gridFitType");
                return this._gridFitType;
              },
              set: function (gridFitType) {
                gridFitType = asCoerceString(gridFitType);
                release || assert(flash.text.GridFitType.toNumber(gridFitType) >= 0);
                somewhatImplemented("public flash.text.TextField::set gridFitType");
                this._gridFitType = gridFitType;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "htmlText", {
              get: function () {
                return this._htmlText;
              },
              set: function (value) {
                somewhatImplemented("public flash.text.TextField::set htmlText");
                value = asCoerceString(value);

                if (this._symbol) {
                  this._textContent.defaultTextFormat.bold = false;
                  this._textContent.defaultTextFormat.italic = false;
                }
                this._textContent.parseHtml(value, this._multiline);
                this._htmlText = value;
                this._invalidateContent();
                this._ensureLineMetrics();
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "length", {
              get: function () {
                return this._length;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "textInteractionMode", {
              get: function () {
                notImplemented("public flash.text.TextField::get textInteractionMode");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "maxChars", {
              get: function () {
                return this._maxChars;
              },
              set: function (value) {
                this._maxChars = value | 0;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "maxScrollH", {
              get: function () {
                return this._maxScrollH;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "maxScrollV", {
              get: function () {
                return this._maxScrollV;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "mouseWheelEnabled", {
              get: function () {
                return this._mouseWheelEnabled;
              },
              set: function (value) {
                somewhatImplemented("public flash.text.TextField::set mouseWheelEnabled");
                this._mouseWheelEnabled = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "multiline", {
              get: function () {
                return this._multiline;
              },
              set: function (value) {
                this._multiline = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "numLines", {
              get: function () {
                return this._numLines;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "displayAsPassword", {
              get: function () {
                return this._displayAsPassword;
              },
              set: function (value) {
                somewhatImplemented("public flash.text.TextField::set displayAsPassword");
                this._displayAsPassword = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "restrict", {
              get: function () {
                return this._restrict;
              },
              set: function (value) {
                somewhatImplemented("public flash.text.TextField::set restrict");
                this._restrict = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "scrollH", {
              get: function () {
                somewhatImplemented("public flash.text.TextField::get scrollH");
                return this._scrollH;
              },
              set: function (value) {
                value = value | 0;
                somewhatImplemented("public flash.text.TextField::set scrollH");
                this._scrollH = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(TextField.prototype, "scrollV", {
              get: function () {
                somewhatImplemented("public flash.text.TextField::get scrollV");
                return this._scrollV;
              },
              set: function (value) {
                value = value | 0;
                somewhatImplemented("public flash.text.TextField::set scrollV");
                this._scrollV = value;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "selectable", {
              get: function () {
                return this._selectable;
              },
              set: function (value) {
                somewhatImplemented("public flash.text.TextField::set selectable");
                this._selectable = !!value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "selectionBeginIndex", {
              get: function () {
                return this._selectionBeginIndex;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "selectionEndIndex", {
              get: function () {
                return this._selectionEndIndex;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "sharpness", {
              get: function () {
                return this._sharpness;
              },
              set: function (value) {
                this._sharpness = clamp(+value, -400, 400);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "styleSheet", {
              get: function () {
                notImplemented("public flash.text.TextField::get styleSheet");
                return;
              },
              set: function (value) {
                value = value;
                notImplemented("public flash.text.TextField::set styleSheet");
                return;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "text", {
              get: function () {
                return this._textContent.plainText;
              },
              set: function (value) {
                somewhatImplemented("public flash.text.TextField::set text");
                this._textContent.plainText = asCoerceString(value);
                this._invalidateContent();
                this._ensureLineMetrics();
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "textColor", {
              get: function () {
                return this._textColor < 0 ? +this._textContent.defaultTextFormat.color : this._textColor;
              },
              set: function (value) {
                this._textColor = value >>> 0;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "textHeight", {
              get: function () {
                this._ensureLineMetrics();
                return (this._textHeight / 20) | 0;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "textWidth", {
              get: function () {
                this._ensureLineMetrics();
                return (this._textWidth / 20) | 0;
              },
              enumerable: true,
              configurable: true
            });

            Object.defineProperty(TextField.prototype, "thickness", {
              get: function () {
                return this._thickness;
              },
              set: function (value) {
                this._thickness = clamp(+value, -200, 200);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "type", {
              get: function () {
                return this._type;
              },
              set: function (value) {
                this._type = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "wordWrap", {
              get: function () {
                return this._textContent.wordWrap;
              },
              set: function (value) {
                value = !!value;
                if (value === this._textContent.wordWrap) {
                  return;
                }
                this._textContent.wordWrap = !!value;
                this._invalidateContent();
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextField.prototype, "useRichTextClipboard", {
              get: function () {
                notImplemented("public flash.text.TextField::get useRichTextClipboard");
                return;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.text.TextField::set useRichTextClipboard");
                return;
              },
              enumerable: true,
              configurable: true
            });

            TextField.prototype._ensureLineMetrics = function () {
              if (!this._hasFlags(8388608 /* DirtyTextContent */)) {
                return;
              }
              var serializer = Shumway.AVM2.Runtime.AVM2.instance.globals['Shumway.Player.Utils'];
              var lineMetricsData = serializer.syncDisplayObject(this, false);
              var textWidth = lineMetricsData.readInt();
              var textHeight = lineMetricsData.readInt();
              var offsetX = lineMetricsData.readInt();
              if (this._autoSize !== text.TextFieldAutoSize.NONE) {
                this._fillBounds.xMin = this._lineBounds.xMin = offsetX;
                this._fillBounds.xMax = this._lineBounds.xMax = offsetX + textWidth + 80;
                this._fillBounds.yMax = this._lineBounds.yMax = this._lineBounds.yMin + textHeight + 80;
              }
              this._textWidth = textWidth;
              this._textHeight = textHeight;
              this._numLines = lineMetricsData.readInt();
              this._lineMetricsData = lineMetricsData;
            };

            TextField.prototype.getCharBoundaries = function (charIndex) {
              charIndex = charIndex | 0;
              notImplemented("public flash.text.TextField::getCharBoundaries");
              return;
            };
            TextField.prototype.getCharIndexAtPoint = function (x, y) {
              x = +x;
              y = +y;
              notImplemented("public flash.text.TextField::getCharIndexAtPoint");
              return;
            };
            TextField.prototype.getFirstCharInParagraph = function (charIndex) {
              charIndex = charIndex | 0;
              notImplemented("public flash.text.TextField::getFirstCharInParagraph");
              return;
            };
            TextField.prototype.getLineIndexAtPoint = function (x, y) {
              x = +x;
              y = +y;
              notImplemented("public flash.text.TextField::getLineIndexAtPoint");
              return;
            };
            TextField.prototype.getLineIndexOfChar = function (charIndex) {
              charIndex = charIndex | 0;
              notImplemented("public flash.text.TextField::getLineIndexOfChar");
              return;
            };
            TextField.prototype.getLineLength = function (lineIndex) {
              lineIndex = lineIndex | 0;
              notImplemented("public flash.text.TextField::getLineLength");
              return;
            };

            TextField.prototype.getLineMetrics = function (lineIndex) {
              lineIndex = lineIndex | 0;
              if (lineIndex < 0 || lineIndex > this._numLines - 1) {
                throwError('RangeError', AVM2.Errors.ParamRangeError);
              }
              this._ensureLineMetrics();
              var lineMetricsData = this._lineMetricsData;
              lineMetricsData.position = 12 + lineIndex * 20;
              var x = lineMetricsData.readInt();
              var width = lineMetricsData.readInt();
              var ascent = lineMetricsData.readInt();
              var descent = lineMetricsData.readInt();
              var leading = lineMetricsData.readInt();
              var height = ascent + descent + leading;
              return new text.TextLineMetrics(x, width, height, ascent, descent, leading);
            };

            TextField.prototype.getLineOffset = function (lineIndex) {
              lineIndex = lineIndex | 0;
              notImplemented("public flash.text.TextField::getLineOffset");
              return;
            };
            TextField.prototype.getLineText = function (lineIndex) {
              lineIndex = lineIndex | 0;
              notImplemented("public flash.text.TextField::getLineText");
              return;
            };
            TextField.prototype.getParagraphLength = function (charIndex) {
              charIndex = charIndex | 0;
              notImplemented("public flash.text.TextField::getParagraphLength");
              return;
            };
            TextField.prototype.getTextFormat = function (beginIndex, endIndex) {
              if (typeof beginIndex === "undefined") { beginIndex = -1; }
              if (typeof endIndex === "undefined") { endIndex = -1; }
              beginIndex = beginIndex | 0;
              endIndex = endIndex | 0;
              notImplemented("public flash.text.TextField::getTextFormat");
              return;
            };

            TextField.prototype.getTextRuns = function (beginIndex, endIndex) {
              if (typeof beginIndex === "undefined") { beginIndex = 0; }
              if (typeof endIndex === "undefined") { endIndex = 2147483647; }
              var textRuns = this._textContent.textRuns;
              var result = [];
              for (var i = 0; i < textRuns.length; i++) {
                var textRun = textRuns[i];
                if (textRun.beginIndex >= beginIndex && textRun.endIndex <= endIndex) {
                  result.push(textRun.clone());
                }
              }
              return result;
            };

            TextField.prototype.getRawText = function () {
              notImplemented("public flash.text.TextField::getRawText");
              return;
            };
            TextField.prototype.replaceSelectedText = function (value) {
              value = "" + value;
              notImplemented("public flash.text.TextField::replaceSelectedText");
              return;
            };
            TextField.prototype.replaceText = function (beginIndex, endIndex, newText) {
              beginIndex = beginIndex | 0;
              endIndex = endIndex | 0;
              newText = "" + newText;
              somewhatImplemented("public flash.text.TextField::replaceText");
              var plainText = this._textContent.plainText;
              this._textContent.plainText = plainText.substring(0, beginIndex) + newText + plainText.substring(endIndex);
              this._invalidateContent();
              this._ensureLineMetrics();
            };
            TextField.prototype.setSelection = function (beginIndex, endIndex) {
              beginIndex = beginIndex | 0;
              endIndex = endIndex | 0;
              notImplemented("public flash.text.TextField::setSelection");
              return;
            };
            TextField.prototype.setTextFormat = function (format, beginIndex, endIndex) {
              if (typeof beginIndex === "undefined") { beginIndex = -1; }
              if (typeof endIndex === "undefined") { endIndex = -1; }
              format = format;
              beginIndex = beginIndex | 0;
              endIndex = endIndex | 0;
              somewhatImplemented("public flash.text.TextField::setTextFormat");
              return;
            };
            TextField.prototype.getImageReference = function (id) {
              id = "" + id;
              notImplemented("public flash.text.TextField::getImageReference");
              return;
            };
            TextField.classSymbols = null;
            TextField.instanceSymbols = null;

            TextField.classInitializer = null;

            TextField.initializer = function (symbol) {
              var self = this;

              self._alwaysShowSelection = false;
              self._antiAliasType = text.AntiAliasType.NORMAL;
              self._autoSize = text.TextFieldAutoSize.NONE;
              self._background = false;
              self._backgroundColor = 0xffffffff;
              self._border = false;
              self._borderColor = 0x000000ff;
              self._bottomScrollV = 1;
              self._caretIndex = 0;
              self._condenseWhite = false;
              self._embedFonts = false;
              self._gridFitType = text.GridFitType.PIXEL;
              self._htmlText = '';
              self._length = 0;
              self._textInteractionMode = text.TextInteractionMode.NORMAL;
              self._maxChars = 0;
              self._maxScrollH = 0;
              self._maxScrollV = 1;
              self._mouseWheelEnabled = false;
              self._multiline = false;
              self._numLines = 1;
              self._displayAsPassword = false;
              self._restrict = null;
              self._scrollH = 0;
              self._scrollV = 1;
              self._selectable = true;
              self._selectedText = '';
              self._selectionBeginIndex = 0;
              self._selectionEndIndex = 0;
              self._sharpness = 0;
              self._styleSheet = null;
              self._textColor = -1;
              self._textHeight = 0;
              self._textWidth = 0;
              self._thickness = 0;
              self._type = text.TextFieldType.DYNAMIC;
              self._useRichTextClipboard = false;

              var defaultTextFormat = new flash.text.TextFormat('Times Roman', 12, 0, false, false, false, '', '', text.TextFormatAlign.LEFT);
              self._textContent = new Shumway.TextContent(defaultTextFormat);
              self._lineMetricsData = null;

              if (symbol) {
                self._setFillAndLineBoundsFromSymbol(symbol);

                defaultTextFormat.color = symbol.color;
                defaultTextFormat.size = (symbol.size / 20) | 0;
                defaultTextFormat.font = symbol.font;
                defaultTextFormat.align = symbol.align;
                defaultTextFormat.leftMargin = (symbol.leftMargin / 20) | 0;
                defaultTextFormat.rightMargin = (symbol.rightMargin / 20) | 0;
                defaultTextFormat.indent = (symbol.indent / 20) | 0;
                defaultTextFormat.leading = (symbol.leading / 20) | 0;

                self._multiline = symbol.multiline;
                self._embedFonts = symbol.embedFonts;
                self._selectable = symbol.selectable;
                self._displayAsPassword = symbol.displayAsPassword;
                self._type = symbol.type;
                self._maxChars = symbol.maxChars;

                if (symbol.border) {
                  self.background = true;
                  self.border = true;
                }
                if (symbol.html) {
                  self.htmlText = symbol.initialText;
                } else {
                  self.text = symbol.initialText;
                }
                self.wordWrap = symbol.wordWrap;
                self.autoSize = symbol.autoSize;
              } else {
                self._setFillAndLineBoundsFromWidthAndHeight(100 * 20, 100 * 20);
              }
            };
            return TextField;
          })(flash.display.InteractiveObject);
          text.TextField = TextField;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var TextFieldAutoSize = (function (_super) {
            __extends(TextFieldAutoSize, _super);
            function TextFieldAutoSize() {
              _super.call(this);
            }
            TextFieldAutoSize.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return TextFieldAutoSize.NONE;
                case 1:
                  return TextFieldAutoSize.CENTER;
                case 2:
                  return TextFieldAutoSize.LEFT;
                case 3:
                  return TextFieldAutoSize.RIGHT;
                default:
                  return null;
              }
            };

            TextFieldAutoSize.toNumber = function (value) {
              switch (value) {
                case TextFieldAutoSize.NONE:
                  return 0;
                case TextFieldAutoSize.CENTER:
                  return 1;
                case TextFieldAutoSize.LEFT:
                  return 2;
                case TextFieldAutoSize.RIGHT:
                  return 3;
                default:
                  return -1;
              }
            };
            TextFieldAutoSize.classInitializer = null;
            TextFieldAutoSize.initializer = null;
            TextFieldAutoSize.classSymbols = null;
            TextFieldAutoSize.instanceSymbols = null;

            TextFieldAutoSize.NONE = "none";
            TextFieldAutoSize.LEFT = "left";
            TextFieldAutoSize.CENTER = "center";
            TextFieldAutoSize.RIGHT = "right";
            return TextFieldAutoSize;
          })(AS.ASNative);
          text.TextFieldAutoSize = TextFieldAutoSize;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var TextFieldType = (function (_super) {
            __extends(TextFieldType, _super);
            function TextFieldType() {
              _super.call(this);
            }
            TextFieldType.classInitializer = null;
            TextFieldType.initializer = null;
            TextFieldType.classSymbols = null;
            TextFieldType.instanceSymbols = null;

            TextFieldType.INPUT = "input";
            TextFieldType.DYNAMIC = "dynamic";
            return TextFieldType;
          })(AS.ASNative);
          text.TextFieldType = TextFieldType;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (_text) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var roundHalfEven = Shumway.NumberUtilities.roundHalfEven;

          var throwError = Shumway.AVM2.Runtime.throwError;

          var TextFormat = (function (_super) {
            __extends(TextFormat, _super);
            function TextFormat(font, size, color, bold, italic, underline, url, target, align, leftMargin, rightMargin, indent, leading) {
              if (typeof font === "undefined") { font = null; }
              if (typeof size === "undefined") { size = null; }
              if (typeof color === "undefined") { color = null; }
              if (typeof bold === "undefined") { bold = null; }
              if (typeof italic === "undefined") { italic = null; }
              if (typeof underline === "undefined") { underline = null; }
              if (typeof url === "undefined") { url = null; }
              if (typeof target === "undefined") { target = null; }
              if (typeof align === "undefined") { align = null; }
              if (typeof leftMargin === "undefined") { leftMargin = null; }
              if (typeof rightMargin === "undefined") { rightMargin = null; }
              if (typeof indent === "undefined") { indent = null; }
              if (typeof leading === "undefined") { leading = null; }
              false && _super.call(this);
              this.font = font;
              this.size = size;
              this.color = color;
              this.bold = bold;
              this.italic = italic;
              this.underline = underline;
              this.url = url;
              this.target = target;
              this.align = align;
              this.leftMargin = leftMargin;
              this.rightMargin = rightMargin;
              this.indent = indent;
              this.leading = leading;
            }
            TextFormat.prototype.as2GetTextExtent = function (text, width) {
              if (!TextFormat.measureTextField) {
                TextFormat.measureTextField = new flash.text.TextField();
                TextFormat.measureTextField._multiline = true;
              }
              var measureTextField = TextFormat.measureTextField;
              if (!isNaN(width) && width > 0) {
                measureTextField.width = width + 4;
                measureTextField._wordWrap = true;
              } else {
                measureTextField._wordWrap = false;
              }
              measureTextField.defaultTextFormat = this;
              measureTextField.text = text;
              var result = {};
              var textWidth = measureTextField.textWidth;
              var textHeight = measureTextField.textHeight;
              result.asSetPublicProperty('width', textWidth);
              result.asSetPublicProperty('height', textHeight);
              result.asSetPublicProperty('textFieldWidth', textWidth + 4);
              result.asSetPublicProperty('textFieldHeight', textHeight + 4);
              var metrics = measureTextField.getLineMetrics(0);
              result.asSetPublicProperty('ascent', metrics.ascent);
              result.asSetPublicProperty('descent', metrics.descent);
              return result;
            };

            Object.defineProperty(TextFormat.prototype, "align", {
              get: function () {
                return this._align;
              },
              set: function (value) {
                value = asCoerceString(value);

                this._align = value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "blockIndent", {
              get: function () {
                return this._blockIndent;
              },
              set: function (value) {
                this._blockIndent = TextFormat.coerceNumber(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "bold", {
              get: function () {
                return this._bold;
              },
              set: function (value) {
                this._bold = TextFormat.coerceBoolean(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "bullet", {
              get: function () {
                return this._bullet;
              },
              set: function (value) {
                this._bullet = TextFormat.coerceBoolean(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "color", {
              get: function () {
                return this._color;
              },
              set: function (value) {
                this._color = +value | 0;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "display", {
              get: function () {
                return this._display;
              },
              set: function (value) {
                this._display = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "font", {
              get: function () {
                return this._font;
              },
              set: function (value) {
                this._font = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "indent", {
              get: function () {
                return this._indent;
              },
              set: function (value) {
                this._indent = TextFormat.coerceNumber(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "italic", {
              get: function () {
                return this._italic;
              },
              set: function (value) {
                this._italic = TextFormat.coerceBoolean(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "kerning", {
              get: function () {
                return this._kerning;
              },
              set: function (value) {
                this._kerning = TextFormat.coerceBoolean(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "leading", {
              get: function () {
                return this._leading;
              },
              set: function (value) {
                this._leading = TextFormat.coerceNumber(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "leftMargin", {
              get: function () {
                return this._leftMargin;
              },
              set: function (value) {
                this._leftMargin = TextFormat.coerceNumber(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "letterSpacing", {
              get: function () {
                return this._letterSpacing;
              },
              set: function (value) {
                this._letterSpacing = TextFormat.coerceBoolean(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "rightMargin", {
              get: function () {
                return this._rightMargin;
              },
              set: function (value) {
                this._rightMargin = TextFormat.coerceNumber(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "size", {
              get: function () {
                return this._size;
              },
              set: function (value) {
                this._size = TextFormat.coerceNumber(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "tabStops", {
              get: function () {
                return this._tabStops;
              },
              set: function (value) {
                if (!(value instanceof Array)) {
                  throwError("ArgumentError", AVM2.Errors.CheckTypeFailedError, value, 'Array');
                }
                this._tabStops = value;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "target", {
              get: function () {
                return this._target;
              },
              set: function (value) {
                this._target = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "underline", {
              get: function () {
                return this._underline;
              },
              set: function (value) {
                this._underline = TextFormat.coerceBoolean(value);
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextFormat.prototype, "url", {
              get: function () {
                return this._url;
              },
              set: function (value) {
                this._url = asCoerceString(value);
              },
              enumerable: true,
              configurable: true
            });


            TextFormat.coerceNumber = function (value) {
              if (value == undefined) {
                return null;
              }

              if (isNaN(value) || value > 0xfffffff) {
                return -0x80000000;
              }
              return roundHalfEven(value);
            };

            TextFormat.coerceBoolean = function (value) {
              return value == undefined ? null : !!value;
            };

            TextFormat.prototype.clone = function () {
              return new flash.text.TextFormat(this.font, this.size, this.color, this.bold, this.italic, this.underline, this.url, this.target, this.align, this.leftMargin, this.rightMargin, this.indent, this.leading);
            };

            TextFormat.prototype.equals = function (other) {
              return this._align === other._align && this._blockIndent === other._blockIndent && this._bold === other._bold && this._bullet === other._bullet && this._color === other._color && this._display === other._display && this._font === other._font && this._indent === other._indent && this._italic === other._italic && this._kerning === other._kerning && this._leading === other._leading && this._leftMargin === other._leftMargin && this._letterSpacing === other._letterSpacing && this._rightMargin === other._rightMargin && this._size === other._size && this._tabStops === other._tabStops && this._target === other._target && this._underline === other._underline && this._url === other._url;
            };

            TextFormat.prototype.merge = function (other) {
              if (other._align !== null) {
                this._align = other._align;
              }
              if (other._blockIndent !== null) {
                this._blockIndent = other._blockIndent;
              }
              if (other._bold !== null) {
                this._bold = other._bold;
              }
              if (other._bullet !== null) {
                this._bullet = other._bullet;
              }
              if (other._color !== null) {
                this._color = other._color;
              }
              if (other._display !== null) {
                this._display = other._display;
              }
              if (other._font !== null) {
                this._font = other._font;
              }
              if (other._indent !== null) {
                this._indent = other._indent;
              }
              if (other._italic !== null) {
                this._italic = other._italic;
              }
              if (other._kerning !== null) {
                this._kerning = other._kerning;
              }
              if (other._leading !== null) {
                this._leading = other._leading;
              }
              if (other._leftMargin !== null) {
                this._leftMargin = other._leftMargin;
              }
              if (other._letterSpacing !== null) {
                this._letterSpacing = other._letterSpacing;
              }
              if (other._rightMargin !== null) {
                this._rightMargin = other._rightMargin;
              }
              if (other._size !== null) {
                this._size = other._size;
              }
              if (other._tabStops !== null) {
                this._tabStops = other._tabStops;
              }
              if (other._target !== null) {
                this._target = other._target;
              }
              if (other._underline !== null) {
                this._underline = other._underline;
              }
              if (other._url !== null) {
                this._url = other._url;
              }
            };
            TextFormat.classInitializer = null;
            TextFormat.initializer = null;
            TextFormat.classSymbols = null;
            TextFormat.instanceSymbols = null;
            return TextFormat;
          })(AS.ASNative);
          _text.TextFormat = TextFormat;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var TextFormatAlign = (function (_super) {
            __extends(TextFormatAlign, _super);
            function TextFormatAlign() {
              _super.call(this);
            }
            TextFormatAlign.fromNumber = function (n) {
              switch (n) {
                case 0:
                  return TextFormatAlign.LEFT;
                case 1:
                  return TextFormatAlign.RIGHT;
                case 2:
                  return TextFormatAlign.CENTER;
                case 3:
                  return TextFormatAlign.JUSTIFY;
                case 4:
                  return TextFormatAlign.START;
                case 5:
                  return TextFormatAlign.END;
                default:
                  return null;
              }
            };

            TextFormatAlign.toNumber = function (value) {
              switch (value) {
                case TextFormatAlign.LEFT:
                  return 0;
                case TextFormatAlign.RIGHT:
                  return 1;
                case TextFormatAlign.CENTER:
                  return 2;
                case TextFormatAlign.JUSTIFY:
                  return 3;
                case TextFormatAlign.START:
                  return 4;
                case TextFormatAlign.END:
                  return 5;
                default:
                  return -1;
              }
            };
            TextFormatAlign.classInitializer = null;
            TextFormatAlign.initializer = null;
            TextFormatAlign.classSymbols = null;
            TextFormatAlign.instanceSymbols = null;

            TextFormatAlign.LEFT = "left";
            TextFormatAlign.CENTER = "center";
            TextFormatAlign.RIGHT = "right";
            TextFormatAlign.JUSTIFY = "justify";
            TextFormatAlign.START = "start";
            TextFormatAlign.END = "end";
            return TextFormatAlign;
          })(AS.ASNative);
          text.TextFormatAlign = TextFormatAlign;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var TextFormatDisplay = (function (_super) {
            __extends(TextFormatDisplay, _super);
            function TextFormatDisplay() {
              _super.call(this);
            }
            TextFormatDisplay.classInitializer = null;
            TextFormatDisplay.initializer = null;
            TextFormatDisplay.classSymbols = null;
            TextFormatDisplay.instanceSymbols = null;

            TextFormatDisplay.INLINE = "inline";
            TextFormatDisplay.BLOCK = "block";
            return TextFormatDisplay;
          })(AS.ASNative);
          text.TextFormatDisplay = TextFormatDisplay;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var TextInteractionMode = (function (_super) {
            __extends(TextInteractionMode, _super);
            function TextInteractionMode() {
              _super.call(this);
            }
            TextInteractionMode.classInitializer = null;
            TextInteractionMode.initializer = null;
            TextInteractionMode.classSymbols = null;
            TextInteractionMode.instanceSymbols = null;

            TextInteractionMode.NORMAL = "normal";
            TextInteractionMode.SELECTION = "selection";
            return TextInteractionMode;
          })(AS.ASNative);
          text.TextInteractionMode = TextInteractionMode;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var notImplemented = Shumway.Debug.notImplemented;
          var TextLineMetrics = (function (_super) {
            __extends(TextLineMetrics, _super);
            function TextLineMetrics(x, width, height, ascent, descent, leading) {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.text.TextLineMetrics");
              x = +x;
              width = +width;
              height = +height;
              ascent = +ascent;
              descent = +descent;
              leading = +leading;
            }
            TextLineMetrics.classInitializer = null;
            TextLineMetrics.initializer = null;
            TextLineMetrics.classSymbols = null;
            TextLineMetrics.instanceSymbolså = null;
            return TextLineMetrics;
          })(AS.ASNative);
          text.TextLineMetrics = TextLineMetrics;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var TextRun = (function (_super) {
            __extends(TextRun, _super);
            function TextRun(beginIndex, endIndex, textFormat) {
              false && _super.call(this);
              this._beginIndex = beginIndex | 0;
              this._endIndex = endIndex | 0;
              this._textFormat = textFormat;
            }
            Object.defineProperty(TextRun.prototype, "beginIndex", {
              get: function () {
                return this._beginIndex;
              },
              set: function (value) {
                this._beginIndex = value | 0;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextRun.prototype, "endIndex", {
              get: function () {
                return this._endIndex;
              },
              set: function (value) {
                this._endIndex = value | 0;
              },
              enumerable: true,
              configurable: true
            });


            Object.defineProperty(TextRun.prototype, "textFormat", {
              get: function () {
                return this._textFormat;
              },
              set: function (value) {
                this._textFormat = value;
              },
              enumerable: true,
              configurable: true
            });


            TextRun.prototype.clone = function () {
              return new flash.text.TextRun(this.beginIndex, this.endIndex, this.textFormat);
            };
            TextRun.classInitializer = null;
            TextRun.initializer = null;
            TextRun.classSymbols = null;
            TextRun.instanceSymbols = null;
            return TextRun;
          })(AS.ASNative);
          text.TextRun = TextRun;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (text) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var TextSnapshot = (function (_super) {
            __extends(TextSnapshot, _super);
            function TextSnapshot() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.text.TextSnapshot");
            }
            Object.defineProperty(TextSnapshot.prototype, "charCount", {
              get: function () {
                notImplemented("public flash.text.TextSnapshot::get charCount");
                return;
              },
              enumerable: true,
              configurable: true
            });
            TextSnapshot.prototype.findText = function (beginIndex, textToFind, caseSensitive) {
              beginIndex = beginIndex | 0;
              textToFind = asCoerceString(textToFind);
              caseSensitive = !!caseSensitive;
              notImplemented("public flash.text.TextSnapshot::findText");
              return;
            };
            TextSnapshot.prototype.getSelected = function (beginIndex, endIndex) {
              beginIndex = beginIndex | 0;
              endIndex = endIndex | 0;
              notImplemented("public flash.text.TextSnapshot::getSelected");
              return;
            };
            TextSnapshot.prototype.getSelectedText = function (includeLineEndings) {
              if (typeof includeLineEndings === "undefined") { includeLineEndings = false; }
              includeLineEndings = !!includeLineEndings;
              notImplemented("public flash.text.TextSnapshot::getSelectedText");
              return;
            };
            TextSnapshot.prototype.getText = function (beginIndex, endIndex, includeLineEndings) {
              if (typeof includeLineEndings === "undefined") { includeLineEndings = false; }
              beginIndex = beginIndex | 0;
              endIndex = endIndex | 0;
              includeLineEndings = !!includeLineEndings;
              notImplemented("public flash.text.TextSnapshot::getText");
              return;
            };
            TextSnapshot.prototype.getTextRunInfo = function (beginIndex, endIndex) {
              beginIndex = beginIndex | 0;
              endIndex = endIndex | 0;
              notImplemented("public flash.text.TextSnapshot::getTextRunInfo");
              return;
            };
            TextSnapshot.prototype.hitTestTextNearPos = function (x, y, maxDistance) {
              if (typeof maxDistance === "undefined") { maxDistance = 0; }
              x = +x;
              y = +y;
              maxDistance = +maxDistance;
              notImplemented("public flash.text.TextSnapshot::hitTestTextNearPos");
              return;
            };
            TextSnapshot.prototype.setSelectColor = function (hexColor) {
              if (typeof hexColor === "undefined") { hexColor = 16776960; }
              hexColor = hexColor >>> 0;
              notImplemented("public flash.text.TextSnapshot::setSelectColor");
              return;
            };
            TextSnapshot.prototype.setSelected = function (beginIndex, endIndex, select) {
              beginIndex = beginIndex | 0;
              endIndex = endIndex | 0;
              select = !!select;
              notImplemented("public flash.text.TextSnapshot::setSelected");
              return;
            };
            TextSnapshot.classInitializer = null;

            TextSnapshot.initializer = null;

            TextSnapshot.classSymbols = null;

            TextSnapshot.instanceSymbols = null;
            return TextSnapshot;
          })(AS.ASNative);
          text.TextSnapshot = TextSnapshot;
        })(flash.text || (flash.text = {}));
        var text = flash.text;
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
      (function (flash) {
        (function (trace) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Trace = (function (_super) {
            __extends(Trace, _super);
            function Trace() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.trace.Trace");
            }
            Trace.setLevel = function (l, target) {
              if (typeof target === "undefined") { target = 2; }
              l = l | 0;
              target = target | 0;
              notImplemented("public flash.trace.Trace::static setLevel");
              return;
            };
            Trace.getLevel = function (target) {
              if (typeof target === "undefined") { target = 2; }
              target = target | 0;
              notImplemented("public flash.trace.Trace::static getLevel");
              return;
            };
            Trace.setListener = function (f) {
              f = f;
              notImplemented("public flash.trace.Trace::static setListener");
              return;
            };
            Trace.getListener = function () {
              notImplemented("public flash.trace.Trace::static getListener");
              return;
            };
            Trace.classInitializer = null;

            Trace.initializer = null;

            Trace.classSymbols = null;

            Trace.instanceSymbols = null;

            Trace.OFF = undefined;
            Trace.METHODS = 1;
            Trace.METHODS_WITH_ARGS = 2;
            Trace.METHODS_AND_LINES = 3;
            Trace.METHODS_AND_LINES_WITH_ARGS = 4;
            Trace.FILE = 1;
            Trace.LISTENER = 2;
            return Trace;
          })(AS.ASNative);
          trace.Trace = Trace;
        })(flash.trace || (flash.trace = {}));
        var trace = flash.trace;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;

          var ContextMenu = (function (_super) {
            __extends(ContextMenu, _super);
            function ContextMenu() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.ContextMenu");
            }
            Object.defineProperty(ContextMenu.prototype, "builtInItems", {
              get: function () {
                somewhatImplemented("public flash.ui.ContextMenu::get builtInItems");
                return this._builtInItems;
              },
              set: function (value) {
                value = value;
                somewhatImplemented("public flash.ui.ContextMenu::set builtInItems");
                this._builtInItems = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ContextMenu.prototype, "customItems", {
              get: function () {
                somewhatImplemented("public flash.ui.ContextMenu::get customItems");
                return this._customItems;
              },
              set: function (value) {
                value = value;
                somewhatImplemented("public flash.ui.ContextMenu::set customItems");
                this._customItems = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ContextMenu.prototype, "link", {
              get: function () {
                notImplemented("public flash.ui.ContextMenu::get link");
                return;
              },
              set: function (value) {
                value = value;
                notImplemented("public flash.ui.ContextMenu::set link");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ContextMenu.prototype, "clipboardMenu", {
              get: function () {
                notImplemented("public flash.ui.ContextMenu::get clipboardMenu");
                return;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.ui.ContextMenu::set clipboardMenu");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ContextMenu.prototype, "clipboardItems", {
              get: function () {
                notImplemented("public flash.ui.ContextMenu::get clipboardItems");
                return;
              },
              set: function (value) {
                value = value;
                notImplemented("public flash.ui.ContextMenu::set clipboardItems");
                return;
              },
              enumerable: true,
              configurable: true
            });
            ContextMenu.prototype.cloneLinkAndClipboardProperties = function (c) {
              c = c;
              notImplemented("public flash.ui.ContextMenu::cloneLinkAndClipboardProperties");
              return;
            };
            ContextMenu.classInitializer = null;

            ContextMenu.initializer = null;

            ContextMenu.classSymbols = null;

            ContextMenu.instanceSymbols = null;
            return ContextMenu;
          })(flash.display.NativeMenu);
          ui.ContextMenu = ContextMenu;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var ContextMenuBuiltInItems = (function (_super) {
            __extends(ContextMenuBuiltInItems, _super);
            function ContextMenuBuiltInItems() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.ContextMenuBuiltInItems");
            }
            ContextMenuBuiltInItems.classInitializer = null;

            ContextMenuBuiltInItems.initializer = null;

            ContextMenuBuiltInItems.classSymbols = null;

            ContextMenuBuiltInItems.instanceSymbols = null;
            return ContextMenuBuiltInItems;
          })(AS.ASNative);
          ui.ContextMenuBuiltInItems = ContextMenuBuiltInItems;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var ContextMenuClipboardItems = (function (_super) {
            __extends(ContextMenuClipboardItems, _super);
            function ContextMenuClipboardItems() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.ContextMenuClipboardItems");
            }
            ContextMenuClipboardItems.classInitializer = null;

            ContextMenuClipboardItems.initializer = null;

            ContextMenuClipboardItems.classSymbols = null;

            ContextMenuClipboardItems.instanceSymbols = null;
            return ContextMenuClipboardItems;
          })(AS.ASNative);
          ui.ContextMenuClipboardItems = ContextMenuClipboardItems;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var ContextMenuItem = (function (_super) {
            __extends(ContextMenuItem, _super);
            function ContextMenuItem(caption, separatorBefore, enabled, visible) {
              if (typeof separatorBefore === "undefined") { separatorBefore = false; }
              if (typeof enabled === "undefined") { enabled = true; }
              if (typeof visible === "undefined") { visible = true; }
              false && _super.call(this);
              caption = asCoerceString(caption);
              separatorBefore = !!separatorBefore;
              enabled = !!enabled;
              visible = !!visible;
              this._caption = caption ? caption : "";
              this._separatorBefore = separatorBefore;
              this._enabled = enabled;
              this._visible = visible;
            }
            Object.defineProperty(ContextMenuItem.prototype, "caption", {
              get: function () {
                return this._caption;
              },
              set: function (value) {
                value = asCoerceString(value);
                this._caption = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ContextMenuItem.prototype, "separatorBefore", {
              get: function () {
                return this._separatorBefore;
              },
              set: function (value) {
                value = !!value;
                this._separatorBefore = value;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ContextMenuItem.prototype, "visible", {
              get: function () {
                return this._visible;
              },
              set: function (value) {
                value = !!value;
                this._visible = value;
              },
              enumerable: true,
              configurable: true
            });
            ContextMenuItem.classInitializer = null;

            ContextMenuItem.initializer = null;

            ContextMenuItem.classSymbols = null;

            ContextMenuItem.instanceSymbols = null;
            return ContextMenuItem;
          })(flash.display.NativeMenuItem);
          ui.ContextMenuItem = ContextMenuItem;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var notImplemented = Shumway.Debug.notImplemented;
          var throwError = Shumway.AVM2.Runtime.throwError;
          var GameInput = (function (_super) {
            __extends(GameInput, _super);
            function GameInput() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.ui.GameInput");
            }
            Object.defineProperty(GameInput.prototype, "numDevices", {
              get: function () {
                somewhatImplemented("public flash.ui.GameInput::get numDevices");
                return 0;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInput.prototype, "isSupported", {
              get: function () {
                somewhatImplemented("public flash.ui.GameInput::get isSupported");
                return false;
              },
              enumerable: true,
              configurable: true
            });
            GameInput.getDeviceAt = function (index) {
              index = index | 0;

              somewhatImplemented("public flash.ui.GameInput::static getDeviceAt");
              throwError("RangeError", AVM2.Errors.ParamRangeError, "index");
              return null;
            };
            GameInput.classInitializer = null;

            GameInput.initializer = null;

            GameInput.classSymbols = null;

            GameInput.instanceSymbols = null;
            return GameInput;
          })(flash.events.EventDispatcher);
          ui.GameInput = GameInput;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var GameInputControl = (function (_super) {
            __extends(GameInputControl, _super);
            function GameInputControl() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.ui.GameInputControl");
            }
            Object.defineProperty(GameInputControl.prototype, "numValues", {
              get: function () {
                notImplemented("public flash.ui.GameInputControl::get numValues");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputControl.prototype, "index", {
              get: function () {
                notImplemented("public flash.ui.GameInputControl::get index");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputControl.prototype, "relative", {
              get: function () {
                notImplemented("public flash.ui.GameInputControl::get relative");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputControl.prototype, "type", {
              get: function () {
                notImplemented("public flash.ui.GameInputControl::get type");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputControl.prototype, "hand", {
              get: function () {
                notImplemented("public flash.ui.GameInputControl::get hand");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputControl.prototype, "finger", {
              get: function () {
                notImplemented("public flash.ui.GameInputControl::get finger");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputControl.prototype, "device", {
              get: function () {
                notImplemented("public flash.ui.GameInputControl::get device");
                return;
              },
              enumerable: true,
              configurable: true
            });
            GameInputControl.prototype.getValueAt = function (index) {
              if (typeof index === "undefined") { index = 0; }
              index = index | 0;
              notImplemented("public flash.ui.GameInputControl::getValueAt");
              return;
            };
            GameInputControl.classInitializer = null;

            GameInputControl.initializer = null;

            GameInputControl.classSymbols = null;

            GameInputControl.instanceSymbols = null;
            return GameInputControl;
          })(flash.events.EventDispatcher);
          ui.GameInputControl = GameInputControl;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var GameInputControlType = (function (_super) {
            __extends(GameInputControlType, _super);
            function GameInputControlType() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.GameInputControlType");
            }
            GameInputControlType.classInitializer = null;

            GameInputControlType.initializer = null;

            GameInputControlType.classSymbols = null;

            GameInputControlType.instanceSymbols = null;

            GameInputControlType.MOVEMENT = "movement";
            GameInputControlType.ROTATION = "rotation";
            GameInputControlType.DIRECTION = "direction";
            GameInputControlType.ACCELERATION = "acceleration";
            GameInputControlType.BUTTON = "button";
            GameInputControlType.TRIGGER = "trigger";
            return GameInputControlType;
          })(AS.ASNative);
          ui.GameInputControlType = GameInputControlType;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var GameInputDevice = (function (_super) {
            __extends(GameInputDevice, _super);
            function GameInputDevice() {
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.ui.GameInputDevice");
            }
            Object.defineProperty(GameInputDevice.prototype, "numControls", {
              get: function () {
                notImplemented("public flash.ui.GameInputDevice::get numControls");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputDevice.prototype, "sampleInterval", {
              get: function () {
                notImplemented("public flash.ui.GameInputDevice::get sampleInterval");
                return;
              },
              set: function (val) {
                val = val | 0;
                notImplemented("public flash.ui.GameInputDevice::set sampleInterval");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputDevice.prototype, "enabled", {
              get: function () {
                notImplemented("public flash.ui.GameInputDevice::get enabled");
                return;
              },
              set: function (val) {
                val = !!val;
                notImplemented("public flash.ui.GameInputDevice::set enabled");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputDevice.prototype, "id", {
              get: function () {
                notImplemented("public flash.ui.GameInputDevice::get id");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(GameInputDevice.prototype, "name", {
              get: function () {
                notImplemented("public flash.ui.GameInputDevice::get name");
                return;
              },
              enumerable: true,
              configurable: true
            });
            GameInputDevice.prototype.getControlAt = function (i) {
              i = i | 0;
              notImplemented("public flash.ui.GameInputDevice::getControlAt");
              return;
            };
            GameInputDevice.prototype.startCachingSamples = function (numSamples, controls) {
              numSamples = numSamples | 0;
              controls = controls;
              notImplemented("public flash.ui.GameInputDevice::startCachingSamples");
              return;
            };
            GameInputDevice.prototype.stopCachingSamples = function () {
              notImplemented("public flash.ui.GameInputDevice::stopCachingSamples");
              return;
            };
            GameInputDevice.prototype.getCachedSamples = function (data, append) {
              if (typeof append === "undefined") { append = false; }
              data = data;
              append = !!append;
              notImplemented("public flash.ui.GameInputDevice::getCachedSamples");
              return;
            };
            GameInputDevice.classInitializer = null;

            GameInputDevice.initializer = null;

            GameInputDevice.classSymbols = null;

            GameInputDevice.instanceSymbols = null;

            GameInputDevice.MAX_BUFFER_SIZE = 4800;
            return GameInputDevice;
          })(flash.events.EventDispatcher);
          ui.GameInputDevice = GameInputDevice;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var GameInputFinger = (function (_super) {
            __extends(GameInputFinger, _super);
            function GameInputFinger() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.GameInputFinger");
            }
            GameInputFinger.classInitializer = null;

            GameInputFinger.initializer = null;

            GameInputFinger.classSymbols = null;

            GameInputFinger.instanceSymbols = null;

            GameInputFinger.THUMB = "thumb";
            GameInputFinger.INDEX = "index";
            GameInputFinger.MIDDLE = "middle";
            GameInputFinger.UNKNOWN = "unknown";
            return GameInputFinger;
          })(AS.ASNative);
          ui.GameInputFinger = GameInputFinger;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var GameInputHand = (function (_super) {
            __extends(GameInputHand, _super);
            function GameInputHand() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.GameInputHand");
            }
            GameInputHand.classInitializer = null;

            GameInputHand.initializer = null;

            GameInputHand.classSymbols = null;

            GameInputHand.instanceSymbols = null;

            GameInputHand.RIGHT = "right";
            GameInputHand.LEFT = "left";
            GameInputHand.UNKNOWN = "unknown";
            return GameInputHand;
          })(AS.ASNative);
          ui.GameInputHand = GameInputHand;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var KeyboardEventDispatcher = (function () {
            function KeyboardEventDispatcher() {
              this._lastKeyCode = 0;
              this._captureKeyPress = false;
              this._charCodeMap = [];
            }
            KeyboardEventDispatcher.prototype.dispatchKeyboardEvent = function (event) {
              var keyCode = event.keyCode;
              if (event.type === 'keydown') {
                this._lastKeyCode = keyCode;

                this._captureKeyPress = keyCode === 8 || keyCode === 9 || keyCode === 13 || keyCode === 32 || (keyCode >= 48 && keyCode <= 90) || keyCode > 145;
                if (this._captureKeyPress) {
                  return;
                }
                this._charCodeMap[keyCode] = 0;
              } else if (event.type === 'keypress') {
                if (this._captureKeyPress) {
                  keyCode = this._lastKeyCode;
                  this._charCodeMap[keyCode] = event.charCode;
                } else {
                  return;
                }
              }

              if (this.target) {
                var isKeyUp = event.type === 'keyup';
                this.target.dispatchEvent(new flash.events.KeyboardEvent(isKeyUp ? 'keyUp' : 'keyDown', true, false, isKeyUp ? this._charCodeMap[keyCode] : event.charCode, isKeyUp ? event.keyCode : this._lastKeyCode, event.location, event.ctrlKey, event.altKey, event.shiftKey));
              }
            };
            return KeyboardEventDispatcher;
          })();
          ui.KeyboardEventDispatcher = KeyboardEventDispatcher;

          var Keyboard = (function (_super) {
            __extends(Keyboard, _super);
            function Keyboard() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.Keyboard");
            }
            Object.defineProperty(Keyboard.prototype, "capsLock", {
              get: function () {
                notImplemented("public flash.ui.Keyboard::get capsLock");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Keyboard.prototype, "numLock", {
              get: function () {
                notImplemented("public flash.ui.Keyboard::get numLock");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Keyboard.prototype, "hasVirtualKeyboard", {
              get: function () {
                notImplemented("public flash.ui.Keyboard::get hasVirtualKeyboard");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Keyboard.prototype, "physicalKeyboardType", {
              get: function () {
                notImplemented("public flash.ui.Keyboard::get physicalKeyboardType");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Keyboard.isAccessible = function () {
              notImplemented("public flash.ui.Keyboard::static isAccessible");
              return;
            };
            Keyboard.classInitializer = null;

            Keyboard.initializer = null;

            Keyboard.classSymbols = null;

            Keyboard.instanceSymbols = null;

            Keyboard.KEYNAME_UPARROW = "Up";
            Keyboard.KEYNAME_DOWNARROW = "Down";
            Keyboard.KEYNAME_LEFTARROW = "Left";
            Keyboard.KEYNAME_RIGHTARROW = "Right";
            Keyboard.KEYNAME_F1 = "F1";
            Keyboard.KEYNAME_F2 = "F2";
            Keyboard.KEYNAME_F3 = "F3";
            Keyboard.KEYNAME_F4 = "F4";
            Keyboard.KEYNAME_F5 = "F5";
            Keyboard.KEYNAME_F6 = "F6";
            Keyboard.KEYNAME_F7 = "F7";
            Keyboard.KEYNAME_F8 = "F8";
            Keyboard.KEYNAME_F9 = "F9";
            Keyboard.KEYNAME_F10 = "F10";
            Keyboard.KEYNAME_F11 = "F11";
            Keyboard.KEYNAME_F12 = "F12";
            Keyboard.KEYNAME_F13 = "F13";
            Keyboard.KEYNAME_F14 = "F14";
            Keyboard.KEYNAME_F15 = "F15";
            Keyboard.KEYNAME_F16 = "F16";
            Keyboard.KEYNAME_F17 = "F17";
            Keyboard.KEYNAME_F18 = "F18";
            Keyboard.KEYNAME_F19 = "F19";
            Keyboard.KEYNAME_F20 = "F20";
            Keyboard.KEYNAME_F21 = "F21";
            Keyboard.KEYNAME_F22 = "F22";
            Keyboard.KEYNAME_F23 = "F23";
            Keyboard.KEYNAME_F24 = "F24";
            Keyboard.KEYNAME_F25 = "F25";
            Keyboard.KEYNAME_F26 = "F26";
            Keyboard.KEYNAME_F27 = "F27";
            Keyboard.KEYNAME_F28 = "F28";
            Keyboard.KEYNAME_F29 = "F29";
            Keyboard.KEYNAME_F30 = "F30";
            Keyboard.KEYNAME_F31 = "F31";
            Keyboard.KEYNAME_F32 = "F32";
            Keyboard.KEYNAME_F33 = "F33";
            Keyboard.KEYNAME_F34 = "F34";
            Keyboard.KEYNAME_F35 = "F35";
            Keyboard.KEYNAME_INSERT = "Insert";
            Keyboard.KEYNAME_DELETE = "Delete";
            Keyboard.KEYNAME_HOME = "Home";
            Keyboard.KEYNAME_BEGIN = "Begin";
            Keyboard.KEYNAME_END = "End";
            Keyboard.KEYNAME_PAGEUP = "PgUp";
            Keyboard.KEYNAME_PAGEDOWN = "PgDn";
            Keyboard.KEYNAME_PRINTSCREEN = "PrntScrn";
            Keyboard.KEYNAME_SCROLLLOCK = "ScrlLck";
            Keyboard.KEYNAME_PAUSE = "Pause";
            Keyboard.KEYNAME_SYSREQ = "SysReq";
            Keyboard.KEYNAME_BREAK = "Break";
            Keyboard.KEYNAME_RESET = "Reset";
            Keyboard.KEYNAME_STOP = "Stop";
            Keyboard.KEYNAME_MENU = "Menu";
            Keyboard.KEYNAME_USER = "User";
            Keyboard.KEYNAME_SYSTEM = "Sys";
            Keyboard.KEYNAME_PRINT = "Print";
            Keyboard.KEYNAME_CLEARLINE = "ClrLn";
            Keyboard.KEYNAME_CLEARDISPLAY = "ClrDsp";
            Keyboard.KEYNAME_INSERTLINE = "InsLn";
            Keyboard.KEYNAME_DELETELINE = "DelLn";
            Keyboard.KEYNAME_INSERTCHAR = "InsChr";
            Keyboard.KEYNAME_DELETECHAR = "DelChr";
            Keyboard.KEYNAME_PREV = "Prev";
            Keyboard.KEYNAME_NEXT = "Next";
            Keyboard.KEYNAME_SELECT = "Select";
            Keyboard.KEYNAME_EXECUTE = "Exec";
            Keyboard.KEYNAME_UNDO = "Undo";
            Keyboard.KEYNAME_REDO = "Redo";
            Keyboard.KEYNAME_FIND = "Find";
            Keyboard.KEYNAME_HELP = "Help";
            Keyboard.KEYNAME_MODESWITCH = "ModeSw";
            Keyboard.STRING_UPARROW = "";
            Keyboard.STRING_DOWNARROW = "";
            Keyboard.STRING_LEFTARROW = "";
            Keyboard.STRING_RIGHTARROW = "";
            Keyboard.STRING_F1 = "";
            Keyboard.STRING_F2 = "";
            Keyboard.STRING_F3 = "";
            Keyboard.STRING_F4 = "";
            Keyboard.STRING_F5 = "";
            Keyboard.STRING_F6 = "";
            Keyboard.STRING_F7 = "";
            Keyboard.STRING_F8 = "";
            Keyboard.STRING_F9 = "";
            Keyboard.STRING_F10 = "";
            Keyboard.STRING_F11 = "";
            Keyboard.STRING_F12 = "";
            Keyboard.STRING_F13 = "";
            Keyboard.STRING_F14 = "";
            Keyboard.STRING_F15 = "";
            Keyboard.STRING_F16 = "";
            Keyboard.STRING_F17 = "";
            Keyboard.STRING_F18 = "";
            Keyboard.STRING_F19 = "";
            Keyboard.STRING_F20 = "";
            Keyboard.STRING_F21 = "";
            Keyboard.STRING_F22 = "";
            Keyboard.STRING_F23 = "";
            Keyboard.STRING_F24 = "";
            Keyboard.STRING_F25 = "";
            Keyboard.STRING_F26 = "";
            Keyboard.STRING_F27 = "";
            Keyboard.STRING_F28 = "";
            Keyboard.STRING_F29 = "";
            Keyboard.STRING_F30 = "";
            Keyboard.STRING_F31 = "";
            Keyboard.STRING_F32 = "";
            Keyboard.STRING_F33 = "";
            Keyboard.STRING_F34 = "";
            Keyboard.STRING_F35 = "";
            Keyboard.STRING_INSERT = "";
            Keyboard.STRING_DELETE = "";
            Keyboard.STRING_HOME = "";
            Keyboard.STRING_BEGIN = "";
            Keyboard.STRING_END = "";
            Keyboard.STRING_PAGEUP = "";
            Keyboard.STRING_PAGEDOWN = "";
            Keyboard.STRING_PRINTSCREEN = "";
            Keyboard.STRING_SCROLLLOCK = "";
            Keyboard.STRING_PAUSE = "";
            Keyboard.STRING_SYSREQ = "";
            Keyboard.STRING_BREAK = "";
            Keyboard.STRING_RESET = "";
            Keyboard.STRING_STOP = "";
            Keyboard.STRING_MENU = "";
            Keyboard.STRING_USER = "";
            Keyboard.STRING_SYSTEM = "";
            Keyboard.STRING_PRINT = "";
            Keyboard.STRING_CLEARLINE = "";
            Keyboard.STRING_CLEARDISPLAY = "";
            Keyboard.STRING_INSERTLINE = "";
            Keyboard.STRING_DELETELINE = "";
            Keyboard.STRING_INSERTCHAR = "";
            Keyboard.STRING_DELETECHAR = "";
            Keyboard.STRING_PREV = "";
            Keyboard.STRING_NEXT = "";
            Keyboard.STRING_SELECT = "";
            Keyboard.STRING_EXECUTE = "";
            Keyboard.STRING_UNDO = "";
            Keyboard.STRING_REDO = "";
            Keyboard.STRING_FIND = "";
            Keyboard.STRING_HELP = "";
            Keyboard.STRING_MODESWITCH = "";
            Keyboard.CharCodeStrings = undefined;
            Keyboard.NUMBER_0 = 48;
            Keyboard.NUMBER_1 = 49;
            Keyboard.NUMBER_2 = 50;
            Keyboard.NUMBER_3 = 51;
            Keyboard.NUMBER_4 = 52;
            Keyboard.NUMBER_5 = 53;
            Keyboard.NUMBER_6 = 54;
            Keyboard.NUMBER_7 = 55;
            Keyboard.NUMBER_8 = 56;
            Keyboard.NUMBER_9 = 57;
            Keyboard.A = 65;
            Keyboard.B = 66;
            Keyboard.C = 67;
            Keyboard.D = 68;
            Keyboard.E = 69;
            Keyboard.F = 70;
            Keyboard.G = 71;
            Keyboard.H = 72;
            Keyboard.I = 73;
            Keyboard.J = 74;
            Keyboard.K = 75;
            Keyboard.L = 76;
            Keyboard.M = 77;
            Keyboard.N = 78;
            Keyboard.O = 79;
            Keyboard.P = 80;
            Keyboard.Q = 81;
            Keyboard.R = 82;
            Keyboard.S = 83;
            Keyboard.T = 84;
            Keyboard.U = 85;
            Keyboard.V = 86;
            Keyboard.W = 87;
            Keyboard.X = 88;
            Keyboard.Y = 89;
            Keyboard.Z = 90;
            Keyboard.SEMICOLON = 186;
            Keyboard.EQUAL = 187;
            Keyboard.COMMA = 188;
            Keyboard.MINUS = 189;
            Keyboard.PERIOD = 190;
            Keyboard.SLASH = 191;
            Keyboard.BACKQUOTE = 192;
            Keyboard.LEFTBRACKET = 219;
            Keyboard.BACKSLASH = 220;
            Keyboard.RIGHTBRACKET = 221;
            Keyboard.QUOTE = 222;
            Keyboard.ALTERNATE = 18;
            Keyboard.BACKSPACE = 8;
            Keyboard.CAPS_LOCK = 20;
            Keyboard.COMMAND = 15;
            Keyboard.CONTROL = 17;
            Keyboard.DELETE = 46;
            Keyboard.DOWN = 40;
            Keyboard.END = 35;
            Keyboard.ENTER = 13;
            Keyboard.ESCAPE = 27;
            Keyboard.F1 = 112;
            Keyboard.F2 = 113;
            Keyboard.F3 = 114;
            Keyboard.F4 = 115;
            Keyboard.F5 = 116;
            Keyboard.F6 = 117;
            Keyboard.F7 = 118;
            Keyboard.F8 = 119;
            Keyboard.F9 = 120;
            Keyboard.F10 = 121;
            Keyboard.F11 = 122;
            Keyboard.F12 = 123;
            Keyboard.F13 = 124;
            Keyboard.F14 = 125;
            Keyboard.F15 = 126;
            Keyboard.HOME = 36;
            Keyboard.INSERT = 45;
            Keyboard.LEFT = 37;
            Keyboard.NUMPAD = 21;
            Keyboard.NUMPAD_0 = 96;
            Keyboard.NUMPAD_1 = 97;
            Keyboard.NUMPAD_2 = 98;
            Keyboard.NUMPAD_3 = 99;
            Keyboard.NUMPAD_4 = 100;
            Keyboard.NUMPAD_5 = 101;
            Keyboard.NUMPAD_6 = 102;
            Keyboard.NUMPAD_7 = 103;
            Keyboard.NUMPAD_8 = 104;
            Keyboard.NUMPAD_9 = 105;
            Keyboard.NUMPAD_ADD = 107;
            Keyboard.NUMPAD_DECIMAL = 110;
            Keyboard.NUMPAD_DIVIDE = 111;
            Keyboard.NUMPAD_ENTER = 108;
            Keyboard.NUMPAD_MULTIPLY = 106;
            Keyboard.NUMPAD_SUBTRACT = 109;
            Keyboard.PAGE_DOWN = 34;
            Keyboard.PAGE_UP = 33;
            Keyboard.RIGHT = 39;
            Keyboard.SHIFT = 16;
            Keyboard.SPACE = 32;
            Keyboard.TAB = 9;
            Keyboard.UP = 38;
            Keyboard.RED = 16777216;
            Keyboard.GREEN = 16777217;
            Keyboard.YELLOW = 16777218;
            Keyboard.BLUE = 16777219;
            Keyboard.CHANNEL_UP = 16777220;
            Keyboard.CHANNEL_DOWN = 16777221;
            Keyboard.RECORD = 16777222;
            Keyboard.PLAY = 16777223;
            Keyboard.PAUSE = 16777224;
            Keyboard.STOP = 16777225;
            Keyboard.FAST_FORWARD = 16777226;
            Keyboard.REWIND = 16777227;
            Keyboard.SKIP_FORWARD = 16777228;
            Keyboard.SKIP_BACKWARD = 16777229;
            Keyboard.NEXT = 16777230;
            Keyboard.PREVIOUS = 16777231;
            Keyboard.LIVE = 16777232;
            Keyboard.LAST = 16777233;
            Keyboard.MENU = 16777234;
            Keyboard.INFO = 16777235;
            Keyboard.GUIDE = 16777236;
            Keyboard.EXIT = 16777237;
            Keyboard.BACK = 16777238;
            Keyboard.AUDIO = 16777239;
            Keyboard.SUBTITLE = 16777240;
            Keyboard.DVR = 16777241;
            Keyboard.VOD = 16777242;
            Keyboard.INPUT = 16777243;
            Keyboard.SETUP = 16777244;
            Keyboard.HELP = 16777245;
            Keyboard.MASTER_SHELL = 16777246;
            Keyboard.SEARCH = 16777247;
            return Keyboard;
          })(AS.ASNative);
          ui.Keyboard = Keyboard;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;

          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var InteractiveObject = flash.display.InteractiveObject;

          var events = flash.events;

          var MouseEventDispatcher = (function () {
            function MouseEventDispatcher() {
              this.stage = null;
              this.currentTarget = null;
            }
            MouseEventDispatcher.prototype._findTarget = function (point) {
              var objects = this.stage.getObjectsUnderMouse(point);
              var target;
              var i = objects.length;
              while (i--) {
                var object = objects[i];
                if (!flash.display.InteractiveObject.isType(object)) {
                  var j = i;
                  while (j--) {
                    var sibling = objects[j];
                    if (sibling._parent === object._parent && InteractiveObject.isType(sibling)) {
                      object = sibling;
                      i = j;
                      break;
                    }
                  }
                }
                target = object.findFurthestInteractiveAncestorOrSelf();
                if (!target) {
                  continue;
                }
                if (target.mouseEnabled) {
                  break;
                }
                if (flash.display.Sprite.isType(target)) {
                  var hitTarget = target._hitTarget;
                  if (hitTarget && hitTarget.mouseEnabled) {
                    target = hitTarget;
                    break;
                  }
                }
              }
              return target;
            };

            MouseEventDispatcher.prototype._dispatchMouseEvent = function (target, type, data, relatedObject) {
              if (typeof relatedObject === "undefined") { relatedObject = null; }
              var localPoint = target.globalToLocal(data.point);
              var event = new events.MouseEvent(type, type !== events.MouseEvent.ROLL_OVER && type !== events.MouseEvent.ROLL_OUT && type !== events.MouseEvent.MOUSE_LEAVE, false, localPoint.x, localPoint.y, relatedObject, data.ctrlKey, data.altKey, data.shiftKey, !!data.buttons);
              target.dispatchEvent(event);
            };

            MouseEventDispatcher.prototype.handleMouseEvent = function (data) {
              var stage = this.stage;
              if (!stage) {
                return stage;
              }

              var globalPoint = data.point;
              flash.ui.Mouse.updateCurrentPosition(globalPoint);
              var currentTarget = this.currentTarget;

              if (globalPoint.x < 0 || globalPoint.x > stage.stageWidth || globalPoint.y < 0 || globalPoint.y > stage.stageHeight) {
                if (currentTarget) {
                  this._dispatchMouseEvent(stage, events.MouseEvent.MOUSE_LEAVE, data);
                }
                this.currentTarget = null;
                return stage;
              }

              var target = this._findTarget(globalPoint) || stage;
              var type = flash.events.MouseEvent.typeFromDOMType(data.type);
              switch (type) {
                case events.MouseEvent.MOUSE_DOWN:
                  if (data.buttons & 1 /* Left */) {
                    data.buttons = 1 /* Left */;
                  } else if (data.buttons & 2 /* Middle */) {
                    type = events.MouseEvent.MIDDLE_MOUSE_DOWN;
                    data.buttons = 2 /* Middle */;
                  } else if (data.buttons & 4 /* Right */) {
                    type = events.MouseEvent.RIGHT_MOUSE_DOWN;
                    data.buttons = 4 /* Right */;
                  }
                  target._mouseDown = true;
                  break;
                case events.MouseEvent.MOUSE_UP:
                  if (data.buttons & 1 /* Left */) {
                    data.buttons = 1 /* Left */;
                  } else if (data.buttons & 2 /* Middle */) {
                    type = events.MouseEvent.MIDDLE_MOUSE_UP;
                    data.buttons = 2 /* Middle */;
                  } else if (data.buttons & 4 /* Right */) {
                    type = events.MouseEvent.RIGHT_MOUSE_UP;
                    data.buttons = 4 /* Right */;
                  }
                  target._mouseDown = false;
                  break;
                case events.MouseEvent.CLICK:
                  if (!(data.buttons & 1 /* Left */)) {
                    if (data.buttons & 2 /* Middle */) {
                      type = events.MouseEvent.MIDDLE_CLICK;
                    } else if (data.buttons & 4 /* Right */) {
                      type = events.MouseEvent.RIGHT_CLICK;
                    }
                  }
                  data.buttons = 0;
                  break;
                case events.MouseEvent.DOUBLE_CLICK:
                  if (!target.doubleClickEnabled) {
                    return;
                  }
                  data.buttons = 0;
                  break;
                case events.MouseEvent.MOUSE_MOVE:
                  this.currentTarget = target;
                  data.buttons &= 1 /* Left */;
                  if (target === currentTarget) {
                    break;
                  }
                  var commonAncestor = target.findNearestCommonAncestor(currentTarget);
                  if (currentTarget && currentTarget !== stage) {
                    currentTarget._mouseOver = false;

                    currentTarget._mouseDown = false;
                    this._dispatchMouseEvent(currentTarget, events.MouseEvent.MOUSE_OUT, data, target);
                    var nodeLeft = currentTarget;
                    while (nodeLeft !== commonAncestor) {
                      this._dispatchMouseEvent(nodeLeft, events.MouseEvent.ROLL_OUT, data, target);
                      nodeLeft = nodeLeft.parent;
                    }
                  }
                  if (target === stage) {
                    break;
                  }
                  var nodeEntered = target;
                  while (nodeEntered !== commonAncestor) {
                    this._dispatchMouseEvent(nodeEntered, events.MouseEvent.ROLL_OVER, data, currentTarget);
                    nodeEntered = nodeEntered.parent;
                  }
                  target._mouseOver = true;
                  this._dispatchMouseEvent(target, events.MouseEvent.MOUSE_OVER, data, currentTarget);
                  return target;
              }

              this._dispatchMouseEvent(target, type, data);
              return target;
            };
            return MouseEventDispatcher;
          })();
          ui.MouseEventDispatcher = MouseEventDispatcher;

          (function (MouseButtonFlags) {
            MouseButtonFlags[MouseButtonFlags["Left"] = 0x01] = "Left";
            MouseButtonFlags[MouseButtonFlags["Middle"] = 0x02] = "Middle";
            MouseButtonFlags[MouseButtonFlags["Right"] = 0x04] = "Right";
          })(ui.MouseButtonFlags || (ui.MouseButtonFlags = {}));
          var MouseButtonFlags = ui.MouseButtonFlags;

          var Mouse = (function (_super) {
            __extends(Mouse, _super);
            function Mouse() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.Mouse");
            }
            Object.defineProperty(Mouse.prototype, "supportsCursor", {
              get: function () {
                notImplemented("public flash.ui.Mouse::get supportsCursor");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Mouse.prototype, "cursor", {
              get: function () {
                notImplemented("public flash.ui.Mouse::get cursor");
                return;
              },
              set: function (value) {
                value = asCoerceString(value);
                notImplemented("public flash.ui.Mouse::set cursor");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Mouse.prototype, "supportsNativeCursor", {
              get: function () {
                notImplemented("public flash.ui.Mouse::get supportsNativeCursor");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Mouse.hide = function () {
              somewhatImplemented("public flash.ui.Mouse::static hide");
              return;
            };
            Mouse.show = function () {
              somewhatImplemented("public flash.ui.Mouse::static show");
              return;
            };
            Mouse.registerCursor = function (name, cursor) {
              name = asCoerceString(name);
              cursor = cursor;
              notImplemented("public flash.ui.Mouse::static registerCursor");
              return;
            };
            Mouse.unregisterCursor = function (name) {
              name = asCoerceString(name);
              notImplemented("public flash.ui.Mouse::static unregisterCursor");
              return;
            };

            Mouse.updateCurrentPosition = function (value) {
              this._currentPosition.copyFrom(value);
            };
            Mouse.classInitializer = function () {
              this._currentPosition = new flash.geom.Point();
            };

            Mouse.initializer = null;

            Mouse.classSymbols = null;

            Mouse.instanceSymbols = null;
            return Mouse;
          })(AS.ASNative);
          ui.Mouse = Mouse;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var MouseCursorData = (function (_super) {
            __extends(MouseCursorData, _super);
            function MouseCursorData() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.MouseCursorData");
            }
            Object.defineProperty(MouseCursorData.prototype, "data", {
              get: function () {
                notImplemented("public flash.ui.MouseCursorData::get data");
                return;
              },
              set: function (data) {
                data = data;
                notImplemented("public flash.ui.MouseCursorData::set data");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(MouseCursorData.prototype, "hotSpot", {
              get: function () {
                notImplemented("public flash.ui.MouseCursorData::get hotSpot");
                return;
              },
              set: function (data) {
                data = data;
                notImplemented("public flash.ui.MouseCursorData::set hotSpot");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(MouseCursorData.prototype, "frameRate", {
              get: function () {
                notImplemented("public flash.ui.MouseCursorData::get frameRate");
                return;
              },
              set: function (data) {
                data = +data;
                notImplemented("public flash.ui.MouseCursorData::set frameRate");
                return;
              },
              enumerable: true,
              configurable: true
            });
            MouseCursorData.classInitializer = null;

            MouseCursorData.initializer = null;

            MouseCursorData.classSymbols = null;

            MouseCursorData.instanceSymbols = null;
            return MouseCursorData;
          })(AS.ASNative);
          ui.MouseCursorData = MouseCursorData;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var somewhatImplemented = Shumway.Debug.somewhatImplemented;
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var Multitouch = (function (_super) {
            __extends(Multitouch, _super);
            function Multitouch() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.Multitouch");
            }
            Object.defineProperty(Multitouch.prototype, "inputMode", {
              get: function () {
                notImplemented("public flash.ui.Multitouch::get inputMode");
                return;
              },
              set: function (value) {
                value = asCoerceString(value);
                notImplemented("public flash.ui.Multitouch::set inputMode");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Multitouch.prototype, "supportsTouchEvents", {
              get: function () {
                somewhatImplemented("public flash.ui.Multitouch::get supportsTouchEvents");
                return false;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Multitouch.prototype, "supportsGestureEvents", {
              get: function () {
                somewhatImplemented("public flash.ui.Multitouch::get supportsGestureEvents");
                return false;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Multitouch.prototype, "supportedGestures", {
              get: function () {
                somewhatImplemented("public flash.ui.Multitouch::get supportedGestures");
                return null;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Multitouch.prototype, "maxTouchPoints", {
              get: function () {
                somewhatImplemented("public flash.ui.Multitouch::get maxTouchPoints");
                return 0;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(Multitouch.prototype, "mapTouchToMouse", {
              get: function () {
                somewhatImplemented("public flash.ui.Multitouch::get mapTouchToMouse");
                return true;
              },
              set: function (value) {
                value = !!value;
                notImplemented("public flash.ui.Multitouch::set mapTouchToMouse");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Multitouch.classInitializer = null;

            Multitouch.initializer = null;

            Multitouch.classSymbols = null;

            Multitouch.instanceSymbols = null;
            return Multitouch;
          })(AS.ASNative);
          ui.Multitouch = Multitouch;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (ui) {
          var notImplemented = Shumway.Debug.notImplemented;

          var MultitouchInputMode = (function (_super) {
            __extends(MultitouchInputMode, _super);
            function MultitouchInputMode() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.ui.MultitouchInputMode");
            }
            MultitouchInputMode.classInitializer = null;

            MultitouchInputMode.initializer = null;

            MultitouchInputMode.classSymbols = null;

            MultitouchInputMode.instanceSymbols = null;

            MultitouchInputMode.NONE = "none";
            MultitouchInputMode.GESTURE = "gesture";
            MultitouchInputMode.TOUCH_POINT = "touchPoint";
            return MultitouchInputMode;
          })(AS.ASNative);
          ui.MultitouchInputMode = MultitouchInputMode;
        })(flash.ui || (flash.ui = {}));
        var ui = flash.ui;
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
      (function (flash) {
        (function (utils) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Endian = (function (_super) {
            __extends(Endian, _super);
            function Endian() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.utils.Endian");
            }
            Endian.classInitializer = null;

            Endian.initializer = null;

            Endian.classSymbols = null;

            Endian.instanceSymbols = null;

            Endian.BIG_ENDIAN = "bigEndian";
            Endian.LITTLE_ENDIAN = "littleEndian";
            return Endian;
          })(AS.ASNative);
          utils.Endian = Endian;
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
      (function (flash) {
        (function (utils) {
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
      (function (flash) {
        (function (utils) {
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
      (function (flash) {
        (function (utils) {
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
      (function (flash) {
        (function (utils) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var ObjectInput = (function (_super) {
            __extends(ObjectInput, _super);
            function ObjectInput() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: packageInternal flash.utils.ObjectInput");
            }
            Object.defineProperty(ObjectInput.prototype, "bytesAvailable", {
              get: function () {
                notImplemented("packageInternal flash.utils.ObjectInput::get bytesAvailable");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ObjectInput.prototype, "objectEncoding", {
              get: function () {
                notImplemented("packageInternal flash.utils.ObjectInput::get objectEncoding");
                return;
              },
              set: function (version) {
                version = version >>> 0;
                notImplemented("packageInternal flash.utils.ObjectInput::set objectEncoding");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ObjectInput.prototype, "endian", {
              get: function () {
                notImplemented("packageInternal flash.utils.ObjectInput::get endian");
                return;
              },
              set: function (type) {
                type = asCoerceString(type);
                notImplemented("packageInternal flash.utils.ObjectInput::set endian");
                return;
              },
              enumerable: true,
              configurable: true
            });
            ObjectInput.prototype.readBytes = function (bytes, offset, length) {
              if (typeof offset === "undefined") { offset = 0; }
              if (typeof length === "undefined") { length = 0; }
              bytes = bytes;
              offset = offset >>> 0;
              length = length >>> 0;
              notImplemented("packageInternal flash.utils.ObjectInput::readBytes");
              return;
            };
            ObjectInput.prototype.readBoolean = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readBoolean");
              return;
            };
            ObjectInput.prototype.readByte = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readByte");
              return;
            };
            ObjectInput.prototype.readUnsignedByte = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readUnsignedByte");
              return;
            };
            ObjectInput.prototype.readShort = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readShort");
              return;
            };
            ObjectInput.prototype.readUnsignedShort = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readUnsignedShort");
              return;
            };
            ObjectInput.prototype.readInt = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readInt");
              return;
            };
            ObjectInput.prototype.readUnsignedInt = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readUnsignedInt");
              return;
            };
            ObjectInput.prototype.readFloat = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readFloat");
              return;
            };
            ObjectInput.prototype.readDouble = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readDouble");
              return;
            };
            ObjectInput.prototype.readMultiByte = function (length, charSet) {
              length = length >>> 0;
              charSet = asCoerceString(charSet);
              notImplemented("packageInternal flash.utils.ObjectInput::readMultiByte");
              return;
            };
            ObjectInput.prototype.readUTF = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readUTF");
              return;
            };
            ObjectInput.prototype.readUTFBytes = function (length) {
              length = length >>> 0;
              notImplemented("packageInternal flash.utils.ObjectInput::readUTFBytes");
              return;
            };
            ObjectInput.prototype.readObject = function () {
              notImplemented("packageInternal flash.utils.ObjectInput::readObject");
              return;
            };
            ObjectInput.classInitializer = null;

            ObjectInput.initializer = null;

            ObjectInput.classSymbols = null;

            ObjectInput.instanceSymbols = null;
            return ObjectInput;
          })(AS.ASNative);
          utils.ObjectInput = ObjectInput;
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
      (function (flash) {
        (function (utils) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var ObjectOutput = (function (_super) {
            __extends(ObjectOutput, _super);
            function ObjectOutput() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: packageInternal flash.utils.ObjectOutput");
            }
            Object.defineProperty(ObjectOutput.prototype, "objectEncoding", {
              get: function () {
                notImplemented("packageInternal flash.utils.ObjectOutput::get objectEncoding");
                return;
              },
              set: function (version) {
                version = version >>> 0;
                notImplemented("packageInternal flash.utils.ObjectOutput::set objectEncoding");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(ObjectOutput.prototype, "endian", {
              get: function () {
                notImplemented("packageInternal flash.utils.ObjectOutput::get endian");
                return;
              },
              set: function (type) {
                type = asCoerceString(type);
                notImplemented("packageInternal flash.utils.ObjectOutput::set endian");
                return;
              },
              enumerable: true,
              configurable: true
            });
            ObjectOutput.prototype.writeBytes = function (bytes, offset, length) {
              if (typeof offset === "undefined") { offset = 0; }
              if (typeof length === "undefined") { length = 0; }
              bytes = bytes;
              offset = offset >>> 0;
              length = length >>> 0;
              notImplemented("packageInternal flash.utils.ObjectOutput::writeBytes");
              return;
            };
            ObjectOutput.prototype.writeBoolean = function (value) {
              value = !!value;
              notImplemented("packageInternal flash.utils.ObjectOutput::writeBoolean");
              return;
            };
            ObjectOutput.prototype.writeByte = function (value) {
              value = value | 0;
              notImplemented("packageInternal flash.utils.ObjectOutput::writeByte");
              return;
            };
            ObjectOutput.prototype.writeShort = function (value) {
              value = value | 0;
              notImplemented("packageInternal flash.utils.ObjectOutput::writeShort");
              return;
            };
            ObjectOutput.prototype.writeInt = function (value) {
              value = value | 0;
              notImplemented("packageInternal flash.utils.ObjectOutput::writeInt");
              return;
            };
            ObjectOutput.prototype.writeUnsignedInt = function (value) {
              value = value >>> 0;
              notImplemented("packageInternal flash.utils.ObjectOutput::writeUnsignedInt");
              return;
            };
            ObjectOutput.prototype.writeFloat = function (value) {
              value = +value;
              notImplemented("packageInternal flash.utils.ObjectOutput::writeFloat");
              return;
            };
            ObjectOutput.prototype.writeDouble = function (value) {
              value = +value;
              notImplemented("packageInternal flash.utils.ObjectOutput::writeDouble");
              return;
            };
            ObjectOutput.prototype.writeMultiByte = function (value, charSet) {
              value = asCoerceString(value);
              charSet = asCoerceString(charSet);
              notImplemented("packageInternal flash.utils.ObjectOutput::writeMultiByte");
              return;
            };
            ObjectOutput.prototype.writeUTF = function (value) {
              value = asCoerceString(value);
              notImplemented("packageInternal flash.utils.ObjectOutput::writeUTF");
              return;
            };
            ObjectOutput.prototype.writeUTFBytes = function (value) {
              value = asCoerceString(value);
              notImplemented("packageInternal flash.utils.ObjectOutput::writeUTFBytes");
              return;
            };
            ObjectOutput.prototype.writeObject = function (object) {
              notImplemented("packageInternal flash.utils.ObjectOutput::writeObject");
              return;
            };
            ObjectOutput.classInitializer = null;

            ObjectOutput.initializer = null;

            ObjectOutput.classSymbols = null;

            ObjectOutput.instanceSymbols = null;
            return ObjectOutput;
          })(AS.ASNative);
          utils.ObjectOutput = ObjectOutput;
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
      (function (flash) {
        (function (utils) {
          var notImplemented = Shumway.Debug.notImplemented;

          var Timer = (function (_super) {
            __extends(Timer, _super);
            function Timer(delay, repeatCount) {
              if (typeof repeatCount === "undefined") { repeatCount = 0; }
              false && _super.call(this, undefined);
              notImplemented("Dummy Constructor: public flash.utils.Timer");
            }
            Object.defineProperty(Timer.prototype, "running", {
              get: function () {
                return this._running;
              },
              enumerable: true,
              configurable: true
            });
            Timer.prototype.stop = function () {
              this._running = false;
              clearInterval(this._interval);
            };
            Timer.prototype._start = function (delay, closure) {
              this._delay = +delay;
              this._running = true;
              this._interval = setInterval(closure, delay);
            };
            Timer.prototype._tick = function () {
              if (!this._running) {
                return;
              }
              if (flash.utils.Timer.dispatchingEnabled) {
                this.dispatchEvent(new flash.events.TimerEvent("timer", true, false));
              }
            };
            Timer.classInitializer = null;
            Timer.initializer = null;
            Timer.classSymbols = null;
            Timer.instanceSymbols = ["start!"];

            Timer.dispatchingEnabled = true;
            return Timer;
          })(flash.events.EventDispatcher);
          utils.Timer = Timer;
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
      (function (flash) {
        (function (utils) {
          var notImplemented = Shumway.Debug.notImplemented;

          var SetIntervalTimer = (function (_super) {
            __extends(SetIntervalTimer, _super);
            function SetIntervalTimer(closure, delay, repeats, rest) {
              closure = closure;
              delay = +delay;
              repeats = !!repeats;
              rest = rest;
              false && _super.call(this, undefined, undefined);
              notImplemented("Dummy Constructor: packageInternal flash.utils.SetIntervalTimer");
            }
            SetIntervalTimer.classInitializer = null;

            SetIntervalTimer.initializer = null;

            SetIntervalTimer.classSymbols = null;

            SetIntervalTimer.instanceSymbols = null;
            return SetIntervalTimer;
          })(flash.utils.Timer);
          utils.SetIntervalTimer = SetIntervalTimer;
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
      (function (flash) {
        (function (xml) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var XMLNode = (function (_super) {
            __extends(XMLNode, _super);
            function XMLNode(type, value) {
              type = type >>> 0;
              value = asCoerceString(value);
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.xml.XMLNode");
            }
            XMLNode.escapeXML = function (value) {
              value = asCoerceString(value);
              notImplemented("public flash.xml.XMLNode::static escapeXML");
              return;
            };
            XMLNode.initializer = null;
            return XMLNode;
          })(AS.ASNative);
          xml.XMLNode = XMLNode;
        })(flash.xml || (flash.xml = {}));
        var xml = flash.xml;
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
      (function (flash) {
        (function (xml) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var XMLDocument = (function (_super) {
            __extends(XMLDocument, _super);
            function XMLDocument(source) {
              if (typeof source === "undefined") { source = null; }
              source = asCoerceString(source);
              false && _super.call(this, undefined, undefined);
              notImplemented("Dummy Constructor: public flash.xml.XMLDocument");
            }
            XMLDocument.initializer = null;
            return XMLDocument;
          })(flash.xml.XMLNode);
          xml.XMLDocument = XMLDocument;
        })(flash.xml || (flash.xml = {}));
        var xml = flash.xml;
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
      (function (flash) {
        (function (xml) {
          var notImplemented = Shumway.Debug.notImplemented;

          var XMLNodeType = (function (_super) {
            __extends(XMLNodeType, _super);
            function XMLNodeType() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: public flash.xml.XMLNodeType");
            }
            XMLNodeType.initializer = null;
            return XMLNodeType;
          })(AS.ASNative);
          xml.XMLNodeType = XMLNodeType;
        })(flash.xml || (flash.xml = {}));
        var xml = flash.xml;
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
      (function (flash) {
        (function (xml) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var XMLParser = (function (_super) {
            __extends(XMLParser, _super);
            function XMLParser() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: packageInternal flash.xml.XMLParser");
            }
            XMLParser.prototype.startParse = function (source, ignoreWhite) {
              source = asCoerceString(source);
              ignoreWhite = !!ignoreWhite;
              notImplemented("packageInternal flash.xml.XMLParser::startParse");
              return;
            };
            XMLParser.prototype.getNext = function (tag) {
              tag = tag;
              notImplemented("packageInternal flash.xml.XMLParser::getNext");
              return;
            };
            XMLParser.initializer = null;
            return XMLParser;
          })(AS.ASNative);
          xml.XMLParser = XMLParser;
        })(flash.xml || (flash.xml = {}));
        var xml = flash.xml;
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
      (function (flash) {
        (function (xml) {
          var notImplemented = Shumway.Debug.notImplemented;
          var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
          var XMLTag = (function (_super) {
            __extends(XMLTag, _super);
            function XMLTag() {
              false && _super.call(this);
              notImplemented("Dummy Constructor: packageInternal flash.xml.XMLTag");
            }
            Object.defineProperty(XMLTag.prototype, "type", {
              get: function () {
                notImplemented("packageInternal flash.xml.XMLTag::get type");
                return;
              },
              set: function (value) {
                value = value >>> 0;
                notImplemented("packageInternal flash.xml.XMLTag::set type");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(XMLTag.prototype, "empty", {
              get: function () {
                notImplemented("packageInternal flash.xml.XMLTag::get empty");
                return;
              },
              set: function (value) {
                value = !!value;
                notImplemented("packageInternal flash.xml.XMLTag::set empty");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(XMLTag.prototype, "value", {
              get: function () {
                notImplemented("packageInternal flash.xml.XMLTag::get value");
                return;
              },
              set: function (v) {
                v = asCoerceString(v);
                notImplemented("packageInternal flash.xml.XMLTag::set value");
                return;
              },
              enumerable: true,
              configurable: true
            });
            Object.defineProperty(XMLTag.prototype, "attrs", {
              get: function () {
                notImplemented("packageInternal flash.xml.XMLTag::get attrs");
                return;
              },
              set: function (value) {
                value = value;
                notImplemented("packageInternal flash.xml.XMLTag::set attrs");
                return;
              },
              enumerable: true,
              configurable: true
            });
            XMLTag.initializer = null;
            return XMLTag;
          })(AS.ASNative);
          xml.XMLTag = XMLTag;
        })(flash.xml || (flash.xml = {}));
        var xml = flash.xml;
      })(AS.flash || (AS.flash = {}));
      var flash = AS.flash;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (Timeline) {
    var notImplemented = Shumway.Debug.notImplemented;
    var isInteger = Shumway.isInteger;
    var assert = Shumway.Debug.assert;

    var Bounds = Shumway.Bounds;

    var flash = Shumway.AVM2.AS.flash;
    var PlaceObjectFlags = Shumway.SWF.Parser.PlaceObjectFlags;

    var ActionScriptVersion = Shumway.AVM2.AS.flash.display.ActionScriptVersion;

    var Symbol = (function () {
      function Symbol(id, symbolClass) {
        this.id = -1;
        release || assert(isInteger(id));
        this.id = id;
        this.symbolClass = symbolClass;
        this.isAS2Object = false;
      }
      return Symbol;
    })();
    Timeline.Symbol = Symbol;

    var DisplaySymbol = (function (_super) {
      __extends(DisplaySymbol, _super);
      function DisplaySymbol(id, symbolClass, dynamic) {
        if (typeof dynamic === "undefined") { dynamic = true; }
        _super.call(this, id, symbolClass);
        this.dynamic = dynamic;
      }
      DisplaySymbol.prototype._setBoundsFromData = function (data) {
        this.fillBounds = data.fillBounds ? Bounds.FromUntyped(data.fillBounds) : null;
        this.lineBounds = data.lineBounds ? Bounds.FromUntyped(data.lineBounds) : null;
        if (!this.lineBounds && this.fillBounds) {
          this.lineBounds = this.fillBounds.clone();
        }
      };
      return DisplaySymbol;
    })(Symbol);
    Timeline.DisplaySymbol = DisplaySymbol;

    var ShapeSymbol = (function (_super) {
      __extends(ShapeSymbol, _super);
      function ShapeSymbol(id, symbolClass) {
        if (typeof symbolClass === "undefined") { symbolClass = flash.display.Shape; }
        _super.call(this, id, symbolClass, false);
        this.graphics = null;
      }
      ShapeSymbol.FromData = function (data, loaderInfo) {
        var symbol = new ShapeSymbol(data.id);
        symbol._setBoundsFromData(data);
        symbol.graphics = flash.display.Graphics.FromData(data);
        symbol.processRequires(data.require, loaderInfo);
        return symbol;
      };

      ShapeSymbol.prototype.processRequires = function (dependencies, loaderInfo) {
        if (!dependencies) {
          return;
        }
        var textures = this.graphics.getUsedTextures();
        for (var i = 0; i < dependencies.length; i++) {
          var bitmap = loaderInfo.getSymbolById(dependencies[i]);
          release || assert(bitmap, "Bitmap symbol is not defined.");
          var bitmapData = bitmap.symbolClass.initializeFrom(bitmap);
          bitmap.symbolClass.instanceConstructorNoInitialize.call(bitmapData);
          textures.push(bitmapData);
        }
      };
      return ShapeSymbol;
    })(DisplaySymbol);
    Timeline.ShapeSymbol = ShapeSymbol;

    var MorphShapeSymbol = (function (_super) {
      __extends(MorphShapeSymbol, _super);
      function MorphShapeSymbol(id) {
        _super.call(this, id, flash.display.MorphShape);
      }
      MorphShapeSymbol.FromData = function (data, loaderInfo) {
        var symbol = new MorphShapeSymbol(data.id);
        symbol._setBoundsFromData(data);
        symbol.graphics = flash.display.Graphics.FromData(data);
        symbol.processRequires(data.require, loaderInfo);
        symbol.morphFillBounds = data.morphFillBounds;
        symbol.morphLineBounds = data.morphLineBounds;
        return symbol;
      };
      return MorphShapeSymbol;
    })(ShapeSymbol);
    Timeline.MorphShapeSymbol = MorphShapeSymbol;

    var BitmapSymbol = (function (_super) {
      __extends(BitmapSymbol, _super);
      function BitmapSymbol(id) {
        _super.call(this, id, flash.display.BitmapData);
      }
      BitmapSymbol.FromData = function (data) {
        var symbol = new BitmapSymbol(data.id);
        symbol.width = data.width;
        symbol.height = data.height;
        symbol.data = data.data;
        switch (data.mimeType) {
          case "application/octet-stream":
            symbol.type = data.dataType;
            break;
          case "image/jpeg":
            symbol.type = 4 /* JPEG */;
            break;
          case "image/png":
            symbol.type = 5 /* PNG */;
            break;
          case "image/gif":
            symbol.type = 6 /* GIF */;
            break;
          default:
            notImplemented(data.mimeType);
        }
        return symbol;
      };
      return BitmapSymbol;
    })(DisplaySymbol);
    Timeline.BitmapSymbol = BitmapSymbol;

    var TextSymbol = (function (_super) {
      __extends(TextSymbol, _super);
      function TextSymbol(id) {
        _super.call(this, id, flash.text.TextField);
        this.color = 0;
        this.size = 0;
        this.font = "";
        this.fontClass = null;
        this.align = flash.text.TextFormatAlign.LEFT;
        this.leftMargin = 0;
        this.rightMargin = 0;
        this.indent = 0;
        this.leading = 0;
        this.multiline = false;
        this.wordWrap = false;
        this.embedFonts = false;
        this.selectable = true;
        this.border = false;
        this.initialText = "";
        this.html = false;
        this.displayAsPassword = false;
        this.type = flash.text.TextFieldType.DYNAMIC;
        this.maxChars = 0;
        this.autoSize = flash.text.TextFieldAutoSize.NONE;
        this.variableName = null;
        this.textContent = null;
      }
      TextSymbol.FromTextData = function (data) {
        var symbol = new TextSymbol(data.id);
        symbol._setBoundsFromData(data);
        var tag = data.tag;
        if (data.static) {
          symbol.dynamic = false;
          symbol.symbolClass = flash.text.StaticText;
          if (tag.initialText) {
            var textContent = new Shumway.TextContent();
            textContent.bounds = symbol.lineBounds;
            textContent.parseHtml(tag.initialText);
            textContent.matrix = flash.geom.Matrix.FromUntyped(data.matrix);
            textContent.coords = data.coords;
            symbol.textContent = textContent;
          }
        }
        if (tag.hasColor) {
          symbol.color = tag.color >>> 8;
        }
        if (tag.hasFont) {
          symbol.size = tag.fontHeight;
          var font = flash.text.Font.getBySymbolId(tag.fontId);
          if (font) {
            symbol.font = font.fontName;
            if (tag.fontClass) {
              var appDomain = Shumway.AVM2.Runtime.AVM2.instance.applicationDomain;
              symbol.fontClass = appDomain.getClass(tag.fontClass);
            }
          } else {
            Shumway.Debug.warning("Font is not defined.");
          }
        }
        if (tag.hasLayout) {
          symbol.align = flash.text.TextFormatAlign.fromNumber(tag.align);
          symbol.leftMargin = tag.leftMargin;
          symbol.rightMargin = tag.rightMargin;
          symbol.indent = tag.indent;
          symbol.leading = tag.leading;
        }
        symbol.multiline = !!tag.multiline;
        symbol.wordWrap = !!tag.wordWrap;
        symbol.embedFonts = !!tag.useOutlines;
        symbol.selectable = !tag.noSelect;
        symbol.border = !!tag.border;
        if (tag.hasText) {
          symbol.initialText = tag.initialText;
        }
        symbol.html = !!tag.html;
        symbol.displayAsPassword = !!tag.password;
        symbol.type = tag.readonly ? flash.text.TextFieldType.DYNAMIC : flash.text.TextFieldType.INPUT;
        if (tag.hasMaxLength) {
          symbol.maxChars = tag.maxLength;
        }
        symbol.autoSize = tag.autoSize ? flash.text.TextFieldAutoSize.LEFT : flash.text.TextFieldAutoSize.NONE;
        symbol.variableName = tag.variableName;
        return symbol;
      };
      return TextSymbol;
    })(DisplaySymbol);
    Timeline.TextSymbol = TextSymbol;

    var ButtonSymbol = (function (_super) {
      __extends(ButtonSymbol, _super);
      function ButtonSymbol(id) {
        _super.call(this, id, flash.display.SimpleButton);
        this.upState = null;
        this.overState = null;
        this.downState = null;
        this.hitTestState = null;
      }
      ButtonSymbol.FromData = function (data, loaderInfo) {
        var symbol = new ButtonSymbol(data.id);
        if (loaderInfo.actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
          symbol.isAS2Object = true;
          symbol.buttonActions = data.buttonActions;
        }
        var states = data.states;
        var character, matrix, colorTransform;
        for (var stateName in states) {
          var commands = states[stateName];
          if (commands.length === 1) {
            var cmd = commands[0];
            character = loaderInfo.getSymbolById(cmd.symbolId);
            matrix = flash.geom.Matrix.FromUntyped(cmd.matrix);
            if (cmd.cxform) {
              colorTransform = flash.geom.ColorTransform.FromCXForm(cmd.cxform);
            }
          } else {
            character = new Timeline.SpriteSymbol(-1);
            character.frames.push(new FrameDelta(loaderInfo, commands));
          }
          symbol[stateName + 'State'] = new Timeline.AnimationState(character, 0, matrix, colorTransform);
        }
        return symbol;
      };
      return ButtonSymbol;
    })(DisplaySymbol);
    Timeline.ButtonSymbol = ButtonSymbol;

    var SpriteSymbol = (function (_super) {
      __extends(SpriteSymbol, _super);
      function SpriteSymbol(id, isRoot) {
        if (typeof isRoot === "undefined") { isRoot = false; }
        _super.call(this, id, flash.display.MovieClip);
        this.numFrames = 1;
        this.frames = [];
        this.labels = [];
        this.frameScripts = [];
        this.initActionBlock = null;
        this.isRoot = isRoot;
      }
      SpriteSymbol.FromData = function (data, loaderInfo) {
        var symbol = new SpriteSymbol(data.id);
        symbol.numFrames = data.frameCount;
        if (loaderInfo.actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
          symbol.isAS2Object = true;
        }
        symbol.frameScripts = data.frameScripts;
        var frames = data.frames;
        var frameNum = 1;
        for (var i = 0; i < frames.length; i++) {
          var frameInfo = frames[i];
          var frame = new FrameDelta(loaderInfo, frameInfo.commands);
          var repeat = frameInfo.repeat;
          while (repeat--) {
            symbol.frames.push(frame);
          }
          if (frameInfo.labelName) {
            symbol.labels.push(new flash.display.FrameLabel(frameInfo.labelName, frameNum));
          }

          frameNum += frameInfo.repeat;
        }
        return symbol;
      };
      return SpriteSymbol;
    })(DisplaySymbol);
    Timeline.SpriteSymbol = SpriteSymbol;

    var FontSymbol = (function (_super) {
      __extends(FontSymbol, _super);
      function FontSymbol(id) {
        _super.call(this, id, flash.text.Font);
        this.name = "";
        this.bold = false;
        this.italic = false;
      }
      FontSymbol.FromData = function (data) {
        var symbol = new FontSymbol(data.id);
        symbol.name = data.name;
        symbol.bold = data.bold;
        symbol.italic = data.italic;
        symbol.data = data.data;
        symbol.metrics = data.metrics;
        return symbol;
      };
      return FontSymbol;
    })(Symbol);
    Timeline.FontSymbol = FontSymbol;

    var SoundSymbol = (function (_super) {
      __extends(SoundSymbol, _super);
      function SoundSymbol(id) {
        _super.call(this, id, flash.media.Sound);
      }
      SoundSymbol.FromData = function (data) {
        var symbol = new SoundSymbol(data.id);
        symbol.channels = data.channels;
        symbol.sampleRate = data.sampleRate;
        symbol.pcm = data.pcm;
        symbol.packaged = data.packaged;
        return symbol;
      };
      return SoundSymbol;
    })(Symbol);
    Timeline.SoundSymbol = SoundSymbol;

    var BinarySymbol = (function (_super) {
      __extends(BinarySymbol, _super);
      function BinarySymbol(id) {
        _super.call(this, id, flash.utils.ByteArray);
      }
      BinarySymbol.FromData = function (data) {
        var symbol = new BinarySymbol(data.id);
        symbol.buffer = data.data;
        symbol.byteLength = data.data.byteLength;
        return symbol;
      };
      return BinarySymbol;
    })(Symbol);
    Timeline.BinarySymbol = BinarySymbol;

    var AnimationState = (function () {
      function AnimationState(symbol, depth, matrix, colorTransform, ratio, name, clipDepth, filters, blendMode, cacheAsBitmap, visible, events, variableName) {
        if (typeof symbol === "undefined") { symbol = null; }
        if (typeof depth === "undefined") { depth = 0; }
        if (typeof matrix === "undefined") { matrix = null; }
        if (typeof colorTransform === "undefined") { colorTransform = null; }
        if (typeof ratio === "undefined") { ratio = 0; }
        if (typeof name === "undefined") { name = null; }
        if (typeof clipDepth === "undefined") { clipDepth = -1; }
        if (typeof filters === "undefined") { filters = null; }
        if (typeof blendMode === "undefined") { blendMode = null; }
        if (typeof cacheAsBitmap === "undefined") { cacheAsBitmap = false; }
        if (typeof visible === "undefined") { visible = true; }
        if (typeof events === "undefined") { events = null; }
        if (typeof variableName === "undefined") { variableName = null; }
        this.symbol = symbol;
        this.depth = depth;
        this.matrix = matrix;
        this.colorTransform = colorTransform;
        this.ratio = ratio;
        this.name = name;
        this.clipDepth = clipDepth;
        this.filters = filters;
        this.blendMode = blendMode;
        this.cacheAsBitmap = cacheAsBitmap;
        this.visible = visible;
        this.events = events;
        this.variableName = variableName;
      }
      AnimationState.prototype.canBeAnimated = function (obj) {
        if (!obj._hasFlags(2048 /* AnimatedByTimeline */)) {
          return false;
        }
        if (obj._depth !== this.depth) {
          return false;
        }
        var symbol = this.symbol;
        if (symbol) {
          if (symbol.dynamic) {
            return false;
          }
          if (obj._clipDepth !== this.clipDepth) {
            return false;
          }
          if (!symbol.symbolClass.isType(obj)) {
            return false;
          }
        }
        return true;
      };
      return AnimationState;
    })();
    Timeline.AnimationState = AnimationState;

    var FrameDelta = (function () {
      function FrameDelta(loaderInfo, commands) {
        this.loaderInfo = loaderInfo;
        this.commands = commands;
        this._stateAtDepth = null;
      }
      Object.defineProperty(FrameDelta.prototype, "stateAtDepth", {
        get: function () {
          return this._stateAtDepth || this._initialize();
        },
        enumerable: true,
        configurable: true
      });

      FrameDelta.prototype._initialize = function () {
        var states = this._stateAtDepth = Object.create(null);
        var commands = this.commands;
        var loaderInfo = this.loaderInfo;
        for (var i = 0; i < commands.length; i++) {
          var cmd = commands[i];
          var depth = cmd.depth;
          switch (cmd.code) {
            case 5:
            case 28:
              states[depth] = null;
              break;
            default:
              var symbol = null;
              var matrix = null;
              var colorTransform = null;
              var filters = null;
              var events = null;
              if (cmd.symbolId) {
                symbol = loaderInfo.getSymbolById(cmd.symbolId);
                release || assert(symbol, "Symbol is not defined.");
              }
              if (cmd.flags & 4 /* HasMatrix */) {
                matrix = flash.geom.Matrix.FromUntyped(cmd.matrix);
              }
              if (cmd.flags & 8 /* HasColorTransform */) {
                colorTransform = flash.geom.ColorTransform.FromCXForm(cmd.cxform);
              }
              if (cmd.flags & 256 /* HasFilterList */) {
                filters = [];
                var swfFilters = cmd.filters;
                for (var j = 0; j < swfFilters.length; j++) {
                  var obj = swfFilters[j];
                  var filter;
                  switch (obj.type) {
                    case 0:
                      filter = flash.filters.DropShadowFilter.FromUntyped(obj);
                      break;
                    case 1:
                      filter = flash.filters.BlurFilter.FromUntyped(obj);
                      break;
                    case 2:
                      filter = flash.filters.GlowFilter.FromUntyped(obj);
                      break;
                    case 3:
                      filter = flash.filters.BevelFilter.FromUntyped(obj);
                      break;
                    case 4:
                      filter = flash.filters.GradientGlowFilter.FromUntyped(obj);
                      break;
                    case 5:
                      filter = flash.filters.ConvolutionFilter.FromUntyped(obj);
                      break;
                    case 6:
                      filter = flash.filters.ColorMatrixFilter.FromUntyped(obj);
                      break;
                    case 7:
                      filter = flash.filters.GradientBevelFilter.FromUntyped(obj);
                      break;
                  }
                  release || assert(filter, "Unknown filter type.");
                  filters.push(filter);
                }
              }
              if ((cmd.flags & 128 /* HasClipActions */) && loaderInfo._allowCodeExecution && loaderInfo._actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
                var swfEvents = cmd.events;
                events = [];
                for (var j = 0; j < swfEvents.length; j++) {
                  var swfEvent = swfEvents[j];
                  if (swfEvent.eoe) {
                    break;
                  }
                  var actionsData = new Shumway.AVM1.AS2ActionsData(swfEvent.actionsData, 's' + cmd.symbolId + 'e' + j);
                  var fn = (function (actionsData, loaderInfo) {
                    return function () {
                      var avm1Context = loaderInfo._avm1Context;
                      var as2Object = Shumway.AVM2.AS.avm1lib.getAS2Object(this);
                      return avm1Context.executeActions(actionsData, this.stage, as2Object);
                    };
                  })(actionsData, loaderInfo);
                  var eventNames = [];
                  for (var eventName in swfEvent) {
                    if (eventName.indexOf("on") !== 0 || !swfEvent[eventName]) {
                      continue;
                    }
                    var avm2EventName = eventName[2].toLowerCase() + eventName.substring(3);
                    if (avm2EventName === 'enterFrame') {
                      avm2EventName = 'frameConstructed';
                    }
                    eventNames.push(avm2EventName);
                  }
                  events.push({
                    eventNames: eventNames,
                    handler: fn,
                    keyPress: swfEvent.keyPress
                  });
                }
              }
              var state = new Timeline.AnimationState(symbol, depth, matrix, colorTransform, cmd.ratio, cmd.name, cmd.clipDepth, filters, flash.display.BlendMode.fromNumber(cmd.blendMode), !!(cmd.flags & 1024 /* HasCacheAsBitmap */), cmd.flags & 512 /* HasVisible */ ? !!cmd.visibility : true, events, cmd.variableName);
              states[depth] = state;
              break;
          }
        }
        this.commands = null;
        return states;
      };
      return FrameDelta;
    })();
    Timeline.FrameDelta = FrameDelta;
  })(Shumway.Timeline || (Shumway.Timeline = {}));
  var Timeline = Shumway.Timeline;
})(Shumway || (Shumway = {}));
var Shumway;
(function (Shumway) {
  (function (AVM2) {
    (function (AS) {
      var throwError = Shumway.AVM2.Runtime.throwError;
      var flash = Shumway.AVM2.AS.flash;
      var Multiname = Shumway.AVM2.ABC.Multiname;

      var assert = Shumway.Debug.assert;

      function M(classSimpleName, nativeName, cls) {
        return {
          classSimpleName: classSimpleName, nativeName: nativeName, cls: cls
        };
      }

      function makeStub(container, classSimpleName, shortName) {
        Object.defineProperty(container, shortName, {
          get: function () {
            release || assert(Shumway.AVM2.Runtime.AVM2.instance, "AVM2 needs to be initialized.");
            var cls = Shumway.AVM2.Runtime.AVM2.instance.systemDomain.getClass(classSimpleName);
            release || assert(cls.instanceConstructor);
            Object.defineProperty(container, shortName, {
              value: cls.instanceConstructor,
              writable: false
            });
            return container[shortName];
          },
          configurable: true
        });
      }

      jsGlobal["flash"] = Shumway.AVM2.AS.flash;

      function linkNatives(runtime) {
        var symbols = [
          M("flash.display.DisplayObject", "DisplayObjectClass", flash.display.DisplayObject),
          M("flash.display.InteractiveObject", "InteractiveObjectClass", flash.display.InteractiveObject),
          M("flash.display.DisplayObjectContainer", "ContainerClass", flash.display.DisplayObjectContainer),
          M("flash.display.Sprite", "SpriteClass", flash.display.Sprite),
          M("flash.display.MovieClip", "MovieClipClass", flash.display.MovieClip),
          M("flash.display.Shape", "ShapeClass", flash.display.Shape),
          M("flash.display.Bitmap", "BitmapClass", flash.display.Bitmap),
          M("flash.display.BitmapData", "BitmapDataClass", flash.display.BitmapData),
          M("flash.display.Stage", "StageClass", flash.display.Stage),
          M("flash.display.Loader", "LoaderClass", flash.display.Loader),
          M("flash.display.LoaderInfo", "LoaderInfoClass", flash.display.LoaderInfo),
          M("flash.display.Graphics", "GraphicsClass", flash.display.Graphics),
          M("flash.display.SimpleButton", "SimpleButtonClass", flash.display.SimpleButton),
          M("flash.display.MorphShape", "MorphShapeClass", flash.display.MorphShape),
          M("flash.display.NativeMenu", "MenuClass", flash.display.NativeMenu),
          M("flash.display.NativeMenuItem", "MenuItemClass", flash.display.NativeMenuItem),
          M("flash.display.FrameLabel", "FrameLabelClass", flash.display.FrameLabel),
          M("flash.display.Scene", "SceneClass", flash.display.Scene),
          M("flash.filters.BevelFilter", "BevelFilterClass", flash.filters.BevelFilter),
          M("flash.filters.BitmapFilter", "BitmapFilterClass", flash.filters.BitmapFilter),
          M("flash.filters.BlurFilter", "BlurFilterClass", flash.filters.BlurFilter),
          M("flash.filters.ColorMatrixFilter", "ColorMatrixFilterClass", flash.filters.ColorMatrixFilter),
          M("flash.filters.ConvolutionFilter", "ConvolutionFilterClass", flash.filters.ConvolutionFilter),
          M("flash.filters.DisplacementMapFilter", "DisplacementMapFilterClass", flash.filters.DisplacementMapFilter),
          M("flash.filters.DropShadowFilter", "DropShadowFilterClass", flash.filters.DropShadowFilter),
          M("flash.filters.GlowFilter", "GlowFilterClass", flash.filters.GlowFilter),
          M("flash.filters.GradientBevelFilter", "GradientBevelFilterClass", flash.filters.GradientBevelFilter),
          M("flash.filters.GradientGlowFilter", "GradientGlowFilterClass", flash.filters.GradientGlowFilter),
          M("flash.geom.Point", "PointClass", flash.geom.Point),
          M("flash.geom.Rectangle", "RectangleClass", flash.geom.Rectangle),
          M("flash.geom.Matrix", "MatrixClass", flash.geom.Matrix),
          M("flash.geom.Matrix3D", "Matrix3DClass", flash.geom.Matrix3D),
          M("flash.geom.Vector3D", "Vector3DClass", flash.geom.Vector3D),
          M("flash.geom.Transform", "TransformClass", flash.geom.Transform),
          M("flash.geom.ColorTransform", "ColorTransformClass", flash.geom.ColorTransform),
          M("flash.events.EventDispatcher", "EventDispatcherClass", flash.events.EventDispatcher),
          M("flash.events.Event", "EventClass", flash.events.Event),
          M("flash.events.IOErrorEvent"),
          M("flash.events.KeyboardEvent", "KeyboardEventClass", flash.events.KeyboardEvent),
          M("flash.events.MouseEvent", "MouseEventClass", flash.events.MouseEvent),
          M("flash.events.GestureEvent", "GestureEventClass", flash.events.GestureEvent),
          M("flash.events.TextEvent", "TextEventClass", flash.events.TextEvent),
          M("flash.events.TimerEvent", "TimerEventClass", flash.events.TimerEvent),
          M("flash.events.ProgressEvent", "ProgressEventClass", flash.events.ProgressEvent),
          M("flash.events.NetStatusEvent"),
          M("flash.events.HTTPStatusEvent"),
          M("flash.external.ExternalInterface", "ExternalInterfaceClass", flash.external.ExternalInterface),
          M("flash.ui.ContextMenu", "ContextMenuClass", flash.ui.ContextMenu),
          M("flash.ui.ContextMenuItem", "ContextMenuItemClass", flash.ui.ContextMenuItem),
          M("flash.ui.Keyboard", "KeyboardClass", flash.ui.Keyboard),
          M("flash.ui.Mouse", "MouseClass", flash.ui.Mouse),
          M("flash.ui.MouseCursorData", "MouseCursorDataClass", flash.ui.MouseCursorData),
          M("flash.ui.GameInput", "GameInputClass", flash.ui.GameInput),
          M("flash.events.GameInputEvent", "GameInputEventClass", flash.events.GameInputEvent),
          M("flash.ui.GameInputControl", "GameInputControlClass", flash.ui.GameInputControl),
          M("flash.ui.GameInputControlType", "GameInputControlTypeClass", flash.ui.GameInputControlType),
          M("flash.ui.GameInputDevice", "GameInputDeviceClass", flash.ui.GameInputDevice),
          M("flash.ui.GameInputFinger", "GameInputFingerClass", flash.ui.GameInputFinger),
          M("flash.ui.GameInputHand", "GameInputHandClass", flash.ui.GameInputHand),
          M("flash.ui.Multitouch", "MultitouchClass", flash.ui.Multitouch),
          M("flash.ui.MultitouchInputMode", "MultitouchInputModeClass", flash.ui.MultitouchInputMode),
          M("flash.events.TouchEvent", "TouchEventClass", flash.events.TouchEvent),
          M("flash.text.Font", "FontClass", flash.text.Font),
          M("flash.text.TextField", "TextFieldClass", flash.text.TextField),
          M("flash.text.StaticText", "StaticTextClass", flash.text.StaticText),
          M("flash.text.StyleSheet", "StyleSheetClass", flash.text.StyleSheet),
          M("flash.text.TextFormat", "TextFormatClass", flash.text.TextFormat),
          M("flash.text.TextRun", "TextRunClass", flash.text.TextRun),
          M("flash.text.TextLineMetrics"),
          M("flash.media.Sound", "SoundClass", flash.media.Sound),
          M("flash.media.SoundChannel", "SoundChannelClass", flash.media.SoundChannel),
          M("flash.media.SoundMixer", "SoundMixerClass", flash.media.SoundMixer),
          M("flash.media.SoundTransform", "SoundTransformClass", flash.media.SoundTransform),
          M("flash.media.Video", "VideoClass", flash.media.Video),
          M("flash.media.ID3Info", "ID3InfoClass", flash.media.ID3Info),
          M("flash.media.Microphone", "MicrophoneClass", flash.media.Microphone),
          M("flash.net.FileFilter", "FileFilterClass", flash.net.FileFilter),
          M("flash.net.NetConnection", "NetConnectionClass", flash.net.NetConnection),
          M("flash.net.NetStream", "NetStreamClass", flash.net.NetStream),
          M("flash.net.Responder", "ResponderClass", flash.net.Responder),
          M("flash.net.URLRequest", "URLRequestClass", flash.net.URLRequest),
          M("flash.net.URLRequestHeader"),
          M("flash.net.URLStream", "URLStreamClass", flash.net.URLStream),
          M("flash.net.URLLoader", "URLLoaderClass", flash.net.URLLoader),
          M("flash.net.SharedObject", "SharedObjectClass", flash.net.SharedObject),
          M("flash.net.ObjectEncoding", "ObjectEncodingClass", flash.net.ObjectEncoding),
          M("flash.net.LocalConnection", "LocalConnectionClass", flash.net.LocalConnection),
          M("flash.net.Socket", "SocketClass", flash.net.Socket),
          M("flash.net.URLVariables", "URLVariablesClass", flash.net.URLVariables),
          M("packageInternal flash.system.FSCommand", "FSCommandClass", flash.system.FSCommand),
          M("flash.system.Capabilities", "CapabilitiesClass", flash.system.Capabilities),
          M("flash.system.Security", "SecurityClass", flash.system.Security),
          M("flash.system.SecurityDomain", "SecurityDomainClass", flash.system.SecurityDomain),
          M("flash.system.ApplicationDomain", "ApplicationDomainClass", flash.system.ApplicationDomain),
          M("flash.system.JPEGLoaderContext", "JPEGLoaderContextClass", flash.system.JPEGLoaderContext),
          M("flash.accessibility.Accessibility", "AccessibilityClass", flash.accessibility.Accessibility),
          M("flash.utils.Timer", "TimerClass", flash.utils.Timer),
          M("flash.utils.ByteArray", "ByteArrayClass", flash.utils.ByteArray),
          M("avm1lib.AS2Utils", "AS2Utils", Shumway.AVM2.AS.avm1lib.AS2Utils),
          M("avm1lib.AS2Broadcaster"),
          M("avm1lib.AS2Key"),
          M("avm1lib.AS2Mouse"),
          M("avm1lib.AS2MovieClip", "AS2MovieClip", Shumway.AVM2.AS.avm1lib.AS2MovieClip),
          M("avm1lib.AS2BitmapData", "AS2BitmapData", Shumway.AVM2.AS.avm1lib.AS2BitmapData),
          M("avm1lib.AS2Button", "AS2Button", Shumway.AVM2.AS.avm1lib.AS2Button),
          M("avm1lib.AS2Sound"),
          M("avm1lib.AS2TextField", "AS2TextField", Shumway.AVM2.AS.avm1lib.AS2TextField),
          M("avm1lib.AS2Stage"),
          M("avm1lib.AS2System"),
          M("avm1lib.AS2Color"),
          M("avm1lib.AS2Transform"),
          M("avm1lib.AS2Globals", "AS2Globals", Shumway.AVM2.AS.avm1lib.AS2Globals),
          M("avm1lib.AS2MovieClipLoader", "AS2MovieClipLoader", Shumway.AVM2.AS.avm1lib.AS2MovieClipLoader)
        ];

        symbols.forEach(function (s) {
          var className = Multiname.fromSimpleName(s.classSimpleName);
          var path = className.getOriginalName().split(".");
          var container = Shumway.AVM2.AS;
          for (var i = 0, j = path.length - 1; i < j; i++) {
            if (!container[path[i]]) {
              container[path[i]] = {};
            }
            container = container[path[i]];
          }
          makeStub(container, s.classSimpleName, path[path.length - 1]);
          AS.registerNativeClass(s.nativeName, s.cls);
        });

        AS.registerNativeFunction('FlashUtilScript::getDefinitionByName', Shumway.AVM2.AS.Natives.getDefinitionByName);

        var start = Date.now();
        AS.registerNativeFunction('FlashUtilScript::getTimer', function getTimer() {
          return Date.now() - start;
        });

        AS.registerNativeFunction('FlashUtilScript::escapeMultiByte', escape);
        AS.registerNativeFunction('FlashUtilScript::unescapeMultiByte', unescape);

        AS.registerNativeFunction('FlashNetScript::navigateToURL', function navigateToURL(request, window_) {
          if (request === null || request === undefined) {
            throwError('TypeError', AVM2.Errors.NullPointerError, 'request');
          }
          var RequestClass = Shumway.AVM2.Runtime.AVM2.instance.systemDomain.getClass("flash.net.URLRequest");
          if (!RequestClass.isInstanceOf(request)) {
            throwError('TypeError', AVM2.Errors.CheckTypeFailedError, request, 'flash.net.URLRequest');
          }
          var url = request.url;
          if (/^fscommand:/i.test(url)) {
            var fscommand = Shumway.AVM2.Runtime.AVM2.instance.applicationDomain.getProperty(Multiname.fromSimpleName('flash.system.fscommand'), true, true);
            fscommand.call(null, url.substring('fscommand:'.length), window_);
            return;
          }

          var targetWindow = window_ || '_parent';
          window.open(Shumway.FileLoadingService.instance.resolveUrl(url), targetWindow);
        });

        AS.registerNativeFunction('FlashNetScript::sendToURL', function sendToURL(request) {
          if (request === null || request === undefined) {
            throwError('TypeError', AVM2.Errors.NullPointerError, 'request');
          }
          var RequestClass = Shumway.AVM2.Runtime.AVM2.instance.systemDomain.getClass("flash.net.URLRequest");
          if (!RequestClass.isInstanceOf(request)) {
            throwError('TypeError', AVM2.Errors.CheckTypeFailedError, request, 'flash.net.URLRequest');
          }
          var session = Shumway.FileLoadingService.instance.createSession();
          session.onprogress = function () {
          };
          session.open(request);
        });

        AS.registerNativeFunction('Toplevel::registerClassAlias', function registerClassAlias(aliasName, classObject) {
          if (!aliasName) {
            throwError('TypeError', AVM2.Errors.NullPointerError, 'aliasName');
          }
          if (!classObject) {
            throwError('TypeError', AVM2.Errors.NullPointerError, 'classObject');
          }

          AVM2.aliasesCache.classes.set(classObject, aliasName);
          AVM2.aliasesCache.names[aliasName] = classObject;
        });

        AS.registerNativeFunction('Toplevel::getClassByAlias', function getClassByAlias(aliasName) {
          if (!aliasName) {
            throwError('TypeError', AVM2.Errors.NullPointerError, 'aliasName');
          }

          var classObject = AVM2.aliasesCache.names[aliasName];
          if (!classObject) {
            throwError('ReferenceError', AVM2.Errors.ClassNotFoundError, aliasName);
          }
          return classObject;
        });

        AS.registerNativeFunction('isFinite', isFinite);
      }
      AS.linkNatives = linkNatives;
    })(AVM2.AS || (AVM2.AS = {}));
    var AS = AVM2.AS;
  })(Shumway.AVM2 || (Shumway.AVM2 = {}));
  var AVM2 = Shumway.AVM2;
})(Shumway || (Shumway = {}));
//# sourceMappingURL=flash.js.map
