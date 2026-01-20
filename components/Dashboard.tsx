import React, { useState, useEffect, useCallback } from 'react';
import type { LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import { analyticsService, DashboardAnalytics } from '../services/analyticsService';
import SpeakerIcon from './icons/SpeakerIcon';
import StopIcon from './icons/StopIcon';
import SunCloudIcon from './icons/SunCloudIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import SoilIcon from './icons/SoilIcon';
import WaterDropIcon from './icons/WaterDropIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import SeedlingIcon from './icons/SeedlingIcon';
import TrophyIcon from './icons/TrophyIcon';
import BugIcon from './icons/BugIcon';

interface DashboardProps {
    language: LanguageCode;
    location: string;
}

const DashboardCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
    iconBgClass?: string;
}> = ({ icon, title, children, className = '', iconBgClass = 'bg-green-100 dark:bg-green-900/30' }) => (
    <div className={`bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-700/80 rounded-xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col ${className}`}>
        <div className="flex items-start mb-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${iconBgClass}`}>
                {icon}
            </div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 leading-tight">{title}</h3>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 flex-grow">
            {children}
        </div>
    </div>
);


const TrendChart: React.FC<{ data: { month: string, price: number }[] }> = ({ data }) => {
    const maxPrice = Math.max(...data.map(p => p.price));
    const minPrice = Math.min(...data.map(p => p.price));

    return (
        <div className="w-full h-24 bg-slate-50 dark:bg-gray-800/50 rounded-lg p-2 flex items-end justify-between">
            {data.map((point, index) => {
                const heightPercentage = ((point.price - minPrice) / (maxPrice - minPrice)) * 100;
                return (
                    <div key={index} className="w-1/6 flex flex-col items-center justify-end h-full group">
                        <div 
                            className="w-2/3 bg-green-300 dark:bg-green-700 rounded-t-sm group-hover:bg-green-500 transition-all duration-200"
                            style={{ height: `${Math.max(10, heightPercentage)}%` }}
                        ></div>
                        <span className="text-xs text-gray-400 mt-1">{point.month}</span>
                    </div>
                );
            })}
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ language, location }) => {
    const [analyticsData, setAnalyticsData] = useState<DashboardAnalytics | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const data = analyticsService.getDashboardAnalytics(location);
        setAnalyticsData(data);
    }, [location]);

    // Cleanup speech synthesis on component unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleReadAloud = useCallback(() => {
        if (!analyticsData) return;
        
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const t = TRANSLATIONS;
        const data = analyticsData;

        let summary = t.readoutIntro[language].replace('{location}', location) + ' ';
        summary += t.readoutWeather[language].replace('{condition}', data.weather.condition).replace('{temp}', data.weather.temp) + ' ';
        summary += t.readoutPestAlert[language].replace('{level}', t[`alert${data.pestAlerts.level.charAt(0).toUpperCase() + data.pestAlerts.level.slice(1)}` as keyof typeof t][language]) + ' ';
        summary += t.readoutSoilHealth[language]
            .replace('{nStatus}', t[data.soilHealth.n.status][language])
            .replace('{pStatus}', t[data.soilHealth.p.status][language])
            .replace('{kStatus}', t[data.soilHealth.k.status][language])
            .replace('{ph}', data.soilHealth.ph.toString()) + ' ';
        summary += t.readoutYieldPrediction[language]
            .replace('{yield}', data.yieldPrediction.predictedYield.toString())
            .replace('{crop}', data.yieldPrediction.crop)
            .replace('{confidence}', data.yieldPrediction.confidence.toString()) + ' ';
        summary += t.readoutPlantingAdvisor[language]
            .replace('{crop}', data.plantingAdvisor.recommendedCrop)
            .replace('{reason}', data.plantingAdvisor.reason) + ' ';
        summary += t.readoutDistrictBenchmark[language].replace('{rank}', data.districtBenchmark.rank) + ' ';

        const utterance = new SpeechSynthesisUtterance(summary);
        
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(v => v.lang.startsWith(language) && v.name.includes('Google')) || voices.find(v => v.lang.startsWith(language) && v.localService) || voices.find(v => v.lang.startsWith(language));
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);

    }, [analyticsData, language, location, isSpeaking]);


    if (!analyticsData) {
        return (
            <div className="p-4 h-full overflow-y-auto flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <p>Loading Dashboard...</p>
                </div>
            </div>
        );
    }
    
    const { weather, pestAlerts, soilHealth, resourceInsights, marketTrends, yieldPrediction, plantingAdvisor, districtBenchmark, pestOutbreakPrediction } = analyticsData;
    const alertColor = pestAlerts.level === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : pestAlerts.level === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500' : 'bg-green-100 dark:bg-green-900/30 text-green-500';

    return (
        <div className="p-1 sm:p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {TRANSLATIONS.dashboard[language]}: <span className="text-green-500">{location}</span>
                </h2>
                <button 
                    onClick={handleReadAloud}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    {isSpeaking ? <StopIcon /> : <SpeakerIcon />}
                    <span className="hidden sm:inline">{isSpeaking ? TRANSLATIONS.stopReading[language] : TRANSLATIONS.readAloud[language]}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Row 1: Key Metrics */}
                <DashboardCard icon={<SunCloudIcon className="h-6 w-6 text-yellow-500"/>} title={TRANSLATIONS.weatherTitle[language]} iconBgClass="bg-yellow-100 dark:bg-yellow-900/30">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{weather.temp}</p>
                    <p>{weather.condition}</p>
                </DashboardCard>

                <DashboardCard icon={<ShieldCheckIcon className="h-6 w-6"/>} title={TRANSLATIONS.pestAlertsTitle[language]} iconBgClass={alertColor}>
                    <p className={`text-xl font-bold ${alertColor.split(' ')[2]}`}>{TRANSLATIONS[`alert${pestAlerts.level.charAt(0).toUpperCase() + pestAlerts.level.slice(1)}` as keyof typeof TRANSLATIONS][language]}</p>
                    <p className="text-xs">{pestAlerts.message}</p>
                </DashboardCard>
                
                <DashboardCard icon={<SoilIcon className="h-6 w-6 text-orange-600"/>} title={TRANSLATIONS.soilHealthTitle[language]} iconBgClass="bg-orange-100 dark:bg-orange-900/30">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        <span>Nitrogen (N):</span><span className={`font-semibold ${soilHealth.n.status !== 'optimal' ? 'text-yellow-600' : ''}`}>{TRANSLATIONS[soilHealth.n.status][language]}</span>
                        <span>Phosphorus (P):</span><span className={`font-semibold ${soilHealth.p.status !== 'optimal' ? 'text-yellow-600' : ''}`}>{TRANSLATIONS[soilHealth.p.status][language]}</span>
                        <span>Potassium (K):</span><span className={`font-semibold ${soilHealth.k.status !== 'optimal' ? 'text-yellow-600' : ''}`}>{TRANSLATIONS[soilHealth.k.status][language]}</span>
                        <span>pH Level:</span><span className="font-semibold">{soilHealth.ph}</span>
                    </div>
                </DashboardCard>

                <DashboardCard icon={<WaterDropIcon className="h-6 w-6 text-blue-500"/>} title={TRANSLATIONS.resourceInsightsTitle[language]} iconBgClass="bg-blue-100 dark:bg-blue-900/30">
                     <p>Rainfall: <span className={`font-bold ${resourceInsights.rainfall.deviation > 0 ? 'text-green-500' : 'text-red-500'}`}>{resourceInsights.rainfall.deviation}% vs avg</span></p>
                     <p>Market Forecast: <span className="font-bold">{TRANSLATIONS[resourceInsights.market.forecast][language]}</span></p>
                </DashboardCard>
                
                {/* Row 2: Advanced BDA */}
                 <DashboardCard className="sm:col-span-2" icon={<TrendingUpIcon className="h-6 w-6 text-indigo-500"/>} title={`${TRANSLATIONS.marketTrendsTitle[language]} - ${marketTrends.crop}`} iconBgClass="bg-indigo-100 dark:bg-indigo-900/30">
                    <TrendChart data={marketTrends.data} />
                 </DashboardCard>

                 <DashboardCard className="sm:col-span-2" icon={<ShieldCheckIcon className="h-6 w-6 text-cyan-500"/>} title={TRANSLATIONS.yieldPredictionTitle[language]} iconBgClass="bg-cyan-100 dark:bg-cyan-900/30">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">{yieldPrediction.predictedYield}<span className="text-lg"> t/ha</span></p>
                        <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">{yieldPrediction.crop}</p>
                        <div className="mt-2 text-xs bg-cyan-100 dark:bg-cyan-900/50 rounded-full px-2 py-0.5 inline-block">{TRANSLATIONS.confidence[language]}: {yieldPrediction.confidence}%</div>
                    </div>
                 </DashboardCard>

                {/* Row 3: Prescriptive & Comparative */}
                 <DashboardCard icon={<SeedlingIcon className="h-6 w-6 text-lime-500"/>} title={TRANSLATIONS.plantingAdvisorTitle[language]} iconBgClass="bg-lime-100 dark:bg-lime-900/30">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Recommended Crop:</p>
                    <p className="font-bold text-lg text-lime-600 dark:text-lime-400 mb-1">{plantingAdvisor.recommendedCrop}</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{TRANSLATIONS.reason[language]}:</p>
                    <p className="text-xs">{plantingAdvisor.reason}</p>
                </DashboardCard>
                 
                 <DashboardCard icon={<TrophyIcon className="h-6 w-6 text-amber-500"/>} title={TRANSLATIONS.districtBenchmarkTitle[language]} iconBgClass="bg-amber-100 dark:bg-amber-900/30">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{districtBenchmark.rank}</p>
                    <p className="text-xs">{districtBenchmark.note}</p>
                 </DashboardCard>

                 <DashboardCard icon={<BugIcon className="h-6 w-6 text-rose-500"/>} title={TRANSLATIONS.pestOutbreakPredictionTitle[language]} iconBgClass="bg-rose-100 dark:bg-rose-900/30">
                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{pestOutbreakPrediction.pestName}</p>
                    <p className="text-xs">{TRANSLATIONS.probability[language]}: <span className="font-bold text-xl">{pestOutbreakPrediction.probability}%</span></p>
                 </DashboardCard>
            </div>
        </div>
    );
};

export default Dashboard;