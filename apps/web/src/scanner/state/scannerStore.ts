import { create } from "zustand";
type ScannerState = { isOpen: boolean; files: File[] | null; open: (f?: File[] | null)=>void; close:()=>void; setFiles:(f:File[]|null)=>void };
export const useScannerStore = create<ScannerState>((set)=>({
  isOpen:false, files:null, open:(f=null)=>set({isOpen:true, files:f}), close:()=>set({isOpen:false, files:null}), setFiles:(f)=>set({files:f})
}));
