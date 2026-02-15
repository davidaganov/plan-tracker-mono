import crypto from "node:crypto"

export type TelegramInitDataUser = {
  id: number
  is_bot?: boolean
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export type TelegramInitData = {
  query_id?: string
  user?: TelegramInitDataUser
  receiver?: TelegramInitDataUser
  auth_date?: number
  hash: string
}

const parseInitData = (initDataRaw: string): Record<string, string> => {
  const params = new URLSearchParams(initDataRaw)
  const out: Record<string, string> = {}

  params.forEach((value, key) => {
    out[key] = value
  })

  return out
}

export const verifyTelegramInitData = (initDataRaw: string, botToken: string): TelegramInitData => {
  const data = parseInitData(initDataRaw)
  const hash = data.hash
  if (!hash) throw new Error("Missing hash")

  const checkString = Object.keys(data)
    .filter((k) => k !== "hash")
    .sort((a, b) => a.localeCompare(b))
    .map((k) => `${k}=${data[k]}`)
    .join("\n")

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest()
  const expectedHash = crypto.createHmac("sha256", secretKey).update(checkString).digest("hex")

  if (expectedHash !== hash) throw new Error("Invalid initData hash")

  const parsed: TelegramInitData = {
    hash
  }

  if (data.query_id) parsed.query_id = data.query_id

  if (data.auth_date) {
    const authDate = Number(data.auth_date)
    if (!Number.isFinite(authDate)) throw new Error("Invalid auth_date")
    parsed.auth_date = authDate
  }

  if (data.user) {
    try {
      parsed.user = JSON.parse(data.user) as TelegramInitDataUser
    } catch {
      throw new Error("Invalid user JSON")
    }
  }

  if (data.receiver) {
    try {
      parsed.receiver = JSON.parse(data.receiver) as TelegramInitDataUser
    } catch {
      throw new Error("Invalid receiver JSON")
    }
  }

  return parsed
}
