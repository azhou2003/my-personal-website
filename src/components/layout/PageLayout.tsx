import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

const baseLayoutClasses =
  "min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors duration-300";

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showFooter = true,
  className = "",
}) => (
  <div className={`${baseLayoutClasses} ${className}`}>
    <Navbar />
    <main className="flex-1 flex flex-col">{children}</main>
    {showFooter && <Footer />}
  </div>
);

export default PageLayout;
