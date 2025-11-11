// Enhanced AI System for EduPortal with Performance Optimizations
class AISystem {
    constructor() {
        this.userPreferences = {};
        this.searchHistory = [];
        this.viewHistory = [];
        this.categoryWeights = {
            scholarships: {},
            hackathons: {},
            workshops: {},
            internships: {}
        };
        
        // Performance optimizations
        this.searchCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
        this.maxCacheSize = 100;
        this.debounceTimer = null;
        this.debounceDelay = 300;
        
        // Enhanced features
        this.synonyms = this.initializeSynonyms();
        this.commonMisspellings = this.initializeSpellCheck();
        this.contextualKeywords = this.initializeContextualKeywords();
        this.loadFromStorage();
        
        console.log('✅ AI System initialized with performance optimizations');
    }
    
    // Debounced search for better performance
    debouncedSearch(query, callback) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            callback(query);
        }, this.debounceDelay);
    }
    
    // Check search cache
    getCachedSearch(query) {
        const cached = this.searchCache.get(query.toLowerCase());
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            console.log('📦 Returning cached results for:', query);
            return cached.results;
        }
        return null;
    }
    
    // Store search in cache
    cacheSearch(query, results) {
        // Limit cache size
        if (this.searchCache.size >= this.maxCacheSize) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }
        
        this.searchCache.set(query.toLowerCase(), {
            results: results,
            timestamp: Date.now()
        });
    }
    
    // Clear old cache entries
    clearOldCache() {
        const now = Date.now();
        for (const [key, value] of this.searchCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.searchCache.delete(key);
            }
        }
    }
    
    // Initialize synonym dictionary for better search
    initializeSynonyms() {
        return {
            'scholarship': ['grant', 'financial aid', 'funding', 'bursary', 'stipend', 'award'],
            'internship': ['training', 'work experience', 'placement', 'apprenticeship', 'industrial training'],
            'hackathon': ['coding competition', 'hack', 'coding event', 'tech challenge', 'innovation challenge'],
            'workshop': ['training', 'seminar', 'course', 'class', 'session', 'bootcamp'],
            'government': ['govt', 'gov', 'state', 'central', 'public sector', 'official'],
            'engineering': ['engg', 'btech', 'b.tech', 'technical', 'technology'],
            'medical': ['mbbs', 'medicine', 'healthcare', 'doctor', 'nursing'],
            'college': ['university', 'institution', 'school', 'campus'],
            'student': ['undergraduate', 'graduate', 'scholar', 'learner'],
            'free': ['no cost', 'zero fee', 'complimentary', 'gratis'],
            'online': ['virtual', 'remote', 'distance', 'web-based', 'digital'],
            'startup': ['entrepreneur', 'business', 'venture', 'company'],
            'tech': ['technology', 'it', 'computer', 'digital', 'software'],
            'ai': ['artificial intelligence', 'machine learning', 'ml', 'deep learning'],
            'web': ['website', 'web development', 'frontend', 'backend', 'fullstack']
        };
    }
    
    // Initialize spell check for common misspellings
    initializeSpellCheck() {
        return {
            'scholership': 'scholarship',
            'scholarhip': 'scholarship',
            'scolorship': 'scholarship',
            'intership': 'internship',
            'internshp': 'internship',
            'hackthon': 'hackathon',
            'hackaton': 'hackathon',
            'workshp': 'workshop',
            'workship': 'workshop',
            'governmnet': 'government',
            'goverment': 'government',
            'enginering': 'engineering',
            'engeneering': 'engineering',
            'univercity': 'university',
            'univeristy': 'university'
        };
    }
    
    // Initialize contextual keywords for intelligent categorization
    initializeContextualKeywords() {
        return {
            scholarships: ['merit', 'need-based', 'sc', 'st', 'obc', 'minority', 'girl child', 'pwd', 'postmatric', 'prematric', 'nsp', 'education', 'tuition', 'fee waiver'],
            hackathons: ['coding', 'innovation', 'sih', 'smart india', 'hack', 'competition', 'prize', 'team', 'project', 'development'],
            workshops: ['skill', 'training', 'certification', 'learning', 'hands-on', 'practical', 'upskilling', 'professional development'],
            internships: ['stipend', 'industrial training', 'summer', 'winter', 'corporate', 'research', 'month', 'week', 'part-time', 'full-time', 'paid', 'unpaid']
        };
    }

    // Track user interactions to build preference profile (enhanced)
    trackInteraction(type, data) {
        const timestamp = new Date().toISOString();
        
        switch(type) {
            case 'search':
                // Limit search history to last 100 searches
                this.searchHistory.push({ ...data, timestamp });
                if (this.searchHistory.length > 100) {
                    this.searchHistory = this.searchHistory.slice(-100);
                }
                this.updatePreferences(data);
                break;
            case 'view':
                // Limit view history to last 200 views
                this.viewHistory.push({ ...data, timestamp });
                if (this.viewHistory.length > 200) {
                    this.viewHistory = this.viewHistory.slice(-200);
                }
                this.updateCategoryWeights(data);
                break;
            case 'click':
                // Track click-through for better relevance
                this.trackClickThrough(data);
                break;
            case 'filter':
                // Track filter usage
                this.trackFilterUsage(data);
                break;
        }

        // Store in localStorage (debounced)
        this.debounceSave();
    }
    
    // Track click-through rates for better ranking
    trackClickThrough(data) {
        const { category, itemId, searchQuery, position } = data;
        if (!this.clickThroughData) {
            this.clickThroughData = {};
        }
        if (!this.clickThroughData[category]) {
            this.clickThroughData[category] = {};
        }
        if (!this.clickThroughData[category][itemId]) {
            this.clickThroughData[category][itemId] = {
                clicks: 0,
                impressions: 0,
                avgPosition: 0
            };
        }
        
        this.clickThroughData[category][itemId].clicks++;
        this.clickThroughData[category][itemId].impressions++;
        this.clickThroughData[category][itemId].avgPosition = 
            (this.clickThroughData[category][itemId].avgPosition + position) / 2;
    }
    
    // Track filter usage patterns
    trackFilterUsage(data) {
        const { category, filters } = data;
        if (!this.filterUsage) {
            this.filterUsage = {};
        }
        if (!this.filterUsage[category]) {
            this.filterUsage[category] = {};
        }
        
        Object.keys(filters).forEach(filter => {
            if (!this.filterUsage[category][filter]) {
                this.filterUsage[category][filter] = {};
            }
            const value = filters[filter];
            this.filterUsage[category][filter][value] = 
                (this.filterUsage[category][filter][value] || 0) + 1;
        });
    }
    
    // Debounced save to prevent excessive writes
    debounceSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.saveToStorage();
        }, 1000);
    }

    // Update user preferences based on interactions
    updatePreferences(data) {
        const { category, keywords, filters } = data;
        
        if (!this.userPreferences[category]) {
            this.userPreferences[category] = {
                keywords: {},
                filters: {}
            };
        }

        // Update keyword weights
        keywords.forEach(keyword => {
            this.userPreferences[category].keywords[keyword] = 
                (this.userPreferences[category].keywords[keyword] || 0) + 1;
        });

        // Update filter preferences
        Object.keys(filters).forEach(filter => {
            if (!this.userPreferences[category].filters[filter]) {
                this.userPreferences[category].filters[filter] = {};
            }
            const value = filters[filter];
            this.userPreferences[category].filters[filter][value] = 
                (this.userPreferences[category].filters[filter][value] || 0) + 1;
        });
    }

    // Update category weights based on user views
    updateCategoryWeights(data) {
        const { category, itemId } = data;
        this.categoryWeights[category][itemId] = 
            (this.categoryWeights[category][itemId] || 0) + 1;
    }

    // Enhanced recommendations with machine learning-like scoring
    getRecommendations(category, count = 5) {
        const opportunities = this.getAllOpportunities(category);
        const scoredOpportunities = opportunities.map(opportunity => ({
            ...opportunity,
            score: this.calculateEnhancedRelevanceScore(opportunity, category)
        }));

        // Sort by score and return top results
        return scoredOpportunities
            .sort((a, b) => b.score - a.score)
            .slice(0, count);
    }

    // Calculate enhanced relevance score with multiple weighted factors
    calculateEnhancedRelevanceScore(opportunity, category) {
        let score = 0;
        const preferences = this.userPreferences[category];
        const text = (opportunity.name + ' ' + opportunity.description).toLowerCase();

        // 1. Historical preference matching (30% weight)
        if (preferences && preferences.keywords) {
            Object.keys(preferences.keywords).forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) {
                    score += preferences.keywords[keyword] * 3;
                }
            });
        }

        // 2. View history boost (25% weight)
        const viewCount = this.categoryWeights[category][opportunity.id] || 0;
        score += viewCount * 5;

        // 3. Recent interaction boost (20% weight)
        const recentViews = this.viewHistory
            .filter(v => v.category === category && v.timestamp)
            .slice(-10);
        const recentIds = recentViews.map(v => v.itemId);
        if (recentIds.includes(opportunity.id)) {
            score += 15;
        }

        // 4. Recency boost (15% weight)
        if (opportunity.datePosted) {
            const daysAgo = (new Date() - new Date(opportunity.datePosted)) / (1000 * 60 * 60 * 24);
            score += Math.max(0, 20 - daysAgo);
        }

        // 5. Priority/source boost (10% weight)
        if (opportunity.priority === 1) {
            score += 10;
        }
        if (opportunity.source && opportunity.source.toLowerCase().includes('government')) {
            score += 8;
        }
        
        // 6. Diversity factor - slight penalty for over-recommended items
        if (viewCount > 5) {
            score -= viewCount * 0.5;
        }

        return score;
    }

    // Enhanced search with fuzzy matching, spell correction, and synonym expansion
    searchOpportunities(category, query, filters = {}) {
        if (!query || query.trim() === '') {
            return this.getAllOpportunities(category);
        }
        
        // Auto-correct spelling
        query = this.correctSpelling(query);
        
        // Expand query with synonyms
        const expandedQuery = this.expandQueryWithSynonyms(query);
        
        // Extract search words and n-grams
        const searchTerms = this.extractSearchTerms(expandedQuery);
        
        const opportunities = this.getAllOpportunities(category);

        // Track search for future recommendations
        this.trackInteraction('search', {
            category,
            keywords: searchTerms,
            filters,
            originalQuery: query
        });

        const results = opportunities
            .map(opportunity => {
                const score = this.calculateEnhancedSearchScore(opportunity, query, searchTerms, filters);
                return { ...opportunity, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);

        return results;
    }
    
    // Correct common spelling mistakes
    correctSpelling(query) {
        let corrected = query.toLowerCase();
        Object.keys(this.commonMisspellings).forEach(mistake => {
            const regex = new RegExp('\\b' + mistake + '\\b', 'gi');
            corrected = corrected.replace(regex, this.commonMisspellings[mistake]);
        });
        return corrected;
    }
    
    // Expand query with synonyms for better matching
    expandQueryWithSynonyms(query) {
        let expanded = query.toLowerCase();
        Object.keys(this.synonyms).forEach(word => {
            if (expanded.includes(word)) {
                expanded += ' ' + this.synonyms[word].join(' ');
            }
        });
        return expanded;
    }
    
    // Extract meaningful search terms including bigrams
    extractSearchTerms(query) {
        const words = query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);
        
        // Remove common stop words
        const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'were'];
        const filtered = words.filter(w => !stopWords.includes(w));
        
        // Create bigrams for phrase matching
        const bigrams = [];
        for (let i = 0; i < filtered.length - 1; i++) {
            bigrams.push(filtered[i] + ' ' + filtered[i + 1]);
        }
        
        return [...new Set([...filtered, ...bigrams])];
    }
    
    // Calculate enhanced search score with multiple factors
    calculateEnhancedSearchScore(opportunity, originalQuery, searchTerms, filters) {
        let score = 0;
        const name = (opportunity.name || '').toLowerCase();
        const description = (opportunity.description || '').toLowerCase();
        const source = (opportunity.source || '').toLowerCase();
        const fullText = name + ' ' + description + ' ' + source;
        
        // 1. Exact phrase matching (highest priority)
        const exactQuery = originalQuery.toLowerCase().trim();
        if (name.includes(exactQuery)) {
            score += 100;
        } else if (description.includes(exactQuery)) {
            score += 50;
        } else if (fullText.includes(exactQuery)) {
            score += 30;
        }
        
        // 2. Title matching (high priority)
        searchTerms.forEach(term => {
            if (name.includes(term)) {
                score += 25;
                // Bonus for word boundary match
                const regex = new RegExp('\\b' + term + '\\b', 'i');
                if (regex.test(name)) {
                    score += 10;
                }
            }
        });
        
        // 3. Description matching
        searchTerms.forEach(term => {
            if (description.includes(term)) {
                score += 10;
            }
        });
        
        // 4. Source matching (credibility boost)
        searchTerms.forEach(term => {
            if (source.includes(term)) {
                score += 15;
            }
        });
        
        // 5. Priority boost (government/official sources)
        if (opportunity.priority === 1) {
            score += 20;
        }
        
        // 6. Fuzzy matching for partial words
        score += this.calculateFuzzyScore(searchTerms, fullText);
        
        // 7. Contextual relevance boost
        score += this.calculateContextualScore(opportunity, searchTerms);
        
        // 8. Filter matching
        Object.keys(filters).forEach(filter => {
            if (opportunity[filter] === filters[filter]) {
                score += 30;
            }
        });

        // 9. User preference boost
        score += this.getPreferenceBoost(opportunity);
        
        // 10. Recency boost
        if (opportunity.datePosted) {
            const daysAgo = (new Date() - new Date(opportunity.datePosted)) / (1000 * 60 * 60 * 24);
            if (daysAgo < 30) {
                score += (30 - daysAgo);
            }
        }

        return score;
    }
    
    // Calculate fuzzy matching score using Levenshtein-like approach
    calculateFuzzyScore(searchTerms, text) {
        let fuzzyScore = 0;
        searchTerms.forEach(term => {
            if (term.length < 4) return; // Skip short terms for fuzzy
            
            const words = text.split(/\s+/);
            words.forEach(word => {
                const similarity = this.calculateSimilarity(term, word);
                if (similarity > 0.7) { // 70% similarity threshold
                    fuzzyScore += similarity * 5;
                }
            });
        });
        return fuzzyScore;
    }
    
    // Calculate string similarity (0 to 1)
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    // Levenshtein distance for fuzzy matching
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    // Calculate contextual score based on category keywords
    calculateContextualScore(opportunity, searchTerms) {
        let contextScore = 0;
        const text = (opportunity.name + ' ' + opportunity.description).toLowerCase();
        
        // Determine most likely category
        Object.keys(this.contextualKeywords).forEach(category => {
            const keywords = this.contextualKeywords[category];
            let categoryMatch = 0;
            
            keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    categoryMatch++;
                }
            });
            
            if (categoryMatch > 0) {
                contextScore += categoryMatch * 3;
            }
        });
        
        return contextScore;
    }

    // Get preference-based boost for scoring
    getPreferenceBoost(opportunity) {
        let boost = 0;

        // View history boost
        const views = this.viewHistory.filter(v => v.itemId === opportunity.id).length;
        boost += views * 2;

        // Category preference boost
        const categoryViews = this.viewHistory.filter(v => v.category === opportunity.category).length;
        boost += categoryViews;

        return boost;
    }

    // Save state to localStorage (enhanced with compression)
    saveToStorage() {
        try {
            const data = {
                userPreferences: this.userPreferences,
                categoryWeights: this.categoryWeights,
                clickThroughData: this.clickThroughData || {},
                filterUsage: this.filterUsage || {},
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('aiSystem', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save AI system data:', e);
            // Clear old data if storage is full
            if (e.name === 'QuotaExceededError') {
                this.clearOldData();
                this.saveToStorage();
            }
        }
    }

    // Load state from localStorage (enhanced)
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('aiSystem');
            if (stored) {
                const data = JSON.parse(stored);
                this.userPreferences = data.userPreferences || {};
                this.categoryWeights = data.categoryWeights || {
                    scholarships: {},
                    hackathons: {},
                    workshops: {},
                    internships: {}
                };
                this.clickThroughData = data.clickThroughData || {};
                this.filterUsage = data.filterUsage || {};
            }
        } catch (e) {
            console.warn('Failed to load AI system data:', e);
        }
    }
    
    // Clear old data when storage is full
    clearOldData() {
        // Keep only recent history
        this.searchHistory = this.searchHistory.slice(-50);
        this.viewHistory = this.viewHistory.slice(-100);
        
        // Clear low-weight preferences
        Object.keys(this.categoryWeights).forEach(category => {
            Object.keys(this.categoryWeights[category]).forEach(item => {
                if (this.categoryWeights[category][item] < 2) {
                    delete this.categoryWeights[category][item];
                }
            });
        });
    }

    // Get all opportunities for a category (with deduplication)
    getAllOpportunities(category) {
        const opportunitiesMap = new Map();
        
        // Collect from all states
        Object.values(window.stateOpportunities || {}).forEach(state => {
            if (state[category]) {
                state[category].forEach(opp => {
                    // Use URL as unique identifier to avoid duplicates
                    const key = opp.url || opp.name;
                    if (!opportunitiesMap.has(key)) {
                        opportunitiesMap.set(key, {
                            ...opp,
                            id: opp.id || key
                        });
                    }
                });
            }
        });
        
        // Add from default opportunities
        if (window.defaultOpportunities && window.defaultOpportunities[category]) {
            window.defaultOpportunities[category].forEach(opp => {
                const key = opp.url || opp.name;
                if (!opportunitiesMap.has(key)) {
                    opportunitiesMap.set(key, {
                        ...opp,
                        id: opp.id || key
                    });
                }
            });
        }
        
        return Array.from(opportunitiesMap.values());
    }
    
    // Smart suggestions based on partial input
    getSuggestions(query, category = null) {
        if (!query || query.length < 2) return [];
        
        query = this.correctSpelling(query).toLowerCase();
        const suggestions = new Set();
        
        // Get relevant opportunities
        let opportunities = [];
        if (category) {
            opportunities = this.getAllOpportunities(category);
        } else {
            // Search across all categories
            ['scholarships', 'hackathons', 'workshops', 'internships'].forEach(cat => {
                opportunities = opportunities.concat(this.getAllOpportunities(cat));
            });
        }
        
        // Extract suggestions from opportunity names
        opportunities.forEach(opp => {
            const name = opp.name.toLowerCase();
            const words = name.split(/\s+/);
            
            // Add matching words
            words.forEach(word => {
                if (word.startsWith(query) && word.length > 2) {
                    suggestions.add(word);
                }
            });
            
            // Add full name if it contains query
            if (name.includes(query) && name.length < 100) {
                suggestions.add(opp.name);
            }
        });
        
        // Add matching synonyms
        Object.keys(this.synonyms).forEach(key => {
            if (key.startsWith(query)) {
                suggestions.add(key);
            }
            this.synonyms[key].forEach(synonym => {
                if (synonym.startsWith(query)) {
                    suggestions.add(synonym);
                }
            });
        });
        
        // Add popular search terms from history
        this.searchHistory.slice(-50).forEach(search => {
            if (search.originalQuery && search.originalQuery.toLowerCase().includes(query)) {
                suggestions.add(search.originalQuery);
            }
        });
        
        return Array.from(suggestions).slice(0, 8);
    }
    
    // Get smart filters based on category
    getSmartFilters(category) {
        const filters = {
            scholarships: [
                { label: 'Government Schemes', value: 'government', icon: 'fa-landmark' },
                { label: 'Merit-Based', value: 'merit', icon: 'fa-trophy' },
                { label: 'Need-Based', value: 'need', icon: 'fa-hand-holding-heart' },
                { label: 'Minority', value: 'minority', icon: 'fa-users' }
            ],
            hackathons: [
                { label: 'National Level', value: 'national', icon: 'fa-flag' },
                { label: 'College Specific', value: 'college', icon: 'fa-school' },
                { label: 'Online', value: 'online', icon: 'fa-laptop' },
                { label: 'Prize Money', value: 'prize', icon: 'fa-gift' }
            ],
            internships: [
                { label: 'Government', value: 'government', icon: 'fa-landmark' },
                { label: 'Private Sector', value: 'private', icon: 'fa-building' },
                { label: 'Paid', value: 'paid', icon: 'fa-money-bill' },
                { label: 'Remote', value: 'remote', icon: 'fa-home' }
            ],
            workshops: [
                { label: 'Certification', value: 'certification', icon: 'fa-certificate' },
                { label: 'Free', value: 'free', icon: 'fa-gift' },
                { label: 'Hands-on', value: 'practical', icon: 'fa-tools' },
                { label: 'Online', value: 'online', icon: 'fa-laptop' }
            ]
        };
        
        return filters[category] || [];
    }

    // Generate personalized insights (enhanced)
    generateInsights() {
        const insights = {
            topCategories: this.getTopCategories(),
            recommendedOpportunities: {},
            searchTrends: this.getSearchTrends(),
            categoryInsights: this.getCategoryInsights(),
            searchHints: this.generateSearchHints(),
            popularFilters: this.getPopularFiltersAcrossCategories()
        };

        // Get recommendations for each category
        ['scholarships', 'hackathons', 'workshops', 'internships'].forEach(category => {
            insights.recommendedOpportunities[category] = this.getRecommendations(category, 3);
        });

        return insights;
    }
    
    // Generate helpful search hints for users
    generateSearchHints() {
        const hints = [];
        
        // Category-specific hints
        hints.push({
            title: 'Search Tips',
            tips: [
                'Try searching by type: "government scholarship", "coding hackathon"',
                'Use specific terms: "NSP", "Smart India Hackathon", "internship"',
                'Search by field: "engineering", "medical", "arts"',
                'Filter by location: "state scholarship", "national hackathon"'
            ]
        });
        
        // Popular searches
        const popularKeywords = this.getSearchTrends();
        if (popularKeywords.length > 0) {
            hints.push({
                title: 'Popular Searches',
                tips: popularKeywords.slice(0, 4).map(k => k.keyword)
            });
        }
        
        // Contextual hints based on user history
        const topCategory = this.getTopCategories()[0];
        if (topCategory) {
            const categoryHints = this.contextualKeywords[topCategory] || [];
            hints.push({
                title: `${topCategory.charAt(0).toUpperCase() + topCategory.slice(1)} Keywords`,
                tips: categoryHints.slice(0, 5)
            });
        }
        
        return hints;
    }
    
    // Get popular filters across all categories
    getPopularFiltersAcrossCategories() {
        const popularFilters = {};
        
        Object.keys(this.filterUsage || {}).forEach(category => {
            popularFilters[category] = [];
            Object.keys(this.filterUsage[category]).forEach(filter => {
                const values = this.filterUsage[category][filter];
                const mostUsed = Object.entries(values)
                    .sort(([,a], [,b]) => b - a)[0];
                if (mostUsed) {
                    popularFilters[category].push({
                        filter,
                        value: mostUsed[0],
                        count: mostUsed[1]
                    });
                }
            });
        });
        
        return popularFilters;
    }

    // Get top categories based on user interaction
    getTopCategories() {
        const categoryCount = {};
        this.viewHistory.forEach(view => {
            categoryCount[view.category] = (categoryCount[view.category] || 0) + 1;
        });

        return Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)
            .map(([category]) => category);
    }

    // Analyze search trends
    getSearchTrends() {
        const keywords = {};
        this.searchHistory.forEach(search => {
            search.keywords.forEach(keyword => {
                keywords[keyword] = (keywords[keyword] || 0) + 1;
            });
        });

        return Object.entries(keywords)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([keyword, count]) => ({ keyword, count }));
    }

    // Generate category-specific insights
    getCategoryInsights() {
        const insights = {};
        
        Object.keys(this.userPreferences).forEach(category => {
            insights[category] = {
                popularFilters: this.getPopularFilters(category),
                interactionRate: this.calculateInteractionRate(category),
                trending: this.getTrendingItems(category)
            };
        });

        return insights;
    }

    // Get most used filters for a category
    getPopularFilters(category) {
        const filters = this.userPreferences[category]?.filters || {};
        const popularFilters = {};

        Object.entries(filters).forEach(([filter, values]) => {
            popularFilters[filter] = Object.entries(values)
                .sort(([,a], [,b]) => b - a)
                .map(([value]) => value)[0];
        });

        return popularFilters;
    }

    // Calculate user interaction rate for a category
    calculateInteractionRate(category) {
        const totalViews = this.viewHistory.length;
        const categoryViews = this.viewHistory.filter(v => v.category === category).length;
        return totalViews ? (categoryViews / totalViews) : 0;
    }

    // Get trending items in a category
    getTrendingItems(category) {
        const recentViews = this.viewHistory
            .filter(v => v.category === category)
            .slice(-20); // Look at last 20 views

        const itemCounts = {};
        recentViews.forEach(view => {
            itemCounts[view.itemId] = (itemCounts[view.itemId] || 0) + 1;
        });

        return Object.entries(itemCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([itemId]) => itemId);
    }
    
    // Get analytics dashboard data
    getAnalytics() {
        return {
            totalSearches: this.searchHistory.length,
            totalViews: this.viewHistory.length,
            categoriesExplored: Object.keys(this.userPreferences).length,
            topCategory: this.getTopCategories()[0] || 'None',
            recentActivity: this.viewHistory.slice(-10),
            searchEfficiency: this.calculateSearchEfficiency(),
            engagementScore: this.calculateEngagementScore()
        };
    }
    
    // Calculate search efficiency (how often searches lead to views)
    calculateSearchEfficiency() {
        if (this.searchHistory.length === 0) return 0;
        
        const searchToViewRatio = this.viewHistory.length / this.searchHistory.length;
        return Math.min(100, Math.round(searchToViewRatio * 100));
    }
    
    // Calculate overall engagement score
    calculateEngagementScore() {
        const factors = {
            searches: Math.min(this.searchHistory.length, 50),
            views: Math.min(this.viewHistory.length, 100),
            categories: Object.keys(this.userPreferences).length * 25,
            diversity: Object.keys(this.categoryWeights).filter(
                cat => Object.keys(this.categoryWeights[cat]).length > 0
            ).length * 10
        };
        
        const total = Object.values(factors).reduce((a, b) => a + b, 0);
        return Math.min(100, Math.round(total / 2));
    }
    
    // Reset AI system (for testing or privacy)
    reset() {
        this.userPreferences = {};
        this.searchHistory = [];
        this.viewHistory = [];
        this.categoryWeights = {
            scholarships: {},
            hackathons: {},
            workshops: {},
            internships: {}
        };
        this.clickThroughData = {};
        this.filterUsage = {};
        localStorage.removeItem('aiSystem');
    }
    
    // Get intelligent recommendations for chatbot
    getChatbotRecommendations(query, limit = 5) {
        const allResults = [];
        
        // Search all categories
        ['scholarships', 'hackathons', 'workshops', 'internships'].forEach(category => {
            const results = this.searchOpportunities(category, query);
            allResults.push(...results.map(r => ({ ...r, category })));
        });
        
        // Sort by score and return top results
        return allResults
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, limit);
    }
    
    // Extract entities from query (for chatbot)
    extractEntities(query) {
        const entities = {
            category: null,
            state: null,
            education: null,
            keywords: []
        };
        
        const lowerQuery = query.toLowerCase();
        
        // Detect category
        if (lowerQuery.match(/scholarship|fund|grant/)) entities.category = 'scholarships';
        else if (lowerQuery.match(/hackathon|competition|hack/)) entities.category = 'hackathons';
        else if (lowerQuery.match(/workshop|training|course/)) entities.category = 'workshops';
        else if (lowerQuery.match(/internship|job|placement/)) entities.category = 'internships';
        
        // Detect education level
        if (lowerQuery.match(/engineering|b\.?tech|btech/)) entities.education = 'engineering';
        else if (lowerQuery.match(/medical|mbbs|medicine/)) entities.education = 'medical';
        else if (lowerQuery.match(/arts|ba|humanities/)) entities.education = 'arts';
        else if (lowerQuery.match(/science|b\.?sc|bsc/)) entities.education = 'science';
        
        // Extract state from query if mentioned
        const states = ['delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 
                       'pune', 'ahmedabad', 'jaipur', 'lucknow', 'karnataka', 'maharashtra',
                       'tamil nadu', 'west bengal', 'uttar pradesh', 'rajasthan'];
        
        for (const state of states) {
            if (lowerQuery.includes(state)) {
                entities.state = state;
                break;
            }
        }
        
        return entities;
    }
}

// Export AI system instance
window.aiSystem = new AISystem();

// Helper function for external use - search across all categories
window.globalSearch = function(query) {
    const results = {};
    ['scholarships', 'hackathons', 'workshops', 'internships'].forEach(category => {
        results[category] = window.aiSystem.searchOpportunities(category, query);
    });
    return results;
};

// Helper function to get autocomplete suggestions
window.getSearchSuggestions = function(query, category = null) {
    return window.aiSystem.getSuggestions(query, category);
};