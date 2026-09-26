import { create } from "zustand";
import { listRestorationPlan, saveRestorationPlanAsNewVersion } from "../api/RestorationPlan";
import type { RestorationPlan } from "../types/RestorationPlan";

type State = {
  rows: RestorationPlan[];
  loading: boolean;
  load: () => Promise<void>;
  saveAsNewVersion: (planId: number) => Promise<RestorationPlan | null>;
};

export const useRestorationPlanStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRestorationPlan(), loading: false });
  },
  async saveAsNewVersion(planId) {
    const created = await saveRestorationPlanAsNewVersion(planId);
    await get().load();
    return created;
  }
}));
