"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"

import type { SearchParamEntries } from "@/lib/search-params"
import {
  createOAuthParams,
  getEffectiveOAuthParams,
  getCallbackTarget,
  getLoginSession,
  hasCallbackTarget,
  saveOAuthParams,
} from "@/lib/oauth-params"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const COMPANIES = [
  { code: "fsinv", name: "Factsheet Investment" },
  { code: "azflow", name: "에이지플로우" },
  { code: "vsventures", name: "벤처스퀘어" },
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
  const hasIncomingCallback = hasCallbackTarget(incomingParams)
  const [selected, setSelected] = useState(COMPANIES[0].code)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    saveOAuthParams(incomingParams)
  }, [incomingParams])

  async function handleSubmit() {
    setLoading(true)
    setError("")

    const params = getEffectiveOAuthParams(initialParams)
    const cb = params.get("cb") || ""
    const callbackTarget = getCallbackTarget(params)

    if (!callbackTarget) {
      const message =
        "cb 또는 redirectUrl이 없습니다. Claude Desktop 연결부터 다시 시작해주세요."
      setError(message)
      setLoading(false)
      return
    }

    saveOAuthParams(params)

    if (!cb) {
      window.location.href = callbackTarget
      return
    }

    const loginSession = getLoginSession()

    if (!loginSession) {
      setError("로그인 세션이 없습니다. 로그인부터 다시 진행해주세요.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(cb, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: loginSession.accessToken,
          refreshToken: loginSession.refreshToken,
          companyCode: selected,
        }),
      })
      const result = (await response.json().catch(() => ({}))) as {
        error?: string
        error_description?: string
        redirect_url?: string
      }

      if (response.ok && result.redirect_url) {
        window.location.href = result.redirect_url
        return
      }

      setError(
        result.error_description ||
          result.error ||
          "MCP 콜백 처리 중 오류가 발생했습니다.",
      )
      setLoading(false)
    } catch {
      setError("MCP 콜백 서버로 로그인 결과를 전송하지 못했습니다.")
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
      ) : !hasIncomingCallback ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          현재 URL에는 cb 또는 redirectUrl이 없습니다. 이전 로그인 단계에서
          받은 값이 있으면 자동으로 복구합니다.
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
