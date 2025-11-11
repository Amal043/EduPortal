// Supabase Configuration
const SUPABASE_URL = 'https://nscnwptbrgpuhhrykvkn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zY253cHRicmdwdWhocnlrdmtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExODk3OTgsImV4cCI6MjA3Njc2NTc5OH0.gxvwvP3sl_2gPyr7np3e58q0iD1vjfUwiQCToPr_mQk';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.updateThemeIcons();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.updateThemeIcons();
        localStorage.setItem('theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateThemeIcons() {
        const icons = document.querySelectorAll('#themeIcon, #navThemeIcon');
        const text = document.getElementById('themeText');
        
        icons.forEach(icon => {
            icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        });
        
        if (text) {
            text.textContent = this.currentTheme === 'light' ? 'Dark' : 'Light';
        }
    }
}

// Authentication System with Supabase
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.showAuthForm();
    }

    async checkAuthStatus() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                this.isAuthenticated = true;
                this.showMainApp();
            }
            
            // Listen for auth state changes (important for OAuth callback)
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                if (event === 'SIGNED_IN' && session) {
                    this.currentUser = session.user;
                    this.isAuthenticated = true;
                    this.showToast('Welcome! Successfully signed in.', 'success');
                    this.showMainApp();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.isAuthenticated = false;
                    this.showAuthForm();
                }
            });
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    bindEvents() {
        // Login form submission
        document.getElementById('loginFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form submission
        document.getElementById('signupFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Form switching
        document.querySelectorAll('[onclick*="switchAuthForm"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const formType = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.switchAuthForm(formType);
            });
        });

        // Forgot password link
        const forgotPasswordLinks = document.querySelectorAll('.forgot-password');
        forgotPasswordLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showForgotPasswordModal();
            });
        });
        
        // Log to verify the links are found
        console.log('Found forgot password links:', forgotPasswordLinks.length);
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Simple validation
        if (!email || !password) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        this.showLoading(true);
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                // Show error message for login failures
                this.showToast(error.message.toLowerCase().includes('invalid login credentials') ? 
                    'Invalid email or password. Please check your credentials.' : error.message, 'error');
            } else {
                this.currentUser = data.user;
                this.isAuthenticated = true;
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }
                
                this.showToast('Welcome back!', 'success');
                this.showMainApp();
            }
        } catch (error) {
            this.showToast('An unexpected error occurred', 'error');
        }
        
        this.showLoading(false);
    }

    async handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showToast('Please agree to the terms and conditions', 'error');
            return;
        }

        this.showLoading(true);
        
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) {
                this.showToast(error.message, 'error');
            } else {
                this.showToast('Account created successfully! Please check your email to verify your account.', 'success');
                // Switch to login form after successful signup
                setTimeout(() => {
                    this.switchAuthForm('login');
                }, 2000);
            }
        } catch (error) {
            this.showToast('An unexpected error occurred', 'error');
        }
        
        this.showLoading(false);
    }

    switchAuthForm(formType) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (formType === 'login') {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
        
        // Clear forms
        document.getElementById('loginFormElement').reset();
        document.getElementById('signupFormElement').reset();
    }

    showAuthForm() {
        document.getElementById('authOverlay').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }

    async showMainApp() {
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // Update user name in navbar
        if (this.currentUser) {
            const userName = this.currentUser.user_metadata?.full_name || this.currentUser.email?.split('@')[0];
            document.getElementById('userName').textContent = userName;
        }
        
        // Initialize main app. If mainApp isn't available yet due to timing,
        // retry a few times before creating a new instance. This makes the
        // post-login flow resilient to initialization order and avoids
        // opening unexpected windows or failing silently.
        const initMainApp = async () => {
            let attempts = 0;
            while ((!window.mainApp || typeof window.mainApp.init !== 'function') && attempts < 10) {
                await new Promise(res => setTimeout(res, 100));
                attempts++;
            }

            if (window.mainApp && typeof window.mainApp.init === 'function') {
                try {
                    window.mainApp.init();
                } catch (err) {
                    console.error('Error initializing mainApp after login:', err);
                }
            } else {
                // As a last resort, create a new MainApp so the UI can show.
                try {
                    console.warn('mainApp not found, creating a new MainApp instance as fallback');
                    window.mainApp = new MainApp();
                    window.mainApp.init();
                } catch (err) {
                    console.error('Failed to create fallback mainApp:', err);
                }
            }
        };

        initMainApp();
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                this.showToast('Error logging out', 'error');
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
                localStorage.removeItem('rememberMe');
                
                this.showToast('Logged out successfully', 'success');
                this.showAuthForm();
            }
        } catch (error) {
            this.showToast('An unexpected error occurred', 'error');
        }
    }

    async signInWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // Use the full current page URL so the OAuth callback returns
                    // directly to this page (helps when using file:// or a local
                    // dev server). Note: for production with Supabase OAuth,
                    // configure allowed redirect URLs in the Supabase dashboard.
                    redirectTo: window.location.href
                }
            });

            if (error) {
                this.showToast('Google sign-in failed: ' + error.message, 'error');
            }
            // The page will redirect to Google for authentication
            // After successful auth, user will be redirected back
        } catch (error) {
            this.showToast('An unexpected error occurred', 'error');
        }
    }

    showLoading(show) {
        const buttons = document.querySelectorAll('.auth-btn');
        buttons.forEach(btn => {
            if (show) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            } else {
                btn.disabled = false;
                // Reset button content based on form
                const form = btn.closest('.auth-form');
                if (form.id === 'loginForm') {
                    btn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
                } else {
                    btn.innerHTML = '<span>Create Account</span><i class="fas fa-arrow-right"></i>';
                }
            }
        });
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="${icons[type]}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Show forgot password modal and handle reset
    showForgotPasswordModal() {
        const recoveryPage = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Recovery - EduPortal</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Poppins', sans-serif;
                }
                body {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .recovery-container {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    width: 100%;
                    max-width: 500px;
                    text-align: center;
                }
                .recovery-header {
                    margin-bottom: 25px;
                }
                .recovery-header h1 {
                    color: #2c3e50;
                    font-size: 2rem;
                    margin-bottom: 10px;
                }
                .recovery-header i {
                    font-size: 3rem;
                    color: #4ECDC4;
                    margin-bottom: 15px;
                }
                .recovery-form input {
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 20px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.3s;
                }
                .recovery-form input:focus {
                    border-color: #4ECDC4;
                    outline: none;
                }
                .recovery-btn {
                    background: #4ECDC4;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    width: 100%;
                    transition: transform 0.3s, background 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .recovery-btn:hover {
                    background: #45b7b0;
                    transform: translateY(-2px);
                }
                .recovery-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                .back-btn {
                    margin-top: 15px;
                    color: #666;
                    text-decoration: none;
                    display: inline-block;
                    transition: color 0.3s;
                }
                .back-btn:hover {
                    color: #4ECDC4;
                }
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 25px;
                    border-radius: 8px;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease-out;
                }
                .toast.success { background: #4ECDC4; }
                .toast.error { background: #ff6b6b; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        </head>
        <body>
            <div class="recovery-container">
                <div class="recovery-header">
                    <i class="fas fa-unlock-alt"></i>
                    <h1>Password Recovery</h1>
                    <p>Enter your registered email address to receive a password reset link</p>
                </div>
                <div class="recovery-form">
                    <input type="email" id="recoveryEmail" placeholder="Enter your email address" required>
                    <button id="recoveryBtn" class="recovery-btn">
                        <span>Send Recovery Email</span>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <a href="#" class="back-btn" onclick="window.close()">
                        <i class="fas fa-arrow-left"></i> Back to Login
                    </a>
                </div>
            </div>
            <script>
                // Initialize Supabase
                const SUPABASE_URL = '${SUPABASE_URL}';
                const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';
                const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

                // Show toast message
                function showToast(message, type = 'success') {
                    const toast = document.createElement('div');
                    toast.className = \`toast \${type}\`;
                    toast.innerHTML = \`
                        <i class="fas \${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                        <span>\${message}</span>
                    \`;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 5000);
                }

                // Handle recovery
                document.getElementById('recoveryBtn').addEventListener('click', async () => {
                    const btn = document.getElementById('recoveryBtn');
                    const email = document.getElementById('recoveryEmail').value.trim();
                    
                    if (!email) {
                        showToast('Please enter your email address', 'error');
                        return;
                    }

                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

                    try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email);
                        if (error) {
                            showToast(error.message, 'error');
                        } else {
                            showToast('Password recovery email sent! Check your inbox.');
                            setTimeout(() => window.close(), 3000);
                        }
                    } catch (err) {
                        showToast('An unexpected error occurred', 'error');
                    }

                    btn.disabled = false;
                    btn.innerHTML = '<span>Send Recovery Email</span><i class="fas fa-paper-plane"></i>';
                });
            </script>
        </body>
        </html>
        `;
        
        // Open in new window centered
        const rw = 600;
        const rh = 400;
        const rleft = Math.max(0, Math.floor((screen.width - rw) / 2));
        const rtop = Math.max(0, Math.floor((screen.height - rh) / 2));
        const rfeatures = `width=${rw},height=${rh},left=${rleft},top=${rtop},scrollbars=yes`;
        const recoveryWindow = window.open('', 'Password Recovery', rfeatures);
        if (!recoveryWindow) {
            const fallback = window.open();
            fallback.document.write(recoveryPage);
            fallback.document.close();
            return;
        }
        recoveryWindow.document.write(recoveryPage);
        recoveryWindow.document.close();
    }
}

// Password Toggle Function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Theme Toggle Function
function toggleTheme() {
    themeManager.toggleTheme();
}

// Form Switching Function
function switchAuthForm(formType) {
    authSystem.switchAuthForm(formType);
}

// Logout Function
function logout() {
    authSystem.logout();
}

// Google Sign In Function
function signInWithGoogle() {
    authSystem.signInWithGoogle();
}

// Mobile navigation toggle (for small screens)
function toggleMobileNav(forceState) {
    const navMenu = document.querySelector('.nav-menu');
    const toggleBtn = document.getElementById('mobileNavToggle');
    if (!navMenu || !toggleBtn) return;

    const isOpen = navMenu.classList.contains('open');
    let shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;

    if (shouldOpen) {
        navMenu.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }
}

// State-based opportunity data
const stateOpportunities = {
    'andhra-pradesh': {
        scholarships: [
            { 
                name: 'National Scholarship Portal (NSP)', 
                url: 'https://scholarships.gov.in', 
                description: 'A unified portal for applying, processing, sanctioning & disbursing various Central & State-government scholarships. Open for all categories: General, OBC, SC, ST, and Minority students.',
                source: 'Ministry of Education, Government of India',
                priority: 1
            },
            {
                name: 'Central Sector Scheme of Scholarship for College and University Students',
                url: 'https://www.education.gov.in/en/scholarships',
                description: 'Provides financial assistance to meritorious students from poor families who have passed Class XII. Open to General, OBC, SC, ST students for under-grad/post-grad/university studies (including professional courses).',
                source: 'Ministry of Education, Government of India',
                priority: 1
            },
            {
                name: 'Post Matric Scholarship for SC Students',
                url: 'https://scholarships.gov.in',
                description: 'Central Government scholarship for SC students studying in classes 11th and 12th, and pursuing higher studies in recognized institutions.',
                source: 'Ministry of Social Justice and Empowerment',
                priority: 1
            },
            {
                name: 'Post Matric Scholarship for ST Students',
                url: 'https://scholarships.gov.in',
                description: 'Financial assistance for ST students pursuing post-matriculation or post-secondary education in recognized institutions across India.',
                source: 'Ministry of Tribal Affairs',
                priority: 1
            },
            {
                name: 'Post Matric Scholarship for OBC Students',
                url: 'https://scholarships.gov.in',
                description: 'Government scholarship scheme for OBC students from economically backward families pursuing higher education.',
                source: 'Ministry of Social Justice and Empowerment',
                priority: 1
            },
            {
                name: 'Pre Matric Scholarship for SC/ST Students',
                url: 'https://scholarships.gov.in',
                description: 'Scholarship for SC and ST students studying in classes 9th and 10th to reduce dropout rates and encourage higher education.',
                source: 'Ministry of Social Justice and Empowerment',
                priority: 1
            },
            {
                name: 'Minority Scholarship Schemes',
                url: 'https://scholarships.gov.in',
                description: 'Pre-Matric and Post-Matric scholarships for students from minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).',
                source: 'Ministry of Minority Affairs',
                priority: 1
            },
            {
                name: 'National Means cum Merit Scholarship (NMMS)',
                url: 'https://scholarships.gov.in',
                description: 'Merit-based scholarship for economically weaker sections students studying in class 9th to 12th. Open to General, OBC, SC, ST students.',
                source: 'Ministry of Education, Government of India',
                priority: 1
            },
            {
                name: 'Indian Council for Cultural Relations (ICCR) Scholarships',
                url: 'https://iccr.gov.in/iccr-scholarship/indian-council-cultural-relations-scholarship',
                description: 'Scholarships offered by ICCR for foreign students to study in India under various schemes.',
                source: 'Indian Council for Cultural Relations (ICCR)',
                priority: 1
            },
            {
                name: 'Ministry of Education – Scholarships & Education Loan',
                url: 'https://www.education.gov.in/en/scholarships',
                description: 'Official portal listing various scholarship and loan schemes managed by the Ministry of Education for General, SC, ST, OBC students.',
                source: 'Ministry of Education, Government of India',
                priority: 1
            },
            { name: 'AP State Scholarship', url: 'https://www.ap.gov.in/scholarships', description: 'State government scholarships for students from all categories' },
            { name: 'AP EAMCET Merit Scholarship', url: 'https://www.apeamcet.nic.in', description: 'Merit-based scholarships for engineering students from General, OBC, SC, ST categories' },
            { name: 'AP Post Matric Scholarship', url: 'https://www.nsp.gov.in', description: 'Post-matriculation scholarship scheme for SC, ST, OBC, and minority students' }
        ],
        hackathons: [
            { name: 'Smart India Hackathon', url: 'https://www.sih.gov.in', description: 'One of India\'s largest national-level hackathons organised by the Government of India', source: 'Ministry of Education, Government of India', priority: 1 },
            { name: 'Great Indian Hackathon', url: 'https://greatindianhackathon.in', description: 'Beginner-friendly, online-first hackathon for students in India', source: 'Great Indian Hackathon' },
            { name: 'HackIndia', url: 'https://hackindia.org', description: 'A large hackathon series across India, especially Web3 / AI editions', source: 'HackIndia' },
            { name: 'Tata Crucible Hackathon', url: 'https://www.tatacrucible.com', description: 'Corporate-industry oriented hackathon by the Tata group', source: 'Tata Group' },
            { name: 'Central India Hackathon (CIH)', url: 'https://www.cih.in', description: 'Regional-but-national scope hackathon held in Nagpur, open to participants across India', source: 'Central India Hackathon' },
            { name: 'AP Innovation Challenge', url: 'https://www.apinnovation.gov.in', description: 'State-level innovation and coding competition' },
            { name: 'Vizag Tech Hackathon', url: 'https://www.vizagtech.com/hackathon', description: 'Annual tech hackathon in Visakhapatnam' },
            { name: 'Hyderabad Startup Hackathon', url: 'https://www.hyderabadstartup.com', description: 'Startup-focused hackathon events' }
        ],
        workshops: [
            { name: 'AP Skill Development Workshop', url: 'https://www.apsdc.gov.in', description: 'Skill development and training programs' },
            { name: 'Tech Workshop Series', url: 'https://www.aptechworkshops.com', description: 'Technology and programming workshops' },
            { name: 'Entrepreneurship Workshop', url: 'https://www.apentrepreneur.com', description: 'Business and entrepreneurship training' }
        ],
        internships: [
            { name: 'Prime Minister\'s Internship Scheme (PMIS)', url: 'https://pminternship.mca.gov.in', description: 'Targeting 1 crore internship opportunities over 5 years with top 500 companies', source: 'Ministry of Corporate Affairs (MCA)', priority: 1 },
            { name: 'Digital India Internship Programme', url: 'https://intern.meity.gov.in', description: 'Internships under Digital India scheme for technology and digital transformation projects', source: 'Ministry of Electronics & Information Technology (MeitY)', priority: 1 },
            { name: 'MEA Internship Programme', url: 'https://internship.mea.gov.in', description: 'Internships at MEA headquarters, two terms per year for students interested in foreign affairs', source: 'Ministry of External Affairs (MEA)', priority: 1 },
            { name: 'AICTE Internship Scheme', url: 'https://internship.aicte-india.org', description: 'National Internship Portal for students in technical education to apply for various internships', source: 'All India Council for Technical Education (AICTE)', priority: 1 },
            { name: 'AP Government Internship', url: 'https://www.ap.gov.in/internships', description: 'Government sector internship opportunities' },
            { name: 'AP IT Internship Program', url: 'https://www.apit.gov.in', description: 'IT industry internship placements' },
            { name: 'AP Startup Internship', url: 'https://www.apstartup.com', description: 'Startup ecosystem internship programs' }
        ]
    },
    'maharashtra': {
        scholarships: [
            { name: 'Maharashtra State Scholarship', url: 'https://www.maharashtra.gov.in/scholarships', description: 'State government scholarship programs' },
            { name: 'Mumbai University Merit Scholarship', url: 'https://www.mu.ac.in', description: 'University-level merit scholarships' },
            { name: 'Pune Tech Scholarship', url: 'https://www.punetech.edu', description: 'Technology-focused scholarship programs' }
        ],
        hackathons: [
            { name: 'Smart India Hackathon', url: 'https://www.sih.gov.in', description: 'One of India\'s largest national-level hackathons organised by the Government of India', source: 'Ministry of Education, Government of India', priority: 1 },
            { name: 'Great Indian Hackathon', url: 'https://greatindianhackathon.in', description: 'Beginner-friendly, online-first hackathon for students in India', source: 'Great Indian Hackathon' },
            { name: 'HackIndia', url: 'https://hackindia.org', description: 'A large hackathon series across India, especially Web3 / AI editions', source: 'HackIndia' },
            { name: 'Tata Crucible Hackathon', url: 'https://www.tatacrucible.com', description: 'Corporate-industry oriented hackathon by the Tata group', source: 'Tata Group' },
            { name: 'Central India Hackathon (CIH)', url: 'https://www.cih.in', description: 'Regional-but-national scope hackathon held in Nagpur, open to participants across India', source: 'Central India Hackathon' },
            { name: 'Mumbai Hackathon', url: 'https://www.mumbaihackathon.com', description: 'Annual coding competition in Mumbai' },
            { name: 'Pune Tech Fest', url: 'https://www.punetechfest.com', description: 'Technology festival and hackathon' },
            { name: 'Maharashtra Innovation Challenge', url: 'https://www.mahinnovation.gov.in', description: 'State-wide innovation competition' }
        ],
        workshops: [
            { name: 'Mumbai Tech Workshops', url: 'https://www.mumbaitechworkshops.com', description: 'Technology skill development workshops' },
            { name: 'Pune Skill Center', url: 'https://www.puneskillcenter.com', description: 'Professional skill training programs' },
            { name: 'Maharashtra Digital Workshop', url: 'https://www.mahdigital.gov.in', description: 'Digital literacy and training workshops' }
        ],
        internships: [
            { name: 'Prime Minister\'s Internship Scheme (PMIS)', url: 'https://pminternship.mca.gov.in', description: 'Targeting 1 crore internship opportunities over 5 years with top 500 companies', source: 'Ministry of Corporate Affairs (MCA)', priority: 1 },
            { name: 'Digital India Internship Programme', url: 'https://intern.meity.gov.in', description: 'Internships under Digital India scheme for technology and digital transformation projects', source: 'Ministry of Electronics & Information Technology (MeitY)', priority: 1 },
            { name: 'MEA Internship Programme', url: 'https://internship.mea.gov.in', description: 'Internships at MEA headquarters, two terms per year for students interested in foreign affairs', source: 'Ministry of External Affairs (MEA)', priority: 1 },
            { name: 'AICTE Internship Scheme', url: 'https://internship.aicte-india.org', description: 'National Internship Portal for students in technical education to apply for various internships', source: 'All India Council for Technical Education (AICTE)', priority: 1 },
            { name: 'Mumbai Corporate Internship', url: 'https://www.mumbaicorporate.com', description: 'Corporate sector internship opportunities' },
            { name: 'Pune IT Internship', url: 'https://www.puneit.com', description: 'IT industry internship programs' },
            { name: 'Maharashtra Startup Internship', url: 'https://www.mahstartup.com', description: 'Startup ecosystem internships' }
        ]
    },
    'karnataka': {
        scholarships: [
            { name: 'Karnataka State Scholarship', url: 'https://www.karnataka.gov.in/scholarships', description: 'State government scholarship schemes' },
            { name: 'Bangalore Tech Scholarship', url: 'https://www.bangaloretech.edu', description: 'Technology-focused scholarship programs' },
            { name: 'Mysore University Scholarship', url: 'https://www.uni-mysore.ac.in', description: 'University merit scholarships' }
        ],
        hackathons: [
            { name: 'Smart India Hackathon', url: 'https://www.sih.gov.in', description: 'One of India\'s largest national-level hackathons organised by the Government of India', source: 'Ministry of Education, Government of India', priority: 1 },
            { name: 'Great Indian Hackathon', url: 'https://greatindianhackathon.in', description: 'Beginner-friendly, online-first hackathon for students in India', source: 'Great Indian Hackathon' },
            { name: 'HackIndia', url: 'https://hackindia.org', description: 'A large hackathon series across India, especially Web3 / AI editions', source: 'HackIndia' },
            { name: 'Tata Crucible Hackathon', url: 'https://www.tatacrucible.com', description: 'Corporate-industry oriented hackathon by the Tata group', source: 'Tata Group' },
            { name: 'Central India Hackathon (CIH)', url: 'https://www.cih.in', description: 'Regional-but-national scope hackathon held in Nagpur, open to participants across India', source: 'Central India Hackathon' },
            { name: 'Bangalore Hackathon', url: 'https://www.bangalorehackathon.com', description: 'Premier coding competition in Bangalore' },
            { name: 'Mysore Tech Challenge', url: 'https://www.mysoretech.com', description: 'Technology innovation challenge' },
            { name: 'Karnataka Innovation Summit', url: 'https://www.karnatakainnovation.gov.in', description: 'State innovation and hackathon event' }
        ],
        workshops: [
            { name: 'Bangalore Tech Workshops', url: 'https://www.bangaloretechworkshops.com', description: 'Advanced technology workshops' },
            { name: 'Mysore Skill Development', url: 'https://www.mysoreskill.com', description: 'Professional skill training programs' },
            { name: 'Karnataka Digital Workshop', url: 'https://www.kardigital.gov.in', description: 'Digital skills and literacy workshops' }
        ],
        internships: [
            { name: 'Prime Minister\'s Internship Scheme (PMIS)', url: 'https://pminternship.mca.gov.in', description: 'Targeting 1 crore internship opportunities over 5 years with top 500 companies', source: 'Ministry of Corporate Affairs (MCA)', priority: 1 },
            { name: 'Digital India Internship Programme', url: 'https://intern.meity.gov.in', description: 'Internships under Digital India scheme for technology and digital transformation projects', source: 'Ministry of Electronics & Information Technology (MeitY)', priority: 1 },
            { name: 'MEA Internship Programme', url: 'https://internship.mea.gov.in', description: 'Internships at MEA headquarters, two terms per year for students interested in foreign affairs', source: 'Ministry of External Affairs (MEA)', priority: 1 },
            { name: 'AICTE Internship Scheme', url: 'https://internship.aicte-india.org', description: 'National Internship Portal for students in technical education to apply for various internships', source: 'All India Council for Technical Education (AICTE)', priority: 1 },
            { name: 'Bangalore IT Internship', url: 'https://www.bangaloreit.com', description: 'IT industry internship opportunities' },
            { name: 'Mysore Corporate Internship', url: 'https://www.mysorecorporate.com', description: 'Corporate sector internships' },
            { name: 'Karnataka Startup Internship', url: 'https://www.karnatakastartup.com', description: 'Startup ecosystem internship programs' }
        ]
    },
    'tamil-nadu': {
        scholarships: [
            { name: 'Tamil Nadu State Scholarship', url: 'https://www.tn.gov.in/scholarships', description: 'State government scholarship programs' },
            { name: 'Chennai Tech Scholarship', url: 'https://www.chennaitech.edu', description: 'Technology scholarship schemes' },
            { name: 'Anna University Merit Scholarship', url: 'https://www.annauniv.edu', description: 'University-level merit scholarships' }
        ],
        hackathons: [
            { name: 'Smart India Hackathon', url: 'https://www.sih.gov.in', description: 'One of India\'s largest national-level hackathons organised by the Government of India', source: 'Ministry of Education, Government of India', priority: 1 },
            { name: 'Great Indian Hackathon', url: 'https://greatindianhackathon.in', description: 'Beginner-friendly, online-first hackathon for students in India', source: 'Great Indian Hackathon' },
            { name: 'HackIndia', url: 'https://hackindia.org', description: 'A large hackathon series across India, especially Web3 / AI editions', source: 'HackIndia' },
            { name: 'Tata Crucible Hackathon', url: 'https://www.tatacrucible.com', description: 'Corporate-industry oriented hackathon by the Tata group', source: 'Tata Group' },
            { name: 'Central India Hackathon (CIH)', url: 'https://www.cih.in', description: 'Regional-but-national scope hackathon held in Nagpur, open to participants across India', source: 'Central India Hackathon' },
            { name: 'Chennai Hackathon', url: 'https://www.chennaihackathon.com', description: 'Annual coding competition in Chennai' },
            { name: 'Coimbatore Tech Fest', url: 'https://www.coimbatoretech.com', description: 'Technology festival and hackathon' },
            { name: 'Tamil Nadu Innovation Challenge', url: 'https://www.tninnovation.gov.in', description: 'State-wide innovation competition' }
        ],
        workshops: [
            { name: 'Chennai Tech Workshops', url: 'https://www.chennaitechworkshops.com', description: 'Technology skill development workshops' },
            { name: 'Coimbatore Skill Center', url: 'https://www.coimbatoreskill.com', description: 'Professional skill training programs' },
            { name: 'Tamil Nadu Digital Workshop', url: 'https://www.tndigital.gov.in', description: 'Digital literacy workshops' }
        ],
        internships: [
            { name: 'Prime Minister\'s Internship Scheme (PMIS)', url: 'https://pminternship.mca.gov.in', description: 'Targeting 1 crore internship opportunities over 5 years with top 500 companies', source: 'Ministry of Corporate Affairs (MCA)', priority: 1 },
            { name: 'Digital India Internship Programme', url: 'https://intern.meity.gov.in', description: 'Internships under Digital India scheme for technology and digital transformation projects', source: 'Ministry of Electronics & Information Technology (MeitY)', priority: 1 },
            { name: 'MEA Internship Programme', url: 'https://internship.mea.gov.in', description: 'Internships at MEA headquarters, two terms per year for students interested in foreign affairs', source: 'Ministry of External Affairs (MEA)', priority: 1 },
            { name: 'AICTE Internship Scheme', url: 'https://internship.aicte-india.org', description: 'National Internship Portal for students in technical education to apply for various internships', source: 'All India Council for Technical Education (AICTE)', priority: 1 },
            { name: 'Chennai IT Internship', url: 'https://www.chennaiit.com', description: 'IT industry internship opportunities' },
            { name: 'Coimbatore Corporate Internship', url: 'https://www.coimbatorecorporate.com', description: 'Corporate sector internships' },
            { name: 'Tamil Nadu Startup Internship', url: 'https://www.tnstartup.com', description: 'Startup ecosystem internships' }
        ]
    }
};

// Default opportunities for states not specifically listed
const defaultOpportunities = {
    scholarships: [
        { 
            name: 'National Scholarship Portal (NSP)', 
            url: 'https://scholarships.gov.in', 
            description: 'A unified portal for applying, processing, sanctioning & disbursing various Central & State-government scholarships. Open for all categories: General, OBC, SC, ST, and Minority students.',
            source: 'Ministry of Education, Government of India',
            priority: 1
        },
        {
            name: 'Central Sector Scheme of Scholarship for College and University Students',
            url: 'https://www.education.gov.in/en/scholarships',
            description: 'Provides financial assistance to meritorious students from poor families who have passed Class XII. Open to General, OBC, SC, ST students for under-grad/post-grad/university studies (including professional courses).',
            source: 'Ministry of Education, Government of India',
            priority: 1
        },
        {
            name: 'Post Matric Scholarship for SC Students',
            url: 'https://scholarships.gov.in',
            description: 'Central Government scholarship for SC students studying in classes 11th and 12th, and pursuing higher studies in recognized institutions.',
            source: 'Ministry of Social Justice and Empowerment',
            priority: 1
        },
        {
            name: 'Post Matric Scholarship for ST Students',
            url: 'https://scholarships.gov.in',
            description: 'Financial assistance for ST students pursuing post-matriculation or post-secondary education in recognized institutions across India.',
            source: 'Ministry of Tribal Affairs',
            priority: 1
        },
        {
            name: 'Post Matric Scholarship for OBC Students',
            url: 'https://scholarships.gov.in',
            description: 'Government scholarship scheme for OBC students from economically backward families pursuing higher education.',
            source: 'Ministry of Social Justice and Empowerment',
            priority: 1
        },
        {
            name: 'Pre Matric Scholarship for SC/ST Students',
            url: 'https://scholarships.gov.in',
            description: 'Scholarship for SC and ST students studying in classes 9th and 10th to reduce dropout rates and encourage higher education.',
            source: 'Ministry of Social Justice and Empowerment',
            priority: 1
        },
        {
            name: 'Minority Scholarship Schemes',
            url: 'https://scholarships.gov.in',
            description: 'Pre-Matric and Post-Matric scholarships for students from minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi).',
            source: 'Ministry of Minority Affairs',
            priority: 1
        },
        {
            name: 'National Means cum Merit Scholarship (NMMS)',
            url: 'https://scholarships.gov.in',
            description: 'Merit-based scholarship for economically weaker sections students studying in class 9th to 12th. Open to General, OBC, SC, ST students.',
            source: 'Ministry of Education, Government of India',
            priority: 1
        },
        {
            name: 'Indian Council for Cultural Relations (ICCR) Scholarships',
            url: 'https://iccr.gov.in/iccr-scholarship/indian-council-cultural-relations-scholarship',
            description: 'Scholarships offered by ICCR for foreign students to study in India under various schemes.',
            source: 'Indian Council for Cultural Relations (ICCR)',
            priority: 1
        },
        {
            name: 'Ministry of Education – Scholarships & Education Loan',
            url: 'https://www.education.gov.in/en/scholarships',
            description: 'Official portal listing various scholarship and loan schemes managed by the Ministry of Education for General, SC, ST, OBC students.',
            source: 'Ministry of Education, Government of India',
            priority: 1
        },
        { 
            name: 'State Merit Scholarship', 
            url: 'https://www.nsp.gov.in', 
            description: 'State-level merit scholarships for General, OBC, SC, ST students' 
        },
        { 
            name: 'Educational Loan Scheme', 
            url: 'https://www.eduloan.gov.in', 
            description: 'Government educational loan programs for all categories' 
        }
    ],
    hackathons: [
        { name: 'Smart India Hackathon', url: 'https://www.sih.gov.in', description: 'One of India\'s largest national-level hackathons organised by the Government of India', source: 'Ministry of Education, Government of India', priority: 1 },
        { name: 'Great Indian Hackathon', url: 'https://greatindianhackathon.in', description: 'Beginner-friendly, online-first hackathon for students in India', source: 'Great Indian Hackathon' },
        { name: 'HackIndia', url: 'https://hackindia.org', description: 'A large hackathon series across India, especially Web3 / AI editions', source: 'HackIndia' },
        { name: 'Tata Crucible Hackathon', url: 'https://www.tatacrucible.com', description: 'Corporate-industry oriented hackathon by the Tata group', source: 'Tata Group' },
        { name: 'Central India Hackathon (CIH)', url: 'https://www.cih.in', description: 'Regional-but-national scope hackathon held in Nagpur, open to participants across India', source: 'Central India Hackathon' },
        { name: 'National Hackathon', url: 'https://www.nationalhackathon.gov.in', description: 'National-level coding competition' },
        { name: 'Tech Innovation Challenge', url: 'https://www.techinnovation.gov.in', description: 'Technology innovation competition' },
        { name: 'Startup India Hackathon', url: 'https://www.startupindia.gov.in', description: 'Startup-focused hackathon events' }
    ],
    workshops: [
        { name: 'National Skill Development', url: 'https://www.nsdcindia.org', description: 'Skill development and training programs' },
        { name: 'Digital India Workshop', url: 'https://www.digitalindia.gov.in', description: 'Digital literacy workshops' },
        { name: 'Tech Training Program', url: 'https://www.techtraining.gov.in', description: 'Technology training programs' }
    ],
    internships: [
        { name: 'Prime Minister\'s Internship Scheme (PMIS)', url: 'https://pminternship.mca.gov.in', description: 'Targeting 1 crore internship opportunities over 5 years with top 500 companies', source: 'Ministry of Corporate Affairs (MCA)', priority: 1 },
        { name: 'Digital India Internship Programme', url: 'https://intern.meity.gov.in', description: 'Hands-on training in emerging technologies like AI, IoT, and cybersecurity', source: 'Ministry of Electronics & IT (MeitY)', priority: 1 },
        { name: 'MEA Internship Programme', url: 'https://internship.mea.gov.in', description: 'Opportunities in Indian missions abroad and MEA headquarters', source: 'Ministry of External Affairs (MEA)', priority: 1 },
        { name: 'AICTE Internship Scheme', url: 'https://internship.aicte-india.org', description: 'Technical internships in collaboration with industries for engineering students', source: 'All India Council for Technical Education (AICTE)', priority: 1 },
        { name: 'Government Internship', url: 'https://www.internship.gov.in', description: 'Government sector internship opportunities' },
        { name: 'Industry Internship Program', url: 'https://www.industryinternship.gov.in', description: 'Industry internship placements' },
        { name: 'Startup Internship', url: 'https://www.startupinternship.gov.in', description: 'Startup ecosystem internships' }
    ]
};

// Main Application Class
class MainApp {
    constructor() {
        this.stateSelect = null;
        this.optionsContainer = null;
        this.loading = null;
    }

    init() {
        this.stateSelect = document.getElementById('stateSelect');
        this.optionsContainer = document.getElementById('optionsContainer');
        this.loading = document.getElementById('loading');
        
        this.bindEvents();
        this.addAnimations();
        this.createParticleBackground();
    }

    bindEvents() {
        if (this.stateSelect) {
            this.stateSelect.addEventListener('change', () => this.handleStateSelection());
        }
    }

    handleStateSelection() {
        const selectedState = this.stateSelect.value;
        
        if (selectedState) {
            this.showLoading();
            
            // Add state selection animation
            this.stateSelect.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.stateSelect.style.transform = 'scale(1)';
            }, 200);
            
            // Simulate loading delay for better UX
            setTimeout(() => {
                this.showOptions();
                this.hideLoading();
                this.enhanceOptionsPage();
            }, 1500);
        } else {
            this.hideOptions();
        }
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.optionsContainer.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    showOptions() {
        this.optionsContainer.style.display = 'block';
        this.optionsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    hideOptions() {
        this.optionsContainer.style.display = 'none';
    }

    addAnimations() {
        // Add enhanced hover effects to cards
        const cards = document.querySelectorAll('.option-card');
        cards.forEach((card, index) => {
            // Staggered entrance animation
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-15px) scale(1.05) rotateY(5deg)';
                this.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                
                // Add ripple effect
                this.style.position = 'relative';
                const ripple = document.createElement('div');
                ripple.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: rgba(255,255,255,0.3);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                this.appendChild(ripple);
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.remove();
                    }
                }, 600);
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1) rotateY(0deg)';
                this.style.boxShadow = '';
            });
            
            // Add click animation
            card.addEventListener('click', function() {
                this.style.transform = 'translateY(-8px) scale(1.02) rotateY(2deg)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-15px) scale(1.05) rotateY(5deg)';
                }, 100);
            });
        });
        
        // Add enhanced click animation to buttons
        const buttons = document.querySelectorAll('.explore-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Create ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                // Button press animation
                this.style.transform = 'translateY(-1px) scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'translateY(-3px) scale(1.05)';
                }, 100);
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.remove();
                    }
                }, 600);
            });
        });
        
        // Add floating animation to theme toggle
        const themeToggle = document.querySelector('.theme-btn');
        if (themeToggle) {
            setInterval(() => {
                themeToggle.style.transform = 'translateY(-2px)';
                setTimeout(() => {
                    themeToggle.style.transform = 'translateY(0)';
                }, 2000);
            }, 4000);
        }
        
        // Add typing animation to header text
        this.addTypingAnimation();
    }
    
    addTypingAnimation() {
        const headerText = document.querySelector('header h1');
        if (headerText) {
            const text = headerText.textContent;
            headerText.textContent = '';
            headerText.style.borderRight = '2px solid #ffd700';
            
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    headerText.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                } else {
                    setTimeout(() => {
                        headerText.style.borderRight = 'none';
                    }, 1000);
                }
            };
            
            setTimeout(typeWriter, 500);
        }
    }
    
    createParticleBackground() {
        const optionsContainer = document.getElementById('optionsContainer');
        if (!optionsContainer) return;
        
        // Create particle container
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        optionsContainer.appendChild(particleContainer);
        
        // Create particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
            particleContainer.appendChild(particle);
        }
    }
    
    enhanceOptionsPage() {
        const optionsContainer = document.getElementById('optionsContainer');
        if (!optionsContainer) return;
        
        // Add entrance animation
        optionsContainer.style.animation = 'bounceIn 1s ease-out';
        
        // Add glow effect to title
        const title = optionsContainer.querySelector('h2');
        if (title) {
            title.style.animation = 'glow 3s ease-in-out infinite';
        }
        
        // Add staggered animations to cards
        const cards = optionsContainer.querySelectorAll('.option-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2}s`;
            card.style.animation = 'cardSlideIn 0.8s ease-out both';
        });
        
        // Add floating animation to cards
        setInterval(() => {
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.transform = 'translateY(-5px)';
                    setTimeout(() => {
                        card.style.transform = 'translateY(0)';
                    }, 2000);
                }, index * 500);
            });
        }, 8000);
    }
}

