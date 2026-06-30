import marthaCollins from './martha-collins.json';
import robertKim from './robert-kim.json';
import sarahChen from './sarah-chen.json';

export const patients = [marthaCollins, robertKim, sarahChen];

export const findPatientById = (id) => patients.find(p => p.id === id);
