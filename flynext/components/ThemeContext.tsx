"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create context with default values to prevent errors when used outside provider
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {
    console.warn('ThemeContext used outside of ThemeProvider');
  }
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    try {
      // Check if theme is stored in localStorage
      const storedTheme = localStorage.getItem('theme') as Theme;
      
      // Check system preference if no stored theme
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Set initial theme based on stored preference or system preference
      const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
      
      // Apply theme to document
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
    } finally {
      setMounted(true);
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      
      // Update state
      setTheme(newTheme);
      
      // Update localStorage
      localStorage.setItem('theme', newTheme);
      
      // Update DOM directly
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Log for debugging
      console.log('Theme toggled to:', newTheme);
      console.log('HTML classes:', document.documentElement.classList);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // No need to check if context is undefined since we provided default values
  return context;
} 