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
  private isProcessing = false;
  private abortController: AbortController = new AbortController();
  private ktx2Loader: KTX2Loader | null = null;
  
  // High-priority (Tier 1) tracking
  private priorityTotal = 0;
  private priorityLoaded = 0;
  private onPriorityReady: (() => void) | null = null;

  constructor() {
    const data = new Uint8Array([5, 3, 10, 255]);
    this.dummyTexture = new DataTexture(data, 1, 1, RGBAFormat, UnsignedByteType);
    this.dummyTexture.needsUpdate = true;
  }

  /**
   * Initialize GPU loaders with renderer context
   */
  public init(gl: WebGLRenderer) {
    if (this.ktx2Loader) return;
    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('/basis/');
    this.ktx2Loader.detectSupport(gl);
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
      this.loadTexture(id, url, true);
    } else {
      if (!this.queue.includes(url)) {
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
    if (this.cache.has(url)) return;

    try {
      let texture: Texture;
      const isKTX2 = url.endsWith('.ktx2');

      if (isKTX2 && this.ktx2Loader) {
        texture = await this.ktx2Loader.loadAsync(url);
        // SOTA: Hardware Mipmapping via pre-baked container data
        texture.generateMipmaps = false;
        texture.minFilter = LinearMipmapLinearFilter;
        texture.magFilter = LinearFilter;
      } else {
        const loader = new ImageBitmapLoader();
        loader.setOptions({ imageOrientation: 'flipY' });
        const imageBitmap = await loader.loadAsync(url);
        texture = new Texture(imageBitmap);
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
      }

      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;

      this.cache.set(url, texture);

      if (isPriority) {
        this.priorityLoaded++;
        if (this.priorityLoaded >= this.priorityTotal && this.onPriorityReady) {
          this.onPriorityReady();
          this.onPriorityReady = null;
        }
      }
      
      const subs = this.subscribers.get(url);
      if (subs) {
        subs.forEach(cb => cb(texture));
        this.subscribers.delete(url);
      }
    } catch (err) {
      console.warn(`[TextureManager] Failed to load ${url}:`, err);
    }
  }

  private processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    // Use requestIdleCallback to avoid blocking the main thread
    const schedule = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1));
    
    schedule(async () => {
      while (this.queue.length > 0) {
        const url = this.queue.shift();
        if (url) await this.loadTexture('idle', url, false);
        
        // Yield every 2 textures to keep main thread fluid
        if (this.queue.length > 0 && Math.random() > 0.5) break;
      }
      this.isProcessing = false;
      if (this.queue.length > 0) this.processQueue();
    });
  }

  public dispose() {
    this.abortController.abort();
    this.cache.forEach(tex => tex.dispose());
    this.cache.clear();
    this.subscribers.clear();
    this.queue = [];
    this.isProcessing = false;
    this.dummyTexture.dispose();
  }
}

export const textureManager = new TextureManager();
