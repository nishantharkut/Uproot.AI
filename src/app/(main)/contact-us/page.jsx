"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FaEnvelope, FaLinkedin, FaLocationArrow, FaPhone } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { Select } from '@/components/ui/select'
import { toast } from 'sonner'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    role: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      toast.success('Great! Your Email sent successfully');
      console.log('Message sent');
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        transition: {delay: 2.4, duration: 0.4, ease: 'easeIn'}
       }}
      className='py-8'
    >
      <div className='container mx-auto'>
        <div className="flex flex-col xl:flex-row gap-[30px]">
        <div className='xl:h-[54%] order-2 xl:order-none' id='contact'>
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 p-10 bg-black rounded-xl"
          >
            <h2 className="text-4xl text-primary">
              Let&apos;s Work Together
            </h2>
            <p className="text-white/60">
              {" "}
              I&apos;m currently looking for new opportunities, my inbox is always
              open. Whether you have a question or just want to say hi, I&apos;ll
              try my best to get back to you!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="email"
                id="email"
                required
                placeholder="Email address"
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                }}
              />
              <Input
                type="text"
                id="name"
                placeholder='Name'
                required
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                }}
              />
              <Input
                type="text"
                id="company"
                placeholder='Company'
                required
                onChange={(e) => {
                  setFormData({ ...formData, company: e.target.value });
                }}
              />
              <Input
                type="text"
                id="phone"
                placeholder='Phone'
                required
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                }}
              />

            </div>
              <Textarea
                name="message"
                id="message"
                className="h-[200px]"
                placeholder="Let's talk about..."
                required
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                }}
              />  
              <Select
                name="role"
                required
                onValueChange={(value) => {
                  setFormData({ ...formData, role: value });
                }}
              >
              </Select>
            <Button
              type="submit" 
              size={'lg'}
              className="bg-primary hover:bg-primary text-white font-medium"
            >
              Send Message
            </Button>
          </form>
        </div>
        </div>
      </div>
    </motion.section>
  )
}

export default ContactPage