import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { toast } from 'sonner';

export type PermissionType = 'location' | 'notifications';

export interface PermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  checking: boolean;
}

export interface PermissionContext {
  type: PermissionType;
  title: string;
  description: string;
  whyNeeded: string;
  icon: string;
}

const PERMISSION_CONTEXTS: Record<PermissionType, PermissionContext> = {
  location: {
    type: 'location',
    title: 'Permissão de Localização',
    description: 'O Sonecaz precisa da sua localização para monitorar quando você está próximo ao destino.',
    whyNeeded: 'Esta permissão é essencial para o funcionamento dos alarmes baseados em localização. Sem ela, não podemos avisar quando você chegar ao destino.',
    icon: '📍',
  },
  notifications: {
    type: 'notifications',
    title: 'Permissão de Notificações',
    description: 'O Sonecaz precisa enviar notificações para avisar quando o alarme for acionado.',
    whyNeeded: 'As notificações permitem que você seja avisado mesmo quando o aplicativo estiver em segundo plano.',
    icon: '🔔',
  },
};

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Record<PermissionType, PermissionStatus>>({
    location: { granted: false, denied: false, prompt: false, checking: true },
    notifications: { granted: false, denied: false, prompt: false, checking: true },
  });

  // Verificar permissões iniciais
  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = useCallback(async () => {
    await Promise.all([
      checkPermission('location'),
      checkPermission('notifications'),
    ]);
  }, []);

  const checkPermission = useCallback(async (type: PermissionType): Promise<PermissionStatus> => {
    setPermissions((prev) => ({
      ...prev,
      [type]: { ...prev[type], checking: true },
    }));

    try {
      let status: PermissionStatus;

      if (type === 'location') {
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          // Web API
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          status = {
            granted: permission.state === 'granted',
            denied: permission.state === 'denied',
            prompt: permission.state === 'prompt',
            checking: false,
          };
        } else {
          // Capacitor
          try {
            const result = await Geolocation.checkPermissions();
            status = {
              granted: result.location === 'granted',
              denied: result.location === 'denied',
              prompt: result.location === 'prompt',
              checking: false,
            };
          } catch {
            status = { granted: false, denied: false, prompt: true, checking: false };
          }
        }
      } else {
        // Notifications
        if (typeof window !== 'undefined' && 'Notification' in window) {
          // Web API
          const permission = Notification.permission;
          status = {
            granted: permission === 'granted',
            denied: permission === 'denied',
            prompt: permission === 'default',
            checking: false,
          };
        } else {
          // Capacitor
          try {
            const result = await LocalNotifications.checkPermissions();
            status = {
              granted: result.display === 'granted',
              denied: result.display === 'denied',
              prompt: result.display === 'prompt',
              checking: false,
            };
          } catch {
            status = { granted: false, denied: false, prompt: true, checking: false };
          }
        }
      }

      setPermissions((prev) => ({
        ...prev,
        [type]: status,
      }));

      return status;
    } catch (error) {
      console.error(`Error checking ${type} permission:`, error);
      const status: PermissionStatus = {
        granted: false,
        denied: false,
        prompt: true,
        checking: false,
      };
      setPermissions((prev) => ({
        ...prev,
        [type]: status,
      }));
      return status;
    }
  }, []);

  const requestPermission = useCallback(
    async (
      type: PermissionType,
      showContext = true
    ): Promise<PermissionStatus> => {
      // Mostrar contexto se solicitado
      if (showContext) {
        const context = PERMISSION_CONTEXTS[type];
        toast.info(context.title, {
          description: context.description,
          duration: 5000,
        });
      }

      setPermissions((prev) => ({
        ...prev,
        [type]: { ...prev[type], checking: true },
      }));

      try {
        let status: PermissionStatus;

        if (type === 'location') {
          if (typeof window !== 'undefined' && 'geolocation' in navigator) {
            // Web API - solicitar através de getCurrentPosition
            await new Promise<void>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                () => resolve(),
                (error) => {
                  if (error.code === error.PERMISSION_DENIED) {
                    reject(new Error('Permission denied'));
                  } else {
                    resolve();
                  }
                },
                { timeout: 1000 }
              );
            });
            status = await checkPermission(type);
          } else {
            // Capacitor
            const result = await Geolocation.requestPermissions();
            status = {
              granted: result.location === 'granted',
              denied: result.location === 'denied',
              prompt: result.location === 'prompt',
              checking: false,
            };
          }
        } else {
          // Notifications
          if (typeof window !== 'undefined' && 'Notification' in window) {
            // Web API
            const permission = await Notification.requestPermission();
            status = {
              granted: permission === 'granted',
              denied: permission === 'denied',
              prompt: permission === 'default',
              checking: false,
            };
          } else {
            // Capacitor
            const result = await LocalNotifications.requestPermissions();
            status = {
              granted: result.display === 'granted',
              denied: result.display === 'denied',
              prompt: result.display === 'prompt',
              checking: false,
            };
          }
        }

        setPermissions((prev) => ({
          ...prev,
          [type]: status,
        }));

        if (status.granted) {
          toast.success('Permissão concedida!', {
            description: `${PERMISSION_CONTEXTS[type].icon} ${PERMISSION_CONTEXTS[type].title}`,
          });
        } else if (status.denied) {
          toast.error('Permissão negada', {
            description: 'Você pode habilitar nas configurações do dispositivo.',
          });
        }

        return status;
      } catch (error) {
        console.error(`Error requesting ${type} permission:`, error);
        const status: PermissionStatus = {
          granted: false,
          denied: true,
          prompt: false,
          checking: false,
        };
        setPermissions((prev) => ({
          ...prev,
          [type]: status,
        }));
        toast.error('Erro ao solicitar permissão');
        return status;
      }
    },
    [checkPermission]
  );

  const getPermissionContext = useCallback(
    (type: PermissionType): PermissionContext => {
      return PERMISSION_CONTEXTS[type];
    },
    []
  );

  return {
    permissions,
    checkPermission,
    requestPermission,
    checkAllPermissions,
    getPermissionContext,
  };
};



