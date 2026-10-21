import { useEffect, useRef } from "react"
import lottie, { type AnimationConfigWithData } from "lottie-web"

type Props = {
  data: object
  loop?: boolean
  autoplay?: boolean
  className?: string
}

export function Lottie({ data, loop = true, autoplay = true, className }: Props) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!box.current) return
    const anim = lottie.loadAnimation({
      container: box.current,
      renderer: "svg",
      loop,
      autoplay,
      animationData: data,
    } as AnimationConfigWithData)
    return () => anim.destroy()
  }, [data, loop, autoplay])
  return <div ref={box} className={className} />
}
