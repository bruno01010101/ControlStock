import { Provider } from 'react-redux';
import { store } from './store';
import Auth from './pages/auth';
import Entrada from './pages/entrada';
import Itens from './pages/itens';
import Pedidos from './pages/pedidos';
import Saidas from './pages/saida';
import Main from './components/Main';
import Dashboard from './pages/dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Main />}>
              <Route path="auth" element={<Auth />} />
              <Route path="entradas" element={<Entrada />} />
              <Route path="itens" element={<Itens />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="saidas" element={<Saidas />} />
              <Route path="dashboard" element={<Dashboard />} />
            </Route>
          </Route>
          <Route path='/auth/'  >
            <Route path='login' element={<Auth type="login" />} />
            <Route path='cadastro' element={<Auth type="cadastro" />} />
          </Route>
        </Routes>
      </Router>

    </Provider>
  )
}

export default App
