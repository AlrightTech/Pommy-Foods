import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)

    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get statistics
    const [
      totalOrders,
      pendingApprovals,
      activeStores,
      totalRevenue,
      recentOrders,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Pending approvals (DRAFT and PENDING_APPROVAL)
      prisma.order.count({
        where: {
          status: {
            in: ['DRAFT', 'PENDING_APPROVAL'],
          },
        },
      }),

      // Active stores
      prisma.store.count({
        where: {
          isActive: true,
        },
      }),

      // Total revenue (from delivered orders)
      prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
        },
        _sum: {
          totalAmount: true,
        },
      }),

      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          store: {
            select: {
              name: true,
            },
          },
        },
      }),
    ])

    // Order status breakdown
    const orderStatusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    const statusBreakdown = orderStatusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        pendingApprovals,
        activeStores,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        recentOrders,
        statusBreakdown,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

