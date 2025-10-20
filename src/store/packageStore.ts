import { create } from 'zustand';
import { Package } from '../types';

interface PackageState {
    packages: Package[];
    setPackages: (packages: Package[]) => void;
    addPackage: (pkg: Package) => void;
    updatePackage: (pkg: Package) => void;
    removePackage: (packageId: string) => void;
}

export const usePackageStore = create<PackageState>((set) => ({
    packages: [],
    setPackages: (packages) => set({ packages }),
    // FIX: Add addPackage action.
    addPackage: (pkg) => set((state) => ({ packages: [...state.packages, pkg] })),
    // FIX: Add updatePackage action.
    updatePackage: (pkg) => set((state) => ({
        packages: state.packages.map(p => p.id === pkg.id ? pkg : p)
    })),
    // FIX: Add removePackage action.
    removePackage: (packageId) => set((state) => ({
        packages: state.packages.filter(p => p.id !== packageId)
    })),
}));
