import { observer } from "mobx-react-lite";
import { autorun } from "mobx";
import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useState } from "react";
import type {
  MobxQuery,
  MobxQueryDevtoolsEntry,
  MobxQueryDevtoolsEvent,
} from "@tinkerbells88/mobx-query";
import {
  applyDevtoolsAction,
  filterDevtoolsEntries,
  getDevtoolsStatus,
  getDevtoolsStatusCounts,
  stringifyDevtoolsValue,
} from "./core";
import type { MobxQueryDevtoolsOptions } from "./index";

type AppProps = {
  client: MobxQuery;
  initialIsOpen: boolean;
  side: "left" | "right";
};

const icon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 15.5V19h3.5M20 15.5V19h-3.5M4 8.5V5h3.5M20 8.5V5h-3.5" />
    <path d="M8.5 12h7M12 8.5v7" />
  </svg>
);

const QueryRow = observer(
  ({
    entry,
    selected,
    onSelect,
  }: {
    entry: MobxQueryDevtoolsEntry;
    selected: boolean;
    onSelect: () => void;
  }) => {
    const state = entry.query.getDevtoolsState();
    const status = getDevtoolsStatus(state);
    const key = stringifyDevtoolsValue(entry.key);

    return (
      <button
        className={`entry ${selected ? "selected" : ""}`}
        onClick={onSelect}
      >
        <i className={`dot ${status}`} />
        <span className="entry-content">
          <span className="entry-key">{key}</span>
          <span className="entry-meta">
            {entry.type} · {entry.hash.slice(0, 28)}
          </span>
        </span>
      </button>
    );
  },
);

const Summary = observer(
  ({ entries }: { entries: MobxQueryDevtoolsEntry[] }) => {
    const counts = getDevtoolsStatusCounts(entries);
    return (
      <div className="summary">
        <span className="pill">
          fetching <b>{counts.loading}</b>
        </span>
        <span className="pill">
          cached <b>{counts.success}</b>
        </span>
        <span className="pill">
          errors <b>{counts.error}</b>
        </span>
      </div>
    );
  },
);

const Inspector = observer(
  ({
    entry,
    events,
    onAction,
  }: {
    entry?: MobxQueryDevtoolsEntry;
    events: MobxQueryDevtoolsEvent[];
    onAction: (
      action: Parameters<typeof applyDevtoolsAction>[1],
      value?: string,
    ) => void;
  }) => {
    const [draft, setDraft] = useState("");
    const [jsonError, setJsonError] = useState("");

    useEffect(() => {
      setDraft("");
      setJsonError("");
    }, [entry?.hash]);
    if (!entry)
      return (
        <div className="inspector-empty">
          <div>
            Выберите query, чтобы изучить
            <br />
            состояние и кэшированные данные.
          </div>
        </div>
      );

    const state = entry.query.getDevtoolsState();
    const status = getDevtoolsStatus(state);
    const execute = (action: Parameters<typeof applyDevtoolsAction>[1]) => {
      try {
        onAction(action, action === "apply" ? draft : undefined);
        setJsonError("");
      } catch {
        setJsonError("Valid JSON is required");
      }
    };

    return (
      <>
        <div className="detail-head">
          <div className="detail-title">
            <p className="detail-key">{stringifyDevtoolsValue(entry.key)}</p>
            <p className="detail-sub">{entry.hash}</p>
          </div>
          <span className={`status-label ${status}`}>{status}</span>
        </div>
        <div className="actions">
          <button
            className="action"
            disabled={entry.type === "mutation" || !entry.query.sync}
            onClick={() => execute("refetch")}
          >
            Refetch
          </button>
          <button
            className="action"
            disabled={entry.type === "mutation" || !entry.query.invalidate}
            onClick={() => execute("invalidate")}
          >
            Invalidate
          </button>
          {entry.type === "infinite" && (
            <button className="action" onClick={() => execute("more")}>
              Fetch more
            </button>
          )}
          <button className="action" onClick={() => execute("loading")}>
            Preview loading
          </button>
          <button className="action" onClick={() => execute("error")}>
            Preview error
          </button>
          <button className="action" onClick={() => execute("reset")}>
            Clear preview
          </button>
        </div>
        <div className="meta-grid">
          <div className="meta">
            <span>Type</span>
            <b>{entry.type}</b>
          </div>
          <div className="meta">
            <span>Fetch policy</span>
            <b>{entry.meta.fetchPolicy}</b>
          </div>
          <div className="meta">
            <span>Auto fetch</span>
            <b>{String(entry.meta.enabledAutoFetch)}</b>
          </div>
          <div className="meta">
            <span>Polling</span>
            <b>
              {entry.meta.pollingTime ? `${entry.meta.pollingTime}ms` : "off"}
            </b>
          </div>
        </div>
        <p className="section-title">Cached data</p>
        <textarea
          className="code"
          spellCheck={false}
          value={draft || stringifyDevtoolsValue(state.data)}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="actions">
          <button className="action" onClick={() => execute("apply")}>
            Apply JSON
          </button>
        </div>
        {jsonError && <p className="error-box">{jsonError}</p>}
        {state.error !== undefined && (
          <>
            <p className="section-title">Error</p>
            <pre className="error-box">
              {stringifyDevtoolsValue(state.error)}
            </pre>
          </>
        )}
        <p className="section-title">Recent events</p>
        <pre className="code readonly">
          {events
            .slice(-5)
            .reverse()
            .map(
              (event) =>
                `${new Date(event.timestamp).toLocaleTimeString()}  ${event.type}`,
            )
            .join("\n") || "No lifecycle events yet."}
        </pre>
      </>
    );
  },
);

