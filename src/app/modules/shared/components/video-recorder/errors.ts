export enum RecorderErrors {
    PERMISSION_DENIED = 'It looks like we can\'t access your camera.',
    NAVIGATOR_NOT_SUPPORTED = 'navigator.mediaDevices.getUserMedia not supported on your browser, use the latest version of the browser.',
    NO_STREAM = 'Could not get local stream from mic/camera',
    NOT_READABLE = 'Could not start video source. Device might be busy.'
}
