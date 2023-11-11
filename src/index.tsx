import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';



const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  const App:React.FC = () => {
    return <h1>Hello React with Webpack and Bootstrap!</h1>;
  };
root.render(<App />);
