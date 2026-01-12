
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Mod } from '@/types';
import { allMods } from '@/lib/mods';
import ModCard from './mod-card';
import ConfigModal from './config-modal';
import CodeOutput from './code-output';
import PreviewModal from './preview-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { ClipboardCopy, Check, LayoutGrid, List, ChevronsUpDown, Filter, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Category = 'All' | 'Appearance' | 'Functionality';
type Layout = 'grid' | 'list';

const LOCAL_STORAGE_KEY = 'schoolmakerModsState';

export default function ModsDashboard() {
  const [mods, setMods] = useState<Mod[]>(allMods);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [previewingMod, setPreviewingMod] = useState<Mod | null>(null);
  const [layout, setLayout] = useState<Layout>('grid');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslations();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        
        const rehydratedMods = allMods.map(initialMod => {
          const savedMod = savedState.mods?.find(m => m.id === initialMod.id);
          if (savedMod) {
            const rehydratedOptions = initialMod.configOptions?.map(opt => {
              const savedValue = savedMod.configOptions?.find(c => c.key === opt.key)?.value;
              return { ...opt, value: savedValue ?? opt.value };
            });
            return { ...initialMod, enabled: savedMod.enabled, configOptions: rehydratedOptions };
          }
          return initialMod;
        });

        setMods(rehydratedMods);
        setSearchQuery(savedState.searchQuery || '');
        setActiveCategory(savedState.activeCategory || 'All');
        setActiveTags(savedState.activeTags || []);
        // setLayout(savedState.layout || 'grid');
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      const stateToSave = {
        mods: mods.map(mod => ({
          id: mod.id,
          enabled: mod.enabled,
          configOptions: mod.configOptions?.map(opt => ({
            key: opt.key,
            value: opt.value
          }))
        })),
        searchQuery,
        activeCategory,
        activeTags,
        // layout,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [isMounted, mods, searchQuery, activeCategory, activeTags]);

  
 const filteredMods = useMemo(() => {
    return mods
      .filter(mod => {
        if (activeCategory === 'All') return true;
        return mod.category === activeCategory;
      })
      .filter(mod => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        if (lowerCaseQuery.trim() === '') return true;
        const name = t(`mod_${mod.id}_name` as any).toLowerCase();
        const description = t(`mod_${mod.id}_description` as any).toLowerCase();
        return (
          name.includes(lowerCaseQuery) ||
          description.includes(lowerCaseQuery)
        );
      })
      .filter(mod => {
        if (activeTags.length === 0) return true;
        return activeTags.every(tag => mod.tags.includes(tag));
      });
  }, [mods, activeCategory, activeTags, searchQuery, t]);

  const categoryCounts = useMemo(() => {
    return {
      All: mods.length,
      Appearance: mods.filter(m => m.category === 'Appearance').length,
      Functionality: mods.filter(m => m.category === 'Functionality').length,
    };
  }, [mods]);

 const availableTags = useMemo(() => {
    // Start with mods filtered by category and search query.
    const baseFilteredMods = mods.filter(mod => 
        (activeCategory === 'All' || mod.category === activeCategory) &&
        (searchQuery.trim() === '' || 
         t(`mod_${mod.id}_name` as any).toLowerCase().includes(searchQuery.toLowerCase()) || 
         t(`mod_${mod.id}_description` as any).toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Get all unique tags from this base-filtered list.
    const allPossibleTags = new Set<string>();
    baseFilteredMods.forEach(mod => {
        mod.tags.forEach(tag => allPossibleTags.add(tag));
    });

    const translated = Array.from(allPossibleTags)
        .map(tag => {
            const isSelected = activeTags.includes(tag);
            
            // This is the list of mods that match the currently active tags.
            const currentlyFilteredMods = baseFilteredMods.filter(mod => 
                activeTags.every(t => mod.tags.includes(t))
            );

            // Calculate the count based on the *currently filtered* list.
            const count = isSelected 
              ? currentlyFilteredMods.length 
              : currentlyFilteredMods.filter(mod => mod.tags.includes(tag)).length;

            
            // If the tag is not selected and no mods in the current view have it, don't show it.
            if (!isSelected && count === 0 && activeTags.length > 0) {
              return null;
            }

            return {
                key: tag,
                display: t(`tag_${tag}` as any),
                count: count
            };
        })
        .filter(Boolean) as { key: string; display: string; count: number }[];

    translated.sort((a, b) => a.display.localeCompare(b.display, undefined, { sensitivity: 'base' }));

    return translated;
  }, [mods, activeCategory, searchQuery, activeTags, t]);


  const enabledModsCount = useMemo(() => mods.filter(mod => mod.enabled).length, [mods]);
  const allModsEnabled = useMemo(() => mods.length > 0 && enabledModsCount === mods.length, [mods, enabledModsCount]);

  const isModConfigValid = (mod: Mod): boolean => {
    if (!mod.configOptions) {
      return true;
    }
    return mod.configOptions.every(opt => {
      if (!opt.required) return true;
       if (opt.type === 'level_config') {
        try {
          const levels = JSON.parse(opt.value);
          if (!Array.isArray(levels) || levels.length === 0) return false;
          return levels.every(level => level.level && level.title && level.icon && level.color);
        } catch {
          return false;
        }
      }
      return opt.value !== undefined && opt.value !== null && opt.value !== '';
    });
  };

  const handleToggleMod = (modId: string) => {
    const modToToggle = mods.find(m => m.id === modId);
    if (!modToToggle) return;

    if (!modToToggle.enabled && !isModConfigValid(modToToggle)) {
      toast({
        title: t('modCantBeEnabledTitle'),
        description: t('modCantBeEnabledDescription'),
        variant: "destructive",
      });
      return;
    }

    setMods(prevMods =>
      prevMods.map(mod =>
        mod.id === modId ? { ...mod, enabled: !mod.enabled } : mod
      )
    );
  };
  
  const handleOpenConfig = (mod: Mod) => {
    setSelectedMod(mod);
  };

  const handleCloseConfig = () => {
    setSelectedMod(null);
  };

  const handleSaveConfig = (modId: string, newConfig: Record<string, string>) => {
    setMods(prevMods =>
      prevMods.map(mod => {
        if (mod.id === modId && mod.configOptions) {
          const updatedConfigOptions = mod.configOptions.map(opt => ({
            ...opt,
            value: newConfig[opt.key] ?? opt.value,
          }));
          return { ...mod, configOptions: updatedConfigOptions };
        }
        return mod;
      })
    );
    handleCloseConfig();
  };

  const handleTagClick = (tagKey: string) => {
    setActiveTags(prev =>
      prev.includes(tagKey) ? prev.filter(t => t !== tagKey) : [...prev, tagKey]
    );
  };

  const handleToggleAll = () => {
    const enableAll = !allModsEnabled;
    const modsToUpdate = mods.map(mod => {
      if (enableAll && !isModConfigValid(mod)) {
        // Don't enable invalid mods
        return mod;
      }
      return { ...mod, enabled: enableAll };
    });
    setMods(modsToUpdate);
  };

  const generatedCode = useMemo(() => {
    const enabledMods = mods.filter(mod => mod.enabled);
    if (enabledMods.length === 0) return '';
    
    const jsMods = enabledMods.filter(mod => mod.modType === 'javascript');
    const cssMods = enabledMods.filter(mod => mod.modType === 'css');
    
    const fontMod = enabledMods.find(m => m.id === 'global-font-customizer');
    const selectedFont = fontMod?.configOptions?.find(o => o.key === 'fontFamily')?.value;
    const needsGoogleIcons = enabledMods.some(mod => mod.requiresGoogleIcons);
    
    const links: string[] = [];
    if (needsGoogleIcons) {
      links.push('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,1,0" />');
    }
    if (selectedFont) {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g, '+')}:wght@400;700&display=swap`;
      links.push(`<link rel="stylesheet" href="${fontUrl}" />`);
    }
    const linksBlock = links.join('\n');

    const cssString = cssMods.length > 0 ?
      cssMods.map(mod => {
        let modCss = mod.cssString || '';
        const config: Record<string, string> = {};
        if (mod.configOptions) {
          mod.configOptions.forEach(opt => {
            config[opt.key] = opt.value;
          });
        }
        
        modCss = modCss.replace(
            /\/\*\[--if ([a-zA-Z0-9_]+)--\]\*\/([\s\S]*?)\/\*\[--endif \1--\]\*\//g,
            (match, key, content) => {
                const configValue = config[key.trim()];
                const isTruthy = configValue && configValue !== 'false' && configValue !== '';
                return isTruthy ? content : '';
            }
        );

        modCss = modCss.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => config[key.trim()] || '');
        
        if (modCss.trim() === '') return '';

        return `/* --- Mod: ${t(`mod_${mod.id}_name` as any)} --- */\n${modCss.trim()}`;
      }).filter(Boolean).join('\n\n')
      : '';
    
    const styleBlock = cssString ? `<style>\n${cssString}\n</style>` : '';

    const scriptBlock = jsMods.length > 0 ? (() => {
      const modObjects = jsMods.map(mod => {
        const config: Record<string, string> = {};
        mod.configOptions?.forEach(opt => {
          config[opt.key] = opt.value;
        });

        const functionImplementation = mod.functionString;
        
        return `{
          id: '${mod.id}',
          name: "${t(`mod_${mod.id}_name` as any)}",
          config: ${JSON.stringify(config, null, 2)},
          run: ${functionImplementation}
        }`;
      });

      const modsArrayString = `const mods = [\n  ${modObjects.join(',\n  ')}\n];`;

      return `<script>
  // Helper functions for targeting elements
  const qs = (arg, queryFrom = document) => queryFrom.querySelector(arg);
  const qsa = (arg, queryFrom = document) => queryFrom.querySelectorAll(arg);

  // Set to true when debugging. Will log tests to the console
  const debug = false;

  // Helper function for conditional logging
  function log(message, ...args) {
    if (debug) {
      console.log(message, ...args);
    }
  }

  ${modsArrayString}

  // Loops through mods and executes all enabled functions
  function executeMods() {
    mods.forEach(mod => {
      try {
        if (typeof mod.run === 'function') {
          mod.run(mod.config);
        }
      } catch (e) {
        console.error(\`Error executing mod: \${mod.name}\`, e);
      }
    });
  }
  
  // Run on initial load
  document.addEventListener("DOMContentLoaded", executeMods);

  // Run on Turbo frame element reload
  document.addEventListener("turbo:frame-render", executeMods);
  
  // Run on Turbo navigation
  document.addEventListener("turbo:load", executeMods);
</script>`;
    })() : '';

    return [linksBlock, styleBlock, scriptBlock].filter(Boolean).join('\n\n');
  }, [mods, t]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopied(true);
      toast({
        title: t('copiedToClipboard'),
        description: t('copiedToClipboardDescription'),
      });
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      toast({
        title: t('copyFailed'),
        description: t('copyFailedDescription'),
        variant: "destructive",
      });
    });
  };

  if (!isMounted) {
    return null;
  }

  const categoryOptions: { value: Category, label: string }[] = [
    { value: 'All', label: t('all') },
    { value: 'Appearance', label: t('category_appearance') },
    { value: 'Functionality', label: t('category_functionality') },
  ];

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 flex flex-col min-h-full">
        <div className="flex-grow pt-8">
            <header className="text-center mb-8">
              <h1 className="font-headline text-4xl font-bold mb-1">{t('pageTitle')}</h1>
              <p className="text-md text-muted-foreground max-w-2xl mx-auto">
                  {t('pageDescription')}
              </p>
          </header>

          <div className="relative">
            <div className="sticky top-[64px] z-20 bg-background/95 backdrop-blur-sm -mx-4 px-4 pt-2 pb-4 mb-8 border-b">
                <div className="p-4 bg-card border rounded-lg shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder={t('searchPlaceholder')}
                          className="w-full pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                         <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={categoryPopoverOpen}
                              className="w-[200px] justify-between"
                            >
                              {t(`category_${activeCategory.toLowerCase()}` as any) || t('all')}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0">
                            <Command>
                              <CommandList>
                                <CommandGroup>
                                  {categoryOptions.map((cat) => (
                                    <CommandItem
                                      key={cat.value}
                                      value={cat.value}
                                      onSelect={(currentValue) => {
                                        setActiveCategory(currentValue as Category);
                                        setCategoryPopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          activeCategory === cat.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <span className="flex-grow">{cat.label}</span>
                                      <span className="text-xs text-muted-foreground">{categoryCounts[cat.value]}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={tagPopoverOpen}
                              className="w-auto justify-between"
                            >
                              <Filter className="mr-2 h-4 w-4 shrink-0" />
                              {t('tagsLabel')}
                              {activeTags.length > 0 && (
                                <div className="ml-2 h-4 w-4 text-xs flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    {activeTags.length}
                                </div>
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Command>
                              <CommandInput placeholder={t('filterByTag')} />
                              <CommandList>
                                <CommandEmpty>{t('noTagsFound')}</CommandEmpty>
                                <CommandGroup>
                                  {availableTags.map((tag) => (
                                    <CommandItem
                                      key={tag.key}
                                      value={tag.key}
                                      onSelect={() => handleTagClick(tag.key)}
                                      disabled={tag.count === 0 && !activeTags.includes(tag.key)}
                                      className={cn(tag.count === 0 && !activeTags.includes(tag.key) && "text-muted-foreground/50")}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          activeTags.includes(tag.key) ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <span className="flex-grow">{tag.display}</span>
                                      <span className="text-xs text-muted-foreground">{tag.count}</span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                         {activeTags.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => setActiveTags([])} className="h-auto py-0.5 px-2">{t('clear')}</Button>
                        )}
                      </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                      <div className="w-full md:w-auto order-2 md:order-1">
                          <Button variant="outline" onClick={handleToggleAll} className="w-full md:w-auto">
                              {allModsEnabled ? t('disableAll') : t('enableAll')}
                          </Button>
                      </div>
                      <div className="flex items-center gap-x-2 order-1 md:order-2">
                          <p className="text-sm text-primary font-semibold">
                          {enabledModsCount > 0 
                              ? t('enabledMods', { count: enabledModsCount }) 
                              : t('gettingStarted')}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium">({t('showingMods', {count: filteredMods.length})})</p>
                      </div>
                   
                    {/* {!isMobile && (
                      <div className="flex items-center gap-2 order-3 ml-auto">
                          <Button variant={layout === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setLayout('grid')}>
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            {t('layoutGrid')}
                          </Button>
                          <Button variant={layout === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setLayout('list')}>
                            <List className="mr-2 h-4 w-4" />
                            {t('layoutList')}
                          </Button>
                      </div>
                    )} */}
                  </div>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all">
                {filteredMods.map(mod =>
                  <ModCard
                      key={mod.id}
                      mod={mod}
                      layout={'grid'}
                      onToggle={() => handleToggleMod(mod.id)}
                      onConfigure={() => handleOpenConfig(mod)}
                      onPreview={() => setPreviewingMod(mod)}
                      isConfigValid={isModConfigValid(mod)}
                  />
                )}
            </div>
            
            {filteredMods.length === 0 && (
                <p className="text-center col-span-full text-muted-foreground mt-8">{t('noModsFound')}</p>
            )}
          </div>
          
           {enabledModsCount > 0 && (
             <div className="fixed bottom-4 right-4 z-50">
                <Button onClick={handleCopy} size="lg" className="shadow-lg">
                    {copied ? <Check className="mr-2 h-5 w-5" /> : <ClipboardCopy className="mr-2 h-5 w-5" />}
                    {t('copyCode')} ({t('enabledMods', { count: enabledModsCount })})
                </Button>
              </div>
            )}

          <div className="my-16 space-y-16">
            <CodeOutput generatedCode={generatedCode} />
            <section id="how-to-use" className="scroll-mt-20">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{t('howToUseTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 text-base space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">1</div>
                            <p className="flex-1 pt-1">{t('step1')}</p>
                        </div>
                        <div className="flex items-start gap-4">
                             <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">2</div>
                            <p className="flex-1 pt-1">{t('step2')}</p>
                        </div>
                         <div className="flex items-start gap-4">
                             <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">3</div>
                            <p className="flex-1 pt-1" dangerouslySetInnerHTML={{ __html: t('step3') }} />
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">4</div>
                            <p className="flex-1 pt-1" dangerouslySetInnerHTML={{ __html: t('step4') }} />
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section id="why-mods" className="scroll-mt-20">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{t('whyTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <p className="text-muted-foreground">{t('whyContent')}</p>
                    </CardContent>
                </Card>
            </section>
          </div>
        </div>
        
        {selectedMod && (
          <ConfigModal
            mod={selectedMod}
            onSave={handleSaveConfig}
            onClose={handleCloseConfig}
          />
        )}

        {previewingMod && (
          <PreviewModal
            mod={previewingMod}
            onClose={() => setPreviewingMod(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

    



