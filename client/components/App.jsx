import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';


import Home from './Home';
import History from './History';
import notFound from './404';
import Admin from './Admin';
import Login from './auth/Login';
import SignUp from './auth/SignUp';
import Library from './Library';
import BookDetail from './Library/BookDetail';
import Dashboard from './Dashboard';
import Logout from './auth/Logout';
import Password from './auth/Password';
import UpdateProfile from './Dashboard/UpdateProfile';


/**
 * @public
 * @class App
 * @description React Component encapsulating application user interface
 * @extends {Component}
 */
class App extends Component {
  /**
   * renders app to DOM
   *
   * @returns {JSX} JSX representation of component
   * @memberof App
   */
  render() {
    return (
      <BrowserRouter>
        <div className='App'>
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/dashboard' component={Dashboard} />
            <Route path='/update-profile'component={UpdateProfile} />
            <Route path='/login' component={Login} />
            <Route path='/logout' component={Logout} />
            <Route path='/signup' component={SignUp} />
            <Route path='/library/book/:id' component={BookDetail} />
            <Route path='/library' exact component={Library} />
            <Route path='/history' component={History} />
            <Route path='/admin/edit:id' component={Admin} />
            <Route path='/admin/add' component={Admin} />
            <Route path='/admin' component={Admin} />
            <Route path='/forgot-password' component={Password} />
            <Route path='/reset-password' component={Password} />
            <Route component={notFound} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