// Open category page
function openCategory(category) {
    // Check if state is already selected
    const storedState = localStorage.getItem('selectedState');
    if (storedState) {
        // State already selected, proceed with category flow
        if (category === 'scholarships') {
            showScholarshipCategorySelection(storedState);
            return;
        }
        if (category === 'hackathons') {
            showHackathonCollegeModal(storedState);
            return;
        }
        if (category === 'internships') {
            showInternshipBranchModal(storedState);
            return;
        }
        // For other categories, open directly
        const stateData = stateOpportunities[storedState] || defaultOpportunities;
        const opportunities = stateData[category] || [];
        const categoryPage = createCategoryPage(category, opportunities, storedState);
        openInNewWindow(categoryPage);
        return;
    }
    
    // No state selected yet, show state selection modal
    showStateSelectModal(category);
}

function showStateSelectModal(category) {
    // Remove any existing modal
    document.querySelector('.state-select-modal')?.remove();
    const modal = document.createElement('div');
    modal.className = 'state-select-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-map-marker-alt"></i> Select Your State</h3>
                    <button class="modal-close" onclick="this.closest('.state-select-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <select id="modalStateSelect" style="width:100%;padding:10px;border-radius:8px;margin-bottom:18px;font-size:1rem;">
                        <option value="">Choose your state...</option>
                        <option value="andhra-pradesh">Andhra Pradesh</option>
                        <option value="arunachal-pradesh">Arunachal Pradesh</option>
                        <option value="assam">Assam</option>
                        <option value="bihar">Bihar</option>
                        <option value="chhattisgarh">Chhattisgarh</option>
                        <option value="goa">Goa</option>
                        <option value="gujarat">Gujarat</option>
                        <option value="haryana">Haryana</option>
                        <option value="himachal-pradesh">Himachal Pradesh</option>
                        <option value="jharkhand">Jharkhand</option>
                        <option value="karnataka">Karnataka</option>
                        <option value="kerala">Kerala</option>
                        <option value="madhya-pradesh">Madhya Pradesh</option>
                        <option value="maharashtra">Maharashtra</option>
                        <option value="manipur">Manipur</option>
                        <option value="meghalaya">Meghalaya</option>
                        <option value="mizoram">Mizoram</option>
                        <option value="nagaland">Nagaland</option>
                        <option value="odisha">Odisha</option>
                        <option value="punjab">Punjab</option>
                        <option value="rajasthan">Rajasthan</option>
                        <option value="sikkim">Sikkim</option>
                        <option value="tamil-nadu">Tamil Nadu</option>
                        <option value="telangana">Telangana</option>
                        <option value="tripura">Tripura</option>
                        <option value="uttar-pradesh">Uttar Pradesh</option>
                        <option value="uttarakhand">Uttarakhand</option>
                        <option value="west-bengal">West Bengal</option>
                        <option value="delhi">Delhi</option>
                        <option value="chandigarh">Chandigarh</option>
                        <option value="jammu-kashmir">Jammu & Kashmir</option>
                        <option value="ladakh">Ladakh</option>
                        <option value="puducherry">Puducherry</option>
                    </select>
                    <button id="stateSelectContinueBtn" class="auth-btn" style="width:100%;margin-top:10px;">
                        <span>Continue</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-overlay').style.opacity = '1';
    }, 10);
    modal.querySelector('#stateSelectContinueBtn').addEventListener('click', () => {
        const selectedState = modal.querySelector('#modalStateSelect').value;
        if (!selectedState) {
            authSystem.showToast('Please select a state to continue.', 'warning');
            return;
        }
        
        // Store the selected state
        localStorage.setItem('selectedState', selectedState);
        
        // Update main dropdown
        const stateSelect = document.getElementById('stateSelect');
        if (stateSelect) {
            stateSelect.value = selectedState;
        }
        
        modal.remove();
        
        // Continue with the original category flow
        if (category === 'scholarships') {
            showScholarshipCategorySelection(selectedState);
            return;
        }
        if (category === 'hackathons') {
            showHackathonCollegeModal(selectedState);
            return;
        }
        if (category === 'internships') {
            showInternshipBranchModal(selectedState);
            return;
        }
        // Default: open category page
        const stateData = stateOpportunities[selectedState] || defaultOpportunities;
        const opportunities = stateData[category] || [];
        const categoryPage = createCategoryPage(category, opportunities, selectedState);
        openInNewWindow(categoryPage);
    });
    
    const style = document.createElement('style');
    style.innerHTML = `
.state-select-modal .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 1;
    transition: opacity 0.3s;
}
.state-select-modal .modal-content {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    padding: 32px 24px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    transform: scale(1);
    transition: transform 0.3s;
}
.state-select-modal .modal-header h3 {
    margin-bottom: 18px;
    font-size: 1.5rem;
}
.state-select-modal .modal-close {
    position: absolute;
    top: 18px;
    right: 18px;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
}
`;
document.head.appendChild(style);

