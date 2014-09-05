/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
/// <reference path="swf.d.ts" />
/// <reference path="flash.d.ts" />
/// <reference path="../../src/flash/avm1.d.ts" />
declare module Shumway.Player {
  var timelineBuffer: Tools.Profiler.TimelineBuffer;
  var counter: Metrics.Counter;
  var writer: any;
  function enterTimeline(name: string, data?: any): void;
  function leaveTimeline(name: string, data?: any): void;
}
declare module Shumway {
  var playerOptions: any;
  var frameEnabledOption: any;
  var timerEnabledOption: any;
  var pumpEnabledOption: any;
  var pumpRateOption: any;
  var frameRateOption: any;
  var tracePlayerOption: any;
  var traceMouseEventOption: any;
  var frameRateMultiplierOption: any;
  var dontSkipFramesOption: any;
  var playAllSymbolsOption: any;
  var playSymbolOption: any;
  var playSymbolFrameDurationOption: any;
  var playSymbolCountOption: any;
  var stageScaleOption: any;
  var useParsingWorkerOption: any;
}
declare module Shumway {
  class FrameScheduler {
    private static STATS_TO_REMEMBER;
    private static MAX_DRAWS_TO_SKIP;
    private static INTERVAL_PADDING_MS;
    private static SPEED_ADJUST_RATE;
    private _drawStats;
    private _drawStatsSum;
    private _drawStarted;
    private _drawsSkipped;
    private _expectedNextFrameAt;
    private _onTime;
    private _trackDelta;
    private _delta;
    private _onTimeDelta;
    constructor();
    public shallSkipDraw : boolean;
    public nextFrameIn : number;
    public isOnTime : boolean;
    public startFrame(frameRate: any): void;
    public endFrame(): void;
    public startDraw(): void;
    public endDraw(): void;
    public skipDraw(): void;
    public setDelta(value: any): void;
    public startTrackDelta(): void;
    public endTrackDelta(): void;
  }
}
declare module Shumway.Remoting.Player {
  class PlayerChannelSerializer {
    public output: ArrayUtilities.IDataOutput;
    public outputAssets: any[];
    public phase: RemotingPhase;
    public roots: AVM2.AS.flash.display.DisplayObject[];
    public begin(displayObject: AVM2.AS.flash.display.DisplayObject): void;
    public remoteObjects(): void;
    public remoteReferences(): void;
    public writeDisplayObject(displayObject: AVM2.AS.flash.display.DisplayObject): void;
    public writeStage(stage: AVM2.AS.flash.display.Stage): void;
    public writeGraphics(graphics: AVM2.AS.flash.display.Graphics): void;
    public writeNetStream(netStream: AVM2.AS.flash.net.NetStream): void;
    public writeBitmapData(bitmapData: AVM2.AS.flash.display.BitmapData): void;
    public writeTextContent(textContent: TextContent): void;
    public writeFont(font: AVM2.AS.flash.text.Font): void;
    public writeClip(displayObject: AVM2.AS.flash.display.DisplayObject): void;
    public writeUpdateFrame(displayObject: AVM2.AS.flash.display.DisplayObject): void;
    public writeDrawToBitmap(bitmapData: AVM2.AS.flash.display.BitmapData, source: IRemotable, matrix?: AVM2.AS.flash.geom.Matrix, colorTransform?: AVM2.AS.flash.geom.ColorTransform, blendMode?: string, clipRect?: AVM2.AS.flash.geom.Rectangle, smoothing?: boolean): void;
    public writeMatrix(matrix: AVM2.AS.flash.geom.Matrix): void;
    public writeRectangle(bounds: Bounds): void;
    public writeColorTransform(colorTransform: AVM2.AS.flash.geom.ColorTransform): void;
    public writeRequestBitmapData(bitmapData: AVM2.AS.flash.display.BitmapData): void;
    public pushAsset(asset: any): void;
  }
  enum EventKind {
    Focus = 0,
    Mouse = 1,
    Keyboard = 2,
  }
  interface FocusEventData {
    type: FocusEventType;
  }
  class PlayerChannelDeserializer {
    public input: ArrayUtilities.IDataInput;
    public readEvent(): any;
    private _readFocusEvent();
    private _readMouseEvent();
    private _readKeyboardEvent();
  }
}
declare module Shumway.Player {
  class Player implements Shumway.AVM2.AS.flash.display.IBitmapDataSerializer, Shumway.AVM2.AS.flash.system.IFSCommandListener {
    private _stage;
    private _loader;
    private _loaderInfo;
    private _syncTimeout;
    private _frameTimeout;
    private _eventLoopIsRunning;
    private _rootInitialized;
    private _framesPlayed;
    private _writer;
    private static _syncFrameRate;
    private _mouseEventDispatcher;
    private _keyboardEventDispatcher;
    public externalCallback: (functionName: string, args: any[]) => any;
    private _lastPumpTime;
    private _isPageVisible;
    private _hasFocus;
    constructor();
    public onSendUpdates(updates: ArrayUtilities.DataBuffer, assets: ArrayUtilities.DataBuffer[], async?: boolean): ArrayUtilities.DataBuffer;
    private _shouldThrottleDownRendering();
    private _shouldThrottleDownFrameExecution();
    public load(url: string): void;
    public processEventUpdates(updates: ArrayUtilities.DataBuffer): void;
    private _enterLoops();
    private _pumpDisplayListUpdates();
    public syncDisplayObject(displayObject: Shumway.AVM2.AS.flash.display.DisplayObject, async?: boolean): ArrayUtilities.DataBuffer;
    public requestBitmapData(bitmapData: Shumway.AVM2.AS.flash.display.BitmapData): ArrayUtilities.DataBuffer;
    public registerFont(font: Shumway.AVM2.AS.flash.text.Font): void;
    public drawToBitmap(bitmapData: Shumway.AVM2.AS.flash.display.BitmapData, source: Remoting.IRemotable, matrix?: Shumway.AVM2.AS.flash.geom.Matrix, colorTransform?: Shumway.AVM2.AS.flash.geom.ColorTransform, blendMode?: string, clipRect?: Shumway.AVM2.AS.flash.geom.Rectangle, smoothing?: boolean): void;
    public executeFSCommand(command: string, args: string): void;
    public requestRendering(): void;
    private _pumpUpdates();
    private _leaveSyncLoop();
    private _getFrameInterval();
    private _enterEventLoop();
    private _eventLoopTick();
    private _tracePlayer();
    private _leaveEventLoop();
    private _playAllSymbols();
    public processExternalCallback(request: any): void;
    public onExternalCommand(command: any): void;
    public onFSCommand(command: string, args: string): void;
    public onFrameProcessed(): void;
    public createExternalInterfaceService(): IExternalInterfaceService;
  }
}
declare module Shumway {
  interface LibraryPathInfo {
    abcs: string;
    catalog: string;
  }
  function createAVM2(builtinPath: string, libraryPath: any, avm1Path: string, sysMode: AVM2.Runtime.ExecutionMode, appMode: AVM2.Runtime.ExecutionMode, next: (avm2: AVM2.Runtime.AVM2) => void): void;
}
declare module Shumway.Player.Window {
  class WindowPlayer extends Player {
    private _window;
    private _parent;
    constructor(window: any, parent?: any);
    public onSendUpdates(updates: ArrayUtilities.DataBuffer, assets: ArrayUtilities.DataBuffer[], async?: boolean): ArrayUtilities.DataBuffer;
    public onExternalCommand(command: any): void;
    public onFSCommand(command: string, args: string): void;
    public onFrameProcessed(): void;
    private onWindowMessage(data);
  }
}
declare module Shumway.Player.Test {
  class TestPlayer extends Player {
    private _worker;
    constructor();
    public onSendUpdates(updates: ArrayUtilities.DataBuffer, assets: ArrayUtilities.DataBuffer[], async?: boolean): ArrayUtilities.DataBuffer;
    public onExternalCommand(command: any): void;
    public onFSCommand(command: string, args: string): void;
    public onFrameProcessed(): void;
    private _onWorkerMessage(e);
  }
}
declare module Shumway.Player.Test {
  class FakeSyncWorker {
    static WORKER_PATH: string;
    private static _singelton;
    static instance : FakeSyncWorker;
    private _worker;
    private _onsyncmessageListeners;
    constructor();
    public addEventListener(type: string, listener: any, useCapture?: boolean): void;
    public removeEventListener(type: string, listener: any, useCapture?: boolean): void;
    public postMessage(message: any, ports?: any): void;
    public postSyncMessage(message: any, ports?: any): any;
  }
}
