import os
from qgis.PyQt import uic
from qgis.PyQt.QtWidgets import QDockWidget, QMessageBox
from qgis.PyQt.QtCore import pyqtSignal

# Carrega o arquivo UI dinamicamente
FORM_CLASS, _ = uic.loadUiType(os.path.join(
    os.path.dirname(__file__), 'agent_dockwidget_base.ui'))

class AgentDockWidget(QDockWidget, FORM_CLASS):
    closingPlugin = pyqtSignal()

    def __init__(self, parent=None):
        """Constructor."""
        super(AgentDockWidget, self).__init__(parent)
        self.setupUi(self)
        
        self.pushButtonSend.clicked.connect(self.on_send_clicked)
        self.pushButtonExecute.clicked.connect(self.on_execute_clicked)
        self.pushButtonTestConnection.clicked.connect(self.on_test_connection)
        
    def on_send_clicked(self):
        """Ação ao clicar em enviar comando"""
        command = self.lineEditCommand.text()
        if not command:
            return
            
        # Esta lógica será chamada pelo plugin principal
        pass
        
    def on_execute_clicked(self):
        """Ação ao clicar em executar código"""
        code = self.textEditCode.toPlainText()
        if not code:
            return
            
        # Esta lógica será chamada pelo plugin principal
        pass

    def on_test_connection(self):
        """Ação ao testar conexão"""
        pass

    def closeEvent(self, event):
        self.closingPlugin.emit()
        event.accept()
