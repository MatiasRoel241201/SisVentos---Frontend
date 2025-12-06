/* 
    Formatea una fecha en formato 'es-AR' (Argentina) con día, mes y año.
    @param dateString - La fecha a formatear.
    @returns La fecha formateada.
*/
export const formatEventDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};
