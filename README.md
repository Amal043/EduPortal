# 🎓 Educational Opportunities Portal

A modern, responsive website with **real database authentication** and **dark/light theme toggle** that helps users discover scholarships, hackathons, workshops, and internships based on their state selection.

## ✨ Features

### 🔐 Real Database Authentication (Supabase)
- **Secure Registration**: Create accounts with email verification
- **Real Login System**: Password-protected access with Supabase backend
- **Session Management**: Persistent login with automatic refresh
- **Email Verification**: Optional email confirmation system
- **Password Security**: Encrypted password storage
- **User Management**: Complete user lifecycle management

### 🌙 Dark/Light Theme Toggle
- **Theme Switching**: Toggle between dark and light modes
- **Persistent Theme**: Remembers your preference
- **Smooth Transitions**: Beautiful animations between themes
- **Accessible Design**: High contrast and readable colors
- **Multiple Toggle Points**: Available in auth screen and main app

### 🎨 Modern UI/UX Design
- **Glassmorphism Effects**: Modern glass-like design elements
- **Attractive Color Palette**: Beautiful colors (no green as requested)
- **Smooth Animations**: Fade-in, slide-up, and hover effects
- **Responsive Layout**: Perfect on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects, loading states, and micro-animations
- **Toast Notifications**: Real-time feedback for user actions

### 🌍 State-Based Content
- **Comprehensive State List**: All Indian states and union territories
- **Four Categories**: Scholarships, Hackathons, Workshops, Internships
- **Dynamic Content**: State-specific opportunities with national fallbacks
- **New Window Navigation**: Each category opens in a separate window
- **Working Links**: Real website links for each opportunity

## 📁 Files Structure

```
JARVIS/
├── index.html              # Main HTML with authentication & theme toggle
├── styles.css              # Enhanced CSS with dark/light themes
├── script.js               # JavaScript with Supabase integration
├── README.md               # This documentation
└── SUPABASE_SETUP.md       # Supabase configuration guide
```

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for Supabase
- Basic understanding of web development

### Setup Steps

1. **Clone/Download** the project files
2. **Set up Supabase** (see `SUPABASE_SETUP.md` for detailed instructions):
   - Create a Supabase project
   - Get your project URL and API key
   - Update credentials in `script.js`
3. **Open `index.html`** in your web browser
4. **Start using** the application!

## 🛠️ Supabase Configuration

### Required Credentials
Update these in `script.js`:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### Quick Setup
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon public** key
5. Replace placeholders in `script.js`

**Detailed setup guide**: See `SUPABASE_SETUP.md`

## 🎨 Color Scheme

