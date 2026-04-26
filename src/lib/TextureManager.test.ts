import { describe, it, expect } from 'vitest'
import { textureManager } from './TextureManager'

describe('TextureManager', () => {
  it('should be defined', () => {
    expect(textureManager).toBeDefined()
  })

  it('should have a preload method', () => {
    expect(typeof textureManager.preload).toBe('function')
  })
})
