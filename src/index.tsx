import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import TreeMenu from './components/TreeComponent';
import { Provider } from 'react-redux';
import store from './store';
import DataLoader from './components/DataLoader';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles.css';



const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
); 
const App: React.FC = () => {
    return (
        <Provider store={store}>
            <DataLoader />
            <h1>ABRA Test!</h1>
            <Router>
                <Routes>
                    <Route path="/" element={<TreeMenu />} />
                    <Route path="/psc/*" element={<TreeMenu />} />
                </Routes>
            </Router>

        </Provider>
    )
};
root.render(<App />);