### Light Theme
- **Primary**: Blue gradient (#667eea to #764ba2)
- **Success**: Teal (#4ECDC4)
- **Error**: Coral (#ff6b6b)
- **Warning**: Orange (#ffa726)
- **Info**: Blue (#42a5f5)

### Dark Theme
- **Primary**: Purple gradient (#8b5cf6 to #a855f7)
- **Success**: Emerald (#10b981)
- **Error**: Red (#ef4444)
- **Warning**: Amber (#f59e0b)
- **Info**: Blue (#3b82f6)

## 🚀 How to Use

### First Time Setup
1. **Open Website**: Open `index.html` in your browser
2. **Create Account**: Click "Sign Up" and fill in details
3. **Verify Email**: Check your email for verification (if enabled)
4. **Login**: Use your credentials to access the portal

### Daily Usage
1. **Login**: Enter your email and password
2. **Toggle Theme**: Click the sun/moon icon to switch themes
3. **Select State**: Choose your state from the dropdown
4. **Explore Categories**: Click on any category card
5. **Visit Links**: Click "Visit Website" to go to external sites
6. **Logout**: Click logout when done

## 🛠️ Technical Features

### Authentication System
- **Supabase Integration**: Real database backend
- **JWT Tokens**: Secure session management
- **Email Verification**: Optional account verification
- **Password Hashing**: Secure password storage
- **Session Persistence**: Automatic login refresh

### Theme System
- **CSS Custom Properties**: Dynamic theme switching
- **Local Storage**: Persistent theme preference
- **Smooth Transitions**: Animated theme changes
- **Accessibility**: High contrast and readable colors

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility
- **CSS3**: Modern styling with custom properties
- **JavaScript ES6+**: Modern JavaScript with classes
- **Font Awesome**: Beautiful icons throughout
- **Google Fonts**: Poppins font family

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1200px+ (4-column grid)
- **Tablet**: 768px-1199px (2-column grid)
- **Mobile**: Below 768px (single column)
- **Small Mobile**: Below 480px (optimized layout)

### Features
- **Mobile-First**: Designed for mobile devices first
- **Touch-Friendly**: Large buttons and touch targets
- **Flexible Layouts**: CSS Grid and Flexbox
- **Optimized Images**: Responsive image handling

## 🌐 Browser Compatibility

- **Chrome** 90+ (recommended)
- **Firefox** 88+
- **Safari** 14+ (with webkit prefixes)
- **Edge** 90+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🔒 Security Features

- **HTTPS Required**: Secure connections only
- **Row Level Security**: Database-level security
- **Input Validation**: Client and server-side validation
- **Password Requirements**: Minimum 6 characters
- **Session Management**: Secure token handling
- **CORS Protection**: Cross-origin request security

## 📊 Performance Features

- **Optimized CSS**: Efficient selectors and minimal redundancy
- **Minimal JavaScript**: Fast loading and execution
- **Lazy Loading**: Content loads as needed
- **Smooth Animations**: Hardware-accelerated transitions
- **Efficient Queries**: Optimized database calls

## ♿ Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Semantic HTML and ARIA labels
- **High Contrast**: Readable color combinations
- **Focus Indicators**: Clear focus states
- **Alternative Text**: Descriptive alt attributes

## 🔧 Customization

### Adding New States
Edit the `stateOpportunities` object in `script.js`:

```javascript
'your-state': {
    scholarships: [
        { name: 'State Scholarship', url: 'https://example.com', description: 'Description' }
    ],
    // ... other categories
}
```

### Modifying Themes
Update CSS custom properties in `:root` and `[data-theme="dark"]`:

```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* ... other variables */
}
```

### Adding Features
- **User Profiles**: Extend user data in Supabase
- **Favorites**: Add bookmark functionality
- **Search**: Implement filtering system
- **Notifications**: Add email/push notifications

## 🚀 Future Enhancements

### Planned Features
- **User Profiles**: Extended user information and avatars
- **Favorites System**: Save preferred opportunities
- **Advanced Search**: Filter by multiple criteria
- **Email Notifications**: Real-time updates
- **Admin Dashboard**: Manage users and content
- **Analytics**: Track user behavior and preferences

### Technical Improvements
- **Progressive Web App**: Offline functionality
- **Push Notifications**: Real-time updates
- **Social Login**: Google/Facebook integration
- **API Rate Limiting**: Prevent abuse
- **Caching**: Improved performance

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check Supabase URL and key in `script.js`
   - Verify project is active in Supabase dashboard

2. **"Email not confirmed"**
   - Check email for verification link
   - Disable email confirmation in Supabase settings for testing

3. **Theme not switching**
   - Check browser console for JavaScript errors
   - Ensure CSS custom properties are supported

4. **Mobile layout issues**
   - Check viewport meta tag
   - Test on different screen sizes

### Debugging Steps
1. **Check Browser Console** (F12) for errors
2. **Verify Supabase Connection** in dashboard
3. **Test Network Requests** in dev tools
4. **Check Local Storage** for theme preference
5. **Verify File Paths** are correct

## 📞 Support

### Getting Help
1. **Check Documentation**: Read this README and SUPABASE_SETUP.md
2. **Browser Console**: Look for error messages
3. **Supabase Dashboard**: Check authentication logs
4. **Community**: Join Supabase Discord for help

### Reporting Issues
- **Browser**: Include browser version and OS
- **Error Messages**: Copy exact error text
- **Steps to Reproduce**: Detailed reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Supabase**: For the amazing backend-as-a-service platform
- **Font Awesome**: For the beautiful icons
- **Google Fonts**: For the Poppins font family
- **CSS-Tricks**: For glassmorphism design inspiration

---

**🎓 Ready to explore educational opportunities? Start your journey today! ✨**

### Quick Links
- [Supabase Documentation](https://supabase.com/docs)
- [Font Awesome Icons](https://fontawesome.com)
- [Google Fonts](https://fonts.google.com)
- [CSS Glassmorphism Guide](https://css-tricks.com/glassmorphism-design-trend/)
