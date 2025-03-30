declare module "@livekit/components-react" {
  export const RoomContext: React.Context<any>

  export function useVoiceAssistant(): {
    state: string
    audioTrack: React.RefObject<any>
  }

  export function BarVisualizer(props: {
    state: string
    barCount: number
    trackRef: React.RefObject<any>
    style: React.CSSProperties
  }): JSX.Element

  export function RoomAudioRenderer(): JSX.Element

  export function VoiceAssistantControlBar(): JSX.Element
}

