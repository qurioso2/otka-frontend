{
  "brand_attributes": ["professional", "trustworthy", "precise", "luxury-minimal"],
  "visual_style": {
    "design_style": "Swiss style + Luxury minimalism with subtle brass accents and ocean-blue actions. Strict grid, generous whitespace, no decorative clutter.",
    "motion_style": "quiet confidence: short, purposeful transitions on hover/click; soft entrance reveals on scroll using Framer Motion; no bounce.",
    "layout_style": "Desktop-first admin with responsive breakpoints; left sidebar + content area; dense tables with readable spacing; card stats row at top."
  },
  "inspiration": {
    "search_1": "Admin invoice dashboard patterns: shadcn dashboard templates, sortable tables, badges, dialog-based PDF preview (Sources: shadcn template dashboard, shadcnblocks, shadcn admin repo).",
    "search_2": "Proforma invoice PDF preview + finance typography for luxury brand; pair modern sans for UI with distinctive geometric sans for headings; blue-green palette with brass accents (Sources: Wave proforma templates, shadcn templates)."
  },
  "typography": {
    "fonts": {
      "heading": "Space Grotesk",
      "body": "Inter",
      "mono": "Roboto Mono"
    },
    "setup_next_font_js": "// In app/layout.js\nimport { Inter, Space_Grotesk, Roboto_Mono } from 'next/font/google'\nexport const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })\nexport const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })\nexport const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' })\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"ro\" className={`${inter.variable} ${spaceGrotesk.variable} ${robotoMono.variable}`}>\n      <body>{children}</body>\n    </html>\n  )\n}",
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight font-[family:var(--font-space)]",
      "h2": "text-base md:text-lg font-semibold tracking-tight font-[family:var(--font-space)]",
      "body": "text-base md:text-base text-slate-800 font-[family:var(--font-inter)]",
      "small": "text-sm text-slate-600",
      "numeric_features": "[font-feature-settings:'tnum'_'lnum']"
    }
  },
  "color_palette": {
    "description": "Ocean blue actions, green success, blue pending, red cancelled, subtle warm neutrals, brass accent.",
    "roles": {
      "background": "#FAFAF7",
      "surface": "#FFFFFF",
      "foreground": "#0F172A",
      "muted": "#F1F5F9",
      "border": "#E5E7EB",
      "primary": "#2563EB",
      "primary_hover": "#1D4ED8",
      "accent": "#2AB3A6",
      "accent_hover": "#229F93",
      "brass": "#B88B2E",
      "success": "#16A34A",
      "warning": "#F59E0B",
      "danger": "#DC2626",
      "info": "#0EA5E9",
      "pending": "#3B82F6",
      "paid": "#16A34A",
      "cancelled": "#EF4444"
    },
    "css_custom_properties": ":root{--bg:#FAFAF7;--surface:#FFFFFF;--fg:#0F172A;--muted:#F1F5F9;--border:#E5E7EB;--primary:#2563EB;--primary-600:#2563EB;--primary-700:#1D4ED8;--accent:#2AB3A6;--accent-600:#229F93;--brass:#B88B2E;--success:#16A34A;--warning:#F59E0B;--danger:#DC2626;--info:#0EA5E9;--pending:#3B82F6;--paid:#16A34A;--cancelled:#EF4444;--ring:#93C5FD}",
    "gradients_allowed": [
      {
        "name": "hero_ocean_fold",
        "css": "background-image: linear-gradient(180deg, rgba(37,99,235,0.08) 0%, rgba(42,179,166,0.08) 60%, rgba(255,255,255,0) 100%);",
        "usage": "Decorative section backgrounds only (hero stripe, empty-state banner). Max 20% viewport."
      },
      {
        "name": "teal_brass_sliver",
        "css": "background-image: linear-gradient(135deg, rgba(42,179,166,0.10), rgba(184,139,46,0.06));",
        "usage": "Thin separators, cards top border glow via ::before overlay."
      }
    ],
    "contrast_rules": "Maintain WCAG AA: body text on surface must be >= 4.5:1; primary on white meets AA; never use gradients on content backgrounds."
  },
  "tokens": {
    "radius": { "sm": "6px", "md": "10px", "lg": "14px", "pill": "999px" },
    "shadow": {
      "sm": "0 1px 2px rgba(0,0,0,0.04)",
      "md": "0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
      "lg": "0 2px 6px rgba(0,0,0,0.05), 0 16px 32px rgba(0,0,0,0.08)"
    },
    "spacing": { "xs": "0.375rem", "sm": "0.5rem", "md": "0.75rem", "lg": "1rem", "xl": "1.5rem", "2xl": "2rem", "3xl": "3rem" },
    "motion": {
      "duration": { "fast": "150ms", "base": "220ms", "slow": "350ms" },
      "easing": { "in_out": "cubic-bezier(0.2,0.7,0.2,1)", "focus": "cubic-bezier(0.4,0,0.2,1)" }
    },
    "btn": { "radius": "10px", "shadow": "var(--btn-shadow, 0 6px 12px rgba(37,99,235,0.18))", "motion": "color, background-color, opacity" }
  },
  "grid_and_layout": {
    "container": "max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8",
    "content_grid": "grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6",
    "cards_row": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
    "tables_area": "rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
  },
  "buttons": {
    "variants": {
      "primary": "inline-flex items-center justify-center rounded-[10px] bg-[var(--primary)] text-white px-4 py-2 text-sm font-semibold hover:bg-[var(--primary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 transition-colors",
      "secondary": "inline-flex items-center justify-center rounded-[10px] bg-[var(--muted)] text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 transition-colors",
      "ghost": "inline-flex items-center justify-center rounded-[10px] text-slate-700 px-3 py-2 text-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-colors",
      "danger": "inline-flex items-center justify-center rounded-[10px] bg-[var(--danger)] text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 transition-colors"
    },
    "sizes": {
      "sm": "h-8 px-3 text-xs",
      "md": "h-10 px-4 text-sm",
      "lg": "h-12 px-5 text-base"
    },
    "notes": "Professional/Corporate style per spec. Visible focus state, no transition: all; only transition-colors/opacity."
  },
  "status_badges": {
    "pending": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    "paid": "bg-green-50 text-green-700 ring-1 ring-green-200",
    "cancelled": "bg-red-50 text-red-700 ring-1 ring-red-200"
  },
  "tables": {
    "header": "text-slate-600 font-medium",
    "cell": "text-slate-800",
    "zebra": "odd:bg-slate-50",
    "numeric_alignment": "text-right tabular-nums",
    "hover": "hover:bg-slate-50",
    "sortable_indicator": "after:ml-1 after:inline-block after:align-middle",
    "empty_state": "py-14 text-center text-slate-500"
  },
  "forms": {
    "validation": "Inline helper text below inputs. Red border + aria-invalid on error. Show toast via sonner on submit errors.",
    "grouping": "Use fieldsets with descriptive legends. For proforma creation, split into steps: Client → Products → Review.",
    "realtime_calculations": "Totals recalc on change with debounced inputs (200ms). Display subtotals per VAT group in a sticky summary panel."
  },
  "component_path": {
    "shadcn_primitives": {
      "button": "./components/ui/button.js",
      "badge": "./components/ui/badge.js",
      "table": "./components/ui/table.js",
      "dialog": "./components/ui/dialog.js",
      "dropdown_menu": "./components/ui/dropdown-menu.js",
      "select": "./components/ui/select.js",
      "input": "./components/ui/input.js",
      "textarea": "./components/ui/textarea.js",
      "label": "./components/ui/label.js",
      "tabs": "./components/ui/tabs.js",
      "calendar": "./components/ui/calendar.js",
      "popover": "./components/ui/popover.js",
      "command": "./components/ui/command.js",
      "sheet": "./components/ui/sheet.js",
      "sonner": "./components/ui/sonner.js"
    },
    "feature_components": {
      "ProformaDashboardPage": "./app/admin/proforma/page.js",
      "TaxRatesTable": "./components/admin/TaxRatesTable.js",
      "CompanySettingsForm": "./components/admin/CompanySettingsForm.js",
      "ProformaFormWizard": "./components/admin/ProformaFormWizard.js",
      "PDFPreviewDialog": "./components/admin/PDFPreviewDialog.js",
      "ProductsVATSelector": "./components/admin/ProductsVATSelector.js"
    }
  },
  "additional_libraries": {
    "install": [
      "npm i @tanstack/react-table",
      "npm i framer-motion",
      "npm i sonner",
      "npm i date-fns",
      "npm i react-dropzone",
      "npx shadcn@latest init"
    ],
    "notes": "Use shadcn/ui generator to add primitives (button, table, dialog, select, dropdown-menu, calendar, popover, tabs, textarea, input, label, command, sheet). Create wrapper .js modules under ./components/ui that re-export shadcn components using named exports."
  },
  "css_setup": {
    "globals_extension": "/* Add to app/globals.css */\n:root{--background:#FAFAF7;--foreground:#0F172A;--surface:#FFFFFF;--border:#E5E7EB;--ring:#93C5FD}\nbody{background:var(--background);color:var(--foreground);}\n.tabular-nums{font-feature-settings:'tnum' 'lnum';}\n.card-shadow{box-shadow:0 1px 2px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.06);}\n.hero-stripe{background-image:linear-gradient(180deg, rgba(37,99,235,0.08), rgba(42,179,166,0.08), rgba(255,255,255,0));}\n/* Focus */\n.focus-ring:focus-visible{outline:none;box-shadow:0 0 0 2px var(--ring),0 0 0 4px #fff;}"
  },
  "micro_interactions": {
    "buttons": "hover:shadow-sm active:scale-[0.99] transition-[color,background-color,opacity] duration-200",
    "rows": "hover:bg-slate-50 transition-colors",
    "cards": "will-change:transform; transition-transform duration-200 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-0.5",
    "scroll_reveal": "Use Framer Motion: initial={{opacity:0, y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.35}}"
  },
  "accessibility": {
    "keyboard": "All dialogs, menus, selects must be navigable with keyboard. Ensure aria labels for icon-only controls.",
    "focus": "Visible ring using focus-visible classes; ensure contrast on colored badges.",
    "tables": "Use scope=col for headers; provide caption for financial tables.",
    "aria_examples": [
      "<button aria-label=\"Trimite proformă\" data-testid=\"proforma-send-button\">...",
      "<div role=\"status\" aria-live=\"polite\" data-testid=\"totals-summary\">..."]
  },
  "data_testid_convention": {
    "rule": "All interactive and key informational elements MUST include a data-testid using kebab-case and role-based naming.",
    "examples": [
      "data-testid=\"tax-rates-add-button\"",
      "data-testid=\"tax-rates-table\"",
      "data-testid=\"company-settings-save-button\"",
      "data-testid=\"proforma-create-button\"",
      "data-testid=\"dashboard-status-filter\"",
      "data-testid=\"date-range-popover\"",
      "data-testid=\"pdf-preview-trigger\"",
      "data-testid=\"confirm-payment-button\"",
      "data-testid=\"vat-selector\"",
      "data-testid=\"currency-select\"",
      "data-testid=\"line-item-add-button\"",
      "data-testid=\"status-badge-paid\""
    ]
  },
  "feature_blueprints": {
    "TaxRatesManagementUI": {
      "layout": "Card with header actions (Add, Bulk Update). Table: Name, Percent, Products count, Status, Actions.",
      "components": ["button", "table", "dialog", "badge", "dropdown_menu", "input", "label"],
      "states": ["active/inactive toggle pill", "edit modal", "delete confirm dialog"],
      "table_classes": "w-full text-sm [&_th]:text-slate-600 [&_td]:text-slate-800 [&_tbody_tr]:odd:bg-slate-50"
    },
    "CompanySettingsUI": {
      "layout": "Two-column form on desktop: Company Details, Banking (RON/EUR), Logo upload, Email templates.",
      "components": ["input", "textarea", "label", "button", "tabs", "sheet"],
      "notes": "Use tab sections: Date firmă, Bănci, Email Template. Show IBAN inputs with monospaced font for readability."
    },
    "ProformaDashboardUI": {
      "layout": "Stats cards row → Filters row → Invoices DataTable → footer bulk actions.",
      "components": ["badge", "button", "dropdown_menu", "select", "calendar", "popover", "table", "dialog", "sonner"],
      "filters": ["Status (toate/încasate/în așteptare)", "Date range", "Client search"],
      "actions": ["Creează proformă", "Preview PDF", "Trimite email", "Confirmă încasare"],
      "status_badges": {"Pending": "blue", "Paid": "green", "Cancelled": "red"}
    },
    "ProformaCreationForm": {
      "layout": "Three steps with Tabs: Client → Produse → Review",
      "components": ["tabs", "select", "command", "input", "textarea", "badge", "table", "dropdown_menu", "button", "sonner"],
      "product_table": "Columns: SKU, Nume, Cantitate, Preț unitar, Cotă TVA, Total. Right-align numeric cells.",
      "totals_panel": "Sticky sidebar (lg) showing Subtotal, TVA per cotă (grouped), Total.",
      "currency_selector": "RON/EUR select top-right of form.",
      "buttons": ["Salvează draft", "Generează PDF", "Generează & Trimite email"],
      "validation": "Debounced calculations. Show inline errors."
    },
    "ProductFormEnhancement": {
      "location": "Admin Products form",
      "ui": "Add Cotă TVA dropdown beside Preț de Vânzare (cu TVA). Show chip: '21% TVA inclus'. If differs from 21%, highlight field border in brass + info tooltip.",
      "components": ["select", "badge", "tooltip (via popover)"]
    },
    "ProformaPDFPreviewModal": {
      "layout": "Fullscreen dialog with sticky top header (Logo, firm details, actions) and iframe/pdf render area.",
      "components": ["dialog", "button", "badge"],
      "actions": ["Download PDF", "Trimite Email", "Close"],
      "fallback": "If embed blocked, show a download link and thumbnail preview.",
      "header_style": "Thin brass bottom border using shadow-[inset_0_-1px_0_rgba(184,139,46,0.5)]"
    }
  },
  "js_scaffolds": {
    "ProformaDashboardPage.js": "export default function ProformaDashboardPage(){return (<div className=\"max-w-[1400px] mx-auto px-4 md:px-6\">\n  <section className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6\">\n    {[{label:'Total proforme',value:'1,240'},{label:'Încasate',value:'860'},{label:'În așteptare',value:'320'},{label:'Suma totală',value:'€542k'}].map((c)=> (<div key={c.label} className=\"rounded-lg bg-white border p-4 card-shadow\" data-testid=\"stat-card\"><div className=\"text-slate-600 text-sm\">{c.label}</div><div className=\"text-2xl font-semibold tabular-nums\">{c.value}</div></div>))}\n  </section>\n  <section className=\"flex flex-wrap gap-3 items-center mb-4\">\n    <div className=\"flex items-center gap-2\" data-testid=\"dashboard-status-filter\">\n      <label className=\"text-sm text-slate-600\">Status</label>\n      <select className=\"h-10 px-3 rounded-md border\" aria-label=\"Filtrează după status\">\n        <option>Toate</option><option>Încasate</option><option>În așteptare</option>\n      </select>\n    </div>\n    <div className=\"ml-auto\"><button className=\"inline-flex items-center rounded-[10px] bg-[var(--primary)] text-white px-4 py-2 text-sm\" data-testid=\"proforma-create-button\">Creează proformă</button></div>\n  </section>\n  <section className=\"rounded-lg border overflow-hidden bg-white\" data-testid=\"proforma-table\">\n    <table className=\"w-full text-sm\">\n      <thead className=\"bg-slate-50 text-slate-600\"><tr>\n        <th className=\"text-left p-3\">Număr</th><th className=\"text-left p-3\">Dată</th><th className=\"text-left p-3\">Client</th><th className=\"text-right p-3\">Sumă</th><th className=\"text-left p-3\">Status</th><th className=\"text-right p-3\">Acțiuni</th>\n      </tr></thead>\n      <tbody>\n        <tr className=\"odd:bg-slate-50 hover:bg-slate-50\">\n          <td className=\"p-3\">OTK-00001</td><td className=\"p-3\">2025-01-08</td><td className=\"p-3\">ACME SRL</td><td className=\"p-3 text-right tabular-nums\">1.240,00 RON</td>\n          <td className=\"p-3\"><span className=\"inline-flex items-center rounded-full px-2 py-1 text-xs bg-green-50 text-green-700 ring-1 ring-green-200\" data-testid=\"status-badge-paid\">Paid</span></td>\n          <td className=\"p-3 text-right\"><button className=\"text-sm text-blue-700 hover:underline\" data-testid=\"pdf-preview-trigger\">Preview PDF</button></td>\n        </tr>\n      </tbody>\n    </table>\n  </section>\n</div>)}",
    "TaxRatesTable.js": "export const TaxRatesTable = ({ rates = [], onAdd, onEdit, onDelete, onBulkUpdate }) => {return (<div className=\"bg-white border rounded-lg p-4\" data-testid=\"tax-rates-table\">\n  <div className=\"flex items-center gap-2 mb-3\">\n    <h2 className=\"text-base md:text-lg font-semibold\">Cote TVA</h2>\n    <div className=\"ml-auto flex gap-2\">\n      <button className=\"rounded-[10px] bg-[var(--primary)] text-white px-3 py-2 text-sm\" onClick={onAdd} data-testid=\"tax-rates-add-button\">Adaugă</button>\n      <button className=\"rounded-[10px] bg-slate-100 px-3 py-2 text-sm\" onClick={onBulkUpdate} data-testid=\"tax-rates-bulk-update-button\">Actualizează masiv</button>\n    </div>\n  </div>\n  <table className=\"w-full text-sm\"><thead className=\"bg-slate-50 text-slate-600\"><tr>\n    <th className=\"text-left p-3\">Nume</th><th className=\"text-right p-3\">Procent</th><th className=\"text-right p-3\">Nr. produse</th><th className=\"text-left p-3\">Status</th><th className=\"text-right p-3\">Acțiuni</th>\n  </tr></thead><tbody>{rates.map(r => (<tr key={r.id} className=\"odd:bg-slate-50 hover:bg-slate-50\">\n    <td className=\"p-3\">{r.name}</td><td className=\"p-3 text-right tabular-nums\">{r.percent}%</td><td className=\"p-3 text-right tabular-nums\">{r.products}</td>\n    <td className=\"p-3\"><span className={r.active? 'bg-green-50 text-green-700 ring-1 ring-green-200 px-2 py-1 rounded-full text-xs':'bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs'}>{r.active?'Activ':'Inactiv'}</span></td>\n    <td className=\"p-3 text-right\"><button className=\"text-blue-700 text-sm mr-2\" onClick={()=>onEdit(r)} data-testid=\"tax-rate-edit-button\">Editează</button><button className=\"text-red-600 text-sm\" onClick={()=>onDelete(r)} data-testid=\"tax-rate-delete-button\">Șterge</button></td>\n  </tr>))}</tbody></table></div>)};",
    "PDFPreviewDialog.js": "export const PDFPreviewDialog = ({ open, onClose, src, onSend, onDownload }) => { if(!open) return null; return (<div role=\"dialog\" aria-modal=\"true\" className=\"fixed inset-0 z-50 bg-black/50\">\n  <div className=\"absolute inset-0 p-4 md:p-8\">\n    <div className=\"bg-white rounded-lg h-full flex flex-col\">\n      <div className=\"flex items-center gap-3 p-3 border-b\">\n        <div className=\"text-sm font-semibold\">Proformă - Preview</div>\n        <div className=\"ml-auto flex gap-2\">\n          <button className=\"rounded-[10px] bg-[var(--primary)] text-white px-3 py-2 text-sm\" onClick={onDownload} data-testid=\"pdf-download-button\">Download PDF</button>\n          <button className=\"rounded-[10px] bg-green-600 text-white px-3 py-2 text-sm\" onClick={onSend} data-testid=\"pdf-send-email-button\">Trimite Email</button>\n          <button className=\"rounded-[10px] bg-slate-100 px-3 py-2 text-sm\" onClick={onClose} data-testid=\"pdf-close-button\">Close</button>\n        </div>\n      </div>\n      <div className=\"flex-1 bg-slate-50\">\n        {src ? <iframe title=\"PDF Preview\" src={src} className=\"w-full h-full\"/> : <div className=\"h-full grid place-items-center text-slate-500\">Previzualizare indisponibilă</div>}\n      </div>\n    </div>\n  </div>\n</div>)};"
  },
  "image_urls": [
    {
      "url": "https://images.unsplash.com/photo-1644057501622-dfa7dd26dbfb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmdXJuaXR1cmUlMjBzaG93cm9vbSUyMG1pbmltYWwlMjBpbnRlcmlvciUyMG5ldXRyYWwlMjBwYWxldHRlfGVufDB8fHx8MTc2MDI1OTE2NHww&ixlib=rb-4.1.0&q=85",
      "category": "brand/empty-state",
      "description": "Dark, refined bedroom composition. Use as subtle empty-state backdrop (with 12–16% overlay)."
    },
    {
      "url": "https://images.unsplash.com/photo-1653972233597-05822baa3c4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBmdXJuaXR1cmUlMjBzaG93cm9vbSUyMG1pbmltYWwlMjBpbnRlcmlvciUyMG5ldXRyYWwlMjBwYWxldHRlfGVufDB8fHx8MTc2MDI1OTE2NHww&ixlib=rb-4.1.0&q=85",
      "category": "hero/section",
      "description": "Light luxury living room. Use as decorative hero stripe (masked, <=20% viewport)."
    },
    {
      "url": "https://images.unsplash.com/photo-1688439227385-83245055e376?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBmdXJuaXR1cmUlMjBzaG93cm9vbSUyMG1pbmltYWwlMjBpbnRlcmlvciUyMG5ldXRyYWwlMjBwYWxldHRlfGVufDB8fHx8MTc2MDI1OTE2NHww&ixlib=rb-4.1.0&q=85",
      "category": "pdf/letterhead-watermark",
      "description": "Monochrome showroom shelves. Use faintly (opacity 6–8%) as PDF letterhead watermark."
    }
  ],
  "patterns_and_rules": {
    "financial_table_rules": [
      "Right-align all currency/quantity and use tabular numerals.",
      "Use narrow thousand separators and fixed decimals for totals.",
      "Show VAT groups subtotal lines under table body, with brass hairline separators."
    ],
    "multi_step_form": [
      "Step 1: Client selector PF/PJ. Change required fields accordingly.",
      "Step 2: Products with searchable add (Command palette) and inline VAT select per row.",
      "Step 3: Review summary + currency switcher + notes."
    ],
    "status_indicators": [
      "Pending: blue badge", "Paid: green badge", "Cancelled: red badge"
    ]
  },
  "accessory_guidance": {
    "icons": "Use lucide-react only. Example: import { Eye, Send, Check, Download, Filter } from 'lucide-react'",
    "toasts": "Use sonner for all alerts and confirmations. Place <Toaster/> at root layout.",
    "date_range": "Use shadcn Calendar inside Popover with two-month display for range."
  },
  "testing": {
    "convention": "kebab-case, role-first naming, stable under refactors.",
    "critical_ids": [
      "login-form-submit-button",
      "filters-status-select",
      "date-range-apply-button",
      "invoice-row-<id>",
      "proforma-send-email-button",
      "confirm-payment-button",
      "company-settings-save-button"
    ]
  },
  "instructions_to_main_agent": [
    "1) Install libraries listed in additional_libraries.install and generate shadcn primitives.",
    "2) Create ./components/ui/*.js wrappers that re-export shadcn/ui components using named exports only.",
    "3) Add CSS tokens to app/globals.css (css_setup.globals_extension).",
    "4) Build feature components using the js_scaffolds as starting points, ensuring every interactive element has data-testid.",
    "5) Implement DataTable with @tanstack/react-table for sorting, filtering, zebra striping, and sticky headers.",
    "6) Implement multi-step proforma form with Tabs: PF/PJ conditional fields, products Command palette add, VAT grouping totals, RON/EUR currency select.",
    "7) Add Proforma PDF Preview with fullscreen Dialog (PDFPreviewDialog), iframe by default; provide download/email actions.",
    "8) Enhance ProductsAdmin price field with VAT selector and badge; highlight when not 21% with brass border.",
    "9) Wire sonner toasts for success/error of save, email, confirm payment.",
    "10) Verify all contrast and keyboard nav. Do not apply transition: all anywhere."
  ],
  "general_ui_ux_appendix": "- You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n- You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
}
