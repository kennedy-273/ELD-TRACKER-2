import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import TripFormComponent from './components/TripFormComponent';
import SavedTrips from './SavedTrips';


function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/trip-form" element={<TripFormComponent />} />
          <Route path="/saved-trips" element={<SavedTrips />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;