/**
 * Copyright 2014 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: Shape
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;

  export class Shape extends flash.display.DisplayObject {
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];

    static classInitializer: any = null;
    static initializer: any = function (symbol: Shumway.Timeline.ShapeSymbol) {
      var self: Shape = this;
      self._graphics = null;
      if (symbol) {
        this._setStaticContentFromSymbol(symbol);
        // TODO: Assert that the computed bounds of the graphics object in fact
        // match those given by the symbol.
      }
    };

    constructor () {
      false && super();
      DisplayObject.instanceConstructorNoInitialize.call(this);
    }

    _canHaveGraphics(): boolean {
      return true;
    }

    _getGraphics(): flash.display.Graphics {
      return this._graphics;
    }

    get graphics(): flash.display.Graphics {
      return this._ensureGraphics();
    }
  }
}
