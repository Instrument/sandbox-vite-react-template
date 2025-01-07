import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import SnakeGame from "./views/SnakeGame";
import Spirograph from "./views/Spirograph";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/snake" element={<SnakeGame />} />
        <Route path="/spirograph" element={<Spirograph />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
