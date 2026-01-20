
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
    section: { marginBottom: 15 },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#000', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#BBB', paddingBottom: 3, flexDirection: 'row', alignItems: 'center' },

    // Tables & Rows
    row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#EEE', paddingVertical: 4 },
    label: { width: 100, fontWeight: 'bold', color: '#444' },
    value: { flex: 1, color: '#111' },

    // Badges
    badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 3, alignSelf: 'flex-start' },
    badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 9 },

    // Status Box
    statusBox: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 4, borderLeftWidth: 4, borderLeftColor: '#2e7d32', marginBottom: 15 },

    // Images
    imageGrid: { flexDirection: 'row', gap: 15, marginBottom: 15 },
    treePhotoBox: { width: 220, height: 160, borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: '#DDD' },
    mapBox: { flex: 1, height: 160, borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: '#DDD' },
    ganttBox: { width: '100%', height: 120, marginTop: 10, borderRadius: 3, borderWidth: 1, borderColor: '#EEE' },

    // Safety Box
    safetyBox: { backgroundColor: '#FFFAF0', padding: 10, borderRadius: 4, borderWidth: 1, borderColor: '#F5DEB3', marginBottom: 10 },
    bullet: { fontSize: 8, marginBottom: 3, marginLeft: 10, color: '#555' },

    // Footer
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#AAA', fontSize: 7, borderTopWidth: 0.5, borderTopColor: '#EEE', paddingTop: 8 }
});

const getRiskColor = (risk: string) => {
    const r = risk?.toLowerCase() || '';
    if (r.includes('alto') || r.includes('high')) return '#d32f2f';
    if (r.includes('médio') || r.includes('medio') || r.includes('medium')) return '#ff9800';
    return '#4caf50';
};

const RISK_MAP: Record<string, string> = {
    'alto': 'Alto', 'high': 'Alto', 'medio': 'Médio', 'médio': 'Médio', 'medium': 'Médio', 'baixo': 'Baixo', 'low': 'Baixo'
};

const INTERVENTION_LABELS: Record<string, string> = {
    'poda': 'Poda',
    'supressao': 'Supressão',
    'transplante': 'Transplante',
    'tratamento': 'Tratamento Fitossanitário',
    'monitoramento': 'Monitoramento'
};

