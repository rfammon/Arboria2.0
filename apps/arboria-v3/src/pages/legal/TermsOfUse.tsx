// import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfUse = () => {
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

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Uso</h1>

                <div className="prose prose-green max-w-none text-gray-700 space-y-6">
                    <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e utilizar o <strong>ArborIA</strong> ("Plataforma"), você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site/app.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">2. Propriedade Intelectual</h2>
                        <p>
                            O software, design, código-fonte, algoritmos, logotipos e todo o conteúdo da plataforma são de propriedade exclusiva do criador e desenvolvedor do ArborIA (Rafael de Andrade Ammon), protegidos pelas leis de direitos autorais e propriedade intelectual do Brasil (Lei nº 9.610/1998 e Lei nº 9.609/1998).
                        </p>
                        <p className="mt-2">
                            É concedida uma licença limitada, não exclusiva e intransferível para uso da plataforma apenas para fins de gestão arbórea conforme contratado. É estritamente proibida a engenharia reversa, cópia, modificação ou redistribuição do software sem autorização expressa.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">3. Responsabilidades do Usuário</h2>
                        <p>O usuário compromete-se a:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Fornecer informações verdadeiras e atualizadas.</li>
                            <li>Manter o sigilo de suas credenciais de acesso (login e senha).</li>
                            <li>Utilizar a plataforma apenas para finalidades lícitas e profissionais.</li>
                            <li>Não inserir conteúdo ofensivo, ilegal ou que viole direitos de terceiros (ex: fotos indevidas).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">4. Limitação de Responsabilidade</h2>
                        <p>
                            A plataforma é fornecida "como está" (as-is). Embora empreguemos os melhores esforços para garantir a precisão dos cálculos e relatórios:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Não nos responsabilizamos por decisões tomadas com base nos dados gerados (a validação técnica de campo é indispensável).</li>
                            <li>Não garantimos que o serviço será ininterrupto ou livre de erros, embora trabalhemos continuamente para correções e melhorias.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">5. Rescisão</h2>
                        <p>
                            Podemos encerrar ou suspender seu acesso imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, inclusive, sem limitação, se você violar os Termos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">6. Legislação Aplicável</h2>
                        <p>
                            Estes termos serão regidos e interpretados de acordo com as leis do Brasil, e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais desse Estado ou localidade.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;
