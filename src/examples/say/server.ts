import So from '../../so';

const app = new So();

const $sayAction = app
  .Action('say')
  .Description('Say something to the user')
  .Argument('string')
  .Dispatch(function(root: any, payload: any) {
    return root;
  });

$sayAction
  .SubAction('hello')
  .Description('Say hello')
  .Argument('string')
  .Dispatch(function(parent: any, payload: any) {
    return `hello ` + parent;
  });

$sayAction
  .SubAction('hi')
  .Description('Say hi')
  .Argument('string')
  .Dispatch(function(parent: any, payload: any) {
    return `hi ` + parent;
  });

app.Listen(8090);
