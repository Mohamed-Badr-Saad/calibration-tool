export interface Instrument {
  _id?: string;
  "Upper Equipment": string;
  Tag: string;
  URV: string;
  LRV: number;
  Unit: string;
  "Valve Size": number;
  "Switch Healthy SP": string;
  "Switch Active SP": string;
  "PCV SP": string;
  "Calibration sheet Form": string;
  Comment: string;
}

export interface Engineer {
  _id?: string;
  name: string;
}

export interface Technician {
  _id?: string;
  name: string;
}

export interface Checklist {
  exInspection: string;
  sensorStatus: string;
  tagInstalled: string;
  cableTagInstalled: string;
  cableGlandFixed: string;
  cablePlugCertified: string;
  earthCableConnected: string;
  terminalsTight: string;
  cableScreenNotConnected: string;
  dcsReading: string;
  housingCondition: string;
}

export interface CalibrationFormData {
  instrumentId: string;
  tag: string;
  type: string; // "Transmitter", "Gauge", "ControlValve", "OnOffValve", "Switch", "PCV", etc.
  rangeFrom: string;
  rangeTo: string;
  unit: string;
  protocol: string;
  flowTx: string;

  // Gauge-specific fields
  gaugeType: string;
  medium: string;
  sensorType: string;
  measuringSystem: string;

  // Control Valve-specific fields
  size: string; // valve size in inches

  // On/Off Valve-specific fields
  valveType: string; // "Sequence", "SDV", "BDV"
  feedbackValueOpen: string;
  feedbackValueClose: string;
  timeOpen: string;
  timeClose: string;

  // Switch-specific fields
  switchType: string; // "Vibration", "Pressure", "Flow", "Level", "Temperature"
  testResultActive: string;
  testResultHealthy: string;
  setPointActive: string;
  setPointHealthy: string;

  // PCV-specific fields
  setPoint: string;
  setPointUnit: string;
  regulatingTarget: string; // "Upstream", "Downstream"
  pcvValveType: string; // "Direct Acting", "Pilot Operated"

  appliedUpscale: string[];
  actualUpscale: string[];
  appliedDownscale: string[];
  actualDownscale: string[];
  checklist: Checklist;
  comments: string;
  createdBy: string;
  verifiedBy: string;
  date: string;
  allHealthy?: boolean;

  lastModified: number;
}

export interface ToleranceSettings {
  _id?: string;
  transmitterTolerance: number;
  gaugeTolerance: number;
  controlValveTolerance: number;
  onOffValveTimeTolerance: number;
  onOffValveFeedbackTolerance: number;
  switchTolerance: number;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id?: string;
  email: string;
  name: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  jobTitle?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

// src/types/index.ts - ADD these types
export interface User {
  _id?: string;
  email: string;
  name: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  createdBy?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}


export interface tolerancesType {
  transmitterTolerance: number;
  gaugeTolerance: number;
  controlValveTolerance: number;
  onOffValveTimeTolerance: number;
  onOffValveFeedbackTolerance: number;
  switchTolerance: number;
  unit: string;
}