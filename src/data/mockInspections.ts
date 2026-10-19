import type { InspectionResult, PositionStatus } from "../types/inspections";

export const warehouseStreets = [
  { id: "01", capacity: 6 },
  { id: "02", capacity: 6 },
  { id: "03", capacity: 6 },
  { id: "04", capacity: 6 },
  { id: "05", capacity: 6 },
  { id: "06", capacity: 6 },
];

const classifications: Record<PositionStatus, string> = {
  thermal: "Agrupamento de caixas térmicas",
  unknown: "Volume não identificado",
  empty: "Posição vazia",
  not_observable: "Não observável",
};

const streetPositions: {
  street: string;
  statuses: PositionStatus[];
}[] = [
  {
    street: "A",
    statuses: ["thermal", "thermal", "unknown", "thermal", "empty", "thermal"],
  },
  {
    street: "B",
    statuses: [
      "thermal",
      "thermal",
      "thermal",
      "unknown",
      "empty",
      "not_observable",
    ],
  },
  {
    street: "C",
    statuses: ["thermal", "empty", "thermal", "thermal", "unknown", "thermal"],
  },
  {
    street: "D",
    statuses: [
      "not_observable",
      "thermal",
      "empty",
      "thermal",
      "thermal",
      "unknown",
    ],
  },
];

export const mockResults: InspectionResult[] = streetPositions.flatMap(
  ({ street, statuses }) =>
    statuses.map((status, index) => ({
      position: `${street}-${String(index + 1).padStart(2, "0")}`,
      street,
      status,
      classification: classifications[status],
      confidence: null,
      needsReview: status === "unknown" || status === "not_observable",
    })),
);
