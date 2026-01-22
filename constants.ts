import type { Language, LanguageCode } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'ml', name: 'മലയാളം' },
];

export const LANGUAGE_LOCALES: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  ml: 'ml-IN',
};

export const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Alappuzha'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Meerut'],
};

export const COMMON_CROPS: string[] = [
  'Rice',
  'Wheat',
  'Cotton',
  'Sugarcane',
  'Tomato',
  'Potato',
  'Onion',
  'Mango',
  'Banana',
  'Coconut',
  'Maize',
  'Soybean',
];

type Translations = {
  [key: string]: Record<LanguageCode, string>;
};

export const TRANSLATIONS: Translations = {
  headerTitle: {
    en: 'Agri-Intel',
    hi: 'कृषि-इंटेल',
    mr: 'कृषी-इंटेल',
    ml: 'അഗ്രി-ഇന്റൽ',
  },
  headerSubtitle: {
    en: 'Your Smart Farming Assistant',
    hi: 'आपका स्मार्ट खेती सहायक',
    mr: 'तुमचा स्मार्ट शेती सहाय्यक',
    ml: 'നിങ്ങളുടെ സ്മാർട്ട് ഫാമിംഗ് അസിസ്റ്റന്റ്',
  },
  stateLabel: {
    en: 'State',
    hi: 'राज्य',
    mr: 'राज्य',
    ml: 'സംസ്ഥാനം',
  },
  locationLabel: {
    en: 'District',
    hi: 'जिला',
    mr: 'जिल्हा',
    ml: 'ജില്ല',
  },
  cropLabel: {
    en: 'Crop',
    hi: 'फ़सल',
    mr: 'पीक',
    ml: 'വിള',
  },
  initialMessage: {
    en: 'Hello! How can I help you with your farm today? You can ask me a question, or upload a photo of your crop.',
    hi: 'नमस्ते! आज मैं आपके खेत में कैसे मदद कर सकता हूँ? आप मुझसे कोई प्रश्न पूछ सकते हैं, या अपनी फसल की तस्वीर अपलोड कर सकते हैं।',
    mr: 'नमस्कार! आज मी तुमच्या शेतात कशी मदत करू शकतो? तुम्ही मला प्रश्न विचारू शकता, किंवा तुमच्या पिकाचा फोटो अपलोड करू शकता।',
    ml: 'നമസ്കാരം! ഇന്ന് നിങ്ങളുടെ കൃഷിയിടത്തിൽ ഞാൻ എങ്ങനെ സഹായിക്കും? നിങ്ങൾക്ക് എന്നോട് ഒരു ചോദ്യം ചോദിക്കാം, അല്ലെങ്കിൽ നിങ്ങളുടെ വിളയുടെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാം.',
  },
  errorMessage: {
    en: 'Sorry, something went wrong. Please try again.',
    hi: 'क्षमा करें, कुछ गलत हो गया। कृपया पुन: प्रयास करें।',
    mr: 'क्षमस्व, काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.',
    ml: 'ക്ഷമിക്കണം, എന്തോ പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
  },
  sendMessagePlaceholder: {
    en: 'Ask about your crop or describe a problem...',
    hi: 'अपनी फसल के बारे में पूछें या किसी समस्या का वर्णन करें...',
    mr: 'तुमच्या पिकाबद्दल विचारा किंवा समस्येचे वर्णन करा...',
    ml: 'നിങ്ങളുടെ വിളയെക്കുറിച്ച് ചോദിക്കുക അല്ലെങ്കിൽ ഒരു പ്രശ്നം വിവരിക്കുക...',
  },
  startRecording: {
    en: 'Start recording',
    hi: 'रिकॉर्डिंग शुरू करें',
    mr: 'रेकॉर्डिंग सुरू करा',
    ml: 'റെക്കോർഡിംഗ് ആരംഭിക്കുക',
  },
  stopRecording: {
    en: 'Stop recording',
    hi: 'रिकॉर्डिंग बंद करें',
    mr: 'रेकॉर्डिंग थांबवा',
    ml: 'റെക്കോർഡിംഗ് നിർത്തുക',
  },
  liveSession: {
    en: 'Live Video Analysis',
    hi: 'लाइव वीडियो विश्लेषण',
    mr: 'थेट व्हिडिओ विश्लेषण',
    ml: 'ലൈവ് വീഡിയോ വിശകലനം',
  },
  liveSessionGreeting: {
    en: 'Hello {name}, welcome to the live session! Please show me the plant you have a question about.',
    hi: 'नमस्ते {name}, लाइव सत्र में आपका स्वागत है! कृपया मुझे वह पौधा दिखाएं जिसके बारे में आपका कोई प्रश्न है।',
    mr: 'नमस्कार {name}, थेट सत्रात स्वागत आहे! कृपया मला ते रोप दाखवा ज्याबद्दल तुम्हाला प्रश्न आहे।',
    ml: 'നമസ്കാരം {name}, ലൈവ് സെഷനിലേക്ക് സ്വാഗതം! നിങ്ങൾക്ക് ചോദ്യമുള്ള ചെടി എന്നെ കാണിക്കാമോ.',
  },
  removeImage: {
    en: 'Remove image',
    hi: 'छवि हटाएँ',
    mr: 'प्रतिमा काढा',
    ml: 'ചിത്രം നീക്കം ചെയ്യുക',
  },
  goodResponse: {
    en: 'Good response',
    hi: 'अच्छा जवाब',
    mr: 'चांगला प्रतिसाद',
    ml: 'നല്ല പ്രതികരണം',
  },
  badResponse: {
    en: 'Bad response',
    hi: 'खराब जवाब',
    mr: 'खराब प्रतिसाद',
    ml: 'മോശം പ്രതികരണം',
  },
  feedbackSent: {
    en: 'Feedback sent',
    hi: 'प्रतिक्रिया भेजी गई',
    mr: 'अभिप्राय पाठवला',
    ml: 'അഭിപ്രായം അയച്ചു',
  },
  readAloud: {
    en: 'Read Aloud',
    hi: 'जोर से पढ़ें',
    mr: 'मोठ्याने वाचा',
    ml: 'ഉറക്കെ വായിക്കുക',
  },
  stopReading: {
    en: 'Stop Reading',
    hi: 'पढ़ना बंद करें',
    mr: 'वाचणे थांबवा',
    ml: 'വായന നിർത്തുക',
  },
  copy: {
    en: 'Copy',
    hi: 'कॉपी करें',
    mr: 'कॉपी करा',
    ml: 'പകർത്തുക',
  },
  copied: {
    en: 'Copied!',
    hi: 'कॉपी किया गया!',
    mr: 'कॉपी केले!',
    ml: 'പകർത്തി!',
  },
  footerText: {
    en: 'Agri-Intel is an AI-powered tool and may not always be accurate. Always consult with a local expert for critical decisions.',
    hi: 'कृषि-इंटेल एक एआई-संचालित उपकरण है और हमेशा सटीक नहीं हो सकता है। महत्वपूर्ण निर्णयों के लिए हमेशा एक स्थानीय विशेषज्ञ से परामर्श करें।',
    mr: 'कृषी-इंटेल हे AI-शक्तीवर चालणारे साधन आहे आणि ते नेहमीच अचूक असेल असे नाही. महत्त्वाच्या निर्णयांसाठी नेहमी स्थानिक तज्ञांचा सल्ला घ्या।',
    ml: 'അഗ്രി-ഇന്റൽ ഒരു AI- പവർ ചെയ്യുന്ന ഉപകരണമാണ്, അത് എല്ലായ്പ്പോഴും കൃത്യമായിരിക്കണമെന്നില്ല. നിർണായക തീരുമാനങ്ങൾക്കായി എല്ലായ്പ്പോഴും ഒരു പ്രാദേശിക വിദഗ്ദ്ധനുമായി ബന്ധപ്പെടുക.',
  },
  welcomeTitle: {
    en: 'Your AI partner in the field.',
    hi: 'खेत में आपका AI साथी।',
    mr: 'शेतातील तुमचा AI भागीदार।',
    ml: 'വയലിലെ നിങ്ങളുടെ AI പങ്കാളി.',
  },
  newChat: {
    en: 'New Chat',
    hi: 'नई चैट',
    mr: 'नवीन गप्पा',
    ml: 'പുതിയ ചാറ്റ്',
  },
  searchChats: {
    en: 'Search chats...',
    hi: 'चैट खोजें...',
    mr: 'गप्पा शोधा...',
    ml: 'ചാറ്റുകൾ തിരയുക...',
  },
  dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    mr: 'डॅशबोर्ड',
    ml: 'ഡാഷ്ബോർഡ്',
  },
  chat: {
    en: 'Chat',
    hi: 'चैट',
    mr: 'गप्पा',
    ml: 'ചാറ്റ്',
  },
  welcomeBack: {
    en: 'Welcome back',
    hi: 'वापसी पर स्वागत है',
    mr: 'पुन्हा स्वागत आहे',
    ml: 'വീണ്ടും സ്വാഗതം',
  },
  logoutButton: {
    en: 'Log Out',
    hi: 'लॉग आउट',
    mr: 'लॉग आउट करा',
    ml: 'ലോഗ് ഔട്ട്',
  },
  loginTitle: {
    en: 'Welcome to Agri-Intel',
    hi: 'कृषि-इंटेल में आपका स्वागत है',
    mr: 'कृषी-इंटेल मध्ये आपले स्वागत आहे',
    ml: 'അഗ്രി-ഇന്റലിലേക്ക് സ്വാഗതം',
  },
  loginSubtitle: {
    en: 'Let\'s get acquainted.',
    hi: 'आइए परिचय करें।',
    mr: 'चला ओळख करून घेऊया.',
    ml: 'നമുക്ക് പരിചയപ്പെടാം.',
  },
  loginStartPrompt: {
    en: 'Ready to get started? Tap the mic to begin!',
    hi: 'शुरू करने के लिए तैयार हैं? आरंभ करने के लिए माइक टैप करें!',
    mr: 'सुरुवात करण्यास तयार आहात? सुरू करण्यासाठी माइक टॅप करा!',
    ml: 'തുടങ്ങാൻ തയ്യാറാണോ? ആരംഭിക്കാൻ മൈക്ക് ടാപ്പ് ചെയ്യുക!',
  },
  loginGreetingSpokenFull: {
    en: "Welcome to Agri-Intel! To set up your profile, please say your name, preferred language, state, and district. For example: 'My name is Rohan, I speak Marathi, and I am from Pune in Maharashtra'.",
    hi: "कृषि-इंटेल में आपका स्वागत है! अपनी प्रोफाइल सेट करने के लिए, कृपया अपना नाम, पसंदीदा भाषा, राज्य और जिला बताएं। उदाहरण के लिए: 'मेरा नाम रोहन है, मैं मराठी बोलता हूं, और मैं महाराष्ट्र में पुणे से हूं।'",
    mr: "कृषी-इंटेलमध्ये आपले स्वागत आहे! तुमची प्रोफाइल सेट करण्यासाठी, कृपया तुमचे नाव, पसंतीची भाषा, राज्य आणि जिल्हा सांगा. उदाहरणार्थ: 'माझे नाव रोहन आहे, मी मराठी बोलतो, आणि मी महाराष्ट्रातील पुणे येथे राहतो.'",
    ml: "അഗ്രി-ഇന്റലിലേക്ക് സ്വാഗതം! നിങ്ങളുടെ പ്രൊഫൈൽ സജ്ജീകരിക്കുന്നതിന്, ദയവായി നിങ്ങളുടെ പേര്, ഇഷ്ടപ്പെട്ട ഭാഷ, സംസ്ഥാനം, ജില്ല എന്നിവ പറയുക. ഉദാഹരണത്തിന്: 'എൻ്റെ പേര് രോഹൻ, ഞാൻ മറാത്തി സംസാരിക്കും, ഞാൻ മഹാരാഷ്ട്രയിലെ പൂനെയിൽ നിന്നാണ് വരുന്നത്.'",
  },
  loginListenPrompt: {
    en: "Please listen for instructions...",
    hi: "कृपया निर्देशों के लिए सुनें...",
    mr: "कृपया सूचनांसाठी ऐका...",
    ml: "നിർദ്ദേശങ്ങൾക്കായി ദയവായി ശ്രദ്ധിക്കുക...",
  },
  loginListeningPrompt: {
    en: "I'm listening... Please state your name, language, state, and district.",
    hi: "सुन रहा हूँ... कृपया अपना नाम, भाषा, राज्य और जिला बताएं।",
    mr: "ऐकत आहे... कृपया तुमचे नाव, भाषा, राज्य आणि जिल्हा सांगा.",
    ml: "കേൾക്കുന്നു... ദയവായി നിങ്ങളുടെ പേര്, ഭാഷ, സംസ്ഥാനം, ജില്ല എന്നിവ വ്യക്തമാക്കുക.",
  },
  loginListening: {
    en: 'Listening...',
    hi: 'सुन रहा हूँ...',
    mr: 'ऐकत आहे...',
    ml: 'കേൾക്കുന്നു...',
  },
  loginProcessing: {
    en: 'Thinking...',
    hi: 'सोच रहा हूँ...',
    mr: 'विचार करत आहे...',
    ml: 'ആലോചിക്കുന്നു...',
  },
  loginManualButton: {
    en: 'Or, enter details manually',
    hi: 'या, विवरण मैन्युअल रूप से दर्ज करें',
    mr: 'किंवा, तपशील मॅन्युअली प्रविष्ट करा',
    ml: 'അല്ലെങ്കിൽ, വിശദാംശങ്ങൾ നേരിട്ട് നൽകുക',
  },
  loginManualHeader: {
    en: 'Please enter your details to continue.',
    hi: 'जारी रखने के लिए कृपया अपना विवरण दर्ज करें।',
    mr: 'पुढे जाण्यासाठी कृपया तुमचे तपशील प्रविष्ट करा.',
    ml: 'തുടരുന്നതിന് നിങ്ങളുടെ വിശദാംശങ്ങൾ നൽകുക.',
  },
  nameLabel: {
    en: 'Your Name',
    hi: 'आपका नाम',
    mr: 'तुमचे नाव',
    ml: 'നിങ്ങളുടെ പേര്',
  },
  languageLabel: {
    en: 'Preferred Language',
    hi: 'पसंदीदा भाषा',
    mr: 'पसंतीची भाषा',
    ml: 'ഇഷ്ടപ്പെട്ട ഭാഷ',
  },
  loginButton: {
    en: 'Start Farming Smarter',
    hi: 'स्मार्ट खेती शुरू करें',
    mr: 'स्मार्ट शेती सुरू करा',
    ml: 'സ്മാർട്ട് ഫാമിംഗ് ആരംഭിക്കുക',
  },
  readoutIntro: {
    en: 'Here is the dashboard summary for {location}.',
    hi: '{location} के लिए डैशबोर्ड सारांश यहाँ है।',
    mr: '{location} साठी डॅशबोर्ड सारांश येथे आहे।',
    ml: '{location}-നുള്ള ഡാഷ്‌ബോർഡ് സംഗ്രഹം ഇതാ.',
  },
  readoutWeather: {
    en: 'Current weather is {condition} at {temp}.',
    hi: 'वर्तमान मौसम {temp} पर {condition} है।',
    mr: 'सध्याचे हवामान {temp} वर {condition} आहे।',
    ml: 'നിലവിലെ കാലാവസ്ഥ {temp}-ൽ {condition} ആണ്.',
  },
  readoutPestAlert: {
    en: 'The pest alert level is {level}.',
    hi: 'कीट चेतावनी का स्तर {level} है।',
    mr: 'कीड सतर्कतेची पातळी {level} आहे।',
    ml: 'കീടങ്ങളെക്കുറിച്ചുള്ള മുന്നറിയിപ്പ് നില {level} ആണ്.',
  },
  readoutSoilHealth: {
    en: 'Soil health shows nitrogen is {nStatus}, phosphorus is {pStatus}, potassium is {kStatus}, with a pH of {ph}.',
    hi: 'मिट्टी का स्वास्थ्य बताता है कि नाइट्रोजन {nStatus}, फास्फोरस {pStatus}, पोटेशियम {kStatus} है, और पीएच {ph} है।',
    mr: 'मातीचे आरोग्य नायट्रोजन {nStatus}, फॉस्फरस {pStatus}, पोटॅशियम {kStatus} असल्याचे दर्शवते, आणि पीएच {ph} आहे।',
    ml: 'മണ്ണിന്റെ ആരോഗ്യം നൈട്രജൻ {nStatus}, ഫോസ്ഫറസ് {pStatus}, പൊട്ടാസ്യം {kStatus} എന്നും പിഎച്ച് {ph} ആണെന്നും കാണിക്കുന്നു.',
  },
  readoutYieldPrediction: {
    en: 'Predicted yield for {crop} is {yield} tons per hectare with {confidence} percent confidence.',
    hi: '{crop} के लिए अनुमानित उपज {confidence} प्रतिशत विश्वास के साथ {yield} टन प्रति हेक्टेयर है।',
    mr: '{crop} साठी अंदाजित उत्पन्न {confidence} टक्के विश्वासासह {yield} टन प्रति हेक्टर आहे।',
    ml: '{crop}-ന് പ്രവചിക്കപ്പെടുന്ന വിളവ് ഹെക്ടറിന് {yield} ടൺ ആണ്, {confidence} ശതമാനം ഉറപ്പാണ്.',
  },
  readoutPlantingAdvisor: {
    en: 'We recommend planting {crop} next because {reason}.',
    hi: 'हम अगला {crop} लगाने की सलाह देते हैं क्योंकि {reason}।',
    mr: 'आम्ही पुढे {crop} लावण्याची शिफारस करतो कारण {reason}।',
    ml: 'അടുത്തതായി {crop} നടാൻ ഞങ്ങൾ ശുപാർശ ചെയ്യുന്നു കാരണം {reason}.',
  },
  readoutDistrictBenchmark: {
    en: 'Your farm ranks in the {rank} for your district.',
    hi: 'आपका खेत आपके जिले में {rank} में आता है।',
    mr: 'तुमचे शेत तुमच्या जिल्ह्यात {rank} मध्ये येते।',
    ml: 'നിങ്ങളുടെ ഫാം നിങ്ങളുടെ ജില്ലയിൽ {rank} റാങ്കിലാണ്.',
  },
  weatherTitle: {
    en: 'Weather',
    hi: 'मौसम',
    mr: 'हवामान',
    ml: 'കാലാവസ്ഥ',
  },
  pestAlertsTitle: {
    en: 'Pest Alerts',
    hi: 'कीट चेतावनी',
    mr: 'कीड सूचना',
    ml: 'കീട ജാഗ്രത',
  },
  soilHealthTitle: {
    en: 'Soil Health',
    hi: 'मृदा स्वास्थ्य',
    mr: 'मातीचे आरोग्य',
    ml: 'മണ്ണിന്റെ ആരോഗ്യം',
  },
  resourceInsightsTitle: {
    en: 'Resource Insights',
    hi: 'संसाधन अंतर्दृष्टि',
    mr: 'संसाधन अंतर्दृष्टी',
    ml: 'വിഭവ സ്ഥിതിവിവരക്കണക്കുകൾ',
  },
  marketTrendsTitle: {
    en: 'Market Trends',
    hi: 'बाजार के रुझान',
    mr: 'बाजारपेठेतील कल',
    ml: 'വിപണി പ്രവണതകൾ',
  },
  yieldPredictionTitle: {
    en: 'Yield Prediction',
    hi: 'उपज की भविष्यवाणी',
    mr: 'उत्पन्नाचा अंदाज',
    ml: 'വിളവ് പ്രവചനം',
  },
  plantingAdvisorTitle: {
    en: 'Planting Advisor',
    hi: 'रोपण सलाहकार',
    mr: 'लागवड सल्लागार',
    ml: 'നടീൽ ഉപദേശകൻ',
  },
  districtBenchmarkTitle: {
    en: 'District Benchmark',
    hi: 'जिला बेंचमार्क',
    mr: 'जिल्हा बेंचमार्क',
    ml: 'ജില്ലാ ബെഞ്ച്മാർക്ക്',
  },
  pestOutbreakPredictionTitle: {
    en: 'Pest Outbreak Prediction',
    hi: 'कीट प्रकोप की भविष्यवाणी',
    mr: 'कीड प्रादुर्भावाची शक्यता',
    ml: 'കീടങ്ങളുടെ വ്യാപന പ്രവചനം',
  },
  alertLow: {
    en: 'Low',
    hi: 'कम',
    mr: 'कमी',
    ml: 'കുറവ്',
  },
  alertMedium: {
    en: 'Medium',
    hi: 'मध्यम',
    mr: 'मध्यम',
    ml: 'ഇടത്തരം',
  },
  alertHigh: {
    en: 'High',
    hi: 'उच्च',
    mr: 'जास्त',
    ml: 'ഉയർന്ന',
  },
  optimal: {
    en: 'Optimal',
    hi: 'इष्टतम',
    mr: 'अनुकूल',
    ml: 'അനുകൂലം',
  },
  low: {
    en: 'Low',
    hi: 'कम',
    mr: 'कमी',
    ml: 'കുറവ്',
  },
  high: {
    en: 'High',
    hi: 'उच्च',
    mr: 'जास्त',
    ml: 'ഉയർന്ന',
  },
  strong: {
    en: 'Strong',
    hi: 'मजबूत',
    mr: 'मजबूत',
    ml: 'ശക്തമായ',
  },
  stable: {
    en: 'Stable',
    hi: 'स्थिर',
    mr: 'स्थिर',
    ml: 'സ്ഥിരമായ',
  },
  weak: {
    en: 'Weak',
    hi: 'कमजोर',
    mr: 'कमकुवत',
    ml: 'ദുർബലമായ',
  },
  confidence: {
    en: 'Confidence',
    hi: 'आत्मविश्वास',
    mr: 'आत्मविश्वास',
    ml: 'ആത്മവിശ്വാസം',
  },
  reason: {
    en: 'Reason',
    hi: 'कारण',
    mr: 'कारण',
    ml: 'കാരണം',
  },
  probability: {
    en: 'Probability',
    hi: 'संभावना',
    mr: 'शक्यता',
    ml: 'സാധ്യത',
  },
  confirmButton: {
    en: 'Confirm',
    hi: 'पुष्टि करें',
    mr: 'पुष्टी करा',
    ml: 'സ്ഥിരീകരിക്കുക',
  },
  cancelButton: {
    en: 'Cancel',
    hi: 'रद्द करें',
    mr: 'रद्द करा',
    ml: 'റദ്ദാക്കുക',
  },
  deleteChatConfirmTitle: {
    en: 'Delete Chat',
    hi: 'चैट हटाएं',
    mr: 'गप्पा हटवा',
    ml: 'ചാറ്റ് ഇല്ലാതാക്കുക',
  },
  deleteChatConfirmMessage: {
    en: 'Are you sure you want to permanently delete this chat history?',
    hi: 'क्या आप वाकई इस चैट इतिहास को स्थायी रूप से हटाना चाहते हैं?',
    mr: 'तुम्हाला खात्री आहे की तुम्हाला हा गप्पांचा इतिहास कायमचा हटवायचा आहे?',
    ml: 'ഈ ചാറ്റ് ചരിത്രം ശാശ്വതമായി ഇല്ലാതാക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുവെന്ന് ഉറപ്പാണോ?',
  },
  logoutConfirmTitle: {
    en: 'Log Out',
    hi: 'लॉग आउट',
    mr: 'लॉग आउट करा',
    ml: 'ലോഗ് ഔട്ട്',
  },
  logoutConfirmMessage: {
    en: 'Are you sure you want to log out from your account?',
    hi: 'क्या आप वाकई अपने खाते से लॉग आउट करना चाहते हैं?',
    mr: 'तुम्हाला खात्री आहे की तुम्हाला तुमच्या खात्यातून लॉग आउट करायचे आहे?',
    ml: 'നിങ്ങളുടെ അക്കൗണ്ടിൽ നിന്ന് ലോഗ് ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?',
  },
};

