declare module "next/types.js" {
  export type Metadata = import("next/dist/lib/metadata/types/metadata-interface").Metadata;
  export type ResolvingMetadata = import("next/dist/lib/metadata/types/metadata-interface").ResolvingMetadata;
  export type ResolvingViewport = import("next/dist/lib/metadata/types/metadata-interface").ResolvingViewport;
}

declare module "next" {
  export type Metadata = import("next/dist/lib/metadata/types/metadata-interface").Metadata;
  export type NextConfig = import("next/dist/server/config").NextConfig;
}

import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}