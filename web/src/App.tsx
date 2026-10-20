import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lottie } from "@/components/Lottie"
import pulse from "@/pulse.json"
import { motion } from "motion/react"
import BlurText from "@/react-bits/TextAnimations/BlurText/BlurText"
import { TextShimmer } from "@/motion-primitives/text-shimmer"
import { ShimmerButton } from "@/magicui/shimmer-button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

export default function App() {
  return (
    <motion.main
      className="mx-auto max-w-md p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle><BlurText text="React Bits is installed" /></CardTitle>
          <CardDescription>Brihad Temple Finance – UI playground</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Lottie data={pulse} className="mx-auto size-20" />
          <TextShimmer className="text-sm">Motion Primitives ready</TextShimmer>
          <ShimmerButton>Magic UI ready</ShimmerButton>
          <Input placeholder="Project name" />
          <Dialog>
            <DialogTrigger asChild><Button>Open dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>It works</DialogTitle>
                <DialogDescription>Button, Card, Input and Dialog are ready to use.</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.main>
  )
}
