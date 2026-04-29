import Link from "next/link"
import { ArrowRight, Server } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  const mcpServerUrl =
    process.env.NEXT_PUBLIC_MCP_SERVER_URL || "http://localhost:8000"

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#20345a_0,#0F1B33_42%,#0b1222_100%)] p-4 text-white">
      <section className="w-full max-w-[400px] text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-[#E8531A]/30 bg-[#E8531A]/10 px-3 py-1 text-xs font-bold text-orange-300">
          Factsheet × Upflow
        </div>
        <h1 className="mb-3 text-3xl font-bold">Factsheet MCP PoC</h1>
        <p className="mb-6 text-sm leading-6 text-slate-300">
          Claude Desktop의 OAuth 흐름에서 호출되는 로그인 프론트엔드입니다.
        </p>

        <Button
          asChild
          className="h-12 bg-[#E8531A] px-5 text-base font-semibold text-white hover:bg-[#cc4212]"
        >
          <Link href="/login">
            로그인으로 이동
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Server className="h-4 w-4 text-[#E8531A]" aria-hidden="true" />
          <span className="truncate">{mcpServerUrl}</span>
        </div>
      </section>
    </main>
  )
}
