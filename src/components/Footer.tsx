import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Footer = () => (
  <footer className="w-full flex flex-col items-center justify-center py-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-xs gap-2">
    <div className="flex gap-6 mb-1">
      <a href="mailto:anjie.zhou2003@gmail.com" aria-label="Email">
        <FaEnvelope className="w-6 h-6 text-accent-sage hover:text-accent-yellow transition-colors" />
      </a>
      <a href="https://github.com/azhou2003" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <FaGithub className="w-6 h-6 text-accent-sage hover:text-accent-yellow transition-colors" />
      </a>
      <a href="https://www.linkedin.com/in/anjiezhouhtx/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <FaLinkedin className="w-6 h-6 text-accent-sage hover:text-accent-yellow transition-colors" />
      </a>
    </div>
    <span className="text-border-light dark:text-border-dark">© {new Date().getFullYear()} Anjie</span>
  </footer>
);

export default Footer;
