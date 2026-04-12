import React from "react";
import { searchBarClasses } from "./styles/searchBarStyles";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder, className = "" }) => (
  <div className="relative w-full max-w-md">
    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-border-light dark:text-border-dark" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={searchBarClasses + (className ? " " + className : "")}
    />
  </div>
);

export default SearchBar;
