import { Provider } from 'react-redux';
import { store } from './store';
import Auth from './pages/auth';
import Itens from './pages/itens';
import Pedidos from './pages/pedidos';
import Main from './components/Main';
import Dashboard from './pages/dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import Unidade from './pages/forms/unidade';
import AdicionarItem from './pages/forms/adicionarItem';
import Saida from './pages/forms/saida';
import EntradaForm from './pages/forms/entrada';

function App() {

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Main />}>
              <Route path="auth" element={<Auth />} />
              <Route path="entradas" element={<EntradaForm />} />
              <Route path="itens" element={<Itens />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="saidas" element={<Saida />} />
              <Route path="" element={<Dashboard />} />
              <Route path='form' element={<Auth type="form" />} />
            </Route>
            <Route path='/form'>
              <Route path='unidade' element={<Unidade />} />
              <Route path='adicionarItem' element={<AdicionarItem />} />
              <Route path='entrada/:id' element={<EntradaForm />} />
              <Route path='saida/:id' element={<Saida />} />
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
