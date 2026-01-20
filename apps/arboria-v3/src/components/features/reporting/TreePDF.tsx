
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 10 },
    logoContainer: { flexDirection: 'column' },
    logoText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
    logoSuffix: { color: '#2e7d32' },
    headerTitle: { fontSize: 10, fontWeight: 'bold', marginTop: 5, color: '#333' },
    subtitle: { fontSize: 8, color: '#666' },
    infoBox: { textAlign: 'right' },
    infoText: { fontSize: 9, marginBottom: 2, color: '#555' },
    contentGrid: { flexDirection: 'row', gap: 20, marginBottom: 20 },
    columnLeft: { flex: 1 },
    columnRight: { flex: 1 },
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2e7d32', borderBottomWidth: 2, borderBottomColor: '#4caf50', paddingBottom: 3 },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 6 },
    label: { width: 100, fontWeight: 'bold', color: '#111' },
    value: { flex: 1 },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginTop: 5 },
    badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 10 },
    mainImageContainer: { height: 250, backgroundColor: '#f9f9f9', borderRotate: 1, borderColor: '#eee', borderRadius: 4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    galleryItem: { width: '31%', height: 120, borderRadius: 4, overflow: 'hidden', borderRotate: 1, borderColor: '#eee' },
    footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', color: '#999', fontSize: 8, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 }
});

const getRiskColor = (risk: string) => {
    const r = risk?.toLowerCase() || '';
    if (r.includes('alto') || r.includes('high')) return '#d32f2f';
    if (r.includes('médio') || r.includes('medio') || r.includes('medium')) return '#ff9800';
    return '#4caf50';
};

const RISK_MAP: Record<string, string> = {
    'alto': 'Alto',
    'high': 'Alto',
    'medio': 'Médio',
    'médio': 'Médio',
    'medium': 'Médio',
    'baixo': 'Baixo',
    'low': 'Baixo'
};

export const TreePDF = ({ tree, photos, installationName, mapImage }: any) => {
    const mainPhotoUrl = photos.find((p: any) => p.is_cover)?.url || photos[0]?.url;
    const riskLabel = RISK_MAP[tree.risklevel?.toLowerCase()] || tree.risklevel || 'Baixo';
    const riskColor = getRiskColor(tree.risklevel);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header matching Windows Design */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>
                            Arbor<Text style={styles.logoSuffix}>IA</Text>
                        </Text>
                        <Text style={styles.headerTitle}>Ficha Individual de Árvore</Text>
                        <Text style={styles.subtitle}>{tree.especie || 'Espécie Não Identificada'}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>Instalação: {installationName}</Text>
                        <Text style={styles.infoText}>ID: {tree.codigo || tree.id.substring(0, 8)}</Text>
                        <Text style={styles.infoText}>Emissão: {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</Text>
                    </View>
                </View>

                {/* Content Grid: Photo and Details */}
                <View style={styles.contentGrid}>
                    <View style={styles.columnLeft}>
                        <View style={styles.mainImageContainer}>
                            {mainPhotoUrl ? (
                                <Image src={mainPhotoUrl} style={styles.image} />
                            ) : (
                                <Text style={{ color: '#888' }}>Sem Foto</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.columnRight}>
                        <Text style={styles.sectionTitle}>Dados Dendrométricos</Text>
                        <View style={styles.row}><Text style={styles.label}>DAP:</Text><Text style={styles.value}>{tree.dap ? `${tree.dap} cm` : 'N/A'}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Altura:</Text><Text style={styles.value}>{tree.altura ? `${tree.altura} m` : 'N/A'}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Cadastro:</Text><Text style={styles.value}>{tree.created_at ? format(new Date(tree.created_at), "dd/MM/yyyy") : 'N/A'}</Text></View>
                        <View style={styles.row}><Text style={styles.label}>Localização:</Text><Text style={styles.value}>{tree.local || 'N/A'}</Text></View>

                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Risco Geral:</Text>
                            <View style={[styles.badge, { backgroundColor: riskColor }]}>
                                <Text style={styles.badgeText}>{riskLabel}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Map */}
                {mapImage && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Localização Geográfica</Text>
                        <View style={{ height: 200, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                            <Image src={mapImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </View>
                        <Text style={{ fontSize: 8, marginTop: 4, color: '#666' }}>
                            Lat: {tree.latitude?.toFixed(6)}, Lng: {tree.longitude?.toFixed(6)}
                        </Text>
                    </View>
                )}

                {/* Gallery */}
                {photos.length > 1 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
                        <View style={styles.galleryGrid}>
                            {photos.slice(1, 7).map((photo: any, idx: number) => (
                                <View key={idx} style={styles.galleryItem}>
                                    <Image src={photo.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
            </Page>
        </Document>
    );
};
