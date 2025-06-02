import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Image from "next/image";

export const metadata = {
  title: "Home | Anjie Zhou",
  description: "Get to know Anjie Zhou",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 gap-8">
        <Image
          src="/next.svg"
          alt="Profile picture"
          width={120}
          height={120}
          className="rounded-full border border-border-light dark:border-border-dark mb-4"
          priority
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 font-sans">
          Anjie
        </h1>
        <h2 className="text-lg sm:text-xl font-medium text-center mb-4 font-sans">
          Computer Science, Cybersecurity, and Counter-Strike
        </h2>
        <p className="max-w-xl text-center text-base sm:text-lg font-sans mb-4">
          I do software development. Welcome to my minimalist portfolio and blog.
        </p>
        <a
          href="/portfolio"
          className="mt-2 px-6 py-2 rounded-full bg-accent-sage text-foreground-light dark:text-foreground-dark font-semibold shadow hover:bg-accent-yellow transition-colors"
        >
          View My Work
        </a>
        <div className="flex flex-col items-center gap-2 mt-8">
          <span className="text-sm text-foreground-light/70 dark:text-foreground-dark/70">
            Contact & Socials
          </span>
          <div className="flex gap-4">
            <a
              href="mailto:your@email.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Email
            </a>
            <a
              href="https://linkedin.com/in/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.faceit.com/en/players/yourfaceit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Faceit
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
