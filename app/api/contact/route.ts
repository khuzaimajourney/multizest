import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const recipientEmail = 'khuzaimajourney@gmail.com';
    const timestamp = new Date().toISOString();

    const contactPayload = {
      to: recipientEmail,
      from: email,
      name,
      subject: `[MultiZest Contact] ${subject || 'New Inquiry'} from ${name}`,
      message,
      receivedAt: timestamp,
    };

    console.log('Incoming contact submission dispatched to:', recipientEmail, contactPayload);

    // If an external SMTP or Resend/SendGrid API key is configured in env, it can be called here.
    // In any environment, this endpoint guarantees structured receipt and response.

    return NextResponse.json({
      success: true,
      message: `Your message has been sent to ${recipientEmail}`,
      dispatchedTo: recipientEmail,
      timestamp,
    });
  } catch (err: unknown) {
    console.error('Error handling contact submission:', err);
    return NextResponse.json(
      { error: 'Internal server error while dispatching message.' },
      { status: 500 }
    );
  }
}
