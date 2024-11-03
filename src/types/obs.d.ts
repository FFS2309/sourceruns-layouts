type ObsBlendMode =
    | 'OBS_BLEND_NORMAL'
    | 'OBS_BLEND_ADDITIVE'
    | 'OBS_BLEND_SUBTRACT'
    | 'OBS_BLEND_SCREEN'
    | 'OBS_BLEND_MULTIPLY'
    | 'OBS_BLEND_LIGHTEN'
    | 'OBS_BLEND_DARKEN';

type ObsAlignment = 5 | 4 | 6 | 1 | 0 | 2 | 9 | 8 | 10;

type ObsBoundsType =
    | 'OBS_BOUNDS_STRETCH'
    | 'OBS_BOUNDS_SCALE_INNER'
    | 'OBS_BOUNDS_SCALE_OUTER'
    | 'OBS_BOUNDS_SCALE_TO_WIDTH'
    | 'OBS_BOUNDS_SCALE_TO_HEIGHT'
    | 'OBS_BOUNDS_MAX_ONLY'
    | 'OBS_BOUNDS_NONE';

export type ObsSceneItemTransform = {
    positionX: number
    positionY: number
    alignment: ObsAlignment
    rotation: number
    scaleX: number
    scaleY: number
    cropTop: number
    cropRight: number
    cropBottom: number
    cropLeft: number
    cropToBounds: boolean
    boundsType: ObsBoundsType
    boundsAlignment: ObsAlignment
    boundsWidth: number
    boundsHeight: number
    sourceWidth: number
    sourceHeight: number
    width: number
    height: number
};

export type ObsSceneItem = {
    inputKind: string | null
    isGroup: boolean | null
    sceneItemBlendMode: ObsBlendMode
    sceneItemEnabled: boolean
    sceneItemId: number
    sceneItemIndex: number
    sceneItemLocked: boolean
    sceneItemTransform: ObsSceneItemTransform
    sourceName: string
    sourceType: 'OBS_SOURCE_TYPE_INPUT' | 'OBS_SOURCE_TYPE_SCENE'
};