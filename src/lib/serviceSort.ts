function getServiceNumber(service: string): number {
  const match = service.match(/\d+/);
  return match ? Number(match[0]) : 999999;
}

function getServicePriority(service: string): number {
  const value = service.toUpperCase();

  if (value.includes("SERVICE S")) return 1;
  if (value.includes("SERVICE M")) return 2;
  if (value.includes("SERVICE L")) return 3;
  if (value.includes("PS")) return 4;

  return 99;
}

export function sortServiceTypes(a: string, b: string) {
  const priorityA = getServicePriority(a);
  const priorityB = getServicePriority(b);

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  const numberA = getServiceNumber(a);
  const numberB = getServiceNumber(b);

  if (numberA !== numberB) {
    return numberA - numberB;
  }

  return a.localeCompare(b);
}