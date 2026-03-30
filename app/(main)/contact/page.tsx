'use client';

import { ParallaxFloat } from '@/components/motion/ParallaxFloat';
import { useState } from 'react';
import { contactApi } from '@/lib/api';
import { Loader2, Mail, Send } from 'lucide-react';

const QUERY_TYPES = ['General', 'Support', 'Billing', 'Partnership', 'Other'];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [queryType, setQueryType] = useState('General');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await contactApi.submit({
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim() || undefined,
        queryType,
        message: message.trim(),
      });
      setDone(true);
      setName('');
      setEmail('');
      setMobile('');
      setMessage('');
    } catch {
      alert('Could not send your message. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative min-h-screen py-24 px-4 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(45, 212, 191, 0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(59, 130, 246, 0.2), transparent 50%), hsl(var(--background))',
        }}
      />
      <ParallaxFloat
        distance={64}
        scrollRange={[0, 400]}
        className="pointer-events-none absolute top-24 left-[4%] -z-10 hidden h-32 w-40 rounded-2xl border border-border/40 bg-card/25 shadow-lg backdrop-blur-md md:block"
      />
      <ParallaxFloat
        distance={96}
        distanceX={12}
        scrollRange={[0, 400]}
        className="pointer-events-none absolute bottom-32 right-[6%] -z-10 hidden h-28 w-48 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md md:block"
      />
      <div className="container mx-auto max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-surface border border-white/20 dark:border-white/10 mb-4 shadow-lg">
            <Mail className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Contact us</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Tell us what you need. We read every message and reply as soon as we can.
          </p>
        </div>

        <div className="glass-surface rounded-3xl border border-white/25 dark:border-white/10 p-8 md:p-10 shadow-xl">
          {done ? (
            <div className="text-center py-8">
              <p className="text-lg font-medium text-foreground mb-2">Thanks — we got your message.</p>
              <p className="text-sm text-muted-foreground">We&apos;ll get back to you at the email you provided.</p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-6 text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/80 dark:bg-background/60 text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/80 dark:bg-background/60 text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Mobile (optional)</label>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/80 dark:bg-background/60 text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    placeholder="+91 …"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-foreground">Topic</label>
                  <select
                    value={queryType}
                    onChange={(e) => setQueryType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/80 dark:bg-background/60 text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                  >
                    {QUERY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background/80 dark:bg-background/60 text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-teal-500/40 resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-95 disabled:opacity-60 shadow-lg"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
