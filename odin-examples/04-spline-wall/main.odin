// 04 — Spline Walls
// Take a handful of control points, smooth them into a Catmull-Rom centerline,
// then EXTRUDE that curve into a 3D wall mesh (two rows of vertices: base and
// top, offset left/right along the curve normal). This is the procedural wall
// generator at the heart of Tiny-Glade-style building.
//
// Press SPACE to cycle through a few preset control-point layouts and watch the
// wall regenerate. In a full editor you'd instead cast a ray from the camera
// through the mouse onto the terrain (a ray–plane / ray–heightfield test — see
// the Physics module) to let the player click points into the world.
//
// Build & run:   odin run .
package main

import "core:fmt"
import "core:mem"
import "core:math"
import "core:math/linalg"
import "vendor:glfw"
import NS  "core:sys/darwin/Foundation"
import MTL "vendor:darwin/Metal"
import CA  "vendor:darwin/QuartzCore"

WIDTH  :: 1000
HEIGHT :: 700
WALL_HEIGHT :: f32(1.4)
HALF_WIDTH  :: f32(0.35)

Vec3 :: [3]f32
Vertex :: struct { pos: Vec3, normal: Vec3 }

PRESETS := [3][][2]f32 {
	{{-3, -2}, {-1, 1}, {1, -1}, {3, 2}},
	{{-3, 0}, {0, 2.5}, {3, 0}, {0, -2.5}, {-3, 0}},
	{{-3, -3}, {3, -3}, {3, 3}, {-3, 3}, {-3, -3}},
}

// ---------------- Spline ----------------
catmull_rom :: proc(p0, p1, p2, p3: [2]f32, t: f32) -> [2]f32 {
	t2 := t*t; t3 := t2*t
	f :: proc(a, b, c, d, t, t2, t3: f32) -> f32 {
		return 0.5*(2*b + (-a+c)*t + (2*a-5*b+4*c-d)*t2 + (-a+3*b-3*c+d)*t3)
	}
	return {
		f(p0.x, p1.x, p2.x, p3.x, t, t2, t3),
		f(p0.y, p1.y, p2.y, p3.y, t, t2, t3),
	}
}

catmull_chain :: proc(pts: [][2]f32, steps: int) -> [dynamic][2]f32 {
	out := make([dynamic][2]f32)
	if len(pts) < 2 { for p in pts do append(&out, p); return out }
	for i in 0..<len(pts)-1 {
		p0 := pts[max(0, i-1)]; p1 := pts[i]
		p2 := pts[i+1]; p3 := pts[min(len(pts)-1, i+2)]
		for s in 0..<steps do append(&out, catmull_rom(p0, p1, p2, p3, f32(s)/f32(steps)))
	}
	append(&out, pts[len(pts)-1])
	return out
}

// ---------------- Wall extrusion ----------------
// For each centerline point, offset left/right along the normal to get the wall
// footprint, then loft upward by WALL_HEIGHT. Emit two triangles per face per
// segment (outer wall, inner wall, and a top strip).
build_wall :: proc(control: [][2]f32) -> [dynamic]Vertex {
	center := catmull_chain(control, 20)
	defer delete(center)
	n := len(center)
	verts := make([dynamic]Vertex)
	if n < 2 { return verts }

	left  := make([][2]f32, n); defer delete(left)
	right := make([][2]f32, n); defer delete(right)
	for i in 0..<n {
		prev := center[max(0, i-1)]; next := center[min(n-1, i+1)]
		t := next - prev
		l := math.sqrt(t.x*t.x + t.y*t.y); if l < 1e-6 { l = 1 }
		nx := -t.y/l; ny := t.x/l
		left[i]  = {center[i].x + nx*HALF_WIDTH, center[i].y + ny*HALF_WIDTH}
		right[i] = {center[i].x - nx*HALF_WIDTH, center[i].y - ny*HALF_WIDTH}
	}

	to3 :: proc(p: [2]f32, y: f32) -> Vec3 { return {p.x, y, p.y} }
	quad :: proc(verts: ^[dynamic]Vertex, a, b, c, d: Vec3) {
		nrm := linalg.normalize(linalg.cross(b - a, c - a))
		append(verts, Vertex{a, nrm}, Vertex{b, nrm}, Vertex{c, nrm})
		append(verts, Vertex{a, nrm}, Vertex{c, nrm}, Vertex{d, nrm})
	}

	for i in 0..<n-1 {
		lb0 := to3(left[i], 0);  lb1 := to3(left[i+1], 0)
		lt0 := to3(left[i], WALL_HEIGHT);  lt1 := to3(left[i+1], WALL_HEIGHT)
		rb0 := to3(right[i], 0); rb1 := to3(right[i+1], 0)
		rt0 := to3(right[i], WALL_HEIGHT); rt1 := to3(right[i+1], WALL_HEIGHT)
		quad(&verts, lb0, lb1, lt1, lt0)  // left/outer face
		quad(&verts, rb1, rb0, rt0, rt1)  // right/inner face
		quad(&verts, lt0, lt1, rt1, rt0)  // top
	}
	return verts
}

