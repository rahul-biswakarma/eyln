// 03 — Heightfield Terrain
// Generate an N×N grid of vertices, set each height from fBm Perlin noise, and
// compute per-vertex normals so the terrain can be lit. Orbit camera included.
//
// New concepts over example 02:
//   * procedural mesh generation into a [dynamic]Vertex buffer
//   * a hand-written Perlin + fBm noise implementation
//   * simple Lambert lighting in the fragment shader
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
N      :: 128        // grid resolution

Vec3 :: [3]f32
Vertex :: struct { pos: Vec3, normal: Vec3 }

// ---------------- Noise ----------------
hash2 :: proc(ix, iy: int) -> f32 {
	h := u32(ix) * 374761393 + u32(iy) * 668265263
	h = (h ~ (h >> 13))
	h = h * 1274126177
	return f32(h & 0xffffff) / f32(0x1000000)
}
fade :: proc(t: f32) -> f32 { return t*t*t*(t*(t*6-15)+10) }
grad :: proc(ix, iy: int) -> Vec3 {
	a := hash2(ix, iy) * math.TAU
	return {math.cos(a), math.sin(a), 0}
}
perlin :: proc(x, y: f32) -> f32 {
	x0 := int(math.floor(x)); y0 := int(math.floor(y))
	dx := x - f32(x0); dy := y - f32(y0)
	d00 := grad(x0,   y0  ).x*dx      + grad(x0,   y0  ).y*dy
	d10 := grad(x0+1, y0  ).x*(dx-1)  + grad(x0+1, y0  ).y*dy
	d01 := grad(x0,   y0+1).x*dx      + grad(x0,   y0+1).y*(dy-1)
	d11 := grad(x0+1, y0+1).x*(dx-1)  + grad(x0+1, y0+1).y*(dy-1)
	u := fade(dx); v := fade(dy)
	return math.lerp(math.lerp(d00, d10, u), math.lerp(d01, d11, u), v)*0.5 + 0.5
}
fbm :: proc(x, y: f32, octaves: int, freq, lac, gain: f32) -> f32 {
	sum, amp, f, norm: f32 = 0, 1, freq, 0
	for _ in 0..<octaves {
		sum += amp * perlin(x*f, y*f)
		norm += amp; amp *= gain; f *= lac
	}
	return sum / norm
}

// ---------------- Mesh ----------------
AMPL :: f32(2.5)
generate_terrain :: proc() -> [dynamic]Vertex {
	heights: [N + 1][N + 1]f32
	for j in 0..=N do for i in 0..=N {
		heights[j][i] = fbm(f32(i)/N, f32(j)/N, 5, 3, 2, 0.5) * AMPL
	}
	pos := proc(heights: ^[N+1][N+1]f32, i, j: int) -> Vec3 {
		return {(f32(i)/N - 0.5)*8, heights[j][i], (f32(j)/N - 0.5)*8}
	}
	normal := proc(heights: ^[N+1][N+1]f32, i, j: int) -> Vec3 {
		hl := heights[j][max(0, i-1)]; hr := heights[j][min(N, i+1)]
		hd := heights[max(0, j-1)][i]; hu := heights[min(N, j+1)][i]
		return linalg.normalize(Vec3{hl - hr, 2.0/N*8, hd - hu})
	}
	verts := make([dynamic]Vertex, 0, N*N*6)
	for j in 0..<N do for i in 0..<N {
		append(&verts, Vertex{pos(&heights, i,   j),   normal(&heights, i,   j)})
		append(&verts, Vertex{pos(&heights, i+1, j),   normal(&heights, i+1, j)})
		append(&verts, Vertex{pos(&heights, i+1, j+1), normal(&heights, i+1, j+1)})
		append(&verts, Vertex{pos(&heights, i,   j),   normal(&heights, i,   j)})
		append(&verts, Vertex{pos(&heights, i+1, j+1), normal(&heights, i+1, j+1)})
		append(&verts, Vertex{pos(&heights, i,   j+1), normal(&heights, i,   j+1)})
	}
	return verts
}

SHADER_SRC :: `
#include <metal_stdlib>
using namespace metal;
struct Uniforms { float4x4 mvp; };
struct VIn  { float3 pos [[attribute(0)]]; float3 normal [[attribute(1)]]; };
struct VOut { float4 pos [[position]]; float h; float shade; };

vertex VOut vs_main(uint vid [[vertex_id]],
                    const device VIn* v  [[buffer(0)]],
                    constant Uniforms& u [[buffer(1)]]) {
    VOut o;
    o.pos = u.mvp * float4(v[vid].pos, 1.0);
    o.h   = v[vid].pos.y;
    float3 L = normalize(float3(0.5, 0.8, 0.3));
    o.shade = clamp(dot(normalize(v[vid].normal), L) * 0.7 + 0.35, 0.0, 1.0);
    return o;
}
fragment float4 fs_main(VOut in [[stage_in]]) {
    float3 c;
    float h = in.h;
    if (h < 0.1)      c = float3(0.16, 0.35, 0.55);
    else if (h < 0.7) c = float3(0.27, 0.50, 0.27);
    else if (h < 1.4) c = float3(0.43, 0.39, 0.35);
    else              c = float3(0.86, 0.86, 0.90);
    return float4(c * in.shade, 1.0);
}
`

main :: proc() {
	pool := NS.AutoreleasePool_alloc()->init()
	defer pool->release()

	if !glfw.Init() { fmt.eprintln("glfw init failed"); return }
	defer glfw.Terminate()
	glfw.WindowHint(glfw.CLIENT_API, glfw.NO_API)
	window := glfw.CreateWindow(WIDTH, HEIGHT, "03 - Terrain", nil, nil)
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

	terrain := generate_terrain()
	defer delete(terrain)
	vert_count := len(terrain)
	vbuf := device->newBufferWithSlice(terrain[:], {})
	defer vbuf->release()
	fmt.printf("generated %d triangles\n", vert_count / 3)

	depth_tex: ^MTL.Texture
	start := glfw.GetTime()

	for !glfw.WindowShouldClose(window) {
		glfw.PollEvents()
		frame_pool := NS.AutoreleasePool_alloc()->init()
		defer frame_pool->release()

		t := f32(glfw.GetTime() - start)
		fbw, fbh := glfw.GetFramebufferSize(window)
		aspect := f32(fbw) / f32(fbh)
		r: f32 = 11
		eye := Vec3{math.cos(t*0.25)*r, 6, math.sin(t*0.25)*r}
		vmat := linalg.matrix4_look_at_f32(eye, Vec3{0, 0.5, 0}, Vec3{0, 1, 0})
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
		col->setClearColor(MTL.ClearColor{0.02, 0.03, 0.05, 1.0}); col->setStoreAction(.Store)
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