export const WELCOME_PROMPTS: Record<LanguageCode, string[]> = {
  en: [
    "How can I treat leaf spot disease on my banana plant?",
    "What is a good fertilizer for coconut trees in sandy soil?",
    "Identify this pest in my paddy field."
  ],
  hi: [
    "मेरे केले के पौधे पर पत्ती धब्बे की बीमारी का इलाज कैसे करें?",
    "रेतीली मिट्टी में नारियल के पेड़ों के लिए अच्छा उर्वरक कौन सा है?",
    "मेरे धान के खेत में इस कीट को पहचानें।"
  ],
  mr: [
    "माझ्या केळीच्या झाडावरील पानांच्या ठिपक्यांच्या रोगावर उपचार कसे करावे?",
    "वाळूमिश्रित जमिनीत नारळाच्या झाडांसाठी कोणते खत चांगले आहे?",
    "माझ्या भाताच्या शेतातील हा कीटक ओळखा."
  ],
  ml: [
    "എൻ്റെ വാഴയിലെ ഇലപ്പുള്ളി രോഗം എങ്ങനെ ചികിത്സിക്കാം?",
    "മണൽ മണ്ണിൽ തെങ്ങിന് നല്ല വളം ഏതാണ്?",
    "എൻ്റെ നെൽക്കൃഷിയിലെ ഈ കീടത്തെ തിരിച്ചറിയുക."
  ]
};