export const InterventionPlanPDF = ({ plan, tree, installationName, mapImage, ganttImage }: any) => {
    const typeLabel = INTERVENTION_LABELS[plan.intervention_type] || plan.intervention_type;
    const treePhotoUrl = tree?.arvore_fotos?.find((p: any) => p.is_cover)?.url || tree?.arvore_fotos?.[0]?.url;
    const riskLabel = RISK_MAP[tree?.risklevel?.toLowerCase()] || tree?.risklevel || 'N/A';
    const riskColor = tree ? getRiskColor(tree.risklevel) : '#666';

    const formatDate = (date: string | undefined) => date ? format(new Date(date), "dd/MM/yyyy") : 'N/A';

    return (
        <Document title={`Plano de Intervenção - ${plan.plan_id}`}>
            {/* PAGE 1: CORE DATA & LOCALIZATION */}
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>Arbor<Text style={styles.logoSuffix}>IA</Text></Text>
                        <Text style={styles.headerTitle}>Plano de Intervenção</Text>
                        <Text style={styles.subtitle}>{typeLabel}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>Instalação: {installationName}</Text>
                        <Text style={styles.infoText}>ID: {plan.plan_id || plan.id.substring(0, 8)}</Text>
                        <Text style={styles.infoText}>Emissão: {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</Text>
                    </View>
                </View>

                {/* Status & Justification */}
                <View style={styles.statusBox}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2e7d32', marginBottom: 4 }}>PANO DE INTERVENÇÃO - {typeLabel}</Text>
                    <Text style={{ fontSize: 9 }}>STATUS: {plan.status}</Text>
                    {plan.justification && (
                        <Text style={{ fontSize: 8, marginTop: 5, color: '#444', fontStyle: 'italic' }}>Justificativa: {plan.justification}</Text>
                    )}
                </View>

                {/* Section Árvore */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ÁRVORE</Text>
                    <View style={styles.imageGrid}>
                        {treePhotoUrl && (
                            <View style={styles.treePhotoBox}>
                                <Image src={treePhotoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </View>
                        )}
                        <View style={{ flex: 1, gap: 2 }}>
                            <View style={styles.row}><Text style={styles.label}>Espécie:</Text><Text style={styles.value}>{tree?.especie || 'N/A'}</Text></View>
                            <View style={styles.row}><Text style={styles.label}>Código:</Text><Text style={styles.value}>{tree?.codigo || 'N/A'}</Text></View>
                            <View style={styles.row}><Text style={styles.label}>DAP:</Text><Text style={styles.value}>{tree?.dap ? `${tree.dap} cm` : 'N/A'}</Text></View>
                            <View style={styles.row}><Text style={styles.label}>Altura:</Text><Text style={styles.value}>{tree?.altura ? `${tree.altura} m` : 'N/A'}</Text></View>
                            <View style={styles.row}><Text style={styles.label}>Localização:</Text><Text style={styles.value}>{tree?.local || 'N/A'}</Text></View>
                            <View style={styles.row}><Text style={styles.label}>Coordenadas:</Text><Text style={styles.value}>{tree?.latitude}, {tree?.longitude}</Text></View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Nível de Risco:</Text>
                                <View style={[styles.badge, { backgroundColor: riskColor }]}>
                                    <Text style={styles.badgeText}>{riskLabel}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Localization Map */}
                {mapImage && (
                    <View style={styles.section}>
                        <View style={{ height: 220, borderRadius: 4, borderWidth: 1, borderColor: '#EEE', overflow: 'hidden' }}>
                            <Image src={mapImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <View style={{ position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 }}>
                                <Text style={{ fontSize: 7, fontWeight: 'bold' }}>Localização</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages} - ArborIA Gestão Arbórea`} fixed />
            </Page>

            {/* PAGE 2: SCHEDULE, TEAM & SAFETY */}
            <Page size="A4" style={styles.page}>
                {/* Section Cronograma */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CRONOGRAMA</Text>
                    <View style={{ flexDirection: 'row', gap: 40, marginBottom: 10 }}>
                        <View><Text style={{ color: '#666', fontSize: 8 }}>Data de Início</Text><Text style={{ fontSize: 11, fontWeight: 'bold' }}>{formatDate(plan.schedule?.startDate || plan.schedule?.start)}</Text></View>
                        <View><Text style={{ color: '#666', fontSize: 8 }}>Data de Término</Text><Text style={{ fontSize: 11, fontWeight: 'bold' }}>{formatDate(plan.schedule?.endDate || plan.schedule?.end)}</Text></View>
                    </View>

                    {ganttImage && (
                        <View style={{ marginTop: 5, padding: 10, backgroundColor: '#fcfcfc', borderRadius: 4, borderWidth: 1, borderColor: '#eee' }}>
                            <Image src={ganttImage} style={{ width: '100%', height: 100, objectFit: 'contain' }} />
                        </View>
                    )}
                </View>

                {/* Section Equipe */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>COMPOSIÇÃO DA EQUIPE</Text>
                    {plan.team_composition ? (
                        <View style={{ flexDirection: 'row', backgroundColor: '#F9F9F9', padding: 10, borderRadius: 4, gap: 30 }}>
                            <View><Text style={styles.label}>Auxiliares:</Text><Text style={{ fontSize: 11, fontWeight: 'bold' }}>{plan.team_composition.helpers || 0}</Text></View>
                            <View><Text style={styles.label}>Supervisores:</Text><Text style={{ fontSize: 11, fontWeight: 'bold' }}>{plan.team_composition.supervisors || 0}</Text></View>
                            <View><Text style={styles.label}>Operadores Motosserra:</Text><Text style={{ fontSize: 11, fontWeight: 'bold' }}>{plan.team_composition.chainsaw_operators || 0}</Text></View>
                        </View>
                    ) : (
                        <Text style={{ fontStyle: 'italic', color: '#666' }}>Equipe não especificada.</Text>
                    )}
                </View>

                {/* Section Segurança */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROCEDIMENTOS DE SEGURANÇA</Text>
                    <View style={styles.safetyBox}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 5, color: '#8B4513' }}>Medidas Obrigatórias:</Text>
                        <Text style={styles.bullet}>• Isolamento e sinalização da área de trabalho (cones, fitas).</Text>
                        <Text style={styles.bullet}>• Verificação prévia de condições climáticas e fitossanitárias.</Text>
                        <Text style={styles.bullet}>• Planejamento de rotas de fuga e zona de queda controlada.</Text>
                        <Text style={styles.bullet}>• Check-list de equipamentos e EPIs antes do início das atividades.</Text>
                        <Text style={styles.bullet}>• Comunicação constante entre escalador e equipe de solo.</Text>
                        {plan.security_procedures && (
                            <Text style={[styles.bullet, { marginTop: 4 }]}>• {plan.security_procedures}</Text>
                        )}
                    </View>

                    <View style={styles.safetyBox}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 5, color: '#8B4513' }}>Equipamentos de Proteção Individual (EPIs):</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {plan.epis && plan.epis.length > 0 ? (
                                plan.epis.map((epi: string) => (
                                    <View key={epi} style={{ backgroundColor: '#FFF', padding: 4, borderRadius: 3, borderWidth: 1, borderColor: '#F5DEB3' }}>
                                        <Text style={{ fontSize: 8 }}>{epi}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.bullet}>Capacete, Luvas, Óculos, Botas, Cinturão de Segurança.</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Section Técnicas & Ferramentas */}
                <View style={{ flexDirection: 'row', gap: 20, marginBottom: 15 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>FERRAMENTAS</Text>
                        <View style={{ backgroundColor: '#F0F4F8', padding: 8, borderRadius: 4 }}>
                            <Text style={{ fontSize: 10 }}>{plan.tools?.join(', ') || 'Não especificado'}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>TÉCNICAS APLICADAS</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                            {plan.techniques?.map((t: string) => (
                                <View key={t} style={[styles.badge, { backgroundColor: '#4caf50' }]}>
                                    <Text style={styles.badgeText}>{t}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Section Responsibility */}
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.sectionTitle}>RESPONSABILIDADE</Text>
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5, marginBottom: 15 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 8, color: '#666' }}>Responsável pela Execução</Text>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 3 }}>{plan.responsible || '_________________________'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 8, color: '#666' }}>Cargo/Função</Text>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 3 }}>{plan.responsible_title || '_________________________'}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages} - ArborIA Gestão Arbórea`} fixed />
            </Page>
        </Document>
    );
};
