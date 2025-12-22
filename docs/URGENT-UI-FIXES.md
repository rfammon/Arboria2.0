# 🔧 Correções Urgentes - UI Multi-Tenant

## Problema 1: ID Aparecendo no Header

**Causa:** O ID da instalação está sendo exibido em algum lugar.

**Solução:** Adicione este CSS ao final de `06_feature.multi-tenant.css`:

```css
/* Ocultar ID da instalação se estiver aparecendo */
.instalacao-selector-btn [data-instalacao-id],
.instalacao-item-id {
  display: none !important;
}
```

---

## Problema 2: Modal Transparente no Light Mode

**Solução:** Adicione ao final de `07_components.modals.css`:

```css
/* Light mode fixes */
body:not(.dark-mode) .modal-container {
  background: #ffffff !important;
  color: #1a202c !important;
}

body:not(.dark-mode) .form-control {
  background: #f7fafc !important;
  color: #1a202c !important;
  border-color: #e2e8f0 !important;
}

body:not(.dark-mode) .checkbox-group {
  background: #f7fafc !important;
}

body:not(.dark-mode) .modal-title,
body:not(.dark-mode) .form-group label {
  color: #1a202c !important;
}

body:not(.dark-mode) .form-text {
  color: #718096 !important;
}

body:not(.dark-mode) select.form-control {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
}
```

---

## Problema 3: Dropdown Transparente no Light Mode

**Solução:** Adicione ao final de `06_feature.multi-tenant.css`:

```css
/* Light mode dropdown fix */
body:not(.dark-mode) .instalacao-dropdown {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
}

body:not(.dark-mode) .instalacao-dropdown-title {
  color: #718096 !important;
}

body:not(.dark-mode) .instalacao-item {
  color: #1a202c !important;
}

body:not(.dark-mode) .instalacao-item:hover {
  background: #f7fafc !important;
}

body:not(.dark-mode) .instalacao-search {
  background: #f7fafc !important;
  color: #1a202c !important;
  border-color: #e2e8f0 !important;
}

body:not(.dark-mode) .btn-solicitar-acesso {
  color: #1a202c !important;
  border-color: #e2e8f0 !important;
}
```

---

## Como Aplicar:

### Opção 1: Copiar e Colar

1. Abra `css/modules/06_feature.multi-tenant.css`
2. Vá até o final do arquivo
3. Cole o código do "Problema 1" e "Problema 3"
4. Salve

5. Abra `css/modules/07_components.modals.css`
6. Vá até o final do arquivo
7. Cole o código do "Problema 2"
8. Salve

9. Hard refresh: `Ctrl + Shift + R`

### Opção 2: Eu Aplico Automaticamente

Responda "aplicar" e eu faço as modificações nos arquivos.

---

## Sobre o ID no Header

Se o ID ainda aparecer após aplicar o CSS, me envie um print do HTML (F12 → Elements → procure por "instalacao-selector") para eu ver exatamente onde está sendo renderizado.
