import type { Mod } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Eye, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

interface ModCardProps {
  mod: Mod;
  onToggle: () => void;
  onConfigure: () => void;
  onPreview: () => void;
  isConfigValid: boolean;
}

export default function ModCard({ mod, onToggle, onConfigure, onPreview, isConfigValid }: ModCardProps) {
  const { t } = useTranslations();
  const modName = t(`mod_${mod.id}_name`);
  
  const canEnable = isConfigValid || mod.enabled;

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {mod.bannerUrl && (
        <div className="relative w-full aspect-[16/9] bg-muted">
          <Image
            src={mod.bannerUrl}
            alt={`Banner for ${modName}`}
            fill
            className="object-cover"
            data-ai-hint="abstract feature illustration"
          />
        </div>
      )}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 pr-2">
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              {modName}
              {!canEnable && (
                 <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('modNeedsConfigTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
              )}
            </CardTitle>
            <CardDescription className="font-semibold text-primary/80">{t(`category_${mod.category.toLowerCase()}`)}</CardDescription>
        </div>
        <Switch 
          checked={mod.enabled} 
          onCheckedChange={onToggle}
          aria-label={`Enable ${mod.name}`}
        />
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{t(`mod_${mod.id}_description`)}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-end">
        <div className="flex flex-wrap gap-1 select-none">
          {mod.tags.map(tag => (
            <Badge key={tag} variant="secondary">{t(`tag_${tag}`)}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {mod.mediaUrl && mod.previewEnabled && (
            <Button variant="ghost" size="icon" onClick={onPreview} aria-label={`Preview ${mod.name}`}>
              <Eye className="h-5 w-5 text-primary" />
            </Button>
          )}
          {mod.configOptions && mod.configOptions.length > 0 && (
            <Button variant="ghost" size="icon" onClick={onConfigure} aria-label={`Configure ${mod.name}`}>
              <Settings className="h-5 w-5 text-primary" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
