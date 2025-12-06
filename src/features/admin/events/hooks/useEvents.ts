import { useQuery } from '@tanstack/react-query';
import { eventsService } from '../services/events.service';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => eventsService.getAll(),
  });
};

export const useActiveEvents = () => {
  return useQuery({
    queryKey: ['events', 'active'],
    queryFn: () => eventsService.getActive(),
  });
};

export const useEventStats = (eventId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['eventStatistics', eventId],
    queryFn: () => eventsService.getStats(eventId),
    enabled: enabled && !!eventId,
  });
};
