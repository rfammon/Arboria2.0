import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import { Button } from '../../ui/button';
import { Download } from 'lucide-react';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: '#FFFFFF',
  },
  container: {
    margin: 30,
    padding: 40,
    border: '12pt solid #1a472a', // Dark Green Arboria
    height: '89%', // Approximation for A4 landscape with margins
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerBorder: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    border: '1pt solid #c5a059', // Gold
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#1a472a',
    borderRadius: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 18,
    color: '#1a472a',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 42,
    color: '#1a472a',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 20,
    color: '#333333',
    marginBottom: 40,
    textAlign: 'center',
  },
  recipientLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  recipientName: {
    fontSize: 36,
    color: '#1a472a',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#c5a059',
    paddingBottom: 5,
    minWidth: 400,
  },
  description: {
    fontSize: 18,
    color: '#444444',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 60,
    maxWidth: '80%',
    lineHeight: 1.5,
  },
  moduleTitle: {
    color: '#1a472a',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 60,
  },
  footerItem: {
    alignItems: 'center',
    width: 200,
  },
  signatureLine: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    marginTop: 40,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
  },
  authCode: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    fontSize: 8,
    color: '#999999',
  },
});

interface CertificateProps {
  userName: string;
  courseTitle: string;
  date: string;
  completionCode: string;
}

/**
 * The PDF Document component
 */
export const CertificateDocument: React.FC<CertificateProps> = ({
  userName,
  courseTitle,
  date,
  completionCode,
}) => (
  <Document title={`Certificado - ${userName}`}>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.container}>
        <View style={styles.innerBorder} />
        
        {/* Header / Logo */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.brandName}>Arboria</Text>
        </View>

        <Text style={styles.title}>Certificado de Conclusão</Text>
        
        <Text style={styles.recipientLabel}>Concedido a</Text>
        <Text style={styles.recipientName}>{userName}</Text>
        
        <Text style={styles.description}>
          Por concluir com êxito o módulo{"\n"}
          <Text style={styles.moduleTitle}>{courseTitle}</Text>
        </Text>

        {/* Footer with Date and Signature */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Text style={{ fontSize: 14, marginBottom: 5 }}>{date}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.footerText}>Data de Emissão</Text>
          </View>
          
          <View style={styles.footerItem}>
            <View style={styles.signatureLine} />
            <Text style={styles.footerText}>Assinatura Arboria</Text>
          </View>
        </View>

        {/* Completion Code */}
        <Text style={styles.authCode}>
          Código de Autenticidade: {completionCode}
        </Text>
      </View>
    </Page>
  </Document>
);

interface DownloadCertificateButtonProps extends CertificateProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  label?: string;
}

/**
 * Button component that triggers the PDF download
 */
export const DownloadCertificateButton: React.FC<DownloadCertificateButtonProps> = ({
  userName,
  courseTitle,
  date,
  completionCode,
  variant = 'default',
  size = 'default',
  className = '',
  label = 'Baixar Certificado',
}) => {
  return (
    <PDFDownloadLink
      document={
        <CertificateDocument
          userName={userName}
          courseTitle={courseTitle}
          date={date}
          completionCode={completionCode}
        />
      }
      fileName={`Certificado_${userName.replace(/\s+/g, '_')}_${courseTitle.replace(/\s+/g, '_')}.pdf`}
    >
      {({ loading }) => (
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={loading}
        >
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Gerando...' : label}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default CertificateDocument;
