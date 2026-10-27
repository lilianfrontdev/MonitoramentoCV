export type BoxClass =
  | "caixa-preta"
  | "caixa-verde"
  | "caixa-azul"
  | "caixa-cinza"
  | "caixa-vermelha"
  | "caixa-fechada";

export type PositionStatus = "thermal" | "unknown" | "empty" | "not_observable";

export type WarehouseStreet = {
  id: string;
  capacity: number;
};

export type InspectionResult = {
  id: number;
  position: string;
  street: string;
  status: PositionStatus;
  classification: string;
  confidence: number | null;
  needsReview: boolean;
  firstFrame: number;
  lastFrame: number;
  detectionCount: number;
  provisionalPosition: boolean;
};
