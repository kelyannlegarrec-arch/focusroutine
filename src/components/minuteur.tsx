import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Bloc } from '@/lib/journee'
import { bip } from '@/lib/son'

function format(ms: number) {
  const secondes = Math.ceil(ms / 1000)
  const mm = String(Math.floor(secondes / 60)).padStart(2, '0')
  const ss = String(secondes % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

type Props = {
  bloc: Bloc
  onTermine: () => void
  onArreter: () => void
}

export function Minuteur({ bloc, onTermine, onArreter }: Props) {
  const total = bloc.minutes * 60 * 1000
  // On garde l'heure de fin : le temps reste juste même si le téléphone se met en veille
  const [finA, setFinA] = useState(() => Date.now() + total)
  const [resteEnPause, setResteEnPause] = useState<number | null>(null)
  const [maintenant, setMaintenant] = useState(() => Date.now())

  const reste = resteEnPause ?? Math.max(0, finA - maintenant)

  useEffect(() => {
    if (resteEnPause !== null) return
    const timer = setInterval(() => setMaintenant(Date.now()), 250)
    return () => clearInterval(timer)
  }, [resteEnPause])

  const dejaFini = useRef(false)
  useEffect(() => {
    if (reste > 0 || dejaFini.current) return
    dejaFini.current = true
    bip()
    onTermine()
  }, [reste, onTermine])

  function pauseOuReprise() {
    if (resteEnPause === null) {
      setResteEnPause(reste)
    } else {
      setFinA(Date.now() + resteEnPause)
      setMaintenant(Date.now())
      setResteEnPause(null)
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-8 bg-background px-4 text-center">
      <p className="text-lg text-muted-foreground">{bloc.titre}</p>
      <p className="text-7xl font-semibold tabular-nums sm:text-8xl">{format(reste)}</p>
      <Progress value={((total - reste) / total) * 100} className="h-2 max-w-sm" />
      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button size="lg" className="h-12 text-base" onClick={onTermine}>
          J’ai fini ce bloc
        </Button>
        <Button size="lg" variant="outline" className="h-12 text-base" onClick={pauseOuReprise}>
          {resteEnPause === null ? 'Pause' : 'Reprendre'}
        </Button>
        <Button variant="ghost" onClick={onArreter}>
          Arrêter
        </Button>
      </div>
    </div>
  )
}
