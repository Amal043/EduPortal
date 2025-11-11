// Scholarship Comparison Tool
class ComparisonTool {
    constructor() {
        this.selectedItems = this.loadFromStorage() || [];
        this.maxComparisons = 3;
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem('eduportal_comparison');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading comparison data:', e);
            return [];
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('eduportal_comparison', JSON.stringify(this.selectedItems));
        } catch (e) {
            console.error('Error saving comparison data:', e);
        }
    }

    addToComparison(opportunity) {
        console.log('addToComparison called:', opportunity);
        
        // Check if already added - if so, remove it (toggle behavior)
        if (this.isInComparison(opportunity.url)) {
            console.log('Item already in comparison, removing...');
            this.removeFromComparison(opportunity.url);
            return true;
        }

        if (this.selectedItems.length >= this.maxComparisons) {
            console.log('Max comparisons reached');
            if (window.authSystem) {
                window.authSystem.showToast(`Maximum ${this.maxComparisons} items can be compared`, 'warning');
            }
            return false;
        }

        console.log('Adding item to comparison');
        this.selectedItems.push(opportunity);
        this.saveToStorage();
        this.updateComparisonBadge();
        
        if (window.authSystem) {
            window.authSystem.showToast('Added to comparison! ⚖️', 'success');
        }
        return true;
    }

    removeFromComparison(url) {
        this.selectedItems = this.selectedItems.filter(item => item.url !== url);
        this.saveToStorage();
        this.updateComparisonBadge();
        
        if (window.authSystem) {
            window.authSystem.showToast('Removed from comparison', 'info');
        }
    }

    clearComparison() {
        this.selectedItems = [];
        this.saveToStorage();
        this.updateComparisonBadge();
    }

    isInComparison(url) {
        return this.selectedItems.some(item => item.url === url);
    }

    getComparisonCount() {
        return this.selectedItems.length;
    }

    updateComparisonBadge() {
        const badge = document.getElementById('comparisonCount');
        const count = this.getComparisonCount();
        
        if (badge) {
            badge.textContent = count;
            if (count > 0) {
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }

        // Update all compare buttons in search results
        document.querySelectorAll('.compare-btn').forEach(btn => {
            const itemJson = btn.getAttribute('data-item');
            if (itemJson) {
                try {
                    const itemData = JSON.parse(itemJson.replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
                    if (this.isInComparison(itemData.url)) {
                        btn.classList.add('active');
                        btn.title = 'Remove from compare';
                    } else {
                        btn.classList.remove('active');
                        btn.title = 'Add to compare';
                    }
                } catch (e) {
                    console.error('Error parsing item data:', e);
                }
            }
        });
    }

    showComparisonView() {
        console.log('showComparisonView called, items:', this.selectedItems.length);
        
        if (this.selectedItems.length < 2) {
            console.log('Not enough items to compare');
            if (window.authSystem) {
                window.authSystem.showToast('Add at least 2 opportunities to compare', 'warning');
            }
            return;
        }

        console.log('Hiding other containers...');
        // Hide other containers
        const homeContent = document.getElementById('homeContent');
        const searchContainer = document.getElementById('searchContainer');
        const optionsContainer = document.getElementById('optionsContainer');
        const dashboardContainer = document.getElementById('dashboardContainer');
        const searchResults = document.getElementById('searchResults');
        
        if (homeContent) homeContent.style.display = 'none';
        if (searchContainer) searchContainer.style.display = 'none';
        if (optionsContainer) optionsContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
        if (searchResults) searchResults.style.display = 'none';

        // Show comparison container
        const comparisonContainer = document.getElementById('comparisonContainer');
        console.log('Comparison container found:', !!comparisonContainer);
        if (comparisonContainer) {
            comparisonContainer.style.display = 'block';
            console.log('Rendering comparison...');
            this.renderComparison();
        }
    }

    renderComparison() {
        const container = document.getElementById('comparisonContent');
        if (!container) {
            console.error('Comparison content container not found');
            return;
        }

        const items = this.selectedItems;

        let html = `
            <div class="comparison-header">
                <h2><i class="fas fa-balance-scale"></i> Compare Opportunities</h2>
                <div class="comparison-actions">
                    <button onclick="comparisonTool.clearComparison(); comparisonTool.showComparisonView();" class="clear-comparison-btn">
                        <i class="fas fa-trash"></i> Clear All
                    </button>
                    <button onclick="showHomePage()" class="back-btn">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                </div>
            </div>

            <div class="comparison-table">
                <table>
                    <thead>
                        <tr>
                            <th class="feature-column">Feature</th>
                            ${items.map((item, index) => `
                                <th class="item-column">
                                    <div class="item-header">
                                        <h3>${item.name}</h3>
                                        <button onclick="comparisonTool.removeFromComparison('${item.url}'); comparisonTool.showComparisonView();" class="remove-item-btn">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="feature-label"><i class="fas fa-info-circle"></i> Description</td>
                            ${items.map(item => `
                                <td>${item.description.substring(0, 150)}${item.description.length > 150 ? '...' : ''}</td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="feature-label"><i class="fas fa-globe"></i> Availability</td>
                            ${items.map(item => `
                                <td>
                                    <span class="badge ${item.isNational ? 'badge-success' : 'badge-info'}">
                                        ${item.isNational ? '🌍 All India' : '📍 State-Specific'}
                                    </span>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="feature-label"><i class="fas fa-map-marked-alt"></i> States</td>
                            ${items.map(item => `
                                <td>
                                    ${item.isNational ? 
                                        '<span class="text-success">All States</span>' : 
                                        item.statesList ? `<span>${item.statesList.slice(0, 3).join(', ')}${item.statesList.length > 3 ? '...' : ''}</span>` : 
                                        '<span class="text-muted">Check details</span>'
                                    }
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="feature-label"><i class="fas fa-link"></i> Source</td>
                            ${items.map(item => `
                                <td>${item.source || 'Official Portal'}</td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="feature-label"><i class="fas fa-chart-line"></i> Match Score</td>
                            ${items.map(item => `
                                <td>
                                    <div class="score-bar">
                                        <div class="score-fill" style="width: ${item.score ? Math.min(100, item.score / 3.5) : 70}%"></div>
                                    </div>
                                    <span class="score-text">${item.score ? Math.round(item.score / 3.5) : 70}%</span>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="feature-label"><i class="fas fa-external-link-alt"></i> Apply</td>
                            ${items.map(item => `
                                <td>
                                    <a href="${item.url}" target="_blank" class="apply-btn">
                                        <i class="fas fa-arrow-right"></i> View Details
                                    </a>
                                </td>
                            `).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="ai-recommendation">
                <h3><i class="fas fa-robot"></i> AI Recommendation</h3>
                ${this.generateAIRecommendation(items)}
            </div>

            <div class="pros-cons-section">
                ${items.map((item, index) => `
                    <div class="pros-cons-card">
                        <h4>${item.name}</h4>
                        <div class="pros">
                            <h5><i class="fas fa-check-circle"></i> Pros</h5>
                            <ul>
                                ${this.generatePros(item).map(pro => `<li>${pro}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="cons">
                            <h5><i class="fas fa-times-circle"></i> Cons</h5>
                            <ul>
                                ${this.generateCons(item).map(con => `<li>${con}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    }

    generateAIRecommendation(items) {
        // AI-based recommendation logic
        let recommendation = '<div class="recommendation-content">';
        
        // Find best match score
        const bestMatch = items.reduce((best, item) => {
            const score = item.score || 250;
            return score > (best.score || 250) ? item : best;
        }, items[0]);

        recommendation += `
            <p><strong>🎯 Best Match:</strong> <span class="highlight">${bestMatch.name}</span></p>
            <p><strong>Reason:</strong> ${bestMatch.isNational ? 
                'Available nationwide with broader accessibility' : 
                'Specifically designed for your state with targeted benefits'}
            </p>
        `;

        // Compare availability
        const nationalCount = items.filter(i => i.isNational).length;
        if (nationalCount > 0 && nationalCount < items.length) {
            recommendation += `
                <p><strong>💡 Tip:</strong> Consider applying to both national and state-specific scholarships to maximize your chances.</p>
            `;
        }

        recommendation += '</div>';
        return recommendation;
    }

    generatePros(item) {
        const pros = [];
        
        if (item.isNational) {
            pros.push('Available in all states across India');
            pros.push('Wider acceptance and recognition');
        } else {
            pros.push('State-specific with focused benefits');
            pros.push('May have less competition');
        }

        if (item.description.toLowerCase().includes('merit')) {
            pros.push('Merit-based selection ensures fair opportunity');
        }

        if (item.source) {
            pros.push(`Verified source: ${item.source}`);
        }

        pros.push('Official government scholarship portal');

        return pros.slice(0, 4);
    }

    generateCons(item) {
        const cons = [];

        if (item.isNational) {
            cons.push('Higher competition due to nationwide applicability');
        } else {
            cons.push('Limited to specific states only');
        }

        if (!item.description.toLowerCase().includes('deadline')) {
            cons.push('Check deadline details on official portal');
        }

        cons.push('Requires document verification');
        cons.push('Application process may take time');

        return cons.slice(0, 3);
    }
}

// Initialize comparison tool
const comparisonTool = new ComparisonTool();
window.comparisonTool = comparisonTool;

// Update badge on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        comparisonTool.updateComparisonBadge();
    });
} else {
    comparisonTool.updateComparisonBadge();
}
