import { createContext, useContext } from "react";
import type { VoxContextValue } from "./types";

const VoxContext = createContext<VoxContextValue | null>(null);

export function useVoxContext(): VoxContextValue {
  const v = useContext(VoxContext);
  if (!v) throw new Error("useVox must be used within <VoxProvider>");
  return v;
}

export { VoxContext };