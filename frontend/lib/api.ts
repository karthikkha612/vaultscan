export type RiskLevel = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Finding {
  title: string;
  description: string;
  risk_level: RiskLevel;
  recommendation: string;
  points_deducted?: number;
}

export interface ScanResponse {
  target: string;
  scan_type: "url" | "github";
  overall_score: number;
  risk_level: RiskLevel;
  findings: Finding[];
  scanned_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const REQUEST_TIMEOUT = 30000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponse(response: Response): Promise<ScanResponse> {
  if (!response.ok) {
    let errorMessage = `Server error (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage =
          typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData.detail);
      }
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data || typeof data.overall_score !== "number") {
    throw new Error("Invalid response from server");
  }

  return data as ScanResponse;
}

export async function scanURL(url: string): Promise<ScanResponse> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/scan/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Scan timed out after 30 seconds");
      }
      if (error.message.includes("fetch")) {
        throw new Error(
          "Network error: Could not connect to the scanner API. Is the backend running?"
        );
      }
      throw error;
    }
    throw new Error("An unexpected error occurred during the scan");
  }
}

export async function scanGithub(repoUrl: string): Promise<ScanResponse> {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/scan/github`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
      }
    );
    return handleResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Scan timed out after 30 seconds");
      }
      if (error.message.includes("fetch")) {
        throw new Error(
          "Network error: Could not connect to the scanner API. Is the backend running?"
        );
      }
      throw error;
    }
    throw new Error("An unexpected error occurred during the scan");
  }
}

export function isGithubUrl(input: string): boolean {
  return /github\.com\/[^/]+\/[^/]+/.test(input.trim());
}

export function isValidUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  if (isGithubUrl(trimmed)) return true;

  try {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(url);
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

const STORAGE_KEY = "vaultscan_history";
const LATEST_KEY = "vaultscan_latest";

export function saveScanResult(result: ScanResponse): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(LATEST_KEY, JSON.stringify(result));

    const existing = getScanHistory();
    const updated = [result, ...existing.filter((s) => s.target !== result.target)].slice(
      0,
      50
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable
  }
}

export function getLatestScan(): ScanResponse | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(LATEST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ScanResponse;
  } catch {
    return null;
  }
}

export function getScanHistory(): ScanResponse[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanResponse[];
  } catch {
    return [];
  }
}

export function clearScanHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LATEST_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

export function setLatestScan(result: ScanResponse): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(LATEST_KEY, JSON.stringify(result));
  } catch {
    // localStorage may be unavailable
  }
}
