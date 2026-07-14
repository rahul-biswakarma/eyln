/**
 * Feature flag for the cloud content source. While false, the app renders
 * lessons from the in-code registry (`lesson.Body`). When true, lessons render
 * from cloud PM JSON via the sync layer. P4 flips the default to true and
 * removes the in-code modules.
 *
 * Override at build time with VITE_CONTENT_FROM_CLOUD=true.
 */
export const CONTENT_FROM_CLOUD: boolean = import.meta.env.VITE_CONTENT_FROM_CLOUD === "true";
