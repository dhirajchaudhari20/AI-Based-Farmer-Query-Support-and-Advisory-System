import React, { useState, useEffect } from 'react';
import type { LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import { getDistrictAnalytics, AnalyticsData } from '../services/analyticsService';
import ChartBarIcon from './icons/ChartBarIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';

interface DashboardProps {
  language: LanguageCode;
  location: string;
}

const getSeverityStyles = (severity: 'High' | 'Medium' | 'Low'): string => {
  switch (severity) {
    case 'High':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'Medium':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'Low':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const Dashboard: React.FC<DashboardProps> = ({ language, location }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate an async fetch for the analytics data
    const timer = setTimeout(() => {
      setAnalytics(getDistrictAnalytics(location));
      setIsLoading(false);
    }, 500); // 500ms delay to simulate network latency

    return () => clearTimeout(timer);
  }, [location]);

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 px-2">
        District Agricultural Insights: <span className="text-green-500">{location}</span>
      </h1>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Crop Performance Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#21262D] p-6 rounded-2xl shadow-lg border border-slate-200/60 dark:border-[#2D3340]">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full text-blue-600 dark:text-blue-300">
                    <ChartBarIcon />
                </div>
                <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100">Crop Performance</h2>
            </div>
            <div className="space-y-4">
                {analytics.cropPerformance.map(crop => (
                    <div key={crop.name}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{crop.name}</span>
                            <div className={`flex items-center gap-1 font-semibold ${crop.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {crop.trend === 'up' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                <span>{crop.yield} T/ha</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                                className={`h-2.5 rounded-full ${crop.yield > 3.5 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                style={{ width: `${(crop.yield / 5) * 100}%` }}
                                role="progressbar"
                                aria-valuenow={crop.yield}
                                aria-valuemin={0}
                                aria-valuemax={5}
                                aria-label={`${crop.name} yield`}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Alerts and Recommendations */}
        <div className="space-y-6">
            {/* Pest & Disease Alerts Card */}
            <div className="bg-white dark:bg-[#21262D] p-6 rounded-2xl shadow-lg border border-slate-200/60 dark:border-[#2D3340]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full text-red-600 dark:text-red-300">
                        <AlertTriangleIcon />
                    </div>
                    <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100">Pest & Disease Alerts</h2>
                </div>
                <ul className="space-y-2">
                    {analytics.pestAlerts.map(alert => (
                        <li key={alert.pest} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{alert.pest} on <span className="font-bold">{alert.crop}</span></span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getSeverityStyles(alert.severity)}`}>
                                {alert.severity}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            
             {/* Key Recommendations Card */}
            <div className="bg-white dark:bg-[#21262D] p-6 rounded-2xl shadow-lg border border-slate-200/60 dark:border-[#2D3340]">
                <div className="flex items-center gap-3 mb-4">
                     <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full text-amber-600 dark:text-amber-300">
                        <LightbulbIcon />
                    </div>
                    <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100">Key Recommendations</h2>
                </div>
                <ul className="space-y-2 text-sm list-disc list-inside text-gray-600 dark:text-gray-400">
                   {analytics.recommendations.map((rec, i) => (
                       <li key={i}>{rec}</li>
                   ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;