// Add this to the end of showStateSelectModal function, after previous style injection
const style2 = document.createElement('style');
style2.innerHTML = `
.state-select-modal .modal-header h3 {
    color: #4ECDC4;
    font-weight: 700;
    letter-spacing: 1px;
}
.state-select-modal select#modalStateSelect {
    background: #f7f7fa;
    border: 2px solid #4ECDC4;
    color: #333;
    font-size: 1.08rem;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 18px;
    outline: none;
    transition: border-color 0.3s;
}
.state-select-modal select#modalStateSelect:focus {
    border-color: #42a5f5;
}
.state-select-modal option {
    color: #222;
    background: #fff;
}
`;
document.head.appendChild(style2);
}

// Show hackathon modal with 3 options
function showHackathonCollegeModal(state) {
    const modal = document.createElement('div');
    modal.className = 'scholarship-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-code"></i> Hackathon Search</h3>
                    <button class="modal-close" onclick="this.closest('.scholarship-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Choose how you want to search for hackathons:</p>
                    <div class="category-grid">
                        <div class="category-card" onclick="selectHackathonOption('all', '${state}')">
                            <i class="fas fa-globe"></i>
                            <h4>All Hackathons</h4>
                            <p>See all available hackathons</p>
                        </div>
                        <div class="category-card" onclick="selectHackathonOption('college', '${state}')">
                            <i class="fas fa-university"></i>
                            <h4>College Specific</h4>
                            <p>Enter your college name to find specific hackathons</p>
                        </div>
                        <div class="category-card" onclick="selectHackathonOption('other', '${state}')">
                            <i class="fas fa-search"></i>
                            <h4>Filter by Keyword</h4>
                            <p>Search by college name or any keyword</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-overlay').style.opacity = '1';
    }, 10);
}

