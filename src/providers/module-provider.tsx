export function ModuleProvider({ children, initialModules }: { children: React.ReactNode, initialModules?: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _init = initialModules;
  return <>{children}</>;
}
