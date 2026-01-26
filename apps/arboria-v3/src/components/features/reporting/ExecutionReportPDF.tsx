
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const styles = StyleSheet.create({
    page: { padding: 30, fontFamily: 'Helvetica', fontSize: 9, color: '#002B36', backgroundColor: '#FFFFFF' },
    
    // Header - ArborIA Unified
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    logoSection: { flexDirection: 'column' },
    brandWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    logoCircle: { width: 24, height: 24, backgroundColor: '#002B36', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    logoDot: { width: 12, height: 12, backgroundColor: '#00E676', borderRadius: 6 },
    logoText: { fontSize: 20, fontWeight: 'bold', color: '#002B36' },
    logoGreen: { color: '#00E676' },
    brandSubtitle: { fontSize: 7, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5 },
    
    headerPill: { backgroundColor: '#15803d', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 4 },
    pillText: { color: '#FFFFFF', fontSize: 8, fontWeight: 'bold' },
    headerDate: { fontSize: 7, color: '#94A3B8', textAlign: 'right', fontWeight: 'bold' },
    
    divider: { height: 2, backgroundColor: '#0F172A', marginBottom: 20 },

    // Sections
    section: { marginBottom: 15 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    sectionIndex: { width: 14, height: 14, backgroundColor: '#0F172A', borderRadius: 7, color: '#FFFFFF', fontSize: 7, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.8 },
    sectionTitle: { fontSize: 9, fontWeight: 'bold', color: '#0F172A', textTransform: 'uppercase', letterSpacing: 1 },

    // Cards
    statusCard: { backgroundColor: '#002B36', borderRadius: 18, padding: 15, marginBottom: 15, color: '#FFFFFF' },
    card: { backgroundColor: '#F8FAFC', borderRadius: 18, padding: 15, marginBottom: 15, borderRotate: 1, borderColor: '#F1F5F9' },
    
    imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
    photoBox: { width: '31%', height: 100, borderRadius: 12, overflow: 'hidden', marginBottom: 5 },
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    photoLabel: { fontSize: 6, color: '#94A3B8', textAlign: 'center', marginTop: 2, textTransform: 'uppercase' },
    
    dataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    dataField: { width: '45%', marginBottom: 6, borderBottomWidth: 0.5, borderBottomColor: '#F1F5F9', paddingBottom: 2 },
    label: { fontSize: 6.5, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 1 },
    value: { fontSize: 8.5, color: '#0F172A', fontWeight: 'bold' },

    footer: { position: 'absolute', bottom: 20, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
    footerText: { fontSize: 7, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
    pageNumberBox: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pageNumberText: { fontSize: 7, color: '#0F172A', fontWeight: 'bold' }
});

export const ExecutionReportPDF = ({ tree, execution, mapImage }: any) => {
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        try {
            return format(new Date(date), "dd/MM/yyyy HH:mm");
        } catch (e) {
            return 'Data inválida';
        }
    };

    const photos = execution.fotos || { antes: [], execucao: [], depois: [] };

    return (
        <Document title={`Relatório de Execução - ${tree.codigo}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        <View style={styles.brandWrapper}>
                            <View style={styles.logoCircle}><View style={styles.logoDot} /></View>
                            <Text style={styles.logoText}>Arbor<Text style={styles.logoGreen}>IA</Text></Text>
                        </View>
                        <Text style={styles.brandSubtitle}>Forestry Intelligence &bull; Relatório de Execução</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <View style={styles.headerPill}><Text style={styles.pillText}>OS #{execution.id}</Text></View>
                        <Text style={styles.headerDate}>EXECUÇÃO: {formatDate(execution.dataEmissao)}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Status Box */}
                <View style={styles.statusCard}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#00E676', marginBottom: 4 }}>AÇÃO: {execution.acao}</Text>
                    <Text style={{ fontSize: 8, opacity: 0.8 }}>Equipe: {execution.equipe}</Text>
                    {execution.diagnostico && (
                        <Text style={{ fontSize: 7.5, marginTop: 6, opacity: 0.9 }}>Diagnóstico: {execution.diagnostico}</Text>
                    )}
                </View>

                {/* Section Ativo */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIndex}>01</Text>
                        <Text style={styles.sectionTitle}>Identificação do Ativo</Text>
                    </View>
                    
                    <View style={styles.card}>
                        <View style={styles.dataGrid}>
                            <View style={styles.dataField}><Text style={styles.label}>Espécie:</Text><Text style={styles.value}>{tree.especie}</Text></View>
                            <View style={styles.dataField}><Text style={styles.label}>Código:</Text><Text style={styles.value}>{tree.codigo}</Text></View>
                            <View style={styles.dataField}><Text style={styles.label}>Localização:</Text><Text style={styles.value}>{tree.localizacao}</Text></View>
                            <View style={styles.dataField}><Text style={styles.label}>Nível de Risco:</Text><Text style={styles.value}>{tree.nivelRisco}</Text></View>
                            <View style={styles.dataField}><Text style={styles.label}>Latitude:</Text><Text style={styles.value}>{tree.latitude ? tree.latitude.toFixed(7) : 'N/A'}</Text></View>
                            <View style={styles.dataField}><Text style={styles.label}>Longitude:</Text><Text style={styles.value}>{tree.longitude ? tree.longitude.toFixed(7) : 'N/A'}</Text></View>
                        </View>
                    </View>
                </View>

                {/* Section Evidências */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIndex}>02</Text>
                        <Text style={styles.sectionTitle}>Evidências Fotográficas</Text>
                    </View>

                    {/* Antes */}
                    <Text style={[styles.label, { marginBottom: 5 }]}>Antes da Intervenção</Text>
                    <View style={styles.imageGrid}>
                        {photos.antes.slice(0, 3).map((url: string, i: number) => (
                            <View key={`antes-${i}`} style={styles.photoBox}>
                                <Image src={url} style={styles.image} />
                            </View>
                        ))}
                        {photos.antes.length === 0 && <Text style={{ fontSize: 7, color: '#94A3B8' }}>Nenhuma foto registrada.</Text>}
                    </View>

                    {/* Durante */}
                    <Text style={[styles.label, { marginBottom: 5, marginTop: 5 }]}>Durante a Execução</Text>
                    <View style={styles.imageGrid}>
                        {photos.execucao.slice(0, 3).map((url: string, i: number) => (
                            <View key={`durante-${i}`} style={styles.photoBox}>
                                <Image src={url} style={styles.image} />
                            </View>
                        ))}
                        {photos.execucao.length === 0 && <Text style={{ fontSize: 7, color: '#94A3B8' }}>Nenhuma foto registrada.</Text>}
                    </View>

                    {/* Depois */}
                    <Text style={[styles.label, { marginBottom: 5, marginTop: 5 }]}>Após a Conclusão</Text>
                    <View style={styles.imageGrid}>
                        {photos.depois.slice(0, 3).map((url: string, i: number) => (
                            <View key={`depois-${i}`} style={styles.photoBox}>
                                <Image src={url} style={styles.image} />
                            </View>
                        ))}
                        {photos.depois.length === 0 && <Text style={{ fontSize: 7, color: '#94A3B8' }}>Nenhuma foto registrada.</Text>}
                    </View>
                </View>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>ArborIA Forestry Intelligence &bull; Relatório Técnico de Campo</Text>
                    <View style={styles.pageNumberBox}>
                        <Text style={styles.pageNumberText} render={({ pageNumber, totalPages }) => `PÁGINA ${pageNumber} / ${totalPages}`} />
                    </View>
                </View>
            </Page>
        </Document>
    );
};
