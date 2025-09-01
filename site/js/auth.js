// Authentication check for docs site
(function() {
    'use strict';
    
    const DASHBOARD_URL = 'https://dashboard.moc-iot.com';
    const AUTH_CHECK_ENDPOINT = '/api/auth/check-developer';
    
    // Check if user is authenticated and has developer role
    async function checkAuth() {
        try {
            const token = localStorage.getItem('supabase.auth.token') || 
                         sessionStorage.getItem('supabase.auth.token');
            
            if (!token) {
                redirectToLogin();
                return;
            }
            
            const response = await fetch(`${DASHBOARD_URL}${AUTH_CHECK_ENDPOINT}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Authentication check failed');
            }
            
            const data = await response.json();
            
            if (!data.authenticated || !data.isDeveloper) {
                redirectToLogin();
                return;
            }
            
            // User is authenticated and has developer role
            showContent();
            
        } catch (error) {
            console.error('Auth check failed:', error);
            redirectToLogin();
        }
    }
    
    function redirectToLogin() {
        const currentUrl = encodeURIComponent(window.location.href);
        window.location.href = `${DASHBOARD_URL}/auth?redirect=${currentUrl}`;
    }
    
    function showContent() {
        // Remove loading overlay and show content
        const overlay = document.getElementById('auth-loading');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        document.body.style.display = 'block';
    }
    
    function showLoading() {
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.id = 'auth-loading';
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="text-align: center;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #1976d2;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    "></div>
                    <div style="color: #666; font-size: 16px;">
                        Checking authentication...
                    </div>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.style.display = 'none';
        document.head.appendChild(overlay);
    }
    
    // Initialize authentication check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            showLoading();
            checkAuth();
        });
    } else {
        showLoading();
        checkAuth();
    }
    
})();