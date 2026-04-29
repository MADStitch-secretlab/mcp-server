"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"

import type { SearchParamEntries } from "@/lib/search-params"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const COMPANIES = [
  { code: "AZFLOW", name: "AZFLOW Investment Partners" },
  { code: "DEMO_CAP", name: "Demo Capital" },
  { code: "TEST_VC", name: "Test Ventures" },
]

export default function CompanySelector({
  initialParams,
}: {
  initialParams: SearchParamEntries
}) {
  const params = useMemo(() => new URLSearchParams(initialParams), [initialParams])
  const [selected, setSelected] = useState(COMPANIES[0].code)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleSubmit() {
    setLoading(true)
    setError("")

    const redirectUri = params.get("redirect_uri") || ""
    const state = params.get("state") || ""

    if (!redirectUri) {
      const message = "redirect_uri가 없습니다. 직접 접근한 경우입니다."
      window.alert(message)
      setError(message)
      setLoading(false)
      return
    }

    try {
      const url = new URL(redirectUri)
      url.searchParams.set("code", `fake_code_${Date.now()}`)
      url.searchParams.set("state", state)
      url.searchParams.set("company_code", selected)

      window.location.href = url.toString()
    } catch {
      const message = "redirect_uri 형식이 올바르지 않습니다."
      window.alert(message)
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 rounded-xl bg-white p-8 shadow-2xl">
      <RadioGroup value={selected} onValueChange={setSelected}>
        {COMPANIES.map((company) => (
          <Label
            key={company.code}
            htmlFor={company.code}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-slate-900 transition hover:bg-slate-50",
              selected === company.code && "border-[#E8531A] bg-orange-50",
            )}
          >
            <RadioGroupItem value={company.code} id={company.code} />
            <span className="flex-1 text-sm font-medium leading-5">
              {company.name}
            </span>
          </Label>
        ))}
      </RadioGroup>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="h-12 w-full bg-[#E8531A] text-base font-semibold text-white hover:bg-[#cc4212]"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            처리 중...
          </>
        ) : (
          <>
            선택 완료
            <ArrowRight aria-hidden="true" />
          </>
        )}
      </Button>
    </div>
  )
}
