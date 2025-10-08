import React from 'react';
import type { LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';

interface FooterProps {
    language: LanguageCode;
}

const Footer: React.FC<FooterProps> = ({ language }) => {
    return (
        <footer className="text-center p-2 text-xs text-gray-500 dark:text-gray-700">
            <p>{TRANSLATIONS.footerText[language]}</p>
        </footer>
    );
};

export default Footer;