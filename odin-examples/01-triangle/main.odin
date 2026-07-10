// 01 — Window & Triangle
// The "Hello, World" of graphics: open a window, stand up the full Metal
// pipeline, and draw one colored triangle.
//
// Shaders are compiled AT RUNTIME from a source string via newLibraryWithSource,
// because this machine has only the Xcode Command Line Tools (no offline `metal`
// compiler). This is also great for hot-reloading shaders while you develop.
//
// Build & run:   odin run .        (from this directory)
package main

import "core:fmt"
import "vendor:glfw"
import NS  "core:sys/darwin/Foundation"
import MTL "vendor:darwin/Metal"
import CA  "vendor:darwin/QuartzCore"

WIDTH  :: 800
HEIGHT :: 600

// Vertex layout: x, y, r, g, b  — tightly packed, 5 floats (20 bytes) per vertex.
vertices := [?]f32 {
	 0.0,  0.7,   1.0, 0.48, 0.27,
	-0.7, -0.6,   0.31, 0.70, 1.00,
	 0.7, -0.6,   0.35, 0.83, 0.55,
}

SHADER_SRC :: `
#include <metal_stdlib>
using namespace metal;

struct VSOut {
    float4 pos [[position]];
    float3 color;
};

vertex VSOut vs_main(uint vid [[vertex_id]],
                     const device float* v [[buffer(0)]]) {
    VSOut o;
    o.pos   = float4(v[vid*5+0], v[vid*5+1], 0.0, 1.0);
    o.color = float3(v[vid*5+2], v[vid*5+3], v[vid*5+4]);
    return o;
}

fragment float4 fs_main(VSOut in [[stage_in]]) {
    return float4(in.color, 1.0);
}
`

main :: proc() {
	// One autorelease pool for the whole program (plus one per frame below).
	pool := NS.AutoreleasePool_alloc()->init()
	defer pool->release()

	// --- Window (no GL context; we render with Metal) ---
	if !glfw.Init() {
		fmt.eprintln("glfw init failed")
		return
	}
	defer glfw.Terminate()

	glfw.WindowHint(glfw.CLIENT_API, glfw.NO_API)
	window := glfw.CreateWindow(WIDTH, HEIGHT, "01 - Triangle", nil, nil)
	if window == nil {
		fmt.eprintln("window creation failed")
		return
	}
	defer glfw.DestroyWindow(window)

	// --- Device & command queue ---
	device := MTL.CreateSystemDefaultDevice()
	if device == nil {
		fmt.eprintln("no Metal device")
		return
	}
	defer device->release()
	fmt.println("GPU:", device->name()->odinString())

	queue := device->newCommandQueue()
	defer queue->release()

	// --- Attach a CAMetalLayer to the window's content view ---
	layer := CA.MetalLayer_layer()
	layer->setDevice(device)
	layer->setPixelFormat(.BGRA8Unorm)

	ns_window := glfw.GetCocoaWindow(window)
	content_view := ns_window->contentView()
	content_view->setLayer(layer)
	content_view->setWantsLayer(true)

	// --- Compile shaders from source at runtime ---
	src := NS.String_alloc()->initWithOdinString(SHADER_SRC)
	defer src->release()
	opts := MTL.CompileOptions_alloc()->init()
	defer opts->release()

	library, lib_err := device->newLibraryWithSource(src, opts)
	if library == nil {
		fmt.eprintln("shader compile failed:", lib_err->localizedDescription()->odinString())
		return
	}
	defer library->release()

	vs := library->newFunctionWithName(NS.AT("vs_main"))
	fs := library->newFunctionWithName(NS.AT("fs_main"))
	defer vs->release()
	defer fs->release()

	// --- Build the render pipeline state (do this once) ---
	desc := MTL.RenderPipelineDescriptor_alloc()->init()
	defer desc->release()
	desc->setVertexFunction(vs)
	desc->setFragmentFunction(fs)
	desc->colorAttachments()->object(0)->setPixelFormat(.BGRA8Unorm)

	pipeline, ps_err := device->newRenderPipelineStateWithDescriptor(desc)
	if pipeline == nil {
		fmt.eprintln("pipeline failed:", ps_err->localizedDescription()->odinString())
		return
	}
	defer pipeline->release()

	// --- Vertex buffer: hand the raw bytes straight to the GPU ---
	vbuf := device->newBufferWithSlice(vertices[:], {})
	defer vbuf->release()

	// --- Main loop ---
	for !glfw.WindowShouldClose(window) {
		glfw.PollEvents()

		// A fresh autorelease pool per frame keeps the memory watermark low.
		frame_pool := NS.AutoreleasePool_alloc()->init()
		defer frame_pool->release()

		drawable := layer->nextDrawable()
		if drawable == nil do continue

		pass := MTL.RenderPassDescriptor_renderPassDescriptor()
		color := pass->colorAttachments()->object(0)
		color->setTexture(drawable->texture())
		color->setLoadAction(.Clear)
		color->setClearColor(MTL.ClearColor{0.03, 0.04, 0.06, 1.0})
		color->setStoreAction(.Store)

		cmd := queue->commandBuffer()
		enc := cmd->renderCommandEncoderWithDescriptor(pass)
		enc->setRenderPipelineState(pipeline)
		enc->setVertexBuffer(vbuf, 0, 0)
		enc->drawPrimitives(.Triangle, 0, 3)
		enc->endEncoding()

		cmd->presentDrawable(drawable)
		cmd->commit()
	}
}