// Show college name input modal
function showCollegeNameInputModal(option, state) {
    const modal = document.createElement('div');
    modal.className = 'scholarship-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-university"></i> Enter College Details</h3>
                    <button class="modal-close" onclick="this.closest('.scholarship-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 15px; color: #666;">Please enter your college name or keyword to find relevant hackathons:</p>
                    <input type="text" id="collegeNameInput" placeholder="e.g., IIT Delhi, NIT, Engineering College..." style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 2px solid #4ECDC4; font-size: 1rem; outline: none;">
                    <button onclick="processCollegeSearch('${option}', '${state}')" class="auth-btn" style="width: 100%;">
                        <span>Search Hackathons</span>
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-overlay').style.opacity = '1';
    }, 10);
    
    // Focus on input field
    setTimeout(() => {
        document.getElementById('collegeNameInput')?.focus();
    }, 100);
}

// Process college search
function processCollegeSearch(option, state) {
    const collegeName = document.getElementById('collegeNameInput')?.value.trim();
    
    if (!collegeName) {
        authSystem.showToast('Please enter a college name or keyword', 'warning');
        return;
    }
    
    document.querySelector('.scholarship-modal')?.remove();
    
    const stateData = stateOpportunities[state] || defaultOpportunities;
    let opportunities = stateData.hackathons || [];
    let filterMessage = null;
    const collegeNameLower = collegeName.toLowerCase();
    
    // Filter hackathons by college name in name or description
    const filteredOpportunities = opportunities.filter(h =>
        h.name.toLowerCase().includes(collegeNameLower) ||
        h.description.toLowerCase().includes(collegeNameLower)
    );
    
    if (filteredOpportunities.length > 0) {
        // Found specific hackathons for this college
        opportunities = filteredOpportunities;
        filterMessage = `Found ${filteredOpportunities.length} hackathon(s) matching "${collegeName}"`;
    } else {
        // No specific hackathons found, show all hackathons are valid
        filterMessage = `No specific results for "${collegeName}". All ${opportunities.length} hackathons listed below are open to students from ${collegeName} and all colleges across India.`;
    }
    
    const categoryPage = createCategoryPage('hackathons', opportunities, state, null, collegeName, filterMessage);
    openInNewWindow(categoryPage);
}

// Handle hackathon modal option selection
function selectHackathonOption(option, state) {
    document.querySelector('.scholarship-modal')?.remove();
    
    if (option === 'all') {
        // Show all hackathons directly
        const stateData = stateOpportunities[state] || defaultOpportunities;
        const opportunities = stateData.hackathons || [];
        const categoryPage = createCategoryPage('hackathons', opportunities, state, null, null, null);
        openInNewWindow(categoryPage);
    } else {
        // Show college name input modal for 'college' or 'other' options
        showCollegeNameInputModal(option, state);
    }
}

// Show internship modal with 4 options
function showInternshipBranchModal(state) {
    const modal = document.createElement('div');
    modal.className = 'scholarship-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-briefcase"></i> Internship Search</h3>
                    <button class="modal-close" onclick="this.closest('.scholarship-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Choose how you want to search for internships:</p>
                    <div class="category-grid">
                        <div class="category-card" onclick="selectInternshipOption('all', '${state}')">
                            <i class="fas fa-globe"></i>
                            <h4>All Internships</h4>
                            <p>See all available internships</p>
                        </div>
                        <div class="category-card" onclick="selectInternshipOption('govt', '${state}')">
                            <i class="fas fa-landmark"></i>
                            <h4>Government</h4>
                            <p>Show only government internships</p>
                        </div>
                        <div class="category-card" onclick="selectInternshipOption('private', '${state}')">
                            <i class="fas fa-building"></i>
                            <h4>Private/Corporate</h4>
                            <p>Show only private/corporate internships</p>
                        </div>
                        <div class="category-card" onclick="selectInternshipOption('branch', '${state}')">
                            <i class="fas fa-user-graduate"></i>
                            <h4>Branch Specific</h4>
                            <p>Enter your branch to find relevant internships</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-overlay').style.opacity = '1';
    }, 10);
}

// Show branch input modal
function showBranchInputModal(state) {
    const modal = document.createElement('div');
    modal.className = 'scholarship-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-graduate"></i> Enter Branch Details</h3>
                    <button class="modal-close" onclick="this.closest('.scholarship-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 15px; color: #666;">Please enter your branch or field of study to find relevant internships:</p>
                    <input type="text" id="branchInput" placeholder="e.g., Computer Science, Mechanical, Civil..." style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 8px; border: 2px solid #4ECDC4; font-size: 1rem; outline: none;">
                    <button onclick="processBranchSearch('${state}')" class="auth-btn" style="width: 100%;">
                        <span>Search Internships</span>
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-overlay').style.opacity = '1';
    }, 10);
    
    // Focus on input field
    setTimeout(() => {
        document.getElementById('branchInput')?.focus();
    }, 100);
}

// Process branch search
function processBranchSearch(state) {
    const branch = document.getElementById('branchInput')?.value.trim();
    
    if (!branch) {
        authSystem.showToast('Please enter your branch or field of study', 'warning');
        return;
    }
    
    document.querySelector('.scholarship-modal')?.remove();
    
    const stateData = stateOpportunities[state] || defaultOpportunities;
    let opportunities = stateData.internships || [];
    let filterMessage = null;
    const branchLower = branch.toLowerCase();
    
    const filteredOpportunities = opportunities.filter(i =>
        i.name.toLowerCase().includes(branchLower) ||
        i.description.toLowerCase().includes(branchLower)
    );
    
    if (filteredOpportunities.length > 0) {
        opportunities = filteredOpportunities;
        filterMessage = `Found ${filteredOpportunities.length} internship(s) for ${branch} branch`;
    } else {
        filterMessage = `No branch-specific internships found. All ${opportunities.length} internships listed below are open to students from ${branch} and all branches.`;
    }
    
    const categoryPage = createCategoryPage('internships', opportunities, state, null, branch, filterMessage);
    openInNewWindow(categoryPage);
}

