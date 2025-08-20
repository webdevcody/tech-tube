import { Button } from "~/components/ui/button"
import { Link } from "@tanstack/react-router"
import { Play, Video, Users, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-16 sm:py-24">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Share Your Story with{" "}
              <span className="text-primary">TechTube</span>
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl">
              Upload, discover, and engage with video content on our modern video sharing platform. 
              Connect with creators, build your audience, and explore unlimited entertainment.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="text-base">
              <Link to="/sign-up">
                Start Creating
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base">
              <Play className="mr-2 h-4 w-4" />
              Explore Videos
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-6 pt-4">
            <div className="text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Upload Videos</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Build Community</p>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Go Viral</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="h-80 w-80 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-border overflow-hidden">
              <div className="text-center p-8">
                <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Play className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Your Content</h3>
                <p className="text-sm text-muted-foreground">Create engaging videos that reach millions of viewers worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}