import { NextResponse } from 'next/server';
import { getErrorMessage, getErrorStack } from '@/lib/error-info';

export async function POST(request: Request) {
  try {
  const { message } = await request.json();
  const response = await fetch(`${process.env.JGNEXT_API_BASE_URL}/api/v1/embedded-chatbot/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.JGNEXT_CHATBOT_TOKEN}`,
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  return NextResponse.json({ reply: data.reply });

  } catch (__jgnextApiErrorReportErr) {
    // __jgnextApiErrorReport — reparo automático de runtime (ver runtimeErrorGate.js)
    try {
      const { reportRuntimeError } = await import('@/lib/runtime-error-reporter');
      await reportRuntimeError({
        type: 'server',
        file: "app/api/chat/route.ts",
        message: getErrorMessage(__jgnextApiErrorReportErr),
        stack: getErrorStack(__jgnextApiErrorReportErr),
      });
    } catch (__jgnextApiErrorReportReportErr) { /* relatar erro nunca pode gerar outro erro */ }
    throw __jgnextApiErrorReportErr;
  }
}
