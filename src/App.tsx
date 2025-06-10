import { ThemeProvider } from './lib/ThemeContext';
import DrawingCanvas from './components/DrawingCanvas';

function App() {
  return (
    <ThemeProvider>
      <DrawingCanvas />
    </ThemeProvider>
  );
}

export default App;