import React from "react";

const NoComponent: React.FC<{path: string}> = ({path}) => {
  return <div className="p-3">Nessun Componente trovato alla path {path}</div>
}

export default NoComponent