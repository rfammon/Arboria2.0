
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Register a standard font if needed, otherwise use built-in Helvetica
// Font.register({ family: 'Roboto', src: 'path/to/font.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#166534', // green-800
    },
    subtitle: {
        fontSize: 10,
        color: '#666',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#15803d', // green-700
        borderBottomWidth: 0.5,
        borderBottomColor: '#CCC',
        paddingBottom: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 10,
    },
    statBox: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0fdf4', // green-50
        borderRadius: 4,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#166534',
    },
    statLabel: {
        fontSize: 8,
        color: '#555',
    },
    chartRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        height: 200,
        marginBottom: 15,
    },
    chartContainer: {
        flex: 1,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#e5e7eb',
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        width: '20%', // Default width
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#e5e7eb',
        padding: 5,
    },
    tableHeader: {
        backgroundColor: '#f9fafb',
        fontWeight: 'bold',
    },
    colId: { width: '20%' },
    colSpecie: { width: '25%' },
    colDap: { width: '10%' },
    colHeight: { width: '10%' },
    colRisk: { width: '15%' },
    colPhoto: { width: '20%' },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
    }
});

interface TreeData {
    id: string;
    especie: string;
    dap: number;
    altura: number;
    risco: string;
    photoUrl?: string; // New field for photo
}

interface ReportStats {
    totalTrees: number;
    totalSpecies: number;
    avgDap: number;
    avgHeight: number;
    highRiskCount: number;
}

interface PDFReportProps {
    installationName: string;
    stats: ReportStats;
    chartsImages?: {
        risk: string;
        species: string;
    };
    mapImage?: string;
    trees: TreeData[];
}

export const PDFReport = ({ installationName, stats, chartsImages, mapImage, trees }: PDFReportProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header with Logo */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'column' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>
                        Arbor<Text style={{ color: '#2e7d32' }}>IA</Text>
                    </Text>
                    <Text style={[styles.title, { fontSize: 14, marginTop: 4 }]}>Relatório de Inventário</Text>
                    <Text style={styles.subtitle}>{installationName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.subtitle}>Gerado em: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</Text>
                    <Text style={styles.subtitle}>Documento Oficial</Text>
                </View>
            </View>

            {/* Executive Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumo Executivo</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.totalTrees}</Text>
                        <Text style={styles.statLabel}>Total Árvores</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.highRiskCount}</Text>
                        <Text style={styles.statLabel}>Alto Risco</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.totalSpecies}</Text>
                        <Text style={styles.statLabel}>Espécies Distintas</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.avgDap.toFixed(1)} cm</Text>
                        <Text style={styles.statLabel}>DAP Médio</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.avgHeight.toFixed(1)} m</Text>
                        <Text style={styles.statLabel}>Altura Média</Text>
                    </View>
                </View>
            </View>

            {/* Charts Section (Images captured from DOM) */}
            {(chartsImages?.risk || chartsImages?.species) && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Análise Gráfica</Text>
                    <View style={styles.chartRow}>
                        {chartsImages.risk && (
                            <View style={styles.chartContainer}>
                                <Text style={{ marginBottom: 5, fontSize: 8 }}>Distribuição de Risco</Text>
                                <Image src={chartsImages.risk} style={styles.image} />
                            </View>
                        )}
                        {chartsImages.species && (
                            <View style={styles.chartContainer}>
                                <Text style={{ marginBottom: 5, fontSize: 8 }}>Top 5 Espécies</Text>
                                <Image src={chartsImages.species} style={styles.image} />
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Map Section */}
            {mapImage && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mapa de Localização</Text>
                    <View style={{ height: 250, width: '100%', backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                        <Image src={mapImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </View>
                </View>
            )}

            {/* Footer for first page */}
            <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                `${pageNumber} / ${totalPages}`
            )} fixed />
        </Page>

        {/* Tree Inventory Table Page */}
        <Page size="A4" style={styles.page}>
            <Text style={styles.sectionTitle}>Detalhamento do Inventário</Text>

            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCol, styles.colId]}>ID / Ref</Text>
                <Text style={[styles.tableCol, styles.colSpecie]}>Espécie</Text>
                <Text style={[styles.tableCol, styles.colDap]}>DAP (cm)</Text>
                <Text style={[styles.tableCol, styles.colHeight]}>Alt (m)</Text>
                <Text style={[styles.tableCol, styles.colRisk]}>Risco</Text>
                <Text style={[styles.tableCol, styles.colPhoto]}>Foto</Text>
            </View>

            {/* Table Rows */}
            {trees.map((tree, i) => (
                <View key={tree.id} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb', alignItems: 'center' }]}>
                    <Text style={[styles.tableCol, styles.colId]}>{tree.id.slice(0, 8)}</Text>
                    <Text style={[styles.tableCol, styles.colSpecie]}>{tree.especie || 'Não Identificada'}</Text>
                    <Text style={[styles.tableCol, styles.colDap]}>{tree.dap || '-'}</Text>
                    <Text style={[styles.tableCol, styles.colHeight]}>{tree.altura || '-'}</Text>
                    <Text style={[styles.tableCol, styles.colRisk]}>{tree.risco || '-'}</Text>
                    <View style={[styles.tableCol, styles.colPhoto, { padding: 2 }]}>
                        {tree.photoUrl ? (
                            <Image src={tree.photoUrl} style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 2 }} />
                        ) : (
                            <Text style={{ fontSize: 6, color: '#999', textAlign: 'center' }}>Sem foto</Text>
                        )}
                    </View>
                </View>
            ))}

            <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                `${pageNumber} / ${totalPages}`
            )} fixed />
        </Page>
    </Document>
);
