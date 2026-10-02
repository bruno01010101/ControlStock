import { Provider } from 'react-redux';
import { store } from './store';
import Auth from './pages/auth';
import Entrada from './pages/entrada';
import Itens from './pages/itens';
import Pedidos from './pages/pedidos';
import Saidas from './pages/saida';
import Main from './components/Main';
import { BrowserRouter as Router, Routes, Route } from 'react-router';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Main />}>
            <Route path="auth" element={<Auth />} />
            <Route path="entrada" element={<Entrada />} />
            <Route path="itens" element={<Itens />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="saidas" element={<Saidas />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
