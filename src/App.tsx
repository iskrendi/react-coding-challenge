import './App.css';
import USGSMap from "./USGSMap";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Map of <code>USGS Earthquakes</code>
        </p>
      </header>
      <USGSMap />
    </div>
  );
}

export default App;
