/// <reference types="vite/client" />
/// <reference types="vite-imagetools" />

declare module '*&as=url' {
  const value: string;
  export default value;
}

declare module '*&as=srcset' {
  const value: string;
  export default value;
}
