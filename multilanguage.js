// ============================================
// SIMPLIFIED MULTI-LANGUAGE SYSTEM v2.0
// English & Hindi Support
// ============================================

class LanguageSystem {
    constructor() {
        this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
        this.translations = this.initTranslations();
        this.speechRecognition = null;
        this.initVoiceSearch();
        console.log('🌐 Language System Initialized - Current:', this.currentLang);
    }

    initTranslations() {
        return {
            en: {
                // Navigation
                home: 'Home',
                dashboard: 'Dashboard',
                compare: 'Compare',
                
                // Search
                search: 'Search',
                searchPlaceholder: 'Search here for opportunities...',
                
                // State Selector
                selectState: 'Select Your State',
                
                // Portal Header
                portalTitle: 'Educational Opportunities Portal',
                portalSubtitle: 'Discover scholarships, hackathons, workshops, and internships tailored to your state',
                
                // Main Section
                availableOpportunities: 'Available Opportunities',
                
                // Opportunity Categories
                scholarships: 'Scholarships',
                scholarshipsDesc: 'Find financial aid and scholarship opportunities for your education',
                hackathons: 'Hackathons',
                hackathonsDesc: 'Participate in coding competitions and innovation challenges',
                workshops: 'Workshops',
                workshopsDesc: 'Join skill development workshops and training programs',
                internships: 'Internships',
                internshipsDesc: 'Discover internship opportunities to gain practical experience',
                
                // Buttons
                explore: 'Explore',
                apply: 'Apply',
                save: 'Save',
                unsave: 'Unsave',
                share: 'Share',
                close: 'Close',
                cancel: 'Cancel',
                submit: 'Submit',
                
                // Dashboard
                savedOpportunities: 'Saved Opportunities',
                applicationTracker: 'Application Tracker',
                upcomingDeadlines: 'Upcoming Deadlines',
                trendingOpportunities: 'Trending Opportunities',
                educationNews: 'Education News',
                
                // Comparison
                addToComparison: 'Add to Comparison',
                removeFromComparison: 'Remove from Comparison',
                compareNow: 'Compare Now',
                
                // Other
                loading: 'Loading...',
                error: 'Error',
                success: 'Success',
                viewDetails: 'View Details',
                deadline: 'Deadline',
                source: 'Source',
                allIndia: 'All India',
                stateSpecific: 'State Specific',
                customize: 'Customize Layout',
                done: 'Done',
                
                // States
                state_ap: 'Andhra Pradesh',
                state_ar: 'Arunachal Pradesh',
                state_as: 'Assam',
                state_br: 'Bihar',
                state_cg: 'Chhattisgarh',
                state_ga: 'Goa',
                state_gj: 'Gujarat',
                state_hr: 'Haryana',
                state_hp: 'Himachal Pradesh',
                state_jh: 'Jharkhand',
                state_ka: 'Karnataka',
                state_kl: 'Kerala',
                state_mp: 'Madhya Pradesh',
                state_mh: 'Maharashtra',
                state_mn: 'Manipur',
                state_ml: 'Meghalaya',
                state_mz: 'Mizoram',
                state_nl: 'Nagaland',
                state_or: 'Odisha',
                state_pb: 'Punjab',
                state_rj: 'Rajasthan',
                state_sk: 'Sikkim',
                state_tn: 'Tamil Nadu',
                state_tg: 'Telangana',
                state_tr: 'Tripura',
                state_up: 'Uttar Pradesh',
                state_uk: 'Uttarakhand',
                state_wb: 'West Bengal',
                state_dl: 'Delhi',
                state_ch: 'Chandigarh',
                state_jk: 'Jammu and Kashmir',
                state_la: 'Ladakh',
                state_py: 'Puducherry'
            },
            hi: {
                // Navigation
                home: 'होम',
                dashboard: 'डैशबोर्ड',
                compare: 'तुलना करें',
                
                // Search
                search: 'खोजें',
                searchPlaceholder: 'अवसरों के लिए यहां खोजें...',
                
                // State Selector
                selectState: 'अपना राज्य चुनें',
                
                // Portal Header
                portalTitle: 'शैक्षिक अवसर पोर्टल',
                portalSubtitle: 'अपने राज्य के अनुरूप छात्रवृत्ति, हैकाथॉन, कार्यशालाओं और इंटर्नशिप खोजें',
                
                // Main Section
                availableOpportunities: 'उपलब्ध अवसर',
                
                // Opportunity Categories
                scholarships: 'छात्रवृत्ति',
                scholarshipsDesc: 'अपनी शिक्षा के लिए वित्तीय सहायता और छात्रवृत्ति के अवसर खोजें',
                hackathons: 'हैकाथॉन',
                hackathonsDesc: 'कोडिंग प्रतियोगिताओं और नवाचार चुनौतियों में भाग लें',
                workshops: 'कार्यशालाएं',
                workshopsDesc: 'कौशल विकास कार्यशालाओं और प्रशिक्षण कार्यक्रमों में शामिल हों',
                internships: 'इंटर्नशिप',
                internshipsDesc: 'व्यावहारिक अनुभव प्राप्त करने के लिए इंटर्नशिप के अवसर खोजें',
                
                // Buttons
                explore: 'अन्वेषण करें',
                apply: 'आवेदन करें',
                save: 'सहेजें',
                unsave: 'अनसेव करें',
                share: 'साझा करें',
                close: 'बंद करें',
                cancel: 'रद्द करें',
                submit: 'जमा करें',
                
                // Dashboard
                savedOpportunities: 'सहेजे गए अवसर',
                applicationTracker: 'आवेदन ट्रैकर',
                upcomingDeadlines: 'आगामी समय सीमा',
                trendingOpportunities: 'ट्रेंडिंग अवसर',
                educationNews: 'शिक्षा समाचार',
                
                // Comparison
                addToComparison: 'तुलना में जोड़ें',
                removeFromComparison: 'तुलना से हटाएं',
                compareNow: 'अभी तुलना करें',
                
                // Other
                loading: 'लोड हो रहा है...',
                error: 'त्रुटि',
                success: 'सफलता',
                viewDetails: 'विवरण देखें',
                deadline: 'अंतिम तिथि',
                source: 'स्रोत',
                allIndia: 'अखिल भारतीय',
                stateSpecific: 'राज्य-विशिष्ट',
                customize: 'लेआउट अनुकूलित करें',
                done: 'पूर्ण',
                
                // States
                state_ap: 'आंध्र प्रदेश',
                state_ar: 'अरुणाचल प्रदेश',
                state_as: 'असम',
                state_br: 'बिहार',
                state_cg: 'छत्तीसगढ़',
                state_ga: 'गोवा',
                state_gj: 'गुजरात',
                state_hr: 'हरियाणा',
                state_hp: 'हिमाचल प्रदेश',
                state_jh: 'झारखंड',
                state_ka: 'कर्नाटक',
                state_kl: 'केरल',
                state_mp: 'मध्य प्रदेश',
                state_mh: 'महाराष्ट्र',
                state_mn: 'मणिपुर',
                state_ml: 'मेघालय',
                state_mz: 'मिजोरम',
                state_nl: 'नागालैंड',
                state_or: 'ओडिशा',
                state_pb: 'पंजाब',
                state_rj: 'राजस्थान',
                state_sk: 'सिक्किम',
                state_tn: 'तमिलनाडु',
                state_tg: 'तेलंगाना',
                state_tr: 'त्रिपुरा',
                state_up: 'उत्तर प्रदेश',
                state_uk: 'उत्तराखंड',
                state_wb: 'पश्चिम बंगाल',
                state_dl: 'दिल्ली',
                state_ch: 'चंडीगढ़',
                state_jk: 'जम्मू और कश्मीर',
                state_la: 'लद्दाख',
                state_py: 'पुडुचेरी'
            }
        };
    }

