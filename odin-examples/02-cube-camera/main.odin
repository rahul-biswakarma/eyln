// 02 — 3D Camera
// Turn the flat triangle into a spinning 3D cube, add a depth buffer so near
// faces occlude far ones, and drive a camera with WASD + arrow keys.
//
// New concepts over example 01:
//   * an MVP matrix uploaded as a uniform (setVertexBytes)
//   * a depth texture + depth-stencil state
//   * core:math/linalg for the view/projection matrices
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

WIDTH  :: 900
HEIGHT :: 600

Vec3 :: [3]f32
Mat4 :: matrix[4, 4]f32

Vertex :: struct {
	pos:   Vec3,
	color: Vec3,
}

build_cube :: proc() -> [36]Vertex {
	corners := [8]Vec3 {
		{-1, -1, -1}, {1, -1, -1}, {1, 1, -1}, {-1, 1, -1},
		{-1, -1,  1}, {1, -1,  1}, {1, 1,  1}, {-1, 1,  1},
	}
	faces := [6][4]int {
		{0, 1, 2, 3}, {5, 4, 7, 6}, {4, 0, 3, 7},
		{1, 5, 6, 2}, {3, 2, 6, 7}, {4, 5, 1, 0},
	}
	colors := [6]Vec3 {
		{1.0, 0.48, 0.27}, {0.31, 0.70, 1.0}, {0.35, 0.83, 0.55},
		{1.0, 0.81, 0.36}, {0.80, 0.40, 0.90}, {0.90, 0.30, 0.42},
	}
	out: [36]Vertex
	i := 0
	for f, fi in faces {
		quad := [6]int{f[0], f[1], f[2], f[0], f[2], f[3]}
		for idx in quad {
			out[i] = Vertex{corners[idx], colors[fi]}
			i += 1
		}
	}
	return out
}

SHADER_SRC :: `
#include <metal_stdlib>
using namespace metal;

struct Uniforms { float4x4 mvp; };
struct VIn  { float3 pos [[attribute(0)]]; float3 color [[attribute(1)]]; };
struct VOut { float4 pos [[position]]; float3 color; };

vertex VOut vs_main(uint vid [[vertex_id]],
                    const device VIn* v   [[buffer(0)]],
                    constant Uniforms& u  [[buffer(1)]]) {
    VOut o;
    o.pos   = u.mvp * float4(v[vid].pos, 1.0);
    o.color = v[vid].color;
    return o;
}

fragment float4 fs_main(VOut in [[stage_in]]) {
    return float4(in.color, 1.0);
}
`

Camera :: struct {
	pos:   Vec3,
	yaw:   f32,
	pitch: f32,
}

cam_forward :: proc(c: Camera) -> Vec3 {
	return Vec3{
		math.cos(c.pitch) * math.sin(c.yaw),
		math.sin(c.pitch),
		math.cos(c.pitch) * math.cos(c.yaw),
	}
}

