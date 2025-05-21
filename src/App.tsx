import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import MapChart from "./components/MapChart";
import CountryPage from "./components/CountryPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapChart />} />
        <Route path="/country/:country" element={<CountryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