    // Get translation for a key
    t(key) {
        return this.translations[this.currentLang][key] || this.translations['en'][key] || key;
    }

    // Change language
    setLanguage(lang) {
        if (lang !== 'en' && lang !== 'hi') return;
        
        this.currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        this.translatePage();
        
        console.log('✅ Language changed to:', lang);
        
        // Show toast notification
        if (window.authSystem) {
            const langName = lang === 'hi' ? 'हिंदी' : 'English';
            window.authSystem.showToast(`Language changed to ${langName}! 🌐`, 'success');
        }
    }

    // Initialize voice search
    initVoiceSearch() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = this.currentLang === 'hi' ? 'hi-IN' : 'en-IN';
            
            console.log('🎤 Voice search initialized');
        } else {
            console.warn('⚠️ Voice search not supported in this browser');
        }
    }

    // Start voice search
    startVoiceSearch() {
        if (!this.speechRecognition) {
            if (window.authSystem) {
                window.authSystem.showToast('Voice search not supported in this browser', 'warning');
            }
            return;
        }

        // Update language
        this.speechRecognition.lang = this.currentLang === 'hi' ? 'hi-IN' : 'en-IN';

        const voiceBtn = document.getElementById('voiceSearchBtn');
        const searchInput = document.getElementById('searchInput');

        // Show listening state
        if (voiceBtn) {
            voiceBtn.classList.add('listening');
            voiceBtn.querySelector('i').classList.remove('fa-microphone');
            voiceBtn.querySelector('i').classList.add('fa-circle');
        }

        if (window.authSystem) {
            window.authSystem.showToast('🎤 Listening...', 'info');
        }

        this.speechRecognition.start();

        this.speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('🎤 Voice input:', transcript);

            if (searchInput) {
                searchInput.value = transcript;
                // Trigger search
                if (window.performSearch) {
                    window.performSearch();
                }
            }

            if (window.authSystem) {
                window.authSystem.showToast('✅ Voice search: ' + transcript, 'success');
            }

            // Reset button
            if (voiceBtn) {
                voiceBtn.classList.remove('listening');
                voiceBtn.querySelector('i').classList.remove('fa-circle');
                voiceBtn.querySelector('i').classList.add('fa-microphone');
            }
        };

        this.speechRecognition.onerror = (event) => {
            console.error('Voice search error:', event.error);
            
            let errorMsg = 'Voice search failed';
            if (event.error === 'no-speech') {
                errorMsg = 'No speech detected. Please try again.';
            } else if (event.error === 'not-allowed') {
                errorMsg = 'Microphone access denied';
            }

            if (window.authSystem) {
                window.authSystem.showToast(errorMsg, 'error');
            }

            // Reset button
            if (voiceBtn) {
                voiceBtn.classList.remove('listening');
                voiceBtn.querySelector('i').classList.remove('fa-circle');
                voiceBtn.querySelector('i').classList.add('fa-microphone');
            }
        };

        this.speechRecognition.onend = () => {
            // Reset button
            if (voiceBtn) {
                voiceBtn.classList.remove('listening');
                voiceBtn.querySelector('i').classList.remove('fa-circle');
                voiceBtn.querySelector('i').classList.add('fa-microphone');
            }
        };
    }

    // Translate entire page
    translatePage() {
        console.log('🔄 Translating page to:', this.currentLang);
        
        // Find all elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        console.log(`📝 Found ${elements.length} elements to translate`);
        
        elements.forEach(elem => {
            const key = elem.getAttribute('data-translate');
            const translation = this.t(key);
            
            // Handle different element types
            if (elem.tagName === 'INPUT') {
                // Translate placeholder
                elem.placeholder = translation;
            } else if (elem.tagName === 'OPTION') {
                // Translate option text
                elem.textContent = translation;
            } else {
                // For elements with children (like nav items with icons)
                const span = elem.querySelector('span:not(.comparison-count):not(.badge)');
                if (span) {
                    // Update span text only
                    span.textContent = translation;
                } else {
                    // Update entire text content
                    elem.textContent = translation;
                }
            }
        });
        
        // Update language selector
        const selector = document.getElementById('languageSelect');
        if (selector) {
            selector.value = this.currentLang;
        }
        
        console.log('✅ Page translation complete');
    }
}

