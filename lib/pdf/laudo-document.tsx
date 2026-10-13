import { Document, Page, Text, View, StyleSheet, Image as PdfImage } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#0f766e',
    paddingBottom: 12,
    marginBottom: 20,
  },
  brand: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0f766e' },
  meta: { fontSize: 9, color: '#555', marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f766e',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 120, color: '#555' },
  value: { flex: 1 },
  paragraph: { lineHeight: 1.5, marginBottom: 6 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  photoWrap: { width: '33.33%', padding: 4 },
  photo: { width: '100%', height: 110, objectFit: 'cover', borderRadius: 4 },
  signatureBox: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 12 },
  signatureImg: { width: 180, height: 60 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
});

type LaudoContent = {
  diagnosis?: string | null;
  solution?: string | null;
  observations?: string | null;
  items?: { label: string; result: string }[];
  photos?: { url: string; caption?: string | null }[];
};

export function LaudoDocument({
  laudo,
  companyName,
}: {
  laudo: {
    code: string;
    title: string;
    createdAt: Date;
    signatureData: string | null;
    signedAt: Date | null;
    content: unknown;
    client: { nomeFantasia: string; addressStreet: string | null; addressNumber: string | null; addressCity: string; addressState: string };
    equipment: { brand: string; model: string; serialNumber: string } | null;
    serviceOrder: { code: string } | null;
  };
  companyName: string;
}) {
  const content = (laudo.content as LaudoContent) || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{companyName}</Text>
            <Text style={styles.meta}>Laudo {laudo.code}{laudo.serviceOrder ? ` · OS ${laudo.serviceOrder.code}` : ''}</Text>
          </View>
          <Text style={styles.meta}>Emitido em {laudo.createdAt.toLocaleDateString('pt-BR')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <Text style={styles.paragraph}>{laudo.client.nomeFantasia}</Text>
          <Text>
            {[laudo.client.addressStreet, laudo.client.addressNumber].filter(Boolean).join(', ')}
            {laudo.client.addressStreet ? ' — ' : ''}
            {laudo.client.addressCity}/{laudo.client.addressState}
          </Text>
        </View>

        {laudo.equipment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipamento</Text>
            <Text>{laudo.equipment.brand} {laudo.equipment.model} — S/N {laudo.equipment.serialNumber}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{laudo.title}</Text>
          {content.diagnosis ? <Text style={styles.paragraph}>Diagnóstico: {content.diagnosis}</Text> : null}
          {content.solution ? <Text style={styles.paragraph}>Solução aplicada: {content.solution}</Text> : null}
          {content.observations ? <Text style={styles.paragraph}>Observações: {content.observations}</Text> : null}
        </View>

        {content.items?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Itens verificados</Text>
            {content.items.map((it, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{it.label}</Text>
                <Text style={styles.value}>{it.result}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {content.photos?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Registro fotográfico — serviço concluído</Text>
            <View style={styles.photosGrid}>
              {content.photos.slice(0, 6).map((p, i) => (
                <View key={i} style={styles.photoWrap}>
                  <PdfImage src={p.url} style={styles.photo} />
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {laudo.signatureData ? (
          <View style={styles.signatureBox}>
            <PdfImage src={laudo.signatureData} style={styles.signatureImg} />
            <Text style={styles.meta}>
              Assinado digitalmente{laudo.signedAt ? ` em ${laudo.signedAt.toLocaleString('pt-BR')}` : ''}.
            </Text>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          {companyName} · Documento gerado automaticamente — {laudo.code}
        </Text>
      </Page>
    </Document>
  );
}
