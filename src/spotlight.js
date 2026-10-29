export const keyForTrip = trip => `${trip.start}/${trip.end}`;
export function spotlightIndex(trips,key){
 if(!trips.length)return -1;
 const match=trips.findIndex(trip=>keyForTrip(trip)===key);
 if(match>=0)return match;
 const paid=trips.findIndex(trip=>trip.leave.length>0);
 return paid>=0?paid:0;
}
export function tripPitch(trip){
 const weekday=date=>new Intl.DateTimeFormat('ms-MY',{weekday:'long',timeZone:'UTC'}).format(new Date(date));
 const specific=date=>new Intl.DateTimeFormat('ms-MY',{weekday:'long',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(date));
 const leave=trip.leave.length===0?'Tak perlu guna cuti tahunan':trip.leave.length===1?`Ambil cuti pada ${specific(trip.leave[0])}`:`Guna ${trip.leave.length} hari cuti tahunan`;
 return `${leave} → rehat dari ${weekday(trip.start)} hingga ${weekday(trip.end)} (${trip.total} hari).`;
}
export function spotlightBalance(trip,selected,budget){
 const remaining=budget-selected.reduce((sum,t)=>sum+t.leave.length,0);
 const chosen=selected.some(t=>keyForTrip(t)===keyForTrip(trip));
 return {chosen,remaining,after:remaining-(chosen?0:trip.leave.length)};
}
