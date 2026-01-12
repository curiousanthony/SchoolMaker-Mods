
"use client"

import type { Mod } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Image from 'next/image';
import { useTranslations } from '@/hooks/use-translations';

interface PreviewModalProps {
  mod: Mod;
  onClose: () => void;
}

const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Helper component to render either video or image
const MediaDisplay = ({ src, alt, hint, width = 800, height = 450 }: { src: string, alt: string, hint: string, width?: number, height?: number }) => {
    if (src.endsWith('.webm')) {
        return (
            <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain"
                data-ai-hint={hint}
            >
                Your browser does not support the video tag.
            </video>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto object-contain"
            data-ai-hint={hint}
        />
    );
};


export default function PreviewModal({ mod, onClose }: PreviewModalProps) {
  const { t } = useTranslations();

  // The main URL is used for YouTube videos, the "after" image, or a single preview image.
  const mainMediaUrl = mod.mediaUrl;
  const beforeMediaUrl = mod.mediaBeforeUrl;

  if (!mainMediaUrl) return null;
  
  const videoId = getYoutubeVideoId(mainMediaUrl);
  const modName = t(`mod_${mod.id}_name`);

  const hasBeforeAfter = beforeMediaUrl && mainMediaUrl && !videoId;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">{t('previewTitle', { modName })}</DialogTitle>
           <DialogDescription>
            {t('previewDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 bg-muted rounded-lg overflow-auto">
          {videoId ? (
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            </div>
          ) : hasBeforeAfter ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">{t('previewBefore')}</h3>
                    <div className="border rounded-md overflow-hidden">
                        <MediaDisplay
                            src={beforeMediaUrl!}
                            alt={`'Before' preview for ${modName}`}
                            hint="user interface before"
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">{t('previewAfter')}</h3>
                    <div className="border rounded-md overflow-hidden">
                        <MediaDisplay
                            src={mainMediaUrl}
                            alt={`'After' preview for ${modName}`}
                            hint="user interface after"
                        />
                    </div>
                </div>
            </div>
          ) : (
            <MediaDisplay
              src={mainMediaUrl}
              alt={`Preview for ${modName}`}
              hint="abstract technology"
              width={1280}
              height={720}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
