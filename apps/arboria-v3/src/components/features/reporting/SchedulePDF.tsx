
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: '#333', backgroundColor: '#FFFFFF' },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1.5, borderBottomColor: '#000', paddingBottom: 10 },
    logoContainer: { flexDirection: 'column' },
    logoText: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    logoSuffix: { color: '#2e7d32' },
    headerTitle: { fontSize: 10, fontWeight: 'bold', marginTop: 4, color: '#555' },
    subtitle: { fontSize: 12, color: '#333', fontWeight: 'bold', textTransform: 'uppercase' },
    infoBox: { textAlign: 'right' },
    infoText: { fontSize: 8, marginBottom: 2, color: '#666' },

    // Sections
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 10, color: '#2e7d32', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#BBB', paddingBottom: 3 },

    // Table
    table: { width: '100%', marginTop: 5 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderBottomWidth: 2, borderBottomColor: '#ddd', padding: 6 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 6, alignItems: 'center' },
    headerCell: { fontWeight: 'bold', fontSize: 8 },
    cell: { fontSize: 8 },

    // Status Badges
    badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, alignSelf: 'flex-start' },
    badgeText: { fontSize: 7, fontWeight: 'bold' },

    // Status Colors (matching Reference)
    badgeSuccess: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
    badgePending: { backgroundColor: '#fff3e0', color: '#ef6c00' },

    // Footer
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#AAA', fontSize: 7, borderTopWidth: 0.5, borderTopColor: '#EEE', paddingTop: 8 }
});

const STATUS_MAP: Record<string, string> = {
    'draft': 'Rascunho', 'pending': 'Pendente', 'approved': 'Aprovado',
    'in_progress': 'Em Andamento', 'completed': 'Concluído', 'concluido': 'Concluído',
    'cancelled': 'Cancelado', 'rejected': 'Rejeitado'
};

const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (['concluido', 'completed', 'approved'].includes(s)) return styles.badgeSuccess;
    return styles.badgePending;
};

export const SchedulePDF = ({ plans, installationName, ganttImage }: any) => {
    // Sort plans by date
    const sortedPlans = [...plans].sort((a, b) => {
        const dateA = new Date(a.schedule?.start || a.schedule?.startDate || 0).getTime();
        const dateB = new Date(b.schedule?.start || b.schedule?.startDate || 0).getTime();
        return dateA - dateB;
    });

    return (
        <Document title={`Cronograma de Intervenções - ${format(new Date(), "dd-MM-yyyy")}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>Arbor<Text style={styles.logoSuffix}>IA</Text></Text>
                        <Text style={styles.headerTitle}>Cronograma de Intervenções</Text>
                        <Text style={styles.subtitle}>Visão Geral de Execução</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>Instalação: {installationName}</Text>
                        <Text style={styles.infoText}>Data de Emissão: {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</Text>
                        <Text style={styles.infoText}>Total: {plans.length} intervenções programadas</Text>
                    </View>
                </View>

                {/* Section 1: Gantt Chart Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Visão Geral do Cronograma</Text>
                    {ganttImage ? (
                        <View style={{ width: '100%', height: 240, borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingBottom: 5 }}>
                            <Image src={ganttImage} style={{ width: '100%', height: '100%' }} />
                        </View>
                    ) : (
                        <View style={{ height: 100, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', borderRadius: 4 }}>
                            <Text style={{ color: '#999', fontSize: 10 }}>Gráfico Gantt não disponível</Text>
                        </View>
                    )}
                </View>

                {/* Section 2: Detailed Table */}
                <View style={[styles.section, { flex: 1 }]}>
                    <Text style={styles.sectionTitle}>Detalhamento das Intervenções</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerCell, { width: '5%' }]}>#</Text>
                            <Text style={[styles.headerCell, { width: '15%' }]}>Data Início</Text>
                            <Text style={[styles.headerCell, { width: '15%' }]}>Data Fim</Text>
                            <Text style={[styles.headerCell, { width: '15%' }]}>ID Plano</Text>
                            <Text style={[styles.headerCell, { width: '15%' }]}>Tipo</Text>
                            <Text style={[styles.headerCell, { width: '20%' }]}>Árvore</Text>
                            <Text style={[styles.headerCell, { width: '15%' }]}>Status</Text>
                        </View>

                        {/* Table Rows */}
                        {sortedPlans.map((plan: any, index: number) => {
                            const start = plan.schedule?.start || plan.schedule?.startDate;
                            const end = plan.schedule?.end || plan.schedule?.endDate;
                            const statusStyle = getStatusStyle(plan.status);

                            return (
                                <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }]} wrap={false}>
                                    <Text style={[styles.cell, { width: '5%', fontWeight: 'bold' }]}>{index + 1}</Text>
                                    <Text style={[styles.cell, { width: '15%' }]}>{start ? format(new Date(start), "dd/MM/yyyy") : '-'}</Text>
                                    <Text style={[styles.cell, { width: '15%' }]}>{end ? format(new Date(end), "dd/MM/yyyy") : '-'}</Text>
                                    <Text style={[styles.cell, { width: '15%', fontFamily: 'Courier' }]}>{plan.plan_id || plan.id.substring(0, 8)}</Text>
                                    <Text style={[styles.cell, { width: '15%', textTransform: 'capitalize' }]}>{plan.intervention_type}</Text>
                                    <Text style={[styles.cell, { width: '20%' }]}>{plan.tree?.especie || 'N/A'}</Text>
                                    <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor, width: '15%' }]}>
                                        <Text style={[styles.badgeText, { color: statusStyle.color }]}>
                                            {STATUS_MAP[plan.status?.toLowerCase()] || plan.status || 'Pendente'}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages} - ArborIA - Gestão de Cronograma - Gerado em ${format(new Date(), "dd/MM/yyyy")}`} fixed />
            </Page>
        </Document>
    );
};
