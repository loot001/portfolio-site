import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Parse query string parameters
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  console.log('Draft route called with:', { secret, slug })

  // Check the secret
  if (!secret || secret !== process.env.SANITY_STUDIO_PREVIEW_SECRET) {
    console.log('Invalid secret:', secret)
    return new Response('Invalid token', { status: 401 })
  }

  // Enable Draft Mode
  const draft = await draftMode()
  draft.enable()
  
  console.log('Draft mode enabled, redirecting to:', slug || '/')

  // Redirect to the path
  redirect(slug || '/')
}
