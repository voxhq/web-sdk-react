import { useVoxContext } from "../VoxContext";

export function useVoxControls() {
  const { start, stop, toggle, isRecording, status } = useVoxContext();
  return { start, stop, toggle, isRecording, status };
}