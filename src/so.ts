import { struct } from 'superstruct';

import Action from './action';
import * as WebSocket from 'ws';

interface Model$ {
  id: string;
  action: string;
  payload: any;
}

class Response {
  public id: string;
  public action: string;
  public payload: any;
  public error: { message: string; code: number } | null;
  constructor() {
    this.id = '';
    this.error = null;
    this.payload = null;
  }
  toString(): string {
    return JSON.stringify({
      id: this.id,
      action: this.action,
      payload: this.payload,
      timestamp: parseInt(new Date().getTime() + ''),
      error: this.error
    });
  }
}

export default class So {
  private actionTree = {};
  constructor() {}

  /**
   * define an action
   * @param name
   * @returns {Action}
   * @constructor
   */
  Action(name: string): Action {
    return new Action(this.actionTree, name);
  }

  /**
   * Find the action this
   * @param actionStrList
   * @param actionTree
   * @returns {Array}
   * @constructor
   */
  Find(actionStrList: string[] = [], actionTree = this.actionTree): Action[] {
    let result: Action[] = [];
    for (let i = 0; i < actionStrList.length; i++) {
      const actionName: string = actionStrList[i];
      const action: Action = actionTree[actionName];
      if (action) {
        result.push(action);
        actionTree = action.child;
      } else {
        return [];
      }
    }
    return result;
  }

  /**
   * Generate document
   * @returns {{}}
   * @constructor
   */
  Document() {
    const doc = {};
    for (const actionName in this.actionTree) {
      if (this.actionTree.hasOwnProperty(actionName)) {
        const action = this.actionTree[actionName];
        doc[actionName] = action.description;
      }
    }
    return doc;
  }

  /**
   * resolve handler
   * @param {string[]} actionList
   * @param payload
   * @returns {Promise<any>}
   * @constructor
   */
  async Resolve(actionList: string[], payload: any) {
    let parentResult = null;
    const actions = this.Find(actionList); // get action list

    if (!actions.length) {
      throw new Error(`Not found the action of ${actionList.join('.')}`);
    }

    let i = 0;

    while (actions.length) {
      const action: Action = <Action>actions.shift();

      if (action instanceof Action === false) continue;

      const value =
        i === 0
          ? // 如果是对象，则做一次浅拷贝
            // 如果是字面量，则按值传递
            typeof payload === 'object' ? Object.assign({}, payload) : payload
          : parentResult;

      if (typeof action.argument) {
        const model = struct(action.argument);
        // if validator fail, it will throw an error
        model(value);
      }

      parentResult = await action.reducer.call(this, value, payload);
      i++;
    }

    return parentResult;
  }

  /**
   * bootstrap the server
   * @param port
   * @returns {*}
   * @constructor
   */
  Listen(port) {
    const self = this;

    const wss = new WebSocket.Server({ port });

    console.log(`Listen on port ws://localhost:${port}`);

    wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        const raw: string = message.toString();
        const res = new Response();
        try {
          const m: Model$ = JSON.parse(raw);
          const action: string = m.action;
          const payload: any = m.payload;

          if (!action) {
            return;
          }

          res.id = m.id || '';
          res.action = action || '';

          self
            .Resolve(action.split('.'), payload)
            .then(data => {
              res.payload = data;
              ws.send(res.toString());
            })
            .catch(err => {
              res.error = {
                message: <string>err.message,
                code: 0
              };
              ws.send(res.toString());
            });
        } catch (err) {
          res.id = '';
          res.action = '';
          res.error = {
            message: err.message,
            code: 1
          };
          ws.send(res.toString());
        }
      });
    });

    return wss;
  }
}
