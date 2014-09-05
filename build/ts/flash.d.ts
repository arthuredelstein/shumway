/// <reference path="avm2.d.ts" />
/// <reference path="swf.d.ts" />
/// <reference path="../../src/flash/avm1.d.ts" />
declare module Shumway {
  interface HTMLParserHandler {
    comment?: (text: string) => void;
    chars?: (text: string) => void;
    start?: (tag: string, attrs: any, unary: boolean) => void;
    end?: (tag: string) => void;
  }
  function HTMLParser(html: string, handler: HTMLParserHandler): void;
}
declare module Shumway {
  enum TextContentFlags {
    None = 0,
    DirtyBounds = 1,
    DirtyContent = 2,
    DirtyStyle = 4,
    DirtyFlow = 8,
    Dirty,
  }
  class TextContent implements Remoting.IRemotable {
    public _id: number;
    private _bounds;
    private _plainText;
    private _backgroundColor;
    private _borderColor;
    private _autoSize;
    private _wordWrap;
    public flags: number;
    public defaultTextFormat: AVM2.AS.flash.text.TextFormat;
    public textRuns: AVM2.AS.flash.text.TextRun[];
    public textRunData: ArrayUtilities.DataBuffer;
    public matrix: AVM2.AS.flash.geom.Matrix;
    public coords: number[];
    constructor(defaultTextFormat?: AVM2.AS.flash.text.TextFormat);
    public parseHtml(htmlText: string, multiline?: boolean): void;
    public plainText : string;
    public bounds : Bounds;
    public autoSize : number;
    public wordWrap : boolean;
    public backgroundColor : number;
    public borderColor : number;
    private _writeTextRun(textRun);
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class Matrix extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
    static FromUntyped(obj: any): Matrix;
    static FromDataBuffer(input: ArrayUtilities.DataBuffer): Matrix;
    static FROZEN_IDENTITY_MATRIX: Matrix;
    static TEMP_MATRIX: Matrix;
    public a: number;
    public b: number;
    public c: number;
    public d: number;
    public tx: number;
    public ty: number;
    public native_a : number;
    public native_b : number;
    public native_c : number;
    public native_d : number;
    public native_tx : number;
    public native_ty : number;
    public Matrix(a?: number, b?: number, c?: number, d?: number, tx?: number, ty?: number): void;
    public concat(m: Matrix): void;
    public preMultiply(m: Matrix): void;
    public preMultiplyInto(m: Matrix, target: Matrix): void;
    public invert(): void;
    public invertInto(target: Matrix): void;
    public identity(): void;
    public createBox(scaleX: number, scaleY: number, rotation?: number, tx?: number, ty?: number): void;
    public createGradientBox(width: number, height: number, rotation?: number, tx?: number, ty?: number): void;
    public rotate(angle: number): void;
    public translate(dx: number, dy: number): void;
    public scale(sx: number, sy: number): void;
    public deltaTransformPoint(point: Point): Point;
    public transformX(x: number, y: number): number;
    public transformY(x: number, y: number): number;
    public transformPoint(point: Point): Point;
    public transformPointInPlace(point: any): Point;
    public transformBounds(bounds: Bounds): void;
    public getScaleX(): number;
    public getScaleY(): number;
    public getAbsoluteScaleX(): number;
    public getAbsoluteScaleY(): number;
    public getRotation(): number;
    public copyFrom(sourceMatrix: Matrix): void;
    public setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): void;
    public toTwipsInPlace(): Matrix;
    public toPixelsInPlace(): Matrix;
    public copyRowTo(row: number, vector3D: Vector3D): void;
    public copyColumnTo(column: number, vector3D: Vector3D): void;
    public copyRowFrom(row: number, vector3D: Vector3D): void;
    public copyColumnFrom(column: number, vector3D: Vector3D): void;
    public updateScaleAndRotation(scaleX: number, scaleY: number, rotation: number): void;
    public clone(): Matrix;
    public equals(other: Matrix): boolean;
    public toString(): string;
    public writeExternal(output: ArrayUtilities.DataBuffer): void;
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class Matrix3D extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    public _matrix: Float32Array;
    constructor(v?: any);
    static interpolate(thisMat: Matrix3D, toMat: Matrix3D, percent: number): Matrix3D;
    public rawData : any;
    public position : Vector3D;
    public determinant : number;
    public clone(): Matrix3D;
    public copyToMatrix3D(dest: Matrix3D): void;
    public append(lhs: Matrix3D): void;
    public prepend(rhs: Matrix3D): void;
    public invert(): boolean;
    public identity(): void;
    public decompose(orientationStyle?: string): ASVector<any>;
    public recompose(components: ASVector<any>, orientationStyle?: string): boolean;
    public appendTranslation(x: number, y: number, z: number): void;
    public appendRotation(degrees: number, axis: Vector3D, pivotPoint?: Vector3D): void;
    public appendScale(xScale: number, yScale: number, zScale: number): void;
    public prependTranslation(x: number, y: number, z: number): void;
    public prependRotation(degrees: number, axis: Vector3D, pivotPoint?: Vector3D): void;
    public prependScale(xScale: number, yScale: number, zScale: number): void;
    public transformVector(v: Vector3D): Vector3D;
    public deltaTransformVector(v: Vector3D): Vector3D;
    public transformVectors(vin: any, vout: any): void;
    public transpose(): void;
    public pointAt(pos: Vector3D, at?: Vector3D, up?: Vector3D): void;
    public interpolateTo(toMat: Matrix3D, percent: number): void;
    public copyFrom(sourceMatrix3D: Matrix3D): void;
    public copyRawDataTo(vector: any, index?: number, transpose?: boolean): void;
    public copyRawDataFrom(vector: ASVector<any>, index?: number, transpose?: boolean): void;
    public copyRowTo(row: number, vector3D: Vector3D): void;
    public copyColumnTo(column: number, vector3D: Vector3D): void;
    public copyRowFrom(row: number, vector3D: Vector3D): void;
    public copyColumnFrom(column: number, vector3D: Vector3D): void;
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class Orientation3D extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static EULER_ANGLES: string;
    static AXIS_ANGLE: string;
    static QUATERNION: string;
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class PerspectiveProjection extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public fieldOfView : number;
    public projectionCenter : Point;
    public focalLength : number;
    public toMatrix3D(): Matrix3D;
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class Point extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(x?: number, y?: number);
    public x: number;
    public y: number;
    public native_x : number;
    public native_y : number;
    public Point(x?: number, y?: number): void;
    public length : number;
    static interpolate(p1: Point, p2: Point, f: number): Point;
    static distance(p1: Point, p2: Point): number;
    static polar(length: number, angle: number): Point;
    public clone(): Point;
    public offset(dx: number, dy: number): void;
    public equals(toCompare: Point): Boolean;
    public subtract(v: Point): Point;
    public add(v: Point): Point;
    public normalize(thickness: number): void;
    public copyFrom(sourcePoint: Point): void;
    public setTo(x: number, y: number): void;
    public toTwips(): Point;
    public toPixels(): Point;
    public round(): Point;
    public toString(): string;
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class Rectangle extends ASNative implements utils.IExternalizable {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    constructor(x?: number, y?: number, width?: number, height?: number);
    static FromBounds(bounds: Bounds): Rectangle;
    public native_x : number;
    public native_y : number;
    public native_width : number;
    public native_height : number;
    public left : number;
    public right : number;
    public top : number;
    public bottom : number;
    public topLeft : Point;
    public bottomRight : Point;
    public size : Point;
    public area : number;
    public clone(): Rectangle;
    public isEmpty(): boolean;
    public setEmpty(): void;
    public inflate(dx: number, dy: number): void;
    public inflatePoint(point: Point): void;
    public offset(dx: number, dy: number): void;
    public offsetPoint(point: Point): void;
    public contains(x: number, y: number): boolean;
    public containsPoint(point: Point): boolean;
    public containsRect(rect: Rectangle): boolean;
    public intersection(toIntersect: Rectangle): Rectangle;
    public intersects(toIntersect: Rectangle): boolean;
    public intersectInPlace(clipRect: Rectangle): Rectangle;
    public union(toUnion: Rectangle): Rectangle;
    public unionInPlace(toUnion: Rectangle): Rectangle;
    public equals(toCompare: Rectangle): boolean;
    public copyFrom(sourceRect: Rectangle): void;
    public setTo(x: number, y: number, width: number, height: number): void;
    public toTwips(): Rectangle;
    public getBaseWidth(angle: number): number;
    public getBaseHeight(angle: number): number;
    public toPixels(): Rectangle;
    public snapInPlace(): Rectangle;
    public roundInPlace(): Rectangle;
    public toString(): string;
    public writeExternal(output: utils.IDataOutput): void;
    public readExternal(input: utils.IDataInput): void;
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class Transform extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    private _displayObject;
    constructor(displayObject: display.DisplayObject);
    public matrix : Matrix;
    public colorTransform : ColorTransform;
    public concatenatedMatrix : Matrix;
    public concatenatedColorTransform : ColorTransform;
    public pixelBounds : Rectangle;
    public matrix3D : Matrix3D;
    public getRelativeMatrix3D(relativeTo: display.DisplayObject): Matrix3D;
    public perspectiveProjection : PerspectiveProjection;
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class Utils3D extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static projectVector(m: Matrix3D, v: Vector3D): Vector3D;
    static projectVectors(m: Matrix3D, verts: ASVector<any>, projectedVerts: ASVector<any>, uvts: ASVector<any>): void;
    static pointTowards(percent: number, mat: Matrix3D, pos: Vector3D, at?: Vector3D, up?: Vector3D): Matrix3D;
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class Vector3D extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static X_AXIS: Vector3D;
    static Y_AXIS: Vector3D;
    static Z_AXIS: Vector3D;
    constructor(x?: number, y?: number, z?: number, w?: number);
    public x: number;
    public y: number;
    public z: number;
    public w: number;
    public native_x : number;
    public native_y : number;
    public native_z : number;
    public native_w : number;
    public length : number;
    public lengthSquared : number;
    static angleBetween(a: Vector3D, b: Vector3D): number;
    static distance(pt1: Vector3D, pt2: Vector3D): number;
    public dotProduct(a: Vector3D): number;
    public crossProduct(a: Vector3D): Vector3D;
    public normalize(): number;
    public scaleBy(s: number): void;
    public incrementBy(a: Vector3D): void;
    public decrementBy(a: Vector3D): void;
    public add(a: Vector3D): Vector3D;
    public subtract(a: Vector3D): Vector3D;
    public negate(): void;
    public equals(toCompare: Vector3D, allFour?: boolean): boolean;
    public nearEquals(toCompare: Vector3D, tolerance: number, allFour?: boolean): boolean;
    public project(): void;
    public copyFrom(sourceVector3D: Vector3D): void;
    public setTo(xa: number, ya: number, za: number): void;
    public clone(): Vector3D;
    public toString(): string;
  }
}
declare module Shumway.AVM2.AS.flash.accessibility {
  class Accessibility extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    private static _active;
    static active : boolean;
    static sendEvent(source: display.DisplayObject, childID: number, eventType: number, nonHTML?: boolean): void;
    static updateProperties(): void;
  }
}
declare module Shumway.AVM2.AS.flash.accessibility {
  class AccessibilityImplementation extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public stub: boolean;
    public errno: number;
    public get_accRole: (childID: number) => number;
    public get_accName: (childID: number) => string;
    public get_accValue: (childID: number) => string;
    public get_accState: (childID: number) => number;
    public get_accDefaultAction: (childID: number) => string;
    public accDoDefaultAction: (childID: number) => void;
    public isLabeledBy: (labelBounds: geom.Rectangle) => boolean;
    public getChildIDArray: () => any[];
    public accLocation: (childID: number) => any;
    public get_accSelection: () => any[];
    public get_accFocus: () => number;
    public accSelect: (operation: number, childID: number) => void;
    public get_selectionAnchorIndex: () => any;
    public get_selectionActiveIndex: () => any;
  }
}
declare module Shumway.AVM2.AS.flash.accessibility {
  class AccessibilityProperties extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public name: string;
    public description: string;
    public shortcut: string;
    public silent: boolean;
    public forceSimple: boolean;
    public noAutoLabeling: boolean;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class Event extends ASNative {
    static _instances: Map<Event>;
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static getInstance(type: string, bubbles?: boolean, cancelable?: boolean): Event;
    static getBroadcastInstance(type: string, bubbles?: boolean, cancelable?: boolean): Event;
    static isBroadcastEventType(type: string): boolean;
    constructor(type: string, bubbles?: boolean, cancelable?: boolean);
    static ACTIVATE: string;
    static ADDED: string;
    static ADDED_TO_STAGE: string;
    static CANCEL: string;
    static CHANGE: string;
    static CLEAR: string;
    static CLOSE: string;
    static COMPLETE: string;
    static CONNECT: string;
    static COPY: string;
    static CUT: string;
    static DEACTIVATE: string;
    static ENTER_FRAME: string;
    static FRAME_CONSTRUCTED: string;
    static EXIT_FRAME: string;
    static FRAME_LABEL: string;
    static ID3: string;
    static INIT: string;
    static MOUSE_LEAVE: string;
    static OPEN: string;
    static PASTE: string;
    static REMOVED: string;
    static REMOVED_FROM_STAGE: string;
    static RENDER: string;
    static RESIZE: string;
    static SCROLL: string;
    static TEXT_INTERACTION_MODE_CHANGE: string;
    static SELECT: string;
    static SELECT_ALL: string;
    static SOUND_COMPLETE: string;
    static TAB_CHILDREN_CHANGE: string;
    static TAB_ENABLED_CHANGE: string;
    static TAB_INDEX_CHANGE: string;
    static UNLOAD: string;
    static FULLSCREEN: string;
    static CONTEXT3D_CREATE: string;
    static TEXTURE_READY: string;
    static VIDEO_FRAME: string;
    static SUSPEND: string;
    public formatToString: (className: string) => string;
    public clone: () => Event;
    public _type: string;
    public _bubbles: boolean;
    public _cancelable: boolean;
    public _target: Object;
    public _currentTarget: Object;
    public _eventPhase: number;
    public _stopPropagation: boolean;
    public _stopImmediatePropagation: boolean;
    public _isDefaultPrevented: boolean;
    private _isBroadcastEvent;
    public type : string;
    public bubbles : boolean;
    public cancelable : boolean;
    public target : Object;
    public currentTarget : Object;
    public eventPhase : number;
    public stopPropagation(): void;
    public stopImmediatePropagation(): void;
    public preventDefault(): void;
    public isDefaultPrevented(): boolean;
    public isBroadcastEvent(): boolean;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class BroadcastEventDispatchQueue {
    private _queues;
    constructor();
    public reset(): void;
    public add(type: string, target: EventDispatcher): void;
    public remove(type: string, target: EventDispatcher): void;
    public dispatchEvent(event: Event): void;
    public getQueueLength(type: string): number;
  }
  class EventDispatcher extends ASNative implements IEventDispatcher {
    static broadcastEventDispatchQueue: BroadcastEventDispatchQueue;
    static classInitializer: any;
    private _target;
    private _captureListeners;
    private _targetOrBubblingListeners;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(target?: IEventDispatcher);
    private _getListenersForType(useCapture, type);
    private _getListeners(useCapture);
    public addEventListener(type: string, listener: EventHandler, useCapture?: boolean, priority?: number, useWeakReference?: boolean): void;
    public removeEventListener(type: string, listener: EventHandler, useCapture?: boolean): void;
    private _hasTargetOrBubblingEventListener(type);
    private _hasCaptureEventListener(type);
    private _hasEventListener(type);
    public hasEventListener(type: string): boolean;
    public willTrigger(type: string): boolean;
    private _skipDispatchEvent(event);
    public dispatchEvent(event: Event): boolean;
    private static callListeners(list, event, target, currentTarget, eventPhase);
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class EventPhase extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static CAPTURING_PHASE: number;
    static AT_TARGET: number;
    static BUBBLING_PHASE: number;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class TextEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, text?: string);
    static LINK: string;
    static TEXT_INPUT: string;
    public copyNativeData(event: TextEvent): void;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class ErrorEvent extends TextEvent {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, text?: string, id?: number);
    static ERROR: string;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class GameInputEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, device?: ui.GameInputDevice);
    static DEVICE_ADDED: string;
    static DEVICE_REMOVED: string;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class GestureEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, phase?: string, localX?: number, localY?: number, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean);
    static GESTURE_TWO_FINGER_TAP: string;
    private _phase;
    private _localX;
    private _localY;
    private _ctrlKey;
    private _altKey;
    private _shiftKey;
    public clone: () => Event;
    public localX : number;
    public localY : number;
    public stageX : number;
    public stageY : number;
    public ctrlKey : boolean;
    public altKey : boolean;
    public shiftKey : boolean;
    public updateAfterEvent(): void;
    private NativeCtor(phase?, localX?, localY?, ctrlKey?, altKey?, shiftKey?);
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class HTTPStatusEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, status?: number);
    static HTTP_STATUS: string;
    static HTTP_RESPONSE_STATUS: string;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  interface EventHandler {
    (event: Event): void;
  }
  interface IEventDispatcher {
    addEventListener: (type: string, listener: EventHandler, useCapture?: boolean, priority?: number, useWeakReference?: boolean) => void;
    removeEventListener: (type: string, listener: EventHandler, useCapture?: boolean) => void;
    hasEventListener: (type: string) => boolean;
    willTrigger: (type: string) => boolean;
    dispatchEvent: (event: Event) => boolean;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class IOErrorEvent extends ErrorEvent {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, text?: string, id?: number);
    static IO_ERROR: string;
    static NETWORK_ERROR: string;
    static DISK_ERROR: string;
    static VERIFY_ERROR: string;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class KeyboardEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, charCodeValue?: number, keyCodeValue?: number, keyLocationValue?: number, ctrlKeyValue?: boolean, altKeyValue?: boolean, shiftKeyValue?: boolean);
    static KEY_DOWN: string;
    static KEY_UP: string;
    public updateAfterEvent(): void;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class MouseEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, localX?: number, localY?: number, relatedObject?: display.InteractiveObject, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean, buttonDown?: boolean, delta?: number);
    static CLICK: string;
    static DOUBLE_CLICK: string;
    static MOUSE_DOWN: string;
    static MOUSE_MOVE: string;
    static MOUSE_OUT: string;
    static MOUSE_OVER: string;
    static MOUSE_UP: string;
    static RELEASE_OUTSIDE: string;
    static MOUSE_WHEEL: string;
    static ROLL_OUT: string;
    static ROLL_OVER: string;
    static MIDDLE_CLICK: string;
    static MIDDLE_MOUSE_DOWN: string;
    static MIDDLE_MOUSE_UP: string;
    static RIGHT_CLICK: string;
    static RIGHT_MOUSE_DOWN: string;
    static RIGHT_MOUSE_UP: string;
    static CONTEXT_MENU: string;
    static typeFromDOMType(name: string): string;
    public clone: () => Event;
    private _localX;
    private _localY;
    private _movementX;
    private _movementY;
    private _position;
    public localX : number;
    public localY : number;
    public movementX : number;
    public movementY : number;
    public updateAfterEvent(): void;
    private _getGlobalPoint();
    public getStageX(): number;
    public getStageY(): number;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class NetStatusEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, info?: ASObject);
    static NET_STATUS: string;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class ProgressEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, bytesLoaded?: number, bytesTotal?: number);
    static PROGRESS: string;
    static SOCKET_DATA: string;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class SecurityErrorEvent extends ErrorEvent {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, text?: string, id?: number);
    static SECURITY_ERROR: string;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class TimerEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean);
    static TIMER: string;
    static TIMER_COMPLETE: string;
    public updateAfterEvent(): void;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class TouchEvent extends Event {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type: string, bubbles?: boolean, cancelable?: boolean, touchPointID?: number, isPrimaryTouchPoint?: boolean, localX?: number, localY?: number, sizeX?: number, sizeY?: number, pressure?: number, relatedObject?: display.InteractiveObject, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean);
    static TOUCH_BEGIN: string;
    static TOUCH_END: string;
    static TOUCH_MOVE: string;
    static TOUCH_OVER: string;
    static TOUCH_OUT: string;
    static TOUCH_ROLL_OVER: string;
    static TOUCH_ROLL_OUT: string;
    static TOUCH_TAP: string;
    static PROXIMITY_BEGIN: string;
    static PROXIMITY_END: string;
    static PROXIMITY_MOVE: string;
    static PROXIMITY_OUT: string;
    static PROXIMITY_OVER: string;
    static PROXIMITY_ROLL_OUT: string;
    static PROXIMITY_ROLL_OVER: string;
    public updateAfterEvent(): void;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class UncaughtErrorEvent extends ErrorEvent {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type?: string, bubbles?: boolean, cancelable?: boolean, error_in?: any);
    static UNCAUGHT_ERROR: string;
  }
}
declare module Shumway.AVM2.AS.flash.events {
  class UncaughtErrorEvents extends EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
  }
}
declare module Shumway.AVM2.AS.flash.display {
  enum DisplayObjectFlags {
    None = 0,
    Visible = 1,
    InvalidLineBounds = 2,
    InvalidFillBounds = 4,
    InvalidMatrix = 8,
    InvalidInvertedMatrix = 16,
    InvalidConcatenatedMatrix = 32,
    InvalidInvertedConcatenatedMatrix = 64,
    InvalidConcatenatedColorTransform = 128,
    Constructed = 256,
    Destroyed = 512,
    OwnedByTimeline = 1024,
    AnimatedByTimeline = 2048,
    HasFrameScriptPending = 4096,
    ContainsFrameScriptPendingChildren = 8192,
    CacheAsBitmap = 16384,
    DirtyMatrix = 1048576,
    DirtyChildren = 2097152,
    DirtyGraphics = 4194304,
    DirtyTextContent = 8388608,
    DirtyBitmapData = 16777216,
    DirtyNetStream = 33554432,
    DirtyColorTransform = 67108864,
    DirtyMask = 134217728,
    DirtyClipDepth = 268435456,
    DirtyMiscellaneousProperties = 536870912,
    Dirty,
  }
  enum VisitorFlags {
    None = 0,
    Continue = 0,
    Stop = 1,
    Skip = 2,
    FrontToBack = 8,
    Filter = 16,
  }
  interface IAdvancable extends IReferenceCountable {
    _initFrame(advance: boolean): void;
    _constructFrame(): void;
  }
  class DisplayObject extends events.EventDispatcher implements IBitmapDrawable, Remoting.IRemotable {
    static _syncID: number;
    static getNextSyncID(): number;
    static _instanceID: number;
    static _advancableInstances: WeakList<IAdvancable>;
    static classInitializer: any;
    static reset(): void;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static createAnimatedDisplayObject(state: Timeline.AnimationState, callConstructor: boolean): DisplayObject;
    private static _runScripts;
    static _stage: Stage;
    static performFrameNavigation(mainLoop: boolean, runScripts: boolean): void;
    static _broadcastFrameEvent(type: string): void;
    constructor();
    public _setInitialName(): void;
    public _setParent(parent: DisplayObjectContainer, depth: number): void;
    public _setFillAndLineBoundsFromWidthAndHeight(width: number, height: number): void;
    public _setFillAndLineBoundsFromSymbol(symbol: Timeline.DisplaySymbol): void;
    public _setFlags(flags: DisplayObjectFlags): void;
    public _setDirtyFlags(flags: DisplayObjectFlags): void;
    public _toggleFlags(flags: DisplayObjectFlags, on: boolean): void;
    public _removeFlags(flags: DisplayObjectFlags): void;
    public _hasFlags(flags: DisplayObjectFlags): boolean;
    public _hasAnyFlags(flags: DisplayObjectFlags): boolean;
    public _propagateFlagsUp(flags: DisplayObjectFlags): void;
    public _propagateFlagsDown(flags: DisplayObjectFlags): void;
    public _id: number;
    private _displayObjectFlags;
    public _root: DisplayObject;
    public _stage: Stage;
    public _name: string;
    public _parent: DisplayObjectContainer;
    public _mask: DisplayObject;
    public _scaleX: number;
    public _scaleY: number;
    public _z: number;
    public _scaleZ: number;
    public _rotation: number;
    public _rotationX: number;
    public _rotationY: number;
    public _rotationZ: number;
    public _mouseX: number;
    public _mouseY: number;
    public _width: number;
    public _height: number;
    public _opaqueBackground: ASObject;
    public _scrollRect: geom.Rectangle;
    public _filters: any[];
    public _blendMode: string;
    public _scale9Grid: Bounds;
    public _loaderInfo: LoaderInfo;
    public _accessibilityProperties: accessibility.AccessibilityProperties;
    public _fillBounds: Bounds;
    public _lineBounds: Bounds;
    public _clipDepth: number;
    public _matrix: geom.Matrix;
    public _invertedMatrix: geom.Matrix;
    public _concatenatedMatrix: geom.Matrix;
    public _invertedConcatenatedMatrix: geom.Matrix;
    public _colorTransform: geom.ColorTransform;
    public _concatenatedColorTransform: geom.ColorTransform;
    public _matrix3D: geom.Matrix3D;
    public _depth: number;
    public _ratio: number;
    public _index: number;
    public _isContainer: boolean;
    public _maskedObject: DisplayObject;
    public _mouseOver: boolean;
    public _mouseDown: boolean;
    public _symbol: Timeline.Symbol;
    public _graphics: Graphics;
    public _children: DisplayObject[];
    public _referenceCount: number;
    private _findNearestAncestor(flags, on);
    public _findFurthestAncestorOrSelf(): DisplayObject;
    public _isAncestor(child: DisplayObject): boolean;
    private static _clampRotation(value);
    private static _path;
    private static _getAncestors(node, last);
    public _getConcatenatedMatrix(): geom.Matrix;
    public _getInvertedConcatenatedMatrix(): geom.Matrix;
    public _setMatrix(matrix: geom.Matrix, toTwips: boolean): void;
    public _getMatrix(): geom.Matrix;
    public _getInvertedMatrix(): geom.Matrix;
    public _getConcatenatedColorTransform(): geom.ColorTransform;
    public _setColorTransform(colorTransform: geom.ColorTransform): void;
    public _invalidateFillAndLineBounds(fill: boolean, line: boolean): void;
    public _invalidateParentFillAndLineBounds(fill: boolean, line: boolean): void;
    public _getContentBounds(includeStrokes?: boolean): Bounds;
    private _getTransformedBounds(targetCoordinateSpace, includeStroke);
    private _stopTimelineAnimation();
    private _invalidateMatrix();
    public _invalidatePosition(): void;
    public _animate(state: Timeline.AnimationState): void;
    public _propagateEvent(event: events.Event): void;
    public x : number;
    public y : number;
    public scaleX : number;
    public scaleY : number;
    public scaleZ : number;
    public rotation : number;
    public rotationX : number;
    public rotationY : number;
    public rotationZ : number;
    public width : number;
    public height : number;
    public mask : DisplayObject;
    public transform : geom.Transform;
    private destroy();
    public root : DisplayObject;
    public stage : Stage;
    public name : string;
    public parent : DisplayObjectContainer;
    public visible : boolean;
    public alpha : number;
    public blendMode : string;
    public scale9Grid : geom.Rectangle;
    public cacheAsBitmap : boolean;
    public filters : filters.BitmapFilter[];
    public z : number;
    public getBounds(targetCoordinateSpace: DisplayObject): geom.Rectangle;
    public getRect(targetCoordinateSpace: DisplayObject): geom.Rectangle;
    public globalToLocal(point: geom.Point): geom.Point;
    public localToGlobal(point: geom.Point): geom.Point;
    public visit(visitor: (DisplayObject: any) => VisitorFlags, visitorFlags: VisitorFlags, displayObjectFlags?: DisplayObjectFlags): void;
    public loaderInfo : LoaderInfo;
    public _canHaveGraphics(): boolean;
    public _getGraphics(): Graphics;
    public _canHaveTextContent(): boolean;
    public _getTextContent(): TextContent;
    public _ensureGraphics(): Graphics;
    public _setStaticContentFromSymbol(symbol: Timeline.DisplaySymbol): void;
    public hitTestObject(other: DisplayObject): boolean;
    public hitTestPoint(x: number, y: number, shapeFlag: boolean, ignoreChildren: boolean, ignoreClipping?: boolean): boolean;
    public _isUnderMouse(x: number, y: number): boolean;
    public _containsPoint(x: number, y: number, shapeFlag: boolean, ignoreChildren: boolean, ignoreClipping: boolean): boolean;
    public scrollRect : geom.Rectangle;
    public opaqueBackground : any;
    public findFurthestInteractiveAncestorOrSelf(): InteractiveObject;
    private _getDistance(ancestor);
    public findNearestCommonAncestor(node: DisplayObject): DisplayObject;
    public mouseX : number;
    public mouseY : number;
    public debugName(): string;
    public debugTrace(maxDistance?: number, name?: string): void;
    public _addReference(): void;
    public _removeReference(): void;
    public accessibilityProperties : accessibility.AccessibilityProperties;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class Bitmap extends DisplayObject {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(bitmapData?: BitmapData, pixelSnapping?: string, smoothing?: boolean);
    public _pixelSnapping: string;
    public _smoothing: boolean;
    public _bitmapData: BitmapData;
    public pixelSnapping : string;
    public smoothing : boolean;
    public bitmapData : BitmapData;
    public _getContentBounds(includeStrokes?: boolean): Bounds;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class Shape extends DisplayObject {
    static classSymbols: string[];
    static instanceSymbols: string[];
    static classInitializer: any;
    static initializer: any;
    constructor();
    public _canHaveGraphics(): boolean;
    public _getGraphics(): Graphics;
    public graphics : Graphics;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class InteractiveObject extends DisplayObject {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public _tabEnabled: boolean;
    public _tabIndex: number;
    public _focusRect: ASObject;
    public _mouseEnabled: boolean;
    public _doubleClickEnabled: boolean;
    public _accessibilityImplementation: accessibility.AccessibilityImplementation;
    public _softKeyboardInputAreaOfInterest: geom.Rectangle;
    public _needsSoftKeyboard: boolean;
    public _contextMenu: ui.ContextMenu;
    public tabEnabled : boolean;
    public tabIndex : number;
    public focusRect : ASObject;
    public mouseEnabled : boolean;
    public doubleClickEnabled : boolean;
    public accessibilityImplementation : accessibility.AccessibilityImplementation;
    public softKeyboardInputAreaOfInterest : geom.Rectangle;
    public needsSoftKeyboard : boolean;
    public contextMenu : ui.ContextMenu;
    public requestSoftKeyboard(): boolean;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class SimpleButton extends InteractiveObject {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(upState?: DisplayObject, overState?: DisplayObject, downState?: DisplayObject, hitTestState?: DisplayObject);
    public _initFrame(advance: boolean): void;
    public _constructFrame(): void;
    private _useHandCursor;
    private _enabled;
    private _trackAsMenu;
    private _upState;
    private _overState;
    private _downState;
    private _hitTestState;
    private _currentState;
    public _symbol: Timeline.ButtonSymbol;
    public useHandCursor : boolean;
    public enabled : boolean;
    public trackAsMenu : boolean;
    public upState : DisplayObject;
    public overState : DisplayObject;
    public downState : DisplayObject;
    public hitTestState : DisplayObject;
    public soundTransform : media.SoundTransform;
    public _isUnderMouse(x: number, y: number): boolean;
    public _updateButton(): void;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class DisplayObjectContainer extends InteractiveObject {
    static bindings: string[];
    static classSymbols: string[];
    static classInitializer: any;
    static initializer: any;
    constructor();
    private _tabChildren;
    private _mouseChildren;
    private _invalidateChildren();
    public _propagateFlagsDown(flags: DisplayObjectFlags): void;
    public _constructChildren(): void;
    public _enqueueFrameScripts(): void;
    public numChildren : number;
    public textSnapshot : text.TextSnapshot;
    public tabChildren : boolean;
    public mouseChildren : boolean;
    public addChild(child: DisplayObject): DisplayObject;
    public addChildAt(child: DisplayObject, index: number): DisplayObject;
    public addTimelineObjectAtDepth(child: DisplayObject, depth: number): void;
    public removeChild(child: DisplayObject): DisplayObject;
    public removeChildAt(index: number): DisplayObject;
    public getChildIndex(child: DisplayObject): number;
    public setChildIndex(child: DisplayObject, index: number): void;
    public getChildAt(index: number): DisplayObject;
    public getTimelineObjectAtDepth(depth: number): DisplayObject;
    public getClipDepthIndex(depth: number): number;
    public getChildByName(name: string): DisplayObject;
    public getObjectsUnderPoint(globalPoint: geom.Point): DisplayObject[];
    public areInaccessibleObjectsUnderPoint(point: geom.Point): boolean;
    public contains(child: DisplayObject): boolean;
    public swapChildrenAt(index1: number, index2: number): void;
    private _swapChildrenAt(index1, index2);
    public swapChildren(child1: DisplayObject, child2: DisplayObject): void;
    public removeChildren(beginIndex?: number, endIndex?: number): void;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class JointStyle extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static ROUND: string;
    static BEVEL: string;
    static MITER: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class CapsStyle extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static ROUND: string;
    static NONE: string;
    static SQUARE: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class LineScaleMode extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static NORMAL: string;
    static VERTICAL: string;
    static HORIZONTAL: string;
    static NONE: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GradientType extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static LINEAR: string;
    static RADIAL: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class SpreadMethod extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static PAD: string;
    static REFLECT: string;
    static REPEAT: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class InterpolationMethod extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static RGB: string;
    static LINEAR_RGB: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GraphicsBitmapFill extends ASNative implements IGraphicsFill, IGraphicsData {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(bitmapData?: BitmapData, matrix?: geom.Matrix, repeat?: boolean, smooth?: boolean);
    public bitmapData: BitmapData;
    public matrix: geom.Matrix;
    public repeat: boolean;
    public smooth: boolean;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GraphicsEndFill extends ASNative implements IGraphicsFill, IGraphicsData {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GraphicsGradientFill extends ASNative implements IGraphicsFill, IGraphicsData {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(type?: string, colors?: any[], alphas?: any[], ratios?: any[], matrix?: any, spreadMethod?: any, interpolationMethod?: string, focalPointRatio?: number);
    public colors: any[];
    public alphas: any[];
    public ratios: any[];
    public matrix: geom.Matrix;
    public focalPointRatio: number;
    public type: string;
    public spreadMethod: any;
    public interpolationMethod: string;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GraphicsPath extends ASNative implements IGraphicsPath, IGraphicsData {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(commands?: ASVector<number>, data?: ASVector<number>, winding?: string);
    public commands: ASVector<number>;
    public data: ASVector<number>;
    public _winding: string;
    public winding: string;
    public moveTo: (x: number, y: number) => void;
    public lineTo: (x: number, y: number) => void;
    public curveTo: (controlX: number, controlY: number, anchorX: number, anchorY: number) => void;
    public cubicCurveTo: (controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number) => void;
    public wideLineTo: (x: number, y: number) => void;
    public wideMoveTo: (x: number, y: number) => void;
    public ensureLists: () => void;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GraphicsPathCommand extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static NO_OP: number;
    static MOVE_TO: number;
    static LINE_TO: number;
    static CURVE_TO: number;
    static WIDE_MOVE_TO: number;
    static WIDE_LINE_TO: number;
    static CUBIC_CURVE_TO: number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GraphicsPathWinding extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static EVEN_ODD: string;
    static NON_ZERO: string;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GraphicsSolidFill extends ASNative implements IGraphicsFill, IGraphicsData {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(color?: number, alpha?: number);
    public color: number;
    public alpha: number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GraphicsStroke extends ASNative implements IGraphicsStroke, IGraphicsData {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(thickness?: number, pixelHinting?: boolean, scaleMode?: string, caps?: string, joints?: string, miterLimit?: number, fill?: IGraphicsFill);
    public thickness: number;
    public pixelHinting: boolean;
    public miterLimit: number;
    public fill: IGraphicsFill;
    public scaleMode: string;
    public caps: string;
    public joints: string;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class GraphicsTrianglePath extends ASNative implements IGraphicsPath, IGraphicsData {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(vertices?: ASVector<number>, indices?: ASVector<number>, uvtData?: ASVector<number>, culling?: string);
    public indices: ASVector<number>;
    public vertices: ASVector<number>;
    public uvtData: ASVector<number>;
    public _culling: string;
    public culling: string;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  interface IDrawCommand {
  }
}
declare module Shumway.AVM2.AS.flash.display {
  interface IGraphicsData {
  }
}
declare module Shumway.AVM2.AS.flash.display {
  interface IGraphicsFill {
  }
}
declare module Shumway.AVM2.AS.flash.display {
  interface IGraphicsPath {
  }
}
declare module Shumway.AVM2.AS.flash.display {
  interface IGraphicsStroke {
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class Graphics extends ASNative implements Remoting.IRemotable {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static FromData(data: any): Graphics;
    public getGraphicsData(): ShapeData;
    public getUsedTextures(): BitmapData[];
    public _id: number;
    private _graphicsData;
    private _textures;
    private _hasFills;
    private _hasLines;
    private _lastX;
    private _lastY;
    private _boundsIncludeLastCoordinates;
    private _topLeftStrokeWidth;
    private _bottomRightStrokeWidth;
    public _isDirty: boolean;
    private _setStrokeWidth(width);
    private _fillBounds;
    private _lineBounds;
    public _parent: DisplayObject;
    public _setParent(parent: DisplayObject): void;
    public _invalidateParent(): void;
    public _invalidate(): void;
    public _getContentBounds(includeStrokes?: boolean): Bounds;
    public clear(): void;
    public beginFill(color: number, alpha?: number): void;
    public beginGradientFill(type: string, colors: number[], alphas: number[], ratios: number[], matrix?: flash.geom.Matrix, spreadMethod?: string, interpolationMethod?: string, focalPointRatio?: number): void;
    public beginBitmapFill(bitmap: BitmapData, matrix?: flash.geom.Matrix, repeat?: boolean, smooth?: boolean): void;
    public endFill(): void;
    public lineStyle(thickness: number, color?: number, alpha?: number, pixelHinting?: boolean, scaleMode?: string, caps?: string, joints?: string, miterLimit?: number): void;
    public lineGradientStyle(type: string, colors: any[], alphas: any[], ratios: any[], matrix?: flash.geom.Matrix, spreadMethod?: string, interpolationMethod?: string, focalPointRatio?: number): void;
    public lineBitmapStyle(bitmap: BitmapData, matrix?: flash.geom.Matrix, repeat?: boolean, smooth?: boolean): void;
    public drawRect(x: number, y: number, width: number, height: number): void;
    public drawRoundRect(x: number, y: number, width: number, height: number, ellipseWidth: number, ellipseHeight: number): void;
    public drawRoundRectComplex(x: number, y: number, width: number, height: number, topLeftRadius: number, topRightRadius: number, bottomLeftRadius: number, bottomRightRadius: number): void;
    public drawCircle(x: number, y: number, radius: number): void;
    public drawEllipse(x: number, y: number, width: number, height: number): void;
    public moveTo(x: number, y: number): void;
    public lineTo(x: number, y: number): void;
    public curveTo(controlX: number, controlY: number, anchorX: number, anchorY: number): void;
    public cubicCurveTo(controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number): void;
    public copyFrom(sourceGraphics: Graphics): void;
    public drawPath(commands: ASVector<any>, data: ASVector<any>, winding?: string): void;
    public drawTriangles(vertices: ASVector<any>, indices?: ASVector<any>, uvtData?: ASVector<any>, culling?: string): void;
    public drawGraphicsData(graphicsData: ASVector<any>): void;
    public _containsPoint(x: number, y: number, includeLines: boolean): boolean;
    private _fillContainsPoint(x, y);
    private _linesContainsPoint(x, y);
    private _writeBitmapStyle(pathCommand, bitmap, matrix, repeat, smooth, skipWrite);
    private _writeGradientStyle(pathCommand, type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPointRatio, skipWrite);
    private _extendBoundsByPoint(x, y);
    private _extendBoundsByX(x);
    private _extendBoundsByY(y);
    private _applyLastCoordinates(x, y);
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class Sprite extends DisplayObjectContainer {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    private _buttonMode;
    private _dropTarget;
    private _hitArea;
    private _useHandCursor;
    public _hitTarget: Sprite;
    private _initializeChildren(frame);
    public _initAvm1Bindings(instance: DisplayObject, state: Shumway.Timeline.AnimationState): void;
    public _canHaveGraphics(): boolean;
    public _getGraphics(): Graphics;
    public graphics : Graphics;
    public buttonMode : boolean;
    public dropTarget : DisplayObject;
    public hitArea : Sprite;
    public useHandCursor : boolean;
    public soundTransform : media.SoundTransform;
    public startDrag(lockCenter?: boolean, bounds?: geom.Rectangle): void;
    public stopDrag(): void;
    public startTouchDrag(touchPointID: number, lockCenter?: boolean, bounds?: geom.Rectangle): void;
    public stopTouchDrag(touchPointID: number): void;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class MovieClip extends Sprite implements IAdvancable {
    private static _callQueue;
    static classInitializer: any;
    static reset(): void;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static runFrameScripts(): void;
    constructor();
    public _setParent(parent: DisplayObjectContainer, depth: number): void;
    public _initFrame(advance: boolean): void;
    public _constructFrame(): void;
    public _enqueueFrameScripts(): void;
    private _currentFrame;
    private _nextFrame;
    private _totalFrames;
    private _frames;
    private _frameScripts;
    private _scenes;
    private _enabled;
    private _isPlaying;
    private _stopped;
    private _trackAsMenu;
    private _allowFrameNavigation;
    public _as2SymbolClass: any;
    private _boundExecuteAS2FrameScripts;
    private _as2FrameScripts;
    private _sounds;
    private _buttonFrames;
    private _currentButtonState;
    public currentFrame : number;
    public framesLoaded : number;
    public totalFrames : number;
    public trackAsMenu : boolean;
    public scenes : Scene[];
    public currentScene : Scene;
    public currentLabel : string;
    public currentFrameLabel : string;
    public enabled : boolean;
    public isPlaying : boolean;
    public play(): void;
    public stop(): void;
    private _gotoFrame(frame, sceneName);
    private _gotoFrameAbs(frame);
    private _advanceFrame();
    private _sceneForFrameIndex(frameIndex);
    private _labelForFrame(frame);
    private _removeAnimatedChild(child);
    public callFrame(frame: number): void;
    public nextFrame(): void;
    public prevFrame(): void;
    public gotoAndPlay(frame: any, scene?: string): void;
    public gotoAndStop(frame: any, scene?: string): void;
    public addFrameScript(frameIndex: number, script: (any?: any) => any): void;
    public addAS2FrameScript(frameIndex: number, actionsBlock: Uint8Array): void;
    public addAS2InitActionBlock(frameIndex: number, actionsBlock: {
      actionsData: Uint8Array;
    }): void;
    private _executeAS2FrameScripts();
    public _isFullyLoaded : boolean;
    public _registerStartSounds(frameNum: number, soundStartInfo: any): void;
    public _initSoundStream(streamInfo: any): void;
    public _addSoundStreamBlock(frameIndex: number, streamBlock: any): void;
    private _syncSounds(frameNum);
    public addScene(name: string, labels: any[], offset: number, numFrames: number): void;
    public addFrameLabel(name: string, frame: number): void;
    public prevScene(): void;
    public nextScene(): void;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class MovieClipSoundStream {
    private movieClip;
    private data;
    private seekIndex;
    private position;
    private element;
    private mediaSource;
    private sourceBuffer;
    private rawFrames;
    private decoderPosition;
    private decoderSession;
    private channel;
    private sound;
    private expectedFrame;
    private waitFor;
    constructor(streamInfo: any, movieClip: MovieClip);
    public appendBlock(frameNum: number, streamBlock: any): void;
    public playFrame(frameNum: number): void;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class Stage extends DisplayObjectContainer {
    static classInitializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static initializer: any;
    constructor();
    private _frameRate;
    private _scaleMode;
    private _align;
    private _stageWidth;
    private _stageHeight;
    private _showDefaultContextMenu;
    private _focus;
    private _colorCorrection;
    private _colorCorrectionSupport;
    private _stageFocusRect;
    private _quality;
    private _displayState;
    private _fullScreenSourceRect;
    private _mouseLock;
    private _stageVideos;
    private _stage3Ds;
    private _colorARGB;
    private _fullScreenWidth;
    private _fullScreenHeight;
    private _wmodeGPU;
    private _softKeyboardRect;
    private _allowsFullScreen;
    private _allowsFullScreenInteractive;
    private _contentsScaleFactor;
    private _displayContextInfo;
    private _timeout;
    private _invalidated;
    public frameRate : number;
    public scaleMode : string;
    public align : string;
    public stageWidth : number;
    public _setInitialName(): void;
    public setStageWidth(value: number): void;
    public stageHeight : number;
    public setStageHeight(value: number): void;
    public showDefaultContextMenu : boolean;
    public focus : InteractiveObject;
    public colorCorrection : string;
    public colorCorrectionSupport : string;
    public stageFocusRect : boolean;
    public quality : string;
    public displayState : string;
    public fullScreenSourceRect : geom.Rectangle;
    public mouseLock : boolean;
    public stageVideos : any;
    public stage3Ds : ASVector<any>;
    public color : number;
    public alpha : number;
    public fullScreenWidth : number;
    public fullScreenHeight : number;
    public wmodeGPU : boolean;
    public softKeyboardRect : geom.Rectangle;
    public allowsFullScreen : boolean;
    public allowsFullScreenInteractive : boolean;
    public contentsScaleFactor : number;
    public displayContextInfo : string;
    public swapChildrenAt(index1: number, index2: number): void;
    public invalidate(): void;
    public isInvalidated(): boolean;
    public isFocusInaccessible(): boolean;
    public requireOwnerPermissions(): void;
    public render(): void;
    public getObjectsUnderMouse(globalPoint: geom.Point): DisplayObject[];
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class ActionScriptVersion extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static ACTIONSCRIPT2: number;
    static ACTIONSCRIPT3: number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class BlendMode extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static NORMAL: string;
    static LAYER: string;
    static MULTIPLY: string;
    static SCREEN: string;
    static LIGHTEN: string;
    static DARKEN: string;
    static ADD: string;
    static SUBTRACT: string;
    static DIFFERENCE: string;
    static INVERT: string;
    static OVERLAY: string;
    static HARDLIGHT: string;
    static ALPHA: string;
    static ERASE: string;
    static SHADER: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class ColorCorrection extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static DEFAULT: string;
    static ON: string;
    static OFF: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class ColorCorrectionSupport extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static UNSUPPORTED: string;
    static DEFAULT_ON: string;
    static DEFAULT_OFF: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class FocusDirection extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static TOP: string;
    static BOTTOM: string;
    static NONE: string;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class FrameLabel extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(name: string, frame: number);
    private _name;
    private _frame;
    public name : string;
    public frame : number;
    public clone(): FrameLabel;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class BitmapData extends ASNative implements IBitmapDrawable, Remoting.IRemotable {
    static classInitializer: any;
    public _symbol: Timeline.BitmapSymbol;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static MAXIMUM_WIDTH: number;
    static MAXIMUM_HEIGHT: number;
    static MAXIMUM_DIMENSION: number;
    constructor(width: number, height: number, transparent?: boolean, fillColorARGB?: number);
    private _bitmapReferrers;
    public _addBitmapReferrer(bitmap: Bitmap): void;
    public _removeBitmapReferrer(bitmap: Bitmap): void;
    private _invalidate();
    public _transparent: boolean;
    public _rect: geom.Rectangle;
    public _id: number;
    public _fillColorBGRA: number;
    public _locked: boolean;
    public _type: ImageType;
    public _data: Uint8Array;
    public _dataBuffer: ArrayUtilities.DataBuffer;
    public _view: Int32Array;
    public _isDirty: boolean;
    public _isRemoteDirty: boolean;
    public getDataBuffer(): ArrayUtilities.DataBuffer;
    public _getContentBounds(): Bounds;
    private _getPixelData(rect);
    private _putPixelData(rect, input);
    public width : number;
    public height : number;
    public rect : geom.Rectangle;
    public transparent : boolean;
    public clone(): BitmapData;
    public getPixel(x: number, y: number): number;
    public getPixel32(x: number, y: number): number;
    public setPixel(x: number, y: number, uARGB: number): void;
    public setPixel32(x: number, y: number, uARGB: number): void;
    public applyFilter(sourceBitmapData: BitmapData, sourceRect: geom.Rectangle, destPoint: geom.Point, filter: filters.BitmapFilter): void;
    public colorTransform(rect: geom.Rectangle, colorTransform: geom.ColorTransform): void;
    public compare(otherBitmapData: BitmapData): ASObject;
    public copyChannel(sourceBitmapData: BitmapData, sourceRect: geom.Rectangle, destPoint: geom.Point, sourceChannel: number, destChannel: number): void;
    public copyPixels(sourceBitmapData: BitmapData, sourceRect: geom.Rectangle, destPoint: geom.Point, alphaBitmapData?: BitmapData, alphaPoint?: geom.Point, mergeAlpha?: boolean): void;
    public dispose(): void;
    public draw(source: IBitmapDrawable, matrix?: geom.Matrix, colorTransform?: geom.ColorTransform, blendMode?: string, clipRect?: geom.Rectangle, smoothing?: boolean): void;
    public drawWithQuality(source: IBitmapDrawable, matrix?: geom.Matrix, colorTransform?: geom.ColorTransform, blendMode?: string, clipRect?: geom.Rectangle, smoothing?: boolean, quality?: string): void;
    public fillRect(rect: geom.Rectangle, uARGB: number): void;
    public floodFill(x: number, y: number, color: number): void;
    public generateFilterRect(sourceRect: geom.Rectangle, filter: filters.BitmapFilter): geom.Rectangle;
    public getColorBoundsRect(mask: number, color: number, findColor?: boolean): geom.Rectangle;
    public getPixels(rect: geom.Rectangle): utils.ByteArray;
    public copyPixelsToByteArray(rect: geom.Rectangle, data: utils.ByteArray): void;
    public getVector(rect: geom.Rectangle): Uint32Vector;
    public hitTest(firstPoint: geom.Point, firstAlphaThreshold: number, secondObject: ASObject, secondBitmapDataPoint?: geom.Point, secondAlphaThreshold?: number): boolean;
    public merge(sourceBitmapData: BitmapData, sourceRect: geom.Rectangle, destPoint: geom.Point, redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number): void;
    public noise(randomSeed: number, low?: number, high?: number, channelOptions?: number, grayScale?: boolean): void;
    public paletteMap(sourceBitmapData: BitmapData, sourceRect: geom.Rectangle, destPoint: geom.Point, redArray?: any[], greenArray?: any[], blueArray?: any[], alphaArray?: any[]): void;
    public perlinNoise(baseX: number, baseY: number, numOctaves: number, randomSeed: number, stitch: boolean, fractalNoise: boolean, channelOptions?: number, grayScale?: boolean, offsets?: any[]): void;
    public pixelDissolve(sourceBitmapData: BitmapData, sourceRect: geom.Rectangle, destPoint: geom.Point, randomSeed?: number, numPixels?: number, fillColor?: number): number;
    public scroll(x: number, y: number): void;
    public setPixels(rect: geom.Rectangle, inputByteArray: utils.ByteArray): void;
    public setVector(rect: geom.Rectangle, inputVector: Uint32Vector): void;
    public threshold(sourceBitmapData: BitmapData, sourceRect: geom.Rectangle, destPoint: geom.Point, operation: string, threshold: number, color?: number, mask?: number, copySource?: boolean): number;
    public lock(): void;
    public unlock(changeRect?: geom.Rectangle): void;
    public histogram(hRect?: geom.Rectangle): ASVector<any>;
    public encode(rect: geom.Rectangle, compressor: ASObject, byteArray?: utils.ByteArray): utils.ByteArray;
    private _requestBitmapData();
  }
  interface IBitmapDataSerializer {
    drawToBitmap(bitmapData: BitmapData, source: IBitmapDrawable, matrix: geom.Matrix, colorTransform: geom.ColorTransform, blendMode: string, clipRect: geom.Rectangle, smoothing: boolean): any;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class BitmapDataChannel extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static RED: number;
    static GREEN: number;
    static BLUE: number;
    static ALPHA: number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class BitmapEncodingColorSpace extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static COLORSPACE_AUTO: string;
    static COLORSPACE_4_4_4: string;
    static COLORSPACE_4_2_2: string;
    static COLORSPACE_4_2_0: string;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  interface IBitmapDrawable {
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class JPEGEncoderOptions extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(quality?: number);
    public quality: number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class Loader extends DisplayObjectContainer implements IAdvancable {
    private static _rootLoader;
    private static _loadQueue;
    private static _embeddedContentLoadCount;
    static getRootLoader(): Loader;
    static reset(): void;
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static WORKERS_AVAILABLE: boolean;
    static LOADER_PATH: string;
    static progress(): void;
    constructor();
    public _initFrame(advance: boolean): void;
    public _constructFrame(): void;
    private _content;
    private _contentLoaderInfo;
    private _worker;
    private _loadStatus;
    private _loadingType;
    private _initialDataLoaded;
    private _waitForInitialData;
    private _commitDataQueue;
    public _startPromise: Promise<any>;
    private _progressPromise;
    private _codeExecutionPromise;
    private _commitData(data);
    private _commitQueuedData(data);
    private _initAvm1(loaderInfo);
    private _commitAsset(data);
    private _commitFrame(data);
    private _initAvm1Root(root);
    private _executeAvm1Actions(root, frameIndex, frameData);
    private _commitImage(data);
    public content : DisplayObject;
    public contentLoaderInfo : LoaderInfo;
    public _close(): void;
    public _unload(stopExecution: boolean, gc: boolean): void;
    public _getJPEGLoaderContextdeblockingfilter(context: system.LoaderContext): number;
    public _getUncaughtErrorEvents(): flash.events.UncaughtErrorEvents;
    public _setUncaughtErrorEvents(value: flash.events.UncaughtErrorEvents): void;
    public load(request: net.URLRequest, context?: system.LoaderContext): void;
    public loadBytes(data: utils.ByteArray, context: system.LoaderContext): void;
    private _applyLoaderContext(context, request);
    private _createParsingWorker();
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class LoaderInfo extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public uncaughtErrorEvents: events.UncaughtErrorEvents;
    static getLoaderInfoByDefinition(object: Object): LoaderInfo;
    public _loaderURL: string;
    public _url: string;
    public _isURLInaccessible: boolean;
    public _bytesLoaded: number;
    public _bytesTotal: number;
    public _applicationDomain: system.ApplicationDomain;
    public _swfVersion: number;
    public _actionScriptVersion: number;
    public _frameRate: number;
    public _parameters: Object;
    public _width: number;
    public _height: number;
    public _contentType: string;
    public _sharedEvents: events.EventDispatcher;
    public _parentSandboxBridge: Object;
    public _childSandboxBridge: Object;
    public _sameDomain: boolean;
    public _childAllowsParent: boolean;
    public _parentAllowsChild: boolean;
    public _loader: Loader;
    public _content: DisplayObject;
    public _bytes: utils.ByteArray;
    public _uncaughtErrorEvents: events.UncaughtErrorEvents;
    public _allowCodeExecution: boolean;
    public _colorRGBA: number;
    public _dictionary: Timeline.Symbol[];
    public _avm1Context: AVM1.AS2Context;
    public loaderURL : string;
    public url : string;
    public isURLInaccessible : boolean;
    public bytesLoaded : number;
    public bytesTotal : number;
    public applicationDomain : system.ApplicationDomain;
    public swfVersion : number;
    public actionScriptVersion : number;
    public frameRate : number;
    public width : number;
    public height : number;
    public contentType : string;
    public sharedEvents : events.EventDispatcher;
    public parentSandboxBridge : Object;
    public childSandboxBridge : Object;
    public sameDomain : boolean;
    public childAllowsParent : boolean;
    public parentAllowsChild : boolean;
    public loader : Loader;
    public content : DisplayObject;
    public bytes : utils.ByteArray;
    public parameters : Object;
    public _getUncaughtErrorEvents(): events.UncaughtErrorEvents;
    public _setUncaughtErrorEvents(value: events.UncaughtErrorEvents): void;
    public registerSymbol(symbol: Timeline.Symbol): void;
    public getSymbolById(id: number): Timeline.Symbol;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class MorphShape extends DisplayObject {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public _graphics: Graphics;
    public morphFillBounds: Bounds;
    public morphLineBounds: Bounds;
    public _canHaveGraphics(): boolean;
    public _getGraphics(): Graphics;
    public graphics : Graphics;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class NativeMenu extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class NativeMenuItem extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public _enabled: boolean;
    public enabled : boolean;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class PNGEncoderOptions extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(fastCompression?: boolean);
    public fastCompression: boolean;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class PixelSnapping extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static NEVER: string;
    static ALWAYS: string;
    static AUTO: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class SWFVersion extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static FLASH1: number;
    static FLASH2: number;
    static FLASH3: number;
    static FLASH4: number;
    static FLASH5: number;
    static FLASH6: number;
    static FLASH7: number;
    static FLASH8: number;
    static FLASH9: number;
    static FLASH10: number;
    static FLASH11: number;
    static FLASH12: number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class Scene extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(name: string, labels: FrameLabel[], offset: number, numFrames: number);
    public _name: string;
    public offset: number;
    public _numFrames: number;
    public _labels: FrameLabel[];
    public name : string;
    public labels : FrameLabel[];
    public numFrames : number;
    public clone(): Scene;
    public getLabelByName(name: string): FrameLabel;
    public getLabelByFrame(frame: number): FrameLabel;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class StageAlign extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static TOP: string;
    static LEFT: string;
    static BOTTOM: string;
    static RIGHT: string;
    static TOP_LEFT: string;
    static TOP_RIGHT: string;
    static BOTTOM_LEFT: string;
    static BOTTOM_RIGHT: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class StageDisplayState extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static FULL_SCREEN: string;
    static FULL_SCREEN_INTERACTIVE: string;
    static NORMAL: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class StageQuality extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static LOW: string;
    static MEDIUM: string;
    static HIGH: string;
    static BEST: string;
    static HIGH_8X8: string;
    static HIGH_8X8_LINEAR: string;
    static HIGH_16X16: string;
    static HIGH_16X16_LINEAR: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class StageScaleMode extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static SHOW_ALL: string;
    static EXACT_FIT: string;
    static NO_BORDER: string;
    static NO_SCALE: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class TriangleCulling extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static NONE: string;
    static POSITIVE: string;
    static NEGATIVE: string;
  }
}
declare module Shumway.AVM2.AS.flash.display {
  class AVM1Movie extends DisplayObject {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public call: (functionName: string) => any;
    public addCallback: (functionName: string, closure: ASFunction) => void;
  }
}
declare module Shumway.AVM2.AS.flash.external {
  class ExternalInterface extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static marshallExceptions: boolean;
    static ensureInitialized: () => void;
    static addCallback: (functionName: string, closure: ASFunction) => void;
    static convertToXML: (s: string) => ASXML;
    static convertToXMLString: (obj: any) => string;
    static convertFromXML: (xml: ASXML) => ASObject;
    static convertToJSString: (obj: any) => string;
    private static initialized;
    private static registeredCallbacks;
    private static _getAvailable();
    static _initJS(): void;
    private static _callIn(functionName, args);
    static _getPropNames(obj: ASObject): any[];
    static _addCallback(functionName: string, closure: (request: string, args: any[]) => any, hasNullCallback: boolean): void;
    static _evalJS(expression: string): string;
    static _callOut(request: string): string;
    static available : boolean;
    static objectID : string;
    static activeX : boolean;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class BitmapFilterQuality extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static LOW: number;
    static MEDIUM: number;
    static HIGH: number;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class BitmapFilterType extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static INNER: string;
    static OUTER: string;
    static FULL: string;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class BitmapFilter extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    private static EPS;
    private static blurFilterStepWidths;
    static _updateBlurBounds(bounds: geom.Rectangle, blurX: number, blurY: number, quality: number, isBlurFilter?: boolean): void;
    constructor();
    public _updateFilterBounds(bounds: geom.Rectangle): void;
    public _serialize(message: any): void;
    public clone(): BitmapFilter;
  }
  class GradientArrays {
    static colors: any[];
    static alphas: any[];
    static ratios: any[];
    static sanitize(colors: any[], alphas: any[], ratios: any[]): void;
    static sanitizeColors(colors: number[], maxLen?: number): number[];
    static sanitizeAlphas(alphas: number[], maxLen?: number, minLen?: number, value?: number): number[];
    static sanitizeRatios(ratios: number[], maxLen?: number, minLen?: number, value?: number): number[];
    static initArray(len: number, value?: number): number[];
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class BevelFilter extends BitmapFilter {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static FromUntyped(obj: any): BevelFilter;
    constructor(distance?: number, angle?: number, highlightColor?: number, highlightAlpha?: number, shadowColor?: number, shadowAlpha?: number, blurX?: number, blurY?: number, strength?: number, quality?: number, type?: string, knockout?: boolean);
    public _updateFilterBounds(bounds: geom.Rectangle): void;
    private _distance;
    private _angle;
    private _highlightColor;
    private _highlightAlpha;
    private _shadowColor;
    private _shadowAlpha;
    private _blurX;
    private _blurY;
    private _knockout;
    private _quality;
    private _strength;
    private _type;
    public distance : number;
    public angle : number;
    public highlightColor : number;
    public highlightAlpha : number;
    public shadowColor : number;
    public shadowAlpha : number;
    public blurX : number;
    public blurY : number;
    public knockout : boolean;
    public quality : number;
    public strength : number;
    public type : string;
    public clone(): BitmapFilter;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class BlurFilter extends BitmapFilter {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static FromUntyped(obj: any): BlurFilter;
    constructor(blurX?: number, blurY?: number, quality?: number);
    public _updateFilterBounds(bounds: geom.Rectangle): void;
    public _serialize(message: any): void;
    private _blurX;
    private _blurY;
    private _quality;
    public blurX : number;
    public blurY : number;
    public quality : number;
    public clone(): BitmapFilter;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class ColorMatrixFilter extends BitmapFilter {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static FromUntyped(obj: any): ColorMatrixFilter;
    constructor(matrix?: any[]);
    public _serialize(message: any): void;
    private _matrix;
    public matrix : any[];
    public clone(): BitmapFilter;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class ConvolutionFilter extends BitmapFilter {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static FromUntyped(obj: any): ConvolutionFilter;
    constructor(matrixX?: number, matrixY?: number, matrix?: any[], divisor?: number, bias?: number, preserveAlpha?: boolean, clamp?: boolean, color?: number, alpha?: number);
    private _expandArray(a, newLen, value?);
    private _matrix;
    private _matrixX;
    private _matrixY;
    private _divisor;
    private _bias;
    private _preserveAlpha;
    private _clamp;
    private _color;
    private _alpha;
    public matrix : any[];
    public matrixX : number;
    public matrixY : number;
    public divisor : number;
    public bias : number;
    public preserveAlpha : boolean;
    public clamp : boolean;
    public color : number;
    public alpha : number;
    public clone(): BitmapFilter;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class DisplacementMapFilterMode extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static WRAP: string;
    static CLAMP: string;
    static IGNORE: string;
    static COLOR: string;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class DisplacementMapFilter extends BitmapFilter {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static FromUntyped(obj: any): DisplacementMapFilter;
    constructor(mapBitmap?: display.BitmapData, mapPoint?: geom.Point, componentX?: number, componentY?: number, scaleX?: number, scaleY?: number, mode?: string, color?: number, alpha?: number);
    private _mapBitmap;
    private _mapPoint;
    private _componentX;
    private _componentY;
    private _scaleX;
    private _scaleY;
    private _mode;
    private _color;
    private _alpha;
    public mapBitmap : display.BitmapData;
    public mapPoint : geom.Point;
    public componentX : number;
    public componentY : number;
    public scaleX : number;
    public scaleY : number;
    public mode : string;
    public color : number;
    public alpha : number;
    public clone(): BitmapFilter;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class DropShadowFilter extends BitmapFilter {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static FromUntyped(obj: any): DropShadowFilter;
    constructor(distance?: number, angle?: number, color?: number, alpha?: number, blurX?: number, blurY?: number, strength?: number, quality?: number, inner?: boolean, knockout?: boolean, hideObject?: boolean);
    public _updateFilterBounds(bounds: geom.Rectangle): void;
    public _serialize(message: any): void;
    private _distance;
    private _angle;
    private _color;
    private _alpha;
    private _blurX;
    private _blurY;
    private _hideObject;
    private _inner;
    private _knockout;
    private _quality;
    private _strength;
    public distance : number;
    public angle : number;
    public color : number;
    public alpha : number;
    public blurX : number;
    public blurY : number;
    public hideObject : boolean;
    public inner : boolean;
    public knockout : boolean;
    public quality : number;
    public strength : number;
    public clone(): BitmapFilter;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class GlowFilter extends BitmapFilter {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static FromUntyped(obj: any): GlowFilter;
    constructor(color?: number, alpha?: number, blurX?: number, blurY?: number, strength?: number, quality?: number, inner?: boolean, knockout?: boolean);
    public _updateFilterBounds(bounds: geom.Rectangle): void;
    public _serialize(message: any): void;
    private _color;
    private _alpha;
    private _blurX;
    private _blurY;
    private _inner;
    private _knockout;
    private _quality;
    private _strength;
    public color : number;
    public alpha : number;
    public blurX : number;
    public blurY : number;
    public inner : boolean;
    public knockout : boolean;
    public quality : number;
    public strength : number;
    public clone(): BitmapFilter;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class GradientBevelFilter extends BitmapFilter {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static FromUntyped(obj: any): GradientBevelFilter;
    constructor(distance?: number, angle?: number, colors?: any[], alphas?: any[], ratios?: any[], blurX?: number, blurY?: number, strength?: number, quality?: number, type?: string, knockout?: boolean);
    public _updateFilterBounds(bounds: geom.Rectangle): void;
    private _distance;
    private _angle;
    private _colors;
    private _alphas;
    private _ratios;
    private _blurX;
    private _blurY;
    private _knockout;
    private _quality;
    private _strength;
    private _type;
    public distance : number;
    public angle : number;
    public colors : any[];
    public alphas : any[];
    public ratios : any[];
    public blurX : number;
    public blurY : number;
    public knockout : boolean;
    public quality : number;
    public strength : number;
    public type : string;
    public clone(): BitmapFilter;
  }
}
declare module Shumway.AVM2.AS.flash.filters {
  class GradientGlowFilter extends BitmapFilter {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static FromUntyped(obj: any): GradientGlowFilter;
    constructor(distance?: number, angle?: number, colors?: any[], alphas?: any[], ratios?: any[], blurX?: number, blurY?: number, strength?: number, quality?: number, type?: string, knockout?: boolean);
    public _updateFilterBounds(bounds: geom.Rectangle): void;
    private _distance;
    private _angle;
    private _colors;
    private _alphas;
    private _ratios;
    private _blurX;
    private _blurY;
    private _knockout;
    private _quality;
    private _strength;
    private _type;
    public distance : number;
    public angle : number;
    public colors : any[];
    public alphas : any[];
    public ratios : any[];
    public blurX : number;
    public blurY : number;
    public knockout : boolean;
    public quality : number;
    public strength : number;
    public type : string;
    public clone(): BitmapFilter;
  }
}
declare module Shumway.AVM2.AS.flash.geom {
  class ColorTransform extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(redMultiplier?: number, greenMultiplier?: number, blueMultiplier?: number, alphaMultiplier?: number, redOffset?: number, greenOffset?: number, blueOffset?: number, alphaOffset?: number);
    static FromCXForm(cxform: any): ColorTransform;
    public redMultiplier: number;
    public greenMultiplier: number;
    public blueMultiplier: number;
    public alphaMultiplier: number;
    public redOffset: number;
    public greenOffset: number;
    public blueOffset: number;
    public alphaOffset: number;
    public native_redMultiplier : number;
    public native_greenMultiplier : number;
    public native_blueMultiplier : number;
    public native_alphaMultiplier : number;
    public native_redOffset : number;
    public native_greenOffset : number;
    public native_blueOffset : number;
    public native_alphaOffset : number;
    public ColorTransform(redMultiplier?: number, greenMultiplier?: number, blueMultiplier?: number, alphaMultiplier?: number, redOffset?: number, greenOffset?: number, blueOffset?: number, alphaOffset?: number): void;
    public color : number;
    public concat(second: ColorTransform): void;
    public preMultiply(second: ColorTransform): void;
    public copyFrom(sourceColorTransform: ColorTransform): void;
    public setTo(redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number, redOffset: number, greenOffset: number, blueOffset: number, alphaOffset: number): void;
    public clone(): ColorTransform;
    public convertToFixedPoint(): ColorTransform;
    public toString(): string;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class Camera extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public names : any[];
    public isSupported : boolean;
    static getCamera(name?: string): Camera;
    static _scanHardware(): void;
    public activityLevel : number;
    public bandwidth : number;
    public currentFPS : number;
    public fps : number;
    public height : number;
    public index : number;
    public keyFrameInterval : number;
    public loopback : boolean;
    public motionLevel : number;
    public motionTimeout : number;
    public muted : boolean;
    public name : string;
    public position : string;
    public quality : number;
    public width : number;
    public setCursor(value: boolean): void;
    public setKeyFrameInterval(keyFrameInterval: number): void;
    public setLoopback(compress?: boolean): void;
    public setMode(width: number, height: number, fps: number, favorArea?: boolean): void;
    public setMotionLevel(motionLevel: number, timeout?: number): void;
    public setQuality(bandwidth: number, quality: number): void;
    public drawToBitmapData(destination: display.BitmapData): void;
    public copyToByteArray(rect: geom.Rectangle, destination: utils.ByteArray): void;
    public copyToVector(rect: geom.Rectangle, destination: ASVector<any>): void;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class ID3Info extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public songName: string;
    public artist: string;
    public album: string;
    public year: string;
    public comment: string;
    public genre: string;
    public track: string;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class Microphone extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public names : any[];
    public isSupported : boolean;
    static getMicrophone(index?: number): Microphone;
    static getEnhancedMicrophone(index?: number): Microphone;
    public rate : number;
    public codec : string;
    public framesPerPacket : number;
    public encodeQuality : number;
    public noiseSuppressionLevel : number;
    public enableVAD : boolean;
    public activityLevel : number;
    public gain : number;
    public index : number;
    public muted : boolean;
    public name : string;
    public silenceLevel : number;
    public silenceTimeout : number;
    public useEchoSuppression : boolean;
    public soundTransform : SoundTransform;
    public setSilenceLevel(silenceLevel: number, timeout?: number): void;
    public setUseEchoSuppression(useEchoSuppression: boolean): void;
    public setLoopBack(state?: boolean): void;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class Sound extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(stream?: net.URLRequest, context?: SoundLoaderContext);
    private _playQueue;
    private _soundData;
    private _stream;
    public load: (stream: net.URLRequest, context?: SoundLoaderContext) => void;
    private _url;
    private _length;
    private _bytesLoaded;
    private _bytesTotal;
    private _id3;
    public url : string;
    public isURLInaccessible : boolean;
    public length : number;
    public isBuffering : boolean;
    public bytesLoaded : number;
    public bytesTotal : number;
    public id3 : ID3Info;
    public loadCompressedDataFromByteArray(bytes: utils.ByteArray, bytesLength: number): void;
    public loadPCMFromByteArray(bytes: utils.ByteArray, samples: number, format?: string, stereo?: boolean, sampleRate?: number): void;
    public play(startTime?: number, loops?: number, sndTransform?: SoundTransform): SoundChannel;
    public close(): void;
    public extract(target: utils.ByteArray, length: number, startPosition?: number): number;
    public _load(request: net.URLRequest, checkPolicyFile: boolean, bufferTime: number): void;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class SoundChannel extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public _element: any;
    public _sound: Sound;
    private _audioChannel;
    private _pcmData;
    private _position;
    public _soundTransform: SoundTransform;
    private _leftPeak;
    private _rightPeak;
    public position : number;
    public soundTransform : SoundTransform;
    public leftPeak : number;
    public rightPeak : number;
    public stop(): void;
    public _playSoundDataViaAudio(soundData: any, startTime: any, loops: any): void;
    public _playSoundDataViaChannel(soundData: any, startTime: any, loops: any): void;
    public _applySoundTransform(): void;
    public _registerWithSoundMixer(): void;
    public _unregisterWithSoundMixer(): void;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class SoundLoaderContext extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(bufferTime?: number, checkPolicyFile?: boolean);
    public bufferTime: number;
    public checkPolicyFile: boolean;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class SoundMixer extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    private static _masterVolume;
    private static _registeredChannels;
    static _soundTransform: SoundTransform;
    static bufferTime : number;
    static soundTransform : SoundTransform;
    static audioPlaybackMode : string;
    static useSpeakerphoneForVoice : boolean;
    static stopAll(): void;
    static computeSpectrum(outputArray: utils.ByteArray, FFTMode?: boolean, stretchFactor?: number): void;
    static areSoundsInaccessible(): boolean;
    static _getMasterVolume(): number;
    static _setMasterVolume(volume: any): void;
    static _registerChannel(channel: SoundChannel): void;
    static _unregisterChannel(channel: SoundChannel): void;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class SoundTransform extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(vol?: number, panning?: number);
    private _volume;
    private _leftToLeft;
    private _leftToRight;
    private _rightToRight;
    private _rightToLeft;
    public volume : number;
    public leftToLeft : number;
    public leftToRight : number;
    public rightToRight : number;
    public rightToLeft : number;
    public pan : number;
    public _updateTransform(): void;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class Video extends display.DisplayObject {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(width?: number, height?: number);
    public _deblocking: number;
    public _smoothing: boolean;
    public _videoWidth: number;
    public _videoHeight: number;
    public _netStream: net.NetStream;
    public _camera: Camera;
    public deblocking : number;
    public smoothing : boolean;
    public videoWidth : number;
    public videoHeight : number;
    public clear(): void;
    public attachNetStream(netStream: net.NetStream): void;
    public attachCamera(camera: Camera): void;
  }
}
declare module Shumway.AVM2.AS.flash.media {
  class VideoStreamSettings extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public width: number;
    public height: number;
    public fps: number;
    public quality: number;
    public bandwidth: number;
    public keyFrameInterval: number;
    public codec: string;
    public setMode: (width: number, height: number, fps: number) => void;
    public setQuality: (bandwidth: number, quality: number) => void;
    public setKeyFrameInterval: (keyFrameInterval: number) => void;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class FileFilter extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(description: string, extension: string, macType?: string);
    private _description;
    private _extension;
    private _macType;
    public description : string;
    public extension : string;
    public macType : string;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class LocalConnection extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static isSupported: boolean;
    public close(): void;
    public connect(connectionName: string): void;
    public domain : string;
    public send(connectionName: string, methodName: string): void;
    public client : ASObject;
    public isPerUser : boolean;
    public allowDomain(): void;
    public allowInsecureDomain(): void;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class NetConnection extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public close: () => void;
    public addHeader: (operation: string, mustUnderstand?: boolean, param?: ASObject) => void;
    public call: (command: string, responder: Responder) => void;
    static _defaultObjectEncoding: number;
    static defaultObjectEncoding : number;
    private _connected;
    private _uri;
    private _client;
    private _objectEncoding;
    private _proxyType;
    private _usingTLS;
    public connected : boolean;
    public uri : string;
    public connect(command: string): void;
    public client : ASObject;
    public objectEncoding : number;
    public proxyType : string;
    public connectedProxyType : string;
    public usingTLS : boolean;
    public protocol : string;
    public maxPeerConnections : number;
    public nearID : string;
    public farID : string;
    public nearNonce : string;
    public farNonce : string;
    public unconnectedPeerStreams : any[];
    public ctor(): void;
    public invoke(index: number): any;
    public invokeWithArgsArray(index: number, p_arguments: any[]): any;
    private _invoke(index, args);
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class NetStream extends events.EventDispatcher {
    public _isDirty: boolean;
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(connection: NetConnection, peerID?: string);
    public _connection: NetConnection;
    public _peerID: string;
    public _id: number;
    public _videoReferrer: media.Video;
    private _videoElement;
    private _videoReady;
    private _videoMetadataReady;
    private _videoState;
    private _mediaSource;
    private _contentTypeHint;
    private _mediaSourceBuffer;
    static DIRECT_CONNECTIONS: string;
    static CONNECT_TO_FMS: string;
    public attach: (connection: NetConnection) => void;
    public close: () => void;
    public attachAudio: (microphone: media.Microphone) => void;
    public attachCamera: (theCamera: media.Camera, snapshotMilliseconds?: number) => void;
    public send: (handlerName: string) => void;
    public bufferTime: number;
    public maxPauseBufferTime: number;
    public backBufferTime: number;
    public inBufferSeek: boolean;
    public backBufferLength: number;
    public step: (frames: number) => void;
    public bufferTimeMax: number;
    public receiveAudio: (flag: boolean) => void;
    public receiveVideo: (flag: boolean) => void;
    public receiveVideoFPS: (FPS: number) => void;
    public pause: () => void;
    public resume: () => void;
    public togglePause: () => void;
    public seek: (offset: number) => void;
    public publish: (name?: string, type?: string) => void;
    public time: number;
    public currentFPS: number;
    public bufferLength: number;
    public liveDelay: number;
    public bytesLoaded: number;
    public bytesTotal: number;
    public decodedFrames: number;
    public videoCodec: number;
    public audioCodec: number;
    public onPeerConnect: (subscriber: NetStream) => boolean;
    public call: () => void;
    private _soundTransform;
    private _checkPolicyFile;
    private _client;
    private _objectEncoding;
    public _url: string;
    public dispose(): void;
    public play(url: string): void;
    public play2(param: NetStreamPlayOptions): void;
    public info : NetStreamInfo;
    public multicastInfo : NetStreamMulticastInfo;
    public soundTransform : media.SoundTransform;
    public checkPolicyFile : boolean;
    public client : ASObject;
    public objectEncoding : number;
    public multicastPushNeighborLimit : number;
    public multicastWindowDuration : number;
    public multicastRelayMarginDuration : number;
    public multicastAvailabilityUpdatePeriod : number;
    public multicastFetchPeriod : number;
    public multicastAvailabilitySendToAll : boolean;
    public farID : string;
    public nearNonce : string;
    public farNonce : string;
    public peerStreams : any[];
    public audioReliable : boolean;
    public videoReliable : boolean;
    public dataReliable : boolean;
    public audioSampleAccess : boolean;
    public videoSampleAccess : boolean;
    public appendBytes(bytes: utils.ByteArray): void;
    public appendBytesAction(netStreamAppendBytesAction: string): void;
    public useHardwareDecoder : boolean;
    public useJitterBuffer : boolean;
    public videoStreamSettings : media.VideoStreamSettings;
    public ctor(connection: NetConnection, peerID: string): void;
    public invoke(index: number): any;
    public invokeWithArgsArray(index: number, p_arguments: any[]): any;
    private _invoke(index, args);
    private _createVideoElement(url);
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class NetStreamInfo extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(curBPS: number, byteCount: number, maxBPS: number, audioBPS: number, audioByteCount: number, videoBPS: number, videoByteCount: number, dataBPS: number, dataByteCount: number, playbackBPS: number, droppedFrames: number, audioBufferByteLength: number, videoBufferByteLength: number, dataBufferByteLength: number, audioBufferLength: number, videoBufferLength: number, dataBufferLength: number, srtt: number, audioLossRate: number, videoLossRate: number, metaData?: ASObject, xmpData?: ASObject, uri?: string, resourceName?: string, isLive?: boolean);
    public currentBytesPerSecond: number;
    public byteCount: number;
    public maxBytesPerSecond: number;
    public audioBytesPerSecond: number;
    public audioByteCount: number;
    public videoBytesPerSecond: number;
    public videoByteCount: number;
    public dataBytesPerSecond: number;
    public dataByteCount: number;
    public playbackBytesPerSecond: number;
    public droppedFrames: number;
    public audioBufferByteLength: number;
    public videoBufferByteLength: number;
    public dataBufferByteLength: number;
    public audioBufferLength: number;
    public videoBufferLength: number;
    public dataBufferLength: number;
    public SRTT: number;
    public audioLossRate: number;
    public videoLossRate: number;
    public metaData: ASObject;
    public xmpData: ASObject;
    public uri: string;
    public resourceName: string;
    public isLive: boolean;
    public _curBPS: number;
    public _byteCount: number;
    public _maxBPS: number;
    public _audioBPS: number;
    public _audioByteCount: number;
    public _videoBPS: number;
    public _videoByteCount: number;
    public _dataBPS: number;
    public _dataByteCount: number;
    public _playbackBPS: number;
    public _droppedFrames: number;
    public _audioBufferByteLength: number;
    public _videoBufferByteLength: number;
    public _dataBufferByteLength: number;
    public _audioBufferLength: number;
    public _videoBufferLength: number;
    public _dataBufferLength: number;
    public _srtt: number;
    public _audioLossRate: number;
    public _videoLossRate: number;
    public _metaData: ASObject;
    public _xmpData: ASObject;
    public _uri: string;
    public _resourceName: string;
    public _isLive: boolean;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class NetStreamMulticastInfo extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(sendDataBytesPerSecond: number, sendControlBytesPerSecond: number, receiveDataBytesPerSecond: number, receiveControlBytesPerSecond: number, bytesPushedToPeers: number, fragmentsPushedToPeers: number, bytesRequestedByPeers: number, fragmentsRequestedByPeers: number, bytesPushedFromPeers: number, fragmentsPushedFromPeers: number, bytesRequestedFromPeers: number, fragmentsRequestedFromPeers: number, sendControlBytesPerSecondToServer: number, receiveDataBytesPerSecondFromServer: number, bytesReceivedFromServer: number, fragmentsReceivedFromServer: number, receiveDataBytesPerSecondFromIPMulticast: number, bytesReceivedFromIPMulticast: number, fragmentsReceivedFromIPMulticast: number);
    public _sendDataBytesPerSecond: number;
    public _sendControlBytesPerSecond: number;
    public _receiveDataBytesPerSecond: number;
    public _receiveControlBytesPerSecond: number;
    public _bytesPushedToPeers: number;
    public _fragmentsPushedToPeers: number;
    public _bytesRequestedByPeers: number;
    public _fragmentsRequestedByPeers: number;
    public _bytesPushedFromPeers: number;
    public _fragmentsPushedFromPeers: number;
    public _bytesRequestedFromPeers: number;
    public _fragmentsRequestedFromPeers: number;
    public _sendControlBytesPerSecondToServer: number;
    public _receiveDataBytesPerSecondFromServer: number;
    public _bytesReceivedFromServer: number;
    public _fragmentsReceivedFromServer: number;
    public _receiveDataBytesPerSecondFromIPMulticast: number;
    public _bytesReceivedFromIPMulticast: number;
    public _fragmentsReceivedFromIPMulticast: number;
    public sendDataBytesPerSecond: number;
    public sendControlBytesPerSecond: number;
    public receiveDataBytesPerSecond: number;
    public receiveControlBytesPerSecond: number;
    public bytesPushedToPeers: number;
    public fragmentsPushedToPeers: number;
    public bytesRequestedByPeers: number;
    public fragmentsRequestedByPeers: number;
    public bytesPushedFromPeers: number;
    public fragmentsPushedFromPeers: number;
    public bytesRequestedFromPeers: number;
    public fragmentsRequestedFromPeers: number;
    public sendControlBytesPerSecondToServer: number;
    public receiveDataBytesPerSecondFromServer: number;
    public bytesReceivedFromServer: number;
    public fragmentsReceivedFromServer: number;
    public receiveDataBytesPerSecondFromIPMulticast: number;
    public bytesReceivedFromIPMulticast: number;
    public fragmentsReceivedFromIPMulticast: number;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class NetStreamPlayOptions extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public streamName: string;
    public oldStreamName: string;
    public start: number;
    public len: number;
    public offset: number;
    public transition: string;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class Responder extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(result: ASFunction, status?: ASFunction);
    private _result;
    private _status;
    public ctor(result: ASFunction, status: ASFunction): void;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class SharedObject extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static _sharedObjects: any;
    private _path;
    public connect: (myConnection: NetConnection, params?: string) => void;
    public close: () => void;
    public flush: (minDiskSpace?: number) => string;
    public size: number;
    public fps: number;
    public send: () => void;
    public clear: () => void;
    public setProperty: (propertyName: string, value?: ASObject) => void;
    private static _defaultObjectEncoding;
    static deleteAll(url: string): number;
    static getDiskUsage(url: string): number;
    static _create(path: string, data: any): SharedObject;
    static getLocal(name: string, localPath?: string, secure?: boolean): SharedObject;
    static getRemote(name: string, remotePath?: string, persistence?: any, secure?: boolean): SharedObject;
    static defaultObjectEncoding : number;
    private _data;
    private _objectEncoding;
    public data : Object;
    public objectEncoding : number;
    public client : ASObject;
    public setDirty(propertyName: string): void;
    public invoke(index: number): any;
    public invokeWithArgsArray(index: number, args: any[]): any;
    private _invoke(index, args);
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class Socket extends events.EventDispatcher implements utils.IDataInput, utils.IDataOutput {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(host?: string, port?: number);
    public timeout: number;
    public connect: (host: string, port: number) => void;
    public close: () => void;
    public bytesAvailable : number;
    public connected : boolean;
    public objectEncoding : number;
    public endian : string;
    public bytesPending : number;
    public readBytes(bytes: utils.ByteArray, offset?: number, length?: number): void;
    public writeBytes(bytes: utils.ByteArray, offset?: number, length?: number): void;
    public writeBoolean(value: boolean): void;
    public writeByte(value: number): void;
    public writeShort(value: number): void;
    public writeInt(value: number): void;
    public writeUnsignedInt(value: number): void;
    public writeFloat(value: number): void;
    public writeDouble(value: number): void;
    public writeMultiByte(value: string, charSet: string): void;
    public writeUTF(value: string): void;
    public writeUTFBytes(value: string): void;
    public readBoolean(): boolean;
    public readByte(): number;
    public readUnsignedByte(): number;
    public readShort(): number;
    public readUnsignedShort(): number;
    public readInt(): number;
    public readUnsignedInt(): number;
    public readFloat(): number;
    public readDouble(): number;
    public readMultiByte(length: number, charSet: string): string;
    public readUTF(): string;
    public readUTFBytes(length: number): string;
    public flush(): void;
    public writeObject(object: any): void;
    public readObject(): any;
    public internalGetSecurityErrorMessage(host: any, port: any): string;
    public internalConnect(host: any, port: any): void;
    public didFailureOccur(): boolean;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class URLLoader extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(request?: URLRequest);
    public data: any;
    public dataFormat: string;
    public bytesLoaded: number;
    public bytesTotal: number;
    public load: (request: URLRequest) => void;
    public close: () => void;
    public _stream: URLStream;
    public _httpResponseEventBound: boolean;
    public complete: () => any;
    public onStreamOpen: (e: events.Event) => any;
    public onStreamComplete: (e: events.Event) => any;
    public onStreamProgress: (e: events.ProgressEvent) => any;
    public onStreamIOError: (e: events.IOErrorEvent) => any;
    public onStreamHTTPStatus: (e: events.HTTPStatusEvent) => any;
    public onStreamHTTPResponseStatus: (e: events.HTTPStatusEvent) => any;
    public onStreamSecurityError: (e: events.SecurityErrorEvent) => any;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class URLRequest extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static bindings: string[];
    constructor(url?: string);
    public _checkPolicyFile: boolean;
    private _url;
    private _data;
    private _method;
    private _contentType;
    private _requestHeaders;
    private _digest;
    public url : string;
    public data : ASObject;
    public method : string;
    public contentType : string;
    public requestHeaders : any[];
    public digest : string;
    public _toFileRequest(): any;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class URLRequestHeader extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(name?: string, value?: string);
    public name: string;
    public value: string;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class URLStream extends events.EventDispatcher implements flash.utils.IDataInput {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    private _buffer;
    private _writePosition;
    private _session;
    private _connected;
    public connected : boolean;
    public bytesAvailable : number;
    public objectEncoding : number;
    public endian : string;
    public diskCacheEnabled : boolean;
    public position : number;
    public length : number;
    public load(request: URLRequest): void;
    public readBytes(bytes: flash.utils.ByteArray, offset?: number, length?: number): void;
    public readBoolean(): boolean;
    public readByte(): number;
    public readUnsignedByte(): number;
    public readShort(): number;
    public readUnsignedShort(): number;
    public readUnsignedInt(): number;
    public readInt(): number;
    public readFloat(): number;
    public readDouble(): number;
    public readMultiByte(length: number, charSet: string): string;
    public readUTF(): string;
    public readUTFBytes(length: number): string;
    public close(): void;
    public readObject(): any;
    public stop(): void;
  }
}
declare module Shumway.AVM2.AS.flash.net {
  class URLVariables extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(source?: string);
    public decode: (source: string) => void;
    public unescape: (s: string) => string;
    public escape: (s: string) => string;
  }
}
declare module Shumway.AVM2.AS.flash.sensors {
  class Accelerometer extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public isSupported : boolean;
    public muted : boolean;
    public setRequestedUpdateInterval(interval: number): void;
  }
}
declare module Shumway.AVM2.AS.flash.sensors {
  class Geolocation extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public isSupported : boolean;
    public muted : boolean;
    public setRequestedUpdateInterval(interval: number): void;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class ApplicationDomain extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    private _runtimeDomain;
    constructor(parentDomainOrRuntimeDomain?: any);
    static currentDomain : ApplicationDomain;
    static MIN_DOMAIN_MEMORY_LENGTH : number;
    public parentDomain : ApplicationDomain;
    public domainMemory : utils.ByteArray;
    public getDefinition(name: string): Object;
    public hasDefinition(name: string): boolean;
    public getQualifiedDefinitionNames(): ASVector<any>;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class Capabilities extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    private static _hasAccessibility;
    private static _isDebugger;
    private static _language;
    private static _manufacturer;
    private static _os;
    private static _playerType;
    private static _version;
    static isEmbeddedInAcrobat : boolean;
    static hasEmbeddedVideo : boolean;
    static hasAudio : boolean;
    static avHardwareDisable : boolean;
    static hasAccessibility : boolean;
    static hasAudioEncoder : boolean;
    static hasMP3 : boolean;
    static hasPrinting : boolean;
    static hasScreenBroadcast : boolean;
    static hasScreenPlayback : boolean;
    static hasStreamingAudio : boolean;
    static hasStreamingVideo : boolean;
    static hasVideoEncoder : boolean;
    static isDebugger : boolean;
    static localFileReadDisable : boolean;
    static language : string;
    static manufacturer : string;
    static os : string;
    static cpuArchitecture : string;
    static playerType : string;
    static serverString : string;
    static version : string;
    static screenColor : string;
    static pixelAspectRatio : number;
    static screenDPI : number;
    static screenResolutionX : number;
    static screenResolutionY : number;
    static touchscreenType : string;
    static hasIME : boolean;
    static hasTLS : boolean;
    static maxLevelIDC : string;
    static supports32BitProcesses : boolean;
    static supports64BitProcesses : boolean;
    static _internal : number;
    static hasMultiChannelAudio(type: string): boolean;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class FSCommand extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static _fscommand(command: string, args: string): void;
  }
  interface IFSCommandListener {
    executeFSCommand(command: string, args: string): any;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class ImageDecodingPolicy extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static ON_DEMAND: string;
    static ON_LOAD: string;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class LoaderContext extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(checkPolicyFile?: boolean, applicationDomain?: ApplicationDomain, securityDomain?: SecurityDomain);
    public checkPolicyFile: boolean;
    public applicationDomain: ApplicationDomain;
    public securityDomain: SecurityDomain;
    public allowCodeImport: boolean;
    public requestedContentParent: display.DisplayObjectContainer;
    public parameters: ASObject;
    public imageDecodingPolicy: string;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class JPEGLoaderContext extends LoaderContext {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(deblockingFilter?: number, checkPolicyFile?: boolean, applicationDomain?: ApplicationDomain, securityDomain?: SecurityDomain);
    public deblockingFilter: number;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class MessageChannel extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public messageAvailable : boolean;
    public state : string;
    public send(arg: any, queueLimit?: number): void;
    public receive(blockUntilReceived?: boolean): any;
    public close(): void;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class MessageChannelState extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static OPEN: string;
    static CLOSING: string;
    static CLOSED: string;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class Security extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static REMOTE: string;
    static LOCAL_WITH_FILE: string;
    static LOCAL_WITH_NETWORK: string;
    static LOCAL_TRUSTED: string;
    static APPLICATION: string;
    private static _exactSettings;
    private static _sandboxType;
    static exactSettings : boolean;
    static disableAVM1Loading : boolean;
    static sandboxType : string;
    static pageDomain : string;
    static allowDomain(): void;
    static allowInsecureDomain(): void;
    static loadPolicyFile(url: string): void;
    static showSettings(panel?: string): void;
    static duplicateSandboxBridgeInputArguments(toplevel: ASObject, args: any[]): any[];
    static duplicateSandboxBridgeOutputArgument(toplevel: ASObject, arg: any): any;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class SecurityDomain extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public currentDomain : SecurityDomain;
    public domainID : string;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class SecurityPanel extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static DEFAULT: string;
    static PRIVACY: string;
    static LOCAL_STORAGE: string;
    static MICROPHONE: string;
    static CAMERA: string;
    static DISPLAY: string;
    static SETTINGS_MANAGER: string;
  }
}
declare module Shumway.AVM2.AS.flash.system {
  class TouchscreenType extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static FINGER: string;
    static STYLUS: string;
    static NONE: string;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class AntiAliasType extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static NORMAL: string;
    static ADVANCED: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class FontStyle extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static REGULAR: string;
    static BOLD: string;
    static ITALIC: string;
    static BOLD_ITALIC: string;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class FontType extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static EMBEDDED: string;
    static EMBEDDED_CFF: string;
    static DEVICE: string;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class Font extends ASNative implements Remoting.IRemotable {
    private static _fonts;
    private static _fontsBySymbolId;
    private static _fontsByName;
    static DEVICE_FONT_METRICS_WIN: Object;
    static DEVICE_FONT_METRICS_LINUX: Object;
    static DEVICE_FONT_METRICS_MAC: Object;
    static classInitializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static initializer: any;
    private static _deviceFontMetrics;
    private static _getFontMetrics(name);
    static resolveFontName(name: string): string;
    constructor();
    static getBySymbolId(id: number): Font;
    static getByName(name: string): Font;
    static getDefaultFont(): Font;
    private _fontName;
    private _fontStyle;
    private _fontType;
    public _id: number;
    public _symbol: Timeline.FontSymbol;
    public ascent: number;
    public descent: number;
    public leading: number;
    public advances: number[];
    static enumerateFonts(enumerateDeviceFonts?: boolean): any[];
    static registerFont(font: ASClass): void;
    public fontName : string;
    public fontStyle : string;
    public fontType : string;
    public hasGlyphs(str: string): boolean;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class GridFitType extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbolså: string[];
    constructor();
    static NONE: string;
    static PIXEL: string;
    static SUBPIXEL: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class StaticText extends display.DisplayObject {
    static classInitializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static initializer: any;
    constructor();
    public _canHaveTextContent(): boolean;
    public _getTextContent(): TextContent;
    public _textContent: TextContent;
    public text : string;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class StyleSheet extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public _styles: ASObject;
    public styleNames: any[];
    public getStyle: (styleName: string) => ASObject;
    public setStyle: (styleName: string, styleObject: ASObject) => void;
    public clear: () => void;
    public transform: (formatObject: ASObject) => TextFormat;
    public parseCSS: (CSSText: string) => void;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextDisplayMode extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbolså: string[];
    constructor();
    static LCD: string;
    static CRT: string;
    static DEFAULT: string;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextField extends display.InteractiveObject {
    static classSymbols: string[];
    static instanceSymbols: string[];
    static classInitializer: any;
    static initializer: any;
    constructor();
    public _setFillAndLineBoundsFromSymbol(symbol: Timeline.DisplaySymbol): void;
    public _setFillAndLineBoundsFromWidthAndHeight(width: number, height: number): void;
    public _canHaveTextContent(): boolean;
    public _getTextContent(): TextContent;
    public _getContentBounds(includeStrokes?: boolean): Bounds;
    private _invalidateContent();
    public _textContent: TextContent;
    public _lineMetricsData: ArrayUtilities.DataBuffer;
    static isFontCompatible(fontName: string, fontStyle: string): boolean;
    public _alwaysShowSelection: boolean;
    public _antiAliasType: string;
    public _autoSize: string;
    public _background: boolean;
    public _backgroundColor: number;
    public _border: boolean;
    public _borderColor: number;
    public _bottomScrollV: number;
    public _caretIndex: number;
    public _condenseWhite: boolean;
    public _embedFonts: boolean;
    public _gridFitType: string;
    public _htmlText: string;
    public _length: number;
    public _textInteractionMode: string;
    public _maxChars: number;
    public _maxScrollH: number;
    public _maxScrollV: number;
    public _mouseWheelEnabled: boolean;
    public _multiline: boolean;
    public _numLines: number;
    public _displayAsPassword: boolean;
    public _restrict: string;
    public _scrollH: number;
    public _scrollV: number;
    public _selectable: boolean;
    public _selectedText: string;
    public _selectionBeginIndex: number;
    public _selectionEndIndex: number;
    public _sharpness: number;
    public _styleSheet: StyleSheet;
    public _textColor: number;
    public _textHeight: number;
    public _textWidth: number;
    public _thickness: number;
    public _type: string;
    public _wordWrap: boolean;
    public _useRichTextClipboard: boolean;
    public alwaysShowSelection : boolean;
    public antiAliasType : string;
    public autoSize : string;
    public background : boolean;
    public backgroundColor : number;
    public border : boolean;
    public borderColor : number;
    public bottomScrollV : number;
    public caretIndex : number;
    public condenseWhite : boolean;
    public defaultTextFormat : TextFormat;
    public embedFonts : boolean;
    public gridFitType : string;
    public htmlText : string;
    public length : number;
    public textInteractionMode : string;
    public maxChars : number;
    public maxScrollH : number;
    public maxScrollV : number;
    public mouseWheelEnabled : boolean;
    public multiline : boolean;
    public numLines : number;
    public displayAsPassword : boolean;
    public restrict : string;
    public scrollH : number;
    public scrollV : number;
    public selectable : boolean;
    public selectionBeginIndex : number;
    public selectionEndIndex : number;
    public sharpness : number;
    public styleSheet : StyleSheet;
    public text : string;
    public textColor : number;
    public textHeight : number;
    public textWidth : number;
    public thickness : number;
    public type : string;
    public wordWrap : boolean;
    public useRichTextClipboard : boolean;
    private _ensureLineMetrics();
    public getCharBoundaries(charIndex: number): geom.Rectangle;
    public getCharIndexAtPoint(x: number, y: number): number;
    public getFirstCharInParagraph(charIndex: number): number;
    public getLineIndexAtPoint(x: number, y: number): number;
    public getLineIndexOfChar(charIndex: number): number;
    public getLineLength(lineIndex: number): number;
    public getLineMetrics(lineIndex: number): TextLineMetrics;
    public getLineOffset(lineIndex: number): number;
    public getLineText(lineIndex: number): string;
    public getParagraphLength(charIndex: number): number;
    public getTextFormat(beginIndex?: number, endIndex?: number): TextFormat;
    public getTextRuns(beginIndex?: number, endIndex?: number): any[];
    public getRawText(): string;
    public replaceSelectedText(value: string): void;
    public replaceText(beginIndex: number, endIndex: number, newText: string): void;
    public setSelection(beginIndex: number, endIndex: number): void;
    public setTextFormat(format: TextFormat, beginIndex?: number, endIndex?: number): void;
    public getImageReference(id: string): display.DisplayObject;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextFieldAutoSize extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static NONE: string;
    static LEFT: string;
    static CENTER: string;
    static RIGHT: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextFieldType extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static INPUT: string;
    static DYNAMIC: string;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextFormat extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(font?: string, size?: Object, color?: Object, bold?: Object, italic?: Object, underline?: Object, url?: string, target?: string, align?: string, leftMargin?: Object, rightMargin?: Object, indent?: Object, leading?: Object);
    private static measureTextField;
    private _align;
    private _blockIndent;
    private _bold;
    private _bullet;
    private _color;
    private _display;
    private _font;
    private _indent;
    private _italic;
    private _kerning;
    private _leading;
    private _leftMargin;
    private _letterSpacing;
    private _rightMargin;
    private _size;
    private _tabStops;
    private _target;
    private _underline;
    private _url;
    public as2GetTextExtent(text: string, width: number): any;
    public align : string;
    public blockIndent : Object;
    public bold : Object;
    public bullet : Object;
    public color : Object;
    public display : string;
    public font : string;
    public indent : Object;
    public italic : Object;
    public kerning : Object;
    public leading : Object;
    public leftMargin : Object;
    public letterSpacing : Object;
    public rightMargin : Object;
    public size : Object;
    public tabStops : any[];
    public target : string;
    public underline : Object;
    public url : string;
    private static coerceNumber(value);
    private static coerceBoolean(value);
    public clone(): TextFormat;
    public equals(other: TextFormat): boolean;
    public merge(other: TextFormat): void;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextFormatAlign extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static LEFT: string;
    static CENTER: string;
    static RIGHT: string;
    static JUSTIFY: string;
    static START: string;
    static END: string;
    static fromNumber(n: number): string;
    static toNumber(value: string): number;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextFormatDisplay extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static INLINE: string;
    static BLOCK: string;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextInteractionMode extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static NORMAL: string;
    static SELECTION: string;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextLineMetrics extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbolså: string[];
    constructor(x: number, width: number, height: number, ascent: number, descent: number, leading: number);
    public x: number;
    public width: number;
    public height: number;
    public ascent: number;
    public descent: number;
    public leading: number;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextRun extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(beginIndex: number, endIndex: number, textFormat: TextFormat);
    public _beginIndex: number;
    public _endIndex: number;
    public _textFormat: TextFormat;
    public beginIndex : number;
    public endIndex : number;
    public textFormat : TextFormat;
    public clone(): TextRun;
  }
}
declare module Shumway.AVM2.AS.flash.text {
  class TextSnapshot extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public charCount : number;
    public findText(beginIndex: number, textToFind: string, caseSensitive: boolean): number;
    public getSelected(beginIndex: number, endIndex: number): boolean;
    public getSelectedText(includeLineEndings?: boolean): string;
    public getText(beginIndex: number, endIndex: number, includeLineEndings?: boolean): string;
    public getTextRunInfo(beginIndex: number, endIndex: number): any[];
    public hitTestTextNearPos(x: number, y: number, maxDistance?: number): number;
    public setSelectColor(hexColor?: number): void;
    public setSelected(beginIndex: number, endIndex: number, select: boolean): void;
  }
}
declare module Shumway.AVM2.AS.flash.trace {
  class Trace extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static OFF: number;
    static METHODS: number;
    static METHODS_WITH_ARGS: number;
    static METHODS_AND_LINES: number;
    static METHODS_AND_LINES_WITH_ARGS: number;
    static FILE: any;
    static LISTENER: any;
    static setLevel(l: number, target?: number): any;
    static getLevel(target?: number): number;
    static setListener(f: ASFunction): any;
    static getListener(): ASFunction;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class ContextMenu extends display.NativeMenu {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static isSupported: boolean;
    public hideBuiltInItems: () => void;
    public clone: () => ContextMenu;
    public _builtInItems: ContextMenuBuiltInItems;
    public _customItems: any[];
    public builtInItems : ContextMenuBuiltInItems;
    public customItems : any[];
    public link : net.URLRequest;
    public clipboardMenu : boolean;
    public clipboardItems : ContextMenuClipboardItems;
    public cloneLinkAndClipboardProperties(c: ContextMenu): void;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class ContextMenuBuiltInItems extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public _save: boolean;
    public _zoom: boolean;
    public _quality: boolean;
    public _play: boolean;
    public _loop: boolean;
    public _rewind: boolean;
    public _forwardAndBack: boolean;
    public _print: boolean;
    public save: boolean;
    public zoom: boolean;
    public quality: boolean;
    public play: boolean;
    public loop: boolean;
    public rewind: boolean;
    public forwardAndBack: boolean;
    public print: boolean;
    public clone: () => ContextMenuBuiltInItems;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class ContextMenuClipboardItems extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public cut: boolean;
    public copy: boolean;
    public paste: boolean;
    public clear: boolean;
    public selectAll: boolean;
    public clone: () => ContextMenuClipboardItems;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class ContextMenuItem extends display.NativeMenuItem {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(caption: string, separatorBefore?: boolean, enabled?: boolean, visible?: boolean);
    public clone: () => ContextMenuItem;
    public _caption: string;
    public _separatorBefore: boolean;
    public _visible: boolean;
    public _enabled: boolean;
    public caption : string;
    public separatorBefore : boolean;
    public visible : boolean;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class GameInput extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public numDevices : number;
    public isSupported : boolean;
    static getDeviceAt(index: number): GameInputDevice;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class GameInputControl extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public numValues : number;
    public index : number;
    public relative : boolean;
    public type : string;
    public hand : string;
    public finger : string;
    public device : GameInputDevice;
    public getValueAt(index?: number): number;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class GameInputControlType extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static MOVEMENT: string;
    static ROTATION: string;
    static DIRECTION: string;
    static ACCELERATION: string;
    static BUTTON: string;
    static TRIGGER: string;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class GameInputDevice extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static MAX_BUFFER_SIZE: number;
    public numControls : number;
    public sampleInterval : number;
    public enabled : boolean;
    public id : string;
    public name : string;
    public getControlAt(i: number): GameInputControl;
    public startCachingSamples(numSamples: number, controls: ASVector<any>): void;
    public stopCachingSamples(): void;
    public getCachedSamples(data: utils.ByteArray, append?: boolean): number;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class GameInputFinger extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static THUMB: string;
    static INDEX: string;
    static MIDDLE: string;
    static UNKNOWN: string;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class GameInputHand extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static RIGHT: string;
    static LEFT: string;
    static UNKNOWN: string;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class KeyboardEventDispatcher {
    private _lastKeyCode;
    private _captureKeyPress;
    private _charCodeMap;
    public target: events.EventDispatcher;
    public dispatchKeyboardEvent(event: KeyboardEventData): void;
  }
  interface KeyboardEventData {
    type: string;
    keyCode: number;
    charCode: number;
    location: number;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
  }
  class Keyboard extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static KEYNAME_UPARROW: string;
    static KEYNAME_DOWNARROW: string;
    static KEYNAME_LEFTARROW: string;
    static KEYNAME_RIGHTARROW: string;
    static KEYNAME_F1: string;
    static KEYNAME_F2: string;
    static KEYNAME_F3: string;
    static KEYNAME_F4: string;
    static KEYNAME_F5: string;
    static KEYNAME_F6: string;
    static KEYNAME_F7: string;
    static KEYNAME_F8: string;
    static KEYNAME_F9: string;
    static KEYNAME_F10: string;
    static KEYNAME_F11: string;
    static KEYNAME_F12: string;
    static KEYNAME_F13: string;
    static KEYNAME_F14: string;
    static KEYNAME_F15: string;
    static KEYNAME_F16: string;
    static KEYNAME_F17: string;
    static KEYNAME_F18: string;
    static KEYNAME_F19: string;
    static KEYNAME_F20: string;
    static KEYNAME_F21: string;
    static KEYNAME_F22: string;
    static KEYNAME_F23: string;
    static KEYNAME_F24: string;
    static KEYNAME_F25: string;
    static KEYNAME_F26: string;
    static KEYNAME_F27: string;
    static KEYNAME_F28: string;
    static KEYNAME_F29: string;
    static KEYNAME_F30: string;
    static KEYNAME_F31: string;
    static KEYNAME_F32: string;
    static KEYNAME_F33: string;
    static KEYNAME_F34: string;
    static KEYNAME_F35: string;
    static KEYNAME_INSERT: string;
    static KEYNAME_DELETE: string;
    static KEYNAME_HOME: string;
    static KEYNAME_BEGIN: string;
    static KEYNAME_END: string;
    static KEYNAME_PAGEUP: string;
    static KEYNAME_PAGEDOWN: string;
    static KEYNAME_PRINTSCREEN: string;
    static KEYNAME_SCROLLLOCK: string;
    static KEYNAME_PAUSE: string;
    static KEYNAME_SYSREQ: string;
    static KEYNAME_BREAK: string;
    static KEYNAME_RESET: string;
    static KEYNAME_STOP: string;
    static KEYNAME_MENU: string;
    static KEYNAME_USER: string;
    static KEYNAME_SYSTEM: string;
    static KEYNAME_PRINT: string;
    static KEYNAME_CLEARLINE: string;
    static KEYNAME_CLEARDISPLAY: string;
    static KEYNAME_INSERTLINE: string;
    static KEYNAME_DELETELINE: string;
    static KEYNAME_INSERTCHAR: string;
    static KEYNAME_DELETECHAR: string;
    static KEYNAME_PREV: string;
    static KEYNAME_NEXT: string;
    static KEYNAME_SELECT: string;
    static KEYNAME_EXECUTE: string;
    static KEYNAME_UNDO: string;
    static KEYNAME_REDO: string;
    static KEYNAME_FIND: string;
    static KEYNAME_HELP: string;
    static KEYNAME_MODESWITCH: string;
    static STRING_UPARROW: string;
    static STRING_DOWNARROW: string;
    static STRING_LEFTARROW: string;
    static STRING_RIGHTARROW: string;
    static STRING_F1: string;
    static STRING_F2: string;
    static STRING_F3: string;
    static STRING_F4: string;
    static STRING_F5: string;
    static STRING_F6: string;
    static STRING_F7: string;
    static STRING_F8: string;
    static STRING_F9: string;
    static STRING_F10: string;
    static STRING_F11: string;
    static STRING_F12: string;
    static STRING_F13: string;
    static STRING_F14: string;
    static STRING_F15: string;
    static STRING_F16: string;
    static STRING_F17: string;
    static STRING_F18: string;
    static STRING_F19: string;
    static STRING_F20: string;
    static STRING_F21: string;
    static STRING_F22: string;
    static STRING_F23: string;
    static STRING_F24: string;
    static STRING_F25: string;
    static STRING_F26: string;
    static STRING_F27: string;
    static STRING_F28: string;
    static STRING_F29: string;
    static STRING_F30: string;
    static STRING_F31: string;
    static STRING_F32: string;
    static STRING_F33: string;
    static STRING_F34: string;
    static STRING_F35: string;
    static STRING_INSERT: string;
    static STRING_DELETE: string;
    static STRING_HOME: string;
    static STRING_BEGIN: string;
    static STRING_END: string;
    static STRING_PAGEUP: string;
    static STRING_PAGEDOWN: string;
    static STRING_PRINTSCREEN: string;
    static STRING_SCROLLLOCK: string;
    static STRING_PAUSE: string;
    static STRING_SYSREQ: string;
    static STRING_BREAK: string;
    static STRING_RESET: string;
    static STRING_STOP: string;
    static STRING_MENU: string;
    static STRING_USER: string;
    static STRING_SYSTEM: string;
    static STRING_PRINT: string;
    static STRING_CLEARLINE: string;
    static STRING_CLEARDISPLAY: string;
    static STRING_INSERTLINE: string;
    static STRING_DELETELINE: string;
    static STRING_INSERTCHAR: string;
    static STRING_DELETECHAR: string;
    static STRING_PREV: string;
    static STRING_NEXT: string;
    static STRING_SELECT: string;
    static STRING_EXECUTE: string;
    static STRING_UNDO: string;
    static STRING_REDO: string;
    static STRING_FIND: string;
    static STRING_HELP: string;
    static STRING_MODESWITCH: string;
    static CharCodeStrings: any[];
    static NUMBER_0: number;
    static NUMBER_1: number;
    static NUMBER_2: number;
    static NUMBER_3: number;
    static NUMBER_4: number;
    static NUMBER_5: number;
    static NUMBER_6: number;
    static NUMBER_7: number;
    static NUMBER_8: number;
    static NUMBER_9: number;
    static A: number;
    static B: number;
    static C: number;
    static D: number;
    static E: number;
    static F: number;
    static G: number;
    static H: number;
    static I: number;
    static J: number;
    static K: number;
    static L: number;
    static M: number;
    static N: number;
    static O: number;
    static P: number;
    static Q: number;
    static R: number;
    static S: number;
    static T: number;
    static U: number;
    static V: number;
    static W: number;
    static X: number;
    static Y: number;
    static Z: number;
    static SEMICOLON: number;
    static EQUAL: number;
    static COMMA: number;
    static MINUS: number;
    static PERIOD: number;
    static SLASH: number;
    static BACKQUOTE: number;
    static LEFTBRACKET: number;
    static BACKSLASH: number;
    static RIGHTBRACKET: number;
    static QUOTE: number;
    static ALTERNATE: number;
    static BACKSPACE: number;
    static CAPS_LOCK: number;
    static COMMAND: number;
    static CONTROL: number;
    static DELETE: number;
    static DOWN: number;
    static END: number;
    static ENTER: number;
    static ESCAPE: number;
    static F1: number;
    static F2: number;
    static F3: number;
    static F4: number;
    static F5: number;
    static F6: number;
    static F7: number;
    static F8: number;
    static F9: number;
    static F10: number;
    static F11: number;
    static F12: number;
    static F13: number;
    static F14: number;
    static F15: number;
    static HOME: number;
    static INSERT: number;
    static LEFT: number;
    static NUMPAD: number;
    static NUMPAD_0: number;
    static NUMPAD_1: number;
    static NUMPAD_2: number;
    static NUMPAD_3: number;
    static NUMPAD_4: number;
    static NUMPAD_5: number;
    static NUMPAD_6: number;
    static NUMPAD_7: number;
    static NUMPAD_8: number;
    static NUMPAD_9: number;
    static NUMPAD_ADD: number;
    static NUMPAD_DECIMAL: number;
    static NUMPAD_DIVIDE: number;
    static NUMPAD_ENTER: number;
    static NUMPAD_MULTIPLY: number;
    static NUMPAD_SUBTRACT: number;
    static PAGE_DOWN: number;
    static PAGE_UP: number;
    static RIGHT: number;
    static SHIFT: number;
    static SPACE: number;
    static TAB: number;
    static UP: number;
    static RED: number;
    static GREEN: number;
    static YELLOW: number;
    static BLUE: number;
    static CHANNEL_UP: number;
    static CHANNEL_DOWN: number;
    static RECORD: number;
    static PLAY: number;
    static PAUSE: number;
    static STOP: number;
    static FAST_FORWARD: number;
    static REWIND: number;
    static SKIP_FORWARD: number;
    static SKIP_BACKWARD: number;
    static NEXT: number;
    static PREVIOUS: number;
    static LIVE: number;
    static LAST: number;
    static MENU: number;
    static INFO: number;
    static GUIDE: number;
    static EXIT: number;
    static BACK: number;
    static AUDIO: number;
    static SUBTITLE: number;
    static DVR: number;
    static VOD: number;
    static INPUT: number;
    static SETUP: number;
    static HELP: number;
    static MASTER_SHELL: number;
    static SEARCH: number;
    public capsLock : boolean;
    public numLock : boolean;
    public hasVirtualKeyboard : boolean;
    public physicalKeyboardType : string;
    static isAccessible(): boolean;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class MouseEventDispatcher {
    public stage: display.Stage;
    public currentTarget: display.InteractiveObject;
    private _findTarget(point);
    private _dispatchMouseEvent(target, type, data, relatedObject?);
    public handleMouseEvent(data: MouseEventAndPointData): display.InteractiveObject;
  }
  enum MouseButtonFlags {
    Left = 1,
    Middle = 2,
    Right = 4,
  }
  interface MouseEventAndPointData {
    type: string;
    point: geom.Point;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    buttons: MouseButtonFlags;
  }
  class Mouse extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public supportsCursor : boolean;
    public cursor : string;
    public supportsNativeCursor : boolean;
    static hide(): void;
    static show(): void;
    static registerCursor(name: string, cursor: MouseCursorData): void;
    static unregisterCursor(name: string): void;
    static _currentPosition: geom.Point;
    static updateCurrentPosition(value: geom.Point): void;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class MouseCursorData extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public data : ASVector<any>;
    public hotSpot : geom.Point;
    public frameRate : number;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class Multitouch extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public inputMode : string;
    public supportsTouchEvents : boolean;
    public supportsGestureEvents : boolean;
    public supportedGestures : ASVector<any>;
    public maxTouchPoints : number;
    public mapTouchToMouse : boolean;
  }
}
declare module Shumway.AVM2.AS.flash.ui {
  class MultitouchInputMode extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static NONE: string;
    static GESTURE: string;
    static TOUCH_POINT: string;
  }
}
declare module Shumway.AVM2.AS.flash.utils {
  class Endian extends ASNative {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    static BIG_ENDIAN: string;
    static LITTLE_ENDIAN: string;
  }
}
declare module Shumway.AVM2.AS.flash.utils {
  interface IDataInput2 extends IDataInput {
  }
}
declare module Shumway.AVM2.AS.flash.utils {
  interface IDataOutput2 extends IDataOutput {
  }
}
declare module Shumway.AVM2.AS.flash.utils {
  interface IExternalizable {
    writeExternal: (output: IDataOutput) => void;
    readExternal: (input: IDataInput) => void;
  }
}
declare module Shumway.AVM2.AS.flash.utils {
  class ObjectInput extends ASNative implements IDataInput {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public bytesAvailable : number;
    public objectEncoding : number;
    public endian : string;
    public readBytes(bytes: ByteArray, offset?: number, length?: number): void;
    public readBoolean(): boolean;
    public readByte(): number;
    public readUnsignedByte(): number;
    public readShort(): number;
    public readUnsignedShort(): number;
    public readInt(): number;
    public readUnsignedInt(): number;
    public readFloat(): number;
    public readDouble(): number;
    public readMultiByte(length: number, charSet: string): string;
    public readUTF(): string;
    public readUTFBytes(length: number): string;
    public readObject(): any;
  }
}
declare module Shumway.AVM2.AS.flash.utils {
  class ObjectOutput extends ASNative implements IDataOutput {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor();
    public objectEncoding : number;
    public endian : string;
    public writeBytes(bytes: ByteArray, offset?: number, length?: number): void;
    public writeBoolean(value: boolean): void;
    public writeByte(value: number): void;
    public writeShort(value: number): void;
    public writeInt(value: number): void;
    public writeUnsignedInt(value: number): void;
    public writeFloat(value: number): void;
    public writeDouble(value: number): void;
    public writeMultiByte(value: string, charSet: string): void;
    public writeUTF(value: string): void;
    public writeUTFBytes(value: string): void;
    public writeObject(object: any): void;
  }
}
declare module Shumway.AVM2.AS.flash.utils {
  class Timer extends events.EventDispatcher {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    static dispatchingEnabled: boolean;
    constructor(delay: number, repeatCount?: number);
    public _delay: number;
    public _repeatCount: number;
    public _iteration: number;
    public _running: boolean;
    public reset: () => void;
    public start: () => void;
    public tick: () => void;
    public _interval: number;
    public running : boolean;
    public stop(): void;
    public _start(delay: number, closure: ASFunction): void;
    public _tick(): void;
  }
}
declare module Shumway.AVM2.AS.flash.utils {
  class SetIntervalTimer extends Timer {
    static classInitializer: any;
    static initializer: any;
    static classSymbols: string[];
    static instanceSymbols: string[];
    constructor(closure: ASFunction, delay: number, repeats: boolean, rest: any[]);
    static intervalArray: any[];
    static _clearInterval: (id: number) => void;
    public reference: number;
    public closure: ASFunction;
    public rest: any[];
    public onTimer: (event: events.Event) => void;
  }
}
declare module Shumway.AVM2.AS.flash.xml {
  class XMLNode extends ASNative {
    static initializer: any;
    constructor(type: number, value: string);
    static escapeXML(value: string): string;
    public nodeType: number;
    public previousSibling: XMLNode;
    public nextSibling: XMLNode;
    public parentNode: XMLNode;
    public firstChild: XMLNode;
    public lastChild: XMLNode;
    public childNodes: any[];
    public _childNodes: any[];
    public attributes: ASObject;
    public _attributes: ASObject;
    public nodeName: string;
    public nodeValue: string;
    public init: (type: number, value: string) => void;
    public hasChildNodes: () => boolean;
    public cloneNode: (deep: boolean) => XMLNode;
    public removeNode: () => void;
    public insertBefore: (node: XMLNode, before: XMLNode) => void;
    public appendChild: (node: XMLNode) => void;
    public getNamespaceForPrefix: (prefix: string) => string;
    public getPrefixForNamespace: (ns: string) => string;
    public localName: string;
    public prefix: string;
    public namespaceURI: string;
  }
}
declare module Shumway.AVM2.AS.flash.xml {
  class XMLDocument extends XMLNode {
    static initializer: any;
    constructor(source?: string);
    public xmlDecl: ASObject;
    public docTypeDecl: ASObject;
    public idMap: ASObject;
    public ignoreWhite: boolean;
    public createElement: (name: string) => XMLNode;
    public createTextNode: (text: string) => XMLNode;
    public parseXML: (source: string) => void;
  }
}
declare module Shumway.AVM2.AS.flash.xml {
  class XMLNodeType extends ASNative {
    static initializer: any;
    constructor();
  }
}
declare module Shumway.AVM2.AS.flash.xml {
  class XMLParser extends ASNative {
    static initializer: any;
    constructor();
    public startParse(source: string, ignoreWhite: boolean): void;
    public getNext(tag: XMLTag): number;
  }
}
declare module Shumway.AVM2.AS.flash.xml {
  class XMLTag extends ASNative {
    static initializer: any;
    constructor();
    public type : number;
    public empty : boolean;
    public value : string;
    public attrs : ASObject;
  }
}
declare module Shumway.Timeline {
  class Symbol {
    public id: number;
    public isAS2Object: boolean;
    public symbolClass: AVM2.AS.ASClass;
    constructor(id: number, symbolClass: AVM2.AS.ASClass);
  }
  class DisplaySymbol extends Symbol {
    public fillBounds: Bounds;
    public lineBounds: Bounds;
    public scale9Grid: Bounds;
    public dynamic: boolean;
    constructor(id: number, symbolClass: AVM2.AS.ASClass, dynamic?: boolean);
    public _setBoundsFromData(data: any): void;
  }
  class ShapeSymbol extends DisplaySymbol {
    public graphics: AVM2.AS.flash.display.Graphics;
    constructor(id: number, symbolClass?: AVM2.AS.ASClass);
    static FromData(data: any, loaderInfo: AVM2.AS.flash.display.LoaderInfo): ShapeSymbol;
    public processRequires(dependencies: any[], loaderInfo: AVM2.AS.flash.display.LoaderInfo): void;
  }
  class MorphShapeSymbol extends ShapeSymbol {
    public morphFillBounds: Bounds;
    public morphLineBounds: Bounds;
    constructor(id: number);
    static FromData(data: any, loaderInfo: AVM2.AS.flash.display.LoaderInfo): MorphShapeSymbol;
  }
  class BitmapSymbol extends DisplaySymbol {
    public width: number;
    public height: number;
    public data: Uint8Array;
    public type: ImageType;
    constructor(id: number);
    static FromData(data: any): BitmapSymbol;
  }
  class TextSymbol extends DisplaySymbol {
    public color: number;
    public size: number;
    public font: string;
    public fontClass: AVM2.AS.flash.text.Font;
    public align: string;
    public leftMargin: number;
    public rightMargin: number;
    public indent: number;
    public leading: number;
    public multiline: boolean;
    public wordWrap: boolean;
    public embedFonts: boolean;
    public selectable: boolean;
    public border: boolean;
    public initialText: string;
    public html: boolean;
    public displayAsPassword: boolean;
    public type: string;
    public maxChars: number;
    public autoSize: string;
    public variableName: string;
    public textContent: TextContent;
    constructor(id: number);
    static FromTextData(data: any): TextSymbol;
  }
  class ButtonSymbol extends DisplaySymbol {
    public upState: AnimationState;
    public overState: AnimationState;
    public downState: AnimationState;
    public hitTestState: AnimationState;
    public buttonActions: any[];
    constructor(id: number);
    static FromData(data: any, loaderInfo: AVM2.AS.flash.display.LoaderInfo): ButtonSymbol;
  }
  class SpriteSymbol extends DisplaySymbol {
    public numFrames: number;
    public frames: FrameDelta[];
    public labels: AVM2.AS.flash.display.FrameLabel[];
    public frameScripts: any[];
    public isRoot: boolean;
    public initActionBlock: {
      actionsData: Uint8Array;
    }[];
    constructor(id: number, isRoot?: boolean);
    static FromData(data: any, loaderInfo: AVM2.AS.flash.display.LoaderInfo): SpriteSymbol;
  }
  class FontSymbol extends Symbol {
    public name: string;
    public bold: boolean;
    public italic: boolean;
    public data: Uint8Array;
    public metrics: any;
    constructor(id: number);
    static FromData(data: any): FontSymbol;
  }
  class SoundSymbol extends Symbol {
    public channels: number;
    public sampleRate: number;
    public pcm: Float32Array;
    public packaged: any;
    constructor(id: number);
    static FromData(data: any): SoundSymbol;
  }
  class BinarySymbol extends Symbol {
    public buffer: Uint8Array;
    public byteLength: number;
    constructor(id: number);
    static FromData(data: any): BinarySymbol;
  }
  class AnimationState {
    public symbol: DisplaySymbol;
    public depth: number;
    public matrix: AVM2.AS.flash.geom.Matrix;
    public colorTransform: AVM2.AS.flash.geom.ColorTransform;
    public ratio: number;
    public name: string;
    public clipDepth: number;
    public filters: any[];
    public blendMode: string;
    public cacheAsBitmap: boolean;
    public visible: boolean;
    public events: any[];
    public variableName: string;
    constructor(symbol?: DisplaySymbol, depth?: number, matrix?: AVM2.AS.flash.geom.Matrix, colorTransform?: AVM2.AS.flash.geom.ColorTransform, ratio?: number, name?: string, clipDepth?: number, filters?: any[], blendMode?: string, cacheAsBitmap?: boolean, visible?: boolean, events?: any[], variableName?: string);
    public canBeAnimated(obj: AVM2.AS.flash.display.DisplayObject): boolean;
  }
  class FrameDelta {
    private loaderInfo;
    private commands;
    public _stateAtDepth: Map<AnimationState>;
    public stateAtDepth : Map<AnimationState>;
    constructor(loaderInfo: AVM2.AS.flash.display.LoaderInfo, commands: any[]);
    private _initialize();
  }
}
declare module Shumway.AVM2.AS {
  function linkNatives(runtime: Runtime.AVM2): void;
}
