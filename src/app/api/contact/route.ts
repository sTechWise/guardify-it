import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json()

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        // TODO: Integrate with email service (Resend, SendGrid, etc.)
        // For now, just log the message and return success
        console.log('Contact form submission:', { name, email, subject, message })

        // Example with Resend (uncomment and add RESEND_API_KEY to .env):
        /*
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
            from: 'Guardify IT <noreply@guardifyit.com>',
            to: 'support@guardifyit.com',
            subject: `[Contact Form] ${subject} - ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        })
        */

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Contact API error:', error)
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        )
    }
}
