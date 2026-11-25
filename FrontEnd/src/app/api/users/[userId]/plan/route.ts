import { NextRequest, NextResponse } from "next/server";
import {
  getBackendApiUrl,
  getBffAuthHeader,
  getBffOrgHeaders,
} from "@/lib/api/serverUtils";
import { error, ERROR_CODES } from "@/lib/api/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const backendUrl = getBackendApiUrl();
    const authHeader = await getBffAuthHeader(request);
    const orgHeaders = getBffOrgHeaders(request);
    const body = await request.json().catch(() => ({}));

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...orgHeaders,
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${backendUrl}/users/${userId}/plan`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ plan: body?.plan }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        error(
          ERROR_CODES.EXTERNAL_ERROR,
          data?.message || "Erro ao atualizar plano do usuário.",
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