// Handle internship modal option selection
function selectInternshipOption(option, state) {
    document.querySelector('.scholarship-modal')?.remove();
    const stateData = stateOpportunities[state] || defaultOpportunities;
    let opportunities = stateData.internships || [];
    let filterMessage = null;
    
    if (option === 'all') {
        // Show all internships directly
        const categoryPage = createCategoryPage('internships', opportunities, state, null, null, null);
        openInNewWindow(categoryPage);
    } else if (option === 'govt') {
        opportunities = opportunities.filter(i => i.name.toLowerCase().includes('gov') || i.description.toLowerCase().includes('gov'));
        filterMessage = `Showing ${opportunities.length} government internship(s)`;
        const categoryPage = createCategoryPage('internships', opportunities, state, null, null, filterMessage);
        openInNewWindow(categoryPage);
    } else if (option === 'private') {
        opportunities = opportunities.filter(i => i.name.toLowerCase().includes('private') || i.name.toLowerCase().includes('corporate') || i.description.toLowerCase().includes('private') || i.description.toLowerCase().includes('corporate'));
        filterMessage = `Showing ${opportunities.length} private/corporate internship(s)`;
        const categoryPage = createCategoryPage('internships', opportunities, state, null, null, filterMessage);
        openInNewWindow(categoryPage);
    } else if (option === 'branch') {
        // Show branch input modal
        showBranchInputModal(state);
    }
}

// Show scholarship category selection
function showScholarshipCategorySelection(state) {
    const modal = document.createElement('div');
    modal.className = 'scholarship-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-award"></i> Select Scholarship Category</h3>
                    <button class="modal-close" onclick="this.closest('.scholarship-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Choose your category to find relevant scholarships:</p>
                    <div class="category-grid">
                        <div class="category-card" onclick="openScholarshipCategory('general', '${state}')">
                            <i class="fas fa-users"></i>
                            <h4>General</h4>
                            <p>Open to all students</p>
                        </div>
                        <div class="category-card" onclick="openScholarshipCategory('st', '${state}')">
                            <i class="fas fa-mountain"></i>
                            <h4>Scheduled Tribes (ST)</h4>
                            <p>For ST category students</p>
                        </div>
                        <div class="category-card" onclick="openScholarshipCategory('sc', '${state}')">
                            <i class="fas fa-hands-helping"></i>
                            <h4>Scheduled Castes (SC)</h4>
                            <p>For SC category students</p>
                        </div>
                        <div class="category-card" onclick="openScholarshipCategory('obc', '${state}')">
                            <i class="fas fa-balance-scale"></i>
                            <h4>Other Backward Classes (OBC)</h4>
                            <p>For OBC category students</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add animation
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-overlay').style.opacity = '1';
    }, 10);
}

// Open specific scholarship category
function openScholarshipCategory(category, state) {
    const stateData = stateOpportunities[state] || defaultOpportunities;
    const allScholarships = stateData.scholarships || [];
    
        // Process scholarships with eligibility analysis
        const processedScholarships = allScholarships.map(scholarship => {
            const eligibility = analyzeScholarshipEligibility(scholarship);
            return {
                ...scholarship,
                eligibility,
                eligibilityText: generateEligibilityText(eligibility)
            };
        });

        // Filter scholarships based on category and eligibility
        const filteredScholarships = processedScholarships.filter(scholarship => {
            if (category === 'general') {
                return scholarship.eligibility.general;
            } else {
                return scholarship.eligibility[category];
            }
        });
// Helper function to analyze scholarship eligibility
function analyzeScholarshipEligibility(scholarship) {
    const textToAnalyze = (scholarship.name + ' ' + scholarship.description).toLowerCase();
    const eligibility = {
        general: false,
        sc: false,
        st: false,
        obc: false,
        minority: false
    };

    // Check for general category
    if (textToAnalyze.includes('all categories') || 
        textToAnalyze.includes('open to all') ||
        textToAnalyze.includes('general category') ||
        textToAnalyze.includes('unreserved') ||
        (textToAnalyze.includes('general') && !textToAnalyze.includes('general to specific'))) {
        eligibility.general = true;
    }

    // Check for SC category
    if (textToAnalyze.includes('sc') || 
        textToAnalyze.includes('scheduled caste') ||
        textToAnalyze.includes('all categories')) {
        eligibility.sc = true;
    }

    // Check for ST category
    if (textToAnalyze.includes('st') || 
        textToAnalyze.includes('scheduled tribe') ||
        textToAnalyze.includes('all categories')) {
        eligibility.st = true;
    }

    // Check for OBC category
    if (textToAnalyze.includes('obc') || 
        textToAnalyze.includes('other backward') ||
        textToAnalyze.includes('all categories')) {
        eligibility.obc = true;
    }

    // Check for minority
    if (textToAnalyze.includes('minority') ||
        textToAnalyze.includes('all categories')) {
        eligibility.minority = true;
    }

    return eligibility;
}

// Generate human-readable eligibility text
function generateEligibilityText(eligibility) {
    const categories = [];
    if (eligibility.general) categories.push('General');
    if (eligibility.sc) categories.push('SC');
    if (eligibility.st) categories.push('ST');
    if (eligibility.obc) categories.push('OBC');
    if (eligibility.minority) categories.push('Minority');
    
    if (categories.length === 5) {
        return 'Open to all categories';
    }
    
    return 'Available for: ' + categories.join(', ');
}
    
    // Close modal
    document.querySelector('.scholarship-modal')?.remove();
    
    // Create and open category page
    const categoryPage = createCategoryPage('scholarships', filteredScholarships, state, category);
    openInNewWindow(categoryPage);
}

