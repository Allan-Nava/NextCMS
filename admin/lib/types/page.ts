export interface PageComponent {
  name: string,
  path: string,
  props?: any,
  components?: PageComponent[]
  supportNestedComponent: boolean
}