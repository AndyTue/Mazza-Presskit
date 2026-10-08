// Minimal types for the SoundCloud Widget API (https://developers.soundcloud.com/docs/api/html5-widget).
export {}

declare global {
  interface SoundCloudWidget {
    play(): void
    pause(): void
    toggle(): void
    bind(event: string, listener: () => void): void
    unbind(event: string): void
  }

  interface Window {
    SC?: {
      Widget: ((iframe: HTMLIFrameElement) => SoundCloudWidget) & {
        Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string }
      }
    }
  }
}
