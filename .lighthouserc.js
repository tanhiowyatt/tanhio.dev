module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/projects'
      ],
      startServerCommand: 'npm start',
      startServerReadyPattern: 'Server running',
      waitOnInsecure: true,
      numberOfRuns: 1,
      chromeFlags: '--no-sandbox --headless --disable-gpu --disable-dev-shm-usage',
      settings: {
        // Inject "Lighthouse" into UA so loading.js bot-detection works correctly
        emulatedUserAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Lighthouse',
        // Give the page extra time to paint after navigation
        pauseAfterFcpMs: 1000,
        pauseAfterLoadMs: 1000,
        maxWaitForFcp: 15000,
        maxWaitForLoad: 45000,
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
  },
};