// ============================================
// INITIALIZE SYSTEM
// ============================================

// Create global instance
const langSystem = new LanguageSystem();
window.langSystem = langSystem;

// Setup when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSystem);
} else {
    initLanguageSystem();
}

function initLanguageSystem() {
    console.log('🚀 Initializing language system...');
    
    // Translate page on load
    langSystem.translatePage();
    
    // Setup language selector
    const selector = document.getElementById('languageSelect');
    if (selector) {
        selector.value = langSystem.currentLang;
        selector.addEventListener('change', (e) => {
            console.log('🔔 Language selector changed to:', e.target.value);
            langSystem.setLanguage(e.target.value);
        });
        console.log('✅ Language selector connected');
    } else {
        console.error('❌ Language selector not found!');
    }
    
    // Setup voice search button
    const voiceBtn = document.getElementById('voiceSearchBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            console.log('🎤 Voice search button clicked');
            langSystem.startVoiceSearch();
        });
        console.log('✅ Voice search button connected');
    } else {
        console.warn('⚠️ Voice search button not found');
    }
    
    console.log('✅ Language system ready!');
}

// ============================================
// GLOBAL HELPER FUNCTIONS
// ============================================

// Translate text by key (can be called from anywhere)
window.translateText = function(key) {
    return langSystem.t(key);
};

// Get current language
window.getCurrentLanguage = function() {
    return langSystem.currentLang;
};

// Manually translate a specific element
window.translateElement = function(elementId, key) {
    const elem = document.getElementById(elementId);
    if (elem) {
        elem.textContent = langSystem.t(key);
    }
};

// Re-translate page (useful after dynamic content is added)
window.retranslatePage = function() {
    langSystem.translatePage();
};

// Start voice search (can be called from anywhere)
window.startVoiceSearch = function() {
    langSystem.startVoiceSearch();
};

console.log('✅ Multi-Language System Loaded Successfully!');
