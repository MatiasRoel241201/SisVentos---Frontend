import { useEffect, useState } from "react"

export function CountdownTimer({ targetDate }: { targetDate: string | Date }) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const timeUnits = [
    { label: "Días", value: timeLeft.days, id: "countdown-days" },
    { label: "Horas", value: timeLeft.hours, id: "countdown-hours" },
    { label: "Minutos", value: timeLeft.minutes, id: "countdown-minutes" },
    { label: "Segundos", value: timeLeft.seconds, id: "countdown-seconds" },
  ]

  if (!mounted) {
    return (
      <div className="flex gap-3 sm:gap-4">
        {timeUnits.map((item) => (
          <div key={item.id} className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 min-w-[60px] sm:min-w-[80px]">
              <span className="text-2xl sm:text-4xl font-bold text-white">00</span>
            </div>
            <span className="text-xs sm:text-sm text-white/80 mt-1 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 sm:gap-4">
      {timeUnits.map((item) => (
        <div key={item.id} className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 min-w-[60px] sm:min-w-[80px]">
            <span className="text-2xl sm:text-4xl font-bold text-white">{String(item.value).padStart(2, "0")}</span>
          </div>
          <span className="text-xs sm:text-sm text-white/80 mt-1 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  )
}