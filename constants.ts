import type { Language, LanguageCode } from './types';

export const KERALA_DISTRICTS: string[] = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
];

export const COMMON_CROPS: string[] = [
  "Paddy (Rice)",
  "Coconut",
  "Rubber",
  "Pepper",
  "Cardamom",
  "Ginger",
  "Turmeric",
  "Areca nut",
  "Cashew",
  "Tea",
  "Coffee",
  "Banana",
  "Tapioca",
];

export const LANGUAGES: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'ml', name: 'മലയാളം' }, // Malayalam
    { code: 'mr', name: 'मराठी' }, // Marathi
    { code: 'hi', name: 'हिन्दी' }, // Hindi
];

type TranslationDict = {
    [key in LanguageCode]: string;
};

interface Translations {
    headerTitle: TranslationDict;
    headerSubtitle: TranslationDict;
    locationLabel: TranslationDict;
    cropLabel: TranslationDict;
    initialMessage: TranslationDict;
    sendMessagePlaceholder: TranslationDict;
    footerText: TranslationDict;
    errorMessage: TranslationDict;
    thinking: TranslationDict;
    startRecording: TranslationDict;
    stopRecording: TranslationDict;
    readAloud: TranslationDict;
    stopReading: TranslationDict;
    copy: TranslationDict;
    copied: TranslationDict;
    newChat: TranslationDict;
    newChatConfirmation: TranslationDict;
    feedbackSent: TranslationDict;
    goodResponse: TranslationDict;
    badResponse: TranslationDict;
    removeImage: TranslationDict;
    welcomeTitle: TranslationDict;
    promptStarters: { title: TranslationDict; prompts: TranslationDict[] };
    dashboard: TranslationDict;
    chat: TranslationDict;
    searchChats: TranslationDict;
    weatherForecast: TranslationDict;
    marketPrices: TranslationDict;
    latestNews: TranslationDict;
    cropTableHeader: TranslationDict;
    priceTableHeader: TranslationDict;
    // Auth Translations
    loginWelcome: TranslationDict;
    loginPrompt: TranslationDict;
    nameLabel: TranslationDict;
    namePlaceholder: TranslationDict;
    loginButton: TranslationDict;
    logoutButton: TranslationDict;
    welcomeBack: TranslationDict;
    speakYourName: TranslationDict;
    // Live Session Translations
    liveSessionTitle: TranslationDict;
    liveSession: TranslationDict;
    statusIdle: TranslationDict;
    statusConnecting: TranslationDict;
    statusListening: TranslationDict;
    statusSpeaking: TranslationDict;
    statusError: TranslationDict;
    statusPermission: TranslationDict;
    startSession: TranslationDict;
    stopSession: TranslationDict;
    youSaid: TranslationDict;
    kissanMitraSaid: TranslationDict;
    close: TranslationDict;
}

