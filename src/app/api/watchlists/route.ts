import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const items = await prisma.watchlistItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ items })
  } catch (e) {
    console.error('Watchlist GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { symbol } = await req.json()
    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 })
    }
    const upper = symbol.toUpperCase().trim()
    const item = await prisma.watchlistItem.upsert({
      where: { userId_symbol: { userId: session.user.id, symbol: upper } },
      update: {},
      create: { userId: session.user.id, symbol: upper }
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e) {
    console.error('Watchlist POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol')
    if (!symbol) {
      return NextResponse.json({ error: 'Missing symbol' }, { status: 400 })
    }
    await prisma.watchlistItem.delete({
      where: { userId_symbol: { userId: session.user.id, symbol: symbol.toUpperCase().trim() } }
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Watchlist DELETE error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
