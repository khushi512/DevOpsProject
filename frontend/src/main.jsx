import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const [resTasks, resStats] = await Promise.all([
        fetch(`${API}/tasks`),
        fetch(`${API}/tasks/stats`)
      ]);
      if (!resTasks.ok || !resStats.ok) {
        throw new Error('Backend API unavailable. Check if FastAPI and PostgreSQL are running.');
      }
      setTasks(await resTasks.json());
      setStats(await resStats.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visibleTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  const advanceStatus = async (task) => {
    const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
    try {
      await fetch(`${API}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: nextStatus })
      });
      load();
    } catch (err) {
      setError('Failed to update incident status.');
    }
  };

  const deleteIncident = async (id) => {
    if (!window.confirm('Are you sure you want to resolve and delete this incident?')) return;
    try {
      await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError('Failed to delete incident.');
    }
  };

  const createIncident = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);

    try {
      const response = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: f.get('title'),
          description: f.get('description') || '',
          priority: f.get('priority'),
          assignee: f.get('assignee') || 'Khushboo',
          status: 'TODO'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to log incident.');
      }

      form.reset();
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">⚡</span>
          <div>
            <b>OpsDesk</b>
            <small>Cloud Reliability</small>
          </div>
        </div>

        <nav>
          <a className="active">⚡ <span>Incidents & Alerts</span></a>
          <a>📊 <span>Cluster Telemetry</span></a>
          <a>🛡️ <span>SRE Runbooks</span></a>
          <a>⏱️ <span>SLA & MTTR</span></a>
        </nav>

        <div className="side-bottom">
          <div className="cluster-status">
            <div className="cluster-status-head">
              <span className="live-pulse"></span>
              <span>AWS EKS Cluster Live</span>
            </div>
            <p>ap-south-1 • 99.98% Uptime<br/>Helm release: taskboard v1.0</p>
          </div>

          <div className="profile">
            <div className="avatar">KS</div>
            <div>
              <b>Khushboo</b>
              <small>Lead DevOps & SRE</small>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header>
          <div>
            <p className="eyebrow">OPERATIONS / INCIDENT MANAGEMENT</p>
            <h1>OpsDesk Incident Command Center 👋</h1>
            <p className="muted">Monitor, triage, and resolve production infrastructure incidents.</p>
          </div>
          <div className="header-actions">
            <button className="secondary-btn" onClick={load} title="Refresh telemetry">↻ Refresh</button>
            <button className="primary" onClick={() => setShowForm(true)}>＋ Trigger Incident</button>
          </div>
        </header>

        {error && (
          <div className="alert">
            ⚠️ <b>System Alert:</b> {error} (Ensure backend container and PostgreSQL are healthy)
          </div>
        )}

        {/* KPI Stats */}
        <section className="stats">
          <div className="stat">
            <div className="stat-icon total">⚡</div>
            <div>
              <small>Total Incidents</small>
              <strong>{stats.total}</strong>
              <span>All-time recorded</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon todo">🔴</div>
            <div>
              <small>Active Alerts</small>
              <strong>{stats.todo}</strong>
              <span>Requires response</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon in-progress">🟡</div>
            <div>
              <small>Investigating</small>
              <strong>{stats.inProgress}</strong>
              <span>Triage in progress</span>
            </div>
          </div>
          <div className="stat">
            <div className="stat-icon done">🟢</div>
            <div>
              <small>Resolved</small>
              <strong>{stats.done}</strong>
              <span>Closed & mitigated</span>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="content-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>Live Incidents</h2>
                <p className="muted">Filter by severity and current resolution state.</p>
              </div>
              <div className="filters">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'TODO', label: 'Active Alerts' },
                  { key: 'IN_PROGRESS', label: 'Investigating' },
                  { key: 'DONE', label: 'Resolved' }
                ].map(item => (
                  <button
                    key={item.key}
                    className={filter === item.key ? 'selected' : ''}
                    onClick={() => setFilter(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="empty">Gathering incident telemetry…</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Incident & Impact</th>
                      <th>Lead Responder</th>
                      <th>Severity</th>
                      <th>Resolution Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTasks.map(t => (
                      <tr key={t.id}>
                        <td>
                          <div className="task-title">
                            <span className={`dot ${t.status.toLowerCase()}`}></span>
                            <div>
                              <b>{t.title}</b>
                              <small>{t.description || 'No extended log details recorded.'}</small>
                            </div>
                          </div>
                        </td>
                        <td>{t.assignee}</td>
                        <td>
                          <span className={`priority ${t.priority.toLowerCase()}`}>
                            {t.priority === 'HIGH' ? 'P1 - HIGH' : t.priority === 'MEDIUM' ? 'P2 - MEDIUM' : 'P3 - LOW'}
                          </span>
                        </td>
                        <td>
                          <span className={`status ${t.status.toLowerCase()}`}>
                            {t.status === 'TODO' ? '🔴 Triggered' : t.status === 'IN_PROGRESS' ? '🟡 Investigating' : '🟢 Resolved'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="icon-btn"
                              onClick={() => advanceStatus(t)}
                              title="Advance triage state"
                            >
                              ↻ Advance
                            </button>
                            <button
                              className="icon-btn delete"
                              onClick={() => deleteIncident(t.id)}
                              title="Delete / Archive"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visibleTasks.length && (
                  <div className="empty">No incidents found matching this status filter.</div>
                )}
              </div>
            )}
          </div>

          {/* SRE Activity & Pipeline Panel */}
          <aside className="panel">
            <div className="panel-head">
              <div>
                <h2>SRE Audit Log</h2>
                <p className="muted">Recent automation & system events.</p>
              </div>
            </div>

            <div className="activity-row">
              <span className="activity-icon">🟢</span>
              <div>
                <b>K8s Pod readiness passed</b>
                <small>EKS Ingress active • 2 min ago</small>
              </div>
            </div>
            <div className="activity-row">
              <span className="activity-icon">🛡️</span>
              <div>
                <b>Trivy security gate verified</b>
                <small>0 HIGH / CRITICAL CVEs • 18 min ago</small>
              </div>
            </div>
            <div className="activity-row">
              <span className="activity-icon">⚡</span>
              <div>
                <b>HPA target CPU utilization</b>
                <small>Horizontal autoscale active • 45 min ago</small>
              </div>
            </div>
            <div className="activity-row">
              <span className="activity-icon">🚀</span>
              <div>
                <b>GHCR container artifact pushed</b>
                <small>Tagged with Git SHA • 1 hr ago</small>
              </div>
            </div>

            <div className="pipeline-badge">
              <div className="pipeline-title">Delivery Pipeline Telemetry</div>
              <div className="pipeline-steps">
                <span className="pipeline-step-active">Pytest</span>
                <i></i>
                <span className="pipeline-step-active">Trivy</span>
                <i></i>
                <span className="pipeline-step-active">GHCR</span>
                <i></i>
                <span className="pipeline-step-active">Helm EKS</span>
              </div>
            </div>
          </aside>
        </section>

        {/* Incident Creation Modal */}
        {showForm && (
          <div className="modal-backdrop">
            <form className="modal" onSubmit={createIncident}>
              <div className="modal-head">
                <div>
                  <p className="eyebrow">TRIGGER NEW ALERT</p>
                  <h2>Report Infrastructure Incident</h2>
                </div>
                <button type="button" className="close" onClick={() => setShowForm(false)}>×</button>
              </div>

              <label>
                Incident Summary
                <input
                  name="title"
                  required
                  placeholder="e.g. Ingress Controller 502 Bad Gateway latency spike"
                />
              </label>

              <label>
                Impact & Investigation Notes
                <textarea
                  name="description"
                  placeholder="Provide error logs, affected microservices, or recovery runbooks..."
                />
              </label>

              <div className="form-row">
                <label>
                  Severity Level
                  <select name="priority">
                    <option value="HIGH">P1 - High / Critical</option>
                    <option value="MEDIUM">P2 - Medium</option>
                    <option value="LOW">P3 - Low</option>
                  </select>
                </label>
                <label>
                  Lead Responder
                  <input name="assignee" defaultValue="Khushboo" />
                </label>
              </div>

              <button className="primary full">Log Incident to OpsDesk</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
