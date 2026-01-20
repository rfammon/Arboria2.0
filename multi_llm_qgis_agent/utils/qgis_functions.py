from qgis.core import QgsProject, QgsMapLayer

def get_layer_by_name(name: str) -> QgsMapLayer:
    """Busca uma camada pelo nome"""
    layers = QgsProject.instance().mapLayersByName(name)
    if layers:
        return layers[0]
    return None

def get_active_layer():
    """Retorna a camada ativa no QGIS"""
    # Esta função será usada via contexto se necessário
    pass
