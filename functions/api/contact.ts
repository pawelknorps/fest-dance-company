export async function onRequestPost(context: { request: Request; env: any }) {
  try {
    const { request, env } = context
    const body = await request.json()

    // Verify Turnstile only when production secrets and a client token are present.
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
        return new Response(JSON.stringify({ error: 'Weryfikacja bota nie powiodła się.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    // 2. Wysyłka e-maila przez Resend API
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FEST Dance Company <onboarding@resend.dev>', // Wymaga konfiguracji własnej domeny w produkcji
        to: 'festdancecompany@gmail.com',
        subject: `Nowe zapytanie: ${body.name}`,
        html: `
          <h3>Nowe zapytanie ofertowe</h3>
          <p><strong>Imię i nazwisko:</strong> ${body.name}</p>
          <p><strong>Firma / Artysta:</strong> ${body.company || 'Nie podano'}</p>
          <p><strong>E-mail:</strong> ${body.email}</p>
          <p><strong>Orientacyjny termin:</strong> ${body.deadline}</p>
          <p><strong>Opis / Brief:</strong></p>
          <p style="white-space: pre-wrap;">${body.brief}</p>
        `,
      }),
    })

    if (!resendRes.ok) {
      const errorText = await resendRes.text()
      console.error('Resend API Error:', errorText)
      throw new Error('Błąd API pocztowego')
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Server Error:', error)
    return new Response(JSON.stringify({ error: 'Wewnętrzny błąd serwera.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
