// ── Haptic feedback via Vibration API ──

const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

function vibrate(pattern) {
  if (canVibrate) {
    navigator.vibrate(pattern);
  }
}

export const haptics = {
  tick:   () => vibrate(8),
  pop:    () => vibrate(15),
  toggle: () => vibrate([8, 5, 8]),
  heavy:  () => vibrate(30),
  snap:   () => vibrate([5, 3, 12]),
  click:  () => vibrate(5),
};
