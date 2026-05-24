'use client';

import Link from 'next/link';
import { Leaf, Globe, MessageCircle, Share2, Mail, MapPin, Phone } from 'lucide-react';

import { usePathname } from 'next/navigation';

export function Footer({ forceShow = false }: { forceShow?: boolean }) {
  const pathname = usePathname();

  // Only show footer on the home page as requested
  if (pathname !== '/' && !forceShow) return null;

  return (
    <footer className="bg-primary dark:bg-zinc-950 text-white pt-16 pb-8 border-t border-white/10 dark:border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10">
                <Leaf className="h-6 w-6 text-accent" />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight text-white">
                Nature Nook
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
              <li><Link href="/shop" className="text-white/80 hover:text-white transition-colors text-sm">Shop Pets</Link></li>
              <li><Link href="/care-guides" className="text-white/80 hover:text-white transition-colors text-sm">Care Guides</Link></li>
              <li><Link href="/cart" className="text-white/80 hover:text-white transition-colors text-sm">Cart</Link></li>
            </ul>
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
            &copy; {new Date().getFullYear()} Nature Nook Duo. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Built with passion for nature.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
