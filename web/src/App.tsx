import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lottie } from "@/components/Lottie"
import pulse from "@/pulse.json"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

export default function App() {
  return (
    <main className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>shadcn/ui is installed</CardTitle>
          <CardDescription>Brihad Temple Finance – UI playground</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Lottie data={pulse} className="mx-auto size-20" />
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
    </main>
  )
}
