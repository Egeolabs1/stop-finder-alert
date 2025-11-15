import { AlarmSoundType } from '@/hooks/useSettings';

interface SoundConfig {
  frequency: number;
  type: OscillatorType;
  duration: number;
  gain: number;
  repetitions?: number;
  interval?: number;
}

// Configurações de cada tipo de som
const SOUND_CONFIGS: Record<AlarmSoundType, SoundConfig | SoundConfig[]> = {
  beep: {
    frequency: 800,
    type: 'sine',
    duration: 0.3,
    gain: 0.5,
    repetitions: 3,
    interval: 0.4,
  },
  buzzer: {
    frequency: 440,
    type: 'sawtooth',
    duration: 0.5,
    gain: 0.6,
    repetitions: 2,
    interval: 0.2,
  },
  bell: [
    {
      frequency: 523.25, // C5
      type: 'sine',
      duration: 0.4,
      gain: 0.5,
    },
    {
      frequency: 659.25, // E5
      type: 'sine',
      duration: 0.4,
      gain: 0.4,
    },
    {
      frequency: 783.99, // G5
      type: 'sine',
      duration: 0.6,
      gain: 0.3,
    },
  ],
  alert: {
    frequency: 1000,
    type: 'square',
    duration: 0.2,
    gain: 0.7,
    repetitions: 5,
    interval: 0.15,
  },
  chime: [
    {
      frequency: 523.25, // C5
      type: 'sine',
      duration: 0.3,
      gain: 0.4,
    },
    {
      frequency: 659.25, // E5
      type: 'sine',
      duration: 0.3,
      gain: 0.4,
    },
    {
      frequency: 783.99, // G5
      type: 'sine',
      duration: 0.3,
      gain: 0.4,
    },
    {
      frequency: 1046.50, // C6
      type: 'sine',
      duration: 0.5,
      gain: 0.5,
    },
  ],
};

// Função auxiliar para tocar um único som
const playSingleSound = (
  audioContext: AudioContext,
  config: SoundConfig,
  startTime: number
): void => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = config.frequency;
  oscillator.type = config.type;

  gainNode.gain.setValueAtTime(config.gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + config.duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + config.duration);
};

// Função principal para tocar o som do alarme
export const playAlarmSound = async (soundType: AlarmSoundType): Promise<void> => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('[playAlarmSound] AudioContext não disponível');
      return;
    }

    const audioContext = new AudioContextClass();

    // Retomar o contexto se estiver suspenso
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const currentTime = audioContext.currentTime;
    const config = SOUND_CONFIGS[soundType];

    // Se for um array (sons complexos como bell ou chime)
    if (Array.isArray(config)) {
      let timeOffset = 0;
      config.forEach((soundConfig, index) => {
        playSingleSound(audioContext, soundConfig, currentTime + timeOffset);
        // Para sons sequenciais, adicionar um pequeno delay
        timeOffset += soundConfig.duration + 0.05;
      });
    } else {
      // Se for um único som com repetições
      const { repetitions = 1, interval = 0 } = config;
      
      for (let i = 0; i < repetitions; i++) {
        playSingleSound(audioContext, config, currentTime + i * (config.duration + interval));
      }
    }

    console.log(`[playAlarmSound] Som do tipo "${soundType}" reproduzido`);
  } catch (error) {
    console.error('[playAlarmSound] Erro ao reproduzir som:', error);
  }
};

// Função para obter o nome do som para exibição
export const getAlarmSoundName = (soundType: AlarmSoundType): string => {
  const names: Record<AlarmSoundType, string> = {
    beep: 'Beep',
    buzzer: 'Buzzer',
    bell: 'Sino',
    alert: 'Alerta',
    chime: 'Chime',
  };
  return names[soundType];
};

// Função para obter a descrição do som
export const getAlarmSoundDescription = (soundType: AlarmSoundType): string => {
  const descriptions: Record<AlarmSoundType, string> = {
    beep: '3 beeps curtos',
    buzzer: 'Som de buzina',
    bell: 'Sino harmônico',
    alert: 'Alerta agudo repetido',
    chime: 'Chime suave',
  };
  return descriptions[soundType];
};

