
"use client";

import Link from 'next/link';
import { useTranslations } from '@/hooks/use-translations';
import { AppLogo } from '@/components/common/app-logo';
import { Github } from 'lucide-react';

export function AppFooter() {
  const { t } = useTranslations();
  
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="border-t flex justify-center">
      <div className="container flex flex-col md:flex-row h-auto md:h-24 items-center justify-between py-6 md:py-0 gap-6 md:gap-0">
        <div className="w-full md:w-auto md:flex-1 flex items-center justify-center md:justify-start">
           <a href="#" onClick={scrollToTop} className="flex items-center space-x-2">
            <AppLogo className="h-6 w-6" aria-hidden="true" />
            <span className="font-bold inline-block font-headline">{t('appName')}</span>
          </a>
        </div>
        
        <div className="flex-initial text-center text-sm text-muted-foreground order-last md:order-none max-w-md">
           <p dangerouslySetInnerHTML={{ __html: t('createdBy')}} />
           <p className="mb-1" dangerouslySetInnerHTML={{ __html: t('footerDisclaimer')}} />
        </div>

        <div className="w-full md:w-auto md:flex-1 flex items-center justify-center md:justify-end">
          <a href="https://github.com/curiousanthony/SchoolMaker-Mods" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
            <Github className="h-4 w-4" />
            {t('contributeOnGithub')}
          </a>
        </div>
      </div>
    </footer>
  );
}

    
