import React from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <SectionHeader title="Get in Touch" subtitle="We're here for you" className="items-center" />
        <p className="text-lg text-on-surface-variant font-body mt-6 max-w-2xl mx-auto">
          Whether you have a question about our itineraries, pricing, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container text-primary flex items-center justify-center mb-2">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface">Email Us</h3>
            <p className="text-on-surface-variant font-body text-sm">Our friendly team is here to help.</p>
            <a href="mailto:hello@smarttravel.com" className="font-body font-semibold text-primary hover:underline mt-2">hello@smarttravel.com</a>
          </GlassCard>
          
          <GlassCard className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center mb-2">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface">Office</h3>
            <p className="text-on-surface-variant font-body text-sm">Come say hello at our HQ.</p>
            <p className="font-body font-semibold text-primary mt-2">100 Ethereal Way<br/>San Francisco, CA 94107</p>
          </GlassCard>

          <GlassCard className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-tertiary flex items-center justify-center mb-2">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl text-on-surface">Phone</h3>
            <p className="text-on-surface-variant font-body text-sm">Mon-Fri from 8am to 5pm.</p>
            <a href="tel:+15550000000" className="font-body font-semibold text-primary hover:underline mt-2">+1 (555) 000-0000</a>
          </GlassCard>
        </div>

        <div className="lg:col-span-2">
          <GlassCard className="h-full p-8 md:p-12">
            <h3 className="text-3xl font-display font-bold text-on-surface mb-8">Send us a message</h3>
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">First Name</label>
                  <input type="text" className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body" placeholder="Jane" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Last Name</label>
                  <input type="text" className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body" placeholder="Doe" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
                <input type="email" className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body" placeholder="jane@example.com" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Message</label>
                <textarea rows="4" className="bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <Button variant="primary" className="mt-4 w-full md:w-auto self-start">
                Send Message <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