export const TRANSLATIONS: Translations = {
    headerTitle: {
        en: "Kissan Mitra",
        ml: "കിസാൻ മിത്ര",
        mr: "किसान मित्र",
        hi: "किसान मित्र",
    },
    headerSubtitle: {
        en: "AI-Powered Farmer Assistant",
        ml: "AI പിന്തുണയുള്ള കർഷക സഹായി",
        mr: "AI-समर्थित शेतकरी सहाय्यक",
        hi: "एआई-संचालित किसान सहायक",
    },
    locationLabel: {
        en: "Select Your District",
        ml: "നിങ്ങളുടെ ജില്ല തിരഞ്ഞെടുക്കുക",
        mr: "तुमचा जिल्हा निवडा",
        hi: "अपना जिला चुनें",
    },
    cropLabel: {
        en: "Select Your Crop",
        ml: "നിങ്ങളുടെ വിള തിരഞ്ഞെടുക്കുക",
        mr: "तुमचे पीक निवडा",
        hi: "अपनी फसल चुनें",
    },
    initialMessage: {
        en: "Hello! How can I help you with your farming today? You can ask a question, upload a photo, or try one of the examples below.",
        ml: "നമസ്കാരം! ഇന്ന് നിങ്ങളുടെ കൃഷിയിൽ ഞാൻ എങ്ങനെ സഹായിക്കും? നിങ്ങൾക്ക് ഒരു ചോദ്യം ചോദിക്കാം, ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാം, അല്ലെങ്കിൽ താഴെയുള്ള ഉദാഹരണങ്ങളിലൊന്ന് പരീക്ഷിക്കാം.",
        mr: "नमस्कार! आज मी तुमच्या शेतीत कशी मदत करू शकेन? तुम्ही प्रश्न विचारू शकता, फोटो अपलोड करू शकता किंवा खालीलपैकी एक उदाहरण वापरून पाहू शकता.",
        hi: "नमस्ते! आज मैं आपकी खेती में कैसे मदद कर सकता हूँ? आप कोई सवाल पूछ सकते हैं, फ़ोटो अपलोड कर सकते हैं, या नीचे दिए गए उदाहरणों में से कोई एक आज़मा सकते हैं।",
    },
    sendMessagePlaceholder: {
        en: "Ask a question or describe the image...",
        ml: "ഒരു ചോദ്യം ചോദിക്കുക അല്ലെങ്കിൽ ചിത്രം വിവരിക്കുക...",
        mr: "प्रश्न विचारा किंवा प्रतिमेचे वर्णन करा...",
        hi: "कोई प्रश्न पूछें या छवि का वर्णन करें...",
    },
    footerText: {
        en: "Made by Team 404 - SIH Blueprint. AI can make mistakes. Consult a local expert for critical decisions.",
        ml: "ടീം 404 നിർമ്മിച്ചത് - SIH ബ്ലൂപ്രിന്റ്. AI-ക്ക് തെറ്റുകൾ പറ്റാം. നിർണായക തീരുമാനങ്ങൾക്കായി ഒരു പ്രാദേശിക വിദഗ്ദ്ധനെ സമീപിക്കുക.",
        mr: "टीम 404 द्वारा निर्मित - SIH ब्लू प्रिंट. AI चुका करू शकते. महत्त्वाच्या निर्णयांसाठी स्थानिक तज्ञांचा सल्ला घ्या.",
        hi: "टीम 404 द्वारा निर्मित - एसआईएच ब्लूप्रिंट। एआई गलतियाँ कर सकता है। महत्वपूर्ण निर्णयों के लिए किसी स्थानीय विशेषज्ञ से परामर्श लें।",
    },
    errorMessage: {
        en: "Sorry, I encountered an error. Please try again.",
        ml: "ക്ഷമിക്കണം, ഒരു പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
        mr: "क्षमस्व, मला एक त्रूटी आली. कृपया पुन्हा प्रयत्न करा.",
        hi: "क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुन: प्रयास करें।",
    },
    thinking: {
        en: "Thinking...",
        ml: "ചിന്തിക്കുന്നു...",
        mr: "विचार करत आहे...",
        hi: "सोच रहा हूँ...",
    },
    startRecording: {
        en: "Start Recording",
        ml: "റെക്കോർഡിംഗ് ആരംഭിക്കുക",
        mr: "रेकॉर्डिंग सुरू करा",
        hi: "रिकॉर्डिंग शुरू करें",
    },
    stopRecording: {
        en: "Stop Recording",
        ml: "റെക്കോർഡിംഗ് നിർത്തുക",
        mr: "रेकॉर्डिंग थांबवा",
        hi: "रिकॉर्डिंग बंद करें",
    },
    readAloud: {
        en: "Read aloud",
        ml: "ഉറക്കെ വായിക്കുക",
        mr: "मोठ्याने वाचा",
        hi: "जोर से पढ़ें",
    },
    stopReading: {
        en: "Stop reading",
        ml: "വായന നിർത്തുക",
        mr: "वाचणे थांबवा",
        hi: "पढ़ना बंद करो",
    },
    copy: { en: "Copy", ml: "പകർത്തുക", mr: "कॉपी", hi: "कॉपी" },
    copied: { en: "Copied!", ml: "പകർത്തി!", mr: "कॉपी केले!", hi: "कॉपी किया गया!" },
    newChat: { en: "New Chat", ml: "പുതിയ ചാറ്റ്", mr: "नवीन चॅट", hi: "नई चैट" },
    newChatConfirmation: {
        en: "Are you sure you want to start a new chat? The current conversation will be cleared.",
        ml: "നിങ്ങൾക്ക് പുതിയൊരു ചാറ്റ് തുടങ്ങണോ? നിലവിലെ സംഭാഷണം മായ്‌ക്കപ്പെടും.",
        mr: "तुम्हाला खात्री आहे की तुम्हाला नवीन चॅट सुरू करायची आहे? सध्याचे संभाषण साफ केले जाईल.",
        hi: "क्या आप वाकई एक नई चैट शुरू करना चाहते हैं? वर्तमान बातचीत साफ़ हो जाएगी।",
    },
    feedbackSent: { en: "Feedback sent!", ml: "അഭിപ്രായം അയച്ചു!", mr: "अभिप्राय पाठवला!", hi: "प्रतिक्रिया भेजी गई!" },
    goodResponse: { en: "Good response", ml: "നല്ല പ്രതികരണം", mr: "चांगली प्रतिक्रिया", hi: "अच्छी प्रतिक्रिया" },
    badResponse: { en: "Bad response", ml: "മോശം പ്രതികരണം", mr: "वाईट प्रतिक्रिया", hi: "खराब प्रतिक्रिया" },
    removeImage: { en: "Remove image", ml: "ചിത്രം നീക്കം ചെയ്യുക", mr: "प्रतिमा काढा", hi: "छवि हटाएँ" },
    welcomeTitle: {
        en: "How can I help you today?",
        ml: "ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?",
        mr: "आज मी तुमची कशी मदत करू शकतो?",
        hi: "आज मैं आपकी कैसे मदद कर सकता हूँ?",
    },
    promptStarters: {
        title: {
            en: "Or try one of these:",
            ml: "അല്ലെങ്കിൽ ഇവയിലൊന്ന് പരീക്ഷിക്കുക:",
            mr: "किंवा यापैकी एक प्रयत्न करा:",
            hi: "या इनमें से कोई एक आज़माएँ:",
        },
        prompts: [
            {
                en: "How do I treat leaf spot on my banana plant?",
                ml: "എന്റെ വാഴയിലെ ഇലപ്പുള്ളി രോഗം എങ്ങനെ ചികിത്സിക്കാം?",
                mr: "माझ्या केळीच्या झाडावरील पानांच्या ठिपक्यांवर उपचार कसे करावे?",
                hi: "मैं अपने केले के पौधे पर पत्ती के धब्बे का इलाज कैसे करूँ?",
            },
            {
                en: "What is a good fertilizer for coconuts in sandy soil?",
                ml: "മണൽ മണ്ണിൽ തെങ്ങിന് നല്ല വളം ഏതാണ്?",
                mr: "वालुकामय मातीत नारळासाठी कोणते खत चांगले आहे?",
                hi: "रेतीली मिट्टी में नारियल के लिए कौन सा उर्वरक अच्छा है?",
            },
            {
                en: "Identify this pest on my paddy crop.",
                ml: "എന്റെ നെൽക്കൃഷിയിലെ ഈ കീടത്തെ തിരിച്ചറിയുക.",
                mr: "माझ्या भात पिकावरील ही कीड ओळखा.",
                hi: "मेरी धान की फसल पर इस कीट को पहचानें।",
            }
        ]
    },
    dashboard: { en: "Dashboard", ml: "ഡാഷ്ബോർഡ്", mr: "डॅशबोर्ड", hi: "डैशबोर्ड" },
    chat: { en: "Chat", ml: "ചാറ്റ്", mr: "चॅट", hi: "चैट" },
    searchChats: { en: "Search chats...", ml: "ചാറ്റുകൾ തിരയുക...", mr: "चॅट्स शोधा...", hi: "चैट खोजें..." },
    weatherForecast: { en: "Weather Forecast", ml: "കാലാവസ്ഥാ പ്രവചനം", mr: "हवामान अंदाज", hi: "मौसम पूर्वानुमान" },
    marketPrices: { en: "Market Prices", ml: "വിപണി വില", mr: "बाजारभाव", hi: "बाजार मूल्य" },
    latestNews: { en: "Latest News & Schemes", ml: "പുതിയ വാർത്തകളും പദ്ധതികളും", mr: "ताज्या बातम्या आणि योजना", hi: "नवीनतम समाचार और योजनाएं" },
    cropTableHeader: { en: "Crop", ml: "വിള", mr: "पीक", hi: "फसल" },
    priceTableHeader: { en: "Price (per Quintal)", ml: "വില (ക്വിന്റലിന്)", mr: "किंमत (प्रति क्विंटल)", hi: "मूल्य (प्रति क्विंटल)" },
    loginWelcome: { en: "Welcome to Kissan Mitra", ml: "കിസാൻ മിത്രയിലേക്ക് സ്വാഗതം", mr: "किसान मित्र मध्ये आपले स्वागत आहे", hi: "किसान मित्र में आपका स्वागत है" },
    loginPrompt: { en: "Your personal AI farming assistant.", ml: "നിങ്ങളുടെ സ്വകാര്യ AI കാർഷിക സഹായി.", mr: "तुमचा वैयक्तिक AI शेती सहाय्यक.", hi: "आपका व्यक्तिगत एआई खेती सहायक।" },
    nameLabel: { en: "Enter your name", ml: "നിങ്ങളുടെ പേര് നൽകുക", mr: "तुमचे नाव टाका", hi: "अपना नाम दर्ज करें" },
    namePlaceholder: { en: "e.g., Suresh Kumar", ml: "ഉദാ: സുരേഷ് കുമാർ", mr: "उदा. सुरेश कुमार", hi: "जैसे, सुरेश कुमार" },
    loginButton: { en: "Login", ml: "ലോഗിൻ ചെയ്യുക", mr: "लॉग इन करा", hi: "लॉग इन करें" },
    logoutButton: { en: "Logout", ml: "ലോഗൗട്ട്", mr: "लॉग आउट", hi: "लॉग आउट" },
    welcomeBack: { en: "Welcome", ml: "സ്വാഗതം", mr: "स्वागत आहे", hi: "स्वागत है" },
    speakYourName: { en: "Speak your name", ml: "നിങ്ങളുടെ പേര് പറയുക", mr: "तुमचे नाव सांगा", hi: "अपना नाम बोलें" },
    liveSession: { en: "Live Session", ml: "തത്സമയ സെഷൻ", mr: "थेट सत्र", hi: "लाइव सत्र" },
    liveSessionTitle: { en: "Live Farm Analysis", ml: "തത്സമയ കാർഷിക വിശകലനം", mr: "थेट शेती विश्लेषण", hi: "लाइव कृषि विश्लेषण" },
    statusIdle: { en: "Ready to start session", ml: "സെഷൻ ആരംഭിക്കാൻ തയ്യാറാണ്", mr: "सत्र सुरू करण्यास तयार", hi: "सत्र शुरू करने के लिए तैयार" },
    statusConnecting: { en: "Connecting...", ml: "ബന്ധിപ്പിക്കുന്നു...", mr: "कनेक्ट करत आहे...", hi: "कनेक्ट हो रहा है..." },
    statusListening: { en: "Listening...", ml: "ശ്രദ്ധിക്കുന്നു...", mr: "ऐकत आहे...", hi: "सुन रहा है..." },
    statusSpeaking: { en: "AI is speaking...", ml: "AI സംസാരിക്കുന്നു...", mr: "AI बोलत आहे...", hi: "एआई बोल रहा है..." },
    statusError: { en: "An error occurred. Please restart.", ml: "ഒരു പിശക് സംഭവിച്ചു. ദയവായി പുനരാരംഭിക്കുക.", mr: "एक त्रुटी आली. कृपया पुन्हा सुरू करा.", hi: "एक त्रुटि हुई। कृपया पुनरारंभ करें।" },
    statusPermission: { en: "Please enable camera & microphone.", ml: "ക്യാമറയും മൈക്രോഫോണും പ്രവർത്തനക്ഷമമാക്കുക.", mr: "कृपया कॅमेरा आणि मायक्रोफोन सक्षम करा.", hi: "कृपया कैमरा और माइक्रोफ़ोन सक्षम करें।" },
    startSession: { en: "Start Session", ml: "സെഷൻ ആരംഭിക്കുക", mr: "सत्र सुरू करा", hi: "सत्र शुरू करें" },
    stopSession: { en: "Stop Session", ml: "സെഷൻ നിർത്തുക", mr: "सत्र थांबवा", hi: "सत्र रोकें" },
    youSaid: { en: "You said:", ml: "നിങ്ങൾ പറഞ്ഞത്:", mr: "तुम्ही म्हणाला:", hi: "आपने कहा:" },
    kissanMitraSaid: { en: "Kissan Mitra said:", ml: "കിസാൻ മിത്ര പറഞ്ഞത്:", mr: "किसान मित्र म्हणाला:", hi: "किसान मित्र ने कहा:" },
    close: { en: "Close", ml: "അടയ്ക്കുക", mr: "बंद करा", hi: "बंद करें" },
};

export const getSystemInstruction = (language: LanguageCode): string => {
    const langName = LANGUAGES.find(l => l.code === language)?.name || 'English';
    return `You are "Kissan Mitra," an expert AI assistant for farmers in Kerala, India. 
Your goal is to provide accurate, concise, and actionable advice.
- You MUST respond in ${langName} unless the user asks in a different language.
- Format your response using Markdown for readability (e.g., use lists, bold text).
- Your expertise covers crop management, pest/disease diagnosis, soil health, and weather-related advice.
- When analyzing an image, identify the crop, detect any visible issues (pests, diseases, nutrient deficiencies), and suggest organic and chemical solutions.
- Provide step-by-step instructions when possible.
- Be empathetic and encouraging to the farmer.
- Base your advice on the provided context: location (district in Kerala) and crop type.
- Keep responses brief and easy to understand for a non-technical audience.`;
};
