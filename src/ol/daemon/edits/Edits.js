import Edit from './Edit';

/**
 * @classdesc
 *
 * Class for managing edits - with options for undo/redo operations
 */
export default class Edits {
  /**
   * Creates an Edits
   */
  constructor() {
    /**
     * list of edits
     * @private
     * @type {Array<Array<Edit>>}
     */
    this._edits = [];
    /**
     * current edit index: default is `-1`
     * @private
     * @type {Number}
     */
    this._editIndex = -1;
  }

  /**
   * Current undo/redo index. When we navigate through the edits using {@link Edits.undo}
   * and {@link Edits.redo} this value is changed. Only edits with
   * `index >` {@link Edits.editIndex} are processed!
   * @type {Number}
   */
  get editIndex() {
    return this._editIndex;
  }
  /**
   * Get all edits. Does not stop at current undo/redo index ({@link Edits.editIndex})!
   * @type {Array<Array<Edit>>}
   */
  get edits() {
    return this._edits;
  }

  // edits: 0 1 2
  // index:   x
  //  undo: true
  //  redo: true

  // edits: 0 1 2
  // index: x
  //  undo: true
  //  redo: true

  // edits:   0 1 2
  // index: x
  //  undo: false
  //  redo: true

  // edits: 0 1 2
  // index:     x
  //  undo: true
  //  redo: false

  // edits: 0 1 2
  // index:       x
  //  undo: false
  //  redo: false
  get canUndo() {
    return this._editIndex > -1;
  }
  get canRedo() {
    return this._editIndex < this._edits.length - 1;
  }

  /**
   * add new edit operation to the list - {@link Edits._edits}
   * @param {Edit|Array<Edit>} edit - new edit operation
   */
  add(edit) {
    this._editIndex++;

    /**
     * @type {Array<Edit>}
     */
    const newEdit = Array.isArray(edit) ? edit : [edit];

    // // insert a new edit in edits array: when the user undo some edits
    // // and then make new ones
    this._edits.splice(this._editIndex, 0, newEdit);

    // trim all edits after this one: when the user undo some edits
    // and then make new ones
    this._edits.length = this._editIndex + 1;
  }
  /**
   * undo the edit operation with index `editIndex`
   * @return {Array<Edit>|undefined}
   */
  undo() {
    let edit = undefined;

    if (this.canUndo) {
      edit = this._edits[this._editIndex];
      this._editIndex--;
    }

    return edit;
  }
  /**
   * redo the edit operation with index {@link Edits.editIndex}
   * @return {Array<Edit>|undefined}
   */
  redo() {
    let edit = undefined;

    if (this.canRedo) {
      this._editIndex++;
      edit = this._edits[this._editIndex];
    }

    return edit;
  }
  /**
   * Processes all edits up to the current undo/redo index ({@link Edits.editIndex})
   * @return {Promise<Object>}
   */
  process() {
    debugger;
    // const editsToProcess = this._edits.slice(0, this._editIndex + 1).flat();
    // const fids = editsToProcess.map(item => item.fid);
    // const uniqueEdits = editsToProcess.unique('fid');
    // uniqueEdits.forEach(uniqueEdit => {
    //   let edit = editsToProcess[fids.lastIndexOf(uniqueEdit.fid)];
    //   console.log(`${edit.fid}: ${edit.editType}`);
    // });

    return new Promise((yes, no) => {
      // ajax.post(edits)
      yes(this._edits);
    });
  }
}
