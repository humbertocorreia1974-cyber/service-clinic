export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Cadastro público desabilitado. Peça acesso a um administrador do Service Clinic." },
    { status: 403 }
  );
}
