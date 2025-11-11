// Dashboard Management System
class DashboardManager {
    constructor() {
        this.savedOpportunities = this.loadFromStorage('savedOpportunities') || [];
        this.applicationTracking = this.loadFromStorage('applicationTracking') || [];
        this.deadlines = this.loadFromStorage('deadlines') || [];
        this.reminders = this.loadFromStorage('reminders') || [];
        this.userPreferences = this.loadFromStorage('userPreferences') || {
            categories: [],
            educationLevel: '',
            branch: '',
            state: ''
        };
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from storage:', e);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    // Save/Unsave Opportunity
    toggleSaveOpportunity(opportunity) {
        const index = this.savedOpportunities.findIndex(opp => opp.url === opportunity.url);
        
        if (index > -1) {
            this.savedOpportunities.splice(index, 1);
            this.saveToStorage('savedOpportunities', this.savedOpportunities);
            return false; // Unsaved
        } else {
            const savedOpp = {
                ...opportunity,
                savedAt: new Date().toISOString()
            };
            this.savedOpportunities.push(savedOpp);
            this.saveToStorage('savedOpportunities', this.savedOpportunities);
            return true; // Saved
        }
    }

    isSaved(url) {
        return this.savedOpportunities.some(opp => opp.url === url);
    }

    // Application Tracking
    addApplication(opportunity, status = 'pending') {
        const application = {
            ...opportunity,
            status: status,
            appliedAt: new Date().toISOString(),
            id: Date.now()
        };
        this.applicationTracking.push(application);
        this.saveToStorage('applicationTracking', this.applicationTracking);
        return application;
    }

    updateApplicationStatus(id, newStatus) {
        const app = this.applicationTracking.find(a => a.id === id);
        if (app) {
            app.status = newStatus;
            app.updatedAt = new Date().toISOString();
            this.saveToStorage('applicationTracking', this.applicationTracking);
        }
    }

    deleteApplication(id) {
        this.applicationTracking = this.applicationTracking.filter(a => a.id !== id);
        this.saveToStorage('applicationTracking', this.applicationTracking);
    }

    // Deadline Management
    addDeadline(opportunity, deadlineDate, customNote = '') {
        const deadline = {
            ...opportunity,
            deadlineDate: deadlineDate,
            customNote: customNote,
            id: Date.now()
        };
        this.deadlines.push(deadline);
        this.saveToStorage('deadlines', this.deadlines);
        return deadline;
    }

    deleteDeadline(id) {
        this.deadlines = this.deadlines.filter(d => d.id !== id);
        this.saveToStorage('deadlines', this.deadlines);
    }

    getUpcomingDeadlines(days = 30) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        
        return this.deadlines
            .filter(d => {
                const deadlineDate = new Date(d.deadlineDate);
                return deadlineDate >= now && deadlineDate <= futureDate;
            })
            .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate));
    }

    // Reminder Management
    addReminder(opportunity, reminderDate, type = 'deadline') {
        const reminder = {
            ...opportunity,
            reminderDate: reminderDate,
            type: type,
            active: true,
            id: Date.now()
        };
        this.reminders.push(reminder);
        this.saveToStorage('reminders', this.reminders);
        return reminder;
    }

    deleteReminder(id) {
        this.reminders = this.reminders.filter(r => r.id !== id);
        this.saveToStorage('reminders', this.reminders);
    }

    getActiveReminders() {
        return this.reminders.filter(r => r.active && new Date(r.reminderDate) > new Date());
    }

    // Stats
    getStats() {
        return {
            saved: this.savedOpportunities.length,
            applied: this.applicationTracking.length,
            deadlines: this.getUpcomingDeadlines().length,
            reminders: this.getActiveReminders().length
        };
    }

    // Recommendations based on user behavior
    getRecommendations() {
        // Track which categories user saves/applies to most
        const categoryCount = {};
        
        [...this.savedOpportunities, ...this.applicationTracking].forEach(opp => {
            categoryCount[opp.category] = (categoryCount[opp.category] || 0) + 1;
        });
        
        // Get top categories
        const topCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([category]) => category);
        
        this.userPreferences.categories = topCategories;
        this.userPreferences.state = localStorage.getItem('selectedState') || '';
        this.saveToStorage('userPreferences', this.userPreferences);
        
        return this.userPreferences;
    }
}

// Initialize Dashboard Manager
const dashboardManager = new DashboardManager();
// Make it globally accessible
window.dashboardManager = dashboardManager;

