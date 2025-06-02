import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import IconLink from "./IconLink";

const Footer = () => (
  <footer className="w-full flex flex-col items-center justify-center py-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-xs gap-2">
    <div className="flex gap-6 mb-1">
      <IconLink href="mailto:anjie.zhou2003@gmail.com" aria-label="Email" icon={<FaEnvelope />} />
      <IconLink
        href="https://github.com/azhou2003"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        icon={<FaGithub />}
      />
      <IconLink
        href="https://www.linkedin.com/in/anjiezhouhtx/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        icon={<FaLinkedin />}
      />
    </div>
    <span className="text-border-light dark:text-border-dark">© {new Date().getFullYear()} Anjie Zhou</span>
  </footer>
);

export default Footer;
