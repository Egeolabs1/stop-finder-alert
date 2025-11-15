import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Language } from '@/types/i18n';
import { cn } from '@/lib/utils';

const LanguageSelector = () => {
  const { t, language, changeLanguage, supportedLanguages } = useTranslation();

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">{t('settings.language')}</h2>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">{t('settings.selectLanguage')}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {supportedLanguages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? 'default' : 'outline'}
              onClick={() => changeLanguage(lang.code)}
              className={cn(
                'flex items-center justify-start gap-2',
                language === lang.code && 'bg-primary text-primary-foreground'
              )}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.nativeName}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t('settings.tip')}
        </p>
      </div>
    </Card>
  );
};

export default LanguageSelector;





