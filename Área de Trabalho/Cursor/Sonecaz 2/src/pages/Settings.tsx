import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Settings as SettingsIcon, Bell, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, isLoading, updateSetting, saveSettings, DEFAULT_SETTINGS } = useSettings();

  // Atualizar uma configuração específica com toast
  const handleUpdateSetting = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    updateSetting(key, value);
    toast.success('Configuração salva!');
  };

  // Resetar para padrões
  const resetToDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      saveSettings(DEFAULT_SETTINGS);
      toast.info('Configurações restauradas para os valores padrão');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Personalize o comportamento do Sonecaz
          </p>
        </div>

        {/* Configurações do Alarme */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Alarme de Destino</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="defaultRadius" className="text-sm font-medium">
                  Raio padrão
                </Label>
                <span className="text-sm font-bold text-primary">
                  {settings.defaultRadius >= 1000 
                    ? `${(settings.defaultRadius / 1000).toFixed(1)} km` 
                    : `${settings.defaultRadius} m`}
                </span>
              </div>
              <Slider
                id="defaultRadius"
                value={[settings.defaultRadius]}
                onValueChange={(values) => handleUpdateSetting('defaultRadius', values[0])}
                min={50}
                max={5000}
                step={50}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Raio de ativação padrão quando você define um destino
              </p>
            </div>
          </div>
        </Card>

        {/* Configurações de Alertas Próximos */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Alertas de Estabelecimentos</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableNearbyAlerts" className="text-sm font-medium">
                  Ativar alertas de estabelecimentos próximos
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receber alertas quando estiver próximo de supermercados ou farmácias
                </p>
              </div>
              <Switch
                id="enableNearbyAlerts"
                checked={settings.enableNearbyAlerts}
                onCheckedChange={(checked) => handleUpdateSetting('enableNearbyAlerts', checked)}
              />
            </div>

            {settings.enableNearbyAlerts && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="nearbyAlertRadius" className="text-sm font-medium">
                      Raio de detecção
                    </Label>
                    <span className="text-sm font-bold text-primary">
                      {settings.nearbyAlertRadius >= 1000 
                        ? `${(settings.nearbyAlertRadius / 1000).toFixed(1)} km` 
                        : `${settings.nearbyAlertRadius} m`}
                    </span>
                  </div>
                  <Slider
                    id="nearbyAlertRadius"
                    value={[settings.nearbyAlertRadius]}
                    onValueChange={(values) => handleUpdateSetting('nearbyAlertRadius', values[0])}
                    min={100}
                    max={2000}
                    step={50}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Distância máxima para detectar estabelecimentos
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alertCooldown" className="text-sm font-medium">
                      Intervalo entre alertas
                    </Label>
                    <span className="text-sm font-bold text-primary">
                      {settings.alertCooldown} {settings.alertCooldown === 1 ? 'minuto' : 'minutos'}
                    </span>
                  </div>
                  <Slider
                    id="alertCooldown"
                    value={[settings.alertCooldown]}
                    onValueChange={(values) => handleUpdateSetting('alertCooldown', values[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo mínimo entre alertas do mesmo tipo
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Configurações de Notificações */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Notificações</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableNotifications" className="text-sm font-medium">
                  Ativar notificações
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receber notificações quando o alarme for acionado
                </p>
              </div>
              <Switch
                id="enableNotifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleUpdateSetting('enableNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableHaptics" className="text-sm font-medium">
                  Ativar vibração
                </Label>
                <p className="text-xs text-muted-foreground">
                  Vibração quando o alarme for acionado (apenas mobile)
                </p>
              </div>
              <Switch
                id="enableHaptics"
                checked={settings.enableHaptics}
                onCheckedChange={(checked) => handleUpdateSetting('enableHaptics', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="flex-1"
          >
            Restaurar Padrões
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Concluído
          </Button>
        </div>

        {/* Informações */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Dica:</strong> As configurações são salvas automaticamente quando você as altera.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

