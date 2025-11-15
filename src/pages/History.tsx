import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MapPin, Radio, Trash2, Calendar } from 'lucide-react';
import { useAlarmHistory } from '@/hooks/useAlarmHistory';
import { VirtualizedList } from '@/components/VirtualizedList';
import { useTranslation } from '@/hooks/useTranslation';
import { formatRelativeTime, formatDate, formatDistance as formatDistanceUtil } from '@/utils/i18n';

const History = () => {
  const navigate = useNavigate();
  const { history, isLoading, removeFromHistory, clearHistory, getStatistics } = useAlarmHistory();
  const { t, language } = useTranslation();

  const statistics = getStatistics();
  
  // Memoizar histórico ordenado para virtualização
  const sortedHistory = useMemo(() => 
    [...history].sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime()),
    [history]
  );

  const formatDistance = (meters: number) => {
    return formatDistanceUtil(meters, language);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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
            {t('common.back')}
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">{t('history.title')}</h1>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t('history.total')}</p>
            <p className="text-2xl font-bold text-foreground">{statistics.total}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t('history.today')}</p>
            <p className="text-2xl font-bold text-foreground">{statistics.today}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t('history.thisWeek')}</p>
            <p className="text-2xl font-bold text-foreground">{statistics.thisWeek}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t('history.thisMonth')}</p>
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
                if (confirm(t('history.clearConfirm'))) {
                  clearHistory();
                }
              }}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('history.clear')}
            </Button>
          </div>
        )}

        {/* History List - usando VirtualizedList para melhor performance */}
        {history.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              {t('history.empty')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('history.emptyDesc')}
            </p>
          </Card>
        ) : (
          <VirtualizedList
            items={sortedHistory}
            itemHeight={120}
            containerHeight={600}
            getItemKey={(item) => item.id}
            renderItem={(item, index) => (
              <Card className="p-4 m-2">
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
                        {formatDate(item.triggeredAt, language, {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>{formatRelativeTime(item.triggeredAt, language)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{t('alarm.distance')}: {formatDistance(item.distance)}</span>
                      <span>{t('alarm.radius')}: {formatDistance(item.radius)}</span>
                      {item.duration !== undefined && (
                        <span>{t('history.duration')}: {item.duration} {t('history.min')}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(t('history.removeConfirm'))) {
                        removeFromHistory(item.id);
                      }
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default History;
