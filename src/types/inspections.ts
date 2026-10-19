export type PositionStatus =
  | 'thermal'
  | 'unknown'
  | 'empty'
  | 'not_observable'

export type InspectionResult = {
  position: string
  street: string
  status: PositionStatus
  classification: string
  confidence: number | null
  needsReview: boolean
}