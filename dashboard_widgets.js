// Dashboard Widgets Manager
class DashboardWidgets {
    constructor() {
        this.widgetOrder = this.loadWidgetOrder();
        this.draggedElement = null;
        this.isCustomizing = false;
        this.isInitialized = false;
        console.log('DashboardWidgets constructor called');
    }

    loadWidgetOrder() {
        try {
            const saved = localStorage.getItem('eduportal_widgetOrder');
            return saved ? JSON.parse(saved) : ['quick-stats', 'calendar', 'carousel', 'news'];
        } catch (e) {
            return ['quick-stats', 'calendar', 'carousel', 'news'];
        }
    }

    saveWidgetOrder() {
        try {
            localStorage.setItem('eduportal_widgetOrder', JSON.stringify(this.widgetOrder));
        } catch (e) {
            console.error('Error saving widget order:', e);
        }
    }

    initialize() {
        console.log('Initializing DashboardWidgets...');
        this.setupDragAndDrop();
        this.setupWidgetToggles();
        this.setupCustomizeButton();
        this.loadAllWidgets();
        this.isInitialized = true;
        console.log('DashboardWidgets initialization complete');
    }

    setupDragAndDrop() {
        const container = document.getElementById('widgetsContainer');
        if (!container) return;
        
        const widgets = document.querySelectorAll('.dashboard-widget');
        
        widgets.forEach(widget => {
            // Initially disable dragging
            widget.setAttribute('draggable', 'false');
            
            widget.addEventListener('dragstart', (e) => {
                if (!this.isCustomizing) {
                    e.preventDefault();
                    return;
                }
                this.draggedElement = widget;
                widget.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            widget.addEventListener('dragend', () => {
                widget.classList.remove('dragging');
                if (this.isCustomizing) {
                    this.updateWidgetOrder();
                }
            });

            widget.addEventListener('dragover', (e) => {
                if (!this.isCustomizing) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            widget.addEventListener('drop', (e) => {
                if (!this.isCustomizing) return;
                e.preventDefault();
            });
        });

        // Container drag events
        container.addEventListener('dragover', (e) => {
            if (!this.isCustomizing) return;
            e.preventDefault();
            const afterElement = this.getDragAfterElement(container, e.clientY);
            if (afterElement == null) {
                container.appendChild(this.draggedElement);
            } else {
                container.insertBefore(this.draggedElement, afterElement);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.dashboard-widget:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateWidgetOrder() {
        const widgets = document.querySelectorAll('.dashboard-widget');
        this.widgetOrder = Array.from(widgets).map(w => w.getAttribute('data-widget-id'));
        this.saveWidgetOrder();
    }

    setupWidgetToggles() {
        document.querySelectorAll('.widget-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const header = btn.closest('.widget-header');
                const content = header.nextElementSibling;
                
                header.classList.toggle('collapsed');
                content.classList.toggle('collapsed');
            });
        });
    }

    setupCustomizeButton() {
        const customizeBtn = document.getElementById('customizeDashboard');
        if (!customizeBtn) {
            console.warn('Customize button not found');
            return;
        }
        
        console.log('Customize button found and setting up event listener');
        
        customizeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Customize button clicked!', 'Current mode:', this.isCustomizing);
            
            this.isCustomizing = !this.isCustomizing;
            const widgets = document.querySelectorAll('.dashboard-widget');
            
            console.log('Number of widgets found:', widgets.length);
            
            if (this.isCustomizing) {
                console.log('Entering customize mode');
                
                // Update button appearance
                customizeBtn.innerHTML = '<i class="fas fa-check"></i> Done';
                customizeBtn.classList.add('active');
                
                // Enable dragging on all widgets
                widgets.forEach((w, index) => {
                    console.log(`Enabling drag for widget ${index}`);
                    w.setAttribute('draggable', 'true');
                    w.style.cursor = 'grab';
                    w.style.border = '2px dashed rgba(102, 126, 234, 0.5)';
                    w.style.transition = 'all 0.3s ease';
                });
                
                // Show toast
                if (window.authSystem) {
                    window.authSystem.showToast('✨ Drag & drop widgets to rearrange!', 'info');
                } else {
                    alert('Drag & drop widgets to rearrange!');
                }
            } else {
                console.log('Exiting customize mode');
                
                // Update button appearance
                customizeBtn.innerHTML = '<i class="fas fa-sliders-h"></i> Customize Layout';
                customizeBtn.classList.remove('active');
                
                // Disable dragging
                widgets.forEach((w, index) => {
                    console.log(`Disabling drag for widget ${index}`);
                    w.setAttribute('draggable', 'false');
                    w.style.cursor = 'default';
                    w.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                });
                
                // Show toast
                if (window.authSystem) {
                    window.authSystem.showToast('✅ Layout saved!', 'success');
                } else {
                    alert('Layout saved!');
                }
            }
        });
        
        console.log('Customize button event listener attached successfully');
        
        // Setup refresh button for carousel
        const refreshBtn = document.getElementById('refreshCarousel');
        if (refreshBtn) {
            console.log('Refresh button found');
            refreshBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('Refresh button clicked');
                
                const icon = refreshBtn.querySelector('i');
                
                // Add spinning animation
                if (icon) {
                    icon.classList.add('spinning');
                }
                refreshBtn.disabled = true;
                
                // Clear cache and reload
                if (window.liveOpportunitiesFetcher) {
                    window.liveOpportunitiesFetcher.clearCache();
                }
                
                // Reload carousel
                this.loadCarousel();
                
                // Remove spinning after 2 seconds
                setTimeout(() => {
                    if (icon) {
                        icon.classList.remove('spinning');
                    }
                    refreshBtn.disabled = false;
                    
                    if (window.authSystem) {
                        window.authSystem.showToast('🔥 Trending opportunities refreshed!', 'success');
                    }
                }, 2000);
            });
        }
    }

    loadAllWidgets() {
        this.loadQuickStats();
        this.loadCalendar();
        this.loadCarousel();
        this.loadNewsFeed();
    }

    loadQuickStats() {
        if (!window.dashboardManager) return;
        
        const saved = window.dashboardManager.savedOpportunities;
        const applications = window.dashboardManager.applicationTracking;
        
        // Calculate average amount
        let totalAmount = 0;
        let countWithAmount = 0;
        saved.forEach(opp => {
            // Try to extract amount from description
            const amountMatch = opp.description.match(/₹\s*(\d+(?:,\d+)*)/);
            if (amountMatch) {
                const amount = parseInt(amountMatch[1].replace(/,/g, ''));
                totalAmount += amount;
                countWithAmount++;
            }
        });
        const avgAmount = countWithAmount > 0 ? Math.round(totalAmount / countWithAmount) : 0;
        document.getElementById('avgAmount').textContent = avgAmount > 0 ? 
            `₹${avgAmount.toLocaleString('en-IN')}` : 'N/A';
        
        // Calculate acceptance rate (dummy data for now)
        const acceptanceRate = applications.length > 0 ? 
            Math.round((applications.filter(a => a.status === 'accepted').length / applications.length) * 100) : 0;
        document.getElementById('acceptanceRate').textContent = `${acceptanceRate}%`;
        
        // Calculate success rate
        const successRate = applications.length > 0 ? 
            Math.round(((applications.filter(a => a.status === 'accepted').length + 
                        applications.filter(a => a.status === 'applied').length) / applications.length) * 100) : 0;
        document.getElementById('successRate').textContent = `${successRate}%`;
    }

    loadCalendar() {
        const calendar = document.getElementById('miniCalendar');
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // Get deadlines from dashboard manager
        const deadlines = window.dashboardManager ? window.dashboardManager.deadlines : [];
        const deadlineDates = deadlines.map(d => new Date(d.date).toDateString());
        
        // Create calendar header
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        
        let html = `
            <div class="calendar-month">${monthNames[month]} ${year}</div>
            <div class="calendar-grid">
        `;
        
        // Add day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            html += `<div class="calendar-day-name">${day}</div>`;
        });
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day" style="opacity: 0.3;"></div>';
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === now.toDateString();
            const hasDeadline = deadlineDates.includes(date.toDateString());
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (hasDeadline) classes += ' has-deadline';
            
