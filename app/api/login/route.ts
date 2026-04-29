import { NextResponse } from "next/server"

import users from "@/data/login-users.json"

type LoginUser = {
  id: string
  email: string
  password: string
  name: string
}

type LoginPayload = {
  loginId?: unknown
  password?: unknown
}

export async function POST(request: Request) {
  let payload: LoginPayload

  try {
    payload = (await request.json()) as LoginPayload
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const loginId =
    typeof payload.loginId === "string" ? payload.loginId.trim() : ""
  const password = typeof payload.password === "string" ? payload.password : ""

  if (!loginId || !password) {
    return NextResponse.json(
      { ok: false, message: "아이디와 비밀번호를 입력하세요." },
      { status: 400 },
    )
  }

  const normalizedLoginId = loginId.toLowerCase()
  const matchedUser = (users as LoginUser[]).find((user) => {
    const ids = [user.id.toLowerCase(), user.email.toLowerCase()]
    return ids.includes(normalizedLoginId) && user.password === password
  })

  if (!matchedUser) {
    return NextResponse.json(
      { ok: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    )
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: matchedUser.id,
      email: matchedUser.email,
      name: matchedUser.name,
    },
  })
}
