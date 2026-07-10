export function Resources() {
  return (
    <div className="content">
      <div className="prose">
        <div className="crumbs">
          <a href="/">Dashboard</a>
          <span>/</span>
          <span className="seg">Resources</span>
        </div>
        <h1>📚 Resources & Further Study</h1>
        <p>
          The people and books that paved this road. When your renderer looks broken, one of these
          usually has the answer.
        </p>

        <h2>The procedural masters</h2>
        <ul>
          <li>
            <strong>Anastasia Opara</strong> — co-creator of Tiny Glade. Her talks on{" "}
            <em>Procedural Content Generation</em> and “Believable Procedural Art” are your north
            star for this whole project.{" "}
            <a href="https://www.anastasiaopara.com/" target="_blank" rel="noreferrer">
              anastasiaopara.com
            </a>
          </li>
          <li>
            <strong>Inigo Quilez</strong> — the godfather of procedural rendering. Articles that
            turn the math of noise, curves, SDFs, and geometry into simple code.{" "}
            <a href="https://iquilezles.org/articles/" target="_blank" rel="noreferrer">
              iquilezles.org/articles
            </a>
          </li>
          <li>
            <strong>Shadertoy</strong> — read and tweak thousands of live fragment shaders.{" "}
            <a href="https://www.shadertoy.com/" target="_blank" rel="noreferrer">
              shadertoy.com
            </a>
          </li>
        </ul>

        <h2>Books</h2>
        <ul>
          <li>
            <strong>Real-Time Rendering</strong> (Akenine-Möller et al.) — the bible. Keep it nearby
            to look up matrices, shading models, and pipeline details.
          </li>
          <li>
            <strong>3D Math Primer for Graphics and Game Development</strong> (Dunn &amp; Parberry)
            — the friendliest linear-algebra-for-games book.
          </li>
        </ul>

        <h2>Odin</h2>
        <ul>
          <li>
            <a href="https://odin-lang.org/docs/overview/" target="_blank" rel="noreferrer">
              The Odin Overview / Handbook
            </a>{" "}
            — the language in one long page.
          </li>
          <li>
            <code>core:math/linalg</code> — Odin’s built-in vectors &amp; matrices. Read the source;
            it mirrors the math in this course.
          </li>
          <li>
            <code>vendor:darwin/Metal</code> — the Metal bindings shipped with Odin, plus their
            README on autorelease pools &amp; retain/release. This is what the capstone links against.
          </li>
        </ul>

        <h2>Metal &amp; WebGPU</h2>
        <ul>
          <li>
            <a href="https://developer.apple.com/metal/" target="_blank" rel="noreferrer">
              Apple Metal documentation
            </a>{" "}
            &amp; the Metal Shading Language spec (PDF).
          </li>
          <li>
            <a href="https://webgpufundamentals.org/" target="_blank" rel="noreferrer">
              WebGPU Fundamentals
            </a>{" "}
            — the live demos in this course use the same concepts.
          </li>
          <li>
            <a href="https://google.github.io/tour-of-wgsl/" target="_blank" rel="noreferrer">
              Tour of WGSL
            </a>{" "}
            — the browser shader language, ~1:1 with MSL.
          </li>
        </ul>
      </div>
    </div>
  );
}
