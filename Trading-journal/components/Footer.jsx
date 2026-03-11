import { Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gradient-to-t from-gray-900 via-black to-black text-gray-400 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Forenotes</h3>
            <p className="text-sm">Master Your Mind, Master The Markets.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#benefits" className="hover:text-white transition-colors">Benefits</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/#faqs" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Connect With Us</h4>
            <p className="text-sm mb-4"><a href="mailto:support@forenotes.com" className="hover:text-white transition-colors">support@forenotes.com</a></p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61584735875154" className="hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="https://www.instagram.com/fore.notes" className="hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="https://x.com/yourForenotes" className="hover:text-white transition-colors"><Twitter size={20} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} Forenotes. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
