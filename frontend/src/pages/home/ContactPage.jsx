import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We will get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSubmitting(false);
  };

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-primary-900 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
            Contact Us
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-primary-100">
            We'd love to hear from you. Get in touch with our team.
          </motion.p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" />
                  <input type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field" />
                </div>
                <input type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required className="input-field" />
                <textarea rows="5" placeholder="Your Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="input-field"></textarea>
                <button type="submit" disabled={submitting} className="btn-primary flex items-center space-x-2">
                  <FiSend /> <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  {[
                    { icon: FiPhone, label: 'Phone', value: '+91 1800-123-4567' },
                    { icon: FiMail, label: 'Email', value: 'support@stayease.com' },
                    { icon: FiMapPin, label: 'Address', value: 'NIT, Jamshedpur, India' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Monday - Friday</span><span>9:00 AM - 6:00 PM</span></div>
                  <div className="flex justify-between"><span>Saturday</span><span>10:00 AM - 4:00 PM</span></div>
                  <div className="flex justify-between"><span>Sunday</span><span>Closed</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;