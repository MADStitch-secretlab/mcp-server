import type { ReactNode } from "react"
import { Info } from "lucide-react"

export function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string
  description: string
  footer: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#20345a_0,#0F1B33_42%,#0b1222_100%)] p-4">
      <section className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-[#E8531A]/30 bg-[#E8531A]/10 px-3 py-1 text-xs font-bold text-orange-300">
            Factsheet × Upflow
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">{title}</h1>
          <p className="text-sm text-slate-300">{description}</p>
        </div>

        {children}

        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <Info className="h-4 w-4 shrink-0 text-[#E8531A]" aria-hidden="true" />
          <span>{footer}</span>
        </div>
      </section>
    </main>
  )
}
