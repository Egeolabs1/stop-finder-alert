import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MapPin, Radio, Trash2, Calendar } from 'lucide-react';
import { useAlarmHistory } from '@/hooks/useAlarmHistory';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const History = () => {
  const navigate = useNavigate();
  const { history, isLoading, removeFromHistory, clearHistory, getStatistics } = useAlarmHistory();

  const statistics = getStatistics();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando histórico...</p>
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
            <Clock className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Histórico de Alarmes</h1>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-foreground">{statistics.total}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Hoje</p>
            <p className="text-2xl font-bold text-foreground">{statistics.today}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Esta Semana</p>
            <p className="text-2xl font-bold text-foreground">{statistics.thisWeek}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Este Mês</p>
            <p className="text-2xl font-bold text-foreground">{statistics.thisMonth}</p>
          </Card>
        </div>

        {/* Clear History Button */}
        {history.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
                  clearHistory();
                }
              }}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Histórico
            </Button>
          </div>
        )}

        {/* History List */}
        {history.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              Nenhum alarme no histórico
            </p>
            <p className="text-sm text-muted-foreground">
              Os alarmes ativados aparecerão aqui quando forem acionados.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {history
              .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime())
              .map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Radio className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          {item.destinationName}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {item.destinationAddress}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.triggeredAt)}
                        </span>
                        <span>
                          {formatDistanceToNow(item.triggeredAt, {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Distância: {formatDistance(item.distance)}</span>
                        <span>Raio: {formatDistance(item.radius)}</span>
                        {item.duration !== undefined && (
                          <span>Duração: {item.duration} min</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja remover este item do histórico?')) {
                          removeFromHistory(item.id);
                        }
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

