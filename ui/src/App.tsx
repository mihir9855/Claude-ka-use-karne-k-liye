import { Button } from "@/components/ui/button"
import { TextEffect } from "@/components/motion-primitives/text-effect"

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <TextEffect per="word" preset="blur" className="text-3xl font-bold">
        UI toolkit ready: shadcn + Magic UI + Motion Primitives + React Bits
      </TextEffect>
      <Button>It works</Button>
    </div>
  )
}
