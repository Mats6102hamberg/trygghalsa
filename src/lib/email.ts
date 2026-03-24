import { Resend } from 'resend';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not configured');
  return new Resend(key);
}

const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'TryggHälsa <noreply@trygghalsa.se>';

export async function sendCareInviteEmail({
  to,
  inviterEmail,
  signUpUrl,
}: {
  to: string;
  inviterEmail: string;
  signUpUrl: string;
}) {
  return getResend().emails.send({
    from: fromAddress,
    to,
    subject: 'Du har bjudits in till TryggHälsa',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 16px;">
        <h1 style="font-size: 24px; color: #111827; margin-bottom: 16px;">TryggHälsa</h1>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Hej!
        </p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          <strong>${inviterEmail}</strong> vill dela sin hälsoöversikt med dig via TryggHälsa.
          Som anhörig kan du se om allt verkar OK, om mediciner har tagits och få varningar om något inte stämmer.
        </p>
        <a href="${signUpUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">
          Skapa konto och acceptera
        </a>
        <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 24px;">
          Om du inte förväntade dig detta meddelande kan du ignorera det.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
          TryggHälsa — trygg hälsa för dig och din familj
        </p>
      </div>
    `,
  });
}
