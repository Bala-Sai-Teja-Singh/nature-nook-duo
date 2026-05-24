export function useModules() {
  return {
    isVisible: (module: string) => true,
    isModuleEnabled: (module: string) => true,
  };
}
