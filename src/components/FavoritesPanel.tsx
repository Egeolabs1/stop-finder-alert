import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Home, 
  Briefcase, 
  MapPin, 
  Star, 
  Heart, 
  Flag, 
  X, 
  Clock,
  MoreVertical,
  Trash2,
  Edit2
} from 'lucide-react';
import { useFavorites, FavoriteDestination } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FavoritesPanelProps {
  onSelectFavorite: (favorite: FavoriteDestination) => void;
  onEditFavorite?: (favorite: FavoriteDestination) => void;
  className?: string;
}

const iconMap = {
  home: Home,
  briefcase: Briefcase,
  'map-pin': MapPin,
  star: Star,
  heart: Heart,
  flag: Flag,
};

const FavoritesPanel = ({ 
  onSelectFavorite, 
  onEditFavorite,
  className 
}: FavoritesPanelProps) => {
  const { favorites, removeFavorite, getMostUsedFavorites } = useFavorites();
  const [showAll, setShowAll] = useState(false);

  const mostUsed = getMostUsedFavorites(5);
  const displayFavorites = showAll ? favorites : mostUsed;

  const getIcon = (iconName?: string) => {
    const IconComponent = iconName && iconName in iconMap 
      ? iconMap[iconName as keyof typeof iconMap]
      : MapPin;
    return IconComponent;
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  };

  if (favorites.length === 0) {
    return (
      <Card className={cn("p-4 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          Nenhum favorito salvo. Use o botão de salvar ao definir um destino.
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          Favoritos
        </h3>
        {favorites.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs"
          >
            {showAll ? 'Ver menos' : `Ver todos (${favorites.length})`}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {displayFavorites.map((favorite) => {
          const IconComponent = getIcon(favorite.icon);
          return (
            <div
              key={favorite.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
              onClick={() => onSelectFavorite(favorite)}
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  favorite.color 
                    ? `bg-${favorite.color}-100 dark:bg-${favorite.color}-900/30`
                    : "bg-primary/10"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-5 h-5",
                    favorite.color
                      ? `text-${favorite.color}-600 dark:text-${favorite.color}-400`
                      : "text-primary"
                  )}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {favorite.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {favorite.address}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(favorite.lastUsedAt)}
                  </span>
                  {favorite.useCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {favorite.useCount}x
                    </span>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFavorite(favorite);
                    }}
                  >
                    Usar
                  </DropdownMenuItem>
                  {onEditFavorite && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditFavorite(favorite);
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Tem certeza que deseja remover este favorito?')) {
                        removeFavorite(favorite.id);
                      }
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default FavoritesPanel;

