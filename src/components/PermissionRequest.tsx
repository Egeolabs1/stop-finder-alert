import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePermissions, PermissionType } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

interface PermissionRequestProps {
  type: PermissionType;
  open: boolean;
  onClose: () => void;
  onGranted?: () => void;
}

export function PermissionRequest({
  type,
  open,
  onClose,
  onGranted,
}: PermissionRequestProps) {
  const { permissions, requestPermission, getPermissionContext } = usePermissions();
  const context = getPermissionContext(type);
  const status = permissions[type];

  const handleRequest = async () => {
    const result = await requestPermission(type, false);
    if (result.granted && onGranted) {
      onGranted();
    }
    if (result.granted || result.denied) {
      onClose();
    }
  };

  const getStatusIcon = () => {
    if (status.granted) return <CheckCircle2 className="w-6 h-6 text-success" />;
    if (status.denied) return <XCircle className="w-6 h-6 text-destructive" />;
    return <AlertCircle className="w-6 h-6 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (status.granted) return 'Permissão concedida';
    if (status.denied) return 'Permissão negada';
    return 'Permissão não solicitada';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {context.icon} {context.title}
          </DialogTitle>
          <DialogDescription>{context.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status atual */}
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
              </div>
            </div>
          </Card>

          {/* Por que é necessário */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Por que isso é necessário?</p>
                <p className="text-sm text-muted-foreground">{context.whyNeeded}</p>
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          {type === 'location' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Sua localização é processada apenas localmente no dispositivo</p>
              <p>• Não compartilhamos sua localização com terceiros</p>
              <p>• Você pode desativar a localização a qualquer momento nas configurações</p>
            </div>
          )}

          {type === 'notifications' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Notificações são enviadas apenas quando alarmes são acionados</p>
              <p>• Você pode desativar notificações a qualquer momento nas configurações</p>
              <p>• Não enviamos notificações promocionais ou spam</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {!status.granted && (
            <Button onClick={handleRequest} disabled={status.checking}>
              {status.denied ? 'Abrir Configurações' : 'Conceder Permissão'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



