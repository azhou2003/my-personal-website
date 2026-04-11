const Footer: React.FC = () => (
  <footer className="w-full flex flex-col items-center justify-center py-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-xs gap-2">
    <span className="text-border-light dark:text-border-dark">© {new Date().getFullYear()} Anjie Zhou</span>
  </footer>
);

export default Footer;
