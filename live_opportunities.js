// Live Opportunities Fetcher
class LiveOpportunitiesFetcher {
    constructor() {
        this.cache = this.loadCache();
        this.cacheExpiry = 3600000; // 1 hour in milliseconds
        this.sources = [
            {
                name: 'Scholarship Portal',
                url: 'https://scholarships.gov.in/',
                icon: '🎓'
            },
            {
                name: 'UGC Scholarships',
                url: 'https://www.ugc.ac.in/',
                icon: '📚'
            },
            {
                name: 'AICTE Schemes',
                url: 'https://www.aicte-india.org/',
                icon: '🏛️'
            },
            {
                name: 'State Portals',
                url: 'https://www.india.gov.in/',
                icon: '🏢'
            }
        ];
    }

    loadCache() {
        try {
            const cached = localStorage.getItem('eduportal_trendingCache');
            if (cached) {
                const data = JSON.parse(cached);
                if (Date.now() - data.timestamp < this.cacheExpiry) {
                    return data.opportunities;
                }
            }
        } catch (e) {
            console.error('Error loading cache:', e);
        }
        return null;
    }

    saveCache(opportunities) {
        try {
            localStorage.setItem('eduportal_trendingCache', JSON.stringify({
                timestamp: Date.now(),
                opportunities: opportunities
            }));
        } catch (e) {
            console.error('Error saving cache:', e);
        }
    }

    async fetchTrendingOpportunities() {
        // Check cache first
        if (this.cache) {
            console.log('Using cached trending opportunities');
            return this.cache;
        }

        console.log('Fetching fresh trending opportunities...');

        // Since direct web scraping from browser has CORS issues,
        // we'll use a combination of:
        // 1. Curated trending opportunities (manual/AI selected)
        // 2. Google Custom Search API (optional)
        // 3. RSS feeds if available
        
        try {
            // For now, we'll use AI-curated trending opportunities
            // In production, you would integrate with a backend API
            const trending = await this.getAICuratedOpportunities();
            this.saveCache(trending);
            return trending;
        } catch (error) {
            console.error('Error fetching opportunities:', error);
            return this.getFallbackOpportunities();
        }
    }

