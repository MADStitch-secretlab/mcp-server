"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"

import type { SearchParamEntries } from "@/lib/search-params"
import {
  createOAuthParams,
  getEffectiveOAuthParams,
  hasRedirectUrl,
  saveOAuthParams,
} from "@/lib/oauth-params"
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
  const incomingParams = useMemo(
    () => createOAuthParams(initialParams),
    [initialParams],
  )
  const hasIncomingRedirectUrl = hasRedirectUrl(incomingParams)
  const [selected, setSelected] = useState(COMPANIES[0].code)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    saveOAuthParams(incomingParams)
  }, [incomingParams])

  function handleSubmit() {
    setLoading(true)
    setError("")

    const params = getEffectiveOAuthParams(initialParams)
    const redirectUrl = params.get("redirectUrl") || ""

    if (!redirectUrl) {
      const message =
        "redirectUrl이 없습니다. MCP 서버가 로그인 URL에 redirectUrl을 붙여서 호출해야 합니다."
      setError(message)
      setLoading(false)
      return
    }

    saveOAuthParams(params)
    window.location.href = redirectUrl
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
      ) : !hasIncomingRedirectUrl ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          현재 URL에는 redirectUrl이 없습니다. 이전 로그인 단계에서 받은 값이
          있으면 자동으로 복구합니다.
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
