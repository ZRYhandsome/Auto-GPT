// 撤销和重做：每次改动前存一份会议快照（JSON 字符串），最多留 100 步。
export class History {
  constructor(limit = 100) {
    this.limit = limit;
    this.past = [];
    this.future = [];
  }

  /** 改动之前调用，传入改动前的状态。 */
  record(state) {
    const snap = JSON.stringify(state);
    if (this.past[this.past.length - 1] === snap) return;
    this.past.push(snap);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }

  undo(current) {
    if (!this.past.length) return null;
    this.future.push(JSON.stringify(current));
    return JSON.parse(this.past.pop());
  }

  redo(current) {
    if (!this.future.length) return null;
    this.past.push(JSON.stringify(current));
    return JSON.parse(this.future.pop());
  }

  get canUndo() { return this.past.length > 0; }

  get canRedo() { return this.future.length > 0; }

  clear() {
    this.past = [];
    this.future = [];
  }
}
