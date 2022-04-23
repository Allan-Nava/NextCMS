/*
 * File: page.ts
 * Project: next-cms
 * File Created: Monday, 18th April 2022 10:55:41 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 23rd April 2022 3:22:10 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

export interface PageComponent {
  name: string,
  path: string,
  props?: any,
  components?: PageComponent[]
  supportNestedComponent: boolean
}
//