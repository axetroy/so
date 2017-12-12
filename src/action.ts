type Reducer$ = (parent: string, payload: any) => void;

const DEFAULT_REDUCER: Reducer$ = function(parent, payload) {
  if (this.isRoot) {
    return payload;
  } else {
    return parent;
  }
};

export default class Action {
  public description: string;
  public argument: any;
  public reducer: Reducer$ = DEFAULT_REDUCER;
  public child = {};
  public isRoot: boolean;

  constructor(public parent, public name: string) {
    this.isRoot = parent instanceof Action === false;

    // set the action to the root
    if (typeof this.parent.child === 'object') {
      this.parent.child[name] = this;
    } else {
      this.parent[name] = this;
    }
  }
  SubAction(subName: string) {
    return new Action(this, subName);
  }
  Description(desc: string) {
    this.description = desc;
    return this;
  }
  Argument(type: any) {
    this.argument = type;
    return this;
  }
  Dispatch(reducer: Reducer$) {
    this.reducer = reducer;
    return this;
  }
}
