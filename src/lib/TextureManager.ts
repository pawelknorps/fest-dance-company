import { 
  Texture, 
  DataTexture, 
  RGBAFormat, 
  UnsignedByteType, 
  SRGBColorSpace, 
  LinearFilter,
  ImageBitmapLoader,
  LinearMipmapLinearFilter,
  WebGLRenderer
} from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import * as thumbhash from 'thumbhash'

/**
 * SOTA Texture Manager
 * Implements a prioritized, throttled hydration pipeline with GPU-native KTX2 support.
 */
class TextureManager {
  private cache: Map<string, Texture> = new Map();
  private thumbCache: Map<string, Texture> = new Map();
  private subscribers: Map<string, ((tex: Texture) => void)[]> = new Map();
  private dummyTexture: DataTexture;
  private queue: string[] = [];
  private loading: Set<string> = new Set();
  private isProcessing = false;
  private abortController: AbortController = new AbortController();
  private ktx2Loader: KTX2Loader | null = null;
  private maxAnisotropy = 1;
  private initPromise: Promise<void>;
  private resolveInit!: () => void;
  
  // High-priority (Tier 1) tracking
  private priorityTotal = 0;
  private priorityLoaded = 0;
  private onPriorityReady: (() => void) | null = null;

  constructor() {
    // 1x1 Dummy black texture to prevent GL unbound warnings
    const data = new Uint8Array([5, 3, 10, 255]); // Matches #05030a
    this.dummyTexture = new DataTexture(data, 1, 1, RGBAFormat, UnsignedByteType);
    this.dummyTexture.needsUpdate = true;
    
    this.initPromise = new Promise((resolve) => {
      this.resolveInit = resolve;
    });
  }

  /**
   * Global Preload for critical assets
   * Uses a dual-stage approach:
   * 1. Network Warmup: Fetch file into browser cache immediately.
   * 2. GPU Preparation: Decode and upload once KTX2Loader is initialized.
   */
  public preload(items: { id: string, url: string, priority?: 1 | 2 }[]) {
    // SOTA: Auto-initialize priority tracking from the preload set
    const p1Count = items.filter(i => i.priority === 1).length;
    if (p1Count > this.priorityTotal) {
      this.priorityTotal = p1Count;
    }

    items.forEach(item => {
      // Stage 1: Network Warmup (Bypass queue logic)
      if (!this.cache.has(item.url)) {
        // High priority for the first few cards to hit browser cache ASAP
        const fetchPriority = item.priority === 1 ? 'high' : 'low';
        fetch(item.url, { priority: fetchPriority } as any).catch(() => {});
      }
      
      // Stage 2: Queue for full processing (Decodes once loader is ready)
      this.requestTexture(item.id, item.url, item.priority || 2);
    });
  }

  /**
   * Initialize GPU loaders with renderer context
   */
  public init(gl: WebGLRenderer) {
    if (this.ktx2Loader) return;
    this.maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('/basis/');
    this.ktx2Loader.detectSupport(gl);
    this.resolveInit();
  }

  public getDummyTexture(): Texture {
    return this.dummyTexture;
  }

  public setPriorityCount(count: number, onReady: () => void) {
    this.priorityTotal = count;
    this.onPriorityReady = onReady;
    if (this.priorityLoaded >= this.priorityTotal) {
      onReady();
      this.onPriorityReady = null;
    }
  }

  /**
   * Decodes a ThumbHash base64 string into a high-fidelity blurred DataTexture instantly.
   */
  public getThumbTexture(id: string, hash?: string): Texture {
    if (!hash) return this.dummyTexture;
    if (this.thumbCache.has(id)) return this.thumbCache.get(id)!;

    try {
      const binary = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
      const { w, h, rgba } = thumbhash.thumbHashToRGBA(binary);
      
      const texture = new DataTexture(rgba, w, h, RGBAFormat, UnsignedByteType);
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.flipY = true; // ThumbHash is top-left, WebGL is bottom-left
      texture.needsUpdate = true;

      this.thumbCache.set(id, texture);
      return texture;
    } catch (err) {
      console.warn(`[TextureManager] ThumbHash decoding failed for ${id}:`, err);
      return this.dummyTexture;
    }
  }

