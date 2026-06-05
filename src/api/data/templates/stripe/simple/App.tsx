// @ts-nocheck
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CheckoutPage from "./pages/CheckoutPage";
import Success from "./pages/Success";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
