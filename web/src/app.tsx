import './app.less'

import React from 'react'
import { MemoryRouter, Route } from 'react-router'

import { PageTodoList } from './pages'

export const App = () => {
  return (
    <div className="app">
      <MemoryRouter>
        <Route exact path="/" component={() => <PageTodoList />} />
      </MemoryRouter>
    </div>
  )
}
