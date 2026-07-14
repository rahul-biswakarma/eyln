import { useMemo, useState } from "react";
import {
  StackIcon, CodeIcon, LightbulbIcon, LinkSimpleIcon, ClockIcon, CaretLeftIcon,
  PlusIcon, TrashIcon, DotsThreeIcon, RocketLaunchIcon,
} from "@phosphor-icons/react";
import { useNotes, type Note } from "../../lib/notes";
import { useProjects, type Project, type ProjectStatus } from "../../lib/projects";
import { capturesForProject, projectStats, projectTimeline, type ProjectCaptures, type ProjectStats, type ProjectEvent } from "../../lib/projects-model";
import { relativeTime } from "../../lib/stats";
import { relativeDay, formatDate } from "../../lib/reading";
import { Code as ShikiCode } from "../../components/code-block";
import { CollectionCapture } from "../../components/collection-capture";
import { Tabs, TabsList, TabsTrigger, TabsContent, Popover, PopoverTrigger, PopoverContent } from "../../components/ui";

const STATUS_LABEL: Record<ProjectStatus, string> = { active: "Active", shipped: "Shipped", paused: "Paused", idea: "Idea" };
const STATUS_ORDER: ProjectStatus[] = ["active", "shipped", "paused", "idea"];

export function ProjectsView({ now, focusId, onConsumeFocus }: { now: number; focusId?: string | null; onConsumeFocus?: () => void }) {
  const notes = useNotes((s) => s.notes);
  const projects = useProjects((s) => s.projects);
  const addProject = useProjects((s) => s.addProject);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const effectiveId = focusId ?? selectedId;
  const selected = effectiveId ? projects.find((p) => p.id === effectiveId) ?? null : null;
  if (selected) return <ProjectDetail project={selected} now={now} onBack={() => { setSelectedId(null); onConsumeFocus?.(); }} />;

  const statsById = useMemo(() => {
    const m = new Map<string, ProjectStats>();
    for (const p of projects) m.set(p.id, projectStats(capturesForProject(p.id, notes)));
    return m;
  }, [projects, notes]);

  const handleAdd = () => {
    const t = newTitle.trim();
    if (!t) return;
    const id = addProject({ title: t, status: "active" });
    setNewTitle(""); setAdding(false); setSelectedId(id);
  };

  return (
    <div className="rw-library">
      <header className="rw-lib-header">
        <div className="rw-lib-title">
          <h1>Projects</h1>
          <span className="rw-lib-sub">Everything you're building</span>
        </div>
        <button className="rw-capture-btn" onClick={() => setAdding((v) => !v)}><PlusIcon size={13} weight="bold" /> New Project</button>
      </header>

      {adding && (
        <div className="rw-newspace">
          <input className="rw-input" autoFocus placeholder="Project name…" value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <button className="rw-form-save" disabled={!newTitle.trim()} onClick={handleAdd}>Create</button>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rw-empty">
          <RocketLaunchIcon size={26} weight="duotone" />
          <h4>No projects yet</h4>
          <p>Create a project to collect its architecture notes, code, ideas and references.</p>
        </div>
      ) : (
        <div className="rw-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} stats={statsById.get(p.id)!} now={now} onOpen={() => setSelectedId(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, stats, now, onOpen }: { project: Project; stats: ProjectStats; now: number; onOpen: () => void }) {
  return (
    <button className="rw-card" onClick={onOpen}>
      <span className="rw-space-ic"><StackIcon size={22} weight="duotone" /></span>
      <div className="rw-card-body">
        <div className="rw-card-head">
          <h3>{project.title}</h3>
          <span className="rw-card-author">{STATUS_LABEL[project.status]}</span>
        </div>
        <div className="rw-card-stats">
          <span><StackIcon size={12} /> {stats.architectureCount}</span>
          <span><CodeIcon size={12} /> {stats.codeCount}</span>
          <span><LightbulbIcon size={12} /> {stats.ideaCount}</span>
          <span><LinkSimpleIcon size={12} /> {stats.referenceCount}</span>
          {stats.lastActivity && <span className="rw-card-when"><ClockIcon size={12} /> {relativeTime(stats.lastActivity, now)}</span>}
        </div>
      </div>
    </button>
  );
}

function ProjectDetail({ project, now, onBack }: { project: Project; now: number; onBack: () => void }) {
  const notes = useNotes((s) => s.notes);
  const updateProject = useProjects((s) => s.updateProject);
  const deleteProject = useProjects((s) => s.deleteProject);

  const caps = useMemo(() => capturesForProject(project.id, notes), [project.id, notes]);
  const stats = useMemo(() => projectStats(caps), [caps]);

  return (
    <div className="rw-detail">
      <button className="rw-back" onClick={onBack}><CaretLeftIcon size={14} /> Projects</button>

      <header className="rw-hero">
        <span className="rw-space-ic lg"><StackIcon size={30} weight="duotone" /></span>
        <div className="rw-hero-main">
          <h1>{project.title}</h1>
          <span className="rw-hero-sub">Project</span>
          <div className="rw-hero-controls">
            <select className="rw-select" value={project.status} onChange={(e) => updateProject(project.id, { status: e.target.value as ProjectStatus })}>
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <Popover>
              <PopoverTrigger asChild><button className="rw-icon-btn" aria-label="More"><DotsThreeIcon size={16} weight="bold" /></button></PopoverTrigger>
              <PopoverContent align="start" style={{ width: 150 }}>
                <div className="rw-menu"><button className="danger" onClick={() => { deleteProject(project.id); onBack(); }}><TrashIcon size={12} /> Delete project</button></div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="rw-quickstats">
          <QS icon={<StackIcon size={15} />} value={stats.architectureCount} label="Architecture" />
          <QS icon={<CodeIcon size={15} />} value={stats.codeCount} label="Code" />
          <QS icon={<LightbulbIcon size={15} />} value={stats.ideaCount} label="Ideas" />
          <QS icon={<LinkSimpleIcon size={15} />} value={stats.referenceCount} label="References" />
        </div>
      </header>

      <Tabs defaultValue="overview" className="rw-tabs">
        <div className="rw-tabs-row">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="references">References</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          <CollectionCapture context={{ view: "project", projectId: project.id, projectTitle: project.title }} />
        </div>

        <TabsContent value="overview"><OverviewTab project={project} caps={caps} stats={stats} now={now} /></TabsContent>
        <TabsContent value="architecture"><NotesTab notes={caps.architecture} now={now} empty="No architecture notes yet" /></TabsContent>
        <TabsContent value="code"><CodeTab notes={caps.code} now={now} /></TabsContent>
        <TabsContent value="ideas"><NotesTab notes={caps.ideas} now={now} empty="No ideas captured yet" /></TabsContent>
        <TabsContent value="references"><ReferencesTab notes={caps.references} now={now} /></TabsContent>
        <TabsContent value="timeline"><TimelineTab caps={caps} now={now} /></TabsContent>
      </Tabs>
    </div>
  );
}

function QS({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div className="rw-quickstat"><span className="rw-qs-ic">{icon}</span><span className="rw-qs-val">{value}</span><span className="rw-qs-lbl">{label}</span></div>;
}

function OverviewTab({ project, caps, stats, now }: { project: Project; caps: ProjectCaptures; stats: ProjectStats; now: number }) {
  const recent = caps.all.slice(0, 5);
  return (
    <div className="rw-overview">
      {project.description && <section className="rw-panel"><h4>About</h4><p className="rw-panel-line">{project.description}</p></section>}
      <section className="rw-panel">
        <h4>Contents</h4>
        <div className="rw-statgrid">
          <div><span className="v">{stats.architectureCount}</span><span className="l">Architecture</span></div>
          <div><span className="v">{stats.codeCount}</span><span className="l">Code</span></div>
          <div><span className="v">{stats.ideaCount}</span><span className="l">Ideas</span></div>
          <div><span className="v">{stats.referenceCount}</span><span className="l">References</span></div>
        </div>
      </section>
      <section className="rw-panel">
        <h4>Recent activity</h4>
        {recent.length ? recent.map((n) => (
          <div key={n.id} className="rw-mini-note"><strong>{n.title || n.body.replace(/```/g, "").slice(0, 60)}</strong><span>{relativeDay(n.createdAt, now)}</span></div>
        )) : <p className="rw-panel-line muted">Nothing captured yet.</p>}
      </section>
      <section className="rw-panel"><h4>Last activity</h4><p className="rw-panel-line">{stats.lastActivity ? formatDate(stats.lastActivity) : "—"}</p></section>
    </div>
  );
}

function NotesTab({ notes, now, empty }: { notes: Note[]; now: number; empty: string }) {
  const deleteNote = useNotes((s) => s.deleteNote);
  if (notes.length === 0) return <Empty label={empty} hint="Use Capture to add to this project." />;
  return (
    <div className="rw-cards-col">
      {notes.map((n) => (
        <div key={n.id} className="rw-note-card">
          {n.title && <span className="rw-note-title">{n.title}</span>}
          <p className="rw-note-body">{n.body}</p>
          <div className="rw-note-foot">
            <span className="rw-note-date">{relativeDay(n.createdAt, now)}</span>
            <button className="rw-icon-btn" onClick={() => deleteNote(n.id)} aria-label="Delete"><TrashIcon size={12} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CodeTab({ notes, now }: { notes: Note[]; now: number }) {
  const deleteNote = useNotes((s) => s.deleteNote);
  if (notes.length === 0) return <Empty label="No snippets yet" hint="Save reusable code for this project." />;
  return (
    <div className="rw-cards-col">
      {notes.map((n) => {
        const code = n.body.replace(/^```\w*\n?/, "").replace(/```$/, "").trim();
        return (
          <article key={n.id} className="rw-note-card">
            {n.title && <span className="rw-note-title">{n.title}</span>}
            <ShikiCode code={code} lang={"typescript" as never} />
            <div className="rw-note-foot">
              <span className="rw-note-date">{relativeDay(n.createdAt, now)}</span>
              <button className="rw-icon-btn" onClick={() => deleteNote(n.id)} aria-label="Delete"><TrashIcon size={12} /></button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ReferencesTab({ notes }: { notes: Note[]; now: number }) {
  const deleteNote = useNotes((s) => s.deleteNote);
  if (notes.length === 0) return <Empty label="No references yet" hint="Add links and sources for this project." />;
  const isUrl = (s: string) => /^https?:\/\//i.test(s.trim());
  return (
    <div className="rw-notes">
      {notes.map((n) => (
        <div key={n.id} className="rw-search-hit">
          <span className="rw-hit-ic"><LinkSimpleIcon size={14} /></span>
          <span className="rw-hit-body">
            {n.title && <span className="rw-hit-text">{n.title}</span>}
            {isUrl(n.body)
              ? <a className="rw-hit-book" href={n.body.trim()} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{n.body.trim()}</a>
              : <span className="rw-hit-book">{n.body}</span>}
          </span>
          <button className="rw-icon-btn" onClick={() => deleteNote(n.id)} aria-label="Delete"><TrashIcon size={12} /></button>
        </div>
      ))}
    </div>
  );
}

const P_EVENT_ICON: Record<ProjectEvent["kind"], React.ReactNode> = {
  architecture: <StackIcon size={13} weight="fill" />,
  code: <CodeIcon size={13} weight="fill" />,
  idea: <LightbulbIcon size={13} weight="fill" />,
  reference: <LinkSimpleIcon size={13} weight="fill" />,
};

function TimelineTab({ caps, now }: { caps: ProjectCaptures; now: number }) {
  const events = useMemo(() => projectTimeline(caps), [caps]);
  if (events.length === 0) return <Empty label="No history yet" hint="Your build journey will replay here." />;
  return (
    <div className="rw-timeline">
      {events.map((e, i) => (
        <div key={i} className={`rw-tl-event k-${e.kind}`}>
          <span className="rw-tl-ic">{P_EVENT_ICON[e.kind]}</span>
          <div className="rw-tl-body">
            <span className="rw-tl-label">{e.label}</span>
            {e.detail && <span className="rw-tl-detail">{e.detail}</span>}
            <span className="rw-tl-meta">{relativeDay(e.at, now)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ label, hint }: { label: string; hint: string }) {
  return <div className="rw-empty"><StackIcon size={24} weight="duotone" /><h4>{label}</h4><p>{hint}</p></div>;
}
