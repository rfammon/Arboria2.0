// import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full overflow-y-auto min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-green-600 hover:text-green-800 font-medium flex items-center"
                >
                    ← Voltar
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>

                <div className="prose prose-green max-w-none text-gray-700 space-y-6">
                    <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">1. Introdução</h2>
                        <p>
                            A presente Política de Privacidade tem por finalidade demonstrar o compromisso do <strong>ArborIA</strong> com a privacidade e proteção dos dados pessoais de seus usuários, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">2. Coleta de Dados</h2>
                        <p>Coletamos os seguintes tipos de dados para o funcionamento adequado do sistema de gestão arbórea:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Dados Pessoais:</strong> Nome, e-mail e função/cargo para criação de conta e controle de acesso.</li>
                            <li><strong>Dados de Geolocalização:</strong> Coordenadas GPS para mapeamento de árvores e instalações.</li>
                            <li><strong>Imagens:</strong> Fotos de árvores e locais para inventário e relatórios.</li>
                            <li><strong>Dados de Uso:</strong> Registros de atividades (logs) para auditoria e segurança.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">3. Finalidade do Uso dos Dados</h2>
                        <p>Os dados coletados são utilizados estritamente para:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Gestão e inventário de ativos arbóreos urbanos.</li>
                            <li>Geração de relatórios técnicos e cronogramas de intervenção.</li>
                            <li>Controle de segurança e acesso às instalações cadastradas.</li>
                            <li>Cumprimento de obrigações legais e regulatórias.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">4. Armazenamento e Segurança</h2>
                        <p>
                            Os dados são armazenados em nuvem segura (Supabase), com criptografia e controles de acesso rigorosos. Adotamos medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou difusão.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">5. Direitos do Titular (LGPD)</h2>
                        <p>Conforme o Art. 18 da LGPD, você tem direito a:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Confirmação da existência de tratamento e acesso aos dados.</li>
                            <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
                            <li>Eliminação dos dados pessoais tratados com o consentimento do titular (salvo exceções legais).</li>
                            <li>Revogação do consentimento.</li>
                        </ul>
                        <p className="mt-2">Para exercer seus direitos, entre em contato através dos canais de suporte do aplicativo.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">6. Compartilhamento de Dados</h2>
                        <p>
                            Não vendemos ou comercializamos seus dados pessoais. O compartilhamento pode ocorrer apenas com equipes operacionais vinculadas à sua Instalação ou autoridades competentes mediante exigência legal.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">7. Alterações nesta Política</h2>
                        <p>
                            Podemos atualizar esta política periodicamente. A versão mais recente estará sempre disponível no aplicativo.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
