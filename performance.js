// ============================================
// PERFORMANCE OPTIMIZATION & SMOOTH LOADING
// ============================================

(function() {
    'use strict';

    // ===== DYNAMIC API REDIRECTION FOR GITHUB PAGES =====
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        if (typeof input === 'string' && input.startsWith('/api/') && window.location.hostname.includes('github.io')) {
            input = 'https://ed-portal.vercel.app' + input;
        }
        return originalFetch(input, init);
    };

    // ===== LOADING SCREEN MANAGEMENT =====
    const hideLoader = () => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    };

    window.addEventListener('load', () => setTimeout(hideLoader, 300));
    document.addEventListener('DOMContentLoaded', () => setTimeout(hideLoader, 1500)); // safety fallback
    setTimeout(hideLoader, 3000); // hard safety fallback

    // ===== LAZY LOADING FOR IMAGES =====
    const lazyLoadImages = () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        images.forEach(img => imageObserver.observe(img));
    };

    // ===== DEBOUNCE FUNCTION FOR SCROLL/RESIZE =====
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // ===== SMOOTH SCROLL TO TOP =====
    const createScrollToTop = () => {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 110px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 9997;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Hover effect
        scrollBtn.addEventListener('mouseenter', () => {
            scrollBtn.style.transform = 'translateY(-5px) scale(1.1)';
            scrollBtn.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
        });

        scrollBtn.addEventListener('mouseleave', () => {
            scrollBtn.style.transform = 'translateY(0) scale(1)';
            scrollBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        document.body.appendChild(scrollBtn);

        // Show/hide on scroll
        const toggleScrollBtn = debounce(() => {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        }, 100);

        window.addEventListener('scroll', toggleScrollBtn);
    };

    // ===== ANIMATE ON SCROLL =====
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.opportunity-card, .stat-card, .category-card, .widget');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(el);
        });
    };

    // ===== PRELOAD CRITICAL RESOURCES =====
    const preloadCriticalResources = () => {
        // Preload fonts
        const fonts = [
            'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
        ];

        fonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = font;
            document.head.appendChild(link);
        });
    };

    // ===== PERFORMANCE MONITORING =====
    const monitorPerformance = () => {
        if ('PerformanceObserver' in window) {
            // Monitor long tasks
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('⚠️ Long task detected:', entry.duration.toFixed(2) + 'ms');
                    }
                }
            });

            try {
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // longtask not supported
            }
        }

        // Log page load metrics
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('📊 Performance Metrics:');
                    console.log('  DOM Content Loaded:', (perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart).toFixed(2) + 'ms');
                    console.log('  Page Load Time:', (perfData.loadEventEnd - perfData.loadEventStart).toFixed(2) + 'ms');
                    console.log('  Total Time:', (perfData.loadEventEnd - perfData.fetchStart).toFixed(2) + 'ms');
                }
            }, 0);
        });
    };

    // ===== OPTIMIZE SEARCH INPUT =====
    const optimizeSearchInput = () => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    // Trigger search with debouncing
                    if (e.target.value.length >= 2) {
                        if (window.performSearch) {
                            window.performSearch();
                        }
                    }
                }, 300);
            });
        }
    };

    // ===== DETECT SLOW NETWORK =====
    const detectSlowNetwork = () => {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                    console.warn('⚠️ Slow network detected. Optimizing...');
                    document.body.classList.add('slow-network');
                    
                    // Disable some animations for slow networks
                    const style = document.createElement('style');
                    style.innerHTML = `
                        .slow-network * {
                            animation-duration: 0.1s !important;
                            transition-duration: 0.1s !important;
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        }
    };

    // ===== OFFLINE DETECTION =====
    const handleOffline = () => {
        const showOfflineMessage = () => {
            const offlineDiv = document.createElement('div');
            offlineDiv.className = 'offline-banner';
            offlineDiv.innerHTML = `
                <i class="fas fa-wifi-slash"></i>
                <span>You're offline. Some features may not work.</span>
            `;
            offlineDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f44336;
                color: white;
                padding: 12px 20px;
                text-align: center;
                z-index: 99998;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-weight: 500;
            `;
            document.body.prepend(offlineDiv);
        };

        const removeOfflineMessage = () => {
            const banner = document.querySelector('.offline-banner');
            if (banner) {
                banner.remove();
            }
        };

        window.addEventListener('offline', showOfflineMessage);
        window.addEventListener('online', () => {
            removeOfflineMessage();
            if (window.authSystem) {
                window.authSystem.showToast('✅ Back online!', 'success');
            }
        });
    };

    // ===== REQUEST IDLE CALLBACK POLYFILL =====
    window.requestIdleCallback = window.requestIdleCallback || function(cb) {
        const start = Date.now();
        return setTimeout(() => {
            cb({
                didTimeout: false,
                timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
            });
        }, 1);
    };

    // ===== INITIALIZE ALL OPTIMIZATIONS =====
    const init = () => {
        // Run immediately
        preloadCriticalResources();
        detectSlowNetwork();
        handleOffline();
        
        // Run when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                requestIdleCallback(() => {
                    lazyLoadImages();
                    createScrollToTop();
                    animateOnScroll();
                    optimizeSearchInput();
                    monitorPerformance();
                });
            });
        } else {
            requestIdleCallback(() => {
                lazyLoadImages();
                createScrollToTop();
                animateOnScroll();
                optimizeSearchInput();
                monitorPerformance();
            });
        }

        console.log('✅ Performance optimizations loaded');
    };

    // Start initialization
    init();

})();

// ===== EXPORT UTILITY FUNCTIONS =====
window.performanceUtils = {
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};
