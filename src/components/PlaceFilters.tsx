import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Filter, MapPin } from 'lucide-react';
import { usePlaceFilters } from '@/hooks/usePlaceFilters';
import { PLACE_CATEGORIES, PlaceCategory } from '@/types/places';

const PlaceFilters = () => {
  const {
    filters,
    isLoading,
    updateFilters,
    toggleCategory,
    enableAllCategories,
    disableAllCategories,
  } = usePlaceFilters();

  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground">Carregando filtros...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Filtros de Estabelecimentos
        </h3>
      </div>

      <div className="space-y-4">
        {/* Filtro: Apenas estabelecimentos abertos */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="filterOpenOnly" className="text-sm font-medium">
              Apenas estabelecimentos abertos
            </Label>
            <p className="text-xs text-muted-foreground">
              Mostrar apenas estabelecimentos que estão abertos no momento
            </p>
          </div>
          <Switch
            id="filterOpenOnly"
            checked={filters.filterOpenOnly}
            onCheckedChange={(checked) => updateFilters({ filterOpenOnly: checked })}
          />
        </div>

        {/* Categorias */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Categorias</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={enableAllCategories}
                className="text-xs"
              >
                Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disableAllCategories}
                className="text-xs"
              >
                Nenhuma
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(PLACE_CATEGORIES) as PlaceCategory[]).map((category) => {
              const config = PLACE_CATEGORIES[category];
              const isEnabled = filters.enabledCategories.includes(category);
              return (
                <div
                  key={category}
                  className="flex items-center space-x-2 p-2 rounded-lg border border-border/50"
                >
                  <Checkbox
                    id={category}
                    checked={isEnabled}
                    onCheckedChange={() => toggleCategory(category)}
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm font-normal cursor-pointer flex items-center gap-2 flex-1"
                  >
                    <span>{config.icon}</span>
                    <span>{config.name}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distância máxima */}
        <div className="space-y-2">
          <Label htmlFor="maxDistance" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Distância Máxima
          </Label>
          <Slider
            id="maxDistance"
            value={[filters.maxDistance]}
            onValueChange={(values) => updateFilters({ maxDistance: values[0] })}
            min={500}
            max={10000}
            step={500}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground text-center">
            {filters.maxDistance >= 1000
              ? `${(filters.maxDistance / 1000).toFixed(1)} km`
              : `${filters.maxDistance} m`}
          </p>
        </div>

        {/* Raio de alerta */}
        <div className="space-y-2">
          <Label htmlFor="alertRadius" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Raio de Alerta
          </Label>
          <Slider
            id="alertRadius"
            value={[filters.alertRadius]}
            onValueChange={(values) => updateFilters({ alertRadius: values[0] })}
            min={100}
            max={2000}
            step={100}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground text-center">
            {filters.alertRadius >= 1000
              ? `${(filters.alertRadius / 1000).toFixed(1)} km`
              : `${filters.alertRadius} m`}
          </p>
          <p className="text-xs text-muted-foreground">
            Distância máxima para receber alertas de estabelecimentos próximos
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PlaceFilters;