// Show Dashboard
function showDashboard() {
    console.log('showDashboard called');
    
    // Get elements
    const homeContent = document.getElementById('homeContent');
    const searchContainer = document.getElementById('searchContainer');
    const optionsContainer = document.getElementById('optionsContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const comparisonContainer = document.getElementById('comparisonContainer');
    const searchResults = document.getElementById('searchResults');
    
    console.log('Dashboard elements:', {
        homeContent: !!homeContent,
        searchContainer: !!searchContainer,
        optionsContainer: !!optionsContainer,
        dashboardContainer: !!dashboardContainer,
        comparisonContainer: !!comparisonContainer,
        searchResults: !!searchResults
    });
    
    // Hide other containers
    if (homeContent) homeContent.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    if (optionsContainer) optionsContainer.style.display = 'none';
    if (comparisonContainer) comparisonContainer.style.display = 'none';
    if (searchResults) searchResults.style.display = 'none';
    
    // Show dashboard
    if (dashboardContainer) {
        dashboardContainer.style.display = 'block';
        
        // Load dashboard data
        loadDashboardStats();
        loadSavedOpportunities();
        loadApplicationTracker();
        loadUpcomingDeadlines();
        loadRecommendations();
        
        // Refresh widgets
        if (window.widgetsManager) {
            setTimeout(() => window.widgetsManager.refresh(), 300);
        }
        
        // Reinitialize language system
        if (window.reinitializeLanguageSystem) {
            setTimeout(() => window.reinitializeLanguageSystem(), 100);
        }
    } else {
        console.error('Dashboard container not found!');
    }
}
// Make it globally accessible
window.showDashboard = showDashboard;

// Show Home Page
function showHomePage() {
    console.log('showHomePage called');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const comparisonContainer = document.getElementById('comparisonContainer');
    const homeContent = document.getElementById('homeContent');
    const searchContainer = document.getElementById('searchContainer');
    const optionsContainer = document.getElementById('optionsContainer');
    const searchResults = document.getElementById('searchResults');
    
    if (dashboardContainer) dashboardContainer.style.display = 'none';
    if (comparisonContainer) comparisonContainer.style.display = 'none';
    if (homeContent) homeContent.style.display = 'block';
    if (searchContainer) searchContainer.style.display = 'block';
    if (optionsContainer) optionsContainer.style.display = 'block';
    if (searchResults) {
        // Only show if it has content
        if (searchResults.innerHTML.trim()) {
            searchResults.style.display = 'block';
        }
    }
    
    // Reinitialize language system
    if (window.reinitializeLanguageSystem) {
        setTimeout(() => window.reinitializeLanguageSystem(), 100);
    }
}
// Make it globally accessible
window.showHomePage = showHomePage;

// Show Comparison View
function showComparison() {
    console.log('showComparison called');
    if (window.comparisonTool) {
        window.comparisonTool.showComparisonView();
        
        // Reinitialize language system
        if (window.reinitializeLanguageSystem) {
            setTimeout(() => window.reinitializeLanguageSystem(), 100);
        }
    } else {
        console.error('Comparison tool not initialized');
    }
}
// Make it globally accessible
window.showComparison = showComparison;

// Load Dashboard Stats
function loadDashboardStats() {
    const stats = dashboardManager.getStats();
    document.getElementById('savedCount').textContent = stats.saved;
    document.getElementById('appliedCount').textContent = stats.applied;
    document.getElementById('deadlineCount').textContent = stats.deadlines;
    document.getElementById('reminderCount').textContent = stats.reminders;
}

// Load Saved Opportunities
function loadSavedOpportunities() {
    const container = document.getElementById('savedOpportunities');
    const saved = dashboardManager.savedOpportunities;
    
    if (saved.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <p>No saved opportunities yet</p>
                <p class="empty-state-hint">Save opportunities from search results to track them here</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = saved.map(opp => `
        <div class="opportunity-card">
            <h4>${opp.name}</h4>
            <p>${opp.description.substring(0, 100)}...</p>
            <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-bottom: 10px;">
                <i class="fas fa-tag"></i> ${opp.category}
            </div>
            <div class="card-actions">
                <a href="${opp.url}" target="_blank" class="btn-small btn-primary">
                    <i class="fas fa-external-link-alt"></i> View
                </a>
                <button class="btn-small btn-secondary" onclick="markAsApplied('${opp.url}')">
                    <i class="fas fa-check"></i> Mark Applied
                </button>
                <button class="btn-small btn-secondary" onclick="addDeadlinePrompt('${opp.url}')">
                    <i class="fas fa-calendar-plus"></i> Set Deadline
                </button>
                <button class="btn-small btn-danger" onclick="unsaveOpportunity('${opp.url}')">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
}

// Load Application Tracker
function loadApplicationTracker() {
    const container = document.getElementById('applicationTracker');
    const applications = dashboardManager.applicationTracking;
    
    if (applications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No applications tracked yet</p>
                <p class="empty-state-hint">Mark opportunities as "Applied" to track their status</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = applications.map(app => `
        <div class="tracker-item">
            <div class="tracker-info">
                <h4>${app.name}</h4>
                <p><i class="fas fa-calendar"></i> Applied on: ${new Date(app.appliedAt).toLocaleDateString()}</p>
            </div>
            <div class="tracker-status">
                <select class="status-badge status-${app.status}" onchange="updateStatus(${app.id}, this.value)">
                    <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="applied" ${app.status === 'applied' ? 'selected' : ''}>Applied</option>
                    <option value="accepted" ${app.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
                <button class="btn-small btn-danger" onclick="deleteApplication(${app.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load Upcoming Deadlines
function loadUpcomingDeadlines() {
    const container = document.getElementById('upcomingDeadlines');
    const deadlines = dashboardManager.getUpcomingDeadlines();
    
    if (deadlines.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <p>No deadlines set</p>
                <p class="empty-state-hint">Add deadlines to opportunities to track them here</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = deadlines.map(deadline => {
        const daysUntil = Math.ceil((new Date(deadline.deadlineDate) - new Date()) / (1000 * 60 * 60 * 24));
        const isUrgent = daysUntil <= 7;
        
        return `
            <div class="deadline-item ${isUrgent ? 'urgent' : ''}">
                <div class="deadline-info">
                    <h4>${deadline.name}</h4>
                    <p>${deadline.customNote || 'Application deadline'}</p>
                </div>
                <div class="deadline-timer ${isUrgent ? 'urgent' : ''}">
                    <i class="fas fa-clock"></i>
                    <span>${daysUntil} ${daysUntil === 1 ? 'day' : 'days'} left</span>
                    <button class="btn-small btn-danger" onclick="deleteDeadline(${deadline.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Load Recommendations
function loadRecommendations() {
    const container = document.getElementById('recommendedOpportunities');
    const prefs = dashboardManager.getRecommendations();
    const selectedState = localStorage.getItem('selectedState');
    
    if (!selectedState || prefs.categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lightbulb"></i>
                <p>Start saving opportunities to get personalized recommendations!</p>
            </div>
        `;
        return;
    }
    
    // Get recommendations from state opportunities
    const stateData = stateOpportunities[selectedState] || {};
    const recommendations = [];
    
    prefs.categories.forEach(category => {
        if (stateData[category]) {
            recommendations.push(...stateData[category].slice(0, 3));
        }
    });
    
    if (recommendations.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.7);">No recommendations available at the moment.</p>';
        return;
    }
    
    container.innerHTML = recommendations.slice(0, 6).map(opp => `
        <div class="opportunity-card">
            <h4>${opp.name}</h4>
            <p>${opp.description.substring(0, 100)}...</p>
            <div class="card-actions">
                <a href="${opp.url}" target="_blank" class="btn-small btn-primary">
                    <i class="fas fa-external-link-alt"></i> View
                </a>
                <button class="btn-small btn-secondary" onclick="saveOpportunityFromDashboard('${encodeURIComponent(JSON.stringify(opp))}')">
                    <i class="fas fa-bookmark"></i> Save
                </button>
            </div>
        </div>
    `).join('');
}

// Helper Functions
function saveOpportunityFromDashboard(oppJson) {
    const opp = JSON.parse(decodeURIComponent(oppJson));
    const saved = dashboardManager.toggleSaveOpportunity(opp);
    
    if (saved) {
        if (window.authSystem) {
            authSystem.showToast('Opportunity saved!', 'success');
        }
        loadDashboardStats();
        loadSavedOpportunities();
        loadRecommendations();
    }
}

function unsaveOpportunity(url) {
    const opp = dashboardManager.savedOpportunities.find(o => o.url === url);
    if (opp) {
        dashboardManager.toggleSaveOpportunity(opp);
        if (window.authSystem) {
            authSystem.showToast('Opportunity removed', 'info');
        }
        loadDashboardStats();
        loadSavedOpportunities();
    }
}

function markAsApplied(url) {
    const opp = dashboardManager.savedOpportunities.find(o => o.url === url);
    if (opp) {
        dashboardManager.addApplication(opp, 'applied');
        if (window.authSystem) {
            authSystem.showToast('Added to application tracker!', 'success');
        }
        loadDashboardStats();
        loadApplicationTracker();
    }
}

function addDeadlinePrompt(url) {
    const opp = dashboardManager.savedOpportunities.find(o => o.url === url);
    if (opp) {
        const dateStr = prompt('Enter deadline date (YYYY-MM-DD):');
        if (dateStr) {
            const note = prompt('Add a note (optional):') || 'Application deadline';
            dashboardManager.addDeadline(opp, dateStr, note);
            if (window.authSystem) {
                authSystem.showToast('Deadline added!', 'success');
            }
            loadDashboardStats();
            loadUpcomingDeadlines();
        }
    }
}

function updateStatus(id, newStatus) {
    dashboardManager.updateApplicationStatus(id, newStatus);
    if (window.authSystem) {
        authSystem.showToast('Status updated!', 'success');
    }
    loadApplicationTracker();
}

function deleteApplication(id) {
    if (confirm('Remove this application from tracker?')) {
        dashboardManager.deleteApplication(id);
        if (window.authSystem) {
            authSystem.showToast('Application removed', 'info');
        }
        loadDashboardStats();
        loadApplicationTracker();
    }
}

function deleteDeadline(id) {
    if (confirm('Remove this deadline?')) {
        dashboardManager.deleteDeadline(id);
        if (window.authSystem) {
            authSystem.showToast('Deadline removed', 'info');
        }
        loadDashboardStats();
        loadUpcomingDeadlines();
    }
}

// Make dashboardManager available globally
window.dashboardManager = dashboardManager;
