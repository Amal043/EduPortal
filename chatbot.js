// ============================================
// ENHANCED AI CHATBOT SYSTEM
// Intelligent Assistant for Educational Opportunities
// ============================================

class AIChatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.userContext = {
            state: null,
            interests: [],
            education: null,
            queries: [],
            userName: null,
            conversationDepth: 0,
            lastTopic: null,
            mood: 'neutral'
        };
        
        // Advanced conversational features
        this.conversationalMemory = [];
        this.contextWindow = 5; // Remember last 5 exchanges
        this.personalityTraits = {
            friendly: true,
            helpful: true,
            encouraging: true,
            empathetic: true
        };
        
        // Knowledge base
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.intentPatterns = this.initializeIntentPatterns();
        this.quickReplies = this.initializeQuickReplies();
        this.conversationStarters = this.initializeConversationStarters();
        this.responseVariations = this.initializeResponseVariations();
        
        // Load from storage
        this.loadHistory();
        this.loadUserContext();
        
        console.log('🤖 Enhanced AI Chatbot initialized with conversational intelligence');
    }
    
    initializeKnowledgeBase() {
        return {
            scholarships: {
                keywords: ['scholarship', 'grant', 'financial aid', 'funding', 'stipend', 'bursary', 'fee waiver'],
                info: 'Scholarships are financial awards to help students pay for education. They can be merit-based, need-based, or category-specific.',
                examples: [
                    'National Scholarship Portal (NSP)',
                    'PM Scholarship Scheme',
                    'Merit-cum-Means Scholarship',
                    'Post Matric Scholarship'
                ]
            },
            hackathons: {
                keywords: ['hackathon', 'coding competition', 'hack', 'tech event', 'innovation challenge'],
                info: 'Hackathons are events where programmers and innovators collaborate intensively on software or hardware projects.',
                examples: [
                    'Smart India Hackathon',
                    'HackerEarth Challenges',
                    'Google Summer of Code',
                    'Microsoft Imagine Cup'
                ]
            },
            workshops: {
                keywords: ['workshop', 'training', 'seminar', 'course', 'bootcamp', 'skill development'],
                info: 'Workshops provide hands-on training and skill development in specific areas of expertise.',
                examples: [
                    'Government Skill Development Programs',
                    'Industry Training Workshops',
                    'Technical Bootcamps',
                    'Professional Development Seminars'
                ]
            },
            internships: {
                keywords: ['internship', 'work experience', 'industrial training', 'placement', 'apprenticeship'],
                info: 'Internships offer practical work experience and help students apply their knowledge in real-world settings.',
                examples: [
                    'Government Internship Scheme',
                    'Corporate Internship Programs',
                    'Research Internships',
                    'Startup Internships'
                ]
            }
        };
    }
    
    initializeIntentPatterns() {
        return {
            greeting: {
                patterns: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'namaste', 'hola', 'greetings', 'sup', 'yo'],
                response: () => this.generateGreeting()
            },
            help: {
                patterns: ['help', 'assist', 'support', 'how to', 'guide', 'what can you do', 'capabilities', 'features', 'options'],
                response: () => this.generateHelpMessage()
            },
            search: {
                patterns: ['find', 'search', 'looking for', 'show me', 'get', 'need', 'want', 'discover', 'explore', 'list'],
                response: (query) => this.generateSearchResponse(query)
            },
            eligibility: {
                patterns: ['eligible', 'qualify', 'can i apply', 'am i eligible', 'requirements', 'criteria', 'prerequisites', 'who can apply'],
                response: (query) => this.generateEligibilityResponse(query)
            },
            deadline: {
                patterns: ['deadline', 'last date', 'when', 'apply by', 'time left', 'closing date', 'submission date', 'due date'],
                response: () => this.generateDeadlineResponse()
            },
            howToApply: {
                patterns: ['how to apply', 'application process', 'apply', 'registration', 'how do i', 'steps to apply', 'application form'],
                response: () => this.generateApplicationGuide()
            },
            state: {
                patterns: ['state', 'my state', 'location', 'where', 'region', 'city', 'place', 'area'],
                response: () => this.generateStateResponse()
            },
            category: {
                patterns: ['category', 'type', 'kind', 'what type', 'which category', 'types of', 'categories'],
                response: () => this.generateCategoryResponse()
            },
            compare: {
                patterns: ['compare', 'comparison', 'difference', 'vs', 'versus', 'which is better', 'choose between'],
                response: () => this.generateComparisonGuide()
            },
            save: {
                patterns: ['save', 'bookmark', 'favorite', 'keep', 'store', 'remember'],
                response: () => this.generateSaveGuide()
            },
            thankyou: {
                patterns: ['thank', 'thanks', 'appreciate', 'helpful', 'great', 'awesome', 'amazing', 'perfect', 'excellent'],
                response: () => this.generateThankYouResponse()
            },
            goodbye: {
                patterns: ['bye', 'goodbye', 'see you', 'later', 'exit', 'close', 'leave'],
                response: () => this.generateGoodbyeResponse()
            }
        };
    }
    
    initializeQuickReplies() {
        return [
            { text: '🎓 Find Scholarships', query: 'Show me scholarships' },
            { text: '💻 Find Hackathons', query: 'Show me hackathons' },
            { text: '🛠️ Find Workshops', query: 'Show me workshops' },
            { text: '💼 Find Internships', query: 'Show me internships' },
            { text: '❓ How to Apply', query: 'How do I apply for opportunities?' },
            { text: '📍 Change State', query: 'How to change my state?' }
        ];
    }
    
    initializeConversationStarters() {
        return {
            followUps: [
                "Is there anything specific you'd like to know more about?",
                "Would you like me to explain anything in more detail?",
                "Can I help you with anything else?",
                "What other questions do you have?",
                "Feel free to ask me anything else!"
            ],
            clarifications: [
                "Could you tell me a bit more about what you're looking for?",
                "To help you better, could you provide more details?",
                "I want to make sure I understand - can you elaborate?",
                "Let me get this right - you're interested in..."
            ],
            acknowledgments: [
                "I understand.",
                "Got it!",
                "That makes sense.",
                "I see what you mean.",
                "Understood!"
            ]
        };
    }
    
    initializeResponseVariations() {
        return {
            agreement: ["Absolutely!", "Definitely!", "You're right!", "I agree!", "Exactly!"],
            thinking: ["Let me think about that...", "Hmm, interesting question...", "Good point...", "Let me help you with that..."],
            enthusiasm: ["Great question!", "I'm glad you asked!", "Excellent!", "That's a great topic!", "Love this question!"],
            empathy: ["I understand how you feel.", "That can be challenging.", "I'm here to help you through this.", "Don't worry, I've got you covered."]
        };
    }
    
    // Detect user intent from message
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // Update conversation context
        this.userContext.conversationDepth++;
        this.userContext.lastTopic = this.extractMainTopic(message);
        
        for (const [intent, data] of Object.entries(this.intentPatterns)) {
            for (const pattern of data.patterns) {
                if (lowerMessage.includes(pattern)) {
                    return { intent, confidence: 0.9 };
                }
            }
        }
        
        // Check knowledge base
        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            for (const keyword of data.keywords) {
                if (lowerMessage.includes(keyword)) {
                    return { intent: 'search', category, confidence: 0.8 };
                }
            }
        }
        
        return { intent: 'conversational', confidence: 0.5 };
    }
    
    // Extract main topic from message
    extractMainTopic(message) {
        const topics = {
            scholarship: /scholarship|funding|grant|financial/i,
            hackathon: /hackathon|competition|coding|tech/i,
            workshop: /workshop|training|course|seminar/i,
            internship: /internship|job|placement|work/i,
            eligibility: /eligible|qualify|criteria|requirement/i,
            deadline: /deadline|date|time|when/i,
            application: /apply|application|register|form/i
        };
        
        for (const [topic, pattern] of Object.entries(topics)) {
            if (pattern.test(message)) return topic;
        }
        return 'general';
    }
    
    // Generate contextual response
    async generateResponse(userMessage) {
        // Add conversational context
        this.conversationalMemory.push(userMessage);
        if (this.conversationalMemory.length > this.contextWindow) {
            this.conversationalMemory.shift();
        }
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            message: userMessage,
            timestamp: Date.now()
        });
        
        // Detect intent with context
        const { intent, category, confidence } = this.detectIntent(userMessage);
        
        let response = '';
        let responsePrefix = this.getConversationalPrefix(confidence);
        
        // Generate response based on intent
        if (intent in this.intentPatterns) {
            response = this.intentPatterns[intent].response(userMessage);
        } else if (intent === 'search' && category) {
            response = this.generateCategoryInfo(category);
        } else if (intent === 'conversational') {
            response = this.generateConversationalResponse(userMessage);
        } else {
            response = this.generateIntelligentFallback(userMessage);
        }
        
        // Add conversational elements
        if (responsePrefix && Math.random() > 0.5) {
            response = responsePrefix + ' ' + response;
        }
        
        // Add follow-up suggestion
        if (Math.random() > 0.7 && this.userContext.conversationDepth > 2) {
            const followUp = this.conversationStarters.followUps[
                Math.floor(Math.random() * this.conversationStarters.followUps.length)
            ];
            response += '\n\n' + followUp;
        }
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'bot',
            message: response,
            timestamp: Date.now(),
            intent: intent,
            confidence: confidence
        });
        
        this.saveHistory();
        this.saveUserContext();
        return response;
    }
    
    getConversationalPrefix(confidence) {
        if (confidence > 0.8) {
            return this.responseVariations.enthusiasm[
                Math.floor(Math.random() * this.responseVariations.enthusiasm.length)
            ];
        } else if (confidence < 0.5) {
            return this.responseVariations.thinking[
                Math.floor(Math.random() * this.responseVariations.thinking.length)
            ];
        }
        return '';
    }
    
    generateConversationalResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Handle personal questions
        if (lowerMessage.match(/how are you|what's up|how do you do/)) {
            return "I'm doing great, thanks for asking! 😊 I'm here and ready to help you find amazing educational opportunities. How about you? What brings you here today?";
        }
        
        if (lowerMessage.match(/who are you|what are you|tell me about yourself/)) {
            return "I'm your AI assistant, specially designed to help students like you discover scholarships, hackathons, workshops, and internships! 🎓✨ Think of me as your personal guide in the world of educational opportunities. I'm powered by advanced AI and I learn from every conversation to help you better. What can I help you explore today?";
        }
        
        if (lowerMessage.match(/what can you do|your capabilities|help me/)) {
            return "Great question! Here's what I can do for you:\n\n" +
                "🔍 **Smart Search**: Find opportunities matching your interests\n" +
                "📊 **Personalized Recommendations**: Suggest opportunities based on your profile\n" +
                "✅ **Eligibility Checking**: Help you understand if you qualify\n" +
                "📝 **Application Guidance**: Walk you through the application process\n" +
                "⏰ **Deadline Tracking**: Keep you updated on important dates\n" +
                "💬 **Conversational Help**: Just chat with me naturally!\n\n" +
                "I'm here to make your journey easier. What would you like to start with?";
        }
        
        if (lowerMessage.match(/thank|appreciate|helpful|great|awesome|amazing/)) {
            return "You're very welcome! 😊 It makes me happy to help you. Remember, I'm always here whenever you need assistance with finding opportunities or have questions. Feel free to come back anytime! Is there anything else you'd like to know?";
        }
        
        if (lowerMessage.match(/confused|don't understand|not clear|explain/)) {
            return this.responseVariations.empathy[
                Math.floor(Math.random() * this.responseVariations.empathy.length)
            ] + " Let me break it down for you in simpler terms. What specifically would you like me to clarify?";
        }
        
        // Check for previous context
        if (this.userContext.lastTopic && this.conversationalMemory.length > 1) {
            return this.generateContextualFollowUp();
        }
        
        return this.generateIntelligentFallback(message);
    }
    
    generateContextualFollowUp() {
        const topic = this.userContext.lastTopic;
        const responses = {
            scholarship: "Based on our conversation about scholarships, I can help you find specific ones that match your profile. Would you like me to search for scholarships in your state or field of study?",
            hackathon: "Since you're interested in hackathons, I can show you upcoming tech competitions and coding challenges. Are you looking for beginner-friendly or advanced level hackathons?",
            workshop: "I see you're looking into workshops. Would you like recommendations for skill development workshops in a specific area? Tech, soft skills, or something else?",
            internship: "For internships, I can help you find opportunities in your field. What's your area of study or interest?",
            general: "I'm here to help! What specific aspect of educational opportunities would you like to explore?"
        };
        
        return responses[topic] || responses.general;
    }
    
    generateIntelligentFallback(message) {
        const acknowledgment = this.conversationStarters.acknowledgments[
            Math.floor(Math.random() * this.conversationStarters.acknowledgments.length)
        ];
        
        // Try to extract keywords and provide helpful response
        const keywords = message.toLowerCase().split(' ').filter(word => word.length > 3);
        let suggestedResponse = '';
        
        if (keywords.some(word => ['help', 'need', 'want', 'find', 'get'].includes(word))) {
            suggestedResponse = "I'm here to help! While I'm not sure exactly what you're asking, ";
        } else {
            suggestedResponse = "That's an interesting point! Let me try to help you better. ";
        }
        
        return acknowledgment + " " + suggestedResponse +
            "I specialize in helping with:\n\n" +
            "🎓 Finding scholarships and grants\n" +
            "💻 Discovering hackathons and competitions\n" +
            "🛠️ Locating workshops and training programs\n" +
            "💼 Identifying internship opportunities\n\n" +
            "Could you rephrase your question or tell me which of these interests you?";
    }
    
    generateGreeting() {
        const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
        const hour = new Date().getHours();
        let timeGreeting = '';
        
        // Time-based greeting
        if (hour < 12) timeGreeting = 'Good morning';
        else if (hour < 17) timeGreeting = 'Good afternoon';
        else timeGreeting = 'Good evening';
        
        // Check if returning user
        const isReturning = this.conversationHistory.length > 0;
        
        if (currentLang === 'hi') {
            if (isReturning) {
                return "वापस आपका स्वागत है! 👋 मुझे खुशी है कि आप वापस आए। मैं आपकी और मदद कैसे कर सकता हूं?";
            }
            const greetings = [
                `नमस्ते! 👋 ${timeGreeting === 'Good morning' ? 'सुप्रभात' : timeGreeting === 'Good afternoon' ? 'शुभ दोपहर' : 'शुभ संध्या'}! मैं आपका AI सहायक हूं। मैं छात्रवृत्ति, हैकथॉन, कार्यशाला और इंटर्नशिप खोजने में मदद कर सकता हूं। आज आप क्या खोज रहे हैं?`,
                "हाय! 😊 मैं यहां शैक्षिक अवसरों की खोज में आपकी मदद करने के लिए हूं। मैं आपकी कैसे सहायता कर सकता हूं?",
                "नमस्कार! 🙏 मैं आपको छात्रवृत्ति और अन्य अवसरों के बारे में बता सकता हूं। आप क्या जानना चाहेंगे?"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)];
        }
        
        if (isReturning) {
            return `Welcome back! 👋 Great to see you again. I remember we were discussing educational opportunities. How can I continue helping you today?`;
        }
        
        const greetings = [
            `${timeGreeting}! 👋 I'm your AI assistant, and I'm excited to help you discover amazing educational opportunities. Whether you're looking for scholarships, hackathons, workshops, or internships - I've got you covered! What interests you today?`,
            `Hi there! 😊 ${timeGreeting}! I'm here to be your personal guide through the world of educational opportunities. I can help you find the perfect scholarships, exciting hackathons, valuable workshops, or career-launching internships. Where shall we start?`,
            `Hey! 🎓 ${timeGreeting}! I'm your friendly AI assistant, and I'm passionate about helping students like you find opportunities that match your goals. I can search, recommend, and guide you through the entire process. What would you like to explore?`,
            `Hello! ✨ ${timeGreeting}! I'm an AI assistant designed to make your search for educational opportunities super easy. Think of me as your personal opportunity-finder who's available 24/7. Just tell me what you're looking for!`
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    generateHelpMessage() {
        const acknowledgment = this.responseVariations.enthusiasm[
            Math.floor(Math.random() * this.responseVariations.enthusiasm.length)
        ];
        
        return `${acknowledgment} I'm designed to be your complete guide for educational opportunities. Here's everything I can help you with:\n\n` +
            `🔍 **Smart Search & Discovery**\n` +
            `• Find scholarships, hackathons, workshops & internships\n` +
            `• Search by keywords, state, or category\n` +
            `• Get AI-powered personalized recommendations\n\n` +
            `📊 **Intelligent Assistance**\n` +
            `• Check eligibility criteria for any opportunity\n` +
            `• Compare multiple opportunities side-by-side\n` +
            `• Track application deadlines\n` +
            `• Get step-by-step application guidance\n\n` +
            `💡 **Smart Features**\n` +
            `• State-specific opportunity filtering\n` +
            `• Voice search support (just click the mic icon)\n` +
            `• Multi-language support (English & Hindi)\n` +
            `• Save opportunities to your dashboard\n\n` +
            `🤖 **Conversational AI**\n` +
            `• Ask questions in natural language\n` +
            `• I remember our conversation context\n` +
            `• I learn from your preferences\n` +
            `• Available 24/7 to help you\n\n` +
            `**💬 Try asking me:**\n` +
            `• "Find engineering scholarships under ₹50,000"\n` +
            `• "What hackathons are happening this month?"\n` +
            `• "Am I eligible for post-matric scholarships?"\n` +
            `• "How do I apply for internships?"\n` +
            `• "Show me opportunities in Maharashtra"\n\n` +
            `I'm constantly learning and improving! Just chat with me naturally, and I'll do my best to help. What would you like to explore? 😊`;
    }
    
    generateSearchResponse(query) {
        const currentState = localStorage.getItem('selectedState') || 'All India';
        
        // Use AI system to extract entities and get recommendations
        if (window.aiSystem) {
            const entities = window.aiSystem.extractEntities(query);
            const recommendations = window.aiSystem.getChatbotRecommendations(query, 5);
            
            if (recommendations.length > 0) {
                let response = `🎯 **Perfect! I found ${recommendations.length} highly relevant opportunities for you:**\n\n`;
                
                recommendations.forEach((opp, index) => {
                    response += `**${index + 1}. ${opp.title || 'Opportunity'}**\n`;
                    response += `   📂 Category: ${opp.category.charAt(0).toUpperCase() + opp.category.slice(1)}\n`;
                    if (opp.deadline) response += `   ⏰ Deadline: ${opp.deadline}\n`;
                    if (opp.amount) response += `   � Amount: ${opp.amount}\n`;
                    response += `   🎯 Match Score: ${Math.round((opp.score || 0.75) * 100)}%\n`;
                    if (index < recommendations.length - 1) response += `\n`;
                });
                
                response += `\n\n✨ **Quick Tips:**\n`;
                response += `• Click on any opportunity card above to view full details\n`;
                response += `• Use the Compare button (⚖️) to compare opportunities\n`;
                response += `• Save opportunities to your Dashboard for tracking\n\n`;
                
                if (entities.state) {
                    response += `📍 Showing results for: **${entities.state}**\n`;
                } else if (currentState !== 'All India') {
                    response += `📍 Currently filtered by: **${currentState}**\n`;
                }
                
                response += `\n💡 Need more specific results? Try asking:\n`;
                response += `• "Show me scholarships for engineering students"\n`;
                response += `• "Find hackathons with prizes above ₹1 lakh"\n`;
                response += `• "What are the eligibility criteria?"\n\n`;
                response += `Want me to help you with anything else? 😊`;
                
                // Trigger actual search in UI
                setTimeout(() => {
                    const searchInput = document.querySelector('.search-input');
                    if (searchInput) {
                        searchInput.value = query;
                        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, 500);
                
                return response;
            }
        }
        
        // Fallback if AI system not available or no results
        return `🔍 **Let me help you search!**\n\n` +
            `📍 Current location: **${currentState}**\n\n` +
            `**Here's how to search effectively:**\n\n` +
            `🎓 **By Category:**\n` +
            `• Click on Scholarships, Hackathons, Workshops, or Internships cards\n\n` +
            `🔎 **By Keywords:**\n` +
            `• Use the search bar above to type specific terms\n` +
            `• Examples: "engineering", "medical", "technology", "₹50000"\n\n` +
            `📍 **By State:**\n` +
            `• Select your state from the dropdown in the navigation bar\n` +
            `• Opportunities will automatically filter for your location\n\n` +
            `🎤 **Voice Search:**\n` +
            `• Click the microphone icon in the search bar\n` +
            `• Speak your query naturally\n\n` +
            `💡 **Pro Tips:**\n` +
            `• Be specific: "B.Tech scholarships in Delhi under ₹25000"\n` +
            `• Use filters: category, deadline, amount, eligibility\n` +
            `• Save opportunities you like for later review\n\n` +
            `What specific type of opportunity are you looking for? I can guide you better! 😊`;
    }
    
    generateCategoryInfo(category) {
        const info = this.knowledgeBase[category];
        return `📚 **${category.charAt(0).toUpperCase() + category.slice(1)}**\n\n` +
            `${info.info}\n\n` +
            `**Popular Examples:**\n` +
            info.examples.map(ex => `• ${ex}`).join('\n') + '\n\n' +
            `Click on "${category.charAt(0).toUpperCase() + category.slice(1)}" card above to explore available opportunities!`;
    }
    
    generateEligibilityResponse(query) {
        return `✅ **Eligibility Checker - Let me guide you!**\n\n` +
            `Understanding eligibility is crucial for successful applications. Here's a comprehensive breakdown:\n\n` +
            `� **For Scholarships:**\n` +
            `✓ Academic Performance: Usually 50-75% minimum\n` +
            `✓ Family Income: Varies (₹1-8 lakhs annually for need-based)\n` +
            `✓ Category: General/SC/ST/OBC/Minority/PWD\n` +
            `✓ Age Limit: Typically 18-35 years\n` +
            `✓ State Domicile: Required for state-specific schemes\n` +
            `✓ Course Level: 10th/12th/UG/PG/PhD\n\n` +
            `� **For Hackathons:**\n` +
            `✓ Age: Usually 18-25 years\n` +
            `✓ Student Status: Current enrollment proof\n` +
            `✓ Technical Skills: Coding, problem-solving\n` +
            `✓ Team Formation: Solo or team (2-5 members)\n` +
            `✓ Prerequisites: Laptop, internet, development tools\n\n` +
            `�️ **For Workshops:**\n` +
            `✓ Educational Background: Relevant field\n` +
            `✓ Prerequisites: Basic knowledge in the domain\n` +
            `✓ Commitment: Full attendance required\n` +
            `✓ No age or income barriers typically\n\n` +
            `💼 **For Internships:**\n` +
            `✓ Current Student: 2nd year onwards usually\n` +
            `✓ Course Relevance: Field-specific requirements\n` +
            `✓ Skills: Technical/soft skills as per role\n` +
            `✓ Duration: Availability for 1-6 months\n` +
            `✓ Location: On-site/Remote/Hybrid options\n\n` +
            `🎯 **Smart Eligibility Tips:**\n` +
            `1. Always read the official notification carefully\n` +
            `2. Keep documents ready (ID, certificates, income proof)\n` +
            `3. Check relaxation criteria for reserved categories\n` +
            `4. Note the last date - don't miss deadlines!\n` +
            `5. Contact helpline if you have specific doubts\n\n` +
            `💡 **Want personalized eligibility check?**\n` +
            `Tell me:\n` +
            `• Your course/education level\n` +
            `• Your percentage/CGPA\n` +
            `• Your state\n` +
            `• Type of opportunity you're interested in\n\n` +
            `I'll search for opportunities you're eligible for! 😊`;
    }
    
    generateDeadlineResponse() {
        return `⏰ **Upcoming Deadlines**\n\n` +
            `To see deadlines:\n` +
            `1. Search for opportunities using the search bar\n` +
            `2. Check the deadline date on each opportunity card\n` +
            `3. Save opportunities to track deadlines on Dashboard\n\n` +
            `💡 **Tip:** Visit the Dashboard to see all upcoming deadlines for saved opportunities!`;
    }
    
    generateApplicationGuide() {
        return `📝 **How to Apply - Step by Step**\n\n` +
            `**Step 1:** Find the right opportunity\n` +
            `• Search by category or keywords\n` +
            `• Filter by your state\n\n` +
            `**Step 2:** Check eligibility\n` +
            `• Read requirements carefully\n` +
            `• Ensure you meet all criteria\n\n` +
            `**Step 3:** Prepare documents\n` +
            `• ID proof, academic certificates\n` +
            `• Income certificate (for scholarships)\n` +
            `• Resume/Portfolio (for internships)\n\n` +
            `**Step 4:** Apply\n` +
            `• Click "Apply" button on opportunity card\n` +
            `• Visit official website\n` +
            `• Fill application form\n` +
            `• Submit before deadline\n\n` +
            `💡 Save opportunities to Dashboard to track your applications!`;
    }
    
    generateStateResponse() {
        const currentState = localStorage.getItem('selectedState');
        if (currentState) {
            return `📍 Your current state is set to: **${currentState}**\n\n` +
                `To change your state:\n` +
                `1. Look for the state selector in the navigation bar\n` +
                `2. Click the dropdown menu\n` +
                `3. Select your state\n\n` +
                `The search results will automatically update to show opportunities in your state!`;
        } else {
            return `📍 No state selected yet!\n\n` +
                `Please select your state from the dropdown in the navigation bar to see relevant opportunities.`;
        }
    }
    
    generateCategoryResponse() {
        return `📂 **Available Categories:**\n\n` +
            `🎓 **Scholarships** - Financial aid for education\n` +
            `💻 **Hackathons** - Coding competitions and tech challenges\n` +
            `🛠️ **Workshops** - Skill development and training\n` +
            `💼 **Internships** - Work experience and placements\n\n` +
            `Click on any category card above to explore opportunities in that category!`;
    }
    
    generateFallbackResponse(query) {
        const suggestions = [
            "I'm not sure I understood that. Could you rephrase?",
            "Hmm, I didn't quite get that. Try asking about scholarships, hackathons, workshops, or internships!",
            "I'm learning every day! Could you ask in a different way?"
        ];
        
        return suggestions[Math.floor(Math.random() * suggestions.length)] + '\n\n' +
            `💡 **Quick suggestions:**\n` +
            `• "Find scholarships"\n` +
            `• "Show me hackathons"\n` +
            `• "How to apply?"\n` +
            `• "Check eligibility"`;
    }
    
    generateComparisonGuide() {
        return `⚖️ **Opportunity Comparison Tool**\n\n` +
            `Great feature to help you make informed decisions! Here's how to compare opportunities:\n\n` +
            `**📊 How to Compare:**\n` +
            `1. Browse through opportunities using search\n` +
            `2. Click the "Compare" button (⚖️) on any opportunity card\n` +
            `3. Select 2-4 opportunities to compare\n` +
            `4. View side-by-side comparison of:\n` +
            `   • Eligibility criteria\n` +
            `   • Benefits & amounts\n` +
            `   • Deadlines\n` +
            `   • Application process\n` +
            `   • Success rates\n\n` +
            `**💡 Comparison Tips:**\n` +
            `• Compare opportunities of the same category\n` +
            `• Check eligibility requirements first\n` +
            `• Look at deadline dates\n` +
            `• Consider application effort vs. benefits\n` +
            `• Save best matches to your Dashboard\n\n` +
            `Want me to help you find opportunities to compare? Just tell me what you're looking for! 😊`;
    }
    
    generateSaveGuide() {
        return `💾 **Save & Track Opportunities**\n\n` +
            `Smart move! Saving opportunities helps you track and manage applications. Here's how:\n\n` +
            `**📌 How to Save:**\n` +
            `1. Find interesting opportunities through search\n` +
            `2. Click the "Save" button (💾) on opportunity cards\n` +
            `3. Access saved items from the Dashboard\n\n` +
            `**📊 Dashboard Features:**\n` +
            `• View all saved opportunities in one place\n` +
            `• Track application status\n` +
            `• Get deadline reminders\n` +
            `• See personalized recommendations\n` +
            `• Manage your saved items\n\n` +
            `**✨ Pro Tips:**\n` +
            `• Save opportunities early - don't miss deadlines!\n` +
            `• Add notes about why you saved each one\n` +
            `• Set reminders for upcoming deadlines\n` +
            `• Review saved items weekly\n` +
            `• Remove opportunities you're no longer interested in\n\n` +
            `Navigate to the Dashboard from the top menu to see your saved opportunities! 🎯`;
    }
    
    generateThankYouResponse() {
        const responses = [
            "You're very welcome! 😊 It makes me happy to help you. Remember, I'm always here whenever you need assistance with finding opportunities or have questions. Feel free to come back anytime! Is there anything else you'd like to know?",
            "My pleasure! 🎉 I'm glad I could help you today. Don't hesitate to reach out if you have more questions. I'm here 24/7 to assist you in your journey to find the perfect opportunities!",
            "You're so welcome! ✨ Helping you is what I'm here for! If you need anything else - whether it's finding more opportunities or guidance on applications - just ask. Good luck with your applications!",
            "Happy to help! 😊 Your success is my goal. Remember, finding the right opportunity is just the beginning - I'm here to support you throughout the entire process. Come back anytime!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    generateGoodbyeResponse() {
        const responses = [
            "Goodbye! 👋 It was great chatting with you. Come back anytime you need help finding opportunities or have questions. Good luck with your applications, and I hope you find amazing opportunities! 🌟",
            "See you soon! 😊 Remember, I'm always here whenever you need guidance. Best wishes for your educational journey, and don't forget to check those deadlines! Take care! 🎓",
            "Take care! 👋 Thanks for chatting with me today. I'll be here whenever you're ready to explore more opportunities. Wishing you all the best in your applications! Come back soon! ✨",
            "Bye for now! 🎉 Feel free to return anytime - I never sleep! I'm excited to help you discover more opportunities in the future. Good luck, and may you achieve all your goals! 🌟"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Save conversation history
    saveHistory() {
        try {
            // Keep only last 50 messages
            if (this.conversationHistory.length > 50) {
                this.conversationHistory = this.conversationHistory.slice(-50);
            }
            localStorage.setItem('chatbot_history', JSON.stringify(this.conversationHistory));
        } catch (e) {
            console.error('Error saving chat history:', e);
        }
    }
    
    // Load conversation history
    loadHistory() {
        try {
            const saved = localStorage.getItem('chatbot_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading chat history:', e);
            this.conversationHistory = [];
        }
    }
    
    // Save user context
    saveUserContext() {
        try {
            localStorage.setItem('chatbot_context', JSON.stringify(this.userContext));
        } catch (e) {
            console.error('Error saving user context:', e);
        }
    }
    
    // Load user context
    loadUserContext() {
        try {
            const saved = localStorage.getItem('chatbot_context');
            if (saved) {
                const loadedContext = JSON.parse(saved);
                this.userContext = { ...this.userContext, ...loadedContext };
            }
        } catch (e) {
            console.error('Error loading user context:', e);
        }
    }
    
    // Clear conversation
    clearHistory() {
        this.conversationHistory = [];
        this.conversationalMemory = [];
        this.userContext.conversationDepth = 0;
        this.userContext.lastTopic = null;
        localStorage.removeItem('chatbot_history');
        localStorage.removeItem('chatbot_context');
    }
    
    // Get conversation history
    getHistory() {
        return this.conversationHistory;
    }
    
    // Get quick replies
    getQuickReplies() {
        return this.quickReplies;
    }
}

// Initialize chatbot
const aiChatbot = new AIChatbot();
window.aiChatbot = aiChatbot;

// Chatbot UI Controller
class ChatbotUI {
    constructor(chatbot) {
        this.chatbot = chatbot;
        this.isOpen = false;
        this.isTyping = false;
        this.init();
    }
    
    init() {
        this.createChatbotUI();
        this.attachEventListeners();
        console.log('🎨 Chatbot UI initialized');
    }
    
    createChatbotUI() {
        // Remove any existing chatbot elements first
        const existingToggle = document.getElementById('chatbot-toggle');
        const existingWindow = document.getElementById('chatbot-window');
        if (existingToggle) existingToggle.remove();
        if (existingWindow) existingWindow.remove();
        
        const chatbotHTML = `
            <!-- Chatbot Toggle Button -->
            <button id="chatbot-toggle" class="chatbot-toggle" title="AI Assistant">
                <i class="fas fa-robot"></i>
            </button>
            
            <!-- Chatbot Window -->
            <div id="chatbot-window" class="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-header-left">
                        <i class="fas fa-robot"></i>
                        <div>
                            <h3>AI Assistant</h3>
                            <span class="chatbot-status">Online</span>
                        </div>
                    </div>
                    <div class="chatbot-header-actions">
                        <button id="chatbot-clear" class="chatbot-action-btn" title="Clear chat">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button id="chatbot-close" class="chatbot-action-btn" title="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="chatbot-messages" id="chatbot-messages">
                    <!-- Messages will appear here -->
                </div>
                
                <div class="chatbot-quick-replies" id="chatbot-quick-replies">
                    <!-- Quick reply buttons -->
                </div>
                
                <div class="chatbot-input-container">
                    <input type="text" id="chatbot-input" class="chatbot-input" placeholder="Ask me anything...">
                    <button id="chatbot-send" class="chatbot-send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        
        // Load previous conversation
        this.loadConversation();
        
        // Show quick replies
        this.showQuickReplies();
    }
    
    attachEventListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle');
        const closeBtn = document.getElementById('chatbot-close');
        const clearBtn = document.getElementById('chatbot-clear');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        
        toggleBtn.addEventListener('click', () => this.toggleChatbot());
        closeBtn.addEventListener('click', () => this.closeChatbot());
        clearBtn.addEventListener('click', () => this.clearChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }
    
    toggleChatbot() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (this.isOpen) {
            window.classList.add('active');
            toggle.classList.add('active');
            
            // Send greeting if first time
            if (this.chatbot.getHistory().length === 0) {
                setTimeout(() => {
                    this.addMessage(this.chatbot.generateGreeting(), 'bot');
                }, 500);
            }
        } else {
            window.classList.remove('active');
            toggle.classList.remove('active');
        }
    }
    
    closeChatbot() {
        this.isOpen = false;
        document.getElementById('chatbot-window').classList.remove('active');
        document.getElementById('chatbot-toggle').classList.remove('active');
    }
    
    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Clear input
        input.value = '';
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTyping();
        
        // Get bot response (simulate delay for natural feel)
        setTimeout(async () => {
            const response = await this.chatbot.generateResponse(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
            this.showQuickReplies();
        }, 800);
    }
    
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;
        
        // Format text (support markdown-like formatting)
        const formattedText = this.formatMessage(text);
        messageDiv.innerHTML = formattedText;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    formatMessage(text) {
        // Convert markdown-like syntax to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
            .replace(/\n/g, '<br>'); // new lines
    }
    
    showTyping() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTyping() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    showQuickReplies() {
        const container = document.getElementById('chatbot-quick-replies');
        const replies = this.chatbot.getQuickReplies();
        
        container.innerHTML = replies.map(reply => 
            `<button class="quick-reply-btn" data-query="${reply.query}">${reply.text}</button>`
        ).join('');
        
        // Add click handlers
        container.querySelectorAll('.quick-reply-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                document.getElementById('chatbot-input').value = query;
                this.sendMessage();
            });
        });
    }
    
    loadConversation() {
        const history = this.chatbot.getHistory();
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.innerHTML = '';
        
        history.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'bot') {
                this.addMessage(msg.message, msg.role);
            }
        });
    }
    
    clearChat() {
        if (confirm('Clear chat history?')) {
            this.chatbot.clearHistory();
            document.getElementById('chatbot-messages').innerHTML = '';
            setTimeout(() => {
                this.addMessage(this.chatbot.generateGreeting(), 'bot');
            }, 300);
        }
    }
}

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatbotUI = new ChatbotUI(aiChatbot);
    });
} else {
    window.chatbotUI = new ChatbotUI(aiChatbot);
}

console.log('✅ AI Chatbot System Loaded');
