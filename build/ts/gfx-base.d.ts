/// <reference path="base.d.ts" />
/// <reference path="tools.d.ts" />
interface CanvasRenderingContext2D {
  globalColorMatrix: Shumway.GFX.ColorMatrix;
}
interface CanvasGradient {
  _template: any;
}
declare module Shumway.GFX {
  enum TraceLevel {
    None = 0,
    Brief = 1,
    Verbose = 2,
  }
  var frameCounter: Metrics.Counter;
  var traceLevel: TraceLevel;
  var writer: IndentingWriter;
  function frameCount(name: any): void;
  var timelineBuffer: Tools.Profiler.TimelineBuffer;
  function enterTimeline(name: string, data?: any): void;
  function leaveTimeline(name?: string, data?: any): void;
  class Path {
    private _commands;
    private _commandPosition;
    private _data;
    private _dataPosition;
    private static _arrayBufferPool;
    static _apply(path: Path, context: CanvasRenderingContext2D): void;
    constructor(arg: any);
    private _ensureCommandCapacity(length);
    private _ensureDataCapacity(length);
    private _writeCommand(command);
    private _writeData(a, b, c?, d?, e?, f?);
    public closePath(): void;
    public moveTo(x: number, y: number): void;
    public lineTo(x: number, y: number): void;
    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    public rect(x: number, y: number, width: number, height: number): void;
    public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean): void;
    public addPath(path: Path, transformation?: SVGMatrix): void;
  }
}
declare module Shumway.GFX {
  interface ISurface {
    w: number;
    h: number;
    allocate(w: number, h: number): ISurfaceRegion;
    free(surfaceRegion: ISurfaceRegion): any;
  }
  interface ISurfaceRegion {
    surface: ISurface;
    region: RegionAllocator.Region;
  }
}
declare module Shumway {
  interface ILinkedListNode {
    next: ILinkedListNode;
    previous: ILinkedListNode;
  }
  class LRUList<T extends ILinkedListNode> {
    private _head;
    private _tail;
    private _count;
    public count : number;
    public head : T;
    constructor();
    private _unshift(node);
    private _remove(node);
    public use(node: T): void;
    public pop(): T;
    public visit(callback: (T: any) => boolean, forward?: boolean): void;
  }
}
declare module Shumway.GFX {
  var imageUpdateOption: any;
  var stageOptions: any;
  var forcePaint: any;
  var ignoreViewport: any;
  var viewportLoupeDiameter: any;
  var disableClipping: any;
  var debugClipping: any;
  var backend: any;
  var hud: any;
  var perspectiveCamera: any;
  var perspectiveCameraFOV: any;
  var perspectiveCameraDistance: any;
  var perspectiveCameraAngle: any;
  var perspectiveCameraAngleRotate: any;
  var perspectiveCameraSpacing: any;
  var perspectiveCameraSpacingInflate: any;
  var drawTiles: any;
  var drawSurfaces: any;
  var drawSurface: any;
  var drawElements: any;
  var disableSurfaceUploads: any;
  var premultipliedAlpha: any;
  var unpackPremultiplyAlpha: any;
  var sourceBlendFactor: any;
  var destinationBlendFactor: any;
  var clipDirtyRegions: any;
  var clipCanvas: any;
  var cull: any;
  var compositeMask: any;
  var snapToDevicePixels: any;
  var imageSmoothing: any;
  var blending: any;
  var cacheShapes: any;
  var cacheShapesMaxSize: any;
  var cacheShapesThreshold: any;
}
declare module Shumway.GFX.Geometry {
  function radianToDegrees(r: any): number;
  function degreesToRadian(d: any): number;
  function quadraticBezier(from: number, cp: number, to: number, t: number): number;
  function quadraticBezierExtreme(from: number, cp: number, to: number): number;
  function cubicBezier(from: number, cp: number, cp2: number, to: number, t: any): number;
  function cubicBezierExtremes(from: number, cp: number, cp2: number, to: any): number[];
  class Point {
    public x: number;
    public y: number;
    constructor(x: number, y: number);
    public setElements(x: number, y: number): Point;
    public set(other: Point): Point;
    public dot(other: Point): number;
    public squaredLength(): number;
    public distanceTo(other: Point): number;
    public sub(other: Point): Point;
    public mul(value: number): Point;
    public clone(): Point;
    public toString(): string;
    public inTriangle(a: Point, b: Point, c: Point): boolean;
    static createEmpty(): Point;
    static createEmptyPoints(count: number): Point[];
  }
  class Point3D {
    public x: number;
    public y: number;
    public z: number;
    constructor(x: number, y: number, z: number);
    public setElements(x: number, y: number, z: number): Point3D;
    public set(other: Point3D): Point3D;
    public dot(other: Point3D): number;
    public cross(other: Point3D): Point3D;
    public squaredLength(): number;
    public sub(other: Point3D): Point3D;
    public mul(value: number): Point3D;
    public normalize(): Point3D;
    public clone(): Point3D;
    public toString(): string;
    static createEmpty(): Point3D;
    static createEmptyPoints(count: number): Point3D[];
  }
  class Rectangle {
    public x: number;
    public y: number;
    public w: number;
    public h: number;
    private static _temporary;
    constructor(x: number, y: number, w: number, h: number);
    public setElements(x: number, y: number, w: number, h: number): void;
    public set(other: Rectangle): void;
    public contains(other: Rectangle): boolean;
    public containsPoint(point: Point): boolean;
    public isContained(others: Rectangle[]): boolean;
    public isSmallerThan(other: Rectangle): boolean;
    public isLargerThan(other: Rectangle): boolean;
    public union(other: Rectangle): void;
    public isEmpty(): boolean;
    public setEmpty(): void;
    public intersect(other: Rectangle): Rectangle;
    public intersects(other: Rectangle): boolean;
    public intersectsTransformedAABB(other: Rectangle, matrix: Matrix): boolean;
    public intersectsTranslated(other: Rectangle, tx: number, ty: number): boolean;
    public area(): number;
    public clone(): Rectangle;
    public copyFrom(source: Rectangle): void;
    public snap(): Rectangle;
    public scale(x: number, y: number): Rectangle;
    public offset(x: number, y: number): Rectangle;
    public resize(w: number, h: number): Rectangle;
    public expand(w: number, h: number): Rectangle;
    public getCenter(): Point;
    public getAbsoluteBounds(): Rectangle;
    public toString(): string;
    static createEmpty(): Rectangle;
    static createSquare(size: number): Rectangle;
    static createMaxI16(): Rectangle;
    public getCorners(points: Point[]): void;
  }
  class OBB {
    public axes: Point[];
    public corners: Point[];
    public origins: number[];
    constructor(corners: Point[]);
    public getBounds(): Rectangle;
    static getBounds(points: any): Rectangle;
    public intersects(other: OBB): boolean;
    private intersectsOneWay(other);
  }
  class Matrix {
    public a: number;
    public b: number;
    public c: number;
    public d: number;
    public tx: number;
    public ty: number;
    private static _svg;
    constructor(a: number, b: number, c: number, d: number, tx: number, ty: number);
    public setElements(a: number, b: number, c: number, d: number, tx: number, ty: number): void;
    public set(other: Matrix): void;
    public emptyArea(query: Rectangle): boolean;
    public infiniteArea(query: Rectangle): boolean;
    public isEqual(other: Matrix): boolean;
    public clone(): Matrix;
    public transform(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix;
    public transformRectangle(rectangle: Rectangle, points: Point[]): void;
    public isTranslationOnly(): boolean;
    public transformRectangleAABB(rectangle: Rectangle): void;
    public scale(x: number, y: number): Matrix;
    public scaleClone(x: number, y: number): Matrix;
    public rotate(angle: number): Matrix;
    public concat(other: Matrix): void;
    public preMultiply(other: Matrix): void;
    public translate(x: number, y: number): Matrix;
    public setIdentity(): void;
    public isIdentity(): boolean;
    public transformPoint(point: Point): void;
    public transformPoints(points: Point[]): void;
    public deltaTransformPoint(point: Point): void;
    public inverse(result: Matrix): void;
    public getTranslateX(): number;
    public getTranslateY(): number;
    public getScaleX(): number;
    public getScaleY(): number;
    public getAbsoluteScaleX(): number;
    public getAbsoluteScaleY(): number;
    public getRotation(): number;
    public isScaleOrRotation(): boolean;
    public toString(): string;
    public toWebGLMatrix(): Float32Array;
    public toCSSTransform(): String;
    static createIdentity(): Matrix;
    static multiply: (dst: any, src: any) => void;
    public toSVGMatrix(): SVGMatrix;
    public snap(): boolean;
  }
  class Matrix3D {
    private _m;
    constructor(m: number[]);
    public asWebGLMatrix(): Float32Array;
    static createCameraLookAt(cameraPosition: Point3D, target: Point3D, up: Point3D): Matrix3D;
    static createLookAt(cameraPosition: Point3D, target: Point3D, up: Point3D): Matrix3D;
    public mul(point: Point3D): Point3D;
    static create2DProjection(width: any, height: any, depth: any): Matrix3D;
    static createPerspective(fieldOfViewInRadians: any, aspectRatio: any, near: any, far: any): Matrix3D;
    static createIdentity(): Matrix3D;
    static createTranslation(tx: number, ty: number, tz: number): Matrix3D;
    static createXRotation(angleInRadians: number): Matrix3D;
    static createYRotation(angleInRadians: number): Matrix3D;
    static createZRotation(angleInRadians: number): Matrix3D;
    static createScale(sx: number, sy: number, sz: number): Matrix3D;
    static createMultiply(a: Matrix3D, b: Matrix3D): Matrix3D;
    static createInverse(a: Matrix3D): Matrix3D;
  }
  class DirtyRegion {
    private static tmpRectangle;
    private grid;
    private w;
    private h;
    private c;
    private r;
    private size;
    private sizeInBits;
    constructor(w: any, h: any, sizeInBits?: number);
    public clear(): void;
    public getBounds(): Rectangle;
    public addDirtyRectangle(rectangle: Rectangle): void;
    public gatherRegions(regions: Rectangle[]): void;
    public gatherOptimizedRegions(regions: Rectangle[]): void;
    public getDirtyRatio(): number;
    public render(context: CanvasRenderingContext2D, options?: any): void;
  }
  module DirtyRegion {
    class Cell {
      public region: Rectangle;
      public bounds: Rectangle;
      constructor(region: Rectangle);
      public clear(): void;
    }
  }
  class Tile {
    public x: number;
    public y: number;
    public index: number;
    public scale: number;
    public bounds: Rectangle;
    public cachedSurfaceRegion: ISurfaceRegion;
    public color: Color;
    private _obb;
    private static corners;
    public getOBB(): OBB;
    constructor(index: number, x: number, y: number, w: number, h: number, scale: number);
  }
  class TileCache {
    public w: number;
    public h: number;
    public tileW: number;
    public tileH: number;
    public rows: number;
    public scale: number;
    public columns: number;
    public tiles: Tile[];
    private static _points;
    constructor(w: number, h: number, tileW: number, tileH: number, scale: number);
    public getTiles(query: Rectangle, transform: Matrix): Tile[];
    private getFewTiles(query, transform, precise?);
    private getManyTiles(query, transform);
  }
  class RenderableTileCache {
    private _source;
    private _cacheLevels;
    private _tileSize;
    private _minUntiledSize;
    constructor(source: Renderable, tileSize: number, minUntiledSize: number);
    private _getTilesAtScale(query, transform, scratchBounds);
    public fetchTiles(query: Rectangle, transform: Matrix, scratchContext: CanvasRenderingContext2D, cacheImageCallback: (old: ISurfaceRegion, src: CanvasRenderingContext2D, srcBounds: Rectangle) => ISurfaceRegion): Tile[];
    private _getTileBounds(tiles);
    private _cacheTiles(scratchContext, uncachedTiles, cacheImageCallback, scratchBounds, maxRecursionDepth?);
  }
  class MipMapLevel {
    public surfaceRegion: ISurfaceRegion;
    public scale: number;
    constructor(surfaceRegion: ISurfaceRegion, scale: number);
  }
  class MipMap {
    private _source;
    private _size;
    private _levels;
    private _surfaceRegionAllocator;
    constructor(source: Renderable, surfaceRegionAllocator: SurfaceRegionAllocator.ISurfaceRegionAllocator, size: number);
    public render(context: CanvasRenderingContext2D): void;
    public getLevel(matrix: Matrix): MipMapLevel;
  }
}
declare module Shumway.GFX {
  module RegionAllocator {
    class Region extends Geometry.Rectangle {
      public allocator: IRegionAllocator;
      public allocated: boolean;
    }
    interface IRegionAllocator {
      allocate(w: number, h: number): Region;
      free(region: Region): any;
    }
    class CompactAllocator implements IRegionAllocator {
      static RANDOM_ORIENTATION: boolean;
      static MAX_DEPTH: number;
      private _root;
      constructor(w: number, h: number);
      public allocate(w: number, h: number): Region;
      public free(region: Region): void;
    }
    class GridAllocator implements IRegionAllocator {
      private _sizeW;
      private _sizeH;
      private _rows;
      private _columns;
      private _freeList;
      private _index;
      private _total;
      constructor(w: number, h: number, sizeW: number, sizeH: number);
      public allocate(w: number, h: number): Region;
      public free(region: Region): void;
    }
    class GridCell extends Region {
      public index: number;
      constructor(x: number, y: number, w: number, h: number);
    }
    class BucketCell extends Region {
      public region: Region;
      constructor(x: any, y: any, w: any, h: any, region: any);
    }
    class BucketAllocator implements IRegionAllocator {
      private _w;
      private _h;
      private _filled;
      private _buckets;
      constructor(w: number, h: number);
      public allocate(w: number, h: number): Region;
      public free(region: BucketCell): void;
    }
  }
  module SurfaceRegionAllocator {
    interface ISurfaceRegionAllocator {
      surfaces: ISurface[];
      addSurface(surface: ISurface): any;
      allocate(w: number, h: number): ISurfaceRegion;
      free(region: ISurfaceRegion): any;
    }
    class SimpleAllocator implements ISurfaceRegionAllocator {
      private _createSurface;
      private _surfaces;
      public surfaces : ISurface[];
      constructor(createSurface: (w: number, h: number) => ISurface);
      private _createNewSurface(w, h);
      public addSurface(surface: ISurface): void;
      public allocate(w: number, h: number): ISurfaceRegion;
      public free(region: ISurfaceRegion): void;
    }
  }
}
declare module Shumway.GFX {
  enum Direction {
    None = 0,
    Upward = 1,
    Downward = 2,
  }
  enum PixelSnapping {
    Never = 0,
    Always = 1,
    Auto = 2,
  }
  enum Smoothing {
    Never = 0,
    Always = 1,
  }
  enum FrameFlags {
    Empty = 0,
    Dirty = 1,
    IsMask = 2,
    IgnoreMask = 8,
    IgnoreQuery = 16,
    InvalidBounds = 32,
    InvalidConcatenatedMatrix = 64,
    InvalidInvertedConcatenatedMatrix = 128,
    InvalidConcatenatedColorMatrix = 256,
    InvalidPaint = 512,
    EnterClip = 4096,
    LeaveClip = 8192,
    Visible = 16384,
  }
  enum FrameCapabilityFlags {
    None = 0,
    AllowMatrixWrite = 1,
    AllowColorMatrixWrite = 2,
    AllowBlendModeWrite = 4,
    AllowFiltersWrite = 8,
    AllowMaskWrite = 16,
    AllowChildrenWrite = 32,
    AllowClipWrite = 64,
    AllowAllWrite,
  }
  class Frame {
    public color: Color;
    private static _path;
    private static _getAncestors(node, last?);
    private _blendMode;
    private _matrix;
    private _concatenatedMatrix;
    private _invertedConcatenatedMatrix;
    private _filters;
    private _colorMatrix;
    private _concatenatedColorMatrix;
    private _properties;
    private _mask;
    private _clip;
    private _flags;
    private _capability;
    public _previouslyRenderedAABB: Geometry.Rectangle;
    public _parent: Frame;
    public parent : Frame;
    public _smoothing: Smoothing;
    public _pixelSnapping: PixelSnapping;
    public ignoreMaskAlpha: boolean;
    private static _nextID;
    private _id;
    public id : number;
    constructor();
    public _setFlags(flags: FrameFlags): void;
    public _removeFlags(flags: FrameFlags): void;
    public _hasFlags(flags: FrameFlags): boolean;
    public _toggleFlags(flags: FrameFlags, on: boolean): void;
    public _hasAnyFlags(flags: FrameFlags): boolean;
    private _findClosestAncestor(flags, on);
    public _isAncestor(child: Frame): boolean;
    public setCapability(capability: FrameCapabilityFlags, on?: boolean, direction?: Direction): void;
    public removeCapability(capability: FrameCapabilityFlags): void;
    public hasCapability(capability: FrameCapabilityFlags): number;
    public checkCapability(capability: FrameCapabilityFlags): void;
    public _propagateFlagsUp(flags: FrameFlags): void;
    public _propagateFlagsDown(flags: FrameFlags): void;
    public _invalidatePosition(): void;
    public invalidatePaint(): void;
    private _invalidateParentPaint();
    private _invalidateBounds();
    public properties : {
      [name: string]: any;
    };
    public x : number;
    public y : number;
    public matrix : Geometry.Matrix;
    public blendMode : BlendMode;
    public filters : Filter[];
    public colorMatrix : ColorMatrix;
    public mask : Frame;
    public clip : number;
    public getBounds(): Geometry.Rectangle;
    public gatherPreviousDirtyRegions(): void;
    public getConcatenatedColorMatrix(): ColorMatrix;
    public getConcatenatedAlpha(ancestor?: Frame): number;
    public stage : Stage;
    public getConcatenatedMatrix(): Geometry.Matrix;
    private _getInvertedConcatenatedMatrix();
    public invalidate(): void;
    public visit(visitor: (Frame: any, Matrix?: any, FrameFlags?: any) => VisitorFlags, transform?: Geometry.Matrix, flags?: FrameFlags, visitorFlags?: VisitorFlags): void;
    public getDepth(): number;
    public smoothing : Smoothing;
    public pixelSnapping : PixelSnapping;
    public queryFramesByPoint(query: Geometry.Point, multiple?: boolean, includeFrameContainers?: boolean): Frame[];
  }
}
declare module Shumway.GFX {
  class FrameContainer extends Frame {
    public _children: Frame[];
    public _bounds: Geometry.Rectangle;
    constructor();
    public addChild(child: Frame): Frame;
    public addChildAt(child: Frame, index: number): Frame;
    public removeChild(child: Frame): void;
    public removeChildAt(index: number): void;
    public clearChildren(): void;
    public _propagateFlagsDown(flags: FrameFlags): void;
    public getBounds(): Geometry.Rectangle;
    public gatherLeaveClipEvents(): Frame[][];
  }
}
declare module Shumway.GFX {
  enum BlendMode {
    Normal = 1,
    Layer = 2,
    Multiply = 3,
    Screen = 4,
    Lighten = 5,
    Darken = 6,
    Difference = 7,
    Add = 8,
    Subtract = 9,
    Invert = 10,
    Alpha = 11,
    Erase = 12,
    Overlay = 13,
    HardLight = 14,
  }
  enum VisitorFlags {
    None = 0,
    Continue = 0,
    Stop = 1,
    Skip = 2,
    FrontToBack = 8,
    Clips = 16,
  }
  class StageRendererOptions {
    public debug: boolean;
    public paintRenderable: boolean;
    public paintBounds: boolean;
    public paintFlashing: boolean;
    public paintViewport: boolean;
  }
  enum Backend {
    Canvas2D = 0,
    WebGL = 1,
    Both = 2,
    DOM = 3,
    SVG = 4,
  }
  class StageRenderer {
    public _viewport: Geometry.Rectangle;
    public _options: StageRendererOptions;
    public _canvas: HTMLCanvasElement;
    public _stage: Stage;
    constructor(canvas: HTMLCanvasElement, stage: Stage, options: StageRendererOptions);
    public viewport : Geometry.Rectangle;
    public render(): void;
    public resize(): void;
  }
  class Stage extends FrameContainer {
    public trackDirtyRegions: boolean;
    public dirtyRegion: Geometry.DirtyRegion;
    public w: number;
    public h: number;
    constructor(w: number, h: number, trackDirtyRegions?: boolean);
    public readyToRender(clearFlags?: boolean): boolean;
    public gatherMarkedDirtyRegions(transform: Geometry.Matrix): void;
    public gatherFrames(): any[];
    public gatherLayers(): any[];
  }
  class ClipRectangle extends FrameContainer {
    public color: Color;
    constructor(w: number, h: number);
    public setBounds(bounds: Geometry.Rectangle): void;
    public getBounds(): Geometry.Rectangle;
  }
  class Shape extends Frame {
    private _source;
    public source : Renderable;
    constructor(source: Renderable);
    public getBounds(): Geometry.Rectangle;
  }
}
declare module Shumway.GFX {
  enum RenderableFlags {
    None = 0,
    Dynamic = 1,
    Dirty = 2,
    Scalable = 4,
    Tileable = 8,
    Loading = 16,
  }
  class Renderable {
    public _flags: RenderableFlags;
    public setFlags(flags: RenderableFlags): void;
    public hasFlags(flags: RenderableFlags): boolean;
    public removeFlags(flags: RenderableFlags): void;
    public properties: {
      [name: string]: any;
    };
    private _frameReferrers;
    private _renderableReferrers;
    public addFrameReferrer(frame: Frame): void;
    public addRenderableReferrer(renderable: Renderable): void;
    public invalidatePaint(): void;
    public _bounds: Geometry.Rectangle;
    constructor(bounds: Geometry.Rectangle);
    public getBounds(): Geometry.Rectangle;
    public render(context: CanvasRenderingContext2D, cullBounds?: Geometry.Rectangle, clipRegion?: boolean): void;
  }
  class CustomRenderable extends Renderable {
    constructor(bounds: Geometry.Rectangle, render: (context: CanvasRenderingContext2D, cullBounds: Geometry.Rectangle) => void);
  }
  class RenderableVideo extends Renderable {
    public _flags: number;
    private _video;
    private _lastCurrentTime;
    static _renderableVideos: RenderableVideo[];
    constructor(url: string, bounds: Geometry.Rectangle);
    public invalidatePaintCheck(): void;
    static invalidateVideos(): void;
    public render(context: CanvasRenderingContext2D, cullBounds: Geometry.Rectangle): void;
  }
  class RenderableBitmap extends Renderable {
    public _flags: number;
    public properties: {
      [name: string]: any;
    };
    public _canvas: HTMLCanvasElement;
    private fillStyle;
    private static _convertImage(sourceFormat, targetFormat, source, target);
    static FromDataBuffer(type: ImageType, dataBuffer: ArrayUtilities.DataBuffer, bounds: Geometry.Rectangle): RenderableBitmap;
    static FromFrame(source: Frame, matrix: Geometry.Matrix, colorMatrix: ColorMatrix, blendMode: number, clipRect: Geometry.Rectangle): RenderableBitmap;
    public updateFromDataBuffer(type: ImageType, dataBuffer: ArrayUtilities.DataBuffer): void;
    public readImageData(output: ArrayUtilities.DataBuffer): void;
    constructor(canvas: HTMLCanvasElement, bounds: Geometry.Rectangle);
    public render(context: CanvasRenderingContext2D, cullBounds: Geometry.Rectangle): void;
    public drawFrame(source: Frame, matrix: Geometry.Matrix, colorMatrix: ColorMatrix, blendMode: number, clipRect: Geometry.Rectangle): void;
    private _renderFallback(context);
  }
  class RenderableShape extends Renderable {
    public _flags: RenderableFlags;
    public properties: {
      [name: string]: any;
    };
    private _id;
    private fillStyle;
    private _pathData;
    private _paths;
    private _textures;
    private static LINE_CAPS_STYLES;
    private static LINE_JOINTS_STYLES;
    constructor(id: number, pathData: ShapeData, textures: RenderableBitmap[], bounds: Geometry.Rectangle);
    public update(pathData: ShapeData, textures: RenderableBitmap[], bounds: Geometry.Rectangle): void;
    public getBounds(): Geometry.Rectangle;
    public render(context: CanvasRenderingContext2D, cullBounds: Geometry.Rectangle, clipRegion?: boolean): void;
    private _deserializePaths(data, context);
    private _createPath(type, style, smoothImage, strokeProperties, x, y);
    private _readMatrix(data);
    private _readGradient(styles, context);
    private _readBitmap(styles, context);
    private _renderFallback(context);
  }
  class TextLine {
    private static _measureContext;
    public x: number;
    public y: number;
    public width: number;
    public ascent: number;
    public descent: number;
    public leading: number;
    public align: number;
    public runs: TextRun[];
    public addRun(font: string, fillStyle: string, text: string, underline: boolean): void;
    public wrap(maxWidth: number): TextLine[];
  }
  class TextRun {
    public font: string;
    public fillStyle: string;
    public text: string;
    public width: number;
    public underline: boolean;
    constructor(font?: string, fillStyle?: string, text?: string, width?: number, underline?: boolean);
  }
  class RenderableText extends Renderable {
    public _flags: number;
    public properties: {
      [name: string]: any;
    };
    private _textBounds;
    private _textRunData;
    private _plainText;
    private _backgroundColor;
    private _borderColor;
    private _matrix;
    private _coords;
    public textRect: Geometry.Rectangle;
    public lines: TextLine[];
    constructor(bounds: any);
    public setBounds(bounds: any): void;
    public setContent(plainText: string, textRunData: ArrayUtilities.DataBuffer, matrix: Geometry.Matrix, coords: ArrayUtilities.DataBuffer): void;
    public setStyle(backgroundColor: number, borderColor: number): void;
    public reflow(autoSize: number, wordWrap: boolean): void;
    public getBounds(): Geometry.Rectangle;
    public render(context: CanvasRenderingContext2D): void;
    private _renderChars(context);
    private _renderLines(context);
  }
  class Label extends Renderable {
    public _flags: RenderableFlags;
    public properties: {
      [name: string]: any;
    };
    private _text;
    public text : string;
    constructor(w: number, h: number);
    public render(context: CanvasRenderingContext2D, cullBounds?: Geometry.Rectangle): void;
  }
  class Grid extends Renderable {
    public _flags: RenderableFlags;
    public properties: {
      [name: string]: any;
    };
    constructor();
    public render(context: CanvasRenderingContext2D, cullBounds?: Geometry.Rectangle): void;
  }
}
declare module Shumway.GFX {
  class Filter {
  }
  class BlurFilter extends Filter {
    public blurX: number;
    public blurY: number;
    public quality: number;
    constructor(blurX: number, blurY: number, quality: number);
  }
  class DropshadowFilter extends Filter {
    public alpha: number;
    public angle: number;
    public blurX: number;
    public blurY: number;
    public color: number;
    public distance: number;
    public hideObject: boolean;
    public inner: boolean;
    public knockout: boolean;
    public quality: number;
    public strength: number;
    constructor(alpha: number, angle: number, blurX: number, blurY: number, color: number, distance: number, hideObject: boolean, inner: boolean, knockout: boolean, quality: number, strength: number);
  }
  class GlowFilter extends Filter {
    public alpha: number;
    public blurX: number;
    public blurY: number;
    public color: number;
    public inner: boolean;
    public knockout: boolean;
    public quality: number;
    public strength: number;
    constructor(alpha: number, blurX: number, blurY: number, color: number, inner: boolean, knockout: boolean, quality: number, strength: number);
  }
  class ColorMatrix {
    private _m;
    constructor(m: any);
    public clone(): ColorMatrix;
    public copyFrom(other: ColorMatrix): void;
    public toWebGLMatrix(): Float32Array;
    public asWebGLMatrix(): Float32Array;
    public asWebGLVector(): Float32Array;
    public getColorMatrix(): Float32Array;
    public getColorTransform(): Float32Array;
    public isIdentity(): boolean;
    static createIdentity(): ColorMatrix;
    static fromMultipliersAndOffsets(redMultiplier: number, greenMultiplier: number, blueMultiplier: number, alphaMultiplier: number, redOffset: number, greenOffset: number, blueOffset: number, alphaOffset: number): ColorMatrix;
    public transformRGBA(rgba: number): number;
    public multiply(other: ColorMatrix): void;
    public alphaMultiplier : number;
    public hasOnlyAlphaMultiplier(): boolean;
    public equals(other: ColorMatrix): boolean;
  }
}
interface CanvasPattern {
  setTransform: (matrix: SVGMatrix) => void;
}
interface CanvasGradient {
  setTransform: (matrix: SVGMatrix) => void;
}
interface CanvasRenderingContext2D {
  stackDepth: number;
  fill(path: Path2D, fillRule?: string): void;
  clip(path: Path2D, fillRule?: string): void;
  stroke(path: Path2D): void;
  imageSmoothingEnabled: boolean;
  mozImageSmoothingEnabled: boolean;
  fillRule: string;
  mozFillRule: string;
  enterBuildingClippingRegion(): any;
  leaveBuildingClippingRegion(): any;
}
declare class Path2D {
  constructor();
  constructor(path: Path2D);
  constructor(paths: Path2D[], fillRule?: string);
  constructor(d: any);
  public addPath(path: Path2D, transform?: SVGMatrix): void;
  public moveTo(x: number, y: number): void;
  public lineTo(x: number, y: number): void;
  public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  public rect(x: number, y: number, w: number, h: number): void;
  public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
  public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  public closePath(): void;
}
