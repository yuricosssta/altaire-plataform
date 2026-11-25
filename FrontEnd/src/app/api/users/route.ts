import { NextRequest, NextResponse } from "next/server";
import {
  getBackendApiUrl,
  getBffAuthHeader,
  getBffOrgHeaders,
} from "@/lib/api/serverUtils";
import { error, ERROR_CODES } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = getBackendApiUrl();
    const authHeader = await getBffAuthHeader(request);
    const orgHeaders = getBffOrgHeaders(request);

    const headers: Record<string, string> = {
      ...orgHeaders,
      Accept: "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${backendUrl}/users`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        error(
          ERROR_CODES.EXTERNAL_ERROR,
          data?.message || "Erro ao listar usuários.",
        ),
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Falha ao conectar com o backend.";
    return NextResponse.json(error(ERROR_CODES.INTERNAL_ERROR, message), {
      status: 502,
    });
  }
}
