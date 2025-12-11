export const cssStyles = `
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
input { font: inherit; color: inherit; }

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
.mq-p-2 { padding: 8px; }
.mq-p-4 { padding: 16px; }
.mq-mb-2 { margin-bottom: 8px; }
.mq-gap-2 { gap: 8px; }

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

.mq-sidebar-header {
  padding: 12px;
  border-bottom: 1px solid var(--mq-border);
}
.mq-sidebar-header h3 {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--mq-text-muted);
  margin-bottom: 8px;
}
.mq-input {
  width: 100%;
  background: var(--mq-bg-main);
  border: 1px solid var(--mq-border);
  color: var(--mq-text-main);
  padding: 6px 10px;
  border-radius: 4px;
}

.mq-query-list { flex: 1; }
.mq-query-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  color: var(--mq-text-muted);
  gap: 8px;
}
.mq-query-item:hover { background: var(--mq-bg-hover); color: var(--mq-text-main); }
.mq-query-item.active {
  background: var(--mq-bg-hover);
  color: var(--mq-text-main);
  border-left: 3px solid var(--mq-primary);
}
.mq-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.mq-query-key {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
  font-size: 12px;
}

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
.mq-content { padding: 16px; }
.mq-section { margin-bottom: 20px; }
.mq-section label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mq-text-muted);
  margin-bottom: 6px;
}
.mq-code-box {
  display: block;
  padding: 8px;
  background: rgba(0,0,0,0.2);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: var(--mq-text-muted);
  overflow-x: auto;
}

.mq-json-viewer {
  background: #0d1117;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--mq-border);
  overflow-x: auto;
}
.mq-json-viewer pre {
  font-family: monospace;
  font-size: 12px;
  color: #a5d6ff;
}
.mq-border-error {
  border-color: var(--mq-error);
  background: rgba(239, 68, 68, 0.08);
}
.mq-text-error { color: var(--mq-error); }

.mq-empty-state,
.mq-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--mq-text-muted);
}

.mq-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.mq-xs-btn {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--mq-primary);
  color: white;
  border-radius: 2px;
  border: 1px solid transparent;
}
.mq-editor-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mq-json-textarea {
  width: 100%;
  min-height: 200px;
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
.mq-json-error {
  color: var(--mq-error);
  font-size: 11px;
}

.mq-control-grid {
  display: flex;
  gap: 12px;
  background: var(--mq-bg-panel);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--mq-border);
}
.mq-checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
}
.mq-status-text { color: var(--mq-text-muted); }
.mq-status-text.active { color: var(--mq-fetching); font-weight: bold; }
.mq-status-text.success { color: var(--mq-success); }
.mq-status-text.error { color: var(--mq-error); }
`;
