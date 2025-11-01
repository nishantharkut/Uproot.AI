import Email from '@/components/EmailPreview';
import React from 'react';
import { Resend } from 'resend';

// Only create Resend instance if API key is available
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const POST = async (req) =>{
  try {
    // Check if Resend is configured
    if (!resend) {
      return Response.json(
        { error: 'Email service is not configured. Please set RESEND_API_KEY in environment variables.' },
        { status: 503 }
      );
    }

    const { email, name, company, phone, message, role } = await req.json();
    const res = await resend.emails.send({
    from: 'S <onboarding@resend.dev>',
    to: 'abpriyanshu007@gmail.com',
    subject: `Contact for ${role} from ${name}`,
    react: React.createElement(Email, {
      email: email,
      name: name,
      company: company,
      phone: phone,
      message: message,
      role: role,
      }),
    });

    console.log(
      `Email sent to ${email} with name ${name} and company ${company} with phone ${phone} and message ${message} and role ${role}`
    );

    console.log(res);

    return Response.json(res);
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}