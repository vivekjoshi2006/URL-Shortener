'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [url, setUrl] = useState<string>('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Modal toggle state
  const [showModal, setShowModal] = useState(false);

  // Strictly typed input reference
  const inputRef = useRef<HTMLInputElement>(null);

  // Safely check query params using globalThis
  useEffect(() => {
    if (typeof globalThis !== 'undefined') {
      const g = globalThis as any;
      if (g.location?.search) {
        const query = new URLSearchParams(g.location.search);
        if (query.get('error') === 'not-found') {
          setError('The requested short link does not exist or has expired.');
        }
      }
    }
  }, []);

  // Automatically focus on input when the modal mounts
  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortUrl('');
    setCopied(false);

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = (await res.json()) as { code?: string; error?: string };

      if (!res.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      const g = typeof globalThis !== 'undefined' ? (globalThis as any) : null;
      const origin = g?.location?.origin || '';

      setShortUrl(`${origin}/${data.code}`);
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (typeof globalThis !== 'undefined') {
      const g = globalThis as any;
      if (g.navigator?.clipboard) {
        g.navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // Close modal and reset input values
  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
    setShortUrl('');
    setUrl('');
  };

  return (
    <div className="landing-wrapper">
      {/* 1. Navbar Navigation Header */}
      <header className="navbar">
        <div className="nav-container">
          <div className="logo-group">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span className="brand-name">Shorty<span className="dot">.</span></span>
          </div>
          <nav className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <button onClick={() => setShowModal(true)} className="nav-btn">Launch App</button>
          </nav>
        </div>
      </header>

      {/* 2. Hero Section with Modern Centered Layout */}
      <section className="hero-section">
        <div className="hero-container centered">
              
          <h1 className="hero-headline">
            Shorten Your Links. <br />
            <span className="gradient-highlight">Optimize Your Reach.</span>
          </h1>
          
          <p className="hero-subtext">
            Create clean, trackable, and memorable short links in a single click. Elevate your branding, monitor clicks seamlessly, and manage your assets.
          </p>

          {/* Primary Centered Action Button */}
          <button onClick={() => setShowModal(true)} className="hero-cta-btn">
            <span>Shorten Your First Link</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
          
          <div className="hero-checklist horizontal">
            <div className="check-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Built-in SSL security filtering</span>
            </div>
            <div className="check-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Serverless edge execution speed</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid Section */}
      <section id="features" className="features-section">
        <div className="features-header">
          <h2 className="features-title">Engineered for Modern Web</h2>
          <p className="features-subtitle">Everything you need from a modern link redirection service.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon bg-indigo">⚡</div>
            <h3 className="feature-name">Global Redirection</h3>
            <p className="feature-desc">Links execute on edge servers worldwide, ensuring redirect times under 40 milliseconds.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-teal">🛡️</div>
            <h3 className="feature-name">Secure Validation</h3>
            <p className="feature-desc">Automatic domain reputation filtering keeps out spam and dangerous redirection targets.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon bg-pink">📊</div>
            <h3 className="feature-name">Reliable Uptime</h3>
            <p className="feature-desc">Serverless computing backends promise 99.99% availability even during massive traffic spikes.</p>
          </div>
        </div>
      </section>

      {/* 4. Footer Section */}
      <footer className="footer">
        <p>© 2026 Shorty Inc. Created for seamless navigation.</p>
      </footer>

      {/* 5. Modal Overlay Container (Renders on Launch App) */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
            
            <button className="close-btn" onClick={handleCloseModal} aria-label="Close modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 className="card-title">Paste your long link</h2>
            
            <form onSubmit={handleSubmit} className="form">
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </span>
                <input
                  ref={inputRef}
                  type="url"
                  placeholder="https://example.com/"
                  required
                  value={url || ''}
                  onChange={(e: any) => setUrl(e.target.value)}
                  className="input"
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <span className="loader"></span>
                ) : (
                  <>
                    <span>Shorten URL</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </>
                )}
              </button>
            </form>

            {error && <div className="error-box">{error}</div>}

            {shortUrl && (
              <div className="result-container">
                <p className="result-label">Generated Link</p>
                <div className="result-row">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="short-link"
                  >
                    {shortUrl}
                  </a>
                  <button onClick={copyToClipboard} className="copy-btn">
                    {copied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span style={{ color: '#10b981' }}>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}