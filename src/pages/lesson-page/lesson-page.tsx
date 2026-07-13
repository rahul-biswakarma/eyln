import { useParams } from "react-router-dom";
import { findLesson } from "../../content/registry";
import { LessonLayout } from "../../components/lesson-layout";
export function LessonPage() {
    const { moduleId, lessonId } = useParams();
    const found = moduleId && lessonId ? findLesson(moduleId, lessonId) : undefined;
    if (!found) {
        return (<div className="content">
        <div className="prose">
          <h1>Lesson not found</h1>
          <p>That lesson doesn’t exist. Head back to the curriculum.</p>
        </div>
      </div>);
    }
    return <LessonLayout key={`${moduleId}/${lessonId}`} data={found}/>;
}
