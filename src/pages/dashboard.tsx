import { Link } from "react-router-dom";
import { lessonPath } from "../content/registry";
import { useProgress } from "../lib/progress";
import { computeStats, formatMinutes, recentActivity, relativeTime } from "../lib/stats";
import { StatCard } from "../components/stat-card";
import { Sparkline } from "../components/sparkline";
import { RoadmapRail } from "../components/roadmap-rail";
import { ProgressRing } from "../components/progress-ring";
import { CoachCard } from "../components/coach-card";
import { TrackCard } from "../components/track-card";
import { ModuleIcon } from "../components/module-icon";
import { tracks } from "../content/tracks";

export function Dashboard() {
  const done = useProgress((s) => s.done);
  const quizScores = useProgress((s) => s.quizScores);
  const lastVisited = useProgress((s) => s.lastVisited);
  const s = computeStats(done, quizScores);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  const activity = recentActivity(lastVisited, done);
  const now = Date.now();
  const next = s.nextRef;
  
  const series = s.perModuleDone.reduce<number[]>((acc, n) => {
    acc.push((acc[acc.length - 1] ?? 0) + n);
    return acc;
  }, []);

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="eyebrow">Mission Control</div>
          <h1>{greeting}, builder</h1>
          <div className="sub">
            {s.lessonsDone === 0
              ? "Your journey from a single triangle to a 3D world starts here."
              : `You've cleared ${s.lessonsDone} of ${s.totalLessons} lessons. Keep the momentum.`}
          </div>
        </div>
        {next && (
          <Link className="btn primary" to={lessonPath(next.module.id, next.lesson.id)}>
            {s.lessonsDone === 0 ? "Start learning" : "Resume"} →
          </Link>
        )}
      </div>

      <div className="stat-row">
        <StatCard
          label="Overall progress"
          value={`${s.overallPct}%`}
          foot={<span>{s.lessonsDone}/{s.totalLessons} lessons</span>}
        >
          <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
            <ProgressRing value={s.overallPct / 100} size={44} />
          </div>
        </StatCard>
        <StatCard
          label="Modules"
          value={`${s.modulesComplete}/${s.totalModules}`}
          foot={<span>{s.modulesStarted} started</span>}
        >
          <div style={{ marginTop: "0.6rem" }}>
            <Sparkline values={series.length ? series : [0]} />
          </div>
        </StatCard>
        <StatCard
          label="Time remaining"
          value={formatMinutes(s.minutesRemaining)}
          foot={<span>of {formatMinutes(s.minutesTotal)} total</span>}
        />
        <StatCard
          label="Avg quiz score"
          value={s.avgQuizScore === null ? "—" : `${s.avgQuizScore}%`}
          foot={<span className={s.avgQuizScore !== null && s.avgQuizScore >= 60 ? "delta up" : "delta down"}>
            {s.avgQuizScore === null ? "no quizzes yet" : s.avgQuizScore >= 60 ? "passing" : "review"}
          </span>}
        />
      </div>

      <div className="dash-body">
        <div className="stat-row">
          <StatCard
            label="Overall progress"
            value={`${s.overallPct}%`}
            foot={<span>{s.lessonsDone}/{s.totalLessons} lessons</span>}
          >
            <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
              <ProgressRing value={s.overallPct / 100} size={44} />
            </div>
          </StatCard>
          <StatCard
            label="Modules"
            value={`${s.modulesComplete}/${s.totalModules}`}
            foot={<span>{s.modulesStarted} started</span>}
          >
            <div style={{ marginTop: "0.6rem" }}>
              <Sparkline values={series.length ? series : [0]} />
            </div>
          </StatCard>
          <StatCard
            label="Time remaining"
            value={formatMinutes(s.minutesRemaining)}
            foot={<span>of {formatMinutes(s.minutesTotal)} total</span>}
          />
          <StatCard
            label="Avg quiz score"
            value={s.avgQuizScore === null ? "—" : `${s.avgQuizScore}%`}
            foot={<span className={s.avgQuizScore !== null && s.avgQuizScore >= 60 ? "delta up" : "delta down"}>
              {s.avgQuizScore === null ? "no quizzes yet" : s.avgQuizScore >= 60 ? "passing" : "review"}
            </span>}
          />
        </div>

        <div className="grid-dash">
          <div className="col-stack">
            {next ? (
              <Link className="card grad continue hover" to={lessonPath(next.module.id, next.lesson.id)}>
                <span className="cta-ic"><ModuleIcon id={next.module.id} size={28} /></span>
                <div className="meta">
                  <div className="eyebrow">{s.lessonsDone === 0 ? "Start here" : "Continue"} · {next.module.title}</div>
                  <h2>{next.lesson.title}</h2>
                  <div className="desc">{next.lesson.summary}</div>
                </div>
                <span className="go">{next.lesson.minutes}m →</span>
              </Link>
            ) : (
              <div className="card grad continue">
                <span className="cta-ic">🏆</span>
                <div className="meta">
                  <div className="eyebrow">Complete</div>
                  <h2>You finished the whole curriculum.</h2>
                  <div className="desc">Every module cleared. Go build a world.</div>
                </div>
              </div>
            )}
          </div>

          <div className="col-stack">
            <CoachCard />
          </div>
        </div>

        <div className="section-title">
          <h3>Learning tracks</h3>
          <Link className="more" to="/curriculum">all modules →</Link>
        </div>
        <div className="track-grid">
          {tracks.map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </div>

        <div className="section-title">
          <h3>Engine capstone roadmap</h3>
          <Link className="more" to={lessonPath("rendering", "triangle")}>the build →</Link>
        </div>
        <div className="card">
          <RoadmapRail />
        </div>

        <div className="section-title">
          <h3>Recent activity</h3>
        </div>
        <div className="card">
          {activity.length === 0 ? (
            <div className="empty-note">No activity yet. Open a lesson and it'll show up here.</div>
          ) : (
            <div className="activity">
              {activity.map((a) => (
                <Link
                  key={a.ref.module.id + a.ref.lesson.id}
                  className="row"
                  to={lessonPath(a.ref.module.id, a.ref.lesson.id)}
                  style={{ color: "inherit" }}
                >
                  <span className="ic">{a.done ? "✓" : <ModuleIcon id={a.ref.module.id} size={18} />}</span>
                  <div className="txt">
                    <div className="t">{a.ref.lesson.title}</div>
                    <div className="s">{a.ref.module.title}</div>
                  </div>
                  <span className="when">{relativeTime(a.when, now)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