// Create category page content
function createCategoryPage(category, opportunities, state, scholarshipCategory = null, collegeName = null, filterMessage = null) {
    const categoryNames = {
        scholarships: scholarshipCategory ? 
            `Scholarships - ${scholarshipCategory.toUpperCase()}` : 
            'Scholarships',
        hackathons: 'Hackathons',
        workshops: 'Workshops',
        internships: 'Internships'
    };
    
    const categoryIcons = {
        scholarships: 'fas fa-award',
        hackathons: 'fas fa-code',
        workshops: 'fas fa-tools',
        internships: 'fas fa-briefcase'
    };
    
    const categoryColors = {
        scholarships: '#26A69A',
        hackathons: '#E57373',
        workshops: '#42A5F5',
        internships: '#9575CD'
    };
    // Use a single accent color for all category pages to keep styling identical
    const ACCENT_COLOR = '#4ECDC4';
    
    // Determine a human-readable state name from the main page select
    let stateName = 'Selected State';
    const mainStateSelect = document.getElementById('stateSelect');
    
    if (mainStateSelect && mainStateSelect.value) {
        // Use main dropdown value
        const selectedOption = mainStateSelect.options[mainStateSelect.selectedIndex];
        if (selectedOption) {
            stateName = selectedOption.text;
        }
    } else if (state) {
        stateName = state.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
    
    let collegeInfo = '';
    if (filterMessage) {
        collegeInfo = `<div style="margin:15px auto;padding:15px;background:rgba(255,255,255,0.95);border-left:4px solid #4ECDC4;border-radius:8px;max-width:800px;font-size:1rem;color:#2c3e50;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><i class="fas fa-info-circle" style="color:#4ECDC4;margin-right:8px;"></i>${filterMessage}</div>`;
    } else if (category === 'hackathons' && collegeName) {
        collegeInfo = `<div style="margin-bottom:10px;font-size:1.1rem;color:#ff6b6b;font-weight:500;">Filtered by college: <b>${collegeName}</b></div>`;
    } else if (category === 'internships' && collegeName) {
        collegeInfo = `<div style="margin-bottom:10px;font-size:1.1rem;color:#ff6b6b;font-weight:500;">Filtered by branch/specification: <b>${collegeName}</b></div>`;
    }
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${categoryNames[category]} - ${stateName}</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    min-height: 100vh;
                    padding: 20px;
                    position: relative;
                    overflow-x: hidden;
                }
                
                /* Animated background effect */
                body::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at 20% 50%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 40% 20%, rgba(66, 165, 245, 0.1) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: 0;
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }
                
                .header {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    padding: 40px;
                    border-radius: 25px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
                                0 0 0 1px rgba(255, 255, 255, 0.1) inset;
                    text-align: center;
                    margin-bottom: 40px;
                    animation: fadeInUp 0.8s ease-out;
                }
                
                .header h1 {
                    background: linear-gradient(135deg, ${categoryColors[category]} 0%, #fff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 15px;
                    font-size: 2.8rem;
                    font-weight: 700;
                    text-shadow: 0 0 30px rgba(78, 205, 196, 0.3);
                    letter-spacing: -0.5px;
                }
                
                .header h1 i {
                    color: ${categoryColors[category]};
                    margin-right: 15px;
                    filter: drop-shadow(0 0 10px ${categoryColors[category]});
                    -webkit-text-fill-color: ${categoryColors[category]};
                }
                
                .header p {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 1.2rem;
                    font-weight: 400;
                    margin-top: 10px;
                }
                
                .opportunities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                    gap: 30px;
                    padding: 10px;
                }
                
                .opportunity-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2),
                                0 0 0 1px rgba(255, 255, 255, 0.1) inset;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border-left: 4px solid ${categoryColors[category]};
                    animation: fadeInUp 0.6s ease-out;
                    animation-fill-mode: both;
                    position: relative;
                    overflow: hidden;
                }
                
                .opportunity-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, ${categoryColors[category]}15 0%, transparent 100%);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                    pointer-events: none;
                }
                
                .opportunity-card:hover::before {
                    opacity: 1;
                }
                
                .opportunity-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3),
                                0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                                0 0 30px ${categoryColors[category]}40;
                    border-left-width: 6px;
                }
                
                .opportunity-card h3 {
                    color: #ffffff;
                    margin-bottom: 15px;
                    font-size: 1.4rem;
                    font-weight: 600;
                    line-height: 1.4;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                }
                
                .opportunity-card p {
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 20px;
                    line-height: 1.7;
                    font-size: 0.95rem;
                }
                
                .source-info, .eligibility-info {
                    background: rgba(255, 255, 255, 0.08);
                    border-left: 3px solid ${categoryColors[category]};
                    padding: 10px 15px;
                    margin-bottom: 15px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.9);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .source-info i, .eligibility-info i {
                    color: ${categoryColors[category]};
                    font-size: 1rem;
                }
                
                .visit-btn {
                    background: linear-gradient(135deg, ${categoryColors[category]} 0%, ${categoryColors[category]}dd 100%);
                    color: white;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    box-shadow: 0 8px 20px ${categoryColors[category]}40;
                    position: relative;
                    overflow: hidden;
                }
                
                .visit-btn::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }
                
                .visit-btn:hover::before {
                    width: 300px;
                    height: 300px;
                }
                
                .visit-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 30px ${categoryColors[category]}60;
                }
                
                .visit-btn i {
                    position: relative;
                    z-index: 1;
                }
                
                .back-btn {
                    background: linear-gradient(135deg, rgba(108, 117, 125, 0.9) 0%, rgba(90, 98, 104, 0.9) 100%);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 12px 28px;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-bottom: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .back-btn:hover {
                    background: linear-gradient(135deg, rgba(90, 98, 104, 0.9) 0%, rgba(73, 80, 87, 0.9) 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
                }
                
                /* Staggered animation for cards */
                .opportunity-card:nth-child(1) { animation-delay: 0.1s; }
                .opportunity-card:nth-child(2) { animation-delay: 0.2s; }
                .opportunity-card:nth-child(3) { animation-delay: 0.3s; }
                .opportunity-card:nth-child(4) { animation-delay: 0.4s; }
                .opportunity-card:nth-child(5) { animation-delay: 0.5s; }
                .opportunity-card:nth-child(6) { animation-delay: 0.6s; }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Scrollbar styling */
                ::-webkit-scrollbar {
                    width: 12px;
                }
                
                ::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                ::-webkit-scrollbar-thumb {
                    background: ${categoryColors[category]};
                    border-radius: 6px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: ${categoryColors[category]}dd;
                }
                
                @media (max-width: 768px) {
                    .opportunities-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    
                    .header {
                        padding: 30px 20px;
                    }
                    
                    .header h1 {
                        font-size: 2rem;
                    }
                    
                    .header p {
                        font-size: 1rem;
                    }
                    
                    .opportunity-card {
                        padding: 20px;
                    }
                    
                    body {
                        padding: 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div style="display:flex;gap:12px;justify-content:center;margin-bottom:18px;">
                    <button class="back-btn" onclick="(function(){
                        if (window.opener && !window.opener.closed) {
                            try { window.opener.focus(); } catch (e) {}
                            window.close();
                        } else {
                            try { window.close(); } catch (e) { }
                        }
                    })()">
                        <i class="fas fa-home"></i> Back to Main Page
                    </button>
                </div>
                <div class="header">
                    <h1><i class="${categoryIcons[category]}"></i> ${categoryNames[category]}</h1>
                    <p>Available opportunities in ${stateName}</p>
                    ${collegeInfo}
                </div>
                <div class="opportunities-grid">
                    ${opportunities.length === 0 ? `<div style='grid-column:1/-1;text-align:center;font-size:1.2rem;color:${ACCENT_COLOR};'>No results found for the entered filter.</div>` :
                        opportunities.map(opportunity => `
                        <div class="opportunity-card">
                            <h3>${opportunity.name}</h3>
                            <p>${opportunity.description}</p>
                                ${opportunity.eligibilityText ? 
                                    `<div class="eligibility-info">
                                        <i class="fas fa-users"></i> ${opportunity.eligibilityText}
                                    </div>` : ''
                                }
                                ${opportunity.source ? 
                                    `<div class="source-info">
                                        <i class="fas fa-info-circle"></i> Source: ${opportunity.source}
                                    </div>` : ''
                                }
                            <a href="${opportunity.url}" target="_blank" class="visit-btn">
                                Visit Website <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `;
}

// Open content in new window centered on the screen
function openInNewWindow(content) {
    const w = 1000;
    const h = 700;
    const left = Math.max(0, Math.floor((screen.width - w) / 2));
    const top = Math.max(0, Math.floor((screen.height - h) / 2));
    const features = `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`;
    const newWindow = window.open('', '_blank', features);
    if (!newWindow) {
        // Popup blocked — fallback to opening in a new tab
        const fallback = window.open();
        fallback.document.write(content);
        fallback.document.close();
        return;
    }
    newWindow.document.write(content);
    newWindow.document.close();
    try { newWindow.focus(); } catch (e) {}
}

// Initialize the application
let authSystem;
let mainApp;
let themeManager;
let customCursor;
let pageTransition;

document.addEventListener('DOMContentLoaded', function() {
    themeManager = new ThemeManager();
    // Ensure mainApp is created before authSystem so that any post-login
    // calls to showMainApp() (which calls mainApp.init()) find a valid
    // mainApp instance and do not cause a runtime error.
    mainApp = new MainApp();
    authSystem = new AuthSystem();
    
    // Initialize AI System
    window.aiSystem.loadFromStorage();
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Initialize page transitions
    initPageTransitions();
    
    // Inject global modal CSS to center overlays and contents
    injectGlobalModalStyles();

    // Setup search functionality with autocomplete
    setupSearch();
    setupSearchAutocomplete();
    
    // Load initial recommendations
    loadRecommendations();

    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';

    // Setup insights panel
    setupInsightsPanel();
    
    // Initialize state selector
    initializeStateSelector();

    // Mobile nav: close when clicking outside and close on item click (small screens)
    const mobileToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        // Close nav when clicking outside
        document.addEventListener('click', function(e) {
            const target = e.target;
            if (window.innerWidth <= 900) {
                if (!navMenu.contains(target) && !mobileToggle.contains(target)) {
                    toggleMobileNav(false);
                }
            }
        });

        // Close nav when a nav-item is clicked (for single-page navigation)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 900) toggleMobileNav(false);
            });
        });
    }
});

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    // Enhanced function to calculate relevance score for search results
    function calculateRelevanceScore(item, query, queryWords) {
        let score = 0;
        const nameLower = item.name.toLowerCase();
        const descLower = item.description.toLowerCase();
        const sourceLower = (item.source || '').toLowerCase();
        const fullText = nameLower + ' ' + descLower + ' ' + sourceLower;
        
        // 1. Exact phrase match (highest priority)
        const exactQuery = query.toLowerCase().trim();
        if (nameLower === exactQuery) {
            score += 150; // Perfect match
        } else if (nameLower.includes(exactQuery)) {
            score += 100;
        } else if (descLower.includes(exactQuery)) {
            score += 50;
        } else if (fullText.includes(exactQuery)) {
            score += 30;
        }

        // 2. Word boundary matching (more accurate than substring)
        queryWords.forEach(word => {
            if (word.length > 2) {
                const wordRegex = new RegExp('\\b' + word + '\\b', 'i');
                if (wordRegex.test(nameLower)) {
                    score += 35;
                }
                if (wordRegex.test(descLower)) {
                    score += 15;
                }
            }
        });

        // 3. Partial word matches in name
        queryWords.forEach(word => {
            if (word.length > 2 && nameLower.includes(word)) {
                score += 25;
            }
        });

        // 4. Partial word matches in description
        queryWords.forEach(word => {
            if (word.length > 2 && descLower.includes(word)) {
                score += 12;
            }
        });

        // 5. Acronym matching (e.g., "NSP" matches "National Scholarship Portal")
        queryWords.forEach(word => {
            if (word.length >= 2 && word === word.toUpperCase()) {
                const nameWords = item.name.split(/\s+/);
                const acronym = nameWords.map(w => w[0] ? w[0].toUpperCase() : '').join('');
                if (acronym.includes(word)) {
                    score += 60;
                }
                // Also check partial acronyms
                if (acronym.startsWith(word)) {
                    score += 40;
                }
            }
        });

        // 6. Synonym and related term matching
        const synonymMap = {
            'scholarship': ['fellowship', 'grant', 'financial aid', 'award', 'bursary'],
            'internship': ['training', 'placement', 'apprenticeship', 'work experience'],
            'hackathon': ['coding competition', 'programming contest', 'hack'],
            'workshop': ['seminar', 'training', 'course', 'bootcamp', 'masterclass'],
            'government': ['govt', 'official', 'state', 'central', 'ministry'],
            'student': ['students', 'learner', 'undergraduate', 'graduate'],
            'college': ['university', 'institute', 'institution', 'school'],
            'technology': ['tech', 'it', 'computer', 'software', 'coding'],
            'engineering': ['technical', 'engineer'],
            'medical': ['medicine', 'healthcare', 'health']
        };

        queryWords.forEach(word => {
            Object.keys(synonymMap).forEach(key => {
                if (word === key || synonymMap[key].some(syn => word.includes(syn) || syn.includes(word))) {
                    if (fullText.includes(key)) {
                        score += 20;
                    }
                    synonymMap[key].forEach(synonym => {
                        if (fullText.includes(synonym)) {
                            score += 15;
                        }
                    });
                }
            });
        });

        // 7. Category-specific keyword boosting
        const categoryKeywords = {
            'scholarship': ['merit', 'need-based', 'minority', 'sc', 'st', 'obc', 'general', 'financial'],
            'hackathon': ['innovation', 'coding', 'problem solving', 'prizes', 'competition'],
            'internship': ['stipend', 'experience', 'industry', 'professional', 'career'],
            'workshop': ['skill', 'learning', 'certificate', 'hands-on', 'practical']
        };

        if (item.category && categoryKeywords[item.category]) {
            queryWords.forEach(word => {
                categoryKeywords[item.category].forEach(keyword => {
                    if (word.includes(keyword) || keyword.includes(word)) {
                        score += 18;
                    }
                });
            });
        }

        // 8. Priority boost for official/verified sources
        if (item.priority) {
            score += item.priority * 50;
        }

        if (sourceLower.includes('government') || sourceLower.includes('ministry') || 
            sourceLower.includes('official') || sourceLower.includes('govt')) {
            score += 30;
        }

        // 9. Boost for comprehensive schemes
        if (descLower.includes('all categories') || descLower.includes('all states') ||
            (descLower.includes('general') && descLower.includes('obc') && 
             descLower.includes('sc') && descLower.includes('st'))) {
            score += 40;
        }

        // 10. Fuzzy matching for typos (simple similarity check)
        queryWords.forEach(word => {
            if (word.length >= 4) {
                const words = fullText.split(/\s+/);
                words.forEach(textWord => {
                    if (textWord.length >= 4) {
                        const similarity = calculateStringSimilarity(word, textWord);
                        if (similarity > 0.75) { // 75% similar
                            score += similarity * 10;
                        }
                    }
                });
            }
        });

        // 11. Boost for recent or time-sensitive opportunities
        if (descLower.includes('apply now') || descLower.includes('deadline') || 
            descLower.includes('limited') || descLower.includes('2025') || descLower.includes('2026')) {
            score += 15;
        }

        // 12. Name starts with query (strong relevance indicator)
        if (nameLower.startsWith(query)) {
            score += 45;
        }

        return score;
    }

    // Helper function to calculate string similarity (0 to 1)
    function calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        let matches = 0;
        for (let i = 0; i < shorter.length; i++) {
            if (longer.includes(shorter[i])) {
                matches++;
            }
        }
        
        return matches / longer.length;
    }

    // Function to perform search across all opportunities with enhanced AI
    function searchAllOpportunities(query) {
        // Preprocess query
        query = query.toLowerCase().trim();
        
        // Auto-correct common misspellings
        const corrections = {
            'scholership': 'scholarship',
            'scholarshp': 'scholarship',
            'scolarship': 'scholarship',
            'internshp': 'internship',
            'intership': 'internship',
            'hackaton': 'hackathon',
            'workhop': 'workshop',
            'goverment': 'government',
            'govrnment': 'government',
            'studant': 'student',
            'collage': 'college',
            'tecnology': 'technology',
            'engeneering': 'engineering'
        };
        
        Object.keys(corrections).forEach(mistake => {
            const regex = new RegExp('\\b' + mistake + '\\b', 'gi');
            query = query.replace(regex, corrections[mistake]);
        });
        
        const queryWords = query.split(/\s+/).filter(word => word.length > 0);
        let results = [];
        
        // Get selected state - mandatory - ALWAYS fetch fresh from localStorage
        const selectedState = localStorage.getItem('selectedState');
        
        if (!selectedState) {
            // State not selected - show warning
            return {
                error: true,
                message: 'Please select your state first to search for opportunities.'
            };
        }
        
        // Search in ALL states to determine availability
        const allStates = Object.keys(stateOpportunities);
        const opportunityAvailability = {}; // Track which states have each opportunity
        
        // First, search in national/default opportunities
        const searchSources = [
            { data: defaultOpportunities, isNational: true, stateName: 'National' }
        ];
        
        // Add current state
        const stateData = stateOpportunities[selectedState] || {};
        searchSources.push({ data: stateData, isNational: false, stateName: selectedState });
        
        searchSources.forEach(source => {
            // Search in each category
            ['scholarships', 'hackathons', 'workshops', 'internships'].forEach(category => {
                if (source.data[category]) {
                    source.data[category].forEach(item => {
                        // Calculate relevance score
                        const score = calculateRelevanceScore(item, query, queryWords);
                        
                        if (score > 0) {
                            // Track availability across states
                            const itemKey = item.url;
                            if (!opportunityAvailability[itemKey]) {
                                opportunityAvailability[itemKey] = {
                                    states: [],
                                    isNational: source.isNational
                                };
                            }
                            
                            if (source.isNational) {
                                opportunityAvailability[itemKey].isNational = true;
                                opportunityAvailability[itemKey].states = ['All States'];
                            } else if (!opportunityAvailability[itemKey].isNational) {
                                opportunityAvailability[itemKey].states.push(formatStateName(source.stateName));
                            }
                            
                            results.push({
                                ...item,
                                category: category,
                                score: score,
                                isNational: source.isNational,
                                availableIn: source.isNational ? 'All States' : formatStateName(source.stateName),
                                itemKey: itemKey
                            });
                        }
                    });
                }
            });
        });
        
        // Now check other states for the same opportunities
        allStates.forEach(state => {
            if (state !== selectedState) {
                const otherStateData = stateOpportunities[state] || {};
                ['scholarships', 'hackathons', 'workshops', 'internships'].forEach(category => {
                    if (otherStateData[category]) {
                        otherStateData[category].forEach(item => {
                            const score = calculateRelevanceScore(item, query, queryWords);
                            if (score > 0) {
                                const itemKey = item.url;
                                if (opportunityAvailability[itemKey] && !opportunityAvailability[itemKey].isNational) {
                                    const formattedState = formatStateName(state);
                                    if (!opportunityAvailability[itemKey].states.includes(formattedState)) {
                                        opportunityAvailability[itemKey].states.push(formattedState);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
        
        // Update results with full availability info
        results = results.map(item => {
            const availability = opportunityAvailability[item.itemKey];
            if (availability) {
                if (availability.isNational) {
                    item.availableInStates = 'All States';
                    item.statesList = ['All States'];
                } else {
                    item.statesList = availability.states;
                    if (availability.states.length === 1) {
                        item.availableInStates = availability.states[0] + ' only';
                    } else if (availability.states.length <= 3) {
                        item.availableInStates = availability.states.join(', ');
                    } else {
                        item.availableInStates = `${availability.states.length} states`;
                    }
                }
            }
            return item;
        });

        // Remove duplicates based on URL and keep the highest scoring version
        results = Object.values(results.reduce((acc, item) => {
            if (!acc[item.url] || acc[item.url].score < item.score) {
                acc[item.url] = item;
            }
            return acc;
        }, {}));

        // Sort by score
        results.sort((a, b) => b.score - a.score);
        
        // Get fresh state name for display
        const currentState = localStorage.getItem('selectedState');
        const formattedStateName = formatStateName(currentState);
        
        return { error: false, results: results, selectedState: formattedStateName };
    }
    
    // Helper function to format state name
    function formatStateName(stateKey) {
        return stateKey.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // Function to display search results
    function displayResults(searchData) {
        if (!searchResults) {
            console.error('Search results container not found');
            return;
        }
        
        // Force clear previous results to prevent caching
        searchResults.innerHTML = '';
        searchResults.style.display = 'none'; // Hide first
        
        // Check if state selection error
        if (searchData.error) {
            searchResults.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 40px; background: rgba(255,107,107,0.2); border: 2px solid #E57373; border-radius: 15px; margin: 20px 0;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #E57373; margin-bottom: 15px;"></i>
                    <p style="color: white; font-size: 1.2rem; margin-bottom: 10px;">${searchData.message}</p>
                    <p style="color: rgba(255,255,255,0.7); font-size: 1rem;">Please select your state from the dropdown in the navigation bar above.</p>
                </div>
            `;
            searchResults.style.display = 'block';
            return;
        }
        
        const results = searchData.results;
        
        // ALWAYS get the current state directly from localStorage - don't trust passed parameter
        const currentStateKey = localStorage.getItem('selectedState');
        let displayState = 'your state';
        
        if (currentStateKey) {
            // Format the state name properly
            displayState = currentStateKey.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 15px; margin: 20px 0;">
                    <i class="fas fa-search" style="font-size: 3rem; color: #667eea; margin-bottom: 15px;"></i>
                    <p style="color: white; font-size: 1.2rem; margin-bottom: 10px;">No matching opportunities found for ${displayState}.</p>
                    <p style="color: rgba(255,255,255,0.7); font-size: 1rem;">Try different search terms or browse by category.</p>
                </div>
            `;
            searchResults.style.display = 'block';
            return;
        }

        // Group results by category
        const grouped = results.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});

        const categoryIcons = {
            scholarships: 'fa-award',
            hackathons: 'fa-code',
            workshops: 'fa-tools',
            internships: 'fa-briefcase'
        };

        const categoryColors = {
            scholarships: '#26A69A',
            hackathons: '#E57373',
            workshops: '#42A5F5',
            internships: '#9575CD'
        };

        // Generate HTML for results
        let html = `<div style="padding: 20px 0;">
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <p style="color: white; margin: 0; font-size: 1.1rem;">
                    <i class="fas fa-check-circle" style="color: #26A69A;"></i>
                    <strong>${results.length}</strong> opportunities available
                </p>
            </div>`;
        
        Object.entries(grouped).forEach(([category, items]) => {
            const icon = categoryIcons[category] || 'fa-star';
            const color = categoryColors[category] || '#667eea';
            
            html += `
                <div class="search-category" style="margin-bottom: 30px;">
                    <h3 style="color: white; font-size: 1.5rem; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas ${icon}" style="color: ${color};"></i>
                        ${category.charAt(0).toUpperCase() + category.slice(1)}
                        <span style="font-size: 0.9rem; font-weight: normal; color: rgba(255,255,255,0.6);">(${items.length})</span>
                    </h3>
                    <div class="search-items" style="display: grid; gap: 20px;">
                        ${items.slice(0, 10).map(item => {
                            const itemJson = JSON.stringify(item).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                            const isSaved = window.dashboardManager ? window.dashboardManager.isSaved(item.url) : false;
                            return `
                            <div class="search-item" style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-left: 4px solid ${color}; padding: 20px; border-radius: 12px; transition: all 0.3s ease; position: relative;">
                                <button class="save-btn ${isSaved ? 'saved' : ''}" data-item='${itemJson}' data-url="${item.url}" title="${isSaved ? 'Unsave' : 'Save opportunity'}">
                                    <i class="fas fa-heart"></i>
                                </button>
                                <button class="compare-btn" data-item='${itemJson}' title="Add to compare">
                                    <i class="fas fa-balance-scale"></i>
                                </button>
                                <div class="search-item-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                                    <h4 style="color: white; font-size: 1.2rem; margin: 0; flex: 1; min-width: 200px; padding-right: 120px;">${item.name}</h4>
                                    <span class="relevance-score" style="background: ${color}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                                        <i class="fas fa-chart-line"></i>
                                        ${Math.min(100, Math.max(60, Math.round(item.score / 3.5)))}% Match
                                    </span>
                                </div>
                                <p style="color: rgba(255,255,255,0.8); margin-bottom: 15px; line-height: 1.6;">${item.description}</p>
                                
                                <div style="background: ${item.isNational ? 'rgba(76, 175, 80, 0.15)' : 'rgba(33, 150, 243, 0.15)'}; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid ${item.isNational ? '#4CAF50' : '#2196F3'};">
                                    <div style="color: white; font-size: 0.9rem; display: flex; align-items: start; gap: 8px; flex-wrap: wrap;">
                                        <div style="display: flex; align-items: center; gap: 8px; min-width: 100%;">
                                            <i class="fas ${item.isNational ? 'fa-globe' : 'fa-map-marker-alt'}" style="color: ${item.isNational ? '#4CAF50' : '#2196F3'}; font-size: 1.1rem;"></i>
                                            <strong style="color: ${item.isNational ? '#4CAF50' : '#2196F3'};">State Availability:</strong>
                                        </div>
                                        ${item.isNational ? `
                                            <span style="color: rgba(255,255,255,0.95); margin-left: 28px; font-weight: 500;">
                                                ✓ Available in <strong>All States</strong> across India
                                            </span>
                                        ` : `
                                            <div style="margin-left: 28px; color: rgba(255,255,255,0.95);">
                                                ${item.statesList && item.statesList.length > 0 ? `
                                                    ${item.statesList.length === 1 ? `
                                                        <span>Available only in <strong>${item.statesList[0]}</strong></span>
                                                    ` : item.statesList.length <= 5 ? `
                                                        <span>Available in: <strong>${item.statesList.join(', ')}</strong></span>
                                                    ` : `
                                                        <span>Available in <strong>${item.statesList.length} states</strong></span>
                                                        <details style="margin-top: 5px;">
                                                            <summary style="cursor: pointer; color: #2196F3; font-size: 0.85rem;">View all states</summary>
                                                            <div style="margin-top: 5px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 0.85rem;">
                                                                ${item.statesList.join(', ')}
                                                            </div>
                                                        </details>
                                                    `}
                                                ` : `
                                                    <span>State-specific opportunity</span>
                                                `}
                                            </div>
                                        `}
                                    </div>
                                </div>
                                
                                ${item.source ? `
                                    <div class="source-info" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                                        <i class="fas fa-info-circle" style="color: ${color};"></i>
                                        <span style="color: rgba(255,255,255,0.9); font-size: 0.9rem;">Source: ${item.source}</span>
                                    </div>
                                ` : ''}
                                <a href="${item.url}" target="_blank" class="search-item-link" style="display: inline-flex; align-items: center; gap: 8px; background: ${color}; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.3s ease;">
                                    View Details <i class="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        searchResults.innerHTML = html;
        searchResults.style.display = 'block';
        
        // Add hover effects
        document.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        });

        // Add click handlers to save buttons
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const url = this.getAttribute('data-url');
                const itemJson = this.getAttribute('data-item');
                
                if (url && itemJson) {
                    try {
                        const itemData = JSON.parse(itemJson.replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
                        toggleSaveFromSearch(url, itemData, this);
                    } catch (err) {
                        console.error('Error parsing item data:', err);
                        if (window.authSystem) {
                            window.authSystem.showToast('Error saving opportunity', 'error');
                        }
                    }
                }
            });
        });

        // Update save button states
        if (window.dashboardManager) {
            document.querySelectorAll('.save-btn').forEach(btn => {
                const url = btn.getAttribute('data-url');
                if (url) {
                    const isSaved = window.dashboardManager.isSaved(url);
                    if (isSaved) {
                        btn.classList.add('saved');
                        btn.title = 'Unsave';
                    } else {
                        btn.classList.remove('saved');
                        btn.title = 'Save opportunity';
                    }
                }
            });
        }

        // Add click handlers to compare buttons
        document.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const itemJson = this.getAttribute('data-item');
                
                if (itemJson && window.comparisonTool) {
                    try {
                        const itemData = JSON.parse(itemJson.replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
                        window.comparisonTool.addToComparison(itemData);
                    } catch (err) {
                        console.error('Error parsing item data:', err);
                        if (window.authSystem) {
                            window.authSystem.showToast('Error adding to comparison', 'error');
                        }
                    }
                }
            });
        });

        // Update comparison button states
        if (window.comparisonTool) {
            window.comparisonTool.updateComparisonBadge();
        }
    }

    // Function to toggle save opportunity from search results
    window.toggleSaveFromSearch = function(url, itemData, buttonElement) {
        console.log('toggleSaveFromSearch called:', { url, itemData });
        
        if (!window.dashboardManager) {
            console.error('Dashboard manager not initialized');
            if (window.authSystem) {
                window.authSystem.showToast('Please wait while dashboard initializes...', 'info');
            }
            return;
        }

        const isSaved = window.dashboardManager.toggleSaveOpportunity(itemData);
        console.log('Save toggled, isSaved:', isSaved);
        
        // Update button state
        if (buttonElement) {
            if (isSaved) {
                buttonElement.classList.add('saved');
                buttonElement.title = 'Unsave';
            } else {
                buttonElement.classList.remove('saved');
                buttonElement.title = 'Save opportunity';
            }
        }
        
        // Update all buttons with same URL
        const buttons = document.querySelectorAll(`.save-btn[data-url="${url}"]`);
        buttons.forEach(btn => {
            if (isSaved) {
                btn.classList.add('saved');
                btn.title = 'Unsave';
            } else {
                btn.classList.remove('saved');
                btn.title = 'Save opportunity';
            }
        });

        // Show feedback
        if (window.authSystem) {
            window.authSystem.showToast(
                isSaved ? 'Opportunity saved to dashboard! ❤️' : 'Opportunity removed from dashboard',
                'success'
            );
        }
    };

    // Function to perform search
    function performSearch() {
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 15px; margin: 20px 0;">
                    <i class="fas fa-info-circle" style="font-size: 3rem; color: #667eea; margin-bottom: 15px;"></i>
                    <p style="color: white; font-size: 1.2rem;">Please enter at least 2 characters to search.</p>
                </div>
            `;
            searchResults.style.display = 'block';
            return;
        }

        // Hide suggestions
        const suggestionsBox = document.getElementById('searchSuggestions');
        if (suggestionsBox) {
            suggestionsBox.style.display = 'none';
        }

        // Perform search - this will fetch fresh state internally
        const searchData = searchAllOpportunities(query);
        
        // Display results
        displayResults(searchData);
    }

    // Make performSearch available globally for selectSuggestion
    window.performSearch = performSearch;

    // Setup search event listeners
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            const results = searchAllOpportunities(query);
            displayResults(results);
        } else {
            searchResults.innerHTML = '';
        }
    }, 300));

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            const results = searchAllOpportunities(query);
            displayResults(results);
        }
    });

    // Add enter key support
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                const results = searchAllOpportunities(query);
                displayResults(results);
            }
        }
    });
}

// Perform search using AI system
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    const activeFilter = document.querySelector('.filter-tag.active')?.textContent.toLowerCase() || 'all';

    // Hide suggestions when searching
    const suggestionsBox = document.getElementById('searchSuggestions');
    if (suggestionsBox) {
        suggestionsBox.style.display = 'none';
    }

    if (!query) {
        loadRecommendations();
        return;
    }

    let results = [];
    if (activeFilter === 'all') {
        // Search across all categories with the enhanced AI
        ['scholarships', 'hackathons', 'workshops', 'internships'].forEach(category => {
            const categoryResults = window.aiSystem.searchOpportunities(category, query);
            categoryResults.forEach(result => {
                result.category = category; // Add category for display
            });
            results = results.concat(categoryResults);
        });
        // Sort all results by score
        results.sort((a, b) => b.score - a.score);
    } else {
        const category = activeFilter.endsWith('s') ? activeFilter.slice(0, -1) : activeFilter;
        results = window.aiSystem.searchOpportunities(category, query);
        results.forEach(result => {
            result.category = category;
        });
    }

    updateRecommendations(results, query);
}

// Setup search autocomplete
function setupSearchAutocomplete() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // Create suggestions dropdown
    const suggestionsBox = document.createElement('div');
    suggestionsBox.id = 'searchSuggestions';
    suggestionsBox.className = 'search-suggestions';
    suggestionsBox.style.display = 'none';
    searchInput.parentElement.style.position = 'relative';
    searchInput.parentElement.appendChild(suggestionsBox);

    searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.trim().toLowerCase();
        const suggestionsBox = document.getElementById('searchSuggestions');
        
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        const activeFilter = document.querySelector('.filter-tag.active')?.textContent.toLowerCase();
        const category = activeFilter && activeFilter !== 'all' ? 
            (activeFilter.endsWith('s') ? activeFilter.slice(0, -1) : activeFilter) : null;
        
        const suggestions = window.getSearchSuggestions(query, category);
        
        if (suggestions.length > 0) {
            suggestionsBox.innerHTML = suggestions.map(suggestion => 
                `<div class="suggestion-item" onclick="selectSuggestion('${suggestion.replace(/'/g, "\\'")}')">${suggestion}</div>`
            ).join('');
            suggestionsBox.style.display = 'block';
        } else {
            suggestionsBox.style.display = 'none';
        }
    }, 300));

    // Hide suggestions on click outside
    document.addEventListener('click', function(e) {
        const suggestionsBox = document.getElementById('searchSuggestions');
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = 'none';
        }
    });

    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            const suggestionsBox = document.getElementById('searchSuggestions');
            if (suggestionsBox) {
                suggestionsBox.style.display = 'none';
            }
            performSearch();
        }
    });
    
    // Backup Enter key handler
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            const suggestionsBox = document.getElementById('searchSuggestions');
            if (suggestionsBox) {
                suggestionsBox.style.display = 'none';
            }
            performSearch();
        }
    });
}

