"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email sending functionality
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-dark-700 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
          Contact Us
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Get In Touch
              </h2>
              <p className="text-gray-300 mb-6">
                Have questions about our products or need a custom design? We&apos;d love to hear from you!
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-primary-400 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Email</h3>
                    <a
                      href="mailto:brandon@cloudsculptordesigns.com"
                      className="text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      brandon@cloudsculptordesigns.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <MessageSquare className="w-6 h-6 text-primary-400 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Etsy Shop</h3>
                    <a
                      href="https://cloudsculptordesigns.etsy.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Visit our Etsy store
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                Business Hours
              </h3>
              <p className="text-gray-300">
                We typically respond to inquiries within 24-48 hours during business days.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Send a Message
            </h2>

            {submitted ? (
              <div className="bg-green-900/30 border border-green-700/50 text-green-300 p-4 rounded-lg">
                <p className="font-semibold">Thank you for your message!</p>
                <p className="text-sm mt-1">We&apos;ll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-primary-600/25 flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
