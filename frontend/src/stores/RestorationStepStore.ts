import { create } from "zustand";
import { listRestorationStep, updateRestorationStep } from "../api/RestorationStep";
import type { RestorationStep } from "../types/RestorationStep";

type State = {
  rows: RestorationStep[];
  loading: boolean;
  load: () => Promise<void>;
  update: (id: number, patch: Partial<RestorationStep>) => Promise<void>;
};

export const useRestorationStepStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRestorationStep(), loading: false });
  },
  async update(id, patch) {
    await updateRestorationStep(id, patch);
    await get().load();
  }
}));