SHADER_SRC :: `
#include <metal_stdlib>
using namespace metal;
struct Uniforms { float4x4 mvp; };
struct VIn  { float3 pos [[attribute(0)]]; float3 normal [[attribute(1)]]; };
struct VOut { float4 pos [[position]]; float shade; float y; };

vertex VOut vs_main(uint vid [[vertex_id]],
                    const device VIn* v  [[buffer(0)]],
                    constant Uniforms& u [[buffer(1)]]) {
    VOut o;
    o.pos = u.mvp * float4(v[vid].pos, 1.0);
    float3 L = normalize(float3(0.4, 0.9, 0.3));
    o.shade = clamp(abs(dot(normalize(v[vid].normal), L)) * 0.7 + 0.35, 0.0, 1.0);
    o.y = v[vid].pos.y;
    return o;
}
fragment float4 fs_main(VOut in [[stage_in]]) {
    float3 stone = mix(float3(0.55,0.5,0.45), float3(0.8,0.77,0.72), in.y);
    return float4(stone * in.shade, 1.0);
}
`

main :: proc() {
	pool := NS.AutoreleasePool_alloc()->init()
	defer pool->release()

	if !glfw.Init() { fmt.eprintln("glfw init failed"); return }
	defer glfw.Terminate()
	glfw.WindowHint(glfw.CLIENT_API, glfw.NO_API)
	window := glfw.CreateWindow(WIDTH, HEIGHT, "04 - Spline Wall (SPACE to cycle)", nil, nil)
	defer glfw.DestroyWindow(window)

	device := MTL.CreateSystemDefaultDevice()
	defer device->release()
	queue := device->newCommandQueue()
	defer queue->release()

	layer := CA.MetalLayer_layer()
	layer->setDevice(device)
	layer->setPixelFormat(.BGRA8Unorm)
	view := glfw.GetCocoaWindow(window)->contentView()
	view->setLayer(layer)
	view->setWantsLayer(true)

	src := NS.String_alloc()->initWithOdinString(SHADER_SRC)
	defer src->release()
	opts := MTL.CompileOptions_alloc()->init()
	defer opts->release()
	library, lib_err := device->newLibraryWithSource(src, opts)
	if library == nil {
		fmt.eprintln("compile failed:", lib_err->localizedDescription()->odinString())
		return
	}
	defer library->release()

	pdesc := MTL.RenderPipelineDescriptor_alloc()->init()
	defer pdesc->release()
	pdesc->setVertexFunction(library->newFunctionWithName(NS.AT("vs_main")))
	pdesc->setFragmentFunction(library->newFunctionWithName(NS.AT("fs_main")))
	pdesc->colorAttachments()->object(0)->setPixelFormat(.BGRA8Unorm)
	pdesc->setDepthAttachmentPixelFormat(.Depth32Float)
	pipeline, ps_err := device->newRenderPipelineStateWithDescriptor(pdesc)
	if pipeline == nil {
		fmt.eprintln("pipeline failed:", ps_err->localizedDescription()->odinString())
		return
	}
	defer pipeline->release()

	ddesc := MTL.DepthStencilDescriptor_alloc()->init()
	defer ddesc->release()
	ddesc->setDepthCompareFunction(.Less)
	ddesc->setDepthWriteEnabled(true)
	depth_state := device->newDepthStencilState(ddesc)
	defer depth_state->release()

	// Build the first wall.
	preset_idx := 0
	rebuild :: proc(device: ^MTL.Device, idx: int) -> (^MTL.Buffer, int) {
		wall := build_wall(PRESETS[idx])
		defer delete(wall)
		count := len(wall)
		buf := device->newBufferWithSlice(wall[:], {})
		fmt.printf("preset %d: %d triangles\n", idx, count/3)
		return buf, count
	}
	vbuf, vert_count := rebuild(device, preset_idx)
	defer vbuf->release()
	space_was_down := false

	depth_tex: ^MTL.Texture
	start := glfw.GetTime()

	for !glfw.WindowShouldClose(window) {
		glfw.PollEvents()
		frame_pool := NS.AutoreleasePool_alloc()->init()
		defer frame_pool->release()

		// SPACE cycles presets (edge-triggered).
		down := glfw.GetKey(window, glfw.KEY_SPACE) == glfw.PRESS
		if down && !space_was_down {
			preset_idx = (preset_idx + 1) % len(PRESETS)
			vbuf->release()
			vbuf, vert_count = rebuild(device, preset_idx)
		}
		space_was_down = down

		t := f32(glfw.GetTime() - start)
		fbw, fbh := glfw.GetFramebufferSize(window)
		aspect := f32(fbw) / f32(fbh)
		r: f32 = 9
		eye := Vec3{math.cos(t*0.3)*r, 5, math.sin(t*0.3)*r}
		vmat := linalg.matrix4_look_at_f32(eye, Vec3{0, 0.4, 0}, Vec3{0, 1, 0})
		proj := linalg.matrix4_perspective_f32(math.to_radians_f32(55), aspect, 0.1, 100)
		mvp := proj * vmat

		drawable := layer->nextDrawable()
		if drawable == nil do continue
		tex := drawable->texture()
		w := tex->width(); h := tex->height()
		if depth_tex == nil || depth_tex->width() != w || depth_tex->height() != h {
			if depth_tex != nil do depth_tex->release()
			td := MTL.TextureDescriptor_texture2DDescriptorWithPixelFormat(.Depth32Float, w, h, false)
			td->setUsage({.RenderTarget})
			td->setStorageMode(.Private)
			depth_tex = device->newTextureWithDescriptor(td)
		}

		pass := MTL.RenderPassDescriptor_renderPassDescriptor()
		col := pass->colorAttachments()->object(0)
		col->setTexture(tex); col->setLoadAction(.Clear)
		col->setClearColor(MTL.ClearColor{0.04, 0.05, 0.07, 1.0}); col->setStoreAction(.Store)
		dep := pass->depthAttachment()
		dep->setTexture(depth_tex); dep->setLoadAction(.Clear)
		dep->setClearDepth(1.0); dep->setStoreAction(.DontCare)

		cmd := queue->commandBuffer()
		enc := cmd->renderCommandEncoderWithDescriptor(pass)
		enc->setRenderPipelineState(pipeline)
		enc->setDepthStencilState(depth_state)
		enc->setCullMode(.None)
		enc->setVertexBuffer(vbuf, 0, 0)
		mvp_local := mvp
		enc->setVertexBytes(mem.ptr_to_bytes(&mvp_local), 1)
		enc->drawPrimitives(.Triangle, 0, NS.UInteger(vert_count))
		enc->endEncoding()
		cmd->presentDrawable(drawable)
		cmd->commit()
	}
	if depth_tex != nil do depth_tex->release()
}
