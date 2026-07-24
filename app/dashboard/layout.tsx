import { TooltipProvider } from "@/components/ui/tooltip"
import { Story_Script } from "next/font/google";
const storyFont = Story_Script({
  variable: "--font-story-script",
  subsets: ["latin"],
  weight: "400",
});
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>{children}</TooltipProvider>
  )
}