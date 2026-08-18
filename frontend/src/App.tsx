import { Route, Routes } from 'react-router-dom';
import { ClientLayout } from '@/components/layout/ClientLayout';
import RequireAuth from '@/components/RequireAuth';
import Home from '@/pages/Home';
import Productos from '@/pages/productos/Productos';
import ProductoDetalle from '@/pages/productos/ProductoDetalle';
import Carrito from '@/pages/carrito/Carrito';
import Checkout from '@/pages/carrito/Checkout';
import Pedidos from '@/pages/pedidos/Pedidos';
import PedidoInstrucciones from '@/pages/pedidos/PedidoInstrucciones';
import SobreNosotros from '@/pages/sobre-nosotros/SobreNosotros';
import Notificaciones from '@/pages/notificaciones/Notificaciones';
import NotFound from '@/pages/NotFound';
import AdminLogin from '@/pages/admin/login/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCuenta from '@/pages/admin/cuenta/AdminCuenta';
import AdminNotificaciones from '@/pages/admin/notificaciones/AdminNotificaciones';
import AdminProductos from '@/pages/admin/productos/AdminProductos';
import AdminEditarProducto from '@/pages/admin/productos/AdminEditarProducto';
import AdminPedidos from '@/pages/admin/pedidos/AdminPedidos';
import AdminPedidoDetalle from '@/pages/admin/pedidos/AdminPedidoDetalle';
import AdminConfiguracion from '@/pages/admin/configuracion/AdminConfiguracion';
import AdminAdministradores from '@/pages/admin/administradores/AdminAdministradores';

export function App() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route index element={<Home />} />
        <Route path="productos" element={<Productos />} />
        <Route path="productos/:id" element={<ProductoDetalle />} />
        <Route path="carrito" element={<Carrito />} />
        <Route path="carrito/checkout" element={<Checkout />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="pedidos/:id" element={<PedidoInstrucciones />} />
        <Route path="sobre-nosotros" element={<SobreNosotros />} />
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<RequireAuth />}>
          <Route index element={<AdminDashboard />} />
          <Route path="cuenta" element={<AdminCuenta />} />
          <Route path="notificaciones" element={<AdminNotificaciones />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/:id/editar" element={<AdminEditarProducto />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="pedidos/:id" element={<AdminPedidoDetalle />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
          <Route path="administradores" element={<AdminAdministradores />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
