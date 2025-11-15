'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Newspaper, MapPin, PlusCircle, Menu, X } from 'lucide-react';
import { Button } from '@mtaa/ui';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Newspaper className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Mtaa News</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
              Home
            </Link>
            <Link href="/locations" className="text-gray-700 hover:text-primary-600 font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Locations
            </Link>
            <Link href="/businesses" className="text-gray-700 hover:text-primary-600 font-medium">
              Businesses
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-primary-600 font-medium">
              Events
            </Link>
            <Link href="/submit" className="text-gray-700 hover:text-primary-600 font-medium flex items-center">
              <PlusCircle className="h-4 w-4 mr-1" />
              Submit Story
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button size="sm">Subscribe</Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-200">
            <Link href="/" className="block text-gray-700 hover:text-primary-600 font-medium">
              Home
            </Link>
            <Link href="/locations" className="block text-gray-700 hover:text-primary-600 font-medium">
              Locations
            </Link>
            <Link href="/businesses" className="block text-gray-700 hover:text-primary-600 font-medium">
              Businesses
            </Link>
            <Link href="/events" className="block text-gray-700 hover:text-primary-600 font-medium">
              Events
            </Link>
            <Link href="/submit" className="block text-gray-700 hover:text-primary-600 font-medium">
              Submit Story
            </Link>
            <Button size="sm" className="w-full">Subscribe</Button>
          </div>
        )}
      </div>
    </nav>
  );
}