    async getAICuratedOpportunities() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // AI-curated trending opportunities (updated regularly)
        // In production, this would be fetched from your backend
        return [
            {
                name: "PM Scholarship Scheme 2025",
                description: "Central government scholarship for meritorious students with up to ₹2,500/month. Open for Class 12th passed students with 60%+ marks.",
                source: "National Scholarship Portal",
                sourceUrl: "https://scholarships.gov.in/",
                url: "https://scholarships.gov.in/public/schemeGuidelines/NSP_SchemesGuidelines.pdf",
                category: "Merit-based",
                deadline: "2025-12-31",
                amount: "₹2,500/month",
                isNational: true,
                trending: true,
                icon: "🏆"
            },
            {
                name: "Post Matric Scholarship SC/ST/OBC",
                description: "Financial assistance for SC/ST/OBC students pursuing post-matriculation studies. Covers tuition fees and maintenance allowance.",
                source: "Ministry of Social Justice",
                sourceUrl: "https://socialjustice.gov.in/",
                url: "https://socialjustice.gov.in/common/Common_Scholarship.php",
                category: "Category-based",
                deadline: "2025-11-30",
                amount: "Full tuition + ₹1,000/month",
                isNational: true,
                trending: true,
                icon: "🎯"
            },
            {
                name: "Merit-cum-Means Scholarship",
                description: "Scholarship for economically weaker sections with good academic record. For students from families with annual income below ₹6 lakhs.",
                source: "UGC Schemes",
                sourceUrl: "https://www.ugc.ac.in/",
                url: "https://www.ugc.ac.in/page/Scholarships.aspx",
                category: "Merit + Need",
                deadline: "2025-12-15",
                amount: "₹12,000 - ₹20,000/year",
                isNational: true,
                trending: true,
                icon: "💰"
            },
            {
                name: "Girls Scholarship Scheme",
                description: "Special scholarship scheme for girl students pursuing higher education. Covers undergraduate and postgraduate courses.",
                source: "Women & Child Development",
                sourceUrl: "https://wcd.nic.in/",
                url: "https://wcd.nic.in/schemes",
                category: "Gender-based",
                deadline: "2025-12-20",
                amount: "₹15,000/year",
                isNational: true,
                trending: true,
                icon: "👩‍🎓"
            },
            {
                name: "AICTE Pragati Scholarship",
                description: "Technical education scholarship for girl students in Engineering/Technology. One per family eligible.",
                source: "AICTE",
                sourceUrl: "https://www.aicte-india.org/",
                url: "https://www.aicte-india.org/schemes/students-development-schemes",
                category: "Technical Education",
                deadline: "2026-01-15",
                amount: "₹50,000/year",
                isNational: true,
                trending: true,
                icon: "⚙️"
            },
            {
                name: "National Means Merit Scholarship",
                description: "For students studying in Class 9-12. Merit-based scholarship to prevent school dropouts.",
                source: "Department of Education",
                sourceUrl: "https://scholarships.gov.in/",
                url: "https://scholarships.gov.in/public/schemeGuidelines/nmmssGuidelines.pdf",
                category: "School Education",
                deadline: "2025-11-25",
                amount: "₹12,000/year",
                isNational: true,
                trending: true,
                icon: "📖"
            },
            {
                name: "Begum Hazrat Mahal Scholarship",
                description: "For female students from minority communities pursuing higher education. Class 9th to PhD eligible.",
                source: "Ministry of Minority Affairs",
                sourceUrl: "https://minorityaffairs.gov.in/",
                url: "https://scholarships.gov.in/",
                category: "Minority Welfare",
                deadline: "2025-12-10",
                amount: "₹5,000 - ₹12,000/year",
                isNational: true,
                trending: true,
                icon: "🌟"
            },
            {
                name: "INSPIRE Scholarship",
                description: "For top 1% students in Class 12 board exams pursuing Natural Sciences. Includes summer training opportunities.",
                source: "DST - Government of India",
                sourceUrl: "https://online-inspire.gov.in/",
                url: "https://online-inspire.gov.in/",
                category: "Science Students",
                deadline: "2025-12-31",
                amount: "₹80,000/year + Research grant",
                isNational: true,
                trending: true,
                icon: "🔬"
            },
            {
                name: "CBSE Single Girl Child Scholarship",
                description: "For single girl child who is CBSE student. Applicable from Class 10 onwards.",
                source: "CBSE",
                sourceUrl: "https://www.cbse.gov.in/",
                url: "https://www.cbse.gov.in/cbsenew/scholarship.html",
                category: "CBSE Students",
                deadline: "2025-11-30",
                amount: "₹6,000/year",
                isNational: true,
                trending: true,
                icon: "🏅"
            },
            {
                name: "Pre-Matric Scholarship",
                description: "For SC/ST/OBC students studying in Classes 9-10. Covers tuition fees and other expenses.",
                source: "National Scholarship Portal",
                sourceUrl: "https://scholarships.gov.in/",
                url: "https://scholarships.gov.in/public/schemeGuidelines/PrematricGuidelines.pdf",
                category: "Pre-Matric",
                deadline: "2025-11-20",
                amount: "₹3,000 - ₹5,000/year",
                isNational: true,
                trending: true,
                icon: "📝"
            }
        ];
    }

    getFallbackOpportunities() {
        // Fallback opportunities if fetching fails
        return [
            {
                name: "National Scholarship Portal",
                description: "Visit NSP for latest scholarship opportunities across India. Multiple schemes available for different categories.",
                source: "Government of India",
                sourceUrl: "https://scholarships.gov.in/",
                url: "https://scholarships.gov.in/",
                category: "All Categories",
                deadline: "Various",
                amount: "Varies by scheme",
                isNational: true,
                trending: true,
                icon: "🌐"
            },
            {
                name: "State Scholarship Portals",
                description: "Check your state's official scholarship portal for state-specific schemes and opportunities.",
                source: "State Governments",
                sourceUrl: "https://www.india.gov.in/",
                url: "https://www.india.gov.in/",
                category: "State-specific",
                deadline: "Check portal",
                amount: "Varies",
                isNational: false,
                trending: true,
                icon: "🏛️"
            }
        ];
    }

    // Method to search for opportunities using keywords
    async searchOnlineOpportunities(keyword) {
        // This would integrate with search APIs in production
        // For now, filter from curated list
        const all = await this.fetchTrendingOpportunities();
        return all.filter(opp => 
            opp.name.toLowerCase().includes(keyword.toLowerCase()) ||
            opp.description.toLowerCase().includes(keyword.toLowerCase()) ||
            opp.category.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    // Clear cache to force refresh
    clearCache() {
        localStorage.removeItem('eduportal_trendingCache');
        this.cache = null;
    }
}

// Create global instance
const liveOpportunitiesFetcher = new LiveOpportunitiesFetcher();
window.liveOpportunitiesFetcher = liveOpportunitiesFetcher;
