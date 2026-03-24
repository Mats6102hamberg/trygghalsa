import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic();

export { anthropic };

/**
 * Wraps an Anthropic API call with rate limit and error handling.
 * Returns either the successful message or a NextResponse error.
 */
export async function callAI(
  options: Anthropic.MessageCreateParamsNonStreaming
): Promise<
  | { ok: true; text: string }
  | { ok: false; response: NextResponse }
> {
  try {
    const message = await anthropic.messages.create(options);

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Inget svar från AI.' },
          { status: 500 }
        ),
      };
    }

    return { ok: true, text: textBlock.text };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      const retryAfter = err.headers?.get?.('retry-after') ?? null;
      const headers: Record<string, string> = {};
      if (retryAfter) headers['Retry-After'] = retryAfter;

      return {
        ok: false,
        response: NextResponse.json(
          { error: 'AI-tjänsten är tillfälligt överbelastad. Försök igen om en stund.' },
          { status: 429, headers }
        ),
      };
    }

    if (err instanceof Anthropic.APIError) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'AI-tjänsten är inte tillgänglig just nu. Försök igen senare.' },
          { status: 502 }
        ),
      };
    }

    return {
      ok: false,
      response: NextResponse.json(
        { error: err instanceof Error ? err.message : 'AI request failed' },
        { status: 500 }
      ),
    };
  }
}
