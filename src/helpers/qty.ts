/* 
    Formatea una cantidad para mostrarla en el frontend.
    @param qty - La cantidad a formatear.
    @returns La cantidad formateada.
*/
export const formatQty = (qty: number): string => {
    return qty.toString().split(".")[0];
};