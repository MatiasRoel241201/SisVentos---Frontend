import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../services/events.service';
import { UpdateEventDto } from '../types';

export const useEvents = () => {
    return useQuery({
        queryKey: ['events'],
        queryFn: () => eventsService.getAll(),
    });
};

export const useEvent = (eventId: string) => {
    return useQuery({
        queryKey: ['events', eventId],
        queryFn: () => eventsService.getOne(eventId),
        enabled: !!eventId,
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

export const useEventMutations = () => {
    const queryClient = useQueryClient();

    const createEvent = useMutation({
        mutationFn: eventsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    const updateEvent = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) => eventsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    const deleteEvent = useMutation({
        mutationFn: eventsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    return {
        createEvent,
        updateEvent,
        deleteEvent,
    };
};
