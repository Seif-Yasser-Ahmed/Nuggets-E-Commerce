import './App.css';
import axios from 'axios';
function App() {
  const apiCall = () => {
    axios.get('http://localhost:5000').then((data) => {
      console.log(data['data']);
    })
  }
  return (
    <div className="App">
      <header className="App-header">

        <button onClick={apiCall}>Make API Call</button>
      </header>
    </div>
  );
}

export default App;
