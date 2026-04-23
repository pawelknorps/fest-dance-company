export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const { request, env } = context
    const body = await request.json()

    // 1. Weryfikacja Turnstile (opcjonalna, jeśli klucze są w env)
    if (env.TURNSTILE_SECRET_KEY && body.turnstileToken) {
      const turnstileData = new FormData()
      turnstileData.append('secret', env.TURNSTILE_SECRET_KEY)
      turnstileData.append('response', body.turnstileToken)

      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: turnstileData,
      })
      const turnstileOutcome: { success?: boolean } = await turnstileRes.json()

      if (!turnstileOutcome.success) {
        return new Response(JSON.stringify({ error: 'Weryfikacja Turnstile nie powiodła się.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // 2. Przygotowanie danych dla Resend
    // UWAGA: 'onboarding@resend.dev' działa TYLKO dla adresu e-mail Twojego konta w Resend.
    // Aby wysyłać z własnej domeny, musisz ją zweryfikować w panelu Resend.
    const resendApiKey = env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY')
      return new Response(JSON.stringify({ error: 'Brak konfiguracji serwera pocztowego.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
        <h2 style="color: #a83fff; border-bottom: 2px solid #f4f4f4; padding-bottom: 10px;">Nowe zapytanie: FEST Dance Company</h2>
        <p>Otrzymałeś nowe zapytanie ze strony internetowej:</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f4f4f4; font-weight: bold; width: 150px;">Imię i nazwisko:</td>
            <td style="padding: 10px; border-bottom: 1px solid #f4f4f4;">${body.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f4f4f4; font-weight: bold;">Firma / Artysta:</td>
            <td style="padding: 10px; border-bottom: 1px solid #f4f4f4;">${body.company || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f4f4f4; font-weight: bold;">E-mail:</td>
            <td style="padding: 10px; border-bottom: 1px solid #f4f4f4;"><a href="mailto:${body.email}">${body.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f4f4f4; font-weight: bold;">Termin:</td>
            <td style="padding: 10px; border-bottom: 1px solid #f4f4f4;">${body.deadline}</td>
          </tr>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
          <h3 style="margin-top: 0; font-size: 16px;">Brief / Opis projektu:</h3>
          <p style="white-space: pre-wrap;">${body.brief}</p>
        </div>
        
        <p style="font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #f4f4f4; pt: 10px;">
          Wiadomość wysłana automatycznie z formularza kontaktowego festdancecompany.pl
        </p>
      </div>
    `

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FEST Formularz <onboarding@resend.dev>', 
        to: 'festdancecompany@gmail.com',
        subject: `[Brief] ${body.name} - ${body.company || 'Zapytanie'}`,
        html: emailHtml,
        reply_to: body.email,
      }),
    })

    if (!resendRes.ok) {
      const errorData = await resendRes.json()
      console.error('Resend Error:', errorData)
      return new Response(JSON.stringify({ error: 'Błąd wysyłki e-maila.' }), {
        status: resendRes.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Cloudflare Worker Error:', error)
    return new Response(JSON.stringify({ error: 'Wystąpił nieoczekiwany błąd serwera.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
