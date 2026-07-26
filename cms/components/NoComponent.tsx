/*
 * File: NoComponent.tsx
 * Project: next-cms
 * File Created: Tuesday, 19th April 2022 10:56:57 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 20th April 2022 7:26:50 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import React from "react";
//
// Fallback rendered when a page references a component that is not in the
// registry (see components/registry.ts).
const NoComponent: React.FC<{path: string}> = ({path}) => {
  return <div className="p-3">No component registered for path {path}</div>
}

export default NoComponent;