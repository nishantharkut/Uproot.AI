import Email from '@/components/EmailPreview';
import React from 'react';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = async (req) =>{
  try {
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