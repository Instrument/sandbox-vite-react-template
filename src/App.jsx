import { BrowserRouter, Routes, Route } from "react-router-dom";
import SnakeGame from "./views/SnakeGame";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/snake" element={<SnakeGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
