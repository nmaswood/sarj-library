"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "../contexts/LanguageContext";
import "./globals.css";
import MyLibrary from "@/components/MyLibrary";
export default function Home() {

  const [queryClient] = useState(() => new QueryClient());
  return (
    <div className="site-wrapper">
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <header>
            <div className="header-container">
              <h1 className="branding">My Library</h1>
            </div>
          </header>
          <div className="main-content">
            <main className="">
              <MyLibrary />
            </main>
          </div>
          <footer>
            <div className="footer-container">
              &copy; 2024 Sarj AI Library. All rights reserved.
            </div>
          </footer>
        </LanguageProvider>
      </QueryClientProvider>
    </div>
  );
}
