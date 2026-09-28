import confetti from 'canvas-confetti';

export function fireSuccessConfetti() {
  try {
    // Elegant, subtle celebration burst
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#2563EB', '#7C3AED', '#F59E0B', '#10B981'],
      disableForReducedMotion: true,
    });
  } catch (err) {
    // Silently continue if canvas is not supported
  }
}