const DevtoolsApp = ({ client, initialIsOpen, side }: AppProps) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [entries, setEntries] = useState(() => client.getDevtoolsEntries());
  const [events, setEvents] = useState(() => client.getDevtoolsEvents());
  const [filter, setFilter] = useState("");
  const [selectedHash, setSelectedHash] = useState<string>();
  const [, setRevision] = useState(0);

  useEffect(
    () =>
      client.subscribeDevtools(() => {
        setEntries(client.getDevtoolsEntries());
        setEvents(client.getDevtoolsEvents());
      }),
    [client],
  );

  useEffect(
    () =>
      autorun(() => {
        entries.forEach((entry) => entry.query.getDevtoolsState());
        setRevision((revision) => revision + 1);
      }),
    [entries],
  );

  const visible = useMemo(
    () => filterDevtoolsEntries(entries, filter),
    [entries, filter],
  );
  const selected =
    visible.find((entry) => entry.hash === selectedHash) ?? visible[0];
  const queries = visible.filter((entry) => entry.type !== "mutation");
  const mutations = visible.filter((entry) => entry.type === "mutation");
  const execute = (
    action: Parameters<typeof applyDevtoolsAction>[1],
    value?: string,
  ) => {
    if (selected) void applyDevtoolsAction(selected, action, value);
  };

  return (
    <div className="mq-root">
      <button
        className={`launcher ${side}`}
        onClick={() => setIsOpen((value) => !value)}
        aria-label="Open MobX Query devtools"
      >
        {icon}
        <span className="count">{entries.length}</span>
      </button>
      {isOpen && (
        <section className={`panel ${side}`} aria-label="MobX Query Devtools">
          <header className="topbar">
            <div className="brand">
              <span className="brand-mark" />
              mobx-query
            </div>
            <Summary entries={entries} />
            <button
              className="icon-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close devtools"
            >
              ×
            </button>
          </header>
          <div className="controls">
            <input
              className="search"
              placeholder="Filter by query key…"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <span className="pill">{visible.length} shown</span>
          </div>
          <div className="workspace">
            <aside className="sidebar">
              {queries.length ? (
                <>
                  <div className="group-title">Queries ({queries.length})</div>
                  {queries.map((entry) => (
                    <QueryRow
                      key={entry.hash}
                      entry={entry}
                      selected={entry.hash === selected?.hash}
                      onSelect={() => setSelectedHash(entry.hash)}
                    />
                  ))}
                </>
              ) : (
                <div className="empty-list">Запросы ещё не созданы.</div>
              )}
              {mutations.length > 0 && (
                <>
                  <div className="group-title">
                    Mutations ({mutations.length})
                  </div>
                  {mutations.map((entry) => (
                    <QueryRow
                      key={entry.hash}
                      entry={entry}
                      selected={entry.hash === selected?.hash}
                      onSelect={() => setSelectedHash(entry.hash)}
                    />
                  ))}
                </>
              )}
            </aside>
            <main className="inspector">
              <Inspector entry={selected} events={events} onAction={execute} />
            </main>
          </div>
        </section>
      )}
    </div>
  );
};

export function mountReactMobxQueryDevtools(
  client: MobxQuery,
  target: HTMLElement = document.body,
  options: MobxQueryDevtoolsOptions = {},
  styles: string,
) {
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const stylesheet = document.createElement("style");
  stylesheet.textContent = styles;
  const mountPoint = document.createElement("div");
  shadow.append(stylesheet, mountPoint);
  target.appendChild(host);
  const root = createRoot(mountPoint);
  root.render(
    <DevtoolsApp
      client={client}
      initialIsOpen={options.initialIsOpen ?? false}
      side={options.position === "bottom-left" ? "left" : "right"}
    />,
  );

  return () => {
    root.unmount();
    host.remove();
  };
}
