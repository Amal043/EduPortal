// Live Opportunities Fetcher — fetches from backend API (auto-refreshed every 6 hours via RSS)
class LiveOpportunitiesFetcher {
    constructor() {
        this.cacheKey = 'eduportal_trendingCache_v2';
        this.newsKey  = 'eduportal_newsCache_v2';
        this.cacheExpiry = 30 * 60 * 1000; // 30-minute frontend cache
    }

    // ─── Load / Save local cache ───────────────────────────────────────────
    loadCache(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (Date.now() - data.timestamp < this.cacheExpiry) return data.items;
        } catch (e) {}
        return null;
    }

    saveCache(key, items) {
        try {
            localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), items }));
        } catch (e) {}
    }

    clearCache() {
        localStorage.removeItem(this.cacheKey);
        localStorage.removeItem(this.newsKey);
    }

    // ─── Fetch trending opportunities from backend ─────────────────────────
    async fetchTrendingOpportunities() {
        // Try frontend cache first
        const cached = this.loadCache(this.cacheKey);
        if (cached) {
            console.log('✅ Using cached trending opportunities');
            return cached;
        }

        console.log('📡 Fetching fresh trending opportunities from backend...');
        try {
            const response = await fetch('/api/opportunities/trending?limit=20', {
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            this.saveCache(this.cacheKey, data);
            console.log(`✅ Fetched ${data.length} opportunities from backend`);
            return data;
        } catch (err) {
            console.error('⚠️ Backend fetch failed, using fallback data:', err);
            return this.getFallbackOpportunities();
        }
    }

    // ─── Fetch live news from backend ──────────────────────────────────────
    async fetchLiveNews() {
        const cached = this.loadCache(this.newsKey);
        if (cached) return cached;

        try {
            const response = await fetch('/api/opportunities/news?limit=8');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            this.saveCache(this.newsKey, data);
            return data;
        } catch (err) {
            console.error('⚠️ News fetch failed:', err);
            return this.getFallbackNews();
        }
    }

    // ─── Track user interactions ───────────────────────────────────────────
    async trackClick(id) {
        if (!id) return;
        try {
            await fetch(`/api/opportunities/${id}/click`, { method: 'POST' });
        } catch (e) {}
    }

    async trackView(id) {
        if (!id) return;
        try {
            await fetch(`/api/opportunities/${id}/view`, { method: 'POST' });
        } catch (e) {}
    }

    async trackSave(id) {
        if (!id) return;
        try {
            await fetch(`/api/opportunities/${id}/save`, { method: 'POST' });
        } catch (e) {}
    }

    // ─── Fallback (offline / server down) ─────────────────────────────────
    getFallbackOpportunities() {
        return [
            {
                name: 'National Scholarship Portal',
                description: 'Visit NSP for latest scholarship opportunities across India. Multiple schemes for all categories including merit-based, need-based, and minority scholarships.',
                source: 'Government of India',
                sourceUrl: 'https://scholarships.gov.in/',
                url: 'https://scholarships.gov.in/',
                category: 'All Categories',
                type: 'scholarship',
                icon: '🎓',
                amount: 'Varies by scheme',
                isNational: true,
                trending: true,
                deadline: 'Rolling basis'
            },
            {
                name: 'Smart India Hackathon',
                description: 'India\'s biggest open innovation model solving pressing problems faced by our nation through technology.',
                source: 'Ministry of Education',
                sourceUrl: 'https://www.sih.gov.in/',
                url: 'https://www.sih.gov.in/',
                category: 'Hackathon',
                type: 'hackathon',
                icon: '💡',
                amount: '₹1,00,000 prize',
                isNational: true,
                trending: true,
                deadline: 'Rolling basis'
            }
        ];
    }

    getFallbackNews() {
        return [
            {
                title: 'National Scholarship Portal Open for Applications',
                content: 'The NSP portal is currently accepting applications. Students can apply for PM Scholarship, Post Matric and other central schemes.',
                source: 'NSP',
                link: 'https://scholarships.gov.in/',
                date: 'Today'
            },
            {
                title: 'Smart India Hackathon 2026 Registration',
                content: 'SIH 2026 registrations are open. Teams of 6 students can register and participate to solve real-world problems.',
                source: 'Ministry of Education',
                link: 'https://www.sih.gov.in/',
                date: 'This week'
            }
        ];
    }

    // ─── Search helper ─────────────────────────────────────────────────────
    async searchOnlineOpportunities(keyword) {
        const all = await this.fetchTrendingOpportunities();
        return all.filter(opp =>
            opp.name.toLowerCase().includes(keyword.toLowerCase()) ||
            opp.description.toLowerCase().includes(keyword.toLowerCase()) ||
            (opp.category || '').toLowerCase().includes(keyword.toLowerCase())
        );
    }
}

// Create global instance
const liveOpportunitiesFetcher = new LiveOpportunitiesFetcher();
window.liveOpportunitiesFetcher = liveOpportunitiesFetcher;
