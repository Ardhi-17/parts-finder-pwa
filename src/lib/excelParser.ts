import * as XLSX from "xlsx";
import { Part } from "@/types/part";
import { buildSearchKeywords } from "@/lib/searchParts";
import { detectBrandFromModel } from "@/constants/brands";

export const REQUIRED_COLUMNS = [
  "equipment_model",
  "service_type",
  "part_no",
  "description",
  "qty",
];

export type ExcelValidation = {
  valid: Part[];
  errors: { row: number; message: string }[];
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeBrand(value: unknown, model: string, fallbackText = ""): string {
  const raw = normalizeText(value).toUpperCase();
  const text = `${raw} ${model} ${fallbackText}`.toUpperCase();

  if (raw) return raw;
  if (text.includes("SCANIA") || model.toUpperCase().startsWith("SCN")) {
    return "SCANIA";
  }
  if (text.includes("TADANO")) return "TADANO";
  if (text.includes("BOMAG")) return "BOMAG";
  if (text.includes("UD TRUCKS") || text.includes("UDTRUCKS")) return "UD TRUCKS";

  return detectBrandFromModel(model);
}

function looksLikeService(value: unknown): boolean {
  const text = normalizeText(value).toUpperCase();

  if (!text) return false;

  return (
    /^PS\s*\d+/.test(text) ||
    text.includes("PS ") ||
    text.includes("SERVICE S") ||
    text.includes("SERVICE M") ||
    text.includes("SERVICE L") ||
    text.includes("SERVICE")
  );
}

function looksLikeHeaderRow(row: unknown[]): boolean {
  const joined = row.map((cell) => normalizeText(cell).toLowerCase()).join(" ");

  return (
    joined.includes("part no") ||
    joined.includes("description") ||
    joined.includes("qty")
  );
}

function makeDuplicateKey(part: Part): string {
  return [
    part.brand || "",
    part.equipment_model,
    part.service_type,
    part.part_no,
    part.description,
  ]
    .join("__")
    .toUpperCase()
    .trim();
}

function makePart(part: Omit<Part, "id" | "search_keywords"> & { id?: string }): Part {
  const finalPart: Part = {
    id: part.id || crypto.randomUUID(),
    brand: part.brand,
    equipment_model: part.equipment_model,
    service_type: part.service_type,
    part_no: part.part_no,
    description: part.description,
    qty: String(part.qty),
    remark: part.remark || "",
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  finalPart.search_keywords = buildSearchKeywords(finalPart);

  return finalPart;
}

function parseMasterPartsSheet(workbook: XLSX.WorkBook): ExcelValidation {
  const sheet = workbook.Sheets["MASTER_PARTS"];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const valid: Part[] = [];
  const errors: { row: number; message: string }[] = [];
  const seen = new Set<string>();

  rows.forEach((row, index) => {
    const rowNum = index + 2;

    const normalizedRow: Record<string, unknown> = {};

    Object.entries(row).forEach(([key, value]) => {
      normalizedRow[normalizeHeader(key)] = value;
    });

    const missing = REQUIRED_COLUMNS.filter(
      (col) => !normalizeText(normalizedRow[col])
    );

    if (missing.length) {
      errors.push({
        row: rowNum,
        message: `Kolom wajib kosong: ${missing.join(", ")}`,
      });
      return;
    }

    const equipmentModel = normalizeText(normalizedRow.equipment_model);
    const serviceType = normalizeText(normalizedRow.service_type);
    const partNo = normalizeText(normalizedRow.part_no);
    const description = normalizeText(normalizedRow.description);
    const qty = normalizeText(normalizedRow.qty);
    const remark = normalizeText(normalizedRow.remark);
    const brand = normalizeBrand(normalizedRow.brand, equipmentModel);

    if (!qty) {
      errors.push({
        row: rowNum,
        message: "Qty wajib diisi",
      });
      return;
    }

    const part = makePart({
      id: normalizeText(normalizedRow.id) || undefined,
      brand,
      equipment_model: equipmentModel,
      service_type: serviceType,
      part_no: partNo,
      description,
      qty,
      remark,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

    const key = makeDuplicateKey(part);

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    valid.push(part);
  });

  return { valid, errors };
}

function parseOriginalMultiSheetWorkbook(workbook: XLSX.WorkBook): ExcelValidation {
  const valid: Part[] = [];
  const errors: { row: number; message: string }[] = [];
  const seen = new Set<string>();

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
    });

    const equipmentModel = sheetName.trim();
    const titleText = rows
      .slice(0, 5)
      .flat()
      .map((cell) => normalizeText(cell))
      .join(" ");

    const brand = normalizeBrand("", equipmentModel, titleText);

    let currentService = "";

    rows.forEach((row, index) => {
      const rowNum = index + 1;

      const cells = row.map((cell) => normalizeText(cell));
      const firstCell = cells[0] || "";
      const secondCell = cells[1] || "";
      const thirdCell = cells[2] || "";
      const fourthCell = cells[3] || "";
      const fifthCell = cells[4] || "";

      const serviceCandidate = cells.find((cell) => looksLikeService(cell));

      if (
        serviceCandidate &&
        !looksLikeHeaderRow(row) &&
        !secondCell.toLowerCase().includes("part no") &&
        !thirdCell.toLowerCase().includes("description") &&
        cells.filter(Boolean).length <= 3
      ) {
        currentService = serviceCandidate.trim();
        return;
      }

      if (looksLikeHeaderRow(row)) {
        return;
      }

      const partNo = secondCell;
      const description = thirdCell;
      const qty = fourthCell;
      const remark = fifthCell;

      const isNumberedPartRow = Boolean(firstCell) && Boolean(partNo) && Boolean(description);
      const isPartRowWithoutNumber = Boolean(partNo) && Boolean(description) && Boolean(qty);

      if (!isNumberedPartRow && !isPartRowWithoutNumber) {
        return;
      }

      if (!currentService && looksLikeService(remark)) {
        currentService = remark;
      }

      if (!currentService) {
        errors.push({
          row: rowNum,
          message: `Service belum terbaca pada sheet ${sheetName}`,
        });
        return;
      }

      if (!qty) {
        errors.push({
          row: rowNum,
          message: `Qty kosong pada sheet ${sheetName}`,
        });
        return;
      }

      const part = makePart({
        brand,
        equipment_model: equipmentModel,
        service_type: currentService,
        part_no: partNo,
        description,
        qty,
        remark,
        is_active: true,
        updated_at: new Date().toISOString(),
      });

      const key = makeDuplicateKey(part);

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      valid.push(part);
    });
  });

  return { valid, errors };
}

export async function parsePartsExcel(file: File): Promise<ExcelValidation> {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data, {
    type: "array",
    cellDates: false,
    cellText: false,
  });

  if (workbook.SheetNames.includes("MASTER_PARTS")) {
    return parseMasterPartsSheet(workbook);
  }

  return parseOriginalMultiSheetWorkbook(workbook);
}