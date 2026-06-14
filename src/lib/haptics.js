// Haptic feedback utility using Web Vibration API
export function haptic(pattern = "light") {
  if (!navigator.vibrate) return;
  const patterns = {
    light: [10],
    medium: [20],
    heavy: [40],
    success: [10, 50, 10],
    error: [50, 30, 50],
  };
  navigator.vibrate(patterns[pattern] || [10]);
}