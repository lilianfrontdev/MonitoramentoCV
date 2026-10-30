// Define os tipos usados para representar caixas, ruas e posições das inspeções.

// Classificações de caixas reconhecidas pelo modelo de detecção.
export type BoxClass =
  | "caixa-preta"
  | "caixa-verde"
  | "caixa-azul"
  | "caixa-cinza"
  | "caixa-vermelha"
  | "caixa-fechada";

// Estados visuais usados pelo mapa de posições.
export type PositionStatus = "thermal" | "unknown" | "empty" | "not_observable";

// Representa uma caixa normalizada para exibição no mapa e na tabela.
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
