const Footer = () => (
  <footer className="w-full flex flex-col items-center justify-center py-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-xs gap-2">
    <div className="flex gap-4">
      <a href="mailto:your@email.com" target="_blank" rel="noopener noreferrer">Email</a>
      <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://www.faceit.com/en/players/yourfaceit" target="_blank" rel="noopener noreferrer">Faceit</a>
    </div>
    <span className="text-border-light dark:text-border-dark">© {new Date().getFullYear()} Anjie</span>
  </footer>
);

export default Footer;
