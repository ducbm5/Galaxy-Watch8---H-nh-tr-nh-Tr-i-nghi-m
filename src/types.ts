export enum Step {
  INFO_FORM = "INFO_FORM",
  RUNNING_COACH = "RUNNING_COACH",
  ANTIOXIDANT = "ANTIOXIDANT",
  BIA_ANALYSIS = "BIA_ANALYSIS",
  SUBMIT_PAGE = "SUBMIT_PAGE",
  SUCCESS_PAGE = "SUCCESS_PAGE"
}

export interface SubmissionLog {
  timestamp: string;
  name: string;
  phone: string;
  status: string;
  remoteStatus: "success" | "simulated" | "failed";
  errorMessage: string | null;
}

export interface AppConfig {
  gasUrl: string;
  logs: SubmissionLog[];
}
