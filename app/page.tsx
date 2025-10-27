import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Code, Trophy, Users, Waves, Fish } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/10 bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${15 + Math.random() * 50}px`,
              height: `${15 + Math.random() * 50}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* Enhanced floating sea creatures */}
      <div className="absolute top-32 left-16 text-5xl opacity-40 float-animation filter brightness-75">🐠</div>
      <div
        className="absolute top-64 right-24 text-4xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "1s" }}
      >
        🐙
      </div>
      <div
        className="absolute top-96 left-32 text-3xl opacity-40 float-animation filter brightness-75"
        style={{ animationDelay: "2s" }}
      >
        🦀
      </div>
      <div
        className="absolute top-[500px] right-16 text-4xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "3s" }}
      >
        🐚
      </div>
      <div
        className="absolute top-[700px] left-20 text-5xl opacity-40 float-animation filter brightness-75"
        style={{ animationDelay: "4s" }}
      >
        🐟
      </div>
      <div
        className="absolute top-[900px] right-32 text-3xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "5s" }}
      >
        🦑
      </div>
      <div
        className="absolute bottom-96 left-24 text-4xl opacity-40 float-animation filter brightness-75"
        style={{ animationDelay: "6s" }}
      >
        🐡
      </div>
      <div
        className="absolute bottom-64 right-20 text-3xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "7s" }}
      >
        🌊
      </div>

      {/* Additional floating sea creatures */}
      <div
        className="absolute top-48 left-64 text-4xl opacity-30 float-animation filter brightness-75"
        style={{ animationDelay: "8s" }}
      >
        🦈
      </div>
      <div
        className="absolute top-80 right-48 text-3xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "9s" }}
      >
        🐢
      </div>
      <div
        className="absolute top-[600px] left-48 text-5xl opacity-40 float-animation filter brightness-75"
        style={{ animationDelay: "10s" }}
      >
        🦞
      </div>
      <div
        className="absolute top-[800px] right-64 text-4xl opacity-30 float-animation filter brightness-75"
        style={{ animationDelay: "11s" }}
      >
        🐋
      </div>
      <div
        className="absolute bottom-80 left-40 text-3xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "12s" }}
      >
        🦭
      </div>
      <div
        className="absolute bottom-48 right-40 text-4xl opacity-40 float-animation filter brightness-75"
        style={{ animationDelay: "13s" }}
      >
        🐙
      </div>
      <div
        className="absolute top-[400px] left-8 text-5xl opacity-30 float-animation filter brightness-75"
        style={{ animationDelay: "14s" }}
      >
        🦀
      </div>
      <div
        className="absolute top-[750px] right-8 text-3xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "15s" }}
      >
        🐠
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="font-bold text-2xl text-foreground">Syntax Saga</div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#challenges" className="text-muted-foreground hover:text-foreground transition-colors">
            Challenges
          </a>
          <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors">
            Community
          </a>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 lg:px-12 pt-12 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              <Waves className="w-4 h-4 mr-2" />
              {"Dive into the Deep End of Code"}
            </Badge>

            <h1 className="text-6xl lg:text-8xl font-bold mb-8 text-balance">
              <span className="block text-foreground">IMMERSIVE</span>
              <span className="block text-primary">CODING</span>
              <span className="block text-secondary">ADVENTURE</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 text-pretty">
              {
                "Explore the depths of programming through interactive underwater challenges. Master algorithms while navigating through coral reefs of code."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/levels">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                  <Play className="w-5 h-5 mr-2" />
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/levels">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent">
                  <Code className="w-5 h-5 mr-2" />
                  View Challenges
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-24" id="features">
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 float-animation">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Code className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Interactive Coding</h3>
                <p className="text-muted-foreground text-pretty">
                  {
                    "Write real code to solve underwater puzzles. Each challenge teaches fundamental programming concepts through engaging sea-themed scenarios."
                  }
                </p>
              </CardContent>
            </Card>

            <Card
              className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 float-animation"
              style={{ animationDelay: "1s" }}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Trophy className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Progressive Challenges</h3>
                <p className="text-muted-foreground text-pretty">
                  {
                    "Start in shallow waters with basic syntax and dive deeper into advanced algorithms. Unlock new oceanic regions as you progress."
                  }
                </p>
              </CardContent>
            </Card>

            <Card
              className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 float-animation"
              style={{ animationDelay: "2s" }}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">Ocean Community</h3>
                <p className="text-muted-foreground text-pretty">
                  {
                    "Join fellow code explorers in collaborative challenges. Share solutions and learn from the diverse underwater coding ecosystem."
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Immersive Experience Section */}
          <div className="text-center mb-24" id="challenges">
            <h2 className="text-5xl font-bold mb-8 text-balance text-foreground">{"Explore Coding Depths"}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 text-pretty">
              {
                "Navigate through beautifully crafted underwater environments where each coding challenge is seamlessly integrated into the oceanic world. Experience programming like never before."
              }
            </p>

            <div className="relative max-w-4xl mx-auto">
              <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="p-12">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-left">
                      <h3 className="text-3xl font-bold mb-6 text-foreground">{"The Coral Reef Challenge"}</h3>
                      <p className="text-muted-foreground mb-8 text-pretty">
                        {
                          "Navigate through a vibrant coral reef ecosystem while solving data structure puzzles. Each coral formation represents a different algorithm waiting to be discovered."
                        }
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        <Badge variant="secondary">Arrays</Badge>
                        <Badge variant="secondary">Sorting</Badge>
                        <Badge variant="secondary">Recursion</Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                        <Fish className="w-24 h-24 text-primary/60 wave-animation" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Community Section */}
          <div className="text-center" id="community">
            <h2 className="text-4xl font-bold mb-6 text-foreground">{"Join the Deep Sea Developers"}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 text-pretty">
              {
                "Connect with thousands of developers exploring the depths of code. Share your discoveries and learn from the ocean of knowledge."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/levels">
                <Button size="lg" className="px-8 py-6 text-lg">
                  {"Dive In Now"}
                </Button>
              </Link>
              <Link href="/levels">
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent">
                  {"Learn More"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-24 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="font-bold text-xl text-foreground">Syntax Saga</span>
          </div>
          <p className="text-muted-foreground">{"© 2025 Syntax Saga. Dive deep, code deeper."}</p>
        </div>
      </footer>
    </div>
  )
}
