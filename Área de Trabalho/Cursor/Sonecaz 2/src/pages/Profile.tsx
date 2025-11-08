import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Mail, Calendar, Bell, ShoppingCart, Radio, Edit2, Save, X, Clock, History } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, isLoading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [editedEmail, setEditedEmail] = useState(profile.email || '');

  // Atualizar estados quando o perfil carregar
  useEffect(() => {
    if (!isLoading && profile) {
      setEditedName(profile.name);
      setEditedEmail(profile.email || '');
    }
  }, [isLoading, profile]);

  const handleSave = () => {
    updateProfile({
      name: editedName.trim() || 'Usuário',
      email: editedEmail.trim() || undefined,
    });
    setIsEditing(false);
    toast.success('Perfil atualizado!');
  };

  const handleCancel = () => {
    setEditedName(profile.name);
    setEditedEmail(profile.email || '');
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4 pb-safe">
        <div className="max-w-2xl mx-auto flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfil...</p>
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
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Perfil</h1>
          </div>
        </div>

        {/* Avatar e Informações Básicas */}
        <Card className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  onClick={() => {
                    // TODO: Implementar upload de avatar
                    toast.info('Upload de avatar em breve');
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                {profile.email && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="mt-4"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Estatísticas */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Estatísticas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-secondary-foreground">Alarmes Ativados</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{profile.totalAlarms}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-secondary-foreground">Alertas de Compras</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{profile.totalShoppingAlerts}</p>
            </div>
          </div>
        </Card>

        {/* Informações da Conta */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Informações da Conta
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Membro desde</span>
              <span className="text-sm font-medium text-foreground">
                {formatDate(profile.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Última atividade</span>
              <span className="text-sm font-medium text-foreground">
                {formatDate(profile.lastActiveAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Raio favorito</span>
              <span className="text-sm font-medium text-foreground">
                {profile.favoriteRadius >= 1000 
                  ? `${(profile.favoriteRadius / 1000).toFixed(1)} km` 
                  : `${profile.favoriteRadius} m`}
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/history')}
            >
              <History className="w-4 h-4 mr-2" />
              Ver Histórico de Alarmes
            </Button>
          </div>
        </Card>

        {/* Informações */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Dica:</strong> Seu perfil é salvo localmente no seu dispositivo. As estatísticas são atualizadas automaticamente quando você usa o app.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

