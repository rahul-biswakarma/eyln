import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ListChecks } from "@phosphor-icons/react";
import { getModule, lessonPath, lessonKey } from "../content/registry";
import { Quiz } from "../components/Quiz";
import { Exercise } from "../components/Exercise";
import { ModuleIcon } from "../components/ModuleIcon";

export function Questionary() {
  const { moduleId } = useParams();
  const module = moduleId ? getModule(moduleId) : undefined;

  if (!module) {
    return (
      <div className="content">
        <div className="prose">
          <h1>Questionary not found</h1>
          <p>That module doesn’t exist. Head back to the curriculum.</p>
        </div>
      </div>
    );
  }

  const lessonsWithWork = module.lessons.filter(
    (l) => (l.quiz?.questions.length ?? 0) > 0 || (l.exercises?.length ?? 0) > 0
  );

  const totalQuestions = lessonsWithWork.reduce(
    (n, l) => n + (l.quiz?.questions.length ?? 0),
    0
  );
  const totalExercises = lessonsWithWork.reduce(
    (n, l) => n + (l.exercises?.length ?? 0),
    0
  );

  return (
    <div className="content questionary">
      <header className="lesson-hero prose">
        <div className="crumbs">
          <Link to="/">Dashboard</Link>
          <span>/</span>
          <Link className="seg" to={lessonPath(module.id, module.lessons[0].id)}>
            <ModuleIcon id={module.id} size={14} /> {module.title}
          </Link>
        </div>

        <div className="lh-kicker">End-of-chapter problem set</div>
        <h1 className="lh-title">
          <ListChecks size={26} weight="duotone" /> {module.title} — Questionary
        </h1>
        <p className="lh-objective">
          Every knowledge check and exercise from this chapter, gathered in one place. Work
          through them to lock in the concepts.
        </p>

        <div className="chip-row" style={{ marginTop: "1rem" }}>
          <span className="chip active">{lessonsWithWork.length} lessons</span>
          {totalQuestions > 0 && <span className="chip ghost">{totalQuestions} questions</span>}
          {totalExercises > 0 && <span className="chip ghost">{totalExercises} exercises</span>}
        </div>
      </header>

      {lessonsWithWork.length === 0 && (
        <div className="prose lesson-section">
          <p>This chapter has no questions or exercises yet.</p>
        </div>
      )}

      {lessonsWithWork.map((lesson, i) => {
        const key = lessonKey(module.id, lesson.id);
        return (
          <section key={lesson.id} className="prose lesson-section qn-block">
            <div className="qn-lesson-head">
              <span className="qn-num">{i + 1}</span>
              <div>
                <Link className="qn-lesson-title" to={lessonPath(module.id, lesson.id)}>
                  {lesson.title}
                </Link>
                <div className="qn-lesson-sum">{lesson.summary}</div>
              </div>
            </div>

            {lesson.exercises && lesson.exercises.length > 0 && (
              <div className="qn-group">
                <div className="section-eyebrow emerald">Exercises</div>
                {lesson.exercises.map((ex) => (
                  <Exercise key={ex.id} ex={ex} />
                ))}
              </div>
            )}

            {lesson.quiz && lesson.quiz.questions.length > 0 && (
              <div className="qn-group">
                <Quiz
                  id={key}
                  quiz={lesson.quiz}
                  lessonTitle={lesson.title}
                  lessonSummary={lesson.summary}
                />
              </div>
            )}
          </section>
        );
      })}

      <div className="prose lesson-section">
        <Link className="btn" to={lessonPath(module.id, module.lessons[0].id)}>
          <ArrowLeft size={15} weight="bold" /> Back to {module.title}
        </Link>
      </div>
    </div>
  );
}
