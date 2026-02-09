import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-content">
        <Login />
      </main>
      <Footer />
    </div>
  )
}

export default App
