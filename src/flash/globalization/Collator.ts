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
// Class: Collator
module Shumway.AVM2.AS.flash.globalization {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class Collator extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (requestedLocaleIDName: string, initialMode: string = "sorting") {
      requestedLocaleIDName = asCoerceString(requestedLocaleIDName); initialMode = asCoerceString(initialMode);
      false && super();
      notImplemented("Dummy Constructor: public flash.globalization.Collator");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    static getAvailableLocaleIDNames(): ASVector<any> {
      notImplemented("public flash.globalization.Collator::static getAvailableLocaleIDNames"); return;
    }
    
    // _ignoreCase: boolean;
    // _ignoreDiacritics: boolean;
    // _ignoreKanaType: boolean;
    // _ignoreSymbols: boolean;
    // _ignoreCharacterWidth: boolean;
    // _numericComparison: boolean;
    // _lastOperationStatus: string;
    // _actualLocaleIDName: string;
    // _requestedLocaleIDName: string;
    get ignoreCase(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreCase"); return;
      // return this._ignoreCase;
    }
    set ignoreCase(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreCase"); return;
      // this._ignoreCase = value;
    }
    get ignoreDiacritics(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreDiacritics"); return;
      // return this._ignoreDiacritics;
    }
    set ignoreDiacritics(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreDiacritics"); return;
      // this._ignoreDiacritics = value;
    }
    get ignoreKanaType(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreKanaType"); return;
      // return this._ignoreKanaType;
    }
    set ignoreKanaType(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreKanaType"); return;
      // this._ignoreKanaType = value;
    }
    get ignoreSymbols(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreSymbols"); return;
      // return this._ignoreSymbols;
    }
    set ignoreSymbols(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreSymbols"); return;
      // this._ignoreSymbols = value;
    }
    get ignoreCharacterWidth(): boolean {
      notImplemented("public flash.globalization.Collator::get ignoreCharacterWidth"); return;
      // return this._ignoreCharacterWidth;
    }
    set ignoreCharacterWidth(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set ignoreCharacterWidth"); return;
      // this._ignoreCharacterWidth = value;
    }
    get numericComparison(): boolean {
      notImplemented("public flash.globalization.Collator::get numericComparison"); return;
      // return this._numericComparison;
    }
    set numericComparison(value: boolean) {
      value = !!value;
      notImplemented("public flash.globalization.Collator::set numericComparison"); return;
      // this._numericComparison = value;
    }
    get lastOperationStatus(): string {
      notImplemented("public flash.globalization.Collator::get lastOperationStatus"); return;
      // return this._lastOperationStatus;
    }
    get actualLocaleIDName(): string {
      notImplemented("public flash.globalization.Collator::get actualLocaleIDName"); return;
      // return this._actualLocaleIDName;
    }
    get requestedLocaleIDName(): string {
      notImplemented("public flash.globalization.Collator::get requestedLocaleIDName"); return;
      // return this._requestedLocaleIDName;
    }
    compare(string1: string, string2: string): number /*int*/ {
      string1 = asCoerceString(string1); string2 = asCoerceString(string2);
      notImplemented("public flash.globalization.Collator::compare"); return;
    }
    equals(string1: string, string2: string): boolean {
      string1 = asCoerceString(string1); string2 = asCoerceString(string2);
      notImplemented("public flash.globalization.Collator::equals"); return;
    }
    ctor(requestedLocaleIDName: string, initialMode: string): void {
      requestedLocaleIDName = asCoerceString(requestedLocaleIDName); initialMode = asCoerceString(initialMode);
      notImplemented("public flash.globalization.Collator::ctor"); return;
    }
  }
}
