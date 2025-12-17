import {create} from "zustand";
interface XhsStore {
  data: any | null;
  setData: (data: any) => void;
}
const useXhsStore = create<XhsStore>((set) => ({
  data: null,
  setData: (data) => set({data}),
}));
export default useXhsStore;