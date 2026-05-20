import { useEffect } from 'react';

function App() {
  useEffect(() => {
    fetch('https://spelltable-backend.onrender.com/scenarios')
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error('Error', err));
  }, []);

  return <div>Testing connection...</div>;
}

export default App
