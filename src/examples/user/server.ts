import So from '../../so';

const app = new So();

interface UserInfo {
  uid: string;
  username: string;
}

const $user = app
  .Action('user')
  .Description('User module')
  .Argument({
    token: 'string',
    username: 'string'
  })
  .Dispatch(function(root: any, payload: any) {
    function tokenParser(token: string): UserInfo {
      return {
        uid: '1111-1111-1111',
        username: 'axetroy'
      };
    }
    return tokenParser(root.token);
  });

$user
  .SubAction('updateUsername')
  .Description('Update username')
  .Argument({
    uid: 'string',
    username: 'string'
  })
  .Dispatch(function(parent: any, payload: any) {
    parent.username = payload.username;
    return parent;
  });

app.Listen(8091);
