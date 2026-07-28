export const cssStyles = `
:host {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:host {
  --mq-bg-main: #0b1521;
  --mq-bg-panel: #141f2e;
  --mq-bg-hover: #1d2a3b;
  --mq-border: #2d3748;
  --mq-text-main: #e2e8f0;
  --mq-text-muted: #94a3b8;
  --mq-primary: #3b82f6;
  --mq-primary-hover: #2563eb;
  --mq-danger: #ef4444;
  --mq-success: #10b981;
  --mq-fetching: #3b82f6;
  --mq-error: #ef4444;
  --mq-idle: #6b7280;
  --mq-radius: 8px;

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--mq-text-main);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
button { background: none; border: none; cursor: pointer; color: inherit; font: inherit; }
input, select, textarea { font: inherit; color: inherit; }

/* Scrollbar styles */
::-webkit-scrollbar { width: 12px; height: 12px; }
::-webkit-scrollbar-track { background: var(--mq-bg-main); }
::-webkit-scrollbar-thumb {
  background: var(--mq-border);
  border-radius: 6px;
  border: 2px solid var(--mq-bg-main);
}
::-webkit-scrollbar-thumb:hover { background: var(--mq-text-muted); }
::-webkit-scrollbar-thumb:active { background: var(--mq-primary); }
* { scrollbar-width: thin; scrollbar-color: var(--mq-border) var(--mq-bg-main); }

.mq-devtools {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 55vh;
  max-height: 90vh;
  min-height: 220px;
  background: var(--mq-bg-main);
  border-top: 1px solid var(--mq-border);
  display: flex;
  z-index: 99999;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.15);
}

.mq-resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: background-color 0.2s;
}
.mq-resize-handle:hover { background-color: rgba(59, 130, 246, 0.1); }
.mq-resize-handle.dragging { background-color: rgba(59, 130, 246, 0.2); }
.mq-resize-handle-bar {
  width: 40px;
  height: 3px;
  background: var(--mq-border);
  border-radius: 2px;
  transition: background-color 0.2s;
}
.mq-resize-handle:hover .mq-resize-handle-bar,
.mq-resize-handle.dragging .mq-resize-handle-bar { background: var(--mq-primary); }

.mq-sidebar {
  width: 320px;
  border-right: 1px solid var(--mq-border);
  display: flex;
  flex-direction: column;
  background: var(--mq-bg-panel);
}

.mq-inspector {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--mq-bg-main);
}

.mq-scroll-y { overflow-y: auto; }
.mq-flex-center { display: flex; align-items: center; justify-content: center; }

.mq-btn {
  padding: 6px 12px;
  border-radius: 4px;
  background: var(--mq-bg-hover);
  border: 1px solid var(--mq-border);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}
.mq-btn:hover { background: var(--mq-border); }
.mq-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.mq-btn-primary { background: var(--mq-primary); border-color: var(--mq-primary); color: white; }
.mq-btn-primary:hover { background: var(--mq-primary-hover); }
.mq-btn-danger { background: rgba(239, 68, 68, 0.15); border-color: var(--mq-danger); color: var(--mq-danger); }
.mq-btn-danger:hover { background: rgba(239, 68, 68, 0.25); }

.mq-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  color: white;
  background: var(--mq-border);
}

.mq-floater {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100000;
}

.tsqd-panel {
  position: relative;
}

.tsqd-resize {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  z-index: 1001;
}

.tsqd-resize-bar {
  width: 48px;
  height: 3px;
  background: var(--mq-border);
  border-radius: 2px;
}

.tsqd-detached-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 1001;
}

.tsqd-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--mq-bg-panel);
  border: 1px solid var(--mq-border);
  color: var(--mq-text-main);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.tsqd-icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
}

.tsqd-open-button {
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1px solid var(--mq-border);
  background: var(--mq-bg-panel);
  color: var(--mq-text-main);
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  z-index: 100001;
}

.tsqd-open-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
}
.mq-logo-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--mq-bg-panel);
  border: 1px solid var(--mq-border);
  font-size: 22px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}
.mq-logo-btn:hover { transform: translateY(-2px); }
.mq-close-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  padding: 6px 10px;
  font-size: 20px;
  color: var(--mq-text-muted);
}
.mq-close-btn:hover { color: var(--mq-text-main); }

.mq-sidebar-header { padding: 12px; border-bottom: 1px solid var(--mq-border); display: flex; flex-direction: column; gap: 8px; }
.mq-header-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.mq-sidebar-header h3 { font-size: 12px; text-transform: uppercase; color: var(--mq-text-muted); margin: 0; }

.mq-input, .mq-select {
  width: 100%;
  background: var(--mq-bg-main);
  border: 1px solid var(--mq-border);
  color: var(--mq-text-main);
  padding: 6px 10px;
  border-radius: 4px;
}

.mq-sort-controls { display: flex; gap: 4px; }
.mq-sort-controls > *:first-child { flex: 1; }
.mq-sort-order-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mq-bg-hover);
  border: 1px solid var(--mq-border);
  border-radius: 4px;
  color: var(--mq-text-main);
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}
.mq-sort-order-btn:hover { background: var(--mq-border); }

.mq-query-list { flex: 1; overflow-y: auto; }
.mq-query-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  color: var(--mq-text-muted);
  gap: 8px;
  transition: all 0.2s;
}
.mq-query-item:hover { background: var(--mq-bg-hover); color: var(--mq-text-main); }
.mq-query-item.active { background: var(--mq-bg-hover); color: var(--mq-text-main); border-left: 3px solid var(--mq-primary); }
.mq-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.mq-status-dot.fetching { background: var(--mq-fetching); }
.mq-status-dot.error { background: var(--mq-error); }
.mq-status-dot.success { background: var(--mq-success); }
.mq-status-dot.idle { background: var(--mq-idle); }
.mq-query-key { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: monospace; font-size: 12px; }

.mq-toolbar {
  padding: 12px 16px;
  border-bottom: 1px solid var(--mq-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--mq-bg-panel);
}
.mq-title { font-size: 14px; font-weight: 700; margin: 0; }
.mq-actions { display: flex; gap: 8px; }
.mq-content { padding: 16px; overflow-y: auto; }
.mq-section { margin-bottom: 20px; }
.mq-section label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--mq-text-muted); margin-bottom: 6px; }

.mq-codebox, .mq-code-box {
  display: block;
  padding: 8px;
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: var(--mq-text-muted);
  overflow-x: auto;
  border: 1px solid transparent;
}
.mq-codebox.error { border: 1px solid var(--mq-error); color: var(--mq-error); }

.mq-empty-state, .mq-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--mq-text-muted); }

.mq-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }

.mq-control-grid {
  display: flex;
  gap: 12px;
  background: var(--mq-bg-panel);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--mq-border);
}
.mq-status-text { color: var(--mq-text-muted); }
.mq-status-text.active { color: var(--mq-fetching); font-weight: bold; }
.mq-status-text.success { color: var(--mq-success); }
.mq-status-text.error { color: var(--mq-error); }

.mq-view-toggle { display: flex; gap: 4px; background: var(--mq-bg-hover); padding: 2px; border-radius: 4px; border: 1px solid var(--mq-border); margin-left: auto; }
.mq-toggle-btn { padding: 4px 12px; font-size: 11px; background: transparent; border: none; border-radius: 2px; color: var(--mq-text-muted); cursor: pointer; transition: all 0.2s; }
.mq-toggle-btn.active { background: var(--mq-primary); color: white; }
.mq-toggle-btn:hover:not(.active) { color: var(--mq-text-main); }

.mq-explorer-container { background: var(--mq-bg-panel); padding: 12px; border-radius: 4px; border: 1px solid var(--mq-border); max-height: 400px; overflow-y: auto; }
.mq-explorer { color: var(--mq-text-main); font-family: monospace; font-size: 12px; }
.mq-explorer-row { display: flex; align-items: center; gap: 6px; padding: 4px 6px; }
.mq-explorer-row.expandable { cursor: pointer; }
.mq-explorer-children { padding-left: 12px; border-left: 1px dashed var(--mq-border); }
.mq-explorer-label { color: var(--mq-text-muted); }
.mq-explorer-value { color: var(--mq-text-main); }
.mq-expander { margin-left: auto; color: var(--mq-text-muted); }

.mq-status-counter { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--mq-text-muted); }
.mq-status-counter .mq-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.mq-status-counter .mq-dot.loading { background: var(--mq-fetching); }
.mq-status-counter .mq-dot.success { background: var(--mq-success); }
.mq-status-counter .mq-dot.error { background: var(--mq-error); }
.mq-status-counter .mq-dot.idle { background: var(--mq-idle); }

.mq-checkbox { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
.mq-checkbox input { accent-color: var(--mq-primary); }

.mq-json-editor { display: flex; flex-direction: column; gap: 8px; }
.mq-json-textarea {
  width: 100%;
  min-height: 120px;
  background: #0d1117;
  color: #a5d6ff;
  border: 1px solid var(--mq-border);
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  outline: none;
}
.mq-json-textarea:focus { border-color: var(--mq-primary); }
.mq-json-preview {
  background: #0d1117;
  color: #a5d6ff;
  border: 1px solid var(--mq-border);
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
  font-size: 12px;
  overflow-x: auto;
}
.mq-json-error { color: var(--mq-error); font-size: 11px; }

/* --- TanStack-inspired styles --- */
.tsqd-root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #e5e7eb;
}
.tsqd-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100000;
}
.tsqd-fab-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #111827;
  border: 1px solid #1f2937;
  font-size: 22px;
  color: #e5e7eb;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.tsqd-fab-btn:hover { transform: translateY(-2px); }
.tsqd-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  min-height: 220px;
  max-height: 90vh;
  background: #0b1021;
  border-top: 1px solid #182035;
  display: flex;
  flex-direction: column;
  z-index: 99999;
  box-shadow: 0 -14px 30px rgba(0,0,0,0.45);
}
.tsqd-resize {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
}
.tsqd-resize-bar {
  width: 50px;
  height: 3px;
  border-radius: 999px;
  background: #374151;
}
.tsqd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #182035;
  background: #0c1326;
}
.tsqd-tabs {
  display: inline-flex;
  background: #10172b;
  border: 1px solid #182035;
  border-radius: 8px;
  overflow: hidden;
}
.tsqd-tab {
  padding: 6px 12px;
  background: transparent;
  color: #9ca3af;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.tsqd-tab.active { background: #182035; color: #f3f4f6; }
.tsqd-tab.muted { color: #6b7280; }
.tsqd-brand {
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.tsqd-logo {
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #f59e0b;
}
.tsqd-sub {
  font-size: 12px;
  color: #9ca3af;
}
.tsqd-actions { display: flex; gap: 8px; }
.tsqd-icon-btn {
  background: #10172b;
  color: #e5e7eb;
  border: 1px solid #182035;
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
}
.tsqd-body {
  flex: 1;
  display: grid;
  grid-template-columns: 380px 1fr;
  min-height: 0;
}
.tsqd-body .tsqd-summary {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tsqd-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
}
.tsqd-left {
  border-right: 1px solid #182035;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #0c1326;
}
.tsqd-toolbar {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #182035;
  flex-wrap: wrap;
  align-items: center;
}
.tsqd-input, .tsqd-select {
  background: #10172b;
  border: 1px solid #182035;
  color: #e5e7eb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}
.tsqd-select { min-width: 140px; }
.tsqd-stats {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: #9ca3af;
}
.tsqd-stats .dot,
.tsqd-summary .dot { display: inline-flex; gap: 4px; align-items: center; }
.tsqd-stats .dot::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.tsqd-stats .dot.green::before,
.tsqd-summary .dot.green::before { background: #10b981; }
.tsqd-stats .dot.blue::before,
.tsqd-summary .dot.blue::before { background: #3b82f6; }
.tsqd-summary .dot.purple::before { background: #8b5cf6; }
.tsqd-summary .dot.amber::before { background: #f59e0b; }
.tsqd-stats .dot.red::before,
.tsqd-summary .dot.red::before { background: #ef4444; }
.tsqd-stats .dot.gray::before,
.tsqd-summary .dot.gray::before { background: #6b7280; }
.tsqd-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tsqd-row {
  width: 100%;
  text-align: left;
  background: #0d1529;
  border: 1px solid #182035;
  color: #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
}
.tsqd-row:hover { border-color: #2f3b55; }
.tsqd-row.active { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6 inset; }
.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #111827;
  color: #d1d5db;
}
.badge.green { background: #0d3b2a; color: #a7f3d0; }
.badge.blue { background: #0f245a; color: #bfdbfe; }
.badge.red { background: #4a1010; color: #fecaca; }
.badge.gray { background: #0c111b; color: #9ca3af; }
.badge.amber { background: #4b2c07; color: #fcd34d; }
.badge.purple { background: #2b0f5c; color: #e9d5ff; }
.tsqd-key {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 12px;
  color: #e5e7eb;
  word-break: break-word;
}
.tsqd-empty {
  color: #6b7280;
  padding: 24px;
  text-align: center;
  width: 100%;
}
.tsqd-detached-notice {
  padding: 16px;
  background: #0f172a;
  border-top: 1px solid #1f2937;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}
.tsqd-right {
  background: #0b0f17;
  overflow-y: auto;
  padding: 16px;
}
.tsqd-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.tsqd-details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tsqd-details-title { font-weight: 700; }
.tsqd-details-section {
  background: #0f172a;
  border: 1px solid #1f2937;
  border-radius: 8px;
  padding: 12px;
}
.tsqd-label {
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}
.tsqd-code {
  background: #0b0f17;
  border: 1px solid #1f2937;
  border-radius: 6px;
  padding: 10px;
  color: #e5e7eb;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}
.tsqd-code.error { border-color: #ef4444; color: #fecaca; }
.tsqd-details-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tsqd-btn {
  background: #111827;
  color: #e5e7eb;
  border: 1px solid #1f2937;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  cursor: pointer;
}
.tsqd-btn.primary { background: #2563eb; border-color: #2563eb; }
.tsqd-btn.danger { background: #7f1d1d; border-color: #7f1d1d; }
.tsqd-btn.ghost { background: #0b0f17; }
.tsqd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.tsqd-explorer {
  background: #0b0f17;
  border: 1px solid #1f2937;
  border-radius: 6px;
  padding: 8px;
  max-height: 320px;
  overflow-y: auto;
}
`;
