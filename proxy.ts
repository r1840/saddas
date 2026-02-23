import { NextRequest, NextResponse } from 'next/server'

const securityCookieName = 'cv_human'
const securityCookieTtlMs = 7 * 24 * 60 * 60 * 1000

const hardBlockedBotPatterns = [
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baiduspider/i,
  /duckduckbot/i,
  /slurp/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /applebot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /crawler/i,
  /spider/i,
  /scrapy/i,
]

const automationPatterns = [
  /headless/i,
  /phantom/i,
  /selenium/i,
  /playwright/i,
  /puppeteer/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /httpclient/i,
  /postman/i,
  /insomnia/i,
]

function buildCookieValue(request: NextRequest) {
  const ts = Date.now().toString()
  const hint = (request.headers.get('user-agent') || '').slice(0, 16).replace(/[^a-zA-Z0-9]/g, '')
  const rand = Math.random().toString(36).slice(2, 12)
  return `${ts}.${hint}.${rand}`
}

function isValidSecurityCookie(raw: string | undefined) {
  if (!raw) return false
  const parts = raw.split('.')
  if (parts.length !== 3) return false
  const ts = Number(parts[0])
  if (!ts) return false
  if (Date.now() - ts > securityCookieTtlMs) return false
  return true
}

function isApiPath(pathname: string) {
  return pathname.startsWith('/api/')
}

function isBypassPath(pathname: string) {
  return pathname.startsWith('/_next/') || pathname === '/favicon.ico' || pathname === '/robots.txt'
}

function suspiciousScore(request: NextRequest, userAgent: string) {
  let score = 0
  const pathname = request.nextUrl.pathname
  const accept = request.headers.get('accept') || ''
  const secFetchSite = request.headers.get('sec-fetch-site') || ''
  const secFetchDest = request.headers.get('sec-fetch-dest') || ''
  const secChUa = request.headers.get('sec-ch-ua') || ''
  const origin = request.headers.get('origin') || ''
  const referer = request.headers.get('referer') || ''

  if (!userAgent || userAgent.length < 12) score += 2
  if (automationPatterns.some((p) => p.test(userAgent))) score += 4
  if (!secChUa) score += 1

  if (isApiPath(pathname)) {
    if (!origin && !referer) score += 2
    if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'same-site') score += 2
  } else {
    if (!accept.includes('text/html')) score += 2
    if (secFetchDest && secFetchDest !== 'document') score += 1
  }

  return score
}

function applyGlobalHeaders(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate')
  response.headers.set('Referrer-Policy', 'same-origin')
}

function applySecurityCookie(response: NextResponse, request: NextRequest) {
  const secure = request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https'
  response.cookies.set({
    name: securityCookieName,
    value: buildCookieValue(request),
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: Math.floor(securityCookieTtlMs / 1000),
  })
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (isBypassPath(pathname)) {
    return NextResponse.next()
  }

  const userAgent = request.headers.get('user-agent') || ''
  const hardBlocked = hardBlockedBotPatterns.some((p) => p.test(userAgent))

  if (hardBlocked) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const hasValidCookie = isValidSecurityCookie(request.cookies.get(securityCookieName)?.value)
  const score = suspiciousScore(request, userAgent)

  if (isApiPath(pathname)) {
    if (score >= 4 && !hasValidCookie) {
      const response = NextResponse.json({ error: 'verification_required' }, { status: 429 })
      applyGlobalHeaders(response)
      return response
    }

    const response = NextResponse.next()
    applyGlobalHeaders(response)
    return response
  }

  if (pathname !== '/verify-human' && score >= 4 && !hasValidCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/verify-human'
    url.searchParams.set('returnTo', `${request.nextUrl.pathname}${request.nextUrl.search}`)
    const response = NextResponse.redirect(url)
    applyGlobalHeaders(response)
    return response
  }

  const response = NextResponse.next()
  applyGlobalHeaders(response)

  if (!hasValidCookie || pathname === '/verify-human') {
    applySecurityCookie(response, request)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