main :: proc() {
	pool := NS.AutoreleasePool_alloc()->init()
	defer pool->release()

	if !glfw.Init() { fmt.eprintln("glfw init failed"); return }
	defer glfw.Terminate()
	glfw.WindowHint(glfw.CLIENT_API, glfw.NO_API)
	window := glfw.CreateWindow(WIDTH, HEIGHT, "02 - Cube & Camera", nil, nil)
	defer glfw.DestroyWindow(window)

	device := MTL.CreateSystemDefaultDevice()
	defer device->release()
	queue := device->newCommandQueue()
	defer queue->release()

	layer := CA.MetalLayer_layer()
	layer->setDevice(device)
	layer->setPixelFormat(.BGRA8Unorm)
	ns_window := glfw.GetCocoaWindow(window)
	view := ns_window->contentView()
	view->setLayer(layer)
	view->setWantsLayer(true)

	// Compile shaders at runtime.
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
	vs := library->newFunctionWithName(NS.AT("vs_main"))
	fs := library->newFunctionWithName(NS.AT("fs_main"))

	// Pipeline with a depth attachment.
	pdesc := MTL.RenderPipelineDescriptor_alloc()->init()
	defer pdesc->release()
	pdesc->setVertexFunction(vs)
	pdesc->setFragmentFunction(fs)
	pdesc->colorAttachments()->object(0)->setPixelFormat(.BGRA8Unorm)
	pdesc->setDepthAttachmentPixelFormat(.Depth32Float)
	pipeline, ps_err := device->newRenderPipelineStateWithDescriptor(pdesc)
	if pipeline == nil {
		fmt.eprintln("pipeline failed:", ps_err->localizedDescription()->odinString())
		return
	}
	defer pipeline->release()

	// Depth-stencil state: pass fragments that are closer (less) and write depth.
	ddesc := MTL.DepthStencilDescriptor_alloc()->init()
	defer ddesc->release()
	ddesc->setDepthCompareFunction(.Less)
	ddesc->setDepthWriteEnabled(true)
	depth_state := device->newDepthStencilState(ddesc)
	defer depth_state->release()

	cube := build_cube()
	vbuf := device->newBufferWithSlice(cube[:], {})
	defer vbuf->release()

	cam := Camera{pos = {0, 1.5, 6}, yaw = math.PI, pitch = -0.15}
	depth_tex: ^MTL.Texture
	last_time := glfw.GetTime()
	angle: f32 = 0

	for !glfw.WindowShouldClose(window) {
		glfw.PollEvents()
		frame_pool := NS.AutoreleasePool_alloc()->init()
		defer frame_pool->release()

		now := glfw.GetTime()
		dt := f32(now - last_time)
		last_time = now

		// --- input: fly camera ---
		speed: f32 = 5 * dt
		turn:  f32 = 1.5 * dt
		fwd := cam_forward(cam)
		right := linalg.normalize(linalg.cross(fwd, Vec3{0, 1, 0}))
		if glfw.GetKey(window, glfw.KEY_W) == glfw.PRESS do cam.pos += fwd * speed
		if glfw.GetKey(window, glfw.KEY_S) == glfw.PRESS do cam.pos -= fwd * speed
		if glfw.GetKey(window, glfw.KEY_D) == glfw.PRESS do cam.pos += right * speed
		if glfw.GetKey(window, glfw.KEY_A) == glfw.PRESS do cam.pos -= right * speed
		if glfw.GetKey(window, glfw.KEY_LEFT)  == glfw.PRESS do cam.yaw += turn
		if glfw.GetKey(window, glfw.KEY_RIGHT) == glfw.PRESS do cam.yaw -= turn
		if glfw.GetKey(window, glfw.KEY_UP)    == glfw.PRESS do cam.pitch = min(cam.pitch + turn, 1.5)
		if glfw.GetKey(window, glfw.KEY_DOWN)  == glfw.PRESS do cam.pitch = max(cam.pitch - turn, -1.5)

		// --- MVP ---
		angle += dt * 0.6
		fbw, fbh := glfw.GetFramebufferSize(window)
		aspect := f32(fbw) / f32(fbh)
		model := linalg.matrix4_rotate_f32(angle, Vec3{0.3, 1, 0})
		vmat  := linalg.matrix4_look_at_f32(cam.pos, cam.pos + cam_forward(cam), Vec3{0, 1, 0})
		proj  := linalg.matrix4_perspective_f32(math.to_radians_f32(60), aspect, 0.1, 100)
		mvp   := proj * vmat * model

		drawable := layer->nextDrawable()
		if drawable == nil do continue
		tex := drawable->texture()

		// (Re)create the depth texture if the framebuffer size changed.
		w := NS.UInteger(tex->width())
		h := NS.UInteger(tex->height())
		if depth_tex == nil || depth_tex->width() != w || depth_tex->height() != h {
			if depth_tex != nil do depth_tex->release()
			td := MTL.TextureDescriptor_texture2DDescriptorWithPixelFormat(.Depth32Float, w, h, false)
			td->setUsage({.RenderTarget})
			td->setStorageMode(.Private)
			depth_tex = device->newTextureWithDescriptor(td)
		}

		pass := MTL.RenderPassDescriptor_renderPassDescriptor()
		col := pass->colorAttachments()->object(0)
		col->setTexture(tex)
		col->setLoadAction(.Clear)
		col->setClearColor(MTL.ClearColor{0.02, 0.03, 0.05, 1.0})
		col->setStoreAction(.Store)
		dep := pass->depthAttachment()
		dep->setTexture(depth_tex)
		dep->setLoadAction(.Clear)
		dep->setClearDepth(1.0)
		dep->setStoreAction(.DontCare)

		cmd := queue->commandBuffer()
		enc := cmd->renderCommandEncoderWithDescriptor(pass)
		enc->setRenderPipelineState(pipeline)
		enc->setDepthStencilState(depth_state)
		enc->setCullMode(.Back)
		enc->setVertexBuffer(vbuf, 0, 0)
		mvp_local := mvp
		enc->setVertexBytes(mem.ptr_to_bytes(&mvp_local), 1)
		enc->drawPrimitives(.Triangle, 0, 36)
		enc->endEncoding()
		cmd->presentDrawable(drawable)
		cmd->commit()
	}
	if depth_tex != nil do depth_tex->release()
}