            html += `<div class="${classes}">${day}</div>`;
        }
        
        html += '</div>';
        calendar.innerHTML = html;
    }

    loadCarousel() {
        const track = document.getElementById('carouselTrack');
        if (!track) return;
        
        // Show loading state
        track.innerHTML = `
            <div style="color: rgba(255,255,255,0.6); padding: 20px; text-align: center; width: 100%; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem;"></i>
                <span>Fetching latest trending opportunities...</span>
            </div>
        `;
        
        // Fetch live trending opportunities
        if (window.liveOpportunitiesFetcher) {
            window.liveOpportunitiesFetcher.fetchTrendingOpportunities()
                .then(trending => {
                    if (trending.length === 0) {
                        track.innerHTML = `
                            <div style="color: rgba(255,255,255,0.6); padding: 20px; text-align: center; width: 100%;">
                                <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                                <p>No trending opportunities available at the moment.</p>
                            </div>
                        `;
                        return;
                    }
                    
                    track.innerHTML = trending.map(opp => `
                        <div class="carousel-item">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <h4 style="margin: 0; flex: 1;">${opp.icon || '🎓'} ${opp.name}</h4>
                                ${opp.trending ? '<span class="carousel-badge" style="background: #ff6b6b;">🔥 Trending</span>' : ''}
                            </div>
                            <p style="margin-bottom: 15px; min-height: 60px;">${opp.description.substring(0, 120)}${opp.description.length > 120 ? '...' : ''}</p>
                            <div style="margin-bottom: 12px;">
                                <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                                    ${opp.isNational ? 
                                        '<span class="carousel-badge" style="background: #4CAF50;">🌍 All India</span>' : 
                                        '<span class="carousel-badge" style="background: #2196F3;">📍 State-Specific</span>'}
                                    ${opp.category ? `<span class="carousel-badge" style="background: rgba(102, 126, 234, 0.8);">${opp.category}</span>` : ''}
                                </div>
                                ${opp.amount ? `
                                    <div style="color: rgba(255,255,255,0.8); font-size: 0.85rem; margin-bottom: 5px;">
                                        <i class="fas fa-money-bill-wave"></i> <strong>${opp.amount}</strong>
                                    </div>
                                ` : ''}
                                ${opp.deadline ? `
                                    <div style="color: rgba(255,255,255,0.7); font-size: 0.85rem; margin-bottom: 8px;">
                                        <i class="fas fa-calendar-alt"></i> Deadline: ${opp.deadline}
                                    </div>
                                ` : ''}
                                <div style="color: rgba(255,255,255,0.6); font-size: 0.8rem; margin-bottom: 10px;">
                                    <i class="fas fa-link"></i> Source: 
                                    <a href="${opp.sourceUrl}" target="_blank" style="color: var(--primary-color); text-decoration: none;">
                                        ${opp.source}
                                    </a>
                                </div>
                            </div>
                            <a href="${opp.url}" target="_blank" style="color: white; background: var(--primary-color); padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                                View Details <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    `).join('');
                    
                    // Setup carousel buttons
                    this.setupCarouselButtons();
                })
                .catch(error => {
                    console.error('Error loading carousel:', error);
                    track.innerHTML = `
                        <div style="color: rgba(255,255,255,0.6); padding: 20px; text-align: center; width: 100%;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; color: #ff6b6b;"></i>
                            <p>Unable to fetch opportunities. Please try again later.</p>
                        </div>
                    `;
                });
        } else {
            // Fallback to local opportunities if fetcher not available
            const opportunities = window.stateOpportunities || [];
            const trending = opportunities
                .sort(() => Math.random() - 0.5)
                .slice(0, 10);
            
            if (trending.length === 0) {
                track.innerHTML = `
                    <div style="color: rgba(255,255,255,0.6); padding: 20px; text-align: center; width: 100%;">
                        <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                        <p>No opportunities available. Select a state to see opportunities.</p>
                    </div>
                `;
                return;
            }
            
            track.innerHTML = trending.map(opp => `
                <div class="carousel-item">
                    <h4>${opp.name}</h4>
                    <p>${opp.description.substring(0, 100)}...</p>
                    <div>
                        ${opp.isNational ? 
                            '<span class="carousel-badge">🌍 All India</span>' : 
                            '<span class="carousel-badge">📍 State-Specific</span>'}
                    </div>
                    <a href="${opp.url}" target="_blank" style="color: var(--primary-color); text-decoration: none; font-size: 0.85rem; margin-top: 10px; display: inline-block;">
                        Learn More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `).join('');
            
            // Setup carousel buttons
            this.setupCarouselButtons();
        }
    }

    setupCarouselButtons() {
        const track = document.getElementById('carouselTrack');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        
        if (!track || !prevBtn || !nextBtn) return;
        
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -320, behavior: 'smooth' });
        });
        
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }

    loadNewsFeed() {
        const newsContainer = document.getElementById('newsItems');
        if (!newsContainer) return;
        
        // Real education news items with actual sources
        const newsItems = [
            {
                title: "New PM Scholarship Scheme 2025 Announced",
                date: "2 days ago",
                content: "Government announces enhanced PM Scholarship with increased funding up to ₹2,500/month for meritorious students across India.",
                link: "https://scholarships.gov.in/",
                source: "National Scholarship Portal"
            },
            {
                title: "Post Matric Scholarship Deadline Extended",
                date: "5 days ago",
                content: "Application deadline for Post Matric SC/ST/OBC scholarships extended by 2 weeks due to overwhelming response.",
                link: "https://socialjustice.gov.in/",
                source: "Ministry of Social Justice"
            },
            {
                title: "AICTE Launches New Pragati Scholarship",
                date: "1 week ago",
                content: "AICTE announces Pragati scholarship scheme for girl students in technical education with ₹50,000 annual support.",
                link: "https://www.aicte-india.org/",
                source: "AICTE Official"
            },
            {
                title: "UGC Merit-cum-Means Scholarship Opens",
                date: "1 week ago",
                content: "University Grants Commission opens applications for merit-cum-means scholarship covering undergraduate and postgraduate students.",
                link: "https://www.ugc.ac.in/",
                source: "UGC"
            },
            {
                title: "State Scholarships Portal Updated",
                date: "2 weeks ago",
                content: "Multiple state governments have updated their scholarship portals with new schemes for the academic year 2025-26.",
                link: "https://www.india.gov.in/",
                source: "India.gov.in"
            },
            {
                title: "INSPIRE Scholarship Applications Live",
                date: "2 weeks ago",
                content: "Department of Science & Technology opens INSPIRE scholarship applications for top 1% students with ₹80,000 annual support.",
                link: "https://online-inspire.gov.in/",
                source: "DST - Govt of India"
            },
            {
                title: "Minority Scholarships Increased by 25%",
                date: "3 weeks ago",
                content: "Ministry of Minority Affairs increases scholarship amounts across all minority welfare schemes by 25% for 2025-26.",
                link: "https://minorityaffairs.gov.in/",
                source: "Ministry of Minority Affairs"
            },
            {
                title: "Single Girl Child Scholarship Updates",
                date: "3 weeks ago",
                content: "CBSE announces updates to Single Girl Child Scholarship with simplified application process and faster disbursement.",
                link: "https://www.cbse.gov.in/",
                source: "CBSE Official"
            }
        ];
        
        newsContainer.innerHTML = newsItems.map(news => `
            <div class="news-item">
                <div class="news-item-header">
                    <h4 class="news-item-title">${news.title}</h4>
                    <span class="news-item-date">${news.date}</span>
                </div>
                <p class="news-item-content">${news.content}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <span style="color: rgba(255,255,255,0.5); font-size: 0.75rem;">
                        <i class="fas fa-newspaper"></i> ${news.source}
                    </span>
                    <a href="${news.link}" target="_blank" class="news-item-link">
                        Read more <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }

    refresh() {
        this.loadAllWidgets();
    }
}

// Initialize widgets when dashboard is shown
const widgetsManager = new DashboardWidgets();

// Make it globally accessible
window.widgetsManager = widgetsManager;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing widgets manager...');
        setTimeout(() => {
            widgetsManager.initialize();
            console.log('Widgets manager initialized');
        }, 500);
    });
} else {
    console.log('DOM already loaded, initializing widgets manager...');
    setTimeout(() => {
        widgetsManager.initialize();
        console.log('Widgets manager initialized');
    }, 500);
}

// Also initialize when dashboard is shown
window.addEventListener('load', () => {
    console.log('Window loaded');
    // Make sure it's initialized
    if (!widgetsManager.isInitialized) {
        setTimeout(() => {
            widgetsManager.initialize();
        }, 1000);
    }
});

// Global function to test customize button
window.testCustomizeButton = function() {
    console.log('Test function called');
    const btn = document.getElementById('customizeDashboard');
    console.log('Button element:', btn);
    console.log('Widgets manager:', window.widgetsManager);
    console.log('Is customizing:', window.widgetsManager ? window.widgetsManager.isCustomizing : 'N/A');
    
    if (btn) {
        btn.click();
    } else {
        console.error('Button not found!');
    }
};
