/*
 * File: Features.tsx
 * Project: next-cms
 * File Created: Monday, 18th April 2022 10:55:41 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 20th April 2022 7:26:29 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import React from 'react'

const Features: React.FC = () => {
  return <div className="row py-4">
    <div className="feature col-4">
      <div className="feature-icon bg-primary bg-gradient">
      </div>
      <h2>Featured title</h2>
      <p>Paragraph of text beneath the heading to explain the heading. We'll add onto it with another sentence and probably just keep going until we run out of words.</p>
      <a className="icon-link">
        Call to action
      </a>
    </div>
    <div className="feature col-4">
      <div className="feature-icon bg-primary bg-gradient">
      </div>
      <h2>Featured title</h2>
      <p>Paragraph of text beneath the heading to explain the heading. We'll add onto it with another sentence and probably just keep going until we run out of words.</p>
      <a className="icon-link">
        Call to action
      </a>
    </div>
    <div className="feature col-4">
      <div className="feature-icon bg-primary bg-gradient">
      </div>
      <h2>Featured title</h2>
      <p>Paragraph of text beneath the heading to explain the heading. We'll add onto it with another sentence and probably just keep going until we run out of words.</p>
      <a className="icon-link">
        Call to action
      </a>
    </div>
  </div>
}

export default Features