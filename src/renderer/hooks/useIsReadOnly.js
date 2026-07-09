export function useIsReadOnly(patient) {
  return !!patient?.isSharedIn;
}