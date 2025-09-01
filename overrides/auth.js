// Client-side authentication handler
class DocsAuth {
  constructor() {
    this.supabaseUrl = 'https://cdwtsrzshpotkfbyyyjk.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd3RzcnpzaHBvdGtmYnl5eWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjQxNzMsImV4cCI6MjA2NDA0MDE3M30.n6qYEgtmWapgLOyuLva_o6-mBXnxkxIdbVFxxlSEcR4';
    this.dashboardUrl = 'https://dashboard.moc-iot.com';
    this.checkAuth();
  }

  async checkAuth() {
    // Skip auth check in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Development mode - skipping auth check');
      return;
    }

    try {
      // Get token from localStorage (set by dashboard)
      const token = localStorage.getItem('supabase.auth.token');
      
      if (!token) {
        this.redirectToLogin();
        return;
      }

      // Parse token to get actual access token
      let accessToken;
      try {
        const tokenData = JSON.parse(token);
        accessToken = tokenData.access_token;
      } catch (e) {
        this.redirectToLogin();
        return;
      }

      if (!accessToken) {
        this.redirectToLogin();
        return;
      }

      // Check authentication with our API
      const response = await fetch('/api/auth-check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!result.authenticated) {
        this.redirectToLogin();
        return;
      }

      if (!result.isDeveloper) {
        this.showAccessDenied();
        return;
      }

      // User is authenticated and has developer access
      console.log('Authentication successful');
      
    } catch (error) {
      console.error('Auth check failed:', error);
      this.redirectToLogin();
    }
  }

  redirectToLogin() {
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `${this.dashboardUrl}/auth?redirect=${currentUrl}`;
  }

  showAccessDenied() {
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-align: center;
        padding: 2rem;
      ">
        <div style="max-width: 500px;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Access Denied</h1>
          <p style="color: #6b7280; margin-bottom: 2rem; line-height: 1.6;">
            You don't have developer access to view this documentation. 
            Please contact your administrator to request developer permissions.
          </p>
          <a href="${this.dashboardUrl}" style="
            background: #2563eb;
            color: white;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 0.5rem;
            display: inline-block;
            transition: background-color 0.2s;
          " onmouseover="this.style.backgroundColor='#1d4ed8'" 
             onmouseout="this.style.backgroundColor='#2563eb'">
            Return to Dashboard
          </a>
        </div>
      </div>
    `;
  }
}

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new DocsAuth());
} else {
  new DocsAuth();
}