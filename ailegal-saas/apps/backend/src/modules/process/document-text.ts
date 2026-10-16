import { readFile, rm } from 'node:fs/promises';
import mammoth from 'mammoth';

export class DocumentReadError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}

// Owns the uploaded file and releases it even when parsing fails.
export async function extractUploadedDocumentText(file: {
  path: string;
  originalname: string;
  mimetype: string;
}): Promise<string> {
  try {
    const name = file.originalname.toLowerCase();
    let text: string;
    if (file.mimetype === 'application/pdf' || name.endsWith('.pdf')) {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: await readFile(file.path) });
      try {
        text = (await parser.getText({ pageJoiner: '' })).text;
      } finally {
        await parser.destroy();
      }
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) {
      text = (await mammoth.extractRawText({ path: file.path })).value;
    } else {
      throw new DocumentReadError('Formato não suportado. Envie PDF ou DOCX.', 400);
    }
    if (!text.trim()) {
      throw new DocumentReadError('O arquivo não contém texto legível. Verifique se não é um PDF escaneado.', 422);
    }
    return text;
  } finally {
    await rm(file.path, { force: true });
  }
}