// Select a suggestion
function selectSuggestion(suggestion) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = suggestion;
    document.getElementById('searchSuggestions').style.display = 'none';
    if (window.performSearch) {
        window.performSearch();
    }
}

// Load AI recommendations
function loadRecommendations() {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    const insights = window.aiSystem.generateInsights();

    let recommendationsHTML = '';
    Object.entries(insights.recommendedOpportunities).forEach(([category, items]) => {
        items.forEach(item => {
            recommendationsHTML += `
                <div class="recommendation-card" onclick="viewOpportunity('${category}', '${item.id}')">
                    <span class="recommendation-score">${Math.round(item.score)}% Match</span>
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
            `;
        });
    });

    recommendationsGrid.innerHTML = recommendationsHTML;
}

// Update recommendations based on search results (enhanced)
function updateRecommendations(results, query = '') {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    
    if (results.length === 0) {
        // Show helpful message with search tips
        const hints = window.aiSystem.generateSearchHints();
        recommendationsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 15px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #4ECDC4; margin-bottom: 20px;"></i>
                <h3 style="color: white; margin-bottom: 10px;">No results found for "${query}"</h3>
                <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">Try different keywords or check the suggestions below:</p>
                <div style="text-align: left; max-width: 600px; margin: 0 auto; background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px;">
                    ${hints.map(hint => `
                        <h4 style="color: #4ECDC4; margin-top: 15px; margin-bottom: 10px;">
                            <i class="fas fa-lightbulb"></i> ${hint.title}
                        </h4>
                        <ul style="color: white; list-style: none; padding-left: 0;">
                            ${hint.tips.map(tip => `<li style="padding: 5px 0;">• ${tip}</li>`).join('')}
                        </ul>
                    `).join('')}
                </div>
            </div>
        `;
        return;
    }

    // Show results count and relevance info
    const headerHTML = `
        <div style="grid-column: 1/-1; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-bottom: 10px;">
            <p style="color: white; margin: 0;">
                <i class="fas fa-check-circle" style="color: #4ECDC4;"></i>
                Found <strong>${results.length}</strong> relevant opportunities
                ${query ? ` for "<em>${query}</em>"` : ''}
                <span style="float: right; font-size: 0.9rem; opacity: 0.8;">
                    Sorted by relevance
                </span>
            </p>
        </div>
    `;

    const cardsHTML = results.slice(0, 20).map((item, index) => {
        const categoryIcons = {
            scholarships: 'fa-award',
            hackathons: 'fa-code',
            workshops: 'fa-tools',
            internships: 'fa-briefcase'
        };
        const categoryColors = {
            scholarships: '#26A69A',
            hackathons: '#E57373',
            workshops: '#42A5F5',
            internships: '#9575CD'
        };
        
        const category = item.category || 'scholarships';
        const categoryIcon = categoryIcons[category] || 'fa-star';
        const categoryColor = categoryColors[category] || '#4ECDC4';
        
        return `
            <div class="recommendation-card" onclick="viewOpportunity('${category}', '${item.id || item.url}'); window.aiSystem.trackInteraction('click', {category: '${category}', itemId: '${item.id || item.url}', searchQuery: '${query}', position: ${index + 1}});">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span class="recommendation-score" style="background: ${categoryColor};">
                        ${Math.round((item.score / Math.max(...results.map(r => r.score))) * 100)}% Match
                    </span>
                    <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; color: white;">
                        <i class="fas ${categoryIcon}"></i> ${category}
                    </span>
                </div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                ${item.source ? `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; color: rgba(255,255,255,0.7);">
                    <i class="fas fa-building"></i> ${item.source}
                </div>` : ''}
            </div>
        `;
    }).join('');

    recommendationsGrid.innerHTML = headerHTML + cardsHTML;
    
    // Show "Load More" if there are more results
    if (results.length > 20) {
        recommendationsGrid.innerHTML += `
            <div style="grid-column: 1/-1; text-align: center; padding: 20px;">
                <button onclick="showAllResults()" style="padding: 12px 30px; background: #4ECDC4; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                    Show ${results.length - 20} More Results
                </button>
            </div>
        `;
    }
}

// Setup insights panel (toggle button removed - only new chatbot icon should appear)
function setupInsightsPanel() {
    const panel = document.createElement('div');
    panel.className = 'insights-panel';
    panel.innerHTML = `
        <h2><i class="fas fa-chart-line"></i> AI Insights</h2>
        <div id="insightsContent"></div>
    `;

    // Robot icon toggle removed - using new chatbot instead
    // Keep the panel element for functionality but no visible toggle
    document.body.appendChild(panel);
}

// Update insights panel content
function updateInsights() {
    const insights = window.aiSystem.generateInsights();
    const content = document.getElementById('insightsContent');

    content.innerHTML = `
        <div class="insights-section">
            <h3>Top Categories</h3>
            <p>${insights.topCategories.join(', ')}</p>
        </div>
        <div class="insights-section">
            <h3>Search Trends</h3>
            <ul>
                ${insights.searchTrends.map(trend => `
                    <li>${trend.keyword} (${trend.count} searches)</li>
                `).join('')}
            </ul>
        </div>
        <div class="insights-section">
            <h3>Category Insights</h3>
            ${Object.entries(insights.categoryInsights).map(([category, data]) => `
                <div class="category-insight">
                    <h4>${category}</h4>
                    <p>Interaction Rate: ${Math.round(data.interactionRate * 100)}%</p>
                    <p>Popular Filters: ${Object.entries(data.popularFilters).map(([k,v]) => `${k}: ${v}`).join(', ')}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// View opportunity details and track interaction
function viewOpportunity(category, id) {
    window.aiSystem.trackInteraction('view', { category, itemId: id });
    // Open the opportunity in a new window/tab
    const opportunity = window.aiSystem.getAllOpportunities(category).find(o => o.id === id);
    if (opportunity) {
        window.open(opportunity.url, '_blank');
    }
}

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Inject global modal styles so all modals are centered and overlay full window
function injectGlobalModalStyles() {
    const css = `
    .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 1;
    }
    .modal-content {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.25);
        padding: 22px;
        max-width: 700px;
        width: 96%;
        transform: scale(1);
        transition: transform 0.2s ease-out;
        position: relative;
    }
    .scholarship-modal .modal-content,
    .state-select-modal .modal-content {
        max-width: 520px;
    }
    .modal-close {
        position: absolute;
        top: 12px;
        right: 12px;
        background: transparent;
        border: none;
        font-size: 1.1rem;
        cursor: pointer;
    }
    /* Modal header styling to ensure heading contrast */
    .modal-header {
        padding: 18px 20px;
        border-radius: 12px 12px 0 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        text-align: center;
        position: relative;
        margin: -22px -22px 12px -22px; /* extend header to modal edges */
    }
    .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: #ffffff;
        display: inline-block;
    }
    .modal-body { padding: 6px 4px 18px 4px; }
    `;
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
}

// Custom Cursor System
function initCustomCursor() {
    customCursor = document.getElementById('customCursor');
    // We no longer use the customCursor element for the pointer. Instead
    // we create short-lived sparkle elements that follow the pointer.
    let lastMove = 0;
    const TRAIL_THROTTLE_MS = 160; // increased throttle to reduce drop rate
    const MAX_ACTIVE_TRAILS = 12; // cap simultaneous sparkles

    document.addEventListener('mousemove', function(e) {
        const now = performance.now();
        // Throttle creation to avoid too many elements
        if (now - lastMove < TRAIL_THROTTLE_MS) return;
        lastMove = now;

        // Limit total active trail elements
        const active = document.querySelectorAll('.cursor-trail').length;
        if (active >= MAX_ACTIVE_TRAILS) return;

        // Create a sparkle element
        const sparkle = document.createElement('div');
        sparkle.className = 'cursor-trail';
        // Randomize color slightly for variety
        const colors = ['rgba(255,255,255,0.95)', 'rgba(255,220,80,0.95)', 'rgba(102,126,234,0.95)'];
        sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        document.body.appendChild(sparkle);

        // Remove after animation ends (800ms as defined in CSS)
        setTimeout(() => {
            sparkle.remove();
        }, 900);
    });
    
    // Add hover effects
    const hoverElements = document.querySelectorAll('button, a, .option-card, .nav-item');
    hoverElements.forEach(element => {
        // Add a small burst effect on hover using sparkles
        element.addEventListener('mouseenter', (e) => {
            // create a few sparkles at element center (reduced count)
            const rect = element.getBoundingClientRect();
            const burstCount = 3; // smaller burst for subtler effect
            for (let i = 0; i < burstCount; i++) {
                const s = document.createElement('div');
                s.className = 'cursor-trail';
                s.style.background = 'rgba(255,255,255,0.9)';
                s.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 40) + 'px';
                s.style.top = (rect.top + rect.height / 2 + (Math.random() - 0.5) * 40) + 'px';
                s.style.width = s.style.height = (6 + Math.random() * 6) + 'px';
                document.body.appendChild(s);
                setTimeout(() => s.remove(), 900);
            }
        });
    });
}

// Page Transition System
function initPageTransitions() {
    pageTransition = document.getElementById('pageTransition');
    
    // Add transition to category page opening
    const originalOpenCategory = window.openCategory;
    window.openCategory = function(category) {
        showPageTransition(() => {
            originalOpenCategory(category);
        });
    };
}

function showPageTransition(callback) {
    pageTransition.classList.add('active');
    
    setTimeout(() => {
        if (callback) callback();
        setTimeout(() => {
            pageTransition.classList.remove('active');
        }, 300);
    }, 500);
}

// Add smooth transitions for all elements
document.documentElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

// Initialize navbar state selector
function initializeStateSelector() {
    console.log('Initializing state selector...');
    const stateSelect = document.getElementById('stateSelect');
    console.log('stateSelect element:', stateSelect);
    if (!stateSelect) {
        console.error('stateSelect not found!');
        return;
    }
    
    // Load stored state and set dropdown value
    const storedState = localStorage.getItem('selectedState');
    console.log('Stored state:', storedState);
    if (storedState) {
        stateSelect.value = storedState;
        console.log('Set dropdown value to:', storedState);
    }
    
    // Add change event listener
    stateSelect.addEventListener('change', function() {
        console.log('State dropdown changed to:', this.value);
        const newState = this.value;
        if (newState) {
            // Update stored state immediately
            localStorage.setItem('selectedState', newState);
            console.log('Saved state to localStorage:', newState);
            
            // Force a storage event for same-tab detection
            window.dispatchEvent(new Event('storage'));
            
            // Show toast notification
            const stateName = this.options[this.selectedIndex].text;
            authSystem.showToast(`State changed to ${stateName}`, 'success');
            
            // Refresh search results if search is active
            const searchInput = document.getElementById('searchInput');
            const searchResults = document.getElementById('searchResults');
            
            // Always re-search if there's any search query or visible results
            const hasSearchQuery = searchInput && searchInput.value.trim().length > 0;
            const hasVisibleResults = searchResults && searchResults.innerHTML.trim().length > 0;
            
            if (hasSearchQuery || hasVisibleResults) {
                // Force immediate re-search with slight delay to ensure state is persisted
                setTimeout(() => {
                    if (window.performSearch) {
                        window.performSearch();
                    }
                }, 50);
            }
        }
    });
}
