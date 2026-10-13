// Petit « bip » de fin de bloc, sans fichier audio.
// Sur iPhone, le son doit être autorisé par un toucher : on prépare donc
// le son au moment où le client touche « Démarrer ».
let contexte: AudioContext | null = null

export function preparerSon() {
  contexte ??= new AudioContext()
  void contexte.resume()
}

export function bip() {
  if (!contexte) return
  const oscillateur = contexte.createOscillator()
  const volume = contexte.createGain()
  oscillateur.frequency.value = 880
  volume.gain.setValueAtTime(0.3, contexte.currentTime)
  volume.gain.exponentialRampToValueAtTime(0.001, contexte.currentTime + 1)
  oscillateur.connect(volume).connect(contexte.destination)
  oscillateur.start()
  oscillateur.stop(contexte.currentTime + 1)
}
