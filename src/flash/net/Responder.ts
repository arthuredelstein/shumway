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
// Class: Responder
module Shumway.AVM2.AS.flash.net {
  import notImplemented = Shumway.Debug.notImplemented;

  export class Responder extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (result: ASFunction, status: ASFunction = null) {
      false && super();
      notImplemented("Dummy Constructor: public flash.net.Responder");
    }

    private _result: ASFunction;
    private _status: ASFunction;

    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    ctor(result: ASFunction, status: ASFunction): void {
      this._result = result;
      this._status = status;
    }
  }
}