  /**
   * Request a texture with specific priority.
   * Priority 1 (High): Fetched immediately.
   * Priority 2 (Low): Added to idle queue.
   */
  public requestTexture(id: string, url: string, priority: 1 | 2 = 2): Texture {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    if (priority === 1) {
      // If it was in the idle queue, remove it so we don't process it twice
      this.queue = this.queue.filter(u => u !== url);
      this.loadTexture(id, url, true);
    } else {
      if (!this.queue.includes(url) && !this.cache.has(url) && !this.loading.has(url)) {
        this.queue.push(url);
        this.processQueue();
      }
    }

    return this.dummyTexture;
  }

  public subscribe(url: string, callback: (tex: Texture) => void) {
    if (this.cache.has(url)) {
      callback(this.cache.get(url)!);
      return;
    }
    const subs = this.subscribers.get(url) || [];
    subs.push(callback);
    this.subscribers.set(url, subs);
  }

  public unsubscribe(url: string, callback: (tex: Texture) => void) {
    const subs = this.subscribers.get(url) || [];
    this.subscribers.set(url, subs.filter(s => s !== callback));
  }

  private async loadTexture(id: string, url: string, isPriority = false) {
    if (this.cache.has(url) || this.loading.has(url)) return;
    this.loading.add(url);

    try {
      let texture: Texture;
      const isKTX2 = url.endsWith('.ktx2');

      if (isKTX2) {
        // Always wait for the renderer to be ready before KTX2 loading
        await this.initPromise;
        if (this.ktx2Loader) {
          texture = await this.ktx2Loader.loadAsync(url);
          // SOTA: Hardware Mipmapping via pre-baked container data
          texture.generateMipmaps = false;
          texture.minFilter = LinearMipmapLinearFilter;
          texture.magFilter = LinearFilter;
        } else {
          throw new Error('KTX2Loader not initialized');
        }
      } else {
        const loader = new ImageBitmapLoader();
        loader.setOptions({ imageOrientation: 'flipY' });
        const imageBitmap = await loader.loadAsync(url);
        texture = new Texture(imageBitmap);
        texture.generateMipmaps = true;
        texture.minFilter = LinearMipmapLinearFilter;
        texture.magFilter = LinearFilter;
      }

      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = this.maxAnisotropy;
      texture.needsUpdate = true;

      this.cache.set(url, texture);

      const subs = this.subscribers.get(url);
      if (subs) {
        subs.forEach(cb => cb(texture));
        this.subscribers.delete(url);
      }
    } catch (err) {
      console.warn(`[TextureManager] Failed to load ${url}:`, err);
    } finally {
      this.loading.delete(url);
      if (isPriority) {
        this.priorityLoaded++;
        if (this.priorityLoaded >= this.priorityTotal && this.onPriorityReady) {
          this.onPriorityReady();
          this.onPriorityReady = null;
        }
      }
    }
  }

  private processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const schedule = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1));
    
    schedule(async () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // SOTA Prioritization: Wait for "Tier 1" critical items to finish
      // before starting the background trickle. This ensures zero-jank entrance.
      while (this.priorityTotal > 0 && this.priorityLoaded < this.priorityTotal) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      while (this.queue.length > 0) {
        const url = this.queue.shift();
        if (url && !this.cache.has(url)) {
          await this.loadTexture('idle', url, false);
          
          // Yield to main thread and allow other tasks to breathe
          // 60ms is a sweet spot for "idle" background activity
          await new Promise(resolve => setTimeout(resolve, isMobile ? 120 : 60));
        }
      }
      
      this.isProcessing = false;
      
      // Safety check: if more items were added during processing, restart
      if (this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  public dispose() {
    this.abortController.abort();
    this.cache.forEach(tex => tex.dispose());
    this.cache.clear();
    this.thumbCache.forEach(tex => tex.dispose());
    this.thumbCache.clear();
    this.subscribers.clear();
    this.queue = [];
    this.isProcessing = false;
    this.dummyTexture.dispose();
  }
}

export const textureManager = new TextureManager();
