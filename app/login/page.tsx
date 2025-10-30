"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"

// IMPORTANT: import the login helper from lib/auth (not the firebase instance)
import { login } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Demo mode - skip authentication
      console.log("Demo login successful")
      router.push("/levels")
    } catch (err: any) {
      setError(err?.message ?? "Failed to sign in")
      console.error("Login error", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/10 bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute top-20 left-10 text-6xl opacity-40 float-animation filter brightness-75">🐠</div>
      <div
        className="absolute top-40 right-20 text-4xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "1s" }}
      >
        🐙
      </div>
      <div
        className="absolute bottom-32 left-20 text-5xl opacity-40 float-animation filter brightness-75"
        style={{ animationDelay: "2s" }}
      >
        🦀
      </div>
      <div
        className="absolute bottom-20 right-10 text-3xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "3s" }}
      >
        🐚
      </div>

      <div
        className="absolute top-60 left-32 text-4xl opacity-30 float-animation filter brightness-75"
        style={{ animationDelay: "4s" }}
      >
        🦈
      </div>
      <div
        className="absolute top-80 right-32 text-5xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "5s" }}
      >
        🐢
      </div>
      <div
        className="absolute bottom-60 left-8 text-3xl opacity-40 float-animation filter brightness-75"
        style={{ animationDelay: "6s" }}
      >
        🦞
      </div>
      <div
        className="absolute bottom-80 right-8 text-4xl opacity-30 float-animation filter brightness-75"
        style={{ animationDelay: "7s" }}
      >
        🐋
      </div>
      <div
        className="absolute top-32 right-48 text-5xl opacity-35 float-animation filter brightness-75"
        style={{ animationDelay: "8s" }}
      >
        🦭
      </div>
      <div
        className="absolute bottom-48 left-48 text-3xl opacity-40 float-animation filter brightness-75"
        style={{ animationDelay: "9s" }}
      >
        🐡
      </div>

      <Card className="w-full max-w-md backdrop-blur-sm bg-card/80 border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Syntax Saga
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-lg">Dive into your coding adventure</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="captain@syntaxsaga.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-primary/30 focus:border-primary focus:ring-primary/20"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? "Hoisting sails..." : "Set Sail"}
            </Button>
          </form>

          {error && (
            <div className="text-sm text-destructive mt-2 text-center">
              {error}
            </div>
          )}

          <div className="text-center">
            <Link href="/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Forgot your treasure map?
            </Link>
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 bg-transparent"
              onClick={() => alert("Social sign in not implemented yet")}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 bg-transparent"
              onClick={() => alert("Social sign in not implemented yet")}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .296c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.111.82-.261.82-.58 0-.287-.011-1.244-.016-2.255-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.085 1.838 1.238 1.838 1.238 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.333-5.466-5.932 0-1.311.469-2.381 1.236-3.221-.124-.304-.535-1.527.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.004-.404c1.02.005 2.046.138 3.004.404 2.291-1.552 3.297-1.23 3.297-1.23.654 1.649.243 2.872.119 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.804 5.624-5.476 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .321.216.697.825.579C20.565 22.092 24 17.596 24 12.296c0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </Button>
          </div>

          <Separator className="bg-border/50" />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              New to the crew?{" "}
              <Link href="/signup" className="text-primary hover:text-secondary transition-colors font-medium">
                Join the adventure
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom navigation link */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <Link
          href="/"
          className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
        >
          ← Back to shore
        </Link>
      </div>
    </div>
  )
}
