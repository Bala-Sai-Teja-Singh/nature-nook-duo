'use client';

import Link from 'next/link';
import { Leaf, Globe, MessageCircle, Share2, Mail, MapPin, Phone, ArrowUp } from 'lucide-react';

import { usePathname } from 'next/navigation';

export function Footer({ forceShow = false }: { forceShow?: boolean }) {
  const pathname = usePathname();

  // Don't show footer on admin pages, but show on all other pages
  if (pathname.startsWith('/admin')) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-primary dark:bg-zinc-950 text-white pt-24 pb-8 mt-auto overflow-hidden">
      {/* Background SVG Wave (Top) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg className="relative block w-full h-[50px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-background"></path>
        </svg>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10">
                <Leaf className="h-6 w-6 text-accent" />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight text-white">
                Nature's Nook Duo
              </span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              Your premier destination for exotic pets, premium supplies, and expert care guidance. We bring nature closer to you.
            </p>
          </div>
          {/* Quick Links */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-heading text-lg font-semibold text-white mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-accent rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2"><ArrowUp className="h-3 w-3 rotate-45" /> Shop Pets</Link></li>
              <li><Link href="/care-guides" className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2"><ArrowUp className="h-3 w-3 rotate-45" /> Care Guides</Link></li>
              <li><Link href="/cart" className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2"><ArrowUp className="h-3 w-3 rotate-45" /> Cart</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2 lg:col-span-1 space-y-4">
            <h3 className="font-heading text-lg font-semibold text-white mb-6 relative inline-block">
              Newsletter
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-accent rounded-full"></span>
            </h3>
            <p className="text-white/80 text-sm">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <input type="email" placeholder="Email" className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                Subscribe
              </button>
            </div>
            <div className="flex gap-4 pt-4">
              <a href="#" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-primary-foreground transition-colors"><Globe className="h-4 w-4" /></a>
              <a href="#" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-primary-foreground transition-colors"><MessageCircle className="h-4 w-4" /></a>
              <a href="#" className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-primary-foreground transition-colors"><Share2 className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-white mb-6 relative inline-block">
              Get in Touch
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-accent rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm">123 Nature Boulevard, Suite 400<br/>Green City, GC 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent shrink-0" />
                <span className="text-white/80 text-sm">1-800-NATURE-NOOK</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <span className="text-white/80 text-sm">support@naturenookduo.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Nature's Nook Duo. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm hidden sm:inline-block">Built with passion for nature.</span>
            <button 
              onClick={scrollToTop}
              className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all group"
              title="Back to top"
            >
              <ArrowUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
