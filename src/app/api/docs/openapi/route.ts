import { NextRequest, NextResponse } from 'next/server'
import { apiDocGenerator } from '@/lib/api-documentation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    let content: string
    let contentType: string

    if (format === 'yaml') {
      content = apiDocGenerator.exportAsYAML()
      contentType = 'application/x-yaml'
    } else {
      content = apiDocGenerator.exportAsJSON()
      contentType = 'application/json'
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="nohvex-api.${format}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('API documentation generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate API documentation'
      },
      { status: 500 }
    )
  }
}