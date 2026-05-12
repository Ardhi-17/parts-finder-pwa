export const BRANDS = [
  {
    key: "KOMATSU",
    name: "Komatsu",
    image: "/brands/komatsu.jpeg",
  },
  {
    key: "SCANIA",
    name: "Scania",
    image: "/brands/scania.jpeg",
  },
  {
    key: "TADANO",
    name: "Tadano",
    image: "/brands/tadano.jpeg",
  },
  {
    key: "BOMAG",
    name: "Bomag",
    image: "/brands/bomag.jpeg",
  },
  {
    key: "UD TRUCKS",
    name: "UD Trucks",
    image: "/brands/ud-trucks.jpeg",
  },
];

export function normalizeBrand(value: string): string {
  const brand = value.trim().toUpperCase();

  if (brand === "UD" || brand === "UD TRUCK" || brand === "UDTRUCKS") {
    return "UD TRUCKS";
  }

  if (brand === "KOMATSU") return "KOMATSU";
  if (brand === "SCANIA") return "SCANIA";
  if (brand === "TADANO") return "TADANO";
  if (brand === "BOMAG") return "BOMAG";
  if (brand === "UD TRUCKS") return "UD TRUCKS";

  return brand;
}

export function detectBrandFromModel(model: string): string {
  const value = model.toUpperCase().trim();

  // SCANIA
  if (
    value.startsWith("SCN") ||
    value.includes("SCANIA") ||
    value.includes("K410") ||
    value.includes("K450")
  ) {
    return "SCANIA";
  }

  // BOMAG
  if (
    value.includes("BOMAG") ||
    value.startsWith("BW") ||
    value.startsWith("BC") ||
    value.startsWith("BF") ||
    value.startsWith("BMP") ||
    value.startsWith("BPR")
  ) {
    return "BOMAG";
  }

  // TADANO
  if (
    value.includes("TADANO") ||
    value.startsWith("GR") ||
    value.startsWith("GT") ||
    value.startsWith("TR") ||
    value.startsWith("ATF") ||
    value.startsWith("AR") ||
    value.startsWith("TG")
  ) {
    return "TADANO";
  }

  // UD TRUCKS
  if (
    value.includes("UD TRUCK") ||
    value.includes("UDTRUCK") ||
    value.startsWith("CWA") ||
    value.startsWith("CWE") ||
    value.startsWith("CWM") ||
    value.startsWith("PK") ||
    value.startsWith("PW") ||
    value.startsWith("QUESTER")
  ) {
    return "UD TRUCKS";
  }

  // KOMATSU
  if (
    value.startsWith("PC") ||
    value.startsWith("HB") ||
    value.startsWith("D") ||
    value.startsWith("GD") ||
    value.startsWith("WA") ||
    value.startsWith("HD") ||
    value.startsWith("HM")
  ) {
    return "KOMATSU";
  }

  return "KOMATSU";
}