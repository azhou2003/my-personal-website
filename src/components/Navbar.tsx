import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => (
  <nav className="w-full flex items-center justify-between py-4 px-6 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark sticky top-0 z-50 transition-colors">
    <div className="flex items-center gap-3">
      <Link href="/">
        <span className="font-bold text-lg">Anjie</span>
      </Link>
    </div>
    <div className="flex items-center gap-6">
      <Link href="/portfolio" className="hover:underline">Portfolio</Link>
      <Link href="/blog" className="hover:underline">Blog</Link>
      <DarkModeToggle />
    </div>
  </nav>
);

export default Navbar;
